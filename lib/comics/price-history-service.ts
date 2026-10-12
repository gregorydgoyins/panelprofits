import { resolveMarketPricing } from "../pricing/market-pricing-resolver";

let cbDbInstance: any = null;
let cbDbChecked = false;
function getCbDb(): any | null {
  if (typeof window !== "undefined") return null;
  if (cbDbChecked) return cbDbInstance;
  cbDbChecked = true;
  try {
    const req = eval("require");
    const fs = req("fs");
    const path = req("path");
    const { DatabaseSync } = req("node:sqlite");
    const p = path.resolve(process.cwd(), "data", "comicbase.sqlite");
    if (fs.existsSync(p)) {
      cbDbInstance = new DatabaseSync(p, { readOnly: true });
    }
  } catch {}
  return cbDbInstance;
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
 * Recorded certified sales for one book (stored CGC / GPA records). Nothing is derived: no guide values scaled to a grade,
 * no point for "today", no flat line. Returns an empty list when there are no recorded sales.
 */
export function lookupMultiPointPriceHistory(
  series: string,
  issueNumber: string | number,
  targetGrade = 9.8,
  currentFmv?: number
): HistoricalPriceObservation[] {
  const cleanSeries = String(series || "")
    .toLowerCase()
    .replace(/^the\s+/, "")
    .replace(/,\s*the$/, "")
    .replace(/\s*[\(\[].*?[\)\]]/g, "")
    .trim();
  const cleanIssue = String(issueNumber || "1").replace(/^#/, "").trim();

  const points: HistoricalPriceObservation[] = [];
  const seenDates = new Set<string>();

  // 2. Ingest PriceCharting & CGC authentic observations
  try {
    const market = resolveMarketPricing(series, cleanIssue, currentFmv || 0);
    if (market.cgcSales && market.cgcSales.length > 0) {
      for (const sale of market.cgcSales) {
        if (sale && sale.amount > 0 && sale.observedAt) {
          const dt = sale.observedAt.slice(0, 10);
          points.push({
            date: dt,
            grade: parseFloat(sale.grade) || targetGrade,
            price: sale.amount,
            venue: `${sale.authority || "CGC"} Realized Sale`,
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
  const cleanPoints = Array.from(byDate.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  return cleanPoints;
}
