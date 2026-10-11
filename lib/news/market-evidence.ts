import { createAdminServerClient } from "@/lib/supabase/admin";
import { keyTerms, splitKey } from "./catalyst";

/**
 * Real evidence behind a news story's affected books. Server only.
 * Every field is a value a source published, labelled by source. PP, ComicBase, GoCollect and
 * (later) eBay are never blended or averaged. A missing source is null, never estimated.
 */

export interface BookEvidence {
  key: string; // "Series #N" as asked
  found: boolean;
  matched?: { series: string; issueNumber: string; year: number | null; comicsId: string };
  /** Panel Profits grade ladder. 9.8 when published, else the highest published grade. */
  pp: { grade: string; usd: number } | null;
  /** ComicBase: current value plus its published annual values. */
  comicbase: {
    now: number | null;
    annual: Array<{ year: number; usd: number }>;
    /** Latest published year-over-year move between two consecutive published ComicBase years. */
    yoy: { fromYear: number; toYear: number; pct: number } | null;
  } | null;
  /** GoCollect fair-market values as published, when present. */
  gocollect: Record<string, number> | null;
  /** eBay sold data: separate future source. No table exists yet. */
  ebay: null;
  /** CGC census total for the book, when known. */
  census: number | null;
  /** Mentions of this key in the news wire: last 48h vs the per-day average of the prior 28 days. */
  newsPressure: { last48h: number; baselinePerDay: number; sample: number } | null;
}

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

const PP_ORDER = ["9.8", "9.4", "9.2", "8.0", "6.0", "4.0", "RAW"];

function pickPp(ladder: Record<string, unknown> | null): BookEvidence["pp"] {
  if (!ladder) return null;
  for (const g of PP_ORDER) {
    const n = num(ladder[g]);
    if (n !== null && n > 0) return { grade: g, usd: n };
  }
  for (const [g, v] of Object.entries(ladder)) {
    const n = num(v);
    if (n !== null && n > 0) return { grade: g, usd: n };
  }
  return null;
}

function cbBlock(cbPrice: unknown, cbValues: Record<string, unknown> | null): BookEvidence["comicbase"] {
  const now = num(cbPrice);
  const annual: Array<{ year: number; usd: number }> = [];
  for (const [y, v] of Object.entries(cbValues || {})) {
    const year = Number(y);
    const usd = num(v);
    if (Number.isFinite(year) && usd !== null && usd > 0) annual.push({ year, usd });
  }
  annual.sort((a, b) => a.year - b.year);
  if (now === null && annual.length === 0) return null;
  let yoy: NonNullable<BookEvidence["comicbase"]>["yoy"] = null;
  for (let i = annual.length - 1; i > 0; i--) {
    if (annual[i].year - annual[i - 1].year === 1) {
      yoy = { fromYear: annual[i - 1].year, toYear: annual[i].year, pct: (annual[i].usd / annual[i - 1].usd - 1) * 100 };
      break;
    }
  }
  return { now: now !== null && now > 0 ? now : null, annual, yoy };
}

async function newsPressure(title: string): Promise<BookEvidence["newsPressure"]> {
  const db = createAdminServerClient();
  const terms = keyTerms(title).filter((t) => t.length >= 4).slice(0, 6);
  if (terms.length === 0) return null;
  const orClause = terms.map((t) => `headline.ilike.%${t.replace(/[,()%]/g, " ")}%`).join(",");
  const now = Date.now();
  const iso = (ms: number) => new Date(now - ms).toISOString();
  const DAY = 86_400_000;
  const [recent, prior] = await Promise.all([
    db.from("pp_news_stories").select("id", { count: "exact", head: true }).or(orClause).gte("published_at", iso(2 * DAY)),
    db.from("pp_news_stories").select("id", { count: "exact", head: true }).or(orClause).gte("published_at", iso(30 * DAY)).lt("published_at", iso(2 * DAY)),
  ]);
  if (recent.error || prior.error) return null;
  const sample = prior.count ?? 0;
  // Too few prior mentions to call a baseline: say nothing rather than a noisy ratio.
  if (sample < 5) return null;
  return { last48h: recent.count ?? 0, baselinePerDay: sample / 28, sample };
}

export async function getBookEvidence(titles: string[]): Promise<BookEvidence[]> {
  const db = createAdminServerClient();
  return Promise.all(
    titles.slice(0, 6).map(async (title): Promise<BookEvidence> => {
      const empty: BookEvidence = { key: title, found: false, pp: null, comicbase: null, gocollect: null, ebay: null, census: null, newsPressure: null };
      const { series, issue } = splitKey(title);
      const bare = series.replace(/^the\s+/i, "");
      const [rpc, pressure] = await Promise.all([
        db.rpc("news_book_evidence", { p_series: bare, p_issue: issue }),
        newsPressure(title).catch(() => null),
      ]);
      const rows = (rpc.data || []) as Array<{
        comics_id: string; series: string; issue_number: string; year: number | null;
        pp_ladder: Record<string, unknown> | null; cb_price: unknown; cb_values: Record<string, unknown> | null;
        gc_prices: Record<string, unknown> | null; cgc_total: number | null;
      }>;
      const row = rows[0];
      if (!row) return { ...empty, newsPressure: pressure };
      const gc: Record<string, number> = {};
      for (const [g, v] of Object.entries(row.gc_prices || {})) {
        const n = num(v);
        if (n !== null && n > 0) gc[g] = n;
      }
      return {
        key: title,
        found: true,
        matched: { series: row.series, issueNumber: row.issue_number, year: row.year, comicsId: row.comics_id },
        pp: pickPp(row.pp_ladder),
        comicbase: cbBlock(row.cb_price, row.cb_values),
        gocollect: Object.keys(gc).length ? gc : null,
        ebay: null,
        census: row.cgc_total ?? null,
        newsPressure: pressure,
      };
    })
  );
}
