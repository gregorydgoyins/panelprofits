import { describe, expect, it } from "vitest";
import * as fs from "fs";
import { buildUnderlyings } from "../lib/assets/underlyings";
import { issueInstruments } from "../lib/assets/instruments";
import { propagate, eventsFromArticles } from "../lib/assets/shock-propagation";
import { outcomesFromArticles } from "../lib/assets/outcomes";

const row = (o: any) => ({ comics_id: o.id, series: o.series, issue_number: o.issue, year: o.year, publisher: o.publisher, cover_url: "c", pp_id: null, pp_ladder: o.p ? { "9.8": o.p } : null, cb_price: null, cb_values: { 2021: o.p * 0.9, 2022: o.p, 2023: o.p, 2024: o.p }, cgc_total: 100, scarcity_tier: "rare" });
const rows = [row({ id: "1", series: "Detective Comics", issue: "27", year: 1939, publisher: "DC", p: 900000 }), row({ id: "2", series: "Detective Comics", issue: "66", year: 1942, publisher: "DC", p: 20000 }), row({ id: "3", series: "Amazing Spider-Man", issue: "300", year: 1988, publisher: "Marvel", p: 2600 }), row({ id: "4", series: "Batman", issue: "404", year: 1987, publisher: "DC", p: 150 })];

describe("every emitted asset type has surface art", () => {
  it("covers them all", () => {
    const now = Date.parse("2026-10-11T12:00:00Z");
    const arts = [{ id: "x", headline: "Joker wins defamation suit against Harvey Dent and Gotham City", summary: "", url: "u", published_at: "2026-10-11T06:00:00Z" }];
    const outcomes = outcomesFromArticles(arts);
    const shocks = propagate(eventsFromArticles(arts), now, outcomes);
    const items = issueInstruments(buildUnderlyings({ rail: rows, ppHistory: [], news: [], now }), shocks, now, outcomes);
    const cfg = fs.readFileSync(process.cwd() + "/lib/assets/surfaceConfig.ts", "utf8");
    const missing = [...new Set(items.map((i) => i.assetType))].filter((t) => !new RegExp(`\\n\\s+${t}:\\s+'/surface-art/`).test(cfg));
    expect(missing).toEqual([]);
  });
});
