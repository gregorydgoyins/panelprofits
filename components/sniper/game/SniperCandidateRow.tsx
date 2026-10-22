"use client";

import React, { useState, useEffect } from "react";
import type { LotItem } from "@/lib/sniper/sim/types";
import {
  TrendingUp,
  Clock,
  Flame,
  CheckCircle2,
  RefreshCw,
  Layers,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface SniperCandidateRowProps {
  candidates: LotItem[];
  activeLotId: string;
  onSelectLot: (lot: LotItem) => void;
  onRefreshChoices?: () => void;
  onLotExpired?: (lotId: string) => void;
}

function formatTickerTime(seconds: number): { text: string; isHot: boolean } {
  const s = Math.max(0, Math.floor(seconds));
  const isHot = s <= 90 && s > 0;
  if (s <= 0) return { text: "AUCTION ENDED", isHot: true };

  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  if (hours > 0) {
    return {
      text: `${hours}h ${String(minutes).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`,
      isHot: false,
    };
  }
  if (minutes > 0) {
    return {
      text: `${String(minutes).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`,
      isHot,
    };
  }
  return {
    text: `00:${String(secs).padStart(2, "0")}s`,
    isHot: true,
  };
}

export function SniperCandidateRow({
  candidates,
  activeLotId,
  onSelectLot,
  onRefreshChoices,
  onLotExpired,
}: SniperCandidateRowProps) {
  // Exactly 4 auction lots displayed in the primary strip
  const displayLots = candidates.slice(0, 4);

  // Local independent ticker countdowns per lot
  const [localSeconds, setLocalSeconds] = useState<Record<string, number>>({});
  const [refreshing, setRefreshing] = useState(false);

  // Sync initial seconds from props
  useEffect(() => {
    const map: Record<string, number> = {};
    const defaultDurations = [240, 1850, 78, 7420];
    displayLots.forEach((lot, idx) => {
      map[lot.id] = lot.secondsRemaining ?? defaultDurations[idx % defaultDurations.length];
    });
    setLocalSeconds(map);
  }, [candidates]);

  // Independent 1-second ticker decrementing each lot at its own rate
  useEffect(() => {
    const timer = setInterval(() => {
      setLocalSeconds((prev) => {
        let changed = false;
        const next: Record<string, number> = { ...prev };

        for (const [id, secs] of Object.entries(prev)) {
          if (secs > 0) {
            next[id] = secs - 1;
            changed = true;
            if (next[id] === 0 && onLotExpired) {
              onLotExpired(id);
            }
          }
        }
        return changed ? next : prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onLotExpired]);

  const handleRefreshClick = () => {
    if (onRefreshChoices) {
      setRefreshing(true);
      onRefreshChoices();
      setTimeout(() => setRefreshing(false), 600);
    }
  };

  if (!displayLots || displayLots.length === 0) return null;

  return (
    <div className="w-full space-y-3 font-mono">
      {/* 4-Lot Strip Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-purple-500/30">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="p-1 rounded bg-purple-500/20 border border-purple-400 text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.5)]">
            <Layers className="h-3.5 w-3.5" />
          </div>
          <span className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
            <span>🎯</span> 4-LOT AUCTION RAIL (STAGGERED EXECUTION)
          </span>
          <span className="text-[10px] text-purple-200/70 hidden md:inline">
            · Auctions close independently at different rates · Click any lot to underwrite
          </span>
        </div>

        {/* Action: Reroll / Cycle Choices */}
        <div className="flex items-center gap-2">
          {onRefreshChoices && (
            <button
              type="button"
              onClick={handleRefreshClick}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all border border-purple-500/50 bg-purple-950/60 text-purple-200 hover:bg-purple-900/60 hover:border-purple-300 hover:shadow-[0_0_12px_rgba(168,85,247,0.6)] disabled:opacity-50"
              title="Replace all 4 auction choices with new lots from catalog"
            >
              <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin text-cyan-300" : "text-purple-300"}`} />
              <span>{refreshing ? "Refreshing..." : "Cycle 4 Choices"}</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Cards Grid Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {displayLots.map((lot, idx) => {
          const isActive = lot.id === activeLotId;
          const spreadPct = lot.fmv > 0 ? Math.round(((lot.fmv - lot.openingBid) / lot.fmv) * 100) : 0;
          const points = lot.chartPoints || [];

          // Ticker countdown
          const secs = localSeconds[lot.id] ?? 240;
          const { text: tickerText, isHot } = formatTickerTime(secs);
          const isEnded = secs <= 0;

          // Sparkline computation
          const values = points.map((p) => p.value);
          const minVal = values.length > 0 ? Math.min(...values) : 0;
          const maxVal = values.length > 0 ? Math.max(...values) : 100;
          const range = maxVal - minVal || 1;

          const sparklineSvgPoints = values
            .map((v, i) => {
              const x = Math.round((i / (values.length - 1 || 1)) * 140);
              const y = Math.round(36 - ((v - minVal) / range) * 28);
              return `${x},${y}`;
            })
            .join(" ");

          const isPositiveTrend = values.length >= 2 ? values[values.length - 1] >= values[0] : true;

          return (
            <div
              key={lot.id}
              onClick={() => onSelectLot(lot)}
              className={`rounded-xl p-3 border-2 transition-all cursor-pointer relative group flex flex-col justify-between ${
                isActive
                  ? "bg-gradient-to-b from-[#0F1E36] via-[#091222] to-[#040810] border-cyan-400 shadow-[0_0_0_1px_rgba(34,211,238,1),0_0_16px_rgba(34,211,238,0.85),0_0_30px_rgba(6,182,212,0.45),inset_0_1px_2px_rgba(255,255,255,0.4)] ring-1 ring-cyan-300"
                  : isHot
                  ? "bg-gradient-to-b from-[#220712] via-[#14040B] to-[#060205] border-rose-500 shadow-[0_0_0_1px_rgba(244,63,94,1),0_0_12px_rgba(244,63,94,0.7),inset_0_0_8px_rgba(244,63,94,0.2)] hover:border-rose-300"
                  : "bg-gradient-to-b from-[#140827] via-[#0B0418] to-[#05020D] border-purple-500/60 shadow-[0_0_0_1px_rgba(168,85,247,0.5),0_0_10px_rgba(168,85,247,0.4),inset_0_0_6px_rgba(168,85,247,0.15)] hover:border-purple-300 hover:shadow-[0_0_0_1px_rgba(216,180,254,0.8),0_0_16px_rgba(168,85,247,0.8)]"
              }`}
            >
              {/* Active Marker Badge */}
              {isActive && (
                <div className="absolute -top-2.5 right-3 bg-cyan-400 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] flex items-center gap-1 z-10">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>ACTIVE TARGET</span>
                </div>
              )}

              {/* Hot Pulse Indicator */}
              {!isActive && isHot && !isEnded && (
                <div className="absolute -top-2.5 right-3 bg-rose-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.8)] flex items-center gap-1 animate-pulse z-10">
                  <Flame className="h-3 w-3" />
                  <span>FINAL CALLS</span>
                </div>
              )}

              <div>
                {/* Top Row: Grader & Venue & Spread */}
                <div className="flex items-center justify-between text-[10px] pb-1.5 border-b border-slate-800/80 gap-1">
                  <div className="flex items-center gap-1 overflow-hidden">
                    <span
                      className={`font-bold px-1.5 py-0.2 rounded border text-[9px] shrink-0 ${
                        lot.isYellowLabel
                          ? "bg-amber-950/80 border-amber-500/50 text-amber-300"
                          : "bg-slate-900 border-slate-800 text-cyan-300"
                      }`}
                    >
                      {lot.grader} {lot.grade} {lot.isYellowLabel ? "★" : ""}
                    </span>

                    {lot.venueDisplayName && (
                      <span
                        className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold truncate border border-purple-500/40 bg-purple-950/60 text-purple-200"
                        title={lot.venueLotId ? `${lot.venueDisplayName} · Lot #${lot.venueLotId}` : lot.venueDisplayName}
                      >
                        {lot.venue === "heritage"
                          ? "Heritage"
                          : lot.venue === "mycomicshop"
                          ? "MyComicShop"
                          : lot.venue === "comiclink"
                          ? "ComicLink"
                          : lot.venue === "comicconnect"
                          ? "ComicConnect"
                          : "eBay Live"}
                      </span>
                    )}
                  </div>

                  <span className="text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/40 px-1.5 py-0.2 rounded text-[9px] shrink-0">
                    {spreadPct > 0 ? `-${spreadPct}% to FMV` : "At FMV"}
                  </span>
                </div>

                {/* Middle: Cover Thumbnail + Title & Bids */}
                <div className="grid grid-cols-12 gap-2.5 my-2 items-center">
                  {/* Authentic Slab Cover */}
                  <div className="col-span-4 relative rounded-md overflow-hidden border border-slate-800 bg-black aspect-[2/3] shrink-0">
                    <img
                      src={lot.coverUrl}
                      alt={lot.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://vbcmjmakluyjnsmisoth.supabase.co/storage/v1/object/public/comic-covers/pp/5f/5f32066be28bc03b9d356ea5166e42656548dc01ee4dd8e053f43b68b88aa645.webp";
                      }}
                    />
                  </div>

                  {/* Comic Intel & Prices */}
                  <div className="col-span-8 space-y-0.5 text-xs">
                    <h4 className="text-white font-bold text-[11px] line-clamp-1 leading-tight group-hover:text-cyan-300 transition-colors">
                      {lot.title}
                    </h4>
                    <div className="text-[9px] text-slate-400 truncate flex items-center justify-between gap-1">
                      <span className="truncate">{lot.series} #{lot.issueNumber}</span>
                      {lot.venueLotId && (
                        <span className="text-[8px] font-mono text-purple-300/80 truncate shrink-0">
                          #{lot.venueLotId.slice(-6)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline justify-between text-[10px] pt-1">
                      <span className="text-slate-400">Bid:</span>
                      <strong className="text-emerald-400 font-bold text-xs">
                        ${lot.currentBid.toLocaleString()}
                      </strong>
                    </div>
                    <div className="flex items-baseline justify-between text-[9px]">
                      <span className="text-slate-500">FMV:</span>
                      <span className="text-slate-300 font-semibold">
                        ${lot.fmv.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mini TradingView Sparkline */}
                <div className="bg-black/60 rounded p-1.5 border border-slate-800/80 mb-2">
                  <div className="flex items-center justify-between text-[8px] text-slate-400 mb-0.5">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-2.5 w-2.5 text-cyan-400" />
                      <span>Comps Drift</span>
                    </span>
                    <span className={isPositiveTrend ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                      {isPositiveTrend ? "↗ Steady" : "↘ Soft"}
                    </span>
                  </div>

                  <div className="w-full h-7 flex items-center justify-center">
                    {values.length >= 2 ? (
                      <svg viewBox="0 0 140 40" className="w-full h-full overflow-visible">
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
                      <div className="text-[8px] text-slate-600">Comps Loading...</div>
                    )}
                  </div>
                </div>
              </div>

              {/* AT THE BOTTOM OF EACH CARD: Individual Live Ticker */}
              <div
                className={`pt-1.5 pb-1 px-2 rounded-lg border text-center font-mono ${
                  isEnded
                    ? "bg-rose-950/80 border-rose-500/80 text-rose-300 animate-pulse text-[10px] font-black"
                    : isHot
                    ? "bg-rose-950/60 border-rose-500/60 text-rose-300 animate-pulse text-[10px] font-bold"
                    : "bg-slate-950/80 border-purple-500/40 text-purple-200 text-[10px]"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Clock className={`h-3 w-3 ${isHot ? "text-rose-400 animate-bounce" : "text-purple-400"}`} />
                  <span className="tracking-wide">
                    {isEnded ? "AUCTION ENDED · REPLACING" : `Ends in: ${tickerText}`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
