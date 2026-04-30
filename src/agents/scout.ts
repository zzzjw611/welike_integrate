import { BaseAgent } from "./base.js";
import { SCOUT_SYSTEM_PROMPT } from "../prompts/scout.js";
import type { GTMContext, ScoutOutput } from "../types/context.js";

export class ScoutAgent extends BaseAgent {
  constructor() {
    super({
      name: "Scout",
      role: "Market & Competitive Intelligence",
      model: "claude-sonnet-4-20250514",
      systemPrompt: SCOUT_SYSTEM_PROMPT,
    });
  }

  async run(context: GTMContext): Promise<GTMContext> {
    const { input } = context;

    const userPrompt = `Analyze this AI product and produce a competitive intelligence report:

**Product Name**: ${input.name}
**URL**: ${input.url || "N/A"}
**Description**: ${input.description}
**Category**: ${input.category || "AI Product"}
**Stage**: ${input.stage || "Early stage"}
**Target Audience**: ${input.targetAudience || "Not specified"}
**Language Market**: ${input.language || "en"}

Produce the full competitive intelligence JSON report.`;

    const raw = await this.callClaude(userPrompt);
    const scoutOutput = this.parseJSON<ScoutOutput>(raw);

    return {
      ...context,
      scout: scoutOutput,
      metadata: {
        ...context.metadata,
        updatedAt: new Date().toISOString(),
        pipelineStage: "scout",
      },
    };
  }
}
