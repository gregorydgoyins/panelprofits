import React, { useMemo } from 'react';
import Link from 'next/link';
import { BookOpen, TrendingUp, Hash } from 'lucide-react';
import Panel from './Panel';
import { getEraColors } from '@/lib/design-system/colors';
import { buildEquityUrl } from '@/lib/urlBuilder';

export interface SeriesContextCardProps {
  series: {
    name: string;
    publisher: string;
    startYear: number;
    endYear: number | null;
    totalIssues: number;
    keyIssues?: string[];
  } | null | undefined;
  seriesIssues: Array<{
    id: number;
    variantId: string;
    workName: string;
    issueNumber: string;
    sovereign_price_usd: number | null;
    anchor_price_usd: number | null;
  }>;
  currentVariantId: string;
  eraColors: { border: string; bg: string; bgHover: string; glow: string };
}

function formatPrice(val: number | null | undefined): string {
  if (val == null || isNaN(val)) return '—';
  return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function SeriesContextCard({
  series,
  seriesIssues = [],
  currentVariantId,
  eraColors,
}: SeriesContextCardProps) {
  // If series is null/undefined AND seriesIssues is empty, return null
  if (!series && (!seriesIssues || seriesIssues.length === 0)) {
    return null;
  }

  const colors = eraColors ?? getEraColors(null);

  // Top keys: sorted by sovereign_price_usd descending (falling back to anchor_price_usd),
  // taking top 3 (excluding currentVariantId)
  const topKeys = useMemo(() => {
    const issues = seriesIssues || [];
    const sorted = [...issues].sort((a, b) => {
      const priceA = a.sovereign_price_usd ?? a.anchor_price_usd ?? 0;
      const priceB = b.sovereign_price_usd ?? b.anchor_price_usd ?? 0;
      return priceB - priceA;
    });

    const filtered = sorted.filter((issue) => issue.variantId !== currentVariantId);
    // If filtering out currentVariantId leaves empty but sorted has items, fallback to sorted
    return (filtered.length > 0 ? filtered : sorted).slice(0, 3);
  }, [seriesIssues, currentVariantId]);

  const seriesName = series?.name || seriesIssues?.[0]?.workName || 'Series Overview';
  const publisher = series?.publisher;

  const yearRange = series?.startYear
    ? `${series.startYear} – ${series.endYear != null ? series.endYear : 'Present'}`
    : '—';

  const totalIssuesCount =
    series?.totalIssues != null && series.totalIssues > 0
      ? series.totalIssues.toLocaleString()
      : seriesIssues?.length
        ? seriesIssues.length.toLocaleString()
        : '—';

  return (
    <Panel
      title="Series Overview"
      icon={<BookOpen className="w-3.5 h-3.5" />}
      eraColors={colors as ReturnType<typeof getEraColors>}
    >
      <div className="space-y-3.5">
        {/* 1. Series Name (bold, white) & Publisher */}
        <div>
          {publisher && (
            <div
              className="text-[9px] uppercase tracking-wider font-mono mb-1 font-semibold"
              style={{ color: colors.border }}
            >
              {publisher}
            </div>
          )}
          <div
            className="text-sm font-bold leading-tight"
            style={{ color: '#ffffff', fontFamily: 'Hind, sans-serif' }}
          >
            {seriesName}
          </div>
        </div>

        {/* Stat blocks: 2. Year Range and 3. Total Issues count with Hash icon */}
        <div
          className="grid grid-cols-2 gap-3 pt-2"
          style={{ borderTop: `1px solid ${colors.border}15` }}
        >
          <div>
            <div
              className="text-[8px] sm:text-[9px] uppercase tracking-wider font-mono mb-0.5"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              Year Range
            </div>
            <div
              className="text-xs font-mono font-medium"
              style={{ color: 'rgba(255,255,255,0.85)' }}
            >
              {yearRange}
            </div>
          </div>

          <div>
            <div
              className="text-[8px] sm:text-[9px] uppercase tracking-wider font-mono mb-0.5"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              Total Issues
            </div>
            <div
              className="flex items-center gap-1 text-xs font-mono font-medium"
              style={{ color: 'rgba(255,255,255,0.85)' }}
            >
              <Hash className="w-3 h-3 shrink-0" style={{ color: `${colors.border}cc` }} />
              <span>{totalIssuesCount}</span>
            </div>
          </div>
        </div>

        {/* 4. 'TOP KEYS' section */}
        {topKeys.length > 0 && (
          <div className="pt-2" style={{ borderTop: `1px solid ${colors.border}15` }}>
            <div className="flex items-center justify-between mb-2">
              <div
                className="flex items-center gap-1.5 text-[8px] sm:text-[9px] uppercase tracking-wider font-mono font-semibold"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                <TrendingUp className="w-3 h-3 shrink-0" style={{ color: colors.border }} />
                <span>Top Keys</span>
              </div>
              <span
                className="text-[8px] font-mono uppercase tracking-wider"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                By FMV
              </span>
            </div>

            <div className="space-y-1.5">
              {topKeys.map((issue) => {
                const isCurrent = issue.variantId === currentVariantId;
                const price = issue.sovereign_price_usd ?? issue.anchor_price_usd;
                const issueDisplay = issue.issueNumber?.startsWith('#')
                  ? issue.issueNumber
                  : `#${issue.issueNumber}`;

                return (
                  <Link
                    key={issue.id ?? issue.variantId}
                    href={buildEquityUrl(issue.variantId)}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded transition-all group"
                    style={{
                      border: `1px solid ${isCurrent ? colors.border : `${colors.border}20`}`,
                      backgroundColor: isCurrent ? `${colors.border}18` : 'rgba(255,255,255,0.018)',
                      boxShadow: isCurrent ? `0 0 10px ${colors.border}25` : 'none',
                      textDecoration: 'none',
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="text-xs font-mono font-medium"
                        style={{
                          color: isCurrent ? colors.border : 'rgba(255,255,255,0.85)',
                        }}
                      >
                        {issueDisplay}
                      </span>
                      {isCurrent && (
                        <span
                          className="text-[8px] font-mono px-1 py-0.2 rounded uppercase tracking-wider"
                          style={{
                            backgroundColor: `${colors.border}25`,
                            color: colors.border,
                            border: `1px solid ${colors.border}45`,
                          }}
                        >
                          Current
                        </span>
                      )}
                    </div>
                    <span
                      className="text-xs font-mono font-medium"
                      style={{
                        color: isCurrent ? colors.border : 'rgba(255,255,255,0.7)',
                      }}
                    >
                      {formatPrice(price)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. 'ISSUES IN SERIES' — tiny text showing X issues tracked */}
        <div className="pt-2" style={{ borderTop: `1px solid ${colors.border}15` }}>
          <div
            className="text-[8px] sm:text-[9px] uppercase tracking-wider font-mono mb-0.5 font-semibold"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            Issues In Series
          </div>
          <div
            className="text-[10px] font-mono"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>{(seriesIssues || []).length}</span> issues tracked
          </div>
        </div>
      </div>
    </Panel>
  );
}
