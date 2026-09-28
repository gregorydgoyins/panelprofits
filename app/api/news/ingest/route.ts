import { NextResponse } from "next/server";
import { fetchAllWireStories } from "@/lib/news/wire-apis";
import { createAdminServerClient } from "@/lib/supabase/admin";

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

    const drafts = await fetchAllWireStories();
    const supabase = createAdminServerClient();

    let inserted = 0;
    let errors = 0;

    for (const draft of drafts) {
      const { error } = await supabase.from("pp_news_stories").upsert(
        {
          story_key: draft.story_key,
          source: draft.source,
          source_url: draft.source_url,
          category: draft.category,
          headline: draft.headline,
          summary: draft.summary,
          url: draft.url,
          image_url: draft.image_url,
          published_at: draft.published_at || new Date().toISOString(),
          ingested_at: new Date().toISOString(),
          author: draft.author,
        },
        { onConflict: "story_key" }
      );

      if (error) {
        errors++;
      } else {
        inserted++;
      }
    }

    return NextResponse.json({
      status: "success",
      totalDrafts: drafts.length,
      persisted: inserted,
      errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
