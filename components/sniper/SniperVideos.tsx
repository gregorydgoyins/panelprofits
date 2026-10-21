"use client";

import { useState } from "react";
import { videoTopic } from "@/lib/sniper/research-title";

interface Vid { videoId: string; title: string; channel: string; thumbnail: string; kind: "book" | "creator" | "series" | "explainer" }

const LABEL: Record<Vid["kind"], string> = {
  book: "This book",
  creator: "Creator",
  series: "This series",
  explainer: "How the money terms work",
};

/** Small video cards for the left column. Nothing is loaded until a card is clicked, so the thumbnail is the only cost. */
export function SniperVideos({ series, issue, videos, loading, archive }: { series: string; issue: string; videos: Vid[]; loading: boolean; archive?: { title: string; videoUrl: string; poster?: string } }) {
  const [playing, setPlaying] = useState<string | null>(null);

  if (!series) return null;
  const archiveQ = encodeURIComponent(`${series}${issue ? " #" + issue : ""}`);

  const seen = new Set<string>();
  const related = videos.filter(v => v.kind !== "explainer" && !seen.has(v.videoId) && Boolean(seen.add(v.videoId))).slice(0, archive ? 1 : 2);
  const explainer = videos.find(v => v.kind === "explainer" && !related.some(r => r.videoId === v.videoId));
  const selected = [...related, ...(explainer ? [explainer] : [])].slice(0, archive ? 2 : 3);
  return (
    <div className="w-full space-y-2">
      {archive && (
        <div className="rounded-lg border border-slate-800 bg-slate-950/80 overflow-hidden">
          <video controls preload="none" className="w-full aspect-video bg-black" poster={archive.poster} src={archive.videoUrl} />
          <div className="p-2 space-y-0.5">
            <div className="text-[10px] font-mono uppercase text-rose-300">ComicBase archive</div>
            <div className="text-xs text-slate-200 leading-snug line-clamp-2">{archive.title}</div>
          </div>
        </div>
      )}
      <h3 className="text-sm font-semibold text-rose-300 w-full">Watch: this issue &amp; financial context</h3>
      {loading && <p className="text-xs text-slate-400">Reading saved videos about {videoTopic(series)}…</p>}
      {!loading && !videos.some(v => v.kind !== "explainer") && <p className="text-xs text-slate-400">No related videos are stored for this issue. Browse the topic search below.</p>}
      {selected.map((v) => (
        <div key={v.videoId} className="rounded-lg border border-slate-800 bg-slate-950/80 overflow-hidden">
          {v.kind === "explainer" && <h3 className="p-3 text-sm font-semibold text-emerald-300 border-b border-slate-800">Financial explainer</h3>}
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
              <button type="button" onClick={() => setPlaying(v.videoId)} className="absolute inset-0 w-full h-full group" aria-label={`Play ${v.title}`}>
                <img src={v.thumbnail} alt="" loading="eager" decoding="async" className="w-full h-full object-cover" />
                <span className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition text-white text-2xl">▶</span>
              </button>
            )}
          </div>
          <div className="p-2 space-y-0.5">
            <div className="text-[10px] font-mono uppercase text-rose-300">{LABEL[v.kind]}</div>
            <div className="text-xs text-slate-200 leading-snug line-clamp-2">{v.title}</div>
            <div className="text-[10px] font-mono text-slate-500 truncate">{v.channel}</div>
          </div>
        </div>
      ))}
      <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
        <a href={`/video-archive?q=${archiveQ}`} className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 flex items-center justify-between transition">
          <span>▶ Market archive</span><span>↗</span>
        </a>
        <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(videoTopic(series) + " comics history")}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-rose-300 flex items-center justify-between transition">
          <span>▶ More related videos</span><span>↗</span>
        </a>
      </div>
    </div>
  );
}
