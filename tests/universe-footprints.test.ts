import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { universeFromRows, leadingCharacters, UNIVERSE_KEYS } from "../lib/assets/universe-footprints";
import { ERAS, valueFootprint } from "../lib/assets/footprint";
import { issueCharacters } from "../lib/assets/characters";
import { buildUnderlyings } from "../lib/assets/underlyings";
import { CHARACTER_BOOKS } from "../lib/assets/entity-graph";

const rows = JSON.parse(readFileSync("data/universe/character-footprints.json", "utf8"));
const chars = universeFromRows(rows);
const by = (k: string) => chars.find((c) => c.key === k)!;

describe("whole-universe footprints from the wiki appearance lists", () => {
  it("covers both publishers with the leading characters and every graph character", () => {
    expect(chars.filter((c) => c.universe === "DC").length).toBeGreaterThan(500);
    expect(chars.filter((c) => c.universe === "MARVEL").length).toBeGreaterThan(500);
    for (const key of Object.values(UNIVERSE_KEYS)) expect(!!by(key)).toBe(true);
  });
  it("Batman's debut is Detective Comics #27 from the wiki, no curated anchor needed", () => {
    const b = by("bruce wayne");
    expect(b.debut?.year).toBe(1939);
    expect(b.debut?.page).toBe("Detective Comics Vol 1 27");
    expect(b.footprint.top.some((x) => x.series === "Detective Comics" && x.issue === "27")).toBe(true);
  });
  it("the four ages add up to the stored total", () => {
    for (const c of chars.slice(0, 200)) {
      const sum = ERAS.reduce((s, e) => s + c.footprint.eras[e].nav, 0);
      expect(Math.abs(sum - c.nav) / Math.max(1, c.nav)).toBeLessThan(0.002);
    }
  });
  it("no character owns more than 40% of an issue", () => {
    for (const c of chars) for (const b of c.footprint.top) expect(b.share).toBeLessThanOrEqual(0.4001);
  });
  it("live prices keyed by catalog id move the footprint", () => {
    const b = by("bruce wayne");
    const base = valueFootprint(b.footprint, { get: () => undefined });
    const lead = b.footprint.top[0];
    const up = valueFootprint(b.footprint, { get: (k) => (k === `pp:${lead.ppId}` ? lead.px * 2 : undefined) });
    expect(up.nav).toBeGreaterThan(base.nav * 1.05);
  });
  it("listed characters per publisher are ranked by footprint", () => {
    const lead = leadingCharacters(chars, 25);
    expect(lead.filter((c) => c.universe === "DC").length).toBe(25);
    const dc = lead.filter((c) => c.universe === "DC");
    for (let i = 1; i < dc.length; i++) expect(dc[i - 1].nav >= dc[i].nav).toBe(true);
  });
  it("issues Batman and a listed character from live catalog ids", () => {
    const wayne = by("bruce wayne");
    const ids = new Set(wayne.footprint.top.slice(0, 5).map((b) => String(b.ppId)));
    const other = leadingCharacters(chars, 40).find((c) => c.universe === "MARVEL")!;
    for (const b of other.footprint.top.slice(0, 5)) ids.add(String(b.ppId));
    const row = (id: string, series: string, issue: string, year: number) => ({ comics_id: `c${id}`, series, issue_number: issue, year, publisher: "DC", cover_url: "c", pp_id: id, pp_ladder: { "9.8": 5000 }, cb_price: null, cb_values: { 2021: 5000, 2022: 5000, 2023: 5000, 2024: 5000 }, cgc_total: 100, scarcity_tier: "rare" });
    const all = [...wayne.footprint.top.slice(0, 5), ...other.footprint.top.slice(0, 5)];
    const now = Date.parse("2026-10-11T12:00:00Z");
    const graphRows = CHARACTER_BOOKS.batman.map((b, n) => ({ ...row(String(9000000 + n), b.series, b.issue, b.year), pp_id: null }));
    const unders = buildUnderlyings({ rail: [...all.map((b) => row(String(b.ppId), b.series, b.issue, b.year ?? 2000)), ...graphRows], ppHistory: [], news: [], now });
    const items = issueCharacters(unders, new Map(), now, [], [], new Map(), chars);
    const bat = items.find((i) => i.assetId === "DC_CHARACTER-batman");
    expect(!!bat).toBe(true);
    expect(Number(bat!.pricing.price)).toBeGreaterThan(0);
    expect(String(bat!.description).includes("issues")).toBe(true);
    expect(items.some((i) => String(i.assetId).includes("-u-") && i.universe === "Marvel")).toBe(true);
  });
});
