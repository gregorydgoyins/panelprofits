'use client';
import React, { useState } from 'react';
import { BookOpen, Layers, User, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface CreatorCredit {
  name: string;
  role: string;
  isUncertain?: boolean;
}

interface ContentUnit {
  sequenceNumber: number;
  unitType: string;
  title: string;
  feature: string;
  pageCount: number | null;
  genre: string;
  synopsis: string;
  credits: CreatorCredit[];
}

interface BibliographicCanonData {
  sourceSystem: string;
  totalUnits: number;
  units: ContentUnit[];
}

interface BibliographicCanonPanelProps {
  canon: BibliographicCanonData;
  eraColors: {
    border: string;
    bg: string;
    text?: string;
  };
}

export default function BibliographicCanonPanel({
  canon,
  eraColors,
}: BibliographicCanonPanelProps) {
  const [expandedUnit, setExpandedUnit] = useState<number | null>(1);

  if (!canon || !canon.units || canon.units.length === 0) return null;

  return (
    <div
      className="rounded-lg border bg-zinc-950/80 p-5 backdrop-blur-md transition-all duration-300"
      style={{ borderColor: eraColors.border ? `${eraColors.border}40` : '#3f3f46' }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <BookOpen className="h-5 w-5 text-amber-400" />
          <h3 className="font-mono text-sm font-semibold tracking-wider text-zinc-100 uppercase">
            Bibliographic Canon & Story Deconstruction
          </h3>
          <span className="rounded bg-zinc-800/80 px-2 py-0.5 font-mono text-xs text-zinc-300">
            {canon.sourceSystem}
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
          <Layers className="h-4 w-4 text-zinc-500" />
          <span>{canon.totalUnits} Content Units Indexed</span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {canon.units.map((unit) => {
          const isExpanded = expandedUnit === unit.sequenceNumber;
          return (
            <div
              key={unit.sequenceNumber}
              className="rounded-md border border-zinc-800/80 bg-zinc-900/50 p-3.5 transition-colors hover:border-zinc-700"
            >
              <div
                className="flex cursor-pointer items-center justify-between gap-3"
                onClick={() => setExpandedUnit(isExpanded ? null : unit.sequenceNumber)}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-zinc-800 font-mono text-xs font-semibold text-zinc-300">
                    #{unit.sequenceNumber}
                  </span>
                  <span className="rounded bg-amber-500/10 px-2 py-0.5 font-mono text-[11px] font-medium text-amber-400 uppercase">
                    {unit.unitType}
                  </span>
                  <span className="font-medium text-zinc-200">
                    {unit.title || unit.feature || `Sequence #${unit.sequenceNumber}`}
                  </span>
                  {unit.pageCount && (
                    <span className="font-mono text-xs text-zinc-500">
                      ({unit.pageCount} {unit.pageCount === 1 ? 'page' : 'pages'})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {unit.credits && unit.credits.length > 0 && (
                    <span className="hidden font-mono text-xs text-zinc-400 sm:inline-flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-zinc-500" />
                      {unit.credits.length} {unit.credits.length === 1 ? 'credit' : 'credits'}
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-zinc-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-zinc-400" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="mt-3.5 space-y-3 border-t border-zinc-800/60 pt-3 text-xs">
                  {unit.feature && (
                    <div className="flex items-center gap-2 text-zinc-300">
                      <span className="font-mono text-zinc-500 uppercase">Feature:</span>
                      <span>{unit.feature}</span>
                    </div>
                  )}

                  {unit.genre && (
                    <div className="flex items-center gap-2 text-zinc-300">
                      <span className="font-mono text-zinc-500 uppercase">Genre:</span>
                      <span className="capitalize">{unit.genre}</span>
                    </div>
                  )}

                  {unit.synopsis && (
                    <div className="rounded bg-zinc-950/60 p-2.5 text-zinc-300 leading-relaxed">
                      <div className="mb-1 font-mono text-[10px] text-zinc-500 uppercase">Synopsis</div>
                      <p>{unit.synopsis}</p>
                    </div>
                  )}

                  {unit.credits && unit.credits.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="font-mono text-[11px] text-zinc-400 uppercase flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3 text-amber-400" />
                        Role-Scoped Attributions
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {unit.credits.map((c, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between rounded bg-zinc-800/40 px-2.5 py-1.5 border border-zinc-700/40"
                          >
                            <span className="font-medium text-zinc-200">{c.name}</span>
                            <span className="font-mono text-[10px] text-zinc-400 uppercase">
                              {c.role} {c.isUncertain && '?'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
