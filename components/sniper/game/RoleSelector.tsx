"use client";

import React from "react";
import { Briefcase, Crown, ShieldAlert, TrendingUp, Layers, CheckCircle2, ChevronRight, AlertTriangle } from "lucide-react";
import type { GameRole } from "@/lib/sniper/sim/types";

interface RoleSelectorProps {
  onSelectRole: (role: GameRole) => void;
}

export function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  return (
    <div className="mx-auto max-w-5xl py-8 px-4">
      {/* Header Banner */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-mono uppercase tracking-widest text-cyan-300 mb-3">
          <span>Comic Book Stock Exchange</span>
          <span className="text-slate-500">·</span>
          <span>Sovereign Underwriting Simulator</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-mono font-bold tracking-tight text-white">
          SELECT YOUR TRADING ARCHETYPE
        </h1>
        <p className="mt-3 text-sm md:text-base text-slate-400 max-w-2xl mx-auto">
          Learn real secondary market mechanics through live ticking countdowns. Place bids, detect stale comp traps, and master Graham &amp; Dodd margin of safety before risking real capital.
        </p>
      </div>

      {/* Two Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* THE BROKER */}
        <div className="relative group rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-[#0B132B] to-[#070A11] p-6 md:p-8 flex flex-col justify-between hover:border-cyan-400 transition-all shadow-xl hover:shadow-cyan-950/50">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">Fiduciary Partner</span>
                  <h2 className="text-2xl font-mono font-bold text-white">THE BROKER</h2>
                </div>
              </div>
              <span className="rounded bg-cyan-950/80 border border-cyan-500/40 px-2.5 py-1 text-xs font-mono font-bold text-cyan-300">
                $5,000 AUM
              </span>
            </div>

            {/* Core Stats */}
            <div className="grid grid-cols-2 gap-3 mt-6 text-xs font-mono">
              <div className="rounded-lg bg-black/40 border border-slate-800 p-3">
                <span className="text-slate-500 uppercase text-[10px]">Lot Price Range</span>
                <p className="text-white font-bold text-sm mt-0.5">$20.00 – $500.00</p>
              </div>
              <div className="rounded-lg bg-black/40 border border-slate-800 p-3">
                <span className="text-slate-500 uppercase text-[10px]">Grade Exposure</span>
                <p className="text-cyan-300 font-bold text-sm mt-0.5">RAW to 9.8 (Mixed)</p>
              </div>
            </div>

            {/* Mechanics Bullet Points */}
            <div className="mt-6 space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Institutional Dossier:</strong> Full access to multi-grade price ladders, raw-to-9.8 spreads, 3-Act narrative summaries, and Investopedia checklists.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Layers className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Real Mixed Pipeline:</strong> Early rounds are 50% Raw and 30% Mid-Grades (4.0–8.0). You must earn the right to bid on 9.8 grails by proving positive ROI.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <TrendingUp className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Client AUM Dynamics:</strong> Deliver profitable closes to attract client capital additions; consecutive losses trigger client capital redemptions.
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800">
            <button
              onClick={() => onSelectRole("broker")}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono font-bold py-3.5 px-4 transition-colors text-sm uppercase tracking-wider"
            >
              <span>Play as The Broker</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* THE WHALE */}
        <div className="relative group rounded-2xl border border-amber-500/30 bg-gradient-to-b from-[#1C1408] to-[#070A11] p-6 md:p-8 flex flex-col justify-between hover:border-amber-400 transition-all shadow-xl hover:shadow-amber-950/50">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Crown className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">High Roller</span>
                  <h2 className="text-2xl font-mono font-bold text-white">THE WHALE</h2>
                </div>
              </div>
              <span className="rounded bg-amber-950/80 border border-amber-500/40 px-2.5 py-1 text-xs font-mono font-bold text-amber-300">
                $20,000 Bankroll
              </span>
            </div>

            {/* Core Stats */}
            <div className="grid grid-cols-2 gap-3 mt-6 text-xs font-mono">
              <div className="rounded-lg bg-black/40 border border-slate-800 p-3">
                <span className="text-slate-500 uppercase text-[10px]">Lot Price Range</span>
                <p className="text-white font-bold text-sm mt-0.5">$750 – $10,000+</p>
              </div>
              <div className="rounded-lg bg-black/40 border border-slate-800 p-3">
                <span className="text-slate-500 uppercase text-[10px]">Grade Exposure</span>
                <p className="text-amber-300 font-bold text-sm mt-0.5">3.5 to 10.0 (Wide Open)</p>
              </div>
            </div>

            {/* Mechanics Bullet Points */}
            <div className="mt-6 space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Information Asymmetry:</strong> Redacted dossier. No pre-digested checklists. Rely on your own memory of historical comp dates and price discipline.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Stale Comp Traps:</strong> Vintage grails and museum slabs frequently carry stale comps from 2021 market peaks. Overbidding will crash you out rapidly.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Crown className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">High Stakes Execution:</strong> Compete on Heritage and ComicConnect caliber books. Two catastrophic mistakes can burn 50% of your personal wealth.
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800">
            <button
              onClick={() => onSelectRole("whale")}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono font-bold py-3.5 px-4 transition-colors text-sm uppercase tracking-wider"
            >
              <span>Play as The Whale</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Rules of the Floor Footer */}
      <div className="mt-12 rounded-xl border border-slate-800 bg-[#070A11] p-5 text-xs font-mono text-slate-400">
        <h3 className="font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
          <span>Exchange Floor Rules</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <strong className="text-slate-200">240s Decision Clock:</strong> You have 4 minutes to analyze the book across all 3 pages, inspect past sale dates, and detect market plateau risks.
          </div>
          <div>
            <strong className="text-amber-300">The 30s Lockout:</strong> In the final 30 seconds, bidding locks (&ldquo;In it to win it&rdquo;). You cannot chicken out after $T-30s$.
          </div>
          <div>
            <strong className="text-rose-400">10% Chicken-Out Penalty:</strong> Bailed out early? A flat 10% penalty of your last bid is charged immediately, saving you from a full wipeout.
          </div>
        </div>
      </div>
    </div>
  );
}
