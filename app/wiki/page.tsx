import Link from "next/link";
import { BookOpen, Search, Sparkles, TrendingUp, Cpu, User, Shield, MapPin, Users } from "lucide-react";
import { searchPpcfComics } from "@/lib/ppcf/queries";
import { searchCbrTerms, getFeaturedCbrTerms } from "@/lib/lexicon/cbr-lexicon";
import { queryPineconeVectorIndex } from "@/lib/wiki/pinecone";
import { searchLoreEntities, getFeaturedLoreEntities, type LoreEntitySummary } from "@/lib/wiki/lore-search";
import { createPublicServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function WikiPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const queryText = params.q?.trim() || "";
  const [comics, vectorMatches] = await Promise.all([
    searchPpcfComics(queryText, 24),
    queryText ? queryPineconeVectorIndex(queryText, 6) : Promise.resolve([]),
  ]);

  let loreEntities: LoreEntitySummary[] = [];
  if (queryText) {
    const localMatches = searchLoreEntities(queryText, 18);
    const seenSlugs = new Set(localMatches.map((m) => m.slug));
    loreEntities = [...localMatches];

    try {
      const supabase = createPublicServerClient();
      const { data: dbPages } = await supabase
        .from("ppcf_wiki_pages")
        .select("*")
        .ilike("display_title", `%${queryText}%`)
        .limit(24);

      if (dbPages && dbPages.length > 0) {
        for (const page of dbPages) {
          if (!seenSlugs.has(page.slug)) {
            seenSlugs.add(page.slug);
            const pType = (page.page_type || "").toLowerCase();
            loreEntities.push({
              slug: page.slug,
              title: page.display_title,
              universe: page.universe,
              type: (pType === "item" || pType === "vehicle"
                ? "item"
                : pType === "location"
                ? "location"
                : pType === "team"
                ? "team"
                : "character") as LoreEntitySummary["type"],
              reality: page.reality,
              creators: page.creators,
              first_appearance: page.first_appearance,
              summary: page.summary || `Canonical ${page.universe} entry in Panel Profits knowledge database.`,
            });
          }
        }
      }
    } catch {}
  } else {
    loreEntities = getFeaturedLoreEntities();
  }

  // Real 4,653-term CBR Market Lexicon (Investopedia-grounded, comic-domain translated).
  const glossaryTerms = queryText ? searchCbrTerms(queryText, 24) : getFeaturedCbrTerms(24);

  const renderLoreIcon = (type: string) => {
    switch (type) {
      case "item":
        return <Shield className="h-4 w-4 text-emerald-400" />;
      case "location":
        return <MapPin className="h-4 w-4 text-indigo-400" />;
      case "team":
        return <Users className="h-4 w-4 text-blue-400" />;
      default:
        return <User className="h-4 w-4 text-cyan-400" />;
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {/* Header Bar */}
      <header className="border-b border-slate-800 pb-7">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-cyan-300">
          <BookOpen className="h-3.5 w-3.5" /> Panel Profits Encyclopedia & Financial Knowledge Engine
        </div>
        <h1 className="mt-3 text-3xl text-slate-100 sm:text-5xl font-bold tracking-tight">
          Comic Lore & Equity Oracle
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
          Universal encyclopedic crosswalk connecting Grand Comics Database (GCD) publication history, verified creator lineages, multi-universe character & artifact lore, and Investopedia-style comic equity financial mechanics.
        </p>
      </header>

      {/* Search Input Bar */}
      <form className="mt-6 flex max-w-xl items-center gap-2 border border-slate-800 bg-[#0b0f15] p-2 rounded shadow-lg">
        <Search className="ml-2 h-4 w-4 text-cyan-400" />
        <input
          name="q"
          defaultValue={queryText}
          aria-label="Search encyclopedia"
          className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-slate-100 outline-none text-slate-100 placeholder:text-slate-500"
          placeholder="Search 220,000+ characters, teams, lore & financial terms..."
        />
        <button className="border border-cyan-500/60 bg-cyan-950/40 px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-cyan-200 hover:bg-cyan-900/60 transition-colors rounded font-semibold">
          Search Oracle
        </button>
      </form>

      {/* Multi-Universe Lore & Character Dossiers */}
      <section className="mt-10" aria-label="Multi-Universe Lore Dossiers">
        <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-cyan-400 font-semibold">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            {queryText ? `Multi-Universe Lore Matches for "${queryText}"` : "Premier Landmark Universe Lore & Characters"}
          </div>
          <span className="text-xs text-slate-500 font-mono">{loreEntities.length} Dossiers</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loreEntities.map((ent) => (
            <Link
              key={ent.slug}
              href={`/wiki/entry/${ent.slug}`}
              className="border border-slate-800 bg-[#0b0f15] p-5 rounded transition-all hover:border-cyan-400/80 hover:shadow-[0_0_22px_rgba(6,182,212,0.18)] flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    {renderLoreIcon(ent.type)}
                    <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-semibold">
                      {ent.universe}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {ent.type.toUpperCase()}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-bold text-slate-100">{ent.title}</h3>
                {ent.first_appearance && (
                  <p className="mt-1 text-xs font-mono text-cyan-300">
                    Debut: {ent.first_appearance}
                  </p>
                )}
                {ent.creators && (
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Creators: {ent.creators}
                  </p>
                )}
                <p className="mt-2 text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {ent.summary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>{ent.reality || "CANON"}</span>
                <span className="text-cyan-400 hover:text-cyan-300">View Dossier &rarr;</span>
              </div>
            </Link>
          ))}
        </div>

        {!loreEntities.length && queryText && (
          <div className="border border-slate-800 bg-[#090C14] px-4 py-8 text-center rounded">
            <p className="text-xs text-slate-400 font-mono">
              No direct lore entities matched &ldquo;{queryText}&rdquo;. Check canonical comic editions below.
            </p>
          </div>
        )}
      </section>

      {/* Investopedia-Style Equity Financial Terms Grid */}
      <section className="mt-12" aria-label="Comic Equity Financial Glossary">
        <div className="flex items-center gap-2 mb-4 text-xs font-mono uppercase tracking-[0.18em] text-cyan-400 font-semibold">
          <TrendingUp className="h-4 w-4 text-cyan-300" />
          Comic Equity & Investment Fundamentals
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {glossaryTerms.map((termObj) => {
              const isMatch = Boolean(
                queryText &&
                  (termObj.term.toLowerCase().includes(queryText.toLowerCase()) ||
                    termObj.slug.includes(queryText.toLowerCase()))
              );
              return (
                <div
                  key={termObj.slug}
                  id={termObj.slug}
                  className={`border ${
                    isMatch
                      ? "border-cyan-400 bg-[#0C1626] shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                      : "border-slate-800/80 bg-[#0A0D15] hover:border-cyan-400/50"
                  } p-5 rounded transition-all shadow-md flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 bg-[#0C1626] px-2 py-0.5 border border-cyan-500/40 rounded">
                        {termObj.category}
                      </span>
                      {isMatch ? (
                        <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-200 bg-cyan-950/60 px-2 py-0.5 border border-cyan-400 rounded font-bold">
                          Direct Match
                        </span>
                      ) : (
                        <Sparkles className="h-3 w-3 text-slate-500" />
                      )}
                    </div>
                    <h3 className="mt-3 text-base font-semibold text-slate-100">{termObj.term}</h3>
                    <p className="mt-2 text-xs text-slate-400 leading-relaxed">{termObj.panel_profits_translation}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>PPCF STANDARD</span>
                    <Link href={`/lexicon/${termObj.slug}`} className="text-cyan-400 hover:text-cyan-300">
                      Explore Lexicon &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* Pinecone 65k Vector Estate Semantic Matches */}
      {vectorMatches.length > 0 && (
        <section className="mt-12" aria-label="Pinecone Semantic Vector Matches">
          <div className="flex items-center gap-2 mb-4 text-xs font-mono uppercase tracking-[0.18em] text-cyan-400 font-semibold">
            <Cpu className="h-4 w-4 text-cyan-300" />
            Pinecone Vector Estate Matches (Semantic 65k Index)
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {vectorMatches.map((match) => (
              <div
                key={match.id}
                className="border border-cyan-800/60 bg-[#070B12] p-4 rounded hover:border-cyan-400/80 transition-all shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 bg-[#0C1626] px-2 py-0.5 border border-cyan-500/40 rounded">
                    {match.ticker}
                  </span>
                  <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 border border-cyan-500/30 rounded">
                    Score {(match.score * 100).toFixed(1)}%
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-slate-100">{match.name}</h3>
                <p className="mt-1 text-xs text-slate-400 uppercase tracking-wider font-mono font-medium">{match.type} entity</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Canonical PPCF Records */}
      <section className="mt-12" aria-label="PPCF encyclopedia results">
        <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-mono uppercase tracking-[0.18em] text-slate-400">
            Canonical Edition Records & Crosswalks
          </span>
          <span className="text-xs text-slate-500 font-mono">{comics?.length || 0} Records</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(comics || []).map((comic) => (
            <Link
              key={comic.ppcf_id}
              href={`/wiki/${comic.ppcf_id}`}
              className="border border-slate-800 bg-[#0b0f15] p-5 rounded transition-all hover:border-cyan-400/70 hover:shadow-[0_0_22px_rgba(6,182,212,0.18)]"
            >
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono uppercase tracking-[0.12em] text-cyan-300 bg-cyan-950/40 px-2 py-0.5 border border-cyan-500/30 rounded">
                  PPCF CATALOG
                </span>
                <span className="text-[9px] uppercase tracking-[0.12em] text-slate-500 font-mono">
                  {comic.identity_status}
                </span>
              </div>
              <h2 className="mt-3 text-lg font-semibold text-slate-100">
                {comic.series_name || "Untitled series"}{" "}
                <span className="text-slate-400">#{comic.issue_number || "?"}</span>
              </h2>
              <p className="mt-2 text-xs text-slate-400">
                {comic.publication_date || "Date unavailable"}
                {comic.variant_name ? ` · ${comic.variant_name}` : " · Standard Edition"}
              </p>
            </Link>
          ))}
        </div>

        {!comics?.length && (
          <div className="border border-slate-800 bg-[#090C14] px-4 py-16 text-center rounded">
            <p className="text-sm text-slate-400 font-mono uppercase tracking-wider">
              No PPCF encyclopedia records matched that query.
            </p>
            <p className="mt-2 text-xs text-slate-600">
              Try searching for major titles like &ldquo;Amazing Spider-Man&rdquo;, creators like &ldquo;Steve Ditko&rdquo;, or financial terms.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
