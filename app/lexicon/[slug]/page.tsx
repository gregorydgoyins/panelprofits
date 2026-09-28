import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Scale, Sparkles, TrendingUp, ShieldCheck, ArrowUpRight } from "lucide-react";
import { COMIC_FINANCIAL_GLOSSARY } from "@/lib/wiki/entity-extractor";

export const dynamic = "force-dynamic";

export default async function LexiconTermPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cleanSlug = slug.toLowerCase().trim();

  // Find exact term or alias
  const termEntry = COMIC_FINANCIAL_GLOSSARY[cleanSlug];
  if (!termEntry) {
    notFound();
  }

  // Related terms from the same category
  const relatedTerms = Object.entries(COMIC_FINANCIAL_GLOSSARY)
    .filter(([k, v]) => k !== cleanSlug && v.category === termEntry.category)
    .slice(0, 4);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <Link
        href="/lexicon"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-cyan-400 hover:text-cyan-200 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Market Lexicon
      </Link>

      {/* Main Term Header */}
      <header className="mt-6 rounded-lg border border-slate-800 bg-[#0B0F18] p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-cyan-400" />
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-400">
              Panel Profits Market Thesaurus
            </span>
          </div>
          <span className="rounded border border-cyan-500/40 bg-cyan-950/60 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-cyan-300">
            {termEntry.category}
          </span>
        </div>

        <h1 className="mt-5 text-3xl sm:text-5xl font-bold tracking-tight text-slate-100">
          {termEntry.term}
        </h1>

        <div className="mt-6 rounded border border-slate-800/80 bg-[#070A12] p-5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
            Official Financial Definition
          </span>
          <p className="mt-2 text-base sm:text-lg leading-relaxed text-slate-200">
            {termEntry.definition}
          </p>
        </div>
      </header>

      {/* Market Mechanics & Price Elasticity Section */}
      <section className="mt-6 rounded-lg border border-slate-800 bg-[#0A0E17] p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <TrendingUp className="h-4 w-4 text-cyan-400" />
          <h2 className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-semibold">
            Secondary Market Mechanics & Price Impact
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded border border-slate-800 bg-[#070C16] p-4">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
              Liquidity & Spread Dynamics
            </span>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
              When market participants track {termEntry.term.toLowerCase()}, auction velocity frequently accelerates, tightening the bid-ask spread across primary clearinghouses and secondary auction conduits.
            </p>
          </div>

          <div className="rounded border border-slate-800 bg-[#070C16] p-4">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
              Certified Census Scarcity
            </span>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
              High-grade certified copies (CGC 9.6/9.8) command structural premiums over raw uncertified inventory due to verified preservation status and immutable population census ceilings.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <Link
            href={`/comics?q=${encodeURIComponent(termEntry.term)}`}
            className="inline-flex items-center gap-2 rounded border border-cyan-500/40 bg-cyan-950/40 px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-cyan-300 hover:border-cyan-400 hover:bg-cyan-900/60 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            Explore Comic Equities Related to {termEntry.term} &rarr;
          </Link>
        </div>
      </section>

      {/* Related Terms Rail */}
      {relatedTerms.length > 0 && (
        <section className="mt-8 border-t border-slate-800/80 pt-6">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
            Related {termEntry.category} Terms:
          </span>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {relatedTerms.map(([rSlug, rItem]) => (
              <Link
                key={rSlug}
                href={`/lexicon/${rSlug}`}
                className="rounded border border-slate-800 bg-slate-900/50 p-3 hover:border-cyan-400/60 transition-colors"
              >
                <p className="text-xs font-semibold text-slate-200 hover:text-cyan-300 flex items-center justify-between">
                  <span>{rItem.term}</span>
                  <ArrowUpRight className="h-3 w-3 text-slate-500" />
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
