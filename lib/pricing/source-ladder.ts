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

  // Extract RAW (ungraded) market price
  const rawCandidateKeys = [
    "PP - Ungraded Market Price",
    "PP - Raw Market Price",
    "raw_market_price",
    "ungraded_market_price",
    "raw_price",
    "raw",
    "ungraded",
  ];
  for (const key of rawCandidateKeys) {
    const stored = positivePrice(comic.panel_profits_data[key]);
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
      `pp_grade_${gradeKey}_price`,
      `${grade}_nm`,
    ];

    for (const key of candidateKeys) {
      const stored = positivePrice(comic.panel_profits_data[key]);
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
  const result: Partial<Record<Grade, number>> = {};
  const data = (comic as Record<string, unknown>).gocollect_data as Record<string, unknown> | undefined ||
    comic.panel_profits_data;
  if (!data) return result;

  const raw = positivePrice(data["GoCollect - Grade RAW"] || data["gc_raw_price"]);
  if (raw !== null) result["RAW"] = raw;

  for (const grade of GRADES) {
    if (grade === "RAW") continue;
    const gradeKey = grade.replace(".", "_");
    const stored = positivePrice(
      data[`GoCollect - Grade ${grade}`] ||
      data[`gc_grade_${gradeKey}_price`] ||
      data[`gocollect_${gradeKey}`]
    );
    if (stored !== null) result[grade] = stored;
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
 */
export function panelProfitsSpreads(comic: Partial<ComicRecord>, grade: Grade): ExecutionSpreads {
  if (!comic.panel_profits_data) return { buy: null, sell: null };
  const gradeKey = grade.replace(".", "_");

  const buy = positivePrice(
    comic.panel_profits_data[`${grade}_buy`] ||
    comic.panel_profits_data[`grade_${gradeKey}_buy`]
  );

  const sell = positivePrice(
    comic.panel_profits_data[`${grade}_sell`] ||
    comic.panel_profits_data[`grade_${gradeKey}_sell`]
  );

  return { buy, sell };
}

export function comicBaseReference(comic: Partial<ComicRecord>): number | null {
  return positivePrice(comic.comicbase_price);
}
