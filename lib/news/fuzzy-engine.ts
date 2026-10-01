/**
 * Canonical Fuzzy Intent & Disambiguation Engine for Sequential Art Intelligence.
 * 
 * Implements formal fuzzy logic:
 * 1. FUZZIFICATION:
 *    Identifies ambiguous honorifics, titles, prefixes, or placeholder queries
 *    (e.g., "Doctor", "Dr.", "The Doctor", "Captain", "Professor", "Lord", "Agent", "Mister", "Doctor _________ ?").
 *    Recognizes that a bare honorific is an ambiguous fuzzy candidate, NOT an isolated atomic entity.
 * 
 * 2. INTENTION & INFERENCE:
 *    Reads and evaluates the surrounding narrative context, story headline, summary, and article body.
 *    Extracts domain features (keywords, cast, lore, universe, villain, equipment, era) to determine
 *    the author's true intended entity with mathematical confidence scoring:
 *    - Doctor Who Intent (TARDIS, Daleks, Time Lord, Gallifrey, Cybermen, BBC, Gatwa, Tennant, Whovian...)
 *    - Doctor Strange Intent (Sorcerer Supreme, Stephen Strange, Sanctum, Agamotto, Cumberbatch, MCU...)
 *    - Doctor Doom Intent (Latveria, Victor Von Doom, Doomsday, Secret Wars, RDJ, Fantastic Four...)
 *    - Doctor Octopus Intent (Otto Octavius, Doc Ock, tentacles, Spider-Man, Sinister Six...)
 *    - Doctor Fate Intent (Kent Nelson, Helmet of Nabu, JSA, DC...)
 *    - Doctor Manhattan Intent (Jon Osterman, Watchmen, blue deity, Mars, Alan Moore...)
 *    - Captain America / Captain Marvel / Captain Carter / Captain Kirk / Captain Picard
 *    - Professor X (Charles Xavier, Cerebro, mutants, X-Men)
 *    - Mister Fantastic (Reed Richards, First Family) vs Mister Sinister
 * 
 * 3. DEFUZZIFICATION:
 *    Binds the matched candidate and inferred intention into a crisp, unified canonical entity definition:
 *    - The badge highlights the COMPLETE compound name (e.g. "Doctor Who", "Doctor Strange", "Doctor Doom").
 *    - NEVER leaves trailing words orphaned or separated (e.g. [Doctor] Who or [Doctor] Strange is strictly forbidden).
 *    - Provides the exact sovereign ticker ($DWHO, $STRG, $DOOM, $DOC, $FATE, $WTCH) and wiki path.
 * 
 * 4. DEFERENCE:
 *    When an honorific or ambiguous term appears WITHOUT sufficient contextual comic/sci-fi confidence
 *    (e.g., a medical doctor, "doctor's orders", general prose, RT critics rating):
 *    - DEFERENCE ACTIVATES.
 *    - The system deliberately drops the match and leaves the text as plain, unlinked text.
 *    - It NEVER binds a naked honorific to an obscure entity or arbitrary third-party universe.
 */

import type { EntityWikiDef } from "./entities";

export interface FuzzyIntentProfile {
  id: string;
  canonicalTerm: string;
  ticker: string;
  wikiPath: string;
  universe: string;
  type: "character" | "equity";
  landmarkIssue: string;
  era: string;
  signals: {
    primaryTerms: string[];
    contextCues: string[];
    castTalent: string[];
    creators: string[];
    publishers: string[];
  };
}

export const FUZZY_INTENT_PROFILES: FuzzyIntentProfile[] = [
  // 1. Doctor Who / The Doctor
  {
    id: "doctor-who",
    canonicalTerm: "Doctor Who",
    ticker: "$DWHO",
    wikiPath: "/wiki/entry/the-doctor-earth-5556",
    universe: "DOCTOR_WHO",
    type: "character",
    landmarkIssue: "TV Comic #674 (1964) / Doctor Who Magazine #1",
    era: "Silver Age (1964)",
    signals: {
      primaryTerms: ["doctor who", "the doctor", "dr who", "dr. who", "doctor whom"],
      contextCues: [
        "tardis",
        "dalek",
        "daleks",
        "time lord",
        "timelord",
        "gallifrey",
        "cybermen",
        "cyberman",
        "sonic screwdriver",
        "whovian",
        "whovians",
        "regeneration",
        "regenerate",
        "bad wolf",
        "sontaran",
        "weeping angel",
        "weeping angels",
        "master",
        "missy",
        "gallifreyan",
        "companion",
      ],
      castTalent: [
        "ncuti gatwa",
        "david tennant",
        "jodie whittaker",
        "peter capaldi",
        "matt smith",
        "christopher eccleston",
        "paul mcgann",
        "sylvester mccoy",
        "colin baker",
        "peter davison",
        "tom baker",
        "jon pertwee",
        "patrick troughton",
        "william hartnell",
        "mille gibson",
        "varada sethu",
        "billie piper",
        "karen gillan",
        "arthur darvill",
        "catherine tate",
        "freema agyeman",
        "alex kingston",
      ],
      creators: [
        "russell t davies",
        "russell t. davies",
        "steven moffat",
        "chris chibnall",
        "sydney newman",
        "terry nation",
      ],
      publishers: ["bbc", "titan comics", "idw", "marvel uk", "disney+"],
    },
  },

  // 2. Doctor Strange / Stephen Strange
  {
    id: "doctor-strange",
    canonicalTerm: "Doctor Strange",
    ticker: "$STRG",
    wikiPath: "/wiki/entry/doctor-strange",
    universe: "MARVEL",
    type: "character",
    landmarkIssue: "Strange Tales #110 (1963)",
    era: "Silver Age (1963)",
    signals: {
      primaryTerms: ["doctor strange", "dr strange", "dr. strange", "stephen strange", "sorcerer supreme"],
      contextCues: [
        "sanctum",
        "sanctum sanctorum",
        "eye of agamotto",
        "book of vishanti",
        "darkhold",
        "dormammu",
        "kamar-taj",
        "kamartaj",
        "clea",
        "wong",
        "ancient one",
        "astral projection",
        "mirror dimension",
        "cloak of levitation",
        "multiverse of madness",
        "kaecilius",
        "shuma-gorath",
        "baron mordo",
        "mordo",
      ],
      castTalent: [
        "benedict cumberbatch",
        "cumberbatch",
        "rachel mcadams",
        "chiwetel ejiofor",
        "benedict wong",
        "charlize theron",
        "xochitl gomez",
        "tilda swinton",
      ],
      creators: ["stan lee", "steve ditko", "sam raimi", "scott derrickson"],
      publishers: ["marvel", "marvel studios", "mcu"],
    },
  },

  // 3. Doctor Doom / Victor Von Doom
  {
    id: "doctor-doom",
    canonicalTerm: "Doctor Doom",
    ticker: "$DOOM",
    wikiPath: "/wiki/entry/doctor-doom",
    universe: "MARVEL",
    type: "character",
    landmarkIssue: "Fantastic Four #5 (1962)",
    era: "Silver Age (1962)",
    signals: {
      primaryTerms: ["doctor doom", "dr doom", "dr. doom", "victor von doom", "von doom"],
      contextCues: [
        "latveria",
        "latverian",
        "cynthia von doom",
        "doomsday",
        "secret wars",
        "battleworld",
        "castle doom",
        "doombot",
        "doombots",
        "god emperor doom",
        "fantastic four",
        "first family",
      ],
      castTalent: ["robert downey jr", "rdj", "julian mcmahon", "toby kebbell"],
      creators: ["stan lee", "jack kirby", "jonathan hickman"],
      publishers: ["marvel", "marvel studios", "mcu"],
    },
  },

  // 4. Doctor Octopus / Otto Octavius
  {
    id: "doctor-octopus",
    canonicalTerm: "Doctor Octopus",
    ticker: "$DOC",
    wikiPath: "/wiki/entry/doctor-octopus",
    universe: "MARVEL",
    type: "character",
    landmarkIssue: "The Amazing Spider-Man #3 (1963)",
    era: "Silver Age (1963)",
    signals: {
      primaryTerms: ["doctor octopus", "dr octopus", "dr. octopus", "otto octavius", "doc ock"],
      contextCues: [
        "mechanical arms",
        "tentacles",
        "sinister six",
        "master planner",
        "superior spider-man",
        "spider-man",
        "spiderman",
        "peter parker",
      ],
      castTalent: ["alfred molina"],
      creators: ["stan lee", "steve ditko", "dan slott"],
      publishers: ["marvel", "sony pictures", "mcu"],
    },
  },

  // 5. Doctor Fate / Kent Nelson
  {
    id: "doctor-fate",
    canonicalTerm: "Doctor Fate",
    ticker: "$FATE",
    wikiPath: "/wiki/entry/doctor-fate",
    universe: "DC",
    type: "character",
    landmarkIssue: "More Fun Comics #55 (1940)",
    era: "Golden Age (1940)",
    signals: {
      primaryTerms: ["doctor fate", "dr fate", "dr. fate", "kent nelson", "helmet of fate"],
      contextCues: [
        "helmet of nabu",
        "tower of fate",
        "lords of order",
        "amulet of anubis",
        "khalid nassour",
        "justice society",
        "jsa",
        "black adam",
      ],
      castTalent: ["pierce brosnan"],
      creators: ["gardner fox", "howard sherman"],
      publishers: ["dc", "dc comics", "warner bros"],
    },
  },

  // 6. Doctor Manhattan / Jon Osterman
  {
    id: "doctor-manhattan",
    canonicalTerm: "Doctor Manhattan",
    ticker: "$WTCH",
    wikiPath: "/wiki/entry/doctor-manhattan",
    universe: "DC",
    type: "character",
    landmarkIssue: "Watchmen #1 (1986)",
    era: "Copper / Modern Age (1986)",
    signals: {
      primaryTerms: ["doctor manhattan", "dr manhattan", "dr. manhattan", "jon osterman"],
      contextCues: [
        "watchmen",
        "blue deity",
        "blue god",
        "intrinsic field",
        "mars palace",
        "doomsday clock",
        "rorschach",
        "ozymandias",
        "silk spectre",
        "minute men",
      ],
      castTalent: ["billy crudup", "yahya abdul-mateen"],
      creators: ["alan moore", "dave gibbons", "damon lindelof"],
      publishers: ["dc", "dc comics", "warner bros", "hbo"],
    },
  },

  // 7. Captain America
  {
    id: "captain-america",
    canonicalTerm: "Captain America",
    ticker: "$CAP",
    wikiPath: "/wiki/entry/captain-america",
    universe: "MARVEL",
    type: "character",
    landmarkIssue: "Captain America Comics #1 (1941)",
    era: "Golden Age (1941)",
    signals: {
      primaryTerms: ["captain america", "steve rogers", "sam wilson"],
      contextCues: ["super soldier", "vibranium shield", "avengers", "brave new world", "winter soldier", "bucky barnes"],
      castTalent: ["chris evans", "anthony mackie", "sebastian stan"],
      creators: ["joe simon", "jack kirby"],
      publishers: ["marvel", "marvel studios", "mcu"],
    },
  },

  // 8. Captain Marvel
  {
    id: "captain-marvel",
    canonicalTerm: "Captain Marvel",
    ticker: "$CMARV",
    wikiPath: "/wiki/entry/captain-marvel",
    universe: "MARVEL",
    type: "character",
    landmarkIssue: "Marvel Super-Heroes #12 (1967)",
    era: "Silver Age (1967)",
    signals: {
      primaryTerms: ["captain marvel", "carol danvers", "mar-vell"],
      contextCues: ["kree", "skrulls", "higher further faster", "kamala khan", "monica rambeau"],
      castTalent: ["brie larson", "iman vellani", "teyonah parris"],
      creators: ["stan lee", "gene colan", "roy thomas"],
      publishers: ["marvel", "marvel studios", "mcu"],
    },
  },

  // 9. Captain Carter
  {
    id: "captain-carter",
    canonicalTerm: "Captain Carter",
    ticker: "$CARTER",
    wikiPath: "/wiki/entry/peggy-carter",
    universe: "MARVEL",
    type: "character",
    landmarkIssue: "Captain Carter #1 (2022) / Tales of Suspense #77",
    era: "Modern Age (2022)",
    signals: {
      primaryTerms: ["captain carter", "peggy carter"],
      contextCues: ["what if", "super soldier serum", "union jack shield", "illuminati", "multiverse"],
      castTalent: ["hayley atwell"],
      creators: ["stan lee", "jack kirby", "jamie mckelvie"],
      publishers: ["marvel", "marvel studios", "mcu"],
    },
  },

  // 10. Professor X / Charles Xavier
  {
    id: "professor-x",
    canonicalTerm: "Professor X",
    ticker: "$PROFX",
    wikiPath: "/wiki/entry/professor-x",
    universe: "MARVEL",
    type: "character",
    landmarkIssue: "The X-Men #1 (1963)",
    era: "Silver Age (1963)",
    signals: {
      primaryTerms: ["professor x", "charles xavier", "professor charles xavier"],
      contextCues: ["cerebro", "mutants", "telepath", "x-men", "xavier institute", "magneto", "mind control"],
      castTalent: ["patrick stewart", "james mcavoy"],
      creators: ["stan lee", "jack kirby"],
      publishers: ["marvel", "marvel studios", "20th century fox"],
    },
  },

  // 11. Mister Fantastic / Reed Richards
  {
    id: "mister-fantastic",
    canonicalTerm: "Mister Fantastic",
    ticker: "$FF4",
    wikiPath: "/wiki/entry/mister-fantastic",
    universe: "MARVEL",
    type: "character",
    landmarkIssue: "Fantastic Four #1 (1961)",
    era: "Silver Age (1961)",
    signals: {
      primaryTerms: ["mister fantastic", "mr fantastic", "mr. fantastic", "reed richards"],
      contextCues: ["fantastic four", "first family", "baxter building", "stretching", "incursions", "council of reeds"],
      castTalent: ["pedro pascal", "john krasinski", "ioan gruffudd"],
      creators: ["stan lee", "jack kirby"],
      publishers: ["marvel", "marvel studios", "mcu"],
    },
  },

  // 12. Mister Sinister
  {
    id: "mister-sinister",
    canonicalTerm: "Mister Sinister",
    ticker: "$SNST",
    wikiPath: "/wiki/entry/mister-sinister",
    universe: "MARVEL",
    type: "character",
    landmarkIssue: "Uncanny X-Men #221 (1987)",
    era: "Copper Age (1987)",
    signals: {
      primaryTerms: ["mister sinister", "mr sinister", "mr. sinister", "nathaniel essex"],
      contextCues: ["mutant genetics", "marauders", "cyclops", "jean grey", "cloning", "baras", "inferno"],
      castTalent: [],
      creators: ["chris claremont", "marc silvestri"],
      publishers: ["marvel", "x-men"],
    },
  },

  // 13. Star Trek Captains (Kirk & Picard)
  {
    id: "star-trek-fleet",
    canonicalTerm: "Star Trek",
    ticker: "$TREK",
    wikiPath: "/wiki/entry/star-trek",
    universe: "STAR_TREK",
    type: "equity",
    landmarkIssue: "Star Trek #1 (1967 Gold Key)",
    era: "Silver Age (1967)",
    signals: {
      primaryTerms: ["star trek", "captain kirk", "captain picard", "uss enterprise", "starfleet"],
      contextCues: [
        "enterprise",
        "spock",
        "vulcan",
        "klingon",
        "romulan",
        "lower decks",
        "borg",
        "warp drive",
        "paramount",
      ],
      castTalent: ["william shatner", "patrick stewart", "tawny newsome", "jack quaid"],
      creators: ["gene roddenberry", "mike mcmahan"],
      publishers: ["paramount", "idw", "gold key", "dc"],
    },
  },
];

/**
 * Honorific prefixes that must NEVER be treated as standalone entities.
 * If text contains a naked honorific without sufficient comic context, DEFERENCE triggers.
 */
export const AMBIGUOUS_HONORIFIC_PREFIXES = new Set([
  "doctor",
  "dr",
  "dr.",
  "the doctor",
  "captain",
  "capt",
  "capt.",
  "professor",
  "prof",
  "prof.",
  "agent",
  "lord",
  "master",
  "baron",
  "mister",
  "mr",
  "mr.",
  "general",
  "gen",
  "gen.",
  "major",
  "king",
  "queen",
  "count",
  "sir",
  "lady",
]);

/**
 * Fuzzy Intention Scoring:
 * Analyzes surrounding narrative context and computes relevance scores
 * across all potential character profiles.
 */
export function inferIntendedProfile(contextText: string, prefixFilter?: string): FuzzyIntentProfile | null {
  if (!contextText || contextText.trim().length === 0) return null;
  const lower = contextText.toLowerCase();

  let candidateProfiles = FUZZY_INTENT_PROFILES;
  if (prefixFilter) {
    const cleanPrefix = prefixFilter.toLowerCase().replace(/[^a-z]/g, "");
    if (cleanPrefix === "doctor" || cleanPrefix === "dr") {
      candidateProfiles = candidateProfiles.filter((p) => p.id.startsWith("doctor"));
    } else if (cleanPrefix === "captain" || cleanPrefix === "capt") {
      candidateProfiles = candidateProfiles.filter((p) => p.id.startsWith("captain") || p.id.includes("star-trek"));
    } else if (cleanPrefix === "professor" || cleanPrefix === "prof") {
      candidateProfiles = candidateProfiles.filter((p) => p.id.startsWith("professor"));
    } else if (cleanPrefix === "mister" || cleanPrefix === "mr") {
      candidateProfiles = candidateProfiles.filter((p) => p.id.startsWith("mister"));
    }
  }

  let bestProfile: FuzzyIntentProfile | null = null;
  let highestScore = 0;

  for (const profile of candidateProfiles) {
    let score = 0;

    // To prevent false positives from generic creator/publisher mentions (e.g. Stan Lee or Marvel),
    // a profile requires at least ONE primary term, high-specificity context cue, or attached cast talent
    // to be considered valid when an ambiguous honorific or placeholder is evaluated.
    let hasCoreSignal = false;

    // 1. Direct Primary Term Mention (+25 points)
    for (const term of profile.signals.primaryTerms) {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (new RegExp(`\\b${escaped}\\b`, "i").test(lower)) {
        score += 25;
        hasCoreSignal = true;
      }
    }

    // 2. High-Specificity Context Cues (+12 points per unique cue)
    for (const cue of profile.signals.contextCues) {
      const escaped = cue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (new RegExp(`\\b${escaped}\\b`, "i").test(lower)) {
        score += 12;
        hasCoreSignal = true;
      }
    }

    // 3. Cast & Attached Creative Talent (+15 points per actor/director)
    for (const talent of profile.signals.castTalent) {
      const escaped = talent.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (new RegExp(`\\b${escaped}\\b`, "i").test(lower)) {
        score += 15;
        hasCoreSignal = true;
      }
    }

    // 4. Renowned Writers & Comic Creators (+10 points)
    for (const creator of profile.signals.creators) {
      const escaped = creator.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (new RegExp(`\\b${escaped}\\b`, "i").test(lower)) {
        score += 10;
      }
    }

    // 5. Studio / Publisher Bedrock (+6 points)
    for (const pub of profile.signals.publishers) {
      const escaped = pub.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (new RegExp(`\\b${escaped}\\b`, "i").test(lower)) {
        score += 6;
      }
    }

    // If there is no core signal (no primary term, no context cue, no attached cast talent),
    // generic creator/publisher mentions alone CANNOT infer a specific character.
    if (!hasCoreSignal) {
      continue;
    }

    if (score > highestScore) {
      highestScore = score;
      bestProfile = profile;
    }
  }

  // DEFERENCE THRESHOLD:
  // Requires at least 15 points of contextual corroboration.
  // If the score is below 15 (e.g. medical doctor, RT critics rating, or generic usage),
  // DEFERENCE triggers, returning null.
  if (highestScore >= 15 && bestProfile) {
    return bestProfile;
  }

  return null;
}

/**
 * Resolves fuzzy and compound entities for any article text.
 * Integrates Fuzzification, Inference, Defuzzification, and Deference.
 */
export function resolveFuzzyEntitiesForStory(
  storyText: string,
  existingEntities: EntityWikiDef[] = []
): EntityWikiDef[] {
  const resolvedList = [...existingEntities];
  const existingTerms = new Set(existingEntities.map((e) => e.term.toLowerCase()));

  // 1. Detect ambiguous queries, ellipsis, or placeholder patterns like:
  // "Doctor _________ ?", "Doctor ...", "Doctor ?", "Who is the Doctor?", etc.
  const lower = storyText.toLowerCase();

  // 1. Resolve Doctor category (Doctor Who, Doctor Strange, Doctor Doom, Doctor Fate, Doctor Octopus, Doctor Manhattan)
  if (/\b(doctor|dr\.?|tardis|dalek|daleks|time lord|gallifrey|sanctum|sorcerer supreme|latveria|latverian|doc ock|otto octavius|helmet of nabu)\b/i.test(lower)) {
    const intendedDoctor = inferIntendedProfile(storyText, "doctor");
    if (intendedDoctor) {
      if (!existingTerms.has(intendedDoctor.canonicalTerm.toLowerCase())) {
        existingTerms.add(intendedDoctor.canonicalTerm.toLowerCase());
        resolvedList.push({
          term: intendedDoctor.canonicalTerm,
          ticker: intendedDoctor.ticker,
          type: intendedDoctor.type,
          target: "intelligence",
          wikiPath: intendedDoctor.wikiPath,
          roleDetails: {
            character: intendedDoctor.canonicalTerm,
            universe: intendedDoctor.universe,
            landmarkIssue: intendedDoctor.landmarkIssue,
            comicTicker: intendedDoctor.ticker,
          },
        });
      }

      // If Doctor Who, also resolve "The Doctor"
      if (intendedDoctor.id === "doctor-who" && !existingTerms.has("the doctor")) {
        existingTerms.add("the doctor");
        resolvedList.push({
          term: "The Doctor",
          ticker: "$DWHO",
          type: "character",
          target: "intelligence",
          wikiPath: intendedDoctor.wikiPath,
          roleDetails: {
            character: "The Doctor",
            universe: "DOCTOR_WHO",
            landmarkIssue: intendedDoctor.landmarkIssue,
            comicTicker: "$DWHO",
          },
        });
      }
    }
  }

  // 2. Check Captain references
  if (/\b(captain|capt\.?|starfleet|uss enterprise|star trek|vibranium shield|super soldier|shazam|billy batson)\b/i.test(lower)) {
    const intendedCaptain = inferIntendedProfile(storyText, "captain");
    if (intendedCaptain && !existingTerms.has(intendedCaptain.canonicalTerm.toLowerCase())) {
      existingTerms.add(intendedCaptain.canonicalTerm.toLowerCase());
      resolvedList.push({
        term: intendedCaptain.canonicalTerm,
        ticker: intendedCaptain.ticker,
        type: intendedCaptain.type,
        target: "intelligence",
        wikiPath: intendedCaptain.wikiPath,
        roleDetails: {
          character: intendedCaptain.canonicalTerm,
          universe: intendedCaptain.universe,
          landmarkIssue: intendedCaptain.landmarkIssue,
          comicTicker: intendedCaptain.ticker,
        },
      });
    }
  }

  // 3. Check Professor references
  if (/\b(professor|prof\.?|cerebro|xavier institute|charles xavier)\b/i.test(lower)) {
    const intendedProf = inferIntendedProfile(storyText, "professor");
    if (intendedProf && !existingTerms.has(intendedProf.canonicalTerm.toLowerCase())) {
      existingTerms.add(intendedProf.canonicalTerm.toLowerCase());
      resolvedList.push({
        term: intendedProf.canonicalTerm,
        ticker: intendedProf.ticker,
        type: intendedProf.type,
        target: "intelligence",
        wikiPath: intendedProf.wikiPath,
        roleDetails: {
          character: intendedProf.canonicalTerm,
          universe: intendedProf.universe,
          landmarkIssue: intendedProf.landmarkIssue,
          comicTicker: intendedProf.ticker,
        },
      });
    }
  }

  // 4. Check Mister / Mr references
  if (/\b(mister|mr\.?|baxter building|council of reeds|marauders)\b/i.test(lower)) {
    const intendedMister = inferIntendedProfile(storyText, "mister");
    if (intendedMister && !existingTerms.has(intendedMister.canonicalTerm.toLowerCase())) {
      existingTerms.add(intendedMister.canonicalTerm.toLowerCase());
      resolvedList.push({
        term: intendedMister.canonicalTerm,
        ticker: intendedMister.ticker,
        type: intendedMister.type,
        target: "intelligence",
        wikiPath: intendedMister.wikiPath,
        roleDetails: {
          character: intendedMister.canonicalTerm,
          universe: intendedMister.universe,
          landmarkIssue: intendedMister.landmarkIssue,
          comicTicker: intendedMister.ticker,
        },
      });
    }
  }

  // 5. DEFERENCE FILTER:
  // Strictly filter out any naked honorific term (e.g. standalone "Doctor", "Captain", "Professor")
  // that may have seeped in from raw database tables or obscure indie imports.
  return resolvedList.filter((e) => {
    const clean = e.term.toLowerCase().trim();
    return !AMBIGUOUS_HONORIFIC_PREFIXES.has(clean);
  });
}

/**
 * Intelligent Paraphrasing Engine:
 * When a news story presents an ambiguous headline or placeholder phrase
 * such as "Doctor _________ ?", "the doctor's return", or "Doctor Who / Doctor Strange?",
 * this function reads the story context, defuzzifies the true character intention,
 * and seamlessly clarifies the text during article synthesis.
 */
export function paraphraseInferredPlaceholders(text: string, contextText: string): string {
  if (!text) return text;

  // 1. Doctor / Dr. placeholders: "doctor __________ ?", "doctir _____ ?", "doctor ...?", "doctor [?]", etc.
  const doctorPlaceholderRegex = /\b(?:doctor|doctir|dr\.?)\s*(?:_{2,}|\.{3,}|\[\?\]|\?+)(\s*\?)?/gi;
  if (doctorPlaceholderRegex.test(text)) {
    const intended = inferIntendedProfile(contextText, "doctor");
    if (intended) {
      text = text.replace(doctorPlaceholderRegex, (match, trailingQ) => {
        const hasQuestion = match.includes("?") || Boolean(trailingQ);
        return `${intended.canonicalTerm}${hasQuestion ? "?" : ""}`;
      });
    }
  }

  // 2. Captain placeholders: "captain _____ ?", "capt. ...", etc.
  const captainPlaceholderRegex = /\b(?:captain|capt\.?)\s*(?:_{2,}|\.{3,}|\[\?\]|\?+)(\s*\?)?/gi;
  if (captainPlaceholderRegex.test(text)) {
    const intended = inferIntendedProfile(contextText, "captain");
    if (intended) {
      text = text.replace(captainPlaceholderRegex, (match, trailingQ) => {
        const hasQuestion = match.includes("?") || Boolean(trailingQ);
        return `${intended.canonicalTerm}${hasQuestion ? "?" : ""}`;
      });
    }
  }

  // 3. Professor placeholders: "professor _____ ?", "prof. ...", etc.
  const profPlaceholderRegex = /\b(?:professor|prof\.?)\s*(?:_{2,}|\.{3,}|\[\?\]|\?+)(\s*\?)?/gi;
  if (profPlaceholderRegex.test(text)) {
    const intended = inferIntendedProfile(contextText, "professor");
    if (intended) {
      text = text.replace(profPlaceholderRegex, (match, trailingQ) => {
        const hasQuestion = match.includes("?") || Boolean(trailingQ);
        return `${intended.canonicalTerm}${hasQuestion ? "?" : ""}`;
      });
    }
  }

  // 4. Mister / Mr. placeholders: "mister _____ ?", "mr. ...", etc.
  const mrPlaceholderRegex = /\b(?:mister|mr\.?)\s*(?:_{2,}|\.{3,}|\[\?\]|\?+)(\s*\?)?/gi;
  if (mrPlaceholderRegex.test(text)) {
    const intended = inferIntendedProfile(contextText, "mister");
    if (intended) {
      text = text.replace(mrPlaceholderRegex, (match, trailingQ) => {
        const hasQuestion = match.includes("?") || Boolean(trailingQ);
        return `${intended.canonicalTerm}${hasQuestion ? "?" : ""}`;
      });
    }
  }

  return text;
}
