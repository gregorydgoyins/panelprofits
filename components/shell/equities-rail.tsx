"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  TrendingUp,
  TrendingDown,
  Layers,
  CandlestickChart,
  ChevronRight,
  Filter,
  Activity,
  ShieldCheck,
} from "lucide-react";
import type { SovereignEquityItem } from "@/lib/equity/canonical-equities";
import type { MarketIndexRecord } from "@/lib/market/indices";

interface EquitiesRailProps {
  items: SovereignEquityItem[];
  indices?: MarketIndexRecord[];
}

export function EquitiesRail({ items, indices = [] }: EquitiesRailProps) {
  const [selectedEra, setSelectedEra] = React.useState<string>("ALL");
  const [isPaused, setIsPaused] = React.useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);

  // Filter items by era if selected
  const filteredItems = React.useMemo(() => {
    if (selectedEra === "ALL") return items;
    return items.filter((item) => item.originEra === selectedEra);
  }, [items, selectedEra]);

  // Default benchmarks if not provided
  const ce70Index = indices.find((i) => i.indexCode === "CE70");
  const ppix100Index = indices.find((i) => i.indexCode === "PPIX100");
  const ppix60Index = indices.find((i) => i.indexCode === "PPIX60");

  const eraList = ["ALL", "GOLDEN", "ATOMIC", "SILVER", "BRONZE", "COPPER", "MODERN"];

  return (
    <aside
      aria-label="Sovereign Comic Equity Surveillance Rail"
      className="border-b border-slate-800/80 bg-[#070A11] text-xs text-slate-300 shadow-md"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-1.5 sm:px-4">
        {/* Left Anchor: Benchmark Index Matrix */}
        <div className="flex shrink-0 items-center gap-2 border-r border-slate-800 pr-3">
          <Link
            href="/equities"
            className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-emerald-300 hover:text-emerald-200 transition-colors"
            title="Open Sovereign Equities Trading Floor"
          >
            <CandlestickChart className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">EQUITIES</span>
            <span className="rounded bg-emerald-950/70 border border-emerald-500/40 px-1 py-0.2 text-[9px] text-emerald-300 font-bold">
              CE70
            </span>
          </Link>

          {/* Micro Index Ticker Chips */}
          <div className="hidden md:flex items-center gap-2 border-l border-slate-800/80 pl-2">
            <Link
              href="/equity/CE70"
              className="flex items-center gap-1 text-[10px] font-mono hover:text-emerald-300 transition-colors"
            >
              <span className="text-slate-400 font-semibold">CE70:</span>
              <span className="text-slate-100 font-bold">
                {ce70Index?.currentValue ? `$${ce70Index.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "$2,486.45"}
              </span>
              <span className="text-emerald-400 font-bold">▲ +0.68%</span>
            </Link>

            <span className="text-slate-700">·</span>

            <Link
              href="/equity/PPIX100"
              className="flex items-center gap-1 text-[10px] font-mono hover:text-emerald-300 transition-colors"
            >
              <span className="text-slate-400 font-semibold">PPIX100:</span>
              <span className="text-slate-100 font-bold">
                {ppix100Index?.currentValue ? `$${ppix100Index.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "$1,130.82"}
              </span>
              <span className="text-emerald-400 font-bold">▲ +0.56%</span>
            </Link>
          </div>
        </div>

        {/* Scrolling Sovereign Comic Constituents Rail */}
        <div
          ref={scrollContainerRef}
          tabIndex={0}
          role="region"
          aria-label="Sovereign Comic Constituents Ticker"
          className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-0.5 no-scrollbar scroll-smooth"
        >
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const isPositive = item.deltaPercent >= 0;

              return (
                <Link
                  key={item.id}
                  href={`/equity/${item.ticker}`}
                  className="group flex shrink-0 items-center gap-2 rounded border border-slate-800/80 bg-[#0B0F18] px-2 py-1 text-[10px] transition-all hover:border-emerald-400/60 hover:bg-[#101724]"
                  title={`Inspect ${item.series} #${item.issueNumber} sovereign equity dossier`}
                >
                  {/* Cover Artwork Thumbnail */}
                  {item.coverUrl ? (
                    <div className="relative h-6 w-4 shrink-0 overflow-hidden rounded-[2px] border border-slate-800 bg-[#05070B]">
                      <Image
                        src={item.coverUrl}
                        alt={`${item.series} #${item.issueNumber}`}
                        fill
                        sizes="16px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-6 w-4 shrink-0 items-center justify-center rounded-[2px] border border-slate-800 bg-slate-900 text-[8px] font-mono text-emerald-400">
                      $
                    </div>
                  )}

                  {/* Ticker & Title */}
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="rounded bg-emerald-950/60 border border-emerald-500/30 px-1 py-0.2 font-mono text-[9px] font-bold text-emerald-300">
                      {item.ticker}
                    </span>
                    <span className="max-w-[120px] truncate font-medium text-slate-200 group-hover:text-emerald-200 transition-colors">
                      {item.series}
                    </span>
                    <span className="text-slate-500 font-mono">#{item.issueNumber}</span>
                  </div>

                  {/* Valuation & Delta */}
                  <div className="flex items-center gap-1 font-mono">
                    <span className="font-bold text-slate-100">{item.priceFormatted}</span>
                    <span
                      className={`text-[9px] font-semibold flex items-center ${
                        isPositive ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {isPositive ? "▲" : "▼"} {isPositive ? `+${item.deltaPercent}%` : `${item.deltaPercent}%`}
                    </span>
                  </div>
                </Link>
              );
            })
          ) : (
            <span className="border border-emerald-900/40 bg-emerald-950/20 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-[0.14em] text-emerald-300">
              Synchronizing CE70 Sovereign Port...
            </span>
          )}
        </div>

        {/* Right Filter Chips */}
        <div className="hidden xl:flex items-center gap-1 shrink-0 border-l border-slate-800 pl-2">
          {eraList.map((era) => (
            <button
              key={era}
              onClick={() => setSelectedEra(era)}
              className={`rounded px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider transition-colors ${
                selectedEra === era
                  ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {era}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}