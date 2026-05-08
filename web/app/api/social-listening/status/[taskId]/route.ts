import { NextResponse } from "next/server";
import { getTask } from "@/lib/social-listening/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/social-listening/status/{taskId}
 *
 * Lightweight polling endpoint — returns just the task lifecycle fields so the
 * frontend progress bar can update without dragging the full result_json over
 * the wire on every poll.
 */
export async function GET(
  _req: Request,
  { params }: { params: { taskId: string } }
) {
  const task = await getTask(params.taskId);
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  return NextResponse.json({
    task_id: task.id,
    status: task.status,
    progress: task.progress,
    message: task.message,
  });
}
