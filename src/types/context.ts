/**
 * GTM Context Object — the shared state that flows between agents.
 * Each agent reads upstream data and populates its own section.
 */

// ---- Input ----
export interface ProductInput {
  name: string;
  url?: string;
  description: string;
  category?: string; // e.g. "AI DevTool", "AI SaaS", "Open-source AI"
  stage?: string; // e.g. "pre-seed", "seed", "series-a"
  targetAudience?: string;
  language?: "en" | "cn" | "both";
}

// ---- Scout Output ----
export interface Competitor {
  name: string;
  url: string;
  positioning: string;
  strengths: string[];
  weaknesses: string[];
  pricing?: string;
}

export interface UserPersona {
  name: string;
  role: string;
  painPoints: string[];
  goals: string[];
  channels: string[]; // where they hang out
}

export interface ScoutOutput {
  productSummary: string;
  competitors: Competitor[];
  marketTrends: string[];
  userPersonas: UserPersona[];
  opportunities: string[];
  threats: string[];
}

// ---- Strategist Output ----
export interface MessagingFramework {
  headline: string;
  tagline: string;
  valuePropositions: string[];
  objectionHandling: { objection: string; response: string }[];
  elevatorPitch: string;
}

export interface ChannelPriority {
  channel: string;
  priority: "high" | "medium" | "low";
  rationale: string;
  estimatedImpact: string;
}

export interface LaunchDayPlan {
  day: string; // e.g. "Day 1", "Day 2"
  tasks: string[];
}

export interface StrategistOutput {
  gtmPlan: {
    overview: string;
    targetSegments: string[];
    positioningStatement: string;
    channelPriorities: ChannelPriority[];
  };
  messagingFramework: MessagingFramework;
  launchPlaybook: LaunchDayPlan[];
  thirtyDayPlan: string[];
  sixtyDayPlan: string[];
  ninetyDayPlan: string[];
}

// ---- Content Engine Output ----
export interface ContentAsset {
  platform: string;
  type: string; // e.g. "launch-thread", "blog-post", "ph-listing"
  title?: string;
  content: string;
}

export interface ContentEngineOutput {
  assets: ContentAsset[];
}

// ---- Full GTM Context ----
export interface GTMContext {
  input: ProductInput;
  scout?: ScoutOutput;
  strategist?: StrategistOutput;
  contentEngine?: ContentEngineOutput;
  metadata: {
    createdAt: string;
    updatedAt: string;
    pipelineStage: "input" | "scout" | "strategist" | "content" | "complete";
  };
}

export function createInitialContext(input: ProductInput): GTMContext {
  const now = new Date().toISOString();
  return {
    input,
    metadata: {
      createdAt: now,
      updatedAt: now,
      pipelineStage: "input",
    },
  };
}
