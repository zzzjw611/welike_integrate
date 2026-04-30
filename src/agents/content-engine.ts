import { BaseAgent } from "./base.js";
import { CONTENT_ENGINE_SYSTEM_PROMPT } from "../prompts/content-engine.js";
import type { GTMContext, ContentEngineOutput } from "../types/context.js";

export class ContentEngineAgent extends BaseAgent {
  constructor() {
    super({
      name: "Content Engine",
      role: "Multi-Platform Content Producer",
      model: "claude-sonnet-4-20250514",
      systemPrompt: CONTENT_ENGINE_SYSTEM_PROMPT,
    });
  }

  async run(context: GTMContext): Promise<GTMContext> {
    if (!context.strategist) {
      throw new Error("Content Engine requires Strategist output. Run Strategist first.");
    }

    const { input, strategist } = context;
    const { messagingFramework, gtmPlan, launchPlaybook } = strategist;

    const userPrompt = `Generate launch content assets for this AI product based on the GTM strategy.

## Product Info
**Name**: ${input.name}
**Description**: ${input.description}

## Messaging Framework
**Headline**: ${messagingFramework.headline}
**Tagline**: ${messagingFramework.tagline}
**Value Propositions**:
${messagingFramework.valuePropositions.map((v) => `- ${v}`).join("\n")}
**Elevator Pitch**: ${messagingFramework.elevatorPitch}

## Positioning
${gtmPlan.positioningStatement}

## Channel Priorities
${gtmPlan.channelPriorities.map((c) => `- ${c.channel} (${c.priority}): ${c.rationale}`).join("\n")}

## Launch Playbook Summary
${launchPlaybook.map((d) => `${d.day}: ${d.tasks.join(", ")}`).join("\n")}

Generate all 6 content assets (Twitter thread, PH listing, Show HN, Landing hero, Launch email, LinkedIn post) as JSON.`;

    const raw = await this.callClaude(userPrompt);
    const contentOutput = this.parseJSON<ContentEngineOutput>(raw);

    return {
      ...context,
      contentEngine: contentOutput,
      metadata: {
        ...context.metadata,
        updatedAt: new Date().toISOString(),
        pipelineStage: "content",
      },
    };
  }
}
