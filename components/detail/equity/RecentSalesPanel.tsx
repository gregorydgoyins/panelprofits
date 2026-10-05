'use client';
import { useMemo, useState, type CSSProperties } from 'react';
import { LWLineSparkline } from '@/components/ui/LWLineSparkline';
import { Activity } from 'lucide-react';
import { getEraColors } from '@/lib/design-system/colors';
import { withAlpha } from '@/lib/colorUtils';
import type { SaleRecord, HistoryEntry } from './types';
import Panel from './Panel';
import { GRADE_ORDER, fmt, gradeColor } from './shared';
import { DataTable } from '@/components/ui/DataTable';
import { type ColumnDef } from '@tanstack/react-table';

const VOLUME_BADGE_STYLES: Record<'hot' | 'warm' | 'cool', { label: string; bg: string; color: string }> = {
  hot:  { label: 'HOT',  bg: 'rgba(239,68,68,0.18)',  color: '#f87171' },
  warm: { label: 'WARM', bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' },
  cool: { label: 'COOL', bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
};

function resolveVenueTierLocal(
  venue: string,
  venueVolume: Record<string, 'hot' | 'warm' | 'cool'>,
): 'hot' | 'warm' | 'cool' | null {
  const k = venue.toLowerCase().trim();
  if (!k) return null;
  for (const [key, tier] of Object.entries(venueVolume)) {
    if (!key) continue;
    if (k.includes(key) || key.includes(k)) return tier;
  }
  return null;
}

export default function RecentSalesPanel({ sales, saleIntelligence, priceHistory, eraColors, venueVolume = {}, identityConfidence }: {
  sales: SaleRecord[];
  saleIntelligence: { totalSales: number; lastSaleDate: string | null; daysSinceLastSale: number | null; confidenceWeightedMeanPrice: number | null; } | null;
  priceHistory: HistoryEntry[];
  eraColors: ReturnType<typeof getEraColors>;
  venueVolume?: Record<string, 'hot' | 'warm' | 'cool'>;
  identityConfidence?: number | null;
}) {
  const fmtPrice = (usd: number) => `$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const cwmp = saleIntelligence?.confidenceWeightedMeanPrice;
  const totalSales = saleIntelligence?.totalSales ?? 0;
  const daysSince = saleIntelligence?.daysSinceLastSale;

  const gradeActivity = useMemo(() => {
    if (sales.length > 0 || priceHistory.length === 0) return [];
    const byGrade: Record<string, HistoryEntry[]> = {};
    for (const h of priceHistory) (byGrade[h.grade] ||= []).push(h);
    return GRADE_ORDER.filter(g => byGrade[g]?.length > 0).map(g => {
      const sorted = [...byGrade[g]].sort((a, b) => new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime());
      const latest = sorted[0], prev = sorted[1] ?? null;
      const deltaPct = prev && prev.priceUsd > 0 ? ((latest.priceUsd - prev.priceUsd) / prev.priceUsd) * 100 : null;
      return { grade: g, latest, prev, deltaPct };
    });
  }, [sales, priceHistory]);

  const [actionNote, setActionNote] = useState<string | null>(null);
  const showNote = (msg: string) => { setActionNote(msg); setTimeout(() => setActionNote(null), 2200); };

  const VENUE_COLORS: Record<string, string> = { ebay: '#60a5fa', 'comic link': '#4ade80', comiclink: '#4ade80', heritage: '#fbbf24', goldin: '#a78bfa', mycomicshop: '#34d399' };
  const venueColor = (v: string) => {
    const k = v.toLowerCase().trim();
    for (const [key, color] of Object.entries(VENUE_COLORS)) if (k.includes(key)) return color;
    return 'rgba(255,255,255,0.42)';
  };

  const sparkInfo = useMemo(() => {
    if (sales.length < 2) return null;
    const sorted = [...sales].filter(s => s.priceUsd > 0 && s.soldAt).sort((a, b) => new Date(a.soldAt!).getTime() - new Date(b.soldAt!).getTime());
    if (sorted.length < 2) return null;
    const base = new Date('2020-01-01');
    const data = sorted.map((s, i) => {
      const dt = new Date(base);
      dt.setDate(dt.getDate() + i);
      return { time: dt.toISOString().slice(0, 10), value: +s.priceUsd.toFixed(2) };
    });
    const prices = data.map(d => d.value);
    const trend = prices[prices.length - 1] - prices[0];
    return { data, color: trend >= 0 ? '#4ade80' : '#f87171' };
  }, [sales]);

  const venueDonut = useMemo(() => {
    if (sales.length === 0) return [];
    const counts: Record<string, number> = {};
    for (const s of sales) {
      const raw = s.venue?.replace(/^(ARTICLE|INDEX):/, '') ?? 'Unknown';
      const key = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count, color: venueColor(name), pct: Math.round((count / sales.length) * 100) }));
  }, [sales]);

  const gradesWithData = useMemo(() => {
    const grades = new Set(priceHistory.filter(h => h.priceUsd > 0).map(h => h.grade));
    return ['RAW','4.0','6.0','8.0','9.2','9.4','9.6','9.8'].map(g => ({ grade: g, hasData: grades.has(g) }));
  }, [priceHistory]);

  const salesColumns = useMemo<ColumnDef<SaleRecord>[]>(() => [
    {
      id: 'date',
      header: 'Date',
      accessorFn: (s) => s.soldAt ?? '',
      cell: ({ row }) => {
        const s = row.original;
        const date = s.soldAt ? new Date(s.soldAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
        return <span style={{ color: 'rgba(255,255,255,0.70)' }}>{date}</span>;
      },
    },
    {
      id: 'grade',
      header: 'Grade',
      accessorFn: (s) => { const i = GRADE_ORDER.indexOf(s.grade); return i === -1 ? 99 : i; },
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ backgroundColor: withAlpha(eraColors.border, 0.094), color: eraColors.border, fontFamily: 'monospace' }}>
              {s.grade.startsWith('CGC') || s.grade.startsWith('CBCS') || s.grade.startsWith('PGX') ? s.grade : `CGC ${s.grade}`}
            </span>
            {s.pedigreeName && (
              <span
                className="px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-amber-950/80 border border-amber-600/70 text-amber-300"
                title={`Certified Pedigree Provenance: ${s.pedigreeName}`}
              >
                {s.pedigreeName}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: 'venue',
      header: 'Venue',
      accessorFn: (s) => s.venue ?? '',
      enableSorting: false,
      cell: ({ row }) => {
        const s = row.original;
        const rawVenue = s.venue?.replace(/^(ARTICLE|INDEX):/, '') ?? '';
        const venue = rawVenue ? rawVenue.charAt(0).toUpperCase() + rawVenue.slice(1).toLowerCase() : '—';
        const vColor = rawVenue ? venueColor(rawVenue) : 'rgba(255,255,255,0.3)';
        const tier = resolveVenueTierLocal(rawVenue, venueVolume);
        return (
          <span className="flex items-center gap-1.5 flex-wrap">
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: vColor, display: 'inline-block', flexShrink: 0 }} />
            <span style={{ color: 'rgba(255,255,255,0.68)' }}>{venue}</span>
            {tier && (() => {
              const b = VOLUME_BADGE_STYLES[tier];
              return <span style={{ fontSize: 7, fontWeight: 600, letterSpacing: '0.07em', background: b.bg, color: b.color, borderRadius: 2, padding: '1px 3px', lineHeight: 1.4 }}>{b.label}</span>;
            })()}
          </span>
        );
      },
    },
    {
      id: 'price',
      header: 'Sale Price',
      accessorKey: 'priceUsd',
      meta: { className: 'text-right' },
      cell: ({ row }) => {
        const s = row.original;
        const price = s.priceUsd > 0 ? fmtPrice(s.priceUsd) : '—';
        return <span style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'monospace' }}>{price}</span>;
      },
    },
    {
      id: 'delta',
      header: 'vs FMV',
      accessorFn: (s) => s.saleDeltaPct ?? -Infinity,
      meta: { className: 'text-right' },
      cell: ({ row }) => {
        const s = row.original;
        const delta = s.saleDeltaPct;
        const deltaColor = delta === null ? 'rgba(255,255,255,0.3)' : delta >= 0 ? '#4ade80' : '#f87171';
        const deltaLabel = delta === null ? '—' : `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`;
        return <span style={{ color: deltaColor, fontFamily: 'monospace', fontSize: '11px' }}>{deltaLabel}</span>;
      },
    },
  ], [eraColors, venueVolume]);

  const lowConfidence = identityConfidence != null && identityConfidence < 75;

  return (
    <Panel title="Recent Sales" icon={<Activity className="w-3.5 h-3.5" />} eraColors={eraColors}>

      {lowConfidence && (
        <div className="flex items-center gap-2 mb-3 px-2 py-1.5 rounded" style={{ backgroundColor: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#f59e0b', flexShrink: 0, boxShadow: '0 0 5px #f59e0baa' }} />
          <span style={{ fontSize: '9px', color: 'rgba(245,158,11,0.85)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sale prices may be derived from a reprint product · identity confidence {identityConfidence}%</span>
        </div>
      )}

      {/* Intelligence strip */}
      {totalSales > 0 && (
        <div className="rounded-lg mb-4 p-3" style={{ background: `linear-gradient(135deg, ${withAlpha(eraColors.border, 0.051)}, rgba(0,0,0,0.3))`, border: `1px solid ${withAlpha(eraColors.border, 0.157)}` }}>
          <div className="flex items-start gap-4 flex-wrap">
            <div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Recorded Sales</div>
              <div style={{ color: '#fff', fontSize: '22px', fontFamily: 'monospace', lineHeight: 1 }}>{totalSales}</div>
            </div>
            {cwmp && cwmp > 0 && (
              <div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Conf.-Weighted Avg</div>
                <div style={{ color: eraColors.border, fontSize: '22px', fontFamily: 'monospace', lineHeight: 1 }}>{fmtPrice(cwmp)}</div>
              </div>
            )}
            {daysSince !== null && daysSince !== undefined && (
              <div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Days Since Last Sale</div>
                <div style={{ color: daysSince > 730 ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.75)', fontSize: '22px', fontFamily: 'monospace', lineHeight: 1 }}>{daysSince.toLocaleString()}</div>
              </div>
            )}
          </div>
          {sparkInfo && (
            <div className="flex gap-3 mt-3 pt-3" style={{ borderTop: `1px solid ${withAlpha(eraColors.border, 0.094)}` }}>
              <div className="flex-1 min-w-0">
                <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>Price Trajectory</div>
                <LWLineSparkline data={sparkInfo.data} color={sparkInfo.color} height={72} />
              </div>
              {venueDonut.length > 0 && (
                <div style={{ flexShrink: 0, minWidth: '80px' }}>
                  <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>By Venue</div>
                  <div className="space-y-1">
                    {venueDonut.slice(0, 4).map(v => (
                      <div key={v.name} className="flex items-center gap-1.5">
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: v.color, flexShrink: 0 }} />
                        <div style={{ flex: 1, height: '3px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${v.pct}%`, height: '100%', backgroundColor: v.color, borderRadius: '2px' }} />
                        </div>
                        <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', flexShrink: 0 }}>{v.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex gap-1 mt-3 pt-2" style={{ borderTop: 'rgba(255,255,255,0.06) 1px solid' }}>
            {gradesWithData.map(({ grade, hasData }) => (
              <div key={grade} className="flex-1 rounded-sm py-1 text-center"
                style={{ backgroundColor: hasData ? withAlpha(eraColors.border, 0.133) : 'rgba(255,255,255,0.03)', border: `1px solid ${hasData ? withAlpha(eraColors.border, 0.251) : 'rgba(255,255,255,0.06)'}` }}>
                <div style={{ fontSize: '6px', color: hasData ? eraColors.border : 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>{grade}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-2 mb-4">
        {[
          { label: 'Watch',   icon: '◎', color: '#fbbf24', msg: 'Watchlist — coming soon' },
          { label: 'Alert',   icon: '◈', color: '#38bdf8', msg: 'Price alerts — coming soon' },
          { label: 'Compare', icon: '⊞', color: '#a78bfa', msg: 'Grade comparison — scroll to Grade Spread' },
        ].map(({ label, icon, color, msg }) => (
          <button key={label} onClick={() => showNote(msg)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[9px] uppercase tracking-widest transition-all pp-hover-var-bg"
            style={{ backgroundColor: withAlpha(color, 0.063), border: `1px solid ${withAlpha(color, 0.208)}`, color, cursor: 'pointer', letterSpacing: '0.1em', ['--pp-hover-color' as string]: withAlpha(color, 0.118) } as CSSProperties}>
            <span style={{ fontFamily: 'monospace', fontSize: '10px' }}>{icon}</span>{label}
          </button>
        ))}
        {actionNote && <span className="text-[9px] ml-1" style={{ color: 'rgba(255,255,255,0.45)', fontStyle: 'italic' }}>{actionNote}</span>}
      </div>

      {sales.length === 0 && gradeActivity.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>No verified sales · Market price observations</span>
            <span className="text-[8px] px-1.5 py-0.5 rounded" style={{ backgroundColor: '#fbbf2410', color: '#fbbf24', border: '1px solid #fbbf2428' }}>Price observations · not individual sales</span>
          </div>
          <div className="space-y-1">
            {gradeActivity.map(({ grade, latest, prev, deltaPct }) => {
              const gc = gradeColor(grade);
              const deltaColor = deltaPct === null ? 'rgba(255,255,255,0.25)' : deltaPct > 0 ? '#4ade80' : deltaPct < 0 ? '#f87171' : 'rgba(255,255,255,0.4)';
              const deltaLabel = deltaPct === null ? '—' : `${deltaPct >= 0 ? '+' : ''}${deltaPct.toFixed(2)}%`;
              const obsDate = new Date(latest.observedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              return (
                <div key={grade} className="flex items-center gap-2 px-2.5 py-1.5 rounded" style={{ backgroundColor: withAlpha(gc, 0.031), border: `1px solid ${withAlpha(gc, 0.094)}` }}>
                  <span className="text-[10px] w-10 text-center shrink-0 rounded px-1 py-0.5 tabular-nums" style={{ backgroundColor: withAlpha(gc, 0.094), color: gc, fontFamily: 'monospace', border: `1px solid ${withAlpha(gc, 0.188)}` }}>{grade}</span>
                  <span className="text-[11px] flex-1 tabular-nums" style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'monospace' }}>{fmtPrice(latest.priceUsd)}</span>
                  {prev && <span className="text-[9px] tabular-nums hidden sm:block" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>{fmtPrice(prev.priceUsd)}</span>}
                  <span className="text-[10px] w-16 text-right tabular-nums shrink-0" style={{ color: deltaColor, fontFamily: 'monospace' }}>{deltaLabel}</span>
                  <span className="text-[8px] w-20 text-right shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }}>{obsDate}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : sales.length === 0 ? (
        <p className="text-xs text-center py-4" style={{ color: 'rgba(255,255,255,0.76)' }}>No recorded sales yet</p>
      ) : (
        <div className="overflow-x-auto">
          <DataTable
            data={sales}
            columns={salesColumns}
            getRowKey={(s, i) => `${s.soldAt ?? ''}-${i}`}
            headerStyle={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}
            rowStyle={() => ({ borderBottom: 'rgba(255,255,255,0.04) 1px solid' })}
            className="text-xs"
          />
        </div>
      )}
    </Panel>
  );
}
