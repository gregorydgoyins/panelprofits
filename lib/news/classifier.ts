/**
 * Next-Generation Fuzzy Comic Intelligence Classifier & Relevance Gatekeeper.
 * 
 * Replaces fragile single-regex matching with a multi-layered semantic dictionary:
 * 1. Comprehensive Character, Team & Lore Lexicon (Marvel, DC, Image, Dark Horse, 2000 AD, Manga)
 * 2. Renowned Comic Creators, Artists & Writers
 * 3. Comic Market, CGC/CBCS Grading, Census, and Key Issue Vocabulary
 * 4. Cinematic / Media Adaptation Equities & Cast Members
 * 5. Strict Negative Disqualification (Sports, Municipal Politics, Blotters, Non-Comic Noise)
 * 6. Hard Freshness Gatekeeper (Rejects stale, ancient, or decades-old blog artifacts)
 */

import adaptationCastData from "./adaptation-cast-registry.json";

// 1. Adaptation Actor Registry
const ADAPTATION_ACTORS = (adaptationCastData as Array<{ name: string; aliases: string[] }>).flatMap(
  (a) => [a.name, ...a.aliases]
);
const ADAPTATION_ACTOR_REGEX = new RegExp(
  `\\b(${ADAPTATION_ACTORS.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
  "i"
);

// 2. Verified Dedicated Comic Sources (Auto-Admitted Unless Disqualified by Negative Gate)
export const DEDICATED_COMIC_SOURCES_REGEX = new RegExp(
  [
    "nerdsync",
    "comics explained",
    "variant comics",
    "comic drake",
    "comicpop",
    "casually comics",
    "near mint condition",
    "comic tropes",
    "matt draper",
    "pop culture detective",
    "lords of the long box",
    "comictom101",
    "cartoonist kayfabe",
    "gem mint collectibles",
    "automatic comics",
    "swagglehaus",
    "bleeding cool",
    "the beat",
    "comicsbeat",
    "aipt",
    "cbr",
    "comic book resources",
    "comicbook invest",
    "cbsi",
    "comics journal",
    "tcj",
    "comicsxf",
    "multiversity",
    "first comics news",
    "comic crusaders",
    "major spoilers",
    "graphic policy",
    "smash pages",
    "tripwire",
    "broken frontier",
    "comic book herald",
    "gocollect",
    "covrprice",
    "comichron",
    "previewsworld",
    "comicbook\\.com",
    "popverse",
    "2000 ad",
    "dark horse",
    "image comics",
    "marvel comics",
    "dc comics",
    "idw",
    "boom studios",
    "dynamite",
    "valiant",
    "archie comics",
    "fantagraphics",
    "kodansha",
    "viz media",
    "heritage comic",
    "comiclink",
    "comicconnect",
    "shortboxed",
    "key collector",
    "zdarsky\\.substack",
    "jamestynioniv\\.substack",
    "scottsnyder\\.substack",
    "3w3m\\.substack",
    "1979semifinalist\\.substack",
  ].join("|"),
  "i"
);

// 3. Strict Negative Disqualification Gatekeeper (Instant Rejection)
export const STRICT_NEGATIVE_FILTER = new RegExp(
  "\\b(" +
    [
      // Specific disambiguations
      "ac/dc\\b",
      "mayor\\s+bowser",
      "zohran\\s+mamdani",
      "ribbon-cutting",
      "washington,?\\s*d\\.?c\\.?",
      "(?:dc|d\\.c\\.)\\s+(?:mayor|council|police|government|politics|statehood|attorney|public\\s+schools)",
      "dc council",
      "trayon white",
      "city council",
      "county commissioner",
      "zoning board",
      "police blotter",
      "homicide",
      "shooting incident",
      "car crash",
      "traffic accident",
      "terror suspects",
      "bribery trial",
      "bribery mistrial",
      "bribery case",
      "politico caught",
      "local election",
      "mayoral election",
      "gubernatorial",
      "senate seat",
      "congressional district",
      "tax hike",
      "affordable housing",
      "mortgage rates",
      "childcare\\s+centers?",
      "trump\\b",
      "biden\\b",
      "kamala\\b",
      "white\\s+house",
      "presidential\\s+(?:election|campaign)",
      
      // Sports wires & college athletics
      "florida\\s+state",
      "seminoles",
      "fsu\\b",
      "gators\\b",
      "college\\s+football",
      "high\\s+school\\s+football",
      "fantasy\\s+football",
      "nfl\\b",
      "nba\\b",
      "mlb\\b",
      "nhl\\b",
      "ncaa\\b",
      "quarterback",
      "touchdown",
      "touchdowns",
      "linebacker",
      "interception",
      "puck",
      "formula 1",
      "\\bf1\\b",
      "nascar",
      "tennis",
      "wimbledon",
      "golf",
      "\\bpga\\b",
      "boxing",
      "\\bmma\\b",
      "\\bufc\\b",
      "wrestling",
      "pwi 500",
      "wwe",
      "aew",
      "soccer",
      "premier league",
      "champions league",
      "mls",
      "inter miami",
      "acc\\b",
      "sec\\b",
      "big ten",
      "big 12",
      "pac-12",
      "super bowl",
      
      // Consumer appliances & off-topic spam
      "earphones",
      "smartwatch",
      "airpods",
      "vacuum cleaner",
      "casino",
      "crypto casino",
      "slot machine",
      "weight loss",
      "celebrity gossip",
      "love island",
      "bachelor",
      "real housewives",
      "jimmy\\s+kimmel",
      "dwts\\b",
      "dancing\\s+with\\s+the\\s+stars",
      "playstation\\s*5",
      "ps5",
      "xbox",
      "nintendo switch",
      "platinum trophy",
      "martial arts film",
      "martial arts films",
      "martial arts movie",
      "martial arts movies",
      "kung fu hustle",
      "action filmmaking",
      "found footage",
      "horror movie",
      "blair witch",
      
      // Obsolete / spam website boilerplate
      "hello world!",
      "quick tiny linkspam",
    ].join("|") +
    ")\\b",
  "i"
);

// 4. Comprehensive Comic Entity & Concept Signals
export const COMPREHENSIVE_COMIC_SIGNALS = new RegExp(
  "\\b(" +
    [
      // Medium & Format
      "comics?",
      "comic\\s+books?",
      "graphic\\s+novels?",
      "manga",
      "mangaka",
      "manhwa",
      "webtoon",
      "omnibus",
      "omnibuses",
      "superhero(?:es)?",
      "supervillain(?:s)?",
      "sequential\\s+art",
      "trade\\s+paperback",
      "tpb",
      "ashcan",
      "facsimile",
      "single\\s+issue",
      "variant\\s+cover",
      "foil\\s+variant",
      "virgin\\s+variant",
      "ratio\\s+variant",
      "first\\s+appearance",
      "key\\s+issue",
      "origin\\s+issue",
      "pedigree\\s+collection",
      "slabbed?",
      "newsstand\\s+edition",
      "direct\\s+edition",
      "overstreet",
      
      // Grading & Valuation
      "cgc",
      "cbcs",
      "pgx",
      "grade\\s+9\\.8",
      "cgc\\s+9\\.8",
      "9\\.8\\s+slab",
      "census\\s+scarcity",
      "pop\\s+report",
      "grade\\s+compression",
      "fair\\s+market\\s+value",
      "fmv",
      "auction\\s+record",
      "hammer\\s+price",
      "gocollect",
      "covrprice",
      "comichron",
      "comiclink",
      "heritage\\s+auctions?",
      "key\\s+collector",
      
      // Iconic Publishers & Imprints
      "marvel(?:man)?",
      "miracleman",
      "dc\\s+comics",
      "dc\\s+studios",
      "dc\\s+universe",
      "dcu",
      "dceu",
      "marvel\\s+studios",
      "marvel\\s+cinematic\\s+universe",
      "mcu",
      "image\\s+comics",
      "dark\\s+horse",
      "idw",
      "boom!?\\s+studios?",
      "dynamite\\s+entertainment",
      "valiant\\s+entertainment",
      "2000\\s*ad",
      "fantagraphics",
      "archie\\s+comics",
      "vertigo\\s+comics",
      "black\\s+label",
      "oni\\s+press",
      "mad\\s+cave",
      "ahoy\\s+comics",
      "titan\\s+comics",
      
      // Major Characters & Franchises (Marvel, DC, Indie)
      "spider-?man",
      "spiderman",
      "peter\\s+parker",
      "miles\\s+morales",
      "gwen\\s+stacy",
      "spider-gwen",
      "batman",
      "bruce\\s+wayne",
      "superman",
      "clark\\s+kent",
      "x-?men",
      "avengers",
      "wolverine",
      "logan",
      "deadpool",
      "wade\\s+wilson",
      "hulk",
      "bruce\\s+banner",
      "thor",
      "iron\\s+man",
      "tony\\s+stark",
      "captain\\s+america",
      "steve\\s+rogers",
      "daredevil",
      "matt\\s+murdock",
      "punisher",
      "frank\\s+castle",
      "fantastic\\s+four",
      "doctor\\s+doom",
      "dr\\.?\\s*doom",
      "victor\\s+von\\s+doom",
      "galactus",
      "silver\\s+surfer",
      "magneto",
      "professor\\s+x",
      "xavier",
      "cyclops",
      "jean\\s+grey",
      "storm",
      "gambit",
      "rogue",
      "jubilee",
      "apocalypse",
      "venom",
      "eddie\\s+brock",
      "carnage",
      "moon\\s+knight",
      "blade",
      "ghost\\s+rider",
      "doctor\\s+strange",
      "stephen\\s+strange",
      "sorcerer\\s+supreme",
      "doctor\\s+who",
      "dr\\.?\\s*who",
      "the\\s+doctor",
      "tardis",
      "daleks?",
      "cyberm[ae]n",
      "time\\s+lords?",
      "gallifrey(?:an)?",
      "whovians?",
      "doctor\\s+fate",
      "kent\\s+nelson",
      "doctor\\s+octopus",
      "doc\\s+ock",
      "otto\\s+octavius",
      "doctor\\s+voodoo",
      "star\\s+trek",
      "captain\\s+kirk",
      "captain\\s+picard",
      "starfleet",
      "uss\\s+enterprise",
      "the\\s+mandalorian",
      "mandalorian",
      "grogu",
      "din\\s+djarin",
      "captain\\s+marvel",
      "captain\\s+carter",
      "captain\\s+britain",
      "mister\\s+fantastic",
      "reed\\s+richards",
      "mister\\s+sinister",
      "guardians\\s+of\\s+the\\s+galaxy",
      "rocket\\s+raccoon",
      "groot",
      "star-lord",
      "thanos",
      "infinity\\s+gauntlet",
      "batmobile",
      "wonder\\s+woman",
      "diana\\s+prince",
      "green\\s+lantern",
      "hal\\s+jordan",
      "john\\s+stewart",
      "sinestro",
      "lanterns",
      "flash",
      "barry\\s+allen",
      "wally\\s+west",
      "aquaman",
      "justice\\s+league",
      "nightwing",
      "dick\\s+grayson",
      "robin",
      "batgirl",
      "supergirl",
      "joker",
      "harley\\s+quinn",
      "catwoman",
      "poison\\s+ivy",
      "clayface",
      "riddler",
      "penguin",
      "two-face",
      "bane",
      "sandman",
      "morpheus",
      "constantine",
      "john\\s+constantine",
      "hellblazer",
      "swamp\\s+thing",
      "watchmen",
      "rorschach",
      "doctor\\s+manhattan",
      "spawn",
      "hellboy",
      "tmnt",
      "ninja\\s+turtles",
      "transformers",
      "invincible",
      "omni-man",
      "the\\s+boys",
      "homelander",
      "judge\\s+dredd",
      "walking\\s+dead",
      
      // Iconic Creators & Story Architects
      "stan\\s+lee",
      "jack\\s+kirby",
      "steve\\s+ditko",
      "bob\\s+kane",
      "bill\\s+finger",
      "will\\s+eisner",
      "alan\\s+moore",
      "neil\\s+gaiman",
      "frank\\s+miller",
      "grant\\s+morrison",
      "jim\\s+lee",
      "todd\\s+mcfarlane",
      "jonathan\\s+hickman",
      "al\\s+ewing",
      "chip\\s+zdarsky",
      "tom\\s+king",
      "scott\\s+snyder",
      "james\\s+tynion(?:\\s+iv)?",
      "geoff\\s+johns",
      "brian\\s+michael\\s+bendis",
      "george\\s+p[eé]rez",
      "john\\s+byrne",
      "chris\\s+claremont",
      "dave\\s+gibbons",
      "alex\\s+ross",
      "donny\\s+cates",
      "dan\\s+slott",
      "greg\\s+capullo",
      "jeff\\s+lemire",
      "kelly\\s+thompson",
      "robert\\s+kirkman",
      "kevin\\s+feige",
      "james\\s+gunn",
      "russo\\s+brothers",
      "secret\\s+wars",
      "doomsday",
      "born\\s+again",
    ].join("|") +
    ")\\b",
  "i"
);

export const CORE_COMIC_SIGNALS = COMPREHENSIVE_COMIC_SIGNALS;

// 5. Studio Corporate Equities & Financial Metrics
const COMPANY_TERMS = /disney|warner bros|warner discovery|wbd|sony pictures|universal|paramount|skydance|marvel entertainment/i;
const FINANCIAL_TERMS = /earnings|revenue|profit|loss|shares|stock|investor|acquisition|merger|deal|buyout|results|box office/i;

/**
 * Validates publication date freshness.
 * Requires articles to be published within the last 45 days.
 * Discards ancient / 2011 WordPress artifacts or corrupt dates.
 */
export function isFreshArticle(
  publishedAt: string | Date | null | undefined,
  maxAgeDays = 45
): boolean {
  if (!publishedAt) return false;
  const dateMs = typeof publishedAt === "string" ? Date.parse(publishedAt) : publishedAt.getTime();
  if (Number.isNaN(dateMs)) return false;
  const ageMs = Date.now() - dateMs;
  const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
  // If in the future by more than 2 days, or older than maxAgeDays, reject
  if (ageMs < -2 * 24 * 60 * 60 * 1000 || ageMs > maxAgeMs) {
    return false;
  }
  return true;
}

/**
 * Primary Relevance Gatekeeper.
 * Returns true if an article is substantive comic journalism, market analysis, video essay,
 * creator dispatch, or corporate studio equity news.
 */
export function isRelevantComicStory(
  source: string,
  headline: string,
  summary: string | null,
  isDedicatedComicSource = false
): boolean {
  const text = `${headline} ${summary || ""}`;

  // 1. Strict Negative Disqualification (Sports, Municipal Blotters, Local Crimes)
  if (STRICT_NEGATIVE_FILTER.test(text)) {
    return false;
  }

  // 2. Dedicated Comic Sources Auto-Admit (unless disqualified by negative gate)
  if (isDedicatedComicSource || DEDICATED_COMIC_SOURCES_REGEX.test(source)) {
    return true;
  }

  // 3. Comic Lore, Character, Creator, Market or Format Match
  if (COMPREHENSIVE_COMIC_SIGNALS.test(text)) {
    return true;
  }

  // 4. Adaptation Actor / Franchise Match
  if (ADAPTATION_ACTOR_REGEX.test(text)) {
    return true;
  }

  // 5. Media Conglomerate M&A / Financial Equity Match
  if (COMPANY_TERMS.test(text) && FINANCIAL_TERMS.test(text)) {
    return true;
  }

  return false;
}

/**
 * Deep Article Quality Evaluator.
 */
export function evaluateArticleQuality(
  headline: string,
  summary: string | null,
  isDedicatedComicSource = false
): {
  admit: boolean;
  reason: string;
} {
  const combined = `${headline} ${summary || ""}`.trim();

  // Reject empty or micro stubs
  if (combined.length < 20) {
    return { admit: false, reason: "Insufficient substance (< 20 chars)" };
  }

  // Reject strict negative noise
  if (STRICT_NEGATIVE_FILTER.test(combined)) {
    return { admit: false, reason: "Disallowed off-topic noise / sports / municipal blotter" };
  }

  // Verified dedicated comic outlet
  if (isDedicatedComicSource) {
    return { admit: true, reason: "Verified dedicated comic outlet" };
  }

  // Substantive signal check
  const hasSignal =
    COMPREHENSIVE_COMIC_SIGNALS.test(combined) ||
    ADAPTATION_ACTOR_REGEX.test(combined) ||
    (COMPANY_TERMS.test(combined) && FINANCIAL_TERMS.test(combined));

  if (!hasSignal) {
    return { admit: false, reason: "No verified comic, adaptation, or market signal" };
  }

  return { admit: true, reason: "Verified comic intelligence content" };
}

