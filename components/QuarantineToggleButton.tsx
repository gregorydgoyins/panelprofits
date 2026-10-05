'use client';

import React from 'react';
import { useAdminGuard } from '@/hooks/useAdminGuard';

export default function QuarantineToggleButton({ artifactId }: { artifactId: string }) {
  const { isAdmin } = useAdminGuard();
  if (!isAdmin) return null;
  return (
    <button
      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-colors"
      title={`Quarantine artifact ${artifactId}`}
    >
      Quarantine
    </button>
  );
}
