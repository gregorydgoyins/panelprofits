"use client";

import * as React from "react";
import { Play, Pause, Volume2, VolumeX, Radio, Sparkles, UserCheck } from "lucide-react";
import type { NewsStory } from "@/lib/news/feed";
import type { PresenterAvatar } from "@/lib/news/presenters";

export function PresenterPlayer({
  story,
  presenter,
  categoryTag,
}: {
  story: NewsStory;
  presenter: PresenterAvatar;
  categoryTag: string;
}) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
  const [isMuted, setIsMuted] = React.useState<boolean>(true);
  const [isLoaded, setIsLoaded] = React.useState<boolean>(false);

  const togglePlay = React.useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [isPlaying]);

  const toggleMute = React.useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  return (
    <div className="overflow-hidden rounded border border-slate-800 bg-[#06080E] shadow-xl">
      {/* Header HUD */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-[#080C14] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-rose-300">
            {categoryTag}
          </span>
        </div>
        <span className={`inline-flex items-center gap-1 font-mono text-[10px] tracking-wider px-2 py-0.5 rounded border ${presenter.badgeBorder} ${presenter.badgeBg} ${presenter.badgeText}`}>
          <UserCheck className="h-3 w-3" />
          {presenter.name}
        </span>
      </div>

      {/* Video Monitor Stage */}
      <div className="relative aspect-video w-full bg-[#030407]">
        <video
          ref={videoRef}
          src={presenter.videoSampleUrl}
          poster={presenter.avatarImage}
          playsInline
          autoPlay
          loop
          muted={isMuted}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onLoadedData={() => {
            setIsLoaded(true);
            if (videoRef.current) {
              videoRef.current.play().catch(() => {});
            }
          }}
          className="h-full w-full object-cover"
        />

        {/* Lower Third Overlay HUD */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-4">
              <span className="font-mono text-[9px] uppercase tracking-widest text-amber-300">
                ON AIR // {presenter.name.toUpperCase()} · {presenter.role.toUpperCase()}
              </span>
              <p className="truncate text-xs font-semibold text-slate-100 mt-0.5">
                {story.headline}
              </p>
            </div>

            {/* Play & Mute Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={toggleMute}
                className="flex h-8 w-8 items-center justify-center rounded border border-slate-700 bg-slate-900/80 text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
                title={isMuted ? "Unmute Audio" : "Mute Audio"}
              >
                {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
              </button>

              <button
                onClick={togglePlay}
                className="flex h-8 w-8 items-center justify-center rounded border border-amber-500/60 bg-amber-950/60 text-amber-300 hover:bg-amber-900/80 transition-colors"
                title={isPlaying ? "Pause Broadcast" : "Play Broadcast"}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
