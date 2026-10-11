import { createAdminServerClient } from "@/lib/supabase/admin";
import { createCachedQuery } from "@/lib/cache/wrapper";
import { INITIAL_SURFACE_ASSETS } from "./initial-assets";

export interface StoredAssetPrice {
  priceUsd: number;
  grade: "9.8";
  comicId: string;
}

/** "Action Comics #252" -> { series: "Action Comics", issue: "252" } */
function splitTitle(displayName: string): { series: string; issue: string } | null {
  const m = displayName.match(/^(.*?)\s+#(\S+)$/);
  return m ? { series: m[1].trim(), issue: m[2] } : null;
}

/**
 * Stored PriceCharting 9.8 price for each listed instrument, from the `comics` row matching series, issue and year.
 * Instruments with no matching priced row are absent from the result.
 */
async function fetchSeatPricesRaw(): Promise<Record<string, StoredAssetPrice>> {
  const out: Record<string, StoredAssetPrice> = {};
  const supabase = createAdminServerClient();
  await Promise.all(
    INITIAL_SURFACE_ASSETS.map(async (a) => {
      const t = splitTitle(a.displayName);
      if (!t || !a.identityYear || !a.assetId) return;
      try {
        const { data } = await supabase
          .from("comics")
          .select("id,pp_grade_9_8_price")
          .eq("series", t.series)
          .eq("issue_number", t.issue)
          .eq("publication_year", a.identityYear)
          .gt("pp_grade_9_8_price", 0)
          .order("pp_grade_9_8_price", { ascending: false })
          .limit(1)
          .maybeSingle();
        const price = Number(data?.pp_grade_9_8_price);
        if (data && price > 0) out[a.assetId] = { priceUsd: price, grade: "9.8", comicId: data.id };
      } catch (_) {}
    }),
  );
  return out;
}

export const getSeatPrices = createCachedQuery(fetchSeatPricesRaw, "asset-seat-prices", {
  ttlSeconds: 900,
  staleWhileRevalidateSeconds: 3600,
  tags: ["assets", "pricing"],
});
