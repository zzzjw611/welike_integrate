import { NextRequest } from "next/server";
import { GTMCommander } from "@gtm/agents/commander.js";
import type { ProductInput } from "@gtm/types/context.js";

export const maxDuration = 300; // 5 minutes max for long pipeline runs

export async function POST(req: NextRequest) {
  const input: ProductInput = await req.json();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: Record<string, unknown>) {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      }

      try {
        const commander = new GTMCommander();
        const context = await commander.runPipeline(input, (agent, status) => {
          send(`agent-${status}`, { agent });
        });

        send("complete", context as unknown as Record<string, unknown>);
      } catch (err) {
        send("error", {
          message: err instanceof Error ? err.message : "Pipeline failed",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
