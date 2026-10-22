export type GameRole = "broker" | "whale";

export type BrokerLevel = 1 | 2 | 3;

export type EncasementFormulaKey = "pressed" | "standard" | "signature" | "reholder";

export interface EncasementFormulaDetail {
  key: EncasementFormulaKey;
  name: string;
  badgeLabel: string;
  description: string;
  isYellowLabel: boolean;
  baseGradingFee: number;
  pressingFee: number;
  witnessFee: number;
  creatorSigningFee: number;
  invoiceFee: number;
  serviceTax: number;
  taxRatePercent: number;
  shippingHandlingFee: number;
  slabbingCostFloor: number;
  estimatedRawBasis: number;
  mailerBoxFee: number;
  sellerTotalCostBasis: number;
  venueFeeDragPercent: number;
  breakevenSalePrice: number;
}

export interface LotItem {
  id: string;
  title: string;
  series: string;
  issueNumber: string;
  coverUrl: string;
  galleryImages?: string[];
  grade: string;
  grader: "CGC" | "CBCS" | "PSA";
  era?: string;
  eraDisplayName?: string;
  isHighGradeOnly?: boolean;
  certNumber: string;
  certVerificationUrl: string;
  fmv: number;
  openingBid: number;
  currentBid: number;
  hammerPrice: number;
  summary: string;
  whyInvest: string;
  spreadRawTo98: number | null;
  ratio96To98: number | null;
  salesVolume: number | null;
  volumeFrequency?: string;
  videos?: Array<{ source?: string; title: string; url: string }> | null;
  cgcCensus: number | null;
  lastSoldDate: string;
  isStaleComp: boolean;
  staleCompAgeDays: number;
  investopediaSlug: string;
  venue?: "ebay" | "heritage" | "mycomicshop" | "comiclink" | "comicconnect";
  venueDisplayName?: string;
  venueLotId?: string;
  sourceListingUrl?: string;
  priceLadder: {
    raw: number | null;
    grade40: number | null;
    grade60: number | null;
    grade80: number | null;
    grade92: number | null;
    grade94: number | null;
    grade96: number | null;
    grade98: number | null;
    grade100: number | null;
  };
  chartPoints: Array<{ time: string; value: number }>;
  // Encasement Breakeven & Multi-Formula Invoicing
  isYellowLabel: boolean;
  signatureDetails: string | null;
  baseGradingFee: number;
  pressingFee: number;
  witnessFee: number;
  creatorSigningFee: number;
  invoiceFee: number;
  serviceTax: number;
  shippingHandlingFee: number;
  slabbingCostFloor: number;
  estimatedRawBasis: number;
  sellerTotalCostBasis: number;
  breakevenSalePrice: number;
  isBelowGradingCost: boolean;
  sellerSubsidizedAmount: number;
  activeFormulaKey: EncasementFormulaKey;
  formulas: Record<EncasementFormulaKey, EncasementFormulaDetail>;
  exitScenarios: Record<string, ExitScenario>;
  // Live Auction Rail Tickers & Dynamic Staggered Expirations
  secondsRemaining?: number;
  totalDurationSeconds?: number;
  endsAt?: string;
  lotStatus?: "active" | "hot" | "ended" | "replacing";
  // Multi-Grade Recorded Sales Observations (e.g. 9 sales @ 9.8, 2 @ 9.6, 5 @ 9.4)
  multiGradeSales?: Array<{
    grade: string;
    label: string;
    salesCount: number;
    price: number;
    lastCompDate: string;
    color: string;
  }>;
}

export interface ExitScenario {
  channelKey: "marketplace" | "collector" | "lcs" | "auction";
  name: string;
  venue: string;
  description: string;
  liquidationVelocity: string;
  grossResalePrice: number;
  platformFeeRatePercent: number;
  platformFeeAmount: number;
  packagingMailerFee: number;
  netProceeds: number;
  netProfit: number;
  roiPercent: number;
  isProfitable: boolean;
}

export type RoundStatus =
  | "research"
  | "bidding"
  | "lockout"
  | "chickened_out"
  | "hammer_won"
  | "hammer_lost"
  | "passed";

export interface WonBook extends LotItem {
  purchaseCost: number;
  wonAt: string;
}

export interface RoundHistoryItem {
  lotTitle: string;
  grade: string;
  grader: string;
  certNumber: string;
  result: "WON" | "LOST" | "CHICKENED_OUT" | "PASSED";
  userBid: number | null;
  hammerPrice: number;
  fmv: number;
  profit: number;
  investopediaSlug: string;
  date: string;
}

export interface SimGameState {
  role: GameRole | null;
  bankroll: number;
  startingBankroll: number;
  brokerLevel: BrokerLevel;
  roundNumber: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  netRoi: number;
  totalProfit: number;
  currentLot: LotItem | null;
  roundStatus: RoundStatus;
  userBid: number | null;
  timeRemaining: number;
  vault: WonBook[];
  history: RoundHistoryItem[];
}
