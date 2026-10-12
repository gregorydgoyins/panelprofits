/**
 * Sniper market store: the only place eBay is called from, on a schedule, with a fixed call budget.
 * The page and the APIs read what this stores, so visitors never spend eBay quota.
 *
 *   snapshot  → every lot returned by a handful of 200-lot Browse searches is saved with its price and bid count
 *   ticks     → one row each time a lot's price or bid count changes (the lot's own bid history)
 *   sales     → when an auction we were watching closes, its last bid is recorded as a sale (confirmed=false);
 *               if the account has Marketplace Insights, eBay's own sold records are stored as confirmed=true
 *
 * Nothing is simulated: a lot is shown only while it keeps being seen, and a sale exists only if we saw the auction end.
 */
import { createAdminServerClient } from "@/lib/supabase/admin";
import { parseAndFilterListing } from "./anti-bullshit";
import { searchEbayPage, type SearchEbayAuctionsParams } from "./ebay-api";
import type { RawAuctionListing } from "./types";
import { seriesKey, type SaleObs } from "./candles";
import benchmarksData from "@/lib/pricing/pricecharting-cgc-benchmarks.json";

export const SNAPSHOT_MIN_INTERVAL_MS = 4 * 60_000;
const BACKOFF_AFTER_429_MS = 20 * 60_000;
/** A lot not re-seen for this long is no longer shown as live. */
export const LISTING_STALE_MS = 45 * 60_000;
/** An auction's last bid counts as its closing price only if we saw it within this many seconds of the end. */
export const FINAL_BID_SLACK_SECS = 900;
const BIN_DELIST_AFTER_MS = 3 * 3600_000;

// ───────────────────────────── search plan ─────────────────────────────

const CLOSING_QUERIES = ["CGC comic", "CBCS comic", "PGX comic"];

const DISCOVERY_QUERIES = [
  "Amazing Spider-Man CGC", "Batman CGC", "X-Men CGC", "Action Comics CGC", "Detective Comics CGC", "Fantastic Four CGC",
  "Incredible Hulk CGC", "Spawn CGC", "Superman CGC", "Avengers CGC", "Iron Man CGC", "Thor CGC", "Daredevil CGC",
  "Wolverine CGC", "Teenage Mutant Ninja Turtles CGC", "Walking Dead CGC", "Star Wars CGC", "Justice League CGC",
  "New Mutants CGC", "Green Lantern CGC", "Flash CGC", "Captain America CGC", "Punisher CGC", "Venom CGC",
  "CGC 9.8 key issue", "CGC first appearance", "CGC golden age", "CGC silver age", "CGC bronze age", "CBCS 9.8",
  "CGC signature series", "CGC newsstand", "CGC canadian price variant", "CGC manga",
];

/** The Browse calls for one slot: 8 calls, about 2,300 a day at one slot every 5 minutes, inside eBay's default allowance. */
export function planCalls(slot: number): SearchEbayAuctionsParams[] {
  const calls: SearchEbayAuctionsParams[] = [];
  for (const q of CLOSING_QUERIES) {
    calls.push({ query: q, marketplace: "EBAY_US", limit: 200, buyingOptions: "AUCTION", sort: "endingSoonest", endsWithinMinutes: 30 });
  }
  const n = DISCOVERY_QUERIES.length;
  for (let k = 0; k < 2; k++) {
    calls.push({
      query: DISCOVERY_QUERIES[(slot * 2 + k) % n], marketplace: "EBAY_US", limit: 200,
      buyingOptions: "AUCTION", sort: "endingSoonest", endsWithinMinutes: 7 * 24 * 60,
    });
  }
  calls.push({ query: DISCOVERY_QUERIES[(slot * 3 + 1) % n], marketplace: "EBAY_US", limit: 200, buyingOptions: "FIXED_PRICE", sort: "newlyListed" });
  // Around the clock: two other eBay marketplaces per slot, so each region is checked every ~12 minutes and an auction
  // closing overnight in one country keeps the feed busy while the US sleeps.
  const abroad: Array<"EBAY_GB" | "EBAY_CA" | "EBAY_AU" | "EBAY_DE" | "EBAY_FR"> = ["EBAY_GB", "EBAY_CA", "EBAY_AU", "EBAY_DE", "EBAY_FR"];
  for (let k = 0; k < 2; k++) {
    calls.push({ query: "CGC comic", marketplace: abroad[(slot * 2 + k) % abroad.length], limit: 100, buyingOptions: "AUCTION", sort: "endingSoonest", endsWithinMinutes: 6 * 60 });
  }
  return calls;
}

// ───────────────────────────── helpers ─────────────────────────────

const LOT_LIKE = /\b(lot of|lot\b|set of|complete set|run of|bundle|collection|\d+\s*(?:books|issues|comics))\b/i;

function chunk<T>(xs: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < xs.length; i += n) out.push(xs.slice(i, i + n));
  return out;
}

const isAuctionListing = (it: RawAuctionListing) => !it.isBuyItNow && it.listingType !== "BuyItNow";

export function listingToRow(it: RawAuctionListing, nowMs: number) {
  const parsed = parseAndFilterListing(it.title);
  const auction = isAuctionListing(it);
  const known = parsed.extractedSeries && parsed.extractedSeries !== "Unknown Series";
  return {
    item_id: it.id,
    venue: it.source,
    marketplace: it.internationalRegion ?? "US",
    title: it.title,
    series: known ? parsed.extractedSeries : null,
    issue: known ? parsed.extractedIssue : null,
    grade: parsed.grade,
    grader: parsed.gradingCompany,
    cert_number: parsed.certNumber ?? it.certNumber ?? null,
    buying_option: auction ? "AUCTION" : "FIXED_PRICE",
    price_usd: it.currentBid,
    currency: it.currency ?? "USD",
    price_native: it.originalBid ?? it.currentBid,
    bid_count: it.bidCount ?? 0,
    end_time: auction ? new Date(nowMs + Math.max(0, it.secondsRemaining) * 1000).toISOString() : null,
    url: it.url,
    image_url: it.imageUrl || null,
    gallery: it.galleryImages ?? [],
    payload: it,
    status: "live",
    last_seen: new Date(nowMs).toISOString(),
  };
}

// ───────────────────────────── snapshot ─────────────────────────────

export interface SnapshotSummary {
  skipped?: string;
  runId?: number;
  ebayCalls: number;
  statuses: Record<string, number>;
  listingsSeen: number;
  ticksWritten: number;
  salesWritten: number;
  ended: number;
  note: string;
}

export async function runSnapshot(opts: { force?: boolean } = {}): Promise<SnapshotSummary> {
  const db: any = createAdminServerClient();
  const nowMs = Date.now();
  const empty: SnapshotSummary = { ebayCalls: 0, statuses: {}, listingsSeen: 0, ticksWritten: 0, salesWritten: 0, ended: 0, note: "" };

  // Lock + backoff: one run per interval no matter who calls the endpoint, and quiet after eBay says "too many requests".
  const { data: lastRuns } = await db.from("sniper_runs").select("id,started_at,statuses,note").order("id", { ascending: false }).limit(5);
  const last = lastRuns?.[0];
  if (!opts.force && last && nowMs - new Date(last.started_at).getTime() < SNAPSHOT_MIN_INTERVAL_MS) {
    return { ...empty, skipped: "ran less than 4 minutes ago" };
  }
  const recent429 = (lastRuns ?? []).find((r: any) => r.statuses && Number(r.statuses["429"]) > 0 && nowMs - new Date(r.started_at).getTime() < BACKOFF_AFTER_429_MS);
  if (!opts.force && recent429) {
    await db.from("sniper_runs").insert({ ebay_calls: 0, finished_at: new Date().toISOString(), note: "backoff after eBay 429" });
    return { ...empty, skipped: "backing off after eBay rate limit" };
  }

  const { data: runRow } = await db.from("sniper_runs").insert({}).select("id").single();
  const runId: number | undefined = runRow?.id;
  const slot = Math.floor(nowMs / SNAPSHOT_MIN_INTERVAL_MS);

  const statuses: Record<string, number> = {};
  const seen = new Map<string, RawAuctionListing>();
  let calls = 0;
  for (const params of planCalls(slot)) {
    const page = await searchEbayPage(params);
    calls++;
    statuses[String(page.status)] = (statuses[String(page.status)] ?? 0) + 1;
    for (const it of page.items) if (it.currentBid > 0 && it.imageUrl) seen.set(it.id, it);
    if (page.status === 429 || page.status === 0) break; // stop spending quota the moment eBay says no
  }

  // Save what we saw, and a tick wherever price or bid count moved.
  const rows = Array.from(seen.values()).map((it) => listingToRow(it, nowMs));
  let ticks = 0;
  for (const part of chunk(rows, 100)) {
    const ids = part.map((r) => r.item_id);
    const { data: prev } = await db.from("sniper_listings").select("item_id,price_usd,bid_count").in("item_id", ids);
    const before = new Map<string, any>((prev ?? []).map((p: any) => [p.item_id, p]));
    const { error: upErr } = await db.from("sniper_listings").upsert(part, { onConflict: "item_id" });
    if (upErr) { console.error("[sniper] listing upsert failed:", upErr.message); continue; }
    const tickRows = part
      .filter((r) => {
        const b = before.get(r.item_id);
        return !b || Number(b.price_usd) !== Number(r.price_usd) || Number(b.bid_count) !== Number(r.bid_count);
      })
      .map((r) => ({ item_id: r.item_id, seen_at: r.last_seen, price_usd: r.price_usd, bid_count: r.bid_count }));
    if (tickRows.length) {
      const { error: tErr } = await db.from("sniper_ticks").insert(tickRows);
      if (!tErr) ticks += tickRows.length;
    }
  }

  const { sales, ended } = await resolveEnded(db, nowMs);
  const insights = await tryInsights(db, slot, nowMs, statuses);

  if (slot % 288 === 0) {
    const cutoff = new Date(nowMs - 60 * 86400000).toISOString();
    await db.from("sniper_listings").delete().eq("status", "ended").lt("last_seen", cutoff);
  }

  const note = `calls=${calls} seen=${seen.size} ticks=${ticks} ended=${ended} sales=${sales + insights.sales} insights=${insights.state}`;
  if (runId) {
    await db.from("sniper_runs").update({
      finished_at: new Date().toISOString(), ebay_calls: calls, statuses, listings_seen: seen.size,
      ticks_written: ticks, sales_written: sales + insights.sales, note,
    }).eq("id", runId);
  }
  return { runId, ebayCalls: calls, statuses, listingsSeen: seen.size, ticksWritten: ticks, salesWritten: sales + insights.sales, ended, note };
}

/** Close out lots whose end time has passed. A bid-carrying auction we saw close to its end becomes a recorded sale. */
async function resolveEnded(db: any, nowMs: number): Promise<{ sales: number; ended: number }> {
  const { data: due } = await db
    .from("sniper_listings").select("*").eq("status", "live").not("end_time", "is", null)
    .lt("end_time", new Date(nowMs - 30_000).toISOString()).limit(500);
  const rows: any[] = due ?? [];
  const saleRows: any[] = [];
  const updated = rows.map((r) => {
    const endMs = new Date(r.end_time).getTime();
    const secsBefore = Math.round((endMs - new Date(r.last_seen).getTime()) / 1000);
    const closedOnUs = r.buying_option === "AUCTION" && Number(r.bid_count) > 0 && secsBefore <= FINAL_BID_SLACK_SECS;
    if (closedOnUs && r.venue === "ebay" && r.grade != null && r.series && !LOT_LIKE.test(r.title) && Number(r.price_usd) > 0) {
      const soldAt = new Date(endMs).toISOString();
      saleRows.push({
        id: `ebay|${r.item_id}|${Math.round(Number(r.price_usd) * 100)}|${soldAt.slice(0, 10)}`,
        series_key: seriesKey(r.series, r.issue ?? ""), series: r.series, issue: r.issue, grade: r.grade, grader: r.grader,
        price_usd: r.price_usd, sold_at: soldAt, venue: "ebay", source: "ebay_last_bid", confirmed: false,
        item_id: r.item_id, url: r.url,
      });
    }
    return { ...r, status: "ended", final_price_usd: r.price_usd, final_bid_count: r.bid_count, final_seen_secs_before_end: secsBefore, resolved_at: new Date(nowMs).toISOString() };
  });
  for (const part of chunk(updated, 100)) await db.from("sniper_listings").upsert(part, { onConflict: "item_id" });
  let sales = 0;
  for (const part of chunk(saleRows, 100)) {
    const { error } = await db.from("sniper_sales").upsert(part, { onConflict: "id", ignoreDuplicates: true });
    if (!error) sales += part.length;
  }
  // Buy It Now listings have no end time: stop showing them if they vanished from the searches for a while.
  await db.from("sniper_listings").update({ status: "ended", resolved_at: new Date(nowMs).toISOString() })
    .eq("status", "live").is("end_time", null).lt("last_seen", new Date(nowMs - BIN_DELIST_AFTER_MS).toISOString());
  return { sales, ended: updated.length };
}

// ───────────────────────────── Marketplace Insights (eBay's own sold records) ─────────────────────────────

const INSIGHTS_SCOPE = "https://api.ebay.com/oauth/api_scope/buy.marketplace.insights";

/**
 * eBay gates sold-item data behind Marketplace Insights approval. Once a day we ask for the scope; if eBay refuses,
 * nothing is stored and the reason is logged. If it ever works, confirmed sales start flowing into sniper_sales on their own.
 */
async function tryInsights(db: any, slot: number, nowMs: number, statuses: Record<string, number>): Promise<{ sales: number; state: string }> {
  const { data: recent } = await db.from("sniper_runs").select("note,started_at").gt("started_at", new Date(nowMs - 24 * 3600_000).toISOString()).like("note", "%insights=unavailable%").limit(1);
  if (recent && recent.length) return { sales: 0, state: "unavailable(cached)" };

  const id = process.env.EBAY_CLIENT_ID, secret = process.env.EBAY_CLIENT_SECRET;
  if (!id || !secret) return { sales: 0, state: "unavailable(no keys)" };
  try {
    const tok = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}` },
      body: `grant_type=client_credentials&scope=${encodeURIComponent(INSIGHTS_SCOPE)}`,
      signal: AbortSignal.timeout(8000),
    });
    if (!tok.ok) return { sales: 0, state: `unavailable(token ${tok.status})` };
    const access = (await tok.json()).access_token as string | undefined;
    if (!access) return { sales: 0, state: "unavailable(no token)" };

    const q = CLOSING_QUERIES[slot % CLOSING_QUERIES.length];
    const res = await fetch(`https://api.ebay.com/buy/marketplace_insights/v1_beta/item_sales/search?q=${encodeURIComponent(q)}&limit=200`, {
      headers: { Authorization: `Bearer ${access}`, "X-EBAY-C-MARKETPLACE-ID": "EBAY_US" },
      signal: AbortSignal.timeout(12000),
    });
    statuses[`insights_${res.status}`] = 1;
    if (!res.ok) return { sales: 0, state: `unavailable(search ${res.status})` };
    const data = await res.json();
    const out: any[] = [];
    for (const s of data.itemSales ?? []) {
      const price = parseFloat(s.lastSoldPrice?.value ?? "0");
      if (!(price > 0) || s.lastSoldPrice?.currency !== "USD" || !s.lastSoldDate) continue;
      const parsed = parseAndFilterListing(String(s.title ?? ""));
      if (!parsed.extractedSeries || parsed.extractedSeries === "Unknown Series" || parsed.grade == null || LOT_LIKE.test(s.title)) continue;
      out.push({
        id: `ebay|${s.itemId}|${Math.round(price * 100)}|${String(s.lastSoldDate).slice(0, 10)}`,
        series_key: seriesKey(parsed.extractedSeries, parsed.extractedIssue), series: parsed.extractedSeries, issue: parsed.extractedIssue,
        grade: parsed.grade, grader: parsed.gradingCompany, price_usd: price, sold_at: new Date(s.lastSoldDate).toISOString(),
        venue: "ebay", source: "ebay_insights", confirmed: true, item_id: `ebay-${s.itemId}`, url: s.itemWebUrl ?? null,
      });
    }
    if (out.length) await db.from("sniper_sales").upsert(out, { onConflict: "id" });
    return { sales: out.length, state: "ok" };
  } catch (e) {
    return { sales: 0, state: `unavailable(${(e as Error).message.slice(0, 40)})` };
  }
}

// ───────────────────────────── reads ─────────────────────────────

export async function readLiveListings(limit = 1500): Promise<{ items: RawAuctionListing[]; asOf: string | null }> {
  const db: any = createAdminServerClient();
  const nowMs = Date.now();
  const { data, error } = await db
    .from("sniper_listings").select("payload,price_usd,bid_count,end_time,last_seen")
    .eq("status", "live")
    .gte("last_seen", new Date(nowMs - LISTING_STALE_MS).toISOString())
    .or(`end_time.is.null,end_time.gt.${new Date(nowMs).toISOString()}`)
    .order("end_time", { ascending: true, nullsFirst: false })
    .limit(limit);
  if (error) {
    console.error("[sniper] read listings failed:", error.message);
    return { items: [], asOf: null };
  }
  let asOf: string | null = null;
  const items: RawAuctionListing[] = [];
  for (const r of data ?? []) {
    if (!r.payload) continue;
    const p = r.payload as RawAuctionListing;
    items.push({
      ...p,
      currentBid: Number(r.price_usd),
      bidCount: Number(r.bid_count) || 0,
      secondsRemaining: r.end_time ? Math.max(0, Math.round((new Date(r.end_time).getTime() - nowMs) / 1000)) : p.secondsRemaining,
    });
    if (!asOf || r.last_seen > asOf) asOf = r.last_seen;
  }
  return { items, asOf };
}

export async function readTicks(itemId: string): Promise<Array<{ time: string; price: number; bids: number }>> {
  const db: any = createAdminServerClient();
  const { data } = await db.from("sniper_ticks").select("seen_at,price_usd,bid_count").eq("item_id", itemId).order("seen_at", { ascending: true }).limit(2000);
  return (data ?? []).map((t: any) => ({ time: t.seen_at, price: Number(t.price_usd), bids: Number(t.bid_count) }));
}

const gradeNum = (g: unknown): number | null => {
  const n = parseFloat(String(g ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
};

/** Every recorded sale for one book from all real sources: our own observations, the graded-sales register, and the stored benchmark observations. */
export async function readSalesForBook(series: string, issue: string): Promise<SaleObs[]> {
  const out: SaleObs[] = [];
  const db: any = createAdminServerClient();
  const key = seriesKey(series, issue);

  try {
    const { data } = await db.from("sniper_sales").select("sold_at,price_usd,grade,venue,source,confirmed,url").eq("series_key", key).order("sold_at", { ascending: true }).limit(5000);
    for (const s of data ?? []) {
      out.push({ date: s.sold_at, price: Number(s.price_usd), grade: s.grade != null ? Number(s.grade) : null, venue: s.venue, source: s.source, confirmed: !!s.confirmed, url: s.url ?? undefined });
    }
  } catch {}

  try {
    const clean = series.replace(/[%_]/g, " ").replace(/^the\s+/i, "").trim();
    const { data } = await db.from("graded_sales_observations")
      .select("sale_price,sale_date,grade_numeric,native_grade_text,venue,evidence_path,currency")
      .ilike("title_name", `%${clean}%`).eq("issue_number_raw", String(issue).replace(/^#/, ""))
      .gt("sale_price", 0).not("sale_date", "is", null).limit(5000);
    for (const s of data ?? []) {
      if (s.currency && s.currency !== "USD") continue;
      out.push({ date: String(s.sale_date), price: Number(s.sale_price), grade: s.grade_numeric != null ? Number(s.grade_numeric) : gradeNum(s.native_grade_text), venue: s.venue || "graded register", source: "graded_sales_observations", confirmed: true, url: s.evidence_path ?? undefined });
    }
  } catch {}

  try {
    const entry = (benchmarksData as Record<string, any>)[`${series} #${String(issue).replace(/^#/, "")}`];
    for (const o of entry?.allObservations ?? []) {
      const amt = Number(o.amount), dt = o.date || o.observedAt;
      if (amt > 0 && dt) out.push({ date: String(dt).slice(0, 10), price: amt, grade: gradeNum(o.grade), venue: o.authority || o.type || "benchmark", source: `benchmark:${o.type ?? "obs"}`, confirmed: /sale|cgc|heritage|gpa/i.test(`${o.type} ${o.authority}`) });
    }
    for (const o of entry?.cgc ?? []) {
      const amt = Number(o.amount), dt = o.observedAt || o.date;
      if (amt > 0 && dt) out.push({ date: String(dt).slice(0, 10), price: amt, grade: gradeNum(o.grade), venue: o.venue || o.authority || "CGC", source: "benchmark:cgc", confirmed: true });
    }
  } catch {}

  return out;
}
