import { describe, it, expect } from "vitest";
import { generatePanelProfitsArticle, extractEntitiesFromContext } from "@/lib/news/generator";

describe("Panel Profits Original Article Generation Engine", () => {
  it("synthesizes original, substantive article body from facts and lexicon", () => {
    const generated = generatePanelProfitsArticle({
      storyKey: "6c0d2c48-69f3-447b-9b40-3232d5824cb9",
      source: "AIPT",
      sourceUrl: "https://aiptcomics.com/feed/",
      headline: "Marvel Preview: The Fantastic Four: First Foes – Dragon Man #1",
      rawSummary: "FROM THE WORLD OF THE BLOCKBUSTER MOVIE! As the Fantastic Four take the world by storm, Ben Grimm, the ever-lovin’ Thing, struggles in the spotlight in his rocky, monstrous form. But could there be a cure for his condition? And what does all of this have to do with the terrifying android known as DRAGON MAN? Written by : Greg Pak Art by : Mark Buckingham Cover by : Phil Noto Page Count : 32 Pages Release Date : September 30, 2026",
      scrapedContent: "Marvel Comics has released a first look at Fantastic Four First Foes Dragon Man #1 by Greg Pak and Mark Buckingham. The issue explores Ben Grimm's struggle with his rocky form while facing off against Dragon Man ahead of the upcoming film adaptation.",
      publishedAt: new Date().toISOString(),
    });

    expect(generated.headline).toBe("The Fantastic Four: First Foes – Dragon Man #1");
    expect(generated.deck).toContain("Dragon Man");
    expect(generated.paragraphs.length).toBeGreaterThanOrEqual(2);
    expect(generated.paragraphs[0]).toContain("Fantastic Four");
    expect(generated.paragraphs.join("\n\n").length).toBeGreaterThan(400);
  });

  it("extracts recognized entities from context string", () => {
    const entities = extractEntitiesFromContext("Greg Pak and Mark Buckingham present Dragon Man #1 for Marvel Comics.");
    const terms = entities.map((e) => e.term);
    expect(terms).toContain("Greg Pak");
    expect(terms).toContain("Mark Buckingham");
    expect(terms).toContain("Dragon Man");
    expect(terms).toContain("Marvel");
  });
});
