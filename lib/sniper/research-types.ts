import type { StorySummary } from "@/lib/comics/story-summary";
import type { ListingWriteup } from "./listing-writeup";
import type { GradeCensus } from "./census-population";
import type { SaleObs } from "./candles";
import type { SniperVideo } from "./videos";
export interface StoredPrice {
  grade: string; amount: number; source: string; url: string; currency: string;
  observedAt?: string; kind: "guide" | "sale" | "catalog"; basis: string; publicationDate?: string;
}
export interface LocalLotResearch {
  story: StorySummary | null; census: GradeCensus | null; prices: StoredPrice[];
  ppcfId: string | null; missing: string[];
}
export interface LotResearch {
  version: 2;
  identity: { itemId: string; title: string; series: string; issue: string; year: number | null; publisher: string | null; edition: string | null; grade: number | null; grader: string | null };
  writeup: ListingWriteup | null; story: StorySummary | null; localResearch: LocalLotResearch;
  guideHistory?: import("./guide-history").GuidePoint[];
  sales: SaleObs[]; videos: SniperVideo[];
  history: { available: boolean; message: string; checkedAt?: string; hasMore?: boolean };
  state: "ready" | "pending"; researchError: null;
}
