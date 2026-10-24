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
  creatorSigningFeeCertainty?: "guesstimate" | "venue_confirmed";
  creatorSigningFeeNote?: string;
  creatorSigningFeeRange?: [number, number];
  invoiceFee: number;
  serviceTax: number;
  taxRatePercent: number;
  shippingHandlingFee: number;
  slabbingCostFloor: number;
  estimatedRawBasis: number;
  mailerBoxFee: number;
  sellerTotalCostBasis: number;
  buyerReplacementCost?: number;
  wholeTomatoSpread?: number;
  venueFeeDragPercent: number;
  breakevenSalePrice: number;
}
export interface VariantCoverInfo {
  name: string;
  type: "Direct Edition" | "Newsstand" | "2nd Printing" | "3rd Printing" | "Foil" | "Virgin" | "Retailer Incentive" | "Variant";
  artist?: string;
  ratio?: string;
  upcBarcode?: string;
  censusFloatNotes?: string;
  rarityTier?: "Standard" | "Scarce" | "Very Scarce" | "Very Rare" | "Grail";
  estMultiplierVsDirect?: number;
}

export interface ContinuityLinksInfo {
  precededBy?: { title: string; issueNumber?: string; url?: string; note?: string };
  succeededBy?: { title: string; issueNumber?: string; url?: string; note?: string };
  callbacks?: Array<{ title: string; note: string; url?: string }>;
  milestones?: string[];
}

export interface CompsDriftInfo {
  trend: "strong" | "steady" | "soft" | "rebound";
  label: string; // e.g. "↗ Strong", "→ Steady", "↘ Soft", "↗ Rebound"
  pctChange: number; // e.g. +14, -8, +2, +11
  points: number[]; // Distinct trailing comp points for the sparkline
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
  storyTitle?: string;
  storyQuote?: { quote: string; speaker: string };
  creativeCredits?: {
    writer?: string;
    penciler?: string;
    inker?: string;
    colorist?: string;
    letterer?: string;
    editor?: string;
    editorInChief?: string;
    coverArtist?: string;
  };
  characterRoster?: {
    featured?: string[];
    supporting?: string[];
    antagonists?: string[];
    other?: string[];
  };
  synopsisParagraphs?: string[];
  fandomUrl?: string;
  fandomUniverse?: string;
  categories?: string[];
  notes?: string[];
  continuityLinks?: ContinuityLinksInfo;
  variantCovers?: VariantCoverInfo[];
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
  venue?: "ebay" | "heritage" | "mycomicshop" | "comiclink" | "comicconnect" | "hipcomic";
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
  compsDrift?: CompsDriftInfo;
  chartPoints: Array<{ time: string; value: number }>;
  candlestickPoints?: Array<{
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
  historicalComps?: Array<{
    time: string;
    price: number;
    venue: "Heritage" | "eBay" | "ComicLink" | "ComicConnect" | "MyComicShop";
    venueType: "pedigree" | "street_floor" | "institutional";
    grade: string;
    notes?: string;
  }>;
  marketCycles?: {
    peak2021Price: number;
    trough2023Price: number;
    currentFloorPrice: number;
    peakDate: string;
    troughDate: string;
    cycleDrawdownPct: number;
    recoveryPct: number;
    heritagePremiumPct: number;
    ebayFloorDiscountPct: number;
    peakLabel?: string;
    troughLabel?: string;
  };
  // Encasement Breakeven & Multi-Formula Invoicing
  isYellowLabel: boolean;
  creatorName?: string;
  signatureDetails: string | null;
  baseGradingFee: number;
  pressingFee: number;
  witnessFee: number;
  creatorSigningFee: number;
  creatorSigningFeeCertainty?: "guesstimate" | "venue_confirmed";
  creatorSigningFeeNote?: string;
  creatorSigningFeeRange?: [number, number];
  invoiceFee: number;
  serviceTax: number;
  shippingHandlingFee: number;
  slabbingCostFloor: number;
  estimatedRawBasis: number;
  sellerTotalCostBasis: number;
  buyerReplacementCost?: number;
  breakevenSalePrice: number;
  isBelowGradingCost: boolean;
  sellerSubsidizedAmount: number;
  buyerManufacturingAdvantage?: number;
  wholeTomatoSpread?: number;
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
  // GoCollect 30 / 60 / 90-Day Trailing Velocity across CGC, CBCS, PSA
  trailingVelocity?: {
    d30: { avgPrice: number; volume: number; cgc: number; cbcs: number; psa: number; trendPct: number };
    d60: { avgPrice: number; volume: number; cgc: number; cbcs: number; psa: number; trendPct: number };
    d90: { avgPrice: number; volume: number; cgc: number; cbcs: number; psa: number; trendPct: number };
  };
  // GoCollect CPI Era Index (Top 250 Keys) & Macro CE 70 / PPIX 100 Comparison
  macroComparison?: {
    eraName: string;
    eraCpiSlug: string;
    eraMonthlyChangePct: number;
    bookMonthlyChangePct: number;
    spreadVsEraPct: number;
    outperforming: boolean;
    ce70MonthlyChangePct: number;
    ppix100MonthlyChangePct: number;
  };
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

export interface BidEvent {
  timestamp: number;
  bidder: "user" | "rival" | "floor";
  amount: number;
  clockSecs: number;
  note?: string;
}

export interface StickyLotBid {
  lotId: string;
  lot: LotItem;
  userBid: number;
  currentBid: number;
  timeRemaining: number;
  hammerPrice: number;
  status: "leading" | "outbid" | "won" | "lost" | "chickened_out";
  bidHistory: BidEvent[];
  rival30sTriggered?: boolean;
  rival5sTriggered?: boolean;
  rival1sTriggered?: boolean;
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
  stickyBids: StickyLotBid[];
  vault: WonBook[];
  history: RoundHistoryItem[];
}

