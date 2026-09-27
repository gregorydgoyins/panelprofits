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
  const reportText = summary || `Source record for "${headline}".`;
  const paragraphs = summary ? summary.split("\n\n").filter(Boolean) : [reportText];
  const sharedLinkedTerms = new Set<string>();

  return (
    <div className="mt-8 space-y-6 border-l-2 border-amber-300/70 bg-amber-950/10 px-5 py-6 sm:px-7">
      <div className="border-b border-amber-900/40 pb-4 text-[10px] uppercase tracking-[0.14em] text-amber-200">
        <p>{source}{author ? ` · ${author}` : ""}</p>
        <p className="mt-1 text-slate-500">{dateLabel(publishedAt)} · <a href={sourceUrl} target="_blank" rel="noreferrer" className="text-amber-200 underline underline-offset-2 hover:text-amber-100">Source article</a></p>
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
