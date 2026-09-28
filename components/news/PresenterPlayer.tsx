"use client";

import * as React from "react";
import { Play, Pause, Volume2, VolumeX, Sparkles, UserCheck } from "lucide-react";
import type { PresenterProfile } from "@/lib/video/pipeline";

interface PresenterPlayerProps {
  headline: string;
  videoUrl: string;
  posterUrl?: string;
  transcript?: string;
  presenter: PresenterProfile;
  categoryTag?: string;
}

export function PresenterPlayer({
  headline,
  videoUrl,
  posterUrl,
  transcript,
  presenter,
  categoryTag = "MARKET BROADCAST",
}: PresenterPlayerProps) {
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
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [isPlaying]);

  const toggleMute = React.useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  return (
    <div className="overflow-hidden rounded-lg border border-cyan-500/40 bg-[#06080E] shadow-[0_0_30px_rgba(6,182,212,0.12)]">
      {/* Header HUD */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-[#080C14] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-300">
            {categoryTag}
          </span>
        </div>
        <span
          className={`inline-flex items-center gap-1 font-mono text-[10px] tracking-wider px-2 py-0.5 rounded border ${presenter.badgeBorder} ${presenter.badgeBg} ${presenter.badgeText}`}
        >
          <UserCheck className="h-3 w-3" />
          {presenter.name}
        </span>
      </div>

      {/* Video Monitor Stage */}
      <div
        className="relative aspect-video w-full bg-[#030407] bg-cover bg-center"
        style={{ backgroundImage: `url(${posterUrl || presenter.avatarImage})` }}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl || presenter.avatarImage}
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
          className="h-full w-full object-cover relative z-10"
        />

        {/* Lower Third Overlay HUD */}
        <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-4">
              <span className="font-mono text-[9px] uppercase tracking-widest text-cyan-400">
                ON AIR // {presenter.name.toUpperCase()} · {presenter.role.toUpperCase()}
              </span>
              <p className="truncate text-xs font-semibold text-slate-100 mt-0.5">
                {headline}
              </p>
            </div>

            {/* Play & Mute Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={toggleMute}
                className="flex h-8 w-8 items-center justify-center rounded border border-slate-700 bg-slate-900/80 text-slate-200 hover:border-cyan-400 hover:text-cyan-200 transition-colors"
                title={isMuted ? "Unmute Audio" : "Mute Audio"}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4 text-cyan-400" />
                ) : (
                  <Volume2 className="h-4 w-4 text-emerald-400" />
                )}
              </button>

              <button
                type="button"
                onClick={togglePlay}
                className="flex h-8 w-8 items-center justify-center rounded border border-slate-700 bg-slate-900/80 text-slate-200 hover:border-cyan-400 hover:text-cyan-200 transition-colors"
                title={isPlaying ? "Pause Video" : "Play Video"}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 text-slate-300" />
                ) : (
                  <Play className="h-4 w-4 text-cyan-400 fill-cyan-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transcript ticker HUD */}
      {transcript && (
        <div className="border-t border-slate-800 bg-[#070A10] px-4 py-2">
          <div className="flex items-start gap-2">
            <Sparkles className="h-3 w-3 shrink-0 text-cyan-400 mt-0.5" />
            <p className="line-clamp-2 font-mono text-[10px] leading-relaxed text-slate-400">
              {transcript}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
