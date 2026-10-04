'use client';
import React from 'react';
import Panel from './Panel';
import { getEraColors } from '@/lib/design-system/colors';
import { User, Clock, Briefcase, Shield } from 'lucide-react';

export interface CollectorProfileCardProps {
  variant: {
    era: string | null;
    scarcityTier: string | null;
    workName: string;
  };
  keyPrices: {
    fmv98Usd: number;
    sovPriceUsd: number;
  };
  censusSummary: {
    totalGraded: number;
    highGradeCount: number;
  } | null | undefined;
  gradeLattice: Array<{ grade: string; priceUsd: number }>;
  eraColors: { border: string; bg: string; bgHover: string; glow: string };
}

type CollectorTypeKey = 'trophy' | 'blue_chip' | 'growth' | 'targeted' | 'spec';

interface ProfileDetails {
  badge: string;
  badgeTextColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeGlow: string;
  description: string;
}

const COLLECTOR_PROFILES: Record<CollectorTypeKey, ProfileDetails> = {
  trophy: {
    badge: '🏆 TROPHY PIECE',
    badgeTextColor: '#F59E0B',
    badgeBg: 'rgba(245, 158, 11, 0.12)',
    badgeBorder: 'rgba(245, 158, 11, 0.35)',
    badgeGlow: 'rgba(245, 158, 11, 0.18)',
    description: 'Generational apex asset with museum-grade historical prestige.',
  },
  blue_chip: {
    badge: '⚓ BLUE CHIP ANCHOR',
    badgeTextColor: '#38BDF8',
    badgeBg: 'rgba(56, 189, 248, 0.12)',
    badgeBorder: 'rgba(56, 189, 248, 0.35)',
    badgeGlow: 'rgba(56, 189, 248, 0.18)',
    description: 'Institutional-grade core holding providing high liquidity and stability.',
  },
  growth: {
    badge: '📈 GROWTH POSITION',
    badgeTextColor: '#4ADE80',
    badgeBg: 'rgba(74, 222, 128, 0.12)',
    badgeBorder: 'rgba(74, 222, 128, 0.35)',
    badgeGlow: 'rgba(74, 222, 128, 0.18)',
    description: 'High-conviction equity with strong appreciation upside and momentum.',
  },
  targeted: {
    badge: '🎯 TARGETED ACQUISITION',
    badgeTextColor: '#FBBF24',
    badgeBg: 'rgba(251, 191, 36, 0.12)',
    badgeBorder: 'rgba(251, 191, 36, 0.35)',
    badgeGlow: 'rgba(251, 191, 36, 0.18)',
    description: 'Value-focused accumulation target poised for catalyst breakouts.',
  },
  spec: {
    badge: '🔍 SPEC POSITION',
    badgeTextColor: 'rgba(255, 255, 255, 0.75)',
    badgeBg: 'rgba(255, 255, 255, 0.06)',
    badgeBorder: 'rgba(255, 255, 255, 0.16)',
    badgeGlow: 'rgba(255, 255, 255, 0.08)',
    description: 'Speculative micro-allocation with high-beta risk/reward characteristics.',
  },
};

function getCollectorType(sovPrice: number, era: string | null | undefined): CollectorTypeKey {
  const normalizedEra = (era || '')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\s+age$/, '')
    .trim();
  const isGoldenOrSilver = normalizedEra === 'golden' || normalizedEra === 'silver';

  if (sovPrice > 10000 && isGoldenOrSilver) {
    return 'trophy';
  }
  if (sovPrice > 5000) {
    return 'blue_chip';
  }
  if (sovPrice > 1000) {
    return 'growth';
  }
  if (sovPrice > 200) {
    return 'targeted';
  }
  return 'spec';
}

function getHoldPeriod(type: CollectorTypeKey): { text: string; color: string } {
  if (type === 'trophy' || type === 'blue_chip') {
    return { text: 'LONG TERM (5+ YR)', color: '#38BDF8' };
  }
  if (type === 'growth') {
    return { text: 'MEDIUM TERM (1-3 YR)', color: '#4ADE80' };
  }
  return { text: 'ACTIVE MANAGEMENT', color: '#FBBF24' };
}

function getPortfolioRole(type: CollectorTypeKey): string {
  switch (type) {
    case 'trophy':
      return 'CORNERSTONE HOLDING';
    case 'blue_chip':
      return 'CORE POSITION';
    case 'growth':
      return 'SATELLITE POSITION';
    case 'targeted':
    case 'spec':
    default:
      return 'OPPORTUNISTIC TRADE';
  }
}

function getRiskProfile(sovPrice: number, gradesCount: number): {
  label: string;
  color: string;
  widthPercent: number;
} {
  const isHighPrice = sovPrice >= 2500;
  const isManyGrades = gradesCount >= 5;
  const isLowPrice = sovPrice < 500;
  const isFewGrades = gradesCount <= 3;

  if (isHighPrice && isManyGrades) {
    return {
      label: 'LOW RISK',
      color: '#4ADE80',
      widthPercent: 25,
    };
  }

  if (isLowPrice && isFewGrades) {
    return {
      label: 'ELEVATED RISK',
      color: '#F87171',
      widthPercent: 75,
    };
  }

  return {
    label: 'MODERATE RISK',
    color: '#FBBF24',
    widthPercent: 50,
  };
}

export default function CollectorProfileCard({
  variant,
  keyPrices,
  censusSummary,
  gradeLattice = [],
  eraColors,
}: CollectorProfileCardProps) {
  const colors = eraColors ?? getEraColors(variant?.era);
  const sovPrice = Number(keyPrices?.sovPriceUsd ?? keyPrices?.fmv98Usd) || 0;
  const lattice = Array.isArray(gradeLattice) ? gradeLattice : [];
  const validGradesCount = lattice.filter(
    (g) => g && typeof g.priceUsd === 'number' && g.priceUsd > 0
  ).length || lattice.length;

  const collectorType = getCollectorType(sovPrice, variant?.era);
  const profile = COLLECTOR_PROFILES[collectorType];
  const holdPeriod = getHoldPeriod(collectorType);
  const portfolioRole = getPortfolioRole(collectorType);
  const risk = getRiskProfile(sovPrice, validGradesCount);

  return (
    <Panel
      title="Collector Profile"
      icon={<User className="w-3.5 h-3.5" />}
      eraColors={colors as ReturnType<typeof getEraColors>}
    >
      <div className="space-y-3">
        {/* Top Prominent Badge & 1-line Description */}
        <div className="space-y-2">
          <div
            className="inline-flex items-center px-2.5 py-1 rounded text-xs font-mono font-bold tracking-wider"
            style={{
              backgroundColor: profile.badgeBg,
              border: `1px solid ${profile.badgeBorder}`,
              color: profile.badgeTextColor,
              boxShadow: `0 0 10px ${profile.badgeGlow}`,
            }}
          >
            {profile.badge}
          </div>
          <p
            className="text-xs leading-relaxed"
            style={{
              color: 'rgba(255, 255, 255, 0.65)',
              fontFamily: 'Hind, sans-serif',
            }}
          >
            {profile.description}
          </p>
        </div>

        {/* Ideal Hold Period */}
        <div
          className="flex items-center justify-between py-2"
          style={{ borderTop: `1px solid ${colors.border}18` }}
        >
          <div className="flex items-center gap-2 shrink-0">
            <Clock className="w-4 h-4 shrink-0" style={{ color: colors.border }} />
            <span
              className="text-[8px] uppercase tracking-wider font-semibold font-mono"
              style={{
                color: 'rgba(255, 255, 255, 0.45)',
                letterSpacing: '0.12em',
              }}
            >
              IDEAL HOLD PERIOD
            </span>
          </div>
          <span
            className="text-xs font-mono font-semibold text-right"
            style={{ color: holdPeriod.color }}
          >
            {holdPeriod.text}
          </span>
        </div>

        {/* Portfolio Role */}
        <div
          className="flex items-center justify-between py-2"
          style={{ borderTop: `1px solid ${colors.border}18` }}
        >
          <div className="flex items-center gap-2 shrink-0">
            <Briefcase className="w-4 h-4 shrink-0" style={{ color: colors.border }} />
            <span
              className="text-[8px] uppercase tracking-wider font-semibold font-mono"
              style={{
                color: 'rgba(255, 255, 255, 0.45)',
                letterSpacing: '0.12em',
              }}
            >
              PORTFOLIO ROLE
            </span>
          </div>
          <span
            className="text-xs font-mono font-semibold text-right"
            style={{ color: 'rgba(255, 255, 255, 0.9)' }}
          >
            {portfolioRole}
          </span>
        </div>

        {/* Risk Profile */}
        <div
          className="flex items-center justify-between py-2"
          style={{ borderTop: `1px solid ${colors.border}18` }}
        >
          <div className="flex items-center gap-2 shrink-0">
            <Shield className="w-4 h-4 shrink-0" style={{ color: colors.border }} />
            <span
              className="text-[8px] uppercase tracking-wider font-semibold font-mono"
              style={{
                color: 'rgba(255, 255, 255, 0.45)',
                letterSpacing: '0.12em',
              }}
            >
              RISK PROFILE
            </span>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <span
              className="text-xs font-mono font-semibold"
              style={{ color: risk.color }}
            >
              {risk.label}
            </span>
            <div
              className="w-12 h-1.5 rounded-full overflow-hidden shrink-0"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${risk.widthPercent}%`,
                  backgroundColor: risk.color,
                  boxShadow: `0 0 6px ${risk.color}40`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}
