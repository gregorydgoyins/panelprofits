import { createAdminServerClient } from "@/lib/supabase/admin";
import { seriesKey, type SaleObs } from "./candles";

/** Direct transaction-ledger read for the selected issue, never a guide estimate. */
export async function readStoredCompletedSales(series: string, issue: string, grader?: string | null): Promise<SaleObs[]> {
  let query = createAdminServerClient().from("sniper_sales")
    .select("item_id,sold_at,price_usd,grade,grader,venue,source,url")
    .eq("series_key", seriesKey(series, issue)).eq("confirmed", true)
    .gt("price_usd", 0).order("sold_at", { ascending: true }).limit(5000);
  if (grader) query = query.eq("grader", grader);
  const register = async (): Promise<SaleObs[]> => {
    const db = createAdminServerClient();
    const company = grader ? await db.from("grading_companies").select("id").eq("name",grader).maybeSingle() : null;
    if (grader && !company?.data) return [];
    let rows = db.from("graded_sales_observations").select("sale_date,sale_price,grade_numeric,venue,evidence_path,currency,edition_name,has_restoration,has_signature")
      .ilike("title_name",series.replace(/[%_]/g," ")).eq("issue_number_raw",String(issue).replace(/^#/,""))
      .eq("currency","USD").gt("sale_price",0).not("sale_date","is",null);
    if (company?.data) rows=rows.eq("grading_company_id",company.data.id);
    const {data,error}=await rows.limit(5000);
    if (error) return [];
    return (data || []).filter(row=>!row.has_restoration && !row.has_signature && (!row.edition_name || /^(?:standard|regular|base|first printing)$/i.test(row.edition_name)))
      .map(row=>({date:String(row.sale_date),price:Number(row.sale_price),grade:row.grade_numeric==null?null:Number(row.grade_numeric),venue:row.venue || "Graded sales register",source:"graded_sales_observations",confirmed:true,url:row.evidence_path || undefined}));
  };
  const [{ data, error }, registered] = await Promise.all([query,register()]);
  if (error) throw new Error("Stored completed-sale ledger could not be read");
  const recorded = (data || []).map(row => ({itemId:row.item_id || undefined,date:row.sold_at,price:Number(row.price_usd),grade:row.grade == null ? null : Number(row.grade),venue:row.venue,source:row.source,confirmed:true,url:row.url || undefined}));
  return [...recorded,...registered];
}
