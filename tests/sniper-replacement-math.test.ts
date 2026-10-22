import { describe, it, expect } from "vitest";
import { calculateReplacementAnalysis } from "@/lib/sniper/sim/encasement-math";
import { buildLotMacroAndVelocity } from "@/lib/sniper/sim/lot-service";

describe("Sniper Replacement Cost & Bidding Frenzy Driver", () => {
  it("computes exact CPR all-in formula: Raw + CPR + Grading + 2-way Shipping + 2-way Insurance + Invoice + Tax", () => {
    const analysis = calculateReplacementAnalysis({
      rawPrice: 150.0,
      currentBid: 200.0,
      fmv98: 800.0,
      fmv96: 400.0,
      fmv94: 250.0,
      fmv92: 180.0,
      isVintage: false,
      grader: "CGC",
    });

    const cpr = analysis.cpr;
    expect(cpr.rawPrice).toBe(150.0);
    expect(cpr.prepFee).toBe(30.0);
    expect(cpr.gradingFee).toBe(35.0);
    expect(cpr.outgoingShipping).toBe(15.0);
    expect(cpr.returnShipping).toBe(28.0);
    expect(cpr.twoWayShipping).toBe(43.0);
    expect(cpr.invoiceFee).toBe(5.0);
    expect(cpr.serviceTax).toBe(4.2); // (30 + 35 + 5) * 0.06 = 4.20

    // Sum: 150 + 30 + 35 + 15 + 28 + 5 + 4.2 = 267.20
    expect(cpr.allInCost).toBe(267.2);
  });

  it("computes exact Standard Certified all-in formula (as-is auction standard)", () => {
    const analysis = calculateReplacementAnalysis({
      rawPrice: 100.0,
      currentBid: 150.0,
      fmv98: 600.0,
      fmv96: 300.0,
      fmv94: 200.0,
      fmv92: 140.0,
      isVintage: false,
      grader: "CGC",
    });

    const std = analysis.standard;
    expect(std.rawPrice).toBe(100.0);
    expect(std.gradingFee).toBe(35.0);
    expect(std.outgoingShipping).toBe(15.0);
    expect(std.returnShipping).toBe(28.0);
    expect(std.twoWayShipping).toBe(43.0);
    expect(std.invoiceFee).toBe(5.0);
    expect(std.serviceTax).toBe(2.4); // (35 + 5) * 0.06 = 2.40
    // 100 + 35 + 15 + 28 + 5 + 2.4 = 185.40
    expect(std.allInCost).toBe(185.4);
  });

  it("evaluates the Hope Factor yield risk and human unpredictability > 9.2", () => {
    const analysis = calculateReplacementAnalysis({
      rawPrice: 150.0,
      currentBid: 220.0,
      fmv98: 1000.0,
      fmv96: 450.0,
      fmv94: 300.0,
      fmv92: 200.0,
      isVintage: false,
      grader: "CGC",
    });

    const hope = analysis.hopeFactor;
    expect(hope.p98).toBe(0.15);
    expect(hope.p96).toBe(0.35);
    expect(hope.p94).toBe(0.32);
    expect(hope.p92OrLower).toBe(0.18);
    // EV = 0.15*1000 + 0.35*450 + 0.32*300 + 0.18*200 = 150 + 157.5 + 96 + 36 = 439.5 => 440
    expect(hope.expectedValue).toBe(440);
  });

  it("validates CGC 9.8 screening rule: pay $5 invoice + $9 reject fee + $28 return ship + tax = ~$44 cap", () => {
    const analysis = calculateReplacementAnalysis({
      rawPrice: 150.0,
      currentBid: 220.0,
      fmv98: 1000.0,
      fmv96: 450.0,
      fmv94: 300.0,
      fmv92: 200.0,
      isVintage: false,
      grader: "CGC",
    });

    const screen = analysis.screenRule;
    expect(screen.thresholdGrade).toBe("9.8");
    expect(screen.invoiceFee).toBe(5.0);
    expect(screen.rejectFee).toBe(9.0);
    expect(screen.totalRejectFee).toBe(14.0);
    expect(screen.totalSunkIfRejected).toBe(42.84); // 14 + 28 + (14 * 0.06 = 0.84) = 42.84 (~$44)
    expect(screen.savedGradingFee).toBe(35.0);
  });

  it("builds GoCollect era CPI comparison and 30/60/90 trailing velocity", () => {
    const { macroComparison, trailingVelocity } = buildLotMacroAndVelocity("modern", 400, 24);
    expect(macroComparison.eraName).toBe("Modern Age CPI Index (Top 250 Keys)");
    expect(macroComparison.eraMonthlyChangePct).toBe(2.4);
    expect(macroComparison.ce70MonthlyChangePct).toBe(1.8);
    expect(macroComparison.ppix100MonthlyChangePct).toBe(2.9);

    expect(trailingVelocity.d30.volume).toBeGreaterThan(0);
    expect(trailingVelocity.d60.volume).toBeGreaterThan(trailingVelocity.d30.volume);
    expect(trailingVelocity.d90.volume).toBeGreaterThan(trailingVelocity.d60.volume);
    expect(trailingVelocity.d30.cgc).toBeGreaterThan(0);
  });

  it("strictly disables CPR on 9.8 slabs (nowhere to go) and uses standard certified replacement", () => {
    const analysis = calculateReplacementAnalysis({
      rawPrice: 150.0,
      currentBid: 200.0,
      lastSoldPrice: 350.0,
      fmv98: 800.0,
      fmv96: 400.0,
      fmv94: 250.0,
      fmv92: 180.0,
      lotGrade: "9.8",
      isVintage: false,
      grader: "CGC",
    });

    expect(analysis.isLot98).toBe(true);
    expect(analysis.cpr.isCprEligible).toBe(false);
    expect(analysis.cpr.cprIneligibilityReason).toContain("9.8 is practical top-grade — nowhere to go");

    // Whole Tomato uses standard replacement (not CPR)
    expect(analysis.wholeTomato.wholeTomato).toBe(analysis.standard.allInCost);
    // Eight-Ball formula: wholeTomato - lastSoldPrice - currentBid
    const expectedSpread = Math.round((analysis.standard.allInCost - 350.0 - 200.0) * 100) / 100;
    expect(analysis.wholeTomato.eightBallSpread).toBe(expectedSpread);
  });

  it("enables CPR on 8.5 candidate with target bump +0.5 to +1.5 points", () => {
    const analysis = calculateReplacementAnalysis({
      rawPrice: 60.0,
      currentBid: 80.0,
      lastSoldPrice: 110.0,
      fmv98: 600.0,
      fmv96: 300.0,
      fmv94: 200.0,
      fmv92: 140.0,
      lotGrade: "8.5",
      isVintage: false,
      grader: "CGC",
    });

    expect(analysis.isLot98).toBe(false);
    expect(analysis.cpr.isCprEligible).toBe(true);
    expect(analysis.cpr.targetBumpGrade).toBe("9.0/9.2");
    expect(analysis.cpr.targetBumpFmv).toBe(140.0);

    // Whole Tomato uses CPR all-in cost for eligible candidates
    expect(analysis.wholeTomato.wholeTomato).toBe(analysis.cpr.allInCost);

    // Eight-Ball formula: wholeTomato - lastSoldPrice - currentBid
    const expectedSpread = Math.round((analysis.cpr.allInCost - 110.0 - 80.0) * 100) / 100;
    expect(analysis.wholeTomato.eightBallSpread).toBe(expectedSpread);
    expect(analysis.wholeTomato.isAheadOfEightBall).toBe(expectedSpread >= 0);
  });

  it("verifies exact Ahead of Eight Ball vs Behind Eight Ball calculation", () => {
    // Ahead: wholeTomato ($250) - lastSold ($100) - currentBid ($50) = +$100
    const ahead = calculateReplacementAnalysis({
      rawPrice: 140.0,
      currentBid: 50.0,
      lastSoldPrice: 100.0,
      fmv98: 800.0,
      fmv96: 400.0,
      fmv94: 250.0,
      fmv92: 180.0,
      lotGrade: "9.8",
      isVintage: false,
      grader: "CGC",
    });
    // Standard all-in = 140 + 35(grade) + 15(out) + 28(return) + 5(inv) + 2.40(tax) = 225.40
    // Eight-ball spread = 225.40 - 100 - 50 = +75.40
    expect(ahead.wholeTomato.eightBallSpread).toBe(75.4);
    expect(ahead.wholeTomato.isAheadOfEightBall).toBe(true);

    // Behind: wholeTomato ($225.40) - lastSold ($200) - currentBid ($150) = -$124.60
    const behind = calculateReplacementAnalysis({
      rawPrice: 140.0,
      currentBid: 150.0,
      lastSoldPrice: 200.0,
      fmv98: 800.0,
      fmv96: 400.0,
      fmv94: 250.0,
      fmv92: 180.0,
      lotGrade: "9.8",
      isVintage: false,
      grader: "CGC",
    });
    expect(behind.wholeTomato.eightBallSpread).toBe(-124.6);
    expect(behind.wholeTomato.isAheadOfEightBall).toBe(false);
  });
});
