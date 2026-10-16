"use client";

import * as React from "react";
import { marketBrief } from "@/lib/sniper/market-brief";
import { buildCandles, gradesTraded, saleStats, type Bucket } from "@/lib/sniper/candles";
import type { ResearchLoad } from "./useLotResearch";
import { TradingViewChart } from "@/components/charts/tradingview-chart";

const usd = (n: number | null | undefined) => n==null?"—":n.toLocaleString("en-US",{style:"currency",currency:"USD",minimumFractionDigits:2,maximumFractionDigits:2});

function sourceLabel(src: string, confirmed: boolean): string {
  if (src === "pricecharting_completed_sale") return "PriceCharting · completed sale";
  if (src === "ebay_last_bid") return "eBay last bid seen";
  if (src === "ebay_insights" || src === "ebay_history") return "eBay sold";
  if (src === "graded_sales_observations") return "graded register";
  if (src.startsWith("benchmark")) return confirmed ? "CGC / GPA record" : "market observation";
  return src;
}

/**
 * Candles and volume for a book at a grade, built only from recorded sales; plus this lot's bid history.
 * Shows what exists and says plainly when nothing does.
 */
export function LotMarketChart({ research, series, issue, grade, ticker, currentBid, grader, allInCost, variant, editionTerms }: {
  research:ResearchLoad; series:string; issue:string; grade?:number|null; ticker:string; currentBid:number; grader?:string; allInCost?:number; variant?:string; editionTerms?:string;
}) {
  const [pick,setPick]=React.useState<number|null>(grade ?? null);
  const [showAllSales,setShowAllSales]=React.useState(false);
  const [bucket,setBucket]=React.useState<Bucket>("day");
  const {data:evidence,loading}=research;
  const all=evidence?.sales || [];
  const atGrade=all.filter(s=>s.grade===pick);
  const data=evidence?{grade:pick,grades:gradesTraded(all),bucket,candles:buildCandles(atGrade,bucket),stats:saleStats(atGrade),sales:[...atGrade].reverse(),sources:atGrade.reduce<Record<string,number>>((counts,s)=>{counts[s.source]=(counts[s.source] || 0)+1;return counts;},{}),ebay:evidence.history,note:"Only source-reported completed sales for this edition and grade are shown."}:null;
  const referenceNote=pick!==grade?"You selected another grade. These sales do not value the listing’s grade.":null;

  const candles = data?.candles ?? [];
  const first = candles[0]?.close, last = candles[candles.length - 1]?.close;
  const delta = first && last ? ((last - first) / first) * 100 : 0;

  return (
    <div className="space-y-2.5">

      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400"><span>Sales grouped by</span>{(["day", "week", "month"] as const).map(b => <button key={b} onClick={() => setBucket(b)} className={`px-2 py-1 rounded border ${bucket === b ? "border-cyan-400 text-cyan-300 bg-cyan-950/40" : "border-slate-700"}`}>{b}</button>)}</div>
      {data && data.grades.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
          <span className="text-slate-500 uppercase">Grade</span>
          {data.grades.map((g) => (
            <button
              key={g.grade}
              onClick={() => setPick(g.grade)}
              className={`px-2 py-0.5 rounded border cursor-pointer ${data.grade === g.grade ? "bg-cyan-600 border-cyan-400 text-white font-bold" : "bg-slate-900 border-slate-700 text-slate-300 hover:border-cyan-500"}`}
            >
              {g.grade.toFixed(1)} <span className="opacity-60">· {g.count}</span>
            </button>
          ))}
        </div>
      )}

      {referenceNote && <p className="text-xs leading-5 text-amber-200 border border-amber-500/25 rounded-lg bg-amber-950/20 p-2">{referenceNote}</p>}
      {data?.grade != null && <p className="text-[10px] font-mono text-slate-400">Chart: {grader || "graded"} {data.grade.toFixed(1)} completed sales · listing grade: {grade?.toFixed(1) ?? "unknown"}</p>}
      {loading ? (
        <div className="p-6 text-center text-xs font-mono text-slate-500 animate-pulse">Loading recorded sales…</div>
      ) : candles.length > 0 ? (
        <>
          <TradingViewChart
            completedSalesOnly
            ticker={ticker}
            series={series}
            issueNumber={issue}
            currentPrice={last ?? currentBid}
            deltaPercent={delta}
            areaData={candles.map((c) => ({ time: c.time, value: c.close }))}
            candlestickData={candles.map((c) => ({ time: c.time, open: c.open, high: c.high, low: c.low, close: c.close, volume: c.volume }))}
            volumeData={candles.map((c) => ({ time: c.time, value: c.volume, color: c.close >= c.open ? "rgba(16, 185, 129, 0.45)" : "rgba(244, 63, 94, 0.45)" }))}
            height={300}
          />
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center font-mono">
            {[
              ["Sales", String(data?.stats.n ?? 0)],
              ["Last", usd(data?.stats.last?.price)],
              ["Median 90d", usd(data?.stats.median90d)],
              ["Low", usd(data?.stats.low)],
              ["High", usd(data?.stats.high)],
            ].map(([k, v]) => (
              <div key={k} className="rounded bg-slate-900/70 border border-slate-800 py-1.5">
                <div className="text-[9px] text-slate-500 uppercase">{k}</div>
                <div className="text-xs font-bold text-white">{v}</div>
              </div>
            ))}
          </div>
          <div className="text-[10px] font-mono text-slate-500">
            One candle per {data?.bucket}; volume is the number of sales. Sources: {Object.entries(data?.sources ?? {}).map(([s, n]) => `${sourceLabel(s, true)} ${n}`).join(" · ")}
          </div>
        </>
      ) : (
        <div className="p-4 text-center text-xs font-mono text-slate-400 bg-black/40 rounded-lg border border-slate-800 space-y-1">
          <div>{!data ? "Completed sales could not be loaded. Close and reopen this research view to retry." : `No exact chart matches in the saved records for this book${pick != null ? ` at ${pick.toFixed(1)}` : ""} yet.`}</div>
          <div className="text-slate-500">{data?.note ?? (data ? "Other covers, grades and raw copies may be present in the completed-sale records below." : "A failed request does not mean there were no completed sales.")}</div>
        </div>
      )}

      {!loading && data && <section className="space-y-3 text-sm leading-6 text-slate-300 pb-4 border-b border-slate-800"><h3 className="text-base font-semibold text-emerald-300">Sales, value &amp; bid assessment</h3>{marketBrief({ listingGrade: grade, chartGrade: data.grade, grader, count: data.stats.n, median: data.stats.median, low: data.stats.low, high: data.stats.high, latest: data.stats.last, allInCost, variant, editionTerms, hasMore: data.ebay?.hasMore }).map(point => <div key={point.heading}><h4 className="font-semibold text-white">{point.heading}</h4><p>{point.text}</p></div>)}</section>}
      {data?.ebay?.available && <p className="text-[10px] leading-4 text-slate-500">History saved {data.ebay.checkedAt?.slice(0, 10)}. {data.ebay.hasMore ? "Additional provider history remains beyond the retrieved pages." : "All available pages in the requested history window were retrieved."} The chart filters by comic, grader, grade and selected edition terms.</p>}
      {data?.ebay && !data.ebay.available && candles.length > 0 && (
        <div className="text-[10px] font-mono text-amber-300/80">eBay sold history unavailable: {data.ebay.message} Displaying source-reported completed sales from the listed sources.</div>
      )}

      {data && data.sales.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] font-mono text-left">
            <thead>
              <tr className="text-slate-500 border-b border-slate-800 text-[10px] uppercase">
                <th className="pb-1 font-bold">Date</th><th className="pb-1 font-bold">Grade</th>
                <th className="pb-1 font-bold">Source</th><th className="pb-1 font-bold text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.sales.slice(0, showAllSales ? undefined : 10).map((s, i) => (
                <tr key={i} className="text-slate-300">
                  <td className="py-1">{s.date.slice(0, 10)}</td>
                  <td>{s.grade != null ? s.grade.toFixed(1) : "—"}</td>
                  <td className={s.confirmed ? "" : "text-amber-300/80"}>
                    {s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline decoration-dotted">{sourceLabel(s.source, s.confirmed)}</a> : sourceLabel(s.source, s.confirmed)}
                  </td>
                  <td className="text-right font-bold text-white">{usd(s.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.sales.length > 10 && <button onClick={() => setShowAllSales(v => !v)} className="mt-2 text-xs text-cyan-300 underline underline-offset-4">{showAllSales ? "Show latest 10" : `Show all ${data.sales.length} completed sales in this sample`}</button>}
        </div>
      )}
    </div>
  );
}
