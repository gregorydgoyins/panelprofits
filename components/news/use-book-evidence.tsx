"use client";

import * as React from "react";
import type { BookEvidence } from "@/lib/news/market-evidence";

const CACHE = new Map<string, BookEvidence>();

/** Fetches real per-source evidence for the given book titles ("Series #N"). */
export function useBookEvidence(titles: string[]): Record<string, BookEvidence | undefined> {
  const sig = titles.join("|");
  const [state, setState] = React.useState<Record<string, BookEvidence | undefined>>(() => {
    const init: Record<string, BookEvidence | undefined> = {};
    for (const t of titles) init[t] = CACHE.get(t);
    return init;
  });

  React.useEffect(() => {
    const need = titles.filter((t) => !CACHE.has(t));
    if (titles.length === 0) return;
    if (need.length === 0) {
      setState(Object.fromEntries(titles.map((t) => [t, CACHE.get(t)])));
      return;
    }
    let cancelled = false;
    const qs = need.map((t) => `k=${encodeURIComponent(t)}`).join("&");
    fetch(`/api/news/evidence?${qs}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { evidence?: BookEvidence[] } | null) => {
        if (cancelled || !j?.evidence) return;
        for (const e of j.evidence) CACHE.set(e.key, e);
        setState(Object.fromEntries(titles.map((t) => [t, CACHE.get(t)])));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);

  return state;
}

const usd = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

/** Per-source price line. Only sources that published a value are shown; nothing is blended. */
export function EvidenceStrip({ evidence }: { evidence: BookEvidence | undefined }) {
  if (!evidence) return <span className="font-mono text-[10px] text-slate-600">loading…</span>;
  if (!evidence.found) return <span className="font-mono text-[10px] text-slate-500">no price on file</span>;
  const parts: React.ReactNode[] = [];
  if (evidence.pp) parts.push(<span key="pp"><span className="text-slate-500">PP {evidence.pp.grade}</span> <span className="font-bold text-emerald-400">{usd(evidence.pp.usd)}</span></span>);
  const cb = evidence.comicbase;
  if (cb?.now) parts.push(<span key="cb"><span className="text-slate-500">CB</span> <span className="font-bold text-sky-300">{usd(cb.now)}</span></span>);
  if (cb?.yoy) parts.push(<span key="cby" className="text-slate-400">CB {cb.yoy.fromYear}→{cb.yoy.toYear} {cb.yoy.pct >= 0 ? "+" : ""}{cb.yoy.pct.toFixed(1)}%</span>);
  if (evidence.gocollect) {
    const g = evidence.gocollect["9.8"] ?? Object.values(evidence.gocollect)[0];
    parts.push(<span key="gc"><span className="text-slate-500">GC</span> <span className="font-bold text-violet-300">{usd(g)}</span></span>);
  }
  if (evidence.census) parts.push(<span key="cs" className="text-slate-400">CGC census {evidence.census.toLocaleString("en-US")}</span>);
  const np = evidence.newsPressure;
  if (np) parts.push(<span key="np" className="text-amber-300">News {np.last48h} in 48h vs {np.baselinePerDay.toFixed(1)}/day</span>);
  if (parts.length === 0) return <span className="font-mono text-[10px] text-slate-500">no price on file</span>;
  return (
    <span className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 font-mono text-[10px]">
      {parts.map((p, i) => <React.Fragment key={i}>{p}</React.Fragment>)}
    </span>
  );
}
