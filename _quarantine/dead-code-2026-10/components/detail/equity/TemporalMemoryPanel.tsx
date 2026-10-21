'use client';

import { useState, useMemo } from 'react';
import { Clock } from 'lucide-react';
import { getEraColors } from '@/lib/design-system/colors';
import { withAlpha } from '@/lib/colorUtils';
import type { TemporalMemory, GradePrice, HistoryEntry, TitanEvent } from './types';
import Panel from './Panel';
import { fmt, fmtDate } from './shared';

const TIER_LABELS = ['Equilibrium', 'Surface Tremor', 'Fault Tension', 'Structural Shear', 'Seismic Event', 'Regional Collapse', 'Systemic Crisis'];
const TIER_COLORS = ['#4ade80', '#86efac', '#fde68a', '#f59e0b', '#fb923c', '#f87171', '#dc2626'];
const TIER_DESCS = [
  'Market operating within normal parameters.',
  'Mild stress detected. Short overlay, low scar risk.',
  'Sustained directional pressure. Structural support deployed.',
  'Deep fault lines forming. Coordinated multi-vector intervention.',
  'Major market rupture. Emergency liquidity injection.',
  'Systemic failure in progress. Maximum intervention force.',
  'Total market failure. Constitutional Managing Principals directly engaged.',
];
const INTERVENTION_TYPE_DESCS: Record<string, string> = {
  MINOR_STABILIZATION: 'Targeted liquidity injection and light spread compression.',
  STRUCTURAL_SUPPORT: 'Multi-vector operation — price floor anchoring combined with volatility suppression.',
  MAJOR_INTERVENTION: 'Full desk mobilization. Spread forced to zero.',
  EMERGENCY_HALT: 'Trading suspended across affected lanes.',
  TITAN_OVERRIDE: 'Direct Executive Principal command. Consequences are permanent.',
};

const GRADE_PIE_COLORS: Record<string, string> = {
  'RAW': '#475569',
  '4.0': '#6b7280', '4.5': '#6b7280',
  '5.0': '#7c8ea0', '5.5': '#7c8ea0',
  '6.0': '#64748b', '6.5': '#64748b',
  '7.0': '#7ea8c4', '7.5': '#7ea8c4',
  '8.0': '#38bdf8', '8.5': '#38bdf8',
  '9.0': '#22d3ee', '9.2': '#22d3ee',
  '9.4': '#818cf8', '9.6': '#8b5cf6',
  '9.8': '#a78bfa', '9.9': '#f59e0b', '10.0': '#fde68a',
};
const gradeColor = (g: string) => GRADE_PIE_COLORS[g] ?? '#475569';

function DoomsdayClock({ totalEvents, highestTier }: { totalEvents: number; highestTier: number }) {
  const pct = Math.min(1, highestTier / 6);
  const color = pct === 0 ? 'rgba(255,255,255,0.1)' : pct < 0.34 ? '#4ade80' : pct < 0.67 ? '#f59e0b' : '#f87171';
  const r = 26, cx = 34, cy = 34;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="68" height="68" viewBox="0 0 68 68">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        {pct > 0 && <circle cx={cx} cy={cy} r={r} fill="none" stroke={withAlpha(color, 0.851)} strokeWidth="5"
          strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ filter: pct > 0.66 ? `drop-shadow(0 0 4px ${withAlpha(color, 0.502)})` : 'none' }} />}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="16" fill="#fff" fontFamily="monospace" fontWeight="500" style={{ dominantBaseline: 'middle' }}>{totalEvents}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.3)" fontFamily="monospace" letterSpacing="1">{totalEvents === 0 ? 'CLEAR' : `T${highestTier}`}</text>
      </svg>
      <span className="text-[7px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>Interventions</span>
    </div>
  );
}

function SparklineStrip({ points, eraColor }: { points: { date: string; priceUsd: number }[]; eraColor: string }) {
  if (points.length < 2) return null;
  const W = 480, H = 56, PAD = 4;
  const prices = points.map(p => p.priceUsd);
  const minP = Math.min(...prices), maxP = Math.max(...prices);
  const range = maxP - minP || 1;
  const xs = points.map((_, i) => (i / (points.length - 1)) * W);
  const ys = prices.map(p => H - PAD - ((p - minP) / range) * (H - PAD * 2));
  const linePath = 'M' + xs.map((x, i) => `${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' L');
  const areaPath = `M${xs[0].toFixed(1)},${H} ` + xs.map((x, i) => `L${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ') + ` L${xs[xs.length - 1].toFixed(1)},${H} Z`;
  const midY = H - PAD - (((maxP + minP) / 2 - minP) / range) * (H - PAD * 2);
  const minIdx = prices.indexOf(minP), maxIdx = prices.indexOf(maxP);
  const lastX = xs[xs.length - 1], lastY = ys[ys.length - 1];
  const isUp = prices[prices.length - 1] >= prices[0];
  const lineColor = isUp ? eraColor : '#e05555';
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="spark-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.28" /><stop offset="100%" stopColor={lineColor} stopOpacity="0.02" />
        </linearGradient>
        <filter id="spark-glow" x="-20%" y="-80%" width="140%" height="260%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <line x1="0" y1={midY.toFixed(1)} x2={W} y2={midY.toFixed(1)} stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="3 4" />
      <path d={areaPath} fill="url(#spark-area)" />
      <path d={linePath} fill="none" stroke={withAlpha(lineColor, 0.251)} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" filter="url(#spark-glow)" />
      <path d={linePath} fill="none" stroke={withAlpha(lineColor, 0.902)} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={xs[minIdx].toFixed(1)} cy={ys[minIdx].toFixed(1)} r="2.5" fill="#d4a04aE6" />
      <circle cx={xs[maxIdx].toFixed(1)} cy={ys[maxIdx].toFixed(1)} r="2.5" fill={withAlpha(lineColor, 0.949)} />
      <circle cx={lastX} cy={lastY} r="4" fill={withAlpha(lineColor, 0.122)} />
      <circle cx={lastX} cy={lastY} r="2.2" fill={lineColor} />
    </svg>
  );
}

function SvgDonut({
  data,
  innerRadius = 28,
  outerRadius = 46,
  fmtTip,
}: {
  data: { name: string; value: number }[];
  innerRadius?: number;
  outerRadius?: number;
  fmtTip: (val: number, name: string) => [string, string];
}) {
  const [hovered, setHovered] = useState<{ name: string; value: number } | null>(null);
  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);
  const size = 110;
  const center = size / 2;
  const radius = (innerRadius + outerRadius) / 2;
  const strokeWidth = outerRadius - innerRadius;
  const circumference = 2 * Math.PI * radius;

  if (total === 0 || data.length === 0) {
    return (
      <div className="h-[110px] flex items-center justify-center text-[8px] font-mono text-white/40">
        no data
      </div>
    );
  }

  let accumulated = 0;

  return (
    <div className="relative flex items-center justify-center" style={{ height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {data.map((slice) => {
          const sliceRatio = slice.value / total;
          const strokeLength = sliceRatio * circumference;
          const offset = accumulated * circumference;
          accumulated += sliceRatio;

          return (
            <circle
              key={slice.name}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={withAlpha(gradeColor(slice.name), 0.85)}
              strokeWidth={strokeWidth}
              strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${center} ${center})`}
              className="transition-all duration-150 cursor-pointer hover:opacity-100 opacity-90"
              style={{ strokeLinecap: 'butt' }}
              onMouseEnter={() => setHovered({ name: slice.name, value: slice.value })}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
      </svg>
      {hovered && (
        <div
          className="absolute z-20 pointer-events-none rounded px-2 py-1 text-[9px] font-mono shadow-lg border"
          style={{
            backgroundColor: '#0a0f1a',
            borderColor: 'rgba(255,255,255,0.15)',
            color: '#fff',
            bottom: '100%',
            marginBottom: '4px',
            whiteSpace: 'nowrap',
          }}
        >
          <div className="font-semibold text-cyan-300">{fmtTip(hovered.value, hovered.name)[1]}</div>
          <div className="text-white/80">{fmtTip(hovered.value, hovered.name)[0]}</div>
        </div>
      )}
    </div>
  );
}

function TitanEventCard({ ev, color }: { ev: TitanEvent; color: string }) {
  const [open, setOpen] = useState(false);
  const ddPct = Math.min(100, Math.abs(ev.drawdown) * 200);
  return (
    <div className="rounded px-2.5 py-1.5 cursor-pointer select-none"
      style={{ backgroundColor: open ? withAlpha(color, 0.071) : withAlpha(color, 0.027), border: `1px solid ${open ? withAlpha(color, 0.333) : withAlpha(color, 0.133)}`, transition: 'background-color 150ms ease, border-color 150ms ease' }}
      onClick={() => setOpen(o => !o)}>
      <div className="flex items-center gap-3">
        <div className="text-[10px] shrink-0 tabular-nums" style={{ color, fontFamily: 'monospace' }}>T{ev.tier}</div>
        <div className="flex-1 min-w-0">
          <div className="text-[9px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{TIER_LABELS[ev.tier] || ev.type}</div>
          <div className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>tick #{ev.tick.toLocaleString()} · dd {(ev.drawdown * 100).toFixed(1)}% · {ev.overlayDuration}t overlay</div>
        </div>
        <span className="text-[8px] px-1 rounded shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.76)', fontFamily: 'monospace' }}>{open ? '▲' : '▼'}</span>
      </div>
      <div className="mt-1.5 relative h-0.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
        <div className="absolute top-0 left-0 bottom-0 rounded-full" style={{ width: `${ddPct}%`, backgroundColor: withAlpha(color, 0.6) }} />
      </div>
      {open && (
        <div className="mt-2 pt-2 flex flex-col gap-1.5" style={{ borderTop: `1px solid ${withAlpha(color, 0.125)}` }}>
          <p className="text-[9px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
            <span style={{ color, fontFamily: 'monospace' }}>T{ev.tier} · {TIER_LABELS[ev.tier]}</span> — {TIER_DESCS[ev.tier]}
          </p>
          <p className="text-[9px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.62)' }}>
            <span style={{ color: 'rgba(255,255,255,0.70)' }}>{ev.type.replace(/_/g, ' ')}</span> — {INTERVENTION_TYPE_DESCS[ev.type] || 'Intervention applied.'}
          </p>
          <div className="flex gap-3 mt-0.5">
            <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>stress idx {ev.stressIndex != null ? ev.stressIndex.toFixed(3) : '—'}</span>
            <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>overlay {ev.overlayDuration}t</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ScarMetricCard({ label, value, accent, gaugeValue, gaugeMin, gaugeMax, unit, description, linkedTick }: {
  label: string; value: string; accent: string; gaugeValue: number;
  gaugeMin: number; gaugeMax: number; unit: string; description: string; linkedTick?: number;
}) {
  const [open, setOpen] = useState(false);
  const range = gaugeMax - gaugeMin;
  const zeroPct = range > 0 ? ((0 - gaugeMin) / range) * 100 : 50;
  const valPct  = range > 0 ? Math.min(100, Math.max(0, ((gaugeValue - gaugeMin) / range) * 100)) : 50;
  const left = Math.min(zeroPct, valPct);
  const width = Math.abs(valPct - zeroPct);
  return (
    <div className="rounded px-2.5 py-2 cursor-pointer select-none"
      style={{ backgroundColor: open ? withAlpha(accent, 0.063) : withAlpha(accent, 0.024), border: `1px solid ${open ? accent : withAlpha(accent, 0.145)}`, transition: 'background-color 150ms ease, border-color 150ms ease' }}
      onClick={() => setOpen(o => !o)}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.62)' }}>{label}</span>
          <span className="text-[8px] px-1 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.76)', fontFamily: 'monospace' }}>{open ? '▲' : '▼'}</span>
        </div>
        <span className="text-[12px]" style={{ color: accent, fontFamily: 'monospace', fontWeight: 500 }}>{value}</span>
      </div>
      <div className="relative h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
        <div className="absolute top-0 bottom-0 w-px" style={{ left: `${zeroPct}%`, backgroundColor: 'rgba(255,255,255,0.2)', zIndex: 2 }} />
        <div className="absolute top-0 bottom-0 rounded-full" style={{ left: `${left}%`, width: `${Math.max(1, width)}%`, backgroundColor: withAlpha(accent, 0.749) }} />
      </div>
      <div className="flex justify-between mt-0.5">
        <span className="text-[7px]" style={{ color: 'rgba(255,255,255,0.40)', fontFamily: 'monospace' }}>{gaugeMin}{unit}</span>
        <span className="text-[7px]" style={{ color: 'rgba(255,255,255,0.40)', fontFamily: 'monospace' }}>0</span>
        <span className="text-[7px]" style={{ color: 'rgba(255,255,255,0.40)', fontFamily: 'monospace' }}>+{gaugeMax}{unit}</span>
      </div>
      {open && (
        <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${withAlpha(accent, 0.125)}` }}>
          <p className="text-[9px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.70)' }}>{description}</p>
          {linkedTick != null && <p className="text-[8px] mt-1.5" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>Origin: Liquidity intervention event at tick #{linkedTick.toLocaleString()}</p>}
        </div>
      )}
    </div>
  );
}

export default function TemporalMemoryPanel({ mem, eraColors, gradeLattice, priceHistory }: {
  mem: TemporalMemory;
  eraColors: ReturnType<typeof getEraColors>;
  gradeLattice: GradePrice[];
  priceHistory: HistoryEntry[];
}) {
  const { lifetimeStats: ls, principalHistory: th, scarTissue: sc, timelineStrip } = mem;
  const GRADE_ORDER_PIE = ['RAW','4.0','4.5','5.0','5.5','6.0','6.5','7.0','7.5','8.0','8.5','9.0','9.2','9.4','9.6','9.8'];

  const sortedLattice = useMemo(() =>
    [...gradeLattice].filter(g => GRADE_ORDER_PIE.includes(g.grade))
      .sort((a, b) => GRADE_ORDER_PIE.indexOf(a.grade) - GRADE_ORDER_PIE.indexOf(b.grade)),
  [gradeLattice]);

  const gradeObsMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of (priceHistory || [])) map[e.grade] = (map[e.grade] || 0) + 1;
    return map;
  }, [priceHistory]);

  const usingRealVolume = sortedLattice.some(g => (g.salesVolume ?? 0) > 0);
  const volPieData = useMemo(() => sortedLattice.map(g => {
    const vol = (g.salesVolume ?? 0) > 0 ? g.salesVolume as number : (gradeObsMap[g.grade] || 0);
    return { name: g.grade, value: vol };
  }).filter(g => g.value > 0), [sortedLattice, gradeObsMap]);

  const elasticityPieData = useMemo(() => sortedLattice.filter(g => g.priceUsd > 0).map(g => ({ name: g.grade, value: g.priceUsd })), [sortedLattice]);
  const spreadMult = sc.hasScar ? Math.abs(sc.spreadAdj) : 0.001;
  const spreadPieData = useMemo(() => sortedLattice.filter(g => g.priceUsd > 0).map(g => ({ name: g.grade, value: Math.round(g.priceUsd * spreadMult * 100) / 100 || g.priceUsd })), [sortedLattice, spreadMult]);

  const statCell = (label: string, value: string, sub?: string, accent?: string) => (
    <div key={label} className="flex flex-col gap-0.5">
      <div className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</div>
      <div className="text-[13px]" style={{ color: accent || 'rgba(255,255,255,0.75)', fontFamily: 'monospace' }}>{value}</div>
      {sub && <div className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{sub}</div>}
    </div>
  );

  return (
    <Panel title="Temporal Memory" icon={<Clock className="w-3.5 h-3.5" />} eraColors={eraColors}>
      <div className="flex flex-col gap-4">

        <div className="flex items-center gap-4 pb-3" style={{ borderBottom: `1px solid ${withAlpha(eraColors.border, 0.071)}` }}>
          <DoomsdayClock totalEvents={th.totalEvents} highestTier={th.highestTier} />
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="text-[9px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.48)' }}>Market Intervention Record</div>
            {th.totalEvents === 0 ? (
              <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.62)', fontFamily: 'monospace' }}>No principal interventions on record. Market physics at baseline.</div>
            ) : (
              <div className="flex gap-4 flex-wrap">
                {[
                  { label: 'Events', val: th.totalEvents.toString() },
                  { label: 'Peak Tier', val: `T${th.highestTier} · ${TIER_LABELS[th.highestTier] || '—'}`, accent: TIER_COLORS[th.highestTier] },
                  { label: 'Last', val: th.mostRecentTick != null ? `Tick #${th.mostRecentTick.toLocaleString()}` : '—' },
                ].map(({ label, val, accent }) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <div className="text-[8px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.76)' }}>{label}</div>
                    <div className="text-[11px]" style={{ color: accent || 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>{val}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {ls ? (
          <div>
            <div className="text-[9px] uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.48)' }}>Lifetime Archive · CGC 9.8 Universal</div>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-3 pb-3" style={{ borderBottom: `1px solid ${withAlpha(eraColors.border, 0.082)}` }}>
              {statCell('All-Time High', fmt(ls.allTimeHighUsd))}
              {statCell('All-Time Low', fmt(ls.allTimeLowUsd))}
              {statCell('Max Drawdown', `−${ls.maxDrawdownPct.toFixed(1)}%`, 'peak-to-trough', ls.maxDrawdownPct > 30 ? '#f87171' : ls.maxDrawdownPct > 15 ? '#f59e0b' : '#86efac')}
              {statCell('Lifetime Vol', `${(ls.lifetimeCv * 100).toFixed(1)}%`, 'coefficient of variation')}
              {statCell('Avg Recovery', ls.avgRecoveryPoints != null ? `${ls.avgRecoveryPoints} obs` : '—', 'from −20% trough')}
              {statCell('Data Span', ls.dataSpanDays > 365 ? `${(ls.dataSpanDays / 365).toFixed(1)}y` : `${ls.dataSpanDays}d`, `${ls.pricePoints.toLocaleString()} observations`)}
            </div>
          </div>
        ) : (
          <div className="text-[10px] py-2" style={{ color: 'rgba(255,255,255,0.76)' }}>No 9.8 price history on record.</div>
        )}

        {timelineStrip.length >= 2 && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.48)' }}>Price Timeline · Full History</span>
              {ls && <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{fmtDate(ls.firstObservation)} → {fmtDate(ls.lastObservation)}</span>}
            </div>
            <div className="rounded overflow-hidden" style={{ backgroundColor: withAlpha(eraColors.border, 0.027), border: `1px solid ${withAlpha(eraColors.border, 0.082)}`, padding: '4px 6px' }}>
              <SparklineStrip points={timelineStrip} eraColor={eraColors.border} />
            </div>
          </div>
        )}

        {sortedLattice.length > 0 && (
          <div className="pt-1">
            <div className="text-[9px] uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.48)' }}>Grade Distribution · Scar Physics by Grade (3 Fault Wheels)</div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { title: 'Vol Baseline', sub: sc.hasScar ? `+${(sc.volAdjustment * 100).toFixed(3)}%` : 'baseline', data: volPieData, footer: usingRealVolume ? 'sales by grade' : 'price obs by grade', fmtTip: (val: number, name: string) => [usingRealVolume ? `${val} sales` : `${val} obs`, `CGC ${name}`] as [string, string] },
                { title: 'Elasticity', sub: sc.hasScar ? (sc.elasticityAdj > 0 ? `+${sc.elasticityAdj.toFixed(4)}` : sc.elasticityAdj.toFixed(4)) : 'baseline', data: elasticityPieData, footer: 'price weight by grade', fmtTip: (val: number, name: string) => [fmt(val), `CGC ${name}`] as [string, string] },
                { title: 'Spread Adj', sub: sc.hasScar ? (sc.spreadAdj > 0 ? `+${(sc.spreadAdj * 10000).toFixed(0)} bps` : `${(sc.spreadAdj * 10000).toFixed(0)} bps`) : 'baseline', data: spreadPieData, footer: 'spread exposure by grade', fmtTip: (val: number, name: string) => [sc.hasScar ? `${val.toFixed(4)} spread cost` : fmt(val), `CGC ${name}`] as [string, string] },
              ].map(({ title, sub, data, footer, fmtTip }) => (
                <div key={title} className="flex flex-col items-center">
                  <div className="text-[8px] uppercase tracking-widest mb-1 text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>{title}</div>
                  <div className="text-[7px] text-center mb-1 font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>{sub}</div>
                  <SvgDonut data={data} innerRadius={28} outerRadius={46} fmtTip={fmtTip} />
                  <div className="text-[7px] text-center mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{footer}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
              {sortedLattice.map(g => (
                <div key={g.grade} className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: gradeColor(g.grade) }} />
                  <span className="text-[7px]" style={{ color: 'rgba(255,255,255,0.76)', fontFamily: 'monospace' }}>{g.grade}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="text-[9px] uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.48)' }}>Consortium Intervention History</div>
            {th.totalEvents === 0 ? (
              <div className="rounded px-3 py-2.5" style={{ backgroundColor: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.12)' }}>
                <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>No interventions on record.</div>
                <div className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.76)' }}>No intervention recorded during observation window.</div>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <div className="flex gap-4 mb-1">
                  {[
                    { label: 'Interventions', val: th.totalEvents.toString() },
                    { label: 'Highest Tier', val: `T${th.highestTier} · ${TIER_LABELS[th.highestTier] || '—'}`, accent: TIER_COLORS[th.highestTier] },
                    { label: 'Last Tick', val: th.mostRecentTick != null ? `#${th.mostRecentTick.toLocaleString()}` : '—' },
                  ].map(({ label, val, accent }) => (
                    <div key={label} className="flex flex-col gap-0.5">
                      <div className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</div>
                      <div className="text-[11px]" style={{ color: accent || 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>{val}</div>
                    </div>
                  ))}
                </div>
                {[...th.events].slice(-3).reverse().map((ev, i) => (
                  <div key={i}><TitanEventCard ev={ev} color={TIER_COLORS[ev.tier]} /></div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="text-[9px] uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.48)' }}>Scar Tissue · Permanent Market Memory</div>
            {!sc.hasScar ? (
              <div className="rounded px-3 py-2.5" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>Scar Tissue: None</div>
                <div className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>No principal interventions recorded. Vol, elasticity & spread are at baseline.</div>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <ScarMetricCard label="Vol Baseline"
                  value={sc.volAdjustment > 0 ? `+${(sc.volAdjustment * 100).toFixed(3)}%` : `${(sc.volAdjustment * 100).toFixed(3)}%`}
                  accent={sc.volAdjustment > 0 ? '#f87171' : '#4ade80'}
                  gaugeValue={sc.volAdjustment * 100} gaugeMin={-5} gaugeMax={5} unit="%"
                  description="Permanent volatility floor adjustment. Positive values mean each tick carries more price variance — execution becomes less predictable."
                  linkedTick={th.events[th.events?.length - 1]?.tick} />
                <ScarMetricCard label="Elasticity Residue"
                  value={sc.elasticityAdj > 0 ? `+${sc.elasticityAdj.toFixed(4)}` : `${sc.elasticityAdj.toFixed(4)}`}
                  accent={sc.elasticityAdj < 0 ? '#f87171' : '#fde68a'}
                  gaugeValue={sc.elasticityAdj} gaugeMin={-0.5} gaugeMax={0.5} unit=""
                  description="Permanent price elasticity modifier. Negative values mean this market responds less forcefully to demand pressure."
                  linkedTick={th.events[th.events?.length - 1]?.tick} />
                <ScarMetricCard label="Spread Adj"
                  value={sc.spreadAdj > 0 ? `+${(sc.spreadAdj * 10000).toFixed(0)} bps` : `${(sc.spreadAdj * 10000).toFixed(0)} bps`}
                  accent={sc.spreadAdj > 0 ? '#f87171' : '#4ade80'}
                  gaugeValue={sc.spreadAdj * 10000} gaugeMin={-100} gaugeMax={100} unit=" bps"
                  description="Permanent bid-ask spread penalty on all transactions. This is the market's permanent memory of liquidity stress."
                  linkedTick={th.events[th.events?.length - 1]?.tick} />
              </div>
            )}
          </div>
        </div>

      </div>
    </Panel>
  );
}
