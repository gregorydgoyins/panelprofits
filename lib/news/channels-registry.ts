/**
 * Comprehensive Channel & Video Registry for Comic Intelligence.
 * 
 * Encompasses:
 * 1. Immediate Dedicated Comic Journalism & Trade Outlets (30+ outlets)
 * 2. High-Profile YouTube Video Essay Channels (NerdSync, Comics Explained, Variant, ComicPOP, etc.)
 * 3. Pro Creator Substacks & Independent Newsletters
 * 4. Secondary Market, Grading & Valuation Feeds
 */

import type { NewsCategory, NewsSource } from "./types";

export interface ActiveFeedChannel extends NewsSource {
  channelType: "trade" | "video" | "creator" | "market";
  youtubeChannelId?: string;
  description?: string;
}

export const ACTIVE_NEWS_CHANNELS: ActiveFeedChannel[] = [
  // =========================================================================
  // 1. YouTube Video Essay & Media Analysis Channels
  // =========================================================================
  {
    name: "NERDSYNC ESSAYS",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCURz5rKDgt7YibUSageNhEw",
    category: "national",
    channelType: "video",
    youtubeChannelId: "UCURz5rKDgt7YibUSageNhEw",
    description: "In-depth video essays exploring comic history, philosophy, and sequential art semiotics by Scott Niswander.",
  },
  {
    name: "COMICS EXPLAINED",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCKxQmKgrkUv4S7P5w0pLayw",
    category: "national",
    channelType: "video",
    youtubeChannelId: "UCKxQmKgrkUv4S7P5w0pLayw",
    description: "Comprehensive breakdowns of major Marvel, DC, and indie storyline events and character evolutions by Rob Jefferson.",
  },
  {
    name: "VARIANT COMICS",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UC4kjDjhexSVuC8JWk4ZanFw",
    category: "national",
    channelType: "video",
    youtubeChannelId: "UC4kjDjhexSVuC8JWk4ZanFw",
    description: "Character histories, comic origins, and major story arc breakdowns.",
  },
  {
    name: "COMIC DRAKE",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UC9lNNtAARC-n0WC7tm-884Q",
    category: "national",
    channelType: "video",
    youtubeChannelId: "UC9lNNtAARC-n0WC7tm-884Q",
    description: "Analytical comic retrospectives, weird continuity deep-dives, and superhero culture.",
  },
  {
    name: "COMICPOP",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCEqBMWd6aeCVLAUMEO5WqIw",
    category: "national",
    channelType: "video",
    youtubeChannelId: "UCEqBMWd6aeCVLAUMEO5WqIw",
    description: "Back Issues, comic book discussions, industry commentary, and live analysis.",
  },
  {
    name: "CASUALLY COMICS",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCjKC1V-BWoFRVLAmYeoPCWw",
    category: "national",
    channelType: "video",
    youtubeChannelId: "UCjKC1V-BWoFRVLAmYeoPCWw",
    description: "Deep retrospectives on obscure comic storylines, bizarre character shifts, and Golden/Silver Age history.",
  },
  {
    name: "NEAR MINT CONDITION",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCUX6kqTUFzQaKJKBaqzuNdg",
    category: "national",
    channelType: "video",
    youtubeChannelId: "UCUX6kqTUFzQaKJKBaqzuNdg",
    description: "Authoritative omnibus overviews, collected editions, trade paperbacks, and publisher release schedules.",
  },
  {
    name: "COMIC TROPES",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UC-dGYF1il5OP0lNHChHdhzg",
    category: "national",
    channelType: "video",
    youtubeChannelId: "UC-dGYF1il5OP0lNHChHdhzg",
    description: "Insightful documentary retrospectives on artists, writers, and historical publishing eras.",
  },
  {
    name: "MATT DRAPER ESSAYS",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCialJ2te1CSh8DLU8SK5D_w",
    category: "national",
    channelType: "video",
    youtubeChannelId: "UCialJ2te1CSh8DLU8SK5D_w",
    description: "High-production video essays analyzing cinematic and graphic storytelling techniques.",
  },
  {
    name: "COMICTOM101",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCqRVhjeLzR4PErfe_jOqHMA",
    category: "national",
    channelType: "video",
    youtubeChannelId: "UCqRVhjeLzR4PErfe_jOqHMA",
    description: "Weekly top 10 trending comic books, market movements, and key issue speculation.",
  },
  {
    name: "GEM MINT COLLECTIBLES",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UC31fEeAOTnfRgvGFwYJsFUA",
    category: "national",
    channelType: "video",
    youtubeChannelId: "UC31fEeAOTnfRgvGFwYJsFUA",
    description: "Omnibus reviews, collected edition overviews, and high-grade comic showcases.",
  },
  {
    name: "SWAGGLEHAUS COMICS",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UC1Ti4nH4lLi3Co9tcc4Ddvg",
    category: "national",
    channelType: "video",
    youtubeChannelId: "UC1Ti4nH4lLi3Co9tcc4Ddvg",
    description: "Comic book investing, CGC grading returns, market trends, and key issue hunting.",
  },
  {
    name: "POP CULTURE DETECTIVE",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCHiwtz2tCEfS17N9A-WoSSw",
    category: "national",
    channelType: "video",
    youtubeChannelId: "UCHiwtz2tCEfS17N9A-WoSSw",
    description: "Critical media analysis examining superhero tropes, masculinity, and narrative arcs.",
  },

  // =========================================================================
  // 2. Immediate Dedicated Comic Journalism & Trade Outlets (30+ outlets)
  // =========================================================================
  {
    name: "BLEEDING COOL",
    url: "https://bleedingcool.com/comics/feed/",
    category: "national",
    channelType: "trade",
    description: "Breaking comic industry scoops, gossip, creative changes, and publisher rumors.",
  },
  {
    name: "CBR",
    url: "https://www.cbr.com/feed/",
    category: "national",
    channelType: "trade",
    description: "Comic Book Resources industry news, previews, interviews, and feature analysis.",
  },
  {
    name: "THE BEAT",
    url: "https://www.comicsbeat.com/feed/",
    category: "national",
    channelType: "trade",
    description: "Heidi MacDonald's premier comics news site covering independent, mainstream, and graphic novels.",
  },
  {
    name: "AIPT COMICS",
    url: "https://aiptcomics.com/feed/",
    category: "national",
    channelType: "trade",
    description: "Comic reviews, X-Men previews, creator interviews, and industry coverage.",
  },
  {
    name: "ICV2",
    url: "https://icv2.com/rss",
    category: "national",
    channelType: "trade",
    description: "Direct market retail trade news, distributor reports, and sales rankings.",
  },
  {
    name: "COMICS JOURNAL",
    url: "https://www.tcj.com/feed/",
    category: "international",
    channelType: "trade",
    description: "Fantagraphics-published journal of critical history, cartooning, and serious sequential art.",
  },
  {
    name: "FIRST COMICS NEWS",
    url: "https://www.firstcomicsnews.com/feed/",
    category: "national",
    channelType: "trade",
    description: "Daily comic book press releases, solicits, and publisher bulletins.",
  },
  {
    name: "MAJOR SPOILERS",
    url: "https://majorspoilers.com/feed/",
    category: "national",
    channelType: "trade",
    description: "Comic reviews, podcasts, previews, and independent creator interviews.",
  },
  {
    name: "GRAPHIC POLICY",
    url: "https://graphicpolicy.com/feed/",
    category: "national",
    channelType: "trade",
    description: "Comics, politics, crowdfunding campaigns, and graphic novel commentary.",
  },
  {
    name: "SMASH PAGES",
    url: "https://smashpages.net/feed/",
    category: "national",
    channelType: "trade",
    description: "Independent sequential art journalism, webcomics, and creator interviews.",
  },
  {
    name: "BROKEN FRONTIER",
    url: "https://www.brokenfrontier.com/feed/",
    category: "international",
    channelType: "trade",
    description: "UK-based hub for independent comics, small press, and alternative graphic literature.",
  },
  {
    name: "2000 AD NEWS",
    url: "https://2000ad.com/feed/",
    category: "international",
    channelType: "trade",
    description: "Home of Judge Dredd, British sci-fi comics, and Rebellion publishing updates.",
  },
  {
    name: "PREVIEWS WORLD",
    url: "https://www.previewsworld.com/rss",
    category: "national",
    channelType: "trade",
    description: "Monthly comic catalog releases, order forms, and retailer solicitations.",
  },

  // =========================================================================
  // 3. Secondary Market & Comic Equity Analytics Feeds
  // =========================================================================
  {
    name: "COVRPRICE",
    url: "https://covrprice.com/feed/",
    category: "national",
    channelType: "market",
    description: "Secondary market trends, record sales reports, and top 10 hot comic lists.",
  },
  {
    name: "COMICBOOK INVEST",
    url: "https://comicbookinvest.com/feed/",
    category: "national",
    channelType: "market",
    description: "CBSI key issue speculation, variant hunting, and secondary market analysis.",
  },

  // =========================================================================
  // 4. Pro Creator Substacks & Elite Newsletters
  // =========================================================================
  {
    name: "JAMES TYNION IV: TINY ONION",
    url: "https://jamestynioniv.substack.com/feed",
    category: "national",
    channelType: "creator",
    description: "Creator of Something Is Killing the Children and Department of Truth on independent publishing.",
  },
  {
    name: "CHIP ZDARSKY: CHIPPIN' AWAY",
    url: "https://zdarsky.substack.com/feed",
    category: "national",
    channelType: "creator",
    description: "Batman, Daredevil, and Public Domain creator on process, writing, and industry realities.",
  },
  {
    name: "SCOTT SNYDER: OUR BEST JACKETT",
    url: "https://scottsnyder.substack.com/feed",
    category: "national",
    channelType: "creator",
    description: "Eisner-winning Batman writer teaching comic scriptwriting and Best Jackett Press updates.",
  },
  {
    name: "JONATHAN HICKMAN: 3W/3M",
    url: "https://3w3m.substack.com/feed",
    category: "national",
    channelType: "creator",
    description: "Three Worlds / Three Moons collaborative world-building universe and graphic storytelling.",
  },
  {
    name: "KELLY THOMPSON: SEMI-FINALIST",
    url: "https://1979semifinalist.substack.com/feed",
    category: "national",
    channelType: "creator",
    description: "Eisner winner (Birds of Prey, Black Cloak) on scripting, artist collaboration, and serial storytelling.",
  },
];
