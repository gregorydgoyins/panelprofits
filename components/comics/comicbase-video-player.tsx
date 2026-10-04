"use client";

import React, { useState } from "react";
import { Film, Play, Sparkles, UserCheck, ShieldCheck, Clock, Monitor } from "lucide-react";
import type { ComicBaseVideoRecord } from "@/lib/video/comicbase-archive";

interface ComicBaseVideoPlayerProps {
  video: ComicBaseVideoRecord;
}

export function ComicBaseVideoPlayer({ video }: ComicBaseVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="rounded-xl border border-rose-500/30 bg-[#0B0E17] p-5 shadow-2xl space-y-4">
      {/* Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40">
            <Film className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-rose-400">
                Primary-Source Creator Archive
              </span>
              <span className="rounded bg-rose-950/60 px-1.5 py-0.5 text-[9px] font-mono text-rose-300 border border-rose-700/50">
                {video.type === "interview" ? "CREATOR INTERVIEW" : "ISSUE RETROSPECTIVE"}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-100">{video.title}</h3>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-cyan-400" />
            <span>{video.duration}s</span>
          </div>
          <div className="flex items-center gap-1">
            <Monitor className="h-3 w-3 text-emerald-400" />
            <span>{video.resolution}</span>
          </div>
        </div>
      </div>

      {/* Video Streaming Player */}
      <div className="relative overflow-hidden rounded-lg border border-slate-800 bg-black aspect-video max-h-[440px] flex items-center justify-center">
        <video
          controls
          playsInline
          preload="metadata"
          src={video.videoUrl}
          className="w-full h-full object-contain"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      </div>

      {/* Editorial Intelligence Briefing */}
      <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-3.5 space-y-1.5">
        <div className="flex items-center gap-2">
          <UserCheck className="h-3.5 w-3.5 text-rose-400" />
          <span className="text-xs font-semibold text-rose-300 font-mono">
            FEATURING: {video.creatorOrSubject.toUpperCase()}
          </span>
        </div>
        <p className="text-xs font-medium text-slate-200">{video.headline}</p>
        <p className="text-xs text-slate-400 leading-relaxed">{video.description}</p>
      </div>

      {/* Provenance Footer */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/60">
        <span className="flex items-center gap-1">
          <ShieldCheck className="h-3 w-3 text-cyan-400" />
          Provenance: ComicBase™ Human Computing Master Archive (H.264 Audio/Visual)
        </span>
        <span className="text-slate-600">Local Zero-Buffer Stream</span>
      </div>
    </div>
  );
}
