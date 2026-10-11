import React from "react";
import type { ComicRecord } from "@/lib/comics/types";
import {
  panelProfitsGrades,
  comicBaseGrades,
  ebayGrades,
  goCollectCgcGrades,
  priceChartingGrades,
  type Grade,
} from "@/lib/pricing/source-ladder";

interface ComparativePriceMatrixProps {
  comic: ComicRecord;
  inspectedGrade?: number | string;
  ticker?: string;
}

const GRADE_ORDER: string[] = ["10.0", "9.9", "9.8", "9.6", "9.4", "9.2", "9.0", "8.5", "8.0", "7.5", "7.0", "6.5", "6.0", "5.5", "5.0", "4.5", "4.0", "3.5", "3.0", "2.5", "2.0", "1.8", "1.5", "1.0", "0.5", "RAW"];

const usd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Per-grade prices from each source, exactly as stored. A source with no stored price for a grade
 * shows a dash; a source with no prices at all gets no column; no prices at all renders nothing.
 * Nothing is derived from another source's number.
 */
export function ComparativePriceMatrix({ comic, inspectedGrade = "9.8", ticker }: ComparativePriceMatrixProps) {
  const pp = panelProfitsGrades(comic) as Partial<Record<string, number>>;
  const pc = priceChartingGrades(comic) as Partial<Record<string, number>>;
  const sources = [
    { key: "ebay", label: "eBay sold", color: "text-emerald-400", data: ebayGrades(comic) as Partial<Record<string, number>> },
    { key: "pp", label: "Panel Profits", color: "text-cyan-300", data: { ...pc, ...pp } as Partial<Record<string, number>> },
    { key: "cb", label: "ComicBase", color: "text-blue-300", data: comicBaseGrades(comic) as Partial<Record<string, number>> },
    { key: "gc", label: "GoCollect", color: "text-purple-300", data: goCollectCgcGrades(comic) as Partial<Record<string, number>> },
  ].filter((s) => Object.values(s.data).some((v) => typeof v === "number" && v > 0));

  const rows = GRADE_ORDER.filter((g) => sources.some((s) => typeof s.data[g] === "number" && (s.data[g] as number) > 0));
  if (sources.length === 0 || rows.length === 0) return null;

  const inspected = typeof inspectedGrade === "string" ? parseFloat(inspectedGrade) : inspectedGrade;
  const isInspected = (g: string) => g !== "RAW" && Number.isFinite(inspected) && Math.abs(parseFloat(g) - (inspected as number)) < 0.05;

  return (
    <div className="bg-[#070C18] border border-white/10 rounded-xl p-4 space-y-3 font-mono">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Price by grade</span>
        {ticker && (
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-white/10 font-bold">{ticker}</span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="text-slate-500 border-b border-slate-800 text-[10px] uppercase">
              <th className="pb-2 font-bold">Grade</th>
              {sources.map((s) => (
                <th key={s.key} className={`pb-2 font-bold text-right ${s.color}`}>{s.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {rows.map((g) => (
              <tr key={g} className={isInspected(g) ? "bg-cyan-950/40 font-bold" : ""}>
                <td className="py-2 pl-2 text-slate-300">{g === "RAW" ? "Raw" : g}</td>
                {sources.map((s) => {
                  const v = s.data[g];
                  return (
                    <td key={s.key} className={`py-2 text-right ${s.color}`}>
                      {typeof v === "number" && v > 0 ? usd(v) : <span className="text-slate-600">&ndash;</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
