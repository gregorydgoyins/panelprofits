"use client";

import React from "react";
import { TrendingUp, Clock, AlertTriangle, ShieldCheck, Flame, Gavel, DollarSign } from "lucide-react";
import type { LotItem, BidEvent } from "@/lib/sniper/sim/types";

interface SniperBidTrajectoryChartProps {
  lot: LotItem;
  userBid: number | null;
  currentBid: number;
  timeRemaining: number;
  wholeTomatoCost: number;
  lastSoldComp: number;
  bidEvents: BidEvent[];
  isLockout: boolean;
}

export function SniperBidTrajectoryChart({
  lot,
  userBid,
  currentBid,
  timeRemaining,
  wholeTomatoCost,
  lastSoldComp,
  bidEvents,
  isLockout,
}: SniperBidTrajectoryChartProps) {
  const activeBid = userBid ?? 0;
  const leadDelta = activeBid > 0 ? activeBid - currentBid : 0;
  const isLeading = activeBid > 0 && activeBid >= currentBid;
  const isOutbid = activeBid > 0 && activeBid < currentBid;

  const tomatoSpread = Math.round((wholeTomatoCost - currentBid) * 100) / 100;
  const eightBallSpread = Math.round((wholeTomatoCost - (lastSoldComp > 0 ? lastSoldComp : lot.fmv) - currentBid) * 100) / 100;

  // Chart scaling calculations
  const maxVal = Math.max(lot.fmv * 1.1, wholeTomatoCost * 1.15, currentBid * 1.25, (userBid ?? 0) * 1.25, 100);
  const minVal = Math.max(0, lot.openingBid * 0.7);
  const range = maxVal - minVal || 1;

  const getYPercent = (val: number) => {
    const clamped = Math.max(minVal, Math.min(maxVal, val));
    return 100 - ((clamped - minVal) / range) * 80 - 10; // keep padding top & bottom
  };

  const currentBidY = getYPercent(currentBid);
  const userBidY = userBid ? getYPercent(userBid) : null;
  const tomatoY = getYPercent(wholeTomatoCost);
  const fmvY = getYPercent(lot.fmv);

  return (
    <div className="rounded-xl border border-purple-500/30 bg-[#090514] p-4 shadow-xl space-y-4 font-mono">
      {/* Top Header: Real-Time Dynamic Deltas on the Fly */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-500/20">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-purple-300 font-bold uppercase tracking-wider">
            <TrendingUp className="h-4 w-4 text-cyan-400" />
            <span>Real-Time Bid Trajectory & Clock Friction</span>
          </div>
          <p className="text-[10px] text-slate-400 font-sans mt-0.5">
            Deltas created on the fly. Clock fight escalates at 30s, 5s, and 1s before the hammer.
          </p>
        </div>

        {/* Live Delta Status Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {activeBid > 0 ? (
            isLeading ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-emerald-500/60 bg-emerald-950/80 text-emerald-300 text-[11px] font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-pulse">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>LEADING BY +${leadDelta}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-rose-500/60 bg-rose-950/80 text-rose-300 text-[11px] font-bold shadow-[0_0_10px_rgba(244,63,94,0.4)] animate-bounce">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>OUTBID BY -${Math.abs(activeBid - currentBid)}</span>
              </span>
            )
          ) : (
            <span className="px-2 py-1 rounded border border-slate-700 bg-slate-900 text-slate-400 text-[10px]">
              NO ACTIVE BID
            </span>
          )}

          {/* Whole Tomato Cushion Delta */}
          <span
            className={`px-2 py-1 rounded border text-[10px] font-bold ${
              tomatoSpread >= 0
                ? "border-cyan-500/40 bg-cyan-950/40 text-cyan-300"
                : "border-amber-500/40 bg-amber-950/40 text-amber-300"
            }`}
          >
            Tomato Δ: {tomatoSpread >= 0 ? `+$${tomatoSpread}` : `-$${Math.abs(tomatoSpread)}`}
          </span>

          {/* Eight-Ball Spread */}
          <span
            className={`px-2 py-1 rounded border text-[10px] font-bold ${
              eightBallSpread >= 0
                ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-300"
                : "border-purple-500/40 bg-purple-950/40 text-purple-300"
            }`}
          >
            8-Ball: {eightBallSpread >= 0 ? `+$${eightBallSpread}` : `-$${Math.abs(eightBallSpread)}`}
          </span>
        </div>
      </div>

      {/* Dynamic Visual Trajectory Graph (SVG) */}
      <div className="relative h-44 w-full rounded-lg bg-black/60 border border-slate-800 p-2 overflow-hidden select-none">
        {/* Horizontal Level Guides */}
        {/* 1. FMV Benchmark */}
        <div
          className="absolute left-0 right-0 border-t border-dashed border-slate-700 flex items-center justify-between px-2 text-[9px] text-slate-500 pointer-events-none"
          style={{ top: `${fmvY}%` }}
        >
          <span>FMV Benchmark (${lot.fmv.toLocaleString()})</span>
          <span className="text-slate-600">Fair Market Ref</span>
        </div>

        {/* 2. Whole Tomato Replacement Cost */}
        <div
          className="absolute left-0 right-0 border-t-2 border-dashed border-amber-500/60 flex items-center justify-between px-2 text-[9px] text-amber-300 pointer-events-none bg-amber-500/5 py-0.5"
          style={{ top: `${tomatoY}%` }}
        >
          <span className="font-bold">🍅 Whole Tomato Cost Basis (${wholeTomatoCost.toLocaleString()})</span>
          <span className="text-[8px] bg-amber-950/80 px-1 rounded border border-amber-500/40">CEILING PARITY</span>
        </div>

        {/* 3. User's Active Accepted Bid */}
        {userBidY !== null && (
          <div
            className={`absolute left-0 right-0 border-t-2 ${
              isLeading ? "border-emerald-400 bg-emerald-500/10" : "border-rose-400/80 bg-rose-500/10"
            } flex items-center justify-between px-2 text-[10px] font-bold z-10 transition-all duration-300`}
            style={{ top: `${userBidY}%` }}
          >
            <span className={isLeading ? "text-emerald-300" : "text-rose-300"}>
              ★ Your Accepted Bid: ${activeBid.toLocaleString()}
            </span>
            <span className="text-[9px] px-1.5 rounded bg-black/80 text-white font-mono">
              {isLeading ? "CURRENT LEADER" : "BELOW ACTIVE FLOOR"}
            </span>
          </div>
        )}

        {/* 4. Current Floor Bid (Moving dynamically as clock fights) */}
        <div
          className="absolute left-0 right-0 border-t-2 border-cyan-400 bg-cyan-500/15 flex items-center justify-between px-2 text-[10px] font-bold text-cyan-200 z-20 shadow-[0_0_10px_rgba(6,182,212,0.4)] transition-all duration-300"
          style={{ top: `${currentBidY}%` }}
        >
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            Current Floor Bid: ${currentBid.toLocaleString()}
          </span>
          <span className="text-[9px] text-cyan-300 font-mono">
            {timeRemaining}s Left
          </span>
        </div>

        {/* Clock Zone Vertical Milestones */}
        <div className="absolute inset-y-0 right-24 border-l border-amber-500/30 flex flex-col justify-end p-1 pointer-events-none">
          <span className="text-[8px] text-amber-400 font-bold rotate-90 origin-bottom-left uppercase">
            30s Fight
          </span>
        </div>
        <div className="absolute inset-y-0 right-8 border-l border-rose-500/40 flex flex-col justify-end p-1 pointer-events-none">
          <span className="text-[8px] text-rose-400 font-bold rotate-90 origin-bottom-left uppercase">
            5s Blitz
          </span>
        </div>
      </div>

      {/* Clock Friction Live Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
        {/* 30s Phase */}
        <div
          className={`rounded-lg p-2 border transition-all ${
            timeRemaining <= 30 && timeRemaining > 5
              ? "border-amber-500 bg-amber-950/40 text-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.3)] animate-pulse"
              : timeRemaining <= 5
              ? "border-slate-800 bg-slate-900/40 text-slate-500 line-through"
              : "border-slate-800 bg-slate-900/60 text-slate-400"
          }`}
        >
          <div className="flex items-center justify-between font-bold mb-0.5">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>30s Clock Fight</span>
            </span>
            <span>{timeRemaining <= 30 ? "TRIGGERED" : `In ${Math.max(0, timeRemaining - 30)}s`}</span>
          </div>
          <p className="text-[9px] text-slate-400 font-sans">
            Rival floor bots place late proxy increments (+ $10 to $25).
          </p>
        </div>

        {/* 5s Sniping Phase */}
        <div
          className={`rounded-lg p-2 border transition-all ${
            timeRemaining <= 5 && timeRemaining > 1
              ? "border-rose-500 bg-rose-950/60 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.4)] animate-pulse"
              : timeRemaining <= 1
              ? "border-slate-800 bg-slate-900/40 text-slate-500 line-through"
              : "border-slate-800 bg-slate-900/60 text-slate-400"
          }`}
        >
          <div className="flex items-center justify-between font-bold mb-0.5">
            <span className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-rose-400" />
              <span>5s Sniping Blitz</span>
            </span>
            <span>{timeRemaining <= 5 ? "ACTIVE" : `In ${Math.max(0, timeRemaining - 5)}s`}</span>
          </div>
          <p className="text-[9px] text-slate-400 font-sans">
            High-speed sniper bids fire (+ $25 to $50).
          </p>
        </div>

        {/* 1s Final Push & Resolution */}
        <div
          className={`rounded-lg p-2 border transition-all ${
            timeRemaining <= 1
              ? "border-purple-400 bg-purple-950/60 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.5)] animate-pulse"
              : "border-slate-800 bg-slate-900/60 text-slate-400"
          }`}
        >
          <div className="flex items-center justify-between font-bold mb-0.5">
            <span className="flex items-center gap-1">
              <Gavel className="h-3 w-3 text-purple-300" />
              <span>1s Final Hammer</span>
            </span>
            <span>{timeRemaining <= 1 ? "HAMMER DROP" : `In ${timeRemaining}s`}</span>
          </div>
          <p className="text-[9px] text-slate-400 font-sans">
            Underwritten Vickrey clearing price resolved.
          </p>
        </div>
      </div>

      {/* Live Bid Stream Ticker */}
      {bidEvents && bidEvents.length > 0 && (
        <div className="rounded-lg bg-black/40 border border-slate-800/80 p-2 text-[10px] space-y-1">
          <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">
            Live Auction Activity Log
          </div>
          <div className="max-h-20 overflow-y-auto space-y-1 pr-1 font-mono">
            {bidEvents.slice(-4).reverse().map((ev, idx) => (
              <div key={idx} className="flex items-center justify-between text-[10px] border-b border-slate-900 pb-0.5">
                <span className="flex items-center gap-1">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      ev.bidder === "user"
                        ? "bg-emerald-400"
                        : ev.bidder === "rival"
                        ? "bg-rose-400"
                        : "bg-slate-400"
                    }`}
                  />
                  <span className={ev.bidder === "user" ? "text-emerald-300 font-bold" : "text-slate-300"}>
                    {ev.bidder === "user" ? "Your Accepted Bid" : ev.bidder === "rival" ? "Rival Sniper" : "Floor Opening"}
                  </span>
                  {ev.note && <span className="text-[9px] text-slate-500">({ev.note})</span>}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">${ev.amount.toLocaleString()}</span>
                  <span className="text-[9px] text-slate-500">@{ev.clockSecs}s</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
