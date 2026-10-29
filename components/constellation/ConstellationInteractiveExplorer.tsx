"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  type SovereignConstellationNetwork,
  type ConstellationNode,
  type ConstellationEquilibriumResult,
  calculateConstellationEquilibrium,
} from "@/lib/pricing/financial-constellation-engine";

interface Props {
  initialNetwork: SovereignConstellationNetwork;
  initialMatrix: { node: ConstellationNode; equilibrium: ConstellationEquilibriumResult }[];
}

export default function ConstellationInteractiveExplorer({ initialNetwork, initialMatrix }: Props) {
  const [macroAnchorPrice, setMacroAnchorPrice] = useState<number>(
    initialNetwork.macroAnchor.currentFmv98 || 6000000
  );

  // Recalculate dynamic network state when anchor changes
  const simulatedAnchor = {
    ...initialNetwork.macroAnchor,
    currentFmv98: macroAnchorPrice,
  };

  const dynamicResults = initialMatrix.map(({ node }) => {
    if (node.canonicalId === "action-comics-1") {
      return {
        node: simulatedAnchor,
        equilibrium: {
          node: simulatedAnchor,
          anchorNode: null,
          equilibriumPrice98Usd: macroAnchorPrice,
          relativeScarcityMultiple: 1.0,
          relativeFandomMultiple: 1.0,
          networkImpulseDeltaPct: Number((((macroAnchorPrice - node.baselinePrice98) / node.baselinePrice98) * 100).toFixed(1)),
          isDecoupled: false,
          equilibriumStatus: "PRECISE_EQUILIBRIUM" as const,
        },
      };
    }

    const recomputed = calculateConstellationEquilibrium(node, simulatedAnchor);
    return {
      node,
      equilibrium: recomputed,
    };
  });

  const anchorChangePct = (
    ((macroAnchorPrice - initialNetwork.macroAnchor.baselinePrice98) /
      initialNetwork.macroAnchor.baselinePrice98) *
    100
  ).toFixed(1);

  return (
    <div className="space-y-8">
      {/* 1. THE SUPERMAN WINDOW INTERACTIVE RADAR CONTROLLER */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div>
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-amber-400">
              The Superman Window Simulation Engine
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide mt-1">
              Global Macro Gravitational Shockwave
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
              Slide to stress-test the market. When Action Comics #1 establishes an auction milestone, observe how its gravitational field transmits non-linear pricing elasticity through every dependent Silver Age key.
            </p>
          </div>

          <div className="bg-slate-950/80 rounded-xl p-4 border border-white/10 text-right min-w-[220px]">
            <span className="text-[10px] font-mono uppercase text-slate-400">Action Comics #1 Benchmark</span>
            <div className="text-2xl font-mono font-extrabold text-amber-400">
              ${macroAnchorPrice.toLocaleString()}
            </div>
            <div className="text-xs font-mono text-emerald-400 mt-0.5">
              +{anchorChangePct}% from 2014 Epoch
            </div>
          </div>
        </div>

        {/* Shock Slider */}
        <div className="pt-6 space-y-3">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">Macro Inception Floor: $1,000,000</span>
            <span className="text-amber-400 font-bold">Current Sim: ${macroAnchorPrice.toLocaleString()}</span>
            <span className="text-slate-400">Next Secular Frontier: $15,000,000</span>
          </div>

          <input
            type="range"
            min={1000000}
            max={15000000}
            step={250000}
            value={macroAnchorPrice}
            onChange={(e) => setMacroAnchorPrice(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            {[
              { label: "2014 Baseline", price: 3200000 },
              { label: "2021 Secular High", price: 4200000 },
              { label: "2024 Record Hammer", price: 6000000 },
              { label: "10-Year Macro Target", price: 10000000 },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => setMacroAnchorPrice(preset.price)}
                className={`py-1.5 px-3 rounded-lg text-xs font-mono transition-colors border ${
                  macroAnchorPrice === preset.price
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-slate-800/40 hover:bg-slate-800 text-slate-400 border-white/5"
                }`}
              >
                {preset.label} (${(preset.price / 1000000).toFixed(1)}M)
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. THE CELESTIAL CONSTELLATION NODES (GRID) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white tracking-wide">
            The Constellation Network Matrix
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {dynamicResults.length} Primary Celestial Instruments
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dynamicResults.map(({ node, equilibrium }) => {
            const isAnchor = node.role === "MACRO_RESERVE_ANCHOR";
            const impulsePositive = equilibrium.networkImpulseDeltaPct >= 0;

            return (
              <div
                key={node.canonicalId}
                className={`rounded-xl border p-5 flex flex-col justify-between transition-all duration-200 ${
                  isAnchor
                    ? "bg-gradient-to-b from-amber-950/30 via-slate-900 to-slate-950 border-amber-500/40 shadow-xl shadow-amber-500/10"
                    : "bg-slate-900/60 hover:bg-slate-900/90 border-white/10 hover:border-sky-500/30"
                }`}
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                        isAnchor
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          : node.role === "ERA_FLAGSHIP_ANCHOR"
                          ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                          : "bg-sky-500/20 text-sky-300 border-sky-500/30"
                      }`}
                    >
                      {node.role.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      {node.era}
                    </span>
                  </div>

                  {/* Title & Archetype */}
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center justify-between">
                      <span>{node.series} #{node.issue}</span>
                      <span className="text-xs font-mono text-slate-400 font-normal">
                        CGC 9.8
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                      {node.narrativeArchetype}
                    </p>
                  </div>

                  {/* Price & Equilibrium Output */}
                  <div className="bg-slate-950/60 rounded-lg p-3 border border-white/5 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-mono text-[10px]">Baseline (2014):</span>
                      <span className="text-slate-400 font-mono">${node.baselinePrice98.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-mono text-[11px]">C-Equilibrium:</span>
                      <span className="text-sm font-mono font-bold text-amber-400">
                        ${equilibrium.equilibriumPrice98Usd.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1 border-t border-white/5">
                      <span className="text-slate-500 font-mono text-[10px]">Impulse Delta:</span>
                      <span
                        className={`text-[11px] font-mono font-bold ${
                          impulsePositive ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {impulsePositive ? `+${equilibrium.networkImpulseDeltaPct}%` : `${equilibrium.networkImpulseDeltaPct}%`}
                      </span>
                    </div>
                  </div>

                  {/* Elasticity Metadata */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500">
                    <div>
                      <span>Coupling (ω): </span>
                      <span className="text-slate-300 font-bold">{node.couplingElasticity.toFixed(2)}</span>
                    </div>
                    <div>
                      <span>Fandom (F): </span>
                      <span className="text-slate-300 font-bold">{node.fandomIntensity.toFixed(1)}/100</span>
                    </div>
                  </div>
                </div>

                {/* Inspect Link */}
                <div className="pt-4 mt-2 border-t border-white/5">
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span className="text-slate-500 font-mono">
                      ψ: {node.idiosyncraticFactor.toFixed(2)}x
                    </span>
                    <span className="text-sky-400 font-semibold group-hover:underline">
                      Inspect Matrix →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. MATHEMATICAL INVARIANT MANIFESTO */}
      <div className="rounded-xl border border-white/10 bg-slate-900/40 p-6 space-y-4">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
          Financial Constellation Law: Proof of Non-Lockstep Equilibrium
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-400 leading-relaxed">
          <div className="space-y-1">
            <h5 className="font-semibold text-slate-200">1. Strict Dimensional Homogeneity</h5>
            <p>
              $P_{'{k,0}'}$ supplies the dollar denomination. Anchor, scarcity, and fandom terms operate as dimensionless multipliers, preventing the unit absurdity of raising USD to fractional powers.
            </p>
          </div>
          <div className="space-y-1">
            <h5 className="font-semibold text-slate-200">2. Bounded Network Coupling (ω &lt; 1.0)</h5>
            <p>
              A 100% appreciation in Action Comics #1 does not double the market. Through coupling exponents ($\omega \in [0.35, 0.58]$), satellite keys receive dampened, realistic liquidity impulses.
            </p>
          </div>
          <div className="space-y-1">
            <h5 className="font-semibold text-slate-200">3. The Artifact-IP Boundary Invariant</h5>
            <p>
              Physical comic valuation reflects unreplicable historical genesis document scarcity. Zero corporate media revenue or IP copyright dividends are received by artifact holders.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
