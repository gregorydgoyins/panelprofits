import { createAdminServerClient } from "@/lib/supabase/admin";

/**
 * Sniper census: reads the CGC population report straight from Supabase `cgc_population`
 * (one row per issue/edition, per-grade counts in `pop`). Nothing is estimated: if the issue is not
 * in the table, every field stays undefined.
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

interface PopRow {
  title: string;
  issue_number: string | null;
  year: number | null;
  total: number;
  pop: Record<string, number>;
}

const NON_NUMERIC = new Set(["NG", "PG", "CVR"]);
const cache = new Map<string, { at: number; row: PopRow | null }>();
const TTL_MS = 10 * 60 * 1000;

const gradeKey = (g: number) => g.toFixed(1).replace(".", "_");
const gradeLabel = (k: string) => k.replace("_", ".");

function escapeIlike(s: string): string {
  return s.replace(/[\\%_]/g, (c) => `\\${c}`);
}

function cleanSeries(series: string): string {
  return series.replace(/\(\s*\d{4}\s*\)/g, "").replace(/\s+/g, " ").trim();
}

async function fetchRow(series: string, issue: string, year?: number | null): Promise<PopRow | null> {
  const title = cleanSeries(series);
  const iss = String(issue).replace(/^#/, "").trim();
  if (!title || !iss) return null;
  const key = `${title.toLowerCase()}|${iss.toLowerCase()}|${year ?? ""}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.row;

  const { data, error } = await createAdminServerClient()
    .from("cgc_population")
    .select("title,issue_number,year,total,pop")
    .ilike("title", escapeIlike(title))
    .eq("issue_number", iss)
    .is("variant", null)
    .order("total", { ascending: false })
    .limit(10);
  if (error) throw new Error(`cgc_population lookup failed: ${error.message}`);

  const rows = (data ?? []) as PopRow[];
  const row =
    (year ? rows.find((r) => r.year === year) : undefined) ??
    // No year match: only trust a single unambiguous volume, never guess between volumes.
    (rows.length === 1 ? rows[0] : null);
  cache.set(key, { at: Date.now(), row });
  return row;
}

export async function lookupGradeCensus(
  series: string,
  issue: string,
  grade?: number | null,
  year?: number | null,
): Promise<GradeCensus | null> {
  const row = await fetchRow(series, issue, year);
  if (!row) return null;

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
    const key = gradeLabel(gradeKey(grade));
    out.atGrade = byGrade[key] ?? 0;
    out.higher = numeric.filter(([g]) => g > grade).reduce((s, [, n]) => s + n, 0);
    out.lower = numeric.filter(([g]) => g < grade).reduce((s, [, n]) => s + n, 0);
    out.atOrAbove = out.atGrade + out.higher;
  }
  return out;
}
