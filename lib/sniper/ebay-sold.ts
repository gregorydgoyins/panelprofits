/** Read-only official sold-history client. Never treats Browse listings as sales. */
export interface EbaySoldResult {
  available: boolean;
  checkedAt: string;
  stage: "configuration" | "oauth" | "search" | "network";
  status: number;
  code: string | null;
  message: string;
  items: Record<string, any>[];
  total: number;
  next: string | null;
}
const scope = "https://api.ebay.com/oauth/api_scope/buy.marketplace.insights";
let denial: { expires: number; result: EbaySoldResult } | null = null;
const cache = new Map<string, { expires: number; result: Promise<EbaySoldResult> }>();

export async function searchEbaySold(query: string, limit = 100): Promise<EbaySoldResult> {
  if (denial && denial.expires > Date.now()) return denial.result;
  const key = `${query}|${limit}`;
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.result;
  const result = requestSold(query, limit);
  cache.set(key, { expires: Date.now() + 6 * 3600_000, result });
  if (cache.size > 100) cache.delete(cache.keys().next().value!);
  const value = await result;
  if (!value.available) {
    cache.delete(key);
    // Invalid scope/credentials affect every query: avoid repeatedly spending requests.
    if ([400, 401, 403].includes(value.status)) denial = { expires: Date.now() + 3600_000, result: value };
  }
  return value;
}

async function requestSold(query: string, limit: number): Promise<EbaySoldResult> {
  const base = { checkedAt: new Date().toISOString(), items: [], total: 0, next: null };
  const id = process.env.EBAY_CLIENT_ID;
  const secret = process.env.EBAY_CLIENT_SECRET;
  if (!id || !secret) return { ...base, available: false, stage: "configuration", status: 0, code: "missing_credentials", message: "eBay developer credentials are unavailable in this runtime." };
  if (process.env.EBAY_ENV?.toLowerCase().includes("sandbox")) return { ...base, available: false, stage: "configuration", status: 0, code: "sandbox", message: "Sandbox listings cannot supply real completed sales." };
  try {
    const tokenResponse = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}` },
      body: new URLSearchParams({ grant_type: "client_credentials", scope }),
      cache: "no-store", signal: AbortSignal.timeout(8000),
    });
    const token = await tokenResponse.json();
    if (!tokenResponse.ok || !token.access_token) return { ...base, available: false, stage: "oauth", status: tokenResponse.status, code: token.error || "no_token", message: token.error_description || "eBay did not issue a sold-history access token." };
    const url = new URL("https://api.ebay.com/buy/marketplace_insights/v1_beta/item_sales/search");
    url.search = new URLSearchParams({ q: query, limit: String(Math.max(1, Math.min(200, limit))), category_ids: "259104" }).toString();
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token.access_token}`, "X-EBAY-C-MARKETPLACE-ID": "EBAY_US" },
      cache: "no-store", signal: AbortSignal.timeout(12000),
    });
    const body = await response.json();
    if (!response.ok) return { ...base, available: false, stage: "search", status: response.status, code: String(body.errors?.[0]?.errorId ?? "search_failed"), message: body.errors?.[0]?.message || "eBay refused sold-history search." };
    if (!Array.isArray(body.itemSales)) return { ...base, available: false, stage: "search", status: response.status, code: "unexpected_response", message: "eBay response contained no itemSales collection; no prices were inferred." };
    return { ...base, available: true, stage: "search", status: response.status, code: null, message: "Official eBay sold records; returned fields are preserved unchanged.", items: body.itemSales, total: Number(body.total) || body.itemSales.length, next: body.next || null };
  } catch (error) {
    return { ...base, available: false, stage: "network", status: 0, code: "request_failed", message: error instanceof Error ? error.message : "eBay request failed." };
  }
}
