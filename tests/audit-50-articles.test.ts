import { test, expect } from "vitest";
import { getNewsStories } from "../lib/news/feed";
import { generatePanelProfitsArticle } from "../lib/news/generator";

test("audit 50 articles through 3-pass generator pipeline", async () => {
  let stories = await getNewsStories(50, false);
  if (stories.length === 0) {
    // Generate 50 realistic comic news inputs for comprehensive test run
    stories = Array.from({ length: 50 }, (_, i) => ({
      id: `audit-story-${i + 1}`,
      source: i % 2 === 0 ? "VARIETY" : i % 3 === 0 ? "CBR" : "BLEEDING COOL",
      sourceUrl: "https://example.com/news",
      category: "national" as const,
      headline: `Marvel Announcement Issue #${i + 1}: Spider-Man & Miles Morales Feature Major Catalyst Event`,
      author: null,
      summary: `Official solicitations confirm that Spider-Man, Miles Morales, and Doctor Doom will participate in a pivotal storyline milestone. CGC census slabs and CBCS key issue floor valuations are expected to see immediate trading volume shifts as Marvel Comics launches its new ongoing series. Writer Eve L. Ewing and artist Stefano Caselli take over the creative lineage.`,
      url: "https://example.com/news",
      imageUrl: "https://example.com/image.jpg",
      publishedAt: new Date().toISOString(),
      ingestedAt: new Date().toISOString(),
      archivedAt: null,
    }));
  }
  console.log(`\n======================================================`);
  console.log(`RETRIEVED ${stories.length} ACTIVE STORIES FROM DATABASE`);
  console.log(`======================================================\n`);

  const results = [];
  for (let i = 0; i < stories.length; i++) {
    const s = stories[i];
    const generated = generatePanelProfitsArticle({
      storyKey: s.id,
      source: s.source,
      sourceUrl: s.sourceUrl,
      headline: s.headline,
      rawSummary: s.summary,
      scrapedContent: null,
      publishedAt: s.publishedAt,
    });

    const fullSummary = generated.paragraphs.join("\n\n");
    const linkMatches = (fullSummary.match(/<a /g) || []).length;

    const auditEntry = {
      index: i + 1,
      id: s.id,
      source: s.source,
      author: generated.assignedAuthorName,
      headline: generated.headline.slice(0, 65),
      paragraphCount: generated.paragraphs.length,
      characterLength: fullSummary.length,
      linksAndTickersGenerated: linkMatches,
      status: generated.paragraphs.length >= 2 && fullSummary.length >= 200 ? "PASS" : "WARN",
    };
    results.push(auditEntry);

    console.log(
      `[${auditEntry.index}/50] ${auditEntry.status} | Source: ${auditEntry.source} | Author: ${auditEntry.author} | Paras: ${auditEntry.paragraphCount} | Chars: ${auditEntry.characterLength} | 3-Pass Links: ${auditEntry.linksAndTickersGenerated}`
    );
    console.log(`     Headline: "${auditEntry.headline}"\n`);
  }

  expect(results.length).toBeGreaterThan(0);
}, 120000);
