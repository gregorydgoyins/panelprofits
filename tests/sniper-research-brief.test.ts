import { describe, expect, it } from "vitest";
import { marketBrief } from "@/lib/sniper/market-brief";
import { briefPrompt, briefSchema } from "@/lib/sniper/research-brief";
const input = { listingGrade: 9.8, chartGrade: 9.8, count: 3, median: 100, low: 80, high: 120, latest: { price: 100, date: "2026-10-14" }, allInCost: 110 };
describe("evidence-based investor brief", () => {
  it("does not value a listing using another grade", () => {
    const points = marketBrief({ ...input, chartGrade: 7.5 });
    expect(points).toHaveLength(1);
    expect(points[0].text).toContain("cannot establish the value");
    expect(points[0].text).not.toContain("$100");
  });
  it("calls an above-median acquisition out without inventing profit", () => {
    const text = marketBrief(input).map(p => p.text).join(" ");
    expect(text).toContain("$10.00 above");
    expect(text).toContain("does not support buying below");
  });
  it("does not infer FMV or annual volume from a single transaction", () => {
    const text = marketBrief({ ...input, count: 1 }).map(p => p.text).join(" ");
    expect(text).toContain("not a stable FMV");
    expect(text).toContain("cannot establish annual trading volume");
  });
  it("separates variant title matches from verified cover identity", () => {
    const text = marketBrief({ ...input, variant: "Todd Nauck", editionTerms: "nauck" }).map(p => p.text).join(" ");
    expect(text).toContain("restricted to nauck");
    expect(text).toContain("must still be confirmed");
  });
  it("requires grounded plot, excludes fabricated prices and speculation", () => {
    const prompt = briefPrompt({ series: "Strange Academy", issueNumber: "14", year: 2021, publisher: "Marvel" }, { text: "Doyle sees a future confrontation.", storyTitle: null, source: "Marvel", sourceUrl: "https://www.marvel.com", license: null });
    expect(prompt).toContain("Doyle sees a future confrontation");
    expect(prompt).toContain("DO NOT include prices");
    expect(prompt).toContain("Do not predict adaptations");
    expect(briefSchema.safeParse({ intro: "Incomplete response" }).success).toBe(false);
  });
});
