import { createCleanReadOnlyServerClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/errors";

export interface MarketIndexRecord {
  indexCode: string;
  displayName: string;
  methodologyVersion: string;
  expectedConstituentCount: number;
  currentValue: number | null;
  previousValue: number | null;
  percentChange: number | null;
  status: string;
  description: string;
}

export interface EquitiesRailItem {
  id: string;
  series: string;
  issueNumber: string;
  publisher: string;
  publicationYear: number | null;
  ticker: string;
  fmvPrice: number | null;
  formattedFmv: string;
  cgc98Price: number | null;
  formattedCgc98: string;
  censusFloat: number | null;
  coverUrl: string | null;
  priceSource: string;
}

/**
 * Returns the real recovered_index_contracts rows (CE70, PPIX60, PPIX100,
 * PPIX_COMPOSITE, etc. — whatever is actually seeded), matched against any
 * rows in recovered_index_observations. No values are invented: a contract
 * with no observation row returns null current/previous/percentChange, and
 * status reflects the contract's real production_status (e.g.
 * BLOCKED_INCOMPLETE_MEMBERSHIP) rather than a fabricated "ACTIVE". If the
 * contracts table has no rows, this returns an empty array — callers must
 * render an honest "no live data" state rather than substituting numbers.
 */
export async function calculateMarketIndices(): Promise<MarketIndexRecord[]> {
  const db = createCleanReadOnlyServerClient();

  const { data: contracts, error } = await db
    .from("recovered_index_contracts")
    .select("index_code,display_name,methodology_version,expected_constituent_count,production_status,notes")
    .order("index_code");

  if (error && !isMissingTableError(error)) {
    console.error("Error fetching index contracts:", error);
  }

  if (!contracts || !contracts.length) return [];

  const { data: observations } = await db
    .from("recovered_index_observations")
    .select("index_code,index_value,previous_value,percent_change,calculation_status,observation_time")
    .order("observation_time", { ascending: false })
    .limit(100);

  const obsMap = new Map<string, { current: number | null; prev: number | null; pct: number | null; status: string }>();
  for (const obs of observations || []) {
    if (!obsMap.has(obs.index_code)) {
      obsMap.set(obs.index_code, {
        current: obs.index_value,
        prev: obs.previous_value,
        pct: obs.percent_change,
        status: obs.calculation_status,
      });
    }
  }

  return contracts.map((contract) => {
    const obs = obsMap.get(contract.index_code);
    return {
      indexCode: contract.index_code,
      displayName: contract.display_name,
      methodologyVersion: contract.methodology_version,
      expectedConstituentCount: contract.expected_constituent_count,
      currentValue: obs?.current ?? null,
      previousValue: obs?.prev ?? null,
      percentChange: obs?.pct ?? null,
      status: obs?.status ?? contract.production_status,
      description: contract.notes || "Comic Market Equity Index",
    };
  });
}
