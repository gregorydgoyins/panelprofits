import { NextRequest } from "next/server";
import { createAdminServerClient } from "@/lib/supabase/admin";
import { getNewsStories } from "@/lib/news/feed";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  let isClosed = false;
  let heartbeatTimer: NodeJS.Timeout | null = null;
  let pollTimer: NodeJS.Timeout | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      req.signal.addEventListener("abort", () => {
        isClosed = true;
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        if (pollTimer) clearInterval(pollTimer);
        try {
          controller.close();
        } catch {}
      });

      // 1. Initial Handshake Event
      const initialPayload = JSON.stringify({
        type: "INITIAL_TELEMETRY",
        status: "CONNECTED",
        channel: "LIVE_WIRE_PUSH",
        timestamp: new Date().toISOString(),
        networkFeedsActive: 240,
      });
      controller.enqueue(encoder.encode(`event: telemetry\ndata: ${initialPayload}\n\n`));

      // 2. Fetch and send the current top stories immediately on connect
      try {
        const topStories = await getNewsStories(10);
        if (topStories && topStories.length > 0) {
          const snapshotEvent = JSON.stringify({
            type: "STORIES_SNAPSHOT",
            count: topStories.length,
            stories: topStories,
          });
          controller.enqueue(encoder.encode(`event: stories\ndata: ${snapshotEvent}\n\n`));
        }
      } catch (err) {
        console.error("[SSE Wire] Initial snapshot fetch error:", err);
      }

      // 3. Heartbeat keeping proxies and client sockets alive
      heartbeatTimer = setInterval(() => {
        if (isClosed) return;
        try {
          controller.enqueue(encoder.encode(`: ping ${Date.now()}\n\n`));
        } catch {
          isClosed = true;
          if (heartbeatTimer) clearInterval(heartbeatTimer);
        }
      }, 15000);

      // 4. Polling query for newest incoming stories
      let lastSeenTimestamp = new Date(Date.now() - 60000).toISOString();
      pollTimer = setInterval(async () => {
        if (isClosed) return;

        try {
          const db = createAdminServerClient();
          const { data: newRows, error } = await db
            .from("pp_news_stories")
            .select("id,source,source_url,category,headline,author,summary,url,image_url,published_at,ingested_at,archived_at")
            .gt("ingested_at", lastSeenTimestamp)
            .order("ingested_at", { ascending: false })
            .limit(5);

          if (!error && newRows && newRows.length > 0) {
            lastSeenTimestamp = String(newRows[0].ingested_at);
            const liveEvent = JSON.stringify({
              type: "NEW_STORIES",
              count: newRows.length,
              stories: newRows.map((r) => ({
                id: String(r.id),
                source: String(r.source),
                sourceUrl: String(r.source_url),
                category: r.category,
                headline: String(r.headline),
                author: r.author ? String(r.author) : null,
                summary: r.summary ? String(r.summary) : null,
                url: String(r.url),
                imageUrl: r.image_url ? String(r.image_url) : null,
                publishedAt: r.published_at ? String(r.published_at) : null,
                ingestedAt: String(r.ingested_at),
                archivedAt: r.archived_at ? String(r.archived_at) : null,
              })),
            });

            if (!isClosed) {
              controller.enqueue(encoder.encode(`event: news\ndata: ${liveEvent}\n\n`));
            }
          }
        } catch (pollErr) {
          console.error("[SSE Wire] Polling iteration error:", pollErr);
        }
      }, 30000);
    },
    cancel() {
      isClosed = true;
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      if (pollTimer) clearInterval(pollTimer);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
