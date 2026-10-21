"use client";

import React from "react";
import { TradingViewChart } from "@/components/charts/tradingview-chart";
import { AlertTriangle, Clock, Calendar } from "lucide-react";
import type { LotItem } from "@/lib/sniper/sim/types";

interface SniperChartProps {
  lot: LotItem;
}

export function SniperChart({ lot }: SniperChartProps) {
  const rawPoints = lot.chartPoints || [];
  const pointsMap = new Map<string, number>();
  for (const pt of rawPoints) {
    if (pt.time && Number.isFinite(pt.value)) {
      pointsMap.set(pt.time, pt.value);
    }
  }
  const points = Array.from(pointsMap.entries())
    .map(([time, value]) => ({ time, value }))
    .sort((a, b) => a.time.localeCompare(b.time));

  const currentPrice = lot.fmv;
  const firstPrice = points.length > 0 ? points[0].value : currentPrice;
  const deltaPercent = firstPrice > 0 ? ((currentPrice - firstPrice) / firstPrice) * 100 : 0;

  return (
    <div className="space-y-3">
      {/* Stale Comp Warning Banner */}
      {lot.isStaleComp && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-3 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs font-mono text-amber-200">
            <span className="font-bold text-amber-300 uppercase tracking-wider block">
              STALE COMP TRAP DETECTED ({lot.staleCompAgeDays} DAYS OLD)
            </span>
            <span>
              Last recorded sale took place on <strong className="text-white">{lot.lastSoldDate}</strong> during historical market peaks. Current index benchmarks show price softenings across this sector. Beware of overbidding!
            </span>
          </div>
        </div>
      )}

      {/* TradingView Lightweight Charts Engine */}
      <TradingViewChart
        ticker={`${lot.series.toUpperCase()} #${lot.issueNumber}`}
        series={lot.series}
        issueNumber={lot.issueNumber}
        currentPrice={currentPrice}
        deltaPercent={deltaPercent}
        areaData={points}
        candlestickData={[]}
        volumeData={points.map((p) => ({
          time: p.time,
          value: Math.floor(1 + Math.random() * 4),
          color: "rgba(16, 185, 129, 0.4)",
        }))}
        height={260}
        completedSalesOnly
        dataLabel="HISTORICAL SALES OBSERVATIONS"
      />

      {/* Provenance note */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-1">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3 text-slate-400" />
          <span>Last Recorded Comp: {lot.lastSoldDate}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3 w-3 text-slate-400" />
          <span>CGC Census Population: {lot.cgcCensus ?? "N/A"} in Grade</span>
        </span>
      </div>
    </div>
  );
}
