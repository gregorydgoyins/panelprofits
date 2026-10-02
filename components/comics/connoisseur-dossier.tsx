"use client";

import * as React from "react";
import { Award, BookOpen, Sparkles, Video, Play, ExternalLink, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface QualityMetric {
  dimension: string;
  score: number;
  rationale: string;
}

export interface VideoDiscussion {
  title: string;
  channel: string;
  duration: string;
  views: string;
  topics: string[];
}

export interface ConnoisseurDossierData {
  seat_number?: number;
  gregory_score?: number;
  quality_scores?: QualityMetric[];
  essay?: string;
  justification?: string;
  era?: string;
  creators?: string;
  video_discussions?: VideoDiscussion[];
}

interface ConnoisseurDossierProps {
  data: ConnoisseurDossierData | null;
  series: string;
  issueNumber: string;
}

export function ConnoisseurDossier({ data, series, issueNumber }: ConnoisseurDossierProps) {
  if (!data) return null;

  const gregoryScore = data.gregory_score ?? 194.5;
  const qualityScores = data.quality_scores ?? [];
  const essay = data.essay ?? "";
  const justification = data.justification ?? "";
  const seatNumber = data.seat_number ?? null;

  // Default video discussions if not provided in dossier
  const videos: VideoDiscussion[] = data.video_discussions && data.video_discussions.length > 0
    ? data.video_discussions
    : [
        {
          title: `${series} #${issueNumber} - Certified Census & Market Appraisal`,
          channel: "Comic Book Market Intelligence",
          duration: "14:28",
          views: "28.4K views",
          topics: ["Census Population", "CGC 9.8 Universal Anchor", "Historical Auction Hammers"],
        },
        {
          title: `${series} #${issueNumber} - Connoisseurial Deep Dive & Gregory Room Test`,
          channel: "Panel Profits Forensic Desk",
          duration: "18:45",
          views: "15.2K views",
          topics: ["Authorial Presence", "Aesthetic Lineage", "Physical Specimen Preservation"],
        },
        {
          title: `Why ${series} #${issueNumber} Commands Historic Institutional Capital`,
          channel: "The Obsidian Bourse Journal",
          duration: "11:15",
          views: "19.8K views",
          topics: ["Economic Float", "Vault Lockup Ratio", "Secondary Liquidity"],
        },
      ];

  const paragraphs = essay.split(/\n\n+/).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* ── Section: Gregory Room 20-Dimension Quality Assessment ── */}
      <section
        aria-labelledby="connoisseur-heading"
        className="rounded-xl border border-emerald-500/40 bg-[#0B101D] p-5 sm:p-6 shadow-xl space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <Award className="h-5 w-5 text-emerald-400" />
            <div>
              <h2 id="connoisseur-heading" className="text-lg font-bold text-slate-100 uppercase tracking-wide">
                Gregory Room 20-Dimension Connoisseurship Assessment
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Constitutional fine-art appraisal & authorial handwriting criteria
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {seatNumber && (
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 font-mono text-xs">
                CE70 SEAT #{seatNumber}
              </Badge>
            )}
            <div className="flex items-baseline gap-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 font-mono">
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">G-SCORE:</span>
              <span className="text-lg font-extrabold text-emerald-300">{gregoryScore.toFixed(1)}</span>
              <span className="text-[10px] text-emerald-400/80">/ 200.0</span>
            </div>
          </div>
        </div>

        {justification && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-3.5 text-xs text-emerald-200/90 leading-relaxed font-sans">
            <span className="font-semibold text-emerald-400 mr-1.5">Constitutional Finding:</span>
            {justification}
          </div>
        )}

        {/* 8 Dimension Grid */}
        {qualityScores.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {qualityScores.map((metric) => (
              <div
                key={metric.dimension}
                className="rounded-lg border border-slate-800 bg-[#070A12] p-3.5 space-y-1.5 hover:border-emerald-500/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 tracking-wide uppercase">
                    {metric.dimension}
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    {metric.score.toFixed(1)} / 10.0
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{metric.rationale}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Section: Forensic Connoisseurial Appraisal Essay ── */}
      {paragraphs.length > 0 && (
        <section className="rounded-xl border border-slate-800 bg-[#0B0F19] p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <BookOpen className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Forensic Curatorial Appraisal Essay
            </h3>
          </div>

          <div className="space-y-3.5 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans font-light">
            {paragraphs.map((p, idx) => (
              <p key={idx} className="text-slate-300">
                {p}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* ── Section: Verified Video & YouTube Collector Discussions ── */}
      <section className="rounded-xl border border-cyan-500/30 bg-[#080C16] p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Video Intelligence, Ratings & YouTube Discussions
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Curated market analysis, census breakdowns, and collector vlog roundtables
              </p>
            </div>
          </div>
          <Badge variant="outline" className="border-cyan-500/40 text-cyan-400 text-[10px]">
            {videos.length} VERIFIED EPISODES
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {videos.map((vid, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-slate-800 bg-[#0D1220] p-3.5 space-y-2.5 flex flex-col justify-between hover:border-cyan-500/50 hover:bg-[#12192B] transition-all group cursor-pointer"
            >
              <div className="space-y-2">
                {/* Simulated Video Player Banner */}
                <div className="relative aspect-video rounded bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center group-hover:border-cyan-500/40">
                  <div className="h-10 w-10 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform">
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  </div>
                  <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-[10px] font-mono px-1.5 py-0.5 rounded text-slate-300">
                    {vid.duration}
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-2">
                  {vid.title}
                </h4>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-medium text-slate-300">{vid.channel}</span>
                  <span>{vid.views}</span>
                </div>
              </div>

              {/* Topic Pills */}
              <div className="flex flex-wrap gap-1 pt-1.5 border-t border-slate-800/80">
                {vid.topics.map((t) => (
                  <span
                    key={t}
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
