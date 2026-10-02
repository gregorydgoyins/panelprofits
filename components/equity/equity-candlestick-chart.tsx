"use client";

import * as React from "react";
import { TradingViewChart } from "@/components/charts/tradingview-chart";
import { resolveMarketPricing } from "@/lib/pricing/market-pricing-resolver";

export interface ChartDataPoint {
  date: string;
  value: number;
  volume: number;
}

export interface EquityCandlestickChartProps {
  ticker: string;
  series?: string;
  issueNumber?: string;
  currentPrice: number;
  deltaPercent: number;
  dataPoints?: ChartDataPoint[];
  height?: number;
}

export function EquityCandlestickChart({
  ticker,
  series,
  issueNumber = "1",
  currentPrice,
  deltaPercent,
  dataPoints,
  height = 380,
}: EquityCandlestickChartProps) {
  // Resolve authentic PriceCharting and CGC data
  const pricing = React.useMemo(() => {
    return resolveMarketPricing(series || ticker, issueNumber, currentPrice);
  }, [series, ticker, issueNumber, currentPrice]);

  // If external observations were explicitly provided (e.g. from Index contracts like CE70/PPIX100),
  // map them to TradingView area & candlestick points
  const { areaData, candlestickData, volumeData } = React.useMemo(() => {
    if (dataPoints && dataPoints.length > 0) {
      const area = dataPoints.map((p) => ({ time: p.date, value: p.value }));
      const candles = dataPoints.map((p, idx) => {
        const prev = idx > 0 ? dataPoints[idx - 1].value : p.value;
        const open = prev;
        const close = p.value;
        const high = Math.round(Math.max(open, close) * 1.008);
        const low = Math.round(Math.min(open, close) * 0.992);
        return {
          time: p.date,
          open,
          high,
          low,
          close,
          volume: p.volume || 25,
        };
      });
      const vol = dataPoints.map((p, idx) => {
        const prev = idx > 0 ? dataPoints[idx - 1].value : p.value;
        const isUp = p.value >= prev;
        return {
          time: p.date,
          value: p.volume || 25,
          color: isUp ? "rgba(16, 185, 129, 0.45)" : "rgba(244, 63, 94, 0.45)",
        };
      });
      return { areaData: area, candlestickData: candles, volumeData: vol };
    }

    return {
      areaData: pricing.tradingViewArea,
      candlestickData: pricing.tradingViewCandles,
      volumeData: pricing.tradingViewVolume,
    };
  }, [dataPoints, pricing]);

  return (
    <TradingViewChart
      ticker={ticker}
      series={series || pricing.series}
      issueNumber={issueNumber || pricing.issueNumber}
      currentPrice={currentPrice || pricing.primaryFmv98}
      deltaPercent={deltaPercent}
      areaData={areaData}
      candlestickData={candlestickData}
      volumeData={volumeData}
      pricecharting={pricing.pricecharting}
      cgcSales={pricing.cgcSales}
      height={height}
    />
  );
}
