import { describe, it, expect } from "vitest";
import { resolveMarketPricing } from "@/lib/pricing/market-pricing-resolver";
import * as React from "react";
import { renderToString } from "react-dom/server";
import { EquityCandlestickChart } from "@/components/equity/equity-candlestick-chart";

describe("TradingView Charts & PriceCharting / CGC Pricing Integration", () => {
  it("resolves authentic PriceCharting benchmarks and CGC sales data for key comics", () => {
    // 1. Amazing Spider-Man #1
    const spidey = resolveMarketPricing("Amazing Spider-Man", "1", 25000);
    expect(spidey.series).toBe("Amazing Spider-Man");
    expect(spidey.issueNumber).toBe("1");
    expect(spidey.hasPriceChartingData).toBe(true);
    expect(spidey.hasCgcSalesData).toBe(true);
    expect(spidey.pricecharting.raw).toBeGreaterThan(0);
    expect(spidey.pricecharting.availableGrades.length).toBeGreaterThan(0);
    expect(spidey.cgcSales.length).toBeGreaterThan(0);

    // Verify GPA/CGC completed sales attributes
    const firstSale = spidey.cgcSales[0];
    expect(firstSale.authority).toBe("CGC");
    expect(firstSale.amount).toBeGreaterThan(0);
    expect(firstSale.observedAt).toBeDefined();

    // 2. Detective Comics #27
    const tec27 = resolveMarketPricing("Detective Comics", "27", 3500000);
    expect(tec27.hasPriceChartingData).toBe(true);
    expect(tec27.pricecharting.raw).toBeGreaterThan(10000);
    expect(tec27.pricecharting.grade80).toBeGreaterThan(100000);

    // 3. Action Comics #1
    const act1 = resolveMarketPricing("Action Comics", "1", 6000000);
    expect(act1.hasPriceChartingData).toBe(true);
    expect(act1.pricecharting.raw).toBeGreaterThan(5000);
  });

  it("synthesizes valid TradingView candlestick OHLC and area time series", () => {
    const res = resolveMarketPricing("Action Comics", "252", 48500);
    expect(res.tradingViewArea.length).toBe(90);
    expect(res.tradingViewCandles.length).toBe(90);
    expect(res.tradingViewVolume.length).toBe(90);

    // Validate candlestick OHLC logic
    for (const candle of res.tradingViewCandles) {
      expect(candle.time).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(candle.high).toBeGreaterThanOrEqual(candle.low);
      expect(candle.high).toBeGreaterThanOrEqual(Math.max(candle.open, candle.close));
      expect(candle.low).toBeLessThanOrEqual(Math.min(candle.open, candle.close));
      expect(candle.volume).toBeGreaterThan(0);
    }

    // Latest price must match reference FMV
    expect(res.tradingViewCandles[res.tradingViewCandles.length - 1].close).toBe(res.primaryFmv98);
  });

  it("renders EquityCandlestickChart SSR with TradingView attribution and data source badges", () => {
    const html = renderToString(
      React.createElement(EquityCandlestickChart, {
        ticker: "ACT.252.SOV",
        series: "Action Comics",
        issueNumber: "252",
        currentPrice: 48500,
        deltaPercent: 0.68,
      })
    );

    // Verify TradingView engine branding
    expect(html).toContain("TRADINGVIEW VALUATION ENGINE");
    expect(html).toContain("Powered by TradingView");
    expect(html).toContain("https://www.tradingview.com/");

    // Verify Exchange and CGC data source badges
    expect(html).toContain("Exchange Secondary Benchmark");
    expect(html).toContain("CGC Universal Census &amp; Completed Sales");

    // Verify valuation and ticker
    expect(html).toContain("ACT.252.SOV");
    expect(html).toContain("$48,500.00");
    expect(html).toContain("+0.68%");

    // Verify chart mode buttons
    expect(html).toContain("Area");
    expect(html).toContain("Candles");
    expect(html).toContain("Ladder");
    expect(html).toContain("Terminal");
  });
});
