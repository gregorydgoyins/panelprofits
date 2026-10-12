/**
 * Paper-trading orders for the Sniper (Panel Profits play money). Nothing is ever placed on a venue.
 *
 *  auction orders  armed with a max bid; settled against the real closing price of the real auction
 *  buy it now      a simulated seller (see haggle.ts) answers offers; the listing itself is real
 *
 * Owner is a device id from the browser: paper trading has no account.
 */
import { createAdminServerClient } from "@/lib/supabase/admin";
import { respondToOffer, sellerProfile, MAX_ROUNDS } from "./haggle";
import { paperProfit, settleAuction } from "./paper";
import { watchLot } from "./watch";

export interface PaperOrderRow {
  id: number;
  owner: string;
  item_id: string;
  kind: "auction" | "bin";
  title: string | null;
  series: string | null;
  issue: string | null;
  grade: number | null;
  source: string | null;
  max_bid_usd: number | null;
  shipping_usd: number;
  fmv_usd: number | null;
  ask_usd: number | null;
  seller: string | null;
  personality: string | null;
  haggle: Array<{ round: number; offer: number; result: string; price: number | null; message: string }>;
  fire_secs_before_end: number;
  end_time: string | null;
  status: string;
  final_price_usd: number | null;
  final_bid_count: number | null;
  fill_price_usd: number | null;
  paper_profit_usd: number | null;
  basis: string | null;
  detail: string | null;
  result: any;
  created_at: string;
  settled_at: string | null;
}

const db = () => createAdminServerClient() as any;
const num = (v: unknown): number | null => (v == null || v === "" || !Number.isFinite(Number(v)) ? null : Number(v));
const okOwner = (o: unknown): o is string => typeof o === "string" && o.length >= 8 && o.length <= 80;

async function loadListing(itemId: string) {
  const { data } = await db().from("sniper_listings").select("*").eq("item_id", itemId).maybeSingle();
  return data as any | null;
}

/** The seller's type stays hidden while the haggle is on; it is shown in the debrief once the deal is done or off. */
const hideSeller = (o: PaperOrderRow): PaperOrderRow => (o.status === "negotiating" ? { ...o, personality: null } : o);

export async function listOrders(owner: string): Promise<PaperOrderRow[]> {
  if (!okOwner(owner)) return [];
  const { data } = await db().from("sniper_paper_orders").select("*").eq("owner", owner).order("created_at", { ascending: false }).limit(100);
  const nowMs = Date.now();
  // Neither a practice round nor a live armed auction may reveal win/loss while its clock is still running.
  return ((data ?? []) as PaperOrderRow[]).map(hideSeller).map((o) => {
    if (o.result?.replay && o.result?.revealAt && new Date(o.result.revealAt).getTime() > nowMs) {
      return {
        ...o,
        status: "pending",
        final_price_usd: null,
        final_bid_count: null,
        fill_price_usd: null,
        paper_profit_usd: null,
        detail: null,
        basis: null,
        settled_at: null,
        result: { replay: true },
      };
    }
    if (
      o.kind === "auction" &&
      !o.result?.replay &&
      o.status !== "cancelled" &&
      (o.status === "armed" || (o.end_time != null && new Date(o.end_time).getTime() > nowMs))
    ) {
      return {
        ...o,
        status: "armed",
        final_price_usd: null,
        final_bid_count: null,
        fill_price_usd: null,
        paper_profit_usd: null,
        detail: null,
        basis: null,
        settled_at: null,
      };
    }
    return o;
  });
}

export async function cancelOrder(owner: string, id: number): Promise<boolean> {
  if (!okOwner(owner)) return false;
  const { data } = await db().from("sniper_paper_orders").update({ status: "cancelled", settled_at: new Date().toISOString() })
    .eq("owner", owner).eq("id", id).in("status", ["armed", "negotiating"]).select("id");
  return (data ?? []).length > 0;
}

export async function armAuction(args: { owner: string; itemId: string; maxBid: number; fireSecs?: number; fmv?: number | null }): Promise<{ ok: boolean; error?: string; order?: PaperOrderRow }> {
  const { owner, itemId } = args;
  if (!okOwner(owner)) return { ok: false, error: "bad owner" };
  const maxBid = num(args.maxBid);
  if (!maxBid || maxBid <= 0) return { ok: false, error: "max bid must be above zero" };
  const l = await loadListing(itemId);
  if (!l || l.status !== "live") return { ok: false, error: "that listing is no longer live" };
  if (l.buying_option !== "AUCTION" || !l.end_time) return { ok: false, error: "not an auction" };
  if (new Date(l.end_time).getTime() < Date.now() + 5000) return { ok: false, error: "this auction is about to end or already has" };

  const { data: existing } = await db().from("sniper_paper_orders").select("id").eq("owner", owner).eq("item_id", itemId).eq("status", "armed").maybeSingle();
  if (existing) return { ok: false, error: "you already have this auction armed" };

  const row = {
    owner, item_id: itemId, kind: "auction", title: l.title, series: l.series, issue: l.issue, grade: l.grade, source: l.venue,
    max_bid_usd: maxBid, shipping_usd: num(l.payload?.shippingCost) ?? 0, fmv_usd: num(args.fmv),
    fire_secs_before_end: Math.max(2, Math.min(30, Math.round(args.fireSecs ?? 4))), end_time: l.end_time, status: "armed",
    seller: l.payload?.sellerUsername ?? null,
    result: { imageUrl: l.image_url ?? null, url: l.url ?? null, cert: l.cert_number ?? null, grader: l.grader ?? null },
  };
  const { data, error } = await db().from("sniper_paper_orders").insert(row).select("*").single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, order: data as PaperOrderRow };
}

/** One simulated Buy It Now exchange. action: offer | accept_counter | buy_at_ask */
export async function binAction(args: { owner: string; itemId: string; action: "offer" | "accept_counter" | "buy_at_ask"; offer?: number; fmv?: number | null }): Promise<{ ok: boolean; error?: string; order?: PaperOrderRow }> {
  const { owner, itemId, action } = args;
  if (!okOwner(owner)) return { ok: false, error: "bad owner" };
  const l = await loadListing(itemId);
  if (!l || l.status !== "live") return { ok: false, error: "that listing is no longer live" };
  if (l.buying_option !== "FIXED_PRICE") return { ok: false, error: "not a Buy It Now listing" };
  const ask = num(l.price_usd);
  if (!ask || ask <= 0) return { ok: false, error: "listing has no price" };
  const shipping = num(l.payload?.shippingCost) ?? 0;
  const seller = String(l.payload?.sellerUsername ?? l.item_id);
  const profile = sellerProfile(seller, !!l.payload?.bestOfferEnabled);
  const now = new Date().toISOString();

  let { data: order } = await db().from("sniper_paper_orders").select("*").eq("owner", owner).eq("item_id", itemId).eq("status", "negotiating").maybeSingle();
  if (!order) {
    const { data: prior } = await db().from("sniper_paper_orders").select("id,status").eq("owner", owner).eq("item_id", itemId).in("status", ["won"]).limit(1);
    if (prior && prior.length) return { ok: false, error: "you already bought this one" };
    const seed = `${itemId}|${owner}|${Math.random().toString(36).slice(2)}`;
    const { data, error } = await db().from("sniper_paper_orders").insert({
      owner, item_id: itemId, kind: "bin", title: l.title, series: l.series, issue: l.issue, grade: l.grade, source: l.venue,
      shipping_usd: shipping, fmv_usd: num(args.fmv), ask_usd: ask, seller, personality: profile.label, fire_secs_before_end: 4,
      status: "negotiating", result: { seed, imageUrl: l.image_url ?? null, url: l.url ?? null, cert: l.cert_number ?? null, grader: l.grader ?? null },
    }).select("*").single();
    if (error) return { ok: false, error: error.message };
    order = data;
  }
  const rounds = (order.haggle ?? []) as PaperOrderRow["haggle"];
  const seed: string = order.result?.seed ?? `${itemId}|${owner}`;
  const buy = (price: number, why: string, log: PaperOrderRow["haggle"]) => ({
    status: "won", fill_price_usd: price, final_price_usd: price, paper_profit_usd: paperProfit(order.fmv_usd, price + shipping),
    basis: why, haggle: log, settled_at: now,
  });

  let patch: Record<string, unknown>;
  if (action === "buy_at_ask") {
    patch = buy(ask, "bought at the asking price", [...rounds, { round: rounds.length + 1, offer: ask, result: "accepted", price: ask, message: "Bought at the asking price." }]);
  } else if (action === "accept_counter") {
    const last = rounds[rounds.length - 1];
    if (!last || last.result !== "countered" || !last.price) return { ok: false, error: "there is no counter to accept" };
    patch = buy(last.price, "accepted the seller's counter", [...rounds, { round: rounds.length + 1, offer: last.price, result: "accepted", price: last.price, message: "You accepted the counter." }]);
  } else {
    const offer = num(args.offer);
    if (!offer || offer <= 0) return { ok: false, error: "enter an offer" };
    const round = rounds.length + 1;
    if (round > MAX_ROUNDS) return { ok: false, error: "no offers left; buy at the asking price or walk away" };
    const reply = respondToOffer({ ask, offer, round, profile, seed });
    const log = [...rounds, { round, offer, result: reply.result, price: reply.price, message: reply.message }];
    if (reply.result === "accepted" && reply.price) patch = buy(reply.price, "simulated seller accepted the offer", log);
    else if (round >= MAX_ROUNDS && reply.result !== "countered") patch = { status: "declined", haggle: log, settled_at: now, basis: "offers used up", final_price_usd: ask };
    else patch = { haggle: log };
  }
  const { data: saved, error: upErr } = await db().from("sniper_paper_orders").update(patch).eq("id", order.id).select("*").single();
  if (upErr) return { ok: false, error: upErr.message };
  return { ok: true, order: hideSeller(saved as PaperOrderRow) };
}

// ───────────────────────────── scheduled work ─────────────────────────────

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Closing watch: read the eBay auctions that are about to end so their closing prices are the real ones.
 * Without it the last price we hold can be minutes old, and last-second bids are exactly what moves the price.
 * Bounded: only lots with bids and a meaningful price, a few per run, and it stops the moment eBay says 429.
 */
const CLOSE_WATCH_MIN_PRICE = 25;
const CLOSE_WATCH_MAX_LOTS = 6;
const CLOSE_WATCH_AHEAD_MS = 62_000;

export async function closingWatch(started: number): Promise<number> {
  const { data } = await db().from("sniper_listings").select("item_id,end_time,price_usd")
    .eq("status", "live").eq("venue", "ebay").eq("buying_option", "AUCTION").gt("bid_count", 0).gte("price_usd", CLOSE_WATCH_MIN_PRICE)
    .gt("end_time", new Date(started + 1000).toISOString()).lt("end_time", new Date(started + CLOSE_WATCH_AHEAD_MS).toISOString())
    .order("price_usd", { ascending: false }).limit(CLOSE_WATCH_MAX_LOTS);
  const lots = (data ?? []) as Array<{ item_id: string; end_time: string }>;
  let reads = 0, blocked = false;
  const read = async (id: string) => {
    if (blocked) return;
    const r = await watchLot(id, { observe: true });
    reads++;
    if (r.status === 429) blocked = true;
  };
  await Promise.all(lots.map(async (l) => {
    const endMs = new Date(l.end_time).getTime();
    await read(l.item_id); // a reading now
    const wait = (target: number) => (blocked ? Promise.resolve() : sleep(Math.max(0, target - Date.now())));
    if (endMs - Date.now() > 8000) { await wait(endMs - 5000); await read(l.item_id); } // the last seconds
    if (endMs + 7000 - started < 52_000) { await wait(endMs + 7000); await read(l.item_id); } // just after the close
  }));
  return reads;
}

export async function paperTick(): Promise<{ watched: number; settled: number; unresolved: number; closingReads: number }> {
  const d = db();
  const started = Date.now();
  const closingJob = closingWatch(started).catch(() => 0);

  // 1. Armed auctions about to close: read eBay every ~3 seconds so the closing price is captured, not guessed.
  const horizon = new Date(started + 75_000).toISOString();
  const { data: closing } = await d.from("sniper_paper_orders").select("item_id,end_time")
    .eq("status", "armed").eq("kind", "auction").gt("end_time", new Date(started).toISOString()).lt("end_time", horizon);
  const ids = Array.from(new Set<string>((closing ?? []).map((o: any) => o.item_id)));
  let watched = 0;
  if (ids.length) {
    while (Date.now() - started < 50_000) {
      const reads = await Promise.all(ids.map((id) => watchLot(id)));
      watched += reads.length;
      if (reads.every((r) => r.ended)) break;
      await sleep(3000);
    }
  }

  // 2. Settle orders whose auction has ended.
  const { data: due } = await d.from("sniper_paper_orders").select("*")
    .eq("status", "armed").eq("kind", "auction").lt("end_time", new Date(Date.now() - 10_000).toISOString()).limit(100);
  let settled = 0, unresolved = 0;
  for (const o of (due ?? []) as PaperOrderRow[]) {
    let finalPrice: number | null = null, bids = 0, basis = "";
    const live = await watchLot(o.item_id);
    if (live.ok && live.ended && live.currentBid != null) {
      finalPrice = live.currentBid; bids = live.bidCount ?? 0; basis = "eBay's own reading after the close";
    } else {
      const l = await loadListing(o.item_id);
      if (l && l.price_usd != null && l.last_seen && o.end_time) {
        const secsBefore = Math.round((new Date(o.end_time).getTime() - new Date(l.last_seen).getTime()) / 1000);
        finalPrice = Number(l.price_usd); bids = Number(l.bid_count) || 0;
        basis = `last price we saw, ${secsBefore}s before the close${secsBefore > 900 ? " (approximate: a late bid may have moved it)" : ""}`;
      }
    }
    const now = new Date().toISOString();
    if (finalPrice == null || !o.max_bid_usd) {
      await d.from("sniper_paper_orders").update({ status: "unresolved", detail: "could not read the closing price", settled_at: now }).eq("id", o.id);
      unresolved++;
      continue;
    }
    const s = settleAuction(Number(o.max_bid_usd), finalPrice, bids);
    await d.from("sniper_paper_orders").update({
      status: s.outcome, final_price_usd: finalPrice, final_bid_count: bids, fill_price_usd: s.fill,
      paper_profit_usd: s.fill != null ? paperProfit(o.fmv_usd, s.fill + Number(o.shipping_usd || 0)) : null,
      basis, detail: s.reason, settled_at: now, result: { ...(o.result ?? {}), closedAt: o.end_time, finalPrice, bids },
    }).eq("id", o.id);
    settled++;
  }
  return { watched, settled, unresolved, closingReads: await closingJob };
}
