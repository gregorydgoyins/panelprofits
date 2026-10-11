'use client';
import React, { useMemo } from 'react';
import Panel from './Panel';
import { Gavel } from 'lucide-react';
import { getEraColors } from '@/lib/design-system/colors';

export interface AuctionHistoryCardProps {
  recentSales?: Array<{ grade: string; priceUsd: number; date: string; platform?: string }> | null;
  eraColors: { border: string; bg: string; bgHover: string; glow: string };
}

const usd = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric', timeZone: 'UTC' });
}

/**
 * Completed sales recorded for this book, newest first, each with its own grade, date, venue and price.
 * Restored and signed copies are already excluded upstream. Sales of different grades are never averaged together.
 * With no recorded sale the card does not render.
 */
export default function AuctionHistoryCard({ recentSales, eraColors }: AuctionHistoryCardProps) {
  const colors = eraColors ?? getEraColors(undefined);

  const sales = useMemo(
    () =>
      (recentSales ?? [])
        .filter((s) => s && s.priceUsd > 0 && s.date && s.grade)
        .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
    [recentSales],
  );
  if (sales.length === 0) return null;

  const top = sales.reduce((hi, s) => (s.priceUsd > hi.priceUsd ? s : hi), sales[0]);
  const list = sales.slice(0, 8);

  return (
    <Panel title="Recorded sales" icon={<Gavel className="w-3.5 h-3.5" />} eraColors={colors as ReturnType<typeof getEraColors>}>
      <div className="space-y-3" style={{ fontFamily: 'Hind, sans-serif' }}>
        <div>
          <div className="text-[9px] uppercase font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', letterSpacing: '0.12em' }}>
            Highest of the {sales.length} shown
          </div>
          <div className="text-2xl font-bold tracking-tight" style={{ color: colors.border, fontFamily: 'monospace' }}>{usd(top.priceUsd)}</div>
          <div className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
            {top.grade} · {fmtDate(top.date)}
          </div>
        </div>

        <div className="h-px w-full" style={{ backgroundColor: `${colors.border}20` }} />

        <div className="flex flex-col">
          {list.map((sale, idx) => (
            <div
              key={`${sale.grade}-${sale.date}-${sale.priceUsd}-${idx}`}
              className="flex items-center justify-between py-2"
              style={{ borderBottom: idx < list.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="rounded px-1.5 py-0.5 shrink-0 font-medium" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.85)', fontFamily: 'monospace', fontSize: 10 }}>
                  {sale.grade}
                </span>
                <div className="flex flex-col min-w-0">
                  <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>{fmtDate(sale.date)}</span>
                  {sale.platform && (
                    <span style={{ fontFamily: 'monospace', fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{sale.platform}</span>
                  )}
                </div>
              </div>
              <span className="text-right shrink-0 font-medium" style={{ fontFamily: 'monospace', fontSize: 12, color: '#ffffff' }}>{usd(sale.priceUsd)}</span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
