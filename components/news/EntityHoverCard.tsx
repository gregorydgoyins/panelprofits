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

function getResolvedLexiconDetails(entity: EntityWikiDef, canonical: ReturnType<typeof getCanonicalBackground>) {
  if (entity.lexiconDetails?.definition && entity.lexiconDetails?.translation) {
    return {
      category: entity.lexiconDetails.category || "CBR Financial Lexicon",
      translation: entity.lexiconDetails.translation,
      definition: entity.lexiconDetails.definition,
      investopediaUrl:
        entity.lexiconDetails.investopediaUrl ||
        `https://www.investopedia.com/search?q=${encodeURIComponent(entity.term)}`,
    };
  }

  // If entity is character / lore
  if (entity.type === "character" || canonical) {
    const characterName = canonical?.term || entity.term;
    return {
      category: "Alternative Asset Valuation",
      translation: `Certified high-grade key issues of ${characterName} represent atomic collectible equities where physical census scarcity (CGC/CBCS 9.8 population) and media-catalyst velocity determine secondary market price discovery.`,
      definition:
        "Alternative Investment Asset: A tangible or financial asset outside standard public equities or bonds, valued based on verified historical provenance, physical preservation condition, and structural supply inelasticity.",
      investopediaUrl: "https://www.investopedia.com/terms/a/alternative_investment.asp",
    };
  }

  // If entity is creator / talent
  if (entity.type === "creator") {
    return {
      category: "Creative Provenance & Key-Person Value",
      translation: `Creative architects and attached cinematic talent serve as primary narrative catalysts, directly accelerating trade velocity and secondary market liquidity into their signature runs and landmark debuts.`,
      definition:
        "Key Person Value: The quantifiable economic value attributable to essential creative or leadership talent whose participation anchors market sentiment, auction demand, and brand equity.",
      investopediaUrl: "https://www.investopedia.com/terms/k/keypersoninsurance.asp",
    };
  }

  // If entity is publisher / studio
  if (entity.type === "publisher") {
    return {
      category: "Enterprise Value & IP Royalties",
      translation: `Parent entertainment conglomerates monetize sequential art intellectual property through multi-billion dollar box office cycles, premium streaming licensing, and global consumer merchandising.`,
      definition:
        "Conglomerate Valuation: An enterprise spanning diverse media and operating segments, where proprietary IP libraries generate high-margin recurring licensing cash flows.",
      investopediaUrl: "https://www.investopedia.com/terms/c/conglomerate.asp",
    };
  }

  // If entity is equity / index
  if (entity.type === "equity") {
    return {
      category: "Index Methodology & Capitalization",
      translation: `Standardized comic equities, constituent baskets, and indices track systemic valuation movements, liquidity spreads, and capital rotation across physical and fractional collectible tranches.`,
      definition:
        "Market Capitalization & Index Weighting: The aggregate market value of an asset class measured across outstanding constituent units, providing a standardized benchmark for tracking sector performance.",
      investopediaUrl: "https://www.investopedia.com/terms/m/marketcapitalization.asp",
    };
  }

  // Default fallback for any market/lexicon term
  return {
    category: "CBR Market Mechanics",
    translation: `Quantitative comic market framework governing secondary auction bids, graded registry turnover, and certified slab valuation multiples.`,
    definition:
      "Fair Market Value (FMV): The price at which an asset trades between a willing buyer and a willing seller on an open, competitive market with reasonable knowledge of relevant facts.",
    investopediaUrl: `https://www.investopedia.com/search?q=${encodeURIComponent(entity.term)}`,
  };
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

  const lexicon = React.useMemo(() => {
    return getResolvedLexiconDetails(entity, canonical);
  }, [entity, canonical]);

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
          className={`absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-84 sm:w-96 rounded-lg border bg-[#070A11] p-3.5 shadow-2xl text-left transition-all animate-in fade-in zoom-in-95 duration-150 ${
            isLexicon
              ? "border-pink-500/60 shadow-pink-950/50"
              : "border-slate-700/90 shadow-cyan-950/40"
          }`}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <span
              className={`text-[9px] font-mono uppercase tracking-wider font-semibold flex items-center gap-1 ${
                isLexicon ? "text-pink-400" : "text-cyan-400"
              }`}
            >
              <Sparkles className={`h-3 w-3 ${isLexicon ? "text-pink-400" : "text-cyan-400"}`} />
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
              {lexicon.category && (
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded border truncate max-w-[130px] ${
                    isLexicon
                      ? "text-pink-300 bg-pink-950/60 border-pink-500/40"
                      : "text-cyan-300 bg-cyan-950/60 border-cyan-500/30"
                  }`}
                >
                  {lexicon.category}
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

          {/* Lexicon Details: Investopedia definition + Panel Profits translation (GUARANTEED NEVER BLANK) */}
          <div
            className={`mt-2 space-y-1.5 rounded p-2.5 border text-[11px] leading-relaxed ${
              isLexicon
                ? "bg-[#140813] border-pink-900/60"
                : "bg-slate-900/90 border-slate-800"
            }`}
          >
            <div>
              <span
                className={`text-[9px] font-mono uppercase tracking-wider font-semibold block mb-0.5 ${
                  isLexicon ? "text-pink-400" : "text-cyan-400"
                }`}
              >
                Comic Market Meaning:
              </span>
              <p className="text-slate-200 line-clamp-3">
                {lexicon.translation}
              </p>
            </div>
            <div className={`pt-1.5 border-t ${isLexicon ? "border-pink-900/40" : "border-slate-800/80"}`}>
              <span
                className={`text-[9px] font-mono uppercase tracking-wider block mb-0.5 ${
                  isLexicon ? "text-pink-300 font-medium" : "text-slate-400"
                }`}
              >
                Investopedia Financial Principle:
              </span>
              <p className="text-slate-300 line-clamp-2">
                {lexicon.definition}
              </p>
            </div>
          </div>

          {/* Actions & Deep Links */}
          <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[10px] font-mono">
            <Link
              href={entity.wikiPath}
              className={`flex items-center gap-1 transition-colors ${
                isLexicon
                  ? "text-pink-400 hover:text-pink-300"
                  : "text-cyan-400 hover:text-cyan-300"
              }`}
            >
              {isLexicon ? "Inspect in Lexicon" : "Open Dossier"} <ArrowUpRight className="h-3 w-3" />
            </Link>

            <a
              href={lexicon.investopediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-400 hover:text-pink-200 flex items-center gap-1 transition-colors font-medium"
            >
              Investopedia <ExternalLink className="h-3 w-3" />
            </a>

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
