"""Promote a reviewed draft to a published issue.

Usage:
    python -m pipeline.publish 2026-04-25
    python -m pipeline.publish 2026-04-25 --force   # overwrite existing published file
"""
from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
# WeLike integration: content lives under web/content (see pipeline/run.py).
DRAFT_DIR = REPO_ROOT / "web" / "content" / "drafts"
CONTENT_DIR = REPO_ROOT / "web" / "content"


def main() -> int:
    parser = argparse.ArgumentParser(description="Publish a reviewed draft")
    parser.add_argument("date", help="YYYY-MM-DD")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite the published file if it already exists",
    )
    args = parser.parse_args()

    draft_path = DRAFT_DIR / f"{args.date}.draft.md"
    published_path = CONTENT_DIR / f"{args.date}.md"

    if not draft_path.exists():
        print(f"[publish] Draft not found: {draft_path}", file=sys.stderr)
        return 1

    if published_path.exists() and not args.force:
        print(
            f"[publish] Published file already exists: {published_path}\n"
            f"[publish] Pass --force to overwrite.",
            file=sys.stderr,
        )
        return 1

    shutil.move(str(draft_path), str(published_path))
    print(f"[publish] Moved draft to: {published_path}")
    print("[publish] Next: git add web/content/... && git commit && git push (Vercel deploys)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
