import { createCleanReadOnlyServerClient } from "@/lib/supabase/admin";
import { resolveComicCover } from "@/lib/comics/cover-resolver";

export interface ComicCoverEvidence {
  image_url: string | null;
  storage_path: string | null;
  image_source?: string | null;
  checksum?: string | null;
  quality_tier?: string | null;
  source_tier?: string | null;
  is_fallback?: boolean;
}

export async function getComicCoverEvidence(comicId: string): Promise<ComicCoverEvidence | null> {
  try {
    if (!comicId) return null;
    const db = createCleanReadOnlyServerClient();
    const { data, error } = await db
      .from("pp_comics")
      .select(
        "id,series,issue_number,publication_year,cover_url,gcd_source_id"
      )
      .eq("id", comicId)
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    const resolved = resolveComicCover(data);
    return {
      image_url: resolved.url,
      storage_path: null,
      image_source: resolved.sourceTier,
      checksum: null,
      quality_tier: resolved.qualityTier,
      source_tier: resolved.sourceTier,
      is_fallback: resolved.isFallback,
    };
  } catch (err) {
    console.warn("Failed to get comic cover evidence:", err);
    return null;
  }
}

export async function getComicCoverEvidenceByIds(comicIds: string[]) {
  try {
    const ids = [...new Set(comicIds.filter(Boolean))];
    if (!ids.length) return new Map<string, ComicCoverEvidence>();

    const db = createCleanReadOnlyServerClient();
    const { data, error } = await db
      .from("pp_comics")
      .select(
        "id,series,issue_number,publication_year,cover_url,gcd_source_id"
      )
      .in("id", ids);

    if (error) {
      console.error("Error fetching cover evidence batch:", error);
      return new Map<string, ComicCoverEvidence>();
    }

    const covers = new Map<string, ComicCoverEvidence>();
    for (const row of data || []) {
      if (!covers.has(row.id)) {
        const resolved = resolveComicCover(row);
        covers.set(row.id, {
          image_url: resolved.url,
          storage_path: null,
          image_source: resolved.sourceTier,
          checksum: null,
          quality_tier: resolved.qualityTier,
          source_tier: resolved.sourceTier,
          is_fallback: resolved.isFallback,
        });
      }
    }
    return covers;
  } catch (err) {
    console.warn("Failed to get batch cover evidence:", err);
    return new Map<string, ComicCoverEvidence>();
  }
}
