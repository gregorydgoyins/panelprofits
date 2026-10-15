import { describe, expect, it } from "vitest";
import { findVideos } from "@/lib/sniper/videos";
import { researchTitle, videoTopic } from "@/lib/sniper/research-title";

describe("Sniper related research", () => {
  it("removes publisher prefixes while preserving actual titles", () => {
    expect(researchTitle("Dynamite Queen Sonja")).toBe("Queen Sonja");
    expect(researchTitle("DC Comics Presents")).toBe("DC Comics Presents");
    expect(videoTopic("Dynamite Queen Sonja")).toBe("Red Sonja");
  });
  it("finds character-related videos and returns exactly one separate explainer", async () => {
    const queries: string[] = [];
    const videos = await findVideos({ series: "Dynamite Queen Sonja", issue: "1" }, {
      apiKey: "test-only",
      cacheGet: async () => null,
      cacheSet: async () => {},
      fetchFn: (async (url: string) => {
        const q = new URL(url).searchParams.get("q")!; queries.push(q);
        const titles = q.includes("Red Sonja") ? ["Red Sonja Comics History", "Unrelated movie"] : q.includes("profit") ? ["Comic reselling fees and profit", "Another profit video"] : [];
        return new Response(JSON.stringify({ items: titles.map((title, n) => ({ id: { videoId: `${q}-${n}` }, snippet: { title, channelTitle: "Research" } })) }));
      }) as typeof fetch,
    });
    expect(queries.some(q => q.startsWith("Dynamite"))).toBe(false);
    expect(videos.filter(v => v.kind === "series").map(v => v.title)).toEqual(["Red Sonja Comics History"]);
    expect(videos.filter(v => v.kind === "explainer")).toHaveLength(1);
  });
});
