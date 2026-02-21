# /media/gradientvvv/Linux/blog-app/blog/admin.py

import json

from django import forms
from django.contrib import admin, messages
from django.core.exceptions import PermissionDenied
from django.http import JsonResponse
from django.urls import path, reverse
from django.utils.html import format_html

from .ai_services import AIGenerationError, AIGeneratedPost, generate_post_with_ai
from .models import Post, Category, Comment, AdSenseSettings


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
        help_text="Choose Manual for default workflow or AI to auto-generate content.",
    )
    ai_topic = forms.CharField(
        required=False,
        max_length=255,
        help_text="Required only for AI mode.",
    )
    ai_keywords = forms.CharField(
        required=False,
        max_length=255,
        help_text="Optional keywords for AI generation prompt.",
    )
    ai_tone = forms.ChoiceField(
        required=False,
        choices=(("", "Default (Expert)"),) + AI_TONE_CHOICES,
        help_text="Optional writing tone for AI mode.",
    )

    class Meta:
        model = Post
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Keep manual requirements in clean(), not as global required attributes.
        self.fields["title"].required = False
        self.fields["content"].required = False
        self._ai_generated_post: AIGeneratedPost | None = None

    def clean(self):
        cleaned_data = super().clean()
        mode = cleaned_data.get("generation_mode", self.GENERATION_MODE_MANUAL)
        ai_topic = (cleaned_data.get("ai_topic") or "").strip()
        has_manual_payload = bool((cleaned_data.get("title") or "").strip() and (cleaned_data.get("content") or "").strip())

        if mode == self.GENERATION_MODE_MANUAL:
            if not (cleaned_data.get("title") or "").strip():
                self.add_error("title", "Title is required in manual mode.")
            if not (cleaned_data.get("content") or "").strip():
                self.add_error("content", "Content is required in manual mode.")
            return cleaned_data

        # AI mode with fields already filled (button-generated or manually edited).
        if has_manual_payload:
            return cleaned_data

        if not ai_topic:
            self.add_error("ai_topic", "AI topic is required in AI mode.")
            return cleaned_data

        # Avoid unnecessary API calls if unrelated field errors already exist.
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
        if self.cleaned_data.get("generation_mode") == self.GENERATION_MODE_AI and self._ai_generated_post:
            generated = self._ai_generated_post
            instance.title = generated.title
            instance.content = generated.content
            instance.seo_title = generated.seo_title
            instance.seo_description = generated.seo_description
            instance.seo_keywords = generated.seo_keywords
            instance.featured_image = None

        if commit:
            instance.save()
            self.save_m2m()
        return instance


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    form = PostAdminForm
    list_display = (
        'title',
        'category',
        'author',
        'is_indexable',
        'created_at'
    )

    list_filter = ('category', 'is_indexable', 'created_at')
    search_fields = ('title', 'seo_title', 'seo_description')

    prepopulated_fields = {
        'slug': ('title',)
    }

    fieldsets = (
        ('Generation Mode', {
            'fields': ('generation_mode', 'ai_topic', 'ai_keywords', 'ai_tone', 'ai_generate_action')
        }),
        ('Asosiy', {
            'fields': ('title', 'slug', 'category', 'author')
        }),
        ('Kontent', {
            'fields': ('content', 'featured_image')
        }),
        ('SEO (Google)', {
            'fields': (
                'seo_title',
                'seo_description',
                'seo_keywords',
                'canonical_url',
                'is_indexable'
            )
        }),
        ('Vaqt', {
            'fields': ('created_at', 'updated_at'),
        }),

    )

    readonly_fields = ('created_at', 'updated_at', 'ai_generate_action')

    class Media:
        css = {
            "all": ("blog/admin/post_mode_tabs.css",),
        }
        js = ("blog/admin/post_mode_tabs.js",)

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
        return format_html(
            '<button type="button" id="ai-generate-btn" class="button" data-url="{}">Generate</button>'
            '<span id="ai-generate-status" style="margin-left:8px;"></span>',
            generate_url,
        )

    ai_generate_action.short_description = "Generate Post"

    def ai_generate_view(self, request):
        if not (self.has_add_permission(request) or self.has_change_permission(request)):
            raise PermissionDenied("You do not have permission to generate AI content.")
        if request.method != "POST":
            return JsonResponse({"error": "Method not allowed."}, status=405)

        try:
            payload = json.loads(request.body.decode("utf-8"))
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON payload."}, status=400)

        topic = str(payload.get("topic") or "").strip()
        keywords = str(payload.get("keywords") or "").strip() or None
        tone = str(payload.get("tone") or "").strip() or None

        if not topic:
            return JsonResponse({"error": "AI topic is required."}, status=400)
        if tone and tone not in {choice[0] for choice in PostAdminForm.AI_TONE_CHOICES}:
            return JsonResponse({"error": "Invalid AI tone."}, status=400)

        try:
            generated = generate_post_with_ai(topic=topic, keywords=keywords, tone=tone)
        except AIGenerationError as exc:
            return JsonResponse({"error": str(exc)}, status=400)

        return JsonResponse(
            {
                "title": generated.title,
                "content": generated.content,
                "seo_title": generated.seo_title,
                "seo_description": generated.seo_description,
                "seo_keywords": generated.seo_keywords,
            }
        )

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        if form.cleaned_data.get("generation_mode") == PostAdminForm.GENERATION_MODE_AI:
            messages.info(request, "AI content generated successfully. You can edit the generated fields before publishing.")


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    prepopulated_fields = {
        'slug': ('name',)
    }

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('author', 'post', 'created_at')
    search_fields = ('author', 'text')
    list_filter = ('created_at',)


@admin.register(AdSenseSettings)
class AdSenseSettingsAdmin(admin.ModelAdmin):
    list_display = ('enabled', 'publisher_id', 'updated_at')
    
    fieldsets = (
        ('Publisher Configuration', {
            'fields': ('publisher_id', 'enabled')
        }),
        ('Ad Unit IDs', {
            'fields': (
                'homepage_ad_unit_id',
                'post_sidebar_ad_unit_id',
                'post_content_ad_unit_id'
            ),
            'description': 'Configure ad unit IDs for different page locations'
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    def has_add_permission(self, request):
        # Prevent multiple instances - singleton pattern
        return not AdSenseSettings.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        # Prevent deletion of settings
        return False
