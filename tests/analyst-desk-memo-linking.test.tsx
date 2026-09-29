import * as React from "react";
import { describe, expect, it } from "vitest";
import { extractEntitiesFromContext } from "@/lib/news/entities";
import { parseTextWithEntities } from "@/components/news/linked-briefing";

/**
 * Regression coverage for the "unlinked jargon" bug (real generated financial/market
 * prose rendered as plain text instead of live lexicon/entity links) in the places wired
 * up during this pass: AnalystDeskMemo's 3-Point Memo, StoryPanel's ramification/ripple/
 * lore cards, and the wiki dossier summary. All of those now feed their generated text
 * through the same two functions this test exercises directly (extractEntitiesFromContext
 * + parseTextWithEntities, via the <LinkedBriefing> component) -- so a regression here
 * would silently un-link every one of those rendering paths again.
 */
describe("market/lexicon jargon linking (AnalystDeskMemo / StoryPanel / wiki dossier)", () => {
  it("recognizes real market/grading lexicon terms inside analyst-memo-style generated prose", () => {
    const memoLikeText =
      "Expect immediate bidding volume escalation on third-party graded (CGC/CBCS 9.8) registry sets. " +
      "Raw uncertified copies will experience widening bid-ask spreads across online marketplaces.";

    const entities = extractEntitiesFromContext(memoLikeText);
    const lexiconMatches = entities.filter((e) => e.type === "market-concept" || e.type === "grading" || e.type === "lexicon");

    expect(lexiconMatches.length).toBeGreaterThan(0);
    // Every lexicon/market-concept match must resolve to a real glossary page, not a dead link.
    for (const match of lexiconMatches) {
      expect(match.wikiPath).toMatch(/^\/lexicon\//);
    }
  });

  it("converts matched jargon into real link nodes rather than leaving it as dead plain text", () => {
    const text = "Raw uncertified copies will experience widening bid-ask spreads across online marketplaces.";
    const entities = extractEntitiesFromContext(text);
    expect(entities.length).toBeGreaterThan(0);

    const nodes = parseTextWithEntities(text, entities);

    // Before the fix, this text was rendered as a bare string with no entities passed in at
    // all -- parseTextWithEntities(text) with no entities always returns [text] (one plain
    // string node). Proving at least one non-string React node comes back demonstrates the
    // text was actually tokenized into clickable entities, not just passed through.
    const hasElementNode = nodes.some((n) => typeof n !== "string");
    expect(hasElementNode).toBe(true);
  });

  it("falls back to the original plain text untouched when no entities are supplied (baseline sanity check)", () => {
    const text = "Raw uncertified copies will experience widening bid-ask spreads across online marketplaces.";
    const nodes = parseTextWithEntities(text, []);
    expect(nodes).toEqual([text]);
  });

  it("recognizes lexicon/market terms inside wiki-dossier-style encyclopedic summary prose", () => {
    // Mirrors the shape of a LoreEntitySummary.summary field rendered on
    // app/wiki/entry/[slug]/page.tsx, which previously rendered with zero entity matching
    // of any kind (not even character cross-links) before this pass.
    const dossierSummary =
      "Following a sustained accumulation phase, the character's key debut issue saw a sharp " +
      "capitulation in raw copy pricing before certified CGC 9.8 census copies stabilized.";

    const entities = extractEntitiesFromContext(dossierSummary);
    const slugs = entities.map((e) => e.wikiPath);

    expect(entities.length).toBeGreaterThan(0);
    expect(slugs.some((p) => p.startsWith("/lexicon/"))).toBe(true);
  });
});
