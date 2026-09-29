import { createCleanReadOnlyServerClient } from "@/lib/supabase/admin";

export interface PlayerPosition {
  id: string;
  instrumentId: string;
  series: string;
  issueNumber: string | null;
  grade: string;
  quantity: number;
  // No real per-position cost-basis or live-price join exists in the schema
  // yet (player_holdings stores no price at all). These stay null rather
  // than a fabricated number until a real pricing join is built.
  entryPriceUsd: number | null;
  currentFmvUsd: number | null;
  totalMarketValue: number | null;
  unrealizedPnlUsd: number | null;
  unrealizedPnlPercent: number | null;
}

export interface PlayerFirmContext {
  firmId: string | null;
  firmName: string | null;
  roleTitle: string | null;
  deskType: string | null;
  careerLevel: number | null;
  cashUsd: number | null;
  portfolioMarketValueUsd: number | null;
  totalAumUsd: number | null;
  totalPnlUsd: number | null;
  karma: number | null;
  stressLevel: string | null;
  reputationScore: number | null;
  positions: PlayerPosition[];
}

const EMPTY_CONTEXT: PlayerFirmContext = {
  firmId: null,
  firmName: null,
  roleTitle: null,
  deskType: null,
  careerLevel: null,
  cashUsd: null,
  portfolioMarketValueUsd: null,
  totalAumUsd: null,
  totalPnlUsd: null,
  karma: null,
  stressLevel: null,
  reputationScore: null,
  positions: [],
};

export async function getPlayerFirmContext(userId: string): Promise<PlayerFirmContext> {
  const db = createCleanReadOnlyServerClient();

  try {
    // 1. Real player career row, scoped to this player only.
    const { data: careerRow } = await db
      .from("player_careers")
      .select("*")
      .eq("player_id", userId)
      .maybeSingle();

    // 2. Real firm identity, resolved the same way getFirms()/getFirmDossier()
    // do (firm-prefixed identity tables) — never a hardcoded firm-name map.
    let firmName: string | null = null;
    if (careerRow?.firm_id) {
      const prefix = `${careerRow.firm_id}_`;
      const { data: identity } = await db.from(`${prefix}firm_identity`).select("*").maybeSingle();
      firmName = identity ? identity[`${prefix}firm_name`] || identity.firm_name || null : null;
    }

    // 3. Real player holdings, scoped to this player only. No fabricated
    // "sample" position is substituted when a player has none: an empty
    // portfolio is a legitimate, honest state.
    const { data: holdingRows } = await db
      .from("player_holdings")
      .select("id, instrument_id, quantity, grade")
      .eq("player_id", userId);

    const positions: PlayerPosition[] = (holdingRows || []).map((h) => ({
      id: h.id,
      instrumentId: h.instrument_id,
      series: h.instrument_id,
      issueNumber: null,
      grade: h.grade || "Unpriced",
      quantity: Number(h.quantity ?? 0),
      // Unpriced until a verified live-price join for player_holdings exists.
      entryPriceUsd: null,
      currentFmvUsd: null,
      totalMarketValue: null,
      unrealizedPnlUsd: null,
      unrealizedPnlPercent: null,
    }));

    const cash = careerRow?.cash_usd == null ? null : Number(careerRow.cash_usd);
    // Portfolio/AUM totals require real per-position market values, which are
    // not available yet (see PlayerPosition above), so they stay unavailable
    // rather than summing to a fabricated total.
    const portfolioVal: number | null = null;
    const totalPnl: number | null = null;

    return {
      firmId: careerRow?.firm_id ?? null,
      firmName,
      roleTitle: careerRow?.career_title ?? null,
      deskType: careerRow?.desk_type ?? null,
      careerLevel: careerRow?.career_level == null ? null : Number(careerRow.career_level),
      cashUsd: cash,
      portfolioMarketValueUsd: portfolioVal,
      totalAumUsd: cash == null && portfolioVal == null ? null : (cash ?? 0) + (portfolioVal ?? 0),
      totalPnlUsd: totalPnl,
      karma: careerRow?.karma == null ? null : Number(careerRow.karma),
      stressLevel: null,
      reputationScore: careerRow?.visible_reputation == null ? null : Number(careerRow.visible_reputation),
      positions,
    };
  } catch (err) {
    console.error("Error retrieving player firm context:", err);
    return EMPTY_CONTEXT;
  }
}
