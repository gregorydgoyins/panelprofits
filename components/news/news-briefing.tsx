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

      {/* --- SUPERHERO MARKET RAMIFICATIONS & VALUATION IMPACT --- */}
      {article.superheroRamifications.length > 0 && (
        <div className="mt-6 rounded-lg border border-amber-900/60 bg-[#120f08] p-4 shadow-lg">
          <div className="flex items-center gap-2 border-b border-amber-900/40 pb-2.5">
            <ShieldAlert className="h-4 w-4 text-amber-400" />
            <h2 className="text-[11px] font-mono uppercase tracking-[0.16em] text-amber-300 font-semibold">
              SUPERHERO MARKET RAMIFICATIONS · VALUATION & CENSUS SHOCK MATRIX
            </h2>
          </div>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            Specific comic market consequences and secondary trading stance for every superhero and faction affected by this story:
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {article.superheroRamifications.map((ram, idx) => (
              <div key={idx} className="rounded border border-amber-900/40 bg-[#1a140b] p-3 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-900/30 pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs text-amber-200">
                        {ram.characterName}
                      </span>
                      <span className="font-mono text-[10px] text-amber-400">
                        ({ram.ticker})
                      </span>
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                      ram.marketStance.includes("BULLISH")
                        ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-300"
                        : ram.marketStance.includes("COOLING")
                        ? "bg-rose-950/80 border-rose-500/60 text-rose-300"
                        : "bg-cyan-950/80 border-cyan-500/60 text-cyan-300"
                    }`}>
                      {ram.marketStance}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-cyan-400">
                      Debut: <Link href={`/comics?q=${encodeURIComponent(ram.firstAppearance)}`} className="underline hover:text-cyan-200">{ram.firstAppearance}</Link>
                    </span>
                    <span className="font-mono text-amber-300 text-[10px]">
                      9.8 FMV: {ram.cgc98Fmv} ({ram.projectedVelocity})
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-slate-300 leading-relaxed">
                    <strong className="text-amber-200 text-[11px] block font-mono">Story Ramification:</strong>
                    <LinkedBriefing text={ram.directStoryRamification} entities={activeEntities} />
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-amber-900/20 text-[11px] text-slate-400 leading-snug">
                  <strong className="text-cyan-400 text-[10px] block font-mono">Census & Pricing Dynamic:</strong>
                  <LinkedBriefing text={ram.censusAndPricingImpact} entities={activeEntities} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- RESEARCHED CANON PROPER NOUNS & INVESTOPEDIA RELEVANCE --- */}
      {article.researchedProperNouns && article.researchedProperNouns.length > 0 && (
        <div className="mt-6 rounded-lg border border-cyan-800/60 bg-[#08121f] p-4 shadow-lg">
          <div className="flex items-center gap-2 border-b border-cyan-800/40 pb-2.5">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <h2 className="text-[11px] font-mono uppercase tracking-[0.16em] text-cyan-300 font-semibold">
              RESEARCHED PROPER NOUNS · CANONICAL RELEVANCE & INVESTOPEDIA PRINCIPLES
            </h2>
          </div>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            Every proper noun in this story has been canonically researched for comic book relevance, landmark debuts, historical architects, and secondary market financial principles:
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {article.researchedProperNouns.map((noun, idx) => (
              <div key={idx} className="rounded border border-cyan-900/40 bg-[#0a1829] p-3 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-900/30 pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs text-cyan-200">
                        {noun.properNoun}
                      </span>
                      <span className="font-mono text-[10px] text-cyan-400 font-bold">
                        ({noun.ticker})
                      </span>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-cyan-700/60 bg-cyan-950 text-cyan-300 uppercase">
                      {noun.category} · {noun.era}
                    </span>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-300">
                    <span className="font-mono text-cyan-400 block text-[10px] uppercase tracking-wider">
                      Role / Identity:
                    </span>
                    <span className="text-slate-200 font-medium">{noun.comicRoleOrIdentity}</span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-cyan-400">
                      Landmark Key: <Link href={`/comics?q=${encodeURIComponent(noun.landmarkDebutIssue)}`} className="underline hover:text-cyan-200">{noun.landmarkDebutIssue}</Link>
                    </span>
                    <span className="font-mono text-emerald-400 text-[10px] font-bold">
                      CGC 9.8: ${noun.cgc98Fmv.toLocaleString()}
                    </span>
                  </div>

                  {noun.creativeArchitects && (
                    <div className="mt-1 text-[10px] text-slate-400">
                      Architects: <span className="text-slate-300">{noun.creativeArchitects}</span>
                    </div>
                  )}

                  <div className="mt-2 text-xs text-slate-300 leading-relaxed border-t border-cyan-900/30 pt-2">
                    <strong className="text-cyan-300 text-[10px] block font-mono uppercase tracking-wider">
                      Market Relevance:
                    </strong>
                    <LinkedBriefing text={noun.marketRelevanceThesis} entities={activeEntities} />
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-pink-900/40 text-[11px] text-slate-300 leading-snug bg-pink-950/40 p-2.5 rounded border border-pink-500/30">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-pink-400 font-mono text-[10px] uppercase font-bold">
                      Investopedia: {noun.investopediaPrinciple.term}
                    </span>
                    <a
                      href={noun.investopediaPrinciple.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] font-mono text-pink-300 underline hover:text-pink-100 font-medium"
                    >
                      Principle ↗
                    </a>
                  </div>
                  <p className="text-slate-300 text-[10px] leading-tight mb-1">
                    {noun.investopediaPrinciple.definition}
                  </p>
                  <p className="text-pink-200/95 text-[10px] leading-tight font-sans">
                    <strong>Panel Profits Translation:</strong> {noun.investopediaPrinciple.translation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                  <LinkedBriefing text={ripple.catalystCausality} entities={activeEntities} />
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
                  <LinkedBriefing text={lore.encyclopedicLore} entities={activeEntities} />
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
