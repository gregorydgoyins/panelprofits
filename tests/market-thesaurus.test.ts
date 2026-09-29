import { describe, it, expect } from "vitest";
import { findNewsEntities } from "@/lib/news/entities";

describe("CBR Market Thesaurus & Entity Resolver", () => {
  it("extracts financial and market thesaurus terms without false-positive character matches", async () => {
    const text =
      "From a fair market value perspective, cinematic and media adaptation developments accelerate market capitalization for collector demand. When studio confirmation broadens collector awareness, disciplined cost basis accounting and a narrowing bid-ask spread reflect renewed secondary demand.";

    const matched = findNewsEntities(text, null);
    const matchedTerms = matched.map((m) => m.term.toLowerCase());

    // 1. Verify "collector" is NOT falsely matched to Marvel's Taneleer Tivan / The Collector
    expect(matchedTerms).not.toContain("collector");
    const falseCharacterMatch = matched.find(
      (m) => m.wikiPath.includes("taneleer") || m.term.toLowerCase() === "collector"
    );
    expect(falseCharacterMatch).toBeUndefined();

    // 2. Verify market-concept terms are resolved against the real 4,653-term CBR market
    // lexicon (lib/lexicon/cbr_market_lexicon.json via lib/lexicon/cbr-lexicon.ts), not a
    // hardcoded stand-in list.
    expect(matchedTerms).toContain("fair market value");
    expect(matchedTerms).toContain("market capitalization");
    expect(matchedTerms).toContain("cost basis");
    expect(matchedTerms).toContain("bid-ask spread");

    // 3. Every matched market-concept term resolves to a real lexicon slug (the same
    // dictionary the /lexicon/[slug] page renders from), not a fabricated/placeholder path.
    const { getCbrTermBySlug } = await import("@/lib/lexicon/cbr-lexicon");
    const marketConceptMatches = matched.filter((m) => m.type === "market-concept");
    expect(marketConceptMatches.length).toBeGreaterThanOrEqual(4);
    for (const m of marketConceptMatches) {
      expect(m.wikiPath.startsWith("/lexicon/")).toBe(true);
      const slug = m.wikiPath.replace("/lexicon/", "");
      expect(getCbrTermBySlug(slug)).not.toBeNull();
    }
  });
});
