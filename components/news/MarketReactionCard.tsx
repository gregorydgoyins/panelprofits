"use client";

import * as React from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  ArrowUpRight,
  Bookmark,
  Check,
  ShieldCheck,
  Layers,
  BarChart3,
} from "lucide-react";
import type { AffectedComicKey, CatalystAnalysis } from "@/lib/news/catalyst";

interface MarketReactionCardProps {
  catalyst: CatalystAnalysis;
  storyTitle?: string;
}

export function MarketReactionCard({ catalyst, storyTitle }: MarketReactionCardProps) {
  const [savedTickers, setSavedTickers] = React.useState<Record<string, boolean>>({});

  if (!catalyst || !catalyst.affectedComics || catalyst.affectedComics.length === 0) {
    return null;
  }

  const toggleWatchlist = (ticker: string) => {
    setSavedTickers((prev) => ({
      ...prev,
      [ticker]: !prev[ticker],
    }));
  };

  const isBullish = catalyst.marketImpact === "BULLISH";
  const isVolatility = catalyst.marketImpact === "VOLATILITY";
  const isBearish = catalyst.marketImpact === "BEARISH";

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-cyan-500/30 bg-[#070A12] shadow-2xl">
      {/* Institutional Bloomberg-style Terminal Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-950/80 bg-gradient-to-r from-[#0C1220] via-[#090E18] to-[#0C1220] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-cyan-400">
            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-cyan-300" />
          </span>
          <span className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
            Market Reaction &amp; Equity Valuation
          </span>
          <span className="hidden sm:inline-block text-slate-700">|</span>
          <span className="hidden text-[10px] font-mono uppercase text-slate-400 sm:inline-block">
            Sovereign Key Impact Radar
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider ${
              isBullish
                ? "border-emerald-500/40 bg-emerald-950/50 text-emerald-300"
                : isVolatility
                ? "border-cyan-500/40 bg-cyan-950/50 text-cyan-300"
                : isBearish
                ? "border-rose-500/40 bg-rose-950/50 text-rose-300"
                : "border-slate-700 bg-slate-900 text-slate-300"
            }`}
          >
            {isBullish ? (
              <TrendingUp className="h-3 w-3 text-emerald-400" />
            ) : isBearish ? (
              <TrendingDown className="h-3 w-3 text-rose-400" />
            ) : (
              <Activity className="h-3 w-3 text-cyan-400" />
            )}
            {catalyst.marketImpact} ({Math.round(catalyst.impactScore * 100)}% PROBABILITY)
          </span>
        </div>
      </div>

      {/* Rationale Thesis */}
      <div className="border-b border-slate-800/60 bg-[#06080E]/70 px-4 py-2.5 sm:px-5">
        <div className="flex items-start gap-2">
          <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />
          <p className="text-xs leading-relaxed text-slate-300">
            <strong className="text-cyan-200">Catalyst Rationale: </strong>
            {catalyst.reasoning}
          </p>
        </div>
      </div>

      {/* Target Sovereign Comic Ticker Matrix */}
      <div className="divide-y divide-slate-800/50 p-3 sm:p-4">
        {catalyst.affectedComics.map((comic) => {
          const isSaved = Boolean(savedTickers[comic.ticker]);

          return (
            <div
              key={comic.title}
              className="group flex flex-col gap-3 py-3 first:pt-1 last:pb-1 sm:flex-row sm:items-center sm:justify-between"
            >
              {/* Left Column: Ticker & Significance */}
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center justify-center rounded-lg border border-cyan-500/30 bg-[#0B101E] px-2.5 py-1.5 shadow-sm">
                  <span className="font-mono text-xs font-black tracking-wider text-cyan-300">
                    {comic.ticker}
                  </span>
                  <span className="font-mono text-[8px] uppercase tracking-wider text-slate-400">
                    CGC 9.8
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-100 group-hover:text-cyan-200 transition-colors">
                      {comic.title}
                    </span>
                    {comic.volumeSurge && (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-950/40 border border-amber-500/30 px-1.5 py-0.5 text-[9px] font-mono font-bold text-amber-300 uppercase">
                        <Zap className="h-2.5 w-2.5 text-amber-400" /> High Volatility Run
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400 line-clamp-1">
                    {comic.keySignificance}
                  </p>
                </div>
              </div>

              {/* Right Column: Pricing & Quick Actions */}
              <div className="flex items-center justify-between gap-4 border-t border-slate-800/40 pt-2 sm:border-t-0 sm:pt-0">
                <div className="text-left sm:text-right">
                  <div className="flex items-center gap-1.5 sm:justify-end">
                    <span className="font-mono text-[10px] uppercase text-slate-500">FMV:</span>
                    <span className="font-mono text-sm font-bold text-emerald-400">
                      {comic.priceFormatted}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                    {comic.delta7d && (
                      <span className="text-emerald-400 font-semibold">{comic.delta7d} (7D)</span>
                    )}
                    {comic.delta30d && (
                      <span className="text-slate-500">· {comic.delta30d} (30D)</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleWatchlist(comic.ticker)}
                    className={`flex items-center gap-1 rounded px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors ${
                      isSaved
                        ? "border border-emerald-500/50 bg-emerald-950/40 text-emerald-300"
                        : "border border-slate-800 bg-[#0A0E17] text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                    title={isSaved ? "Saved to Vault Watchlist" : "Track this sovereign ticker"}
                  >
                    {isSaved ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" /> Tracked
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-3 w-3" /> Track
                      </>
                    )}
                  </button>

                  <Link
                    href={`/comics?q=${encodeURIComponent(comic.catalogQuery)}`}
                    className="flex items-center gap-1 rounded border border-cyan-500/40 bg-cyan-950/40 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-cyan-300 hover:bg-cyan-900/50 hover:text-cyan-100 transition-colors"
                    title="Inspect live certified listings and market depth"
                  >
                    <span>Valuation</span>
                    <ArrowUpRight className="h-3 w-3 text-cyan-400" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
