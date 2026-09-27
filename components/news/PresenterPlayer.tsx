"use client";

import * as React from "react";
import { Play, Pause, Volume2, VolumeX, Radio, Sparkles, UserCheck, MessageSquare } from "lucide-react";
import type { NewsStory } from "@/lib/news/feed";
import type { PresenterAvatar } from "@/lib/news/presenters";
import { buildAnchorScript, type ScriptPacket } from "@/lib/news/broadcast-script";

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
  const [currentTime, setCurrentTime] = React.useState<number>(0);

  // Generate synchronized broadcast script and subtitle cues
  const script: ScriptPacket = React.useMemo(() => {
    return buildAnchorScript({
      headline: story.headline,
      summary: story.summary,
      source: story.source,
      published_at: story.publishedAt,
    });
  }, [story.headline, story.summary, story.source, story.publishedAt]);

  // Synchronized active teleprompter cue
  const activeCue = React.useMemo(() => {
    if (!script.cues || !script.cues.length) return null;
    const loopedTime = currentTime % (script.estimatedDurationSec || 20);
    return (
      script.cues.find((c) => loopedTime >= c.start && loopedTime <= c.end) ||
      script.cues[0]
    );
  }, [script.cues, script.estimatedDurationSec, currentTime]);

  // Speech synthesis synchronization
  const speakScript = React.useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if (isMuted) return;

    const utterance = new SpeechSynthesisUtterance(script.fullScript);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    
    // Choose appropriate voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find((v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Premium")));
    if (englishVoice) utterance.voice = englishVoice;

    window.speechSynthesis.speak(utterance);
  }, [script.fullScript, isMuted]);

  const togglePlay = React.useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.pause();
      }
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        if (!isMuted) speakScript();
      }).catch(() => setIsPlaying(false));
    }
  }, [isPlaying, isMuted, speakScript]);

  const toggleMute = React.useCallback(() => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      if (nextMuted) {
        window.speechSynthesis.cancel();
      } else if (isPlaying) {
        speakScript();
      }
    }
  }, [isMuted, isPlaying, speakScript]);

  // Handle video looping and synchronization
  const handleTimeUpdate = React.useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

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
      <div 
        className="relative aspect-video w-full bg-[#030407] bg-cover bg-center"
        style={{ backgroundImage: `url(${presenter.avatarImage})` }}
      >
        <video
          ref={videoRef}
          src={presenter.videoSampleUrl}
          poster={presenter.avatarImage}
          playsInline
          autoPlay
          loop
          muted={isMuted}
          onTimeUpdate={handleTimeUpdate}
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
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 z-20">
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
                title={isMuted ? "Unmute Audio Broadcast" : "Mute Audio Broadcast"}
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

      {/* Synchronized Teleprompter Feed */}
      <div className="border-t border-slate-800 bg-[#090C14] px-4 py-3">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-amber-300">
            <MessageSquare className="h-3 w-3 text-amber-400" />
            <span>SYNCHRONIZED TELEPROMPTER // {script.priority.toUpperCase()}</span>
          </div>
          <span className="font-mono text-[9px] text-slate-500">
            {currentTime.toFixed(0)}s / {script.estimatedDurationSec}s
          </span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed font-sans min-h-[36px] bg-[#05070B] p-2.5 rounded border border-slate-800/80">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400 mr-2 animate-pulse" />
          {activeCue?.text || script.headline}
        </p>
      </div>
    </div>
  );
}
