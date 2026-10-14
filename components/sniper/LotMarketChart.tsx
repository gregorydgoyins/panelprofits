"use client";

import * as React from "react";
import { marketBrief } from "@/lib/sniper/market-brief";
import { TradingViewChart } from "@/components/charts/tradingview-chart";

interface Candle { time: string; open: number; high: number; low: number; close: number; volume: number; dollars: number }
interface CandlesResponse {
  success: boolean;
  grade: number | null;
  grades: Array<{ grade: number; count: number }>;
  bucket: string;
  candles: Candle[];
  stats: { n: number; last: { price: number; date: string } | null; low: number | null; high: number | null; median: number | null; median90d: number | null };
  sources: Record<string, number>;
  sales: Array<{ date: string; price: number; grade: number | null; venue: string; source: string; confirmed: boolean; url?: string }>;
  lot?: { ticks: Array<{ time: string; price: number; bids: number }> };
  note?: string;
  ebay?: { available: boolean; message: string; code: string | null; hasMore?: boolean; checkedAt?: string };
}

const usd = (n: number | null | undefined) => (n == null ? "—" : `$${n >= 100 ? Math.round(n).toLocaleString() : n.toFixed(2)}`);

function sourceLabel(src: string, confirmed: boolean): string {
  if (src === "ebay_last_bid") return "eBay last bid seen";
  if (src === "ebay_insights" || src === "ebay_history") return "eBay sold";
  if (src === "graded_sales_observations") return "graded register";
  if (src.startsWith("benchmark")) return confirmed ? "CGC / GPA record" : "market observation";
  return src;
}

/** This lot's own bid history: one point each time its price moved, from the tracker. */
function BidHistory({ ticks }: { ticks: Array<{ time: string; price: number; bids: number }> }) {
  if (ticks.length < 2) return null;
  const w = 320, h = 56, pad = 4;
  const t0 = new Date(ticks[0].time).getTime(), t1 = new Date(ticks[ticks.length - 1].time).getTime();
  const lo = Math.min(...ticks.map((t) => t.price)), hi = Math.max(...ticks.map((t) => t.price));
  const x = (t: string) => pad + ((new Date(t).getTime() - t0) / Math.max(1, t1 - t0)) * (w - pad * 2);
  const y = (p: number) => h - pad - ((p - lo) / Math.max(0.01, hi - lo)) * (h - pad * 2);
  // price holds until the next bid: draw as steps
  let d = `M ${x(ticks[0].time)} ${y(ticks[0].price)}`;
  for (let i = 1; i < ticks.length; i++) d += ` L ${x(ticks[i].time)} ${y(ticks[i - 1].price)} L ${x(ticks[i].time)} ${y(ticks[i].price)}`;
  return (
    <div className="rounded-lg border border-slate-800 bg-black/40 p-2">
      <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
        <span>THIS LOT'S BIDS ({ticks.length} moves seen)</span>
        <span>{usd(ticks[0].price)} → <span className="text-emerald-300">{usd(ticks[ticks.length - 1].price)}</span></span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-14" preserveAspectRatio="none" role="img" aria-label="Bid history for this lot">
        <path d={d} fill="none" stroke="#34d399" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

/**
 * Candles and volume for a book at a grade, built only from recorded sales; plus this lot's bid history.
 * Shows what exists and says plainly when nothing does.
 */
export function LotMarketChart({ series, issue, grade, itemId, ticker, currentBid, grader, allInCost, variant, editionTerms }: {
  series: string; issue: string; grade?: number | null; itemId?: string; ticker: string; currentBid: number; grader?: string; allInCost?: number; variant?: string; editionTerms?: string;
}) {
  const [pick, setPick] = React.useState<number | null>(grade ?? null);
  const [referenceNote, setReferenceNote] = React.useState<string | null>(null);
  const [showAllSales, setShowAllSales] = React.useState(false);
  const [bucket, setBucket] = React.useState("day");
  const [data, setData] = React.useState<CandlesResponse | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => { setPick(grade ?? null); setReferenceNote(null); }, [series, issue, grade]);

  React.useEffect(() => {
    let live = true;
    setLoading(true);
    const q = new URLSearchParams({ series, issue, bucket, source: "ebay" });
    if (editionTerms) q.set("editionTerms", editionTerms);
    if (grader) q.set("grader", grader);
    if (pick != null) q.set("grade", String(pick));
    if (itemId) q.set("item", itemId);
    fetch(`/api/sniper/candles?${q}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (live) {
        if (j?.success && pick === grade && j.stats?.n === 0 && j.grades?.length > 0 && grade != null) {
          const nearest = [...j.grades].sort((a, b) => Math.abs(a.grade - grade) - Math.abs(b.grade - grade))[0].grade;
          setReferenceNote(`No ${grade.toFixed(1)} sales in this saved sample. The chart shows another grade for reference, not a valuation of this listing.`);
          setPick(nearest);
        }
        setData(j?.success ? j : null); setLoading(false);
      } })
      .catch(() => { if (live) { setData(null); setLoading(false); } });
    return () => { live = false; };
  }, [series, issue, pick, itemId, bucket, grader, grade, editionTerms]);

  const candles = data?.candles ?? [];
  const first = candles[0]?.close, last = candles[candles.length - 1]?.close;
  const delta = first && last ? ((last - first) / first) * 100 : 0;

  return (
    <div className="space-y-2.5">
      {!loading && data && <section className="space-y-3 text-sm leading-6 text-slate-300 pb-4 border-b border-slate-800"><h3 className="text-base font-semibold text-emerald-300">Sales, value &amp; bid assessment</h3>{marketBrief({ listingGrade: grade, chartGrade: data.grade, grader, count: data.stats.n, median: data.stats.median, low: data.stats.low, high: data.stats.high, latest: data.stats.last, allInCost, variant, editionTerms, hasMore: data.ebay?.hasMore }).map(point => <div key={point.heading}><h4 className="font-semibold text-white">{point.heading}</h4><p>{point.text}</p></div>)}</section>}
      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400"><span>Sales grouped by</span>{["day", "week", "month"].map(b => <button key={b} onClick={() => setBucket(b)} className={`px-2 py-1 rounded border ${bucket === b ? "border-cyan-400 text-cyan-300 bg-cyan-950/40" : "border-slate-700"}`}>{b}</button>)}</div>
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

      {/strange academy/i.test(series) && issue === "14" && editionTerms?.toLowerCase().includes("nauck") && <p className="text-xs leading-5 text-amber-200 rounded-lg border border-amber-500/30 p-3">Guide cross-check, October 14, 2026: PriceCharting displays $99.99 for 9.8 on its Nauck page, but the single graded record is a December 15, 2022 “Cover A Ramos” sale. That mismatch does not establish Nauck-variant FMV. <a href="https://www.pricecharting.com/game/comic-books-strange-academy/strange-academy-nauck-14-2021" target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline">Inspect the guide and source record ↗</a></p>}
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
          <div>No recorded sales for this book{pick != null ? ` at ${pick.toFixed(1)}` : ""} yet.</div>
          <div className="text-slate-500">{data?.note ?? "Every auction the tracker watches close is recorded; the chart fills in from there."}</div>
        </div>
      )}

      {data?.ebay?.available && <p className="text-[10px] leading-4 text-slate-500">History saved {data.ebay.checkedAt?.slice(0, 10)}. {data.ebay.hasMore ? "This is the first page of up to 50 search matches; more history exists. Comic, grader and grade checks determine the sales shown." : "All matching sales in the returned page are available below."}</p>}
      {data?.ebay && !data.ebay.available && candles.length > 0 && (
        <div className="text-[10px] font-mono text-amber-300/80">eBay sold history unavailable: {data.ebay.message} Displaying confirmed sales from the listed sources.</div>
      )}
      {data?.lot?.ticks && <BidHistory ticks={data.lot.ticks} />}

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
