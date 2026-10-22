"use client";

import React from "react";
import Image from "next/image";
import {
  Gavel,
  Clock,
  AlertOctagon,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Flame,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { StickyLotBid, LotItem } from "@/lib/sniper/sim/types";

interface StickyBiddedRailProps {
  stickyBids: StickyLotBid[];
  activeLotId: string;
  onSelectLot: (lot: LotItem) => void;
  onChickenOutLot: (lotId: string) => void;
  onRaiseBid: (lotId: string, newAmount: number) => void;
  maxStickyCount?: number;
}

export function StickyBiddedRail({
  stickyBids,
  activeLotId,
  onSelectLot,
  onChickenOutLot,
  onRaiseBid,
  maxStickyCount = 5,
}: StickyBiddedRailProps) {
  if (!stickyBids || stickyBids.length === 0) return null;

  const isFull = stickyBids.length >= maxStickyCount;

  return (
    <div className="w-full space-y-3 font-mono">
      {/* Collation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-purple-500/40">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="p-1 rounded bg-purple-500/25 border border-purple-400 text-purple-200 shadow-[0_0_8px_rgba(168,85,247,0.5)]">
            <Gavel className="h-4 w-4" />
          </div>
          <span className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
            <span>📌</span> ACTIVE BIDDED AUCTIONS COLLATION ({stickyBids.length} / {maxStickyCount} SLOTS)
          </span>
          <span className="text-[10px] text-purple-200/70 hidden md:inline">
            · Sticky to page · Defend against clock fighters or Chicken Out (-10% penalty) to release slot
          </span>
        </div>

        {/* Sticky Slot Utilization */}
        <div className="flex items-center gap-2 text-[10px]">
          {isFull ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-rose-500/70 bg-rose-950/80 text-rose-300 font-bold uppercase animate-pulse">
              <AlertTriangle className="h-3 w-3" />
              <span>MAX SLOTS REACHED ({maxStickyCount}/{maxStickyCount})</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded border border-emerald-500/50 bg-emerald-950/60 text-emerald-300 font-bold">
              {maxStickyCount - stickyBids.length} SLOTS REMAINING
            </span>
          )}
        </div>
      </div>

      {/* Warning banner when sticky slots are saturated */}
      {isFull && (
        <div className="rounded-lg border border-amber-500/50 bg-amber-950/30 p-2.5 text-[11px] text-amber-200 flex items-center justify-between gap-3 font-sans">
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 text-amber-400 shrink-0" />
            <span>
              <strong>Sticky auction limit reached ({maxStickyCount}/{maxStickyCount}):</strong> You must wait out the final hammer outcomes or trigger <strong>Chicken Out (-10%)</strong> on an active lot to release a slot for new bids.
            </span>
          </div>
        </div>
      )}

      {/* Grid of Collated Sticky Lots (Up to 5) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {stickyBids.map((bidItem) => {
          const { lot, userBid, currentBid, timeRemaining, status } = bidItem;
          const isSelected = lot.id === activeLotId;
          const leadDelta = userBid - currentBid;
          const isLeading = userBid >= currentBid && status !== "lost" && status !== "chickened_out";
          const isOutbid = userBid < currentBid && status !== "won";
          const chickenPenalty = Math.round(userBid * 0.10);

          const mins = Math.floor(timeRemaining / 60);
          const secs = timeRemaining % 60;
          const timeFormatted = `${mins}:${secs < 10 ? "0" : ""}${secs}`;
          const isHot = timeRemaining <= 30 && timeRemaining > 0;
          const isCritical = timeRemaining <= 5 && timeRemaining > 0;

          return (
            <div
              key={lot.id}
              className={`rounded-xl p-3 border-2 transition-all relative flex flex-col justify-between ${
                isSelected
                  ? "bg-gradient-to-b from-[#180A30] via-[#0D041C] to-[#06020E] border-cyan-400 shadow-[0_0_0_1px_rgba(6,182,212,0.8),0_0_16px_rgba(168,85,247,0.7)]"
                  : "bg-gradient-to-b from-[#120724] via-[#0A0316] to-[#04010A] border-purple-500/50 hover:border-purple-300"
              }`}
            >
              {/* Header: Grade & Live Status */}
              <div>
                <div className="flex items-center justify-between text-[10px] pb-1.5 border-b border-slate-800 gap-1">
                  <span className="font-bold text-white uppercase flex items-center gap-1">
                    <span className="px-1 py-0.2 rounded bg-purple-950 border border-purple-500/60 text-purple-300 text-[9px]">
                      {lot.grader} {lot.grade}
                    </span>
                    {lot.isYellowLabel && (
                      <span className="text-amber-400 text-[9px]">★ SIGNED</span>
                    )}
                  </span>

                  {/* Status Badge */}
                  {status === "won" ? (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 text-[9px] font-bold">
                      HAMMER WON
                    </span>
                  ) : status === "lost" ? (
                    <span className="px-1.5 py-0.2 rounded bg-rose-950 border border-rose-500 text-rose-300 text-[9px] font-bold">
                      OUTBID (LOST)
                    </span>
                  ) : status === "chickened_out" ? (
                    <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-slate-400 text-[9px] font-bold">
                      CHICKENED OUT
                    </span>
                  ) : isLeading ? (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-400 text-emerald-300 text-[9px] font-bold animate-pulse">
                      LEADING (+${leadDelta})
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded bg-rose-950/80 border border-rose-400 text-rose-300 text-[9px] font-bold animate-bounce">
                      OUTBID (-${Math.abs(leadDelta)})
                    </span>
                  )}
                </div>

                {/* Title & Thumbnail */}
                <div
                  className="grid grid-cols-12 gap-2 my-2 cursor-pointer group"
                  onClick={() => onSelectLot(lot)}
                  title="Click to underwrite and focus this auction"
                >
                  <div className="col-span-4 relative aspect-[2/3] w-full rounded overflow-hidden border border-slate-700 bg-slate-900 shadow">
                    <Image
                      src={lot.coverUrl}
                      alt={lot.title}
                      fill
                      sizes="80px"
                      className="object-cover object-top group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="col-span-8 flex flex-col justify-center">
                    <h4 className="text-[11px] font-bold text-white line-clamp-2 leading-tight group-hover:text-cyan-300 transition-colors">
                      {lot.title}
                    </h4>
                    <span className="text-[9px] text-slate-400 mt-1">
                      FMV: ${lot.fmv.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-purple-300">
                      Cert #{lot.certNumber.slice(-4)}
                    </span>
                  </div>
                </div>

                {/* Bidding Levels */}
                <div className="rounded bg-black/60 border border-slate-800 p-1.5 space-y-1 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Your Bid:</span>
                    <span className="font-bold text-emerald-400">${userBid.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Current Floor:</span>
                    <span className="font-bold text-white">${currentBid.toLocaleString()}</span>
                  </div>
                </div>

                {/* Countdown Clock */}
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Clock:</span>
                  </span>
                  <span
                    className={`font-bold font-mono px-1.5 py-0.5 rounded ${
                      isCritical
                        ? "bg-rose-950 border border-rose-500 text-rose-300 animate-ping"
                        : isHot
                        ? "bg-amber-950 border border-amber-500 text-amber-300 animate-pulse"
                        : "bg-slate-900 text-slate-300"
                    }`}
                  >
                    {timeRemaining > 0 ? timeFormatted : "00:00 (ENDED)"}
                  </span>
                </div>
              </div>

              {/* Actions: Quick Defend vs Chicken Out */}
              <div className="pt-2 mt-2 border-t border-slate-800 space-y-1.5">
                {timeRemaining > 0 && status !== "won" && status !== "lost" && status !== "chickened_out" && (
                  <>
                    {/* Quick Raise to Retake Lead */}
                    {isOutbid && (
                      <button
                        type="button"
                        onClick={() => onRaiseBid(lot.id, currentBid + 25)}
                        className="w-full flex items-center justify-center gap-1 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[10px] uppercase transition-colors"
                      >
                        <ArrowUpRight className="h-3 w-3" />
                        <span>Retake Lead (${(currentBid + 25).toLocaleString()})</span>
                      </button>
                    )}

                    {/* Chicken Out Button (-10% Penalty) */}
                    <button
                      type="button"
                      onClick={() => onChickenOutLot(lot.id)}
                      className="w-full flex items-center justify-center gap-1 py-1 rounded border border-rose-500/40 bg-rose-950/25 hover:bg-rose-950/60 hover:border-rose-400 text-rose-300 text-[9px] font-bold transition-all"
                      title="Forfeit 10% penalty to release your bid and free this sticky slot"
                    >
                      <AlertOctagon className="h-3 w-3 text-rose-400" />
                      <span>Chicken Out (-${chickenPenalty})</span>
                    </button>
                  </>
                )}

                {/* Inspect Link */}
                <button
                  type="button"
                  onClick={() => onSelectLot(lot)}
                  className={`w-full py-0.5 text-center text-[9px] font-bold uppercase transition-colors ${
                    isSelected ? "text-cyan-300" : "text-purple-300 hover:text-white"
                  }`}
                >
                  {isSelected ? "Currently Inspecting" : "Underwrite Lot →"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
