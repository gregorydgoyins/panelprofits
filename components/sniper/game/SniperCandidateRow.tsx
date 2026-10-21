"use client";

import React, { useRef } from "react";
import type { LotItem } from "@/lib/sniper/sim/types";
import { ChevronLeft, ChevronRight, TrendingUp, ShieldCheck, Flame, CheckCircle2 } from "lucide-react";

interface SniperCandidateRowProps {
  candidates: LotItem[];
  activeLotId: string;
  onSelectLot: (lot: LotItem) => void;
}

export function SniperCandidateRow({
  candidates,
  activeLotId,
  onSelectLot,
}: SniperCandidateRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  if (!candidates || candidates.length === 0) return null;

  return (
    <div className="w-full space-y-2.5 font-mono">
      {/* Row Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
            <span>🎯</span> ROW OF UNDERWRITING DECISIONS ({candidates.length} LOTS ON FLOOR)
          </span>
          <span className="text-[10px] text-slate-500 hidden sm:inline">
            Scroll to inspect candidate momentum &amp; mini TradingView comps before committing capital
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={scrollLeft}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={scrollRight}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Strip */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent scroll-smooth"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {candidates.map((lot) => {
          const isActive = lot.id === activeLotId;
          const spreadPct = lot.fmv > 0 ? Math.round(((lot.fmv - lot.openingBid) / lot.fmv) * 100) : 0;
          const points = lot.chartPoints || [];

          // Generate a smooth mini TradingView sparkline from chart points
          const values = points.map((p) => p.value);
          const minVal = values.length > 0 ? Math.min(...values) : 0;
          const maxVal = values.length > 0 ? Math.max(...values) : 100;
          const range = maxVal - minVal || 1;

          const sparklineSvgPoints = values
            .map((v, i) => {
              const x = Math.round((i / (values.length - 1 || 1)) * 140);
              const y = Math.round(40 - ((v - minVal) / range) * 32);
              return `${x},${y}`;
            })
            .join(" ");

          const isPositiveTrend = values.length >= 2 ? values[values.length - 1] >= values[0] : true;

          return (
            <div
              key={lot.id}
              onClick={() => onSelectLot(lot)}
              style={{ scrollSnapAlign: "start" }}
              className={`shrink-0 w-72 sm:w-80 rounded-xl p-3.5 border transition-all cursor-pointer relative group flex flex-col justify-between ${
                isActive
                  ? "bg-gradient-to-b from-[#0F1E36] via-[#091222] to-[#040810] border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.3)] ring-1 ring-cyan-400"
                  : "bg-[#070C18] border-slate-800/90 hover:border-slate-700 hover:bg-[#0A1224]"
              }`}
            >
              {/* Active Marker */}
              {isActive && (
                <div className="absolute -top-2.5 right-3 bg-cyan-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>ACTIVE TARGET</span>
                </div>
              )}

              {/* Top Row: Grader & Spread */}
              <div className="flex items-center justify-between text-[10px] pb-2 border-b border-slate-800/80">
                <span
                  className={`font-bold px-2 py-0.5 rounded border ${
                    lot.isYellowLabel
                      ? "bg-amber-950/80 border-amber-500/50 text-amber-300"
                      : "bg-slate-900 border-slate-800 text-cyan-300"
                  }`}
                >
                  {lot.grader} {lot.grade} {lot.isYellowLabel ? "★" : ""}
                </span>

                <span className="text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/40 px-1.5 py-0.5 rounded">
                  {spreadPct > 0 ? `-${spreadPct}% to FMV` : "At FMV"}
                </span>
              </div>

              {/* Middle Section: Authentic Cover Thumbnail + Title & Bids */}
              <div className="grid grid-cols-12 gap-3 my-2.5 items-center">
                {/* Authentic Slab Cover */}
                <div className="col-span-4 relative rounded-lg overflow-hidden border border-slate-800 bg-black aspect-[2/3] shrink-0">
                  <img
                    src={lot.coverUrl}
                    alt={lot.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/surface-art/character.png";
                    }}
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] text-center text-slate-400 font-mono py-0.5 border-t border-slate-800">
                    Cert #{lot.certNumber ? lot.certNumber.slice(-4) : "VERIFIED"}
                  </div>
                </div>

                {/* Comic Intel & Prices */}
                <div className="col-span-8 space-y-1 text-xs">
                  <h4 className="text-white font-bold line-clamp-2 leading-tight group-hover:text-cyan-300 transition-colors">
                    {lot.title}
                  </h4>
                  <div className="flex items-baseline justify-between text-[11px] pt-1">
                    <span className="text-slate-400">Current Bid:</span>
                    <strong className="text-emerald-400 font-bold text-sm">
                      ${lot.currentBid.toLocaleString()}
                    </strong>
                  </div>
                  <div className="flex items-baseline justify-between text-[10px]">
                    <span className="text-slate-500">Market FMV:</span>
                    <span className="text-slate-300 font-semibold">
                      ${lot.fmv.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[9px] text-purple-300 bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-500/30 truncate mt-1">
                    ⚡ {lot.volumeFrequency || (lot.salesVolume ? `${lot.salesVolume} sales/yr` : "1 sale/week")}
                  </div>
                </div>
              </div>

              {/* Bottom: Mini TradingView Sparkline */}
              <div className="bg-black/70 rounded-lg p-2 border border-slate-800/80 mt-1 space-y-1">
                <div className="flex items-center justify-between text-[9px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-cyan-400" />
                    <span>TradingView Comps</span>
                  </span>
                  <span className={isPositiveTrend ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                    {isPositiveTrend ? "↗ Upward Float" : "↘ Compressed"}
                  </span>
                </div>

                <div className="w-full h-10 flex items-center justify-center">
                  {values.length >= 2 ? (
                    <svg viewBox="0 0 140 45" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id={`grad-${lot.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={isPositiveTrend ? "#10b981" : "#f43f5e"} stopOpacity="0.4" />
                          <stop offset="100%" stopColor={isPositiveTrend ? "#10b981" : "#f43f5e"} stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <polygon
                        points={`0,45 ${sparklineSvgPoints} 140,45`}
                        fill={`url(#grad-${lot.id})`}
                      />
                      <polyline
                        points={sparklineSvgPoints}
                        fill="none"
                        stroke={isPositiveTrend ? "#34d399" : "#fb7185"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <div className="text-[9px] text-slate-600">TradingView Initializing...</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
