from rest_framework import viewsets, filters, permissions, generics
from django_filters.rest_framework import DjangoFilterBackend
from django.conf import settings
from django.http import HttpResponse
from .models import Category, Post, Comment, AdSenseSettings, Tag
from .serializers import (
    CategorySerializer,
    PostSerializer,
    CommentSerializer,
    UserSerializer,
    AdSenseSettingsSerializer,
    TagSerializer,
)
from django.contrib.auth.models import User
from .utils.sitemap import build_sitemap_xml


class IsAuthenticatedOrReadOnlyDeleteByVasliddin(permissions.IsAuthenticatedOrReadOnly):
    def has_permission(self, request, view):
        if view.action == "destroy":
            return bool(
                request.user
                and request.user.is_authenticated
                and request.user.username == "vasliddin"
            )
        return super().has_permission(request, view)


class PostViewSet(viewsets.ModelViewSet):
    # Optimizatsiya: author va category-ni bitta so'rovda oladi, commentlarni keshlaydi
    queryset = Post.objects.select_related('author', 'category').prefetch_related('comments__author', 'tags').all()
    serializer_class = PostSerializer
    lookup_field = 'slug'
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'author', 'tags']
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'title']

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["slug", "name"]
    search_fields = ["name", "slug"]
    ordering_fields = ["name", "id"]


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.select_related("created_by").all()
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticatedOrReadOnlyDeleteByVasliddin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["slug", "name", "created_by"]
    search_fields = ["name", "slug"]
    ordering_fields = ["name", "created_at"]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.select_related('author').all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer


class AdSenseSettingsView(generics.RetrieveAPIView):
    """
    Retrieve AdSense settings (read-only).
    Returns enabled status and ad unit IDs for frontend.
    """
    serializer_class = AdSenseSettingsSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_object(self):
        return AdSenseSettings.get_settings()


def sitemap_xml(request):
    domain = getattr(settings, "SITE_URL", "https://zuuu.uz")
    xml_content = build_sitemap_xml(domain=domain)
    return HttpResponse(xml_content, content_type="application/xml")
