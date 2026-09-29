import fs from "fs";
import path from "path";

export interface LoreEntitySummary {
  slug: string;
  title: string;
  universe: "MARVEL" | "DC" | "STAR_WARS" | "IMAGE" | "DARK_HORSE" | "SPAWN" | "TRANSFORMERS" | string;
  type: "character" | "item" | "location" | "team" | "equity";
  reality?: string;
  alignment?: string;
  creators?: string;
  first_appearance?: string;
  summary: string;
  alter_ego?: string;
  ticker?: string;
  gadgets_and_weapons?: string[];
  locations_and_hideouts?: string[];
  super_teams?: string[];
  allies?: string[];
  rogues_gallery?: string[];
  landmark_debuts?: Array<{
    title: string;
    significance: string;
    catalogUrl: string;
    era?: string;
    assetTier?: string;
  }>;
}

interface LoreIndexData {
  total_indexed: number;
  universe_breakdown: Record<string, number>;
  universes: Record<string, Array<{ slug: string; title: string; universe: string; reality?: string; alignment?: string; creators?: string; first_appearance?: string; summary: string }>>;
  items: Array<{ slug: string; title: string; universe: string; reality?: string; creators?: string; first_appearance?: string; summary: string }>;
  locations: Array<{ slug: string; title: string; universe: string; reality?: string; creators?: string; first_appearance?: string; summary: string }>;
  teams: Array<{ slug: string; title: string; universe: string; reality?: string; creators?: string; first_appearance?: string; summary: string }>;
}

export const GENERIC_REAL_WORLD_LOCATIONS = new Set([
  "florida",
  "orlando",
  "orlando florida",
  "miami",
  "tampa",
  "california",
  "texas",
  "houston",
  "dallas",
  "austin",
  "america",
  "united states",
  "united states of america",
  "europe",
  "england",
  "great britain",
  "united kingdom",
  "london",
  "new york",
  "new york city",
  "chicago",
  "los angeles",
  "san francisco",
  "seattle",
  "boston",
  "atlanta",
  "washington",
  "washington dc",
  "paris",
  "france",
  "tokyo",
  "japan",
  "germany",
  "berlin",
  "italy",
  "rome",
  "canada",
  "toronto",
  "vancouver",
  "ontario",
  "australia",
  "sydney",
  "melbourne",
  "china",
  "beijing",
  "shanghai",
  "russia",
  "moscow",
  "africa",
  "asia",
  "brazil",
  "mexico",
  "india",
  "ireland",
  "scotland",
  "spain",
  "egypt",
  "greece",
  "state of florida",
  "florida keys",
  "state of california",
  "state of new york",
  "everglades",
  "florida everglades",
  "kentucky",
  "alabama",
  "georgia",
  "ohio",
  "michigan",
  "pennsylvania",
  "virginia",
  "arkansas",
  "central arkansas",
]);

export const LORE_OBSCURE_COLLISION_BLOCKLIST = new Set([
  "the marvel",
  "marvel-vehicle-marvel",
  "marvel universe",
  "the marvel universe",
  "the car",
  "the box",
  "the ship",
  "the gun",
  "the plane",
  "the shield",
  "the suit",
  "the sword",
  "dragons",
  "dragon",
  "dragons street gang",
  "knights",
  "shadows",
  "clowns",
  "demons",
  "angels",
  "monsters",
  "wizards",
  "aliens",
  "robots",
  "mutants",
  "agents",
  "ninjas",
  "gangs",
  "police",
  "army",
  "navy",
  "scratch",
  "risk",
  "rings",
  "elves",
  "orcs",
  "dwarfs",
  "hobbits",
  "been",
  "roger",
  "kung",
  "bunny",
  "hero",
  "films",
  "movie",
  "movies",
]);

export const TOP_TIER_HERO_WHITELIST = new Set([
  "batman",
  "superman",
  "spiderman",
  "spider-man",
  "wolverine",
  "thor",
  "hulk",
  "deadpool",
  "venom",
  "punisher",
  "daredevil",
  "joker",
  "batmobile",
  "apocalypse",
  "jubilee",
  "bucky",
  "spawn",
  "hellboy",
  "thanos",
  "galactus",
  "magneto",
  "cyclops",
  "storm",
  "colossus",
  "nightcrawler",
  "rogue",
  "gambit",
  "hawkeye",
  "carnage",
  "cable",
  "domino",
  "bishop",
  "archangel",
  "blade",
  "taskmaster",
  "sentry",
  "quicksilver",
  "asgard",
  "krypton",
  "atlantis",
  "doom",
  "banner",
  "franklin",
  "rogers",
  "carter",
]);

let cachedIndex: LoreIndexData | null = null;
let cachedSlugMap: Map<string, LoreEntitySummary> | null = null;
let cachedTitleMap: Map<string, LoreEntitySummary> | null = null;
export const KNOWN_HERO_TICKERS: Record<string, string> = {
  "spider-man": "$SPDR",
  "spiderman": "$SPDR",
  "batman": "$BAT",
  "superman": "$SUPR",
  "wolverine": "$WOLV",
  "hulk": "$HULK",
  "thor": "$THOR",
  "iron man": "$IRON",
  "captain america": "$CAP",
  "deadpool": "$DP",
  "daredevil": "$DD",
  "punisher": "$PUN",
  "the punisher": "$PUN",
  "wonder woman": "$WW",
  "the flash": "$FLSH",
  "flash": "$FLSH",
  "green lantern": "$GL",
  "aquaman": "$AQM",
  "magneto": "$MGN",
  "doctor strange": "$STRG",
  "black panther": "$BP",
  "black widow": "$BW",
  "hawkeye": "$HAWK",
  "venom": "$VENOM",
  "carnage": "$CARNAGE",
  "spawn": "$SPWN",
  "hellboy": "$HELLBOY",
  "thanos": "$THANOS",
  "galactus": "$GALACTUS",
  "silver surfer": "$SURFER",
  "cyclops": "$CYC",
  "storm": "$STORM",
  "jean grey": "$PHOENIX",
  "rogue": "$ROGUE",
  "gambit": "$GAMBIT",
  "nightcrawler": "$NIGHT",
  "beast": "$BEAST",
  "professor x": "$PROFX",
  "avengers": "$AVNG",
  "x-men": "$XMEN",
  "fantastic four": "$FF",
  "justice league": "$JL",
  "doctor doom": "$DOOM",
  "doom": "$DOOM",
  "bruce banner": "$HULK",
  "banner": "$HULK",
  "steve rogers": "$CAP",
  "peggy carter": "$CARTER",
  "agent carter": "$CARTER",
  "franklin richards": "$FF:FRANKLIN",
  "franklin": "$FF:FRANKLIN",
  "marvel cinematic universe": "$MCU",
  "mcu": "$MCU",
};

export function deriveEntityTicker(title: string, universe: string): string {
  const clean = title.trim().toLowerCase();
  if (KNOWN_HERO_TICKERS[clean]) return KNOWN_HERO_TICKERS[clean];

  const uni = (universe || "MARVEL").toUpperCase();
  const uniPrefix = uni === "MARVEL" ? "MRVL" : uni === "DC" ? "DC" : uni === "STAR_WARS" ? "SW" : uni === "IMAGE" ? "IMG" : uni === "DARK_HORSE" ? "DH" : uni === "SPAWN" ? "SPWN" : uni;

  const cleanTitle = title.replace(/[^a-zA-Z0-9\s]/g, "").trim();
  const words = cleanTitle.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    const single = words[0].toUpperCase();
    return `$${uniPrefix}:${single.slice(0, 8)}`;
  }
  const acronym = words.map((w) => w[0].toUpperCase()).join("");
  return `$${uniPrefix}:${acronym}`;
}

function loadLoreIndex(): LoreIndexData {
  if (cachedIndex) return cachedIndex;
  if (typeof window !== "undefined") {
    return {
      total_indexed: 0,
      universe_breakdown: {},
      universes: {},
      items: [],
      locations: [],
      teams: [],
    };
  }
  try {
    const indexPath = path.join(process.cwd(), "lib/wiki/multi_universe_character_index.json");
    if (fs.existsSync(indexPath)) {
      const raw = fs.readFileSync(indexPath, "utf-8");
      cachedIndex = JSON.parse(raw);
    } else {
      cachedIndex = {
        total_indexed: 0,
        universe_breakdown: {},
        universes: {},
        items: [],
        locations: [],
        teams: [],
      };
    }
  } catch {
    cachedIndex = {
      total_indexed: 0,
      universe_breakdown: {},
      universes: {},
      items: [],
      locations: [],
      teams: [],
    };
  }

  // Populate slug and title lookup maps
  cachedSlugMap = new Map();
  cachedTitleMap = new Map();
  if (cachedIndex) {
    const registerTitle = (title: string, summary: LoreEntitySummary) => {
      const clean = title.trim().toLowerCase();
      if (summary.type === "location" && GENERIC_REAL_WORLD_LOCATIONS.has(clean)) {
        return;
      }
      if (LORE_OBSCURE_COLLISION_BLOCKLIST.has(clean)) {
        return;
      }
      if (clean.length >= 3 && !cachedTitleMap!.has(clean)) {
        cachedTitleMap!.set(clean, summary);
      }
      const normalized = clean.replace(/[^\w\s-]/g, " ").replace(/\s+/g, " ").trim();
      if (LORE_OBSCURE_COLLISION_BLOCKLIST.has(normalized)) {
        return;
      }
      if (normalized.length >= 3 && !cachedTitleMap!.has(normalized)) {
        if (!(summary.type === "location" && GENERIC_REAL_WORLD_LOCATIONS.has(normalized))) {
          cachedTitleMap!.set(normalized, summary);
        }
      }
    };

    for (const [uni, chars] of Object.entries(cachedIndex.universes || {})) {
      for (const ch of chars) {
        const derivedTicker = deriveEntityTicker(ch.title, ch.universe || uni);
        const debuts = [];
        if (ch.first_appearance && typeof ch.first_appearance === "string") {
          const faClean = ch.first_appearance.replace(/\bVol\s*\d+\b/gi, "").replace(/\s+/g, " ").trim();
          debuts.push({
            title: faClean,
            significance: `1st Canonical Appearance of ${ch.title}`,
            catalogUrl: `/comics?q=${encodeURIComponent(faClean)}`,
            era: faClean.includes("196") ? "SILVER" : faClean.includes("197") ? "BRONZE" : faClean.includes("198") ? "COPPER" : "MODERN",
            assetTier: "KEY_EQUITY",
          });
        }
        const itemSummary: LoreEntitySummary = {
          slug: ch.slug,
          title: ch.title,
          universe: ch.universe || uni.toUpperCase(),
          type: "character",
          reality: ch.reality,
          alignment: ch.alignment,
          creators: ch.creators,
          first_appearance: ch.first_appearance,
          summary: ch.summary,
          ticker: derivedTicker,
          landmark_debuts: debuts,
        };
        cachedSlugMap.set(ch.slug, itemSummary);
        registerTitle(ch.title, itemSummary);
      }
    }

    for (const it of cachedIndex.items || []) {
      const itemSummary: LoreEntitySummary = {
        slug: it.slug,
        title: it.title,
        universe: it.universe,
        type: "item",
        reality: it.reality,
        creators: it.creators,
        first_appearance: it.first_appearance,
        summary: it.summary,
        ticker: deriveEntityTicker(it.title, it.universe),
      };
      cachedSlugMap.set(it.slug, itemSummary);
      registerTitle(it.title, itemSummary);
    }

    for (const loc of cachedIndex.locations || []) {
      const itemSummary: LoreEntitySummary = {
        slug: loc.slug,
        title: loc.title,
        universe: loc.universe,
        type: "location",
        reality: loc.reality,
        creators: loc.creators,
        first_appearance: loc.first_appearance,
        summary: loc.summary,
        ticker: deriveEntityTicker(loc.title, loc.universe),
      };
      cachedSlugMap.set(loc.slug, itemSummary);
      registerTitle(loc.title, itemSummary);
    }

    for (const tm of cachedIndex.teams || []) {
      const itemSummary: LoreEntitySummary = {
        slug: tm.slug,
        title: tm.title,
        universe: tm.universe,
        type: "team",
        reality: tm.reality,
        creators: tm.creators,
        first_appearance: tm.first_appearance,
        summary: tm.summary,
        ticker: deriveEntityTicker(tm.title, tm.universe),
      };
      cachedSlugMap.set(tm.slug, itemSummary);
      registerTitle(tm.title, itemSummary);
    }

    // Register adaptation cast & talent registry
    try {
      const castPath = path.join(process.cwd(), "lib/news/adaptation-cast-registry.json");
      if (fs.existsSync(castPath)) {
        const castRaw = fs.readFileSync(castPath, "utf-8");
        const castList = JSON.parse(castRaw);
        for (const actor of castList) {
          const slug = `actor-${actor.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
          const primaryRole = actor.roles[0];
          const actorSummary: LoreEntitySummary = {
            slug,
            title: actor.name,
            universe: primaryRole?.universe || "MARVEL",
            type: "character",
            alter_ego: actor.roles.map((r: any) => r.character).join(" / "),
            creators: `Film & TV Portrayals: ${actor.franchises.join(", ")}`,
            first_appearance: primaryRole?.landmarkIssue || "Comic Debut Issue",
            ticker: primaryRole?.comicTicker || "$EQUITY",
            summary: `Prominent adaptation actor portraying ${actor.roles.map((r: any) => `${r.character} (${r.universe})`).join(", ")}. Direct secondary market catalyst for ${actor.roles.map((r: any) => r.landmarkIssue).join(", ")}.`,
            landmark_debuts: actor.roles.map((r: any) => ({
              title: r.landmarkIssue,
              significance: `Portrayed ${r.character}`,
              catalogUrl: `/comics?q=${encodeURIComponent(r.landmarkIssue)}`,
              assetTier: "BLUE_CHIP_KEY",
            })),
          };
          cachedSlugMap.set(slug, actorSummary);
          registerTitle(actor.name, actorSummary);
          for (const alias of actor.aliases || []) {
            registerTitle(alias, actorSummary);
          }
        }
      }
    } catch {
      // Safe fallback
    }

    // Register adaptation asset registry (cinematic & storyline equities)
    try {
      const assetPath = path.join(process.cwd(), "lib/news/adaptation-asset-registry.json");
      if (fs.existsSync(assetPath)) {
        const assetRaw = fs.readFileSync(assetPath, "utf-8");
        const assetList = JSON.parse(assetRaw);
        for (const asset of assetList) {
          const assetSummary: LoreEntitySummary = {
            slug: asset.slug,
            title: asset.title,
            universe: asset.universe,
            type: "equity",
            creators: (asset.creators || []).join(", "),
            first_appearance: asset.landmarkIssue || "Key Issue",
            ticker: asset.ticker,
            summary: asset.summary || `Canonical ${asset.franchise} equity asset.`,
            landmark_debuts: (asset.landmarkIssues || []).map((li: any) => ({
              title: li.title,
              significance: li.significance,
              catalogUrl: li.catalogUrl,
              era: li.era,
              assetTier: li.assetTier,
            })),
            super_teams: asset.characters || [],
          };
          cachedSlugMap.set(asset.slug, assetSummary);
          registerTitle(asset.title, assetSummary);
          for (const alias of asset.aliases || []) {
            registerTitle(alias, assetSummary);
          }
        }
      }
    } catch {
      // Safe fallback
    }
  }

  return cachedIndex || {
    total_indexed: 0,
    universe_breakdown: {},
    universes: {},
    items: [],
    locations: [],
    teams: [],
  };
}

/**
 * Searches multi-universe lore index for characters, items, locations, and teams.
 */
export function searchLoreEntities(query: string, limit = 18): LoreEntitySummary[] {
  const index = loadLoreIndex();
  if (!query || !query.trim()) {
    return [];
  }

  const q = query.toLowerCase().trim();
  const results: LoreEntitySummary[] = [];

  // Helper matcher
  const matchEntry = (item: { title: string; summary?: string; creators?: string; first_appearance?: string }, type: LoreEntitySummary["type"], universe: string, slug: string, reality?: string, alignment?: string) => {
    const titleMatch = item.title.toLowerCase().includes(q);
    const faMatch = item.first_appearance?.toLowerCase().includes(q);
    const creatorMatch = item.creators?.toLowerCase().includes(q);

    if (titleMatch || faMatch || creatorMatch) {
      results.push({
        slug,
        title: item.title,
        universe,
        type,
        reality,
        alignment,
        creators: item.creators,
        first_appearance: item.first_appearance,
        summary: item.summary || "",
      });
    }
  };

  // 1. Search items & weapons first if relevant
  for (const it of index.items || []) {
    if (results.length >= limit) break;
    matchEntry(it, "item", it.universe, it.slug, it.reality);
  }

  // 2. Search locations & cities
  for (const loc of index.locations || []) {
    if (results.length >= limit) break;
    matchEntry(loc, "location", loc.universe, loc.slug, loc.reality);
  }

  // 3. Search teams
  for (const tm of index.teams || []) {
    if (results.length >= limit) break;
    matchEntry(tm, "team", tm.universe, tm.slug, tm.reality);
  }

  // 4. Search characters across universes
  for (const [uni, chars] of Object.entries(index.universes || {})) {
    for (const ch of chars) {
      if (results.length >= limit) break;
      matchEntry(ch, "character", ch.universe || uni.toUpperCase(), ch.slug, ch.reality, ch.alignment);
    }
    if (results.length >= limit) break;
  }

  return results.slice(0, limit);
}

export const CANONICAL_PREMIER_ENTITIES: Record<string, LoreEntitySummary> = {
  "doctor-doom": {
    slug: "doctor-doom",
    title: "Doctor Doom (Victor von Doom)",
    universe: "MARVEL",
    type: "character",
    reality: "Earth-616",
    alignment: "Neutral / Villain",
    creators: "Stan Lee; Jack Kirby",
    first_appearance: "Fantastic Four Vol 1 5",
    summary: "Victor von Doom is the sovereign monarch of Latveria, supreme scientific genius, and master sorcerer. Eternal arch-nemesis of the Fantastic Four and one of the most formidable entities in the Marvel Universe.",
    ticker: "$DOOM",
    landmark_debuts: [
      {
        title: "The Fantastic Four #5 (1962)",
        significance: "1st Canonical Appearance of Doctor Doom (Victor Von Doom)",
        catalogUrl: "/comics?q=Fantastic+Four+5",
        era: "SILVER",
        assetTier: "SOVEREIGN_BLUE_CHIP",
      },
      {
        title: "Secret Wars #1 (2015)",
        significance: "Jonathan Hickman & Esad Ribic crossover establishing God Emperor Doom",
        catalogUrl: "/comics?q=Secret+Wars+1",
        era: "MODERN",
        assetTier: "KEY_EQUITY",
      },
    ],
  },
  "bruce-banner": {
    slug: "bruce-banner",
    title: "Bruce Banner (The Incredible Hulk)",
    universe: "MARVEL",
    type: "character",
    reality: "Earth-616",
    alignment: "Good / Complex",
    creators: "Stan Lee; Jack Kirby",
    first_appearance: "The Incredible Hulk Vol 1 1",
    summary: "Dr. Robert Bruce Banner is a brilliant nuclear physicist irradiated by gamma radiation during an experimental bomb detonation, transforming into the green behemoth known as the Incredible Hulk.",
    ticker: "$HULK",
    landmark_debuts: [
      {
        title: "The Incredible Hulk #1 (1962)",
        significance: "1st Canonical Appearance of Bruce Banner and the Incredible Hulk",
        catalogUrl: "/comics?q=Incredible+Hulk+1",
        era: "SILVER",
        assetTier: "SOVEREIGN_BLUE_CHIP",
      },
      {
        title: "The Incredible Hulk #181 (1974)",
        significance: "Hulk battles Wolverine in iconic 1st full appearance of Wolverine",
        catalogUrl: "/comics?q=Incredible+Hulk+181",
        era: "BRONZE",
        assetTier: "SOVEREIGN_BLUE_CHIP",
      },
    ],
  },
  "steve-rogers": {
    slug: "steve-rogers",
    title: "Steve Rogers (Captain America)",
    universe: "MARVEL",
    type: "character",
    reality: "Earth-616",
    alignment: "Good",
    creators: "Joe Simon; Jack Kirby",
    first_appearance: "Captain America Comics Vol 1 1",
    summary: "Steven Grant Rogers is a World War II supersoldier enhanced to human physical perfection by the Super-Soldier Serum. Armed with an indestructible Vibranium shield, he serves as Captain America, the Sentinel of Liberty.",
    ticker: "$CAP",
    landmark_debuts: [
      {
        title: "Captain America Comics #1 (1941)",
        significance: "1st Canonical Appearance of Steve Rogers (Captain America) punching Adolf Hitler",
        catalogUrl: "/comics?q=Captain+America+Comics+1",
        era: "GOLDEN",
        assetTier: "SOVEREIGN_BLUE_CHIP",
      },
      {
        title: "The Avengers #4 (1964)",
        significance: "Silver Age Revival of Captain America unfrozen from ice; joins the Avengers",
        catalogUrl: "/comics?q=Avengers+4",
        era: "SILVER",
        assetTier: "SOVEREIGN_BLUE_CHIP",
      },
    ],
  },
  "peggy-carter": {
    slug: "peggy-carter",
    title: "Peggy Carter (Agent Carter)",
    universe: "MARVEL",
    type: "character",
    reality: "Earth-616",
    alignment: "Good",
    creators: "Stan Lee; Jack Kirby",
    first_appearance: "Tales of Suspense Vol 1 75",
    summary: "Margaret 'Peggy' Carter is a top-tier Allied intelligence officer, French Resistance fighter, founding leader of S.H.I.E.L.D., and the wartime love of Steve Rogers.",
    ticker: "$CARTER",
    landmark_debuts: [
      {
        title: "Tales of Suspense #75 (1966)",
        significance: "1st Canonical Appearance of Peggy Carter",
        catalogUrl: "/comics?q=Tales+of+Suspense+75",
        era: "SILVER",
        assetTier: "KEY_EQUITY",
      },
    ],
  },
  "franklin-richards": {
    slug: "franklin-richards",
    title: "Franklin Richards (Psi-Lord)",
    universe: "MARVEL",
    type: "character",
    reality: "Earth-616",
    alignment: "Good",
    creators: "Stan Lee; Jack Kirby",
    first_appearance: "Fantastic Four Annual Vol 1 6",
    summary: "Franklin Benjamin Richards is the Beyond-Omega level reality-warping mutant son of Mister Fantastic (Reed Richards) and the Invisible Woman (Sue Storm), capable of creating pocket universes.",
    ticker: "$FF:FRANKLIN",
    landmark_debuts: [
      {
        title: "Fantastic Four Annual #6 (1968)",
        significance: "1st Canonical Appearance and birth of Franklin Richards",
        catalogUrl: "/comics?q=Fantastic+Four+Annual+6",
        era: "SILVER",
        assetTier: "KEY_EQUITY",
      },
    ],
  },
  "thor": {
    slug: "thor",
    title: "Thor (Odinson)",
    universe: "MARVEL",
    type: "character",
    reality: "Earth-616",
    alignment: "Good",
    creators: "Stan Lee; Jack Kirby; Larry Lieber",
    first_appearance: "Journey into Mystery Vol 1 83",
    summary: "Thor Odinson is the Asgardian God of Thunder, prince of Asgard, founding member of the Avengers, and wielder of the enchanted uru hammer Mjolnir.",
    ticker: "$THOR",
    landmark_debuts: [
      {
        title: "Journey into Mystery #83 (1962)",
        significance: "1st Canonical Appearance of Thor (Odinson)",
        catalogUrl: "/comics?q=Journey+into+Mystery+83",
        era: "SILVER",
        assetTier: "SOVEREIGN_BLUE_CHIP",
      },
      {
        title: "Journey into Mystery #85 (1962)",
        significance: "1st Appearance of Loki, Odin, Heimdall, Balder, and Asgard",
        catalogUrl: "/comics?q=Journey+into+Mystery+85",
        era: "SILVER",
        assetTier: "SOVEREIGN_BLUE_CHIP",
      },
    ],
  },
  "avengers": {
    slug: "avengers",
    title: "The Avengers",
    universe: "MARVEL",
    type: "team",
    reality: "Earth-616",
    alignment: "Good",
    creators: "Stan Lee; Jack Kirby",
    first_appearance: "The Avengers Vol 1 1",
    summary: "Earth's Mightiest Heroes assembled to fight the foes no single superhero could withstand. Founding roster: Iron Man, Thor, Hulk, Ant-Man, and the Wasp.",
    ticker: "$AVNG",
    landmark_debuts: [
      {
        title: "The Avengers #1 (1963)",
        significance: "1st Appearance of the Avengers and battle against Loki",
        catalogUrl: "/comics?q=Avengers+1",
        era: "SILVER",
        assetTier: "SOVEREIGN_BLUE_CHIP",
      },
    ],
  },
  "marvel-cinematic-universe": {
    slug: "marvel-cinematic-universe",
    title: "Marvel Cinematic Universe (MCU)",
    universe: "MARVEL",
    type: "equity",
    reality: "Earth-199999",
    alignment: "Good",
    creators: "Kevin Feige; Marvel Studios",
    first_appearance: "Iron Man (2008)",
    summary: "The highest-grossing media franchise in history, spanning Phases 1 through 6, interconnecting superhero features, streaming series, and secondary market comic equities.",
    ticker: "$MCU",
    landmark_debuts: [
      {
        title: "Tales of Suspense #39 (1963)",
        significance: "1st Appearance of Iron Man (Genesis of the Cinematic Universe)",
        catalogUrl: "/comics?q=Tales+of+Suspense+39",
        era: "SILVER",
        assetTier: "SOVEREIGN_BLUE_CHIP",
      },
      {
        title: "The Avengers #1 (1963)",
        significance: "1st Team Debut of Earth's Mightiest Heroes",
        catalogUrl: "/comics?q=Avengers+1",
        era: "SILVER",
        assetTier: "SOVEREIGN_BLUE_CHIP",
      },
    ],
  },
  "claire-temple": {
    slug: "claire-temple",
    title: "Claire Temple (Night Nurse)",
    universe: "MARVEL",
    type: "character",
    reality: "Earth-616",
    alignment: "Good",
    creators: "Archie Goodwin; George Tuska",
    first_appearance: "Hero for Hire Vol 1 2",
    summary: "Dr. Claire Temple is an elite medical doctor specializing in providing underground trauma care for street-level vigilantes and superheroes across New York City.",
    ticker: "$NURSE",
    landmark_debuts: [
      {
        title: "Hero for Hire #2 (1972)",
        significance: "1st Canonical Appearance of Claire Temple",
        catalogUrl: "/comics?q=Hero+for+Hire+2",
        era: "BRONZE",
        assetTier: "KEY_EQUITY",
      },
      {
        title: "Night Nurse #1 (1972)",
        significance: "1st Issue of Linda Carter, establishing the Night Nurse mantle",
        catalogUrl: "/comics?q=Night+Nurse+1",
        era: "BRONZE",
        assetTier: "KEY_EQUITY",
      },
    ],
  },
  "night-nurse": {
    slug: "night-nurse",
    title: "Night Nurse (Claire Temple / Linda Carter)",
    universe: "MARVEL",
    type: "character",
    reality: "Earth-616",
    alignment: "Good",
    creators: "Jean Thomas; Win Mortimer; Archie Goodwin",
    first_appearance: "Night Nurse Vol 1 1",
    summary: "The Night Nurse mantle represents the clandestine medical lifeline for New York City's superhero community, pioneered by Linda Carter and popularized by Claire Temple.",
    ticker: "$NURSE",
    landmark_debuts: [
      {
        title: "Night Nurse #1 (1972)",
        significance: "1st Appearance of the Night Nurse mantle",
        catalogUrl: "/comics?q=Night+Nurse+1",
        era: "BRONZE",
        assetTier: "KEY_EQUITY",
      },
      {
        title: "Hero for Hire #2 (1972)",
        significance: "1st Appearance of Claire Temple",
        catalogUrl: "/comics?q=Hero+for+Hire+2",
        era: "BRONZE",
        assetTier: "KEY_EQUITY",
      },
    ],
  },
  "iron-man": {
    slug: "iron-man",
    title: "Iron Man (Tony Stark)",
    universe: "MARVEL",
    type: "character",
    reality: "Earth-616",
    alignment: "Good",
    creators: "Stan Lee; Larry Lieber; Don Heck; Jack Kirby",
    first_appearance: "Tales of Suspense Vol 1 39",
    summary: "Anthony Edward 'Tony' Stark is a visionary industrialist, inventor, founding Avenger, and CEO of Stark Industries who constructed the invincible Iron Man powered armor.",
    ticker: "$IRON",
    landmark_debuts: [
      {
        title: "Tales of Suspense #39 (1963)",
        significance: "1st Canonical Appearance and Origin of Iron Man (Tony Stark)",
        catalogUrl: "/comics?q=Tales+of+Suspense+39",
        era: "SILVER",
        assetTier: "SOVEREIGN_BLUE_CHIP",
      },
      {
        title: "Tales of Suspense #52 (1964)",
        significance: "1st Appearance of Black Widow (Natasha Romanoff)",
        catalogUrl: "/comics?q=Tales+of+Suspense+52",
        era: "SILVER",
        assetTier: "SOVEREIGN_BLUE_CHIP",
      },
    ],
  },
  "spider-man": {
    slug: "spider-man",
    title: "Spider-Man (Peter Parker)",
    universe: "MARVEL",
    type: "character",
    reality: "Earth-616",
    alignment: "Good",
    creators: "Stan Lee; Steve Ditko",
    first_appearance: "Amazing Fantasy Vol 1 15",
    summary: "Peter Benjamin Parker was bitten by a radioactive spider as a high school student, gaining arachnid abilities and dedicating his life to the ethos: 'With great power there must also come great responsibility.'",
    ticker: "$SPDR",
    landmark_debuts: [
      {
        title: "Amazing Fantasy #15 (1962)",
        significance: "1st Canonical Appearance of Spider-Man (Peter Parker), Uncle Ben, Aunt May",
        catalogUrl: "/comics?q=Amazing+Fantasy+15",
        era: "SILVER",
        assetTier: "SOVEREIGN_BLUE_CHIP",
      },
      {
        title: "The Amazing Spider-Man #1 (1963)",
        significance: "1st Issue of Ongoing Series; 1st Appearance of J. Jonah Jameson",
        catalogUrl: "/comics?q=Amazing+Spider-Man+1",
        era: "SILVER",
        assetTier: "SOVEREIGN_BLUE_CHIP",
      },
    ],
  },
};

const SLUG_ALIASES: Record<string, string> = {
  batman: "bruce-wayne-earth-two",
  "bruce-wayne": "bruce-wayne-earth-two",
  "dark-knight": "bruce-wayne-earth-two",
  superman: "kal-l-earth-two",
  "clark-kent": "kal-l-earth-two",
  "spider-man": "spider-man",
  spiderman: "spider-man",
  "spider-m": "spider-man",
  "peter-parker": "spider-man",
  deadpool: "wade-wilson-earth-616",
  joker: "joker-earth-two",
  wolverine: "james-howlett-earth-811",
  "doctor-doom": "doctor-doom",
  doom: "doctor-doom",
  "dr-doom": "doctor-doom",
  "victor-von-doom": "doctor-doom",
  "bruce-banner": "bruce-banner",
  banner: "bruce-banner",
  hulk: "bruce-banner",
  "the-hulk": "bruce-banner",
  "incredible-hulk": "bruce-banner",
  "steve-rogers": "steve-rogers",
  "captain-america": "steve-rogers",
  cap: "steve-rogers",
  "peggy-carter": "peggy-carter",
  "agent-carter": "peggy-carter",
  "captain-carter": "peggy-carter",
  "franklin-richards": "franklin-richards",
  franklin: "franklin-richards",
  thor: "thor",
  "thor-odinson": "thor",
  avengers: "avengers",
  "the-avengers": "avengers",
  "marvel-cinematic-universe": "marvel-cinematic-universe",
  mcu: "marvel-cinematic-universe",
  "marvel-universe": "marvel-cinematic-universe",
  "the-marvel-universe": "marvel-cinematic-universe",
  "marvel-vehicle-marvel": "marvel-cinematic-universe",
  "claire-temple": "claire-temple",
  "night-nurse": "night-nurse",
  "iron-man": "iron-man",
  "tony-stark": "iron-man",
};

/**
 * Retrieves a single lore entity by its slug.
 */
export function getLoreEntityBySlug(slug: string): LoreEntitySummary | null {
  loadLoreIndex();
  if (!slug) return null;
  const cleanSlug = slug.toLowerCase().trim();

  // 1. Direct canonical premier entity match
  if (CANONICAL_PREMIER_ENTITIES[cleanSlug]) {
    return CANONICAL_PREMIER_ENTITIES[cleanSlug];
  }

  // 2. Direct slug map match
  if (cachedSlugMap && cachedSlugMap.has(cleanSlug)) {
    return cachedSlugMap.get(cleanSlug)!;
  }

  // 3. Direct alias match
  const alias = SLUG_ALIASES[cleanSlug];
  if (alias) {
    if (CANONICAL_PREMIER_ENTITIES[alias]) {
      return CANONICAL_PREMIER_ENTITIES[alias];
    }
    if (cachedSlugMap && cachedSlugMap.has(alias)) {
      return cachedSlugMap.get(alias)!;
    }
  }

  // 4. Match by title from cachedTitleMap (e.g. "batman", "iron man")
  const titlePhrase = cleanSlug.replace(/-/g, " ");
  if (cachedTitleMap && cachedTitleMap.has(titlePhrase)) {
    return cachedTitleMap.get(titlePhrase)!;
  }

  return null;
}

/**
 * Returns featured premier entities for the wiki overview.
 */
export function getFeaturedLoreEntities(): LoreEntitySummary[] {
  const index = loadLoreIndex();
  const featured: LoreEntitySummary[] = [];

  // Top characters
  const marvelChars = index.universes?.marvel?.slice(0, 4) || [];
  for (const ch of marvelChars) {
    featured.push({ ...ch, type: "character" });
  }

  const dcChars = index.universes?.dc?.slice(0, 4) || [];
  for (const ch of dcChars) {
    featured.push({ ...ch, type: "character" });
  }

  // Top items
  for (const it of (index.items || []).slice(0, 4)) {
    featured.push({ ...it, type: "item" });
  }

  // Top locations
  for (const loc of (index.locations || []).slice(0, 4)) {
    featured.push({ ...loc, type: "location" });
  }

  return featured;
}

const LORE_STOP_WORDS = new Set([
  "the", "and", "for", "with", "this", "that", "from", "into", "over", "under", "about",
  "comic", "comics", "book", "books", "issue", "issues", "first", "last", "cover", "year",
  "price", "prices", "sale", "sales", "auction", "record", "market", "grade", "graded",
  "hero", "heroes", "villain", "villains", "team", "world", "earth", "time", "death", "life",
  "city", "state", "star", "dark", "light", "high", "gold", "silver", "bronze", "modern",
  "cgc", "cbcs", "pgx", "mint", "near", "fine", "good", "very", "rare", "scarce", "panel",
  "collector", "collectors", "collection", "collections", "creator", "creators", "reader",
  "readers", "writer", "writers", "artist", "artists", "studio", "studios", "character",
  "characters", "equity", "valuation", "slab", "slabs", "inventory", "spread", "spreads"
]);

interface CandidatePhrase {
  phrase: string;
  isSingleWord: boolean;
}

/**
 * Shared n-gram tokenizer used by both the synchronous (local JSON index) and
 * asynchronous (Supabase-backed) lore matchers, so the two paths apply the
 * exact same capitalization / stopword / blocklist filtering and only differ
 * in which title map they look each candidate phrase up against.
 */
function* generateCandidatePhrases(text: string): Generator<CandidatePhrase> {
  const rawWords = text
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (rawWords.length === 0) return;

  // Check 4-grams down to 1-grams to prioritize longest matches
  for (let n = 4; n >= 1; n--) {
    for (let i = 0; i <= rawWords.length - n; i++) {
      const slice = rawWords.slice(i, i + n);
      const phrase = slice.join(" ").toLowerCase();

      if (n === 1) {
        if (phrase.length < 4 || LORE_STOP_WORDS.has(phrase)) continue;
        // Require proper capitalization in the original text (e.g. "Batman", not "been")
        if (slice[0][0] !== slice[0][0].toUpperCase()) continue;
      } else {
        // Multi-word entities must start with a capital letter and end with a capital letter or digit
        if (slice[0][0] !== slice[0][0].toUpperCase() || !/^[A-Z0-9]/.test(slice[n - 1])) {
          continue;
        }
      }

      if (GENERIC_REAL_WORLD_LOCATIONS.has(phrase)) continue;
      if (LORE_OBSCURE_COLLISION_BLOCKLIST.has(phrase)) continue;

      yield { phrase, isSingleWord: n === 1 };
    }
  }
}

/**
 * Rapidly extracts lore entities mentioned inside unstructured text
 * using n-gram exact tokenization against the local (capped) JSON index.
 * Synchronous by design -- used by page components and unit tests that
 * cannot await a database round trip. Marvel coverage here is limited to
 * whatever made it into lib/wiki/multi_universe_character_index.json (a
 * fixed sample); for full Marvel coverage against the real ~132k-entity
 * ingested corpus, use findLoreEntitiesInTextAsync instead.
 */
export function findLoreEntitiesInText(text: string, limit = 6): LoreEntitySummary[] {
  if (!text || !text.trim()) return [];
  loadLoreIndex();
  if (!cachedTitleMap) return [];

  const matched: LoreEntitySummary[] = [];
  const seenSlugs = new Set<string>();

  for (const { phrase, isSingleWord } of generateCandidatePhrases(text)) {
    if (matched.length >= limit) break;
    // 1-grams stay gated behind the curated whitelist -- a single common
    // word (e.g. "Storm", "Doom") is too collision-prone against ordinary
    // news vocabulary to trust on presence-in-index alone.
    if (isSingleWord && !TOP_TIER_HERO_WHITELIST.has(phrase)) continue;

    const entity = cachedTitleMap.get(phrase);
    if (entity && !seenSlugs.has(entity.slug)) {
      if (entity.type === "location" && GENERIC_REAL_WORLD_LOCATIONS.has(entity.title.toLowerCase())) {
        continue;
      }
      seenSlugs.add(entity.slug);
      matched.push(entity);
    }
  }

  return matched;
}

// ---------------------------------------------------------------------------
// Supabase-backed Marvel wiki index (real, ingested public.ppcf_wiki_pages
// rows -- see scripts/ingest_marvel_wiki.cjs). Loaded once per process via a
// small number of paginated, indexed bulk queries (universe = 'MARVEL' hits
// the ppcf_wiki_pages_universe_type_idx index from the
// 20260928130000_ppcf_wiki_lore_and_artifacts.sql migration), then matched
// entirely in memory -- the same architecture as the local JSON index, so a
// news article's entity extraction never issues one query per candidate
// n-gram or table-scans per word.
// ---------------------------------------------------------------------------

const MARVEL_DB_PAGE_TYPE_TO_LORE_TYPE: Record<string, LoreEntitySummary["type"]> = {
  CHARACTER: "character",
  CREATOR: "character",
  TEAM: "team",
  ITEM: "item",
  VEHICLE: "item",
  LOCATION: "location",
};

interface MarvelDbIndex {
  titleMap: Map<string, LoreEntitySummary>;
  slugMap: Map<string, LoreEntitySummary>;
}

let marvelDbIndexPromise: Promise<MarvelDbIndex> | null = null;

async function loadMarvelWikiFromDb(): Promise<MarvelDbIndex> {
  if (marvelDbIndexPromise) return marvelDbIndexPromise;

  marvelDbIndexPromise = (async () => {
    const titleMap = new Map<string, LoreEntitySummary>();
    const slugMap = new Map<string, LoreEntitySummary>();

    try {
      const { createAdminServerClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminServerClient();
      const pageSize = 1000;
      let from = 0;

      for (;;) {
        const { data, error } = await supabase
          .from("ppcf_wiki_pages")
          .select("slug, display_title, page_type, summary, creators, first_appearance, reality")
          .eq("universe", "MARVEL")
          .range(from, from + pageSize - 1);

        if (error || !data || data.length === 0) break;

        for (const row of data) {
          const type = MARVEL_DB_PAGE_TYPE_TO_LORE_TYPE[row.page_type as string] || "character";
          const clean = (row.display_title || "").trim().toLowerCase();
          if (!clean) continue;
          if (LORE_OBSCURE_COLLISION_BLOCKLIST.has(clean)) continue;

          const entity: LoreEntitySummary = {
            slug: row.slug,
            title: row.display_title,
            universe: "MARVEL",
            type,
            reality: row.reality || undefined,
            creators: row.creators || undefined,
            first_appearance: row.first_appearance || undefined,
            summary: row.summary || "",
            ticker: deriveEntityTicker(row.display_title, "MARVEL"),
          };

          slugMap.set(row.slug, entity);
          if (clean.length >= 3 && !titleMap.has(clean)) {
            titleMap.set(clean, entity);
          }
        }

        if (data.length < pageSize) break;
        from += pageSize;
      }
    } catch {
      // Network/DB unavailable -- return whatever (possibly empty) maps we
      // built so far. Callers fall back to the local JSON-only matches.
    }

    return { titleMap, slugMap };
  })();

  return marvelDbIndexPromise;
}

/**
 * Same as findLoreEntitiesInText, but supplements the local (capped) JSON
 * matches with lookups against the full, real Marvel corpus ingested into
 * public.ppcf_wiki_pages (~132k characters/teams/creators/items/locations/
 * vehicles, vs. the ~5,000-per-universe sample baked into the local JSON
 * index). Use this from any already-async caller -- e.g. the real news
 * ingestion pipeline in getDynamicEntitiesForText -- instead of the sync
 * version. DC, Star Wars, Image, Dark Horse, and indie publishers are not
 * yet ingested into the DB and keep coming from the local JSON index only.
 */
export async function findLoreEntitiesInTextAsync(text: string, limit = 6): Promise<LoreEntitySummary[]> {
  const matched = findLoreEntitiesInText(text, limit);
  if (!text || !text.trim() || matched.length >= limit) return matched;

  const { titleMap } = await loadMarvelWikiFromDb();
  if (titleMap.size === 0) return matched;

  const seenSlugs = new Set(matched.map((m) => m.slug));
  for (const { phrase, isSingleWord } of generateCandidatePhrases(text)) {
    if (matched.length >= limit) break;
    if (isSingleWord && !TOP_TIER_HERO_WHITELIST.has(phrase)) continue;

    const entity = titleMap.get(phrase);
    if (entity && !seenSlugs.has(entity.slug)) {
      seenSlugs.add(entity.slug);
      matched.push(entity);
    }
  }

  return matched;
}

/**
 * Same as getLoreEntityBySlug, but falls back to the full ingested Marvel
 * corpus in public.ppcf_wiki_pages when the slug isn't in the local JSON
 * index or the hardcoded premier-entity table.
 */
export async function getLoreEntityBySlugAsync(slug: string): Promise<LoreEntitySummary | null> {
  const local = getLoreEntityBySlug(slug);
  if (local) return local;
  if (!slug) return null;
  const { slugMap } = await loadMarvelWikiFromDb();
  return slugMap.get(slug.toLowerCase().trim()) || null;
}
