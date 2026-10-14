import type { SlabLabel } from "./label-reader";
import type { ComicEra } from "./types";

export function slabIssueYear(label: SlabLabel | null | undefined): number | undefined {
  const date = label?.issueDate?.trim();
  if (!date) return undefined;
  const full = date.match(/\b((?:18|19|20)\d{2})\b/);
  if (full) return Number(full[1]);
  const short = date.match(/(?:^|\/)(\d{2})$/);
  if (!short) return undefined;
  const year = Number(short[1]);
  return year <= new Date().getUTCFullYear() % 100 ? 2000 + year : 1900 + year;
}
export function issueEra(year: number): ComicEra {
  if (year < 1938) return "platinum";
  if (year <= 1945) return "golden";
  if (year <= 1955) return "atomic";
  if (year <= 1969) return "silver";
  if (year <= 1983) return "bronze";
  if (year <= 1991) return "copper";
  if (year <= 2009) return "modern";
  return "postmodern";
}
