import type { EncasementFormulaDetail, EncasementFormulaKey, ExitScenario } from "./types";

export interface BuildEncasementParams {
  grader: "CGC" | "CBCS" | "PSA";
  isVintage: boolean;
  estimatedRawBasis: number;
  isYellowLabel: boolean;
  creatorName?: string;
  signaturesCount?: number;
}

/**
 * Builds the 4 authentic encasement submission invoice tiers:
 * 1. Clean & Press (Grade + CCS Pressing) - Industry 9.8 standard ($30 grade + $25 press + $25 ship + $5 invoice + 7% tax = $89.20 floor)
 * 2. Standard Universal (Grade Only) - Blue label raw submission ($30 grade + $25 ship + $5 invoice + 7% tax = $62.45 floor)
 * 3. Signature Series - Yellow label with witnessed authentication + creator fee ($140.95+ floor)
 * 4. Re-holder / Reslab - Fresh casing for cracked/scuffed slabs ($57.10 floor)
 */
export function buildEncasementFormulas({
  grader,
  isVintage,
  estimatedRawBasis,
  isYellowLabel,
  creatorName,
  signaturesCount = 1,
}: BuildEncasementParams): {
  formulas: Record<EncasementFormulaKey, EncasementFormulaDetail>;
  activeKey: EncasementFormulaKey;
} {
  const mailerBoxFee = 5.0;
  const venueFeeDragPercent = 13.25; // 13.25% eBay / marketplace platform fee + payment processing
  const taxRatePercent = 7.0; // 7.0% State service tax on taxable grading, pressing, handling

  // ──────────────────────────────────────────────────────────────────────────
  // TIER 1: Clean & Press + Grade (CCS)
  // "30 to grade + 25 pressing + 25 return shipping + invoice + tax on service"
  // ──────────────────────────────────────────────────────────────────────────
  const ccsBase = grader === "CGC" ? (isVintage ? 45.0 : 30.0) : grader === "CBCS" ? (isVintage ? 40.0 : 25.0) : (isVintage ? 35.0 : 25.0);
  const ccsPressing = grader === "PSA" ? 0.0 : isVintage ? 35.0 : 25.0;
  const ccsInvoice = grader === "PSA" ? 10.0 : 5.0;
  const ccsShipping = 25.0;
  const ccsTaxable = ccsBase + ccsPressing + ccsInvoice;
  const ccsTax = Math.round(ccsTaxable * (taxRatePercent / 100) * 100) / 100;
  const ccsTotalSunk = ccsBase + ccsPressing + ccsInvoice + ccsTax + ccsShipping;
  const ccsCostBasis = estimatedRawBasis + ccsTotalSunk + mailerBoxFee;
  const ccsBreakeven = Math.round((ccsCostBasis / (1 - venueFeeDragPercent / 100)) * 100) / 100;

  const pressedFormula: EncasementFormulaDetail = {
    key: "pressed",
    name: "Clean & Press (Hypothetical CPR Upside)",
    badgeLabel: `${grader} Universal + CCS Pressing (Hypothetical CPR)`,
    description: "Hypothetical buyer model. Not every comic below 9.8 is a CPR candidate—this exercise models what could happen if an 8.5 or 9.2 turns in favor of the buyer upon pressing and regrading.",
    isYellowLabel: false,
    baseGradingFee: ccsBase,
    pressingFee: ccsPressing,
    witnessFee: 0,
    creatorSigningFee: 0,
    invoiceFee: ccsInvoice,
    serviceTax: ccsTax,
    taxRatePercent,
    shippingHandlingFee: ccsShipping,
    slabbingCostFloor: Math.round(ccsTotalSunk * 100) / 100,
    estimatedRawBasis,
    mailerBoxFee,
    sellerTotalCostBasis: Math.round(ccsCostBasis * 100) / 100,
    venueFeeDragPercent,
    breakevenSalePrice: ccsBreakeven,
  };

  // ──────────────────────────────────────────────────────────────────────────
  // TIER 2: Standard Universal (Grade Only, No Pressing) - AUCTION DEFAULT
  // "standard is the way that these auctions usually go"
  // ──────────────────────────────────────────────────────────────────────────
  const stdBase = ccsBase;
  const stdInvoice = ccsInvoice;
  const stdShipping = 25.0;
  const stdTaxable = stdBase + stdInvoice;
  const stdTax = Math.round(stdTaxable * (taxRatePercent / 100) * 100) / 100;
  const stdTotalSunk = stdBase + stdInvoice + stdTax + stdShipping;
  const stdCostBasis = estimatedRawBasis + stdTotalSunk + mailerBoxFee;
  const stdBreakeven = Math.round((stdCostBasis / (1 - venueFeeDragPercent / 100)) * 100) / 100;

  const standardFormula: EncasementFormulaDetail = {
    key: "standard",
    name: "Standard Universal (Auction Baseline)",
    badgeLabel: `${grader} Universal Blue Label (Auction Standard)`,
    description: "Standard secondary market auction reality. Encapsulated as-is without pressing. Graded strictly in raw submission condition as-received from collection.",
    isYellowLabel: false,
    baseGradingFee: stdBase,
    pressingFee: 0,
    witnessFee: 0,
    creatorSigningFee: 0,
    invoiceFee: stdInvoice,
    serviceTax: stdTax,
    taxRatePercent,
    shippingHandlingFee: stdShipping,
    slabbingCostFloor: Math.round(stdTotalSunk * 100) / 100,
    estimatedRawBasis,
    mailerBoxFee,
    sellerTotalCostBasis: Math.round(stdCostBasis * 100) / 100,
    venueFeeDragPercent,
    breakevenSalePrice: stdBreakeven,
  };

  // ──────────────────────────────────────────────────────────────────────────
  // TIER 3: Signature Series (Yellow Label - Witnessed Signature + Signing Fee)
  // "signed has different mathematics"
  // ──────────────────────────────────────────────────────────────────────────
  const sigBase = ccsBase;
  const sigPressing = grader === "PSA" ? 0.0 : 25.0; // High-grade signings are almost universally pressed
  const sigWitness = grader === "CGC" ? 25.0 * signaturesCount : grader === "CBCS" ? 20.0 * signaturesCount : 25.0 * signaturesCount;
  const sigCreator = 25.0 * signaturesCount; // Standard signing fee (e.g. McFarlane, Miller, Lee)
  const sigInvoice = ccsInvoice;
  const sigShipping = 25.0;
  const sigTaxable = sigBase + sigPressing + sigWitness + sigInvoice;
  const sigTax = Math.round(sigTaxable * (taxRatePercent / 100) * 100) / 100;
  const sigTotalSunk = sigBase + sigPressing + sigWitness + sigCreator + sigInvoice + sigTax + sigShipping;
  const sigCostBasis = estimatedRawBasis + sigTotalSunk + mailerBoxFee;
  const sigBreakeven = Math.round((sigCostBasis / (1 - venueFeeDragPercent / 100)) * 100) / 100;

  const signatureFormula: EncasementFormulaDetail = {
    key: "signature",
    name: `Signature Series (${signaturesCount}x Signed Mathematics)`,
    badgeLabel: `${grader} Signature Series (Witnessed Signed)`,
    description: `Signed mathematics: Official authorized witness authentication (${sigWitness.toFixed(0)}) + creator signing fee (${sigCreator.toFixed(0)}) for ${creatorName || "headline creator"}. Carries distinct secondary valuation and authentication premiums.`,
    isYellowLabel: true,
    baseGradingFee: sigBase,
    pressingFee: sigPressing,
    witnessFee: sigWitness,
    creatorSigningFee: sigCreator,
    invoiceFee: sigInvoice,
    serviceTax: sigTax,
    taxRatePercent,
    shippingHandlingFee: sigShipping,
    slabbingCostFloor: Math.round(sigTotalSunk * 100) / 100,
    estimatedRawBasis,
    mailerBoxFee,
    sellerTotalCostBasis: Math.round(sigCostBasis * 100) / 100,
    venueFeeDragPercent,
    breakevenSalePrice: sigBreakeven,
  };

  // ──────────────────────────────────────────────────────────────────────────
  // TIER 4: Re-holder / Reslab Service (Fresh Acrylic Casing)
  // "re holder is in the same hypothetical as CPR"
  // ──────────────────────────────────────────────────────────────────────────
  const rehFee = 25.0;
  const rehInvoice = ccsInvoice;
  const rehShipping = 25.0;
  const rehTaxable = rehFee + rehInvoice;
  const rehTax = Math.round(rehTaxable * (taxRatePercent / 100) * 100) / 100;
  const rehTotalSunk = rehFee + rehInvoice + rehTax + rehShipping;
  const rehCostBasis = estimatedRawBasis + rehTotalSunk + mailerBoxFee;
  const rehBreakeven = Math.round((rehCostBasis / (1 - venueFeeDragPercent / 100)) * 100) / 100;

  const reholderFormula: EncasementFormulaDetail = {
    key: "reholder",
    name: "Re-holder / Reslab (Hypothetical Casing)",
    badgeLabel: `${grader} Re-holder (Hypothetical Re-case)`,
    description: "Hypothetical post-acquisition casing scenario. Case replacement for scuffed, scratched, or chipped slabs to restore mint visual presentation without affecting the underlying grade.",
    isYellowLabel: false,
    baseGradingFee: rehFee,
    pressingFee: 0,
    witnessFee: 0,
    creatorSigningFee: 0,
    invoiceFee: rehInvoice,
    serviceTax: rehTax,
    taxRatePercent,
    shippingHandlingFee: rehShipping,
    slabbingCostFloor: Math.round(rehTotalSunk * 100) / 100,
    estimatedRawBasis,
    mailerBoxFee,
    sellerTotalCostBasis: Math.round(rehCostBasis * 100) / 100,
    venueFeeDragPercent,
    breakevenSalePrice: rehBreakeven,
  };

  const formulas: Record<EncasementFormulaKey, EncasementFormulaDetail> = {
    standard: standardFormula,
    signature: signatureFormula,
    pressed: pressedFormula,
    reholder: reholderFormula,
  };

  // Standard universal is the way auctions usually go; signed has different mathematics; CPR and reholder are hypothetical exercises
  let activeKey: EncasementFormulaKey = isYellowLabel ? "signature" : "standard";

  return { formulas, activeKey };
}

/**
 * Calculates the 4 distinct liquidation exit channels:
 * 1. Online Marketplace (eBay / Shortboxed): FMV - 13.25% fee - $5 packaging
 * 2. Direct Collector (Private Sale / Con cash): 100% FMV ($0 fee, $0 packaging)
 * 3. Quick Liquidation / Local Comic Shop (LCS buy-list): 40% of FMV (immediate cash)
 * 4. Auction House (Heritage / ComicLink): FMV - 10% seller commission - $5 packaging
 */
export function calculateExitScenarios(fmv: number, acquisitionCost: number): Record<string, ExitScenario> {
  // 1. Online Marketplace
  const marketplaceFeeRate = 13.25;
  const marketplaceFeeAmount = Math.round(fmv * (marketplaceFeeRate / 100) * 100) / 100;
  const marketplaceMailer = 5.0;
  const marketplaceNet = Math.round((fmv - marketplaceFeeAmount - marketplaceMailer) * 100) / 100;
  const marketplaceProfit = Math.round((marketplaceNet - acquisitionCost) * 100) / 100;
  const marketplaceRoi = acquisitionCost > 0 ? Math.round((marketplaceProfit / acquisitionCost) * 1000) / 10 : 0;

  // 2. Direct Collector
  const collectorGross = fmv;
  const collectorNet = fmv;
  const collectorProfit = Math.round((collectorNet - acquisitionCost) * 100) / 100;
  const collectorRoi = acquisitionCost > 0 ? Math.round((collectorProfit / acquisitionCost) * 1000) / 10 : 0;

  // 3. Local Comic Shop (LCS Quick Cash - 40% of FMV)
  const lcsGross = Math.round(fmv * 0.40 * 100) / 100;
  const lcsNet = lcsGross;
  const lcsProfit = Math.round((lcsNet - acquisitionCost) * 100) / 100;
  const lcsRoi = acquisitionCost > 0 ? Math.round((lcsProfit / acquisitionCost) * 1000) / 10 : 0;

  // 4. Auction House (Heritage / ComicLink - 10% commission)
  const auctionFeeRate = 10.0;
  const auctionFeeAmount = Math.round(fmv * (auctionFeeRate / 100) * 100) / 100;
  const auctionMailer = 5.0;
  const auctionNet = Math.round((fmv - auctionFeeAmount - auctionMailer) * 100) / 100;
  const auctionProfit = Math.round((auctionNet - acquisitionCost) * 100) / 100;
  const auctionRoi = acquisitionCost > 0 ? Math.round((auctionProfit / acquisitionCost) * 1000) / 10 : 0;

  return {
    marketplace: {
      channelKey: "marketplace",
      name: "eBay / Online Marketplace",
      venue: "eBay / Shortboxed / MyComicShop",
      description: "Standard retail liquidation at full market FMV with 13.25% commission and insured parcel shipping.",
      liquidationVelocity: "14–30 Days",
      grossResalePrice: fmv,
      platformFeeRatePercent: marketplaceFeeRate,
      platformFeeAmount: marketplaceFeeAmount,
      packagingMailerFee: marketplaceMailer,
      netProceeds: marketplaceNet,
      netProfit: marketplaceProfit,
      roiPercent: marketplaceRoi,
      isProfitable: marketplaceProfit > 0,
    },
    collector: {
      channelKey: "collector",
      name: "Direct Collector (Private Sale)",
      venue: "Convention Cash / Peer-to-Peer / Direct Buy",
      description: "Direct transfer to serious collector or dealer network. Zero platform cut, full net cash realization.",
      liquidationVelocity: "1–2 Weeks",
      grossResalePrice: collectorGross,
      platformFeeRatePercent: 0,
      platformFeeAmount: 0,
      packagingMailerFee: 0,
      netProceeds: collectorNet,
      netProfit: collectorProfit,
      roiPercent: collectorRoi,
      isProfitable: collectorProfit > 0,
    },
    lcs: {
      channelKey: "lcs",
      name: "Local Comic Shop (Quick Liquidation)",
      venue: "Brick & Mortar LCS Cash Buy-List",
      description: "Instant cash liquidation at wholesale buy-list rate (40% of FMV). Used for immediate emergency liquidity.",
      liquidationVelocity: "Immediate (Same-Day Cash)",
      grossResalePrice: lcsGross,
      platformFeeRatePercent: 0,
      platformFeeAmount: 0,
      packagingMailerFee: 0,
      netProceeds: lcsNet,
      netProfit: lcsProfit,
      roiPercent: lcsRoi,
      isProfitable: lcsProfit > 0,
    },
    auction: {
      channelKey: "auction",
      name: "Premier Auction House",
      venue: "Heritage Auctions / ComicLink Focused Auction",
      description: "Cataloged marquee auction with 10% seller commission. Best for major keys and high-grade specimens.",
      liquidationVelocity: "60–90 Days",
      grossResalePrice: fmv,
      platformFeeRatePercent: auctionFeeRate,
      platformFeeAmount: auctionFeeAmount,
      packagingMailerFee: auctionMailer,
      netProceeds: auctionNet,
      netProfit: auctionProfit,
      roiPercent: auctionRoi,
      isProfitable: auctionProfit > 0,
    },
  };
}

export interface ReplacementCostBreakdown {
  pathKey: "cpr" | "standard" | "signature";
  pathName: string;
  rawPrice: number;
  prepFee: number;
  prepFeeName: string;
  gradingFee: number;
  twoWayShipping: number;
  twoWayInsurance: number;
  invoiceFee: number;
  serviceTax: number;
  allInCost: number;
  isCprEligible: boolean;
  cprIneligibilityReason?: string;
  targetBumpGrade?: string;
  targetBumpFmv?: number;
  cprNetBenefit?: number;
}

export interface HopeFactorYield {
  p98: number;
  p96: number;
  p94: number;
  p92OrLower: number;
  fmv98: number;
  fmv96: number;
  fmv94: number;
  fmv92: number;
  expectedValue: number;
  expectedGrade: number;
  spreadVsAllIn: number;
  frenzySpread: number;
}

export interface MinimumGradeScreen {
  thresholdGrade: string;
  invoiceFee: number;
  rejectFee: number;
  totalRejectFee: number;
  twoWayShipping: number;
  twoWayInsurance: number;
  totalSunkIfRejected: number;
  rejectProbability: number;
  passProbability: number;
  savedGradingFee: number;
  equityWinIfExceeded: number;
}

export interface WholeTomatoEightBallAnalysis {
  rawStreetValue: number;
  serviceExpenses: number;
  wholeTomato: number; // Intrinsic replacement value = Raw + Services
  lastSoldPrice: number; // Last recorded comp price
  currentBid: number;
  eightBallSpread: number; // Whole Tomato - Last Sold Price - Current Bid
  isAheadOfEightBall: boolean;
  replacementAdvantage: number; // Whole Tomato - Current Bid
  priceDiscoverySpread: number; // Last Sold Price - Current Bid
}

export interface FullReplacementAnalysis {
  wholeTomato: WholeTomatoEightBallAnalysis;
  standard: ReplacementCostBreakdown;
  cpr: ReplacementCostBreakdown;
  hopeFactor: HopeFactorYield;
  screenRule: MinimumGradeScreen;
  isLot98: boolean;
  activeGrade: string;
}

/**
 * Calculates authentic replacement mathematics & Whole Tomato Eight-Ball Valuation:
 *
 * 1. Whole Tomato Intrinsic Value: Raw street value + Grading + Inbound Shipping ($25) +
 *    Insured Return ($25) + Insurance ($15) + Invoice ($5) + Tax.
 * 2. Eight-Ball Formula: Whole Tomato (Intrinsic Value) - Last Sold Price - Current Bid.
 *    Shows whether the buyer is Ahead of the Eight Ball or Behind the Eight Ball.
 * 3. Strict CPR Rules: You do NOT clean and press a 9.8 (there is nowhere to go).
 *    CPR is only calculated for sub-9.4 books (e.g. 8.5 or 9.0) hoping for a 0.5 to 1.5 point bump.
 * 4. Hope Factor: Probabilistic yield curve for raw submissions.
 * 5. Minimum Grade Screen Rule: Grade only if >= 9.4; pay $5 invoice + $9 reject fee if it fails.
 */
export function calculateReplacementAnalysis({
  rawPrice,
  currentBid,
  lastSoldPrice = 0,
  lotGrade = "9.8",
  fmv98,
  fmv96,
  fmv94,
  fmv92,
  isVintage = false,
  isYellowLabel = false,
  signaturesCount = 1,
  grader = "CGC",
}: {
  rawPrice: number;
  currentBid: number;
  lastSoldPrice?: number;
  lotGrade?: string;
  fmv98: number;
  fmv96: number;
  fmv94: number;
  fmv92: number;
  isVintage?: boolean;
  isYellowLabel?: boolean;
  signaturesCount?: number;
  grader?: string;
}): FullReplacementAnalysis {
  const baseGrading = grader === "CGC" ? (isVintage ? 55.0 : 35.0) : (isVintage ? 45.0 : 25.0);
  const twoWayShipping = 50.0; // $25 inbound + $25 outbound
  const twoWayInsurance = 15.0; // Declared value transit protection
  const invoiceFee = 5.0;
  const taxRate = 0.07;
  const signingFee = isYellowLabel ? 25.0 * signaturesCount : 0.0;

  // ── Standard Universal Replacement (Auction Standard) ──
  const stdTaxable = baseGrading + invoiceFee + signingFee;
  const stdTax = Math.round(stdTaxable * taxRate * 100) / 100;
  const stdServices = baseGrading + twoWayShipping + twoWayInsurance + invoiceFee + stdTax + signingFee;
  const stdAllIn = Math.round((rawPrice + stdServices) * 100) / 100;

  const numGrade = parseFloat(lotGrade);
  const isLot98 = lotGrade === "9.8" || lotGrade === "10.0" || lotGrade === "9.9";
  // You do NOT clean and press a 9.8. CPR is strictly for mid/high candidates like 8.0, 8.5, 9.0, 9.2
  const isCprEligible = !isNaN(numGrade) && numGrade < 9.4 && numGrade >= 7.5;

  const standard: ReplacementCostBreakdown = {
    pathKey: "standard",
    pathName: isYellowLabel ? `Signature Series Replacement (${signaturesCount}x)` : "Standard Certified Replacement",
    rawPrice,
    prepFee: signingFee,
    prepFeeName: isYellowLabel ? "Creator Signing Fee" : "No Pressing (As-Is)",
    gradingFee: baseGrading,
    twoWayShipping,
    twoWayInsurance,
    invoiceFee,
    serviceTax: stdTax,
    allInCost: stdAllIn,
    isCprEligible: false,
  };

  // ── Clean, Press & Resubmit (CPR) — Calculated for 8.5 / 9.0 / 9.2 Candidates Only ──
  const cprFee = 30.0;
  const cprTaxable = baseGrading + cprFee + invoiceFee + signingFee;
  const cprTax = Math.round(cprTaxable * taxRate * 100) / 100;
  const cprServices = baseGrading + cprFee + twoWayShipping + twoWayInsurance + invoiceFee + cprTax + signingFee;
  const cprAllIn = Math.round((rawPrice + cprServices) * 100) / 100;

  let targetBumpGrade = "9.4";
  let targetBumpFmv = fmv94;
  if (numGrade <= 8.5) {
    targetBumpGrade = "9.0/9.2";
    targetBumpFmv = fmv92;
  } else if (numGrade <= 9.2) {
    targetBumpGrade = "9.4/9.6";
    targetBumpFmv = fmv96;
  }
  const currentLotFmv = isLot98 ? fmv98 : numGrade >= 9.6 ? fmv96 : numGrade >= 9.4 ? fmv94 : fmv92;
  const cprNetBenefit = isCprEligible ? targetBumpFmv - currentLotFmv - (cprFee + baseGrading + 15) : 0;

  const cpr: ReplacementCostBreakdown = {
    pathKey: "cpr",
    pathName: "Clean, Press & Resubmit (CPR)",
    rawPrice,
    prepFee: cprFee,
    prepFeeName: "CPR (Clean & Press) Fee",
    gradingFee: baseGrading,
    twoWayShipping,
    twoWayInsurance,
    invoiceFee,
    serviceTax: cprTax,
    allInCost: cprAllIn,
    isCprEligible,
    cprIneligibilityReason: isLot98
      ? "Clean & Press Does Not Apply (9.8 is practical top-grade — nowhere to go)"
      : numGrade >= 9.4
      ? "High-grade 9.4+ already certified — pressing risk exceeds expected upside"
      : undefined,
    targetBumpGrade,
    targetBumpFmv,
    cprNetBenefit: Math.round(cprNetBenefit * 100) / 100,
  };

  // ── The Whole Tomato Replacement Cost & Eight-Ball Position ──
  // Whole Tomato Intrinsic Value = Raw Street Value + Sunk Services
  const activeReplacementCost = isCprEligible ? cprAllIn : stdAllIn;
  const effectiveLastSold = lastSoldPrice > 0 ? lastSoldPrice : currentLotFmv;
  const eightBallSpread = Math.round((activeReplacementCost - effectiveLastSold - currentBid) * 100) / 100;
  const replacementAdvantage = Math.round((activeReplacementCost - currentBid) * 100) / 100;
  const priceDiscoverySpread = Math.round((effectiveLastSold - currentBid) * 100) / 100;

  const wholeTomato: WholeTomatoEightBallAnalysis = {
    rawStreetValue: rawPrice,
    serviceExpenses: isCprEligible ? cprServices : stdServices,
    wholeTomato: activeReplacementCost,
    lastSoldPrice: effectiveLastSold,
    currentBid,
    eightBallSpread,
    isAheadOfEightBall: eightBallSpread >= 0,
    replacementAdvantage,
    priceDiscoverySpread,
  };

  // ── Hope Factor Probabilistic Yield Distribution ──
  const p98 = 0.15;
  const p96 = 0.35;
  const p94 = 0.32;
  const p92OrLower = 0.18;

  const expectedValue = Math.round(
    p98 * fmv98 + p96 * fmv96 + p94 * fmv94 + p92OrLower * fmv92
  );
  const expectedGrade = Math.round((p98 * 9.8 + p96 * 9.6 + p94 * 9.4 + p92OrLower * 9.0) * 10) / 10;
  const spreadVsAllIn = Math.round((expectedValue - activeReplacementCost) * 100) / 100;
  const frenzySpread = Math.round((activeReplacementCost - currentBid) * 100) / 100;

  const hopeFactor: HopeFactorYield = {
    p98,
    p96,
    p94,
    p92OrLower,
    fmv98,
    fmv96,
    fmv94,
    fmv92,
    expectedValue,
    expectedGrade,
    spreadVsAllIn,
    frenzySpread,
  };

  // ── Minimum Grade Screen Rule ("Only Grade If >= 9.4") ──
  const rejectFee = 9.0;
  const totalRejectFee = invoiceFee + rejectFee; // $14.00
  const totalSunkIfRejected = totalRejectFee + twoWayShipping + twoWayInsurance; // $14 + $50 + $15 = $79.00
  const equityWinIfExceeded = Math.max(0, fmv98 - activeReplacementCost);

  const screenRule: MinimumGradeScreen = {
    thresholdGrade: "9.4",
    invoiceFee,
    rejectFee,
    totalRejectFee,
    twoWayShipping,
    twoWayInsurance,
    totalSunkIfRejected,
    rejectProbability: p92OrLower,
    passProbability: Math.round((p98 + p96 + p94) * 100) / 100,
    savedGradingFee: baseGrading,
    equityWinIfExceeded,
  };

  return {
    wholeTomato,
    standard,
    cpr,
    hopeFactor,
    screenRule,
    isLot98,
    activeGrade: lotGrade,
  };
}
