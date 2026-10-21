'use client';
import React, { useMemo } from 'react';
import Panel from './Panel';
import { getEraColors } from '@/lib/design-system/colors';
import { Target, TrendingUp, TrendingDown, Zap } from 'lucide-react';

export interface InvestmentThesisCardProps {
  variant: {
    workName: string;
    issueNumber: string;
    era: string | null;
    publisher: string;
    scarcityTier: string | null;
  };
  keyPrices: {
    fmv98Usd: number;
    sovPriceUsd: number;
  };
  censusSummary: {
    totalGraded: number;
    highGradeCount: number;
  } | null | undefined;
  series: {
    name: string;
    totalIssues: number;
  } | null | undefined;
  priceHistory: Array<{ priceUsd: number; observedAt: string }>;
  eraColors: { border: string; bg: string; bgHover: string; glow: string };
}

const FALLBACK_BULL_POINTS = [
  'Proven historical resilience across market cycles',
  'Strong collector demand for foundational character milestone',
  'Consistent secondary market liquidity among peer issues',
];

const FALLBACK_BEAR_POINTS = [
  'Macro discretionary spending sensitivity may pressure valuations',
  'Specialized collectibles liquidity profile requires patient holding periods',
  'Future grading submissions may increment known census supply',
];

export default function InvestmentThesisCard({
  variant,
  keyPrices,
  censusSummary,
  series: _series,
  priceHistory = [],
  eraColors,
}: InvestmentThesisCardProps) {
  const colors = eraColors ?? getEraColors(variant?.era);

  const { bullBullets, bearBullets, catalystBullets } = useMemo(() => {
    const eraStr = (variant?.era || '').toLowerCase().trim();
    const pubStr = (variant?.publisher || '').toLowerCase().trim();
    const highGradeCount = censusSummary?.highGradeCount;
    const totalGraded = censusSummary?.totalGraded;
    const sovPrice = keyPrices?.sovPriceUsd ?? 0;

    // ── Bull Case (green) ──────────────────────────────────
    const bulls: string[] = [];

    // If era is golden/silver → 'Pre-1970 key issue with extreme natural scarcity'
    if (eraStr.includes('golden') || eraStr.includes('silver')) {
      bulls.push('Pre-1970 key issue with extreme natural scarcity');
    }

    // If highGradeCount < 50 → 'Extremely limited high-grade population ({count} copies at 9.8+)'
    if (typeof highGradeCount === 'number' && highGradeCount < 50) {
      bulls.push(`Extremely limited high-grade population (${highGradeCount.toLocaleString()} copies at 9.8+)`);
    }

    // If sovPriceUsd > 5000 → 'Blue-chip equity with institutional demand floor'
    if (typeof sovPrice === 'number' && sovPrice > 5000) {
      bulls.push('Blue-chip equity with institutional demand floor');
    }

    // If publisher is Marvel → 'MCU adaptation pipeline provides ongoing catalyst'
    if (pubStr.includes('marvel')) {
      bulls.push('MCU adaptation pipeline provides ongoing catalyst');
    } else if (pubStr.includes('dc')) {
      // If publisher is DC → 'Warner Bros/DC Studios content pipeline active'
      bulls.push('Warner Bros/DC Studios content pipeline active');
    }

    // Always include at least 2 bullets
    for (const fallback of FALLBACK_BULL_POINTS) {
      if (bulls.length >= 2) break;
      if (!bulls.includes(fallback)) {
        bulls.push(fallback);
      }
    }

    // ── Bear Case (red) ────────────────────────────────────
    const bears: string[] = [];

    // If totalGraded > 2000 → 'Large graded population may cap appreciation'
    if (typeof totalGraded === 'number' && totalGraded > 2000) {
      bears.push('Large graded population may cap appreciation');
    }

    // If era is modern → 'Modern era print runs limit natural scarcity'
    if (eraStr.includes('modern')) {
      bears.push('Modern era print runs limit natural scarcity');
    }

    // If price trending down (last 4 prices declining) → 'Recent price momentum negative'
    if (priceHistory && priceHistory.length >= 4) {
      const sorted = [...priceHistory].sort((a, b) =>
        (a.observedAt || '').localeCompare(b.observedAt || '')
      );
      const last4 = sorted.slice(-4);
      const isDeclining =
        (last4[1].priceUsd < last4[0].priceUsd &&
          last4[2].priceUsd < last4[1].priceUsd &&
          last4[3].priceUsd < last4[2].priceUsd) ||
        (last4[1].priceUsd <= last4[0].priceUsd &&
          last4[2].priceUsd <= last4[1].priceUsd &&
          last4[3].priceUsd <= last4[2].priceUsd &&
          last4[3].priceUsd < last4[0].priceUsd);

      if (isDeclining) {
        bears.push('Recent price momentum negative');
      }
    }

    // If highGradeCount > 200 → 'Abundant 9.8 supply reduces scarcity premium'
    if (typeof highGradeCount === 'number' && highGradeCount > 200) {
      bears.push('Abundant 9.8 supply reduces scarcity premium');
    }

    // Always include at least 2 bullets
    for (const fallback of FALLBACK_BEAR_POINTS) {
      if (bears.length >= 2) break;
      if (!bears.includes(fallback)) {
        bears.push(fallback);
      }
    }

    // ── Catalyst Watch (amber) ─────────────────────────────
    const catalysts: string[] = [];
    if (pubStr.includes('marvel')) {
      catalysts.push('MCU Phase announcement potential');
    } else if (pubStr.includes('dc')) {
      catalysts.push('DC Studios slate expansion');
    }
    catalysts.push('CGC census population shift');
    catalysts.push('Record auction result for comparable key');

    return {
      bullBullets: bulls.slice(0, 3),
      bearBullets: bears.slice(0, 3),
      catalystBullets: catalysts.slice(0, 3),
    };
  }, [variant, keyPrices, censusSummary, priceHistory]);

  return (
    <Panel
      title="Investment Thesis"
      icon={<Target className="w-3.5 h-3.5" />}
      eraColors={colors as ReturnType<typeof getEraColors>}
    >
      <div className="flex flex-col gap-[12px]">
        {/* Bull Case */}
        <div
          className="pl-2.5 py-1"
          style={{ borderLeft: '3px solid #22c55e' }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <TrendingUp className="w-3 h-3 shrink-0" style={{ color: '#22c55e' }} />
            <span
              className="text-[8px] uppercase tracking-wider font-semibold"
              style={{
                color: '#22c55e',
                fontFamily: 'monospace',
                letterSpacing: '0.12em',
              }}
            >
              Bull Case
            </span>
          </div>
          <ul className="space-y-1.5 m-0 p-0 list-none">
            {bullBullets.map((bullet, idx) => (
              <li
                key={idx}
                className="flex items-start gap-1.5 leading-snug"
                style={{
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.75)',
                  fontFamily: 'Hind, sans-serif',
                }}
              >
                <span
                  className="select-none shrink-0"
                  style={{
                    color: '#22c55e',
                    opacity: 0.75,
                    fontSize: '10px',
                    lineHeight: '15px',
                  }}
                >
                  •
                </span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bear Case */}
        <div
          className="pl-2.5 py-1"
          style={{ borderLeft: '3px solid #ef4444' }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <TrendingDown className="w-3 h-3 shrink-0" style={{ color: '#ef4444' }} />
            <span
              className="text-[8px] uppercase tracking-wider font-semibold"
              style={{
                color: '#ef4444',
                fontFamily: 'monospace',
                letterSpacing: '0.12em',
              }}
            >
              Bear Case
            </span>
          </div>
          <ul className="space-y-1.5 m-0 p-0 list-none">
            {bearBullets.map((bullet, idx) => (
              <li
                key={idx}
                className="flex items-start gap-1.5 leading-snug"
                style={{
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.75)',
                  fontFamily: 'Hind, sans-serif',
                }}
              >
                <span
                  className="select-none shrink-0"
                  style={{
                    color: '#ef4444',
                    opacity: 0.75,
                    fontSize: '10px',
                    lineHeight: '15px',
                  }}
                >
                  •
                </span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Catalyst Watch */}
        <div
          className="pl-2.5 py-1"
          style={{ borderLeft: '3px solid #f59e0b' }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <Zap className="w-3 h-3 shrink-0" style={{ color: '#f59e0b' }} />
            <span
              className="text-[8px] uppercase tracking-wider font-semibold"
              style={{
                color: '#f59e0b',
                fontFamily: 'monospace',
                letterSpacing: '0.12em',
              }}
            >
              Catalyst Watch
            </span>
          </div>
          <ul className="space-y-1.5 m-0 p-0 list-none">
            {catalystBullets.map((bullet, idx) => (
              <li
                key={idx}
                className="flex items-start gap-1.5 leading-snug"
                style={{
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.75)',
                  fontFamily: 'Hind, sans-serif',
                }}
              >
                <span
                  className="select-none shrink-0"
                  style={{
                    color: '#f59e0b',
                    opacity: 0.75,
                    fontSize: '10px',
                    lineHeight: '15px',
                  }}
                >
                  •
                </span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Panel>
  );
}
