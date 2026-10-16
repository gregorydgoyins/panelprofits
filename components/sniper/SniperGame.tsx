"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GameRound, GameState } from "@/lib/sniper/game-store";
import { SlabEncasement } from "./SlabEncasement";
import type { GradingCompany } from "@/lib/sniper/types";
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
 const active = round.status === "bidding" || round.status === "awaiting_result";
 return <article className={`rounded-xl border p-4 ${active ? "border-amber-500/40 bg-amber-950/10" : "border-slate-700/70 bg-[#0d1320]"}`}>
  <div className="flex gap-4">{round.imageUrl && <div className="w-44 max-w-[40%] shrink-0">{round.grade != null && ["CGC","CBCS","PSA","PGX","EGS"].includes(round.grader || "") ? <SlabEncasement gradingCompany={round.grader as GradingCompany} grade={round.grade} title={round.title} issueNumber={round.issue} imageUrl={round.imageUrl} size="sm" onClick={research} /> : <img src={round.imageUrl} alt={round.title} className="h-64 w-full rounded object-contain bg-black/50" />}</div>}<div className="min-w-0 flex-1"><p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">{active ? "Accepted bid · clock running" : "Research first · clock waiting"}</p><h3 className="mt-2 font-semibold leading-6 text-white">{round.title}</h3><button onClick={research} className="mt-2 text-xs text-cyan-300 underline underline-offset-4">Read saved research &amp; sources</button></div></div>
  <div className="mt-4 flex items-end justify-between border-t border-slate-800 pt-3"><div><p className="text-[10px] uppercase tracking-wider text-slate-500">{round.bid != null ? "Your final accepted bid" : "Opening / quoted amount"}</p><p className="mt-1 font-mono text-xl text-white">{money(round.bid ?? round.opening)}</p></div><div className="text-right"><p className="text-[10px] uppercase tracking-wider text-slate-500">{remaining == null ? "Clock not started" : "Time remaining"}</p><p className={`mt-1 font-mono text-2xl tabular-nums ${remaining != null && remaining < 10_000 ? "text-rose-300" : "text-amber-300"}`}>{remaining == null ? "WAITING" : `${(remaining / 1000).toFixed(2)}s`}</p></div></div>
  {round.status === "awaiting_result" || (active && remaining === 0) ? <p className="mt-4 text-sm text-amber-200">Bidding closed. Waiting for verified settlement; your funds remain reserved.</p> : <form className="mt-4 flex gap-2" onSubmit={event => { event.preventDefault(); submit(Number(amount)); }}><label className="sr-only" htmlFor={`bid-${round.token}`}>Direct bid in Sniper dollars</label><input id={`bid-${round.token}`} required type="number" step="0.01" min={round.bid == null ? round.opening : round.bid + .01} value={amount} onChange={event => setAmount(event.target.value)} className="w-0 flex-1 rounded-lg border border-slate-700 bg-black/40 px-3 py-2 font-mono text-white focus:outline-none focus:ring-2 focus:ring-cyan-400" /><button disabled={busy} className="rounded-lg bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 disabled:opacity-40">{active ? "Raise bid" : "Bid & start clock"}</button></form>}
  <p className="mt-2 text-[11px] leading-5 text-slate-500">Direct bid, not a proxy maximum. Once accepted, your final bid is charged on a win or loss. Result stays sealed until closing.</p>
 </article>;
}
export function useSniperGame(enabled: boolean) {
 const [game, setGame] = useState<GameState | null>(null);
 const [anchor, setAnchor] = useState<Anchor>({server:0,local:0});
 const [error, setError] = useState<string | null>(null);
 const [busy, setBusy] = useState(false);

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
 useEffect(() => { if (enabled) void load(); }, [load, enabled]);
 useEffect(() => { if (!enabled || !hasActiveRounds) return; const timer = setInterval(() => void load(),1500); return () => clearInterval(timer); }, [load, hasActiveRounds, enabled]);
 const act = async (body: Record<string,unknown>) => {
  setBusy(true); setError(null);
  try { const sentAt=performance.now(); const response = await fetch("/api/sniper/game",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)}); const data = await response.json(); if (!response.ok) throw new Error(data.error); apply(data,sentAt); return true; }
  catch (e) { setError(e instanceof Error ? e.message : "Action failed"); return false; }
  finally { setBusy(false); }
 };
 return { game, anchor, error, busy, load, act };
}
function exportCollection(assets: GameRound[]) {
 const rows = [["Comic","Paid Sniper dollars","Reference","Bank offer","Bank rate","Reference source"], ...assets.map(round => [round.title, round.asset!.cost, round.asset!.reference, round.asset!.bankOffer, round.asset!.bankRate, round.asset!.referenceSource])];
 const csv = rows.map(row => row.map(value => `"${String(value ?? "").replace(/"/g, '\"\"')}"`).join(",")).join("\r\n");
 const url = URL.createObjectURL(new Blob([csv], {type:"text/csv;charset=utf-8"}));
 const link = document.createElement("a"); link.href=url; link.download=`panel_profits_sniper_collection_${new Date().toISOString().slice(0,10)}.csv`; link.click(); URL.revokeObjectURL(url);
}
export type SniperGameController = ReturnType<typeof useSniperGame>;
export function SniperGame({ desk, view }: { desk: SniperGameController; view: "rounds" | "collection" | "results" }) {
 const { game, anchor, error, busy, load, act } = desk;
 const [selected, setSelected] = useState<GameRound | null>(null);
 const waiting = game?.rounds.filter(r => r.status === "waiting") || [];
 const active = game?.rounds.filter(r => r.status === "bidding" || r.status === "awaiting_result") || [];
 const assets = game?.rounds.filter(r => r.asset && !r.asset.soldAt) || [];
 const results = game?.rounds.filter(r => r.result).slice(0,12) || [];
 return <section id="sniper-game" className="w-full scroll-mt-24 space-y-5">
  {error && <div role="alert" className="rounded-lg border border-rose-500/40 bg-rose-950/30 p-3 text-sm text-rose-200">{error} <button className="ml-3 underline" onClick={() => void load()}>Retry</button></div>}
  {game?.exhausted && <p role="status" className="rounded-lg border border-rose-500/40 p-4 text-rose-200">Run finished: no cash or owned comics remain. Your results are preserved.</p>}
  {view === "rounds" && active.length > 0 && <div><h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-amber-300">Committed rounds · refresh cannot restart these clocks</h3><div className="space-y-5">{active.map(round => <BidRound key={round.token} round={round} anchor={anchor} busy={busy} research={() => setSelected(round)} submit={amount => void act({action:"bid",token:round.token,amount})} />)}</div></div>}
  {view === "rounds" && <div><div className="mb-3 flex items-center justify-between gap-3"><h3 className="text-xs font-bold uppercase tracking-widest text-cyan-300">Waiting to bid</h3><button disabled={busy || !game} onClick={() => void act({action:"refresh"})} className="rounded-lg border border-slate-600 px-3 py-2 text-xs text-slate-200 hover:border-cyan-400 disabled:opacity-40">Fresh queue</button></div><div className="space-y-5">{waiting.map(round => <BidRound key={round.token} round={round} anchor={anchor} busy={busy} research={() => setSelected(round)} submit={amount => void act({action:"bid",token:round.token,amount})} />)}</div>{game && !waiting.length && <p className="text-sm text-slate-400">No unused recorded lots available in this batch. Refresh to check another batch.</p>}</div>}
  {selected && <div className="rounded-xl border border-cyan-500/30 bg-[#0d1320] p-5"><div className="mb-5 flex justify-between gap-4"><h3 className="font-semibold text-white">{selected.title}</h3><button onClick={() => setSelected(null)} className="text-sm text-slate-400">Close research</button></div><SniperListingResearch researchUrl={`/api/sniper/game?research=${selected.token}`} listingTitle={selected.title} series={selected.series} issueNumber={selected.issue} year={selected.year || undefined} grader={selected.grader || undefined} grade={selected.grade || undefined} editionVerified={false} /></div>}
  {view === "collection" && <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[
    ["Vault Holdings", `${assets.length} Books`],
    ["Capital Deployed", money(assets.reduce((sum,r)=>sum+r.asset!.cost,0))],
    ["Independent Reference", money(assets.reduce((sum,r)=>sum+r.asset!.reference,0))],
    ["Bank Redemption", money(assets.reduce((sum,r)=>sum+r.asset!.bankOffer,0))],
  ].map(([label,value])=><div key={label} className="bg-[#0E131F] border border-slate-800 p-3.5 rounded-xl font-mono"><p className="text-[10px] uppercase text-slate-400 font-bold">{label}</p><p className="text-xl font-black text-white mt-1">{value}</p></div>)}</div>}
  {view === "collection" && <div className="rounded-xl border border-slate-800 bg-[#0E131F] p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-emerald-200">Your tradable collection</h3><button disabled={!assets.length} onClick={() => exportCollection(assets)} className="rounded-lg border border-emerald-500/40 px-3 py-2 text-xs text-emerald-300 disabled:opacity-40">Export vault CSV</button></div><p className="mt-2 text-xs leading-5 text-slate-400">Bank rates: first 10 settled rounds 100%; rounds 11–25 90%; 26–50 75%; thereafter 50%. Each award keeps its quoted rate. Reference evidence and cash offers are shown before redemption.</p><div className="mt-4 space-y-3">{assets.map(round => <article key={round.token} className="rounded-xl border border-emerald-500/40 p-4">{round.imageUrl && <img src={round.imageUrl} alt={round.title} className="float-left mr-4 mb-3 h-48 w-32 object-contain bg-black/50 rounded" />}<h4 className="font-semibold text-white">{round.title}</h4><p className="mt-2 text-sm text-slate-300">Paid {money(round.asset!.cost)} · reference {money(round.asset!.reference)} · bank offer <strong className={round.asset!.bankOffer < round.asset!.cost?"text-rose-300":"text-emerald-300"}>{money(round.asset!.bankOffer)}</strong> ({round.asset!.bankRate*100}%)</p><p className="mt-1 text-xs text-slate-500">{round.asset!.referenceSource}</p><div className="mt-3 flex flex-wrap gap-2"><button disabled={busy} onClick={() => void act({action:"sell",token:round.token})} className="rounded bg-emerald-300 px-3 py-2 text-xs font-bold text-slate-950 disabled:opacity-40">Sell to bank · {money(round.asset!.bankOffer)}</button>{(game?.account.doubleDowns || 0)>0 && <button disabled={busy} onClick={() => void act({action:"sell",token:round.token,double:true})} className="rounded border border-amber-400/50 px-3 py-2 text-xs text-amber-200">Use Double Down · {money(round.asset!.bankOffer*2)}</button>}</div></article>)}{!assets.length && <p className="text-sm text-slate-500">Won comics appear here after settlement.</p>}</div></div>}
  {view === "results" && results.length>0 && <div><h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Your revealed results</h3><div className="space-y-3">{results.map(round => <article key={round.token} className="rounded-xl border border-slate-800 bg-[#0d1320] p-4"><p className="text-sm font-semibold text-white">{round.title} <span className={round.result!.outcome==="won"?"text-emerald-300":"text-rose-300"}>· {round.result!.outcome}</span></p><p className="mt-2 text-sm text-slate-300">{round.result!.detail}</p><p className="mt-2 font-mono text-xs text-slate-400">Recorded close {round.result!.benchmark==null?"unverified":money(round.result!.benchmark)} · charged {money(round.result!.charged)} · {round.result!.mode==="historical"?"Historical sale benchmark":"Live venue result"}{round.asset?.soldAt?` · bank paid ${money(round.asset.bankPaid || 0)}`:""}</p>{round.result!.sourceUrl && <a href={round.result!.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-cyan-300 underline">Original source ↗</a>}</article>)}</div></div>}
  {view === "results" && !results.length && <p className="text-xs font-mono text-slate-400">Your participated rounds appear here after closing. Results stay sealed until then.</p>}
 </section>;
}
