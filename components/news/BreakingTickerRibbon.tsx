"use client";

import * as React from "react";
import Link from "next/link";
import { Radio, Volume2, VolumeX, Sparkles, TrendingUp, ChevronRight } from "lucide-react";
import type { NewsStory } from "@/lib/news/types";
import { analyzeStoryCatalyst } from "@/lib/news/catalyst";

interface BreakingTickerRibbonProps {
  stories: NewsStory[];
  onSelectStory?: (id: string) => void;
}

export function BreakingTickerRibbon({ stories, onSelectStory }: BreakingTickerRibbonProps) {
  const [audioChimeEnabled, setAudioChimeEnabled] = React.useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = React.useState(0);

  // Filter top 10 market catalyst stories
  const breakingItems = React.useMemo(() => {
    return stories
      .map((s) => ({
        story: s,
        catalyst: analyzeStoryCatalyst(s.headline, s.summary),
      }))
      .filter((item) => item.catalyst.impactScore >= 0.7)
      .slice(0, 10);
  }, [stories]);

  // Rotate through breaking items every 6 seconds
  React.useEffect(() => {
    if (breakingItems.length <= 1) return;
    const interval = setInterval(() => {
      setActiveStoryIndex((prev) => (prev + 1) % breakingItems.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [breakingItems.length]);

  if (breakingItems.length === 0) return null;

  const current = breakingItems[activeStoryIndex] || breakingItems[0];
  const primaryComic = current.catalyst.affectedComics[0];

  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-cyan-500/40 bg-gradient-to-r from-[#0C1220] via-[#070A12] to-[#0C1220] px-3.5 py-2 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Breaking Pill & Animated Headline */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 rounded-full bg-cyan-500/20 px-2 py-0.5 border border-cyan-400/40 shrink-0">
            <Radio className="h-3 w-3 text-cyan-400 animate-pulse" />
            <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">
              BREAKING CATALYST
            </span>
          </div>

          <div className="flex items-center gap-2 truncate">
            {primaryComic && (
              <span className="font-mono text-[10px] font-black text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/30 shrink-0">
                {primaryComic.ticker} ({primaryComic.priceFormatted})
              </span>
            )}

            <button
              onClick={() => onSelectStory?.(current.story.id)}
              className="truncate text-xs font-semibold text-slate-200 hover:text-cyan-200 transition-colors text-left"
            >
              {current.story.headline}
            </button>
          </div>
        </div>

        {/* Right: Sound Alert & Navigation */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline-block font-mono text-[10px] text-slate-500">
            {activeStoryIndex + 1} of {breakingItems.length}
          </span>

          <button
            onClick={() => setAudioChimeEnabled((prev) => !prev)}
            className={`flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider transition-colors ${
              audioChimeEnabled
                ? "border border-cyan-500/40 bg-cyan-950/60 text-cyan-300"
                : "border border-slate-800 bg-[#090C16] text-slate-500 hover:text-slate-300"
            }`}
            title={audioChimeEnabled ? "Desk chime alerts enabled" : "Enable desk chime alerts for breaking catalysts"}
          >
            {audioChimeEnabled ? (
              <>
                <Volume2 className="h-3 w-3 text-cyan-400" /> Chime On
              </>
            ) : (
              <>
                <VolumeX className="h-3 w-3" /> Chime Off
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
