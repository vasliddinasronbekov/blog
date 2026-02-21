from pathlib import Path
from django.conf import settings
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Post
import threading
from .utils.sitemap import generate_sitemap


def _generate(domain=None):
    try:
        sitemap_domain = domain or getattr(settings, "SITE_URL", "https://zuuu.uz")
        output = str(Path(settings.MEDIA_ROOT) / "sitemap.xml")
        generate_sitemap(domain=sitemap_domain, output=output)
    except Exception:
        pass


@receiver(post_save, sender=Post)
def post_saved_update_sitemap(sender, instance, created, **kwargs):
    # Run in background so write operations are not blocked.
    t = threading.Thread(target=_generate, kwargs={"domain": None}, daemon=True)
    t.start()


@receiver(post_delete, sender=Post)
def post_deleted_update_sitemap(sender, instance, **kwargs):
    # Keep sitemap fresh after deletions as well.
    t = threading.Thread(target=_generate, kwargs={"domain": None}, daemon=True)
    t.start()
