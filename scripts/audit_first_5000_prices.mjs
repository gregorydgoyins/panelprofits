import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchFirst5000Comics() {
  console.log("Fetching first 5,000 comics from public.comics ordered by id...");
  const pageSize = 1000;
  const targetTotal = 5000;
  let allComics = [];
  let lastId = null;

  for (let page = 0; page < targetTotal / pageSize; page++) {
    const t0 = Date.now();
    let query = supabase
      .from("comics")
      .select("id, series, title, issue_number, publisher, publication_year, pp_source_id, pp_grade_9_8_price, comicbase_price, baseline_grade_9_8_value, baseline_grade_9_8_sources, baseline_grade_9_8_observation_count, panel_profits_data, comicbase_data")
      .order("id", { ascending: true })
      .limit(pageSize);

    if (lastId) {
      query = query.gt("id", lastId);
    }

    const { data, error } = await query;
    if (error) {
      console.error(`Error fetching page ${page + 1}:`, error);
      break;
    }

    if (!data || data.length === 0) {
      console.log(`No more data returned on page ${page + 1}.`);
      break;
    }

    allComics.push(...data);
    lastId = data[data.length - 1].id;
    console.log(`Page ${page + 1}: fetched ${data.length} records in ${Date.now() - t0}ms (total: ${allComics.length}, lastId: ${lastId.substring(0, 12)}...)`);

    if (data.length < pageSize) break;
  }

  return allComics;
}

function parseNum(val) {
  if (val === null || val === undefined || val === "") return null;
  const n = Number(String(val).replace(/[$,\s]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function auditPricing(comics) {
  console.log(`\nAuditing ${comics.length} comic records...`);

  const summary = {
    totalChecked: comics.length,
    completelyUnpriced: 0,
    hasAnyPrice: 0,
    
    // Column-level metrics
    hasPpGrade98Column: 0,
    hasComicbasePriceColumn: 0,
    hasBaselineGrade98Column: 0,

    // JSONB panel_profits_data metrics
    hasPpJson98: 0,
    hasPpJsonRaw: 0,
    hasBaselineJsonValue: 0,
    hasBaselineJsonSources: 0,

    // Model mixing & contamination analysis
    baselineSourcesBreakdown: {},
    purePp98Only: 0,
    pureComicbaseOnly: 0,
    bothPp98AndComicbase: 0,
    syntheticBlends: 0, // Where 9.8 is average of PP 9.8 and ComicBase raw
    comicbaseMasqueradingAs98: 0, // Where ComicBase raw price is stored as Baseline Grade 9.8 Value
    
    // Price inversions or anomalies
    inversionsWhereRawExceeds98: 0,
    discrepancyColumnVsJsonPp98: 0,
    extremePricesOver10k: 0,
    extremePricesOver100k: 0,

    // Value tracking for distributions
    allPp98Prices: [],
    allComicbasePrices: [],
    allBaselinePrices: [],
    allRawPrices: [],

    // Discrepancy details
    blendedExamples: [],
    cbAs98Examples: [],
    topValueComics: [],
    inversionExamples: []
  };

  for (const c of comics) {
    const ppCol = parseNum(c.pp_grade_9_8_price);
    const cbCol = parseNum(c.comicbase_price);
    const baseCol = parseNum(c.baseline_grade_9_8_value);
    
    const ppData = c.panel_profits_data && typeof c.panel_profits_data === "object" ? c.panel_profits_data : {};
    const ppJson98 = parseNum(ppData["PP - Grade 9.8 Market Price"]);
    const ppJsonRaw = parseNum(ppData["PP - Ungraded Market Price"]);
    const baseJsonVal = parseNum(ppData["Panel Profits Baseline Grade 9.8 Value"]);
    const baseJsonSrc = ppData["Panel Profits Baseline Grade 9.8 Sources"] || null;

    if (ppCol !== null) summary.hasPpGrade98Column++;
    if (cbCol !== null) summary.hasComicbasePriceColumn++;
    if (baseCol !== null) summary.hasBaselineGrade98Column++;

    if (ppJson98 !== null) summary.hasPpJson98++;
    if (ppJsonRaw !== null) summary.hasPpJsonRaw++;
    if (baseJsonVal !== null) summary.hasBaselineJsonValue++;
    if (baseJsonSrc) {
      summary.hasBaselineJsonSources++;
      summary.baselineSourcesBreakdown[baseJsonSrc] = (summary.baselineSourcesBreakdown[baseJsonSrc] || 0) + 1;
    }

    const effectivePp98 = ppCol ?? ppJson98;
    const effectiveCb = cbCol;
    const effectiveBaseline = baseCol ?? baseJsonVal;

    if (!effectivePp98 && !effectiveCb && !effectiveBaseline && !ppJsonRaw) {
      summary.completelyUnpriced++;
    } else {
      summary.hasAnyPrice++;
    }

    if (effectivePp98 !== null) summary.allPp98Prices.push(effectivePp98);
    if (effectiveCb !== null) summary.allComicbasePrices.push(effectiveCb);
    if (effectiveBaseline !== null) summary.allBaselinePrices.push(effectiveBaseline);
    if (ppJsonRaw !== null) summary.allRawPrices.push(ppJsonRaw);

    // Classification of pricing models
    if (effectivePp98 !== null && effectiveCb === null) {
      summary.purePp98Only++;
    } else if (effectivePp98 === null && effectiveCb !== null) {
      summary.pureComicbaseOnly++;
    } else if (effectivePp98 !== null && effectiveCb !== null) {
      summary.bothPp98AndComicbase++;
    }

    // Check for synthetic blending: e.g. baseJsonSrc contains "+" or equals average
    if (baseJsonSrc && baseJsonSrc.includes("+")) {
      summary.syntheticBlends++;
      if (summary.blendedExamples.length < 15) {
        summary.blendedExamples.push({
          id: c.id,
          series: c.series,
          issue: c.issue_number,
          publisher: c.publisher,
          pp_grade_9_8_price: effectivePp98,
          comicbase_price: effectiveCb,
          baseline_grade_9_8_value: baseJsonVal,
          source_label: baseJsonSrc,
          arithmeticAvg: effectivePp98 && effectiveCb ? Number(((effectivePp98 + effectiveCb) / 2).toFixed(2)) : null
        });
      }
    }

    // Check for ComicBase raw price masquerading as 9.8 value
    if (baseJsonSrc === "ComicBase Price" || (baseJsonVal !== null && effectiveCb !== null && Math.abs(baseJsonVal - effectiveCb) < 0.01 && effectivePp98 === null)) {
      summary.comicbaseMasqueradingAs98++;
      if (summary.cbAs98Examples.length < 15) {
        summary.cbAs98Examples.push({
          id: c.id,
          series: c.series,
          issue: c.issue_number,
          publisher: c.publisher,
          comicbase_raw_price: effectiveCb,
          stored_baseline_9_8_val: baseJsonVal,
          source_label: baseJsonSrc
        });
      }
    }

    // Discrepancy between clean column and json 9.8
    if (ppCol !== null && ppJson98 !== null && Math.abs(ppCol - ppJson98) > 0.01) {
      summary.discrepancyColumnVsJsonPp98++;
    }

    // Price inversion (Raw > 9.8)
    if (ppJsonRaw !== null && effectivePp98 !== null && ppJsonRaw > effectivePp98) {
      summary.inversionsWhereRawExceeds98++;
      if (summary.inversionExamples.length < 10) {
        summary.inversionExamples.push({
          id: c.id,
          series: c.series,
          issue: c.issue_number,
          rawPrice: ppJsonRaw,
          grade98Price: effectivePp98
        });
      }
    }

    // Extreme high value books
    const maxVal = Math.max(effectivePp98 || 0, effectiveCb || 0, effectiveBaseline || 0);
    if (maxVal >= 100000) summary.extremePricesOver100k++;
    else if (maxVal >= 10000) summary.extremePricesOver10k++;

    if (maxVal > 0) {
      summary.topValueComics.push({
        id: c.id,
        series: c.series,
        issue: c.issue_number,
        publisher: c.publisher,
        year: c.publication_year,
        maxVal,
        pp_98: effectivePp98,
        comicbase: effectiveCb,
        baseline_98: effectiveBaseline,
        source: baseJsonSrc
      });
    }
  }

  // Sort top value comics
  summary.topValueComics.sort((a, b) => b.maxVal - a.maxVal);
  summary.topValueComics = summary.topValueComics.slice(0, 30);

  function getStats(arr) {
    if (arr.length === 0) return { count: 0, min: 0, max: 0, median: 0, mean: 0, p75: 0, p90: 0 };
    const sorted = [...arr].sort((a, b) => a - b);
    const count = sorted.length;
    const sum = sorted.reduce((a, b) => a + b, 0);
    const min = sorted[0];
    const max = sorted[count - 1];
    const mean = Number((sum / count).toFixed(2));
    const median = sorted[Math.floor(count * 0.5)];
    const p75 = sorted[Math.floor(count * 0.75)];
    const p90 = sorted[Math.floor(count * 0.90)];
    return { count, min, max, median, mean, p75, p90 };
  }

  const ppStats = getStats(summary.allPp98Prices);
  const cbStats = getStats(summary.allComicbasePrices);
  const baseStats = getStats(summary.allBaselinePrices);
  const rawStats = getStats(summary.allRawPrices);

  return {
    summary,
    ppStats,
    cbStats,
    baseStats,
    rawStats
  };
}

async function main() {
  const comics = await fetchFirst5000Comics();
  console.log(`Successfully retrieved ${comics.length} records.`);

  const auditResult = auditPricing(comics);
  const { summary, ppStats, cbStats, baseStats, rawStats } = auditResult;

  console.log("\n===============================================================================");
  console.log("             PANEL PROFITS: FIRST 5,000 COMICS PRICING AUDIT REPORT             ");
  console.log("===============================================================================\n");

  console.log(`TOTAL RECORDS AUDITED: ${summary.totalChecked}`);
  console.log(`- Completely Unpriced: ${summary.completelyUnpriced} (${((summary.completelyUnpriced / summary.totalChecked) * 100).toFixed(1)}%)`);
  console.log(`- Have Any Price Data: ${summary.hasAnyPrice} (${((summary.hasAnyPrice / summary.totalChecked) * 100).toFixed(1)}%)`);

  console.log("\n--- COLUMN-LEVEL PRICING METRICS ---");
  console.log(`- pp_grade_9_8_price column populated: ${summary.hasPpGrade98Column}`);
  console.log(`- comicbase_price column populated:    ${summary.hasComicbasePriceColumn}`);
  console.log(`- baseline_grade_9_8_value column:     ${summary.hasBaselineGrade98Column}`);

  console.log("\n--- JSONB (panel_profits_data) PRICING METRICS ---");
  console.log(`- 'PP - Grade 9.8 Market Price' present: ${summary.hasPpJson98}`);
  console.log(`- 'PP - Ungraded Market Price' present:  ${summary.hasPpJsonRaw}`);
  console.log(`- 'Panel Profits Baseline Grade 9.8 Value' present: ${summary.hasBaselineJsonValue}`);
  console.log(`- 'Panel Profits Baseline Grade 9.8 Sources' present: ${summary.hasBaselineJsonSources}`);

  console.log("\n--- BREAKDOWN OF 'Panel Profits Baseline Grade 9.8 Sources' LABELS ---");
  for (const [src, count] of Object.entries(summary.baselineSourcesBreakdown)) {
    console.log(`  * "${src}": ${count} records (${((count / summary.totalChecked) * 100).toFixed(1)}%)`);
  }

  console.log("\n--- MODEL MIXING & CONTAMINATION AUDIT (CRITICAL FINDINGS) ---");
  console.log(`1. Pure Authentic PP Grade 9.8 Only (no ComicBase): ${summary.purePp98Only}`);
  console.log(`2. Pure ComicBase Raw Price Only (no PP 9.8):        ${summary.pureComicbaseOnly}`);
  console.log(`3. Both PP 9.8 & ComicBase Present:                  ${summary.bothPp98AndComicbase}`);
  console.log(`4. SYNTHETIC BLENDS (PP 9.8 + ComicBase Raw avg):    ${summary.syntheticBlends}`);
  console.log(`5. COMICBASE RAW LABELED AS 'GRADE 9.8 VALUE':       ${summary.comicbaseMasqueradingAs98}`);
  console.log(`6. Price Inversions (Ungraded Raw > Grade 9.8):      ${summary.inversionsWhereRawExceeds98}`);

  console.log("\n--- STATISTICAL DISTRIBUTIONS ---");
  console.log("Panel Profits 9.8 Prices (Count: " + ppStats.count + "):");
  console.log(`  Min: $${ppStats.min} | Median: $${ppStats.median} | Mean: $${ppStats.mean} | 75th: $${ppStats.p75} | 90th: $${ppStats.p90} | Max: $${ppStats.max}`);

  console.log("\nComicBase Prices (Count: " + cbStats.count + "):");
  console.log(`  Min: $${cbStats.min} | Median: $${cbStats.median} | Mean: $${cbStats.mean} | 75th: $${cbStats.p75} | 90th: $${cbStats.p90} | Max: $${cbStats.max}`);

  console.log("\nStored Baseline 9.8 Values (Count: " + baseStats.count + "):");
  console.log(`  Min: $${baseStats.min} | Median: $${baseStats.median} | Mean: $${baseStats.mean} | 75th: $${baseStats.p75} | 90th: $${baseStats.p90} | Max: $${baseStats.max}`);

  console.log("\nRaw / Ungraded Prices (Count: " + rawStats.count + "):");
  console.log(`  Min: $${rawStats.min} | Median: $${rawStats.median} | Mean: $${rawStats.mean} | 75th: $${rawStats.p75} | 90th: $${rawStats.p90} | Max: $${rawStats.max}`);

  console.log("\n--- SAMPLE: SYNTHETIC BLENDS (PP 9.8 Averaged with ComicBase Raw) ---");
  console.table(summary.blendedExamples.slice(0, 10), ["series", "issue", "pp_grade_9_8_price", "comicbase_price", "arithmeticAvg", "baseline_grade_9_8_value", "source_label"]);

  console.log("\n--- SAMPLE: COMICBASE RAW LABELED AS 'GRADE 9.8 VALUE' ---");
  console.table(summary.cbAs98Examples.slice(0, 10), ["series", "issue", "comicbase_raw_price", "stored_baseline_9_8_val", "source_label"]);

  console.log("\n--- TOP 15 HIGHEST PRICED COMICS IN THE FIRST 5,000 ---");
  console.table(summary.topValueComics.slice(0, 15), ["series", "issue", "publisher", "year", "pp_98", "comicbase", "baseline_98", "source"]);

  // Save full JSON report
  const outputPath = path.resolve("./audit_first_5000_results.json");
  fs.writeFileSync(outputPath, JSON.stringify(auditResult, null, 2));
  console.log(`\nFull audit details saved to ${outputPath}`);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
