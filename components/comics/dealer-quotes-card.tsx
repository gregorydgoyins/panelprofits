import React from "react";
import type { SpreadAnchor } from "@/lib/comics/detail-model";

const GRADE_ORDER = ["10.0", "9.9", "9.8", "9.6", "9.4", "9.2", "9.0", "8.5", "8.0", "7.5", "7.0", "6.5", "6.0", "5.5", "5.0", "4.5", "4.0", "3.5", "3.0", "2.5", "2.0", "1.8", "1.5", "1.0", "0.5", "RAW"];
const usd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Dealer buy and retail sell prices exactly as PriceCharting lists them, per grade. Grades with no
 * stored pair are left out. Nothing is modeled; with no pairs the card does not render.
 */
export function DealerQuotesCard({ anchors, asOf }: { anchors: Record<string, SpreadAnchor>; asOf: string | null }) {
  const grades = GRADE_ORDER.filter((g) => anchors[g]);
  if (grades.length === 0) return null;
  return (
    <div className="bg-[#070C18] border border-white/10 rounded-xl p-4 space-y-3 font-mono">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Dealer buy and retail sell</span>
        <span className="text-[10px] text-slate-500">PriceCharting{asOf ? `, ${asOf.slice(0, 10)}` : ""}</span>
      </div>
      <table className="w-full text-xs text-left">
        <thead>
          <tr className="text-slate-500 border-b border-slate-800 text-[10px] uppercase">
            <th className="pb-2 font-bold">Grade</th>
            <th className="pb-2 font-bold text-right">Dealer buy</th>
            <th className="pb-2 font-bold text-right">Retail sell</th>
            <th className="pb-2 font-bold text-right">Gap</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {grades.map((g) => {
            const a = anchors[g];
            return (
              <tr key={g}>
                <td className="py-2 pl-2 text-slate-300">{g === "RAW" ? "Raw" : g}</td>
                <td className="py-2 text-right text-amber-300">{usd(a.buy)}</td>
                <td className="py-2 text-right text-emerald-300">{usd(a.sell)}</td>
                <td className="py-2 text-right text-slate-400">{(a.spread * 100).toFixed(1)}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
