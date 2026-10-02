import { NextResponse } from "next/server";
import {
  SURFACE_ORDER,
  SURFACE_ART_MAP,
  type SurfaceKey,
} from "@/lib/assets/surfaceConfig";
import type { AssetItem, AssetResponse, SurfaceData } from "@/lib/assets/types";
import ce70Dossiers from "@/lib/equity/ce70-dossiers-data.json";

// Seed instruments for key surfaces
const SEED_SURFACES: Record<string, Array<Partial<AssetItem>>> = {
  CHARACTER: [
    { symbol: "$SPID", displayName: "Spider-Man", universe: "Marvel", pricing: { price: 1845.50, delta: 1.85, fmv: 1845.50, production_age: "silver" } },
    { symbol: "$WOLV", displayName: "Wolverine", universe: "Marvel", pricing: { price: 1420.00, delta: -0.42, fmv: 1420.00, production_age: "bronze" } },
    { symbol: "$IRON", displayName: "Iron Man", universe: "Marvel", pricing: { price: 980.25, delta: 0.75, fmv: 980.25, production_age: "silver" } },
    { symbol: "$THOR", displayName: "Thor", universe: "Marvel", pricing: { price: 890.00, delta: 1.12, fmv: 890.00, production_age: "silver" } },
    { symbol: "$HULK", displayName: "Incredible Hulk", universe: "Marvel", pricing: { price: 1650.00, delta: -0.15, fmv: 1650.00, production_age: "silver" } },
  ],
  DC_CHARACTER: [
    { symbol: "$BAT", displayName: "Batman", universe: "DC", pricing: { price: 2450.00, delta: 2.10, fmv: 2450.00, production_age: "golden" } },
    { symbol: "$SUPR", displayName: "Superman", universe: "DC", pricing: { price: 3200.00, delta: 0.95, fmv: 3200.00, production_age: "platinum" } },
    { symbol: "$WWOM", displayName: "Wonder Woman", universe: "DC", pricing: { price: 1150.00, delta: 1.45, fmv: 1150.00, production_age: "golden" } },
    { symbol: "$FLSH", displayName: "The Flash", universe: "DC", pricing: { price: 940.00, delta: -0.65, fmv: 940.00, production_age: "silver" } },
  ],
  VILLAIN: [
    { symbol: "$DOOM", displayName: "Doctor Doom", universe: "Marvel", pricing: { price: 2100.00, delta: 3.20, fmv: 2100.00, production_age: "silver" } },
    { symbol: "$JKR", displayName: "The Joker", universe: "DC", pricing: { price: 2800.00, delta: 1.80, fmv: 2800.00, production_age: "golden" } },
    { symbol: "$MAGN", displayName: "Magneto", universe: "Marvel", pricing: { price: 1350.00, delta: -0.80, fmv: 1350.00, production_age: "silver" } },
    { symbol: "$THNS", displayName: "Thanos", universe: "Marvel", pricing: { price: 1780.00, delta: 2.45, fmv: 1780.00, production_age: "bronze" } },
  ],
  INDEX: [
    { symbol: "$CE70", displayName: "CE70 Sovereign Index", universe: "Composite", pricing: { price: 2486.45, delta: 0.68, fmv: 2486.45 } },
    { symbol: "$PPIX100", displayName: "PPIX 100 Benchmark", universe: "Composite", pricing: { price: 1130.82, delta: 0.56, fmv: 1130.82 } },
    { symbol: "$MRK50", displayName: "Marvel 50 Index", universe: "Marvel", pricing: { price: 1840.15, delta: 1.15, fmv: 1840.15 } },
    { symbol: "$DC30", displayName: "DC Core 30 Index", universe: "DC", pricing: { price: 1620.50, delta: 0.40, fmv: 1620.50 } },
  ],
  OPTIONS: [
    { symbol: "$ASM-C-1500", displayName: "ASM #300 9.8 Call 1500", universe: "Derivative", diversityBucket: "call", pricing: { price: 145.00, delta: 0.642, theta: -0.045, sigma_eff: 0.38, fmv: 145.00 } },
    { symbol: "$BAT-P-2000", displayName: "Batman #181 Put 2000", universe: "Derivative", diversityBucket: "put", pricing: { price: 85.00, delta: -0.320, theta: -0.028, sigma_eff: 0.42, fmv: 85.00 } },
    { symbol: "$HULK-C-1200", displayName: "Hulk #181 Call 1200", universe: "Derivative", diversityBucket: "call", pricing: { price: 290.00, delta: 0.785, theta: -0.060, sigma_eff: 0.45, fmv: 290.00 } },
  ],
  ETF: [
    { symbol: "$XGLD", displayName: "Golden Age Pure Alpha ETF", universe: "Fund", pricing: { price: 345.20, delta: 0.85, fmv: 345.20 } },
    { symbol: "$XSIL", displayName: "Silver Age Growth ETF", universe: "Fund", pricing: { price: 218.40, delta: 1.25, fmv: 218.40 } },
    { symbol: "$XKEY", displayName: "First Appearance Titans ETF", universe: "Fund", pricing: { price: 412.10, delta: -0.30, fmv: 412.10 } },
  ],
  BATTLE_STATS: [
    { symbol: "$HVK-BAT", displayName: "Hulk vs Wolverine (Incredible Hulk #181)", universe: "Marvel", pricing: { price: 4200.00, delta: 3.10, fmv: 4200.00, production_age: "bronze" } },
    { symbol: "$SVM-BAT", displayName: "Superman vs Muhammad Ali", universe: "DC", pricing: { price: 850.00, delta: 0.50, fmv: 850.00, production_age: "bronze" } },
    { symbol: "$BVJ-BAT", displayName: "Batman vs Joker (Killing Joke)", universe: "DC", pricing: { price: 620.00, delta: 1.20, fmv: 620.00, production_age: "copper" } },
  ],
  GADGET: [
    { symbol: "$MJOL", displayName: "Mjolnir (Journey into Mystery #83)", universe: "Marvel", pricing: { price: 1950.00, delta: 0.90, fmv: 1950.00, production_age: "silver" } },
    { symbol: "$GANT", displayName: "Infinity Gauntlet (Infinity Gauntlet #1)", universe: "Marvel", pricing: { price: 780.00, delta: 2.10, fmv: 780.00, production_age: "copper" } },
    { symbol: "$BATMB", displayName: "Batmobile (Detective Comics #27)", universe: "DC", pricing: { price: 5400.00, delta: 1.40, fmv: 5400.00, production_age: "golden" } },
  ],
  LOCATION: [
    { symbol: "$GOTH", displayName: "Gotham City", universe: "DC", pricing: { price: 2100.00, delta: 0.70, fmv: 2100.00, production_age: "golden" } },
    { symbol: "$WAK", displayName: "Wakanda", universe: "Marvel", pricing: { price: 1680.00, delta: 1.90, fmv: 1680.00, production_age: "silver" } },
    { symbol: "$E616", displayName: "Earth-616", universe: "Marvel", pricing: { price: 3400.00, delta: 0.40, fmv: 3400.00, production_age: "silver" } },
  ],
  COMMODITY: [
    { symbol: "$VIB", displayName: "Vibranium Reserve", universe: "Marvel", pricing: { price: 425.00, delta: 1.65, fmv: 425.00 } },
    { symbol: "$ADM", displayName: "Adamantium Pure Ingot", universe: "Marvel", pricing: { price: 680.00, delta: -0.50, fmv: 680.00 } },
    { symbol: "$KRYP", displayName: "Green Kryptonite", universe: "DC", pricing: { price: 310.00, delta: 0.25, fmv: 310.00 } },
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
    const seeds = SEED_SURFACES[surfaceKey] || [];

    // Fall back to CE70 constituents adapted for the surface if no specific seeds
    const sourceItems: Array<Partial<AssetItem>> = seeds.length > 0 ? seeds : ce70Dossiers.slice(0, 3).map((dossier, i) => ({
      symbol: `$${surfaceKey.slice(0, 4)}-${dossier.seatNumber}`,
      displayName: `${dossier.title} (${surfaceKey})`,
      universe: dossier.publisher,
      pricing: {
        price: Math.round(dossier.gregoryScore * 10),
        delta: Number(((dossier.gregoryScore - 190.0) * 0.45).toFixed(2)),
        fmv: Math.round(dossier.gregoryScore * 10),
        production_age: dossier.era.toLowerCase().replace(/\s+age$/, ""),
      },
    }));

    const items: AssetItem[] = sourceItems.map((s, idx) => ({
      entryId: `asset-${surfaceKey}-${idx}`,
      assetId: s.symbol?.replace(/^\$/, "") || `${surfaceKey}-${idx}`,
      assetType: surfaceKey,
      displayRank: idx + 1,
      diversityBucket: s.diversityBucket || "standard",
      symbol: s.symbol || `$${surfaceKey}`,
      displayName: s.displayName || `${surfaceKey} Asset`,
      description: s.description || `Canonical ${surfaceKey} surface instrument for portfolio exposure.`,
      universe: s.universe || "Global",
      pricing: s.pricing || { price: 100, delta: 0, fmv: 100 },
      valueUnit: "USD",
      detailUrl: `/assets/${encodeURIComponent(s.symbol?.replace(/^\$/, "") || surfaceKey)}`,
      coverImageUrl: artPath,
      identityYear: (s.pricing as any)?.identityYear || 1965 + (idx * 5),
      coverVerified: true,
      quarantined: false,
    }));

    let surfaceItems = [...items];
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
