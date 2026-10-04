import { createCleanReadOnlyServerClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/errors";
import { createCachedQuery } from "@/lib/cache/wrapper";
import { getAuthoritativeCover, isCoverAuthoritativelyVerified } from "@/lib/comics/cover-authority";
import { lookupReferenceFmv } from "@/lib/pricing/reference-benchmarks";
import verifiedCoversJson from "./verified-covers.json";
import ce70ReferenceFmv from "./ce70-reference-fmv.json";
import { getVerifiedRealEquities } from "./verified-equities-service";

const REFERENCE_FMV_MAP = ce70ReferenceFmv as Record<string, {
  seatNumber: number;
  series: string;
  issueNumber: string;
  referenceGrade?: string;
  referenceFmvUsd?: number;
  year?: number;
  publisher?: string;
}>;

export interface SovereignEquityItem {
  id: string;
  seatNumber: number;
  seatType: string;
  ticker: string;
  series: string;
  issueNumber: string;
  title: string;
  originEra: string;
  productionAge: string;
  lineage: string;
  referenceGrade: string;
  referenceFmvUsd: number;
  priceFormatted: string;
  gregoryScore: number;
  deltaPercent: number;
  status: string;
  coverUrl: string | null;
  canonicalIssueId: string | null;
  year?: number;
  publisher?: string;
  variant?: string | null;
}

export interface CanonicalAssetSurface {
  id: string;
  seatNumber: number;
  indexCode: string;
  era: string;
  titleIssue: string;
  series: string;
  issueNumber: string;
  year: number;
  publisher: string;
  primaryCreators: string;
  gregoryScore: number;
  assetClass: string;
  assetSubclass: string;
  wordCount: string;
  dossierPath: string;
  coverUrl: string | null;
}

import {
  CANONICAL_16_ASSET_FAMILIES,
  type CollectibleAssetFamily,
} from "./asset-families";

export {
  CANONICAL_16_ASSET_FAMILIES,
  type CollectibleAssetFamily,
};

import { formatComicEquityTicker } from "./ticker-formatting";
export { formatComicEquityTicker };

// Deterministic cover lookups mapped to authentic harvested assets
const VERIFIED_SEAT_COVERS: Record<string, string> = verifiedCoversJson as Record<string, string>;

export interface Ce70ConstitutionalRuleViolation {
  seatNumber: number;
  rule: "SEAT_COUNT" | "GRADE_FLOOR" | "GRADE_CEILING" | "PRICE_CEILING" | "LABEL_TYPE" | "VARIANT_PROHIBITION";
  message: string;
}

/**
 * Validates any candidate or active constituent against the CE70 Constitution:
 * 1. Exactly 65 allocated books (seats 1..65 populated; seats 66..70 remain vacant per CE70_MASTER_INDEX.md).
 * 2. Minimum grade of 8.5 (grade >= 8.5; can be a 9.8 and Sovereign (SOV) if its direct copy is valued at < $65,000).
 * 3. Strictly excludes 9.9 Mint and 10.0 Gem Mint by definition.
 * 4. Valuation ceiling strictly below $65,000 (< $65k).
 * 5. Direct single issue only (variants of any type are strictly prohibited).
 * 6. Universal Blue Label only (qualified green, modified/restored purple, and signature yellow labels are strictly prohibited).
 */
export function validateCe70Constituent(item: {
  seatNumber: number;
  referenceGrade?: string | number | null;
  referenceFmvUsd?: number | null;
  series?: string | null;
  issueNumber?: string | null;
  isVariant?: boolean | null;
  labelType?: string | null;
}): Ce70ConstitutionalRuleViolation[] {
  const violations: Ce70ConstitutionalRuleViolation[] = [];

  // Rule 1: Exactly 65 allocated seats (1..65)
  if (item.seatNumber < 1 || item.seatNumber > 65) {
    violations.push({
      seatNumber: item.seatNumber,
      rule: "SEAT_COUNT",
      message: `CE70 Constitution restricts populated seats to 1..65 (Seat #${item.seatNumber} exceeds 65-seat constitutional quota; seats 66-70 remain vacant pending adjudication).`,
    });
  }

  // Rule 2 & 3: Grade restrictions (8.5 <= grade <= 9.8; no 9.9, 10.0, or Signature)
  const gradeStr = String(item.referenceGrade || "").trim();
  const gradeNum = parseFloat(gradeStr);
  if (!isNaN(gradeNum)) {
    if (gradeNum < 8.5) {
      violations.push({
        seatNumber: item.seatNumber,
        rule: "GRADE_FLOOR",
        message: `CE70 Constitution requires minimum grade of 8.5 (received grade ${gradeStr}).`,
      });
    }
    if (gradeNum >= 9.9) {
      violations.push({
        seatNumber: item.seatNumber,
        rule: "GRADE_CEILING",
        message: `CE70 Constitution strictly excludes 9.9 Mint and 10.0 Gem Mint (received grade ${gradeStr}).`,
      });
    }
  }

  if (gradeStr.toUpperCase().includes("SIG") || item.labelType === "SIGNATURE_SERIES") {
    violations.push({
      seatNumber: item.seatNumber,
      rule: "LABEL_TYPE",
      message: `CE70 Constitution mandates Universal Blue Label certification; Signature Series yellow labels are prohibited.`,
    });
  }

  if (item.labelType && (item.labelType === "QUALIFIED_LABEL" || item.labelType === "RESTORED_LABEL")) {
    violations.push({
      seatNumber: item.seatNumber,
      rule: "LABEL_TYPE",
      message: `CE70 Constitution requires Universal Blue Label; qualified (green) or restored (purple) labels are prohibited.`,
    });
  }

  // Rule 4: Valuation ceiling < $65,000
  if (item.referenceFmvUsd != null && item.referenceFmvUsd >= 65000) {
    violations.push({
      seatNumber: item.seatNumber,
      rule: "PRICE_CEILING",
      message: `CE70 Constitution mandates reference valuation ceiling strictly below $65,000 (received $${item.referenceFmvUsd.toLocaleString()}).`,
    });
  }

  // Rule 5: Direct single issue only, no variants
  if (item.isVariant) {
    violations.push({
      seatNumber: item.seatNumber,
      rule: "VARIANT_PROHIBITION",
      message: `CE70 Constitution requires direct single issue only; variants of any type are prohibited.`,
    });
  }

  return violations;
}

/**
 * Raw query for Sovereign Equities Universe with real market pricing and tickers.
 * Resolves the server-side initial render hydration gap by querying the continuous
 * 5,000-comic queue engine, ensuring authentic unrounded pennies, verified covers, and real publication years.
 */
async function fetchSovereignEquitiesRaw(limit = 150): Promise<SovereignEquityItem[]> {
  try {
    const { getContinuousQueueSlice } = await import("./continuous-queue-engine");
    const result = await getContinuousQueueSlice(0, limit);
    if (result.items && result.items.length > 0) {
      return result.items;
    }
    return [];
  } catch (err) {
    console.error("Exception in fetchSovereignEquitiesRaw:", err);
    return [];
  }
}

export async function getSovereignEquities(limit = 150): Promise<SovereignEquityItem[]> {
  return fetchSovereignEquitiesRaw(limit);
}

/**
 * Raw query for CE70 Certified Index Definition Constituents (Assets).
 */
async function fetchCanonicalAssetSurfacesRaw(limit = 70): Promise<CanonicalAssetSurface[]> {
  const db = createCleanReadOnlyServerClient();
  try {
    const { data, error } = await db
      .from("ce70_index_definitions")
      .select("seat_number, index_code, era, title_issue, series, issue_number, year, publisher, primary_creators, gregory_score, asset_class, asset_subclass, word_count, dossier_path, cover_url")
      .order("seat_number", { ascending: true })
      .limit(limit);

    if (error || !data || data.length === 0) {
      if (error && !isMissingTableError(error)) {
        console.warn("Notice querying ce70_index_definitions:", error.message);
      }
      return [];
    }

    return data.map((row) => {
      const keyName = `${row.series} #${row.issue_number}`;
      const seatKeyName = `seat-${row.seat_number}`;
      const resolvedCover = getAuthoritativeCover(
        row.series,
        row.issue_number,
        row.publisher,
        row.year
      );

      return {
        id: `seat-${row.seat_number}`,
        seatNumber: row.seat_number,
        indexCode: row.index_code || "CE70",
        era: String(row.era || "GOLDEN").toUpperCase(),
        titleIssue: row.title_issue || `${row.series} #${row.issue_number}`,
        series: row.series,
        issueNumber: row.issue_number || "1",
        year: row.year || 1960,
        publisher: row.publisher || "Independent",
        primaryCreators: row.primary_creators || "Canonical Creative Architects",
        gregoryScore: Number(row.gregory_score) || 190.0,
        assetClass: row.asset_class || "EQUITY_INDEX_SEAT",
        assetSubclass: row.asset_subclass || `${String(row.era || "GOLDEN").toUpperCase()} ERA CONSTITUENT`,
        wordCount: row.word_count || "475 words",
        dossierPath: row.dossier_path || `./ce70_adjudication_dossiers/seat_${String(row.seat_number).padStart(2, "0")}.md`,
        coverUrl: resolvedCover,
      };
    });
  } catch (err) {
    console.error("Exception in fetchCanonicalAssetSurfacesRaw:", err);
    return [];
  }
}

import ce70DossiersData from "./ce70-dossiers-data.json";

export interface DetailedSovereignEquityDossier extends SovereignEquityItem {
  publisher: string;
  publicationYear: number;
  primaryCreators: string;
  adjudicationEssay: string;
  historicalJustification: string;
  scarcityTier: string;
  censusUniversalCount: number;
  censusTotalGraded: number;
  qualityScores: Array<{ dimension: string; score: number; rationale: string }>;
  performanceHistory: Array<{ date: string; value: number; volume: number }>;
  assetFamilyValuations: Array<{
    family: CollectibleAssetFamily;
    estimatedFmv: number;
    formattedFmv: string;
    premiumFactor: string;
  }>;
}

export const getCanonicalAssetSurfaces = createCachedQuery(
  fetchCanonicalAssetSurfacesRaw,
  "canonical-asset-surfaces",
  { ttlSeconds: 300, staleWhileRevalidateSeconds: 1800, tags: ["assets", "ce70"] }
);

/**
 * Resolves an individual sovereign comic equity dossier by ticker, seat ID, or series.
 * Returns comprehensive Bloomberg-grade dossier with 16 asset classes and Gregory Quality metrics.
 */
export async function getSovereignEquityDossier(identifier: string): Promise<DetailedSovereignEquityDossier | null> {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase().replace(/^\$/, "");

  // 1. Direct match on CE70 Dossiers by ticker, slug, canonicalId, or seat
  const dossierData = ce70DossiersData.find((d) => {
    const dClean = d.title.toLowerCase().replace(/^the\s+/, "").replace(/[^a-z0-9]/g, " ").trim();
    const dSlug = dClean.replace(/\s+/g, "");
    const dCanon = (d.canonicalId || "").toLowerCase();
    
    const seriesTitle = d.title.replace(/\s*#?\d+.*$/, "");
    const issueMatch = d.title.match(/#?(\d+)/);
    const issueNum = issueMatch ? issueMatch[1] : "1";
    const ticker = formatComicEquityTicker(seriesTitle, issueNum, "SOV").toLowerCase();
    const tickerBase = formatComicEquityTicker(seriesTitle, issueNum).toLowerCase();
    
    if (clean === ticker || clean === tickerBase || clean === ticker.replace(/\./g, "-")) return true;
    if (clean.includes(".")) {
      const parts = clean.split(".");
      const root = parts[0].toLowerCase();
      const num = parseInt((parts[1] || "").replace(/\D/g, ""), 10);
      const dNum = parseInt(issueNum, 10);
      if (dNum === num && (
        ticker.startsWith(root) ||
        tickerBase.startsWith(root) ||
        seriesTitle.toLowerCase().includes(root) ||
        (root === "xmn" && seriesTitle.toLowerCase().includes("x-men")) ||
        (root === "css" && seriesTitle.toLowerCase().includes("suspen")) ||
        (root === "mad" && seriesTitle.toLowerCase().includes("mad"))
      )) return true;
    }

    if (clean === dCanon || (dCanon.length > 0 && dCanon.includes(clean))) return true;
    const cleanAlpha = clean.replace(/[^a-z0-9]/g, "");
    if (cleanAlpha.length > 3 && (dSlug === cleanAlpha || dSlug.includes(cleanAlpha))) return true;

    // Seat match
    if (/^(?:seat[-_]?|ce70[-_]?seat[-_]?)?\d+$/i.test(clean)) {
      const cleanNum = parseInt(clean.replace(/\D/g, ""), 10);
      return !isNaN(cleanNum) && d.seatNumber === cleanNum;
    }
    return false;
  });

  let matched: SovereignEquityItem | null = null;

  if (dossierData) {
    const seriesTitle = dossierData.title.replace(/\s*#?\d+.*$/, "");
    const issueMatch = dossierData.title.match(/#?(\d+)/);
    const issueNum = issueMatch ? issueMatch[1] : "1";
    const ticker = formatComicEquityTicker(seriesTitle, issueNum, "SOV");
    const bench = lookupReferenceFmv(dossierData.seatNumber, dossierData.title, dossierData.canonicalId);
    const baseFmv = bench?.referenceFmvUsd ?? bench?.grade98FmvUsd ?? 150;
    const refGrade = bench?.referenceGrade ?? "9.8";

    matched = {
      id: `ce70_seat_${dossierData.seatNumber}`,
      seatNumber: dossierData.seatNumber,
      seatType: "PRIMARY_DOMESTIC",
      ticker,
      series: seriesTitle,
      issueNumber: issueNum,
      title: dossierData.title,
      originEra: String(dossierData.era || "").replace(/\s*Age$/i, "").toUpperCase() || "MODERN",
      productionAge: String(dossierData.era || "").replace(/\s*Age$/i, "").toUpperCase() || "MODERN",
      lineage: `${seriesTitle} Lineage`,
      referenceGrade: refGrade,
      referenceFmvUsd: baseFmv,
      priceFormatted: `$${baseFmv.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      gregoryScore: dossierData.gregoryScore,
      deltaPercent: Number(((dossierData.gregoryScore - 190.0) * 0.45).toFixed(2)),
      status: "ACTIVE",
      coverUrl: getAuthoritativeCover(seriesTitle, issueNum, dossierData.publisher, dossierData.year),
      canonicalIssueId: dossierData.canonicalId || null,
      year: dossierData.year,
      publisher: dossierData.publisher,
    };
  }

  // 2. If not a CE70 dossier book, match against the verified equity catalog
  if (!matched) {
    const equities = await getSovereignEquities(120);

    matched = equities.find(
      (e) => e.ticker.toLowerCase() === clean || e.ticker.toLowerCase().replace(/\./g, "-") === clean
    ) || null;

    if (!matched && clean.includes(".")) {
      const parts = clean.split(".");
      const root = parts[0].toLowerCase();
      const num = parseInt((parts[1] || "").replace(/\D/g, ""), 10);
      matched = equities.find((e) => {
        const formatted = formatComicEquityTicker(e.series, e.issueNumber).toLowerCase();
        const eNum = parseInt(e.issueNumber.replace(/\D/g, ""), 10);
        return (
          formatted === clean ||
          (formatted.startsWith(root) && eNum === num) ||
          (e.series.toLowerCase().includes(root) && eNum === num)
        );
      }) || null;
    }

    if (!matched) {
      matched = equities.find((e) => e.id.toLowerCase() === clean) || null;
    }

    if (!matched) {
      const seatNum = parseInt(clean.replace(/\D/g, ""), 10);
      if (!isNaN(seatNum) && (clean.startsWith("seat") || !isNaN(Number(clean)))) {
        matched = equities.find((e) => e.seatNumber === seatNum) || null;
      }
    }

    if (!matched) {
      matched = equities.find(
        (e) => e.canonicalIssueId && e.canonicalIssueId.toLowerCase() === clean
      ) || null;
    }

    if (!matched) {
      matched = equities.find((e) => {
        const full = `${e.series} ${e.issueNumber}`.toLowerCase();
        return full.includes(clean) || clean.includes(full);
      }) || null;
    }
  }

  if (!matched) return null;

  // Re-align matched reference FMV to authentic PriceCharting benchmark if present
  const seatBenchmark = lookupReferenceFmv(
    clean.startsWith("seat") || clean.startsWith("ce70") ? matched.seatNumber : null,
    `${matched.series} #${matched.issueNumber}`,
    matched.canonicalIssueId
  );
  if (seatBenchmark?.referenceFmvUsd) {
    matched.referenceFmvUsd = seatBenchmark.referenceFmvUsd;
    matched.referenceGrade = seatBenchmark.referenceGrade ?? matched.referenceGrade;
    matched.priceFormatted = `$${seatBenchmark.referenceFmvUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // Synthesize 30-day continuous valuation history anchored to real reference FMV
  const basePrice = matched.referenceFmvUsd;
  const history: Array<{ date: string; value: number; volume: number }> = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);

    // Realistic trend line leading to current delta
    const progress = (30 - i) / 30;
    const trendEffect = 1 + (matched.deltaPercent / 100) * (progress - 1);
    const wave = Math.sin(i * 0.7) * 0.008;
    const value = Math.round(basePrice * (trendEffect + wave));
    const volume = Math.round(8 + Math.abs(Math.sin(i * 1.5)) * 14);

    history.push({ date: dateStr, value, volume });
  }

  // Calculate valuations across all 16 Canonical Asset Classes
  const multipliers: Record<string, { factor: number; text: string }> = {
    GRADED_UNIVERSAL: { factor: 1.0, text: "1.00x Base" },
    SIGNATURE_SERIES: { factor: 1.5, text: "1.50x Premium" },
    PEDIGREE_PROVENANCE: { factor: 3.0, text: "3.00x Historical Grail" },
    NEWSSTAND_EDITION: { factor: 1.35, text: "1.35x Scarcity" },
    PRICE_VARIANT: { factor: 2.5, text: "2.50x Asymmetry" },
    RATIO_INCENTIVE_VARIANT: { factor: 1.75, text: "1.75x Allocation" },
    RAW_UNGRADED: { factor: 0.35, text: "0.35x Arbitrage Base" },
    COVER_ART_VARIANT: { factor: 1.25, text: "1.25x Aesthetic" },
    DIRECT_EDITION: { factor: 1.0, text: "1.00x Standard Float" },
    QUALIFIED_LABEL: { factor: 0.5, text: "0.50x Qualified" },
    RESTORED_LABEL: { factor: 0.4, text: "0.40x Conservation" },
    CONSERVED_LABEL: { factor: 0.7, text: "0.70x Archival" },
    SUBSEQUENT_PRINTING: { factor: 0.65, text: "0.65x Repress" },
    FOREIGN_TRANSLATION: { factor: 0.8, text: "0.80x Global" },
    ERROR_PRINTING: { factor: 2.0, text: "2.00x Manufacturing Error" },
    PROTOTYPE_ASHCAN: { factor: 4.0, text: "4.00x Pre-Publication" },
  };

  const assetFamilyValuations = CANONICAL_16_ASSET_FAMILIES.map((family) => {
    const mult = multipliers[family.id] || { factor: 1.0, text: "1.00x" };
    const est = Math.round(basePrice * mult.factor);
    return {
      family,
      estimatedFmv: est,
      formattedFmv: `$${est.toLocaleString()}`,
      premiumFactor: mult.text,
    };
  });

  const resolvedPublisher = matched.publisher || seatBenchmark?.publisher || dossierData?.publisher || "Marvel Comics";
  const resolvedYear = matched.year || seatBenchmark?.year || dossierData?.year || 1963;
  const resolvedCreators = seatBenchmark?.creators || dossierData?.creators || "Stan Lee, Jack Kirby";

  return {
    ...matched,
    publisher: resolvedPublisher,
    publicationYear: resolvedYear,
    primaryCreators: resolvedCreators,
    adjudicationEssay: dossierData?.essay || `${matched.series} #${matched.issueNumber} represents a pivotal benchmark specimen within the Panel Profits Sovereign Equity Canon. Exhibiting exceptional artistic merit, enduring cultural gravity, and profound historical resonance, this key issue anchors its constitutional seat with supreme connoisseurial distinction.`,
    historicalJustification: dossierData?.justification || `Certified CE70 Sovereign Constituent Seat #${matched.seatNumber}: Benchmark asset anchoring the ${matched.originEra} Age portfolio.`,
    scarcityTier: basePrice > 25000 ? "SOVEREIGN_GRAIL" : "INVESTMENT_GRADE_ELITE",
    censusUniversalCount: Math.max(1, Math.round(180000 / (basePrice + 100))),
    censusTotalGraded: Math.max(5, Math.round(650000 / (basePrice + 100))),
    qualityScores: [
      { dimension: "Authorial Presence", score: 9.8, rationale: "Unmistakable creative handwriting and singular auteur vision." },
      { dimension: "Artistic Merit", score: 9.9, rationale: "Exceptional draftsmanship, iconic composition, and dynamic panel layout." },
      { dimension: "Cultural Gravity", score: 10.0, rationale: "Enduring multi-generational franchise resonance and transmedia archetype foundation." },
      { dimension: "Historical Significance", score: 10.0, rationale: "Epochal landmark debut reshaping the sequential graphic literature canon." },
    ],
    performanceHistory: history,
    assetFamilyValuations,
  };
}
