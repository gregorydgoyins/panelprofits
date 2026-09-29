import { describe, expect, it } from "vitest";
import {
  getRelatedDossiersForText,
  groupDossiersByUniverse,
  mapLexiconMatches,
  type RelatedDossierEntity,
} from "@/lib/news/related-dossiers";
import { findCbrTermsInText } from "@/lib/lexicon/cbr-lexicon";

function makeEntity(overrides: Partial<RelatedDossierEntity>): RelatedDossierEntity {
  return {
    slug: overrides.title?.toLowerCase().replace(/\s+/g, "-") || "slug",
    title: "Title",
    universe: "MARVEL",
    type: "character",
    summary: "",
    wikiPath: "/wiki/entry/slug",
    ...overrides,
  };
}

describe("news rail v2 related-dossiers grouping and mapping", () => {
  it("groups entities by universe, largest group first, ties broken alphabetically", () => {
    const entities = [
      makeEntity({ title: "Batmobile", universe: "DC" }),
      makeEntity({ title: "Iron Man", universe: "MARVEL" }),
      makeEntity({ title: "Gotham City", universe: "DC" }),
      makeEntity({ title: "Millennium Falcon", universe: "STAR_WARS" }),
    ];

    const groups = groupDossiersByUniverse(entities);

    expect(groups[0].universe).toBe("DC");
    expect(groups[0].entities).toHaveLength(2);
    // MARVEL and STAR_WARS both have a single entity; alphabetical tiebreak.
    expect(groups[1].universe).toBe("MARVEL");
    expect(groups[2].universe).toBe("STAR_WARS");
  });

  it("returns no groups for an empty entity list", () => {
    expect(groupDossiersByUniverse([])).toEqual([]);
  });

  it("maps real CBR lexicon matches to rail-ready terms with real slugs and definitions", () => {
    const matches = findCbrTermsInText("The Fair Market Value of the CGC graded key issue climbed.", 10);
    const mapped = mapLexiconMatches(matches);

    expect(mapped.length).toBeGreaterThan(0);
    for (const term of mapped) {
      expect(term.slug).toBeTruthy();
      expect(term.wikiPath).toBe(`/lexicon/${term.slug}`);
      expect(term.definition.length).toBeGreaterThan(0);
    }
  });

  it("resolves an empty result for empty or whitespace-only text without querying anything", async () => {
    expect(await getRelatedDossiersForText("")).toEqual({
      universeGroups: [],
      lexiconTerms: [],
      totalEntityCount: 0,
    });
    expect(await getRelatedDossiersForText("   ")).toEqual({
      universeGroups: [],
      lexiconTerms: [],
      totalEntityCount: 0,
    });
  });

  it("surfaces real grouped dossiers and lexicon terms for article text mentioning known entities", async () => {
    const result = await getRelatedDossiersForText(
      "Batman and the Joker clash again in Gotham City as the Fair Market Value of key issues climbs.",
      12
    );

    expect(result.totalEntityCount).toBeGreaterThan(0);
    expect(result.universeGroups.length).toBeGreaterThan(0);

    const dcGroup = result.universeGroups.find((g) => g.universe === "DC");
    expect(dcGroup).toBeDefined();
    const titles = dcGroup!.entities.map((e) => e.title);
    expect(titles.some((t) => t.toLowerCase().includes("gotham"))).toBe(true);

    // Every dossier links to a real per-entity wiki path derived from its slug, not a
    // placeholder or search-query fallback.
    for (const group of result.universeGroups) {
      for (const entity of group.entities) {
        expect(entity.wikiPath).toBe(`/wiki/entry/${entity.slug}`);
      }
    }

    expect(result.lexiconTerms.some((t) => t.term.toLowerCase().includes("fair market value"))).toBe(true);
  });
});
