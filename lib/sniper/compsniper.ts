/**
 * CompSniper (api.compsniper.com): completed eBay sales for a keyword. Used to fill the sold history of one book.
 * Pure logic with injected fetch / title parser / key function so it can be tested without network.
 * Only items whose title parses to the SAME series and issue, with a grade, a USD price and a sale date, are kept.
 */

export interface CompSaleRow {
  id: string;
  series_key: string;
  series: string;
  issue: string;
  grade: number;
  grader: string;
  price_usd: number;
  sold_at: string;
  venue: string;
  source: string;
  confirmed: boolean;
  item_id: string;
  url: string | null;
}

export interface CompSniperDeps {
  apiKey: string;
  fetchFn: typeof fetch;
  parse: (title: string) => { extractedSeries?: string; extractedIssue?: string; grade?: number | null; gradingCompany?: string };
  keyOf: (series: string, issue: string) => string;
}

const LOT_LIKE = /\b(lot of|lot\b|set of|complete set|run of|bundle|collection|\d+\s*(?:books|issues|comics))\b/i;

export const COMPSNIPER_URL = "https://api.compsniper.com/v1/scrape";

export function compSniperKeyword(series: string, issue: string): string {
  const s = series.replace(/\s*[(\[].*?[)\]]/g, "").replace(/^the\s+/i, "").trim();
  return `${s} ${String(issue).replace(/^#/, "")} CGC`;
}

const num = (v: unknown): number => {
  if (v && typeof v === "object") return Number((v as any).value ?? (v as any).amount ?? NaN);
  return Number(typeof v === "string" ? v.replace(/[^0-9.]/g, "") : v);
};

export function mapItems(items: any[], series: string, issue: string, deps: Pick<CompSniperDeps, "parse" | "keyOf">): CompSaleRow[] {
  const want = deps.keyOf(series, issue);
  const out: CompSaleRow[] = [];
  const seen = new Set<string>();
  for (const it of items ?? []) {
    const title = String(it?.title ?? "");
    const itemId = String(it?.itemId ?? "");
    const price = num(it?.soldPrice);
    const endedMs = Date.parse(String(it?.endedAt ?? ""));
    const currency = it?.currency ?? it?.soldPrice?.currency;
    if (!title || !itemId || !(price > 0) || !Number.isFinite(endedMs)) continue;
    if (currency && String(currency).toUpperCase() !== "USD") continue;
    if (LOT_LIKE.test(title)) continue;
    const p = deps.parse(title);
    if (!p.extractedSeries || p.extractedSeries === "Unknown Series" || p.grade == null || !(p.grade > 0)) continue;
    if (deps.keyOf(p.extractedSeries, p.extractedIssue ?? "") !== want) continue;
    const soldAt = new Date(endedMs).toISOString();
    const id = `compsniper|${itemId}|${Math.round(price * 100)}|${soldAt.slice(0, 10)}`;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({
      id, series_key: want, series: p.extractedSeries, issue: String(p.extractedIssue ?? issue).replace(/^#/, ""),
      grade: p.grade, grader: p.gradingCompany || "CGC", price_usd: price, sold_at: soldAt,
      venue: "ebay", source: "compsniper", confirmed: true, item_id: `ebay-${itemId}`, url: it?.url ? String(it.url) : null,
    });
  }
  return out;
}

export async function fetchCompSniper(
  series: string, issue: string, deps: CompSniperDeps, count = 120
): Promise<{ status: number; rows: CompSaleRow[]; totalItems: number }> {
  const url = new URL(COMPSNIPER_URL);
  url.searchParams.set("keyword", compSniperKeyword(series, issue));
  url.searchParams.set("count", String(count));
  const res = await deps.fetchFn(url.toString(), {
    headers: { Authorization: `Bearer ${deps.apiKey}` },
    signal: AbortSignal.timeout(25_000),
  });
  if (!res.ok) return { status: res.status, rows: [], totalItems: 0 };
  const json: any = await res.json();
  const items: any[] = Array.isArray(json?.items) ? json.items : [];
  return { status: res.status, rows: mapItems(items, series, issue, deps), totalItems: items.length };
}
