import json
import logging
import re
from dataclasses import dataclass
from typing import Optional

from django.conf import settings
from openai import AuthenticationError, OpenAI

logger = logging.getLogger(__name__)
MIN_WORDS = 1200
MAX_WORDS = 1800
TARGET_WORDS = 1400


class AIGenerationError(Exception):
    """Raised when AI post generation fails."""


@dataclass(frozen=True)
class AIGeneratedPost:
    title: str
    content: str
    seo_title: str
    seo_description: str
    seo_keywords: str
    tags: list[str]


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


def _normalize_tags(raw_tags: object, fallback_keywords: str = "") -> list[str]:
    tags: list[str] = []

    if isinstance(raw_tags, list):
        tags = [str(item).strip() for item in raw_tags if str(item).strip()]
    elif isinstance(raw_tags, str):
        tags = [part.strip() for part in raw_tags.split(",") if part.strip()]

    if not tags and fallback_keywords:
        tags = [part.strip() for part in fallback_keywords.split(",") if part.strip()]

    normalized: list[str] = []
    seen: set[str] = set()
    for tag in tags:
        cleaned = re.sub(r"\s+", " ", tag.lstrip("#")).strip()
        if not cleaned:
            continue
        key = cleaned.lower()
        if key in seen:
            continue
        seen.add(key)
        normalized.append(cleaned[:60])

    return normalized[:8]


def _build_user_prompt(
    *,
    topic: str,
    keywords: str,
    tone: str,
    correction_note: Optional[str] = None,
) -> str:
    correction = ""
    if correction_note:
        correction = (
            "\n\nPrevious attempt failed. Fix it strictly.\n"
            f"{correction_note}\n"
            "Do not repeat the same mistake."
        )

    return (
        "Generate a complete IELTS educational blog article and metadata.\n"
        f"Topic: {topic}\n"
        f"Preferred keywords: {keywords or 'None provided'}\n"
        f"Tone: {tone}\n\n"
        "Requirements:\n"
        f"- Hard word range: {MIN_WORDS}-{MAX_WORDS} words\n"
        f"- Target about {TARGET_WORDS} words for reliability\n"
        "- Use at least 12 substantial paragraphs in total\n"
        "- Each H3 section should include 2-3 detailed paragraphs\n"
        "- SEO optimized and natural\n"
        "- Output content in clean semantic HTML only (no markdown)\n"
        "- Include one H2 introduction section\n"
        "- Use multiple H3 subsections\n"
        "- Include a conclusion section (word 'Conclusion' in heading)\n"
        "- No inline CSS, no JavaScript, no scripts\n"
        "- Keep title <= 60 chars\n"
        "- Keep SEO title <= 60 chars\n"
        "- Keep SEO description <= 160 chars\n"
        "- Return 4-8 concise related tags (each 1-3 words)\n"
        "- Ensure Google-safe, human-readable writing\n\n"
        "Return strict JSON with keys exactly:\n"
        "title, content, seo_title, seo_description, seo_keywords, tags"
        f"{correction}"
    )


def _build_expansion_prompt(
    *,
    topic: str,
    keywords: str,
    tone: str,
    generated: AIGeneratedPost,
    current_word_count: int,
) -> str:
    return (
        "The previous response was too short. Expand and rewrite it so it passes all constraints.\n"
        f"Topic: {topic}\n"
        f"Preferred keywords: {keywords or 'None provided'}\n"
        f"Tone: {tone}\n"
        f"Current word count: {current_word_count}\n\n"
        "Hard requirements:\n"
        f"- Final content word count must be between {MIN_WORDS} and {MAX_WORDS}\n"
        "- Keep clean semantic HTML only\n"
        "- Must include H2 intro, multiple H3 sections, and a Conclusion section\n"
        "- No scripts, no style tags, no inline CSS\n"
        "- Keep SEO title <= 60 and SEO description <= 160\n"
        "- Keep/return 4-8 concise related tags\n\n"
        "Existing JSON draft to expand (use as baseline and improve):\n"
        f"{json.dumps(generated.__dict__, ensure_ascii=False)}\n\n"
        "Return strict JSON with keys exactly:\n"
        "title, content, seo_title, seo_description, seo_keywords, tags"
    )


def _request_payload(
    *,
    client: OpenAI,
    model: str,
    user_prompt: str,
) -> dict:
    response = client.chat.completions.create(
        model=model,
        temperature=0.2,
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
    return json.loads(raw_content)


def _parse_generated_payload(payload: dict, topic: str) -> AIGeneratedPost:
    try:
        seo_keywords = _truncate(str(payload["seo_keywords"]).strip(), 255)
        tags = _normalize_tags(payload.get("tags"), seo_keywords)
        return AIGeneratedPost(
            title=_truncate(str(payload["title"]).strip(), 60),
            content=_clean_html(str(payload["content"])),
            seo_title=_truncate(str(payload["seo_title"]).strip(), 60),
            seo_description=_truncate(str(payload["seo_description"]).strip(), 160),
            seo_keywords=seo_keywords,
            tags=tags,
        )
    except KeyError as exc:
        logger.exception("AI payload missing expected fields for topic '%s': %s", topic, exc)
        raise AIGenerationError("AI response format was invalid. Please try again.") from exc


def _validate_generated(generated: AIGeneratedPost, topic: str) -> tuple[bool, str, int]:
    if not generated.title or not generated.content:
        logger.error("AI response missing title/content for topic '%s'", topic)
        return False, "Missing title or content.", 0

    content_lower = generated.content.lower()
    word_count = _word_count_from_html(generated.content)
    if "<h2" not in content_lower or "<h3" not in content_lower:
        logger.error("AI response missing required heading structure for topic '%s'", topic)
        return False, "Missing required H2/H3 heading structure.", word_count
    if "conclusion" not in content_lower:
        logger.error("AI response missing conclusion section for topic '%s'", topic)
        return False, "Missing required conclusion section.", word_count
    if word_count < MIN_WORDS or word_count > MAX_WORDS:
        logger.error(
            "AI response out of required word range (%s words) for topic '%s'",
            word_count,
            topic,
        )
        return False, f"Word count out of range: {word_count}. Required {MIN_WORDS}-{MAX_WORDS}.", word_count
    if len(generated.tags) < 3:
        logger.error("AI response returned too few tags for topic '%s': %s", topic, generated.tags)
        return False, "Too few tags returned. Need at least 3 related tags.", word_count

    return True, "", word_count


def generate_post_with_ai(
    *,
    topic: str,
    keywords: Optional[str] = None,
    tone: Optional[str] = None,
) -> AIGeneratedPost:
    api_key = str(getattr(settings, "OPENAI_API_KEY", "")).strip().strip('"').strip("'")
    if not api_key:
        raise AIGenerationError("OPENAI_API_KEY is missing. Configure it in your environment.")

    model = getattr(settings, "OPENAI_MODEL", "gpt-4.1-mini")
    timeout = float(getattr(settings, "OPENAI_TIMEOUT_SECONDS", 60))
    max_attempts = int(getattr(settings, "OPENAI_GENERATION_MAX_ATTEMPTS", 3))
    tone_value = tone or "expert"
    keyword_text = keywords.strip() if keywords else ""

    try:
        client = OpenAI(api_key=api_key, timeout=timeout)
        correction_note: Optional[str] = None
        last_validation_error: Optional[str] = None

        for attempt in range(1, max_attempts + 1):
            user_prompt = _build_user_prompt(
                topic=topic,
                keywords=keyword_text,
                tone=tone_value,
                correction_note=correction_note,
            )
            payload = _request_payload(client=client, model=model, user_prompt=user_prompt)
            generated = _parse_generated_payload(payload, topic)
            is_valid, validation_error, word_count = _validate_generated(generated, topic)
            if is_valid:
                return generated

            if "Word count out of range" in validation_error:
                expansion_prompt = _build_expansion_prompt(
                    topic=topic,
                    keywords=keyword_text,
                    tone=tone_value,
                    generated=generated,
                    current_word_count=word_count,
                )
                expanded_payload = _request_payload(
                    client=client,
                    model=model,
                    user_prompt=expansion_prompt,
                )
                expanded_generated = _parse_generated_payload(expanded_payload, topic)
                expanded_valid, expanded_error, expanded_wc = _validate_generated(expanded_generated, topic)
                if expanded_valid:
                    logger.info(
                        "AI generation expansion succeeded for topic '%s' (attempt %s, %s words)",
                        topic,
                        attempt,
                        expanded_wc,
                    )
                    return expanded_generated
                validation_error = f"{validation_error} | Expansion attempt failed: {expanded_error}"
                word_count = expanded_wc

            last_validation_error = validation_error
            correction_note = (
                f"Last output issue: {validation_error}\n"
                f"Previous content word count: {word_count}\n"
                f"Generate new output within {MIN_WORDS}-{MAX_WORDS} words with 4-8 relevant tags."
            )
            logger.warning(
                "AI generation retry %s/%s for topic '%s': %s",
                attempt,
                max_attempts,
                topic,
                validation_error,
            )

        raise AIGenerationError(
            f"AI response failed validation after {max_attempts} attempts. "
            f"Last issue: {last_validation_error or 'Unknown validation error'}"
        )
    except AuthenticationError as exc:
        logger.exception("OpenAI authentication failed for topic '%s': %s", topic, exc)
        raise AIGenerationError(
            "OpenAI authentication failed (401). Check the active OPENAI_API_KEY in the running server process."
        ) from exc
    except AIGenerationError:
        raise
    except Exception as exc:
        logger.exception("AI generation failed for topic '%s': %s", topic, exc)
        raise AIGenerationError("AI generation failed. Please try again.") from exc
