"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Layers,
  ShieldCheck,
  Clock,
  Sparkles,
  Boxes,
  Compass,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  type UniverseMode,
  type FeaturedComicConstituent,
  type FeaturedAssetConstituent,
  type CPICategory,
  getCE70Constituents,
  getPPIX100Constituents,
  GOCOLLECT_CPI_CATEGORIES,
  getPPIXCompositeAssets,
} from "@/lib/dashboard/featured-universe-data";

interface FeaturedComicUniverseProps {
  comics?: any[];
}

export function FeaturedComicUniverse({ comics }: FeaturedComicUniverseProps) {
  const [mode, setMode] = React.useState<UniverseMode>("ce70");
  const [selectedEra, setSelectedEra] = React.useState<string | null>(null);
  const [selectedCPICode, setSelectedCPICode] = React.useState<string>("GC_CPI_GOLDEN");
  const [selectedAssetType, setSelectedAssetType] = React.useState<string | null>(null);
  const [expanded, setExpanded] = React.useState<boolean>(false);

  // Memoized data sources
  const ce70Items = React.useMemo(() => getCE70Constituents(), []);
  const ppix100Items = React.useMemo(() => getPPIX100Constituents(), []);
  const cpiCategories = React.useMemo(() => GOCOLLECT_CPI_CATEGORIES, []);
  const compositeAssets = React.useMemo(() => getPPIXCompositeAssets(), []);

  // Filtered lists based on current mode
  const currentCE70 = React.useMemo(() => {
    if (!selectedEra) return ce70Items;
    return ce70Items.filter((i) => i.era.toLowerCase().includes(selectedEra.toLowerCase()));
  }, [ce70Items, selectedEra]);

  const currentPPIX = React.useMemo(() => {
    if (!selectedEra) return ppix100Items;
    return ppix100Items.filter((i) => i.era.toLowerCase().includes(selectedEra.toLowerCase()));
  }, [ppix100Items, selectedEra]);

  const currentCPICategory = React.useMemo(() => {
    return cpiCategories.find((c) => c.code === selectedCPICode) || cpiCategories[0];
  }, [cpiCategories, selectedCPICode]);

  const currentAssets = React.useMemo(() => {
    if (!selectedAssetType) return compositeAssets;
    if (selectedAssetType === "WEAPON") {
      return compositeAssets.filter((a) => a.assetType === "GADGET" || a.assetType === "WEAPON");
    }
    if (selectedAssetType === "LOCATION") {
      return compositeAssets.filter((a) => a.assetType === "LOCATION");
    }
    if (selectedAssetType === "REALITY") {
      return compositeAssets.filter((a) => a.assetType === "REALITY");
    }
    if (selectedAssetType === "BOND") {
      return compositeAssets.filter((a) => a.assetType === "MUNICIPAL_BOND" || a.assetType === "CREDIT_SWAP");
    }
    if (selectedAssetType === "CREATOR") {
      return compositeAssets.filter((a) => a.assetType === "CREATOR_INDEX");
    }
    if (selectedAssetType === "STOCK") {
      return compositeAssets.filter((a) => a.assetType === "PUBLISHER_STOCK");
    }
    return compositeAssets;
  }, [compositeAssets, selectedAssetType]);

  // Display counts and slice
  const displayLimit = expanded ? 200 : 18;

  return (
    <section className="rounded-xl border border-slate-800/90 bg-[#0B0D14] p-5 sm:p-6 shadow-2xl transition-all">
      {/* ── Mode Navigation Tabs ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-100 tracking-wide uppercase">
              FEATURED MARKET UNIVERSES
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Four authoritative market lenses: Blue-Chip Equities, Broad Multi-Era Pulse, Weekly CPI, and Multi-Asset Derivatives.
          </p>
        </div>

        {/* 4 Mode Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#060810] p-1.5 rounded-lg border border-slate-800 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => { setMode("ce70"); setExpanded(false); }}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all flex flex-col items-center ${
              mode === "ce70"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>CE70 Blue Chip</span>
            <span className="text-[10px] font-mono text-cyan-400">2,518.03 pts</span>
          </button>

          <button
            type="button"
            onClick={() => { setMode("ppix100"); setExpanded(false); }}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all flex flex-col items-center ${
              mode === "ppix100"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>PPIX 100 Pulse</span>
            <span className="text-[10px] font-mono text-emerald-400">1,130.82 pts</span>
          </button>

          <button
            type="button"
            onClick={() => { setMode("cpi"); setExpanded(false); }}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all flex flex-col items-center ${
              mode === "cpi"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>GoCollect CPI</span>
            <span className="text-[10px] font-mono text-amber-400">1,428.50 pts</span>
          </button>

          <button
            type="button"
            onClick={() => { setMode("assets"); setExpanded(false); }}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all flex flex-col items-center ${
              mode === "assets"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>PPIX Assets</span>
            <span className="text-[10px] font-mono text-purple-400">1,842.15 pts</span>
          </button>
        </div>
      </div>

      {/* ── Subheader & Controls Bar ── */}
      {mode === "ce70" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#070A12] border border-cyan-500/20 p-3 rounded-lg mb-6">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 uppercase">
              CE70 CONSTITUTIONAL
            </span>
            <span className="text-xs text-slate-300">
              Barometer of blue-chip comic equity movement (70 seats). Index value: <strong className="text-cyan-400 font-mono">2,518.03 pts</strong> (not dollars).
            </span>
          </div>

          {/* Era Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
            {["ALL", "GOLDEN", "SILVER", "BRONZE", "COPPER", "MODERN"].map((era) => (
              <button
                key={era}
                type="button"
                onClick={() => setSelectedEra(era === "ALL" ? null : era)}
                className={`px-2 py-0.5 rounded border text-[10px] font-mono transition-colors ${
                  (era === "ALL" && !selectedEra) || selectedEra === era
                    ? "bg-cyan-500 text-slate-950 border-cyan-400 font-bold"
                    : "border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {era}
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === "ppix100" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#060D12] border border-emerald-500/20 p-3 rounded-lg mb-6">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 uppercase">
              PPIX 100 BENCHMARK
            </span>
            <span className="text-xs text-slate-300">
              Broad multi-era pulse tracking 100 landmark issues across all eras and tiers: <strong className="text-emerald-400 font-mono">1,130.82 pts</strong>.
            </span>
          </div>

          {/* Era Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
            {["ALL", "GOLDEN", "SILVER", "BRONZE", "COPPER", "MODERN"].map((era) => (
              <button
                key={era}
                type="button"
                onClick={() => setSelectedEra(era === "ALL" ? null : era)}
                className={`px-2 py-0.5 rounded border text-[10px] font-mono transition-colors ${
                  (era === "ALL" && !selectedEra) || selectedEra === era
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 font-bold"
                    : "border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {era}
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === "cpi" && (
        <div className="space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#0F0D07] border border-amber-500/30 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40 uppercase">
                GOCOLLECT CPI BENCHMARK
              </span>
              <span className="text-xs text-slate-300">
                Official market index. Checked every Monday · Official weekly updates every Wednesday.
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/20">
              <Clock className="h-3 w-3" />
              <span>Next Weekly Update: Wednesday</span>
            </div>
          </div>

          {/* 6 CPI Category Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {cpiCategories.map((cat) => {
              const active = cat.code === selectedCPICode;
              return (
                <button
                  key={cat.code}
                  type="button"
                  onClick={() => setSelectedCPICode(cat.code)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    active
                      ? "bg-amber-950/40 border-amber-500/60 shadow-md"
                      : "bg-[#070912] border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="text-[10px] font-mono uppercase text-slate-400 truncate">{cat.name}</div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-xs font-mono font-bold text-amber-300">
                      {cat.indexPoints.toFixed(1)} pts
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">Div: {cat.divisor}</span>
                  </div>
                  <div className="mt-1 text-[9px] text-slate-500 truncate">{cat.qualifyingGrades}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {mode === "assets" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0C0712] border border-purple-500/30 p-3 rounded-lg mb-6">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-500/40 uppercase">
              PPIX COMPOSITE ASSETS
            </span>
            <span className="text-xs text-slate-300">
              The derivative surface: Artifacts, Sanctuaries, Municipal Bonds, Swaps, Creator Indices, and Publisher Equities (<strong className="text-purple-400 font-mono">1,842.15 pts</strong>).
            </span>
          </div>

          {/* Asset Type Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
            {[
              { label: "ALL", value: null },
              { label: "WEAPONS", value: "WEAPON" },
              { label: "SANCTUARIES", value: "LOCATION" },
              { label: "REALITIES", value: "REALITY" },
              { label: "BONDS & SWAPS", value: "BOND" },
              { label: "CREATORS", value: "CREATOR" },
              { label: "STOCKS", value: "STOCK" },
            ].map((f) => (
              <button
                key={f.label}
                type="button"
                onClick={() => setSelectedAssetType(f.value)}
                className={`px-2 py-0.5 rounded border text-[10px] font-mono transition-colors ${
                  selectedAssetType === f.value
                    ? "bg-purple-500 text-slate-950 border-purple-400 font-bold"
                    : "border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Mode 1: CE70 Grid ── */}
      {mode === "ce70" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {currentCE70.slice(0, displayLimit).map((comic) => (
            <Link
              key={comic.id}
              href={comic.detailUrl}
              className="group flex flex-col rounded-lg border border-slate-800/90 bg-[#0E111B] p-2.5 transition-all hover:border-cyan-500/60 hover:bg-[#141826] focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded border border-slate-800 bg-[#07080C] mb-2">
                <Image
                  src={comic.coverUrl || "/covers/action_comics_1.jpg"}
                  alt={comic.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 16vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized={Boolean(comic.coverUrl && comic.coverUrl.endsWith(".svg"))}
                />
                <span className="absolute top-1 left-1 bg-cyan-950/90 border border-cyan-500/40 text-[9px] font-mono font-bold text-cyan-300 px-1 rounded">
                  {comic.badge}
                </span>
              </div>

              <div className="flex-1 space-y-1 text-xs">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="truncate max-w-[85px]">{comic.publisher}</span>
                  <span>{comic.year}</span>
                </div>
                <h3 className="line-clamp-1 text-slate-100 font-medium group-hover:text-cyan-300 transition-colors">
                  {comic.series}
                </h3>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">#{comic.issueNumber}</span>
                  <span className="text-[10px] font-mono text-cyan-400/80">Grade {comic.referenceGrade}</span>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-[10px] text-slate-500">REF FMV</span>
                <span className="text-emerald-400 font-mono font-semibold">{comic.formattedFmv}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ── Mode 2: PPIX 100 Grid ── */}
      {mode === "ppix100" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {currentPPIX.slice(0, displayLimit).map((comic) => (
            <Link
              key={comic.id}
              href={comic.detailUrl}
              className="group flex flex-col rounded-lg border border-slate-800/90 bg-[#0E111B] p-2.5 transition-all hover:border-emerald-500/60 hover:bg-[#141826] focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded border border-slate-800 bg-[#07080C] mb-2">
                <Image
                  src={comic.coverUrl || "/covers/action_comics_1.jpg"}
                  alt={comic.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 16vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized={Boolean(comic.coverUrl && comic.coverUrl.endsWith(".svg"))}
                />
                <span className="absolute top-1 left-1 bg-emerald-950/90 border border-emerald-500/40 text-[9px] font-mono font-bold text-emerald-300 px-1 rounded">
                  {comic.badge}
                </span>
              </div>

              <div className="flex-1 space-y-1 text-xs">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="truncate max-w-[85px]">{comic.publisher}</span>
                  <span>{comic.year}</span>
                </div>
                <h3 className="line-clamp-1 text-slate-100 font-medium group-hover:text-emerald-300 transition-colors">
                  {comic.series}
                </h3>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">#{comic.issueNumber}</span>
                  <span className="text-[10px] font-mono text-emerald-400/80">Grade {comic.referenceGrade}</span>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-[10px] text-slate-500">PULSE FMV</span>
                <span className="text-emerald-400 font-mono font-semibold">{comic.formattedFmv}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ── Mode 3: GoCollect CPI Basket ── */}
      {mode === "cpi" && (
        <div className="space-y-4">
          <div className="border border-slate-800 bg-[#070912] p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-amber-300">{currentCPICategory.name} Basket</h3>
              <p className="text-xs text-slate-400">
                Formula: Sum of contributing certified sales points ÷ Divisor ({currentCPICategory.divisor}).
                Grades: {currentCPICategory.qualifyingGrades} · Sales lookback: {currentCPICategory.salesLookback}.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase">Effective Index Level</span>
              <div className="text-xl font-mono font-bold text-amber-400">
                {currentCPICategory.indexPoints.toFixed(2)} pts
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {currentCPICategory.constituents.map((book) => (
              <Link
                key={book.id}
                href={book.detailUrl}
                className="group flex flex-col rounded-lg border border-slate-800/90 bg-[#0E111B] p-3 transition-all hover:border-amber-500/60 hover:bg-[#141826]"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded border border-slate-800 bg-[#07080C] mb-2.5">
                  <Image
                    src={book.coverUrl || "/covers/action_comics_1.jpg"}
                    alt={book.comicName}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized={Boolean(book.coverUrl && book.coverUrl.endsWith(".svg"))}
                  />
                  <span className="absolute top-1.5 left-1.5 bg-amber-950/90 border border-amber-500/40 text-[9px] font-mono font-bold text-amber-300 px-1.5 py-0.5 rounded">
                    Weight {book.impliedWeight}
                  </span>
                </div>

                <div className="flex-1 space-y-1">
                  <div className="text-[10px] text-slate-400">{book.publisher} · {book.year}</div>
                  <h4 className="text-xs font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">
                    {book.comicName}
                  </h4>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-500">CPI Points</span>
                  <span className="text-amber-400 font-mono font-bold">{book.totalPoints.toFixed(1)} pts</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Mode 4: PPIX Composite Assets ── */}
      {mode === "assets" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {currentAssets.slice(0, displayLimit).map((asset) => (
            <Link
              key={asset.id}
              href={asset.detailUrl}
              className="group flex flex-col rounded-lg border border-slate-800/90 bg-[#0E111B] p-2.5 transition-all hover:border-purple-500/60 hover:bg-[#141826] focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded border border-slate-800 bg-[#07080C] mb-2">
                <Image
                  src={asset.coverUrl}
                  alt={asset.displayName}
                  fill
                  sizes="(max-width: 768px) 50vw, 16vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-1 left-1 bg-purple-950/90 border border-purple-500/40 text-[9px] font-mono font-bold text-purple-300 px-1 rounded">
                  {asset.symbol}
                </span>
                <span className="absolute bottom-1 right-1 bg-slate-950/80 text-[8px] font-mono text-slate-300 px-1 rounded border border-slate-800">
                  {asset.assetType}
                </span>
              </div>

              <div className="flex-1 space-y-1 text-xs">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="truncate max-w-[85px]">{asset.universe}</span>
                  <span className={asset.deltaPercent >= 0 ? "text-emerald-400 font-mono" : "text-rose-400 font-mono"}>
                    {asset.deltaPercent >= 0 ? `+${asset.deltaPercent.toFixed(2)}%` : `${asset.deltaPercent.toFixed(2)}%`}
                  </span>
                </div>
                <h3 className="line-clamp-1 text-slate-100 font-medium group-hover:text-purple-300 transition-colors">
                  {asset.displayName}
                </h3>
                <p className="line-clamp-1 text-[10px] text-slate-500">
                  {asset.description}
                </p>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-[10px] text-slate-500 uppercase">{asset.priceLabel}</span>
                <span className="text-purple-300 font-mono font-semibold">{asset.priceFormatted}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ── Footer Expand / View All Controls ── */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-400">
          {mode === "ce70" && `Showing ${Math.min(currentCE70.length, displayLimit)} of 70 Constitutional Seats`}
          {mode === "ppix100" && `Showing ${Math.min(currentPPIX.length, displayLimit)} of 100 Multi-Era Benchmark Issues`}
          {mode === "cpi" && `Showing ${currentCPICategory.constituents.length} Constituents for ${currentCPICategory.name}`}
          {mode === "assets" && `Showing ${Math.min(currentAssets.length, displayLimit)} of ${compositeAssets.length} Alternative Derivatives`}
        </div>

        <div className="flex items-center gap-3">
          {(mode === "ce70" || mode === "ppix100" || mode === "assets") && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1.5 rounded border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-500 hover:bg-slate-800 transition-colors"
            >
              {expanded ? (
                <>
                  <span>Show Fewer</span>
                  <ChevronUp className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  <span>Expand All ({mode === "ce70" ? 70 : mode === "ppix100" ? 100 : compositeAssets.length})</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          )}

          <Link
            href={mode === "assets" ? "/assets" : "/comics"}
            className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>Explore Entire Master Catalog</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
