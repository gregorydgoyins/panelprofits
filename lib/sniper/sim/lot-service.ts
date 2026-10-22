import { createAdminServerClient } from "@/lib/supabase/admin";
import type { BrokerLevel, GameRole, LotItem } from "./types";
import benchmarksData from "@/lib/pricing/pricecharting-cgc-benchmarks.json";
import { buildEncasementFormulas, calculateExitScenarios } from "./encasement-math";
import { lookupSqliteCover } from "@/lib/comics/sqlite-covers";

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

export function transformRowToLot(
  book: RawComicDbRow,
  role: GameRole,
  brokerLevel: BrokerLevel = 1,
  forcedGrade?: string
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
        if (brokerLevel === 1) {
          targetGradeKey = roll < 0.60 ? "9.2" : roll < 0.90 ? "9.4" : "9.6";
        } else if (brokerLevel === 2) {
          targetGradeKey = roll < 0.35 ? "9.2" : roll < 0.75 ? "9.4" : "9.6";
        } else {
          targetGradeKey = roll < 0.20 ? "9.4" : roll < 0.60 ? "9.6" : "9.8";
        }
      } else {
        targetGradeKey = roll < 0.15 ? "9.4" : roll < 0.45 ? "9.6" : "9.8";
      }
    }
  } else {
    // Pre-Bronze Vintage: 0.5 through 9.8 allowable
    if (!forcedGrade) {
      const roll = Math.random();
      if (role === "broker") {
        if (brokerLevel === 1) {
          if (roll < 0.40) targetGradeKey = "4.0";
          else if (roll < 0.75) targetGradeKey = "6.0";
          else if (roll < 0.95) targetGradeKey = "8.0";
          else targetGradeKey = "9.2";
        } else if (brokerLevel === 2) {
          if (roll < 0.35) targetGradeKey = "6.0";
          else if (roll < 0.70) targetGradeKey = "8.0";
          else if (roll < 0.90) targetGradeKey = "9.2";
          else targetGradeKey = "9.4";
        } else {
          if (roll < 0.25) targetGradeKey = "8.0";
          else if (roll < 0.55) targetGradeKey = "9.4";
          else if (roll < 0.85) targetGradeKey = "9.6";
          else targetGradeKey = "9.8";
        }
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
    if (eraInfo.isHighGradeOnly) {
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

  const estimatedRawBasis = ladder.raw || Math.max(5, Math.round(chosenFmv * 0.22));

  const { formulas, activeKey } = buildEncasementFormulas({
    grader,
    isVintage,
    estimatedRawBasis,
    isYellowLabel,
    creatorName,
    signaturesCount: 1,
  });

  const activeFormula = formulas[activeKey];
  const slabbingCostFloor = activeFormula.slabbingCostFloor;
  const sellerTotalCostBasis = activeFormula.sellerTotalCostBasis;
  const breakevenSalePrice = activeFormula.breakevenSalePrice;

  // Stale Comps & Clearing Prices
  const isStaleComp = role === "whale" && Math.random() < 0.35;
  const staleDays = isStaleComp ? Math.floor(550 + Math.random() * 500) : Math.floor(10 + Math.random() * 60);
  const compDate = new Date(Date.now() - staleDays * 86400000).toISOString().slice(0, 10);

  const fmvAdjustment = isStaleComp ? 0.72 + Math.random() * 0.10 : 0.92 + Math.random() * 0.16;
  const trueClearingPrice = Math.round(chosenFmv * fmvAdjustment);

  const openingRatio = 0.55 + Math.random() * 0.15;
  const calculatedOpening = Math.max(15, Math.round((chosenFmv * openingRatio) / 5) * 5);
  // Institutional hard cap: $10,000 maximum opening floor bid
  // The comic can land/hammer wherever it clears over $10k, but its opening bid is capped at $10k
  const openingBid = Math.min(10000, calculatedOpening);

  const isBelowGradingCost = openingBid <= slabbingCostFloor;
  const sellerSubsidizedAmount = isBelowGradingCost ? Math.round(slabbingCostFloor - openingBid) : 0;

  // TradingView Historical Chart Points (strictly sorted by ascending date)
  const rawChartPoints: Array<{ time: string; value: number }> = [];
  const startTimestamp = Date.now() - (isStaleComp ? 650 : 180) * 86400000;
  const pointsCount = isStaleComp ? 7 : 5;
  let currVal = Math.round(chosenFmv * (isStaleComp ? 1.25 : 0.85));

  for (let i = 0; i < pointsCount; i++) {
    const ptMillis = startTimestamp + Math.round((i / pointsCount) * (Date.now() - startTimestamp - 86400000));
    const ptDate = new Date(ptMillis).toISOString().slice(0, 10);
    const noise = Math.round((Math.random() - 0.48) * (currVal * 0.08));
    currVal = Math.max(15, currVal + noise);
    rawChartPoints.push({ time: ptDate, value: currVal });
  }
  rawChartPoints.push({ time: compDate, value: chosenFmv });

  // Deduplicate and strictly sort ascending by date
  const chartPointsMap = new Map<string, number>();
  for (const pt of rawChartPoints) {
    chartPointsMap.set(pt.time, pt.value);
  }
  const chartPoints = Array.from(chartPointsMap.entries())
    .map(([time, value]) => ({ time, value }))
    .sort((a, b) => a.time.localeCompare(b.time));

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
    fmv: chosenFmv,
    openingBid,
    currentBid: openingBid,
    hammerPrice: trueClearingPrice,
    summary: book.summary || "Certified secondary market listing with observable price discovery.",
    whyInvest: book.why_i_should_invest_in_this_comic || "Due diligence checklist and valuation spreads verified against recorded catalog transactions.",
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
    multiGradeSales,
    isYellowLabel,
    signatureDetails,
    baseGradingFee: activeFormula.baseGradingFee,
    pressingFee: activeFormula.pressingFee,
    witnessFee: activeFormula.witnessFee,
    creatorSigningFee: activeFormula.creatorSigningFee,
    invoiceFee: activeFormula.invoiceFee,
    serviceTax: activeFormula.serviceTax,
    shippingHandlingFee: activeFormula.shippingHandlingFee,
    slabbingCostFloor,
    estimatedRawBasis,
    sellerTotalCostBasis,
    breakevenSalePrice,
    isBelowGradingCost,
    sellerSubsidizedAmount,
    activeFormulaKey: activeKey,
    formulas,
    exitScenarios,
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

    const minFmv = role === "whale" ? 750 : 25;
    const maxFmv = role === "whale" ? 2500000 : 650;

    const stmt = db.prepare(`
      SELECT source_product_id, title, series, issue_number, publication_year, fmv_usd, cover_url
      FROM verified_equities
      WHERE source_product_id IS NOT NULL 
        AND fmv_usd >= ? AND fmv_usd <= ?
        AND cover_url IS NOT NULL
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

export async function fetchSimLotBatch(
  role: GameRole,
  brokerLevel: BrokerLevel = 1,
  count: number = 6,
  excludeIds: string[] = []
): Promise<{ lots: LotItem[]; activeLot: LotItem }> {
  const supabase = createAdminServerClient();
  const collectedRows: RawComicDbRow[] = [];
  const coverUrlMap = new Map<string, string>();

  // 1. Query dynamic randomized lots with verified authentic photos from local catalog
  const sqliteLots = queryRandomSqliteLots(role, count, excludeIds);
  const targetIds: string[] = [];

  if (sqliteLots.length > 0) {
    for (const item of sqliteLots) {
      targetIds.push(item.source_product_id);
      if (item.cover_url) {
        coverUrlMap.set(item.source_product_id, item.cover_url);
      }
    }
  } else {
    // Fallback: shuffle curated key pool so lots dynamically change every cycle
    const basePool = role === "whale" ? WHALE_KEY_IDS : BROKER_KEY_IDS;
    const shuffled = [...basePool].sort(() => Math.random() - 0.5);
    targetIds.push(...shuffled.filter((id) => !excludeIds.includes(id)).slice(0, count));
  }

  try {
    if (targetIds.length > 0) {
      const { data, error } = await supabase
        .from("comics")
        .select("*")
        .in("id", targetIds);

      if (!error && Array.isArray(data)) {
        for (const row of data as unknown as RawComicDbRow[]) {
          if (!collectedRows.some((r) => r.id === row.id)) {
            const cover = coverUrlMap.get(row.id);
            if (cover && !row.highres_cover_url) {
              row.highres_cover_url = cover;
            }
            collectedRows.push(row);
          }
        }
      }
    }

    // If any sqlite lots didn't have a direct row in supabase 'comics', synthesize full fidelity row
    for (const sLot of sqliteLots) {
      if (collectedRows.length >= count) break;
      if (!collectedRows.some((r) => r.id === sLot.source_product_id)) {
        collectedRows.push({
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
          summary: `Authentic catalog listing for ${sLot.title} with verified photo and observable price discovery.`,
          why_i_should_invest_in_this_comic: `Sovereign secondary market liquidity comp. Reference grade FMV benchmarked at $${sLot.fmv_usd.toLocaleString()}.`,
        });
      }
    }
  } catch (err) {
    console.error("[sniper-lot-service] Error querying Supabase batch:", err);
  }

  // Fallback to high fidelity key if database query returned empty
  if (collectedRows.length === 0) {
    collectedRows.push(HIGH_FIDELITY_FALLBACK);
  }

  // Staggered durations so lots end at different rates (hours, minutes, seconds)
  const staggeredDurations = [240, 1850, 78, 7420, 14400, 480];

  const lots = collectedRows.map((row, idx) => {
    const lot = transformRowToLot(row, role, brokerLevel);
    const secs = staggeredDurations[idx % staggeredDurations.length];
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
