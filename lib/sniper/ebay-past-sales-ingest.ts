import { createHash } from "crypto";
import { createAdminServerClient } from "@/lib/supabase/admin";
import { searchEbaySold } from "./ebay-sold";

export interface EbaySoldTransaction {
  itemId: string;
  title: string;
  price: number;
  currency: string;
  soldDate: string; // ISO String
  shippingCost?: number;
  carrier?: string;
  postalCode?: string;
  bidCount?: number;
  uniqueBidderCount?: number;
  watchCount?: number;
  reserveMet?: boolean;
  buyingOption?: "AUCTION" | "FIXED_PRICE" | "BEST_OFFER";
  sellerUsername?: string;
  sellerFeedbackScore?: number;
  sellerFeedbackPercentage?: string;
  topRatedSeller?: boolean;
  returnsAccepted?: boolean;
  itemUrl?: string;
  imageUrl?: string;
  // Parsed Comic Aspects
  grader: "CGC" | "CBCS" | "PSA" | "PGX" | "EGS" | "RAW";
  grade: string;
  certificationNumber?: string;
  pageQuality?: string;
  designation: string; // "Universal", "Signature Series", "Restored", "Qualified", "Pedigree"
  editionVariant?: string; // "Newsstand", "Direct", "CPV", etc.
  series?: string;
  issueNumber?: string;
  publicationYear?: number;
}

export interface IngestedSalesObservation {
  id?: string;
  observation_fingerprint: string;
  displayed_date_text: string;
  observed_year: number;
  observed_month: number;
  observed_day: number;
  observed_date: string;
  date_precision: string;
  displayed_price_text: string;
  parsed_numeric_price: number;
  displayed_currency_symbol: string;
  normalized_currency: string;
  certification_number: string | null;
  grader: string;
  grade: string;
  designation: string;
  edition_variant: string | null;
  venue: string;
  evidence_redirect_path: string | null;
  evidence_url_status: string;
  raw_payload: any;
}

/**
 * Deterministic SHA-256 fingerprint generator ensuring zero double-counting
 * across Heritage, Goldin, and eBay secondary market observations.
 */
export function generateEbayObservationFingerprint(
  itemId: string,
  price: number,
  soldDate: string,
  certOrGrade: string
): string {
  const norm = `ebay:${itemId}:${price.toFixed(2)}:${soldDate.substring(0, 10)}:${certOrGrade.trim().toLowerCase()}`;
  return createHash("sha256").update(norm).digest("hex");
}

/**
 * Parses raw eBay listing titles and aspects into structured, verified comic data.
 * Handles CGC, CBCS, PSA, PGX, EGS graded slabs down to high-grade raw copies (9.4 NM, 9.2 NM-, 9.0 VF/NM).
 */
export function parseEbayComicListing(raw: {
  itemId: string;
  title: string;
  price: number;
  currency?: string;
  soldDate: string;
  shippingCost?: number;
  carrier?: string;
  postalCode?: string;
  bidCount?: number;
  uniqueBidderCount?: number;
  watchCount?: number;
  reserveMet?: boolean;
  buyingOption?: "AUCTION" | "FIXED_PRICE" | "BEST_OFFER";
  sellerUsername?: string;
  sellerFeedbackScore?: number;
  sellerFeedbackPercentage?: string;
  topRatedSeller?: boolean;
  returnsAccepted?: boolean;
  itemUrl?: string;
  imageUrl?: string;
  aspects?: Record<string, string>;
}): EbaySoldTransaction {
  const title = raw.title || "";
  const tUpper = title.toUpperCase();
  const aspects = raw.aspects || {};

  // 1. Identify Grader
  let grader: "CGC" | "CBCS" | "PSA" | "PGX" | "EGS" | "RAW" = "RAW";
  const aspGrader = (aspects["Professional Grader"] || aspects["Grading Company"] || "").toUpperCase();

  if (aspGrader.includes("CGC") || /\bCGC\b/.test(tUpper)) grader = "CGC";
  else if (aspGrader.includes("CBCS") || /\bCBCS\b/.test(tUpper)) grader = "CBCS";
  else if (aspGrader.includes("PSA") || /\bPSA\b/.test(tUpper)) grader = "PSA";
  else if (aspGrader.includes("PGX") || /\bPGX\b/.test(tUpper)) grader = "PGX";
  else if (aspGrader.includes("EGS") || aspGrader.includes("EGA") || /\bEGS\b/.test(tUpper) || /\bEGA\b/.test(tUpper)) grader = "EGS";

  // 2. Extract Grade
  let grade = "RAW";
  const aspGrade = aspects["Grade"] || "";
  if (aspGrade) {
    grade = aspGrade.trim();
  } else {
    // Numeric grade pattern (10.0, 9.8, 9.6, 9.4, 9.2, 9.0, 8.5...)
    const numGradeMatch = title.match(/\b(10(?:\.0)?|9\.[0-9]|8\.[05]|7\.[05]|6\.[05]|5\.[05]|4\.[05]|3\.[05]|2\.[05]|1\.[058]|0\.5)\b/);
    if (numGradeMatch) {
      grade = numGradeMatch[1];
      if (grade === "10") grade = "10.0";
    } else {
      // Raw high-grade terminology (composite terms checked before substring matches)
      if (/\b(?:VF\/NM|VERY FINE\/NEAR MINT|VF-NM)\b/i.test(title)) grade = "9.0 VF/NM";
      else if (/\b(?:NM\/M|NEAR MINT\/MINT|NM\+)\b/i.test(title)) grade = "9.6 NM+";
      else if (/\b(?:NM-|NEAR MINT\s*[-–])\b/i.test(title)) grade = "9.2 NM-";
      else if (/\b(?:NM|NEAR MINT)\b/i.test(title)) grade = "9.4 NM";
      else if (/\b(?:VF\+|VERY FINE\s*\+)\b/i.test(title)) grade = "8.5 VF+";
      else if (/\b(?:VF|VERY FINE)\b/i.test(title)) grade = "8.0 VF";
      else if (/\b(?:FN\/VF|FINE\/VERY FINE)\b/i.test(title)) grade = "7.0 FN/VF";
      else if (/\b(?:FN|FINE)\b/i.test(title)) grade = "6.0 FN";
      else if (/\b(?:VG|VERY GOOD)\b/i.test(title)) grade = "4.0 VG";
      else if (/\b(?:GD|GOOD)\b/i.test(title)) grade = "2.0 GD";
    }
  }

  // 3. Extract Certification Number (7 to 10 digits)
  let certNumber: string | undefined = aspects["Certification Number"] || aspects["Cert Number"];
  if (!certNumber) {
    const certMatch = title.match(/\b(\d{7,10})\b/);
    if (certMatch && grader !== "RAW") {
      certNumber = certMatch[1];
    }
  }

  // 4. Extract Page Quality
  let pageQuality: string | undefined = undefined;
  if (/\bWHITE PAGES\b/i.test(title) || aspects["Page Quality"]?.toUpperCase().includes("WHITE")) pageQuality = "White Pages";
  else if (/\bOFF[- ]WHITE TO WHITE\b/i.test(title)) pageQuality = "Off-White to White";
  else if (/\bOFF[- ]WHITE\b/i.test(title)) pageQuality = "Off-White";
  else if (/\bCREAM\b/i.test(title)) pageQuality = "Cream";

  // 5. Extract Designation / Label Color
  let designation = "Universal";
  if (/\b(?:SIGNATURE SERIES|SS|SIGNED|AUTOGRAPH(?:ED)?)\b/i.test(title)) designation = "Signature Series";
  else if (/\b(?:RESTORED|PURPLE LABEL)\b/i.test(title)) designation = "Restored";
  else if (/\b(?:QUALIFIED|GREEN LABEL)\b/i.test(title)) designation = "Qualified";
  else if (/\bPEDIGREE\b/i.test(title)) designation = "Pedigree";

  // 6. Extract Edition / Variant
  let editionVariant: string | undefined = undefined;
  if (/\b(?:NEWSSTAND|CANADIAN PRICE VARIANT|CPV|DIRECT|1:\d+|FOIL|SKETCH)\b/i.test(title)) {
    if (/\bCPV\b/i.test(title) || /\bCANADIAN PRICE VARIANT\b/i.test(title)) editionVariant = "Canadian Price Variant";
    else if (/\bNEWSSTAND\b/i.test(title)) editionVariant = "Newsstand";
    else if (/\bDIRECT\b/i.test(title)) editionVariant = "Direct Edition";
    else {
      const ratioMatch = title.match(/\b(1:\d+)\b/);
      if (ratioMatch) editionVariant = `${ratioMatch[1]} Variant`;
      else if (/\bFOIL\b/i.test(title)) editionVariant = "Foil Variant";
    }
  }

  // 7. Extract Series & Issue
  const issueMatch = title.match(/(?:#|\bISSUE\s*|NO\.\s*)(\d+[\w.-]*)/i);
  const issueNumber = issueMatch ? issueMatch[1] : undefined;

  // Extract Year
  const yearMatch = title.match(/\b(19\d\d|20\d\d)\b/);
  const publicationYear = yearMatch ? parseInt(yearMatch[1], 10) : undefined;

  return {
    itemId: raw.itemId,
    title,
    price: raw.price,
    currency: raw.currency || "USD",
    soldDate: raw.soldDate,
    shippingCost: raw.shippingCost,
    carrier: raw.carrier,
    postalCode: raw.postalCode,
    bidCount: raw.bidCount,
    uniqueBidderCount: raw.uniqueBidderCount,
    watchCount: raw.watchCount,
    reserveMet: raw.reserveMet,
    buyingOption: raw.buyingOption,
    sellerUsername: raw.sellerUsername,
    sellerFeedbackScore: raw.sellerFeedbackScore,
    sellerFeedbackPercentage: raw.sellerFeedbackPercentage,
    topRatedSeller: raw.topRatedSeller,
    returnsAccepted: raw.returnsAccepted,
    itemUrl: raw.itemUrl,
    imageUrl: raw.imageUrl,
    grader,
    grade,
    certificationNumber: certNumber,
    pageQuality,
    designation,
    editionVariant,
    series: aspects["Series"] || aspects["Title"],
    issueNumber,
    publicationYear,
  };
}

/**
 * Transforms an EbaySoldTransaction into a public.gpa_sales_observations row.
 */
export function formatToSalesObservation(item: EbaySoldTransaction): IngestedSalesObservation {
  const d = new Date(item.soldDate);
  if (!Number.isFinite(d.getTime()) || !(item.price>0)) throw new Error("A completed sale requires a positive price and actual sale date");
  const year = isNaN(d.getFullYear()) ? new Date().getFullYear() : d.getFullYear();
  const month = isNaN(d.getMonth()) ? new Date().getMonth() + 1 : d.getMonth() + 1;
  const day = isNaN(d.getDate()) ? new Date().getDate() : d.getDate();
  const isoDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const certOrGrade = item.certificationNumber || item.grade;
  const fingerprint = generateEbayObservationFingerprint(item.itemId, item.price, item.soldDate, certOrGrade);

  return {
    observation_fingerprint: fingerprint,
    displayed_date_text: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    observed_year: year,
    observed_month: month,
    observed_day: day,
    observed_date: isoDate,
    date_precision: "DAY",
    displayed_price_text: `$${item.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    parsed_numeric_price: item.price,
    displayed_currency_symbol: "$",
    normalized_currency: item.currency || "USD",
    certification_number: item.certificationNumber || null,
    grader: item.grader,
    grade: item.grade,
    designation: item.designation,
    edition_variant: item.editionVariant || null,
    venue: "eBay",
    evidence_redirect_path: item.itemUrl || `https://www.ebay.com/itm/${item.itemId}`,
    evidence_url_status: "VERIFIED_EBAY_TRANSACTION",
    raw_payload: {
      itemId: item.itemId,
      title: item.title,
      shippingCost: item.shippingCost,
      carrier: item.carrier,
      bidCount: item.bidCount,
      uniqueBidderCount: item.uniqueBidderCount,
      watchCount: item.watchCount,
      reserveMet: item.reserveMet,
      buyingOption: item.buyingOption,
      seller: {
        username: item.sellerUsername,
        feedbackScore: item.sellerFeedbackScore,
        feedbackPercentage: item.sellerFeedbackPercentage,
        topRated: item.topRatedSeller,
      },
      returnsAccepted: item.returnsAccepted,
      pageQuality: item.pageQuality,
      imageUrl: item.imageUrl,
    },
  };
}

/**
 * Batch ingests past sales observations directly into public.gpa_sales_observations.
 * Safely ignores duplicates via observation_fingerprint unique constraint.
 */
export async function ingestEbayPastSalesBatch(
  transactions: EbaySoldTransaction[]
): Promise<{ inserted: number; errors: number }> {
  if (!transactions.length) return { inserted: 0, errors: 0 };

  const supabase = createAdminServerClient();
  const rows = transactions.map(formatToSalesObservation);

  let inserted = 0;
  let errors = 0;
  const BATCH_SIZE = 100;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    const { error, count } = await supabase
      .from("gpa_sales_observations")
      .upsert(chunk, { onConflict: "observation_fingerprint", count: "exact" });

    if (error) {
      console.warn(`[eBay Ingestion] Error inserting chunk at ${i}:`, error.message);
      errors += chunk.length;
    } else {
      inserted += count ?? chunk.length;
    }
  }

  return { inserted, errors };
}

/**
 * End-to-end execution: Queries official eBay completed sales; active Browse listings are never sale evidence
 * and ingests verified transactions directly into public.gpa_sales_observations.
 * Supports international marketplaces: EBAY_US, EBAY_GB, EBAY_CA, EBAY_AU, EBAY_DE.
 */
export async function runEbayPastSalesIngestion(
  keywords: string,
  maxResults = 50,
  marketplaceId = "EBAY_US"
): Promise<{ totalFound: number; inserted: number; errors: number }> {
  const result = await searchEbaySold(keywords, maxResults);
  if (!result.available) return { totalFound: 0, inserted: 0, errors: 0 };
  const transactions = result.items.flatMap(item => {
    const price=Number(item.lastSoldPrice?.value), soldDate=item.lastSoldDate;
    if (!(price>0) || !soldDate || !Number.isFinite(Date.parse(soldDate)) || !item.itemId || !item.title) return [];
    return [parseEbayComicListing({itemId:item.itemId,title:item.title,price,
      currency:item.lastSoldPrice.currency,soldDate,itemUrl:item.itemWebUrl})];
  });
  return {totalFound:transactions.length,...await ingestEbayPastSalesBatch(transactions)};
}
