"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Newspaper, Calendar, ExternalLink, Activity, BookOpen, Layers, TrendingUp, TrendingDown, Sparkles, ShieldAlert, Award } from "lucide-react";
import { findNewsEntities, type EntityWikiDef } from "@/lib/news/entities";
import { LinkedBriefing } from "@/components/news/linked-briefing";
import { shortNewsSource, type NewsStory } from "@/lib/news/types";
import { AuthenticVideoEmbed, extractAuthenticVideo } from "@/components/news/authentic-video-embed";
import { analyzeStoryCatalyst } from "@/lib/news/catalyst";
import { CatalystKeyRail } from "@/components/news/CatalystKeyRail";
import { MarketReactionCard } from "@/components/news/MarketReactionCard";
import { AudioBriefingPlayer } from "@/components/news/AudioBriefingPlayer";
import { parseAndSynthesizeArticle } from "@/lib/news/article-parser";
import { ForeignLanguageTranslationBar } from "@/components/news/ForeignLanguageTranslationBar";
import { type SupportedLanguage, translateNewsText, COMIC_FINANCIAL_GLOSSARY } from "@/lib/i18n/news-translation";

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

  const [currentLanguage, setCurrentLanguage] = React.useState<SupportedLanguage>("en");
  const displayHeadline = React.useMemo(() => translateNewsText(article.headline, currentLanguage), [article.headline, currentLanguage]);
  const displayParagraphs = React.useMemo(() => article.paragraphs.map((p) => translateNewsText(p, currentLanguage)), [article.paragraphs, currentLanguage]);

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

        {/* Foreign Language Editions Translation Bar */}
        <div className="mt-4">
          <ForeignLanguageTranslationBar
            currentLanguage={currentLanguage}
            onLanguageChange={setCurrentLanguage}
          />
        </div>

        {/* Lead Headline with Live Entity Tokenization */}
        <h1 className="mt-4 text-2xl sm:text-3xl font-semibold text-slate-100 leading-tight tracking-tight">
          <LinkedBriefing text={displayHeadline} entities={allEntities} />
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

        {/* Studio Neural Text-to-Speech Audio Briefing Player */}
        <AudioBriefingPlayer
          headline={story.headline}
          summary={story.summary}
          source={story.source}
          storyId={story.id}
          catalystReasoning={catalyst?.reasoning}
        />

        {/* Institutional Market Reaction & Sovereign Comic Valuation Matrix */}
        <MarketReactionCard catalyst={catalyst} storyTitle={story.headline} />

        {/* Market Catalyst Engine Rail */}
        <CatalystKeyRail analysis={catalyst} />

        {/* Authentic Story Body with Live Entity Tokenization */}
        <div className="mt-6 space-y-4 text-sm sm:text-base leading-relaxed text-slate-200">
          {displayParagraphs.map((p, idx) => (
            <p key={idx} className="leading-relaxed">
              <LinkedBriefing text={p} entities={allEntities} />
            </p>
          ))}
        </div>


        {/* Entity Cross-References Bar */}
        {allEntities.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-slate-800/80">
            <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 mr-1">
              Referenced Lore & Market Entities:
            </span>
            {allEntities.slice(0, 10).map((entity) => (
              <Link
                key={entity.term}
                prefetch={false}
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
