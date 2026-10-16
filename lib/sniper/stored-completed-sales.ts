import { createAdminServerClient } from "@/lib/supabase/admin";
import { seriesKey, type SaleObs } from "./candles";

/** Direct transaction-ledger read for the selected issue, never a guide estimate. */
export async function readStoredCompletedSales(series: string, issue: string, grader?: string | null): Promise<SaleObs[]> {
  let query = createAdminServerClient().from("sniper_sales")
    .select("item_id,sold_at,price_usd,grade,grader,venue,source,url")
    .eq("series_key", seriesKey(series, issue)).eq("confirmed", true)
    .gt("price_usd", 0).order("sold_at", { ascending: true }).limit(5000);
  if (grader) query = query.eq("grader", grader);
  const { data, error } = await query.abortSignal(AbortSignal.timeout(8000));
  if (error) throw new Error("Stored completed-sale ledger could not be read");
  const recorded = (data || []).map(row => ({itemId:row.item_id || undefined,date:row.sold_at,price:Number(row.price_usd),grade:row.grade == null ? null : Number(row.grade),venue:row.venue,source:row.source,confirmed:true,url:row.url || undefined}));
  return recorded;
}
