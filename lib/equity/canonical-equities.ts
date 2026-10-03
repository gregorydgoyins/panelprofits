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

// Constructs clean 4 to 5 character equity ticker symbols (NASDAQ / NYSE style)
// e.g., ASM01, AS300, ACT01, AC252, DET27, HK181, FF048, XMN94, BAT01, BA251, GSX01, TMNT1
export function formatComicEquityTicker(series: string, issue: string | number, _assetClass?: string): string {
  const cleanSeries = String(series || "").trim().toLowerCase();
  const normSeries = cleanSeries
    .replace(/^(the|marvel(?:'s)?|dc(?:'s)?)\s+/i, "")
    .replace(/&/g, "and")
    .trim();
  const rawIssue = String(issue ?? "1").trim();
  const cleanNum = rawIssue.replace(/\D/g, "");

  // Curated canonical mapping for landmark high-profile issues (strict on core flagship titles)
  if (normSeries === "action comics" && cleanNum === "1") return "ACT01";
  if (normSeries === "action comics" && cleanNum === "252") return "AC252";
  if (normSeries === "detective comics" && cleanNum === "27") return "DET27";
  if (normSeries === "amazing spider-man" && cleanNum === "1") return "ASM01";
  if (normSeries === "amazing spider-man" && cleanNum === "300") return "AS300";
  if (normSeries === "amazing spider-man" && cleanNum === "129") return "AS129";
  if ((normSeries === "incredible hulk" || normSeries === "hulk") && cleanNum === "181") return "HK181";
  if ((normSeries === "incredible hulk" || normSeries === "hulk") && cleanNum === "1") return "HLK01";
  if (normSeries === "fantastic four" && cleanNum === "48") return "FF048";
  if (normSeries === "fantastic four" && cleanNum === "1") return "FF001";
  if (normSeries === "fantastic four" && cleanNum === "52") return "FF052";
  if ((normSeries === "x-men" || normSeries === "uncanny x-men") && cleanNum === "1") return "XMN01";
  if ((normSeries === "x-men" || normSeries === "uncanny x-men") && cleanNum === "94") return "XMN94";
  if (normSeries === "giant-size x-men" && cleanNum === "1") return "GSX01";
  if (normSeries === "batman" && cleanNum === "1") return "BAT01";
  if (normSeries === "batman" && cleanNum === "251") return "BA251";
  if (normSeries === "tales of suspense" && cleanNum === "39") return "TOS39";
  if (normSeries === "tales of suspense" && cleanNum === "40") return "TOS40";
  if (normSeries === "journey into mystery" && cleanNum === "83") return "JIM83";
  if (normSeries === "journey into mystery" && cleanNum === "85") return "JIM85";
  if (normSeries === "showcase" && cleanNum === "4") return "SHC04";
  if (normSeries === "avengers" && cleanNum === "1") return "AVG01";
  if (normSeries === "avengers" && cleanNum === "4") return "AVG04";
  if ((normSeries.includes("ninja turtles") || normSeries.includes("tmnt")) && cleanNum === "1") return "TMNT1";
  if (normSeries === "secret wars" && cleanNum === "8") return "SW008";
  if (normSeries.includes("crime suspen") && cleanNum === "22") return "CSS22";
  if (normSeries === "strange tales" && cleanNum === "110") return "ST110";
  if (normSeries === "daredevil" && cleanNum === "1") return "DD001";
  if (normSeries === "daredevil" && cleanNum === "168") return "DD168";
  if (normSeries === "tomb of dracula" && cleanNum === "10") return "TOD10";
  if (normSeries === "watchmen" && cleanNum === "1") return "WCH01";
  if (normSeries.includes("dark knight returns") && cleanNum === "1") return "DKR01";
  if (normSeries === "new mutants" && cleanNum === "98") return "NM098";
  if (normSeries === "ultimate fallout" && cleanNum === "4") return "UF004";
  if (normSeries === "spawn" && cleanNum === "1") return "SPW01";
  if (normSeries === "mad" && cleanNum === "1") return "MAD01";
  if (normSeries === "aquaman" && cleanNum === "1") return "AQM01";

  // Specific spin-offs & distinct lines (must take precedence over generic prefixes)
  let root = "CMX";
  if (normSeries === "astonishing x-men") root = "AXM";
  else if (normSeries === "ultimate x-men") root = "UXM";
  else if (normSeries === "weapon x-men") root = "WXM";
  else if (normSeries === "new x-men") root = "NXM";
  else if (normSeries === "all-new x-men" || normSeries === "all new x-men") root = "ANX";
  else if (normSeries === "x-force") root = "XFC";
  else if (normSeries === "x-factor") root = "XFT";
  else if (normSeries === "uncanny avengers") root = "UAV";
  else if (normSeries === "new avengers") root = "NAV";
  else if (normSeries === "secret avengers") root = "SAV";
  else if (normSeries === "young avengers") root = "YAV";
  else if (normSeries === "west coast avengers") root = "WCA";
  else if (normSeries === "batman adventures") root = "BMA";
  else if (normSeries === "batman beyond") root = "BMB";
  else if (normSeries === "batman and robin") root = "BAR";
  else if (normSeries === "absolute batman") root = "ABM";
  else if (normSeries === "all-star batman" || normSeries === "all star batman") root = "ASB";
  else if (normSeries === "batman: the dark knight") root = "BDK";
  else if (normSeries === "batman: shadow of the bat") root = "BSB";
  else if (normSeries === "batman: legends of the dark knight") root = "LDK";
  else if (normSeries === "batman: white knight") root = "BWK";
  else if (normSeries === "spectacular spider-man" || normSeries === "peter parker: the spectacular spider-man") root = "SSM";
  else if (normSeries === "ultimate spider-man") root = "USM";
  else if (normSeries === "miles morales: spider-man") root = "MMS";
  else if (normSeries === "sensational spider-man") root = "SNS";
  else if (normSeries === "friendly neighborhood spider-man") root = "FNS";
  else if (normSeries === "web of spider-man") root = "WOS";
  // Flagship titles (strict matches)
  else if (normSeries === "action comics") root = "ACT";
  else if (normSeries === "detective comics") root = "DET";
  else if (normSeries === "amazing spider-man") root = "ASM";
  else if (normSeries === "spider-man") root = "SPD";
  else if (normSeries === "batman") root = "BAT";
  else if (normSeries === "superman") root = "SUP";
  else if (normSeries === "incredible hulk" || normSeries === "hulk") root = "HLK";
  else if (normSeries === "x-men") root = "XMN";
  else if (normSeries === "fantastic four") root = "FF";
  else if (normSeries === "avengers") root = "AVG";
  else if (normSeries === "tales of suspense") root = "TOS";
  else if (normSeries === "journey into mystery") root = "JIM";
  else if (normSeries === "strange tales") root = "ST";
  else if (normSeries === "daredevil") root = "DD";
  else if (normSeries === "iron man" || normSeries === "invincible iron man") root = "IRM";
  else if (normSeries === "captain america") root = "CAP";
  else if (normSeries === "thor") root = "TH";
  else if (normSeries === "wonder woman") root = "WW";
  else if (normSeries === "silver surfer") root = "SS";
  else if (normSeries === "green lantern") root = "GL";
  else if (normSeries === "aquaman") root = "AQM";
  else if (normSeries === "spawn") root = "SPW";
  else {
    const words = cleanSeries.replace(/[^a-zA-Z0-9\s]/g, "").split(/\s+/).filter(Boolean);
    if (words.length === 1) root = words[0].slice(0, 3).toUpperCase();
    else if (words.length === 2) root = (words[0].slice(0, 2) + words[1].slice(0, 1)).toUpperCase();
    else root = words.map((w) => w[0]).join("").slice(0, 3).toUpperCase();
  }

  // Combine with issue digits to guarantee strictly 4-5 characters
  if (!cleanNum) {
    return root.padEnd(4, "X").slice(0, 5);
  }

  if (cleanNum.length === 1) {
    const prefix = root.length >= 3 ? root.slice(0, 3) : root.padEnd(3, "0");
    return `${prefix}0${cleanNum}`.slice(0, 5);
  } else if (cleanNum.length === 2) {
    const prefix = root.length >= 3 ? root.slice(0, 3) : root.padEnd(3, "0");
    return `${prefix}${cleanNum}`.slice(0, 5);
  } else if (cleanNum.length === 3) {
    const prefix = root.length >= 2 ? root.slice(0, 2) : root.padEnd(2, "X");
    return `${prefix}${cleanNum}`.slice(0, 5);
  } else {
    const prefix = root.slice(0, 1) || "C";
    return `${prefix}${cleanNum.slice(-4)}`;
  }
}

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
 * Resolves the server-side initial render hydration gap by querying the high-speed
 * verified SQLite catalog first, ensuring authentic unrounded pennies and unique covers.
 */
async function fetchSovereignEquitiesRaw(limit = 150): Promise<SovereignEquityItem[]> {
  try {
    // 1. Primary Source: High-speed verified equities from local SQLite catalog
    // Genuine unrounded pennies, unique Supabase Storage covers, and authentic tickers
    const verified = getVerifiedRealEquities(0, limit, false);
    if (verified.items && verified.items.length > 0) {
      return verified.items;
    }

    // 2. Secondary source: query Supabase clean comics catalog
    const db = createCleanReadOnlyServerClient();
    const { data, error } = await db
      .from("comics")
      .select("id, series, issue_number, publisher, publication_year, cover_url, pp_grade_9_8_price, baseline_grade_9_8_value")
      .not("cover_url", "is", null)
      .gt("baseline_grade_9_8_value", 17.0)
      .order("baseline_grade_9_8_value", { ascending: false })
      .limit(limit);

    if (error && !isMissingTableError(error)) {
      console.warn("Notice querying comics catalog for equities rail:", error.message);
    }

    if (data && data.length > 0) {
      return data.map((c, idx) => {
        const fmv = Number(c.baseline_grade_9_8_value || c.pp_grade_9_8_price || 20.0);
        return {
          id: c.id,
          seatNumber: idx + 1,
          seatType: "PRIMARY_DOMESTIC",
          ticker: formatComicEquityTicker(c.series, c.issue_number || "1", "SOV"),
          series: c.series,
          issueNumber: c.issue_number || "1",
          title: `${c.series} #${c.issue_number || "1"}`,
          originEra: "MODERN",
          productionAge: "MODERN",
          lineage: `${c.publisher || "Verified"} Benchmark Constituent`,
          referenceGrade: "9.8",
          referenceFmvUsd: fmv,
          priceFormatted: `$${fmv.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          gregoryScore: 192.5,
          deltaPercent: 0.45,
          status: "ACTIVE",
          coverUrl: c.cover_url,
          canonicalIssueId: c.id,
          year: c.publication_year || 1975,
          publisher: c.publisher || "Marvel / DC",
        };
      });
    }

    return [];
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
