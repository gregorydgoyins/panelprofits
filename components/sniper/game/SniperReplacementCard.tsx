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
} from "lucide-react";
import type { LotItem } from "@/lib/sniper/sim/types";
import { calculateReplacementAnalysis } from "@/lib/sniper/sim/encasement-math";

interface SniperReplacementCardProps {
  lot: LotItem;
  currentBid: number;
}

export function SniperReplacementCard({ lot, currentBid }: SniperReplacementCardProps) {
  const [selectedPath, setSelectedPath] = useState<"cpr" | "press_resubmit">("cpr");
  const [useMinimumGradeScreen, setUseMinimumGradeScreen] = useState<boolean>(true);

  const ladder = lot.priceLadder;
  const fmv98 = ladder.grade98 || lot.fmv;
  const fmv96 = ladder.grade96 || Math.round(lot.fmv * 0.45);
  const fmv94 = ladder.grade94 || Math.round(lot.fmv * 0.35);
  const fmv92 = ladder.grade92 || Math.round(lot.fmv * 0.28);
  const rawBasis = lot.estimatedRawBasis || ladder.raw || Math.max(10, Math.round(lot.fmv * 0.15));
  const isVintage = (lot.era || "").includes("golden") || (lot.era || "").includes("silver") || (lot.era || "").includes("bronze");

  const analysis = calculateReplacementAnalysis({
    rawPrice: rawBasis,
    currentBid,
    fmv98,
    fmv96,
    fmv94,
    fmv92,
    isVintage,
    grader: lot.grader,
  });

  const activePathData = selectedPath === "cpr" ? analysis.cpr : analysis.pressResubmit;
  const hope = analysis.hopeFactor;
  const screen = analysis.screenRule;

  // Replacement Cost vs Live Bid
  const replacementCost = activePathData.allInCost;
  const isFrenzyActive = currentBid < replacementCost;
  const buyerArbitrageSavings = replacementCost - currentBid;
  const frenzyThreshold = replacementCost;

  return (
    <div className="relative rounded-xl border-2 border-cyan-400 bg-gradient-to-r from-[#031520] via-[#020D14] to-[#031520] p-5 shadow-[0_0_0_1px_rgba(34,211,238,1),0_0_16px_rgba(6,182,212,0.85),0_0_28px_rgba(8,145,178,0.45),inset_0_1px_2px_rgba(255,255,255,0.35),inset_0_0_10px_rgba(34,211,238,0.25)] ring-1 ring-cyan-300/60 space-y-5 font-mono text-xs">
      {/* Top Radiant Neon Rimlight Flare */}
      <div className="absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_12px_rgba(34,211,238,1)]" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/30 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.6)]">
            <Calculator className="h-4 w-4" />
          </div>
          <div>
            <span className="text-white font-bold text-sm tracking-wider uppercase block">
              Replacement Cost Engine &amp; Bidding Frenzy Driver
            </span>
            <span className="text-[10px] text-cyan-200/70 font-sans">
              Why auctions erupt: Manufacturing a replacement slab from raw is fraught with friction, fees &amp; yield risk.
            </span>
          </div>
        </div>

        {/* Live Frenzy Indicator Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isFrenzyActive ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-400 text-emerald-300 text-[11px] font-bold shadow-[0_0_10px_rgba(16,185,129,0.5)]">
              <Flame className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
              <span>BIDDING FRENZY JUSTIFIED (${buyerArbitrageSavings.toFixed(0)} BELOW REPLACEMENT)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/90 border border-amber-400 text-amber-300 text-[11px] font-bold">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
              <span>MANUFACTURE CEILING REACHED (BID &gt; REPLACEMENT)</span>
            </div>
          )}
        </div>
      </div>

      {/* Path Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-black/40 p-2 rounded-lg border border-cyan-500/20">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[10px] uppercase tracking-wider">Manufacturing Path:</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedPath("cpr")}
              className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all border ${
                selectedPath === "cpr"
                  ? "bg-cyan-900/80 text-white border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              🧼 Clean, Press &amp; Resubmit (CPR)
            </button>
            <button
              type="button"
              onClick={() => setSelectedPath("press_resubmit")}
              className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all border ${
                selectedPath === "press_resubmit"
                  ? "bg-cyan-900/80 text-white border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              🔄 Press &amp; Resubmit
            </button>
          </div>
        </div>

        {/* Screen Rule Toggle */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-[10px] text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={useMinimumGradeScreen}
              onChange={(e) => setUseMinimumGradeScreen(e.target.checked)}
              className="rounded border-cyan-500/40 text-cyan-500 focus:ring-cyan-400 bg-slate-900 h-3.5 w-3.5"
            />
            <span className="font-bold text-cyan-200">Apply &quot;Only Grade If ≥ 9.4&quot; Screen Rule</span>
          </label>
        </div>
      </div>

      {/* The 7-Layer All-In Replacement Formula Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 border-b border-slate-800 pb-1">
          <span className="uppercase tracking-wider text-cyan-300">
            All-In Replacement Cost Formula Breakdown ({activePathData.pathName})
          </span>
          <span className="text-[10px] text-slate-400 font-normal">
            Formula: Raw + {selectedPath === "cpr" ? "CPR Fee" : "Press Fee"} + Grading + Shipping (2-way) + Insurance (2-way) + Invoice + Tax
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-[11px]">
          {/* 1. Raw Purchase */}
          <div className="p-2.5 rounded-lg border border-slate-800 bg-black/50 space-y-1">
            <span className="text-slate-400 text-[9px] uppercase tracking-wider block">1. Raw Purchase</span>
            <div className="text-sm font-bold text-white">${activePathData.rawPrice.toFixed(2)}</div>
            <span className="text-[9px] text-slate-500 block">Ungraded baseline</span>
          </div>

          {/* 2. CPR / Press Fee */}
          <div className="p-2.5 rounded-lg border border-cyan-500/30 bg-cyan-950/20 space-y-1">
            <span className="text-cyan-400 text-[9px] uppercase tracking-wider block">
              2. {selectedPath === "cpr" ? "CPR Fee" : "Pressing Fee"}
            </span>
            <div className="text-sm font-bold text-cyan-200">${activePathData.prepFee.toFixed(2)}</div>
            <span className="text-[9px] text-slate-500 block">{selectedPath === "cpr" ? "Clean & Press" : "Press Only"}</span>
          </div>

          {/* 3. Grading Fee */}
          <div className="p-2.5 rounded-lg border border-slate-800 bg-black/50 space-y-1">
            <span className="text-slate-400 text-[9px] uppercase tracking-wider block">3. {lot.grader} Grading</span>
            <div className="text-sm font-bold text-white">${activePathData.gradingFee.toFixed(2)}</div>
            <span className="text-[9px] text-slate-500 block">{isVintage ? "Vintage Tier" : "Modern Tier"}</span>
          </div>

          {/* 4. Shipping (Both Ways) */}
          <div className="p-2.5 rounded-lg border border-slate-800 bg-black/50 space-y-1">
            <span className="text-slate-400 text-[9px] uppercase tracking-wider block">4. 2-Way Shipping</span>
            <div className="text-sm font-bold text-white">${activePathData.twoWayShipping.toFixed(2)}</div>
            <span className="text-[9px] text-slate-500 block">$25 in + $25 out</span>
          </div>

          {/* 5. Insurance (Both Ways) */}
          <div className="p-2.5 rounded-lg border border-slate-800 bg-black/50 space-y-1">
            <span className="text-slate-400 text-[9px] uppercase tracking-wider block">5. 2-Way Insurance</span>
            <div className="text-sm font-bold text-white">${activePathData.twoWayInsurance.toFixed(2)}</div>
            <span className="text-[9px] text-slate-500 block">Transit protection</span>
          </div>

          {/* 6. Invoice Fee */}
          <div className="p-2.5 rounded-lg border border-slate-800 bg-black/50 space-y-1">
            <span className="text-slate-400 text-[9px] uppercase tracking-wider block">6. CGC Invoice</span>
            <div className="text-sm font-bold text-white">${activePathData.invoiceFee.toFixed(2)}</div>
            <span className="text-[9px] text-slate-500 block">Processing charge</span>
          </div>

          {/* 7. Service Tax */}
          <div className="p-2.5 rounded-lg border border-slate-800 bg-black/50 space-y-1">
            <span className="text-slate-400 text-[9px] uppercase tracking-wider block">7. 7% Tax</span>
            <div className="text-sm font-bold text-white">${activePathData.serviceTax.toFixed(2)}</div>
            <span className="text-[9px] text-slate-500 block">Service tax</span>
          </div>
        </div>

        {/* Sum Total All-In Banner */}
        <div className="p-3 rounded-lg border border-cyan-400/50 bg-gradient-to-r from-cyan-950/60 to-black flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Total All-In Manufacturing Cost
            </span>
            <div className="text-xl font-bold text-cyan-300">
              ${activePathData.allInCost.toFixed(2)}
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <div>
              <span className="text-slate-500 text-[10px] block">Live Auction Bid:</span>
              <span className="font-bold text-white text-base">${currentBid.toLocaleString()}</span>
            </div>
            <ArrowRight className="h-4 w-4 text-cyan-400" />
            <div>
              <span className="text-slate-500 text-[10px] block">Replacement Arbitrage Spread:</span>
              <span className={`font-bold text-base ${isFrenzyActive ? "text-emerald-400" : "text-rose-400"}`}>
                {isFrenzyActive ? `+$${buyerArbitrageSavings.toFixed(2)} (Subsidized)` : `-$${Math.abs(buyerArbitrageSavings).toFixed(2)} (Premium)`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* The Hope Factor: Probabilistic Yield Distribution */}
      <div className="rounded-lg border border-purple-500/40 bg-gradient-to-r from-[#170928] via-[#0D0417] to-[#170928] p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-500/20 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-purple-200 font-bold text-xs uppercase tracking-wider">
              The &quot;Hope Factor&quot; &amp; Raw Submission Yield Risk
            </span>
          </div>
          <span className="text-[10px] text-amber-300 font-sans">
            Dealer Truth: No educated collector can truthfully predict anything over a 9.2 from raw inspection.
          </span>
        </div>

        {/* Yield Probability Distribution */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
          <div className="p-2 rounded bg-black/50 border border-amber-500/30">
            <span className="text-amber-400 font-bold text-xs block">9.8 Mint (15% Odds)</span>
            <span className="text-slate-400 text-[10px] block">${fmv98.toLocaleString()} FMV</span>
            <span className="text-[9px] text-emerald-400">Equity Jackpot</span>
          </div>
          <div className="p-2 rounded bg-black/50 border border-purple-500/30">
            <span className="text-purple-400 font-bold text-xs block">9.6 Near Mint+ (35% Odds)</span>
            <span className="text-slate-400 text-[10px] block">${fmv96.toLocaleString()} FMV</span>
            <span className="text-[9px] text-cyan-400">Standard Target</span>
          </div>
          <div className="p-2 rounded bg-black/50 border border-cyan-500/30">
            <span className="text-cyan-400 font-bold text-xs block">9.4 Near Mint (32% Odds)</span>
            <span className="text-slate-400 text-[10px] block">${fmv94.toLocaleString()} FMV</span>
            <span className="text-[9px] text-slate-400">Breakeven Margin</span>
          </div>
          <div className="p-2 rounded bg-black/50 border border-rose-500/30">
            <span className="text-rose-400 font-bold text-xs block">≤ 9.2 Sub-Grade (18% Odds)</span>
            <span className="text-slate-400 text-[10px] block">${fmv92.toLocaleString()} FMV</span>
            <span className="text-[9px] text-rose-400">Underwater Slabbing Loss</span>
          </div>
        </div>

        {/* Mathematical Expectation (EV) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] border-t border-purple-500/20">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">
              Blended Raw Expected Grade: <strong className="text-white">{hope.expectedGrade}</strong>
            </span>
            <span className="text-slate-400">
              Expected Resale FMV (EV): <strong className="text-white">${hope.expectedValue.toLocaleString()}</strong>
            </span>
          </div>
          <div className="text-slate-300">
            Net Manufacturing Spread (EV - All-In):{" "}
            <strong className={hope.spreadVsAllIn >= 0 ? "text-emerald-400" : "text-rose-400"}>
              {hope.spreadVsAllIn >= 0 ? `+$${hope.spreadVsAllIn.toFixed(2)}` : `-$${Math.abs(hope.spreadVsAllIn).toFixed(2)}`}
            </strong>
          </div>
        </div>
      </div>

      {/* The Minimum Grade Screen / Reject Rule ("Only Grade If >= 9.4") */}
      {useMinimumGradeScreen && (
        <div className="rounded-lg border border-emerald-500/40 bg-gradient-to-r from-[#031D12] via-[#02120B] to-[#031D12] p-4 space-y-2">
          <div className="flex items-center justify-between gap-2 border-b border-emerald-500/20 pb-2">
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-300 font-bold text-xs uppercase tracking-wider">
                CGC Submitter Screen Rule: &quot;Only Grade If ≥ {screen.thresholdGrade}&quot;
              </span>
            </div>
            <span className="text-[9px] bg-emerald-950 text-emerald-200 border border-emerald-500/40 px-2 py-0.5 rounded uppercase">
              Capital Defense Shield
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
            {/* Scenario A: Fails Screen (18% Odds) */}
            <div className="p-2.5 rounded bg-black/40 border border-rose-500/30 space-y-1">
              <div className="flex items-center gap-1.5 text-rose-300 font-bold">
                <XCircle className="h-3.5 w-3.5 text-rose-400" />
                <span>If Comic Evaluates ≤ 9.2 (18% Chance)</span>
              </div>
              <p className="text-[10px] text-slate-300 leading-relaxed">
                CGC cancels encasement. You pay <strong>${screen.invoiceFee} invoice fee + ${screen.rejectFee} reject fee ($14.00 total)</strong> plus shipping.
                You save the <strong>${screen.savedGradingFee.toFixed(2)}</strong> full slabbing charge and avoid holding an unsellable 9.2 slab!
              </p>
            </div>

            {/* Scenario B: Hits or Exceeds 9.4 (82% Odds) */}
            <div className="p-2.5 rounded bg-black/40 border border-emerald-500/30 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>If Comic Hits ≥ 9.4 (82% Chance)</span>
              </div>
              <p className="text-[10px] text-slate-300 leading-relaxed">
                Full encapsulation into certified holder occurs. If it lands at 9.8, you lock in a massive{" "}
                <strong>+${screen.equityWinIfExceeded.toFixed(2)} Equity Win</strong> over your all-in replacement cost!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* The Frenzy Rationale Bottom Line */}
      <div className="p-3 rounded-lg border border-cyan-500/30 bg-black/60 flex items-start gap-2.5 text-[11px] text-slate-300">
        <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-cyan-300 uppercase tracking-wider block">
            Why Bidders Push Up Live Hammer Bids (The Bidding Frenzy Driver)
          </span>
          <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
            Bidders do not bid blindly. When an auction lot has an active bid below <strong>${frenzyThreshold.toFixed(2)}</strong>, bidders recognize that purchasing the existing certified slab removes two-way shipping friction (${activePathData.twoWayShipping}), insurance risks (${activePathData.twoWayInsurance}), turn-around time (6–8 weeks), and the 18% risk of an underwater grade. Buying this certified slab below replacement cost is guaranteed equity!
          </p>
        </div>
      </div>
    </div>
  );
}
