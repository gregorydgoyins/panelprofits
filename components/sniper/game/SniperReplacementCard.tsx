"use client";

import React, { useState } from "react";
import {
  Calculator,
  ShieldAlert,
  Flame,
  TrendingUp,
  Percent,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Info,
  DollarSign,
  Truck,
  Shield,
  FileCheck,
  AlertCircle,
} from "lucide-react";
import type { LotItem } from "@/lib/sniper/sim/types";
import { calculateReplacementAnalysis } from "@/lib/sniper/sim/encasement-math";

interface SniperReplacementCardProps {
  lot: LotItem;
  currentBid: number;
}

export function SniperReplacementCard({ lot, currentBid }: SniperReplacementCardProps) {
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
    currentBid,
    lastSoldPrice,
    lotGrade: lot.grade,
    fmv98,
    fmv96,
    fmv94,
    fmv92,
    isVintage,
    isYellowLabel: lot.isYellowLabel,
    signaturesCount: 1,
    grader: lot.grader,
  });

  const { wholeTomato, standard, cpr, hopeFactor, screenRule, isLot98 } = analysis;
  const [activeTab, setActiveTab] = useState<"standard" | "cpr">(
    cpr.isCprEligible ? "cpr" : "standard"
  );

  const activeCostData = activeTab === "cpr" && cpr.isCprEligible ? cpr : standard;

  return (
    <div className="relative rounded-xl border-2 border-cyan-400 bg-gradient-to-r from-[#031520] via-[#020D14] to-[#031520] p-5 shadow-[0_0_0_1px_rgba(34,211,238,1),0_0_16px_rgba(6,182,212,0.85),0_0_28px_rgba(8,145,178,0.45),inset_0_1px_2px_rgba(255,255,255,0.35),inset_0_0_10px_rgba(34,211,238,0.25)] ring-1 ring-cyan-300/60 space-y-5 font-mono text-xs">
      {/* Top Radiant Neon Rimlight Flare */}
      <div className="absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_12px_rgba(34,211,238,1)]" />

      {/* Header: Whole Tomato Intrinsic Value & Eight-Ball Position */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/30 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.6)]">
            <Calculator className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm tracking-wider uppercase block">
                The Whole Tomato — Certified Replacement Cost
              </span>
              <span className="rounded bg-cyan-950 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300 border border-cyan-500/40">
                {lot.grader} {lot.grade}
              </span>
            </div>
            <span className="text-[10px] text-cyan-200/70 font-sans">
              Intrinsic replacement value: How much would it cost to manufacture this comic if you don&apos;t buy it?
            </span>
          </div>
        </div>

        {/* Ahead / Behind the Eight Ball Indicator */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {wholeTomato.isAheadOfEightBall ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-400 text-emerald-300 text-[11px] font-bold shadow-[0_0_10px_rgba(16,185,129,0.5)]">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              <span>AHEAD OF THE EIGHT BALL (+${wholeTomato.eightBallSpread.toFixed(2)})</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/90 border border-rose-400 text-rose-300 text-[11px] font-bold shadow-[0_0_10px_rgba(244,63,94,0.5)]">
              <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
              <span>BEHIND THE EIGHT BALL (-${Math.abs(wholeTomato.eightBallSpread).toFixed(2)})</span>
            </div>
          )}
        </div>
      </div>

      {/* ── THE EIGHT-BALL COMPOSITE SPREAD EQUATION BAR ── */}
      <div className="rounded-xl border border-cyan-500/40 bg-gradient-to-r from-[#021A24] via-[#010E14] to-[#021A24] p-3.5 shadow-lg space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/20 pb-2">
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs uppercase tracking-wider">
            <span>Eight-Ball Valuation Formula:</span>
            <span className="text-white font-mono">
              Whole Tomato (Intrinsic Value) − Last Sold Comp − Current Bid
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-sans">
            Measures your net equity cushion against recent clears and active hammer bid
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-[11px] pt-1">
          {/* Step 1: Whole Tomato Intrinsic Value */}
          <div className="p-2.5 rounded-lg border border-cyan-500/30 bg-black/50">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Whole Tomato Intrinsic Value
            </span>
            <div className="text-base font-bold text-cyan-300">
              ${wholeTomato.wholeTomato.toFixed(2)}
            </div>
            <span className="text-[9px] text-slate-500 block">Raw + All Sunk Expenses</span>
          </div>

          {/* Step 2: Last Sold Comp */}
          <div className="p-2.5 rounded-lg border border-slate-800 bg-black/50">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              − Last Sold Price (Comp)
            </span>
            <div className="text-base font-bold text-amber-300">
              -${wholeTomato.lastSoldPrice.toFixed(2)}
            </div>
            <span className="text-[9px] text-slate-500 block">Observable Market Clearing</span>
          </div>

          {/* Step 3: Current Bid */}
          <div className="p-2.5 rounded-lg border border-slate-800 bg-black/50">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              − Current Auction Bid
            </span>
            <div className="text-base font-bold text-purple-300">
              -${wholeTomato.currentBid.toFixed(2)}
            </div>
            <span className="text-[9px] text-slate-500 block">Active Bidding Level</span>
          </div>

          {/* Step 4: Net Eight-Ball Result */}
          <div className={`p-2.5 rounded-lg border ${wholeTomato.isAheadOfEightBall ? "border-emerald-500/40 bg-emerald-950/30" : "border-rose-500/40 bg-rose-950/30"}`}>
            <span className="text-[10px] uppercase tracking-wider block text-slate-300 font-bold">
              = Net Eight-Ball Spread
            </span>
            <div className={`text-base font-black ${wholeTomato.isAheadOfEightBall ? "text-emerald-400" : "text-rose-400"}`}>
              {wholeTomato.isAheadOfEightBall ? `+$${wholeTomato.eightBallSpread.toFixed(2)}` : `-$${Math.abs(wholeTomato.eightBallSpread).toFixed(2)}`}
            </div>
            <span className={`text-[9px] font-bold block ${wholeTomato.isAheadOfEightBall ? "text-emerald-300" : "text-rose-300"}`}>
              {wholeTomato.isAheadOfEightBall ? "Ahead of Eight Ball" : "Behind Eight Ball"}
            </span>
          </div>
        </div>
      </div>

      {/* ── CLEAN & PRESS (CPR) RULE ENFORCEMENT ── */}
      {isLot98 ? (
        <div className="rounded-lg border border-amber-500/40 bg-amber-950/20 p-3 flex items-start gap-2.5 text-[11px]">
          <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-amber-300 uppercase tracking-wider block">
              ⚠️ CLEAN &amp; PRESS (CPR) DOES NOT APPLY TO A 9.8 — THERE IS NOWHERE TO GO
            </span>
            <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
              You do not clean and press a 9.8 certified comic. A 9.8 is already the practical top-grade pinnacle. CPR is exclusively reserved for sub-9.4 books (e.g., an 8.5 or 9.0) hoping to gain a half-point or a point and a half. The replacement cost below reflects standard raw-to-slab manufacturing.
            </p>
          </div>
        </div>
      ) : cpr.isCprEligible ? (
        <div className="rounded-lg border border-purple-500/40 bg-purple-950/20 p-3 space-y-2 text-[11px]">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-1.5">
            <div className="flex items-center gap-1.5 text-purple-300 font-bold">
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span>CALCULATED CPR CANDIDATE ({lot.grade} → TARGET {cpr.targetBumpGrade})</span>
            </div>
            <span className="text-[9px] bg-purple-900 text-purple-200 px-2 py-0.5 rounded uppercase">
              Calculated Point-Bump Hope
            </span>
          </div>
          <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
            Because this book is a {lot.grade}, cleaning and pressing is a calculated exercise aiming for a <strong>point or point and a half bump</strong> (targeting {cpr.targetBumpGrade} at ${cpr.targetBumpFmv?.toLocaleString()}).
            Pressing expense ($30 CPR + $35 grading + $50 shipping + $15 insurance + $5 invoice) = $139.90.
            Estimated net upgrade benefit: <strong className={cpr.cprNetBenefit && cpr.cprNetBenefit > 0 ? "text-emerald-400" : "text-rose-400"}>${cpr.cprNetBenefit?.toFixed(2)}</strong>.
          </p>
        </div>
      ) : null}

      {/* ── THE 7-LAYER DOCUMENTED REPLACEMENT EXPENSE BREAKDOWN ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 border-b border-slate-800 pb-1">
          <span className="uppercase tracking-wider text-cyan-300">
            Documented Replacement Cost Schedule ({activeCostData.pathName})
          </span>
          <span className="text-[10px] text-slate-400 font-normal">
            Formula: Raw Street Value + Grading + Inbound ($25) + Return ($25) + Insurance ($15) + Invoice ($5) + Tax
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-[11px]">
          {/* 1. Raw Purchase */}
          <div className="p-2.5 rounded-lg border border-slate-800 bg-black/50 space-y-1">
            <span className="text-slate-400 text-[9px] uppercase tracking-wider block">1. Raw Street Value</span>
            <div className="text-sm font-bold text-white">${activeCostData.rawPrice.toFixed(2)}</div>
            <span className="text-[9px] text-slate-500 block">Underlying book</span>
          </div>

          {/* 2. Service/Prep Fee */}
          <div className="p-2.5 rounded-lg border border-cyan-500/30 bg-cyan-950/20 space-y-1">
            <span className="text-cyan-400 text-[9px] uppercase tracking-wider block">2. {activeCostData.prepFeeName}</span>
            <div className="text-sm font-bold text-cyan-200">${activeCostData.prepFee.toFixed(2)}</div>
            <span className="text-[9px] text-slate-500 block">{activeCostData.prepFee > 0 ? "Documented fee" : "None required"}</span>
          </div>

          {/* 3. Grading Fee */}
          <div className="p-2.5 rounded-lg border border-slate-800 bg-black/50 space-y-1">
            <span className="text-slate-400 text-[9px] uppercase tracking-wider block">3. {lot.grader} Grading</span>
            <div className="text-sm font-bold text-white">${activeCostData.gradingFee.toFixed(2)}</div>
            <span className="text-[9px] text-slate-500 block">{isVintage ? "Vintage Tier" : "Modern Tier"}</span>
          </div>

          {/* 4. Inbound + Return Shipping */}
          <div className="p-2.5 rounded-lg border border-slate-800 bg-black/50 space-y-1">
            <span className="text-slate-400 text-[9px] uppercase tracking-wider block">4. 2-Way Shipping</span>
            <div className="text-sm font-bold text-white">${activeCostData.twoWayShipping.toFixed(2)}</div>
            <span className="text-[9px] text-slate-500 block">$25 in + $25 out</span>
          </div>

          {/* 5. Transit Insurance */}
          <div className="p-2.5 rounded-lg border border-slate-800 bg-black/50 space-y-1">
            <span className="text-slate-400 text-[9px] uppercase tracking-wider block">5. 2-Way Insurance</span>
            <div className="text-sm font-bold text-white">${activeCostData.twoWayInsurance.toFixed(2)}</div>
            <span className="text-[9px] text-slate-500 block">Declared transit</span>
          </div>

          {/* 6. Invoice Processing */}
          <div className="p-2.5 rounded-lg border border-slate-800 bg-black/50 space-y-1">
            <span className="text-slate-400 text-[9px] uppercase tracking-wider block">6. CGC Invoice</span>
            <div className="text-sm font-bold text-white">${activeCostData.invoiceFee.toFixed(2)}</div>
            <span className="text-[9px] text-slate-500 block">Standard intake</span>
          </div>

          {/* 7. Service Tax */}
          <div className="p-2.5 rounded-lg border border-slate-800 bg-black/50 space-y-1">
            <span className="text-slate-400 text-[9px] uppercase tracking-wider block">7. 7% Tax</span>
            <div className="text-sm font-bold text-white">${activeCostData.serviceTax.toFixed(2)}</div>
            <span className="text-[9px] text-slate-500 block">Service tax</span>
          </div>
        </div>

        {/* Sum Total & Replacement Advantage Comparison */}
        <div className="p-3 rounded-lg border border-cyan-400/50 bg-gradient-to-r from-cyan-950/60 to-black flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Whole Tomato Replacement Value (Intrinsic Cost)
            </span>
            <div className="text-xl font-bold text-cyan-300">
              ${activeCostData.allInCost.toFixed(2)}
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <div>
              <span className="text-slate-500 text-[10px] block">Live Auction Bid:</span>
              <span className="font-bold text-white text-base">${currentBid.toLocaleString()}</span>
            </div>
            <ArrowRight className="h-4 w-4 text-cyan-400" />
            <div>
              <span className="text-slate-500 text-[10px] block">Whole Tomato Buyer Advantage:</span>
              <span className={`font-bold text-base ${wholeTomato.replacementAdvantage >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {wholeTomato.replacementAdvantage >= 0 ? `+$${wholeTomato.replacementAdvantage.toFixed(2)} Advantage` : `-$${Math.abs(wholeTomato.replacementAdvantage).toFixed(2)} Disadvantage`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── THE HOPE FACTOR: RAW SUBMISSION YIELD RISK & SCREENING RULES ── */}
      <div className="rounded-lg border border-purple-500/40 bg-gradient-to-r from-[#170928] via-[#0D0417] to-[#170928] p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-500/20 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-purple-200 font-bold text-xs uppercase tracking-wider">
              The &quot;Hope Factor&quot; &amp; The Minimum Grade Screen Rule
            </span>
          </div>
          <span className="text-[10px] text-amber-300 font-sans">
            Collector Reality: Nobody can consistently predict over a 9.2 from raw inspection.
          </span>
        </div>

        {/* Probabilistic Yield Curve */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
          <div className="p-2 rounded bg-black/50 border border-amber-500/30">
            <span className="text-amber-400 font-bold text-xs block">9.8 Mint (15% Odds)</span>
            <span className="text-slate-400 text-[10px] block">${fmv98.toLocaleString()} FMV</span>
            <span className="text-[9px] text-emerald-400">Top-Grade Target</span>
          </div>
          <div className="p-2 rounded bg-black/50 border border-purple-500/30">
            <span className="text-purple-400 font-bold text-xs block">9.6 Near Mint+ (35% Odds)</span>
            <span className="text-slate-400 text-[10px] block">${fmv96.toLocaleString()} FMV</span>
            <span className="text-[9px] text-cyan-400">High-Grade Expectation</span>
          </div>
          <div className="p-2 rounded bg-black/50 border border-cyan-500/30">
            <span className="text-cyan-400 font-bold text-xs block">9.4 Near Mint (32% Odds)</span>
            <span className="text-slate-400 text-[10px] block">${fmv94.toLocaleString()} FMV</span>
            <span className="text-[9px] text-slate-400">Minimum Screen Floor</span>
          </div>
          <div className="p-2 rounded bg-black/50 border border-rose-500/30">
            <span className="text-rose-400 font-bold text-xs block">≤ 9.2 Sub-Grade (18% Odds)</span>
            <span className="text-slate-400 text-[10px] block">${fmv92.toLocaleString()} FMV</span>
            <span className="text-[9px] text-rose-400">Reject Screen Trigger</span>
          </div>
        </div>

        {/* CGC Screening Defense Rule */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] pt-1">
          <div className="p-2.5 rounded bg-black/40 border border-rose-500/30 space-y-1">
            <div className="flex items-center gap-1.5 text-rose-300 font-bold">
              <XCircle className="h-3.5 w-3.5 text-rose-400" />
              <span>If Book Scores &lt; 9.4 (18% Risk)</span>
            </div>
            <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
              CGC rejects encapsulation. You pay the <strong>${screenRule.invoiceFee} invoice fee + ${screenRule.rejectFee} reject fee ($14.00 total)</strong> plus shipping.
              You save the ${screenRule.savedGradingFee.toFixed(2)} full slabbing charge and avoid holding an underwater slab!
            </p>
          </div>

          <div className="p-2.5 rounded bg-black/40 border border-emerald-500/30 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>If Book Meets/Beats 9.4 (82% Odds)</span>
            </div>
            <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
              Encapsulation proceeds. If it lands at 9.8, you lock in an <strong>Equity Win</strong> of{" "}
              <strong>+${screenRule.equityWinIfExceeded.toFixed(2)}</strong> over your manufacturing replacement cost.
            </p>
          </div>
        </div>
      </div>

      {/* Rationale: Why Bidders Bid Up This Certified Slab */}
      <div className="p-3 rounded-lg border border-cyan-500/30 bg-black/60 flex items-start gap-2.5 text-[11px] text-slate-300">
        <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-cyan-300 uppercase tracking-wider block">
            Why Bidders Bid Up Certified Slabs (The Bidding Frenzy Driver)
          </span>
          <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
            When an auction lot sits below the Whole Tomato replacement cost (${activeCostData.allInCost.toFixed(2)}), bidding aggressively is 100% rational. The buyer avoids paying two-way shipping ($50), insurance ($15), 6–8 week turnaround drag, and eliminates the 18% hope-factor risk of an underwater grade. Buying this certified slab below replacement cost is locked-in equity!
          </p>
        </div>
      </div>
    </div>
  );
}
