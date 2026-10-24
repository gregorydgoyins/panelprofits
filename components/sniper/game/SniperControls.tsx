"use client";

import React, { useState } from "react";
import { DollarSign, ShieldAlert, AlertOctagon, ArrowUpRight, SkipForward, Lock } from "lucide-react";
import type { LotItem } from "@/lib/sniper/sim/types";

interface SniperControlsProps {
  lot: LotItem;
  userBid: number | null;
  bankroll: number;
  timeRemaining: number;
  onPlaceBid: (amount: number) => void;
  onChickenOut: () => void;
  onPassLot: () => void;
}

export function SniperControls({
  lot,
  userBid,
  bankroll,
  timeRemaining,
  onPlaceBid,
  onChickenOut,
  onPassLot,
}: SniperControlsProps) {
  const isLockout = timeRemaining <= 30;
  const currentLeader = Math.max(lot.openingBid, userBid ?? 0);
  const minNextBid = userBid ? userBid + Math.max(5, Math.round(userBid * 0.05)) : lot.openingBid;

  const [customBid, setCustomBid] = useState<string>(String(minNextBid));

  React.useEffect(() => {
    setCustomBid(String(minNextBid));
  }, [lot.id, userBid, lot.openingBid, minNextBid]);

  const chickenOutPenalty = userBid ? Math.round(userBid * 0.10) : 0;

  const handleQuickAdd = (increment: number) => {
    const next = currentLeader + increment;
    setCustomBid(String(next));
  };

  const handleSubmitBid = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(customBid);
    if (!Number.isFinite(val) || val <= (userBid ?? 0) || val > bankroll) return;
    onPlaceBid(val);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-[#070A11] p-5 shadow-2xl space-y-5">
      {/* Bid Status Row */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
            {userBid ? "Your Active Accepted Bid" : "Opening Floor Bid"}
          </span>
          <div className="text-2xl font-mono font-bold text-white tracking-tight flex items-center gap-1.5 mt-0.5">
            <span>${(userBid ?? lot.openingBid).toLocaleString()}</span>
            {userBid && (
              <span className="rounded bg-emerald-950/80 border border-emerald-500/40 px-1.5 py-0.2 text-[10px] font-mono text-emerald-300 font-bold uppercase">
                Active
              </span>
            )}
          </div>
          {/* Floating +/- directly beneath the bid vs multisource value */}
          <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px]">
            <span className="text-slate-500">vs Multisource:</span>
            <span
              className={`font-bold px-1.5 py-0.2 rounded border ${
                (userBid ?? lot.openingBid) < lot.fmv
                  ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
                  : (userBid ?? lot.openingBid) === lot.fmv
                  ? "bg-cyan-950/80 border-cyan-500/40 text-cyan-300"
                  : "bg-rose-950/80 border-rose-500/40 text-rose-300"
              }`}
            >
              {(userBid ?? lot.openingBid) < lot.fmv
                ? `-$${lot.fmv - (userBid ?? lot.openingBid)} (-${Math.round(((lot.fmv - (userBid ?? lot.openingBid)) / lot.fmv) * 100)}%) BELOW`
                : (userBid ?? lot.openingBid) === lot.fmv
                ? "AT MULTISOURCE PARITY"
                : `+$${(userBid ?? lot.openingBid) - lot.fmv} (+${Math.round((((userBid ?? lot.openingBid) - lot.fmv) / lot.fmv) * 100)}%) ABOVE`}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
            Estimated FMV Benchmark
          </span>
          <div className="text-lg font-mono font-bold text-slate-300 mt-0.5">
            ${lot.fmv.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Bidding Form & Quick Increment Chips */}
      <form onSubmit={handleSubmitBid} className="space-y-3">
        <div className="flex items-center gap-2">
          {/* Quick Increment Buttons */}
          {[10, 25, 50, 100, 250].map((inc) => (
            <button
              key={inc}
              type="button"
              onClick={() => handleQuickAdd(inc)}
              className="flex-1 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 py-1.5 text-xs font-mono font-bold text-slate-300 hover:text-white transition-colors"
            >
              +${inc}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="number"
              step="5"
              min={minNextBid}
              max={bankroll}
              value={customBid}
              onChange={(e) => setCustomBid(e.target.value)}
              placeholder={`Min $${minNextBid}`}
              className="w-full rounded-xl border border-slate-700 bg-black/60 pl-9 pr-4 py-3 font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 text-base"
            />
          </div>

          <button
            type="submit"
            disabled={Number(customBid) > bankroll || Number(customBid) <= (userBid ?? 0)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-mono font-bold px-5 py-3 text-sm uppercase tracking-wider transition-colors shrink-0"
          >
            <span>{userBid ? "Raise Bid" : "Place Bid"}</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        {/* Live Proposed Delta on the Fly */}
        {Number(customBid) > currentLeader && (
          <div className="flex items-center justify-between text-[11px] font-mono px-3 py-1.5 rounded-lg bg-black/60 border border-slate-800 text-slate-300">
            <span className="flex items-center gap-1">
              <span className="text-slate-500">Proposed Delta:</span>
              <strong className="text-emerald-400 font-bold">+${Number(customBid) - currentLeader} vs Floor</strong>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-slate-500">FMV Cushion:</span>
              <strong className={Number(customBid) <= lot.fmv ? "text-cyan-300" : "text-amber-400"}>
                ${lot.fmv - Number(customBid)}
              </strong>
            </span>
          </div>
        )}
      </form>

      {/* Floor Decision Buttons: Chicken Out vs Pass */}
      <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
        {/* Chicken Out Button */}
        {userBid ? (
          <button
            type="button"
            onClick={onChickenOut}
            className="w-full flex-1 flex items-center justify-center gap-2 rounded-xl border p-3 font-mono text-xs font-bold transition-all border-rose-500/50 bg-rose-950/30 text-rose-300 hover:bg-rose-950/60 hover:border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.2)]"
            title="Forfeit 10% penalty on your bid to immediately abort and release this sticky slot"
          >
            <AlertOctagon className="h-4 w-4 text-rose-400" />
            <span>CHICKEN OUT (-10% Hit: -${chickenOutPenalty})</span>
          </button>
        ) : (
          <button
            onClick={onPassLot}
            className="w-full flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 p-3 font-mono text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <SkipForward className="h-4 w-4" />
            <span>Pass On This Lot (Next Book)</span>
          </button>
        )}
      </div>

      {/* Rules Notice */}
      <p className="text-[10px] font-mono text-slate-500 leading-relaxed text-center">
        {isLockout
          ? "🔒 Final 30 seconds: The exchange floor is locked. Active bids cannot be rescinded. Await the hammer."
          : "💡 Tactical decision: Chickening out absorbs a 10% penalty to prevent holding an overpaid loss if you detect a stale comp or bad spread."}
      </p>
    </div>
  );
}
