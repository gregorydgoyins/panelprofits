"use client";

import React from "react";
import { X, Archive, DollarSign, TrendingUp, TrendingDown, Layers, ShieldCheck } from "lucide-react";
import type { WonBook } from "@/lib/sniper/sim/types";

interface SniperVaultProps {
  isOpen: boolean;
  onClose: () => void;
  vault: WonBook[];
  onLiquidateBook: (bookId: string, liquidationValue: number) => void;
}

export function SniperVault({
  isOpen,
  onClose,
  vault,
  onLiquidateBook,
}: SniperVaultProps) {
  if (!isOpen) return null;

  const totalCost = vault.reduce((sum, b) => sum + b.purchaseCost, 0);
  const totalFmv = vault.reduce((sum, b) => sum + b.fmv, 0);
  const totalUnrealizedPnl = totalFmv - totalCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-slate-800 bg-[#0A0E17] p-6 md:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Archive className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                Asset Inventory &amp; Secondary Resale
              </span>
              <h2 className="text-xl md:text-2xl font-mono font-bold text-white">
                YOUR ACQUIRED VAULT ({vault.length} {vault.length === 1 ? "Book" : "Books"})
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Portfolio Summary Stats */}
        <div className="grid grid-cols-3 gap-3 rounded-xl bg-black/40 border border-slate-800/80 p-4 font-mono text-xs">
          <div>
            <span className="text-slate-500 uppercase text-[10px] block">Total Cost Basis</span>
            <span className="text-white font-bold text-base">${totalCost.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px] block">Total Fair Market Value</span>
            <span className="text-cyan-300 font-bold text-base">${totalFmv.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px] block">Unrealized P&amp;L</span>
            <span
              className={`font-bold text-base flex items-center gap-1 ${
                totalUnrealizedPnl >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {totalUnrealizedPnl >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>
                {totalUnrealizedPnl >= 0 ? "+" : ""}${totalUnrealizedPnl.toLocaleString()}
              </span>
            </span>
          </div>
        </div>

        {/* Inventory Table / Cards */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {vault.length === 0 ? (
            <div className="text-center py-16 text-slate-500 font-mono text-sm">
              <Layers className="h-8 w-8 mx-auto mb-2 text-slate-600" />
              <p>Your vault is currently empty.</p>
              <p className="text-xs text-slate-600 mt-1">
                Win auctions under fair value to accumulate inventory or flip to dealer buy-lists.
              </p>
            </div>
          ) : (
            vault.map((book) => {
              const bookPnl = book.fmv - book.purchaseCost;
              // Dealer buy-list liquidation offer is 90% of FMV
              const dealerOffer = Math.round(book.fmv * 0.90);

              return (
                <div
                  key={`${book.id}-${book.wonAt}`}
                  className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    {book.coverUrl && (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="h-16 w-12 object-cover rounded border border-slate-800 bg-black shrink-0"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[9px] text-slate-300 font-bold uppercase">
                          {book.grader} {book.grade}
                        </span>
                        <span className="text-[10px] text-slate-500">Won {new Date(book.wonAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1 leading-tight">{book.title}</h4>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span>Paid: <strong className="text-slate-200">${book.purchaseCost.toLocaleString()}</strong></span>
                        <span>FMV: <strong className="text-cyan-300">${book.fmv.toLocaleString()}</strong></span>
                        <span className={bookPnl >= 0 ? "text-emerald-400" : "text-rose-400"}>
                          P&amp;L: {bookPnl >= 0 ? "+" : ""}${bookPnl.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dealer Buyout Button */}
                  <div className="w-full sm:w-auto flex justify-end">
                    <button
                      onClick={() => onLiquidateBook(book.id, dealerOffer)}
                      title="Liquidate to Dealer at 90% FMV"
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/30 hover:bg-emerald-950/60 text-emerald-300 px-3.5 py-2 text-xs font-bold transition-colors"
                    >
                      <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Liquidate (${dealerOffer.toLocaleString()})</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-[11px] font-mono text-slate-500">
          <span>Dealer Buy-List Rate: 90% of Fair Market Value (Immediate Cash Liquidation)</span>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 font-bold transition-colors"
          >
            Close Vault
          </button>
        </div>
      </div>
    </div>
  );
}
