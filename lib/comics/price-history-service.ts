import benchmarksData from "../pricing/pricecharting-cgc-benchmarks.json";
import { seriesKey } from "../sniper/candles";

let benchmarkIndex: Map<string, any> | null = null;
function getBenchmarkEntry(series: string, issue: string): any | null {
  const cleanIssue = String(issue).replace(/^#/, "").trim();
  const candidates = [series, `The ${series}`, series.replace(/^the\s+/i, "")];
  for (const cand of candidates) {
    const hit = (benchmarksData as Record<string, any>)[`${cand} #${cleanIssue}`];
    if (hit) return hit;
  }
  if (!benchmarkIndex) {
    benchmarkIndex = new Map<string, any>();
    for (const [k, v] of Object.entries(benchmarksData as Record<string, any>)) {
      if (!v) continue;
      const key = seriesKey(v.series || k.split(" #")[0], v.issueNumber || k.split(" #")[1] || "1");
      if (key && !benchmarkIndex.has(key)) benchmarkIndex.set(key, v);
    }
  }
  return benchmarkIndex.get(seriesKey(series, cleanIssue)) ?? null;
}

export interface HistoricalPriceObservation {
  date: string;
  grade: number;
  price: number;
  venue: string;
  title?: string;
  url?: string;
}

/**
 * Recorded certified sales for one book at the target grade. Nothing is derived:
 * no guide values, no derived FMV rows, no point for "today", no flat line.
 * Returns an empty list when there are no recorded sales at that grade.
 */
export function lookupMultiPointPriceHistory(
  series: string,
  issueNumber: string | number,
  targetGrade = 9.8,
  _currentFmv?: number
): HistoricalPriceObservation[] {
  const cleanIssue = String(issueNumber || "1").replace(/^#/, "").trim();
  const points: HistoricalPriceObservation[] = [];

  try {
    const entry = getBenchmarkEntry(String(series || ""), cleanIssue);
    if (entry) {
      const derivedDates = new Set(
        (entry.allObservations ?? [])
          .filter((o: any) => o.type === "PRICECHARTING_GUIDE_OBSERVATION" || o.type === "PANEL_PROFITS_DERIVED_FMV")
          .map((o: any) => o.date)
      );
      for (const o of entry.allObservations ?? []) {
        if (o.type === "PRICECHARTING_GUIDE_OBSERVATION" || o.type === "PANEL_PROFITS_DERIVED_FMV") continue;
        const amt = Number(o.amount);
        const dt = o.date || o.observedAt;
        const g = parseFloat(String(o.grade ?? "").replace(/[^0-9.]/g, ""));
        if (amt > 0 && dt && Number.isFinite(g) && Math.abs(g - targetGrade) < 0.05) {
          points.push({
            date: String(dt).slice(0, 10),
            grade: g,
            price: amt,
            venue: `${o.authority || "CGC"} Realized Sale`,
          });
        }
      }
      for (const sale of entry.cgc ?? []) {
        const dt = sale.observedAt || sale.date;
        if (dt && derivedDates.has(dt)) continue;
        const amt = Number(sale.amount);
        const g = parseFloat(String(sale.grade ?? "").replace(/[^0-9.]/g, ""));
        if (amt > 0 && dt && Number.isFinite(g) && Math.abs(g - targetGrade) < 0.05) {
          points.push({
            date: String(dt).slice(0, 10),
            grade: g,
            price: amt,
            venue: `${sale.venue || sale.authority || "CGC"} Realized Sale`,
          });
        }
      }
    }
  } catch {}

  // Deduplicate by date and ensure strictly valid YYYY-MM-DD timestamps
  const byDate = new Map<string, HistoricalPriceObservation>();
  for (const pt of points) {
    if (!pt.date || !/^\d{4}-\d{2}-\d{2}$/.test(pt.date) || pt.price <= 0) continue;
    byDate.set(pt.date, pt);
  }
  return Array.from(byDate.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}
