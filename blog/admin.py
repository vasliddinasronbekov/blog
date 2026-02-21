# /media/gradientvvv/Linux/blog-app/blog/admin.py

from django import forms
from django.contrib import admin, messages

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
        # Keep manual mode behavior via clean(), while allowing AI mode to omit these inputs.
        self.fields["title"].required = False
        self.fields["content"].required = False
        self._ai_generated_post: AIGeneratedPost | None = None

    def clean(self):
        cleaned_data = super().clean()
        mode = cleaned_data.get("generation_mode", self.GENERATION_MODE_MANUAL)
        ai_topic = (cleaned_data.get("ai_topic") or "").strip()

        if mode == self.GENERATION_MODE_MANUAL:
            if not (cleaned_data.get("title") or "").strip():
                self.add_error("title", "Title is required in manual mode.")
            if not (cleaned_data.get("content") or "").strip():
                self.add_error("content", "Content is required in manual mode.")
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
            'fields': ('generation_mode', 'ai_topic', 'ai_keywords', 'ai_tone')
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

    readonly_fields = ('created_at', 'updated_at')
    class Media:
        css = {
            "all": ("blog/admin/post_mode_tabs.css",),
        }
        js = ("blog/admin/post_mode_tabs.js",)

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
