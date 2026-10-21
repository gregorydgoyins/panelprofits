'use client';
/**
 * GradeSpreadComparePanel
 *
 * Wraps GradeSpreadPanel with an inline compare flow.
 * A "Compare" button in the panel header toggles a SearchPinSelector row
 * that lets the user pick a second issue. Grade data for the compare issue
 * is fetched from the same equity-detail endpoint and passed down to
 * GradeSpreadPanel's existing comparison rendering.
 */
import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GitCompare, X } from 'lucide-react';
import GradeSpreadPanel from './GradeSpreadPanel';
import SearchPinSelector from '@/components/shared/SearchPinSelector';
import { getEraColors } from '@/lib/design-system/colors';
import type { GradePrice, HistoryEntry, DetailResponse } from './types';

const COMPARE_ACCENT = '#f59e0b';

function buildExtended(data: DetailResponse | undefined): GradePrice[] {
  if (!data) return [];
  const lattice: GradePrice[] = data.gradeLattice ?? [];
  const history: HistoryEntry[] = data.priceHistory ?? [];
  const existing = new Set(lattice.map(g => g.grade));
  const latest: Record<string, GradePrice> = {};
  for (const h of history) {
    const g = h.grade;
    if (!existing.has(g) && h.priceUsd > 0) {
      if (!latest[g] || h.observedAt > (latest[g].observedAt ?? '')) {
        latest[g] = { grade: g, priceUsd: h.priceUsd, observedAt: h.observedAt, salesVolume: 0 };
      }
    }
  }
  return [...lattice, ...Object.values(latest)];
}

interface Props {
  grades: GradePrice[];
  eraColors: ReturnType<typeof getEraColors>;
  priceHistory?: HistoryEntry[];
  censusNarrative?: string | null;
  survivorBias?: string | null;
  identityConfidence?: number | null;
  primaryName?: string;
}

export default function GradeSpreadComparePanel({
  grades,
  eraColors,
  priceHistory = [],
  censusNarrative,
  survivorBias,
  identityConfidence,
  primaryName,
}: Props) {
  const [compareOpen, setCompareOpen]   = useState(false);
  const [compareId, setCompareId]       = useState<string | null>(null);
  const [compareName, setCompareName]   = useState<string | null>(null);

  const { data: compareData, isFetching: compareLoading } = useQuery<DetailResponse>({
    queryKey: ['grade-spread-compare', compareId],
    queryFn: async () => {
      const r = await fetch(`/api/hammer/equity-detail/${compareId}`);
      if (!r.ok) throw new Error('Failed to load compare equity');
      return r.json();
    },
    enabled: !!compareId,
    staleTime: 120_000,
  });

  const compareGrades = buildExtended(compareData);
  const isComparing   = compareOpen && compareGrades.length > 0;

  const onCompareSelect = useCallback((id: string, name: string) => {
    setCompareId(id);
    setCompareName(name);
  }, []);

  const onCompareClear = useCallback(() => {
    setCompareId(null);
    setCompareName(null);
  }, []);

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (compareOpen) {
      setCompareOpen(false);
      setCompareId(null);
      setCompareName(null);
    } else {
      setCompareOpen(true);
    }
  }, [compareOpen]);

  const compareButton = (
    <button
      onClick={handleToggle}
      title={compareOpen ? 'Close comparison' : 'Compare with another equity'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        fontSize: '9px', fontFamily: 'Hind, sans-serif', fontWeight: 500,
        textTransform: 'uppercase', letterSpacing: '0.07em',
        padding: '3px 8px', borderRadius: '3px', cursor: 'pointer',
        backgroundColor: compareOpen ? 'rgba(245,158,11,0.14)' : 'transparent',
        border: `1px solid ${compareOpen ? 'rgba(245,158,11,0.45)' : 'rgba(255,255,255,0.12)'}`,
        color: compareOpen ? COMPARE_ACCENT : 'rgba(255,255,255,0.35)',
        transition: 'background-color 140ms, border-color 140ms, color 140ms',
      }}
    >
      {compareOpen
        ? <X style={{ width: '9px', height: '9px' }} />
        : <GitCompare style={{ width: '9px', height: '9px' }} />}
      {compareOpen ? 'Close' : 'Compare'}
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Compare selector row — appears below the panel header when open */}
      {compareOpen && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '8px 14px',
          backgroundColor: 'rgba(245,158,11,0.04)',
          border: `1px solid ${eraColors.border}20`,
          borderBottom: 'none',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
        }}>
          <GitCompare style={{ width: '11px', height: '11px', color: COMPARE_ACCENT, flexShrink: 0 }} />
          <span style={{
            fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.09em',
            color: COMPARE_ACCENT, fontFamily: 'Hind, sans-serif', fontWeight: 500, flexShrink: 0,
          }}>
            Compare
          </span>
          {compareName && (
            <span style={{
              fontSize: '10px', color: 'rgba(255,255,255,0.35)',
              fontFamily: 'Hind, sans-serif',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              flex: 1,
            }}>
              — {compareName}
            </span>
          )}
          {!compareName && <span style={{ flex: 1 }} />}
          {compareLoading && (
            <span style={{ fontSize: '9px', color: 'rgba(245,158,11,0.5)', fontFamily: 'monospace' }}>
              loading…
            </span>
          )}
          <SearchPinSelector
            onSelect={onCompareSelect}
            onClear={onCompareClear}
            placeholder="Select second equity…"
            color={COMPARE_ACCENT}
            maxResults={6}
          />
        </div>
      )}

      <div style={compareOpen ? { borderTopLeftRadius: 0, borderTopRightRadius: 0 } : undefined}>
        <GradeSpreadPanel
          grades={grades}
          eraColors={eraColors}
          priceHistory={priceHistory}
          censusNarrative={censusNarrative}
          survivorBias={survivorBias}
          identityConfidence={identityConfidence}
          primaryName={primaryName}
          compareGrades={isComparing ? compareGrades : undefined}
          compareName={isComparing ? (compareName ?? undefined) : undefined}
          headerAction={compareButton}
        />
      </div>
    </div>
  );
}
