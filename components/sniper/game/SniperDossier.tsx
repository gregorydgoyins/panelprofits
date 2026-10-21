"use client";

import React from "react";
import { BookOpen, ShieldAlert, CheckSquare, FileText, Lock, ChevronDown, ChevronUp } from "lucide-react";
import type { GameRole, LotItem } from "@/lib/sniper/sim/types";

interface SniperDossierProps {
  role: GameRole;
  lot: LotItem;
}

export function SniperDossier({ role, lot }: SniperDossierProps) {
  const [expanded, setExpanded] = React.useState(false);
  const isBroker = role === "broker";

  if (!isBroker) {
    // Redacted Whale Dossier
    return (
      <div className="rounded-xl border border-amber-500/30 bg-[#070A11] p-5 shadow-xl">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <ShieldAlert className="h-5 w-5 text-amber-400" />
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
            Whale Intelligence Profile
          </h3>
          <span className="ml-auto rounded bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 text-[10px] font-mono text-amber-300">
            REDACTED
          </span>
        </div>

        <div className="mt-4 p-4 rounded-lg bg-black/40 border border-slate-800 text-xs font-mono text-slate-400 space-y-3">
          <p className="flex items-start gap-2">
            <Lock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-amber-200">Formula &amp; Spread Redaction:</strong> As a private high roller deploying personal wealth, pre-digested underwriting formulas and narrative summaries are withheld.
            </span>
          </p>
          <p className="text-slate-400">
            You must evaluate this <strong className="text-white">{lot.grader} {lot.grade}</strong> lot using your own market knowledge, verified past auction dates, and pricing discipline.
          </p>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Sales Volume Index:</span>
            <span className="text-amber-300 font-bold">{lot.salesVolume ? `${lot.salesVolume} trades/yr` : "Infrequent / High Scarcity"}</span>
          </div>
        </div>
      </div>
    );
  }

  // Deep Institutional Broker Dossier
  const ladder = lot.priceLadder;

  return (
    <div className="rounded-xl border border-cyan-500/30 bg-[#070A11] p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <FileText className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
            Institutional Research Dossier
          </h3>
        </div>
        <span className="rounded bg-cyan-950/80 border border-cyan-500/40 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
          FIDUCIARY CLEARANCE
        </span>
      </div>

      {/* Multi-Grade Price Ladder */}
      <div>
        <h4 className="text-[11px] font-mono uppercase text-slate-400 tracking-wider mb-2">
          Multi-Grade Sovereign Benchmark Ladder
        </h4>
        <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
          <div className="rounded border border-slate-800 bg-slate-900/50 p-2">
            <span className="text-[10px] text-slate-500 block">RAW</span>
            <span className="text-white font-bold">{ladder.raw ? `$${ladder.raw}` : "—"}</span>
          </div>
          <div className="rounded border border-slate-800 bg-slate-900/50 p-2">
            <span className="text-[10px] text-slate-500 block">4.0 / 6.0</span>
            <span className="text-white font-bold">
              {ladder.grade60 ? `$${ladder.grade60}` : ladder.grade40 ? `$${ladder.grade40}` : "—"}
            </span>
          </div>
          <div className="rounded border border-slate-800 bg-slate-900/50 p-2">
            <span className="text-[10px] text-slate-500 block">8.0 / 9.2</span>
            <span className="text-white font-bold">
              {ladder.grade92 ? `$${ladder.grade92}` : ladder.grade80 ? `$${ladder.grade80}` : "—"}
            </span>
          </div>
          <div className="rounded border border-cyan-500/40 bg-cyan-950/30 p-2">
            <span className="text-[10px] text-cyan-400 block">9.8 BENCH</span>
            <span className="text-cyan-200 font-bold">{ladder.grade98 ? `$${ladder.grade98}` : "—"}</span>
          </div>
        </div>

        {/* Spreads & Compression Ratios */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono">
          <div className="rounded bg-slate-900/30 border border-slate-800/80 p-2 flex justify-between">
            <span className="text-slate-400">Raw-to-9.8 Spread:</span>
            <span className="text-white font-bold">{lot.spreadRawTo98 ? `$${lot.spreadRawTo98}` : "N/A"}</span>
          </div>
          <div className="rounded bg-slate-900/30 border border-slate-800/80 p-2 flex justify-between">
            <span className="text-slate-400">9.6/9.8 Compression:</span>
            <span className="text-white font-bold">{lot.ratio96To98 ? `${lot.ratio96To98}x` : "N/A"}</span>
          </div>
        </div>
      </div>

      {/* Narrative Due Diligence Checklist */}
      <div className="rounded-lg bg-black/40 border border-slate-800 p-3 space-y-2 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-[11px] uppercase tracking-wider mb-1">
          <CheckSquare className="h-3.5 w-3.5 text-cyan-400" />
          <span>Fiduciary Due Diligence Checklist</span>
        </div>
        <div className="text-slate-300 text-[11px] space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>Verify Universal Blue Label optics (zero restoration/purple label).</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>Ensure entry bid is at least 15% below recorded Fair Market Value.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>Check secondary turnover: {lot.salesVolume ?? 20}+ recorded annual transactions.</span>
          </div>
        </div>
      </div>

      {/* Expandable Story Summary */}
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-xs font-mono text-cyan-300 hover:text-cyan-200 transition-colors py-1"
        >
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Narrative Continuity Summary</span>
          </span>
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {expanded && (
          <div className="mt-2 p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] font-sans text-slate-300 leading-relaxed max-h-48 overflow-y-auto">
            {lot.summary}
          </div>
        )}
      </div>
    </div>
  );
}
