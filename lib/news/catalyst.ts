import adaptationCastData from "./adaptation-cast-registry.json";

export type CatalystType =
  | "CASTING_ATTACHMENT"
  | "OPTION_RIGHTS"
  | "PRINT_SELLOUT"
  | "CREATOR_MOVE"
  | "AUCTION_RECORD"
  | "BOX_OFFICE_CATALYST"
  | "FIRST_APPEARANCE_SPEC"
  | "GENERAL_INDUSTRY";

export type MarketImpact = "BULLISH" | "VOLATILITY" | "BEARISH" | "NEUTRAL";

export interface AffectedComicKey {
  series: string;
  issueNumber: string;
  title: string;
  keySignificance: string;
  ticker: string;
  fmvCgc98: number;
  priceFormatted: string;
  catalogQuery: string;
}

export interface CatalystAnalysis {
  catalystType: CatalystType;
  catalystLabel: string;
  marketImpact: MarketImpact;
  impactScore: number; // 0.0 to 1.0
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

// Benchmark FMV lookup for canonical keys to avoid empty state
const KEY_ISSUE_BENCHMARKS: Record<string, { fmv: number; significance: string; ticker: string }> = {
  "The Amazing Spider-Man #129": { fmv: 14500, significance: "1st Appearance The Punisher", ticker: "$PNSH" },
  "The Amazing Spider-Man #42": { fmv: 3800, significance: "1st Full Appearance Mary Jane Watson", ticker: "$SPDR" },
  "Amazing Fantasy #15": { fmv: 285000, significance: "1st Appearance Spider-Man", ticker: "$SPDR" },
  "The Incredible Hulk #449": { fmv: 850, significance: "1st Appearance Thunderbolts / Songbird", ticker: "$THUN" },
  "The Incredible Hulk #181": { fmv: 42000, significance: "1st Appearance Wolverine", ticker: "$WLVN" },
  "Star Wars: The Clone Wars #1": { fmv: 3400, significance: "1st Comic Appearance Ahsoka Tano", ticker: "$AHSOKA" },
  "Hero for Hire #2": { fmv: 650, significance: "1st Appearance Claire Temple", ticker: "$NURSE" },
  "Fantastic Four #1": { fmv: 165000, significance: "1st Fantastic Four & Origin", ticker: "$FF4" },
  "Detective Comics #27": { fmv: 850000, significance: "1st Appearance Batman", ticker: "$BTMN" },
  "Action Comics #1": { fmv: 1200000, significance: "1st Appearance Superman", ticker: "$SUPR" },
  "Daredevil #1": { fmv: 18500, significance: "1st Appearance Daredevil", ticker: "$DDVL" },
  "The New Mutants #98": { fmv: 1450, significance: "1st Appearance Deadpool", ticker: "$DEAD" },
  "Tales of Suspense #39": { fmv: 35000, significance: "1st Appearance Iron Man", ticker: "$IMAN" },
  "The X-Men #1": { fmv: 48000, significance: "1st Appearance X-Men & Magneto", ticker: "$XMEN" },
  "The Batman Adventures #12": { fmv: 2400, significance: "1st Comic Appearance Harley Quinn", ticker: "$HQUINN" },
};

/**
 * Analyzes news story headline and summary to determine market catalyst type,
 * projected volatility/sentiment impact, and linked comic equity keys.
 */
export function analyzeStoryCatalyst(headline: string, summary: string | null): CatalystAnalysis {
  const text = `${headline} ${summary || ""}`.toLowerCase();

  let catalystType: CatalystType = "GENERAL_INDUSTRY";
  let catalystLabel = "Industry Intelligence";
  let marketImpact: MarketImpact = "NEUTRAL";
  let impactScore = 0.5;
  let reasoning = "General sequential art and publishing development without immediate sovereign price shock.";
  const affectedComics: AffectedComicKey[] = [];
  const seenComics = new Set<string>();

  // 1. Check for Adaptation Actor & Casting announcements
  for (const actor of ADAPTATION_ACTORS) {
    const actorNames = [actor.name.toLowerCase(), ...actor.aliases.map((a) => a.toLowerCase())];
    const isActorMentioned = actorNames.some((n) => text.includes(n));

    if (isActorMentioned) {
      catalystType = "CASTING_ATTACHMENT";
      catalystLabel = "Casting & Adaptation Catalyst";
      marketImpact = "BULLISH";
      impactScore = 0.88;
      reasoning = `High-profile casting announcement featuring ${actor.name}. Historical secondary market velocity demonstrates immediate accumulation in character key issues.`;

      for (const role of actor.roles) {
        if (!seenComics.has(role.landmarkIssue)) {
          seenComics.add(role.landmarkIssue);
          const benchmark = KEY_ISSUE_BENCHMARKS[role.landmarkIssue] || {
            fmv: 1250,
            significance: `Portrayed as ${role.character}`,
            ticker: role.comicTicker,
          };

          const [seriesPart, issuePart] = role.landmarkIssue.split("#");
          affectedComics.push({
            series: (seriesPart || role.landmarkIssue).trim(),
            issueNumber: (issuePart || "1").trim(),
            title: role.landmarkIssue,
            keySignificance: benchmark.significance,
            ticker: benchmark.ticker,
            fmvCgc98: benchmark.fmv,
            priceFormatted: `$${benchmark.fmv.toLocaleString()}`,
            catalogQuery: role.landmarkIssue,
          });
        }
      }
      break;
    }
  }

  // 2. Check for Option Rights / Film & TV Studio Deals
  if (catalystType === "GENERAL_INDUSTRY") {
    if (/\b(optioned|film rights|adaptation|series order|streaming series|movie deal|directing|in talks)\b/i.test(text)) {
      catalystType = "OPTION_RIGHTS";
      catalystLabel = "Media Rights & Optioning";
      marketImpact = "BULLISH";
      impactScore = 0.82;
      reasoning = "Intellectual property acquired or fast-tracked for studio adaptation. Generates pre-production speculative float demand.";
    } else if (/\b(sold out|sellout|print run|second printing|allocation|foc spike)\b/i.test(text)) {
      catalystType = "PRINT_SELLOUT";
      catalystLabel = "Distributor Sellout & Scarcity";
      marketImpact = "BULLISH";
      impactScore = 0.78;
      reasoning = "Primary distribution allocation depleted at distributor level. Immediate upward pressure on secondary market retail floor.";
    } else if (/\b(record sale|auction record|heritage auctions|comicconnect|cleared at|private treaty)\b/i.test(text)) {
      catalystType = "AUCTION_RECORD";
      catalystLabel = "Public Auction High-Water Mark";
      marketImpact = /\b(crash|slump|dip|misses)\b/i.test(text) ? "BEARISH" : "BULLISH";
      impactScore = 0.92;
      reasoning = "New benchmark clearing price recorded at major auction house. Recalibrates FMV baselines across certified high-grade census.";
    } else if (/\b(box office|opening weekend|grossed|theatrical run|box-office)\b/i.test(text)) {
      catalystType = "BOX_OFFICE_CATALYST";
      catalystLabel = "Box Office Macro Realization";
      marketImpact = text.includes("flop") || text.includes("underperform") ? "BEARISH" : "VOLATILITY";
      impactScore = 0.72;
      reasoning = "Theatrical performance directly impacts retail liquidity cycle and post-release speculative exit volumes.";
    } else if (/\b(exclusive deal|leaves marvel|joins dc|showrunner|creative team)\b/i.test(text)) {
      catalystType = "CREATOR_MOVE";
      catalystLabel = "Creator Roster Transition";
      marketImpact = "VOLATILITY";
      impactScore = 0.65;
      reasoning = "A-list writer or artist reassignment shifts brand momentum and run collectibility.";
    } else if (/\b(first appearance|debuts|new character|origin revealed)\b/i.test(text)) {
      catalystType = "FIRST_APPEARANCE_SPEC";
      catalystLabel = "Character First Appearance";
      marketImpact = "BULLISH";
      impactScore = 0.85;
      reasoning = "Canonical character debut issue identified. High initial submission volume to third-party grading anticipated.";
    }
  }

  // 3. Fallback Key issue check if no actor was matched
  if (affectedComics.length === 0) {
    for (const [keyName, data] of Object.entries(KEY_ISSUE_BENCHMARKS)) {
      const simplified = keyName.toLowerCase().replace(/the\s+/g, "");
      if (text.includes(simplified)) {
        const [seriesPart, issuePart] = keyName.split("#");
        affectedComics.push({
          series: (seriesPart || keyName).trim(),
          issueNumber: (issuePart || "1").trim(),
          title: keyName,
          keySignificance: data.significance,
          ticker: data.ticker,
          fmvCgc98: data.fmv,
          priceFormatted: `$${data.fmv.toLocaleString()}`,
          catalogQuery: keyName,
        });
        if (affectedComics.length >= 2) break;
      }
    }
  }

  return {
    catalystType,
    catalystLabel,
    marketImpact,
    impactScore,
    reasoning,
    affectedComics,
  };
}
