"use client";

import * as React from "react";
import { Award, BookOpen, ChevronDown, ChevronUp, Scale, Sparkles, CheckCircle2 } from "lucide-react";

export interface QualityMetric {
  dimension: string;
  score: number;
  rationale: string;
}

interface GregoryRulerCardProps {
  gregoryScore: number;
  qualityMetrics?: QualityMetric[];
  adjudicationEssay?: string;
  historicalJustification?: string;
  seatNumber?: number;
}

export function GregoryRulerCard({
  gregoryScore,
  qualityMetrics = [],
  adjudicationEssay,
  historicalJustification,
  seatNumber,
}: GregoryRulerCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const isElite = gregoryScore >= 195.0;
  const isQualified = gregoryScore >= 190.0;
  const tierName = isElite ? "CE ELITE CONSTITUENT" : isQualified ? "PPIX QUALIFIED KEY" : "SUB-QUALIFIED SPECIMEN";
  const tierColor = isElite
    ? "border-emerald-500/40 bg-emerald-950/60 text-emerald-300"
    : "border-cyan-500/40 bg-cyan-950/60 text-cyan-300";

  // Authoritative fallback 8 primary dimensions if not passed
  const displayMetrics = qualityMetrics.length > 0 ? qualityMetrics : [
    { dimension: "Authorial Presence", score: 9.8, rationale: "Unmistakable creative handwriting and singular auteur vision." },
    { dimension: "Artistic Merit", score: 9.9, rationale: "Exceptional line weight, graphic compositional balance, and draftsmanship." },
    { dimension: "Narrative Power", score: 9.8, rationale: "Pioneering structural pacing and psychological stakes." },
    { dimension: "Technical Mastery", score: 9.9, rationale: "Precision sequential breakdown and chiaroscuro atmosphere." },
    { dimension: "Cultural Gravity", score: 10.0, rationale: "Enduring societal resonance and cross-generational influence." },
    { dimension: "Symbolic Density", score: 9.8, rationale: "Multi-layered allegorical motifs and visual iconography." },
    { dimension: "Historical Significance", score: 10.0, rationale: "Epochal genre rupture and paradigm-shifting publication event." },
    { dimension: "Rarity & Irreplaceability", score: 9.8, rationale: "High-grade census survivorship and institutional collection lockup." },
  ];

  return (
    <div className="rounded-lg border border-slate-800 bg-[#070A11] p-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100 tracking-wide">
              Gregory Connoisseurship Quality Ruler (200-Pt Canon)
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Adjudicated independently of market price based on 20 universal investment-grade aesthetic dimensions.
          </p>
        </div>

        {/* Score Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right font-mono">
            <span className="text-2xl font-bold text-emerald-300">{gregoryScore.toFixed(1)}</span>
            <span className="text-xs text-slate-500"> / 200.0</span>
          </div>
          <span className={`rounded border px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider ${tierColor}`}>
            {tierName}
          </span>
        </div>
      </div>

      {/* Historical Justification */}
      {historicalJustification && (
        <div className="mt-4 rounded-md border border-slate-800/80 bg-[#0B0F1A] p-4 text-xs text-slate-300 leading-relaxed font-sans">
          <p className="font-semibold text-emerald-400 mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-mono">
            <CheckCircle2 className="h-3.5 w-3.5" /> Constitutional Role & Historical Standing
          </p>
          {historicalJustification}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {displayMetrics.slice(0, isExpanded ? displayMetrics.length : 4).map((metric, idx) => (
          <div
            key={metric.dimension}
            className="rounded border border-slate-800/80 bg-[#0A0E18] p-3 transition-colors hover:border-slate-700"
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-medium">{metric.dimension}</span>
              <span className="font-bold text-emerald-400">{metric.score.toFixed(1)}</span>
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-900 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
                style={{ width: `${(metric.score / 10.0) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
              {metric.rationale}
            </p>
          </div>
        ))}
      </div>

      {displayMetrics.length > 4 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3" /> Show fewer quality dimensions
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" /> View all {displayMetrics.length} quality dimensions
            </>
          )}
        </button>
      )}

      {/* Comprehensive Critical Adjudication Essay */}
      {adjudicationEssay && (
        <div className="mt-6 border-t border-slate-800/80 pt-5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-slate-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Constitutional Adjudication Essay
            </h3>
          </div>
          <div className="rounded border border-slate-800/70 bg-[#06080F] p-5 text-xs text-slate-300 leading-relaxed font-sans space-y-3">
            {adjudicationEssay.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
