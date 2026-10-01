import { findNewsEntities, extractEntitiesFromContext, type EntityWikiDef } from "./entities";
import { analyzeStoryCatalyst, type CatalystAnalysis } from "./catalyst";
import { selectAuthorForStory, type AuthorPersona } from "./authors";
import { getLoreEntityBySlug, type LoreEntitySummary } from "@/lib/wiki/lore-search";
import { CANONICAL_COMIC_BACKGROUNDS } from "@/lib/wiki/canonical-backgrounds";
import { paraphraseInferredPlaceholders } from "./fuzzy-engine";
import adaptationCastData from "./adaptation-cast-registry.json";
import adaptationAssetData from "./adaptation-asset-registry.json";

export interface SuperheroMarketRamification {
  characterName: string;
  ticker: string;
  firstAppearance: string;
  cgc98Fmv: string;
  marketStance: "ACCUMULATE (BULLISH)" | "HOLD / MONITOR" | "CONSOLIDATION / COOLING" | "HIGH VOLATILITY";
  projectedVelocity: string;
  directStoryRamification: string;
  censusAndPricingImpact: string;
}

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

export interface ResearchedProperNoun {
  properNoun: string;
  category: "TALENT" | "CHARACTER" | "CREATOR" | "KEY_ISSUE" | "STUDIO" | "FRANCHISE";
  comicRoleOrIdentity: string;
  landmarkDebutIssue: string;
  creativeArchitects: string;
  era: string;
  cgc98Fmv: number;
  ticker: string;
  marketRelevanceThesis: string;
  investopediaPrinciple: {
    term: string;
    category?: string;
    definition: string;
    translation: string;
    url: string;
  };
}

export interface SynthesizedArticle {
  headline: string;
  paragraphs: string[];
  sections: Array<{
    heading: string;
    body: string;
  }>;
  readingTimeMinutes: number;
  wordCount: number;
  entities: EntityWikiDef[];
  loreDeepDives: LoreDeepDiveEntry[];
  superheroRamifications: SuperheroMarketRamification[];
  butterflyRipples: MarketButterflyRipple[];
  catalyst: CatalystAnalysis;
  author: AuthorPersona;
  researchedProperNouns: ResearchedProperNoun[];
}

// CANONICAL_COMIC_BACKGROUNDS is imported from @/lib/wiki/canonical-backgrounds (Single Source of Truth)

/**
 * Universal dynamic resolver for superhero market ramifications.
 * Analyzes EVERY mentioned character or faction in any story and calculates
 * the direct valuation, census, and market stance implications on their key comic issues.
 */
function deriveSuperheroMarketRamifications(
  text: string,
  entities: EntityWikiDef[],
  loreDossiers: LoreDeepDiveEntry[]
): SuperheroMarketRamification[] {
  const lower = text.toLowerCase();
  const ramifications: SuperheroMarketRamification[] = [];
  const seenCharacters = new Set<string>();

  // Helper evaluator
  const evaluateCharacter = (name: string, ticker: string, firstApp: string, baseFmvNum: number, universeDesc: string) => {
    const cleanName = name.toLowerCase();
    if (seenCharacters.has(cleanName)) return;
    seenCharacters.add(cleanName);

    let stance: SuperheroMarketRamification["marketStance"] = "ACCUMULATE (BULLISH)";
    let velocity = "+18.5% Bid Momentum";
    let storyRamification = "";
    let censusImpact = "";

    // Contextual ramifications logic
    if (cleanName.includes("doom") && (lower.includes("not real villain") || lower.includes("allies") || lower.includes("latverian"))) {
      stance = "CONSOLIDATION / COOLING";
      velocity = "-4.2% Short-Term Consolidation";
      storyRamification = "Sharing antagonist focus with the Latverian Witches diffuses speculative buying from solo Doom keys into ensemble sorcery and multiverse crossover issues.";
      censusImpact = "High-grade CGC 9.8 copies of Fantastic Four #5 find temporary price resistance around $95,000; investors look for entry points near historical moving average support.";
    } else if (cleanName.includes("latverian") || cleanName.includes("cynthia")) {
      stance = "ACCUMULATE (BULLISH)";
      velocity = "+32.0% Liquidity Surge";
      storyRamification = "Positioning ancestral Latverian sorceresses as covert puppetmasters immediately transforms obscure back-issue keys into front-line speculative targets.";
      censusImpact = "Astonishing Tales #8 and Marvel Graphic Novel #49 experience rapid inventory depletion across online dealer listings; raw copies see 2x markups within 48 hours.";
    } else if (cleanName.includes("storm") || cleanName.includes("invisible woman") || cleanName.includes("fantastic four") || cleanName.includes("reed richards")) {
      stance = "ACCUMULATE (BULLISH)";
      velocity = "+16.8% Inflow Acceleration";
      storyRamification = "Leading the investigation into multiversal incursions elevates Sue Storm and the First Family to premier defensive leadership status in the crossover hierarchy.";
      censusImpact = "Fantastic Four #1 and early Silver Age keys (#2-#10) see accelerated auction turnover and narrowing bid-ask spreads on major platforms like Heritage and ComicLink.";
    } else if (cleanName.includes("gambit") || cleanName.includes("channing")) {
      stance = "ACCUMULATE (BULLISH)";
      velocity = "+28.5% Volume Surge";
      storyRamification = "Confirmed attachment of Channing Tatum's Gambit in major ensemble Avengers and X-Men crossover warfare cements Remy LeBeau's premier status across modern cinematic timelines.";
      censusImpact = "Uncanny X-Men #266 in CGC 9.8 sees immediate buyer interest, testing upper price resistance as auction cleared lots accelerate.";
    } else if (cleanName.includes("spider-man") || cleanName.includes("brand new day")) {
      stance = "ACCUMULATE (BULLISH)";
      velocity = "+24.0% Liquidity Influx";
      storyRamification = "Theatrical rerelease and restored cameo confirmations direct renewed spotlight onto Dan Slott's 2008 publishing continuity and Mr. Negative rogues gallery debuts.";
      censusImpact = "The Amazing Spider-Man #546 CGC 9.8 population experiences heightened turnover, with raw copies commanding instant retail premiums.";
    } else if (cleanName.includes("claire temple") || cleanName.includes("night nurse") || cleanName.includes("rosario")) {
      stance = "ACCUMULATE (BULLISH)";
      velocity = "+34.5% Auction Escalation";
      storyRamification = "Restoring Claire Temple's cut cameo creates an undeniable bridge between street-level Netflix continuity and tentpole theatrical MCU timelines.";
      censusImpact = "Hero for Hire #2 (1st Claire Temple) and Night Nurse #1 experience an immediate scarcity squeeze across graded slab registries.";
    } else if (cleanName.includes("magneto") || cleanName.includes("ian mckellen") || cleanName.includes("cyclops") || cleanName.includes("x-men")) {
      stance = "ACCUMULATE (BULLISH)";
      velocity = "+19.2% Blue-Chip Inflow";
      storyRamification = "Multiverse incursion warfare drawing classic Fox X-Men legends alongside modern Avengers creates unprecedented multi-franchise collector nostalgia.";
      censusImpact = "The X-Men #1 and Giant-Size X-Men #1 cement their standing as sovereign bedrock assets, experiencing zero supply dilution.";
    } else if (cleanName.includes("doctor who") || cleanName.includes("the doctor")) {
      stance = "ACCUMULATE (BULLISH)";
      velocity = "+19.8% Global Inflow";
      storyRamification = "Global television broadcasting and serialized media milestones direct collector capital into vintage British sequential debuts and Silver Age comic runs.";
      censusImpact = "TV Comic #674 and Doctor Who Magazine #1 experience rapid inventory absorption across online auction venues; high-grade certified copies command strong baseline bids.";
    } else if (cleanName.includes("doctor strange") || cleanName.includes("stephen strange")) {
      stance = "ACCUMULATE (BULLISH)";
      velocity = "+22.4% Multiverse Inflow";
      storyRamification = "Mystical hierarchy storytelling and multiversal incursion focus re-anchor Strange Tales #110 as a blue-chip cornerstone of Silver Age Marvel collecting.";
      censusImpact = "Certified CGC 9.6 and 9.8 census copies of Strange Tales #110 command strong institutional clearing prices with tightening secondary market float.";
    } else if (cleanName.includes("doctor octopus") || cleanName.includes("doc ock") || cleanName.includes("otto octavius")) {
      stance = "ACCUMULATE (BULLISH)";
      velocity = "+16.5% Blue-Chip Inflow";
      storyRamification = "Sinister Six leadership and premier Spider-Man villain status reinforce ASM #3 as one of the most reliable blue-chip assets in the Silver Age pantheon.";
      censusImpact = "The Amazing Spider-Man #3 in certified high-grade slabs sees continuous auction turnover with resilient pricing support across all dealer tiers.";
    } else if (cleanName.includes("doctor fate") || cleanName.includes("kent nelson")) {
      stance = "ACCUMULATE (BULLISH)";
      velocity = "+14.2% Golden Age Premium";
      storyRamification = "DC mystic cornerstone status and Golden Age Justice Society of America prestige maintain More Fun Comics #55 as an elite sovereign grail target.";
      censusImpact = "Extremely low census survival numbers across all grades create instantaneous collector competition whenever authenticated copies surface.";
    } else if (cleanName.includes("doctor manhattan") || cleanName.includes("jon osterman")) {
      stance = "ACCUMULATE (BULLISH)";
      velocity = "+18.0% Modern Scarcity Inflow";
      storyRamification = "Watchmen's untouchable prestige literature status insulates Doctor Manhattan keys from transient market volatility, ensuring steady collector accumulation.";
      censusImpact = "Watchmen #1 in immaculate CGC 9.8 white-page condition maintains steady liquidity and narrow bid-ask spreads on major auction platforms.";
    } else if (cleanName.includes("mister fantastic") || cleanName.includes("reed richards")) {
      stance = "ACCUMULATE (BULLISH)";
      velocity = "+21.5% First Family Inflow";
      storyRamification = "Central tactical leadership in multiversal incursion warfare and MCU First Steps momentum accelerate buying interest in foundational Silver Age keys.";
      censusImpact = "Fantastic Four #1 sustains multi-decade sovereign status, with early run issues (#2-#10) seeing renewed capital allocation from blue-chip portfolios.";
    } else {
      stance = lower.includes("villain") || lower.includes("cast") || lower.includes("return") || lower.includes("rerelease")
        ? "ACCUMULATE (BULLISH)"
        : "HOLD / MONITOR";
      velocity = "+12.5% Steady Demand";
      storyRamification = `Reporting actively involves ${name} in the expanding media landscape, bolstering consumer awareness and cross-generational character recognition.`;
      censusImpact = `Certified high-grade census copies of ${firstApp} sustain resilient floor valuations, maintaining steady liquidity across third-party marketplaces.`;
    }

    const priceFormatted = baseFmvNum > 0 ? `$${baseFmvNum.toLocaleString()}` : "Market Benchmark";

    ramifications.push({
      characterName: name,
      ticker,
      firstAppearance: firstApp,
      cgc98Fmv: priceFormatted,
      marketStance: stance,
      projectedVelocity: velocity,
      directStoryRamification: storyRamification,
      censusAndPricingImpact: censusImpact,
    });
  };

  // 1. Process curated canonical characters matched in text
  for (const [key, lore] of Object.entries(CANONICAL_COMIC_BACKGROUNDS)) {
    if (lower.includes(key)) {
      evaluateCharacter(lore.term, lore.ticker, lore.landmarkIssue, lore.baseFmv || 1500, lore.description);
    }
  }

  // 2. Process adaptation cast members
  for (const cast of adaptationCastData as Array<{ name: string; roles: Array<{ character: string; landmarkIssue: string; comicTicker: string }>; franchises: string[] }>) {
    if (lower.includes(cast.name.toLowerCase())) {
      for (const role of cast.roles) {
        evaluateCharacter(
          `${role.character} (${cast.name})`,
          role.comicTicker || "$EQUITY",
          role.landmarkIssue,
          1850,
          `Cinematic portrayal across ${cast.franchises.join(", ")}`
        );
      }
    }
  }

  // 3. Process any remaining extracted lore entities
  for (const lore of loreDossiers) {
    if (!seenCharacters.has(lore.term.toLowerCase())) {
      evaluateCharacter(lore.term, lore.ticker, lore.firstAppearance, 2200, lore.encyclopedicLore);
    }
  }

  // 4. GUARANTEE MINIMUM 2-4 RAMIFICATIONS FOR EVERY STORY (Publisher/Genre Fallback Matrix)
  if (ramifications.length < 2) {
    if (lower.includes("dc") || lower.includes("batman") || lower.includes("superman") || lower.includes("gunn") || lower.includes("warner")) {
      evaluateCharacter("DC Universe Core Blue Chips", "$DC", "Detective Comics #27 / Action Comics #1", 850000, "Foundational DC Universe publishing bedrock.");
      evaluateCharacter("DC Studios Cinematic Catalyst Index", "$DCU", "The Brave and the Bold #28 (1st Justice League)", 42000, "High-grade Silver Age DC keys reacting to active James Gunn DCU cinematic slate development.");
    } else if (lower.includes("image") || lower.includes("spawn") || lower.includes("invincible") || lower.includes("creator") || lower.includes("kirkman") || lower.includes("mcfarlane")) {
      evaluateCharacter("Creator-Owned Premier Key Index", "$IMGC", "Spawn #1 / Savage Dragon #1 / Invincible #1", 1450, "Premier creator-owned indie keys exhibiting steady collector accumulation and grade compression.");
      evaluateCharacter("Independent Sovereign Asset Basket", "$INDIE", "The Walking Dead #1 / Saga #1", 2800, "Blue-chip independent comic book equities with deep multi-decade auction clearance histories.");
    } else if (lower.includes("dark horse") || lower.includes("hellboy") || lower.includes("mignola")) {
      evaluateCharacter("Dark Horse Premier Equities", "$DKHS", "San Diego Comic-Con Comics #2 (1st Hellboy)", 4500, "Sovereign Dark Horse indie keys driven by creator-owned prestige publishing and media options.");
    } else if (lower.includes("transformers") || lower.includes("hasbro") || lower.includes("skybound")) {
      evaluateCharacter("Energon Universe & Transformers Keys", "$TRANS", "The Transformers #1 (1984 Marvel)", 1250, "Skybound/Image publishing revival driving acute liquidity into 1980s first printing comic runs.");
    } else if (lower.includes("star trek") || lower.includes("lower decks") || lower.includes("picard") || lower.includes("spock") || lower.includes("enterprise")) {
      evaluateCharacter("Star Trek Sovereign Key Issue Index", "$TREK", "Star Trek #1 (1967 Gold Key)", 4800, "Historical Gold Key, DC, and IDW Star Trek key comic debuts.");
      evaluateCharacter("Paramount / CBS Sci-Fi Media Index", "$PARA", "Star Trek: The Next Generation #1", 320, "Certified census copies reacting to Paramount media and streaming animation continuity extensions.");
    } else if (lower.includes("star wars") || lower.includes("mandalorian") || lower.includes("grogu") || lower.includes("jedi") || lower.includes("vader")) {
      evaluateCharacter("Star Wars Sovereign Key Issue Index", "$SW", "Star Wars #1 (1977 Marvel 35¢ Price Variant)", 78000, "Benchmark Bronze Age and Modern Star Wars key debuts.");
      evaluateCharacter("The Mandalorian & Modern Star Wars Keys", "$MANDO", "Star Wars: The Mandalorian #1", 350, "Modern CGC 9.8 variant covers and first appearances reacting to active Disney+ and theatrical development.");
    } else if (lower.includes("cyberpunk") || lower.includes("neuromancer") || lower.includes("gibson") || lower.includes("blade runner") || lower.includes("akira") || lower.includes("ghost in the shell") || lower.includes("dredd") || lower.includes("transmetropolitan") || lower.includes("philip k. dick") || lower.includes("sci-fi")) {
      evaluateCharacter("Cyberpunk & Speculative Sci-Fi Keys", "$CYBER", "Akira #1 / Ghost in the Shell #1 / 2000 AD Prog #2", 450, "Pioneering cyberpunk and sci-fi graphic novel keys exhibiting resilient collector float and cultural prestige.");
      evaluateCharacter("Independent Dystopian Graphic Novel Basket", "$INDIE", "Transmetropolitan #1 / Do Androids Dream #1", 280, "Prestige mature-readers sci-fi equities with high-grade condition scarcity.");
    } else if (lower.includes("manga") || lower.includes("anime") || lower.includes("shonen") || lower.includes("dragon ball") || lower.includes("one piece") || lower.includes("berserk")) {
      evaluateCharacter("Manga Sovereign Blue-Chip Index", "$MANGA", "Weekly Shonen Jump Vintage Keys / Akira #1", 4500, "Historical Japanese sequential art and premier English-translated first printings.");
      evaluateCharacter("Modern Shonen & Seinen Catalyst Basket", "$SHONEN", "Dragon Ball / One Piece Early Volumes", 1850, "High-grade certified Japanese manga magazines and Tankōbon first printings.");
    } else if (lower.includes("heroclix") || lower.includes("wizkids") || lower.includes("warhammer") || lower.includes("miniatures") || lower.includes("tabletop")) {
      evaluateCharacter("Collectible Tabletop & Comic Cross-Equities", "$HERO", "HeroClix: Infinity Challenge / Warhammer 40k #1", 350, "Physical miniature games and licensed comic keys bridging tabletop gaming and sequential art collecting.");
      evaluateCharacter("Gaming Media & Sequential Art Benchmark", "$TOY", "Magic: The Gathering #1 / Dungeons & Dragons Keys", 420, "Cross-medium collectible gaming properties demonstrating steady collector acquisition.");
    } else if (lower.includes("marvel") || lower.includes("avengers") || lower.includes("spider") || lower.includes("x-men") || lower.includes("fantastic four") || lower.includes("hulk") || lower.includes("thor") || lower.includes("captain america")) {
      // Marvel Universe & General Sequential Art Bedrock
      evaluateCharacter("Marvel Sovereign Blue-Chip Index", "$MRVL", "Amazing Fantasy #15 / Fantastic Four #1", 285000, "Benchmark Silver Age Marvel key issue index tracking liquidity and census velocity.");
      evaluateCharacter("Modern Sequential Art Catalyst Basket", "$EQUITY", "Key Issue First Appearances", 3500, "High-grade CGC/CBCS 9.8 certified census copies exhibiting narrowing dealer bid-ask spreads.");
    } else {
      // General Sequential Art / Indie Sovereign Bedrock
      evaluateCharacter("Independent Sovereign Asset Basket", "$INDIE", "Key Issue First Appearances", 3500, "High-grade CGC/CBCS 9.8 certified census copies exhibiting narrowing dealer bid-ask spreads.");
      evaluateCharacter("Sequential Art Literary Milestone Index", "$EQUITY", "Historical Graphic Novel Debuts", 1450, "Benchmark sequential art equities exhibiting resilient collector accumulation.");
    }
  }

  return ramifications.slice(0, 8);
}

/**
 * Universal dynamic resolver for encyclopedic lore dossiers across 210,000+ entities.
 */
function resolveDynamicLoreDeepDives(text: string, entities: EntityWikiDef[]): LoreDeepDiveEntry[] {
  const lowerAll = text.toLowerCase();
  const loreDeepDives: LoreDeepDiveEntry[] = [];
  const seenTerms = new Set<string>();

  // 1. Check curated backgrounds first
  for (const [key, lore] of Object.entries(CANONICAL_COMIC_BACKGROUNDS)) {
    if (lowerAll.includes(key)) {
      if (!seenTerms.has(lore.term.toLowerCase())) {
        seenTerms.add(lore.term.toLowerCase());
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

  // 2. Resolve adaptation cast roles and talent
  for (const cast of adaptationCastData as Array<{ name: string; roles: Array<{ character: string; landmarkIssue: string; comicTicker: string; universe: string }>; franchises: string[] }>) {
    if (lowerAll.includes(cast.name.toLowerCase())) {
      for (const role of cast.roles) {
        if (!seenTerms.has(role.character.toLowerCase())) {
          seenTerms.add(role.character.toLowerCase());
          loreDeepDives.push({
            term: `${role.character} (Portrayed by ${cast.name})`,
            ticker: role.comicTicker || "$EQUITY",
            firstAppearance: role.landmarkIssue,
            creators: `Cast attachment across ${cast.franchises.join(", ")}`,
            era: role.landmarkIssue.includes("196") ? "Silver Age" : role.landmarkIssue.includes("197") ? "Bronze Age" : role.landmarkIssue.includes("198") ? "Copper Age" : "Modern Age",
            encyclopedicLore: `Major cinematic adaptation asset. The attached portrayal of ${role.character} directly channels collector demand into ${role.landmarkIssue}, serving as the primary secondary market catalyst for this equity.`,
          });
        }
      }
    }
  }

  // 3. Resolve matched entities via lore database
  for (const entity of entities) {
    const termLower = entity.term.toLowerCase();
    if (seenTerms.has(termLower)) continue;
    if (entity.type === "publisher" && !["dc studios", "marvel studios"].includes(termLower)) continue;

    const slug = entity.wikiPath ? entity.wikiPath.replace("/wiki/entry/", "").replace("/wiki?q=", "") : termLower.replace(/\s+/g, "-");
    const loreRecord = getLoreEntityBySlug(slug);

    if (loreRecord) {
      seenTerms.add(termLower);
      const firstApp = loreRecord.first_appearance || (loreRecord.landmark_debuts?.[0]?.title) || `${entity.term} Debut Issue`;
      const creators = loreRecord.creators || "Canonical Marvel / DC Creative Teams";
      const era = firstApp.includes("196") ? "Silver Age" : firstApp.includes("197") ? "Bronze Age" : firstApp.includes("198") ? "Copper Age" : firstApp.includes("193") || firstApp.includes("194") ? "Golden Age" : "Modern Age";
      const loreDesc = loreRecord.summary || `Canonical ${loreRecord.universe} character and publishing equity.`;

      loreDeepDives.push({
        term: loreRecord.title,
        ticker: loreRecord.ticker || entity.ticker || "$EQUITY",
        firstAppearance: firstApp,
        creators,
        era,
        encyclopedicLore: loreDesc,
      });
    }
  }

  return loreDeepDives.slice(0, 6);
}

/**
 * Universal dynamic resolver for the Market Butterfly Effect across any story.
 */
function deriveMarketButterflyRipples(
  text: string,
  entities: EntityWikiDef[],
  loreDossiers: LoreDeepDiveEntry[]
): MarketButterflyRipple[] {
  const lower = text.toLowerCase();
  const ripples: MarketButterflyRipple[] = [];
  const seenTickers = new Set<string>();

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
    seenTickers.add("$DOOM:LATV");

    ripples.push({
      ticker: "$FF4",
      assetName: "Fantastic Four Silver Age Core Keys",
      landmarkKey: "Fantastic Four #1 / FF #5",
      direction: "uptick",
      projectedDelta: "+12.0% Bid Volume",
      catalystCausality: "Sue Storm's tactical investigation elevates First Family defensive leadership, increasing inquiry volume for high-grade Silver Age Fantastic Four keys.",
    });
    seenTickers.add("$FF4");

    ripples.push({
      ticker: "$DOOM",
      assetName: "Doctor Doom Solo Key Index",
      landmarkKey: "Fantastic Four #5 (1st Doctor Doom)",
      direction: "cooling",
      projectedDelta: "-4.2% Short-Term Consolidation",
      catalystCausality: "Rumors questioning Doom's sole antagonist status temporarily cool over-leveraged speculation, allowing secondary prices to consolidate at historical support levels.",
    });
    seenTickers.add("$DOOM");
  }

  // 2. Spider-Man: Brand New Day & Sony Theatrical Rerelease Catalyst
  if (lower.includes("brand new day") || (lower.includes("spider-man") && lower.includes("rerelease")) || (lower.includes("sony") && lower.includes("spider-man"))) {
    ripples.push({
      ticker: "$SPDR:BND",
      assetName: "Brand New Day & Modern Rogues Debut Keys",
      landmarkKey: "The Amazing Spider-Man #546 (1st Mr. Negative & Jackpot)",
      direction: "surge",
      projectedDelta: "+32.8% Liquidity Spike",
      catalystCausality: "Theatrical rerelease with restored footage directly spotlights Dan Slott's 2008 publishing era, accelerating accumulation of CGC 9.8 modern keys.",
    });
    seenTickers.add("$SPDR:BND");

    ripples.push({
      ticker: "$NURSE",
      assetName: "Claire Temple / Night Nurse Heritage Keys",
      landmarkKey: "Hero for Hire #2 (1st Claire Temple)",
      direction: "surge",
      projectedDelta: "+28.4% Auction Escalation",
      catalystCausality: "Restoration of Rosario Dawson's cut cameo creates an immediate crossover bridge between Netflix Marvel street-level canon and theatrical Sony/MCU timelines.",
    });
    seenTickers.add("$NURSE");

    ripples.push({
      ticker: "$PNSH",
      assetName: "Bronze Age Anti-Hero Key Index",
      landmarkKey: "The Amazing Spider-Man #129 (1st Punisher)",
      direction: "uptick",
      projectedDelta: "+8.5% Capital Absorption",
      catalystCausality: "Jon Bernthal's attached ensemble casting reinforces physical demand for Bronze Age key debuts across certified census tiers.",
    });
    seenTickers.add("$PNSH");
  }

  // Star Trek / Sci-Fi
  if (lower.includes("star trek") || lower.includes("lower decks") || lower.includes("picard") || lower.includes("enterprise")) {
    ripples.push({
      ticker: "$TREK",
      assetName: "Star Trek Key Issue Basket",
      landmarkKey: "Star Trek #1 (1967 Gold Key)",
      direction: "uptick",
      projectedDelta: "+14.2% Float Velocity",
      catalystCausality: "Series continuation and new collection announcements channel speculative interest into certified Gold Key debuts and modern IDW comic runs.",
    });
    seenTickers.add("$TREK");
  }

  // Star Wars / Sci-Fi
  if (lower.includes("star wars") || lower.includes("mandalorian") || lower.includes("grogu")) {
    ripples.push({
      ticker: "$SW",
      assetName: "Star Wars Bronze & Modern Keys",
      landmarkKey: "Star Wars #1 (1977 Marvel)",
      direction: "surge",
      projectedDelta: "+22.5% Liquidity Surge",
      catalystCausality: "Streaming and cinematic franchise momentum directs fresh collector capital into canonical Bronze Age first printings and key first appearances.",
    });
    seenTickers.add("$SW");
  }

  // Doctor Who / Sci-Fi
  if (lower.includes("doctor who") || lower.includes("the doctor") || lower.includes("tardis") || lower.includes("dalek") || lower.includes("time lord") || lower.includes("whovian")) {
    ripples.push({
      ticker: "$DWHO",
      assetName: "Doctor Who British Sequential Key Basket",
      landmarkKey: "TV Comic #674 (1964) / Doctor Who Magazine #1",
      direction: "surge",
      projectedDelta: "+19.8% Global Inflow",
      catalystCausality: "Streaming expansion and regeneration storylines direct global collector capital into certified vintage British comic debuts and key character appearances.",
    });
    seenTickers.add("$DWHO");
  }

  // Doctor Strange / Marvel Supernatural & Multiverse
  if (lower.includes("doctor strange") || lower.includes("stephen strange") || lower.includes("sorcerer supreme") || lower.includes("sanctum")) {
    ripples.push({
      ticker: "$STRG",
      assetName: "Doctor Strange & Mystic Marvel Keys",
      landmarkKey: "Strange Tales #110 (1st Doctor Strange)",
      direction: "surge",
      projectedDelta: "+22.4% Blue-Chip Acceleration",
      catalystCausality: "Multiversal narrative escalation elevates Silver Age mystic debuts, tightening dealer float on certified Strange Tales keys.",
    });
    seenTickers.add("$STRG");
  }

  // Doctor Fate / DC Golden Age Sorcery
  if (lower.includes("doctor fate") || lower.includes("kent nelson") || lower.includes("helmet of nabu") || lower.includes("jsa")) {
    ripples.push({
      ticker: "$FATE",
      assetName: "Doctor Fate Golden Age Benchmark Index",
      landmarkKey: "More Fun Comics #55 (1st Doctor Fate)",
      direction: "uptick",
      projectedDelta: "+14.2% Grail Accumulation",
      catalystCausality: "Prestige Golden Age DC debuts sustain unmatched scarcity, with collector capital concentrating into authenticated copies of More Fun Comics #55.",
    });
    seenTickers.add("$FATE");
  }

  // Doctor Octopus / Sinister Six Keys
  if (lower.includes("doctor octopus") || lower.includes("doc ock") || lower.includes("otto octavius")) {
    ripples.push({
      ticker: "$DOC",
      assetName: "Doctor Octopus & Sinister Six Keys",
      landmarkKey: "The Amazing Spider-Man #3 (1st Doctor Octopus)",
      direction: "uptick",
      projectedDelta: "+16.5% Liquidity Surge",
      catalystCausality: "High-grade Silver Age Spider-Man rogue keys experience accelerated auction clearance and narrowing spreads.",
    });
    seenTickers.add("$DOC");
  }

  // Mister Fantastic / First Family Bedrock
  if (lower.includes("mister fantastic") || lower.includes("reed richards") || (lower.includes("fantastic four") && lower.includes("first steps"))) {
    ripples.push({
      ticker: "$FF4",
      assetName: "Fantastic Four First Family Bedrock",
      landmarkKey: "Fantastic Four #1 (1961 Marvel)",
      direction: "surge",
      projectedDelta: "+21.5% Blue-Chip Demand",
      catalystCausality: "Cinematic leadership positioning strengthens institutional demand for certified Silver Age Fantastic Four foundation keys.",
    });
    seenTickers.add("$FF4");
  }

  // Cyberpunk & Speculative Fiction Graphic Novels
  if (lower.includes("cyberpunk") || lower.includes("neuromancer") || lower.includes("gibson") || lower.includes("blade runner") || lower.includes("akira") || lower.includes("ghost in the shell") || lower.includes("transmetropolitan")) {
    ripples.push({
      ticker: "$CYBER",
      assetName: "Cyberpunk & Speculative Sci-Fi Graphic Novel Index",
      landmarkKey: "Akira #1 (1988) / Neuromancer Graphic Novel (1989)",
      direction: "surge",
      projectedDelta: "+21.4% Liquidity Acceleration",
      catalystCausality: "Curated cyberpunk reading lists and genre spotlights trigger fresh secondary market accumulation across vintage English-translated manga and sci-fi graphic novel keys.",
    });
    seenTickers.add("$CYBER");
  }

  // Manga & International Sequential Art
  if (lower.includes("manga") || lower.includes("anime") || lower.includes("shonen") || lower.includes("dragon ball") || lower.includes("one piece")) {
    ripples.push({
      ticker: "$MANGA",
      assetName: "Manga & International Sequential Art Index",
      landmarkKey: "Weekly Shonen Jump Debut Issues / Akira #1",
      direction: "surge",
      projectedDelta: "+26.8% Global Inflow",
      catalystCausality: "Expanding global streaming and reading audiences channel cross-border liquidity into certified high-grade vintage manga keys and premiere English publication issues.",
    });
    seenTickers.add("$MANGA");
  }

  // Tabletop & Gaming Crossovers
  if (lower.includes("heroclix") || lower.includes("wizkids") || lower.includes("warhammer") || lower.includes("miniatures") || lower.includes("tabletop")) {
    ripples.push({
      ticker: "$HERO",
      assetName: "Collectible Gaming & Sequential Art Crossover Index",
      landmarkKey: "HeroClix: Infinity Challenge / Warhammer 40k #1",
      direction: "uptick",
      projectedDelta: "+15.6% Secondary Turn",
      catalystCausality: "Tabletop expansion and competitive tournament circuits stimulate cross-medium interest in foundational superhero and sci-fi gaming keys.",
    });
    seenTickers.add("$HERO");
  }

  // 3. Dynamic generation for cast and lore dossiers
  for (const lore of loreDossiers) {
    if (seenTickers.has(lore.ticker)) continue;
    seenTickers.add(lore.ticker);

    const isSurge = lower.includes("cast") || lower.includes("villain") || lower.includes("rerelease") || lower.includes("return") || lower.includes("record") || lower.includes("trailer");
    const delta = isSurge ? `+${(18 + (lore.term.length % 15)).toFixed(1)}% Liquidity Spike` : `+${(8 + (lore.term.length % 10)).toFixed(1)}% Clearing Spread`;
    const dir: "surge" | "uptick" = isSurge ? "surge" : "uptick";

    ripples.push({
      ticker: lore.ticker,
      assetName: `${lore.term} Key Issue Basket`,
      landmarkKey: lore.firstAppearance,
      direction: dir,
      projectedDelta: delta,
      catalystCausality: `High-visibility reporting directly spotlights ${lore.term}, accelerating collector inquiries and auction clearing velocity across certified ${lore.era} copies.`,
    });

    if (ripples.length >= 6) break;
  }

  // 4. Fallback default if ripples still empty
  if (ripples.length === 0) {
    const validEntity = entities.find(
      (e) =>
        e.term &&
        e.term.length > 2 &&
        !["the top", "top", "the", "how to", "best"].includes(e.term.toLowerCase()) &&
        (e.type === "character" || e.type === "equity" || e.type === "publisher")
    );
    const primary = validEntity || { term: "Independent Sequential Art Basket", ticker: "$INDIE" };
    ripples.push({
      ticker: primary.ticker || "$INDIE",
      assetName: `${primary.term} Canonical Key Basket`,
      landmarkKey: "Primary Landmark Debut Issue",
      direction: "uptick",
      projectedDelta: "+10.5% Valuation Index",
      catalystCausality: `High-visibility syndicated reporting introduces fresh retail liquidity into certified high-grade ${primary.term} collections.`,
    });
  }

  return ripples.slice(0, 6);
}

const RENOWNED_CREATORS_MAP: Record<
  string,
  {
    displayName: string;
    role: string;
    landmark: string;
    era: string;
    creators: string;
    fmv: number;
    ticker: string;
    thesis: string;
  }
> = {
  "stan lee": {
    displayName: "Stan Lee",
    role: "Co-Creator & Foundational Architect of Marvel Universe",
    landmark: "Fantastic Four #1 (1961) / Amazing Fantasy #15",
    era: "Silver Age (1961)",
    creators: "Stan Lee, Jack Kirby, and Steve Ditko",
    fmv: 165000,
    ticker: "$MRVL",
    thesis: "Stan Lee's co-creations anchor the most liquid blue-chip sovereign comic keys in global auction history.",
  },
  "jack kirby": {
    displayName: "Jack Kirby",
    role: "The King of Comics & Co-Creator of Fantastic Four, X-Men, Avengers, Captain America",
    landmark: "Captain America Comics #1 (1941) / Fantastic Four #1 (1961)",
    era: "Golden / Silver Age",
    creators: "Jack Kirby, Joe Simon, and Stan Lee",
    fmv: 850000,
    ticker: "$FF4",
    thesis: "Jack Kirby's dynamic cosmic pencil craft establishes sovereign collectible grails across Golden and Silver Age certified slabs.",
  },
  "steve ditko": {
    displayName: "Steve Ditko",
    role: "Co-Creator and Definitive Visual Architect of Spider-Man and Doctor Strange",
    landmark: "Amazing Fantasy #15 (1962) / Strange Tales #110 (1963)",
    era: "Silver Age (1962)",
    creators: "Stan Lee and Steve Ditko",
    fmv: 285000,
    ticker: "$SPDR",
    thesis: "Steve Ditko's psychological and surrealist character designs established the bedrock of Marvel's highest-valued comic equities.",
  },
  "dan slott": {
    displayName: "Dan Slott",
    role: "Writer & 10-Year Architect of The Amazing Spider-Man Modern Era",
    landmark: "The Amazing Spider-Man #546 (2008) / Superior Spider-Man #1",
    era: "Modern Age (2008)",
    creators: "Dan Slott, Steve McNiven, and Ryan Stegman",
    fmv: 450,
    ticker: "$SPDR:BND",
    thesis: "Dan Slott's prolific modern run introduced key rogues (Mister Negative, Jackpot) and storylines that continue to drive modern variant price spikes.",
  },
  "jonathan hickman": {
    displayName: "Jonathan Hickman",
    role: "Architect of Modern Marvel Multiverse, Secret Wars, and House of X",
    landmark: "Fantastic Four #570 / Secret Wars #1 / House of X #1",
    era: "Modern Age (2009-2019)",
    creators: "Jonathan Hickman, Esad Ribic, and Pepe Larraz",
    fmv: 350,
    ticker: "$FF4",
    thesis: "Hickman's high-concept incursion narratives form the direct creative foundation for upcoming Marvel Studios Multiverse Saga films.",
  },
  "chris claremont": {
    displayName: "Chris Claremont",
    role: "Master Architect of The Uncanny X-Men Modern Mythology",
    landmark: "X-Men #94 (1975) / Uncanny X-Men #266 (1st Gambit)",
    era: "Bronze / Copper Age",
    creators: "Chris Claremont, Dave Cockrum, John Byrne, and Jim Lee",
    fmv: 1100,
    ticker: "$XMEN",
    thesis: "Claremont's 16-year unbroken run defined modern mutant lore, creating sovereign investment keys with resilient high-grade census demand.",
  },
  "todd mcfarlane": {
    displayName: "Todd McFarlane",
    role: "Creator of Spawn, Co-Creator of Venom, Co-Founder of Image Comics",
    landmark: "The Amazing Spider-Man #300 (1988) / Spawn #1 (1992)",
    era: "Copper / Modern Age",
    creators: "Todd McFarlane and David Michelinie",
    fmv: 3800,
    ticker: "$SPWN",
    thesis: "McFarlane's hyper-detailed aesthetic and creator-owned sovereignty proved that independent comic books can outperform corporate studio equities.",
  },
  "alan moore": {
    displayName: "Alan Moore",
    role: "Visionary Author of Watchmen, V for Vendetta, and From Hell",
    landmark: "Watchmen #1 (1986) / Swamp Thing #37 (1st John Constantine)",
    era: "Copper Age (1986)",
    creators: "Alan Moore, Dave Gibbons, and Stephen Bissette",
    fmv: 950,
    ticker: "$WTCH",
    thesis: "Moore's deconstructionist masterpieces established comic books as institutional literature, preserving steady collector float and grade premiums.",
  },
  "james gunn": {
    displayName: "James Gunn",
    role: "Writer-Director & Co-CEO of DC Studios",
    landmark: "Action Comics #1 / The Brave and the Bold #28 / The Authority #1",
    era: "Modern Cinematic / Golden Age Roots",
    creators: "James Gunn, Jerry Siegel, Joe Shuster, and Warren Ellis",
    fmv: 1200000,
    ticker: "$DC",
    thesis: "James Gunn's DC Universe revitalization creates immediate secondary market volume for spotlighted characters across Silver and Modern eras.",
  },
  "matt shakman": {
    displayName: "Matt Shakman",
    role: "Director of Fantastic Four: First Steps & WandaVision",
    landmark: "Fantastic Four #1 (1961) / Vision and the Scarlet Witch #1",
    era: "Silver / Bronze Age",
    creators: "Matt Shakman, Stan Lee, Jack Kirby, and Bill Mantlo",
    fmv: 165000,
    ticker: "$FF4",
    thesis: "Shakman's retro-futurist 1960s aesthetic directly reconnects mainstream audiences to the original Silver Age Lee/Kirby comic genesis.",
  },
  "destin daniel cretton": {
    displayName: "Destin Daniel Cretton",
    role: "Director of Spider-Man 4 & Shang-Chi",
    landmark: "Amazing Fantasy #15 / Special Marvel Edition #15",
    era: "Silver / Bronze Age",
    creators: "Destin Daniel Cretton, Stan Lee, Steve Ditko, and Steve Englehart",
    fmv: 3200,
    ticker: "$SPDR",
    thesis: "Cretton's attached direction elevates street-level Marvel and martial arts key issues into premier investment targets.",
  },
  "robert downey jr.": {
    displayName: "Robert Downey Jr.",
    role: "Actor portraying Doctor Doom (Victor Von Doom) & Iron Man",
    landmark: "Fantastic Four #5 (1962) / Tales of Suspense #39",
    era: "Silver Age (1962)",
    creators: "Stan Lee and Jack Kirby",
    fmv: 95000,
    ticker: "$DOOM",
    thesis: "RDJ's dual legacy across Iron Man and Doctor Doom represents the largest individual talent catalyst in comic entertainment history.",
  },
  "pedro pascal": {
    displayName: "Pedro Pascal",
    role: "Actor portraying Mister Fantastic (Reed Richards) & Din Djarin",
    landmark: "Fantastic Four #1 (1961) / Star Wars: The Mandalorian #1",
    era: "Silver Age (1961)",
    creators: "Stan Lee and Jack Kirby",
    fmv: 165000,
    ticker: "$FF4",
    thesis: "Pascal's premier casting cements Mister Fantastic as the central defensive leadership figure of upcoming multiversal phases.",
  },
  "channing tatum": {
    displayName: "Channing Tatum",
    role: "Actor portraying Gambit (Remy LeBeau)",
    landmark: "Uncanny X-Men #266 (1990)",
    era: "Copper Age (1990)",
    creators: "Chris Claremont and Jim Lee",
    fmv: 1100,
    ticker: "$GMBT",
    thesis: "Tatum's attached portrayal in Deadpool & Wolverine and Avengers crossover slates triggered a multi-year trading volume record for UXM #266.",
  },
  "rosario dawson": {
    displayName: "Rosario Dawson",
    role: "Actor portraying Claire Temple (Night Nurse) & Ahsoka Tano",
    landmark: "Hero for Hire #2 (1972) / Star Wars: Ahsoka #1",
    era: "Bronze / Modern Age",
    creators: "Archie Goodwin, George Tuska, and Dave Filoni",
    fmv: 480,
    ticker: "$NURSE",
    thesis: "Restoring Dawson's cameo connects street-level Marvel canon to theatrical timelines, tightening dealer float on early Luke Cage keys.",
  },
  "jon bernthal": {
    displayName: "Jon Bernthal",
    role: "Actor portraying The Punisher (Frank Castle)",
    landmark: "The Amazing Spider-Man #129 (1974)",
    era: "Bronze Age (1974)",
    creators: "Gerry Conway, Ross Andru, and John Romita Sr.",
    fmv: 14500,
    ticker: "$PNSH",
    thesis: "Bernthal's attachment to Daredevil: Born Again and MCU film slates cements ASM #129 as the premier Bronze Age anti-hero investment bellwether.",
  },
  "hugh jackman": {
    displayName: "Hugh Jackman",
    role: "Actor portraying Wolverine (Logan / Weapon X)",
    landmark: "The Incredible Hulk #181 (1974)",
    era: "Bronze Age (1974)",
    creators: "Len Wein, John Romita Sr., and Herb Trimpe",
    fmv: 42000,
    ticker: "$WOLV",
    thesis: "Jackman's 25-year sovereign portrayal of Wolverine anchors Hulk #181 as the single most liquid high-value key in Bronze Age history.",
  },
  "ryan reynolds": {
    displayName: "Ryan Reynolds",
    role: "Actor portraying Deadpool (Wade Wilson)",
    landmark: "The New Mutants #98 (1991)",
    era: "Copper / Modern Age (1991)",
    creators: "Fabian Nicieza and Rob Liefeld",
    fmv: 2400,
    ticker: "$DEAD",
    thesis: "Reynolds' box office sovereign comedy action franchise transformed New Mutants #98 into the definitive high-volume modern market grail.",
  },
  "david corenswet": {
    displayName: "David Corenswet",
    role: "Actor portraying Superman (Clark Kent / Kal-El)",
    landmark: "Action Comics #1 (1938)",
    era: "Golden Age (1938)",
    creators: "Jerry Siegel and Joe Shuster",
    fmv: 1200000,
    ticker: "$SUPR",
    thesis: "Corenswet's role as the foundation of James Gunn's DC Universe redirects institutional capital back into historic Golden Age bedrock grails.",
  },
  "william gibson": {
    displayName: "William Gibson",
    role: "Novelist & Foundational Pioneer of Cyberpunk (Neuromancer)",
    landmark: "Neuromancer Graphic Novel #1 (1989 Epic Comics)",
    era: "Copper Age (1989)",
    creators: "William Gibson, Tom de Haven, and Bruce Jensen",
    fmv: 220,
    ticker: "$CYBER",
    thesis: "Gibson coined 'cyberspace' and engineered the neon-dystopian matrix aesthetic that established cyberpunk as an enduring speculative graphic novel category.",
  },
  "philip k. dick": {
    displayName: "Philip K. Dick",
    role: "Visionary Sci-Fi Author (Do Androids Dream of Electric Sheep?)",
    landmark: "Do Androids Dream of Electric Sheep? #1 (2009 BOOM! Studios)",
    era: "Modern Age (2009)",
    creators: "Philip K. Dick and Tony Parker",
    fmv: 180,
    ticker: "$CYBER",
    thesis: "Dick's speculative fiction inspired Blade Runner and definitive comic adaptations that trade as premier crossover sci-fi literature keys.",
  },
  "katsuhiro otomo": {
    displayName: "Katsuhiro Otomo",
    role: "Creator of Akira & Master of Cyberpunk Sequential Art",
    landmark: "Akira #1 (1988 Marvel/Epic Comics)",
    era: "Copper Age (1988)",
    creators: "Katsuhiro Otomo",
    fmv: 450,
    ticker: "$MANGA",
    thesis: "Otomo's post-apocalyptic masterpiece catalyzed the western manga explosion, with Marvel/Epic first printings trading as blue-chip crossover grails.",
  },
  "masamune shirow": {
    displayName: "Masamune Shirow",
    role: "Creator of Ghost in the Shell & Appleseed",
    landmark: "Ghost in the Shell #1 (1995 Dark Horse)",
    era: "Modern Age (1995)",
    creators: "Masamune Shirow",
    fmv: 380,
    ticker: "$MANGA",
    thesis: "Shirow's exploration of cybernetic augmentation and Section 9 tactical designs established the aesthetic blueprint for modern transhumanist fiction.",
  },
  "warren ellis": {
    displayName: "Warren Ellis",
    role: "Creator of Transmetropolitan, Planetary, and The Authority",
    landmark: "Transmetropolitan #1 (1997) / Planetary #1 (1999)",
    era: "Modern Age (1997)",
    creators: "Warren Ellis and Darick Robertson",
    fmv: 280,
    ticker: "$INDIE",
    thesis: "Ellis's transhumanist and cyberpunk worldbuilding across Vertigo and Wildstorm created sovereign creator-owned staples with dedicated collector followings.",
  },
  "john wagner": {
    displayName: "John Wagner",
    role: "Co-Creator of Judge Dredd & Core Architect of 2000 AD",
    landmark: "2000 AD Prog #2 (1977)",
    era: "Bronze Age (1977)",
    creators: "John Wagner and Carlos Ezquerra",
    fmv: 3200,
    ticker: "$INDIE",
    thesis: "Wagner's Judge Dredd established the British sci-fi sequential art benchmark with 45+ years of continuous publication and enduring international grail status.",
  },
  "neil gaiman": {
    displayName: "Neil Gaiman",
    role: "Creator of The Sandman & Mythological Literature Master",
    landmark: "The Sandman #1 (1989 DC/Vertigo)",
    era: "Copper Age (1989)",
    creators: "Neil Gaiman, Sam Kieth, and Mike Dringenberg",
    fmv: 450,
    ticker: "$VERT",
    thesis: "Gaiman's Sandman elevated comic books to institutional literary recognition, insulating high-grade Vertigo keys with long-term collector demand.",
  },
  "akira toriyama": {
    displayName: "Akira Toriyama",
    role: "Creator of Dragon Ball & Global Manga Titan",
    landmark: "Weekly Shonen Jump 1984 #51 (1st Dragon Ball)",
    era: "Copper Age (1984)",
    creators: "Akira Toriyama",
    fmv: 8500,
    ticker: "$MANGA",
    thesis: "Toriyama's martial arts epic represents the foundational pillar of global shonen publishing, driving record auction clearing prices for vintage Jump keys.",
  },
  "eiichiro oda": {
    displayName: "Eiichiro Oda",
    role: "Creator of One Piece",
    landmark: "Weekly Shonen Jump 1997 #34 (1st One Piece)",
    era: "Modern Age (1997)",
    creators: "Eiichiro Oda",
    fmv: 9200,
    ticker: "$MANGA",
    thesis: "Oda's One Piece is the best-selling comic book series in history, establishing early Jump debut issues as blue-chip global equities.",
  },
};

/**
 * Researches proper nouns mentioned in the news story against the platform's
 * canonical comic backgrounds, creator directories, adaptation cast registry,
 * and Investopedia principles.
 */
export function researchProperNounsForStory(
  fullText: string,
  entities: EntityWikiDef[]
): ResearchedProperNoun[] {
  const lower = fullText.toLowerCase();
  const results: ResearchedProperNoun[] = [];
  const seenNouns = new Set<string>();

  // 1. Check Renowned Creators, Directors & Talent Map
  for (const [key, c] of Object.entries(RENOWNED_CREATORS_MAP)) {
    if (lower.includes(key)) {
      seenNouns.add(c.displayName.toLowerCase());
      results.push({
        properNoun: c.displayName,
        category: c.role.includes("Actor") ? "TALENT" : "CREATOR",
        comicRoleOrIdentity: c.role,
        landmarkDebutIssue: c.landmark,
        creativeArchitects: c.creators,
        era: c.era,
        cgc98Fmv: c.fmv,
        ticker: c.ticker,
        marketRelevanceThesis: c.thesis,
        investopediaPrinciple: {
          term: c.role.includes("Actor") ? "Key Person Value" : "Intellectual Property Asset",
          definition: c.role.includes("Actor")
            ? "The quantifiable economic value attributable to essential creative, directorial, or acting talent whose attached participation directly drives asset recognition, institutional capital, and commercial velocity."
            : "Intangible assets created by human intellect and creative work, legally protected to grant exclusive rights and generate compounding enterprise value.",
          translation: `In comic equities, talent attachments and authorial runs trigger secondary market liquidity surges, shifting speculative buying into the character's key debut issues.`,
          url: c.role.includes("Actor")
            ? "https://www.investopedia.com/terms/k/keypersoninsurance.asp"
            : "https://www.investopedia.com/terms/i/intellectualproperty.asp",
        },
      });
    }
  }

  // 2. Check Canonical Backgrounds (Heroes, Villains, Franchises)
  for (const [key, bg] of Object.entries(CANONICAL_COMIC_BACKGROUNDS)) {
    if (lower.includes(key)) {
      const cleanName = bg.term.replace(/\s*\(.*?\)/, "").trim();
      if (!seenNouns.has(cleanName.toLowerCase())) {
        seenNouns.add(cleanName.toLowerCase());
        results.push({
          properNoun: bg.term,
          category: bg.universe === "MARVEL" || bg.universe === "DC" ? "CHARACTER" : "FRANCHISE",
          comicRoleOrIdentity: bg.term,
          landmarkDebutIssue: bg.landmarkIssue,
          creativeArchitects: bg.creators,
          era: bg.era,
          cgc98Fmv: bg.baseFmv || 2500,
          ticker: bg.ticker,
          marketRelevanceThesis: bg.description,
          investopediaPrinciple: {
            term: "Alternative Investment Asset",
            definition:
              "A tangible or financial asset outside standard public equities or bonds, valued based on verified historical provenance, physical preservation condition, and structural supply inelasticity.",
            translation: `Certified high-grade key issues of ${bg.landmarkIssue} represent atomic collectible equities where physical census scarcity (CGC 9.8 population) dictates secondary price discovery.`,
            url: "https://www.investopedia.com/terms/a/alternative_investment.asp",
          },
        });
      }
    }
  }

  // 3. Check Adaptation Cast Registry
  for (const cast of adaptationCastData as Array<{ name: string; aliases: string[]; roles: Array<{ character: string; landmarkIssue: string; comicTicker: string }>; franchises: string[] }>) {
    const matched = lower.includes(cast.name.toLowerCase()) || (cast.aliases || []).some((al) => lower.includes(al.toLowerCase()));
    if (matched && !seenNouns.has(cast.name.toLowerCase())) {
      seenNouns.add(cast.name.toLowerCase());
      const primaryRole = cast.roles[0];
      if (primaryRole) {
        results.push({
          properNoun: cast.name,
          category: "TALENT",
          comicRoleOrIdentity: `${primaryRole.character} in ${cast.franchises.join(", ")}`,
          landmarkDebutIssue: primaryRole.landmarkIssue,
          creativeArchitects: `Attached adaptation talent across ${cast.franchises.join(", ")}`,
          era: primaryRole.landmarkIssue.includes("196") ? "Silver Age" : primaryRole.landmarkIssue.includes("197") ? "Bronze Age" : primaryRole.landmarkIssue.includes("198") ? "Copper Age" : "Modern Age",
          cgc98Fmv: 1850,
          ticker: primaryRole.comicTicker || "$EQUITY",
          marketRelevanceThesis: `Cinematic casting attachment directly channels speculative buying into ${primaryRole.landmarkIssue}, accelerating float turnover across certified slab registries.`,
          investopediaPrinciple: {
            term: "Key Person Value",
            definition:
              "The quantifiable economic value attributable to essential creative, directorial, or acting talent whose participation directly anchors asset prestige, institutional demand, and trading velocity.",
            translation: `In comic equities, premier talent attachments trigger immediate secondary market liquidity surges, shifting speculative buying into the character's key debut issues.`,
            url: "https://www.investopedia.com/terms/k/keypersoninsurance.asp",
          },
        });
      }
    }
  }

  // 4. Check Matched Entities from Context
  for (const ent of entities) {
    const entLower = ent.term.toLowerCase();
    if (seenNouns.has(entLower)) continue;
    if (ent.type === "character" || ent.type === "creator" || ent.type === "publisher") {
      seenNouns.add(entLower);
      const role = ent.roleDetails?.character || ent.term;
      const debut = ent.roleDetails?.landmarkIssue || `${ent.term} Benchmark Issue`;
      const ticker = ent.ticker || "$EQUITY";

      results.push({
        properNoun: ent.term,
        category: ent.type === "character" ? "CHARACTER" : ent.type === "creator" ? "CREATOR" : "STUDIO",
        comicRoleOrIdentity: role,
        landmarkDebutIssue: debut,
        creativeArchitects: "Sequential Art Creative Teams",
        era: debut.includes("196") ? "Silver Age" : debut.includes("197") ? "Bronze Age" : "Modern Age",
        cgc98Fmv: 2500,
        ticker,
        marketRelevanceThesis: `Active reporting and industry intelligence elevate ${ent.term}, directing heightened secondary market inspection into verified high-grade registry copies.`,
        investopediaPrinciple: {
          term: ent.type === "publisher" ? "Conglomerate Valuation" : "Price Discovery",
          definition:
            "The overall process by which the market determines the price of an asset through the interactions of buyers and sellers, factoring in supply, demand, risk, and new information.",
          translation: `Syndicated reporting stimulates buyer inquiries, resetting the fair market value baseline for certified high-grade copies.`,
          url: "https://www.investopedia.com/terms/p/pricediscovery.asp",
        },
      });
    }
  }

  return results.slice(0, 8);
}

/**
 * Turns the already-computed catalyst analysis, lore dossiers, superhero ramifications,
 * researched proper nouns, and market ripples into real narrative paragraphs for the article body.
 *
 * Guarantees that EVERY news story produces a sensible, cohesive 4 to 5 paragraph article:
 * 1. Wire Dispatch & Lead Reporting (authentic breaking reporting)
 * 2. Market Catalyst & Valuation Dynamics (FMV benchmarks, catalyst score, price discovery)
 * 3. Canonical Lore & Publishing Continuity (creators, debut issues, publishing era)
 * 4. Secondary Market Ramifications & Census Dynamics (CGC 9.8 census scarcity, grade compression)
 * 5. Market Butterfly Effect & Macro Spillover (studio parent public equities $DIS, $WBD, $SONY, $PARA, indices $CE70, $PPIX60)
 */
function buildAnalyticalParagraphs(
  fullText: string,
  catalyst: CatalystAnalysis,
  loreDeepDives: LoreDeepDiveEntry[],
  superheroRamifications: SuperheroMarketRamification[],
  butterflyRipples: MarketButterflyRipple[],
  researchedProperNouns: ResearchedProperNoun[]
): {
  catalystPara: string;
  lorePara: string;
  ramificationPara: string;
  macroSpillover: string;
} {
  const primaryProperNoun = researchedProperNouns[0];
  const secondaryProperNoun = researchedProperNouns[1];

  // 1. Market catalyst analysis & valuation dynamics
  const impactPhrase =
    catalyst.marketImpact === "BULLISH"
      ? "registers as an immediate bullish catalyst for the comic equities involved"
      : catalyst.marketImpact === "BEARISH"
      ? "registers as a bearish headwind that may cool near-term speculative demand"
      : catalyst.marketImpact === "VOLATILITY"
      ? "introduces elevated volatility risk and widened bid-ask spreads across affected keys"
      : "registers as a stabilizing neutral development with steady secondary baseline liquidity";

  const comicsPhrase =
    catalyst.affectedComics.length > 0
      ? ` Directly implicated key issues include ${catalyst.affectedComics
          .slice(0, 4)
          .map((c) => `${c.title} (${c.priceFormatted} CGC 9.8 FMV benchmark)`)
          .join(", ")}.`
      : primaryProperNoun
      ? ` Key issues immediately impacted include ${primaryProperNoun.landmarkDebutIssue} ($${primaryProperNoun.cgc98Fmv.toLocaleString()} CGC 9.8 FMV benchmark)${
          secondaryProperNoun ? ` and ${secondaryProperNoun.landmarkDebutIssue} ($${secondaryProperNoun.cgc98Fmv.toLocaleString()} CGC 9.8 FMV benchmark)` : ""
        }.`
      : "";

  const primaryInvestopedia = primaryProperNoun?.investopediaPrinciple?.term || "Price Discovery";

  const catalystPara = `${catalyst.catalystLabel}: ${catalyst.reasoning} From a fair market value perspective, this development ${impactPhrase}, carrying a quantitative catalyst score of ${Math.round(
    catalyst.impactScore * 100
  )}/100 on the Panel Profits valuation scale.${comicsPhrase} On the secondary trade desk, tracking this catalyst against the Investopedia financial principle of ${primaryInvestopedia} illustrates how high-visibility media attachments compress circulating float and accelerate price discovery across certified census tiers.`;

  // 2. Canonical background & publishing provenance
  let lorePara = "";
  if (researchedProperNouns.length > 0) {
    const researchItems = researchedProperNouns.slice(0, 3).map((r) => {
      return `${r.properNoun} (${r.comicRoleOrIdentity}, ticker ${r.ticker}), first appearing in ${r.landmarkDebutIssue} during the ${r.era} (${r.creativeArchitects}) -- ${r.marketRelevanceThesis}`;
    });
    lorePara = `Canonical publishing lineage & proper noun research: ${researchItems.join(" ")} Understanding the publication era—from foundational Silver Age roots to modern creator-owned milestones—remains critical for modeling historical survivorship, print runs, and long-term collector demand.`;
  } else if (loreDeepDives.length > 0) {
    const entries = loreDeepDives
      .slice(0, 3)
      .map(
        (l) =>
          `${l.term} (${l.ticker}), first appearing in ${l.firstAppearance} during the ${l.era} (${l.creators}) -- ${l.encyclopedicLore}`
      );
    lorePara = `Canonical publishing lineage & proper noun research: ${entries.join(" ")} Understanding the publication era—from foundational Silver Age roots to modern creator-owned milestones—remains critical for modeling historical survivorship, print runs, and long-term collector demand.`;
  } else {
    const lower = fullText.toLowerCase();
    if (lower.includes("star trek") || lower.includes("lower decks") || lower.includes("picard") || lower.includes("spock") || lower.includes("enterprise")) {
      lorePara = `Canonical publishing lineage & proper noun research: Within Star Trek comic publishing canon, this narrative development connects directly to a multi-decade sequential art legacy spanning Gold Key (1967), Marvel, DC, and most prominently IDW Publishing ($IDW). Classic runs and modern serialized miniseries expand the television mythology beyond the screen, directing collector interest into certified early debut issues such as Star Trek #1 (1967 Gold Key) and pivotal crossover keys. Across certified census tiers, vintage sci-fi keys demonstrate sustained collector appeal, where high-grade condition scarcity commands a resilient premium over raw reading copies.`;
    } else if (lower.includes("star wars") || lower.includes("mandalorian") || lower.includes("grogu") || lower.includes("jedi") || lower.includes("vader")) {
      lorePara = `Canonical publishing lineage & proper noun research: Within Star Wars sequential art history, this narrative arc builds on the landmark publishing lineage initiated by Marvel Comics in 1977 with Star Wars #1, expanded through Dark Horse's prolific Expanded Universe continuity, and reaffirmed in modern canonical Marvel and IDW titles ($SW). High-grade certified copies of key character debuts and premiere variant covers remain benchmark assets across the speculative collector landscape, serving as primary targets for capital rotation during major streaming and theatrical milestones.`;
    } else if (lower.includes("dc") || lower.includes("batman") || lower.includes("superman") || lower.includes("gotham") || lower.includes("gunn")) {
      lorePara = `Canonical publishing lineage & proper noun research: Within DC Comics continuity, this narrative trajectory connects directly to the historical bedrock established by Jerry Siegel, Joe Shuster, Bob Kane, and Bill Finger during the Golden Age genesis. Foundational keys such as Action Comics #1 (1938) and Detective Comics #27 (1939) anchor the sovereign benchmark of the entire superhero genre. Across subsequent Silver Age transformations and modern cinematic adaptations under DC Studios ($DC), creative shifts consistently stimulate secondary market demand for key character debuts and landmark crossover runs.`;
    } else if (lower.includes("cyberpunk") || lower.includes("neuromancer") || lower.includes("gibson") || lower.includes("blade runner") || lower.includes("akira") || lower.includes("ghost in the shell") || lower.includes("dredd") || lower.includes("transmetropolitan") || lower.includes("philip k. dick") || lower.includes("sci-fi")) {
      lorePara = `Canonical publishing lineage & proper noun research: Within speculative fiction and sequential art history, the cyberpunk movement represents a pivotal convergence of literary transhumanism and cutting-edge visual worldbuilding. Landmark literary touchstones like William Gibson's Neuromancer and Philip K. Dick's Do Androids Dream of Electric Sheep? catalyzed definitive comic adaptations alongside visionary manga masterpieces like Katsuhiro Otomo's Akira and Masamune Shirow's Ghost in the Shell ($CYBER). In western comics, John Wagner's Judge Dredd in 2000 AD Prog #2 (1977) and Warren Ellis's Transmetropolitan #1 (1997 Helix/Vertigo) proved that gritty neon dystopias command dedicated collector followings, where high-grade certified first printings sustain tight circulating float and steady multi-decade appreciation.`;
    } else if (lower.includes("manga") || lower.includes("anime") || lower.includes("shonen") || lower.includes("dragon ball") || lower.includes("one piece") || lower.includes("berserk")) {
      lorePara = `Canonical publishing lineage & proper noun research: In global sequential art, the explosive growth of Japanese manga and anime represents the single most expansive demographic shift in modern publishing. From foundational weekly anthology breakthroughs in Weekly Shonen Jump to masterworks by Akira Toriyama (Dragon Ball, 1984), Eiichiro Oda (One Piece, 1997), and Kentaro Miura (Berserk, 1989) ($MANGA), original Japanese magazine debuts and premier English-translated editions are increasingly treated as institutional collectible assets. As streaming adaptations and global fandom expand, certified high-grade early printings experience rapid secondary market price discovery.`;
    } else if (lower.includes("heroclix") || lower.includes("wizkids") || lower.includes("warhammer") || lower.includes("miniatures") || lower.includes("tabletop")) {
      lorePara = `Canonical publishing lineage & proper noun research: Across tabletop gaming and sequential art crossovers, physical collectible systems have long reinforced the economic footprint of comic book intellectual property. WizKids' pioneering launch of HeroClix in 2002 with Infinity Challenge ($HERO) merged tactical miniature combat with superhero lore, creating an enduring secondary market ecosystem for physical dials and tournament exclusives. Alongside licensed properties like Games Workshop's Warhammer 40,000, these crossovers demonstrate how multi-channel hobbyist engagement sustains baseline demand for both physical collectibles and their sequential art source material.`;
    } else if (lower.includes("image") || lower.includes("spawn") || lower.includes("kirkman") || lower.includes("mcfarlane") || lower.includes("invincible") || lower.includes("dark horse") || lower.includes("hellboy")) {
      lorePara = `Canonical publishing lineage & proper noun research: In the independent and creator-owned publishing sphere, this development highlights the enduring market power of sovereign creator equity. Breakthroughs pioneered by Image Comics and Dark Horse—such as Todd McFarlane's Spawn #1 (1992), Robert Kirkman's Invincible #1 (2003), and Mike Mignola's Hellboy in San Diego Comic-Con Comics #2 (1993)—established that high-grade creator-owned premier keys ($IMGC) retain resilient collector float and immune status from corporate editorial retcons.`;
    } else if (lower.includes("marvel") || lower.includes("avengers") || lower.includes("spider") || lower.includes("x-men") || lower.includes("fantastic four") || lower.includes("hulk") || lower.includes("thor") || lower.includes("captain america")) {
      lorePara = `Canonical publishing lineage & proper noun research: Within Marvel Comics continuity, this narrative trajectory reflects the foundational storytelling framework engineered by Stan Lee, Jack Kirby, and Steve Ditko during the Silver Age revolution. Milestone issues including Fantastic Four #1 (1961), Amazing Fantasy #15 (1962), and The Avengers #1 (1963) established the multi-universe continuity that continues to dictate both serialized comic publishing and multi-billion-dollar cinematic adaptations. Tracking the era of publication—from Silver Age genesis to Copper Age crossover milestones—remains essential for calculating historical attrition and certified census scarcity.`;
    } else {
      lorePara = `Canonical publishing lineage & proper noun research: Across foundational sequential art and speculative publishing, historical provenance remains the primary anchor of secondary market valuation. Tracking key publication eras—from Golden Age genesis and Silver Age archetype development to Modern creator-owned breakthroughs—allows market analysts to accurately model survivorship bias, CGC 9.8 registry density, and long-term collector accumulation. High-grade certified copies across historical milestones consistently outperform raw reading copies by commanding widening liquidity premiums during active media cycles.`;
    }
  }

  // 3. Secondary market ramifications & census dynamics
  const secondaryInvestopedia = secondaryProperNoun?.investopediaPrinciple?.term || "Grade Compression";
  let ramificationPara = "";
  if (superheroRamifications.length > 0) {
    const entries = superheroRamifications
      .slice(0, 3)
      .map(
        (r) =>
          `${r.characterName} (${r.ticker}) is positioned as ${r.marketStance} at ${r.projectedVelocity}: ${r.directStoryRamification} ${r.censusAndPricingImpact}`
      );
    ramificationPara = `Secondary market ramifications: ${entries.join(" ")} Certified CGC and CBCS 9.8 populations continue to exhibit pronounced grade compression, where immaculate high-grade copies command exponential valuation multiples over mid-grade census tiers. Experienced portfolio desks apply the Investopedia standard of ${secondaryInvestopedia} and track historical auction clearing prices to defend against speculative overreaction, ensuring capital is deployed at sustainable cost basis support levels.`;
  } else {
    ramificationPara = `Secondary market ramifications: Across certified census registries, high-grade CGC 9.8 and CBCS 9.8 copies are demonstrating acute grade compression, where investment-grade census copies maintain widening valuation spreads against raw reader copies. Experienced portfolio desks apply the Investopedia standard of ${secondaryInvestopedia} and track census population reports and historical auction clearing prices to provide verifiable defense against short-term market overreaction, ensuring capital is deployed at sustainable cost basis support levels.`;
  }

  // 4. Downstream ripple effects & macro spillover
  const rippleEntries = butterflyRipples
    .slice(0, 3)
    .map((r) => `${r.assetName} (${r.ticker}) is projected for a ${r.direction} of ${r.projectedDelta}: ${r.catalystCausality}`);

  const macroSpillover = `Downstream ripple effects: ${rippleEntries.join(" ")} On the macro equity front, media catalysts reverberate across parent studio conglomerates—including Walt Disney ($DIS), Warner Bros. Discovery ($WBD), Sony Pictures ($SONY), and Paramount ($PARA)—while sector indices like the CE70 ($CE70) and PPIX-60 ($PPIX60) gauge broad capital rotation across physical and fractional sequential art tranches.`;

  return {
    catalystPara,
    lorePara,
    ramificationPara,
    macroSpillover,
  };
}

/**
 * Universal dynamic parser and synthesizer for ALL news stories across the platform.
 */
export function parseAndSynthesizeArticle(story: {
  headline: string;
  summary: string | null;
  source: string;
  author?: string | null;
  id?: string;
}): SynthesizedArticle {
  const rawHeadline = story.headline.trim();
  const rawSummary = (story.summary || "").trim();
  const fullContext = `${rawHeadline} ${rawSummary}`;

  // Preserve authentic paragraphs cleanly stripped of raw HTML markup
  const rawCleanSummary = rawSummary
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n +/g, "\n")
    .trim();

  // Apply intelligent fuzzy paraphrasing to resolve placeholders (e.g. "Doctor _________ ?")
  const headline = paraphraseInferredPlaceholders(rawHeadline, fullContext);
  const cleanSummary = paraphraseInferredPlaceholders(rawCleanSummary, fullContext);

  const source = story.source;
  const authorPersona = selectAuthorForStory(source, story.id || headline);
  const baseEntities = findNewsEntities(headline, cleanSummary);
  const catalyst = analyzeStoryCatalyst(headline, cleanSummary);

  const fullText = `${headline} ${cleanSummary}`;

  // Dynamically resolve Lore Deep Dives across the 210,000+ entity index
  const loreDeepDives = resolveDynamicLoreDeepDives(fullText, baseEntities);

  // Dynamically derive Superhero Market Ramifications for every character in the story
  const superheroRamifications = deriveSuperheroMarketRamifications(fullText, baseEntities, loreDeepDives);

  // Dynamically resolve Market Butterfly Effect ripples
  const butterflyRipples = deriveMarketButterflyRipples(fullText, baseEntities, loreDeepDives);

  // Research proper nouns for comic relevance, landmark debuts, and Investopedia principles
  const researchedProperNouns = researchProperNounsForStory(fullText, baseEntities);

  const authenticParagraphs = cleanSummary
    ? cleanSummary.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
    : [headline];

  // Synthesize analytical narrative sections
  const { catalystPara, lorePara, ramificationPara, macroSpillover } = buildAnalyticalParagraphs(
    fullText,
    catalyst,
    loreDeepDives,
    superheroRamifications,
    butterflyRipples,
    researchedProperNouns
  );

  // Guarantee a cohesive 4 to 5 paragraph architecture for standard wire stories,
  // while preserving full authentic source paragraphs when 3+ are present.
  let analyticalParagraphs: string[];
  if (authenticParagraphs.length === 1) {
    // 1 authentic wire dispatch + 4 analytical sections = exactly 5 paragraphs
    analyticalParagraphs = [catalystPara, lorePara, ramificationPara, macroSpillover];
  } else if (authenticParagraphs.length === 2) {
    // 2 authentic wire paragraphs + 3 analytical sections = exactly 5 paragraphs
    analyticalParagraphs = [catalystPara, lorePara, `${ramificationPara} ${macroSpillover}`];
  } else {
    // 3+ authentic paragraphs provided by source: preserve them and append the analytical suite
    analyticalParagraphs = [catalystPara, lorePara, ramificationPara, macroSpillover];
  }

  const paragraphs = [...authenticParagraphs, ...analyticalParagraphs];

  const sections = paragraphs.map((body, i) => ({
    heading:
      i === 0
        ? "Original Reporting"
        : i === 1 && authenticParagraphs.length === 1
        ? "Market Catalyst Analysis"
        : i === 2 && authenticParagraphs.length === 1
        ? "Canonical Lore & Lineage"
        : i === 3 && authenticParagraphs.length === 1
        ? "Secondary Market Ramifications"
        : `Analysis ${i}`,
    body,
  }));

  const wordCount = paragraphs.reduce((acc, p) => acc + p.split(/\s+/).length, 0);

  // Broaden entity/lexicon linking coverage to the FULL rendered article body
  const narrativeMatchText = [
    fullText,
    ...paragraphs,
    ...researchedProperNouns.map(
      (r) => `${r.properNoun} ${r.comicRoleOrIdentity} ${r.landmarkDebutIssue} ${r.investopediaPrinciple.term}`
    ),
    ...superheroRamifications.flatMap((r) => [r.directStoryRamification, r.censusAndPricingImpact]),
    ...butterflyRipples.map((r) => r.catalystCausality),
    ...loreDeepDives.map((l) => l.encyclopedicLore),
  ].join(" \n ");
  const baseMatchedEntities = extractEntitiesFromContext(narrativeMatchText);

  // Ensure all researched proper nouns and their Investopedia principles are explicitly available in the entities list
  const entityMap = new Map<string, EntityWikiDef>();
  for (const ent of baseMatchedEntities) {
    entityMap.set(ent.term.toLowerCase(), ent);
  }

  for (const r of researchedProperNouns) {
    const nounLower = r.properNoun.toLowerCase();
    if (!entityMap.has(nounLower)) {
      entityMap.set(nounLower, {
        term: r.properNoun,
        ticker: r.ticker,
        type: r.category === "CREATOR" ? "creator" : r.category === "CHARACTER" ? "character" : "creator",
        target: "intelligence",
        wikiPath: `/wiki/entry/${nounLower.replace(/[^a-z0-9]+/g, "-")}`,
        lexiconDetails: {
          category: r.investopediaPrinciple.category || "Comic Asset Valuation",
          definition: r.investopediaPrinciple.definition,
          translation: r.investopediaPrinciple.translation,
          investopediaUrl: r.investopediaPrinciple.url,
        },
      });
    }
    const principleLower = r.investopediaPrinciple.term.toLowerCase();
    if (!entityMap.has(principleLower)) {
      entityMap.set(principleLower, {
        term: r.investopediaPrinciple.term,
        type: "market-concept",
        target: "lexicon",
        wikiPath: `/lexicon/${principleLower.replace(/[^a-z0-9]+/g, "-")}`,
        lexiconDetails: {
          category: r.investopediaPrinciple.category || "Valuation Principles",
          definition: r.investopediaPrinciple.definition,
          translation: r.investopediaPrinciple.translation,
          investopediaUrl: r.investopediaPrinciple.url,
        },
      });
    }
  }

  const entities = Array.from(entityMap.values());

  return {
    headline,
    paragraphs,
    sections,
    readingTimeMinutes: Math.max(1, Math.ceil(wordCount / 200)),
    wordCount,
    entities,
    loreDeepDives,
    superheroRamifications,
    butterflyRipples,
    catalyst,
    author: authorPersona,
    researchedProperNouns,
  };
}

