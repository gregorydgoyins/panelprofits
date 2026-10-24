import type { EncasementFormulaDetail, EncasementFormulaKey, ExitScenario } from "./types";

export interface BuildEncasementParams {
  grader: "CGC" | "CBCS" | "PSA";
  isVintage: boolean;
  estimatedRawBasis: number;
  isYellowLabel: boolean;
  creatorName?: string;
  signaturesCount?: number;
  grade?: string;
  isLot98?: boolean;
}

/**
 * Builds the 4 authentic encasement submission invoice tiers:
 * 1. Clean & Press (Grade + CCS Pressing) - Only applicable to sub-9.4 candidates. (You do NOT clean & press a 9.8!)
 * 2. Standard Universal (Grade Only) - Blue label raw submission ($35 grade + $43 ship + $5 invoice + 6% FL tax = $85.40 floor)
 * 3. Signature Series - Yellow label with witnessed authentication + creator fee guesstimate (uncertain without convention/venue pricing)
 * 4. Re-holder / Reslab - Fresh casing for cracked/scuffed slabs ($57.10 floor)
 */
export function buildEncasementFormulas({
  grader,
  isVintage,
  estimatedRawBasis,
  isYellowLabel,
  creatorName,
  signaturesCount = 1,
  grade,
  isLot98,
}: BuildEncasementParams): {
  formulas: Record<EncasementFormulaKey, EncasementFormulaDetail>;
  activeKey: EncasementFormulaKey;
} {
  const is98 = isLot98 ?? (grade === "9.8" || grade === "10.0" || grade === "9.9");
  const mailerBoxFee = 5.0;
  const venueFeeDragPercent = 13.25; // 13.25% eBay / marketplace platform fee + payment processing
  const taxRatePercent = 6.0; // 6.0% Straight Florida sales tax (Sarasota, FL) on taxable grading & invoice fees
  const outgoingShipping = 15.0; // $15.00 Priority Mail padded mailer/gemini box out
  const returnShipping = 28.0; // $28.00 base CGC return FedEx/UPS insured courier
  const totalTwoWayShipping = outgoingShipping + returnShipping; // $43.00

  // ──────────────────────────────────────────────────────────────────────────
  // TIER 1: Clean & Press + Grade (CCS)
  // "You do not clean and press a 9.8 — nowhere to go"
  // For sub-9.4: "35 to grade + 30 pressing + 43 two-way shipping + 5 invoice + 6% FL tax on services"
  // ──────────────────────────────────────────────────────────────────────────
  const ccsBase = grader === "CGC" ? (isVintage ? 55.0 : 35.0) : grader === "CBCS" ? (isVintage ? 45.0 : 30.0) : (isVintage ? 40.0 : 30.0);
  // Strictly $0 pressing if 9.8 — you never clean and press a 9.8!
  const ccsPressing = is98 ? 0.0 : grader === "PSA" ? 0.0 : isVintage ? 40.0 : 30.0;
  const ccsInvoice = grader === "PSA" ? 10.0 : 5.0;
  const ccsTaxable = ccsBase + ccsPressing + ccsInvoice;
  const ccsTax = Math.round(ccsTaxable * (taxRatePercent / 100) * 100) / 100;
  const ccsTotalSunk = ccsBase + ccsPressing + ccsInvoice + ccsTax + totalTwoWayShipping;
  const ccsCostBasis = estimatedRawBasis + ccsTotalSunk + mailerBoxFee;
  const ccsBreakeven = Math.round((ccsCostBasis / (1 - venueFeeDragPercent / 100)) * 100) / 100;

  const pressedFormula: EncasementFormulaDetail = {
    key: "pressed",
    name: is98 ? "Clean & Press (Ineligible for 9.8)" : "Clean & Press (Hypothetical CPR Upside)",
    badgeLabel: is98 ? `${grader} Universal (No Pressing on 9.8)` : `${grader} Universal + CCS Pressing (Hypothetical CPR)`,
    description: is98
      ? "You do not clean and press a 9.8 certified comic ($0 pressing). A 9.8 is already at the practical top-grade ceiling—pressing introduces uncompensated damage risk with nowhere to go."
      : "Hypothetical buyer model. Not every comic below 9.8 is a CPR candidate—this exercise models what could happen if an 8.5 or 9.2 turns in favor of the buyer upon pressing and regrading.",
    isYellowLabel: false,
    baseGradingFee: ccsBase,
    pressingFee: ccsPressing,
    witnessFee: 0,
    creatorSigningFee: 0,
    invoiceFee: ccsInvoice,
    serviceTax: ccsTax,
    taxRatePercent,
    shippingHandlingFee: totalTwoWayShipping,
    slabbingCostFloor: Math.round(ccsTotalSunk * 100) / 100,
    estimatedRawBasis,
    mailerBoxFee,
    sellerTotalCostBasis: Math.round(ccsCostBasis * 100) / 100,
    buyerReplacementCost: Math.round(ccsCostBasis * 100) / 100,
    venueFeeDragPercent,
    breakevenSalePrice: ccsBreakeven,
  };

  // ──────────────────────────────────────────────────────────────────────────
  // TIER 2: Standard Universal (Grade Only, No Pressing) - AUCTION DEFAULT
  // "standard is the way that these auctions usually go"
  // ──────────────────────────────────────────────────────────────────────────
  const stdBase = ccsBase;
  const stdInvoice = ccsInvoice;
  const stdTaxable = stdBase + stdInvoice;
  const stdTax = Math.round(stdTaxable * (taxRatePercent / 100) * 100) / 100;
  const stdTotalSunk = stdBase + stdInvoice + stdTax + totalTwoWayShipping;
  const stdCostBasis = estimatedRawBasis + stdTotalSunk + mailerBoxFee;
  const stdBreakeven = Math.round((stdCostBasis / (1 - venueFeeDragPercent / 100)) * 100) / 100;

  const standardFormula: EncasementFormulaDetail = {
    key: "standard",
    name: "Standard Universal (Auction Baseline)",
    badgeLabel: `${grader} Universal Blue Label (Auction Standard)`,
    description: is98
      ? "Standard secondary market auction reality for 9.8 certified slabs. Encapsulated without pressing ($0 pressing fee) to preserve top-grade mint factory status."
      : "Standard secondary market auction reality. Encapsulated as-is without pressing. Graded strictly in raw submission condition as-received from collection.",
    isYellowLabel: false,
    baseGradingFee: stdBase,
    pressingFee: 0,
    witnessFee: 0,
    creatorSigningFee: 0,
    invoiceFee: stdInvoice,
    serviceTax: stdTax,
    taxRatePercent,
    shippingHandlingFee: totalTwoWayShipping,
    slabbingCostFloor: Math.round(stdTotalSunk * 100) / 100,
    estimatedRawBasis,
    mailerBoxFee,
    sellerTotalCostBasis: Math.round(stdCostBasis * 100) / 100,
    buyerReplacementCost: Math.round(stdCostBasis * 100) / 100,
    venueFeeDragPercent,
    breakevenSalePrice: stdBreakeven,
  };

  // ──────────────────────────────────────────────────────────────────────────
  // TIER 3: Signature Series (Yellow Label - Witnessed Signature + Signing Fee)
  // "you dont know creator fee so you can guesstimate but it isnt certain unless you know venue pricing or convention"
  // "you donyt vlean and press 9.8"
  // ──────────────────────────────────────────────────────────────────────────
  const sigBase = ccsBase;
  // If 9.8, you NEVER clean and press!
  const sigPressing = is98 ? 0.0 : grader === "PSA" ? 0.0 : 30.0;
  const sigWitness = grader === "CGC" ? 25.0 * signaturesCount : grader === "CBCS" ? 20.0 * signaturesCount : 25.0 * signaturesCount;
  // Guesstimate creator fee: ~$35.00/sig baseline; uncertain without specific convention or venue pricing
  const sigCreator = 35.0 * signaturesCount;
  const sigInvoice = ccsInvoice;
  const sigTaxable = sigBase + sigPressing + sigWitness + sigInvoice;
  const sigTax = Math.round(sigTaxable * (taxRatePercent / 100) * 100) / 100;
  const sigTotalSunk = sigBase + sigPressing + sigWitness + sigCreator + sigInvoice + sigTax + totalTwoWayShipping;
  const sigCostBasis = estimatedRawBasis + sigTotalSunk + mailerBoxFee;
  const sigBreakeven = Math.round((sigCostBasis / (1 - venueFeeDragPercent / 100)) * 100) / 100;

  const signatureFormula: EncasementFormulaDetail = {
    key: "signature",
    name: `Signature Series (${signaturesCount}x Signed Mathematics)`,
    badgeLabel: `${grader} Signature Series (Witnessed Signed)`,
    description: `Signed mathematics: Official authorized witness authentication ($${sigWitness.toFixed(0)}) + creator signing fee guesstimate (~$${sigCreator.toFixed(0)}) for ${creatorName || "headline creator"}. (Creator fee is a guesstimate—uncertain without confirmed convention or private signing venue pricing).${is98 ? " Clean & press omitted ($0) because you do not press a 9.8." : ""}`,
    isYellowLabel: true,
    baseGradingFee: sigBase,
    pressingFee: sigPressing,
    witnessFee: sigWitness,
    creatorSigningFee: sigCreator,
    creatorSigningFeeCertainty: "guesstimate",
    creatorSigningFeeRange: [25, 100],
    creatorSigningFeeNote: "Creator signing fee is an estimated guesstimate (~$25–$100+). Exact fees cannot be determined with certainty without verified convention floor or private signing venue pricing.",
    invoiceFee: sigInvoice,
    serviceTax: sigTax,
    taxRatePercent,
    shippingHandlingFee: totalTwoWayShipping,
    slabbingCostFloor: Math.round(sigTotalSunk * 100) / 100,
    estimatedRawBasis,
    mailerBoxFee,
    sellerTotalCostBasis: Math.round(sigCostBasis * 100) / 100,
    buyerReplacementCost: Math.round(sigCostBasis * 100) / 100,
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
    buyerReplacementCost: Math.round(rehCostBasis * 100) / 100,
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
  outgoingShipping: number; // $15.00 Priority Mail Out
  returnShipping: number; // $28.00 base CGC Return Courier
  twoWayShipping: number; // $15 + $28 = $43.00
  twoWayInsurance: number;
  invoiceFee: number;
  serviceTax: number;
  taxRatePercent: number; // 6.0% FL State Sales Tax
  sunkExpenses: number; // Box 1 Total Sunk Certification Bill
  allInCost: number; // Box 2 Whole Tomato Cost (Raw + Box 1)
  manufacturingAdvantage: number; // Box 3 Advantage (Whole Tomato - Current Bid)
  isCprEligible: boolean;
  cprIneligibilityReason?: string;
  targetBumpGrade?: string;
  targetBumpFmv?: number;
  cprNetBenefit?: number;
  creatorFeeIsGuesstimate?: boolean;
  creatorFeeNote?: string;
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
  outgoingShipping: number;
  returnShipping: number;
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
 * Calculates authentic replacement mathematics & 3-Box Vertical Whole Tomato Valuation:
 *
 * 1. Box 1: Sunk Certification & Logistics Bill
 *    Grading Fee + $5 Invoice + Straight Florida State Sales Tax (6.0%) + $15 Priority Out + $28 Return Courier (+ $30 CPR only if sub-9.4).
 * 2. Box 2: The Whole Tomato (Raw Basis + Box 1 Sunk Costs).
 * 3. Box 3: The Live Auction Comparison (Box 2 Whole Tomato - Current Hammer Bid = Manufacturing Advantage).
 * 4. 9.8 Pre-Screen Safety Net: Setting a 9.8 pre-screen caps grading loss at ~$44 ($9 reject + $28 return + $5 invoice) if it misses 9.8.
 *    Saves $35-$55 slabbing charges; hunting raw 9.8 without a screen is pure gambling.
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
  const outgoingShipping = 15.0; // Priority Mail padded mailer/box to Sarasota, FL
  const returnShipping = 28.0; // CGC base insured courier return (FedEx/UPS)
  const twoWayShipping = outgoingShipping + returnShipping; // $43.00
  const twoWayInsurance = 0.0; // Included in courier declared tier
  const invoiceFee = 5.0;
  const taxRate = 0.06; // Straight Florida state sales tax (6.0%) in Sarasota, FL
  const signingFee = isYellowLabel ? 25.0 * signaturesCount : 0.0;

  // ── Standard Universal Replacement (Box 1 Sunk Factory Bill) ──
  const stdTaxable = baseGrading + invoiceFee + signingFee;
  const stdTax = Math.round(stdTaxable * taxRate * 100) / 100;
  const stdServices = Math.round((baseGrading + outgoingShipping + returnShipping + invoiceFee + stdTax + signingFee) * 100) / 100;
  const stdAllIn = Math.round((rawPrice + stdServices) * 100) / 100;

  const numGrade = parseFloat(lotGrade);
  const isLot98 = lotGrade === "9.8" || lotGrade === "10.0" || lotGrade === "9.9";
  // You do NOT clean and press a 9.8. CPR is strictly for mid/high candidates like 8.0, 8.5, 9.0, 9.2
  const isCprEligible = !isNaN(numGrade) && numGrade < 9.4 && numGrade >= 7.5;

  const standard: ReplacementCostBreakdown = {
    pathKey: "standard",
    pathName: isYellowLabel ? `Signature Series Replacement (${signaturesCount}x)` : isLot98 ? "Standard 9.8 Replacement (No Pressing)" : "Standard Certified Replacement",
    rawPrice,
    prepFee: signingFee,
    prepFeeName: isYellowLabel ? "Creator Signing Fee (Est. Guesstimate)" : isLot98 ? "No Pressing ($0 — 9.8 Top Grade)" : "No Pressing (As-Is)",
    gradingFee: baseGrading,
    outgoingShipping,
    returnShipping,
    twoWayShipping,
    twoWayInsurance,
    invoiceFee,
    serviceTax: stdTax,
    taxRatePercent: 6.0,
    sunkExpenses: stdServices,
    allInCost: stdAllIn,
    manufacturingAdvantage: Math.round((stdAllIn - currentBid) * 100) / 100,
    isCprEligible: false,
    creatorFeeIsGuesstimate: isYellowLabel,
    creatorFeeNote: isYellowLabel ? "Creator signing fee is an estimated guesstimate (~$25–$100+); uncertain without specific convention or venue pricing." : undefined,
  };

  // ── Clean, Press & Resubmit (CPR) — Calculated for 8.5 / 9.0 / 9.2 Candidates Only ──
  const cprFee = 30.0;
  const cprTaxable = baseGrading + cprFee + invoiceFee + signingFee;
  const cprTax = Math.round(cprTaxable * taxRate * 100) / 100;
  const cprServices = Math.round((baseGrading + cprFee + outgoingShipping + returnShipping + invoiceFee + cprTax + signingFee) * 100) / 100;
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
    outgoingShipping,
    returnShipping,
    twoWayShipping,
    twoWayInsurance,
    invoiceFee,
    serviceTax: cprTax,
    taxRatePercent: 6.0,
    sunkExpenses: cprServices,
    allInCost: cprAllIn,
    manufacturingAdvantage: Math.round((cprAllIn - currentBid) * 100) / 100,
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
  // Box 1: Sunk Certification Expenses
  // Box 2: Whole Tomato Intrinsic Value = Raw Street Basis + Box 1
  // Box 3: Manufacturing Advantage = Whole Tomato - Current Bid
  const activeReplacementCost = isCprEligible ? cprAllIn : stdAllIn;
  const activeSunkExpenses = isCprEligible ? cprServices : stdServices;
  const effectiveLastSold = lastSoldPrice > 0 ? lastSoldPrice : currentLotFmv;
  const eightBallSpread = Math.round((activeReplacementCost - effectiveLastSold - currentBid) * 100) / 100;
  const replacementAdvantage = Math.round((activeReplacementCost - currentBid) * 100) / 100;
  const priceDiscoverySpread = Math.round((effectiveLastSold - currentBid) * 100) / 100;

  const wholeTomato: WholeTomatoEightBallAnalysis = {
    rawStreetValue: rawPrice,
    serviceExpenses: activeSunkExpenses,
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

  // ── Minimum Grade Screen Rule ("Pre-Screen Caps Loss at ~$44") ──
  const rejectFee = 9.0;
  const totalRejectFee = invoiceFee + rejectFee; // $14.00
  const rejectTax = Math.round((rejectFee + invoiceFee) * taxRate * 100) / 100; // $0.84
  // If book misses 9.8, loss is capped at $9 reject + $5 invoice + $28 return shipping + tax = $42.84 (~$44.00)
  const totalSunkIfRejected = Math.round((totalRejectFee + returnShipping + rejectTax) * 100) / 100;
  const equityWinIfExceeded = Math.max(0, fmv98 - activeReplacementCost);

  const screenRule: MinimumGradeScreen = {
    thresholdGrade: isLot98 ? "9.8" : "9.4",
    invoiceFee,
    rejectFee,
    totalRejectFee,
    outgoingShipping,
    returnShipping,
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
