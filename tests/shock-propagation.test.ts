import { describe, expect, it } from "vitest";
import { classifyText, conditionsFor, conditionsForNodes, degradeState, eventsFromArticles, propagate } from "../lib/assets/shock-propagation";
import { matchEntities, entitiesForSeries } from "../lib/assets/entity-graph";
import { adjudicateIssuance, rateIssuer } from "../lib/assets/issuer-rating";
import { cdsSpread, reitUnitValue } from "../lib/assets/canon-formulas";
import { issueInstitutional } from "../lib/assets/institutions";

const NOW = Date.parse("2026-10-11T12:00:00Z");
const scare = { id: "a1", headline: "Joker scare grips Gotham as hostage chaos spreads", summary: "", url: "u", published_at: "2026-10-11T06:00:00Z" };

describe("entities and events", () => {
  it("matches aliases and series", () => {
    expect(matchEntities("Joker scare grips Gotham").sort()).toEqual(["gotham", "joker"]);
    expect(entitiesForSeries("Detective Comics")).toEqual(["batman"]);
  });
  it("classifies scares", () => {
    expect(classifyText("hostage chaos")!.kind).toBe("SCARE");
    expect(classifyText("nothing relevant here")).toBeNull();
  });
});

describe("butterfly propagation", () => {
  const shocks = propagate(eventsFromArticles([scare]), NOW);
  it("Gotham and the Joker's other links are stressed", () => {
    expect(shocks.get("gotham")!.stress).toBeGreaterThan(0.3);
    expect(shocks.get("batman")!.stress).toBeGreaterThan(0.1);
    expect(shocks.get("wayne_enterprises")!.stress).toBeGreaterThan(0);
  });
  it("benefit reaches Wayne's backer and the Pennyworth shell, not the publisher", () => {
    expect(shocks.get("wayne_capital")!.benefit).toBeGreaterThan(0);
    expect(shocks.get("pennyworth_industries")!.benefit).toBeGreaterThan(0);
    expect(shocks.has("dc")).toBe(false);
  });
  it("keeps the causal trail for due diligence", () => {
    const t = shocks.get("gotham")!.trails[0];
    expect(t.path[t.path.length - 1]).toBe("gotham");
    expect(t.headline.length).toBeGreaterThan(0);
  });
  it("decays with age", () => {
    const old = propagate(eventsFromArticles([{ ...scare, published_at: "2026-09-01T06:00:00Z" }]), NOW);
    expect((old.get("gotham")?.stress ?? 0)).toBeLessThan(shocks.get("gotham")!.stress / 4);
  });
  it("conditions: volatility up, liquidity degrades, credit widens", () => {
    const c = conditionsFor(shocks.get("gotham"));
    expect(c.volMult).toBeGreaterThan(1);
    expect(c.creditAdd).toBeGreaterThan(0);
    expect(degradeState("OPEN", 1)).toBe("THIN");
    expect(degradeState("STRESSED", 2)).toBe("STRESSED");
    const batmanBook = conditionsForNodes(["batman"], shocks);
    expect(batmanBook.volMult).toBeGreaterThan(1);
  });
});

describe("credit, REIT, adjudication", () => {
  it("CDS spread ≈ λ(1−R) and rises with hazard", () => {
    const s = cdsSpread(0.02, 0.7, 5, 0.04);
    expect(s).toBeGreaterThan(0.0055);
    expect(s).toBeLessThan(0.0066);
    expect(cdsSpread(0.1, 0.7, 5, 0.04)).toBeGreaterThan(s);
  });
  it("REIT value falls as cap rate rises", () => {
    expect(reitUnitValue(100, 0.05, 500, 10)).toBeGreaterThan(reitUnitValue(100, 0.06, 500, 10));
  });
  it("rating from coverage, notched by stress", () => {
    expect(rateIssuer({ liquidWealth: 5e9, existingDebt: 2e8, newIssue: 5e7, stress: 0 }).rating).toBe("AAA");
    expect(rateIssuer({ liquidWealth: 5e9, existingDebt: 2e8, newIssue: 5e7, stress: 0.6 }).rating).toBe("AA");
  });
  it("adjudication rejects an oversized issue", () => {
    expect(adjudicateIssuance({ liquidWealth: 1e8, existingDebt: 0, amount: 6e7, stress: 0 }).approved).toBe(false);
    expect(adjudicateIssuance({ liquidWealth: 5e9, existingDebt: 2e8, amount: 5e7, stress: 0 }).approved).toBe(true);
  });
  it("Gotham scare cheapens Gotham bonds and REIT and lifts its CDS, versus a calm Metropolis", () => {
    const calm = issueInstitutional(new Map());
    const hot = issueInstitutional(propagate(eventsFromArticles([scare]), NOW));
    const px = (xs: any[], sym: string) => Number(xs.find((i) => i.symbol === sym).pricing.fmv_usd);
    expect(px(hot, "GOTHGO")).toBeLessThan(px(calm, "GOTHGO"));
    expect(px(hot, "GOTHRE")).toBeLessThan(px(calm, "GOTHRE"));
    expect(px(hot, "GOTHCDS")).toBeGreaterThan(px(calm, "GOTHCDS"));
    expect(px(hot, "METRGO")).toBeCloseTo(px(calm, "METRGO"), 6);
  });
  it("a headline-grade crisis moves prices realistically, not wildly", () => {
    const calm = issueInstitutional(new Map());
    const hot = issueInstitutional(propagate(eventsFromArticles([scare]), NOW));
    const ratio = (sym: string) => Number(hot.find((i) => i.symbol === sym)!.pricing.fmv_usd) / Number(calm.find((i) => i.symbol === sym)!.pricing.fmv_usd);
    expect(ratio("GOTHGO")).toBeGreaterThan(0.82); // bond down less than 18%
    expect(ratio("GOTHRE")).toBeGreaterThan(0.75); // trust down less than 25%
    expect(ratio("GOTHCDS")).toBeLessThan(3); // CDS under 3x
    expect(ratio("GOTHCDS")).toBeGreaterThan(1.5);
  });
});
