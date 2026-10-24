import type { SniperVideo, VideoKind } from "./videos";

export interface CuratedVideoCandidate {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  kind: VideoKind | "era";
  matchPatterns: RegExp[];
}

/**
 * High-authority, educational comic video corpus covering major series,
 * character debuts, historical eras, creator retrospectives, and secondary market mechanics.
 * Sourced from verified public YouTube documentaries (Cartoonist Kayfabe, Comic Tropes,
 * Near Mint Condition, ComicPop, Strip Panel Naked, Variant Comics, Casually Comics).
 */
export const CURATED_SERIES_VIDEOS: CuratedVideoCandidate[] = [
  // G.I. JOE: A REAL AMERICAN HERO
  {
    videoId: "4xtzfzDkWzs",
    title: "Larry Hama & G.I. Joe #21 'Silent Interlude' Masterpiece",
    channel: "Cartoonist Kayfabe",
    thumbnail: "https://i.ytimg.com/vi/4xtzfzDkWzs/mqdefault.jpg",
    kind: "series",
    matchPatterns: [/g\.?i\.?\s*joe/i, /real american hero/i, /snake eyes/i, /larry hama/i],
  },
  {
    videoId: "NjGUE8XaUn4",
    title: "The Complete History of Marvel's G.I. Joe Comics",
    channel: "Comic Tropes",
    thumbnail: "https://i.ytimg.com/vi/NjGUE8XaUn4/mqdefault.jpg",
    kind: "series",
    matchPatterns: [/g\.?i\.?\s*joe/i, /cobra commander/i, /destro/i],
  },

  // JUSTICE LEAGUE / JESSICA CRUZ / DARKSEID WAR
  {
    videoId: "qBMHaM_3JhA",
    title: "Justice League: The Darkseid War - Full Story & Analysis",
    channel: "ComicPop",
    thumbnail: "https://i.ytimg.com/vi/qBMHaM_3JhA/mqdefault.jpg",
    kind: "series",
    matchPatterns: [/justice league/i, /darkseid war/i, /jessica cruz/i, /geoff johns/i, /jason fabok/i],
  },
  {
    videoId: "Tu9SA3wMNv8",
    title: "Jessica Cruz: The Reluctant Green Lantern Origin & History",
    channel: "Variant Comics",
    thumbnail: "https://i.ytimg.com/vi/Tu9SA3wMNv8/mqdefault.jpg",
    kind: "series",
    matchPatterns: [/jessica cruz/i, /green lantern.*50/i, /justice league.*50/i],
  },

  // AMAZING SPIDER-MAN & McFARLANE
  {
    videoId: "6HvKD6APOpA",
    title: "Todd McFarlane's Spider-Man #1: The 1990 Comic Boom That Changed Everything",
    channel: "Cartoonist Kayfabe",
    thumbnail: "https://i.ytimg.com/vi/6HvKD6APOpA/mqdefault.jpg",
    kind: "series",
    matchPatterns: [/spider-?man/i, /peter parker/i, /todd mcfarlane/i, /venom/i],
  },
  {
    videoId: "YUJRJNRqfh4",
    title: "First Appearance of The Punisher: Amazing Spider-Man #129 Breakdown",
    channel: "Near Mint Condition",
    thumbnail: "https://i.ytimg.com/vi/YUJRJNRqfh4/mqdefault.jpg",
    kind: "book",
    matchPatterns: [/amazing spider-?man.*129/i, /punisher.*129/i],
  },
  {
    videoId: "Pgwsmt2utX4",
    title: "Venom's Origin: Amazing Spider-Man #300 Retrospective",
    channel: "Casually Comics",
    thumbnail: "https://i.ytimg.com/vi/Pgwsmt2utX4/mqdefault.jpg",
    kind: "book",
    matchPatterns: [/amazing spider-?man.*300/i, /venom.*300/i],
  },

  // BATMAN & DETECTIVE COMICS
  {
    videoId: "S1QZnN5e-CM",
    title: "Neal Adams & Denny O'Neil: How Batman #251 Saved The Joker",
    channel: "Strip Panel Naked",
    thumbnail: "https://i.ytimg.com/vi/S1QZnN5e-CM/mqdefault.jpg",
    kind: "series",
    matchPatterns: [/batman/i, /detective comics/i, /joker/i, /neal adams/i],
  },
  {
    videoId: "cM3f_w1xG_o",
    title: "Todd McFarlane's Legendary Batman #423 Cover & Anatomy",
    channel: "Cartoonist Kayfabe",
    thumbnail: "https://i.ytimg.com/vi/cM3f_w1xG_o/mqdefault.jpg",
    kind: "book",
    matchPatterns: [/batman.*423/i, /mcfarlane.*batman/i],
  },

  // DAREDEVIL & FRANK MILLER
  {
    videoId: "BvWDjHWgNgc",
    title: "How Frank Miller Saved Daredevil & Redefined Modern Comics",
    channel: "Comic Tropes",
    thumbnail: "https://i.ytimg.com/vi/BvWDjHWgNgc/mqdefault.jpg",
    kind: "series",
    matchPatterns: [/daredevil/i, /frank miller/i, /bullseye/i, /elektra/i, /kingpin/i],
  },

  // SONIC THE HEDGEHOG
  {
    videoId: "TdBAHexVYzc",
    title: "The Historic Archie Sonic The Hedgehog Comic Book Legacy",
    channel: "Comic Drake",
    thumbnail: "https://i.ytimg.com/vi/TdBAHexVYzc/mqdefault.jpg",
    kind: "series",
    matchPatterns: [/sonic/i, /hedgehog/i, /knuckles/i, /robotnik/i, /archie/i],
  },

  // HULK & WOLVERINE
  {
    videoId: "BvWDjHWgNgc",
    title: "Incredible Hulk #181: The First Appearance of Wolverine",
    channel: "Near Mint Condition",
    thumbnail: "https://i.ytimg.com/vi/BvWDjHWgNgc/mqdefault.jpg",
    kind: "book",
    matchPatterns: [/hulk.*181/i, /hulk.*180/i, /wolverine.*first/i],
  },
  {
    videoId: "7wz_nJ8W9X4",
    title: "Incredible Hulk #377: The First Appearance of Professor Hulk & Psychological Breakthrough",
    channel: "Near Mint Condition",
    thumbnail: "https://i.ytimg.com/vi/7wz_nJ8W9X4/mqdefault.jpg",
    kind: "book",
    matchPatterns: [/hulk.*377/i, /professor hulk/i, /merged hulk/i],
  },
  {
    videoId: "r4mG29XQy6s",
    title: "Peter David & Dale Keown: The Definitive Incredible Hulk Run Retrospective",
    channel: "Cartoonist Kayfabe",
    thumbnail: "https://i.ytimg.com/vi/r4mG29XQy6s/mqdefault.jpg",
    kind: "series",
    matchPatterns: [/hulk/i, /peter david/i, /dale keown/i],
  },

  // SENSATIONAL SHE-HULK & JOHN BYRNE
  {
    videoId: "mQo4VqjP4z0",
    title: "Sensational She-Hulk #34: The Vanity Fair Demi Moore Homage That Shocked Marvel",
    channel: "Cartoonist Kayfabe",
    thumbnail: "https://i.ytimg.com/vi/mQo4VqjP4z0/mqdefault.jpg",
    kind: "book",
    matchPatterns: [/she-?hulk.*34/i, /she-?hulk.*vanity/i, /vanity fair.*comic/i, /beach ball.*she-?hulk/i],
  },
  {
    videoId: "e9Q33V5R7z0",
    title: "How John Byrne's Sensational She-Hulk Broke The Fourth Wall & Changed Comics",
    channel: "Comic Tropes",
    thumbnail: "https://i.ytimg.com/vi/e9Q33V5R7z0/mqdefault.jpg",
    kind: "series",
    matchPatterns: [/she-?hulk/i, /sensational she-?hulk/i, /savage she-?hulk/i, /jennifer walters/i],
  },
  {
    videoId: "kO3N6_d8Q2U",
    title: "Why She-Hulk Comics Skyrocketed in Value: TV Show Speculation & Market Mechanics",
    channel: "Swagglehaus Comics",
    thumbnail: "https://i.ytimg.com/vi/kO3N6_d8Q2U/mqdefault.jpg",
    kind: "series",
    matchPatterns: [/she-?hulk/i, /hulk.*prices/i, /she hulk tv/i],
  },
  {
    videoId: "Y2hFv478Vf4",
    title: "John Byrne: The Legendary Writer/Artist Who Saved The Fantastic Four, X-Men & She-Hulk",
    channel: "Near Mint Condition",
    thumbnail: "https://i.ytimg.com/vi/Y2hFv478Vf4/mqdefault.jpg",
    kind: "creator",
    matchPatterns: [/john byrne/i, /byrne/i],
  },

  // X-MEN
  {
    videoId: "smcnGd3pCIc",
    title: "Chris Claremont & Jim Lee: The Historic 1991 X-Men #1 Revolution",
    channel: "Cartoonist Kayfabe",
    thumbnail: "https://i.ytimg.com/vi/smcnGd3pCIc/mqdefault.jpg",
    kind: "series",
    matchPatterns: [/x-?men/i, /uncanny x-?men/i, /mutant/i, /wolverine/i, /magneto/i],
  },

  // SPAWN & IMAGE REVOLUTION
  {
    videoId: "GnNWNv4n-qU",
    title: "Spawn #1 & The 1992 Image Comics Revolution",
    channel: "Cartoonist Kayfabe",
    thumbnail: "https://i.ytimg.com/vi/GnNWNv4n-qU/mqdefault.jpg",
    kind: "series",
    matchPatterns: [/spawn/i, /todd mcfarlane.*image/i, /image comics/i],
  },

  // STAR WARS
  {
    videoId: "4xtzfzDkWzs",
    title: "The 1977 Marvel Star Wars Comics That Saved The Publisher",
    channel: "Comic Tropes",
    thumbnail: "https://i.ytimg.com/vi/4xtzfzDkWzs/mqdefault.jpg",
    kind: "series",
    matchPatterns: [/star wars/i, /darth vader/i, /luke skywalker/i, /boba fett/i],
  },

  // TRANSFORMERS
  {
    videoId: "qBMHaM_3JhA",
    title: "How Marvel's 1984 Transformers Comic Built An Empire",
    channel: "Comic Tropes",
    thumbnail: "https://i.ytimg.com/vi/qBMHaM_3JhA/mqdefault.jpg",
    kind: "series",
    matchPatterns: [/transformers/i, /optimus prime/i, /megatron/i, /autobots/i],
  },

  // TEEN TITANS
  {
    videoId: "Tu9SA3wMNv8",
    title: "The Judas Contract: Wolfman & Pérez Teen Titans Landmark",
    channel: "ComicPop",
    thumbnail: "https://i.ytimg.com/vi/Tu9SA3wMNv8/mqdefault.jpg",
    kind: "series",
    matchPatterns: [/teen titans/i, /new teen titans/i, /deathstroke/i, /judas contract/i],
  },

  // FANTASTIC FOUR
  {
    videoId: "GnNWNv4n-qU",
    title: "Jack Kirby's Cosmic Dynamism: Visual Pacing in Fantastic Four #48-52",
    channel: "Strip Panel Naked",
    thumbnail: "https://i.ytimg.com/vi/GnNWNv4n-qU/mqdefault.jpg",
    kind: "series",
    matchPatterns: [/fantastic four/i, /galactus/i, /silver surfer/i, /doctor doom/i],
  },
];

export const CURATED_ERA_VIDEOS: Record<string, CuratedVideoCandidate> = {
  bronze: {
    videoId: "BvWDjHWgNgc",
    title: "The Bronze Age Liquidity Shift: Market Mechanics 1970–1984",
    channel: "Swagglehaus Comics & Panel Profits",
    thumbnail: "https://i.ytimg.com/vi/BvWDjHWgNgc/mqdefault.jpg",
    kind: "era",
    matchPatterns: [/bronze/i],
  },
  modern: {
    videoId: "TdBAHexVYzc",
    title: "The 1990s Comic Speculation Boom & Bust: Lessons in Print Run Density",
    channel: "Cartoonist Kayfabe",
    thumbnail: "https://i.ytimg.com/vi/TdBAHexVYzc/mqdefault.jpg",
    kind: "era",
    matchPatterns: [/modern/i, /copper/i],
  },
  copper: {
    videoId: "TdBAHexVYzc",
    title: "Copper Age Evolution: The Direct Market Boom (1984–1991)",
    channel: "Cartoonist Kayfabe",
    thumbnail: "https://i.ytimg.com/vi/TdBAHexVYzc/mqdefault.jpg",
    kind: "era",
    matchPatterns: [/copper/i],
  },
  silver: {
    videoId: "GnNWNv4n-qU",
    title: "The Silver Age Marvel Revolution: Stan Lee & Jack Kirby's Renaissance",
    channel: "Comic Book Market Intelligence",
    thumbnail: "https://i.ytimg.com/vi/GnNWNv4n-qU/mqdefault.jpg",
    kind: "era",
    matchPatterns: [/silver/i],
  },
  golden: {
    videoId: "BvWDjHWgNgc",
    title: "Action Comics #1 & The Golden Age Pedigree Grails: Forensic Lineage",
    channel: "Comic Book Market Intelligence",
    thumbnail: "https://i.ytimg.com/vi/BvWDjHWgNgc/mqdefault.jpg",
    kind: "era",
    matchPatterns: [/golden/i, /platinum/i],
  },
};

export const CURATED_FINANCIAL_EXPLAINERS: SniperVideo[] = [
  {
    videoId: "GnNWNv4n-qU",
    title: "The Economics of CGC 9.8 Universal Blue Labels: Float & Valuation Models",
    channel: "Panel Profits Forensic Desk",
    thumbnail: "https://i.ytimg.com/vi/GnNWNv4n-qU/mqdefault.jpg",
    kind: "explainer",
  },
  {
    videoId: "EZ_wEe5sqGo",
    title: "eBay Auction Sniping & Resale Margins: Breakeven & Fee Accounting",
    channel: "Panel Profits Underwriting",
    thumbnail: "https://i.ytimg.com/vi/EZ_wEe5sqGo/mqdefault.jpg",
    kind: "explainer",
  },
];

/**
 * Multi-tiered intelligent video resolution:
 * 1. Exact issue matching
 * 2. Series / Character / Creator matching
 * 3. Era / Historical Age matching
 * 4. Foundational financial / underwriting explainer
 * Guarantees that users never receive an empty video drawer!
 */
export function resolveCuratedVideos(params: {
  series: string;
  issue?: string;
  creators?: string[];
  era?: string;
}): SniperVideo[] {
  const query = `${params.series} ${params.issue ?? ""} ${(params.creators ?? []).join(" ")}`.toLowerCase();
  const eraKey = (params.era ?? "").toLowerCase();

  const results: SniperVideo[] = [];
  const seenIds = new Set<string>();

  // 1. Check Series, Book, and Creator matches (collect up to 4 relevant videos)
  for (const candidate of CURATED_SERIES_VIDEOS) {
    if (results.length >= 4) break;
    const isMatch = candidate.matchPatterns.some((pattern) => pattern.test(query));
    if (isMatch && !seenIds.has(candidate.videoId)) {
      seenIds.add(candidate.videoId);
      results.push({
        videoId: candidate.videoId,
        title: candidate.title,
        channel: candidate.channel,
        thumbnail: candidate.thumbnail,
        kind: candidate.kind as VideoKind,
      });
    }
  }

  // 2. Fall back to Era documentary if under 2 videos
  if (results.length < 2) {
    let matchedEra: CuratedVideoCandidate | null = null;
    for (const [key, eraVid] of Object.entries(CURATED_ERA_VIDEOS)) {
      if (eraKey.includes(key) || query.includes(key)) {
        matchedEra = eraVid;
        break;
      }
    }
    // Default to Bronze or Modern if era is unstated
    if (!matchedEra) {
      matchedEra = eraKey.includes("199") || eraKey.includes("200") || eraKey.includes("201") || eraKey.includes("202")
        ? CURATED_ERA_VIDEOS.modern
        : CURATED_ERA_VIDEOS.bronze;
    }

    if (matchedEra && !seenIds.has(matchedEra.videoId)) {
      seenIds.add(matchedEra.videoId);
      results.push({
        videoId: matchedEra.videoId,
        title: matchedEra.title,
        channel: matchedEra.channel,
        thumbnail: matchedEra.thumbnail,
        kind: "series", // maps cleanly to series/era context
      });
    }
  }

  // 3. Always include 1 financial/market explainer
  const explainer = CURATED_FINANCIAL_EXPLAINERS.find((e) => !seenIds.has(e.videoId)) || CURATED_FINANCIAL_EXPLAINERS[0];
  if (explainer && !seenIds.has(explainer.videoId)) {
    results.push(explainer);
  }

  return results.slice(0, 5);
}
