import type { StorySummary } from "@/lib/comics/story-summary";

/** What the seller's own listing says about the copy. Everything here is seller wording, not a verified fact. */
export interface ListingFacts { title?: string | null; grader?: string | null; grade?: number | null }

const SIGNALS: Array<[RegExp, string]> = [
  [/\b(?:sdcc|nycc|c2e2|ecc[c]?|wondercon|emerald city|con(?:vention)?[\s-]*exclusive|con exclusive)\b/i, "convention-exclusive wording"],
  [/\bexl\b|\bexclusive\b/i, "exclusive wording"],
  [/\b1\s*[:/]\s*\d{1,3}\b|\bratio\b|\bincentive\b/i, "ratio/incentive wording"],
  [/\bvirgin\b/i, "virgin cover wording"],
  [/\bhomage\b/i, "homage wording"],
  [/\bsketch\b/i, "sketch cover wording"],
  [/\b(?:signed|signature series|ss)\b/i, "signature wording"],
  [/\bfoil\b|\bchromium\b|\bmetallic\b|\bglow\b|\bholo/i, "special-finish wording"],
  [/\bnewsstand\b/i, "newsstand wording"],
  [/\b(?:2nd|second|3rd|third|4th|fourth)\s+print/i, "later-printing wording"],
  [/\bfacsimile\b|\breprint\b/i, "reprint/facsimile wording"],
  [/\bcpv\b|canadian price/i, "Canadian price variant wording"],
  [/\b(?:store|retailer)\s+(?:exclusive|variant)|comics elite|\bbudget\b/i, "retailer-variant wording"],
  [/\b(?:cover|variant)\s*[a-z0-9]\b|\bvariant\b/i, "variant-cover wording"],
];

export function editionSignals(title?: string | null): string[] {
  if (!title) return [];
  const out: string[] = [];
  for (const [re, label] of SIGNALS) if (re.test(title) && !out.includes(label)) out.push(label);
  return out;
}

export type Lens = "debut" | "solo" | "pairing" | "team" | "none";
export function thesisLens(summary: StorySummary): { lens: Lens; names: string[] } {
  const uniq = (xs?: Array<{ label: string }>) => Array.from(new Set((xs ?? []).map((x) => x.label.replace(/\s*\([^)]*\)\s*$/, "").trim()).filter(Boolean)));
  const debut = uniq(summary.entities?.firstAppearances);
  if (debut.length) return { lens: "debut", names: debut.slice(0, 3) };
  const featured = uniq(summary.entities?.featuredCharacters);
  if (featured.length === 1) return { lens: "solo", names: featured };
  if (featured.length === 2) return { lens: "pairing", names: featured };
  if (featured.length >= 3) return { lens: "team", names: featured.slice(0, 4) };
  return { lens: "none", names: [] };
}

const CLAIM_TERMS: Array<[RegExp, RegExp]> = [
  [/\brare(?:r|st)?\b|\bscarce\b|\bscarcity\b/i, /\brare|scarce|scarcity|limited|low print|print run|exclusive|ratio|incentive|1:\d/i],
  [/\bexclusive\b/i, /\bexclusive\b|\bexl\b|\bsdcc\b|\bnycc\b/i],
  [/\blimited(?:[- ]edition|[- ]run|[- ]print)?\b/i, /\blimited\b|\bexclusive\b|\bexl\b|\bratio\b|\b1:\d/i],
  [/\bincentive\b|\bratio variant\b/i, /\bincentive\b|\bratio\b|\b1\s*[:/]\s*\d/i],
  [/\bprint run\b|\bcopies were printed\b/i, /\bprint run\b|\bcopies\b|\bprinted\b/i],
  [/\bhomage\b/i, /\bhomage\b/i],
  [/\b(?:1st|first) (?:full )?appearance\b/i, /\b(?:1st|first)\b.*\bapp/i],
];

/** Returns the claims in `text` that the evidence (listing wording, sourced story and credits) does not back up. */
export function unsupportedClaims(text: string, evidence: string): string[] {
  const bad: string[] = [];
  for (const [claim, support] of CLAIM_TERMS) {
    const m = text.match(claim);
    if (m && !support.test(evidence)) bad.push(m[0]);
  }
  for (const num of text.match(/\b\d{1,3}(?:,\d{3})+\b|\b\d{4,}\b/g) ?? []) {
    if (!evidence.includes(num)) bad.push(num);
  }
  return bad;
}
