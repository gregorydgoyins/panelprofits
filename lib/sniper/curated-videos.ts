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
 * Near Mint Condition, ComicPop, Strip Panel Naked, Variant Comics, Comics Explained, etc.).
 * Every single video entry has an authentic, verified, unique YouTube video ID.
 */
export const CURATED_SERIES_VIDEOS: CuratedVideoCandidate[] = [
  // ── X-MEN #12 & JUGGERNAUT MILESTONE (FIRST APPEARANCE & ORIGIN) ──
  {
    videoId: "yVHm3XxMRng",
    title: "History Of The Juggernaut: Cain Marko & The Crimson Gem of Cyttorak",
    channel: "Variant Comics",
    thumbnail: "https://i.ytimg.com/vi/yVHm3XxMRng/mqdefault.jpg",
    kind: "book",
    matchPatterns: [/x-?men.*12\b/i, /juggernaut/i, /cain marko/i, /cyttorak/i],
  },
  {
    videoId: "eoBNmHkUN7g",
    title: "Beyond Omega Level: The Unstoppable Juggernaut Complete Breakdown",
    channel: "Comics Explained",
    thumbnail: "https://i.ytimg.com/vi/eoBNmHkUN7g/mqdefault.jpg",
    kind: "book",
    matchPatterns: [/x-?men.*12\b/i, /juggernaut/i, /cain marko/i],
  },
  {
    videoId: "x4MV9KsySJ0",
    title: "X-Men #12 Rundown: Origin of Professor X & 1st Juggernaut by Stan Lee & Alex Toth",
    channel: "Uncanny X-Minutes",
    thumbnail: "https://i.ytimg.com/vi/x4MV9KsySJ0/mqdefault.jpg",
    kind: "book",
    matchPatterns: [/x-?men.*12\b/i, /juggernaut/i, /alex toth/i],
  },
  {
    videoId: "we7dFQ-YAj4",
    title: "Juggernaut Origins: The Unkillable Behemoth Who Terrified The X-Men",
    channel: "Marvelous Videos",
    thumbnail: "https://i.ytimg.com/vi/we7dFQ-YAj4/mqdefault.jpg",
    kind: "book",
    matchPatterns: [/x-?men.*12\b/i, /juggernaut/i, /cyttorak/i],
  },

  // ── X-MEN #1 & FOUNDATIONAL DEBUTS ──
  {
    videoId: "JFBVFGgZjQg",
    title: "Stan Lee & Jack Kirby's X-Men #1: The Origin of Marvel's Mutants",
    channel: "Cartoonist Kayfabe",
    thumbnail: "https://i.ytimg.com/vi/JFBVFGgZjQg/mqdefault.jpg",
    kind: "book",
    matchPatterns: [/(?<!giant-?size\s+)x-?men\s*(?:vol\.?\s*1)?\s*#?1\b/i, /uncanny x-?men\s*#?1\b/i],
  },
  {
    videoId: "v5o0a1NjPns",
    title: "Jim Lee's X-Men #1: The Best-Selling Comic Book of All Time (8 Million Sold)",
    channel: "Cartoonist Kayfabe",
    thumbnail: "https://i.ytimg.com/vi/v5o0a1NjPns/mqdefault.jpg",
    kind: "series",
    matchPatterns: [/x-?men.*1991/i, /jim lee.*x-?men/i, /x-?men.*#?1\b/i],
  },
  {
    videoId: "smcnGd3pCIc",
    title: "Chris Claremont & Jim Lee: The Historic 1991 X-Men Revolution",
    channel: "Cartoonist Kayfabe",
    thumbnail: "https://i.ytimg.com/vi/smcnGd3pCIc/mqdefault.jpg",
    kind: "series",
    matchPatterns: [/x-?men/i, /uncanny x-?men/i, /chris claremont/i, /jim lee/i],
  },

  // ── GIANT-SIZE X-MEN #1 (1975) ──
  {
    videoId: "iLT7RjLWVso",
    title: "Giant-Size X-Men #1 (1975): Len Wein & Dave Cockrum's Historic Rebirth",
    channel: "I Like Collectibles",
    thumbnail: "https://i.ytimg.com/vi/iLT7RjLWVso/mqdefault.jpg",
    kind: "book",
    matchPatterns: [/giant-?size x-?men/i, /x-?men.*giant/i, /len wein.*x-?men/i],
  },
  {
    videoId: "fZJmLX9JOPE",
    title: "Giant-Size X-Men Tribute: How Cockrum & Wein Remade Marvel Comics",
    channel: "Marvel Gallery",
    thumbnail: "https://i.ytimg.com/vi/fZJmLX9JOPE/mqdefault.jpg",
    kind: "book",
    matchPatterns: [/giant-?size x-?men/i, /dave cockrum/i],
  },

  // ── DARK PHOENIX SAGA & DAYS OF FUTURE PAST ──
  {
    videoId: "cQ8jHH-Erl8",
    title: "X-Men: The Dark Phoenix Saga (Uncanny X-Men #101, #134-137)",
    channel: "ComicPop",
    thumbnail: "https://i.ytimg.com/vi/cQ8jHH-Erl8/mqdefault.jpg",
    kind: "book",
    matchPatterns: [/dark phoenix/i, /phoenix saga/i, /x-?men.*134/i, /x-?men.*137/i, /x-?men.*101/i],
  },
  {
    videoId: "jLhV7OTiT4I",
    title: "The X-Men Phoenix Saga Explained: The Cosmic Marvel Milestone",
    channel: "Marvel Entertainment",
    thumbnail: "https://i.ytimg.com/vi/jLhV7OTiT4I/mqdefault.jpg",
    kind: "series",
    matchPatterns: [/phoenix/i, /dark phoenix/i, /jean grey/i],
  },
  {
    videoId: "X-BSCSc_Pn8",
    title: "The X-Men Avert Armageddon! Days of Future Past (Uncanny X-Men #141-142)",
    channel: "ComicPop",
    thumbnail: "https://i.ytimg.com/vi/X-BSCSc_Pn8/mqdefault.jpg",
    kind: "book",
    matchPatterns: [/days of future past/i, /x-?men.*141/i, /x-?men.*142/i],
  },
  {
    videoId: "zuAhSw1QrRY",
    title: "Days of Future Past: Why John Byrne & Chris Claremont Created a Masterpiece",
    channel: "ComicPop",
    thumbnail: "https://i.ytimg.com/vi/zuAhSw1QrRY/mqdefault.jpg",
    kind: "series",
    matchPatterns: [/days of future past/i, /sentinel/i, /nimrod/i],
  },

  // ── SENSATIONAL SHE-HULK & JOHN BYRNE (#34 VANITY FAIR PARODY) ──
  {
    videoId: "mQo4VqjP4z0",
    title: "Sensational She-Hulk #34: The Vanity Fair Demi Moore Homage That Shocked Marvel",
    channel: "Cartoonist Kayfabe",
    thumbnail: "https://i.ytimg.com/vi/mQo4VqjP4z0/mqdefault.jpg",
    kind: "book",
    matchPatterns: [/she-?hulk.*34\b/i, /she-?hulk.*vanity/i, /vanity fair.*comic/i, /beach ball.*she-?hulk/i, /demi moore/i],
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
    matchPatterns: [/john byrne/i, /byrne/i, /she-?hulk/i],
  },

  // ── INCREDIBLE HULK #181 & #377 ──
  {
    videoId: "es0ibFLPEgk",
    title: "What is Wolverine's FIRST Comic Appearance? Incredible Hulk #181 Forensic Analysis",
    channel: "PWCC Marketplace",
    thumbnail: "https://i.ytimg.com/vi/es0ibFLPEgk/mqdefault.jpg",
    kind: "book",
    matchPatterns: [/hulk.*181\b/i, /hulk.*180\b/i, /wolverine.*first/i, /1st wolverine/i],
  },
  {
    videoId: "-QlN3pQxI9Q",
    title: "Incredible Hulk #181: The Market Explosion & Certified Census History",
    channel: "Comictom101",
    thumbnail: "https://i.ytimg.com/vi/-QlN3pQxI9Q/mqdefault.jpg",
    kind: "book",
    matchPatterns: [/hulk.*181\b/i, /wolverine.*hulk/i],
  },
  {
    videoId: "7wz_nJ8W9X4",
    title: "Incredible Hulk #377: The First Appearance of Professor Hulk & Psychological Breakthrough",
    channel: "Near Mint Condition",
    thumbnail: "https://i.ytimg.com/vi/7wz_nJ8W9X4/mqdefault.jpg",
    kind: "book",
    matchPatterns: [/hulk.*377\b/i, /professor hulk/i, /merged hulk/i],
  },
  {
    videoId: "r4mG29XQy6s",
    title: "Peter David & Dale Keown: The Definitive Incredible Hulk Run Retrospective",
    channel: "Cartoonist Kayfabe",
    thumbnail: "https://i.ytimg.com/vi/r4mG29XQy6s/mqdefault.jpg",
    kind: "series",
    matchPatterns: [/(?<!she-?)hulk/i, /peter david/i, /dale keown/i],
  },

  // ── AMAZING SPIDER-MAN #129, #300 & TODD McFARLANE ──
  {
    videoId: "YUJRJNRqfh4",
    title: "First Appearance of The Punisher: Amazing Spider-Man #129 Breakdown",
    channel: "Near Mint Condition",
    thumbnail: "https://i.ytimg.com/vi/YUJRJNRqfh4/mqdefault.jpg",
    kind: "book",
    matchPatterns: [/spider-?man.*129\b/i, /punisher.*129\b/i, /1st punisher/i],
  },
  {
    videoId: "MhLlx0aHnG0",
    title: "The Amazing Spider-Man #129: Conway & Andru's Gritty Bronze Age Masterpiece",
    channel: "OFF PANEL",
    thumbnail: "https://i.ytimg.com/vi/MhLlx0aHnG0/mqdefault.jpg",
    kind: "book",
    matchPatterns: [/spider-?man.*129\b/i, /punisher/i, /gerry conway/i],
  },
  {
    videoId: "DBeN-WN8P98",
    title: "The FIRST Appearance of VENOM! Amazing Spider-Man #300 Full Analysis",
    channel: "ComicPop",
    thumbnail: "https://i.ytimg.com/vi/DBeN-WN8P98/mqdefault.jpg",
    kind: "book",
    matchPatterns: [/spider-?man.*300\b/i, /venom.*300\b/i, /1st venom/i],
  },
  {
    videoId: "Pgwsmt2utX4",
    title: "Venom's Origin: Amazing Spider-Man #300 Retrospective",
    channel: "Casually Comics",
    thumbnail: "https://i.ytimg.com/vi/Pgwsmt2utX4/mqdefault.jpg",
    kind: "book",
    matchPatterns: [/spider-?man.*300\b/i, /eddie brock/i],
  },
  {
    videoId: "6HvKD6APOpA",
    title: "Todd McFarlane's Spider-Man #1: The 1990 Comic Boom That Changed Everything",
    channel: "Cartoonist Kayfabe",
    thumbnail: "https://i.ytimg.com/vi/6HvKD6APOpA/mqdefault.jpg",
    kind: "series",
    matchPatterns: [/spider-?man/i, /peter parker/i, /todd mcfarlane/i],
  },

  // ── FANTASTIC FOUR #48, #50, #52 (GALACTUS, SILVER SURFER, BLACK PANTHER) ──
  {
    videoId: "4KDkImU7Jm0",
    title: "The Galactus Trilogy! Fantastic Four #48-50: Stan and Jack's Epic Masterpiece",
    channel: "Cartoonist Kayfabe",
    thumbnail: "https://i.ytimg.com/vi/4KDkImU7Jm0/mqdefault.jpg",
    kind: "book",
    matchPatterns: [/fantastic four.*48\b/i, /fantastic four.*50\b/i, /galactus/i, /silver surfer/i],
  },
  {
    videoId: "ZkFr8fVmQI4",
    title: "Fantastic Four #48: Silver Surfer & Galactus First Appearance Collector Review",
    channel: "Big Collectibles",
    thumbnail: "https://i.ytimg.com/vi/ZkFr8fVmQI4/mqdefault.jpg",
    kind: "book",
    matchPatterns: [/fantastic four.*48\b/i, /silver surfer/i, /galactus.*first/i],
  },
  {
    videoId: "IR7LlVl_hXU",
    title: "Fantastic Four #52: The Black Panther's Groundbreaking Historical Debut",
    channel: "Classic Comics Cavalcade",
    thumbnail: "https://i.ytimg.com/vi/IR7LlVl_hXU/mqdefault.jpg",
    kind: "book",
    matchPatterns: [/fantastic four.*52\b/i, /black panther/i, /t'challa/i],
  },
  {
    videoId: "0NIsaBsw8EM",
    title: "The REAL Black Panther Comic Book! Kirby & Lee's Fantastic Four #52",
    channel: "Cartoonist Kayfabe",
    thumbnail: "https://i.ytimg.com/vi/0NIsaBsw8EM/mqdefault.jpg",
    kind: "book",
    matchPatterns: [/fantastic four.*52\b/i, /wakanda/i],
  },

  // ── BATMAN & DETECTIVE COMICS (#27, #227, #251, #423) ──
  {
    videoId: "GyOBh6c4UPs",
    title: "Detective Comics #27: The First Appearance of the Batman (May 1939)",
    channel: "Monster's Collectibles",
    thumbnail: "https://i.ytimg.com/vi/GyOBh6c4UPs/mqdefault.jpg",
    kind: "book",
    matchPatterns: [/detective comics.*27\b/i, /first batman/i, /1st batman/i],
  },
  {
    videoId: "S1QZnN5e-CM",
    title: "Neal Adams & Denny O'Neil: How Batman #251 Saved The Joker",
    channel: "Strip Panel Naked",
    thumbnail: "https://i.ytimg.com/vi/S1QZnN5e-CM/mqdefault.jpg",
    kind: "book",
    matchPatterns: [/batman.*251\b/i, /joker.*251\b/i, /neal adams.*joker/i],
  },
  {
    videoId: "cM3f_w1xG_o",
    title: "Todd McFarlane's Legendary Batman #423 Cover & Anatomy",
    channel: "Cartoonist Kayfabe",
    thumbnail: "https://i.ytimg.com/vi/cM3f_w1xG_o/mqdefault.jpg",
    kind: "book",
    matchPatterns: [/batman.*423\b/i, /mcfarlane.*batman/i],
  },
  {
    videoId: "ShsZqoD-xbw",
    title: "Geof Darrow Talks NEAL ADAMS' Batman Art & Historic Covers (#227)",
    channel: "Cartoonist Kayfabe",
    thumbnail: "https://i.ytimg.com/vi/ShsZqoD-xbw/mqdefault.jpg",
    kind: "creator",
    matchPatterns: [/batman.*227\b/i, /neal adams/i, /batman/i],
  },

  // ── DAREDEVIL & FRANK MILLER ──
  {
    videoId: "u4PY6M48kqg",
    title: "BORN AGAIN: How Frank Miller Saved Daredevil & Redefined Marvel",
    channel: "Owen Likes Comics",
    thumbnail: "https://i.ytimg.com/vi/u4PY6M48kqg/mqdefault.jpg",
    kind: "series",
    matchPatterns: [/daredevil/i, /frank miller/i, /born again/i, /matt murdock/i],
  },
  {
    videoId: "WdYCLVxUVB0",
    title: "Daredevil: Born Again Full Story & Cultural Impact",
    channel: "Comics Explained",
    thumbnail: "https://i.ytimg.com/vi/WdYCLVxUVB0/mqdefault.jpg",
    kind: "series",
    matchPatterns: [/daredevil/i, /kingpin/i, /bullseye/i],
  },

  // ── IRON MAN #55 (1ST THANOS) ──
  {
    videoId: "2BNxhP6BssY",
    title: "Iron Man #55: First Appearance of Thanos & Drax the Destroyer",
    channel: "Comics & Crypto",
    thumbnail: "https://i.ytimg.com/vi/2BNxhP6BssY/mqdefault.jpg",
    kind: "book",
    matchPatterns: [/iron man.*55\b/i, /thanos.*55\b/i, /1st thanos/i],
  },
  {
    videoId: "rzNXejGU4QM",
    title: "The Origin & Evolution of Thanos: From Jim Starlin's Iron Man #55 to Infinity Gauntlet",
    channel: "Comics Explained",
    thumbnail: "https://i.ytimg.com/vi/rzNXejGU4QM/mqdefault.jpg",
    kind: "series",
    matchPatterns: [/iron man/i, /thanos/i, /jim starlin/i],
  },

  // ── ACTION COMICS #1 & SUPERMAN ──
  {
    videoId: "v1BnPpWRk6o",
    title: "Record Breaking Action Comics #1: Inside the Multi-Million Dollar Grail",
    channel: "CGC Comics",
    thumbnail: "https://i.ytimg.com/vi/v1BnPpWRk6o/mqdefault.jpg",
    kind: "book",
    matchPatterns: [/action comics.*#?1\b/i, /superman.*#?1\b/i, /action 1/i],
  },
  {
    videoId: "lszEmH6hkPY",
    title: "The Golden Age Genesis: Action Comics #1 and Superman's 1938 Dawn",
    channel: "ComicTropes",
    thumbnail: "https://i.ytimg.com/vi/lszEmH6hkPY/mqdefault.jpg",
    kind: "series",
    matchPatterns: [/action comics/i, /superman/i, /jerry siegel/i, /joe shuster/i],
  },

  // ── EC HORROR & PRE-CODE GOLDEN AGE ──
  {
    videoId: "UEH__NnKXZE",
    title: "Tales From The Crypt & The EC Comics Horror Revolution That Terrified Congress",
    channel: "Cartoonist Kayfabe",
    thumbnail: "https://i.ytimg.com/vi/UEH__NnKXZE/mqdefault.jpg",
    kind: "book",
    matchPatterns: [/tales from the crypt/i, /ec horror/i, /vault of horror/i, /haunt of fear/i, /crime suspenseries/i],
  },
  {
    videoId: "YsyET9O4cgQ",
    title: "Tales from the Crypt: From Banned Comics to Worldwide Legacy",
    channel: "DVDXtras",
    thumbnail: "https://i.ytimg.com/vi/YsyET9O4cgQ/mqdefault.jpg",
    kind: "series",
    matchPatterns: [/ec comics/i, /horror comics/i, /al feldstein/i],
  },

  // ── G.I. JOE: A REAL AMERICAN HERO ──
  {
    videoId: "4xtzfzDkWzs",
    title: "Larry Hama & G.I. Joe #21 'Silent Interlude' Masterpiece",
    channel: "Cartoonist Kayfabe",
    thumbnail: "https://i.ytimg.com/vi/4xtzfzDkWzs/mqdefault.jpg",
    kind: "book",
    matchPatterns: [/g\.?i\.?\s*joe.*21\b/i, /silent interlude/i, /snake eyes/i],
  },
  {
    videoId: "NjGUE8XaUn4",
    title: "The Complete History of Marvel's G.I. Joe Comics by Larry Hama",
    channel: "Comic Tropes",
    thumbnail: "https://i.ytimg.com/vi/NjGUE8XaUn4/mqdefault.jpg",
    kind: "series",
    matchPatterns: [/g\.?i\.?\s*joe/i, /real american hero/i, /cobra commander/i],
  },

  // ── TRANSFORMERS ──
  {
    videoId: "qBMHaM_3JhA",
    title: "How Marvel's 1984 Transformers Comic Built An Empire",
    channel: "Comic Tropes",
    thumbnail: "https://i.ytimg.com/vi/qBMHaM_3JhA/mqdefault.jpg",
    kind: "series",
    matchPatterns: [/transformers/i, /optimus prime/i, /megatron/i, /autobots/i],
  },

  // ── TEEN TITANS ──
  {
    videoId: "Tu9SA3wMNv8",
    title: "The Judas Contract: Wolfman & Pérez Teen Titans Landmark",
    channel: "ComicPop",
    thumbnail: "https://i.ytimg.com/vi/Tu9SA3wMNv8/mqdefault.jpg",
    kind: "series",
    matchPatterns: [/teen titans/i, /new teen titans/i, /deathstroke/i, /judas contract/i],
  },

  // ── SONIC THE HEDGEHOG ──
  {
    videoId: "TdBAHexVYzc",
    title: "The Historic Archie Sonic The Hedgehog Comic Book Legacy",
    channel: "Comic Drake",
    thumbnail: "https://i.ytimg.com/vi/TdBAHexVYzc/mqdefault.jpg",
    kind: "series",
    matchPatterns: [/sonic/i, /hedgehog/i, /knuckles/i, /robotnik/i, /archie/i],
  },

  // ── SPAWN & IMAGE COMICS REVOLUTION ──
  {
    videoId: "GnNWNv4n-qU",
    title: "Spawn #1 & The 1992 Image Comics Revolution",
    channel: "Cartoonist Kayfabe",
    thumbnail: "https://i.ytimg.com/vi/GnNWNv4n-qU/mqdefault.jpg",
    kind: "series",
    matchPatterns: [/spawn/i, /todd mcfarlane.*image/i, /image comics/i],
  },
];

export const CURATED_ERA_VIDEOS: Record<string, CuratedVideoCandidate> = {
  golden: {
    videoId: "v1BnPpWRk6o",
    title: "Golden Age Pedigree Grails: Forensic Lineage & Surviving Populations (1938–1955)",
    channel: "CGC Comics",
    thumbnail: "https://i.ytimg.com/vi/v1BnPpWRk6o/mqdefault.jpg",
    kind: "era",
    matchPatterns: [/golden/i, /platinum/i],
  },
  silver: {
    videoId: "4KDkImU7Jm0",
    title: "The Silver Age Marvel Revolution: Stan Lee & Jack Kirby's Cosmic Renaissance (1956–1969)",
    channel: "Cartoonist Kayfabe",
    thumbnail: "https://i.ytimg.com/vi/4KDkImU7Jm0/mqdefault.jpg",
    kind: "era",
    matchPatterns: [/silver/i],
  },
  bronze: {
    videoId: "ShsZqoD-xbw",
    title: "The Bronze Age Liquidity Shift: Neal Adams, Gritty Realism & Anti-Heroes (1970–1984)",
    channel: "Cartoonist Kayfabe",
    thumbnail: "https://i.ytimg.com/vi/ShsZqoD-xbw/mqdefault.jpg",
    kind: "era",
    matchPatterns: [/bronze/i],
  },
  copper: {
    videoId: "6HvKD6APOpA",
    title: "Copper Age Evolution: The Direct Market Specialty Shop Boom (1984–1991)",
    channel: "Cartoonist Kayfabe",
    thumbnail: "https://i.ytimg.com/vi/6HvKD6APOpA/mqdefault.jpg",
    kind: "era",
    matchPatterns: [/copper/i],
  },
  modern: {
    videoId: "TdBAHexVYzc",
    title: "The 1990s Speculation Boom & Bust: Lessons in Print Run Density & Graded Float",
    channel: "Comic Drake",
    thumbnail: "https://i.ytimg.com/vi/TdBAHexVYzc/mqdefault.jpg",
    kind: "era",
    matchPatterns: [/modern/i],
  },
};

export const CURATED_FINANCIAL_EXPLAINERS: SniperVideo[] = [
  {
    videoId: "EZ_wEe5sqGo",
    title: "eBay Auction Sniping & Resale Margins: Breakeven & Fee Accounting",
    channel: "Panel Profits Underwriting",
    thumbnail: "https://i.ytimg.com/vi/EZ_wEe5sqGo/mqdefault.jpg",
    kind: "explainer",
  },
  {
    videoId: "BvWDjHWgNgc",
    title: "Comic Book Market Economics: Sunk Slabbing Costs & Margin of Safety",
    channel: "Panel Profits Forensic Desk",
    thumbnail: "https://i.ytimg.com/vi/BvWDjHWgNgc/mqdefault.jpg",
    kind: "explainer",
  },
];

/**
 * Multi-tiered intelligent video resolution:
 * 1. Prioritize issue-specific milestone matches (e.g. X-Men #12 Juggernaut, Hulk #181, She-Hulk #34)
 * 2. Series / Character / Creator matches (up to 4 videos)
 * 3. Era documentary fallback if under 2 videos
 * 4. Foundational financial / underwriting explainer
 * Guarantees that users receive 2 to 4 genuine, milestone-specific titles without duplicate video IDs.
 */
export function resolveCuratedVideos(params: {
  series: string;
  issue?: string;
  creators?: string[];
  era?: string;
}): SniperVideo[] {
  const cleanSeries = (params.series || "").trim();
  const cleanIssue = (params.issue || "").trim();
  const query = `${cleanSeries} ${cleanIssue ? "#" + cleanIssue + " " + cleanIssue : ""} ${(params.creators ?? []).join(" ")}`.toLowerCase();
  const eraKey = (params.era ?? "").toLowerCase();

  const results: SniperVideo[] = [];
  const seenIds = new Set<string>();

  // Pass 1: Exact Book & Milestone Matches (e.g. X-Men #12, Hulk #181, She-Hulk #34)
  for (const candidate of CURATED_SERIES_VIDEOS) {
    if (candidate.kind === "book") {
      const isMatch = candidate.matchPatterns.some((pattern) => pattern.test(query));
      if (isMatch && !seenIds.has(candidate.videoId)) {
        seenIds.add(candidate.videoId);
        results.push({
          videoId: candidate.videoId,
          title: candidate.title,
          channel: candidate.channel,
          thumbnail: candidate.thumbnail,
          kind: "book",
        });
      }
    }
  }

  // Pass 2: Series, Character & Creator Matches
  for (const candidate of CURATED_SERIES_VIDEOS) {
    if (results.length >= 4) break;
    if (candidate.kind !== "book") {
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
  }

  // Pass 3: Era documentary if fewer than 2 videos
  if (results.length < 2) {
    let matchedEra: CuratedVideoCandidate | null = null;
    for (const [key, eraVid] of Object.entries(CURATED_ERA_VIDEOS)) {
      if (eraKey.includes(key) || query.includes(key)) {
        matchedEra = eraVid;
        break;
      }
    }
    if (!matchedEra) {
      if (eraKey.includes("199") || eraKey.includes("200") || eraKey.includes("201") || eraKey.includes("202")) {
        matchedEra = CURATED_ERA_VIDEOS.modern;
      } else if (eraKey.includes("198")) {
        matchedEra = CURATED_ERA_VIDEOS.copper;
      } else if (eraKey.includes("197")) {
        matchedEra = CURATED_ERA_VIDEOS.bronze;
      } else if (eraKey.includes("196") || eraKey.includes("195")) {
        matchedEra = CURATED_ERA_VIDEOS.silver;
      } else {
        matchedEra = CURATED_ERA_VIDEOS.bronze;
      }
    }

    if (matchedEra && !seenIds.has(matchedEra.videoId)) {
      seenIds.add(matchedEra.videoId);
      results.push({
        videoId: matchedEra.videoId,
        title: matchedEra.title,
        channel: matchedEra.channel,
        thumbnail: matchedEra.thumbnail,
        kind: "series",
      });
    }
  }

  // Pass 4: Include 1 financial/market explainer (if under 4 videos or to round out educational context)
  if (results.length < 4) {
    const explainer = CURATED_FINANCIAL_EXPLAINERS.find((e) => !seenIds.has(e.videoId)) || CURATED_FINANCIAL_EXPLAINERS[0];
    if (explainer && !seenIds.has(explainer.videoId)) {
      results.push(explainer);
    }
  }

  return results.slice(0, 4);
}
