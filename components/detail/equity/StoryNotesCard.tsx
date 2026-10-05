'use client';

import React, { useState } from 'react';
import { BookOpen, Sparkles, Feather, Calendar, ShieldCheck, Tag, Info, User, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { getEraColors } from '@/lib/design-system/colors';
import type { GcdStoryDossier } from '@/lib/comics/gcd-story-service';

interface StoryNotesCardProps {
  gcdData?: Record<string, any> | null;
  comicbaseData?: Record<string, any> | null;
  storyDossier?: GcdStoryDossier | null;
  series: string;
  issueNumber: string;
  publicationYear?: number | null;
  publisher?: string | null;
  eraColors: ReturnType<typeof getEraColors>;
  debutCreators?: string[];
}

export default function StoryNotesCard({
  gcdData,
  comicbaseData,
  storyDossier,
  series,
  issueNumber,
  publicationYear,
  publisher,
  eraColors,
  debutCreators = [],
}: StoryNotesCardProps) {
  const [showAllStories, setShowAllStories] = useState(false);
  const gcd = gcdData || {};
  const cb = comicbaseData || {};

  // Story & Arc title — Prioritize authentic GCD story dossier
  const storyTitle =
    storyDossier?.leadStoryTitle ||
    gcd.story_title ||
    gcd['GCD - story.lead_title'] ||
    gcd['GCD - gcd_issue.title'] ||
    '';
  const feature = gcd.feature || gcd['GCD - story.feature'] || series;
  const genre = storyDossier?.leadGenre || gcd.genre || gcd['GCD - story.genre'] || 'Superhero';
  const synopsis =
    storyDossier?.leadSynopsis ||
    gcd.synopsis ||
    gcd['GCD - story.synopsis'] ||
    cb['CB - Notes'] ||
    '';
  const keyBadges: string[] = Array.isArray(gcd.key_badges) ? gcd.key_badges : [];

  // Creative credits
  const writer =
    storyDossier?.leadWriter ||
    gcd.writer ||
    gcd['GCD - story.writer'] ||
    cb['CB - Writer'] ||
    (debutCreators[0] ?? '');
  const penciler =
    storyDossier?.leadPenciler ||
    gcd.penciler ||
    gcd['GCD - story.penciler'] ||
    cb['CB - Artist'] ||
    (debutCreators[1] ?? '');
  const inker =
    storyDossier?.leadInker ||
    gcd.inker ||
    gcd['GCD - story.inker'] ||
    '';
  const coverArtist =
    gcd.cover_artist ||
    gcd['GCD - cover.artist'] ||
    cb['CB - Cover Artist'] ||
    '';
  const letterer =
    storyDossier?.leadLetterer ||
    gcd.letterer ||
    gcd['GCD - story.letterer'] ||
    '';
  const editor =
    storyDossier?.leadEditor ||
    gcd.editor ||
    gcd['GCD - story.editing'] ||
    '';

  // Publication notes
  const onSaleDate = gcd.on_sale_date || gcd['GCD - gcd_issue.on_sale_date'] || '';
  const pubDate =
    gcd.publication_date ||
    gcd['GCD - gcd_issue.publication_date'] ||
    (publicationYear ? String(publicationYear) : '');
  const pageCount = gcd.page_count || gcd['GCD - gcd_issue.page_count'] || '';
  const coverPrice = gcd.cover_price || gcd['GCD - gcd_issue.price'] || cb['CB - Cover Price'] || '';
  const notes = gcd.notes || gcd['GCD - gcd_issue.notes'] || gcd['GCD - gcd_series.notes'] || '';
  const characters =
    storyDossier?.leadCharacters ||
    gcd.characters ||
    gcd['GCD - story.characters'] ||
    '';

  const otherStories = (storyDossier?.allStories || []).filter(
    (s) => s.title !== storyTitle || (s.synopsis && s.synopsis !== synopsis)
  );

  const genresList = genre
    ? genre.split(/;|\//).map((g: string) => g.trim()).filter(Boolean)
    : [];

  return (
    <div
      className="rounded-xl border p-5 mb-6 shadow-xl backdrop-blur-md transition-all"
      style={{
        backgroundColor: 'rgba(11, 15, 25, 0.92)',
        borderColor: `${eraColors.border}40`,
        boxShadow: `0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 15px -3px ${eraColors.glow || 'rgba(0,0,0,0)'}`,
      }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${eraColors.border}20`, border: `1px solid ${eraColors.border}50` }}
          >
            <BookOpen className="h-4 w-4" style={{ color: eraColors.border }} />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-100 flex items-center gap-2">
              Story Notes & Publication Dossier
              <span className="text-[11px] font-normal text-slate-400 font-mono">
                {series} #{issueNumber}
              </span>
            </h2>
            <p className="text-[10px] text-slate-400 tracking-wide font-light">
              Grand Comics Database Archival Narrative Record & Primary Historical Credits
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-emerald-500/40 bg-emerald-950/20 text-emerald-400 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 flex items-center gap-1"
          >
            <ShieldCheck className="h-3 w-3" />
            GCD VERIFIED DOSSIER
          </Badge>
          {pubDate && (
            <Badge
              variant="outline"
              className="border-white/10 text-slate-300 text-[10px] font-mono px-2 py-0.5"
            >
              {pubDate}
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Story Arc & Synopsis (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {storyTitle && (
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                Lead Story Arc Title
              </span>
              <h3 className="text-base font-medium text-amber-300 tracking-wide mt-0.5">
                "{storyTitle}"
              </h3>
            </div>
          )}

          {keyBadges.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {keyBadges.map((badge, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border"
                  style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.12)',
                    borderColor: 'rgba(245, 158, 11, 0.4)',
                    color: '#fbbf24',
                  }}
                >
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          )}

          {/* Synopsis */}
          <div className="rounded-lg bg-black/40 border border-white/5 p-4 space-y-2">
            <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider text-slate-400">
              <span>Historical Story Arc Synopsis</span>
              {genresList.length > 0 && <span>{genresList.join(' · ')}</span>}
            </div>
            <p className="text-slate-200 text-xs sm:text-sm font-light leading-relaxed">
              {synopsis || `${series} #${issueNumber} marks a monumental chapter in ${publisher || 'comic'} lore, anchored by primary story arcs and seminal character debuts.`}
            </p>
          </div>

          {/* Featured Characters / Cast if available */}
          {characters && (
            <div className="text-xs space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Featured Characters & Appearance Roster:
              </span>
              <p className="text-slate-300 text-[11px] leading-normal line-clamp-2 hover:line-clamp-none transition-all cursor-pointer">
                {characters}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Creative Team & Publishing Specs (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Creative Team */}
          <div className="rounded-lg bg-black/40 border border-white/5 p-3.5 space-y-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-cyan-400">
              <Feather className="h-3.5 w-3.5" />
              <span>Creative Production Team</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {writer && (
                <div className="rounded bg-white/[0.02] border border-white/5 p-2">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Writer / Script</span>
                  <p className="text-slate-100 font-medium truncate">{writer}</p>
                </div>
              )}
              {penciler && (
                <div className="rounded bg-white/[0.02] border border-white/5 p-2">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Penciler / Artist</span>
                  <p className="text-slate-100 font-medium truncate">{penciler}</p>
                </div>
              )}
              {coverArtist && (
                <div className="rounded bg-white/[0.02] border border-white/5 p-2 col-span-2">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Cover Illustration</span>
                  <p className="text-slate-100 font-medium truncate">{coverArtist}</p>
                </div>
              )}
              {inker && (
                <div className="rounded bg-white/[0.02] border border-white/5 p-2">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Inker</span>
                  <p className="text-slate-200 truncate">{inker}</p>
                </div>
              )}
              {letterer && (
                <div className="rounded bg-white/[0.02] border border-white/5 p-2">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Letterer</span>
                  <p className="text-slate-200 truncate">{letterer}</p>
                </div>
              )}
            </div>
          </div>

          {/* Publication Specifications */}
          <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Cover Price</span>
              <p className="text-amber-300 font-mono font-medium">{coverPrice ? `${coverPrice}` : '—'}</p>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Page Count</span>
              <p className="text-slate-200 font-mono font-medium">{pageCount ? `${pageCount} pp` : 'Standard'}</p>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block">On-Sale Date</span>
              <p className="text-slate-200 font-mono font-medium">{onSaleDate ? onSaleDate : pubDate || '—'}</p>
            </div>
          </div>

          {notes && (
            <div className="text-[10px] text-slate-400 flex items-start gap-1.5 italic bg-black/20 p-2 rounded border border-white/5">
              <Info className="h-3 w-3 text-cyan-400 shrink-0 mt-0.5" />
              <span>{notes}</span>
            </div>
          )}
        </div>
      </div>

      {/* Complete Issue Anthology & Multi-Story Sequences */}
      {otherStories.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => setShowAllStories(!showAllStories)}
            className="flex items-center justify-between w-full text-left text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Layers className="h-3.5 w-3.5" />
              <span>
                {otherStories.length} Additional Story & Feature Sequences in this Issue
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <span>{showAllStories ? 'Hide Sequences' : 'View All Stories'}</span>
              {showAllStories ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </div>
          </button>

          {showAllStories && (
            <div className="mt-3 space-y-2.5">
              {otherStories.map((st, sIdx) => (
                <div
                  key={sIdx}
                  className="rounded-lg bg-black/40 border border-white/5 p-3 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-300 text-xs">
                      Sequence {st.sequence}: "{st.title}"
                    </span>
                    {st.pageCount && (
                      <span className="text-[10px] font-mono text-slate-400">{st.pageCount} pages</span>
                    )}
                  </div>
                  {st.synopsis && (
                    <p className="text-slate-300 text-[11px] leading-relaxed font-light">{st.synopsis}</p>
                  )}
                  {st.characters && (
                    <p className="text-slate-400 text-[10px]">
                      <span className="text-slate-300 font-mono">Cast:</span> {st.characters}
                    </p>
                  )}
                  {(st.writer || st.penciler) && (
                    <p className="text-[10px] text-slate-400 flex items-center gap-3 pt-1">
                      {st.writer && <span><strong className="text-slate-300">Writer:</strong> {st.writer}</span>}
                      {st.penciler && <span><strong className="text-slate-300">Artist:</strong> {st.penciler}</span>}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
