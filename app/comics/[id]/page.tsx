import { notFound } from "next/navigation";
import Link from "next/link";
import { getComicById } from "@/lib/comics/queries";
import { getCurrentUser, getComicUserStatus } from "@/lib/account/queries";
import { ComicCover } from "@/components/comics/comic-cover";
import { PricingDossier } from "@/components/comics/pricing-dossier";
import { ProvenanceCard } from "@/components/comics/provenance-card";
import { ComicActions } from "@/components/comics/comic-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { displayIssue, displaySeries } from "@/lib/comics/display";
import { getComicCoverEvidence } from "@/lib/comics/covers";
import { getComicCensusDossier } from "@/lib/comics/census";
import { CensusDossier } from "@/components/comics/census-dossier";
import { resolveIssueDebuts } from "@/lib/wiki/debut-resolver";
import { Sparkles, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

interface ComicDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

function formatPrinting(value: string | number | null): string {
  if (value === null || value === undefined || value === "") return "1st Printing";
  const raw = String(value).trim();
  if (!/^\d+$/.test(raw)) return /printing/i.test(raw) ? raw : `${raw} Printing`;
  const n = Number(raw);
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? "th"
    : n % 10 === 1 ? "st" : n % 10 === 2 ? "nd" : n % 10 === 3 ? "rd" : "th";
  return `${n}${suffix} Printing`;
}

export default async function ComicDetailPage({ params }: ComicDetailPageProps) {
  const { id } = await params;
  let comic = null;
  let user = null;

  try {
    [comic, user] = await Promise.all([
      getComicById(id),
      getCurrentUser().catch(() => null),
    ]);
  } catch (err) {
    console.error("Error loading comic detail base record:", err);
  }

  if (!comic) {
    notFound();
  }

  const [coverEvidence, censusDossier, userStatus] = await Promise.all([
    getComicCoverEvidence(comic.id).catch((err) => {
      console.warn("Cover evidence read unavailable:", err);
      return null;
    }),
    getComicCensusDossier(comic.series, comic.issue_number).catch((err) => {
      console.warn("Census dossier read unavailable:", err);
      return null;
    }),
    user
      ? getComicUserStatus(comic.id).catch((err) => {
          console.warn("User status read unavailable:", err);
          return {
            isInCollection: false,
            collectionItem: null,
            isInWatchlist: false,
            watchlistItem: null,
          };
        })
      : Promise.resolve({
          isInCollection: false,
          collectionItem: null,
          isInWatchlist: false,
          watchlistItem: null,
        }),
  ]);
  const seriesLabel = displaySeries(comic.series, comic.issue_number);
  const issueLabel = displayIssue(comic.issue_number);
  const debut = resolveIssueDebuts(comic.series, comic.issue_number);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Navigation & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-graphite-800 pb-4">
        <Link href="/comics">
          <Button variant="outline" size="sm" className="flex items-center gap-1.5 h-8 text-xs">
            <ChevronLeft className="h-4 w-4" />
            <span>BACK TO CATALOG</span>
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-xs text-graphite-400">
          <span>CATALOG</span>
          <span>/</span>
          <span className="text-chalk truncate max-w-[200px] sm:max-w-xs">{seriesLabel}</span>
          <span>/</span>
          <span className="text-cobalt-400">{issueLabel}</span>
        </div>
      </div>

      {/* Main Dossier Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Primary Cover & Physical Profile */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-xl border border-cyan-500/40 bg-graphite-900/90 p-4 shadow-xl portfolio-rimlight-hover">
            <ComicCover
              coverUrl={comic.cover_retrieval_url || comic.cover_url || coverEvidence?.image_url}
              storagePath={comic.cover_storage_path || coverEvidence?.storage_path}
              series={seriesLabel}
              issueNumber={comic.issue_number}
              publisher={comic.publisher}
              size="full"
              priority={true}
            />

            {/* Quick Metadata Spec */}
            <div className="mt-4 pt-4 border-t border-graphite-800 space-y-2 text-xs">
              <div className="flex justify-between items-center text-graphite-400">
                <span>COVER VERIFICATION</span>
                <Badge variant={comic.cover_verified_at ? "success" : "secondary"} className="text-[9px]">
                  {comic.cover_verified_at ? "VERIFIED" : "PENDING AUDIT"}
                </Badge>
              </div>

              {comic.cover_sha256 && (
                <div className="flex flex-col text-[10px] text-graphite-500 pt-1">
                  <span>SHA256 CHECKSUM:</span>
                  <span className="truncate text-graphite-400">{comic.cover_sha256}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Identity, Actions, Pricing, Provenance */}
        <div className="lg:col-span-8 space-y-6">
          {/* Identity & Actions Header Card */}
          <div className="rounded-xl border border-cyan-500/40 bg-graphite-900/90 p-6 space-y-5 shadow-xl markets-rimlight-hover">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default" className="text-xs">
                  {comic.publisher || "INDEPENDENT PUBLISHER"}
                </Badge>
                {comic.publication_year && (
                  <Badge variant="secondary" className="text-xs">
                    {comic.publication_year}
                  </Badge>
                )}
                {comic.direct_or_variant && (
                  <Badge variant="secondary" className="text-xs">
                    {comic.direct_or_variant}
                  </Badge>
                )}
                {comic.cover_variant && (
                  <Badge variant="copper" className="text-xs">
                    VARIANT: {comic.cover_variant}
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl tracking-tight text-chalk">
                {seriesLabel}{" "}
                <span className="text-cobalt-400">{issueLabel}</span>
              </h1>

              {comic.title && comic.title !== comic.series && (
                <p className="text-sm text-graphite-300 italic">
                  &ldquo;{comic.title}&rdquo;
                </p>
              )}
            </div>

            {/* Landmark Key Issue Debuts & Lore Equity */}
            {debut && (debut.characters.length > 0 || (debut.items && debut.items.length > 0) || (debut.locations && debut.locations.length > 0) || (debut.teams && debut.teams.length > 0)) && (
              <div className="rounded-lg border border-cyan-500/30 bg-graphite-950/80 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-semibold tracking-wider uppercase text-cyan-300">
                      Landmark Key Issue Debuts & Lore Equity
                    </span>
                  </div>
                  <Badge variant="outline" className="border-cyan-500/40 text-[10px] text-cyan-400 uppercase">
                    {debut.universe} Universe Canon
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {debut.characters.map((ch) => (
                    <Link
                      key={ch}
                      href={`/wiki?q=${encodeURIComponent(ch)}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-medium hover:border-rose-400 hover:bg-rose-900/50 transition-colors"
                    >
                      <span className="text-rose-400">★</span>
                      <span>1st App: {ch}</span>
                    </Link>
                  ))}

                  {debut.items?.map((it) => (
                    <Link
                      key={it}
                      href={`/wiki?q=${encodeURIComponent(it)}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-medium hover:border-emerald-400 hover:bg-emerald-900/50 transition-colors"
                    >
                      <span className="text-emerald-400">⚡</span>
                      <span>Item: {it}</span>
                    </Link>
                  ))}

                  {debut.locations?.map((loc) => (
                    <Link
                      key={loc}
                      href={`/wiki?q=${encodeURIComponent(loc)}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-950/40 border border-indigo-500/40 text-indigo-300 text-xs font-medium hover:border-indigo-400 hover:bg-indigo-900/50 transition-colors"
                    >
                      <span className="text-indigo-400">📍</span>
                      <span>Origin: {loc}</span>
                    </Link>
                  ))}

                  {debut.teams?.map((tm) => (
                    <Link
                      key={tm}
                      href={`/wiki?q=${encodeURIComponent(tm)}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-950/40 border border-blue-500/40 text-blue-300 text-xs font-medium hover:border-blue-400 hover:bg-blue-900/50 transition-colors"
                    >
                      <span className="text-blue-400">👥</span>
                      <span>Team: {tm}</span>
                    </Link>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-graphite-800 text-[11px] text-graphite-400">
                  <span className="truncate">
                    {debut.creators && debut.creators.length > 0 && (
                      <>Creator Lineage: {debut.creators.join(", ")}</>
                    )}
                  </span>
                  <Link
                    href={`/wiki?q=${encodeURIComponent(comic.series)}`}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium shrink-0 ml-2"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>View in Encyclopedia</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Collection & Watchlist Actions */}
            <div className="pt-2 border-t border-graphite-800">
              <ComicActions
                comicId={comic.id}
                series={comic.series}
                issueNumber={comic.issue_number}
                isAuthenticated={Boolean(user)}
                isInCollection={userStatus.isInCollection}
                collectionQuantity={userStatus.collectionItem?.quantity || 1}
                collectionGrade={userStatus.collectionItem?.grade}
                collectionCost={userStatus.collectionItem?.acquisition_cost}
                isInWatchlist={userStatus.isInWatchlist}
              />
            </div>

            {/* Specification Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-graphite-800 text-xs">
              <div className="rounded bg-graphite-950 p-2.5 space-y-0.5">
                <span className="text-[10px] uppercase text-graphite-500">VOLUME</span>
                <p className="text-chalk">{comic.volume || "1"}</p>
              </div>

              <div className="rounded bg-graphite-950 p-2.5 space-y-0.5">
                <span className="text-[10px] uppercase text-graphite-500">PRINTING</span>
                <p className="text-chalk">{formatPrinting(comic.printing)}</p>
              </div>

              <div className="rounded bg-graphite-950 p-2.5 space-y-0.5">
                <span className="text-[10px] uppercase text-graphite-500">PUB DATE</span>
                <p className="text-chalk">{formatDate(comic.publication_date)}</p>
              </div>

              <div className="rounded bg-graphite-950 p-2.5 space-y-0.5">
                <span className="text-[10px] uppercase text-graphite-500">UPC CODE</span>
                <p className="text-chalk truncate">{comic.upc || "—"}</p>
              </div>
            </div>
          </div>

          {/* Pricing Dossier */}
          <PricingDossier comic={comic} />

          {/* Census and Graded Market Evidence */}
          <CensusDossier dossier={censusDossier} />

          {/* Provenance & Source Inspection */}
          <ProvenanceCard comic={comic} />
        </div>
      </div>
    </div>
  );
}
