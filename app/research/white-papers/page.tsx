import Link from "next/link";
import { FileText, GraduationCap, Download, ArrowLeft, BookOpen } from "lucide-react";
import { RESEARCH_PAPERS_REGISTRY } from "@/lib/research/papers";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "White Papers // Research Terminal | Panel Profits",
  description: "Institutional white papers and quantitative analysis on comic asset markets.",
};

export default function WhitePapersPage() {
  const whitePapers = RESEARCH_PAPERS_REGISTRY.filter((p) => p.category === "white-paper");

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <Link href="/research" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-cyan-300 hover:text-cyan-200 mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Research Terminal
      </Link>
      <header className="border-b border-slate-800 pb-7">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.28em] text-sky-300">
          <FileText className="h-3.5 w-3.5 text-sky-400" /> Research Terminal // White Papers
        </div>
        <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-slate-100">
          Institutional White Papers
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
          Quantitative frameworks, market capitalization methodologies, and supply-side valuation models published by the Panel Profits Research Group.
        </p>
      </header>

      <div className="mt-8 divide-y divide-slate-800 border-y border-slate-800">
        {whitePapers.map((paper) => (
          <article key={paper.id} className="p-6 bg-[#080B12] hover:bg-[#0B0F18] transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono">
              <span className="text-sky-300 font-semibold">{paper.doiOrRef}</span>
              <span>{paper.publicationDate} · {paper.institution}</span>
            </div>
            <h2 className="mt-2 text-xl font-semibold text-slate-100">{paper.title}</h2>
            <p className="mt-1 text-xs text-slate-400 font-mono">Authors: {paper.authors.join(", ")}</p>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">{paper.abstract}</p>
            <div className="mt-5 flex items-center gap-4">
              <a
                href={paper.downloadUrl}
                download
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-mono uppercase tracking-wider bg-sky-950/60 border border-sky-500/50 text-sky-300 hover:bg-sky-900/60 transition-colors"
              >
                <Download className="h-3.5 w-3.5" /> Download PDF White Paper
              </a>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
