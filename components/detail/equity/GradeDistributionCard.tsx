'use client';
import React, { useMemo } from 'react';
import { BarChart3, Award } from 'lucide-react';
import Panel from './Panel';
import { GRADE_ORDER } from './shared';

export interface GradeDistributionCardProps {
  censusSummary?: {
    totalGraded?: number;
    highGradeCount?: number;
    histogram?: Array<{ grade: string; count: number }>;
  } | null;
  gradeLattice?: Array<{
    grade: string;
    priceUsd: number;
    salesVolume?: number | null;
  }> | null;
  eraColors: {
    border: string;
    bg: string;
    bgHover: string;
    glow: string;
  };
}

interface DistributionItem {
  grade: string;
  count: number;
}

/**
 * Extracts numeric grade from string (e.g. '9.8' -> 9.8, 'CGC 9.6' -> 9.6, 'RAW' -> 0).
 */
function parseGradeNumber(gradeStr: string): number {
  if (!gradeStr) return 0;
  const match = gradeStr.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

/**
 * Sorts grades in descending order (highest first).
 * Falls back to predefined GRADE_ORDER index if numeric values match.
 */
function compareGradesDescending(a: string, b: string): number {
  const numA = parseGradeNumber(a);
  const numB = parseGradeNumber(b);
  if (numA !== numB) {
    return numB - numA;
  }
  const idxA = GRADE_ORDER.indexOf(a);
  const idxB = GRADE_ORDER.indexOf(b);
  if (idxA !== -1 && idxB !== -1) {
    return idxA - idxB;
  }
  if (idxA !== -1) return -1;
  if (idxB !== -1) return 1;
  return a.localeCompare(b);
}

/**
 * Determines horizontal bar color:
 * - >= 9.6: accent color (eraColors.border)
 * - 9.0 - 9.4: #60a5fa (blue)
 * - < 9.0: #94a3b8 (slate)
 */
function getGradeBarColor(grade: string, accentColor: string): string {
  const num = parseGradeNumber(grade);
  if (num >= 9.6) {
    return accentColor;
  }
  if (num >= 9.0) {
    return '#60a5fa';
  }
  return '#94a3b8';
}

export default function GradeDistributionCard({
  censusSummary,
  gradeLattice,
  eraColors,
}: GradeDistributionCardProps) {
  // 1. Resolve histogram items (census histogram preferred, otherwise synthetic from gradeLattice)
  const items: DistributionItem[] = useMemo(() => {
    if (Array.isArray(censusSummary?.histogram) && censusSummary.histogram.length > 0) {
      return censusSummary.histogram
        .filter((h) => h && h.grade != null)
        .map((h) => ({
          grade: String(h.grade),
          count: typeof h.count === 'number' && !isNaN(h.count) ? Math.max(0, h.count) : 0,
        }));
    }

    if (Array.isArray(gradeLattice) && gradeLattice.length > 0) {
      const gradeMap = new Map<string, number>();
      for (const g of gradeLattice) {
        if (!g || g.grade == null) continue;
        const gr = String(g.grade);
        const vol =
          typeof g.salesVolume === 'number' && !isNaN(g.salesVolume) && g.salesVolume > 0
            ? Math.round(g.salesVolume)
            : 1;
        gradeMap.set(gr, (gradeMap.get(gr) ?? 0) + vol);
      }
      return Array.from(gradeMap.entries()).map(([grade, count]) => ({
        grade,
        count,
      }));
    }

    return [];
  }, [censusSummary?.histogram, gradeLattice]);

  // 2. Sort grades descending and take top 8 max
  const displayItems = useMemo(() => {
    if (items.length === 0) return [];
    return [...items]
      .sort((a, b) => compareGradesDescending(a.grade, b.grade))
      .slice(0, 8);
  }, [items]);

  // 3. Proportional bar calculation
  const maxCount = useMemo(() => {
    if (displayItems.length === 0) return 1;
    return Math.max(...displayItems.map((item) => item.count), 1);
  }, [displayItems]);

  // 4. Summary stats calculation
  const totalGraded = useMemo(() => {
    if (typeof censusSummary?.totalGraded === 'number' && !isNaN(censusSummary.totalGraded)) {
      return censusSummary.totalGraded;
    }
    return items.reduce((acc, curr) => acc + curr.count, 0);
  }, [censusSummary?.totalGraded, items]);

  const highGradeCount = useMemo(() => {
    if (typeof censusSummary?.highGradeCount === 'number' && !isNaN(censusSummary.highGradeCount)) {
      return censusSummary.highGradeCount;
    }
    return items
      .filter((item) => parseGradeNumber(item.grade) >= 9.6)
      .reduce((acc, curr) => acc + curr.count, 0);
  }, [censusSummary?.highGradeCount, items]);

  // 5. Concentration calculation
  const concentrationPct = totalGraded > 0 ? (highGradeCount / totalGraded) * 100 : 0;
  const concentrationFormatted = concentrationPct.toFixed(1);

  // Color-code: > 20% green, 10-20% amber, < 10% red
  const concentrationColor = useMemo(() => {
    if (concentrationPct > 20) return '#22c55e';
    if (concentrationPct >= 10) return '#f59e0b';
    return '#ef4444';
  }, [concentrationPct]);

  // Fallback: If no data at all
  if (displayItems.length === 0) {
    return (
      <Panel
        title="Grade Distribution"
        icon={<BarChart3 className="w-3.5 h-3.5" />}
        eraColors={eraColors as any}
      >
        <div
          className="text-xs text-center py-5 select-none"
          style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Hind, sans-serif' }}
        >
          Census data unavailable
        </div>
      </Panel>
    );
  }

  return (
    <Panel
      title="Grade Distribution"
      icon={<BarChart3 className="w-3.5 h-3.5" />}
      eraColors={eraColors as any}
    >
      <div className="space-y-0 select-none">
        {/* Horizontal Bar Chart Rows */}
        <div>
          {displayItems.map((item, idx) => {
            const isLast = idx === displayItems.length - 1;
            const barColor = getGradeBarColor(item.grade, eraColors.border);
            const widthPct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
            const barWidth = item.count > 0 ? Math.max(2, widthPct) : 0;

            return (
              <div
                key={`${item.grade}-${idx}`}
                className="flex items-center gap-2 py-1.5"
                style={{
                  borderBottom: !isLast ? '1px solid rgba(255,255,255,0.04)' : undefined,
                }}
              >
                {/* Left: grade label in 10px monospace */}
                <span
                  className="w-7 shrink-0 text-left font-mono font-medium"
                  style={{
                    fontSize: '10px',
                    color: 'rgba(255,255,255,0.85)',
                  }}
                >
                  {item.grade}
                </span>

                {/* Middle: horizontal bar */}
                <div
                  className="flex-1 rounded-sm overflow-hidden flex items-center"
                  style={{
                    height: '8px',
                    backgroundColor: 'rgba(255,255,255,0.04)',
                  }}
                >
                  <div
                    className="rounded-sm transition-all duration-300"
                    style={{
                      height: '8px',
                      width: `${barWidth}%`,
                      backgroundColor: barColor,
                    }}
                  />
                </div>

                {/* Right: count number in 9px monospace, opacity-60 */}
                <span
                  className="w-9 shrink-0 text-right font-mono"
                  style={{
                    fontSize: '9px',
                    color: '#ffffff',
                    opacity: 0.6,
                  }}
                >
                  {item.count.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>

        {/* Summary Stats Row */}
        <div
          className="grid grid-cols-2 mt-3 pt-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* Left: High Grade (9.6+) */}
          <div
            className="pr-3 flex flex-col justify-center"
            style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-1 mb-1">
              <Award className="w-2.5 h-2.5 shrink-0 opacity-70" style={{ color: eraColors.border }} />
              <span
                className="uppercase tracking-wider font-medium"
                style={{
                  fontSize: '8px',
                  color: 'rgba(255,255,255,0.5)',
                  fontFamily: 'Hind, sans-serif',
                }}
              >
                HIGH GRADE (9.6+)
              </span>
            </div>
            <span
              className="text-base font-semibold leading-tight font-mono"
              style={{ color: eraColors.border }}
            >
              {highGradeCount.toLocaleString()}
            </span>
          </div>

          {/* Right: Total Graded */}
          <div className="pl-3 flex flex-col justify-center">
            <div
              className="uppercase tracking-wider font-medium mb-1"
              style={{
                fontSize: '8px',
                color: 'rgba(255,255,255,0.5)',
                fontFamily: 'Hind, sans-serif',
              }}
            >
              TOTAL GRADED
            </div>
            <span
              className="text-base font-semibold leading-tight font-mono"
              style={{ color: '#ffffff' }}
            >
              {totalGraded.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Grade Concentration */}
        <div
          className="mt-2.5 pt-2 text-center font-mono select-none"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.04)',
            fontSize: '9px',
            color: concentrationColor,
          }}
        >
          <span style={{ opacity: 0.85 }}>CONCENTRATION: </span>
          <span className="font-semibold">{concentrationFormatted}%</span>
        </div>

        {/* Multi-Authority Breakdown Badges */}
        {(censusSummary as any)?.authorities && (censusSummary as any).authorities.length > 0 && (
          <div
            className="mt-2 pt-2 flex items-center justify-between font-mono select-none"
            style={{
              borderTop: '1px solid rgba(255,255,255,0.04)',
              fontSize: '8px',
            }}
          >
            <span className="uppercase tracking-wider text-white/50">Graders:</span>
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {Object.entries(
                (censusSummary as any).authorities.reduce((acc: Record<string, number>, curr: any) => {
                  const auth = curr.grading_authority || curr.authority || 'CGC';
                  const cnt = Number(curr.population_count || curr.count || 0);
                  acc[auth] = (acc[auth] || 0) + cnt;
                  return acc;
                }, {})
              ).map(([auth, cnt]) => {
                const pct = totalGraded > 0 ? (((cnt as number) / totalGraded) * 100).toFixed(0) : '0';
                return (
                  <span
                    key={auth}
                    className="px-1.5 py-0.5 rounded font-medium"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      color: auth === 'CGC' ? '#38bdf8' : auth === 'CBCS' ? '#fbbf24' : auth === 'PSA' ? '#f87171' : '#c084fc',
                      border: '1px solid rgba(255,255,255,0.08)'
                    }}
                    title={`${auth}: ${Number(cnt).toLocaleString()} slabs`}
                  >
                    {auth} {pct}%
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}
