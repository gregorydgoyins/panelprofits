"use client";

import * as React from "react";
import Link from "next/link";
import { CandlestickChart, Activity } from "lucide-react";
import type { SovereignEquityItem } from "@/lib/equity/canonical-equities";
import type { MarketIndexRecord } from "@/lib/market/indices";
import { generateDynamicCoverSvg } from "@/lib/comics/cover-resolver";
import { getEraColors } from "@/lib/design-system/colors";

interface EquitiesRailProps {
  items: SovereignEquityItem[];
  indices?: MarketIndexRecord[];
}

export function EquitiesRail({ items, indices = [] }: EquitiesRailProps) {
  const [selectedEra, setSelectedEra] = React.useState<string>("ALL");

  // Filter items by era if selected
  const filteredItems = React.useMemo(() => {
    if (selectedEra === "ALL") return items;
    return items.filter((item) => item.originEra.toUpperCase() === selectedEra);
  }, [items, selectedEra]);

  // Ensure seamless marquee looping by ensuring track width spans at least 20 items before duplicating
  const marqueeItems = React.useMemo(() => {
    if (!filteredItems.length) return [];
    let list = filteredItems;
    while (list.length < 20) {
      list = [...list, ...filteredItems];
    }
    return [...list, ...list];
  }, [filteredItems]);

  // Benchmark index values
  const ce70Index = indices.find((i) => i.indexCode === "CE70");
  const ppix100Index = indices.find((i) => i.indexCode === "PPIX100");

  const eraList = ["ALL", "GOLDEN", "ATOMIC", "SILVER", "BRONZE", "COPPER", "MODERN"];

  return (
    <aside
      aria-label="Sovereign Comic Equity Surveillance Rail"
      className="border-b border-slate-800/80 bg-[#070A11] text-xs text-slate-300 shadow-md select-none overflow-hidden"
    >
      {/* Top Benchmark & Filter Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-1.5 sm:px-4 border-b border-slate-800/60">
        {/* Left Anchor: Benchmark Index Matrix */}
        <div className="flex items-center gap-2 sm:gap-3">
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
          <div className="hidden sm:flex items-center gap-2 border-l border-slate-800/80 pl-2">
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

        {/* Center / Right: Era Filter Buttons */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1">
            {eraList.map((era) => (
              <button
                key={era}
                onClick={() => setSelectedEra(era)}
                className={`rounded px-1.5 py-0.5 text-[8.5px] font-mono uppercase tracking-wider transition-colors ${
                  selectedEra === era
                    ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {era}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-1.5 border-l border-slate-800/80 pl-2 text-[9px] font-mono text-slate-500">
            <Activity className="h-3 w-3 text-emerald-400 animate-pulse" />
            <span className="text-emerald-400/90 font-semibold">LIVE</span>
            <span className="text-slate-600 hidden lg:inline">· Hover to Pause</span>
          </div>
        </div>
      </div>

      {/* Continuously Animated Sovereign Comic Constituents Marquee Rail */}
      <div
        className="equities-marquee relative min-w-0 overflow-hidden py-1 bg-[#05070C]"
        role="region"
        aria-label="Sovereign Comic Constituents Ticker"
      >
        {/* Left & Right Bloomberg Ambient Fade Scrims */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#05070C] via-[#05070C]/80 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#05070C] via-[#05070C]/80 to-transparent z-10" />

        {marqueeItems.length > 0 ? (
          <div className="equities-marquee-track flex w-max items-center hover:[animation-play-state:paused] focus-within:[animation-play-state:paused] motion-reduce:animate-none">
            {marqueeItems.map((item, index) => {
              const isPositive = item.deltaPercent >= 0;
              const eraColors = getEraColors(item.originEra);
              const coverSrc =
                item.coverUrl ||
                generateDynamicCoverSvg(
                  item.series,
                  item.issueNumber,
                  item.lineage.includes("DC") ? "DC Comics" : item.lineage.includes("Marvel") ? "Marvel" : "Independent",
                  1960
                );

              return (
                <Link
                  key={`${item.id}-${index}`}
                  href={`/equity/${item.ticker}`}
                  className="equity-card group flex shrink-0 items-center gap-2 rounded border border-slate-800/80 bg-[#0A0D15] px-2.5 py-1 text-[11px] transition-all hover:border-emerald-500/60 hover:bg-[#101624] focus:outline-none focus:ring-1 focus:ring-emerald-400 select-none mr-2.5"
                  style={{
                    ["--rim" as string]: eraColors.border,
                  }}
                  title={`Inspect ${item.series} #${item.issueNumber} (${item.ticker}) — FMV ${item.priceFormatted}`}
                >
                  {/* Authentic Comic Cover Artwork Frame (Crisp 2:3 Thumbnail) */}
                  <div className="relative h-7 w-5 shrink-0 overflow-hidden rounded-[2px] border border-slate-800 bg-[#030508]">
                    <img
                      src={coverSrc}
                      alt={`${item.series} #${item.issueNumber}`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = generateDynamicCoverSvg(
                          item.series,
                          item.issueNumber,
                          item.lineage.includes("DC") ? "DC Comics" : item.lineage.includes("Marvel") ? "Marvel" : "Independent",
                          1960
                        );
                      }}
                    />
                  </div>

                  {/* Ticker & Lineage */}
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="rounded bg-emerald-950/70 border border-emerald-500/40 px-1 py-0.2 font-mono text-[9px] font-bold text-emerald-300">
                      {item.ticker}
                    </span>
                    <span className="text-slate-200 group-hover:text-emerald-300 transition-colors font-medium max-w-[130px] truncate">
                      {item.series} #{item.issueNumber}
                    </span>
                  </div>

                  {/* Era Badge */}
                  <span
                    className="px-1 py-0.2 rounded text-[7.5px] font-mono font-bold tracking-wider uppercase"
                    style={{
                      backgroundColor: eraColors.bg,
                      color: "#FFF",
                      border: `1px solid ${eraColors.border}`,
                    }}
                  >
                    {item.originEra}
                  </span>

                  {/* CGC Grade */}
                  <span className="text-[9px] font-mono text-slate-400">
                    CGC {item.referenceGrade}
                  </span>

                  {/* Price & Performance Delta */}
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="font-bold text-emerald-400 text-[11px]">{item.priceFormatted}</span>
                    <span
                      className={`text-[8.5px] font-bold ${
                        isPositive ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {isPositive ? `▲ +${item.deltaPercent}%` : `▼ ${item.deltaPercent}%`}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center py-2">
            <span className="border border-emerald-900/40 bg-emerald-950/20 px-3 py-0.5 text-[10px] font-mono uppercase tracking-[0.14em] text-emerald-300">
              Synchronizing CE70 Sovereign Port...
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}