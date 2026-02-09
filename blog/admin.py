# /media/gradientvvv/Linux/blog-app/blog/admin.py

from django.contrib import admin
from .models import Post, Category, Comment, AdSenseSettings


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
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
