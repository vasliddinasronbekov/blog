from pathlib import Path
import os
import xml.etree.ElementTree as ET
from django.conf import settings

try:
    from blog.models import Post
except Exception:
    Post = None


def _collect_urls():
    urls = {"/"}
    frontend_app = Path(settings.BASE_DIR) / "blog-frontend" / "app"

    if frontend_app.exists():
        for root, dirs, files in os.walk(frontend_app):
            for fname in files:
                if fname.startswith("page.") and fname.endswith((".tsx", ".ts", ".jsx", ".js")):
                    p = Path(root)
                    try:
                        rel = p.relative_to(frontend_app)
                    except Exception:
                        rel = Path(".")

                    if str(rel) in {".", ""}:
                        urls.add("/")
                        continue

                    parts = [part for part in rel.parts if part and not part.startswith(".")]
                    if any("[" in part or "]" in part for part in parts):
                        continue

                    urls.add("/" + "/".join(parts))

    if Post is not None:
        for post in Post.objects.filter(is_indexable=True).only("slug"):
            if post.slug:
                urls.add(f"/posts/{post.slug}")

    return sorted(urls)


def build_sitemap_xml(domain="https://zuuu.uz"):
    domain = domain.rstrip('/')
    urlset = ET.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")

    for u in _collect_urls():
        url_el = ET.SubElement(urlset, "url")
        loc = ET.SubElement(url_el, "loc")
        loc.text = f"{domain}{u}"
        if u.startswith("/posts/") and Post is not None:
            slug = u.split("/posts/")[-1]
            try:
                p = Post.objects.get(slug=slug)
                lastmod = ET.SubElement(url_el, "lastmod")
                lastmod.text = p.updated_at.date().isoformat()
            except Exception:
                pass

    return ET.tostring(urlset, encoding="utf-8", xml_declaration=True)


def generate_sitemap(domain='https://zuuu.uz', output=None):
    domain = domain.rstrip("/")
    if output is None:
        output = str(Path(settings.MEDIA_ROOT) / "sitemap.xml")

    output = Path(output)
    output.parent.mkdir(parents=True, exist_ok=True)

    xml_bytes = build_sitemap_xml(domain=domain)
    output.write_bytes(xml_bytes)

    # Also try to write to STATIC_ROOT if configured
    try:
        static_root = Path(settings.STATIC_ROOT)
        if static_root.exists():
            (static_root / "sitemap.xml").write_bytes(xml_bytes)
    except Exception:
        pass

    return str(output)
