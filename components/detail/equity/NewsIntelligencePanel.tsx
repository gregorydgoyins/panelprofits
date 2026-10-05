import React from 'react';
import { Newspaper, ExternalLink, Activity, AlertCircle, Compass, HelpCircle } from 'lucide-react';

interface NewsEvent {
  id: string;
  headline: string;
  category: string;
  sourceName: string;
  publishedAt: string;
  summary: string;
  relevanceScore: number;
  relevanceScoreMethod?: string;
  eventEpistemicClass?: string;
  sourceUrl: string | null;
  attachmentRole: string | null;
  attachmentConfidence?: number | null;
  resolutionMethod?: string | null;
  possibleConsequence: string | null;
  attachmentEpistemicClass?: string;
}

interface NewsIntelligencePanelProps {
  intelligence: {
    totalEvents: number;
    scope: 'ENTITY_ATTACHED' | 'MARKET_OVERVIEW';
    events: NewsEvent[];
  };
  eraColors: {
    border: string;
    bg: string;
    text?: string;
  };
}

export default function NewsIntelligencePanel({ intelligence, eraColors }: NewsIntelligencePanelProps) {
  if (!intelligence || !intelligence.events || intelligence.events.length === 0) return null;

  return (
    <div
      className="rounded-lg border bg-zinc-950/80 p-5 backdrop-blur-md transition-all duration-300"
      style={{ borderColor: eraColors.border ? `${eraColors.border}40` : '#3f3f46' }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <Newspaper className="h-5 w-5 text-sky-400" />
          <h3 className="font-mono text-sm font-semibold tracking-wider text-zinc-100 uppercase">
            Market Intelligence & Catalyst Feed
          </h3>
          <span className="rounded bg-sky-950/60 border border-sky-800/60 px-2 py-0.5 font-mono text-xs text-sky-300">
            {intelligence.scope === 'ENTITY_ATTACHED' ? 'CANDIDATE MENTIONS' : 'MARKET OVERVIEW'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
          <Activity className="h-3.5 w-3.5 text-emerald-400" />
          <span>Factual Articles + Model-Inferred Hypotheses</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3">
        {intelligence.events.map((event) => {
          const relevancePct = Math.round(event.relevanceScore * 100);
          const publishedDate = new Date(event.publishedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });

          return (
            <div
              key={event.id}
              className="rounded-md border border-zinc-800/80 bg-zinc-900/50 p-3.5 transition-colors hover:border-zinc-700"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex-1 min-w-[240px]">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="rounded bg-zinc-800/90 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300 uppercase">
                      {event.category.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      {event.sourceName} • {publishedDate}
                    </span>
                    {event.attachmentRole && (
                      <span className="rounded bg-indigo-950/70 border border-indigo-800/60 px-1.5 py-0.5 font-mono text-[10px] text-indigo-300">
                        {event.attachmentRole.replace(/_/g, ' ')} ({Math.round((event.attachmentConfidence || 0.65) * 100)}% Model Conf)
                      </span>
                    )}
                  </div>
                  <h4 className="font-medium text-zinc-100 text-sm leading-snug">
                    {event.headline}
                  </h4>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs shrink-0">
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-sky-300" title="Heuristic Model-Inferred Relevance (Not measured provider metric)">
                    Heuristic Relevance: {relevancePct}%
                  </span>
                  {event.sourceUrl && (
                    <a
                      href={event.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded bg-zinc-800 px-2 py-0.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-colors"
                      title="Open source article"
                    >
                      <span>Source</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              {event.summary && (
                <p className="mt-2 text-xs leading-relaxed text-zinc-400 line-clamp-2">
                  {event.summary}
                </p>
              )}

              {event.possibleConsequence && (
                <div className="mt-2.5 flex items-start gap-2 rounded bg-amber-950/20 border border-amber-900/30 p-2 text-xs text-amber-200/90">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-amber-300 mr-1">[Model Hypothesis]:</span>
                    <span>{event.possibleConsequence.replace(/^\[MODEL_HYPOTHESIS\]\s*/, '')}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
