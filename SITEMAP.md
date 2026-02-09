# Sitemap generation

Run the Django management command to generate `sitemap.xml` for the project. The command scans `blog-frontend/app` for static pages and includes `Post` entries from the `blog` app.

Usage:

```bash
python manage.py generate_sitemap --domain=https://example.com --output=sitemap.xml
```

Defaults:
- `--domain`: `http://localhost:3000`
- `--output`: `./sitemap.xml`

The command will also attempt to write `sitemap.xml` into `STATIC_ROOT` if configured.
