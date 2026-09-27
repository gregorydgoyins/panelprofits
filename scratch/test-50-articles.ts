import { getNewsStories, getNewsStory } from "../lib/news/feed";

async function test50Articles() {
  console.log("Fetching up to 50 active news stories from database/store...");
  const stories = await getNewsStories(50, false);
  console.log(`Retrieved ${stories.length} stories. Generating 3-pass articles...\n`);

  const results = [];
  for (let i = 0; i < stories.length; i++) {
    const s = stories[i];
    const fullStory = await getNewsStory(s.id);
    if (!fullStory || !fullStory.summary) {
      results.push({ index: i + 1, id: s.id, headline: s.headline, status: "FAILED_OR_EMPTY" });
      continue;
    }

    const paragraphs = fullStory.summary.split("\n\n");
    const linkMatches = (fullStory.summary.match(/<a /g) || []).length;
    const tickerMatches = (fullStory.summary.match(/title="[^"]+\(\$[A-Z0-9_:]+\)"/g) || []).length;

    results.push({
      index: i + 1,
      id: s.id,
      source: fullStory.source,
      author: fullStory.author,
      headline: fullStory.headline.slice(0, 70),
      paragraphCount: paragraphs.length,
      characterLength: fullStory.summary.length,
      linksCreated: linkMatches,
      tickersCreated: tickerMatches,
      status: paragraphs.length >= 4 && fullStory.summary.length >= 500 ? "PASS (4+ Paras, >500 chars)" : "WARN",
    });
  }

  console.log(JSON.stringify(results, null, 2));
}

test50Articles().catch(console.error);
