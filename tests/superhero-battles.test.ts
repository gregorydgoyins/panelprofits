import { describe, it, expect } from "vitest";
import {
  getAllSuperheroContenders,
  simulateSuperheroBattle,
  CANONICAL_DREAM_MATCHUPS,
} from "@/lib/battle/battle-engine";

describe("Superhero Multiverse Battle Engine & Lore Nexus", () => {
  it("loads 500+ authentic superheroes with complete canonical powerstats", () => {
    const contenders = getAllSuperheroContenders();
    expect(contenders.length).toBeGreaterThanOrEqual(500);

    // Verify key heroes exist
    const names = contenders.map((c) => c.name);
    expect(names).toContain("Batman");
    expect(names).toContain("Spider-Man");
    expect(names).toContain("Superman");
    expect(names).toContain("Thor");
    expect(names).toContain("Wolverine");
    expect(names).toContain("Deathstroke");
    expect(names).toContain("Doctor Doom");
    expect(names).toContain("Lex Luthor");
    expect(names).toContain("Thanos");
    expect(names).toContain("Darkseid");
  });

  it("assigns canonical power tiers and non-zero powerstats", () => {
    const contenders = getAllSuperheroContenders();
    const batman = contenders.find((c) => c.name === "Batman");
    expect(batman).toBeDefined();
    if (batman) {
      expect(batman.powerstats.intelligence).toBeGreaterThanOrEqual(80);
      expect(batman.powerstats.combat).toBeGreaterThanOrEqual(90);
      expect(batman.powerTier).toBeDefined();
      expect(batman.firstAppearance).toContain("Detective Comics");
      expect(batman.firstAppearanceValue98Usd).toBeGreaterThan(1000000);
    }

    const spiderMan = contenders.find((c) => c.name === "Spider-Man");
    expect(spiderMan).toBeDefined();
    if (spiderMan) {
      expect(spiderMan.powerstats.speed).toBeGreaterThanOrEqual(60);
      expect(spiderMan.powerstats.combat).toBeGreaterThanOrEqual(80);
      expect(spiderMan.firstAppearance).toContain("Amazing Fantasy");
      expect(spiderMan.firstAppearanceValue98Usd).toBeGreaterThan(1000000);
    }
  });

  it("simulates Batman vs. Spider-Man battle with multi-round combat and financial parity", () => {
    const contenders = getAllSuperheroContenders();
    const batman = contenders.find((c) => c.name === "Batman")!;
    const spiderMan = contenders.find((c) => c.name === "Spider-Man")!;

    const result = simulateSuperheroBattle(batman, spiderMan);
    expect(result).toBeDefined();
    expect(result.winProbabilityA + result.winProbabilityB).toBe(100);
    expect(result.rounds.length).toBe(3);
    expect(result.winner).toBeDefined();
    expect(result.loser).toBeDefined();
    expect(result.tacticalAnalysis).toBeTruthy();
    expect(result.financialAdvantage.higherValueHero).toBe("Batman");
    expect(result.historicCanonCrossed).toBe(true);
    expect(result.crossoverContext).toContain("1995");
  });

  it("simulates Superman vs. Thor god-tier collision", () => {
    const contenders = getAllSuperheroContenders();
    const superman = contenders.find((c) => c.name === "Superman")!;
    const thor = contenders.find((c) => c.name === "Thor")!;

    const result = simulateSuperheroBattle(superman, thor);
    expect(result.rounds.length).toBe(3);
    expect(result.crossoverContext).toContain("JLA/Avengers");
    expect(result.winProbabilityA).toBeGreaterThanOrEqual(40);
    expect(result.winProbabilityB).toBeGreaterThanOrEqual(40);
  });

  it("registers 10 canonical dream matchups that have never had a definitive finish", () => {
    expect(CANONICAL_DREAM_MATCHUPS.length).toBeGreaterThanOrEqual(10);
    const titles = CANONICAL_DREAM_MATCHUPS.map((m) => m.title);
    expect(titles).toContain("Batman vs. Spider-Man");
    expect(titles).toContain("Superman vs. Thor");
    expect(titles).toContain("Wolverine vs. Deathstroke");
    expect(titles).toContain("Doctor Doom vs. Lex Luthor");
    expect(titles).toContain("Thanos vs. Darkseid");
    expect(titles).toContain("Hulk vs. Doomsday");
  });
});
