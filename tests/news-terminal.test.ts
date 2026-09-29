import { describe, expect, it } from "vitest";
import { selectAuthorForStory, generateAuthorMarketPrediction } from "@/lib/news/authors";
import { analyzeStoryCatalyst } from "@/lib/news/catalyst";

describe("newsroom bloomberg terminal intelligence", () => {
  it("generates 3-point analyst desk predictions with deterministic author assignment", () => {
    const author1 = selectAuthorForStory("Bleeding Cool", "story-123");
    expect(author1.name).toBe("Marcus Vance");
    expect(author1.yearsExperience).toBeGreaterThanOrEqual(10);

    const author2 = selectAuthorForStory("Variety", "story-456");
    expect(author2.name).toBe("Elena Rostova");
    expect(author2.beat).toContain("Film/TV Optioning");
  });

  it("produces market asset ripple projections linked to recognized tickers", () => {
    const prediction = generateAuthorMarketPrediction(
      "story-789",
      "Variety",
      "Sadie Sink in talks for Marvel Studios Thunderbolts project",
      "Songbird is expected to debut in the Marvel Cinematic Universe."
    );

    expect(prediction.author).toBeDefined();
    expect(prediction.historicalAccuracyScore).toMatch(/\d+%/);
    expect(prediction.ripples.length).toBeGreaterThan(0);
    const tickerList = prediction.ripples.map((r) => r.ticker);
    expect(tickerList.some((t) => t.startsWith("$"))).toBe(true);
  });

  it("catalyst engine links sovereign key equities to adaptation casting", () => {
    const analysis = analyzeStoryCatalyst(
      "Jon Bernthal Punisher Born Again Details Emerge",
      "Marvel confirms Frank Castle returns in new streaming series."
    );

    expect(analysis.affectedComics.length).toBeGreaterThan(0);
    const punisherKey = analysis.affectedComics.find((c) => c.ticker === "$PNSH");
    expect(punisherKey).toBeDefined();
    expect(punisherKey?.fmvCgc98).toBe(14500);
  });

  it("cleans story summary text for speech synthesis without bracket tokens", () => {
    const rawSummary = "Marvel announces [Sadie Sink](/wiki/entry/actor-sadie-sink) joining the cast of Thunderbolts.";
    const cleanSummary = rawSummary.replace(/\[\/?.*?\]/g, "");
    expect(cleanSummary).not.toContain("[");
    expect(cleanSummary).not.toContain("]");
    expect(cleanSummary).toContain("Marvel announces");
  });
});
