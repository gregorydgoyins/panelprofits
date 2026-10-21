"use client";

import React, { useState, useMemo } from "react";
import {
  calculateLandedEquityReport,
  LandedCostInput,
  GradeEscalatorStep,
} from "@/lib/sniper/landed-equity-engine";

interface LandedEquityCalculatorProps {
  currentListingPrice?: number;
  currentListingGrade?: number;
  isBuyItNow?: boolean;
  benchmarkFmv98?: number;
  benchmarkFmv96?: number;
  benchmarkFmv94?: number;
  benchmarkFmv92?: number;
  year?: number;
  title?: string;
  issue?: string;
  isYellowLabel?: boolean;
  signerName?: string;
}

export function LandedEquityCalculator({
  currentListingPrice = 0,
  currentListingGrade = 9.8,
  isBuyItNow = false,
  benchmarkFmv98 = 0,
  benchmarkFmv96,
  benchmarkFmv94,
  benchmarkFmv92,
  year,
  title,
  issue,
  isYellowLabel = false,
  signerName,
}: LandedEquityCalculatorProps) {
  // Infer sensible initial raw price: if 9.8 FMV is known, raw is typically ~15-25% of 9.8 on modern/vintage keys
  const defaultRawPrice = useMemo(() => {
    if (benchmarkFmv98 > 0) {
      if (benchmarkFmv98 <= 200) return Math.max(20, Math.round(benchmarkFmv98 * 0.35));
      if (benchmarkFmv98 <= 1000) return Math.max(50, Math.round(benchmarkFmv98 * 0.25));
      return Math.round(benchmarkFmv98 * 0.15);
    }
    return currentListingPrice > 0 ? Math.round(currentListingPrice * 0.4) : 100;
  }, [benchmarkFmv98, currentListingPrice]);

  const isVintageBook = year ? year < 1975 : false;

  // Interactive local states (sub-millisecond client-side recalculations)
  const [rawPriceInput, setRawPriceInput] = useState<number>(defaultRawPrice);
  const [isPre1975, setIsPre1975] = useState<boolean>(isVintageBook);
  const [includePressing, setIncludePressing] = useState<boolean>(true);
  const [signatureCount, setSignatureCount] = useState<number>(isYellowLabel ? 1 : 0);
  const [hasRemarque, setHasRemarque] = useState<boolean>(false);
  const [isTaxExempt, setIsTaxExempt] = useState<boolean>(false);
  const [isEliteMember, setIsEliteMember] = useState<boolean>(false);
  const [timeHorizon, setTimeHorizon] = useState<90 | 180 | 365>(90);
  const [selectedChannel, setSelectedChannel] = useState<"auction" | "private" | "lcs" | "ebay">("auction");

  // Run pure arithmetic engine instantly
  const report = useMemo(() => {
    const input: LandedCostInput = {
      rawPrice: rawPriceInput,
      fmv98: benchmarkFmv98 > 0 ? benchmarkFmv98 : (currentListingGrade >= 9.8 ? currentListingPrice : 0),
      fmv96: benchmarkFmv96,
      fmv94: benchmarkFmv94,
      fmv92: benchmarkFmv92,
      isPre1975,
      salesTaxRate: 0.07, // 7.0% Palm Beach County / Boynton Beach FL
      isTaxExempt,
      inboundShipping: 15.0,
      outboundShipping: 15.0, // In-state Sarasota constant
      signatureCount,
      hasRemarque,
      includePressing,
      pressingFee: 20.0,
      isEliteMember,
      timeHorizonDays: timeHorizon,
      monthlyCarryingCost: 10.0,
    };
    return calculateLandedEquityReport(input);
  }, [
    rawPriceInput,
    benchmarkFmv98,
    benchmarkFmv96,
    benchmarkFmv94,
    benchmarkFmv92,
    currentListingPrice,
    currentListingGrade,
    isPre1975,
    isTaxExempt,
    signatureCount,
    hasRemarque,
    includePressing,
    isEliteMember,
    timeHorizon,
  ]);

  // Target step matching the current listing's grade (default to 9.8 if not found)
  const matchedTargetStep = useMemo(() => {
    const exact = report.gradeSteps.find((s) => Math.abs(s.grade - currentListingGrade) < 0.1);
    return exact || report.gradeSteps[report.gradeSteps.length - 1];
  }, [report, currentListingGrade]);

  const targetLandedCost = matchedTargetStep?.totalLandedCost ?? 0;
  const isSlabCheaperThanBuild = currentListingPrice > 0 && targetLandedCost > 0 && currentListingPrice < targetLandedCost;
  const buildVsBuySpread = currentListingPrice > 0 && targetLandedCost > 0 ? targetLandedCost - currentListingPrice : 0;

  return (
    <div className="bg-[#050A14] border-2 border-cyan-500/50 rounded-2xl p-4 sm:p-6 space-y-5 shadow-2xl text-slate-100 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg">🏛️</span>
            <h3 className="text-base sm:text-lg font-black text-white tracking-wide uppercase font-mono">
              Landed Replacement Cost &amp; Realization Escalator
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Build-vs-Buy Underwriting • Sarasota Outbound ($15) • Florida 7% Tax • Dynamic CGC Tiers • 4-Grade Matrix
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
            ⚡ SUB-5MS ENGINE
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-700">
            Boynton Beach In-State Base
          </span>
        </div>
      </div>

      {/* Build-vs-Buy Verdict Card */}
      {currentListingPrice > 0 && targetLandedCost > 0 && (
        <div
          className={`p-3.5 sm:p-4 rounded-xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isSlabCheaperThanBuild
              ? "bg-emerald-950/70 border-emerald-500 text-emerald-100 shadow-[0_0_30px_rgba(16,185,129,0.25)]"
              : "bg-amber-950/60 border-amber-500/80 text-amber-100"
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base">{isSlabCheaperThanBuild ? "🔥" : "⚖️"}</span>
              <strong className="text-xs sm:text-sm uppercase font-mono tracking-wider font-black">
                {isSlabCheaperThanBuild
                  ? `ARBITRAGE: SLAB CHEAPER THAN BUILDING RAW (SAVE $${buildVsBuySpread.toFixed(2)})`
                  : `PREMIUM: ASKING PRICE EXCEEDS RAW BUILD COST`}
              </strong>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-300 font-mono">
              {isSlabCheaperThanBuild ? (
                <>
                  Buying this certified <strong className="text-white">{currentListingGrade.toFixed(1)}</strong> slab at{" "}
                  <strong className="text-emerald-300">${currentListingPrice.toFixed(2)}</strong> is cheaper than sourcing the
                  raw book and paying shipping, Florida tax, CGC grading, and pressing (${targetLandedCost.toFixed(2)} total landed).
                  Zero grading risk and zero 3-month wait.
                </>
              ) : (
                <>
                  This slab asks <strong className="text-white">${currentListingPrice.toFixed(2)}</strong>, while building it
                  from raw is estimated at <strong className="text-amber-300">${targetLandedCost.toFixed(2)}</strong> landed basis.
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 sm:border-l sm:border-slate-800/80 sm:pl-4 shrink-0 font-mono text-xs">
            <div>
              <span className="text-[10px] uppercase text-slate-400 block">Current Asking</span>
              <strong className="text-base text-white font-bold">${currentListingPrice.toFixed(2)}</strong>
            </div>
            <span className="text-slate-500 text-lg">vs</span>
            <div>
              <span className="text-[10px] uppercase text-slate-400 block">Landed Build Cost</span>
              <strong className="text-base text-cyan-300 font-bold">${targetLandedCost.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Upstream Sunk Friction Inputs & Toggles */}
      <div className="bg-black/60 rounded-xl p-4 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
            <span>⚙️</span> Interactive Underwriting Parameters
          </span>
          <span className="text-[11px] font-mono text-cyan-400">
            Instant Real-Time Recalculation
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          {/* Input 1: Raw Purchase Price */}
          <div className="bg-[#070D18] p-3 rounded-lg border border-slate-800 space-y-1">
            <label className="text-[10px] uppercase text-slate-400 block font-bold">
              Raw Purchase Price ($)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-sm">$</span>
              <input
                type="number"
                min={0}
                step={5}
                value={rawPriceInput}
                onChange={(e) => setRawPriceInput(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-black/80 border border-slate-700 rounded px-2.5 py-1 text-white text-sm font-bold focus:outline-none focus:border-cyan-400"
              />
            </div>
            <span className="text-[9px] text-slate-500">Uncertified base purchase</span>
          </div>

          {/* Toggle 2: Pre-1975 Vintage vs Modern */}
          <div className="bg-[#070D18] p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-bold">
                Era &amp; CGC Tier Base
              </span>
              <span className="text-white text-xs font-semibold block mt-0.5">
                {isPre1975 ? "Vintage (Pre-1975, $45 Base)" : "Modern (Post-1975, $30 Base)"}
              </span>
            </div>
            <label className="flex items-center gap-2 text-[11px] text-slate-300 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPre1975}
                onChange={(e) => setIsPre1975(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
              />
              <span>Pre-1975 Vintage ($45 tier)</span>
            </label>
          </div>

          {/* Toggle 3: Professional Pressing */}
          <div className="bg-[#070D18] p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-bold">
                Pre-Grading Prep / Pressing
              </span>
              <span className="text-emerald-400 text-xs font-semibold block mt-0.5">
                {includePressing ? "+$20.00 CGC Pressing" : "Raw / Unpressed ($0)"}
              </span>
            </div>
            <label className="flex items-center gap-2 text-[11px] text-slate-300 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includePressing}
                onChange={(e) => setIncludePressing(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
              />
              <span>Include CGC Pressing ($20)</span>
            </label>
          </div>

          {/* Toggle 4: Tax Exemption / Dealer Resale */}
          <div className="bg-[#070D18] p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-bold">
                Florida Sales Tax Rate
              </span>
              <span className="text-white text-xs font-semibold block mt-0.5">
                {isTaxExempt ? "0.0% (Resale Certificate)" : "7.0% (Palm Beach Surtax)"}
              </span>
            </div>
            <label className="flex items-center gap-2 text-[11px] text-slate-300 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isTaxExempt}
                onChange={(e) => setIsTaxExempt(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
              />
              <span>Dealer Resale (0% Tax)</span>
            </label>
          </div>
        </div>

        {/* Secondary Row: Signatures, Elite Membership, and Holding Horizon */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono pt-1">
          {/* Signature Selector */}
          <div className="bg-[#070D18] p-3 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-slate-400 font-bold">
                Signatures &amp; Witnessing
              </span>
              <span className="text-[10px] text-amber-300 font-bold">
                {signatureCount === 0 ? "Unsigned ($0)" : signatureCount === 1 ? "1 Sig (+$30)" : `${signatureCount} Sigs (+$${30 + 25 * (signatureCount - 1)})`}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {[0, 1, 2, 3].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setSignatureCount(num)}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                    signatureCount === num
                      ? "bg-amber-500 text-slate-950"
                      : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {num === 0 ? "Unsigned" : num === 3 ? "3+ Sigs" : `${num} Sig`}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-[10px] text-slate-400 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={hasRemarque}
                onChange={(e) => setHasRemarque(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
              />
              <span>Artist Remarque / Sketch (+$15)</span>
            </label>
          </div>

          {/* CGC Elite Membership */}
          <div className="bg-[#070D18] p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-bold">
                CGC Membership Tier
              </span>
              <span className="text-white text-xs font-semibold block mt-0.5">
                {isEliteMember ? "Elite (10% Tier Discount)" : "Standard Retail"}
              </span>
            </div>
            <label className="flex items-center gap-2 text-[11px] text-slate-300 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isEliteMember}
                onChange={(e) => setIsEliteMember(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
              />
              <span>CGC Elite Member (10% Off)</span>
            </label>
          </div>

          {/* Holding Horizon */}
          <div className="bg-[#070D18] p-3 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-slate-400 font-bold">
                Holding Horizon ($10/mo)
              </span>
              <span className="text-[10px] text-cyan-300 font-bold">
                ${report.carryingCostTotal.toFixed(2)} Carry
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {([90, 180, 365] as const).map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setTimeHorizon(days)}
                  className={`py-1 rounded text-[11px] font-bold transition text-center ${
                    timeHorizon === days
                      ? "bg-cyan-500 text-slate-950"
                      : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
            <span className="text-[9px] text-slate-500 block">
              Includes insured vaulting &amp; capital drag
            </span>
          </div>
        </div>
      </div>

      {/* Sunk Friction Breakdown Summary */}
      <div className="bg-[#080E1D] border border-cyan-500/30 rounded-xl p-3.5 space-y-2 text-xs font-mono">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
          <span className="text-[11px] uppercase font-bold text-slate-300">
            Sunk Out-of-Pocket Friction (Before CGC Grading Room):
          </span>
          <span className="text-sm font-black text-white">
            ${report.sunkRawBasis.toFixed(2)} Sunk Raw Basis
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-slate-400">
          <span>Raw: <strong className="text-white">${report.rawPurchasePrice.toFixed(2)}</strong></span>
          <span>FL Tax (7%): <strong className="text-white">${report.salesTax.toFixed(2)}</strong></span>
          <span>PayPal (2.99%+$0.49): <strong className="text-white">${report.paypalFriction.toFixed(2)}</strong></span>
          <span>Inbound Ship: <strong className="text-white">${report.inboundShipping.toFixed(2)}</strong></span>
          <span>Sarasota Outbound: <strong className="text-white">${report.outboundShipping.toFixed(2)}</strong></span>
          {report.pressingFriction > 0 && (
            <span>Pressing: <strong className="text-emerald-400">${report.pressingFriction.toFixed(2)}</strong></span>
          )}
        </div>
      </div>

      {/* The Realization Escalator Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div>
            <h4 className="text-xs sm:text-sm font-black text-white uppercase font-mono flex items-center gap-1.5">
              <span>📈</span> The Realization Escalator (Both Wins Ladder)
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              9.2 Base Hit $\rightarrow$ 9.8 Grand Slam Home Run • Calculated Against Landed Basis
            </span>
          </div>

          {/* Liquidation Channel Tabs */}
          <div className="flex items-center gap-1 bg-black/80 p-1 rounded-lg border border-slate-800 text-[10px] font-mono font-bold">
            <span className="text-slate-500 px-1.5">Exit Channel:</span>
            {[
              { id: "auction", label: "Auction (90%)" },
              { id: "private", label: "Private (97%)" },
              { id: "ebay", label: "eBay (85%)" },
              { id: "lcs", label: "LCS Floor (50%)" },
            ].map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => setSelectedChannel(ch.id as any)}
                className={`px-2 py-0.5 rounded transition ${
                  selectedChannel === ch.id
                    ? "bg-cyan-500 text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>
        </div>

        {/* Escalator Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {report.gradeSteps.map((step) => {
            const netRealization =
              selectedChannel === "auction"
                ? step.auctionNet
                : selectedChannel === "private"
                ? step.privateCollectorNet
                : selectedChannel === "ebay"
                ? step.ebayNet
                : step.lcsNet;

            const netDollar = Number((netRealization - step.totalLandedCost).toFixed(2));
            const roi = step.totalLandedCost > 0 ? Number(((netDollar / step.totalLandedCost) * 100).toFixed(1)) : 0;
            const isTargetListing = Math.abs(step.grade - currentListingGrade) < 0.1;

            return (
              <div
                key={step.grade}
                className={`rounded-xl p-3.5 space-y-2.5 border transition ${
                  isTargetListing
                    ? "bg-gradient-to-b from-[#0B1728] to-[#040810] border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                    : "bg-[#070D18] border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-black font-mono text-white block">
                      {step.label}
                    </span>
                    <span className="text-[9px] text-cyan-300 font-mono block">
                      {step.milestone}
                    </span>
                  </div>
                  {isTargetListing && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
                      THIS LOT
                    </span>
                  )}
                </div>

                {/* FMV & Total Landed Cost */}
                <div className="space-y-1 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Market FMV:</span>
                    <strong className="text-white">${step.fmv.toFixed(2)}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">CGC Tier Friction:</span>
                    <span className="text-slate-300">${step.cgcTier.totalGradingFriction.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-bold">Total Landed Basis:</span>
                    <strong className="text-cyan-300 font-bold">${step.totalLandedCost.toFixed(2)}</strong>
                  </div>
                </div>

                {/* Net Cash & ROI Box */}
                <div className="bg-black/80 rounded-lg p-2.5 border border-slate-800/80 space-y-1 font-mono">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 uppercase">Net Realized:</span>
                    <strong className="text-white">${netRealization.toFixed(2)}</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                    <span className="text-[10px] font-bold text-slate-300 uppercase">Net Gain:</span>
                    <strong className={`font-black ${netDollar >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {netDollar >= 0 ? `+$${netDollar.toFixed(2)}` : `-$${Math.abs(netDollar).toFixed(2)}`}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Net ROI:</span>
                    <span className={`font-bold ${roi >= 0 ? "text-emerald-300" : "text-rose-400"}`}>
                      {roi >= 0 ? `+${roi}%` : `${roi}%`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pre-Screen Risk Management Card */}
      <div className="bg-gradient-to-r from-purple-950/40 via-black to-[#070D18] border border-purple-500/40 rounded-xl p-3.5 sm:p-4 space-y-2 text-xs font-mono">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-500/30 pb-2">
          <div className="flex items-center gap-2">
            <span>🛡️</span>
            <span className="font-bold text-purple-300 uppercase">
              CGC Pre-Screen Strategy (9.8 Minimum Grade Shield)
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40 text-[10px] font-bold">
            $9 Reject Fee Floor
          </span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          If submitting raw copies targeting 9.8, setting a <strong>9.8 Pre-Screen</strong> caps your grading loss at only{" "}
          <strong className="text-white">${report.preScreenRejectCost.toFixed(2)}</strong> ($9 reject fee + return ship + invoice) if
          the book misses 9.8. You save <strong className="text-emerald-400">${report.preScreenSavingsVsFullSlab.toFixed(2)}</strong> in
          wasted slabbing fees, the comic stays raw in your hands, and you can recover your raw principal.
        </p>
      </div>
    </div>
  );
}
