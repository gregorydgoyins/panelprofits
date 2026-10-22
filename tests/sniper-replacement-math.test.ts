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
    expect(cpr.twoWayShipping).toBe(50.0);
    expect(cpr.twoWayInsurance).toBe(15.0);
    expect(cpr.invoiceFee).toBe(5.0);
    expect(cpr.serviceTax).toBe(4.9); // (30 + 35 + 5) * 0.07 = 4.90

    // Sum: 150 + 30 + 35 + 50 + 15 + 5 + 4.9 = 289.90
    expect(cpr.allInCost).toBe(289.9);
  });

  it("computes exact Press & Resubmit all-in formula", () => {
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

    const pr = analysis.pressResubmit;
    expect(pr.rawPrice).toBe(100.0);
    expect(pr.prepFee).toBe(18.0);
    expect(pr.gradingFee).toBe(35.0);
    expect(pr.twoWayShipping).toBe(50.0);
    expect(pr.twoWayInsurance).toBe(15.0);
    expect(pr.invoiceFee).toBe(5.0);
    expect(pr.serviceTax).toBe(4.06); // (18 + 35 + 5) * 0.07 = 4.06
    expect(pr.allInCost).toBe(227.06);
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

  it("validates CGC screening rule: pay $5 invoice + $9 reject fee if < 9.4", () => {
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
    expect(screen.thresholdGrade).toBe("9.4");
    expect(screen.invoiceFee).toBe(5.0);
    expect(screen.rejectFee).toBe(9.0);
    expect(screen.totalRejectFee).toBe(14.0);
    expect(screen.totalSunkIfRejected).toBe(79.0); // 14 + 50 + 15 = 79
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
});
