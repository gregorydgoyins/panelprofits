"use client";

import React, { useState } from "react";
import type { SovereignEquityPricingOutput, CanonicalGrade } from "@/lib/pricing/sovereign-equity-pricing-engine";
import {
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
  BarChart3,
  Target,
  AlertTriangle,
  ArrowUpRight,
  Info,
  DollarSign,
  Lock,
} from "lucide-react";

interface InstitutionalStrategyDossierProps {
  engineOutput: SovereignEquityPricingOutput;
  accentColor?: string;
}

export default function InstitutionalStrategyDossier({
  engineOutput,
  accentColor = "#38bdf8",
}: InstitutionalStrategyDossierProps) {
  const [activeStrategyTab, setActiveStrategyTab] = useState<"TRADITIONAL" | "CONTRARIAN">("TRADITIONAL");
  const [selectedGrade, setSelectedGrade] = useState<string>("9.8");

  const trad = engineOutput.traditionalStrategies;
  const contra = engineOutput.contrarianStrategies;
  const gradeKey = (selectedGrade as CanonicalGrade) in engineOutput.gradeMatrix ? (selectedGrade as CanonicalGrade) : "9.8";
  const gradeRecord = engineOutput.gradeMatrix[gradeKey];
  const decomp = gradeRecord.valuationDecomposition;

  return (
    <section
      aria-label="Institutional Strategy Dossier & 3-Tier Valuation"
      className="rounded-xl p-5 sm:p-6 bg-[#080d17] border shadow-2xl relative overflow-hidden my-6 font-sans"
      style={{ borderColor: `${accentColor}35` }}
    >
      {/* Background ambient lighting */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 pointer-events-none opacity-10 blur-3xl -z-0"
        style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
      />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400 font-semibold block">
              Sovereign Equity Clearinghouse
            </span>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
              Macro Benchmarking: {engineOutput.macroBenchmarking.peggedBenchmarkSeat}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight mt-1 flex items-center gap-2">
            Institutional Strategy Dossier
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Single-source econometric valuation across {engineOutput.snapshotCount} verified monthly observation epochs ({engineOutput.timeHorizonYears}Y runway)
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-lg bg-[#0e1626] border border-slate-800">
          <button
            onClick={() => setActiveStrategyTab("TRADITIONAL")}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all ${
              activeStrategyTab === "TRADITIONAL"
                ? "bg-cyan-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Traditional Value Desk
          </button>
          <button
            onClick={() => setActiveStrategyTab("CONTRARIAN")}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all ${
              activeStrategyTab === "CONTRARIAN"
                ? "bg-purple-500 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Contrarian Quant Desk
          </button>
        </div>
      </div>

      {/* SECTION 1: 3-Tier Valuation Decomposition Strip */}
      <div className="my-5 p-4 rounded-xl bg-[#0b1220]/90 border border-slate-800/80 relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              3-Tier Value Decomposition (P = V_structural + V_narrative + V_execution)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                gradeRecord.provenanceTag === "OBSERVED_AUCTION_SALE"
                  ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                  : gradeRecord.provenanceTag === "VALUATION_SNAPSHOT"
                    ? "bg-cyan-950/60 border-cyan-500/40 text-cyan-300"
                    : "bg-blue-950/60 border-blue-500/40 text-blue-300"
              }`}
            >
              {gradeRecord.provenanceTag === "OBSERVED_AUCTION_SALE"
                ? "● OBSERVED AUCTION SALE"
                : gradeRecord.provenanceTag === "VALUATION_SNAPSHOT"
                  ? "◆ VALUATION SNAPSHOT"
                  : "◐ ELASTIC COHORT ESTIMATE"}
            </span>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-slate-900 border border-slate-700 text-slate-300">
              {decomp.evidenceTier} (Conf: {decomp.confidenceScore}%)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
          {/* Tier 1: Structural Collector Value */}
          <div className="p-3 rounded-lg bg-[#0e1626] border border-slate-800">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>1. Structural Canon Value</span>
              <Lock className="h-3 w-3 text-cyan-400" />
            </div>
            <div className="mt-1 text-xl font-bold text-slate-100 font-mono">
              ${decomp.structuralCollectorValue.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-1">
              Hedonic age factor + census scarcity weighting.
            </p>
          </div>

          {/* Tier 2: Narrative Speculative Premium */}
          <div className="p-3 rounded-lg bg-[#0e1626] border border-slate-800">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>2. Narrative Option Premium</span>
              <Sparkles className="h-3 w-3 text-purple-400" />
            </div>
            <div className="mt-1 text-xl font-bold text-purple-300 font-mono">
              ${decomp.narrativeSpeculativePremium.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-1">
              {decomp.predictionInterval80 != null
                ? `80% Interval: [$${decomp.predictionInterval80.lower.toLocaleString()} – $${decomp.predictionInterval80.upper.toLocaleString()}]`
                : "80% Interval: Unmeasured (Insufficient Volatility Sample)"}
            </p>
          </div>

          {/* Tier 3: Market Execution Cash Floor */}
          <div className="p-3 rounded-lg bg-[#0e1626] border border-slate-800">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>3. Cash Execution Floor</span>
              <DollarSign className="h-3 w-3 text-emerald-400" />
            </div>
            <div className="mt-1 text-xl font-bold text-emerald-400 font-mono">
              {decomp.marketExecutionFloor !== null
                ? `$${decomp.marketExecutionFloor.toLocaleString()}`
                : "Unmeasured"}
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-1">
              {decomp.liquidityDiscountPct !== null
                ? `Wholesale realization (${decomp.liquidityDiscountPct}% haircut · ${decomp.liquidityState})`
                : "Liquidity Unmeasured (No recorded trades to infer depth)"}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: Active Strategy Tab Content */}
      {activeStrategyTab === "TRADITIONAL" ? (
        <div className="space-y-4 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Metric 1: Graham Margin of Safety */}
            <div className="p-3.5 rounded-lg bg-[#0e1626] border border-slate-800">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Graham Margin of Safety
              </div>
              <div
                className={`mt-1 text-lg font-bold font-mono ${
                  trad.isGrahamCompliant ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {trad.marginOfSafetyPct}%
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                Basis: ${trad.grahamReplacementBasis.toLocaleString()} · {trad.isGrahamCompliant ? "COMPLIANT (≥30%)" : "THIN SPREAD"}
              </div>
            </div>

            {/* Metric 2: Moving Average Cross Signal */}
            <div className="p-3.5 rounded-lg bg-[#0e1626] border border-slate-800">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                20M vs 50M Trend State
              </div>
              <div className="mt-1 text-sm font-bold font-mono text-cyan-300">
                {trad.movingAverageSignal}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                SMA-20: {trad.sma20Month ? `$${trad.sma20Month.toLocaleString()}` : "N/A"} · SMA-50: {trad.sma50Month ? `$${trad.sma50Month.toLocaleString()}` : "N/A"}
              </div>
            </div>

            {/* Metric 3: Periodic Monthly Sharpe */}
            <div className="p-3.5 rounded-lg bg-[#0e1626] border border-slate-800">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Periodic Monthly Sharpe (N=12)
              </div>
              <div className="mt-1 text-lg font-bold font-mono text-slate-100">
                {trad.periodicMonthlyExcessSharpe != null ? trad.periodicMonthlyExcessSharpe : "Unmeasured"}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                Risk-Free Yield: 4.5% Annual (N=12)
              </div>
            </div>

            {/* Metric 4: 5-Year CAGR */}
            <div className="p-3.5 rounded-lg bg-[#0e1626] border border-slate-800">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                5-Year Realized CAGR
              </div>
              <div className="mt-1 text-lg font-bold font-mono text-emerald-400">
                {trad.cagr5yPct != null ? `${trad.cagr5yPct}%` : "Horizon < 5Y"}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                Strict 1,825-Day Verified Multi-Year Horizon
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Metric 1: Bollinger Z-Score Dislocation */}
            <div className="p-3.5 rounded-lg bg-[#0e1626] border border-slate-800">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Bollinger Z-Score (Mean Reversion)
              </div>
              <div
                className={`mt-1 text-lg font-bold font-mono ${
                  contra.isCapitulationDislocation
                    ? "text-emerald-400"
                    : contra.fallingKnifeAlert
                      ? "text-rose-400 animate-pulse"
                      : "text-slate-200"
                }`}
              >
                {contra.zScore != null ? `${contra.zScore}σ` : "N/A"}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                {contra.isCapitulationDislocation
                  ? "CAPITULATION BUY (Z < -1.8 & RSI < 35)"
                  : contra.fallingKnifeAlert
                    ? "⚠️ FALLING KNIFE ALERT (Z < -1.8, Support Forming)"
                    : "Within Statistical Envelope"}
              </div>
            </div>

            {/* Metric 2: Census Turnover Ratio */}
            <div className="p-3.5 rounded-lg bg-[#0e1626] border border-slate-800">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Census Turnover Ratio (CTR)
              </div>
              <div className="mt-1 text-lg font-bold font-mono text-purple-300">
                {contra.censusTurnoverRatio != null ? contra.censusTurnoverRatio : contra.turnoverVelocityTier}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                {contra.turnoverVelocityTier} · {contra.circulatingFloatEstimate !== null ? `~${contra.circulatingFloatEstimate} Float` : "Dormant"}
              </div>
            </div>

            {/* Metric 3: Markov Grading Profit */}
            <div className="p-3.5 rounded-lg bg-[#0e1626] border border-slate-800">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Probability-Weighted Net Profit
              </div>
              <div
                className={`mt-1 text-lg font-bold font-mono ${
                  contra.markovGradingExpectedProfit >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                ${contra.markovGradingExpectedProfit.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                Includes Downgrade Yield Penalties & Fees
              </div>
            </div>

            {/* Metric 4: Recommended Action */}
            <div className="p-3.5 rounded-lg bg-[#0e1626] border border-slate-800">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Contrarian Action
              </div>
              <div className="mt-1 text-sm font-bold font-mono text-cyan-300">
                {contra.markovRecommendedAction}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                Regime: {contra.contrarianRegime}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Institutional Explainer Footer */}
      <div className="mt-5 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 font-mono relative z-10">
        <div>
          Governed by Sovereign Canonical System Map · Zero Synthetic Hallucination Rule Active
        </div>
        <div className="text-cyan-400/80 flex items-center gap-1 font-semibold">
          PANEL PROFITS INSTITUTIONAL DESK <ArrowUpRight className="h-3 w-3" />
        </div>
      </div>
    </section>
  );
}
