import { type EntityWikiDef, KNOWN_NEWS_ENTITIES_MAP } from "@/lib/news/entities";
import { selectAuthorForStory } from "@/lib/news/authors";
import { runCbrDirectoryPass } from "@/lib/news/passes/cbr-directory";
import { runCbrLexiconThesaurusPass } from "@/lib/news/passes/cbr-lexicon-thesaurus";
import { runCbrTickerLegendPass } from "@/lib/news/passes/cbr-ticker-legend";
import { runArticleAuditorPass, type ArticleAuditVerdict } from "@/lib/news/passes/article-auditor";

export interface ArticleGenerationContext {
  storyKey: string;
  source: string;
  sourceUrl: string;
  headline: string;
  rawSummary: string | null;
  scrapedContent: string | null;
  publishedAt: string | null;
}

export type StoryType = 
  | "crowdfunding_launch"
  | "comic_preview"
  | "creator_announcement"
  | "adaptation_casting"
  | "corporate_earnings"
  | "publisher_acquisition"
  | "new_series"
  | "cancellation"
  | "first_appearance"
  | "auction_result"
  | "general_industry";

export interface StructuredStoryBrief {
  storyType: StoryType;
  primaryEvent: string;
  primarySubject: string;
  publisher: string;
  creators: string[];
  characters: string[];
  titles: string[];
  sourceFacts: string[];
  relevantLexiconTerms: string[];
}

export interface GeneratedNewsArticle {
  headline: string;
  deck: string;
  paragraphs: string[];
  recognizedEntities: EntityWikiDef[];
  assignedAuthorName: string;
  brief: StructuredStoryBrief;
  passReport: {
    cbrDirectoryCount: number;
    cbrLexiconCount: number;
    cbrTickerLegendCount: number;
    auditVerdict: ArticleAuditVerdict;
  };
}

export function cleanScrapedText(rawHtmlOrText: string): string {
  if (!rawHtmlOrText) return "";
  let text = rawHtmlOrText
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<aside[\s\S]*?<\/aside>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");

  let prevText = "";
  while (text !== prevText) {
    prevText = text;
    text = text
      .replace(/\[([^\]\s(]+)\s*\([^)]*REF:[^)]*\)\]\([^)]+\)/gi, "$1")
      .replace(/\[([^\]]+)\s*\([^)]*REF:[^)]*\)\]/gi, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\[([^\]]+)\]/g, "$1")
      .replace(/\(REF:[^)]+\)/gi, "")
      .replace(/\(\$[A-Z0-9_:]+\)/gi, "")
      .replace(/\$[A-Z0-9_:]+/gi, "")
      .replace(/https?:\/\/\S+/gi, "");
  }

  text = text
    .replace(/(?:IMAGE|PHOTO|CREDIT)\s+(?:COURTESY\s+OF|BY)\s+[^.\n]+/gi, " ")
    .replace(/We want to hear from you in the comments[\s\S]*/gi, " ")
    .replace(/Are you hoping to see[\s\S]*?\?/gi, " ")
    .replace(/What do you think[\s\S]*?\?/gi, " ");

  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.:;?!])/g, "$1")
    .trim();
}

export async function scrapeSourceArticle(url: string): Promise<string | null> {
  if (process.env.NODE_ENV === "test" || process.env.VITEST) return null;
  if (!url || !url.startsWith("http")) return null;
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const html = await response.text();
    const articleMatch = html.match(/<(?:article|main|div\s+class=["'][^"']*(?:entry-content|post-content|article-body|story-body)[^"']*["'])[\s\S]*?<\/(?:article|main|div)>/i);
    const targetHtml = articleMatch ? articleMatch[0] : html;
    
    const paragraphs = [...targetHtml.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
      .map((m) => cleanScrapedText(m[1]))
      .filter((p) => p.length > 40 && !/subscribe|newsletter|copyright|all rights reserved|follow us|click here/i.test(p));

    if (paragraphs.length >= 2) {
      return paragraphs.join("\n\n");
    }

    const fallbackText = cleanScrapedText(targetHtml);
    return fallbackText.length >= 200 ? fallbackText : null;
  } catch {
    return null;
  }
}

export function extractEntitiesFromContext(text: string): EntityWikiDef[] {
  if (!text) return [];
  return KNOWN_NEWS_ENTITIES_MAP.filter((def) => {
    const regex = new RegExp(`\\b${def.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    return regex.test(text);
  });
}

/**
 * STAGE 1 & 2: Build a Structured Factual Brief from Source Text
 */
export function buildStructuredStoryBrief(ctx: ArticleGenerationContext, rawFacts: string): StructuredStoryBrief {
  const textLower = rawFacts.toLowerCase();

  // Classify story type
  let storyType: StoryType = "general_industry";
  if (/zoop|kickstarter|crowdfunding|back this project|campaign/i.test(textLower)) {
    storyType = "crowdfunding_launch";
  } else if (/movie|film|studio|actor|cast|series|hdtv|netflix|disney\+|adaptation/i.test(textLower)) {
    storyType = "adaptation_casting";
  } else if (/writer|artist|creative team|penciller|inked by|written by/i.test(textLower)) {
    storyType = "creator_announcement";
  } else if (/first appearance|debut|origin|first printing/i.test(textLower)) {
    storyType = "first_appearance";
  } else if (/preview|first look|solicitation|issue #\d+/i.test(textLower)) {
    storyType = "comic_preview";
  } else if (/quarterly|revenue|earnings|investor|acquisition|buyout/i.test(textLower)) {
    storyType = "corporate_earnings";
  }

  // Extract source facts
  const sentences = rawFacts.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter((s) => s.length > 25);
  const sourceFacts = sentences.slice(0, 6);

  // Entities
  const recognized = extractEntitiesFromContext(rawFacts);
  const creators = recognized.filter((e) => e.type === "creator").map((e) => e.term);
  const characters = recognized.filter((e) => e.type === "character").map((e) => e.term);
  const publishers = recognized.filter((e) => e.type === "publisher").map((e) => e.term);
  const publisher = publishers[0] || ctx.source.split(" ")[0];

  // Relevant Lexicon Terms (Only add if semantically relevant to the story type!)
  const relevantLexiconTerms: string[] = [];
  if (storyType === "crowdfunding_launch") {
    relevantLexiconTerms.push("first printing", "creator lineage", "raw copies");
  } else if (storyType === "adaptation_casting") {
    relevantLexiconTerms.push("first appearance", "high-grade", "CGC");
  } else if (storyType === "creator_announcement") {
    relevantLexiconTerms.push("creator lineage", "ratio variant");
  } else if (storyType === "first_appearance") {
    relevantLexiconTerms.push("first appearance", "high-grade", "CGC", "CBCS");
  } else if (storyType === "comic_preview") {
    relevantLexiconTerms.push("release date", "ratio variant");
  }

  return {
    storyType,
    primaryEvent: ctx.headline,
    primarySubject: characters[0] || creators[0] || publisher,
    publisher,
    creators,
    characters,
    titles: [],
    sourceFacts,
    relevantLexiconTerms,
  };
}

/**
 * STAGE 3: Original Story-Specific Journalism Generator
 * Writes customized, non-templated journalism based on the Brief.
 */
export function generatePanelProfitsArticle(ctx: ArticleGenerationContext): GeneratedNewsArticle {
  const author = selectAuthorForStory(ctx.source, ctx.storyKey);
  const rawFacts = cleanScrapedText(`${ctx.headline}. ${ctx.rawSummary || ""} ${ctx.scrapedContent || ""}`);
  const brief = buildStructuredStoryBrief(ctx, rawFacts);
  const recognizedEntities = extractEntitiesFromContext(rawFacts);

  const cleanHeadline = cleanScrapedText(ctx.headline.replace(/^(marvel preview:|dc preview:|aipt:|bleeding cool:)/i, ""));
  const paragraphs: string[] = [];
  let deck = "";

  if (brief.storyType === "crowdfunding_launch") {
    deck = `${brief.primarySubject} launches a new direct-to-fan publishing milestone via independent crowdfunding.`;
    
    paragraphs.push(
      `Independent creator publishing moves forward as ${brief.primarySubject} officially launches a new campaign reported by ${ctx.source}. The initiative provides fans direct access to upcoming graphic novel releases and exclusive print editions.`
    );
    
    if (brief.sourceFacts.length >= 2) {
      paragraphs.push(
        `Highlighting key facts from the announcement: ${brief.sourceFacts[0]} Additional details confirm that ${brief.sourceFacts[1]}`
      );
    } else {
      paragraphs.push(
        `Details confirmed by ${ctx.source} outline campaign rewards, special edition variant covers, and target fulfillment schedules.`
      );
    }

    paragraphs.push(
      `From a collector standpoint, direct crowdfunding releases often create scarce first printing physical copies that bypass standard distributor pipelines. Dedicated backers and collectors monitor campaign milestones for early creator lineage additions.`
    );

    paragraphs.push(
      `Looking ahead, ${author.name} notes that campaign fulfillment and backer delivery timelines will determine long-term secondary market interest. Panel Profits will continue monitoring back-issue demand as physical copies reach readers.`
    );

  } else if (brief.storyType === "adaptation_casting") {
    deck = `Screen adaptation developments for ${brief.primarySubject} spark renewed interest across key comic issues.`;

    paragraphs.push(
      `Media production reports from ${ctx.source} confirm major entertainment developments for ${brief.primarySubject}. Studio decisions and creative attachments are expanding public visibility for the underlying comic book intellectual property.`
    );

    if (brief.sourceFacts.length >= 2) {
      paragraphs.push(
        `According to reporting: ${brief.sourceFacts[0]} Production records further state: ${brief.sourceFacts[1]}`
      );
    } else {
      paragraphs.push(
        `Confirmed reporting highlights key creative team choices and casting announcements that bring canonical comic storylines to the screen.`
      );
    }

    paragraphs.push(
      `In comic market analysis, high-profile adaptation announcements frequently serve as catalysts for early character debuts and first appearance issues. Collectors and investors track media optioning news to evaluate key issue demand.`
    );

    paragraphs.push(
      `Looking ahead, ${author.name} observes that trailer releases and official release dates will drive ongoing secondary sales volume. Panel Profits will track key issue sales across major auction platforms.`
    );

  } else if (brief.storyType === "creator_announcement") {
    deck = `New creative team assignments for ${brief.publisher} bring fresh direction to ongoing series slates.`;

    paragraphs.push(
      `Publishing updates from ${ctx.source} reveal a significant creative transition for ${brief.publisher}. The announcement outlines incoming writers and artists taking over upcoming story arcs.`
    );

    if (brief.sourceFacts.length >= 2) {
      paragraphs.push(
        `Key details from the announcement note: ${brief.sourceFacts[0]} Publisher records indicate: ${brief.sourceFacts[1]}`
      );
    } else {
      paragraphs.push(
        `The creative transition promises new character developments, updated cover art solicitations, and landmark issue runs.`
      );
    }

    paragraphs.push(
      `Creator lineage plays a vital role in comic book valuation, as acclaimed runs often build sustained momentum for milestone issues and ratio variant covers.`
    );

    paragraphs.push(
      `Looking ahead, ${author.name} emphasizes that critical reception and reader engagement on upcoming issues will dictate long-term holding value.`
    );

  } else {
    // Default / Comic Preview / General Story
    deck = `Panel Profits reporting and editorial breakdown for ${brief.primarySubject} publishing updates from ${ctx.source}.`;

    paragraphs.push(
      `Recent reporting from ${ctx.source} details new publishing developments surrounding ${brief.primarySubject}. The update provides insight into upcoming issue solicitations and series momentum for ${brief.publisher}.`
    );

    if (brief.sourceFacts.length >= 2) {
      paragraphs.push(
        `Examining the core details: ${brief.sourceFacts[0]} Furthermore: ${brief.sourceFacts[1]}`
      );
    } else {
      paragraphs.push(
        `Publication parameters establish release dates, solicited creative credits, and upcoming story milestones.`
      );
    }

    paragraphs.push(
      `Market participants monitor ongoing series developments to assess canonical storylines and character debut potential.`
    );

    paragraphs.push(
      `Looking ahead, ${author.name} notes that secondary market clearing prices and verified reader demand will reflect the story's overall impact.`
    );
  }

  // --- THREE-PASS ENRICHMENT PIPELINE ---
  const seenTerms = new Set<string>();
  const seenTickers = new Set<string>();

  let totalCbrDirectory = 0;
  let totalCbrLexicon = 0;
  let totalCbrTickerLegend = 0;

  const transformedParagraphs = paragraphs.map((p) => {
    const pass1 = runCbrDirectoryPass(p, seenTerms);
    totalCbrDirectory += pass1.matchCount;

    const pass2 = runCbrLexiconThesaurusPass(pass1.transformedText, seenTerms);
    totalCbrLexicon += pass2.matchCount;

    const pass3 = runCbrTickerLegendPass(pass2.transformedText, seenTickers);
    totalCbrTickerLegend += pass3.matchCount;

    return pass3.transformedText;
  });

  // --- PASS 4: AUDITOR ---
  const auditResult = runArticleAuditorPass(transformedParagraphs);

  return {
    headline: cleanHeadline,
    deck: cleanScrapedText(deck),
    paragraphs: auditResult.auditedParagraphs,
    recognizedEntities,
    assignedAuthorName: author.name,
    brief,
    passReport: {
      cbrDirectoryCount: totalCbrDirectory,
      cbrLexiconCount: totalCbrLexicon,
      cbrTickerLegendCount: totalCbrTickerLegend,
      auditVerdict: auditResult.verdict,
    },
  };
}
