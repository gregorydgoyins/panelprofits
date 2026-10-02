"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ShieldCheck,
  Award,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Layers,
  Share2,
  BookmarkPlus,
  Compass,
  BookOpen,
  DollarSign,
  Activity,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import type { DetailedSovereignEquityDossier } from "@/lib/equity/canonical-equities";
import { EquityCandlestickChart } from "./equity-candlestick-chart";
import { AssetClassesMatrix } from "./asset-classes-matrix";
import { GregoryRulerCard } from "./gregory-ruler-card";

interface SovereignDossierViewProps {
  dossier: DetailedSovereignEquityDossier;
}

export function SovereignDossierView({ dossier }: SovereignDossierViewProps) {
  const [copied, setCopied] = React.useState(false);
  const isPositive = dossier.deltaPercent >= 0;

  const handleCopyTicker = () => {
    navigator.clipboard.writeText(dossier.ticker);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-4">
        <Link
          href="/equities"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.16em] text-emerald-300 hover:text-emerald-200 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Equities Trading Floor
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 rounded bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 text-[10px] font-mono font-bold text-emerald-300 uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            CE70 CONSTITUTIONAL SOVEREIGN
          </span>
          <span className="rounded bg-slate-900 border border-slate-800 px-2.5 py-1 text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
            SEAT #{dossier.seatNumber}
          </span>
          <span className="rounded bg-slate-900 border border-slate-800 px-2.5 py-1 text-[10px] font-mono text-slate-300 uppercase tracking-wider">
            {dossier.originEra} ERA
          </span>
        </div>
      </div>

      {/* Hero Dossier Card */}
      <div className="rounded-xl border border-slate-800 bg-[#070A11] p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Column: Certified Slab Cover Art */}
          <div className="w-full sm:w-72 lg:w-80 shrink-0 mx-auto lg:mx-0">
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg border-2 border-slate-700/80 bg-[#04060A] shadow-2xl group">
              {dossier.coverUrl ? (
                <Image
                  src={dossier.coverUrl}
                  alt={`${dossier.series} #${dossier.issueNumber}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 320px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center text-slate-600">
                  <span className="text-4xl font-mono text-emerald-400">$</span>
                  <span className="text-xs uppercase tracking-wider text-slate-400">
                    Certified Vault Cover
                  </span>
                </div>
              )}

              {/* CGC Slab Header Simulation Overlay */}
              <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-[#0A101D]/90 to-transparent p-3 backdrop-blur-[2px]">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-200">
                  <span className="font-bold tracking-widest text-emerald-400">UNIVERSAL GRADE</span>
                  <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-bold text-emerald-300 border border-emerald-500/40">
                    CGC {dossier.referenceGrade}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Slab Metadata */}
            <div className="mt-3 text-center border border-slate-800 bg-[#0A0E18] py-2 px-3 rounded text-[11px] font-mono text-slate-400">
              Certified Specimen #{dossier.id}
            </div>
          </div>

          {/* Right Column: Sovereign Equity Market Dossier */}
          <div className="flex-1 min-w-0 w-full">
            {/* Ticker & Title */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleCopyTicker}
                className="group inline-flex items-center gap-1.5 rounded bg-emerald-950/80 border border-emerald-500/50 px-3 py-1 font-mono text-xs font-bold text-emerald-300 transition-all hover:bg-emerald-900"
                title="Click to copy canonical ticker symbol"
              >
                <span>{dossier.ticker}</span>
                <span className="text-[10px] text-emerald-500 group-hover:text-emerald-300">
                  {copied ? "COPIED!" : "COPY"}
                </span>
              </button>

              <span className="text-xs font-mono text-slate-500">
                Lineage: {dossier.lineage}
              </span>
            </div>

            <h1 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-100">
              {dossier.series} <span className="text-emerald-400">#{dossier.issueNumber}</span>
            </h1>

            {dossier.title && dossier.title !== dossier.series && (
              <p className="mt-1 text-sm sm:text-base text-slate-400 font-medium">
                {dossier.title}
              </p>
            )}

            {/* Price & Delta Bar */}
            <div className="mt-6 flex flex-wrap items-baseline gap-4 border-y border-slate-800/80 py-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                  Reference 9.8 Fair Market Value
                </span>
                <span className="text-3xl sm:text-4xl font-mono font-black text-slate-100 tracking-tight">
                  {dossier.priceFormatted}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-mono font-bold ${
                    isPositive
                      ? "bg-emerald-950/70 border border-emerald-500/40 text-emerald-300"
                      : "bg-rose-950/70 border border-rose-500/40 text-rose-300"
                  }`}
                >
                  {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {isPositive ? `+${dossier.deltaPercent}%` : `${dossier.deltaPercent}%`}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  vs Benchmark Horizon
                </span>
              </div>
            </div>

            {/* Institutional Parameter Specs */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="rounded bg-[#0B0F1A] border border-slate-800/80 p-3">
                <span className="text-[10px] uppercase text-slate-500">Gregory Score</span>
                <p className="mt-1 text-base font-bold text-emerald-300">
                  {dossier.gregoryScore.toFixed(1)} / 200
                </p>
              </div>

              <div className="rounded bg-[#0B0F1A] border border-slate-800/80 p-3">
                <span className="text-[10px] uppercase text-slate-500">Benchmark Seat</span>
                <p className="mt-1 text-base font-bold text-cyan-300">
                  Seat #{dossier.seatNumber}
                </p>
              </div>

              <div className="rounded bg-[#0B0F1A] border border-slate-800/80 p-3">
                <span className="text-[10px] uppercase text-slate-500">Publisher</span>
                <p className="mt-1 text-sm font-bold text-slate-200 truncate">
                  {dossier.publisher}
                </p>
              </div>

              <div className="rounded bg-[#0B0F1A] border border-slate-800/80 p-3">
                <span className="text-[10px] uppercase text-slate-500">Publication Year</span>
                <p className="mt-1 text-sm font-bold text-slate-200">
                  {dossier.publicationYear || "Classic"}
                </p>
              </div>
            </div>

            {/* Creators & Architects */}
            <div className="mt-4 rounded bg-[#0A0E18] border border-slate-800/60 p-3 text-xs">
              <span className="text-[10px] font-mono uppercase text-slate-500">
                Primary Creative Architects:
              </span>
              <p className="mt-1 font-sans text-slate-200 font-medium">
                {dossier.primaryCreators}
              </p>
            </div>

            {/* Actions Bar */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/equities"
                className="inline-flex items-center gap-2 rounded bg-emerald-500 px-4 py-2 text-xs font-mono font-bold text-slate-950 transition-colors hover:bg-emerald-400"
              >
                <Activity className="h-4 w-4" /> Trade Sovereign Floor
              </Link>

              {dossier.canonicalIssueId && (
                <Link
                  href={`/comics/${dossier.canonicalIssueId}`}
                  className="inline-flex items-center gap-2 rounded border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-mono font-medium text-slate-200 transition-colors hover:bg-slate-700"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> View in Clean Catalog
                </Link>
              )}

              <Link
                href={`/assets/seat-${dossier.seatNumber}`}
                className="inline-flex items-center gap-2 rounded border border-cyan-800/60 bg-cyan-950/30 px-4 py-2 text-xs font-mono font-medium text-cyan-300 transition-colors hover:bg-cyan-950/60"
              >
                <Layers className="h-3.5 w-3.5" /> View Asset Surface
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Candlestick & Continuous Performance Chart */}
      <EquityCandlestickChart
        ticker={dossier.ticker}
        series={dossier.series}
        issueNumber={dossier.issueNumber}
        currentPrice={dossier.referenceFmvUsd}
        deltaPercent={dossier.deltaPercent}
        dataPoints={dossier.performanceHistory}
      />

      {/* 16 Canonical Collectible Asset Classes Matrix */}
      <AssetClassesMatrix
        series={dossier.series}
        issueNumber={dossier.issueNumber}
        baseFmv={dossier.referenceFmvUsd}
      />

      {/* Gregory Connoisseurship Quality Ruler */}
      <GregoryRulerCard
        gregoryScore={dossier.gregoryScore}
        qualityMetrics={dossier.qualityScores}
        adjudicationEssay={dossier.adjudicationEssay}
        historicalJustification={dossier.historicalJustification}
        seatNumber={dossier.seatNumber}
      />
    </div>
  );
}
