import { createAdminServerClient } from "@/lib/supabase/admin";
import { searchEbaySold, type EbaySoldResult } from "./ebay-sold";

export interface EbayHistoryResult extends EbaySoldResult { provider: string; rawRecords?: Record<string, any>[]; hasMore?: boolean }
const cache = new Map<string, { at: number; result: Promise<EbayHistoryResult> }>();
export function historyQueryKey(query: string) {
  return query.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/** Page reads never acquire a vendor lookup or reuse a rendered-response cache. */
export async function readCompletedEbaySales(query: string): Promise<EbayHistoryResult> {
  const { data: saved, error } = await createAdminServerClient().from("sniper_ebay_history").select("state,response").eq("query_key", historyQueryKey(query)).abortSignal(AbortSignal.timeout(6000)).maybeSingle();
  if (error) return unavailable("history_store_unavailable", "Stored eBay evidence could not be read. No provider request was made.");
  if (saved?.response) return saved.response as EbayHistoryResult;
  return unavailable(saved ? "history_pending" : "history_not_acquired", saved ? "A separate history import is pending." : "No eBay history has been acquired for this issue. Other source records remain available in the sales ledger.");
}

/** Explicit acquisition entry point, separate from every page/detail read. */
export async function acquireCompletedEbaySales(query: string): Promise<EbayHistoryResult> {
  const queryKey = historyQueryKey(query);
  const hit = cache.get(queryKey);
  if (hit && Date.now() - hit.at < 60000) return hit.result;
  const result = readSavedOrFetch(query, queryKey);
  cache.set(queryKey, { at: Date.now(), result });
  if (cache.size > 100) cache.delete(cache.keys().next().value!);
  const value = await result;
  if (!value.available) cache.delete(queryKey);
  return value;
}

function unavailable(code: string, message: string): EbayHistoryResult {
  return { provider: "compsniper_ebay_product_research", available: false, checkedAt: new Date().toISOString(), stage: "configuration", status: 0, code, message, items: [], total: 0, next: null };
}

async function readSavedOrFetch(query: string, queryKey: string): Promise<EbayHistoryResult> {
  const db = createAdminServerClient();
  const { data: saved, error } = await db.from("sniper_ebay_history").select("state,response").eq("query_key", queryKey).maybeSingle();
  if (error) return unavailable("history_store_unavailable", "Saved sales history is temporarily unavailable; no new pricing request was made.");
  if (saved?.response) return saved.response as EbayHistoryResult;
  if (saved) return unavailable("history_pending", "The first sales lookup is in progress. Reopen this view shortly.");
  const key = process.env.COMPSNIPER_API_KEY;
  if (!key) return { ...await searchEbaySold(query), provider: "ebay_marketplace_insights" };
  // Unique insert claims this comic before the billed request, including across server instances.
  const { data: claim, error: claimError } = await db.from("sniper_ebay_history")
    .upsert({ query_key: queryKey, query_text: query }, { onConflict: "query_key", ignoreDuplicates: true }).select("query_key");
  if (claimError) return unavailable("history_store_unavailable", "Sales history could not be saved; no new pricing request was made.");
  if (!claim?.length) {
    const { data } = await db.from("sniper_ebay_history").select("response").eq("query_key", queryKey).maybeSingle();
    return data?.response as EbayHistoryResult || unavailable("history_pending", "The first sales lookup is in progress. Reopen this view shortly.");
  }
  const response = await readHistory(query, key);
  const { error: saveError } = await db.from("sniper_ebay_history").update({
    state: response.available ? "ready" : "failed", response, completed_at: new Date().toISOString(),
  }).eq("query_key", queryKey);
  if (saveError) console.error("[sniper] Could not save completed-sale response:", saveError.message);
  return response;
}

async function readHistory(query: string, key: string): Promise<EbayHistoryResult> {
  const base: EbayHistoryResult = { provider: "compsniper_ebay_product_research", available: false, checkedAt: new Date().toISOString(), stage: "search", status: 0, code: null, message: "", items: [], total: 0, next: null, rawRecords: [] };
  const end = new Date();
  const start = new Date(end); start.setUTCFullYear(start.getUTCFullYear() - 3); start.setUTCDate(start.getUTCDate() + 1);
  try {
    // Single-unit rows have an individual soldPrice and soldDate. Aggregate averages are excluded.
    const url = new URL("https://api.compsniper.com/v1/research/sold");
    url.search = new URLSearchParams({ keyword: query, startDate: start.toISOString().slice(0,10), endDate: end.toISOString().slice(0,10), ebaySite: "ebay.com", sort: "lastSoldDescending", limit: "50", page: "1", singleUnitOnly: "true" }).toString();
    const response = await fetch(url, { headers: { Authorization: `Bearer ${key}` }, cache: "no-store", signal: AbortSignal.timeout(25000) });
    const body = await response.json();
    if (!response.ok) return { ...base, status: response.status, code: body.code || "history_failed", message: body.error || "Sold-history provider refused the request." };
    if (!Array.isArray(body.results)) return { ...base, status: response.status, code: "unexpected_response", message: "No historical results collection returned." };
    const records = body.results.filter((r: any) => r.recordType === "single_unit_listing" && Number(r.soldUnits) === 1 && Number(r.soldPrice?.amount) > 0 && r.soldDate && Number.isFinite(Date.parse(r.soldDate)));
    return { ...base, available: true, status: response.status, rawRecords: body.results,
      items: records.map((r: any) => ({ ...r, lastSoldPrice: { value: r.soldPrice.amount, currency: r.soldPrice.currency }, lastSoldDate: r.soldDate, itemWebUrl: r.itemUrl })),
      total: records.length, hasMore: Boolean(body.hasNextPage), message: `Completed single-unit eBay sales over up to three years. ${body.hasNextPage ? "Showing the latest 50 matching listing records; more pages are available from the provider." : ""}`.trim(),
    };
  } catch (error) { return { ...base, stage: "network", code: "request_failed", message: error instanceof Error ? error.message : "Sold-history request failed." }; }
}
