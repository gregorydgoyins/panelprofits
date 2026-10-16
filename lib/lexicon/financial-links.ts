import { CORE_CANON_DICTIONARY } from "./core-canon-dictionary";

const aliases: Record<string, string[]> = {
  "fair-market-value-fmv-benchmark": ["FMV", "fair market value"],
  "liquidity": ["liquidity"],
  "cost-basis-tax-lot-accounting": ["cost basis", "acquisition cost"],
  "bid-ask-spread-fmv-liquidity-spread": ["bid-ask spread"],
};
const phrases = Object.values(CORE_CANON_DICTIONARY).flatMap(entry =>
  [...new Set([entry.term.replace(/\s*\(.*/, ""), ...(aliases[entry.slug] || [])])]
    .filter(text => text.length >= 4 || text === "FMV")
    .map(text => ({ text, slug: entry.slug, definition: entry.panel_profits_translation }))
).sort((a,b) => b.text.length-a.text.length);
const index = new Map(phrases.map(p => [p.text.toLowerCase(), p]));
const escape = (s:string) => s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
const pattern = new RegExp(`\\b(${phrases.map(p=>escape(p.text)).join("|")})\\b`, "gi");

/** Client-safe links to existing dictionary records; no network or second dictionary. */
export function financialSegments(text:string) {
  const seen = new Set<string>();
  return text.split(pattern).filter(Boolean).map(part => {
    const entry=index.get(part.toLowerCase());
    if(!entry || seen.has(entry.slug)) return {text:part};
    seen.add(entry.slug);
    return {text:part,url:`/wiki/terms/${entry.slug}`,definition:entry.definition};
  });
}
