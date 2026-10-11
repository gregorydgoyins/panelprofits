/**
 * In-universe lore tables for the instruments the canon leaves without a data source.
 * All figures are game-design approximations of comic lore (not looked-up statistics) and are meant to be tuned.
 * Locations are intentionally absent: they come from the Fandom wiki data, not from here.
 */

export interface Benefactor {
  id: string;
  name: string;
  vehicle: string;
  universe: "Marvel" | "DC";
  /** Lore net worth, USD. */
  netWorth: number;
  /** Share of wealth tied up in operating companies, excluded from the private vehicle. */
  operatingFraction: number;
  /** Series (lowercase substrings) this benefactor collects — marked at real equity prices. */
  collects: string[];
  units: number;
  /** graph node that capital flows reach */
  node?: string;
}

export const BENEFACTORS: Benefactor[] = [
  { id: "wayne", node: "wayne_capital", name: "Bruce Wayne", vehicle: "Wayne Capital", universe: "DC", netWorth: 9_200_000_000, operatingFraction: 0.45, collects: ["batman", "detective comics"], units: 1_000_000 },
  { id: "luthor", node: "lexcorp", name: "Lex Luthor", vehicle: "LexCorp Holdings", universe: "DC", netWorth: 11_000_000_000, operatingFraction: 0.5, collects: ["action comics", "superman"], units: 1_000_000 },
  { id: "queen", name: "Oliver Queen", vehicle: "Queen Consolidated", universe: "DC", netWorth: 2_400_000_000, operatingFraction: 0.4, collects: ["green arrow"], units: 1_000_000 },
  { id: "stark", node: "stark_capital", name: "Tony Stark", vehicle: "Stark Capital", universe: "Marvel", netWorth: 12_400_000_000, operatingFraction: 0.5, collects: ["iron man", "tales of suspense"], units: 1_000_000 },
  { id: "osborn", node: "oscorp", name: "Norman Osborn", vehicle: "Oscorp Partners", universe: "Marvel", netWorth: 4_800_000_000, operatingFraction: 0.55, collects: ["amazing spider-man", "spectacular spider-man"], units: 1_000_000 },
  { id: "fisk", node: "fisk_holdings", name: "Wilson Fisk", vehicle: "Fisk Holdings", universe: "Marvel", netWorth: 3_600_000_000, operatingFraction: 0.3, collects: ["daredevil"], units: 1_000_000 },
  { id: "doom", name: "Victor von Doom", vehicle: "Latverian Trust", universe: "Marvel", netWorth: 15_000_000_000, operatingFraction: 0.6, collects: ["fantastic four", "doctor doom"], units: 1_000_000 },
];

export const PRIVATE_ILLIQUIDITY_DISCOUNT = 0.25;

export interface LoreCommodity {
  id: string;
  name: string;
  universe: "Marvel" | "DC";
  unit: string;
  /** Lore base price per unit, USD. */
  p0: number;
  /** Demand and supply indices (relative, lore-derived scarcity and appetite). */
  demand: number;
  supply: number;
  elasticity: number;
}

export const LORE_COMMODITIES: LoreCommodity[] = [
  { id: "vibranium", name: "Vibranium", universe: "Marvel", unit: "g", p0: 10_000, demand: 1.6, supply: 1.0, elasticity: 0.8 },
  { id: "adamantium", name: "Adamantium", universe: "Marvel", unit: "g", p0: 2_500, demand: 1.3, supply: 1.0, elasticity: 0.7 },
  { id: "uru", name: "Uru", universe: "Marvel", unit: "g", p0: 4_000, demand: 1.2, supply: 1.0, elasticity: 0.7 },
  { id: "kryptonite", name: "Kryptonite", universe: "DC", unit: "g", p0: 1_800, demand: 1.4, supply: 1.1, elasticity: 0.6 },
  { id: "nth-metal", name: "Nth Metal", universe: "DC", unit: "g", p0: 3_200, demand: 1.1, supply: 1.0, elasticity: 0.7 },
  { id: "element-x", name: "Element X", universe: "DC", unit: "g", p0: 900, demand: 1.0, supply: 1.2, elasticity: 0.5 },
];

/**
 * Cities as credit and real-estate issuers. Municipal class sets recovery (spec); the rest are design parameters.
 * Seed set — the full location roster comes from the Fandom-wiki import.
 */
export interface LoreCity {
  id: string;
  node: string;
  name: string;
  universe: "Marvel" | "DC";
  muniClass: "MUNICIPAL_MAJ_CITY" | "MUNICIPAL_REGION";
  /** baseline annual default hazard */
  hazard0: number;
  /** REIT: net operating income, debt, units, baseline cap rate */
  noi: number;
  debt: number;
  units: number;
  capRate0: number;
}
export const LORE_CITIES: LoreCity[] = [
  { id: "gotham", node: "gotham", name: "Gotham City", universe: "DC", muniClass: "MUNICIPAL_MAJ_CITY", hazard0: 0.02, noi: 2_400_000_000, debt: 14_000_000_000, units: 50_000_000, capRate0: 0.06 },
  { id: "metropolis", node: "metropolis", name: "Metropolis", universe: "DC", muniClass: "MUNICIPAL_MAJ_CITY", hazard0: 0.008, noi: 3_100_000_000, debt: 16_000_000_000, units: 50_000_000, capRate0: 0.05 },
  { id: "nyc", node: "new_york", name: "New York City (Marvel)", universe: "Marvel", muniClass: "MUNICIPAL_MAJ_CITY", hazard0: 0.015, noi: 4_000_000_000, debt: 20_000_000_000, units: 50_000_000, capRate0: 0.055 },
  { id: "wakanda", node: "wakanda", name: "Wakanda", universe: "Marvel", muniClass: "MUNICIPAL_REGION", hazard0: 0.004, noi: 5_000_000_000, debt: 6_000_000_000, units: 50_000_000, capRate0: 0.045 },
];

/** In-game issuance proposals awaiting rating and adjudication. */
export interface IssuanceProposal {
  id: string;
  benefactor: string; // BENEFACTORS id
  purpose: string;
  amount: number;
  years: number;
  existingDebt: number;
}
export const ISSUANCE_PROPOSALS: IssuanceProposal[] = [
  { id: "wayne-batcave", benefactor: "wayne", purpose: "Batcave renovation", amount: 50_000_000, years: 10, existingDebt: 200_000_000 },
  { id: "stark-tower", benefactor: "stark", purpose: "Stark Tower retrofit", amount: 120_000_000, years: 10, existingDebt: 500_000_000 },
];
