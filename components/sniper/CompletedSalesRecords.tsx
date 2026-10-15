"use client";
import { useEffect, useState } from "react";
interface RecordRow { itemId: string; title: string; date: string; price: number | string | null; currency: string; url?: string; bookMatch: boolean; grader: string | null; grade: number | null; designation: string }
interface Result { available: boolean; message: string; checkedAt: string; hasMoreHistory: boolean; retrievedCount: number; bookCount: number; otherCount: number; total: number; page: number; pages: number; records: RecordRow[] }
export function CompletedSalesRecords({ series, issue }: { series: string; issue: string }) {
  const [page, setPage] = useState(1), [scope, setScope] = useState("book"), [result, setResult] = useState<Result | null>(null), [loading, setLoading] = useState(true), [revision, setRevision] = useState(0);
  useEffect(() => { setPage(1); setScope("book"); setResult(null); }, [series, issue]);
  useEffect(() => {
    let live = true; setLoading(true);
    const q = new URLSearchParams({ series, issue, page: String(page), scope });
    fetch(`/api/sniper/records?${q}`).then(r => r.ok ? r.json() : Promise.reject()).then(j => { if (live) setResult(j); }).catch(() => { if (live) setResult(null); }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [series, issue, page, scope, revision]);
  const download = new URLSearchParams({ series, issue, scope, format: "download" });
  return <section className="space-y-3 border-t border-slate-700 pt-5 mt-5">
    <div className="flex items-center justify-between gap-3"><h3 className="text-base font-semibold text-cyan-200">Completed-sale records · all covers &amp; grades</h3><button className="text-xs text-cyan-300 underline" onClick={() => setRevision(n => n + 1)}>Reload saved records</button></div>
    <p className="text-xs leading-5 text-slate-400">Raw copies and other covers or grades are visible here. This list is separate from the exact-grade chart and does not value the offered copy.</p>
    {result && <><p className="text-xs text-slate-300">{result.bookCount} matching issue records · {result.retrievedCount} total retrieved · saved {result.checkedAt?.slice(0, 10)}.{result.hasMoreHistory ? " Additional provider history remains beyond these saved pages." : " All available pages in the requested three-year window were retrieved."}</p>
      <div className="flex flex-wrap justify-between gap-3 text-xs"><label className="flex items-center gap-2 text-slate-300"><input type="checkbox" checked={scope === "all"} onChange={e => { setScope(e.target.checked ? "all" : "book"); setPage(1); }} />Include {result.otherCount} other or multi-book search matches</label><a href={`/api/sniper/records?${download}`} className="text-cyan-300 underline">Download records (JSON)</a></div></>}
    {loading ? <p className="text-xs text-slate-400" role="status">Loading saved completed sales…</p> : !result?.available ? <p className="text-xs text-amber-200">{result?.message || "Saved records could not be loaded."}</p> : <>
      <div className="overflow-x-auto"><table className="w-full text-xs text-left"><thead className="text-slate-400 border-b border-slate-700"><tr><th className="py-2 pr-2">Sold</th><th className="py-2 pr-2">Listing / edition</th><th className="py-2 pr-2">Grade</th><th className="py-2 text-right">Sold price</th></tr></thead><tbody className="divide-y divide-slate-800">{result.records.map((row, i) => <tr key={`${row.itemId}-${row.date}-${i}`}><td className="py-3 pr-2 whitespace-nowrap text-slate-400">{row.date?.slice(0, 10) || "Date unavailable"}</td><td className="py-3 pr-3 min-w-[230px] text-slate-200">{row.url ? <a href={row.url} target="_blank" rel="noopener noreferrer" className="underline decoration-dotted hover:text-cyan-300">{row.title}</a> : row.title}{!row.bookMatch && <span className="block text-amber-300 text-[10px] mt-1">Other issue, multiple books, or identity not confirmed</span>}</td><td className="py-3 pr-2 whitespace-nowrap text-slate-300">{row.grader ? `${row.grader} ${row.grade?.toFixed(1) || "grade unknown"}` : "Raw / ungraded"}{row.designation && <span className="block text-[10px] text-amber-300">{row.designation}</span>}</td><td className="py-3 text-right whitespace-nowrap text-white font-semibold">{row.price != null ? `${row.currency} ${Number(row.price).toFixed(2)}` : "Price unavailable"}</td></tr>)}</tbody></table></div>
      {!result.records.length && <p className="text-xs text-slate-400">No issue-matched records in this saved result. Include the other search matches to inspect everything returned.</p>}
      <div className="flex justify-between items-center text-xs text-slate-400"><button className="border border-slate-700 rounded px-3 py-1 disabled:opacity-30" disabled={page <= 1} onClick={() => setPage(n => n - 1)}>Previous</button><span>Page {result.page} of {result.pages} · {result.total} records</span><button className="border border-slate-700 rounded px-3 py-1 disabled:opacity-30" disabled={page >= result.pages} onClick={() => setPage(n => n + 1)}>Next</button></div>
    </>}
  </section>;
}
