import { describe, it, expect } from "vitest";
import { createTwoSentenceAudioBrief } from "@/lib/news/audio-brief";

describe("createTwoSentenceAudioBrief", () => {
  it("synthesizes exactly a two-sentence executive brief from a headline and short summary", () => {
    const brief = createTwoSentenceAudioBrief({
      headline: "WizKids Reveals New 'Marvel HeroClix: Secret Wars Map and Terrain Kit'",
      summary: "Comes with Two Limited Edition Miniatures",
      source: "ICV2",
    });

    expect(brief).toBe(
      "WizKids Reveals New 'Marvel HeroClix: Secret Wars Map and Terrain Kit'. The upcoming release comes with Two Limited Edition Miniatures."
    );
    // Count sentences
    const sentences = brief.split(/(?<=[.!?])\s+/);
    expect(sentences.length).toBe(2);
  });

  it("strips YouTube promotional fluff (Patreon, URLs, PO Boxes, emails) and converts first-person to broadcast style", () => {
    const brief = createTwoSentenceAudioBrief({
      headline: "Breaking News: NEW Omnibus from Titan Comics & Heroic Signatures in February 2027!",
      summary:
        "Today I get to announce a new Omnibus from Heroic Signatures and Titan Comics ! I show the details of the book and show the covers. Patreon tiers - We offer multiple tiers starting at $1 to give you access to notes, voting, Discord, AMA, recognition, and private consultations! See which tier best fits your needs. https://www.patreon.com/nearmintcondition NMC merch can be purchased here: https://shop.spreadshirt.com/near-mint-condition Check out our sponsor: https://www.cheapgraphicnovels.com You can send fan mail or giveaway donations to: Near Mint Condition PO Box 5204 Frankfort, KY 40602 nearmintcon@gmail.com #reh #robertehoward #titancomics",
      source: "NEAR MINT CONDITION",
    });

    expect(brief).not.toContain("Patreon");
    expect(brief).not.toContain("https://");
    expect(brief).not.toContain("PO Box");
    expect(brief).not.toContain("nearmintcon@gmail.com");
    expect(brief).not.toContain("Breaking News:");

    const sentences = brief.split(/(?<=[.!?])\s+/);
    expect(sentences.length).toBe(2);
    expect(brief).toContain("The announcement details a new Omnibus from Heroic Signatures and Titan Comics");
  });

  it("falls back to catalyst reasoning or market sentence when summary is empty or identical to headline", () => {
    const brief = createTwoSentenceAudioBrief({
      headline: "5 new comics to read in October, including Marvel's new horror line",
      summary: "5 new comics to read in October, including Marvel's new horror line",
      catalystReasoning: "Marvel expands its horror lineup ahead of the fall publishing season, driving seasonal interest.",
    });

    const sentences = brief.split(/(?<=[.!?])\s+/);
    expect(sentences.length).toBe(2);
    expect(brief).toContain("Marvel expands its horror lineup ahead of the fall publishing season");
  });

  it("handles empty summary gracefully", () => {
    const brief = createTwoSentenceAudioBrief({
      headline: "Dark Horse Announces New Predator Series",
      summary: null,
    });

    const sentences = brief.split(/(?<=[.!?])\s+/);
    expect(sentences.length).toBe(2);
    expect(brief).toContain("Dark Horse Announces New Predator Series.");
    expect(brief).toContain("The development is expected to stimulate secondary market interest and trading activity across related titles.");
  });
});
