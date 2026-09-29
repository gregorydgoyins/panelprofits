"use client";

import * as React from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, FastForward, Activity } from "lucide-react";

interface AudioBriefingPlayerProps {
  headline: string;
  summary: string | null;
  source: string;
}

export function AudioBriefingPlayer({ headline, summary, source }: AudioBriefingPlayerProps) {
  const [isSupported, setIsSupported] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [rate, setRate] = React.useState(1.0);
  const [voices, setVoices] = React.useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = React.useState<string>("");
  const [progress, setProgress] = React.useState(0);

  const utteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null);
  const fullText = React.useMemo(() => {
    const cleanSummary = summary ? summary.replace(/\[\/?.*?\]/g, "") : "";
    return `Panel Profits Audio Intelligence Wire. Source report from ${source}. Headline: ${headline}. Intelligence summary: ${cleanSummary}`;
  }, [headline, summary, source]);

  React.useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);

      const updateVoices = () => {
        const available = window.speechSynthesis.getVoices();
        const enVoices = available.filter((v) => v.lang.startsWith("en"));
        const listToUse = enVoices.length > 0 ? enVoices : available;
        setVoices(listToUse);
        if (listToUse.length > 0 && !selectedVoiceURI) {
          const defaultVoice = listToUse.find((v) => v.default) || listToUse[0];
          setSelectedVoiceURI(defaultVoice.voiceURI);
        }
      };

      updateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopPlayback = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
  };

  const handlePlay = () => {
    if (!isSupported || typeof window === "undefined") return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(fullText);
    utteranceRef.current = utterance;
    utterance.rate = rate;

    if (selectedVoiceURI) {
      const match = voices.find((v) => v.voiceURI === selectedVoiceURI);
      if (match) utterance.voice = match;
    }

    utterance.onboundary = (e) => {
      if (e.charIndex && fullText.length > 0) {
        const pct = Math.min(100, Math.round((e.charIndex / fullText.length) * 100));
        setProgress(pct);
      }
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      setTimeout(() => setProgress(0), 1500);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    if (!isSupported || typeof window === "undefined") return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleSpeedChange = (newRate: number) => {
    setRate(newRate);
    if (isPlaying && utteranceRef.current) {
      stopPlayback();
    }
  };

  if (!isSupported) {
    return null;
  }

  const rates = [0.85, 1.0, 1.25, 1.5, 2.0];

  return (
    <div className="mt-4 rounded-lg border border-slate-800 bg-[#070A10] p-3.5 shadow-inner">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Playback Controls & Status */}
        <div className="flex items-center gap-3">
          {isPlaying ? (
            <button
              onClick={handlePause}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 hover:bg-cyan-500/30 transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)]"
              title="Pause Audio Briefing"
              aria-label="Pause audio briefing"
            >
              <Pause className="h-4 w-4 fill-cyan-400" />
            </button>
          ) : (
            <button
              onClick={handlePlay}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-600 text-slate-950 hover:bg-cyan-400 transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)]"
              title="Listen to Audio Briefing"
              aria-label="Listen to audio briefing"
            >
              <Play className="h-4 w-4 fill-slate-950 ml-0.5" />
            </button>
          )}

          <button
            onClick={stopPlayback}
            disabled={!isPlaying && !isPaused}
            className="flex h-7 w-7 items-center justify-center rounded border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Reset / Stop Audio"
            aria-label="Stop audio briefing"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-cyan-400 font-semibold flex items-center gap-1.5">
                <Volume2 className="h-3.5 w-3.5 text-cyan-400" />
                AUDIO INTELLIGENCE DESK
              </span>
              {isPlaying && (
                <span className="flex items-center gap-1 text-[9px] font-mono text-cyan-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  NARRATING
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Synthetic synthesized wire briefing · {progress}% spoken
            </p>
          </div>
        </div>

        {/* Audio Waveform Equalizer Display */}
        <div className="hidden sm:flex items-center gap-1 h-6 px-3 py-1 rounded bg-[#04060A] border border-slate-800/80">
          {[40, 75, 100, 60, 90, 45, 80, 100, 70, 50, 85, 60].map((height, i) => (
            <span
              key={i}
              style={{ height: isPlaying ? `${height}%` : "20%" }}
              className={`w-0.5 rounded-full transition-all duration-150 ${
                isPlaying ? "bg-cyan-400" : "bg-slate-700"
              }`}
            />
          ))}
        </div>

        {/* Speech Rate & Voice Selectors */}
        <div className="flex items-center gap-2">
          {/* Rate Selector Pills */}
          <div className="flex items-center gap-1 bg-[#0A0E17] border border-slate-800 rounded p-0.5">
            {rates.map((r) => (
              <button
                key={r}
                onClick={() => handleSpeedChange(r)}
                className={`px-1.5 py-0.5 text-[9px] font-mono rounded transition-colors ${
                  rate === r
                    ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {r}x
              </button>
            ))}
          </div>

          {/* Voice Dropdown */}
          {voices.length > 1 && (
            <select
              value={selectedVoiceURI}
              onChange={(e) => setSelectedVoiceURI(e.target.value)}
              aria-label="Synthesizer Voice"
              className="bg-[#0A0E17] border border-slate-800 text-[10px] font-mono text-slate-300 rounded px-2 py-1 outline-none focus:border-cyan-500 max-w-[130px] truncate"
            >
              {voices.slice(0, 8).map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name.replace(/(Google|Microsoft|Apple|Natural)\s*/gi, "")}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Spoken Progress Bar */}
      {progress > 0 && (
        <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-slate-900">
          <div
            className="h-full bg-cyan-400 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
