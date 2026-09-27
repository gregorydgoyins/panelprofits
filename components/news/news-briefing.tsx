import { LinkedBriefing } from "@/components/news/linked-briefing";
import Link from "next/link";
import { Award, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { type EntityWikiDef } from "@/lib/news/entities";
import { selectAuthorForStory, generateAuthorMarketPrediction } from "@/lib/news/authors";

function dateLabel(value: string | null) {
  if (!value) return "Publication date unavailable";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function NewsBriefing({
  id,
  headline,
  summary,
  source,
  sourceUrl,
  author,
  publishedAt,
  entities,
}: {
  id?: string;
  headline: string;
  summary: string | null;
  source: string;
  sourceUrl: string;
  author: string | null;
  publishedAt: string | null;
  entities: EntityWikiDef[];
}) {
  const reportText = summary || `The available source record identifies this report as “${headline}.” No longer source excerpt was supplied to the newsroom record.`;
  const sentences = reportText.split(/(?<=[.!?])\s+/).map((sentence) => sentence.trim()).filter(Boolean);
  const paragraphs = sentences.reduce<string[]>((groups, sentence, index) => {
    const groupIndex = Math.floor(index / 3);
    groups[groupIndex] = `${groups[groupIndex] || ""}${groups[groupIndex] ? " " : ""}${sentence}`;
    return groups;
  }, []).slice(0, 12);
  const sharedLinkedTerms = new Set<string>();

  const assignedAuthor = selectAuthorForStory(source, id || headline);
  const prediction = generateAuthorMarketPrediction(id || headline, source, headline, summary);

  return (
    <div className="mt-8 space-y-6 border-l-2 border-amber-300/70 bg-amber-950/10 px-5 py-6 sm:px-7">
      <div className="border-b border-amber-900/40 pb-4 text-[10px] uppercase tracking-[0.14em] text-amber-200">
        <p>{source}{author ? ` · ${author}` : ""}</p>
        <p className="mt-1 text-slate-500">{dateLabel(publishedAt)} · <a href={sourceUrl} target="_blank" rel="noreferrer" className="text-amber-200 underline underline-offset-2 hover:text-amber-100">Source article</a></p>
        {entities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {entities.slice(0, 10).map((entity) => (
              <Link key={entity.term} prefetch href={entity.wikiPath} className="inline-flex items-center gap-1 border border-amber-300/50 px-2 py-1 text-[9px] tracking-[0.08em] text-amber-200 normal-case rounded bg-amber-950/40">
                <span>{entity.term}</span>
                {entity.ticker && <span className="font-mono text-amber-400 font-bold uppercase">({entity.ticker})</span>}
              </Link>
            ))}
          </div>
        )}
      </div>

      <section>
        <div className="space-y-4 text-base leading-8 text-slate-300">
          {paragraphs.map((paragraph, index) => (
            <p key={`${paragraph.slice(0, 32)}-${index}`}>
              <LinkedBriefing text={paragraph} entities={entities} linkedSet={sharedLinkedTerms} />
            </p>
          ))}
        </div>
      </section>

      {/* DEDICATED MARKET RIPPLE PROJECTION SECTION */}
      <div className="mt-8 rounded border border-amber-500/30 bg-[#080B12] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-300">
              Market Ripple Projection // {assignedAuthor.name}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {assignedAuthor.role}
          </span>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-slate-400">
          Below is {assignedAuthor.name}&apos;s dedicated market assessment predicting how this news story will ripple across related equity tickers, key issue baskets, and collectible assets:
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {prediction.ripples.map((ripple, idx) => (
            <div key={idx} className="rounded border border-slate-800/80 bg-[#06070B] p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-amber-300">{ripple.ticker}</span>
                  <span className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    ripple.direction === "up" ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/40" :
                    ripple.direction === "down" ? "bg-rose-950/60 text-rose-300 border border-rose-500/40" :
                    "bg-slate-800/60 text-slate-300 border border-slate-600/40"
                  }`}>
                    {ripple.direction === "up" && <TrendingUp className="h-3 w-3" />}
                    {ripple.direction === "down" && <TrendingDown className="h-3 w-3" />}
                    {ripple.direction === "flat" && <Minus className="h-3 w-3" />}
                    {ripple.percentageDelta} ({ripple.magnitude})
                  </span>
                </div>
                <p className="mt-1 text-xs font-medium text-slate-200">{ripple.assetName}</p>
                <p className="mt-2 text-xs text-slate-400 leading-normal">{ripple.rationale}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
