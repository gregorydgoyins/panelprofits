"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Film, Play, UserCheck, Clock, Monitor, ExternalLink, Sparkles } from "lucide-react";
import { COMICBASE_ARCHIVE_VIDEOS, type ComicBaseVideoRecord } from "@/lib/video/comicbase-archive";

export function ComicBaseArchiveTheater() {
  const [selectedVideo, setSelectedVideo] = useState<ComicBaseVideoRecord>(COMICBASE_ARCHIVE_VIDEOS[0]);
  const [filter, setFilter] = useState<"all" | "interview" | "retrospective">("all");

  const filteredVideos = COMICBASE_ARCHIVE_VIDEOS.filter((v) => {
    if (filter === "all") return true;
    return v.type === filter;
  });

  return (
    <section className="space-y-6 rounded-2xl border border-rose-500/20 bg-[#070A12] p-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-rose-400">
            <Film className="h-3.5 w-3.5" /> Primary-Source Archival Theater · ComicBase™ Vault
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
            Creator Interviews & Masterclass Retrospectives
          </h2>
          <p className="mt-1.5 text-xs text-slate-400 max-w-2xl leading-relaxed">
            Archival primary-source video recordings featuring legendary creators including Julius Schwartz, Frank Miller, Garth Ennis, Mark Waid, and Scott McCloud analyzing industry-defining issues.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg border transition-colors ${
              filter === "all"
                ? "bg-rose-950/60 border-rose-500/60 text-rose-300 font-semibold"
                : "border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200"
            }`}
          >
            All Recordings ({COMICBASE_ARCHIVE_VIDEOS.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("interview")}
            className={`px-3 py-1.5 rounded-lg border transition-colors ${
              filter === "interview"
                ? "bg-rose-950/60 border-rose-500/60 text-rose-300 font-semibold"
                : "border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200"
            }`}
          >
            Interviews Only
          </button>
          <button
            type="button"
            onClick={() => setFilter("retrospective")}
            className={`px-3 py-1.5 rounded-lg border transition-colors ${
              filter === "retrospective"
                ? "bg-rose-950/60 border-rose-500/60 text-rose-300 font-semibold"
                : "border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200"
            }`}
          >
            Retrospectives Only
          </button>
        </div>
      </div>

      {/* Main Active Player Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Active Video Screen (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative overflow-hidden rounded-xl border border-slate-700 bg-black aspect-video flex items-center justify-center shadow-2xl">
            <video
              key={selectedVideo.id}
              controls
              playsInline
              autoPlay={false}
              src={selectedVideo.videoUrl}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-[#0B0F19] p-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded bg-rose-950/60 px-2 py-0.5 text-[10px] font-mono text-rose-300 border border-rose-700/50">
                {selectedVideo.type === "interview" ? "PRIMARY-SOURCE CREATOR INTERVIEW" : "ISSUE RETROSPECTIVE"}
              </span>
              <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-cyan-400" /> {selectedVideo.duration}s
                </span>
                <span className="flex items-center gap-1">
                  <Monitor className="h-3 w-3 text-emerald-400" /> {selectedVideo.resolution}
                </span>
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-100">{selectedVideo.title}</h3>
            <p className="text-xs font-medium text-rose-300 font-mono">
              FEATURING: {selectedVideo.creatorOrSubject.toUpperCase()}
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">{selectedVideo.headline}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{selectedVideo.description}</p>
          </div>
        </div>

        {/* Playlist Queue (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-800 pb-2">
            <span>Archival Queue ({filteredVideos.length})</span>
            <span className="text-[10px] text-cyan-400">H.264 Audio/Visual</span>
          </div>

          <div className="max-h-[580px] overflow-y-auto space-y-2.5 pr-1 focus-visible:outline-none">
            {filteredVideos.map((video) => {
              const isCurrent = video.id === selectedVideo.id;
              return (
                <button
                  type="button"
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className={`w-full text-left rounded-xl p-3 border transition-all duration-150 ${
                    isCurrent
                      ? "border-rose-500/60 bg-rose-950/20 shadow-[0_0_15px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/40"
                      : "border-slate-800/80 bg-[#0C101A] hover:border-slate-700 hover:bg-[#101524]"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg mt-0.5 ${
                        isCurrent
                          ? "bg-rose-500 text-slate-950 shadow-md"
                          : "bg-slate-800/80 text-slate-300 border border-slate-700/60"
                      }`}
                    >
                      <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 text-[10px] font-mono text-slate-400">
                        <span className="truncate text-rose-400">{video.publisher}</span>
                        <span>{video.duration}s</span>
                      </div>
                      <div className="text-xs font-semibold text-slate-100 truncate mt-0.5">
                        {video.title}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {video.creatorOrSubject}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
