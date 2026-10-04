'use client';
import React from 'react';
import { Building2, Calendar, Globe } from 'lucide-react';
import Panel from './Panel';
import { getEraColors } from '@/lib/design-system/colors';

export interface PublisherProfileCardProps {
  publisher: string;
  era: string | null | undefined;
  eraColors: { border: string; bg: string; bgHover: string; glow: string };
}

const PUBLISHER_INFO: Record<string, { founded: number; hq: string; description: string; notableCharacters: string[] }> = {
  'Marvel': { founded: 1939, hq: 'New York, NY', description: 'Home of Spider-Man, X-Men, Avengers, and the Marvel Cinematic Universe.', notableCharacters: ['Spider-Man', 'X-Men', 'Avengers', 'Fantastic Four'] },
  'DC': { founded: 1934, hq: 'Burbank, CA', description: 'Home of Superman, Batman, Wonder Woman, and the Justice League.', notableCharacters: ['Superman', 'Batman', 'Wonder Woman', 'Flash'] },
  'Image': { founded: 1992, hq: 'Portland, OR', description: 'Creator-owned publisher. Home of Spawn, The Walking Dead, Invincible.', notableCharacters: ['Spawn', 'Invincible', 'Savage Dragon'] },
  'Dark Horse': { founded: 1986, hq: 'Milwaukie, OR', description: 'Known for Hellboy, Sin City, and licensed properties.', notableCharacters: ['Hellboy', 'Sin City', 'The Mask'] },
  'Valiant': { founded: 1989, hq: 'New York, NY', description: 'Boutique superhero universe with tight continuity.', notableCharacters: ['X-O Manowar', 'Harbinger', 'Bloodshot'] },
};

function getPublisherInfo(publisher: string | null | undefined) {
  if (!publisher || typeof publisher !== 'string') return null;
  const trimmed = publisher.trim();
  if (PUBLISHER_INFO[trimmed]) {
    return PUBLISHER_INFO[trimmed];
  }
  const lower = trimmed.toLowerCase();
  for (const key of Object.keys(PUBLISHER_INFO)) {
    const keyLower = key.toLowerCase();
    if (lower === keyLower || lower.startsWith(keyLower) || lower.includes(keyLower)) {
      return PUBLISHER_INFO[key];
    }
  }
  return null;
}

export default function PublisherProfileCard({
  publisher,
  era,
  eraColors,
}: PublisherProfileCardProps) {
  const colors = eraColors ?? getEraColors(era);
  const info = getPublisherInfo(publisher);
  const displayName = (publisher && publisher.trim()) || 'Unknown Publisher';

  return (
    <Panel
      title="Publisher"
      icon={<Building2 className="w-3.5 h-3.5" />}
      eraColors={colors as ReturnType<typeof getEraColors>}
    >
      {info ? (
        <div className="space-y-3">
          <div>
            <div
              className="text-sm font-bold tracking-wide"
              style={{ color: colors.border, fontFamily: 'Hind, sans-serif' }}
            >
              {displayName}
            </div>
            <div
              className="flex items-center gap-4 mt-1.5 text-xs"
              style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Hind, sans-serif' }}
            >
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: `${colors.border}cc` }} />
                <span style={{ fontFamily: 'monospace' }}>{info.founded}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 shrink-0" style={{ color: `${colors.border}cc` }} />
                <span>{info.hq}</span>
              </div>
            </div>
          </div>

          <p
            className="text-xs leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Hind, sans-serif' }}
          >
            {info.description}
          </p>

          {info.notableCharacters && info.notableCharacters.length > 0 && (
            <div
              className="space-y-1.5 pt-2"
              style={{ borderTop: `1px solid ${colors.border}15` }}
            >
              <div
                className="text-[9px] uppercase tracking-wider font-semibold"
                style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}
              >
                KEY CHARACTERS
              </div>
              <div className="flex flex-wrap gap-1.5">
                {info.notableCharacters.map((character) => (
                  <span
                    key={character}
                    className="text-[10px] px-2 py-0.5 rounded font-medium"
                    style={{
                      backgroundColor: `${colors.border}14`,
                      color: 'rgba(255,255,255,0.85)',
                      border: `1px solid ${colors.border}30`,
                      fontFamily: 'Hind, sans-serif',
                    }}
                  >
                    {character}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          <div
            className="text-sm font-bold tracking-wide"
            style={{ color: colors.border, fontFamily: 'Hind, sans-serif' }}
          >
            {displayName}
          </div>
          <p
            className="text-xs"
            style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Hind, sans-serif' }}
          >
            Publisher profile coming soon
          </p>
        </div>
      )}
    </Panel>
  );
}
