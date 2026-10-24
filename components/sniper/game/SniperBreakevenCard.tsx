"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Flame,
  ExternalLink,
  Calculator,
  Receipt,
  Store,
  Layers,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Globe,
  ShieldAlert,
  Crown,
  History,
} from "lucide-react";
import type { LotItem, EncasementFormulaKey, GameRole } from "@/lib/sniper/sim/types";
import { calculateExitScenarios, buildEncasementFormulas } from "@/lib/sniper/sim/encasement-math";

interface SniperBreakevenCardProps {
  lot: LotItem;
  currentBid: number;
  role?: GameRole;
}

export function SniperBreakevenCard({ lot, currentBid, role = "broker" }: SniperBreakevenCardProps) {
  const isWhale = role === "whale";
  const [selectedFormulaKey, setSelectedFormulaKey] = useState<EncasementFormulaKey>(
    lot.activeFormulaKey || (lot.isYellowLabel ? "signature" : "standard")
  );
  const [activeView, setActiveView] = useState<"invoice" | "liquidation">("invoice");
  const [includePressing, setIncludePressing] = useState<boolean>(false);

  const numGrade = parseFloat(lot.grade || "9.8");
  const isHighGrade =
    lot.grade === "9.8" ||
    lot.grade === "10.0" ||
    lot.grade === "9.9" ||
    (!isNaN(numGrade) && numGrade > 9.4);
  const isPressingCandidate = !isHighGrade && !isNaN(numGrade) && numGrade <= 9.4;

  const isVintage =
    (lot.era || "").includes("golden") ||
    (lot.era || "").includes("silver") ||
    (lot.era || "").includes("bronze") ||
    (lot.title || "").includes("198") ||
    (lot.title || "").includes("197") ||
    (lot.title || "").includes("196") ||
    (lot.title || "").includes("195");

  const rawBasis =
    lot.estimatedRawBasis ||
    lot.priceLadder?.raw ||
    Math.max(10, Math.round(lot.fmv * 0.15));

  // Build authentic formulas: $8 online invoice standard, $0 default pressing
  const { formulas } = buildEncasementFormulas({
    grader: (lot.grader as any) || "CGC",
    isVintage,
    estimatedRawBasis: rawBasis,
    isYellowLabel: lot.isYellowLabel,
    creatorName: lot.creatorName,
    signaturesCount: 1,
    grade: lot.grade,
    isLot98: isHighGrade,
    includePressing: isPressingCandidate ? includePressing : false,
  });

  const activeFormula = formulas[selectedFormulaKey] || formulas.standard;

  // Make vs Buy calculations
  const buyerReplacementCost =
    activeFormula.buyerReplacementCost || activeFormula.sellerTotalCostBasis;
  const wholeTomatoAdvantage = buyerReplacementCost - currentBid;
  const slabbingFloorSpread = activeFormula.slabbingCostFloor - currentBid;

  // Multi-Source Venues & Consensus Value
  const heritageComp = Math.round(lot.fmv * 1.22);
  const ebayComp = Math.max(15, Math.round(lot.fmv * 0.84));
  const gpaComp = lot.fmv;
  const priceChartingComp = lot.priceLadder?.grade98 || lot.fmv;
  const multisourceValue = Math.round((heritageComp + ebayComp + gpaComp + priceChartingComp) / 4);

  const bidDiffVsMultisource = Math.round((currentBid - multisourceValue) * 100) / 100;
  const bidDiffPctVsMultisource =
    multisourceValue > 0 ? ((currentBid - multisourceValue) / multisourceValue) * 100 : 0;

  // 4 real-world liquidation exit channels
  const exitScenarios = calculateExitScenarios(lot.fmv, currentBid);

  const lcsOfferFloor = Math.round(lot.fmv * 0.4 * 100) / 100;
  const isBelowLcsFloor = currentBid <= lcsOfferFloor;
  const isBelowSlabFloor = currentBid <= activeFormula.slabbingCostFloor;
  const isOvervalued = currentBid > lot.fmv;
  const isBelowReplacementCost = currentBid < buyerReplacementCost;
  const isSubFloorTrap = lot.fmv < activeFormula.slabbingCostFloor;
  const netEbayLiquidation = Math.max(0, Math.round((lot.fmv * (1 - 0.1325) - 5) * 100) / 100);
  const submitterLoss = Math.round((activeFormula.sellerTotalCostBasis - lot.fmv) * 100) / 100;
  const isDeadLoss = isSubFloorTrap && currentBid > netEbayLiquidation;

  // Stale comp detector for Whale
  const isStaleComp = Boolean(lot.lastSoldDate && (Date.now() - new Date(lot.lastSoldDate).getTime()) > 180 * 86400000);

  return (
    <div
      className={`relative rounded-xl border-2 p-5 font-mono text-xs space-y-4 shadow-2xl ${
        isWhale
          ? "border-amber-400/90 bg-gradient-to-r from-[#180E02] via-[#0E0701] to-[#180E02] shadow-[0_0_0_1px_rgba(251,191,36,0.9),0_0_20px_rgba(245,158,11,0.6),inset_0_1px_2px_rgba(255,255,255,0.25)] ring-1 ring-amber-300/40"
          : "border-cyan-500/80 bg-gradient-to-r from-[#05131E] via-[#030A10] to-[#05131E] shadow-[0_0_0_1px_rgba(6,182,212,0.8),0_0_16px_rgba(6,182,212,0.5),inset_0_1px_2px_rgba(255,255,255,0.25)] ring-1 ring-cyan-300/40"
      }`}
    >
      {/* Top Neon Flare */}
      <div
        className={`absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-transparent to-transparent ${
          isWhale ? "via-amber-300 shadow-[0_0_12px_rgba(251,191,36,1)]" : "via-cyan-300 shadow-[0_0_12px_rgba(6,182,212,1)]"
        }`}
      />

      {/* ── Header: Role Badge, Registry Verification & Cert Lookup ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          {isWhale ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/50 text-amber-300 font-bold text-[10px]">
              <Crown className="h-3.5 w-3.5 text-amber-400" />
              <span>WHALE CAPITAL COCKPIT</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-bold text-[10px]">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
              <span>FIDUCIARY R&amp;D DESK</span>
            </div>
          )}
          <span
            className={`rounded border px-2 py-0.5 font-bold text-[11px] ${
              lot.isYellowLabel
                ? "bg-amber-950/80 border-amber-500/60 text-amber-300"
                : "bg-slate-900 border-slate-800 text-white"
            }`}
          >
            {lot.grader} {lot.grade} {lot.isYellowLabel ? "★ SIGNATURE" : ""}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-[11px]">Cert #:</span>
          <a
            href={lot.certVerificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={`Verify on ${lot.grader} official registry`}
            className="flex items-center gap-1 font-bold text-cyan-300 hover:text-cyan-200 bg-cyan-950/60 border border-cyan-500/40 rounded px-2.5 py-1 text-xs transition-colors"
          >
            <span>{lot.certNumber}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* ── Whale Stale Comp Alert or Valuation Verdict ── */}
      {isOvervalued ? (
        <div className="rounded-lg border border-rose-500/50 bg-rose-950/30 p-3 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-rose-200 space-y-0.5">
            <span className="font-bold text-rose-300 uppercase tracking-wider block">
              ⚠️ OVERVALUED — BID EXCEEDS AUTHENTIC SECONDARY FMV
            </span>
            <span>
              Current bid (${currentBid.toLocaleString()}) exceeds the verified fair market benchmark (${lot.fmv.toLocaleString()}).
              Never overpay based on personal sentiment or unverified upside targets!
            </span>
          </div>
        </div>
      ) : isWhale && isStaleComp ? (
        <div className="rounded-lg border border-amber-500/60 bg-amber-950/40 p-3 flex items-start gap-2.5">
          <History className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-amber-200 space-y-0.5">
            <span className="font-bold text-amber-300 uppercase tracking-wider block">
              ⏳ WHALE INTEL: STALE COMP DATE DETECTED ({lot.lastSoldDate || "2021 Peak"})
            </span>
            <span>
              Last auction transaction occurred over 180 days ago during post-stimulus peak pricing. Exercise high-roller discipline: verify floor liquidity before deploying size.
            </span>
          </div>
        </div>
      ) : isDeadLoss ? (
        <div className="rounded-lg border border-rose-500/80 bg-rose-950/40 p-3 flex items-start gap-2.5 shadow-[0_0_12px_rgba(244,63,94,0.3)]">
          <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-rose-200 space-y-0.5">
            <span className="font-bold text-rose-300 uppercase tracking-wider block">
              💀 SUB-FLOOR SUNK COST SINKHOLE · SELLER DUMP TRAP
            </span>
            <span>
              Secondary market FMV (${lot.fmv}) is below the ${activeFormula.slabbingCostFloor.toFixed(2)} encapsulation bill alone. The previous submitter lost -${submitterLoss.toFixed(2)} (-{Math.round((submitterLoss / activeFormula.sellerTotalCostBasis) * 100)}%). Net eBay liquidation yields ~${netEbayLiquidation.toFixed(2)}. Current bid (${currentBid}) is a dead loss all day long!
            </span>
          </div>
        </div>
      ) : isBelowLcsFloor ? (
        <div className="rounded-lg border border-purple-500/50 bg-purple-950/30 p-3 flex items-start gap-2.5">
          <Sparkles className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-purple-200 space-y-0.5">
            <span className="font-bold text-purple-300 uppercase tracking-wider block">
              💎 LCS WALK-IN CASH ARBITRAGE
            </span>
            <span>
              Current bid (${currentBid.toLocaleString()}) is below the instant Local Comic Shop buy-list cash floor (${lcsOfferFloor.toLocaleString()}).
              Locking in same-day liquidity at an instant positive margin!
            </span>
          </div>
        </div>
      ) : isBelowSlabFloor ? (
        <div className="rounded-lg border border-emerald-500/50 bg-emerald-950/30 p-3 flex items-start gap-2.5">
          <Flame className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-emerald-200 space-y-0.5">
            <span className="font-bold text-emerald-300 uppercase tracking-wider block">
              🔥 BELOW-FACTORY-SLABBING-FLOOR ARBITRAGE
            </span>
            <span>
              Current bid (${currentBid}) is below the factory slabbing bill alone (${activeFormula.slabbingCostFloor.toFixed(2)}).
              Acquiring comic and physical holder for less than encapsulation costs!
            </span>
          </div>
        </div>
      ) : isBelowReplacementCost ? (
        <div className="rounded-lg border border-cyan-500/40 bg-cyan-950/20 p-3 flex items-start gap-2.5">
          <TrendingUp className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-cyan-200 space-y-0.5">
            <span className="font-bold text-cyan-300 uppercase tracking-wider block">
              🛡️ BUYER MANUFACTURING ADVANTAGE (THE WHOLE TOMATO)
            </span>
            <span>
              Current bid is ${(buyerReplacementCost - currentBid).toFixed(2)} below DIY replacement cost (${buyerReplacementCost.toFixed(2)}).
              Avoids raw procurement hunting, $8 online invoice handling, round-trip shipping, and wait delays.
            </span>
          </div>
        </div>
      ) : null}

      {/* ── Encasement Submission Formula Selector ── */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] text-slate-400 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Calculator className="h-3.5 w-3.5 text-cyan-400" />
            <span>Encasement Submission Formula</span>
          </span>
          <span className="text-amber-300 font-semibold text-[9px]">
            Standard ($0 Press) · Signed (Witnessed) · CPR (&le;9.4 Only) · Re-holder (Re-case)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {[
            {
              key: "standard" as const,
              label: "Standard Grade",
              sub: "Blue Label ($0 Press)",
              icon: "📘",
            },
            {
              key: "signature" as const,
              label: "Signature Series",
              sub: "Yellow Label · Witnessed",
              icon: "✍️",
            },
            {
              key: "pressed" as const,
              label: isHighGrade ? "Clean & Press (Ineligible)" : "Clean & Press (CPR)",
              sub: isHighGrade ? "Ineligible on >9.4 ($0)" : "Optional Variable (&le;9.4)",
              icon: "🧼",
            },
            {
              key: "reholder" as const,
              label: "Re-holder / Reslab",
              sub: "Fresh Acrylic Casing",
              icon: "🔄",
            },
          ].map((tier) => {
            const isSelected = selectedFormulaKey === tier.key;
            const formulaData = formulas[tier.key];
            const floor = formulaData?.slabbingCostFloor ?? 0;
            return (
              <button
                key={tier.key}
                type="button"
                onClick={() => setSelectedFormulaKey(tier.key)}
                className={`p-2 rounded-lg border text-left transition-all ${
                  isSelected
                    ? isWhale
                      ? "bg-amber-950/80 border-amber-400 text-white shadow-md ring-1 ring-amber-500/50"
                      : "bg-cyan-950/80 border-cyan-400 text-white shadow-md ring-1 ring-cyan-500/50"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="flex items-center gap-1">
                    <span>{tier.icon}</span>
                    <span className="truncate">{tier.label}</span>
                  </span>
                  {lot.activeFormulaKey === tier.key && (
                    <span className="text-[8px] bg-cyan-900 text-cyan-200 px-1 py-0.2 rounded uppercase shrink-0">
                      Active
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-baseline justify-between text-[11px]">
                  <span className="text-slate-500 text-[9px]">Sunk Floor:</span>
                  <span className="font-bold text-white">${floor.toFixed(2)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Sub-Tab Switcher ── */}
      <div className="flex items-center gap-2 border-b border-slate-800 pt-1 pb-2">
        <button
          type="button"
          onClick={() => setActiveView("invoice")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
            activeView === "invoice"
              ? isWhale
                ? "bg-amber-950/80 text-amber-300 border border-amber-500/40"
                : "bg-slate-800 text-cyan-300 border border-cyan-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Receipt className="h-3.5 w-3.5" />
          <span>1. Buyer DIY Replacement Cost &amp; The Whole Tomato</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveView("liquidation")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
            activeView === "liquidation"
              ? "bg-slate-800 text-emerald-300 border border-emerald-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Store className="h-3.5 w-3.5" />
          <span>2. Liquidation Exit Channels</span>
        </button>
      </div>

      {/* ── VIEW 1: Buyer DIY Replacement Cost & The Whole Tomato (Box 1, 2, 3) ── */}
      {activeView === "invoice" && (
        <div className="space-y-3 pt-1 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* BOX 1: Line-Item Submission Invoice Receipt (Sunk Factory Floor) */}
            <div className="space-y-2 rounded-lg bg-slate-950/80 border border-slate-800/80 p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Receipt className="h-3.5 w-3.5" />
                    <span>Box 1: Sunk Factory Encasement Bill</span>
                  </span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase">
                    {activeFormula.badgeLabel}
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Base Grading Fee ({lot.grader}):</span>
                    <span className="text-white font-bold">${activeFormula.baseGradingFee.toFixed(2)}</span>
                  </div>

                  {/* Clean & Press Variable Line */}
                  {isHighGrade ? (
                    <div className="flex justify-between text-slate-500 text-[10px] italic">
                      <span>Clean &amp; Press (Ineligible on &gt;9.4):</span>
                      <span className="text-slate-400 font-mono">$0.00 (Top-Grade Ceiling)</span>
                    </div>
                  ) : isPressingCandidate ? (
                    <div className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800">
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={includePressing}
                          onChange={(e) => setIncludePressing(e.target.checked)}
                          className="rounded border-slate-700 text-cyan-500 focus:ring-0 bg-slate-800 h-3.5 w-3.5"
                        />
                        <span>Optional Clean &amp; Press ({isVintage ? "+$40.00" : "+$30.00"}):</span>
                      </label>
                      <span className={includePressing ? "text-cyan-300 font-bold" : "text-slate-500"}>
                        {includePressing ? `+$${(isVintage ? 40 : 30).toFixed(2)}` : "$0.00 (Variable)"}
                      </span>
                    </div>
                  ) : activeFormula.pressingFee > 0 ? (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Clean &amp; Press (CCS Pressing):</span>
                      <span className="text-cyan-300 font-bold">+${activeFormula.pressingFee.toFixed(2)}</span>
                    </div>
                  ) : null}

                  {activeFormula.witnessFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Authorized Witness Authentication:</span>
                      <span className="text-amber-300 font-bold">+${activeFormula.witnessFee.toFixed(2)}</span>
                    </div>
                  )}

                  {activeFormula.creatorSigningFee > 0 && (
                    <div className="space-y-0.5">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Creator Signing Fee (Est. Guesstimate):</span>
                        <span className="text-amber-300 font-bold">~${activeFormula.creatorSigningFee.toFixed(2)}</span>
                      </div>
                      <div className="text-[9px] text-amber-300/70 font-sans italic pl-1 leading-tight">
                        * Guesstimate (~$25–$100+); uncertain without verified convention floor pricing.
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-slate-400">Submission Invoice Processing Fee (Online Standard):</span>
                    <span className="text-white font-bold">+$8.00</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Outgoing Shipping (Priority Mail out):</span>
                    <span className="text-white">+$15.00</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Insured Return Courier Shipping ({lot.grader} FedEx/UPS):</span>
                    <span className="text-white">+$28.00</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Florida State Sales Tax ({activeFormula.taxRatePercent}% Sarasota, FL):</span>
                    <span className="text-white">+${activeFormula.serviceTax.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-cyan-300 text-xs">
                    <span>Total Sunk Factory Floor:</span>
                    <span className="text-cyan-200">${activeFormula.slabbingCostFloor.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded bg-cyan-950/30 p-2 text-[10px] text-cyan-300/80 leading-relaxed border border-cyan-800/40">
                <span className="font-bold text-cyan-200 block mb-0.5">🔒 Flat Encasement Consideration:</span>
                <span>
                  Irreducible manufacturing baseline. Even if the raw comic was gifted for free, certified slabbing requires writing this ${activeFormula.slabbingCostFloor.toFixed(2)} check.
                </span>
              </div>
            </div>

            {/* Right Column: BOX 2 & BOX 3 */}
            <div className="space-y-3">
              {/* BOX 2: The Whole Tomato (DIY Buyer Replacement Cost) */}
              <div className="space-y-2 rounded-lg bg-slate-950/80 border border-slate-800/80 p-3.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calculator className="h-3.5 w-3.5" />
                    <span>Box 2: The Whole Tomato (DIY Replication)</span>
                  </span>
                  <span className="text-[9px] text-amber-300/80 font-bold uppercase">
                    Buyer Replacement Cost
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-300">
                  <div className="flex justify-between bg-black/40 p-1.5 rounded border border-slate-800">
                    <div>
                      <span className="text-slate-200 font-bold block">1. Raw Comic Price (Indispensable Basis):</span>
                      <span className="text-[9.5px] text-slate-500">Uncertified market asset foundation</span>
                    </div>
                    <span className="text-white font-extrabold text-sm">${activeFormula.estimatedRawBasis.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">2. Sunk Factory Encasement Bill (Box 1 Floor):</span>
                    <span className="text-cyan-300 font-bold">+${activeFormula.slabbingCostFloor.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">3. Insured Mailer &amp; Packaging:</span>
                    <span className="text-white">+${activeFormula.mailerBoxFee.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-amber-300 text-xs">
                    <span>Total DIY Replacement Cost (The Whole Tomato):</span>
                    <span className="text-amber-200 font-extrabold">${buyerReplacementCost.toFixed(2)}</span>
                  </div>

                  {/* Explicit Formula Recap Pill */}
                  <div className="rounded bg-black/60 border border-amber-500/20 px-2 py-1 text-[9.5px] text-slate-300 flex items-center justify-between">
                    <span className="text-slate-400">Replacement Equation:</span>
                    <span className="font-semibold text-amber-300">
                      Raw (${activeFormula.estimatedRawBasis.toFixed(2)}) + Floor (${activeFormula.slabbingCostFloor.toFixed(2)}) + Box ($5) = ${buyerReplacementCost.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Multisource Value & Floating Delta */}
                <div className="pt-2.5 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-amber-300 font-bold uppercase text-[9px] flex items-center gap-1">
                      <Globe className="h-3 w-3 text-amber-400" />
                      <span>Current Multisource Value:</span>
                    </span>
                    <span className="text-white font-bold">${multisourceValue.toLocaleString()}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-[8.5px] text-center">
                    <div className="p-1 rounded bg-black/40 border border-purple-500/30">
                      <span className="text-purple-300 block font-bold">Heritage</span>
                      <span className="text-white font-bold">${heritageComp.toLocaleString()}</span>
                    </div>
                    <div className="p-1 rounded bg-black/40 border border-cyan-500/30">
                      <span className="text-cyan-300 block font-bold">GoCollect</span>
                      <span className="text-cyan-200 font-bold">${gpaComp.toLocaleString()}</span>
                    </div>
                    <div className="p-1 rounded bg-black/40 border border-rose-500/30">
                      <span className="text-rose-300 block font-bold">eBay Floor</span>
                      <span className="text-rose-200 font-bold">${ebayComp.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="p-2 rounded bg-black/70 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div>
                      <span className="text-slate-400 text-[8.5px] uppercase tracking-wider block">Live Floor Bid</span>
                      <span className="text-white font-bold text-sm">${currentBid.toFixed(2)}</span>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-slate-400 text-[8.5px] block">vs Multisource Value:</span>
                      <span
                        className={`font-bold text-[10px] px-1.5 py-0.2 rounded border inline-block ${
                          bidDiffVsMultisource < 0
                            ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
                            : bidDiffVsMultisource === 0
                            ? "bg-cyan-950/80 border-cyan-500/40 text-cyan-300"
                            : "bg-rose-950/80 border-rose-500/40 text-rose-300"
                        }`}
                      >
                        {bidDiffVsMultisource < 0
                          ? `-$${Math.abs(bidDiffVsMultisource).toFixed(2)} (${bidDiffPctVsMultisource.toFixed(1)}%) BELOW`
                          : bidDiffVsMultisource === 0
                          ? "AT MULTISOURCE PARITY"
                          : `+$${bidDiffVsMultisource.toFixed(2)} (+${bidDiffPctVsMultisource.toFixed(1)}%) ABOVE`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOX 3: Reality Check */}
              {isSubFloorTrap ? (
                <div
                  className={`space-y-2 rounded-lg border p-3.5 ${
                    isDeadLoss
                      ? "bg-rose-950/40 border-rose-500/80 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                      : "bg-emerald-950/40 border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  }`}
                >
                  <div
                    className={`flex items-center justify-between border-b pb-2 ${
                      isDeadLoss ? "border-rose-500/30" : "border-emerald-500/30"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        isDeadLoss ? "text-rose-400" : "text-emerald-400"
                      }`}
                    >
                      <Layers className="h-3.5 w-3.5" />
                      <span>Box 3: Sub-Floor Reality Check</span>
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase ${
                        isDeadLoss ? "text-rose-300" : "text-emerald-300"
                      }`}
                    >
                      Net Liquidation − Current Bid
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Net Realizable Liquidation (eBay Salvage):</span>
                      <span className="text-white font-bold">${netEbayLiquidation.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Auction Hammer Bid:</span>
                      <span className="text-white font-bold">-${currentBid.toFixed(2)}</span>
                    </div>

                    <div
                      className={`flex justify-between border-t pt-1 text-xs font-bold ${
                        isDeadLoss ? "border-rose-500/30 text-rose-400" : "border-emerald-500/30 text-emerald-400"
                      }`}
                    >
                      <span>
                        {isDeadLoss ? "Net Liquidation Deficit:" : "Clearance Salvage Spread:"}
                      </span>
                      <span>
                        {isDeadLoss
                          ? `-$${(currentBid - netEbayLiquidation).toFixed(2)}`
                          : `+$${(netEbayLiquidation - currentBid).toFixed(2)}`}
                      </span>
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>Sunk Loss Incurred by Submitter:</span>
                      <span className="text-rose-400 font-bold">
                        -${submitterLoss.toFixed(2)} (-{Math.round((submitterLoss / activeFormula.sellerTotalCostBasis) * 100)}%)
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 rounded-lg bg-slate-950/80 border border-slate-800/80 p-3.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5" />
                      <span>Box 3: Make vs. Buy Reality Check</span>
                    </span>
                    <span className="text-[9px] text-emerald-300/80 font-bold uppercase">
                      Line 2 − Current Bid
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">The Whole Tomato (DIY Replacement):</span>
                      <span className="text-amber-300 font-bold">${buyerReplacementCost.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Auction Hammer Bid:</span>
                      <span className="text-white font-bold">-${currentBid.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between border-t border-slate-800/80 pt-1 text-xs font-bold">
                      <span className="text-slate-200">Buyer Advantage (Whole Tomato Spread):</span>
                      <span className={wholeTomatoAdvantage >= 0 ? "text-emerald-400" : "text-rose-400"}>
                        {wholeTomatoAdvantage >= 0 ? `+$${wholeTomatoAdvantage.toFixed(2)}` : `-$${Math.abs(wholeTomatoAdvantage).toFixed(2)}`}
                      </span>
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>Current Bid vs. Sunk Factory Floor:</span>
                      <span className={slabbingFloorSpread > 0 ? "text-emerald-400 font-bold" : "text-slate-400"}>
                        {slabbingFloorSpread > 0 ? `-$${slabbingFloorSpread.toFixed(2)} BELOW floor` : `+$${Math.abs(slabbingFloorSpread).toFixed(2)} above floor`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW 2: Real-World Liquidation Channels ── */}
      {activeView === "liquidation" && (
        <div className="space-y-3 pt-1 animate-in fade-in duration-150">
          <div className="text-[10px] text-slate-400 leading-relaxed">
            Liquidation net proceeds calculated against verified FMV (<strong>${lot.fmv.toLocaleString()}</strong>) and current bid (<strong>${currentBid.toLocaleString()}</strong>):
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.values(exitScenarios).map((scenario) => (
              <div
                key={scenario.channelKey}
                className="p-3 rounded-lg border border-slate-800 bg-black/60 space-y-1.5"
              >
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-200">{scenario.name}</span>
                  <span className="text-slate-400 text-[9px]">{scenario.liquidationVelocity}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Gross Valuation:</span>
                  <span className="text-white">${scenario.grossResalePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Platform Cut / Costs:</span>
                  <span className="text-rose-400">-${(scenario.platformFeeAmount + scenario.packagingMailerFee).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold border-t border-slate-800 pt-1 text-emerald-300">
                  <span>Net Payout:</span>
                  <span>${scenario.netProceeds.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[9.5px]">
                  <span className="text-slate-500">Net Profit vs Bid:</span>
                  <span className={scenario.netProfit >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                    {scenario.netProfit >= 0 ? `+$${scenario.netProfit.toLocaleString()}` : `-$${Math.abs(scenario.netProfit).toLocaleString()}`} ({scenario.roiPercent}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
