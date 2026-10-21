import { createAdminServerClient } from "@/lib/supabase/admin";
import type { BrokerLevel, GameRole, LotItem } from "./types";
import benchmarksData from "@/lib/pricing/pricecharting-cgc-benchmarks.json";
import { buildEncasementFormulas, calculateExitScenarios } from "./encasement-math";

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
  "2402858", // Giant-Size X-Men #1 (1975)
  "2395410", // The X-Men #94 (1975)
  "2316410", // Batman #251 (1973)
  "2392665", // Iron Man #55 (1973)
  "2399602", // Marvel Spotlight #5 (1972)
];

const BROKER_KEY_IDS = [
  "2404003", // Defenders #98 (1981)
  "2412773", // Special Marvel Edition #15 (1973)
  "2399580", // Marvel Spotlight #15 (1974)
  "2397185", // The Spectacular Spider-Man #2 (1968)
  "2393702", // Wolverine #23 (1990)
  "2317640", // Uncanny X-Men #270 (1990)
  "2392434", // Iron Man #14 (1969)
  "2389391", // Daredevil #164 (1980)
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
  highres_cover_url: "https://storage.googleapis.com/panel-profits-covers-all/Pictures/M/Marvel/A/Amazing%20Spider-Man%2C%20The/129.jpg",
  summary: "Act I: Jackal manipulates the Punisher into hunting down Spider-Man.\nAct II: First explosive confrontation on New York rooftops; Punisher realizes Jackal's deceit.\nAct III: Climax at the warehouse; Punisher retreats into the shadows, launching a legendary anti-hero franchise.",
  why_i_should_invest_in_this_comic: "Historical blue-chip key marking the 1st Appearance of Frank Castle (The Punisher). Anchor asset with 484 recorded sales/yr and massive raw-to-9.8 spread.",
};

export function transformRowToLot(
  book: RawComicDbRow,
  role: GameRole,
  brokerLevel: BrokerLevel = 1,
  forcedGrade?: string
): LotItem {
  type GradedKey = "4.0" | "6.0" | "8.0" | "9.2" | "9.4" | "9.6" | "9.8" | "10.0";
  let targetGradeKey: GradedKey = (forcedGrade as GradedKey) || "8.0";

  if (!forcedGrade) {
    if (role === "broker") {
      const roll = Math.random();
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
    chosenFmv = ladder.grade98 || ladder.grade96 || ladder.grade80 || ladder.grade60 || 150;
    targetGradeKey = ladder.grade98 ? "9.8" : ladder.grade80 ? "8.0" : "6.0";
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

  // Publication year & Encasement Sunk Cost
  const yearMatch = book.title.match(/\b(19\d\d|20\d\d)\b/);
  const pubYear = yearMatch ? Number(yearMatch[1]) : 1990;
  const isVintage = pubYear < 1975;

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
  const openingBid = Math.max(15, Math.round((chosenFmv * openingRatio) / 5) * 5);

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

  return {
    id: book.id,
    title: book.title,
    series: book.series || book.title.split("#")[0]?.trim() || "Comic",
    issueNumber: book.issue_number || book.title.match(/#(\d+)/)?.[1] || "1",
    coverUrl: book.highres_cover_url || "/surface-art/character.png",
    grade: gradeDisplay,
    grader,
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

export async function fetchSimLotBatch(
  role: GameRole,
  brokerLevel: BrokerLevel = 1,
  count: number = 6
): Promise<{ lots: LotItem[]; activeLot: LotItem }> {
  const supabase = createAdminServerClient();
  const targetIds = (role === "whale" ? WHALE_KEY_IDS : BROKER_KEY_IDS).slice(0, count);
  const collectedRows: RawComicDbRow[] = [];

  try {
    // 1. Single indexed query by primary key IDs (executes in <250ms)
    const { data, error } = await supabase
      .from("comics")
      .select("*")
      .in("id", targetIds)
      .not("highres_cover_url", "is", null);

    if (!error && Array.isArray(data)) {
      for (const row of data as unknown as RawComicDbRow[]) {
        if (!collectedRows.some((r) => r.id === row.id)) {
          collectedRows.push(row);
        }
      }
    }

    // 2. If we still need more candidates, query the broader catalog with select("*")
    if (collectedRows.length < count) {
      const { data: fallbackData, error: fbErr } = await supabase
        .from("comics")
        .select("*")
        .not("highres_cover_url", "is", null)
        .not("raw", "is", null)
        .limit(20);

      if (!fbErr && Array.isArray(fallbackData)) {
        for (const row of fallbackData as unknown as RawComicDbRow[]) {
          if (collectedRows.length >= count) break;
          if (!collectedRows.some((r) => r.id === row.id)) {
            collectedRows.push(row);
          }
        }
      }
    }
  } catch (err) {
    console.error("[sniper-lot-service] Error querying Supabase batch:", err);
  }

  // Fallback to high fidelity key if database query returned empty
  if (collectedRows.length === 0) {
    collectedRows.push(HIGH_FIDELITY_FALLBACK);
  }

  const lots = collectedRows.map((row) => transformRowToLot(row, role, brokerLevel));
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
  const batch = await fetchSimLotBatch(role, brokerLevel, 6);
  const candidate = batch.lots.find((l) => !excludeIds.includes(l.id)) || batch.activeLot;
  return candidate;
}
