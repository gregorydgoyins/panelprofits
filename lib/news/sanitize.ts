/**
 * Comprehensive HTML entity decoding and text sanitization for news headlines and summaries.
 * Eliminates stray HTML entities (&apos;, &quot;, &amp;, &#39;, &#038;, etc.) and unstripped
 * HTML markup from external feeds, wire APIs, and database records.
 */

const NAMED_HTML_ENTITIES: Record<string, string> = {
  apos: "'",
  quot: '"',
  amp: "&",
  lt: "<",
  gt: ">",
  nbsp: " ",
  mdash: "—",
  ndash: "–",
  hellip: "…",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  copy: "©",
  reg: "®",
  trade: "™",
  bull: "•",
  deg: "°",
  cent: "¢",
  pound: "£",
  yen: "¥",
  euro: "€",
  sect: "§",
  permil: "‰",
  times: "×",
  divide: "÷",
  plusmn: "±",
  para: "¶",
  frac12: "½",
  frac14: "¼",
  frac34: "¾",
};

/**
 * Decodes all HTML entities (named, decimal, hex, and double-encoded).
 * Iterates up to 3 passes to reliably unwrap nested encodings like &amp;apos; -> &apos; -> '
 */
export function decodeHtmlEntities(value: string | null | undefined): string {
  if (!value) return "";
  let str = String(value);

  for (let pass = 0; pass < 3; pass++) {
    const prev = str;
    str = str
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
      .replace(/&([a-zA-Z]+);/g, (match, entity: string) => {
        const lower = entity.toLowerCase();
        return NAMED_HTML_ENTITIES[lower] !== undefined ? NAMED_HTML_ENTITIES[lower] : match;
      })
      .replace(/&#(\d+);/g, (match, code: string) => {
        try {
          const num = Number(code);
          return num > 0 && num < 1114112 ? String.fromCodePoint(num) : match;
        } catch {
          return match;
        }
      })
      .replace(/&#x([0-9a-fA-F]+);/g, (match, code: string) => {
        try {
          const num = parseInt(code, 16);
          return num > 0 && num < 1114112 ? String.fromCodePoint(num) : match;
        } catch {
          return match;
        }
      });
    if (str === prev) break;
  }

  return str;
}

/**
 * Thoroughly cleans news text (headlines, summaries, authors):
 * 1. Decodes all named and numeric entities (including &apos;, &quot;, &#038;, etc.)
 * 2. Strips script/style tags and all inline HTML tags
 * 3. Removes invisible zero-width unicode characters
 * 4. Cleans up whitespace and punctuation spacing
 */
export function sanitizeNewsText(value: string | null | undefined): string {
  if (!value) return "";
  let text = decodeHtmlEntities(value);

  text = text
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>\s*<p[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .trim();

  // Final check for any residual encoded entities
  if (text.includes("&")) {
    text = decodeHtmlEntities(text).replace(/\s+/g, " ").trim();
  }

  return text;
}

/**
 * Specialized headline sanitizer that ensures clean display and entity recognition.
 */
export function sanitizeHeadline(headline: string | null | undefined): string {
  const clean = sanitizeNewsText(headline);
  return clean.slice(0, 300);
}

/**
 * Specialized summary sanitizer that preserves paragraph breaks while stripping tag debris.
 */
export function sanitizeSummary(summary: string | null | undefined): string | null {
  if (!summary) return null;
  let text = decodeHtmlEntities(summary);

  text = text
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/[ \t]+([.,;:!?])/g, "$1")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();

  if (text.includes("&")) {
    text = decodeHtmlEntities(text);
  }

  return text.length > 0 ? text.slice(0, 3000) : null;
}
