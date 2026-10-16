import { NextResponse } from "next/server";
import { createAdminServerClient } from "@/lib/supabase/admin";
import { readSalesForBook } from "@/lib/sniper/market-store";
import { readEbaySalesForBook } from "@/lib/sniper/ebay-sales-view";
import { dedupeSales } from "@/lib/sniper/candles";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export interface RealizedSaleComp {
  venue: string;
  date: string;
  grade: number;
  price: number;
  title?: string;
  url?: string;
}

export async function GET(request:Request) {
  const response=await readComps(request);
  response.headers.set("cache-control","no-store");
  return response;
}
async function readComps(request:Request) {
  const { searchParams } = new URL(request.url);
  const series = searchParams.get("series");
  const issue = searchParams.get("issue");

  if (!series || !issue) {
    return NextResponse.json(
      { success: false, error: "Missing series or issue parameter" },
      { status: 400 }
    );
  }

  // Every recorded sale for this book, from the same place the chart reads: ComicConnect sold archive, the graded-sales
  // register, stored benchmark observations, and eBay auctions we watched close (final bid, not confirmed by eBay).
  // Live asks and current bids are not sales and are not listed.
  // Opening research reads recorded evidence only. It must not buy a vendor lookup or wait for acquisition.

  const issueClean = String(issue).replace(/^#/, "");
  const [ebay, recorded] = await Promise.all([
    readEbaySalesForBook(series, issueClean, searchParams.get("grader")).catch(() => ({ sales: [] as Awaited<ReturnType<typeof readSalesForBook>> })),
    readSalesForBook(series, issueClean).catch(() => []),
  ]);
  const sales = dedupeSales([...ebay.sales, ...recorded]);
  const comps: RealizedSaleComp[] = sales
    .filter((s) => s.grade != null && s.grade > 0)
    .map((s) => ({
      venue: s.source === "ebay_insights" || s.source === "ebay_history" ? "eBay completed sale" : s.confirmed ? s.venue : `${s.venue} (final bid watched)`,
      date: s.date.slice(0, 10),
      grade: Number(s.grade),
      price: s.price,
      url: s.url,
    }));
  const sorted = comps.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 60);

  return NextResponse.json({
    success: true,
    count: sorted.length,
    comps: sorted,
  });
}
