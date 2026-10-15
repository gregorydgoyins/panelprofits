import { describe, expect, it } from "vitest";
import { marketBrief } from "@/lib/sniper/market-brief";
import { briefPrompt, briefSchema, groundedBrief } from "@/lib/sniper/research-brief";
import { lensLessons } from "@/lib/sniper/research-lessons";
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
    expect(result.lessons).toHaveLength(3);
    expect(result.intro).not.toContain("debut");
  });
  it("keeps lessons the evidence supports and picks a different angle per book", () => {
    const mk = (names: string[]) => ({ text: "plot", storyTitle: null, source: "x", sourceUrl: "x", license: null, entities: { featuredCharacters: names.map((n) => ({ label: n, target: n, url: "" })) } }) as any;
    const solo = lensLessons(mk(["Beast"]), { title: "X-Men #1 CGC 9.8", grader: "CGC", grade: 9.8 });
    const duo = lensLessons(mk(["Green Arrow", "Green Lantern"]), { title: "Green Lantern 76 CGC 9.8 SDCC EXL", grader: "CGC", grade: 9.8 });
    const team = lensLessons(mk(["Cyclops", "Storm", "Wolverine"]), { title: "Uncanny X-Men 1 2nd print", grader: "CGC", grade: 9.8 });
    expect(solo[0].heading).toContain("Beast");
    expect(duo[0].heading).toContain("Green Arrow and Green Lantern");
    expect(duo[1].text).toContain("convention-exclusive wording");
    expect(new Set([solo[0].heading, duo[0].heading, team[0].heading]).size).toBe(3);
    expect(team[2].heading).toContain("reprint");
    const kept = groundedBrief({ series: "Spider-Gwen", issueNumber: "1", year: null, publisher: null }, mk(["Gwen Stacy"]), { intro: "x".repeat(30), sections: [], lessons: [{ heading: "A", text: "Gwen anchors this relaunch." }, { heading: "B", text: "Check the SDCC cover credit." }] }, { title: "Spider-Gwen 1 SDCC EXL" });
    expect(kept.lessons).toHaveLength(2);
  });
  it("requires grounded plot, excludes fabricated prices and speculation", () => {
    const prompt = briefPrompt({ series: "Strange Academy", issueNumber: "14", year: 2021, publisher: "Marvel" }, { text: "Doyle sees a future confrontation.", storyTitle: null, source: "Marvel", sourceUrl: "https://www.marvel.com", license: null });
    expect(prompt).toContain("Doyle sees a future confrontation");
    expect(prompt).toContain("DO NOT include prices");
    expect(prompt).toContain("Do not predict adaptations");
    expect(briefSchema.safeParse({ intro: "Incomplete response" }).success).toBe(false);
  });
});
