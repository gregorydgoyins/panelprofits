"use client";

import React, { useMemo } from "react";
import { TrendingUp, Clock, AlertTriangle, ShieldCheck, Flame, Gavel, DollarSign, Activity } from "lucide-react";
import type { LotItem, BidEvent } from "@/lib/sniper/sim/types";

interface SniperBidTrajectoryChartProps {
  lot: LotItem;
  userBid: number | null;
  currentBid: number;
  timeRemaining: number;
  wholeTomatoCost: number;
  lastSoldComp: number;
  bidEvents: BidEvent[];
  isLockout: boolean;
}

interface PlotPoint {
  x: number;
  y: number;
  amount: number;
  clockSecs: number;
  bidder: "user" | "rival" | "floor";
  note?: string;
}

export function SniperBidTrajectoryChart({
  lot,
  userBid,
  currentBid,
  timeRemaining,
  wholeTomatoCost,
  lastSoldComp,
  bidEvents,
  isLockout,
}: SniperBidTrajectoryChartProps) {
  const activeBid = userBid ?? 0;
  const leadDelta = activeBid > 0 ? activeBid - currentBid : 0;
  const isLeading = activeBid > 0 && activeBid >= currentBid;
  const isOutbid = activeBid > 0 && activeBid < currentBid;

  const tomatoSpread = Math.round((wholeTomatoCost - currentBid) * 100) / 100;
  const eightBallSpread = Math.round((wholeTomatoCost - (lastSoldComp > 0 ? lastSoldComp : lot.fmv) - currentBid) * 100) / 100;

  const totalDuration = lot.totalDurationSeconds ?? 240;

  // ── SVG Chart Dimensions & Scalers ──
  const SVG_WIDTH = 850;
  const SVG_HEIGHT = 260;
  const PAD_LEFT = 55;
  const PAD_RIGHT = 145; // Space on right for benchmark labels
  const PAD_TOP = 30;
  const PAD_BOTTOM = 35;
  const PLOT_WIDTH = SVG_WIDTH - PAD_LEFT - PAD_RIGHT;
  const PLOT_HEIGHT = SVG_HEIGHT - PAD_TOP - PAD_BOTTOM;

  // Time to X coordinate: Clock counts down from totalDuration to 0
  const getX = (clockSecs: number) => {
    const elapsed = Math.max(0, Math.min(totalDuration, totalDuration - clockSecs));
    return PAD_LEFT + (elapsed / totalDuration) * PLOT_WIDTH;
  };

  // Price range calculation
  const allPrices = useMemo(() => {
    const prices = [
      lot.openingBid,
      currentBid,
      wholeTomatoCost,
      lot.fmv,
      ...(userBid ? [userBid] : []),
      ...bidEvents.map((e) => e.amount),
    ].filter((p) => typeof p === "number" && !isNaN(p) && p > 0);
    return prices.length > 0 ? prices : [50, 100];
  }, [lot.openingBid, currentBid, wholeTomatoCost, lot.fmv, userBid, bidEvents]);

  const minPrice = Math.max(0, Math.floor(Math.min(...allPrices) * 0.85));
  const maxPrice = Math.ceil(Math.max(...allPrices) * 1.15);
  const priceRange = maxPrice - minPrice || 1;

  // Price to Y coordinate: Higher price is higher up (smaller Y)
  const getY = (val: number) => {
    const clamped = Math.max(minPrice, Math.min(maxPrice, val));
    return PAD_TOP + (1 - (clamped - minPrice) / priceRange) * PLOT_HEIGHT;
  };

  // ── Construct Dynamic Stepped Trajectory Points ──
  const { plotPoints, pathD, areaD, currentX, currentY, latestDelta } = useMemo(() => {
    // Sort bid events chronologically (earliest to latest in auction time)
    const sorted = [...bidEvents].sort((a, b) => b.clockSecs - a.clockSecs);

    // Build raw points list
    const rawList: Array<{ clockSecs: number; amount: number; bidder: "user" | "rival" | "floor"; note?: string }> = [];

    // Always start at clock = totalDuration with opening bid
    rawList.push({
      clockSecs: totalDuration,
      amount: lot.openingBid,
      bidder: "floor",
      note: "Opening Comp",
    });

    // If we have very few events, synthesize intermediate discovery points so the graph is never blank/flat
    if (sorted.length <= 1 && currentBid > lot.openingBid) {
      const midSecs = Math.round(totalDuration * 0.6);
      const midBid = Math.round(lot.openingBid + (currentBid - lot.openingBid) * 0.55);
      rawList.push({
        clockSecs: midSecs,
        amount: midBid,
        bidder: "floor",
        note: "Early Proxy Discovery",
      });
    }

    // Append all recorded bid events
    for (const ev of sorted) {
      if (ev.clockSecs !== totalDuration) {
        rawList.push({
          clockSecs: ev.clockSecs,
          amount: ev.amount,
          bidder: ev.bidder,
          note: ev.note,
        });
      }
    }

    // Always end at current elapsed time with currentFloorBid
    const curElapsedSecs = Math.max(0, Math.min(totalDuration, timeRemaining));
    const lastItem = rawList[rawList.length - 1];
    if (!lastItem || lastItem.clockSecs !== curElapsedSecs || lastItem.amount !== currentBid) {
      rawList.push({
        clockSecs: curElapsedSecs,
        amount: currentBid,
        bidder: userBid && userBid >= currentBid ? "user" : "floor",
        note: "Active Floor",
      });
    }

    // Sort by elapsed time ascending
    rawList.sort((a, b) => b.clockSecs - a.clockSecs);

    // Map to SVG coordinates
    const points: PlotPoint[] = rawList.map((p) => ({
      x: getX(p.clockSecs),
      y: getY(p.amount),
      amount: p.amount,
      clockSecs: p.clockSecs,
      bidder: p.bidder,
      note: p.note,
    }));

    // Build financial staircase stepped path: M x0 y0 L x1 y0 L x1 y1 L x2 y1 L x2 y2...
    let pD = "";
    if (points.length > 0) {
      pD = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const cur = points[i];
        // Horizontal step to current x at previous y, then vertical step to current y
        pD += ` L ${cur.x.toFixed(1)} ${prev.y.toFixed(1)}`;
        pD += ` L ${cur.x.toFixed(1)} ${cur.y.toFixed(1)}`;
      }
    }

    // Current cursor coordinates
    const curX = getX(timeRemaining);
    const curY = getY(currentBid);

    // Make sure path extends to curX
    if (points.length > 0 && curX > points[points.length - 1].x) {
      pD += ` L ${curX.toFixed(1)} ${curY.toFixed(1)}`;
    }

    // Area fill below stepped path
    const baselineY = PAD_TOP + PLOT_HEIGHT;
    const aD = pD
      ? `${pD} L ${curX.toFixed(1)} ${baselineY.toFixed(1)} L ${PAD_LEFT.toFixed(1)} ${baselineY.toFixed(1)} Z`
      : "";

    // Latest movement delta calculation
    let delta = 0;
    if (points.length >= 2) {
      delta = points[points.length - 1].amount - points[points.length - 2].amount;
    }

    return {
      plotPoints: points,
      pathD: pD,
      areaD: aD,
      currentX: curX,
      currentY: curY,
      latestDelta: delta,
    };
  }, [bidEvents, lot.openingBid, currentBid, timeRemaining, totalDuration, userBid, minPrice, maxPrice]);

  // Key guide Y-positions
  const fmvY = getY(lot.fmv);
  const tomatoY = getY(wholeTomatoCost);
  const userBidY = userBid ? getY(userBid) : null;

  // Key guide X-positions for clock zones
  const x30 = getX(30);
  const x5 = getX(5);
  const x0 = getX(0);

  return (
    <div className="rounded-xl border border-purple-500/30 bg-[#090514] p-4 shadow-xl space-y-4 font-mono">
      {/* Top Header: Real-Time Dynamic Deltas on the Fly */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-500/20">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-purple-300 font-bold uppercase tracking-wider">
            <Activity className="h-4 w-4 text-cyan-400 animate-pulse" />
            <span>Real-Time Bid Trajectory &amp; Live Deltas</span>
          </div>
          <p className="text-[10px] text-slate-400 font-sans mt-0.5">
            Dynamic stepped order-flow trajectory. Clock fights escalate at 30s, 5s, and 1s before hammer.
          </p>
        </div>

        {/* Live Delta Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {activeBid > 0 ? (
            isLeading ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-emerald-500/60 bg-emerald-950/80 text-emerald-300 text-[11px] font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-pulse">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>LEADING BY +${leadDelta}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-rose-500/60 bg-rose-950/80 text-rose-300 text-[11px] font-bold shadow-[0_0_10px_rgba(244,63,94,0.4)] animate-bounce">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>OUTBID BY -${Math.abs(activeBid - currentBid)}</span>
              </span>
            )
          ) : (
            <span className="px-2 py-1 rounded border border-slate-700 bg-slate-900 text-slate-400 text-[10px]">
              FLOOR DISCOVERY OPEN
            </span>
          )}

          {/* Latest Bid Step Delta */}
          {latestDelta > 0 && (
            <span className="px-2 py-1 rounded border border-cyan-500/40 bg-cyan-950/60 text-cyan-300 text-[10px] font-bold">
              Step: +${latestDelta}
            </span>
          )}

          {/* Whole Tomato Cushion Delta */}
          <span
            className={`px-2 py-1 rounded border text-[10px] font-bold ${
              tomatoSpread >= 0
                ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-300"
                : "border-amber-500/40 bg-amber-950/40 text-amber-300"
            }`}
          >
            Tomato Δ: {tomatoSpread >= 0 ? `+$${tomatoSpread}` : `-$${Math.abs(tomatoSpread)}`}
          </span>

          {/* Eight-Ball Spread */}
          <span
            className={`px-2 py-1 rounded border text-[10px] font-bold ${
              eightBallSpread >= 0
                ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-300"
                : "border-purple-500/40 bg-purple-950/40 text-purple-300"
            }`}
          >
            8-Ball: {eightBallSpread >= 0 ? `+$${eightBallSpread}` : `-$${Math.abs(eightBallSpread)}`}
          </span>
        </div>
      </div>

      {/* ── High-Resolution Dynamic SVG Trajectory Chart ── */}
      <div className="relative w-full rounded-lg bg-black/70 border border-slate-800 p-2 overflow-hidden select-none shadow-inner">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-56 sm:h-64"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Area Fill Gradient: Neon Cyan fading down to Purple/Transparent */}
            <linearGradient id="bidAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.38" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#090514" stopOpacity="0.0" />
            </linearGradient>

            {/* Trajectory Stroke Gradient */}
            <linearGradient id="bidStrokeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="70%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            {/* Glowing Drop Shadows */}
            <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#06b6d4" floodOpacity="0.8" />
            </filter>
            <filter id="glowAmber" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#f59e0b" floodOpacity="0.6" />
            </filter>
            <filter id="glowEmerald" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#10b981" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Background Grid Lines (Horizontal Price Increments) */}
          {[0.2, 0.4, 0.6, 0.8].map((pct, i) => {
            const gridY = PAD_TOP + PLOT_HEIGHT * pct;
            const gridPrice = Math.round(maxPrice - pct * priceRange);
            return (
              <g key={i}>
                <line
                  x1={PAD_LEFT}
                  y1={gridY}
                  x2={PAD_LEFT + PLOT_WIDTH}
                  y2={gridY}
                  stroke="#1e293b"
                  strokeDasharray="2,4"
                  strokeWidth="1"
                />
                <text
                  x={PAD_LEFT - 6}
                  y={gridY + 3}
                  textAnchor="end"
                  fill="#475569"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  ${gridPrice}
                </text>
              </g>
            );
          })}

          {/* Clock Friction Hot Zones Shading */}
          {/* 1. 30s Clock Fight Zone */}
          <rect
            x={x30}
            y={PAD_TOP}
            width={Math.max(0, x5 - x30)}
            height={PLOT_HEIGHT}
            fill="#f59e0b"
            fillOpacity="0.07"
            stroke="#f59e0b"
            strokeDasharray="3,3"
            strokeWidth="0.8"
            strokeOpacity="0.3"
          />
          <text
            x={x30 + 4}
            y={PAD_TOP + 12}
            fill="#fbbf24"
            fontSize="8"
            fontWeight="bold"
            fontFamily="monospace"
            opacity="0.85"
          >
            30s FIGHT
          </text>

          {/* 2. 5s Sniping Blitz Zone */}
          <rect
            x={x5}
            y={PAD_TOP}
            width={Math.max(0, x0 - x5)}
            height={PLOT_HEIGHT}
            fill="#f43f5e"
            fillOpacity="0.12"
            stroke="#f43f5e"
            strokeDasharray="2,2"
            strokeWidth="0.8"
            strokeOpacity="0.4"
          />
          <text
            x={x5 + 2}
            y={PAD_TOP + 12}
            fill="#f87171"
            fontSize="8"
            fontWeight="bold"
            fontFamily="monospace"
            opacity="0.9"
          >
            5s BLITZ
          </text>

          {/* 3. 0s Hammer Vertical Line */}
          <line
            x1={x0}
            y1={PAD_TOP}
            x2={x0}
            y2={PAD_TOP + PLOT_HEIGHT}
            stroke="#a855f7"
            strokeWidth="1.5"
            strokeDasharray="4,2"
          />

          {/* ── Horizontal Reference Ceilings ── */}
          {/* 1. Fair Market Value (FMV) Benchmark */}
          <line
            x1={PAD_LEFT}
            y1={fmvY}
            x2={PAD_LEFT + PLOT_WIDTH}
            y2={fmvY}
            stroke="#64748b"
            strokeDasharray="4,4"
            strokeWidth="1.2"
          />
          <g transform={`translate(${PAD_LEFT + PLOT_WIDTH + 6}, ${fmvY - 9})`}>
            <rect width="132" height="18" rx="3" fill="#0f172a" stroke="#475569" strokeWidth="0.8" />
            <text x="6" y="12" fill="#94a3b8" fontSize="9" fontWeight="bold" fontFamily="monospace">
              FMV Comp: ${lot.fmv}
            </text>
          </g>

          {/* 2. Whole Tomato Cost Basis Ceiling Parity */}
          <line
            x1={PAD_LEFT}
            y1={tomatoY}
            x2={PAD_LEFT + PLOT_WIDTH}
            y2={tomatoY}
            stroke="#f59e0b"
            strokeDasharray="5,3"
            strokeWidth="1.6"
            filter="url(#glowAmber)"
          />
          <g transform={`translate(${PAD_LEFT + PLOT_WIDTH + 6}, ${tomatoY - 11})`}>
            <rect width="132" height="22" rx="4" fill="#2a1403" stroke="#f59e0b" strokeWidth="1.2" />
            <text x="6" y="11" fill="#fde68a" fontSize="9" fontWeight="bold" fontFamily="monospace">
              🍅 Tomato: ${wholeTomatoCost}
            </text>
            <text x="6" y="19" fill="#f59e0b" fontSize="7" fontWeight="bold" fontFamily="monospace">
              CEILING PARITY
            </text>
          </g>

          {/* 3. User's Accepted Bid Ceiling (if active) */}
          {userBidY !== null && (
            <>
              <line
                x1={PAD_LEFT}
                y1={userBidY}
                x2={currentX}
                y2={userBidY}
                stroke={isLeading ? "#10b981" : "#f43f5e"}
                strokeDasharray="4,3"
                strokeWidth="1.8"
                filter={isLeading ? "url(#glowEmerald)" : undefined}
              />
              <g transform={`translate(${PAD_LEFT + PLOT_WIDTH + 6}, ${userBidY - 10})`}>
                <rect
                  width="132"
                  height="20"
                  rx="4"
                  fill={isLeading ? "#062816" : "#2f0a14"}
                  stroke={isLeading ? "#10b981" : "#f43f5e"}
                  strokeWidth="1.2"
                />
                <text
                  x="6"
                  y="13"
                  fill={isLeading ? "#6ee7b7" : "#fda4af"}
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  ★ Your Bid: ${activeBid}
                </text>
              </g>
            </>
          )}

          {/* ── Area Fill Below Stepped Trajectory ── */}
          {areaD && <path d={areaD} fill="url(#bidAreaGradient)" />}

          {/* ── Dynamic Stepped Bid Trajectory Line ── */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="url(#bidStrokeGradient)"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glowCyan)"
            />
          )}

          {/* ── Bid Event Nodes (Staircase vertices) ── */}
          {plotPoints.map((pt, idx) => {
            const isUser = pt.bidder === "user";
            const isRival = pt.bidder === "rival";
            return (
              <g key={idx} className="transition-all">
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isUser ? 5.5 : isRival ? 4.5 : 3.5}
                  fill={isUser ? "#10b981" : isRival ? "#f43f5e" : "#06b6d4"}
                  stroke="#ffffff"
                  strokeWidth={isUser ? 2 : 1.5}
                />
                {/* User bid pulse ring */}
                {isUser && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="8.5"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1"
                    opacity="0.6"
                  />
                )}
              </g>
            );
          })}

          {/* ── Current Active Head Cursor & Live Price Tag ── */}
          <g>
            {/* Animated pulsating halo */}
            <circle
              cx={currentX}
              cy={currentY}
              r="10"
              fill="#22d3ee"
              opacity="0.3"
              className="animate-ping"
            />
            {/* Solid core indicator */}
            <circle
              cx={currentX}
              cy={currentY}
              r="5"
              fill="#22d3ee"
              stroke="#ffffff"
              strokeWidth="2"
            />

            {/* Floating Live Floor Price Pill right above the cursor */}
            <g
              transform={`translate(${Math.max(
                PAD_LEFT + 25,
                Math.min(PAD_LEFT + PLOT_WIDTH - 45, currentX)
              ) - 36}, ${Math.max(PAD_TOP + 14, currentY - 26)})`}
            >
              <rect
                width="72"
                height="20"
                rx="4"
                fill="#083344"
                stroke="#22d3ee"
                strokeWidth="1.5"
                filter="url(#glowCyan)"
              />
              <text
                x="36"
                y="14"
                textAnchor="middle"
                fill="#67e8f9"
                fontSize="10"
                fontWeight="bold"
                fontFamily="monospace"
              >
                ${currentBid}
              </text>
            </g>
          </g>

          {/* ── Time Axis Markers at Bottom ── */}
          <g transform={`translate(0, ${PAD_TOP + PLOT_HEIGHT + 18})`}>
            <text x={getX(totalDuration)} y="0" textAnchor="start" fill="#475569" fontSize="9" fontFamily="monospace">
              T-240s
            </text>
            <text x={getX(120)} y="0" textAnchor="middle" fill="#475569" fontSize="9" fontFamily="monospace">
              120s
            </text>
            <text x={getX(60)} y="0" textAnchor="middle" fill="#475569" fontSize="9" fontFamily="monospace">
              60s
            </text>
            <text x={getX(30)} y="0" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="bold" fontFamily="monospace">
              30s
            </text>
            <text x={getX(5)} y="0" textAnchor="middle" fill="#f87171" fontSize="9" fontWeight="bold" fontFamily="monospace">
              5s
            </text>
            <text x={getX(0)} y="0" textAnchor="end" fill="#c084fc" fontSize="9" fontWeight="bold" fontFamily="monospace">
              0s Hammer
            </text>
          </g>
        </svg>
      </div>

      {/* Clock Friction Live Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
        {/* 30s Phase */}
        <div
          className={`rounded-lg p-2 border transition-all ${
            timeRemaining <= 30 && timeRemaining > 5
              ? "border-amber-500 bg-amber-950/40 text-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.3)] animate-pulse"
              : timeRemaining <= 5
              ? "border-slate-800 bg-slate-900/40 text-slate-500 line-through"
              : "border-slate-800 bg-slate-900/60 text-slate-400"
          }`}
        >
          <div className="flex items-center justify-between font-bold mb-0.5">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>30s Clock Fight</span>
            </span>
            <span>{timeRemaining <= 30 ? "TRIGGERED" : `In ${Math.max(0, timeRemaining - 30)}s`}</span>
          </div>
          <p className="text-[9px] text-slate-400 font-sans">
            Late proxy bots place escalations (+ $10 to $25).
          </p>
        </div>

        {/* 5s Sniping Phase */}
        <div
          className={`rounded-lg p-2 border transition-all ${
            timeRemaining <= 5 && timeRemaining > 1
              ? "border-rose-500 bg-rose-950/60 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.4)] animate-pulse"
              : timeRemaining <= 1
              ? "border-slate-800 bg-slate-900/40 text-slate-500 line-through"
              : "border-slate-800 bg-slate-900/60 text-slate-400"
          }`}
        >
          <div className="flex items-center justify-between font-bold mb-0.5">
            <span className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-rose-400" />
              <span>5s Sniping Blitz</span>
            </span>
            <span>{timeRemaining <= 5 ? "ACTIVE" : `In ${Math.max(0, timeRemaining - 5)}s`}</span>
          </div>
          <p className="text-[9px] text-slate-400 font-sans">
            High-speed rival snipers fire (+ $25 to $50).
          </p>
        </div>

        {/* 1s Final Push & Resolution */}
        <div
          className={`rounded-lg p-2 border transition-all ${
            timeRemaining <= 1
              ? "border-purple-400 bg-purple-950/60 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.5)] animate-pulse"
              : "border-slate-800 bg-slate-900/60 text-slate-400"
          }`}
        >
          <div className="flex items-center justify-between font-bold mb-0.5">
            <span className="flex items-center gap-1">
              <Gavel className="h-3 w-3 text-purple-300" />
              <span>1s Final Hammer</span>
            </span>
            <span>{timeRemaining <= 1 ? "HAMMER DROP" : `In ${timeRemaining}s`}</span>
          </div>
          <p className="text-[9px] text-slate-400 font-sans">
            Underwritten Vickrey clearing price resolved.
          </p>
        </div>
      </div>

      {/* Live Bid Stream Activity Feed */}
      {bidEvents && bidEvents.length > 0 && (
        <div className="rounded-lg bg-black/40 border border-slate-800/80 p-2.5 text-[10px] space-y-1.5">
          <div className="flex items-center justify-between text-[9px] text-slate-500 uppercase font-bold tracking-wider pb-1 border-b border-slate-800">
            <span>Dynamic Bidding Log</span>
            <span>{bidEvents.length} recorded events</span>
          </div>
          <div className="max-h-24 overflow-y-auto space-y-1 pr-1 font-mono">
            {bidEvents.slice(-5).reverse().map((ev, idx) => (
              <div key={idx} className="flex items-center justify-between text-[10px] border-b border-slate-900 pb-0.5">
                <span className="flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      ev.bidder === "user"
                        ? "bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]"
                        : ev.bidder === "rival"
                        ? "bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.8)]"
                        : "bg-cyan-400"
                    }`}
                  />
                  <span className={ev.bidder === "user" ? "text-emerald-300 font-bold" : ev.bidder === "rival" ? "text-rose-300" : "text-slate-300"}>
                    {ev.bidder === "user" ? "★ Your Accepted Bid" : ev.bidder === "rival" ? "⚡ Rival Sniper" : "Floor Discovery"}
                  </span>
                  {ev.note && <span className="text-[9px] text-slate-500">({ev.note})</span>}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">${ev.amount.toLocaleString()}</span>
                  <span className="text-[9px] text-slate-400 bg-slate-900 px-1 py-0.5 rounded border border-slate-800">
                    @{ev.clockSecs}s
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
