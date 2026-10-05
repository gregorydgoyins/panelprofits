import React from 'react';
import { Layers, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import Panel from './Panel';
import { getEraColors } from '@/lib/design-system/colors';
import { buildEquityUrl } from '@/lib/urlBuilder';

export interface RelatedPrinting {
  id: number;
  variantId: string;
  workName: string;
  issueNumber: string;
  variantKey: string | null;
  sovereign_price_usd: number | null;
  anchor_price_usd: number | null;
  delta24h?: number | null;
  coverImageUrl?: string | null;
}

export interface RelatedEquitiesCardProps {
  otherPrintings: RelatedPrinting[];
  currentVariantId: string;
  eraColors: { border: string; bg: string; bgHover: string; glow: string };
}

function formatPrice(val: number | null | undefined): string {
  if (val == null || isNaN(val)) return '—';
  return '$' + Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatIssueNumber(issueNumber: string | null | undefined): string {
  if (!issueNumber) return '';
  const trimmed = issueNumber.trim();
  if (!trimmed) return '';
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
}

function formatVariantKey(variantKey: string | null | undefined): string {
  if (!variantKey) return '';
  return variantKey
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export default function RelatedEquitiesCard({
  otherPrintings,
  currentVariantId,
  eraColors,
}: RelatedEquitiesCardProps) {
  if (!otherPrintings || otherPrintings.length === 0) {
    return null;
  }

  const filtered = otherPrintings.filter(p => p && p.variantId !== currentVariantId);
  if (filtered.length === 0) {
    return null;
  }

  const colors = eraColors || getEraColors('modern');
  const displayed = filtered.slice(0, 5);

  return (
    <Panel
      title="Other Printings"
      icon={<Layers className="w-3.5 h-3.5" />}
      eraColors={colors as ReturnType<typeof getEraColors>}
    >
      <div className="flex flex-col gap-1.5">
        {displayed.map(p => {
          const price = p.sovereign_price_usd ?? p.anchor_price_usd ?? null;
          const hasPrice = price != null && price > 0;
          const issueNum = formatIssueNumber(p.issueNumber);
          const variantLabel = formatVariantKey(p.variantKey);
          const label = [issueNum, variantLabel].filter(Boolean).join(' ') || p.workName || 'Issue';

          return (
            <Link
              key={p.variantId || p.id}
              href={buildEquityUrl(p.variantId)}
              className="group flex items-center justify-between px-3 py-2 rounded transition-colors duration-150 hover:bg-white/[0.04] no-underline"
              style={{
                borderLeft: hasPrice ? `2px solid ${colors.border}` : '2px solid transparent',
                backgroundColor: 'rgba(255, 255, 255, 0.015)',
                borderTop: '1px solid rgba(255, 255, 255, 0.03)',
                borderRight: '1px solid rgba(255, 255, 255, 0.03)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
              }}
            >
              <div className="flex-1 min-w-0 pr-2">
                <span
                  className="text-xs font-medium truncate block transition-colors group-hover:text-white"
                  style={{
                    fontFamily: 'Hind, sans-serif',
                    color: 'rgba(255, 255, 255, 0.85)',
                  }}
                  title={label}
                >
                  {label}
                </span>
              </div>

              <div className="flex flex-col items-end flex-shrink-0 text-right">
                <span
                  className="text-xs font-medium"
                  style={{
                    fontFamily: 'monospace',
                    color: hasPrice ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.35)',
                  }}
                >
                  {formatPrice(price)}
                </span>
                {p.delta24h != null && !isNaN(p.delta24h) && (
                  <span
                    className="text-[10px] tabular-nums leading-none mt-0.5"
                    style={{
                      fontFamily: 'monospace',
                      color: p.delta24h > 0 ? '#4ade80' : p.delta24h < 0 ? '#f87171' : 'rgba(255, 255, 255, 0.4)',
                    }}
                  >
                    {p.delta24h > 0 ? '+' : ''}{p.delta24h.toFixed(1)}%
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length > 5 && (
        <div className="pt-2 mt-2 text-center" style={{ borderTop: `1px solid ${colors.border}15` }}>
          <Link
            href={`${buildEquityUrl(currentVariantId)}#printings`}
            className="text-[11px] inline-flex items-center justify-center gap-1 font-medium transition-colors hover:underline cursor-pointer no-underline"
            style={{ color: colors.border, fontFamily: 'Hind, sans-serif' }}
          >
            <span>View all {filtered.length} printings →</span>
            <ArrowUpRight className="w-3 h-3 opacity-70" />
          </Link>
        </div>
      )}
    </Panel>
  );
}
