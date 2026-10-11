import { NextResponse } from "next/server";
import { searchEbayLiveAuctions } from "@/lib/sniper/ebay-api";
import { createAdminServerClient } from "@/lib/supabase/admin";
import benchmarksData from "@/lib/pricing/pricecharting-cgc-benchmarks.json";

export const dynamic = "force-dynamic";

export interface RealizedSaleComp {
  venue: string;
  date: string;
  grade: number;
  price: number;
  title?: string;
  url?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const series = searchParams.get("series");
  const issue = searchParams.get("issue");

  if (!series || !issue) {
    return NextResponse.json(
      { success: false, error: "Missing series or issue parameter" },
      { status: 400 }
    );
  }

  const comps: RealizedSaleComp[] = [];

  // 1. Check verified CGC & PriceCharting observation benchmarks
  const benchmarkKey = `${series} #${issue}`;
  const benchmarkEntry = (benchmarksData as Record<string, any>)[benchmarkKey];

  if (benchmarkEntry?.allObservations && Array.isArray(benchmarkEntry.allObservations)) {
    for (const obs of benchmarkEntry.allObservations) {
      const amt = Number(obs.amount);
      const dt = obs.date || obs.observedAt;
      if (amt > 0 && dt) {
        const gradeNum = parseFloat(String(obs.grade || "9.8").replace(/[^0-9.]/g, "")) || 9.8;
        comps.push({
          venue: obs.authority || obs.type || "CGC / GPA",
          date: String(dt).slice(0, 10),
          grade: gradeNum,
          price: amt,
        });
      }
    }
  }

  if (benchmarkEntry?.cgc && Array.isArray(benchmarkEntry.cgc)) {
    for (const sale of benchmarkEntry.cgc) {
      const amt = Number(sale.amount);
      const dt = sale.observedAt || sale.date;
      if (amt > 0 && dt) {
        const gradeNum = parseFloat(String(sale.grade || "9.8").replace(/[^0-9.]/g, "")) || 9.8;
        comps.push({
          venue: sale.venue || "Heritage Auctions",
          date: String(dt).slice(0, 10),
          grade: gradeNum,
          price: amt,
        });
      }
    }
  }

  // 2. Query Supabase graded_sales_observations
  try {
    const db = createAdminServerClient();
    const { data: dbSales } = await db
      .from("graded_sales_observations")
      .select("sale_price, sale_date, native_grade_text, venue, title_name")
      .ilike("title_name", `%${series}%`)
      .eq("issue_number_raw", issue)
      .gt("sale_price", 0)
      .order("sale_date", { ascending: false })
      .limit(30);

    if (dbSales && dbSales.length > 0) {
      for (const s of dbSales) {
        if (s.sale_price && s.sale_date) {
          const gradeNum =
            parseFloat(String(s.native_grade_text || "9.8").replace(/[^0-9.]/g, "")) || 9.8;
          comps.push({
            venue: s.venue || "GPA / Certified",
            date: String(s.sale_date).slice(0, 10),
            grade: gradeNum,
            price: Number(s.sale_price),
          });
        }
      }
    }
  } catch (err) {
    console.warn("[Comps API] Supabase fetch error:", err);
  }

  // 3. Query eBay Developer REST API for active & completed market listings
  try {
    const ebayResults = await searchEbayLiveAuctions({
      query: `${series} ${issue} CGC`,
      limit: 12,
      buyingOptions: "ALL",
    });

    if (ebayResults && ebayResults.length > 0) {
      for (const it of ebayResults) {
        if (it.currentBid > 0) {
          const p = it.currentBid;
          const gradeMatch = it.title.match(/(?:CGC|CBCS|PSA)\s*([0-9]\.[0-9]|10(?:\.0)?)/i);
          const g = gradeMatch ? parseFloat(gradeMatch[1]) : 9.8;

          comps.push({
            venue: "eBay Live Marketplace",
            date: "Live Floor",
            grade: g,
            price: p,
            title: it.title,
            url: it.url,
          });
        }
      }
    }
  } catch (err) {
    console.warn("[Comps API] eBay live search error:", err);
  }

  // Sort comps: Live floor listings first, then recent sales by date descending
  const sorted = comps.sort((a, b) => {
    if (a.date === "Live Floor" && b.date !== "Live Floor") return -1;
    if (b.date === "Live Floor" && a.date !== "Live Floor") return 1;
    return b.date.localeCompare(a.date);
  });

  return NextResponse.json({
    success: true,
    count: sorted.length,
    comps: sorted,
  });
}
