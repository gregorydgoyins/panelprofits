"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Radio, ExternalLink, Calendar, ArrowRight } from "lucide-react";
import { type NewsStory, shortNewsSource } from "@/lib/news/types";
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

type AngleFilter = "all" | "market" | "scholarly" | "creator" | "video" | "publisher" | "wire";

const ANGLE_MATCHERS: Record<AngleFilter, (s: NewsStory) => boolean> = {
  all: () => true,
  market: (s) =>
    /heritage|comiclink|comicconnect|shortboxed|key collector|gocollect|covrprice|comicbook invest|cgc|cbcs|comichron|overstreet|hakes|auction|slab|cbsi/i.test(
      `${s.source} ${s.sourceUrl} ${s.headline}`
    ),
  scholarly: (s) =>
    /tcj|comics journal|solrad|comics grid|image text|gutter review|panel patter|sequential tart|broken frontier|graphic medicine|daily cartoonist|women write|scholarly|academic|review|essay/i.test(
      `${s.source} ${s.sourceUrl} ${s.headline}`
    ),
  creator: (s) =>
    /bendis|tynion|hickman|brubaker|deconnick|zdarsky|skottie young|tom king|lemire|millar|gillen|cates|duggan|soule|substack/i.test(
      `${s.source} ${s.sourceUrl} ${s.headline}`
    ),
  video: (s) =>
    /youtube|strip panel naked|matt draper|comic tropes|kayfabe|comicpop|near mint condition|swagglehaus|automatic comics|lords of the long box|variant comics|tom101|gem mint|comics explained|casually comics|nerdsync/i.test(
      `${s.source} ${s.sourceUrl} ${s.headline}`
    ),
  publisher: (s) =>
    /marvel|dc comics|image comics|dark horse|2000 ad|idw|boom studios|dynamite|fantagraphics|drawn and quarterly|kodansha|viz media|yen press|seven seas|oni press|vault comics/i.test(
      `${s.source} ${s.sourceUrl} ${s.headline}`
    ),
  wire: (s) => /^newsdata|^perigon|^thenewsapi|^newsapi|^asknews/i.test(s.source),
};

export function Newsroom({ stories }: NewsroomProps) {
  const [activeStoryId, setActiveStoryId] = React.useState<string>(stories[0]?.id || "");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [activeAngle, setActiveAngle] = React.useState<AngleFilter>("all");

  const filteredStories = React.useMemo(() => {
    let result = stories;
    if (activeAngle !== "all") {
      const matcher = ANGLE_MATCHERS[activeAngle];
      result = result.filter(matcher);
    }
    if (!searchQuery.trim()) return result;
    const q = searchQuery.toLowerCase();
    return result.filter(
      (s) =>
        s.headline.toLowerCase().includes(q) ||
        s.source.toLowerCase().includes(q) ||
        (s.summary && s.summary.toLowerCase().includes(q))
    );
  }, [stories, activeAngle, searchQuery]);

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

  const angleOptions: Array<{ key: AngleFilter; label: string }> = [
    { key: "all", label: "All Channels" },
    { key: "market", label: "Secondary Market & Slabs" },
    { key: "scholarly", label: "Scholarly & Reviews" },
    { key: "creator", label: "Creator Substacks" },
    { key: "video", label: "Video Essays & Vlogs" },
    { key: "publisher", label: "Publishers & Manga" },
    { key: "wire", label: "News Wire APIs" },
  ];

  return (
    <div className="space-y-6">
      {/* Live Ticker Wire at Top */}
      <TopTicker stories={filteredStories} activeId={activeStory.id} onSelect={setActiveStoryId} />

      {/* Control Bar: Network Telemetry, Filter Pills & Search */}
      <div className="space-y-3 px-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase rounded border border-cyan-500/50 bg-cyan-950/40 text-cyan-300">
              <Radio className="h-3 w-3 text-cyan-400 animate-pulse" />
              LIVE WIRE
            </span>
            <span className="px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase rounded border border-slate-800 bg-slate-900/60 text-slate-300">
              {filteredStories.length} Filtered Stories
            </span>
            <span className="hidden sm:inline-flex px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase rounded border border-emerald-500/40 bg-emerald-950/20 text-emerald-400">
              240+ Network Feeds · 5 Wire APIs · Self-Healing: Active
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

        {/* Content Angle Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-slate-800/60 pt-1">
          {angleOptions.map((opt) => {
            const isActive = activeAngle === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setActiveAngle(opt.key)}
                className={`whitespace-nowrap px-3 py-1 text-[11px] font-mono uppercase tracking-[0.1em] rounded transition-all border ${
                  isActive
                    ? "border-cyan-400/80 bg-cyan-950/50 text-cyan-300 font-semibold shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                    : "border-slate-800/80 bg-[#080B11] text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
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
                LATEST WIRE bulletins
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
