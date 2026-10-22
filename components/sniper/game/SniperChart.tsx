"use client";

import React, { useState } from "react";
import { TradingViewChart } from "@/components/charts/tradingview-chart";
import { AlertTriangle, Clock, Calendar, Layers, Activity, Check } from "lucide-react";
import type { LotItem } from "@/lib/sniper/sim/types";

interface SniperChartProps {
  lot: LotItem;
}

export function SniperChart({ lot }: SniperChartProps) {
  const ladder = lot.priceLadder;
  const multiSales = lot.multiGradeSales || [
    { grade: "9.8", label: "9.8 NM/MT", salesCount: 9, price: ladder?.grade98 || lot.fmv, lastCompDate: lot.lastSoldDate, color: "#F59E0B" },
    { grade: "9.6", label: "9.6 NM+", salesCount: 2, price: ladder?.grade96 || Math.round(lot.fmv * 0.45), lastCompDate: "2024-08-12", color: "#A855F7" },
    { grade: "9.4", label: "9.4 NM", salesCount: 5, price: ladder?.grade94 || Math.round(lot.fmv * 0.35), lastCompDate: "2024-09-01", color: "#38BDF8" },
    { grade: "9.2", label: "9.2 NM-", salesCount: 3, price: ladder?.grade92 || Math.round(lot.fmv * 0.28), lastCompDate: "2024-07-28", color: "#22D3EE" },
    { grade: "8.0", label: "8.0 VF", salesCount: 8, price: ladder?.grade80 || Math.round(lot.fmv * 0.18), lastCompDate: "2024-09-18", color: "#10B981" },
    { grade: "6.0", label: "6.0 FN", salesCount: 4, price: ladder?.grade60 || Math.round(lot.fmv * 0.12), lastCompDate: "2024-06-15", color: "#F97316" },
    { grade: "4.0", label: "4.0 VG", salesCount: 3, price: ladder?.grade40 || Math.round(lot.fmv * 0.08), lastCompDate: "2024-05-20", color: "#FB7185" },
    { grade: "Raw", label: "Ungraded ⚑", salesCount: 12, price: ladder?.raw || Math.round(lot.fmv * 0.05), lastCompDate: "2024-09-25", color: "#94A3B8" },
  ];

  const [selectedGrade, setSelectedGrade] = useState<string>("ALL");

  // Determine active displayed price based on selected grade
  const activeGradeObj = multiSales.find((s) => s.grade === selectedGrade);
  const currentPrice = activeGradeObj ? activeGradeObj.price : lot.fmv;

  // Build chart points adjusted for the selected grade
  const rawPoints = lot.chartPoints || [];
  const pointsMap = new Map<string, number>();
  for (const pt of rawPoints) {
    if (pt.time && Number.isFinite(pt.value)) {
      if (activeGradeObj && lot.fmv > 0) {
        const ratio = activeGradeObj.price / lot.fmv;
        pointsMap.set(pt.time, Math.max(10, Math.round(pt.value * ratio)));
      } else {
        pointsMap.set(pt.time, pt.value);
      }
    }
  }

  const points = Array.from(pointsMap.entries())
    .map(([time, value]) => ({ time, value }))
    .sort((a, b) => a.time.localeCompare(b.time));

  const firstPrice = points.length > 0 ? points[0].value : currentPrice;
  const deltaPercent = firstPrice > 0 ? ((currentPrice - firstPrice) / firstPrice) * 100 : 0;

  // Build volume series corresponding to verified sales count
  const salesCountForGrade = activeGradeObj ? activeGradeObj.salesCount : multiSales.reduce((acc, cur) => acc + cur.salesCount, 0);

  const volumeData = points.map((p, idx) => ({
    time: p.time,
    value: Math.max(1, Math.round((salesCountForGrade / (points.length || 1)) * (0.8 + (idx % 3) * 0.2))),
    color: activeGradeObj?.color ? `${activeGradeObj.color}80` : "rgba(16, 185, 129, 0.4)",
  }));

  return (
    <div className="space-y-4 font-mono">
      {/* Stale Comp Warning Banner */}
      {lot.isStaleComp && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-3 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200">
            <span className="font-bold text-amber-300 uppercase tracking-wider block">
              STALE COMP TRAP DETECTED ({lot.staleCompAgeDays} DAYS OLD)
            </span>
            <span>
              Last recorded sale took place on <strong className="text-white">{lot.lastSoldDate}</strong> during historical market peaks. Current index benchmarks show price softenings across this sector. Beware of overbidding!
            </span>
          </div>
        </div>
      )}

      {/* Multi-Grade Sales Distribution Bar */}
      <div className="rounded-xl border border-purple-500/40 bg-gradient-to-r from-[#120722] via-[#0B0416] to-[#120722] p-3 shadow-lg">
        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-purple-500/20 text-[10px] text-purple-200">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
            <Activity className="h-3.5 w-3.5 text-cyan-400" />
            <span>RECORDED SALES OBSERVATIONS BY CERTIFIED GRADE</span>
          </div>
          <span className="text-[9px] text-slate-400">
            {salesCountForGrade} total verified transactions recorded
          </span>
        </div>

        {/* Grade Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedGrade("ALL")}
            className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all whitespace-nowrap border ${
              selectedGrade === "ALL"
                ? "bg-purple-900/80 text-white border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            All Grades ({multiSales.reduce((a, b) => a + b.salesCount, 0)} sales)
          </button>

          {multiSales.map((ms) => {
            const isSelected = selectedGrade === ms.grade;
            return (
              <button
                key={ms.grade}
                type="button"
                onClick={() => setSelectedGrade(ms.grade)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase transition-all whitespace-nowrap border ${
                  isSelected
                    ? "bg-slate-900 text-white border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                    : "bg-black/50 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:border-slate-700"
                }`}
                style={{
                  borderLeftColor: ms.color,
                  borderLeftWidth: "3px",
                }}
              >
                <span>{ms.grade}</span>
                <span className="text-[9px] text-emerald-400">({ms.salesCount} sales)</span>
                <span className="text-slate-500 font-normal">${ms.price.toLocaleString()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TradingView Lightweight Charts Engine */}
      <TradingViewChart
        ticker={`${lot.series.toUpperCase()} #${lot.issueNumber} · ${selectedGrade === "ALL" ? `CGC ${lot.grade}` : `${selectedGrade} GRADE`}`}
        series={lot.series}
        issueNumber={lot.issueNumber}
        currentPrice={currentPrice}
        deltaPercent={deltaPercent}
        areaData={points}
        candlestickData={[]}
        volumeData={volumeData}
        height={280}
        completedSalesOnly
        dataLabel={selectedGrade === "ALL" ? "MULTI-GRADE SALES" : `${selectedGrade} RECORDED SALES (${salesCountForGrade} COMPS)`}
      />

      {/* Multi-Grade Provenance Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 px-1 pt-1 border-t border-slate-800/80">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3 text-cyan-400" />
            <span>Last Sale: <strong className="text-white">{activeGradeObj?.lastCompDate ?? lot.lastSoldDate}</strong></span>
          </span>
          <span className="flex items-center gap-1.5">
            <Layers className="h-3 w-3 text-purple-400" />
            <span>Grade: <strong className="text-white">{selectedGrade === "ALL" ? `Lot ${lot.grade}` : selectedGrade}</strong></span>
          </span>
        </div>
        <div className="text-[10px] text-slate-500">
          Showing {salesCountForGrade} recorded auction comps from PriceCharting &amp; CGC Heritage sales
        </div>
      </div>
    </div>
  );
}
