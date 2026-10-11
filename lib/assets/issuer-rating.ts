/**
 * In-game rating and adjudication for issuers that come to market (a benefactor raising debt for a project).
 * Rating comes from coverage — liquid wealth against all debt including the new issue — notched down by live stress.
 */
export type Rating = "AAA" | "AA" | "A" | "BBB" | "BB" | "B" | "CCC";
const SCALE: Rating[] = ["AAA", "AA", "A", "BBB", "BB", "B", "CCC"];

export const RATING_SPREAD: Record<Rating, number> = { AAA: 0.002, AA: 0.004, A: 0.007, BBB: 0.012, BB: 0.02, B: 0.035, CCC: 0.06 };
export const RATING_HAZARD: Record<Rating, number> = { AAA: 0.0005, AA: 0.001, A: 0.002, BBB: 0.005, BB: 0.015, B: 0.04, CCC: 0.1 };
const COVERAGE_FLOORS: [number, Rating][] = [[10, "AAA"], [6, "AA"], [3.5, "A"], [2, "BBB"], [1.3, "BB"], [0.8, "B"]];
export const MAX_ISSUE_FRACTION_OF_LIQUID = 0.25;

export function rateIssuer(args: { liquidWealth: number; existingDebt: number; newIssue: number; stress: number }): { rating: Rating; coverage: number } {
  const debt = args.existingDebt + args.newIssue;
  const coverage = debt > 0 ? args.liquidWealth / debt : Infinity;
  let idx = SCALE.indexOf((COVERAGE_FLOORS.find(([f]) => coverage >= f)?.[1]) ?? "CCC");
  const notches = args.stress >= 0.8 ? 2 : args.stress >= 0.5 ? 1 : 0;
  idx = Math.min(SCALE.length - 1, idx + notches);
  return { rating: SCALE[idx], coverage };
}

export interface Adjudication {
  approved: boolean;
  rating: Rating;
  coverage: number;
  spread: number;
  reasons: string[];
}

export function adjudicateIssuance(args: { liquidWealth: number; existingDebt: number; amount: number; stress: number }): Adjudication {
  const { rating, coverage } = rateIssuer({ liquidWealth: args.liquidWealth, existingDebt: args.existingDebt, newIssue: args.amount, stress: args.stress });
  const reasons: string[] = [`coverage ${coverage.toFixed(1)}x liquid wealth to total debt`];
  let approved = true;
  if (args.amount > MAX_ISSUE_FRACTION_OF_LIQUID * args.liquidWealth) { approved = false; reasons.push("issue exceeds 25% of liquid wealth"); }
  if (rating === "CCC") { approved = false; reasons.push("rating CCC: not marketable"); }
  if (args.stress >= 0.5) reasons.push("rating notched down for live market stress");
  return { approved, rating, coverage, spread: RATING_SPREAD[rating], reasons };
}
