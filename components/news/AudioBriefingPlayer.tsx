"use client";

import * as React from "react";
import { Play, Pause, RotateCcw, Volume2, FastForward, Sparkles, Video, Loader2 } from "lucide-react";
import Link from "next/link";
import { createTwoSentenceAudioBrief } from "@/lib/news/audio-brief";

interface AudioBriefingPlayerProps {
  headline: string;
  summary: string | null;
  source: string;
  storyId?: string;
  catalystReasoning?: string | null;
}

// Blocklist of legacy robotic/novelty voices in browser SpeechSynthesis
const ROBOTIC_VOICE_REGEX = /fred|albert|bad news|bells|boing|cellos|deranged|good news|hysterical|junior|kathy|organ|pipe organ|princess|ralph|trinoids|vicki|victoria|whisper|zarvox|espeak/i;

export function AudioBriefingPlayer({ headline, summary, source, storyId, catalystReasoning }: AudioBriefingPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = React.useState(false);
  const [rate, setRate] = React.useState(1.0);
  const [progress, setProgress] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [audioSourceType, setAudioSourceType] = React.useState<"studio-neural" | "browser-natural">("studio-neural");
  const [selectedPresenter, setSelectedPresenter] = React.useState<"elena" | "marcus" | "julian">("elena");

  // Audio element reference for Server-Side Neural TTS stream
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Client speech synthesis fallback references
  const utteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null);
  const [browserVoices, setBrowserVoices] = React.useState<SpeechSynthesisVoice[]>([]);
  const [selectedBrowserVoiceURI, setSelectedBrowserVoiceURI] = React.useState<string>("");

  // Synthesize concise 2-sentence executive summary at natural speaking pace
  const twoSentenceBrief = React.useMemo(() => {
    return createTwoSentenceAudioBrief({
      headline,
      summary,
      source,
      catalystReasoning,
    });
  }, [headline, summary, source, catalystReasoning]);

  // Initialize browser voices as secondary fallback
  React.useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const updateVoices = () => {
        const available = window.speechSynthesis.getVoices();
        // Filter out ancient robotic/novelty voices
        const naturalVoices = available.filter((v) => !ROBOTIC_VOICE_REGEX.test(v.name));
        const enVoices = naturalVoices.filter((v) => v.lang.startsWith("en"));
        const listToUse = enVoices.length > 0 ? enVoices : naturalVoices.length > 0 ? naturalVoices : available;
        setBrowserVoices(listToUse);

        if (listToUse.length > 0 && !selectedBrowserVoiceURI) {
          // Prioritize enhanced / natural / premium voices
          const premium = listToUse.find((v) => /natural|enhanced|premium|siri|google/i.test(v.name));
          setSelectedBrowserVoiceURI(premium ? premium.voiceURI : listToUse[0].voiceURI);
        }
      };

      updateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs <= 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsLoadingAudio(false);
    setProgress(0);
    setCurrentTime(0);
  };

  // Playback using Server-Side ElevenLabs Neural Broadcast Stream
  const playStudioNeuralAudio = async () => {
    setIsLoadingAudio(true);
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      const audio = audioRef.current;
      const ttsUrl = `/api/news/tts?presenter=${selectedPresenter}&storyId=${encodeURIComponent(storyId || "")}&text=${encodeURIComponent(twoSentenceBrief)}`;

      audio.src = ttsUrl;
      audio.playbackRate = rate;

      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
        setIsLoadingAudio(false);
      };

      audio.ontimeupdate = () => {
        if (audio.duration > 0) {
          setCurrentTime(audio.currentTime);
          setProgress(Math.round((audio.currentTime / audio.duration) * 100));
        }
      };

      audio.onended = () => {
        setIsPlaying(false);
        setProgress(100);
        setTimeout(() => setProgress(0), 1200);
      };

      audio.onerror = () => {
        console.warn("[AudioBriefing] Studio neural playback failed, falling back to natural browser voice");
        setIsLoadingAudio(false);
        playBrowserNaturalAudio();
      };

      await audio.play();
      setIsPlaying(true);
      setIsLoadingAudio(false);
      setAudioSourceType("studio-neural");
    } catch {
      setIsLoadingAudio(false);
      playBrowserNaturalAudio();
    }
  };

  // Secondary Fallback: Client Natural Voice Synthesis
  const playBrowserNaturalAudio = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(twoSentenceBrief);
    utteranceRef.current = utterance;
    utterance.rate = rate;

    if (selectedBrowserVoiceURI) {
      const match = browserVoices.find((v) => v.voiceURI === selectedBrowserVoiceURI);
      if (match) utterance.voice = match;
    }

    utterance.onboundary = (e) => {
      if (e.charIndex && twoSentenceBrief.length > 0) {
        setProgress(Math.min(100, Math.round((e.charIndex / twoSentenceBrief.length) * 100)));
      }
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setProgress(100);
      setTimeout(() => setProgress(0), 1200);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setAudioSourceType("browser-natural");
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.pause();
      }
      setIsPlaying(false);
      return;
    }

    if (audioRef.current && audioRef.current.paused && audioRef.current.currentTime > 0) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    playStudioNeuralAudio();
  };

  const handleSpeedChange = (newRate: number) => {
    setRate(newRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
    if (isPlaying && utteranceRef.current) {
      stopPlayback();
    }
  };

  const rates = [0.85, 1.0, 1.25, 1.5];

  return (
    <div className="mt-4 rounded-lg border border-slate-800 bg-[#070A10] p-3.5 shadow-inner">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Playback Controls & Status */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleTogglePlay}
            disabled={isLoadingAudio}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
              isPlaying
                ? "bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                : "bg-cyan-600 text-slate-950 hover:bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
            } disabled:opacity-50`}
            title={isPlaying ? "Pause Audio Briefing" : "Play Neural Audio Briefing"}
            aria-label={isPlaying ? "Pause briefing" : "Play briefing"}
          >
            {isLoadingAudio ? (
              <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4 fill-cyan-400" />
            ) : (
              <Play className="h-4 w-4 fill-slate-950 ml-0.5" />
            )}
          </button>

          <button
            onClick={stopPlayback}
            disabled={!isPlaying && progress === 0}
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
                INTELLIGENCE AUDIO DESK
              </span>

              {/* Neural Studio Quality Badge */}
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                <Sparkles className="h-2.5 w-2.5 text-emerald-400" />
                {audioSourceType === "studio-neural" ? "STUDIO NEURAL AI" : "NATURAL AUDIO"}
              </span>

              {isPlaying && (
                <span className="flex items-center gap-1 text-[9px] font-mono text-cyan-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  BROADCASTING
                </span>
              )}
            </div>

            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              {isLoadingAudio
                ? "Synthesizing ultra-realistic studio broadcast..."
                : duration > 0
                ? `${formatTime(currentTime)} / ${formatTime(duration)} · ${progress}% completed`
                : "Authoritative neural briefing · Studio narration"}
            </p>
          </div>
        </div>

        {/* Audio Waveform Equalizer Display */}
        <div className="hidden sm:flex items-center gap-1 h-6 px-3 py-1 rounded bg-[#04060A] border border-slate-800/80">
          {[35, 70, 95, 55, 85, 40, 75, 100, 65, 45, 80, 55].map((height, i) => (
            <span
              key={i}
              style={{ height: isPlaying ? `${height}%` : "20%" }}
              className={`w-0.5 rounded-full transition-all duration-150 ${
                isPlaying ? "bg-cyan-400" : "bg-slate-700"
              }`}
            />
          ))}
        </div>

        {/* Presenter & Rate Selectors */}
        <div className="flex items-center gap-2">
          {/* Presenter Persona Selector */}
          <select
            value={selectedPresenter}
            onChange={(e) => {
              setSelectedPresenter(e.target.value as "elena" | "marcus" | "julian");
              if (isPlaying) stopPlayback();
            }}
            aria-label="Select Presenter"
            className="bg-[#0A0E17] border border-slate-800 text-[10px] font-mono text-slate-300 rounded px-2 py-1 outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="elena">Elena Rostova (Hollywood & Market)</option>
            <option value="marcus">Marcus Vance (Census & Equity)</option>
            <option value="julian">Dr. Julian Mercer (Provenance)</option>
          </select>

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

          {/* HeyGen / D-ID Video Studio Link */}
          {storyId && (
            <Link
              href={`/api/video/stream?storyId=${encodeURIComponent(storyId)}`}
              target="_blank"
              className="hidden lg:flex items-center gap-1 px-2 py-1 rounded border border-purple-800/60 bg-purple-950/30 text-purple-300 hover:border-purple-500 hover:text-purple-200 text-[9px] font-mono uppercase tracking-wider transition-colors"
              title="Launch AI Avatar Video Reel Studio (HeyGen / D-ID)"
            >
              <Video className="h-3 w-3 text-purple-400" /> Video Reel
            </Link>
          )}
        </div>
      </div>

      {/* 2-Sentence Spoken Executive Briefing Transcript */}
      <div className="mt-3 rounded border border-cyan-500/20 bg-[#05080E] px-3.5 py-2">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          <span className="font-mono text-[9px] uppercase tracking-wider text-cyan-300 font-semibold">
            2-Sentence Executive Briefing
          </span>
          <span className="text-[9px] font-mono text-slate-500 ml-auto">
            ~12s Spoken Pace
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          "{twoSentenceBrief}"
        </p>
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
