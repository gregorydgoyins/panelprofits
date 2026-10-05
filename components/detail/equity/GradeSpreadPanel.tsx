import React, { useMemo } from 'react';
import { BarChart2 } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { getEraColors } from '@/lib/design-system/colors';
import { withAlpha } from '@/lib/colorUtils';
import type { GradePrice, HistoryEntry } from './types';
import Panel from './Panel';
import AISectionBlock from './AISectionBlock';
import { GRADE_ORDER, fmt } from './shared';
import { DataTable } from '@/components/ui/DataTable';

type GradeRow = GradePrice & { delta: number | null; prem: number | null };

function fmtPct(v: number | null, showPlus = true): string {
  if (v == null) return '—';
  return (showPlus && v > 0 ? '+' : '') + v.toFixed(0) + '%';
}

function fmtMultiple(v: number | null): string {
  if (v == null || v <= 0) return '—';
  return v >= 10 ? `${v.toFixed(0)}×` : `${v.toFixed(1)}×`;
}

function premiumColor(pct: number | null): string {
  if (pct == null) return 'rgba(255,255,255,0.25)';
  if (pct > 2000) return '#f87171';
  if (pct > 500)  return '#fb923c';
  if (pct > 100)  return '#fde68a';
  if (pct > 0)    return '#86efac';
  return 'rgba(255,255,255,0.3)';
}

export default function GradeSpreadPanel({ grades, eraColors, priceHistory = [], censusNarrative, survivorBias, identityConfidence, headerAction, compareGrades, compareName, primaryName }: {
  grades: GradePrice[];
  eraColors: ReturnType<typeof getEraColors>;
  priceHistory?: HistoryEntry[];
  censusNarrative?: string | null;
  survivorBias?: string | null;
  identityConfidence?: number | null;
  headerAction?: React.ReactNode;
  compareGrades?: GradePrice[];
  compareName?: string;
  primaryName?: string;
}) {
  const COMPARE_COLOR = '#38bdf8';
  const isComparing = !!compareGrades && compareGrades.length > 0;

  const gradeTrendPct = useMemo(() => {
    const map: Record<string, number> = {};
    const byGrade: Record<string, HistoryEntry[]> = {};
    for (const h of priceHistory) (byGrade[h.grade] ||= []).push(h);
    for (const [grade, entries] of Object.entries(byGrade)) {
      const s = [...entries].sort((a, b) => a.observedAt.localeCompare(b.observedAt));
      if (s.length < 2) continue;
      const first = s[0].priceUsd, last = s[s.length - 1].priceUsd;
      if (first === 0) continue;
      map[grade] = ((last - first) / first) * 100;
    }
    return map;
  }, [priceHistory]);

  const trendBarColor = (grade: string, isAnchor: boolean, isRaw: boolean): string => {
    const pct = gradeTrendPct[grade];
    if (pct == null) return isAnchor ? eraColors.border : isRaw ? 'rgba(255,255,255,0.2)' : withAlpha(eraColors.border, 0.314);
    if (pct > 2)  return isAnchor ? '#22c55e' : '#22c55e90';
    if (pct < -2) return isAnchor ? '#ef4444' : '#ef444490';
    return isAnchor ? '#eab308' : '#eab30880';
  };

  const trendTextColor = (grade: string, fallback: string): string => {
    const pct = gradeTrendPct[grade];
    if (pct == null) return fallback;
    if (pct > 2)  return '#4ade80';
    if (pct < -2) return '#f87171';
    return '#fde68a';
  };

  const sorted = useMemo(() => {
    return [...grades]
      .sort((a, b) => {
        const ai = GRADE_ORDER.indexOf(a.grade), bi = GRADE_ORDER.indexOf(b.grade);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      })
      .filter(g => g.priceUsd > 0);
  }, [grades]);

  const compareMap = useMemo(() => {
    if (!compareGrades) return {} as Record<string, GradePrice>;
    const m: Record<string, GradePrice> = {};
    for (const g of compareGrades) m[g.grade] = g;
    return m;
  }, [compareGrades]);

  const comparedSorted = useMemo(() => {
    if (!isComparing) return sorted.map(g => g.grade);
    const gradeSet = new Set<string>();
    sorted.forEach(g => gradeSet.add(g.grade));
    compareGrades?.forEach(g => { if (g.priceUsd > 0) gradeSet.add(g.grade); });
    return [...gradeSet]
      .sort((a, b) => {
        const ai = GRADE_ORDER.indexOf(a), bi = GRADE_ORDER.indexOf(b);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });
  }, [sorted, compareGrades, isComparing]);

  const primaryMap = useMemo(() => {
    const m: Record<string, GradePrice> = {};
    for (const g of sorted) m[g.grade] = g;
    return m;
  }, [sorted]);

  const rawEntry = sorted.find(g => g.grade === 'RAW');
  const rawFloor = rawEntry?.priceUsd ?? 0;

  const gradeDelta = (idx: number): number | null => {
    if (idx >= sorted.length - 1) return null;
    const curr = sorted[idx].priceUsd, lower = sorted[idx + 1].priceUsd;
    if (!lower) return null;
    return ((curr - lower) / lower) * 100;
  };

  const rawPremium = (priceUsd: number): number | null => {
    if (!rawFloor) return null;
    return ((priceUsd - rawFloor) / rawFloor) * 100;
  };

  const sortedWithDelta = useMemo<GradeRow[]>(() =>
    sorted.map((g, idx) => ({ ...g, delta: gradeDelta(idx), prem: rawPremium(g.priceUsd) })),
  [sorted]);

  const gradeColumns = useMemo<ColumnDef<GradeRow>[]>(() => {
    const localMax = sortedWithDelta.reduce((m, g) => Math.max(m, g.priceUsd), 0);
    return [
      {
        id: 'grade',
        header: 'Grade',
        accessorFn: (g) => { const i = GRADE_ORDER.indexOf(g.grade); return i === -1 ? 99 : i; },
        enableSorting: true,
        meta: { className: 'w-[4.5rem]' },
        cell: ({ row }) => {
          const g = row.original;
          const isAnchor = g.grade === '9.8', isRaw = g.grade === 'RAW';
          return (
            <div className="flex items-center gap-1">
              <span className="text-[10px]" style={{ color: isAnchor ? eraColors.border : isRaw ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.65)', fontFamily: 'monospace' }}>
                {isRaw ? 'RAW' : `CGC ${g.grade}`}
              </span>
              {isAnchor && <span className="text-[7px] px-0.5 rounded" style={{ backgroundColor: withAlpha(eraColors.border, 0.125), color: withAlpha(eraColors.border, 0.8) }}>anchor</span>}
            </div>
          );
        },
      },
      {
        id: 'bar',
        header: '',
        accessorFn: (g) => g.priceUsd,
        enableSorting: false,
        cell: ({ row }) => {
          const g = row.original;
          const isAnchor = g.grade === '9.8', isRaw = g.grade === 'RAW';
          const barW = localMax > 0 ? Math.max(2, (g.priceUsd / localMax) * 100) : 0;
          return (
            <div className="flex items-center min-w-0">
              <div className="relative flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <div className="absolute left-0 top-0 bottom-0 rounded-full" style={{ width: `${barW}%`, backgroundColor: trendBarColor(g.grade, isAnchor, isRaw) }} />
              </div>
            </div>
          );
        },
      },
      {
        id: 'price',
        header: 'Price',
        accessorKey: 'priceUsd',
        enableSorting: true,
        meta: { className: 'text-right w-[5.5rem]' },
        cell: ({ row }) => {
          const g = row.original;
          const isAnchor = g.grade === '9.8';
          return (
            <div className="text-right">
              <span className="text-[11px]" style={{ fontFamily: 'monospace', color: trendTextColor(g.grade, isAnchor ? '#fff' : 'rgba(255,255,255,0.75)') }}>{fmt(g.priceUsd)}</span>
              {g.observedAt && <div className="text-[7px]" style={{ color: 'rgba(255,255,255,0.2)' }}>{new Date(g.observedAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}</div>}
            </div>
          );
        },
      },
      {
        id: 'vsRaw',
        header: 'vs RAW',
        accessorKey: 'prem',
        enableSorting: false,
        meta: { className: 'text-right w-[5.5rem]' },
        cell: ({ row }) => {
          const g = row.original;
          const isRaw = g.grade === 'RAW';
          return (
            <div className="text-right">
              {isRaw
                ? <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>floor</span>
                : <span className="text-[10px]" style={{ color: premiumColor(g.prem), fontFamily: 'monospace' }}>{fmtPct(g.prem)}</span>}
            </div>
          );
        },
      },
      {
        id: 'step',
        header: 'Step ↑',
        accessorKey: 'delta',
        enableSorting: false,
        meta: { className: 'text-right w-[4rem]' },
        cell: ({ row }) => {
          const g = row.original;
          return (
            <div className="text-right">
              {g.delta != null
                ? <span className="text-[9px]" style={{ color: g.delta > 50 ? '#fde68a' : 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{fmtPct(g.delta)}</span>
                : <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.40)', fontFamily: 'monospace' }}>—</span>}
            </div>
          );
        },
      },
      {
        id: 'volume',
        header: 'Volume',
        accessorFn: (g) => g.salesVolume ?? -1,
        enableSorting: true,
        meta: { className: 'text-right w-[3.5rem]' },
        cell: ({ row }) => {
          const g = row.original;
          const hasVol = (g.salesVolume ?? 0) > 0;
          return (
            <div className="text-right">
              {hasVol
                ? <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace' }}>{(g.salesVolume as number).toLocaleString()}</span>
                : <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.40)', fontFamily: 'monospace' }}>—</span>}
            </div>
          );
        },
      },
    ];
  }, [sortedWithDelta, eraColors, trendBarColor, trendTextColor]);

  const topInflections = useMemo(() => {
    return sorted.map((g, idx) => {
      const delta = gradeDelta(idx);
      if (delta == null || delta <= 0) return null;
      return { from: sorted[idx + 1].grade, to: g.grade, delta, toUsd: g.priceUsd };
    }).filter(Boolean).sort((a, b) => b!.delta - a!.delta).slice(0, 4) as { from: string; to: string; delta: number; toUsd: number }[];
  }, [sorted]);

  const compressionZones = useMemo(() => {
    const zones: { low: string; high: string; pct: number }[] = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      const delta = gradeDelta(i);
      if (delta != null && delta >= 0 && delta < 8) zones.push({ low: sorted[i + 1].grade, high: sorted[i].grade, pct: delta });
    }
    return zones;
  }, [sorted]);

  const sweetSpotGrade = useMemo(() => {
    const withVol = sorted.filter(g => (g.salesVolume ?? 0) > 0);
    if (withVol.length === 0) return null;
    const medianPrice = sorted[Math.floor(sorted.length / 2)]?.priceUsd ?? 0;
    const accessible = withVol.filter(g => g.priceUsd <= medianPrice * 1.25);
    if (accessible.length === 0) return withVol.sort((a, b) => (b.salesVolume as number) - (a.salesVolume as number))[0];
    return accessible.sort((a, b) => (b.salesVolume as number) - (a.salesVolume as number))[0];
  }, [sorted]);

  const trophyGapPct = useMemo(() => {
    const g94 = sorted.find(g => g.grade === '9.4'), g92 = sorted.find(g => g.grade === '9.2');
    if (!g94 || !g92 || g92.priceUsd === 0) return null;
    return ((g94.priceUsd - g92.priceUsd) / g92.priceUsd) * 100;
  }, [sorted]);

  const crownGapPct = useMemo(() => {
    const g98 = sorted.find(g => g.grade === '9.8'), g96 = sorted.find(g => g.grade === '9.6');
    if (!g98 || !g96 || g96.priceUsd === 0) return null;
    return ((g98.priceUsd - g96.priceUsd) / g96.priceUsd) * 100;
  }, [sorted]);

  if (sorted.length === 0) return null;

  const ceiling = sorted.find(g => g.grade === '9.8')?.priceUsd ?? sorted[0].priceUsd;
  const primaryMax = sorted[0]?.priceUsd ?? 0;
  const compareMax = (compareGrades && compareGrades.length > 0) ? Math.max(...compareGrades.map(g => g.priceUsd), 0) : 0;
  const maxPrice = isComparing ? Math.max(primaryMax, compareMax) : primaryMax;
  const liquidGrades = sorted.filter(g => (g.salesVolume ?? 0) > 0).length;
  const spreadMultiple = rawFloor > 0 ? ceiling / rawFloor : null;

  const lowConfidence = identityConfidence != null && identityConfidence < 75;

  return (
    <Panel title="Grade Spread" icon={<BarChart2 className="w-3.5 h-3.5" />} eraColors={eraColors} action={headerAction}>

      {lowConfidence && (
        <div className="flex items-center gap-2 mb-3 px-2 py-1.5 rounded" style={{ backgroundColor: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#f59e0b', flexShrink: 0, boxShadow: '0 0 5px #f59e0baa' }} />
          <span style={{ fontSize: '9px', color: 'rgba(245,158,11,0.85)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Price data may be derived from a reprint product · identity confidence {identityConfidence}%</span>
        </div>
      )}

      {/* Comparison legend */}
      {isComparing && (
        <div className="flex items-center gap-4 mb-3 px-2 py-1.5 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-1.5">
            <span style={{ display: 'inline-block', width: '16px', height: '3px', borderRadius: '2px', backgroundColor: eraColors.border }} />
            <span className="text-[8px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>{primaryName ?? 'Issue A'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span style={{ display: 'inline-block', width: '16px', height: '3px', borderRadius: '2px', backgroundColor: COMPARE_COLOR }} />
            <span className="text-[8px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>{compareName ?? 'Issue B'}</span>
          </div>
          <span className="text-[7px] ml-auto" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>comparison mode</span>
        </div>
      )}

      {/* Summary header — comparison mode shows both issues */}
      {isComparing ? (
        <div className="grid grid-cols-2 gap-3 mb-4 pb-3" style={{ borderBottom: `1px solid ${withAlpha(eraColors.border, 0.082)}` }}>
          {[
            { label: primaryName ?? 'Issue A', color: eraColors.border, ceiling: sorted.find(g => g.grade === '9.8')?.priceUsd ?? sorted[0]?.priceUsd ?? 0, raw: sorted.find(g => g.grade === 'RAW')?.priceUsd ?? 0, count: sorted.length },
            { label: compareName ?? 'Issue B', color: COMPARE_COLOR, ceiling: compareGrades?.find(g => g.grade === '9.8')?.priceUsd ?? (compareGrades ?? [])[0]?.priceUsd ?? 0, raw: compareGrades?.find(g => g.grade === 'RAW')?.priceUsd ?? 0, count: (compareGrades ?? []).filter(g => g.priceUsd > 0).length },
          ].map(({ label, color, ceiling: c, raw: r, count }) => (
            <div key={label} className="flex flex-col gap-1.5 rounded px-2 py-1.5" style={{ backgroundColor: withAlpha(color, 0.031), border: `1px solid ${withAlpha(color, 0.125)}` }}>
              <div className="text-[8px] uppercase tracking-widest truncate" style={{ color }}>{label}</div>
              <div className="grid grid-cols-3 gap-1">
                <div>
                  <div className="text-[7px]" style={{ color: 'rgba(255,255,255,0.3)' }}>9.8</div>
                  <div className="text-[10px]" style={{ color: '#fff', fontFamily: 'monospace' }}>{c > 0 ? fmt(c) : '—'}</div>
                </div>
                <div>
                  <div className="text-[7px]" style={{ color: 'rgba(255,255,255,0.3)' }}>RAW</div>
                  <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>{r > 0 ? fmt(r) : '—'}</div>
                </div>
                <div>
                  <div className="text-[7px]" style={{ color: 'rgba(255,255,255,0.3)' }}>grades</div>
                  <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>{count}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3 mb-4 pb-3" style={{ borderBottom: `1px solid ${withAlpha(eraColors.border, 0.082)}` }}>
          {[
            { label: 'RAW Floor', value: rawFloor > 0 ? fmt(rawFloor) : '—', sub: 'ungraded baseline' },
            { label: '9.8 Ceiling', value: fmt(ceiling), sub: 'sovereign anchor', accent: eraColors.border },
            { label: 'Spread', value: fmtMultiple(spreadMultiple), sub: rawFloor > 0 ? 'RAW → 9.8 multiple' : 'no raw price', accent: spreadMultiple && spreadMultiple > 10 ? '#f87171' : '#fde68a' },
            { label: 'Liquid Grades', value: liquidGrades > 0 ? `${liquidGrades} of ${sorted.length}` : `${sorted.length} priced`, sub: liquidGrades > 0 ? 'have sales volume' : 'volume unknown' },
          ].map(({ label, value, sub, accent }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <div className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.76)' }}>{label}</div>
              <div className="text-[13px]" style={{ color: accent || '#fff', fontFamily: 'monospace' }}>{value}</div>
              <div className="text-[8px]" style={{ color: 'rgba(255,255,255,0.2)' }}>{sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Column headers for compare mode */}
      {isComparing && (
        <div className="grid items-center gap-2 pb-1.5 mb-1" style={{ gridTemplateColumns: '4.5rem 1fr 5.5rem 5.5rem', borderBottom: 'rgba(255,255,255,0.06) 1px solid' }}>
          {['Grade', '', 'A Price', 'B Price'].map(h => (
            <span key={h} className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.48)', textAlign: h === '' ? 'left' : 'right' }}>{h}</span>
          ))}
        </div>
      )}

      {/* Grade rows */}
      {isComparing ? (
        <div className="flex flex-col gap-0.5">
          {comparedSorted.map(grade => {
            const isAnchor = grade === '9.8', isRaw = grade === 'RAW';
            const pA = primaryMap[grade]?.priceUsd ?? 0;
            const pB = compareMap[grade]?.priceUsd ?? 0;
            const barA = maxPrice > 0 && pA > 0 ? Math.max(2, (pA / maxPrice) * 100) : 0;
            const barB = maxPrice > 0 && pB > 0 ? Math.max(2, (pB / maxPrice) * 100) : 0;
            return (
              <div key={grade} className="grid items-center gap-2 rounded px-1 py-1.5" style={{
                gridTemplateColumns: '4.5rem 1fr 5.5rem 5.5rem',
                backgroundColor: isAnchor ? withAlpha(eraColors.border, 0.039) : 'transparent',
                borderLeft: isAnchor ? `2px solid ${withAlpha(eraColors.border, 0.376)}` : '2px solid transparent',
              }}>
                <div className="flex items-center gap-1">
                  <span className="text-[10px]" style={{ color: isAnchor ? eraColors.border : isRaw ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.65)', fontFamily: 'monospace' }}>
                    {isRaw ? 'RAW' : `CGC ${grade}`}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="relative flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    {barA > 0 && <div className="absolute left-0 top-0 bottom-0 rounded-full" style={{ width: `${barA}%`, backgroundColor: withAlpha(eraColors.border, 0.8) }} />}
                  </div>
                  <div className="relative flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    {barB > 0 && <div className="absolute left-0 top-0 bottom-0 rounded-full" style={{ width: `${barB}%`, backgroundColor: withAlpha(COMPARE_COLOR, 0.8) }} />}
                  </div>
                </div>
                <div className="text-right">
                  {pA > 0
                    ? <span className="text-[11px]" style={{ fontFamily: 'monospace', color: eraColors.border }}>{fmt(pA)}</span>
                    : <span className="text-[9px]" style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.2)' }}>—</span>}
                </div>
                <div className="text-right">
                  {pB > 0
                    ? <span className="text-[11px]" style={{ fontFamily: 'monospace', color: COMPARE_COLOR }}>{fmt(pB)}</span>
                    : <span className="text-[9px]" style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.2)' }}>—</span>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <DataTable<GradeRow>
          data={sortedWithDelta}
          columns={gradeColumns}
          getRowKey={(g) => g.grade}
          headerStyle={{ color: 'rgba(255,255,255,0.48)', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 400 }}
          rowStyle={(g) => ({
            backgroundColor: g.grade === '9.8' ? withAlpha(eraColors.border, 0.039) : 'transparent',
            borderLeft: g.grade === '9.8' ? `2px solid ${withAlpha(eraColors.border, 0.376)}` : '2px solid transparent',
            borderRadius: '2px',
          })}
          className="text-[11px]"
          pageSize={9999}
        />
      )}

      {/* Analytics bottom — hidden in comparison mode to keep focus on the bars */}
      {!isComparing && (
        <div className="mt-4 pt-3 grid grid-cols-3 gap-4" style={{ borderTop: `1px solid ${withAlpha(eraColors.border, 0.071)}` }}>

          {/* Key Inflections */}
          <div>
            <div className="text-[8px] uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.48)' }}>Key Inflections</div>
            {topInflections.length === 0 ? (
              <div className="text-[8px]" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'monospace' }}>insufficient grade data</div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {topInflections.map((inf, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{inf.from}</span>
                      <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.40)' }}>→</span>
                      <span className="text-[9px]" style={{ color: inf.delta > 100 ? '#f87171' : inf.delta > 40 ? '#fde68a' : '#86efac', fontFamily: 'monospace' }}>{inf.to}</span>
                    </div>
                    <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
                    <span className="text-[10px] shrink-0" style={{ fontFamily: 'monospace', color: inf.delta > 100 ? '#f87171' : inf.delta > 40 ? '#fde68a' : '#86efac' }}>+{inf.delta.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            )}
            {trophyGapPct != null && (
              <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-[7px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.42)' }}>Trophy boundary</div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>9.2 → 9.4</span>
                  <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
                  <span className="text-[9px]" style={{ color: trophyGapPct > 30 ? '#f59e0b' : 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{trophyGapPct > 0 ? '+' : ''}{trophyGapPct.toFixed(0)}%</span>
                </div>
                {crownGapPct != null && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>9.6 → 9.8</span>
                    <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
                    <span className="text-[9px]" style={{ color: crownGapPct > 30 ? '#f59e0b' : 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{crownGapPct > 0 ? '+' : ''}{crownGapPct.toFixed(0)}%</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Grade Momentum */}
          <div>
            <div className="text-[8px] uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.48)' }}>Grade Momentum</div>
            {Object.keys(gradeTrendPct).length === 0 ? (
              <div className="text-[8px]" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'monospace' }}>no history data</div>
            ) : (
              <div className="flex flex-wrap gap-1">
                {sorted.map(g => {
                  const pct = gradeTrendPct[g.grade];
                  if (pct == null) return null;
                  const up = pct > 2, down = pct < -2;
                  const color = up ? '#4ade80' : down ? '#f87171' : '#fde68a';
                  const arrow = up ? '↑' : down ? '↓' : '→';
                  return (
                    <div key={g.grade} className="flex items-center gap-0.5 px-1.5 py-0.5 rounded" style={{ backgroundColor: withAlpha(color, 0.063), border: `1px solid ${withAlpha(color, 0.145)}` }}>
                      <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.70)', fontFamily: 'monospace' }}>{g.grade}</span>
                      <span className="text-[9px]" style={{ color }}>{arrow}</span>
                      <span className="text-[8px]" style={{ color, fontFamily: 'monospace' }}>{pct > 0 ? '+' : ''}{pct.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            )}
            {sweetSpotGrade && (
              <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-[7px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.42)' }}>Volume sweet spot</div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[11px]" style={{ fontFamily: 'monospace', color: eraColors.border }}>{sweetSpotGrade.grade === 'RAW' ? 'RAW' : `CGC ${sweetSpotGrade.grade}`}</span>
                  <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{fmt(sweetSpotGrade.priceUsd)}</span>
                  <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.76)', fontFamily: 'monospace' }}>{(sweetSpotGrade.salesVolume as number).toLocaleString()} sales</span>
                </div>
                <div className="text-[7px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>highest liquidity at accessible price tier</div>
              </div>
            )}
          </div>

          {/* Spread Intelligence */}
          <div>
            <div className="text-[8px] uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.48)' }}>Spread Intelligence</div>
            <div className="flex flex-col gap-1.5">
              {spreadMultiple != null && spreadMultiple > 1 && (
                <div className="rounded px-2 py-1.5" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="text-[7px] uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>Grade sensitivity</div>
                  <div className="text-[9px]" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace', lineHeight: '1.4' }}>
                    {fmtMultiple(spreadMultiple)} RAW → 9.8 — {spreadMultiple > 50 ? 'extreme: condition is everything' : spreadMultiple > 10 ? 'high: grading adds substantial value' : 'moderate: grade premium exists'}
                  </div>
                </div>
              )}
              {compressionZones.length > 0 && (
                <div className="rounded px-2 py-1.5" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-[7px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.2)' }}>Compression zones <span style={{ color: 'rgba(255,255,255,0.12)' }}>&lt;8% step</span></div>
                  <div className="flex flex-wrap gap-1">
                    {compressionZones.slice(0, 5).map((z, i) => (
                      <div key={i} className="flex items-center gap-0.5">
                        <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{z.low}–{z.high}</span>
                        <span className="text-[7px]" style={{ color: 'rgba(255,255,255,0.40)', fontFamily: 'monospace' }}>{z.pct.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="text-[7px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.42)' }}>vs RAW = premium above ungraded · Step ↑ = lift from next lower grade</div>
            </div>
          </div>

        </div>
      )}

      <AISectionBlock text={censusNarrative} accentColor="#8fadc7" label="Census Intelligence" />
      <AISectionBlock text={survivorBias} accentColor="#b87333" label="Supply Analysis" />
    </Panel>
  );
}
