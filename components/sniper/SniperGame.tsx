"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GameRound, GameState } from "@/lib/sniper/game-store";
import { SniperListingResearch } from "./SniperListingResearch";
const money = (n: number) => `S$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
type Anchor = { server: number; local: number };
function BidRound({ round, anchor, busy, submit, research }: { round: GameRound; anchor: Anchor; busy: boolean; submit: (amount: number) => void; research: () => void }) {
 const [amount, setAmount] = useState("");
 const [remaining, setRemaining] = useState<number | null>(null);
 useEffect(() => {
  if (!round.deadline) { setRemaining(null); return; }
  const update = () => setRemaining(Math.max(0, Date.parse(round.deadline!) - anchor.server - (performance.now() - anchor.local)));
  update(); const timer = setInterval(update, 20); return () => clearInterval(timer);
 }, [round.deadline, anchor]);
 const active = round.status === "bidding";
 return <article className={`rounded-xl border p-4 ${active ? "border-amber-500/40 bg-amber-950/10" : "border-slate-700/70 bg-[#0d1320]"}`}>
  <div className="flex gap-4">{round.imageUrl && <img src={round.imageUrl} alt="" className="h-28 w-20 shrink-0 rounded object-contain bg-black/50" />}<div className="min-w-0 flex-1"><p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">{active ? "Accepted bid · clock running" : "Research first · clock waiting"}</p><h3 className="mt-2 font-semibold leading-6 text-white">{round.title}</h3><button onClick={research} className="mt-2 text-xs text-cyan-300 underline underline-offset-4">Read saved research &amp; sources</button></div></div>
  <div className="mt-4 flex items-end justify-between border-t border-slate-800 pt-3"><div><p className="text-[10px] uppercase tracking-wider text-slate-500">{round.bid != null ? "Your final accepted bid" : "Opening / quoted amount"}</p><p className="mt-1 font-mono text-xl text-white">{money(round.bid ?? round.opening)}</p></div><div className="text-right"><p className="text-[10px] uppercase tracking-wider text-slate-500">{remaining == null ? "Clock not started" : "Time remaining"}</p><p className={`mt-1 font-mono text-2xl tabular-nums ${remaining != null && remaining < 10_000 ? "text-rose-300" : "text-amber-300"}`}>{remaining == null ? "WAITING" : `${(remaining / 1000).toFixed(2)}s`}</p></div></div>
  {round.status === "awaiting_result" || (active && remaining === 0) ? <p className="mt-4 text-sm text-amber-200">Bidding closed. Waiting for verified settlement; your funds remain reserved.</p> : <form className="mt-4 flex gap-2" onSubmit={event => { event.preventDefault(); submit(Number(amount)); }}><label className="sr-only" htmlFor={`bid-${round.token}`}>Direct bid in Sniper dollars</label><input id={`bid-${round.token}`} required type="number" step="0.01" min={round.bid == null ? round.opening : round.bid + .01} value={amount} onChange={event => setAmount(event.target.value)} className="w-0 flex-1 rounded-lg border border-slate-700 bg-black/40 px-3 py-2 font-mono text-white focus:outline-none focus:ring-2 focus:ring-cyan-400" /><button disabled={busy} className="rounded-lg bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 disabled:opacity-40">{active ? "Raise bid" : "Bid & start clock"}</button></form>}
  <p className="mt-2 text-[11px] leading-5 text-slate-500">Direct bid, not a proxy maximum. Once accepted, your final bid is charged on a win or loss. Result stays sealed until closing.</p>
 </article>;
}
export function SniperGame() {
 const [game, setGame] = useState<GameState | null>(null);
 const [anchor, setAnchor] = useState<Anchor>({server:0,local:0});
 const [error, setError] = useState<string | null>(null);
 const [busy, setBusy] = useState(false);
 const [selected, setSelected] = useState<GameRound | null>(null);
 const inFlight = useRef(false);
 const lastApplied = useRef(0);
 const apply = useCallback((state: GameState, sentAt: number) => {
  const receivedAt = performance.now(), server = Date.parse(state.account.serverNow);
  if (server < lastApplied.current) return;
  lastApplied.current = server; setGame(state);
  const processing = state.account.serverReceivedAt ? server - Date.parse(state.account.serverReceivedAt) : 0;
  setAnchor({server:server+Math.max(0,(receivedAt-sentAt-processing)/2),local:receivedAt});
 }, []);
 const load = useCallback(async () => {
  if (inFlight.current) return;
  inFlight.current = true;
  try { const sentAt=performance.now(); const response = await fetch("/api/sniper/game",{cache:"no-store"}); const data = await response.json(); if (!response.ok) throw new Error(data.error); apply(data,sentAt); }
  catch (e) { setError(e instanceof Error ? e.message : "Could not read your game"); }
  finally { inFlight.current = false; }
 }, [apply]);
 const hasActiveRounds = game?.rounds.some(round => round.status === "bidding" || round.status === "awaiting_result") || false;
 useEffect(() => { void load(); }, [load]);
 useEffect(() => { if (!hasActiveRounds) return; const timer = setInterval(() => void load(),1500); return () => clearInterval(timer); }, [load, hasActiveRounds]);
 const act = async (body: Record<string,unknown>) => {
  setBusy(true); setError(null);
  try { const sentAt=performance.now(); const response = await fetch("/api/sniper/game",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)}); const data = await response.json(); if (!response.ok) throw new Error(data.error); apply(data,sentAt); }
  catch (e) { setError(e instanceof Error ? e.message : "Action failed"); }
  finally { setBusy(false); }
 };
 const waiting = game?.rounds.filter(r => r.status === "waiting") || [];
 const active = game?.rounds.filter(r => r.status === "bidding" || r.status === "awaiting_result") || [];
 const assets = game?.rounds.filter(r => r.asset && !r.asset.soldAt) || [];
 const results = game?.rounds.filter(r => r.result).slice(0,12) || [];
 return <section id="sniper-game" className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-6 space-y-6">
  <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-[#101e30] via-[#0d1522] to-[#10121b] p-6 shadow-xl"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[10px] font-mono uppercase tracking-[.24em] text-cyan-300">Panel Profits · Applied auction training</p><h2 className="mt-2 text-2xl font-bold tracking-tight text-white">Research. Commit. Capture.</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">Start with 10,000 Sniper dollars. Win a tradable comic or lose your final accepted bid. Waiting lots stay frozen; an accepted bid starts the clock. Real venue lots and recorded sales share one sealed queue.</p></div><a href="/learn#sniper-practice" className="rounded-lg border border-cyan-400/30 px-3 py-2 text-xs text-cyan-200 hover:bg-cyan-950/40">Practice syllabus ↗</a></div>
   <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">{[["Available cash",game?money(game.account.available):"Loading…"],["Reserved bids",game?money(game.account.reserved):"Loading…"],["Owned comics",String(assets.length)],["Earned Double Downs",String(game?.account.doubleDowns || 0)]].map(([label,value]) => <div key={label} className="rounded-lg border border-slate-700/50 bg-black/20 p-4"><p className="text-[10px] uppercase tracking-wider text-slate-400">{label}</p><p className="mt-2 font-mono text-xl text-white">{value}</p></div>)}</div>
   <p className="mt-4 text-xs leading-5 text-slate-500">No real funds or venue orders. All training rounds open at S$1; this is a game opening, not an actual venue bid. Bank values never increase because you overpay. One Double Down is earned per five wins and doubles the bank offer, not your purchase cost.</p>
  </div>
  {error && <div role="alert" className="rounded-lg border border-rose-500/40 bg-rose-950/30 p-3 text-sm text-rose-200">{error} <button className="ml-3 underline" onClick={() => void load()}>Retry</button></div>}
  {game?.exhausted && <p role="status" className="rounded-lg border border-rose-500/40 p-4 text-rose-200">Run finished: no cash or owned comics remain. Your results are preserved.</p>}
  {active.length > 0 && <div><h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-amber-300">Committed rounds · refresh cannot restart these clocks</h3><div className="grid gap-4 md:grid-cols-2">{active.map(round => <BidRound key={round.token} round={round} anchor={anchor} busy={busy} research={() => setSelected(round)} submit={amount => void act({action:"bid",token:round.token,amount})} />)}</div></div>}
  <div><div className="mb-3 flex items-center justify-between gap-3"><h3 className="text-xs font-bold uppercase tracking-widest text-cyan-300">Waiting to bid</h3><button disabled={busy || !game} onClick={() => void act({action:"refresh"})} className="rounded-lg border border-slate-600 px-3 py-2 text-xs text-slate-200 hover:border-cyan-400 disabled:opacity-40">Fresh queue</button></div><div className="grid gap-4 md:grid-cols-2">{waiting.map(round => <BidRound key={round.token} round={round} anchor={anchor} busy={busy} research={() => setSelected(round)} submit={amount => void act({action:"bid",token:round.token,amount})} />)}</div>{game && !waiting.length && <p className="text-sm text-slate-400">No unused recorded lots available in this batch. Refresh to check another batch.</p>}</div>
  {selected && <div className="rounded-xl border border-cyan-500/30 bg-[#0d1320] p-5"><div className="mb-5 flex justify-between gap-4"><h3 className="font-semibold text-white">{selected.title}</h3><button onClick={() => setSelected(null)} className="text-sm text-slate-400">Close research</button></div><SniperListingResearch researchUrl={`/api/sniper/game?research=${selected.token}`} listingTitle={selected.title} series={selected.series} issueNumber={selected.issue} year={selected.year || undefined} grader={selected.grader || undefined} grade={selected.grade || undefined} editionVerified={false} /></div>}
  <div className="rounded-xl border border-emerald-500/20 bg-[#0d171a] p-5"><h3 className="font-semibold text-emerald-200">Your tradable collection</h3><p className="mt-2 text-xs leading-5 text-slate-400">Bank rates: first 10 settled rounds 100%; rounds 11–25 90%; 26–50 75%; thereafter 50%. Each award keeps its quoted rate. Reference evidence and cash offers are shown before redemption.</p><div className="mt-4 space-y-3">{assets.map(round => <article key={round.token} className="rounded-lg border border-slate-700/70 p-4"><h4 className="font-semibold text-white">{round.title}</h4><p className="mt-2 text-sm text-slate-300">Paid {money(round.asset!.cost)} · reference {money(round.asset!.reference)} · bank offer <strong className={round.asset!.bankOffer < round.asset!.cost?"text-rose-300":"text-emerald-300"}>{money(round.asset!.bankOffer)}</strong> ({round.asset!.bankRate*100}%)</p><p className="mt-1 text-xs text-slate-500">{round.asset!.referenceSource}</p><div className="mt-3 flex flex-wrap gap-2"><button disabled={busy} onClick={() => void act({action:"sell",token:round.token})} className="rounded bg-emerald-300 px-3 py-2 text-xs font-bold text-slate-950 disabled:opacity-40">Sell to bank · {money(round.asset!.bankOffer)}</button>{(game?.account.doubleDowns || 0)>0 && <button disabled={busy} onClick={() => void act({action:"sell",token:round.token,double:true})} className="rounded border border-amber-400/50 px-3 py-2 text-xs text-amber-200">Use Double Down · {money(round.asset!.bankOffer*2)}</button>}</div></article>)}{!assets.length && <p className="text-sm text-slate-500">Won comics appear here after settlement.</p>}</div></div>
  {results.length>0 && <div><h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Your revealed results</h3><div className="space-y-3">{results.map(round => <article key={round.token} className="rounded-xl border border-slate-800 bg-[#0d1320] p-4"><p className="text-sm font-semibold text-white">{round.title} <span className={round.result!.outcome==="won"?"text-emerald-300":"text-rose-300"}>· {round.result!.outcome}</span></p><p className="mt-2 text-sm text-slate-300">{round.result!.detail}</p><p className="mt-2 font-mono text-xs text-slate-400">Recorded close {round.result!.benchmark==null?"unverified":money(round.result!.benchmark)} · charged {money(round.result!.charged)} · {round.result!.mode==="historical"?"Historical sale benchmark":"Live venue result"}{round.asset?.soldAt?` · bank paid ${money(round.asset.bankPaid || 0)}`:""}</p>{round.result!.sourceUrl && <a href={round.result!.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-cyan-300 underline">Original source ↗</a>}</article>)}</div></div>}
 </section>;
}
