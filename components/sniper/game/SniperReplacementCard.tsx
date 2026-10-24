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
  Package,
  Layers,
  ArrowDown,
  ShieldCheck,
  Globe,
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
  const manufacturingSavings = Math.round((activeCostData.allInCost - currentBid) * 100) / 100;
  const isPositiveAdvantage = manufacturingSavings >= 0;

  // Multi-Source Venues & Consensus Value
  const heritageComp = Math.round(lot.fmv * 1.22);
  const ebayComp = Math.max(15, Math.round(lot.fmv * 0.84));
  const gpaComp = lot.fmv;
  const priceChartingComp = lot.priceLadder?.grade98 || lot.fmv;
  const multisourceValue = Math.round((heritageComp + ebayComp + gpaComp + priceChartingComp) / 4);

  // Dynamic Floating Delta Beneath the Progressing Bid:
  const bidDiffVsMultisource = Math.round((currentBid - multisourceValue) * 100) / 100;
  const bidDiffPctVsMultisource = multisourceValue > 0 ? ((currentBid - multisourceValue) / multisourceValue) * 100 : 0;

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

      {/* ── Strict 9.8 Rule Banner (Nowhere to Go) ── */}
      {isLot98 && (
        <div className="rounded-xl border-2 border-amber-500/80 bg-gradient-to-r from-amber-950/60 via-amber-900/30 to-amber-950/60 p-3 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-amber-300 text-xs tracking-wider uppercase flex items-center gap-1.5">
                <span>⚠️ Clean &amp; Press (CPR) Does Not Apply to a 9.8 — There is Nowhere to Go</span>
              </h4>
              <p className="text-[11px] text-amber-100/90 font-sans leading-relaxed">
                You do not clean and press a 9.8 certified comic. A 9.8 is already the practical top-grade pinnacle. CPR is exclusively reserved for sub-9.4 books (e.g. an 8.5 or 9.0) hoping to gain a half-point or point-and-a-half bump. For a 9.8, your manufacturing baseline is strictly <strong>Standard Certified Replacement</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Calculated Point-Bump Hope for Sub-9.4 Candidates (8.5 / 9.0 / 9.2) ── */}
      {!isLot98 && cpr.isCprEligible && (
        <div className="rounded-xl border-2 border-purple-500/80 bg-gradient-to-r from-purple-950/60 via-purple-900/30 to-purple-950/60 p-3 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
          <div className="flex items-start gap-2.5">
            <Flame className="h-5 w-5 text-purple-300 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-purple-200 text-xs tracking-wider uppercase">
                  Calculated CPR Candidate ({lot.grade} → Target {cpr.targetBumpGrade})
                </h4>
                <span className="rounded bg-purple-950 border border-purple-400 px-1.5 py-0.2 text-[9px] font-bold text-purple-300">
                  Target FMV: ${cpr.targetBumpFmv}
                </span>
              </div>
              <p className="text-[11px] text-purple-100/90 font-sans leading-relaxed">
                Because this book is a {lot.grade}, cleaning and pressing is a calculated exercise aiming for a point or point-and-a-half bump (targeting {cpr.targetBumpGrade} at ${cpr.targetBumpFmv}). Pressing expense ($30 CPR fee + $35 grading + $15 Priority out + $28 return courier + 6% FL tax) = ${activeCostData.sunkExpenses}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ── THE 3 CLEAN VERTICAL BOXES (As Explained: Soundness & Logic) ── */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* Toggle between Standard Universal vs Calculated CPR (if eligible) */}
        {!isLot98 && cpr.isCprEligible && (
          <div className="flex items-center gap-2 p-1 rounded-lg bg-black/60 border border-slate-800 w-fit">
            <button
              type="button"
              onClick={() => setActiveTab("standard")}
              className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                activeTab === "standard"
                  ? "bg-cyan-500 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Standard As-Is Replacement ($85.40 Sunk)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("cpr")}
              className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                activeTab === "cpr"
                  ? "bg-purple-500 text-white shadow-[0_0_8px_rgba(168,85,247,0.6)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🧼 Clean, Press &amp; Resubmit ($117.20 Sunk)
            </button>
          </div>
        )}

        {/* ── BOX 1: THE FACTORY BILL (Sunk Grading & Logistics Expenses) ── */}
        <div className="rounded-xl border-2 border-slate-700 bg-gradient-to-b from-[#0E131F] to-[#070A11] p-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold text-[10px]">
                1
              </span>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                Box 1: The Factory Bill (Sunk Grading &amp; Logistics)
              </h4>
            </div>
            <span className="text-slate-400 text-[10px]">
              Flat non-negotiable costs to certify plastic
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-[11px]">
            {/* 1. Base Tier Grading */}
            <div className="rounded-lg bg-black/50 border border-slate-800 p-2">
              <span className="text-[10px] text-slate-400 block">Tier Grading Fee</span>
              <span className="font-bold text-white text-sm">${activeCostData.gradingFee.toFixed(2)}</span>
              <span className="text-[9px] text-slate-500 block truncate">{lot.grader} {isVintage ? "Vintage" : "Modern"}</span>
            </div>

            {/* 2. CGC Intake Invoice */}
            <div className="rounded-lg bg-black/50 border border-slate-800 p-2">
              <span className="text-[10px] text-slate-400 block">Invoice Fee</span>
              <span className="font-bold text-white text-sm">${activeCostData.invoiceFee.toFixed(2)}</span>
              <span className="text-[9px] text-slate-500 block">CGC Intake</span>
            </div>

            {/* 3. Straight Florida State Sales Tax (6.0%) */}
            <div className="rounded-lg bg-black/50 border border-slate-800 p-2">
              <span className="text-[10px] text-slate-400 block">FL Sales Tax (6.0%)</span>
              <span className="font-bold text-cyan-300 text-sm">${activeCostData.serviceTax.toFixed(2)}</span>
              <span className="text-[9px] text-slate-500 block">Straight FL Tax</span>
            </div>

            {/* 4. Outgoing Priority Mail ($15.00) */}
            <div className="rounded-lg bg-black/50 border border-slate-800 p-2">
              <span className="text-[10px] text-slate-400 block">Outgoing Shipping</span>
              <span className="font-bold text-white text-sm">${activeCostData.outgoingShipping.toFixed(2)}</span>
              <span className="text-[9px] text-slate-500 block">USPS Priority Out</span>
            </div>

            {/* 5. Return Insured Courier ($28.00 base) */}
            <div className="rounded-lg bg-black/50 border border-slate-800 p-2">
              <span className="text-[10px] text-slate-400 block">Return Courier</span>
              <span className="font-bold text-white text-sm">${activeCostData.returnShipping.toFixed(2)}</span>
              <span className="text-[9px] text-slate-500 block">CGC FedEx Base</span>
            </div>
          </div>

          {/* Optional CPR row if active */}
          {activeTab === "cpr" && cpr.isCprEligible && (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-purple-950/40 border border-purple-500/40 text-purple-200 text-[11px]">
              <span>+ Clean &amp; Press (CPR) Preparation Fee:</span>
              <span className="font-bold text-white">${cpr.prepFee.toFixed(2)}</span>
            </div>
          )}

          {/* Box 1 Total Sunk Expense */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 font-bold text-xs">
            <span className="text-slate-300 uppercase">
              = Total Sunk Expense to Certify (Box 1 Floor):
            </span>
            <span className="text-cyan-300 text-sm">
              ${activeCostData.sunkExpenses.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Down Arrow Connector */}
        <div className="flex justify-center -my-1">
          <ArrowDown className="h-4 w-4 text-cyan-400/60" />
        </div>

        {/* ── BOX 2: THE WHOLE TOMATO (Cost to Replicate from Scratch) ── */}
        <div className="rounded-xl border-2 border-amber-500/60 bg-gradient-to-b from-[#1C1204] to-[#0A0701] p-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 font-bold text-[10px]">
                2
              </span>
              <h4 className="font-bold text-amber-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span>🍅 Box 2: The Whole Tomato (Cost to Replicate from Zero)</span>
              </h4>
            </div>
            <span className="text-amber-300/70 text-[10px]">
              Raw Comic Basis + Box 1 Sunk Bill
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
            {/* Raw Basis */}
            <div className="rounded-lg bg-black/60 border border-slate-800 p-2.5">
              <span className="text-slate-400 text-[10px] block">1. Underlying Raw Comic Basis:</span>
              <span className="font-bold text-white text-base">${activeCostData.rawPrice.toFixed(2)}</span>
              <span className="text-[9px] text-slate-500 block">Observable street/market price</span>
            </div>

            {/* Plus Box 1 */}
            <div className="rounded-lg bg-black/60 border border-slate-800 p-2.5">
              <span className="text-slate-400 text-[10px] block">2. Plus Box 1 (Total Sunk Bill):</span>
              <span className="font-bold text-cyan-300 text-base">+${activeCostData.sunkExpenses.toFixed(2)}</span>
              <span className="text-[9px] text-slate-500 block">Grading + FL tax + 2-way shipping</span>
            </div>

            {/* Total Whole Tomato */}
            <div className="rounded-lg bg-amber-950/60 border border-amber-500/60 p-2.5 flex flex-col justify-center">
              <span className="text-amber-300 text-[10px] block font-bold uppercase">Whole Tomato Replacement:</span>
              <span className="font-bold text-amber-200 text-lg">${activeCostData.allInCost.toFixed(2)}</span>
              <span className="text-[9px] text-amber-300/80 block">Your true manufacturing cost</span>
            </div>
          </div>

          {/* ── AT THE END OF BOX 2: Current Multisource Value & Floating Delta Beneath the Progressing Bid ── */}
          <div className="pt-3 border-t border-amber-500/30 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px]">
              <span className="text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-amber-400" />
                <span>Current Multisource Value &amp; Live Bid Position</span>
              </span>
              <span className="text-slate-400 text-[9px]">
                Multi-venue composite benchmark vs progressing auction floor
              </span>
            </div>

            {/* 4 Multi-Source Channels Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              <div className="p-2 rounded bg-black/50 border border-purple-500/30">
                <span className="text-purple-300 block font-bold text-[9px]">Heritage Pedigree</span>
                <span className="text-white font-mono font-bold">${heritageComp.toLocaleString()}</span>
                <span className="text-[8px] text-purple-400/80 block">+22% premium tier</span>
              </div>
              <div className="p-2 rounded bg-black/50 border border-cyan-500/30">
                <span className="text-cyan-300 block font-bold text-[9px]">GoCollect / GPA</span>
                <span className="text-cyan-200 font-mono font-bold">${gpaComp.toLocaleString()}</span>
                <span className="text-[8px] text-cyan-400/80 block">Consensus index</span>
              </div>
              <div className="p-2 rounded bg-black/50 border border-rose-500/30">
                <span className="text-rose-300 block font-bold text-[9px]">eBay Street Floor</span>
                <span className="text-rose-200 font-mono font-bold">${ebayComp.toLocaleString()}</span>
                <span className="text-[8px] text-rose-400/80 block">Liquid spot price</span>
              </div>
              <div className="p-2 rounded bg-amber-950/40 border border-amber-500/50">
                <span className="text-amber-300 block font-bold text-[9px]">Consensus Benchmark</span>
                <span className="text-amber-200 font-mono font-bold">${multisourceValue.toLocaleString()}</span>
                <span className="text-[8px] text-amber-400/80 block">Multi-venue median</span>
              </div>
            </div>

            {/* The Live Progressing Bid with Floating +/- Directly Beneath It */}
            <div className="p-2.5 rounded-lg bg-black/70 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-mono">
                  Current Progressing Floor Bid
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-mono font-black text-white">${currentBid.toLocaleString()}</span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    (Opening ${lot.openingBid.toLocaleString()} · Progressing live)
                  </span>
                </div>
                {/* FLOATING DIRECTLY BENEATH THE BID: Dynamic +/- */}
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[9px] text-slate-400 font-mono">vs Multisource Value:</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono font-black text-[10.5px] ${
                      bidDiffVsMultisource < 0
                        ? "bg-emerald-950/90 border border-emerald-400 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                        : bidDiffVsMultisource === 0
                        ? "bg-cyan-950/90 border border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.3)]"
                        : "bg-rose-950/90 border border-rose-400 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.3)]"
                    }`}
                  >
                    {bidDiffVsMultisource < 0
                      ? `-$${Math.abs(bidDiffVsMultisource).toFixed(2)} (${bidDiffPctVsMultisource.toFixed(1)}%) BELOW MULTISOURCE`
                      : bidDiffVsMultisource === 0
                      ? `±$0.00 (0.0%) AT MULTISOURCE PARITY`
                      : `+$${bidDiffVsMultisource.toFixed(2)} (+${bidDiffPctVsMultisource.toFixed(1)}%) ABOVE MULTISOURCE`}
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right text-[10px] font-mono sm:border-l sm:border-slate-800 sm:pl-3">
                <span className="text-slate-400 block text-[9px]">Manufacturing Gap (Whole Tomato − Multisource):</span>
                <span className={activeCostData.allInCost <= multisourceValue ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                  {activeCostData.allInCost <= multisourceValue
                    ? `+$${(multisourceValue - activeCostData.allInCost).toFixed(2)} DIY Margin`
                    : `-$${(activeCostData.allInCost - multisourceValue).toFixed(2)} Sunk Drag`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Down Arrow Connector */}
        <div className="flex justify-center -my-1">
          <ArrowDown className="h-4 w-4 text-emerald-400/60" />
        </div>

        {/* ── BOX 3: THE AUCTION SNAPSHOT (Your Real Advantage or Sub-Floor Reality Check) ── */}
        {lot.fmv < activeCostData.sunkExpenses ? (
          <div
            className={`rounded-xl border-2 p-4 space-y-3 shadow-xl ${
              currentBid <= Math.max(0, Math.round((lot.fmv * (1 - 0.1325) - 5) * 100) / 100)
                ? "border-emerald-500/80 bg-gradient-to-b from-[#061C12] to-[#020A06]"
                : "border-rose-500/80 bg-gradient-to-b from-[#20070F] to-[#0A0205]"
            }`}
          >
            <div
              className={`flex items-center justify-between border-b pb-2 ${
                currentBid <= Math.max(0, Math.round((lot.fmv * (1 - 0.1325) - 5) * 100) / 100)
                  ? "border-emerald-500/30"
                  : "border-rose-500/30"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full font-bold text-[10px] ${
                    currentBid <= Math.max(0, Math.round((lot.fmv * (1 - 0.1325) - 5) * 100) / 100)
                      ? "bg-emerald-500/20 border border-emerald-400 text-emerald-300"
                      : "bg-rose-500/20 border border-rose-400 text-rose-300"
                  }`}
                >
                  3
                </span>
                <h4
                  className={`font-bold text-xs uppercase tracking-wider ${
                    currentBid <= Math.max(0, Math.round((lot.fmv * (1 - 0.1325) - 5) * 100) / 100)
                      ? "text-emerald-300"
                      : "text-rose-300"
                  }`}
                >
                  Box 3: Sub-Floor Reality Check (Net Liquidation minus Current Bid)
                </h4>
              </div>
              <span
                className={
                  currentBid <= Math.max(0, Math.round((lot.fmv * (1 - 0.1325) - 5) * 100) / 100)
                    ? "text-emerald-300 text-[10px] font-bold"
                    : "text-rose-300 text-[10px] font-bold"
                }
              >
                {currentBid <= Math.max(0, Math.round((lot.fmv * (1 - 0.1325) - 5) * 100) / 100)
                  ? "✅ CLEARANCE SPREAD (BELOW NET LIQUIDATION)"
                  : "💀 DEAD LOSS ALL DAY LONG (OVERPAYING LIQUIDATION)"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center text-[11px]">
              {/* Net Liquidation */}
              <div className="rounded-lg bg-black/60 border border-slate-800 p-2.5">
                <span className="text-slate-400 text-[10px] block">Net Realizable Liquidation:</span>
                <span className="font-bold text-white text-base">
                  ${Math.max(0, Math.round((lot.fmv * (1 - 0.1325) - 5) * 100) / 100).toFixed(2)}
                </span>
                <span className="text-[9px] text-slate-500 block">
                  eBay Net (${Math.max(0, Math.round((lot.fmv * (1 - 0.1325) - 5) * 100) / 100).toFixed(2)}) · LCS Cash (${(lot.fmv * 0.4).toFixed(2)})
                </span>
              </div>

              {/* Minus Live Bid */}
              <div className="rounded-lg bg-black/60 border border-slate-800 p-2.5">
                <span className="text-slate-400 text-[10px] block">Minus Current Auction Bid:</span>
                <span className="font-bold text-cyan-300 text-base">-${currentBid.toFixed(2)}</span>
                <span className="text-[9px] text-slate-500 block">Observable clearing level</span>
              </div>

              {/* Net Liquidation Spread */}
              <div
                className={`rounded-lg p-2.5 border flex flex-col justify-center ${
                  currentBid <= Math.max(0, Math.round((lot.fmv * (1 - 0.1325) - 5) * 100) / 100)
                    ? "bg-emerald-950/80 border-emerald-400 text-emerald-200"
                    : "bg-rose-950/80 border-rose-400 text-rose-200"
                }`}
              >
                <span className="text-[10px] font-bold uppercase block">
                  {currentBid <= Math.max(0, Math.round((lot.fmv * (1 - 0.1325) - 5) * 100) / 100)
                    ? "Net Salvage Margin:"
                    : "Immediate Paper Loss:"}
                </span>
                <span className="font-bold text-lg">
                  {currentBid <= Math.max(0, Math.round((lot.fmv * (1 - 0.1325) - 5) * 100) / 100)
                    ? `+$${(Math.max(0, Math.round((lot.fmv * (1 - 0.1325) - 5) * 100) / 100) - currentBid).toFixed(2)} Salvage Spread`
                    : `-$${(currentBid - Math.max(0, Math.round((lot.fmv * (1 - 0.1325) - 5) * 100) / 100)).toFixed(2)} Dead Loss`}
                </span>
                <span className="text-[9px] block opacity-80">
                  {currentBid <= Math.max(0, Math.round((lot.fmv * (1 - 0.1325) - 5) * 100) / 100)
                    ? "Acquiring below seller cash recovery floor"
                    : "Reselling through secondary channels loses money on fees"}
                </span>
              </div>
            </div>

            {/* Sub-floor reality warning note */}
            <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono">
              <span className="text-amber-300 font-bold block mb-0.5">⚠️ The Sub-Floor Reality Rule:</span>
              <span>
                FMV (${lot.fmv}) is below the ${activeCostData.sunkExpenses.toFixed(2)} factory slabbing bill alone. The submitter took an irreducible loss (-${(activeCostData.allInCost - lot.fmv).toFixed(2)}) and is dumping the slab. DIY replication (${activeCostData.allInCost.toFixed(2)}) is an economic illusion—nobody pays $97 to slab a $31 book. Measure strictly against secondary net liquidation (${Math.max(0, Math.round((lot.fmv * (1 - 0.1325) - 5) * 100) / 100).toFixed(2)}). Bids above this floor are a dead loss all day long!
              </span>
            </div>
          </div>
        ) : (
          <div
            className={`rounded-xl border-2 p-4 space-y-3 shadow-xl ${
              isPositiveAdvantage
                ? "border-emerald-500/80 bg-gradient-to-b from-[#061C12] to-[#020A06]"
                : "border-rose-500/80 bg-gradient-to-b from-[#20070F] to-[#0A0205]"
            }`}
          >
            <div
              className={`flex items-center justify-between border-b pb-2 ${
                isPositiveAdvantage ? "border-emerald-500/30" : "border-rose-500/30"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full font-bold text-[10px] ${
                    isPositiveAdvantage
                      ? "bg-emerald-500/20 border border-emerald-400 text-emerald-300"
                      : "bg-rose-500/20 border border-rose-400 text-rose-300"
                  }`}
                >
                  3
                </span>
                <h4
                  className={`font-bold text-xs uppercase tracking-wider ${
                    isPositiveAdvantage ? "text-emerald-300" : "text-rose-300"
                  }`}
                >
                  Box 3: The Auction Reality Check (Box 2 minus Current Bid)
                </h4>
              </div>
              <span className={isPositiveAdvantage ? "text-emerald-300 text-[10px]" : "text-rose-300 text-[10px]"}>
                {isPositiveAdvantage ? "BUYER ADVANTAGE (LOCKED-IN EQUITY)" : "AUCTION PREMIUM (BID EXCEEDS REPLACEMENT)"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center text-[11px]">
              {/* Box 2 Whole Tomato */}
              <div className="rounded-lg bg-black/60 border border-slate-800 p-2.5">
                <span className="text-slate-400 text-[10px] block">Box 2: Whole Tomato Cost:</span>
                <span className="font-bold text-white text-base">${activeCostData.allInCost.toFixed(2)}</span>
                <span className="text-[9px] text-slate-500 block">Cost to build from scratch</span>
              </div>

              {/* Minus Live Bid */}
              <div className="rounded-lg bg-black/60 border border-slate-800 p-2.5">
                <span className="text-slate-400 text-[10px] block">Minus Current Auction Bid:</span>
                <span className="font-bold text-cyan-300 text-base">-${currentBid.toFixed(2)}</span>
                <span className="text-[9px] text-slate-500 block">Observable clearing level</span>
              </div>

              {/* Net Advantage */}
              <div
                className={`rounded-lg p-2.5 border flex flex-col justify-center ${
                  isPositiveAdvantage
                    ? "bg-emerald-950/80 border-emerald-400 text-emerald-200"
                    : "bg-rose-950/80 border-rose-400 text-rose-200"
                }`}
              >
                <span className="text-[10px] font-bold uppercase block">
                  {isPositiveAdvantage ? "Your Manufacturing Savings:" : "Bidding Frenzy Premium:"}
                </span>
                <span className="font-bold text-lg">
                  {isPositiveAdvantage
                    ? `+$${manufacturingSavings.toFixed(2)} Advantage`
                    : `-$${Math.abs(manufacturingSavings).toFixed(2)} Underwater`}
                </span>
                <span className="text-[9px] block opacity-80">
                  {isPositiveAdvantage ? "Locked-in equity vs DIY slabbing" : "Cheaper to build yourself"}
                </span>
              </div>
            </div>

            {/* 4-Step Eight-Ball Equation */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-400 font-mono">
              <span>
                Eight-Ball Formula: Whole Tomato (${activeCostData.allInCost.toFixed(2)}) − Last Comp (${wholeTomato.lastSoldPrice.toFixed(2)}) − Current Bid (${currentBid.toFixed(2)}) =
              </span>
              <span
                className={`font-bold px-2 py-0.5 rounded ${
                  wholeTomato.isAheadOfEightBall
                    ? "bg-emerald-950 border border-emerald-500 text-emerald-300"
                    : "bg-rose-950 border border-rose-500 text-rose-300"
                }`}
              >
                {wholeTomato.isAheadOfEightBall
                  ? `+$${wholeTomato.eightBallSpread.toFixed(2)} (Ahead)`
                  : `-$${Math.abs(wholeTomato.eightBallSpread).toFixed(2)} (Behind)`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ── 9.8 PRE-SCREEN SAFETY NET & WHY 9.8 RAW IS GAMBLING ────────── */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-700 bg-black/60 p-4 space-y-3 text-[11px]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              The 9.8 Pre-Screen Safety Net &amp; Why Hunting Raw 9.8s is Gambling
            </h4>
          </div>
          <span className="rounded bg-slate-900 border border-slate-700 px-2 py-0.5 text-[9px] font-bold text-slate-300">
            CGC Intake Screen
          </span>
        </div>

        <p className="text-slate-300 font-sans leading-relaxed">
          If submitting raw copies targeting 9.8, setting a <strong>9.8 Pre-Screen</strong> caps your grading loss at only <strong>${screenRule.totalSunkIfRejected.toFixed(2)}</strong> ($9 reject fee + $28 return shipping + $5 invoice + 6% FL tax) if the book misses 9.8. You save <strong>${screenRule.savedGradingFee.toFixed(2)}</strong> in wasted slabbing charges, the comic stays raw in your hands, and you can recover your raw principal.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Reject scenario */}
          <div className="rounded-lg bg-rose-950/30 border border-rose-500/40 p-2.5 space-y-1">
            <span className="text-rose-300 font-bold uppercase text-[10px] block flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              <span>If Book Misses 9.8 (Caps Loss at ~$44)</span>
            </span>
            <p className="text-[10px] text-slate-300 font-sans">
              CGC rejects encapsulation. You pay $9 reject + $5 invoice + $28 return courier ($42.84 total). You save the full slabbing fee and avoid holding an underwater 9.4/9.6 slab!
            </p>
          </div>

          {/* Pass scenario */}
          <div className="rounded-lg bg-emerald-950/30 border border-emerald-500/40 p-2.5 space-y-1">
            <span className="text-emerald-300 font-bold uppercase text-[10px] block flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>Why Buying This Slab Wins</span>
            </span>
            <p className="text-[10px] text-slate-300 font-sans">
              Buying this certified slab below Whole Tomato cost ($&lt;${activeCostData.allInCost.toFixed(2)}) completely eliminates the turnaround delay (6–8 weeks), two-way shipping hassle, and the hope-factor grading risk!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
