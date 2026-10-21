'use client';
import { useState } from 'react';

interface StructuralBreakBannerProps {
  structuralBreak: string;
  dismissed?: boolean;
  onDismiss?: () => void;
}

export default function StructuralBreakBanner({ structuralBreak, dismissed: initialDismissed = false, onDismiss }: StructuralBreakBannerProps) {
  const [dismissed, setDismissed] = useState(initialDismissed);
  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div
      className="mb-3 px-4 py-2.5 rounded flex items-start justify-between gap-4 cursor-pointer"
      style={{ backgroundColor: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.22)' }}
      onClick={handleDismiss}
    >
      <p className="text-[10px] uppercase tracking-widest leading-relaxed" style={{ color: 'rgba(251,191,36,0.75)', fontFamily: 'monospace', letterSpacing: '0.11em' }}>
        INTEGRITY NOTICE — Price series shows a structural break on {structuralBreak}. Historical data may reflect a prior instrument identity. Treat pre-break readings as unverified.
      </p>
      <span className="text-[9px] mt-0.5 shrink-0" style={{ color: 'rgba(251,191,36,0.4)', fontFamily: 'monospace' }}>DISMISS</span>
    </div>
  );
}
