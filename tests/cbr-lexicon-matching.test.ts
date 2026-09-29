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

describe("CBR lexicon text matcher (market-impact / adaptation-ripple / collecting vocabulary batch)", () => {
  it("resolves all 34 newly added lexicon entries by slug", () => {
    const slugs = [
      "volatility", "market-sentiment", "momentum", "price-discovery", "correlation",
      "systemic-risk", "market-overreaction", "mean-reversion", "network-effect",
      "valuation-multiple", "beta-volatility-measure", "downside-protection", "risk-reward-ratio",
      "event-driven-strategy", "speculative-premium",
      "halo-effect", "spillover-effect", "sympathy-rally-sympathy-move", "adaptation-premium",
      "casting-announcement-catalyst", "trailer-drop-catalyst", "streaming-premiere-catalyst",
      "catalyst-decay-hype-half-life", "media-attention-cycle",
      "newsstand-edition", "comic-restoration-restored-grade", "comic-pressing", "qualified-grade",
      "crossover-event", "one-shot", "limited-series-vs-ongoing-series",
      "enhanced-cover-variant-foil-chromium-lenticular", "sketch-variant", "retailer-incentive-program",
    ];
    for (const slug of slugs) {
      expect(getCbrTermBySlug(slug)).not.toBeNull();
    }
  });

  it("matches the hyphenated single-token term 'One-Shot' inside real generated prose, same mechanism as 'High-Grade'", () => {
    const text = "Retailers reported strong demand for the one-shot ahead of next month's crossover event.";
    const matches = findCbrTermsInText(text);
    const slugs = matches.map((m) => m.entry.slug);
    expect(slugs).toContain("one-shot");
    expect(slugs).toContain("crossover-event");
  });

  it("matches the space-written variant of the hyphenated 'One-Shot' term", () => {
    const text = "This one shot introduced a character who later became a breakout media property.";
    const matches = findCbrTermsInText(text);
    const slugs = matches.map((m) => m.entry.slug);
    expect(slugs).toContain("one-shot");
  });

  it("matches multi-word market-impact and ripple-effect vocabulary in realistic analytical prose", () => {
    const text =
      "The casting-announcement catalyst triggered a sharp uptick in market sentiment, though analysts warned of a possible market overreaction once the initial hype fades, given a well-documented spillover effect into related keys and a sympathy rally in adjacent Silver Age issues.";
    const matches = findCbrTermsInText(text);
    const slugs = matches.map((m) => m.entry.slug);
    expect(slugs).toContain("casting-announcement-catalyst");
    expect(slugs).toContain("market-sentiment");
    expect(slugs).toContain("market-overreaction");
    expect(slugs).toContain("spillover-effect");
    expect(slugs).toContain("sympathy-rally-sympathy-move");
  });

  it("deliberately excludes bare single-word terms like 'Momentum', 'Pressing', and 'Volatility' from free-text matching (same false-positive guard as 'Metrics'/'Joint'), while all remain resolvable by slug", () => {
    const text = "Bid momentum built steadily amid elevated volatility as the story built to a pressing conclusion for collectors.";
    const matches = findCbrTermsInText(text);
    const slugs = matches.map((m) => m.entry.slug);
    expect(slugs).not.toContain("momentum");
    expect(slugs).not.toContain("comic-pressing");
    expect(slugs).not.toContain("volatility");
    expect(getCbrTermBySlug("momentum")).not.toBeNull();
    expect(getCbrTermBySlug("comic-pressing")).not.toBeNull();
    expect(getCbrTermBySlug("volatility")).not.toBeNull();
  });

  it("matches comic-specific collecting vocabulary in realistic prose", () => {
    const text =
      "The dealer distinguished the newsstand edition from the direct edition, noted the copy carried no comic restoration, and pointed out a separate qualified grade copy affected by a missing coupon, alongside a sketch variant and a chromium enhanced cover variant from the same retailer incentive program.";
    const matches = findCbrTermsInText(text);
    const slugs = matches.map((m) => m.entry.slug);
    expect(slugs).toContain("newsstand-edition");
    expect(slugs).toContain("comic-restoration-restored-grade");
    expect(slugs).toContain("qualified-grade");
    expect(slugs).toContain("sketch-variant");
    expect(slugs).toContain("retailer-incentive-program");
  });
});
