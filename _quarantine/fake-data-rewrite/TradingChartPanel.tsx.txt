'use client';
import React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import LWTradingChart from './LWTradingChart';
import { TrendingUp, Activity, BarChart2, Zap } from 'lucide-react';
import { getEraColors } from '@/lib/design-system/colors';
import { withAlpha } from '@/lib/colorUtils';
import type { GradePrice, HistoryEntry, BollingerPoint, RsiPoint } from './types';
import { GRADE_ORDER, toOhlcvWithHeritage, computeRsi14, computeMacd, gradeColor } from './shared';
import Panel from './Panel';
import AISectionBlock from './AISectionBlock';

type ChartType = 'area' | 'line' | 'spline' | 'column' | 'candlestick' | 'ohlc';
type SubIndicator = 'rsi' | 'macd' | 'none' | 'hax-vol';

const RSI_ZONES = [
  { max: 30,  label: 'OVERSOLD',   color: '#f87171' },
  { max: 45,  label: 'WEAK',       color: '#fb923c' },
  { max: 55,  label: 'NEUTRAL',    color: 'rgba(255,255,255,0.55)' },
  { max: 70,  label: 'FIRM',       color: '#86efac' },
  { max: 100, label: 'OVERBOUGHT', color: '#fbbf24' },
];
function rsiZone(rsi: number) { return RSI_ZONES.find(z => rsi <= z.max) ?? RSI_ZONES[4]; }

export default function TradingChartPanel({
  history, workName, eraColors, gradeLattice = [],
  aiInsight, bollingerData = [], showBollinger, onBollingerToggle,
  assetId = '',
}: {
  history: HistoryEntry[];
  workName: string;
  eraColors: ReturnType<typeof getEraColors>;
  gradeLattice?: GradePrice[];
  aiInsight?: string | null;
  bollingerData?: BollingerPoint[];
  showBollinger?: boolean;
  onBollingerToggle?: (val: boolean) => void;
  assetId?: string;
}) {
  // ── State ──────────────────────────────────────────────────────────────────
  const availableGrades = useMemo(() => {
    const all = [...new Set([...history.map(h => h.grade), ...gradeLattice.map(g => g.grade)])];
    const allow10 = gradeLattice.some(g => g.grade === '10.0' && (g.salesVolume ?? 0) > 0);
    return all
      .filter(g => g !== '10.0' || allow10)
      .sort((a, b) => {
        const ai = GRADE_ORDER.indexOf(a), bi = GRADE_ORDER.indexOf(b);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });
  }, [history, gradeLattice]);

  const [grade,     setGrade]     = useState<string>(() => availableGrades.includes('9.8') ? '9.8' : availableGrades[0] ?? '9.8');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [subIndicator, setSub]    = useState<SubIndicator>('rsi');
  const [showVolume, setShowVol]  = useState(false);

  useEffect(() => {
    if (availableGrades.length > 0 && !availableGrades.includes(grade))
      setGrade(availableGrades.includes('9.8') ? '9.8' : availableGrades[0]);
  }, [availableGrades]);

  // ── RSI data (real or series) ──────────────────────────────────────────────
  const { data: heritageSalesData } = useQuery<{ data: Array<{ grade: string; price_usd: number; sold_at: string; confidence_score: number }> }>({
    queryKey: ['heritage-sales', assetId],
    queryFn: async () => { const r = await fetch(`/api/heritage/sales/${assetId}`); if (!r.ok) throw new Error(`API ${r.status}`); return r.json(); },
    staleTime: 600_000,
    enabled: !!assetId,
  });

  const { data: rsiReal } = useQuery<{ data: RsiPoint[] }>({
    queryKey: ['rsi-real', assetId],
    queryFn: async () => { const r = await fetch(`/api/technicals/rsi-real/${assetId}`); if (!r.ok) throw new Error(`API ${r.status}`); return r.json(); },
    staleTime: 300_000,
    enabled: !!assetId,
  });
  const { data: rsiSeries } = useQuery<{ data: RsiPoint[] }>({
    queryKey: ['rsi-series', workName],
    queryFn: async () => { const r = await fetch(`/api/technicals/rsi-series/${encodeURIComponent(workName)}`); if (!r.ok) throw new Error(`API ${r.status}`); return r.json(); },
    staleTime: 300_000,
  });
  const rsiPoints = (rsiReal?.data?.length ? rsiReal.data : rsiSeries?.data) ?? [];

  // ── Derived chart data ─────────────────────────────────────────────────────
  const pricePoints = useMemo(() => {
    const raw: [number, number][] = history
      .filter(h => h.grade === grade)
      .map(h => [+new Date(h.observedAt), h.priceUsd]);

    if (heritageSalesData?.data?.length) {
      for (const s of heritageSalesData.data) {
        if (s.grade === grade && s.price_usd > 0 && s.sold_at) {
          const t = +new Date(s.sold_at);
          if (!isNaN(t)) {
            raw.push([t, s.price_usd]);
          }
        }
      }
    }

    raw.sort((a, b) => a[0] - b[0]);
    if (raw.length === 0) return [];

    const dayMap = new Map<string, [number, number]>();
    for (const [t, p] of raw) {
      const d = new Date(t).toISOString().slice(0, 10);
      dayMap.set(d, [t, p]);
    }
    const sortedDays = [...dayMap.keys()].sort();
    return sortedDays.map(d => dayMap.get(d)!);
  }, [history, grade, heritageSalesData]);

  const isOhlc = chartType === 'candlestick' || chartType === 'ohlc';
  // Use real Heritage Auctions high/low for candlestick wicks when sale records exist
  const ohlcPoints = useMemo(
    () => isOhlc ? toOhlcvWithHeritage(pricePoints, heritageSalesData?.data, grade) : [],
    [isOhlc, pricePoints, heritageSalesData, grade]
  );

  // ── Synthetic volume (absolute price-change as activity proxy) ─────────────
  const volPoints = useMemo<[number, number][]>(() => {
    if (!showVolume || pricePoints.length < 2) return [];
    return pricePoints.slice(1).map((p, i) => {
      const prev = pricePoints[i][1];
      return [p[0], Math.abs(p[1] - prev)] as [number, number];
    });
  }, [showVolume, pricePoints]);

  // Heritage Auction Volume — per-date sale counts for the 'hax-vol' sub-indicator (all grades)
  const heritageVolPoints = useMemo<[number, number][]>(() => {
    if (!heritageSalesData?.data?.length) return [];
    const dateMap = new Map<string, number>();
    for (const s of heritageSalesData.data) {
      if (!s?.sold_at) continue;
      const ymd = String(s.sold_at).slice(0, 10); // YYYY-MM-DD
      dateMap.set(ymd, (dateMap.get(ymd) ?? 0) + 1);
    }
    return [...dateMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([ymd, cnt]) => [+new Date(ymd), cnt] as [number, number]);
  }, [heritageSalesData]);

  // Grade-filtered Heritage vol — per-date sale counts used by the Vol overlay when real data exists for the selected grade
  const heritageVolByGrade = useMemo<[number, number][]>(() => {
    if (!heritageSalesData?.data?.length) return [];
    const filtered = heritageSalesData.data.filter(s => s.grade === grade);
    if (!filtered.length) return [];
    const dateMap = new Map<string, number>();
    for (const s of filtered) {
      if (!s?.sold_at) continue;
      const ymd = String(s.sold_at).slice(0, 10); // YYYY-MM-DD
      dateMap.set(ymd, (dateMap.get(ymd) ?? 0) + 1);
    }
    return [...dateMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([ymd, cnt]) => [+new Date(ymd), cnt] as [number, number]);
  }, [heritageSalesData, grade]);

  // True when real Heritage sale data exists for the currently selected grade
  const hasRealVol = heritageVolByGrade.length > 0;

  const trendColor = useMemo(() => {
    if (pricePoints.length < 2) return eraColors.border;
    const delta = (pricePoints.at(-1)![1] - pricePoints[0][1]) / pricePoints[0][1] * 100;
    return delta > 2 ? '#22c55e' : delta < -2 ? '#ef4444' : eraColors.border;
  }, [pricePoints, eraColors]);

  // ── MACD with grade-aggregation density fallback ──────────────────────────
  // Primary: compute from selected grade series (requires 26+ points).
  // Fallback: when the grade has <26 points, bucket all history entries by day,
  // average prices per date across all grades, and compute MACD from that denser
  // series. Returns isAggregated=true when the fallback is used.
  const macdData = useMemo(() => {
    const prices = pricePoints.map(p => p[1]);
    const times  = pricePoints.map(p => p[0]);
    if (prices.length >= 26) {
      const { macd, signal, hist } = computeMacd(prices);
      return { macd, signal, hist, times, isAggregated: false };
    }
    // Density fallback: aggregate all grades, bucket by day, average per bucket
    const dateMap = new Map<number, number[]>();
    for (const h of history) {
      const t   = +new Date(h.observedAt);
      const day = Math.floor(t / 86_400_000) * 86_400_000;
      if (!dateMap.has(day)) dateMap.set(day, []);
      dateMap.get(day)!.push(h.priceUsd);
    }
    const aggPoints = [...dateMap.entries()]
      .sort(([a], [b]) => a - b)
      .map(([t, ps]) => [t, ps.reduce((s, v) => s + v, 0) / ps.length] as [number, number]);
    if (aggPoints.length < 26) return null;
    const aggPrices = aggPoints.map(p => p[1]);
    const aggTimes  = aggPoints.map(p => p[0]);
    const { macd, signal, hist } = computeMacd(aggPrices);
    return { macd, signal, hist, times: aggTimes, isAggregated: true };
  }, [pricePoints, history]);

  // ── Client-side RSI (computed directly from the grade price series) ────────
  const rsiClientFallback = useMemo<[number, number][]>(() => {
    if (pricePoints.length < 2) return [];
    const prices = pricePoints.map(p => p[1]);
    const times  = pricePoints.map(p => p[0]);
    const vals   = computeRsi14(prices);
    const result: [number, number][] = [];
    for (let i = 0; i < prices.length; i++) {
      let val = vals[i];
      if (val === null && i >= 1) {
        const sub = prices.slice(0, i + 1);
        const ch = sub.slice(1).map((v, idx) => v - sub[idx]);
        const g = ch.filter(c => c > 0).reduce((a, b) => a + b, 0);
        const l = ch.filter(c => c < 0).reduce((a, b) => a - b, 0);
        val = l === 0 ? (g > 0 ? 70 : 50) : 100 - (100 / (1 + (g / (l || 1))));
      } else if (val === null) {
        val = 50.0;
      }
      result.push([times[i], Math.round(Number(val) * 10) / 10]);
    }
    return result;
  }, [pricePoints]);

  // ── RSI aligned to price x-axis ───────────────────────────────────────────
  const rsiAligned = useMemo(() => {
    if (subIndicator !== 'rsi') return [];
    // Prioritize direct 1:1 time alignment with the price chart:
    if (rsiClientFallback.length > 0) {
      return rsiClientFallback;
    }
    if (rsiPoints.length > 0) {
      return rsiPoints.map(d => [+new Date(d.date ?? ''), d.rsi] as [number, number]).filter(p => !isNaN(p[0]));
    }
    return [];
  }, [rsiPoints, rsiClientFallback, subIndicator]);

  const latestRsi = rsiAligned.length ? rsiAligned.at(-1)![1] : null;
  const rsiZoneNow = latestRsi != null ? rsiZone(latestRsi) : null;

  // ── Y-axis panes ──────────────────────────────────────────────────────────
  const hasSubPane = subIndicator !== 'none' && (
    subIndicator === 'macd'    ? !!macdData :
    subIndicator === 'hax-vol' ? heritageVolPoints.length > 0 :
    rsiAligned.length > 0
  );


  // ── Grade delta stats ──────────────────────────────────────────────────────
  const delta30 = useMemo(() => {
    if (pricePoints.length < 2) return null;
    const cutoff = Date.now() - 30 * 86_400_000;
    const recent = pricePoints.filter(p => p[0] >= cutoff);
    if (recent.length < 2) return null;
    const from = recent[0][1], to = recent.at(-1)![1];
    return { pct: ((to - from) / from) * 100, abs: to - from };
  }, [pricePoints]);

  const deltaColor = !delta30 ? 'rgba(255,255,255,0.3)' : delta30.pct >= 0 ? '#22c55e' : '#ef4444';

  // ── Data freshness indicator ───────────────────────────────────────────────
  const lastUpdated = useMemo(() => {
    if (history.length === 0) return null;
    const dates = history
      .map(h => new Date(h.observedAt))
      .filter(d => !isNaN(d.getTime()));
    if (dates.length === 0) return null;
    return new Date(Math.max(...dates.map(d => d.getTime())));
  }, [history]);

  // ── Toolbar button helper ──────────────────────────────────────────────────
  const Btn = useCallback(({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      style={{
        fontSize: 9, padding: '3px 8px', border: 'none', cursor: 'pointer', borderRadius: 2,
        fontFamily: 'monospace', letterSpacing: '0.07em', textTransform: 'uppercase',
        background: active ? eraColors.border : 'rgba(255,255,255,0.06)',
        color: active ? '#000' : 'rgba(255,255,255,0.55)',
        outline: active ? 'none' : `1px solid rgba(255,255,255,0.08)`,
        transition: 'background-color 0.1s, color 0.1s',
      }}
    >
      {children}
    </button>
  ), [eraColors.border]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Panel title="Chart" icon={<TrendingUp className="w-3.5 h-3.5" />} eraColors={eraColors}>

      {/* ── Toolbar row 1 — grade selector + delta ────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
        {/* Grade tabs */}
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {availableGrades.map(g => (
            <button key={g} onClick={() => setGrade(g)} style={{
              fontSize: 9, padding: '3px 9px', borderRadius: 2, cursor: 'pointer', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'monospace',
              background: grade === g ? gradeColor(g) : 'rgba(255,255,255,0.04)',
              color: grade === g ? '#0a0f1a' : gradeColor(g),
              border: `1px solid ${withAlpha(gradeColor(g), 0.314)}`,
              fontWeight: grade === g ? 600 : 400,
            }}>
              {g === 'RAW' ? 'Raw' : `${g}`}
            </button>
          ))}
        </div>

        {/* Confirmed sales count badge — real Heritage Auctions data from grade lattice */}
        {(() => {
          const gradeRow = gradeLattice.find(g => g.grade === grade);
          const vol = gradeRow?.salesVolume ?? null;
          if (vol == null) return null;
          return (
            <span style={{ fontSize: 9, fontFamily: 'monospace', color: vol > 0 ? '#38bdf8' : 'rgba(255,255,255,0.22)', background: vol > 0 ? 'rgba(56,189,248,0.08)' : 'rgba(255,255,255,0.03)', padding: '2px 7px', borderRadius: 2, border: `1px solid ${vol > 0 ? 'rgba(56,189,248,0.25)' : 'rgba(255,255,255,0.08)'}`, letterSpacing: '0.05em' }}>
              {vol > 0 ? `${vol} SALE${vol !== 1 ? 'S' : ''}` : 'NO SALES'}
            </span>
          );
        })()}

        {/* Delta badge */}
        {delta30 && (
          <span style={{ fontSize: 10, fontFamily: 'monospace', color: deltaColor, background: withAlpha(deltaColor, 0.078), padding: '2px 7px', borderRadius: 2, border: `1px solid ${withAlpha(deltaColor, 0.188)}` }}>
            {delta30.pct >= 0 ? '+' : ''}{delta30.pct.toFixed(2)}% · 30d
          </span>
        )}

        {/* Latest RSI badge */}
        {latestRsi != null && (
          <span style={{ fontSize: 9, fontFamily: 'monospace', color: rsiZoneNow!.color, background: withAlpha(rsiZoneNow!.color, 0.078), padding: '2px 7px', borderRadius: 2, border: `1px solid ${withAlpha(rsiZoneNow!.color, 0.188)}`, letterSpacing: '0.06em' }}>
            RSI {latestRsi.toFixed(1)} · {rsiZoneNow!.label}
          </span>
        )}

        {/* Data freshness indicator */}
        {lastUpdated && (
          <span style={{ marginLeft: 'auto', fontSize: 8, fontFamily: 'monospace', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.07em' }}>
            DATA {lastUpdated.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
          </span>
        )}
      </div>

      {/* ── Toolbar row 2 — chart type + overlays + sub-indicator ─────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${withAlpha(eraColors.border, 0.082)}` }}>
        {/* Chart type */}
        <div style={{ display: 'flex', gap: 3 }}>
          {([['candlestick','Candle'],['ohlc','OHLC'],['area','Area'],['line','Line'],['spline','Spline'],['column','Bar']] as const).map(([ct, lbl]) => (
            <Btn key={ct} active={chartType === ct} onClick={() => setChartType(ct)}>{lbl}</Btn>
          ))}
        </div>

        <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.1)', display: 'inline-block' }} />

        {/* Overlays */}
        <Btn active={!!showBollinger} onClick={() => onBollingerToggle?.(!showBollinger)}>
          BB
        </Btn>
        <Btn active={showVolume} onClick={() => setShowVol(v => !v)}>
          Vol{hasRealVol ? ' ★' : ''}
        </Btn>

        <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.1)', display: 'inline-block' }} />

        {/* Sub-indicator selector */}
        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Sub</span>
        {([['rsi','RSI'],['macd','MACD'],['hax-vol','HAX'],['none','Off']] as const).map(([k, lbl]) => (
          <Btn key={k} active={subIndicator === k} onClick={() => setSub(k)}>{lbl}</Btn>
        ))}
      </div>

      {/* ── Chart ──────────────────────────────────────────────────────────── */}
      {pricePoints.length === 0 ? (
        <div style={{ height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 12, fontFamily: 'monospace' }}>
          No price history for {grade === 'RAW' ? 'Ungraded' : `CGC ${grade}`}
        </div>
      ) : (
        <LWTradingChart
          pricePoints={pricePoints}
          ohlcPoints={ohlcPoints}
          chartType={chartType}
          trendColor={trendColor}
          eraColor={eraColors.border}
          showBollinger={!!showBollinger}
          bollingerData={bollingerData}
          heritageData={heritageSalesData?.data}
          showVolume={showVolume}
          volPoints={volPoints}
          heritageVolByGrade={heritageVolByGrade}
          hasRealVol={hasRealVol}
          subIndicator={subIndicator}
          rsiAligned={rsiAligned}
          macdData={macdData as any}
          heritageVolPoints={heritageVolPoints}
          hasSubPane={hasSubPane}
          height={hasSubPane ? 500 : 380}
          grade={grade}
        />
      )}

      {/* ── Bollinger footnote ────────────────────────────────────────────── */}
      {showBollinger && (
        <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 4, fontFamily: 'monospace' }}>
          Bollinger Bands: series-wide SMA20 ± 2σ across all {workName} issues
        </p>
      )}

      {/* ── Sub-indicator legend ──────────────────────────────────────────── */}
      {subIndicator === 'rsi' && (
        <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
          {RSI_ZONES.map(z => (
            <span key={z.label} style={{
              fontSize: 8, padding: '1px 6px', borderRadius: 2, fontFamily: 'monospace', letterSpacing: '0.07em',
              color: z.color, background: withAlpha(z.color, 0.071), border: `1px solid ${withAlpha(z.color, 0.145)}`,
              opacity: latestRsi != null && rsiZone(latestRsi).label === z.label ? 1 : 0.35,
              fontWeight: latestRsi != null && rsiZone(latestRsi).label === z.label ? 600 : 400,
            }}>
              {z.label}
            </span>
          ))}
        </div>
      )}
      {subIndicator === 'macd' && (
        <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          {macdData ? (
            <>
              {[['#38bdf8','MACD'],['#f59e0b','Signal'],['#22c55e / #ef4444','Histogram']].map(([c,l]) => (
                <span key={l} style={{ fontSize: 8, fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)' }}>
                  <span style={{ color: c.split(' ')[0] }}>■</span> {l}
                </span>
              ))}
              {macdData.isAggregated && (
                <span style={{ fontSize: 8, fontFamily: 'monospace', color: 'rgba(251,191,36,0.55)', letterSpacing: '0.04em' }}>
                  · cross-grade aggregate ({pricePoints.length} pts for {grade})
                </span>
              )}
            </>
          ) : (
            <span style={{ fontSize: 8, fontFamily: 'monospace', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.05em' }}>
              Insufficient data for MACD — requires 26+ price points across all grades
              {pricePoints.length > 0 ? ` (${pricePoints.length} for ${grade})` : ''}
            </span>
          )}
        </div>
      )}
      {subIndicator === 'hax-vol' && (
        <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 8, fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)' }}>
            <span style={{ color: '#f59e0b' }}>■</span> Heritage Auction sale count · per date · all grades
          </span>
          {heritageVolPoints.length === 0 && (
            <span style={{ fontSize: 8, fontFamily: 'monospace', color: 'rgba(255,255,255,0.2)', marginLeft: 4 }}>
              No Heritage records for this asset
            </span>
          )}
        </div>
      )}

      {/* ── AI price story ────────────────────────────────────────────────── */}
      <AISectionBlock text={aiInsight} accentColor={eraColors.border} label="Price Story" />
    </Panel>
  );
}
