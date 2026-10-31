import type { Metadata } from "next";
import Link from "next/link";
import { getLiveConstellationNetwork, calculateConstellationEquilibrium } from "@/lib/pricing/financial-constellation-engine";
import ConstellationInteractiveExplorer from "@/components/constellation/ConstellationInteractiveExplorer";

export const metadata: Metadata = {
  title: "The Financial Constellation | Sovereign Comic Exchange",
  description: "The celestial gravitational map of sequential art equities. Cross-asset relative pricing, anchor elasticity, and network transmission anchored by Action Comics #1.",
};

export const revalidate = 300;

export default async function ConstellationPage() {
  const network = getLiveConstellationNetwork();
  
  // Pre-calculate baseline equilibrium for all nodes
  const allNodes = [network.macroAnchor, ...network.eraAnchors, ...network.satelliteKeys];
  const equilibriumMatrix = allNodes.map((node) => ({
    node,
    equilibrium: calculateConstellationEquilibrium(node),
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      {/* Top Ambient Glow */}
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-indigo-950/40 via-slate-950/80 to-slate-950 pt-10 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  C-THEORY PROTOCOL v3.9
                </span>
                <span className="text-xs font-mono text-slate-400">
                  MACRO TRANSMISSION RADAR
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                The Financial Constellation
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-3xl">
                The celestial relative-pricing matrix of sequential art. Demonstrating how the entire multi-billion-dollar sovereign comic market is gravitationally anchored by the 1938 inception of <span className="text-amber-400 font-semibold">Action Comics #1</span>.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/equities"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-colors"
              >
                ← Equities Exchange
              </Link>
              <Link
                href="/assets"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-lg shadow-amber-500/20"
              >
                CE70 Benchmark
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Radar & Celestial Map */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <ConstellationInteractiveExplorer
          initialNetwork={network}
          initialMatrix={equilibriumMatrix}
        />
      </div>
    </div>
  );
}
