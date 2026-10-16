"use client";

import * as React from "react";
import { bidIncrement, paperProfit } from "@/lib/sniper/paper";

export interface PaperOrder {
  id: number;
  item_id: string;
  kind: "auction" | "bin";
  title: string | null;
  max_bid_usd: number | null;
  shipping_usd: number;
  fmv_usd: number | null;
  ask_usd: number | null;
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

const $ = (n: number | null | undefined) => (n == null ? "—" : `$${Number(n).toFixed(2)}`);
const ROUNDS = 3;

export function usePaperOrders(enabled = true) {
  const [owner, setOwner] = React.useState("");
  const [orders, setOrders] = React.useState<PaperOrder[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let id = "";
    try {
      id = localStorage.getItem("pp_sniper_device") || "";
      if (!id) {
        id = (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`);
        localStorage.setItem("pp_sniper_device", id);
      }
    } catch {
      id = `dev-${Math.random().toString(36).slice(2)}-session`;
    }
    setOwner(id);
  }, []);

  const refresh = React.useCallback(async () => {
    if (!owner || !enabled) return;
    try {
      const r = await fetch(`/api/sniper/paper-orders?owner=${encodeURIComponent(owner)}`, { cache: "no-store" });
      const j = await r.json();
      if (j?.success) setOrders(j.orders);
    } catch {}
  }, [owner, enabled]);

  React.useEffect(() => {
    if (!owner || !enabled) return;
    refresh();
    const t = setInterval(refresh, 15000);
    return () => clearInterval(t);
  }, [owner, refresh, enabled]);

  const post = React.useCallback(async (body: Record<string, unknown>) => {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/sniper/paper-orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ owner, ...body }) });
      const j = await r.json();
      if (!j.success) setError(j.error || "Something went wrong");
      await refresh();
      return j.success ? (j.order as PaperOrder) : null;
    } finally {
      setBusy(false);
    }
  }, [owner, refresh, enabled]);

  return {
    owner, orders, busy, error, refresh,
    forItem: (itemId: string) => orders.find((o) => o.item_id === itemId && o.status !== "cancelled") ?? null,
    arm: (itemId: string, maxBid: number, fmv: number | null) => post({ action: "arm", itemId, maxBid, fmv }),
    offer: (itemId: string, offer: number, fmv: number | null) => post({ action: "offer", itemId, offer, fmv }),
    acceptCounter: (itemId: string) => post({ action: "accept_counter", itemId }),
    buyAtAsk: (itemId: string, fmv: number | null) => post({ action: "buy_at_ask", itemId, fmv }),
    cancel: async (id: number) => {
      await fetch(`/api/sniper/paper-orders?owner=${encodeURIComponent(owner)}&id=${id}`, { method: "DELETE" });
      await refresh();
    },
  };
}

type Paper = ReturnType<typeof usePaperOrders>;

function Outcome({ o }: { o: PaperOrder }) {
  const allIn = o.fill_price_usd != null ? o.fill_price_usd + Number(o.shipping_usd || 0) : null;
  const exit = o.fmv_usd ? o.fmv_usd * 0.87 - 5 : null;
  if (o.status === "outbid" && o.final_price_usd != null) {
    const needed = o.final_price_usd + bidIncrement(o.final_price_usd);
    const atWinning = paperProfit(o.fmv_usd, needed + Number(o.shipping_usd || 0));
    return (
      <div className="text-[11px] space-y-0.5">
        <div className="text-rose-300">Outbid. It closed at {$(o.final_price_usd)} with {o.final_bid_count ?? 0} bids; you needed {$(needed)}.</div>
        {atWinning != null && (
          atWinning > 0
            ? <div className="text-amber-300">At the winning price this still cleared {$(atWinning)} against your value. Your max was {$(needed - Number(o.max_bid_usd ?? 0))} short.</div>
            : <div className="text-emerald-300">A good pass: at the winning price there was no profit left ({$(atWinning)}).</div>
        )}
      </div>
    );
  }
  if (o.status === "won" && allIn != null) {
    return (
      <div className="text-[11px] space-y-0.5">
        <div className="text-emerald-300">Won at {$(o.fill_price_usd)} ({$(allIn)} with shipping){o.kind === "auction" ? `; the auction closed at ${$(o.final_price_usd)}` : ""}.</div>
        {exit != null && o.paper_profit_usd != null && (
          <div className={o.paper_profit_usd >= 0 ? "text-emerald-300" : "text-rose-300"}>
            Exit value after fees and shipping {$(exit)} → paper {o.paper_profit_usd >= 0 ? "profit" : "loss"} {$(Math.abs(o.paper_profit_usd))}.
          </div>
        )}
      </div>
    );
  }
  if (o.status === "passed") return <div className="text-[11px] text-slate-400">The clock ran out before a bid went in. It closed at {$(o.final_price_usd)} with {o.final_bid_count ?? 0} bids.</div>;
  if (o.status === "declined") return <div className="text-[11px] text-rose-300">The seller wouldn't deal within three offers.</div>;
  if (o.status === "unresolved") return <div className="text-[11px] text-slate-400">Couldn't read the closing price, so this one isn't scored.</div>;
  return null;
}

/** The ticket shown in the lot's vault view: arm a paper snipe on an auction, or haggle on a Buy It Now. */
export function PaperTicket({ itemId, isBuyItNow, ask, recommendedMax, fmv, secondsRemaining, paper }: {
  itemId: string; isBuyItNow: boolean; ask: number; recommendedMax: number; fmv: number | null; secondsRemaining: number; paper: Paper;
}) {
  const order = paper.forItem(itemId);
  const [max, setMax] = React.useState(() => String(Math.max(1, Math.round(recommendedMax || ask))));
  const [offer, setOffer] = React.useState(() => String(Math.max(1, Math.round(ask * 0.9 * 2) / 2)));
  const live = isBuyItNow || secondsRemaining > 10;
  const used = order?.haggle?.length ?? 0;
  const last = order?.haggle?.[order.haggle.length - 1];

  return (
    <div className="rounded-xl border border-cyan-500/30 bg-slate-950/70 p-3 font-mono space-y-2">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider">
        <span className="text-cyan-300 font-bold">{isBuyItNow ? "Paper buy · simulated seller" : "Paper snipe"}</span>
        <span className="text-slate-500">play money · nothing is sent to any venue</span>
      </div>

      {!isBuyItNow && !order && (
        <>
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-slate-400 uppercase">Max bid $</label>
            <input value={max} onChange={(e) => setMax(e.target.value)} inputMode="decimal" className="w-24 rounded bg-slate-900 border border-slate-700 px-2 py-1 text-xs text-white" />
            <button
              disabled={!live || paper.busy || !(Number(max) > 0)}
              onClick={() => paper.arm(itemId, Number(max), fmv)}
              className="flex-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-bold uppercase py-1.5 cursor-pointer"
            >
              🎯 Arm paper snipe
            </button>
          </div>
          <div className="text-[10px] text-slate-500">Settles against what the real auction closes at. Your bid goes in at the last seconds, so nobody can react to it.</div>
        </>
      )}

      {!isBuyItNow && order?.status === "armed" && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-cyan-300">Armed at max {$(order.max_bid_usd)} · fires {order.fire_secs_before_end}s before the end · settles after the close</span>
          <button onClick={() => paper.cancel(order.id)} className="text-[10px] text-slate-400 underline cursor-pointer">cancel</button>
        </div>
      )}

      {isBuyItNow && (!order || order.status === "negotiating") && (
        <>
          {order?.personality && <div className="text-[10px] text-amber-300">Seller: {order.personality}</div>}
          {order?.haggle?.map((h) => (
            <div key={h.round} className="text-[11px] flex gap-2">
              <span className="text-slate-500">#{h.round}</span>
              <span className="text-slate-300">You offered {$(h.offer)}</span>
              <span className={h.result === "accepted" ? "text-emerald-300" : h.result === "countered" ? "text-amber-300" : "text-rose-300"}>→ {h.message}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-slate-400 uppercase">Offer $</label>
            <input value={offer} onChange={(e) => setOffer(e.target.value)} inputMode="decimal" className="w-24 rounded bg-slate-900 border border-slate-700 px-2 py-1 text-xs text-white" />
            <button
              disabled={paper.busy || used >= ROUNDS || !(Number(offer) > 0)}
              onClick={() => paper.offer(itemId, Number(offer), fmv)}
              className="flex-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-bold uppercase py-1.5 cursor-pointer"
            >
              Make offer ({Math.max(0, ROUNDS - used)} left)
            </button>
          </div>
          <div className="flex gap-2">
            {last?.result === "countered" && last.price && (
              <button disabled={paper.busy} onClick={() => paper.acceptCounter(itemId)} className="flex-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold uppercase py-1.5 cursor-pointer">
                Accept {$(last.price)}
              </button>
            )}
            <button disabled={paper.busy} onClick={() => paper.buyAtAsk(itemId, fmv)} className="flex-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-bold uppercase py-1.5 cursor-pointer">
              Buy at {$(ask)}
            </button>
          </div>
          <div className="text-[10px] text-slate-500">The listing is real; the seller is simulated. Each seller has a fixed type, and eBay's Best Offer flag makes them more flexible.</div>
        </>
      )}

      {order && order.status !== "armed" && order.status !== "negotiating" && <Outcome o={order} />}
      {paper.error && <div className="text-[11px] text-rose-300">{paper.error}</div>}
    </div>
  );
}

/** Every paper order, with what actually happened and what it teaches. */
export function PaperLedger({ orders }: { orders: PaperOrder[] }) {
  const shown = orders.filter((o) => o.status !== "cancelled");
  const settled = shown.filter((o) => o.paper_profit_usd != null);
  const total = settled.reduce((a, o) => a + Number(o.paper_profit_usd), 0);
  const wins = shown.filter((o) => o.status === "won").length;
  return (
    <div className="bg-[#0E131F] border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
          <span>📖</span> Paper Trading Ledger ({shown.length})
        </h3>
        <span className="text-xs font-mono text-slate-400">
          {wins} won · {settled.length ? `net ${total >= 0 ? "+" : "−"}$${Math.abs(total).toFixed(2)} paper` : "play money"}
        </span>
      </div>
      {shown.length === 0 ? (
        <p className="text-xs text-slate-500 font-mono italic">
          No paper orders yet. Open any lot, arm a snipe on an auction or haggle on a Buy It Now, and the result lands here when the real auction closes.
        </p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {shown.map((o) => (
            <div key={o.id} className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 text-xs space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <strong className="text-white">{o.title ?? o.item_id}</strong>
                <span className="px-1.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">{o.kind === "bin" ? "BUY IT NOW" : o.result?.replay ? "PRACTICE ROUND" : "AUCTION"}</span>
                <span className={`px-1.5 rounded text-[10px] font-bold ${o.status === "won" ? "bg-emerald-500/20 text-emerald-300" : o.status === "armed" || o.status === "negotiating" || o.status === "pending" ? "bg-cyan-500/20 text-cyan-300" : "bg-rose-500/20 text-rose-300"}`}>
                  {o.status.toUpperCase()}
                </span>
              </div>
              <div className="font-mono text-[11px] text-slate-400 flex flex-wrap gap-x-4">
                {o.kind === "auction" ? <span>your max {$(o.max_bid_usd)}</span> : <span>asking {$(o.ask_usd)}</span>}
                {o.final_price_usd != null && <span>{o.kind === "auction" ? "closed" : "price"} {$(o.final_price_usd)}</span>}
                {o.fmv_usd != null && <span>your value {$(o.fmv_usd)}</span>}
                {o.end_time && o.status === "armed" && <span>ends {new Date(o.end_time).toLocaleString()}</span>}
              </div>
              <Outcome o={o} />
              {o.basis && <div className="text-[10px] text-slate-500">{o.basis}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
