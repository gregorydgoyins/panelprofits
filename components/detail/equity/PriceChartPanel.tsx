import React from 'react';
import type { GradePrice, HistoryEntry, BollingerPoint } from './types';
import type { getEraColors } from '@/lib/design-system/colors';
import TradingChartPanel from './TradingChartPanel';

export default function PriceChartPanel({
  history = [],
  workName = '',
  eraColors,
  gradeLattice = [],
  aiInsight,
  bollingerData = [],
  showBollinger,
  onBollingerToggle,
  assetId = '',
}: {
  history?: HistoryEntry[];
  workName?: string;
  eraColors?: ReturnType<typeof getEraColors>;
  gradeLattice?: GradePrice[];
  aiInsight?: string | null;
  bollingerData?: BollingerPoint[];
  showBollinger?: boolean;
  onBollingerToggle?: (val: boolean) => void;
  assetId?: string;
}) {
  if (!eraColors) return null;

  return (
    <TradingChartPanel
      history={history}
      workName={workName}
      eraColors={eraColors}
      gradeLattice={gradeLattice}
      aiInsight={aiInsight}
      bollingerData={bollingerData}
      showBollinger={showBollinger}
      onBollingerToggle={onBollingerToggle}
      assetId={assetId}
    />
  );
}
