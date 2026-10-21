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
    name: "Clean & Press + Grade (CCS)",
    badgeLabel: `${grader} Universal + CCS Pressing`,
    description: "Industry gold standard for 9.8 candidates. Includes professional heat press, stain mitigation, and archival encapsulation.",
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
  // TIER 2: Standard Universal (Grade Only, No Pressing)
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
    name: "Standard Universal (Grade Only)",
    badgeLabel: `${grader} Universal Blue Label`,
    description: "Direct encapsulation without pressing. Graded strictly in raw submission condition as-received from collection.",
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
    name: `Signature Series (${signaturesCount}x Witnessed)`,
    badgeLabel: `${grader} Signature Series (Yellow Label)`,
    description: `Official authorized witness verification. Includes creator signing fee for ${creatorName || "headline creator"} + official witness authentication seal.`,
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
    name: "Re-holder / Reslab Service",
    badgeLabel: `${grader} Re-holder (Mint Casing)`,
    description: "Case replacement for scuffed, scratched, or chipped slabs. Transfers label and certified book into a fresh hologram case.",
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
    pressed: pressedFormula,
    standard: standardFormula,
    signature: signatureFormula,
    reholder: reholderFormula,
  };

  let activeKey: EncasementFormulaKey = "pressed";
  if (isYellowLabel) {
    activeKey = "signature";
  } else if (grader === "PSA") {
    activeKey = "standard";
  }

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
