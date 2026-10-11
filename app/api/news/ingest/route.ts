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
 * Vercel Cron calls this with `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is set on the
 * project, and always with the `vercel-cron/1.0` user agent. (It does not send `x-vercel-cron`.)
 * With a secret configured, only the Bearer token is accepted. With none configured, the cron
 * user agent is accepted; ingestion is an idempotent upsert, so that is the only fallback.
 */
function isAuthorized(request: Request): boolean {
  const secrets = [process.env.CRON_SECRET, process.env.GPA_INGESTION_SECRET].filter((s): s is string => Boolean(s));
  const bearer = (request.headers.get("authorization") || "").replace(/^Bearer /, "");
  if (bearer && secrets.includes(bearer)) return true;
  if (secrets.length === 0) return (request.headers.get("user-agent") || "").startsWith("vercel-cron/");
  return false;
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
