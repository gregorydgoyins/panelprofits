"use client";

import * as React from "react";
import Link from "next/link";
import { getSourceTicker } from "@/lib/news/sourceTickerMap";
import { shortNewsSource, type NewsStory } from "@/lib/news/types";

const SOURCE_COLORS: Record<string, string> = {
  CBR: "#06B6D4",
  "BLEEDING COOL": "#38BDF8",
  "THE BEAT": "#818CF8",
  AIPT: "#34D399",
  ICV2: "#60A5FA",
  GAMESRADAR: "#A78BFA",
  COMICBOOK: "#38BDF8",
  SCREENRANT: "#F43F5E",
  THR: "#FB7185",
  DEADLINE: "#94A3B8",
  VARIETY: "#64748B",
  "COMICS JOURNAL": "#94A3B8",
  "COMICSXF": "#2DD4BF",
  "COMICBOOK INVEST": "#38BDF8",
};

function getSourceAccent(source: string): string {
  const norm = source.toUpperCase().trim();
  if (SOURCE_COLORS[norm]) return SOURCE_COLORS[norm];
  for (const [key, color] of Object.entries(SOURCE_COLORS)) {
    if (norm.includes(key)) return color;
  }
  return "#06B6D4";
}

function extractStoryPrimaryTicker(headline: string): string | null {
  const lower = headline.toLowerCase();
  if (lower.includes("spider-man") || lower.includes("spiderman") || lower.includes("peter parker")) return "SPDR";
  if (lower.includes("doctor doom") || lower.includes("dr. doom") || lower.includes("latveria")) return "DOOM";
  if (lower.includes("batman") || lower.includes("dark knight") || lower.includes("bruce wayne")) return "BAT";
  if (lower.includes("superman") || lower.includes("clark kent") || lower.includes("man of steel")) return "SUPR";
  if (lower.includes("wolverine") || lower.includes("logan") || lower.includes("weapon x")) return "WOLV";
  if (lower.includes("x-men") || lower.includes("mutant") || lower.includes("cyclops") || lower.includes("magneto")) return "XMEN";
  if (lower.includes("fantastic four") || lower.includes("reed richards") || lower.includes("sue storm")) return "FF4";
  if (lower.includes("thunderbolts") || lower.includes("yelena")) return "THUN";
  if (lower.includes("punisher") || lower.includes("frank castle")) return "PNSH";
  if (lower.includes("avengers") || lower.includes("secret wars") || lower.includes("doomsday")) return "AVNG";
  if (lower.includes("disney") || lower.includes("mcu") || lower.includes("marvel studios")) return "DIS";
  if (lower.includes("warner") || lower.includes("wbd") || lower.includes("dc studios") || lower.includes("dcu")) return "WBD";
  if (lower.includes("sony")) return "SONY";
  if (lower.includes("paramount") || lower.includes("tmnt")) return "PARA";
  return null;
}

interface TopTickerProps {
  stories: NewsStory[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function TopTicker({ stories, activeId, onSelect }: TopTickerProps) {
  return (
    <section className="flex items-center gap-3 border-y border-slate-800/80 bg-[#07090F] px-3 py-2 overflow-hidden shadow-inner">
      <div className="shrink-0 flex items-center gap-2 border-r border-slate-800 pr-3">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400 font-semibold flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          WIRE TICKER
        </span>
        <Link
          href="/lexicon#ticker-legend"
          className="text-[9px] font-mono uppercase tracking-wider text-cyan-400 hover:text-cyan-200 border border-cyan-500/40 bg-cyan-950/60 px-1.5 py-0.5 rounded transition-colors"
        >
          LEGEND
        </Link>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto py-0.5 no-scrollbar scroll-smooth">
        {stories.slice(0, 30).map((story) => {
          const isActive = story.id === activeId;
          const accent = getSourceAccent(story.source);
          const corpTicker = getSourceTicker(story.source) || extractStoryPrimaryTicker(story.headline);

          return (
            <button
              key={story.id}
              onClick={() => onSelect(story.id)}
              className={`group flex shrink-0 items-center gap-2 border px-2.5 py-1 text-left transition-all rounded ${
                isActive
                  ? "border-cyan-400/90 bg-[#0F172A] shadow-[0_0_16px_rgba(6,182,212,0.25)]"
                  : "border-slate-800/80 bg-[#0B0E17] hover:border-slate-700 hover:bg-[#101420]"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
              <span className="max-w-[240px] truncate text-xs text-slate-200 group-hover:text-cyan-100 font-medium">
                {story.headline}
              </span>
              {corpTicker ? (
                <span className="text-[9px] font-mono font-semibold tracking-wider shrink-0" style={{ color: accent }}>
                  ${corpTicker}
                </span>
              ) : (
                <span className="text-[9px] font-mono opacity-60 uppercase tracking-wider shrink-0 text-slate-400">
                  {shortNewsSource(story.source)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
