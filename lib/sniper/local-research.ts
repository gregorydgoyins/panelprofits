import { createAdminServerClient } from "@/lib/supabase/admin";
import { readSavedStorySummary, type StorySummary } from "@/lib/comics/story-summary";
import { panelProfitsGrades, type Grade } from "@/lib/pricing/source-ladder";
import type { ComicRecord } from "@/lib/comics/types";
import { resolveCensus } from "./census-resolve";
import type { GradeCensus } from "./census-population";
import type { RawAuctionListing } from "./types";
import { parseAndFilterListing } from "./anti-bullshit";
import { researchTitle } from "./research-title";
import { hydrateStoredGcdStory } from "@/lib/comics/stored-gcd-story";
import { hydrateStoredFandom } from "@/lib/comics/stored-fandom";
import { readStoredMarketEvidence, resolveStoredPublicationYear, type StoredPrice } from "./stored-market-evidence";
import { createHash } from "node:crypto";
import { lookupGoCollectBatch } from "./gocollect-prices";
import { lookupGradeCensusBatch } from "./census-population";

export interface LocalLotResearch {
  story: StorySummary | null;
  census: GradeCensus | null;
  prices: StoredPrice[];
  ppcfId?: string | null;
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
export async function readLocalLotResearch(itemId: string, hydrate = false): Promise<LocalLotResearch | null> {
  const db = createAdminServerClient();
  const { data: row, error } = await db.from("sniper_listings")
    .select("title,series,issue,pub_year,publisher,edition,grade,grader,label,payload,census,census_at").eq("item_id", itemId).maybeSingle();
  if (error) throw new Error("Saved listing lookup failed");
  if (!row) return null;
  const label = row.label as RawAuctionListing["label"];
  const payload = (row.payload || {}) as RawAuctionListing;
  const parsed = parseAndFilterListing(row.title);
  const series = researchTitle(label?.title || row.series || parsed.extractedSeries || "");
  const issue = label?.issueNumber || row.issue || parsed.extractedIssue || "";
  const dateYear = label?.issueDate?.match(/\/(\d{2}|\d{4})$/)?.[1];
  const n = dateYear ? Number(dateYear) : null;
  let year = n == null ? row.pub_year || payload.year || parsed.extractedYear || null : n < 100 ? n + (n > 30 ? 1900 : 2000) : n;
  if (!year && series && issue) year = await resolveStoredPublicationYear(series, issue);
  const publisher = label?.publisher || row.publisher || null;
  const edition = label ? label.edition : row.edition || null;
  // An untranscribed variant cannot be silently treated as the standard edition.
  const editionUnknown = !label?.title && /\bvariant|virgin|exclusive|incentive|newsstand|reprint|second print|third print|cover [b-z]\b/i.test(row.title) && !edition;
  const input = { series, issueNumber: issue, year, publisher };
  const [story, censusMap, priceRows, market] = await Promise.all([
    series && issue && year ? (hydrate ? hydrateStoredFandom(input).then(imported => imported || readSavedStorySummary(input)).then(saved => saved || hydrateStoredGcdStory(input)) : readSavedStorySummary(input)) : Promise.resolve(null),
    row.census ? Promise.resolve(new Map([[0, row.census as GradeCensus]])) : !label?.title && row.grader === "CGC" && !edition && !editionUnknown && year
      ? lookupGradeCensusBatch([{ key: "0", series, issue, year, grade: row.grade ?? parsed.grade }]).then(found => new Map([...found].map(([key, value]) => [Number(key), value])))
      : resolveCensus([{ ...payload, title: row.title, label, year, resolvedGrade: row.grade ?? parsed.grade }]),
    series && issue && year && !editionUnknown ? db.from("comics")
      .select("id,series,issue_number,publication_year,cover_variant,direct_or_variant,printing,pp_grade_9_8_price,panel_profits_data")
      .eq("series", series).eq("issue_number", issue).eq("publication_year", year).limit(50) : Promise.resolve({ data: [], error: null }),
    series && issue && year && !editionUnknown ? readStoredMarketEvidence(series, issue, year, edition) : Promise.resolve({ ppcfId: null, prices: [] }),
  ]);
  if (priceRows.error) throw new Error("Stored price lookup failed");
  const comic = matchingLocalComic((priceRows.data || []) as ComicRecord[], edition);
  const grades = comic ? panelProfitsGrades({ ...comic, panel_profits_data: comic.panel_profits_data || {} }) : {};
  // These are stored guide comparisons, not claimed same-grader realized sales.
  const legacyPrices = Object.entries(grades).filter((entry): entry is [Grade, number] => typeof entry[1] === "number" && entry[1] > 0)
    .map(([grade, amount]) => ({ grade, amount, source: "Stored price guide", url: `/comics/${encodeURIComponent(comic!.id)}` }));
  const prices: StoredPrice[] = [...market.prices, ...legacyPrices];
  if (label?.title && label.issueNumber && !editionUnknown && !edition) {
    const found = await lookupGoCollectBatch([{ key: itemId, title: series, issue, date: label.issueDate, grader: label.grader || row.grader, labelType: label.labelType, grade: label.grade ?? row.grade }]);
    const value = found.get(itemId);
    if (value?.lastSoldPrice && value.lastSoldDate) prices.push({ grade: value.grade, amount: value.lastSoldPrice, source: `GoCollect · ${value.grader} ${value.labelType} last sale`, url: market.ppcfId ? `/wiki/${market.ppcfId}` : "https://gocollect.com/comics", observedAt: value.lastSoldDate, currency: "USD", kind: "sale" });
  }
  const census = censusMap.get(0) || null;
  return { story, census, prices, ppcfId: market.ppcfId, missing: [...(!story ? ["synopsis"] : []), ...(!census ? ["census"] : []), ...(!prices.length ? ["prices"] : [])] };
}

export const lotResearchKey = (itemId: string) => `lot:${createHash("sha256").update(itemId).digest("hex").slice(0, 36)}`;

/** The lot opener reads a prepared snapshot in the existing research cache. */
export async function readSavedLotResearch(itemId: string): Promise<LocalLotResearch | null> {
  const { data, error } = await createAdminServerClient().from("sniper_listing_writeup").select("content").eq("key", lotResearchKey(itemId)).maybeSingle();
  if (error) throw new Error("Saved lot research lookup failed");
  return data?.content as LocalLotResearch | null;
}

/** Audit current lots against the local stores; record completeness in the existing fetch log. */
export async function auditLocalResearch(limit = 30, opts: { generate?: boolean; force?: boolean } = {}) {
  const db = createAdminServerClient();
  const started = Date.now();
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
  const logKey = (id: string) => `local-research:v2:${id}`;
  const due = data.filter(row => opts.force || Date.now() - (checked.get(logKey(row.item_id)) || 0) > 6 * 3600_000)
    .sort((a, b) => (checked.get(logKey(a.item_id)) || 0) - (checked.get(logKey(b.item_id)) || 0)).slice(0, limit);
  const result = { checked: 0, complete: 0, missing: 0, errors: 0, written: 0 };
  for (const row of due) {
    if (Date.now() - started > 175_000) break;
    try {
      const research = await readLocalLotResearch(row.item_id, true);
      if (!research) continue;
      const { error: researchError } = await db.from("sniper_listing_writeup").upsert({ key: lotResearchKey(row.item_id), title: row.item_id, content: research, written_at: new Date().toISOString(), failed_at: null });
      if (researchError) throw researchError;
      let hasWriteup = false;
      if (research.story) {
        const { data: listing, error: listingError } = await db.from("sniper_listings").select("title,series,issue,pub_year,publisher,grader").eq("item_id", row.item_id).single();
        if (listingError) throw listingError;
        const { makeListingWriteup, readCachedWriteup } = await import("./listing-writeup");
        const input = { ...listing, year: listing.pub_year };
        hasWriteup = Boolean((await readCachedWriteup(input)).writeup);
        if (!hasWriteup && opts.generate !== false && await makeListingWriteup(input, research.story)) { result.written++; hasWriteup = true; }
      }
      const missing = [...research.missing, ...(!hasWriteup ? ["writeup"] : [])];
      const { error: saveError } = await db.from("sniper_vendor_fetch").upsert({ key: logKey(row.item_id), fetched_at: new Date().toISOString(), status: missing.length ? `missing:${missing.join(",")}` : "complete", items: 1, sales: 0 });
      if (saveError) throw saveError;
      result.checked++;
      if (missing.length) result.missing++; else result.complete++;
    } catch { result.errors++; }
  }
  return result;
}
