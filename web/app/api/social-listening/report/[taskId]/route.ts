import { NextResponse } from "next/server";
import { getTask, initSchemaOnce } from "@/lib/social-listening/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/social-listening/report/{taskId}
 *
 * Returns the full result payload that the frontend renders into the
 * dashboard (tweets / topics / sentiment counts / report_markdown). Errors
 * if the task is still pending — frontend polls /status until status='done'
 * before calling this.
 */
export async function GET(
  _req: Request,
  { params }: { params: { taskId: string } }
) {
  let task;
  try {
    await initSchemaOnce();
    task = await getTask(params.taskId);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  if (task.status !== "done") {
    return NextResponse.json(
      { error: "Report not ready yet", status: task.status, progress: task.progress },
      { status: 400 }
    );
  }
  // result_json carries report_status / report_markdown which are written by
  // /api/social-listening/report/[taskId]/generate. Merge them in fresh from
  // the columns so the latest report shows up without needing the result_json
  // to be rewritten on every report generation.
  const result = (task.result_json as Record<string, unknown> | null) || {};
  return NextResponse.json({
    ...result,
    report_markdown: task.report_markdown ?? (result.report_markdown ?? ""),
    report_status:
      task.report_status && task.report_status !== "idle"
        ? task.report_status
        : (result.report_status as string | undefined) ?? "idle",
  });
}
