import { describe, expect, it } from "vitest";
import { rosterFromRows } from "../lib/assets/roster";
import { issueCharacters } from "../lib/assets/characters";
import { buildUnderlyings } from "../lib/assets/underlyings";

const r = (o: any) => ({ universe: "DC", first_series: "Action Comics", first_issue: "1", book_year: 1938, comics_id: "act1", ...o });
const rows = [
  r({ codename: "Superman", slug: "superman-clark-kent", stories: 26648, share: 0.359511 }),
  r({ codename: "Superman", slug: "kal-l-earth-two", stories: 26648, share: 0.359511 }),
  r({ codename: "Lois Lane-Kent", slug: "lois-lane-prime-earth", stories: 13793, share: 0.186083 }),
  r({ codename: "Scoop Scanlon", slug: "scoop-scanlon-earth-two", stories: 26, share: 0.0003 }),
  r({ codename: "Zero Share", slug: "zero", stories: 5, share: 0 }),
];
const book = { comics_id: "act1", series: "Action Comics", issue_number: "1", year: 1938, publisher: "DC", cover_url: "c", pp_id: null, pp_ladder: null, cb_price: 5454500, cb_values: { 2021: 3000000, 2022: 3300000, 2023: 4100000, 2024: 5454500 }, cgc_total: 86, scarcity_tier: "mythic" };

describe("roster", () => {
  it("picks the original bearer of a shared codename (earliest debut), not a later namesake", () => {
    const ro = rosterFromRows([
      r({ codename: "Batman", slug: "sergeant-mack-new-earth", stories: 75996, share: 0.96, book_year: 1998, first_series: "Batman: Legends of the Dark Knight", first_issue: "101", comics_id: "x" }),
      r({ codename: "Batman", slug: "batman-bruce-wayne", stories: 75996, share: 0.47, book_year: 1939, first_series: "Detective Comics", first_issue: "27", comics_id: "det27" }),
    ]);
    expect(ro.length).toBe(1);
    expect(ro[0].slug).toBe("batman-bruce-wayne");
  });
  it("keeps one equity per codename, drops zero-share, orders by prominence", () => {
    const ro = rosterFromRows(rows);
    expect(ro.map((x) => x.name)).toEqual(["Superman", "Lois Lane-Kent", "Scoop Scanlon"]);
    expect(ro[0].slug).toBe("superman-clark-kent");
  });
  it("caps per universe", () => {
    const many = Array.from({ length: 10 }, (_, k) => r({ codename: `C${k}`, slug: `c${k}`, stories: 100 - k, share: 0.1 }));
    expect(rosterFromRows(many, 4).length).toBe(4);
  });
  it("prices a character as its share of the debut book at market price", () => {
    const now = Date.parse("2026-10-11T12:00:00Z");
    const unders = buildUnderlyings({ rail: [book], ppHistory: [], news: [], now });
    const items = issueCharacters(unders, new Map(), now, [], rosterFromRows(rows));
    const px = (n: string) => Number(items.find((i) => i.displayName === n)!.pricing.fmv_usd);
    const bookPx = unders[0].price;
    // Superman is already a graph basket instrument, so the roster does not list him twice
    expect(items.filter((i) => i.displayName === "Superman").length).toBe(1);
    expect(px("Lois Lane-Kent") / bookPx).toBeGreaterThan(0.12);
    expect(px("Lois Lane-Kent") / bookPx).toBeLessThan(0.27);
    expect(px("Scoop Scanlon")).toBeLessThan(px("Lois Lane-Kent") / 300);
    expect(items.find((i) => i.displayName === "Lois Lane-Kent")!.assetType).toBe("DC_CHARACTER");
  });
});
