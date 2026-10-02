"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Boxes, ShieldCheck, Sparkles, Layers, Award, ArrowUpRight } from "lucide-react";
import type { CanonicalAssetSurface } from "@/lib/equity/canonical-equities";

interface AssetsRailProps {
  items: CanonicalAssetSurface[];
}

export function AssetsRail({ items }: AssetsRailProps) {
  const [selectedFilter, setSelectedFilter] = React.useState<"SEATS" | "CLASSES">("SEATS");

  return (
    <aside
      aria-label="16 Canonical Comic Asset Classes Surveillance Rail"
      className="border-b border-slate-800/80 bg-[#060910] text-xs text-slate-300 shadow-md"
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

        {/* Scrolling Constituents / Asset Classes Rail */}
        <div
          tabIndex={0}
          role="region"
          aria-label="Certified Asset Surfaces Ticker"
          className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-0.5 no-scrollbar scroll-smooth"
        >
          {selectedFilter === "SEATS" ? (
            items.length > 0 ? (
              items.map((seat) => (
                <Link
                  key={seat.id}
                  href={`/assets/${encodeURIComponent(seat.id)}`}
                  className="group flex shrink-0 items-center gap-2 rounded border border-slate-800/80 bg-[#0A0E18] px-2 py-1 text-[10px] transition-all hover:border-cyan-400/60 hover:bg-[#0F1626]"
                  title={`Inspect Seat #${seat.seatNumber}: ${seat.titleIssue}`}
                >
                  {/* Cover Artwork Thumbnail */}
                  {seat.coverUrl ? (
                    <div className="relative h-6 w-4 shrink-0 overflow-hidden rounded-[2px] border border-slate-800 bg-[#04060A]">
                      <Image
                        src={seat.coverUrl}
                        alt={seat.titleIssue}
                        fill
                        sizes="16px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-6 w-4 shrink-0 items-center justify-center rounded-[2px] border border-slate-800 bg-slate-900 text-[8px] font-mono text-cyan-400">
                      #{seat.seatNumber}
                    </div>
                  )}

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
              ))
            ) : (
              <span className="border border-cyan-900/40 bg-cyan-950/20 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-[0.14em] text-cyan-400">
                Synchronizing 70 Certified Asset Seats...
              </span>
            )
          ) : (
            // 16 Canonical Collectible Asset Classes Preview
            <div className="flex items-center gap-2">
              {[
                { name: "Certified Universal Slabs (CGC 9.8)", tag: "SOV", color: "text-emerald-300" },
                { name: "Witnessed Signature Series", tag: "SIG", color: "text-amber-300" },
                { name: "Pedigree Collections (Mile High)", tag: "PED", color: "text-purple-300" },
                { name: "Newsstand Barcode Editions", tag: "NEW", color: "text-blue-300" },
                { name: "Regional Price Variants (CPV/35¢)", tag: "PRV", color: "text-rose-300" },
                { name: "Retailer Ratio Incentives (1:50)", tag: "RAT", color: "text-cyan-300" },
                { name: "Raw Uncertified Specimen Pool", tag: "RAW", color: "text-slate-300" },
              ].map((cls) => (
                <Link
                  key={cls.tag}
                  href="/assets"
                  className="flex shrink-0 items-center gap-1.5 rounded border border-slate-800 bg-[#090D18] px-2 py-1 text-[10px] font-mono hover:border-cyan-500/50 hover:bg-[#0E1524] transition-colors"
                >
                  <span className="rounded bg-cyan-950/60 border border-cyan-500/30 px-1 py-0.2 text-[9px] font-bold text-cyan-300">
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