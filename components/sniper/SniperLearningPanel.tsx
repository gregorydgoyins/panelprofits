"use client";
import Link from "next/link";
import { CORE_CANON_DICTIONARY } from "@/lib/lexicon/core-canon-dictionary";

const terms = ["fair-market-value-fmv-benchmark", "price-discovery", "cost-basis-tax-lot-accounting", "bid-ask-spread-fmv-liquidity-spread"];
export function SniperLearningPanel({ series, issue, section = "all" }: { series: string; issue: string; section?: "all" | "investopedia" | "learn" }) {
  return <div className="space-y-4">
    {section !== "learn" && <section className="rounded-xl border border-emerald-500/30 bg-[#070C18] p-4 space-y-3">
      <div className="flex justify-between items-center gap-3"><h3 className="text-sm font-semibold text-emerald-300">Investopedia &amp; market glossary</h3><Link href="/lexicon" className="text-xs text-cyan-300 underline underline-offset-4">Open full lexicon ↗</Link></div>
      <p className="text-xs text-slate-400">The concepts behind evaluating {series} #{issue}.</p>
      <div className="grid gap-2">{terms.map(slug => CORE_CANON_DICTIONARY[slug]).filter(Boolean).map(term => <Link key={term.slug} href={`/lexicon/${term.slug}`} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 hover:border-emerald-500/60 transition">
        <div className="text-xs font-semibold text-white">{term.term} <span className="text-emerald-400">↗</span></div>
        <p className="text-xs leading-5 text-slate-400 mt-1">{term.investopedia_definition}</p>
      </Link>)}</div>
    </section>}
    {section !== "investopedia" && <section className="rounded-xl border border-blue-500/30 bg-[#070C18] p-4 space-y-3">
      <div className="flex justify-between items-center gap-3"><h3 className="text-sm font-semibold text-blue-300">What to learn from this listing</h3><Link href="/learn" className="text-xs text-cyan-300 underline underline-offset-4">Market Academy ↗</Link></div>
      <ol className="space-y-3 text-xs text-slate-300 list-decimal pl-4">
        <li><strong className="text-white">Confirm the exact comic.</strong> Compare the slab label, publisher, issue date, printing and variant. The character wiki supplies story context; it does not establish the sale price.</li>
        <li><strong className="text-white">Read completed sales.</strong> Choose the same grade and grader. Open the source links to check what sold. The live asking price or current bid stays separate from historical sales.</li>
        <li><strong className="text-white">Compare total acquisition cost.</strong> Include the listed shipping and applicable transaction costs before comparing with the sales sample. A recent sale is evidence, not a guaranteed exit price.</li>
        <li><strong className="text-white">Assess trading activity.</strong> Check sale dates, sample size and gaps. A small sample means limited evidence; it does not mean no other sales occurred.</li>
      </ol>
      <div className="flex gap-4 text-xs"><Link href="/wiki" className="text-amber-300 underline underline-offset-4">Character &amp; creator wiki ↗</Link><Link href="/lexicon" className="text-emerald-300 underline underline-offset-4">Investing terms ↗</Link></div>
    </section>}
  </div>;
}
