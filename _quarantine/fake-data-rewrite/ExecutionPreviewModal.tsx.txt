'use client';
import type { DetailResponse, InstrumentIntelligence } from './types';
import { getEraColors } from '@/lib/design-system/colors';

const ANCHOR_CLASS_CONFIG = {
  SOVEREIGN: { label: 'SOVEREIGN', color: '#3b82f6' },
  ATOMIC:    { label: 'ATOMIC',    color: '#f59e0b' },
  STD:       { label: 'STD',       color: '#94a3b8' },
  OTC:       { label: 'OTC',       color: '#fb923c' },
};

const LIQUIDITY_TIER_CONFIG: Record<string, string> = {
  Deep: '#4ade80', Active: '#a3e635', Thin: '#fbbf24', Dormant: '#f87171',
};

export default function ExecutionPreviewModal({ variant, keyPrices, intel, onClose, onConfirm, eraColors, action }: {
  variant: DetailResponse['variant'];
  keyPrices: DetailResponse['keyPrices'];
  intel: InstrumentIntelligence;
  onClose: () => void;
  onConfirm?: () => void;
  eraColors: ReturnType<typeof getEraColors>;
  action: 'buy' | 'sell';
}) {
  const fmv = keyPrices.display_fmv_usd ?? keyPrices.sovPriceUsd ?? keyPrices.fmv98Usd ?? 0;
  const liqColor = LIQUIDITY_TIER_CONFIG[intel.liquidityTier] ?? 'rgba(255,255,255,0.4)';
  const anchor = ANCHOR_CLASS_CONFIG[intel.anchorClass as keyof typeof ANCHOR_CLASS_CONFIG] ?? ANCHOR_CLASS_CONFIG.OTC;

  const cx = intel.computedExecution;
  const fillProb = cx.fillProbability;
  const slipBps  = cx.slippageBps;

  const slipLow  = fmv * (1 - slipBps[1] / 10000);
  const slipHigh = fmv * (1 + slipBps[0] / 10000);
  const fillLow  = action === 'buy' ? fmv : slipLow;
  const fillHigh = action === 'buy' ? slipHigh : fmv;

  const regimeDeltaSlip = slipBps[1] - cx.baseSlippageBps[1];
  const regimeDeltaFill = fillProb - cx.baseFillProbability;

  const actionColor = action === 'buy' ? '#4ade80' : '#f87171';
  const actionLabel = action === 'buy' ? 'BUY' : 'SELL';

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 300, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="rounded-xl overflow-hidden" style={{ width: '420px', border: `1px solid ${eraColors.border}40`, backgroundColor: '#0d1220' }} onClick={e => e.stopPropagation()}>
        <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: `1px solid ${eraColors.border}20`, backgroundColor: `${eraColors.border}08` }}>
          <div>
            <div className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: eraColors.border }}>Execution Preview</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{variant.workName} #{variant.issueNumber} · CGC 9.8</div>
          </div>
          <span className="text-[11px] px-3 py-1 rounded uppercase tracking-widest" style={{ backgroundColor: `${actionColor}18`, color: actionColor, border: `1px solid ${actionColor}40` }}>{actionLabel}</span>
        </div>

        <div className="p-5 space-y-4">
          {cx.structuralRiskFlag && (
            <div className="rounded px-3 py-2.5 flex items-start gap-2.5" style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)' }}>
              <div className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#ef4444', boxShadow: '0 0 6px #ef4444', animation: 'pulse 0.8s ease-in-out infinite' }} />
              <div>
                <div className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: '#ef4444' }}>Structural Risk Active</div>
                <div className="text-[10px]" style={{ color: 'rgba(239,68,68,0.75)' }}>PANIC regime. Spread multiplier ×1.6, slippage ×1.8. Fill probability severely degraded.</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Current FMV', val: `$${fmv.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: '#fff' },
              { label: 'Fill Low', val: `$${fillLow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: action === 'buy' ? '#4ade80' : '#f87171' },
              { label: 'Fill High', val: `$${fillHigh.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: action === 'buy' ? '#fbbf24' : '#4ade80' },
            ].map(({ label, val, color }) => (
              <div key={label} className="rounded p-2.5 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="text-[8px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</div>
                <div className="text-sm font-semibold" style={{ color, fontFamily: 'monospace' }}>{val}</div>
              </div>
            ))}
          </div>

          <div className="space-y-2.5">
            {[
              { label: 'Fill Probability', val: `${fillProb}%`, delta: regimeDeltaFill, deltaLabel: regimeDeltaFill !== 0 ? `${regimeDeltaFill > 0 ? '+' : ''}${regimeDeltaFill}% regime` : null, color: fillProb >= 75 ? '#4ade80' : fillProb >= 50 ? '#fbbf24' : '#f87171', barW: fillProb },
              { label: 'Slippage Estimate', val: `${slipBps[0]}–${slipBps[1]} bps`, delta: regimeDeltaSlip, deltaLabel: regimeDeltaSlip !== 0 ? `${regimeDeltaSlip > 0 ? '+' : ''}${regimeDeltaSlip} bps regime` : null, color: slipBps[1] <= 20 ? '#4ade80' : slipBps[1] <= 80 ? '#fbbf24' : '#f87171', barW: Math.min(100, (slipBps[1] / 270) * 100) },
            ].map(({ label, val, color, barW, deltaLabel, delta }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.62)' }}>{label}</span>
                  <div className="flex items-center gap-2">
                    {deltaLabel && <span className="text-[8px]" style={{ color: delta! > 0 ? (label === 'Fill Probability' ? '#4ade80' : '#f87171') : (label === 'Fill Probability' ? '#f87171' : '#4ade80'), fontFamily: 'monospace' }}>{deltaLabel}</span>}
                    <span className="text-[11px] font-semibold" style={{ color, fontFamily: 'monospace' }}>{val}</span>
                  </div>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${barW}%`, backgroundColor: color }} />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded p-3 space-y-1.5" style={{ backgroundColor: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>Classification</span>
              <span className="text-[10px] font-semibold" style={{ color: anchor.color, fontFamily: 'monospace' }}>{anchor.label}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>Liquidity Tier</span>
              <span className="text-[10px] font-semibold" style={{ color: liqColor, fontFamily: 'monospace' }}>{intel.liquidityTier} · {intel.liquidityScore}/100</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>Volatility Regime</span>
              <span className="text-[10px]" style={{ color: cx.regime === 'PANIC' ? '#ef4444' : cx.regime === 'ELEVATED' ? '#f59e0b' : cx.regime === 'CALM' ? '#4ade80' : 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>{cx.regime ?? '—'}</span>
            </div>
            {cx.fillDays != null && (
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>Expected Fill</span>
                <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>~{cx.fillDays} day cadence</span>
              </div>
            )}
          </div>

          <p className="text-[8px] text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Simulated execution preview · No trade is executed · Parameters computed server-side via regime policy {cx.policyVersion ?? 'v1'}
          </p>

          <button
            onClick={() => { onConfirm?.(); onClose(); }}
            className="w-full py-2 rounded text-xs uppercase tracking-widest transition-all"
            style={{ backgroundColor: `${actionColor}15`, color: actionColor, border: `1px solid ${actionColor}35` }}
          >
            Acknowledge {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
