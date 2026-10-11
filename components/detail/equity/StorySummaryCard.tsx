import { getStorySummary } from "@/lib/comics/story-summary";

interface StorySummaryCardProps {
  series: string;
  issueNumber: string;
  year: number | null;
  publisher: string | null;
  volume?: number | null;
  accent: string;
}

/**
 * Real story description for this exact issue, with its source. Renders nothing when no source has
 * one — no filler, no templated text.
 */
export default async function StorySummaryCard({ series, issueNumber, year, publisher, volume, accent }: StorySummaryCardProps) {
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

  return (
    <section
      aria-label="Story description"
      className="rounded-xl p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.35)", border: `1px solid ${accent}33` }}
    >
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <h2 className="text-[11px] font-mono uppercase tracking-widest" style={{ color: accent }}>
          Story{summary.storyTitle ? ` · “${summary.storyTitle}”` : ""}
        </h2>
      </div>
      <div className="space-y-2">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-sm leading-relaxed text-slate-200">
            {p}
          </p>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-slate-500">
        Source:{" "}
        <a href={summary.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="underline hover:text-slate-300">
          {summary.source}
        </a>
        {summary.license ? ` · ${summary.license}` : ""}
      </p>
    </section>
  );
}
