import { findNewsEntities, type EntityWikiDef } from "./entities";
import { analyzeStoryCatalyst, type CatalystAnalysis } from "./catalyst";
import { selectAuthorForStory, type AuthorPersona } from "./authors";

export interface MarketButterflyRipple {
  ticker: string;
  assetName: string;
  landmarkKey: string;
  direction: "surge" | "uptick" | "cooling" | "volatility";
  projectedDelta: string;
  catalystCausality: string;
}

export interface LoreDeepDiveEntry {
  term: string;
  ticker: string;
  firstAppearance: string;
  creators: string;
  era: string;
  encyclopedicLore: string;
}

export interface SynthesizedArticle {
  paragraphs: string[];
  sections: Array<{
    heading: string;
    body: string;
  }>;
  readingTimeMinutes: number;
  wordCount: number;
  entities: EntityWikiDef[];
  loreDeepDives: LoreDeepDiveEntry[];
  butterflyRipples: MarketButterflyRipple[];
  catalyst: CatalystAnalysis;
  author: AuthorPersona;
}

// Canonical encyclopedic background lore mapping for major characters, factions, and storylines
const CANONICAL_COMIC_BACKGROUNDS: Record<string, { term: string; ticker: string; landmarkIssue: string; creators: string; era: string; description: string }> = {
  "latverian witches": {
    term: "Latverian Witches (Zefiro Sorcery Coven)",
    ticker: "$DOOM:LATV",
    landmarkIssue: "Astonishing Tales #8 / Marvel Graphic Novel #49 (Triumph and Torment)",
    creators: "Gerry Conway, Gene Colan, Roger Stern, and Mike Mignola",
    era: "Bronze / Modern Age",
    description: "The mystical Romani coven of Latveria led ancestrally by Cynthia Von Doom. Drawing on ancient Balkan elemental magic and necromancy, their demonic entanglement with Mephisto formed the tragic crucible that drove Victor Von Doom to master the mystic arts alongside advanced quantum cybernetics.",
  },
  "cynthia von doom": {
    term: "Cynthia Von Doom",
    ticker: "$DOOM:CYNTHIA",
    landmarkIssue: "Astonishing Tales #8 / Triumph and Torment",
    creators: "Gerry Conway, Gene Colan, Roger Stern, and Mike Mignola",
    era: "Bronze / Modern Age",
    description: "The sorceress mother of Doctor Doom whose fateful pact with Mephisto to protect her clan condemned her soul to the Nether-Realms, establishing Doom's lifelong annual quest to liberate her spirit and forge his mastery over sorcery.",
  },
  "spider-man: brand new day": {
    term: "Spider-Man: Brand New Day",
    ticker: "$SPDR:BND",
    landmarkIssue: "The Amazing Spider-Man #546",
    creators: "Dan Slott, Marc Guggenheim, Bob Gale, Zeb Wells, Steve McNiven, and John Romita Jr.",
    era: "Modern Age (2008)",
    description: "A pivotal fresh start for Peter Parker following the controversial 'One More Day' arc, introducing Mr. Negative (Martin Li), Jackpot, and Overdrive while revitalizing the Wall-Crawler's street-level rogues gallery across tri-monthly publishing schedules.",
  },
  "claire temple": {
    term: "Claire Temple (Night Nurse)",
    ticker: "$NURSE",
    landmarkIssue: "Hero for Hire #2 (1972) / Night Nurse #1",
    creators: "Archie Goodwin and George Tuska / Jean Thomas and Winslow Mortimer",
    era: "Bronze Age (1972)",
    description: "The street-level physician and underground medic of Harlem who treated Luke Cage, Daredevil, Iron Fist, and Spider-Man. Her character synthesizes the classic 1972 Night Nurse comic legacy with modern Marvel street-level continuity.",
  },
  "spider-man": {
    term: "Spider-Man (Peter Parker)",
    ticker: "$SPDR",
    landmarkIssue: "Amazing Fantasy #15",
    creators: "Stan Lee and Steve Ditko",
    era: "Silver Age (1962)",
    description: "The definitive genesis of Peter Parker, representing the pinnacle of Marvel's Silver Age revolution and the single most valuable modern-era superhero investment equity in existence.",
  },
  "avengers: endgame": {
    term: "Avengers: Endgame",
    ticker: "$AVNG:ENDGAME",
    landmarkIssue: "The Infinity Gauntlet #1 / The Avengers #1",
    creators: "Jim Starlin, George Pérez, Ron Lim, Stan Lee, and Jack Kirby",
    era: "Silver / Copper Age",
    description: "Culminating the twenty-two film Infinity Saga, adapted from Jim Starlin's landmark 1991 cosmic crossover and Stan Lee and Jack Kirby's Silver Age foundation of Earth's Mightiest Heroes.",
  },
  "avengers: doomsday": {
    term: "Avengers: Doomsday",
    ticker: "$AVNG:DOOMSDAY",
    landmarkIssue: "Fantastic Four #5 / Secret Wars #1",
    creators: "Stan Lee, Jack Kirby, Jim Shooter, and Mike Zeck",
    era: "Silver / Copper Age",
    description: "Establishing Victor Von Doom's standing as the supreme strategic adversary of the Marvel Multiverse, bridging Latverian sorcery with cosmic reality manipulation ahead of Secret Wars.",
  },
  "avengers: secret wars": {
    term: "Avengers: Secret Wars",
    ticker: "$AVNG:SECRETWARS",
    landmarkIssue: "Marvel Super Heroes Secret Wars #1 / Secret Wars #1 (2015)",
    creators: "Jim Shooter, Mike Zeck, Jonathan Hickman, and Esad Ribić",
    era: "Copper / Modern Age",
    description: "The gold standard of multi-universe event publishing, responsible for the comic debut of the Alien Symbiote costume (The Amazing Spider-Man #252) and the multiversal Battleworld restructuring.",
  },
  "doctor doom": {
    term: "Doctor Doom (Victor Von Doom)",
    ticker: "$DOOM",
    landmarkIssue: "Fantastic Four #5",
    creators: "Stan Lee and Jack Kirby",
    era: "Silver Age (1962)",
    description: "The sovereign monarch of Latveria whose intellect and mystical prowess have solidified his first appearance as a blue-chip cornerstone of Silver Age Marvel collecting.",
  },
  "fantastic four": {
    term: "Fantastic Four (First Family)",
    ticker: "$FF4",
    landmarkIssue: "Fantastic Four #1",
    creators: "Stan Lee and Jack Kirby",
    era: "Silver Age (1961)",
    description: "The birth certificate of modern Marvel Comics, introducing Mister Fantastic (Reed Richards), Invisible Woman (Sue Storm), Human Torch (Johnny Storm), and the Thing (Ben Grimm).",
  },
  "thunderbolts": {
    term: "Thunderbolts",
    ticker: "$THUN",
    landmarkIssue: "The Incredible Hulk #449 / Thunderbolts #1",
    creators: "Kurt Busiek and Mark Bagley",
    era: "Modern Age (1997)",
    description: "One of the most celebrated twists in 1990s comic history, revealing Baron Zemo's Masters of Evil masquerading as patriotic heroes in the wake of the Onslaught event.",
  },
  "punisher": {
    term: "The Punisher (Frank Castle)",
    ticker: "$PNSH",
    landmarkIssue: "The Amazing Spider-Man #129",
    creators: "Gerry Conway, Ross Andru, and John Romita Sr.",
    era: "Bronze Age (1974)",
    description: "The ruthless vigilante Frank Castle's debut, serving as the undisputed bellwether key of Bronze Age Marvel investment and anti-hero storytelling.",
  },
  "wolverine": {
    term: "Wolverine (Logan / Weapon X)",
    ticker: "$WOLV",
    landmarkIssue: "The Incredible Hulk #181",
    creators: "Len Wein, John Romita Sr., and Herb Trimpe",
    era: "Bronze Age (1974)",
    description: "The premier Bronze Age investment holy grail, marking the full introduction of Weapon X / Logan into Marvel continuity.",
  },
  "batman": {
    term: "Batman (Bruce Wayne)",
    ticker: "$BAT",
    landmarkIssue: "Detective Comics #27",
    creators: "Bob Kane and Bill Finger",
    era: "Golden Age (1939)",
    description: "The foundational genesis of the Dark Knight and Gotham City, commanding seven-figure clearing prices at sovereign international auction houses.",
  },
  "superman": {
    term: "Superman (Kal-El / Clark Kent)",
    ticker: "$SUPR",
    landmarkIssue: "Action Comics #1",
    creators: "Jerry Siegel and Joe Shuster",
    era: "Golden Age (1938)",
    description: "The foundational birth of the entire superhero genre and the most historically significant printed comic artifact in global cultural history.",
  },
};

/**
 * Derives the Market Butterfly Effect (Asset Ripple Projections) across
 * physical comic keys based on the specific plot, studio, and character nuances.
 */
function deriveMarketButterflyRipples(
  text: string,
  entities: EntityWikiDef[]
): MarketButterflyRipple[] {
  const lower = text.toLowerCase();
  const ripples: MarketButterflyRipple[] = [];

  // 1. Latverian Witches / Doctor Doom / Fantastic Four Multiverse Complexity
  if (lower.includes("latverian") || lower.includes("witches") || (lower.includes("doom") && lower.includes("villain"))) {
    ripples.push({
      ticker: "$DOOM:LATV",
      assetName: "Astonishing Tales #8 / Triumph & Torment Keys",
      landmarkKey: "Astonishing Tales #8 (1st Cynthia von Doom & Latverian Coven)",
      direction: "surge",
      projectedDelta: "+24.5% FMV Velocity",
      catalystCausality: "Narrative pivot positioning the Latverian Witches as co-conspirators immediately redirects speculative capital from standard Doom villain keys into ancestral sorcery debuts.",
    });
    ripples.push({
      ticker: "$FF4",
      assetName: "Fantastic Four Silver Age Core Keys",
      landmarkKey: "Fantastic Four #1 / FF #5",
      direction: "uptick",
      projectedDelta: "+12.0% Bid Volume",
      catalystCausality: "Sue Storm's tactical investigation elevates First Family defensive leadership, increasing inquiry volume for high-grade Silver Age Fantastic Four keys.",
    });
    ripples.push({
      ticker: "$DOOM",
      assetName: "Doctor Doom Solo Key Index",
      landmarkKey: "Fantastic Four #5 (1st Doctor Doom)",
      direction: "cooling",
      projectedDelta: "-4.2% Short-Term Consolidation",
      catalystCausality: "Rumors questioning Doom's sole antagonist status temporarily cool over-leveraged speculation, allowing secondary prices to consolidate at historical support levels.",
    });
  }

  // 2. Spider-Man: Brand New Day & Sony Theatrical Rerelease Catalyst
  if (lower.includes("brand new day") || lower.includes("spider-man") || lower.includes("sony")) {
    ripples.push({
      ticker: "$SPDR:BND",
      assetName: "Brand New Day & Modern Rogues Debut Keys",
      landmarkKey: "The Amazing Spider-Man #546 (1st Mr. Negative & Jackpot)",
      direction: "surge",
      projectedDelta: "+32.8% Liquidity Spike",
      catalystCausality: "Theatrical rerelease with restored footage directly spotlights Dan Slott's 2008 publishing era, accelerating accumulation of CGC 9.8 modern keys.",
    });
    ripples.push({
      ticker: "$NURSE",
      assetName: "Claire Temple / Night Nurse Heritage Keys",
      landmarkKey: "Hero for Hire #2 (1st Claire Temple)",
      direction: "surge",
      projectedDelta: "+28.4% Auction Escalation",
      catalystCausality: "Restoration of Rosario Dawson's cut cameo creates an immediate crossover bridge between Netflix Marvel street-level canon and theatrical Sony/MCU timelines.",
    });
    ripples.push({
      ticker: "$PNSH",
      assetName: "Bronze Age Anti-Hero Key Index",
      landmarkKey: "The Amazing Spider-Man #129 (1st Punisher)",
      direction: "uptick",
      projectedDelta: "+8.5% Capital Absorption",
      catalystCausality: "Jon Bernthal's attached ensemble casting reinforces physical demand for Bronze Age key debuts across certified census tiers.",
    });
  }

  // 3. Avengers: Endgame Encore / Avengers: Doomsday Box Office Boost
  if (lower.includes("endgame") || lower.includes("doomsday") || lower.includes("encore") || lower.includes("avengers")) {
    ripples.push({
      ticker: "$AVNG:ENDGAME",
      assetName: "Infinity Saga & Modern Cosmic Event Keys",
      landmarkKey: "The Infinity Gauntlet #1 / Avengers #1",
      direction: "surge",
      projectedDelta: "+16.2% Clearing Spread",
      catalystCausality: "Weekend box office topping $26M reaffirms theatrical demand for ensemble Marvel events, lifting enthusiasm for Phase 6 tentpoles.",
    });
    ripples.push({
      ticker: "$AVNG:DOOMSDAY",
      assetName: "Secret Wars & Battleworld Key Equities",
      landmarkKey: "Marvel Super Heroes Secret Wars #1 (1984)",
      direction: "uptick",
      projectedDelta: "+14.0% High-Grade Spread",
      catalystCausality: "Direct narrative momentum towards December 18 Doomsday release establishes a multi-year floor for Jim Shooter and Jonathan Hickman crossover keys.",
    });
  }

  // Fallback generic ripple if no specific franchise triggered
  if (ripples.length === 0) {
    const primary = entities[0] || { term: "Benchmark Comic Equities", ticker: "$EQUITY" };
    ripples.push({
      ticker: primary.ticker || "$EQUITY",
      assetName: `${primary.term} Canonical Key Basket`,
      landmarkKey: "Primary Landmark Debut Issue",
      direction: "uptick",
      projectedDelta: "+10.5% Valuation Index",
      catalystCausality: `High-visibility syndicated reporting introduces fresh retail liquidity into certified high-grade ${primary.term} collections.`,
    });
  }

  return ripples;
}

/**
 * Parses and synthesizes a complete 5-paragraph comprehensive market intelligence article
 * from breaking headlines and syndicated wire reporting.
 */
export function parseAndSynthesizeArticle(story: {
  headline: string;
  summary: string | null;
  source: string;
  author?: string | null;
  id?: string;
}): SynthesizedArticle {
  const headline = story.headline.trim();
  const rawSummary = (story.summary || "").trim();
  const source = story.source;
  const authorPersona = selectAuthorForStory(source, story.id || headline);
  const entities = findNewsEntities(headline, rawSummary);
  const catalyst = analyzeStoryCatalyst(headline, rawSummary);

  const lowerAll = `${headline} ${rawSummary}`.toLowerCase();

  // Extract all matched lore deep dive entries
  const loreDeepDives: LoreDeepDiveEntry[] = [];
  const seenLoreKeys = new Set<string>();

  for (const [key, lore] of Object.entries(CANONICAL_COMIC_BACKGROUNDS)) {
    if (lowerAll.includes(key)) {
      if (!seenLoreKeys.has(lore.term)) {
        seenLoreKeys.add(lore.term);
        loreDeepDives.push({
          term: lore.term,
          ticker: lore.ticker,
          firstAppearance: lore.landmarkIssue,
          creators: lore.creators,
          era: lore.era,
          encyclopedicLore: lore.description,
        });
      }
    }
  }

  // Derive the Market Butterfly Effect
  const butterflyRipples = deriveMarketButterflyRipples(lowerAll, entities);

  // Identify primary studio and corporate landscape
  let studioName = "Marvel Studios";
  let studioTicker = "$MRVL";
  let studioDescription = "Walt Disney Company ($DIS) subsidiary Marvel Studios";
  if (lowerAll.includes("sony") || lowerAll.includes("spider-man")) {
    studioName = "Sony Pictures Entertainment ($SONY)";
    studioTicker = "$SONY";
    studioDescription = "Sony Group Corporation's motion picture division Sony Pictures Entertainment ($SONY)";
  } else if (lowerAll.includes("warner") || lowerAll.includes("dc") || lowerAll.includes("batman") || lowerAll.includes("superman")) {
    studioName = "Warner Bros. Discovery ($WBD) / DC Studios ($DC)";
    studioTicker = "$WBD";
    studioDescription = "Warner Bros. Discovery ($WBD) and James Gunn's DC Studios";
  } else if (lowerAll.includes("paramount") || lowerAll.includes("transformers")) {
    studioName = "Paramount Global ($PARA)";
    studioTicker = "$PARA";
    studioDescription = "Paramount Global ($PARA) theatrical division";
  } else if (lowerAll.includes("disney") || lowerAll.includes("avengers") || lowerAll.includes("mcu")) {
    studioName = "The Walt Disney Company ($DIS) / Marvel Studios ($MRVL)";
    studioTicker = "$DIS";
    studioDescription = "The Walt Disney Company ($DIS) and Marvel Studios ($MRVL)";
  }

  // Clean raw summary text to remove any existing bracketed artifacts for clean narrative insertion
  const cleanSummary = rawSummary ? rawSummary.replace(/\[\/?.*?\]/g, "").replace(/\s+/g, " ").trim() : headline;

  // Primary lore background
  const primaryLore = loreDeepDives[0] || {
    term: "Sovereign Superhero Publishing Canon",
    ticker: "$EQUITY",
    firstAppearance: "Canonical Landmark Issue",
    creators: "Legendary Creative Teams",
    era: "Historic Era",
    encyclopedicLore: "Foundational sequential art publishing that underpins multi-billion dollar global entertainment franchises.",
  };

  // --- PARAGRAPH 1: Executive Catalyst & Theatrical / Publishing Development ---
  const p1 = `${cleanSummary} This significant media development underscores tactical franchise positioning across ${studioDescription}. By orchestrating targeted theatrical releases, bonus-footage restorations, and high-profile casting attachments, studio executives are maximizing consumer engagement and creating synergistic narrative bridges across their cinematic universes.`;

  // --- PARAGRAPH 2: Encyclopedic Canon Lore & Character Heritage ---
  const p2 = `From an encyclopedic lore perspective, this reporting directly connects to ${primaryLore.term}, whose canonical lineage traces back to ${primaryLore.firstAppearance}, created by ${primaryLore.creators} in the ${primaryLore.era}. ${primaryLore.encyclopedicLore} When adaptations expand on or recontextualize these characters—such as exploring the mystical origins of Latverian sorcery, unearthing street-level Night Nurse alliances, or adapting sprawling event storylines—they spark immediate rediscovery of the original source material.`;

  // --- PARAGRAPH 3: The Market Butterfly Effect & Asset Ripple Projections ---
  const rippleHighlights = butterflyRipples
    .map((r) => `${r.assetName} (${r.ticker}) projecting ${r.projectedDelta} due to ${r.catalystCausality.toLowerCase()}`)
    .join(" ");
  const p3 = `The market butterfly effect of this development triggers distinct cross-asset ripples across physical comic equities. Rather than affecting all issues uniformly, ${rippleHighlights} In historical trading cycles, when plot rumors introduce narrative complexity or theatrical rereleases validate character longevity, speculative capital rapidly rotates into specific key issues while over-leveraged secondary positions undergo healthy price consolidation.`;

  // --- PARAGRAPH 4: Secondary Market Census Dynamics & Certified Liquidity ---
  const p4 = `Across the secondary comic marketplace, historical registry metrics from third-party grading authorities (CGC and CBCS) indicate that high-grade census copies in 9.6 and 9.8 condition experience immediate spread compression and increased auction clearing frequency. Certified blue-chip slabs listed on premier exchange venues—including Heritage Auctions, ComicLink, ComicConnect, and GoCollect—see accelerated turnover. Meanwhile, unslabbed raw inventory in Fine to Near Mint condition commands heightened dealer premiums as collectors compete to acquire grading candidates ahead of final theatrical debuts.`;

  // --- PARAGRAPH 5: Institutional Valuation Directive & Capital Boundary ---
  const p5 = `For institutional collectors and portfolio managers, ${authorPersona.writingStyle.introStyle} it is critical to maintain a strict boundary between public corporate equities and sovereign physical comic assets: while studio stock prices (${studioTicker}) reflect broad corporate macroeconomic factors, physical comic equities trade on independent certified census scarcity, historical cultural provenance, and decades of transactional clearing data. ${authorPersona.writingStyle.implicationAngle} Investors are advised to maintain core positions in certified landmark keys and track weekly auction velocity before committing fresh liquidity to speculative breakout variants.`;

  const paragraphs = [p1, p2, p3, p4, p5];
  const sections = [
    { heading: "I. Executive Catalyst & Studio Overview", body: p1 },
    { heading: "II. Encyclopedic Canon Lore & Provenance", body: p2 },
    { heading: "III. The Market Butterfly Effect (Asset Ripple Projection)", body: p3 },
    { heading: "IV. Secondary Market Census Dynamics & Slabs", body: p4 },
    { heading: "V. Institutional Valuation & Portfolio Directive", body: p5 },
  ];

  const wordCount = paragraphs.reduce((acc, p) => acc + p.split(/\s+/).length, 0);

  return {
    paragraphs,
    sections,
    readingTimeMinutes: Math.max(1, Math.ceil(wordCount / 200)),
    wordCount,
    entities,
    loreDeepDives,
    butterflyRipples,
    catalyst,
    author: authorPersona,
  };
}
