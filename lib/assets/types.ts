import type { SurfaceKey } from './surfaceConfig';

export interface AssetItem {
  entryId: string;
  assetId?: string;
  assetType: string;
  displayRank?: number;
  diversityBucket?: string;
  symbol: string;
  displayName: string;
  description?: string;
  universe?: string | null;
  pricing: Record<string, any>;
  risk?: Record<string, any>;
  liquidity?: Record<string, any>;
  parameters?: Record<string, any>;
  valueUnit?: string;
  detailUrl?: string;
  coverImageUrl?: string | null;
  coverProductName?: string | null;
  identityYear?: number | null;
  coverVerified?: boolean;
  quarantined?: boolean;
}

export interface SurfaceData {
  showing: number;
  totalInQueue: number;
  items: AssetItem[];
}

export interface AssetResponse {
  tickId: number;
  totalShowing: number;
  totalEligible: number;
  surfaces: Partial<Record<SurfaceKey, SurfaceData>>;
}
