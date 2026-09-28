import { describe, it, expect } from "vitest";
import { findNewsEntities } from "@/lib/news/entities";

describe("CBR Market Thesaurus & Entity Resolver", () => {
  it("extracts financial and market thesaurus terms without false-positive character matches", () => {
    const text =
      "From an equity valuation perspective, cinematic and media adaptation developments accelerate secondary market velocity for key appearances and early printings. When studio confirmation broadens collector awareness, high-grade certified census slabs and uncertified raw inventory frequently see narrowing bid-ask spreads across auction channels.";

    const matched = findNewsEntities(text, null);
    const matchedTerms = matched.map((m) => m.term.toLowerCase());

    // 1. Verify "collector" is NOT falsely matched to Marvel's Taneleer Tivan / The Collector
    expect(matchedTerms).not.toContain("collector");
    const falseCharacterMatch = matched.find(
      (m) => m.wikiPath.includes("taneleer") || m.term.toLowerCase() === "collector"
    );
    expect(falseCharacterMatch).toBeUndefined();

    // 2. Verify key CBR Market Thesaurus and comic equity terms are recognized
    expect(matchedTerms).toContain("equity valuation");
    expect(matchedTerms).toContain("secondary market velocity");
    expect(matchedTerms).toContain("key appearances");
    expect(matchedTerms).toContain("early printings");
    expect(matchedTerms).toContain("high-grade");
    expect(matchedTerms).toContain("certified census slabs");
    expect(matchedTerms).toContain("uncertified raw inventory");
    expect(matchedTerms).toContain("bid-ask spreads");
    expect(matchedTerms).toContain("auction channels");
  });
});
