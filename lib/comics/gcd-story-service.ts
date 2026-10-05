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

  try {
    const gcdPath = "/Users/macuser/Downloads/gcd-full-As1Act/2026-09-15.db";
    if (fs.existsSync(gcdPath)) {
      const { DatabaseSync } = requireModule("node:sqlite");
      localGcdDb = new DatabaseSync(gcdPath, { readOnly: true });
      return localGcdDb;
    }
  } catch (_) {}

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
        bundled115kDb = new DatabaseSync(p, { readOnly: true });
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
        .prepare("SELECT gcd_id FROM comics WHERE (series = ? OR series LIKE ?) AND issue_number = ? LIMIT 1")
        .get(cleanSeries, `${cleanSeries}%`, cleanIssue) as any;
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
           WHERE (s.name = ? COLLATE NOCASE OR s.name = ? COLLATE NOCASE OR s.name LIKE ? COLLATE NOCASE)
           AND i.number = ?
           ORDER BY CASE WHEN s.country_id = 225 THEN 0 ELSE 1 END, i.id ASC
           LIMIT 1`
        )
        .get(cleanSeries, `The ${cleanSeries}`, `${cleanSeries}%`, cleanIssue) as any;
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
      rawStories = localDb
        .prepare(
          `SELECT id as gcd_story_id, issue_id as gcd_issue_id, title, synopsis, characters, script, pencils, inks, colors, letters, editing, genre, sequence_number, page_count
           FROM gcd_story 
           WHERE issue_id = ? AND deleted = 0 
           ORDER BY sequence_number ASC`
        )
        .all(issueId) as any[];

      // If variant has 0 stories, look up parent variant_of_id
      if (rawStories.length === 0) {
        const parentRow = localDb.prepare("SELECT variant_of_id FROM gcd_issue WHERE id = ?").get(issueId) as any;
        if (parentRow && parentRow.variant_of_id) {
          issueId = parentRow.variant_of_id;
          rawStories = localDb
            .prepare(
              `SELECT id as gcd_story_id, issue_id as gcd_issue_id, title, synopsis, characters, script, pencils, inks, colors, letters, editing, genre, sequence_number, page_count
               FROM gcd_story 
               WHERE issue_id = ? AND deleted = 0 
               ORDER BY sequence_number ASC`
            )
            .all(issueId) as any[];
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
    return trimmed === "?" || trimmed === "none" ? "" : trimmed;
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
