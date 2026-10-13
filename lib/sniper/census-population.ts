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
const PUBLISHER_PREFIX = /^(?:marvel(?:\s+comics)?|dc(?:\s+comics)?|image(?:\s+comics)?|dark\s+horse|idw|boom!?(?:\s+studios)?|valiant|archie|dynamite|aftershock|oni(?:\s+press)?)\s+/i;
// Listings often put the publisher in front of the series name ("Marvel X-Factor"); CGC titles never do.
const cleanSeries = (s: string) => s.replace(/\(\s*\d{4}\s*\)/g, "").replace(/\s+/g, " ").trim().replace(PUBLISHER_PREFIX, "");
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

  // Chunked: the API returns at most 1000 rows per call, and silent truncation would read as "not found".
  const db = createAdminServerClient();
  const all = [...distinct.values()];
  const chunks: typeof all[] = [];
  for (let i = 0; i < all.length; i += 40) chunks.push(all.slice(i, i + 40));
  const parts = await Promise.all(chunks.map(async (c) => {
    const { data, error } = await db.rpc("sniper_census_batch", { p_keys: c });
    if (error) throw new Error(`sniper_census_batch failed: ${error.message}`);
    if ((data?.length ?? 0) >= 1000) throw new Error("sniper_census_batch hit the 1000-row cap; shrink the chunk");
    return (data ?? []) as PopRow[];
  }));

  const byKey = new Map<string, PopRow[]>();
  for (const r of parts.flat()) {
    const list = byKey.get(r.k) ?? [];
    list.push(r);
    byKey.set(r.k, list);
  }

  for (const q of valid) {
    const rows = byKey.get(pairKey(q)) ?? [];
    // Pick the CGC volume without guessing:
    //  - several volumes: the one whose year is within 1 of the listing year (cover date vs on-sale date); none = not found
    //  - exactly one volume exists for this title+issue: that is the comic (listing year, if given, must be within 1)
    //  - several volumes and no listing year: not found
    let row: PopRow | undefined;
    if (rows.length === 1) row = !q.year || (rows[0].year != null && Math.abs(rows[0].year - q.year) <= 1) ? rows[0] : undefined;
    else if (q.year) {
      const near = rows.filter((r) => r.year != null && Math.abs(r.year - q.year!) <= 1);
      row = near.find((r) => r.year === q.year) ?? (near.length === 1 ? near[0] : undefined);
    }
    if (row) result.set(q.key, build(row, q.iss, q.grade));
  }
  return result;
}

export interface LabelCensusQuery {
  key: string;
  title: string;
  issue: string;
  /** Cover date exactly as printed on the label, e.g. "5/86". */
  date: string;
  publisher?: string | null;
  /** Edition line printed on the label; null/empty = base edition. */
  edition?: string | null;
  grade?: number | null;
}

const alnum = (s: string | null | undefined) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");

/**
 * Census keyed on the slab label itself: title + issue + cover date (+ publisher) pick the CGC issue and the label's
 * edition line picks the edition row (no edition = the base row). No year tolerance and no fallback to the base row
 * for an edition: if CGC has no row that equals what the label says, the book is "not found".
 */
export async function lookupLabelCensusBatch(queries: LabelCensusQuery[]): Promise<Map<string, GradeCensus>> {
  const result = new Map<string, GradeCensus>();
  const valid = queries.map((q) => ({ ...q, t: cleanSeries(q.title), i: cleanIssue(q.issue), d: q.date.trim() })).filter((q) => q.t && q.i && q.d);
  if (valid.length === 0) return result;
  const pairKey = (q: { t: string; i: string; d: string }) => `${q.t.toLowerCase()}|${q.i.toLowerCase()}|${q.d}`;
  const distinct = new Map<string, { k: string; title: string; issue: string; date: string }>();
  for (const q of valid) if (!distinct.has(pairKey(q))) distinct.set(pairKey(q), { k: pairKey(q), title: q.t, issue: q.i, date: q.d });

  const db = createAdminServerClient();
  const all = [...distinct.values()];
  const chunks: typeof all[] = [];
  for (let i = 0; i < all.length; i += 25) chunks.push(all.slice(i, i + 25));
  const parts = await Promise.all(chunks.map(async (c) => {
    const { data, error } = await db.rpc("sniper_census_label", { p_keys: c });
    if (error) throw new Error(`sniper_census_label failed: ${error.message}`);
    if ((data?.length ?? 0) >= 1000) throw new Error("sniper_census_label hit the 1000-row cap; shrink the chunk");
    return (data ?? []) as Array<PopRow & { variant: string | null; publisher: string | null }>;
  }));
  const byKey = new Map<string, Array<PopRow & { variant: string | null; publisher: string | null }>>();
  for (const r of parts.flat()) byKey.set(r.k, [...(byKey.get(r.k) ?? []), r]);

  for (const q of valid) {
    let rows = byKey.get(pairKey(q)) ?? [];
    const ed = alnum(q.edition);
    rows = ed ? rows.filter((r) => alnum(r.variant) === ed) : rows.filter((r) => r.variant == null);
    if (rows.length > 1 && q.publisher) {
      const pub = alnum(q.publisher);
      const byPub = rows.filter((r) => alnum(r.publisher) === pub);
      if (byPub.length) rows = byPub;
    }
    if (rows.length === 1) result.set(q.key, build(rows[0], q.i, q.grade));
  }
  return result;
}
