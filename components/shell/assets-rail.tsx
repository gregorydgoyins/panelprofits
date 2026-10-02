"use client";

import * as React from "react";
import Link from "next/link";
import { Boxes, ArrowUpRight } from "lucide-react";
import type { CanonicalAssetSurface } from "@/lib/equity/canonical-equities";
import { generateDynamicCoverSvg } from "@/lib/comics/cover-resolver";

interface AssetsRailProps {
  items: CanonicalAssetSurface[];
}

const CANONICAL_16_ASSET_CLASSES = [
  { name: "Certified Universal Slabs (CGC 9.8)", tag: "SOV", color: "text-emerald-300", bg: "bg-emerald-950/60", border: "border-emerald-500/30" },
  { name: "Witnessed Signature Series", tag: "SIG", color: "text-amber-300", bg: "bg-amber-950/60", border: "border-amber-500/30" },
  { name: "Recognized Pedigree Collection", tag: "PED", color: "text-purple-300", bg: "bg-purple-950/60", border: "border-purple-500/30" },
  { name: "Newsstand Distributor Edition", tag: "NEW", color: "text-blue-300", bg: "bg-blue-950/60", border: "border-blue-500/30" },
  { name: "Regional Price Test Variant", tag: "PRV", color: "text-rose-300", bg: "bg-rose-950/60", border: "border-rose-500/30" },
  { name: "Retailer Ratio Incentive Variant", tag: "RAT", color: "text-cyan-300", bg: "bg-cyan-950/60", border: "border-cyan-500/30" },
  { name: "Raw / Uncertified Specimen", tag: "RAW", color: "text-slate-300", bg: "bg-slate-800/60", border: "border-slate-600/30" },
  { name: "Cover Art / Foil / Virgin Edition", tag: "VAR", color: "text-fuchsia-300", bg: "bg-fuchsia-950/60", border: "border-fuchsia-500/30" },
  { name: "Direct Market Comic Shop Edition", tag: "DIR", color: "text-sky-300", bg: "bg-sky-950/60", border: "border-sky-500/30" },
  { name: "Certified Qualified Label", tag: "QLF", color: "text-green-300", bg: "bg-green-950/60", border: "border-green-500/30" },
  { name: "Restored / Conserved Specimen", tag: "RES", color: "text-yellow-300", bg: "bg-yellow-950/60", border: "border-yellow-500/30" },
  { name: "Alternative Third-Party Slabs", tag: "ALT", color: "text-teal-300", bg: "bg-teal-950/60", border: "border-teal-500/30" },
  { name: "Incomplete / Reading Copy Pool", tag: "INC", color: "text-orange-300", bg: "bg-orange-950/60", border: "border-orange-500/30" },
  { name: "Foreign Market / Translated Edition", tag: "INT", color: "text-indigo-300", bg: "bg-indigo-950/60", border: "border-indigo-500/30" },
  { name: "Manufacturing Error Copy", tag: "ERR", color: "text-red-300", bg: "bg-red-950/60", border: "border-red-500/30" },
  { name: "Prototype, Ashcan & Advance Copy", tag: "ASH", color: "text-violet-300", bg: "bg-violet-950/60", border: "border-violet-500/30" },
];

export function AssetsRail({ items }: AssetsRailProps) {
  const [selectedFilter, setSelectedFilter] = React.useState<"SEATS" | "CLASSES">("SEATS");

  // Duplicate seat items to guarantee seamless continuous marquee loop
  const marqueeSeats = React.useMemo(() => {
    if (!items.length) return [];
    let list = items;
    while (list.length < 24) {
      list = [...list, ...items];
    }
    return [...list, ...list];
  }, [items]);

  // Duplicate asset classes for seamless loop
  const marqueeClasses = React.useMemo(() => {
    return [...CANONICAL_16_ASSET_CLASSES, ...CANONICAL_16_ASSET_CLASSES, ...CANONICAL_16_ASSET_CLASSES];
  }, []);

  return (
    <aside
      aria-label="16 Canonical Comic Asset Classes Surveillance Rail"
      className="border-b border-slate-800/80 bg-[#060910] text-xs text-slate-300 shadow-md select-none"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-1.5 sm:px-4">
        {/* Left Anchor */}
        <div className="flex shrink-0 items-center gap-2 border-r border-slate-800 pr-3">
          <Link
            href="/assets"
            className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-cyan-400 hover:text-cyan-300 transition-colors"
            title="Open 16 Canonical Collectible Asset Classes Registry"
          >
            <Boxes className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">ASSETS</span>
            <span className="rounded bg-cyan-950/70 border border-cyan-500/40 px-1 py-0.2 text-[9px] text-cyan-300 font-bold">
              16 CLASSES
            </span>
          </Link>

          {/* Toggle between Seats and Asset Families */}
          <div className="hidden md:flex items-center rounded border border-slate-800 bg-[#080D17] p-0.5 ml-1">
            <button
              onClick={() => setSelectedFilter("SEATS")}
              className={`rounded px-1.5 py-0.5 text-[8px] font-mono uppercase tracking-wider transition-colors ${
                selectedFilter === "SEATS"
                  ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              70 Seats
            </button>
            <button
              onClick={() => setSelectedFilter("CLASSES")}
              className={`rounded px-1.5 py-0.5 text-[8px] font-mono uppercase tracking-wider transition-colors ${
                selectedFilter === "CLASSES"
                  ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              16 Classes
            </button>
          </div>
        </div>

        {/* Continuously Animated Constituents / Asset Classes Rail */}
        <div
          className="assets-marquee min-w-0 flex-1 overflow-hidden py-0.5"
          role="region"
          aria-label="Certified Asset Surfaces Ticker"
        >
          {selectedFilter === "SEATS" ? (
            marqueeSeats.length > 0 ? (
              <div className="assets-marquee-track flex w-max items-center gap-2.5 hover:[animation-play-state:paused] focus-within:[animation-play-state:paused] motion-reduce:animate-none">
                {marqueeSeats.map((seat, index) => {
                  const fallbackSvg = generateDynamicCoverSvg(
                    seat.series,
                    seat.issueNumber,
                    seat.publisher,
                    seat.year
                  );

                  return (
                    <Link
                      key={`${seat.id}-${index}`}
                      href={`/assets/${encodeURIComponent(seat.id)}`}
                      className="group flex shrink-0 items-center gap-2 rounded border border-slate-800/80 bg-[#0A0E18] px-2 py-1 text-[10px] transition-all hover:border-cyan-400/60 hover:bg-[#0F1626] focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      title={`Inspect Seat #${seat.seatNumber}: ${seat.titleIssue} (Gregory Score: ${seat.gregoryScore})`}
                    >
                      {/* Authentic Issue Cover Thumbnail with Guaranteed Fallback */}
                      <div className="relative h-7 w-5 shrink-0 overflow-hidden rounded-[2px] border border-cyan-800/50 bg-[#04060A] shadow-sm">
                        <img
                          src={seat.coverUrl || fallbackSvg}
                          alt={seat.titleIssue}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = fallbackSvg;
                          }}
                        />
                      </div>

                      {/* Seat Number & Title */}
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="rounded bg-cyan-950/60 border border-cyan-500/30 px-1 py-0.2 font-mono text-[9px] font-bold text-cyan-300">
                          SEAT #{seat.seatNumber}
                        </span>
                        <span className="max-w-[120px] truncate font-medium text-slate-200 group-hover:text-cyan-200 transition-colors">
                          {seat.series}
                        </span>
                        <span className="text-slate-500 font-mono">#{seat.issueNumber}</span>
                      </div>

                      {/* Era & Gregory Score */}
                      <div className="flex items-center gap-1 font-mono text-[9px]">
                        <span className="text-slate-400 font-medium">{seat.era}</span>
                        <span className="rounded bg-slate-800/80 px-1 py-0.2 text-cyan-300 font-bold border border-slate-700">
                          GS {seat.gregoryScore}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <span className="border border-cyan-900/40 bg-cyan-950/20 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-[0.14em] text-cyan-400">
                Synchronizing 70 Certified Asset Seats...
              </span>
            )
          ) : (
            // 16 Canonical Collectible Asset Classes Animated Ticker
            <div className="assets-marquee-track flex w-max items-center gap-2.5 hover:[animation-play-state:paused] focus-within:[animation-play-state:paused] motion-reduce:animate-none">
              {marqueeClasses.map((cls, idx) => (
                <Link
                  key={`${cls.tag}-${idx}`}
                  href="/assets"
                  className="flex shrink-0 items-center gap-1.5 rounded border border-slate-800 bg-[#090D18] px-2 py-1 text-[10px] font-mono hover:border-cyan-500/50 hover:bg-[#0E1524] transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  title={`Inspect ${cls.name} (${cls.tag}) valuation framework`}
                >
                  <span className={`rounded ${cls.bg} border ${cls.border} px-1 py-0.2 text-[9px] font-bold ${cls.color}`}>
                    {cls.tag}
                  </span>
                  <span className={cls.color}>{cls.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Counter Link */}
        <div className="hidden lg:flex items-center gap-1 shrink-0 border-l border-slate-800 pl-2">
          <Link
            href="/assets"
            className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 hover:text-cyan-300 transition-colors"
          >
            <span>Constituent Register</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </aside>
  );
}