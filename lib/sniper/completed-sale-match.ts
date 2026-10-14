import { parseAndFilterListing } from "./anti-bullshit";
import { seriesKey } from "./candles";

/** Match listing evidence to a book without rewriting its title or sale data. */
export function matchCompletedComicSale(title: string, series: string, issue: string) {
  const normalized = title
    .replace(/^(?:Marvel|DC|Image)(?:\s+Comics)?\s+(?=(?:The\s+)?(?:Amazing|Incredible|Uncanny|Batman|Superman|Spider|X-Men|Spawn)\b)/i, "")
    .replace(/\bcomic\s+book\s*,?\s*(?=(?:CGC|CBCS|PSA|PGX|EGS)\b)/gi, "")
    .replace(/(\d)\s*,\s*(?=(?:CGC|CBCS|PSA|PGX|EGS)\b)/gi, "$1 ");
  const parsed = parseAndFilterListing(normalized);
  if (parsed.isReprintOrToy || /\b(?:lot of|bundle|collection|dust jacket|homage|omnibus)\b/i.test(title)) return null;
  if (seriesKey(parsed.extractedSeries, parsed.extractedIssue) !== seriesKey(series, issue)) return null;
  return parsed;
}
