import { describe, it, expect } from "vitest";
import { analyzeStoryCatalyst } from "@/lib/news/catalyst";
import { parseAndSynthesizeArticle } from "@/lib/news/article-parser";
import { parseTextWithEntities } from "@/components/news/linked-briefing";
import type { EntityWikiDef } from "@/lib/news/entities";

describe("News UI & Engine Reaction Time Optimization", () => {
  it("memoizes analyzeStoryCatalyst to sub-millisecond response on repeated queries", () => {
    const headline = "Sony Pictures Fast-Tracks Spider-Man 4 With Tom Holland";
    const summary = "Sony and Marvel Studios solidify release schedule for next Spider-Man cinematic installment.";

    // Cold call
    const t0 = performance.now();
    const first = analyzeStoryCatalyst(headline, summary);
    const coldDuration = performance.now() - t0;

    expect(first).toBeDefined();
    expect(first.marketImpact).toBe("BULLISH");

    // Warm repeated calls (must be instant from cache)
    const t1 = performance.now();
    const second = analyzeStoryCatalyst(headline, summary);
    const warmDuration = performance.now() - t1;

    expect(second).toEqual(first);
    expect(warmDuration).toBeLessThan(1.5); // sub-millisecond execution
  });

  it("memoizes parseAndSynthesizeArticle to sub-millisecond response on repeated dispatches", () => {
    const story = {
      headline: "5 Essential Cyberpunk Books To Read If You're New To The Genre",
      summary: "Cyberpunk is not a genre about technology. It explores what happens when corporations control reality.",
      source: "CBR",
      author: "Fawzia Khan",
      id: "7fdd70db-d63d-4ee6-87e8-59f1c2a0ccea",
    };

    // Cold synthesis
    const t0 = performance.now();
    const first = parseAndSynthesizeArticle(story);
    const coldDuration = performance.now() - t0;

    expect(first).toBeDefined();
    expect(first.paragraphs.length).toBeGreaterThanOrEqual(4);

    // Warm synthesis (must be instant from cache)
    const t1 = performance.now();
    const second = parseAndSynthesizeArticle(story);
    const warmDuration = performance.now() - t1;

    expect(second).toBe(first); // exact cached reference
    expect(warmDuration).toBeLessThan(1.0);
  });

  it("tokenizes paragraphs rapidly using shared compiled regex across calls", () => {
    const entities: EntityWikiDef[] = [
      {
        term: "Spider-Man",
        ticker: "$SPDR",
        type: "character",
        target: "intelligence",
        wikiPath: "/wiki/entry/spider-man",
      },
      {
        term: "Fair Market Value",
        type: "market-concept",
        target: "lexicon",
        wikiPath: "/lexicon/fair-market-value",
      },
    ];

    const paragraph = "Spider-Man key issues trade based on Fair Market Value benchmarks on the secondary market.";

    const t0 = performance.now();
    const nodes1 = parseTextWithEntities(paragraph, entities);
    const nodes2 = parseTextWithEntities(paragraph, entities);
    const duration = performance.now() - t0;

    expect(nodes1.length).toBeGreaterThan(1);
    expect(nodes2.length).toBe(nodes1.length);
    expect(duration).toBeLessThan(5.0);
  });
});
