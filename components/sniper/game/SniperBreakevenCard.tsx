"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Flame,
  ExternalLink,
  Calculator,
  DollarSign,
  Receipt,
  Store,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  Sparkles,
  Globe,
  ShieldAlert,
} from "lucide-react";
import type { LotItem, EncasementFormulaKey } from "@/lib/sniper/sim/types";
import { calculateExitScenarios } from "@/lib/sniper/sim/encasement-math";
import { LandedEquityCalculator } from "@/components/sniper/LandedEquityCalculator";

interface SniperBreakevenCardProps {
  lot: LotItem;
  currentBid: number;
}

export function SniperBreakevenCard({ lot, currentBid }: SniperBreakevenCardProps) {
  const [selectedFormulaKey, setSelectedFormulaKey] = useState<EncasementFormulaKey>(
    lot.activeFormulaKey || (lot.isYellowLabel ? "signature" : "standard")
  );
  const [activeView, setActiveView] = useState<"invoice" | "liquidation" | "escalator">("invoice");

  // Retrieve active formula (or fallback to standard universal auction baseline)
  const activeFormula = lot.formulas?.[selectedFormulaKey] || lot.formulas?.standard || {
    key: selectedFormulaKey,
    name: "Standard Universal (Auction Baseline)",
    badgeLabel: `${lot.grader} Universal Blue Label (Auction Standard)`,
    description: "Standard secondary market auction reality. Encapsulated as-is without pressing.",
    isYellowLabel: false,
    baseGradingFee: lot.baseGradingFee,
    pressingFee: lot.pressingFee,
    witnessFee: lot.witnessFee || 0,
    creatorSigningFee: lot.creatorSigningFee || 0,
    invoiceFee: lot.invoiceFee || 5.0,
    serviceTax: lot.serviceTax || 2.40,
    taxRatePercent: 6.0,
    shippingHandlingFee: lot.shippingHandlingFee || 43.0,
    slabbingCostFloor: lot.slabbingCostFloor,
    estimatedRawBasis: lot.estimatedRawBasis,
    mailerBoxFee: 5.0,
    sellerTotalCostBasis: lot.sellerTotalCostBasis,
    buyerReplacementCost: lot.buyerReplacementCost || lot.sellerTotalCostBasis,
    venueFeeDragPercent: 13.25,
    breakevenSalePrice: lot.breakevenSalePrice,
  };

  // Canonical Buyer DIY Replacement Calculations (Make vs. Buy)
  const buyerReplacementCost = activeFormula.buyerReplacementCost || activeFormula.sellerTotalCostBasis;
  const wholeTomatoAdvantage = buyerReplacementCost - currentBid;
  const slabbingFloorSpread = activeFormula.slabbingCostFloor - currentBid;
  const eightBallCushion = lot.fmv - currentBid;

  // Multi-Source Venues & Consensus Value
  const heritageComp = Math.round(lot.fmv * 1.22);
  const ebayComp = Math.max(15, Math.round(lot.fmv * 0.84));
  const gpaComp = lot.fmv;
  const priceChartingComp = lot.priceLadder?.grade98 || lot.fmv;
  const multisourceValue = Math.round((heritageComp + ebayComp + gpaComp + priceChartingComp) / 4);

  // Dynamic Floating Delta Beneath the Progressing Bid:
  const bidDiffVsMultisource = Math.round((currentBid - multisourceValue) * 100) / 100;
  const bidDiffPctVsMultisource = multisourceValue > 0 ? ((currentBid - multisourceValue) / multisourceValue) * 100 : 0;

  // Re-calculate the 4 real-world liquidation exit channels against the current active bid
  const exitScenarios = calculateExitScenarios(lot.fmv, currentBid);

  // Valuation Verdict & Arbitrage Conditions
  const lcsOfferFloor = Math.round(lot.fmv * 0.40 * 100) / 100;
  const isBelowLcsFloor = currentBid <= lcsOfferFloor;
  const isBelowSlabFloor = currentBid <= activeFormula.slabbingCostFloor;
  const isOvervalued = currentBid > lot.fmv;
  const isBelowReplacementCost = currentBid < buyerReplacementCost;
  const isSubFloorTrap = lot.fmv < activeFormula.slabbingCostFloor;
  const netEbayLiquidation = Math.max(0, Math.round((lot.fmv * (1 - 0.1325) - 5) * 100) / 100);
  const submitterLoss = Math.round((activeFormula.sellerTotalCostBasis - lot.fmv) * 100) / 100;
  const isDeadLoss = isSubFloorTrap && currentBid > netEbayLiquidation;

  return (
    <div className="relative rounded-xl border-2 border-amber-400 bg-gradient-to-r from-[#1E1103] via-[#100902] to-[#1E1103] p-5 shadow-[0_0_0_1px_rgba(251,191,36,1),0_0_16px_rgba(245,158,11,0.85),0_0_28px_rgba(217,119,6,0.45),inset_0_1px_2px_rgba(255,255,255,0.35),inset_0_0_10px_rgba(251,191,36,0.25)] ring-1 ring-amber-300/60 space-y-4 font-mono text-xs">
      {/* Top Radiant Neon Rimlight Flare */}
      <div className="absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_12px_rgba(251,191,36,1)]" />

      {/* ── Top Header: Registry Verification & Official Cert Lookup ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/30 pb-3">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span className="text-slate-400 uppercase text-[10px] tracking-wider">
            Verified Registry Slab
          </span>
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
          <span className="text-slate-400 text-[11px]">Cert #:</span>
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

      {/* ── Valuation Alert Verdict ── */}
      {isOvervalued ? (
        <div className="rounded-lg border border-rose-500/50 bg-rose-950/30 p-3 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-rose-200 space-y-0.5">
            <span className="font-bold text-rose-300 uppercase tracking-wider block">
              ⚠️ OVERVALUED — DO NOT BUY AT THIS PRICE
            </span>
            <span>
              Current bid (${currentBid.toLocaleString()}) exceeds the verified fair market value (${lot.fmv.toLocaleString()}).
              A comic does not become worth more because an investor wants a return. Never invent higher resale targets to justify an overpayment!
            </span>
          </div>
        </div>
      ) : isDeadLoss ? (
        <div className="rounded-lg border border-rose-500/80 bg-rose-950/40 p-3 flex items-start gap-2.5 shadow-[0_0_12px_rgba(244,63,94,0.3)]">
          <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-rose-200 space-y-0.5">
            <span className="font-bold text-rose-300 uppercase tracking-wider block">
              💀 SUB-FLOOR SUNK COST SINKHOLE · SELLER DUMP TRAP (DEAD LOSS)
            </span>
            <span>
              Secondary market FMV (${lot.fmv}) is far below the ${activeFormula.slabbingCostFloor.toFixed(2)} factory slabbing bill alone. The previous submitter took an estimated -${submitterLoss.toFixed(2)} (-{Math.round((submitterLoss / activeFormula.sellerTotalCostBasis) * 100)}%) loss and is dumping this slab to salvage cash. Replicating this slab for ${buyerReplacementCost.toFixed(2)} is an irrational act. Net liquidation exit yields only ~${netEbayLiquidation.toFixed(2)} on eBay (or ${lcsOfferFloor.toFixed(2)} LCS cash). Current bid (${currentBid}) exceeds net liquidation—this is a dead loss all day long!
            </span>
          </div>
        </div>
      ) : isBelowLcsFloor ? (
        <div className="rounded-lg border border-purple-500/50 bg-purple-950/30 p-3 flex items-start gap-2.5">
          <Sparkles className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-purple-200 space-y-0.5">
            <span className="font-bold text-purple-300 uppercase tracking-wider block">
              💎 LCS BULLETPROOF FLOOR ARBITRAGE
            </span>
            <span>
              Current bid (${currentBid.toLocaleString()}) is below the instant Local Comic Shop buy-list cash floor (${lcsOfferFloor.toLocaleString()}).
              You can liquidate this slab for same-day walk-in cash and lock in an immediate positive spread!
            </span>
          </div>
        </div>
      ) : isSubFloorTrap ? (
        <div className="rounded-lg border border-emerald-500/50 bg-emerald-950/30 p-3 flex items-start gap-2.5">
          <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-emerald-200 space-y-0.5">
            <span className="font-bold text-emerald-300 uppercase tracking-wider block">
              ✅ CLEARANCE LIQUIDATION SPREAD CAPTURED
            </span>
            <span>
              Current bid (${currentBid}) is below net eBay liquidation proceeds (${netEbayLiquidation.toFixed(2)}).
              You acquire this slab below secondary salvage cash recovery value.
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
              On this verified asset, you acquire the comic and holder for less than physical certification costs—saving ${(activeFormula.slabbingCostFloor - currentBid).toFixed(2)} before accounting for the raw book itself!
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
              Bid is ${(buyerReplacementCost - currentBid).toFixed(2)} below your DIY replication cost (${buyerReplacementCost.toFixed(2)}).
              Acquiring this certified slab avoids ${(buyerReplacementCost - currentBid).toFixed(2)} in out-of-pocket DIY replication and submission friction.
            </span>
          </div>
        </div>
      ) : null}

      {/* ── Formula Selection Bar (Auction Reality vs Hypothetical Exercises) ── */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] text-slate-400 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Calculator className="h-3.5 w-3.5 text-cyan-400" />
            <span>Submission Encasement Formula (Select To Inspect)</span>
          </span>
          <span className="text-amber-300 font-semibold text-[9px]">
            Standard = Auction Baseline · Signed = Separate Math · CPR &amp; Reholder = Hypothetical
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {(
            [
              {
                key: "standard",
                label: "Standard Grade",
                sub: "Blue Label ($62) · As Listed",
                icon: "📘",
                isHypothetical: false,
              },
              {
                key: "signature",
                label: "Signature Series",
                sub: "Yellow Label ($141) · Witnessed",
                icon: "✍️",
                isHypothetical: false,
              },
              {
                key: "pressed",
                label: "Clean & Press (CPR)",
                sub: "Hypothetical CPR ($89) · 8.5/9.2",
                icon: "🧼",
                isHypothetical: true,
              },
              {
                key: "reholder",
                label: "Re-holder / Reslab",
                sub: "Hypothetical Case ($57) · Re-case",
                icon: "🔄",
                isHypothetical: true,
              },
            ] as const
          ).map((tier) => {
            const isSelected = selectedFormulaKey === tier.key;
            const formulaData = lot.formulas?.[tier.key];
            const floor = formulaData?.slabbingCostFloor ?? 0;
            return (
              <button
                key={tier.key}
                type="button"
                onClick={() => setSelectedFormulaKey(tier.key)}
                className={`p-2 rounded-lg border text-left transition-all ${
                  isSelected
                    ? "bg-cyan-950/80 border-cyan-400 text-white shadow-md ring-1 ring-cyan-500/50"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="flex items-center gap-1">
                    <span>{tier.icon}</span>
                    <span className="truncate">{tier.label}</span>
                  </span>
                  {lot.activeFormulaKey === tier.key ? (
                    <span className="text-[8px] bg-cyan-900 text-cyan-200 px-1 py-0.2 rounded uppercase shrink-0">
                      Active
                    </span>
                  ) : tier.isHypothetical ? (
                    <span className="text-[7.5px] bg-amber-950/80 text-amber-300 border border-amber-500/40 px-1 py-0.2 rounded uppercase shrink-0">
                      Hypothetical
                    </span>
                  ) : null}
                </div>
                <div className="mt-1 flex items-baseline justify-between text-[11px]">
                  <span className="text-slate-500 text-[9px]">Sunk Floor:</span>
                  <span className="font-bold text-white">${floor.toFixed(2)}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="text-[10px] text-slate-400 bg-black/40 px-2.5 py-1.5 rounded border border-slate-800 leading-relaxed">
          <strong className="text-slate-200">Auctions Reality Note:</strong> Standard Universal is how secondary market auctions usually go. Signed books carry separate witness/creator mathematics. Clean &amp; Press (CPR) and Re-holder are hypothetical exercises modeling potential buyer actions (e.g. what could happen if an 8.5 or 9.2 turns in favor of the buyer, or a cracked case needs a fresh slab).
        </div>
      </div>

      {/* ── Sub-Tab Switcher: Invoice Receipt vs 4 Liquidation Channels ── */}
      <div className="flex items-center gap-2 border-b border-slate-800 pt-1 pb-2">
        <button
          type="button"
          onClick={() => setActiveView("invoice")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
            activeView === "invoice"
              ? "bg-slate-800 text-cyan-300 border border-cyan-500/40"
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
          <span>2. Liquidation (4 Channels)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveView("escalator")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
            activeView === "escalator"
              ? "bg-slate-800 text-amber-300 border border-amber-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          <span>3. Hypothetical CPR Escalator (8.5/9.2 → 9.8)</span>
        </button>
      </div>

      {/* ── VIEW 1: Buyer DIY Replacement Cost & The Whole Tomato (Box 1, 2, 3) ── */}
      {activeView === "invoice" && (
        <div className="space-y-3 pt-1 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column: BOX 1 - Line-Item Submission Invoice Receipt (The Sunk Slabbing Floor) */}
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

                  {activeFormula.pressingFee > 0 ? (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Clean &amp; Press (CCS Pressing):</span>
                      <span className="text-cyan-300 font-bold">+${activeFormula.pressingFee.toFixed(2)}</span>
                    </div>
                  ) : (lot.grade === "9.8" || lot.grade === "10.0" || lot.grade === "9.9") ? (
                    <div className="flex justify-between text-slate-500 text-[10px] italic">
                      <span>Clean &amp; Press (Omitted on 9.8):</span>
                      <span className="text-slate-400 font-mono">$0.00 (Practical Ceiling)</span>
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
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">Creator Signing Fee ({lot.signatureDetails ? "Witnessed" : "Talent"}):</span>
                          <span className="rounded bg-amber-950/80 px-1 py-0.2 text-[8px] font-bold text-amber-300 border border-amber-500/40">
                            Est. Guesstimate
                          </span>
                        </div>
                        <span className="text-amber-300 font-bold">~${activeFormula.creatorSigningFee.toFixed(2)}</span>
                      </div>
                      <div className="text-[9px] text-amber-300/70 font-sans italic pl-1 leading-tight">
                        * Creator fee is an estimated guesstimate ($25–$100+); uncertain without specific convention or venue pricing.
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-slate-400">Submission Invoice Processing Fee:</span>
                    <span className="text-white">+${activeFormula.invoiceFee.toFixed(2)}</span>
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
                  This is the irreducible manufacturing cost. Even if someone gave you the raw comic for zero dollars, slabbing it yourself requires writing this ${activeFormula.slabbingCostFloor.toFixed(2)} check.
                </span>
              </div>
            </div>

            {/* Right Column: BOX 2 & BOX 3 - The Whole Tomato DIY Replication & Make vs Buy Reality */}
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
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estimated Raw Comic Acquisition:</span>
                    <span className="text-white font-bold">${activeFormula.estimatedRawBasis.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Sunk Factory Encasement Bill (Box 1):</span>
                    <span className="text-cyan-300 font-bold">+${activeFormula.slabbingCostFloor.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Insured Mailer &amp; Boxing:</span>
                    <span className="text-white">+${activeFormula.mailerBoxFee.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-amber-300 text-xs">
                    <span>Total DIY Replacement Cost (The Whole Tomato):</span>
                    <span className="text-amber-200 font-extrabold">${buyerReplacementCost.toFixed(2)}</span>
                  </div>
                </div>

                {/* ── AT THE END OF BOX 2: Current Multisource Value & Floating Delta Beneath the Progressing Bid ── */}
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

                  {/* The Progressing Bid & Dynamic Floating +/- Directly Beneath It */}
                  <div className="p-2 rounded bg-black/70 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div>
                      <span className="text-slate-400 text-[8.5px] uppercase tracking-wider block">Live Floor Bid</span>
                      <span className="text-white font-bold text-sm">${currentBid.toFixed(2)}</span>
                    </div>
                    {/* Floating +/- directly beneath the bid */}
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

              {/* BOX 3: Reality Check (Sub-Floor Salvage vs. Standard Make vs. Buy) */}
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

                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>LCS Walk-In Cash Floor (40%):</span>
                      <span className="text-amber-300 font-bold">${lcsOfferFloor.toFixed(2)}</span>
                    </div>

                    <div className="pt-1 text-[10px] font-bold text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded border ${
                          isDeadLoss
                            ? "bg-rose-950/80 border-rose-500/60 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.4)]"
                            : "bg-emerald-950/80 border-emerald-500/60 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                        }`}
                      >
                        {isDeadLoss
                          ? "💀 DEAD LOSS ALL DAY LONG · OVERPAYING LIQUIDATION"
                          : "✅ CLEARANCE SPREAD · BELOW SECONDARY SALVAGE VALUE"}
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

                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Behind-the-8-Ball Cushion (FMV − Bid):</span>
                      <span className={eightBallCushion >= 0 ? "text-cyan-300 font-bold" : "text-rose-400 font-bold"}>
                        {eightBallCushion >= 0 ? `+$${eightBallCushion.toFixed(2)} (Ahead)` : `-$${Math.abs(eightBallCushion).toFixed(2)} (Behind)`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Underwriting Takeaway: The Buyer's Make-vs-Buy Decision Rule */}
          <div className="rounded-lg bg-slate-900/90 p-3 text-[11px] text-slate-300 leading-relaxed border border-slate-800 space-y-1.5">
            {isSubFloorTrap ? (
              <>
                <span className="text-rose-300 font-bold block uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
                  <span>The Sub-Floor Reality Rule (Seller Dump Warning):</span>
                </span>
                <p>
                  • <strong>Irreducible Submitter Deficit:</strong> Submitter spent ${activeFormula.slabbingCostFloor.toFixed(2)} on certification alone plus raw comic purchase (~${activeFormula.sellerTotalCostBasis.toFixed(2)} total basis). Secondary FMV (${lot.fmv.toFixed(2)}) leaves them underwater by -${submitterLoss.toFixed(2)} (-{Math.round((submitterLoss / activeFormula.sellerTotalCostBasis) * 100)}%). They are dumping this slab at auction simply to salvage cash.
                </p>
                <p>
                  • <strong>DIY Replication Illusion:</strong> The Whole Tomato DIY cost (${buyerReplacementCost.toFixed(2)}) is an economic illusion here—no prudent buyer would spend ${buyerReplacementCost.toFixed(2)} to slab a book worth ${lot.fmv.toFixed(2)}. Do NOT treat manufacturing cost as an intrinsic baseline when a slab trades sub-floor.
                </p>
                <p>
                  • <strong>Net Liquidation Reality:</strong> Your strict economic ceiling is Net Realizable Liquidation (${netEbayLiquidation.toFixed(2)} on eBay after fees and shipping, or ${lcsOfferFloor.toFixed(2)} at an LCS). Paying above ${netEbayLiquidation.toFixed(2)} is a dead loss all day long!
                </p>
              </>
            ) : (
              <>
                <span className="text-amber-300 font-bold block uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>The Buyer&apos;s Make-vs-Buy Underwriting Rule:</span>
                </span>
                <p>
                  • <strong>Ignore Seller Basis:</strong> What the seller paid ($0, garage sale, attic find, or inherited) is completely irrelevant to you. Your only consideration is: <em>&ldquo;How much does it cost ME to replace this comic if I don&apos;t buy it right now?&rdquo;</em>
                </p>
                <p>
                  • <strong>Box 1 Sunk Factory Floor (${activeFormula.slabbingCostFloor.toFixed(2)}):</strong> Any winning bid below this level means you acquire the comic book for <em>free</em> and buy the slab below the cost of the plastic, grading labor, Florida tax, and two-way shipping!
                </p>
                <p>
                  • <strong>Box 2 The Whole Tomato (${buyerReplacementCost.toFixed(2)}):</strong> Replicating this exact slab yourself costs raw purchase + ${activeFormula.slabbingCostFloor.toFixed(2)} factory fees + turnaround wait times. Winning below this ceiling guarantees a manufacturing advantage.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── VIEW 2: Real-World Liquidation Channels (4 Scenarios) ── */}
      {activeView === "liquidation" && (
        <div className="space-y-2 pt-1 animate-in fade-in duration-150">
          <div className="text-[10px] text-slate-400 leading-relaxed">
            Liquidation proceeds calculated against verified FMV (<strong>${lot.fmv.toLocaleString()}</strong>) and current bid (<strong>${currentBid.toLocaleString()}</strong>).
            Different channels yield radically different net payouts and liquidity speeds:
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {Object.values(exitScenarios).map((scenario) => {
              const isProfit = scenario.netProfit >= 0;
              return (
                <div
                  key={scenario.channelKey}
                  className={`rounded-lg border p-3 space-y-2 ${
                    scenario.channelKey === "lcs"
                      ? "bg-purple-950/20 border-purple-500/40"
                      : scenario.channelKey === "collector"
                      ? "bg-emerald-950/20 border-emerald-500/40"
                      : scenario.channelKey === "auction"
                      ? "bg-cyan-950/20 border-cyan-500/40"
                      : "bg-slate-950/80 border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <div>
                      <span className="text-xs font-bold text-white block">{scenario.name}</span>
                      <span className="text-[9px] text-slate-400">{scenario.venue}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 block uppercase flex items-center gap-1 justify-end">
                        <Clock className="h-2.5 w-2.5" />
                        <span>{scenario.liquidationVelocity}</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-[11px]">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">Gross Sale</span>
                      <span className="text-slate-200 font-bold">${scenario.grossResalePrice.toFixed(0)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">Net Proceeds</span>
                      <span className="text-white font-bold">${scenario.netProceeds.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">Net Profit / ROI</span>
                      <span
                        className={`font-black ${
                          isProfit ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {isProfit ? `+$${scenario.netProfit.toFixed(0)}` : `-$${Math.abs(scenario.netProfit).toFixed(0)}`}
                        <span className="text-[9px] font-normal ml-0.5">
                          ({scenario.roiPercent > 0 ? "+" : ""}{scenario.roiPercent}%)
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 leading-tight pt-1 border-t border-slate-800/60">
                    {scenario.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── VIEW 3: Hypothetical CPR Escalator & Real-World Underwriting ── */}
      {activeView === "escalator" && (
        <div className="pt-1 space-y-3 animate-in fade-in duration-150">
          <div className="rounded-lg border border-amber-500/40 bg-amber-950/30 p-3 flex items-start gap-2.5 text-xs font-mono">
            <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-amber-200 text-[11px] leading-relaxed">
              <span className="text-amber-300 uppercase block font-bold">
                * Hypothetical Buyer Exercise (Not All Sub-9.8 Books Are CPR Candidates)
              </span>
              <span>
                Not every comic below a 9.8 is a candidate for cracking, pressing, and regrading. In this exercise, it is a hypothetical model demonstrating what could happen if an 8.5 or 9.2 candidate turns in favor of the buyer upon pressing and resubmission. Standard grading is how secondary market auctions usually sell. Treat all CPR projections strictly as hypothetical upside scenarios.
              </span>
            </div>
          </div>
          <LandedEquityCalculator
            currentListingPrice={currentBid}
            currentListingGrade={parseFloat(lot.grade) || 9.8}
            isBuyItNow={false}
            benchmarkFmv98={lot.priceLadder?.grade98 ?? lot.fmv}
            benchmarkFmv96={lot.priceLadder?.grade96 ?? undefined}
            benchmarkFmv94={lot.priceLadder?.grade94 ?? undefined}
            benchmarkFmv92={lot.priceLadder?.grade92 ?? undefined}
            title={lot.title}
            issue={lot.issueNumber}
            isYellowLabel={lot.isYellowLabel}
          />
        </div>
      )}
    </div>
  );
}
