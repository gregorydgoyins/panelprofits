import { describe, expect, it } from "vitest";
import { analyzeStoryCatalyst } from "@/lib/news/catalyst";

describe("newsroom market catalyst engine", () => {
  it("detects casting attachment catalyst with sovereign comic key linkages for Sadie Sink", () => {
    const analysis = analyzeStoryCatalyst(
      "Sadie Sink Reportedly Cast in Marvel's Thunderbolts",
      "Marvel Studios is eyeing Sadie Sink for a pivotal role rumored to be Songbird in the upcoming Thunderbolts film."
    );

    expect(analysis.catalystType).toBe("CASTING_ATTACHMENT");
    expect(analysis.marketImpact).toBe("BULLISH");
    expect(analysis.impactScore).toBeGreaterThanOrEqual(0.8);
    expect(analysis.affectedComics.length).toBeGreaterThan(0);
    const hulk449 = analysis.affectedComics.find((c) => c.series.includes("Incredible Hulk") && c.issueNumber === "449");
    expect(hulk449).toBeDefined();
    expect(hulk449?.ticker).toBe("$THUN");
    expect(hulk449?.fmvCgc98).toBeGreaterThan(0);
  });

  it("detects casting attachment catalyst with sovereign comic key linkages for Jon Bernthal", () => {
    const analysis = analyzeStoryCatalyst(
      "Jon Bernthal Returns as Frank Castle Punisher in Daredevil Born Again",
      "Jon Bernthal is officially reprising his role as the Punisher for the Disney+ series."
    );

    expect(analysis.catalystType).toBe("CASTING_ATTACHMENT");
    expect(analysis.marketImpact).toBe("BULLISH");
    const asm129 = analysis.affectedComics.find((c) => c.series.includes("Spider-Man") && c.issueNumber === "129");
    expect(asm129).toBeDefined();
    expect(asm129?.ticker).toBe("$PNSH");
  });

  it("detects casting attachment catalyst for Zendaya and links Amazing Spider-Man #42", () => {
    const analysis = analyzeStoryCatalyst(
      "Zendaya Signs On for Next Spider-Man Chapter",
      "Zendaya will reprise her role alongside Tom Holland in the next Marvel Cinematic Universe installment."
    );

    expect(analysis.catalystType).toBe("CASTING_ATTACHMENT");
    const asm42 = analysis.affectedComics.find((c) => c.series.includes("Spider-Man") && c.issueNumber === "42");
    expect(asm42).toBeDefined();
    expect(asm42?.ticker).toBe("$SPDR");
  });

  it("detects Rosario Dawson and links Star Wars Clone Wars #1 for Ahsoka", () => {
    const analysis = analyzeStoryCatalyst(
      "Rosario Dawson Begins Production on Ahsoka Season 2",
      "Lucasfilm and Rosario Dawson have commenced filming for the second season of Ahsoka."
    );

    expect(analysis.catalystType).toBe("CASTING_ATTACHMENT");
    const ahsokaComic = analysis.affectedComics.find((c) => c.title.includes("Clone Wars"));
    expect(ahsokaComic).toBeDefined();
    expect(ahsokaComic?.ticker).toBe("$AHSOKA");
  });

  it("identifies high-impact auction record breakthroughs", () => {
    const analysis = analyzeStoryCatalyst(
      "Amazing Fantasy #15 Sells for Record $3.6M at Heritage Auctions",
      "A CGC 9.6 copy of Amazing Fantasy #15 broke all previous benchmarks in a historic bidding duel."
    );

    expect(analysis.catalystType).toBe("AUCTION_RECORD");
    expect(analysis.marketImpact).toBe("BULLISH");
    expect(analysis.impactScore).toBeGreaterThanOrEqual(0.9);
  });

  it("identifies media rights options and film acquisition catalysts", () => {
    const analysis = analyzeStoryCatalyst(
      "Netflix Secures Rights to Indie Sci-Fi Graphic Novel",
      "Streaming platform acquires film rights for upcoming live action adaptation."
    );

    expect(analysis.catalystType).toBe("OPTION_RIGHTS");
    expect(analysis.marketImpact).toBe("BULLISH");
  });

  it("detects publisher print sellouts and second print allocations", () => {
    const analysis = analyzeStoryCatalyst(
      "Issue #1 Sells Out at Distributor Level, Rushes to Second Printing",
      "Diamond and Lunar report initial print run completely exhausted on release day."
    );

    expect(analysis.catalystType).toBe("PRINT_SELLOUT");
    expect(analysis.marketImpact).toBe("BULLISH");
  });

  it("detects creator moves and creative roster changes with market volatility rating", () => {
    const analysis = analyzeStoryCatalyst(
      "Star Writer Signs Exclusive Deal with DC Comics",
      "Major creator moves exclusively to DC for upcoming flagship Batman relaunch."
    );

    expect(analysis.catalystType).toBe("CREATOR_MOVE");
    expect(analysis.marketImpact).toBe("VOLATILITY");
  });

  it("identifies canonical first appearance speculative announcements", () => {
    const analysis = analyzeStoryCatalyst(
      "New Hero Debuts in Marvel Solicitations with Major Origin Revealed",
      "Marvel teases first appearance of an all-new symbiote character this winter."
    );

    expect(analysis.catalystType).toBe("FIRST_APPEARANCE_SPEC");
    expect(analysis.marketImpact).toBe("BULLISH");
  });
});
