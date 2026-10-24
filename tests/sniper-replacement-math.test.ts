import { describe, it, expect } from "vitest";
import { calculateReplacementAnalysis, buildEncasementFormulas } from "@/lib/sniper/sim/encasement-math";
import { buildLotMacroAndVelocity } from "@/lib/sniper/sim/lot-service";

describe("Sniper Replacement Cost & Bidding Frenzy Driver (Universal Sales Tax)", () => {
  it("computes exact CPR all-in formula: Raw + Raw Tax + CPR + Grading + 2-way Shipping + Invoice + Service Tax + Mailer + Mailer Tax on <= 9.4 candidate", () => {
    const analysis = calculateReplacementAnalysis({
      rawPrice: 150.0,
      currentBid: 200.0,
      fmv98: 800.0,
      fmv96: 400.0,
      fmv94: 250.0,
      fmv92: 180.0,
      lotGrade: "8.5",
      isVintage: false,
      grader: "CGC",
    });

    const cpr = analysis.cpr;
    expect(cpr.rawPrice).toBe(150.0);
    expect(cpr.rawTax).toBe(9.0); // 150 * 0.06 = 9.00
    expect(cpr.prepFee).toBe(30.0); // CPR pressing for modern
    expect(cpr.gradingFee).toBe(35.0);
    expect(cpr.outgoingShipping).toBe(15.0);
    expect(cpr.returnShipping).toBe(28.0);
    expect(cpr.twoWayShipping).toBe(43.0);
    expect(cpr.invoiceFee).toBe(8.0); // Online invoice standard $8.00
    // Universal sales tax on services & courier: (30 + 35 + 43 + 8) * 0.06 = 6.96
    expect(cpr.serviceTax).toBe(6.96);
    expect(cpr.mailerBoxFee).toBe(5.0);
    expect(cpr.mailerTax).toBe(0.3);
    // Total sales tax: 9.00 + 6.96 + 0.30 = 16.26
    expect(cpr.totalSalesTax).toBe(16.26);

    // Sum: 150 + 9 + 30 + 35 + 43 + 8 + 6.96 + 5 + 0.30 = 287.26
    expect(cpr.allInCost).toBe(287.26);
  });

  it("computes exact Standard Certified all-in formula (as-is auction standard, $0 pressing, $8 online invoice, universal sales tax)", () => {
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
    expect(std.rawTax).toBe(6.0); // 100 * 0.06 = 6.00
    expect(std.gradingFee).toBe(35.0);
    expect(std.prepFee).toBe(0.0); // $0 pressing
    expect(std.outgoingShipping).toBe(15.0);
    expect(std.returnShipping).toBe(28.0);
    expect(std.twoWayShipping).toBe(43.0);
    expect(std.invoiceFee).toBe(8.0); // Online invoice standard $8.00
    // Universal sales tax on slabbing services & courier: (35 + 43 + 8) * 0.06 = 5.16
    expect(std.serviceTax).toBe(5.16);
    // Sunk slabbing floor: 35 + 43 + 8 + 5.16 = 91.16
    expect(std.sunkExpenses).toBe(91.16);
    expect(std.mailerBoxFee).toBe(5.0);
    expect(std.mailerTax).toBe(0.3);
    expect(std.totalSalesTax).toBe(11.46);
    // Whole Tomato: 100 + 6.00 + 91.16 + 5.00 + 0.30 = 202.46
    expect(std.allInCost).toBe(202.46);
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

  it("validates CGC 9.8 screening rule: pay $8 online invoice + $9 reject fee + $28 return ship + tax = ~$47.70 cap", () => {
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
    expect(screen.invoiceFee).toBe(8.0);
    expect(screen.rejectFee).toBe(9.0);
    expect(screen.totalRejectFee).toBe(17.0);
    // Taxable services & freight: (8 + 9 + 28) = 45.00; tax = 45 * 0.06 = 2.70; total sunk = 47.70
    expect(screen.totalSunkIfRejected).toBe(47.7);
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
    expect(analysis.cpr.cprIneligibilityReason).toContain("Top-grade >9.4 certified");

    // Whole Tomato uses standard replacement (not CPR)
    expect(analysis.wholeTomato.wholeTomato).toBe(analysis.standard.allInCost);
    // Eight-Ball formula: wholeTomato - lastSoldPrice - currentBid
    const expectedSpread = Math.round((analysis.standard.allInCost - 350.0 - 200.0) * 100) / 100;
    expect(analysis.wholeTomato.eightBallSpread).toBe(expectedSpread);
  });

  it("treats pressing as an optional variable on 8.5 candidates and defaults to standard $0 pressing", () => {
    // Default: includePressing is false
    const defaultAnalysis = calculateReplacementAnalysis({
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

    expect(defaultAnalysis.isLot98).toBe(false);
    expect(defaultAnalysis.cpr.isCprEligible).toBe(true);
    expect(defaultAnalysis.cpr.targetBumpGrade).toBe("9.0/9.2");
    expect(defaultAnalysis.cpr.targetBumpFmv).toBe(140.0);

    // By default, pressing is NOT assumed: Whole Tomato uses standard all-in cost:
    // Raw 60 + Raw Tax 3.60 + Slabbing Floor 91.16 + Mailer 5.30 = 160.06
    expect(defaultAnalysis.wholeTomato.wholeTomato).toBe(defaultAnalysis.standard.allInCost);
    expect(defaultAnalysis.wholeTomato.wholeTomato).toBe(160.06);

    // When includePressing is true, Whole Tomato uses CPR all-in cost (160.06 + 30 prep + 1.80 tax = 191.86)
    const pressedAnalysis = calculateReplacementAnalysis({
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
      includePressing: true,
    });

    expect(pressedAnalysis.wholeTomato.wholeTomato).toBe(pressedAnalysis.cpr.allInCost);
    expect(pressedAnalysis.wholeTomato.wholeTomato).toBe(191.86);
    const expectedSpread = Math.round((191.86 - 110.0 - 80.0) * 100) / 100;
    expect(pressedAnalysis.wholeTomato.eightBallSpread).toBe(expectedSpread);
    expect(pressedAnalysis.wholeTomato.isAheadOfEightBall).toBe(expectedSpread >= 0);
  });

  it("verifies exact Ahead of Eight Ball vs Behind Eight Ball calculation", () => {
    // Standard all-in = 140 + 8.40(raw tax) + 35(grade) + 43(shipping) + 8(inv) + 5.16(service tax) + 5.30(mailer+tax) = 244.86
    // Ahead: wholeTomato ($244.86) - lastSold ($100) - currentBid ($50) = +$94.86
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
    expect(ahead.wholeTomato.eightBallSpread).toBe(94.86);
    expect(ahead.wholeTomato.isAheadOfEightBall).toBe(true);

    // Behind: wholeTomato ($244.86) - lastSold ($200) - currentBid ($150) = -$105.14
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
    expect(behind.wholeTomato.eightBallSpread).toBe(-105.14);
    expect(behind.wholeTomato.isAheadOfEightBall).toBe(false);
  });

  it("strictly enforces zero pressing fee on 9.8 certified comics across all formulas", () => {
    const { formulas } = buildEncasementFormulas({
      grader: "CGC",
      isVintage: false,
      estimatedRawBasis: 100.0,
      isYellowLabel: false,
      grade: "9.8",
      isLot98: true,
    });

    expect(formulas.standard.pressingFee).toBe(0.0);
    expect(formulas.pressed.pressingFee).toBe(0.0);
    expect(formulas.pressed.description).toContain("You do not clean and press a 9.6 or 9.8");
    // Standard slabbing floor for 9.8: 35 grading + 8 invoice + 43 shipping + 5.16 FL tax = 91.16
    expect(formulas.standard.slabbingCostFloor).toBe(91.16);
  });

  it("treats creator signing fees as estimated guesstimates uncertain without convention/venue pricing", () => {
    const { formulas } = buildEncasementFormulas({
      grader: "CGC",
      isVintage: false,
      estimatedRawBasis: 120.0,
      isYellowLabel: true,
      creatorName: "Todd McFarlane",
      grade: "9.8",
      isLot98: true,
    });

    const sig = formulas.signature;
    expect(sig.pressingFee).toBe(0.0); // 9.8 never pressed
    expect(sig.creatorSigningFeeCertainty).toBe("guesstimate");
    expect(sig.creatorSigningFeeNote).toContain("without verified convention floor or private signing venue pricing");
    expect(sig.creatorSigningFeeRange).toEqual([25, 100]);
    expect(sig.description).toContain("creator signing fee guesstimate");
    expect(sig.description).toContain("Pressing omitted ($0) by default");
  });
});
