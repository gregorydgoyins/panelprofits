'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import ExecutionPreviewModal from './ExecutionPreviewModal';
import type { DetailResponse } from './types';
import type { ExecutionQuote } from '@/lib/comics/detail-model';
import { getEraColors } from '@/lib/design-system/colors';

interface ExecutionModalWrapperProps {
  variant: DetailResponse['variant'];
  /** Stored PriceCharting quote for the grade being traded; null when none is on file. */
  quote: ExecutionQuote | null;
  eraColors: ReturnType<typeof getEraColors>;
}

/** Opens the quote modal from the ?exec=buy|sell query parameter. Shows only the stored quote it is given. */
export function ExecutionModalWrapper({ variant, quote, eraColors }: ExecutionModalWrapperProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const execParam = searchParams.get('exec');
  const [activeAction, setActiveAction] = useState<'buy' | 'sell' | null>(null);

  useEffect(() => {
    setActiveAction(execParam === 'buy' || execParam === 'sell' ? execParam : null);
  }, [execParam]);

  if (!activeAction) return null;

  const handleClose = () => {
    setActiveAction(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('exec');
    const newQuery = params.toString();
    router.replace(newQuery ? `${pathname}?${newQuery}` : pathname, { scroll: false });
  };

  return (
    <ExecutionPreviewModal
      variant={variant}
      quote={quote}
      action={activeAction}
      onClose={handleClose}
      onConfirm={handleClose}
      eraColors={eraColors}
    />
  );
}
