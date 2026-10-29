import React from "react";
import { ShieldCheck, TrendingUp, Landmark, AlertTriangle } from "lucide-react";

export interface FirmStrategyProfile {
  firmId: string;
  firmName: string;
  aumUsd: number;
  strategyMandate: "MACRO_ANCHOR_RESERVE" | "ARBITRAGE_ALPHA" | "CROSS_ASSET_BALANCED" | "CUSTODIAL_SETTLEMENT" | "SPECIAL_SITUATIONS";
  anchorAllocationPct: number;
  satelliteAllocationPct: number;
  decoupledAlphaAllocationPct: number;
  targetCouplingRange: string;
  riskTolerance: "CONSERVATIVE" | "MODERATE" | "AGGRESSIVE" | "INSTITUTIONAL_FIDUCIARY";
  keyHoldings: { title: string; role: string; allocationUsd: number }[];
  regulatoryCapitalCoverageRatio: number;
}

export const CANONICAL_FIRM_STRATEGIES: Record<string, FirmStrategyProfile> = {
  calmonte: {
    firmId: "calmonte",
    firmName: "Calmonte Asset Management",
    aumUsd: 120000000000,
    strategyMandate: "MACRO_ANCHOR_RESERVE",
    anchorAllocationPct: 65.0,
    satelliteAllocationPct: 25.0,
    decoupledAlphaAllocationPct: 10.0,
    targetCouplingRange: "High (ω > 0.50)",
    riskTolerance: "INSTITUTIONAL_FIDUCIARY",
    keyHoldings: [
      { title: "Action Comics #1 (CGC 9.0)", role: "Macro Reserve Anchor", allocationUsd: 48000000000 },
      { title: "Detective Comics #27 (CGC 8.5)", role: "Golden Flagship Anchor", allocationUsd: 30000000000 },
      { title: "Fantastic Four #1 (CGC 9.4)", role: "Silver IP Anchor", allocationUsd: 22000000000 },
    ],
    regulatoryCapitalCoverageRatio: 285.0,
  },
  holtercroft: {
    firmId: "holtercroft",
    firmName: "Holtercroft Advisory Partners",
    aumUsd: 71000000000,
    strategyMandate: "CROSS_ASSET_BALANCED",
    anchorAllocationPct: 45.0,
    satelliteAllocationPct: 40.0,
    decoupledAlphaAllocationPct: 15.0,
    targetCouplingRange: "Moderate (0.35 < ω < 0.55)",
    riskTolerance: "CONSERVATIVE",
    keyHoldings: [
      { title: "Amazing Fantasy #15 (CGC 9.6)", role: "Satellite Core", allocationUsd: 18000000000 },
      { title: "Fantastic Four #1 (CGC 9.0)", role: "Silver IP Anchor", allocationUsd: 14000000000 },
      { title: "X-Men #1 (CGC 9.2)", role: "Satellite Parable Core", allocationUsd: 12000000000 },
    ],
    regulatoryCapitalCoverageRatio: 220.0,
  },
  sestriere: {
    firmId: "sestriere",
    firmName: "Sestrière National Markets",
    aumUsd: 45000000000,
    strategyMandate: "SPECIAL_SITUATIONS",
    anchorAllocationPct: 30.0,
    satelliteAllocationPct: 50.0,
    decoupledAlphaAllocationPct: 20.0,
    targetCouplingRange: "Dynamic Elasticity",
    riskTolerance: "MODERATE",
    keyHoldings: [
      { title: "Tales of Suspense #39 (CGC 9.2)", role: "Industrial Alpha", allocationUsd: 11000000000 },
      { title: "Avengers #1 (CGC 9.4)", role: "Syndicate Synergy", allocationUsd: 9500000000 },
      { title: "Journey Into Mystery #83 (CGC 9.2)", role: "Mythos Core", allocationUsd: 7500000000 },
    ],
    regulatoryCapitalCoverageRatio: 180.0,
  },
  khamsin: {
    firmId: "khamsin",
    firmName: "Khamsin Custodial Services",
    aumUsd: 38000000000,
    strategyMandate: "CUSTODIAL_SETTLEMENT",
    anchorAllocationPct: 75.0,
    satelliteAllocationPct: 20.0,
    decoupledAlphaAllocationPct: 5.0,
    targetCouplingRange: "Pure Inception Anchors",
    riskTolerance: "INSTITUTIONAL_FIDUCIARY",
    keyHoldings: [
      { title: "Action Comics #1 Vault Custody", role: "Physical Custody Reserve", allocationUsd: 22000000000 },
      { title: "Detective Comics #27 Vault Custody", role: "Physical Custody Reserve", allocationUsd: 10500000000 },
    ],
    regulatoryCapitalCoverageRatio: 340.0,
  },
  arnveld: {
    firmId: "arnveld",
    firmName: "Arnveld Capital Management Group",
    aumUsd: 24000000000,
    strategyMandate: "ARBITRAGE_ALPHA",
    anchorAllocationPct: 15.0,
    satelliteAllocationPct: 45.0,
    decoupledAlphaAllocationPct: 40.0,
    targetCouplingRange: "Asymmetric Dislocation (ψ > 1.2)",
    riskTolerance: "AGGRESSIVE",
    keyHoldings: [
      { title: "Raw-to-9.8 Silver Age Spread Book", role: "Grading Arbitrage", allocationUsd: 8500000000 },
      { title: "Amazing Fantasy #15 Speculative Float", role: "Liquidity Squeeze", allocationUsd: 6200000000 },
    ],
    regulatoryCapitalCoverageRatio: 145.0,
  },
};

export default function FirmConstellationStrategyDesk({ firmId }: { firmId: string }) {
  const strategy = CANONICAL_FIRM_STRATEGIES[firmId.toLowerCase()] || {
    firmId,
    firmName: "Institutional Syndicate",
    aumUsd: 10000000000,
    strategyMandate: "CROSS_ASSET_BALANCED",
    anchorAllocationPct: 40.0,
    satelliteAllocationPct: 40.0,
    decoupledAlphaAllocationPct: 20.0,
    targetCouplingRange: "Standard Neutral",
    riskTolerance: "MODERATE",
    keyHoldings: [
      { title: "Silver Age Core Equities", role: "Satellite Portfolio", allocationUsd: 4000000000 },
      { title: "Golden Age Inception Assets", role: "Anchor Hedge", allocationUsd: 4000000000 },
    ],
    regulatoryCapitalCoverageRatio: 190.0,
  };

  return (
    <section className="mt-8 border border-white/10 bg-[#0b0f15] p-6 rounded-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Landmark className="h-4 w-4 text-amber-400" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
              Institutional Mandate
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide mt-1">
            Financial Constellation Capital Allocation
          </h2>
          <p className="text-xs text-slate-400">
            Fiduciary balance sheet positioning and network transmission exposure across celestial anchors and satellite keys.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-white/10">
            Coverage Ratio: {strategy.regulatoryCapitalCoverageRatio}%
          </span>
        </div>
      </div>

      {/* THREE ALLOCATION PILLARS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-950/60 p-4 rounded-lg border border-white/5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Macro Anchors (Action / Detective)</span>
            <span className="text-amber-400 font-mono font-bold">{strategy.anchorAllocationPct}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${strategy.anchorAllocationPct}%` }} />
          </div>
          <p className="text-[10px] text-slate-500">
            Reserve capital absorbing secular monetary inflation.
          </p>
        </div>

        <div className="bg-slate-950/60 p-4 rounded-lg border border-white/5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Satellite Keys (AF15 / FF1 / X-Men)</span>
            <span className="text-sky-400 font-mono font-bold">{strategy.satelliteAllocationPct}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-sky-500 h-full rounded-full" style={{ width: `${strategy.satelliteAllocationPct}%` }} />
          </div>
          <p className="text-[10px] text-slate-500">
            Transmedia franchise velocity and high-elasticity appreciation.
          </p>
        </div>

        <div className="bg-slate-950/60 p-4 rounded-lg border border-white/5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Decoupled Alpha / Arbitrage</span>
            <span className="text-purple-400 font-mono font-bold">{strategy.decoupledAlphaAllocationPct}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${strategy.decoupledAlphaAllocationPct}%` }} />
          </div>
          <p className="text-[10px] text-slate-500">
            Raw-to-graded spreads and idiosyncratic float dislocation.
          </p>
        </div>
      </div>

      {/* CORE STRATEGIC HOLDINGS TABLE */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
          Core Constellation Holdings & Book Value
        </h3>
        <div className="divide-y divide-white/5 rounded-lg border border-white/5 overflow-hidden">
          {strategy.keyHoldings.map((holding, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-950/40 text-xs">
              <div>
                <span className="font-semibold text-slate-200">{holding.title}</span>
                <span className="block text-[10px] text-slate-500">{holding.role}</span>
              </div>
              <div className="text-right font-mono">
                <span className="text-amber-400 font-bold">
                  ${(holding.allocationUsd / 1000000000).toFixed(1)} Billion
                </span>
                <span className="block text-[10px] text-slate-500">
                  {((holding.allocationUsd / strategy.aumUsd) * 100).toFixed(1)}% of AUM
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
