"use client";
import { useEffect, useState } from "react";
import type { ResearchBrief } from "@/lib/sniper/research-brief";
import type { StorySummary } from "@/lib/comics/story-summary";
import { SniperStoryLore } from "./SniperStoryLore";
import { researchTitle } from "@/lib/sniper/research-title";

export function SniperResearchBrief({ series, issueNumber, year, publisher, editionVerified, listingTitle, grader, grade }: {
  series: string; issueNumber: string; year?: number; publisher?: string; editionVerified: boolean; listingTitle?: string; grader?: string; grade?: number;
}) {
  const [result, setResult] = useState<{ summary: StorySummary | null; brief: ResearchBrief | null; error?: string } | null>(null);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    let live = true;
    setResult(null); setExpanded(false);
    const q = new URLSearchParams({ series, issueNumber });
    if (year) q.set("year", String(year));
    if (publisher) q.set("publisher", publisher);
    if (listingTitle) q.set("listingTitle", listingTitle);
    if (grader) q.set("grader", grader);
    if (grade) q.set("grade", String(grade));
    if (!editionVerified) q.set("allowSeriesReference", "true");
    fetch(`/api/sniper/research-brief?${q}`).then(r => r.ok ? r.json() : Promise.reject()).then(j => { if (live) setResult(j); }).catch(() => { if (live) setResult({ summary: null, brief: null, error: "Issue research could not be loaded." }); });
    return () => { live = false; };
  }, [series, issueNumber, year, publisher, editionVerified, listingTitle, grader, grade]);
  const brief = result?.brief, source = result?.summary;
  return <section className="space-y-5 text-sm text-slate-300 leading-6">
    <div><h3 className="text-lg font-semibold text-white">{researchTitle(series)} #{issueNumber}: story &amp; investor brief</h3><p className="text-xs text-slate-500 mt-1">Panel Profits Wiki · issue research</p></div>
    {!result && <p className="text-xs text-cyan-300 animate-pulse" role="status">Preparing the sourced issue brief…</p>}
    {source?.referenceOnly && <p className="text-xs leading-5 text-amber-200 border-l-2 border-amber-400 pl-3">Research reference{source.referenceYear ? `: ${source.referenceYear} edition` : ""}. The seller’s edition has not been verified; this is not a confirmed match to the offered copy.</p>}
    {brief ? <>
      <p>{brief.intro}</p>
      {brief.sections.map((section, i) => <section key={i} className="space-y-2"><h4 className="font-semibold text-cyan-200">{section.heading}</h4><ul className="space-y-2 list-disc pl-5">{section.points.map((point, n) => <li key={n}><strong className="text-white">{point.label}:</strong> {point.text}</li>)}</ul></section>)}
      {brief.lessons.length > 0 && <section className="space-y-3 pt-4 border-t border-slate-800"><h4 className="font-semibold text-emerald-300">What a disciplined investor can learn</h4><ol className="list-decimal pl-5 space-y-3">{brief.lessons.map((lesson, i) => <li key={i}><strong className="text-white">{lesson.heading}.</strong> {lesson.text}</li>)}</ol></section>}
    </> : result && <div className="space-y-2"><p className="text-xs text-amber-200">{result.error}</p>{source && <><h4 className="font-semibold text-cyan-200">Source synopsis</h4><p>{source.text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").slice(0, 1600)}</p></>}</div>}
    {source?.credits && <p className="text-xs text-slate-400">{source.credits.writers?.length ? `Writer: ${source.credits.writers.join(", ")}. ` : ""}{source.credits.pencilers?.length ? `Interior art: ${source.credits.pencilers.join(", ")}.` : ""}</p>}
    {source && <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-xs text-cyan-300 underline underline-offset-4">Original text reference ↗</a>}
    {source?.creditsSourceUrl && <a href={source.creditsSourceUrl} target="_blank" rel="noopener noreferrer" className="block text-xs text-cyan-300 underline underline-offset-4">Publisher’s issue &amp; cover credits ↗</a>}
    <details onToggle={event => setExpanded(event.currentTarget.open)} className="border-t border-slate-800 pt-3"><summary className="cursor-pointer text-xs font-semibold text-amber-300">Full synopsis, characters, credits &amp; wiki</summary>{expanded && <div className="mt-4"><SniperStoryLore series={series} issueNumber={issueNumber} year={year} publisher={publisher} editionVerified={editionVerified} /></div>}</details>
  </section>;
}
