'use client';

import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { getEraColors } from '@/lib/design-system/colors';
import type { GradePrice, InstrumentIntelligence } from './types';
import Panel from './Panel';
import AISectionBlock from './AISectionBlock';

const OWL_TILE_STYLE_ID = 'owl-tile-shadow-kf';
if (typeof document !== 'undefined' && !document.getElementById(OWL_TILE_STYLE_ID)) {
  const s = document.createElement('style');
  s.id = OWL_TILE_STYLE_ID;
  s.textContent = `
    .owl-tile {
      transition: background-color 150ms ease, border-color 150ms ease;
    }
    .owl-tile[data-hovered='true'] {
      box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--tile-color) 19%, transparent),
                  0 0 12px color-mix(in srgb, var(--tile-color) 8%, transparent);
    }
  `;
  document.head.appendChild(s);
}

const TECTONIC_TIER_CONFIG = [
  { label: 'EQUILIBRIUM', color: '#4ade80' }, { label: 'TREMOR', color: '#86efac' },
  { label: 'FAULT', color: '#fde68a' }, { label: 'SHEAR', color: '#f59e0b' },
  { label: 'SEISMIC', color: '#fb923c' }, { label: 'COLLAPSE', color: '#f87171' },
  { label: 'CRISIS', color: '#dc2626' },
];

interface NightOwlPulse { momentumDescriptor: string | null; priceChangePct: number | null; volumeIndex: number | null; }
interface NightOwlExecution { fillProbability: number | null; slippageRangeBps: [number, number] | null; }
interface NightOwlLiquidity { state: string | null; depthScore: number | null; decayTrend: string | null; }
interface NightOwlVolatility { regime: string | null; intradayRangePct: [number, number] | null; }
export interface NightOwlPayload { marketPulse: NightOwlPulse | null; executionQuality: NightOwlExecution | null; liquidityWeather: NightOwlLiquidity | null; volatilityEnvelope: NightOwlVolatility | null; }

export default function NightOwlPanel({ eraColors, gradeLattice = [], instrumentIntelligence = null, intelligenceSynthesis }: {
  eraColors: ReturnType<typeof getEraColors>;
  gradeLattice?: GradePrice[];
  instrumentIntelligence?: InstrumentIntelligence | null;
  intelligenceSynthesis?: string | null;
}) {
  const [data, setData] = useState<NightOwlPayload>({
    marketPulse: { momentumDescriptor: 'ACCELERATING', priceChangePct: 2.8, volumeIndex: 1.15 },
    executionQuality: { fillProbability: 88, slippageRangeBps: [4, 16] },
    liquidityWeather: { state: 'NORMAL', depthScore: 82, decayTrend: 'STABLE' },
    volatilityEnvelope: { regime: 'NORMAL', intradayRangePct: [1.1, 3.4] },
  });
  const [hoveredTile, setHoveredTile] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/nite-owl')
      .then(res => res.ok ? res.json() : null)
      .then(json => {
        if (!active || !json) return;
        const payload = (json?.data ?? json) as NightOwlPayload;
        if (payload && (payload.marketPulse || payload.executionQuality)) {
          setData(payload);
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const { marketPulse, executionQuality, liquidityWeather, volatilityEnvelope } = data;

  function stateColor(val: string | null | undefined) {
    if (!val) return 'rgba(255,255,255,0.4)';
    const v = val.toUpperCase();
    if (['NORMAL', 'IMPROVING', 'ACCELERATING', 'LIVE'].some(k => v.includes(k))) return '#4ade80';
    if (['ELEVATED', 'STRESSED', 'CAUTION', 'DECELERATING'].some(k => v.includes(k))) return '#fbbf24';
    if (['LOCKED', 'CRITICAL', 'FAILED'].some(k => v.includes(k))) return '#f87171';
    return 'rgba(255,255,255,0.5)';
  }

  const price98 = gradeLattice.find(g => g.grade === '9.8')?.priceUsd ?? 0;
  const priceRaw = gradeLattice.find(g => g.grade === 'RAW' || g.grade === 'raw')?.priceUsd ?? 0;
  const arbMultiple = (price98 > 0 && priceRaw > 0) ? price98 / priceRaw : null;
  const arbLabel = arbMultiple == null ? '—' : arbMultiple < 2 ? 'COMPRESSED' : arbMultiple < 10 ? 'NORMAL' : arbMultiple < 25 ? 'WIDE' : 'EXTREME';
  const arbColor = arbMultiple == null ? 'rgba(255,255,255,0.4)' : arbMultiple < 2 ? '#fbbf24' : arbMultiple < 10 ? '#4ade80' : arbMultiple < 25 ? '#fbbf24' : '#f87171';
  const arbSub = arbMultiple != null ? `${arbMultiple.toFixed(1)}× sovereign premium over raw` : 'Insufficient grade price data';

  const mr = instrumentIntelligence?.marketRegime ?? null;
  const tier = mr?.tectonicTier ?? 0;
  const tecCfg = TECTONIC_TIER_CONFIG[Math.min(tier, 6)];
  const tecLabel = mr ? `T${tier} · ${tecCfg.label}` : 'T0 · EQUILIBRIUM';
  const stressDisplay = mr?.stressIndex != null ? `${(mr.stressIndex * 100).toFixed(1)}%` : '0.0%';
  const overlayNote = mr?.principalOverlayActive ? `Principal desk active · ${mr.principalOverlayRemaining}t remaining` : 'No active overlay';
  const tecSub = mr ? `Stress ${stressDisplay} · ${overlayNote}` : 'Structural baseline · no active fault shear';
  const tecColor = mr ? tecCfg.color : tecCfg.color;

  const TILE_EXPLANATIONS: Record<string, string> = {
    'Fill Probability': 'The estimated likelihood that a trade order at current market prices gets filled without cancellation. High fill probability means buyer and seller agreement is close. Low fill probability means wide bid-ask spreads or thin order depth.',
    'Liquidity': 'How easily this issue can be bought or sold without moving the price significantly. Deep liquidity means many active buyers/sellers at similar prices. Decaying liquidity signals market thinning — wider spreads, slower fills.',
    'Volatility': 'The current price movement regime for this issue. NORMAL means stable price action. ELEVATED means larger-than-usual intraday swings. STRESSED means prices are moving rapidly, often driven by news or forced liquidation.',
    'Momentum': 'The directional price trend over recent observations. ACCELERATING means prices are moving faster in the prevailing direction. DECELERATING means the trend is losing energy. FLAT means no net directional movement.',
    'Grade Arbitrage': 'The price multiple between the Sovereign grade and raw ungraded copies. NORMAL (2–10×) is expected for most issues. WIDE (10–25×) signals collector scarcity premium. EXTREME (25×+) means raw copies are nearly unobtainable.',
    'Tectonic Pressure': 'A structural stress score (0–6) derived from the Causal Reflexivity Engine. Higher tiers signal systemic market pressure across all issues — not issue-specific. T0–T1 is baseline. T4+ triggers regime-wide policy multipliers.',
  };

  const tiles = [
    { label: 'Fill Probability', value: `${executionQuality?.fillProbability ?? '—'}%`, sub: `${executionQuality?.slippageRangeBps?.[0] ?? '—'}–${executionQuality?.slippageRangeBps?.[1] ?? '—'} bps slippage`, color: (executionQuality?.fillProbability ?? 0) > 80 ? '#4ade80' : '#fbbf24', tag: null },
    { label: 'Liquidity', value: liquidityWeather?.state ?? '—', sub: `Depth ${liquidityWeather?.depthScore ?? '—'} · ${liquidityWeather?.decayTrend ?? '—'}`, color: stateColor(liquidityWeather?.state), tag: null },
    { label: 'Volatility', value: volatilityEnvelope?.regime ?? '—', sub: `${volatilityEnvelope?.intradayRangePct?.[0] ?? '—'}% intraday range`, color: stateColor(volatilityEnvelope?.regime), tag: null },
    { label: 'Momentum', value: marketPulse?.momentumDescriptor ?? '—', sub: `${marketPulse?.priceChangePct != null ? (marketPulse.priceChangePct > 0 ? '+' : '') + marketPulse.priceChangePct + '%' : '—'} · Vol ${marketPulse?.volumeIndex ?? '—'}`, color: stateColor(marketPulse?.momentumDescriptor), tag: null },
    { label: 'Grade Arbitrage', value: arbLabel, sub: arbSub, color: arbColor, tag: 'ISSUE' },
    { label: 'Tectonic Pressure', value: tecLabel, sub: tecSub, color: tecColor, tag: 'ISSUE' },
  ];

  return (
    <Panel title="NightOwl Market Conditions" icon={<Eye className="w-3.5 h-3.5" />} eraColors={eraColors}>
      <div className="grid grid-cols-2 gap-2.5">
        {tiles.map(t => {
          const isHovered = hoveredTile === t.label;
          const explanation = TILE_EXPLANATIONS[t.label];
          return (
            <div key={t.label} className="owl-tile rounded p-2.5 relative cursor-default"
              data-hovered={isHovered ? 'true' : 'false'}
              style={{
                backgroundColor: isHovered ? `${t.color}14` : `${t.color}08`,
                border: `1px solid ${isHovered ? t.color + '60' : t.color + '25'}`,
                ['--tile-color' as string]: t.color,
              }}
              onMouseEnter={() => setHoveredTile(t.label)} onMouseLeave={() => setHoveredTile(null)}>
              <div className="flex items-center justify-between mb-1">
                <div className="text-[9px] uppercase tracking-wider" style={{ color: isHovered ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.62)' }}>{t.label}</div>
                {t.tag && <span className="text-[7px] uppercase tracking-wider px-1 rounded" style={{ color: 'rgba(255,255,255,0.76)', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'monospace' }}>{t.tag}</span>}
              </div>
              <div className="text-sm" style={{ color: t.color, fontFamily: 'monospace', fontWeight: 500 }}>{t.value}</div>
              {isHovered && explanation ? (
                <p className="text-[9px] mt-1.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.72)', fontFamily: 'Hind, sans-serif' }}>{explanation}</p>
              ) : (
                <div className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{t.sub}</div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-[9px] mt-3" style={{ color: 'rgba(255,255,255,0.2)' }}>
        Market-wide signal (top 4) · Issue-specific signal (bottom 2 · tagged ISSUE)
      </p>
      {intelligenceSynthesis && (
        <AISectionBlock text={intelligenceSynthesis} accentColor="#4ade80" label="Signal Synthesis" />
      )}
    </Panel>
  );
}
