'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import ExecutionPreviewModal from './ExecutionPreviewModal';
import { getEraColors } from '@/lib/design-system/colors';

interface ExecutionModalWrapperProps {
  variant: {
    workName: string;
    issueNumber: string;
    era: string;
    publisher: string;
  };
  keyPrices: {
    display_fmv_usd?: number;
    sovPriceUsd?: number;
    fmv98Usd?: number;
  };
  eraColors: ReturnType<typeof getEraColors>;
}

export function ExecutionModalWrapper({ variant, keyPrices, eraColors }: ExecutionModalWrapperProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const execParam = searchParams.get('exec');
  const [activeAction, setActiveAction] = useState<'buy' | 'sell' | null>(null);

  useEffect(() => {
    if (execParam === 'buy' || execParam === 'sell') {
      setActiveAction(execParam);
    } else {
      setActiveAction(null);
    }
  }, [execParam]);

  if (!activeAction) return null;

  const handleClose = () => {
    setActiveAction(null);
    // Remove query param cleanly
    const params = new URLSearchParams(searchParams.toString());
    params.delete('exec');
    const newQuery = params.toString();
    router.replace(newQuery ? `${pathname}?${newQuery}` : pathname, { scroll: false });
  };

  const fmv = keyPrices.display_fmv_usd ?? keyPrices.sovPriceUsd ?? keyPrices.fmv98Usd ?? 100;

  const mockIntel = {
    anchorClass: 'SOVEREIGN',
    liquidityTier: 'Active',
    computedExecution: {
      fillProbability: 0.94,
      baseFillProbability: 0.92,
      slippageBps: [25, 40] as [number, number],
      baseSlippageBps: [20, 35] as [number, number],
      structuralRiskFlag: false,
    },
  };

  return (
    <ExecutionPreviewModal
      variant={variant as any}
      keyPrices={keyPrices as any}
      intel={mockIntel as any}
      action={activeAction}
      onClose={handleClose}
      onConfirm={handleClose}
      eraColors={eraColors}
    />
  );
}
