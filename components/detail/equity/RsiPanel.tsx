'use client';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LWLineSparkline, type LWSparklinePoint } from '@/components/ui/LWLineSparkline';
import { Activity } from 'lucide-react';
import { getEraColors } from '@/lib/design-system/colors';
import type { RsiPoint } from './types';
import Panel from './Panel';

const RSI_ZONES = [
  { max: 30,  label: 'OVERSOLD',   color: '#f87171', bg: '#f8717110' },
  { max: 45,  label: 'WEAK',       color: '#fb923c', bg: '#fb923c0c' },
  { max: 55,  label: 'FLAT',       color: 'rgba(255,255,255,0.64)', bg: 'rgba(255,255,255,0.04)' },
  { max: 70,  label: 'FIRM',       color: '#86efac', bg: '#86efac0c' },
  { max: 100, label: 'OVERBOUGHT', color: '#fbbf24', bg: '#fbbf2410' },
] as const;

function getRsiZone(rsi: number) {
  return RSI_ZONES.find(z => rsi <= z.max) ?? RSI_ZONES[RSI_ZONES.length - 1];
}

export default function RsiPanel({ workName, assetId, eraColors }: {
  workName: string;
  assetId: string;
  eraColors: ReturnType<typeof getEraColors>;
}) {
  const { data: realData, refetch: refetchReal, isRefetching: isRefetchingReal } = useQuery<{ data: RsiPoint[] }>({
    queryKey: ['rsi-real', assetId],
    queryFn: async () => {
      const res = await fetch(`/api/technicals/rsi-real/${assetId}`);
      if (!res.ok) return { data: [] };
      return res.json();
    },
    staleTime: 300000,
  });

  const { data: seriesData, isLoading, refetch: refetchSeries, isRefetching: isRefetchingSeries } = useQuery<{ data: RsiPoint[] }>({
    queryKey: ['rsi-series', workName],
    queryFn: async () => {
      const res = await fetch(`/api/technicals/rsi-series/${encodeURIComponent(workName)}`);
      if (!res.ok) return { data: [] };
      return res.json();
    },
    staleTime: 300000,
  });

  const isRefreshing = isRefetchingReal || isRefetchingSeries;
  const handleRefresh = () => { void refetchReal(); void refetchSeries(); };

  const usingReal = (realData?.data?.length ?? 0) > 0;
  const data = usingReal ? realData : seriesData;
  const rsiData = data?.data || [];
  const chartWindow = rsiData.slice(-30);
  const statWindow  = rsiData.slice(-10);
  const latestRsi   = statWindow.length > 0 ? statWindow[statWindow.length - 1].rsi : null;

  const zone      = latestRsi != null ? getRsiZone(latestRsi) : null;
  const zoneColor = zone?.color ?? 'rgba(255,255,255,0.3)';
  const zoneLabel = zone?.label ?? '—';

  const volStats = useMemo(() => {
    if (statWindow.length < 2) return null;
    const vals = statWindow.map(d => d.rsi);
    const min  = Math.min(...vals);
    const max  = Math.max(...vals);
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const variance = vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length;
    const sigma = Math.sqrt(variance);
    const tail = vals.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const head = vals.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    const momentum = tail - head;
    return { min, max, range: max - min, sigma, momentum };
  }, [statWindow]);

  const momentumArrow = !volStats ? '—' : volStats.momentum > 2 ? '▲' : volStats.momentum < -2 ? '▼' : '→';
  const momentumColor = !volStats ? 'rgba(255,255,255,0.25)' : volStats.momentum > 2 ? '#4ade80' : volStats.momentum < -2 ? '#f87171' : 'rgba(255,255,255,0.4)';

  const rsiLwData = useMemo<LWSparklinePoint[]>(() => {
    const base = new Date('2020-01-01');
    return chartWindow.map((d, i) => {
      const dt = new Date(base);
      dt.setDate(dt.getDate() + i);
      return { time: dt.toISOString().slice(0, 10), value: d.rsi };
    });
  }, [chartWindow]);

  const refreshAction = (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      title="Refresh RSI data"
      style={{
        background: 'none', border: 'none', cursor: isRefreshing ? 'default' : 'pointer',
        color: 'rgba(255,255,255,0.3)', fontSize: '12px', padding: '0 2px',
        transition: 'color 0.15s', opacity: isRefreshing ? 0.4 : 1,
        transform: isRefreshing ? 'rotate(360deg)' : undefined,
        animation: isRefreshing ? 'spin 1s linear infinite' : undefined,
      }}
    >↻</button>
  );

  return (
    <Panel title="RSI (14) — Relative Strength Index" icon={<Activity className="w-3.5 h-3.5" />} eraColors={eraColors} action={refreshAction}>
      {isLoading ? (
        <div className="h-16 flex items-center justify-center" style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px' }}>Loading…</div>
      ) : latestRsi == null ? (
        <div className="h-16 flex items-center justify-center" style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px' }}>No RSI data for {workName}</div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            <div>
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-5xl" style={{ fontFamily: 'monospace', color: zoneColor, fontWeight: 300 }}>
                  {latestRsi.toFixed(1)}
                </span>
                <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded"
                  style={{ color: zoneColor, backgroundColor: zone?.bg, border: `1px solid ${zoneColor}40` }}>
                  {zoneLabel}
                </span>
              </div>
              <div className="relative h-3 rounded-full overflow-hidden mb-1" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                <div className="absolute inset-y-0 left-0 w-[30%]" style={{ backgroundColor: '#f8717110' }} />
                <div className="absolute inset-y-0" style={{ left: '30%', width: '15%', backgroundColor: '#fb923c0a' }} />
                <div className="absolute inset-y-0" style={{ left: '45%', width: '10%', backgroundColor: 'rgba(255,255,255,0.03)' }} />
                <div className="absolute inset-y-0" style={{ left: '55%', width: '15%', backgroundColor: '#86efac0a' }} />
                <div className="absolute inset-y-0 right-0 w-[30%]" style={{ backgroundColor: '#fbbf2410' }} />
                {[30, 45, 55, 70].map(v => (
                  <div key={v} className="absolute inset-y-0" style={{ left: `${v}%`, width: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                ))}
                <div className="absolute top-0.5 bottom-0.5 w-2 rounded-full transition-all"
                  style={{ left: `calc(${Math.min(97, Math.max(1.5, latestRsi))}% - 4px)`, backgroundColor: zoneColor, boxShadow: `0 0 6px ${zoneColor}` }} />
              </div>
              <div className="flex justify-between text-[8px] mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>
                <span>OVERSOLD</span><span>WEAK</span><span>FLAT</span><span>FIRM</span><span>OB</span>
              </div>
              <p className="text-[8px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.42)' }}>
                {usingReal ? `This issue · price history` : `All ${workName} issues · all grades`}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-[8px] uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.2)' }}>10-period volatility</p>
              {[
                { label: 'Range',   value: volStats ? `${volStats.min.toFixed(1)} – ${volStats.max.toFixed(1)}` : '—', sub: volStats ? `\u0394 ${volStats.range.toFixed(1)} pts` : '' },
                { label: 'σ (RSI)', value: volStats ? volStats.sigma.toFixed(2) : '—', sub: volStats && volStats.sigma > 8 ? 'high vol' : volStats && volStats.sigma > 4 ? 'mod vol' : 'low vol' },
              ].map(({ label, value, sub }) => (
                <div key={label} className="flex items-center justify-between px-2 py-1.5 rounded"
                  style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</span>
                  <div className="text-right">
                    <span className="text-[11px] tabular-nums" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>{value}</span>
                    {sub && <span className="text-[8px] ml-1.5" style={{ color: 'rgba(255,255,255,0.2)' }}>{sub}</span>}
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between px-2 py-1.5 rounded"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>Momentum</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px]" style={{ color: momentumColor }}>{momentumArrow}</span>
                  <span className="text-[9px] tabular-nums" style={{ color: momentumColor, fontFamily: 'monospace' }}>
                    {volStats ? `${volStats.momentum >= 0 ? '+' : ''}${volStats.momentum.toFixed(1)}` : '—'}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-[8px] mb-1 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.2)' }}>
                Last {chartWindow.length} readings
              </p>
              {chartWindow.length > 2
                ? <LWLineSparkline
                    data={rsiLwData}
                    color={zoneColor}
                    height={110}
                    referenceLines={[
                      { value: 70, color: '#fbbf2440' },
                      { value: 55, color: '#86efac28' },
                      { value: 50, color: 'rgba(255,255,255,0.18)' },
                      { value: 45, color: '#fb923c28' },
                      { value: 30, color: '#f8717140' },
                    ]}
                  />
                : <div className="h-[110px] flex items-center justify-center text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>Insufficient history</div>
              }
            </div>
          </div>
          <div className="flex gap-1 flex-wrap">
            {RSI_ZONES.map(z => (
              <span key={z.label} className="text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider"
                style={{ color: z.color, backgroundColor: z.bg, border: `1px solid ${z.color}30`, fontWeight: z.label === zoneLabel ? 600 : 400, opacity: z.label === zoneLabel ? 1 : 0.45 }}>
                {z.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </Panel>
  );
}
