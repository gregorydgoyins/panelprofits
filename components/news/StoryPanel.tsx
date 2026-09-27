"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, UserCheck, ShieldAlert, Sparkles } from "lucide-react";
import { classifyStoryPriority } from "@/lib/news/broadcast-script";
import { findNewsEntities } from "@/lib/news/entities";
import { LinkedBriefing } from "@/components/news/linked-briefing";
import { selectAuthorForStory } from "@/lib/news/authors";
import type { NewsStory } from "@/lib/news/feed";

function relativeTime(d: string | null) {
  if (!d) return "Recently";
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return "Recently";
  const ms = Date.now() - parsed.getTime();
  const h = Math.floor(ms / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  if (h < 48) return "Yesterday";
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const PRIORITY_LABELS: Record<string, { label: string; color: string; border: string; bg: string }> = {
  breaking: { label: "BREAKING", color: "#F43F5E", border: "border-rose-500/50", bg: "bg-rose-950/40" },
  developing: { label: "DEVELOPING", color: "#F59E0B", border: "border-amber-500/50", bg: "bg-amber-950/40" },
  background: { label: "WIRE", color: "#94A3B8", border: "border-slate-700", bg: "bg-slate-900/40" },
};

function Block({ label, title, text, authorName }: { label: string; title: string; text: string; authorName?: string }) {
  return (
    <section className="border border-slate-800/80 bg-[#07090F] p-4 shadow-sm rounded">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-amber-400 font-semibold">{label}</span>
        {authorName && <span className="text-[8px] font-mono text-slate-500 uppercase">{authorName}</span>}
      </div>
      <h3 className="text-xs font-semibold text-slate-100">{title}</h3>
      <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{text}</p>
    </section>
  );
}

export function StoryPanel({ story }: { story: NewsStory }) {
  if (!story) return null;

  const priority = classifyStoryPriority({ headline: story.headline, description: story.summary });
  const pCfg = PRIORITY_LABELS[priority] || PRIORITY_LABELS.background;
  const desc = story.summary || "";
  const entities = findNewsEntities(story.headline, story.summary);
  const author = selectAuthorForStory(story.source, story.id);

  const sentences = desc.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  const paragraphs = sentences.reduce<string[]>((groups, sentence, index) => {
    const groupIndex = Math.floor(index / 3);
    groups[groupIndex] = `${groups[groupIndex] || ""}${groups[groupIndex] ? " " : ""}${sentence}`;
    return groups;
  }, []).slice(0, 8);

  const analysisText = `${author.writingStyle.introStyle} ${author.writingStyle.analysisFocus}`;
  const implicationsText = `${author.writingStyle.implicationAngle} ${
    entities.length
      ? `Collectors observing ${entities.slice(0, 2).join(" and ")} should closely track FOC allocations.`
      : "Broad positioning adjustments expected prior to official press confirmation."
  }`;
  const marketText = `${author.writingStyle.marketAngle} ${
    entities.length
      ? `Watchlists tied to ${entities.slice(0, 3).join(", ")} will reflect near-term pricing sentiment.`
      : "Catalog items in this tier are entering a high-interest observation window."
  }`;

  return (
    <article className="border border-slate-800 bg-[#0A0D15] p-6 sm:p-8 shadow-xl flex flex-col justify-between">
      <div>
        {/* Top Meta & Priority */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-300 font-semibold">
              Lead Story
            </span>
            <span
              className={`text-[9px] font-mono tracking-widest px-2 py-0.5 border ${pCfg.border} ${pCfg.bg}`}
              style={{ color: pCfg.color }}
            >
              {pCfg.label}
            </span>
          </div>

          {/* Author Badge */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase rounded border ${author.badgeBorder} ${author.badgeBg} ${author.badgeText}`}>
              <UserCheck className="h-3 w-3" />
              {author.name} · {author.role}
            </span>
          </div>
        </div>

        {/* Provenance Banner */}
        <div className="mt-3 flex items-center gap-2 px-3 py-1.5 text-[11px] font-mono rounded border border-slate-800 bg-[#06080D] text-slate-400">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span>
            WIRE PROVENANCE: <strong className="text-slate-200">{story.source}</strong>
            {story.author && <span> · Reported by <strong className="text-slate-300">{story.author}</strong></span>}
            <span className="text-slate-600"> | </span>
            <span className="text-slate-500">{relativeTime(story.publishedAt)}</span>
          </span>
        </div>

        {/* Big Headline */}
        <h1 className="mt-4 text-2xl sm:text-3xl font-semibold text-slate-100 leading-tight">
          {story.headline}
        </h1>

        {/* Editorial Body Text */}
        {paragraphs.length > 0 ? (
          <div className="mt-5 space-y-4 text-sm sm:text-base leading-7 text-slate-300">
            {paragraphs.map((p, i) => (
              <p key={i}>
                <LinkedBriefing text={p} terms={entities} />
              </p>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm leading-7 text-slate-400 italic">
            This report was ingested from the wire with authentic publisher metadata. Read the original report below.
          </p>
        )}

        {/* 3-Column Narrative Intelligence Grid with Persona Voice */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Block label="Analyst Breakdown" title={author.beat} text={analysisText} authorName={author.name} />
          <Block label="Implications" title="What Changes Next" text={implicationsText} authorName={author.name} />
          <Block label="Market Impact" title="Asset Positioning" text={marketText} authorName={author.name} />
        </div>

        {/* PPedia Entity Tags */}
        {entities.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-slate-800/80">
            <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 mr-1">PPedia:</span>
            {entities.slice(0, 8).map((term) => (
              <Link
                key={term}
                prefetch
                href={`/wiki?q=${encodeURIComponent(term)}`}
                className="border border-pink-500/40 bg-pink-950/20 px-2 py-0.5 text-[10px] text-pink-300 hover:border-pink-300 hover:text-pink-100 transition-colors"
              >
                {term}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer Attribution Link */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
        <a
          href={story.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-amber-300/90 hover:text-amber-200 uppercase tracking-wider font-medium transition-colors"
        >
          Read original article at {story.source} <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
        <Link
          href={`/news/${story.id}`}
          className="text-xs text-cyan-400 hover:text-cyan-300 uppercase tracking-wider font-medium"
        >
          Open Dedicated Dossier &rarr;
        </Link>
      </div>
    </article>
  );
}
