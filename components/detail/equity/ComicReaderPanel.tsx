'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Maximize2 } from 'lucide-react';
import { getEraColors } from '@/lib/design-system/colors';
import Panel from './Panel';

interface ComicReaderData {
  archiveIdentifier: string | null;
  embedUrl: string | null;
  detailsUrl: string | null;
  archiveTitle: string | null;
  archiveYear: string | null;
  seriesName: string;
  issueNumber: string;
  year: number;
  publisher: string;
}

// ── Static CSS for iframe fade-in — off the JS transition path ────────────────
const READER_STYLE_ID = 'comic-reader-iframe-kf';
if (typeof document !== 'undefined' && !document.getElementById(READER_STYLE_ID)) {
  const s = document.createElement('style');
  s.id = READER_STYLE_ID;
  s.textContent = `
    @keyframes reader-fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    .comic-reader-iframe {
      animation: reader-fade-in 400ms ease forwards;
    }
  `;
  document.head.appendChild(s);
}

export default function ComicReaderPanel({
  variantId,
  eraColors,
}: {
  variantId: string;
  eraColors: ReturnType<typeof getEraColors>;
}) {
  const [expanded, setExpanded] = useState(false);

  const { data, isLoading } = useQuery<ComicReaderData>({
    queryKey: ['comic-reader', variantId],
    queryFn: async () => {
      const res = await fetch(`/api/comic-reader/${variantId}`);
      if (!res.ok) throw new Error('reader fetch failed');
      return res.json();
    },
    staleTime: 60 * 60 * 1000, // 1 hour — matches server cache TTL
    retry: 1,
  });

  // Don't render at all while loading or when no archive match found
  if (isLoading) return null;
  if (!data?.archiveIdentifier || !data.embedUrl) return null;

  const iframeHeight = expanded ? 680 : 420;

  return (
    <Panel
      title="Read This Issue"
      icon={<BookOpen className="w-3.5 h-3.5" />}
      eraColors={eraColors}
      action={
        data.detailsUrl ? (
          <a
            href={data.detailsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1"
            style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.4)',
              fontFamily: 'monospace',
              textDecoration: 'none',
            }}
            onClick={e => e.stopPropagation()}
            title="Open on Internet Archive"
          >
            <Maximize2 className="w-3 h-3" />
            archive.org
          </a>
        ) : undefined
      }
    >
      <div>
        {/* Archive match label */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p
              className="text-[10px] uppercase tracking-widest"
              style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}
            >
              Internet Archive · Free digital copy
            </p>
            {data.archiveTitle && (
              <p
                className="text-[11px] mt-0.5"
                style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Hind, sans-serif' }}
              >
                {data.archiveTitle}
                {data.archiveYear ? ` (${data.archiveYear})` : ''}
              </p>
            )}
          </div>
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-[9px] uppercase tracking-wider px-2 py-1 rounded"
            style={{
              color: eraColors.border,
              border: `1px solid ${eraColors.border}30`,
              backgroundColor: `${eraColors.border}08`,
              fontFamily: 'monospace',
              cursor: 'pointer',
              transition: 'background-color 150ms ease, border-color 150ms ease',
            }}
          >
            {expanded ? 'Collapse' : 'Expand'}
          </button>
        </div>

        {/* Embedded BookReader */}
        <div
          className="rounded overflow-hidden"
          style={{
            border: `1px solid ${eraColors.border}20`,
            backgroundColor: '#0a0a0a',
          }}
        >
          <iframe
            key={`${variantId}-${expanded ? 'xl' : 'sm'}`}
            className="comic-reader-iframe"
            src={data.embedUrl}
            width="100%"
            height={iframeHeight}
            style={{ display: 'block', border: 'none' }}
            allowFullScreen
            loading="lazy"
            title={`Read ${data.seriesName} #${data.issueNumber}`}
          />
        </div>

        {/* Footer attribution */}
        <p
          className="text-[9px] mt-2"
          style={{ color: 'rgba(255,255,255,0.18)', fontFamily: 'Hind, sans-serif' }}
        >
          Hosted by the Internet Archive. Public domain / open access content only.
          Panel Profits does not host or store any comic files.
        </p>
      </div>
    </Panel>
  );
}
