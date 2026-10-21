import { describe, it, expect } from "vitest";
import {
  calculateSignatureFee,
  resolveCgcTier,
  calculateLandedEquityReport,
  LandedCostInput,
} from "@/lib/sniper/landed-equity-engine";

describe("Landed Equity & Replacement Cost Engine", () => {
  describe("Signature Fee Logic", () => {
    it("returns $0 for unsigned books", () => {
      expect(calculateSignatureFee(0, false)).toBe(0);
    });

    it("returns $30 for a single signature", () => {
      expect(calculateSignatureFee(1, false)).toBe(30.0);
    });

    it("returns $55 for two signatures ($30 + $25)", () => {
      expect(calculateSignatureFee(2, false)).toBe(55.0);
    });

    it("returns $80 for three signatures ($30 + 2 * $25)", () => {
      expect(calculateSignatureFee(3, false)).toBe(80.0);
    });

    it("adds $15 for artist remarque", () => {
      expect(calculateSignatureFee(0, true)).toBe(15.0);
      expect(calculateSignatureFee(1, true)).toBe(45.0);
      expect(calculateSignatureFee(2, true)).toBe(70.0);
    });
  });

  describe("CGC Service Tiers & Return Shipping", () => {
    it("resolves Modern tier for <= $400 post-1975", () => {
      const tier = resolveCgcTier(350, false, false);
      expect(tier.tierName).toBe("Modern");
      expect(tier.baseFee).toBe(30.0);
      expect(tier.returnShipping).toBe(30.0);
    });

    it("resolves Vintage tier for <= $400 pre-1975", () => {
      const tier = resolveCgcTier(350, true, false);
      expect(tier.tierName).toBe("Vintage (Pre-1975)");
      expect(tier.baseFee).toBe(45.0);
      expect(tier.returnShipping).toBe(30.0);
    });

    it("resolves High Value tier for $400.01 - $1,000", () => {
      const tier = resolveCgcTier(750, false, false);
      expect(tier.tierName).toBe("High Value");
      expect(tier.baseFee).toBe(105.0);
      expect(tier.returnShipping).toBe(40.0);
    });

    it("resolves Unlimited tier for > $1,000 with 4% of FMV and $135 floor", () => {
      // FMV $2,000: 4% is $80, so floor $135 applies
      const tierLowUnlimited = resolveCgcTier(2000, false, false);
      expect(tierLowUnlimited.tierName).toBe("Unlimited (4% FMV)");
      expect(tierLowUnlimited.baseFee).toBe(135.0);
      expect(tierLowUnlimited.returnShipping).toBe(85.0);

      // FMV $15,000 (like ASM 129 9.8): 4% is $600
      const tierHighUnlimited = resolveCgcTier(15000, true, false);
      expect(tierHighUnlimited.tierName).toBe("Unlimited (4% FMV)");
      expect(tierHighUnlimited.baseFee).toBe(600.0);
      expect(tierHighUnlimited.returnShipping).toBe(85.0);
    });
  });

  describe("Full Landed Equity Report & Escalator", () => {
    it("calculates exact Florida sunk friction and escalator rungs for a blue-chip raw book", () => {
      const input: LandedCostInput = {
        rawPrice: 500.0,
        fmv98: 4000.0,
        fmv96: 1800.0,
        fmv94: 1200.0,
        fmv92: 800.0,
        isPre1975: true,
        salesTaxRate: 0.07, // 7% FL tax
        inboundShipping: 15.0,
        outboundShipping: 15.0,
        includePressing: true,
        pressingFee: 20.0,
        signatureCount: 0,
        timeHorizonDays: 90,
      };

      const report = calculateLandedEquityReport(input);

      // 1. Upstream friction checks:
      expect(report.rawPurchasePrice).toBe(500.0);
      expect(report.salesTax).toBe(35.0); // 7% of $500
      // PayPal: $500 * 0.0299 + 0.49 = $14.95 + $0.49 = $15.44
      expect(report.paypalFriction).toBe(15.44);
      expect(report.inboundShipping).toBe(15.0);
      expect(report.outboundShipping).toBe(15.0);
      expect(report.pressingFriction).toBe(20.0);
      // Sunk basis = 500 + 35 + 15.44 + 15 + 15 + 20 = $600.44
      expect(report.sunkRawBasis).toBe(600.44);

      // 2. Ladder check: 4 rungs (9.2, 9.4, 9.6, 9.8)
      expect(report.gradeSteps.length).toBe(4);

      // 9.2 Rung (Base Hit Win):
      const step92 = report.gradeSteps.find((s) => s.grade === 9.2)!;
      expect(step92.fmv).toBe(800.0);
      expect(step92.milestone).toContain("Base Hit");
      // Auction Net = 800 * 0.90 = $720.00
      expect(step92.auctionNet).toBe(720.0);
      // Private Collector = 800 * 0.97 - 25 = $751.00
      expect(step92.privateCollectorNet).toBe(751.0);
      // LCS Floor = 800 * 0.50 = $400.00
      expect(step92.lcsNet).toBe(400.0);

      // Total Landed Cost at 9.2:
      // High value tier ($800) -> base fee $105 + return shipping $40 + invoice $5 = $150
      // Total Landed = $600.44 + $150 = $750.44
      expect(step92.cgcTier.totalGradingFriction).toBe(150.0);
      expect(step92.totalLandedCost).toBe(750.44);

      // 9.8 Rung (Grand Slam):
      const step98 = report.gradeSteps.find((s) => s.grade === 9.8)!;
      expect(step98.fmv).toBe(4000.0);
      expect(step98.milestone).toContain("Grand Slam");
      // Unlimited tier ($4000) -> 4% is $160 (> $135 floor) + return shipping $85 + invoice $5 = $250
      expect(step98.cgcTier.totalGradingFriction).toBe(250.0);
      expect(step98.totalLandedCost).toBe(850.44); // 600.44 + 250
      expect(step98.auctionNet).toBe(3600.0); // 4000 * 0.90
      expect(step98.netDollarGain).toBe(2749.56); // 3600 - 850.44
      expect(step98.roiPercent).toBeGreaterThan(300);
    });

    it("supports tax-exempt dealer resale certificate (0% sales tax)", () => {
      const report = calculateLandedEquityReport({
        rawPrice: 1000.0,
        fmv98: 2500.0,
        isTaxExempt: true,
      });

      expect(report.salesTax).toBe(0.0);
    });

    it("supports CGC Elite membership (10% discount on grading and pressing)", () => {
      const report = calculateLandedEquityReport({
        rawPrice: 200.0,
        fmv98: 300.0,
        isPre1975: true, // Vintage base $45 -> $40.50 with 10% off
        includePressing: true, // Pressing $20 -> $18 with 10% off
        isEliteMember: true,
      });

      expect(report.pressingFriction).toBe(18.0);
      const step98 = report.gradeSteps.find((s) => s.grade === 9.8)!;
      expect(step98.cgcTier.discountedBaseFee).toBe(40.5);
    });
  });
});
