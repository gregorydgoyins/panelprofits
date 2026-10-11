/**
 * Live shock map: the last 30 days of news become events, which propagate across the entity graph.
 * Recomputed on every cache refresh, so each new story reprices the instruments downstream of the entities it names.
 */
import { createAdminServerClient } from "@/lib/supabase/admin";
import { createCachedQuery } from "@/lib/cache/wrapper";
import { eventsFromArticles, propagate, type ShockMap } from "./shock-propagation";

async function fetchShocksRaw(): Promise<ShockMap> {
  const supabase = createAdminServerClient();
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const { data } = await supabase
    .from("news_articles")
    .select("id,headline,summary,url,published_at")
    .gte("published_at", since)
    .order("published_at", { ascending: false })
    .limit(2000);
  return propagate(eventsFromArticles((data ?? []) as any[]), Date.now());
}

export const getShocks = createCachedQuery(fetchShocksRaw, "asset-shocks", {
  ttlSeconds: 300,
  staleWhileRevalidateSeconds: 1800,
  tags: ["assets", "news"],
});
