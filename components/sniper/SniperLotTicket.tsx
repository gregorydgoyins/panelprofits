"use client";
import { useState } from "react";
import type { SniperGameController } from "./SniperGame";

/** The original lot modal submits to the same funded account as the radar desk. */
export function SniperLotTicket({ desk, itemId, isBuyItNow }: { desk: SniperGameController; itemId: string; isBuyItNow: boolean }) {
 const [amount, setAmount] = useState("");
 const [accepted, setAccepted] = useState<number | null>(null);
 if (isBuyItNow) return <p className="rounded-xl border border-slate-700 p-3 text-xs text-slate-400">Fixed-price listing · research only. Timed training bids are available on auction lots.</p>;
 return <form className="rounded-xl border border-cyan-500/40 bg-slate-900/70 p-3 space-y-3" onSubmit={async event => { event.preventDefault(); const bid=Number(amount); if (await desk.act({action:"listingBid",itemId,amount:bid})) setAccepted(bid); }}>
  <p className="text-xs font-bold uppercase text-cyan-300">Paper snipe · funded account</p>
  <p className="text-xs text-slate-400">Available S${desk.game?.account.available.toLocaleString() ?? "…"}. Your accepted direct bid is charged whether you win or lose. A win awards the comic to your collection.</p>
  <label className="block text-xs text-slate-300">Your bid · Sniper dollars<input required type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="mt-2 w-full rounded border border-slate-600 bg-black/40 p-2 font-mono text-white" /></label>
  <button disabled={desk.busy || !desk.game} className="w-full rounded-lg bg-amber-400 px-3 py-2 text-xs font-bold text-slate-950 disabled:opacity-40">{desk.busy ? "Submitting…" : "Commit paper bid"}</button>
  {accepted != null && <p role="status" className="text-xs font-bold text-emerald-300">Accepted · S${accepted.toLocaleString()} reserved. Your round is running on the radar.</p>}
  {desk.error && <p role="alert" className="text-xs text-rose-300">{desk.error}</p>}
  <p role="status" className="text-xs text-slate-400">Accepted bids and their clocks appear on the radar above the market listings. No real funds or venue bids.</p>
 </form>;
}
