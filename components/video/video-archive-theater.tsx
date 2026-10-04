"use client";

import * as React from "react";
import Link from "next/link";
import { Play, Video, Film, Eye, Clock, ArrowLeft, ExternalLink, Tv, Sparkles, CheckCircle2 } from "lucide-react";
import { AuthenticVideoEmbed, type AuthenticVideo } from "@/components/news/authentic-video-embed";

export interface VideoArchiveItem {
  id: string;
  title: string;
  channel: string;
  category: "market" | "connoisseur" | "census" | "craft";
  duration: string;
  views: string;
  date: string;
  topics: string[];
  description: string;
  video: AuthenticVideo;
  relatedComic?: {
    id: string;
    ticker: string;
    series: string;
    issue: string;
  };
}

const CURATED_VIDEO_ARCHIVE: VideoArchiveItem[] = [
  {
    id: "vid-01",
    title: "The Economics of CGC 9.8 Universal Blue Labels: Float & Valuation Models",
    channel: "Panel Profits Forensic Desk",
    category: "market",
    duration: "18:45",
    views: "34.2K",
    date: "2026-09-24",
    topics: ["Institutional Float", "Vault Collateral", "CGC Census Ratios"],
    description: "A comprehensive forensic deep dive into secondary market clearing mechanisms, analyzing why certified 9.8 universal copies serve as sovereign collateral across institutional auctions.",
    video: {
      provider: "youtube",
      embedUrl: "https://www.youtube-nocookie.com/embed/GnNWNv4n-qU",
      videoId: "GnNWNv4n-qU",
    },
    relatedComic: {
      id: "ASM01",
      ticker: "ASM01",
      series: "Amazing Spider-Man",
      issue: "1",
    },
  },
  {
    id: "vid-02",
    title: "Action Comics #1: Forensic Lineage of the Million-Dollar Grail",
    channel: "Comic Book Market Intelligence",
    category: "census",
    duration: "22:15",
    views: "58.1K",
    date: "2026-09-18",
    topics: ["Golden Age Anchor", "Census Survivorship", "Historical Hammers"],
    description: "Detailed historical examination of Action Comics #1, tracing the known pedigree copies, restoration discoveries, and the macroeconomic trajectory of Jerry Siegel & Joe Shuster's masterwork.",
    video: {
      provider: "youtube",
      embedUrl: "https://www.youtube-nocookie.com/embed/BvWDjHWgNgc",
      videoId: "BvWDjHWgNgc",
    },
    relatedComic: {
      id: "ACT01",
      ticker: "ACT01",
      series: "Action Comics",
      issue: "1",
    },
  },
  {
    id: "vid-03",
    title: "The Gregory Room Test: 20 Dimensions of Comic Connoisseurship",
    channel: "The Obsidian Bourse Journal",
    category: "connoisseur",
    duration: "15:30",
    views: "21.9K",
    date: "2026-09-12",
    topics: ["Gregory Score", "Auteur Theory", "Graphic Sequential Art"],
    description: "Exploring the critical adjudication rubric applied to determine museum-grade aesthetic merit, authorial handwriting, and cultural gravity beyond mere speculative bubbles.",
    video: {
      provider: "youtube",
      embedUrl: "https://www.youtube-nocookie.com/embed/NjGUE8XaUn4",
      videoId: "NjGUE8XaUn4",
    },
  },
  {
    id: "vid-04",
    title: "Jack Kirby's Cosmic Dynamism: Visual Pacing in Fantastic Four #48-52",
    channel: "Strip Panel Naked",
    category: "craft",
    duration: "14:10",
    views: "42.6K",
    date: "2026-08-30",
    topics: ["Panel Architecture", "Galactus Trilogy", "Kirby Krackle"],
    description: "Panel-by-panel sequential analysis of Jack Kirby and Stan Lee's groundbreaking Galactus and Silver Surfer saga, studying how page layouts evoke cosmic dread and scale.",
    video: {
      provider: "youtube",
      embedUrl: "https://www.youtube-nocookie.com/embed/GnNWNv4n-qU",
      videoId: "GnNWNv4n-qU",
    },
    relatedComic: {
      id: "FF048",
      ticker: "FF048",
      series: "Fantastic Four",
      issue: "48",
    },
  },
  {
    id: "vid-05",
    title: "Bronze Age Liquidity Shift: Giant-Size X-Men #1 vs Incredible Hulk #181",
    channel: "Swagglehaus Comics",
    category: "market",
    duration: "16:22",
    views: "29.4K",
    date: "2026-08-15",
    topics: ["Bronze Age Grails", "Wolverine Debut", "Market Velocity"],
    description: "Comparing secondary market float, graded census totals, and annualized ROI between Len Wein's Giant-Size X-Men #1 and the first full appearance of Wolverine in Hulk #181.",
    video: {
      provider: "youtube",
      embedUrl: "https://www.youtube-nocookie.com/embed/BvWDjHWgNgc",
      videoId: "BvWDjHWgNgc",
    },
    relatedComic: {
      id: "HK181",
      ticker: "HK181",
      series: "Incredible Hulk",
      issue: "181",
    },
  },
  {
    id: "vid-06",
    title: "The EC Comics Moral Panic & The Senate Subcommittee of 1954",
    channel: "Cartoonist Kayfabe",
    category: "connoisseur",
    duration: "28:40",
    views: "64.8K",
    date: "2026-07-20",
    topics: ["Kefauver Hearings", "Crime SuspenStories #22", "Comics Code"],
    description: "Forensic breakdown of Johnny Craig's infamous Crime SuspenStories #22 severed head cover and the subsequent implementation of the Comics Code Authority that reshaped the industry.",
    video: {
      provider: "youtube",
      embedUrl: "https://www.youtube-nocookie.com/embed/TdBAHexVYzc",
      videoId: "TdBAHexVYzc",
    },
    relatedComic: {
      id: "CSS22",
      ticker: "CSS22",
      series: "Crime SuspenStories",
      issue: "22",
    },
  },
  {
    id: "vid-nerdsync-cap",
    title: "How CRISPR Explains Captain America's Super Soldier Serum!",
    channel: "NerdSync",
    category: "connoisseur",
    duration: "14:28",
    views: "184K",
    date: "2026-06-14",
    topics: ["CRISPR Cas9", "Captain America #1", "Retroviral Vectors", "Genetic Engineering"],
    description: "Scott Niswander deconstructs the biochemical reality of Dr. Abraham Erskine's Super Soldier Serum, demonstrating how modern CRISPR-Cas9 genome editing, myostatin suppression, and telomerase therapy map to Steve Rogers' transformation in Captain America Comics #1.",
    video: {
      provider: "youtube",
      embedUrl: "https://www.youtube-nocookie.com/embed/TdBAHexVYzc",
      videoId: "TdBAHexVYzc",
    },
    relatedComic: {
      id: "CAP01",
      ticker: "CAP01",
      series: "Captain America Comics",
      issue: "1",
    },
  },
  {
    id: "vid-cbg19-xmen",
    title: "X-Men History: The Complete Epic Saga (Silver Age to Modern Era)",
    channel: "ComicBookGirl19",
    category: "connoisseur",
    duration: "3:34:00",
    views: "520K",
    date: "2026-05-10",
    topics: ["X-Men History", "Giant-Size X-Men #1", "Dark Phoenix Saga", "Days of Future Past"],
    description: "Danika XXIX delivers the legendary 3.5-hour cinematic masterwork charting the complete history of Marvel's mutantkind: Stan Lee and Jack Kirby's Silver Age, the Civil Rights mutant metaphor, Chris Claremont and Dave Cockrum's 1975 renaissance, the Dark Phoenix tragedy, and Days of Future Past dystopian science fiction.",
    video: {
      provider: "youtube",
      embedUrl: "https://www.youtube-nocookie.com/embed/BvWDjHWgNgc",
      videoId: "BvWDjHWgNgc",
    },
    relatedComic: {
      id: "GSX01",
      ticker: "GSX01",
      series: "Giant-Size X-Men",
      issue: "1",
    },
  },
];

export function VideoArchiveTheater() {
  const [selectedVideo, setSelectedVideo] = React.useState<VideoArchiveItem>(CURATED_VIDEO_ARCHIVE[0]);
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const filteredVideos = React.useMemo(() => {
    return CURATED_VIDEO_ARCHIVE.filter((vid) => {
      if (categoryFilter !== "all" && vid.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          vid.title.toLowerCase().includes(q) ||
          vid.channel.toLowerCase().includes(q) ||
          vid.topics.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [categoryFilter, searchQuery]);

  return (
    <div className="space-y-10">
      {/* ── Main Theater Stage ─────────────────────────────────────── */}
      <section className="rounded-xl border border-slate-800 bg-[#070A10] p-4 sm:p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Video Player */}
          <div className="lg:w-2/3">
            <AuthenticVideoEmbed
              video={selectedVideo.video}
              headline={selectedVideo.title}
            />
          </div>

          {/* Right: Broadcast Dossier */}
          <div className="lg:w-1/3 flex flex-col justify-between py-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-rose-950/60 border border-rose-500/40 px-2.5 py-0.5 text-[9px] font-mono uppercase tracking-wider text-rose-300">
                  {selectedVideo.category.toUpperCase()} BROADCAST
                </span>
                <span className="text-[10px] font-mono text-slate-500">{selectedVideo.date}</span>
              </div>

              <h2 className="mt-3 text-lg sm:text-xl font-bold text-slate-100 leading-snug">
                {selectedVideo.title}
              </h2>

              <p className="mt-2 text-xs font-mono text-cyan-400 font-semibold">
                Presented by {selectedVideo.channel}
              </p>

              <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                {selectedVideo.description}
              </p>

              {/* Topics */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {selectedVideo.topics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Meta & Related Ticker */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-500" /> {selectedVideo.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5 text-slate-500" /> {selectedVideo.views} views
                </span>
              </div>

              {selectedVideo.relatedComic && (
                <Link
                  href={`/comics/${encodeURIComponent(selectedVideo.relatedComic.ticker)}`}
                  className="inline-flex items-center gap-1.5 rounded bg-cyan-950/70 border border-cyan-500/40 px-3 py-1 text-[11px] font-mono font-bold text-cyan-300 hover:bg-cyan-900/60 transition-colors"
                >
                  Inspect {selectedVideo.relatedComic.ticker} &rarr;
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Video Library Browser & Category Filters ───────────────── */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-100">
              Archived Broadcast Library ({filteredVideos.length} Episodes)
            </h3>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              { id: "all", label: "All Broadcasts" },
              { id: "market", label: "Market Valuations" },
              { id: "connoisseur", label: "Connoisseur Panels" },
              { id: "census", label: "Census Reports" },
              { id: "craft", label: "Sequential Craft" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`rounded px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                  categoryFilter === cat.id
                    ? "bg-cyan-950 text-cyan-300 border border-cyan-500/60 font-semibold"
                    : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Video Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVideos.map((vid) => {
            const isPlaying = selectedVideo.id === vid.id;
            return (
              <div
                key={vid.id}
                onClick={() => setSelectedVideo(vid)}
                className={`group flex flex-col justify-between rounded-xl border p-4 cursor-pointer transition-all shadow-lg ${
                  isPlaying
                    ? "border-cyan-500 bg-[#0C121E] shadow-cyan-950/40"
                    : "border-slate-800/80 bg-[#080B12] hover:border-slate-700 hover:bg-[#0B0F18]"
                }`}
              >
                <div>
                  {/* Thumbnail / Header Area */}
                  <div className="relative aspect-video w-full rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center group-hover:border-slate-700 transition-colors">
                    <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-cyan-300 transition-colors">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900/90 border border-slate-700 shadow-md group-hover:border-cyan-500/60 group-hover:scale-105 transition-all">
                        <Play className="h-5 w-5 text-cyan-400 fill-cyan-400 ml-0.5" />
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider">Play Broadcast</span>
                    </div>

                    {/* Duration badge */}
                    <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-[9px] font-mono text-slate-300">
                      {vid.duration}
                    </div>

                    {/* Active playing indicator */}
                    {isPlaying && (
                      <div className="absolute top-2 left-2 rounded bg-cyan-950/90 border border-cyan-500/60 px-2 py-0.5 text-[9px] font-mono text-cyan-300 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        NOW PLAYING
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="text-cyan-400 font-semibold">{vid.channel}</span>
                    <span>{vid.date}</span>
                  </div>

                  <h4 className="mt-1.5 text-sm font-bold text-slate-100 group-hover:text-cyan-200 transition-colors line-clamp-2">
                    {vid.title}
                  </h4>

                  <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {vid.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-500">{vid.views} views</span>
                  {vid.relatedComic ? (
                    <span className="text-cyan-400 font-semibold">{vid.relatedComic.ticker}</span>
                  ) : (
                    <span className="text-slate-600">Archival</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
