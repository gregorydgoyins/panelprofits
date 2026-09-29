import { createAdminServerClient, createCleanReadOnlyServerClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/errors";

interface PanelMarketState {
  tick: number | null;
  regime: string | null;
  market_regime_4state: string | null;
  stress_index: number | null;
  drawdown: number | null;
  tectonic_tier: number | null;
}

interface PanelMarketIndex {
  index_id: string;
  index_name: string;
  index_type: string | null;
  base_value: number | null;
  current_value: number | null;
  constituent_count: number | null;
}

interface Ce50Reference {
  raw_value: number;
  set_at: string | null;
}

interface RecoveredIndexContract {
  index_code: string;
  display_name: string;
  methodology_version: string;
  expected_constituent_count: number;
  production_status: string;
  historical_status: string;
  current_value: string;
  notes: string | null;
}

export async function getPanelTelemetry(): Promise<{
  state: PanelMarketState | null;
  indices: PanelMarketIndex[];
  ce50: Ce50Reference | null;
  recoveredIndices: RecoveredIndexContract[];
}> {
  const cleanDb = createCleanReadOnlyServerClient();
  
  try {
    const [{ data: recoveredIndices, error: contractErr }, { data: observations, error: obsErr }] = await Promise.all([
      cleanDb
        .from("recovered_index_contracts")
        .select("index_code,display_name,methodology_version,expected_constituent_count,production_status,historical_status,current_value:production_status,notes")
        .order("index_code"),
      cleanDb
        .from("recovered_index_observations")
        .select("index_code,index_value,base_value,constituent_count,observation_date")
        .order("observation_date", { ascending: false })
        .limit(100),
    ]);

    if (contractErr && isMissingTableError(contractErr)) {
      console.warn("Recovered index contracts table is not deployed in the live Clean project.");
      return {
        state: null,
        indices: [],
        ce50: null,
        recoveredIndices: [],
      };
    }

    // Process observations into latest index values
    const latestByIndex = new Map<string, { index_value: number; base_value: number; constituent_count: number; date: string }>();
    if (observations && observations.length > 0) {
      for (const obs of observations) {
        if (!latestByIndex.has(obs.index_code)) {
          latestByIndex.set(obs.index_code, {
            index_value: Number(obs.index_value),
            base_value: Number(obs.base_value),
            constituent_count: Number(obs.constituent_count),
            date: obs.observation_date,
          });
        }
      }
    }

    const indexConfigs = [
      { id: "CE70", name: "CE70 Constitutional Benchmark", type: "Constitutional Weight", defaultBase: 2450.80, defaultCount: 70 },
      { id: "PPIX60", name: "PPIX-60 Capitalization Benchmark", type: "Cap-Weighted (FMV x Census)", defaultBase: 1820.45, defaultCount: 60 },
      { id: "PPIX100", name: "PPIX-100 Liquidity-Weighted Pulse", type: "Liquidity Pulse", defaultBase: 1140.20, defaultCount: 100 },
    ];

    const indices: PanelMarketIndex[] = indexConfigs.map((cfg) => {
      const obs = latestByIndex.get(cfg.id);
      return {
        index_id: cfg.id,
        index_name: cfg.name,
        index_type: cfg.type,
        base_value: obs?.base_value ?? cfg.defaultBase,
        current_value: obs?.index_value ?? cfg.defaultBase,
        constituent_count: obs?.constituent_count ?? cfg.defaultCount,
      };
    });

    const latestObservation = observations?.[0];
    const tickTime = latestObservation ? new Date(latestObservation.observation_date).getTime() : Date.now();
    const tickNumber = Math.floor(tickTime / 1000) % 1000000;

    const state: PanelMarketState = {
      tick: tickNumber,
      regime: "BULL_ACCELERATION",
      market_regime_4state: "ORDERLY_ACCUMULATION",
      stress_index: 0.14,
      drawdown: 0.024,
      tectonic_tier: 2,
    };

    const ce50: Ce50Reference = {
      raw_value: 1485.50,
      set_at: "2026-09-08T04:00:00.000Z",
    };

    // Enhance contracts with live values if available
    const enrichedContracts = (recoveredIndices || []).map((contract) => {
      const live = latestByIndex.get(contract.index_code);
      return {
        ...contract,
        current_value: live ? live.index_value.toFixed(2) : contract.production_status,
      };
    });

    return {
      state,
      indices,
      ce50,
      recoveredIndices: enrichedContracts,
    };
  } catch (err) {
    console.error("Error fetching live Clean market telemetry:", err);
    return {
      state: null,
      indices: [],
      ce50: null,
      recoveredIndices: [],
    };
  }
}

export async function getFirms() {
  const db = createCleanReadOnlyServerClient();
  const firmSlugs = ["arnveld", "adanko", "cairn", "calmonte", "carantec", "cavendara", "cormorant", "dundeen", "harborside", "holtercroft", "irodori", "khamsin", "lacoste", "nalvera", "okafor", "orontea", "penhaligon", "rhein", "schwarzenberg", "seine", "sestriere", "talua", "valdris", "vantage", "vestmark"];

  const firms = await Promise.all(firmSlugs.map(async (firmId) => {
    const { data: identity, error } = await db.from(`${firmId}_firm_identity`).select("*").maybeSingle();
    if (error || !identity) return null;
    const prefix = `${firmId}_`;
    const [brokers, clients, freeAgents, gods, titans, staff] = await Promise.all([
      db.from(`${firmId}_broker_identity`).select("*", { count: "exact", head: true }),
      db.from(`${firmId}_client_identity`).select("*", { count: "exact", head: true }),
      db.from(`${firmId}_free_agents`).select("*", { count: "exact", head: true }),
      db.from(`${firmId}_firm_gods`).select("*", { count: "exact", head: true }),
      db.from(`${firmId}_firm_titans`).select("*", { count: "exact", head: true }),
      db.from(`${firmId}_staff_roster`).select("*", { count: "exact", head: true }),
    ]);

    return {
      firm_id: firmId,
      firm_name: identity[`${prefix}firm_name`] || identity.firm_name || firmId,
      philosophy: identity[`${prefix}firm_personality_statement`] || identity.institutional_mission || null,
      mythology: identity.mythology || null,
      aum_usd: identity.aum_usd == null ? null : Number(identity.aum_usd),
      total_brokers: brokers.count || 0,
      total_clients: clients.count || 0,
      total_free_agents: freeAgents.count || 0,
      total_gods: gods.count || 0,
      total_titans: titans.count || 0,
      total_staff: staff.count || 0,
      source: "Clean firm-prefixed identity tables",
    };
  }));

  return firms.filter(Boolean).sort((left, right) => left!.firm_name.localeCompare(right!.firm_name));
}

export async function getFirmDossier(firmId: string) {
  const db = createCleanReadOnlyServerClient();
  const prefix = `${firmId}_`;
  const { data: identity, error } = await db.from(`${prefix}firm_identity`).select("*").maybeSingle();
  if (error || !identity) return null;

  const [brokerRows, clientRows, staffRows, godRows, titanRows, coverageRows, certificateRows] = await Promise.all([
    db.from(`${prefix}broker_identity`).select("*").limit(12),
    db.from(`${prefix}client_identity`).select("*").limit(12),
    db.from(`${prefix}staff_roster`).select("*").limit(12),
    db.from(`${prefix}firm_gods`).select("*").limit(12),
    db.from(`${prefix}firm_titans`).select("*").limit(12),
    db.from(`${prefix}client_coverage`).select("*", { count: "exact", head: true }),
    db.from(`${prefix}broker_certifications`).select("*", { count: "exact", head: true }),
  ]);

  const countRows = async (table: string) => (await db.from(table).select("*", { count: "exact", head: true })).count || 0;
  const [brokerCount, clientCount, staffCount, godCount, titanCount, freeAgentCount] = await Promise.all([
    countRows(`${prefix}broker_identity`), countRows(`${prefix}client_identity`), countRows(`${prefix}staff_roster`),
    countRows(`${prefix}firm_gods`), countRows(`${prefix}firm_titans`), countRows(`${prefix}free_agents`),
  ]);

  return {
    firmId,
    identity,
    counts: { brokerCount, clientCount, staffCount, godCount, titanCount, freeAgentCount, coverageCount: coverageRows.count || 0, certificationCount: certificateRows.count || 0 },
    brokers: brokerRows.data || [], clients: clientRows.data || [], staff: staffRows.data || [], gods: godRows.data || [], titans: titanRows.data || [],
  };
}

export async function getBrokers(limit = 80) {
  try {
    const db = createAdminServerClient();
    const { data, error } = await db.from("brokers").select("broker_id,broker_code,full_name,firm_slug,ladder_level,primary_track,specialization,is_named_rival").order("full_name").limit(limit);
    if (error) {
      console.warn("Failed to get brokers:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn("Unexpected error in getBrokers:", err);
    return [];
  }
}

export async function getLearningCatalog() {
  try {
    const db = createCleanReadOnlyServerClient();
    const [{ data: classes }, { data: certifications }, { data: exams }, { data: levels }] = await Promise.all([
      db.from("learn_classes").select("*").limit(80),
      db.from("learn_certifications").select("*").limit(80),
      db.from("learn_exams").select("*").limit(40),
      db.from("career_pathway_levels").select("*").order("pathway_name").order("level").limit(80),
    ]);
    return { classes: classes || [], certifications: certifications || [], exams: exams || [], levels: levels || [] };
  } catch (err) {
    console.warn("Unexpected error in getLearningCatalog:", err);
    return { classes: [], certifications: [], exams: [], levels: [] };
  }
}

export async function getDiaryEntries(userId: string) {
  try {
    const db = createAdminServerClient();
    const { data, error } = await db.from("player_diary_entries").select("*").eq("user_id", userId).order("occurred_at", { ascending: false }).limit(200);
    if (error) {
      console.warn("Failed to get diary entries:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn("Unexpected error in getDiaryEntries:", err);
    return [];
  }
}
