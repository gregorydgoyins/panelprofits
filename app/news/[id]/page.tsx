import { ArrowLeft, Newspaper } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getNewsStory, shortNewsSource } from "@/lib/news/feed";
import { findNewsEntities } from "@/lib/news/entities";
import { NewsBriefing } from "@/components/news/news-briefing";
import { PresenterPlayer } from "@/components/news/PresenterPlayer";
import { evaluateStoryVideoActivation } from "@/lib/news/broadcast-selection";

export const dynamic = "force-dynamic";

export default async function NewsStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const story = await getNewsStory(id);
  if (!story) redirect("/news");

  const relatedEntities = findNewsEntities(story.headline, story.summary);
  const videoDecision = evaluateStoryVideoActivation(story.id, story.source, story.headline, story.summary);
  const hasEditorialImage = Boolean(story.imageUrl && !story.imageUrl.includes("google.com/s2/favicons"));
  const hasPublisherMark = Boolean(story.imageUrl?.includes("google.com/s2/favicons"));

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <Link
        href="/news"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-cyan-300 hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back to Newsroom
      </Link>
      <article className="mt-6 overflow-hidden border border-amber-300/90 bg-[#0b0f15] shadow-[0_0_38px_rgba(251,191,36,0.26)]">
        {hasEditorialImage && (
          <div className="border-b border-slate-800 bg-[#07090F] p-4 sm:p-6 flex justify-center">
            <img
              src={story.imageUrl!}
              alt={`${story.source} editorial artwork`}
              className="max-h-[380px] w-auto max-w-full rounded object-contain shadow-lg"
            />
          </div>
        )}
        {!hasEditorialImage && hasPublisherMark && (
          <div className="flex min-h-40 items-center gap-5 border-b border-amber-900/50 bg-[#121722] px-6 py-8 sm:px-10">
            <img
              src={story.imageUrl!}
              alt={`${story.source} publisher logo`}
              className="h-16 w-16 object-contain shrink-0"
            />
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-amber-300 font-mono font-medium">Publisher Attribution</p>
              <p className="mt-1 text-sm font-medium text-slate-200">{story.source}</p>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">Source attribution and original reporting metadata remain linked in the reading frame.</p>
            </div>
          </div>
        )}
        <div className="p-6 sm:p-10">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-amber-300 font-mono">
            <Newspaper className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{shortNewsSource(story.source)}</span>
          </div>
          <h1 className="mt-4 text-2xl font-semibold leading-tight text-slate-100 sm:text-4xl">{story.headline}</h1>
          
          {videoDecision.isVideoActive && (
            <div className="mt-8 max-w-3xl">
              <PresenterPlayer
                story={story}
                presenter={videoDecision.presenter}
                categoryTag={videoDecision.storyCategoryTag}
              />
            </div>
          )}

          <div className="mt-8">
            <NewsBriefing
              id={story.id}
              headline={story.headline}
              summary={story.summary}
              source={story.source}
              sourceUrl={story.url}
              author={story.author}
              publishedAt={story.publishedAt}
              entities={relatedEntities}
            />
          </div>


          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-5 text-xs text-slate-500">
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
              Source Attribution: {story.source}
            </span>
            <span className="text-slate-500">
              Publisher URL retained for source corroboration.
            </span>
          </div>
        </div>
      </article>
    </main>
  );
}

