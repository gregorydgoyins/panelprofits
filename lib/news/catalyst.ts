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
  delta7d?: string;
  delta30d?: string;
  volumeSurge?: boolean;
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
const KEY_ISSUE_BENCHMARKS: Record<
  string,
  { fmv: number; significance: string; ticker: string; keywords?: string[] }
> = {
  "The Amazing Spider-Man #129": {
    fmv: 14500,
    significance: "1st Appearance The Punisher",
    ticker: "$PNSH",
    keywords: ["punisher", "frank castle", "spider-man #129", "asm #129"],
  },
  "The Amazing Spider-Man #42": {
    fmv: 3800,
    significance: "1st Full Appearance Mary Jane Watson",
    ticker: "$SPDR",
    keywords: ["mary jane", "mj watson", "spider-man #42", "asm #42"],
  },
  "Amazing Fantasy #15": {
    fmv: 285000,
    significance: "1st Appearance Spider-Man",
    ticker: "$SPDR",
    keywords: ["amazing fantasy #15", "af15", "af #15", "spider-man origin"],
  },
  "The Incredible Hulk #449": {
    fmv: 850,
    significance: "1st Appearance Thunderbolts / Songbird",
    ticker: "$THUN",
    keywords: ["thunderbolts", "songbird", "incredible hulk #449", "hulk #449"],
  },
  "The Incredible Hulk #181": {
    fmv: 42000,
    significance: "1st Appearance Wolverine",
    ticker: "$WLVN",
    keywords: ["wolverine", "logan", "weapon x", "incredible hulk #181", "hulk #181"],
  },
  "Star Wars: The Clone Wars #1": {
    fmv: 3400,
    significance: "1st Comic Appearance Ahsoka Tano",
    ticker: "$AHSOKA",
    keywords: ["ahsoka", "clone wars #1"],
  },
  "Hero for Hire #2": {
    fmv: 650,
    significance: "1st Appearance Claire Temple",
    ticker: "$NURSE",
    keywords: ["claire temple", "hero for hire #2"],
  },
  "Fantastic Four #1": {
    fmv: 165000,
    significance: "1st Fantastic Four & Origin",
    ticker: "$FF4",
    keywords: ["fantastic four #1", "ff #1", "ff1"],
  },
  "Detective Comics #27": {
    fmv: 850000,
    significance: "1st Appearance Batman",
    ticker: "$BTMN",
    keywords: ["detective comics #27", "tec #27", "batman debut"],
  },
  "Action Comics #1": {
    fmv: 1200000,
    significance: "1st Appearance Superman",
    ticker: "$SUPR",
    keywords: ["action comics #1", "action #1", "superman debut"],
  },
  "Daredevil #1": {
    fmv: 18500,
    significance: "1st Appearance Daredevil",
    ticker: "$DDVL",
    keywords: ["daredevil #1", "matt murdock origin"],
  },
  "The New Mutants #98": {
    fmv: 1450,
    significance: "1st Appearance Deadpool",
    ticker: "$DEAD",
    keywords: ["deadpool", "wade wilson", "new mutants #98", "nm #98"],
  },
  "Tales of Suspense #39": {
    fmv: 35000,
    significance: "1st Appearance Iron Man",
    ticker: "$IMAN",
    keywords: ["iron man", "tony stark", "tales of suspense #39", "tos #39"],
  },
  "The X-Men #1": {
    fmv: 48000,
    significance: "1st Appearance X-Men & Magneto",
    ticker: "$XMEN",
    keywords: ["x-men #1", "xmen #1", "magneto debut"],
  },
  "The Batman Adventures #12": {
    fmv: 2400,
    significance: "1st Comic Appearance Harley Quinn",
    ticker: "$HQUINN",
    keywords: ["harley quinn", "batman adventures #12", "ba #12"],
  },
  "Marvel Super Heroes Secret Wars #8": {
    fmv: 1850,
    significance: "1st Appearance Alien Symbiote / Black Suit Spider-Man",
    ticker: "$SW8",
    keywords: [
      "secret wars #8",
      "secret wars",
      "heroclix: secret wars",
      "alien symbiote",
      "black suit spider-man",
      "symbiote suit",
    ],
  },
  "Marvel Super Heroes Secret Wars #1": {
    fmv: 220,
    significance: "1st Secret Wars Event & Beyonder Debut",
    ticker: "$SW1",
    keywords: ["secret wars #1", "beyonder", "battleworld"],
  },
  "Fantastic Four #5": {
    fmv: 125000,
    significance: "1st Appearance Doctor Doom",
    ticker: "$FF5",
    keywords: ["doctor doom", "dr. doom", "victor von doom", "fantastic four #5", "ff #5"],
  },
  "The Amazing Spider-Man #300": {
    fmv: 4200,
    significance: "1st Full Appearance Venom (Eddie Brock)",
    ticker: "$ASM300",
    keywords: ["venom", "eddie brock", "amazing spider-man #300", "asm #300"],
  },
  "Ultimate Fallout #4": {
    fmv: 3100,
    significance: "1st Appearance Miles Morales (Spider-Man)",
    ticker: "$UF4",
    keywords: ["miles morales", "ultimate fallout #4", "uf #4", "spider-verse"],
  },
  "Giant-Size X-Men #1": {
    fmv: 18500,
    significance: "1st New X-Men (Storm, Colossus, Nightcrawler)",
    ticker: "$GSX1",
    keywords: ["giant-size x-men #1", "gsx #1", "all-new all-different x-men"],
  },
  "Fantastic Four #48": {
    fmv: 28000,
    significance: "1st Appearance Silver Surfer & Galactus",
    ticker: "$FF48",
    keywords: ["galactus", "silver surfer", "fantastic four #48", "ff #48"],
  },
  "Fantastic Four #52": {
    fmv: 14000,
    significance: "1st Appearance Black Panther (T'Challa)",
    ticker: "$FF52",
    keywords: ["black panther", "t'challa", "wakanda", "fantastic four #52", "ff #52"],
  },
  "Iron Man #55": {
    fmv: 4600,
    significance: "1st Appearance Thanos & Drax the Destroyer",
    ticker: "$IM55",
    keywords: ["thanos", "drax", "iron man #55"],
  },
  "Edge of Spider-Verse #2": {
    fmv: 950,
    significance: "1st Appearance Spider-Gwen (Gwen Stacy)",
    ticker: "$EOSV2",
    keywords: ["spider-gwen", "ghost-spider", "edge of spider-verse #2"],
  },
  "Spawn #1": {
    fmv: 180,
    significance: "1st Appearance Spawn (Al Simmons)",
    ticker: "$SPWN1",
    keywords: ["spawn #1", "al simmons", "todd mcfarlane"],
  },
  "Teenage Mutant Ninja Turtles #1": {
    fmv: 95000,
    significance: "1st Appearance Teenage Mutant Ninja Turtles",
    ticker: "$TMNT1",
    keywords: ["teenage mutant ninja turtles #1", "tmnt #1", "eastman and laird"],
  },
  "Journey into Mystery #83": {
    fmv: 115000,
    significance: "1st Appearance Thor & Origin",
    ticker: "$JIM83",
    keywords: ["thor origin", "journey into mystery #83", "jim #83"],
  },
  "Werewolf by Night #32": {
    fmv: 12500,
    significance: "1st Appearance Moon Knight",
    ticker: "$WBN32",
    keywords: ["moon knight", "marc spector", "werewolf by night #32"],
  },
  "The Tomb of Dracula #10": {
    fmv: 7800,
    significance: "1st Appearance Blade the Vampire Slayer",
    ticker: "$TOD10",
    keywords: ["blade", "eric brooks", "tomb of dracula #10"],
  },
};

const CATALYST_CACHE = new Map<string, CatalystAnalysis>();
const MAX_CATALYST_CACHE = 500;

/**
 * Analyzes news story headline and summary to determine market catalyst type,
 * projected volatility/sentiment impact, and linked comic equity keys.
 */
export function analyzeStoryCatalyst(headline: string, summary: string | null): CatalystAnalysis {
  const cacheKey = `${headline}|${summary || ""}`;
  const cached = CATALYST_CACHE.get(cacheKey);
  if (cached) return cached;

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
            delta7d: "+12.4%",
            delta30d: "+26.8%",
            volumeSurge: true,
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
      const matchesDirectName = text.includes(simplified);
      const matchesKeyword = data.keywords && data.keywords.some((kw) => text.includes(kw));

      if (matchesDirectName || matchesKeyword) {
        if (!seenComics.has(keyName)) {
          seenComics.add(keyName);
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
            delta7d: impactScore >= 0.8 ? "+11.5%" : "+5.2%",
            delta30d: impactScore >= 0.8 ? "+22.4%" : "+10.8%",
            volumeSurge: impactScore >= 0.75,
          });

          // If we matched a major sovereign key issue and catalyst is still generic, elevate it
          if (catalystType === "GENERAL_INDUSTRY") {
            catalystType = "FIRST_APPEARANCE_SPEC";
            catalystLabel = "Sovereign Key Equity Catalyst";
            marketImpact = "BULLISH";
            impactScore = 0.84;
            reasoning = `Direct secondary-market catalyst identified impacting certified copies of ${keyName}. Speculative search and graded census activity elevated.`;
          }
        }
        if (affectedComics.length >= 3) break;
      }
    }
  }

  const result: CatalystAnalysis = {
    catalystType,
    catalystLabel,
    marketImpact,
    impactScore,
    reasoning,
    affectedComics,
  };

  if (CATALYST_CACHE.size >= MAX_CATALYST_CACHE) {
    const oldest = CATALYST_CACHE.keys().next().value;
    if (oldest) CATALYST_CACHE.delete(oldest);
  }
  CATALYST_CACHE.set(cacheKey, result);

  return result;
}
