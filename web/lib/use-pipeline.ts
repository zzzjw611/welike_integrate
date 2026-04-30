"use client";
import { useState, useCallback } from "react";

export type AgentStatus = "pending" | "running" | "done";
export type PipelineStatus = "idle" | "running" | "complete" | "error";

export interface PipelineState {
  status: PipelineStatus;
  agents: Record<string, AgentStatus>;
  result: Record<string, unknown> | null;
  error: string | null;
}

const INITIAL_AGENTS: Record<string, AgentStatus> = {
  Scout: "pending",
  Strategist: "pending",
  "Content Engine": "pending",
};

export function usePipeline() {
  const [state, setState] = useState<PipelineState>({
    status: "idle",
    agents: { ...INITIAL_AGENTS },
    result: null,
    error: null,
  });

  const runPipeline = useCallback(async (input: Record<string, unknown>) => {
    setState({
      status: "running",
      agents: { ...INITIAL_AGENTS },
      result: null,
      error: null,
    });

    try {
      const response = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const block of lines) {
          const eventMatch = block.match(/^event:\s*(.+)$/m);
          const dataMatch = block.match(/^data:\s*(.+)$/m);
          if (!eventMatch || !dataMatch) continue;

          const event = eventMatch[1].trim();
          const data = JSON.parse(dataMatch[1]);

          if (event === "agent-start") {
            setState((prev) => ({
              ...prev,
              agents: { ...prev.agents, [data.agent]: "running" },
            }));
          } else if (event === "agent-done") {
            setState((prev) => ({
              ...prev,
              agents: { ...prev.agents, [data.agent]: "done" },
            }));
          } else if (event === "complete") {
            setState((prev) => ({
              ...prev,
              status: "complete",
              result: data,
            }));
          } else if (event === "error") {
            setState((prev) => ({
              ...prev,
              status: "error",
              error: data.message,
            }));
          }
        }
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: err instanceof Error ? err.message : "Connection failed",
      }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      status: "idle",
      agents: { ...INITIAL_AGENTS },
      result: null,
      error: null,
    });
  }, []);

  return { state, runPipeline, reset };
}
