import type { StoredPrice } from "./research-types";
export type { StoredPrice } from "./research-types";
export interface EditionRow { ppcf_id: string; series_name?: string; variant_name: string | null; publication_date: string | null }
export interface PriceObservation { ppcf_id: string; grade_label: string | null; amount: number | string; source_system: string; source_locator: string | null; observed_at: string | null; currency: string | null; price_field: string; source_record_id?: string }
const norm = (s: string | null) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
export function exactStoredEdition(rows: EditionRow[], year: number, edition: string | null) {
  if (rows.length >= 100) return null;
  const matches = rows.filter(r => r.publication_date?.match(/\b(?:18|19|20)\d{2}\b/)?.[0] === String(year) &&
    (norm(r.variant_name) === norm(edition) || (!edition && /^cover a\s*[-–:]/i.test(r.variant_name || "") && !/printing|reprint|facsimile/i.test(r.variant_name || ""))));
  return matches.length === 1 ? matches[0] : null;
}
/** Format actual observations. Publication dates are never price observation dates. */
export function storedPrices(observations: PriceObservation[], match: EditionRow | null): StoredPrice[] {
  if (!match) return [];
  const rawDate=match.publication_date || "";
  const parts=rawDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const iso=parts?`${parts[3]}-${parts[1].padStart(2,"0")}-${parts[2].padStart(2,"0")}`:rawDate;
  const publicationDate=/^\d{4}-\d{2}-\d{2}$/.test(iso) && Number.isFinite(Date.parse(`${iso}T00:00:00Z`))?iso:undefined;
  const seen=new Set<string>();
  const result:StoredPrice[]=[];
  for (const row of observations) {
    if(row.ppcf_id!==match.ppcf_id || /cover price|cost|paid|buy|sell|bid|ask|value year/i.test(row.price_field)) continue;
    const sourceGrade=String(row.grade_label || "");
    const grade=/^(RAW|UNGRADED)$/i.test(sourceGrade)?"RAW":sourceGrade.replace("_", ".");
    if(!/^(?:RAW|[0-9]\.[0-9]|10\.0)$/i.test(grade) || !(Number(row.amount)>0)) continue;
    const key=`${row.source_system}|${row.source_record_id}|${grade}|${row.currency}|${row.price_field}`;
    if(seen.has(key)) continue;
    seen.add(key);
    const catalog=row.source_system==="COMICBASE";
    const pc=/pricecharting/i.test(row.price_field) || /pricecharting\.com/i.test(row.source_locator || "");
    result.push({grade,amount:Number(row.amount),currency:row.currency || "USD",source:pc?"PriceCharting · guide":catalog?"ComicBase · catalog reference":`${row.source_system} · ${row.price_field}`,
      url:/^https?:\/\//i.test(row.source_locator || "")?row.source_locator!:`/wiki/${match.ppcf_id}`,
      observedAt:catalog?undefined:row.observed_at || undefined,publicationDate,kind:catalog?"catalog":"guide",
      basis:catalog?`ComicBase catalog reference; source condition ${grade}. Not a CGC completed sale.`:"Grade-specific guide estimate, not a completed sale"});
  }
  return result;
}
