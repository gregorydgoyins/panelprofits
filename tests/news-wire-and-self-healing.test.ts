import { describe, expect, it } from "vitest";
import {
  shouldAttemptFetch,
  recordFetchFailure,
  recordFetchSuccess,
  evaluateArticleQuality,
  getAlternateFeedUrls,
  getNetworkHealthSummary,
} from "@/lib/news/self-healing";
import { CURATED_CHANNELS } from "@/lib/news/curated-sources";
import { SOURCES } from "@/lib/news/feed";

describe("Self-Healing Feed Architecture & Wire Diagnostics", () => {
  it("tracks healthy states and trips circuit breaker upon consecutive failures", () => {
    const testUrl = "https://example-unhealthy-comic-feed.org/rss";
    const testName = "UNHEALTHY FEED";

    expect(shouldAttemptFetch(testUrl)).toBe(true);

    // Record failures
    recordFetchFailure(testName, testUrl, "HTTP 500 Internal Error");
    recordFetchFailure(testName, testUrl, "HTTP 503 Service Unavailable");
    recordFetchFailure(testName, testUrl, "Network ETIMEDOUT");

    // Circuit should now trip open
    expect(shouldAttemptFetch(testUrl)).toBe(false);

    // Recording a recovery resets state to healthy
    recordFetchSuccess(testName, testUrl, 142);
    expect(shouldAttemptFetch(testUrl)).toBe(true);
  });

  it("resolves alternate feed mirror URLs for self-healing failover", () => {
    const alternates = getAlternateFeedUrls("https://bleedingcool.com/comics/feed/");
    expect(alternates.length).toBeGreaterThan(0);
    expect(alternates).toContain("https://bleedingcool.com/rss.xml");
  });

  it("selectively evaluates article quality, admitting substantive items and rejecting junk", () => {
    // Substantive comic articles
    const valid1 = evaluateArticleQuality(
      "Marvel Announces New X-Men Series by Gail Simone",
      "The ongoing mutant narrative continues following the Fall of X."
    );
    expect(valid1.admit).toBe(true);

    const valid2 = evaluateArticleQuality(
      "Heritage Auctions: Action Comics #1 Sells for Record High-Grade Sum",
      "The CGC 8.5 certified copy shattered prior census records."
    );
    expect(valid2.admit).toBe(true);

    const valid3 = evaluateArticleQuality(
      "The Comics Grid: Semiotic Structures in Alan Moore's Watchmen",
      "An academic exploration of 9-panel grid narrative pacing in graphic fiction."
    );
    expect(valid3.admit).toBe(true);

    // Reject non-comic / sports / gadget / clickbait
    const reject1 = evaluateArticleQuality(
      "PWI 500 Unveils 2026 Professional Wrestling Rankings",
      "Full breakdown of wrestling performers."
    );
    expect(reject1.admit).toBe(false);

    const reject2 = evaluateArticleQuality(
      "Best Noise-Cancelling Earphones and Smartwatch Deals for Black Friday",
      "Top electronics discounts on AirPods and vacuums."
    );
    expect(reject2.admit).toBe(false);
  });

  it("enforces multi-angle coverage across all 7 critical content sectors", () => {
    const angles = new Set(CURATED_CHANNELS.map((c) => c.angle));
    expect(angles).toContain("scholarly");
    expect(angles).toContain("critical_review");
    expect(angles).toContain("creator_newsletter");
    expect(angles).toContain("secondary_market");
    expect(angles).toContain("video_essay");
    expect(angles).toContain("publisher_bulletin");
    expect(angles).toContain("industry_trade");
  });

  it("exposes unified deduplicated feed syndication across more than 230 sources", () => {
    expect(SOURCES.length).toBeGreaterThanOrEqual(230);
    const health = getNetworkHealthSummary();
    expect(health).toHaveProperty("totalMonitored");
    expect(health).toHaveProperty("healthyCount");
    expect(health).toHaveProperty("uptimePercentage");
  });
});
