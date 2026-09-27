import { PRESENTERS_REGISTRY, type PresenterAvatar } from "@/lib/news/presenters";

export interface BroadcastVideoDecision {
  isVideoActive: boolean;
  presenter: PresenterAvatar;
  storyCategoryTag: string;
}

/**
 * Determines whether a story qualifies for video broadcast based on topic energy,
 * and routes it to a non-repeating presenter from the 15-avatar registry.
 */
export function evaluateStoryVideoActivation(
  storyId: string,
  source: string,
  headline: string,
  summary: string | null
): BroadcastVideoDecision {
  const text = `${headline} ${summary || ""}`;
  const isHighEnergy = /first|debut|breakout|record|death|return|villain|movie|trailer|option|deal|announc/i.test(text);

  // Deterministic seed from storyId + source
  let seed = 0;
  const hashStr = `${storyId}:${source}:${headline}`;
  for (let i = 0; i < hashStr.length; i++) {
    seed = (seed << 5) - seed + hashStr.charCodeAt(i);
    seed |= 0;
  }
  const randVal = Math.abs(seed) % 100;

  // Suppress video player unless a verified broadcast asset exists
  const isVideoActive = false;

  // Route presenter: Lead Anchor Alex Morgan gets top priority on Breaking / Record stories
  let presenter: PresenterAvatar;
  if (/record|breakout|breaking|option/i.test(headline)) {
    presenter = PRESENTERS_REGISTRY[0]; // Alex Morgan
  } else {
    // Non-repeating rotation index across the 15 presenters
    const index = Math.abs(seed) % PRESENTERS_REGISTRY.length;
    presenter = PRESENTERS_REGISTRY[index];
  }

  const categoryTag = isHighEnergy ? "BREAKING CATALYST // LIVE BROADCAST" : "FEATURED WIRE // SPECIAL REPORT";

  return {
    isVideoActive,
    presenter,
    storyCategoryTag: categoryTag,
  };
}
