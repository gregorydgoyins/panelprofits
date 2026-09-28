import Link from "next/link";
import { BookOpen, TrendingUp, ShieldCheck, Scale, BarChart3, ArrowRight } from "lucide-react";
import { COMIC_FINANCIAL_GLOSSARY } from "@/lib/wiki/entity-extractor";

export const dynamic = "force-dynamic";

export default async function LexiconPage() {
  const terms = Object.entries(COMIC_FINANCIAL_GLOSSARY);

  // Group terms by category
  const categories: Record<string, Array<{ slug: string; term: string; definition: string; category: string }>> = {};
  for (const [slug, item] of terms) {
    const cat = item.category || "General Market Mechanics";
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push({ slug, ...item });
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <header className="border-b border-slate-800 pb-7">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-cyan-400 font-mono">
          <BookOpen className="h-3.5 w-3.5" /> Panel Profits Financial Lexicon & Market Thesaurus
        </div>
        <h1 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-slate-100">
          The Investopedia of Comic Equities
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
          Comprehensive market thesaurus defining capital structures, grading certification benchmarks, secondary trading velocity, and valuation mechanics across comic assets.
        </p>
      </header>

      <div className="mt-10 space-y-12">
        {Object.entries(categories).map(([categoryName, items]) => (
          <section key={categoryName} className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
              <Scale className="h-4 w-4 text-cyan-400" />
              <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-300 font-semibold">
                {categoryName}
              </h2>
              <span className="text-[10px] font-mono text-slate-500 ml-auto">
                {items.length} {items.length === 1 ? "term" : "terms"}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <Link
                  key={item.slug}
                  href={`/lexicon/${item.slug}`}
                  className="group flex flex-col justify-between rounded-lg border border-slate-800 bg-[#0B0F18] p-5 transition-all hover:border-cyan-500/60 hover:bg-[#0E1422] shadow-lg"
                >
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500">
                      {item.category}
                    </span>
                    <h3 className="mt-1 text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {item.term}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400 line-clamp-3">
                      {item.definition}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-800/60 pt-3 text-[10px] font-mono text-slate-500">
                    <span className="text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1">
                      Read Definition <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
