import { BaseAgent } from "./base.js";
import { STRATEGIST_SYSTEM_PROMPT } from "../prompts/strategist.js";
import type { GTMContext, StrategistOutput } from "../types/context.js";

export class StrategistAgent extends BaseAgent {
  constructor() {
    super({
      name: "Strategist",
      role: "Launch & GTM Planner",
      model: "claude-opus-4-20250514",
      systemPrompt: STRATEGIST_SYSTEM_PROMPT,
    });
  }

  async run(context: GTMContext): Promise<GTMContext> {
    if (!context.scout) {
      throw new Error("Strategist requires Scout output. Run Scout first.");
    }

    const { input, scout } = context;

    const userPrompt = `Based on the following product info and competitive intelligence, create a complete GTM plan.

## Product Info
**Name**: ${input.name}
**Description**: ${input.description}
**Category**: ${input.category || "AI Product"}
**Stage**: ${input.stage || "Early stage"}
**Target Audience**: ${input.targetAudience || "Not specified"}

## Competitive Intelligence (from Scout)
**Product Summary**: ${scout.productSummary}

**Competitors**:
${scout.competitors.map((c) => `- ${c.name} (${c.url}): ${c.positioning}`).join("\n")}

**Market Trends**:
${scout.marketTrends.map((t) => `- ${t}`).join("\n")}

**User Personas**:
${scout.userPersonas.map((p) => `- ${p.name} (${p.role}): Pain points: ${p.painPoints.join(", ")}`).join("\n")}

**Opportunities**: ${scout.opportunities.join("; ")}
**Threats**: ${scout.threats.join("; ")}

Produce the complete GTM strategy JSON.`;

    const raw = await this.callClaude(userPrompt);
    const strategistOutput = this.parseJSON<StrategistOutput>(raw);

    return {
      ...context,
      strategist: strategistOutput,
      metadata: {
        ...context.metadata,
        updatedAt: new Date().toISOString(),
        pipelineStage: "strategist",
      },
    };
  }
}
