"use client";

import * as React from "react";
import { TrendingUp, TrendingDown, Activity, Calendar, DollarSign } from "lucide-react";

export interface ChartDataPoint {
  date: string;
  value: number;
  volume: number;
}

interface EquityCandlestickChartProps {
  ticker: string;
  currentPrice: number;
  deltaPercent: number;
  dataPoints: ChartDataPoint[];
}

export function EquityCandlestickChart({
  ticker,
  currentPrice,
  deltaPercent,
  dataPoints,
}: EquityCandlestickChartProps) {
  const [timeframe, setTimeframe] = React.useState<"30D" | "90D" | "1Y" | "ALL">("90D");
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);

  // Filter points based on timeframe
  const activePoints = React.useMemo(() => {
    if (!dataPoints || dataPoints.length === 0) {
      // Fallback synthetic data points
      const base = currentPrice || 1000;
      return Array.from({ length: 30 }, (_, i) => {
        const factor = 1 + (i - 15) * 0.005 + (Math.sin(i) * 0.015);
        return {
          date: `2026-09-${String(i + 1).padStart(2, "0")}`,
          value: Math.round(base * factor),
          volume: Math.round(15 + Math.sin(i * 2) * 8),
        };
      });
    }

    if (timeframe === "30D") return dataPoints.slice(-10);
    if (timeframe === "90D") return dataPoints.slice(-20);
    if (timeframe === "1Y") return dataPoints.slice(-30);
    return dataPoints;
  }, [dataPoints, currentPrice, timeframe]);

  const values = activePoints.map((p) => p.value);
  const minVal = Math.min(...values) * 0.98;
  const maxVal = Math.max(...values) * 1.02;
  const range = maxVal - minVal || 1;

  const isPositive = deltaPercent >= 0;
  const strokeColor = isPositive ? "#34D399" : "#F43F5E";
  const gradientId = `grad-${ticker.replace(/[^a-zA-Z0-9]/g, "")}`;

  // SVG dimensions
  const width = 800;
  const height = 280;
  const paddingX = 40;
  const paddingY = 30;

  const points = activePoints.map((p, idx) => {
    const x = paddingX + (idx / (activePoints.length - 1 || 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((p.value - minVal) / range) * (height - paddingY * 2);
    return { x, y, ...p };
  });

  const pathD = points.reduce((acc, p, idx) => {
    if (idx === 0) return `M ${p.x} ${p.y}`;
    const prev = points[idx - 1];
    const cpx1 = prev.x + (p.x - prev.x) / 2;
    const cpy1 = prev.y;
    const cpx2 = prev.x + (p.x - prev.x) / 2;
    const cpy2 = p.y;
    return `${acc} C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${p.x} ${p.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1]?.x || width - paddingX} ${height - paddingY} L ${points[0]?.x || paddingX} ${height - paddingY} Z`;

  const hoveredPoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : points[points.length - 1];

  return (
    <div className="rounded-lg border border-slate-800 bg-[#070A11] p-5 shadow-2xl">
      {/* Header Metrics */}
      <div className="flex flex-col gap-4 border-b border-slate-800/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">
              {ticker} · CONTINUOUS VALUATION CURVE
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-emerald-950/60 border border-emerald-500/40 px-1.5 py-0.2 text-[9px] font-mono text-emerald-300">
              <Activity className="h-2.5 w-2.5 animate-pulse" /> LIVE
            </span>
          </div>

          <div className="mt-1 flex items-baseline gap-3">
            <span className="text-3xl font-mono font-bold tracking-tight text-slate-100">
              ${(hoveredPoint?.value ?? currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span
              className={`flex items-center gap-0.5 text-xs font-mono font-semibold ${
                isPositive ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {isPositive ? `+${deltaPercent}%` : `${deltaPercent}%`}
            </span>
            {hoveredPoint && (
              <span className="text-[11px] font-mono text-slate-500">
                {hoveredPoint.date} (Vol: {hoveredPoint.volume} trades)
              </span>
            )}
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-1 rounded border border-slate-800 bg-[#0B0F1A] p-0.5">
          {(["30D", "90D", "1Y", "ALL"] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`rounded px-2.5 py-1 text-[10px] font-mono font-bold transition-colors ${
                timeframe === tf
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative mt-4 w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none overflow-visible"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((pct) => {
            const y = height - paddingY - pct * (height - paddingY * 2);
            const val = minVal + pct * range;
            return (
              <g key={pct} className="text-slate-700">
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="currentColor"
                  strokeDasharray="3 3"
                  strokeOpacity="0.3"
                />
                <text
                  x={width - paddingX + 5}
                  y={y + 3}
                  fill="#64748B"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  ${Math.round(val).toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Area Gradient */}
          <path d={areaD} fill={`url(#${gradientId})`} />

          {/* Line Path */}
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Hover Nodes */}
          {points.map((p, idx) => (
            <g
              key={idx}
              className="cursor-pointer"
              onMouseEnter={() => setHoverIndex(idx)}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={hoverIndex === idx ? 5 : 2}
                fill={hoverIndex === idx ? "#FFFFFF" : strokeColor}
                stroke={strokeColor}
                strokeWidth={hoverIndex === idx ? 2 : 1}
                className="transition-all duration-150"
              />
              <rect
                x={p.x - 12}
                y={0}
                width={24}
                height={height}
                fill="transparent"
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Footer Range Stats */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800/80 text-[10px] font-mono">
        <div className="rounded bg-[#0A0E18] border border-slate-800/60 p-2">
          <span className="text-slate-500 uppercase">Period Low</span>
          <p className="mt-0.5 font-bold text-slate-300">${Math.round(minVal).toLocaleString()}</p>
        </div>
        <div className="rounded bg-[#0A0E18] border border-slate-800/60 p-2">
          <span className="text-slate-500 uppercase">Period High</span>
          <p className="mt-0.5 font-bold text-emerald-400">${Math.round(maxVal).toLocaleString()}</p>
        </div>
        <div className="rounded bg-[#0A0E18] border border-slate-800/60 p-2">
          <span className="text-slate-500 uppercase">Implied Volatility</span>
          <p className="mt-0.5 font-bold text-cyan-400">14.8% Beta</p>
        </div>
        <div className="rounded bg-[#0A0E18] border border-slate-800/60 p-2">
          <span className="text-slate-500 uppercase">Trading Venue</span>
          <p className="mt-0.5 font-bold text-slate-300">Clean Sovereign Desk</p>
        </div>
      </div>
    </div>
  );
}
