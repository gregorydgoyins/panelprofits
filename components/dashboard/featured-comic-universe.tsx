import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ComicCard } from "@/components/comics/comic-card";
import type { ComicRecord } from "@/lib/comics/types";

interface FeaturedComicUniverseProps {
  comics?: ComicRecord[];
}

/**
 * Highest-priced stored comics that have a cover. Every card is a row from the comics table:
 * the cover and the PriceCharting 9.8 price are what is stored, and a book with no stored price shows "Unpriced".
 * With no rows the section does not render.
 */
export function FeaturedComicUniverse({ comics }: FeaturedComicUniverseProps) {
  if (!comics || comics.length === 0) return null;

  return (
    <section className="rounded-lg border border-slate-800 bg-[#0B0D12] p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Featured comics</h2>
        <Link href="/comics" className="inline-flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-200">
          Browse all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {comics.map((comic) => (
          <ComicCard key={comic.id} comic={comic} />
        ))}
      </div>
    </section>
  );
}
