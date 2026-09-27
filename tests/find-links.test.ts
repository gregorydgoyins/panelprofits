import { describe, it } from "vitest";
import { getNewsStories } from "@/lib/news/feed";
import { evaluateStoryVideoActivation } from "@/lib/news/broadcast-selection";

describe("Find Text and Video Story Links", () => {
  it("prints active text and video story links", async () => {
    const stories = await getNewsStories(30);
    console.log(`=== FOUND ${stories.length} ACTIVE STORIES ===`);
    let videoStory = null;
    let textStory = null;

    for (const s of stories) {
      const video = evaluateStoryVideoActivation(s.id, s.source, s.headline, s.summary);
      if (video.isVideoActive && !videoStory) {
        videoStory = { story: s, video };
      }
      if (!video.isVideoActive && !textStory) {
        textStory = { story: s, video };
      }
    }

    if (videoStory) {
      console.log("\n--- VIDEO STORY ---");
      console.log(`URL: https://comicbookstockexchange.com/news/${videoStory.story.id}`);
      console.log(`Headline: ${videoStory.story.headline}`);
      console.log(`Presenter: ${videoStory.video.presenter.name} (${videoStory.video.presenter.role})`);
    }

    if (textStory) {
      console.log("\n--- TEXT STORY ---");
      console.log(`URL: https://comicbookstockexchange.com/news/${textStory.story.id}`);
      console.log(`Headline: ${textStory.story.headline}`);
    }
  });
});
