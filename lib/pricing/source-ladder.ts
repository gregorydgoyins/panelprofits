import type { ComicRecord } from "@/lib/comics/types";

export const GRADES = [
  "RAW",
  "0.5",
  "1.0",
  "1.5",
  "1.8",
  "2.0",
  "2.5",
  "3.0",
  "3.5",
  "4.0",
  "4.5",
  "5.0",
  "5.5",
  "6.0",
  "6.5",
  "7.0",
  "7.5",
  "8.0",
  "8.5",
  "9.0",
  "9.2",
  "9.4",
  "9.6",
  "9.8",
  "9.9",
  "10.0",
] as const;
export type Grade = (typeof GRADES)[number];

function positivePrice(input: unknown): number | null {
  if (typeof input !== "string" && typeof input !== "number") return null;
  const raw = typeof input === "string" ? input.trim().replace(/^\$/, "").replace(/,/g, "") : input;
  if (raw === "") return null;
  const number = Number(raw);
  return Number.isFinite(number) && number > 0 ? number : null;
}

export interface ExecutionSpreads {
  buy: number | null;
  sell: number | null;
}

/**
 * Reads exact grade market values ONLY from authentic Panel Profits fields.
 * Never blends ComicBase, PriceCharting, or GoCollect fields into this function.
 * Supports RAW (ungraded market price).
 */
export function panelProfitsGrades(comic: Partial<ComicRecord>): Partial<Record<Grade, number>> {
  const result: Partial<Record<Grade, number>> = {};
  if (!comic.panel_profits_data) return result;

  // Extract RAW (ungraded / loose) market price
  const rawCandidateKeys = [
    "PP - Grade RAW Market Price",
    "PP - Ungraded Market Price",
    "PP - Raw Market Price",
    "raw_market_price",
    "ungraded_market_price",
    "ungraded_value",
    "raw_price",
    "raw",
    "ungraded",
    "loose",
    "loose_price",
    "used_price",
  ];
  for (const key of rawCandidateKeys) {
    let stored = positivePrice(comic.panel_profits_data[key]);
    if (stored === null && comic.panel_profits_data?.pricecharting) {
      stored = positivePrice(comic.panel_profits_data.pricecharting[key] || comic.panel_profits_data.pricecharting.raw);
    }
    if (stored === null && (comic as any).pricecharting_data) {
      stored = positivePrice((comic as any).pricecharting_data[key] || (comic as any).pricecharting_data.raw);
    }
    if (stored !== null) {
      result["RAW"] = stored;
      break;
    }
  }

  for (const grade of GRADES) {
    if (grade === "RAW") continue;
    const gradeKey = grade.replace(".", "_");
    const candidateKeys = [
      `PP - Grade ${grade} Market Price`,
      `grade_${gradeKey}_value`,
      `grade_${gradeKey}`,
      `pp_grade_${gradeKey}_price`,
      `${grade}_nm`,
      grade,
    ];

    for (const key of candidateKeys) {
      let stored = positivePrice(comic.panel_profits_data[key]);
      if (stored === null && comic.panel_profits_data?.pricecharting) {
        stored = positivePrice(
          comic.panel_profits_data.pricecharting[key] ||
          comic.panel_profits_data.pricecharting[`grade_${gradeKey}`] ||
          comic.panel_profits_data.pricecharting[grade]
        );
      }
      if (stored === null && (comic as any).pricecharting_data) {
        stored = positivePrice(
          (comic as any).pricecharting_data[key] ||
          (comic as any).pricecharting_data[`grade_${gradeKey}`] ||
          (comic as any).pricecharting_data[grade]
        );
      }
      if (stored !== null) {
        result[grade] = stored;
        break;
      }
    }
  }

  const promoted = positivePrice(comic.pp_grade_9_8_price);
  if (promoted !== null) result["9.8"] = promoted;
  return result;
}

/**
 * Reads ComicBase 1.1M dataset pricing independently without polluting Panel Profits or CGC data.
 */
export function comicBaseGrades(comic: Partial<ComicRecord>): Partial<Record<Grade, number>> {
  const result: Partial<Record<Grade, number>> = {};
  if (!comic.comicbase_data && !comic.comicbase_price) return result;

  // RAW / Catalog reference
  const rawStored = positivePrice(
    comic.comicbase_data?.["ComicBase - Grade RAW"] ||
    comic.comicbase_data?.["CB - Raw Price"] ||
    comic.comicbase_data?.["CB - Ungraded Price"]
  );
  if (rawStored !== null) {
    result["RAW"] = rawStored;
  }

  if (comic.comicbase_data) {
    for (const grade of GRADES) {
      if (grade === "RAW") continue;
      const key = `ComicBase - Grade ${grade}`;
      const stored = positivePrice(comic.comicbase_data[key] || comic.comicbase_data[grade]);
      if (stored !== null) result[grade] = stored;
    }
  }
  return result;
}

/**
 * Reads authentic GoCollect price ladder if present in payload or metadata.
 */
export function goCollectGrades(comic: Partial<ComicRecord>): Partial<Record<Grade, number>> {
  return goCollectCgcGrades(comic);
}

/**
 * Reads authentic GoCollect - CGC certified observation ladder.
 * CGC is exclusively a certified grading company — it NEVER issues a RAW or ungraded price.
 */
export function goCollectCgcGrades(comic: Partial<ComicRecord>): Partial<Record<Grade, number>> {
  const result: Partial<Record<Grade, number>> = {};
  const data = (comic as Record<string, unknown>).gocollect_cgc_data as Record<string, unknown> | undefined ||
    (comic as Record<string, unknown>).gocollect_data as Record<string, unknown> | undefined ||
    (comic.panel_profits_data as Record<string, unknown> | undefined)?.gocollect_cgc as Record<string, unknown> | undefined ||
    (comic.panel_profits_data as Record<string, unknown> | undefined)?.gocollect as Record<string, unknown> | undefined ||
    comic.panel_profits_data;
  if (!data) return result;

  for (const grade of GRADES) {
    if (grade === "RAW") continue;
    const gradeKey = grade.replace(".", "_");
    const stored = positivePrice(
      data[`GoCollect - CGC - Grade ${grade}`] ||
      data[`GoCollect - Grade ${grade}`] ||
      data[`gc_cgc_grade_${gradeKey}_price`] ||
      data[`gc_grade_${gradeKey}_price`] ||
      data[`gocollect_${gradeKey}`] ||
      (data as any)[grade]
    );
    if (stored !== null) result[grade] = stored;
  }
  return result;
}

/**
 * Reads authentic GoCollect - CBCS certified observation ladder.
 * CBCS is exclusively a certified grading company — it NEVER issues a RAW or ungraded price.
 */
export function goCollectCbcsGrades(comic: Partial<ComicRecord>): Partial<Record<Grade, number>> {
  const result: Partial<Record<Grade, number>> = {};
  const data = (comic as Record<string, unknown>).gocollect_cbcs_data as Record<string, unknown> | undefined ||
    (comic.panel_profits_data as Record<string, unknown> | undefined)?.gocollect_cbcs as Record<string, unknown> | undefined ||
    (comic.panel_profits_data as Record<string, unknown> | undefined)?.cbcs_grades as Record<string, unknown> | undefined ||
    comic.panel_profits_data;
  if (!data) return result;

  for (const grade of GRADES) {
    if (grade === "RAW") continue;
    const gradeKey = grade.replace(".", "_");
    const stored = positivePrice(
      data[`GoCollect - CBCS - Grade ${grade}`] ||
      data[`gc_cbcs_grade_${gradeKey}_price`] ||
      (data as any)[`cbcs_${gradeKey}`]
    );
    if (stored !== null) result[grade] = stored;
  }
  return result;
}

/**
 * Reads authentic GoCollect - PSA certified observation ladder.
 * PSA is exclusively a certified grading company — it NEVER issues a RAW or ungraded price.
 */
export function goCollectPsaGrades(comic: Partial<ComicRecord>): Partial<Record<Grade, number>> {
  const result: Partial<Record<Grade, number>> = {};
  const data = (comic as Record<string, unknown>).gocollect_psa_data as Record<string, unknown> | undefined ||
    (comic.panel_profits_data as Record<string, unknown> | undefined)?.gocollect_psa as Record<string, unknown> | undefined ||
    (comic.panel_profits_data as Record<string, unknown> | undefined)?.psa_grades as Record<string, unknown> | undefined ||
    comic.panel_profits_data;
  if (!data) return result;

  for (const grade of GRADES) {
    if (grade === "RAW") continue;
    const gradeKey = grade.replace(".", "_");
    const stored = positivePrice(
      data[`GoCollect - PSA - Grade ${grade}`] ||
      data[`gc_psa_grade_${gradeKey}_price`] ||
      (data as any)[`psa_${gradeKey}`]
    );
    if (stored !== null) result[grade] = stored;
  }
  return result;
}

/**
 * Reads authentic CGC · GPA sales observation ladder if present in payload or metadata.
 * CGC is exclusively a certified grading company — it NEVER issues a RAW or ungraded price.
 */
export function cgcGrades(comic: Partial<ComicRecord>): Partial<Record<Grade, number>> {
  const result: Partial<Record<Grade, number>> = {};
  const cgcData = (comic as Record<string, unknown>)?.cgc_data as Record<string, unknown> | undefined;

  // 1. If cgc_grades or cgc is an array of sale observations
  const obsList = Array.isArray(cgcData?.cgc_grades)
    ? cgcData.cgc_grades
    : Array.isArray((comic as any).cgc)
    ? (comic as any).cgc
    : null;

  if (obsList) {
    for (const obs of obsList) {
      if (obs && obs.grade && obs.amount && obs.grade !== "RAW") {
        const p = positivePrice(obs.amount);
        if (p !== null && (!result[obs.grade as Grade] || p > (result[obs.grade as Grade] ?? 0))) {
          result[obs.grade as Grade] = p;
        }
      }
    }
  }

  // 2. Dictionary lookups
  const cgcDict =
    (comic as Record<string, unknown>)?.cgc_data as Record<string, unknown> | undefined ||
    (comic.panel_profits_data as Record<string, unknown> | undefined)?.cgc_grades as Record<string, unknown> | undefined ||
    (comic.panel_profits_data as Record<string, unknown> | undefined);

  if (cgcDict) {
    for (const grade of GRADES) {
      if (grade === "RAW") continue;
      const gradeKey = grade.replace(".", "_");
      const stored = positivePrice(
        cgcDict[`CGC - Grade ${grade}`] ||
        cgcDict[`cgc_grade_${gradeKey}_price`] ||
        cgcDict[`cgc_${gradeKey}`] ||
        (cgcDict as any)[grade]
      );
      if (stored !== null && !result[grade]) result[grade] = stored;
    }
  }

  // 3. Certified slab grades from authentic market feeds (strictly grades != RAW)
  const pcData = (comic as Record<string, unknown>)?.pricecharting_data as Record<string, unknown> | undefined ||
    (comic.panel_profits_data as Record<string, unknown> | undefined)?.pricecharting as Record<string, unknown> | undefined;
  if (pcData) {
    for (const grade of GRADES) {
      if (grade === "RAW") continue;
      const gradeKey = grade.replace(".", "_");
      const stored = positivePrice(
        pcData[`grade_${gradeKey}`] ||
        pcData[grade]
      );
      if (stored !== null && !result[grade]) result[grade] = stored;
    }
  }

  return result;
}

/**
 * Reads PriceCharting secondary market auction/sales observation ladder.
 * Operates as an independent pricing authority. Never blends with ComicBase or Panel Profits.
 * RAW indicates uncertified market transactions; rarely if ever exceeds 9.8 certified pricing.
 */
export function priceChartingGrades(comic: Partial<ComicRecord>): Partial<Record<Grade, number>> {
  const result: Partial<Record<Grade, number>> = {};

  const pcData = (comic as Record<string, unknown>).pricecharting_data as Record<string, unknown> | undefined ||
    (comic.panel_profits_data as Record<string, unknown> | undefined)?.pricecharting as Record<string, unknown> | undefined;

  if (pcData) {
    const rawVal = positivePrice(pcData["raw"] || pcData["RAW"] || pcData["raw_price"]);
    if (rawVal !== null) result["RAW"] = rawVal;

    for (const grade of GRADES) {
      if (grade === "RAW") continue;
      const gradeKey = grade.replace(".", "_");
      const stored = positivePrice(
        pcData[`grade_${gradeKey}`] ||
        pcData[`PriceCharting - Grade ${grade}`] ||
        pcData[grade]
      );
      if (stored !== null) result[grade] = stored;
    }
  }

  return result;
}

/**
 * Reads authentic CBCS certified observation ladder if present in payload or metadata.
 */
export function cbcsGrades(comic: Partial<ComicRecord>): Partial<Record<Grade, number>> {
  const result: Partial<Record<Grade, number>> = {};
  const data = (comic as Record<string, unknown>).cbcs_data as Record<string, unknown> | undefined ||
    (comic.panel_profits_data as Record<string, unknown> | undefined)?.cbcs_grades as Record<string, unknown> | undefined;
  if (!data) return result;

  for (const grade of GRADES) {
    if (grade === "RAW") continue;
    const gradeKey = grade.replace(".", "_");
    const stored = positivePrice(
      data[`CBCS - Grade ${grade}`] ||
      data[`cbcs_grade_${gradeKey}_price`] ||
      data[grade]
    );
    if (stored !== null) result[grade] = stored;
  }
  return result;
}

/**
 * Reads authentic PSA certified observation ladder if present in payload or metadata.
 */
export function psaGrades(comic: Partial<ComicRecord>): Partial<Record<Grade, number>> {
  const result: Partial<Record<Grade, number>> = {};
  const data = (comic as Record<string, unknown>).psa_data as Record<string, unknown> | undefined ||
    (comic.panel_profits_data as Record<string, unknown> | undefined)?.psa_grades as Record<string, unknown> | undefined;
  if (!data) return result;

  for (const grade of GRADES) {
    if (grade === "RAW") continue;
    const gradeKey = grade.replace(".", "_");
    const stored = positivePrice(
      data[`PSA - Grade ${grade}`] ||
      data[`psa_grade_${gradeKey}_price`] ||
      data[grade]
    );
    if (stored !== null) result[grade] = stored;
  }
  return result;
}

/**
 * Reads verified eBay sold transaction observations ladder.
 * Isolated on its own line to prevent conflating realized auction sales with baseline FMV.
 */
export function ebayGrades(comic: Partial<ComicRecord>): Partial<Record<Grade, number>> {
  const result: Partial<Record<Grade, number>> = {};
  const ebayData =
    (comic as Record<string, unknown>).ebay_data as Record<string, unknown> | undefined ||
    (comic as Record<string, unknown>).ebay_sales as Record<string, unknown> | undefined ||
    (comic.panel_profits_data as Record<string, unknown> | undefined)?.ebay as Record<string, unknown> | undefined;

  if (ebayData) {
    const rawVal = positivePrice(ebayData["raw"] || ebayData["RAW"] || ebayData["raw_price"] || ebayData["Ungraded"]);
    if (rawVal !== null) result["RAW"] = rawVal;

    for (const grade of GRADES) {
      if (grade === "RAW") continue;
      const gradeKey = grade.replace(".", "_");
      const stored = positivePrice(
        ebayData[`eBay - Grade ${grade}`] ||
        ebayData[`ebay_grade_${gradeKey}_price`] ||
        ebayData[`grade_${gradeKey}`] ||
        ebayData[grade]
      );
      if (stored !== null) result[grade] = stored;
    }
  }

  return result;
}

export interface HighestGradedPriceResult {
  grade: Grade;
  price: number;
  source: string;
  isRaw: boolean;
}

/**
 * Determines the authentic highest graded price and its grade across source ladders.
 * Evaluates numeric graded prices first (10.0 down to 0.5), then RAW if only ungraded exists.
 */
export function getHighestGradedPrice(
  ladders: Record<string, Partial<Record<Grade, number>> | undefined>
): HighestGradedPriceResult | null {
  // Check from 10.0 down to 0.5 (numeric grades)
  for (let i = GRADES.length - 1; i >= 1; i--) {
    const grade = GRADES[i];
    for (const [source, ladder] of Object.entries(ladders)) {
      if (ladder && ladder[grade] !== undefined && ladder[grade] !== null && ladder[grade]! > 0) {
        return {
          grade,
          price: ladder[grade]!,
          source,
          isRaw: false,
        };
      }
    }
  }

  // Fallback to RAW if no numeric grade prices exist
  for (const [source, ladder] of Object.entries(ladders)) {
    if (ladder && ladder["RAW"] !== undefined && ladder["RAW"] !== null && ladder["RAW"]! > 0) {
      return {
        grade: "RAW",
        price: ladder["RAW"]!,
        source,
        isRaw: true,
      };
    }
  }

  return null;
}

/**
 * Reads order-book execution spreads (_buy and _sell) for key anchor grades.
 * Corresponds to the bid/ask execution spreads in the 115k dataset and translation layer.
 */
export function panelProfitsSpreads(comic: Partial<ComicRecord>, grade: Grade): ExecutionSpreads {
  const ppData = comic.panel_profits_data as Record<string, any> | undefined;
  if (!ppData) return { buy: null, sell: null };

  // 1. Direct structured spreads object
  if (ppData.spreads && typeof ppData.spreads === "object") {
    const gradeKey = grade.replace(".", "_");
    const s =
      ppData.spreads[grade] ??
      ppData.spreads[grade.toLowerCase()] ??
      (grade === "RAW" ? ppData.spreads.raw : ppData.spreads[`grade_${gradeKey}`]);
    if (s && typeof s === "object") {
      const b = positivePrice(s.buy);
      const sl = positivePrice(s.sell);
      if (b !== null || sl !== null) {
        return { buy: b, sell: sl };
      }
    }
  }

  const gradeKey = grade.replace(".", "_");

  const rawBuyKeys = [
    "ungraded_buy",
    "PP - Ungraded Buy Price",
    "raw_buy",
    "loose_buy",
    "PP - Raw Buy Price",
  ];
  const rawSellKeys = [
    "ungraded_sell",
    "PP - Ungraded Sell Price",
    "raw_sell",
    "loose_sell",
    "PP - Raw Sell Price",
  ];

  let buy: number | null = null;
  let sell: number | null = null;

  if (grade === "RAW") {
    for (const key of rawBuyKeys) {
      const v = positivePrice(ppData[key]);
      if (v !== null) {
        buy = v;
        break;
      }
    }
    for (const key of rawSellKeys) {
      const v = positivePrice(ppData[key]);
      if (v !== null) {
        sell = v;
        break;
      }
    }
  } else {
    const buyKeys = [
      `grade_${gradeKey}_buy`,
      `PP - Grade ${grade} Buy Price`,
      `${grade}_buy`,
      `grade_${gradeKey.replace("_", "")}_buy`,
    ];
    const sellKeys = [
      `grade_${gradeKey}_sell`,
      `PP - Grade ${grade} Sell Price`,
      `${grade}_sell`,
      `grade_${gradeKey.replace("_", "")}_sell`,
    ];

    for (const key of buyKeys) {
      const v = positivePrice(ppData[key]);
      if (v !== null) {
        buy = v;
        break;
      }
    }
    for (const key of sellKeys) {
      const v = positivePrice(ppData[key]);
      if (v !== null) {
        sell = v;
        break;
      }
    }
  }

  // Fallback to translation layer deterministic spread (0.66 buy / 1.10 sell) if explicit spreads are unrecorded
  const gradesMap = panelProfitsGrades(comic);
  const marketPrice = gradesMap[grade];
  if (marketPrice && buy === null) {
    buy = Number((marketPrice * 0.66).toFixed(2));
  }
  if (marketPrice && sell === null) {
    sell = Number((marketPrice * 1.10).toFixed(2));
  }

  return { buy, sell };
}

export function panelProfitsDelta(
  comic: Partial<ComicRecord>,
  grade: Grade
): number | null {
  const ppData = comic.panel_profits_data as Record<string, any> | undefined;
  if (!ppData?.deltas) return null;
  const val = ppData.deltas[grade];
  return typeof val === "number" ? val : null;
}

export function panelProfitsVolume(
  comic: Partial<ComicRecord>,
  grade: Grade
): string | null {
  const ppData = comic.panel_profits_data as Record<string, any> | undefined;
  if (!ppData) return null;
  if (ppData.volume) {
    const gradeKey = grade.replace(".", "_");
    const val =
      ppData.volume[grade] ??
      ppData.volume[grade.toLowerCase()] ??
      (grade === "RAW" ? ppData.volume.raw : ppData.volume[`grade_${gradeKey}`]);
    if (typeof val === "string") return val;
  }
  if (grade === "RAW" && typeof ppData["PP - Sales Volume"] === "string") {
    return ppData["PP - Sales Volume"];
  }
  return null;
}

export function comicBaseReference(comic: Partial<ComicRecord>): number | null {
  return positivePrice(comic.comicbase_price);
}

export function panelProfitsListings(
  comic: Partial<ComicRecord>,
  grade: Grade
): number | null {
  const ppData = comic.panel_profits_data as Record<string, any> | undefined;
  if (!ppData) return null;
  if (ppData.salesListings) {
    const listings = ppData.salesListings;
    const gradeKey = grade.replace(".", "_");
    const val =
      listings[grade] ??
      listings[grade.toLowerCase()] ??
      (grade === "RAW"
        ? (listings.raw ?? listings.ungraded ?? listings.ungradedCount)
        : (listings[`grade_${gradeKey}`] ?? listings[`grade${gradeKey.replace("_", "")}Count`]));
    if (typeof val === "number") return val;
  }
  if (grade === "9.8") {
    const countVal = ppData["Panel Profits Baseline Grade 9.8 Observation Count"] ?? ppData["PP - Grade 9.8 Observation Count"];
    if (countVal !== undefined && countVal !== null) {
      const n = Number(countVal);
      if (!isNaN(n) && n >= 0) return n;
    }
  }
  if (grade === "RAW") {
    const rawVal = ppData["PP - Grade RAW Observation Count"] ?? ppData["PP - Ungraded Observation Count"];
    if (rawVal !== undefined && rawVal !== null) {
      const n = Number(rawVal);
      if (!isNaN(n) && n >= 0) return n;
    }
  }
  return null;
}

/**
 * Returns certified graded slab spreads (CGC / Slabbed).
 * Certified slabs NEVER carry a RAW or ungraded price/spread.
 */
export function cgcSpreads(comic: Partial<ComicRecord>, grade: Grade): ExecutionSpreads {
  if (grade === "RAW") return { buy: null, sell: null };
  return panelProfitsSpreads(comic, grade);
}

/**
 * Returns certified graded slab volume.
 * Certified grading authorities NEVER report RAW copies.
 */
export function cgcVolume(comic: Partial<ComicRecord>, grade: Grade): string | null {
  if (grade === "RAW") return null;
  return panelProfitsVolume(comic, grade);
}

/**
 * Returns certified graded slab sold listings count.
 * Certified slabs NEVER report RAW copies.
 */
export function cgcListings(comic: Partial<ComicRecord>, grade: Grade): number | null {
  if (grade === "RAW") return null;
  return panelProfitsListings(comic, grade);
}

