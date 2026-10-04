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

  it("registers canonical dream matchups across all categories", () => {
    expect(CANONICAL_DREAM_MATCHUPS.length).toBeGreaterThanOrEqual(15);
    const titles = CANONICAL_DREAM_MATCHUPS.map((m) => m.title);
    expect(titles).toContain("Batman vs. Spider-Man");
    expect(titles).toContain("Superman vs. Thor");
    expect(titles).toContain("Spawn vs. She-Hulk");
    expect(titles).toContain("Batman's Utility Belt vs. Spider-Man's Web-Shooters");
    expect(titles).toContain("The Batmobile vs. The Fantasticar");
    expect(titles).toContain("The Avengers vs. Justice League of America");
    expect(titles).toContain("Stan Lee & Jack Kirby vs. Bob Kane & Bill Finger");
  });

  it("simulates Spawn vs. She-Hulk cross-publisher showdown", () => {
    const contenders = getAllSuperheroContenders();
    const spawn = contenders.find((c) => c.name === "Spawn");
    const sheHulk = contenders.find((c) => c.name === "She-Hulk");

    expect(spawn).toBeDefined();
    expect(sheHulk).toBeDefined();

    if (spawn && sheHulk) {
      const result = simulateSuperheroBattle(spawn, sheHulk);
      expect(result.rounds.length).toBe(3);
      expect(result.winProbabilityA + result.winProbabilityB).toBe(100);
      expect(result.winner).toBeDefined();
    }
  });

  it("simulates Weapons clash: Batman's Utility Belt vs. Spider-Man's Web-Shooters", () => {
    const contenders = getAllSuperheroContenders();
    const belt = contenders.find((c) => c.name === "Batman's Utility Belt");
    const shooters = contenders.find((c) => c.name === "Spider-Man's Web-Shooters");

    expect(belt).toBeDefined();
    expect(shooters).toBeDefined();
    expect(belt?.category).toBe("weapons");
    expect(shooters?.category).toBe("weapons");

    if (belt && shooters) {
      const result = simulateSuperheroBattle(belt, shooters);
      expect(result.rounds.length).toBe(3);
      expect(result.rounds[0].title).toContain("Mechanical Deployment");
    }
  });

  it("simulates Vehicles clash: The Batmobile vs. The Fantasticar", () => {
    const contenders = getAllSuperheroContenders();
    const batmobile = contenders.find((c) => c.name === "The Batmobile (Tumbler / 1989)");
    const fantasticar = contenders.find((c) => c.name === "The Fantasticar (Mark II)");

    expect(batmobile).toBeDefined();
    expect(fantasticar).toBeDefined();
    expect(batmobile?.category).toBe("vehicles");

    if (batmobile && fantasticar) {
      const result = simulateSuperheroBattle(batmobile, fantasticar);
      expect(result.rounds.length).toBe(3);
      expect(result.rounds[0].title).toContain("Acceleration");
    }
  });

  it("simulates Creators clash: Stan Lee & Jack Kirby vs. Bob Kane & Bill Finger", () => {
    const contenders = getAllSuperheroContenders();
    const stanKirby = contenders.find((c) => c.name === "Stan Lee & Jack Kirby");
    const kaneFinger = contenders.find((c) => c.name === "Bob Kane & Bill Finger");

    expect(stanKirby).toBeDefined();
    expect(kaneFinger).toBeDefined();
    expect(stanKirby?.category).toBe("creators");

    if (stanKirby && kaneFinger) {
      const result = simulateSuperheroBattle(stanKirby, kaneFinger);
      expect(result.rounds.length).toBe(3);
      expect(result.rounds[0].title).toContain("Archetype Innovation");
      expect(result.financialAdvantage.valueDifference98).toBeGreaterThan(0);
    }
  });

  it("simulates Sidekicks clash: Robin vs. Krypto the Superdog", () => {
    const contenders = getAllSuperheroContenders();
    const robin = contenders.find((c) => c.name === "Robin");
    const krypto = contenders.find((c) => c.name === "Krypto");

    expect(robin).toBeDefined();
    expect(krypto).toBeDefined();
    expect(robin?.category).toBe("sidekicks");
    expect(krypto?.category).toBe("sidekicks");

    if (robin && krypto) {
      const result = simulateSuperheroBattle(robin, krypto);
      expect(result.rounds.length).toBe(3);
      expect(result.winner).toBeDefined();
    }
  });

  it("validates all canonical dream matchups have matching valid contenders", () => {
    const contenders = getAllSuperheroContenders();
    const names = new Set(contenders.map((c) => c.name.toLowerCase()));

    for (const match of CANONICAL_DREAM_MATCHUPS) {
      expect(names.has(match.heroA.toLowerCase())).toBe(true);
      expect(names.has(match.heroB.toLowerCase())).toBe(true);
      expect(match.category).toBeDefined();
    }
  });
});
