'use client';

import React, { useState } from 'react';
import DetailSidebar from './DetailSidebar';
import PriceChartPanel from './PriceChartPanel';
import ExecutionPreviewModal from './ExecutionPreviewModal';
import type { DetailResponse, GradePrice, HistoryEntry } from './types';
import type { ChartSale } from './TradingChartPanel';
import type { ExecutionQuote } from '@/lib/comics/detail-model';
import type { getEraColors } from '@/lib/design-system/colors';
import { buildEquityUrl } from '@/lib/urlBuilder';

interface TopChartSectionProps {
  variantId: string;
  variant: DetailResponse['variant'];
  keyPrices: DetailResponse['keyPrices'];
  gradeLattice: GradePrice[];
  priceHistory: HistoryEntry[];
  censusSummary: DetailResponse['censusSummary'];
  eraColors: ReturnType<typeof getEraColors>;
  quote: ExecutionQuote | null;
  creatorNames?: string[];
  sales?: ChartSale[];
}

export function TopChartSection({
  variantId,
  variant,
  keyPrices,
  gradeLattice,
  priceHistory,
  censusSummary,
  eraColors,
  quote,
  creatorNames = [],
  sales = [],
}: TopChartSectionProps) {
  const [execModal, setExecModal] = useState<{ open: boolean; action: 'buy' | 'sell' }>({
    open: false,
    action: 'buy',
  });
  const [tradeConfirmation, setTradeConfirmation] = useState<{ action: 'buy' | 'sell'; id: number } | null>(null);

  return (
    <div id="section-chart" className="mb-6">
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-4 items-start">
        <DetailSidebar
          variantId={variantId}
          workName={variant.workName}
          era={variant.era ?? undefined}
          publisher={variant.publisher}
          creatorNames={creatorNames}
          eraColors={eraColors}
          keyPrices={keyPrices as any}
          gradeLattice={gradeLattice}
          priceHistory={priceHistory}
          censusSummary={censusSummary as any}
          detailUrl={variantId ? buildEquityUrl(variantId) : undefined}
          onOpenExecModal={(action) => setExecModal({ open: true, action })}
          hasQuote
          tradeConfirmation={tradeConfirmation}
        />
        <PriceChartPanel
          history={priceHistory}
          eraColors={eraColors}
          gradeLattice={gradeLattice}
          sales={sales}
        />
      </div>

      {execModal.open && (
        <ExecutionPreviewModal
          variant={variant}
          quote={quote}
          onClose={() => setExecModal({ open: false, action: 'buy' })}
          onConfirm={() => {
            setTradeConfirmation({ action: execModal.action, id: Date.now() });
            setExecModal({ open: false, action: 'buy' });
          }}
          eraColors={eraColors}
          action={execModal.action}
        />
      )}
    </div>
  );
}

export default TopChartSection;
