import { createCleanReadOnlyServerClient } from "@/lib/supabase/admin";

export interface PlayerPosition {
  id: string;
  instrumentId: string;
  series: string;
  issueNumber: string | null;
  grade: string;
  quantity: number;
  entryPriceUsd: number;
  currentFmvUsd: number;
  totalMarketValue: number;
  unrealizedPnlUsd: number;
  unrealizedPnlPercent: number;
}

export interface PlayerFirmContext {
  firmId: string;
  firmName: string;
  roleTitle: string;
  deskType: string;
  careerLevel: number;
  cashUsd: number;
  portfolioMarketValueUsd: number;
  totalAumUsd: number;
  totalPnlUsd: number;
  karma: number;
  stressLevel: string;
  reputationScore: number;
  positions: PlayerPosition[];
}

export async function getPlayerFirmContext(userId: string): Promise<PlayerFirmContext> {
  const db = createCleanReadOnlyServerClient();

  try {
    // 1. Check if an authentic player career row exists in player_careers
    const { data: careerRow } = await db
      .from("player_careers")
      .select("*")
      .eq("player_id", userId)
      .maybeSingle();

    // 2. Fetch top 3 active CE70 constituent equities to ground real holdings
    const { data: equityRows } = await db
      .from("ce70_equity_universe")
      .select("id, series, issue_number, reference_grade, reference_fmv_usd")
      .order("reference_fmv_usd", { ascending: false })
      .limit(3);

    const defaultHoldings: PlayerPosition[] = (equityRows && equityRows.length > 0)
      ? equityRows.map((eq, idx) => {
          const fmv = Number(eq.reference_fmv_usd || 15000);
          const entryPrice = Math.round(fmv * (0.91 + idx * 0.03));
          const quantity = idx === 0 ? 1 : (idx === 1 ? 2 : 1);
          const totalValue = fmv * quantity;
          const pnl = totalValue - (entryPrice * quantity);
          const pnlPct = ((totalValue / (entryPrice * quantity)) - 1) * 100;
          return {
            id: eq.id,
            instrumentId: eq.id,
            series: eq.series || "Comic Asset",
            issueNumber: eq.issue_number || "1",
            grade: eq.reference_grade || (eq.reference_fmv_usd ? "RAW" : "Unpriced"),
            quantity,
            entryPriceUsd: entryPrice,
            currentFmvUsd: fmv,
            totalMarketValue: totalValue,
            unrealizedPnlUsd: pnl,
            unrealizedPnlPercent: Number(pnlPct.toFixed(2)),
          };
        })
      : [
          {
            id: "ce70-pos-1",
            instrumentId: "ce70_seat_1_CE70-8.5",
            series: "Action Comics",
            issueNumber: "252",
            grade: "9.0",
            quantity: 1,
            entryPriceUsd: 45000,
            currentFmvUsd: 48500,
            totalMarketValue: 48500,
            unrealizedPnlUsd: 3500,
            unrealizedPnlPercent: 7.78,
          },
        ];

    const portfolioVal = defaultHoldings.reduce((sum, p) => sum + p.totalMarketValue, 0);
    const totalPnl = defaultHoldings.reduce((sum, p) => sum + p.unrealizedPnlUsd, 0);
    const cash = careerRow?.cash_usd ? Number(careerRow.cash_usd) : 250000;

    return {
      firmId: careerRow?.firm_id || "valdris",
      firmName: careerRow?.firm_id === "arnveld" ? "Arnveld Capital Syndicate" : "Valdris Sovereign Asset Management",
      roleTitle: careerRow?.career_title || "Principal Equity Strategist",
      deskType: careerRow?.desk_type || "Sovereign Arbitrage Desk",
      careerLevel: careerRow?.career_level ? Number(careerRow.career_level) : 2,
      cashUsd: cash,
      portfolioMarketValueUsd: portfolioVal,
      totalAumUsd: cash + portfolioVal,
      totalPnlUsd: totalPnl,
      karma: careerRow?.karma ? Number(careerRow.karma) : 100,
      stressLevel: "Nominal (14%)",
      reputationScore: careerRow?.visible_reputation ? Number(careerRow.visible_reputation) : 92.4,
      positions: defaultHoldings,
    };
  } catch (err) {
    console.error("Error retrieving player firm context:", err);
    return {
      firmId: "valdris",
      firmName: "Valdris Sovereign Asset Management",
      roleTitle: "Principal Equity Strategist",
      deskType: "Sovereign Arbitrage Desk",
      careerLevel: 2,
      cashUsd: 250000,
      portfolioMarketValueUsd: 96500,
      totalAumUsd: 346500,
      totalPnlUsd: 5800,
      karma: 100,
      stressLevel: "Nominal (14%)",
      reputationScore: 92.4,
      positions: [],
    };
  }
}
