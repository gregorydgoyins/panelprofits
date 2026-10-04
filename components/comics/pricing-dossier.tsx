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
  priceChartingGrades,
  psaGrades,
} from "@/lib/pricing/source-ladder";
import { formatCurrency } from "@/lib/utils";
import { getCleanPricingEvidence } from "@/lib/pricing/clean";
import { TrendingUp, ArrowDownRight, ArrowUpRight, ShieldCheck } from "lucide-react";

const SOURCES = [
  "Panel Profits",
  "PriceCharting",
  "eBay Sold Transactions",
  "ComicBase",
  "CGC · GPA sales",
  "CBCS",
  "PSA",
  "GoCollect - CGC",
  "GoCollect - CBCS",
  "GoCollect - PSA",
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
  const rawCoverPrice = (comic.comicbase_data as any)?.["CB - Cover Price"] ?? (comic as any).cover_price;
  const coverPrice = rawCoverPrice != null ? Number(String(rawCoverPrice).replace(/[^0-9.]/g, "")) : null;

  const highest = getHighestGradedPrice({
    "Panel Profits": pp,
    "PriceCharting": pcGrades,
    "eBay Sold Transactions": ebayLadder,
    "ComicBase": cbGrades,
    "CGC · GPA sales": cgcGpaGrades,
    "CBCS": cbcsLadder,
    "PSA": psaLadder,
    "GoCollect - CGC": gcCgcGrades,
    "GoCollect - CBCS": gcCbcsGrades,
    "GoCollect - PSA": gcPsaGrades,
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
            const price = pcGrades[grade] ?? pp[grade] ?? null;
            const spreads = panelProfitsSpreads(comic, grade);
            const delta = panelProfitsDelta(comic, grade);
            const volume = panelProfitsVolume(comic, grade);
            const isPriced = price !== null && price > 0;

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

                {/* Buy / Sell Bid-Ask Spreads */}
                <div className="mt-3 pt-2 border-t border-slate-800/80 font-mono text-[10.5px] space-y-0.5">
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
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-Authority Comparison Table */}
      <div>
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
          <span>Cross-Authority Evidence Registry</span>
          <span className="text-[10px] text-slate-500">certified grading authorities remain unblended</span>
        </div>

        <div
          className="overflow-x-auto rounded-lg border border-slate-700 focus-visible:ring-2 focus-visible:ring-cyan-400"
          role="region"
          aria-label="Pricing evidence ladder by source and grade tier"
          tabIndex={0}
        >
          <table className="w-full min-w-[1120px] border-collapse text-left text-xs tabular-nums">
            <thead className="bg-slate-900 text-slate-300">
              <tr>
                <th scope="col" className="sticky left-0 z-10 bg-slate-900 px-3 py-3 font-medium border-r border-slate-800">
                  Authority Source
                </th>
                {GRADES.map((grade) => (
                  <th
                    scope="col"
                    key={grade}
                    className={`px-2 py-3 text-right font-medium ${grade === "RAW" ? "text-amber-300 font-semibold" : ""}`}
                  >
                    {grade}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {SOURCES.map((source) => {
                const isGradingAuthority = source.startsWith("CGC") || source === "CBCS" || source === "PSA" || source.startsWith("GoCollect");

                return (
                  <tr key={source} className="hover:bg-slate-800/40 transition-colors">
                    <th
                      scope="row"
                      className="sticky left-0 bg-[#111319] px-3 py-3 whitespace-nowrap font-medium text-slate-100 border-r border-slate-800"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{source}</span>
                        {source === "Panel Profits" && (
                          <span className="text-[10px] text-emerald-400/90 font-mono">(Exchange FMV)</span>
                        )}
                        {source === "PriceCharting" && (
                          <span className="text-[10px] text-amber-400/80 font-mono">(Auction Sales)</span>
                        )}
                        {source === "eBay Sold Transactions" && (
                          <span className="text-[10px] text-yellow-400/80 font-mono">(Realized Sales)</span>
                        )}
                        {source === "ComicBase" && (
                          <span className="text-[10px] text-cyan-400/80 font-mono">(Catalog Guide)</span>
                        )}
                        {source === "CGC · GPA sales" && (
                          <span className="text-[10px] text-purple-400/80 font-mono">(CGC Certified Only)</span>
                        )}
                        {source === "CBCS" && (
                          <span className="text-[10px] text-indigo-400/80 font-mono">(CBCS Certified Only)</span>
                        )}
                        {source === "PSA" && (
                          <span className="text-[10px] text-red-400/80 font-mono">(PSA Certified Only)</span>
                        )}
                        {source === "GoCollect - CGC" && (
                          <span className="text-[10px] text-blue-400/80 font-mono">(CGC Census FMV)</span>
                        )}
                        {source === "GoCollect - CBCS" && (
                          <span className="text-[10px] text-teal-400/80 font-mono">(CBCS Census FMV)</span>
                        )}
                        {source === "GoCollect - PSA" && (
                          <span className="text-[10px] text-sky-400/80 font-mono">(PSA Census FMV)</span>
                        )}
                      </div>
                    </th>
                    {GRADES.map((grade) => {
                      // CGC, CBCS, PSA, and GoCollect are certified grading authorities and NEVER have a RAW or ungraded price
                      if (grade === "RAW" && isGradingAuthority) {
                        return (
                          <td key={grade} className="px-2 py-3 text-right text-slate-600 font-mono">
                            —
                          </td>
                        );
                      }

                      let price: number | undefined;

                      if (source === "Panel Profits") {
                        price = pp[grade];
                      } else if (source === "PriceCharting") {
                        price = pcGrades[grade];
                      } else if (source === "eBay Sold Transactions") {
                        price = ebayLadder[grade];
                      } else if (source === "ComicBase") {
                        price = cbGrades[grade];
                      } else if (source === "GoCollect - CGC") {
                        price = gcCgcGrades[grade];
                      } else if (source === "GoCollect - CBCS") {
                        price = gcCbcsGrades[grade];
                      } else if (source === "GoCollect - PSA") {
                        price = gcPsaGrades[grade];
                      } else if (source === "CGC · GPA sales") {
                        price = cgcGpaGrades[grade];
                      } else if (source === "CBCS") {
                        price = cbcsLadder[grade];
                      } else if (source === "PSA") {
                        price = psaLadder[grade];
                      }

                      return (
                        <td
                          key={grade}
                          className={`px-2 py-3 text-right ${price ? "text-emerald-300 font-medium" : "text-slate-600"}`}
                        >
                          {price ? formatCurrency(price) : "—"}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
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
