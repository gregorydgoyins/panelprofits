"use client";

import * as React from "react";
import Link from "next/link";
import { Tv, Play, BookOpen, Clock, Award, ExternalLink, Sparkles, ChevronRight, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export interface MasterclassChapter {
  id: string;
  chapterNumber: number;
  title: string;
  timecodeStart: string;
  timecodeEnd: string;
  startSeconds: number;
  durationMinutes: number;
  headline: string;
  forensicSummary: string;
  relatedComic: {
    id: string;
    ticker: string;
    series: string;
    issue: string;
    year: number;
    cgc98Fmv: number;
    rawFmv: number;
    census98Count: number;
  };
  keyThemes: string[];
}

export const CBG19_XMEN_CHAPTERS: MasterclassChapter[] = [
  {
    id: "cbg19-ch1",
    chapterNumber: 1,
    title: "The Silver Age Genesis (1963): Stan Lee, Jack Kirby & The Civil Rights Metaphor",
    timecodeStart: "00:00",
    timecodeEnd: "38:15",
    startSeconds: 0,
    durationMinutes: 38,
    headline: "Birthing the Children of the Atom: Born Into a World That Hates and Fears Them",
    forensicSummary:
      "Panel Profits forensic analysis of ComicBookGirl19's foundational thesis: How Stan Lee and Jack Kirby invented the mutant gene as a narrative shortcut that evolved into the most potent civil rights and minority allegory in twentieth-century American literature. Analyzing the first appearance of Professor X, Cyclops, Marvel Girl, Beast, Angel, and Iceman in September 1963.",
    relatedComic: {
      id: "XM01",
      ticker: "XM01",
      series: "The X-Men",
      issue: "1",
      year: 1963,
      cgc98Fmv: 880000,
      rawFmv: 42000,
      census98Count: 4,
    },
    keyThemes: ["Silver Age Genesis", "Mutant Allegory", "Jack Kirby Architecture", "Cold War Paranoia"],
  },
  {
    id: "cbg19-ch2",
    chapterNumber: 2,
    title: "Magneto & The Brotherhood: Radical Survivalism vs. Assimilation",
    timecodeStart: "38:16",
    timecodeEnd: "1:15:30",
    startSeconds: 2296,
    durationMinutes: 37,
    headline: "The Philosophical Crucible: Erik Lehnsherr, Wanda, Pietro, and Mutant Sovereignty",
    forensicSummary:
      "Deconstruction of Magneto's ideological framework as a Holocaust survivor rejecting human assimilation in favor of mutant self-defense. Tracking the market scarcity of X-Men #4 (debut of Scarlet Witch and Quicksilver) and how early Brotherhood dynamics laid the geopolitical blueprint for Krakoa decades later.",
    relatedComic: {
      id: "XM04",
      ticker: "XM04",
      series: "The X-Men",
      issue: "4",
      year: 1964,
      cgc98Fmv: 95000,
      rawFmv: 3200,
      census98Count: 12,
    },
    keyThemes: ["Brotherhood of Evil Mutants", "Scarlet Witch Debut", "Mutant Sovereignty", "Holocaust Provenance"],
  },
  {
    id: "cbg19-ch3",
    chapterNumber: 3,
    title: "The 1975 Resuscitation: Giant-Size X-Men #1 & The Claremont Renaissance",
    timecodeStart: "1:15:31",
    timecodeEnd: "1:58:45",
    startSeconds: 4531,
    durationMinutes: 43,
    headline: "Len Wein, Dave Cockrum & Chris Claremont: Transforming a Dead Title Into a Global Juggernaut",
    forensicSummary:
      "How Marvel revived a reprint book on the brink of cancellation into the greatest cultural franchise on Earth. Analyzing the introduction of the international second generation: Wolverine, Storm, Colossus, Nightcrawler, and Thunderbird on the island of Krakoa, initiating Chris Claremont's unmatched 16-year continuous literary masterwork.",
    relatedComic: {
      id: "GSX01",
      ticker: "GSX01",
      series: "Giant-Size X-Men",
      issue: "1",
      year: 1975,
      cgc98Fmv: 65000,
      rawFmv: 4200,
      census98Count: 285,
    },
    keyThemes: ["Bronze Age Revival", "International Ensemble", "Wolverine Full Team Debut", "Claremont Handwriting"],
  },
  {
    id: "cbg19-ch4",
    chapterNumber: 4,
    title: "Cosmic Tragedy & Editorial Warfare: The Phoenix & Dark Phoenix Saga",
    timecodeStart: "1:58:46",
    timecodeEnd: "2:48:10",
    startSeconds: 7126,
    durationMinutes: 49,
    headline: "John Byrne, Chris Claremont, and Jim Shooter: The Climax That Shook Marvel Editorial",
    forensicSummary:
      "A forensic dive into Jean Grey's cosmic apotheosis and descent into absolute madness as the Dark Phoenix, consuming the D'Bari star system. ComicBookGirl19 recounts the behind-the-scenes editorial battle where Marvel Editor-in-Chief Jim Shooter mandated Jean Grey's execution on the Blue Area of the Moon, creating the most famous certified issue of the Bronze Age.",
    relatedComic: {
      id: "XM137",
      ticker: "XM137",
      series: "The X-Men",
      issue: "137",
      year: 1980,
      cgc98Fmv: 12500,
      rawFmv: 180,
      census98Count: 420,
    },
    keyThemes: ["Dark Phoenix Saga", "Editorial Mandates", "Cosmic Tragedy", "Bronze Age Benchmark"],
  },
  {
    id: "cbg19-ch5",
    chapterNumber: 5,
    title: "Dystopian Climax: Days of Future Past & The Legacy of Mutantkind",
    timecodeStart: "2:48:11",
    timecodeEnd: "3:34:00",
    startSeconds: 10091,
    durationMinutes: 46,
    headline: "Sentinels, Concentration Camps, and the Template for Modern Sci-Fi Dystopia",
    forensicSummary:
      "The concluding serialized chapter dissects Uncanny X-Men #141-142: John Byrne and Chris Claremont's cautionary masterpiece depicting mutant genocide, Sentinel internment camps, and temporal desperation. Explaining why this two-issue arc became the primary narrative foundation for 20th Century Fox's $750M blockbuster film and current secondary market investment theses.",
    relatedComic: {
      id: "XM141",
      ticker: "XM141",
      series: "The Uncanny X-Men",
      issue: "141",
      year: 1981,
      cgc98Fmv: 3200,
      rawFmv: 140,
      census98Count: 680,
    },
    keyThemes: ["Days of Future Past", "Dystopian Science Fiction", "Sentinel Architecture", "Cinematic Adaptations"],
  },
];

export function XMenMasterclassSerialization() {
  const [activeChapterId, setActiveChapterId] = React.useState<string>("cbg19-ch1");

  const activeChapter = React.useMemo(() => {
    return CBG19_XMEN_CHAPTERS.find((c) => c.id === activeChapterId) || CBG19_XMEN_CHAPTERS[0];
  }, [activeChapterId]);

  return (
    <section className="rounded-2xl border border-indigo-500/30 bg-[#0A0D18] p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-500/20 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
            <Badge variant="outline" className="border-indigo-400/40 text-[10px] text-indigo-300 font-mono tracking-wider">
              PANEL PROFITS CULTURAL INTELLIGENCE INGESTION
            </Badge>
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-black text-slate-100 tracking-tight flex items-center gap-3">
            <Tv className="h-6 w-6 text-indigo-400" />
            <span>ComicBookGirl19: The Complete X-Men History Masterclass</span>
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
            Danika XXIX&apos;s definitive 3.5-hour epic sequential analysis, precision-serialized into 5 chronological chapters with timestamped video broadcasts and physical comic equity valuations.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge className="bg-indigo-600/30 text-indigo-300 border-indigo-500/40 text-xs font-mono">
            3h 34m Total Run · 5 Serialized Chapters
          </Badge>
        </div>
      </div>

      {/* Main Chapter Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Video Broadcast Embed & Timecode Bar (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Authentic Video Player Embed with Timecode Offset */}
          <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-indigo-500/30 bg-black shadow-lg">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?start=${activeChapter.startSeconds}&autoplay=0`}
              title={activeChapter.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>

          {/* Broadcast Timecode Control Banner */}
          <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-indigo-300">
              <Clock className="h-4 w-4" />
              <span>Current Timecode: {activeChapter.timecodeStart} - {activeChapter.timecodeEnd}</span>
              <span className="text-slate-500">({activeChapter.durationMinutes} min chapter)</span>
            </div>
            <a
              href={`https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=${activeChapter.startSeconds}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <span>Watch on YouTube</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Chapter Analytical Headline & Ingestion Memo */}
          <div className="rounded-lg bg-[#0e1424] border border-indigo-500/20 p-4 space-y-2.5">
            <div className="text-[10px] uppercase font-mono tracking-wider text-indigo-400 font-semibold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>PANEL PROFITS FORENSIC DOSSIER // CHAPTER {activeChapter.chapterNumber}</span>
            </div>
            <h3 className="text-base font-bold text-slate-100 leading-snug">
              {activeChapter.headline}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {activeChapter.forensicSummary}
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {activeChapter.keyThemes.map((theme, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/40 text-[10px] font-mono text-indigo-300">
                  {theme}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Serialized Chapter Selector & Associated Comic Equity (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Chapter Selector List */}
          <div className="rounded-xl border border-slate-800 bg-[#0d1220] p-4 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-semibold flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-indigo-400" /> Serialized Masterclass Chapters
              </span>
              <span className="text-[10px] font-mono text-indigo-400">Click to Inspect</span>
            </div>

            <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
              {CBG19_XMEN_CHAPTERS.map((ch) => {
                const isSelected = ch.id === activeChapterId;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChapterId(ch.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? "border-indigo-400 bg-indigo-600/20 text-slate-100 shadow-sm shadow-indigo-950"
                        : "border-slate-800/80 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                          isSelected
                            ? "bg-indigo-500/30 border-indigo-400/50 text-indigo-200"
                            : "bg-slate-800 border-slate-700 text-slate-400"
                        }`}>
                          CH {ch.chapterNumber}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{ch.timecodeStart} - {ch.timecodeEnd}</span>
                      </div>
                      <p className="text-xs font-semibold leading-tight line-clamp-1">
                        {ch.title}
                      </p>
                    </div>
                    {isSelected && <ChevronRight className="h-4 w-4 text-indigo-400 shrink-0 mt-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Landmark Comic Equity Card for Active Chapter */}
          <div className="rounded-xl border border-indigo-500/30 bg-[#10162a] p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> Landmark Comic Equity Ingested
              </span>
              <Badge variant="outline" className="border-indigo-400/50 text-[10px] text-indigo-300 font-mono">
                {activeChapter.relatedComic.ticker}
              </Badge>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-100">
                  {activeChapter.relatedComic.series} #{activeChapter.relatedComic.issue}
                </h4>
                <p className="text-xs text-slate-400 font-mono">
                  Published {activeChapter.relatedComic.year} · Certified Universal Blue Label
                </p>
              </div>

              <div className="text-right">
                <div className="text-lg font-black text-emerald-400 font-mono">
                  {formatCurrency(activeChapter.relatedComic.cgc98Fmv)}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">CGC 9.8 Fair Market Value</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-500 block text-[10px]">CGC 9.8 Census Pop:</span>
                <span className="text-cyan-300 font-semibold">{activeChapter.relatedComic.census98Count} known copies</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Raw Untamed FMV:</span>
                <span className="text-slate-200 font-semibold">{formatCurrency(activeChapter.relatedComic.rawFmv)}</span>
              </div>
            </div>

            <div className="pt-1">
              <Link
                href={`/comics?q=${encodeURIComponent(activeChapter.relatedComic.series)}`}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/40 text-xs font-semibold text-indigo-200 transition-colors shadow-sm"
              >
                <span>Inspect {activeChapter.relatedComic.series} in Market Terminal</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
