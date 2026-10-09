export interface TickerMarketRegime {
  fourStateRegime: 'CALM' | 'NORMAL' | 'ELEVATED' | 'PANIC';
  tectonicTier: number;
  stressIndex: number | null;
  principalOverlayActive: boolean;
  principalOverlayTier: number;
  principalOverlayRemaining: number;
}

/** Slim wire format — only the 15 fields EquityCard actually renders. */
export interface LadderSpot {
  /** Grade label (RAW, 4.0 … 10.0) or a year label for ComicBase yearly values. */
  label: string;
  usd: number;
}

export interface EquityItem {
  entryId: string;
  coverImageUrl: string | null;
  /** Panel Profits grade ladder: every grade price the pp source published for this book. */
  ppLadder?: LadderSpot[];
  /** ComicBase published values for this book: current price plus the four yearly values. */
  comicbaseSpots?: LadderSpot[];
  pricing: {
    fmv_usd: number;
    grade: string | null;
    delta_24: number | null;
    delta_30: number | null;
    delta_90: number | null;
    asset_class: string | null;
  };
  identity: {
    assetId: string;
    productName: string | null;
    year: number | null;
    publisher: string | null;
    variant: string | null;
    productionAge: string;
    scarcityTier: string;
    detailUrl: string;
    assetClass: 'SOV' | 'PREMIUM' | 'STD' | 'OTC' | 'UNICORN_CALL' | null;
    marketPriceClass: string | null;
    isSovereign: boolean | null;
    certificationState: string | null;
    editionForm: string | null;
    coverVerified: boolean;
    yearDivergence: boolean;
    coverSuppressReason: string | null;
    identityConfidence: number | null;
    quarantined?: boolean;
    writer?: string | null;
    penciler?: string | null;
    keyBadge?: string | null;
    genre?: string | null;
  };
}

export interface EquityResponse {
  surface: string;
  tickId: number;
  marketRegime: TickerMarketRegime | null;
  showing: number;
  totalEligible: number;
  totalInQueue: number;
  offset: number;
  nextOffset: number;
  hasMore: boolean;
  items: EquityItem[];
  eraTotals?: Record<string, number>;
  scarcityTotals?: Record<string, number>;
}
