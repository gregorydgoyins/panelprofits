import { createAdminServerClient } from "@/lib/supabase/admin";

/**
 * Sniper census: reads the CGC population report straight from Supabase `cgc_population`
 * (one row per issue/edition, per-grade counts in `pop`) through the indexed `sniper_census_batch`
 * RPC: ONE round trip for a whole page of auctions. Nothing is estimated: the issue AND volume year must
 * match exactly, otherwise the auction has no census (reported as not found).
 *
 * Note: `is_base` is true on every row in the table, so it is NOT a base-edition flag. The base
 * edition is the row with `variant` null; editions (Dutch, Filipino, ...) are separate rows and are
 * never mixed into the base count.
 */
export interface GradeCensus {
  title: string;
  issue: string;
  year: number | null;
  /** All CGC-graded copies of this issue (base edition). */
  total: number;
  /** Copies graded exactly at the auction's grade. */
  atGrade?: number;
  /** Copies graded strictly higher than the auction's grade. */
  higher?: number;
  /** Copies graded strictly lower than the auction's grade. */
  lower?: number;
  /** Copies at the same grade or better (the rank the copy ties for). */
  atOrAbove?: number;
  /** Per-grade population, ascending (e.g. { "9.8": 2272 }). */
  byGrade: Record<string, number>;
}

export interface CensusQuery {
  key: string;
  series: string;
  issue: string;
  grade?: number | null;
  year?: number | null;
}

interface PopRow {
  k: string;
  title: string;
  issue_number: string | null;
  year: number | null;
  total: number;
  pop: Record<string, number>;
}

const NON_NUMERIC = new Set(["NG", "PG", "CVR"]);
const gradeLabel = (k: string) => k.replace("_", ".");
const cleanSeries = (s: string) => s.replace(/\(\s*\d{4}\s*\)/g, "").replace(/\s+/g, " ").trim();
const cleanIssue = (s: string) => String(s).replace(/^#/, "").trim();

function build(row: PopRow, issue: string, grade?: number | null): GradeCensus {
  const byGrade: Record<string, number> = {};
  const numeric: Array<[number, number]> = [];
  for (const [k, v] of Object.entries(row.pop ?? {})) {
    if (NON_NUMERIC.has(k)) continue;
    const g = parseFloat(gradeLabel(k));
    if (!Number.isFinite(g)) continue;
    byGrade[gradeLabel(k)] = Number(v) || 0;
    numeric.push([g, Number(v) || 0]);
  }
  const out: GradeCensus = { title: row.title, issue: String(row.issue_number ?? issue), year: row.year, total: row.total, byGrade };
  if (grade != null && Number.isFinite(grade)) {
    out.atGrade = byGrade[grade.toFixed(1)] ?? 0;
    out.higher = numeric.filter(([g]) => g > grade).reduce((s, [, n]) => s + n, 0);
    out.lower = numeric.filter(([g]) => g < grade).reduce((s, [, n]) => s + n, 0);
    out.atOrAbove = out.atGrade + out.higher;
  }
  return out;
}

/** Resolve census for many auctions in one database round trip. Missing/ambiguous = absent from the map. */
export async function lookupGradeCensusBatch(queries: CensusQuery[]): Promise<Map<string, GradeCensus>> {
  const result = new Map<string, GradeCensus>();
  const valid = queries
    .map((q) => ({ ...q, title: cleanSeries(q.series), iss: cleanIssue(q.issue) }))
    .filter((q) => q.title && q.iss);
  if (valid.length === 0) return result;

  // One database lookup per distinct title+issue, however many auctions share it.
  const pairKey = (q: { title: string; iss: string }) => `${q.title.toLowerCase()}|${q.iss.toLowerCase()}`;
  const distinct = new Map<string, { k: string; title: string; issue: string }>();
  for (const q of valid) if (!distinct.has(pairKey(q))) distinct.set(pairKey(q), { k: pairKey(q), title: q.title, issue: q.iss });

  const { data, error } = await createAdminServerClient().rpc("sniper_census_batch", { p_keys: [...distinct.values()] });
  if (error) throw new Error(`sniper_census_batch failed: ${error.message}`);

  const byKey = new Map<string, PopRow[]>();
  for (const r of (data ?? []) as PopRow[]) {
    const list = byKey.get(r.k) ?? [];
    list.push(r);
    byKey.set(r.k, list);
  }

  for (const q of valid) {
    const rows = byKey.get(pairKey(q)) ?? [];
    // Exact volume only: the listing's year must equal CGC's year. No year or no match = not found. Never guess.
    const row = q.year ? rows.find((r) => r.year === q.year) : undefined;
    if (row) result.set(q.key, build(row, q.iss, q.grade));
  }
  return result;
}
