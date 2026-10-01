import { sanitizeHeadline, sanitizeSummary, sanitizeNewsText } from "./sanitize";

export interface AudioBriefOptions {
  headline: string;
  summary?: string | null;
  source?: string | null;
  catalystReasoning?: string | null;
}

const WIRE_PREFIX_REGEX = /^(breaking news|exclusive|report|watch|view|review|update|alert|video|preview|just in):\s*/i;

const PROMO_JUNK_REGEX = /\b(patreon|tier|tiers|sponsor|sponsors|giveaway|giveaways|fan mail|po box|merch|merchandise|discount code|promo code|click here|read more|subscribe|subscription|discord|ama|private consultation|sign up|affiliate|courtesy|advertisement|sponsored|check out our|check out)\b/i;

/**
 * Synthesizes a clean, natural two-sentence spoken executive brief for news audio playback.
 * Eliminates promotional fluff, URLs, email addresses, Patreon tiers, and repetitive boilerplate.
 *
 * Result is typically 25 to 40 words, taking 10 to 14 seconds at natural speaking pace.
 */
export function createTwoSentenceAudioBrief({
  headline,
  summary,
  source,
  catalystReasoning,
}: AudioBriefOptions): string {
  // --- SENTENCE 1: Lead Headline ---
  let s1 = sanitizeHeadline(headline || "");
  s1 = s1.replace(WIRE_PREFIX_REGEX, "").trim();

  // Ensure trailing punctuation
  if (!/[.!?]$/.test(s1)) {
    s1 += ".";
  }

  // --- SENTENCE 2: Key Takeaway or Context ---
  let cleanSum = sanitizeSummary(summary || "") || "";

  // Strip URLs, emails, hashtags, and mailing addresses
  cleanSum = cleanSum
    .replace(/(?:https?:\/\/|www\.)\S+/gi, "")
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, "")
    .replace(/#\w+/g, "")
    .replace(/\bP\.?O\.?\s*Box\s*\d+[^.,]*/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  // Split into candidate sentences
  const rawSentences = cleanSum
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const headlineNormalized = s1.toLowerCase().replace(/[^a-z0-9]/g, "");

  const candidates = rawSentences.filter((s) => {
    if (s.length < 8) return false;
    if (PROMO_JUNK_REGEX.test(s)) return false;

    // Discard sentences that are practically identical to the headline
    const sNormalized = s.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (sNormalized === headlineNormalized) return false;
    if (headlineNormalized.length > 15 && sNormalized.startsWith(headlineNormalized)) return false;

    return true;
  });

  let s2 = "";
  if (candidates.length > 0) {
    let candidate = candidates[0];

    // Convert informal/vlogger first-person idioms to professional third-person broadcast phrasing
    candidate = candidate
      .replace(/^today i get to announce\b/i, "The announcement details")
      .replace(/^in this video,?\s*(i|we)?\b/i, "The report")
      .replace(/^i show\b/i, "The feature highlights")
      .replace(/^i take a look at\b/i, "The report reviews")
      .replace(/\bi show\b/i, "the feature highlights")
      .replace(/^we look at\b/i, "The coverage examines")
      .replace(/^join us as we\b/i, "The feature")
      .trim();

    // Clean leading conjunctions or partial descriptors
    if (/^(comes with|features|includes|adds)\b/i.test(candidate)) {
      candidate = "The upcoming release " + candidate.charAt(0).toLowerCase() + candidate.slice(1);
    } else if (
      candidate.length < 40 &&
      !/^[A-Z][a-z]+ (is|has|will|was|are|were|announced|revealed|features|includes)\b/.test(candidate) &&
      !candidate.startsWith("The ")
    ) {
      candidate = "The report notes that " + candidate.charAt(0).toLowerCase() + candidate.slice(1);
    }

    // Strip trailing exclamation marks if excessive, normalize to period
    candidate = candidate.replace(/!+$/, ".");
    if (!/[.!?]$/.test(candidate)) {
      candidate += ".";
    }

    s2 = candidate;
  } else if (catalystReasoning && catalystReasoning.trim().length > 10) {
    // If summary lacked clean sentences, extract first sentence from catalyst reasoning
    const catSentences = sanitizeNewsText(catalystReasoning)
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    s2 = catSentences[0] || "";
    if (s2 && !/[.!?]$/.test(s2)) s2 += ".";
  }

  // Graceful fallback if no secondary sentence could be derived
  if (!s2 || s2.length < 10) {
    s2 = "The development is expected to stimulate secondary market interest and trading activity across related titles.";
  }

  return `${s1} ${s2}`.trim();
}
