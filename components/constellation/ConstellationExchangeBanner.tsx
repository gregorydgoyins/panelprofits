import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Compass } from "lucide-react";
import { CANONICAL_CONSTELLATION_NODES } from "@/lib/pricing/financial-constellation-engine";

export default function ConstellationExchangeBanner() {
  const action1 = CANONICAL_CONSTELLATION_NODES["action-comics-1"];
  const ff1 = CANONICAL_CONSTELLATION_NODES["fantastic-four-1"];
  const af15 = CANONICAL_CONSTELLATION_NODES["amazing-fantasy-15"];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 p-5 sm:p-6 shadow-xl backdrop-blur-md">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Sparkles className="h-3 w-3 mr-1" /> C-Theory Macro Radar
            </span>
            <span className="text-xs font-mono text-slate-400">
              The Celestial Gravitational Matrix
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
            The Superman Window: Anchor-to-Satellite Relative Pricing
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Every sovereign equity on this floor is gravitationally linked to the 1938 inception of <span className="text-amber-400 font-semibold">Action Comics #1</span> ($6.0M apex). High-elasticity Silver and Bronze Age keys adjust non-linearly to anchor liquidity shocks.
          </p>
        </div>

        {/* Live Constellation Quick Coordinates */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-950/80 rounded-xl px-3.5 py-2 border border-white/10 text-xs font-mono">
            <span className="text-[10px] text-slate-500 uppercase block">Macro Anchor</span>
            <span className="text-amber-400 font-bold">Action #1: $6.0M</span>
          </div>

          <div className="bg-slate-950/80 rounded-xl px-3.5 py-2 border border-white/10 text-xs font-mono">
            <span className="text-[10px] text-slate-500 uppercase block">Silver Flagship</span>
            <span className="text-purple-400 font-bold">FF #1: $1.85M</span>
          </div>

          <div className="bg-slate-950/80 rounded-xl px-3.5 py-2 border border-white/10 text-xs font-mono">
            <span className="text-[10px] text-slate-500 uppercase block">Urban Street Apex</span>
            <span className="text-sky-400 font-bold">AF #15: $3.6M</span>
          </div>

          <Link
            href="/constellation"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-lg shadow-amber-500/20 whitespace-nowrap"
          >
            <Compass className="h-4 w-4" /> Open Constellation Radar <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
