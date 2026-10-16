import { auditLocalResearch } from "@/lib/sniper/research-worker";
export const runtime = "nodejs";
export const maxDuration = 240;
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try { return Response.json({ ok: true, ...await auditLocalResearch() }); }
  catch { return Response.json({ ok: false, error: "Local research audit failed" }, { status: 503 }); }
}
