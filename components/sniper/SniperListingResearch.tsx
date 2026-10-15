"use client";
import { useEffect, useState } from "react";
import type { LocalLotResearch } from "@/lib/sniper/local-research";
import type { StorySummary } from "@/lib/comics/story-summary";
import type { ListingWriteup } from "@/lib/sniper/listing-writeup";

type Props = {
  itemId?: string; listingTitle: string; series: string; issueNumber: string; year?: number; publisher?: string;
  grader?: string; grade?: number; editionVerified: boolean;
};

/** Researched write-up for this exact listing (story synopsis + the collector case for this edition). Reads saved research only. */
function Refs({ refs, sources }: { refs?: number[]; sources: ListingWriteup["sources"] }) {
  return <>{(refs ?? []).map((n) => sources[n] ? <a key={n} href={sources[n].uri} target="_blank" rel="noopener noreferrer" title={sources[n].title} className="ml-1 align-super text-[10px] text-cyan-300 hover:underline">[{n + 1}]</a> : null)}</>;
}

function LinkedSynopsis({ story }: { story: StorySummary }) {
  const links = new Map(Object.values(story.entities ?? {}).flatMap(entries => entries ?? []).map(entity => [entity.label, entity.url]));
  if (!links.size) return <>{story.text}</>;
  const names = [...links.keys()].sort((a, b) => b.length - a.length).map(name => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return <>{story.text.split(new RegExp(`(${names.join("|")})`, "g")).map((part, i) => links.has(part)
    ? <a key={i} href={links.get(part)} className="text-cyan-300 underline underline-offset-4">{part}</a>
    : part)}</>;
}

export function SniperListingResearch(p: Props) {
  const [localResearch, setLocalResearch] = useState<LocalLotResearch | null>(null);
  const [researchError, setResearchError] = useState<string | null>(null);
  const [story, setStory] = useState<StorySummary | null>(null);
  const [writeup, setWriteup] = useState<ListingWriteup | null | undefined>(undefined);
  useEffect(() => {
    let live = true, timer: ReturnType<typeof setTimeout> | undefined, tries = 0;
    setWriteup(undefined); setStory(null); setLocalResearch(null); setResearchError(null);
    const q = new URLSearchParams({ title: p.listingTitle, series: p.series, issue: p.issueNumber });
    if (p.itemId) q.set("itemId", p.itemId);
    if (p.year) q.set("year", String(p.year));
    if (p.publisher) q.set("publisher", p.publisher);
    if (p.grader) q.set("grader", p.grader);
    const load = () => fetch(`/api/sniper/listing-writeup?${q}`).then(r => r.ok ? r.json() : Promise.reject()).then(j => {
      if (!live) return;
      setStory(j.story ?? null);
      setLocalResearch(j.localResearch ?? null); setResearchError(j.researchError ?? null);
      if (!j.story && !j.localResearch && !j.researchError && j.state === "pending" && ++tries < 14) { timer = setTimeout(load, 5000); return; } // saved write-up not ready yet: it is being written, ask again
      setWriteup(j.writeup ?? null);
    }).catch(() => { if (live) setWriteup(null); });
    load();
    return () => { live = false; if (timer) clearTimeout(timer); };
  }, [p.itemId, p.listingTitle, p.series, p.issueNumber, p.year, p.publisher, p.grader]);

  const evidence = <>
    {researchError && <p role="status" className="text-xs text-amber-300">{researchError}</p>}
    {localResearch && <section className="space-y-3 border-b border-slate-800 pb-4 text-sm">
      <h3 className="font-semibold text-white">Stored census &amp; price comparisons</h3>
      {localResearch.census && <p className="text-slate-300">Graded population: <strong>{localResearch.census.total.toLocaleString()}</strong> across label types{localResearch.census.atGrade != null ? ` · ${localResearch.census.atGrade.toLocaleString()} at this grade` : ""}. Issue: {localResearch.census.title} #{localResearch.census.issue} ({localResearch.census.year}).</p>}
      {localResearch.prices.length > 0 && <><p className="text-xs text-slate-400">Stored guide values for comparison; these are not confirmed same-grader sales.</p><table className="w-full text-left text-slate-300"><thead><tr><th>Grade</th><th>Guide value</th><th>Source</th></tr></thead><tbody>{localResearch.prices.map(price => <tr key={price.grade}><td>{price.grade}</td><td>{price.amount.toLocaleString("en-US", { style: "currency", currency: "USD" })}</td><td><a className="text-cyan-300 underline" href={price.url}>{price.source}</a></td></tr>)}</tbody></table></>}
      {localResearch.missing.length > 0 && <p className="text-xs text-slate-500">No exact stored match: {localResearch.missing.join(", ")}.</p>}
    </section>}
  </>;
  const savedStory = story && <section className="space-y-3 text-sm text-slate-300 leading-6">
    <h3 className="text-lg font-semibold text-white">Story synopsis</h3>
    <p className="whitespace-pre-line"><LinkedSynopsis story={story} /></p>
    <div className="flex flex-wrap gap-2">{Object.values(story.entities ?? {}).flatMap(entries => entries ?? []).filter((entity, i, all) => all.findIndex(other => other.url === entity.url) === i).map(entity => <a key={entity.url} href={entity.url} className="text-cyan-300 underline underline-offset-4">{entity.label}</a>)}</div>
    <a href={story.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-300 underline">Source: {story.source}</a>
  </section>;
  if (writeup === null) return <>{evidence}{savedStory || <p className="text-xs text-slate-400" role="status">Research for this edition has not been saved yet. Check again after the next listing update.</p>}</>;
  if (writeup === undefined) return <p className="text-xs text-cyan-300 animate-pulse" role="status">Loading saved edition research…</p>;
  return <section className="space-y-5 text-sm text-slate-300 leading-6">
    {evidence}
    {savedStory}
    <div><h3 className="text-lg font-semibold text-white">Story synopsis: {writeup.edition}</h3><p className="text-xs text-slate-500 mt-1">Written for this listing from web sources · check the sources below</p></div>
    <div className="space-y-2"><p>{writeup.synopsis.intro}</p><ul className="space-y-2 list-disc pl-5">{writeup.synopsis.points.map((pt, i) => <li key={i}><strong className="text-white">{pt.label}:</strong> {pt.text}<Refs refs={pt.refs} sources={writeup.sources} /></li>)}</ul></div>
    <div className="space-y-2 pt-4 border-t border-slate-800"><h4 className="font-semibold text-emerald-300">{writeup.investment.heading}</h4><ul className="space-y-2 list-disc pl-5">{writeup.investment.points.map((pt, i) => <li key={i}><strong className="text-white">{pt.label}:</strong> {pt.text}<Refs refs={pt.refs} sources={writeup.sources} /></li>)}</ul></div>
    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400"><span>Sources:</span>{writeup.sources.map((s, i) => <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline underline-offset-4">[{i + 1}] {s.title} ↗</a>)}</div>
  </section>;
}
