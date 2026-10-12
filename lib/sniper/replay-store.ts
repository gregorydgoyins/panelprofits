/**
 * Practice rounds: a real eBay auction that has already closed, replayed from the moment it had a minute left.
 * The subscriber sets a max and "fires" with the clock running; we then reveal what the auction really closed at and
 * score it, win or loss. Everything shown is something eBay reported; nothing is invented and nothing is sent to a venue.
 *
 * Only auctions whose closing price we read within seconds of the end are offered, so the score is against the real close.
 */
import { createAdminServerClient } from "@/lib/supabase/admin";
import { bidIncrement, paperProfit, settleAuction } from "./paper";

const db = () => createAdminServerClient() as any;
const num = (v: unknown): number | null => (v == null || v === "" || !Number.isFinite(Number(v)) ? null : Number(v));
const okOwner = (o: unknown): o is string => typeof o === "string" && o.length >= 8 && o.length <= 80;

/** A round starts at the first reading we took with between these many seconds left (the closing watch takes it). */
export const START_MAX_SECS = 75;
export const START_MIN_SECS = 15;
/** The closing price must have been read no earlier than this many seconds before the end (or at any point after it). */
export const MAX_FINAL_GAP_SECS = 10;
const WINDOW_DAYS = 7;

/** The earliest reading taken with START_MIN_SECS..START_MAX_SECS left: the price at that moment is exactly what eBay showed. */
function startReading(ticks: any[], endMs: number) {
  return ticks.find((t) => {
    const secs = (endMs - new Date(t.seen_at).getTime()) / 1000;
    return secs >= START_MIN_SECS && secs <= START_MAX_SECS;
  });
}

export interface ReplayLot {
  itemId: string;
  title: string;
  series: string | null;
  issue: string | null;
  grade: number | null;
  grader: string | null;
  cert: string | null;
  imageUrl: string | null;
  url: string | null;
  shippingUsd: number;
  endedAt: string;
  /** what the auction looked like with a minute or so to go */
  startPrice: number;
  startBids: number;
  minNextBid: number;
  startSecs: number;
}

async function closedLots(sinceIso: string, limit: number) {
  const { data } = await db().from("sniper_listings").select("*")
    .eq("status", "ended").eq("venue", "ebay").eq("buying_option", "AUCTION")
    .gt("final_bid_count", 0).lte("final_seen_secs_before_end", MAX_FINAL_GAP_SECS)
    .gte("end_time", sinceIso).order("end_time", { ascending: false }).limit(limit);
  return (data ?? []) as any[];
}

export async function listReplays(owner: string, limit = 24): Promise<{ lots: ReplayLot[]; pool: number }> {
  const since = new Date(Date.now() - WINDOW_DAYS * 86400_000).toISOString();
  const rows = await closedLots(since, 150);
  if (!rows.length) return { lots: [], pool: 0 };

  let played = new Set<string>();
  if (okOwner(owner)) {
    const { data } = await db().from("sniper_paper_orders").select("item_id,result").eq("owner", owner).eq("kind", "auction").not("result", "is", null).limit(500);
    played = new Set((data ?? []).filter((o: any) => o.result?.replay).map((o: any) => o.item_id));
  }
  const fresh = rows.filter((r) => !played.has(r.item_id)).slice(0, 80);
  if (!fresh.length) return { lots: [], pool: rows.length };

  const { data: ticks } = await db().from("sniper_ticks").select("item_id,seen_at,price_usd,bid_count")
    .in("item_id", fresh.map((r) => r.item_id)).order("seen_at", { ascending: true }).limit(5000);
  const by = new Map<string, any[]>();
  for (const t of ticks ?? []) { (by.get(t.item_id) ?? by.set(t.item_id, []).get(t.item_id)!).push(t); }

  const lots: ReplayLot[] = [];
  for (const r of fresh) {
    const endMs = new Date(r.end_time).getTime();
    const at = startReading(by.get(r.item_id) ?? [], endMs);
    if (!at) continue; // no reading taken in the last minute or so: no fair starting point to show
    const start = Number(at.price_usd);
    lots.push({
      itemId: r.item_id, title: r.title, series: r.series, issue: r.issue, grade: r.grade, grader: r.grader, cert: r.cert_number ?? null,
      imageUrl: r.image_url ?? null, url: r.url ?? null, shippingUsd: num(r.payload?.shippingCost) ?? 0, endedAt: r.end_time,
      startPrice: start, startBids: Number(at.bid_count) || 0, minNextBid: Math.round((start + bidIncrement(start)) * 100) / 100, startSecs: Math.round((endMs - new Date(at.seen_at).getTime()) / 1000),
    });
    if (lots.length >= limit) break;
  }
  return { lots, pool: rows.length };
}

export interface ReplayResult {
  order: any;
  closedAt: string | null;
  finalPrice: number | null;
  finalBids: number | null;
  /** the real price steps from the start of the round to the close, so the close can be played back */
  steps: Array<{ secsBeforeEnd: number; price: number; bids: number }>;
  startPrice: number;
  locked?: boolean;
  revealAt?: string;
}

function maskReplayOrder(order: any, revealAt: string) {
  return {
    ...order,
    status: "pending",
    final_price_usd: null,
    final_bid_count: null,
    fill_price_usd: null,
    paper_profit_usd: null,
    detail: null,
    basis: null,
    settled_at: null,
    result: { replay: true, revealAt },
  };
}

export async function playReplay(args: { owner: string; itemId: string; maxBid: number; fmv?: number | null; secsLeft?: number; pass?: boolean }): Promise<{ ok: boolean; error?: string; result?: ReplayResult }> {
  const { owner, itemId } = args;
  if (!okOwner(owner)) return { ok: false, error: "bad owner" };
  const maxBid = args.pass ? null : num(args.maxBid);
  if (!args.pass && (!maxBid || maxBid <= 0)) return { ok: false, error: "enter a max bid" };

  const { data: l } = await db().from("sniper_listings").select("*").eq("item_id", itemId).maybeSingle();
  if (!l || l.status !== "ended" || l.buying_option !== "AUCTION" || l.venue !== "ebay") return { ok: false, error: "that round isn't available" };
  if (!(Number(l.final_bid_count) > 0) || Number(l.final_seen_secs_before_end) > MAX_FINAL_GAP_SECS) return { ok: false, error: "that round isn't available" };

  const { data: prior } = await db().from("sniper_paper_orders").select("id,result").eq("owner", owner).eq("item_id", itemId).eq("kind", "auction").limit(10);
  if ((prior ?? []).some((o: any) => o.result?.replay)) return { ok: false, error: "you already played this one" };

  const endMs = new Date(l.end_time).getTime();
  const { data: ticks } = await db().from("sniper_ticks").select("seen_at,price_usd,bid_count").eq("item_id", itemId).order("seen_at", { ascending: true }).limit(500);
  const all = (ticks ?? []) as any[];
  const start = startReading(all, endMs);
  if (!start) return { ok: false, error: "that round isn't available" };

  const finalPrice = Number(l.final_price_usd ?? l.price_usd);
  const finalBids = Number(l.final_bid_count) || 0;
  const s = maxBid ? settleAuction(maxBid, finalPrice, finalBids) : { outcome: "passed" as const, fill: null, reason: "the clock ran out before a bid went in" };
  const shipping = num(l.payload?.shippingCost) ?? 0;
  const fmv = num(args.fmv);
  const gap = Number(l.final_seen_secs_before_end);
  const now = new Date().toISOString();
  const waitSecs = Math.max(0, Math.min(START_MAX_SECS, Math.round(args.secsLeft ?? 0)));
  const revealAt = new Date(Date.now() + waitSecs * 1000).toISOString();

  const steps = all
    .filter((t) => new Date(t.seen_at).getTime() > new Date(start.seen_at).getTime())
    .map((t) => ({ secsBeforeEnd: Math.max(0, Math.round((endMs - new Date(t.seen_at).getTime()) / 1000)), price: Number(t.price_usd), bids: Number(t.bid_count) || 0 }));

  const row = {
    owner, item_id: itemId, kind: "auction", title: l.title, series: l.series, issue: l.issue, grade: l.grade, source: l.venue,
    max_bid_usd: maxBid, shipping_usd: shipping, fmv_usd: fmv, fire_secs_before_end: waitSecs,
    end_time: l.end_time, status: s.outcome, final_price_usd: finalPrice, final_bid_count: finalBids, fill_price_usd: s.fill,
    paper_profit_usd: s.fill != null ? paperProfit(fmv, s.fill + shipping) : null,
    basis: `practice round on a real eBay auction that closed ${new Date(l.end_time).toUTCString().slice(0, 22)} UTC${gap > 0 ? `; closing price read ${gap}s before the end` : "; closing price read at the end"}`,
    detail: s.reason, settled_at: now,
    result: { replay: true, revealAt, startPrice: Number(start.price_usd), imageUrl: l.image_url ?? null, url: l.url ?? null, cert: l.cert_number ?? null, grader: l.grader ?? null },
  };
  const { data, error } = await db().from("sniper_paper_orders").insert(row).select("*").single();
  if (error) return { ok: false, error: error.message };

  if (waitSecs > 0) {
    return {
      ok: true,
      result: {
        order: maskReplayOrder(data, revealAt),
        closedAt: null,
        finalPrice: null,
        finalBids: null,
        steps: [],
        startPrice: Number(start.price_usd),
        locked: true,
        revealAt,
      },
    };
  }

  return { ok: true, result: { order: data, closedAt: l.end_time, finalPrice, finalBids, steps, startPrice: Number(start.price_usd), locked: false } };
}

export async function revealReplay(args: { owner: string; itemId: string }): Promise<{ ok: boolean; error?: string; result?: ReplayResult }> {
  const { owner, itemId } = args;
  if (!okOwner(owner)) return { ok: false, error: "bad owner" };

  const { data: orders } = await db().from("sniper_paper_orders").select("*").eq("owner", owner).eq("item_id", itemId).eq("kind", "auction").order("created_at", { ascending: false }).limit(10);
  const order = (orders ?? []).find((o: any) => o.result?.replay);
  if (!order) return { ok: false, error: "round not found" };

  const revealAtMs = order.result?.revealAt ? new Date(order.result.revealAt).getTime() : 0;
  if (revealAtMs > Date.now()) {
    return { ok: false, error: "clock still running" };
  }

  const { data: l } = await db().from("sniper_listings").select("*").eq("item_id", itemId).maybeSingle();
  if (!l) return { ok: false, error: "that round isn't available" };

  const endMs = new Date(l.end_time).getTime();
  const { data: ticks } = await db().from("sniper_ticks").select("seen_at,price_usd,bid_count").eq("item_id", itemId).order("seen_at", { ascending: true }).limit(500);
  const all = (ticks ?? []) as any[];
  const start = startReading(all, endMs);
  const startMs = start ? new Date(start.seen_at).getTime() : 0;

  const steps = all
    .filter((t) => new Date(t.seen_at).getTime() > startMs)
    .map((t) => ({ secsBeforeEnd: Math.max(0, Math.round((endMs - new Date(t.seen_at).getTime()) / 1000)), price: Number(t.price_usd), bids: Number(t.bid_count) || 0 }));

  const finalPrice = Number(order.final_price_usd ?? l.final_price_usd ?? l.price_usd);
  const finalBids = Number(order.final_bid_count ?? l.final_bid_count) || 0;
  const startPrice = Number(order.result?.startPrice ?? start?.price_usd ?? finalPrice);

  return {
    ok: true,
    result: {
      order,
      closedAt: l.end_time,
      finalPrice,
      finalBids,
      steps,
      startPrice,
      locked: false,
    },
  };
}

