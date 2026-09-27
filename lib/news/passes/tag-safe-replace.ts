export interface TextRange {
  start: number;
  end: number;
  replacement: string;
}

export interface EntityCandidate {
  term: string;
  render: (matchedText: string) => string;
  onMatch?: () => void;
}

/**
 * Safely performs non-overlapping interval replacement on raw plain text.
 * Guarantees zero regex execution on generated HTML tags, zero nested tags,
 * and zero attribute corruption.
 */
export function replaceNonOverlappingTerms(
  text: string,
  entityDefs: EntityCandidate[]
): { result: string; matchCount: number } {
  if (!text || entityDefs.length === 0) {
    return { result: text, matchCount: 0 };
  }

  const ranges: TextRange[] = [];
  let matchCount = 0;
  const occupied = new Uint8Array(text.length);

  for (const def of entityDefs) {
    const escaped = def.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;

      // Check collision
      let collision = false;
      for (let i = start; i < end; i++) {
        if (occupied[i]) {
          collision = true;
          break;
        }
      }

      if (!collision) {
        for (let i = start; i < end; i++) {
          occupied[i] = 1;
        }
        ranges.push({
          start,
          end,
          replacement: def.render(match[0]),
        });
        matchCount++;
        def.onMatch?.();
        break; // Match first occurrence only per entity term
      }
    }
  }

  if (ranges.length === 0) {
    return { result: text, matchCount: 0 };
  }

  // Sort ranges by start index ascending
  ranges.sort((a, b) => a.start - b.start);

  let result = "";
  let lastIndex = 0;
  for (const r of ranges) {
    result += text.slice(lastIndex, r.start);
    result += r.replacement;
    lastIndex = r.end;
  }
  result += text.slice(lastIndex);

  return { result, matchCount };
}

/**
 * Splits HTML by tags and processes only pure text nodes located outside of <a>...</a> tags.
 */
export function transformOutsideAnchorTags(
  html: string,
  transformPlainText: (plainText: string) => { text: string; count: number }
): { transformedHtml: string; totalMatches: number } {
  if (!html) return { transformedHtml: "", totalMatches: 0 };

  const parts = html.split(/(<[^>]+>)/g);
  let insideAnchor = false;
  let totalMatches = 0;

  const transformedParts = parts.map((part) => {
    if (part.startsWith("<")) {
      if (/^<a\b/i.test(part)) insideAnchor = true;
      if (/^<\/a>/i.test(part)) insideAnchor = false;
      return part;
    }
    if (insideAnchor) return part;

    const { text, count } = transformPlainText(part);
    totalMatches += count;
    return text;
  });

  return { transformedHtml: transformedParts.join(""), totalMatches };
}
