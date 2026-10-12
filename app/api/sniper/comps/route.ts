import { NextResponse } from "next/server";
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

  // 3. Current asking prices for the same book from the live feed (stored by the snapshot job; no eBay call here)
  try {
    const db = createAdminServerClient();
    const clean = series.replace(/[%_]/g, " ").replace(/^the\s+/i, "").trim();
    const { data: asks } = await db
      .from("sniper_listings")
      .select("title,price_usd,grade,url,buying_option")
      .eq("status", "live")
      .ilike("series", `%${clean}%`)
      .eq("issue", String(issue).replace(/^#/, ""))
      .gt("price_usd", 0)
      .gte("last_seen", new Date(Date.now() - 45 * 60000).toISOString())
      .limit(12);
    for (const a of asks ?? []) {
      comps.push({
        venue: a.buying_option === "AUCTION" ? "eBay live auction (current bid)" : "eBay live ask",
        date: "Live Floor",
        grade: a.grade != null ? Number(a.grade) : 0,
        price: Number(a.price_usd),
        title: a.title,
        url: a.url,
      });
    }
  } catch (err) {
    console.warn("[Comps API] live feed read error:", err);
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
