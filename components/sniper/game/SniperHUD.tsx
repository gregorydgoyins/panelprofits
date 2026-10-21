"use client";

import React from "react";
import { Briefcase, Crown, Shield, Archive, RotateCcw, TrendingUp, TrendingDown } from "lucide-react";
import type { GameRole, BrokerLevel, WonBook } from "@/lib/sniper/sim/types";

interface SniperHUDProps {
  role: GameRole;
  bankroll: number;
  startingBankroll: number;
  brokerLevel: BrokerLevel;
  roundNumber: number;
  netRoi: number;
  vault: WonBook[];
  onOpenVault: () => void;
  onResetRole: () => void;
}

export function SniperHUD({
  role,
  bankroll,
  startingBankroll,
  brokerLevel,
  roundNumber,
  netRoi,
  vault,
  onOpenVault,
  onResetRole,
}: SniperHUDProps) {
  const isBroker = role === "broker";
  const profit = bankroll - startingBankroll;
  const isPositive = profit >= 0;

  const brokerTitle =
    brokerLevel === 1 ? "Floor Scout" : brokerLevel === 2 ? "Senior Associate" : "Managing Partner";

  return (
    <header className="rounded-xl border border-slate-800 bg-[#070A11] p-4 shadow-xl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Role & Rank Badge */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div
            className={`p-2.5 rounded-xl border ${
              isBroker
                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                : "bg-amber-500/10 border-amber-500/30 text-amber-400"
            }`}
          >
            {isBroker ? <Briefcase className="h-5 w-5" /> : <Crown className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                {isBroker ? "Institutional Fiduciary" : "Private Capital"}
              </span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                  isBroker
                    ? "bg-cyan-950 border border-cyan-500/30 text-cyan-300"
                    : "bg-amber-950 border border-amber-500/30 text-amber-300"
                }`}
              >
                {isBroker ? `Lvl ${brokerLevel} · ${brokerTitle}` : "Whale Syndicate"}
              </span>
            </div>
            <h2 className="text-lg font-mono font-bold text-white uppercase tracking-tight">
              {isBroker ? "The Broker" : "The Whale"}
            </h2>
          </div>
        </div>

        {/* Center: Live Bankroll & P&L */}
        <div className="flex items-center gap-6 w-full md:w-auto justify-around md:justify-center border-y md:border-y-0 md:border-x border-slate-800/80 py-2 md:py-0 md:px-8">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
              {isBroker ? "Active Client AUM" : "Personal Bankroll"}
            </span>
            <div className="text-2xl font-mono font-bold text-white tracking-tight">
              ${bankroll.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
              Cumulative ROI
            </span>
            <div
              className={`flex items-center gap-1 text-sm font-mono font-bold ${
                isPositive ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              <span>
                {isPositive ? "+" : ""}
                {netRoi.toFixed(2)}% (${profit >= 0 ? "+" : ""}${profit.toFixed(0)})
              </span>
            </div>
          </div>

          <div className="hidden lg:block text-right">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Round</span>
            <div className="text-base font-mono font-bold text-slate-300">#{roundNumber}</div>
          </div>
        </div>

        {/* Right: Actions (Vault & Archetype Switch) */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={onOpenVault}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/80 hover:bg-slate-800 px-3 py-2 text-xs font-mono text-slate-200 transition-colors"
          >
            <Archive className="h-3.5 w-3.5 text-cyan-400" />
            <span>Vault ({vault.length})</span>
          </button>

          <button
            onClick={onResetRole}
            title="Switch Trading Archetype"
            className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-900 px-2.5 py-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Switch</span>
          </button>
        </div>
      </div>
    </header>
  );
}
