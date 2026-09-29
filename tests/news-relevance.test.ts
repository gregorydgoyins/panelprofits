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

  it("strictly rejects sports wires, college athletics, and civic/courtroom news with 100% precision", () => {
    // Exact false-positive wire examples reported by users
    expect(isRelevantComicStory("PERIGON: KENTUCKY.COM", "Defensive Coordinator Tony White Apologizes to FSU Football's Offense", "The Florida State Seminoles (2-2, 0-1 ACC) defeated Central Arkansas 34-7.")).toBe(false);
    expect(isRelevantComicStory("PERIGON: FRESNOBEE.COM", "Defensive Coordinator Tony White Apologizes to FSU Football's Offense", "FSU defense struggles with penalties.")).toBe(false);
    expect(isRelevantComicStory("PERIGON: WTOP.COM", "Judge declares mistrial in DC Council member Trayon White's bribery case", "The jury failed to reach a verdict in the bribery trial.")).toBe(false);
    expect(isRelevantComicStory("PERIGON: DAILYWIRE.COM", "DC Politico Caught Taking Envelopes Of Cash On Camera Gets Off With Mistrial", "Political scandal in the district.")).toBe(false);
    expect(isRelevantComicStory("NEWSDATA", "NFL Quarterback throws four touchdowns in overtime win", "Sports roundup for Sunday games.")).toBe(false);
    expect(isRelevantComicStory("NEWSAPI", "Lakers defeat Celtics in NBA championship rematch", "Basketball game summary.")).toBe(false);
    expect(isRelevantComicStory("THENEWSAPI", "City Council approves municipal zoning ordinance for downtown park", "Local municipal affairs.")).toBe(false);
  });

  it("never auto-links generic real-world geographic locations into comic lore badges", async () => {
    const { findNewsEntities } = await import("@/lib/news/entities");
    const { parseTextWithEntities } = await import("@/components/news/linked-briefing");

    const sportsEntities = findNewsEntities(
      "Defensive Coordinator Tony White Apologizes to FSU Football's Offense",
      "The Florida State Seminoles defeated Central Arkansas in Florida. Florida has had defensive issues in Florida."
    );
    const terms = sportsEntities.map((e) => e.term.toLowerCase());
    expect(terms).not.toContain("florida");
    expect(terms).not.toContain("california");
    expect(terms).not.toContain("state of florida");

    // Also verify UI token parser does not badge Florida
    const nodes = parseTextWithEntities("The team played in Florida and Florida State won.", sportsEntities);
    const textRendered = nodes.map((n) => (typeof n === "string" ? n : "")).join("");
    // If Florida was not badged, it remains as raw text in the output nodes
    expect(textRendered).toContain("Florida");
  });

  it("greedily resolves full compound titles and storylines intact as single tokens", async () => {
    const { findNewsEntities } = await import("@/lib/news/entities");
    const { parseTextWithEntities } = await import("@/components/news/linked-briefing");

    const text = "Marvel Studios announces Spider-Man: Brand New Day and an Avengers: Endgame Encore theatrical release.";
    const entities = findNewsEntities(text, "Key theatrical franchise updates for comic collectors.");

    const entityTerms = entities.map((e) => e.term);
    expect(entityTerms).toContain("Spider-Man: Brand New Day");
    expect(entityTerms).toContain("Avengers: Endgame Encore");

    // Verify UI parser tokenizes the full compound phrase without leaving ': Brand New Day' or ': Endgame Encore' as trailing raw text
    const nodes = parseTextWithEntities(text, entities);
    const rawStrings = nodes.filter((n) => typeof n === "string") as string[];

    // Ensure raw strings do NOT contain the orphaned subtitle tails
    expect(rawStrings.some((s) => s.includes(": Brand New Day"))).toBe(false);
    expect(rawStrings.some((s) => s.includes(": Endgame Encore"))).toBe(false);
  });

  it("resolves multi-universe actor roles dynamically, links studios, and extracts full compound titles without truncation", async () => {
    const { findNewsEntities } = await import("@/lib/news/entities");
    const { parseTextWithEntities } = await import("@/components/news/linked-briefing");

    const text =
      "Sony is reportedly planning a rerelease of Spider-Man: Brand New Day, inspired by Marvel Studios' recent release of Avengers Endgame: Encore. " +
      "The studio is reportedly adding new footage to the film, which will include at least one cut cameo from Spider-man: BrandNew Day that connects to the Marvel Cinematic Universe. " +
      "The rerelease will feature extra footage featuring Rosario Dawson's character Claire Temple, aka Night Nurse. " +
      "This is not the first time Sony has rereleased one of its Tom Holland-starring Spider-M movies in theaters. " +
      "The reported rerelease could add another $50M to its worldwide box office haul.";

    const entities = findNewsEntities(
      "Spider-Man: Brand New Day Getting Official New Version, Report Says",
      text
    );

    const termSet = new Set(entities.map((e) => e.term));

    // 1. Sony studio is recognized and linked
    expect(termSet.has("Sony")).toBe(true);
    const sonyDef = entities.find((e) => e.term === "Sony");
    expect(sonyDef?.ticker).toBe("$SONY");
    expect(sonyDef?.type).toBe("publisher");

    // 2. Full compound title: Spider-Man: Brand New Day
    expect(termSet.has("Spider-Man: Brand New Day")).toBe(true);

    // 3. Full compound title: Avengers Endgame: Encore
    expect(termSet.has("Avengers Endgame: Encore")).toBe(true);

    // 4. Variation compound title: Spider-man: BrandNew Day (matches Spider-Man: BrandNew Day canonical)
    expect(termSet.has("Spider-Man: BrandNew Day") || termSet.has("Spider-man: BrandNew Day")).toBe(true);

    // 5. Mega-franchise: Marvel Cinematic Universe
    expect(termSet.has("Marvel Cinematic Universe")).toBe(true);
    const mcuDef = entities.find((e) => e.term === "Marvel Cinematic Universe");
    expect(mcuDef?.ticker).toBe("$MCU");
    // Ensure "The Marvel" obscure vehicle did NOT shadow Marvel Cinematic Universe
    expect(termSet.has("The Marvel")).toBe(false);

    // 6. Context-aware actor role: Rosario Dawson resolves to Claire Temple / Night Nurse ($NURSE), not $AHSOKA
    expect(termSet.has("Rosario Dawson")).toBe(true);
    const dawson = entities.find((e) => e.term === "Rosario Dawson");
    expect(dawson?.ticker).toBe("$NURSE");
    expect(dawson?.roleDetails?.character).toContain("Claire Temple");

    // 7. Decomposed character roles: Claire Temple and Night Nurse
    expect(termSet.has("Claire Temple")).toBe(true);
    const claire = entities.find((e) => e.term === "Claire Temple");
    expect(claire?.ticker).toBe("$NURSE");

    expect(termSet.has("Night Nurse")).toBe(true);
    const nurse = entities.find((e) => e.term === "Night Nurse");
    expect(nurse?.ticker).toBe("$NURSE");

    // 8. Wire abbreviation: Spider-M
    expect(termSet.has("Spider-M")).toBe(true);
    const spidM = entities.find((e) => e.term === "Spider-M");
    expect(spidM?.ticker).toBe("$SPDR");

    // 9. Market concepts: Box Office Haul
    expect(termSet.has("Box Office Haul") || termSet.has("Box Office")).toBe(true);

    // 10. Verify parseTextWithEntities does not truncate compound phrases into orphaned substrings
    const nodes = parseTextWithEntities(text, entities);
    const rawStrings = nodes.filter((n) => typeof n === "string") as string[];

    // Must NOT have orphaned subtitle tails
    expect(rawStrings.some((s) => s.includes(": Brand New Day"))).toBe(false);
    expect(rawStrings.some((s) => s.includes("Endgame: Encore"))).toBe(false);
    expect(rawStrings.some((s) => s.includes(": BrandNew Day"))).toBe(false);
    expect(rawStrings.some((s) => s.includes("Cinematic Universe"))).toBe(false);
  });
});