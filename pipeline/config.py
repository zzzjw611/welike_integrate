"""Configuration for the daily pipeline.

Edit this file to tune:
- which X handles to watch for Growth Insight source material
- which keywords count as "AI marketing" relevant
- which companies are in the Daily Case rotation
"""

# Long-form sources for Growth Insight: Substack publications and personal blogs.
# Replaced X scraping after Apify free tier proved unviable in 2026 (X anti-scraping
# changes returned empty results). These growth thinkers' deepest content lives in
# their newsletters anyway — X is just the headlines.
SUBSTACK_FEEDS = [
    {
        "name": "Lenny's Newsletter",
        "author": "Lenny Rachitsky",
        "handle": "@lennysan",
        "url": "https://www.lennysnewsletter.com/feed",
    },
    {
        "name": "Stratechery",
        "author": "Ben Thompson",
        "handle": "@benthompson",
        "url": "https://stratechery.com/feed/",
    },
    {
        "name": "Late Checkout",
        "author": "Greg Isenberg",
        "handle": "@gregisenberg",
        "url": "https://latecheckout.substack.com/feed",
    },
    # Note: 4 feeds (Rundown AI, Every, Marketing Brew, startupideas.substack.com)
    # were removed 2026-04-25 because they returned 404. Late Checkout (above)
    # replaces Greg's old Substack. Add new sources here as you find them — see
    # pipeline/README.md for verification recipe.
]

# Keywords used to filter TechCrunch RSS for relevance.
# Match is case-insensitive, OR semantics. Keep this list tight —
# Claude will do the final curation.
AI_KEYWORDS = [
    "ai", "openai", "anthropic", "claude", "gpt", "gemini", "llm",
    "agent", "perplexity", "mistral",
    "marketing", "advertising", "ads", "campaign", "seo", "aeo",
    "growth", "attribution", "creative", "copywriting", "creator",
    "hubspot", "klaviyo", "salesforce", "shopify", "adobe",
    "meta ads", "google ads", "tiktok ads",
]

# Product Hunt filters — minimum upvote count to be considered.
PH_MIN_VOTES = 50

# Daily Case rotation queue. Pipeline picks the next un-used entry each day.
# Claude writes the case based on its knowledge + any fresh news snippets.
CASE_QUEUE = [
    {"company": "Cursor", "angle": "AI-native PLG: developer-first growth without sales"},
    {"company": "Clay", "angle": "Community-led GTM: template economy + power-user evangelism"},
    {"company": "Perplexity", "angle": "AI search as media: partnerships with publishers as growth"},
    {"company": "HeyGen", "angle": "Creator-led distribution: demos as ads, Chinese-founded US scale"},
    {"company": "Granola", "angle": "Notion-like virality in B2B: shareable artifacts as inbound"},
    {"company": "Attio", "angle": "Reinventing CRM with AI-native data model"},
    {"company": "Linear", "angle": "Opinionated product as marketing: no growth team, premium positioning"},
    {"company": "Vercel", "angle": "DX as marketing: docs, free tier, and community as moat"},
    {"company": "Notion AI", "angle": "Embedded AI inside incumbent product: from feature to wedge"},
    {"company": "Arc Search", "angle": "Mobile-first AI search: how a browser becomes a media brand"},
]
