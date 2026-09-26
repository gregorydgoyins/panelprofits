"use client";

import * as React from "react";
import { Play, Pause, Volume2, VolumeX, Tv, Radio } from "lucide-react";
import { buildAnchorScript } from "@/lib/news/broadcast-script";
import type { NewsStory } from "@/lib/news/feed";

interface BroadcastPlayerProps {
  story: NewsStory;
}

export function BroadcastPlayer({ story }: BroadcastPlayerProps) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const scriptPacket = React.useMemo(() => {
    return buildAnchorScript({
      headline: story?.headline,
      summary: story?.summary,
      source: story?.source,
      published_at: story?.publishedAt,
    });
  }, [story?.id, story?.headline, story?.summary]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-amber-500/30 bg-[#080B14] shadow-2xl">
      {/* Native Video Stage */}
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src="/media/newsdesk-loop.mp4"
          poster="/media/newsdesk-poster.jpg"
          playsInline
          loop
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            if (v.duration > 0) {
              setProgress((v.currentTime / v.duration) * 100);
            }
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Live Broadcast Badge */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded border border-rose-500/40 bg-[#060A12]/80 px-2.5 py-1 text-[9px] font-mono tracking-wider text-rose-300 backdrop-blur-md">
          <Radio className={`h-3 w-3 ${isPlaying ? "animate-pulse text-rose-500" : "text-slate-400"}`} />
          <span>{isPlaying ? "LIVE BROADCAST" : "STANDBY READY"}</span>
        </div>

        {/* Over-the-Shoulder Story Graphic */}
        {story.imageUrl && (
          <div className="absolute top-3 left-3 z-10 w-28 sm:w-36 rounded border border-amber-400/50 bg-[#06080E]/90 p-1.5 shadow-xl backdrop-blur-md">
            <div className="text-[8px] font-mono text-amber-300 uppercase tracking-widest border-b border-slate-800 pb-0.5 mb-1">
              KEY GRAPHIC
            </div>
            <img src={story.imageUrl} alt="Story Graphic" className="h-14 w-full object-cover rounded" />
          </div>
        )}

        {/* Lower Third News Banner Overlay */}
        <div className="absolute bottom-3 left-3 right-3 z-10 rounded border border-amber-400/40 bg-[#060A12]/90 p-2.5 shadow-2xl backdrop-blur-md">
          <div className="text-[9px] font-mono uppercase tracking-widest text-amber-300 font-semibold mb-0.5">
            PANEL PROFITS BROADCAST // {story.source}
          </div>
          <div className="text-xs font-semibold text-slate-100 truncate">{scriptPacket.headline}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-slate-900">
        <div className="h-full bg-amber-400 transition-all duration-100" style={{ width: `${progress}%` }} />
      </div>

      {/* Modern Player Controls Bar */}
      <div className="flex items-center justify-between border-t border-slate-800/80 bg-[#0A0E18] px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className="flex items-center gap-2 rounded bg-amber-400 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-300 transition-colors"
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4 fill-slate-950" /> PAUSE
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-slate-950" /> PLAY VIDEO
              </>
            )}
          </button>

          <button
            type="button"
            onClick={toggleMute}
            className="flex items-center gap-1.5 rounded border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs font-mono text-slate-300 hover:border-amber-400/50 hover:text-amber-200 transition-colors"
          >
            {isMuted ? (
              <>
                <VolumeX className="h-4 w-4 text-rose-400" /> UNMUTE
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 text-emerald-400" /> AUDIO ON
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
          <Tv className="h-3.5 w-3.5 text-amber-400" /> 1080P HD BROADCAST
        </div>
      </div>
    </div>
  );
}
