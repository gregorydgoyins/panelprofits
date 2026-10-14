"use client";

import { useEffect, useState } from "react";

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
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    setVideos([]);
    setPlaying(null);
    if (!series) return;
    const qs = new URLSearchParams({ series, issue, creators: (creators ?? []).join("|") });
    fetch(`/api/sniper/videos?${qs}`)
      .then((r) => (r.ok ? r.json() : { videos: [] }))
      .then((j) => { if (live) setVideos(Array.isArray(j.videos) ? j.videos : []); })
      .catch(() => {});
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
      {videos.map((v) => (
        <div key={v.videoId} className="rounded-lg border border-slate-800 bg-slate-950/80 overflow-hidden">
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
        <a href={`/video-archive?q=${archiveQ}`} className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-rose-300 flex items-center justify-between transition">
          <span>▶ Key issue spotlight</span><span>↗</span>
        </a>
      </div>
    </div>
  );
}
