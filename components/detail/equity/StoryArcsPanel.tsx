import React from 'react';
import { GitBranch, Bookmark, Award, Shield, Tag } from 'lucide-react';

interface StoryArcItem {
  arcId: string;
  name: string;
  publisher: string;
  era: string;
  arcType: string;
  significanceWeight: number;
  notes: string | null;
  partNumber: number;
  isFirst: boolean;
  isFinal: boolean;
  primaryFlag: boolean;
  narrativeWeight: number;
  arcEpistemicClass?: string;
  weightModelVersion?: string;
  arcSourceCitation?: string;
  membershipEpistemicClass?: string;
  weightEpistemicClass?: string;
  sourceCitation?: string;
}

interface StoryArcsPanelProps {
  storyArcs: {
    totalArcs: number;
    arcs: StoryArcItem[];
  };
  eraColors: {
    border: string;
    bg: string;
    text?: string;
  };
}

export default function StoryArcsPanel({ storyArcs, eraColors }: StoryArcsPanelProps) {
  if (!storyArcs || !storyArcs.arcs || storyArcs.arcs.length === 0) return null;

  return (
    <div
      className="rounded-lg border bg-zinc-950/80 p-5 backdrop-blur-md transition-all duration-300"
      style={{ borderColor: eraColors.border ? `${eraColors.border}40` : '#3f3f46' }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <GitBranch className="h-5 w-5 text-indigo-400" />
          <h3 className="font-mono text-sm font-semibold tracking-wider text-zinc-100 uppercase">
            Continuity Canon & Narrative Sagas
          </h3>
          <span className="rounded bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 font-mono text-xs text-indigo-300">
            {storyArcs.totalArcs} {storyArcs.totalArcs === 1 ? 'Saga' : 'Sagas'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded bg-zinc-800/80 border border-zinc-700/60 px-2 py-0.5 font-mono text-[10px] text-zinc-300">
            Bibliographic Canon: GCD
          </span>
          <span className="text-[11px] font-mono text-zinc-400">
            Canonical Continuity Graph
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3">
        {storyArcs.arcs.map((arc) => {
          const weightPct = Math.round(arc.significanceWeight * 100);
          return (
            <div
              key={arc.arcId}
              className="rounded-md border border-zinc-800/80 bg-zinc-900/50 p-3.5 transition-colors hover:border-zinc-700"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Bookmark className="h-4 w-4 text-amber-400/90" />
                  <span className="font-semibold text-zinc-100 text-sm">{arc.name}</span>
                  {arc.primaryFlag && (
                    <span className="rounded bg-emerald-950/70 border border-emerald-800/70 px-1.5 py-0.2 font-mono text-[10px] text-emerald-300">
                      PRIMARY SAGA
                    </span>
                  )}
                  {arc.isFirst && (
                    <span className="rounded bg-amber-950/70 border border-amber-800/70 px-1.5 py-0.2 font-mono text-[10px] text-amber-300">
                      SAGA OPENER
                    </span>
                  )}
                  {arc.isFinal && (
                    <span className="rounded bg-purple-950/70 border border-purple-800/70 px-1.5 py-0.2 font-mono text-[10px] text-purple-300">
                      CLIMAX / FINALE
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-300 border border-zinc-700/50">
                    Part {arc.partNumber} [Bibliographic Fact]
                  </span>
                  <span 
                    className="rounded bg-indigo-950/80 border border-indigo-700/60 px-2 py-0.5 text-indigo-300 font-semibold"
                    title={`Heuristic parameter: ${arc.weightModelVersion || 'PP_CURATED_HEURISTIC_V1'}`}
                  >
                    Weight: {weightPct}% [Model Inferred]
                  </span>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-zinc-500" />
                  {arc.publisher}
                </span>
                <span>•</span>
                <span>{arc.era}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Tag className="h-3 w-3 text-zinc-500" />
                  {arc.arcType}
                </span>
                <span>•</span>
                <span className="text-[10px] text-zinc-500">
                  Citation: {arc.sourceCitation || arc.arcSourceCitation || 'Grand Comics Database (GCD)'}
                </span>
              </div>

              {arc.notes && (
                <p className="mt-2 text-xs leading-relaxed text-zinc-300/90 border-t border-zinc-800/60 pt-2">
                  {arc.notes}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
