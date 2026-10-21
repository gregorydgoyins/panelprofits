"use client";

import React from "react";
import { CheckCircle2, XCircle, AlertOctagon, TrendingUp, TrendingDown, BookOpen, ArrowRight, DollarSign, Archive, ExternalLink, Flame } from "lucide-react";
import type { GameRole, LotItem, RoundStatus } from "@/lib/sniper/sim/types";
import lexiconData from "@/lib/lexicon/cbr_market_lexicon.json";

interface SniperPostMortemProps {
  role: GameRole;
  lot: LotItem;
  status: RoundStatus;
  userBid: number | null;
  onNextLot: () => void;
  onOpenVault: () => void;
  onLiquidateWonBook?: () => void;
}

export function SniperPostMortem({
  role,
  lot,
  status,
  userBid,
  onNextLot,
  onOpenVault,
  onLiquidateWonBook,
}: SniperPostMortemProps) {
  const isWon = status === "hammer_won";
  const isChickenedOut = status === "chickened_out";
  const isOutbid = status === "hammer_lost";

  // Financial calculations
  const cost = userBid ?? lot.openingBid;
  const fmv = lot.fmv;
  const chickenPenalty = isChickenedOut ? Math.round(cost * 0.10) : 0;
  const pnl = isWon ? fmv - cost : isChickenedOut ? -chickenPenalty : 0;
  const roi = cost > 0 ? (pnl / cost) * 100 : 0;

  // Find Investopedia term
  const termEntry = (lexiconData as Record<string, any>)[lot.investopediaSlug] || {
    term: "Margin of Safety (Graham & Dodd Benchmark)",
    investopedia_definition: "Buying an asset at a significant discount to its intrinsic or fair market value to limit downside risk and maximize capital appreciation.",
    panel_profits_translation: "Acquiring graded comic slabs or raw copies well below historical secondary auction clearing averages, protecting capital against market downturns.",
    canonical_formula: "Margin of Safety (%) = (Fair Market Value - Purchase Price) / Fair Market Value * 100",
    comic_example: "Buying a CGC 9.8 modern key with a recorded FMV of $400 for a winning bid of $280 yields a 30% Margin of Safety.",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#0A0E17] p-6 md:p-8 shadow-2xl space-y-6 my-8">
        {/* Banner Header */}
        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl mb-3">
            {isWon && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
            )}
            {isChickenedOut && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                <AlertOctagon className="h-8 w-8" />
              </div>
            )}
            {isOutbid && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <XCircle className="h-8 w-8" />
              </div>
            )}
          </div>

          <h2 className="text-2xl md:text-3xl font-mono font-bold text-white uppercase tracking-tight">
            {isWon && "AUCTION WON AT THE HAMMER"}
            {isChickenedOut && "TACTICAL RETREAT: CHICKENED OUT"}
            {isOutbid && "OUTBID BY FLOOR COMPETITION"}
          </h2>

          <div className="mt-1.5 flex items-center justify-center gap-2 text-sm font-mono text-slate-400 flex-wrap">
            <span>{lot.title}</span>
            <span>·</span>
            <span className="text-white font-bold">{lot.grader} {lot.grade}</span>
            <span>·</span>
            <a
              href={lot.certVerificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-300 hover:text-cyan-200 underline inline-flex items-center gap-1 font-bold bg-cyan-950/60 border border-cyan-500/30 rounded px-1.5 py-0.5 text-xs"
            >
              <span>Cert #{lot.certNumber}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Below-Slabbing-Cost Arbitrage Banner if Won */}
        {isWon && lot.isBelowGradingCost && (
          <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/30 p-3.5 flex items-start gap-3 text-xs font-mono">
            <Flame className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-emerald-200 space-y-0.5">
              <span className="font-bold text-emerald-300 uppercase tracking-wider block">
                🔥 SLAB COST FLOOR ARBITRAGE WON!
              </span>
              <span>
                You acquired this {lot.grader} {lot.grade} for <strong>${cost}</strong>, which is <strong>${lot.sellerSubsidizedAmount} BELOW</strong> the seller&apos;s out-of-pocket slabbing fee alone (${lot.slabbingCostFloor}). The seller absorbed the loss on grading!
              </span>
            </div>
          </div>
        )}

        {/* Ledger Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl bg-black/50 border border-slate-800 p-4 font-mono text-xs">
          <div>
            <span className="text-slate-500 block uppercase text-[10px]">Your Bid</span>
            <span className="text-white font-bold text-sm">${(userBid ?? 0).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase text-[10px]">Actual Hammer Price</span>
            <span className="text-slate-300 font-bold text-sm">${lot.hammerPrice.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase text-[10px]">Verified FMV</span>
            <span className="text-slate-300 font-bold text-sm">${lot.fmv.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase text-[10px]">Net Round P&amp;L</span>
            <span
              className={`font-bold text-sm flex items-center gap-1 ${
                pnl >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {pnl >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              <span>
                {pnl >= 0 ? "+" : ""}${pnl.toLocaleString()} ({roi.toFixed(1)}%)
              </span>
            </span>
          </div>
        </div>

        {/* Client & Bankroll Narrative Feedback */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 text-xs font-mono">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">
            {role === "broker" ? "Client Fiduciary Reaction" : "Whale Bankroll Impact"}
          </span>
          <p className="text-slate-200 leading-relaxed">
            {role === "broker" ? (
              isWon && pnl >= 0 ? (
                <span>
                  🟢 <strong>Client AUM Growth:</strong> Clients are delighted by the disciplined entry under fair value. Your fiduciary rating improved, expanding your capital allocation.
                </span>
              ) : isChickenedOut ? (
                <span>
                  🟡 <strong>Disciplined Preservation:</strong> Bailing out absorbed a 10% penalty (-${chickenPenalty}), but saved clients from holding an underwater book.
                </span>
              ) : (
                <span>
                  🔴 <strong>Floor Slippage:</strong> Floor competition pushed the clearing price beyond your bid. No funds were lost, but no alpha was captured.
                </span>
              )
            ) : isWon ? (
              <span>
                👑 <strong>Whale Vault Addition:</strong> High-profile key slab acquired and secured in your personal vault. Inspect secondary dealer bids to evaluate resale liquidity.
              </span>
            ) : isChickenedOut ? (
              <span>
                🛡️ <strong>Preserved Liquidity:</strong> Absorbed the -${chickenPenalty} exit fee to prevent holding a depreciating asset in a softening market.
              </span>
            ) : (
              <span>
                💨 <strong>Passed by Rival Whale:</strong> Another collector had deeper pockets on this lot. Your \$20k bankroll remains preserved for the next auction.
              </span>
            )}
          </p>
        </div>

        {/* Investopedia Educational Concept Debrief */}
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-5 space-y-3 font-mono">
          <div className="flex items-center gap-2 text-cyan-300">
            <BookOpen className="h-4 w-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">
              Investopedia Market Debrief: {termEntry.term}
            </h4>
          </div>

          <div className="text-xs space-y-2 text-slate-300">
            <p>
              <strong className="text-cyan-200">Financial Principle:</strong> {termEntry.investopedia_definition}
            </p>
            <p>
              <strong className="text-white">Comic Market Application:</strong> {termEntry.panel_profits_translation}
            </p>
            {termEntry.comic_example && (
              <div className="p-2.5 rounded bg-black/40 border border-slate-800 text-[11px] text-cyan-200/90">
                <strong>Example:</strong> {termEntry.comic_example}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isWon && onLiquidateWonBook && (
              <button
                onClick={onLiquidateWonBook}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 px-4 py-3 text-xs font-mono font-bold transition-colors"
              >
                <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                <span>Liquidate to Dealer (Cash Out)</span>
              </button>
            )}

            <button
              onClick={onOpenVault}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-black/50 hover:bg-slate-900 text-slate-300 px-4 py-3 text-xs font-mono font-bold transition-colors"
            >
              <Archive className="h-3.5 w-3.5 text-cyan-400" />
              <span>View Vault</span>
            </button>
          </div>

          <button
            onClick={onNextLot}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono font-bold px-6 py-3 text-xs uppercase tracking-wider transition-colors"
          >
            <span>Next Auction Lot</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
