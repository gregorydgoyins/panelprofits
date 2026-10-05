'use client';

import React, { useState } from 'react';
import { Pin, PinOff } from 'lucide-react';
import HeroPanel from './HeroPanel';
import ExecutionPreviewModal from './ExecutionPreviewModal';
import { BreadcrumbsNav } from '@/components/navigation/BreadcrumbsNav';
import QuarantineToggleButton from '@/components/QuarantineToggleButton';
import CoverVerifyButton from '@/components/CoverVerifyButton';
import { usePinnedEquity } from '@/hooks/usePinnedEquity';
import type {
  DetailResponse,
  CompletenessData,
  InstrumentIntelligence,
  EquityTruthLayer,
  SpreadStateData,
  Creator,
  GradePrice,
} from './types';
import type { getEraColors, getScarcityColors } from '@/lib/design-system/colors';

interface HeroSectionProps {
  variantId: string;
  variant: DetailResponse['variant'];
  completeness: CompletenessData | undefined;
  keyPrices: DetailResponse['keyPrices'];
  instrumentStates: DetailResponse['instrumentStates'];
  instrumentIntelligence: InstrumentIntelligence;
  censusSummary: DetailResponse['censusSummary'];
  gradeLattice?: GradePrice[];
  wikiSummary: string | null;
  latestSaleImageUrl: string | null;
  eraColors: ReturnType<typeof getEraColors>;
  scarcityColors: ReturnType<typeof getScarcityColors>;
  heroCreatorsData?: { data: Creator[] };
  truthLayerData?: { found: boolean; data: EquityTruthLayer | null };
  spreadData?: { found: boolean; data: SpreadStateData | null };
}

export function HeroSection({
  variantId,
  variant,
  completeness,
  keyPrices,
  instrumentStates,
  instrumentIntelligence,
  censusSummary,
  gradeLattice = [],
  wikiSummary,
  latestSaleImageUrl,
  eraColors,
  scarcityColors,
  heroCreatorsData,
  truthLayerData,
  spreadData,
}: HeroSectionProps) {
  const { pinnedId, setPinnedId, clearPinnedId, syncError } = usePinnedEquity();
  const isPinned = pinnedId === variantId;
  const [execModal, setExecModal] = useState<{ open: boolean; action: 'buy' | 'sell' }>({
    open: false,
    action: 'buy',
  });

  return (
    <>
      <BreadcrumbsNav
        items={[
          { label: 'Exchange Floor', href: '/' },
          { label: 'Comic Equities', href: '/comics' },
          { label: variant.publisher || 'Publisher' },
          { label: `${variant.workName} #${variant.issueNumber}` },
        ]}
        sectionChips={[
          { id: 'hero', label: 'Art & 5-Second View' },
          { id: 'perspectives', label: '4-Level Perspectives' },
          { id: 'chart', label: 'Price Chart' },
          { id: 'math', label: 'Valuation Math' },
          { id: 'provenance', label: 'Inspectable Provenance' },
        ]}
        accentColor={eraColors.border}
        onSectionClick={(id) => {
          const el = document.getElementById(`section-${id}`);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => (isPinned ? clearPinnedId() : setPinnedId(variantId))}
          title={isPinned ? 'Unpin from dashboard' : 'Pin to dashboard widgets'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 11,
            padding: '5px 10px',
            borderRadius: 3,
            cursor: 'pointer',
            border: isPinned
              ? '1px solid rgba(250,204,21,0.5)'
              : `1px solid ${eraColors.border}30`,
            background: isPinned ? 'rgba(250,204,21,0.12)' : `${eraColors.border}10`,
            color: isPinned ? '#facc15' : eraColors.border,
            fontFamily: 'Hind, sans-serif',
            fontWeight: 400,
            transition: 'background-color 0.15s, border-color 0.15s, color 0.15s',
          }}
        >
          {isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
          {isPinned ? 'Unpin from Dashboard' : 'Pin to Dashboard'}
        </button>
        {syncError && (
          <span
            style={{
              fontSize: 10,
              color: '#f59e0b',
              border: '1px solid rgba(245,158,11,0.35)',
              borderRadius: 3,
              padding: '3px 8px',
              backgroundColor: 'rgba(245,158,11,0.08)',
              fontFamily: 'Hind, sans-serif',
              fontWeight: 400,
            }}
          >
            Sync failed — saved locally
          </span>
        )}
        <QuarantineToggleButton artifactId={variantId} />
        <CoverVerifyButton variantId={variantId} />
      </div>

      <div id="section-hero" className="mb-6">
        <HeroPanel
          variantId={variantId}
          variant={variant}
          completeness={completeness}
          keyPrices={keyPrices}
          instrumentStates={instrumentStates}
          instrumentIntelligence={instrumentIntelligence}
          censusSummary={censusSummary}
          gradeLattice={gradeLattice}
          wikiSummary={wikiSummary}
          latestSaleImageUrl={latestSaleImageUrl}
          eraColors={eraColors}
          scarcityColors={scarcityColors}
          heroCreatorsData={heroCreatorsData}
          truthLayerData={truthLayerData}
          spreadData={spreadData}
          onOpenExecModal={(action) => setExecModal({ open: true, action })}
        />
      </div>

      {execModal.open && (
        <ExecutionPreviewModal
          variant={variant}
          keyPrices={keyPrices}
          intel={instrumentIntelligence}
          onClose={() => setExecModal({ open: false, action: 'buy' })}
          onConfirm={() => setExecModal({ open: false, action: 'buy' })}
          eraColors={eraColors}
          action={execModal.action}
        />
      )}
    </>
  );
}

export default HeroSection;
