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
        if (!match || (key && localSet.has(key))) return <span key={`${part}-${index}`}>{part}</span>;
        if (key) localSet.add(key);

        const isDictionary = match.target === "dictionary";

        return (
          <span key={`${match.term}-${index}`} className="inline-flex items-center gap-0.5">
            <Link
              prefetch
              href={match.wikiPath}
              className={`font-medium transition-colors ${
                isDictionary
                  ? "text-cyan-200 underline decoration-cyan-400/70 underline-offset-4 hover:text-cyan-100"
                  : "text-amber-200 underline decoration-amber-500/70 underline-offset-4 hover:text-amber-100"
              }`}
            >
              {part}
            </Link>
            {match.ticker && (
              <span className="ml-1 px-1 py-0.2 text-[9px] font-mono tracking-tighter uppercase rounded border border-amber-500/40 bg-amber-950/40 text-amber-300 font-semibold">
                ({match.ticker})
              </span>
            )}
          </span>
        );
      })}
    </>
  );
}
