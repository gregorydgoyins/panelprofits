import { describe, expect, it } from "vitest";
import { buildUnderlyings, pickPrice } from "../lib/assets/underlyings";
import { issueInstruments } from "../lib/assets/instruments";

const row = (o: any) => ({ comics_id: o.id, series: o.series, issue_number: o.issue, year: o.year, publisher: o.publisher, cover_url: "c", pp_id: o.pp ?? null, pp_ladder: o.pp98 ? { "9.8": o.pp98 } : null, cb_price: o.cb ?? null, cb_values: o.cbv ?? null, cgc_total: o.pop ?? null, scarcity_tier: o.tier ?? null });

const rows = [
  row({ id: "det27", series: "Detective Comics", issue: "27", year: 1939, publisher: "DC", pp98: 240, cb: 1150000, pop: 87, tier: "mythic", cbv: { 2021: 900000, 2022: 950000, 2023: 1000000, 2024: 1150000 } }),
  row({ id: "asm1", series: "Amazing Spider-Man", issue: "1", year: 1963, publisher: "Marvel", pp98: 642831.26, pop: 5434, tier: "mythic", pp: "1", cbv: { 2021: 600000, 2022: 610000, 2023: 620000, 2024: 640000 } }),
  row({ id: "asm300a", series: "Amazing Spider-Man", issue: "300", year: 1988, publisher: "Marvel", pp98: 2597.35, pop: 41681, tier: "common", pp: "2", cbv: { 2021: 800, 2022: 820, 2023: 850, 2024: 900 } }),
  row({ id: "asm300b", series: "Amazing Spider-Man", issue: "300", year: 1988, publisher: "Marvel", pp98: 8126.04, pop: 41681, tier: "common", pp: "3", cbv: { 2021: 800, 2022: 820, 2023: 850, 2024: 900 } }),
  row({ id: "act1", series: "Action Comics", issue: "1", year: 1938, publisher: "DC", cb: 5454500, pop: 86, tier: "mythic", cbv: { 2021: 3000000, 2022: 3300000, 2023: 4100000, 2024: 5454500 } }),
  row({ id: "bat181", series: "Batman", issue: "181", year: 1966, publisher: "DC", pp98: 27959.87, cb: 2525, pop: 4764, tier: "legendary", cbv: { 2021: 2000, 2022: 2100, 2023: 2300, 2024: 2525 } }),
  row({ id: "fantasy", series: "Weird Flat", issue: "3", year: 1954, publisher: "Atlas", pp98: 5000, pop: 40, tier: "rare", pp: "9", cbv: { 2021: 4800, 2022: 4900, 2023: 4950, 2024: 5000 } }),
  row({ id: "m1", series: "Marvel Alt", issue: "7", year: 1965, publisher: "Marvel", pp98: 4000, pop: 200, tier: "uncommon", pp: "10", cbv: { 2021: 3900, 2022: 3950, 2023: 3980, 2024: 4000 } }),
  row({ id: "d1", series: "DC Alt", issue: "9", year: 1971, publisher: "DC", pp98: 3000, pop: 300, tier: "uncommon", pp: "11", cbv: { 2021: 2900, 2022: 2950, 2023: 2980, 2024: 3000 } }),
];

describe("pickPrice", () => {
  it("flags a PriceCharting price under a tenth of ComicBase as a mismatched reprint", () => {
    expect(pickPrice(rows[0])).toEqual({ price: 1150000, source: "comicbase" });
    expect(pickPrice(rows[1])).toEqual({ price: 642831.26, source: "pricecharting" });
    expect(pickPrice(rows[4])).toEqual({ price: 5454500, source: "comicbase" });
  });
});

describe("underlyings and instruments", () => {
  const nowMs = Date.parse("2026-10-11T00:00:00Z");
  const unders = buildUnderlyings({
    rail: rows,
    ppHistory: [
      { pp_id: "10", snapshot_date: "2026-10-06", pp_price_9_8: 4000 },
      { pp_id: "10", snapshot_date: "2026-10-07", pp_price_9_8: 4040 },
      { pp_id: "10", snapshot_date: "2026-10-08", pp_price_9_8: 3990 },
    ],
    news: [{ headline: "Marvel Alt hits record", summary: "", published_at: "2026-10-10T12:00:00Z" }],
    now: nowMs,
  });
  it("dedupes ASM 300 to one book and keeps the original-year rows", () => {
    expect(unders.filter((u) => u.series === "Amazing Spider-Man" && u.issueNumber === "300").length).toBe(1);
    expect(unders.length).toBe(8);
  });
  it("uses PriceCharting nightly snapshots in vol once there are three", () => {
    const u = unders.find((x) => x.series === "Marvel Alt")!;
    expect(u.sigmaSources.includes("pricecharting")).toBe(true);
    expect(u.newsShock).toBeGreaterThan(1);
  });
  const items = issueInstruments(unders);
  it("issues every family with positive finite prices and no comics", () => {
    for (const it of items) {
      const p = Number(it.pricing.fmv_usd);
      expect(Number.isFinite(p) && p > 0).toBe(true);
    }
    const types = new Set(items.map((i) => i.assetType));
    for (const t of ["OPTIONS", "FUTURES", "NFT", "PRIVATE", "COMMODITY"]) expect(types.has(t)).toBe(true);
    // characters are baskets of equities, never a bare comic seat
    expect(types.has("COMIC")).toBe(false);
    for (const it of items.filter((i) => ["CHARACTER", "DC_CHARACTER", "VILLAIN", "SECRET_IDENTITY"].includes(i.assetType)))
      expect(String(it.pricing.formula).startsWith("Basket")).toBe(true);
  });
  it("symbols are unique", () => {
    const syms = items.map((i) => i.entryId);
    expect(new Set(syms).size).toBe(syms.length);
  });
});
