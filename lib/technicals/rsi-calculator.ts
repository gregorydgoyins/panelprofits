import { getComicById } from "@/lib/comics/queries";
import type { RsiPoint } from "@/components/detail/equity/types";
import { createAdminServerClient } from "@/lib/supabase/admin";
import { buildComicPriceHistory, normalizeGradeLabel } from "@/lib/pricing/historical-chronology";
import { toSaleList, type SaleRow, type SnapshotObservation } from "@/lib/comics/detail-model";
import { dailyLastPoints, rsi14 } from "@/lib/comics/chart-model";

const GRADE_COLS: Array<[string, string]> = [
  ["pp_price_raw", "RAW"], ["pp_price_2_0", "2.0"], ["pp_price_3_0", "3.0"], ["pp_price_4_0", "4.0"], ["pp_price_5_0", "5.0"],
  ["pp_price_6_0", "6.0"], ["pp_price_7_0", "7.0"], ["pp_price_8_0", "8.0"], ["pp_price_9_0", "9.0"], ["pp_price_9_2", "9.2"],
  ["pp_price_9_4", "9.4"], ["pp_price_9_6", "9.6"], ["pp_price_9_8", "9.8"], ["pp_price_10_0", "10.0"],
];

/** Stored dated sales (restored and signed copies excluded) and PriceCharting snapshots for one book. Empty when none. */
async function loadObservations(comic: { series: string; issue_number: string; pp_source_id?: string | null }) {
  const db = createAdminServerClient();
  const sales: SaleRow[] = [];
  const snapshots: SnapshotObservation[] = [];

  if (comic.series && comic.issue_number) {
    try {
      const { data } = await db
        .from("graded_sales_observations")
        .select("sale_price, sale_date, native_grade_text, venue, native_designation")
        .ilike("title_name", comic.series.replace(/[\\%_]/g, (m: string) => `\\${m}`))
        .eq("issue_number_raw", comic.issue_number)
        .not("has_restoration", "is", true)
        .not("has_signature", "is", true)
        .order("sale_date", { ascending: true })
        .limit(200);
      sales.push(...((data ?? []) as SaleRow[]));
    } catch (_) {}
  }

  // The live catalog uses pp_comics.id as pp_price_history.pp_id. Keep the
  // legacy source-id fallback for older records, but never drop the real id.
  const ppId = String((comic as any).pp_source_id || (comic as any).id || "").replace(/^pp-/i, "").trim() || null;
  if (ppId) {
    try {
      const { data } = await db
        .from("pp_price_history")
        .select(["snapshot_date", ...GRADE_COLS.map(([c]) => c)].join(","))
        .eq("pp_id", ppId)
        .not("snapshot_date", "is", null)
        .order("snapshot_date", { ascending: true })
        .limit(400);
      for (const row of (data ?? []) as unknown as Array<Record<string, any>>) {
        for (const [col, grade] of GRADE_COLS) {
          const amount = Number(row[col]);
          if (amount > 0) snapshots.push({ amount, observed_at: row.snapshot_date, grade_label: grade });
        }
      }
    } catch (_) {}
  }
  return { sales, snapshots };
}

/**
 * Wilder RSI(14) of the dated prices on file for one book, using the grade with the most observations
 * (9.8 wins ties). A point exists only once 15 prices are on file. Nothing is filled in before that.
 */
export async function getComicRsiReal(assetId: string): Promise<RsiPoint[]> {
  if (!assetId) return [];
  const comic = await getComicById(assetId);
  if (!comic) return [];

  const { sales, snapshots } = await loadObservations(comic as any);
  const history = buildComicPriceHistory(comic, { dbObservations: snapshots, salesObservations: sales });
  if (history.length === 0) return [];

  const counts = new Map<string, number>();
  for (const h of history) counts.set(h.grade, (counts.get(h.grade) ?? 0) + 1);
  const grade = [...counts.entries()].sort((a, b) => b[1] - a[1] || (a[0] === "9.8" ? -1 : b[0] === "9.8" ? 1 : 0))[0][0];

  const pts = dailyLastPoints(history.filter((h) => h.grade === grade).map((h) => [+new Date(h.observedAt), h.priceUsd] as [number, number]));
  const vals = rsi14(pts.map((p) => p[1]));
  const out: RsiPoint[] = [];
  vals.forEach((v, i) => {
    if (v != null) out.push({ date: new Date(pts[i][0]).toISOString().slice(0, 10), rsi: Math.round(v * 10) / 10, price: pts[i][1] });
  });
  return out;
}

/** A series-wide RSI would mix different books and grades into one price line, so none is produced. */
export async function getSeriesRsi(_seriesName: string): Promise<RsiPoint[]> {
  return [];
}

/** Stored completed sales for this book (restored and signed excluded). No score, no grade defaults. */
export async function getHeritageSales(assetId: string) {
  if (!assetId) return [];
  const comic = await getComicById(assetId);
  if (!comic) return [];
  const { sales } = await loadObservations(comic as any);
  return toSaleList(sales, 200).flatMap((s) => {
    const grade = normalizeGradeLabel(s.grade);
    return grade ? [{ grade, price_usd: s.priceUsd, sold_at: s.date }] : [];
  });
}
