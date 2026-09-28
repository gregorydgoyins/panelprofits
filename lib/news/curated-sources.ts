import type { NewsCategory, NewsSource } from "./types";

export type ContentAngle =
  | "scholarly"
  | "critical_review"
  | "creator_newsletter"
  | "secondary_market"
  | "video_essay"
  | "publisher_bulletin"
  | "industry_trade"
  | "wire_syndicate";

export interface CuratedNewsSource extends NewsSource {
  angle: ContentAngle;
  mirrorUrls?: string[];
  description?: string;
}

/**
 * Curated Channel Registry spanning Scholarly Journals, Deep Critical Reviews,
 * Primary Creator Substacks, Secondary Market Ledgers, Video Broadcasts,
 * and Publisher Bulletins.
 */
export const CURATED_CHANNELS: CuratedNewsSource[] = [
  // =========================================================================
  // 1. SCHOLARLY JOURNALS & ACADEMIC PAPERS
  // =========================================================================
  {
    name: "THE COMICS GRID",
    url: "https://www.comicsgrid.com/rss",
    category: "international",
    angle: "scholarly",
    description: "Open-access peer-reviewed journal of comics and graphic literature scholarship.",
  },
  {
    name: "IMAGE TEXT JOURNAL",
    url: "https://imagetext.english.ufl.edu/feed/",
    category: "national",
    angle: "scholarly",
    description: "University of Florida interdisciplinary comics studies journal.",
  },
  {
    name: "COMICS FORUM",
    url: "https://comicsforum.org/feed/",
    category: "international",
    angle: "scholarly",
    description: "International academic research network on sequential art and culture.",
  },
  {
    name: "GRAPHIC MEDICINE ACADEMIC",
    url: "https://www.graphicmedicine.org/feed/",
    category: "international",
    angle: "scholarly",
    description: "Scholarly community exploring the intersection of the comics medium and healthcare.",
  },
  {
    name: "STUDIES IN COMICS INTELLECT",
    url: "https://intellectdiscover.com/rss/content/journals/10.1386/stic",
    category: "international",
    angle: "scholarly",
    description: "Scholarly journal exploring comic book theory, history, and sequential narratives.",
  },
  {
    name: "SEQUENTIAL SMORGASBORD",
    url: "https://sequentialsmorgasbord.blogspot.com/feeds/posts/default?alt=rss",
    category: "national",
    angle: "scholarly",
    description: "Academic bulletins on graphic narrative history and sequential structure.",
  },

  // =========================================================================
  // 2. CRITICAL LONGFORM BOOK REVIEWS & ESSAYS
  // =========================================================================
  {
    name: "COMICS JOURNAL",
    url: "https://www.tcj.com/feed/",
    category: "international",
    angle: "critical_review",
    description: "The premier journal of sequential art criticism and cultural forensics.",
  },
  {
    name: "SOLRAD LITERARY JOURNAL",
    url: "https://solrad.net/feed/",
    category: "international",
    angle: "critical_review",
    description: "Fair-page poetry and literary comics criticism journal.",
  },
  {
    name: "THE GUTTER REVIEW",
    url: "https://gutterreview.com/feed/",
    category: "national",
    angle: "critical_review",
    description: "In-depth critical analysis and essays on graphic narratives and indies.",
  },
  {
    name: "PANEL PATTER",
    url: "https://www.panelpatter.com/feeds/posts/default?alt=rss",
    category: "national",
    angle: "critical_review",
    description: "Essays and critical reviews on indie, literary, and mainstream comic releases.",
  },
  {
    name: "SEQUENTIAL TART",
    url: "https://www.sequentialtart.com/rss.php",
    category: "national",
    angle: "critical_review",
    description: "Long-running feminist critical webzine analyzing sequential storytelling.",
  },
  {
    name: "BROKEN FRONTIER",
    url: "https://www.brokenfrontier.com/feed/",
    category: "international",
    angle: "critical_review",
    description: "Alternative and creator-owned sequential reviews and editorial features.",
  },
  {
    name: "WOMEN WRITE ABOUT COMICS",
    url: "https://womenwriteaboutcomics.com/feed/",
    category: "national",
    angle: "critical_review",
    description: "Eisner Award-winning comic criticism and cultural journalism.",
  },
  {
    name: "THE DAILY CARTOONIST",
    url: "https://www.dailycartoonist.com/index.php/feed/",
    category: "national",
    angle: "critical_review",
    description: "Daily reporting on newspaper comic strips, political cartoons, and graphic art.",
  },
  {
    name: "COMIC BOOK TREASURY",
    url: "https://www.comicbooktreasury.com/feed/",
    category: "international",
    angle: "critical_review",
    description: "Comprehensive reading orders, continuity guides, and creator retrospectives.",
  },

  // =========================================================================
  // 3. PRIMARY CREATOR SUBSTACKS & CRAFT COLUMNS
  // =========================================================================
  {
    name: "BRIAN MICHAEL BENDIS",
    url: "https://brianmichaelbendis.substack.com/feed",
    category: "national",
    angle: "creator_newsletter",
    description: "Direct creator masterclass and publishing bulletins from Brian Michael Bendis.",
  },
  {
    name: "JAMES TYNION IV",
    url: "https://jamestynioniv.substack.com/feed",
    category: "national",
    angle: "creator_newsletter",
    description: "The Empire of the Tiny Onion: creator-owned publishing insights and process.",
  },
  {
    name: "JONATHAN HICKMAN 3W3M",
    url: "https://3w3m.substack.com/feed",
    category: "national",
    angle: "creator_newsletter",
    description: "Three Worlds, Three Moons: serialized creator-owned universe architecture.",
  },
  {
    name: "ED BRUBAKER",
    url: "https://edbrubaker.substack.com/feed",
    category: "national",
    angle: "creator_newsletter",
    description: "From the Velvet Basement: crime graphic novel craft and behind-the-scenes essays.",
  },
  {
    name: "KELLY SUE DECONNICK",
    url: "https://kellysuedeconnick.substack.com/feed",
    category: "national",
    angle: "creator_newsletter",
    description: "Milkfed Bulletin: storytelling, scripting craft, and industry perspectives.",
  },
  {
    name: "CHIP ZDARSKY",
    url: "https://zdarsky.substack.com/feed",
    category: "national",
    angle: "creator_newsletter",
    description: "It's Chip Zdarsky's Newsletter, OK? Comic writing and illustration commentary.",
  },
  {
    name: "SKOTTIE YOUNG",
    url: "https://skottieyoung.substack.com/feed",
    category: "national",
    angle: "creator_newsletter",
    description: "Stupid Fresh Mess: cover art, creator-owned books, and studio production.",
  },
  {
    name: "TOM KING",
    url: "https://tomking.substack.com/feed",
    category: "national",
    angle: "creator_newsletter",
    description: "Best of Times: scripting notes and Eisner-winning storytelling craft.",
  },
  {
    name: "JEFF LEMIRE",
    url: "https://jefflemire.substack.com/feed",
    category: "international",
    angle: "creator_newsletter",
    description: "Tales from the Farm: indie graphic novel process and serialized projects.",
  },
  {
    name: "MARK MILLAR",
    url: "https://millarworld.substack.com/feed",
    category: "international",
    angle: "creator_newsletter",
    description: "Millarworld News: comic publishing schedules and Hollywood screen adaptations.",
  },
  {
    name: "KIERON GILLEN",
    url: "https://kierongillen.substack.com/feed",
    category: "international",
    angle: "creator_newsletter",
    description: "Word Power: comic structural theory, RPG narrative mechanics, and writing craft.",
  },

  // =========================================================================
  // 4. SECONDARY MARKET, VALUATION & AUCTION HOUSES
  // =========================================================================
  {
    name: "HERITAGE COMIC AUCTIONS",
    url: "https://www.ha.com/c/rss.zx?type=rss-auction-news-comics",
    category: "national",
    angle: "secondary_market",
    description: "Global auction records, signature sales, and vintage pedigree lots.",
  },
  {
    name: "COMICLINK HIGHLIGHTS",
    url: "https://www.comiclink.com/rss/auctions.asp",
    category: "national",
    angle: "secondary_market",
    description: "Vintage certified slabs and original comic art auction highlights.",
  },
  {
    name: "COMICCONNECT NEWS",
    url: "https://www.comicconnect.com/rss/news.xml",
    category: "national",
    angle: "secondary_market",
    description: "World-record Golden Age auction transactions and investment reports.",
  },
  {
    name: "SHORTBOXED VAULT REPORT",
    url: "https://blog.shortboxed.com/rss/",
    category: "national",
    angle: "secondary_market",
    description: "Marketplace intelligence, certified slab sales trends, and liquidity data.",
  },
  {
    name: "KEY COLLECTOR COMICS BLOG",
    url: "https://www.keycollectorcomics.com/rss/articles.xml",
    category: "national",
    angle: "secondary_market",
    description: "First appearance tracking, print run analysis, and key issue movers.",
  },
  {
    name: "GOCOLLECT",
    url: "https://gocollect.com/blog/feed",
    category: "national",
    angle: "secondary_market",
    description: "Secondary market price guides, CGC census analytics, and index velocity.",
  },
  {
    name: "COVRPRICE",
    url: "https://covrprice.com/feed/",
    category: "national",
    angle: "secondary_market",
    description: "Real-time market analytics, raw to slab spread, and trending key issues.",
  },
  {
    name: "COMICBOOK INVEST",
    url: "https://comicbookinvest.com/feed/",
    category: "national",
    angle: "secondary_market",
    description: "Key variant speculation, print run verification, and weekly market watch.",
  },
  {
    name: "COMICHRON",
    url: "https://blog.comichron.com/feeds/posts/default?alt=rss",
    category: "national",
    angle: "secondary_market",
    description: "Definitive historical sales figures, distributor order data, and circulation records.",
  },
  {
    name: "CGC ARTICLES & NEWS",
    url: "https://www.cgccomics.com/news/rss/comics/",
    category: "national",
    angle: "secondary_market",
    description: "Official Certified Guaranty Company census reports and grading standards.",
  },
  {
    name: "CBCS GRADING BLOG",
    url: "https://www.cbcscomics.com/blog/feed/",
    category: "national",
    angle: "secondary_market",
    description: "Authentication insights, verified signatures, and slab restoration data.",
  },
  {
    name: "OVERSTREET ACCESS GAZETTE",
    url: "https://www.gemstonepub.com/rss/gazette.xml",
    category: "national",
    angle: "secondary_market",
    description: "Official Overstreet Comic Book Price Guide bulletins and market reports.",
  },

  // =========================================================================
  // 5. VIDEO BROADCASTS & VIDEO ESSAYS (NATIVE ATOM XML)
  // =========================================================================
  {
    name: "STRIP PANEL NAKED",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCYJk4tO3MWY2g9c_Vp7F11w",
    category: "national",
    angle: "video_essay",
    description: "In-depth formal analysis of visual storytelling and sequential craft.",
  },
  {
    name: "MATT DRAPER ESSAYS",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCZ9w6_7zN8L3qPgY6x2o9qJ",
    category: "national",
    angle: "video_essay",
    description: "Longform thematic and literary video essays on seminal comic storylines.",
  },
  {
    name: "COMIC TROPES",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCrIspgpvJ-UoPccoxgz_u2g",
    category: "national",
    angle: "video_essay",
    description: "Creator retrospectives, publisher forensics, and craft analysis.",
  },
  {
    name: "CARTOONIST KAYFABE",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCU61d9D1F-Y03e05-Pj2-uA",
    category: "national",
    angle: "video_essay",
    description: "Page-by-page creator masterclasses and historical graphic literature reads.",
  },
  {
    name: "COMICPOP",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UChv79pZaoPky3nnhjZl1gPg",
    category: "national",
    angle: "video_essay",
    description: "Deep narrative dives, back issue discussions, and storyline breakdowns.",
  },
  {
    name: "NEAR MINT CONDITION",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCUX6kqTUFQqv1tH6J-0Z5fA",
    category: "national",
    angle: "video_essay",
    description: "Collected editions, omnibus overviews, and comprehensive graphic novel unboxings.",
  },
  {
    name: "SWAGGLEHAUS",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UC-H7eX7WvR9sJ_7zN8L3qPg",
    category: "national",
    angle: "video_essay",
    description: "Secondary market key issue mechanics, price trends, and collecting strategy.",
  },
  {
    name: "AUTOMATIC COMICS",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UC8FhY6x2o9qJ8Z-T7Y0qPQA",
    category: "national",
    angle: "video_essay",
    description: "CGC census tracking, historical ROI, and quantitative comic investing.",
  },
  {
    name: "LORDS OF THE LONG BOX",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCowVZaDHDd7eoiU8ll5QPGQ",
    category: "national",
    angle: "video_essay",
    description: "Speculation heat, upcoming key alerts, and print run discoveries.",
  },
  {
    name: "VARIANT COMICS",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UC9c1MvP4U9m5JpS6a3N7Y7Q",
    category: "national",
    angle: "video_essay",
    description: "Canon lore, character origins, and multi-universe storyline timelines.",
  },
  {
    name: "COMICS EXPLAINED",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCjTwyU_xO0qE9Q8Y-B7hAFA",
    category: "national",
    angle: "video_essay",
    description: "Cosmic timelines, event breakdowns, and exhaustive comic universe lore.",
  },
  {
    name: "CASUALLY COMICS",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCq3Wpi_nZgCgJb0R7z2YpXg",
    category: "national",
    angle: "video_essay",
    description: "Deep dive lore, Golden Age obscurities, and character continuity forensics.",
  },

  // =========================================================================
  // 6. PUBLISHER DIRECT bulletins & MANGA HOUSES
  // =========================================================================
  {
    name: "MARVEL COMICS OFFICIAL",
    url: "https://www.marvel.com/feeds/rss/articles_news",
    category: "national",
    angle: "publisher_bulletin",
    description: "Official Marvel news, upcoming series launches, and creative announcements.",
  },
  {
    name: "DC COMICS OFFICIAL",
    url: "https://www.dc.com/feed",
    category: "national",
    angle: "publisher_bulletin",
    description: "Official DC releases, creative team lineups, and Batman/Superman universe news.",
  },
  {
    name: "IMAGE COMICS",
    url: "https://imagecomics.com/news.atom",
    category: "national",
    angle: "publisher_bulletin",
    description: "Direct releases from the premier creator-owned graphic fiction house.",
  },
  {
    name: "DARK HORSE",
    url: "https://www.darkhorse.com/Blog/rss",
    category: "national",
    angle: "publisher_bulletin",
    description: "Indie masterworks, licensed franchises, and graphic literature publishing.",
  },
  {
    name: "2000 AD",
    url: "https://2000ad.com/news/feed/",
    category: "international",
    angle: "publisher_bulletin",
    description: "The Galaxy's Greatest Comic: Judge Dredd and British sci-fi sequential art.",
  },
  {
    name: "IDW PUBLISHING",
    url: "https://idwpublishing.com/blogs/news.atom",
    category: "national",
    angle: "publisher_bulletin",
    description: "Official releases for licensed franchises, TMNT, and original graphic novels.",
  },
  {
    name: "BOOM STUDIOS",
    url: "https://www.boom-studios.com/feed/",
    category: "national",
    angle: "publisher_bulletin",
    description: "Creator-owned indie hits, Power Rangers, and acclaimed graphic fiction.",
  },
  {
    name: "FANTAGRAPHICS BLOG",
    url: "https://www.fantagraphics.com/blogs/flog.atom",
    category: "national",
    angle: "publisher_bulletin",
    description: "The premier publisher of classic comics, international graphic novels, and underground comix.",
  },
  {
    name: "DRAWN AND QUARTERLY",
    url: "https://drawnandquarterly.com/feed/",
    category: "international",
    angle: "publisher_bulletin",
    description: "Celebrated Montreal literary graphic novel and international art publisher.",
  },
  {
    name: "KODANSHA MANGA NEWS",
    url: "https://kodansha.us/feed/",
    category: "national",
    angle: "publisher_bulletin",
    description: "Official North American releases for Kodansha serialized manga.",
  },
  {
    name: "VIZ MEDIA MANGA BLOG",
    url: "https://www.viz.com/blog/feed",
    category: "national",
    angle: "publisher_bulletin",
    description: "Shonen Jump, Viz Signature, and official English manga translations.",
  },
  {
    name: "YEN PRESS RELEASES",
    url: "https://yenpress.com/feed/",
    category: "national",
    angle: "publisher_bulletin",
    description: "Manga, light novels, and Korean manhwa official English releases.",
  },

  // =========================================================================
  // 7. INDUSTRY TRADES & RETAIL bulletins
  // =========================================================================
  {
    name: "POPVERSE",
    url: "https://www.thepopverse.com/feed",
    category: "national",
    angle: "industry_trade",
    description: "ReedPop industry news, convention announcements, and retail insights.",
  },
  {
    name: "COMIC WATCH",
    url: "https://comic-watch.com/feed",
    category: "national",
    angle: "industry_trade",
    description: "Comprehensive weekly comic solicits, creator interviews, and critical reviews.",
  },
  {
    name: "BLEEDING COOL",
    url: "https://bleedingcool.com/comics/feed/",
    category: "national",
    angle: "industry_trade",
    description: "Scoops, retail order analysis, print run discoveries, and comic industry news.",
  },
  {
    name: "THE BEAT",
    url: "https://www.comicsbeat.com/feed/",
    category: "national",
    angle: "industry_trade",
    description: "Heidi MacDonald's news blog of comic culture, awards, and publishing business.",
  },
  {
    name: "AIPT",
    url: "https://aiptcomics.com/feed/",
    category: "national",
    angle: "industry_trade",
    description: "Comprehensive previews, weekly reviews, and creator spotlights.",
  },
  {
    name: "ICV2",
    url: "https://icv2.com/rss",
    category: "national",
    angle: "industry_trade",
    description: "The business of pop culture, direct market distribution, and retail sales rankings.",
  },
  {
    name: "MULTIVERSITY COMICS",
    url: "https://www.multiversitycomics.com/feed/",
    category: "national",
    angle: "industry_trade",
    description: "Creator interviews, independent comic spotlights, and editorial columns.",
  },
  {
    name: "PREVIEWS WORLD",
    url: "https://www.previewsworld.com/rss",
    category: "national",
    angle: "industry_trade",
    description: "Monthly order catalog, FOC (Final Order Cutoff) alerts, and distributor listings.",
  },
  {
    name: "COMICSXF",
    url: "https://comicsxf.com/feed/",
    category: "national",
    angle: "industry_trade",
    description: "Deep dive X-Men continuity analysis, indie reviews, and creator interviews.",
  },
  {
    name: "MAJOR SPOILERS",
    url: "https://majorspoilers.com/feed/",
    category: "national",
    angle: "industry_trade",
    description: "Daily reviews, podcast roundups, and indie solicits.",
  },
];
