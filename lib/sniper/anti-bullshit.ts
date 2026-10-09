import { ComicEra, GradingCompany, SniperFilterProfile } from "./types";

// Blacklisted keywords that immediately disqualify a listing as modern reprint / toy / giveaway
const REPRINT_REJECTIONS = [
  "facsimile",
  "reprint",
  "replica",
  "tribute edition",
  "golden record",
  "true believers",
  "millennium edition",
  "free comic book day",
  "fcbd",
  "pocket digest",
  "digest size",
  "mini comic",
  "mini-comic",
  "giveaway",
  "halloween comicfest",
  "loot crate",
  "marvel legends pack-in",
  "newspaper insert",
  "poster book",
  "sample",
];

// Deceased & Legendary comic creators whose verified signatures command permanent premium
export const LEGENDARY_CREATORS = [
  "stan lee",
  "jack kirby",
  "steve ditko",
  "george perez",
  "george pérez",
  "neal adams",
  "bernie wrightson",
  "john buscema",
  "len wein",
  "carmine infantino",
  "joe kubert",
  "dave cockrum",
  "curt swan",
  "jim aparo",
  "tim sale",
  "kevin o'neill",
];

export interface TitleParseResult {
  isCertifiedSlab: boolean;
  gradingCompany: GradingCompany | null;
  grade: number | null;
  isReprintOrToy: boolean;
  reprintTrigger?: string;
  isDamagedSlab: boolean;
  isCrackAndPressCandidate: boolean;
  isNewsstand: boolean;
  isConvention: boolean;
  isSigned: boolean;
  signatureCount: number;
  isLegendarySigned: boolean;
  signer?: string;
  certNumber?: string;
  certLookupUrl?: string;
  extractedSeries: string;
  extractedIssue: string;
  extractedYear?: number;
  extractedEra: ComicEra;
}

export function parseAndFilterListing(
  title: string,
  description: string = "",
  graderNotes: string = ""
): TitleParseResult {
  const fullText = `${title} ${description} ${graderNotes}`.toLowerCase();

  // 1. Check for Reprints / Mini-comics / Giveaways
  let isReprintOrToy = false;
  let reprintTrigger: string | undefined;

  for (const term of REPRINT_REJECTIONS) {
    if (fullText.includes(term)) {
      isReprintOrToy = true;
      reprintTrigger = term;
      break;
    }
  }

  // 2. Certification & Grade Extraction (CGC / CBCS)
  let gradingCompany: GradingCompany | null = null;
  let grade: number | null = null;
  let isCertifiedSlab = false;

  if (/\bcgc\b/i.test(title)) {
    gradingCompany = "CGC";
    isCertifiedSlab = true;
  } else if (/\bcbcs\b/i.test(title)) {
    gradingCompany = "CBCS";
    isCertifiedSlab = true;
  }

  // Extract Grade: e.g. 9.8, 9.6, 9.4, 9.2, 9.0, 8.5
  const gradeMatch = title.match(/\b(10(?:\.0)?|9\.[0-9]|8\.[0-9]|7\.[0-9]|6\.[0-9]|5\.[0-9]|4\.[0-9]|3\.[0-9]|2\.[0-9]|1\.[0-9]|0\.5)\b/);
  if (gradeMatch) {
    grade = parseFloat(gradeMatch[1]);
  }

  // 2b. Extract Certification Number (CGC / CBCS cert #)
  let certNumber: string | undefined;
  let certLookupUrl: string | undefined;

  const certMatch = fullText.match(/\b(?:cert(?:ification)?|cgc|cbcs)?\s*(?:#|no\.?|number)?\s*:?\s*([0-9]{7,10}(?:-[0-9]{3})?)\b/i);
  if (certMatch && certMatch[1] && certMatch[1].length >= 7) {
    certNumber = certMatch[1];
    const cleanCert = certNumber.replace(/[^0-9]/g, "");
    if (gradingCompany === "CBCS") {
      certLookupUrl = `https://www.cbcscomics.com/grading/verify-certification-number?cert_num=${cleanCert}`;
    } else {
      // Default to CGC lookup
      certLookupUrl = `https://www.cgccomics.com/certlookup/${cleanCert}/`;
    }
  }

  // 3. Damaged Slab / Cracked Case Angle
  const damagedSlabRegex = /\b(crack(?:ed)?\s+(?:case|slab|holder|plastic|corner)|scuff(?:ed)?\s+case|reholder\s+candidate|scratched\s+holder)\b/i;
  const isDamagedSlab = damagedSlabRegex.test(fullText);

  // 4. Crack and Press Candidate Detection (pressable grader defects)
  const pressDefectRegex = /\b(non-color\s*breaking|light\s+bend|pressable|waviness|wavy\s+cover|finger\s+bend|light\s+indent|spine\s+roll|surface\s+dirt)\b/i;
  const isCrackAndPressCandidate = (grade !== null && grade >= 9.0 && grade <= 9.6) && pressDefectRegex.test(fullText);

  // 5. Newsstand & Convention Edition Detection
  const isNewsstand = /\bnewsstand\b/i.test(fullText) || /\b(upc|barcode)\b/i.test(fullText);
  const isConvention = /\b(convention|con\s+exclusive|sdcc|nycc|eccc|c2e2)\b/i.test(fullText);

  // 6. Signature Detection & Multi-Sig Stacking
  let isSigned = false;
  let signatureCount = 0;
  let isLegendarySigned = false;
  let signer: string | undefined;

  const yellowLabel = /\b(signature\s+series|ss|yellow\s+label|gold\s+label|signed\s+by|signed|autographed)\b/i.test(fullText);
  if (yellowLabel) {
    isSigned = true;
    signatureCount = 1;
    // Check multi-sig counts in title/desc
    if (/\b(quad\s*signed|4x\s*signed|4\s*signatures|signed\s+by\s+4)\b/i.test(fullText)) {
      signatureCount = 4;
    } else if (/\b(triple\s*signed|3x\s*signed|3\s*signatures|signed\s+by\s+3)\b/i.test(fullText)) {
      signatureCount = 3;
    } else if (/\b(dual\s*signed|double\s*signed|2x\s*signed|2\s*signatures|signed\s+by\s+2)\b/i.test(fullText)) {
      signatureCount = 2;
    }

    for (const creator of LEGENDARY_CREATORS) {
      if (fullText.includes(creator)) {
        isLegendarySigned = true;
        signer = creator.toUpperCase();
        break;
      }
    }
  }

  // 7. Series & Issue Extraction
  let extractedSeries = "Unknown Series";
  let extractedIssue = "1";
  let extractedYear: number | undefined;

  const yearMatch = title.match(/\b(19\d{2}|20\d{2})\b/);
  if (yearMatch) {
    extractedYear = parseInt(yearMatch[1], 10);
  }

  // Issue number match (e.g. #128, #7, No. 128, # 128)
  const hashMatch = title.match(/#\s*(\d+[a-zA-Z]?(?:\.\d+)?)/);
  if (hashMatch) {
    extractedIssue = hashMatch[1];
    const beforeHash = title.substring(0, title.indexOf("#"));
    const cleanedBefore = beforeHash
      .replace(/\b(cgc|cbcs|pgx)\b/gi, "")
      .replace(/\b(19\d{2}|20\d{2})\b/g, "")
      .replace(/\bvol(?:\.|ume)?\s*\d+/gi, "")
      .replace(/[\[\]\(\)\{\}]/g, "")
      .trim();
    if (cleanedBefore.length > 0) {
      extractedSeries = cleanedBefore;
    }
  } else {
    const noMatch = title.match(/\bno\.\s*(\d+)/i);
    if (noMatch) {
      extractedIssue = noMatch[1];
    }
  }

  // Check for independent / alternative publishers
  const isIndyPublisher = /\b(image|dark\s*horse|valiant|idw|boom|dynamite|vertigo|fantagraphics|mirage|pacific|kitchen\s*sink|malibu|eclipse|crossgen|avatar|oni\s*press)\b/i.test(fullText);

  // Determine Era with full canonical precision
  let extractedEra: ComicEra = "modern";
  if (isIndyPublisher && (extractedYear ? extractedYear >= 1980 : true)) {
    extractedEra = "indy";
  } else if (extractedYear) {
    if (extractedYear < 1938) extractedEra = "platinum";
    else if (extractedYear <= 1945) extractedEra = "golden";
    else if (extractedYear <= 1955) extractedEra = "atomic";
    else if (extractedYear <= 1969) extractedEra = "silver";
    else if (extractedYear <= 1983) extractedEra = "bronze";
    else if (extractedYear <= 1991) extractedEra = "copper";
    else if (extractedYear <= 2009) extractedEra = "modern";
    else extractedEra = "postmodern";
  } else {
    // Heuristic era fallback from series keywords
    if (/action comics|detective comics|batman|superman/i.test(title) && grade !== null && grade <= 9.2) {
      extractedEra = "silver";
    }
  }

  return {
    isCertifiedSlab,
    gradingCompany,
    grade,
    isReprintOrToy,
    reprintTrigger,
    isDamagedSlab,
    isCrackAndPressCandidate,
    isNewsstand,
    isConvention,
    isSigned,
    signatureCount,
    isLegendarySigned,
    signer,
    certNumber,
    certLookupUrl,
    extractedSeries,
    extractedIssue,
    extractedYear,
    extractedEra,
  };
}

export function getEraDisplayName(era: ComicEra): string {
  switch (era) {
    case "platinum":
      return "Platinum Age (<1938)";
    case "golden":
      return "Golden Age (1938-1945)";
    case "atomic":
      return "Atomic Age (1946-1955)";
    case "silver":
      return "Silver Age (1956-1969)";
    case "bronze":
      return "Bronze Age (1970-1983)";
    case "copper":
      return "Copper Age (1984-1991)";
    case "modern":
      return "Modern Age (1992-2009)";
    case "postmodern":
      return "Post-Modern (2010+)";
    case "indy":
      return "Indy / Alternative";
    default:
      return era;
  }
}
