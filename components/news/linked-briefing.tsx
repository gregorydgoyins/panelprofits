"use client";

import * as React from "react";
import Link from "next/link";
import type { EntityWikiDef } from "@/lib/news/entities";
import { EntityHoverCard } from "@/components/news/EntityHoverCard";

const BLOCKED_TERMS = new Set([
  "florida",
  "orlando",
  "orlando florida",
  "california",
  "texas",
  "america",
  "united states",
  "europe",
  "england",
  "london",
  "new york",
  "chicago",
  "dc",
  "state of florida",
  "kentucky",
  "dragons",
  "dragon",
  "rings",
  "scratch",
  "risk",
  "australia",
  "critic",
  "critics",
  "review",
  "reviews",
  "rating",
  "ratings",
  "score",
  "scores",
  "quote",
  "quotes",
  "fan",
  "fans",
  "viewer",
  "viewers",
]);

/**
 * Tokenizes article text and headlines, dynamically replacing recognized
 * characters, creators, actors, directors, and studio entities with live clickable badges.
 */
export function parseTextWithEntities(text: string, entities?: EntityWikiDef[]): React.ReactNode[] {
  if (!text) return [];
  // Strip any legacy raw HTML markup so we parse pure text cleanly
  const cleanText = text.replace(/<[^>]+>/g, "");

  // NOTE: market-concept / grading / lexicon entities (financial & grading glossary terms,
  // e.g. "Fair Market Value", "CGC", "Bid-Ask Spread") are intentionally included here.
  // They previously never rendered as links at all -- this is the root cause of the
  // "Investopedia glossary links never show up" bug. Do not re-add a type exclusion here
  // without wiring an equivalent real link target for that type.
  const activeEntities = (entities || []).filter(
    (e) => !BLOCKED_TERMS.has(e.term.toLowerCase())
  );

  if (activeEntities.length === 0) {
    return [cleanText];
  }

  // Sort entities by term length descending so longer phrases match first (e.g. "Bruce Wayne" before "Bruce")
  const sorted = [...activeEntities].sort((a, b) => b.term.length - a.term.length);
  const escapedTerms = sorted.map((e) => {
    const esc = e.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const startsWithWord = /^\w/.test(e.term);
    const endsWithWord = /\w$/.test(e.term);
    const prefix = startsWithWord ? "\\b" : "(?<=^|\\s|[^\\w])";
    const suffix = endsWithWord ? "\\b" : "(?=$|\\s|[^\\w])";
    return `${prefix}${esc}${suffix}`;
  });
  
  if (escapedTerms.length === 0) {
    return [cleanText];
  }

  const pattern = new RegExp(`(${escapedTerms.join("|")})`, "gi");
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(cleanText)) !== null) {
    const start = match.index;
    const matchedTerm = match[0];

    if (start > lastIndex) {
      nodes.push(cleanText.slice(lastIndex, start));
    }

    const entity = sorted.find((e) => {
      if (e.term.toLowerCase() !== matchedTerm.toLowerCase()) return false;
      if (/^[A-Z][a-z0-9]*$/.test(e.term)) {
        return /^[A-Z]/.test(matchedTerm);
      }
      return true;
    });
    if (entity) {
      const isCharacter = entity.type === "character";
      const isCreatorOrTalent = entity.type === "creator";
      const isStudio = entity.type === "publisher";
      const isEquity = entity.type === "equity";
      const isGlossaryTerm = entity.type === "market-concept" || entity.type === "grading" || entity.type === "lexicon";

      nodes.push(
        <EntityHoverCard
          key={`${start}-${matchedTerm}`}
          entity={entity}
          className={`inline-flex items-baseline font-medium rounded px-1.5 py-0.5 mx-0.5 transition-all text-xs sm:text-sm ${
            isEquity
              ? "text-amber-300 hover:text-amber-100 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 font-semibold shadow-sm"
              : isCharacter
              ? "text-cyan-300 hover:text-cyan-100 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40"
              : isCreatorOrTalent
              ? "text-emerald-300 hover:text-emerald-100 bg-emerald-950/30 hover:bg-emerald-900/50 border border-emerald-500/40"
              : isStudio
              ? "text-indigo-300 hover:text-indigo-100 bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/40"
              : isGlossaryTerm
              ? "text-violet-300 hover:text-violet-100 bg-violet-950/40 hover:bg-violet-900/60 border border-violet-500/40"
              : "text-sky-300 hover:text-sky-100 bg-sky-950/30 hover:bg-sky-900/50 border border-sky-500/40"
          }`}
        >
          <span>{matchedTerm}</span>
          {entity.ticker && !matchedTerm.startsWith("$") && matchedTerm !== entity.ticker && (
            <span
              className={`ml-1 text-[9px] font-mono opacity-90 uppercase tracking-tighter ${
                isEquity ? "text-amber-300 font-bold" : "text-cyan-400"
              }`}
            >
              {entity.ticker}
            </span>
          )}
        </EntityHoverCard>
      );
    } else {
      nodes.push(matchedTerm);
    }

    lastIndex = start + matchedTerm.length;
  }

  if (lastIndex < cleanText.length) {
    nodes.push(cleanText.slice(lastIndex));
  }

  return nodes;
}

export function LinkedBriefing({
  text,
  entities,
}: {
  text: string;
  entities?: EntityWikiDef[];
}) {
  return <span>{parseTextWithEntities(text, entities)}</span>;
}
