from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from blog.views import CategoryViewSet, PostViewSet, CommentViewSet, RegisterView, AdSenseSettingsView, TagViewSet, sitemap_xml
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# Router sozlamalari
router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'posts', PostViewSet, basename='post')
router.register(r'comments', CommentViewSet, basename='comment')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('sitemap.xml', sitemap_xml, name='sitemap_xml'),
    
    # API endpoints
    path('api/', include(router.urls)),
    
    # Authentication & Registration
    path('api/register/', RegisterView.as_view(), name='auth_register'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # AdSense Settings (read-only)
    path('api/adsense-settings/', AdSenseSettingsView.as_view(), name='adsense_settings'),
    
    # REST Framework login/logout (brauzerda test qilish uchun)
    path('api-auth/', include('rest_framework.urls')),
]

# Productionda rasmlar chiqishi uchun (Development mode)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
