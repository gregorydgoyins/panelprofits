import type { ComicRecord } from "@/lib/comics/types";
import type { HistoryEntry } from "@/components/detail/equity/types";
import { panelProfitsGrades, type Grade } from "@/lib/pricing/source-ladder";
import benchmarksData from "@/lib/pricing/pricecharting-cgc-benchmarks.json";

export interface ChronologyOptions {
  dbObservations?: Array<{ amount: number; observed_at: string | null; grade_label: string | null; created_at?: string }>;
}

/**
 * Builds authentic chronological price history for Panel Profits equity instruments.
 * Strictly separates Panel Profits secondary market transaction observations from ComicBase catalog guides.
 * ComicBase catalog data belongs exclusively in the ComicBase reference structure and is NEVER mixed here.
 */
export function buildComicPriceHistory(
  comic: Partial<ComicRecord>,
  options: ChronologyOptions = {}
): HistoryEntry[] {
  const history: HistoryEntry[] = [];
  const rawLattice = panelProfitsGrades(comic);

  // 1. Ingest verified DB observations if provided (e.g. from ppcf_price_observations)
  if (options.dbObservations && Array.isArray(options.dbObservations)) {
    for (const obs of options.dbObservations) {
      const amt = Number(obs.amount);
      const dt = obs.observed_at || obs.created_at;
      if (amt > 0 && dt) {
        history.push({
          grade: (obs.grade_label as Grade) || "9.8",
          priceUsd: amt,
          observedAt: new Date(dt).toISOString(),
          source: "PANEL_PROFITS_OBSERVATION",
        });
      }
    }
  }

  // 2. Ingest verified benchmark auction observations from Panel Profits clearing records
  const series = comic.series || "";
  const issue = String(comic.issue_number || "1");
  const benchmarkKey = `${series} #${issue}`;
  const benchmark = (benchmarksData as Record<string, any>)[benchmarkKey];

  if (benchmark?.cgc && Array.isArray(benchmark.cgc)) {
    for (const c of benchmark.cgc) {
      const amt = Number(c.amount);
      const dt = c.observedAt || c.date;
      if (amt > 0 && dt) {
        history.push({
          grade: c.grade || "9.8",
          priceUsd: amt,
          observedAt: new Date(dt).toISOString(),
          source: c.authority || "CGC",
        });
      }
    }
  }

  if (benchmark?.allObservations && Array.isArray(benchmark.allObservations)) {
    for (const obs of benchmark.allObservations) {
      const amt = Number(obs.amount);
      const dt = obs.date || obs.observedAt;
      if (amt > 0 && dt && obs.grade) {
        history.push({
          grade: obs.grade,
          priceUsd: amt,
          observedAt: new Date(dt).toISOString(),
          source: obs.authority || obs.type || "PANEL_PROFITS_MARKET",
        });
      }
    }
  }

  // 3. Include current Panel Profits cleared lattice prices anchored at current valuation date
  const nowIso = new Date().toISOString();
  for (const [grade, currentFmv] of Object.entries(rawLattice) as [Grade, number][]) {
    if (currentFmv && currentFmv > 0) {
      history.push({
        grade,
        priceUsd: currentFmv,
        observedAt: nowIso,
        source: "PANEL_PROFITS_CURRENT_FMV",
      });
    }
  }

  // 4. If comic has atomic price (RAW) and consensus 9.8 price, ensure anchor observations exist
  const atomicRaw = Number(
    (comic.panel_profits_data as any)?.["PP - Ungraded Market Price"] ||
    (comic.panel_profits_data as any)?.["PP - Grade RAW Market Price"] ||
    (comic.panel_profits_data as any)?.raw_market_price ||
    (comic as any).raw_market_price ||
    0
  );
  if (atomicRaw > 0 && !history.some(h => h.grade === "RAW")) {
    history.push({
      grade: "RAW",
      priceUsd: atomicRaw,
      observedAt: nowIso,
      source: "PANEL_PROFITS_ATOMIC_RAW",
    });
  }

  const sovereign98 = Number(comic.pp_grade_9_8_price || comic.baseline_grade_9_8_value || 0);
  if (sovereign98 > 0 && !history.some(h => h.grade === "9.8")) {
    history.push({
      grade: "9.8",
      priceUsd: sovereign98,
      observedAt: nowIso,
      source: "PANEL_PROFITS_SOVEREIGN_FMV",
    });
  }

  // Deduplicate by grade and timestamp, then sort chronologically
  const seen = new Set<string>();
  const deduplicated: HistoryEntry[] = [];

  for (const h of history) {
    const key = `${h.grade}|${h.observedAt}|${h.priceUsd}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(h);
    }
  }

  deduplicated.sort((a, b) => new Date(a.observedAt).getTime() - new Date(b.observedAt).getTime());
  return deduplicated;
}
