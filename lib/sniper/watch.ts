/**
 * Live watch of one eBay auction: the price, bid count and end time as eBay reports them right now.
 * Used for the lots a sniper is armed on. Calls are shared (3-second cache, one in-flight call per lot) so many viewers
 * of the same lot cost eBay one request, and every change is written to the lot's bid history.
 */
import { createAdminServerClient } from "@/lib/supabase/admin";
import { getEbayOAuthToken } from "./ebay-api";

export interface LiveLot {
  id: string; // ebay-<legacy item id>
  ok: boolean;
  status: number; // HTTP status from eBay, 0 when no call was made
  ended: boolean;
  currentBid: number | null;
  /** the smallest bid eBay will accept right now */
  minNextBid: number | null;
  bidCount: number | null;
  uniqueBidders: number | null;
  endsAt: string | null;
  secondsRemaining: number | null;
  reserveMet: boolean | null;
  fetchedAt: string;
  error?: string;
}

const TTL_MS = 3000;
const cache = new Map<string, { at: number; value: LiveLot }>();
const inflight = new Map<string, Promise<LiveLot>>();

export const legacyId = (raw: string): string | null => {
  const m = String(raw).match(/(\d{9,14})/);
  return m ? m[1] : null;
};

async function fetchOnce(id: string, legacy: string): Promise<LiveLot> {
  const base: LiveLot = {
    id, ok: false, status: 0, ended: false, currentBid: null, minNextBid: null, bidCount: null, uniqueBidders: null,
    endsAt: null, secondsRemaining: null, reserveMet: null, fetchedAt: new Date().toISOString(),
  };
  const token = await getEbayOAuthToken();
  if (!token) return { ...base, error: "no eBay token" };
  try {
    const res = await fetch(`https://api.ebay.com/buy/browse/v1/item/get_item_by_legacy_id?legacy_item_id=${legacy}`, {
      headers: { Authorization: `Bearer ${token}`, "X-EBAY-C-MARKETPLACE-ID": "EBAY_US" },
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return { ...base, status: res.status, error: res.status === 429 ? "eBay rate limit" : `eBay ${res.status}` };
    const it = await res.json();
    const bid = parseFloat(it.currentBidPrice?.value ?? it.price?.value ?? "");
    const min = parseFloat(it.minimumPriceToBid?.value ?? "");
    const endsAt: string | null = it.itemEndDate ?? null;
    const secs = endsAt ? Math.round((new Date(endsAt).getTime() - Date.now()) / 1000) : null;
    return {
      ...base,
      ok: true,
      status: res.status,
      currentBid: Number.isFinite(bid) ? bid : null,
      minNextBid: Number.isFinite(min) ? min : null,
      bidCount: typeof it.bidCount === "number" ? it.bidCount : null,
      uniqueBidders: typeof it.uniqueBidderCount === "number" ? it.uniqueBidderCount : null,
      endsAt,
      secondsRemaining: secs != null ? Math.max(0, secs) : null,
      ended: secs != null && secs <= 0,
      reserveMet: typeof it.reservePriceMet === "boolean" ? it.reservePriceMet : null,
      // USD only: other marketplaces quote native currency
      ...(it.currentBidPrice?.currency && it.currentBidPrice.currency !== "USD" ? { currentBid: null, minNextBid: null } : {}),
    };
  } catch (e) {
    return { ...base, error: (e as Error).message };
  }
}

export async function watchLot(rawId: string, opts?: { observe?: boolean }): Promise<LiveLot> {
  const legacy = legacyId(rawId);
  const id = `ebay-${legacy}`;
  if (!legacy) return { id: rawId, ok: false, status: 0, ended: false, currentBid: null, minNextBid: null, bidCount: null, uniqueBidders: null, endsAt: null, secondsRemaining: null, reserveMet: null, fetchedAt: new Date().toISOString(), error: "bad item id" };

  const hit = cache.get(id);
  if (hit && Date.now() - hit.at < TTL_MS) {
    // age the countdown from the cached end time instead of calling eBay again
    const s = hit.value.endsAt ? Math.max(0, Math.round((new Date(hit.value.endsAt).getTime() - Date.now()) / 1000)) : hit.value.secondsRemaining;
    return { ...hit.value, secondsRemaining: s };
  }
  const running = inflight.get(id);
  if (running) return running;

  const p = (async () => {
    const value = await fetchOnce(id, legacy);
    cache.set(id, { at: Date.now(), value });
    if (value.ok && value.currentBid != null) await recordTick(value, !!opts?.observe);
    return value;
  })().finally(() => inflight.delete(id));
  inflight.set(id, p);
  return p;
}

/** Keep the lot's stored price and bid history current whenever a watch sees it move. */
/** observe: also write a reading when nothing moved, so the history shows what the price was at that moment. */
async function recordTick(v: LiveLot, observe = false) {
  try {
    const db: any = createAdminServerClient();
    const { data: row } = await db.from("sniper_listings").select("price_usd,bid_count").eq("item_id", v.id).maybeSingle();
    if (!row) return; // not a lot the snapshot knows; nothing to extend
    const moved = Number(row.price_usd) !== v.currentBid || Number(row.bid_count) !== (v.bidCount ?? 0);
    const patch: Record<string, unknown> = { last_seen: v.fetchedAt };
    if (v.endsAt) patch.end_time = v.endsAt;
    if (moved) { patch.price_usd = v.currentBid; patch.bid_count = v.bidCount ?? 0; }
    await db.from("sniper_listings").update(patch).eq("item_id", v.id);
    if (moved || observe) await db.from("sniper_ticks").insert({ item_id: v.id, seen_at: v.fetchedAt, price_usd: v.currentBid, bid_count: v.bidCount ?? 0 });
  } catch {}
}
