import { NextResponse } from "next/server";
import {
  SURFACE_ORDER,
  SURFACE_ART_MAP,
  type SurfaceKey,
} from "@/lib/assets/surfaceConfig";
import type { AssetItem, AssetResponse, SurfaceData } from "@/lib/assets/types";
import { INITIAL_SURFACE_ASSETS } from "@/lib/assets/initial-assets";

// Seed instruments for key surfaces
const SEED_SURFACES: Record<string, Array<Partial<AssetItem>>> = {
  CHARACTER: [
    { symbol: "$SPID", displayName: "Spider-Man", universe: "Marvel", pricing: { price: 1845.50, delta: 1.85, fmv: 1845.50, production_age: "silver" } },
    { symbol: "$WOLV", displayName: "Wolverine", universe: "Marvel", pricing: { price: 1424.35, delta: -0.42, fmv: 1424.35, production_age: "bronze" } },
    { symbol: "$IRON", displayName: "Iron Man", universe: "Marvel", pricing: { price: 980.25, delta: 0.75, fmv: 980.25, production_age: "silver" } },
    { symbol: "$THOR", displayName: "Thor", universe: "Marvel", pricing: { price: 892.60, delta: 1.12, fmv: 892.60, production_age: "silver" } },
    { symbol: "$HULK", displayName: "Incredible Hulk", universe: "Marvel", pricing: { price: 1648.75, delta: -0.15, fmv: 1648.75, production_age: "silver" } },
  ],
  DC_CHARACTER: [
    { symbol: "$BAT", displayName: "Batman", universe: "DC", pricing: { price: 2455.80, delta: 2.10, fmv: 2455.80, production_age: "golden" } },
    { symbol: "$SUPR", displayName: "Superman", universe: "DC", pricing: { price: 3198.50, delta: 0.95, fmv: 3198.50, production_age: "platinum" } },
    { symbol: "$WWOM", displayName: "Wonder Woman", universe: "DC", pricing: { price: 1154.20, delta: 1.45, fmv: 1154.20, production_age: "golden" } },
    { symbol: "$FLSH", displayName: "The Flash", universe: "DC", pricing: { price: 938.45, delta: -0.65, fmv: 938.45, production_age: "silver" } },
  ],
  VILLAIN: [
    { symbol: "$DOOM", displayName: "Doctor Doom", universe: "Marvel", pricing: { price: 2105.60, delta: 3.20, fmv: 2105.60, production_age: "silver" } },
    { symbol: "$JKR", displayName: "The Joker", universe: "DC", pricing: { price: 2794.30, delta: 1.80, fmv: 2794.30, production_age: "golden" } },
    { symbol: "$MAGN", displayName: "Magneto", universe: "Marvel", pricing: { price: 1352.15, delta: -0.80, fmv: 1352.15, production_age: "silver" } },
    { symbol: "$THNS", displayName: "Thanos", universe: "Marvel", pricing: { price: 1784.90, delta: 2.45, fmv: 1784.90, production_age: "bronze" } },
  ],
  INDEX: [
    { symbol: "$CE70", displayName: "CE70 Sovereign Index", universe: "Composite", pricing: { price: 2486.45, delta: 0.68, fmv: 2486.45 } },
    { symbol: "$PPIX100", displayName: "PPIX 100 Benchmark", universe: "Composite", pricing: { price: 1130.82, delta: 0.56, fmv: 1130.82 } },
    { symbol: "$MRK50", displayName: "Marvel 50 Index", universe: "Marvel", pricing: { price: 1840.15, delta: 1.15, fmv: 1840.15 } },
    { symbol: "$DC30", displayName: "DC Core 30 Index", universe: "DC", pricing: { price: 1620.50, delta: 0.40, fmv: 1620.50 } },
  ],
  OPTIONS: [
    { symbol: "$ASM-C-1500", displayName: "ASM #300 9.8 Call 1500", universe: "Derivative", diversityBucket: "call", pricing: { price: 145.60, delta: 0.642, theta: -0.045, sigma_eff: 0.38, fmv: 145.60 } },
    { symbol: "$BAT-P-2000", displayName: "Batman #181 Put 2000", universe: "Derivative", diversityBucket: "put", pricing: { price: 84.75, delta: -0.320, theta: -0.028, sigma_eff: 0.42, fmv: 84.75 } },
    { symbol: "$HULK-C-1200", displayName: "Hulk #181 Call 1200", universe: "Derivative", diversityBucket: "call", pricing: { price: 289.40, delta: 0.785, theta: -0.060, sigma_eff: 0.45, fmv: 289.40 } },
  ],
  ETF: [
    { symbol: "$XGLD", displayName: "Golden Age Pure Alpha ETF", universe: "Fund", pricing: { price: 345.20, delta: 0.85, fmv: 345.20 } },
    { symbol: "$XSIL", displayName: "Silver Age Growth ETF", universe: "Fund", pricing: { price: 218.40, delta: 1.25, fmv: 218.40 } },
    { symbol: "$XKEY", displayName: "First Appearance Titans ETF", universe: "Fund", pricing: { price: 412.10, delta: -0.30, fmv: 412.10 } },
  ],
  BATTLE_STATS: [
    { symbol: "$HVK-BAT", displayName: "Hulk vs Wolverine (Incredible Hulk #181)", universe: "Marvel", pricing: { price: 4215.50, delta: 3.10, fmv: 4215.50, production_age: "bronze" } },
    { symbol: "$SVM-BAT", displayName: "Superman vs Muhammad Ali", universe: "DC", pricing: { price: 852.30, delta: 0.50, fmv: 852.30, production_age: "bronze" } },
    { symbol: "$BVJ-BAT", displayName: "Batman vs Joker (Killing Joke)", universe: "DC", pricing: { price: 618.90, delta: 1.20, fmv: 618.90, production_age: "copper" } },
  ],
  GADGET: [
    { symbol: "$MJOL", displayName: "Mjolnir (Journey into Mystery #83)", universe: "Marvel", pricing: { price: 1954.80, delta: 0.90, fmv: 1954.80, production_age: "silver" } },
    { symbol: "$GANT", displayName: "Infinity Gauntlet (Infinity Gauntlet #1)", universe: "Marvel", pricing: { price: 782.40, delta: 2.10, fmv: 782.40, production_age: "copper" } },
    { symbol: "$BATMB", displayName: "Batmobile (Detective Comics #27)", universe: "DC", pricing: { price: 5412.50, delta: 1.40, fmv: 5412.50, production_age: "golden" } },
  ],
  LOCATION: [
    { symbol: "$GOTH", displayName: "Gotham City", universe: "DC", pricing: { price: 2096.75, delta: 0.70, fmv: 2096.75, production_age: "golden" } },
    { symbol: "$WAK", displayName: "Wakanda", universe: "Marvel", pricing: { price: 1682.40, delta: 1.90, fmv: 1682.40, production_age: "silver" } },
    { symbol: "$E616", displayName: "Earth-616", universe: "Marvel", pricing: { price: 3408.20, delta: 0.40, fmv: 3408.20, production_age: "silver" } },
  ],
  COMMODITY: [
    { symbol: "$VIB", displayName: "Vibranium Reserve", universe: "Marvel", pricing: { price: 425.60, delta: 1.65, fmv: 425.60 } },
    { symbol: "$ADM", displayName: "Adamantium Pure Ingot", universe: "Marvel", pricing: { price: 678.90, delta: -0.50, fmv: 678.90 } },
    { symbol: "$KRYP", displayName: "Green Kryptonite", universe: "DC", pricing: { price: 312.45, delta: 0.25, fmv: 312.45 } },
  ],
  SECRET_IDENTITY: [
    { symbol: "$PPRK", displayName: "Peter Parker (Spider-Man)", universe: "Marvel", description: "Alter-Ego Sovereign IPO. Backed by 355 Member Firms voting cohort.", pricing: { price: 421.80, delta: 1.45, fmv: 421.80, production_age: "silver" } },
    { symbol: "$BWAY", displayName: "Bruce Wayne (Batman)", universe: "DC", description: "Wayne Enterprises billionaire alter-ego sovereign holding. 355 firms approved.", pricing: { price: 1254.60, delta: 0.95, fmv: 1254.60, production_age: "golden" } },
    { symbol: "$CKNT", displayName: "Clark Kent (Superman)", universe: "DC", description: "Daily Planet investigative reporter secret identity instrument.", pricing: { price: 679.40, delta: -0.30, fmv: 679.40, production_age: "platinum" } },
  ],
  PUBLISHER_STOCK: [
    { symbol: "$DIS", displayName: "Walt Disney Co (Marvel IP)", universe: "Real World", description: "NYSE: DIS. Real-world corporate parent of Marvel Comics, MCU, and licensing royalties.", pricing: { price: 114.85, delta: 1.15, fmv: 114.85 } },
    { symbol: "$SONY", displayName: "Sony Group Corp (Spider-Man Film IP)", universe: "Real World", description: "NYSE: SONY. Live trading rate for global Spider-Man theatrical and gaming distribution rights.", pricing: { price: 94.20, delta: -0.40, fmv: 94.20 } },
    { symbol: "$WBD", displayName: "Warner Bros Discovery (DC Comics Parent)", universe: "Real World", description: "NASDAQ: WBD. Corporate owner of DC Studios, DC Comics catalog, and character licensing.", pricing: { price: 10.45, delta: 2.30, fmv: 10.45 } },
    { symbol: "$PARA", displayName: "Paramount Global (TMNT Media Rights)", universe: "Real World", description: "NASDAQ: PARA. Live tracking of Teenage Mutant Ninja Turtles global franchise rights.", pricing: { price: 12.80, delta: 0.65, fmv: 12.80 } },
  ],
  BOND: [
    { symbol: "$GOTH-MUNI", displayName: "Gotham City Infrastructure 5.25% 2034", universe: "DC", description: "Municipal bond yielding 5.25%. Yield and credit spread fluctuate based on Arkham breakout news.", pricing: { price: 98.40, delta: -0.45, fmv: 98.40 } },
    { symbol: "$CENT-MUNI", displayName: "Central City S.T.A.R. Labs 4.80% 2032", universe: "DC", description: "Civic transit and particle physics municipal bond. Spreads react to rogue gallery activities.", pricing: { price: 101.20, delta: 0.25, fmv: 101.20 } },
    { symbol: "$WAK-SOV", displayName: "Wakanda Sovereign Vibranium 3.45% 2040", universe: "Marvel", description: "Triple-A rated sovereign treasury bond collateralized by physical vibranium reserves.", pricing: { price: 104.50, delta: 0.15, fmv: 104.50 } },
    { symbol: "$NYCS-MUNI", displayName: "NYC Super-Hero Damage Assessment 6.10%", universe: "Marvel", description: "High-yield catastrophe municipal bond insuring Midtown Manhattan against super-battles.", pricing: { price: 95.80, delta: 1.10, fmv: 95.80 } },
  ],
  SWAPS: [
    { symbol: "$SWAP-GOLD-SILV", displayName: "Golden/Silver Sovereign Return Swap", universe: "Derivative", description: "Institutional swap contract exchanging Golden Age appreciation against Silver Age volatility.", pricing: { price: 321.50, delta: 0.75, fmv: 321.50 } },
    { symbol: "$SWAP-98-96", displayName: "CGC 9.8 vs 9.6 Basis Spread Swap", universe: "Derivative", description: "Basis swap hedging grade price compression across blue chip issues.", pricing: { price: 184.60, delta: -0.35, fmv: 184.60 } },
  ],
  VOLATILITY: [
    { symbol: "$VIX-COMIC", displayName: "Comic Market Implied Volatility Index", universe: "Derivative", description: "Expected 30-day volatility index across sovereign certified slab auctions.", pricing: { price: 18.45, delta: 1.25, fmv: 18.45 } },
    { symbol: "$VIX-GOTH", displayName: "Gotham Threat Volatility Meter", universe: "Derivative", description: "Lore-driven geopolitical risk index measuring villain activity contagion.", pricing: { price: 42.10, delta: 3.40, fmv: 42.10 } },
  ],
  FUTURES: [
    { symbol: "$FUT-BRNZ", displayName: "Bronze Age Dec 2026 Future", universe: "Derivative", description: "Standardized futures contract settling against the Bronze Age Sovereign Composite.", pricing: { price: 185.75, delta: 0.40, fmv: 185.75 } },
    { symbol: "$FUT-GOLD", displayName: "Golden Age Sovereign Dec 2026 Future", universe: "Derivative", description: "CME-style comic futures contract for physical vault settlement.", pricing: { price: 448.90, delta: 0.85, fmv: 448.90 } },
  ],
  PREDICTION: [
    { symbol: "$PRED-MCU-XMN", displayName: "MCU X-Men Release Before Q4 2027", universe: "Prediction", pricing: { price: 0.68, yes_price: 0.68, no_price: 0.32, fmv: 0.68 } },
    { symbol: "$PRED-CGC-10", displayName: "First Action #1 CGC 10.0 Discovered in 2026", universe: "Prediction", pricing: { price: 0.12, yes_price: 0.12, no_price: 0.88, fmv: 0.12 } },
  ],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const randomStart = searchParams.get("randomStart") === "1" || searchParams.get("reload") === "1";

  const surfaces: Partial<Record<SurfaceKey, SurfaceData>> = {};
  let totalShowing = 0;
  let totalEligible = 0;

  for (const surfaceKey of SURFACE_ORDER) {
    const artPath = SURFACE_ART_MAP[surfaceKey] || null;
    const initialItems = INITIAL_SURFACE_ASSETS.filter((it) => it.assetType === surfaceKey);
    const seeds = SEED_SURFACES[surfaceKey] || [];

    // Prioritize initial assets configured for the surface, falling back to seeds
    const sourceItems: Array<Partial<AssetItem>> =
      initialItems.length > 0 ? initialItems : seeds;

    const items: AssetItem[] = sourceItems.map((s, idx) => ({
      entryId: s.entryId || `asset-${surfaceKey.toLowerCase()}-${idx}`,
      assetId: s.assetId || s.symbol?.replace(/^\$/, "") || `${surfaceKey}-${idx}`,
      assetType: surfaceKey,
      displayRank: idx + 1,
      diversityBucket: s.diversityBucket || "standard",
      symbol: s.symbol || `$${surfaceKey}`,
      displayName: s.displayName || `${surfaceKey} Asset`,
      description: s.description || `Canonical ${surfaceKey} surface instrument for portfolio exposure.`,
      universe: s.universe || "Global",
      pricing: {
        ...(s.pricing || { price: 100, delta: 0, fmv: 100 }),
        fmv_usd: (s.pricing as any)?.fmv_usd ?? (s.pricing as any)?.fmv ?? (s.pricing as any)?.price ?? 100,
        fmv: (s.pricing as any)?.fmv ?? (s.pricing as any)?.fmv_usd ?? (s.pricing as any)?.price ?? 100,
        price: (s.pricing as any)?.price ?? (s.pricing as any)?.fmv_usd ?? (s.pricing as any)?.fmv ?? 100,
      },
      valueUnit: "USD",
      detailUrl: s.detailUrl || `/assets/${encodeURIComponent(s.symbol?.replace(/^\$/, "") || surfaceKey)}`,
      coverImageUrl: s.coverImageUrl || artPath,
      identityYear: (s.pricing as any)?.identityYear || (s as any).identityYear || 1965 + (idx * 5),
      coverVerified: true,
      quarantined: false,
    }));

    let surfaceItems = items.filter((item) => {
      if (!item.coverImageUrl) return false;
      const fmv = item.pricing?.fmv_usd ?? item.pricing?.fmv ?? item.pricing?.price ?? 0;
      if (fmv < 20.00) return false;
      return true;
    });

    if (randomStart && surfaceItems.length > 1) {
      const shift = Math.floor(Math.random() * surfaceItems.length);
      surfaceItems = [...surfaceItems.slice(shift), ...surfaceItems.slice(0, shift)];
    }

    surfaces[surfaceKey] = {
      showing: surfaceItems.length,
      totalInQueue: surfaceItems.length,
      items: surfaceItems,
    };

    totalShowing += surfaceItems.length;
    totalEligible += surfaceItems.length;
  }

  const response: AssetResponse = {
    tickId: Math.floor(Date.now() / 30000),
    totalShowing,
    totalEligible,
    surfaces,
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, max-age=15, stale-while-revalidate=60",
    },
  });
}
