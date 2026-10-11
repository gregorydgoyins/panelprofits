import React from "react";
import type { ComicBaseVideoRecord } from "@/lib/video/comicbase-archive";

interface VideoIntelligenceCardProps {
  series: string;
  issueNumber: string;
  cbVideo?: ComicBaseVideoRecord | null;
  writer?: string;
  penciler?: string;
}

export function VideoIntelligenceCard({
  series,
  issueNumber,
  cbVideo,
  writer,
  penciler,
}: VideoIntelligenceCardProps) {
  const youtubeQuery = `${series} #${issueNumber} comic review CGC key`;
  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(youtubeQuery)}`;

  return (
    <div className="bg-[#070C18] border border-cyan-500/40 rounded-xl p-4 sm:p-5 space-y-4 shadow-xl font-mono">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-bold text-cyan-400 uppercase flex items-center gap-1.5">
            <span>🎥</span> PRIMARY SOURCE VIDEO INTELLIGENCE &amp; ARCHIVAL RETROSPECTIVE
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
            {cbVideo ? "ComicBase Archival Master" : "Curated Video Intelligence"}
          </span>
        </div>
        <a
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-cyan-300 hover:text-white px-2.5 py-1 rounded bg-slate-900 border border-cyan-500/30 flex items-center gap-1 transition"
        >
          <span>Search YouTube CGC Reviews</span>
          <span>↗</span>
        </a>
      </div>

      {cbVideo ? (
        <div className="space-y-3">
          <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-800 bg-black shadow-lg">
            <video
              src={cbVideo.videoUrl}
              controls
              className="w-full h-full object-cover"
              poster={`/api/placeholder/640/360`}
            >
              Your browser does not support HTML5 video streaming.
            </video>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <strong className="text-white text-xs font-bold uppercase">{cbVideo.headline}</strong>
              <span className="text-[10px] text-slate-400">
                Duration: {typeof cbVideo.duration === "number" ? `${Math.floor(cbVideo.duration / 60)}:${(cbVideo.duration % 60).toString().padStart(2, "0")}` : cbVideo.duration}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {cbVideo.description}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-black/60 rounded-lg p-4 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎬</span>
              <div>
                <strong className="text-white text-xs font-bold block uppercase">
                  {series} #{issueNumber} Video Dossier
                </strong>
                <span className="text-[10px] text-slate-400 font-sans">
                  {writer || penciler ? `Featuring historical retrospectives on ${[writer, penciler].filter(Boolean).join(" & ")}` : "CGC unboxing & market analysis"}
                </span>
              </div>
            </div>
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase transition shadow-md flex items-center gap-1.5"
            >
              <span>▶ Watch Reviews</span>
              <span>↗</span>
            </a>
          </div>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Directly cross-references secondary market video commentary, slab grading unboxings, and creator retrospectives for {series} #{issueNumber}.
          </p>
        </div>
      )}
    </div>
  );
}
