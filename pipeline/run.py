"""End-to-end pipeline orchestrator.

Fetches raw data from TechCrunch, Product Hunt, X; picks the next Daily Case
company from the rotation queue; asks Claude to generate a daily issue draft;
writes it to `content/drafts/YYYY-MM-DD.draft.md` for human review.

Usage:
    python -m pipeline.run                 # target date = today in America/Los_Angeles
    python -m pipeline.run --date 2026-05-01
    python -m pipeline.run --dry-run       # fetch only, skip Claude call
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

# Make `pipeline.*` imports work whether invoked via `python pipeline/run.py` or
# `python -m pipeline.run`.
_REPO_ROOT = Path(__file__).resolve().parent.parent
if str(_REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPO_ROOT))

# Load pipeline/.env for local runs. GitHub Actions injects env vars directly, so
# dotenv is a no-op there.
try:
    from dotenv import load_dotenv
    # override=True so an empty/inherited env var doesn't shadow the .env value.
    load_dotenv(_REPO_ROOT / "pipeline" / ".env", override=True)
except ImportError:
    pass

from pipeline.config import CASE_QUEUE
from pipeline.fetch import techcrunch, product_hunt, substack, qbitai
from pipeline.draft.generate import generate_draft


REPO_ROOT = _REPO_ROOT
# WeLike integration: content lives under web/content so the Next.js app
# can read it via process.cwd()/content (lib/ai-marketer-news.ts:71).
DRAFT_DIR = REPO_ROOT / "web" / "content" / "drafts"
CONTENT_DIR = REPO_ROOT / "web" / "content"


def _today_pt() -> str:
    return datetime.now(ZoneInfo("America/Los_Angeles")).date().isoformat()


def _next_issue_number() -> int:
    """Count published issues in content/*.md (excluding drafts) and add 1."""
    if not CONTENT_DIR.exists():
        return 1
    count = sum(
        1 for p in CONTENT_DIR.glob("*.md") if p.parent == CONTENT_DIR
    )
    return count + 1


def _pick_case(target_date: str) -> dict:
    """Rotate the Daily Case queue deterministically based on date ordinal."""
    ordinal = datetime.strptime(target_date, "%Y-%m-%d").toordinal()
    return CASE_QUEUE[ordinal % len(CASE_QUEUE)]


def main() -> int:
    parser = argparse.ArgumentParser(description="AI Marketer News daily pipeline")
    parser.add_argument(
        "--date",
        default=os.environ.get("TARGET_DATE") or _today_pt(),
        help="Target publish date YYYY-MM-DD (default: today in America/Los_Angeles)",
    )
    parser.add_argument(
        "--issue",
        type=int,
        default=None,
        help="Override issue number (default: auto-increment from existing content/)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Fetch raw data only; don't call Claude",
    )
    parser.add_argument(
        "--out",
        default=None,
        help="Output path (default: content/drafts/YYYY-MM-DD.draft.md)",
    )
    args = parser.parse_args()

    target_date = args.date
    issue_number = args.issue if args.issue else _next_issue_number()
    case = _pick_case(target_date)

    print(f"[pipeline] target_date={target_date} issue={issue_number}")
    print(f"[pipeline] case={case['company']} angle={case['angle']}")
    print(f"[pipeline] started_utc={datetime.now(timezone.utc).isoformat()}")

    # --- Fetch raw data ------------------------------------------------------
    print("\n[fetch] TechCrunch...")
    tc_items = techcrunch.fetch()
    print(f"[fetch] TechCrunch: {len(tc_items)} items")

    print("\n[fetch] 量子位 (QbitAI)...")
    qb_items = qbitai.fetch()
    print(f"[fetch] 量子位: {len(qb_items)} items")

    print("\n[fetch] Product Hunt...")
    ph_items = product_hunt.fetch()
    print(f"[fetch] Product Hunt: {len(ph_items)} items")

    print("\n[fetch] Substack / blog feeds...")
    substack_items = substack.fetch()
    print(f"[fetch] Substack: {len(substack_items)} items")

    raw_data = {
        "target_date": target_date,
        "techcrunch": [i.to_dict() for i in tc_items],
        "qbitai": [i.to_dict() for i in qb_items],
        "product_hunt": [i.to_dict() for i in ph_items],
        "substack": [i.to_dict() for i in substack_items],
    }

    if args.dry_run:
        print("\n[dry-run] Raw data:")
        print(json.dumps(raw_data, ensure_ascii=False, indent=2))
        return 0

    total_raw = len(tc_items) + len(qb_items) + len(ph_items) + len(substack_items)
    if total_raw == 0:
        print(
            "\n[pipeline] No raw data fetched from any source. "
            "Check APIFY_TOKEN / PH_TOKEN / network. Aborting.",
            file=sys.stderr,
        )
        return 1

    # --- Generate draft ------------------------------------------------------
    print("\n[draft] Calling Claude...")
    draft_md = generate_draft(
        raw_data=raw_data,
        target_date=target_date,
        issue_number=issue_number,
        case_company=case["company"],
        case_angle=case["angle"],
    )

    # --- Write draft ---------------------------------------------------------
    out_path = Path(args.out) if args.out else DRAFT_DIR / f"{target_date}.draft.md"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(draft_md, encoding="utf-8")
    print(f"\n[done] Draft written: {out_path}")
    print(f"[done] Review, then run: python -m pipeline.publish {target_date}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
