/**
 * LANDED REPLACEMENT COST & REALIZATION ESCALATOR ENGINE
 *
 * Real-world underwriting model for certified comic acquisitions, raw submissions,
 * CPR (Crack, Press, Resubmit), and multi-channel liquidation.
 *
 * Core logistics anchored to Florida in-state reality:
 * - Sarasota CGC Facility base outbound shipping: $15.00 constant
 * - Palm Beach County / Boynton Beach Sales Tax: 7.0% (6% State + 1% Surtax)
 * - Payment clearing friction: PayPal Goods & Services 2.99% + $0.49
 * - Dynamic CGC service tiers and insured return shipping
 * - Unsigned vs Single vs Multi-Signature formulas
 * - Positive Grade Realization Escalator (9.2 Base Hit -> 9.8 Grand Slam)
 * - 3 Liquidation Channels: Private (97% - $25), Auction (90%), LCS Floor (50%)
 */

export interface LandedCostInput {
  rawPrice: number;
  fmv98: number;
  fmv96?: number;
  fmv94?: number;
  fmv92?: number;
  isPre1975?: boolean;
  salesTaxRate?: number; // default 0.07 (7.0%)
  isTaxExempt?: boolean; // Dealer resale certificate (0%)
  inboundShipping?: number; // default $15.00
  outboundShipping?: number; // default $15.00 (in-state constant)
  signatureCount?: number; // 0 = unsigned, 1 = single, 2+ = multi
  hasRemarque?: boolean; // +$15 artist remarque review
  includePressing?: boolean; // default true (CGC Pressing / Prep)
  pressingFee?: number; // default $20.00
  isEliteMember?: boolean; // CGC Elite Member (10% discount on grading & pressing)
  timeHorizonDays?: 90 | 180 | 365; // default 90
  monthlyCarryingCost?: number; // default $10.00 / month
  grader?: "CGC" | "CBCS" | "PSA";
}

export interface CgcTierDetails {
  tierName: string;
  gradingBaseFee: number;
  discountedBaseFee: number;
  returnShippingFee: number;
  invoiceFee: number;
  signatureFee: number;
  pressingFee: number;
  totalGradingFriction: number;
}

export interface GradeEscalatorStep {
  grade: number;
  label: string;
  milestone: string;
  fmv: number;
  totalLandedCost: number;
  cgcTier: CgcTierDetails;
  privateCollectorNet: number;
  auctionNet: number;
  lcsNet: number;
  ebayNet: number;
  // Primary realization channel (Auction House 90% as institutional baseline)
  netDollarGain: number;
  roiPercent: number;
  netGainAfterCarryingCost: number;
}

export interface LandedEquityReport {
  rawPurchasePrice: number;
  salesTax: number;
  paypalFriction: number;
  inboundShipping: number;
  outboundShipping: number;
  pressingFriction: number;
  sunkRawBasis: number; // Raw cost + Tax + PayPal + Inbound Ship + Outbound Ship + Pressing
  gradeSteps: GradeEscalatorStep[];
  preScreenRejectCost: number; // What you pay if CGC rejects from slab ($9 reject fee + return ship)
  preScreenSavingsVsFullSlab: number; // Savings if rejected raw vs paying full slab fee on a miss
  carryingCostTotal: number;
  timeHorizonDays: number;
}

/**
 * Calculates explicit signature fee according to CGC schedule:
 * - Unsigned: $0
 * - 1 Signature: $30.00
 * - Multi-Signature (N): $30 + $25 * (N - 1)
 * - Remarque: +$15.00
 */
export function calculateSignatureFee(signatureCount: number = 0, hasRemarque: boolean = false): number {
  let fee = 0;
  if (signatureCount === 1) {
    fee = 30.0;
  } else if (signatureCount > 1) {
    fee = 30.0 + 25.0 * (signatureCount - 1);
  }
  if (hasRemarque) {
    fee += 15.0;
  }
  return fee;
}

/**
 * Resolves CGC service tier, grading fee, and return courier shipping based on fair market value.
 */
export function resolveCgcTier(
  fmv: number,
  isPre1975: boolean = false,
  isEliteMember: boolean = false
): { tierName: string; baseFee: number; returnShipping: number } {
  if (fmv <= 400) {
    const baseFee = isPre1975 ? 45.0 : 30.0;
    const tierName = isPre1975 ? "Vintage (Pre-1975)" : "Modern";
    return { tierName, baseFee, returnShipping: 30.0 };
  }
  if (fmv <= 1000) {
    return { tierName: "High Value", baseFee: 105.0, returnShipping: 40.0 };
  }
  // Unlimited tier (> $1,000): 4% of FMV with a $135 minimum floor
  const unlimitedFee = Math.max(135.0, fmv * 0.04);
  return { tierName: "Unlimited (4% FMV)", baseFee: unlimitedFee, returnShipping: 85.0 };
}

/**
 * Computes the complete Landed Cost, Grade Escalator Ladder, and Multi-Channel Liquidation report.
 */
export function calculateLandedEquityReport(input: LandedCostInput): LandedEquityReport {
  const rawPrice = Math.max(0, input.rawPrice || 0);
  const isTaxExempt = Boolean(input.isTaxExempt);
  const taxRate = isTaxExempt ? 0 : (input.salesTaxRate ?? 0.07);
  const salesTax = Number((rawPrice * taxRate).toFixed(2));
  const paypalFriction = rawPrice > 0 ? Number((rawPrice * 0.0299 + 0.49).toFixed(2)) : 0;
  const inboundShipping = input.inboundShipping ?? 15.0;
  const outboundShipping = input.outboundShipping ?? 15.0;
  const isEliteMember = Boolean(input.isEliteMember);
  const eliteDiscount = isEliteMember ? 0.9 : 1.0;

  const pressingBase = input.includePressing !== false ? (input.pressingFee ?? 20.0) : 0;
  const pressingFriction = Number((pressingBase * eliteDiscount).toFixed(2));

  // Upstream sunk basis before grading fees
  const sunkRawBasis = Number(
    (rawPrice + salesTax + paypalFriction + inboundShipping + outboundShipping + pressingFriction).toFixed(2)
  );

  const signatureFee = calculateSignatureFee(input.signatureCount || 0, input.hasRemarque || false);
  const isPre1975 = Boolean(input.isPre1975);
  const timeHorizonDays = input.timeHorizonDays ?? 90;
  const months = timeHorizonDays / 30;
  const carryingCostTotal = Number(((input.monthlyCarryingCost ?? 10.0) * months).toFixed(2));

  // Grade rungs: 9.2 -> 9.4 -> 9.6 -> 9.8
  const fmv98 = input.fmv98 > 0 ? input.fmv98 : 0;
  const fmv96 = input.fmv96 && input.fmv96 > 0 ? input.fmv96 : (fmv98 > 0 ? Number((fmv98 * 0.45).toFixed(2)) : 0);
  const fmv94 = input.fmv94 && input.fmv94 > 0 ? input.fmv94 : (fmv96 > 0 ? Number((fmv96 * 0.65).toFixed(2)) : 0);
  const fmv92 = input.fmv92 && input.fmv92 > 0 ? input.fmv92 : (fmv94 > 0 ? Number((fmv94 * 0.70).toFixed(2)) : 0);

  const ladderDefs: { grade: number; label: string; milestone: string; fmv: number }[] = [
    { grade: 9.2, label: "CGC 9.2 NM-", milestone: "The Base Hit Win (Certified Premium)", fmv: fmv92 },
    { grade: 9.4, label: "CGC 9.4 NM", milestone: "Solid Double (Core Key Demand)", fmv: fmv94 },
    { grade: 9.6, label: "CGC 9.6 NM+", milestone: "Triple Play (High-Grade Blue Chip)", fmv: fmv96 },
    { grade: 9.8, label: "CGC 9.8 NM/MT", milestone: "Grand Slam Home Run (Top Tier)", fmv: fmv98 },
  ];

  const gradeSteps: GradeEscalatorStep[] = ladderDefs.map((def) => {
    const tier = resolveCgcTier(def.fmv, isPre1975, isEliteMember);
    const discountedBaseFee = Number((tier.baseFee * eliteDiscount).toFixed(2));
    const invoiceFee = 5.0; // CGC handling per invoice
    const totalGradingFriction = Number(
      (discountedBaseFee + tier.returnShipping + invoiceFee + signatureFee).toFixed(2)
    );
    const totalLandedCost = Number((sunkRawBasis + totalGradingFriction).toFixed(2));

    // Liquidation channels:
    // 1. Private Collector: 97% realization (3% payment clearing) minus $25 secure courier
    const privateCollectorNet = Math.max(0, Number((def.fmv * 0.97 - 25.0).toFixed(2)));
    // 2. Specialized Auction (Heritage/ComicLink): 90% realization (10% commission)
    const auctionNet = Number((def.fmv * 0.90).toFixed(2));
    // 3. Local Comic Shop (LCS Quick Cash Floor): 50% realization
    const lcsNet = Number((def.fmv * 0.50).toFixed(2));
    // 4. Secondary Marketplace (eBay 85% net after 13.25% fee + ship)
    const ebayNet = Number((def.fmv * 0.85).toFixed(2));

    // Baseline realization uses Auction House (90%) as institutional standard
    const netDollarGain = Number((auctionNet - totalLandedCost).toFixed(2));
    const roiPercent = totalLandedCost > 0 ? Number(((netDollarGain / totalLandedCost) * 100).toFixed(1)) : 0;
    const netGainAfterCarryingCost = Number((netDollarGain - carryingCostTotal).toFixed(2));

    const cgcTierDetails: CgcTierDetails = {
      tierName: tier.tierName,
      gradingBaseFee: tier.baseFee,
      discountedBaseFee,
      returnShippingFee: tier.returnShipping,
      invoiceFee,
      signatureFee,
      pressingFee: pressingFriction,
      totalGradingFriction,
    };

    return {
      grade: def.grade,
      label: def.label,
      milestone: def.milestone,
      fmv: def.fmv,
      totalLandedCost,
      cgcTier: cgcTierDetails,
      privateCollectorNet,
      auctionNet,
      lcsNet,
      ebayNet,
      netDollarGain,
      roiPercent,
      netGainAfterCarryingCost,
    };
  });

  // Pre-Screen calculation (Minimum Grade 9.8)
  // If missed: $9.00 reject fee + $30.00 return shipping + $5 invoice = $44.00 total
  const preScreenRejectCost = Number((9.0 + 30.0 + 5.0).toFixed(2));
  const fullGradingCost98 = gradeSteps.find((s) => s.grade === 9.8)?.cgcTier.totalGradingFriction ?? 65.0;
  const preScreenSavingsVsFullSlab = Math.max(0, Number((fullGradingCost98 - preScreenRejectCost).toFixed(2)));

  return {
    rawPurchasePrice: rawPrice,
    salesTax,
    paypalFriction,
    inboundShipping,
    outboundShipping,
    pressingFriction,
    sunkRawBasis,
    gradeSteps,
    preScreenRejectCost,
    preScreenSavingsVsFullSlab,
    carryingCostTotal,
    timeHorizonDays,
  };
}
