# /media/gradientvvv/Linux/blog-app/blog/models.py

from django.db import models
from django.utils.text import slugify
from django.utils.timezone import now
from django.conf import settings

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name
    class Meta:
        verbose_name = 'Kategoriya'
        verbose_name_plural = 'Kategoriyalar'


class Post(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name='posts'
    )

    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)

    content = models.TextField()

    featured_image = models.ImageField(
        upload_to='posts/',
        blank=True,
        null=True,
        help_text="Upload image (JPG, PNG). Max 5MB."
    )

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='posts'
    )

    # 🔥 SEO FIELDS
    seo_title = models.CharField(
        max_length=60,
        blank=True,
        help_text="Google title (max 60 chars)"
    )
    seo_description = models.CharField(
        max_length=160,
        blank=True,
        help_text="Meta description (max 160 chars)"
    )
    seo_keywords = models.CharField(
        max_length=255,
        blank=True,
        help_text="Comma separated keywords"
    )

    is_indexable = models.BooleanField(
        default=True,
        help_text="Allow Google indexing"
    )

    canonical_url = models.URLField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(default=now)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Maqola'
        verbose_name_plural = 'Maqolalar'


class Comment(models.Model):
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='comments'
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.author} - {self.post.title[:30]}"
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Izoh'
        verbose_name_plural = 'Izohlar'


class AdSenseSettings(models.Model):
    """Singleton model to store AdSense configuration"""
    publisher_id = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="AdSense Publisher ID (ca-pub-xxxxxxxxxxxxxxxx)"
    )
    
    enabled = models.BooleanField(
        default=False,
        help_text="Enable AdSense ads across the site"
    )
    
    # Ad unit IDs for different placements
    homepage_ad_unit_id = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Ad unit ID for homepage"
    )
    
    post_sidebar_ad_unit_id = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Ad unit ID for post detail sidebar"
    )
    
    post_content_ad_unit_id = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Ad unit ID for inside post content"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"AdSense Settings {'(Enabled)' if self.enabled else '(Disabled)'}"
    
    class Meta:
        verbose_name = 'AdSense Settings'
        verbose_name_plural = 'AdSense Settings'
    
    @classmethod
    def get_settings(cls):
        """Get or create singleton AdSense settings"""
        settings_obj, created = cls.objects.get_or_create(pk=1)
        return settings_obj