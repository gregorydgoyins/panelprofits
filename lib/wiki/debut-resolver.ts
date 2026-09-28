import fs from "fs";
import path from "path";
import { LANDMARK_MARVEL_DEBUTS } from "./entity-extractor";

export interface ComicDebutInfo {
  series: string;
  issue: string;
  characters: string[];
  creators: string[];
  items?: string[];
  locations?: string[];
  teams?: string[];
  universe: "DC" | "MARVEL" | "IMAGE" | "DARK_HORSE" | "STAR_WARS" | "TRANSFORMERS" | "INDEPENDENT";
}

interface BookDebutRecord {
  series: string;
  issue: string;
  characters?: string[];
  creators?: string[];
  items?: string[];
  locations?: string[];
  teams?: string[];
}

let dcDebutsCache: Record<string, BookDebutRecord> | null = null;
let marvelDebutsCache: Record<string, BookDebutRecord> | null = null;

function loadDebutsCache() {
  if (!dcDebutsCache) {
    try {
      const p = path.join(process.cwd(), "lib/wiki/dc_first_appearances.json");
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, "utf-8");
        const parsed = JSON.parse(raw);
        dcDebutsCache = parsed.book_map || {};
      } else {
        dcDebutsCache = {};
      }
    } catch {
      dcDebutsCache = {};
    }
  }

  if (!marvelDebutsCache) {
    try {
      const p = path.join(process.cwd(), "lib/wiki/marvel_first_appearances.json");
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, "utf-8");
        const parsed = JSON.parse(raw);
        marvelDebutsCache = parsed.book_map || {};
      } else {
        marvelDebutsCache = {};
      }
    } catch {
      marvelDebutsCache = {};
    }
  }
}

/**
 * Resolves debut characters, creators, items, and locations for any comic issue
 * across DC, Marvel, Star Wars, and Indie publisher databases.
 */
export function resolveIssueDebuts(seriesName?: string | null, issueNumber?: string | null): ComicDebutInfo | null {
  if (!seriesName || !issueNumber) return null;

  const cleanSeries = seriesName.toLowerCase().replace(/^(the|a)\s+/, "").trim();
  const cleanIssue = issueNumber.replace(/^#/, "").trim();
  const key = `${cleanSeries} #${cleanIssue}`;

  loadDebutsCache();

  // 0. Check Curated Landmark Milestones
  if (LANDMARK_MARVEL_DEBUTS[key]) {
    const lm = LANDMARK_MARVEL_DEBUTS[key];
    const isDc = ["action comics", "detective comics", "batman", "superman", "showcase", "flash comics", "more fun", "all star", "all-star", "whiz", "green lantern", "crisis", "new teen titans", "swamp thing", "watchmen", "sandman", "brave and the bold"].some((d) => cleanSeries.includes(d));
    const isImage = ["spawn", "savage dragon", "invincible", "walking dead", "saga"].some((im) => cleanSeries.includes(im));
    const isDarkHorse = ["hellboy", "sin city", "dark horse"].some((dh) => cleanSeries.includes(dh));
    const isStarWars = ["star wars", "darth vader", "boba fett", "mandalorian"].some((sw) => cleanSeries.includes(sw));
    const isTransformers = ["transformers", "hasbro", "optimus"].some((tf) => cleanSeries.includes(tf));

    // Check if cache has additional entities to merge
    const dbRecord = isDc ? dcDebutsCache?.[key] : marvelDebutsCache?.[key];
    const mergedChars = Array.from(new Set([...(lm.characters || []), ...(dbRecord?.characters || [])]));
    const mergedCreators = Array.from(new Set([...(lm.creators || []), ...(dbRecord?.creators || [])]));
    const mergedItems = Array.from(new Set([...(lm.items || []), ...(dbRecord?.items || [])]));
    const mergedLocations = Array.from(new Set([...(lm.locations || []), ...(dbRecord?.locations || [])]));
    const mergedTeams = Array.from(new Set([...(lm.teams || []), ...(dbRecord?.teams || [])]));

    return {
      series: seriesName,
      issue: cleanIssue,
      characters: mergedChars,
      creators: mergedCreators,
      items: mergedItems,
      locations: mergedLocations,
      teams: mergedTeams,
      universe: isDc ? "DC" : isImage ? "IMAGE" : isDarkHorse ? "DARK_HORSE" : isStarWars ? "STAR_WARS" : isTransformers ? "TRANSFORMERS" : "MARVEL",
    };
  }

  // 1. Check DC Database Debuts
  if (dcDebutsCache && dcDebutsCache[key]) {
    const entry = dcDebutsCache[key];
    return {
      series: entry.series || seriesName,
      issue: entry.issue || cleanIssue,
      characters: entry.characters || [],
      creators: entry.creators || [],
      items: entry.items || [],
      locations: entry.locations || [],
      teams: entry.teams || [],
      universe: "DC",
    };
  }

  // 2. Check Marvel Database Debuts
  if (marvelDebutsCache && marvelDebutsCache[key]) {
    const entry = marvelDebutsCache[key];
    return {
      series: entry.series || seriesName,
      issue: entry.issue || cleanIssue,
      characters: entry.characters || [],
      creators: entry.creators || [],
      items: entry.items || [],
      locations: entry.locations || [],
      teams: entry.teams || [],
      universe: "MARVEL",
    };
  }

  return null;
}
