'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowLeft, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface SectionChip {
  id: string;
  label: string;
}

interface Props {
  items: BreadcrumbItem[];
  sectionChips?: SectionChip[];
  activeSectionId?: string;
  onSectionClick?: (id: string) => void;
  accentColor?: string;
}

export function BreadcrumbsNav({
  items,
  sectionChips = [],
  activeSectionId,
  onSectionClick,
  accentColor = '#3b82f6',
}: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginBottom: '16px',
      }}
    >
      {/* ── Top row: Back button + Breadcrumb hierarchy ──────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded transition-colors"
          style={{
            color: 'rgba(255,255,255,0.75)',
            backgroundColor: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            fontFamily: 'Hind, sans-serif',
            fontWeight: 500,
            lineHeight: 1,
          }}
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Return to Exchange Floor</span>
        </Link>

        <div style={{ height: '14px', width: '1px', backgroundColor: 'rgba(255,255,255,0.12)', marginInline: '2px' }} />

        {/* Home icon link */}
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: 'rgba(255,255,255,0.45)',
            transition: 'color 0.15s',
          }}
        >
          <Home className="w-3.5 h-3.5" />
        </Link>

        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <React.Fragment key={i}>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  style={{
                    fontSize: '12px',
                    fontFamily: 'Hind, sans-serif',
                    color: 'rgba(255,255,255,0.65)',
                    transition: 'color 0.15s',
                  }}
                  className="hover:text-white"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  style={{
                    fontSize: '12px',
                    fontFamily: 'Hind, sans-serif',
                    fontWeight: 500,
                    color: isLast ? '#fff' : 'rgba(255,255,255,0.65)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '300px',
                  }}
                >
                  {item.label}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Bottom row: Quick section jump chips ──────────────────────────── */}
      {sectionChips.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '2px',
          }}
        >
          <span
            style={{
              fontSize: '9px',
              fontFamily: 'monospace',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.35)',
              marginRight: '4px',
              flexShrink: 0,
            }}
          >
            SECTIONS:
          </span>
          {sectionChips.map((chip) => {
            const isActive = activeSectionId === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => onSectionClick?.(chip.id)}
                style={{
                  fontSize: '10px',
                  fontFamily: 'Hind, sans-serif',
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  padding: '2px 8px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  border: isActive
                    ? `1px solid ${accentColor}`
                    : '1px solid rgba(255,255,255,0.10)',
                  backgroundColor: isActive
                    ? `${accentColor}25`
                    : 'rgba(255,255,255,0.03)',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default BreadcrumbsNav;
