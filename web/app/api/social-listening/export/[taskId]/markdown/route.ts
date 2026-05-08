/**
 * GET /api/social-listening/export/{taskId}/markdown
 *
 * Stream the strategy report as a downloadable .md file. Mirrors
 * /api/export/{task_id}/markdown in backend/main.py.
 *
 * Returns 400 if the report hasn't been generated yet — UX: the user must
 * click "Generate Strategy Report" first, which calls
 * POST /api/social-listening/report/{taskId}/generate.
 */
import { NextResponse } from "next/server";
import { getTask } from "@/lib/social-listening/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { taskId: string } }
) {
  const task = await getTask(params.taskId);
  if (!task || task.status !== "done") {
    return NextResponse.json(
      { error: "Report not ready" },
      { status: 404 }
    );
  }
  const md =
    task.report_markdown ||
    (task.result_json as { report_markdown?: string } | null)?.report_markdown ||
    "";
  if (!md) {
    return NextResponse.json(
      { error: "请先在页面上点击「确认生成」生成报告" },
      { status: 400 }
    );
  }
  const querySlug = (task.query || "report")
    .slice(0, 20)
    .replace(/\s+/g, "_")
    .replace(/[^A-Za-z0-9_\-]/g, "");
  const filename = `welike_report_${querySlug || "report"}.md`;
  return new NextResponse(md, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
