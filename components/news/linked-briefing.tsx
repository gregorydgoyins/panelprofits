"use client";

import * as React from "react";
import Link from "next/link";
import type { EntityWikiDef } from "@/lib/news/entities";
import { EntityHoverCard } from "@/components/news/EntityHoverCard";

/**
 * Tokenizes article text and headlines, dynamically replacing recognized
 * characters, creators, actors, directors, and studio entities with live clickable badges.
 */
export function parseTextWithEntities(text: string, entities?: EntityWikiDef[]): React.ReactNode[] {
  if (!text) return [];
  // Strip any legacy raw HTML markup so we parse pure text cleanly
  const cleanText = text.replace(/<[^>]+>/g, "");

  if (!entities || entities.length === 0) {
    return [cleanText];
  }

  // Sort entities by term length descending so longer phrases match first (e.g. "Bruce Wayne" before "Bruce")
  const sorted = [...entities].sort((a, b) => b.term.length - a.term.length);
  const escapedTerms = sorted.map((e) => e.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  
  if (escapedTerms.length === 0) {
    return [cleanText];
  }

  const pattern = new RegExp(`\\b(${escapedTerms.join("|")})\\b`, "gi");
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(cleanText)) !== null) {
    const start = match.index;
    const matchedTerm = match[0];

    if (start > lastIndex) {
      nodes.push(cleanText.slice(lastIndex, start));
    }

    const entity = sorted.find((e) => e.term.toLowerCase() === matchedTerm.toLowerCase());
    if (entity) {
      const isCharacter = entity.type === "character";
      const isCreatorOrTalent = entity.type === "creator";
      const isStudio = entity.type === "publisher";

      nodes.push(
        <EntityHoverCard
          key={`${start}-${matchedTerm}`}
          entity={entity}
          className={`inline-flex items-baseline font-medium rounded px-1.5 py-0.5 mx-0.5 transition-all text-xs sm:text-sm ${
            isCharacter
              ? "text-cyan-300 hover:text-cyan-100 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40"
              : isCreatorOrTalent
              ? "text-emerald-300 hover:text-emerald-100 bg-emerald-950/30 hover:bg-emerald-900/50 border border-emerald-500/40"
              : isStudio
              ? "text-indigo-300 hover:text-indigo-100 bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/40"
              : "text-sky-300 hover:text-sky-100 bg-sky-950/30 hover:bg-sky-900/50 border border-sky-500/40"
          }`}
        >
          <span>{matchedTerm}</span>
          {entity.ticker && (
            <span className="ml-1 text-[9px] font-mono opacity-80 uppercase tracking-tighter text-cyan-400">
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
