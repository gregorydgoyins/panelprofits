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

async function handleIngest(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const secretParam = new URL(request.url).searchParams.get("secret");
    const isCron = request.headers.get("x-vercel-cron") === "1";

    const validSecret =
      process.env.GPA_INGESTION_SECRET ||
      process.env.CRON_SECRET ||
      "97a3ee5c9402aded58a325a5ce75a107c4aaa15f93e39d98f616632c05b706b9";

    const isAuthorized =
      isCron ||
      secretParam === validSecret ||
      authHeader === `Bearer ${validSecret}`;

    if (!isAuthorized && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await executeMasterNewsIngestion();

    return NextResponse.json({
      status: "success",
      totalIngested: result.totalIngested,
      errors: result.totalErrors,
      breakdown: result.breakdown,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
