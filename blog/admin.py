import json
import logging

from django import forms
from django.contrib import admin, messages
from django.core.exceptions import PermissionDenied
from django.http import JsonResponse
from django.urls import path, reverse
from django.utils.safestring import mark_safe

from .ai_services import AIGenerationError, AIGeneratedPost, generate_post_with_ai
from .models import AdSenseSettings, Category, Comment, Post

logger = logging.getLogger(__name__)


class PostAdminForm(forms.ModelForm):
    GENERATION_MODE_MANUAL = "manual"
    GENERATION_MODE_AI = "ai"

    AI_TONE_CHOICES = (
        ("academic", "Academic"),
        ("friendly", "Friendly"),
        ("expert", "Expert"),
    )

    generation_mode = forms.ChoiceField(
        choices=(
            (GENERATION_MODE_MANUAL, "Manual"),
            (GENERATION_MODE_AI, "AI"),
        ),
        widget=forms.RadioSelect,
        initial=GENERATION_MODE_MANUAL,
        required=True,
        help_text="Manual: write fields yourself. AI: provide topic and generate content.",
    )

    ai_topic = forms.CharField(
        required=False,
        max_length=255,
        help_text="Required for AI generation.",
    )

    ai_keywords = forms.CharField(
        required=False,
        max_length=255,
        help_text="Optional comma-separated keywords.",
    )

    ai_tone = forms.ChoiceField(
        required=False,
        choices=(("", "Default (Expert)"),) + AI_TONE_CHOICES,
        help_text="Optional tone.",
    )

    class Meta:
        model = Post
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Manual requirements are enforced in clean() so AI mode can skip these.
        self.fields["title"].required = False
        self.fields["content"].required = False
        self._ai_generated_post: AIGeneratedPost | None = None

    def clean(self):
        cleaned_data = super().clean()

        mode = cleaned_data.get("generation_mode") or self.GENERATION_MODE_MANUAL
        ai_topic = (cleaned_data.get("ai_topic") or "").strip()

        title = (cleaned_data.get("title") or "").strip()
        content = (cleaned_data.get("content") or "").strip()
        has_manual_payload = bool(title and content)

        # UX fallback: if user entered only AI topic, treat as AI mode.
        if mode == self.GENERATION_MODE_MANUAL and ai_topic and not has_manual_payload:
            mode = self.GENERATION_MODE_AI
            cleaned_data["generation_mode"] = mode

        if mode == self.GENERATION_MODE_MANUAL:
            if not title:
                self.add_error("title", "Title is required in manual mode.")
            if not content:
                self.add_error("content", "Content is required in manual mode.")
            return cleaned_data

        # AI mode: if already filled (generated via button or edited), no second API call.
        if has_manual_payload:
            return cleaned_data

        if not ai_topic:
            self.add_error("ai_topic", "AI topic is required in AI mode.")
            return cleaned_data

        if self.errors:
            return cleaned_data

        try:
            self._ai_generated_post = generate_post_with_ai(
                topic=ai_topic,
                keywords=(cleaned_data.get("ai_keywords") or "").strip() or None,
                tone=(cleaned_data.get("ai_tone") or "").strip() or None,
            )
        except AIGenerationError as exc:
            self.add_error(None, str(exc))

        return cleaned_data

    def save(self, commit=True):
        instance: Post = super().save(commit=False)

        if self.cleaned_data.get("generation_mode") == self.GENERATION_MODE_AI:
            if self._ai_generated_post:
                generated = self._ai_generated_post
                instance.title = generated.title
                instance.content = generated.content
                instance.seo_title = generated.seo_title
                instance.seo_description = generated.seo_description
                instance.seo_keywords = generated.seo_keywords

            # AI mode should not auto-set image.
            instance.featured_image = None

        if commit:
            instance.save()
            self.save_m2m()

        return instance


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    form = PostAdminForm

    list_display = (
        "title",
        "category",
        "author",
        "is_indexable",
        "created_at",
    )

    list_filter = ("category", "is_indexable", "created_at")
    search_fields = ("title", "seo_title", "seo_description")

    prepopulated_fields = {
        "slug": ("title",),
    }

    fieldsets = (
        (
            "Generation Mode",
            {
                "fields": (
                    "generation_mode",
                    "ai_topic",
                    "ai_keywords",
                    "ai_tone",
                    "ai_generate_action",
                )
            },
        ),
        ("Asosiy", {"fields": ("title", "slug", "category", "author")}),
        ("Kontent", {"fields": ("content", "featured_image")}),
        (
            "SEO (Google)",
            {
                "fields": (
                    "seo_title",
                    "seo_description",
                    "seo_keywords",
                    "canonical_url",
                    "is_indexable",
                )
            },
        ),
        ("Vaqt", {"fields": ("created_at", "updated_at")}),
    )

    readonly_fields = ("created_at", "updated_at", "ai_generate_action")

    def get_changeform_initial_data(self, request):
        initial = super().get_changeform_initial_data(request)
        initial.setdefault("generation_mode", PostAdminForm.GENERATION_MODE_MANUAL)
        return initial

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                "ai-generate/",
                self.admin_site.admin_view(self.ai_generate_view),
                name="blog_post_ai_generate",
            ),
        ]
        return custom_urls + urls

    def ai_generate_action(self, obj=None):
        generate_url = reverse("admin:blog_post_ai_generate")

        html = '''
<div style="display:flex; flex-direction:column; gap:8px; max-width:860px;">
  <button
    type="button"
    id="ai-generate-btn"
    class="button"
    data-url="__URL__"
    onclick="window.blogAdminAIGenerate && window.blogAdminAIGenerate(this); return false;"
  >
    Generate
  </button>
  <div id="ai-generate-status" style="padding:10px 12px; border:1px solid #d0d7de; border-radius:8px; background:#f8fafc; color:#1f2937; min-height:16px;">
    Enter topic and click Generate.
  </div>
</div>
<script>
(function () {
  if (window.blogAdminAIGenerate) return;

  function byId(id) {
    return document.getElementById(id);
  }

  function getCookie(name) {
    var parts = document.cookie ? document.cookie.split(';') : [];
    for (var i = 0; i < parts.length; i += 1) {
      var c = parts[i].trim();
      if (c.substring(0, name.length + 1) === name + '=') {
        return decodeURIComponent(c.substring(name.length + 1));
      }
    }
    return '';
  }

  function setStatus(level, lines) {
    var status = byId('ai-generate-status');
    if (!status) return;

    var palette = {
      pending: { bg: '#eff6ff', border: '#93c5fd', color: '#1e3a8a' },
      success: { bg: '#f0fdf4', border: '#86efac', color: '#166534' },
      error: { bg: '#fef2f2', border: '#fca5a5', color: '#991b1b' },
      neutral: { bg: '#f8fafc', border: '#d0d7de', color: '#1f2937' }
    };

    var style = palette[level] || palette.neutral;
    status.style.background = style.bg;
    status.style.borderColor = style.border;
    status.style.color = style.color;

    if (!Array.isArray(lines)) {
      lines = [String(lines || '')];
    }

    status.innerHTML = lines
      .filter(Boolean)
      .map(function (line) { return '<div style="margin:2px 0;">' + line + '</div>'; })
      .join('');
  }

  function setFieldValue(id, value) {
    var el = byId(id);
    if (!el) return;
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  window.blogAdminAIGenerate = async function (buttonEl) {
    if (!buttonEl || buttonEl.disabled) return;

    var topicEl = byId('id_ai_topic');
    var keywordsEl = byId('id_ai_keywords');
    var toneEl = byId('id_ai_tone');

    var topic = topicEl ? topicEl.value.trim() : '';
    var keywords = keywordsEl ? keywordsEl.value.trim() : '';
    var tone = toneEl ? toneEl.value.trim() : '';

    if (!topic) {
      setStatus('error', [
        'Validation failed: topic is required.',
        'Fix: enter a clear topic and retry.'
      ]);
      return;
    }

    var aiModeRadio = document.querySelector('input[name=\"generation_mode\"][value=\"ai\"]');
    if (aiModeRadio) {
      aiModeRadio.checked = true;
      aiModeRadio.dispatchEvent(new Event('change', { bubbles: true }));
    }

    var startedAt = Date.now();
    var originalText = buttonEl.textContent;
    buttonEl.disabled = true;
    buttonEl.textContent = 'Generating...';
    buttonEl.setAttribute('aria-busy', 'true');

    setStatus('pending', [
      'Validating input...',
      'Sending request to backend AI endpoint...'
    ]);

    var controller = new AbortController();
    var timeoutId = setTimeout(function () { controller.abort(); }, 180000);

    try {
      var response = await fetch(buttonEl.dataset.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
          topic: topic,
          keywords: keywords,
          tone: tone
        }),
        signal: controller.signal
      });

      setStatus('pending', [
        'Backend responded.',
        'Parsing AI output...'
      ]);

      var text = await response.text();
      var data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = {};
      }

      if (!response.ok) {
        var detail = data.error || 'Generation failed.';
        var hint = data.hint ? 'Hint: ' + data.hint : '';
        throw new Error('HTTP ' + response.status + ': ' + detail + (hint ? ' | ' + hint : ''));
      }

      setStatus('pending', [
        'AI content received.',
        'Applying generated values to form...'
      ]);

      setFieldValue('id_title', data.title || '');
      setFieldValue('id_content', data.content || '');
      setFieldValue('id_seo_title', data.seo_title || '');
      setFieldValue('id_seo_description', data.seo_description || '');
      setFieldValue('id_seo_keywords', data.seo_keywords || '');

      var seconds = ((Date.now() - startedAt) / 1000).toFixed(1);
      setStatus('success', [
        'Generation completed in ' + seconds + 's.',
        'Updated fields: title, content, SEO title, SEO description, SEO keywords.',
        'Next: review and click Save.'
      ]);
    } catch (error) {
      if (error && error.name === 'AbortError') {
        setStatus('error', [
          'Generation timed out after 180s.',
          'Fix: retry with shorter topic/keywords.'
        ]);
      } else {
        setStatus('error', [
          'Generation failed.',
          (error && error.message) ? error.message : 'Unknown error.'
        ]);
      }
    } finally {
      clearTimeout(timeoutId);
      buttonEl.disabled = false;
      buttonEl.textContent = originalText;
      buttonEl.setAttribute('aria-busy', 'false');
    }
  };
})();
</script>
'''
        return mark_safe(html.replace("__URL__", generate_url))

    ai_generate_action.short_description = "Generate Post"

    def ai_generate_view(self, request):
        if not (self.has_add_permission(request) or self.has_change_permission(request)):
            raise PermissionDenied("You do not have permission to generate AI content.")

        if request.method != "POST":
            return JsonResponse(
                {
                    "error": "Method not allowed.",
                    "hint": "Use POST for AI generation requests.",
                },
                status=405,
            )

        try:
            payload = json.loads(request.body.decode("utf-8"))
        except json.JSONDecodeError:
            return JsonResponse(
                {
                    "error": "Invalid JSON payload.",
                    "hint": "Send JSON with topic, optional keywords, optional tone.",
                },
                status=400,
            )

        topic = str(payload.get("topic") or "").strip()
        keywords = str(payload.get("keywords") or "").strip() or None
        tone = str(payload.get("tone") or "").strip() or None

        if not topic:
            return JsonResponse(
                {
                    "error": "AI topic is required.",
                    "hint": "Enter a clear topic before generating.",
                },
                status=400,
            )

        valid_tones = {choice[0] for choice in PostAdminForm.AI_TONE_CHOICES}
        if tone and tone not in valid_tones:
            return JsonResponse(
                {
                    "error": "Invalid AI tone.",
                    "hint": "Allowed tones: academic, friendly, expert.",
                },
                status=400,
            )

        try:
            generated = generate_post_with_ai(topic=topic, keywords=keywords, tone=tone)
        except AIGenerationError as exc:
            return JsonResponse(
                {
                    "error": str(exc),
                    "hint": "Refine topic/keywords and retry. Also verify OPENAI_API_KEY and model access.",
                },
                status=400,
            )
        except Exception:
            logger.exception("Unexpected error in admin AI generation endpoint.")
            return JsonResponse(
                {
                    "error": "Unexpected server error during AI generation.",
                    "hint": "Check backend logs and OpenAI/network configuration.",
                },
                status=500,
            )

        return JsonResponse(
            {
                "title": generated.title,
                "content": generated.content,
                "seo_title": generated.seo_title,
                "seo_description": generated.seo_description,
                "seo_keywords": generated.seo_keywords,
            },
            status=200,
        )

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        if form.cleaned_data.get("generation_mode") == PostAdminForm.GENERATION_MODE_AI:
            messages.info(
                request,
                "AI generation completed. Review content and publish when ready.",
            )


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    prepopulated_fields = {
        "slug": ("name",),
    }


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("author", "post", "created_at")
    search_fields = ("author", "text")
    list_filter = ("created_at",)


@admin.register(AdSenseSettings)
class AdSenseSettingsAdmin(admin.ModelAdmin):
    list_display = ("enabled", "publisher_id", "updated_at")

    fieldsets = (
        (
            "Publisher Configuration",
            {
                "fields": (
                    "publisher_id",
                    "enabled",
                )
            },
        ),
        (
            "Ad Unit IDs",
            {
                "fields": (
                    "homepage_ad_unit_id",
                    "post_sidebar_ad_unit_id",
                    "post_content_ad_unit_id",
                ),
                "description": "Configure ad unit IDs for different page locations",
            },
        ),
    )

    readonly_fields = ("created_at", "updated_at")

    def has_add_permission(self, request):
        # Prevent multiple instances - singleton pattern
        return not AdSenseSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        # Prevent deletion of settings
        return False
