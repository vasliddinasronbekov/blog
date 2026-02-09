from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Post, Comment, AdSenseSettings
from django.core.validators import MinLengthValidator, FileExtensionValidator
from django.core.files.images import get_image_dimensions

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[MinLengthValidator(8)])

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        # Parolni hash qilib saqlash (Production uchun shart!)
        return User.objects.create_user(**validated_data)

class CategorySerializer(serializers.ModelSerializer):
    post_count = serializers.IntegerField(source='posts.count', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'post_count']

class CommentSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = Comment
        fields = ['id', 'author', 'text', 'created_at', 'post']

class PostSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')
    category_name = serializers.ReadOnlyField(source='category.name')
    comments = CommentSerializer(many=True, read_only=True)
    featured_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'content', 'author', 'category', 'category_name',
            'created_at', 'updated_at', 'slug', 'comments', 'featured_image',
            'featured_image_url', 'seo_title', 'seo_description', 'seo_keywords',
            'is_indexable', 'canonical_url'
        ]
        read_only_fields = ['slug', 'featured_image_url']

    def get_featured_image_url(self, obj):
        if obj.featured_image:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.featured_image.url) if request else obj.featured_image.url
        return None

    def validate_featured_image(self, value):
        if value:
            if value.size > 5 * 1024 * 1024:  # 5MB max
                raise serializers.ValidationError("Image size must be less than 5MB.")
            try:
                dims = get_image_dimensions(value)
                if not dims:
                    raise serializers.ValidationError("Invalid image file.")
            except Exception as e:
                raise serializers.ValidationError(f"Image validation error: {str(e)}")
        return value


class AdSenseSettingsSerializer(serializers.ModelSerializer):
    """Serialize AdSense settings for frontend consumption"""
    
    class Meta:
        model = AdSenseSettings
        fields = [
            'enabled',
            'publisher_id',
            'homepage_ad_unit_id',
            'post_sidebar_ad_unit_id',
            'post_content_ad_unit_id'
        ]
        read_only_fields = fields  # Frontend should only read, not modify
