import React, { useState } from 'react';
import Link from 'next/link';
import {
  X,
  Award,
  BookOpen,
  Scale,
  ShieldCheck,
  Sun,
  Layers,
  ExternalLink,
  CheckCircle2,
  Lock,
  Flame,
  Activity,
  Sparkles,
} from 'lucide-react';

export interface BarometerConstituent {
  seatNumber: number;
  age: string;
  isVacant: boolean;
  isSun?: boolean;
  qualityScores?: Record<string, number>;
  adjudicationEssay?: string;
  seriesTitle?: string;
  issueNumber?: string | number;
  [key: string]: any;
}

interface ConstituentDossierModalProps {
  constituent: BarometerConstituent | null;
  onClose: () => void;
}

export const GREGORY_20_RULER = [
  { id: 1, name: 'Authorial Presence', category: 'Aesthetic / Authorship', key: 'authorial_presence', desc: 'The unmistakable hand or mind of the maker felt in the structure and execution of the work.' },
  { id: 2, name: 'Artistic Merit', category: 'Aesthetic / Authorship', key: 'artistic_merit', desc: 'Virtuosity of draftsmanship, compositional mastery, color architecture, and aesthetic altitude.' },
  { id: 3, name: 'Cultural Gravity', category: 'Historical / Resonance', key: 'cultural_gravity', desc: 'Mass, momentum, and historical weight exerted across broader civilization beyond fandom.' },
  { id: 4, name: 'Technical Mastery', category: 'Formal / Sequential', key: 'technical_mastery', desc: 'Sequential mechanics, page flow, panel transitions, lettering, and structural execution.' },
  { id: 5, name: 'Narrative Power', category: 'Formal / Sequential', key: 'narrative_power', desc: 'Emotional, thematic, and dramatic storytelling resonance that alters the consciousness of the reader.' },
  { id: 6, name: 'Symbolic Density', category: 'Thematic / Mythic', key: 'symbolic_density', desc: 'Layered subtext, metaphoric depth, polyphony, and semiotic richness open to ongoing interpretation.' },
  { id: 7, name: 'Historical Significance', category: 'Historical / Resonance', key: 'historical_significance', desc: 'Epochal ruptures, medium revolutions, genre births, and documented turning points.' },
  { id: 8, name: 'Irreplaceability / Rarity', category: 'Curatorial / Forensic', key: 'rarity_irreplaceability', desc: 'If deleted from human memory, nothing in existence could serve as an adequate substitute.' },
];

export default function ConstituentDossierModal({ constituent, onClose }: ConstituentDossierModalProps) {
  const [activeTab, setActiveTab] = useState<'essay' | 'matrix' | 'metrics'>('essay');

  if (!constituent) return null;

  const isVacant = constituent.isVacant;
  const scores = constituent.qualityScores || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-white/10 bg-[#090d16] shadow-2xl overflow-hidden font-sans">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-white/[0.08] bg-[#070b14]">
          <div className="space-y-1.5 pr-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-bold tracking-widest px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                CE70 Seat #{constituent.seatNumber}
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/10">
                {constituent.age} Age
              </span>
              {constituent.isSun && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-amber-500/30 text-amber-300 border border-amber-500/50">
                  <Sun size={11} className="text-amber-400" />
                  <span>Sun of the Era</span>
                </span>
              )}
              {constituent.gregoryScore != null && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                  Investment Grade Score: {constituent.gregoryScore}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold font-sans text-white tracking-tight">
              {constituent.seriesTitle} #{constituent.issueNumber} ({constituent.publicationYear})
            </h2>

            {constituent.creators && (
              <p className="text-xs text-slate-400 font-mono">
                Primary Creators: <span className="text-slate-200">{constituent.creators}</span> &bull; Publisher: <span className="text-slate-200">{constituent.publisher}</span>
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-400 hover:text-white transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2.5 border-b border-white/[0.06] bg-black/40 text-xs font-mono">
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
            <span>Investment Grade Ruler (1.0–10.0)</span>
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

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: ESSAY */}
          {activeTab === 'essay' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-emerald-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                    Authoritative Connoisseur Dossier
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  Zero Bold / Zero Italic inside Prose Standard
                </span>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-300 font-sans leading-relaxed text-justify bg-black/20 p-5 rounded-xl border border-white/[0.04]">
                {constituent.adjudicationEssay ? (
                  constituent.adjudicationEssay.split('\n\n').map((para: string, i: number) => (
                    <p key={i} className="leading-relaxed">
                      {para}
                    </p>
                  ))
                ) : (
                  <p className="italic text-slate-500 font-mono text-xs">
                    {constituent.justification}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: GREGORY QUALITY MATRIX */}
          {activeTab === 'matrix' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold">
                  Investment Grade 20-Metric Connoisseur Evaluation Matrix
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Calibrated 1.0 to 10.0 Anchor Scale
                </span>
              </div>

              {isVacant ? (
                <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
                  <Lock size={24} className="mx-auto text-slate-500" />
                  <div className="text-sm font-bold font-mono text-slate-300">Constitutional Vacancy</div>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Investment Grade ruler metrics remain unallocated pending formal committee certification and physical evidence verification.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {GREGORY_20_RULER.map((q) => {
                    const score = (scores && scores[q.key]) ?? (constituent.gregoryScore ? Math.min(10.0, constituent.gregoryScore / 20.0) : 9.8);
                    const pct = Math.min(100, Math.max(0, (score / 10.0) * 100));

                    return (
                      <div
                        key={q.id}
                        className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2 hover:border-amber-500/30 transition-colors"
                      >
                        <div className="flex items-center justify-between font-mono text-xs">
                          <span className="font-bold text-slate-200">{q.id}. {q.name}</span>
                          <span className="font-bold text-amber-400 text-sm">{Number(score).toFixed(1)} / 10.0</span>
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
              )}
            </div>
          )}

          {/* TAB 3: COMPLETE METRICS */}
          {activeTab === 'metrics' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-200 font-bold">
                  Constitutional Identity & Temporal Coordinates
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Panel Profits Epistemic Grounding
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                  <div className="text-slate-500 uppercase text-[10px]">Canonical Issue ID</div>
                  <div className="text-amber-300 font-bold">{constituent.canonicalIssueId}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                  <div className="text-slate-500 uppercase text-[10px]">Origin Era vs Production Age</div>
                  <div className="text-slate-200 font-bold">
                    Origin: {constituent.originEra || constituent.age} &bull; Prod: {constituent.productionAge || constituent.age}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                  <div className="text-slate-500 uppercase text-[10px]">Constitutional Status</div>
                  <div className="text-emerald-400 font-bold uppercase">{constituent.status}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                  <div className="text-slate-500 uppercase text-[10px]">Benchmark Membership</div>
                  <div className="text-slate-200 font-bold uppercase">{constituent.benchmarkMembershipStatus}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                  <div className="text-slate-500 uppercase text-[10px]">Market Price Input</div>
                  <div className="text-amber-400 font-bold">{constituent.priceFormatted ?? 'DATA_INCOMPLETE'}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                  <div className="text-slate-500 uppercase text-[10px]">Reference Grade Perimeter</div>
                  <div className="text-slate-200 font-bold">&ge; 8.5 Universal / White Pages (&le; $65,000)</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/30 border border-white/[0.06] space-y-1.5">
                <div className="text-[10px] font-mono uppercase text-amber-400 font-bold">Historical Justification</div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {constituent.justification}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-t border-white/[0.08] bg-[#070b14]">
          <div className="text-[11px] font-mono text-slate-400">
            Constitutional Seat #{constituent.seatNumber} of 70
          </div>

          <div className="flex items-center gap-3">
            {!isVacant && constituent.canonicalIssueId && (
              <Link href={'/issue/' + encodeURIComponent(constituent.canonicalIssueId)}>
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-lg shadow-amber-500/20 cursor-pointer">
                  <span>Open Sovereign Detail Page</span>
                  <ExternalLink size={13} />
                </button>
              </Link>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Close Dossier
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
