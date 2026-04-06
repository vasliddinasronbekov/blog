from celery import shared_task
from django.utils import timezone
import logging

from .ai_services import generate_post_with_ai, AIGenerationError
from .models import Post
from django.contrib.auth.models import User

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=2, default_retry_delay=10)
def generate_post_async(self, topic, keywords=None, tone=None, category_id=None, author_id=None):
    """
    Asynchronously generate a blog post using AI.
    
    Args:
        topic: Post topic
        keywords: Optional keywords for SEO
        tone: Writing tone (default: 'expert')
        category_id: Optional category ID
        author_id: User ID of the post creator
        
    Returns:
        dict with post_id or error info
    """
    try:
        logger.info(f"Starting AI post generation for topic: {topic}")
        
        # Generate the post content
        generated = generate_post_with_ai(
            topic=topic,
            keywords=keywords,
            tone=tone or 'expert'
        )
        
        # Get author
        author = None
        if author_id:
            try:
                author = User.objects.get(id=author_id)
            except User.DoesNotExist:
                logger.warning(f"Author with ID {author_id} not found")
        
        # Create the post in database
        post_data = {
            'title': generated.title,
            'content': generated.content,
            'seo_title': generated.seo_title,
            'seo_description': generated.seo_description,
            'seo_keywords': generated.seo_keywords,
            'status': 'draft',  # Save as draft for review
            'author': author,
        }
        
        if category_id:
            post_data['category_id'] = category_id
        
        post = Post.objects.create(**post_data)
        
        # Add tags
        if generated.tags:
            from .models import Tag
            for tag_name in generated.tags:
                tag, _ = Tag.objects.get_or_create(name=tag_name)
                post.tags.add(tag)
        
        logger.info(f"Successfully created post with ID {post.id}: {generated.title}")
        
        return {
            'success': True,
            'post_id': post.id,
            'title': generated.title,
            'message': f'Post created successfully as draft. Review before publishing.'
        }
        
    except AIGenerationError as e:
        logger.error(f"AI generation error: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'message': 'AI generation failed. Please try again.'
        }
    except Exception as e:
        logger.exception(f"Unexpected error in generate_post_async: {str(e)}")
        # Retry on unexpected errors
        raise self.retry(exc=e)
