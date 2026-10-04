'use client';
import React, { useMemo } from 'react';
import Panel from './Panel';
import { Gavel, TrendingUp, TrendingDown, Clock, DollarSign } from 'lucide-react';
import { getEraColors } from '@/lib/design-system/colors';

export interface AuctionHistoryCardProps {
  recentSales?: Array<{ grade: string; priceUsd: number; date: string; platform?: string }> | null;
  saleIntelligence?: { avgSalePrice?: number; medianSalePrice?: number; totalSalesCount?: number; salesVelocity?: number } | null;
  keyPrices?: { sovPriceUsd?: number; fmvRawUsd?: number; fmv98Usd?: number } | null;
  eraColors: { border: string; bg: string; bgHover: string; glow: string };
}

function formatPrice(val: number | null | undefined): string {
  if (val == null || isNaN(val) || typeof val !== 'number' || val <= 0) {
    return '—';
  }
  return '$' + val.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(str?: string | null): string {
  if (!str) return '—';
  try {
    const parts = str.split('T')[0].split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      if (!isNaN(year) && monthIndex >= 0 && monthIndex < 12 && !isNaN(day)) {
        return `${months[monthIndex]} ${String(day).padStart(2, '0')}, ${year}`;
      }
    }
    const d = new Date(str);
    if (isNaN(d.getTime())) return str;
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  } catch {
    return str;
  }
}

export default function AuctionHistoryCard({
  recentSales,
  saleIntelligence,
  keyPrices: _keyPrices,
  eraColors,
}: AuctionHistoryCardProps) {
  const colors = eraColors ?? getEraColors(undefined);

  // 1. Sanitize sales data
  const validSales = useMemo(() => {
    if (!recentSales || !Array.isArray(recentSales)) return [];
    return recentSales
      .filter(Boolean)
      .map((s) => {
        const priceNum = typeof s.priceUsd === 'number' ? s.priceUsd : parseFloat(String(s.priceUsd));
        return {
          ...s,
          priceUsd: priceNum,
          grade: s.grade || 'RAW',
          date: s.date || '',
          platform: s.platform,
        };
      })
      .filter((s) => typeof s.priceUsd === 'number' && !isNaN(s.priceUsd) && s.priceUsd > 0);
  }, [recentSales]);

  // 2. Top Recorded Sale (highest priceUsd)
  const topSale = useMemo(() => {
    if (validSales.length === 0) return null;
    let highest = validSales[0];
    for (let i = 1; i < validSales.length; i++) {
      if (validSales[i].priceUsd > highest.priceUsd) {
        highest = validSales[i];
      }
    }
    return highest;
  }, [validSales]);

  // 3. Sales Velocity: saleIntelligence.salesVelocity or compute from recentSales length
  const salesVelocity = useMemo<number | null>(() => {
    if (
      saleIntelligence?.salesVelocity != null &&
      !isNaN(saleIntelligence.salesVelocity) &&
      typeof saleIntelligence.salesVelocity === 'number'
    ) {
      return saleIntelligence.salesVelocity;
    }
    if (validSales.length === 0) return null;

    const timestamps = validSales
      .map((s) => new Date(s.date).getTime())
      .filter((t) => !isNaN(t));

    if (timestamps.length >= 2) {
      const minTime = Math.min(...timestamps);
      const maxTime = Math.max(...timestamps);
      const diffDays = Math.max(1, (maxTime - minTime) / (1000 * 60 * 60 * 24));
      const months = diffDays / 30.4375;
      const effectiveMonths = Math.max(0.5, months);
      return validSales.length / effectiveMonths;
    }

    return validSales.length > 0 ? validSales.length : null;
  }, [saleIntelligence?.salesVelocity, validSales]);

  // Velocity styling: green (#4ade80) if > 2, amber (#fbbf24) if 1-2, red (#f87171) if < 1
  let velocityColor = 'rgba(255,255,255,0.4)';
  let velocityText = '—';
  if (salesVelocity != null && !isNaN(salesVelocity)) {
    velocityText = `${salesVelocity.toFixed(1)} SALES / MONTH`;
    if (salesVelocity > 2) {
      velocityColor = '#4ade80';
    } else if (salesVelocity >= 1) {
      velocityColor = '#fbbf24';
    } else {
      velocityColor = '#f87171';
    }
  }

  // 4. Average vs Median
  const computedAvg = useMemo<number | null>(() => {
    if (
      saleIntelligence?.avgSalePrice != null &&
      !isNaN(saleIntelligence.avgSalePrice) &&
      typeof saleIntelligence.avgSalePrice === 'number' &&
      saleIntelligence.avgSalePrice > 0
    ) {
      return saleIntelligence.avgSalePrice;
    }
    if (validSales.length === 0) return null;
    const sum = validSales.reduce((acc, s) => acc + s.priceUsd, 0);
    return sum / validSales.length;
  }, [saleIntelligence?.avgSalePrice, validSales]);

  const computedMedian = useMemo<number | null>(() => {
    if (
      saleIntelligence?.medianSalePrice != null &&
      !isNaN(saleIntelligence.medianSalePrice) &&
      typeof saleIntelligence.medianSalePrice === 'number' &&
      saleIntelligence.medianSalePrice > 0
    ) {
      return saleIntelligence.medianSalePrice;
    }
    if (validSales.length === 0) return null;
    const sorted = validSales.map((s) => s.priceUsd).sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    return sorted[mid];
  }, [saleIntelligence?.medianSalePrice, validSales]);

  // 5. Sorted sales desc (by date)
  const sortedSalesDesc = useMemo(() => {
    if (validSales.length === 0) return [];
    return [...validSales].sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      if (!isNaN(timeA) && !isNaN(timeB)) {
        return timeB - timeA;
      }
      return (b.date || '').localeCompare(a.date || '');
    });
  }, [validSales]);

  // Last 4 sales
  const recentSalesList = useMemo(() => {
    return sortedSalesDesc.slice(0, 4);
  }, [sortedSalesDesc]);

  // 6. Trend Arrow: Compare average of most recent 2 sales to average of oldest 2 sales
  const priceTrend = useMemo<'up' | 'down' | null>(() => {
    if (sortedSalesDesc.length < 2) return null;

    let recentAvg: number;
    let oldestAvg: number;

    if (sortedSalesDesc.length >= 4) {
      const recent2 = sortedSalesDesc.slice(0, 2);
      const oldest2 = sortedSalesDesc.slice(-2);
      recentAvg = (recent2[0].priceUsd + recent2[1].priceUsd) / 2;
      oldestAvg = (oldest2[0].priceUsd + oldest2[1].priceUsd) / 2;
    } else if (sortedSalesDesc.length === 3) {
      recentAvg = (sortedSalesDesc[0].priceUsd + sortedSalesDesc[1].priceUsd) / 2;
      oldestAvg = (sortedSalesDesc[1].priceUsd + sortedSalesDesc[2].priceUsd) / 2;
    } else {
      recentAvg = sortedSalesDesc[0].priceUsd;
      oldestAvg = sortedSalesDesc[1].priceUsd;
    }

    if (recentAvg > oldestAvg) return 'up';
    if (recentAvg < oldestAvg) return 'down';
    return null;
  }, [sortedSalesDesc]);

  return (
    <Panel
      title="Auction History"
      icon={<Gavel className="w-3.5 h-3.5" />}
      eraColors={colors as ReturnType<typeof getEraColors>}
    >
      <div className="space-y-3" style={{ fontFamily: 'Hind, sans-serif' }}>
        {/* Top Recorded Sale */}
        <div>
          <div
            className="flex items-center gap-1 text-[9px] uppercase tracking-wider font-semibold mb-1"
            style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', letterSpacing: '0.12em' }}
          >
            <DollarSign className="w-2.5 h-2.5" />
            TOP RECORDED SALE
          </div>
          <div
            className="text-2xl font-bold tracking-tight"
            style={{ color: colors.border, fontFamily: 'monospace' }}
          >
            {topSale ? formatPrice(topSale.priceUsd) : '—'}
          </div>
          {topSale && (
            <div
              className="text-[9px] mt-0.5"
              style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}
            >
              GRADE {topSale.grade} · {formatDate(topSale.date)}
            </div>
          )}
        </div>

        {/* Sales Velocity */}
        <div
          className="p-2.5 rounded flex items-center justify-between"
          style={{
            backgroundColor: 'rgba(255,255,255,0.018)',
            border: `1px solid ${colors.border}20`,
          }}
        >
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.4)' }} />
            <span
              className="text-[9px] uppercase tracking-wider font-semibold"
              style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', letterSpacing: '0.12em' }}
            >
              SALES VELOCITY
            </span>
          </div>
          <span
            className="text-xs font-semibold"
            style={{
              color: velocityColor,
              fontFamily: 'monospace',
            }}
          >
            {velocityText}
          </span>
        </div>

        {/* Average vs Median */}
        <div className="grid grid-cols-2 gap-2">
          <div
            className="p-2.5 rounded flex flex-col justify-between"
            style={{
              backgroundColor: 'rgba(255,255,255,0.018)',
              border: `1px solid ${colors.border}20`,
            }}
          >
            <div
              className="text-[9px] uppercase tracking-wider font-semibold mb-1"
              style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', letterSpacing: '0.12em' }}
            >
              AVG SALE
            </div>
            <div
              className="text-sm font-semibold tracking-tight"
              style={{ color: '#ffffff', fontFamily: 'monospace' }}
            >
              {formatPrice(computedAvg)}
            </div>
          </div>

          <div
            className="p-2.5 rounded flex flex-col justify-between"
            style={{
              backgroundColor: 'rgba(255,255,255,0.018)',
              border: `1px solid ${colors.border}20`,
            }}
          >
            <div
              className="text-[9px] uppercase tracking-wider font-semibold mb-1"
              style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', letterSpacing: '0.12em' }}
            >
              MEDIAN SALE
            </div>
            <div
              className="text-sm font-semibold tracking-tight"
              style={{ color: colors.border, fontFamily: 'monospace' }}
            >
              {formatPrice(computedMedian)}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full" style={{ backgroundColor: `${colors.border}20` }} />

        {/* Recent Sales List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div
              className="text-[9px] uppercase tracking-wider font-semibold"
              style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', letterSpacing: '0.12em' }}
            >
              RECENT SALES
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="text-[9px] uppercase tracking-wider font-semibold"
                style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', letterSpacing: '0.12em' }}
              >
                PRICE TREND
              </span>
              {priceTrend === 'up' && (
                <TrendingUp className="w-3.5 h-3.5" style={{ color: '#4ade80' }} />
              )}
              {priceTrend === 'down' && (
                <TrendingDown className="w-3.5 h-3.5" style={{ color: '#f87171' }} />
              )}
              {!priceTrend && (
                <span
                  className="text-[9px]"
                  style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}
                >
                  —
                </span>
              )}
            </div>
          </div>

          {recentSalesList.length > 0 ? (
            <div className="flex flex-col">
              {recentSalesList.map((sale, idx) => (
                <div
                  key={`${sale.grade}-${sale.date}-${sale.priceUsd}-${idx}`}
                  className="flex items-center justify-between py-2"
                  style={{
                    borderBottom: idx < recentSalesList.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="font-mono text-[10px] rounded px-1.5 py-0.5 shrink-0 font-medium"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        color: 'rgba(255,255,255,0.85)',
                        fontFamily: 'monospace',
                        fontSize: '10px',
                      }}
                    >
                      {sale.grade || 'RAW'}
                    </span>
                    <div className="flex flex-col justify-center min-w-0">
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '9px',
                          color: 'rgba(255,255,255,0.5)',
                        }}
                      >
                        {formatDate(sale.date)}
                      </span>
                      {sale.platform && (
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '8px',
                            color: 'rgba(255,255,255,0.3)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {sale.platform}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className="text-right shrink-0 font-medium"
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      color: '#ffffff',
                    }}
                  >
                    {formatPrice(sale.priceUsd)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="text-center py-4 text-[11px]"
              style={{
                color: 'rgba(255,255,255,0.5)',
                fontFamily: 'Hind, sans-serif',
              }}
            >
              No recorded sales data available
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}
