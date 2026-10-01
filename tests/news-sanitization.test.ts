import { describe, it, expect } from "vitest";
import { decodeHtmlEntities, sanitizeNewsText, sanitizeHeadline, sanitizeSummary } from "@/lib/news/sanitize";
import { parseAndSynthesizeArticle } from "@/lib/news/article-parser";

describe("News Headline & Text Sanitization", () => {
  it("decodes named HTML entities including &apos; &quot; &amp; &lt; &gt; &mdash; &ndash;", () => {
    const raw = "WizKids Reveals New &apos;Marvel HeroClix: Secret Wars Map and Terrain Kit&apos;";
    const cleaned = sanitizeHeadline(raw);
    expect(cleaned).toBe("WizKids Reveals New 'Marvel HeroClix: Secret Wars Map and Terrain Kit'");
    expect(cleaned).not.toContain("&apos;");
  });

  it("decodes double-encoded entities like &amp;apos; and &amp;#038;", () => {
    const raw = "Headline with &amp;apos;nested quotes&amp;apos; &amp;amp; double ampersands";
    const cleaned = sanitizeHeadline(raw);
    expect(cleaned).toBe("Headline with 'nested quotes' & double ampersands");
  });

  it("decodes decimal and hex numeric entities", () => {
    const raw = "Batman And The Outsiders &#038; Bruno Redondo &#124; Issue &#x23;1";
    const cleaned = sanitizeHeadline(raw);
    expect(cleaned).toBe("Batman And The Outsiders & Bruno Redondo | Issue #1");
  });

  it("strips HTML tags and preserves clean punctuation spacing", () => {
    const raw = '<p class="wp-block-paragraph">Tony Fleecs and Tim Seeley are back together again for another new series following 2023’s excellent <em>Local Man</em>.</p>';
    const cleaned = sanitizeSummary(raw);
    expect(cleaned).toBe("Tony Fleecs and Tim Seeley are back together again for another new series following 2023’s excellent Local Man.");
    expect(cleaned).not.toContain("<p");
    expect(cleaned).not.toContain("<em>");
    expect(cleaned).not.toContain("</em>");
  });

  it("synthesizes an article with sanitized headline and extracts key entities cleanly", () => {
    const story = {
      headline: "WizKids Reveals New &apos;Marvel HeroClix: Secret Wars Map and Terrain Kit&apos;",
      summary: "WizKids is releasing a brand-new Marvel HeroClix terrain set focusing on Secret Wars battlegrounds and iconic multiverse skirmishes.",
      source: "ICV2",
      id: "wizkids-secret-wars-test",
    };

    const synthesized = parseAndSynthesizeArticle(story);
    expect(synthesized.headline).toBe("WizKids Reveals New 'Marvel HeroClix: Secret Wars Map and Terrain Kit'");
    expect(synthesized.headline).not.toContain("&apos;");

    // Entities must extract Marvel and Secret Wars without being thrown off by &apos;
    const entityTerms = synthesized.entities.map((e) => e.term.toLowerCase());
    expect(entityTerms.some((t) => t.includes("marvel") || t.includes("secret wars"))).toBe(true);
  });
});
