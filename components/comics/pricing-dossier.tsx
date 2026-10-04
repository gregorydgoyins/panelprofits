import type { ComicRecord } from "@/lib/comics/types";
import {
  cbcsGrades,
  cgcGrades,
  comicBaseGrades,
  comicBaseReference,
  ebayGrades,
  getHighestGradedPrice,
  goCollectCgcGrades,
  goCollectCbcsGrades,
  goCollectPsaGrades,
  GRADES,
  type Grade,
  panelProfitsGrades,
  panelProfitsSpreads,
  panelProfitsDelta,
  panelProfitsVolume,
  panelProfitsListings,
  cgcSpreads,
  cgcVolume,
  cgcListings,
  priceChartingGrades,
  psaGrades,
} from "@/lib/pricing/source-ladder";
import { formatCurrency } from "@/lib/utils";
import { getCleanPricingEvidence } from "@/lib/pricing/clean";
import { TrendingUp, ArrowDownRight, ArrowUpRight, ShieldCheck } from "lucide-react";
import { TierJumpControls } from "./tier-jump-controls";

const SOURCES = [
  "Panel Profits",
  "GoCollect - CGC",
  "GoCollect - CBCS",
  "GoCollect - PSA",
  "CGC · GPA sales",
  "CBCS",
  "PSA",
  "eBay Sold Transactions",
  "ComicBase",
] as const;

const PRIMARY_EXCHANGE_GRADES: Array<{
  grade: Grade;
  label: string;
  sublabel: string;
}> = [
  { grade: "RAW", label: "Ungraded", sublabel: "Loose / Raw" },
  { grade: "4.0", label: "4.0 / VG", sublabel: "Very Good" },
  { grade: "6.0", label: "6.0 / Fine", sublabel: "Fine" },
  { grade: "8.0", label: "8.0 / VF", sublabel: "Very Fine" },
  { grade: "9.2", label: "9.2 / NM-", sublabel: "Near Mint -" },
  { grade: "9.8", label: "9.8", sublabel: "Near Mint / Mint" },
];

export async function PricingDossier({ comic }: { comic: ComicRecord }) {
  const cleanEvidence = await getCleanPricingEvidence(comic.id);
  const pp = Object.keys(cleanEvidence.grades).length ? cleanEvidence.grades : panelProfitsGrades(comic);
  const pcGrades = priceChartingGrades(comic);
  const ebayLadder = ebayGrades(comic);
  const cbGrades = comicBaseGrades(comic);
  const cb = comicBaseReference(comic);
  const gcCgcGrades = goCollectCgcGrades(comic);
  const gcCbcsGrades = goCollectCbcsGrades(comic);
  const gcPsaGrades = goCollectPsaGrades(comic);
  const cgcGpaGrades = cgcGrades(comic);
  const cbcsLadder = cbcsGrades(comic);
  const psaLadder = psaGrades(comic);
  const rawCoverPrice =
    (comic.panel_profits_data as any)?.coverPrice ??
    (comic.panel_profits_data as any)?.cover_price ??
    (comic.comicbase_data as any)?.["CB - Cover Price"] ??
    (comic.gcd_data as any)?.["GCD - gcd_issue.price"] ??
    (comic as any).cover_price;
  const coverPrice = rawCoverPrice != null ? Number(String(rawCoverPrice).replace(/[^0-9.]/g, "")) : null;

  const highest = getHighestGradedPrice({
    "Panel Profits": pp,
    "GoCollect - CGC": gcCgcGrades,
    "GoCollect - CBCS": gcCbcsGrades,
    "GoCollect - PSA": gcPsaGrades,
    "CGC · GPA sales": cgcGpaGrades,
    "CBCS": cbcsLadder,
    "PSA": psaLadder,
    "eBay Sold Transactions": ebayLadder,
    "ComicBase": cbGrades,
  });

  return (
    <section aria-labelledby="pricing-heading" className="rounded-xl border border-slate-700 bg-[#111319] p-4 sm:p-6 shadow-lg space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-700 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 id="pricing-heading" className="text-lg font-semibold text-slate-100">
              Price Evidence & Market Order Book by Grade Tier
            </h2>
            <span className="inline-flex items-center gap-1 rounded bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              VERIFIED EVIDENCE ENGINE
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Recorded price evidence by source and grade tier. Ungraded / RAW pricing represents loose physical copies; certified grading authorities (CGC, CBCS, PSA) record authenticated slabbed grades only. Unpriced grades remain unpriced.
          </p>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {GRADES.length} grade tiers · Multi-source market ladder
        </span>
      </div>

      {/* 6-Grade Market Order Book Shelf */}
      <div>
        <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 mb-2.5 flex items-center justify-between">
          <span>Continuous Market Execution Ladder</span>
          <span className="text-[10px] text-slate-500 lowercase">bid/ask depth</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {PRIMARY_EXCHANGE_GRADES.map(({ grade, label, sublabel }) => {
            const price = pp[grade] ?? pcGrades[grade] ?? null;
            const spreads = panelProfitsSpreads(comic, grade);
            const delta = panelProfitsDelta(comic, grade);
            const volume = panelProfitsVolume(comic, grade);
            const listings = panelProfitsListings(comic, grade);
            const isPriced = price !== null && price > 0;
            const hasSpread = spreads.buy !== null && spreads.sell !== null && spreads.sell >= spreads.buy;

            return (
              <div
                key={grade}
                className={`rounded-lg border p-3 flex flex-col justify-between transition-colors ${
                  isPriced
                    ? "border-slate-800 bg-[#0C1626] hover:border-cyan-500/50"
                    : "border-slate-900 bg-[#0A0D14] opacity-70"
                }`}
              >
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-semibold text-slate-200">{label}</span>
                    <span className="text-[9px] text-slate-500 font-mono">{grade}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                    <span>{sublabel}</span>
                    {volume && (
                      <span className="text-[9px] font-mono text-cyan-400/90 truncate max-w-[95px]" title={volume}>
                        {volume}
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between gap-1">
                    <div className="text-base sm:text-lg font-bold tabular-nums tracking-tight">
                      {isPriced ? (
                        <span className={grade === "9.8" ? "text-cyan-300" : grade === "RAW" ? "text-amber-300" : "text-emerald-300"}>
                          {formatCurrency(price)}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-sm">Unpriced</span>
                      )}
                    </div>
                    {delta !== null && delta !== undefined && (
                      <div className={`text-[10px] font-mono font-semibold ${delta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {delta >= 0 ? `+${formatCurrency(delta)}` : `-${formatCurrency(Math.abs(delta))}`}
                      </div>
                    )}
                  </div>
                </div>

                {/* Buy / Sell Bid-Ask Spreads & Listings Depth */}
                <div className="mt-3 pt-2 border-t border-slate-800/80 font-mono text-[10.5px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[9.5px]">BUY:</span>
                    <span className={spreads.buy ? "text-blue-400 font-medium" : "text-slate-600"}>
                      {spreads.buy ? formatCurrency(spreads.buy) : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[9.5px]">SELL:</span>
                    <span className={spreads.sell ? "text-emerald-400 font-medium" : "text-slate-600"}>
                      {spreads.sell ? formatCurrency(spreads.sell) : "—"}
                    </span>
                  </div>
                  {hasSpread && (
                    <div className="flex items-center justify-between text-[9.5px] text-slate-500">
                      <span>SPREAD:</span>
                      <span className="text-amber-400/90 font-medium">
                        {formatCurrency(spreads.sell! - spreads.buy!)}
                      </span>
                    </div>
                  )}
                  {listings !== null && (
                    <div className="flex items-center justify-between pt-0.5 border-t border-slate-800/40 text-[9.5px]">
                      <span className="text-slate-500">SOLD:</span>
                      <span className={listings > 0 ? "text-cyan-300 font-medium" : "text-slate-600"}>
                        {listings} {listings === 1 ? "listing" : "listings"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-Authority Comparison Table with Explicit Buy/Sell & Graded Lines */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span className="font-bold text-cyan-300">Cross-Authority Evidence Registry</span>
            <span className="text-slate-600">·</span>
            <span className="text-[10px] text-slate-400">Continuous 26-Grade Matrix (0.5 – 10.0 + RAW)</span>
          </div>

          {/* Quick Grade Tier Jump Controls */}
          <TierJumpControls />
        </div>

        <div
          className="overflow-x-auto rounded-lg border border-slate-700/80 bg-[#080B11] focus-visible:ring-2 focus-visible:ring-cyan-400 shadow-inner"
          role="region"
          aria-label="Pricing evidence ladder by source and grade tier"
          tabIndex={0}
        >
          <table className="w-full min-w-[2450px] border-collapse text-left text-xs tabular-nums">
            <thead className="bg-[#0C1017] text-slate-300 border-b border-slate-700">
              <tr>
                <th
                  scope="col"
                  className="sticky left-0 z-20 bg-[#0C1017] shadow-[4px_0_12px_rgba(0,0,0,0.6)] px-3.5 py-3 font-semibold text-slate-200 border-r border-slate-700/80 min-w-[280px] w-[280px]"
                >
                  Authority Source / Metric
                </th>
                {GRADES.map((grade) => (
                  <th
                    scope="col"
                    key={grade}
                    id={`grade-col-${grade.replace(".", "-")}`}
                    className={`w-[82px] min-w-[82px] px-2.5 py-3 text-right font-medium tracking-tight ${
                      grade === "RAW"
                        ? "text-amber-300 font-bold bg-amber-950/20"
                        : grade === "9.8"
                        ? "text-cyan-300 font-bold bg-cyan-950/20"
                        : grade === "10.0"
                        ? "text-emerald-300 font-bold bg-emerald-950/20"
                        : ""
                    }`}
                  >
                    {grade}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {[
                // 1. PANEL PROFITS SUITE (FMV, BUY, SELL, VOLUME, LISTINGS)
                {
                  id: "pp-fmv",
                  source: "Panel Profits",
                  badge: "Exchange FMV",
                  badgeClass: "text-emerald-400/90",
                  getValue: (grade: Grade) => {
                    const p = pp[grade];
                    return {
                      display: p ? formatCurrency(p) : "—",
                      colorClass: p ? (grade === "9.8" ? "text-cyan-300 font-bold" : grade === "RAW" ? "text-amber-300 font-bold" : "text-emerald-300 font-medium") : "text-slate-600",
                    };
                  },
                },
                {
                  id: "pp-buy",
                  source: "Panel Profits",
                  badge: "Bid (Buy Price)",
                  badgeClass: "text-blue-400/90",
                  getValue: (grade: Grade) => {
                    const s = panelProfitsSpreads(comic, grade);
                    return {
                      display: s.buy ? formatCurrency(s.buy) : "—",
                      colorClass: s.buy ? "text-blue-400 font-medium" : "text-slate-600",
                    };
                  },
                },
                {
                  id: "pp-sell",
                  source: "Panel Profits",
                  badge: "Ask (Sell Price)",
                  badgeClass: "text-emerald-400/90",
                  getValue: (grade: Grade) => {
                    const s = panelProfitsSpreads(comic, grade);
                    return {
                      display: s.sell ? formatCurrency(s.sell) : "—",
                      colorClass: s.sell ? "text-emerald-400 font-medium" : "text-slate-600",
                    };
                  },
                },
                {
                  id: "pp-volume",
                  source: "Panel Profits",
                  badge: "Annual Volume",
                  badgeClass: "text-cyan-400/90",
                  getValue: (grade: Grade) => {
                    const v = panelProfitsVolume(comic, grade);
                    return {
                      display: v || "—",
                      colorClass: v ? "text-cyan-300 font-mono text-[11px]" : "text-slate-600",
                    };
                  },
                },
                {
                  id: "pp-listings",
                  source: "Panel Profits",
                  badge: "Realized Listings",
                  badgeClass: "text-amber-400/90",
                  getValue: (grade: Grade) => {
                    const l = panelProfitsListings(comic, grade);
                    return {
                      display: l != null ? `${l} sold` : "—",
                      colorClass: l != null && l > 0 ? "text-amber-300 font-mono" : "text-slate-600",
                    };
                  },
                },

                // 2. CGC / CERTIFIED GRADED COPIES SUITE (FMV, BUY, SELL, VOLUME, LISTINGS)
                {
                  id: "cgc-fmv",
                  source: "CGC · GPA sales",
                  badge: "Certified Slabs (Realized FMV)",
                  badgeClass: "text-purple-400/90",
                  isGradedOnly: true,
                  getValue: (grade: Grade) => {
                    const p = cgcGpaGrades[grade] ?? (grade !== "RAW" ? pp[grade] : null);
                    return {
                      display: p ? formatCurrency(p) : "—",
                      colorClass: p ? "text-purple-300 font-medium" : "text-slate-600",
                    };
                  },
                },
                {
                  id: "cgc-buy",
                  source: "CGC · GPA sales",
                  badge: "Graded Slab Bid (Buy Price)",
                  badgeClass: "text-blue-400/90",
                  isGradedOnly: true,
                  getValue: (grade: Grade) => {
                    const s = cgcSpreads(comic, grade);
                    return {
                      display: s.buy ? formatCurrency(s.buy) : "—",
                      colorClass: s.buy ? "text-blue-400 font-medium" : "text-slate-600",
                    };
                  },
                },
                {
                  id: "cgc-sell",
                  source: "CGC · GPA sales",
                  badge: "Graded Slab Ask (Sell Price)",
                  badgeClass: "text-emerald-400/90",
                  isGradedOnly: true,
                  getValue: (grade: Grade) => {
                    const s = cgcSpreads(comic, grade);
                    return {
                      display: s.sell ? formatCurrency(s.sell) : "—",
                      colorClass: s.sell ? "text-emerald-400 font-medium" : "text-slate-600",
                    };
                  },
                },
                {
                  id: "cgc-volume",
                  source: "CGC · GPA sales",
                  badge: "Graded Slab Annual Volume",
                  badgeClass: "text-purple-400/90",
                  isGradedOnly: true,
                  getValue: (grade: Grade) => {
                    const v = cgcVolume(comic, grade);
                    return {
                      display: v || "—",
                      colorClass: v ? "text-purple-300 font-mono text-[11px]" : "text-slate-600",
                    };
                  },
                },
                {
                  id: "cgc-listings",
                  source: "CGC · GPA sales",
                  badge: "Graded Slab Sold Listings",
                  badgeClass: "text-cyan-400/90",
                  isGradedOnly: true,
                  getValue: (grade: Grade) => {
                    const l = cgcListings(comic, grade);
                    return {
                      display: l != null ? `${l} sold` : "—",
                      colorClass: l != null && l > 0 ? "text-cyan-300 font-mono" : "text-slate-600",
                    };
                  },
                },

                // 3. OTHER CERTIFIED & SECONDARY MARKET AUTHORITIES
                {
                  id: "cbcs",
                  source: "CBCS",
                  badge: "CBCS Certified Only",
                  badgeClass: "text-indigo-400/80",
                  isGradedOnly: true,
                  getValue: (grade: Grade) => {
                    const p = cbcsLadder[grade];
                    return {
                      display: p ? formatCurrency(p) : "—",
                      colorClass: p ? "text-emerald-300 font-medium" : "text-slate-600",
                    };
                  },
                },
                {
                  id: "psa",
                  source: "PSA",
                  badge: "PSA Certified Only",
                  badgeClass: "text-red-400/80",
                  isGradedOnly: true,
                  getValue: (grade: Grade) => {
                    const p = psaLadder[grade];
                    return {
                      display: p ? formatCurrency(p) : "—",
                      colorClass: p ? "text-emerald-300 font-medium" : "text-slate-600",
                    };
                  },
                },
                {
                  id: "gc-cgc",
                  source: "GoCollect - CGC",
                  badge: "CGC Census FMV",
                  badgeClass: "text-blue-400/80",
                  isGradedOnly: true,
                  getValue: (grade: Grade) => {
                    const p = gcCgcGrades[grade];
                    return {
                      display: p ? formatCurrency(p) : "—",
                      colorClass: p ? "text-emerald-300 font-medium" : "text-slate-600",
                    };
                  },
                },
                {
                  id: "gc-cbcs",
                  source: "GoCollect - CBCS",
                  badge: "CBCS Census FMV",
                  badgeClass: "text-teal-400/80",
                  isGradedOnly: true,
                  getValue: (grade: Grade) => {
                    const p = gcCbcsGrades[grade];
                    return {
                      display: p ? formatCurrency(p) : "—",
                      colorClass: p ? "text-emerald-300 font-medium" : "text-slate-600",
                    };
                  },
                },
                {
                  id: "gc-psa",
                  source: "GoCollect - PSA",
                  badge: "PSA Census FMV",
                  badgeClass: "text-sky-400/80",
                  isGradedOnly: true,
                  getValue: (grade: Grade) => {
                    const p = gcPsaGrades[grade];
                    return {
                      display: p ? formatCurrency(p) : "—",
                      colorClass: p ? "text-emerald-300 font-medium" : "text-slate-600",
                    };
                  },
                },
                {
                  id: "ebay",
                  source: "eBay Sold Transactions",
                  badge: "Realized Sales",
                  badgeClass: "text-yellow-400/80",
                  getValue: (grade: Grade) => {
                    const p = ebayLadder[grade];
                    return {
                      display: p ? formatCurrency(p) : "—",
                      colorClass: p ? "text-emerald-300 font-medium" : "text-slate-600",
                    };
                  },
                },
                {
                  id: "comicbase",
                  source: "ComicBase",
                  badge: "Catalog Guide",
                  badgeClass: "text-cyan-400/80",
                  getValue: (grade: Grade) => {
                    const p = cbGrades[grade];
                    return {
                      display: p ? formatCurrency(p) : "—",
                      colorClass: p ? "text-emerald-300 font-medium" : "text-slate-600",
                    };
                  },
                },
              ].map((row) => (
                <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                  <th
                    scope="row"
                    className="sticky left-0 z-10 bg-[#0C1017] shadow-[4px_0_12px_rgba(0,0,0,0.6)] px-3.5 py-2.5 whitespace-nowrap font-medium text-slate-100 border-r border-slate-700/80 min-w-[280px] w-[280px]"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-200">{row.source}</span>
                      <span className={`text-[10px] font-mono ${row.badgeClass}`}>
                        ({row.badge})
                      </span>
                    </div>
                  </th>
                  {GRADES.map((grade) => {
                    if (grade === "RAW" && row.isGradedOnly) {
                      return (
                        <td
                          key={grade}
                          className="w-[82px] min-w-[82px] px-2.5 py-2.5 text-right text-slate-600 font-mono bg-slate-950/20"
                        >
                          —
                        </td>
                      );
                    }
                    const { display, colorClass } = row.getValue(grade);
                    return (
                      <td
                        key={grade}
                        className={`w-[82px] min-w-[82px] px-2.5 py-2.5 text-right whitespace-nowrap font-mono ${colorClass || "text-slate-600"} ${
                          grade === "RAW"
                            ? "bg-amber-950/5 font-semibold"
                            : grade === "9.8"
                            ? "bg-cyan-950/5 font-semibold"
                            : grade === "10.0"
                            ? "bg-emerald-950/5 font-semibold"
                            : ""
                        }`}
                      >
                        {display}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Footer Cards */}
      <div className="grid gap-3 text-sm grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-800 bg-[#0C1626] p-3.5">
          <div className="text-[10px] font-mono font-medium uppercase tracking-wider text-cyan-300">
            Highest Graded Market Price
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-lg font-semibold text-slate-100">
              {highest ? formatCurrency(highest.price) : "Unpriced"}
            </span>
            {highest && (
              <span className="text-[11px] font-mono font-medium text-cyan-400">
                ({highest.isRaw ? "RAW Ungraded" : `Grade ${highest.grade}`})
              </span>
            )}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            Highest verified price observed. Non-9.8 books never receive a 9.8 price or synthetic valuation.
          </p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-[#0C1626] p-3.5">
          <div className="text-[10px] font-mono font-medium uppercase tracking-wider text-cyan-300">
            ComicBase Reference Guide
          </div>
          <div className="mt-1.5 text-lg font-semibold text-slate-100">{cb === null ? "—" : formatCurrency(cb)}</div>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            ComicBase catalog guide reference valuation. Evaluated independently from newsstand cover prices and certified slabs.
          </p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-[#0C1626] p-3.5">
          <div className="text-[10px] font-mono font-medium uppercase tracking-wider text-cyan-300">
            Original Stamped Cover Price
          </div>
          <div className="mt-1.5 text-lg font-semibold text-amber-300">
            {coverPrice != null && coverPrice > 0 ? formatCurrency(coverPrice) : "—"}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            Historical cover price stamped on physical newsstand or direct copies at initial publication.
          </p>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-3.5 text-xs text-slate-300">
          <strong className="block text-slate-100 uppercase tracking-wide text-[10px] font-mono">Translation Layer & Strict Isolation</strong>
          <p className="mt-1.5 leading-relaxed text-slate-400">
            Panel Profits decodes auction transaction feeds into sovereign econometric market valuations and bid-ask spreads. CGC, CBCS, and PSA never carry RAW prices.
          </p>
        </div>
      </div>
    </section>
  );
}
