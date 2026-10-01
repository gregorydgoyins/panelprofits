import { createCleanReadOnlyServerClient } from "@/lib/supabase/admin";
import type { Grade } from "./source-ladder";

export type CleanPricingEvidence = {
  grades: Partial<Record<Grade, number>>;
  sources: Set<string>;
  observationCount: number;
};

// NOTE: In the live Clean Supabase project (`vbcmjmakluyjnsmisoth`), comic pricing
// evidence is grounded in `ppcf_price_observations` (7.5M records) and `public.comics`
// pricing columns. The legacy `comic_market_instrument_grade_prices` table was an
// archaeological table from the deprecated `ghjlzrmuugquumqwlqgl` database.
export async function getCleanPricingEvidence(variantId: string): Promise<CleanPricingEvidence> {
  if (variantId && variantId.startsWith("PPCF-")) {
    const db = createCleanReadOnlyServerClient();
    const { data, error } = await db
      .from("ppcf_price_observations")
      .select("grade_label, amount, source_system")
      .eq("ppcf_id", variantId)
      .gt("amount", 0);

    if (!error && data && data.length > 0) {
      const grades: Partial<Record<Grade, number>> = {};
      const sources = new Set<string>();
      for (const row of data) {
        const grade = String(row.grade_label) as Grade;
        const price = Number(row.amount);
        if (price > 0 && !grades[grade]) grades[grade] = price;
        if (row.source_system) sources.add(row.source_system);
      }
      return { grades, sources, observationCount: data.length };
    }
  }

  return { grades: {}, sources: new Set(), observationCount: 0 };
}
