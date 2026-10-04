"use client";

import * as React from "react";
import Link from "next/link";
import { Atom, Compass, ShieldAlert, Sparkles, BookOpen, Clock, Award, ExternalLink, Play, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type NerdSyncPillar = "physics" | "craft" | "geopolitics" | "philosophy";

export interface NerdSyncCuratedItem {
  id: string;
  pillar: NerdSyncPillar;
  title: string;
  videoId: string;
  duration: string;
  views: string;
  headline: string;
  scientificHypothesis: string;
  forensicThesis: string;
  keyConcepts: string[];
  primaryEquity: {
    ticker: string;
    series: string;
    issue: string;
    significance: string;
  };
}

export const NERDSYNC_CURATED_LIBRARY: NerdSyncCuratedItem[] = [
  // ── Pillar 1: Forensic Physics & Biochemistry ─────────────────────────
  {
    id: "ns-crispr-cap",
    pillar: "physics",
    title: "How CRISPR Explains Captain America's Super Soldier Serum",
    videoId: "TdBAHexVYzc",
    duration: "14:28",
    views: "184K",
    headline: "Epigenetic Reprogramming: Dr. Erskine's Retroviral Vector & Myostatin Inhibition",
    scientificHypothesis:
      "Dr. Abraham Erskine's Super Soldier Serum operates not through supernatural alchemy, but via targeted retroviral gene vectors delivering CRISPR-Cas9 payload to suppress the MSTN (myostatin) gene, activate IGF-1 hypertrophy, and upregulate human telomerase reverse transcriptase (hTERT).",
    forensicThesis:
      "Scott Niswander bridges modern genetic engineering with Joe Simon and Jack Kirby's 1941 masterpiece, establishing why Steve Rogers' physical transformation in Captain America Comics #1 represents the earliest predictive visualization of CRISPR gene therapy in twentieth-century sequential art.",
    keyConcepts: ["CRISPR-Cas9", "Myostatin Knockout", "Retroviral Vectors", "Vita-Ray Catalysis"],
    primaryEquity: {
      ticker: "CAP01",
      series: "Captain America Comics",
      issue: "1",
      significance: "First appearance of Steve Rogers & the Super Soldier Serum (1941)",
    },
  },
  {
    id: "ns-gwen-stacy",
    pillar: "physics",
    title: "The Fatal Deceleration Physics of Gwen Stacy's Fall",
    videoId: "EK_tlnO4Gns",
    duration: "12:15",
    views: "620K",
    headline: "Newtonian Whiplash vs. Fall Velocity: The Mechanical Reality of ASM #121",
    scientificHypothesis:
      "Calculating Gwen Stacy's terminal velocity from the George Washington Bridge (~95 mph) and the instantaneous deceleration G-forces (in excess of 10G) exerted on her cervical vertebrae when Peter Parker's webbing snaps taut with zero elongation margin.",
    forensicThesis:
      "A forensic biomechanical deconstruction of Gerry Conway, Gil Kane, and John Romita's landmark June 1973 tragedy, analyzing the editorial confirmation in ASM #125 that the whiplash effect of the webbing—not the shock of the fall—caused the fatal fracture, permanently ending the Silver Age innocence of superhero comics.",
    keyConcepts: ["Deceleration G-Forces", "Cervical Whiplash", "Elastic Modulus", "Death of the Silver Age"],
    primaryEquity: {
      ticker: "ASM121",
      series: "The Amazing Spider-Man",
      issue: "121",
      significance: "The Death of Gwen Stacy; watershed transition into the Bronze Age (1973)",
    },
  },
  {
    id: "ns-tights-anatomy",
    pillar: "physics",
    title: "Why Do Superheroes Wear Tights? Circus Strongmen & Anatomy",
    videoId: "Pgwsmt2utX4",
    duration: "11:55",
    views: "530K",
    headline: "Vaudeville Morphology: Anatomical Shorthand and Four-Color Newsprint Constraints",
    scientificHypothesis:
      "Early 20th-century comic production relied on 65-line-per-inch rotary presses with cheap wood-pulp paper and four-color CMYK separation. Form-fitting athletic leotards allowed cartoonists to render dynamic muscular topography and dramatic chiaroscuro lighting with minimal line count.",
    forensicThesis:
      "Scott Niswander traces the evolutionary morphology of superhero costume design from late-19th-century circus strongmen (Eugene Sandow) and aerial acrobats to Joe Shuster's Clark Kent and Bob Kane's Bruce Wayne, proving how printing physics codified the superhero visual lexicon.",
    keyConcepts: ["Rotary Press Constraints", "Circus Strongmen", "Halftone Separation", "Muscular Chiaroscuro"],
    primaryEquity: {
      ticker: "ACT01",
      series: "Action Comics",
      issue: "1",
      significance: "First appearance of Superman; inauguration of the superhero costume archetype (1938)",
    },
  },

  // ── Pillar 2: Sequential Grammar & Lettering ──────────────────────────
  {
    id: "ns-cap-lettering",
    pillar: "craft",
    title: "How Captain America Demonstrates BRILLIANT Comic Book Lettering",
    videoId: "EqMUDPeT5kF",
    duration: "10:45",
    views: "175K",
    headline: "The Invisible Architecture: Eye-Tracking, Gutter Pacing, and Balloon Hierarchy",
    scientificHypothesis:
      "Letterer Joe Caramagna deploys caption boxes as visual breadcrumbs across Steve Rogers' panels, controlling the reader's saccadic eye movements to modulate narrative cadence, dramatic pauses, and ocular momentum.",
    forensicThesis:
      "NerdSync dismantles the common fallacy that comic lettering is mere mechanical transcription. By contrasting fight sequences and quiet emotional beats, this analysis reveals how text placement dictates whether the reader experiences visual trauma before or after cognitive narrative absorption.",
    keyConcepts: ["Saccadic Eye Tracking", "Speech Balloon Geometry", "Narrative Cadence", "Caramagna Grid"],
    primaryEquity: {
      ticker: "CAP01",
      series: "Captain America Comics",
      issue: "1",
      significance: "Structural benchmark for Golden Age sequential lettering and page architecture",
    },
  },

  // ── Pillar 3: Censorship, Law & Geopolitics ───────────────────────────
  {
    id: "ns-superman-nuke",
    pillar: "geopolitics",
    title: "Superman's Uncomfortable History with Nuclear Weapons",
    videoId: "qBMHaM_3JhA",
    duration: "15:40",
    views: "295K",
    headline: "The Manhattan Project Intercept: US War Department Censorship of DC Comics",
    scientificHypothesis:
      "In 1944, a Lex Luthor story featuring an 'atomic bomb' accidentally anticipated the Top Secret Manhattan Project cyclotron research at Oak Ridge, triggering an immediate national security intervention and mandatory editorial suppression by the Office of Censorship.",
    forensicThesis:
      "Scott Niswander conducts a forensic historical investigation into the intersection of comic art and military secrecy, following the Man of Steel's evolution from wartime propaganda instrument to post-Hiroshima diplomatic liability during the Cold War atomic standoff.",
    keyConcepts: ["Office of Censorship", "Cyclotron Secrecy", "Manhattan Project", "Cold War Atomic Paranoia"],
    primaryEquity: {
      ticker: "ACT01",
      series: "Action Comics",
      issue: "1",
      significance: "Cultural foundation of DC's supreme sovereign nuclear deterrent",
    },
  },
  {
    id: "ns-batman-knight",
    pillar: "geopolitics",
    title: "Could Batman Be a Literal Dark Knight? Chivalric Codes & Feudal Law",
    videoId: "smcnGd3pCIc",
    duration: "14:15",
    views: "260K",
    headline: "Extrajudicial Sovereignty: Chivalric Oaths, Errant Justice, and Bruce Wayne",
    scientificHypothesis:
      "Medieval knights errant operated under a sovereign monopoly on violence granted outside municipal law, binding themselves to chivalric codes (honor, non-lethal submission, protection of the dispossessed) that mirror Batman's strict moral prohibition against firearms.",
    forensicThesis:
      "Examining whether the Caped Crusader qualifies as a literal knight in the historical feudal tradition, deconstructing Bob Kane, Bill Finger, and Frank Miller's characterization of Gotham's sovereign protector as an autonomous lord maintaining order amid municipal decay.",
    keyConcepts: ["Chivalric Knighthood", "Monopoly on Violence", "Non-Lethal Jurisprudence", "Feudal Sovereignty"],
    primaryEquity: {
      ticker: "TEC027",
      series: "Detective Comics",
      issue: "27",
      significance: "First appearance of The Batman (1939)",
    },
  },

  // ── Pillar 4: Auteur Philosophy & Market Speculation ──────────────────
  {
    id: "ns-ditko-objectivism",
    pillar: "philosophy",
    title: "Why Spider-Man Used to Suck: How Steve Ditko's Objectivism Shaped Peter",
    videoId: "Tu9SA3wMNv8",
    duration: "16:12",
    views: "410K",
    headline: "Ayn Rand in Queens: Moral Absolutism, Isolation, and the 1960s Spider-Man Run",
    scientificHypothesis:
      "Steve Ditko's philosophical conversion to Ayn Rand's Objectivism created a fundamental tonal friction with Stan Lee's empathetic humanist melodrama, turning Peter Parker into a rigid, self-interested, and socially contemptuous protagonist between issues #1 and #38.",
    forensicThesis:
      "A masterclass ideological dissection of the greatest creative collaboration in comics. NerdSync explains why Ditko's philosophical rigidity made Peter Parker relatable not in spite of his flaws, but because his bitter individual responsibility mirrored genuine adolescent angst.",
    keyConcepts: ["Ayn Rand Objectivism", "Melodrama vs Absolutism", "Ditko Plots", "Silver Age Ideological Rift"],
    primaryEquity: {
      ticker: "ASM01",
      series: "The Amazing Spider-Man",
      issue: "1",
      significance: "First ongoing solo title; foundational Lee/Ditko collaborative canvas (1963)",
    },
  },
  {
    id: "ns-mj-origin",
    pillar: "philosophy",
    title: "The Beautiful Origin of Mary Jane & Peter Parker's Relationship",
    videoId: "4xtzfzDkWzs",
    duration: "13:30",
    views: "340K",
    headline: "The 18-Issue Running Gag: John Romita Sr., Concealed Face Tropes, and ASM #42",
    scientificHypothesis:
      "Stan Lee and Steve Ditko deliberately concealed Mary Jane Watson's face behind lampshades, flowers, and oversized collars across 18 issues to subvert blind-date romance tropes, setting up the most cathartic reveal panel in Bronze Age history.",
    forensicThesis:
      "Forensic examination of John Romita Sr.'s legendary November 1966 splash page ('Face it, Tiger... you just hit the jackpot!'), illustrating how commercial romance comic techniques permanently elevated Marvel's domestic realism over DC's static Silver Age status quo.",
    keyConcepts: ["Concealed Face Trope", "Romance Comic Grammar", "John Romita Realism", "ASM #42 Splash"],
    primaryEquity: {
      ticker: "ASM042",
      series: "The Amazing Spider-Man",
      issue: "42",
      significance: "First full appearance of Mary Jane Watson (1966)",
    },
  },
  {
    id: "ns-clone-saga",
    pillar: "philosophy",
    title: "Why the Spider-Man Clone Saga Sucks: 90s Speculative Mania & Chaos",
    videoId: "YUJRJNRqfh4",
    duration: "18:20",
    views: "480K",
    headline: "The Speculative Crash: How Wall Street Gimmicks Broke Spider-Man Editorial",
    scientificHypothesis:
      "Marvel's 1993 public market IPO created corporate pressure to artificially extend a self-contained 3-month Clone Saga storyline into a 2.5-year quagmire of foil covers, crossover tie-ins, and artificial character swaps that directly triggered Marvel's 1996 Chapter 11 bankruptcy.",
    forensicThesis:
      "NerdSync presents a critical post-mortem of 1990s secondary market speculation, demonstrating how secondary market FOMO and corporate financial engineering can destroy the authorial integrity of a premier publishing asset.",
    keyConcepts: ["1990s Speculative Bubble", "Corporate Debt Levering", "Variant Inflation", "Chapter 11 Bankruptcy"],
    primaryEquity: {
      ticker: "ASM01",
      series: "The Amazing Spider-Man",
      issue: "1",
      significance: "The anchor benchmark of Spider-Man float across speculative cycles",
    },
  },
];

export function NerdSyncCuratedShowcase() {
  const [activePillar, setActivePillar] = React.useState<NerdSyncPillar>("physics");
  const [selectedItemId, setSelectedItemId] = React.useState<string>("ns-crispr-cap");

  const currentPillarItems = React.useMemo(() => {
    return NERDSYNC_CURATED_LIBRARY.filter((item) => item.pillar === activePillar);
  }, [activePillar]);

  const selectedItem = React.useMemo(() => {
    return NERDSYNC_CURATED_LIBRARY.find((item) => item.id === selectedItemId) || currentPillarItems[0];
  }, [selectedItemId, currentPillarItems]);

  const handlePillarChange = (pillar: NerdSyncPillar) => {
    setActivePillar(pillar);
    const firstItemOfPillar = NERDSYNC_CURATED_LIBRARY.find((item) => item.pillar === pillar);
    if (firstItemOfPillar) {
      setSelectedItemId(firstItemOfPillar.id);
    }
  };

  return (
    <section className="rounded-2xl border border-emerald-500/30 bg-[#071210] p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-500/20 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <Badge variant="outline" className="border-emerald-400/40 text-[10px] text-emerald-300 font-mono tracking-wider">
              PANEL PROFITS SCIENTIFIC & PHILOSOPHICAL REPERTORY
            </Badge>
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-black text-slate-100 tracking-tight flex items-center gap-3">
            <Atom className="h-6 w-6 text-emerald-400" />
            <span>NerdSync: The Forensic Science & Lore Laboratory</span>
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
            Scott Niswander&apos;s definitive comic book video essays, rigorously curated across four foundational pillars: Forensic Physics, Sequential Grammar, Geopolitical Censorship, and Auteur Philosophy.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge className="bg-emerald-950/70 text-emerald-300 border-emerald-500/40 text-xs font-mono">
            {NERDSYNC_CURATED_LIBRARY.length} Curated Masterclasses · 4 Inquiry Pillars
          </Badge>
        </div>
      </div>

      {/* Pillar Selection Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {[
          { id: "physics" as NerdSyncPillar, label: "Forensic Physics & Genetics", icon: Atom, desc: "Biochemistry & Ballistics" },
          { id: "craft" as NerdSyncPillar, label: "Sequential Grammar", icon: Compass, desc: "Lettering & Eye-Tracking" },
          { id: "geopolitics" as NerdSyncPillar, label: "Censorship & Geopolitics", icon: ShieldAlert, desc: "War Dept & Feudal Law" },
          { id: "philosophy" as NerdSyncPillar, label: "Philosophy & Speculation", icon: Layers, desc: "Ditko & Market Bubbles" },
        ].map((pillar) => {
          const Icon = pillar.icon;
          const isActive = activePillar === pillar.id;
          return (
            <button
              key={pillar.id}
              onClick={() => handlePillarChange(pillar.id)}
              className={`rounded-xl p-3.5 text-left border transition-all ${
                isActive
                  ? "bg-emerald-950/80 border-emerald-400 text-slate-100 shadow-lg shadow-emerald-950/40"
                  : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${isActive ? "text-emerald-300" : "text-slate-500"}`} />
                <span className="text-xs font-bold font-mono tracking-tight">{pillar.label}</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 font-mono">{pillar.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Main Theater & Dossier Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Authentic Video Player & Scientific Thesis (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-emerald-500/30 bg-black shadow-lg">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${selectedItem.videoId}?autoplay=0`}
              title={selectedItem.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>

          <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-emerald-300">
              <Clock className="h-4 w-4" />
              <span>Duration: {selectedItem.duration}</span>
              <span className="text-slate-500">({selectedItem.views} views)</span>
            </div>
            <a
              href={`https://www.youtube.com/watch?v=${selectedItem.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <span>Watch on YouTube</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Scientific Hypothesis & Forensic Dossier */}
          <div className="rounded-lg bg-[#061814] border border-emerald-500/20 p-4 space-y-3">
            <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>SCIENTIFIC HYPOTHESIS & MECHANISM</span>
            </div>
            <h3 className="text-base font-bold text-slate-100 leading-snug">
              {selectedItem.headline}
            </h3>
            <div className="text-xs text-emerald-100/80 bg-emerald-950/40 border border-emerald-800/40 rounded p-2.5 leading-relaxed font-sans">
              <strong>Mechanism: </strong> {selectedItem.scientificHypothesis}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Forensic Impact: </strong> {selectedItem.forensicThesis}
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedItem.keyConcepts.map((concept, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/50 text-[10px] font-mono text-emerald-300">
                  {concept}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pillar Episodes Selector & Associated Comic Equity (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-[#081512] p-4 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-semibold flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-emerald-400" /> Episodes in This Pillar ({currentPillarItems.length})
              </span>
              <span className="text-[10px] font-mono text-emerald-400">Click to Select</span>
            </div>

            <div className="space-y-2 pt-1">
              {currentPillarItems.map((item) => {
                const isSelected = item.id === selectedItem.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className={`w-full text-left rounded-lg p-3 border transition-all ${
                      isSelected
                        ? "bg-emerald-950/90 border-emerald-400 text-slate-100 shadow-md"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold leading-tight line-clamp-1">{item.title}</span>
                      <span className="text-[10px] font-mono shrink-0 text-slate-500">{item.duration}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {item.headline}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Equity Card */}
          <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 to-slate-950 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5" /> Physical Equity Benchmark
              </span>
              <Badge className="bg-emerald-900/60 text-emerald-300 border-emerald-600/40 text-[10px] font-mono">
                {selectedItem.primaryEquity.ticker}
              </Badge>
            </div>

            <div>
              <div className="text-sm font-bold text-slate-100">
                {selectedItem.primaryEquity.series} #{selectedItem.primaryEquity.issue}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedItem.primaryEquity.significance}
              </p>
            </div>

            <div className="pt-2 border-t border-emerald-500/10 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">Panel Profits Canonical Constituent</span>
              <Link
                href={`/comics/${encodeURIComponent(selectedItem.primaryEquity.ticker)}`}
                className="inline-flex items-center gap-1.5 rounded bg-emerald-950 border border-emerald-500/40 px-3 py-1 text-[11px] font-mono font-bold text-emerald-300 hover:bg-emerald-900/80 transition-colors"
              >
                Inspect Equity &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
