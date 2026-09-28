import Link from "next/link";
import { ArrowLeft, Video, UserCheck, Play } from "lucide-react";
import { getNewsStories } from "@/lib/news/feed";
import { evaluateStoryVideoActivation } from "@/lib/news/broadcast-selection";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Video Broadcast Archive // Research Terminal | Panel Profits",
  description: "Archive of live newsroom presenter video broadcasts and anchor floor reports.",
};

export default async function VideoArchivePage() {
  const stories = await getNewsStories(60);
  const videoStories = stories
    .map((s) => ({ story: s, video: evaluateStoryVideoActivation(s.id, s.source, s.headline, s.summary) }))
    .filter((item) => item.video.isVideoActive);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <Link href="/news" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-cyan-300 hover:text-cyan-200 mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Newsroom Desk
      </Link>
      <header className="border-b border-slate-800 pb-7">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.28em] text-rose-300">
          <Video className="h-4 w-4 text-rose-500 animate-pulse" /> Live Broadcast Floor // Video Archive
        </div>
        <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-slate-100">
          Presenter Video Archive
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
          Replay anchor broadcasts, studio market briefs, and high-energy breaking catalyst reports from the Panel Profits broadcast desk.
        </p>
      </header>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videoStories.map(({ story, video }) => (
          <Link
            key={story.id}
            href={`/news/${story.id}`}
            className="group overflow-hidden rounded border border-slate-800 bg-[#080C14] hover:border-cyan-500/50 transition-colors"
          >
            <div className="relative aspect-video w-full bg-[#04060A]">
              <img
                src={video.presenter.avatarImage}
                alt={video.presenter.name}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full bg-cyan-600/80 text-white flex items-center justify-center group-hover:bg-cyan-500 transition-colors shadow-lg">
                  <Play className="h-5 w-5 fill-current ml-0.5" />
                </div>
              </div>
              <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider bg-cyan-950/80 border border-cyan-500/60 text-cyan-300 rounded">
                {video.storyCategoryTag}
              </span>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-400">
                <UserCheck className="h-3 w-3" />
                <span>{video.presenter.name} · {video.presenter.role}</span>
              </div>
              <h2 className="mt-2 text-sm font-semibold text-slate-100 group-hover:text-rose-200 line-clamp-2">
                {story.headline}
              </h2>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
