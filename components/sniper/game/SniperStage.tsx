"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  Shield,
  AlertTriangle,
  Layers,
  Flame,
  Lock,
  LineChart,
  BookOpen,
  Video,
  DollarSign,
  CheckCircle2,
  HelpCircle,
  Info,
  Gavel,
  ShieldAlert,
} from "lucide-react";
import type { GameRole, LotItem } from "@/lib/sniper/sim/types";
import { SlabEncasement } from "@/components/sniper/SlabEncasement";
import { SniperChart } from "./SniperChart";
import { SniperDossier } from "./SniperDossier";
import { SniperControls } from "./SniperControls";
import { SniperBreakevenCard } from "./SniperBreakevenCard";
import { SniperVideos } from "@/components/sniper/SniperVideos";
import { SniperCandidateRow } from "./SniperCandidateRow";
import { PriceChartingGradeTable } from "./PriceChartingGradeTable";

function FloorRulePill({
  phase,
  badge,
  icon,
  title,
  body,
  tip,
}: {
  phase: string;
  badge: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  tip: string;
}) {
  const [showTip, setShowTip] = useState(false);

  return (
    <div
      className="relative rounded-lg border border-slate-700/80 bg-[#050B16] hover:border-cyan-300 p-2.5 transition-colors cursor-pointer group hover:shadow-[0_0_10px_rgba(34,211,238,0.4)] ring-1 ring-transparent hover:ring-cyan-300/40"
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
      onClick={() => setShowTip(!showTip)}
    >
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase border ${badge}`}>
          {icon}
          <span>{phase}</span>
        </span>
        <HelpCircle className="h-3 w-3 text-slate-500 group-hover:text-cyan-300 transition-colors" />
      </div>
      <div className="text-[11px] font-mono font-bold text-slate-200 uppercase truncate">
        {title}
      </div>
      <div className="text-[10px] text-slate-400 font-sans leading-tight mt-0.5 line-clamp-2">
        {body}
      </div>

      {showTip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-72 rounded-xl border border-cyan-500/50 bg-[#030712] p-3 shadow-2xl backdrop-blur-xl pointer-events-none">
          <div className="text-cyan-300 font-mono font-bold text-[11px] mb-1 flex items-center gap-1">
            <Info className="h-3 w-3 shrink-0" />
            <span>{title}</span>
          </div>
          <p className="text-[10px] text-slate-300 font-sans leading-relaxed">
            {tip}
          </p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#030712]" />
        </div>
      )}
    </div>
  );
}

interface SniperStageProps {
  role: GameRole;
  lot: LotItem;
  candidates?: LotItem[];
  onSelectLot?: (lot: LotItem) => void;
  userBid: number | null;
  bankroll: number;
  timeRemaining: number;
  onPlaceBid: (amount: number) => void;
  onChickenOut: () => void;
  onPassLot: () => void;
}

export function SniperStage({
  role,
  lot,
  candidates,
  onSelectLot,
  userBid,
  bankroll,
  timeRemaining,
  onPlaceBid,
  onChickenOut,
  onPassLot,
}: SniperStageProps) {
  // Three Dedicated Pages: "lead" (Floor & Bidding), "financials" (TradingView & Valuation), "story" (Lore & Videos)
  const [activeTab, setActiveTab] = useState<"lead" | "financials" | "story">("lead");
  const [videoList, setVideoList] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState<boolean>(false);

  const isLockout = timeRemaining <= 30;

  // Format time MM:SS
  const mins = Math.floor(timeRemaining / 60);
  const secs = timeRemaining % 60;
  const timeFormatted = `${mins}:${secs < 10 ? "0" : ""}${secs}`;

  // Fetch videos for Tab 3
  useEffect(() => {
    let cancelled = false;
    if (lot.videos && Array.isArray(lot.videos) && lot.videos.length > 0) {
      setVideoList(lot.videos);
      setLoadingVideos(false);
      return;
    }
    async function loadVids() {
      setLoadingVideos(true);
      try {
        const res = await fetch(`/api/sniper/videos?series=${encodeURIComponent(lot.series)}&issue=${encodeURIComponent(lot.issueNumber)}`);
        if (res.ok) {
          const d = await res.json();
          if (!cancelled && Array.isArray(d.videos)) setVideoList(d.videos);
        }
      } catch (e) {
        console.warn("Could not fetch sniper videos", e);
      } finally {
        if (!cancelled) setLoadingVideos(false);
      }
    }
    loadVids();
    return () => { cancelled = true; };
  }, [lot.series, lot.issueNumber, lot.videos]);

  return (
    <div className="space-y-6">
      {/* Persistent Floor Header: Clock, Active Bid, & The 3 Page Tabs */}
      <div
        className={`rounded-xl border p-4 transition-colors ${
          isLockout
            ? "border-rose-500/60 bg-gradient-to-r from-rose-950/40 via-red-950/20 to-[#070A11] animate-pulse"
            : timeRemaining <= 60
            ? "border-amber-500/40 bg-amber-950/20"
            : "border-slate-800 bg-[#070A11]"
        }`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Clock & Status */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div
              className={`p-2.5 rounded-xl border ${
                isLockout
                  ? "bg-rose-500/20 border-rose-500/50 text-rose-400"
                  : timeRemaining <= 60
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              }`}
            >
              {isLockout ? <Lock className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  Floor Round Time
                </span>
                {isLockout && (
                  <span className="rounded bg-rose-950 border border-rose-500/50 px-1.5 py-0.2 text-[9px] font-mono text-rose-300 font-bold uppercase animate-bounce">
                    30s Lockout Active
                  </span>
                )}
              </div>
              <h3 className="text-sm font-mono font-bold text-white">
                {isLockout ? "THE LOCK: IN IT TO WIN IT" : "DUE DILIGENCE & BIDDING WINDOW"}
              </h3>
            </div>
          </div>

          {/* Digital Timer */}
          <div className="flex items-baseline gap-2">
            <span
              className={`font-mono text-3xl md:text-5xl font-black tabular-nums tracking-tight ${
                isLockout ? "text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.6)]" : "text-emerald-400"
              }`}
            >
              {timeFormatted}
            </span>
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
              Remaining
            </span>
          </div>

          {/* Current Bid Snapshot */}
          <div className="hidden lg:block text-right border-l border-slate-800 pl-6 font-mono text-xs">
            <span className="text-slate-500 block uppercase text-[10px]">Your Bid</span>
            <span className="text-base font-bold text-white">
              {userBid ? `$${userBid.toLocaleString()}` : "None Placed"}
            </span>
          </div>
        </div>

        {/* The Three Dedicated Page Navigation Tabs */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-center sm:justify-start gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("lead")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all ${
              activeTab === "lead"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-lg"
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            <DollarSign className="h-4 w-4" />
            <span>1. Lead Page (The Floor &amp; Bids)</span>
          </button>

          <button
            onClick={() => setActiveTab("financials")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all ${
              activeTab === "financials"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-lg"
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            <LineChart className="h-4 w-4" />
            <span>2. Financing &amp; TradingView</span>
          </button>

          <button
            onClick={() => setActiveTab("story")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all ${
              activeTab === "story"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-lg"
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>3. Story, Lore &amp; Videos</span>
          </button>
        </div>
      </div>

      {/* PAGE 1: THE LEAD / FLOOR BIDDING PAGE */}
      {activeTab === "lead" && (
        <div className="space-y-6">
          {/* 4 Timing & Execution Rules Pills Bar on the Floor */}
          <div className="relative rounded-xl border-2 border-cyan-400 bg-gradient-to-r from-[#060E1C] via-[#040A14] to-[#060E1C] p-3 text-xs font-mono shadow-[0_0_16px_rgba(34,211,238,0.65),inset_0_1px_2px_rgba(255,255,255,0.25)] ring-1 ring-cyan-300/50">
            {/* Top Radiant Neon Rimlight Flare */}
            <div className="absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_12px_rgba(34,211,238,1)]" />

            <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-cyan-500/20">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                  <Clock className="h-3.5 w-3.5" />
                </div>
                <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest">
                  Sniper Exchange Underwriting Rules (4 Timing Phases)
                </span>
                <span className="text-[9px] text-slate-400 font-sans hidden sm:inline">
                  · Hover or tap any pill for rules intel
                </span>
              </div>
              <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-400/50 px-2 py-0.5 rounded shadow-sm">
                *Sovereign = Panel Profits Proprietary Asset Tier
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <FloorRulePill
                phase="T-240s Phase"
                badge="bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                icon={<Clock className="h-3 w-3" />}
                title="1. 240s Decision Clock"
                body="4 mins to inspect Floor, Financing &amp; Lore across all 3 pages."
                tip="Simulates live auction room diligence (Heritage / ComicConnect). Gives you 240 seconds to cross-examine recorded sales comps, multi-grade spreads, and historical price drift before placing a bid."
              />
              <FloorRulePill
                phase="T-30s Lockout"
                badge="bg-rose-950/80 text-rose-300 border-rose-500/40"
                icon={<Lock className="h-3 w-3" />}
                title="2. 30s Hard Lockout"
                body="Floor locks at T-30s ('In It to Win It'). You cannot chicken out."
                tip="Authentic gavel protocol. Once the auctioneer reaches final calls in the last 30 seconds, bids cannot be retracted. The pass/chicken-out button is permanently disabled until hammer strike."
              />
              <FloorRulePill
                phase="Pre-Lockout Exit"
                badge="bg-amber-950/80 text-amber-300 border-amber-500/40"
                icon={<ShieldAlert className="h-3 w-3" />}
                title="3. 10% Chicken-Out Valve"
                body="Spot a bad spread? Bail before T-30s for 10% to save the other 90%."
                tip="Graham &amp; Dodd capital preservation. A 10% haircut to escape an overbid or illiquid trap saves you from absorbing an unrecoverable 50%+ loss on secondary liquidation."
              />
              <FloorRulePill
                phase="T-0s Clearing"
                badge="bg-cyan-950/80 text-cyan-300 border-cyan-500/40"
                icon={<Gavel className="h-3 w-3" />}
                title="4. Hammer Strike &amp; Vault"
                body="Gavel drops at T-0s. Wins below seller breakeven bank positive ROI."
                tip="*Proprietary Classification: 'Sovereign' is Panel Profits' proprietary institutional asset tier, representing audited catalog equities with verified float, liquidity spreads, and margin-of-safety thresholds."
              />
            </div>
          </div>

          {/* Row of Underwriting Decisions Strip */}
          {candidates && candidates.length > 0 && onSelectLot && (
            <SniperCandidateRow
              candidates={candidates}
              activeLotId={lot.id}
              onSelectLot={onSelectLot}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: The Slab / Cover Encasement */}
            <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#070A11] p-5 shadow-2xl flex flex-col items-center">
              <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Lot Encasement
                </span>
                <span className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-300 uppercase">
                  {lot.grader} {lot.grade}
                </span>
              </div>

              <div className="w-full flex justify-center py-2">
                <SlabEncasement
                  gradingCompany={lot.grader as any}
                  grade={Number(lot.grade)}
                  title={lot.title}
                  issueNumber={lot.issueNumber}
                  certNumber={lot.certNumber}
                  imageUrl={lot.coverUrl}
                  isYellowLabel={lot.isYellowLabel}
                  signatureDetails={lot.signatureDetails || undefined}
                  size="md"
                />
              </div>

              <div className="w-full mt-4 pt-4 border-t border-slate-800/80 text-center font-mono">
                <h2 className="text-base font-bold text-white leading-snug">{lot.title}</h2>
                <div className="flex items-center justify-center gap-3 mt-1.5 text-xs text-slate-400">
                  <span>{lot.series}</span>
                  <span>·</span>
                  <span>Issue #{lot.issueNumber}</span>
                </div>
              </div>
            </div>

            {/* Right: Bidding Keypad & Floor Decisions */}
            <div className="lg:col-span-7 space-y-6">
              <SniperControls
                lot={lot}
                userBid={userBid}
                bankroll={bankroll}
                timeRemaining={timeRemaining}
                onPlaceBid={onPlaceBid}
                onChickenOut={onChickenOut}
                onPassLot={onPassLot}
              />

              {/* Sunk Slabbing Cost & Breakeven Analysis Card */}
              <SniperBreakevenCard
                lot={lot}
                currentBid={userBid ?? lot.openingBid}
              />

              {/* Quick Underwriting Summary Card */}
              <div className="rounded-xl border border-slate-800 bg-[#070A11] p-5 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400 uppercase tracking-wider text-[10px]">Floor Due Diligence</span>
                  <span className="text-cyan-300">Turnover: {lot.salesVolume ?? 15} sales/yr</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {role === "broker" ? (
                    <span>
                      Fiduciary Note: As The Broker, your edge is disciplined entry. Verify the raw-to-9.8 spread (${lot.spreadRawTo98 ?? "N/A"}) and avoid overpaying relative to the benchmark ladder.
                    </span>
                  ) : (
                    <span>
                      Whale High-Roller Alert: High-ticket {lot.grader} {lot.grade} lot. Check Page 2 to inspect if the comp date ({lot.lastSoldDate}) is stale before bidding aggressive size.
                    </span>
                  )}
                </p>
                <div className="pt-2 flex gap-3 text-cyan-400">
                  <button onClick={() => setActiveTab("financials")} className="underline hover:text-cyan-300 text-xs">
                    → Inspect Full TradingView Chart &amp; Ladder
                  </button>
                  <button onClick={() => setActiveTab("story")} className="underline hover:text-cyan-300 text-xs">
                    → Read 3-Act Story &amp; Watch Videos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAGE 2: THE FINANCING & TRADINGVIEW ANALYSIS PAGE */}
      {activeTab === "financials" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-[#070A11] p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                  Institutional Technical Terminal
                </span>
                <h3 className="text-lg font-mono font-bold text-white">
                  TRADINGVIEW LIGHTWEIGHT CHARTS &amp; SOVEREIGN LADDERS
                </h3>
              </div>
              <span className="rounded bg-emerald-950 border border-emerald-500/40 px-2.5 py-1 text-xs font-mono font-bold text-emerald-300">
                100% AUTHENTIC RECORDED COMPS
              </span>
            </div>

            <SniperChart lot={lot} />
          </div>

          {/* Authentic PriceCharting Multi-Grade Matrix */}
          <PriceChartingGradeTable lot={lot} />

          {/* Sunk Slabbing Cost & Breakeven Analysis */}
          <SniperBreakevenCard
            lot={lot}
            currentBid={userBid ?? lot.openingBid}
          />

          {/* Dossier containing Multi-grade Price Ladder and Spreads */}
          <SniperDossier role={role} lot={lot} />
        </div>
      )}

      {/* PAGE 3: THE STORY, LORE & VIDEOS DOSSIER */}
      {activeTab === "story" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: 3-Act Continuity Summary */}
          <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#070A11] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <BookOpen className="h-5 w-5 text-purple-400" />
              <h3 className="text-base font-mono font-bold text-white uppercase tracking-wider">
                Three-Act Narrative Continuity Summary
              </h3>
            </div>

            <div className="text-xs font-sans text-slate-300 leading-relaxed space-y-3 prose prose-invert max-w-none">
              <div className="whitespace-pre-line">
                {lot.summary}
              </div>
            </div>

            {/* Fiduciary Investment Checklist */}
            <div className="mt-6 pt-4 border-t border-slate-800 space-y-2 font-mono text-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 block mb-2">
                Bibliographic Due Diligence
              </span>
              <div className="space-y-1.5 text-slate-300 text-[11px]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Verified Canonical Identity &amp; Series Pedigree</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Intellectual Property Moat: Established First Appearance &amp; Key Run</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Embedded Videos & Explainer Context */}
          <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#070A11] p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <Video className="h-5 w-5 text-rose-400" />
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                Video Reels &amp; Financial Explainers
              </h3>
            </div>

            <SniperVideos
              series={lot.series}
              issue={lot.issueNumber}
              videos={videoList}
              loading={loadingVideos}
            />
          </div>
        </div>
      )}
    </div>
  );
}
