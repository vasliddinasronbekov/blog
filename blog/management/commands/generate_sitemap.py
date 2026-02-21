from django.core.management.base import BaseCommand
from blog.utils.sitemap import generate_sitemap


class Command(BaseCommand):
    help = 'Generate sitemap.xml combining frontend static routes and backend Post entries'

    def add_arguments(self, parser):
        parser.add_argument('--domain', default='https://zuuu.uz', help='Site domain, e.g. https://example.com')
        # Default output is MEDIA_ROOT/sitemap.xml when not provided.
        parser.add_argument('--output', default=None, help='Output path for sitemap.xml (default: MEDIA_ROOT/sitemap.xml)')

    def handle(self, *args, **options):
        domain = options['domain']
        output = options['output']
        path = generate_sitemap(domain=domain, output=output)
        self.stdout.write(self.style.SUCCESS(f'Sitemap written to {path}'))
