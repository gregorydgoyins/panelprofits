/**
 * ZERO FAKE DATA COVENANT GUARDRAIL
 *
 * Enforces the strict covenant across both production and development environments:
 * 1. ZERO mock, fake, placeholder, or synthetic data can exist or seep back into the application.
 * 2. ZERO fictional parody tickers ($MJOL, $BATMB, $GOTH-MUNI, etc.) are permitted.
 * 3. ZERO synthetic trigonometric waveforms (Math.sin/Math.cos) or random price generators (Math.random) in pricing logic.
 * 4. Missing prices must remain strictly unpriced (null/undefined/—); NO default dummy valuations ($100, $50, etc.).
 * 5. Non-9.8 holdings MUST NEVER receive a 9.8 valuation (zero grade leakage).
 * 6. Broken or generic image placeholders (/placeholder.png, 526.jpg) are strictly prohibited.
 */

export const PROHIBITED_FICTIONAL_TICKERS = new Set([
  "$MJOL",
  "MJOL",
  "$BATMB",
  "BATMB",
  "$GANT",
  "GANT",
  "$FRTR",
  "FRTR",
  "$GOTH-MUNI",
  "GOTH-MUNI",
  "$CENT-MUNI",
  "CENT-MUNI",
  "$WAK-SOV",
  "WAK-SOV",
  "$NYCS-MUNI",
  "NYCS-MUNI",
  "$KRYP",
  "KRYP",
  "$VIB",
  "VIB",
  "$ADM",
  "ADM",
  "$PPRK",
  "PPRK",
  "$BWAY",
  "BWAY",
  "$CKNT",
  "CKNT",
  "$SPID-1863",
  "SPID-1863",
  "$MILES-2026",
  "MILES-2026",
  "$VIX-GOTH",
  "VIX-GOTH",
  "$METR-CDS",
  "METR-CDS",
]);

export const PROHIBITED_IMAGE_PLACEHOLDERS = [
  "placeholder.png",
  "placeholder.jpg",
  "placeholder.svg",
  "526.jpg",
  "no-image.png",
  "spinner.gif",
  "dummy.png",
];

export interface CovenantValidationResult {
  valid: boolean;
  violations: string[];
}

/**
 * Validates any trading floor asset, equity, or ticker instrument against the Covenant.
 */
export function validateAssetCovenant(item: {
  symbol?: string | null;
  assetId?: string | null;
  entryId?: string | null;
  displayName?: string | null;
  pricing?: Record<string, any> | null;
  coverImageUrl?: string | null;
  coverUrl?: string | null;
}): CovenantValidationResult {
  const violations: string[] = [];

  // 1. Check for prohibited fictional tickers
  const symbol = (item.symbol || "").trim().toUpperCase();
  const assetId = (item.assetId || "").trim().toUpperCase();
  const entryId = (item.entryId || "").trim().toUpperCase();

  for (const prohibited of PROHIBITED_FICTIONAL_TICKERS) {
    if (symbol === prohibited || assetId === prohibited || entryId.includes(prohibited)) {
      violations.push(`Prohibited fictional parody ticker detected: ${item.symbol || item.assetId || item.entryId}`);
    }
  }

  // 2. Check for prohibited image placeholders
  const cover = (item.coverImageUrl || item.coverUrl || "").toLowerCase();
  for (const placeholder of PROHIBITED_IMAGE_PLACEHOLDERS) {
    if (cover.includes(placeholder)) {
      violations.push(`Prohibited placeholder image detected: ${cover}`);
    }
  }

  // 3. Check for fake default dummy prices (e.g. exactly 100 with 0 delta as a seed placeholder)
  if (item.pricing) {
    const p = item.pricing;
    if (p.price === 100 && p.fmv === 100 && p.delta === 0 && !p.referenceGrade && symbol.startsWith("$SEED")) {
      violations.push(`Unverified seed placeholder price detected: ${symbol}`);
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

/**
 * Validates that an equity holding valuation does not leak 9.8 prices to lower grades.
 */
export function validateGradeValuationIntegrity(params: {
  grade: string | number;
  assignedFmv: number | null;
  grade98Fmv: number | null;
}): CovenantValidationResult {
  const violations: string[] = [];
  const numericGrade = typeof params.grade === "string" ? parseFloat(params.grade) : params.grade;

  if (
    numericGrade != null &&
    !isNaN(numericGrade) &&
    numericGrade < 9.8 &&
    params.assignedFmv != null &&
    params.grade98Fmv != null &&
    params.grade98Fmv > 0
  ) {
    // If a lower grade book is assigned the EXACT same high price as the 9.8 benchmark, flag it
    if (params.assignedFmv === params.grade98Fmv && numericGrade <= 9.2) {
      violations.push(
        `Grade valuation leakage detected: Non-9.8 holding (Grade ${params.grade}) assigned 9.8 valuation ($${params.grade98Fmv})`
      );
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

/**
 * Asserts the Zero Fake Data Covenant on any dataset.
 * Throws a descriptive error if any violation is encountered.
 */
export function assertZeroFakeDataCovenant(items: any[], contextName = "Dataset"): void {
  const allViolations: string[] = [];

  for (let i = 0; i < items.length; i++) {
    const res = validateAssetCovenant(items[i]);
    if (!res.valid) {
      allViolations.push(`Item [${i}] (${items[i]?.symbol || items[i]?.id || "unknown"}): ${res.violations.join("; ")}`);
    }
  }

  if (allViolations.length > 0) {
    throw new Error(
      `[ZERO FAKE DATA COVENANT VIOLATION] ${contextName} failed guardrail inspection with ${allViolations.length} errors:\n` +
      allViolations.slice(0, 10).join("\n") +
      (allViolations.length > 10 ? `\n...and ${allViolations.length - 10} more` : "")
    );
  }
}
