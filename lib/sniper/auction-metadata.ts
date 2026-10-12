import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { parseAndFilterListing } from "@/lib/sniper/anti-bullshit";
import { resolveAuthoritativePublisher } from "@/lib/comics/publisher-authority";
import { dedupeSales, saleStats, seriesKey, type SaleObs } from "@/lib/sniper/candles";
import benchmarksData from "@/lib/pricing/pricecharting-cgc-benchmarks.json";

const requireModule = createRequire(import.meta.url);

export const gradeNum = (g: unknown): number | null => {
  const n = parseFloat(String(g ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
};

export function benchmarkSalesForBook(series: string, issue: string): SaleObs[] {
  const out: SaleObs[] = [];
  if (!series || series === "Unknown Series") return out;
  const cleanIssue = String(issue).replace(/^#/, "").trim();
  const candidates = [series, `The ${series}`, series.replace(/^the\s+/i, "")];
  let entry: any = null;
  for (const cand of candidates) {
    entry = (benchmarksData as Record<string, any>)[`${cand} #${cleanIssue}`];
    if (entry) break;
  }
  if (!entry) {
    const targetKey = seriesKey(series, cleanIssue);
    for (const [k, v] of Object.entries(benchmarksData as Record<string, any>)) {
      if (v && seriesKey(v.series || k.split(" #")[0], v.issueNumber || cleanIssue) === targetKey) {
        entry = v;
        break;
      }
    }
  }
  if (!entry) return out;
  for (const o of entry.allObservations ?? []) {
    const amt = Number(o.amount);
    const dt = o.date || o.observedAt;
    if (amt > 0 && dt) {
      out.push({
        date: String(dt).slice(0, 10),
        price: amt,
        grade: gradeNum(o.grade),
        venue: o.authority || o.type || "benchmark",
        source: `benchmark:${o.type ?? "obs"}`,
        confirmed: /sale|cgc|heritage|gpa/i.test(`${o.type} ${o.authority}`),
      });
    }
  }
  for (const o of entry.cgc ?? []) {
    const amt = Number(o.amount);
    const dt = o.observedAt || o.date;
    if (amt > 0 && dt) {
      out.push({
        date: String(dt).slice(0, 10),
        price: amt,
        grade: gradeNum(o.grade),
        venue: o.venue || o.authority || "CGC",
        source: "benchmark:cgc",
        confirmed: true,
      });
    }
  }
  return out;
}

let ppDbInstance: any = null;
let ppDbChecked = false;
function getPpDb(): any | null {
  if (ppDbChecked) return ppDbInstance;
  ppDbChecked = true;
  const p = path.resolve(process.cwd(), "data", "pp115k.sqlite");
  if (fs.existsSync(p)) {
    try {
      const { DatabaseSync } = requireModule("node:sqlite");
      ppDbInstance = new DatabaseSync(p, { readOnly: true });
    } catch {}
  }
  return ppDbInstance;
}

let cbDbInstance: any = null;
let cbDbChecked = false;
function getCbDb(): any | null {
  if (cbDbChecked) return cbDbInstance;
  cbDbChecked = true;
  const p = path.resolve(process.cwd(), "data", "comicbase.sqlite");
  if (fs.existsSync(p)) {
    try {
      const { DatabaseSync } = requireModule("node:sqlite");
      cbDbInstance = new DatabaseSync(p, { readOnly: true });
    } catch {}
  }
  return cbDbInstance;
}

export function resolveAuctionDbMetadata(
  title: string,
  rawGrade?: number,
  recordedSales?: SaleObs[]
): { fmv: number | null; publisher: string | null } {
  const parsed = parseAndFilterListing(title);
  const series = parsed.extractedSeries?.trim() || "";
  const issue = parsed.extractedIssue?.trim() || "1";
  const cleanSeries = series.toLowerCase();
  const grade = rawGrade ?? parsed.grade ?? null;

  let fmv: number | null = null;
  let publisher: string | null = null;

  // FMV comes strictly from recorded sales at the book's exact grade; otherwise null (unavailable).
  if (series && series !== "Unknown Series" && grade != null) {
    const combinedSales = [
      ...(recordedSales ?? []),
      ...benchmarkSalesForBook(series, issue),
    ];
    const atGrade = dedupeSales(combinedSales).filter((s) => s.grade === grade);
    if (atGrade.length > 0) {
      const stats = saleStats(atGrade);
      fmv = stats.median90d ?? stats.median ?? null;
    }
  }

  const ppDb = getPpDb();
  if (ppDb && series && series !== "Unknown Series") {
    try {
      const candidates = [series, "The " + series, series + ", The"];
      const stmt = ppDb.prepare("SELECT publisher, publication_year FROM verified_equities WHERE series = ? AND issue_number = ? LIMIT 1");
      for (const cand of candidates) {
        const ve = stmt.get(cand, issue) as any;
        if (ve) {
          if (ve.publisher) publisher = resolveAuthoritativePublisher(series, ve.publisher, ve.publication_year);
          break;
        }
      }
    } catch {}
  }

  const cbDb = getCbDb();
  if (cbDb && !publisher && series && series !== "Unknown Series") {
    try {
      const candidates = [cleanSeries, cleanSeries + ", the", "the " + cleanSeries];
      const stmt = cbDb.prepare("SELECT publisher, year FROM comicbase_items WHERE clean_series = ? AND issue_number = ? LIMIT 1");
      for (const cand of candidates) {
        const cb = stmt.get(cand, issue) as any;
        if (cb) {
          if (cb.publisher) {
            publisher = resolveAuthoritativePublisher(series, cb.publisher, cb.year);
          }
          break;
        }
      }
    } catch {}
  }

  if (!publisher && series && series !== "Unknown Series") {
    publisher = resolveAuthoritativePublisher(series, null, parsed.extractedYear);
  }

  return { fmv, publisher };
}
