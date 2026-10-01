"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, ExternalLink, Sparkles, TrendingUp, BookOpen, Layers } from "lucide-react";
import type { EntityWikiDef } from "@/lib/news/entities";
import { getCanonicalBackground } from "@/lib/wiki/canonical-backgrounds";

interface EntityHoverCardProps {
  entity: EntityWikiDef;
  children: React.ReactNode;
  className?: string;
}

export function EntityHoverCard({ entity, children, className }: EntityHoverCardProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsOpen(true), 180);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsOpen(false), 220);
  };

  const canonical = React.useMemo(() => {
    return (
      getCanonicalBackground(entity.term) ||
      (entity.wikiPath ? getCanonicalBackground(entity.wikiPath.replace(/^\/wiki\/entry\//, "")) : null)
    );
  }, [entity.term, entity.wikiPath]);

  const isActor = entity.type === "creator" && Boolean(entity.roleDetails);
  const isLexicon =
    Boolean(entity.lexiconDetails) ||
    entity.type === "market-concept" ||
    entity.type === "grading" ||
    entity.type === "lexicon";

  const typeLabel = isActor
    ? "Adaptation Talent"
    : entity.type === "character"
    ? "Canonical Character"
    : entity.type === "publisher"
    ? "Studio / Publisher"
    : entity.type === "creator"
    ? "Creator / Author"
    : entity.type === "equity"
    ? "Comic Equity / Index"
    : "CBR Market Lexicon";

  const landmarkIssue = canonical?.landmarkIssue || entity.roleDetails?.landmarkIssue;
  const fmvBenchmark = canonical?.baseFmv ? `$${canonical.baseFmv.toLocaleString()}` : null;
  const creators = canonical?.creators;
  const era = canonical?.era;

  return (
    <span
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={entity.wikiPath} className={className} prefetch>
        {children}
      </Link>

      {isOpen && (
        <div
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-84 sm:w-96 rounded-lg border border-slate-700/90 bg-[#070A11] p-3.5 shadow-2xl shadow-cyan-950/40 text-left transition-all animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <span className="text-[9px] font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-cyan-400" />
              {typeLabel}
            </span>
            <div className="flex items-center gap-1.5">
              {era && (
                <span className="text-[9px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                  {era}
                </span>
              )}
              {entity.ticker && (
                <span className="text-[9px] font-mono font-bold text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                  {entity.ticker}
                </span>
              )}
              {entity.lexiconDetails?.category && (
                <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30 truncate max-w-[130px]">
                  {entity.lexiconDetails.category}
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <h4 className="mt-2 text-sm font-bold text-slate-100 flex items-center justify-between">
            <span>{entity.term}</span>
            {fmvBenchmark && (
              <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> CGC 9.8: {fmvBenchmark}
              </span>
            )}
          </h4>

          {/* Canonical Lore & Landmark Issue */}
          {landmarkIssue && (
            <div className="mt-2 rounded bg-slate-900/90 p-2 border border-slate-800 text-[11px] leading-relaxed">
              <p className="text-slate-300">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
                  Landmark Key Debut:
                </span>
                <strong className="text-cyan-300 font-semibold">{landmarkIssue}</strong>
              </p>
              {creators && (
                <p className="mt-1 text-slate-400 text-[10px]">
                  Creative Architects: <span className="text-slate-200">{creators}</span>
                </p>
              )}
              {canonical?.description && (
                <p className="mt-1.5 pt-1.5 border-t border-slate-800/80 text-slate-400 line-clamp-2 text-[10px] leading-tight">
                  {canonical.description}
                </p>
              )}
            </div>
          )}

          {/* Adaptation Talent Details */}
          {entity.roleDetails && !canonical && (
            <div className="mt-1.5 rounded bg-slate-900/80 p-2 border border-slate-800 text-[11px] leading-tight">
              <p className="text-slate-400">
                Portrayal: <strong className="text-slate-200">{entity.roleDetails.character}</strong>
              </p>
              {entity.roleDetails.landmarkIssue && (
                <p className="mt-1 text-slate-400">
                  Landmark Issue:{" "}
                  <strong className="text-cyan-300">{entity.roleDetails.landmarkIssue}</strong>
                </p>
              )}
            </div>
          )}

          {/* Lexicon Details: Investopedia definition + Panel Profits translation */}
          {entity.lexiconDetails && (
            <div className="mt-2 space-y-1.5 rounded bg-slate-900/90 p-2.5 border border-slate-800 text-[11px] leading-relaxed">
              {entity.lexiconDetails.translation && (
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-cyan-400 font-semibold block mb-0.5">
                    Comic Market Meaning:
                  </span>
                  <p className="text-slate-200 line-clamp-3">
                    {entity.lexiconDetails.translation}
                  </p>
                </div>
              )}
              {entity.lexiconDetails.definition && (
                <div className="pt-1.5 border-t border-slate-800/80">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
                    Investopedia Financial Principle:
                  </span>
                  <p className="text-slate-300 line-clamp-2">
                    {entity.lexiconDetails.definition}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Actions & Deep Links */}
          <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[10px] font-mono">
            <Link
              href={entity.wikiPath}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              {isLexicon ? "Inspect in Lexicon" : "Open Dossier"} <ArrowUpRight className="h-3 w-3" />
            </Link>

            {entity.lexiconDetails?.investopediaUrl && (
              <a
                href={entity.lexiconDetails.investopediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-300 hover:text-amber-200 flex items-center gap-1 transition-colors"
              >
                Investopedia <ExternalLink className="h-3 w-3" />
              </a>
            )}

            {landmarkIssue && (
              <Link
                href={`/comics?q=${encodeURIComponent(landmarkIssue.replace(/\s*\([^)]*\)/, ""))}`}
                className="text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
              >
                Market Book <BookOpen className="h-3 w-3" />
              </Link>
            )}

            {entity.ticker?.startsWith("$") && !isLexicon && (
              <Link
                href={entity.ticker.startsWith("$CE") || entity.ticker.startsWith("$PPIX") ? `/equity/${entity.ticker.replace('$', '')}` : `/equities`}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
                Trade Desk <Layers className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>
      )}
    </span>
  );
}
