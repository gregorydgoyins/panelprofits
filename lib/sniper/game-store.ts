import { createAdminServerClient } from "@/lib/supabase/admin";

export interface GameAccount { cash: number; reserved: number; available: number; rounds: number; wins: number; doubleDowns: number; serverNow: string; serverReceivedAt?: string }
export interface GameRound {
 token: string; title: string; series: string; issue: string; grade: number | null; grader: string | null;
 imageUrl: string | null; itemId: string | null; year: number | null; publisher: string | null;
 status: string; bid: number | null; opening: number; deadline: string | null; acceptedAt: string | null;
 result: null | { outcome: string; benchmark: number | null; charged: number; detail: string; mode: string; sourceUrl: string | null; source: string | null };
 asset: null | { cost: number; reference: number; referenceSource: string; bankRate: number; bankOffer: number; soldAt: string | null; bankPaid: number | null };
}
export interface GameState { account: GameAccount; rounds: GameRound[]; exhausted: boolean }

/** An explicit allowlist keeps source mode, sale IDs, historical dates and closing values sealed. */
export function publicGameRound(row: any): GameRound {
 const resolved = Boolean(row.game_resolved_at);
 const owned = resolved && row.status === "won";
 return { token: row.game_token, title: row.title, series: row.series || "", issue: row.issue || "", grade: row.grade == null ? null : Number(row.grade),
  grader: row.result?.grader || null, imageUrl: row.result?.imageUrl || null, itemId: null,
  year: row.result?.year || null, publisher: row.result?.publisher || null,
  status: row.status, bid: row.max_bid_usd == null ? null : Number(row.max_bid_usd), opening: Number(row.ask_usd || 1),
  deadline: row.game_started_at ? row.game_deadline : null, acceptedAt: row.result?.acceptedAt || null,
  result: resolved ? { outcome: row.status, benchmark: row.final_price_usd == null ? null : Number(row.final_price_usd), charged: row.status === "unresolved" ? 0 : Number(row.max_bid_usd || 0),
    detail: row.detail || "", mode: row.game_mode, sourceUrl: row.result?.url || null, source: row.basis || null } : null,
  asset: owned ? { cost: Number(row.fill_price_usd), reference: Number(row.fmv_usd), referenceSource: row.game_reference_source,
    bankRate: Number(row.game_bank_rate), bankOffer: Math.round(Number(row.fmv_usd) * Number(row.game_bank_rate) * 100) / 100,
    soldAt: row.game_sold_at, bankPaid: row.result?.bankPaid ?? null } : null };
}
function stateFromSnapshot(data: any): GameState {
 const account = data.account as GameAccount;
 const rounds = (data.rounds || []).map(publicGameRound) as GameRound[];
 return { account, rounds, exhausted: account.cash <= 0 && account.reserved === 0 && !rounds.some(round => round.asset && !round.asset.soldAt) };
}
/** One database transaction keeps queue generation, deadlines and the account consistent. */
export async function gameState(owner: string, refresh = false): Promise<GameState> {
 const {data,error} = await createAdminServerClient().rpc("sniper_game_snapshot",{p_owner:owner,p_refresh:refresh});
 if(error) throw new Error(error.message);
 return stateFromSnapshot(data);
}
export async function gameCommand(owner:string,action:string,token?:string,amount?:number,double=false):Promise<GameState> {
 const {data,error}=await createAdminServerClient().rpc("sniper_game_command",{p_owner:owner,p_action:action,p_token:token||null,p_amount:amount??null,p_double:double});
 if(error) throw new Error(error.message);
 return stateFromSnapshot(data);
}
