import { createCleanReadOnlyServerClient } from "@/lib/supabase/admin";
import { GRADES, type Grade } from "./source-ladder";

export type CleanPricingEvidence = {
  grades: Partial<Record<Grade, number>>;
  sources: Set<string>;
  observationCount: number;
};

function normalizeObservationGrade(rawGrade: unknown): Grade | null {
  if (typeof rawGrade !== "string" && typeof rawGrade !== "number") return null;
  const raw = String(rawGrade).trim();
  if (!raw) return null;

  const upper = raw.toUpperCase();
  // Filter out spread quotes (bids/asks) from grade FMV calculations
  if (
    upper.includes("BUY") ||
    upper.includes("SELL") ||
    upper.includes("ASK") ||
    upper.includes("BID")
  ) {
    return null;
  }

  if (upper === "UNGRADED" || upper === "RAW" || upper === "0") {
    return "RAW";
  }

  const dotted = raw.replace("_", ".");
  if ((GRADES as readonly string[]).includes(dotted)) {
    return dotted as Grade;
  }

  return null;
}

/**
 * Retrieves authentic verified historical pricing observations from the
 * canonical ppcf_price_observations repository (7.5M records).
 * Resolves by canonical PPCF variant ID, PP numeric source ID, or comic base ID.
 */
export async function getCleanPricingEvidence(
  variantId: string,
  ppSourceId?: string | null
): Promise<CleanPricingEvidence> {
  if (!variantId && !ppSourceId) {
    return { grades: {}, sources: new Set(), observationCount: 0 };
  }

  try {
    const db = createCleanReadOnlyServerClient();
    let query = db
      .from("ppcf_price_observations")
      .select("grade_label, amount, source_system, observed_at")
      .gt("amount", 0);

    if (variantId && variantId.startsWith("PPCF-")) {
      query = query.eq("ppcf_id", variantId);
    } else if (ppSourceId) {
      const cleanSourceId = ppSourceId.replace(/^pp-/i, "").trim();
      query = query.eq("source_record_id", cleanSourceId);
    } else if (variantId && (/^\d+$/.test(variantId) || /^pp-\d+$/i.test(variantId))) {
      query = query.eq("source_record_id", variantId.replace(/^pp-/i, "").trim());
    } else {
      return { grades: {}, sources: new Set(), observationCount: 0 };
    }

    const { data, error } = await query.order("observed_at", { ascending: false });

    if (!error && data && data.length > 0) {
      const grades: Partial<Record<Grade, number>> = {};
      const sources = new Set<string>();

      for (const row of data) {
        const grade = normalizeObservationGrade(row.grade_label);
        const price = Number(row.amount);
        if (grade && price > 0 && !grades[grade]) {
          grades[grade] = price;
        }
        if (row.source_system) {
          sources.add(row.source_system);
        }
      }

      return { grades, sources, observationCount: data.length };
    }
  } catch (err) {
    console.warn("Notice: Clean pricing evidence retrieval bypassed:", err);
  }

  return { grades: {}, sources: new Set(), observationCount: 0 };
}
