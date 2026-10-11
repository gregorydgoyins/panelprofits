import { describe, expect, it } from "vitest";
import { censusFromRows, censusLine, censusKey } from "../lib/assets/universe";
import { issueCharacters } from "../lib/assets/characters";
import { buildUnderlyings } from "../lib/assets/underlyings";

const census = censusFromRows([
  { universe: "DC", wiki_pages: 33662, individuals: 25709, prime_individuals: 12518, codenames: 17608, realities: 845, individuals_with_first_book: 13824 },
  { universe: "MARVEL", wiki_pages: 103802, individuals: 53423, prime_individuals: 36637, codenames: 47184, realities: 4845, individuals_with_first_book: 47977 },
]);

describe("character universe census", () => {
  it("counts people, not pages", () => {
    const dc = census.find((c) => c.universe === "DC")!;
    expect(dc.individuals).toBeLessThan(dc.wikiPages);
    expect(dc.primeIndividuals).toBeLessThan(dc.individuals);
    expect(dc.codenames).toBeLessThan(dc.individuals);
  });
  it("describes a character's place in the universe", () => {
    expect(censusLine(census.find((c) => c.universe === censusKey("Marvel")))).toBe("36,637 in main continuity, 53,423 individuals across 4,845 realities");
    expect(censusLine(undefined)).toBe("");
  });
  it("tolerates missing rows", () => {
    expect(censusFromRows(null)).toEqual([]);
  });
  it("Batman's instrument says which universe it belongs to", () => {
    const row = (id: string, series: string, issue: string, year: number, p: number) => ({ comics_id: id, series, issue_number: issue, year, publisher: "DC", cover_url: "c", pp_id: null, pp_ladder: { "9.8": p }, cb_price: null, cb_values: { 2021: p, 2022: p, 2023: p, 2024: p }, cgc_total: 100, scarcity_tier: "rare" });
    const now = Date.parse("2026-10-11T12:00:00Z");
    const unders = buildUnderlyings({ rail: [row("a", "Detective Comics", "27", 1939, 900000), row("b", "Batman", "404", 1987, 150)], ppHistory: [], news: [], now });
    const items = issueCharacters(unders, new Map(), now, census);
    const bat = items.find((i) => String(i.assetId).endsWith("batman"));
    expect(!!bat).toBe(true);
    expect(String(bat!.description).includes("12,518 in main continuity")).toBe(true);
    expect((bat!.parameters as any).universe.individuals).toBe(25709);
  });
});
