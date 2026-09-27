import { LinkedBriefing } from "@/components/news/linked-briefing";
import Link from "next/link";
import { type EntityWikiDef } from "@/lib/news/entities";

function dateLabel(value: string | null) {
  if (!value) return "Publication date unavailable";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function NewsBriefing({
  headline,
  summary,
  source,
  sourceUrl,
  author,
  publishedAt,
  entities,
}: {
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
    </div>
  );
}
