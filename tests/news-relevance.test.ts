import { describe, expect, it } from "vitest";
import { isRelevantComicStory } from "@/lib/news/feed";

describe("newsroom relevance gate", () => {
  it("rejects unrelated material from general or non-industry feeds", () => {
    expect(isRelevantComicStory("COMICBOOK", "PWI 500 unveils its 2025 wrestling rankings", "A full ranking of professional wrestlers.")).toBe(false);
    expect(isRelevantComicStory("GUARDIAN", "A history book examines slavery and empire", "A review of a new work of history.")).toBe(false);
  });

  it("admits real-world media conglomerate M&A and financial news for equities tracking", () => {
    expect(isRelevantComicStory("VARIETY", "Paramount Skydance and Warner Bros Discovery merger faces opposition", "The coalition argues the merger deal would hurt consumers and media workers.")).toBe(true);
    expect(isRelevantComicStory("THR", "Disney earnings highlight quarterly revenue", "The annual report cites corporate financial results and shares performance.")).toBe(true);
  });

  it("keeps directly relevant comics and character reporting", () => {
    expect(isRelevantComicStory("VARIETY", "Marvel announces a new X-Men series", "The superhero franchise returns with a new creative team.")).toBe(true);
  });

  it("extracts canonical Marvel characters into entity links", async () => {
    const { findNewsEntities } = await import("@/lib/news/entities");
    const entities = findNewsEntities("Tomb of Apocalypse: Jubilee has a grave problem with Bucky", "Marvel comics release");
    const terms = entities.map((e) => e.term);
    expect(terms).toContain("Apocalypse");
    expect(terms).toContain("Jubilee");
    expect(terms).toContain("Bucky");
  });

  it("extracts canonical DC characters into entity links", async () => {
    const { findNewsEntities } = await import("@/lib/news/entities");
    const entities = findNewsEntities("Batman and Superman confront Joker in Gotham", "DC Comics release");
    const terms = entities.map((e) => e.term);
    expect(terms).toContain("Batman");
    expect(terms).toContain("Superman");
    expect(terms).toContain("Joker");
    expect(terms).toContain("DC Comics");
  });
});