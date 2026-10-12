import Link from "next/link";
import { getStorySummary, type StoryEntityLink } from "@/lib/comics/story-summary";
import { BookOpen, Sparkles, Users, MapPin, Wrench, Quote } from "lucide-react";

interface StorySummaryCardProps {
  series: string;
  issueNumber: string;
  year: number | null;
  publisher: string | null;
  volume?: number | null;
  accent: string;
}

function resolveInternalLoreUrl(url: string, fallbackLabel: string): string {
  if (!url) return `/comics?q=${encodeURIComponent(fallbackLabel)}`;
  if (url.includes("/wiki/")) {
    const parts = url.split("/wiki/");
    const raw = parts[parts.length - 1];
    const clean = decodeURIComponent(raw)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return `/wiki/entry/${clean}`;
  }
  if (url.startsWith("/")) return url;
  return `/comics?q=${encodeURIComponent(fallbackLabel)}`;
}

/**
 * Safely parse markdown-style links `[Label](url)` and render as internal clickable React elements.
 */
function renderMarkdownWithLinks(text: string) {
  if (!text) return null;
  const parts: React.ReactNode[] = [];
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const label = match[1];
    const rawUrl = match[2];
    const internalUrl = resolveInternalLoreUrl(rawUrl, label);

    parts.push(
      <Link
        key={`${internalUrl}-${match.index}`}
        href={internalUrl}
        className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 font-medium transition-colors"
      >
        {label}
      </Link>
    );
    lastIndex = linkRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function EntityBadge({ entity, badgeColor }: { entity: StoryEntityLink; badgeColor: string }) {
  const internalUrl = resolveInternalLoreUrl(entity.url, entity.label || entity.target);

  return (
    <Link
      href={internalUrl}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono transition-all hover:scale-105 ${badgeColor}`}
      title={entity.target}
    >
      {entity.isFirstApp && <span className="text-amber-400 font-bold">★</span>}
      <span>{entity.label}</span>
      {entity.isFlashback && <span className="text-[10px] text-slate-400 opacity-75">(flashback)</span>}
      {entity.isMentioned && <span className="text-[10px] text-slate-400 opacity-75">(mentioned)</span>}
    </Link>
  );
}

/**
 * Rich encyclopedic collectible due diligence dossier for issue detail pages and sniper modals.
 * Features: Story title, key epigraph quote, creative credits, entity census (1st appearances,
 * heroes, antagonists, items, locations) and full hyperlinked narrative synopsis.
 */
export default async function StorySummaryCard({
  series,
  issueNumber,
  year,
  publisher,
  volume,
  accent,
}: StorySummaryCardProps) {
  let summary = null;
  try {
    summary = await Promise.race([
      getStorySummary({ series, issueNumber, year, publisher, volume }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 9000)),
    ]);
  } catch {
    summary = null;
  }

  if (!summary) return null;

  const paragraphs = summary.text.split(/\n{2,}/).filter(Boolean);
  const entities = summary.entities;
  const credits = summary.credits;
  const quote = summary.quote;

  const hasFirstApps = (entities?.firstAppearances?.length ?? 0) > 0;
  const hasFeatured = (entities?.featuredCharacters?.length ?? 0) > 0;
  const hasAntagonists = (entities?.antagonists?.length ?? 0) > 0;
  const hasItems = (entities?.items?.length ?? 0) > 0 || (entities?.vehicles?.length ?? 0) > 0;
  const hasLocations = (entities?.locations?.length ?? 0) > 0;

  return (
    <section
      aria-label="Story description and due diligence dossier"
      className="rounded-xl p-5 sm:p-6 bg-[#0a0e14] border shadow-2xl relative overflow-hidden"
      style={{ borderColor: `${accent}40` }}
    >
      {/* Background ambient gradient */}
      <div
        className="absolute top-0 right-0 w-96 h-96 pointer-events-none opacity-10 blur-3xl -z-0"
        style={{ background: `radial-gradient(circle, ${accent} 0%, transparent 70%)` }}
      />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800 relative z-10">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
            <BookOpen className="h-4 w-4" />
          </span>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400 font-semibold block">
              Collectible Due Diligence Dossier
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight">
              {summary.storyTitle ? `“${summary.storyTitle}”` : `${series} #${issueNumber} Narrative`}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-mono">
          <span className="px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> VERIFIED LORE
          </span>
        </div>
      </div>

      {/* Key Epigraph / Quotation Banner */}
      {quote && (
        <div className="mt-4 p-4 rounded-lg bg-[#111722]/80 border border-cyan-500/30 relative z-10">
          <div className="flex items-start gap-3">
            <Quote className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5 opacity-80" />
            <div className="space-y-1.5">
              <p className="text-sm sm:text-base italic leading-relaxed text-cyan-100">
                “{renderMarkdownWithLinks(quote.text)}”
              </p>
              {quote.speaker && (
                <p className="text-xs font-mono uppercase tracking-wider text-cyan-400 text-right">
                  — {renderMarkdownWithLinks(quote.speaker)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Creative Credits Lineage */}
      {credits && Object.keys(credits).length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-mono relative z-10">
          {credits.writers && credits.writers.length > 0 && (
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
              <strong className="text-cyan-400">Writer:</strong> {credits.writers.join(", ")}
            </span>
          )}
          {credits.pencilers && credits.pencilers.length > 0 && (
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
              <strong className="text-cyan-400">Art:</strong> {credits.pencilers.join(", ")}
            </span>
          )}
          {credits.colorists && credits.colorists.length > 0 && (
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
              <strong className="text-cyan-400">Color:</strong> {credits.colorists.join(", ")}
            </span>
          )}
          {credits.editors && credits.editors.length > 0 && (
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
              <strong className="text-cyan-400">Editor:</strong> {credits.editors.join(", ")}
            </span>
          )}
        </div>
      )}

      {/* Entity Census (Interactive Categorized Badges) */}
      {entities && (
        <div className="mt-5 space-y-4 pt-4 border-t border-slate-800/80 relative z-10">
          {/* 1st Appearances & Key Debuts */}
          {hasFirstApps && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>1st Appearance Key Debuts</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {entities.firstAppearances!.map((e, idx) => (
                  <EntityBadge
                    key={`fa-${e.target}-${idx}`}
                    entity={e}
                    badgeColor="bg-amber-950/60 border border-amber-500/50 text-amber-200 hover:border-amber-400"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Antagonists */}
          {hasAntagonists && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-mono text-rose-400 uppercase tracking-wider font-semibold">
                <span>⚔ Antagonists & Villains</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {entities.antagonists!.map((e, idx) => (
                  <EntityBadge
                    key={`antag-${e.target}-${idx}`}
                    entity={e}
                    badgeColor="bg-rose-950/50 border border-rose-500/40 text-rose-200 hover:border-rose-400"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Featured Characters */}
          {hasFeatured && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                <Users className="h-3.5 w-3.5" />
                <span>Featured Characters</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {entities.featuredCharacters!.map((e, idx) => (
                  <EntityBadge
                    key={`feat-${e.target}-${idx}`}
                    entity={e}
                    badgeColor="bg-cyan-950/50 border border-cyan-500/40 text-cyan-200 hover:border-cyan-400"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Landmark Tech, Weapons & Vehicles */}
          {hasItems && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                <Wrench className="h-3.5 w-3.5" />
                <span>Landmark Artifacts, Technology & Vehicles</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[...(entities.items || []), ...(entities.vehicles || [])].map((e, idx) => (
                  <EntityBadge
                    key={`item-${e.target}-${idx}`}
                    entity={e}
                    badgeColor="bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 hover:border-emerald-400"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Landmark Locations & Realms */}
          {hasLocations && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold">
                <MapPin className="h-3.5 w-3.5" />
                <span>Landmark Locations, Planets & Realms</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {entities.locations!.slice(0, 15).map((e, idx) => (
                  <EntityBadge
                    key={`loc-${e.target}-${idx}`}
                    entity={e}
                    badgeColor="bg-indigo-950/50 border border-indigo-500/40 text-indigo-200 hover:border-indigo-400"
                  />
                ))}
                {entities.locations!.length > 15 && (
                  <span className="text-xs font-mono text-slate-500 self-center">
                    +{entities.locations!.length - 15} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full Interactive Hyperlinked Synopsis */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 relative z-10">
        <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-2 font-semibold">
          Narrative Synopsis
        </h3>
        <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-slate-300">
              {renderMarkdownWithLinks(p)}
            </p>
          ))}
        </div>
      </div>

      {/* Attribution & Provenance Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 relative z-10">
        <div>
          Source:{" "}
          <span className="text-slate-300 font-mono">
            {summary.source}
          </span>
          {summary.license ? ` · ${summary.license}` : ""}
        </div>
        <div className="font-mono text-cyan-400/80">
          PROVENANCE: LOCAL CBR KNOWLEDGE REPOSITORY
        </div>
      </div>
    </section>
  );
}
