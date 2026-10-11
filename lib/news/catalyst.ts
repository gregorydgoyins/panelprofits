import adaptationCastData from "./adaptation-cast-registry.json";
import { formatComicEquityTicker } from "@/lib/equity/ticker-formatting";

/**
 * News -> market impact.
 *
 * Canon: "Narrative ≠ Price". News sets velocity and the risk profile (volatility / regime);
 * supply and demand set the floor. So this module classifies a story and names the books it
 * touches, and nothing else. It never emits a price, a percentage, a probability or a
 * bullish/bearish call. Prices come from `market-evidence.ts`, per source, from real rows.
 */

export type CatalystType =
  | "CASTING_ATTACHMENT"
  | "OPTION_RIGHTS"
  | "PRINT_SELLOUT"
  | "CREATOR_MOVE"
  | "AUCTION_RECORD"
  | "BOX_OFFICE_CATALYST"
  | "FIRST_APPEARANCE_SPEC"
  | "KEY_ISSUE_MENTION"
  | "GENERAL_INDUSTRY";

/** VOLATILITY = the story is a recognised volatility catalyst. NONE = no market link found. */
export type MarketImpact = "VOLATILITY" | "NONE";

export interface AffectedComicKey {
  series: string;
  issueNumber: string;
  title: string; // "Series #N"
  keySignificance: string; // historical fact about the issue (first appearance, etc.)
  ticker: string; // site ticker convention for series+issue; identity, not a quote
  catalogQuery: string;
}

export interface CatalystAnalysis {
  catalystType: CatalystType;
  catalystLabel: string;
  marketImpact: MarketImpact;
  /** What in the story triggered the classification. Contains no numbers about price. */
  reasoning: string;
  affectedComics: AffectedComicKey[];
}

interface AdaptationRole {
  character: string;
  universe: string;
  landmarkIssue: string;
  comicTicker: string;
}
interface AdaptationActor {
  name: string;
  aliases: string[];
  roles: AdaptationRole[];
  franchises: string[];
  imdbId?: string;
}
const ADAPTATION_ACTORS: AdaptationActor[] = adaptationCastData as AdaptationActor[];

/**
 * Key-issue identity registry: what the issue is, and the words that signal it in a headline.
 * Facts about comic history only. No prices (those are read from rail_books).
 */
export const KEY_ISSUES: Record<string, { significance: string; keywords?: string[] }> = {
  "The Amazing Spider-Man #129": { significance: "1st Appearance The Punisher", keywords: ["punisher", "frank castle", "spider-man #129", "asm #129"] },
  "The Amazing Spider-Man #42": { significance: "1st Full Appearance Mary Jane Watson", keywords: ["mary jane", "mj watson", "spider-man #42", "asm #42"] },
  "Amazing Fantasy #15": { significance: "1st Appearance Spider-Man", keywords: ["amazing fantasy #15", "af15", "af #15", "spider-man origin"] },
  "The Incredible Hulk #449": { significance: "1st Appearance Thunderbolts / Songbird", keywords: ["thunderbolts", "songbird", "incredible hulk #449", "hulk #449"] },
  "The Incredible Hulk #181": { significance: "1st Appearance Wolverine", keywords: ["wolverine", "logan", "weapon x", "incredible hulk #181", "hulk #181"] },
  "Star Wars: The Clone Wars #1": { significance: "1st Comic Appearance Ahsoka Tano", keywords: ["ahsoka", "clone wars #1"] },
  "Hero for Hire #2": { significance: "1st Appearance Claire Temple", keywords: ["claire temple", "hero for hire #2"] },
  "Fantastic Four #1": { significance: "1st Fantastic Four & Origin", keywords: ["fantastic four #1", "ff #1", "ff1"] },
  "Detective Comics #27": { significance: "1st Appearance Batman", keywords: ["detective comics #27", "tec #27", "batman debut"] },
  "Action Comics #1": { significance: "1st Appearance Superman", keywords: ["action comics #1", "action #1", "superman debut"] },
  "Daredevil #1": { significance: "1st Appearance Daredevil", keywords: ["daredevil #1", "matt murdock origin"] },
  "The New Mutants #98": { significance: "1st Appearance Deadpool", keywords: ["deadpool", "wade wilson", "new mutants #98", "nm #98"] },
  "Tales of Suspense #39": { significance: "1st Appearance Iron Man", keywords: ["iron man", "tony stark", "tales of suspense #39", "tos #39"] },
  "The X-Men #1": { significance: "1st Appearance X-Men & Magneto", keywords: ["x-men #1", "xmen #1", "magneto debut"] },
  "The Batman Adventures #12": { significance: "1st Comic Appearance Harley Quinn", keywords: ["harley quinn", "batman adventures #12", "ba #12"] },
  "Marvel Super Heroes Secret Wars #8": { significance: "1st Appearance Alien Symbiote / Black Suit Spider-Man", keywords: ["secret wars #8", "alien symbiote", "black suit spider-man", "symbiote suit"] },
  "Marvel Super Heroes Secret Wars #1": { significance: "1st Secret Wars Event & Beyonder Debut", keywords: ["secret wars #1", "beyonder", "battleworld"] },
  "Fantastic Four #5": { significance: "1st Appearance Doctor Doom", keywords: ["doctor doom", "dr. doom", "victor von doom", "fantastic four #5", "ff #5"] },
  "The Amazing Spider-Man #300": { significance: "1st Full Appearance Venom (Eddie Brock)", keywords: ["venom", "eddie brock", "amazing spider-man #300", "asm #300"] },
  "Ultimate Fallout #4": { significance: "1st Appearance Miles Morales (Spider-Man)", keywords: ["miles morales", "ultimate fallout #4", "uf #4", "spider-verse"] },
  "Giant-Size X-Men #1": { significance: "1st New X-Men (Storm, Colossus, Nightcrawler)", keywords: ["giant-size x-men #1", "gsx #1", "all-new all-different x-men"] },
  "Fantastic Four #48": { significance: "1st Appearance Silver Surfer & Galactus", keywords: ["galactus", "silver surfer", "fantastic four #48", "ff #48"] },
  "Fantastic Four #52": { significance: "1st Appearance Black Panther (T'Challa)", keywords: ["black panther", "t'challa", "wakanda", "fantastic four #52", "ff #52"] },
  "Iron Man #55": { significance: "1st Appearance Thanos & Drax the Destroyer", keywords: ["thanos", "drax", "iron man #55"] },
  "Edge of Spider-Verse #2": { significance: "1st Appearance Spider-Gwen (Gwen Stacy)", keywords: ["spider-gwen", "ghost-spider", "edge of spider-verse #2"] },
  "Spawn #1": { significance: "1st Appearance Spawn (Al Simmons)", keywords: ["spawn #1", "al simmons", "todd mcfarlane"] },
  "Teenage Mutant Ninja Turtles #1": { significance: "1st Appearance Teenage Mutant Ninja Turtles", keywords: ["teenage mutant ninja turtles #1", "tmnt #1", "eastman and laird"] },
  "Journey into Mystery #83": { significance: "1st Appearance Thor & Origin", keywords: ["thor origin", "journey into mystery #83", "jim #83"] },
  "Werewolf by Night #32": { significance: "1st Appearance Moon Knight", keywords: ["moon knight", "marc spector", "werewolf by night #32"] },
  "The Tomb of Dracula #10": { significance: "1st Appearance Blade the Vampire Slayer", keywords: ["blade", "eric brooks", "tomb of dracula #10"] },
};

/** "The Amazing Spider-Man #129" -> { series: "The Amazing Spider-Man", issue: "129" } */
export function splitKey(title: string): { series: string; issue: string } {
  const i = title.lastIndexOf("#");
  if (i < 0) return { series: title.trim(), issue: "1" };
  return { series: title.slice(0, i).trim(), issue: title.slice(i + 1).trim() };
}

/** Search words that signal a given key issue in the news (used for news-pressure counts). */
export function keyTerms(title: string): string[] {
  const k = KEY_ISSUES[title];
  if (k?.keywords?.length) return k.keywords;
  return [title.toLowerCase()];
}

function toKey(title: string, significance: string): AffectedComicKey {
  const { series, issue } = splitKey(title);
  return {
    series,
    issueNumber: issue,
    title,
    keySignificance: significance,
    ticker: formatComicEquityTicker(series, issue),
    catalogQuery: title,
  };
}

const CACHE = new Map<string, CatalystAnalysis>();
const MAX_CACHE = 500;

/**
 * Classifies a story. Pure and deterministic: same text in, same result out.
 * Output states what was found in the text; it does not predict price.
 */
export function analyzeStoryCatalyst(headline: string, summary: string | null): CatalystAnalysis {
  const cacheKey = `${headline}|${summary || ""}`;
  const hit = CACHE.get(cacheKey);
  if (hit) return hit;

  const text = `${headline} ${summary || ""}`.toLowerCase();
  let catalystType: CatalystType = "GENERAL_INDUSTRY";
  let catalystLabel = "Industry News";
  let marketImpact: MarketImpact = "NONE";
  let reasoning = "No key issue, adaptation, auction or print event found in this story.";
  const affected: AffectedComicKey[] = [];
  const seen = new Set<string>();

  // 1. Named adaptation talent -> the landmark issues of the roles they play.
  for (const actor of ADAPTATION_ACTORS) {
    const names = [actor.name, ...actor.aliases].map((n) => n.toLowerCase());
    if (!names.some((n) => text.includes(n))) continue;
    catalystType = "CASTING_ATTACHMENT";
    catalystLabel = "Casting & Adaptation";
    marketImpact = "VOLATILITY";
    reasoning = `${actor.name} is named in the story (adaptation role: ${actor.roles.map((r) => r.character).join(", ")}). Adaptation news raises attention and volatility on the role's landmark issue; it does not set its price.`;
    for (const role of actor.roles) {
      if (seen.has(role.landmarkIssue)) continue;
      seen.add(role.landmarkIssue);
      affected.push(toKey(role.landmarkIssue, KEY_ISSUES[role.landmarkIssue]?.significance ?? `Landmark issue for ${role.character}`));
    }
    break;
  }

  // 2. Event type from the wording of the story.
  if (catalystType === "GENERAL_INDUSTRY") {
    if (/\b(optioned|film rights|adaptation|series order|streaming series|movie deal|directing|in talks)\b/i.test(text)) {
      catalystType = "OPTION_RIGHTS";
      catalystLabel = "Media Rights & Optioning";
      reasoning = "Story reports a film/TV rights or adaptation development. Media-rights news raises attention and volatility on the IP's keys.";
    } else if (/\b(sold out|sellout|print run|second printing|allocation|foc spike)\b/i.test(text)) {
      catalystType = "PRINT_SELLOUT";
      catalystLabel = "Distributor Sellout";
      reasoning = "Story reports a sellout or print-run event. Supply news changes volatility; the floor is set by sales, not by the headline.";
    } else if (/\b(record sale|auction record|heritage auctions|comicconnect|cleared at|private treaty)\b/i.test(text)) {
      catalystType = "AUCTION_RECORD";
      catalystLabel = "Auction Result";
      reasoning = "Story reports an auction result. Compare it to the sold-price evidence on the book; the headline alone is not a price.";
    } else if (/\b(box office|opening weekend|grossed|theatrical run|box-office)\b/i.test(text)) {
      catalystType = "BOX_OFFICE_CATALYST";
      catalystLabel = "Box Office";
      reasoning = "Story reports theatrical performance. Box-office news drives attention and volatility around the IP.";
    } else if (/\b(exclusive deal|leaves marvel|joins dc|showrunner|creative team)\b/i.test(text)) {
      catalystType = "CREATOR_MOVE";
      catalystLabel = "Creator Move";
      reasoning = "Story reports a creator or creative-team change, which shifts attention on the affected run.";
    } else if (/\b(first appearance|debuts|new character|origin revealed)\b/i.test(text)) {
      catalystType = "FIRST_APPEARANCE_SPEC";
      catalystLabel = "Character Debut";
      reasoning = "Story reports a character debut or origin reveal, which draws speculative attention to the debut issue.";
    }
    if (catalystType !== "GENERAL_INDUSTRY") marketImpact = "VOLATILITY";
  }

  // 3. Key issues named in the story (by title or keyword).
  if (affected.length === 0) {
    for (const [title, data] of Object.entries(KEY_ISSUES)) {
      const simple = title.toLowerCase().replace(/the\s+/g, "");
      const matched = text.includes(simple) || (data.keywords?.some((kw) => text.includes(kw)) ?? false);
      if (!matched || seen.has(title)) continue;
      seen.add(title);
      affected.push(toKey(title, data.significance));
      if (affected.length >= 3) break;
    }
    if (affected.length > 0 && catalystType === "GENERAL_INDUSTRY") {
      catalystType = "KEY_ISSUE_MENTION";
      catalystLabel = "Key Issue Mentioned";
      marketImpact = "VOLATILITY";
      reasoning = `Story names ${affected.map((a) => a.title).join(", ")}. Mentions raise attention on the issue; see the evidence below for what the market data shows.`;
    } else if (affected.length > 0) {
      reasoning += ` Key issues named: ${affected.map((a) => a.title).join(", ")}.`;
    }
  }

  const result: CatalystAnalysis = { catalystType, catalystLabel, marketImpact, reasoning, affectedComics: affected };
  if (CACHE.size >= MAX_CACHE) {
    const oldest = CACHE.keys().next().value;
    if (oldest) CACHE.delete(oldest);
  }
  CACHE.set(cacheKey, result);
  return result;
}
