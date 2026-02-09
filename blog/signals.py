from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Post
import threading
from .utils.sitemap import generate_sitemap


def _generate(domain=None):
    try:
        generate_sitemap(domain=domain)
    except Exception:
        pass


@receiver(post_save, sender=Post)
def post_saved_update_sitemap(sender, instance, created, **kwargs):
    # Only regenerate for indexable posts
    if not instance.is_indexable:
        return
    # Run in background so request isn't delayed
    t = threading.Thread(target=_generate, kwargs={'domain': None}, daemon=True)
    t.start()
