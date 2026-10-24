"use client";

import React, { useState } from "react";
import type { LotItem, EncasementFormulaKey, EncasementFormulaDetail, GameRole } from "@/lib/sniper/sim/types";
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  DollarSign,
  Flame,
  Globe,
  HelpCircle,
  History,
  Info,
  Maximize2,
  Minimize2,
  Package,
  Receipt,
  Scale,
  Shield,
  Sparkles,
  Store,
  Tag,
  TrendingUp,
  Truck,
  Zap,
  Calculator,
} from "lucide-react";

interface SniperBreakevenCardProps {
  lot: LotItem;
  currentBid: number;
  userRole?: GameRole;
  userLevel?: number;
}

export function SniperBreakevenCard({
  lot,
  currentBid,
  userRole = "broker",
  userLevel = 1,
}: SniperBreakevenCardProps) {
  const [activeFormulaKey, setActiveFormulaKey] = useState<EncasementFormulaKey>(
    lot.activeFormulaKey || (lot.isYellowLabel ? "signature" : "standard")
  );
  const [includePressing, setIncludePressing] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<"invoice" | "liquidation">("invoice");
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const formulas = lot.formulas || {};
  const activeFormula: EncasementFormulaDetail = formulas[activeFormulaKey] || formulas.standard || {
    key: "standard",
    name: "Standard Universal (Auction Baseline)",
    badgeLabel: `${lot.grader} Universal Blue Label`,
    description: "Standard secondary market auction reality.",
    isYellowLabel: false,
    baseGradingFee: 35.0,
    pressingFee: 0,
    witnessFee: 0,
    creatorSigningFee: 0,
    invoiceFee: 8.0,
    serviceTax: 5.16,
    taxRatePercent: 6.0,
    shippingHandlingFee: 43.0,
    slabbingCostFloor: 91.16,
    estimatedRawBasis: 100.0,
    rawTax: 6.0,
    mailerBoxFee: 5.0,
    mailerTax: 0.30,
    totalSalesTax: 11.46,
    sellerTotalCostBasis: 196.46,
    buyerReplacementCost: 196.46,
    venueFeeDragPercent: 13.25,
    breakevenSalePrice: 226.47,
  };

  const isVintage = lot.era ? ["golden", "platinum", "atomic", "silver", "bronze"].includes(lot.era.toLowerCase()) : false;
  const numGrade = parseFloat(lot.grade || "9.8");
  const isHighGrade = lot.grade === "9.8" || lot.grade === "10.0" || lot.grade === "9.9" || (!isNaN(numGrade) && numGrade > 9.4);
  const isPressingCandidate = !isHighGrade && !isNaN(numGrade) && numGrade <= 9.4;

  const rawTaxRate = 0.06;
  const rawPrice = activeFormula.estimatedRawBasis || (lot.priceLadder?.raw ?? Math.max(10, Math.round(lot.fmv * 0.22)));
  const rawTax = Math.round(rawPrice * rawTaxRate * 100) / 100;
  const rawTotalBasis = Math.round((rawPrice + rawTax) * 100) / 100;

  const mailerFee = activeFormula.mailerBoxFee || 5.0;
  const mailerTax = Math.round(mailerFee * rawTaxRate * 100) / 100; // $0.30
  const mailerTotal = Math.round((mailerFee + mailerTax) * 100) / 100; // $5.30

  // Optional CPR pressing dynamically toggled
  const dynamicPressingFee = (isPressingCandidate && includePressing) ? (isVintage ? 40.0 : 30.0) : activeFormula.pressingFee;
  const dynamicPressingTax = Math.round(dynamicPressingFee * rawTaxRate * 100) / 100;

  const slabbingFloor = Math.round(
    (activeFormula.baseGradingFee +
      dynamicPressingFee +
      activeFormula.witnessFee +
      activeFormula.creatorSigningFee +
      activeFormula.invoiceFee +
      activeFormula.shippingHandlingFee +
      activeFormula.serviceTax +
      dynamicPressingTax) *
      100
  ) / 100;

  const buyerReplacementCost = Math.round((rawTotalBasis + slabbingFloor + mailerTotal) * 100) / 100;
  const manufacturingAdvantage = Math.round((buyerReplacementCost - currentBid) * 100) / 100;
  const totalSalesTax = Math.round((rawTax + activeFormula.serviceTax + dynamicPressingTax + mailerTax) * 100) / 100;

  // Arbitrage and condition thresholds
  const isBelowSlabFloor = currentBid < slabbingFloor;
  const isBelowReplacementCost = currentBid < buyerReplacementCost;
  const isWhale = userRole === "whale";
  const isStaleComp = lot.isStaleComp;

  // Multisource consensus comparison
  const heritageComp = Math.round(lot.fmv * 1.12);
  const gpaComp = lot.fmv;
  const ebayComp = Math.round(lot.fmv * 0.91);
  const multisourceValue = Math.round((heritageComp * 0.4 + gpaComp * 0.4 + ebayComp * 0.2));
  const bidDiffVsMultisource = Math.round((currentBid - multisourceValue) * 100) / 100;
  const bidDiffPctVsMultisource = multisourceValue > 0 ? (bidDiffVsMultisource / multisourceValue) * 100 : 0;

  // Dead loss & LCS thresholds
  const isDeadLoss = lot.fmv < slabbingFloor;
  const submitterLoss = Math.max(0, buyerReplacementCost - lot.fmv);
  const netEbayLiquidation = Math.max(0, Math.round((lot.fmv * 0.8675 - 5) * 100) / 100);
  const lcsOfferFloor = Math.round(lot.fmv * 0.40 * 100) / 100;
  const isBelowLcsFloor = currentBid < lcsOfferFloor;

  // 4 authentic submission invoice tiers
  const formulaTiers = [
    {
      key: "standard" as EncasementFormulaKey,
      label: "Standard Universal",
      badge: `${lot.grader} Universal (Auction Baseline)`,
      icon: "📘",
      desc: isHighGrade
        ? "Standard certified submission without pressing ($0 pressing). High-grade >9.4 copies are at the practical ceiling."
        : "Standard certified submission without pressing ($0 pressing standard). Most copies do not warrant pressing.",
    },
    {
      key: "signature" as EncasementFormulaKey,
      label: "Signature Series",
      badge: `${lot.grader} Signature Series (Yellow Label)`,
      icon: "✍️",
      desc: "Witnessed authentic creator signing. Creator fee is an estimated guesstimate (~$25–$100+); uncertain without verified venue pricing.",
    },
    {
      key: "pressed" as EncasementFormulaKey,
      label: "Clean & Press",
      badge: isHighGrade ? "Ineligible on >9.4" : "Optional CPR (≤9.4)",
      icon: "⚡",
      desc: isHighGrade
        ? "Ineligible ($0 pressing): Top-grade copies (>9.4) are never pressed. Pressing risks non-reversible damage with nowhere to go."
        : "Optional variable ($30–$40 pressing). Only select candidates with pressable surface defects justify the fee.",
    },
    {
      key: "reholder" as EncasementFormulaKey,
      label: "Re-holder / Reslab",
      badge: `${lot.grader} Re-holder (Re-case)`,
      icon: "🔄",
      desc: "Fresh acrylic casing replacement for scuffed, scratched, or chipped slabs without altering certified grade.",
    },
  ];

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        isWhale
          ? "bg-gradient-to-b from-slate-950 via-amber-950/20 to-slate-950 border-amber-500/40 shadow-xl"
          : "bg-slate-950/90 border-slate-800 shadow-lg"
      } p-4 text-white space-y-4`}
    >
      {/* ── Card Header ── */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          {isWhale ? (
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Award className="h-5 w-5" />
            </div>
          ) : (
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Scale className="h-5 w-5" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                {isWhale ? "Executive Wealth Cockpit · Sovereign Key Underwriting" : "Fiduciary Underwriting & Cost Basis Accounting"}
              </span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                  isWhale
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                }`}
              >
                {isWhale ? "HNW Capital Allocation" : "Broker Portfolio R&D"}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{lot.title}</span>
              <span className="text-slate-400 text-xs">({lot.grader} {lot.grade})</span>
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
          aria-label={isExpanded ? "Collapse Underwriting Card" : "Expand Underwriting Card"}
        >
          {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      {/* ── Universal Sales Tax Standing Banner ── */}
      <div className="rounded-lg bg-slate-900/90 border border-cyan-500/30 p-2.5 flex items-center justify-between text-[11px] text-slate-300">
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-cyan-400 shrink-0" />
          <span>
            <strong className="text-cyan-300 uppercase tracking-wide">Universal Sales Tax Mandate:</strong>{" "}
            Comics, courier shipping, supplies, and slabbing are tangible goods &amp; services — <strong className="text-amber-300">not tax-exempt food</strong>.
            Florida sales tax (6.0%) applies everywhere across raw purchase, factory encapsulation, and mailer supplies.
          </span>
        </div>
        <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30 whitespace-nowrap ml-2">
          6.0% Everywhere
        </span>
      </div>

      {isExpanded && (
        <>
          {/* ── Dynamic Contextual Warning & Arbitrage Banners ── */}
          {currentBid > lot.fmv ? (
            <div className="rounded-lg border border-rose-500/70 bg-rose-950/30 p-3 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-rose-200 space-y-0.5">
                <span className="font-bold text-rose-300 uppercase tracking-wider block">
                  ⚠️ FIDUCIARY HAZARD: BID EXCEEDS 9.8 FAIR MARKET BENCHMARK
                </span>
                <span>
                  Current bid (${currentBid.toLocaleString()}) exceeds verified fair market benchmark (${lot.fmv.toLocaleString()}).
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
                  Secondary market FMV (${lot.fmv}) is below the ${slabbingFloor.toFixed(2)} encapsulation bill alone. The previous submitter lost -${submitterLoss.toFixed(2)}. Net eBay liquidation yields ~${netEbayLiquidation.toFixed(2)}. Current bid (${currentBid}) is a dead loss all day long!
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
                  Current bid (${currentBid}) is below the factory slabbing bill alone (${slabbingFloor.toFixed(2)}).
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

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {formulaTiers.map((tier) => {
                const isSelected = activeFormulaKey === tier.key;
                const fDetail = formulas[tier.key] || activeFormula;
                const floor = fDetail.slabbingCostFloor || slabbingFloor;

                return (
                  <button
                    key={tier.key}
                    type="button"
                    onClick={() => setActiveFormulaKey(tier.key)}
                    className={`p-2 rounded-lg border text-left transition ${
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

                      <div className="flex justify-between text-cyan-300">
                        <span className="text-slate-400">Sales Tax on Services &amp; Courier (6.0% — Not Food):</span>
                        <span className="font-bold">+${(activeFormula.serviceTax + dynamicPressingTax).toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-cyan-300 text-xs">
                        <span>Total Sunk Factory Floor:</span>
                        <span className="text-cyan-200">${slabbingFloor.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 rounded bg-cyan-950/30 p-2 text-[10px] text-cyan-300/80 leading-relaxed border border-cyan-800/40">
                    <span className="font-bold text-cyan-200 block mb-0.5">🔒 Flat Encasement Consideration:</span>
                    <span>
                      Irreducible manufacturing baseline. Even if the raw comic was gifted for free, certified slabbing requires writing this ${slabbingFloor.toFixed(2)} check.
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
                      <div className="bg-black/40 p-2 rounded border border-slate-800 space-y-1">
                        <div className="flex justify-between items-baseline">
                          <div>
                            <span className="text-slate-200 font-bold block">1. Raw Comic Price (Indispensable Basis):</span>
                            <span className="text-[9.5px] text-slate-500">Uncertified market asset foundation</span>
                          </div>
                          <span className="text-white font-extrabold text-sm">${rawPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-amber-300/80 pt-0.5 border-t border-slate-800/60">
                          <span>+ Sales Tax on Raw Purchase (6.0% — Not Food):</span>
                          <span className="font-semibold">+${rawTax.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400">2. Sunk Factory Encasement Bill (Box 1 Floor with Tax):</span>
                        <span className="text-cyan-300 font-bold">+${slabbingFloor.toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between items-baseline">
                        <span className="text-slate-400">3. Insured Mailer &amp; Packaging Supplies ($5 + $0.30 Tax):</span>
                        <span className="text-white font-bold">+${mailerTotal.toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-amber-300 text-xs">
                        <span>Total DIY Replacement Cost (The Whole Tomato):</span>
                        <span className="text-amber-200 font-extrabold">${buyerReplacementCost.toFixed(2)}</span>
                      </div>

                      {/* Explicit Formula Recap Pill */}
                      <div className="rounded bg-black/60 border border-amber-500/20 px-2 py-1 text-[9px] text-slate-300 flex items-center justify-between">
                        <span className="text-slate-400">Total Sales Tax Everywhere (6%):</span>
                        <span className="font-semibold text-amber-300">
                          ${totalSalesTax.toFixed(2)} (Raw ${rawTax.toFixed(2)} + Slabbing ${(activeFormula.serviceTax + dynamicPressingTax).toFixed(2)} + Box ${mailerTax.toFixed(2)})
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

                  {/* BOX 3: Live Auction Reality Check (Ahead vs Behind the 8-Ball) */}
                  <div className="rounded-lg bg-slate-950/80 border border-slate-800/80 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                        <Tag className="h-3.5 w-3.5" />
                        <span>Box 3: Manufacturing Advantage</span>
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          manufacturingAdvantage > 0
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        }`}
                      >
                        {manufacturingAdvantage > 0 ? "Ahead of the 8-Ball" : "Behind the 8-Ball"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Live Auction Advantage:</span>
                      <span className={`font-bold ${manufacturingAdvantage > 0 ? "text-emerald-300" : "text-rose-400"}`}>
                        {manufacturingAdvantage > 0 ? `+$${manufacturingAdvantage.toFixed(2)} SAVED` : `-$${Math.abs(manufacturingAdvantage).toFixed(2)} OVERPAY`}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 leading-snug">
                      {manufacturingAdvantage > 0
                        ? `Buying this certified slab right now at $${currentBid.toFixed(2)} saves $${manufacturingAdvantage.toFixed(2)} compared to acquiring the raw comic, paying round-trip courier shipping, and enduring CGC turnaround delays.`
                        : `Current bid ($${currentBid.toFixed(2)}) is higher than replicating the book from scratch ($${buyerReplacementCost.toFixed(2)}). You are paying a convenience premium to bypass the submission pipeline.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── VIEW 2: Liquidation Exit Channels ── */}
          {activeView === "liquidation" && (
            <div className="space-y-3 pt-1 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {Object.entries(lot.exitScenarios || {}).map(([key, exit]) => {
                  const isEbay = key === "marketplace";
                  const isCollector = key === "collector";
                  const isLcs = key === "lcs";
                  const isAuction = key === "auction";

                  const netProceeds = exit.netProceeds || 0;
                  const profit = Math.round((netProceeds - buyerReplacementCost) * 100) / 100;
                  const roi = buyerReplacementCost > 0 ? Math.round((profit / buyerReplacementCost) * 1000) / 10 : 0;

                  return (
                    <div
                      key={key}
                      className={`p-3 rounded-lg border flex flex-col justify-between ${
                        isCollector
                          ? "bg-emerald-950/30 border-emerald-500/40"
                          : isEbay
                          ? "bg-cyan-950/30 border-cyan-500/40"
                          : isAuction
                          ? "bg-purple-950/30 border-purple-500/40"
                          : "bg-slate-900/60 border-slate-800"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-bold pb-1.5 border-b border-slate-800 mb-2">
                          <span className="truncate">{exit.name}</span>
                          <span className="text-[9px] text-slate-400 uppercase">{exit.liquidationVelocity}</span>
                        </div>

                        <div className="space-y-1 text-[11px]">
                          <div className="flex justify-between text-slate-400">
                            <span>Gross Valuation:</span>
                            <span className="text-white">${exit.grossResalePrice?.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Fee / Haircut:</span>
                            <span className="text-rose-400">
                              {exit.platformFeeRatePercent > 0 ? `-${exit.platformFeeRatePercent}%` : isLcs ? "-60% Wholesale" : "$0.00"}
                            </span>
                          </div>
                          <div className="flex justify-between font-bold pt-1 border-t border-slate-800">
                            <span className="text-slate-300">Net Realized Cash:</span>
                            <span className="text-white">${netProceeds.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">vs Replacement:</span>
                        <span className={`font-bold ${profit >= 0 ? "text-emerald-300" : "text-rose-400"}`}>
                          {profit >= 0 ? `+$${profit.toFixed(2)} (+${roi}%)` : `-$${Math.abs(profit).toFixed(2)} (${roi}%)`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
