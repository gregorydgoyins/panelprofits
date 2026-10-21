'use client';
import { useEffect, useRef } from 'react';
import {
  createChart,
  ColorType,
  LineSeries as LineSeriesDef,
  HistogramSeries as HistogramSeriesDef,
  type IChartApi,
  type UTCTimestamp,
} from 'lightweight-charts';

export interface LWSparklinePoint {
  time: string | number;
  value: number;
}

interface ReferenceLineOpts {
  value: number;
  color: string;
}

interface Props {
  data: LWSparklinePoint[];
  color: string;
  height?: number;
  minY?: number;
  maxY?: number;
  referenceLines?: ReferenceLineOpts[];
  histogram?: boolean;
  histogramColorFn?: (value: number) => string;
}

function toTime(t: string | number): UTCTimestamp {
  if (typeof t === 'number') return t as UTCTimestamp;
  return (new Date(t).getTime() / 1000) as UTCTimestamp;
}

export function LWLineSparkline({
  data,
  color,
  height = 72,
  minY,
  maxY,
  referenceLines,
  histogram = false,
  histogramColorFn,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || data.length < 2) return;

    const chart = createChart(el, {
      width: el.clientWidth || 200,
      height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'rgba(255,255,255,0.22)',
        fontFamily: 'monospace',
        fontSize: 9,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: 'rgba(255,255,255,0.04)', style: 1 },
      },
      rightPriceScale: {
        borderVisible: false,
        visible: false,
      },
      leftPriceScale: { visible: false },
      timeScale: {
        borderVisible: false,
        visible: false,
      },
      crosshair: {
        vertLine: { color: 'rgba(255,255,255,0.12)', width: 1, style: 2 },
        horzLine: { color: 'rgba(255,255,255,0.12)', width: 1, style: 2, labelVisible: false },
      },
      handleScroll: false,
      handleScale: false,
    });

    chartRef.current = chart;

    if (histogram) {
      const series = chart.addSeries(HistogramSeriesDef, {
        color,
        priceLineVisible: false,
        lastValueVisible: false,
        ...(minY !== undefined ? {} : {}),
      });
      const mapped = data.map(d => ({
        time: toTime(d.time),
        value: d.value,
        color: histogramColorFn ? histogramColorFn(d.value) : color,
      })).sort((a, b) => a.time - b.time);
      series.setData(mapped);
    } else {
      const series = chart.addSeries(LineSeriesDef, {
        color,
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerRadius: 2,
        crosshairMarkerVisible: true,
      });

      const mapped = data.map(d => ({
        time: toTime(d.time),
        value: d.value,
      })).sort((a, b) => a.time - b.time);
      series.setData(mapped);

      if (referenceLines?.length) {
        for (const rl of referenceLines) {
          series.createPriceLine({
            price: rl.value,
            color: rl.color,
            lineWidth: 1,
            lineStyle: 2,
            axisLabelVisible: false,
            title: '',
          });
        }
      }
    }

    if (minY !== undefined || maxY !== undefined) {
      chart.priceScale('right').applyOptions({
        autoScale: false,
        ...(minY !== undefined ? { minimumHeight: minY } : {}),
      });
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
  }, [data, color, height, minY, maxY, histogram]);

  if (data.length < 2) return null;

  return <div ref={containerRef} style={{ width: '100%' }} />;
}
