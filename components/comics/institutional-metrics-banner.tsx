import React from "react";

interface InstitutionalMetricsBannerProps {
  anchorFmv: number;
  censusTotal?: number | null;
  censusCount98?: number | null;
  censusHigher?: number | null;
  censusScarcityTier?: string | null;
  resolvedGrade?: number | string;
  ticker?: string;
}

export function InstitutionalMetricsBanner({
  anchorFmv,
  censusTotal = 45,
  censusCount98 = 18,
  censusHigher = 0,
  censusScarcityTier = "High-Grade Investment Tier",
  resolvedGrade = 9.8,
  ticker,
}: InstitutionalMetricsBannerProps) {
  // Quantitative Target Multipliers Modeled from Institutional Execution Matrix
  const discountPercent = 32;
  const allInCost = Number((anchorFmv * (1 - discountPercent / 100)).toFixed(2));
  const targetWinPrice100Pct = Number((allInCost * 2.35).toFixed(2));
  const targetWinPrice50Pct = Number((allInCost * 1.76).toFixed(2));
  const netRoiPercent = Math.round(((anchorFmv - allInCost) / allInCost) * 100);
  const projectedNetProfit = Number((anchorFmv - allInCost).toFixed(2));

  const gradeDisplay = typeof resolvedGrade === "number" ? resolvedGrade.toFixed(1) : resolvedGrade;

  return (
    <div className="bg-[#070C18] border border-cyan-500/40 rounded-xl p-3.5 sm:p-4 space-y-3 shadow-lg font-mono">
      {/* Top Row: FMV Anchor & Certified Census Intel */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">FMV Anchor:</span>
          <span className="text-base sm:text-lg font-black text-cyan-300">
            ${anchorFmv.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
            Fair Market Baseline
          </span>
          {ticker && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-bold">
              {ticker}
            </span>
          )}
        </div>

        {/* Certified Census Scarcity Ribbon */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[10px] text-purple-300 font-bold uppercase flex items-center gap-1">
            <span>🏛️</span> Census Intel:
          </span>
          <span className="px-2 py-0.5 rounded bg-black/60 border border-slate-800 text-slate-300 text-[11px]">
            Total: <strong className="text-white">{censusTotal ?? 45}</strong>
          </span>
          <span className="px-2 py-0.5 rounded bg-black/60 border border-slate-800 text-slate-300 text-[11px]">
            In {gradeDisplay}: <strong className="text-emerald-300">{censusCount98 ?? 18}</strong>
          </span>
          <span className="px-2 py-0.5 rounded bg-black/60 border border-slate-800 text-slate-300 text-[11px]">
            Higher: <strong className="text-cyan-300">{(censusHigher ?? 0) === 0 ? "0 (Top of Pop ★)" : censusHigher}</strong>
          </span>
          {censusScarcityTier && (
            <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40 text-[10px] font-bold">
              {censusScarcityTier}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Row: Acquisition All-In, Double-Up (2x), 50% Win Box, and Net Profit Margin */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        {/* Box 1: Acquisition All-In */}
        <div className="bg-black/70 p-2.5 rounded-lg border border-slate-800 hover:border-cyan-500/50 transition">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase">
            <span>Acquisition All-In</span>
            <span className="text-emerald-400 font-bold">-{discountPercent}%</span>
          </div>
          <strong className="text-white text-base sm:text-lg block my-0.5 font-bold">
            ${allInCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
          <span className="text-[9px] text-slate-500 block">
            Target Buy (Bid + Ship + Tax)
          </span>
        </div>

        {/* Box 2: Double-Up (2x) Win Price */}
        <div className="bg-black/70 p-2.5 rounded-lg border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:border-emerald-400 transition">
          <div className="flex items-center justify-between text-[10px] text-emerald-400 uppercase font-bold">
            <span>Double-Up (2x)</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">100% Net</span>
          </div>
          <strong className="text-emerald-300 text-base sm:text-lg block my-0.5 font-bold">
            ${targetWinPrice100Pct.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
          <span className="text-[9px] text-slate-400 block">
            Exit Target to Double Cash
          </span>
        </div>

        {/* Box 3: 50% Win Box (1.5x) */}
        <div className="bg-black/70 p-2.5 rounded-lg border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:border-cyan-400 transition">
          <div className="flex items-center justify-between text-[10px] text-cyan-400 uppercase font-bold">
            <span>50% Win Box (1.5x)</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">50% Net</span>
          </div>
          <strong className="text-cyan-300 text-base sm:text-lg block my-0.5 font-bold">
            ${targetWinPrice50Pct.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
          <span className="text-[9px] text-slate-400 block">
            Fast Turn Target Exit Price
          </span>
        </div>

        {/* Box 4: Projected Net Profit & ROI */}
        <div className="bg-black/70 p-2.5 rounded-lg border border-amber-500/40 hover:border-amber-400 transition">
          <div className="flex items-center justify-between text-[10px] text-amber-400 uppercase font-bold">
            <span>Net Flip Spread</span>
            <span className="text-amber-300">+{netRoiPercent}% ROI</span>
          </div>
          <strong className="text-amber-300 text-base sm:text-lg block my-0.5 font-bold">
            +${projectedNetProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
          <span className="text-[9px] text-slate-500 block">
            Net Gain Realized at Anchor FMV
          </span>
        </div>
      </div>
    </div>
  );
}
