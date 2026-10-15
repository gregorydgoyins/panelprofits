"use client";
import { useEffect, useState } from "react";
import type { ListingWriteup } from "@/lib/sniper/listing-writeup";
import { SniperResearchBrief } from "./SniperResearchBrief";

type Props = {
  listingTitle: string; series: string; issueNumber: string; year?: number; publisher?: string;
  grader?: string; grade?: number; editionVerified: boolean;
};

/** Researched write-up for this exact listing (story synopsis + the collector case for this edition). Falls back to the wiki brief. */
function Refs({ refs, sources }: { refs?: number[]; sources: ListingWriteup["sources"] }) {
  return <>{(refs ?? []).map((n) => sources[n] ? <a key={n} href={sources[n].uri} target="_blank" rel="noopener noreferrer" title={sources[n].title} className="ml-1 align-super text-[10px] text-cyan-300 hover:underline">[{n + 1}]</a> : null)}</>;
}

export function SniperListingResearch(p: Props) {
  const [writeup, setWriteup] = useState<ListingWriteup | null | undefined>(undefined);
  const [showBrief, setShowBrief] = useState(false);
  useEffect(() => {
    let live = true, timer: ReturnType<typeof setTimeout> | undefined, tries = 0;
    setWriteup(undefined); setShowBrief(false);
    const q = new URLSearchParams({ title: p.listingTitle, series: p.series, issue: p.issueNumber });
    if (p.year) q.set("year", String(p.year));
    if (p.publisher) q.set("publisher", p.publisher);
    if (p.grader) q.set("grader", p.grader);
    const load = () => fetch(`/api/sniper/listing-writeup?${q}`).then(r => r.ok ? r.json() : Promise.reject()).then(j => {
      if (!live) return;
      if (j.state === "pending" && ++tries < 14) { timer = setTimeout(load, 5000); return; } // saved write-up not ready yet: it is being written, ask again
      setWriteup(j.writeup ?? null);
    }).catch(() => { if (live) setWriteup(null); });
    load();
    return () => { live = false; if (timer) clearTimeout(timer); };
  }, [p.listingTitle, p.series, p.issueNumber, p.year, p.publisher, p.grader]);

  const brief = <SniperResearchBrief series={p.series} issueNumber={p.issueNumber} year={p.year} publisher={p.publisher} editionVerified={p.editionVerified} listingTitle={p.listingTitle} grader={p.grader} grade={p.grade} />;
  if (writeup === null) return brief;
  if (writeup === undefined) return <p className="text-xs text-cyan-300 animate-pulse" role="status">Researching this exact edition…</p>;
  return <section className="space-y-5 text-sm text-slate-300 leading-6">
    <div><h3 className="text-lg font-semibold text-white">Story synopsis: {writeup.edition}</h3><p className="text-xs text-slate-500 mt-1">Written for this listing from web sources · check the sources below</p></div>
    <div className="space-y-2"><p>{writeup.synopsis.intro}</p><ul className="space-y-2 list-disc pl-5">{writeup.synopsis.points.map((pt, i) => <li key={i}><strong className="text-white">{pt.label}:</strong> {pt.text}<Refs refs={pt.refs} sources={writeup.sources} /></li>)}</ul></div>
    <div className="space-y-2 pt-4 border-t border-slate-800"><h4 className="font-semibold text-emerald-300">{writeup.investment.heading}</h4><ul className="space-y-2 list-disc pl-5">{writeup.investment.points.map((pt, i) => <li key={i}><strong className="text-white">{pt.label}:</strong> {pt.text}<Refs refs={pt.refs} sources={writeup.sources} /></li>)}</ul></div>
    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400"><span>Sources:</span>{writeup.sources.map((s, i) => <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline underline-offset-4">[{i + 1}] {s.title} ↗</a>)}</div>
    <details onToggle={e => setShowBrief(e.currentTarget.open)} className="border-t border-slate-800 pt-3"><summary className="cursor-pointer text-xs font-semibold text-amber-300">Wiki story &amp; investor lessons</summary>{showBrief && <div className="mt-4">{brief}</div>}</details>
  </section>;
}
