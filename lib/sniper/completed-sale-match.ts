import { parseAndFilterListing } from "./anti-bullshit";
import { seriesKey } from "./candles";

/** Match listing evidence to a book without rewriting its title or sale data. */
export function matchCompletedComicSale(title: string, series: string, issue: string, editionTerms: string[] = []) {
  if(/\b(?:signed|signature series|restored|qualified|trimmed|SS)\b/i.test(title))return null;
  if(!editionTerms.length && /\b(?:variant|newsstand|exclusive|incentive|foil|sketch|CPV|reprint|facsimile)\b|\b(?:2nd|3rd|second|third)\s+print/i.test(title))return null;
  const words = new Set(title.toLowerCase().replace(/[^a-z0-9]+/g, " ").split(" "));
  if (editionTerms.some(term => !words.has(term.toLowerCase()))) return null;
  const normalized = title
    .replace(/^(?:Marvel|DC|Image)(?:\s+Comics)?\s+(?=(?:The\s+)?(?:Amazing|Incredible|Uncanny|Batman|Superman|Spider|X-Men|Spawn)\b)/i, "")
    .replace(/\bcomic\s+book\s*,?\s*(?=(?:CGC|CBCS|PSA|PGX|EGS)\b)/gi, "")
    .replace(/(\d)\s*,\s*(?=(?:CGC|CBCS|PSA|PGX|EGS)\b)/gi, "$1 ");
  const parsed = parseAndFilterListing(normalized);
  if (parsed.isReprintOrToy || /\b(?:lot of|bundle|collection|dust jacket|homage|omnibus)\b/i.test(title)) return null;
  if (seriesKey(parsed.extractedSeries, parsed.extractedIssue) !== seriesKey(series, issue)) return null;
  return parsed;
}
