import { NextRequest, NextResponse } from "next/server";
import { createAdminServerClient } from "@/lib/supabase/admin";
import { queryPineconeVectorIndex } from "@/lib/wiki/pinecone";
import { findNewsEntities } from "@/lib/news/entities";
import { analyzeStoryCatalyst } from "@/lib/news/catalyst";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10), 1), 50);

  if (!q) {
    return NextResponse.json({
      query: "",
      total: 0,
      stories: [],
    });
  }

  const db = createAdminServerClient();

  try {
    // 1. Vector index expansion lookup for related semantic lore/entities
    let vectorMatches: Awaited<ReturnType<typeof queryPineconeVectorIndex>> = [];
    try {
      vectorMatches = await queryPineconeVectorIndex(q, 3);
    } catch {
      // Graceful fallback if vector index is temporarily unreachable
    }

    // 2. Direct full-text keyword match in pp_news_stories
    const sanitizedQ = q.replace(/[%_]/g, "");
    const { data: dbStories, error } = await db
      .from("pp_news_stories")
      .select("id,source,source_url,category,headline,author,summary,url,image_url,published_at,ingested_at,archived_at")
      .or(`headline.ilike.%${sanitizedQ}%,summary.ilike.%${sanitizedQ}%`)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) {
      console.error("[News Search API] Supabase query error:", error.message);
      return NextResponse.json({ error: "Failed to execute search query" }, { status: 500 });
    }

    const rows = dbStories || [];

    // 3. Score and enrich results with entity & catalyst metadata
    const enriched = rows.map((story) => {
      const entities = findNewsEntities(story.headline, story.summary);
      const catalyst = analyzeStoryCatalyst(story.headline, story.summary || "");

      // Calculate relevance score
      const qLower = q.toLowerCase();
      let relevance = 0;
      if (story.headline.toLowerCase().includes(qLower)) relevance += 10;
      if (story.summary?.toLowerCase().includes(qLower)) relevance += 5;
      if (catalyst.affectedComics.some((c) => c.title.toLowerCase().includes(qLower) || c.ticker.toLowerCase().includes(qLower))) {
        relevance += 8;
      }

      return {
        id: String(story.id),
        headline: String(story.headline),
        summary: story.summary ? String(story.summary) : null,
        source: String(story.source),
        sourceUrl: String(story.source_url),
        category: story.category,
        author: story.author ? String(story.author) : null,
        url: String(story.url),
        imageUrl: story.image_url ? String(story.image_url) : null,
        publishedAt: story.published_at ? String(story.published_at) : null,
        relevanceScore: relevance,
        catalyst: {
          type: catalyst.catalystType,
          label: catalyst.catalystLabel,
          impact: catalyst.marketImpact,
          score: catalyst.impactScore,
          affectedComics: catalyst.affectedComics,
        },
        matchedEntities: entities.slice(0, 5).map((e) => ({
          term: e.term,
          type: e.type,
          ticker: e.ticker,
          wikiPath: e.wikiPath,
        })),
      };
    });

    // Sort by highest relevance score first, then publishedAt
    enriched.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return NextResponse.json({
      query: q,
      total: enriched.length,
      semanticLoreContext: vectorMatches.map((v) => ({
        name: v.name,
        type: v.type,
        ticker: v.ticker,
        score: v.score,
      })),
      stories: enriched,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[News Search API] Exception:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
