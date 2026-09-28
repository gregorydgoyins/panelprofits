import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Shield, MapPin, Users, User, Sparkles, Compass } from "lucide-react";
import { getLoreEntityBySlug } from "@/lib/wiki/lore-search";

export const dynamic = "force-dynamic";

export default async function LoreEntityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entity = getLoreEntityBySlug(slug);

  if (!entity) {
    notFound();
  }

  const renderIcon = () => {
    switch (entity.type) {
      case "item":
        return <Shield className="h-6 w-6 text-emerald-400" />;
      case "location":
        return <MapPin className="h-6 w-6 text-indigo-400" />;
      case "team":
        return <Users className="h-6 w-6 text-blue-400" />;
      default:
        return <User className="h-6 w-6 text-pink-400" />;
    }
  };

  const getUniverseBadgeStyle = () => {
    switch (entity.universe) {
      case "MARVEL":
        return "border-red-500/40 bg-red-950/40 text-red-200";
      case "DC":
        return "border-blue-500/40 bg-blue-950/40 text-blue-200";
      case "STAR_WARS":
        return "border-yellow-500/40 bg-yellow-950/40 text-yellow-200";
      case "IMAGE":
        return "border-purple-500/40 bg-purple-950/40 text-purple-200";
      case "DARK_HORSE":
        return "border-amber-600/40 bg-[#16120E] text-amber-200";
      case "TRANSFORMERS":
        return "border-cyan-500/40 bg-cyan-950/40 text-cyan-200";
      case "SPAWN":
        return "border-emerald-600/40 bg-emerald-950/40 text-emerald-200";
      default:
        return "border-slate-700 bg-slate-900/60 text-slate-300";
    }
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <Link
        href="/wiki"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-pink-300 hover:text-pink-200"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to encyclopedia
      </Link>

      {/* Main Dossier Header */}
      <header className="mt-6 border border-slate-800 bg-[#0b0f15] p-6 sm:p-8 rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-5">
          <div className="flex items-center gap-2.5">
            {renderIcon()}
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-400">
              Canonical Multi-Universe Dossier
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider border ${getUniverseBadgeStyle()}`}>
              {entity.universe}
            </span>
            <span className="px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider border border-slate-700 bg-slate-800/60 text-slate-300">
              {entity.type.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <h1 className="text-3xl sm:text-5xl font-bold text-slate-100 tracking-tight">
            {entity.title}
          </h1>
          <p className="mt-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
            Multiverse Coordinates: {entity.reality || "Prime Reality / Earth-616"}
          </p>
        </div>
      </header>

      {/* Structured Specification Cards */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Debut and Creator Details */}
        <section className="border border-slate-800 bg-[#0b0f15] p-6 rounded-lg space-y-5">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-pink-300 border-b border-slate-800/80 pb-3">
            <BookOpen className="h-4 w-4" /> Landmark Publication Provenance
          </div>

          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
              1st Canonical Appearance
            </span>
            {entity.first_appearance ? (
              <div className="mt-1.5 flex items-center justify-between p-3 rounded border border-pink-500/30 bg-pink-950/20">
                <span className="text-sm font-semibold text-pink-200">
                  {entity.first_appearance}
                </span>
                <Link
                  href={`/wiki?q=${encodeURIComponent(entity.first_appearance)}`}
                  className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline"
                >
                  Locate Edition &rarr;
                </Link>
              </div>
            ) : (
              <p className="mt-1 text-sm text-slate-400">Canonical debut publication documented in core archive.</p>
            )}
          </div>

          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
              Creator Lineage
            </span>
            <p className="mt-1 text-sm font-semibold text-slate-200">
              {entity.creators || "Historical contributor records cataloged in publication ledger"}
            </p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
              Continuity / Reality Code
            </span>
            <p className="mt-1 text-sm text-slate-300 font-mono">
              {entity.reality || "Prime Continuity"}
            </p>
          </div>
        </section>

        {/* Narrative Dossier Summary */}
        <section className="border border-slate-800 bg-[#0b0f15] p-6 rounded-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-300 border-b border-slate-800/80 pb-3">
              <Compass className="h-4 w-4" /> Encyclopedia Dossier & Lore
            </div>
            <div className="mt-4 text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {entity.summary}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              Verified Entity Record
            </span>
            <Link
              href={`/comics?q=${encodeURIComponent(entity.title)}`}
              className="text-xs font-mono text-pink-400 hover:text-pink-300 inline-flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" /> Search Active Comic Equities &rarr;
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
