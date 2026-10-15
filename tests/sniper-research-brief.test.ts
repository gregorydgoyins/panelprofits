import { describe, expect, it } from "vitest";
import { marketBrief } from "@/lib/sniper/market-brief";
import { briefPrompt, briefSchema, groundedBrief, lessonClaims } from "@/lib/sniper/research-brief";
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
  it("uses verified creator roles and replaces unsupported cover claims", () => {
    const summary = { text: "Source plot", storyTitle: null, source: "Fandom", sourceUrl: "https://marvel.fandom.com", license: null, credits: { writers: ["David Michelinie"], pencilers: ["Todd McFarlane"] }, entities: { featuredCharacters: [{ label: "Spider-Man", target: "Spider-Man", url: "" }] } } as any;
    const result = groundedBrief({ series: "Amazing Spider-Man", issueNumber: "300", year: 1988, publisher: "Marvel" }, summary, { intro: "Wrong debut claim", sections: [], lessons: [{ heading: "Cover", text: "This rare limited print run of 2,200 copies is a homage" }, { heading: "B", text: "second lesson text here" }] });
    expect(result.intro).toContain("interior art by Todd McFarlane");
    expect(JSON.stringify(result.lessons)).not.toContain("2,200");
    expect(result.lessons).toHaveLength(0);
    expect(result.intro).not.toContain("debut");
  });
  it("keeps lessons the evidence supports and drops ones it cannot", () => {
    const sum = { text: "Gwen moves to Manhattan under TVA orders.", storyTitle: null, source: "x", sourceUrl: "x", license: null } as any;
    const input = { series: "Spider-Gwen", issueNumber: "1", year: null, publisher: null };
    const mk = (lessons: any[]) => ({ intro: "x".repeat(30), sections: [], lessons });
    const kept = groundedBrief(input, sum, mk([{ heading: "A", text: "Gwen hiding from the TVA is the hook." }, { heading: "B", text: "The title says SDCC EXL; verify the cover." }]), { title: "Spider-Gwen 1 SDCC EXL" });
    expect(kept.lessons).toHaveLength(2);
    const dropped = groundedBrief(input, sum, mk([{ heading: "A", text: "A rare print run of 2,200." }, { heading: "B", text: "Nothing else here." }]), { title: "Spider-Gwen 1" });
    expect(dropped.lessons).toHaveLength(0);
    expect(lessonClaims(mk([{ heading: "A", text: "Limited exclusive homage" }]) as any, sum, { title: "Spider-Gwen 1" }).length).toBeGreaterThan(0);
  });
  it("requires grounded plot, excludes fabricated prices and speculation", () => {
    const prompt = briefPrompt({ series: "Strange Academy", issueNumber: "14", year: 2021, publisher: "Marvel" }, { text: "Doyle sees a future confrontation.", storyTitle: null, source: "Marvel", sourceUrl: "https://www.marvel.com", license: null });
    expect(prompt).toContain("Doyle sees a future confrontation");
    expect(prompt).toContain("DO NOT include prices");
    expect(prompt).toContain("Do not predict adaptations");
    expect(briefSchema.safeParse({ intro: "Incomplete response" }).success).toBe(false);
  });
});
