import { readEbaySalesForBook } from "@/lib/sniper/ebay-sales-view";
import { NextResponse } from "next/server";
import { readStoredCompletedSales } from "@/lib/sniper/stored-completed-sales";
import { buildCandles, dedupeSales, gradesTraded, pickBucket, saleStats, type Bucket } from "@/lib/sniper/candles";

export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

const BUCKETS: Bucket[] = ["day", "week", "month", "quarter", "year"];

/**
 * Candles and volume for one book at one grade, from recorded sales only.
 * GET /api/sniper/candles?series=Amazing Spider-Man&issue=300&grade=9.8[&bucket=month]
 * Returns no candles (and says so) when nothing has been recorded; it never fills a gap.
 */
export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const series = sp.get("series") || "";
  const issue = sp.get("issue") || "";
  if (!series || !issue) return NextResponse.json({ success: false, error: "series and issue required" }, { status: 400 });

  const [recorded, view] = await Promise.all([
    sp.get("editionTerms") ? Promise.resolve([]) : readStoredCompletedSales(series, issue, sp.get("grader")),
    readEbaySalesForBook(series, issue, sp.get("grader"), (sp.get("editionTerms") || "").split("|").filter(term => /^[a-z0-9]{2,40}$/i.test(term)).slice(0, 4)),
  ]);
  const { history: ebay, sales: direct } = view;
  // Closing bids are observations, not completed-sale prices. Keep them out of the sold-sales chart.
  const excludedBidObservations = recorded.filter((s) => !s.confirmed).length;
  const all = dedupeSales([...recorded.filter((s) => s.confirmed), ...direct]);
  const grades = gradesTraded(all);
  const wanted = sp.get("grade") ? parseFloat(sp.get("grade")!) : NaN;
  const grade = Number.isFinite(wanted) ? wanted : grades[0]?.grade ?? null;
  const atGrade = grade == null ? [] : all.filter((s) => s.grade === grade);

  const asked = sp.get("bucket") as Bucket | null;
  const bucket = asked && BUCKETS.includes(asked) ? asked : pickBucket(atGrade);
  const candles = buildCandles(atGrade, bucket);

  const sources: Record<string, number> = {};
  for (const s of atGrade) sources[s.source] = (sources[s.source] ?? 0) + 1;

  return NextResponse.json({
    success: true,
    series, issue, grade, grades, bucket,
    candles,
    volume: candles.map((c) => ({ time: c.time, value: c.volume, dollars: c.dollars })),
    stats: saleStats(atGrade),
    sources,
    sales: [...atGrade].reverse(),
    totalSalesAllGrades: all.length,
    excludedBidObservations,
    ebay: { available: ebay.available, stage: ebay.stage, status: ebay.status, code: ebay.code, message: ebay.message, checkedAt: ebay.checkedAt, provider: ebay.provider, hasMore: ebay.hasMore },
    note: atGrade.length === 0
      ? `No confirmed sales for this book at this grade. ${ebay.available ? `CompSniper returned ${ebay.total} single-unit records, but none matched the selected comic, grader, grade and edition filters. Other records are available in the complete ledger.` : `eBay sold-history access: ${ebay.message}`}`
      : undefined,
  }, { headers: { "cache-control": "no-store" } });
}
