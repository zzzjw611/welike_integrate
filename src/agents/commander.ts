import type { GTMContext, ProductInput } from "../types/context.js";
import { createInitialContext } from "../types/context.js";
import { ScoutAgent } from "./scout.js";
import { StrategistAgent } from "./strategist.js";
import { ContentEngineAgent } from "./content-engine.js";
import type { BaseAgent } from "./base.js";

export type AgentName = "scout" | "strategist" | "content";

export class GTMCommander {
  private agents: Record<AgentName, BaseAgent>;

  constructor() {
    this.agents = {
      scout: new ScoutAgent(),
      strategist: new StrategistAgent(),
      content: new ContentEngineAgent(),
    };
  }

  getAgent(name: AgentName): BaseAgent {
    return this.agents[name];
  }

  /**
   * Full Pipeline Mode: Scout → Strategist → Content Engine
   * Each agent consumes the previous agent's output.
   */
  async runPipeline(
    input: ProductInput,
    onProgress?: (agent: string, status: "start" | "done") => void
  ): Promise<GTMContext> {
    let context = createInitialContext(input);

    const pipeline: AgentName[] = ["scout", "strategist", "content"];

    for (const agentName of pipeline) {
      const agent = this.agents[agentName];
      onProgress?.(agent.name, "start");
      context = await agent.run(context);
      onProgress?.(agent.name, "done");
    }

    context.metadata.pipelineStage = "complete";
    return context;
  }

  /**
   * Single Agent Mode: Run a specific agent with existing context.
   */
  async runSingleAgent(
    agentName: AgentName,
    input: ProductInput,
    existingContext?: GTMContext
  ): Promise<GTMContext> {
    const context = existingContext || createInitialContext(input);
    const agent = this.agents[agentName];
    return agent.run(context);
  }
}
