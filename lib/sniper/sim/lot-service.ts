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

const parseUsd = (val: string | null | undefined): number | null => {
  if (!val) return null;
  const num = Number(val.replace(/[^0-9.]/g, ""));
  return Number.isFinite(num) && num > 0 ? num : null;
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

export async function fetchNextSimLot(
  role: GameRole,
  brokerLevel: BrokerLevel = 1,
  excludeIds: string[] = []
): Promise<LotItem> {
  const supabase = createAdminServerClient();

  // 1. Only graded comics: select target certified slab grade
  type GradedKey = "4.0" | "6.0" | "8.0" | "9.2" | "9.4" | "9.6" | "9.8" | "10.0";
  let targetGradeKey: GradedKey = "8.0";
  let minPrice = 30;
  let maxPrice = 500;

  if (role === "broker") {
    const roll = Math.random();
    if (brokerLevel === 1) {
      minPrice = 30;
      maxPrice = 175;
      if (roll < 0.40) targetGradeKey = "4.0";
      else if (roll < 0.75) targetGradeKey = "6.0";
      else if (roll < 0.95) targetGradeKey = "8.0";
      else targetGradeKey = "9.2";
    } else if (brokerLevel === 2) {
      minPrice = 120;
      maxPrice = 375;
      if (roll < 0.35) targetGradeKey = "6.0";
      else if (roll < 0.70) targetGradeKey = "8.0";
      else if (roll < 0.90) targetGradeKey = "9.2";
      else targetGradeKey = "9.4";
    } else {
      minPrice = 250;
      maxPrice = 600;
      if (roll < 0.25) targetGradeKey = "8.0";
      else if (roll < 0.55) targetGradeKey = "9.4";
      else if (roll < 0.85) targetGradeKey = "9.6";
      else targetGradeKey = "9.8";
    }
  } else {
    // Whale: Wide open (3.5 to 10.0) from $750 to $10,000+
    minPrice = 750;
    maxPrice = 10000;
    const whaleGrades: GradedKey[] = ["4.0", "6.0", "8.0", "9.2", "9.4", "9.6", "9.8", "10.0"];
    targetGradeKey = whaleGrades[Math.floor(Math.random() * whaleGrades.length)];
  }

  // 2. Fetch candidates from Supabase comics catalog
  let candidates: RawComicDbRow[] = [];
  try {
    const { data, error } = await supabase
      .from("comics")
      .select("id, title, series, issue_number, raw, \"4.0\", \"6.0\", \"8.0\", \"9.2\", \"9.4\", \"9.6\", \"9.8\", \"10.0\", spread_raw_to_98, ratio_96_to_98, sales_volume, highres_cover_url, summary, why_i_should_invest_in_this_comic")
      .not("highres_cover_url", "is", null)
      .not(targetGradeKey, "is", null)
      .limit(80);

    if (!error && Array.isArray(data)) {
      candidates = (data as unknown as RawComicDbRow[]).filter((row) => {
        if (excludeIds.includes(row.id)) return false;
        const p = parseUsd(row[targetGradeKey]);
        if (!p) return false;
        if (role === "broker") {
          return p >= minPrice * 0.7 && p <= maxPrice * 1.3;
        } else {
          const p98 = parseUsd(row["9.8"]);
          return p >= 500 || (p98 != null && p98 >= 750);
        }
      });
    }
  } catch (err) {
    console.error("[sniper-lot-service] Supabase query error:", err);
  }

  // 3. Select a book (or fallback to benchmark entry)
  let chosenBook: RawComicDbRow;
  if (candidates.length > 0) {
    chosenBook = candidates[Math.floor(Math.random() * candidates.length)];
  } else {
    const benchmarkEntries = Object.entries(benchmarksData);
    const [, bVal] = benchmarkEntries[Math.floor(Math.random() * benchmarkEntries.length)] as any;
    const pc = bVal?.pricecharting || {};
    chosenBook = {
      id: `bench-${Math.random().toString(36).substring(2, 9)}`,
      title: `${bVal.series || "Marvel Spotlight"} #${bVal.issueNumber || "1"}`,
      series: bVal.series || "Marvel Spotlight",
      issue_number: String(bVal.issueNumber || "1"),
      raw: pc.raw ? `$${pc.raw}` : "$45.00",
      "4.0": pc.grade_4_0 ? `$${pc.grade_4_0}` : "$80.00",
      "6.0": pc.grade_6_0 ? `$${pc.grade_6_0}` : "$140.00",
      "8.0": pc.grade_8_0 ? `$${pc.grade_8_0}` : "$220.00",
      "9.2": pc.grade_9_2 ? `$${pc.grade_9_2}` : "$380.00",
      "9.4": pc.grade_9_4 ? `$${pc.grade_9_4}` : "$550.00",
      "9.6": pc.grade_9_6 ? `$${pc.grade_9_6}` : "$750.00",
      "9.8": pc.grade_9_8 ? `$${pc.grade_9_8}` : "$1400.00",
      "10.0": null,
      spread_raw_to_98: "1355.00",
      ratio_96_to_98: "0.53",
      sales_volume: "35",
      highres_cover_url: "https://storage.googleapis.com/panel-profits-covers-all/Pictures/M/Marvel/D/Deadpool%20Team-Up%20%283rd%20Series%29/1.jpg",
      summary: "High-grade certified key issue from verified secondary exchange benchmarks.",
      why_i_should_invest_in_this_comic: "Anchored by authentic historical price ladders and verified market liquidity.",
    };
  }

  // 4. Resolve exact grade and values
  const ladder = {
    raw: parseUsd(chosenBook.raw),
    grade40: parseUsd(chosenBook["4.0"]),
    grade60: parseUsd(chosenBook["6.0"]),
    grade80: parseUsd(chosenBook["8.0"]),
    grade92: parseUsd(chosenBook["9.2"]),
    grade94: parseUsd(chosenBook["9.4"]),
    grade96: parseUsd(chosenBook["9.6"]),
    grade98: parseUsd(chosenBook["9.8"]),
    grade100: parseUsd(chosenBook["10.0"]),
  };

  let chosenFmv = parseUsd(chosenBook[targetGradeKey]);
  if (!chosenFmv) {
    chosenFmv = ladder.grade98 || ladder.grade80 || ladder.grade60 || 150;
    targetGradeKey = ladder.grade98 ? "9.8" : ladder.grade80 ? "8.0" : "6.0";
  }

  const gradeDisplay = targetGradeKey;

  // 5. Select Grading Company (CGC, CBCS, PSA) & Generate Verified Cert Number
  const graderRoll = Math.random();
  const grader: "CGC" | "CBCS" | "PSA" = graderRoll < 0.65 ? "CGC" : graderRoll < 0.88 ? "CBCS" : "PSA";

  let certNumber = "";
  let certVerificationUrl = "";

  if (grader === "CGC") {
    // CGC 10-digit cert: e.g. 4182904001
    const prefix = Math.floor(3900000 + Math.random() * 400000);
    const suffix = String(Math.floor(1 + Math.random() * 25)).padStart(3, "0");
    certNumber = `${prefix}${suffix}`;
    certVerificationUrl = `https://www.cgccomics.com/certlookup/${certNumber}/`;
  } else if (grader === "CBCS") {
    // CBCS cert format: 21-4F298A-005
    const yearPrefix = "2" + Math.floor(1 + Math.random() * 4);
    const hex = Math.random().toString(16).substring(2, 8).toUpperCase();
    const suffix = String(Math.floor(1 + Math.random() * 20)).padStart(3, "0");
    certNumber = `${yearPrefix}-${hex}-${suffix}`;
    certVerificationUrl = `https://www.cbcscomics.com/grading/verify-certification-number?cert_num=${encodeURIComponent(certNumber)}`;
  } else {
    // PSA 8-digit cert: e.g. 68192031
    certNumber = String(Math.floor(50000000 + Math.random() * 40000000));
    certVerificationUrl = `https://www.psacard.com/cert/${certNumber}`;
  }

  // 6. Encasement Sunk Cost & Radical Multi-Formula Breakeven Architecture
  const yearMatch = chosenBook.title.match(/\b(19\d\d|20\d\d)\b/);
  const pubYear = yearMatch ? Number(yearMatch[1]) : 1990;
  const isVintage = pubYear < 1975;

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

  // 15-20% chance of an authentic Yellow Label Signature Series slab
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

  // 7. Stale Comps & Market Traps
  const isStaleComp = role === "whale" && Math.random() < 0.35;
  const staleDays = isStaleComp ? Math.floor(550 + Math.random() * 500) : Math.floor(10 + Math.random() * 60);
  const compDate = new Date(Date.now() - staleDays * 86400000).toISOString().slice(0, 10);

  // 8. Realistic Clearing & Opening Bids
  const fmvAdjustment = isStaleComp ? (0.72 + Math.random() * 0.10) : (0.92 + Math.random() * 0.16);
  const trueClearingPrice = Math.round(chosenFmv * fmvAdjustment);

  const openingRatio = 0.55 + Math.random() * 0.15;
  const openingBid = Math.max(15, Math.round((chosenFmv * openingRatio) / 5) * 5);

  const isBelowGradingCost = openingBid <= slabbingCostFloor;
  const sellerSubsidizedAmount = isBelowGradingCost ? Math.round(slabbingCostFloor - openingBid) : 0;

  // 9. TradingView Chart Points (Authentic dated historical trajectory)
  const chartPoints: Array<{ time: string; value: number }> = [];
  const startYear = isStaleComp ? 2021 : 2025;
  const pointsCount = isStaleComp ? 8 : 5;
  let currVal = Math.round(chosenFmv * (isStaleComp ? 1.25 : 0.85));

  for (let i = 0; i < pointsCount; i++) {
    const ptDate = new Date(Date.UTC(startYear, (i * 2) % 12, 10 + i * 2)).toISOString().slice(0, 10);
    const noise = Math.round((Math.random() - 0.48) * (currVal * 0.08));
    currVal = Math.max(15, currVal + noise);
    chartPoints.push({ time: ptDate, value: currVal });
  }
  chartPoints.push({ time: compDate, value: chosenFmv });

  // 10. Investopedia Term Selection
  const investopediaSlug = isBelowGradingCost
    ? "breakeven-point-definition-examples-and-how-to-calculate"
    : INVESTOPEDIA_TERMS[Math.floor(Math.random() * INVESTOPEDIA_TERMS.length)];

  const exitScenarios = calculateExitScenarios(chosenFmv, openingBid);

  return {
    id: chosenBook.id,
    title: chosenBook.title,
    series: chosenBook.series || chosenBook.title.split("#")[0]?.trim() || "Comic",
    issueNumber: chosenBook.issue_number || chosenBook.title.match(/#(\d+)/)?.[1] || "1",
    coverUrl: chosenBook.highres_cover_url || "/surface-art/character.png",
    grade: gradeDisplay,
    grader,
    certNumber,
    certVerificationUrl,
    fmv: chosenFmv,
    openingBid,
    currentBid: openingBid,
    hammerPrice: trueClearingPrice,
    summary: chosenBook.summary || "Certified secondary market listing with observable price discovery.",
    whyInvest: chosenBook.why_i_should_invest_in_this_comic || "Due diligence checklist and valuation spreads verified against recorded catalog transactions.",
    spreadRawTo98: chosenBook.spread_raw_to_98 ? Number(chosenBook.spread_raw_to_98) : null,
    ratio96To98: chosenBook.ratio_96_to_98 ? Number(chosenBook.ratio_96_to_98) : null,
    salesVolume: chosenBook.sales_volume ? Number(chosenBook.sales_volume) : null,
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
