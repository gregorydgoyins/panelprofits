"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  Lock,
  LineChart,
  TrendingUp,
  ExternalLink,
  ShieldAlert,
  Crown,
  Sparkles,
  Info,
  CheckCircle2,
  DollarSign,
  Gavel,
} from "lucide-react";
import type { LotItem, GameRole, StickyLotBid, BidEvent } from "@/lib/sniper/sim/types";
import { SlabEncasement } from "@/components/sniper/SlabEncasement";
import { PriceChartingGradeTable } from "./PriceChartingGradeTable";
import { SniperControls } from "./SniperControls";
import { SniperBreakevenCard } from "./SniperBreakevenCard";
import { SniperCandidateRow } from "./SniperCandidateRow";
import { SniperBidTrajectoryChart } from "./SniperBidTrajectoryChart";
import { SniperChart } from "./SniperChart";
import { RichContinuityViewer } from "./RichContinuityViewer";
import { calculateReplacementAnalysis } from "@/lib/sniper/sim/encasement-math";

interface FloorRulePillProps {
  phase: string;
  badge: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  tip: string;
}

function FloorRulePill({ phase, badge, icon, title, body, tip }: FloorRulePillProps) {
  const [showTip, setShowTip] = useState(false);

  return (
    <div
      className="relative flex-1"
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
    >
      <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-black/60 border border-slate-800/80 hover:border-slate-700 transition cursor-help">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className={`px-1.5 py-0.2 rounded border font-bold flex items-center gap-1 ${badge}`}>
            {icon}
            <span>{phase}</span>
          </span>
        </div>
        <div className="text-[11px] font-mono font-bold text-slate-200 truncate">{title}</div>
        <p className="text-[10px] text-slate-400 font-sans leading-tight line-clamp-2">{body}</p>
      </div>

      {showTip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-72 rounded-xl border border-purple-500/60 bg-[#0E051B] p-3 shadow-2xl backdrop-blur-xl pointer-events-none">
          <div className="text-purple-300 font-mono font-bold text-[11px] mb-1 flex items-center gap-1">
            <Info className="h-3 w-3 shrink-0" />
            <span>{title}</span>
          </div>
          <p className="text-[10px] text-slate-200 font-sans leading-relaxed">{tip}</p>
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
  currentFloorBid,
  bidEvents,
}: SniperStageProps) {
  const isWhale = role === "whale";
  const [activeTab, setActiveTab] = useState<"lead" | "financials" | "story">("lead");
  const [videoList, setVideoList] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState<boolean>(false);
  const [includePressing, setIncludePressing] = useState<boolean>(false);

  const ladder = lot.priceLadder;
  const fmv98 = ladder.grade98 || lot.fmv;
  const fmv96 = ladder.grade96 || Math.round(lot.fmv * 0.45);
  const fmv94 = ladder.grade94 || Math.round(lot.fmv * 0.35);
  const fmv92 = ladder.grade92 || Math.round(lot.fmv * 0.28);
  const rawBasis = lot.estimatedRawBasis || ladder.raw || Math.max(10, Math.round(lot.fmv * 0.15));
  const isVintage =
    (lot.era || "").includes("golden") ||
    (lot.era || "").includes("silver") ||
    (lot.era || "").includes("bronze") ||
    (lot.title || "").includes("198") ||
    (lot.title || "").includes("197");
  const lastSoldPrice = lot.hammerPrice || lot.fmv;

  const numGrade = parseFloat(lot.grade || "9.8");
  const isHighGrade =
    lot.grade === "9.8" ||
    lot.grade === "10.0" ||
    lot.grade === "9.9" ||
    (!isNaN(numGrade) && numGrade > 9.4);
  const isPressingCandidate = !isHighGrade && !isNaN(numGrade) && numGrade <= 9.4;

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
    includePressing: isPressingCandidate ? includePressing : false,
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
    let isMounted = true;
    async function fetchVideos() {
      if (activeTab !== "story" || !lot?.title) return;
      setLoadingVideos(true);
      try {
        const query = `${lot.series || lot.title} comic review summary history`;
        const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}&limit=3`);
        const data = await res.json();
        if (isMounted && data.videos && Array.isArray(data.videos)) {
          setVideoList(data.videos);
        }
      } catch (err) {
        console.error("Failed to load documentary reels:", err);
      } finally {
        if (isMounted) setLoadingVideos(false);
      }
    }
    fetchVideos();
    return () => {
      isMounted = false;
    };
  }, [lot.title, lot.series, activeTab]);

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb & Active Lot Strip ── */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Floor Rail (4 Lots)</span>
          <span>/</span>
          <span className={isWhale ? "text-amber-400 font-bold" : "text-cyan-400 font-bold"}>
            {lot.grader} {lot.grade}
          </span>
          <span>/</span>
          <span className="text-white font-bold truncate max-w-[200px] sm:max-w-md">{lot.title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-slate-500 uppercase tracking-widest text-[10px]">
            {activeTab === "lead" ? "Page 1: Floor & Bids" : activeTab === "financials" ? "Page 2: Financials & TV" : "Page 3: Lore & Media"}
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-[10px] text-emerald-300">
            <CheckCircle2 className="h-3 w-3" />
            <span>Active Target</span>
          </span>
        </div>
      </div>

      {/* ── Layer 2: 4-Lot Choice Rail (Staggered Execution) ── */}
      {candidates && candidates.length > 0 && onSelectLot && (
        <SniperCandidateRow
          candidates={candidates}
          activeLotId={lot.id}
          onSelectLot={onSelectLot}
          onRefreshChoices={onRefreshChoices}
          onLotExpired={onLotExpired}
        />
      )}

      {/* ── Layer 3: Persistent Floor Round Clock & Page Tabs ── */}
      <div
        className={`relative rounded-xl border-2 p-4 transition-all duration-300 ${
          isLockout
            ? "border-rose-500 bg-gradient-to-r from-[#220712] via-[#14030A] to-[#220712] shadow-[0_0_0_1px_rgba(244,63,94,1),0_0_20px_rgba(244,63,94,0.9),inset_0_1px_2px_rgba(255,255,255,0.4)] ring-1 ring-rose-400"
            : timeRemaining <= 60
            ? "border-amber-400 bg-gradient-to-r from-[#221404] via-[#140B02] to-[#221404] shadow-[0_0_0_1px_rgba(251,191,36,1),0_0_16px_rgba(245,158,11,0.85),inset_0_1px_2px_rgba(255,255,255,0.35)] ring-1 ring-amber-300/60"
            : isWhale
            ? "border-amber-400 bg-gradient-to-r from-[#180E02] via-[#0E0701] to-[#180E02] shadow-[0_0_0_1px_rgba(251,191,36,0.9),0_0_16px_rgba(245,158,11,0.6),inset_0_1px_2px_rgba(255,255,255,0.35)] ring-1 ring-amber-300/50"
            : "border-cyan-400 bg-gradient-to-r from-[#061526] via-[#040C16] to-[#061526] shadow-[0_0_0_1px_rgba(34,211,238,1),0_0_16px_rgba(6,182,212,0.85),inset_0_1px_2px_rgba(255,255,255,0.35)] ring-1 ring-cyan-300/60"
        }`}
      >
        <div
          className={`absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-transparent to-transparent ${
            isLockout
              ? "via-rose-300 shadow-[0_0_14px_rgba(244,63,94,1)]"
              : timeRemaining <= 60
              ? "via-amber-300 shadow-[0_0_14px_rgba(251,191,36,1)]"
              : isWhale
              ? "via-amber-300 shadow-[0_0_14px_rgba(251,191,36,1)]"
              : "via-cyan-300 shadow-[0_0_14px_rgba(34,211,238,1)]"
          }`}
        />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div
              className={`p-2.5 rounded-xl border ${
                isLockout
                  ? "bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                  : timeRemaining <= 60
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                  : isWhale
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                  : "bg-cyan-500/20 border-cyan-500/40 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
              }`}
            >
              {isLockout ? <Lock className="h-5 w-5" /> : isWhale ? <Crown className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
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
                {isLockout ? "THE LOCK: IN IT TO WIN IT" : isWhale ? "WHALE HIGH-ROLLER EXECUTION WINDOW" : "DUE DILIGENCE & BIDDING WINDOW"}
              </h3>
            </div>
          </div>

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
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">Remaining</span>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("lead")}
              className={`px-3 py-2 rounded-lg font-mono text-xs font-bold uppercase transition ${
                activeTab === "lead"
                  ? isWhale
                    ? "bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.8)]"
                    : "bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              1. Lead Page (The Floor &amp; Bids)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("financials")}
              className={`px-3 py-2 rounded-lg font-mono text-xs font-bold uppercase transition ${
                activeTab === "financials"
                  ? "bg-emerald-400 text-slate-950 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              2. Financing &amp; TradingView
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("story")}
              className={`px-3 py-2 rounded-lg font-mono text-xs font-bold uppercase transition ${
                activeTab === "story"
                  ? "bg-purple-400 text-slate-950 shadow-[0_0_12px_rgba(192,132,252,0.8)]"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              3. Story, Lore &amp; Videos
            </button>
          </div>
        </div>
      </div>

      {/* ── PAGE 1: LEAD PAGE (THE FLOOR & BIDS) ── */}
      {activeTab === "lead" && (
        <div className="space-y-6">
          {/* Rules Intel Banner */}
          <div className="rounded-xl border border-slate-800 bg-[#070A11] p-3 shadow-xl font-mono">
            <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5 font-bold text-slate-300">
                <Info className="h-3.5 w-3.5 text-cyan-400" />
                <span>Sniper Exchange Underwriting Rules (4 Timing Phases)</span>
              </span>
              <span className="text-[9px] text-slate-500">· Hover or tap any pill for rules intel</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
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
                body="Task: Lock in bidding conviction before T-30s. At 30 seconds, pass freezes and active bids enter the ring."
                tip="Risk Protocol: In it to win it — Pass button locks at T-30s. Active floor bids cannot be withdrawn once the lockout barrier triggers."
              />
              <FloorRulePill
                phase="Active Floor Arena"
                badge="bg-amber-950/80 text-amber-300 border-amber-500/40"
                icon={<DollarSign className="h-3 w-3" />}
                title="3. Proxy Escalation"
                body="Task: Watch for late sniping bots and counter-bids. Bump bids dynamically to defend your spread."
                tip="Tactical Objective: Defensive Escalation — Raise accepted bids incrementally using the quick-bump keypad to hold the clearing line."
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
            {/* Left Column: Slab Card, Whole Tomato Banner, and Table */}
            <div className="lg:col-span-5 space-y-5">
              {/* Slab Card */}
              <div className="rounded-xl border border-slate-800 bg-[#070A11] p-5 shadow-2xl flex flex-col items-center font-mono">
                <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3 mb-4 gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 shrink-0">
                      Live Lot
                    </span>
                    {lot.venueDisplayName && (
                      <a
                        href={lot.sourceListingUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border border-purple-500/40 bg-purple-950/60 text-purple-200 hover:text-cyan-300 hover:border-cyan-400 transition-colors truncate"
                      >
                        <span className="truncate">{lot.venueDisplayName}</span>
                        <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] font-bold text-cyan-300 uppercase">
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

              {/* ── THE WHOLE TOMATO DIY REPLACEMENT COST EQUATION BANNER (UNIVERSAL SALES TAX EVERYWHERE) ── */}
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

                {/* Mathematical Replacement Formula: Raw Price is ALWAYS the core asset foundation */}
                <div className="grid grid-cols-3 gap-2 text-center py-1">
                  <div className="p-2 rounded-lg bg-black/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">1. Raw Comic Basis</span>
                    <strong className="text-white text-sm font-bold">
                      ${((analysis.wholeTomato.rawStreetValue ?? rawBasis) + (analysis.wholeTomato.rawTax ?? 0)).toFixed(2)}
                    </strong>
                    <span className="text-[9px] text-slate-500 block">
                      ${rawBasis.toFixed(2)} + ${(analysis.wholeTomato.rawTax ?? 0).toFixed(2)} Tax
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">2. Sunk Slabbing Floor</span>
                    <strong className="text-cyan-300 text-sm font-bold">
                      ${analysis.wholeTomato.serviceExpenses.toFixed(2)}
                    </strong>
                    <span className="text-[9px] text-slate-500 block">
                      Grading + $8 Inv + Ship + Tax
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/40">
                    <span className="text-[10px] text-emerald-300 block uppercase font-bold">3. Total Replacement</span>
                    <strong className="text-emerald-300 text-sm font-bold">
                      ${wholeTomatoCost.toFixed(2)}
                    </strong>
                    <span className="text-[9px] text-emerald-400/70 block">
                      All-In (Incl. $5.30 Mailer)
                    </span>
                  </div>
                </div>

                {/* Universal Sales Tax Mandate Banner */}
                <div className="rounded bg-black/50 border border-emerald-500/20 px-2.5 py-1.5 text-[9.5px] text-slate-300 space-y-1">
                  <div className="flex items-center justify-between text-emerald-300 font-bold">
                    <span>Universal Sales Tax Mandate (6.0% FL):</span>
                    <span>Total Tax: ${(analysis.wholeTomato.totalSalesTax ?? 0).toFixed(2)}</span>
                  </div>
                  <p className="text-[9px] text-slate-400 leading-tight">
                    Comics, courier shipping, supplies, and slabbing are tangible goods &amp; services — not tax-exempt food. Sales tax applies everywhere across raw purchase, factory encapsulation, and mailer supplies.
                  </p>
                </div>

                {/* Explicit Formula Recap Pill */}
                <div className="rounded bg-black/50 border border-emerald-500/20 px-2.5 py-1 text-[9.5px] text-slate-300 flex items-center justify-between">
                  <span className="text-slate-400">Equation:</span>
                  <span className="font-semibold text-emerald-300">
                    Raw (${((analysis.wholeTomato.rawStreetValue ?? rawBasis) + (analysis.wholeTomato.rawTax ?? 0)).toFixed(2)}) + Slabbing Floor (${analysis.wholeTomato.serviceExpenses.toFixed(2)}) + Mailer ($5.30) = Total DIY (${wholeTomatoCost.toFixed(2)})
                  </span>
                </div>

                {/* Interactive Clean & Press Variable on <=9.4 */}
                {isPressingCandidate ? (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[10px]">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
                      <input
                        type="checkbox"
                        checked={includePressing}
                        onChange={(e) => setIncludePressing(e.target.checked)}
                        className="rounded border-slate-700 text-cyan-500 focus:ring-0 bg-slate-800 h-3.5 w-3.5"
                      />
                      <span>Include Optional Clean &amp; Press ({isVintage ? "+$42.40 incl. tax" : "+$31.80 incl. tax"})</span>
                    </label>
                    <span className="text-[9px] text-slate-400 italic">
                      {includePressing ? "Pressing active on ≤9.4" : "$0.00 default (as-is raw)"}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-1.5 px-2.5 rounded-lg bg-slate-950/60 border border-slate-900 text-[9.5px] text-slate-500">
                    <span className="italic">Clean &amp; Press: Ineligible ($0.00)</span>
                    <span className="font-mono text-[9px] text-slate-400">Top-grade copies (&gt;9.4) are never pressed</span>
                  </div>
                )}

                {/* Buyer Manufacturing Advantage Callout */}
                {(() => {
                  const currentActiveBid = Math.max(currentFloorBid ?? 0, userBid ?? 0, lot.openingBid);
                  const isBelowSlab = currentActiveBid <= analysis.wholeTomato.serviceExpenses;
                  const slabAdvantage = analysis.wholeTomato.serviceExpenses - currentActiveBid;
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
                          ? `Arbitrage Alpha: Bidding $${currentActiveBid} acquires this certified slab for $${slabAdvantage.toFixed(2)} LESS than physical certification costs alone. The comic book inside is acquired with zero capital outlay.`
                          : diyAdvantage > 0
                          ? `Make vs. Buy Advantage: Replicating this certified slab today costs $${wholeTomatoCost.toFixed(2)} (raw comic $${((analysis.wholeTomato.rawStreetValue ?? rawBasis) + (analysis.wholeTomato.rawTax ?? 0)).toFixed(2)} + slabbing fees $${analysis.wholeTomato.serviceExpenses.toFixed(2)} + mailer $5.30). Clearing under $${wholeTomatoCost.toFixed(2)} captures immediate replacement equity.`
                          : `High-Grade Rarity Premium: Grade ${lot.grade} commands equity surplus over DIY manufacturing cost due to low census population density and submitter grade fallout risk.`}
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Broker gets PriceCharting Matrix; Whale gets High Net Worth Float Scarcity Card */}
              {isWhale ? (
                <div className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-[#180E02] via-[#0E0701] to-[#180E02] p-4 font-mono space-y-3 shadow-xl">
                  <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                    <span className="text-amber-300 font-bold uppercase text-[11px] flex items-center gap-1.5">
                      <Crown className="h-3.5 w-3.5 text-amber-400" />
                      <span>Whale Sovereign Float &amp; Asset Stature</span>
                    </span>
                    <span className="text-[10px] text-amber-200/80 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40 font-bold">
                      HNW Allocator Tier
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                    <div className="p-2 rounded bg-black/60 border border-slate-800">
                      <span className="text-slate-400 block text-[9.5px]">Verified Benchmark FMV:</span>
                      <strong className="text-white text-sm font-bold">${lot.fmv.toLocaleString()}</strong>
                    </div>
                    <div className="p-2 rounded bg-black/60 border border-slate-800">
                      <span className="text-slate-400 block text-[9.5px]">Recorded Turnover:</span>
                      <strong className="text-amber-300 text-sm font-bold">{lot.salesVolume ?? 15} sales/yr</strong>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-300 leading-relaxed">
                    Sovereign Grails in {lot.grader} {lot.grade} trade on institutional pedigree resistance. Unlike speculative modern copies, top-tier blue-chip keys are tightly held by trusts and private vaults, creating persistent downside support.
                  </p>
                </div>
              ) : (
                <PriceChartingGradeTable lot={lot} compact={true} />
              )}

              {/* Page 1 Mini Sparkline */}
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

                <button
                  type="button"
                  onClick={() => setActiveTab("financials")}
                  className="w-full text-center py-1.5 px-2 rounded border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:text-white hover:bg-emerald-900/60 hover:border-emerald-400 transition-all text-[10px] font-bold flex items-center justify-center gap-1"
                >
                  <TrendingUp className="h-3 w-3" />
                  <span>Inspect Full 3-Regime Terminal &amp; Ladder (Page 2) →</span>
                </button>
              </div>
            </div>

            {/* Right Column: Keypad, Real-Time Bid Trajectory, Breakeven Card */}
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

              {/* The Cleanly Rewritten SniperBreakevenCard with Role Support */}
              <SniperBreakevenCard
                lot={lot}
                currentBid={Math.max(currentFloorBid ?? 0, userBid ?? 0, lot.openingBid)}
                userRole={role}
              />

              {/* Fiduciary / Whale Underwriting Intel */}
              <div className="rounded-xl border border-slate-800 bg-[#070A11] p-5 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400 uppercase tracking-wider text-[10px]">
                    {isWhale ? "Whale Wealth Mandate" : "Broker Fiduciary Protocol"}
                  </span>
                  <span className="text-cyan-300">Turnover: {lot.salesVolume ?? 15} sales/yr</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {isWhale ? (
                    <span>
                      High-Roller Strategy: You are deploying personal capital into sovereign assets. Watch the comps date ({lot.lastSoldDate || "Contemporary"}) and ensure you do not overpay relative to the consensus value floor.
                    </span>
                  ) : (
                    <span>
                      Fiduciary Protocol: As The Broker, your mandate is strict entry discipline. Verify the raw-to-9.8 spread (${lot.spreadRawTo98 ?? "N/A"}) and avoid chasing emotional momentum.
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

      {/* ── PAGE 2: FINANCIALS & TRADINGVIEW ── */}
      {activeTab === "financials" && (
        <div className="space-y-6">
          <div className="relative rounded-xl border-2 border-emerald-400 bg-gradient-to-r from-[#061C14] via-[#04120D] to-[#061C14] p-5 shadow-[0_0_0_1px_rgba(52,211,153,1),0_0_16px_rgba(16,185,129,0.85),inset_0_1px_2px_rgba(255,255,255,0.35)] ring-1 ring-emerald-300/60 font-mono">
            <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3 mb-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-emerald-300/80">
                  Institutional Technical Terminal
                </span>
                <h3 className="text-lg font-bold text-white">
                  TRADINGVIEW LIGHTWEIGHT CHARTS &amp; SOVEREIGN LADDERS
                </h3>
              </div>
              <span className="rounded bg-emerald-950 border border-emerald-500/40 px-2.5 py-1 text-xs font-bold text-emerald-300">
                100% AUTHENTIC RECORDED COMPS
              </span>
            </div>

            <SniperChart lot={lot} />
          </div>

          <SniperBreakevenCard
            lot={lot}
            currentBid={Math.max(currentFloorBid ?? 0, userBid ?? 0, lot.openingBid)}
            userRole={role}
          />
        </div>
      )}

      {/* ── PAGE 3: STORY, LORE & VIDEOS ── */}
      {activeTab === "story" && (
        <div className="space-y-6">
          <RichContinuityViewer
            summary={lot.summary || lot.title}
            whyInvest={lot.whyInvest || ""}
            series={lot.series || lot.title}
            issueNumber={lot.issueNumber || "1"}
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

          {/* Documentary Context & YouTube Media */}
          <div className="rounded-xl border border-slate-800 bg-[#070A11] p-5 font-mono space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Documentary Reels &amp; Educational Context
                </h3>
              </div>
              <span className="text-[10px] text-slate-400">Verified Curated Video Analysis</span>
            </div>

            {loadingVideos ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Searching verified historical archives...
              </div>
            ) : videoList && videoList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {videoList.map((vid: any) => (
                  <a
                    key={vid.videoId || vid.id}
                    href={`https://www.youtube.com/watch?v=${vid.videoId || vid.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-lg border border-slate-800 bg-black/60 p-3 hover:border-purple-400 transition-all space-y-2"
                  >
                    {vid.thumbnail && (
                      <div className="relative aspect-video rounded overflow-hidden bg-slate-900">
                        <img
                          src={vid.thumbnail}
                          alt={vid.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <h4 className="text-xs font-bold text-white line-clamp-2 group-hover:text-purple-300 transition-colors">
                      {vid.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 line-clamp-2">
                      {vid.description}
                    </p>
                  </a>
                ))}
              </div>
            ) : (
              <div className="py-4 text-xs text-slate-400 text-center">
                Documentary archive index loaded for {lot.title}.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
