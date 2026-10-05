'use client';
import { useEffect, useRef } from 'react';
import {
  createChart,
  ColorType,
  LineStyle,
  AreaSeries as AreaSeriesDef,
  LineSeries as LineSeriesDef,
  CandlestickSeries as CandlestickSeriesDef,
  BarSeries as BarSeriesDef,
  HistogramSeries as HistogramSeriesDef,
  createSeriesMarkers,
  type IChartApi,
  type UTCTimestamp,
} from 'lightweight-charts';
import type { BollingerPoint } from './types';

type ChartType = 'area' | 'line' | 'spline' | 'column' | 'candlestick' | 'ohlc';
type SubIndicator = 'rsi' | 'macd' | 'none' | 'hax-vol';

interface Props {
  pricePoints: [number, number][];
  ohlcPoints: [number, number, number, number, number][];
  chartType: ChartType;
  trendColor: string;
  eraColor: string;
  showBollinger: boolean;
  bollingerData: BollingerPoint[];
  heritageData?: Array<{ sold_at: string; price_usd: number; grade: string }>;
  showVolume: boolean;
  volPoints: [number, number][];
  heritageVolByGrade: [number, number][];
  hasRealVol: boolean;
  subIndicator: SubIndicator;
  rsiAligned: [number, number][];
  macdData: { macd: number[]; signal: number[]; hist: number[]; times: number[] } | null;
  heritageVolPoints: [number, number][];
  hasSubPane: boolean;
  height: number;
  grade: string;
}

const toSec = (ms: number): UTCTimestamp => Math.floor(ms / 1000) as UTCTimestamp;

function applyMarkers(
  series: any,
  items?: Array<{ sold_at: string; price_usd: number; grade: string }>
) {
  if (!series || !items?.length) return;
  try {
    const valid = items.filter(s => s && s.sold_at && !isNaN(new Date(s.sold_at).getTime()) && s.price_usd != null);
    if (!valid.length) return;
    const markers = valid
      .map(s => ({
        time: toSec(new Date(s.sold_at).getTime()),
        position: 'belowBar' as const,
        color: '#f59e0b',
        shape: 'arrowUp' as const,
        text: `$${Math.round(s.price_usd)}`,
      }))
      .sort((a, b) => (a.time as number) - (b.time as number));
    if (typeof (series as any).setMarkers === 'function') {
      (series as any).setMarkers(markers);
    } else if (typeof createSeriesMarkers === 'function') {
      createSeriesMarkers(series, markers);
    }
  } catch (err) {
    console.warn('[LWTradingChart] Failed to apply markers:', err);
  }
}

function dedupByTime<T extends { time: UTCTimestamp }>(arr: T[]): T[] {
  const seen = new Set<number>();
  const out: T[] = [];
  for (let i = arr.length - 1; i >= 0; i--) {
    if (!seen.has(arr[i].time)) {
      seen.add(arr[i].time);
      out.unshift(arr[i]);
    }
  }
  return out;
}

const DARK_BG = 'transparent';
const TEXT_COLOR = 'rgba(255,255,255,0.50)';
const GRID_COLOR = 'rgba(255,255,255,0.04)';
const BORDER_COLOR = 'rgba(255,255,255,0.08)';
const CROSSHAIR_COLOR = 'rgba(255,255,255,0.20)';

export default function LWTradingChart({
  pricePoints, ohlcPoints, chartType, trendColor, eraColor,
  showBollinger, bollingerData, heritageData,
  showVolume, volPoints, heritageVolByGrade, hasRealVol,
  subIndicator, rsiAligned, macdData, heritageVolPoints,
  hasSubPane, height, grade,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const isOhlc = chartType === 'candlestick' || chartType === 'ohlc';

    const chart = createChart(el, {
      width: el.clientWidth || 600,
      height,
      layout: {
        background: { type: ColorType.Solid, color: DARK_BG },
        textColor: TEXT_COLOR,
        fontFamily: 'monospace',
        fontSize: 10,
      },
      grid: {
        vertLines: { color: GRID_COLOR, style: LineStyle.Solid },
        horzLines: { color: GRID_COLOR, style: LineStyle.Solid },
      },
      rightPriceScale: {
        borderColor: BORDER_COLOR,
        scaleMargins: { top: 0.08, bottom: hasSubPane ? 0.35 : 0.08 },
        ticksVisible: true,
      },
      leftPriceScale: { visible: false },
      timeScale: {
        borderColor: BORDER_COLOR,
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: { color: CROSSHAIR_COLOR, width: 1, style: LineStyle.Dashed, labelBackgroundColor: 'rgba(20,24,36,0.9)' },
        horzLine: { color: CROSSHAIR_COLOR, width: 1, style: LineStyle.Dashed, labelBackgroundColor: 'rgba(20,24,36,0.9)' },
      },
      handleScroll: true,
      handleScale: true,
    });

    chartRef.current = chart;

    // ── Main price series ──────────────────────────────────────────────────────
    if (isOhlc && ohlcPoints.length > 0) {
      const cs = chartType === 'candlestick'
        ? chart.addSeries(CandlestickSeriesDef, {
            upColor: '#22c55e', downColor: '#ef4444',
            borderUpColor: '#22c55e', borderDownColor: '#ef4444',
            wickUpColor: '#22c55e', wickDownColor: '#ef4444',
            priceLineVisible: false,
          })
        : chart.addSeries(BarSeriesDef, {
            upColor: '#22c55e', downColor: '#ef4444',
            thinBars: false,
            priceLineVisible: false,
          });
      const mapped = dedupByTime(ohlcPoints.map(([ts, o, h, l, c]) => ({
        time: toSec(ts), open: o, high: h, low: l, close: c,
      })).sort((a, b) => a.time - b.time));
      cs.setData(mapped);

      applyMarkers(cs, heritageData);
    } else if (pricePoints.length > 0) {
      const baseData = dedupByTime(pricePoints.map(([ts, v]) => ({ time: toSec(ts), value: v }))
        .sort((a, b) => a.time - b.time));

      if (chartType === 'column') {
        const hs = chart.addSeries(HistogramSeriesDef, {
          color: trendColor,
          priceLineVisible: false,
        });
        hs.setData(baseData);
      } else if (chartType === 'line' || chartType === 'spline') {
        const ls = chart.addSeries(LineSeriesDef, {
          color: trendColor,
          lineWidth: 2,
          priceLineVisible: false,
          crosshairMarkerRadius: 4,
          crosshairMarkerVisible: true,
        });
        ls.setData(baseData);
        applyMarkers(ls, heritageData);
      } else {
        // area (default)
        const ls = chart.addSeries(AreaSeriesDef, {
          lineColor: trendColor,
          topColor: `${trendColor}55`,
          bottomColor: `${trendColor}04`,
          lineWidth: 2,
          priceLineVisible: false,
          crosshairMarkerRadius: 4,
          crosshairMarkerVisible: true,
        });
        ls.setData(baseData);
        applyMarkers(ls, heritageData);
      }
    }

    // ── Bollinger Band overlays ────────────────────────────────────────────────
    if (showBollinger && bollingerData.length > 0) {
      const toTs = (d: string) => toSec(new Date(d).getTime());
      const sorted = [...bollingerData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const upper = chart.addSeries(LineSeriesDef, { color: `${eraColor}55`, lineWidth: 1, lineStyle: LineStyle.Dotted, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false });
      upper.setData(dedupByTime(sorted.map(d => ({ time: toTs(d.date), value: d.upperBand }))));

      const mid = chart.addSeries(LineSeriesDef, { color: `${eraColor}88`, lineWidth: 1, lineStyle: LineStyle.Dashed, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false });
      mid.setData(dedupByTime(sorted.map(d => ({ time: toTs(d.date), value: d.sma20 }))));

      const lower = chart.addSeries(LineSeriesDef, { color: `${eraColor}55`, lineWidth: 1, lineStyle: LineStyle.Dotted, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false });
      lower.setData(dedupByTime(sorted.filter(d => d.lowerBand > 0).map(d => ({ time: toTs(d.date), value: d.lowerBand }))));
    }

    // ── Volume overlay on main pane ────────────────────────────────────────────
    if (showVolume) {
      const rawVol = hasRealVol ? heritageVolByGrade : volPoints;
      if (rawVol.length > 0) {
        const vs = chart.addSeries(HistogramSeriesDef, {
          color: hasRealVol ? '#f59e0b60' : `${eraColor}40`,
          priceLineVisible: false,
          lastValueVisible: false,
          priceScaleId: 'volume',
        });
        chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.80, bottom: 0 } });
        vs.setData(dedupByTime(rawVol.map(([ts, v]) => ({ time: toSec(ts), value: v })).sort((a, b) => a.time - b.time)));
      }
    }

    // ── Sub-indicator pane ─────────────────────────────────────────────────────
    if (hasSubPane) {
      if (typeof (chart as any).addPane === 'function') {
        try {
          (chart as any).addPane();
          const panes = typeof (chart as any).panes === 'function' ? (chart as any).panes() : [];
          if (panes[0]?.setStretchFactor) panes[0].setStretchFactor(2);
          if (panes[1]?.setStretchFactor) panes[1].setStretchFactor(1);
        } catch (e) {
          console.warn('[LWTradingChart] Pane setup error:', e);
        }
      }

      if (subIndicator === 'rsi' && rsiAligned.length > 0) {
        const rsiData = dedupByTime(rsiAligned.map(([ts, v]) => ({ time: toSec(ts), value: v })).sort((a, b) => a.time - b.time));
        const rsiS = chart.addSeries(LineSeriesDef, {
          color: 'rgba(255,255,255,0.55)',
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: true,
        }, 1);
        rsiS.setData(rsiData);
        rsiS.createPriceLine({ price: 70, color: '#fbbf2440', lineWidth: 1, lineStyle: LineStyle.Dotted, axisLabelVisible: false, title: '' });
        rsiS.createPriceLine({ price: 50, color: 'rgba(255,255,255,0.12)', lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: false, title: '' });
        rsiS.createPriceLine({ price: 30, color: '#f8717140', lineWidth: 1, lineStyle: LineStyle.Dotted, axisLabelVisible: false, title: '' });
      }

      if (subIndicator === 'macd' && macdData) {
        const { macd, signal, hist, times } = macdData;
        const toD = (i: number) => toSec(times[i]);
        const histData = dedupByTime(hist.map((v, i) => v != null ? ({ time: toD(i), value: v, color: v >= 0 ? '#22c55e80' : '#ef444480' }) : null).filter(Boolean).sort((a, b) => a!.time - b!.time) as { time: UTCTimestamp; value: number; color: string }[]);
        const macdData2 = dedupByTime(macd.map((v, i) => v != null ? ({ time: toD(i), value: v }) : null).filter(Boolean).sort((a, b) => a!.time - b!.time) as { time: UTCTimestamp; value: number }[]);
        const sigData = dedupByTime(signal.map((v, i) => v != null ? ({ time: toD(i), value: v }) : null).filter(Boolean).sort((a, b) => a!.time - b!.time) as { time: UTCTimestamp; value: number }[]);

        const histS = chart.addSeries(HistogramSeriesDef, { color: '#22c55e80', priceLineVisible: false, lastValueVisible: false }, 1);
        histS.setData(histData as any[]);
        const macdS = chart.addSeries(LineSeriesDef, { color: '#38bdf8', lineWidth: 2, priceLineVisible: false, lastValueVisible: false }, 1);
        macdS.setData(macdData2 as any[]);
        const sigS = chart.addSeries(LineSeriesDef, { color: '#f59e0b', lineWidth: 1, lineStyle: LineStyle.Dashed, priceLineVisible: false, lastValueVisible: false }, 1);
        sigS.setData(sigData as any[]);
      }

      if (subIndicator === 'hax-vol' && heritageVolPoints.length > 0) {
        const hvS = chart.addSeries(HistogramSeriesDef, { color: '#f59e0b', priceLineVisible: false, lastValueVisible: false }, 1);
        hvS.setData(dedupByTime(heritageVolPoints.map(([ts, v]) => ({ time: toSec(ts), value: v })).sort((a, b) => a.time - b.time)));
      }
    }

    chart.timeScale().fitContent();

    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width;
      if (w && chartRef.current) chartRef.current.applyOptions({ width: w });
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [
    pricePoints, ohlcPoints, chartType, trendColor, eraColor,
    showBollinger, bollingerData, heritageData,
    showVolume, volPoints, heritageVolByGrade, hasRealVol,
    subIndicator, rsiAligned, macdData, heritageVolPoints,
    hasSubPane, height, grade,
  ]);

  return (
    <div style={{ width: '100%' }}>
      <div ref={containerRef} style={{ width: '100%' }} />
      <div style={{ textAlign: 'right', paddingTop: '2px', paddingRight: '4px' }}>
        <a
          href="https://www.tradingview.com/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace', textDecoration: 'none' }}
        >
          Powered by TradingView
        </a>
      </div>
    </div>
  );
}
