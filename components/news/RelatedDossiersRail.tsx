import Link from "next/link";
import { ArrowUpRight, BookOpen, Compass, Shield, Sparkles, Users } from "lucide-react";
import type { RelatedDossierEntity, RelatedDossiersResult, RelatedLexiconTerm } from "@/lib/news/related-dossiers";

interface RelatedDossiersRailProps {
  data: RelatedDossiersResult;
}

// Cosmetic display hints only -- grouping and correctness never depend on this map. The
// underlying universe strings stored in public.ppcf_wiki_pages vary by ingestion pass (e.g.
// "IMAGE" vs "IMAGECOMICS", "DARK_HORSE" vs "DARKHORSE"), so unrecognized spellings fall back
// to a neutral slate style rather than being miscategorized or hidden.
const UNIVERSE_DISPLAY: Record<string, { label: string; accent: string }> = {
  MARVEL: { label: "Marvel", accent: "text-rose-300 border-rose-500/40 bg-rose-950/40" },
  DC: { label: "DC", accent: "text-blue-300 border-blue-500/40 bg-blue-950/40" },
  STAR_WARS: { label: "Star Wars", accent: "text-amber-300 border-amber-500/40 bg-amber-950/40" },
  IMAGE: { label: "Image", accent: "text-violet-300 border-violet-500/40 bg-violet-950/40" },
  IMAGECOMICS: { label: "Image", accent: "text-violet-300 border-violet-500/40 bg-violet-950/40" },
  DARK_HORSE: { label: "Dark Horse", accent: "text-orange-300 border-orange-500/40 bg-orange-950/40" },
  DARKHORSE: { label: "Dark Horse", accent: "text-orange-300 border-orange-500/40 bg-orange-950/40" },
  SPAWN: { label: "Spawn", accent: "text-red-300 border-red-500/40 bg-red-950/40" },
  TRANSFORMERS: { label: "Transformers", accent: "text-cyan-300 border-cyan-500/40 bg-cyan-950/40" },
  CYBERPUNK: { label: "Cyberpunk", accent: "text-fuchsia-300 border-fuchsia-500/40 bg-fuchsia-950/40" },
  MANGA: { label: "Manga", accent: "text-emerald-300 border-emerald-500/40 bg-emerald-950/40" },
  DOCTOR_WHO: { label: "Doctor Who", accent: "text-sky-300 border-sky-500/40 bg-sky-950/40" },
  STAR_TREK: { label: "Star Trek", accent: "text-yellow-300 border-yellow-500/40 bg-yellow-950/40" },
  INDIE: { label: "Indie", accent: "text-purple-300 border-purple-500/40 bg-purple-950/40" },
  VERTIGO: { label: "DC Vertigo", accent: "text-teal-300 border-teal-500/40 bg-teal-950/40" },
};

function universeDisplay(universe: string) {
  return (
    UNIVERSE_DISPLAY[universe] || {
      label: universe.replace(/_/g, " "),
      accent: "text-slate-300 border-slate-600/40 bg-slate-900/60",
    }
  );
}

function typeIcon(type: RelatedDossierEntity["type"]) {
  switch (type) {
    case "team":
      return <Users className="h-3 w-3" aria-hidden="true" />;
    case "location":
      return <Compass className="h-3 w-3" aria-hidden="true" />;
    case "item":
      return <Shield className="h-3 w-3" aria-hidden="true" />;
    default:
      return <Sparkles className="h-3 w-3" aria-hidden="true" />;
  }
}

function DossierCard({ entity }: { entity: RelatedDossierEntity }) {
  return (
    <Link
      href={entity.wikiPath}
      className="group flex flex-col gap-1.5 rounded border border-slate-800/80 bg-[#0B0F17] p-3 transition-colors hover:border-cyan-500/50 hover:bg-[#101622]"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider text-slate-500">
          {typeIcon(entity.type)}
          {entity.type}
        </span>
        {entity.ticker && (
          <span className="text-[9px] font-mono font-bold text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
            {entity.ticker}
          </span>
        )}
      </div>

      <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-200 transition-colors">
        {entity.title}
      </span>

      {entity.summary && (
        <p className="text-[11px] leading-relaxed text-slate-400 line-clamp-2">{entity.summary}</p>
      )}

      {(entity.creators || entity.firstAppearance) && (
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] font-mono text-slate-500">
          {entity.creators && (
            <span>
              Creators: <span className="text-slate-400">{entity.creators}</span>
            </span>
          )}
          {entity.firstAppearance && (
            <span>
              Debut: <span className="text-slate-400">{entity.firstAppearance}</span>
            </span>
          )}
        </div>
      )}

      <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-mono text-cyan-400 group-hover:text-cyan-300 transition-colors">
        Open Dossier <ArrowUpRight className="h-3 w-3" />
      </span>
    </Link>
  );
}

function LexiconTermPill({ term }: { term: RelatedLexiconTerm }) {
  return (
    <Link
      href={term.wikiPath}
      className="group flex flex-col gap-1 rounded border border-pink-900/50 bg-[#140813] px-3 py-2 transition-colors hover:border-pink-500/60 hover:bg-[#1f0d1d]"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-pink-200 group-hover:text-pink-100 transition-colors">
          {term.term}
        </span>
        <ArrowUpRight className="h-3 w-3 shrink-0 text-pink-400 group-hover:text-pink-200 transition-colors" />
      </div>
      <span className="text-[9px] font-mono uppercase tracking-wider text-pink-400">{term.category}</span>
      {term.definition && (
        <p className="text-[11px] leading-relaxed text-slate-300 line-clamp-2">{term.definition}</p>
      )}
    </Link>
  );
}

/**
 * "Related Dossiers" -- news rail v2. Surfaces the real characters, teams, locations, items,
 * and financial-lexicon terms matched in a specific news story, grouped by universe, each
 * linking to its real wiki/lexicon dossier page with real debut/creator/summary data pulled
 * through from public.ppcf_wiki_pages and lib/lexicon/cbr_market_lexicon.json. Distinct from
 * the site-wide news-rail marquee (components/shell/news-rail.tsx), which is an unrelated
 * always-on ticker of recent headlines shown above every page -- this is a per-story panel.
 * A Server Component: renders whatever getRelatedDossiersForText resolved server-side, no
 * client-side fetch or state.
 */
export function RelatedDossiersRail({ data }: RelatedDossiersRailProps) {
  const { universeGroups, lexiconTerms, totalEntityCount } = data;
  const hasAnything = totalEntityCount > 0 || lexiconTerms.length > 0;

  return (
    <div className="mt-8 border border-slate-800 bg-[#070A10] p-4 sm:p-5 rounded-lg shadow-inner">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-300 font-semibold">
            Related Dossiers
          </span>
        </div>
        <span className="rounded bg-slate-800/80 px-2 py-0.5 text-[10px] font-mono text-slate-300 uppercase tracking-wider">
          {totalEntityCount} {totalEntityCount === 1 ? "entity" : "entities"} · {lexiconTerms.length}{" "}
          {lexiconTerms.length === 1 ? "term" : "terms"}
        </span>
      </div>

      {!hasAnything && (
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          No characters, teams, locations, or market-lexicon terms were matched against this
          story's headline and summary in the wiki and lexicon indexes.
        </p>
      )}

      {universeGroups.map((group) => {
        const display = universeDisplay(group.universe);
        return (
          <div key={group.universe} className="mt-4 border-t border-slate-800/60 pt-3 first:mt-3 first:border-t-0 first:pt-0">
            <div className="mb-2.5 flex items-center gap-2">
              <span className={`rounded border px-1.5 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-wider ${display.accent}`}>
                {display.label}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                {group.entities.length} {group.entities.length === 1 ? "dossier" : "dossiers"}
              </span>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {group.entities.map((entity) => (
                <DossierCard key={entity.slug} entity={entity} />
              ))}
            </div>
          </div>
        );
      })}

      {lexiconTerms.length > 0 && (
        <div className="mt-4 border-t border-slate-800/60 pt-3">
          <div className="mb-2.5 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-pink-400 font-semibold">
            <BookOpen className="h-3 w-3 text-pink-400" />
            <span>Market Lexicon · Investopedia Principles</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {lexiconTerms.map((term) => (
              <LexiconTermPill key={term.slug} term={term} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
