import { readCompletedEbaySales } from "@/lib/sniper/ebay-history";
import { matchCompletedComicSale } from "@/lib/sniper/completed-sale-match";
import { parseAndFilterListing } from "@/lib/sniper/anti-bullshit";
export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams;
  const series = (q.get("series") || "").slice(0, 160), issue = (q.get("issue") || "").slice(0, 20);
  if (!series || !issue) return Response.json({ error: "Series and issue required" }, { status: 400 });
  const history = await readCompletedEbaySales(`${series} ${issue.replace(/^#/, "")}`);
  const rows = (history.rawRecords || history.items).map(record => {
    const title = String(record.title || "");
    const parsed = matchCompletedComicSale(title, series, issue);
    const details = parsed || parseAndFilterListing(title);
    return {
      itemId: record.itemId, title, date: record.soldDate || record.lastSoldDate,
      price: record.soldPrice?.amount ?? record.lastSoldPrice?.value ?? null,
      currency: record.soldPrice?.currency || record.lastSoldPrice?.currency || "USD",
      url: record.itemUrl || record.itemWebUrl || (record.itemId ? `https://www.ebay.com/itm/${record.itemId}` : null),
      bookMatch: Boolean(parsed), grader: details.isCertifiedSlab ? details.gradingCompany : null,
      grade: details.isCertifiedSlab ? details.grade : null,
      designation: /\b(?:ss|signature series|signed)\b/i.test(title) ? "Signed / signature" : "",
      recordType: record.recordType || "single_unit_listing",
    };
  }).sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  if (history.available && history.total > 0 && rows.length === 0) return Response.json({ available: false, message: "The refreshed records did not finish saving. This is not evidence of no sales.", retrievedCount: 0, bookCount: 0, otherCount: 0, records: [], hasMoreHistory: true }, { headers: { "Cache-Control": "no-store" } });
  const matched = rows.filter(row => row.bookMatch);
  const selected = q.get("scope") === "all" ? rows : matched;
  if (q.get("format") === "download") return Response.json({ query: `${series} ${issue}`, checkedAt: history.checkedAt, hasMore: history.hasMore, records: selected }, { headers: { "Content-Disposition": `attachment; filename="${series.replace(/[^a-z0-9]+/gi, "-")}-${issue}-completed-sales.json"`, "Cache-Control": "no-store" } });
  const page = Math.max(1, Number(q.get("page")) || 1), size = 50;
  return Response.json({ available: history.available, message: history.message, checkedAt: history.checkedAt, hasMoreHistory: history.hasMore,
    retrievedCount: rows.length, bookCount: matched.length, otherCount: rows.length - matched.length,
    total: selected.length, page, pages: Math.max(1, Math.ceil(selected.length / size)), records: selected.slice((page - 1) * size, page * size),
  }, { headers: { "Cache-Control": "no-store" } });
}
