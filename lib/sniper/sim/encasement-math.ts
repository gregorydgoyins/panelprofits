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
  includePressing?: boolean; // Optional variable: only applicable on <= 9.4
}

/**
 * Builds the 4 authentic encasement submission invoice tiers:
 * 1. Standard Universal (Grade Only) - Blue label raw submission (Auction baseline, $0 pressing)
 * 2. Signature Series - Yellow label with witnessed authentication + creator fee guesstimate ($0 pressing by default)
 * 3. Clean & Press (CPR) - Optional variable ONLY applicable on <= 9.4 candidates with pressable defects
 * 4. Re-holder / Reslab - Fresh casing for cracked/scuffed slabs
 *
 * Universal Sales Tax Mandate:
 * "Sales tax applies everywhere; this is not food."
 * Under Florida law and US marketplace rules, comics, packaging supplies, courier shipping,
 * and slabbing services are tangible goods & services subject to Florida state sales tax (6.0%).
 * None of these are tax-exempt grocery food.
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
  includePressing = false,
}: BuildEncasementParams): {
  formulas: Record<EncasementFormulaKey, EncasementFormulaDetail>;
  activeKey: EncasementFormulaKey;
} {
  const numGrade = parseFloat(grade || "9.8");
  const isHighGrade = isLot98 ?? (grade === "9.8" || grade === "10.0" || grade === "9.9" || (!isNaN(numGrade) && numGrade > 9.4));
  const isPressingCandidate = !isHighGrade && !isNaN(numGrade) && numGrade <= 9.4;

  const mailerBoxFee = 5.0; // Rigid cardboard Gemini mailer / packaging
  const venueFeeDragPercent = 13.25; // 13.25% eBay / marketplace platform fee + payment processing
  const taxRatePercent = 6.0; // 6.0% Straight Florida sales tax (Sarasota, FL) applied everywhere (not food)
  const outgoingShipping = 15.0; // $15.00 Priority Mail padded mailer/gemini box out
  const returnShipping = 28.0; // $28.00 base CGC return FedEx/UPS insured courier
  const totalTwoWayShipping = outgoingShipping + returnShipping; // $43.00

  // Online invoice handling standard is $8.00
  const onlineInvoiceFee = 8.0;

  // Universal sales tax on raw comic purchase (comics are taxable tangible personal property, not food)
  const rawTax = Math.round(estimatedRawBasis * (taxRatePercent / 100) * 100) / 100;
  // Universal sales tax on mailer packaging supplies
  const mailerTax = Math.round(mailerBoxFee * (taxRatePercent / 100) * 100) / 100; // $0.30

  // ──────────────────────────────────────────────────────────────────────────
  // TIER 1: Standard Universal (Grade Only, No Pressing) - AUCTION DEFAULT
  // Standard secondary market reality: Encapsulated as-is without pressing.
  // ──────────────────────────────────────────────────────────────────────────
  const stdBase = grader === "CGC" ? (isVintage ? 55.0 : 35.0) : grader === "CBCS" ? (isVintage ? 45.0 : 30.0) : (isVintage ? 40.0 : 30.0);
  const stdInvoice = onlineInvoiceFee;
  // Sales tax applies to grading, invoice fee, and courier shipping ("this is not food")
  const stdTaxableServices = stdBase + stdInvoice + totalTwoWayShipping;
  const stdTax = Math.round(stdTaxableServices * (taxRatePercent / 100) * 100) / 100;
  const stdTotalSunk = stdTaxableServices + stdTax;
  const stdTotalTax = rawTax + stdTax + mailerTax;
  const stdCostBasis = Math.round((estimatedRawBasis + rawTax + stdTotalSunk + mailerBoxFee + mailerTax) * 100) / 100;
  const stdBreakeven = Math.round((stdCostBasis / (1 - venueFeeDragPercent / 100)) * 100) / 100;

  const standardFormula: EncasementFormulaDetail = {
    key: "standard",
    name: "Standard Universal (Auction Baseline)",
    badgeLabel: `${grader} Universal Blue Label (Auction Standard)`,
    description: isHighGrade
      ? "Standard secondary market auction reality for certified slabs. Encapsulated without pressing ($0 pressing fee) to preserve mint factory state. Top-grade copies (>9.4) are never pressed. Sales tax applies everywhere (raw, services, shipping, mailer) — this is not food."
      : "Standard secondary market auction reality. Encapsulated as-is without pressing ($0 pressing). Most copies even at 9.2 do not warrant the pressing fee, delay, or damage risk. Sales tax applies everywhere — this is not food.",
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
    rawTax,
    mailerBoxFee,
    mailerTax,
    totalSalesTax: stdTotalTax,
    sellerTotalCostBasis: stdCostBasis,
    buyerReplacementCost: stdCostBasis,
    venueFeeDragPercent,
    breakevenSalePrice: stdBreakeven,
  };

  // ──────────────────────────────────────────────────────────────────────────
  // TIER 2: Signature Series (Yellow Label - Witnessed Signature + Signing Fee)
  // Creator fee is a guesstimate; pressing is $0 by default.
  // ──────────────────────────────────────────────────────────────────────────
  const sigBase = stdBase;
  const sigWitness = grader === "CGC" ? 25.0 * signaturesCount : grader === "CBCS" ? 20.0 * signaturesCount : 25.0 * signaturesCount;
  const sigCreator = 35.0 * signaturesCount; // Guesstimate baseline: ~$35/sig
  const sigPressing = isPressingCandidate && includePressing ? (isVintage ? 40.0 : 30.0) : 0.0;
  const sigInvoice = onlineInvoiceFee;
  const sigTaxableServices = sigBase + sigPressing + sigWitness + sigInvoice + totalTwoWayShipping;
  const sigTax = Math.round(sigTaxableServices * (taxRatePercent / 100) * 100) / 100;
  const sigTotalSunk = sigTaxableServices + sigCreator + sigTax;
  const sigTotalTax = rawTax + sigTax + mailerTax;
  const sigCostBasis = Math.round((estimatedRawBasis + rawTax + sigTotalSunk + mailerBoxFee + mailerTax) * 100) / 100;
  const sigBreakeven = Math.round((sigCostBasis / (1 - venueFeeDragPercent / 100)) * 100) / 100;

  const signatureFormula: EncasementFormulaDetail = {
    key: "signature",
    name: `Signature Series (${signaturesCount}x Signed Mathematics)`,
    badgeLabel: `${grader} Signature Series (Witnessed Signed)`,
    description: `Signed mathematics: Official authorized witness authentication ($${sigWitness.toFixed(0)}) + creator signing fee guesstimate (~$${sigCreator.toFixed(0)}) for ${creatorName || "headline creator"}. (Creator fee is a guesstimate—uncertain without confirmed convention or private signing venue pricing). Pressing omitted ($0) by default. Sales tax applies everywhere (not food).`,
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
    rawTax,
    mailerBoxFee,
    mailerTax,
    totalSalesTax: sigTotalTax,
    sellerTotalCostBasis: sigCostBasis,
    buyerReplacementCost: sigCostBasis,
    venueFeeDragPercent,
    breakevenSalePrice: sigBreakeven,
  };

  // ──────────────────────────────────────────────────────────────────────────
  // TIER 3: Clean & Press (Optional Variable — Only Applicable on <= 9.4)
  // ──────────────────────────────────────────────────────────────────────────
  const cprBase = stdBase;
  const cprPressing = isPressingCandidate ? (isVintage ? 40.0 : 30.0) : 0.0;
  const cprInvoice = onlineInvoiceFee;
  const cprTaxableServices = cprBase + cprPressing + cprInvoice + totalTwoWayShipping;
  const cprTax = Math.round(cprTaxableServices * (taxRatePercent / 100) * 100) / 100;
  const cprTotalSunk = cprTaxableServices + cprTax;
  const cprTotalTax = rawTax + cprTax + mailerTax;
  const cprCostBasis = Math.round((estimatedRawBasis + rawTax + cprTotalSunk + mailerBoxFee + mailerTax) * 100) / 100;
  const cprBreakeven = Math.round((cprCostBasis / (1 - venueFeeDragPercent / 100)) * 100) / 100;

  const pressedFormula: EncasementFormulaDetail = {
    key: "pressed",
    name: isHighGrade
      ? "Clean & Press (Ineligible: Grade > 9.4)"
      : "Clean & Press (Optional Variable: <= 9.4 Candidate)",
    badgeLabel: isHighGrade
      ? `${grader} Universal (No Pressing on >9.4)`
      : `${grader} Universal + Optional Pressing`,
    description: isHighGrade
      ? "Ineligible ($0 pressing): You do not clean and press a 9.6 or 9.8 certified comic. Top-grade copies are already at the practical ceiling—pressing introduces uncompensated damage risk with nowhere to go. Sales tax applies everywhere."
      : "Optional variable ($30 pressing). Only select candidates at 9.4 or lower with pressable surface defects justify the fee. Many books even at 9.2 have unpressable defects where pressing is a waste of capital. Sales tax applies everywhere.",
    isYellowLabel: false,
    baseGradingFee: cprBase,
    pressingFee: cprPressing,
    witnessFee: 0,
    creatorSigningFee: 0,
    invoiceFee: cprInvoice,
    serviceTax: cprTax,
    taxRatePercent,
    shippingHandlingFee: totalTwoWayShipping,
    slabbingCostFloor: Math.round(cprTotalSunk * 100) / 100,
    estimatedRawBasis,
    rawTax,
    mailerBoxFee,
    mailerTax,
    totalSalesTax: cprTotalTax,
    sellerTotalCostBasis: cprCostBasis,
    buyerReplacementCost: cprCostBasis,
    venueFeeDragPercent,
    breakevenSalePrice: cprBreakeven,
  };

  // ──────────────────────────────────────────────────────────────────────────
  // TIER 4: Re-holder / Reslab Service (Fresh Acrylic Casing)
  // ──────────────────────────────────────────────────────────────────────────
  const rehFee = 25.0;
  const rehInvoice = onlineInvoiceFee;
  const rehShipping = 25.0;
  const rehTaxableServices = rehFee + rehInvoice + rehShipping;
  const rehTax = Math.round(rehTaxableServices * (taxRatePercent / 100) * 100) / 100;
  const rehTotalSunk = rehTaxableServices + rehTax;
  const rehTotalTax = rawTax + rehTax + mailerTax;
  const rehCostBasis = Math.round((estimatedRawBasis + rawTax + rehTotalSunk + mailerBoxFee + mailerTax) * 100) / 100;
  const rehBreakeven = Math.round((rehCostBasis / (1 - venueFeeDragPercent / 100)) * 100) / 100;

  const reholderFormula: EncasementFormulaDetail = {
    key: "reholder",
    name: "Re-holder / Reslab (Fresh Casing)",
    badgeLabel: `${grader} Re-holder (Re-case)`,
    description: "Casing replacement for scuffed, scratched, or chipped slabs to restore mint optical presentation without affecting the underlying certified grade. Sales tax applies everywhere.",
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
    rawTax,
    mailerBoxFee,
    mailerTax,
    totalSalesTax: rehTotalTax,
    sellerTotalCostBasis: rehCostBasis,
    buyerReplacementCost: rehCostBasis,
    venueFeeDragPercent,
    breakevenSalePrice: rehBreakeven,
  };

  const formulas: Record<EncasementFormulaKey, EncasementFormulaDetail> = {
    standard: standardFormula,
    signature: signatureFormula,
    pressed: pressedFormula,
    reholder: reholderFormula,
  };

  const activeKey: EncasementFormulaKey = isYellowLabel ? "signature" : "standard";

  return { formulas, activeKey };
}

/**
 * Calculates the 4 distinct liquidation exit channels:
 * 1. Online Marketplace (eBay / Shortboxed): FMV - 13.25% fee - $5 packaging
 * 2. Direct Collector (Private Sale / Con cash): 100% FMV ($0 fee, $0 packaging)
 * 3. Quick Liquidation / Local Comic Shop (LCS buy-list): 40% of FMV (immediate cash)
 * 4. Premier Auction House (Heritage / ComicLink): FMV - 10% seller commission - $5 packaging
 */
export function calculateExitScenarios(fmv: number, acquisitionCost: number): Record<string, ExitScenario> {
  // 1. Online Marketplace
  const marketplaceFeeRate = 13.25;
  const marketplaceMailer = 5.0;
  const marketplaceGross = fmv;
  const marketplaceFeeAmount = Math.round(marketplaceGross * (marketplaceFeeRate / 100) * 100) / 100;
  const marketplaceNet = Math.max(0, Math.round((marketplaceGross - marketplaceFeeAmount - marketplaceMailer) * 100) / 100);
  const marketplaceProfit = Math.round((marketplaceNet - acquisitionCost) * 100) / 100;
  const marketplaceRoi = acquisitionCost > 0 ? Math.round((marketplaceProfit / acquisitionCost) * 1000) / 10 : 0;

  // 2. Direct Collector
  const collectorGross = fmv;
  const collectorNet = collectorGross;
  const collectorProfit = Math.round((collectorNet - acquisitionCost) * 100) / 100;
  const collectorRoi = acquisitionCost > 0 ? Math.round((collectorProfit / acquisitionCost) * 1000) / 10 : 0;

  // 3. Local Comic Shop Wholesale
  const lcsGross = Math.round(fmv * 0.40 * 100) / 100;
  const lcsNet = lcsGross;
  const lcsProfit = Math.round((lcsNet - acquisitionCost) * 100) / 100;
  const lcsRoi = acquisitionCost > 0 ? Math.round((lcsProfit / acquisitionCost) * 1000) / 10 : 0;

  // 4. Premier Auction House
  const auctionFeeRate = 10.0;
  const auctionMailer = 5.0;
  const auctionFeeAmount = Math.round(fmv * (auctionFeeRate / 100) * 100) / 100;
  const auctionNet = Math.max(0, Math.round((fmv - auctionFeeAmount - auctionMailer) * 100) / 100);
  const auctionProfit = Math.round((auctionNet - acquisitionCost) * 100) / 100;
  const auctionRoi = acquisitionCost > 0 ? Math.round((auctionProfit / acquisitionCost) * 1000) / 10 : 0;

  return {
    marketplace: {
      channelKey: "marketplace",
      name: "Secondary Marketplace (eBay)",
      venue: "eBay Live / Shortboxed / Direct Platform",
      description: "Standard secondary marketplace with 13.25% fee drag and $5 packaging mailer.",
      liquidationVelocity: "30–60 Days",
      grossResalePrice: marketplaceGross,
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
  rawTax: number; // Sales tax on raw comic acquisition (not food!)
  prepFee: number;
  prepFeeName: string;
  gradingFee: number;
  outgoingShipping: number; // $15.00 Priority Mail Out
  returnShipping: number; // $28.00 base CGC Return Courier
  twoWayShipping: number; // $15 + $28 = $43.00
  twoWayInsurance: number;
  invoiceFee: number; // $8.00 online submission invoice fee
  serviceTax: number; // 6% Sales tax on grading + invoice + courier shipping + prep
  mailerBoxFee: number; // $5.00 packaging supplies
  mailerTax: number; // 6% Sales tax on packaging supplies ($0.30)
  totalSalesTax: number; // Total sales tax across all elements (raw + services + shipping + mailer)
  taxRatePercent: number; // 6.0% FL State Sales Tax
  sunkExpenses: number; // Box 1 Total Sunk Certification & Logistics Bill
  allInCost: number; // Box 2 Whole Tomato Cost (Raw + Raw Tax + Sunk Bill + Mailer + Mailer Tax)
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
  rawTax: number;
  serviceExpenses: number;
  mailerFee: number;
  mailerTax: number;
  totalSalesTax: number;
  wholeTomato: number; // Intrinsic replacement value = Raw + Raw Tax + Services + Courier + Mailer + Taxes
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
 * "Sales tax applies everywhere; this is not food."
 *
 * 1. Box 1: Sunk Certification & Logistics Bill
 *    Grading Fee + $8 Online Invoice + $43 Courier Shipping + Pressing/Signing + 6% Sales Tax on all services/shipping.
 * 2. Box 2: The Whole Tomato (Raw Basis + Raw Tax + Box 1 Sunk Bill + $5 Mailer + Mailer Tax).
 *    Raw Price is ALWAYS the core asset foundation.
 * 3. Box 3: The Live Auction Comparison (Box 2 Whole Tomato - Current Hammer Bid = Manufacturing Advantage).
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
  includePressing = false,
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
  includePressing?: boolean;
}): FullReplacementAnalysis {
  const baseGrading = grader === "CGC" ? (isVintage ? 55.0 : 35.0) : (isVintage ? 45.0 : 25.0);
  const outgoingShipping = 15.0; // Priority Mail padded mailer/box to Sarasota, FL
  const returnShipping = 28.0; // CGC base insured courier return (FedEx/UPS)
  const twoWayShipping = outgoingShipping + returnShipping; // $43.00
  const twoWayInsurance = 0.0;
  const invoiceFee = 8.0; // Online submission handling standard: $8.00
  const mailerBoxFee = 5.0; // Rigid cardboard Gemini mailer / packaging
  const taxRate = 0.06; // Florida state sales tax (6.0%) in Sarasota, FL ("this is not food")
  const signingFee = isYellowLabel ? 25.0 * signaturesCount : 0.0;

  const numGrade = parseFloat(lotGrade);
  const isLot98 = lotGrade === "9.8" || lotGrade === "10.0" || lotGrade === "9.9";
  const isHighGrade = isLot98 || (!isNaN(numGrade) && numGrade > 9.4);
  // Pressing only applicable to <= 9.4 candidates with pressable defects (never 9.6 or 9.8)
  const isCprEligible = !isHighGrade && !isNaN(numGrade) && numGrade <= 9.4 && numGrade >= 7.5;
  const cprFee = isCprEligible ? (isVintage ? 40.0 : 30.0) : 0.0;

  // Universal sales tax applied to raw comic purchase (comics are taxable tangible personal property, not food)
  const rawTax = Math.round(rawPrice * taxRate * 100) / 100;
  // Universal sales tax applied to packaging supplies
  const mailerTax = Math.round(mailerBoxFee * taxRate * 100) / 100; // $0.30

  // ── Standard Universal Replacement (Box 1 Sunk Factory Bill, $0 Pressing) ──
  // Sales tax applies to grading, online invoice, and courier shipping ("this is not food")
  const stdTaxableServices = baseGrading + invoiceFee + twoWayShipping + signingFee;
  const stdTax = Math.round(stdTaxableServices * taxRate * 100) / 100;
  const stdServices = Math.round((stdTaxableServices + stdTax) * 100) / 100;
  const stdTotalTax = Math.round((rawTax + stdTax + mailerTax) * 100) / 100;
  const stdAllIn = Math.round((rawPrice + rawTax + stdServices + mailerBoxFee + mailerTax) * 100) / 100;

  const standard: ReplacementCostBreakdown = {
    pathKey: "standard",
    pathName: isYellowLabel
      ? `Signature Series Replacement (${signaturesCount}x)`
      : isHighGrade
      ? "Standard Certified Replacement (No Pressing on >9.4)"
      : "Standard Certified Replacement",
    rawPrice,
    rawTax,
    prepFee: signingFee,
    prepFeeName: isYellowLabel ? "Creator Signing Fee (Est. Guesstimate)" : isHighGrade ? "No Pressing ($0 — Top Grade Ceiling)" : "No Pressing ($0 — As-Is Raw)",
    gradingFee: baseGrading,
    outgoingShipping,
    returnShipping,
    twoWayShipping,
    twoWayInsurance,
    invoiceFee,
    serviceTax: stdTax,
    mailerBoxFee,
    mailerTax,
    totalSalesTax: stdTotalTax,
    taxRatePercent: 6.0,
    sunkExpenses: stdServices,
    allInCost: stdAllIn,
    manufacturingAdvantage: Math.round((stdAllIn - currentBid) * 100) / 100,
    isCprEligible: false,
    creatorFeeIsGuesstimate: isYellowLabel,
    creatorFeeNote: isYellowLabel ? "Creator signing fee is an estimated guesstimate (~$25–$100+); uncertain without specific convention or venue pricing." : undefined,
  };

  // ── Clean, Press & Resubmit (CPR) — Optional Variable for <= 9.4 Candidates Only ──
  const cprTaxableServices = baseGrading + cprFee + invoiceFee + twoWayShipping + signingFee;
  const cprTax = Math.round(cprTaxableServices * taxRate * 100) / 100;
  const cprServices = Math.round((cprTaxableServices + cprTax) * 100) / 100;
  const cprTotalTax = Math.round((rawTax + cprTax + mailerTax) * 100) / 100;
  const cprAllIn = Math.round((rawPrice + rawTax + cprServices + mailerBoxFee + mailerTax) * 100) / 100;

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
    pathName: "Clean, Press & Resubmit (CPR Variable)",
    rawPrice,
    rawTax,
    prepFee: cprFee,
    prepFeeName: "Optional CPR (Clean & Press) Variable",
    gradingFee: baseGrading,
    outgoingShipping,
    returnShipping,
    twoWayShipping,
    twoWayInsurance,
    invoiceFee,
    serviceTax: cprTax,
    mailerBoxFee,
    mailerTax,
    totalSalesTax: cprTotalTax,
    taxRatePercent: 6.0,
    sunkExpenses: cprServices,
    allInCost: cprAllIn,
    manufacturingAdvantage: Math.round((cprAllIn - currentBid) * 100) / 100,
    isCprEligible,
    cprIneligibilityReason: isHighGrade
      ? "Clean & Press Does Not Apply (Top-grade >9.4 certified — pressing risk exceeds potential upside)"
      : undefined,
    targetBumpGrade,
    targetBumpFmv,
    cprNetBenefit,
    creatorFeeIsGuesstimate: isYellowLabel,
    creatorFeeNote: isYellowLabel ? "Creator signing fee is an estimated guesstimate (~$25–$100+); uncertain without specific convention or venue pricing." : undefined,
  };

  // Determine active breakdown
  const activeBreakdown = (includePressing && isCprEligible) ? cpr : standard;
  const activeReplacementCost = activeBreakdown.allInCost;
  const activeSunkExpenses = activeBreakdown.sunkExpenses;

  // ── Ahead of Eight Ball vs Behind Eight Ball ──
  const effectiveLastSold = lastSoldPrice > 0 ? lastSoldPrice : currentLotFmv;
  const eightBallSpread = Math.round((activeReplacementCost - effectiveLastSold - currentBid) * 100) / 100;
  const replacementAdvantage = Math.round((activeReplacementCost - currentBid) * 100) / 100;
  const priceDiscoverySpread = Math.round((effectiveLastSold - currentBid) * 100) / 100;

  const wholeTomato: WholeTomatoEightBallAnalysis = {
    rawStreetValue: rawPrice,
    rawTax,
    serviceExpenses: activeSunkExpenses,
    mailerFee: mailerBoxFee,
    mailerTax,
    totalSalesTax: activeBreakdown.totalSalesTax,
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

  // ── Minimum Grade Screen Rule ("Pre-Screen Caps Loss at ~$50") ──
  const rejectFee = 9.0;
  const rejectTaxable = invoiceFee + rejectFee + returnShipping;
  const rejectTax = Math.round(rejectTaxable * taxRate * 100) / 100;
  const totalSunkIfRejected = Math.round((rejectTaxable + rejectTax) * 100) / 100;
  const equityWinIfExceeded = Math.max(0, fmv98 - activeReplacementCost);

  const screenRule: MinimumGradeScreen = {
    thresholdGrade: isLot98 ? "9.8" : "9.4",
    invoiceFee,
    rejectFee,
    totalRejectFee: invoiceFee + rejectFee,
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
