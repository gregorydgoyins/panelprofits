"use client";

import { useState } from "react";
import { videoTopic } from "@/lib/sniper/research-title";

export interface Vid {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  kind: "book" | "creator" | "series" | "explainer" | "era";
}

const KIND_METADATA: Record<Vid["kind"], { label: string; tagClass: string }> = {
  book: {
    label: "★ This Issue / Key Milestone",
    tagClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  },
  series: {
    label: "✦ Series & Character Lore",
    tagClass: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  },
  creator: {
    label: "✍ Creator Retrospective",
    tagClass: "bg-rose-500/20 text-rose-300 border-rose-500/40",
  },
  era: {
    label: "⏳ Era & Macro History",
    tagClass: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
  },
  explainer: {
    label: "⚖ Market & Sunk Cost Mechanics",
    tagClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  },
};

/**
 * Sniper Videos & Educational Reels component.
 * Displays issue deep-dives, series retrospectives, creator history,
 * era market evolution, and financial underwriting explainers.
 */
export function SniperVideos({
  series,
  issue,
  videos,
  loading,
  archive,
}: {
  series: string;
  issue: string;
  videos: Vid[];
  loading: boolean;
  archive?: { title: string; videoUrl: string; poster?: string };
}) {
  const [playing, setPlaying] = useState<string | null>(null);

  if (!series) return null;
  const archiveQ = encodeURIComponent(`${series}${issue ? " #" + issue : ""}`);

  const seen = new Set<string>();
  const related = videos
    .filter((v) => v.kind !== "explainer" && !seen.has(v.videoId) && Boolean(seen.add(v.videoId)))
    .slice(0, archive ? 2 : 4);
  const explainer = videos.find((v) => v.kind === "explainer" && !related.some((r) => r.videoId === v.videoId));
  const selected = [...related, ...(explainer ? [explainer] : [])].slice(0, archive ? 3 : 5);

  return (
    <div className="w-full space-y-3">
      {archive && (
        <div className="rounded-lg border border-slate-800 bg-slate-950/80 overflow-hidden">
          <video
            controls
            preload="none"
            className="w-full aspect-video bg-black"
            poster={archive.poster}
            src={archive.videoUrl}
          />
          <div className="p-2 space-y-0.5">
            <div className="text-[10px] font-mono uppercase text-rose-300">ComicBase archive</div>
            <div className="text-xs text-slate-200 leading-snug line-clamp-2">{archive.title}</div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-rose-300">
          Documentary Reels &amp; Educational Context
        </h3>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30">
          {selected.length} Curated Reels
        </span>
      </div>

      {loading && (
        <p className="text-xs font-mono text-slate-400 py-3 text-center animate-pulse">
          Loading intelligence reels for {videoTopic(series)} &amp; macro era…
        </p>
      )}

      {selected.map((v) => {
        const meta = KIND_METADATA[v.kind] || KIND_METADATA.series;
        return (
          <div
            key={v.videoId}
            className="rounded-xl border border-slate-800 bg-black/70 overflow-hidden shadow-md transition-all hover:border-slate-700"
          >
            <div className="relative aspect-video bg-black">
              {playing === v.videoId ? (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube-nocookie.com/embed/${v.videoId}?autoplay=1&rel=0`}
                  title={v.title}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setPlaying(v.videoId)}
                  className="absolute inset-0 w-full h-full group"
                  aria-label={`Play ${v.title}`}
                >
                  <img
                    src={v.thumbnail}
                    alt=""
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="h-10 w-10 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                      ▶
                    </span>
                  </span>
                </button>
              )}
            </div>
            <div className="p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border font-semibold tracking-wider ${meta.tagClass}`}
                >
                  {meta.label}
                </span>
                <span className="text-[10px] font-mono text-slate-400 truncate max-w-[150px]">
                  {v.channel}
                </span>
              </div>
              <div className="text-xs font-sans font-medium text-slate-100 leading-snug line-clamp-2">
                {v.title}
              </div>
            </div>
          </div>
        );
      })}

      <div className="grid grid-cols-2 gap-2 font-mono text-[11px] pt-1">
        <a
          href={`/video-archive?q=${archiveQ}`}
          className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-cyan-300 flex items-center justify-between transition shadow-sm"
        >
          <span>▶ Market archive</span>
          <span>↗</span>
        </a>
        <a
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
            videoTopic(series) + " comics history documentary"
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/40 text-rose-300 flex items-center justify-between transition shadow-sm"
        >
          <span>▶ YouTube documentary</span>
          <span>↗</span>
        </a>
      </div>
    </div>
  );
}
