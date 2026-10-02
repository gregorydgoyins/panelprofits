import Link from "next/link";
import Image from "next/image";
import { Boxes, ShieldCheck, Sparkles, Layers, SlidersHorizontal, ArrowUpRight } from "lucide-react";
import {
  CANONICAL_16_ASSET_FAMILIES,
  getCanonicalAssetSurfaces,
} from "@/lib/equity/canonical-equities";

export const dynamic = "force-dynamic";

export default async function AssetsPage() {
  const seats = await getCanonicalAssetSurfaces(70);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <header className="border-b border-slate-800 pb-7">
        <p className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.28em] text-cyan-400">
          <Boxes className="h-3.5 w-3.5" /> Asset Registry / 16 Canonical Collectible Families
        </p>
        <h1 className="mt-3 text-3xl sm:text-5xl font-black text-slate-100 tracking-tight">
          Comic Asset Classes & Constitutional Seats
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-400">
          Complete structural taxonomy governing the 16 Canonical Collectible Asset Classes alongside the 70 certified constitutional seats of the CE70 index.
        </p>
      </header>

      {/* 16 Canonical Collectible Asset Families */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Layers className="h-4 w-4 text-cyan-400" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-cyan-300">
            The 16 Canonical Collectible Asset Classes
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CANONICAL_16_ASSET_FAMILIES.map((family) => {
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
                className="group flex flex-col justify-between rounded-xl border border-slate-800 bg-[#070A11] p-4 transition-all hover:border-cyan-400/50 hover:bg-[#0B101D] shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-slate-900 border border-slate-700 px-2 py-0.5 text-[9px] font-mono font-bold text-slate-200">
                      {family.shortCode}
                    </span>
                    <span
                      className={`rounded border px-2 py-0.5 text-[8px] font-mono uppercase tracking-wider font-semibold ${tierColor}`}
                    >
                      {family.liquidityTier}
                    </span>
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-slate-100 group-hover:text-cyan-200 transition-colors">
                    {family.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {family.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Premium</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {family.pricingPremiumFactor}
                    </span>
                  </div>
                  <div className="mt-1 text-[10px] font-mono text-slate-500 truncate">
                    Role: {family.marketRole}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 70 Certified Constitutional Asset Seats */}
      <section>
        <div className="flex flex-col gap-2 border-b border-slate-800/80 pb-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <h2 className="text-base font-bold text-slate-100 tracking-wide">
                CE70 Certified Constitutional Asset Surfaces ({seats.length} Seats)
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Certified constitutional seats and underlying creative provenance.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Audit Authority: Panel Profits Canon
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {seats.map((seat) => (
            <Link
              key={seat.id}
              href={`/assets/${encodeURIComponent(seat.id)}`}
              className="group flex flex-col justify-between rounded-xl border border-slate-800 bg-[#070A11] p-4 transition-all hover:border-cyan-400/50 hover:bg-[#0B101D] shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 text-[9px] font-mono font-bold text-cyan-300">
                    SEAT #{seat.seatNumber}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    {seat.era} ERA
                  </span>
                </div>

                <div className="mt-3 flex gap-3">
                  <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded border border-slate-800 bg-[#04060A]">
                    {seat.coverUrl ? (
                      <Image
                        src={seat.coverUrl}
                        alt={seat.titleIssue}
                        fill
                        sizes="56px"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center font-mono text-xs text-cyan-400">
                        #{seat.seatNumber}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-200 transition-colors truncate">
                      {seat.series}
                    </h3>
                    <p className="text-xs font-mono text-slate-400">
                      #{seat.issueNumber} ({seat.year})
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500 line-clamp-1">
                      {seat.primaryCreators}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">Gregory Score</span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {seat.gregoryScore.toFixed(1)} / 200
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
