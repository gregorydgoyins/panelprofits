import { describe, expect, it } from "vitest";
import { ERAS, eraOf, footprintsFromRows, valueFootprint, bookKey, FOOTPRINT_UNITS, type Footprint } from "../lib/assets/footprint";
import { issueCharacters } from "../lib/assets/characters";
import { buildUnderlyings } from "../lib/assets/underlyings";

const top = [
  { name_key: "batman", series: "Batman", issue: "1", year: 1940, share: 1, px: 1259975, rk: 1 },
  { name_key: "batman", series: "Detective Comics", issue: "140", year: 1948, share: 1, px: 47900, rk: 2 },
  { name_key: "batman", series: "Batman", issue: "181", year: 1966, share: 0.28, px: 27960, rk: 3 },
];
const eras = [
  { name_key: "batman", era: "GOLDEN", books: 341, nav: 1549160 },
  { name_key: "batman", era: "SILVER", books: 491, nav: 88927 },
  { name_key: "batman", era: "BRONZE", books: 816, nav: 35375 },
  { name_key: "batman", era: "MODERN", books: 4648, nav: 81791 },
];
const fp = (): Footprint => footprintsFromRows(top, eras).get("batman")!;

describe("footprint valuation", () => {
  it("ages partition the years", () => {
    expect([1939, 1955, 1956, 1969, 1970, 1985, 1986, 2024].map(eraOf)).toEqual(["GOLDEN", "GOLDEN", "SILVER", "SILVER", "BRONZE", "BRONZE", "MODERN", "MODERN"]);
  });
  it("with no live prices it reproduces the stored NAV", () => {
    const v = valueFootprint(fp(), { get: () => undefined });
    expect(Math.round(v.nav)).toBe(1549160 + 88927 + 35375 + 81791);
    expect(v.drift).toBe(1);
  });
  it("the tail follows the leaders: a 10% move in live leaders moves the whole NAV about 10%", () => {
    const live = { get: (k: string) => ({ [bookKey("Batman", "1", 1940)]: 1259975 * 1.1, [bookKey("Detective Comics", "140", 1948)]: 47900 * 1.1, [bookKey("Batman", "181", 1966)]: 27960 * 1.1 })[k] };
    const v0 = valueFootprint(fp(), { get: () => undefined });
    const v1 = valueFootprint(fp(), live);
    expect(v1.nav / v0.nav).toBeGreaterThan(1.095);
    expect(v1.nav / v0.nav).toBeLessThan(1.105);
  });
  it("era slices sum to the whole", () => {
    const v = valueFootprint(fp(), { get: (k) => (k === bookKey("Batman", "1", 1940) ? 1_400_000 : undefined) });
    expect(Math.abs(ERAS.reduce((s, e) => s + v.byEra[e].nav, 0) - v.nav)).toBeLessThan(1e-6);
  });
  it("a curated anchor the story credits missed is added, and the cached footprint is never mutated", () => {
    const f = fp();
    const before = JSON.stringify(f);
    const live = { get: (k: string) => (k === bookKey("Detective Comics", "27", 1939) ? 1_150_000 : undefined) };
    const v0 = valueFootprint(f, { get: () => undefined });
    const v1 = valueFootprint(f, live, [{ series: "Detective Comics", issue: "27", year: 1939 }]);
    expect(v1.nav - v0.nav).toBeGreaterThan(0.3 * 1_150_000);
    expect(v1.byEra.GOLDEN.books).toBe(342);
    expect(JSON.stringify(f)).toBe(before);
  });
});

describe("character footprint instruments", () => {
  const row = (id: string, series: string, issue: string, year: number, p: number) => ({ comics_id: id, series, issue_number: issue, year, publisher: "DC", cover_url: "c", pp_id: null, pp_ladder: { "9.8": p }, cb_price: null, cb_values: { 2021: p, 2022: p, 2023: p, 2024: p }, cgc_total: 100, scarcity_tier: "rare" });
  const now = Date.parse("2026-10-11T12:00:00Z");
  const unders = buildUnderlyings({ rail: [row("a", "Batman", "1", 1940, 1259975), row("b", "Detective Comics", "27", 1939, 900000), row("c", "Batman", "181", 1966, 27960)], ppHistory: [], news: [], now });
  const items = issueCharacters(unders, new Map(), now, [], [], footprintsFromRows(top, eras));
  it("Batman is priced from the whole footprint, not four books", () => {
    const bat = items.find((i) => i.assetId === "DC_CHARACTER-batman")!;
    expect(String(bat.description).startsWith("Footprint of")).toBe(true);
    expect(Number((bat.parameters as any).nav)).toBeGreaterThan(1_700_000);
  });
  it("the four ages add up to the character", () => {
    const bat = items.find((i) => i.assetId === "DC_CHARACTER-batman")!;
    const slices = items.filter((i) => String(i.assetId).startsWith("INDEX-batman-"));
    expect(slices.length).toBe(4);
    const sum = slices.reduce((s, i) => s + Number(i.pricing.fmv_usd), 0);
    expect(Math.abs(sum - Number(bat.pricing.fmv_usd))).toBeLessThan(0.05);
    expect(FOOTPRINT_UNITS).toBe(10000);
  });
  it("Golden Age is most of Batman's value, as the data says", () => {
    const g = Number(items.find((i) => i.assetId === "INDEX-batman-golden")!.pricing.fmv_usd);
    const bat = Number(items.find((i) => i.assetId === "DC_CHARACTER-batman")!.pricing.fmv_usd);
    expect(g / bat).toBeGreaterThan(0.7);
  });
});
