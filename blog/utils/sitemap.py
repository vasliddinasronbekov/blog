from pathlib import Path
import os
import xml.etree.ElementTree as ET
from django.conf import settings

try:
    from blog.models import Post
except Exception:
    Post = None


def generate_sitemap(domain='http://localhost:3000', output=None):
    domain = domain.rstrip('/')
    if output is None:
        # Default: write to frontend's public folder for static serving
        output = str(Path(settings.BASE_DIR).parent / 'blog-frontend' / 'public' / 'sitemap.xml')
    
    output = Path(output)
    # Ensure parent directory exists
    output.parent.mkdir(parents=True, exist_ok=True)

    frontend_app = Path(settings.BASE_DIR) / 'blog-frontend' / 'app'

    urls = set()
    urls.add('/')

    if frontend_app.exists():
        for root, dirs, files in os.walk(frontend_app):
            for fname in files:
                if fname.startswith('page.') and fname.endswith(('.tsx', '.ts', '.jsx', '.js')):
                    p = Path(root)
                    try:
                        rel = p.relative_to(frontend_app)
                    except Exception:
                        rel = Path('.')
                    if str(rel) == '.' or str(rel) == '':
                        urls.add('/')
                    else:
                        parts = [part for part in rel.parts if part and not part.startswith('.')]
                        if any('[' in part or ']' in part for part in parts):
                            continue
                        route = '/' + '/'.join(parts)
                        urls.add(route)

    if Post is not None:
        for post in Post.objects.filter(is_indexable=True):
            if post.slug:
                urls.add(f'/posts/{post.slug}')

    urlset = ET.Element('urlset', xmlns='http://www.sitemaps.org/schemas/sitemap/0.9')
    for u in sorted(urls):
        url_el = ET.SubElement(urlset, 'url')
        loc = ET.SubElement(url_el, 'loc')
        loc.text = f"{domain}{u}"
        if u.startswith('/posts/') and Post is not None:
            slug = u.split('/posts/')[-1]
            try:
                p = Post.objects.get(slug=slug)
                lastmod = ET.SubElement(url_el, 'lastmod')
                lastmod.text = p.updated_at.date().isoformat()
            except Exception:
                pass

    tree = ET.ElementTree(urlset)
    output.parent.mkdir(parents=True, exist_ok=True)
    tree.write(str(output), encoding='utf-8', xml_declaration=True)

    # Also try to write to STATIC_ROOT if configured
    try:
        static_root = Path(settings.STATIC_ROOT)
        if static_root.exists():
            tree.write(str(static_root / 'sitemap.xml'), encoding='utf-8', xml_declaration=True)
    except Exception:
        pass

    return str(output)
