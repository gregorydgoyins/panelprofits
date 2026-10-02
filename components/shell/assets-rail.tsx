"use client";

import * as React from "react";
import Link from "next/link";
import { Boxes, Sparkles, Layers } from "lucide-react";
import type { CanonicalAssetSurface } from "@/lib/equity/canonical-equities";
import { CANONICAL_16_ASSET_FAMILIES } from "@/lib/equity/canonical-equities";
import { generateDynamicCoverSvg } from "@/lib/comics/cover-resolver";
import { getEraColors } from "@/lib/design-system/colors";

interface AssetsRailProps {
  items: CanonicalAssetSurface[];
}

export function AssetsRail({ items }: AssetsRailProps) {
  const [selectedFilter, setSelectedFilter] = React.useState<"SEATS" | "CLASSES">("SEATS");

  // Duplicate seat items to guarantee seamless continuous marquee loop
  const marqueeSeats = React.useMemo(() => {
    if (!items.length) return [];
    let list = items;
    while (list.length < 20) {
      list = [...list, ...items];
    }
    return [...list, ...list];
  }, [items]);

  // Duplicate asset classes for seamless loop
  const marqueeClasses = React.useMemo(() => {
    return [...CANONICAL_16_ASSET_FAMILIES, ...CANONICAL_16_ASSET_FAMILIES, ...CANONICAL_16_ASSET_FAMILIES];
  }, []);

  return (
    <aside
      aria-label="16 Canonical Comic Asset Classes Surveillance Rail"
      className="border-b border-slate-800/80 bg-[#060910] text-xs text-slate-300 shadow-md select-none overflow-hidden"
    >
      {/* Top Header & Mode Toggle Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-1.5 sm:px-4 border-b border-slate-800/60">
        {/* Left Anchor */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/assets"
            className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-cyan-400 hover:text-cyan-300 transition-colors"
            title="Open 16 Canonical Collectible Asset Classes Registry"
          >
            <Boxes className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">ASSETS</span>
            <span className="rounded bg-cyan-950/70 border border-cyan-500/40 px-1 py-0.2 text-[9px] text-cyan-300 font-bold">
              16 FAMILIES
            </span>
          </Link>

          {/* Toggle between Seats and Asset Families */}
          <div className="flex items-center rounded border border-slate-800 bg-[#080D17] p-0.5 ml-1">
            <button
              onClick={() => setSelectedFilter("SEATS")}
              className={`rounded px-2 py-0.5 text-[8.5px] font-mono uppercase tracking-wider transition-colors ${
                selectedFilter === "SEATS"
                  ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              70 Constituent Seats
            </button>
            <button
              onClick={() => setSelectedFilter("CLASSES")}
              className={`rounded px-2 py-0.5 text-[8.5px] font-mono uppercase tracking-wider transition-colors ${
                selectedFilter === "CLASSES"
                  ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              16 Asset Classes
            </button>
          </div>
        </div>

        {/* Right Info Chip */}
        <div className="hidden sm:flex items-center gap-2 text-[9px] font-mono text-slate-500">
          <span className="text-cyan-400/90 font-semibold flex items-center gap-1">
            <Layers className="h-3 w-3 text-cyan-400" />
            {selectedFilter === "SEATS" ? "CE70 CONSTITUENT GALLERY" : "CANONICAL MATRIX"}
          </span>
          <span className="text-slate-600 hidden md:inline">· Hover to Pause</span>
        </div>
      </div>

      {/* Continuously Animated Constituents / Asset Classes Marquee Rail */}
      <div
        className="assets-marquee relative min-w-0 overflow-hidden py-1 bg-[#04060C]"
        role="region"
        aria-label="Certified Asset Surfaces Ticker"
      >
        {/* Left & Right Bloomberg Ambient Fade Scrims */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#04060C] via-[#04060C]/80 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#04060C] via-[#04060C]/80 to-transparent z-10" />

        {selectedFilter === "SEATS" ? (
          marqueeSeats.length > 0 ? (
            <div className="assets-marquee-track flex w-max items-center hover:[animation-play-state:paused] focus-within:[animation-play-state:paused] motion-reduce:animate-none">
              {marqueeSeats.map((seat, index) => {
                const eraColors = getEraColors(seat.era);
                const coverSrc =
                  seat.coverUrl ||
                  generateDynamicCoverSvg(
                    seat.series,
                    seat.issueNumber,
                    seat.publisher,
                    seat.year
                  );

                return (
                  <Link
                    key={`${seat.id}-${index}`}
                    href={`/assets/${encodeURIComponent(seat.id)}`}
                    className="asset-seat-card group flex shrink-0 items-center gap-2 rounded border border-slate-800/80 bg-[#090D17] px-2.5 py-1 text-[11px] transition-all hover:border-cyan-400/60 hover:bg-[#0F1626] focus:outline-none focus:ring-1 focus:ring-cyan-400 select-none mr-2.5"
                    style={{
                      ["--rim" as string]: eraColors.border || "#06b6d4",
                    }}
                    title={`Inspect Seat #${seat.seatNumber}: ${seat.titleIssue} (Gregory Score: ${seat.gregoryScore})`}
                  >
                    {/* Authentic Cover Thumbnail (Crisp 2:3 Thumbnail) */}
                    <div className="relative h-7 w-5 shrink-0 overflow-hidden rounded-[2px] border border-slate-800 bg-[#030508]">
                      <img
                        src={coverSrc}
                        alt={seat.titleIssue}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = generateDynamicCoverSvg(
                            seat.series,
                            seat.issueNumber,
                            seat.publisher,
                            seat.year
                          );
                        }}
                      />
                    </div>

                    {/* Seat Number & Title */}
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <span className="rounded bg-cyan-950/85 border border-cyan-500/40 px-1.5 py-0.2 font-mono text-[9px] font-bold text-cyan-300">
                        {`SEAT #${seat.seatNumber}`}
                      </span>
                      <span className="text-slate-200 group-hover:text-cyan-300 transition-colors font-medium max-w-[140px] truncate">
                        {seat.titleIssue}
                      </span>
                    </div>

                    {/* Era & Gregory Score */}
                    <div className="flex items-center gap-1 font-mono text-[9px]">
                      <span
                        className="px-1 py-0.2 rounded text-[7.5px] font-mono font-bold tracking-wider uppercase"
                        style={{
                          backgroundColor: eraColors.bg,
                          color: "#FFF",
                          border: `1px solid ${eraColors.border}`,
                        }}
                      >
                        {seat.era}
                      </span>
                      <span className="rounded bg-slate-800/80 px-1 py-0.2 text-cyan-300 font-bold border border-slate-700 text-[8.5px]">
                        {`GS ${seat.gregoryScore}`}
                      </span>
                    </div>

                    {/* Publisher & Year */}
                    <span className="text-slate-400 text-[9px] font-mono hidden md:inline">
                      {seat.publisher} · {seat.year}
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center py-2">
              <span className="border border-cyan-900/40 bg-cyan-950/20 px-3 py-0.5 text-[10px] font-mono uppercase tracking-[0.14em] text-cyan-300">
                Synchronizing Sovereign Asset Seats...
              </span>
            </div>
          )
        ) : (
          /* 16 Canonical Collectible Asset Classes Track */
          <div className="assets-marquee-track flex w-max items-center hover:[animation-play-state:paused] focus-within:[animation-play-state:paused] motion-reduce:animate-none">
            {marqueeClasses.map((cls, index) => {
              const borderColors: Record<string, string> = {
                SOV: "#10b981",
                SIG: "#f59e0b",
                PED: "#a855f7",
                NEW: "#3b82f6",
                PRV: "#f43f5e",
                RAT: "#06b6d4",
                RAW: "#94a3b8",
                VAR: "#d946ef",
                DIR: "#0ea5e9",
                QLF: "#22c55e",
                RST: "#eab308",
                CNS: "#14b8a6",
                PRN: "#f97316",
                INT: "#6366f1",
                ERR: "#ef4444",
                ASH: "#8b5cf6",
              };
              const accentColor = borderColors[cls.shortCode] || "#06b6d4";

              return (
                <div
                  key={`${cls.id}-${index}`}
                  className="asset-seat-card group flex shrink-0 items-center gap-2 rounded border border-slate-800/80 bg-[#090D17] px-2.5 py-1 text-[11px] transition-all hover:border-cyan-400/60 hover:bg-[#0F1626] select-none mr-2.5"
                  style={{
                    ["--rim" as string]: accentColor,
                  }}
                >
                  <span
                    className="rounded px-1.5 py-0.2 font-mono text-[9px] font-bold tracking-wider"
                    style={{
                      backgroundColor: `${accentColor}18`,
                      color: accentColor,
                      border: `1px solid ${accentColor}40`,
                    }}
                  >
                    {cls.shortCode}
                  </span>
                  <span className="font-medium text-slate-200">{cls.name}</span>
                  <span className="rounded bg-slate-900 border border-slate-800 px-1 py-0.2 text-[8px] font-mono text-slate-400">
                    {cls.liquidityTier}
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 font-bold">
                    {cls.pricingPremiumFactor}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}