"use client";

import { useEffect, useState } from "react";
import { videoTopic } from "@/lib/sniper/research-title";

interface Vid { videoId: string; title: string; channel: string; thumbnail: string; kind: "book" | "creator" | "series" | "explainer" }

const LABEL: Record<Vid["kind"], string> = {
  book: "This book",
  creator: "Creator",
  series: "This series",
  explainer: "How the money terms work",
};

/** Small video cards for the left column. Nothing is loaded until a card is clicked, so the thumbnail is the only cost. */
export function SniperVideos({ series, issue, creators, archive }: { series: string; issue: string; creators?: string[]; archive?: { title: string; videoUrl: string; poster?: string } }) {
  const [videos, setVideos] = useState<Vid[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    setLoading(true);
    setVideos([]);
    setPlaying(null);
    if (!series) return;
    const qs = new URLSearchParams({ series, issue, creators: (creators ?? []).join("|") });
    fetch(`/api/sniper/videos?${qs}`)
      .then((r) => (r.ok ? r.json() : { videos: [] }))
      .then((j) => { if (live) { setVideos(Array.isArray(j.videos) ? j.videos : []); setLoading(false); } })
      .catch(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [series, issue, (creators ?? []).join("|")]);

  if (!series) return null;
  const archiveQ = encodeURIComponent(`${series}${issue ? " #" + issue : ""}`);

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
      <h3 className="text-sm font-semibold text-rose-300 w-full">Related comics &amp; creator videos</h3>
      {loading && <p className="text-xs text-slate-400">Finding videos about {videoTopic(series)}…</p>}
      {!loading && !videos.some(v => v.kind !== "explainer") && <p className="text-xs text-slate-400">No related videos returned by the video provider. Browse the topic search below.</p>}
      {[...videos.filter(v => v.kind !== "explainer"), ...videos.filter(v => v.kind === "explainer").slice(0, 1)].map((v) => (
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.thumbnail} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
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
