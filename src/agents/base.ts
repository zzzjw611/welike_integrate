import Anthropic from "@anthropic-ai/sdk";
import type { GTMContext } from "../types/context.js";

export interface AgentConfig {
  name: string;
  role: string;
  model: "claude-sonnet-4-20250514" | "claude-opus-4-20250514";
  systemPrompt: string;
}

export abstract class BaseAgent {
  protected client: Anthropic;
  protected config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
    this.client = new Anthropic();
  }

  get name() {
    return this.config.name;
  }

  get role() {
    return this.config.role;
  }

  protected async callClaude(userPrompt: string): Promise<string> {
    const response = await this.client.messages.create({
      model: this.config.model,
      max_tokens: 8192,
      system: this.config.systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error(`${this.config.name}: No text response from Claude`);
    }
    return textBlock.text;
  }

  protected parseJSON<T>(raw: string): T {
    // Extract JSON from markdown code blocks if present
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1].trim() : raw.trim();
    return JSON.parse(jsonStr) as T;
  }

  abstract run(context: GTMContext): Promise<GTMContext>;
}
