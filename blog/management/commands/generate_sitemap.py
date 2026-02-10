from django.core.management.base import BaseCommand
from django.conf import settings
from pathlib import Path
from blog.utils.sitemap import generate_sitemap


class Command(BaseCommand):
    help = 'Generate sitemap.xml combining frontend static routes and backend Post entries'

    def add_arguments(self, parser):
        parser.add_argument('--domain', default='https://zuuu.uz', help='Site domain, e.g. https://example.com')
        # Default to frontend public folder (will be set in generate_sitemap if None)
        parser.add_argument('--output', default=None, help='Output path for sitemap.xml (default: blog-frontend/public/sitemap.xml)')

    def handle(self, *args, **options):
        domain = options['domain']
        output = options['output']
        path = generate_sitemap(domain=domain, output=output)
        self.stdout.write(self.style.SUCCESS(f'Sitemap written to {path}'))
