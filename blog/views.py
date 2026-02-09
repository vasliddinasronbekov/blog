from rest_framework import viewsets, filters, permissions, generics
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Post, Comment, AdSenseSettings
from .serializers import CategorySerializer, PostSerializer, CommentSerializer, UserSerializer, AdSenseSettingsSerializer
from django.contrib.auth.models import User

class PostViewSet(viewsets.ModelViewSet):
    # Optimizatsiya: author va category-ni bitta so'rovda oladi, commentlarni keshlaydi
    queryset = Post.objects.select_related('author', 'category').prefetch_related('comments__author').all()
    serializer_class = PostSerializer
    lookup_field = 'slug'
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'author']
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'title']

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

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
