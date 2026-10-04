'use client';
import { useState, type ReactNode } from 'react';
import { getEraColors } from '@/lib/design-system/colors';

export default function Panel({ title, icon, children, eraColors, action }: {
  title: string; icon?: ReactNode; children: ReactNode;
  eraColors: ReturnType<typeof getEraColors>; action?: ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${eraColors.border}20`, backgroundColor: 'rgba(255,255,255,0.018)' }}>
      <div
        className="px-4 py-2 flex items-center gap-2 cursor-pointer select-none"
        style={{ backgroundColor: open ? `${eraColors.border}09` : `${eraColors.border}05`, borderBottom: open ? `1px solid ${eraColors.border}18` : 'none', transition: 'background-color 150ms ease' }}
        onClick={() => setOpen(o => !o)}
      >
        {icon && <span style={{ color: `${eraColors.border}d9` }}>{icon}</span>}
        <span className="text-xs uppercase tracking-wider font-semibold flex-1" style={{ color: eraColors.border, letterSpacing: '0.14em' }}>{title}</span>
        {action}
        <span className="text-[8px] px-1 rounded ml-1" style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.76)', fontFamily: 'monospace' }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}
