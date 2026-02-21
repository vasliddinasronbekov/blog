import json
import logging
import re
from dataclasses import dataclass
from typing import Optional

from django.conf import settings
from openai import OpenAI

logger = logging.getLogger(__name__)


class AIGenerationError(Exception):
    """Raised when AI post generation fails."""


@dataclass(frozen=True)
class AIGeneratedPost:
    title: str
    content: str
    seo_title: str
    seo_description: str
    seo_keywords: str


def _clean_html(value: str) -> str:
    text = value.strip()
    text = re.sub(r"^```(?:html)?\s*|\s*```$", "", text, flags=re.MULTILINE)
    text = re.sub(r"<\s*script[^>]*>.*?<\s*/\s*script\s*>", "", text, flags=re.IGNORECASE | re.DOTALL)
    text = re.sub(r"<\s*style[^>]*>.*?<\s*/\s*style\s*>", "", text, flags=re.IGNORECASE | re.DOTALL)
    text = re.sub(r"\sstyle\s*=\s*(['\"]).*?\1", "", text, flags=re.IGNORECASE | re.DOTALL)
    return text.strip()


def _truncate(value: str, max_length: int) -> str:
    return value[:max_length].strip()


def _word_count_from_html(html: str) -> int:
    text = re.sub(r"<[^>]+>", " ", html)
    return len(re.findall(r"\b[\w'-]+\b", text))


def generate_post_with_ai(
    *,
    topic: str,
    keywords: Optional[str] = None,
    tone: Optional[str] = None,
) -> AIGeneratedPost:
    api_key = getattr(settings, "OPENAI_API_KEY", "")
    if not api_key:
        raise AIGenerationError("OPENAI_API_KEY is missing. Configure it in your environment.")

    model = getattr(settings, "OPENAI_MODEL", "gpt-4.1-mini")
    timeout = float(getattr(settings, "OPENAI_TIMEOUT_SECONDS", 60))
    tone_value = tone or "expert"
    keyword_text = keywords.strip() if keywords else ""

    user_prompt = (
        "Generate a complete IELTS educational blog article and metadata.\n"
        f"Topic: {topic}\n"
        f"Preferred keywords: {keyword_text or 'None provided'}\n"
        f"Tone: {tone_value}\n\n"
        "Requirements:\n"
        "- 1200-1800 words\n"
        "- SEO optimized and natural\n"
        "- Output content in clean semantic HTML only (no markdown)\n"
        "- Include one H2 introduction section\n"
        "- Use multiple H3 subsections\n"
        "- Include a conclusion section\n"
        "- No inline CSS, no JavaScript, no scripts\n"
        "- Keep title <= 60 chars\n"
        "- Keep SEO description <= 160 chars\n"
        "- Ensure Google-safe, human-readable writing\n\n"
        "Return strict JSON with keys exactly:\n"
        "title, content, seo_title, seo_description, seo_keywords"
    )

    try:
        client = OpenAI(api_key=api_key, timeout=timeout)
        response = client.chat.completions.create(
            model=model,
            temperature=0.7,
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert IELTS instructor and SEO content writer. "
                        "Follow constraints exactly and return JSON only."
                    ),
                },
                {"role": "user", "content": user_prompt},
            ],
        )
        raw_content = response.choices[0].message.content or ""
        payload = json.loads(raw_content)
    except Exception as exc:
        logger.exception("AI generation failed for topic '%s': %s", topic, exc)
        raise AIGenerationError("AI generation failed. Please try again.") from exc

    try:
        generated = AIGeneratedPost(
            title=_truncate(str(payload["title"]).strip(), 60),
            content=_clean_html(str(payload["content"])),
            seo_title=_truncate(str(payload["seo_title"]).strip(), 60),
            seo_description=_truncate(str(payload["seo_description"]).strip(), 160),
            seo_keywords=_truncate(str(payload["seo_keywords"]).strip(), 255),
        )
    except KeyError as exc:
        logger.exception("AI payload missing expected fields for topic '%s': %s", topic, exc)
        raise AIGenerationError("AI response format was invalid. Please try again.") from exc

    if not generated.title or not generated.content:
        logger.error("AI response missing title/content for topic '%s'", topic)
        raise AIGenerationError("AI response was incomplete. Please try again.")

    content_lower = generated.content.lower()
    word_count = _word_count_from_html(generated.content)
    if "<h2" not in content_lower or "<h3" not in content_lower:
        logger.error("AI response missing required heading structure for topic '%s'", topic)
        raise AIGenerationError("AI response missed required heading structure. Please try again.")
    if "conclusion" not in content_lower:
        logger.error("AI response missing conclusion section for topic '%s'", topic)
        raise AIGenerationError("AI response missed a conclusion section. Please try again.")
    if word_count < 1200 or word_count > 1800:
        logger.error("AI response out of required word range (%s words) for topic '%s'", word_count, topic)
        raise AIGenerationError("AI response length was outside 1200-1800 words. Please try again.")

    return generated
