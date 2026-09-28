import { LinkedBriefing } from "@/components/news/linked-briefing";
import Link from "next/link";
import { type EntityWikiDef } from "@/lib/news/entities";

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
  const reportText = summary || `Source record for "${headline}".`;
  const paragraphs = summary ? summary.split("\n\n").filter(Boolean) : [reportText];
  const sharedLinkedTerms = new Set<string>();

  return (
    <div className="mt-8 space-y-6 border-l-2 border-cyan-500/60 bg-cyan-950/15 px-5 py-6 sm:px-7 rounded-r">
      <div className="border-b border-slate-800 pb-4 text-[10px] uppercase tracking-[0.14em] text-cyan-300 font-mono">
        <p>{source}{author ? ` · ${author}` : ""}</p>
        <p className="mt-1 text-slate-500 font-sans">
          {dateLabel(publishedAt)} ·{" "}
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 underline underline-offset-2 hover:text-cyan-200 transition-colors"
          >
            Source article
          </a>
        </p>
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
