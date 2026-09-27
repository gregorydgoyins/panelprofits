import Link from "next/link";
import { type EntityWikiDef } from "@/lib/news/entities";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function LinkedBriefing({
  text,
  entities,
  linkedSet,
}: {
  text: string;
  entities: EntityWikiDef[];
  linkedSet?: Set<string>;
}) {
  const usableEntities = [...entities].sort((a, b) => b.term.length - a.term.length);
  if (!usableEntities.length) return <>{text}</>;

  const pattern = new RegExp(`(${usableEntities.map((e) => escapeRegExp(e.term)).join("|")})`, "gi");
  const localSet = linkedSet || new Set<string>();

  return (
    <>
      {text.split(pattern).map((part, index) => {
        const match = usableEntities.find((e) => e.term.toLowerCase() === part.toLowerCase());
        const key = match?.term.toLowerCase();

        if (!match) return <span key={`${part}-${index}`}>{part}</span>;

        const isFirstMention = key ? !localSet.has(key) : true;
        if (key) localSet.add(key);

        const isLexicon = match.target === "lexicon";

        // FIRST MENTION: Full hyperlinked Name ($TICKER) as a single seamless clickable link
        if (isFirstMention) {
          const displayLabel = match.ticker ? `${part} (${match.ticker})` : part;
          return (
            <Link
              key={`${match.term}-${index}`}
              prefetch
              href={match.wikiPath}
              className={`font-medium transition-colors ${
                isLexicon
                  ? "text-cyan-200 underline decoration-cyan-400/70 underline-offset-4 hover:text-cyan-100 font-mono"
                  : "text-amber-200 underline decoration-amber-500/70 underline-offset-4 hover:text-amber-100 font-mono font-semibold"
              }`}
            >
              {displayLabel}
            </Link>
          );
        }

        // REPEAT MENTION: Render bare Ticker Badge only
        if (match.ticker) {
          return (
            <Link
              key={`${match.term}-${index}`}
              prefetch
              href={match.wikiPath}
              className="ml-1 px-1 py-0.2 text-[9px] font-mono tracking-tighter uppercase rounded border border-amber-500/40 bg-amber-950/40 text-amber-300 font-semibold hover:border-amber-300 hover:text-amber-100 transition-colors"
              title={`${part} (${match.ticker})`}
            >
              {match.ticker}
            </Link>
          );
        }

        // Repeat mention without ticker
        return (
          <Link
            key={`${match.term}-${index}`}
            prefetch
            href={match.wikiPath}
            className="text-cyan-200 underline decoration-cyan-400/50 underline-offset-2 hover:text-cyan-100 transition-colors"
          >
            {part}
          </Link>
        );
      })}
    </>
  );
}
