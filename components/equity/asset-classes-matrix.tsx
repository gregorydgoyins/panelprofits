"use client";

import * as React from "react";
import { Boxes, ShieldCheck, Sparkles, Layers, ArrowUpRight, Filter } from "lucide-react";
import {
  CANONICAL_16_ASSET_FAMILIES,
  type CollectibleAssetFamily,
} from "@/lib/equity/asset-families";

interface AssetClassesMatrixProps {
  series: string;
  issueNumber: string;
  baseFmv: number;
}

export function AssetClassesMatrix({ series, issueNumber, baseFmv }: AssetClassesMatrixProps) {
  const [selectedTier, setSelectedTier] = React.useState<string>("ALL");

  // Multiplier mapping for the 16 classes relative to baseline 9.8 Universal Slab (SOV)
  const multipliers: Record<string, { factor: number; text: string }> = {
    GRADED_UNIVERSAL: { factor: 1.0, text: "1.00x Base" },
    SIGNATURE_SERIES: { factor: 1.5, text: "1.50x Premium" },
    PEDIGREE_PROVENANCE: { factor: 3.0, text: "3.00x Historical Grail" },
    NEWSSTAND_EDITION: { factor: 1.35, text: "1.35x Scarcity" },
    PRICE_VARIANT: { factor: 2.5, text: "2.50x Asymmetry" },
    RATIO_INCENTIVE_VARIANT: { factor: 1.75, text: "1.75x Allocation" },
    RAW_UNGRADED: { factor: 0.35, text: "0.35x Arbitrage Base" },
    COVER_ART_VARIANT: { factor: 1.25, text: "1.25x Aesthetic" },
    DIRECT_EDITION: { factor: 1.0, text: "1.00x Standard Float" },
    QUALIFIED_LABEL: { factor: 0.5, text: "0.50x Qualified" },
    RESTORED_LABEL: { factor: 0.4, text: "0.40x Conservation" },
    CONSERVED_LABEL: { factor: 0.7, text: "0.70x Archival" },
    SUBSEQUENT_PRINTING: { factor: 0.65, text: "0.65x Repress" },
    FOREIGN_TRANSLATION: { factor: 0.8, text: "0.80x Global" },
    ERROR_PRINTING: { factor: 2.0, text: "2.00x Manufacturing Error" },
    PROTOTYPE_ASHCAN: { factor: 4.0, text: "4.00x Pre-Publication" },
  };

  const filteredFamilies = React.useMemo(() => {
    if (selectedTier === "ALL") return CANONICAL_16_ASSET_FAMILIES;
    return CANONICAL_16_ASSET_FAMILIES.filter((f) => f.liquidityTier === selectedTier);
  }, [selectedTier]);

  return (
    <div className="rounded-lg border border-slate-800 bg-[#070A11] p-6 shadow-2xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="h-4 w-4 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100 tracking-wide">
              16 Canonical Collectible Asset Classes Matrix
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Valuation parity across physical collectible manifestations for {series} #{issueNumber}.
          </p>
        </div>

        {/* Tier Filter */}
        <div className="flex items-center gap-1 rounded border border-slate-800 bg-[#0B0F1A] p-0.5">
          {["ALL", "HIGH", "MEDIUM", "SPECIALIZED", "INSTITUTIONAL"].map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`rounded px-2 py-1 text-[9px] font-mono uppercase tracking-wider transition-colors ${
                selectedTier === tier
                  ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of 16 Asset Classes */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {filteredFamilies.map((family) => {
          const mult = multipliers[family.id] || { factor: 1.0, text: "1.00x" };
          const estimatedValue = Math.round(baseFmv * mult.factor);

          const tierColor =
            family.liquidityTier === "HIGH"
              ? "text-emerald-400 border-emerald-500/30 bg-emerald-950/40"
              : family.liquidityTier === "INSTITUTIONAL"
              ? "text-purple-300 border-purple-500/30 bg-purple-950/40"
              : family.liquidityTier === "MEDIUM"
              ? "text-cyan-300 border-cyan-500/30 bg-cyan-950/40"
              : "text-amber-300 border-amber-500/30 bg-amber-950/40";

          return (
            <div
              key={family.id}
              className="group flex flex-col justify-between rounded-md border border-slate-800/80 bg-[#0A0E18] p-3.5 transition-all hover:border-cyan-400/50 hover:bg-[#0F1524]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded bg-slate-900 border border-slate-700 px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-200">
                    {family.shortCode}
                  </span>
                  <span
                    className={`rounded border px-1.5 py-0.2 text-[8px] font-mono uppercase tracking-wider font-semibold ${tierColor}`}
                  >
                    {family.liquidityTier}
                  </span>
                </div>

                <h3 className="mt-2 text-xs font-bold text-slate-100 group-hover:text-cyan-200 transition-colors">
                  {family.name}
                </h3>
                <p className="mt-1 text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                  {family.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60">
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] font-mono text-slate-500">{mult.text}</span>
                  <span className="text-xs font-mono font-bold text-emerald-300">
                    ${estimatedValue.toLocaleString()}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[9px] font-mono text-slate-500">
                  <span>Role: {family.marketRole}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
