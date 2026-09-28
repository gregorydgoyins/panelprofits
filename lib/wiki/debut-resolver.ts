import fs from "fs";
import path from "path";

export interface ComicDebutInfo {
  series: string;
  issue: string;
  characters: string[];
  creators: string[];
  universe: "DC" | "MARVEL" | "IMAGE" | "DARK_HORSE" | "STAR_WARS" | "TRANSFORMERS" | "INDEPENDENT";
}

let dcDebutsCache: Record<string, { series: string; issue: string; characters: string[]; creators: string[] }> | null = null;
let marvelDebutsCache: Record<string, { series: string; issue: string; characters: string[]; creators: string[] }> | null = null;

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

import { LANDMARK_MARVEL_DEBUTS } from "./entity-extractor";

/**
 * Resolves debut characters and creators for any comic issue across DC & Marvel databases.
 */
export function resolveIssueDebuts(seriesName?: string | null, issueNumber?: string | null): ComicDebutInfo | null {
  if (!seriesName || !issueNumber) return null;

  const cleanSeries = seriesName.toLowerCase().replace(/^(the|a)\s+/, "").trim();
  const cleanIssue = issueNumber.replace(/^#/, "").trim();
  const key = `${cleanSeries} #${cleanIssue}`;

  // 0. Check Curated Landmark Milestones
  if (LANDMARK_MARVEL_DEBUTS[key]) {
    const lm = LANDMARK_MARVEL_DEBUTS[key];
    const isDc = ["action comics", "detective comics", "batman", "superman", "showcase", "flash comics", "more fun", "all star", "all-star", "whiz", "green lantern", "crisis", "new teen titans", "swamp thing", "watchmen", "sandman", "brave and the bold"].some((d) => cleanSeries.includes(d));
    const isImage = ["spawn", "savage dragon", "invincible", "walking dead", "saga"].some((im) => cleanSeries.includes(im));
    const isDarkHorse = ["hellboy", "sin city", "dark horse"].some((dh) => cleanSeries.includes(dh));
    const isStarWars = ["star wars", "darth vader", "boba fett", "mandalorian"].some((sw) => cleanSeries.includes(sw));
    const isTransformers = ["transformers", "hasbro", "optimus"].some((tf) => cleanSeries.includes(tf));

    return {
      series: seriesName,
      issue: cleanIssue,
      characters: lm.characters,
      creators: lm.creators,
      universe: isDc ? "DC" : isImage ? "IMAGE" : isDarkHorse ? "DARK_HORSE" : isStarWars ? "STAR_WARS" : isTransformers ? "TRANSFORMERS" : "MARVEL",
    };
  }

  loadDebutsCache();

  // 1. Check DC Database Debuts
  if (dcDebutsCache && dcDebutsCache[key]) {
    const entry = dcDebutsCache[key];
    return {
      series: entry.series,
      issue: entry.issue,
      characters: entry.characters,
      creators: entry.creators,
      universe: "DC",
    };
  }

  // 2. Check Marvel Database Debuts
  if (marvelDebutsCache && marvelDebutsCache[key]) {
    const entry = marvelDebutsCache[key];
    return {
      series: entry.series,
      issue: entry.issue,
      characters: entry.characters,
      creators: entry.creators,
      universe: "MARVEL",
    };
  }

  return null;
}
