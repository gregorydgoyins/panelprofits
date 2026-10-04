"use client";

import * as React from "react";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  Scale,
  ShieldAlert,
  BookOpen,
  ArrowRight,
  Calculator,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ComicValuationMetrics } from "@/lib/finance/investopedia-service";

interface InvestopediaValuationLensProps {
  metrics: ComicValuationMetrics;
  series: string;
  issueNumber: string;
}

export function InvestopediaValuationLens({
  metrics,
  series,
  issueNumber,
}: InvestopediaValuationLensProps) {
  const [costBasisInput, setCostBasisInput] = React.useState<string>("");
  const [showGlossary, setShowGlossary] = React.useState<boolean>(false);

  const costBasis = parseFloat(costBasisInput);
  const hasCostBasis = !isNaN(costBasis) && costBasis > 0;
  const unrealizedGain = hasCostBasis ? metrics.fmvUsd - costBasis : 0;
  const unrealizedGainPct = hasCostBasis ? ((metrics.fmvUsd - costBasis) / costBasis) * 100 : 0;

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-[#0c1219] p-5 sm:p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <span>Investopedia Financial Valuation Lens</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-300">
                Institutional Equity
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Quantitative asset mechanics applied to {series} #{issueNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-xs">
            {metrics.assetClassLabel}
          </Badge>
          <span className="text-[11px] font-mono px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
            Haircut: <strong className="text-amber-400">{metrics.marginHaircut}</strong>
          </span>
        </div>
      </div>

      {/* Primary Financial Mechanics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Bid-Ask Spread & Liquidity Depth */}
        <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Scale className="h-3.5 w-3.5 text-cyan-400" />
              <span>Bid-Ask Spread</span>
            </span>
            <span className="font-mono text-cyan-300">{metrics.bidAskSpreadPercent}%</span>
          </div>
          <div className="flex justify-between items-baseline pt-1">
            <div>
              <span className="text-[10px] uppercase text-slate-500 block">Dealer Bid</span>
              <span className="text-sm font-semibold font-mono text-slate-200">
                ${metrics.wholesaleBidUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase text-slate-500 block">Retail Ask</span>
              <span className="text-sm font-semibold font-mono text-emerald-400">
                ${metrics.retailAskUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 pt-1 leading-snug">
            Modeled wholesale liquidity spread between cash buy-lists and retail auction clearing.
          </p>
        </div>

        {/* Metric 2: Estimated Market Float & Census Scarcity */}
        <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <DollarSign className="h-3.5 w-3.5 text-amber-400" />
              <span>Census Scarcity Ratio</span>
            </span>
            {metrics.scarcityRatioPercent !== undefined && (
              <span className="font-mono text-amber-300">{metrics.scarcityRatioPercent}% surviving</span>
            )}
          </div>
          <div className="flex justify-between items-baseline pt-1">
            <div>
              <span className="text-[10px] uppercase text-slate-500 block">Est. Print Run</span>
              <span className="text-sm font-semibold font-mono text-slate-200">
                {metrics.estimatedPrintRun ? `~${(metrics.estimatedPrintRun / 1000).toFixed(0)}k` : "—"}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase text-slate-500 block">Certified Census</span>
              <span className="text-sm font-semibold font-mono text-cyan-400">
                {metrics.censusCount ? metrics.censusCount.toLocaleString("en-US") : "Unindexed"}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 pt-1 leading-snug">
            Certified population float against original publisher circulation volume.
          </p>
        </div>

        {/* Metric 3: Institutional Collateral Tier & Haircut */}
        <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldAlert className="h-3.5 w-3.5 text-emerald-400" />
              <span>Collateral Borrowing Capacity</span>
            </span>
            <span className="font-mono text-emerald-400">
              {metrics.fmvUsd > 0 ? `$${(metrics.fmvUsd * (1 - parseFloat(metrics.marginHaircut) / 100)).toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "—"}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-500 block">Exchange Venue</span>
            <span className="text-xs font-semibold text-slate-200 truncate block">
              {metrics.venue}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 pt-1 leading-snug">
            Max collateral credit line against slab value after applying {metrics.marginHaircut} margin haircut.
          </p>
        </div>
      </div>

      {/* Interactive Cost Basis & Unrealized Gain/Loss Calculator */}
      <div className="rounded-lg bg-slate-950/90 border border-emerald-500/20 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-emerald-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Cost Basis & Unrealized Gain / Loss Calculator
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">
            Enter your acquisition price to calculate tax & portfolio return
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-1">
          <div className="sm:col-span-4 relative">
            <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono">$</span>
            <input
              type="number"
              value={costBasisInput}
              onChange={(e) => setCostBasisInput(e.target.value)}
              placeholder="e.g. 150.00"
              className="w-full rounded bg-slate-900 border border-slate-700 pl-7 pr-3 py-1.5 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="sm:col-span-8 flex flex-wrap items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-[10px] uppercase text-slate-500 block">Current 9.8 FMV</span>
              <span className="text-slate-200 font-medium">
                ${metrics.fmvUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {hasCostBasis && (
              <>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block">Unrealized Gain</span>
                  <span
                    className={`font-semibold ${
                      unrealizedGain >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {unrealizedGain >= 0 ? "+" : ""}${unrealizedGain.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase text-slate-500 block">Total ROI</span>
                  <span
                    className={`font-semibold ${
                      unrealizedGainPct >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {unrealizedGainPct >= 0 ? "+" : ""}{unrealizedGainPct.toFixed(2)}%
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Investopedia Financial Lexicon Drawer */}
      <div className="border-t border-slate-800 pt-3">
        <button
          type="button"
          onClick={() => setShowGlossary((prev) => !prev)}
          className="flex items-center justify-between w-full text-xs text-slate-400 hover:text-slate-200 transition-colors py-1"
        >
          <span className="flex items-center gap-1.5 font-medium">
            <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
            <span>Investopedia Financial Principles for this Asset</span>
            <Badge variant="secondary" className="text-[10px] ml-1">
              {metrics.relevantTerms.length} Core Concepts
            </Badge>
          </span>
          {showGlossary ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showGlossary && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
            {metrics.relevantTerms.map((term) => (
              <div
                key={term.slug}
                className="rounded bg-slate-950 p-3 border border-slate-800 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{term.term}</span>
                  <Link
                    href={`/lexicon/${term.slug}`}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
                  >
                    <span>Read Lexicon</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  <strong className="text-slate-300">Investopedia:</strong> {term.investopedia_definition}
                </p>
                <p className="text-[11px] text-emerald-400/90 leading-snug pt-0.5">
                  <strong className="text-emerald-300">Comic Equity Lens:</strong> {term.panel_profits_translation}
                </p>
                {term.canonical_formula && (
                  <div className="font-mono text-[10px] bg-slate-900 p-1.5 rounded border border-slate-800 text-cyan-300 truncate">
                    {term.canonical_formula}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
