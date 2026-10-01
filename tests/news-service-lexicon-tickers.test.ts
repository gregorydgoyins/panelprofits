import { describe, expect, it } from "vitest";
import { parseAndSynthesizeArticle } from "@/lib/news/article-parser";
import { getCbrTermBySlug, searchCbrTerms } from "@/lib/lexicon/cbr-lexicon";
import { CBR_TICKER_REGISTRY } from "@/components/lexicon/cbr-ticker-legend";

describe("News Service 4-5 Paragraph Synthesis & Lexicon Routing", () => {
  it("synthesizes a single-blurb wire story into a cohesive 4 to 5 paragraph article", () => {
    const story = {
      headline: "Marvel Studios Confirms Doctor Doom Latverian Coven Arc for Secret Wars",
      summary: "Kevin Feige announced at Hall H that Doctor Doom will share antagonist duties with the Latverian Witches.",
      source: "Variety",
    };

    const article = parseAndSynthesizeArticle(story);

    // 1. Verify 4-5 paragraph structure
    expect(article.paragraphs.length).toBeGreaterThanOrEqual(4);
    expect(article.paragraphs.length).toBeLessThanOrEqual(5);

    // 2. Verify paragraph contents
    const fullArticleText = article.paragraphs.join("\n\n");
    expect(fullArticleText).toContain("Kevin Feige");
    expect(fullArticleText).toContain("catalyst score");
    expect(fullArticleText).toContain("fair market value");
    expect(fullArticleText).toContain("Canonical publishing lineage");
    expect(fullArticleText).toContain("Secondary market ramifications");
    expect(fullArticleText).toContain("Downstream ripple effects");

    // 3. Verify word count & reading time
    expect(article.wordCount).toBeGreaterThanOrEqual(250);
    expect(article.readingTimeMinutes).toBeGreaterThanOrEqual(1);

    // 4. Verify entities extraction
    expect(article.entities.length).toBeGreaterThan(0);
    const terms = article.entities.map((e) => e.term.toLowerCase());
    expect(terms.some((t) => t.includes("doom") || t.includes("feige"))).toBe(true);
  });

  it("synthesizes an article with empty summary into a sensible 5-paragraph structure", () => {
    const story = {
      headline: "Spider-Man Brand New Day Theatrical Rerelease Breaks Secondary Market Records",
      summary: null,
      source: "Bleeding Cool",
    };

    const article = parseAndSynthesizeArticle(story);
    expect(article.paragraphs.length).toBeGreaterThanOrEqual(4);
    expect(article.paragraphs.length).toBeLessThanOrEqual(5);
    expect(article.wordCount).toBeGreaterThanOrEqual(200);
  });

  it("extracts and attaches lexicon details with Investopedia URLs to market concepts", () => {
    const text = "From a fair market value perspective, the narrowing bid-ask spread and acute grade compression indicate strong liquidity.";
    const article = parseAndSynthesizeArticle({
      headline: "Market Analysis",
      summary: text,
      source: "Panel Profits",
    });

    const lexiconEntities = article.entities.filter((e) => e.target === "lexicon" && e.lexiconDetails);
    expect(lexiconEntities.length).toBeGreaterThanOrEqual(1);

    for (const le of lexiconEntities) {
      expect(le.lexiconDetails).toBeDefined();
      expect(le.lexiconDetails?.category).toBeTruthy();
      expect(le.lexiconDetails?.definition).toBeTruthy();
      expect(le.lexiconDetails?.investopediaUrl).toMatch(/^https:\/\/www\.investopedia\.com/);
    }
  });

  it("resolves tickers to their authoritative detail routes", () => {
    const story = {
      headline: "Disney $DIS and Warner Bros $WBD Report Strong Q3 Performance while $CE70 Surges",
      summary: "Spider-Man $SPDR and Doctor Doom $DOOM key issues lead trading on the Obsidian Bourse.",
      source: "THR",
    };

    const article = parseAndSynthesizeArticle(story);
    const entityTickers = article.entities.filter((e) => e.ticker);
    expect(entityTickers.length).toBeGreaterThan(0);

    const disEntity = entityTickers.find((e) => e.ticker === "$DIS");
    expect(disEntity).toBeDefined();
    expect(disEntity?.wikiPath).toContain("Disney");

    const ce70Entity = entityTickers.find((e) => e.ticker === "$CE70");
    expect(ce70Entity).toBeDefined();
    expect(ce70Entity?.wikiPath).toBe("/equity/CE70");
  });

  it("verifies the CBR Ticker Legend contains comprehensive categories with valid URLs", () => {
    expect(CBR_TICKER_REGISTRY.length).toBeGreaterThanOrEqual(20);

    const categories = new Set(CBR_TICKER_REGISTRY.map((t) => t.category));
    expect(categories.has("INDEX")).toBe(true);
    expect(categories.has("CORPORATE")).toBe(true);
    expect(categories.has("CHARACTER")).toBe(true);
    expect(categories.has("KEY_ISSUE")).toBe(true);

    for (const item of CBR_TICKER_REGISTRY) {
      expect(item.ticker.startsWith("$")).toBe(true);
      expect(item.targetUrl.startsWith("/")).toBe(true);
      expect(item.name.length).toBeGreaterThan(2);
      expect(item.landmark.length).toBeGreaterThan(2);
      expect(item.description.length).toBeGreaterThan(10);
    }
  });

  it("resolves CBR terms by slug with encoding and punctuation tolerance", () => {
    // 1. Direct slug
    const direct = getCbrTermBySlug("fair-market-value");
    expect(direct).not.toBeNull();
    expect(direct?.term.toLowerCase()).toContain("fair market value");

    // 2. Encoded URI
    const encoded = getCbrTermBySlug(encodeURIComponent("fair-market-value"));
    expect(encoded).not.toBeNull();

    // 3. Spaced query
    const spaced = getCbrTermBySlug("fair market value");
    expect(spaced).not.toBeNull();

    // 4. Prefix with parenthetical
    const prefix = getCbrTermBySlug("market-capitalization");
    expect(prefix).not.toBeNull();
    expect(prefix?.term).toContain("Market Capitalization");
  });

  it("synthesizes a Cyberpunk book list with accurate genre lore, proper nouns, and zero Silver Age Marvel hallucinations", () => {
    const story = {
      headline: "5 Essential Cyberpunk Books To Read If You're New To The Genre",
      summary: "From William Gibson's Neuromancer to Philip K. Dick's Do Androids Dream of Electric Sheep and Katsuhiro Otomo's Akira, cyberpunk defined modern dystopian sci-fi.",
      source: "ScreenRant",
    };

    const article = parseAndSynthesizeArticle(story);

    // 1. Paragraph count must be 4 or 5
    expect(article.paragraphs.length).toBeGreaterThanOrEqual(4);
    expect(article.paragraphs.length).toBeLessThanOrEqual(5);

    const fullArticleText = article.paragraphs.join("\n\n");

    // 2. Must recognize Cyberpunk, Gibson, Neuromancer, Akira, or Dick
    expect(fullArticleText.toLowerCase()).toContain("cyberpunk");

    // 3. Must NEVER hallucinate Silver Age Marvel (Stan Lee, Jack Kirby, FF #1, Avengers #1)
    expect(fullArticleText).not.toContain("Stan Lee, Jack Kirby, and Steve Ditko");
    expect(fullArticleText).not.toContain("Fantastic Four #1 (1961), Amazing Fantasy #15");

    // 4. Must NOT inject false positive characters (Doctor Doom, Captain America, Professor X, Mister Fantastic)
    const entityTerms = article.entities.map((e) => e.term.toLowerCase());
    expect(entityTerms).not.toContain("doctor doom");
    expect(entityTerms).not.toContain("captain america");
    expect(entityTerms).not.toContain("professor x");
    expect(entityTerms).not.toContain("mister fantastic");

    // 5. Must NOT match "the top" as an entity
    expect(entityTerms).not.toContain("the top");

    // 6. Researched proper nouns must include William Gibson, Neuromancer, Akira, or Philip K. Dick
    expect(article.researchedProperNouns.length).toBeGreaterThanOrEqual(1);
    const properNounNames = article.researchedProperNouns.map((r) => r.properNoun.toLowerCase());
    expect(
      properNounNames.some(
        (name) =>
          name.includes("gibson") ||
          name.includes("neuromancer") ||
          name.includes("akira") ||
          name.includes("cyberpunk") ||
          name.includes("dick")
      )
    ).toBe(true);

    // 7. Researched proper nouns must carry valid Investopedia principles
    for (const rpn of article.researchedProperNouns) {
      expect(rpn.investopediaPrinciple).toBeDefined();
      expect(rpn.investopediaPrinciple.term).toBeTruthy();
      expect(rpn.investopediaPrinciple.url).toMatch(/^https:\/\/www\.investopedia\.com/);
      expect(rpn.investopediaPrinciple.definition).toBeTruthy();
      expect(rpn.investopediaPrinciple.translation).toBeTruthy();
    }

    // 8. Superhero ramifications must be genre-appropriate ($CYBER or $MANGA or $INDIE), NOT Marvel Sovereign Blue-Chip Index
    for (const ram of article.superheroRamifications) {
      expect(ram.characterName).not.toContain("Marvel Sovereign Blue-Chip Index");
    }

    // 9. Butterfly ripples must NOT include "the top Canonical Key Basket"
    for (const rip of article.butterflyRipples) {
      expect(rip.assetName.toLowerCase()).not.toContain("the top");
      expect(rip.ticker).not.toBe("$TOP");
    }
  });
});
