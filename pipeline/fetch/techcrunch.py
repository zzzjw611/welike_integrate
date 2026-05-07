"""Fetch AI / marketing news from TechCrunch RSS."""
from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone

import feedparser

from pipeline.fetch import RawItem
from pipeline.config import AI_KEYWORDS


TC_FEEDS = [
    "https://techcrunch.com/category/artificial-intelligence/feed/",
    "https://techcrunch.com/category/venture/feed/",
    "https://techcrunch.com/feed/",
]


def _strip_html(s: str) -> str:
    return re.sub(r"<[^>]+>", "", s).strip()


def fetch(hours_back: int = 36, max_items: int = 12) -> list[RawItem]:
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours_back)
    kw_re = re.compile("|".join(map(re.escape, AI_KEYWORDS)), re.IGNORECASE)

    seen: set[str] = set()
    out: list[RawItem] = []

    for feed_url in TC_FEEDS:
        feed = feedparser.parse(feed_url)
        for entry in feed.entries[:50]:
            url = entry.get("link", "")
            if not url or url in seen:
                continue
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
            haystack = f"{title} {summary}"
            if not kw_re.search(haystack):
                continue

            seen.add(url)
            out.append(
                RawItem(
                    source="TechCrunch",
                    title=title,
                    summary=summary,
                    url=url,
                    published=pub_iso,
                )
            )
            if len(out) >= max_items:
                return out
    return out


if __name__ == "__main__":
    import json
    items = fetch()
    print(json.dumps([i.to_dict() for i in items], indent=2, ensure_ascii=False))
