import { getNewsStories } from "@/lib/news/feed";
import { Newsroom } from "@/components/news/newsroom";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Newsroom // Narrative Engine | Panel Profits",
  description: "Live newsroom wire and narrative market analysis.",
};

export default async function NewsroomPage() {
  const stories = await getNewsStories(60);

  return <Newsroom stories={stories} />;
}
