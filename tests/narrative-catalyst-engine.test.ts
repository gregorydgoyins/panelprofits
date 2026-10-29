import { describe, it, expect } from "vitest";
import {
  executeNarrativeCatalystEngine,
  analyzeCatalystEvent,
} from "../lib/pricing/narrative-catalyst-engine";

describe("Phase 4: Narrative Catalyst & Revival Engine Verification Suite", () => {
  it("quantifies Abnormal Return (AR) and Cumulative Abnormal Return (CAR) for media trailer events", () => {
    const prices = [
      { date: "2026-05-01", price: 1000 },
      { date: "2026-05-15", price: 1020 },
      { date: "2026-06-01", price: 1050 }, // Event on June 02
      { date: "2026-06-05", price: 1350 }, // +28.5% post-trailer surge
      { date: "2026-06-20", price: 1400 },
    ];

    const event = {
      id: "ev-1",
      comicId: "test-debut",
      eventType: "TRAILER_DROP" as const,
      eventDate: "2026-06-02",
      headline: "Marvel Studios releases debut teaser trailer",
    };

    const study = analyzeCatalystEvent(event, prices);
    expect(study.abnormalReturnDay0).toBeDefined();
    expect(study.car5DayWindow).toBeGreaterThan(20);
    expect(study.postEventDecayStatus).toBe("PERMANENT_RERATING");
  });

  it("detects mean-reverting fade when speculative euphoria pops and retraces", () => {
    const prices = [
      { date: "2026-01-01", price: 500 },
      { date: "2026-02-01", price: 510 },
      { date: "2026-03-01", price: 520 }, // Casting rumor announced March 02
      { date: "2026-03-08", price: 750 }, // +44% spike
      { date: "2026-03-25", price: 530 }, // retraces nearly back to baseline
    ];

    const event = {
      id: "ev-2",
      comicId: "spec-book",
      eventType: "CASTING_ANNOUNCEMENT" as const,
      eventDate: "2026-03-02",
      headline: "Actor rumored for leading role",
    };

    const study = analyzeCatalystEvent(event, prices);
    expect(study.car5DayWindow).toBeGreaterThan(40);
    expect(study.postEventDecayStatus).toBe("MEAN_REVERTING_FADE");
  });

  it("enforces Zero Fake Data Covenant by returning UNMEASURED when no events are present", () => {
    const result = executeNarrativeCatalystEngine({
      comicId: "quiet-key",
      series: "Daredevil",
      issue: "1",
      events: [],
      priceHistory: [{ date: "2026-01-01", price: 2000 }],
    });

    expect(result.activeCatalystCount).toBe(0);
    expect(result.cumulativeMediaAlphaPct).toBeNull();
    expect(result.narrativeState).toBe("UNMEASURED");
  });
});
