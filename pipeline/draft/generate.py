"""Generate daily news draft using Claude.

Uses streaming + `get_final_message()` to avoid HTTP timeouts when the model
takes time to draft a full issue.

Prompt caching is intentionally NOT used: this pipeline makes one call per day,
so there are no repeat requests to hit the cache.
"""
from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path

import anthropic


MODEL = os.environ.get("AI_NEWS_MODEL", "claude-sonnet-4-6")
PIPELINE_DIR = Path(__file__).resolve().parent.parent
PROMPT_PATH = PIPELINE_DIR / "prompts" / "draft.md"


def _fill(template: str, replacements: dict[str, str]) -> str:
    for key, value in replacements.items():
        template = template.replace("{{" + key + "}}", value)
    return template


_FENCE_RE = re.compile(r"^```[a-zA-Z]*\s*\n(.*?)\n```\s*$", re.DOTALL)


def _strip_code_fence(text: str) -> str:
    match = _FENCE_RE.match(text.strip())
    return match.group(1) if match else text


def _trim_before_frontmatter(text: str) -> str:
    """If the model prepended any preamble before `---`, drop it."""
    stripped = text.lstrip()
    if stripped.startswith("---"):
        return stripped
    idx = stripped.find("\n---\n")
    if idx != -1:
        return stripped[idx + 1 :]
    return stripped


def generate_draft(
    raw_data: dict,
    target_date: str,
    issue_number: int,
    case_company: str,
    case_angle: str,
) -> str:
    """Call Claude to produce a daily issue Markdown file.

    Returns the raw Markdown content (YAML frontmatter + body), ready to write
    to disk. Raises RuntimeError if output doesn't start with frontmatter.
    """
    client = anthropic.Anthropic()

    template = PROMPT_PATH.read_text(encoding="utf-8")
    system = _fill(
        template,
        {
            "TARGET_DATE": target_date,
            "ISSUE_NUMBER": str(issue_number),
            "CASE_COMPANY": case_company,
            "CASE_ANGLE": case_angle,
            "RAW_DATA_JSON": json.dumps(raw_data, ensure_ascii=False, indent=2),
        },
    )

    try:
        with client.messages.stream(
            model=MODEL,
            max_tokens=16000,
            system=system,
            messages=[
                {
                    "role": "user",
                    "content": f"请生成 {target_date} 这一期 AI Marketer News。严格按 system 中的格式输出。",
                },
            ],
        ) as stream:
            message = stream.get_final_message()
    except Exception as exc:
        print(
            f"[draft] Claude request failed: {type(exc).__name__}: {exc}",
            file=sys.stderr,
        )
        raise

    if message.stop_reason == "max_tokens":
        raise RuntimeError(
            "Draft was truncated (hit max_tokens=16000). Increase the limit or split the case study."
        )

    text_parts = [b.text for b in message.content if b.type == "text"]
    draft = "".join(text_parts).strip()
    draft = _strip_code_fence(draft)
    draft = _trim_before_frontmatter(draft)

    if not draft.startswith("---"):
        raise RuntimeError(
            f"Draft did not start with YAML frontmatter. First 300 chars:\n{draft[:300]}"
        )

    usage = message.usage
    print(
        f"[draft] model={MODEL} "
        f"input={usage.input_tokens} output={usage.output_tokens} "
        f"stop_reason={message.stop_reason}"
    )

    return draft
