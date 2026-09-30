import { createCleanReadOnlyServerClient } from "@/lib/supabase/admin";
import type { Grade } from "./source-ladder";

export type CleanPricingEvidence = {
  grades: Partial<Record<Grade, number>>;
  sources: Set<string>;
  observationCount: number;
};

// NOTE (2026-09-29): `comic_market_instrument_grade_prices` does not exist in the live
// Clean Supabase project (confirmed via direct SQL: 42P01 relation does not exist) and has
// never existed in any tracked migration or design doc in this repo's history (checked
// `git log --all -S` for the table name and grepped every migration for its columns/name).
// It is not a stale name for `ppcf_price_observations` either: that table keys on `ppcf_id`,
// reached only through an unverified `comics -> ppcf_source_links -> ppcf_canonical_comics`
// crosswalk that does not exist for the `comics` table today (only `collection_items` and
// `watchlist_items` were ever given a `ppcf_id` column), and it uses different columns
// entirely (`amount`/`source_system`/`grade_label` vs `price_usd`/`source_id`/`grade`).
// Wiring this function to that table would mean inventing an unverified join/methodology,
// not fixing a rename, so until a real Clean grade-price table is migrated this function
// stays a documented no-op: it logs the gap (visible in server logs) and returns empty
// evidence so callers such as PricingDossier keep rendering their existing fallback ladders
// instead of breaking.
export async function getCleanPricingEvidence(variantId: string): Promise<CleanPricingEvidence> {
  const db = createCleanReadOnlyServerClient();
  const { data, error } = await db
    .from("comic_market_instrument_grade_prices")
    .select("grade,price_usd,source_id")
    .eq("variant_id", variantId)
    .gt("price_usd", 0);

  if (error) {
    console.error(
      "[getCleanPricingEvidence] comic_market_instrument_grade_prices is unavailable " +
        "(the table does not exist in Clean; see the NOTE above lib/pricing/clean.ts). " +
        `variantId=${variantId} error=${error.message}`
    );
    return { grades: {}, sources: new Set(), observationCount: 0 };
  }

  const grades: Partial<Record<Grade, number>> = {};
  const sources = new Set<string>();
  for (const row of data || []) {
    const grade = String(row.grade) as Grade;
    const price = Number(row.price_usd);
    if (price > 0 && !grades[grade]) grades[grade] = price;
    if (row.source_id) sources.add(row.source_id);
  }
  return { grades, sources, observationCount: data?.length || 0 };
}
