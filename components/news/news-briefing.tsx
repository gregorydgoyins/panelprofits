"use client";

import * as React from "react";
import Link from "next/link";
import { type EntityWikiDef } from "@/lib/news/entities";
import { LinkedBriefing } from "@/components/news/linked-briefing";
import { parseAndSynthesizeArticle } from "@/lib/news/article-parser";
import { Activity, BookOpen } from "lucide-react";

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
}: {
  id?: string;
  headline: string;
  summary: string | null;
  source: string;
  sourceUrl: string;
  author: string | null;
  publishedAt: string | null;
  entities?: EntityWikiDef[];
}) {
  const article = React.useMemo(() => {
    return parseAndSynthesizeArticle({
      headline,
      summary,
      source,
      author,
      id,
    });
  }, [headline, summary, source, author, id]);

  const activeEntities = initialEntities && initialEntities.length > 0 ? initialEntities : article.entities;

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
            How narrative complexity, studio maneuvers, and casting attachments in this report trigger downstream price shocks across physical comic equities:
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
    </div>
  );
}
