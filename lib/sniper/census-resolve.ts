import { parseAndFilterListing } from "./anti-bullshit";
import { cachedBatch } from "./lookup-cache";
import {
  lookupGradeCensusBatch, lookupLabelCensusBatch, lookupPsaCensusBatch,
  type CensusQuery, type GradeCensus, type LabelCensusQuery, type PsaCensusQuery,
} from "./census-population";
import type { RawAuctionListing } from "./types";

const VARIANT_LISTING = /\b(variants?|virgin|incentive|ratio|retailer|exclusive|convention|foil|sketch|blank|newsstand|reprint|[2-9](?:nd|rd|th)\s+print(?:ing)?|(?:second|third|fourth|fifth)\s+print(?:ing)?|cover\s+[b-z]\b|\bcvr\s*[b-z]\b|wp\s*-|trade\s+dress|lenticular|holo|chromium|jetpack|midtown|kickstarter|artgerm|dynamic\s+forces|edition)\b/i;

const CENSUS_TTL = 30 * 60_000;
const idOf = (q: object) => JSON.stringify({ ...q, key: undefined });

/**
 * Exact census for each listing: slab label (title + issue + cover date + edition) when read, else the parsed title.
 * CGC slabs use the CGC census, PSA slabs use the PSA census; other graders have no census loaded (not found).
 * Returns a map keyed by the item's position in `items`.
 */
export async function resolveCensus(items: RawAuctionListing[]): Promise<Map<number, GradeCensus>> {
  const censusQueries: CensusQuery[] = [];
  const labelQueries: LabelCensusQuery[] = [];
  const psaQueries: PsaCensusQuery[] = [];
  items.forEach((item, idx) => {
    const lb = item.label;
    if (lb?.grader === "PSA" && lb.title && lb.issueNumber) {
      const yr = lb.issueDate ? parseInt(lb.issueDate.split("/").pop() || "", 10) : NaN;
      const fullYear = Number.isFinite(yr) ? (yr < 100 ? (yr > 30 ? 1900 + yr : 2000 + yr) : yr) : null;
      psaQueries.push({ key: String(idx), title: lb.title, issue: lb.issueNumber, year: fullYear, publisher: lb.publisher, edition: lb.edition, grade: lb.grade ?? item.resolvedGrade ?? null });
      return;
    }
    if (lb?.grader && lb.grader !== "CGC") return;
    if (lb?.title && lb.issueNumber && lb.issueDate) {
      labelQueries.push({ key: String(idx), title: lb.title, issue: lb.issueNumber, date: lb.issueDate, publisher: lb.publisher, edition: lb.edition, grade: lb.grade ?? item.resolvedGrade ?? null });
      return;
    }
    const p = parseAndFilterListing(String(item.title || ""));
    if (!p.extractedSeries || p.extractedSeries === "Unknown Series" || !p.extractedIssue) return;
    if (p.gradingCompany && p.gradingCompany !== "CGC") return;
    // A variant/printing is its own CGC census row; never show the base issue's census for one.
    if (VARIANT_LISTING.test(String(item.title || "")) || /^\d+[A-Za-z]$/.test(String(p.extractedIssue))) return;
    censusQueries.push({ key: String(idx), series: p.extractedSeries, issue: p.extractedIssue, grade: item.resolvedGrade ?? p.grade ?? null, year: p.extractedYear ?? item.year ?? null });
  });
  const out = new Map<number, GradeCensus>();
  const settled = await Promise.allSettled([
    cachedBatch("census-title", CENSUS_TTL, censusQueries, idOf, lookupGradeCensusBatch),
    cachedBatch("census-label", CENSUS_TTL, labelQueries, idOf, lookupLabelCensusBatch),
    cachedBatch("census-psa", CENSUS_TTL, psaQueries, idOf, lookupPsaCensusBatch),
  ]);
  let failed = false;
  for (const r of settled) {
    if (r.status === "fulfilled") for (const [k, v] of r.value) out.set(Number(k), v);
    else { failed = true; console.error("Sniper census lookup failed:", r.reason); }
  }
  if (failed) throw new Error("census lookup failed"); // never store a result computed from a failed lookup
  return out;
}

/** Resolve and store census for listings whose label has been read (or attempted) and that have no stored answer yet. */
export async function captureCensus(db: any, limit = 300): Promise<{ stored: number }> {
  const { data } = await db
    .from("sniper_listings")
    .select("item_id,payload,label")
    .eq("status", "live")
    .is("census_at", null)
    .not("label_at", "is", null)
    .limit(limit);
  const rows: Array<{ item_id: string; payload: RawAuctionListing; label: any }> = data ?? [];
  if (!rows.length) return { stored: 0 };
  const items = rows.map((r) => ({ ...(r.payload as RawAuctionListing), label: r.label ?? null }));
  const found = await resolveCensus(items);
  const now = new Date().toISOString();
  let stored = 0, i = 0;
  const worker = async () => {
    while (i < rows.length) {
      const k = i++;
      const { error } = await db.from("sniper_listings").update({ census: found.get(k) ?? null, census_at: now }).eq("item_id", rows[k].item_id);
      if (!error) stored++;
    }
  };
  await Promise.all(Array.from({ length: 8 }, worker));
  return { stored };
}
