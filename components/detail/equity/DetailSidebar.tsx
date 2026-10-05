'use client';
import React, { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Newspaper, TrendingUp, BarChart2, Activity, Bookmark, BookmarkCheck, X } from 'lucide-react';
import { getEraColors } from '@/lib/design-system/colors';
import type { GradePrice, HistoryEntry } from './types';
import { fmt, GRADE_ORDER } from './shared';
import { classifyNewsItem, scoreNewsItem, buildKeywords, getSourceColor, normalizeNewsRow, type RawNewsRow, type ScoredNewsItem as NewsItem } from './newsUtils';
import { useWatchlist } from '@/hooks/useWatchlist';
import { buildEquityUrl } from '@/lib/urlBuilder';

interface CensusSummary {
  totalGraded: number;
  highGradeCount: number;
  snapshotDate: string;
  histogram: { grade: string; count: number }[];
}

interface KeyPrices {
  fmv98Usd: number;
  fmv10Usd: number;
  fmvRawUsd: number;
  sovPriceUsd: number;
  sovGrade: string | null;
  premiumPct: number | null;
  gradeCount: number;
  observedAt: string | null;
  anchor9_8: number;
  display_fmv_usd: number | null;
  display_grade: string | null;
  delta24h?: number | null;
}


export default function DetailSidebar({
  variantId,
  workName,
  era,
  publisher,
  creatorNames = [],
  eraColors,
  keyPrices,
  gradeLattice,
  priceHistory,
  censusSummary,
  detailUrl,
  onOpenExecModal,
  hasIntelligence = false,
  tradeConfirmation = null,
}: {
  variantId?: string;
  workName: string;
  era?: string;
  publisher: string;
  creatorNames?: string[];
  eraColors: ReturnType<typeof getEraColors>;
  keyPrices: KeyPrices;
  gradeLattice: GradePrice[];
  priceHistory: HistoryEntry[];
  censusSummary: CensusSummary | null | undefined;
  detailUrl?: string;
  onOpenExecModal?: (action: 'buy' | 'sell') => void;
  hasIntelligence?: boolean;
  tradeConfirmation?: { action: 'buy' | 'sell'; id: number } | null;
}) {
  const accent = eraColors.border;
  const { entries: watchlist, isWatching, toggleWatchlist } = useWatchlist();

  const currentIsWatched = variantId ? isWatching(variantId) : false;

  const [toastVisible, setToastVisible] = useState(false);
  const [toastAction, setToastAction] = useState<'buy' | 'sell'>('buy');

  useEffect(() => {
    if (!tradeConfirmation) return;
    setToastAction(tradeConfirmation.action);
    setToastVisible(true);
    const timer = setTimeout(() => setToastVisible(false), 4000);
    return () => clearTimeout(timer);
  }, [tradeConfirmation?.id]);

  const { data: newsData } = useQuery<{ success: boolean; data: RawNewsRow[]; count: number }>({
    queryKey: ['news-latest'],
    queryFn: async () => {
      const res = await fetch('/api/news/latest');
      if (!res.ok) return { success: false, data: [], count: 0 };
      return res.json();
    },
    staleTime: 120000,
  });

  const newsItems: NewsItem[] = (newsData?.data ?? [] as RawNewsRow[]).map(normalizeNewsRow);

  const baseKeywords = useMemo(() => buildKeywords(workName, publisher), [workName, publisher]);
  const topNews = useMemo(() => {
    const scored = newsItems.map(item => ({ item, score: scoreNewsItem(item, baseKeywords, creatorNames) })).sort((a, b) => b.score - a.score);
    const relevant = scored.filter(s => s.score > 0).slice(0, 5);
    const fill = scored.filter(s => s.score === 0).slice(0, Math.max(0, 5 - relevant.length));
    return [...relevant, ...fill].slice(0, 5);
  }, [newsItems, baseKeywords, creatorNames]);

  const sortedGrades = useMemo(() =>
    [...gradeLattice]
      .sort((a, b) => {
        const ai = GRADE_ORDER.indexOf(a.grade), bi = GRADE_ORDER.indexOf(b.grade);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      })
      .filter(g => g.priceUsd > 0)
      .slice(0, 8),
    [gradeLattice]
  );

  const priceMomentum = useMemo(() => {
    if (priceHistory.length < 4) return null;
    const sorted = [...priceHistory].sort((a, b) => a.observedAt.localeCompare(b.observedAt));
    const recent = sorted.slice(-4);
    const older = sorted.slice(0, Math.max(1, sorted.length - 4));
    const recentAvg = recent.reduce((s, h) => s + h.priceUsd, 0) / recent.length;
    const olderAvg = older.reduce((s, h) => s + h.priceUsd, 0) / older.length;
    if (olderAvg === 0) return null;
    const pct = ((recentAvg - olderAvg) / olderAvg) * 100;
    if (pct >= 5) return { pct, color: '#4ade80', arrow: '↑' };
    if (pct <= -5) return { pct, color: '#f87171', arrow: '↓' };
    return { pct, color: '#fbbf24', arrow: '→' };
  }, [priceHistory]);

  const maxGradePrice = sortedGrades[0]?.priceUsd ?? 0;

  const sectionHead = (label: string, icon: React.ReactNode) => (
    <div className="flex items-center gap-1.5 mb-2 pb-1.5" style={{ borderBottom: `1px solid ${accent}18` }}>
      <span style={{ color: accent, opacity: 0.6 }}>{icon}</span>
      <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'Hind, sans-serif' }}>{label}</span>
    </div>
  );

  const card = (children: React.ReactNode) => (
    <div className="rounded" style={{ backgroundColor: 'rgba(255,255,255,0.025)', border: `1px solid ${accent}18`, padding: '12px 14px' }}>
      {children}
    </div>
  );

  return (
    <div className="flex flex-col gap-3">

      {/* ── WATCHLIST ── */}
      {variantId && card(
        <>
          {sectionHead('Watchlist', currentIsWatched ? <BookmarkCheck className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />)}

          {/* Add / Remove current equity */}
          <button
            onClick={() => toggleWatchlist({
              id: variantId,
              workName,
              era,
              fmvUsd: keyPrices.display_fmv_usd ?? keyPrices.fmv98Usd ?? undefined,
              delta24h: keyPrices.delta24h,
              pinnedAt: new Date().toISOString(),
            })}
            className="pp-hover-var-bg"
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '5px', padding: '6px 0', borderRadius: '3px', cursor: 'pointer',
              border: currentIsWatched ? '1px solid rgba(250,204,21,0.4)' : `1px solid ${accent}30`,
              backgroundColor: currentIsWatched ? 'rgba(250,204,21,0.08)' : `${accent}0d`,
              color: currentIsWatched ? '#facc15' : accent,
              fontSize: '9px', fontFamily: 'Hind, sans-serif', fontWeight: 500,
              textTransform: 'uppercase', letterSpacing: '0.1em',
              transition: 'background-color 140ms, border-color 140ms, color 140ms',
              ['--pp-hover-color' as string]: currentIsWatched ? 'rgba(250,204,21,0.14)' : `${accent}20`,
            } as React.CSSProperties}
          >
            {currentIsWatched
              ? <><BookmarkCheck className="w-3 h-3" /> Watching</>
              : <><Bookmark className="w-3 h-3" /> Add to Watchlist</>}
          </button>

          {/* Watchlist items */}
          {watchlist.length > 0 && (
            <div className="flex flex-col gap-1 mt-2">
              {watchlist.map((entry) => {
                const isCurrent = entry.id === variantId;
                return (
                  <div
                    key={entry.id}
                    className="flex items-center gap-1.5 rounded px-2 py-1"
                    style={{
                      backgroundColor: isCurrent ? `${accent}10` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isCurrent ? `${accent}30` : 'rgba(255,255,255,0.06)'}`,
                    }}
                  >
                    <Link
                      href={buildEquityUrl(entry.id)}
                      style={{ flex: 1, textDecoration: 'none', minWidth: 0 }}
                    >
                      <div style={{ fontSize: '9px', color: isCurrent ? accent : 'rgba(255,255,255,0.7)', fontFamily: 'Hind, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {entry.workName}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {entry.fmvUsd != null && entry.fmvUsd > 0 && (
                          <span style={{ fontSize: '10px', color: isCurrent ? '#fff' : 'rgba(255,255,255,0.55)', fontFamily: 'monospace' }}>
                            {fmt(entry.fmvUsd)}
                          </span>
                        )}
                        {entry.delta24h != null && (
                          <span style={{ fontSize: '8px', fontFamily: 'monospace', color: entry.delta24h > 0 ? '#4ade80' : entry.delta24h < 0 ? '#f87171' : 'rgba(255,255,255,0.3)' }}>
                            {entry.delta24h > 0 ? '+' : ''}{entry.delta24h.toFixed(2)}%
                          </span>
                        )}
                      </div>
                    </Link>
                    <button
                      onClick={() => toggleWatchlist(entry)}
                      title="Remove from watchlist"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '16px', height: '16px', flexShrink: 0, cursor: 'pointer',
                        border: 'none', background: 'none', padding: 0,
                        color: 'rgba(255,255,255,0.2)',
                        transition: 'color 120ms',
                      }}
                      className="pp-hover-color-danger"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── KEY PRICES ── */}
      {card(
        <>
          {sectionHead('Key Prices', <TrendingUp className="w-3 h-3" />)}
          <div className="flex flex-col gap-1.5">
            {/* SOV price — the confirmed sovereign price */}
            <div className="flex items-center justify-between">
              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em' }}>SOV Price</span>
              <span style={{ fontSize: '12px', color: accent, fontFamily: 'monospace' }}>
                {keyPrices.sovPriceUsd > 0 ? fmt(keyPrices.sovPriceUsd) : '—'}
              </span>
            </div>
            {/* 9.8 FMV — fair-market value at the sovereign grade */}
            <div className="flex items-center justify-between">
              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em' }}>9.8 FMV</span>
              <span style={{ fontSize: '12px', color: keyPrices.fmv98Usd > 0 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>
                {keyPrices.fmv98Usd > 0 ? fmt(keyPrices.fmv98Usd) : '—'}
              </span>
            </div>
            {/* RAW — ungraded baseline */}
            <div className="flex items-center justify-between">
              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em' }}>RAW</span>
              <span style={{ fontSize: '12px', color: keyPrices.fmvRawUsd > 0 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>
                {keyPrices.fmvRawUsd > 0 ? fmt(keyPrices.fmvRawUsd) : '—'}
              </span>
            </div>
            {/* Delta 24h */}
            <div className="flex items-center justify-between pt-1.5 mt-0.5" style={{ borderTop: `1px solid rgba(255,255,255,0.06)` }}>
              <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em' }}>24h Δ</span>
              {keyPrices.delta24h != null ? (
                <span style={{ fontSize: '11px', color: keyPrices.delta24h > 0 ? '#4ade80' : keyPrices.delta24h < 0 ? '#f87171' : 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
                  {keyPrices.delta24h > 0 ? '+' : ''}{keyPrices.delta24h.toFixed(2)}%
                </span>
              ) : priceMomentum ? (
                <span style={{ fontSize: '11px', color: priceMomentum.color, fontFamily: 'monospace' }}>
                  {priceMomentum.arrow} {priceMomentum.pct > 0 ? '+' : ''}{priceMomentum.pct.toFixed(1)}%
                </span>
              ) : (
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>—</span>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── QUICK ACTIONS ── */}
      {onOpenExecModal && hasIntelligence && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => onOpenExecModal('buy')}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '5px', padding: '8px 0', borderRadius: '4px', cursor: 'pointer',
                fontSize: '10px', fontFamily: 'Hind, sans-serif', fontWeight: 500,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                backgroundColor: 'rgba(74,222,128,0.10)',
                border: '1px solid rgba(74,222,128,0.30)',
                color: '#4ade80',
                transition: 'background-color 140ms',
              }}
              className="pp-hover-bg-buy"
            >
              ▲ BUY
            </button>
            <button
              onClick={() => onOpenExecModal('sell')}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '5px', padding: '8px 0', borderRadius: '4px', cursor: 'pointer',
                fontSize: '10px', fontFamily: 'Hind, sans-serif', fontWeight: 500,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                backgroundColor: 'rgba(248,113,113,0.10)',
                border: '1px solid rgba(248,113,113,0.30)',
                color: '#f87171',
                transition: 'background-color 140ms',
              }}
              className="pp-hover-bg-sell"
            >
              ▼ SELL
            </button>
          </div>

          {/* ── TRADE CONFIRMATION TOAST ── */}
          {toastVisible && (
            <div
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '6px 10px', borderRadius: '4px',
                backgroundColor: toastAction === 'buy' ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
                border: `1px solid ${toastAction === 'buy' ? 'rgba(74,222,128,0.30)' : 'rgba(248,113,113,0.30)'}`,
                animation: 'fadeIn 160ms ease-out',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0,
                  backgroundColor: toastAction === 'buy' ? '#4ade80' : '#f87171',
                  boxShadow: `0 0 5px ${toastAction === 'buy' ? '#4ade80' : '#f87171'}`,
                }} />
                <span style={{
                  fontSize: '9px', fontFamily: 'Hind, sans-serif',
                  color: toastAction === 'buy' ? '#4ade80' : '#f87171',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  {toastAction === 'buy' ? 'Buy' : 'Sell'} order acknowledged
                </span>
              </div>
              <button
                onClick={() => setToastVisible(false)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '14px', height: '14px', flexShrink: 0, cursor: 'pointer',
                  border: 'none', background: 'none', padding: 0,
                  color: 'rgba(255,255,255,0.25)',
                  transition: 'color 120ms',
                }}
                className="pp-hover-color-muted"
              >
                <X className="w-2 h-2" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── GRADE SPREAD MINI ── */}
      {sortedGrades.length > 0 && card(
        <>
          {sectionHead('Grade Spread', <BarChart2 className="w-3 h-3" />)}
          <div className="flex flex-col gap-0.5">
            {sortedGrades.map((g) => {
              const isTop = g.grade === '9.8';
              const barW = maxGradePrice > 0 ? Math.min(100, Math.max(3, (g.priceUsd / maxGradePrice) * 100)) : 0;
              const hasVol = (g.salesVolume ?? 0) > 0;
              return (
                <div key={g.grade} className="flex items-center gap-2 py-0.5">
                  <span style={{ fontSize: '9px', color: isTop ? accent : 'rgba(255,255,255,0.5)', fontFamily: 'monospace', width: '36px', flexShrink: 0 }}>
                    {g.grade === 'RAW' ? 'RAW' : g.grade}
                  </span>
                  <div className="flex-1 relative h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="absolute left-0 top-0 bottom-0 rounded-full" style={{ width: `${barW}%`, backgroundColor: isTop ? accent : `${accent}50` }} />
                  </div>
                  <span style={{ fontSize: '10px', color: isTop ? '#fff' : 'rgba(255,255,255,0.65)', fontFamily: 'monospace', width: '60px', textAlign: 'right', flexShrink: 0 }}>
                    {fmt(g.priceUsd)}
                  </span>
                  <span style={{ fontSize: '8px', color: hasVol ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.15)', fontFamily: 'monospace', width: '24px', textAlign: 'right', flexShrink: 0 }}>
                    {hasVol ? `${g.salesVolume}` : '—'}
                  </span>
                </div>
              );
            })}
            <div className="flex items-center justify-end gap-3 mt-1 pt-1" style={{ borderTop: `1px solid rgba(255,255,255,0.05)` }}>
              <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.18)' }}>price · vol</span>
            </div>
          </div>
        </>
      )}

      {/* ── CENSUS SNAPSHOT ── */}
      {censusSummary && card(
        <>
          {sectionHead('Census Snapshot', <Activity className="w-3 h-3" />)}
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <div style={{ fontSize: '20px', color: '#fff', fontFamily: 'monospace', lineHeight: 1 }}>
                {censusSummary.totalGraded.toLocaleString()}
              </div>
              <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>total graded</div>
            </div>
            <div className="text-right">
              <div style={{ fontSize: '16px', color: censusSummary.highGradeCount > 0 ? '#f87171' : 'rgba(255,255,255,0.3)', fontFamily: 'monospace', lineHeight: 1 }}>
                {censusSummary.highGradeCount.toLocaleString()}
              </div>
              <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>9.8+</div>
            </div>
          </div>
          {censusSummary.histogram && censusSummary.histogram.length > 0 && (
            <div className="flex flex-col gap-0.5">
              {censusSummary.histogram.slice(0, 6).map((h) => {
                const barW = censusSummary.totalGraded > 0 ? Math.min(100, Math.max(2, (h.count / censusSummary.totalGraded) * 100)) : 0;
                return (
                  <div key={h.grade} className="flex items-center gap-2">
                    <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', width: '28px', flexShrink: 0 }}>{h.grade}</span>
                    <div className="flex-1 relative h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <div className="absolute left-0 top-0 bottom-0 rounded-full" style={{ width: `${barW}%`, backgroundColor: `${accent}60` }} />
                    </div>
                    <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', width: '32px', textAlign: 'right', flexShrink: 0 }}>
                      {h.count.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.18)', marginTop: 6 }}>
            CGC Universal + SS · {new Date(censusSummary.snapshotDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </div>
        </>
      )}

      {/* ── NEWS HEADLINES ── */}
      {card(
        <>
          {sectionHead('Intelligence Feed', <Newspaper className="w-3 h-3" />)}
          {topNews.length === 0 ? (
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: '12px 0' }}>No recent stories</div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {topNews.map(({ item, score }) => {
                const cls = classifyNewsItem(item.title, item.summary ?? '');
                const sc = getSourceColor(item.source, accent);
                const pubDate = item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
                return (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded px-2 py-1.5 transition-colors pp-hover-bg-5"
                    style={{
                      textDecoration: 'none',
                      backgroundColor: score > 0 ? `${accent}08` : 'rgba(255,255,255,0.015)',
                      border: `1px solid ${score > 0 ? `${accent}25` : 'rgba(255,255,255,0.06)'}`,
                      borderLeft: `2px solid ${score > 0 ? `${accent}60` : 'rgba(255,255,255,0.08)'}`,
                    }}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span style={{ fontSize: '7px', color: cls.color, backgroundColor: `${cls.color}18`, border: `1px solid ${cls.color}30`, borderRadius: '2px', padding: '0 3px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        {cls.type}
                      </span>
                      <span style={{ fontSize: '7px', color: sc, backgroundColor: `${sc}12`, border: `1px solid ${sc}28`, borderRadius: '2px', padding: '0 3px' }}>
                        {item.source}
                      </span>
                      {pubDate && <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.2)', marginLeft: 'auto' }}>{pubDate}</span>}
                    </div>
                    <p style={{ fontSize: '10px', color: score > 0 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.42)', lineHeight: 1.35, margin: 0 }} className="line-clamp-2">
                      {item.title}
                    </p>
                  </a>
                );
              })}
            </div>
          )}
          <p style={{ fontSize: '7px', color: 'rgba(255,255,255,0.18)', marginTop: 8 }}>
            AI-scored · tracking {workName} · refreshes every 2 min
          </p>
        </>
      )}

    </div>
  );
}
