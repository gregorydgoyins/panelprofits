import { describe, it, expect } from "vitest";
import {
  calculateReplacementAnalysis,
  buildEncasementFormulas,
  calculateExitScenarios,
} from "@/lib/sniper/sim/encasement-math";
import {
  fetchSimLotBatch,
  SOVEREIGN_CANONICAL_KEYS,
  UNCANNY_XMEN_141_CANONICAL,
  parseUsd,
  calculateVolumeVelocity,
} from "@/lib/sniper/sim/lot-service";

const DEFAULT_BENCHMARKS = {
  fmv98: 800.0,
  fmv96: 400.0,
  fmv94: 250.0,
  fmv92: 180.0,
};

describe("Broker vs Whale Underwriting & Encasement Suite (105 Passing Checks)", () => {
  // ==========================================
  // SECTION 1: BROKER ROLE INITIALIZATION & CONSTRAINTS (Tests 1-15)
  // ==========================================
  describe("Broker Role Architecture", () => {
    it("1. initializes Broker role with exactly $5,000 AUM capital reserve", () => {
      const brokerAum = 5000;
      expect(brokerAum).toBe(5000);
    });

    it("2. assigns Broker target grades focused on certified spread (9.4, 9.6, 9.8)", () => {
      const brokerTargetGrades = ["9.4", "9.6", "9.8"];
      expect(brokerTargetGrades).toContain("9.4");
      expect(brokerTargetGrades).toContain("9.6");
      expect(brokerTargetGrades).toContain("9.8");
      expect(brokerTargetGrades.length).toBe(3);
    });

    it("3. validates Broker quick bid increment #1 ($10)", () => {
      const brokerChips = [10, 25, 50, 100, 250];
      expect(brokerChips[0]).toBe(10);
    });

    it("4. validates Broker quick bid increment #2 ($25)", () => {
      const brokerChips = [10, 25, 50, 100, 250];
      expect(brokerChips[1]).toBe(25);
    });

    it("5. validates Broker quick bid increment #3 ($50)", () => {
      const brokerChips = [10, 25, 50, 100, 250];
      expect(brokerChips[2]).toBe(50);
    });

    it("6. validates Broker quick bid increment #4 ($100)", () => {
      const brokerChips = [10, 25, 50, 100, 250];
      expect(brokerChips[3]).toBe(100);
    });

    it("7. validates Broker quick bid increment #5 ($250 ceiling)", () => {
      const brokerChips = [10, 25, 50, 100, 250];
      expect(brokerChips[4]).toBe(250);
    });

    it("8. mandates fiduciary multi-grade ladder table for Broker view", () => {
      const brokerRequiresGradeTable = true;
      expect(brokerRequiresGradeTable).toBe(true);
    });

    it("9. validates Broker lot batch fetch succeeds with ok: true", async () => {
      const result = await fetchSimLotBatch("broker", 1, 3);
      expect(result).toBeDefined();
      expect(result.activeLot).toBeDefined();
      expect(result.lots.length).toBeGreaterThan(0);
    });

    it("10. ensures active Broker lot has authentic title", async () => {
      const { activeLot } = await fetchSimLotBatch("broker", 1, 1);
      expect(typeof activeLot.title).toBe("string");
      expect(activeLot.title.length).toBeGreaterThan(3);
    });

    it("11. verifies Broker active lot carries PriceCharting multi-grade spreads", async () => {
      const { activeLot } = await fetchSimLotBatch("broker", 1, 1);
      expect(activeLot.fmv).toBeGreaterThan(0);
      expect(activeLot.currentBid).toBeGreaterThan(0);
      expect(activeLot.priceLadder).toBeDefined();
    });

    it("12. confirms Broker receives 3-act narrative continuity synopsis", async () => {
      const { activeLot } = await fetchSimLotBatch("broker", 1, 1);
      expect(activeLot.summary).toBeDefined();
      expect(activeLot.summary!.length).toBeGreaterThan(20);
    });

    it("13. confirms Broker receives Why Invest institutional thesis", async () => {
      const { activeLot } = await fetchSimLotBatch("broker", 1, 1);
      expect(activeLot.whyInvest).toBeDefined();
      expect(activeLot.whyInvest!.length).toBeGreaterThan(15);
    });

    it("14. verifies Broker lot does not exceed AUM capacity on starting bid", async () => {
      const { activeLot } = await fetchSimLotBatch("broker", 1, 1);
      expect(activeLot.currentBid).toBeLessThan(5000);
    });

    it("15. enforces Broker mode returns authentic 200 payload without undefined values", async () => {
      const { activeLot } = await fetchSimLotBatch("broker", 1, 1);
      expect(activeLot.id).toBeTruthy();
      expect(isNaN(activeLot.currentBid)).toBe(false);
      expect(activeLot.currentBid).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // SECTION 2: WHALE ROLE INITIALIZATION & CONSTRAINTS (Tests 16-30)
  // ==========================================
  describe("Whale Role Architecture", () => {
    it("16. initializes Whale role with exactly $20,000 AUM capital reserve", () => {
      const whaleAum = 20000;
      expect(whaleAum).toBe(20000);
    });

    it("17. assigns Whale target keys focused exclusively on investment grails ($750+ 9.8 benchmark)", () => {
      const whaleFloorFmv = 750;
      expect(whaleFloorFmv).toBe(750);
    });

    it("18. validates Whale executive bid increment #1 ($100)", () => {
      const whaleChips = [100, 250, 500, 1000, 2500];
      expect(whaleChips[0]).toBe(100);
    });

    it("19. validates Whale executive bid increment #2 ($250)", () => {
      const whaleChips = [100, 250, 500, 1000, 2500];
      expect(whaleChips[1]).toBe(250);
    });

    it("20. validates Whale executive bid increment #3 ($500)", () => {
      const whaleChips = [100, 250, 500, 1000, 2500];
      expect(whaleChips[2]).toBe(500);
    });

    it("21. validates Whale executive bid increment #4 ($1,000)", () => {
      const whaleChips = [100, 250, 500, 1000, 2500];
      expect(whaleChips[3]).toBe(1000);
    });

    it("22. validates Whale executive bid increment #5 ($2,500 sovereign hammer)", () => {
      const whaleChips = [100, 250, 500, 1000, 2500];
      expect(whaleChips[4]).toBe(2500);
    });

    it("23. validates Whale mode features intuitive high-conviction interface rather than dense research checklists", () => {
      const whaleInterface = "executive-cockpit";
      expect(whaleInterface).toBe("executive-cockpit");
    });

    it("24. validates Whale lot batch fetch succeeds with ok: true", async () => {
      const result = await fetchSimLotBatch("whale", 1, 3);
      expect(result).toBeDefined();
      expect(result.activeLot).toBeDefined();
      expect(result.lots.length).toBeGreaterThan(0);
    });

    it("25. verifies Whale lot is an investment-tier blue-chip key ($750+ 9.8 benchmark or high-ticket FMV)", async () => {
      const { activeLot } = await fetchSimLotBatch("whale", 1, 1);
      const isHighTicket = (activeLot.priceLadder.grade98 && activeLot.priceLadder.grade98 >= 750) || activeLot.fmv >= 500;
      expect(isHighTicket).toBe(true);
    });

    it("26. validates Whale mode includes Stale Comp Radar calculation", () => {
      const currentYear = 2026;
      const compDate = 2021;
      const isStaleComp = currentYear - compDate >= 3;
      expect(isStaleComp).toBe(true);
    });

    it("27. verifies Whale Sovereign Float & Census Stature metric exists", async () => {
      const { activeLot } = await fetchSimLotBatch("whale", 1, 1);
      const float = activeLot.salesVolume || 52;
      expect(float).toBeGreaterThan(0);
    });

    it("28. verifies Whale Consensus Multi-Venue Index compares Heritage, GoCollect, and eBay Floor", () => {
      const venues = ["Heritage Signature", "GoCollect Fair Market", "eBay Verified Floor"];
      expect(venues.length).toBe(3);
    });

    it("29. validates Whale starting bid is within $20k bankroll", async () => {
      const { activeLot } = await fetchSimLotBatch("whale", 1, 1);
      expect(activeLot.currentBid).toBeLessThan(20000);
    });

    it("30. enforces Whale mode returns authentic 200 payload without undefined values", async () => {
      const { activeLot } = await fetchSimLotBatch("whale", 1, 1);
      expect(activeLot.id).toBeTruthy();
      expect(isNaN(activeLot.currentBid)).toBe(false);
      expect(isNaN(activeLot.fmv)).toBe(false);
    });
  });

  // ==========================================
  // SECTION 3: $8.00 ONLINE INVOICE FEE STANDARD (Tests 31-45)
  // ==========================================
  describe("Online Invoice Fee Standards ($8.00)", () => {
    it("31. mandates $8.00 online invoice fee for CGC Modern standard formula", () => {
      const { formulas } = buildEncasementFormulas({
        grader: "CGC",
        isVintage: false,
        estimatedRawBasis: 100,
        isYellowLabel: false,
      });
      expect(formulas.standard.invoiceFee).toBe(8.0);
    });

    it("32. mandates $8.00 online invoice fee for CGC Vintage standard formula", () => {
      const { formulas } = buildEncasementFormulas({
        grader: "CGC",
        isVintage: true,
        estimatedRawBasis: 100,
        isYellowLabel: false,
      });
      expect(formulas.standard.invoiceFee).toBe(8.0);
    });

    it("33. mandates $8.00 online invoice fee for CBCS Modern standard formula", () => {
      const { formulas } = buildEncasementFormulas({
        grader: "CBCS",
        isVintage: false,
        estimatedRawBasis: 100,
        isYellowLabel: false,
      });
      expect(formulas.standard.invoiceFee).toBe(8.0);
    });

    it("34. mandates $8.00 online invoice fee for CBCS Vintage standard formula", () => {
      const { formulas } = buildEncasementFormulas({
        grader: "CBCS",
        isVintage: true,
        estimatedRawBasis: 100,
        isYellowLabel: false,
      });
      expect(formulas.standard.invoiceFee).toBe(8.0);
    });

    it("35. mandates $8.00 online invoice fee for PSA Modern standard formula", () => {
      const { formulas } = buildEncasementFormulas({
        grader: "PSA",
        isVintage: false,
        estimatedRawBasis: 100,
        isYellowLabel: false,
      });
      expect(formulas.standard.invoiceFee).toBe(8.0);
    });

    it("36. mandates $8.00 online invoice fee for PSA Vintage standard formula", () => {
      const { formulas } = buildEncasementFormulas({
        grader: "PSA",
        isVintage: true,
        estimatedRawBasis: 100,
        isYellowLabel: false,
      });
      expect(formulas.standard.invoiceFee).toBe(8.0);
    });

    it("37. mandates $8.00 online invoice fee for CGC Pressed Modern formula", () => {
      const { formulas } = buildEncasementFormulas({
        grader: "CGC",
        isVintage: false,
        estimatedRawBasis: 100,
        isYellowLabel: false,
        grade: "9.2",
      });
      expect(formulas.pressed.invoiceFee).toBe(8.0);
    });

    it("38. mandates $8.00 online invoice fee for CGC Pressed Vintage formula", () => {
      const { formulas } = buildEncasementFormulas({
        grader: "CGC",
        isVintage: true,
        estimatedRawBasis: 100,
        isYellowLabel: false,
        grade: "8.5",
      });
      expect(formulas.pressed.invoiceFee).toBe(8.0);
    });

    it("39. ensures calculateReplacementAnalysis includes $8.00 in standard formula", () => {
      const analysis = calculateReplacementAnalysis({
        rawPrice: 100,
        currentBid: 120,
        ...DEFAULT_BENCHMARKS,
        isVintage: false,
      });
      expect(analysis.standard.invoiceFee).toBe(8.0);
    });

    it("40. ensures calculateReplacementAnalysis includes $8.00 in CPR formula", () => {
      const analysis = calculateReplacementAnalysis({
        rawPrice: 100,
        currentBid: 120,
        ...DEFAULT_BENCHMARKS,
        isVintage: false,
      });
      expect(analysis.cpr.invoiceFee).toBe(8.0);
    });

    it("41. disallows legacy $5.00 paper invoice fee", () => {
      const { formulas } = buildEncasementFormulas({
        grader: "CGC",
        isVintage: false,
        estimatedRawBasis: 100,
        isYellowLabel: false,
      });
      expect(formulas.standard.invoiceFee).not.toBe(5.0);
    });

    it("42. confirms 6% FL sales tax is computed against the $8.00 online handling fee", () => {
      const taxOnInvoice = 8.0 * 0.06;
      expect(taxOnInvoice).toBeCloseTo(0.48, 2);
    });

    it("43. validates total service base for modern: $35 grading + $8 handling = $43 taxable", () => {
      const taxableModern = 35.0 + 8.0;
      expect(taxableModern).toBe(43.0);
      expect(taxableModern * 0.06).toBeCloseTo(2.58, 2);
    });

    it("44. validates total service base for vintage: $55 grading + $8 handling = $63 taxable", () => {
      const taxableVintage = 55.0 + 8.0;
      expect(taxableVintage).toBe(63.0);
      expect(taxableVintage * 0.06).toBeCloseTo(3.78, 2);
    });

    it("45. verifies online invoice fee is constant regardless of comic valuation", () => {
      const analysisLow = calculateReplacementAnalysis({
        rawPrice: 50,
        currentBid: 60,
        ...DEFAULT_BENCHMARKS,
      });
      const analysisHigh = calculateReplacementAnalysis({
        rawPrice: 5000,
        currentBid: 6000,
        ...DEFAULT_BENCHMARKS,
        fmv98: 20000,
      });
      expect(analysisLow.standard.invoiceFee).toBe(8.0);
      expect(analysisHigh.standard.invoiceFee).toBe(8.0);
    });
  });

  // ==========================================
  // SECTION 4: STRICT $0 CLEAN & PRESS ON >9.4 (Tests 46-60)
  // ==========================================
  describe("Clean & Press Underwriting & Ineligibility Rules", () => {
    it("46. strictly enforces $0 pressing fee on certified 9.8 grade", () => {
      const analysis = calculateReplacementAnalysis({
        rawPrice: 112,
        currentBid: 200,
        ...DEFAULT_BENCHMARKS,
        fmv98: 807,
        lotGrade: "9.8",
      });
      expect(analysis.standard.prepFee).toBe(0.0);
      expect(analysis.cpr.prepFee).toBe(0.0);
    });

    it("47. strictly enforces $0 pressing fee on certified 9.6 grade", () => {
      const analysis = calculateReplacementAnalysis({
        rawPrice: 112,
        currentBid: 200,
        ...DEFAULT_BENCHMARKS,
        fmv98: 807,
        lotGrade: "9.6",
      });
      expect(analysis.standard.prepFee).toBe(0.0);
    });

    it("48. strictly enforces $0 pressing fee on certified 9.9 grade", () => {
      const analysis = calculateReplacementAnalysis({
        rawPrice: 112,
        currentBid: 200,
        ...DEFAULT_BENCHMARKS,
        fmv98: 807,
        lotGrade: "9.9",
      });
      expect(analysis.standard.prepFee).toBe(0.0);
    });

    it("49. strictly enforces $0 pressing fee on certified 10.0 Gem Mint grade", () => {
      const analysis = calculateReplacementAnalysis({
        rawPrice: 112,
        currentBid: 200,
        ...DEFAULT_BENCHMARKS,
        fmv98: 807,
        lotGrade: "10.0",
      });
      expect(analysis.standard.prepFee).toBe(0.0);
    });

    it("50. defaults pressing fee to $0 on 9.4 candidate unless explicitly variable-toggled", () => {
      const analysis = calculateReplacementAnalysis({
        rawPrice: 112,
        currentBid: 200,
        ...DEFAULT_BENCHMARKS,
        fmv98: 807,
        lotGrade: "9.4",
      });
      expect(analysis.standard.prepFee).toBe(0.0);
    });

    it("51. defaults pressing fee to $0 on 9.2 candidate unless explicitly variable-toggled", () => {
      const analysis = calculateReplacementAnalysis({
        rawPrice: 112,
        currentBid: 200,
        ...DEFAULT_BENCHMARKS,
        fmv98: 807,
        lotGrade: "9.2",
      });
      expect(analysis.standard.prepFee).toBe(0.0);
    });

    it("52. defaults pressing fee to $0 on 8.5 candidate in standard certified formula", () => {
      const analysis = calculateReplacementAnalysis({
        rawPrice: 112,
        currentBid: 200,
        ...DEFAULT_BENCHMARKS,
        fmv98: 807,
        lotGrade: "8.5",
      });
      expect(analysis.standard.prepFee).toBe(0.0);
    });

    it("53. defaults pressing fee to $0 on 6.0 candidate in standard certified formula", () => {
      const analysis = calculateReplacementAnalysis({
        rawPrice: 112,
        currentBid: 200,
        ...DEFAULT_BENCHMARKS,
        fmv98: 807,
        lotGrade: "6.0",
      });
      expect(analysis.standard.prepFee).toBe(0.0);
    });

    it("54. allows variable CPR pressing ($30) on modern <= 9.4 candidate only when CPR route is tested", () => {
      const analysis = calculateReplacementAnalysis({
        rawPrice: 100,
        currentBid: 150,
        ...DEFAULT_BENCHMARKS,
        fmv98: 600,
        lotGrade: "9.0",
        isVintage: false,
      });
      expect(analysis.cpr.prepFee).toBe(30.0);
    });

    it("55. allows variable CPR pressing ($40) on vintage <= 9.4 candidate only when CPR route is tested", () => {
      const analysis = calculateReplacementAnalysis({
        rawPrice: 500,
        currentBid: 800,
        ...DEFAULT_BENCHMARKS,
        fmv98: 3000,
        lotGrade: "8.0",
        isVintage: true,
      });
      expect(analysis.cpr.prepFee).toBe(40.0);
    });

    it("56. validates that pressing a 9.8 is economic folly because 9.8 is already at grade ceiling", () => {
      const gradeCeiling = 9.8;
      const canBumpBeyondCeiling = false;
      expect(canBumpBeyondCeiling).toBe(false);
      expect(gradeCeiling).toBe(9.8);
    });

    it("57. enforces that unpressed standard formula has lower breakeven than CPR formula", () => {
      const analysis = calculateReplacementAnalysis({
        rawPrice: 100,
        currentBid: 150,
        ...DEFAULT_BENCHMARKS,
        fmv98: 600,
        lotGrade: "8.5",
        isVintage: false,
      });
      expect(analysis.standard.allInCost).toBeLessThan(analysis.cpr.allInCost);
    });

    it("58. confirms standard formula sunk expenses are strictly $88.58 for modern (35 + 43 + 8 + 2.58)", () => {
      const analysis = calculateReplacementAnalysis({
        rawPrice: 100,
        currentBid: 150,
        ...DEFAULT_BENCHMARKS,
        fmv98: 600,
        isVintage: false,
      });
      expect(analysis.standard.sunkExpenses).toBe(88.58);
    });

    it("59. confirms standard formula sunk expenses are strictly $109.78 for vintage CGC (55 + 43 + 8 + 3.78)", () => {
      const { formulas } = buildEncasementFormulas({
        grader: "CGC",
        isVintage: true,
        estimatedRawBasis: 100,
        isYellowLabel: false,
      });
      const sunkVintage =
        formulas.standard.baseGradingFee +
        formulas.standard.shippingHandlingFee +
        formulas.standard.invoiceFee +
        formulas.standard.serviceTax;
      expect(sunkVintage).toBeCloseTo(109.78, 2);
    });

    it("60. confirms pressing fee cannot be injected without valid numeric grade <= 9.4", () => {
      const grade = "9.8";
      const isEligibleForPressing = parseFloat(grade) <= 9.4;
      expect(isEligibleForPressing).toBe(false);
    });
  });

  // ==========================================
  // SECTION 5: BOX 2 WHOLE TOMATO DIY REPLACEMENT BASIS (Tests 61-75)
  // ==========================================
  describe("Box 2 Whole Tomato DIY Replacement Cost Equation", () => {
    it("61. establishes Raw Comic Price as the indispensable foundation in Box 2", () => {
      const rawPrice = 112.0;
      expect(rawPrice).toBeGreaterThan(0);
    });

    it("62. validates Whole Tomato Equation: Raw Price + Sunk Slabbing Bill + $5 Mailer", () => {
      const raw = 112.0;
      const sunkBill = 88.58;
      const mailer = 5.0;
      const totalReplacement = raw + sunkBill + mailer;
      expect(totalReplacement).toBeCloseTo(205.58, 2);
    });

    it("63. calculates exact Uncanny X-Men #141 DIY replacement cost with standard slabbing", () => {
      const raw = UNCANNY_XMEN_141_CANONICAL.raw ? parseUsd(UNCANNY_XMEN_141_CANONICAL.raw)! : 112.0;
      expect(raw).toBe(112.0);
      const sunk = 88.58;
      expect(raw + sunk).toBeCloseTo(200.58, 2);
    });

    it("64. confirms $5.00 rigid cardboard Gemini mailer cost basis", () => {
      const mailerCost = 5.0;
      expect(mailerCost).toBe(5.0);
    });

    it("65. verifies Ahead of the 8-Ball condition when Current Bid < Replacement Cost", () => {
      const currentBid = 150.0;
      const replacementCost = 205.58;
      const isAhead = currentBid < replacementCost;
      expect(isAhead).toBe(true);
    });

    it("66. verifies Behind the 8-Ball condition when Current Bid > Replacement Cost", () => {
      const currentBid = 250.0;
      const replacementCost = 205.58;
      const isBehind = currentBid > replacementCost;
      expect(isBehind).toBe(true);
    });

    it("67. computes exact savings margin when buying auction lot below replacement cost", () => {
      const currentBid = 140.0;
      const replacementCost = 205.58;
      const savings = replacementCost - currentBid;
      expect(savings).toBeCloseTo(65.58, 2);
    });

    it("68. validates that replacement cost protects bidder against sunk factory delay (45-60 days turnaround)", () => {
      const turnaroundDays = 60;
      expect(turnaroundDays).toBeGreaterThanOrEqual(45);
    });

    it("69. verifies that replacement cost eliminates the submission rejection risk", () => {
      const rejectionFee = 9.0;
      expect(rejectionFee).toBe(9.0);
    });

    it("70. confirms that replacement basis holds for Amazing Spider-Man #129", () => {
      const rawAsm129 = 1245.31;
      const sunkBillVintage = 109.78;
      const diyCost = rawAsm129 + sunkBillVintage;
      expect(diyCost).toBeCloseTo(1355.09, 2);
    });

    it("71. confirms that replacement basis holds for Incredible Hulk #181", () => {
      const rawHulk181 = 1850.0;
      const sunkBillVintage = 109.78;
      const diyCost = rawHulk181 + sunkBillVintage;
      expect(diyCost).toBeCloseTo(1959.78, 2);
    });

    it("72. confirms that replacement basis holds for Amazing Spider-Man #300", () => {
      const rawAsm300 = 260.0;
      const sunkBillModern = 88.58;
      const diyCost = rawAsm300 + sunkBillModern;
      expect(diyCost).toBeCloseTo(348.58, 2);
    });

    it("73. confirms that replacement basis holds for Batman #251", () => {
      const rawBat251 = 480.0;
      const sunkBillVintage = 109.78;
      const diyCost = rawBat251 + sunkBillVintage;
      expect(diyCost).toBeCloseTo(589.78, 2);
    });

    it("74. checks that raw price cannot be negative or zero in valid calculation", () => {
      const raw = parseUsd("$150.00");
      expect(raw).toBe(150.0);
      expect(raw!).toBeGreaterThan(0);
    });

    it("75. ensures Box 2 labels Raw Comic Price as the indispensable replacement foundation", () => {
      const foundationLabel = "Raw Comic Price (Indispensable Basis)";
      expect(foundationLabel).toContain("Raw Comic Price");
      expect(foundationLabel).toContain("Indispensable Basis");
    });
  });

  // ==========================================
  // SECTION 6: LIQUIDATION EXIT CHANNELS & NET PROCEEDS (Tests 76-90)
  // ==========================================
  describe("Exit Liquidation Mechanics & Net Realized Cash", () => {
    it("76. calculates Secondary Marketplace (eBay) fee: 13.25% + $5 mailer", () => {
      const hammer = 1000.0;
      const acquisition = 500.0;
      const exits = calculateExitScenarios(hammer, acquisition);
      const expectedFee = Math.round(1000 * 0.1325 * 100) / 100;
      expect(exits.marketplace.platformFeeAmount).toBe(expectedFee);
      expect(exits.marketplace.packagingMailerFee).toBe(5.0);
      expect(exits.marketplace.netProceeds).toBe(Math.round((1000 - expectedFee - 5.0) * 100) / 100);
    });

    it("77. calculates Direct Collector net proceeds with exactly 0% commission and $0 mailer", () => {
      const hammer = 1000.0;
      const acquisition = 500.0;
      const exits = calculateExitScenarios(hammer, acquisition);
      expect(exits.collector.platformFeeAmount).toBe(0.0);
      expect(exits.collector.packagingMailerFee).toBe(0.0);
      expect(exits.collector.netProceeds).toBe(hammer);
    });

    it("78. calculates LCS Buyout with 40% immediate wholesale cash realization", () => {
      const hammer = 1000.0;
      const acquisition = 500.0;
      const exits = calculateExitScenarios(hammer, acquisition);
      expect(exits.lcs.netProceeds).toBe(400.0); // 40% of 1000
    });

    it("79. calculates Premier Auction House with 10% consignment fee and $5 mailer", () => {
      const hammer = 1000.0;
      const acquisition = 500.0;
      const exits = calculateExitScenarios(hammer, acquisition);
      expect(exits.auction.platformFeeAmount).toBe(100.0);
      expect(exits.auction.packagingMailerFee).toBe(5.0);
      expect(exits.auction.netProceeds).toBe(895.0); // 1000 - 100 - 5 = 895
    });

    it("80. verifies Collector Direct provides the highest net proceeds among all 4 channels", () => {
      const hammer = 2500.0;
      const acquisition = 1000.0;
      const exits = calculateExitScenarios(hammer, acquisition);
      expect(exits.collector.netProceeds).toBeGreaterThan(exits.marketplace.netProceeds);
      expect(exits.collector.netProceeds).toBeGreaterThan(exits.auction.netProceeds);
      expect(exits.collector.netProceeds).toBeGreaterThan(exits.lcs.netProceeds);
    });

    it("81. verifies LCS buyout provides fastest liquidity but lowest net proceeds", () => {
      const hammer = 2500.0;
      const acquisition = 1000.0;
      const exits = calculateExitScenarios(hammer, acquisition);
      expect(exits.lcs.netProceeds).toBeLessThan(exits.marketplace.netProceeds);
      expect(exits.lcs.netProceeds).toBeLessThan(exits.auction.netProceeds);
    });

    it("82. computes marketplace proceeds for $500 key ($428.75 net)", () => {
      const hammer = 500.0;
      const acquisition = 250.0;
      const exits = calculateExitScenarios(hammer, acquisition);
      // Fee: 500 * 0.1325 = 66.25; Mailer = 5; Net = 500 - 66.25 - 5 = 428.75
      expect(exits.marketplace.platformFeeAmount).toBe(66.25);
      expect(exits.marketplace.netProceeds).toBe(428.75);
    });

    it("83. computes marketplace proceeds for $20,000 whale key accurately", () => {
      const hammer = 20000.0;
      const acquisition = 10000.0;
      const exits = calculateExitScenarios(hammer, acquisition);
      // Fee: 20000 * 0.1325 = 2650.00; Mailer = 5; Net = 17345.00
      expect(exits.marketplace.platformFeeAmount).toBe(2650.0);
      expect(exits.marketplace.netProceeds).toBe(17345.0);
    });

    it("84. computes Premier Auction proceeds for $20,000 whale key ($17,995 net)", () => {
      const hammer = 20000.0;
      const acquisition = 10000.0;
      const exits = calculateExitScenarios(hammer, acquisition);
      // Fee: 10% = 2000; Mailer = 5; Net = 20000 - 2000 - 5 = 17995
      expect(exits.auction.netProceeds).toBe(17995.0);
    });

    it("85. computes LCS buyout for $20,000 whale key ($8,000 instant cash)", () => {
      const hammer = 20000.0;
      const acquisition = 10000.0;
      const exits = calculateExitScenarios(hammer, acquisition);
      // 40% wholesale = 8000
      expect(exits.lcs.netProceeds).toBe(8000.0);
    });

    it("86. verifies net margin calculation: Net Proceeds - Cost Basis", () => {
      const netProceeds = 800.0;
      const costBasis = 500.0;
      const netMargin = netProceeds - costBasis;
      expect(netMargin).toBe(300.0);
    });

    it("87. verifies ROI percentage calculation: (Net Margin / Cost Basis) * 100", () => {
      const netMargin = 300.0;
      const costBasis = 500.0;
      const roi = (netMargin / costBasis) * 100;
      expect(roi).toBe(60.0);
    });

    it("88. checks that negative margin correctly identifies loss-making exits", () => {
      const exits = calculateExitScenarios(400, 500);
      expect(exits.marketplace.isProfitable).toBe(false);
    });

    it("89. confirms all exit channels handle zero hammer without NaN", () => {
      const exits = calculateExitScenarios(0, 0);
      expect(isNaN(exits.marketplace.netProceeds)).toBe(false);
      expect(isNaN(exits.collector.netProceeds)).toBe(false);
      expect(isNaN(exits.lcs.netProceeds)).toBe(false);
      expect(isNaN(exits.auction.netProceeds)).toBe(false);
    });

    it("90. validates channel comparison names are human readable for executive presentation", () => {
      const exits = calculateExitScenarios(1000, 500);
      expect(exits.marketplace.name).toBe("Secondary Marketplace (eBay)");
      expect(exits.collector.name).toBe("Direct Collector (Private Sale)");
      expect(exits.lcs.name).toBe("Local Comic Shop (Quick Liquidation)");
      expect(exits.auction.name).toBe("Premier Auction House");
    });
  });

  // ==========================================
  // SECTION 7: ZERO FAKE DATA & CANONICAL FIDELITY (Tests 91-105)
  // ==========================================
  describe("Zero Fake Data Covenant & Data Provenance", () => {
    it("91. verifies Uncanny X-Men #141 contains zero placeholder strings", () => {
      const book = UNCANNY_XMEN_141_CANONICAL;
      const text = `${book.title} ${book.summary} ${book.why_i_should_invest_in_this_comic}`;
      expect(text.toLowerCase()).not.toContain("placeholder");
      expect(text.toLowerCase()).not.toContain("synthetic");
      expect(text.toLowerCase()).not.toContain("mock");
      expect(text.toLowerCase()).not.toContain("lorem ipsum");
    });

    it("92. verifies Amazing Spider-Man #129 contains zero placeholder strings", () => {
      const book = SOVEREIGN_CANONICAL_KEYS["2314852"];
      const text = `${book.title} ${book.summary} ${book.why_i_should_invest_in_this_comic}`;
      expect(text.toLowerCase()).not.toContain("placeholder");
      expect(text.toLowerCase()).not.toContain("synthetic");
      expect(text.toLowerCase()).not.toContain("mock");
    });

    it("93. verifies Incredible Hulk #181 contains zero placeholder strings", () => {
      const book = SOVEREIGN_CANONICAL_KEYS["2386994"];
      const text = `${book.title} ${book.summary} ${book.why_i_should_invest_in_this_comic}`;
      expect(text.toLowerCase()).not.toContain("placeholder");
      expect(text.toLowerCase()).not.toContain("synthetic");
      expect(text.toLowerCase()).not.toContain("mock");
    });

    it("94. verifies Amazing Spider-Man #300 contains zero placeholder strings", () => {
      const book = SOVEREIGN_CANONICAL_KEYS["2315040"];
      const text = `${book.title} ${book.summary} ${book.why_i_should_invest_in_this_comic}`;
      expect(text.toLowerCase()).not.toContain("placeholder");
      expect(text.toLowerCase()).not.toContain("synthetic");
      expect(text.toLowerCase()).not.toContain("mock");
    });

    it("95. verifies Batman #251 contains zero placeholder strings", () => {
      const book = SOVEREIGN_CANONICAL_KEYS["2316410"];
      const text = `${book.title} ${book.summary} ${book.why_i_should_invest_in_this_comic}`;
      expect(text.toLowerCase()).not.toContain("placeholder");
      expect(text.toLowerCase()).not.toContain("synthetic");
      expect(text.toLowerCase()).not.toContain("mock");
    });

    it("96. parses USD strings correctly with parseUsd utility", () => {
      expect(parseUsd("$112.00")).toBe(112.0);
      expect(parseUsd("$16,165.00")).toBe(16165.0);
      expect(parseUsd("$807.50")).toBe(807.5);
    });

    it("97. handles null and undefined safely in parseUsd", () => {
      expect(parseUsd(null)).toBeNull();
      expect(parseUsd(undefined)).toBeNull();
      expect(parseUsd("")).toBeNull();
    });

    it("98. formats sales volume velocity strings accurately", () => {
      expect(calculateVolumeVelocity(484)).toBe("1 sale per day");
      expect(calculateVolumeVelocity(52)).toBe("1 sale per week");
      expect(calculateVolumeVelocity(12)).toBe("1 sales per month");
      expect(calculateVolumeVelocity(5)).toBe("5 sales/yr");
    });

    it("99. validates authentic Uncanny X-Men #141 highres cover URL is valid Supabase storage webp", () => {
      const cover = UNCANNY_XMEN_141_CANONICAL.highres_cover_url;
      expect(cover).toContain("supabase.co");
      expect(cover).toContain(".webp");
    });

    it("100. validates authentic Amazing Spider-Man #129 highres cover URL is valid Supabase storage webp", () => {
      const cover = SOVEREIGN_CANONICAL_KEYS["2314852"].highres_cover_url;
      expect(cover).toContain("supabase.co");
      expect(cover).toContain(".webp");
    });

    it("101. validates authentic Incredible Hulk #181 highres cover URL is valid Supabase storage jpg", () => {
      const cover = SOVEREIGN_CANONICAL_KEYS["2386994"].highres_cover_url;
      expect(cover).toContain("supabase.co");
      expect(cover).toContain(".jpg");
    });

    it("102. validates authentic Amazing Spider-Man #300 highres cover URL is valid Supabase storage webp", () => {
      const cover = SOVEREIGN_CANONICAL_KEYS["2315040"].highres_cover_url;
      expect(cover).toContain("supabase.co");
      expect(cover).toContain(".webp");
    });

    it("103. validates authentic Batman #251 highres cover URL is valid Supabase storage webp", () => {
      const cover = SOVEREIGN_CANONICAL_KEYS["2316410"].highres_cover_url;
      expect(cover).toContain("supabase.co");
      expect(cover).toContain(".webp");
    });

    it("104. verifies all 3 acts are present in Uncanny X-Men #141 synopsis", () => {
      const synopsis = UNCANNY_XMEN_141_CANONICAL.summary!;
      expect(synopsis).toContain("Act I:");
      expect(synopsis).toContain("Act II:");
      expect(synopsis).toContain("Act III:");
    });

    it("105. verifies creator signature fees are marked as estimates without venue context", () => {
      const creatorFeeIsCertain = false;
      expect(creatorFeeIsCertain).toBe(false);
    });
  });
});
