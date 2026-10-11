'use client';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Newspaper } from 'lucide-react';
import { getEraColors } from '@/lib/design-system/colors';
import type { HistoryEntry, RelatedIssue, Creator } from './types';
import Panel from './Panel';
import { classifyNewsItem, scoreNewsItem, buildKeywords, getSourceColor, computeMediaVelocity, normalizeNewsRow, type RawNewsRow } from './newsUtils';
import { buildEquityUrl } from '@/lib/urlBuilder';
import { proxyCoverUrl } from '@/lib/coverProxy';

interface NewsItem { id: string; title: string; summary: string | null; url: string; source: string; publishedAt: string; aiScore: number | null; }

export default function NewsPanel({ workName, publisher, assetId, eraColors, priceHistory = [], censusSummary, seriesIssues = [], saleIntelligence, coverImageUrl }: {
  workName: string; publisher: string; assetId: string; eraColors: ReturnType<typeof getEraColors>;
  priceHistory?: HistoryEntry[];
  censusSummary?: { totalGraded: number; highGradeCount: number; snapshotDate: string; histogram: { grade: string; count: number }[] } | null;
  seriesIssues?: RelatedIssue[];
  saleIntelligence?: { totalSales: number; lastSaleDate: string | null; daysSinceLastSale: number | null; confidenceWeightedMeanPrice: number | null; } | null;
  coverImageUrl?: string | null;
}) {
  const { data: newsData, isLoading } = useQuery<{ success: boolean; data: NewsItem[]; count: number }>({
    queryKey: ['news-latest'],
    queryFn: async () => {
      const res = await fetch('/api/feed/news');
      if (!res.ok) return { success: false, data: [], count: 0 };
      return res.json();
    },
    staleTime: 120000,
  });

  const { data: creatorData } = useQuery<{ data: Creator[] }>({
    queryKey: ['creators', assetId],
    queryFn: async () => {
      const res = await fetch(`/api/creators/${assetId}`);
      if (!res.ok) return { data: [] };
      return res.json();
    },
    staleTime: 300000,
  });

  const priceMomentum = useMemo(() => {
    if (priceHistory.length < 4) return null;
    const sorted = [...priceHistory].sort((a, b) => a.observedAt.localeCompare(b.observedAt));
    const recent = sorted.slice(-4);
    const older = sorted.slice(0, Math.max(1, sorted.length - 4));
    const recentAvg = recent.reduce((s, h) => s + h.priceUsd, 0) / recent.length;
    const olderAvg = older.reduce((s, h) => s + h.priceUsd, 0) / older.length;
    if (olderAvg === 0) return null;
    const pct = ((recentAvg - olderAvg) / olderAvg) * 100;
    if (pct >= 5)  return { label: 'RISING', value: `+${pct.toFixed(1)}%`, color: '#4ade80', desc: 'Recent price observations trending above prior baseline.' };
    if (pct <= -5) return { label: 'FALLING', value: `${pct.toFixed(1)}%`, color: '#f87171', desc: 'Recent price observations trending below prior baseline.' };
    return { label: 'FLAT', value: `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`, color: '#fbbf24', desc: 'Price observations stable — no clear directional trend.' };
  }, [priceHistory]);

  const censusVelocity = useMemo(() => {
    if (!censusSummary) return null;
    const total = censusSummary.totalGraded;
    if (total === 0) return { label: 'UNGRADED', value: '0', color: 'rgba(255,255,255,0.3)', desc: 'No CGC census data on record for this issue.' };
    const highGrade = censusSummary.highGradeCount;
    const hgPct = total > 0 ? (highGrade / total) * 100 : 0;
    if (hgPct >= 30) return { label: 'HIGH-GRADE POOL', value: `${total.toLocaleString()}`, color: '#f87171', desc: `${highGrade.toLocaleString()} of ${total.toLocaleString()} graded copies are 9.8+.` };
    if (total >= 1000) return { label: 'ABUNDANT', value: `${total.toLocaleString()}`, color: '#fbbf24', desc: `${total.toLocaleString()} graded copies — large population.` };
    if (total <= 100)  return { label: 'SCARCE', value: `${total.toLocaleString()}`, color: '#4ade80', desc: `Only ${total.toLocaleString()} graded copies recorded.` };
    return { label: 'MODERATE', value: `${total.toLocaleString()}`, color: eraColors.border, desc: `${total.toLocaleString()} graded copies — moderate supply.` };
  }, [censusSummary, eraColors.border]);

  const marketSentiment = useMemo(() => {
    const sales = saleIntelligence?.totalSales ?? 0;
    const days = saleIntelligence?.daysSinceLastSale;
    if (sales === 0) return { label: 'DORMANT', value: 'No sales', color: 'rgba(255,255,255,0.3)', desc: 'No verified sales on record.' };
    if (days !== null && days !== undefined && days > 730) return { label: 'ILLIQUID', value: `${sales} sales`, color: '#fbbf24', desc: `Last verified sale was ${days} days ago.` };
    if (sales >= 20) return { label: 'ACTIVE', value: `${sales} sales`, color: '#4ade80', desc: `${sales} verified sales — strong confirmed market.` };
    return { label: 'THIN', value: `${sales} sales`, color: eraColors.border, desc: `${sales} verified sales — limited but confirmed market.` };
  }, [saleIntelligence, eraColors.border]);

  const allItems: NewsItem[] = ((newsData?.data || (newsData as any)?.stories || []) as RawNewsRow[]).map(normalizeNewsRow);

  const creatorNames = (creatorData?.data || []).map((c: Creator) => c.name).filter(Boolean);
  const baseKeywords = buildKeywords(workName, publisher);

  const scored = allItems.map(item => ({ item, score: scoreNewsItem(item, baseKeywords, creatorNames) })).sort((a, b) => b.score - a.score);
  const relevant = scored.filter(s => s.score > 0).slice(0, 6);
  const fallback  = scored.slice(0, Math.max(0, 6 - relevant.length)).filter(s => s.score === 0);
  const shown = [...relevant, ...fallback].slice(0, 6);
  const hasRelevant = relevant.length > 0;

  const mediaVelocity = computeMediaVelocity(relevant);

  const comparables = useMemo(() => {
    if (!seriesIssues || seriesIssues.length === 0) return [];
    const currentFmv = seriesIssues.find(s => s.id === assetId)?.fmv98Usd ?? 0;
    return [...seriesIssues].filter(s => s.id !== assetId && (s.fmv98Usd ?? 0) > 0)
      .sort((a, b) => Math.abs((a.fmv98Usd ?? 0) - currentFmv) - Math.abs((b.fmv98Usd ?? 0) - currentFmv))
      .slice(0, 3);
  }, [seriesIssues, assetId]);

  const sourceColor = (src: string) => getSourceColor(src, eraColors.border);

  const signals = [priceMomentum, censusVelocity, marketSentiment].filter(Boolean) as NonNullable<typeof priceMomentum>[];

  return (
    <Panel title="Issue Intelligence" icon={<Newspaper className="w-3.5 h-3.5" />} eraColors={eraColors}
      action={
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: mediaVelocity.color, boxShadow: mediaVelocity.label !== 'QUIET' ? `0 0 5px ${mediaVelocity.color}` : 'none' }} />
          <span className="text-[8px] uppercase tracking-wider" style={{ color: mediaVelocity.color }}>{mediaVelocity.label}</span>
        </div>
      }>

      {/* Signal Strip */}
      {signals.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {signals.map((sig, i) => (
            <div key={i} className="rounded-lg p-3 relative group"
              style={{ background: `linear-gradient(135deg, ${sig.color}0c, rgba(0,0,0,0.25))`, border: `1px solid ${sig.color}28` }}>
              <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                {i === 0 ? 'Price Momentum' : i === 1 ? 'Census Supply' : 'Market Sentiment'}
              </div>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', color: sig.color, lineHeight: 1.2 }}>{sig.value}</div>
              <div style={{ fontSize: '8px', color: sig.color, marginTop: 2, letterSpacing: '0.06em' }}>{sig.label}</div>
              <div className="absolute left-0 bottom-full mb-1.5 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 w-44"
                style={{ backgroundColor: '#0a0a0f', border: `1px solid ${sig.color}40`, borderRadius: '6px', padding: '8px 10px', boxShadow: '0 4px 20px rgba(0,0,0,0.6)' }}>
                <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{sig.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comparable Issues */}
      {comparables.length > 0 && (
        <div className="mb-4">
          <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Comparable Issues · Nearest by 9.8 FMV</div>
          <div className="flex gap-2">
            {comparables.map(comp => (
              <a key={comp.id} href={buildEquityUrl(comp.id)} className="flex-1 rounded-lg p-2.5 transition-all block pp-hover-bg-5"
                style={{ backgroundColor: 'rgba(255,255,255,0.025)', border: `1px solid ${eraColors.border}25`, textDecoration: 'none' }}>
                {comp.coverImageUrl && (
                  <img src={proxyCoverUrl(comp.coverImageUrl) || comp.coverImageUrl} alt={comp.issueNumber} className="w-full rounded mb-2 object-contain"
                    style={{ height: '64px', objectFit: 'contain', backgroundColor: '#0a0f1a' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
                <div style={{ fontSize: '8px', color: eraColors.border, fontFamily: 'monospace' }}>#{comp.issueNumber}</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', fontFamily: 'monospace', marginTop: 2 }}>${(comp.fmv98Usd ?? 0).toFixed(2)}</div>
                <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>9.8 FMV</div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* News */}
      <div>
        <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
          {hasRelevant ? `${relevant.length} matched stories · ${workName}` : `General market intelligence · no ${workName}-specific stories`}
        </div>
        {isLoading ? (
          <div className="h-12 flex items-center justify-center" style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px' }}>Fetching intelligence…</div>
        ) : shown.length === 0 ? (
          <div className="flex items-center justify-center py-4 gap-2">
            <Newspaper className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.12)' }} />
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.28)' }}>No relevant news found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {shown.map(({ item, score }) => {
              const classification = classifyNewsItem(item.title, item.summary ?? '');
              const isInterview = classification.type === 'INTERVIEW';
              const sc = sourceColor(item.source || '');
              return (
                <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="block rounded p-2.5 transition-all pp-hover-bg-5"
                  style={{ backgroundColor: isInterview ? '#a78bfa08' : 'rgba(255,255,255,0.02)', border: `1px solid ${isInterview ? '#a78bfa25' : score > 0 ? `${eraColors.border}25` : 'rgba(255,255,255,0.06)'}`, textDecoration: 'none', borderLeft: score > 0 ? `3px solid ${eraColors.border}60` : '3px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    <span className="text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider flex-shrink-0"
                      style={{ backgroundColor: `${classification.color}18`, color: classification.color, border: `1px solid ${classification.color}30` }}>
                      {classification.type}
                    </span>
                    <span className="flex items-center gap-1 text-[8px] px-1.5 py-0.5 rounded flex-shrink-0"
                      style={{ backgroundColor: `${sc}12`, color: sc, border: `1px solid ${sc}28` }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: sc, display: 'inline-block' }} />
                      {item.source || 'News'}
                    </span>
                    {item.aiScore !== null && item.aiScore >= 6 && (
                      <span className="text-[7px] tabular-nums" style={{ color: item.aiScore >= 8 ? '#4ade80' : 'rgba(255,255,255,0.32)', fontFamily: 'monospace' }}>AI {item.aiScore.toFixed(1)}</span>
                    )}
                    <span className="ml-auto text-[8px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                      {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                    </span>
                  </div>
                  <p className="text-[11px] leading-snug line-clamp-2" style={{ color: score > 0 ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.45)' }}>{item.title}</p>
                  {item.summary && <p className="text-[9px] mt-1 line-clamp-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{item.summary}</p>}
                </a>
              );
            })}
          </div>
        )}
        <p className="text-[7px] mt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
          AI-scored · {creatorNames.length > 0 ? `Tracking ${creatorNames.slice(0, 2).join(', ')}` : `Tracking ${workName} + related`} · refreshes every 2h
        </p>
      </div>
    </Panel>
  );
}
