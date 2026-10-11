/**
 * City credit, REIT and issuance instruments. Each one reads live shock conditions from the entity graph,
 * so a Joker scare in Gotham widens Gotham's spread, lowers its bond and REIT, raises its CDS, and sends
 * relief flows toward Wayne — all through formulas, none of it a typed-in price.
 */
import type { AssetItem } from "./types";
import { treasuryYield } from "./canon-params";
import { bondLiquiditySpreadFor, bondPrice, cdsSpread, requiredYield, reitUnitValue } from "./canon-formulas";
import { adjudicateIssuance } from "./issuer-rating";
import { BENEFACTORS, ISSUANCE_PROPOSALS, LORE_CITIES } from "./lore-tables";
import { marketFactor } from "./market-dynamics";
import { SENSITIVITY, conditionsFor, degradeState, type ShockMap } from "./shock-propagation";

const RECOVERY_MUNI = { MUNICIPAL_MAJ_CITY: 0.7, MUNICIPAL_REGION: 0.65 } as const;
const r2 = (x: number) => Math.round(x * 100) / 100;

function mk(type: AssetItem["assetType"], idx: number, symbol: string, name: string, description: string, fmv: number, formula: string, inputs: Record<string, unknown>, trails: unknown[] = []): AssetItem {
  return {
    entryId: `asset-${type.toLowerCase()}-${symbol.replace(/[^A-Za-z0-9]/g, "")}-${idx}`,
    assetId: `${type}-${symbol}`,
    assetType: type,
    displayRank: idx + 1,
    diversityBucket: "standard",
    symbol, displayName: name, description,
    universe: "Panel Profits",
    pricing: { fmv_usd: r2(fmv), fmv: r2(fmv), price: r2(fmv), formula },
    parameters: { ...inputs, trails },
    valueUnit: "USD",
    coverImageUrl: `/surface-art/${type.toLowerCase()}.png`,
    coverVerified: true,
    quarantined: false,
  };
}

export function issueInstitutional(shocks: ShockMap, now: number = Date.now()): AssetItem[] {
  const out: AssetItem[] = [];
  let b = 0, c = 0, r = 0;
  for (const city of LORE_CITIES) {
    const sh = shocks.get(city.node);
    const cond = conditionsFor(sh);
    const stress = sh?.stress ?? 0;
    const R = RECOVERY_MUNI[city.muniClass];
    const hazard = city.hazard0 * (1 + SENSITIVITY.hazardStress * stress);
    const trails = sh?.trails ?? [];
    const tag = city.id.toUpperCase().slice(0, 4);

    // Municipal bond: y_req = y_rf + hazard·(1−R) + s_liq, coupon fixed at issue (baseline hazard)
    const years = 10;
    const state = degradeState("OPEN", cond.stateSteps);
    const sLiq = bondLiquiditySpreadFor(state, years);
    const coupon = treasuryYield(years) + city.hazard0 * (1 - R);
    const yReq = requiredYield(years, hazard * (1 - R), sLiq);
    out.push(mk("BOND", b++, `${tag}GO`, `${city.name} General Obligation 10Y`, `${(coupon * 100).toFixed(2)}% coupon · hazard ${(hazard * 100).toFixed(1)}%${stress > 0.05 ? " · under stress" : ""}`, bondPrice(1000, coupon, yReq, years) * marketFactor(`${tag}GO`, now, 0.05), "Price=Σ cP/(1+y)^k+P/(1+y)^T, y=y_rf+λ(1−R)+s_liq", { city: city.name, muniClass: city.muniClass, recovery: R, hazard, baselineHazard: city.hazard0, stress, yReq, coupon, state }, trails));

    // CDS: par spread from hazard and recovery; price = annual premium per $1M notional
    const rf = treasuryYield(5);
    const s5 = cdsSpread(hazard, R, 5, rf);
    out.push(mk("CREDIT", c++, `${tag}CDS`, `${city.name} 5Y CDS`, `${(s5 * 10000).toFixed(0)} bps · premium per $1M notional`, s5 * 1_000_000 * marketFactor(`${tag}CDS`, now, 0.3), "PV_prem=PV_prot ⇒ s", { city: city.name, hazard, recovery: R, spreadBps: s5 * 10000, years: 5, stress }, trails));

    // REIT: V = NOI/cap − debt; stress lowers occupancy (NOI) and lifts the cap rate
    const noi = city.noi * (1 - SENSITIVITY.reitOccupancyLoss * stress);
    const cap = city.capRate0 + SENSITIVITY.reitCreditPassThrough * cond.creditAdd + SENSITIVITY.reitCapWidening * stress;
    const unit = reitUnitValue(noi, cap, city.debt, city.units);
    if (unit > 0) out.push(mk("REIT", r++, `${tag}RE`, `${city.name} Real Estate Trust`, `NOI $${(noi / 1e9).toFixed(2)}B · cap ${(cap * 100).toFixed(2)}%`, unit * marketFactor(`${tag}RE`, now, 0.15), "V=(NOI/cap−debt)/units", { city: city.name, noi, cap, debt: city.debt, units: city.units, stress }, trails));
  }

  // Rated and adjudicated issuance by benefactors
  for (const p of ISSUANCE_PROPOSALS) {
    const ben = BENEFACTORS.find((x) => x.id === p.benefactor);
    if (!ben) continue;
    const sh = ben.node ? shocks.get(ben.node) : undefined;
    const cond = conditionsFor(sh);
    const wealth = ben.netWorth * (1 + cond.flow);
    const liquid = wealth * (1 - ben.operatingFraction);
    const adj = adjudicateIssuance({ liquidWealth: liquid, existingDebt: p.existingDebt, amount: p.amount, stress: sh?.stress ?? 0 });
    if (!adj.approved) continue;
    const sLiq = bondLiquiditySpreadFor("OPEN", p.years);
    const coupon = treasuryYield(p.years) + adj.spread;
    const yReq = requiredYield(p.years, adj.spread + cond.creditAdd, sLiq);
    out.push(mk("BOND", b++, `${ben.id.toUpperCase().slice(0, 4)}IPO`, `${ben.vehicle} ${p.purpose} Bond`, `Rated ${adj.rating} · ${(coupon * 100).toFixed(2)}% · $${(p.amount / 1e6).toFixed(0)}M issue`, bondPrice(1000, coupon, yReq, p.years) * marketFactor(`${ben.id}IPO`, now, 0.04), "Rated issuance: y=y_rf+s_rating+s_liq", { issuer: ben.name, purpose: p.purpose, amount: p.amount, rating: adj.rating, coverage: adj.coverage, adjudication: adj.reasons, coupon, yReq }, sh?.trails ?? []));
  }
  return out;
}
