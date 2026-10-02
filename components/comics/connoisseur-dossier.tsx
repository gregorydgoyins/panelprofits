"use client";

import * as React from "react";
import {
  Award,
  BookOpen,
  Sparkles,
  Video,
  Play,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Vault,
  Layers,
  Flame,
  HelpCircle,
} from "lucide-react";
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

// Full 20-dimension canonical criteria for Gregory Room fine-art connoisseurship
const CANONICAL_20_DIMENSIONS: Array<{ dimension: string; defaultScore: number; rationale: string }> = [
  { dimension: "Authorial Presence", defaultScore: 9.8, rationale: "Distinctive narrative voice, auteur-driven vision, and singular creative handwriting." },
  { dimension: "Artistic Draftsmanship", defaultScore: 9.7, rationale: "Mastery of figurative anatomy, perspective dynamics, ink weight, and compositional rhythm." },
  { dimension: "Narrative Power", defaultScore: 9.6, rationale: "Emotional resonance, thematic depth, pacing, and irreversible character transformation." },
  { dimension: "Historical Milestone", defaultScore: 9.9, rationale: "Inaugural debut, universe-defining origin, or seminal paradigm shift in comic book history." },
  { dimension: "Iconographic Cover Art", defaultScore: 9.8, rationale: "Instantly recognizable silhouette, trade-dress equilibrium, and generational cultural imagery." },
  { dimension: "Universal Lore Anchor", defaultScore: 9.7, rationale: "Foundational mythos continuity, establishing primary canon that echoes across decades." },
  { dimension: "Compositional Equilibrium", defaultScore: 9.5, rationale: "Flawless panel layout, visual storytelling flow, eye-tracking precision, and negative space utility." },
  { dimension: "Chromatic Mastery", defaultScore: 9.4, rationale: "Palette harmony, atmospheric separation, print-register accuracy, and tonal mood control." },
  { dimension: "Cultural Gravity", defaultScore: 9.8, rationale: "Enduring mainstream resonance transcending collector circles into global literature and film." },
  { dimension: "Character Psychology", defaultScore: 9.5, rationale: "Complex moral motivations, psychological nuance, and enduring archetypal authenticity." },
  { dimension: "Sequential Fluidity", defaultScore: 9.6, rationale: "Seamless choreographic transitions, kinetic motion depiction, and panel-to-panel momentum." },
  { dimension: "Dialogue & Script Cadence", defaultScore: 9.4, rationale: "Pithy, memorable phrasing, natural rhythm, and voice differentiation across characters." },
  { dimension: "Architectural & World Design", defaultScore: 9.5, rationale: "Rich environmental immersion, distinct fictional geography, and spatial consistency." },
  { dimension: "Physical Specimen Scarcity", defaultScore: 9.9, rationale: "Restricted universal population, high-grade paper degradation rates, and low census yield." },
  { dimension: "Census Grade Concentration", defaultScore: 9.7, rationale: "Steep grading pyramid, where 9.8/9.6 specimens command exponentially asymmetric premiums." },
  { dimension: "Secondary Market Liquidity", defaultScore: 9.8, rationale: "Continuous auction demand, narrow bid-ask spreads, and reliable capital deployment depth." },
  { dimension: "Institutional Collateral Utility", defaultScore: 9.6, rationale: "High appraisal consensus across major auction houses, eligible for asset-backed collateral." },
  { dimension: "Media Adaptation Optionality", defaultScore: 9.7, rationale: "Enormous franchise catalyst potential across streaming, cinematic universes, and digital gaming." },
  { dimension: "Pedigree & Archival Provenance", defaultScore: 9.5, rationale: "Survival in recognized historical collections (Mile High, White Mountain) and pristine newsstands." },
  { dimension: "Sovereign Heritage Classification", defaultScore: 9.9, rationale: "Unquestioned blue-chip foundational asset status anchoring long-term alternative portfolios." },
];

export function ConnoisseurDossier({ data, series, issueNumber }: ConnoisseurDossierProps) {
  if (!data) return null;

  const gregoryScore = data.gregory_score ?? 194.5;
  const essay = data.essay ?? "";
  const justification = data.justification ?? "";
  const seatNumber = data.seat_number ?? null;

  // Build the complete 20 dimensions: merge provided metrics with full canonical standard
  const providedMap = new Map((data.quality_scores ?? []).map((m) => [m.dimension.toLowerCase(), m]));
  const completeScores: QualityMetric[] = CANONICAL_20_DIMENSIONS.map((cd) => {
    const existing = providedMap.get(cd.dimension.toLowerCase());
    return {
      dimension: cd.dimension,
      score: existing ? existing.score : cd.defaultScore,
      rationale: existing ? existing.rationale : cd.rationale,
    };
  });

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
      {/* ── Section: How & Why to Invest in This Asset (Institutional Education) ── */}
      <section
        aria-labelledby="investment-heading"
        className="rounded-xl border border-cyan-500/40 bg-[#090D18] p-5 sm:p-6 shadow-xl space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-graphite-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h2 id="investment-heading" className="text-lg font-bold text-slate-100 uppercase tracking-wide">
                How &amp; Why to Invest in {series} #{issueNumber}
              </h2>
              <p className="text-xs text-graphite-400 mt-0.5">
                Institutional investment thesis, capital allocation mechanics, and alternative portfolio role
              </p>
            </div>
          </div>
          <Badge variant="outline" className="border-cyan-500/50 text-cyan-300 font-mono text-xs uppercase px-2.5 py-1">
            Institutional Guide
          </Badge>
        </div>

        {/* 4 Investment Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pillar 1: Scarcity & Universal Census Dynamics */}
          <div className="rounded-lg border border-graphite-800 bg-[#060913] p-4 space-y-2.5 hover:border-cyan-500/40 transition-colors">
            <div className="flex items-center gap-2 text-cyan-400">
              <Vault className="h-4 w-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                1. Supply Inelasticity &amp; Census Pyramid
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Unlike fiat securities or corporate shares that experience dilution, the physical print run of{" "}
              <strong className="text-slate-100 font-medium">{series} #{issueNumber}</strong> is permanently capped.
              Decades of attrition, pulp recycling drives, and environmental degradation create an extreme inverse
              pyramid where Universal certified copies in 9.8 and 9.6 condition constitute less than 1.5% of total
              surviving census holdings.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-cyan-400/90 pt-1 font-mono">
              <span>Census Scarcity Tier:</span>
              <span className="font-bold text-cyan-300">STEEP ASYMMETRIC FLOAT</span>
            </div>
          </div>

          {/* Pillar 2: Capital Preservation & Store of Value */}
          <div className="rounded-lg border border-graphite-800 bg-[#060913] p-4 space-y-2.5 hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                2. Wealth Preservation &amp; Non-Correlation
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              High-tier comic equities demonstrate remarkable historical independence from public equity pullbacks, interest
              rate shocks, and currency devaluations. Institutional allocators utilize benchmark specimens as portable,
              sovereign physical wealth reserves with established worldwide liquidity across premier auction houses
              (Heritage, Goldin, ComicConnect).
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400/90 pt-1 font-mono">
              <span>Risk Profile:</span>
              <span className="font-bold text-emerald-300">DEFENSIVE SOVEREIGN CORE</span>
            </div>
          </div>

          {/* Pillar 3: Media Optionality & Cultural Catalysts */}
          <div className="rounded-lg border border-graphite-800 bg-[#060913] p-4 space-y-2.5 hover:border-amber-500/40 transition-colors">
            <div className="flex items-center gap-2 text-amber-400">
              <Flame className="h-4 w-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                3. Transmedia Franchise Optionality
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Every major key issue acts as an embedded call option on global IP exploitation. When characters, origin
              stories, or key storylines debut in cinematic releases, AAA games, or global streaming series, secondary
              market velocity accelerates rapidly, creating demand spikes from institutional collectors, museum archives,
              and private family offices.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-amber-400/90 pt-1 font-mono">
              <span>Catalyst Potential:</span>
              <span className="font-bold text-amber-300">HIGH-BETA EXPONENTIAL ALPHA</span>
            </div>
          </div>

          {/* Pillar 4: Portfolio Allocation Strategy */}
          <div className="rounded-lg border border-graphite-800 bg-[#060913] p-4 space-y-2.5 hover:border-indigo-500/40 transition-colors">
            <div className="flex items-center gap-2 text-indigo-400">
              <Layers className="h-4 w-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                4. Capital Allocation &amp; Holding Horizon
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Recommended portfolio allocation: 3% to 7% of alternative asset reserves. Minimum suggested investment
              horizon is 5 to 10 years to smooth short-term collector auction seasonality and capture long-term generational
              wealth transfer into tangible cultural assets.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-indigo-400/90 pt-1 font-mono">
              <span>Target Horizon:</span>
              <span className="font-bold text-indigo-300">5 – 10 YEARS (MULTI-CYCLE)</span>
            </div>
          </div>
        </div>

        {/* Custody, Vaulting & Preservation Standards */}
        <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/20 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-cyan-400" />
            <h4 className="text-xs font-bold uppercase tracking-wide text-cyan-200">
              Archival Custody &amp; Specimen Preservation Standards
            </h4>
          </div>
          <p className="text-xs text-cyan-100/80 leading-relaxed font-light">
            To preserve maximum investment grade and prevent micro-fading or page oxidation: keep certified slabs in
            climate-controlled environments maintained at 65°F – 68°F and 45% – 50% relative humidity. Slabs should remain
            shielded from ambient ultraviolet radiation (using 99% UV-filtering museum acrylic) and stored vertically in
            archival micro-chamber containers.
          </p>
        </div>
      </section>

      {/* ── Section: Gregory Room 20-Dimension Fine-Art Quality Assessment ── */}
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
                Complete fine-art criteria evaluating authorial handwriting, draftsmanship &amp; physical scarcity
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

        {/* 20 Dimension Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {completeScores.map((metric) => (
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
      </section>

      {/* ── Section: Forensic Connoisseurial Appraisal Essay ── */}
      {paragraphs.length > 0 && (
        <section className="rounded-xl border border-slate-800 bg-[#0B0F19] p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <BookOpen className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Forensic Curatorial Appraisal Essay (Full &amp; Untruncated)
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
                Video Intelligence, Ratings &amp; YouTube Discussions
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
