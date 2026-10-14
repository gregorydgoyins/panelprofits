import { searchEbaySold, type EbaySoldResult } from "./ebay-sold";

export interface EbayHistoryResult extends EbaySoldResult { provider: string; rawRecords?: Record<string, any>[]; hasMore?: boolean }
const cache = new Map<string, { expires: number; result: Promise<EbayHistoryResult> }>();

/** Read-only completed-sales history. A provider key never substitutes for the eBay developer key. */
export async function readCompletedEbaySales(query: string): Promise<EbayHistoryResult> {
  const key = process.env.COMPSNIPER_API_KEY;
  if (!key) return { ...await searchEbaySold(query), provider: "ebay_marketplace_insights" };
  const hit = cache.get(query);
  if (hit && hit.expires > Date.now()) return hit.result;
  const result = readHistory(query, key);
  cache.set(query, { expires: Date.now() + 24 * 3600_000, result });
  if (cache.size > 100) cache.delete(cache.keys().next().value!);
  const value = await result;
  if (!value.available) cache.delete(query);
  return value;
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
