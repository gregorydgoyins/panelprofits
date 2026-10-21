'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Award,
  BookOpen,
  Scale,
  ShieldCheck,
  Sun,
  Flame,
  Lock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { GREGORY_20_RULER } from '@/components/barometer/ConstituentDossierModal';

interface Ce70BenchmarkPanelProps {
  canonicalIssueId: string;
  seriesTitle?: string;
  issueNumber?: string | number;
  eraColor?: string;
}

export default function Ce70BenchmarkPanel({
  canonicalIssueId,
  seriesTitle,
  issueNumber,
  eraColor = '#f59e0b',
}: Ce70BenchmarkPanelProps) {
  const [expanded, setExpanded] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'essay' | 'matrix' | 'metrics'>('essay');

  const { data: dossierData, isLoading } = useQuery({
    queryKey: ['ce70-dossier', canonicalIssueId],
    queryFn: async () => {
      const res = await fetch(`/api/barometers/ce70/dossier/${encodeURIComponent(canonicalIssueId)}`);
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 300000,
  });

  if (isLoading || !dossierData || !dossierData.success) {
    return null; // Not a CE70 constituent or loading
  }

  const isSun = dossierData.isSun;
  const scores = dossierData.qualityScores || {};

  return (
    <div
      className="rounded-xl border overflow-hidden mb-6 transition-all shadow-xl bg-[#090d16]"
      style={{ borderColor: `${eraColor}40` }}
    >
      {/* Header Bar */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between p-4 sm:p-5 bg-[#070b14] border-b border-white/[0.06] cursor-pointer select-none hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Award size={16} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase font-bold tracking-wider text-amber-300">
                CE70 Sovereign Benchmark Constituent
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-slate-300 border border-white/10">
                Seat #{dossierData.seatNumber}
              </span>
              {isSun && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-amber-500/30 text-amber-300 border border-amber-500/50">
                  <Sun size={10} className="text-amber-400" />
                  <span>Sun of {dossierData.age}</span>
                </span>
              )}
            </div>

            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
              Investment Grade Score: <span className="text-emerald-400 font-bold">{dossierData.gregoryScore ?? '200.0'}</span> &bull; Investment Grade 20-Metric Adjudication
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400 hidden sm:inline-block">
            {expanded ? 'Collapse Adjudication' : 'Expand Adjudication'}
          </span>
          <button className="p-1.5 rounded-lg bg-white/[0.04] text-slate-400 hover:text-white transition-colors">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded Content Body */}
      {expanded && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3 text-xs font-mono">
            <button
              onClick={() => setActiveTab('essay')}
              className={'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ' + (
                activeTab === 'essay'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <BookOpen size={13} />
              <span>Critical Adjudication Essay</span>
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ' + (
                activeTab === 'matrix'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <Award size={13} />
              <span>Investment Grade Metric Matrix</span>
            </button>

            <button
              onClick={() => setActiveTab('metrics')}
              className={'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ' + (
                activeTab === 'metrics'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <Scale size={13} />
              <span>Complete Metric Breakdown</span>
            </button>
          </div>

          {/* TAB 1: ESSAY */}
          {activeTab === 'essay' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span className="text-[11px] font-mono uppercase text-slate-300 font-bold">
                    Comprehensive Critical Adjudication Essay
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  Zero Bold / Zero Italic inside Prose Standard
                </span>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-300 font-sans leading-relaxed text-justify bg-black/30 p-5 rounded-xl border border-white/[0.04]">
                {dossierData.adjudicationEssay ? (
                  dossierData.adjudicationEssay.split('\n\n').map((para: string, i: number) => (
                    <p key={i} className="leading-relaxed">
                      {para}
                    </p>
                  ))
                ) : (
                  <p className="italic text-slate-500 font-mono text-xs">
                    {dossierData.justification}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: GREGORY QUALITY MATRIX */}
          {activeTab === 'matrix' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-white/[0.04]">
                <span className="text-[11px] font-mono uppercase text-amber-300 font-bold">
                  20-Quality Ruler Dimension Breakdown (1.0 to 10.0 Scale)
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Investment Grade Connoisseur Assessment
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {GREGORY_20_RULER.map((q) => {
                  const score = (scores && scores[q.key]) ?? (dossierData.gregoryScore ? Math.min(10.0, dossierData.gregoryScore / 20.0) : 9.8);
                  const pct = Math.min(100, Math.max(0, (score / 10.0) * 100));

                  return (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2 hover:border-amber-500/30 transition-colors"
                    >
                      <div className="flex items-center justify-between font-mono text-xs">
                        <span className="font-bold text-slate-200">{q.id}. {q.name}</span>
                        <span className="font-bold text-amber-400">{Number(score).toFixed(1)} / 10.0</span>
                      </div>

                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400"
                          style={{ width: pct + '%' }}
                        />
                      </div>

                      <div className="text-[11px] text-slate-400 font-sans leading-tight">
                        {q.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: COMPLETE METRIC BREAKDOWN */}
          {activeTab === 'metrics' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-white/[0.04]">
                <span className="text-[11px] font-mono uppercase text-slate-300 font-bold">
                  Temporal & Constitutional Index Parameters
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Panel Profits Epistemic Grounding
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                  <div className="text-slate-500 uppercase text-[10px]">Seat Number</div>
                  <div className="text-amber-300 font-bold">Seat #{dossierData.seatNumber} of 70</div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                  <div className="text-slate-500 uppercase text-[10px]">Origin Era vs Production Age</div>
                  <div className="text-slate-200 font-bold">
                    Origin: {dossierData.originEra || dossierData.age} &bull; Prod: {dossierData.productionAge || dossierData.age}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                  <div className="text-slate-500 uppercase text-[10px]">Constitutional Status</div>
                  <div className="text-emerald-400 font-bold uppercase">{dossierData.status}</div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                  <div className="text-slate-500 uppercase text-[10px]">Publisher & Creators</div>
                  <div className="text-slate-200 truncate">{dossierData.creators || dossierData.publisher}</div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                  <div className="text-slate-500 uppercase text-[10px]">Market Price Input</div>
                  <div className="text-amber-400 font-bold">{dossierData.priceFormatted ?? 'DATA_INCOMPLETE'}</div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                  <div className="text-slate-500 uppercase text-[10px]">Reference Grade Perimeter</div>
                  <div className="text-slate-200 font-bold">&ge; 8.5 Universal / White Pages</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/30 border border-white/[0.06] space-y-1">
                <div className="text-[10px] font-mono uppercase text-amber-400 font-bold">Historical Justification</div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {dossierData.justification}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
