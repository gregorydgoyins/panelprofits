import React from "react";
import type { ComicBaseVideoRecord } from "@/lib/video/comicbase-archive";

interface VideoIntelligenceCardProps {
  cbVideo?: ComicBaseVideoRecord | null;
}

function formatDuration(d: unknown): string | null {
  if (typeof d === "number" && d > 0) return `${Math.floor(d / 60)}:${(d % 60).toString().padStart(2, "0")}`;
  if (typeof d === "string" && d.trim()) return d.trim();
  return null;
}

/** The ComicBase archive video for this book. With no archive video on file the card does not render. */
export function VideoIntelligenceCard({ cbVideo }: VideoIntelligenceCardProps) {
  if (!cbVideo?.videoUrl) return null;
  const duration = formatDuration(cbVideo.duration);

  return (
    <div className="space-y-3 rounded-xl border border-slate-800 bg-[#070C18] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">Video</span>
        <span className="text-[10px] text-slate-500">ComicBase archive</span>
      </div>
      <div className="relative aspect-video overflow-hidden rounded-lg border border-slate-800 bg-black">
        <video src={cbVideo.videoUrl} controls preload="metadata" className="h-full w-full object-cover">
          Your browser does not support HTML5 video.
        </video>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          {cbVideo.headline && <strong className="text-xs font-semibold text-white">{cbVideo.headline}</strong>}
          {duration && <span className="text-[10px] text-slate-400">{duration}</span>}
        </div>
        {cbVideo.description && <p className="text-xs leading-relaxed text-slate-300">{cbVideo.description}</p>}
      </div>
    </div>
  );
}
