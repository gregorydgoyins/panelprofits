import crypto from "node:crypto";
import { type EntityWikiDef, findNewsEntities } from "@/lib/news/entities";

export interface AuthorPersona {
  id: string;
  name: string;
  role: string;
  beat: string;
  yearsExperience: number; // Seniority in position
  avatarColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  writingStyle: {
    introStyle: string;
    analysisFocus: string;
    implicationAngle: string;
    marketAngle: string;
  };
}

export const AUTHOR_PERSONAS: AuthorPersona[] = [
  {
    id: "marcus-vance",
    name: "Marcus Vance",
    role: "Senior Market Analyst",
    beat: "Key Speculation & First Appearances",
    yearsExperience: 18,
    avatarColor: "#0284C7",
    badgeBg: "bg-sky-950/60",
    badgeBorder: "border-sky-500/50",
    badgeText: "text-sky-300",
    writingStyle: {
      introStyle: "Focusing on rapid market valuation shifts and key issue movement.",
      analysisFocus: "High-volume key issue velocity and immediate collector demand spikes.",
      implicationAngle: "Short-term flip opportunities vs. long-term holding risks.",
      marketAngle: "Watch for rapid sales volume escalation on graded slab markets.",
    },
  },
  {
    id: "elena-rostova",
    name: "Elena Rostova",
    role: "Hollywood & Rights Correspondent",
    beat: "Film/TV Optioning & Media Adaptations",
    yearsExperience: 14,
    avatarColor: "#E11D48",
    badgeBg: "bg-rose-950/60",
    badgeBorder: "border-rose-500/50",
    badgeText: "text-rose-300",
    writingStyle: {
      introStyle: "Analyzing studio option announcements and media adaptation ripples.",
      analysisFocus: "Corporate production cycles, casting announcements, and option rights.",
      implicationAngle: "Pre-trailer spec runs versus post-release sell-offs.",
      marketAngle: "Uncertified raw copies of key debut issues moving into secondary auction circuits.",
    },
  },
  {
    id: "devon-knight",
    name: "Devon Knight",
    role: "Modern Era Specialist",
    beat: "Indie Hits, Variant Ratios & Small Press",
    yearsExperience: 6,
    avatarColor: "#10B981",
    badgeBg: "bg-emerald-950/60",
    badgeBorder: "border-emerald-500/50",
    badgeText: "text-emerald-300",
    writingStyle: {
      introStyle: "Tracking independent publisher surges and incentive variant heat.",
      analysisFocus: "Print run scarcity, 1:25/1:50 variant ratios, and creator-owned breakouts.",
      implicationAngle: "Secondary market premiums driven by low initial order allocations.",
      marketAngle: "Rarer retailer incentive covers showing immediate 3x-5x MSRP secondary gains.",
    },
  },
  {
    id: "sarah-chen",
    name: "Sarah Chen",
    role: "Global Content Strategist",
    beat: "Manga, Anime Imports & Manhwa Trends",
    yearsExperience: 9,
    avatarColor: "#06B6D4",
    badgeBg: "bg-cyan-950/60",
    badgeBorder: "border-cyan-500/50",
    badgeText: "text-cyan-300",
    writingStyle: {
      introStyle: "Evaluating international cross-border licensing and print distribution demand.",
      analysisFocus: "First-print English localizations, anime adapt announcements, and Webtoon physical runs.",
      implicationAngle: "Rapid exhaustion of first-print distributor stock driving secondary scarcity.",
      marketAngle: "Early volume first printings exhibiting strong holding power among younger collectors.",
    },
  },
  {
    id: "thaddeus-pryor",
    name: "Thaddeus Pryor",
    role: "Vault & Vintage Historian",
    beat: "Golden, Silver & Bronze Age Collectibles",
    yearsExperience: 24,
    avatarColor: "#6366F1",
    badgeBg: "bg-indigo-950/60",
    badgeBorder: "border-indigo-500/50",
    badgeText: "text-indigo-300",
    writingStyle: {
      introStyle: "Contextualizing modern industry signals against historic vintage blue-chip trends.",
      analysisFocus: "Censorship history, key creator debuts, and foundational canon shifts.",
      implicationAngle: "Blue-chip vintage stability relative to volatile modern speculative runs.",
      marketAngle: "High-grade CGC/CBCS slab auction trends showing consistent historical floor resistance.",
    },
  },
  {
    id: "jax-mercer",
    name: "Jax Mercer",
    role: "Secondary Market Pulse",
    beat: "Auction House & eBay Realized Sales",
    yearsExperience: 11,
    avatarColor: "#8B5CF6",
    badgeBg: "bg-purple-950/60",
    badgeBorder: "border-purple-500/50",
    badgeText: "text-purple-300",
    writingStyle: {
      introStyle: "Breaking down actual realized sales data and live bid momentum.",
      analysisFocus: "Real-time completed auction prices, buy-it-now trends, and seller liquidity.",
      implicationAngle: "Market liquidity conditions and spread narrowing between raw and slabbed assets.",
      marketAngle: "Auction clearing prices indicating active consolidation phase.",
    },
  },
  {
    id: "claire-holloway",
    name: "Claire Holloway",
    role: "Retail & Distribution Analyst",
    beat: "Direct Market Orders & Previews Catalog",
    yearsExperience: 8,
    avatarColor: "#3B82F6",
    badgeBg: "bg-blue-950/60",
    badgeBorder: "border-blue-500/50",
    badgeText: "text-blue-300",
    writingStyle: {
      introStyle: "Examining comic shop ordering patterns and distributor FOC dynamics.",
      analysisFocus: "Final Order Cutoff spikes, retailer reorders, and publisher overprint policies.",
      implicationAngle: "Retailer under-ordering creating localized supply shortages.",
      marketAngle: "Second and third print announcements signaling sustained pull-list growth.",
    },
  },
  {
    id: "gideon-vane",
    name: "Gideon Vane",
    role: "Publishing Executive Editor",
    beat: "Corporate Restructuring & Crossover Events",
    yearsExperience: 19,
    avatarColor: "#64748B",
    badgeBg: "bg-slate-900/70",
    badgeBorder: "border-slate-600/50",
    badgeText: "text-slate-300",
    writingStyle: {
      introStyle: "Deconstructing editorial line re-launches and publisher event architecture.",
      analysisFocus: "Major crossover event anchors, line-wide tie-ins, and creative team rotations.",
      implicationAngle: "Core series sales velocity during multi-book publishing initiatives.",
      marketAngle: "Tie-in key issues experiencing temporary liquidity boosts during event runs.",
    },
  },
  {
    id: "zara-al-mansoor",
    name: "Zara Al-Mansoor",
    role: "Digital & Web3 Media Lead",
    beat: "Digital Comics, Webtoons & Tech Platforms",
    yearsExperience: 4,
    avatarColor: "#EC4899",
    badgeBg: "bg-pink-950/60",
    badgeBorder: "border-pink-500/50",
    badgeText: "text-pink-300",
    writingStyle: {
      introStyle: "Tracking digital platform readership transition to physical collectible demand.",
      analysisFocus: "Digital subscriber conversion rates, app metrics, and physical adaptation printings.",
      implicationAngle: "Massive digital reader bases driving sudden demand for debut physical prints.",
      marketAngle: "First physical printings of digital-native hits commanding significant premiums.",
    },
  },
  {
    id: "owen-st-clair",
    name: "Owen St. Clair",
    role: "Creator & Artist Spotter",
    beat: "Breakout Talent, Cover Art & Signings",
    yearsExperience: 7,
    avatarColor: "#F43F5E",
    badgeBg: "bg-rose-900/40",
    badgeBorder: "border-rose-600/50",
    badgeText: "text-rose-200",
    writingStyle: {
      introStyle: "Highlighting rising artistic talent and signature series cover art.",
      analysisFocus: "Cover artist popularity, convention signature demand, and artistic progression.",
      implicationAngle: "Cover-only purchases inflating print run demand independent of narrative content.",
      marketAngle: "Virgin cover variants and store exclusives showing distinct collector appreciation.",
    },
  },
  {
    id: "remington-cole",
    name: "Remington Cole",
    role: "Grade & Condition Auditor",
    beat: "CGC/CBCS 9.8 Census & Restoration",
    yearsExperience: 15,
    avatarColor: "#14B8A6",
    badgeBg: "bg-teal-950/60",
    badgeBorder: "border-teal-500/50",
    badgeText: "text-teal-300",
    writingStyle: {
      introStyle: "Inspecting census population reports and high-grade scarcity metrics.",
      analysisFocus: "9.8 vs 9.6 price ratios, pressing/cleaning potential, and restoration checks.",
      implicationAngle: "Census population growth putting downward pressure on mid-grade slabs.",
      marketAngle: "Top-tier 9.8 candidates remaining resilient despite raw market fluctuations.",
    },
  },
  {
    id: "beatrice-monroe",
    name: "Beatrice Monroe",
    role: "Macro Financial Analyst",
    beat: "Media Conglomerates, Mergers & Earnings",
    yearsExperience: 22,
    avatarColor: "#A855F7",
    badgeBg: "bg-purple-900/40",
    badgeBorder: "border-purple-600/50",
    badgeText: "text-purple-200",
    writingStyle: {
      introStyle: "Evaluating parent company earnings, licensing revenue, and IP valuations.",
      analysisFocus: "Corporate quarterly filings, streaming content budgets, and IP holding value.",
      implicationAngle: "Macro economic headwinds impacting discretionary collector spending.",
      marketAngle: "Parent brand IP strategy shifts creating long-term catalog repricing.",
    },
  },
  {
    id: "kaelen-voss",
    name: "Kaelen Voss",
    role: "Niche Speculation Strategist",
    beat: "Cameo Debuts, Team Origins & Retcons",
    yearsExperience: 5,
    avatarColor: "#14B8A6",
    badgeBg: "bg-teal-950/60",
    badgeBorder: "border-teal-500/50",
    badgeText: "text-teal-300",
    writingStyle: {
      introStyle: "Investigating debate around first full appearance vs. last-page cameo debuts.",
      analysisFocus: "Cameo vs full appearance distinction, retconned origin issues, and prototype cameos.",
      implicationAngle: "Debate over 'true first' status driving dual-issue market speculation.",
      marketAngle: "Debated cameo issues seeing secondary volatility until consensus establishes.",
    },
  },
  {
    id: "yuki-tanaka",
    name: "Yuki Tanaka",
    role: "Collector Community Pulse",
    beat: "Social Media Hype & Forum Sentiment",
    yearsExperience: 3,
    avatarColor: "#0284C7",
    badgeBg: "bg-sky-950/60",
    badgeBorder: "border-sky-500/50",
    badgeText: "text-sky-300",
    writingStyle: {
      introStyle: "Monitoring community sentiment, viral threads, and collector momentum.",
      analysisFocus: "Social media sentiment analysis, YouTube speculation buzz, and forum activity.",
      implicationAngle: "Viral momentum creating short-term FOMO buying cycles.",
      marketAngle: "Sentiment-driven price spikes requiring quick execution before cooling periods.",
    },
  },
  {
    id: "sterling-hayes",
    name: "Sterling Hayes",
    role: "Chief Narrative Officer",
    beat: "Executive Wire Synthesis & Market Overview",
    yearsExperience: 27,
    avatarColor: "#8B5CF6",
    badgeBg: "bg-purple-950/60",
    badgeBorder: "border-purple-500/50",
    badgeText: "text-purple-300",
    writingStyle: {
      introStyle: "Synthesizing macro industry movements into actionable intelligence.",
      analysisFocus: "Cross-sector narrative impacts, publisher market share, and broader industry health.",
      implicationAngle: "Overall market trends reinforcing strategic portfolio diversification.",
      marketAngle: "Market-wide indicators pointing to steady fundamental category strength.",
    },
  },
];

export function selectAuthorForStory(source: string, storyId: string): AuthorPersona {
  const normSource = source.toUpperCase();
  if (normSource.includes("CBR") || normSource.includes("BLEEDING COOL")) return AUTHOR_PERSONAS[0];
  if (normSource.includes("VARIETY") || normSource.includes("DEADLINE") || normSource.includes("THR")) return AUTHOR_PERSONAS[1];
  if (normSource.includes("SCREENRANT") || normSource.includes("GAMESRADAR")) return AUTHOR_PERSONAS[2];
  if (normSource.includes("ANN") || normSource.includes("CRUNCHYROLL") || normSource.includes("ANIME")) return AUTHOR_PERSONAS[3];
  if (normSource.includes("COMICBOOK INVEST") || normSource.includes("FIRSTCOMICS")) return AUTHOR_PERSONAS[4];
  if (normSource.includes("COMICBOOK") || normSource.includes("COMIC VINE")) return AUTHOR_PERSONAS[5];
  if (normSource.includes("ICV2") || normSource.includes("AIPT")) return AUTHOR_PERSONAS[6];
  if (normSource.includes("BEAT") || normSource.includes("JOURNAL")) return AUTHOR_PERSONAS[7];
  if (normSource.includes("POLYGON") || normSource.includes("IGN")) return AUTHOR_PERSONAS[8];
  if (normSource.includes("BROKEN FRONTIER") || normSource.includes("COMICSXF")) return AUTHOR_PERSONAS[9];

  let hash = 0;
  for (let i = 0; i < storyId.length; i++) {
    hash = (hash << 5) - hash + storyId.charCodeAt(i);
    hash |= 0;
  }
  return AUTHOR_PERSONAS[Math.abs(hash) % AUTHOR_PERSONAS.length];
}

export interface MarketAssetRipple {
  ticker: string;
  assetName: string;
  direction: "up" | "down" | "flat";
  magnitude: "slight" | "moderate" | "sharp";
  percentageDelta: string;
  rationale: string;
}

export interface AuthorMarketPrediction {
  author: AuthorPersona;
  accuracyRating: "Spot-On (High Accuracy)" | "Debatable (Mixed Signals)" | "Speculative Miss (Way Off)";
  historicalAccuracyScore: string;
  ripples: MarketAssetRipple[];
}

/**
 * Generates an Author's Market Prediction & Asset Ripple Projection.
 * Uses author seniority + story ID hash to determine randomized accuracy trait,
 * and projects slight/great movements across related asset tickers.
 */
export function generateAuthorMarketPrediction(
  storyId: string,
  source: string,
  headline: string,
  summary: string | null
): AuthorMarketPrediction {
  const author = selectAuthorForStory(source, storyId);
  const matchedEntities = findNewsEntities(headline, summary);

  // Deterministic seed from story ID + author ID
  let seed = 0;
  const hashStr = `${storyId}:${author.id}:${headline}`;
  for (let i = 0; i < hashStr.length; i++) {
    seed = (seed << 5) - seed + hashStr.charCodeAt(i);
    seed |= 0;
  }
  const randVal = Math.abs(seed) % 100;

  // Seniority weights baseline accuracy, but randomness ensures anyone can hit or miss
  // Seniority 20+ yrs: 55% Spot-On, 30% Debatable, 15% Miss
  // Seniority 10-19 yrs: 45% Spot-On, 35% Debatable, 20% Miss
  // Seniority < 10 yrs: 35% Spot-On, 40% Debatable, 25% Miss
  let accuracyRating: "Spot-On (High Accuracy)" | "Debatable (Mixed Signals)" | "Speculative Miss (Way Off)";
  let accuracyScoreNum = 0;

  if (author.yearsExperience >= 20) {
    if (randVal < 55) accuracyRating = "Spot-On (High Accuracy)";
    else if (randVal < 85) accuracyRating = "Debatable (Mixed Signals)";
    else accuracyRating = "Speculative Miss (Way Off)";
    accuracyScoreNum = 78 + (randVal % 18);
  } else if (author.yearsExperience >= 10) {
    if (randVal < 45) accuracyRating = "Spot-On (High Accuracy)";
    else if (randVal < 80) accuracyRating = "Debatable (Mixed Signals)";
    else accuracyRating = "Speculative Miss (Way Off)";
    accuracyScoreNum = 65 + (randVal % 22);
  } else {
    if (randVal < 35) accuracyRating = "Spot-On (High Accuracy)";
    else if (randVal < 75) accuracyRating = "Debatable (Mixed Signals)";
    else accuracyRating = "Speculative Miss (Way Off)";
    accuracyScoreNum = 52 + (randVal % 28);
  }

  const primaryEntity = matchedEntities[0] || { term: "Market Basket", ticker: "$BASKET", type: "market-concept" as const };
  const secondaryEntity = matchedEntities[1] || { term: "Key Issue Floor", ticker: "$KEY", type: "grading" as const };

  // Determine magnitude (slight or sharp/great movement) based on headline energy
  const isHighEnergy = /first|debut|breakout|record|death|return|villain|movie|trailer|option/i.test(headline);
  const magnitude1: "slight" | "moderate" | "sharp" = isHighEnergy ? ((randVal % 2 === 0) ? "sharp" : "moderate") : "slight";
  const magnitude2: "slight" | "moderate" | "sharp" = (randVal % 3 === 0) ? "sharp" : "slight";

  const ripples: MarketAssetRipple[] = [
    {
      ticker: primaryEntity.ticker || "$ASSET",
      assetName: `${primaryEntity.term} Assets / Related Key Basket`,
      direction: accuracyRating === "Speculative Miss (Way Off)" ? "down" : "up",
      magnitude: magnitude1,
      percentageDelta: "QUALITATIVE ANALYSIS",
      rationale: accuracyRating === "Spot-On (High Accuracy)"
        ? `Direct catalyst in this report is expected to drive demand for ${primaryEntity.term} key issues.`
        : accuracyRating === "Debatable (Mixed Signals)"
        ? `Market sentiment is split on whether the ${primaryEntity.term} catalyst translates to sustained interest.`
        : `Initial interest in ${primaryEntity.term} may face resistance as secondary market supply absorbs demand.`,
    },
    {
      ticker: secondaryEntity.ticker || "$KEY",
      assetName: `${secondaryEntity.term} Secondary Slabs & Raw Proxies`,
      direction: (randVal % 2 === 0) ? "flat" : (accuracyRating === "Speculative Miss (Way Off)" ? "up" : "down"),
      magnitude: magnitude2,
      percentageDelta: "QUALITATIVE ANALYSIS",
      rationale: (randVal % 2 === 0)
        ? `Collateral demand remains stable as attention stays focused on primary news headline assets.`
        : `Rippling effect across adjacent ${secondaryEntity.term} issues as speculative attention shifts.`,
    },
  ];

  return {
    author,
    accuracyRating,
    historicalAccuracyScore: `${accuracyScoreNum}%`,
    ripples,
  };
}
