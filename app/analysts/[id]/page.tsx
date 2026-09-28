import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Briefcase, FileText } from "lucide-react";
import { AUTHOR_PERSONAS } from "@/lib/news/authors";
import { getNewsStories, type NewsStory } from "@/lib/news/feed";

export function generateStaticParams() {
  return AUTHOR_PERSONAS.map((p) => ({ id: p.id }));
}

export default async function AnalystPage(props: {
  params: Promise<{ id: string | string[] }> | { id: string | string[] };
}) {
  const resolvedParams = await props.params;
  const rawId = Array.isArray(resolvedParams?.id) ? resolvedParams.id[0] : resolvedParams?.id;
  const id = typeof rawId === "string" ? decodeURIComponent(rawId).toLowerCase().trim() : "";

  const analyst = AUTHOR_PERSONAS.find(
    (p) => p.id.toLowerCase() === id || p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === id
  );

  if (!analyst) {
    notFound();
  }

  let analystStories: NewsStory[] = [];
  try {
    const allStories = await getNewsStories(50);
    analystStories = allStories.filter(
      (s) => s.author && s.author.toLowerCase() === analyst.name.toLowerCase()
    );
  } catch {
    analystStories = [];
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/news" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-cyan-400 hover:text-cyan-200">
        <ArrowLeft className="h-3.5 w-3.5" /> Newsroom
      </Link>

      <header className="mt-6 border-b border-slate-800 pb-8">
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-slate-950"
            style={{ backgroundColor: analyst.avatarColor }}
          >
            {analyst.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <span className={`inline-block rounded border px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold ${analyst.badgeBg} ${analyst.badgeBorder} ${analyst.badgeText}`}>
              {analyst.role}
            </span>
            <h1 className="mt-1 text-3xl font-semibold text-slate-100">{analyst.name}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{analyst.beat} · {analyst.yearsExperience} Years Market Experience</p>
          </div>
        </div>
      </header>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 border border-slate-800 bg-[#0b0f15] p-6 rounded-lg">
          <h2 className="text-sm uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-2">
            <Briefcase className="h-4 w-4" /> Analyst Profile
          </h2>
          <div className="mt-4 space-y-4 text-xs text-slate-300">
            <div>
              <span className="text-slate-500 block">Analytical Focus</span>
              <p className="mt-1 leading-5">{analyst.writingStyle.analysisFocus}</p>
            </div>
            <div>
              <span className="text-slate-500 block">Market Angle</span>
              <p className="mt-1 leading-5">{analyst.writingStyle.marketAngle}</p>
            </div>
            <div>
              <span className="text-slate-500 block">Implication Perspective</span>
              <p className="mt-1 leading-5">{analyst.writingStyle.implicationAngle}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 border border-slate-800 bg-[#0b0f15] p-6 rounded-lg">
          <h2 className="text-sm uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4" /> Coverage & Market Reports ({analystStories.length})
          </h2>
          <div className="divide-y divide-slate-800">
            {analystStories.map((story) => (
              <div key={story.id} className="py-4">
                <Link href={`/news/${story.id}`} className="text-base text-slate-100 hover:text-cyan-300 font-medium">
                  {story.headline}
                </Link>
                <p className="mt-1 text-xs text-slate-400 line-clamp-2">{story.summary}</p>
                <span className="mt-2 inline-block text-[10px] text-slate-500">{story.publishedAt ? new Date(story.publishedAt).toLocaleDateString() : "Recent"} · {story.source}</span>
              </div>
            ))}
            {!analystStories.length && (
              <p className="py-6 text-xs text-slate-500">No published reports currently indexed for this analyst.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
