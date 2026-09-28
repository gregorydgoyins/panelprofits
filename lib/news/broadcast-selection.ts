import { LEAD_BROADCAST_ANCHOR, type PresenterAvatar } from "@/lib/news/presenters";

export interface BroadcastVideoDecision {
  isVideoActive: boolean;
  presenter: PresenterAvatar;
  storyCategoryTag: string;
}

/**
 * Determines whether a story qualifies for live video broadcast.
 * Only genuine breaking catalysts and high-velocity market events activate the live video desk.
 * Standard wire reporting remains clean, fast, and editorial-focused without video clutter.
 */
export function evaluateStoryVideoActivation(
  storyId: string,
  source: string,
  headline: string,
  summary: string | null
): BroadcastVideoDecision {
  const text = `${headline} ${summary || ""}`.toLowerCase();

  // High-energy breaking market catalysts that qualify for live video broadcast
  const isBreakingCatalyst = /breakout|breaking|auction record|shatters record|all-time record|debut|first appearance|billion|box office record|studio acquisition/i.test(text);

  const isVideoActive = isBreakingCatalyst;
  const presenter = LEAD_BROADCAST_ANCHOR;
  const categoryTag = isBreakingCatalyst
    ? "BREAKING CATALYST // LIVE BROADCAST"
    : "FEATURED WIRE // EDITORIAL DESK";

  return {
    isVideoActive,
    presenter,
    storyCategoryTag: categoryTag,
  };
}
