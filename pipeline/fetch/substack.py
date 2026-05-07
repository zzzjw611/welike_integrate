"""Fetch growth-thinker articles from Substack / blog RSS feeds.

Replaces the deprecated `twitter.py`. X scraping at Apify free tier proved
unviable in 2026 — X anti-scraping changes return empty results. The same
growth thinkers post their deeper analysis on Substack/blogs anyway, and
Claude can extract sharper Growth Insight quotes from full articles than from
280-char tweets.
"""
from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone

import feedparser

from pipeline.fetch import RawItem
from pipeline.config import SUBSTACK_FEEDS


def _strip_html(s: str) -> str:
    return re.sub(r"<[^>]+>", "", s).strip()


def fetch(
    hours_back: int = 96,
    max_per_feed: int = 2,
    max_total: int = 10,
) -> list[RawItem]:
    """Pull recent posts from configured Substack/blog RSS feeds.

    Default 96-hour lookback because long-form publications post less
    frequently than news sites — going too short means empty results on
    quiet days.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours_back)
    out: list[RawItem] = []

    for feed_meta in SUBSTACK_FEEDS:
        if len(out) >= max_total:
            break

        try:
            feed = feedparser.parse(feed_meta["url"])
        except Exception as e:
            print(f"[substack] {feed_meta['name']} parse failed — skipping: {e}")
            continue

        if not feed.entries:
            print(f"[substack] {feed_meta['name']} returned no entries (feed URL may be wrong)")
            continue

        added_from_feed = 0
        for entry in feed.entries[:8]:
            if added_from_feed >= max_per_feed:
                break

            pub_struct = entry.get("published_parsed") or entry.get("updated_parsed")
            if not pub_struct:
                continue
            pub_dt = datetime(*pub_struct[:6], tzinfo=timezone.utc)
            if pub_dt < cutoff:
                continue

            title = entry.get("title", "")
            link = entry.get("link", "")
            if not title or not link:
                continue

            # Substack feeds usually include the full body in `content` or
            # `summary`. Prefer the longer one — Claude needs material to extract
            # quotable sentences from.
            body = ""
            if entry.get("content"):
                body = entry["content"][0].get("value", "")
            if not body or len(body) < 200:
                body = entry.get("summary", "")
            body = _strip_html(body)[:3000]

            out.append(
                RawItem(
                    source=f"Substack:{feed_meta['name']}",
                    title=title,
                    summary=body,
                    url=link,
                    published=pub_dt.isoformat(),
                    extra={
                        "author": feed_meta["author"],
                        "handle": feed_meta["handle"],
                        "publication": feed_meta["name"],
                    },
                )
            )
            added_from_feed += 1

    return out


if __name__ == "__main__":
    import json
    items = fetch()
    print(f"Total: {len(items)}")
    print(json.dumps([i.to_dict() for i in items], indent=2, ensure_ascii=False))
