import { NextResponse } from "next/server";
import { createAdminServerClient } from "@/lib/supabase/admin";
import { readSalesForBook } from "@/lib/sniper/market-store";
import { dedupeSales } from "@/lib/sniper/candles";

export const dynamic = "force-dynamic";

export interface RealizedSaleComp {
  venue: string;
  date: string;
  grade: number;
  price: number;
  title?: string;
  url?: string;
}

// Same book is asked for again and again (every time a lot is opened): keep the answer for a minute, in memory and at the CDN.
const COMPS_TTL_MS = 60_000;
const compsCache = new Map<string, { at: number; p: Promise<{ status: number; body: string }> }>();
const compsHeaders = (status: number) => ({
  "content-type": "application/json",
  "cache-control": status === 200 ? "public, s-maxage=60, stale-while-revalidate=300" : "no-store",
});

export async function GET(request: Request) {
  const key = new URL(request.url).search;
  const hit = compsCache.get(key);
  if (hit && Date.now() - hit.at < COMPS_TTL_MS) {
    const r = await hit.p;
    return new Response(r.body, { status: r.status, headers: compsHeaders(r.status) });
  }
  const p = computeGET(request).then(async (res) => ({ status: res.status, body: await res.text() }));
  compsCache.set(key, { at: Date.now(), p });
  p.then((r) => { if (r.status !== 200) compsCache.delete(key); }).catch(() => compsCache.delete(key));
  if (compsCache.size > 200) compsCache.delete(compsCache.keys().next().value as string);
  const r = await p;
  return new Response(r.body, { status: r.status, headers: compsHeaders(r.status) });
}

async function computeGET(request: Request) {
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
  const sales = dedupeSales(await readSalesForBook(series, String(issue).replace(/^#/, "")));
  const comps: RealizedSaleComp[] = sales
    .filter((s) => s.grade != null && s.grade > 0)
    .map((s) => ({
      venue: s.confirmed ? s.venue : `${s.venue} (final bid watched)`,
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
