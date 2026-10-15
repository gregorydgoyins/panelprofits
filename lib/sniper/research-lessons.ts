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

const THIN_MARKET = new Set(["convention-exclusive wording", "exclusive wording", "ratio/incentive wording", "virgin cover wording", "sketch cover wording", "signature wording", "retailer-variant wording", "special-finish wording", "Canadian price variant wording"]);

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

const list = (xs: string[]) => (xs.length <= 1 ? xs[0] ?? "" : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

/** Plain-language lessons built only from the sourced story and the listing wording. Used when the live write-up is unavailable or fails the evidence check. */
export function lensLessons(summary: StorySummary, listing: ListingFacts = {}): Array<{ heading: string; text: string }> {
  const { lens, names } = thesisLens(summary);
  const n = list(names);
  const signals = editionSignals(listing.title);
  const thin = signals.some((s) => THIN_MARKET.has(s));
  const reprint = signals.some((s) => /reprint|later-printing/.test(s));
  const slab = [listing.grader, listing.grade != null ? String(listing.grade) : ""].filter(Boolean).join(" ") || "this grade";

  const thesis =
    lens === "debut" ? { heading: `Decide whether the ${n} debut is a lasting draw`, text: `The sourced record lists ${n} as first appearing in this issue. A debut only carries a premium if the character stays in print and collectors keep asking for it, so look at whether ${n} returns in later books before paying for the debut itself.` }
    : lens === "solo" ? { heading: `${n} is a one-character thesis`, text: `This issue is built around ${n} alone, so demand comes from ${n} collectors, not from a team or crossover audience. Check whether ${n} leads an ongoing book or only guests here, and whether the other ${n} issues you would hold instead trade at a similar level.` }
    : lens === "pairing" ? { heading: `Buy the ${names[0]} and ${names[1]} pairing, not one half of it`, text: `${names[0]} and ${names[1]} share this story, which makes it a pair-collector book. Duo collectors want covers and issues where both appear, so compare it against other issues that put them together and against each character's solo books; a pairing issue can sit above or below both.` }
    : lens === "team" ? { heading: `Know which lineup you are paying for`, text: `${n} appear together here, so this is an ensemble book. Team collectors chase specific lineups, creative runs and landmark issues; work out which of those is the draw before treating a team title as a key.` }
    : { heading: "Find the reason anyone wants this book", text: "The sourced record names no featured character for this issue, so demand cannot be tied to a character. Establish the draw (a creator, a run, a cover) before assuming a market exists." };

  const edition = signals.length
    ? { heading: "The title claims a specific edition; prove it", text: `The listing title shows ${list(signals)}. That is the seller's wording, not a verified printing. Match it to the cover on the slab label and photos, then compare only against completed sales that carry the same wording at ${slab}; a different cover or printing is a different book for pricing.` }
    : { heading: "No variant wording: treat it as the standard cover", text: `The listing title carries no variant or printing wording, so price it against the standard cover at ${slab} unless the photographed cover shows otherwise. Cover credit and interior art are separate credits, so confirm the cover before comparing.` };

  const cheap = reprint
    ? { heading: "A low price may only reflect a reprint", text: "Later printings and reprints sell for a fraction of first printings. Before calling this cheap, confirm the printing on the label; if it is a reprint, compare it only to reprint sales." }
    : thin
      ? { heading: "Thin markets make cheap hard to prove", text: `Special and limited covers trade rarely, so a few sales can give a misleading price at ${slab}. Treat a low ask as cheap only if several recent completed sales of this exact edition and grade support it; with one or two, price in the risk that you may wait to resell.` }
      : { heading: "Cheap means below recent completed sales, after all costs", text: `A standard-cover book at ${slab} usually has more completed sales to check against. Call it cheap only if the all-in cost (price, shipping, tax, fees on resale) still sits below the middle of recent same-grade sales, and discard sales that are old or from a different edition.` };

  return [thesis, edition, cheap];
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
