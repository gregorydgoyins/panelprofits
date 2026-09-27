export interface PassResult {
  transformedText: string;
  matchCount: number;
}

export interface ArticleAuditVerdict {
  isPassed: boolean;
  paragraphCount: number;
  totalLength: number;
  hasFluffOrBoilerplate: boolean;
  hasUncleanMarkdownOrLinks: boolean;
  auditScore: number;
  violations: string[];
}

/**
 * PASS 4: Quality & Compliance Auditor
 * Performs final verification of transformed article text.
 * Checks structure (4+ paragraphs, length >500), purges any missed fluff,
 * verifies zero raw brackets/links remain, and computes an audit score.
 */
export function runArticleAuditorPass(paragraphs: string[]): {
  auditedParagraphs: string[];
  verdict: ArticleAuditVerdict;
} {
  const violations: string[] = [];
  const auditedParagraphs: string[] = [];

  let hasFluffOrBoilerplate = false;
  let hasUncleanMarkdownOrLinks = false;

  for (let i = 0; i < paragraphs.length; i++) {
    let p = paragraphs[i];

    // Purge any remaining raw image captions or promotional engagement text
    if (/(?:IMAGE|PHOTO|CREDIT)\s+(?:COURTESY\s+OF|BY)\s+[^.\n]+/gi.test(p)) {
      hasFluffOrBoilerplate = true;
      violations.push(`P${i + 1}: Found raw image credit caption`);
      p = p.replace(/(?:IMAGE|PHOTO|CREDIT)\s+(?:COURTESY\s+OF|BY)\s+[^.\n]+/gi, "");
    }

    if (/We want to hear from you in the comments|Are you hoping to see|What do you think/gi.test(p)) {
      hasFluffOrBoilerplate = true;
      violations.push(`P${i + 1}: Found publisher engagement fluff prompt`);
      p = p.replace(/We want to hear from you in the comments[\s\S]*/gi, "")
           .replace(/Are you hoping to see[\s\S]*?\?/gi, "")
           .replace(/What do you think[\s\S]*?\?/gi, "");
    }

    // Check and purge any leftover raw markdown, REF tags, or raw brackets recursively
    if (/\[[^\]]+\]\([^)]+\)/.test(p) || /\(REF:[^)]+\)/i.test(p) || /\[[^\]]+\]/.test(p)) {
      hasUncleanMarkdownOrLinks = true;
      violations.push(`P${i + 1}: Purged raw markdown link, REF tag, or brackets`);
      
      let prevP = "";
      while (p !== prevP) {
        prevP = p;
        p = p
          .replace(/\[([^\]\s(]+)\s*\([^)]*REF:[^)]*\)\]\([^)]+\)/gi, "$1") // [CGC (REF:CGC)](url) -> CGC
          .replace(/\[([^\]]+)\s*\([^)]*REF:[^)]*\)\]/gi, "$1")            // [CGC (REF:CGC)] -> CGC
          .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+|\/[^)]+)\)/g, '<a href="$2" class="text-cyan-200 font-medium underline decoration-cyan-400/70 underline-offset-4 hover:text-cyan-100 transition-colors">$1</a>') // [text](url) -> HTML <a> tag
          .replace(/\(REF:[^)]+\)/gi, "")                                   // (REF:TAG) -> empty
          .replace(/\[([^\]]+)\]/g, "$1");                                  // [text] -> text
      }
    }

    auditedParagraphs.push(p.trim());
  }

  const totalLength = auditedParagraphs.join(" ").length;
  const paragraphCount = auditedParagraphs.length;

  if (paragraphCount < 4) {
    violations.push(`Structure: Paragraph count is ${paragraphCount} (minimum 4 required)`);
  }

  if (totalLength < 500) {
    violations.push(`Length: Total article length is ${totalLength} chars (minimum 500 required)`);
  }

  const isPassed = violations.length === 0;
  const auditScore = Math.max(100 - violations.length * 15, 0);

  return {
    auditedParagraphs,
    verdict: {
      isPassed,
      paragraphCount,
      totalLength,
      hasFluffOrBoilerplate,
      hasUncleanMarkdownOrLinks,
      auditScore,
      violations,
    },
  };
}
