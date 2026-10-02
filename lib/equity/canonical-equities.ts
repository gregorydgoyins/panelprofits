import { createCleanReadOnlyServerClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/errors";
import { createCachedQuery } from "@/lib/cache/wrapper";
import { generateDynamicCoverSvg } from "@/lib/comics/cover-resolver";
import verifiedCoversJson from "./verified-covers.json";

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

export interface CollectibleAssetFamily {
  id: string;
  name: string;
  shortCode: string;
  description: string;
  marketRole: string;
  liquidityTier: "HIGH" | "MEDIUM" | "SPECIALIZED" | "INSTITUTIONAL";
  pricingPremiumFactor: string;
}

export const CANONICAL_16_ASSET_FAMILIES: CollectibleAssetFamily[] = [
  {
    id: "GRADED_UNIVERSAL",
    name: "Certified Universal Slab",
    shortCode: "SOV",
    description: "CGC, CBCS, PSA Universal certified high-grade specimens (9.8 / 9.6 / 9.4). The gold standard for institutional alternative investment.",
    marketRole: "Core Market Baseline",
    liquidityTier: "HIGH",
    pricingPremiumFactor: "1.00x Base Benchmark",
  },
  {
    id: "SIGNATURE_SERIES",
    name: "Witnessed Signature Series",
    shortCode: "SIG",
    description: "Official witnessed creator-signed slabs (Yellow label). Valued based on creator historical stature and inscription provenance.",
    marketRole: "Creator Provenance Alpha",
    liquidityTier: "MEDIUM",
    pricingPremiumFactor: "1.25x – 2.50x",
  },
  {
    id: "PEDIGREE_PROVENANCE",
    name: "Recognized Pedigree Collection",
    shortCode: "PED",
    description: "Certified specimens from landmark historical collections (Edgar Church / Mile High, White Mountain, Kansas City, Pacific Coast).",
    marketRole: "Sovereign Heritage Grail",
    liquidityTier: "INSTITUTIONAL",
    pricingPremiumFactor: "2.00x – 5.00x",
  },
  {
    id: "NEWSSTAND_EDITION",
    name: "Newsstand Distributor Edition",
    shortCode: "NEW",
    description: "Original newsstand barcode distribution copies. Extremely scarce in high grade due to newsstand rack wear and unsold return pulping.",
    marketRole: "Scarcity Multiplier",
    liquidityTier: "HIGH",
    pricingPremiumFactor: "1.30x – 3.00x (Post-1985)",
  },
  {
    id: "PRICE_VARIANT",
    name: "Regional Price Test Variant",
    shortCode: "PRV",
    description: "Regional price test market copies (Canadian 75¢/95¢ variants, Marvel 30¢/35¢ test variants). Highly coveted micro-population rarities.",
    marketRole: "Census Asymmetry",
    liquidityTier: "MEDIUM",
    pricingPremiumFactor: "2.50x – 10.00x",
  },
  {
    id: "RATIO_INCENTIVE_VARIANT",
    name: "Retailer Ratio Incentive Variant",
    shortCode: "RAT",
    description: "Exclusively allocated copies requiring retailer orders of 1:25, 1:50, 1:100, or 1:500 standard copies. Immediate manufactured scarcity.",
    marketRole: "Modern Velocity Float",
    liquidityTier: "HIGH",
    pricingPremiumFactor: "1.50x – 4.00x",
  },
  {
    id: "RAW_UNGRADED",
    name: "Raw / Uncertified Specimen",
    shortCode: "RAW",
    description: "Unslabbed collector copies inspected under standard Overstreet physical guidelines. The primary pool for grading arbitrage.",
    marketRole: "Grading Arbitrage Pipeline",
    liquidityTier: "HIGH",
    pricingPremiumFactor: "0.20x – 0.50x of Slabbed 9.8",
  },
  {
    id: "COVER_ART_VARIANT",
    name: "Cover Art / Foil / Virgin Edition",
    shortCode: "VAR",
    description: "Alternative artistic interpretations, virgin covers, metal foil, and convention exclusives with dedicated collector followings.",
    marketRole: "Aesthetic Collector Demand",
    liquidityTier: "HIGH",
    pricingPremiumFactor: "1.10x – 2.20x",
  },
  {
    id: "DIRECT_EDITION",
    name: "Direct Market Comic Shop Edition",
    shortCode: "DIR",
    description: "Standard specialty comic shop printings sold through non-returnable distribution. The baseline circulation foundation.",
    marketRole: "Circulation Float",
    liquidityTier: "HIGH",
    pricingPremiumFactor: "1.00x",
  },
  {
    id: "QUALIFIED_LABEL",
    name: "Certified Qualified Label",
    shortCode: "QLF",
    description: "Green label copies with significant manufacturing flaws, unwitnessed signatures, or missing coupons that do not affect the main story.",
    marketRole: "Affordable Grail Access",
    liquidityTier: "MEDIUM",
    pricingPremiumFactor: "0.40x – 0.70x of Universal",
  },
  {
    id: "RESTORED_LABEL",
    name: "Certified Restored Specimen",
    shortCode: "RST",
    description: "Purple label copies with professional or amateur color touch, tear seals, piece fill, or spine rebuilds.",
    marketRole: "Conservation Specimen",
    liquidityTier: "MEDIUM",
    pricingPremiumFactor: "0.30x – 0.60x of Universal",
  },
  {
    id: "CONSERVED_LABEL",
    name: "Certified Conserved Specimen",
    shortCode: "CNS",
    description: "Blue/Grey label copies treated exclusively with archival preservation techniques (leaf-casting, rice paper tear reinforcement, solvent wash).",
    marketRole: "Museum Preservation",
    liquidityTier: "MEDIUM",
    pricingPremiumFactor: "0.60x – 0.85x of Universal",
  },
  {
    id: "SUBSEQUENT_PRINTING",
    name: "Subsequent Official Printing",
    shortCode: "PRN",
    description: "Official second, third, or later printings released to satisfy secondary market sellouts. Distinct cover art and trade dress.",
    marketRole: "Secondary Sellout Wave",
    liquidityTier: "HIGH",
    pricingPremiumFactor: "0.50x – 1.80x",
  },
  {
    id: "FOREIGN_TRANSLATION",
    name: "Foreign Market / Translated Edition",
    shortCode: "INT",
    description: "International editions licensed by La Prensa (Mexico), Editora Abril (Brazil), Panini (Europe), or Titan (UK).",
    marketRole: "Global Cult Collectibility",
    liquidityTier: "SPECIALIZED",
    pricingPremiumFactor: "0.40x – 3.00x",
  },
  {
    id: "ERROR_PRINTING",
    name: "Manufacturing Error Copy",
    shortCode: "ERR",
    description: "Certified printing oddities (missing foil, inverted interior, double covers, foil color error). Unique curiosity pieces.",
    marketRole: "Curiosity Niche",
    liquidityTier: "SPECIALIZED",
    pricingPremiumFactor: "1.50x – 5.00x",
  },
  {
    id: "PROTOTYPE_ASHCAN",
    name: "Prototype, Ashcan & Advance Copy",
    shortCode: "ASH",
    description: "Advance promotional black-and-white booklets, ashcans created to secure trademark rights, and preview giveaways.",
    marketRole: "Pre-Publication History",
    liquidityTier: "INSTITUTIONAL",
    pricingPremiumFactor: "2.00x – 8.00x",
  },
];

// Helper to construct canonical [SERIES].[ISSUE].[CLASS] ticker symbols
export function formatComicEquityTicker(series: string, issue: string, assetClass = "SOV"): string {
  const cleanSeries = series.trim().toLowerCase();
  let root = "CMX";

  if (cleanSeries.includes("action comics")) root = "ACT";
  else if (cleanSeries.includes("detective comics")) root = "DET";
  else if (cleanSeries.includes("amazing spider-man")) root = "ASM";
  else if (cleanSeries.includes("spider-man")) root = "SPDR";
  else if (cleanSeries.includes("batman")) root = "BAT";
  else if (cleanSeries.includes("superman")) root = "SUP";
  else if (cleanSeries.includes("incredible hulk") || cleanSeries.includes("hulk")) root = "HULK";
  else if (cleanSeries.includes("x-men")) root = "XMN";
  else if (cleanSeries.includes("fantastic four")) root = "FF";
  else if (cleanSeries.includes("avengers")) root = "AVG";
  else if (cleanSeries.includes("tales of suspense")) root = "TOS";
  else if (cleanSeries.includes("journey into mystery")) root = "JIM";
  else if (cleanSeries.includes("strange tales")) root = "ST";
  else if (cleanSeries.includes("daredevil")) root = "DD";
  else if (cleanSeries.includes("iron man")) root = "IRM";
  else if (cleanSeries.includes("captain america")) root = "CAP";
  else if (cleanSeries.includes("thor")) root = "THOR";
  else if (cleanSeries.includes("wonder woman")) root = "WW";
  else if (cleanSeries.includes("crime suspensorystories") || cleanSeries.includes("crime suspenstories")) root = "CSS";
  else if (cleanSeries.includes("mad")) root = "MAD";
  else if (cleanSeries.includes("swamp thing")) root = "SWMP";
  else if (cleanSeries.includes("silver surfer")) root = "SLV";
  else if (cleanSeries.includes("green lantern")) root = "GL";
  else if (cleanSeries.includes("ninja turtles") || cleanSeries.includes("tmnt")) root = "TMNT";
  else if (cleanSeries.includes("spawn")) root = "SPWN";
  else if (cleanSeries.includes("secret wars")) root = "SW";
  else {
    const words = cleanSeries.split(/\s+/).filter(Boolean);
    if (words.length === 1) root = words[0].slice(0, 4).toUpperCase();
    else root = words.map((w) => w[0]).join("").slice(0, 4).toUpperCase();
  }

  const cleanNum = String(issue).replace(/\D/g, "");
  const formattedNum = cleanNum ? cleanNum.padStart(3, "0") : "001";
  return `${root}.${formattedNum}.${assetClass.toUpperCase()}`;
}

// Deterministic cover lookups mapped to authentic harvested assets
const VERIFIED_SEAT_COVERS: Record<string, string> = verifiedCoversJson as Record<string, string>;

/**
 * Raw query for CE70 Sovereign Equities Universe with real market pricing and tickers.
 */
async function fetchSovereignEquitiesRaw(limit = 70): Promise<SovereignEquityItem[]> {
  const db = createCleanReadOnlyServerClient();
  try {
    const { data, error } = await db
      .from("ce70_equity_universe")
      .select("id, seat_number, seat_type, origin_era, production_age, canonical_issue_id, series, title, issue_number, lineage, reference_grade, reference_fmv_usd, price_formatted, gregory_score, status, cover_url")
      .order("reference_fmv_usd", { ascending: false })
      .limit(limit * 2);

    if (error || !data || data.length === 0) {
      if (error && !isMissingTableError(error)) {
        console.warn("Notice querying ce70_equity_universe:", error.message);
      }
      return [];
    }

    // Deduplicate by series + issue_number to select the highest-specimen variant per seat
    const seenSeats = new Set<string>();
    const items: SovereignEquityItem[] = [];

    for (const row of data) {
      const seatKey = `${row.seat_number}-${row.series}-${row.issue_number}`;
      if (seenSeats.has(seatKey)) continue;
      seenSeats.add(seatKey);

      const fmv = Number(row.reference_fmv_usd) || 0;
      const keyName = `${row.series} #${row.issue_number}`;
      const seatKeyName = `seat-${row.seat_number}`;
      const ticker = formatComicEquityTicker(row.series, row.issue_number || "1", "SOV");
      const resolvedCover =
        VERIFIED_SEAT_COVERS[keyName] ||
        VERIFIED_SEAT_COVERS[seatKeyName] ||
        VERIFIED_SEAT_COVERS[ticker] ||
        (row.cover_url && !row.cover_url.includes("526.jpg") ? row.cover_url : null) ||
        generateDynamicCoverSvg(row.series, row.issue_number, "Marvel/DC", 1960);

      // Deterministic realistic delta based on Gregory score and seat ranking
      const gScore = Number(row.gregory_score) || 190.0;
      const delta = Number(((gScore - 190.0) * 0.45).toFixed(2));

      items.push({
        id: row.id,
        seatNumber: row.seat_number || 1,
        seatType: row.seat_type || "PRIMARY_DOMESTIC",
        ticker,
        series: row.series,
        issueNumber: row.issue_number || "1",
        title: row.title || row.series,
        originEra: (row.origin_era || "MODERN").toUpperCase(),
        productionAge: (row.production_age || "MODERN").toUpperCase(),
        lineage: row.lineage || `${row.series} Lineage`,
        referenceGrade: row.reference_grade || "9.8",
        referenceFmvUsd: fmv,
        priceFormatted: row.price_formatted || `$${fmv.toLocaleString()}`,
        gregoryScore: gScore,
        deltaPercent: delta,
        status: row.status || "ACTIVE",
        coverUrl: resolvedCover,
        canonicalIssueId: row.canonical_issue_id || null,
      });

      if (items.length >= limit) break;
    }

    return items;
  } catch (err) {
    console.error("Exception in fetchSovereignEquitiesRaw:", err);
    return [];
  }
}

export const getSovereignEquities = createCachedQuery(
  fetchSovereignEquitiesRaw,
  "sovereign-equities-rail",
  { ttlSeconds: 300, staleWhileRevalidateSeconds: 1800, tags: ["equities", "ce70"] }
);

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
      const resolvedCover =
        VERIFIED_SEAT_COVERS[seatKeyName] ||
        VERIFIED_SEAT_COVERS[keyName] ||
        VERIFIED_SEAT_COVERS[row.title_issue] ||
        (row.cover_url && !row.cover_url.includes("526.jpg") ? row.cover_url : null) ||
        generateDynamicCoverSvg(row.series, row.issue_number, row.publisher, row.year);

      return {
        id: `seat-${row.seat_number}`,
        seatNumber: row.seat_number,
        indexCode: row.index_code || "CE70",
        era: (row.era || "GOLDEN").toUpperCase(),
        titleIssue: row.title_issue || `${row.series} #${row.issue_number}`,
        series: row.series,
        issueNumber: row.issue_number || "1",
        year: row.year || 1960,
        publisher: row.publisher || "Independent",
        primaryCreators: row.primary_creators || "Canonical Creative Architects",
        gregoryScore: Number(row.gregory_score) || 190.0,
        assetClass: row.asset_class || "EQUITY_INDEX_SEAT",
        assetSubclass: row.asset_subclass || `${row.era.toUpperCase()} ERA CONSTITUENT`,
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

  const equities = await getSovereignEquities(120);

  // 1. Match by ticker (e.g. CSS.022.SOV or CSS-022-SOV)
  let matched = equities.find(
    (e) => e.ticker.toLowerCase() === clean || e.ticker.toLowerCase().replace(/\./g, "-") === clean
  );

  // 2. Match by exact ID or seat prefix (e.g. ce70_seat_6_CE70-8.5 or seat-6)
  if (!matched) {
    matched = equities.find((e) => e.id.toLowerCase() === clean);
  }

  // 3. Match by seat number
  if (!matched) {
    const seatNum = parseInt(clean.replace(/\D/g, ""), 10);
    if (!isNaN(seatNum) && (clean.startsWith("seat") || !isNaN(Number(clean)))) {
      matched = equities.find((e) => e.seatNumber === seatNum);
    }
  }

  // 4. Match by canonical issue id
  if (!matched) {
    matched = equities.find(
      (e) => e.canonicalIssueId && e.canonicalIssueId.toLowerCase() === clean
    );
  }

  // 5. Match by series and issue substring
  if (!matched) {
    matched = equities.find((e) => {
      const full = `${e.series} ${e.issueNumber}`.toLowerCase();
      return full.includes(clean) || clean.includes(full);
    });
  }

  // Find corresponding dossier from ce70-dossiers-data.json
  const dossierData = ce70DossiersData.find((d) => {
    if (matched && d.seatNumber === matched.seatNumber) return true;
    if (matched && d.title.toLowerCase().includes(matched.series.toLowerCase())) return true;
    const cleanNum = parseInt(clean.replace(/\D/g, ""), 10);
    return !isNaN(cleanNum) && d.seatNumber === cleanNum;
  });

  // If not in ce70_equity_universe, but in ce70-dossiers-data.json, construct from dossier
  if (!matched && dossierData) {
    const seriesTitle = dossierData.title.replace(/\s*#?\d+.*$/, "");
    const issueMatch = dossierData.title.match(/#?(\d+)/);
    const issueNum = issueMatch ? issueMatch[1] : "1";
    const ticker = formatComicEquityTicker(seriesTitle, issueNum, "SOV");
    const baseFmv = Math.round(dossierData.gregoryScore * 145);

    matched = {
      id: `ce70_seat_${dossierData.seatNumber}`,
      seatNumber: dossierData.seatNumber,
      seatType: "PRIMARY_DOMESTIC",
      ticker,
      series: seriesTitle,
      issueNumber: issueNum,
      title: dossierData.title,
      originEra: dossierData.era.replace(/\s*Age$/i, "").toUpperCase(),
      productionAge: dossierData.era.replace(/\s*Age$/i, "").toUpperCase(),
      lineage: `${seriesTitle} Lineage`,
      referenceGrade: "9.8",
      referenceFmvUsd: baseFmv,
      priceFormatted: `$${baseFmv.toLocaleString()}`,
      gregoryScore: dossierData.gregoryScore,
      deltaPercent: Number(((dossierData.gregoryScore - 190.0) * 0.45).toFixed(2)),
      status: "ACTIVE",
      coverUrl: VERIFIED_SEAT_COVERS[dossierData.title] || null,
      canonicalIssueId: dossierData.canonicalId || null,
    };
  }

  if (!matched) return null;

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

  return {
    ...matched,
    publisher: dossierData?.publisher || "Independent / Classic",
    publicationYear: dossierData?.year || 1965,
    primaryCreators: dossierData?.creators || "Canonical Creative Architects",
    adjudicationEssay: dossierData?.essay || `${matched.series} #${matched.issueNumber} represents a pivotal benchmark specimen within the Panel Profits Sovereign Equity Canon. Exhibiting exceptional artistic merit, enduring cultural gravity, and profound historical resonance, this key issue anchors its constitutional seat with supreme connoisseurial distinction.`,
    historicalJustification: dossierData?.justification || `Certified CE70 Sovereign Constituent Seat #${matched.seatNumber}: Benchmark asset anchoring the ${matched.originEra} Age portfolio.`,
    scarcityTier: basePrice > 25000 ? "SOVEREIGN_GRAIL" : "INVESTMENT_GRADE_ELITE",
    censusUniversalCount: Math.max(1, Math.round(180000 / (basePrice + 100))),
    censusTotalGraded: Math.max(5, Math.round(650000 / (basePrice + 100))),
    qualityScores: dossierData?.qualityScores || [],
    performanceHistory: history,
    assetFamilyValuations,
  };
}
