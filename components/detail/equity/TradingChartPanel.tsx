'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import LWTradingChart from './LWTradingChart';
import { TrendingUp } from 'lucide-react';
import { getEraColors } from '@/lib/design-system/colors';
import { withAlpha } from '@/lib/colorUtils';
import type { GradePrice, HistoryEntry } from './types';
import { GRADE_ORDER, computeMacd, gradeColor } from './shared';
import Panel from './Panel';
import { monthlyCandles, rsi14, salesPerDay, dailyLastPoints, bollinger20, priceChangeByDays } from '@/lib/comics/chart-model';

type ChartType = 'area' | 'line' | 'spline' | 'column' | 'candlestick' | 'ohlc';
type SubIndicator = 'rsi' | 'macd' | 'none';

export interface ChartSale { grade: string; priceUsd: number; date: string }

const RSI_ZONES = [
  { max: 30, label: 'OVERSOLD', color: '#f87171' },
  { max: 45, label: 'WEAK', color: '#fb923c' },
  { max: 55, label: 'NEUTRAL', color: 'rgba(255,255,255,0.55)' },
  { max: 70, label: 'FIRM', color: '#86efac' },
  { max: 100, label: 'OVERBOUGHT', color: '#fbbf24' },
];
const rsiZone = (rsi: number) => RSI_ZONES.find((z) => rsi <= z.max) ?? RSI_ZONES[4];

/**
 * Price chart built only from dated observations on file: PriceCharting snapshots and completed sales.
 * Candles are monthly open/high/low/close of those observations. Volume is the number of recorded sales.
 * Indicators appear only when enough real observations exist; nothing is padded or interpolated.
 */
export default function TradingChartPanel({
  history, eraColors, gradeLattice = [], sales = [],
}: {
  history: HistoryEntry[];
  eraColors: ReturnType<typeof getEraColors>;
  gradeLattice?: GradePrice[];
  sales?: ChartSale[];
}) {
  const availableGrades = useMemo(() => {
    const all = [...new Set(history.map((h) => h.grade))];
    return all.sort((a, b) => {
      const ai = GRADE_ORDER.indexOf(a), bi = GRADE_ORDER.indexOf(b);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
  }, [history]);

  const [grade, setGrade] = useState<string>(() => (availableGrades.includes('9.8') ? '9.8' : availableGrades[0] ?? '9.8'));
  const [chartType, setChartType] = useState<ChartType>('area');
  const [subIndicator, setSub] = useState<SubIndicator>('rsi');
  const [showVolume, setShowVol] = useState(false);
  const [showBollinger, setShowBollinger] = useState(true);

  useEffect(() => {
    if (availableGrades.length > 0 && !availableGrades.includes(grade)) {
      setGrade(availableGrades.includes('9.8') ? '9.8' : availableGrades[0]);
    }
  }, [availableGrades, grade]);

  const pricePoints = useMemo(
    () => dailyLastPoints(history.filter((h) => h.grade === grade).map((h) => [+new Date(h.observedAt), h.priceUsd] as [number, number])),
    [history, grade],
  );

  const isOhlc = chartType === 'candlestick' || chartType === 'ohlc';
  const ohlcPoints = useMemo(() => (isOhlc ? monthlyCandles(pricePoints) : []), [isOhlc, pricePoints]);

  const salesVol = useMemo(() => salesPerDay(sales, grade), [sales, grade]);
  const gradeSales = useMemo(
    () => sales.filter((s) => s.grade === grade).map((s) => ({ sold_at: s.date, price_usd: s.priceUsd, grade: s.grade })),
    [sales, grade],
  );

  const trendColor = useMemo(() => {
    if (pricePoints.length < 2) return eraColors.border;
    const delta = ((pricePoints.at(-1)![1] - pricePoints[0][1]) / pricePoints[0][1]) * 100;
    return delta > 2 ? '#22c55e' : delta < -2 ? '#ef4444' : eraColors.border;
  }, [pricePoints, eraColors]);

  const rsiAligned = useMemo<[number, number][]>(() => {
    const vals = rsi14(pricePoints.map((p) => p[1]));
    const out: [number, number][] = [];
    vals.forEach((v, i) => { if (v != null) out.push([pricePoints[i][0], Math.round(v * 10) / 10]); });
    return out;
  }, [pricePoints]);

  const bollingerData = useMemo(() => bollinger20(pricePoints), [pricePoints]);

  const macdData = useMemo(() => {
    const prices = pricePoints.map((p) => p[1]);
    // MACD(12,26,9) has no signal line until 34 real observations exist.
    if (prices.length < 34) return null;
    const { macd, signal, hist } = computeMacd(prices);
    return { macd, signal, hist, times: pricePoints.map((p) => p[0]) };
  }, [pricePoints]);

  const latestRsi = rsiAligned.length ? rsiAligned.at(-1)![1] : null;
  const rsiZoneNow = latestRsi != null ? rsiZone(latestRsi) : null;

  const hasSubPane = subIndicator === 'macd' ? !!macdData : subIndicator === 'rsi' ? rsiAligned.length > 0 : false;

  const windowChanges = useMemo(() => ([20, 60, 90] as const).map((days) => ({ days, pct: priceChangeByDays(pricePoints, days) })), [pricePoints]);
  const delta30 = useMemo(() => priceChangeByDays(pricePoints, 30), [pricePoints]);
  const deltaColor = delta30 == null ? 'rgba(255,255,255,0.3)' : delta30 >= 0 ? '#22c55e' : '#ef4444';

  const lastUpdated = useMemo(() => {
    const times = history.map((h) => new Date(h.observedAt).getTime()).filter((t) => !isNaN(t));
    return times.length ? new Date(Math.max(...times)) : null;
  }, [history]);

  const Btn = useCallback(({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      style={{
        fontSize: 9, padding: '3px 8px', border: 'none', cursor: 'pointer', borderRadius: 2,
        fontFamily: 'monospace', letterSpacing: '0.07em', textTransform: 'uppercase',
        background: active ? eraColors.border : 'rgba(255,255,255,0.06)',
        color: active ? '#000' : 'rgba(255,255,255,0.55)',
        outline: active ? 'none' : '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {children}
    </button>
  ), [eraColors.border]);

  if (history.length === 0) {
    return (
      <Panel title="Chart" icon={<TrendingUp className="w-3.5 h-3.5" />} eraColors={eraColors}>
        <div style={{ padding: '28px 0', textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 12, fontFamily: 'monospace' }}>
          No dated prices on file for this book yet.
        </div>
      </Panel>
    );
  }

  const salesBadge = gradeLattice.find((g) => g.grade === grade)?.salesVolume ?? null;

  return (
    <Panel title="Chart" icon={<TrendingUp className="w-3.5 h-3.5" />} eraColors={eraColors}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {availableGrades.map((g) => (
            <button key={g} onClick={() => setGrade(g)} style={{
              fontSize: 9, padding: '3px 9px', borderRadius: 2, cursor: 'pointer', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'monospace',
              background: grade === g ? gradeColor(g) : 'rgba(255,255,255,0.04)',
              color: grade === g ? '#0a0f1a' : gradeColor(g),
              border: `1px solid ${withAlpha(gradeColor(g), 0.314)}`,
              fontWeight: grade === g ? 600 : 400,
            }}>
              {g === 'RAW' ? 'Raw' : g}
            </button>
          ))}
        </div>

        {salesBadge != null && salesBadge > 0 && (
          <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#38bdf8', background: 'rgba(56,189,248,0.08)', padding: '2px 7px', borderRadius: 2, border: '1px solid rgba(56,189,248,0.25)', letterSpacing: '0.05em' }}>
            {salesBadge} SALE{salesBadge !== 1 ? 'S' : ''}
          </span>
        )}
        {delta30 != null && (
          <span style={{ fontSize: 10, fontFamily: 'monospace', color: deltaColor, background: withAlpha(deltaColor, 0.078), padding: '2px 7px', borderRadius: 2, border: `1px solid ${withAlpha(deltaColor, 0.188)}` }}>
            {delta30 >= 0 ? '+' : ''}{delta30.toFixed(2)}% · 30d
          </span>
        )}
        {windowChanges.map(({ days, pct }) => (
          <span key={days} style={{ fontSize: 9, fontFamily: 'monospace', color: pct == null ? 'rgba(255,255,255,0.28)' : pct >= 0 ? '#86efac' : '#fca5a5', background: 'rgba(255,255,255,0.035)', padding: '2px 6px', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
            {pct == null ? '—' : `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`} · {days}d
          </span>
        ))}
        {latestRsi != null && rsiZoneNow && (
          <span style={{ fontSize: 9, fontFamily: 'monospace', color: rsiZoneNow.color, background: withAlpha(rsiZoneNow.color, 0.078), padding: '2px 7px', borderRadius: 2, border: `1px solid ${withAlpha(rsiZoneNow.color, 0.188)}`, letterSpacing: '0.06em' }}>
            RSI {latestRsi.toFixed(1)} · {rsiZoneNow.label}
          </span>
        )}
        {lastUpdated && (
          <span style={{ marginLeft: 'auto', fontSize: 8, fontFamily: 'monospace', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.07em' }}>
            DATA {lastUpdated.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${withAlpha(eraColors.border, 0.082)}` }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {([['candlestick', 'Candle'], ['ohlc', 'OHLC'], ['area', 'Area'], ['line', 'Line'], ['spline', 'Spline'], ['column', 'Bar']] as const).map(([ct, lbl]) => (
            <Btn key={ct} active={chartType === ct} onClick={() => setChartType(ct)}>{lbl}</Btn>
          ))}
        </div>
        <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.1)', display: 'inline-block' }} />
        <Btn active={showBollinger} onClick={() => setShowBollinger((v) => !v)}>BB20</Btn>
        {salesVol.length > 0 && (
          <>
            <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.1)', display: 'inline-block' }} />
            <Btn active={showVolume} onClick={() => setShowVol((v) => !v)}>Sales</Btn>
          </>
        )}
        <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.1)', display: 'inline-block' }} />
        {([['rsi', 'RSI'], ['macd', 'MACD'], ['none', 'Off']] as const).map(([k, lbl]) => (
          <Btn key={k} active={subIndicator === k} onClick={() => setSub(k)}>{lbl}</Btn>
        ))}
      </div>

      {pricePoints.length === 0 ? (
        <div style={{ height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 12, fontFamily: 'monospace' }}>
          No dated prices for {grade === 'RAW' ? 'Ungraded' : `CGC ${grade}`}
        </div>
      ) : (
        <LWTradingChart
          pricePoints={pricePoints}
          ohlcPoints={ohlcPoints}
          chartType={chartType}
          trendColor={trendColor}
          eraColor={eraColors.border}
          showBollinger={showBollinger}
          bollingerData={bollingerData}
          heritageData={gradeSales}
          showVolume={showVolume}
          volPoints={[]}
          heritageVolByGrade={salesVol}
          hasRealVol={salesVol.length > 0}
          subIndicator={subIndicator}
          rsiAligned={rsiAligned}
          macdData={macdData as any}
          heritageVolPoints={[]}
          hasSubPane={hasSubPane}
          height={hasSubPane ? 500 : 380}
          grade={grade}
        />
      )}

      {pricePoints.length > 0 && subIndicator === 'rsi' && rsiAligned.length === 0 && (
        <p style={{ fontSize: 9, fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>
          RSI needs 15 dated prices; {pricePoints.length} on file for {grade}.
        </p>
      )}
      {pricePoints.length > 0 && subIndicator === 'macd' && !macdData && (
        <p style={{ fontSize: 9, fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>
          MACD(12,26,9) needs 34 dated prices; {pricePoints.length} on file for {grade}.
        </p>
      )}
      {pricePoints.length > 0 && showBollinger && bollingerData.length === 0 && (
        <p style={{ fontSize: 9, fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>
          BB20 is waiting for 20 dated prices for {grade}; no shorter window is substituted.
        </p>
      )}
      {pricePoints.length > 0 && isOhlc && (
        <p style={{ fontSize: 9, fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>
          Candles are monthly open, high, low and close of the dated prices on file. A month with one price is a flat candle.
        </p>
      )}
    </Panel>
  );
}
