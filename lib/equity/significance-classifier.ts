import { LANDMARK_MARVEL_DEBUTS } from "@/lib/wiki/entity-extractor";
import { resolveIssueDebuts } from "@/lib/wiki/debut-resolver";
import type { ScarcityTier } from "@/lib/design-system/colors";

/**
 * Resolves the primary historical milestone badge for any comic issue
 * (e.g. "1st App. Spider-Man", "1st App. Wolverine", "Series Premiere #1", "Centennial #100").
 */
export function resolveHistoricalKeyBadge(
  seriesName?: string | null,
  issueNumber?: string | null
): string | null {
  if (!seriesName || !issueNumber) return null;

  const cleanSeries = seriesName.toLowerCase().replace(/^(the|a)\s+/, "").trim();
  const cleanIssue = issueNumber.replace(/^#/, "").trim();
  const key = `${cleanSeries} #${cleanIssue}`;

  // 1. Curated Landmark Milestones & Character Genesis
  if (LANDMARK_MARVEL_DEBUTS[key]) {
    const chars = LANDMARK_MARVEL_DEBUTS[key].characters;
    if (chars && chars.length > 0) {
      const topChar = chars[0].replace(/\s*\([^)]*\)/, "").trim();
      return `1st App. ${topChar}`;
    }
  }

  // 2. Comprehensive First Appearance Database
  const deb = resolveIssueDebuts(seriesName, issueNumber);
  if (deb && deb.characters && deb.characters.length > 0) {
    const cleanChars = deb.characters.filter(
      (c) => !c.startsWith("|") && !c.startsWith("*") && c.length < 32 && !c.includes("Vol ")
    );
    if (cleanChars.length > 0) {
      const topChar = cleanChars[0].replace(/\s*\([^)]*\)/, "").trim();
      return `1st App. ${topChar}`;
    }
  }

  // 3. Issue #1 Premiere
  if (cleanIssue === "1") {
    return "Premiere Issue";
  }

  // 4. Centenary Publication Milestones
  const num = parseInt(cleanIssue, 10);
  if (num > 0 && num % 100 === 0) {
    return `Centennial #${num}`;
  }

  return null;
}

/**
 * Assigns Scarcity Tier based strictly on Historical Significance, Cultural Gravity,
 * and Era Scarcity — enforcing the Price Firewall (CE70 Constitution Rule C).
 * Dollar auction prices touch Quality 11 only, never cultural or scarcity tiers.
 */
export function resolveHistoricalScarcityTier(params: {
  year?: number | null;
  era?: string | null;
  keyBadge?: string | null;
  isSovereign?: boolean | null;
  gregoryScore?: number | null;
  variant?: string | null;
}): ScarcityTier {
  const { year, era, keyBadge, isSovereign, gregoryScore, variant } = params;
  const eraNormalized = (era || "").toLowerCase().trim();
  const score = gregoryScore || 0;

  // 1. Mythic: CE70 Sovereign Benchmark Seats & Foundational Medium Genesis Keys
  if (
    isSovereign ||
    score >= 195.0 ||
    (year && year <= 1939) ||
    eraNormalized === "platinum"
  ) {
    return "mythic";
  }

  // 2. Legendary: Primary Mythological Archetype Debuts & Golden Age Survivors (1940-1945)
  if (
    (keyBadge && keyBadge.startsWith("1st App.")) ||
    (year && year <= 1945) ||
    eraNormalized === "golden" ||
    score >= 190.0
  ) {
    return "legendary";
  }

  // 3. Epic: Atomic/Pre-Code & Silver Age Milestone Keys (1946-1969), Major Storyline Inflections
  if (
    (year && year <= 1969) ||
    eraNormalized === "atomic" ||
    eraNormalized === "silver" ||
    score >= 180.0
  ) {
    return "epic";
  }

  // 4. Rare: Bronze Age Keys (1970-1983), Premiere #1s, Verified Newsstands, Reprints & Variants
  if (
    (year && year <= 1983) ||
    eraNormalized === "bronze" ||
    keyBadge === "Premiere Issue" ||
    Boolean(variant)
  ) {
    return "rare";
  }

  // 5. Uncommon: Copper & Early Modern Canonical Series Continuity (1984-2005)
  if (
    (year && year <= 2005) ||
    eraNormalized === "copper" ||
    eraNormalized === "independent"
  ) {
    return "uncommon";
  }

  // 6. Common: Standard Modern & Postmodern Catalog Issues
  return "common";
}

/**
 * Assigns Market Security Class based on Canonical System Map & Asset Ontology:
 * - SOV: Certified Sovereign CE70 Benchmark Constituents.
 * - PREMIUM: Certified Key Historical Issues (Character Debuts, Milestone #1s, Pre-Code / Golden survivors).
 * - STD: Standard verified series issues.
 * - OTC: Secondary or peripheral uncatalogued items.
 */
export function resolveHistoricalMarketClass(params: {
  isSovereign: boolean;
  keyBadge?: string | null;
  year?: number | null;
  era?: string | null;
  variant?: string | null;
}): "SOV" | "PREMIUM" | "STD" | "OTC" {
  const { isSovereign, keyBadge, year, era, variant } = params;

  if (isSovereign) {
    return "SOV";
  }

  const eraNormalized = (era || "").toLowerCase().trim();

  // Historical Keys, Character Debuts, Golden/Atomic/Silver landmark issues are PREMIUM
  if (
    (keyBadge && (keyBadge.startsWith("1st App.") || keyBadge === "Premiere Issue")) ||
    (year && year <= 1969) ||
    eraNormalized === "golden" ||
    eraNormalized === "atomic" ||
    eraNormalized === "silver" ||
    Boolean(variant)
  ) {
    return "PREMIUM";
  }

  return "STD";
}
