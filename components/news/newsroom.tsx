"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Radio,
  ExternalLink,
  Calendar,
  ArrowRight,
  Terminal,
  LayoutGrid,
  Layers,
  Wifi,
  Sparkles,
  Command,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react";
import { type NewsStory, shortNewsSource } from "@/lib/news/types";
import { TopTicker } from "@/components/news/TopTicker";
import { StoryPanel } from "@/components/news/StoryPanel";
import { analyzeStoryCatalyst } from "@/lib/news/catalyst";
import { parseAndSynthesizeArticle } from "@/lib/news/article-parser";

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

type AngleFilter = "all" | "market" | "scholarly" | "creator" | "video" | "publisher" | "wire" | "holdings";

const STRICT_CLIENT_NEGATIVE_FILTER = /\b(ac\/dc\b|mayor\s+bowser|ribbon-cutting|washington,?\s*d\.?c\.?|(?:dc|d\.c\.)\s+(?:mayor|council|police|government|politics|statehood|attorney|public\s+schools)|florida\s+state|seminoles|fsu\b|gators\b|college\s+football|high\s+school\s+football|wrestling|pwi 500|wwe|aew|nfl|nba|mlb|nhl|ncaa|quarterback|touchdown|football|basketball|baseball|soccer|hockey|premier league|champions league|mls|inter miami|acc\b|sec\b|big ten|big 12|pac-12|touchdowns|linebacker|interception|puck|formula 1|\bf1\b|nascar|tennis|wimbledon|golf|\bpga\b|boxing|\bmma\b|\bufc\b|super bowl|earphones|smartwatch|airpods|vacuum cleaner|casino|crypto casino|slot machine|weight loss|celebrity gossip|love island|bachelor|real housewives|dc council|trayon white|city council|county commissioner|zoning board|police blotter|homicide|shooting incident|car crash|traffic accident|terror suspects|bribery trial|bribery mistrial|bribery case|politico caught|local election|mayoral election|gubernatorial|senate seat|congressional district|tax hike|affordable housing|mortgage rates|gameplay|playstation\s*5|ps5|xbox|nintendo switch|platinum trophy)\b/i;

const ANGLE_MATCHERS: Record<AngleFilter, (s: NewsStory) => boolean> = {
  all: () => true,
  market: (s) =>
    /heritage|comiclink|comicconnect|shortboxed|key collector|gocollect|covrprice|comicbook invest|cgc|cbcs|comichron|overstreet|hakes|auction|slab|cbsi|pricing|sales|graded|market|valuation|fmv|record price|box office|gross|previews|revenue/i.test(
      `${s.source} ${s.sourceUrl || ""} ${s.headline} ${s.summary || ""}`
    ),
  scholarly: (s) =>
    /tcj|comics journal|solrad|comics grid|image text|gutter review|panel patter|sequential tart|broken frontier|graphic medicine|daily cartoonist|women write|scholarly|academic|review|essay|analysis|history|origin|retrospective|critic|deep dive/i.test(
      `${s.source} ${s.sourceUrl || ""} ${s.headline} ${s.summary || ""}`
    ),
  creator: (s) =>
    /bendis|tynion|hickman|brubaker|deconnick|zdarsky|skottie young|tom king|lemire|millar|gillen|cates|duggan|soule|substack|writer|artist|creator|interview|director|actor|stan lee|jack kirby|alan moore|neil gaiman|grant morrison|russo|gunn|pattinson|downey|feige/i.test(
      `${s.source} ${s.sourceUrl || ""} ${s.headline} ${s.summary || ""}`
    ),
  video: (s) =>
    /youtube|video|trailer|teaser|clip|strip panel naked|matt draper|comic tropes|kayfabe|comicpop|near mint condition|swagglehaus|automatic comics|lords of the long box|variant comics|tom101|gem mint|comics explained|casually comics|nerdsync/i.test(
      `${s.source} ${s.sourceUrl || ""} ${s.headline} ${s.summary || ""}`
    ),
  publisher: (s) =>
    /marvel|dc|image|dark horse|2000 ad|idw|boom|dynamite|fantagraphics|drawn and quarterly|kodansha|viz|yen press|seven seas|oni press|vault|aipt|cbr|comicbook|bleeding cool|screenrant/i.test(
      `${s.source} ${s.sourceUrl || ""} ${s.headline} ${s.summary || ""}`
    ),
  wire: (s) =>
    /^newsdata|^perigon|^thenewsapi|^newsapi|^asknews|variety|deadline|hollywood reporter|thr|ign|polygon/i.test(
      s.source
    ),
  holdings: (s) => {
    // Matches active portfolio holdings & watchlist sovereign tickers
    const text = `${s.headline} ${s.summary || ""}`.toLowerCase();
    return (
      text.includes("spider-man") ||
      text.includes("punisher") ||
      text.includes("thunderbolts") ||
      text.includes("wolverine") ||
      text.includes("ahsoka") ||
      text.includes("daredevil") ||
      text.includes("x-men") ||
      text.includes("batman") ||
      text.includes("avengers") ||
      text.includes("iron man") ||
      text.includes("superman") ||
      text.includes("fantastic four") ||
      text.includes("doom")
    );
  },
};

export function Newsroom({ stories: initialStories }: NewsroomProps) {
  const router = useRouter();
  const [stories, setStories] = React.useState<NewsStory[]>(() =>
    initialStories.filter((s) => !STRICT_CLIENT_NEGATIVE_FILTER.test(`${s.headline} ${s.summary || ""}`))
  );
  const [activeStoryId, setActiveStoryId] = React.useState<string>(stories[0]?.id || "");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [activeAngle, setActiveAngle] = React.useState<AngleFilter>("all");
  const [viewMode, setViewMode] = React.useState<"terminal" | "feed">("terminal");
  const [sseConnected, setSseConnected] = React.useState<boolean>(false);
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);
  const activeListItemRef = React.useRef<HTMLButtonElement | null>(null);

  // 1. Live SSE Stream Connection
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("/api/news/stream");

      eventSource.addEventListener("telemetry", () => {
        setSseConnected(true);
      });

      eventSource.addEventListener("news", (e) => {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed && Array.isArray(parsed.stories) && parsed.stories.length > 0) {
            setStories((prev) => {
              const existingIds = new Set(prev.map((s) => s.id));
              const fresh = parsed.stories.filter(
                (s: NewsStory) =>
                  !existingIds.has(s.id) &&
                  !STRICT_CLIENT_NEGATIVE_FILTER.test(`${s.headline} ${s.summary || ""}`)
              );
              if (fresh.length === 0) return prev;
              return [...fresh, ...prev];
            });
          }
        } catch (err) {
          console.error("[Newsroom] Failed to parse SSE news event:", err);
        }
      });

      eventSource.onerror = () => {
        setSseConnected(false);
      };
    } catch {
      setSseConnected(false);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  // 2. Filter stories by Angle & Search query
  const filteredStories = React.useMemo(() => {
    let result = stories.filter((s) => !STRICT_CLIENT_NEGATIVE_FILTER.test(`${s.headline} ${s.summary || ""}`));
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

  // Keep activeStoryId synchronized if filtered list changes
  React.useEffect(() => {
    if (filteredStories.length > 0 && !filteredStories.some((s) => s.id === activeStoryId)) {
      setActiveStoryId(filteredStories[0].id);
    }
  }, [filteredStories, activeStoryId]);

  // 3. Keyboard Hotkeys (J/K navigation, Enter for dossier, / for search, Esc to clear)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT");

      // Escape always clears/blurs search
      if (e.key === "Escape") {
        if (searchQuery) setSearchQuery("");
        if (isInputFocused) target.blur();
        return;
      }

      // If user is typing in an input, do not hijack normal letters
      if (isInputFocused) return;

      // "/" focuses search input
      if (e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (!filteredStories.length) return;

      const currentIndex = filteredStories.findIndex((s) => s.id === activeStoryId);

      // "j" or "J" -> Next story
      if (e.key === "j" || e.key === "J") {
        e.preventDefault();
        const nextIndex = currentIndex < filteredStories.length - 1 ? currentIndex + 1 : 0;
        setActiveStoryId(filteredStories[nextIndex].id);
      }

      // "k" or "K" -> Previous story
      if (e.key === "k" || e.key === "K") {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredStories.length - 1;
        setActiveStoryId(filteredStories[prevIndex].id);
      }

      // "Enter" -> Open full story dossier
      if (e.key === "Enter" && activeStory) {
        e.preventDefault();
        router.push(`/news/${activeStory.id}`);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredStories, activeStoryId, activeStory, router, searchQuery]);

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
    { key: "holdings", label: "My Holdings & Watchlist" },
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

      {/* Control Bar: Network Telemetry, View Mode Toggle & Search */}
      <div className="space-y-3 px-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase rounded border ${
                sseConnected
                  ? "border-emerald-500/50 bg-emerald-950/40 text-emerald-300"
                  : "border-cyan-500/50 bg-cyan-950/40 text-cyan-300"
              }`}
            >
              <Radio className="h-3 w-3 text-cyan-400 animate-pulse" />
              {sseConnected ? "SSE LIVE STREAM: ACTIVE" : "LIVE WIRE"}
            </span>

            <span className="px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase rounded border border-slate-800 bg-slate-900/60 text-slate-300">
              {filteredStories.length} Filtered Stories
            </span>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded border border-slate-800 bg-[#080B11] p-0.5">
              <button
                onClick={() => setViewMode("terminal")}
                className={`flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded transition-colors ${
                  viewMode === "terminal"
                    ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Switch to Bloomberg Terminal Dual-Pane View"
              >
                <Terminal className="h-3 w-3" />
                Terminal
              </button>
              <button
                onClick={() => setViewMode("feed")}
                className={`flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded transition-colors ${
                  viewMode === "feed"
                    ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Switch to Editorial Cards View"
              >
                <LayoutGrid className="h-3 w-3" />
                Feed
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 border border-slate-800 bg-[#080B11] px-3 py-1.5 text-xs text-slate-400 sm:w-72 rounded">
            <Search className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search wire [/] to focus..."
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

        {/* Keyboard Navigation Shortcuts Bar */}
        <div className="hidden sm:flex items-center justify-between text-[10px] font-mono text-slate-400 px-1 py-1 bg-[#05080E] rounded border border-slate-800/60">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-300 border border-slate-700">J</kbd>
              <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-300 border border-slate-700">K</kbd>
              <span>Navigate Wire</span>
            </span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-300 border border-slate-700">ENTER</kbd>
              <span>Open Permanent Dossier</span>
            </span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-300 border border-slate-700">/</kbd>
              <span>Search</span>
            </span>
          </div>

          <span className="text-cyan-400">
            {stories.length} Wire Stories Ingested · Auto-Sync Active
          </span>
        </div>
      </div>

      {/* Main Dual-Pane Terminal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Active Story Full View */}
        <div className="lg:col-span-8 min-w-0">
          <StoryPanel story={activeStory} />
        </div>

        {/* Right: Live Wire List (Terminal vs Feed mode) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="border border-slate-800 bg-[#07090F] p-4 rounded-lg">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400 font-semibold flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                {viewMode === "terminal" ? "TERMINAL WIRE FEED" : "EDITORIAL WIRE"}
              </span>
              <span className="text-[9px] font-mono text-slate-500">
                {filteredStories.length} BULLETINS
              </span>
            </div>

            <div className="space-y-2 max-h-[760px] overflow-y-auto pr-1 no-scrollbar">
              {filteredStories.map((story) => {
                const isSelected = story.id === activeStory.id;
                const catalyst = analyzeStoryCatalyst(story.headline, story.summary || "");

                if (viewMode === "terminal") {
                  // High-Density Bloomberg Terminal Row
                  return (
                    <button
                      key={story.id}
                      onClick={() => setActiveStoryId(story.id)}
                      onMouseEnter={() => {
                        parseAndSynthesizeArticle({
                          headline: story.headline,
                          summary: story.summary,
                          source: story.source,
                          author: story.author,
                          id: story.id,
                        });
                      }}
                      className={`w-full text-left p-2.5 rounded transition-all border font-mono ${
                        isSelected
                          ? "border-cyan-400/80 bg-cyan-950/25 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                          : "border-slate-800/60 bg-[#0A0D15] hover:border-slate-700 hover:bg-[#0D121B]"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[9px] mb-1">
                        <span className="text-cyan-400 font-bold uppercase truncate max-w-[140px]">
                          {shortNewsSource(story.source)}
                        </span>
                        <span className="text-slate-400">{timeAgo(story.publishedAt)}</span>
                      </div>

                      <h3 className="text-xs font-sans font-medium text-slate-200 line-clamp-2 leading-snug">
                        {story.headline}
                      </h3>

                      <div className="mt-2 flex items-center justify-between gap-1 text-[9px] pt-1.5 border-t border-slate-800/60">
                        <span className="text-slate-400 uppercase tracking-tight truncate max-w-[120px]">
                          {catalyst.catalystLabel}
                        </span>

                        <span
                          className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                            catalyst.marketImpact === "BULLISH"
                              ? "bg-emerald-950/60 border border-emerald-500/40 text-emerald-300"
                              : catalyst.marketImpact === "VOLATILITY"
                              ? "bg-cyan-950/60 border border-cyan-500/40 text-cyan-300"
                              : catalyst.marketImpact === "BEARISH"
                              ? "bg-rose-950/60 border border-rose-500/40 text-rose-300"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {catalyst.marketImpact}
                        </span>
                      </div>
                    </button>
                  );
                }

                // Feed Mode (Card layout)
                return (
                  <button
                    key={story.id}
                    onClick={() => setActiveStoryId(story.id)}
                    onMouseEnter={() => {
                      parseAndSynthesizeArticle({
                        headline: story.headline,
                        summary: story.summary,
                        source: story.source,
                        author: story.author,
                        id: story.id,
                      });
                    }}
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
