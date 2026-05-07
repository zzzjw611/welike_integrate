"""Fetch trending launches from Product Hunt GraphQL API."""
from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone

import requests

from pipeline.fetch import RawItem
from pipeline.config import PH_MIN_VOTES


PH_ENDPOINT = "https://api.producthunt.com/v2/api/graphql"

QUERY = """
query TopLaunches($postedAfter: DateTime!) {
  posts(first: 30, order: VOTES, postedAfter: $postedAfter) {
    edges {
      node {
        name
        tagline
        description
        url
        website
        votesCount
        createdAt
        topics(first: 5) { edges { node { name } } }
        makers { name }
      }
    }
  }
}
"""


def fetch(hours_back: int = 36, min_votes: int | None = None) -> list[RawItem]:
    token = os.environ.get("PH_TOKEN")
    if not token:
        print("[product_hunt] PH_TOKEN not set — skipping")
        return []

    threshold = min_votes if min_votes is not None else PH_MIN_VOTES
    posted_after = (datetime.now(timezone.utc) - timedelta(hours=hours_back)).isoformat()

    try:
        r = requests.post(
            PH_ENDPOINT,
            json={"query": QUERY, "variables": {"postedAfter": posted_after}},
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            timeout=30,
        )
    except requests.RequestException as e:
        print(f"[product_hunt] Network error — skipping: {e}")
        return []

    if r.status_code == 401:
        print("[product_hunt] 401 Unauthorized — PH_TOKEN is not a valid Developer Token. Skipping.")
        return []
    if not r.ok:
        print(f"[product_hunt] HTTP {r.status_code} — skipping. Body: {r.text[:200]}")
        return []

    data = r.json()
    if "errors" in data:
        print(f"[product_hunt] API errors — skipping: {data['errors']}")
        return []

    posts = data.get("data", {}).get("posts", {}).get("edges", [])
    out: list[RawItem] = []
    for edge in posts:
        n = edge["node"]
        if (n.get("votesCount") or 0) < threshold:
            continue
        topics = [t["node"]["name"] for t in n.get("topics", {}).get("edges", [])]
        out.append(
            RawItem(
                source="ProductHunt",
                title=n["name"],
                summary=f"{n.get('tagline','')}\n\n{(n.get('description','') or '')[:400]}",
                url=n.get("website") or n.get("url", ""),
                published=n.get("createdAt"),
                extra={
                    "votes": n.get("votesCount"),
                    "topics": topics,
                },
            )
        )
    return out


if __name__ == "__main__":
    import json
    items = fetch()
    print(json.dumps([i.to_dict() for i in items], indent=2, ensure_ascii=False))
