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
  ExternalLink,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { GameRole, LotItem, StickyLotBid, BidEvent } from "@/lib/sniper/sim/types";
import { SlabEncasement } from "@/components/sniper/SlabEncasement";
import { SniperChart } from "./SniperChart";
import { SniperDossier } from "./SniperDossier";
import { SniperControls } from "./SniperControls";
import { SniperBreakevenCard } from "./SniperBreakevenCard";
import { SniperReplacementCard } from "./SniperReplacementCard";
import { SniperVideos } from "@/components/sniper/SniperVideos";
import { SniperCandidateRow } from "./SniperCandidateRow";
import { PriceChartingGradeTable } from "./PriceChartingGradeTable";
import { StickyBiddedRail } from "./StickyBiddedRail";
import { SniperBidTrajectoryChart } from "./SniperBidTrajectoryChart";
import { RichContinuityViewer } from "./RichContinuityViewer";
import { calculateReplacementAnalysis } from "@/lib/sniper/sim/encasement-math";
import { useTooltipsEnabled } from "@/components/shell/tooltip-toggle";

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
  const tooltipsEnabled = useTooltipsEnabled();

  return (
    <div
      className="relative rounded-lg border-2 border-purple-500/70 bg-gradient-to-b from-[#140827] via-[#0E051C] to-[#07020F] p-2.5 transition-all cursor-pointer group shadow-[0_0_0_1px_rgba(168,85,247,0.6),0_0_8px_rgba(168,85,247,0.5),inset_0_0_6px_rgba(168,85,247,0.2)] hover:border-purple-300 hover:shadow-[0_0_0_1px_rgba(216,180,254,0.9),0_0_16px_rgba(168,85,247,0.85),inset_0_0_10px_rgba(168,85,247,0.35)] hover:ring-1 hover:ring-purple-300"
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
      onClick={() => setShowTip(!showTip)}
    >
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase border ${badge}`}>
          {icon}
          <span>{phase}</span>
        </span>
        <HelpCircle className="h-3 w-3 text-slate-400 group-hover:text-purple-300 transition-colors" />
      </div>
      <div className="text-[11px] font-mono font-bold text-white uppercase truncate group-hover:text-purple-200 transition-colors">
        {title}
      </div>
      <div className="text-[10px] text-slate-300 font-sans leading-tight mt-0.5 line-clamp-2">
        {body}
      </div>

      {showTip && tooltipsEnabled && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-72 rounded-xl border border-purple-500/60 bg-[#0E051B] p-3 shadow-2xl backdrop-blur-xl pointer-events-none">
          <div className="text-purple-300 font-mono font-bold text-[11px] mb-1 flex items-center gap-1">
            <Info className="h-3 w-3 shrink-0" />
            <span>{title}</span>
          </div>
          <p className="text-[10px] text-slate-200 font-sans leading-relaxed">
            {tip}
          </p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0E051B]" />
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
  onRefreshChoices?: () => void;
  onLotExpired?: (lotId: string) => void;
  userBid: number | null;
  bankroll: number;
  timeRemaining: number;
  onPlaceBid: (amount: number) => void;
  onChickenOut: () => void;
  onPassLot: () => void;
  stickyBids?: StickyLotBid[];
  onChickenOutLot?: (lotId: string) => void;
  onRaiseStickyBid?: (lotId: string, amount: number) => void;
  currentFloorBid?: number;
  bidEvents?: BidEvent[];
}

export function SniperStage({
  role,
  lot,
  candidates,
  onSelectLot,
  onRefreshChoices,
  onLotExpired,
  userBid,
  bankroll,
  timeRemaining,
  onPlaceBid,
  onChickenOut,
  onPassLot,
  stickyBids,
  onChickenOutLot,
  onRaiseStickyBid,
  currentFloorBid,
  bidEvents,
}: SniperStageProps) {
  // Three Dedicated Pages: "lead" (Floor & Bidding), "financials" (TradingView & Valuation), "story" (Lore & Videos)
  const [activeTab, setActiveTab] = useState<"lead" | "financials" | "story">("lead");
  const [videoList, setVideoList] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState<boolean>(false);

  const ladder = lot.priceLadder;
  const fmv98 = ladder.grade98 || lot.fmv;
  const fmv96 = ladder.grade96 || Math.round(lot.fmv * 0.45);
  const fmv94 = ladder.grade94 || Math.round(lot.fmv * 0.35);
  const fmv92 = ladder.grade92 || Math.round(lot.fmv * 0.28);
  const rawBasis = lot.estimatedRawBasis || ladder.raw || Math.max(10, Math.round(lot.fmv * 0.15));
  const isVintage = (lot.era || "").includes("golden") || (lot.era || "").includes("silver") || (lot.era || "").includes("bronze");
  const lastSoldPrice = lot.hammerPrice || lot.fmv;

  const analysis = calculateReplacementAnalysis({
    rawPrice: rawBasis,
    currentBid: currentFloorBid ?? lot.openingBid,
    lastSoldPrice,
    lotGrade: lot.grade,
    fmv98,
    fmv96,
    fmv94,
    fmv92,
    isVintage,
    grader: lot.grader,
    isYellowLabel: lot.isYellowLabel,
  });
  const wholeTomatoCost = analysis.wholeTomato.wholeTomato;

  const isLockout = timeRemaining <= 30;

  // Format time with days, hours, minutes, and seconds
  const s = Math.max(0, Math.floor(timeRemaining));
  const days = Math.floor(s / 86400);
  const rem = s % 86400;
  const hours = Math.floor(rem / 3600);
  const mins = Math.floor((rem % 3600) / 60);
  const secs = rem % 60;

  const timeFormatted =
    days > 0
      ? `${days}d ${hours}h ${mins}m`
      : hours > 0
      ? `${hours}h ${mins < 10 ? "0" : ""}${mins}m ${secs < 10 ? "0" : ""}${secs}s`
      : `${mins}:${secs < 10 ? "0" : ""}${secs}`;

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
        const res = await fetch(`/api/sniper/videos?series=${encodeURIComponent(lot.series)}&issue=${encodeURIComponent(lot.issueNumber)}&era=${encodeURIComponent(lot.era || "")}`);
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
  }, [lot.series, lot.issueNumber, lot.era, lot.videos]);

  return (
    <div className="space-y-5">
      {/* ── Layer 1: Breadcrumb Trail across Floor & Research Layers ── */}
      <div className="flex items-center justify-between text-[11px] font-mono px-3.5 py-2 rounded-xl border border-purple-500/30 bg-[#0A0515] text-slate-400 shadow-md">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("lead")}
            className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors flex items-center gap-1"
          >
            <span>Floor Rail (4 Lots)</span>
          </button>
          <span className="text-slate-600">/</span>
          <span className="text-white font-semibold flex items-center gap-1.5">
            <span className="px-1.5 py-0.2 rounded bg-purple-950/80 border border-purple-500/40 text-[9px] text-purple-300 font-bold">
              {lot.grader} {lot.grade}
            </span>
            <span className="truncate max-w-[200px] sm:max-w-none">{lot.title}</span>
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-purple-300 font-bold uppercase">
            {activeTab === "lead" ? "Page 1: Floor & Bids" : activeTab === "financials" ? "Page 2: Financing & TradingView" : "Page 3: Lore & Videos"}
          </span>
        </div>
        <div className="text-[10px] text-slate-500 hidden sm:inline">
          Active Underwriting Target · Cert #{lot.certNumber ? lot.certNumber.slice(-4) : "VERIFIED"}
        </div>
      </div>

      {/* ── Sticky Bidded Auctions Collation Board (Max 5 Slots) ── */}
      {stickyBids && stickyBids.length > 0 && onChickenOutLot && onRaiseStickyBid && onSelectLot && (
        <StickyBiddedRail
          stickyBids={stickyBids}
          activeLotId={lot.id}
          onSelectLot={onSelectLot}
          onChickenOutLot={onChickenOutLot}
          onRaiseBid={onRaiseStickyBid}
        />
      )}

      {/* ── Layer 2: 4-Lot Strip Across the Top with Staggered Timers ── */}
      {candidates && candidates.length > 0 && onSelectLot && (
        <SniperCandidateRow
          candidates={candidates}
          activeLotId={lot.id}
          onSelectLot={onSelectLot}
          onRefreshChoices={onRefreshChoices}
          onLotExpired={onLotExpired}
        />
      )}

      {/* ── Layer 3: Persistent Floor Round Clock & The 3 Page Tabs with Neon Rimlights ── */}
      <div
        className={`relative rounded-xl border-2 p-4 transition-all duration-300 ${
          isLockout
            ? "border-rose-500 bg-gradient-to-r from-[#220712] via-[#14030A] to-[#220712] shadow-[0_0_0_1px_rgba(244,63,94,1),0_0_20px_rgba(244,63,94,0.9),0_0_35px_rgba(225,29,72,0.5),inset_0_1px_2px_rgba(255,255,255,0.4)] ring-1 ring-rose-400"
            : timeRemaining <= 60
            ? "border-amber-400 bg-gradient-to-r from-[#221404] via-[#140B02] to-[#221404] shadow-[0_0_0_1px_rgba(251,191,36,1),0_0_16px_rgba(245,158,11,0.85),inset_0_1px_2px_rgba(255,255,255,0.35)] ring-1 ring-amber-300/60"
            : "border-cyan-400 bg-gradient-to-r from-[#061526] via-[#040C16] to-[#061526] shadow-[0_0_0_1px_rgba(34,211,238,1),0_0_16px_rgba(6,182,212,0.85),0_0_28px_rgba(8,145,178,0.45),inset_0_1px_2px_rgba(255,255,255,0.35)] ring-1 ring-cyan-300/60"
        }`}
      >
        {/* Top Radiant Neon Rimlight Flare */}
        <div
          className={`absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-transparent to-transparent ${
            isLockout
              ? "via-rose-300 shadow-[0_0_14px_rgba(244,63,94,1)]"
              : timeRemaining <= 60
              ? "via-amber-300 shadow-[0_0_14px_rgba(251,191,36,1)]"
              : "via-cyan-300 shadow-[0_0_14px_rgba(34,211,238,1)]"
          }`}
        />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Clock & Status */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div
              className={`p-2.5 rounded-xl border ${
                isLockout
                  ? "bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                  : timeRemaining <= 60
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                  : "bg-cyan-500/20 border-cyan-500/40 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
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
                isLockout
                  ? "text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]"
                  : timeRemaining <= 60
                  ? "text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]"
                  : "text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]"
              }`}
            >
              {timeFormatted}
            </span>
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
              Remaining
            </span>
          </div>

          {/* Current Bid Snapshot */}
          <div className="hidden lg:block text-right border-l border-slate-800/80 pl-6 font-mono text-xs">
            <span className="text-slate-500 block uppercase text-[10px]">Your Bid</span>
            <span className="text-base font-bold text-white">
              {userBid ? `$${userBid.toLocaleString()}` : "None Placed"}
            </span>
          </div>
        </div>

        {/* The Three Dedicated Page Navigation Tabs with Laser Rimlights */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-center sm:justify-start gap-3 overflow-x-auto">
          {/* Tab 1: Lead Page (Cyan Laser Rimlight) */}
          <button
            onClick={() => setActiveTab("lead")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 ${
              activeTab === "lead"
                ? "border-2 border-cyan-400 text-cyan-200 bg-cyan-950/80 shadow-[0_0_0_1px_rgba(34,211,238,0.9),0_0_14px_rgba(34,211,238,0.7),inset_0_0_8px_rgba(34,211,238,0.25)] ring-1 ring-cyan-300/50"
                : "border border-cyan-500/30 text-slate-400 hover:text-cyan-200 hover:border-cyan-400/70 bg-black/40"
            }`}
          >
            <DollarSign className="h-4 w-4 text-cyan-400" />
            <span>1. Lead Page (The Floor &amp; Bids)</span>
          </button>

          {/* Tab 2: Financing & TradingView (Emerald Laser Rimlight) */}
          <button
            onClick={() => setActiveTab("financials")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 ${
              activeTab === "financials"
                ? "border-2 border-emerald-400 text-emerald-200 bg-emerald-950/80 shadow-[0_0_0_1px_rgba(52,211,153,0.9),0_0_14px_rgba(16,185,129,0.7),inset_0_0_8px_rgba(16,185,129,0.25)] ring-1 ring-emerald-300/50"
                : "border border-emerald-500/30 text-slate-400 hover:text-emerald-200 hover:border-emerald-400/70 bg-black/40"
            }`}
          >
            <LineChart className="h-4 w-4 text-emerald-400" />
            <span>2. Financing &amp; TradingView</span>
          </button>

          {/* Tab 3: Story, Lore & Videos (Purple Laser Rimlight) */}
          <button
            onClick={() => setActiveTab("story")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 ${
              activeTab === "story"
                ? "border-2 border-purple-400 text-purple-200 bg-purple-950/80 shadow-[0_0_0_1px_rgba(192,132,252,0.9),0_0_14px_rgba(168,85,247,0.7),inset_0_0_8px_rgba(168,85,247,0.25)] ring-1 ring-purple-300/50"
                : "border border-purple-500/30 text-slate-400 hover:text-purple-200 hover:border-purple-400/70 bg-black/40"
            }`}
          >
            <BookOpen className="h-4 w-4 text-purple-400" />
            <span>3. Story, Lore &amp; Videos</span>
          </button>
        </div>
      </div>

      {/* PAGE 1: THE LEAD / FLOOR BIDDING PAGE */}
      {activeTab === "lead" && (
        <div className="space-y-6">
          {/* 4 Timing & Execution Rules Pills Bar on the Floor */}
          <div className="relative rounded-xl border-2 border-purple-500 bg-gradient-to-r from-[#140726] via-[#0B0316] to-[#140726] p-3 text-xs font-mono shadow-[0_0_0_1px_rgba(192,132,252,1),0_0_16px_rgba(168,85,247,0.85),0_0_28px_rgba(147,51,234,0.45),inset_0_1px_2px_rgba(255,255,255,0.35),inset_0_0_10px_rgba(168,85,247,0.25)] ring-1 ring-purple-300/60">
            {/* Top Radiant Neon Rimlight Flare */}
            <div className="absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-transparent via-purple-300 to-transparent shadow-[0_0_12px_rgba(168,85,247,1)]" />

            <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-purple-500/30">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-purple-500/20 border border-purple-400 text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.6)]">
                  <Clock className="h-3.5 w-3.5" />
                </div>
                <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest">
                  Sniper Exchange Underwriting Rules (4 Timing Phases)
                </span>
                <span className="text-[9px] text-purple-200/70 font-sans hidden sm:inline">
                  · Hover or tap any pill for rules intel
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <FloorRulePill
                phase="Due Diligence Phase"
                badge="bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                icon={<Clock className="h-3 w-3" />}
                title="1. Due Diligence Clock"
                body="Task: Cross-examine Page 1 fees, Page 2 drift, and Page 3 lore to calculate your strict bid ceiling."
                tip="Strategic Objective: Replacement Value Arbitrage — Calculate true DIY replication cost (The Whole Tomato) vs. current auction bids to lock in guaranteed manufacturing advantage."
              />
              <FloorRulePill
                phase="T-30s Lockout"
                badge="bg-rose-950/80 text-rose-300 border-rose-500/40"
                icon={<Lock className="h-3 w-3" />}
                title="2. 30s Hard Lockout"
                body="Task: Lock in bidding conviction before T-30s. At 30 seconds, pass freezes and active bids enter binding gavel settlement."
                tip="Execution Objective: Auction Gavel Discipline — Enforce psychological execution under pressure where canceling bids is prohibited once final calls commence."
              />
              <FloorRulePill
                phase="Pre-Lockout Exit"
                badge="bg-amber-950/80 text-amber-300 border-amber-500/40"
                icon={<ShieldAlert className="h-3 w-3" />}
                title="3. 10% Chicken-Out Valve"
                body="Task: Trigger the emergency abort switch before T-30s if you detect a stale 2021 comp or overpaid bid."
                tip="Risk Objective: Graham &amp; Dodd Capital Defense — Preserve dry powder. Absorbing a 10% haircut to eliminate a compromised trade protects 90% of your bankroll for prime vintage grails."
              />
              <FloorRulePill
                phase="T-0s Clearing"
                badge="bg-cyan-950/80 text-cyan-300 border-cyan-500/40"
                icon={<Gavel className="h-3 w-3" />}
                title="4. Hammer Strike &amp; Vault"
                body="Task: Gavel drops at T-0s. Clear the lot below DIY replacement cost (The Whole Tomato) to deposit equity surplus into your Vault."
                tip="Portfolio Objective: Sovereign Vault Accumulation — Capture verified intrinsic value into Panel Profits' proprietary Sovereign tier, locking in manufacturing replacement equity."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Visual Asset, Whole Tomato Equation, and PriceCharting Certified Matrix */}
            <div className="lg:col-span-5 space-y-5">
              {/* Slab Card */}
              <div className="rounded-xl border border-slate-800 bg-[#070A11] p-5 shadow-2xl flex flex-col items-center">
                <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3 mb-4 gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 shrink-0">
                      Live Lot
                    </span>
                    {lot.venueDisplayName && (
                      <a
                        href={lot.sourceListingUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border border-purple-500/40 bg-purple-950/60 text-purple-200 hover:text-cyan-300 hover:border-cyan-400 transition-colors truncate"
                        title={lot.venueLotId ? `${lot.venueDisplayName} · Lot #${lot.venueLotId}` : lot.venueDisplayName}
                      >
                        <span className="truncate">{lot.venueDisplayName}</span>
                        <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {lot.certNumber && (
                      <a
                        href={lot.certVerificationUrl || (lot.grader === "CGC" ? `https://www.cgccomics.com/certlookup/${lot.certNumber}/` : "#")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] font-mono text-cyan-400 hover:text-cyan-300 underline inline-flex items-center gap-0.5"
                        title={`Verify ${lot.grader} #${lot.certNumber}`}
                      >
                        <span>Cert #{lot.certNumber.slice(-6)}</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                    <span className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-300 uppercase">
                      {lot.grader} {lot.grade}
                    </span>
                  </div>
                </div>

                <div className="w-full flex justify-center py-2">
                  <SlabEncasement
                    gradingCompany={lot.grader as any}
                    grade={Number(lot.grade)}
                    title={lot.title}
                    issueNumber={lot.issueNumber}
                    certNumber={lot.certNumber}
                    imageUrl={lot.coverUrl}
                    galleryImages={lot.galleryImages}
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

              {/* The Whole Tomato DIY Replacement Cost Equation Banner */}
              <div className="relative rounded-xl border-2 border-emerald-500 bg-gradient-to-r from-[#041A12] via-[#020F0A] to-[#041A12] p-4 font-mono text-xs shadow-[0_0_0_1px_rgba(16,185,129,0.8),0_0_16px_rgba(16,185,129,0.4),inset_0_1px_2px_rgba(255,255,255,0.2)] space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2.5">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-300 uppercase tracking-wider text-[11px]">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    <span>The Whole Tomato DIY Cost Equation (Make vs. Buy)</span>
                  </div>
                  <span className="text-white font-bold text-sm bg-emerald-950/80 border border-emerald-400/50 px-2 py-0.5 rounded">
                    ${wholeTomatoCost.toFixed(2)} DIY Basis
                  </span>
                </div>

                {/* Mathematical Replacement Formula */}
                <div className="grid grid-cols-3 gap-2 text-center py-1">
                  <div className="p-2 rounded-lg bg-black/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">1. Raw Basis</span>
                    <strong className="text-white text-sm font-bold">${rawBasis.toFixed(2)}</strong>
                    <span className="text-[9px] text-slate-500 block">PriceCharting Ungraded</span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">2. Sunk Slabbing</span>
                    <strong className="text-cyan-300 text-sm font-bold">${lot.slabbingCostFloor.toFixed(2)}</strong>
                    <span className="text-[9px] text-slate-500 block">FL Fees + Ship + Tax</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/40">
                    <span className="text-[10px] text-emerald-300 block uppercase font-bold">Total DIY Cost</span>
                    <strong className="text-emerald-300 text-sm font-bold">${wholeTomatoCost.toFixed(2)}</strong>
                    <span className="text-[9px] text-emerald-400/70 block">Whole Tomato Sum</span>
                  </div>
                </div>

                {/* Buyer Manufacturing Advantage Callout */}
                {(() => {
                  const currentActiveBid = Math.max(currentFloorBid ?? 0, userBid ?? 0, lot.openingBid);
                  const isBelowSlab = currentActiveBid <= lot.slabbingCostFloor;
                  const slabAdvantage = lot.slabbingCostFloor - currentActiveBid;
                  const diyAdvantage = wholeTomatoCost - currentActiveBid;

                  return (
                    <div className="p-2.5 rounded-lg bg-black/70 border border-emerald-500/30 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-300">Active Floor Bid: <strong>${currentActiveBid.toLocaleString()}</strong></span>
                        {isBelowSlab ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-400 text-emerald-300 font-bold text-[10px]">
                            +${slabAdvantage.toFixed(2)} Below Slabbing Cost!
                          </span>
                        ) : diyAdvantage > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-400 text-cyan-300 font-bold text-[10px]">
                            +${diyAdvantage.toFixed(2)} DIY Manufacturing Discount
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-400 text-amber-300 font-bold text-[10px]">
                            Premium Over Raw+Slab (+${Math.abs(diyAdvantage).toFixed(2)})
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        {isBelowSlab
                          ? `Arbitrage Alpha: Bidding $${currentActiveBid} acquires this certified slab for $${slabAdvantage.toFixed(2)} LESS than the grading company invoice alone. The comic book inside is effectively FREE with a negative basis.`
                          : diyAdvantage > 0
                          ? `Make vs. Buy Advantage: Replicating this certified slab today costs $${wholeTomatoCost.toFixed(2)} (raw comic $${rawBasis.toFixed(2)} + slabbing fees $${lot.slabbingCostFloor.toFixed(2)}). Clearing under $${wholeTomatoCost.toFixed(2)} captures immediate replacement equity.`
                          : `High-Grade Rarity Premium: Grade ${lot.grade} commands equity surplus over DIY manufacturing cost due to low population density and submitter grade fallout risk.`}
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* PriceCharting Multi-Grade Matrix Directly on Page 1 */}
              <PriceChartingGradeTable lot={lot} compact={true} />

              {/* Page 1 Mini TradingView Price Chart & Comps Preview */}
              <div className="rounded-xl border border-slate-800 bg-[#070A11] p-4 font-mono space-y-2.5 shadow-xl">
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5 font-bold text-cyan-300 uppercase tracking-wider">
                    <LineChart className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Market Cycle (2021 Peak → 2026 Floor)</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
                    FMV ${lot.fmv.toLocaleString()}
                  </span>
                </div>

                {/* SVG Trendline Sparkline */}
                {(() => {
                  const pts = lot.chartPoints && lot.chartPoints.length > 1 ? lot.chartPoints : [
                    { time: "2021-09-15", value: Math.round(lot.fmv * 2.15) },
                    { time: "2023-08-15", value: Math.round(lot.fmv * 0.74) },
                    { time: lot.lastSoldDate || "2026-10-15", value: lot.fmv },
                  ];
                  const vals = pts.map((p) => p.value);
                  const min = Math.min(...vals);
                  const max = Math.max(...vals);
                  const range = max - min || 1;
                  const w = 320;
                  const h = 75;
                  const padX = 10;
                  const padY = 8;
                  const innerW = w - padX * 2;
                  const innerH = h - padY * 2;

                  const coords = pts.map((p, i) => {
                    const x = padX + (i / (pts.length - 1)) * innerW;
                    const y = padY + innerH - ((p.value - min) / range) * innerH;
                    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, val: p.value };
                  });

                  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
                  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${h} L ${coords[0].x} ${h} Z`;
                  const maxCoord = coords.reduce((prev, curr) => (curr.val > prev.val ? curr : prev), coords[0]);
                  const lastCoord = coords[coords.length - 1];

                  return (
                    <div className="rounded-lg border border-slate-800 bg-black/60 p-2 space-y-2">
                      <div className="relative w-full overflow-hidden">
                        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16 overflow-visible">
                          <defs>
                            <linearGradient id="miniAreaGradLead" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.35" />
                              <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path d={areaPath} fill="url(#miniAreaGradLead)" />
                          <path d={linePath} fill="none" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          
                          {/* 2021 Peak Marker */}
                          <circle cx={maxCoord.x} cy={maxCoord.y} r="3" fill="#F59E0B" />
                          <text x={Math.min(maxCoord.x + 4, w - 65)} y={Math.max(maxCoord.y - 4, 10)} fill="#F59E0B" fontSize="8" fontWeight="bold">
                            Peak ${maxCoord.val.toLocaleString()}
                          </text>

                          {/* Last Sale Dot */}
                          <circle cx={lastCoord.x} cy={lastCoord.y} r="3.5" fill="#10B981" />
                          <circle cx={lastCoord.x} cy={lastCoord.y} r="6" fill="none" stroke="#10B981" strokeWidth="1" opacity="0.6" />
                        </svg>
                      </div>

                      {/* Multi-Source Venue Comparison Chips */}
                      <div className="grid grid-cols-3 gap-1 text-[9px] text-center pt-1 border-t border-slate-800/80">
                        <div className="p-1 rounded bg-purple-950/40 border border-purple-500/30">
                          <span className="text-purple-300 block font-bold">Heritage</span>
                          <span className="text-white font-mono font-bold">${Math.round(lot.fmv * 1.22).toLocaleString()}</span>
                        </div>
                        <div className="p-1 rounded bg-cyan-950/40 border border-cyan-500/30">
                          <span className="text-cyan-300 block font-bold">Exchange FMV</span>
                          <span className="text-cyan-200 font-mono font-bold">${lot.fmv.toLocaleString()}</span>
                        </div>
                        <div className="p-1 rounded bg-rose-950/40 border border-rose-500/30">
                          <span className="text-rose-300 block font-bold">eBay Floor</span>
                          <span className="text-rose-200 font-mono font-bold">${Math.max(15, Math.round(lot.fmv * 0.84)).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Jump to Full Terminal */}
                      <button
                        type="button"
                        onClick={() => setActiveTab("financials")}
                        className="w-full text-center py-1.5 px-2 rounded border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:text-white hover:bg-emerald-900/60 hover:border-emerald-400 transition-all text-[10px] font-bold flex items-center justify-center gap-1"
                      >
                        <TrendingUp className="h-3 w-3" />
                        <span>Inspect Full 3-Regime Terminal &amp; Ladder (Page 2) →</span>
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Right Column: Keypad, Real-Time Bid Trajectory, Florida Invoicing & Fiduciary Intel */}
            <div className="lg:col-span-7 space-y-6">
              <SniperControls
                lot={lot}
                userBid={userBid}
                bankroll={bankroll}
                timeRemaining={timeRemaining}
                role={role}
                onPlaceBid={onPlaceBid}
                onChickenOut={onChickenOut}
                onPassLot={onPassLot}
              />

              {/* Real-Time Bid Trajectory & Clock Friction Chart */}
              <SniperBidTrajectoryChart
                lot={lot}
                userBid={userBid}
                currentBid={currentFloorBid ?? lot.openingBid}
                timeRemaining={timeRemaining}
                wholeTomatoCost={wholeTomatoCost}
                lastSoldComp={lastSoldPrice}
                bidEvents={bidEvents ?? []}
                isLockout={isLockout}
              />

              {/* Sunk Slabbing Cost & Breakeven Analysis Card */}
              <SniperBreakevenCard
                lot={lot}
                currentBid={Math.max(currentFloorBid ?? 0, userBid ?? 0, lot.openingBid)}
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
          <div className="relative rounded-xl border-2 border-emerald-400 bg-gradient-to-r from-[#061C14] via-[#04120D] to-[#061C14] p-5 shadow-[0_0_0_1px_rgba(52,211,153,1),0_0_16px_rgba(16,185,129,0.85),0_0_28px_rgba(5,150,105,0.45),inset_0_1px_2px_rgba(255,255,255,0.35),inset_0_0_10px_rgba(16,185,129,0.25)] ring-1 ring-emerald-300/60">
            <div className="absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-transparent via-emerald-300 to-transparent shadow-[0_0_12px_rgba(16,185,129,1)]" />
            <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-300/80">
                  Institutional Technical Terminal
                </span>
                <h3 className="text-lg font-mono font-bold text-white">
                  TRADINGVIEW LIGHTWEIGHT CHARTS &amp; SOVEREIGN LADDERS
                </h3>
              </div>
              <span className="rounded bg-emerald-950 border border-emerald-500/40 px-2.5 py-1 text-xs font-mono font-bold text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                100% AUTHENTIC RECORDED COMPS
              </span>
            </div>

            <SniperChart lot={lot} />
          </div>

          {/* Replacement Cost Engine & Bidding Frenzy Driver (Hope Factor & Screening Rules) */}
          <SniperReplacementCard
            lot={lot}
            currentBid={Math.max(currentFloorBid ?? 0, userBid ?? 0, lot.openingBid)}
          />

          {/* Authentic PriceCharting Multi-Grade Matrix */}
          <PriceChartingGradeTable lot={lot} />

          {/* Sunk Slabbing Cost & Breakeven Analysis */}
          <SniperBreakevenCard
            lot={lot}
            currentBid={Math.max(currentFloorBid ?? 0, userBid ?? 0, lot.openingBid)}
          />

          {/* Dossier containing Multi-grade Price Ladder and Spreads */}
          <SniperDossier role={role} lot={lot} />
        </div>
      )}

      {/* PAGE 3: THE STORY, LORE & VIDEOS DOSSIER */}
      {activeTab === "story" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Interactive Wiki-Linked 3-Act Continuity Summary & Why You Should Buy Dossier */}
          <div className="relative lg:col-span-7">
            <RichContinuityViewer
              summary={lot.summary}
              whyInvest={lot.whyInvest || "Observable market demand with high liquidity in graded secondary turnover. Zero-inferiority guarantee backed by recorded historical comps and auction clearing velocity."}
              series={lot.series}
              issueNumber={lot.issueNumber}
              grade={lot.grade}
              grader={lot.grader}
              fmv={lot.fmv}
              storyTitle={lot.storyTitle}
              storyQuote={lot.storyQuote}
              creativeCredits={lot.creativeCredits}
              characterRoster={lot.characterRoster}
              synopsisParagraphs={lot.synopsisParagraphs}
              fandomUrl={lot.fandomUrl}
              fandomUniverse={lot.fandomUniverse}
              categories={lot.categories}
              notes={lot.notes}
              continuityLinks={lot.continuityLinks}
              variantCovers={lot.variantCovers}
            />
          </div>

          {/* Right: Embedded Videos & Explainer Context with Rose Laser Rimlight */}
          <div className="relative lg:col-span-5 rounded-xl border-2 border-rose-500 bg-gradient-to-r from-[#220712] via-[#14030A] to-[#220712] p-5 shadow-[0_0_0_1px_rgba(251,113,133,1),0_0_16px_rgba(244,63,94,0.85),0_0_28px_rgba(225,29,72,0.45),inset_0_1px_2px_rgba(255,255,255,0.35),inset_0_0_10px_rgba(244,63,94,0.25)] ring-1 ring-rose-300/60 space-y-4">
            <div className="absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-transparent via-rose-300 to-transparent shadow-[0_0_12px_rgba(244,63,94,1)]" />
            <div className="flex items-center gap-2.5 border-b border-rose-500/30 pb-3">
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
