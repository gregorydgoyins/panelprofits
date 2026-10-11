"use client";

import * as React from "react";
import Link from "next/link";
import { type EntityWikiDef } from "@/lib/news/entities";
import { LinkedBriefing } from "@/components/news/linked-briefing";
import { parseAndSynthesizeArticle, type SynthesizedArticle } from "@/lib/news/article-parser";
import { Activity, BookOpen, ShieldAlert, Sparkles } from "lucide-react";

function dateLabel(value: string | null) {
  if (!value) return "Publication date unavailable";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function NewsBriefing({
  id,
  headline,
  summary,
  source,
  sourceUrl,
  author,
  publishedAt,
  entities: initialEntities,
  synthesizedArticle,
}: {
  id?: string;
  headline: string;
  summary: string | null;
  source: string;
  sourceUrl: string;
  author: string | null;
  publishedAt: string | null;
  entities?: EntityWikiDef[];
  synthesizedArticle?: SynthesizedArticle;
}) {
  const article = React.useMemo(() => {
    if (synthesizedArticle) return synthesizedArticle;
    return parseAndSynthesizeArticle({
      headline,
      summary,
      source,
      author,
      id,
    });
  }, [synthesizedArticle, headline, summary, source, author, id]);

  // `initialEntities` comes from the server page's async, Supabase-backed match
  // (getDynamicEntitiesForText) but only against the raw headline/summary text.
  // `article.entities` is the synchronous match computed above against the FULL rendered
  // article body -- the analytical paragraphs, ramification/ripple cards, and lore dossier
  // blurbs below, none of which the server-side text covers. Merge both (deduping by
  // term, case-insensitively) rather than picking one exclusively, so every section below
  // gets full linking coverage instead of only whichever text the DB-backed pass saw.
  const activeEntities = React.useMemo(() => {
    const merged: EntityWikiDef[] = [];
    const seen = new Set<string>();
    for (const list of [initialEntities || [], article.entities]) {
      for (const entity of list) {
        const key = entity.term.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push(entity);
      }
    }
    return merged;
  }, [initialEntities, article.entities]);

  return (
    <div className="mt-8 space-y-6 border-l-2 border-cyan-500/60 bg-cyan-950/15 px-5 py-6 sm:px-7 rounded-r">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 text-[10px] uppercase tracking-[0.14em] text-cyan-300 font-mono">
        <div>
          <p>{source}{author ? ` · ${author}` : ""}</p>
          <p className="mt-1 text-slate-500 font-sans">
            {dateLabel(publishedAt)} ·{" "}
            <a
              href={sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 underline underline-offset-2 hover:text-cyan-200 transition-colors"
            >
              Source article
            </a>
          </p>
        </div>
        <div className="text-right font-mono text-[10px] text-cyan-400/90 font-medium">
          {article.readingTimeMinutes} MIN READ · {article.wordCount} WORDS
        </div>
      </div>

      {/* --- AUTHENTIC REPORTING BODY WITH LIVE TOKENIZATION --- */}
      <section className="space-y-4">
        {article.paragraphs.map((para, idx) => (
          <p key={idx} className="text-base leading-8 text-slate-200">
            <LinkedBriefing text={para} entities={activeEntities} />
          </p>
        ))}
      </section>

    </div>
  );
}
