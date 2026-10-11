import { NextResponse } from "next/server";
import { executeMasterNewsIngestion } from "@/lib/news/ingestion-engine";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow background ingestion execution time

export async function GET(request: Request) {
  return handleIngest(request);
}

export async function POST(request: Request) {
  return handleIngest(request);
}

/**
 * Vercel Cron always sends the `vercel-cron/1.0` user agent, and sends `Authorization: Bearer $CRON_SECRET`
 * only when CRON_SECRET is set on the project. Accept either: the Bearer token (CRON_SECRET or
 * GPA_INGESTION_SECRET) for manual/CI calls, or the cron user agent. Ingestion is an idempotent upsert of
 * public feeds, so a spoofed user agent can only trigger a normal ingest run.
 */
function isAuthorized(request: Request): boolean {
  const secrets = [process.env.CRON_SECRET, process.env.GPA_INGESTION_SECRET].filter((s): s is string => Boolean(s));
  const bearer = (request.headers.get("authorization") || "").replace(/^Bearer /, "");
  if (bearer && secrets.includes(bearer)) return true;
  return (request.headers.get("user-agent") || "").startsWith("vercel-cron/");
}

async function handleIngest(request: Request) {
  if (!isAuthorized(request) && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await executeMasterNewsIngestion();
    const degraded = result.totalIngested === 0 || result.feedFailures.length > 0;
    return NextResponse.json(
      {
        status: result.totalIngested === 0 ? "nothing_ingested" : degraded ? "partial" : "success",
        totalIngested: result.totalIngested,
        errors: result.totalErrors,
        feedsTried: result.feedsTried,
        feedFailures: result.feedFailures.slice(0, 50),
        newestPublishedAt: result.newestPublishedAt,
        breakdown: result.breakdown,
        timestamp: new Date().toISOString(),
      },
      // A run that ingests nothing must not look green in the cron log.
      { status: result.totalIngested === 0 ? 502 : 200 }
    );
  } catch (error) {
    return NextResponse.json({ status: "error", error: (error as Error).message }, { status: 500 });
  }
}
