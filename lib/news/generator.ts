import crypto from "node:crypto";
import { type EntityWikiDef, KNOWN_NEWS_ENTITIES_MAP } from "@/lib/news/entities";
import { selectAuthorForStory } from "@/lib/news/authors";

export interface ArticleGenerationContext {
  storyKey: string;
  source: string;
  sourceUrl: string;
  headline: string;
  rawSummary: string | null;
  scrapedContent: string | null;
  publishedAt: string | null;
}

import { runCbrDirectoryPass } from "@/lib/news/passes/cbr-directory";
import { runCbrLexiconThesaurusPass } from "@/lib/news/passes/cbr-lexicon-thesaurus";
import { runCbrTickerLegendPass } from "@/lib/news/passes/cbr-ticker-legend";
import { runArticleAuditorPass, type ArticleAuditVerdict } from "@/lib/news/passes/article-auditor";

export interface PassExecutionReport {
  cbrDirectoryCount: number;
  cbrLexiconCount: number;
  cbrTickerLegendCount: number;
  auditVerdict: ArticleAuditVerdict;
}

export interface GeneratedNewsArticle {
  headline: string;
  deck: string;
  paragraphs: string[];
  recognizedEntities: EntityWikiDef[];
  assignedAuthorName: string;
  passReport: PassExecutionReport;
}

/**
 * Completely purges all raw markdown links [text](url), raw brackets [text], 
 * raw ticker tags ($TICKER), internal reference tags (REF:...), and HTML tags from any input string.
 * Guarantees 100% clean, pure plain text output.
 */
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

  // Multi-pass recursive sanitization to guarantee zero leftover brackets, REF tags, or URLs
  let prevText = "";
  while (text !== prevText) {
    prevText = text;
    text = text
      .replace(/\[([^\]\s(]+)\s*\([^)]*REF:[^)]*\)\]\([^)]+\)/gi, "$1") // [CGC (REF:CGC)](url) -> CGC
      .replace(/\[([^\]]+)\s*\([^)]*REF:[^)]*\)\]/gi, "$1")            // [CGC (REF:CGC)] -> CGC
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")                          // [text](url) -> text
      .replace(/\[([^\]]+)\]/g, "$1")                                  // [text] -> text
      .replace(/\(REF:[^)]+\)/gi, "")                                   // (REF:TAG) -> empty
      .replace(/\(\$[A-Z0-9_:]+\)/gi, "")                               // ($TICKER) -> empty
      .replace(/\$[A-Z0-9_:]+/gi, "")                                   // $TICKER -> empty
      .replace(/https?:\/\/\S+/gi, "");                                 // raw http URLs -> empty
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

/**
 * Scrapes source article URL and returns clean plain-text content.
 */
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

/**
 * Identifies recognized Panel Profits entities in text.
 */
export function extractEntitiesFromContext(text: string): EntityWikiDef[] {
  if (!text) return [];
  return KNOWN_NEWS_ENTITIES_MAP.filter((def) => {
    const regex = new RegExp(`\\b${def.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    return regex.test(text);
  });
}

/**
 * Synthesizes a completely clean 4-paragraph Panel Profits article without any raw links,
 * brackets, internal REF tags, or ticker clutter. Executes 3-pass scanning pipeline.
 */
export function generatePanelProfitsArticle(ctx: ArticleGenerationContext): GeneratedNewsArticle {
  const author = selectAuthorForStory(ctx.source, ctx.storyKey);
  const rawFacts = cleanScrapedText(`${ctx.headline}. ${ctx.rawSummary || ""} ${ctx.scrapedContent || ""}`);
  const recognizedEntities = extractEntitiesFromContext(rawFacts);

  const primaryEntity = recognizedEntities.find((e) => e.type === "character") || recognizedEntities.find((e) => e.type === "creator") || recognizedEntities[0];
  const publisherEntity = recognizedEntities.find((e) => e.type === "publisher") || { term: ctx.source.split(" ")[0], ticker: "$PUB", target: "intelligence" as const, wikiPath: "/intelligence?q=Publisher" };

  const isMovieAdaptation = /movie|film|studio|screen|actor|cast|trailer|director|hdtv|series|disney|warner|sony|netflix/i.test(rawFacts);
  const isCreativeChange = /writer|artist|creative team|written by|art by|cover by|penciller|author|run|debuts|takes over/i.test(rawFacts);
  const isKeyAppearance = /first appearance|debut|origin|death|costume|returns|villain|joins|introduces|crossover/i.test(rawFacts);

  const cleanHeadline = cleanScrapedText(ctx.headline.replace(/^(marvel preview:|dc preview:|aipt:|bleeding cool:)/i, ""));

  let deck = "";
  if (isMovieAdaptation) {
    deck = `Entertainment licensing signals and IP adaptation momentum surrounding ${primaryEntity?.term || "key franchise assets"} trigger market evaluation.`;
  } else if (isCreativeChange) {
    deck = `New creative team solicitations and title lineage transitions spark secondary interest across creator-backed key issues.`;
  } else if (isKeyAppearance) {
    deck = `Major character milestone and potential catalyst event under active scrutiny by Panel Profits market analysts.`;
  } else {
    deck = `Panel Profits financial analysis and industry impact evaluation for ${publisherEntity.term} market assets.`;
  }

  const rawParagraphs: string[] = [];

  // Paragraph 1: LEAD ANNOUNCEMENT (Clean Prose)
  if (isMovieAdaptation) {
    rawParagraphs.push(
      `Official industry reporting confirms a major media development concerning ${primaryEntity ? primaryEntity.term : "core intellectual property"} from ${publisherEntity.term}. According to verified reporting from ${ctx.source}, production and studio movements are establishing new adaptation exposure for the underlying comic book publications.`
    );
  } else if (isCreativeChange) {
    rawParagraphs.push(
      `Industry solicitations and publisher announcements highlight an upcoming creative team transition for ${publisherEntity.term}'s ongoing publishing slate. Original source reporting from ${ctx.source} confirms new talent assignments that directly affect creator lineage and series momentum.`
    );
  } else if (isKeyAppearance) {
    rawParagraphs.push(
      `Publisher solicitations and canonical previews establish a significant storyline milestone involving ${primaryEntity ? primaryEntity.term : "key character assets"}. First-look details corroborated by ${ctx.source} indicate potential debut elements or structural character shifts within ${publisherEntity.term}'s distribution line.`
    );
  } else {
    rawParagraphs.push(
      `Recent distribution data and corporate updates from ${ctx.source} detail a notable market development for ${publisherEntity.term}. The report provides updated operational metrics and publishing milestones that bear directly on secondary market liquidity.`
    );
  }

  // Paragraph 2: FACTUAL DETAILS (Cleaned Context)
  if (ctx.scrapedContent && ctx.scrapedContent.length > 150) {
    const cleanedParagraphs = ctx.scrapedContent
      .split(/\n\n+/)
      .map((p) => cleanScrapedText(p))
      .filter((p) => p.length > 60 && !p.toLowerCase().includes("subscribe"));
    
    if (cleanedParagraphs.length >= 2) {
      rawParagraphs.push(
        `Examining the factual reporting: ${cleanedParagraphs[0]} Furthermore, editorial records indicate that ${cleanedParagraphs[1]}`
      );
    } else {
      rawParagraphs.push(`Factual details confirmed by the source highlight: ${cleanedParagraphs[0]}`);
    }
  } else if (ctx.rawSummary && ctx.rawSummary.length > 80) {
    rawParagraphs.push(
      `The underlying announcement details specific publication parameters: ${cleanScrapedText(ctx.rawSummary)} Panel Profits analysts note that these release parameters establish the initial ordering context for retail distributors.`
    );
  } else {
    rawParagraphs.push(
      `Publication details establish key market coordinates, including issue numbering, solicited creative credits, and scheduled distribution dates. Retailer order allocations will determine initial scarcity floor dynamics upon release.`
    );
  }

  // Paragraph 3: FINANCIAL LEXICON & MARKET IMPACT
  if (isMovieAdaptation) {
    rawParagraphs.push(
      `From a comic equity perspective, adaptation announcements serve as primary demand catalysts for early key appearances and first printing back-issue supply. When studio optioning accelerates public interest, uncertified raw copies and high-grade CGC or CBCS census slabs historically experience tightening bid-ask spreads and heightened auction velocity.`
    );
  } else if (isCreativeChange) {
    rawParagraphs.push(
      `In terms of asset quality and creator lineage, creative changes frequently alter secondary market trajectory. A high-profile writer or artist run can create sustained price momentum for first appearances, ratio variant covers, and landmark issue runs, while underperforming arcs tend to see inventory accumulation.`
    );
  } else if (isKeyAppearance) {
    rawParagraphs.push(
      `Market participants evaluate new character debuts and major key issue milestones as potential atomic asset catalysts. If the debut character achieves long-term canonical traction, early first appearance issues often transition from speculative modern holdings into established blue-chip key issue floor assets.`
    );
  } else {
    rawParagraphs.push(
      `Analyzing the broader market structure, developments of this nature ripple across distributor Final Order Cutoff metrics, reorder volume, and secondary slab liquidity. Investors and collectors monitor initial order allocations to gauge whether supply constraints will create short-term market premiums.`
    );
  }

  // Paragraph 4: MARKET OUTLOOK
  rawParagraphs.push(
    `Looking ahead, ${author.name} notes that market sentiment will depend on secondary sales volume and verified auction clearing prices following the release date. Panel Profits will continue tracking transaction clearing data and census float trends as updated market evidence becomes available.`
  );

  // --- THREE-PASS SCANNING PIPELINE ---
  const seenTerms = new Set<string>();
  const seenTickers = new Set<string>();

  let totalCbrDirectory = 0;
  let totalCbrLexicon = 0;
  let totalCbrTickerLegend = 0;

  const transformedParagraphs = rawParagraphs.map((p) => {
    // Pass 1: CBR Directory
    const pass1 = runCbrDirectoryPass(p, seenTerms);
    totalCbrDirectory += pass1.matchCount;

    // Pass 2: CBR Lexicon Thesaurus
    const pass2 = runCbrLexiconThesaurusPass(pass1.transformedText, seenTerms);
    totalCbrLexicon += pass2.matchCount;

    // Pass 3: CBR Ticker Legend
    const pass3 = runCbrTickerLegendPass(pass2.transformedText, seenTickers);
    totalCbrTickerLegend += pass3.matchCount;

    return pass3.transformedText;
  });

  // --- PASS 4: QUALITY & COMPLIANCE AUDITOR ---
  const auditResult = runArticleAuditorPass(transformedParagraphs);

  return {
    headline: cleanHeadline,
    deck: cleanScrapedText(deck),
    paragraphs: auditResult.auditedParagraphs,
    recognizedEntities,
    assignedAuthorName: author.name,
    passReport: {
      cbrDirectoryCount: totalCbrDirectory,
      cbrLexiconCount: totalCbrLexicon,
      cbrTickerLegendCount: totalCbrTickerLegend,
      auditVerdict: auditResult.verdict,
    },
  };
}

