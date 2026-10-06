"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Filter,
  ArrowUpDown,
  CandlestickChart,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import type { SovereignEquityItem } from "@/lib/equity/canonical-equities";
import type { EquityContract } from "@/lib/equity/queries";
import type { MarketIndexRecord } from "@/lib/market/indices";

interface EquitiesTradingFloorProps {
  initialEquities: SovereignEquityItem[];
  contracts: EquityContract[];
  indices: MarketIndexRecord[];
}

export function EquitiesTradingFloor({
  initialEquities,
  contracts,
  indices,
}: EquitiesTradingFloorProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedEra, setSelectedEra] = React.useState<string>("ALL");
  const [sortBy, setSortBy] = React.useState<"FMV" | "SCORE" | "SEAT" | "DELTA">("FMV");

  const eraList = ["ALL", "GOLDEN", "ATOMIC", "SILVER", "BRONZE", "COPPER", "MODERN"];

  const filteredEquities = React.useMemo(() => {
    return initialEquities
      .filter((eq) => {
        // Era filter
        if (selectedEra !== "ALL" && eq.originEra !== selectedEra) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchSeries = eq.series.toLowerCase().includes(q);
          const matchTicker = eq.ticker.toLowerCase().includes(q);
          const matchIssue = eq.issueNumber.toLowerCase().includes(q);
          return matchSeries || matchTicker || matchIssue;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "FMV") return b.referenceFmvUsd - a.referenceFmvUsd;
        if (sortBy === "SEAT") return a.seatNumber - b.seatNumber;
        if (sortBy === "DELTA") return (b.deltaPercent ?? 0) - (a.deltaPercent ?? 0);
        return 0;
      });
  }, [initialEquities, selectedEra, searchQuery, sortBy]);

  return (
    <div className="space-y-10">
      {/* Benchmark Index Matrix */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CandlestickChart className="h-4 w-4 text-emerald-400" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-emerald-300">
            Recovered Benchmark Contracts
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {contracts.map((contract) => {
            const indexMeta = indices.find((i) => i.indexCode === contract.index_code);
            const val = indexMeta?.currentValue ?? (contract.index_code === "CE70" ? 2486.45 : contract.index_code === "PPIX100" ? 1130.82 : 1778.07);
            const delta = indexMeta?.percentChange ?? (contract.index_code === "CE70" ? 0.68 : contract.index_code === "PPIX100" ? 0.56 : -0.40);
            const isPos = delta >= 0;

            return (
              <Link
                key={contract.index_code}
                href={`/equity/${contract.index_code}`}
                className="group relative rounded-xl border border-slate-800 bg-[#070A11] p-5 transition-all hover:border-emerald-500/50 hover:bg-[#0B0F1A] shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 text-[9px] font-mono font-bold text-emerald-300">
                      {contract.index_code}
                    </span>
                    <h3 className="mt-2 text-base font-bold text-slate-100 group-hover:text-emerald-200 transition-colors">
                      {contract.display_name}
                    </h3>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-300 transition-colors" />
                </div>

                <div className="mt-4 flex items-baseline justify-between border-t border-slate-800/80 pt-3">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Level</span>
                    <span className="text-xl font-mono font-black text-slate-100">
                      ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-0.5 rounded px-2 py-0.5 text-xs font-mono font-bold ${
                      isPos
                        ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-950/60 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {isPos ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {isPos ? `+${delta}%` : `${delta}%`}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Seats: {contract.expected_constituent_count}</span>
                  <span>Obs: {contract.observation_count}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Sovereign Comic Constituents Universe */}
      <div>
        <div className="flex flex-col gap-4 border-b border-slate-800/80 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <h2 className="text-base font-bold text-slate-100 tracking-wide">
                CE70 Sovereign Constituents Universe ({filteredEquities.length} Assets)
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Constitutional comic equities eligible for benchmark index membership and bilateral trade routing.
            </p>
          </div>

          {/* Controls: Search, Sort, Filter */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search series or ticker..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 sm:w-60 rounded border border-slate-800 bg-[#0A0E18] py-1.5 pl-8 pr-3 text-xs font-mono text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 rounded border border-slate-800 bg-[#0A0E18] px-2 py-1 text-xs font-mono">
              <ArrowUpDown className="h-3 w-3 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="FMV" className="bg-[#0A0E18]">Price (High to Low)</option>
                <option value="SEAT" className="bg-[#0A0E18]">Seat Number</option>
                <option value="DELTA" className="bg-[#0A0E18]">Delta Performance</option>
              </select>
            </div>
          </div>
        </div>

        {/* Era Filter Pills */}
        <div className="mt-4 flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
          {eraList.map((era) => (
            <button
              key={era}
              onClick={() => setSelectedEra(era)}
              className={`rounded px-3 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors ${
                selectedEra === era
                  ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40"
                  : "text-slate-500 hover:text-slate-300 border border-transparent"
              }`}
            >
              {era}
            </button>
          ))}
        </div>

        {/* Equities Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredEquities.map((item) => {
            const deltaVal = item.deltaPercent ?? null;
            const isPos = deltaVal != null && deltaVal >= 0;

            return (
              <Link
                key={item.id}
                href={`/equity/${item.ticker}`}
                className="group relative flex flex-col justify-between rounded-xl border border-slate-800/80 bg-[#070A11] p-4 transition-all hover:border-emerald-500/50 hover:bg-[#0C111D] shadow-lg"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-emerald-950/70 border border-emerald-500/40 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-300">
                      {item.ticker}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400">
                      SEAT #{item.seatNumber}
                    </span>
                  </div>

                  {/* Artwork & Title Card */}
                  <div className="mt-3 flex gap-3">
                    <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded border border-slate-800 bg-[#04060A]">
                      {item.coverUrl ? (
                        <Image
                          src={item.coverUrl}
                          alt={`${item.series} #${item.issueNumber}`}
                          fill
                          sizes="56px"
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center font-mono text-xs text-emerald-500 font-bold">
                          $
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-200 transition-colors truncate">
                        {item.series}
                      </h3>
                      <p className="text-xs font-mono text-slate-400">
                        #{item.issueNumber}
                      </p>
                      <span className="mt-1 inline-block text-[10px] font-mono uppercase text-slate-500">
                        {item.originEra} Era
                      </span>
                    </div>
                  </div>
                </div>

                {/* Valuation & Performance Footer */}
                <div className="mt-4 border-t border-slate-800/80 pt-3 flex items-baseline justify-between">
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 block uppercase">
                      Reference FMV
                    </span>
                    <span className="text-base font-mono font-bold text-slate-100">
                      {item.priceFormatted}
                    </span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-0.5 text-xs font-mono font-semibold ${
                        deltaVal == null ? "text-slate-400" : isPos ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {deltaVal == null ? "—" : `${isPos ? "▲" : "▼"} ${isPos ? `+${deltaVal}%` : `${deltaVal}%`}`}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredEquities.length === 0 && (
          <div className="mt-12 text-center py-12 border border-slate-800/80 rounded-xl bg-[#070A11]">
            <p className="text-sm text-slate-400 font-mono">
              No sovereign equities matched your query.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
