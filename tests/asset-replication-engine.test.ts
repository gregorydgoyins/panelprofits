import { describe, it, expect } from "vitest";
import {
  calculateCapitalizedCostBasis,
  calculateNetLiquidationProceeds,
  replicateComicAssetTransaction,
} from "@/lib/pricing/asset-replication-engine";

describe("Asset Replication Framework for Comic Equities", () => {
  it("calculates Phase 1 Capitalized Cost Basis accurately", () => {
    const basis = calculateCapitalizedCostBasis({
      rawPurchasePrice: 300,
      inboundShipping: 15,
      salesTaxPct: 7.0, // $21
      pressingFee: 20,
      gradingFee: 35,
      gradingShippingAndInsurance: 25,
    });

    // 300 + 21 + 15 + 20 + 35 + 25 = 416
    expect(basis.totalBasis).toBe(416.0);
    expect(basis.breakdown.taxes).toBe(21.0);
    expect(basis.breakdown.pressing).toBe(20.0);
    expect(basis.breakdown.grading).toBe(35.0);
  });

  it("calculates Phase 3 Net Liquidation Proceeds with marketplace drag", () => {
    const liquidation = calculateNetLiquidationProceeds({
      grossRealizedPrice: 1000,
      venueCommissionPct: 13.25, // eBay $132.50
      paymentProcessingPct: 0.0,
      outboundInsuredShipping: 25.0,
    });

    // 1000 - 132.50 - 25 = 842.50
    expect(liquidation.netProceeds).toBe(842.5);
    expect(liquidation.frictionTotal).toBe(157.5);
    expect(liquidation.effectiveFrictionPct).toBe(15.75);
  });

  it("calculates complete 3-Phase Asset Transaction (ROI, CAGR, NPV, Margin of Safety, Breakeven)", () => {
    // Buy raw for $200, capitalize to $300 cost basis.
    // Liquidate certified 9.8 at $800 gross after 180 days.
    const report = replicateComicAssetTransaction(
      {
        rawPurchasePrice: 200,
        inboundShipping: 15,
        salesTaxPct: 5.0, // $10
        pressingFee: 25,
        gradingFee: 35,
        gradingShippingAndInsurance: 15, // Total basis: 200 + 10 + 15 + 25 + 35 + 15 = 300
      },
      {
        grossRealizedPrice: 800,
        venueCommissionPct: 13.25, // $106
        outboundInsuredShipping: 20, // Total friction: $126 -> Net: $674
      },
      {
        holdingPeriodDays: 180, // ~0.493 years
        annualCostOfCapitalPct: 8.0,
      },
      800 // Intrinsic FMV target
    );

    expect(report.capitalizedCostBasis).toBe(300.0);
    expect(report.grossLiquidationPrice).toBe(800.0);
    expect(report.netRealizedProceeds).toBe(674.0);
    expect(report.netProfitUsd).toBe(374.0); // 674 - 300

    // ROI = (374 / 300) * 100 = 124.67%
    expect(report.roiPct).toBe(124.67);

    // Annualized CAGR for ~180 days with >2x return should exceed 300%
    expect(report.annualizedCagrPct).toBeGreaterThan(200);

    // NPV discounted at 8% cost of capital
    expect(report.npvUsd).toBeGreaterThan(340);

    // Benjamin Graham Margin of Safety = 1 - (300 / 800) = 62.5%
    expect(report.marginOfSafetyPct).toBe(62.5);

    // Breakeven Gross Hammer: Solves Gross - 13.25% - $20 = $300 -> (300 + 20) / (1 - 0.1325) = 368.88
    expect(report.breakevenGrossSaleUsd).toBe(368.88);
    expect(report.isProfitable).toBe(true);
  });
});
