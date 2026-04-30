export type Lang = 'en' | 'zh';
export type Section = 'daily_brief' | 'growth_insight' | 'launch_radar' | 'daily_case';
export type CandidateStatus = 'pending' | 'approved' | 'rejected' | 'published';

export interface ArticleExtra {
  author?: string;
  context_en?: string;
  context_zh?: string;
  platform_data?: string;
  positioning_en?: string;
  positioning_zh?: string;
  breakdown_en?: string;
  breakdown_zh?: string;
}

export interface Article {
  id: string;
  date: string;
  section: Section;
  order_in_section: number;
  title_en: string;
  title_zh: string;
  content_en: string;
  content_zh: string;
  so_what_en?: string | null;
  so_what_zh?: string | null;
  sources: string[];
  extra: ArticleExtra;
  published_at?: string | null;
  created_at: string;
}

export interface User {
  id: string;
  email?: string | null;
  language: Lang;
  created_at: string;
}

export interface TelegramSubscription {
  user_id: string;
  telegram_chat_id: string;
  language: Lang;
  timezone: string;
  push_time: string;
  is_active: boolean;
}

export interface AiScore {
  impact: number;
  novelty: number;
  actionability: number;
  heat: number;
}

export interface ContentCandidate {
  id: string;
  source_url: string;
  raw_content: string;
  ai_score: AiScore;
  suggested_section?: Section | null;
  ai_draft_en: string;
  status: CandidateStatus;
  created_at: string;
}

export interface DailyContent {
  date: string;
  daily_brief: Article[];
  growth_insight: Article[];
  launch_radar: Article[];
  daily_case: Article[];
}
