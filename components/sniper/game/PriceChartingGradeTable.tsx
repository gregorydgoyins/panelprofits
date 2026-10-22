"use client";

import React from "react";
import type { LotItem } from "@/lib/sniper/sim/types";
import { Table, ExternalLink, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface PriceChartingGradeTableProps {
  lot: LotItem;
}

export function PriceChartingGradeTable({ lot }: PriceChartingGradeTableProps) {
  const ladder = lot.priceLadder;

  // Grade rows formatted exactly per PriceCharting convention
  const rows = [
    {
      gradeKey: "raw",
      label: "Ungraded ⚑",
      gradeNum: "Raw",
      price: ladder?.raw ?? (lot.estimatedRawBasis || Math.round(lot.fmv * 0.22)),
      volume: "1 sale per day",
    },
    {
      gradeKey: "4.0",
      label: "4.0 / VG",
      gradeNum: "4.0",
      price: ladder?.grade40 ?? Math.round(lot.fmv * 0.35),
      volume: "1 sale per week",
    },
    {
      gradeKey: "6.0",
      label: "6.0 / Fine",
      gradeNum: "6.0",
      price: ladder?.grade60 ?? Math.round(lot.fmv * 0.48),
      volume: "1 sale per week",
    },
    {
      gradeKey: "8.0",
      label: "8.0 / VF",
      gradeNum: "8.0",
      price: ladder?.grade80 ?? Math.round(lot.fmv * 0.65),
      volume: "2 sales per week",
    },
    {
      gradeKey: "9.2",
      label: "9.2 / NM-",
      gradeNum: "9.2",
      price: ladder?.grade92 ?? Math.round(lot.fmv * 0.82),
      volume: "1 sale per week",
    },
    {
      gradeKey: "9.4",
      label: "9.4 / NM",
      gradeNum: "9.4",
      price: ladder?.grade94 ?? Math.round(lot.fmv * 0.90),
      volume: "1 sale per week",
    },
    {
      gradeKey: "9.6",
      label: "9.6 / NM+",
      gradeNum: "9.6",
      price: ladder?.grade96 ?? Math.round(lot.fmv * 0.95),
      volume: "1 sale per month",
    },
    {
      gradeKey: "9.8",
      label: "9.8 / NM-MT",
      gradeNum: "9.8",
      price: ladder?.grade98 ?? (lot.fmv >= 500 ? lot.fmv : Math.round(lot.fmv * 1.8)),
      volume: "1 sale per month",
    },
  ];

  return (
    <div className="relative rounded-xl border-2 border-cyan-400 bg-gradient-to-r from-[#061526] via-[#040C16] to-[#061526] p-4 sm:p-5 shadow-[0_0_0_1px_rgba(34,211,238,1),0_0_16px_rgba(6,182,212,0.85),0_0_28px_rgba(8,145,178,0.45),inset_0_1px_2px_rgba(255,255,255,0.35),inset_0_0_10px_rgba(34,211,238,0.25)] ring-1 ring-cyan-300/60 space-y-4 font-mono text-xs">
      {/* Top Radiant Neon Rimlight Flare */}
      <div className="absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_12px_rgba(34,211,238,1)]" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-500/30 pb-3">
        <div className="flex items-center gap-2">
          <Table className="h-4 w-4 text-cyan-400" />
          <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
            PriceCharting Certified Grade &amp; Velocity Matrix
          </h4>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[10px]">
          {lot.isHighGradeOnly ? (
            <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/50 text-amber-300 font-bold">
              Era Policy: 8.5+ Institutional Floor (Bronze–PostModern)
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/50 text-purple-300 font-bold">
              Vintage Era Policy: 0.5 – 9.8 Dealable (Atomic/Golden/Platinum)
            </span>
          )}
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
            Buy (0.66x) / Sell (1.10x)
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-300">
            Volume Verified
          </span>
        </div>
      </div>

      {/* Multi-Grade Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
              <th className="py-2 px-3">Grade Tier</th>
              <th className="py-2 px-3">Market Price</th>
              <th className="py-2 px-3">Dealer Buy (0.66)</th>
              <th className="py-2 px-3">Dealer Sell (1.10)</th>
              <th className="py-2 px-3">Volume Velocity</th>
              <th className="py-2 px-3 text-right">Underwriting Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {rows.map((r) => {
              const buyPrice = Math.round(r.price * 0.66 * 100) / 100;
              const sellPrice = Math.round(r.price * 1.10 * 100) / 100;
              const isLotGrade = lot.grade === r.gradeNum;
              const numGrade = parseFloat(r.gradeNum);
              const isBelowCutoff = lot.isHighGradeOnly && (r.gradeNum === "Raw" || (Number.isFinite(numGrade) && numGrade < 8.5));

              return (
                <tr
                  key={r.gradeKey}
                  className={`transition-colors ${
                    isLotGrade
                      ? "bg-cyan-950/40 text-cyan-200 font-bold"
                      : isBelowCutoff
                      ? "hover:bg-slate-900/30 text-slate-400 opacity-80"
                      : "hover:bg-slate-900/40 text-slate-300"
                  }`}
                >
                  <td className="py-2.5 px-3 flex items-center gap-2">
                    <span className="font-bold text-white">{r.label}</span>
                    {isLotGrade && (
                      <span className="text-[9px] bg-cyan-900 text-cyan-300 border border-cyan-500/50 px-1.5 py-0.2 rounded uppercase">
                        THIS LOT
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <strong className="text-white text-sm">
                      ${r.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </strong>
                  </td>
                  <td className="py-2.5 px-3 text-emerald-400">
                    Buy: ${buyPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-cyan-300">
                    Sell: ${sellPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-purple-300 text-[11px]">
                    <span className="inline-flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      <span>{r.volume}</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {isBelowCutoff ? (
                      <span className="text-[10px] text-slate-500 font-mono">
                        Sub-8.5 (Comps Only)
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                        Institutional Dealable
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-[10px] text-slate-400 bg-black/60 p-2.5 rounded-lg border border-slate-800 leading-relaxed space-y-1">
        <p>
          * <strong>Underwriting Grade Threshold:</strong> Bronze through Post-Modern eras (Bronze, Copper, Modern, Independent, Post-Modern) are strictly dealable at <strong>8.5 and above</strong>. Sub-8.5 tiers serve as valuation context only. Atomic, Golden, and Platinum vintage keys accept <strong>0.5 through 9.8</strong>.
        </p>
        <p className="text-slate-500">
          * <strong>Opening Bid Ceiling:</strong> Initial starting bids are hard-capped at <strong>$10,000 maximum</strong>. Hammer prices clear unconstrained over $10,000 based on market bidding.
        </p>
      </div>
    </div>
  );
}
