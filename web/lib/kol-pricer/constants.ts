import { Domain } from "./types";

export const SCORE_WEIGHTS = {
  influenceDepth: 0.20,
  followerQuality: 0.40,
  contentStability: 0.25,
  engagementQuality: 0.15,
} as const;

export const BASE_CPM = 5;
export const MAX_CPM_BONUS = 55;

export const FOLLOWER_SCALE_TIERS: [number, number][] = [
  [100_000, 100],
  [50_000, 80],
  [20_000, 60],
  [10_000, 40],
  [0, 20],
];

export const LISTED_RATIO_TIERS: [number, number][] = [
  [5, 100],
  [3, 75],
  [1, 50],
  [0.5, 25],
  [0, 10],
];

export const FOLLOWER_QUALITY_TIERS: [number, number][] = [
  [2.0, 100],
  [1.0, 75],
  [0.5, 50],
  [0.3, 38],
  [0.1, 28],
  [0.05, 20],
  [0, 10],
];

export const CONTENT_STABILITY_BREAKPOINTS = [
  { maxCV: 0.3, score: 100 },
  { maxCV: 0.5, score: 75 },
  { maxCV: 0.8, score: 50 },
  { maxCV: 1.2, score: 30 },
  { maxCV: Infinity, score: 10 },
] as const;

export const CONTENT_STABILITY_CV_WEIGHTS = {
  intervalCV: 0.4,
  impressionCV: 0.6,
} as const;

export const ENGAGEMENT_QUALITY_TIERS: [number, number][] = [
  [30, 100],
  [20, 80],
  [10, 60],
  [5, 40],
  [0, 20],
];

export const ENGAGEMENT_WEIGHTS = {
  likes: 1,
  replies: 3,
  retweets: 2,
  quotes: 4,
  bookmarks: 2,
} as const;

export const TIME_DECAY_WEIGHTS: { maxDays: number; weight: number }[] = [
  { maxDays: 7, weight: 1.0 },
  { maxDays: 14, weight: 0.8 },
  { maxDays: 30, weight: 0.6 },
  { maxDays: Infinity, weight: 0.4 },
];

export const DOMAIN_FACTOR_MAP: Record<string, number> = {
  "crypto:defi": 1.3,
  "crypto:layer1": 1.3,
  "crypto:layer2": 1.3,
  "crypto:layer1l2": 1.3,
  "crypto:institutional": 1.3,
  "crypto:nft": 1.2,
  "crypto:gaming": 1.2,
  "crypto:memecoin": 1.2,
  "ai:llm": 1.3,
  "ai:basemodel": 1.3,
  "ai:aiinfra": 1.3,
  "ai:infra": 1.3,
  "ai:application": 1.2,
  "ai:app": 1.2,
  "ai:saas": 1.2,
  "ai:tools": 1.2,
  "finance:institutional": 1.3,
  "finance:tradfi": 1.3,
  "finance:macro": 1.3,
  "finance:retail": 1.1,
  "finance:personalfinance": 1.1,
  "finance:personal": 1.1,
  "business:startup": 1.2,
  "business:saas": 1.2,
  "business:b2b": 1.2,
  "tech:general": 1.2,
  "tech:developer": 1.2,
  "tech:dev": 1.2,
  "entertainment:entertainment": 1.0,
  "entertainment:lifestyle": 1.0,
  "entertainment:culture": 1.0,
  "other:other": 1.0,
};

export const DOMAIN_DEFAULT_MULTIPLIERS: Record<Domain, number> = {
  crypto: 1.3,
  ai: 1.3,
  finance: 1.3,
  business: 1.2,
  tech: 1.2,
  entertainment: 1.0,
  other: 1.0,
};

export const DOMAIN_LABELS: Record<Domain, string> = {
  crypto: "Crypto / Web3",
  ai: "AI / Machine Learning",
  finance: "Finance",
  business: "Business / SaaS",
  tech: "Tech / Developer",
  entertainment: "Entertainment",
  other: "Other",
};

export const IDENTITY_MULTIPLIERS: Record<string, number> = {
  Builder: 1.30,
  KOL: 1.10,
  "Content Creator": 1.00,
};

export const CREDIBILITY_TIERS: [number, number][] = [
  [85, 1.10],
  [70, 1.00],
  [55, 0.75],
  [40, 0.50],
  [0, 0.25],
];

export const RELEVANCE_TIERS: [number, number][] = [
  [85, 1.10],
  [70, 1.00],
  [55, 0.75],
  [40, 0.55],
  [0, 0.30],
];

export const SCARCITY_TIERS: [number, number][] = [
  [50, 0.70],
  [30, 0.85],
  [15, 1.00],
  [5, 1.10],
  [0, 1.20],
];

export const AD_HASHTAGS = [
  "ad",
  "sponsored",
  "partnership",
  "paid",
  "collab",
  "promotion",
  "promo",
];

export const TRIM_COUNT = 3;
export const IQR_MULTIPLIER = 1.5;

export const PRICE_RANGE_LOW = 0.8;
export const PRICE_RANGE_HIGH = 1.2;

export const RATE_LIMIT_WINDOW_MS = 60_000;
export const RATE_LIMIT_MAX = 5;
export const X_API_TIMEOUT_MS = 30_000;
