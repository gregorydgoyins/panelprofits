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

  it("extracts multi-universe lore items and locations into dedicated wiki dossier links", async () => {
    const { findNewsEntities } = await import("@/lib/news/entities");
    const entities = findNewsEntities("Rare prototype of the Batmobile surfaces alongside the Infinity Gauntlet", "Collector auction highlights");
    const terms = entities.map((e) => e.term);
    expect(terms).toContain("Batmobile");
    expect(terms).toContain("Infinity Gauntlet");
    const batmobileDef = entities.find((e) => e.term === "Batmobile");
    expect(batmobileDef?.wikiPath).toMatch(/^\/wiki\/entry\//);
  });

  it("automatically admits dedicated comic video channels and extracts authentic video embeds", async () => {
    expect(isRelevantComicStory("LORDS OF THE LONG BOX", "Top 10 Key Issues Heating Up This Week", "Speculation market briefing")).toBe(true);
    expect(isRelevantComicStory("NEAR MINT CONDITION", "Upcoming Marvel Omnibus Releases", "Full unboxing overview")).toBe(true);
    const { extractAuthenticVideo } = await import("@/components/news/authentic-video-embed");
    const video = extractAuthenticVideo("Check out this week's key run", "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(video).not.toBeNull();
    expect(video?.provider).toBe("youtube");
    expect(video?.embedUrl).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  });

  it("admits entertainment wire reports referencing major comic adaptation actors", () => {
    // Tests for user-audited actors: Zendaya, Sadie Sink, Jon Bernthal, Rosario Dawson
    expect(isRelevantComicStory("VARIETY", "Zendaya speaks on future projects in Hollywood", "Exclusive interview on career trajectories.")).toBe(true);
    expect(isRelevantComicStory("DEADLINE", "Sadie Sink joins high-profile ensemble cast", "Production slated to begin next quarter.")).toBe(true);
    expect(isRelevantComicStory("THR", "Jon Bernthal discusses physical preparation for upcoming shoot", "The actor prepares for his iconic gritty role.")).toBe(true);
    expect(isRelevantComicStory("PERIGON", "Rosario Dawson gives schedule update for upcoming season", "Filming timeline confirmed by production team.")).toBe(true);
  });

  it("extracts adaptation actors and bridges them to canonical characters and tickers", async () => {
    const { findNewsEntities } = await import("@/lib/news/entities");

    const zendayaEntities = findNewsEntities("Zendaya spotted at screening alongside cast", "Entertainment news bulletin");
    expect(zendayaEntities.map((e) => e.term)).toContain("Zendaya");
    expect(zendayaEntities.some((e) => e.ticker === "$SPDR")).toBe(true);

    const bernthalEntities = findNewsEntities("Jon Bernthal confirms appearance at fan convention", "Actor discusses franchise legacy");
    expect(bernthalEntities.map((e) => e.term)).toContain("Jon Bernthal");
    expect(bernthalEntities.some((e) => e.term.includes("The Punisher"))).toBe(true);
    expect(bernthalEntities.some((e) => e.ticker === "$PNSH")).toBe(true);

    const dawsonEntities = findNewsEntities("Rosario Dawson discusses character journey across multiple franchises", "Media spotlight");
    expect(dawsonEntities.map((e) => e.term)).toContain("Rosario Dawson");
    expect(dawsonEntities.some((e) => e.term.includes("Ahsoka Tano"))).toBe(true);
    expect(dawsonEntities.some((e) => e.ticker === "$AHSOKA")).toBe(true);

    const sinkEntities = findNewsEntities("Sadie Sink in advanced talks for mysterious comic studio role", "Industry rumors");
    expect(sinkEntities.map((e) => e.term)).toContain("Sadie Sink");
    expect(sinkEntities.some((e) => e.term.includes("Songbird"))).toBe(true);
  });
});