import { createAdminServerClient } from "@/lib/supabase/admin";
import { readSavedStorySummary, type StorySummary } from "@/lib/comics/story-summary";
import { panelProfitsGrades, type Grade } from "@/lib/pricing/source-ladder";
import type { ComicRecord } from "@/lib/comics/types";
import { resolveCensus } from "./census-resolve";
import type { GradeCensus } from "./census-population";
import type { RawAuctionListing } from "./types";
import { parseAndFilterListing } from "./anti-bullshit";
import { researchTitle } from "./research-title";

export interface LocalLotResearch {
  story: StorySummary | null;
  census: GradeCensus | null;
  prices: Array<{ grade: string; amount: number; source: string; url: string }>;
  missing: string[];
}
const normalize = (value: string | null | undefined) => (value || "").toLowerCase().replace(/[^a-z0-9]/g, "");

/** Edition matching is exact. Never choose the highest-priced row or fall back to another year. */
export function matchingLocalComic(rows: ComicRecord[], edition: string | null): ComicRecord | null {
  if (rows.length >= 50) return null;
  const matches = rows.filter(row => normalize(row.cover_variant) === normalize(edition)
    && (!row.printing || /^(?:1|1st|first)$/i.test(row.printing.trim()))
    && (edition || !row.direct_or_variant || /^(?:direct|standard|regular|base)$/i.test(row.direct_or_variant.trim())));
  return matches.length === 1 ? matches[0] : null;
}

/** Reads the existing stores only. No web requests to vendors, no AI calls and no second data store. */
export async function readLocalLotResearch(itemId: string): Promise<LocalLotResearch | null> {
  const db = createAdminServerClient();
  const { data: row, error } = await db.from("sniper_listings")
    .select("title,series,issue,pub_year,publisher,edition,grade,label,payload,census,census_at").eq("item_id", itemId).maybeSingle();
  if (error) throw new Error("Saved listing lookup failed");
  if (!row) return null;
  const label = row.label as RawAuctionListing["label"];
  const payload = row.payload as RawAuctionListing;
  const parsed = parseAndFilterListing(row.title);
  const series = researchTitle(label?.title || row.series || parsed.extractedSeries || "");
  const issue = label?.issueNumber || row.issue || parsed.extractedIssue || "";
  const dateYear = label?.issueDate?.match(/\/(\d{2}|\d{4})$/)?.[1];
  const n = dateYear ? Number(dateYear) : null;
  const year = n == null ? row.pub_year || payload.year || parsed.extractedYear || null : n < 100 ? n + (n > 30 ? 1900 : 2000) : n;
  const publisher = label?.publisher || row.publisher || null;
  const edition = label ? label.edition : row.edition || null;
  // An untranscribed variant cannot be silently treated as the standard edition.
  const editionUnknown = !label && /\bvariant|virgin|exclusive|incentive|newsstand|reprint|second print|third print|cover [b-z]\b/i.test(row.title) && !edition;
  const [story, censusMap, priceRows] = await Promise.all([
    series && issue && year ? readSavedStorySummary({ series, issueNumber: issue, year, publisher }) : Promise.resolve(null),
    row.census ? Promise.resolve(new Map([[0, row.census as GradeCensus]])) : resolveCensus([{ ...payload, title: row.title, label }]),
    series && issue && year && !editionUnknown ? db.from("comics")
      .select("id,series,issue_number,publication_year,cover_variant,direct_or_variant,printing,pp_grade_9_8_price,panel_profits_data")
      .eq("series", series).eq("issue_number", issue).eq("publication_year", year).limit(50) : Promise.resolve({ data: [], error: null }),
  ]);
  if (priceRows.error) throw new Error("Stored price lookup failed");
  const comic = matchingLocalComic((priceRows.data || []) as ComicRecord[], edition);
  const grades = comic ? panelProfitsGrades({ ...comic, panel_profits_data: comic.panel_profits_data || {} }) : {};
  // These are stored guide comparisons, not claimed same-grader realized sales.
  const prices = Object.entries(grades).filter((entry): entry is [Grade, number] => typeof entry[1] === "number" && entry[1] > 0)
    .map(([grade, amount]) => ({ grade, amount, source: "Stored price guide", url: `/comics/${encodeURIComponent(comic!.id)}` }));
  const census = censusMap.get(0) || null;
  return { story, census, prices, missing: [...(!story ? ["synopsis"] : []), ...(!census ? ["census"] : []), ...(!prices.length ? ["prices"] : [])] };
}

/** Audit current lots against the local stores; record completeness in the existing fetch log. */
export async function auditLocalResearch(limit = 30) {
  const db = createAdminServerClient();
  const [data, previous] = await Promise.all([
    (async () => {
      const all: Array<{ item_id: string }> = [];
      for (let offset = 0; ; offset += 1000) {
        const page = await db.from("sniper_listings").select("item_id").eq("status", "live")
          .order("end_time", { ascending: true, nullsFirst: false }).order("item_id").range(offset, offset + 999);
        if (page.error) throw new Error("Local listing audit lookup failed");
        all.push(...(page.data || []));
        if ((page.data?.length || 0) < 1000) return all;
      }
    })(),
    (async () => {
      const all: Array<{ key: string; fetched_at: string }> = [];
      for (let offset = 0; ; offset += 1000) {
        const page = await db.from("sniper_vendor_fetch").select("key,fetched_at").like("key", "local-research:%")
          .order("key").range(offset, offset + 999);
        if (page.error) throw new Error("Local audit history lookup failed");
        all.push(...(page.data || []));
        if ((page.data?.length || 0) < 1000) return all;
      }
    })(),
  ]);
  const checked = new Map(previous.map(row => [row.key, Date.parse(row.fetched_at)]));
  const due = data.filter(row => Date.now() - (checked.get(`local-research:${row.item_id}`) || 0) > 6 * 3600_000)
    .sort((a, b) => (checked.get(`local-research:${a.item_id}`) || 0) - (checked.get(`local-research:${b.item_id}`) || 0)).slice(0, limit);
  const result = { checked: 0, complete: 0, missing: 0, errors: 0 };
  for (const row of due) {
    try {
      const research = await readLocalLotResearch(row.item_id);
      if (!research) continue;
      const { error: saveError } = await db.from("sniper_vendor_fetch").upsert({ key: `local-research:${row.item_id}`, fetched_at: new Date().toISOString(), status: research.missing.length ? `missing:${research.missing.join(",")}` : "complete", items: 1, sales: 0 });
      if (saveError) throw saveError;
      result.checked++;
      if (research.missing.length) result.missing++; else result.complete++;
    } catch { result.errors++; }
  }
  return result;
}
