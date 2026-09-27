import crypto from "node:crypto";

export interface AuthorPersona {
  id: string;
  name: string;
  role: string;
  beat: string;
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
  // --- TIER 1: HIGH FREQUENCY WIRES (CBR, SCREENRANT, COMICBOOK, BLEEDING COOL, VARIETY, DEADLINE) ---
  {
    id: "marcus-vance",
    name: "Marcus Vance",
    role: "Senior Market Analyst",
    beat: "Key Speculation & First Appearances",
    avatarColor: "#F59E0B",
    badgeBg: "bg-amber-950/60",
    badgeBorder: "border-amber-500/50",
    badgeText: "text-amber-300",
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
    avatarColor: "#D97706",
    badgeBg: "bg-amber-900/40",
    badgeBorder: "border-amber-600/50",
    badgeText: "text-amber-200",
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

  // --- TIER 2: MEDIUM FREQUENCY WIRES (IGN, THE BEAT, AIPT, GAMESRADAR, ICV2) ---
  {
    id: "claire-holloway",
    name: "Claire Holloway",
    role: "Retail & Distribution Analyst",
    beat: "Direct Market Orders & Previews Catalog",
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

  // --- TIER 3: SPECIALIZED / LONG-TAIL WIRES ---
  {
    id: "remington-cole",
    name: "Remington Cole",
    role: "Grade & Condition Auditor",
    beat: "CGC/CBCS 9.8 Census & Restoration",
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
    avatarColor: "#EAB308",
    badgeBg: "bg-yellow-950/60",
    badgeBorder: "border-yellow-500/50",
    badgeText: "text-yellow-300",
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
    avatarColor: "#F97316",
    badgeBg: "bg-orange-950/60",
    badgeBorder: "border-orange-500/50",
    badgeText: "text-orange-300",
    writingStyle: {
      introStyle: "Synthesizing macro industry movements into actionable intelligence.",
      analysisFocus: "Cross-sector narrative impacts, publisher market share, and broader industry health.",
      implicationAngle: "Overall market trends reinforcing strategic portfolio diversification.",
      marketAngle: "Market-wide indicators pointing to steady fundamental category strength.",
    },
  },
];

/**
  Weighted Persona Allocation:
  Routes high-frequency publisher sources (CBR, ScreenRant, Bleeding Cool, Variety) to Tier 1 authors,
  and distributes other sources across specialized author personas deterministically.
 */
export function selectAuthorForStory(source: string, storyId: string): AuthorPersona {
  const normSource = source.toUpperCase();

  // Tier 1 High-Frequency Sources -> Marcus, Elena, Devon, Sarah, Thaddeus, Jax
  if (normSource.includes("CBR") || normSource.includes("BLEEDING COOL")) {
    return AUTHOR_PERSONAS[0]; // Marcus Vance
  }
  if (normSource.includes("VARIETY") || normSource.includes("DEADLINE") || normSource.includes("THR")) {
    return AUTHOR_PERSONAS[1]; // Elena Rostova
  }
  if (normSource.includes("SCREENRANT") || normSource.includes("GAMESRADAR")) {
    return AUTHOR_PERSONAS[2]; // Devon Knight
  }
  if (normSource.includes("ANN") || normSource.includes("CRUNCHYROLL") || normSource.includes("ANIME")) {
    return AUTHOR_PERSONAS[3]; // Sarah Chen
  }
  if (normSource.includes("COMICBOOK INVEST") || normSource.includes("FIRSTCOMICS")) {
    return AUTHOR_PERSONAS[4]; // Thaddeus Pryor
  }
  if (normSource.includes("COMICBOOK") || normSource.includes("COMIC VINE")) {
    return AUTHOR_PERSONAS[5]; // Jax Mercer
  }

  // Tier 2 Medium-Frequency Sources -> Claire, Gideon, Zara, Owen
  if (normSource.includes("ICV2") || normSource.includes("AIPT")) {
    return AUTHOR_PERSONAS[6]; // Claire Holloway
  }
  if (normSource.includes("BEAT") || normSource.includes("JOURNAL")) {
    return AUTHOR_PERSONAS[7]; // Gideon Vane
  }
  if (normSource.includes("POLYGON") || normSource.includes("IGN")) {
    return AUTHOR_PERSONAS[8]; // Zara Al-Mansoor
  }
  if (normSource.includes("BROKEN FRONTIER") || normSource.includes("COMICSXF")) {
    return AUTHOR_PERSONAS[9]; // Owen St. Clair
  }

  // Fallback / General Allocation: Hash story ID to pick deterministically from all 15
  let hash = 0;
  for (let i = 0; i < storyId.length; i++) {
    hash = (hash << 5) - hash + storyId.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % AUTHOR_PERSONAS.length;
  return AUTHOR_PERSONAS[index];
}
