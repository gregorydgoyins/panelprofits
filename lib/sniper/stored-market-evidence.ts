import { createAdminServerClient } from "@/lib/supabase/admin";

export interface StoredPrice { grade: string; amount: number; source: string; url: string; currency?: string; observedAt?: string; kind?: string; basis?: string; publicationDate?: string }
const norm = (s: string | null) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
/** A missing date can be resolved only when the stored title/issue has one publication year. */
export async function resolveStoredPublicationYear(series: string, issue: string): Promise<number | null> {
  const { data, error } = await createAdminServerClient().from("ppcf_fast_wiki_read_model").select("publication_date")
    .eq("series_name", series).eq("issue_number", issue).limit(1000);
  if (error) throw new Error("Publication crosswalk lookup failed");
  if (!data?.length || data.length >= 1000) return null;
  const parsed = data.map(row => row.publication_date?.match(/\b(?:18|19|20)\d{2}\b/)?.[0]);
  if (parsed.some(year => !year)) return null;
  const years = new Set(parsed);
  return years.size === 1 ? Number([...years][0]) : null;
}
export function exactStoredEdition(rows: Array<{ ppcf_id: string; variant_name: string | null; publication_date: string | null }>, year: number, edition: string | null) {
  if (rows.length >= 100) return null;
  const matches = rows.filter(r => r.publication_date?.match(/\b(?:18|19|20)\d{2}\b/)?.[0] === String(year) &&
    (norm(r.variant_name) === norm(edition) || (!edition && /^cover a\s*[-–:]/i.test(r.variant_name || "") && !/printing|reprint|facsimile/i.test(r.variant_name || ""))));
  return matches.length === 1 ? matches[0] : null;
}

/** Read every recorded provider separately. Never turn cover price/cost/quotes into a market value. */
export async function readStoredMarketEvidence(series: string, issue: string, year: number, edition: string | null) {
  const db = createAdminServerClient();
  const { data, error } = await db.from("ppcf_fast_wiki_read_model").select("ppcf_id,variant_name,publication_date")
    .eq("series_name", series).eq("issue_number", issue).ilike("publication_date", `%${year}%`).limit(100);
  if (error) throw new Error("Comic crosswalk lookup failed");
  const match = exactStoredEdition(data || [], year, edition);
  if (!match) return { ppcfId: null, prices: [] as StoredPrice[] };
  const { data: observations, error: priceError } = await db.from("ppcf_price_observations")
    .select("grade_label,amount,source_system,source_locator,observed_at,currency,price_field")
    .eq("ppcf_id", match.ppcf_id).gt("amount", 0).order("observed_at", { ascending: false }).order("id").limit(1000);
  if (priceError) throw new Error("Crosswalk price lookup failed");
  const rawPublication = match.publication_date || "";
  const publicationDate = /^(?:\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})$/.test(rawPublication) && Number.isFinite(Date.parse(rawPublication)) ? new Date(rawPublication).toISOString().slice(0,10) : undefined;
  const seen = new Set<string>();
  const prices: StoredPrice[] = [];
  for (const o of observations || []) {
    if (/cover price|cost|paid|buy|sell|bid|ask|value year/i.test(o.price_field || "")) continue;
    const grade = o.source_system === "COMICBASE" && o.price_field === "Price" ? "9.8" : String(o.grade_label || "");
    if (!/^(?:RAW|[0-9]\.[0-9]|10\.0)$/i.test(grade)) continue;
    const key = `${o.source_system}|${grade}|${o.currency}|${o.price_field}`;
    if (seen.has(key)) continue;
    seen.add(key);
    prices.push({ grade, amount: Number(o.amount), currency: o.currency || "USD", source: `${o.source_system} · ${o.price_field}`,
      url: /^https?:\/\//i.test(o.source_locator || "") ? o.source_locator : `/wiki/${match.ppcf_id}`,
      observedAt: o.source_system === "COMICBASE" ? undefined : o.observed_at,
      publicationDate: publicationDate,
      basis: o.source_system === "COMICBASE" ? `ComicBase catalog reference; source condition ${o.grade_label || "unspecified"}. Not a CGC completed sale.` : "Stored guide estimate, not a completed sale",
      kind: "guide" });
  }
  return { ppcfId: match.ppcf_id, prices };
}
