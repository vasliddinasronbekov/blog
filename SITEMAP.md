# Sitemap generation

The project now serves sitemap dynamically from backend at:

`https://api.zuuu.uz/sitemap.xml`

Frontend route `/sitemap.xml` proxies backend response, so it is always fresh.

The Django management command is still available if you want to export a file copy. It scans `blog-frontend/app` for static pages and includes `Post` entries from the `blog` app.

Usage:

```bash
python manage.py generate_sitemap --domain=https://example.com --output=sitemap.xml
```

Defaults:
- `--domain`: `https://zuuu.uz`
- `--output`: `MEDIA_ROOT/sitemap.xml`

The command will also attempt to write `sitemap.xml` into `STATIC_ROOT` if configured.
