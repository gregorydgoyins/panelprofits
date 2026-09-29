"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Newspaper, Calendar, ExternalLink } from "lucide-react";
import { findNewsEntities, type EntityWikiDef } from "@/lib/news/entities";
import { LinkedBriefing } from "@/components/news/linked-briefing";
import { shortNewsSource, type NewsStory } from "@/lib/news/types";
import { AuthenticVideoEmbed, extractAuthenticVideo } from "@/components/news/authentic-video-embed";
import { analyzeStoryCatalyst } from "@/lib/news/catalyst";
import { CatalystKeyRail } from "@/components/news/CatalystKeyRail";
import { AudioBriefingPlayer } from "@/components/news/AudioBriefingPlayer";
import { AnalystDeskMemo } from "@/components/news/AnalystDeskMemo";

"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Newspaper, Calendar, ExternalLink, Activity, BookOpen, Layers, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { findNewsEntities, type EntityWikiDef } from "@/lib/news/entities";
import { LinkedBriefing } from "@/components/news/linked-briefing";
import { shortNewsSource, type NewsStory } from "@/lib/news/types";
import { AuthenticVideoEmbed, extractAuthenticVideo } from "@/components/news/authentic-video-embed";
import { analyzeStoryCatalyst } from "@/lib/news/catalyst";
import { CatalystKeyRail } from "@/components/news/CatalystKeyRail";
import { AudioBriefingPlayer } from "@/components/news/AudioBriefingPlayer";
import { AnalystDeskMemo } from "@/components/news/AnalystDeskMemo";
import { parseAndSynthesizeArticle } from "@/lib/news/article-parser";

function relativeTime(d: string | null) {
  if (!d) return "Recently";
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return "Recently";
  const ms = Date.now() - parsed.getTime();
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${Math.max(m, 1)}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  if (h < 48) return "Yesterday";
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function StoryPanel({ story }: { story: NewsStory }) {
  if (!story) return null;

  const article = React.useMemo(() => {
    return parseAndSynthesizeArticle({
      headline: story.headline,
      summary: story.summary,
      source: story.source,
      author: story.author,
      id: story.id,
    });
  }, [story]);

  const entities = article.entities;
  const authenticVideo = extractAuthenticVideo(story.summary, story.url);
  const catalyst = article.catalyst;
  const allEntities = entities;

  const hasEditorialImage = Boolean(story.imageUrl && !story.imageUrl.includes("google.com/s2/favicons"));

  return (
    <article className="border border-slate-800 bg-[#0A0D15] p-6 sm:p-8 shadow-xl flex flex-col justify-between rounded-lg">
      <div>
        {/* Header Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400 font-semibold flex items-center gap-1.5">
              <Newspaper className="h-3.5 w-3.5 text-cyan-400" />
              {shortNewsSource(story.source)}
            </span>
            <span className="text-slate-600 font-mono">|</span>
            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
              <Calendar className="h-3 w-3 text-slate-500" />
              {relativeTime(story.publishedAt)}
            </span>
            <span className="text-slate-600 font-mono">|</span>
            <span className="text-[10px] font-mono text-cyan-400/90 font-medium">
              {article.readingTimeMinutes} MIN READ · {article.wordCount} WORDS
            </span>
            {authenticVideo && (
              <span className="px-1.5 py-0.5 rounded bg-red-950/60 border border-red-500/40 text-[9px] font-mono text-red-400 font-semibold uppercase">
                VIDEO BROADCAST
              </span>
            )}
          </div>

          {story.author && (
            <span className="text-[10px] font-mono text-slate-400">
              Reported by <strong className="text-slate-200">{story.author}</strong>
            </span>
          )}
        </div>

        {/* Lead Headline with Live Entity Tokenization */}
        <h1 className="mt-4 text-2xl sm:text-3xl font-semibold text-slate-100 leading-tight tracking-tight">
          <LinkedBriefing text={story.headline} entities={allEntities} />
        </h1>

        {/* Authentic Video Player or Editorial Artwork */}
        {authenticVideo ? (
          <div className="mt-5">
            <AuthenticVideoEmbed video={authenticVideo} headline={story.headline} />
          </div>
        ) : (
          hasEditorialImage && (
            <div className="mt-5 overflow-hidden rounded border border-slate-800/80 bg-[#06080D] flex justify-center">
              <img
                src={story.imageUrl!}
                alt={story.headline}
                className="max-h-[380px] w-auto max-w-full object-contain"
              />
            </div>
          )
        )}

        {/* In-Browser Text-to-Speech Audio Briefing Player */}
        <AudioBriefingPlayer
          headline={story.headline}
          summary={article.paragraphs.join(" ")}
          source={story.source}
        />

        {/* Market Catalyst Engine Rail */}
        <CatalystKeyRail analysis={catalyst} />

        {/* --- THE MARKET BUTTERFLY EFFECT (ASSET RIPPLE PROJECTIONS) --- */}
        {article.butterflyRipples.length > 0 && (
          <div className="mt-6 rounded-lg border border-cyan-900/60 bg-[#080d1a] p-4 shadow-lg">
            <div className="flex items-center gap-2 border-b border-cyan-900/40 pb-2.5">
              <Activity className="h-4 w-4 text-cyan-400" />
              <h2 className="text-[11px] font-mono uppercase tracking-[0.16em] text-cyan-300 font-semibold">
                THE MARKET BUTTERFLY EFFECT · ASSET RIPPLE PROJECTIONS
              </h2>
            </div>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              How the narrative complexity, studio maneuvers, and casting attachments in this report trigger downstream price shocks across physical comic equities:
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {article.butterflyRipples.map((ripple, idx) => (
                <div key={idx} className="rounded border border-slate-800 bg-[#0c1322] p-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] text-cyan-400 font-semibold">
                        {ripple.ticker}
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                        ripple.direction === "surge"
                          ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-300"
                          : ripple.direction === "uptick"
                          ? "bg-cyan-950/80 border-cyan-500/60 text-cyan-300"
                          : "bg-rose-950/80 border-rose-500/60 text-rose-300"
                      }`}>
                        {ripple.projectedDelta}
                      </span>
                    </div>
                    <div className="mt-1 text-xs font-medium text-slate-200">
                      {ripple.assetName}
                    </div>
                    <div className="mt-0.5 text-[10px] text-slate-400 font-mono">
                      Key: {ripple.landmarkKey}
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-400 leading-snug">
                    {ripple.catalystCausality}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- ENCYCLOPEDIC LORE DEEP-DIVES --- */}
        {article.loreDeepDives.length > 0 && (
          <div className="mt-6 rounded-lg border border-purple-900/60 bg-[#0e0a1a] p-4 shadow-lg">
            <div className="flex items-center gap-2 border-b border-purple-900/40 pb-2.5">
              <BookOpen className="h-4 w-4 text-purple-400" />
              <h2 className="text-[11px] font-mono uppercase tracking-[0.16em] text-purple-300 font-semibold">
                ENCYCLOPEDIC LORE DOSSIERS · CANON PROVENANCE
              </h2>
            </div>
            <div className="mt-3 space-y-3">
              {article.loreDeepDives.map((lore, idx) => (
                <div key={idx} className="rounded border border-purple-900/40 bg-[#140f24] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-xs text-purple-200">
                      {lore.term} <span className="font-mono text-[10px] text-purple-400 font-normal">({lore.ticker})</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {lore.era} · Creators: <strong className="text-slate-300">{lore.creators}</strong>
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] font-mono text-cyan-400">
                    Landmark Debut: <Link href={`/comics?q=${encodeURIComponent(lore.firstAppearance)}`} className="underline hover:text-cyan-200">{lore.firstAppearance}</Link>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                    {lore.encyclopedicLore}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Multi-Paragraph Comprehensive Intelligence Body with Live Entity Tokenization */}
        <div className="mt-6 space-y-5 text-sm sm:text-base leading-relaxed text-slate-300">
          {article.sections.map((sec, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="text-[11px] font-mono uppercase tracking-[0.16em] text-cyan-400/90 font-semibold border-b border-slate-800/40 pb-1">
                {sec.heading}
              </h3>
              <p className="leading-relaxed text-slate-300 text-sm sm:text-[15px]">
                <LinkedBriefing text={sec.body} entities={allEntities} />
              </p>
            </div>
          ))}
        </div>

        {/* 3-Point Institutional Analyst Desk Memo */}
        <AnalystDeskMemo
          storyId={story.id}
          source={story.source}
          headline={story.headline}
          summary={story.summary}
          catalyst={catalyst}
        />

        {/* Entity Cross-References Bar */}
        {allEntities.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-slate-800/80">
            <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 mr-1">
              Referenced Lore & Market Entities:
            </span>
            {allEntities.slice(0, 10).map((entity) => (
              <Link
                key={entity.term}
                prefetch
                href={entity.wikiPath}
                className="inline-flex items-center gap-1 border border-slate-800 bg-slate-900/60 px-2 py-0.5 text-[10px] text-slate-300 hover:border-cyan-400 hover:text-cyan-200 transition-colors rounded"
              >
                <span>{entity.term}</span>
                {entity.ticker && (
                  <span className="text-[8px] font-mono text-cyan-400 font-semibold uppercase">
                    ({entity.ticker})
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer Navigation & Outbound Link */}
      <div className="mt-8 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
        <a
          href={story.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 uppercase tracking-wider font-medium transition-colors"
        >
          Read full report at {story.source} <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <Link
          href={`/news/${story.id}`}
          className="text-xs text-slate-400 hover:text-slate-200 uppercase tracking-wider font-medium flex items-center gap-1"
        >
          Permanent Dossier <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
