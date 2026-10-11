import { describe, it, expect } from "vitest";
import { analyzeStoryCatalyst } from "@/lib/news/catalyst";
import { parseAndSynthesizeArticle } from "@/lib/news/article-parser";

describe("news -> market impact (classification only)", () => {
  it("emits no price, percentage, probability or direction fields", () => {
    const a = analyzeStoryCatalyst("Zendaya returns as MJ in new Spider-Man film", "Casting confirmed.");
    const json = JSON.stringify(a);
    for (const banned of ["impactScore", "fmv", "delta7d", "delta30d", "priceFormatted", "BULLISH", "BEARISH", "volumeSurge"]) {
      expect(json).not.toContain(banned);
    }
    expect(["VOLATILITY", "NONE"]).toContain(a.marketImpact);
  });

  it("flags a named adaptation actor as a volatility catalyst on their landmark issue", () => {
    const a = analyzeStoryCatalyst("Zendaya confirmed for new film", "");
    expect(a.catalystType).toBe("CASTING_ATTACHMENT");
    expect(a.marketImpact).toBe("VOLATILITY");
    expect(a.affectedComics.map((c) => c.title)).toContain("The Amazing Spider-Man #42");
  });

  it("links a key issue named in the text and keeps only identity fields", () => {
    const a = analyzeStoryCatalyst("Wolverine debut Incredible Hulk #181 back in the news", "");
    const hulk = a.affectedComics.find((c) => c.title === "The Incredible Hulk #181");
    expect(hulk).toBeDefined();
    expect(hulk?.keySignificance).toBe("1st Appearance Wolverine");
    expect(Object.keys(hulk!).sort()).toEqual(["catalogQuery", "issueNumber", "keySignificance", "series", "ticker", "title"]);
  });

  it("reports NONE with no linked books for an unrelated story", () => {
    const a = analyzeStoryCatalyst("Local library hosts reading night", "Children's story hour.");
    expect(a.marketImpact).toBe("NONE");
    expect(a.affectedComics).toHaveLength(0);
  });

  it("is deterministic", () => {
    const s = ["Box office opening weekend for the new film", "Grossed over the weekend."] as const;
    expect(analyzeStoryCatalyst(s[0], s[1])).toEqual(analyzeStoryCatalyst(s[0] + " ", s[1]));
  });
});

describe("article body is the source text only", () => {
  it("returns the source paragraphs and nothing appended", () => {
    const art = parseAndSynthesizeArticle({
      headline: "Test headline",
      summary: "First paragraph.\n\nSecond paragraph.",
      source: "Example Wire",
      id: "t1",
    });
    expect(art.paragraphs).toEqual(["First paragraph.", "Second paragraph."]);
    expect(art.wordCount).toBe(4);
    expect(Object.keys(art).sort()).toEqual(["catalyst", "entities", "headline", "paragraphs", "readingTimeMinutes", "sections", "wordCount"]);
  });
});
