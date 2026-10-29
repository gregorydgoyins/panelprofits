import { resolveComicEra, type ResolveComicEraOptions } from "../pricing/comic-portfolio-tracker";

export function resolveProductionAge(
  year: number | null | undefined,
  options?: ResolveComicEraOptions | string | null
): string {
  if (!year && typeof options !== "object") return 'unknown';
  const canonicalEra = resolveComicEra(year, options);
  // Map "Post-Modern" to "postmodern" to keep standard slug format
  return canonicalEra === "Post-Modern" ? "postmodern" : canonicalEra.toLowerCase();
}

export function formatEraLabel(era: string): string {
  const map: Record<string, string> = {
    platinum: 'Platinum', golden: 'Golden', atomic: 'Atomic', silver: 'Silver',
    bronze: 'Bronze', copper: 'Copper', modern: 'Modern', independent: 'Indie',
    postmodern: 'Post-Mod', unknown: '—',
  };
  return map[era.toLowerCase()] ?? era;
}

export function fmtUSD(usd: number): string {
  return '$' + usd.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function getDelta(delta: number | null | undefined): { arrow: string; color: string; text: string } {
  if (delta == null) return { arrow: '▬', color: '#64748b', text: '—' };
  const sign = delta > 0 ? '+' : '';
  if (delta > 0) return { arrow: '▲', color: '#4ade80', text: `${sign}${delta.toFixed(2)}%` };
  if (delta < 0) return { arrow: '▼', color: '#f87171', text: `${delta.toFixed(2)}%` };
  return { arrow: '▬', color: '#64748b', text: '0.00%' };
}

export function parseSeriesIssue(productName: string | null | undefined): { series: string; issueNum: string } {
  if (!productName) return { series: '', issueNum: '' };
  const match = productName.match(/^(.+?)\s+#(\d+[\w-]*)/);
  if (match) return { series: match[1].trim(), issueNum: match[2] };
  return { series: productName.replace(/\s*#[\d\w-]+.*$/, '').trim(), issueNum: '' };
}

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
