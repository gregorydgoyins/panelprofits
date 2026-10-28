import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { createPublicReadOnlyClient, createAdminServerClient } from "@/lib/supabase/admin";

const requireModule = createRequire(import.meta.url);

export interface GcdStoryRip {
  storyId: number;
  sequence: number;
  title: string;
  synopsis: string;
  characters: string;
  writer: string;
  penciler: string;
  inker: string;
  colorist: string;
  letterer: string;
  editor: string;
  genre: string;
  pageCount: number | null;
}

export interface GcdStoryDossier {
  gcdIssueId: number | null;
  leadStoryTitle: string;
  leadSynopsis: string;
  leadCharacters: string;
  leadWriter: string;
  leadPenciler: string;
  leadInker: string;
  leadColorist: string;
  leadLetterer: string;
  leadEditor: string;
  leadGenre: string;
  allStories: GcdStoryRip[];
  writers: string[];
  pencilers: string[];
  inkers: string[];
  colorists: string[];
  letterers: string[];
  editors: string[];
}

const memoryStoryCache = new Map<string, GcdStoryDossier | null>();

let localGcdDb: any = null;
let localDbChecked = false;

function getLocalGcdDb(): any | null {
  if (localDbChecked) return localGcdDb;
  localDbChecked = true;

  const candidatePaths = [
    "/Users/macuser/Downloads/2026-09-01.db",
    "/Users/macuser/Downloads/gcd-full-As1Act/2026-09-15.db",
  ];

  for (const gcdPath of candidatePaths) {
    try {
      if (fs.existsSync(gcdPath)) {
        const { DatabaseSync } = requireModule("node:sqlite");
        localGcdDb = new DatabaseSync(gcdPath, { readOnly: true });
        return localGcdDb;
      }
    } catch (_) {}
  }

  return null;
}

let bundled115kDb: any = null;
let bundled115kChecked = false;

function getBundled115kDb(): any | null {
  if (bundled115kChecked) return bundled115kDb;
  bundled115kChecked = true;

  const candidatePaths = [
    path.join(process.cwd(), "data", "pp115k.sqlite"),
    path.join(process.cwd(), "panel-profits", "data", "pp115k.sqlite"),
  ];

  for (const p of candidatePaths) {
    try {
      if (fs.existsSync(p)) {
        const { DatabaseSync } = requireModule("node:sqlite");
        const absPath = path.resolve(p);
        try {
          const uri = `file:${absPath}?mode=ro&immutable=1`;
          bundled115kDb = new DatabaseSync(uri, { readOnly: true });
        } catch (_) {
          bundled115kDb = new DatabaseSync(absPath, { readOnly: true });
        }
        return bundled115kDb;
      }
    } catch (_) {}
  }

  return null;
}

let variantMap: Record<string, number> | null = null;
let variantMapChecked = false;

function getVariantBaseId(issueId: number): number | null {
  if (!variantMapChecked) {
    variantMapChecked = true;
    try {
      const candidatePaths = [
        path.join(process.cwd(), "data", "gcd_variant_map.json"),
        path.join(process.cwd(), "panel-profits", "data", "gcd_variant_map.json"),
      ];
      for (const p of candidatePaths) {
        if (fs.existsSync(p)) {
          variantMap = JSON.parse(fs.readFileSync(p, "utf8"));
          break;
        }
      }
    } catch (_) {}
  }
  if (variantMap && variantMap[String(issueId)]) {
    return variantMap[String(issueId)];
  }
  return null;
}

/**
 * Resolves authentic GCD story rips (titles, synopses, characters, creative credits)
 * using multi-tier fallback:
 * Tier 1: Local 6.3GB GCD database (when running on host machine)
 * Tier 2: Supabase ppcf_gcd_stories & gcd_candidate_snapshots (for Vercel production)
 * Tier 3: Bundled pp115k.sqlite crosswalk
 */
export async function resolveGcdStoryDossier(
  gcdSourceId?: string | number | null,
  seriesName?: string | null,
  issueNumber?: string | number | null,
  publicationYear?: number | null
): Promise<GcdStoryDossier | null> {
  const cleanSeries = String(seriesName || "")
    .replace(/\s*\(\d{4}\)/g, "")
    .replace(/\s*#\d+/g, "")
    .trim();
  const cleanSeriesNoThe = cleanSeries.toLowerCase().startsWith("the ")
    ? cleanSeries.slice(4).trim()
    : cleanSeries;
  const cleanSeriesNoComics = cleanSeriesNoThe.replace(/\s+comics$/i, "").trim();
  const cleanIssue = String(issueNumber || "")
    .trim()
    .replace(/^#/, "");

  const cacheKey = `${gcdSourceId || "no-id"}:${cleanSeries}:${cleanIssue}:${publicationYear || "no-year"}`;
  if (memoryStoryCache.has(cacheKey)) {
    return memoryStoryCache.get(cacheKey) || null;
  }

  let issueId: number | null = gcdSourceId ? parseInt(String(gcdSourceId), 10) : null;
  if (isNaN(issueId as number)) issueId = null;

  const localDb = getLocalGcdDb();
  const bundledDb = getBundled115kDb();

  // Tier 1A: If issueId is missing, resolve via bundled pp115k.sqlite
  if (!issueId && bundledDb && cleanSeries && cleanIssue) {
    try {
      const row = bundledDb
        .prepare("SELECT gcd_id FROM comics WHERE (series = ? OR series = ? OR series LIKE ?) AND issue_number = ? LIMIT 1")
        .get(cleanSeries, cleanSeriesNoComics, `${cleanSeriesNoComics}%`, cleanIssue) as any;
      if (row && row.gcd_id) {
        const parsed = parseInt(String(row.gcd_id), 10);
        if (!isNaN(parsed)) issueId = parsed;
      }
    } catch (_) {}
  }

  // Tier 1B: If issueId is missing, resolve via local 6.3GB GCD DB
  if (!issueId && localDb && cleanSeries && cleanIssue) {
    try {
      const row = localDb
        .prepare(
          `SELECT i.id FROM gcd_issue i 
           JOIN gcd_series s ON i.series_id = s.id 
           WHERE (s.name = ? COLLATE NOCASE OR s.name = ? COLLATE NOCASE OR s.name = ? COLLATE NOCASE OR s.name LIKE ? COLLATE NOCASE)
           AND i.number = ?
           ORDER BY 
             CASE WHEN s.country_id = 225 THEN 0 ELSE 1 END,
             CASE WHEN ? IS NOT NULL AND s.year_began <= ? AND (s.year_ended IS NULL OR s.year_ended >= ?) THEN 0 ELSE 1 END,
             CASE WHEN ? IS NOT NULL AND ABS(s.year_began - ?) <= 5 THEN 0 ELSE 1 END,
             i.id ASC
           LIMIT 1`
        )
        .get(
          cleanSeries,
          cleanSeriesNoThe,
          cleanSeriesNoComics,
          `${cleanSeriesNoComics}%`,
          cleanIssue,
          publicationYear, publicationYear, publicationYear,
          publicationYear, publicationYear
        ) as any;
      if (row && row.id) {
        issueId = row.id;
      }
    } catch (_) {}
  }

  // Tier 2A: If issueId is still missing, resolve via Supabase gcd_candidate_snapshots
  if (!issueId && cleanSeries && cleanIssue) {
    try {
      const supabase = createPublicReadOnlyClient();
      const { data: snaps } = await supabase
        .from("gcd_candidate_snapshots")
        .select("gcd_issue_id")
        .ilike("series_name", `%${cleanSeries}%`)
        .eq("issue_number", cleanIssue)
        .limit(1);
      if (snaps && snaps[0]?.gcd_issue_id) {
        issueId = snaps[0].gcd_issue_id;
      }
    } catch (_) {}
  }

  if (!issueId) {
    memoryStoryCache.set(cacheKey, null);
    return null;
  }

  // Fetch stories: try local DB first, then fallback to Supabase ppcf_gcd_stories
  let rawStories: any[] = [];

  if (localDb) {
    try {
      const fetchStoriesForIssue = (targetId: number) => {
        const stories = localDb
          .prepare(
            `SELECT 
              s.id as gcd_story_id, s.issue_id as gcd_issue_id, s.title, s.synopsis, s.characters,
              s.script, s.pencils, s.inks, s.colors, s.letters, s.editing,
              s.genre, s.sequence_number, s.page_count
             FROM gcd_story s
             WHERE s.issue_id = ? AND s.deleted = 0 
             ORDER BY s.sequence_number ASC`
          )
          .all(targetId) as any[];

        if (!stories || stories.length === 0) return [];

        const storyIds = stories.map((s) => s.gcd_story_id);
        const placeholders = storyIds.map(() => "?").join(",");

        const credits = localDb
          .prepare(
            `SELECT sc.story_id, ct.name as credit_type, cnd.name as creator_name
             FROM gcd_story_credit sc
             JOIN gcd_credit_type ct ON sc.credit_type_id = ct.id
             JOIN gcd_creator_name_detail cnd ON sc.creator_id = cnd.id
             WHERE sc.story_id IN (${placeholders})`
          )
          .all(...storyIds) as any[];

        const issueCredits = localDb
          .prepare(
            `SELECT ic.issue_id, cnd.name as creator_name
             FROM gcd_issue_credit ic
             JOIN gcd_creator_name_detail cnd ON ic.creator_id = cnd.id
             WHERE ic.issue_id = ?`
          )
          .all(targetId) as any[];

        const creditsByStory = new Map<number, Record<string, string[]>>();
        for (const c of credits) {
          if (!creditsByStory.has(c.story_id)) {
            creditsByStory.set(c.story_id, {});
          }
          const rec = creditsByStory.get(c.story_id)!;
          if (!rec[c.credit_type]) rec[c.credit_type] = [];
          rec[c.credit_type].push(c.creator_name);
        }

        const editors = issueCredits.map((c: any) => c.creator_name).join("; ");

        return stories.map((s) => {
          const sc = creditsByStory.get(s.gcd_story_id) || {};
          return {
            ...s,
            script: s.script || (sc["script"] ? sc["script"].join("; ") : null),
            pencils: s.pencils || (sc["pencils"] ? sc["pencils"].join("; ") : null),
            inks: s.inks || (sc["inks"] ? sc["inks"].join("; ") : null),
            colors: s.colors || (sc["colors"] ? sc["colors"].join("; ") : null),
            letters: s.letters || (sc["letters"] ? sc["letters"].join("; ") : null),
            editing: s.editing || editors || null,
          };
        });
      };

      rawStories = fetchStoriesForIssue(issueId);

      // If variant has 0 stories, look up parent variant_of_id
      if (rawStories.length === 0) {
        const parentRow = localDb.prepare("SELECT variant_of_id FROM gcd_issue WHERE id = ?").get(issueId) as any;
        if (parentRow && parentRow.variant_of_id) {
          issueId = Number(parentRow.variant_of_id);
          rawStories = fetchStoriesForIssue(issueId);
        }
      }
    } catch (_) {}
  }

  if (!rawStories || rawStories.length === 0) {
    try {
      const supabase = createAdminServerClient();
      const { data } = await supabase
        .from("ppcf_gcd_stories")
        .select("*")
        .eq("gcd_issue_id", issueId)
        .order("sequence_number", { ascending: true });
      rawStories = data || [];
    } catch (_) {}
  }

  // If 0 stories or only cover illustration, resolve variant-to-base issue via static map or bundled pp115k.sqlite gcd_variants
  const hasInteriorStories = rawStories.some((s) => s.sequence_number > 0 && (s.title || s.synopsis || s.script));
  if (!hasInteriorStories && issueId) {
    const baseId = getVariantBaseId(issueId);
    if (baseId) {
      try {
        const supabase = createAdminServerClient();
        const { data: baseStories } = await supabase
          .from("ppcf_gcd_stories")
          .select("*")
          .eq("gcd_issue_id", baseId)
          .order("sequence_number", { ascending: true });
        if (baseStories && baseStories.length > 0) {
          rawStories = baseStories;
          issueId = baseId;
        }
      } catch (_) {}
    } else if (bundledDb) {
      try {
        const varRow = bundledDb.prepare("SELECT base_issue_id FROM gcd_variants WHERE variant_issue_id = ?").get(issueId) as any;
        if (varRow && varRow.base_issue_id) {
          const bId = varRow.base_issue_id;
          const supabase = createAdminServerClient();
          const { data: baseStories } = await supabase
            .from("ppcf_gcd_stories")
            .select("*")
            .eq("gcd_issue_id", bId)
            .order("sequence_number", { ascending: true });
          if (baseStories && baseStories.length > 0) {
            rawStories = baseStories;
            issueId = bId;
          }
        }
      } catch (_) {}
    }
  }

  // If still 0 stories, check snapshots for alternate issue ids of this issue
  if ((!rawStories || rawStories.length === 0) && cleanSeries && cleanIssue) {
    try {
      const supabase = createPublicReadOnlyClient();
      const { data: allSnaps } = await supabase
        .from("gcd_candidate_snapshots")
        .select("gcd_issue_id")
        .ilike("series_name", `%${cleanSeries}%`)
        .eq("issue_number", cleanIssue);

      for (const s of allSnaps || []) {
        if (s.gcd_issue_id === issueId) continue;
        const { data: fbStories } = await supabase
          .from("ppcf_gcd_stories")
          .select("*")
          .eq("gcd_issue_id", s.gcd_issue_id)
          .order("sequence_number", { ascending: true });
        if (fbStories && fbStories.length > 0) {
          rawStories = fbStories;
          issueId = s.gcd_issue_id;
          break;
        }
      }
    } catch (_) {}
  }

  if (!rawStories || rawStories.length === 0) {
    memoryStoryCache.set(cacheKey, null);
    return null;
  }

  // Pick lead story: the story with the longest synopsis, or sequence > 0 with title/synopsis
  let leadStory = null;
  for (const st of rawStories) {
    const syn = st.synopsis || "";
    if (syn && (!leadStory || syn.length > (leadStory.synopsis?.length || 0))) {
      leadStory = st;
    }
  }
  if (!leadStory && rawStories.length > 0) {
    leadStory = rawStories.find((s) => s.title) || rawStories[0];
  }

  const cleanField = (val: any): string => {
    if (!val || typeof val !== "string") return "";
    const trimmed = val.trim();
    if (trimmed === "?" || trimmed === "none" || trimmed === "null" || trimmed === "undefined") return "";
    // Reject Cyrillic, Hangul, or broken mojibake encoding artifacts
    if (/[\u0400-\u04FF\uAC00-\uD7AF\u1100-\u11FF]/.test(trimmed)) return "";
    return trimmed;
  };

  const writers = [...new Set(rawStories.map((s) => cleanField(s.script)).filter(Boolean))];
  const pencilers = [...new Set(rawStories.map((s) => cleanField(s.pencils)).filter(Boolean))];
  const inkers = [...new Set(rawStories.map((s) => cleanField(s.inks)).filter(Boolean))];
  const colorists = [...new Set(rawStories.map((s) => cleanField(s.colors)).filter(Boolean))];
  const letterers = [...new Set(rawStories.map((s) => cleanField(s.letters)).filter(Boolean))];
  const editors = [...new Set(rawStories.map((s) => cleanField(s.editing)).filter(Boolean))];
  const allCharacters = [...new Set(rawStories.map((s) => cleanField(s.characters)).filter(Boolean))].join("; ");

  const storyRips: GcdStoryRip[] = rawStories.map((s) => ({
    storyId: s.gcd_story_id,
    sequence: s.sequence_number,
    title: cleanField(s.title) || (s.sequence_number === 0 ? "Cover Illustration" : `Story Sequence ${s.sequence_number}`),
    synopsis: cleanField(s.synopsis),
    characters: cleanField(s.characters),
    writer: cleanField(s.script),
    penciler: cleanField(s.pencils),
    inker: cleanField(s.inks),
    colorist: cleanField(s.colors),
    letterer: cleanField(s.letters),
    editor: cleanField(s.editing),
    genre: cleanField(s.genre),
    pageCount: s.page_count ? Number(s.page_count) : null,
  }));

  const dossier: GcdStoryDossier = {
    gcdIssueId: issueId,
    leadStoryTitle: cleanField(leadStory?.title),
    leadSynopsis: cleanField(leadStory?.synopsis),
    leadCharacters: cleanField(leadStory?.characters) || allCharacters,
    leadWriter: cleanField(leadStory?.script) || writers[0] || "",
    leadPenciler: cleanField(leadStory?.pencils) || pencilers[0] || "",
    leadInker: cleanField(leadStory?.inks) || inkers[0] || "",
    leadColorist: cleanField(leadStory?.colors) || colorists[0] || "",
    leadLetterer: cleanField(leadStory?.letters) || letterers[0] || "",
    leadEditor: cleanField(leadStory?.editing) || editors[0] || "",
    leadGenre: cleanField(leadStory?.genre) || "Superhero",
    allStories: storyRips,
    writers,
    pencilers,
    inkers,
    colorists,
    letterers,
    editors,
  };

  memoryStoryCache.set(cacheKey, dossier);
  return dossier;
}
