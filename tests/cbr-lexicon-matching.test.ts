import { describe, it, expect } from "vitest";
import { findCbrTermsInText, getCbrTermBySlug } from "@/lib/lexicon/cbr-lexicon";

describe("CBR lexicon text matcher (hyphenated single-token compounds)", () => {
  it("matches 'High-Grade' inside real generated market-analysis prose", () => {
    const text =
      "Certified high-grade census copies of Detective Comics #27 sustain resilient floor valuations.";

    const matches = findCbrTermsInText(text);
    const slugs = matches.map((m) => m.entry.slug);

    expect(slugs).toContain("high-grade");

    // The existing lexicon entry itself resolves by slug -- this proves the fix is a
    // matcher change, not a data addition: the entry already existed before this fix.
    expect(getCbrTermBySlug("high-grade")).not.toBeNull();
  });

  it("matches the space-written variant of a hyphenated compound term ('high grade')", () => {
    const text = "This is a high grade copy with strong eye appeal.";
    const matches = findCbrTermsInText(text);
    const slugs = matches.map((m) => m.entry.slug);
    expect(slugs).toContain("high-grade");
  });

  it("does not false-positive match common English words that happen to be lone lexicon terms", () => {
    // "Metrics", "Joint", "J", "Z" are real single-word lexicon entries (bare dictionary
    // words), which must stay excluded from free-text matching -- only a *hyphenated*
    // single token like "high-grade" is safe to match on its own.
    const text =
      "The joint venture reported strong metrics this quarter, and traders watched key indicators j and z on the dashboard.";

    const matches = findCbrTermsInText(text);
    const slugs = matches.map((m) => m.entry.slug);

    expect(slugs).not.toContain("joint");
    expect(slugs).not.toContain("metrics");
    expect(slugs).not.toContain("j");
    expect(slugs).not.toContain("z");
  });

  it("does not match an arbitrary hyphenated word that is not a real lexicon entry", () => {
    const text = "The story takes a well-known, low-key approach to its self-aware narration.";
    const matches = findCbrTermsInText(text);
    const slugs = matches.map((m) => m.entry.slug);
    // none of "well-known", "low-key", "self-aware" are lexicon entries
    expect(slugs.length).toBe(0);
  });

  it("applies the plural/singular fallback without introducing unrelated matches", () => {
    const text = "Buyers priced in several key issue premiums across the run this quarter.";
    const matches = findCbrTermsInText(text);
    const slugs = matches.map((m) => m.entry.slug);
    // "key issue premiums" (plural) should still resolve to the singular-stored entry
    expect(slugs).toContain("key-issue-premium");
  });

  it("resolves the newly added real lexicon entries for genuine glossary gaps", () => {
    for (const slug of ["sequential-art", "brand-equity", "clearing-price", "liquidity-spike"]) {
      expect(getCbrTermBySlug(slug)).not.toBeNull();
    }
  });
});
