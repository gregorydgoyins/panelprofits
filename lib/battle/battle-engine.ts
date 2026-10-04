import superheroDataRaw from "@/data/superhero-api.json";

export interface PowerStats {
  intelligence: number;
  strength: number;
  speed: number;
  durability: number;
  power: number;
  combat: number;
}

export interface SuperheroContender {
  id: number;
  name: string;
  fullName: string;
  slug: string;
  powerstats: PowerStats;
  overallRating: number;
  powerTier: "Street Level" | "City Defender" | "Planetary Heavyweight" | "Cosmic Deity" | "Multiversal Threat";
  publisher: string;
  alignment: "good" | "bad" | "neutral";
  image: string;
  firstAppearance: string;
  firstAppearanceValueRawUsd?: number;
  firstAppearanceValue98Usd?: number;
  signatureWeapon?: string;
  cinematicFranchise?: string;
  debutComicId?: string;
}

export interface BattleRound {
  roundNumber: number;
  title: string;
  narrative: string;
  advantage: "contenderA" | "contenderB" | "even";
  statFocus: keyof PowerStats;
}

export interface BattleSimulationResult {
  contenderA: SuperheroContender;
  contenderB: SuperheroContender;
  winner: SuperheroContender;
  loser: SuperheroContender;
  winProbabilityA: number;
  winProbabilityB: number;
  tacticalAnalysis: string;
  financialAdvantage: {
    higherValueHero: string;
    valueDifference98: number;
    analysis: string;
  };
  rounds: BattleRound[];
  historicCanonCrossed: boolean;
  crossoverContext: string;
}

// Canonical Debut Issue Pricing Crosswalk from Panel Profits Data Estate
const DEBUT_MARKET_CAPS: Record<string, { raw: number; grade98: number; comicId?: string; weapon?: string; movie?: string }> = {
  "Batman": { raw: 1500000, grade98: 8500000, weapon: "Batarangs & WayneTech Disruptor", movie: "The Dark Knight Trilogy (Christopher Nolan)" },
  "Spider-Man": { raw: 32000, grade98: 3600000, weapon: "Web-Shooters & Spider-Sense", movie: "MCU / Sony Spider-Verse" },
  "Superman": { raw: 2400000, grade98: 9000000, weapon: "Kryptonian Solar Physiology", movie: "DC Cinematic Universe (James Gunn / Snyder)" },
  "Thor": { raw: 14000, grade98: 1850000, weapon: "Mjolnir (Enchanted Uru Hammer)", movie: "Marvel Cinematic Universe (MCU Phase 1-5)" },
  "Wolverine": { raw: 4200, grade98: 650000, weapon: "Adamantium Claws & Skeleton", movie: "X-Men Franchise & Deadpool 3" },
  "Deathstroke": { raw: 450, grade98: 12500, weapon: "Promethium Broadsword & Energy Lance", movie: "DC Extended Universe / Titans" },
  "Doctor Doom": { raw: 16000, grade98: 980000, weapon: "Titanium Armor & Latverian Mystic Arts", movie: "Avengers: Doomsday (MCU Phase 6)" },
  "Lex Luthor": { raw: 28000, grade98: 1450000, weapon: "Kryptonite Warsuit & Apex Intellect", movie: "DCU Superman (2025)" },
  "Thanos": { raw: 3800, grade98: 340000, weapon: "Infinity Gauntlet & Cosmic Stasis", movie: "Avengers: Infinity War & Endgame" },
  "Darkseid": { raw: 850, grade98: 48000, weapon: "Omega Beams & Anti-Life Equation", movie: "Zack Snyder's Justice League" },
  "Hulk": { raw: 48000, grade98: 2900000, weapon: "Gamma-Ray Kinetic Impact", movie: "Marvel Cinematic Universe (The Avengers)" },
  "Doomsday": { raw: 120, grade98: 1800, weapon: "Adaptive Cellular Regeneration", movie: "Batman v Superman: Dawn of Justice" },
  "Deadpool": { raw: 450, grade98: 3500, weapon: "Dual Katanas & 4th-Wall Disruption", movie: "Deadpool & Wolverine (2024)" },
  "Harley Quinn": { raw: 250, grade98: 2400, weapon: "Oversized Mallet & Toxic Alchemy", movie: "The Suicide Squad & Birds of Prey" },
  "Magneto": { raw: 42000, grade98: 2400000, weapon: "Electromagnetic Shielding & Ferrous Control", movie: "X-Men Franchise (Ian McKellen / Michael Fassbender)" },
  "Hal Jordan": { raw: 18000, grade98: 1200000, weapon: "Oan Power Ring & Willpower Battery", movie: "DCU Lanterns (HBO / DC Studios)" },
  "Green Arrow": { raw: 12000, grade98: 820000, weapon: "Trick Arrow Arsenal & Compound Bow", movie: "Arrowverse (CW)" },
  "Hawkeye": { raw: 3200, grade98: 240000, weapon: "Vibranium Bow & Sonic Arrowheads", movie: "Marvel Cinematic Universe (Avengers)" },
  "Carnage": { raw: 180, grade98: 1600, weapon: "Symbiote Tendrils & Plasma Daggers", movie: "Venom: Let There Be Carnage" },
  "Joker": { raw: 450000, grade98: 3800000, weapon: "Joker Venom & Acid Lapel Flower", movie: "Joker / The Dark Knight" },
  "Iron Man": { raw: 36000, grade98: 2200000, weapon: "Mark LXXXV Nanotech Armor & Arc Reactor", movie: "Marvel Cinematic Universe (Robert Downey Jr.)" },
  "Captain America": { raw: 380000, grade98: 3100000, weapon: "Vibranium Concave Shield", movie: "Marvel Cinematic Universe (Chris Evans)" },
  "Daredevil": { raw: 12000, grade98: 750000, weapon: "Billy Club & Radar Sense", movie: "Daredevil: Born Again (MCU)" },
  "Nightwing": { raw: 320, grade98: 2800, weapon: "Escrima Sticks & Wingding Glider", movie: "Titans / DCU Batman: Brave and the Bold" },
  "Doctor Strange": { raw: 22000, grade98: 1450000, weapon: "Eye of Agamotto & Cloak of Levitation", movie: "Doctor Strange in the Multiverse of Madness" },
  "Doctor Fate": { raw: 35000, grade98: 1900000, weapon: "Helmet of Nabu & Amulet of Anubis", movie: "Black Adam (Pierce Brosnan)" },
  "Black Panther": { raw: 18000, grade98: 1250000, weapon: "Vibranium Weave Suit & Energy Daggers", movie: "Black Panther / Wakanda Forever" },
  "Silver Surfer": { raw: 16000, grade98: 1100000, weapon: "Power Cosmic & Cosmic Surfboard", movie: "Fantastic Four: First Steps (2025)" },
  "Martian Manhunter": { raw: 24000, grade98: 1350000, weapon: "Martian Telepathy, Density Control & Phasing", movie: "Zack Snyder's Justice League" },
  "Flash": { raw: 65000, grade98: 3200000, weapon: "Speed Force Channeling & Phasing Vibrations", movie: "The Flash (2023) / Arrowverse" },
  "Venom": { raw: 280, grade98: 4200, weapon: "Klyntar Symbiote Biomass & Tendrils", movie: "Venom Trilogy (Tom Hardy)" },
};

function determinePowerTier(stats: PowerStats): SuperheroContender["powerTier"] {
  const sum = stats.intelligence + stats.strength + stats.speed + stats.durability + stats.power + stats.combat;
  if (sum >= 520) return "Multiversal Threat";
  if (sum >= 440) return "Cosmic Deity";
  if (sum >= 350) return "Planetary Heavyweight";
  if (sum >= 240) return "City Defender";
  return "Street Level";
}

/**
 * Normalizes superhero data from Superhero API into typed Contender records
 */
export function getAllSuperheroContenders(): SuperheroContender[] {
  const rawList = superheroDataRaw as any[];
  return rawList.map((h) => {
    const stats: PowerStats = {
      intelligence: Number(h.powerstats?.intelligence) || 50,
      strength: Number(h.powerstats?.strength) || 50,
      speed: Number(h.powerstats?.speed) || 50,
      durability: Number(h.powerstats?.durability) || 50,
      power: Number(h.powerstats?.power) || 50,
      combat: Number(h.powerstats?.combat) || 50,
    };
    const overall = Math.round(
      (stats.intelligence * 1.2 +
        stats.strength * 1.0 +
        stats.speed * 1.1 +
        stats.durability * 1.0 +
        stats.power * 1.3 +
        stats.combat * 1.4) /
        7.0
    );

    let displayName = h.name;
    if (h.id === 69) displayName = "Batman (Batman Beyond)";
    if (h.id === 70) displayName = "Batman";
    if (h.id === 156) displayName = "Shazam (Captain Marvel)";
    if (h.id === 157) displayName = "Captain Marvel (Carol Danvers)";
    if (h.id === 260) displayName = "Firestorm (Jason Rusch)";
    if (h.id === 261) displayName = "Firestorm (Ronnie Raymond)";
    if (h.id === 97) displayName = "Black Canary (Laurel Lance)";
    if (h.id === 98) displayName = "Black Canary (Dinah Drake)";
    if (h.id === 496) displayName = "Nova (Richard Rider)";
    if (h.id === 497) displayName = "Nova (Frankie Raye)";
    if (h.id === 23) displayName = "Angel (Buffyverse)";
    if (h.id === 24) displayName = "Angel (Warren Worthington III)";

    const meta = DEBUT_MARKET_CAPS[displayName] || DEBUT_MARKET_CAPS[h.name] || {};

    return {
      id: h.id,
      name: displayName,
      fullName: h.biography?.fullName || displayName,
      slug: h.slug || String(h.id),
      powerstats: stats,
      overallRating: Math.min(100, Math.max(10, overall)),
      powerTier: determinePowerTier(stats),
      publisher: h.biography?.publisher || "Independent",
      alignment: (h.biography?.alignment || "good").toLowerCase() as any,
      image: h.images?.md || h.images?.lg || h.images?.sm || "",
      firstAppearance: h.biography?.firstAppearance || "Archival Debut",
      firstAppearanceValueRawUsd: meta.raw,
      firstAppearanceValue98Usd: meta.grade98,
      signatureWeapon: meta.weapon,
      cinematicFranchise: meta.movie,
    };
  });
}

export interface DreamMatchupConfig {
  id: string;
  title: string;
  tagline: string;
  heroA: string;
  heroB: string;
  canonHistory: string;
}

export const CANONICAL_DREAM_MATCHUPS: DreamMatchupConfig[] = [
  {
    id: "batman-vs-spider-man",
    title: "Batman vs. Spider-Man",
    tagline: "The Detective of Gotham vs. The Web-Slinger of Queens",
    heroA: "Batman",
    heroB: "Spider-Man",
    canonHistory: "Briefly met in 1995's Spider-Man and Batman: Disordered Minds against Carnage and Joker, but never fought to a decisive 1-on-1 finish.",
  },
  {
    id: "superman-vs-thor",
    title: "Superman vs. Thor",
    tagline: "The Last Son of Krypton vs. The Norse God of Thunder",
    heroA: "Superman",
    heroB: "Thor",
    canonHistory: "Clashed in 2003's JLA/Avengers #2 where Superman famously caught Mjolnir, but Thor's magical lightning remains a direct vulnerability.",
  },
  {
    id: "wolverine-vs-deathstroke",
    title: "Wolverine vs. Deathstroke",
    tagline: "Weapon X Adamantium vs. The Enhanced Terminator",
    heroA: "Wolverine",
    heroB: "Deathstroke",
    canonHistory: "Met briefly in 1982's Uncanny X-Men and The New Teen Titans, but never waged an all-out blood duel between their respective healing factors.",
  },
  {
    id: "doctor-doom-vs-lex-luthor",
    title: "Doctor Doom vs. Lex Luthor",
    tagline: "The Sorcerer King of Latveria vs. Apex Humanity",
    heroA: "Doctor Doom",
    heroB: "Lex Luthor",
    canonHistory: "Uneasy allies in 1981's Marvel Treasury Edition #28, but their supreme egos have never collided in a solo sovereign war.",
  },
  {
    id: "thanos-vs-darkseid",
    title: "Thanos vs. Darkseid",
    tagline: "The Mad Titan vs. The Lord of Apokolips",
    heroA: "Thanos",
    heroB: "Darkseid",
    canonHistory: "Briefly crossed paths in Marvel vs DC (1996) where Thanos tested the Anti-Life equation, but never fought in their apex cosmic forms.",
  },
  {
    id: "hulk-vs-doomsday",
    title: "Hulk vs. Doomsday",
    tagline: "Worldbreaker Infinite Rage vs. The Monster Who Killed Superman",
    heroA: "Hulk",
    heroB: "Doomsday",
    canonHistory: "Fought in DC Versus Marvel #3 (1996) where Superman fought Hulk, but Hulk never faced Doomsday directly in a survival war.",
  },
  {
    id: "deadpool-vs-harley-quinn",
    title: "Deadpool vs. Harley Quinn",
    tagline: "The Merc with a Mouth vs. The Maiden of Mischief",
    heroA: "Deadpool",
    heroB: "Harley Quinn",
    canonHistory: "Never occurred in official publication history. A pure multiversal fourth-wall collision of anarchic slapstick and lethal combat.",
  },
  {
    id: "magneto-vs-hal-jordan",
    title: "Magneto vs. Hal Jordan",
    tagline: "Master of Magnetism vs. Green Lantern Willpower",
    heroA: "Magneto",
    heroB: "Hal Jordan",
    canonHistory: "A direct metaphysical clash of the Electromagnetic Spectrum against the Emerald Emotional Spectrum that has never happened in comic canon.",
  },
  {
    id: "green-arrow-vs-hawkeye",
    title: "Green Arrow vs. Hawkeye",
    tagline: "The Star City Archer vs. Earth's Mightiest Marksman",
    heroA: "Green Arrow",
    heroB: "Hawkeye",
    canonHistory: "Competed in JLA/Avengers archery exhibition challenges, but never faced off in an urban sniper duel to determine the ultimate archer.",
  },
  {
    id: "carnage-vs-joker",
    title: "Carnage vs. The Joker",
    tagline: "Maximum Alien Carnage vs. The Harlequin of Hate",
    heroA: "Carnage",
    heroB: "Joker",
    canonHistory: "Paired in 1995's Spider-Man and Batman, but their ideological feud over 'pure slaughter' vs 'theatrical comedy' remained unresolved.",
  },
];

/**
 * Advanced Combat Simulation Engine
 * Calculates multi-dimensional combat dynamics based on canonical powerstats,
 * tactical genius, equipment synergies, and comic equity valuations.
 */
export function simulateSuperheroBattle(
  heroA: SuperheroContender,
  heroB: SuperheroContender
): BattleSimulationResult {
  const statsA = heroA.powerstats;
  const statsB = heroB.powerstats;

  // 1. Scoring dimensions
  const intellectDiff = statsA.intelligence - statsB.intelligence;
  const strengthDiff = statsA.strength - statsB.strength;
  const speedDiff = statsA.speed - statsB.speed;
  const durabilityDiff = statsA.durability - statsB.durability;
  const powerDiff = statsA.power - statsB.power;
  const combatDiff = statsA.combat - statsB.combat;

  // Weighted combat calculus
  // Combat skill (25%), Power/Energy (25%), Durability (20%), Speed (15%), Strength (10%), Intellect (5%)
  const combatScoreA =
    statsA.combat * 2.5 +
    statsA.power * 2.5 +
    statsA.durability * 2.0 +
    statsA.speed * 1.5 +
    statsA.strength * 1.0 +
    statsA.intelligence * 1.0;

  const combatScoreB =
    statsB.combat * 2.5 +
    statsB.power * 2.5 +
    statsB.durability * 2.0 +
    statsB.speed * 1.5 +
    statsB.strength * 1.0 +
    statsB.intelligence * 1.0;

  const totalScore = combatScoreA + combatScoreB;
  let winProbA = Math.round((combatScoreA / totalScore) * 100);
  let winProbB = 100 - winProbA;

  // Ensure plausible bounds
  winProbA = Math.min(88, Math.max(12, winProbA));
  winProbB = 100 - winProbA;

  const isAWinner = winProbA >= winProbB;
  const winner = isAWinner ? heroA : heroB;
  const loser = isAWinner ? heroB : heroA;

  // 2. Generate 3 Round-by-Round Encounters
  const rounds: BattleRound[] = [];

  // Round 1: Recon & Speed / Range Opening
  const r1Adv = speedDiff > 10 ? "contenderA" : speedDiff < -10 ? "contenderB" : "even";
  rounds.push({
    roundNumber: 1,
    title: "Opening Incursion: Speed & Spatial Engagement",
    statFocus: "speed",
    advantage: r1Adv,
    narrative:
      r1Adv === "contenderA"
        ? `${heroA.name} seizes immediate spatial superiority with superior kinetic velocity (${statsA.speed} vs ${statsB.speed}), circling ${heroB.name} and testing perimeter defenses.`
        : r1Adv === "contenderB"
        ? `${heroB.name} dictates early tempo, utilizing superior speed and reflexes (${statsB.speed} vs ${statsA.speed}) to evade initial advances and land decisive precision strikes.`
        : `Both combatants exchange lightning opening volleys with near-identical operational reflexes, neither yielding ground in the opening clash.`,
  });

  // Round 2: Escalation & Power Clash
  const r2Adv = powerDiff + strengthDiff > 15 ? "contenderA" : powerDiff + strengthDiff < -15 ? "contenderB" : "even";
  rounds.push({
    roundNumber: 2,
    title: "Apex Escalation: Heavy Armament & Energy Output",
    statFocus: "power",
    advantage: r2Adv,
    narrative:
      r2Adv === "contenderA"
        ? `${heroA.name} unleashes full destructive capacity (${statsA.power} Power rating), forcing ${heroB.name} onto the back foot with overwhelming concussive force.`
        : r2Adv === "contenderB"
        ? `${heroB.name} counters with devastating offensive potency (${statsB.power} Power rating), breaking through ${heroA.name}'s forward defensive perimeter.`
        : `An apocalyptic kinetic collision rocks the arena as ${heroA.name} and ${heroB.name}'s signature arsenals collide in a deadlocked shockwave.`,
  });

  // Round 3: The Climax: Combat Mastery, Durability & Final Decider
  const r3Adv = isAWinner ? "contenderA" : "contenderB";
  rounds.push({
    roundNumber: 3,
    title: "The Decisive Finish: Combat Mastery & Attrition",
    statFocus: "combat",
    advantage: r3Adv,
    narrative:
      r3Adv === "contenderA"
        ? `In the grueling war of attrition, ${heroA.name}'s supreme hand-to-hand discipline (${statsA.combat} Combat) and endurance (${statsA.durability} Durability) break ${heroB.name}'s posture, securing a definitive victory.`
        : `Exploiting an opening in the late exchanges, ${heroB.name}'s elite martial execution (${statsB.combat} Combat) overwhelms ${heroA.name}, landing the closing blow to claim the battle.`,
  });

  // 3. Tactical Analysis Summary
  let tactical = `${winner.name} triumphs with an estimated ${Math.max(winProbA, winProbB)}% win probability. `;
  if (Math.abs(combatDiff) > 15) {
    tactical += `The primary decider was the stark differential in martial combat execution (${winner.powerstats.combat} vs ${loser.powerstats.combat}). `;
  } else if (Math.abs(powerDiff) > 20) {
    tactical += `Raw destructive energy projection (${winner.powerstats.power} vs ${loser.powerstats.power}) proved insurmountable in prolonged exchanges. `;
  } else {
    tactical += `Both contenders demonstrated elite parity, with the margin of victory secured through tactical conditioning and superior durability recovery. `;
  }

  // 4. Financial Comic Equity Valuation Comparison
  const valA = heroA.firstAppearanceValue98Usd || 0;
  const valB = heroB.firstAppearanceValue98Usd || 0;
  const higherHero = valA >= valB ? heroA.name : heroB.name;
  const diffVal = Math.abs(valA - valB);

  let finAnalysis = "";
  if (valA > 0 && valB > 0) {
    finAnalysis = `${higherHero}'s landmark first appearance (${higherHero === heroA.name ? heroA.firstAppearance : heroB.firstAppearance}) holds a commanding secondary market valuation edge of $${diffVal.toLocaleString()} in certified CGC 9.8.`;
  } else {
    finAnalysis = "Secondary market transactions reflect continuous collector institutional liquidity for both foundational keys.";
  }

  // Check matching dream matchup for lore
  const matchConfig = CANONICAL_DREAM_MATCHUPS.find(
    (m) =>
      (m.heroA.toLowerCase() === heroA.name.toLowerCase() && m.heroB.toLowerCase() === heroB.name.toLowerCase()) ||
      (m.heroB.toLowerCase() === heroA.name.toLowerCase() && m.heroA.toLowerCase() === heroB.name.toLowerCase())
  );

  return {
    contenderA: heroA,
    contenderB: heroB,
    winner,
    loser,
    winProbabilityA: winProbA,
    winProbabilityB: winProbB,
    tacticalAnalysis: tactical,
    financialAdvantage: {
      higherValueHero: higherHero,
      valueDifference98: diffVal,
      analysis: finAnalysis,
    },
    rounds,
    historicCanonCrossed: !!matchConfig,
    crossoverContext:
      matchConfig?.canonHistory ||
      "HISTORIC MULTIVERSE FIRST: This exact 1-on-1 battle has never occurred in official Marvel or DC canonical continuity.",
  };
}
