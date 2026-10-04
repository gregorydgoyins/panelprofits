'use client';
import React from 'react';

export interface CensusBannerProps {
  censusSummary: {
    totalGraded: number;
    highGradeCount: number;
    snapshotDate: string;
    histogram: { grade: string; count: number }[];
  } | null | undefined;
  eraColors: { border: string; bg: string; bgHover: string; glow: string };
  scarcityLabel?: string;
}

/**
 * Formats a snapshot date string into a clean readable date representation (e.g., 'Mar 15, 2024').
 * Handles YYYY-MM-DD cleanly without timezone day-shift artifacts.
 */
function formatSnapshotDate(dateStr?: string | null): string {
  if (!dateStr) return 'Latest';
  try {
    const parts = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    let d: Date;
    if (parts) {
      d = new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]));
    } else {
      d = new Date(dateStr);
    }
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return String(dateStr);
  }
}

export default function CensusBanner({
  censusSummary,
  eraColors,
  scarcityLabel,
}: CensusBannerProps) {
  // Guard: If censusSummary is null/undefined, do not render
  if (!censusSummary) return null;

  const totalGraded = typeof censusSummary.totalGraded === 'number' ? censusSummary.totalGraded : 0;
  const highGradeCount = typeof censusSummary.highGradeCount === 'number' ? censusSummary.highGradeCount : 0;

  // Stat 3: High-Grade Ratio (percentage = highGradeCount / totalGraded * 100, formatted to 1 decimal)
  const ratio = totalGraded > 0 ? (highGradeCount / totalGraded) * 100 : 0;
  const formattedRatio = `${ratio.toFixed(1)}%`;

  // Stat 4: Scarcity Signal
  // if highGradeCount < 100, show '🔥 SCARCE' in red/orange. If < 50, show '💎 ULTRA RARE'. If < 10, show '⚡ UNICORN'. Otherwise show the scarcityLabel or 'COMMON CENSUS'
  let scarcitySignal = '';
  let scarcityColor = '';

  if (highGradeCount < 10) {
    scarcitySignal = '⚡ UNICORN';
    scarcityColor = '#fbbf24'; // electric gold/amber
  } else if (highGradeCount < 50) {
    scarcitySignal = '💎 ULTRA RARE';
    scarcityColor = '#38bdf8'; // diamond cyan
  } else if (highGradeCount < 100) {
    scarcitySignal = '🔥 SCARCE';
    scarcityColor = '#f97316'; // red/orange
  } else {
    scarcitySignal = scarcityLabel || 'COMMON CENSUS';
    scarcityColor = 'rgba(255,255,255,0.75)';
  }

  const borderAccent = eraColors?.border || '#C9A227';
  // 20% opacity border
  const borderOpacity20 = borderAccent.startsWith('#')
    ? `${borderAccent}33`
    : 'rgba(255,255,255,0.2)';

  const formattedSnapshotDate = formatSnapshotDate(censusSummary.snapshotDate);

  return (
    <div
      className="mb-4 rounded px-3.5 py-3 w-full"
      style={{
        backgroundColor: 'rgba(255,255,255,0.025)',
        border: `1px solid ${borderOpacity20}`,
        borderLeft: `3px solid ${borderAccent}`,
      }}
    >
      {/* Section label at top */}
      <div
        className="uppercase tracking-wider font-mono mb-2.5 flex items-center gap-1.5 select-none"
        style={{
          fontSize: '9px',
          letterSpacing: '0.12em',
          fontFamily: 'monospace',
          color: 'rgba(255,255,255,0.55)',
        }}
      >
        <span>📊 CGC CENSUS POPULATION</span>
      </div>

      {/* 4 Stat Blocks Grid: 2x2 grid on mobile (< md), 4 across on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {/* Stat 1: Total Graded */}
        <div className="flex flex-col justify-between">
          <span
            className="text-[9px] uppercase tracking-wider mb-1"
            style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Hind, sans-serif' }}
          >
            Total Graded
          </span>
          <span
            className="text-lg md:text-xl font-bold leading-tight"
            style={{ color: '#ffffff', fontFamily: 'monospace' }}
          >
            {totalGraded.toLocaleString()}
          </span>
          <span
            className="text-[8px] uppercase tracking-wider mt-1"
            style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}
          >
            POPULATION
          </span>
        </div>

        {/* Stat 2: 9.8+ Count */}
        <div className="flex flex-col justify-between">
          <span
            className="text-[9px] uppercase tracking-wider mb-1"
            style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Hind, sans-serif' }}
          >
            9.8+ Count
          </span>
          <span
            className="text-lg md:text-xl font-bold leading-tight"
            style={{ color: borderAccent, fontFamily: 'monospace' }}
          >
            {highGradeCount.toLocaleString()}
          </span>
          <span
            className="text-[8px] uppercase tracking-wider mt-1 font-semibold"
            style={{ color: borderAccent, opacity: 0.85, fontFamily: 'monospace' }}
          >
            HIGH GRADE
          </span>
        </div>

        {/* Stat 3: High-Grade Ratio */}
        <div className="flex flex-col justify-between">
          <span
            className="text-[9px] uppercase tracking-wider mb-1"
            style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Hind, sans-serif' }}
          >
            High-Grade Ratio
          </span>
          <span
            className="text-lg md:text-xl font-bold leading-tight"
            style={{ color: '#ffffff', fontFamily: 'monospace' }}
          >
            {formattedRatio}
          </span>
          <span
            className="text-[8px] uppercase tracking-wider mt-1"
            style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}
          >
            OF TOTAL CENSUS
          </span>
        </div>

        {/* Stat 4: Scarcity Signal */}
        <div className="flex flex-col justify-between">
          <span
            className="text-[9px] uppercase tracking-wider mb-1"
            style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Hind, sans-serif' }}
          >
            Scarcity Signal
          </span>
          <span
            className="text-base md:text-lg font-bold leading-tight"
            style={{ color: scarcityColor, fontFamily: 'monospace' }}
          >
            {scarcitySignal}
          </span>
          <span
            className="text-[8px] uppercase tracking-wider mt-1"
            style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}
          >
            {scarcityLabel && highGradeCount < 100 ? scarcityLabel : 'CENSUS STATUS'}
          </span>
        </div>
      </div>

      {/* Bottom text */}
      <div
        className="mt-3 pt-2 text-[8px] md:text-[9px]"
        style={{
          borderTop: `1px solid ${borderOpacity20}`,
          color: 'rgba(255,255,255,0.35)',
          fontFamily: 'monospace',
        }}
      >
        CGC Census · Universal + SS · {formattedSnapshotDate}
      </div>
    </div>
  );
}
