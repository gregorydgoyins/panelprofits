"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Radio, ExternalLink, Calendar, ArrowRight } from "lucide-react";
import { type NewsStory, shortNewsSource } from "@/lib/news/feed";
import { TopTicker } from "@/components/news/TopTicker";
import { StoryPanel } from "@/components/news/StoryPanel";

interface NewsroomProps {
  stories: NewsStory[];
}

function timeAgo(d: string | null) {
  if (!d) return "Recently";
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return "Recently";
  const ms = Date.now() - parsed.getTime();
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${Math.max(m, 1)}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  if (h < 48) return "Yesterday";
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function Newsroom({ stories }: NewsroomProps) {
  const [activeStoryId, setActiveStoryId] = React.useState<string>(stories[0]?.id || "");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const filteredStories = React.useMemo(() => {
    if (!searchQuery.trim()) return stories;
    const q = searchQuery.toLowerCase();
    return stories.filter(
      (s) =>
        s.headline.toLowerCase().includes(q) ||
        s.source.toLowerCase().includes(q) ||
        (s.summary && s.summary.toLowerCase().includes(q))
    );
  }, [stories, searchQuery]);

  const activeStory = React.useMemo(() => {
    if (!filteredStories.length) return null;
    return filteredStories.find((s) => s.id === activeStoryId) || filteredStories[0];
  }, [filteredStories, activeStoryId]);

  if (!stories.length || !activeStory) {
    return (
      <div className="border border-slate-800 bg-[#0A0D14] p-12 text-center text-sm text-slate-500 rounded-lg">
        <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest flex items-center justify-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          AWAITING LIVE WIRE INGESTION...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Ticker Wire at Top */}
      <TopTicker stories={filteredStories} activeId={activeStory.id} onSelect={setActiveStoryId} />

      {/* Control Bar: Status & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase rounded border border-cyan-500/50 bg-cyan-950/40 text-cyan-300">
            <Radio className="h-3 w-3 text-cyan-400 animate-pulse" />
            LIVE WIRE
          </span>
          <span className="px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase rounded border border-slate-800 bg-slate-900/60 text-slate-300">
            {filteredStories.length} Real-Time Stories
          </span>
        </div>

        <label className="flex items-center gap-2 border border-slate-800 bg-[#080B11] px-3 py-1.5 text-xs text-slate-400 sm:w-72 rounded">
          <Search className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search headlines, sources, lore..."
            aria-label="Search news wire"
            className="w-full bg-transparent outline-none text-slate-200 text-xs placeholder:text-slate-600"
          />
        </label>
      </div>

      {/* Main 2-Column Grid: Featured Active Story + Live Wire Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Active Story Full View */}
        <div className="lg:col-span-8 min-w-0">
          <StoryPanel story={activeStory} />
        </div>

        {/* Right: Live Wire List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="border border-slate-800 bg-[#07090F] p-4 rounded-lg">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400 font-semibold">
                LATEST WIRE DISPATCHES
              </span>
              <span className="text-[9px] font-mono text-slate-500">
                {filteredStories.length} TOTAL
              </span>
            </div>

            <div className="space-y-2 max-h-[720px] overflow-y-auto pr-1 no-scrollbar">
              {filteredStories.map((story) => {
                const isSelected = story.id === activeStory.id;
                return (
                  <button
                    key={story.id}
                    onClick={() => setActiveStoryId(story.id)}
                    className={`w-full text-left p-3 rounded transition-all border ${
                      isSelected
                        ? "border-cyan-400/80 bg-cyan-950/20 shadow-sm"
                        : "border-slate-800/60 bg-[#0A0D15] hover:border-slate-700 hover:bg-[#0D121B]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mb-1">
                      <span className="text-cyan-400 font-semibold uppercase">
                        {shortNewsSource(story.source)}
                      </span>
                      <span>{timeAgo(story.publishedAt)}</span>
                    </div>
                    <h3 className="text-xs font-medium text-slate-200 line-clamp-2 leading-snug">
                      {story.headline}
                    </h3>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
