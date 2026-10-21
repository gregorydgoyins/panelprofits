"use client";

import * as React from "react";
import { paperProfit } from "@/lib/sniper/paper";

interface Round {
  itemId: string; title: string; series: string | null; issue: string | null; grade: number | null; grader: string | null; cert: string | null;
  imageUrl: string | null; url: string | null; shippingUsd: number; endedAt: string;
  startPrice: number; startBids: number; minNextBid: number; startSecs: number;
}
interface Reveal {
  order: { status: string; fill_price_usd: number | null; paper_profit_usd: number | null; detail: string | null; basis: string | null; shipping_usd: number };
  closedAt: string; finalPrice: number; finalBids: number; startPrice: number;
  steps: Array<{ secsBeforeEnd: number; price: number; bids: number }>;
}

const $ = (n: number | null | undefined) => (n == null ? "—" : `$${Number(n).toFixed(2)}`);
const gradeLabel = (r: Round) => `${r.grader ?? ""} ${r.grade ?? ""}`.trim();

/**
 * Last-second bid practice. A real eBay auction that already closed is replayed from about a minute out. The player
 * sets a max and fires with the clock running; then the real close is revealed and the bid is scored win or loss.
 */
export function ReplayRoom({ owner, onPlayed }: { owner: string; onPlayed?: () => void }) {
  const [rounds, setRounds] = React.useState<Round[] | null>(null);
  const [pool, setPool] = React.useState(0);
  const [pick, setPick] = React.useState<Round | null>(null);
  const [max, setMax] = React.useState("");
  const [exit, setExit] = React.useState("");
  const [left, setLeft] = React.useState(0);
  const [phase, setPhase] = React.useState<"idle" | "running" | "locked" | "playing" | "done">("idle");
  const [reveal, setReveal] = React.useState<Reveal | null>(null);
  const [shown, setShown] = React.useState(0);
  const [err, setErr] = React.useState<string | null>(null);
  const firedRef = React.useRef(false);

  const load = React.useCallback(async () => {
    if (!owner) return;
    try {
      const j = await (await fetch(`/api/sniper/replay?owner=${encodeURIComponent(owner)}`, { cache: "no-store" })).json();
      if (j?.success) { setRounds(j.lots); setPool(j.pool); }
    } catch { setRounds([]); }
  }, [owner]);
  React.useEffect(() => { load(); }, [load]);

  const start = (r: Round) => {
    firedRef.current = false;
    setPick(r); setReveal(null); setErr(null); setShown(0);
    setMax(String(Math.ceil(r.minNextBid))); setExit("");
    setLeft(r.startSecs); setPhase("running");
  };

  // Firing locks the bid in. The server keeps the outcome sealed until the clock reaches zero.
  const settle = React.useCallback(async (r: Round, body: Record<string, unknown>, lock: boolean) => {
    if (firedRef.current) return;
    firedRef.current = true;
    setPhase(lock ? "locked" : "playing");
    try {
      const resp = await fetch("/api/sniper/replay", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ owner, itemId: r.itemId, ...body }) });
      const j = await resp.json();
      if (!j.success) { setErr(j.error || "That round isn't available"); setPhase("idle"); load(); return; }
      if (!lock) setReveal(j as Reveal);
    } catch { setErr("Couldn't reach the server"); setPhase("idle"); }
  }, [owner, load]);

  const unseal = React.useCallback(async (r: Round) => {
    try {
      const resp = await fetch("/api/sniper/replay", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ owner, itemId: r.itemId, reveal: true }) });
      const j = await resp.json();
      if (!j.success) {
        if (j.error === "clock still running") {
          setTimeout(() => unseal(r), 400);
          return;
        }
        setErr(j.error || "Couldn't reveal round"); setPhase("idle"); return;
      }
      setReveal(j as Reveal);
      setPhase("playing");
    } catch { setErr("Couldn't reach the server"); setPhase("idle"); }
  }, [owner]);

  // the clock
  React.useEffect(() => {
    if (phase !== "running" && phase !== "locked") return;
    const t = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [phase]);
  React.useEffect(() => {
    if (phase === "running" && left <= 0 && pick) settle(pick, { pass: true }, false);
    if (phase === "locked" && left <= 0 && pick && !reveal) unseal(pick);
  }, [left, phase, pick, settle, reveal, unseal]);

  // play the real closing back, step by step
  React.useEffect(() => {
    if (phase !== "playing" || !reveal) return;
    if (shown >= reveal.steps.length) { const t = setTimeout(() => { setPhase("done"); onPlayed?.(); }, 600); return () => clearTimeout(t); }
    const t = setTimeout(() => setShown((n) => n + 1), 450);
    return () => clearTimeout(t);
  }, [phase, reveal, shown, onPlayed]);

  const fire = () => pick && settle(pick, { maxBid: Number(max), fmv: Number(exit) > 0 ? Number(exit) : null, secsLeft: Math.max(0, left) }, left > 0);

  if (pick && phase !== "idle") {
    const lastStep = reveal && shown > 0 ? reveal.steps[Math.min(shown, reveal.steps.length) - 1] : null;
    const price = phase === "running" || phase === "locked" ? pick.startPrice : lastStep ? lastStep.price : pick.startPrice;
    const bids = phase === "running" || phase === "locked" ? pick.startBids : lastStep ? lastStep.bids : pick.startBids;
    const o = reveal?.order;
    const exitV = Number(exit) > 0 ? Number(exit) : null;
    const allIn = o?.fill_price_usd != null ? o.fill_price_usd + Number(o.shipping_usd || 0) : null;
    return (
      <div className="rounded-xl border border-fuchsia-500/30 bg-[#0E131F] p-4 space-y-3 font-mono">
        <div className="flex gap-3">
          {pick.imageUrl && <img src={pick.imageUrl} alt="" className="w-24 h-32 object-cover rounded border border-slate-700" />}
          <div className="flex-1 space-y-1 min-w-0">
            <div className="text-white font-bold text-sm truncate">{pick.title}</div>
            <div className="text-[11px] text-slate-400">{gradeLabel(pick)} · ships {$(pick.shippingUsd)}</div>
            <div className="flex items-end gap-4">
              <div><div className="text-[10px] text-slate-500 uppercase">Current bid</div><div className="text-2xl text-cyan-300 font-bold">{$(price)}</div></div>
              <div><div className="text-[10px] text-slate-500 uppercase">Bids</div><div className="text-lg text-white">{bids}</div></div>
              <div><div className="text-[10px] text-slate-500 uppercase">Ends in</div><div className={`text-lg font-bold ${(phase === "running" || phase === "locked") && left <= 10 ? "text-rose-400" : "text-white"}`}>{phase === "running" || phase === "locked" ? `${Math.max(0, left)}s` : phase === "playing" ? "…" : "closed"}</div></div>
            </div>
          </div>
        </div>

        {phase === "running" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <label className="text-[10px] text-slate-400 uppercase">Max bid $</label>
              <input value={max} onChange={(e) => setMax(e.target.value)} inputMode="decimal" className="w-24 rounded bg-slate-900 border border-slate-700 px-2 py-1 text-xs text-white" />
              <label className="text-[10px] text-slate-400 uppercase">Your exit $</label>
              <input value={exit} onChange={(e) => setExit(e.target.value)} inputMode="decimal" placeholder="optional" className="w-24 rounded bg-slate-900 border border-slate-700 px-2 py-1 text-xs text-white" />
              <button onClick={fire} disabled={!(Number(max) > 0)} className="flex-1 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-40 text-white text-xs font-bold uppercase py-2 cursor-pointer">⚡ Fire last-second bid</button>
            </div>
            <div className="text-[10px] text-slate-500">Next bid eBay would take: {$(pick.minNextBid)}. Wait too long and it's gone, the way these disappear in real life.</div>
          </div>
        )}

        {phase === "locked" && (
          <div className="text-xs text-cyan-300">Bid locked in at {$(Number(max))}. You won't know how it did until the clock hits zero.</div>
        )}

        {phase === "playing" && <div className="text-xs text-fuchsia-300 animate-pulse">The auction is closing…</div>}

        {phase === "done" && reveal && o && (
          <div className="space-y-1.5">
            {o.status === "won" && <div className="text-emerald-300 font-bold text-sm">WIN — your bid cleared the close. Paper price {$(o.fill_price_usd)} ({$(allIn)} with shipping).</div>}
            {o.status === "outbid" && <div className="text-rose-300 font-bold text-sm">LOSS — it closed at {$(reveal.finalPrice)} and your max wasn't enough.</div>}
            {o.status === "passed" && <div className="text-slate-300 font-bold text-sm">MISSED — the clock ran out. It closed at {$(reveal.finalPrice)}.</div>}
            <div className="text-[11px] text-slate-400">It really closed at {$(reveal.finalPrice)} with {reveal.finalBids} bids. {o.detail}.</div>
            {o.status === "won" && exitV != null && o.paper_profit_usd != null && (
              <div className={`text-[11px] ${o.paper_profit_usd >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                Against your {$(exitV)} exit (after 13% fees and $5 shipping out): paper {o.paper_profit_usd >= 0 ? "profit" : "loss"} {$(Math.abs(o.paper_profit_usd))}.
              </div>
            )}
            {o.status === "outbid" && exitV != null && (() => {
              const atClose = paperProfit(exitV, reveal.finalPrice + pick.shippingUsd);
              return atClose != null ? <div className={`text-[11px] ${atClose > 0 ? "text-amber-300" : "text-emerald-300"}`}>{atClose > 0 ? `At the closing price your exit still had ${$(atClose)} in it.` : `A fair pass: at the closing price your exit left ${$(atClose)}.`}</div> : null;
            })()}
            <div className="text-[10px] text-slate-500">Practice round on a real eBay auction that closed {new Date(reveal.closedAt).toLocaleString()}. Play money; nothing was sent to eBay. {o.status === "won" ? "This model assumes the winner's hidden maximum was just above the closing price." : ""}</div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => { setPick(null); setPhase("idle"); load(); }} className="rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold uppercase px-3 py-1.5 cursor-pointer">Next round</button>
              {pick.url && <a href={pick.url} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-600 text-slate-300 text-xs px-3 py-1.5">See it on eBay ↗</a>}
            </div>
          </div>
        )}
        {err && <div className="text-[11px] text-rose-300">{err}</div>}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-fuchsia-500/30 bg-[#0E131F] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-fuchsia-300 font-mono">⚡ Last-second practice</h3>
        <span className="text-[10px] text-slate-500 font-mono">real auctions · play money</span>
      </div>
      <p className="text-[11px] text-slate-400 font-mono">Each round is a real eBay auction with about a minute left. Set your max, fire when you're ready, and see whether it clears the close.</p>
      {err && <div className="text-[11px] text-rose-300 font-mono">{err}</div>}
      {rounds == null && <div className="text-xs text-slate-500 font-mono">Loading rounds…</div>}
      {rounds && rounds.length === 0 && (
        <div className="text-xs text-slate-500 font-mono italic">
          {pool > 0 ? "You've played every round on offer. New ones arrive as auctions close." : "No rounds yet. They're built from auctions the watcher sees through their last minute, so this fills up as the market closes lots."}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {rounds?.map((r) => (
          <button key={r.itemId} onClick={() => start(r)} className="flex gap-2 text-left rounded-lg border border-slate-800 bg-slate-900/60 hover:border-fuchsia-500/50 p-2 cursor-pointer">
            {r.imageUrl && <img src={r.imageUrl} alt="" className="w-12 h-16 object-cover rounded" />}
            <div className="min-w-0 text-[11px] font-mono">
              <div className="text-white truncate">{r.title}</div>
              <div className="text-slate-400">{gradeLabel(r)} · {$(r.startPrice)} · {r.startBids} bids</div>
              <div className="text-fuchsia-300">{r.startSecs}s left</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
