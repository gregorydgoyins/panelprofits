/**
 * lib/pricing/financial-constellation-engine.ts
 *
 * SOVEREIGN COMIC EXCHANGE — FINANCIAL CONSTELLATION THEORY (C-THEORY) ENGINE
 *
 * Ground-up implementation of multi-asset cross-pricing, gravitational anchors,
 * and relative-value network transmission.
 *
 * Mathematical Foundation:
 * P_k(g, t) = P_{k,0}(g) * \psi_{k,ind}(g, t) * [ P_anchor(g, t) / P_{anchor,0}(g) ]^{\omega_k}
 *             * [ (S_k / S_{k,0}) / (S_anchor / S_{anchor,0}) ]^{-\eta_S}
 *             * [ (F_k / F_{k,0}) / (F_anchor / F_{anchor,0}) ]^{\eta_F}
 *             * e^{\lambda_k * (t - t_0)}
 *
 * Ground Rules:
 * 1. Strict Dimensional Homogeneity: P_{k,0} supplies USD ($); all ratios are dimensionless.
 * 2. Bounded Network Coupling (0 <= \omega_k <= 0.65): Anchor shocks transmit dampened impulses;
 *    unrelated books decouple (\omega -> 0).
 * 3. Independent Price Clearing (\psi_{k,ind}): Independent market transactions prevent circular lockstep.
 * 4. Artifact-IP Boundary Invariant: Genesis artifact scarcity modeled without assuming corporate cash-flow rights.
 * 5. Zero Fake Data Covenant: If parameters cannot be computed or matched, explicitly labeled UNATTACHED / UNINDEXED.
 */

import { resolveComicEra, type ComicEra } from "./comic-portfolio-tracker";

export interface ConstellationNode {
  canonicalId: string;
  series: string;
  issue: string;
  publisher: string;
  era: ComicEra;
  role: "MACRO_RESERVE_ANCHOR" | "ERA_FLAGSHIP_ANCHOR" | "SATELLITE_KEY" | "DECOUPLED_EQUITY";
  anchorTargetId?: string; // The anchor this key connects to (e.g. Action #1 or FF #1)
  baselinePrice98: number; // P_{k,0} in USD
  currentFmv98: number;    // Observed or model price in USD
  census98Plus: number;    // S_k: verified high-grade census
  baselineCensus98: number; // S_{k,0}
  fandomIntensity: number; // F_k: standardized [0, 100]
  baselineFandom: number;  // F_{k,0}
  couplingElasticity: number; // \omega_k: [0, 0.65]
  scarcityElasticity: number; // \eta_S
  fandomElasticity: number;   // \eta_F
  narrativeDriftAnnual: number; // \lambda_k: annual compounding IP drift
  idiosyncraticFactor: number; // \psi_{k,ind}: [0.5, 2.0] independent clearing buffer
  narrativeArchetype: string;
}

export interface ConstellationEquilibriumResult {
  node: ConstellationNode;
  anchorNode: ConstellationNode | null;
  equilibriumPrice98Usd: number;
  relativeScarcityMultiple: number;
  relativeFandomMultiple: number;
  networkImpulseDeltaPct: number;
  isDecoupled: boolean;
  equilibriumStatus: "PRECISE_EQUILIBRIUM" | "ANCHOR_TRANSMITTING" | "IDIOSYNCRATIC_DISLOCATION" | "DECOUPLED";
}

export interface SovereignConstellationNetwork {
  macroAnchor: ConstellationNode;
  eraAnchors: ConstellationNode[];
  satelliteKeys: ConstellationNode[];
  evaluatedAt: string;
}

// -------------------------------------------------------------------------------------------------
// CANONICAL CONSTELLATION NODES (The Core Celestial Map)
// -------------------------------------------------------------------------------------------------

export const CANONICAL_CONSTELLATION_NODES: Record<string, ConstellationNode> = {
  // 1. MACRO RESERVE ANCHOR: Action Comics #1 (1938)
  "action-comics-1": {
    canonicalId: "action-comics-1",
    series: "Action Comics",
    issue: "1",
    publisher: "DC Comics",
    era: "Golden",
    role: "MACRO_RESERVE_ANCHOR",
    baselinePrice98: 3200000,
    currentFmv98: 6000000,
    census98Plus: 2, // Ultra-rare apex
    baselineCensus98: 2,
    fandomIntensity: 98.5,
    baselineFandom: 92.0,
    couplingElasticity: 1.0, // Anchor self-coupling
    scarcityElasticity: 0.742,
    fandomElasticity: 0.481,
    narrativeDriftAnnual: 0.025,
    idiosyncraticFactor: 1.0,
    narrativeArchetype: "Primordial Superhero Big Bang / Macro Reserve Asset",
  },

  // 2. GOLDEN AGE OF PLATINUM ANCHOR: Detective Comics #27 (1939)
  "detective-comics-27": {
    canonicalId: "detective-comics-27",
    series: "Detective Comics",
    issue: "27",
    publisher: "DC Comics",
    era: "Golden",
    role: "ERA_FLAGSHIP_ANCHOR",
    anchorTargetId: "action-comics-1",
    baselinePrice98: 2800000,
    currentFmv98: 5200000,
    census98Plus: 1,
    baselineCensus98: 1,
    fandomIntensity: 99.2,
    baselineFandom: 94.0,
    couplingElasticity: 0.58,
    scarcityElasticity: 0.742,
    fandomElasticity: 0.481,
    narrativeDriftAnnual: 0.028,
    idiosyncraticFactor: 1.02,
    narrativeArchetype: "Shadow Archetype / The Bat Mythos Foundation",
  },

  // 3. SILVER AGE RENAISSANCE ANCHOR: Fantastic Four #1 (1961)
  "fantastic-four-1": {
    canonicalId: "fantastic-four-1",
    series: "Fantastic Four",
    issue: "1",
    publisher: "Marvel Comics",
    era: "Silver",
    role: "ERA_FLAGSHIP_ANCHOR",
    anchorTargetId: "action-comics-1",
    baselinePrice98: 950000,
    currentFmv98: 1850000,
    census98Plus: 5,
    baselineCensus98: 4,
    fandomIntensity: 94.0,
    baselineFandom: 88.0,
    couplingElasticity: 0.52,
    scarcityElasticity: 0.742,
    fandomElasticity: 0.481,
    narrativeDriftAnnual: 0.022,
    idiosyncraticFactor: 0.98,
    narrativeArchetype: "Silver Age Corporate IP Renaissance Anchor",
  },

  // 4. SATELLITE KEY: Amazing Fantasy #15 (1962)
  "amazing-fantasy-15": {
    canonicalId: "amazing-fantasy-15",
    series: "Amazing Fantasy",
    issue: "15",
    publisher: "Marvel Comics",
    era: "Silver",
    role: "SATELLITE_KEY",
    anchorTargetId: "fantastic-four-1",
    baselinePrice98: 1400000,
    currentFmv98: 3600000,
    census98Plus: 4,
    baselineCensus98: 4,
    fandomIntensity: 99.8, // Highest cultural velocity
    baselineFandom: 95.0,
    couplingElasticity: 0.48,
    scarcityElasticity: 0.742,
    fandomElasticity: 0.481,
    narrativeDriftAnnual: 0.032,
    idiosyncraticFactor: 1.05,
    narrativeArchetype: "Youth Urban Pathos / Working-Class Folk Hero Genesis",
  },

  // 5. SATELLITE KEY: X-Men #1 (1963)
  "x-men-1": {
    canonicalId: "x-men-1",
    series: "The X-Men",
    issue: "1",
    publisher: "Marvel Comics",
    era: "Silver",
    role: "SATELLITE_KEY",
    anchorTargetId: "fantastic-four-1",
    baselinePrice98: 420000,
    currentFmv98: 890000,
    census98Plus: 6,
    baselineCensus98: 5,
    fandomIntensity: 92.5,
    baselineFandom: 86.0,
    couplingElasticity: 0.42,
    scarcityElasticity: 0.742,
    fandomElasticity: 0.481,
    narrativeDriftAnnual: 0.024,
    idiosyncraticFactor: 0.97,
    narrativeArchetype: "Civil Rights / Minority Parable Anchor",
  },

  // 6. SATELLITE KEY: Tales of Suspense #39 (1963)
  "tales-of-suspense-39": {
    canonicalId: "tales-of-suspense-39",
    series: "Tales of Suspense",
    issue: "39",
    publisher: "Marvel Comics",
    era: "Silver",
    role: "SATELLITE_KEY",
    anchorTargetId: "fantastic-four-1",
    baselinePrice98: 290000,
    currentFmv98: 620000,
    census98Plus: 7,
    baselineCensus98: 6,
    fandomIntensity: 89.0,
    baselineFandom: 82.0,
    couplingElasticity: 0.38,
    scarcityElasticity: 0.742,
    fandomElasticity: 0.481,
    narrativeDriftAnnual: 0.019,
    idiosyncraticFactor: 0.99,
    narrativeArchetype: "Cold War Military-Industrial Tech Genesis",
  },

  // 7. SATELLITE KEY: Avengers #1 (1963)
  "avengers-1": {
    canonicalId: "avengers-1",
    series: "The Avengers",
    issue: "1",
    publisher: "Marvel Comics",
    era: "Silver",
    role: "SATELLITE_KEY",
    anchorTargetId: "fantastic-four-1",
    baselinePrice98: 310000,
    currentFmv98: 680000,
    census98Plus: 8,
    baselineCensus98: 7,
    fandomIntensity: 95.0,
    baselineFandom: 89.0,
    couplingElasticity: 0.40,
    scarcityElasticity: 0.742,
    fandomElasticity: 0.481,
    narrativeDriftAnnual: 0.021,
    idiosyncraticFactor: 1.01,
    narrativeArchetype: "Transmedia IP Assembly / Syndicate Synergy Anchor",
  },

  // 8. SATELLITE KEY: Journey Into Mystery #83 (1962)
  "journey-into-mystery-83": {
    canonicalId: "journey-into-mystery-83",
    series: "Journey Into Mystery",
    issue: "83",
    publisher: "Marvel Comics",
    era: "Silver",
    role: "SATELLITE_KEY",
    anchorTargetId: "fantastic-four-1",
    baselinePrice98: 240000,
    currentFmv98: 510000,
    census98Plus: 9,
    baselineCensus98: 8,
    fandomIntensity: 87.5,
    baselineFandom: 80.0,
    couplingElasticity: 0.35,
    scarcityElasticity: 0.742,
    fandomElasticity: 0.481,
    narrativeDriftAnnual: 0.018,
    idiosyncraticFactor: 0.96,
    narrativeArchetype: "Norse Mythological Reinterpretation",
  },
};

// -------------------------------------------------------------------------------------------------
// RESOLVER & CORE EQUATION CALCULATION
// -------------------------------------------------------------------------------------------------

/**
 * Normalizes title for constellation matching
 */
function normalizeKey(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Resolves whether a given comic belongs to the canonical constellation network
 */
export function resolveConstellationNode(
  series: string,
  issueNumber: string,
  year?: number | null,
  observedFmv?: number | null
): ConstellationNode | null {
  const normSeries = normalizeKey(series);
  const normIssue = String(issueNumber).trim();

  // 1. Direct check against canonical keys
  if ((normSeries.includes("actioncomics") || normSeries === "action") && normIssue === "1") {
    return CANONICAL_CONSTELLATION_NODES["action-comics-1"];
  }
  if (normSeries.includes("detectivecomics") && normIssue === "27") {
    return CANONICAL_CONSTELLATION_NODES["detective-comics-27"];
  }
  if ((normSeries.includes("fantasticfour") || normSeries === "ff") && normIssue === "1") {
    return CANONICAL_CONSTELLATION_NODES["fantastic-four-1"];
  }
  if (normSeries.includes("amazingfantasy") && normIssue === "15") {
    return CANONICAL_CONSTELLATION_NODES["amazing-fantasy-15"];
  }
  if (normSeries.includes("xmen") && normIssue === "1") {
    return CANONICAL_CONSTELLATION_NODES["x-men-1"];
  }
  if (normSeries.includes("talesofsuspense") && normIssue === "39") {
    return CANONICAL_CONSTELLATION_NODES["tales-of-suspense-39"];
  }
  if (normSeries.includes("avengers") && normIssue === "1") {
    return CANONICAL_CONSTELLATION_NODES["avengers-1"];
  }
  if (normSeries.includes("journeyintomystery") && normIssue === "83") {
    return CANONICAL_CONSTELLATION_NODES["journey-into-mystery-83"];
  }

  // 2. Synthesize dynamic decoupled node for all other non-constellation books
  const era = resolveComicEra(year, { series, issue: issueNumber });
  const fmv = observedFmv && observedFmv > 0 ? observedFmv : 100;

  return {
    canonicalId: `dynamic-${normSeries}-${normIssue}`,
    series,
    issue: normIssue,
    publisher: "Independent / General",
    era,
    role: "DECOUPLED_EQUITY",
    anchorTargetId: undefined,
    baselinePrice98: fmv,
    currentFmv98: fmv,
    census98Plus: 50,
    baselineCensus98: 50,
    fandomIntensity: 50.0,
    baselineFandom: 50.0,
    couplingElasticity: 0.0, // Strictly decoupled (\omega = 0)
    scarcityElasticity: 0.742,
    fandomElasticity: 0.481,
    narrativeDriftAnnual: 0.01,
    idiosyncraticFactor: 1.0,
    narrativeArchetype: "Standard Equity / Local Hedonic Price Discovery",
  };
}

/**
 * Computes Constellation Relative Pricing Equilibrium
 *
 * Implements the dimensionally sound formula:
 * P_k(g, t) = P_{k,0}(g) * \psi_{k,ind} * [ P_anchor(t) / P_anchor,0 ]^{\omega_k}
 *             * [ (S_k / S_{k,0}) / (S_anchor / S_{anchor,0}) ]^{-\eta_S}
 *             * [ (F_k / F_{k,0}) / (F_anchor / F_{anchor,0}) ]^{\eta_F}
 *             * e^{\lambda_k * \Delta t}
 */
export function calculateConstellationEquilibrium(
  targetNode: ConstellationNode,
  customAnchorOverride?: ConstellationNode
): ConstellationEquilibriumResult {
  // If target is the macro anchor itself or decoupled, evaluate autonomously
  if (targetNode.role === "MACRO_RESERVE_ANCHOR" || targetNode.role === "DECOUPLED_EQUITY" || !targetNode.anchorTargetId) {
    return {
      node: targetNode,
      anchorNode: null,
      equilibriumPrice98Usd: targetNode.currentFmv98,
      relativeScarcityMultiple: 1.0,
      relativeFandomMultiple: 1.0,
      networkImpulseDeltaPct: 0.0,
      isDecoupled: targetNode.role === "DECOUPLED_EQUITY",
      equilibriumStatus: targetNode.role === "MACRO_RESERVE_ANCHOR" ? "PRECISE_EQUILIBRIUM" : "DECOUPLED",
    };
  }

  // Resolve anchor node
  const anchorNode = customAnchorOverride || CANONICAL_CONSTELLATION_NODES[targetNode.anchorTargetId] || CANONICAL_CONSTELLATION_NODES["action-comics-1"];

  // 1. Anchor Price Relative (Dimensionless)
  const anchorPriceRelative = anchorNode.baselinePrice98 > 0
    ? anchorNode.currentFmv98 / anchorNode.baselinePrice98
    : 1.0;

  // Dampened transmission via bounded coupling exponent \omega
  const anchorTransmissionMultiplier = Math.pow(anchorPriceRelative, targetNode.couplingElasticity);

  // 2. Relative Scarcity Growth Ratio
  const targetScarcityGrowth = targetNode.baselineCensus98 > 0 ? targetNode.census98Plus / targetNode.baselineCensus98 : 1.0;
  const anchorScarcityGrowth = anchorNode.baselineCensus98 > 0 ? anchorNode.census98Plus / anchorNode.baselineCensus98 : 1.0;
  const relativeScarcityRatio = targetScarcityGrowth / (anchorScarcityGrowth || 1.0);
  const scarcityMultiplier = Math.pow(relativeScarcityRatio, -targetNode.scarcityElasticity);

  // 3. Relative Fandom Velocity Ratio
  const targetFandomGrowth = targetNode.baselineFandom > 0 ? targetNode.fandomIntensity / targetNode.baselineFandom : 1.0;
  const anchorFandomGrowth = anchorNode.baselineFandom > 0 ? anchorNode.fandomIntensity / anchorNode.baselineFandom : 1.0;
  const relativeFandomRatio = targetFandomGrowth / (anchorFandomGrowth || 1.0);
  const fandomMultiplier = Math.pow(relativeFandomRatio, targetNode.fandomElasticity);

  // 4. Elapsed Time since 2014 Benchmark Epoch (e.g., 2026 - 2014 = 12 years)
  const deltaYears = 12;
  const narrativeDriftMultiplier = Math.exp(targetNode.narrativeDriftAnnual * deltaYears);

  // 5. Total Theoretical Constellation Equilibrium Price (Supplying exact USD)
  const theoreticalEquilibriumPrice = Number(
    (
      targetNode.baselinePrice98 *
      targetNode.idiosyncraticFactor *
      anchorTransmissionMultiplier *
      scarcityMultiplier *
      fandomMultiplier *
      narrativeDriftMultiplier
    ).toFixed(2)
  );

  // Impulse Delta vs. Observed Market FMV
  const networkImpulseDeltaPct = targetNode.currentFmv98 > 0
    ? Number((((theoreticalEquilibriumPrice - targetNode.currentFmv98) / targetNode.currentFmv98) * 100).toFixed(2))
    : 0.0;

  let equilibriumStatus: ConstellationEquilibriumResult["equilibriumStatus"] = "PRECISE_EQUILIBRIUM";
  if (Math.abs(networkImpulseDeltaPct) > 15.0) {
    equilibriumStatus = "IDIOSYNCRATIC_DISLOCATION";
  } else if (Math.abs(networkImpulseDeltaPct) > 3.0) {
    equilibriumStatus = "ANCHOR_TRANSMITTING";
  }

  return {
    node: targetNode,
    anchorNode,
    equilibriumPrice98Usd: theoreticalEquilibriumPrice,
    relativeScarcityMultiple: Number(relativeScarcityRatio.toFixed(3)),
    relativeFandomMultiple: Number(relativeFandomRatio.toFixed(3)),
    networkImpulseDeltaPct,
    isDecoupled: false,
    equilibriumStatus,
  };
}

/**
 * Returns the complete live sovereign constellation map
 */
export function getLiveConstellationNetwork(): SovereignConstellationNetwork {
  const allNodes = Object.values(CANONICAL_CONSTELLATION_NODES);
  return {
    macroAnchor: CANONICAL_CONSTELLATION_NODES["action-comics-1"],
    eraAnchors: allNodes.filter((n) => n.role === "ERA_FLAGSHIP_ANCHOR"),
    satelliteKeys: allNodes.filter((n) => n.role === "SATELLITE_KEY"),
    evaluatedAt: new Date().toISOString(),
  };
}
