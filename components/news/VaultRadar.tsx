"use client";

import * as React from "react";
import { ShieldAlert, Zap, ArrowRight, Eye, CheckCircle2 } from "lucide-react";
import type { NewsStory } from "@/lib/news/types";
import { analyzeStoryCatalyst } from "@/lib/news/catalyst";

interface VaultRadarProps {
  stories: NewsStory[];
  isFilteringVault: boolean;
  onToggleVaultFilter: () => void;
  vaultStoriesCount: number;
}

export function VaultRadar({
  stories,
  isFilteringVault,
  onToggleVaultFilter,
  vaultStoriesCount,
}: VaultRadarProps) {
  // Aggregate unique sovereign tickers impacted across current stories
  const impactedTickers = React.useMemo(() => {
    const tickerSet = new Set<string>();
    for (const story of stories.slice(0, 40)) {
      const catalyst = analyzeStoryCatalyst(story.headline, story.summary);
      for (const comic of catalyst.affectedComics) {
        tickerSet.add(comic.ticker);
      }
    }
    return Array.from(tickerSet).slice(0, 8);
  }, [stories]);

  if (vaultStoriesCount === 0) return null;

  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-r from-[#140D07] via-[#0E0B09] to-[#0A0E18] p-4 shadow-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Indicator & Headline */}
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-500/40 bg-amber-950/60 shadow-inner">
            <ShieldAlert className="h-5 w-5 text-amber-400 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">
                Vault Impact Radar
              </span>
              <span className="rounded-full bg-amber-500/20 px-2 py-0.2 text-[9px] font-mono font-bold text-amber-300 border border-amber-500/30">
                {vaultStoriesCount} MARKET CATALYSTS ACTIVE
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-300">
              Breaking bulletins directly implicating investment-grade sovereign issues and CGC 9.8 census floats.
            </p>

            {/* Impacted Ticker Pills */}
            {impactedTickers.length > 0 && (
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono uppercase text-slate-500">Implicated:</span>
                {impactedTickers.map((ticker) => (
                  <span
                    key={ticker}
                    className="rounded bg-[#171410] border border-amber-500/20 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-amber-300"
                  >
                    {ticker}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Toggle Button */}
        <div className="shrink-0 self-end sm:self-center">
          <button
            onClick={onToggleVaultFilter}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-md ${
              isFilteringVault
                ? "border-amber-400 bg-amber-500 text-black hover:bg-amber-400"
                : "border-amber-500/50 bg-amber-950/40 text-amber-300 hover:border-amber-400 hover:bg-amber-900/40 hover:text-amber-200"
            }`}
          >
            {isFilteringVault ? (
              <>
                <CheckCircle2 className="h-4 w-4" /> Showing {vaultStoriesCount} Vault Bulletins
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" /> Isolate Vault Impact ({vaultStoriesCount})
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
