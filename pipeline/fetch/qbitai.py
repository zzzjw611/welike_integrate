"""Fetch AI news from 量子位 (QbitAI) RSS — Chinese-language perspective.

Feeds Daily Brief raw data alongside TechCrunch. Lets Claude:
- Cover China-side AI moves (DeepSeek, Alibaba, ByteDance, 优必选, etc.)
- Cross-validate big stories (e.g. DeepSeek-V4 covered by both TC and 量子位)
"""
from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone

import feedparser

from pipeline.fetch import RawItem


QBITAI_FEED = "https://www.qbitai.com/feed"

# 量子位 covers a lot of pure tech / scientific AI. We want only items relevant
# to AI marketers: model releases, funding, products, big-co moves, industry shifts.
# Keep this list broad — Claude does final curation.
RELEVANCE_KEYWORDS = [
    # Models / labs
    "deepseek", "openai", "anthropic", "claude", "gpt", "gemini", "llm", "千问", "通义",
    "豆包", "kimi", "智谱", "moonshot", "minimax", "百川", "腾讯ai", "字节", "阿里",
    # Marketing / commerce / agents
    "营销", "广告", "电商", "增长", "agent", "智能体", "客服", "ai助手", "copilot",
    # Funding / org
    "融资", "估值", "ipo", "发布", "上线", "推出", "收购", "上市",
    # Product
    "产品", "应用", "工具", "平台", "api",
]


def _strip_html(s: str) -> str:
    return re.sub(r"<[^>]+>", "", s).strip()


def fetch(hours_back: int = 36, max_items: int = 8) -> list[RawItem]:
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours_back)
    kw_re = re.compile("|".join(map(re.escape, RELEVANCE_KEYWORDS)), re.IGNORECASE)

    try:
        feed = feedparser.parse(QBITAI_FEED)
    except Exception as e:
        print(f"[qbitai] parse failed — skipping: {e}")
        return []

    if not feed.entries:
        print("[qbitai] feed returned no entries")
        return []

    out: list[RawItem] = []
    for entry in feed.entries[:25]:
        if len(out) >= max_items:
            break

        pub_struct = entry.get("published_parsed") or entry.get("updated_parsed")
        if pub_struct:
            pub_dt = datetime(*pub_struct[:6], tzinfo=timezone.utc)
            if pub_dt < cutoff:
                continue
            pub_iso = pub_dt.isoformat()
        else:
            pub_iso = None

        title = entry.get("title", "")
        summary = _strip_html(entry.get("summary", ""))[:600]
        url = entry.get("link", "")

        if not title or not url:
            continue

        # Relevance filter: title or summary must contain at least one keyword
        haystack = f"{title} {summary}"
        if not kw_re.search(haystack):
            continue

        out.append(
            RawItem(
                source="量子位",
                title=title,
                summary=summary,
                url=url,
                published=pub_iso,
            )
        )

    return out


if __name__ == "__main__":
    import json
    items = fetch()
    print(f"Total: {len(items)}")
    print(json.dumps([i.to_dict() for i in items], indent=2, ensure_ascii=False))
