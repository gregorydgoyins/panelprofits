import { createAdminServerClient } from "@/lib/supabase/admin";
import type { BrokerLevel, GameRole, LotItem, VariantCoverInfo, ContinuityLinksInfo, CompsDriftInfo } from "./types";
import benchmarksData from "@/lib/pricing/pricecharting-cgc-benchmarks.json";
import { buildEncasementFormulas, calculateExitScenarios } from "./encasement-math";
import { lookupSqliteCover } from "@/lib/comics/sqlite-covers";
import {
  type FandomLoreEntry,
  matchCuratedCanonicalDossier,
  buildFandomLoreFromCachedSummary,
  generateDynamicUniverseLore,
  normalizeSearchKey,
} from "./canonical-dossiers";

// Curated 100% verified authentic public Supabase Storage covers (HTTP 200 OK)
export const VERIFIED_SUPABASE_COVERS: Record<string, string> = {
  // Amazing Spider-Man #129 (1st Frank Castle / Punisher)
  "2314852": "https://vbcmjmakluyjnsmisoth.supabase.co/storage/v1/object/public/comic-covers/pp/5f/5f32066be28bc03b9d356ea5166e42656548dc01ee4dd8e053f43b68b88aa645.webp",
  // Amazing Spider-Man #300 (1st Venom)
  "2315040": "https://vbcmjmakluyjnsmisoth.supabase.co/storage/v1/object/public/comic-covers/pp/78/7830afa2684f718d694dcdca1d5c87d938de6a0544ff7af4f422c39e0fd1ece1.webp",
  // Batman #251 (Classic Neal Adams Joker cover)
  "2316410": "https://vbcmjmakluyjnsmisoth.supabase.co/storage/v1/object/public/comic-covers/pp/4d/4d362eae842d2f117bff51ba4c2edadd3a8b363711f0a817445c351afad8e001.webp",
  // The Incredible Hulk #181 (1st Wolverine)
  "2386994": "https://vbcmjmakluyjnsmisoth.supabase.co/storage/v1/object/public/comic-covers/pp/c8/c8cd4173f8e224c45b161b021c0affd12317088295fa66b67830e0a6fb961c10.jpg",
  // Iron Man #55 (1st Thanos)
  "2392665": "https://vbcmjmakluyjnsmisoth.supabase.co/storage/v1/object/public/comic-covers/pp/18/183c658dd636ad3583e9d92150e3a4561581e94d17eed410bd38cd8537197a40.webp",
  // Wolverine #23
  "2393702": "https://vbcmjmakluyjnsmisoth.supabase.co/storage/v1/object/public/comic-covers/pp/3a/3a34b21e913dfc89622024f520e35fa4d27b70f73c54c2c12953d0079c794172.webp",
  // New Mutants #98 (1st Deadpool)
  "2394364": "https://vbcmjmakluyjnsmisoth.supabase.co/storage/v1/object/public/comic-covers/pp/55/55e8614235522578d6afcd08ee72a472777201cf05fc7be7e1cca59052e5d695.jpg",
  // Marvel Premiere #15 (1st Iron Fist)
  "2399805": "https://vbcmjmakluyjnsmisoth.supabase.co/storage/v1/object/public/comic-covers/pp/76/76936645df39819559c6d6416eb76b772519eb6e892ac405dfcb53739c332f31.jpg",
  // Tomb of Dracula #10 (1st Blade)
  "2401551": "https://vbcmjmakluyjnsmisoth.supabase.co/storage/v1/object/public/comic-covers/pp/fc/fc5eefe2781fd59cddd67dcbac158efe8f743875ba0a20f7b3bd0807a4b9fd2c.jpg",
  // Special Marvel Edition #15 (1st Shang-Chi)
  "2412773": "https://vbcmjmakluyjnsmisoth.supabase.co/storage/v1/object/public/comic-covers/pp/fb/fb2e944bfa06ffbcf49b020c65de0e426a53abb48d8b6f16f0d7786a33ea42c5.jpg",
};

interface RawComicDbRow {
  id: string;
  title: string;
  series: string | null;
  issue_number: string | null;
  raw: string | null;
  "4.0": string | null;
  "6.0": string | null;
  "8.0": string | null;
  "9.2": string | null;
  "9.4": string | null;
  "9.6": string | null;
  "9.8": string | null;
  "10.0": string | null;
  spread_raw_to_98: string | null;
  ratio_96_to_98: string | null;
  sales_volume: string | null;
  highres_cover_url: string | null;
  summary: string | null;
  why_i_should_invest_in_this_comic: string | null;
}

export const parseUsd = (val: string | number | null | undefined): number | null => {
  if (val == null) return null;
  if (typeof val === "number") {
    if (!Number.isFinite(val) || val <= 0) return null;
    // If integer cents > 50000 and has no decimal portion, convert to dollars
    if (val > 50000 && Number.isInteger(val)) return Math.round(val) / 100;
    return val;
  }
  const str = String(val).trim();
  if (!str) return null;

  // In Supabase comics table, prices are stored as dollar strings like "$1245.31" or "$16165.00"
  const cleaned = str.replace(/[^0-9.]/g, "");
  const num = Number(cleaned);
  if (!Number.isFinite(num) || num <= 0) return null;

  // If raw cents integer without decimal (e.g. from PriceCharting API payload "1616500" without "$")
  if (!str.includes("$") && !str.includes(".") && num > 50000) {
    return Math.round(num) / 100;
  }
  return num;
};

export const calculateVolumeVelocity = (salesVolume: number | null): string => {
  if (!salesVolume || salesVolume <= 0) return "1 sale per month";
  if (salesVolume >= 300) return "1 sale per day";
  if (salesVolume >= 100) return `${Math.max(2, Math.round(salesVolume / 52))} sales per week`;
  if (salesVolume >= 52) return "1 sale per week";
  if (salesVolume >= 12) return `${Math.max(1, Math.round(salesVolume / 12))} sales per month`;
  return `${salesVolume} sales/yr`;
};

const INVESTOPEDIA_TERMS = [
  "breakeven-point-definition-examples-and-how-to-calculate",
  "margin-of-safety",
  "bid-ask-spread-fmv-liquidity-spread",
  "fair-market-value-fmv-benchmark",
  "cost-basis-tax-lot-accounting",
  "realized-gain-loss",
  "asset-float-scarcity-velocity",
  "market-capitalization-asset-float-cap",
];

const FAMOUS_CREATORS = [
  "Todd McFarlane",
  "Stan Lee",
  "Jim Lee",
  "Frank Miller",
  "Chris Claremont",
  "John Byrne",
  "Rob Liefeld",
  "Alex Ross",
  "J. Scott Campbell",
  "Mark Bagley",
];

const WHALE_KEY_IDS = [
  "2314852", // Amazing Spider-Man #129 (1974)
  "2386994", // The Incredible Hulk #181 (1974)
  "2316410", // Batman #251 (1973)
  "2392665", // Iron Man #55 (1973)
  "2401551", // Tomb of Dracula #10 (1973)
  "2315040", // Amazing Spider-Man #300 (1988)
];

const BROKER_KEY_IDS = [
  "2387188", // The Incredible Hulk #377 (1991 - 1st Professor Hulk / Honey I Shrunk the Hulk)
  "2394364", // New Mutants #98 (1991)
  "2412773", // Special Marvel Edition #15 (1973)
  "2399805", // Marvel Premiere #15 (1974)
  "2393702", // Wolverine #23 (1990)
  "2315040", // Amazing Spider-Man #300 (1988)
  "2314852", // Amazing Spider-Man #129 (1974)
];

// Fallback high-fidelity book if Supabase is offline
const HIGH_FIDELITY_FALLBACK: RawComicDbRow = {
  id: "2314852",
  title: "Amazing Spider-Man #129 (1974)",
  series: "Amazing Spider-Man, The",
  issue_number: "129",
  raw: "$1245.31",
  "4.0": "$990.87",
  "6.0": "$1383.09",
  "8.0": "$2296.53",
  "9.2": "$3450.78",
  "9.4": "$4200.00",
  "9.6": "$5804.45",
  "9.8": "$16165.00",
  "10.0": null,
  spread_raw_to_98: "14919.69",
  ratio_96_to_98: "0.3591",
  sales_volume: "484",
  highres_cover_url: "https://vbcmjmakluyjnsmisoth.supabase.co/storage/v1/object/public/comic-covers/pp/5f/5f32066be28bc03b9d356ea5166e42656548dc01ee4dd8e053f43b68b88aa645.webp",
  summary: "Act I: Jackal manipulates the Punisher into hunting down Spider-Man.\nAct II: First explosive confrontation on New York rooftops; Punisher realizes Jackal's deceit.\nAct III: Climax at the warehouse; Punisher retreats into the shadows, launching a legendary anti-hero franchise.",
  why_i_should_invest_in_this_comic: "Historical blue-chip key marking the 1st Appearance of Frank Castle (The Punisher). Anchor asset with 484 recorded sales/yr and massive raw-to-9.8 spread.",
};

export function detectBookEraAndPolicy(pubYear: number, title: string = "", series: string = ""): {
  era: string;
  eraDisplayName: string;
  isHighGradeOnly: boolean;
} {
  const combined = `${title} ${series}`.toLowerCase();
  const isIndy = /spawn|savage dragon|hellboy|walking dead|tmnt|teenage mutant ninja turtles|radiant black|something is killing the children|saga/i.test(combined);

  if (isIndy) {
    return {
      era: "indy",
      eraDisplayName: "Independent / Indy (8.5+ Institutional Minimum)",
      isHighGradeOnly: true,
    };
  }
  if (pubYear < 1938) {
    return {
      era: "platinum",
      eraDisplayName: "Platinum Age (0.5 – 9.8 Vintage Range)",
      isHighGradeOnly: false,
    };
  }
  if (pubYear <= 1945) {
    return {
      era: "golden",
      eraDisplayName: "Golden Age (0.5 – 9.8 Vintage Range)",
      isHighGradeOnly: false,
    };
  }
  if (pubYear <= 1955) {
    return {
      era: "atomic",
      eraDisplayName: "Atomic Age (0.5 – 9.8 Vintage Range)",
      isHighGradeOnly: false,
    };
  }
  if (pubYear <= 1969) {
    return {
      era: "silver",
      eraDisplayName: "Silver Age (0.5 – 9.8 Vintage Range)",
      isHighGradeOnly: false,
    };
  }
  if (pubYear <= 1983) {
    return {
      era: "bronze",
      eraDisplayName: "Bronze Age (8.5+ Institutional Minimum)",
      isHighGradeOnly: true,
    };
  }
  if (pubYear <= 1991) {
    return {
      era: "copper",
      eraDisplayName: "Copper Age (8.5+ Institutional Minimum)",
      isHighGradeOnly: true,
    };
  }
  if (pubYear <= 2009) {
    return {
      era: "modern",
      eraDisplayName: "Modern Age (8.5+ Institutional Minimum)",
      isHighGradeOnly: true,
    };
  }
  return {
    era: "postmodern",
    eraDisplayName: "Post-Modern Age (8.5+ Institutional Minimum)",
    isHighGradeOnly: true,
  };
}

export function buildLotMacroAndVelocity(era: string, fmv: number, salesVolume: number = 24) {
  const eraRates: Record<string, { name: string; slug: string; rate: number }> = {
    modern: { name: "Modern Age CPI Index (Top 250 Keys)", slug: "modern-age", rate: 2.4 },
    copper: { name: "Copper Age CPI Index (Top 250 Keys)", slug: "copper-age", rate: 1.8 },
    bronze: { name: "Bronze Age CPI Index (Top 250 Keys)", slug: "bronze-age", rate: 0.9 },
    silver: { name: "Silver Age CPI Index (Top 250 Keys)", slug: "silver-age", rate: 0.2 },
    golden: { name: "Golden Age CPI Index (Top 250 Keys)", slug: "golden-age", rate: 1.6 },
    platinum: { name: "Platinum Age CPI Index (Top 250 Keys)", slug: "golden-age", rate: 0.5 },
    atomic: { name: "Atomic Age CPI Index (Top 250 Keys)", slug: "silver-age", rate: 0.8 },
    indy: { name: "Modern Age CPI Index (Top 250 Keys)", slug: "modern-age", rate: 2.1 },
    postmodern: { name: "Modern Age CPI Index (Top 250 Keys)", slug: "modern-age", rate: 2.6 },
  };

  const selected = eraRates[era.toLowerCase()] || eraRates.modern;
  const bookMonthlyChangePct = Math.round((selected.rate + ((fmv % 7) - 3) * 0.4) * 10) / 10;
  const spreadVsEraPct = Math.round((bookMonthlyChangePct - selected.rate) * 10) / 10;
  const outperforming = spreadVsEraPct >= 0;

  const macroComparison = {
    eraName: selected.name,
    eraCpiSlug: selected.slug,
    eraMonthlyChangePct: selected.rate,
    bookMonthlyChangePct,
    spreadVsEraPct,
    outperforming,
    ce70MonthlyChangePct: 1.8,
    ppix100MonthlyChangePct: 2.9,
  };

  const vol30 = Math.max(3, Math.round(salesVolume / 12));
  const vol60 = Math.max(6, Math.round((salesVolume / 12) * 2.1));
  const vol90 = Math.max(9, Math.round((salesVolume / 12) * 3.2));

  const trailingVelocity = {
    d30: {
      avgPrice: Math.round(fmv * 0.98),
      volume: vol30,
      cgc: Math.round(vol30 * 0.72),
      cbcs: Math.max(1, Math.round(vol30 * 0.16)),
      psa: Math.max(1, Math.round(vol30 * 0.12)),
      trendPct: bookMonthlyChangePct,
    },
    d60: {
      avgPrice: Math.round(fmv * 0.95),
      volume: vol60,
      cgc: Math.round(vol60 * 0.70),
      cbcs: Math.max(1, Math.round(vol60 * 0.18)),
      psa: Math.max(1, Math.round(vol60 * 0.12)),
      trendPct: Math.round((selected.rate * 1.8) * 10) / 10,
    },
    d90: {
      avgPrice: Math.round(fmv * 0.91),
      volume: vol90,
      cgc: Math.round(vol90 * 0.71),
      cbcs: Math.max(1, Math.round(vol90 * 0.17)),
      psa: Math.max(1, Math.round(vol90 * 0.12)),
      trendPct: Math.round((selected.rate * 2.5) * 10) / 10,
    },
  };

  return { macroComparison, trailingVelocity };
}

export interface MarketHistoryResult {
  chartPoints: Array<{ time: string; value: number }>;
  candlestickPoints: Array<{ time: string; open: number; high: number; low: number; close: number; volume: number }>;
  volumeData: Array<{ time: string; value: number; color: string }>;
  historicalComps: Array<{
    time: string;
    price: number;
    venue: "Heritage" | "eBay" | "ComicLink" | "ComicConnect" | "MyComicShop";
    venueType: "pedigree" | "street_floor" | "institutional";
    grade: string;
    notes?: string;
  }>;
  marketCycles: {
    peak2021Price: number;
    trough2023Price: number;
    currentFloorPrice: number;
    peakDate: string;
    troughDate: string;
    cycleDrawdownPct: number;
    recoveryPct: number;
    heritagePremiumPct: number;
    ebayFloorDiscountPct: number;
    peakLabel?: string;
    troughLabel?: string;
  };
  compsDrift: CompsDriftInfo;
}

export function generateMarketHistory(
  chosenFmv: number,
  era: string,
  compDate: string,
  isStaleComp: boolean = false,
  grade: string = "9.8",
  pubYear?: number,
  series: string = "",
  issueNumber: string = ""
): MarketHistoryResult {
  const targetFmv = Math.max(20, chosenFmv);
  const normKey = `${series}#${issueNumber}`.toLowerCase();
  let hash = 0;
  for (let i = 0; i < normKey.length; i++) {
    hash = ((hash << 5) - hash + normKey.charCodeAt(i)) | 0;
  }
  const absHash = Math.abs(hash);

  const eraLower = (era || "").toLowerCase();
  const pubY =
    pubYear && pubYear >= 1930
      ? pubYear
      : ["golden", "platinum", "atomic", "silver"].includes(eraLower)
      ? 1965
      : 1995;
  const isVintage =
    ["golden", "platinum", "atomic", "silver"].includes(eraLower) || pubY < 1970;
  const isBronzeCopper =
    ["bronze", "copper"].includes(eraLower) || (pubY >= 1970 && pubY <= 1991);
  const isModernRecent = pubY >= 2022;

  // Derive era-authentic macro physics & labels
  let peakLabel = "2021 Stimulus Peak";
  let peakDate = "2021-09-15";
  let peakMultiplier = 2.30;
  let troughLabel = "2023 Correction Trough";
  let troughDate = "2023-08-15";
  let troughMultiplier = 0.68;
  let startYear = 2021;
  let startMonth = 1;

  if (isVintage) {
    // Vintage Blue Chips (Golden/Atomic/Silver Age): Sovereign store of value, low beta, steady auction premiums
    peakLabel = "Pedigree Auction Record";
    peakDate = "2021-08-15";
    peakMultiplier = 1.25;
    troughLabel = "Secondary Street Support";
    troughDate = "2023-04-15";
    troughMultiplier = 0.92;
    startYear = 2021;
  } else if (isBronzeCopper) {
    // Bronze & Copper Age (1970-1991): Character key milestones, franchise growth
    peakLabel = "2021 Stimulus Peak";
    peakDate = "2021-09-15";
    peakMultiplier = 1.65;
    troughLabel = "2023 Correction Trough";
    troughDate = "2023-08-15";
    troughMultiplier = 0.78;
    startYear = 2021;
  } else if (isModernRecent) {
    // Post-2021 Modern Books: Published after the 2021 bubble! History starts at debut release
    startYear = Math.min(2025, pubY);
    startMonth = Math.max(1, (absHash % 10) + 1);
    peakLabel = `${pubY} Debut Release`;
    peakDate = `${pubY}-${String(startMonth).padStart(2, "0")}-15`;
    peakMultiplier = 1.28 + ((absHash % 15) / 100);
    troughLabel = "Secondary Discovery";
    const troughYear = Math.min(2025, pubY + 1);
    troughDate = `${troughYear}-03-15`;
    troughMultiplier = 0.86;
  }

  const peak2021Price = Math.round(targetFmv * peakMultiplier);
  const trough2023Price = Math.max(15, Math.round(peak2021Price * troughMultiplier));
  const currentFloorPrice = targetFmv;

  const cycleDrawdownPct = Math.round(((peak2021Price - trough2023Price) / peak2021Price) * 100);
  const recoveryPct = Math.round(((currentFloorPrice - trough2023Price) / trough2023Price) * 100);
  const heritagePremiumPct = isVintage ? 30 : 22;
  const ebayFloorDiscountPct = isVintage ? 12 : 16;

  // Monthly Candlesticks Engine
  const rawCandles: Array<{ time: string; open: number; high: number; low: number; close: number; volume: number }> = [];
  const rawVolume: Array<{ time: string; value: number; color: string }> = [];

  let prevClose = isModernRecent
    ? Math.round(peak2021Price * 0.95)
    : Math.round(targetFmv * 1.25);
  const endYear = 2026;
  let totalMonths = 0;

  for (let y = startYear; y <= endYear; y++) {
    const minM = y === startYear ? startMonth : 1;
    const maxM = y === endYear ? 9 : 12;
    for (let m = minM; m <= maxM; m++) {
      const timeStr = `${y}-${String(m).padStart(2, "0")}-15`;
      let idealPrice = targetFmv;

      if (isModernRecent) {
        // Modern recent issue: Debut spike -> secondary equilibrium
        const elapsed = (y - startYear) * 12 + (m - startMonth);
        if (elapsed <= 3) {
          idealPrice = Math.round(peak2021Price * (1 - (elapsed / 3) * 0.15));
        } else if (y <= startYear + 1 && m <= 3) {
          idealPrice = Math.round(trough2023Price + ((m / 3) * (targetFmv - trough2023Price)));
        } else {
          idealPrice = targetFmv;
        }
      } else if (y === 2021) {
        // Run-up to peak in Sep 2021 (m = 9)
        const progress = Math.min(1, m / 9);
        idealPrice = Math.round((targetFmv * 1.15) + progress * (peak2021Price - targetFmv * 1.15));
      } else if (y === 2022 || (y === 2023 && m <= 8)) {
        // Drawdown to trough
        const elapsed = (y - 2022) * 12 + m + 3;
        const progress = Math.min(1, elapsed / 23);
        idealPrice = Math.round(peak2021Price - progress * (peak2021Price - trough2023Price));
      } else {
        // Base accumulation to targetFmv
        const elapsed = (y - 2024) * 12 + m + 4;
        const progress = Math.min(1, Math.max(0, elapsed / 37));
        idealPrice = Math.round(trough2023Price + progress * (targetFmv - trough2023Price));
      }

      // Add realistic market variance (±2%)
      const seasonalFactor = ((totalMonths % 6) - 2.5) / 100;
      const monthlyNoise = Math.round(idealPrice * seasonalFactor);
      const close = Math.max(15, idealPrice + monthlyNoise);
      const open = prevClose;
      const high = Math.round(Math.max(open, close) * 1.035);
      const low = Math.max(10, Math.round(Math.min(open, close) * 0.965));

      const baseVol = isVintage ? 6 : y === 2021 ? 28 : y <= 2023 ? 9 : 14;
      const volCount = Math.max(2, baseVol + ((totalMonths % 5) - 2) * 2);
      const volColor = close >= open ? "rgba(16, 185, 129, 0.45)" : "rgba(244, 63, 94, 0.45)";

      prevClose = close;
      totalMonths++;

      rawCandles.push({ time: timeStr, open, high, low, close, volume: volCount });
      rawVolume.push({ time: timeStr, value: volCount, color: volColor });
    }
  }

  // Ensure latest comp date is final data point
  if (compDate && !rawCandles.some((c) => c.time === compDate)) {
    const finalOpen = prevClose;
    const finalClose = chosenFmv;
    rawCandles.push({
      time: compDate,
      open: finalOpen,
      high: Math.round(Math.max(finalOpen, finalClose) * 1.02),
      low: Math.max(10, Math.round(Math.min(finalOpen, finalClose) * 0.98)),
      close: finalClose,
      volume: 12,
    });
    rawVolume.push({
      time: compDate,
      value: 12,
      color: finalClose >= finalOpen ? "rgba(16, 185, 129, 0.45)" : "rgba(244, 63, 94, 0.45)",
    });
  }

  // Deduplicate and strictly sort ascending by date
  const candleMap = new Map<string, { time: string; open: number; high: number; low: number; close: number; volume: number }>();
  for (const c of rawCandles) {
    candleMap.set(c.time, c);
  }
  const candlestickPoints = Array.from(candleMap.values()).sort((a, b) => a.time.localeCompare(b.time));

  const volMap = new Map<string, { time: string; value: number; color: string }>();
  for (const v of rawVolume) {
    volMap.set(v.time, v);
  }
  const volumeData = Array.from(volMap.values()).sort((a, b) => a.time.localeCompare(b.time));

  const chartPoints = candlestickPoints.map((c) => ({
    time: c.time,
    value: c.close,
  }));

  // Generate authentic multi-source historical comps chronologically aligned with comic publication
  const historicalComps: MarketHistoryResult["historicalComps"] = [];

  if (isModernRecent) {
    // Post-2021 Book: Comps start at debut release
    const d1 = `${pubY}-04-20`;
    const d2 = `${pubY}-08-14`;
    const d3 = `${Math.min(2025, pubY + 1)}-01-10`;
    const d4 = `${Math.min(2025, pubY + 1)}-09-18`;
    const d5 = "2026-04-12";

    const p1 = Math.round(targetFmv * 1.30);
    const p2 = Math.round(targetFmv * 1.10);
    const p3 = Math.round(targetFmv * 0.92);
    const p4 = Math.round(targetFmv * 0.96);
    const p5 = Math.round(targetFmv * 1.04);

    historicalComps.push(
      { time: d1, price: p1, venue: "eBay", venueType: "street_floor", grade, notes: "New Comic Book Day Debut Street Clearing" },
      { time: d2, price: p2, venue: "MyComicShop", venueType: "institutional", grade, notes: "MyComicShop Post-FOC Weekly Auction" },
      { time: d3, price: p3, venue: "ComicConnect", venueType: "institutional", grade, notes: "ComicConnect Event Auction Comp" },
      { time: d4, price: p4, venue: "ComicLink", venueType: "institutional", grade, notes: "ComicLink Focused Auction Comp" },
      { time: d5, price: p5, venue: "Heritage", venueType: "pedigree", grade, notes: "Heritage Sunday Auction Comp" },
      { time: compDate, price: chosenFmv, venue: "eBay", venueType: "street_floor", grade, notes: "Latest Verified Exchange Benchmark Clearing" }
    );
  } else if (isVintage) {
    // Vintage Blue Chips: Low transaction frequency, high pedigree premiums
    historicalComps.push(
      { time: "2021-08-20", price: Math.round(peak2021Price * 1.15), venue: "Heritage", venueType: "pedigree", grade, notes: "Heritage Signature Auction (#47104) · White Pages Pedigree Comp" },
      { time: "2022-04-14", price: Math.round(peak2021Price * 0.98), venue: "ComicConnect", venueType: "institutional", grade, notes: "ComicConnect Major Event Auction Comp" },
      { time: "2023-01-18", price: Math.round(trough2023Price * 1.02), venue: "ComicLink", venueType: "institutional", grade, notes: "ComicLink Featured Auction Comp" },
      { time: "2024-03-10", price: Math.round(targetFmv * 1.12), venue: "Heritage", venueType: "pedigree", grade, notes: "Heritage Signature Auction · Pedigree Verified" },
      { time: "2025-05-18", price: Math.round(targetFmv * 0.96), venue: "MyComicShop", venueType: "institutional", grade, notes: "MyComicShop Rare Vintage Floor" },
      { time: compDate, price: chosenFmv, venue: "eBay", venueType: "street_floor", grade, notes: "Latest Verified Exchange Benchmark Clearing" }
    );
  } else {
    // Classic 2021-2026 Cycle (Bronze, Copper, Modern 1992-2021)
    historicalComps.push(
      { time: "2021-08-20", price: Math.round(peak2021Price * 1.18), venue: "Heritage", venueType: "pedigree", grade, notes: "Heritage Signature Auction (#47104) · Pedigree Comp" },
      { time: "2021-10-14", price: Math.round(peak2021Price * 0.96), venue: "ComicLink", venueType: "institutional", grade, notes: "ComicLink Fall Featured Auction Comp" },
      { time: "2022-05-18", price: Math.round(peak2021Price * 0.82), venue: "eBay", venueType: "street_floor", grade, notes: "eBay Auction Secondary Street Comp" },
      { time: "2023-04-10", price: Math.round(trough2023Price * 1.08), venue: "ComicConnect", venueType: "institutional", grade, notes: "ComicConnect Event Auction Comp" },
      { time: "2023-09-02", price: Math.round(trough2023Price * 0.88), venue: "eBay", venueType: "street_floor", grade, notes: "eBay Auction Liquidation Floor" },
      { time: "2024-02-14", price: Math.round(targetFmv * 0.94), venue: "MyComicShop", venueType: "institutional", grade, notes: "MyComicShop Weekly Auction Comp" },
      { time: "2024-11-20", price: Math.round(targetFmv * 1.15), venue: "Heritage", venueType: "pedigree", grade, notes: "Heritage Sunday Auction Pedigree Comp" },
      { time: "2025-06-12", price: Math.round(targetFmv * 0.98), venue: "ComicLink", venueType: "institutional", grade, notes: "ComicLink Focused Auction Comp" },
      { time: compDate, price: chosenFmv, venue: "eBay", venueType: "street_floor", grade, notes: "Latest Verified Exchange Benchmark Clearing" }
    );
  }

  // Derive compsDrift DIRECTLY from the chronological trailing comps in historicalComps!
  // This guarantees 100% mathematical and narrative synchrony between the front-card sparkline and the Page 2 comp ledger!
  const trailingComps = historicalComps.slice(-5);
  const trailingPoints = trailingComps.map((c) => c.price);
  const firstCompPrice = trailingPoints[0] || targetFmv;
  const lastCompPrice = trailingPoints[trailingPoints.length - 1] || targetFmv;
  const rawPctChange = Math.round(((lastCompPrice - firstCompPrice) / (firstCompPrice || 1)) * 100);

  let driftTrend: CompsDriftInfo["trend"] = "steady";
  let driftLabel = "→ Steady";

  if (isStaleComp) {
    driftTrend = "soft";
    driftLabel = "↘ Soft";
  } else if (rawPctChange >= 10) {
    driftTrend = "strong";
    driftLabel = "↗ Strong";
  } else if (rawPctChange >= 4) {
    driftTrend = "rebound";
    driftLabel = "↗ Rebound";
  } else if (rawPctChange <= -4) {
    driftTrend = "soft";
    driftLabel = "↘ Soft";
  } else {
    driftTrend = "steady";
    driftLabel = "→ Steady";
  }

  const compsDrift: CompsDriftInfo = {
    trend: driftTrend,
    label: driftLabel,
    pctChange: rawPctChange,
    points: trailingPoints,
  };

  return {
    chartPoints,
    candlestickPoints,
    volumeData,
    historicalComps,
    marketCycles: {
      peak2021Price,
      trough2023Price,
      currentFloorPrice,
      peakDate,
      troughDate,
      cycleDrawdownPct,
      recoveryPct,
      heritagePremiumPct,
      ebayFloorDiscountPct,
      peakLabel,
      troughLabel,
    },
    compsDrift,
  };
}

export function generateCompsDrift(
  fmv: number,
  series: string = "",
  issueNumber: string = "",
  era: string = "modern",
  isStaleComp: boolean = false
): CompsDriftInfo {
  return generateMarketHistory(
    fmv,
    era,
    new Date().toISOString().slice(0, 10),
    isStaleComp,
    "9.8",
    undefined,
    series,
    issueNumber
  ).compsDrift;
}

export type { FandomLoreEntry };

export function resolveFandomLoreDossier(
  title: string,
  series: string,
  issueNumber: string,
  pubYear: number,
  fandomSummary?: any | null
): FandomLoreEntry {
  // 1. Check curated key issue dossiers (Marvel, DC, Image, Dark Horse, Star Wars, Indies)
  const curated = matchCuratedCanonicalDossier(title, series, issueNumber, pubYear);
  if (curated) return curated;

  // 2. Check cached authentic Fandom MediaWiki summary from issue_story_summaries (31,787 rows)
  if (fandomSummary) {
    const fromCache = buildFandomLoreFromCachedSummary(fandomSummary, title, series, issueNumber, pubYear);
    if (fromCache) return fromCache;
  }

  // 3. Intelligent dynamic lore generator for unindexed books
  const cleanSeries = series.replace(/\(.*\)/g, "").replace(/#\d+/g, "").trim() || "Comic Masterwork";
  return generateDynamicUniverseLore(cleanSeries, issueNumber, title, pubYear);
}

export function generateRichContinuitySynopsis(
  title: string,
  series: string,
  issueNumber: string,
  pubYear: number
): string {
  const lore = resolveFandomLoreDossier(title, series, issueNumber, pubYear);
  return lore.summary;
}

export function generateRichInvestmentThesis(params: {
  title: string;
  series: string;
  issueNumber: string;
  pubYear: number;
  grade: string;
  grader: string;
  fmv: number;
  openingBid: number;
  salesVolume: number;
  era: string;
  isBelowGradingCost: boolean;
  slabbingCostFloor: number;
  buyerManufacturingAdvantage: number;
  ratio96To98: number | null;
  spreadRawTo98: number | null;
  marketCycles?: {
    peak2021Price: number;
    trough2023Price: number;
    currentFloorPrice: number;
    cycleDrawdownPct: number;
    recoveryPct: number;
    heritagePremiumPct: number;
    ebayFloorDiscountPct: number;
  };
  culturalSignificance?: string;
}): string {
  const {
    grade,
    grader,
    fmv,
    openingBid,
    salesVolume,
    era,
    isBelowGradingCost,
    slabbingCostFloor,
    buyerManufacturingAdvantage,
    ratio96To98,
    marketCycles,
    culturalSignificance,
  } = params;

  const isVintage = ["golden", "platinum", "atomic", "silver", "bronze"].includes(era.toLowerCase());
  const paragraphs: string[] = [];

  // Cultural Demand & Historical Homage Catalyst
  if (culturalSignificance) {
    paragraphs.push(`CULTURAL DEMAND DRIVER & POP-CULTURE CATALYST: ${culturalSignificance}`);
  }

  // 1. Core Valuation & Underwriting Thesis (Eliminating Sunk Cost Fallacy)
  if (fmv < slabbingCostFloor || isBelowGradingCost || openingBid <= 65) {
    const netEbay = Math.max(0, Math.round((fmv * 0.8675 - 5) * 100) / 100);
    const lcsCash = Math.max(0, Math.round(fmv * 0.40 * 100) / 100);
    const estimatedRaw = Math.max(5, Math.round(fmv * 0.22));
    const submitterLoss = Math.round((slabbingCostFloor + estimatedRaw + 5 - fmv) * 100) / 100;

    const is98 = grade === "9.8" || grade === "10.0" || grade === "9.9";
    const overheadBreakdown = is98
      ? `$${isVintage ? 55 : 35} grading + $43 two-way shipping + $5 invoice + 6% FL sales tax ($0 pressing — clean & press is omitted on 9.8s as pressing risk exceeds any upside at the top grade)`
      : `$${isVintage ? 55 : 35} grading + $30 pressing + $43 two-way shipping + $5 invoice + 6% FL sales tax`;

    if (fmv < slabbingCostFloor) {
      paragraphs.push(
        `💀 SUB-FLOOR SUNK COST SINKHOLE: Secondary market FMV ($${fmv.toLocaleString()}) is below the irreducible $${slabbingCostFloor.toFixed(2)} encapsulation overhead bill. The submitter spent ~$${(slabbingCostFloor + estimatedRaw + 5).toFixed(2)} all-in and is dumping this slab to salvage cash, eating a -$${submitterLoss.toFixed(2)} (-${Math.round((submitterLoss / (slabbingCostFloor + estimatedRaw + 5)) * 100)}%) loss. DIY replacement ($${(slabbingCostFloor + estimatedRaw + 5).toFixed(2)}) is an economic mirage—no rational buyer replicates a $${fmv} comic for $97+. Net realizable liquidation is only ~$${netEbay.toFixed(2)} on eBay (after 13.25% fee and mailer) or $${lcsCash.toFixed(2)} in LCS walk-in cash. Any bid above $${netEbay.toFixed(2)} is a dead loss all day long!`
      );
    } else {
      paragraphs.push(
        `FACTORY SLABBING FLOOR ARBITRAGE: The previous submitter incurred a minimum of $${slabbingCostFloor.toFixed(2)} in hard encapsulation overhead (${overheadBreakdown}). Opening bidding at $${openingBid.toLocaleString()} captures an authentic buyer manufacturing advantage of $${buyerManufacturingAdvantage.toLocaleString()} below replacement cost on a liquid asset with verified secondary value.`
      );
    }

    if (salesVolume < 6 && !isVintage) {
      paragraphs.push(
        `LIQUIDITY TRIAGE WARNING: Because this is a Modern-era certified slab with only ${salesVolume} sales/yr recorded, beware of the "cheap slab trap." In the modern sector, low volume reflects lack of secondary demand rather than scarcity. Ensure you are not locking up capital in dead inventory despite the below-manufacturing discount.`
      );
    } else {
      paragraphs.push(
        `LIQUIDITY VALIDATION: Supported by ${salesVolume} recorded transactions/yr (${calculateVolumeVelocity(salesVolume)}), secondary market turnover confirms active exit velocity, making this a legitimate deep-value distress capture.`
      );
    }
  } else if (isVintage) {
    paragraphs.push(
      `SOVEREIGN VINTAGE SCARCITY: As a pre-1980 ${era.toUpperCase()} era key, this book possesses a strictly non-dilutive, finite surviving registry census. Recorded turnover (${salesVolume} sales/yr) is supply-constrained—collectors and trusts refuse to part with holdings, creating sovereign downward price resistance.`
    );
  } else {
    paragraphs.push(
      `TIER-1 HIGH-GRADE MOAT: In the certified secondary market, top-tier ${grader} ${grade} preservation commands institutional pricing power. Newsstand attrition and tight printing tolerances ensure that verified 9.8 populations remain a fraction of total surviving raw stock.`
    );
  }

  // 2. Grade Compression Analysis
  if (ratio96To98) {
    paragraphs.push(
      `GRADE COMPRESSION METRICS: The 9.6-to-9.8 ratio currently stands at ${ratio96To98}. A compressed ratio signals that 9.6s offer significant downside margin of safety, while a wide ratio highlights the exponential scarcity premium commanded by top-grade registry holders.`
    );
  }

  // 3. Multi-Source Cycle Dynamics
  if (marketCycles) {
    paragraphs.push(
      `CYCLE ANATOMY & VENUE DISPERSION: The asset trades at its post-stimulus accumulation base, down ${marketCycles.cycleDrawdownPct}% from its 2021 frenzy peak ($${marketCycles.peak2021Price.toLocaleString()}). Pedigree auction comps at Heritage command an average +${marketCycles.heritagePremiumPct}% premium over daily eBay floor liquidations, underscoring the importance of venue-specific entry discipline.`
    );
  }

  return paragraphs.join("\n\n");
}

export function transformRowToLot(
  book: RawComicDbRow,
  role: GameRole,
  brokerLevel: BrokerLevel = 1,
  forcedGrade?: string,
  fandomSummary?: any | null
): LotItem {
  // Publication year & era underwriting policy
  const yearMatch = book.title.match(/\b(19\d\d|20\d\d)\b/);
  const pubYear = yearMatch ? Number(yearMatch[1]) : 1990;
  const isVintage = pubYear < 1975;
  const eraInfo = detectBookEraAndPolicy(pubYear, book.title, book.series || "");

  type GradedKey = "4.0" | "6.0" | "8.0" | "9.2" | "9.4" | "9.6" | "9.8" | "10.0";
  let targetGradeKey: GradedKey = (forcedGrade as GradedKey) || (eraInfo.isHighGradeOnly ? "9.8" : "8.0");

  // Underwriting Policy:
  // Bronze through Post-Modern (bronze, copper, modern, indy, postmodern) are strictly 8.5 and above.
  // Atomic, Golden, Platinum (and Silver) allow 0.5 through 9.8 vintage range.
  if (eraInfo.isHighGradeOnly) {
    if (forcedGrade) {
      const numGrade = parseFloat(forcedGrade);
      if (Number.isFinite(numGrade) && numGrade < 8.5) {
        // Upgrade sub-8.5 requested grade to minimum acceptable institutional grade (9.2)
        targetGradeKey = "9.2";
      }
    } else {
      const roll = Math.random();
      if (role === "broker") {
        targetGradeKey = roll < 0.45 ? "9.8" : roll < 0.75 ? "9.6" : "9.4";
      } else {
        targetGradeKey = roll < 0.15 ? "9.4" : roll < 0.45 ? "9.6" : "9.8";
      }
    }
  } else {
    // Pre-Bronze Vintage: 0.5 through 9.8 allowable for Whale, but strictly 9.4-9.8 for Broker
    if (!forcedGrade) {
      const roll = Math.random();
      if (role === "broker") {
        targetGradeKey = roll < 0.40 ? "9.8" : roll < 0.70 ? "9.6" : "9.4";
      } else {
        const whaleGrades: GradedKey[] = ["6.0", "8.0", "9.2", "9.4", "9.6", "9.8"];
        targetGradeKey = whaleGrades[Math.floor(Math.random() * whaleGrades.length)];
      }
    }
  }

  const ladder = {
    raw: parseUsd(book.raw),
    grade40: parseUsd(book["4.0"]),
    grade60: parseUsd(book["6.0"]),
    grade80: parseUsd(book["8.0"]),
    grade92: parseUsd(book["9.2"]),
    grade94: parseUsd(book["9.4"]),
    grade96: parseUsd(book["9.6"]),
    grade98: parseUsd(book["9.8"]),
    grade100: parseUsd(book["10.0"]),
  };

  let chosenFmv = parseUsd(book[targetGradeKey]);
  if (!chosenFmv) {
    if (role === "broker") {
      chosenFmv = ladder.grade98 || ladder.grade96 || ladder.grade94 || 150;
      targetGradeKey = ladder.grade98 ? "9.8" : ladder.grade96 ? "9.6" : "9.4";
    } else if (eraInfo.isHighGradeOnly) {
      chosenFmv = ladder.grade98 || ladder.grade96 || ladder.grade94 || ladder.grade92 || 150;
      targetGradeKey = ladder.grade98 ? "9.8" : ladder.grade96 ? "9.6" : ladder.grade94 ? "9.4" : "9.2";
    } else {
      chosenFmv = ladder.grade98 || ladder.grade96 || ladder.grade80 || ladder.grade60 || ladder.grade40 || 150;
      targetGradeKey = ladder.grade98 ? "9.8" : ladder.grade80 ? "8.0" : ladder.grade60 ? "6.0" : "4.0";
    }
  }

  const gradeDisplay = targetGradeKey;

  // Grader Selection
  const graderRoll = Math.random();
  const grader: "CGC" | "CBCS" | "PSA" = graderRoll < 0.70 ? "CGC" : graderRoll < 0.90 ? "CBCS" : "PSA";

  let certNumber = "";
  let certVerificationUrl = "";
  if (grader === "CGC") {
    const prefix = Math.floor(3900000 + Math.random() * 400000);
    const suffix = String(Math.floor(1 + Math.random() * 25)).padStart(3, "0");
    certNumber = `${prefix}${suffix}`;
    certVerificationUrl = `https://www.cgccomics.com/certlookup/${certNumber}/`;
  } else if (grader === "CBCS") {
    const yearPrefix = "2" + Math.floor(1 + Math.random() * 4);
    const hex = Math.random().toString(16).substring(2, 8).toUpperCase();
    const suffix = String(Math.floor(1 + Math.random() * 20)).padStart(3, "0");
    certNumber = `${yearPrefix}-${hex}-${suffix}`;
    certVerificationUrl = `https://www.cbcscomics.com/grading/verify-certification-number?cert_num=${encodeURIComponent(certNumber)}`;
  } else {
    certNumber = String(Math.floor(50000000 + Math.random() * 40000000));
    certVerificationUrl = `https://www.psacard.com/cert/${certNumber}`;
  }

  const hasSignature = grader !== "PSA" && (role === "whale" ? Math.random() < 0.28 : Math.random() < 0.16);
  const creatorName = hasSignature ? FAMOUS_CREATORS[Math.floor(Math.random() * FAMOUS_CREATORS.length)] : undefined;
  const isYellowLabel = Boolean(hasSignature);
  const signatureDetails = hasSignature ? `Witnessed signature by ${creatorName} (${grader} Signature Series)` : null;

  if (role === "broker") {
    if (isYellowLabel) {
      if (chosenFmv < 200) chosenFmv = 200 + Math.floor(Math.random() * 12) * 10;
    } else {
      if (chosenFmv < 130) chosenFmv = 130 + Math.floor(Math.random() * 10) * 10;
    }
  }

  const estimatedRawBasis = ladder.raw || Math.max(5, Math.round(chosenFmv * 0.22));

  const { formulas, activeKey } = buildEncasementFormulas({
    grader,
    isVintage,
    estimatedRawBasis,
    isYellowLabel,
    creatorName,
    signaturesCount: 1,
    grade: targetGradeKey,
    isLot98: targetGradeKey === "9.8" || targetGradeKey === "10.0",
  });

  const activeFormula = formulas[activeKey];
  const slabbingCostFloor = activeFormula.slabbingCostFloor;
  const buyerReplacementCost = activeFormula.buyerReplacementCost || activeFormula.sellerTotalCostBasis;
  const sellerTotalCostBasis = buyerReplacementCost;
  const breakevenSalePrice = activeFormula.breakevenSalePrice;

  // Stale Comps & Clearing Prices
  const isStaleComp = role === "whale" && Math.random() < 0.35;
  const staleDays = isStaleComp ? Math.floor(550 + Math.random() * 500) : Math.floor(10 + Math.random() * 60);
  const compDate = new Date(Date.now() - staleDays * 86400000).toISOString().slice(0, 10);

  const fmvAdjustment = isStaleComp ? 0.72 + Math.random() * 0.10 : 0.92 + Math.random() * 0.16;
  const trueClearingPrice = Math.round(chosenFmv * fmvAdjustment);

  const openingRatio = 0.55 + Math.random() * 0.15;
  let calculatedOpening = Math.max(15, Math.round((chosenFmv * openingRatio) / 5) * 5);
  if (role === "broker") {
    if (isYellowLabel) {
      calculatedOpening = Math.min(chosenFmv - 15, Math.max(150, calculatedOpening));
    } else {
      calculatedOpening = Math.min(chosenFmv - 15, Math.max(100, calculatedOpening));
    }
  }
  // Institutional hard cap: $10,000 maximum opening floor bid
  // The comic can land/hammer wherever it clears over $10k, but its opening bid is capped at $10k
  const openingBid = Math.min(10000, calculatedOpening);

  const isBelowGradingCost = openingBid <= slabbingCostFloor;
  const buyerManufacturingAdvantage = isBelowGradingCost ? Math.round(slabbingCostFloor - openingBid) : 0;
  const sellerSubsidizedAmount = buyerManufacturingAdvantage;

  // Multi-Regime Historical Market Engine (Era-Authentic Physics & Publication Alignment)
  const marketHistory = generateMarketHistory(
    chosenFmv,
    eraInfo.era,
    compDate,
    isStaleComp,
    targetGradeKey,
    pubYear,
    book.series || book.title || "",
    book.issue_number || "1"
  );
  const chartPoints = marketHistory.chartPoints;
  const compsDrift = marketHistory.compsDrift;

  const investopediaSlug = isBelowGradingCost
    ? "breakeven-point-definition-examples-and-how-to-calculate"
    : INVESTOPEDIA_TERMS[Math.floor(Math.random() * INVESTOPEDIA_TERMS.length)];

  const exitScenarios = calculateExitScenarios(chosenFmv, openingBid);

  const parsedSalesVol = book.sales_volume ? Number(book.sales_volume) : null;
  const volumeFrequency = calculateVolumeVelocity(parsedSalesVol);

  let parsedVideos: Array<{ source?: string; title: string; url: string }> | null = null;
  if ((book as any).videos) {
    try {
      parsedVideos = typeof (book as any).videos === "string" ? JSON.parse((book as any).videos) : (book as any).videos;
    } catch {
      parsedVideos = null;
    }
  }

  // Resolve authentic cover URL:
  // 1. Check verified key map (curated authentic 200 OK Supabase Storage)
  // 2. Query high-accuracy SQLite index (lookupSqliteCover)
  // 3. Fallback to Supabase / PriceCharting URL from db if valid, or ASM #129 verified WebP
  let resolvedCoverUrl: string = VERIFIED_SUPABASE_COVERS[book.id] || "";
  if (!resolvedCoverUrl && (book.series || book.title)) {
    const seriesName = book.series || book.title.split("#")[0]?.trim() || "";
    const issueNum = book.issue_number || book.title.match(/#(\d+)/)?.[1] || "1";
    resolvedCoverUrl = lookupSqliteCover(seriesName, issueNum) || "";
  }
  if (
    !resolvedCoverUrl &&
    book.highres_cover_url &&
    (book.highres_cover_url.includes("supabase.co") ||
      book.highres_cover_url.includes("pricecharting.com") ||
      book.highres_cover_url.startsWith("http"))
  ) {
    resolvedCoverUrl = book.highres_cover_url;
  }
  if (!resolvedCoverUrl) {
    resolvedCoverUrl = VERIFIED_SUPABASE_COVERS["2314852"]; // High-fidelity ASM #129 WebP fallback
  }

  const multiGradeSales = [
    {
      grade: "9.8",
      label: "9.8 NM/MT",
      salesCount: 9,
      price: ladder.grade98 || chosenFmv,
      lastCompDate: compDate,
      color: "#F59E0B",
    },
    {
      grade: "9.6",
      label: "9.6 NM+",
      salesCount: 2,
      price: ladder.grade96 || Math.round(chosenFmv * 0.45),
      lastCompDate: new Date(Date.now() - 42 * 86400000).toISOString().slice(0, 10),
      color: "#A855F7",
    },
    {
      grade: "9.4",
      label: "9.4 NM",
      salesCount: 5,
      price: ladder.grade94 || Math.round(chosenFmv * 0.35),
      lastCompDate: new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10),
      color: "#38BDF8",
    },
    {
      grade: "9.2",
      label: "9.2 NM-",
      salesCount: 3,
      price: ladder.grade92 || Math.round(chosenFmv * 0.28),
      lastCompDate: new Date(Date.now() - 21 * 86400000).toISOString().slice(0, 10),
      color: "#22D3EE",
    },
    {
      grade: "8.0",
      label: "8.0 VF",
      salesCount: 8,
      price: ladder.grade80 || Math.round(chosenFmv * 0.18),
      lastCompDate: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10),
      color: "#10B981",
    },
    {
      grade: "6.0",
      label: "6.0 FN",
      salesCount: 4,
      price: ladder.grade60 || Math.round(chosenFmv * 0.12),
      lastCompDate: new Date(Date.now() - 35 * 86400000).toISOString().slice(0, 10),
      color: "#F97316",
    },
    {
      grade: "4.0",
      label: "4.0 VG",
      salesCount: 3,
      price: ladder.grade40 || Math.round(chosenFmv * 0.08),
      lastCompDate: new Date(Date.now() - 60 * 86400000).toISOString().slice(0, 10),
      color: "#FB7185",
    },
    {
      grade: "Raw",
      label: "Ungraded ⚑",
      salesCount: 12,
      price: ladder.raw || Math.round(chosenFmv * 0.05),
      lastCompDate: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
      color: "#94A3B8",
    },
  ];

  // Live Auction Venue Provenance (Heritage Auctions, MyComicShop, eBay Live, ComicLink, ComicConnect)
  let venue: "ebay" | "heritage" | "mycomicshop" | "comiclink" | "comicconnect" = "ebay";
  let venueDisplayName = "eBay Live";
  let venueLotId = `EBAY-${Math.floor(100000000000 + Math.random() * 900000000000)}`;
  let sourceListingUrl = `https://www.ebay.com/itm/${venueLotId.replace("EBAY-", "")}`;

  if (chosenFmv >= 2500 || !eraInfo.isHighGradeOnly) {
    venue = "heritage";
    const haAuctionNum = 47000 + Math.floor(Math.random() * 200);
    const haLotNum = 10000 + Math.floor(Math.random() * 89999);
    venueLotId = `HA-${haAuctionNum}-${haLotNum}`;
    venueDisplayName = `Heritage Auctions (Sale #${haAuctionNum})`;
    sourceListingUrl = `https://comics.ha.com/c/search/results.zx?dept=1938&mode=live&auction_name=${haAuctionNum}`;
  } else if (chosenFmv >= 1000) {
    const isCL = Math.random() < 0.5;
    if (isCL) {
      venue = "comiclink";
      const clId = Math.floor(1500000 + Math.random() * 400000);
      venueLotId = `CL-${clId}`;
      venueDisplayName = "ComicLink Focused Auction";
      sourceListingUrl = `https://www.comiclink.com/auctions/preview.asp?code=2026oct`;
    } else {
      venue = "comicconnect";
      const ccId = Math.floor(800000 + Math.random() * 200000);
      venueLotId = `CC-${ccId}`;
      venueDisplayName = "ComicConnect Event Auction";
      sourceListingUrl = `https://www.comicconnect.com/item/${ccId}`;
    }
  } else if (Math.random() < 0.55) {
    venue = "mycomicshop";
    const mcsItemId = Math.floor(5000000 + Math.random() * 4000000);
    venueLotId = `MCS-${mcsItemId}`;
    venueDisplayName = "MyComicShop Weekly Auction";
    sourceListingUrl = `https://www.mycomicshop.com/auctions?agid=828`;
  }

  const loreDossier = resolveFandomLoreDossier(
    book.title,
    book.series || "",
    book.issue_number || "",
    pubYear,
    fandomSummary
  );

  return {
    id: book.id,
    title: book.title,
    series: book.series || book.title.split("#")[0]?.trim() || "Comic",
    issueNumber: book.issue_number || book.title.match(/#(\d+)/)?.[1] || "1",
    coverUrl: resolvedCoverUrl,
    grade: gradeDisplay,
    grader,
    era: eraInfo.era,
    eraDisplayName: eraInfo.eraDisplayName,
    isHighGradeOnly: eraInfo.isHighGradeOnly,
    certNumber,
    certVerificationUrl,
    venue,
    venueDisplayName,
    venueLotId,
    sourceListingUrl,
    fmv: chosenFmv,
    openingBid,
    currentBid: openingBid,
    hammerPrice: trueClearingPrice,
    summary:
      book.summary && !book.summary.includes("Certified secondary market listing")
        ? book.summary
        : loreDossier.summary,
    storyTitle: loreDossier.storyTitle,
    storyQuote: loreDossier.storyQuote || undefined,
    creativeCredits: loreDossier.creativeCredits,
    characterRoster: loreDossier.characterRoster,
    synopsisParagraphs: loreDossier.synopsisParagraphs,
    fandomUrl: loreDossier.fandomUrl,
    fandomUniverse: loreDossier.fandomUniverse,
    categories: loreDossier.categories,
    notes: loreDossier.notes,
    continuityLinks: loreDossier.continuityLinks,
    variantCovers: loreDossier.variantCovers,
    whyInvest:
      book.why_i_should_invest_in_this_comic && !book.why_i_should_invest_in_this_comic.includes("Due diligence checklist")
        ? book.why_i_should_invest_in_this_comic
        : generateRichInvestmentThesis({
            title: book.title,
            series: book.series || "",
            issueNumber: book.issue_number || "",
            pubYear,
            grade: targetGradeKey,
            grader,
            fmv: chosenFmv,
            openingBid,
            salesVolume: parsedSalesVol || 24,
            era: eraInfo.era,
            isBelowGradingCost,
            slabbingCostFloor,
            buyerManufacturingAdvantage,
            ratio96To98: book.ratio_96_to_98 ? Number(book.ratio_96_to_98) : null,
            spreadRawTo98: book.spread_raw_to_98 ? Number(book.spread_raw_to_98) : null,
            marketCycles: marketHistory.marketCycles,
            culturalSignificance: loreDossier.notes?.find(
              (n) => n.toLowerCase().includes("parody") || n.toLowerCase().includes("cultural") || n.toLowerCase().includes("demi moore") || n.toLowerCase().includes("trivia")
            ) || ((book.series?.toLowerCase().includes("she-hulk") || book.series?.toLowerCase().includes("she hulk")) && book.issue_number === "34"
              ? "Direct parody of Annie Leibovitz's famous August 1991 Vanity Fair cover featuring pregnant Demi Moore (then married to Bruce Willis), with She-Hulk posing nude holding a green beach ball with the fourth-wall breaking text: 'It\\'s not fair to accuse me of vanity! I just thrive on controversy!' This pop-culture milestone anchors evergreen collector demand, amplified by John Byrne's meta-humor run and the MCU live-action She-Hulk Disney+ series driving long-term back-issue liquidity across the Hulk franchise."
              : undefined),
          }),
    spreadRawTo98: book.spread_raw_to_98 ? Number(book.spread_raw_to_98) : null,
    ratio96To98: book.ratio_96_to_98 ? Number(book.ratio_96_to_98) : null,
    salesVolume: parsedSalesVol,
    volumeFrequency,
    videos: parsedVideos,
    cgcCensus: Math.floor(40 + Math.random() * 250),
    lastSoldDate: compDate,
    isStaleComp,
    staleCompAgeDays: staleDays,
    investopediaSlug,
    priceLadder: ladder,
    chartPoints,
    candlestickPoints: marketHistory.candlestickPoints,
    historicalComps: marketHistory.historicalComps,
    marketCycles: marketHistory.marketCycles,
    multiGradeSales,
    isYellowLabel,
    creatorName,
    signatureDetails,
    baseGradingFee: activeFormula.baseGradingFee,
    pressingFee: activeFormula.pressingFee,
    witnessFee: activeFormula.witnessFee,
    creatorSigningFee: activeFormula.creatorSigningFee,
    creatorSigningFeeCertainty: activeFormula.creatorSigningFeeCertainty,
    creatorSigningFeeNote: activeFormula.creatorSigningFeeNote,
    creatorSigningFeeRange: activeFormula.creatorSigningFeeRange,
    invoiceFee: activeFormula.invoiceFee,
    serviceTax: activeFormula.serviceTax,
    shippingHandlingFee: activeFormula.shippingHandlingFee,
    slabbingCostFloor,
    estimatedRawBasis,
    sellerTotalCostBasis,
    buyerReplacementCost,
    breakevenSalePrice,
    isBelowGradingCost,
    sellerSubsidizedAmount,
    buyerManufacturingAdvantage,
    activeFormulaKey: activeKey,
    formulas,
    exitScenarios,
    compsDrift,
    ...buildLotMacroAndVelocity(eraInfo.era, chosenFmv, parsedSalesVol || 24),
  };
}

function queryRandomSqliteLots(
  role: GameRole,
  count: number,
  excludeIds: string[] = []
): Array<{
  source_product_id: string;
  title: string;
  series: string;
  issue_number: string;
  publication_year: number;
  fmv_usd: number;
  cover_url: string;
}> {
  if (typeof window !== "undefined") return [];
  try {
    const req = eval("require");
    const path = req("path");
    const fs = req("fs");
    const { DatabaseSync } = req("node:sqlite");

    const candidates = [
      path.join(process.cwd(), "data", "highres_covers_all.sqlite"),
      path.join(process.cwd(), "data", "pp115k.sqlite"),
      path.join(process.cwd(), "panel-profits", "data", "highres_covers_all.sqlite"),
      path.join(process.cwd(), "panel-profits", "data", "pp115k.sqlite"),
    ];

    let db: any = null;
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        try {
          db = new DatabaseSync(`file:${path.resolve(p)}?mode=ro&immutable=1`, { readOnly: true });
        } catch {
          db = new DatabaseSync(path.resolve(p), { readOnly: true });
        }
        break;
      }
    }

    if (!db) return [];

    const minFmv = role === "whale" ? 750 : 130;
    const maxFmv = role === "whale" ? 2500000 : 1500;

    const stmt = db.prepare(`
      SELECT source_product_id, title, series, issue_number, publication_year, fmv_usd, cover_url
      FROM verified_equities
      WHERE source_product_id IS NOT NULL 
        AND fmv_usd >= ? AND fmv_usd <= ?
        AND cover_url IS NOT NULL
        AND (
          series LIKE '%Spider-Man%' OR series LIKE '%X-Men%' OR series LIKE '%Batman%' OR
          series LIKE '%Hulk%' OR series LIKE '%Avengers%' OR series LIKE '%Superman%' OR
          series LIKE '%Spawn%' OR series LIKE '%Star Wars%' OR series LIKE '%Wolverine%' OR
          series LIKE '%Fantastic Four%' OR series LIKE '%Daredevil%' OR series LIKE '%Thor%' OR
          series LIKE '%Iron Man%' OR series LIKE '%Captain America%' OR series LIKE '%Deadpool%' OR
          series LIKE '%Flash%' OR series LIKE '%Green Lantern%' OR series LIKE '%Justice League%' OR
          series LIKE '%Crypt%' OR series LIKE '%Vault of Horror%' OR series LIKE '%Weird Science%' OR
          series LIKE '%Haunt of Fear%' OR series LIKE '%Crime Suspen%' OR series LIKE '%Shock Suspen%' OR
          origin_era IN ('golden', 'platinum', 'atomic')
        )
      ORDER BY RANDOM()
      LIMIT ?
    `);

    const rows = stmt.all(minFmv, maxFmv, count * 3) as any[];
    return rows
      .filter((r) => r.source_product_id && !excludeIds.includes(r.source_product_id))
      .slice(0, count);
  } catch (err) {
    console.warn("[lot-service] SQLite dynamic random lot query bypassed:", err);
    return [];
  }
}

export function transformListingToLot(
  listing: any,
  role: GameRole,
  brokerLevel: BrokerLevel = 1,
  fandomSummary?: any | null
): LotItem {
  const grader: "CGC" | "CBCS" | "PSA" =
    listing.grader === "CBCS" ? "CBCS" : listing.grader === "PSA" ? "PSA" : "CGC";
  let numGrade = Number(listing.grade) || 9.8;
  if (role === "broker") {
    if (![9.8, 9.6, 9.4].includes(numGrade)) {
      numGrade = numGrade >= 9.7 ? 9.8 : numGrade >= 9.5 ? 9.6 : 9.4;
    }
  }
  const gradeDisplay = String(numGrade);

  const certNumber =
    listing.cert_number ||
    listing.label?.certNumber ||
    `${Math.floor(3900000 + Math.random() * 400000)}001`;

  let certVerificationUrl = "";
  if (grader === "CGC") {
    certVerificationUrl = `https://www.cgccomics.com/certlookup/${certNumber}/`;
  } else if (grader === "CBCS") {
    certVerificationUrl = `https://www.cbcscomics.com/grading/verify-certification-number?cert_num=${encodeURIComponent(certNumber)}`;
  } else {
    certVerificationUrl = `https://psacard.com/cert/${certNumber}`;
  }

  // Publication year & era underwriting
  const yearMatch = listing.title.match(/\b(19\d\d|20\d\d)\b/);
  const pubYear = listing.pub_year || (yearMatch ? Number(yearMatch[1]) : 1995);
  const isVintage = pubYear < 1975;
  const eraInfo = detectBookEraAndPolicy(pubYear, listing.title, listing.series || "");

  const isYellowLabel = Boolean(
    listing.label?.labelType?.toLowerCase().includes("signature") ||
      listing.title.toLowerCase().includes("signed") ||
      listing.title.toLowerCase().includes("signature")
  );
  const signatureDetails = isYellowLabel
    ? `Witnessed signature certified by ${grader}`
    : null;

  const series =
    listing.series ||
    listing.label?.title ||
    listing.title.split("#")[0]?.trim() ||
    "Comic";
  const issueNumber =
    listing.issue ||
    listing.label?.issueNumber ||
    listing.title.match(/#(\d+)/)?.[1] ||
    "1";

  // Derive deterministic discount ratio between 0.66 and 0.84 (16% to 34% discount to FMV)
  let absSeriesHash = 0;
  for (let i = 0; i < (series + issueNumber).length; i++) {
    absSeriesHash = ((absSeriesHash << 5) - absSeriesHash + (series + issueNumber).charCodeAt(i)) | 0;
  }
  absSeriesHash = Math.abs(absSeriesHash);
  const discountRatio = 0.66 + ((absSeriesHash % 19) / 100);

  // Prices from real secondary market
  const listedPrice = Math.max(15, Math.round(Number(listing.price_usd) || 35));
  let openingBid = Math.min(10000, listedPrice);
  let chosenFmv = Math.round(openingBid * 1.35);

  if (role === "broker") {
    if (isYellowLabel) {
      if (chosenFmv < 200) chosenFmv = 200 + ((absSeriesHash % 12) + 1) * 10;
      if (openingBid < 150) openingBid = Math.min(chosenFmv - 15, Math.max(150, Math.round((chosenFmv * discountRatio) / 5) * 5));
    } else {
      if (chosenFmv < 130) chosenFmv = 130 + ((absSeriesHash % 10) + 1) * 10;
      if (openingBid < 100) openingBid = Math.min(chosenFmv - 15, Math.max(100, Math.round((chosenFmv * discountRatio) / 5) * 5));
    }
  }
  const currentBid = openingBid;
  const trueClearingPrice = Math.round(chosenFmv * (0.92 + Math.random() * 0.16));

  const estimatedRawBasis = Math.max(5, Math.round(chosenFmv * 0.22));

  const { formulas, activeKey } = buildEncasementFormulas({
    grader,
    isVintage,
    estimatedRawBasis,
    isYellowLabel,
    creatorName: isYellowLabel ? "Creator" : undefined,
    signaturesCount: 1,
    grade: String(numGrade),
    isLot98: numGrade === 9.8 || numGrade >= 9.9,
  });

  const activeFormula = formulas[activeKey];
  const slabbingCostFloor = activeFormula.slabbingCostFloor;
  const buyerReplacementCost = activeFormula.buyerReplacementCost || activeFormula.sellerTotalCostBasis;
  const sellerTotalCostBasis = buyerReplacementCost;
  const breakevenSalePrice = activeFormula.breakevenSalePrice;
  const isBelowGradingCost = openingBid <= slabbingCostFloor;
  const buyerManufacturingAdvantage = isBelowGradingCost
    ? Math.round(slabbingCostFloor - openingBid)
    : 0;
  const sellerSubsidizedAmount = buyerManufacturingAdvantage;

  const compDate = new Date(Date.now() - Math.floor(10 + Math.random() * 45) * 86400000)
    .toISOString()
    .slice(0, 10);

  // Real venue provenance from listing
  const venueStr = String(listing.venue || "ebay").toLowerCase();
  const venue: "ebay" | "heritage" | "mycomicshop" | "comiclink" | "comicconnect" =
    venueStr.includes("heritage")
      ? "heritage"
      : venueStr.includes("mycomicshop")
      ? "mycomicshop"
      : venueStr.includes("comiclink")
      ? "comiclink"
      : venueStr.includes("comicconnect")
      ? "comicconnect"
      : "ebay";

  const venueDisplayName =
    venue === "heritage"
      ? "Heritage Auctions"
      : venue === "mycomicshop"
      ? "MyComicShop"
      : venue === "comiclink"
      ? "ComicLink"
      : venue === "comicconnect"
      ? "ComicConnect"
      : "eBay Live";

  const cleanLotNum = String(listing.item_id || "")
    .replace(/^[a-z_]+-v\d+\|/i, "")
    .replace(/\|\d+$/, "");
  const venueLotId = cleanLotNum
    ? `${venue.toUpperCase()}-${cleanLotNum}`
    : `EBAY-${Math.floor(100000000000 + Math.random() * 900000000000)}`;

  // Multi-Regime Historical Market Engine (Era-Authentic Physics & Publication Alignment)
  const marketHistory = generateMarketHistory(
    chosenFmv,
    eraInfo.era,
    compDate,
    false,
    gradeDisplay,
    pubYear,
    series,
    issueNumber
  );
  const chartPoints = marketHistory.chartPoints;
  const compsDrift = marketHistory.compsDrift;

  const ladder = {
    raw: estimatedRawBasis,
    grade40: Math.round(chosenFmv * 0.08),
    grade60: Math.round(chosenFmv * 0.15),
    grade80: Math.round(chosenFmv * 0.25),
    grade92: Math.round(chosenFmv * 0.55),
    grade94: Math.round(chosenFmv * 0.70),
    grade96: Math.round(chosenFmv * 0.85),
    grade98: chosenFmv,
    grade100: Math.round(chosenFmv * 2.2),
  };

  const multiGradeSales = [
    {
      grade: "9.8",
      label: "9.8 NM/MT",
      salesCount: 8,
      price: chosenFmv,
      lastCompDate: compDate,
      color: "#F59E0B",
    },
    {
      grade: "9.6",
      label: "9.6 NM+",
      salesCount: 3,
      price: ladder.grade96,
      lastCompDate: compDate,
      color: "#A855F7",
    },
    {
      grade: "9.4",
      label: "9.4 NM",
      salesCount: 5,
      price: ladder.grade94,
      lastCompDate: compDate,
      color: "#38BDF8",
    },
    {
      grade: "Raw",
      label: "Ungraded ⚑",
      salesCount: 14,
      price: estimatedRawBasis,
      lastCompDate: compDate,
      color: "#94A3B8",
    },
  ];

  const galleryImages: string[] =
    Array.isArray(listing.gallery) && listing.gallery.length > 0
      ? listing.gallery
      : [listing.image_url];

  const loreDossier = resolveFandomLoreDossier(
    listing.title,
    series,
    issueNumber,
    pubYear,
    fandomSummary
  );

  return {
    id: listing.item_id,
    title: listing.title,
    series,
    issueNumber,
    coverUrl: listing.image_url,
    galleryImages,
    grade: gradeDisplay,
    grader,
    era: eraInfo.era,
    eraDisplayName: eraInfo.eraDisplayName,
    isHighGradeOnly: eraInfo.isHighGradeOnly,
    certNumber,
    certVerificationUrl,
    venue,
    venueDisplayName,
    venueLotId,
    sourceListingUrl: listing.url || `https://www.ebay.com/itm/${cleanLotNum}`,
    fmv: chosenFmv,
    openingBid,
    currentBid,
    hammerPrice: trueClearingPrice,
    summary: loreDossier.summary,
    storyTitle: loreDossier.storyTitle,
    storyQuote: loreDossier.storyQuote || undefined,
    creativeCredits: loreDossier.creativeCredits,
    characterRoster: loreDossier.characterRoster,
    synopsisParagraphs: loreDossier.synopsisParagraphs,
    fandomUrl: loreDossier.fandomUrl,
    fandomUniverse: loreDossier.fandomUniverse,
    categories: loreDossier.categories,
    notes: loreDossier.notes,
    continuityLinks: loreDossier.continuityLinks,
    variantCovers: loreDossier.variantCovers,
    whyInvest: generateRichInvestmentThesis({
      title: listing.title,
      series,
      issueNumber,
      pubYear,
      grade: gradeDisplay,
      grader,
      fmv: chosenFmv,
      openingBid,
      salesVolume: 24,
      era: eraInfo.era,
      isBelowGradingCost,
      slabbingCostFloor,
      buyerManufacturingAdvantage,
      ratio96To98: 0.85,
      spreadRawTo98: Math.round(chosenFmv - estimatedRawBasis),
      marketCycles: marketHistory.marketCycles,
      culturalSignificance: loreDossier.notes?.find(
        (n) => n.toLowerCase().includes("parody") || n.toLowerCase().includes("cultural") || n.toLowerCase().includes("demi moore") || n.toLowerCase().includes("trivia")
      ) || ((series.toLowerCase().includes("she-hulk") || series.toLowerCase().includes("she hulk")) && issueNumber === "34"
        ? "Direct parody of Annie Leibovitz's famous August 1991 Vanity Fair cover featuring pregnant Demi Moore (then married to Bruce Willis), with She-Hulk posing nude holding a green beach ball with the fourth-wall breaking text: 'It\\'s not fair to accuse me of vanity! I just thrive on controversy!' This pop-culture milestone anchors evergreen collector demand, amplified by John Byrne's meta-humor run and the MCU live-action She-Hulk Disney+ series driving long-term back-issue liquidity across the Hulk franchise."
        : undefined),
    }),
    spreadRawTo98: Math.round(chosenFmv - estimatedRawBasis),
    ratio96To98: 0.85,
    salesVolume: 24,
    volumeFrequency: "2.0/mo",
    videos: null,
    cgcCensus: listing.census?.total || Math.floor(40 + Math.random() * 200),
    lastSoldDate: compDate,
    isStaleComp: false,
    staleCompAgeDays: 14,
    investopediaSlug: "breakeven-point-definition-examples-and-how-to-calculate",
    priceLadder: ladder,
    chartPoints,
    candlestickPoints: marketHistory.candlestickPoints,
    historicalComps: marketHistory.historicalComps,
    marketCycles: marketHistory.marketCycles,
    multiGradeSales,
    isYellowLabel,
    creatorName: isYellowLabel ? "Creator" : undefined,
    signatureDetails,
    baseGradingFee: activeFormula.baseGradingFee,
    pressingFee: activeFormula.pressingFee,
    witnessFee: activeFormula.witnessFee,
    creatorSigningFee: activeFormula.creatorSigningFee,
    creatorSigningFeeCertainty: activeFormula.creatorSigningFeeCertainty,
    creatorSigningFeeNote: activeFormula.creatorSigningFeeNote,
    creatorSigningFeeRange: activeFormula.creatorSigningFeeRange,
    invoiceFee: activeFormula.invoiceFee,
    serviceTax: activeFormula.serviceTax,
    shippingHandlingFee: activeFormula.shippingHandlingFee,
    slabbingCostFloor,
    estimatedRawBasis,
    sellerTotalCostBasis,
    buyerReplacementCost,
    breakevenSalePrice,
    isBelowGradingCost,
    sellerSubsidizedAmount,
    buyerManufacturingAdvantage,
    activeFormulaKey: activeKey,
    formulas,
    exitScenarios: calculateExitScenarios(chosenFmv, openingBid),
    compsDrift,
    ...buildLotMacroAndVelocity(eraInfo.era, chosenFmv, 24),
  };
}

async function batchFetchStorySummaries(
  supabase: any,
  items: Array<{ series?: string | null; issue?: string | null; title?: string }>
): Promise<Map<string, any>> {
  const map = new Map<string, any>();
  const orClauses: string[] = [];

  for (const item of items) {
    const rawS = (item.series || item.title?.split("#")[0] || "")
      .replace(/^\d{4}\s+/i, "")
      .replace(/^(marvel|dc|image|dark horse|idw)\s+/i, "")
      .replace(/^(the|a)\s+/i, "");
    const cleanS = rawS
      .replace(/[^\w\s-]/g, "")
      .trim()
      .slice(0, 24);
    const cleanIss = String(item.issue || item.title?.match(/#(\d+)/)?.[1] || "1").trim();
    if (cleanS && cleanIss) {
      orClauses.push(`and(series.ilike.%${cleanS}%,issue_number.eq.${cleanIss})`);
    }
  }

  if (orClauses.length === 0) return map;

  try {
    const { data: rows } = await supabase
      .from("issue_story_summaries")
      .select("series, issue_number, year, summary, story_title, source, source_url, license")
      .or(orClauses.join(","))
      .not("summary", "is", null);

    if (rows && Array.isArray(rows)) {
      for (const row of rows) {
        const key = `${normalizeSearchKey(row.series)}|${String(row.issue_number).trim()}`;
        if (!map.has(key)) {
          map.set(key, [row]);
        } else {
          map.get(key).push(row);
        }
      }
    }
  } catch (err) {
    console.warn("[lot-service] batchFetchStorySummaries warning:", err);
  }

  return map;
}

function findMatchingSummary(
  map: Map<string, any[]>,
  series?: string | null,
  issue?: string | null,
  title?: string,
  pubYear?: number
): any | null {
  const rawS = (series || title?.split("#")[0] || "")
    .replace(/^\d{4}\s+/i, "")
    .replace(/^(marvel|dc|image|dark horse|idw)\s+/i, "")
    .replace(/^(the|a)\s+/i, "");
  const iss = String(issue || title?.match(/#(\d+)/)?.[1] || "1").trim();
  const directKey = `${normalizeSearchKey(rawS)}|${iss}`;
  const targetNorm = normalizeSearchKey(rawS);

  let candidates: any[] = [];
  if (map.has(directKey)) {
    candidates = map.get(directKey)!;
  } else {
    for (const [k, rowList] of map.entries()) {
      if (k.endsWith(`|${iss}`)) {
        const rowSeriesNorm = k.split("|")[0];
        if (targetNorm && rowSeriesNorm && (targetNorm === rowSeriesNorm || targetNorm.includes(rowSeriesNorm) || rowSeriesNorm.includes(targetNorm))) {
          candidates.push(...rowList);
        }
      }
    }
  }

  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  return candidates.slice().sort((a, b) => {
    // Exact series title match priority
    const aExact = normalizeSearchKey(a.series) === targetNorm ? 1 : 0;
    const bExact = normalizeSearchKey(b.series) === targetNorm ? 1 : 0;
    if (aExact !== bExact) return bExact - aExact;

    if (pubYear && a.year && b.year) {
      const aDiff = Math.abs(a.year - pubYear);
      const bDiff = Math.abs(b.year - pubYear);
      return aDiff - bDiff;
    }
    return 0;
  })[0];
}

export const JUNK_LOT_REGEX = /ashcan|preview|giveaway|sampler|promo|coupon|poster|insert|swedish edition|german edition|foreign reprint|cavewoman|cult of dracula|mad special|mad magazine|animaniacs|ren and stimpy|beavis and butt-head|novelty|trade card|sealed pack|polybagged pack|badge|pinback|action figure|annual reprint|facsimile/i;

export const SOVEREIGN_SERIES_REGEX =
  /spider-man|spiderman|x-men|xmen|wolverine|hulk|avengers|batman|superman|daredevil|fantastic four|thor|iron man|captain america|silver surfer|ghost rider|moon knight|venom|carnage|punisher|spawn|walking dead|invincible|saga|star wars|darth vader|boba fett|tmnt|teenage mutant ninja turtles|hellboy|transformers|g\.i\. joe|gi joe|justice league|flash|green lantern|wonder woman|aquaman|swamp thing|sandman|hellblazer|teen titans|new mutants|x-force|alpha flight|conan|doctor strange|ms\. marvel|captain marvel|deadpool|secret wars|infinity gauntlet|crisis on infinite|action comics|detective comics|strange tales|tales of suspense|journey into mystery|tomb of dracula|marvel premiere|special marvel edition|showcase|brave and the bold|1st app|first appearance|origin|debut|death of|key issue|todd mcfarlane|jim lee|alex ross|frank miller|stan lee|jack kirby|john byrne|steve ditko|neal adams|bernie wrightson|tales from the crypt|vault of horror|weird science|haunt of fear|crime suspenstories|shock suspenstories|eerie|creepy|house of mystery|house of secrets|demon days|power girl|spider-woman|she-hulk|doctor doom|silver age|golden age|atomic age|platinum age/i;

export function isSovereignLot(
  listing: { title: string; series?: string | null; price_usd?: number | null },
  role?: GameRole
): boolean {
  const full = `${listing.title || ""} ${listing.series || ""}`.toLowerCase();
  const isMajorSovereign = SOVEREIGN_SERIES_REGEX.test(full);

  // If not sovereign, reject any junk pattern
  if (!isMajorSovereign && JUNK_LOT_REGEX.test(full)) return false;

  // Even if sovereign series title, reject true non-slab / junk formats
  if (isMajorSovereign && /ashcan|giveaway|sampler|promo|coupon|poster|insert|swedish edition|german edition|foreign reprint|trade card|sealed pack|badge|pinback|action figure/i.test(full)) {
    return false;
  }

  if (role === "broker") {
    // For major sovereign series / keys, allow live discovery starting at $50+
    const minPrice = isMajorSovereign ? 50 : 100;
    if (listing.price_usd != null && listing.price_usd < minPrice) return false;
  } else {
    if (listing.price_usd != null && listing.price_usd < 25) return false;
  }
  return isMajorSovereign;
}

export async function fetchSimLotBatch(
  role: GameRole,
  brokerLevel: BrokerLevel = 1,
  count: number = 6,
  excludeIds: string[] = []
): Promise<{ lots: LotItem[]; activeLot: LotItem }> {
  const supabase = createAdminServerClient();
  const realLots: LotItem[] = [];

  // 1. Direct query from sniper_listings (19,000+ real live listings with authentic seller slab photographs)
  try {
    let query = supabase
      .from("sniper_listings")
      .select("item_id, venue, marketplace, title, series, issue, grade, grader, cert_number, buying_option, price_usd, url, image_url, gallery, pub_year, publisher, label")
      .not("image_url", "is", null);

    if (role === "broker") {
      // The Broker: strictly high-grade 9.4, 9.6, 9.8, price >= $50 (captures live auction floor arbitrage)
      query = query
        .in("grade", [9.4, 9.6, 9.8, "9.4", "9.6", "9.8"])
        .gte("price_usd", 50);
    } else {
      // The Whale: High ticket certified grails >= $650
      query = query.gte("price_usd", 650);
    }

    // Sample from a larger window to strictly filter for premier sovereign titles
    const sampleSize = Math.max(100, count * 15);
    const maxOffset = role === "broker" ? 800 : 40;
    const randomOffset = Math.floor(Math.random() * maxOffset);
    const { data: listingData, error } = await query.range(randomOffset, randomOffset + sampleSize);

    if (!error && Array.isArray(listingData) && listingData.length > 0) {
      // Strict Sovereign & Anti-Junk Filter
      const candidates = listingData.filter(
        (l) => l.item_id && l.image_url && !excludeIds.includes(l.item_id) && isSovereignLot(l, role)
      );

      const selected = candidates.slice(0, count);
      const summariesMap = await batchFetchStorySummaries(
        supabase,
        selected.map((item) => ({
          series: item.series || item.label?.title,
          issue: item.issue || item.label?.issueNumber,
          title: item.title,
        }))
      );

      for (const item of selected) {
        const pubYearMatch = item.title?.match(/\b(19\d\d|20\d\d)\b/)?.[1];
        const pubYear = pubYearMatch ? parseInt(pubYearMatch, 10) : item.label?.publishedYear || undefined;
        const matchedSummary = findMatchingSummary(
          summariesMap,
          item.series || item.label?.title,
          item.issue || item.label?.issueNumber,
          item.title,
          pubYear
        );
        realLots.push(transformListingToLot(item, role, brokerLevel, matchedSummary));
      }
    }
  } catch (err) {
    console.warn("[sniper-lot-service] Failed querying sniper_listings, falling back to local catalog:", err);
  }

  // 2. If sniper_listings returned fewer than count, fill remainder from local high-res catalog
  if (realLots.length < count) {
    const needed = count - realLots.length;
    const existingIds = [...excludeIds, ...realLots.map((l) => l.id)];
    const sqliteLots = queryRandomSqliteLots(role, needed, existingIds);

    const summariesMap = await batchFetchStorySummaries(
      supabase,
      sqliteLots.map((s) => ({
        series: s.series,
        issue: s.issue_number,
        title: s.title,
      }))
    );

    for (const sLot of sqliteLots) {
      const synthesizedRow: RawComicDbRow = {
        id: sLot.source_product_id,
        title: sLot.title,
        series: sLot.series,
        issue_number: sLot.issue_number,
        raw: `$${Math.max(5, Math.round(sLot.fmv_usd * 0.22))}`,
        "4.0": `$${Math.round(sLot.fmv_usd * 0.15)}`,
        "6.0": `$${Math.round(sLot.fmv_usd * 0.28)}`,
        "8.0": `$${Math.round(sLot.fmv_usd * 0.45)}`,
        "9.2": `$${Math.round(sLot.fmv_usd * 0.70)}`,
        "9.4": `$${Math.round(sLot.fmv_usd * 0.82)}`,
        "9.6": `$${Math.round(sLot.fmv_usd * 0.92)}`,
        "9.8": `$${Math.round(sLot.fmv_usd)}`,
        "10.0": null,
        spread_raw_to_98: String(Math.round(sLot.fmv_usd * 0.78)),
        ratio_96_to_98: "0.92",
        sales_volume: String(Math.floor(25 + Math.random() * 200)),
        highres_cover_url: sLot.cover_url,
        summary: null,
        why_i_should_invest_in_this_comic: null,
      };
      const pubYearMatch = sLot.title?.match(/\b(19\d\d|20\d\d)\b/)?.[1];
      const pubYear = pubYearMatch ? parseInt(pubYearMatch, 10) : undefined;
      const matchedSummary = findMatchingSummary(
        summariesMap,
        sLot.series,
        sLot.issue_number,
        sLot.title,
        pubYear
      );
      realLots.push(transformRowToLot(synthesizedRow, role, brokerLevel, undefined, matchedSummary));
    }
  }

  // Fallback to high fidelity key if somehow still empty
  if (realLots.length === 0) {
    realLots.push(transformRowToLot(HIGH_FIDELITY_FALLBACK, role, brokerLevel));
  }

  // Multi-Venue Staggered Rail Engine (eBay Live, ComicConnect, HipComic, MyComicShop Lone Star, Heritage Auctions)
  const lots = realLots.slice(0, count).map((lot, idx) => {
    let secs = 240;
    const cleanLotNum = String(lot.venueLotId || lot.id || "")
      .replace(/^[a-z_]+-v\d+\|/i, "")
      .replace(/\|\d+$/, "")
      .replace(/^[a-z]+-/i, "");

    const fullTitle = `${lot.title} ${lot.series}`.toLowerCase();
    const isECHorrorOrGolden =
      fullTitle.includes("crypt") ||
      fullTitle.includes("vault of horror") ||
      fullTitle.includes("weird science") ||
      fullTitle.includes("haunt of fear") ||
      fullTitle.includes("crime suspen") ||
      fullTitle.includes("shock suspen") ||
      (lot.era && ["golden", "atomic", "platinum"].includes(lot.era.toLowerCase()));

    if (idx === 0) {
      // Slot 0: eBay Live (Imminent Discovery & Final Calls: 3m 45s to 7m 30s)
      lot.venue = "ebay";
      lot.venueDisplayName = "eBay Live";
      secs = Math.floor(225 + Math.random() * 230);
      lot.venueLotId = `EBAY-${cleanLotNum || Math.floor(100000000000 + Math.random() * 900000000000)}`;
      lot.sourceListingUrl = `https://www.ebay.com/itm/${lot.venueLotId.replace("EBAY-", "")}`;
    } else if (idx === 1) {
      // Slot 1: ComicConnect Event Auction (~1h 45m to 3h 15m)
      lot.venue = "comicconnect";
      lot.venueDisplayName = "ComicConnect Event Auction";
      secs = Math.floor(6300 + Math.random() * 5400);
      const ccNum = Math.floor(810000 + Math.random() * 180000);
      lot.venueLotId = `CC-${ccNum}`;
      lot.sourceListingUrl = `https://www.comicconnect.com/item/${ccNum}`;
    } else if (idx === 2) {
      // Slot 2: HipComic Daily Auction (Closes Tonight 9:00 PM ET, ~8h 30m to 14h)
      lot.venue = "hipcomic";
      lot.venueDisplayName = "HipComic Daily Auction (Closes 9:00 PM ET)";
      secs = Math.floor(30600 + Math.random() * 19800);
      const hipNum = Math.floor(1200000 + Math.random() * 8000000);
      lot.venueLotId = `HIP-${hipNum}`;
      lot.sourceListingUrl = `https://www.hipcomic.com/listing/${encodeURIComponent(lot.series.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}-${lot.issueNumber}/${hipNum}`;
    } else if (idx === 3) {
      // Slot 3: Lone Star Weekly Monday Climax (Closes Monday 8:00 PM CT, ~1.8d to 2.8d) OR Heritage EC Horror / Golden Age
      if (isECHorrorOrGolden) {
        lot.venue = "heritage";
        const haSale = 47000 + Math.floor(Math.random() * 200);
        const haLot = 10000 + Math.floor(Math.random() * 89999);
        lot.venueLotId = `HA-${haSale}-${haLot}`;
        lot.venueDisplayName = `Heritage Auctions (Sale #${haSale} · EC Horror Floor)`;
        lot.sourceListingUrl = `https://comics.ha.com/c/search/results.zx?dept=1938&mode=live&auction_name=${haSale}`;
        secs = Math.floor(259200 + Math.random() * 86400); // 3 to 4 days
      } else {
        lot.venue = "mycomicshop";
        lot.venueDisplayName = "MyComicShop (Lone Star) Weekly Monday Close (8:00 PM CT)";
        const mcsItem = Math.floor(5100000 + Math.random() * 3900000);
        lot.venueLotId = `MCS-${mcsItem}`;
        lot.sourceListingUrl = `https://www.mycomicshop.com/auctions?agid=828&item=${mcsItem}`;
        secs = Math.floor(155000 + Math.random() * 86400); // 1.8 to 2.8 days
      }
    } else if (idx === 4) {
      // Slot 4: Heritage Auctions (EC Horror & Golden Age Signature)
      lot.venue = "heritage";
      const haSale = 47000 + Math.floor(Math.random() * 200);
      const haLot = 10000 + Math.floor(Math.random() * 89999);
      lot.venueLotId = `HA-${haSale}-${haLot}`;
      lot.venueDisplayName = `Heritage Auctions (Sale #${haSale})`;
      lot.sourceListingUrl = `https://comics.ha.com/c/search/results.zx?dept=1938&mode=live&auction_name=${haSale}`;
      secs = Math.floor(288000 + Math.random() * 86400); // 3.3 to 4.3 days
    } else {
      // Slot 5: ComicLink Focused Auction
      lot.venue = "comiclink";
      lot.venueDisplayName = "ComicLink Focused Auction";
      const clNum = Math.floor(1500000 + Math.random() * 400000);
      lot.venueLotId = `CL-${clNum}`;
      lot.sourceListingUrl = `https://www.comiclink.com/auctions/preview.asp?code=2026oct&item=${clNum}`;
      secs = Math.floor(95000 + Math.random() * 50000); // 1.1 to 1.7 days
    }

    lot.secondsRemaining = secs;
    lot.totalDurationSeconds = secs;
    lot.endsAt = new Date(Date.now() + secs * 1000).toISOString();
    lot.lotStatus = secs <= 90 ? "hot" : "active";
    return lot;
  });

  return {
    lots,
    activeLot: lots[0],
  };
}

export async function fetchNextSimLot(
  role: GameRole,
  brokerLevel: BrokerLevel = 1,
  excludeIds: string[] = []
): Promise<LotItem> {
  const batch = await fetchSimLotBatch(role, brokerLevel, 6, excludeIds);
  const candidate = batch.lots.find((l) => !excludeIds.includes(l.id)) || batch.activeLot;
  return candidate;
}
