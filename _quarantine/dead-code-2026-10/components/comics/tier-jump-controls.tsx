"use client";

import React from "react";

export function TierJumpControls() {
  const jumpTo = (id: string, inline: ScrollLogicalPosition) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline });
  };

  return (
    <div className="flex items-center gap-1.5 text-[10px] font-mono">
      <span className="text-slate-500 uppercase tracking-wider mr-1 hidden sm:inline">Jump Tier:</span>
      <button
        type="button"
        onClick={() => jumpTo("grade-col-raw", "start")}
        className="px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/40 text-amber-300 hover:bg-amber-900/50 transition-colors"
      >
        RAW
      </button>
      <button
        type="button"
        onClick={() => jumpTo("grade-col-0-5", "center")}
        className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors"
      >
        0.5 – 3.5
      </button>
      <button
        type="button"
        onClick={() => jumpTo("grade-col-4-0", "center")}
        className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors"
      >
        4.0 – 7.5
      </button>
      <button
        type="button"
        onClick={() => jumpTo("grade-col-8-0", "center")}
        className="px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/50 transition-colors"
      >
        8.0 – 9.8
      </button>
      <button
        type="button"
        onClick={() => jumpTo("grade-col-10-0", "end")}
        className="px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50 transition-colors"
      >
        9.9 – 10.0
      </button>
    </div>
  );
}
