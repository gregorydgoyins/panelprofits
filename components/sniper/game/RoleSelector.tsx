"use client";

import React, { useState } from "react";
import {
  Briefcase,
  Crown,
  ShieldAlert,
  TrendingUp,
  Layers,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  Clock,
  Lock,
  Gavel,
  Info,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import type { GameRole } from "@/lib/sniper/sim/types";

interface RoleSelectorProps {
  onSelectRole: (role: GameRole) => void;
}

interface RulePillProps {
  phase: string;
  badgeColor: string;
  icon: React.ReactNode;
  title: string;
  summary: string;
  tooltipTitle: string;
  tooltipBody: string;
}

function InteractiveRulePill({
  phase,
  badgeColor,
  icon,
  title,
  summary,
  tooltipTitle,
  tooltipBody,
}: RulePillProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative group rounded-xl border border-slate-800 bg-[#060A14] hover:border-slate-600 p-4 transition-all duration-200 flex flex-col justify-between cursor-pointer"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip(!showTooltip)}
    >
      <div>
        {/* Phase Header */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${badgeColor}`}
          >
            {icon}
            <span>{phase}</span>
          </span>
          <button
            type="button"
            className="text-slate-500 hover:text-cyan-300 transition-colors p-0.5"
            aria-label={`Rule details for ${title}`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        </div>

        <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wide group-hover:text-cyan-300 transition-colors">
          {title}
        </h4>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-400 font-sans">
          {summary}
        </p>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span>TAP / HOVER FOR RULE INTEL</span>
        <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform">→</span>
      </div>

      {/* Floating Tooltip Bubble */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 w-72 sm:w-80 rounded-xl border border-cyan-500/50 bg-[#030712] p-3.5 shadow-[0_0_30px_rgba(0,0,0,0.9)] backdrop-blur-xl pointer-events-none">
          <div className="flex items-center gap-1.5 text-cyan-300 font-mono font-bold text-xs mb-1.5">
            <Info className="h-3.5 w-3.5 shrink-0" />
            <span>{tooltipTitle}</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-300 font-sans">
            {tooltipBody}
          </p>
          {/* Tooltip caret */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-6 border-transparent border-t-[#030712]" />
        </div>
      )}
    </div>
  );
}

export function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  const [activeBrokerIntel, setActiveBrokerIntel] = useState(false);
  const [activeWhaleIntel, setActiveWhaleIntel] = useState(false);

  return (
    <div className="mx-auto max-w-5xl py-8 px-4">
      {/* Header Banner */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-950/50 px-3.5 py-1 text-xs font-mono uppercase tracking-widest text-cyan-300 mb-3 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Comic Book Stock Exchange</span>
          <span className="text-slate-500">·</span>
          <span>Sovereign Underwriting Simulator</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-mono font-black tracking-tight text-white drop-shadow-md">
          SELECT YOUR TRADING ARCHETYPE
        </h1>
        <p className="mt-3 text-sm md:text-base text-slate-300 max-w-2xl mx-auto font-sans leading-relaxed">
          Master real secondary market mechanics through live ticking countdowns. Place bids, detect stale comp traps, and enforce Graham &amp; Dodd margin of safety before risking real capital.
        </p>
        <p className="mt-1 text-xs font-mono text-cyan-400">
          *Sovereign is Panel Profits&apos; proprietary underwriting tier classification, representing verified institutional assets.
        </p>
      </div>

      {/* Two Role Cards with Brighter Rimlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* THE BROKER */}
        <div className="relative group rounded-2xl border-2 border-cyan-400 bg-gradient-to-b from-[#0C1A38] via-[#081124] to-[#05070D] p-6 md:p-8 flex flex-col justify-between shadow-[0_0_40px_rgba(34,211,238,0.35),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:border-cyan-300 hover:shadow-[0_0_65px_rgba(34,211,238,0.55),inset_0_0_25px_rgba(34,211,238,0.2)] ring-1 ring-cyan-400/60 transition-all duration-300">
          {/* Top Radiant Neon Rimlight Flare */}
          <div className="absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_20px_rgba(34,211,238,1)]" />

          <div>
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">Fiduciary Partner</span>
                  <h2 className="text-2xl font-mono font-black text-white">THE BROKER</h2>
                </div>
              </div>
              <span className="rounded bg-cyan-950/90 border border-cyan-400 px-3 py-1 text-xs font-mono font-bold text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                $5,000 AUM
              </span>
            </div>

            {/* Core Stats */}
            <div className="grid grid-cols-2 gap-3 mt-6 text-xs font-mono">
              <div className="rounded-lg bg-black/60 border border-cyan-500/20 p-3">
                <span className="text-slate-400 uppercase text-[10px]">Lot Price Range</span>
                <p className="text-white font-bold text-sm mt-0.5">$20.00 – $500.00</p>
              </div>
              <div className="rounded-lg bg-black/60 border border-cyan-500/20 p-3">
                <span className="text-slate-400 uppercase text-[10px]">Grade Exposure</span>
                <p className="text-cyan-300 font-bold text-sm mt-0.5">RAW to 9.8 (Mixed)</p>
              </div>
            </div>

            {/* Mechanics Bullet Points */}
            <div className="mt-6 space-y-3 text-xs text-slate-200">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Institutional Dossier:</strong> Full access to multi-grade price ladders, raw-to-9.8 spreads, 3-Act narrative summaries, and Investopedia checklists.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Layers className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Real Mixed Pipeline:</strong> Early rounds are 50% Raw and 30% Mid-Grades (4.0–8.0). Prove positive ROI to unlock high-tier 9.8 Sovereign keys.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <TrendingUp className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Client AUM Dynamics:</strong> Profitable trades draw +15% client capital additions; consecutive losses trigger client capital redemptions.
                </span>
              </div>
            </div>

            {/* Broker Rule Intel Toggle */}
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setActiveBrokerIntel(!activeBrokerIntel)}
                className="text-[11px] font-mono text-cyan-300 hover:text-cyan-200 flex items-center gap-1.5 transition-colors"
              >
                <Info className="h-3.5 w-3.5" />
                <span>{activeBrokerIntel ? "Hide Broker Rules Mandate" : "View Broker Participant Mandate"}</span>
              </button>
              {activeBrokerIntel && (
                <div className="mt-2.5 p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-200 font-sans space-y-1 leading-relaxed">
                  <p>• <strong>Mandate:</strong> Fiduciary capital growth. Protect client principal with strict spread discipline.</p>
                  <p>• <strong>Win Condition:</strong> Close rounds at or below seller sunk cost floor to bank client appreciation.</p>
                  <p>• <strong>Risk:</strong> 2 consecutive losing rounds trigger a client margin redemption (-$1,000 AUM).</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800">
            <button
              onClick={() => onSelectRole("broker")}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono font-bold py-3.5 px-4 transition-all duration-200 text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)]"
            >
              <span>Play as The Broker</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* THE WHALE */}
        <div className="relative group rounded-2xl border-2 border-amber-400 bg-gradient-to-b from-[#241A0B] via-[#140E05] to-[#05070D] p-6 md:p-8 flex flex-col justify-between shadow-[0_0_40px_rgba(251,191,36,0.35),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:border-amber-300 hover:shadow-[0_0_65px_rgba(251,191,36,0.55),inset_0_0_25px_rgba(251,191,36,0.2)] ring-1 ring-amber-400/60 transition-all duration-300">
          {/* Top Radiant Neon Rimlight Flare */}
          <div className="absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_20px_rgba(251,191,36,1)]" />

          <div>
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.4)]">
                  <Crown className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">High Roller</span>
                  <h2 className="text-2xl font-mono font-black text-white">THE WHALE</h2>
                </div>
              </div>
              <span className="rounded bg-amber-950/90 border border-amber-400 px-3 py-1 text-xs font-mono font-bold text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                $20,000 Bankroll
              </span>
            </div>

            {/* Core Stats */}
            <div className="grid grid-cols-2 gap-3 mt-6 text-xs font-mono">
              <div className="rounded-lg bg-black/60 border border-amber-500/20 p-3">
                <span className="text-slate-400 uppercase text-[10px]">Lot Price Range</span>
                <p className="text-white font-bold text-sm mt-0.5">$750 – $10,000+</p>
              </div>
              <div className="rounded-lg bg-black/60 border border-amber-500/20 p-3">
                <span className="text-slate-400 uppercase text-[10px]">Grade Exposure</span>
                <p className="text-amber-300 font-bold text-sm mt-0.5">3.5 to 10.0 (Wide Open)</p>
              </div>
            </div>

            {/* Mechanics Bullet Points */}
            <div className="mt-6 space-y-3 text-xs text-slate-200">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Information Asymmetry:</strong> Redacted dossier. No pre-digested checklists. Rely on your own memory of historical comp dates and price discipline.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Stale Comp Traps:</strong> Vintage grails carry stale comps from 2021 market peaks. Check Page 2 comp dates to avoid overpaying.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Crown className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">High Stakes Execution:</strong> Compete on Heritage and ComicConnect caliber books. Two catastrophic mistakes can burn 50% of your personal wealth.
                </span>
              </div>
            </div>

            {/* Whale Rule Intel Toggle */}
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setActiveWhaleIntel(!activeWhaleIntel)}
                className="text-[11px] font-mono text-amber-300 hover:text-amber-200 flex items-center gap-1.5 transition-colors"
              >
                <Info className="h-3.5 w-3.5" />
                <span>{activeWhaleIntel ? "Hide Whale Rules Mandate" : "View Whale Participant Mandate"}</span>
              </button>
              {activeWhaleIntel && (
                <div className="mt-2.5 p-3 rounded-lg bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-200 font-sans space-y-1 leading-relaxed">
                  <p>• <strong>Mandate:</strong> Private high-net-worth syndicate. Target blue-chip keys with deep liquidity spreads.</p>
                  <p>• <strong>Win Condition:</strong> Exploit seller-subsidized sunk encasement fees on vintage slabs.</p>
                  <p>• <strong>Risk:</strong> Overbidding on a stale 2021 peak comp inflicts rapid, unrecoverable capital drawdowns.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800">
            <button
              onClick={() => onSelectRole("whale")}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono font-bold py-3.5 px-4 transition-all duration-200 text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:shadow-[0_0_30px_rgba(251,191,36,0.6)]"
            >
              <span>Play as The Whale</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* The 4 Core Timing & Execution Rules Pills */}
      <div className="mt-12 rounded-2xl border border-slate-800/90 bg-[#070A11]/95 p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                Sniper Exchange Underwriting Rules (4 Timing Phases)
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Strict chronological auction floor pacing · Hover or tap any pill for full institutional mechanics
              </p>
            </div>
          </div>
          <div className="text-[10px] font-mono text-cyan-300 bg-cyan-950/70 border border-cyan-500/40 px-2.5 py-1 rounded-full self-start sm:self-auto shadow-sm">
            *Sovereign = Panel Profits Proprietary Asset Tier
          </div>
        </div>

        {/* 4 Timing Pills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pill 1: 240s Due Diligence Clock */}
          <InteractiveRulePill
            phase="T-240s Phase"
            badgeColor="bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
            icon={<Clock className="h-3 w-3" />}
            title="1. 240s Due Diligence Clock"
            summary="You have exactly 4 minutes to analyze the book across all 3 pages (Floor, Financing & TradingView, Lore) before placing a bid."
            tooltipTitle="Phase 1: The 240s Analysis Window"
            tooltipBody="Simulates live auction room pacing at Heritage or ComicConnect. Gives underwriters 240 seconds to cross-examine recorded sales comps, multi-grade spreads, and historical price drift before placing capital at risk."
          />

          {/* Pill 2: 30s Hard Lockout */}
          <InteractiveRulePill
            phase="T-30s Lockout"
            badgeColor="bg-rose-950/80 text-rose-300 border border-rose-500/40"
            icon={<Lock className="h-3 w-3" />}
            title="2. 30s Hard Lockout"
            summary="At T-30s, the floor locks ('In It to Win It'). You cannot chicken out or cancel your bid once the final 30 seconds begin."
            tooltipTitle="Phase 2: The 30s Hard Lockout"
            tooltipBody="Authentic auction gavel protocol. When the auctioneer begins final calls in the last 30 seconds, bids cannot be retracted. The pass/chicken-out button is permanently disabled until hammer strike."
          />

          {/* Pill 3: 10% Chicken-Out Circuit Breaker */}
          <InteractiveRulePill
            phase="Pre-Lockout Exit"
            badgeColor="bg-amber-950/80 text-amber-300 border border-amber-500/40"
            icon={<ShieldAlert className="h-3 w-3" />}
            title="3. 10% Chicken-Out Valve"
            summary="Spot a stale comp or realize you overbid? Bail out before T-30s for a flat 10% penalty to protect the other 90% of your bankroll."
            tooltipTitle="Phase 3: Graham & Dodd Capital Defense"
            tooltipBody="Teaches strict loss minimization. Taking a 10% penalty on your last bid saves you from suffering a 50%+ catastrophic holding loss on an illiquid book with bad spread."
          />

          {/* Pill 4: Hammer Strike & Sovereign Vault */}
          <InteractiveRulePill
            phase="T-0s Settlement"
            badgeColor="bg-cyan-950/80 text-cyan-300 border border-cyan-500/40"
            icon={<Gavel className="h-3 w-3" />}
            title="4. Hammer Strike & Vault"
            summary="At T-0s, the gavel falls. Winning bids below true seller breakeven bank positive equity into your Sovereign Vault."
            tooltipTitle="Phase 4: Sovereign Clearing & Settlement"
            tooltipBody="*Proprietary Classification: 'Sovereign' is Panel Profits' proprietary institutional asset tier, representing audited catalog equities with verified float, liquidity spreads, and margin-of-safety thresholds."
          />
        </div>
      </div>
    </div>
  );
}
