'use client';

import { useState, useEffect, useCallback } from 'react';
import Panel from './Panel';
import { getEraColors } from '@/lib/design-system/colors';
import { Play, ExternalLink, Film, TrendingUp, Award, BookOpen, Loader2 } from 'lucide-react';

interface VideoPanelProps {
  workName: string;
  publisher: string;
  variantId: string;
  issueNumber?: string | null;
  eraColors: { border: string; bg: string; bgHover: string; glow: string };
}

interface YTVideo {
  videoId: string;
  title: string;
  channel: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  youtubeUrl: string;
}

interface YTSearchResponse {
  success: boolean;
  source: 'youtube-api' | 'fallback';
  videos: YTVideo[];
  searchUrl: string;
}

function buildSearchQuery(workName: string, issueNumber?: string | null): string {
  const title = workName?.trim() || 'Comic';
  const issue = issueNumber?.trim();
  return issue ? `${title} #${issue} comic review CGC` : `${title} comic review collecting`;
}

function buildFallbackLinks(
  workName: string,
  issueNumber: string | null | undefined,
  publisher: string
) {
  const title = workName?.trim() || 'Comic';
  const issue = issueNumber?.trim() || '';
  const pub = publisher?.trim() || '';
  const titleWithIssue = issue ? `${title} #${issue}` : title;

  return [
    {
      label: `${titleWithIssue} — CGC Grading & Market Value`,
      query: `${titleWithIssue} CGC grading value`,
      icon: Award,
      description: 'Grading walkthroughs, census data & fair market value',
    },
    {
      label: `${titleWithIssue} — Key Issue Spotlight`,
      query: `${titleWithIssue} key issue comic review`,
      icon: Play,
      description: 'In-depth reviews, first appearances & significance',
    },
    {
      label: `${title} — Market Analysis & Investing`,
      query: `${title} comic investing market analysis`,
      icon: TrendingUp,
      description: 'Price trends, investment thesis & market outlook',
    },
    {
      label: `${title} — Collecting Guide`,
      query: issue
        ? `${title} comic collecting guide ${pub}`
        : `${title} comic collecting guide`,
      icon: BookOpen,
      description: `Collector tips, print runs & variant hunting${pub ? ` · ${pub}` : ''}`,
    },
  ];
}

function formatTimeAgo(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const diff = Date.now() - d.getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 1) return 'today';
    if (days < 30) return `${days}d ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  } catch { return ''; }
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

export default function VideoPanel({
  workName,
  publisher,
  variantId,
  issueNumber,
  eraColors,
}: VideoPanelProps) {
  const [videos, setVideos] = useState<YTVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchUrl, setSearchUrl] = useState('');
  const [source, setSource] = useState<'youtube-api' | 'fallback'>('fallback');

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      const q = buildSearchQuery(workName, issueNumber);
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(q)}&maxResults=6`);
      if (!res.ok) throw new Error(`${res.status}`);
      const data: YTSearchResponse = await res.json();
      setVideos(data.videos || []);
      setSearchUrl(data.searchUrl || '');
      setSource(data.source || 'fallback');
    } catch {
      setVideos([]);
      setSource('fallback');
      const q = buildSearchQuery(workName, issueNumber);
      setSearchUrl(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`);
    } finally {
      setLoading(false);
    }
  }, [workName, issueNumber]);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  const fallbackLinks = buildFallbackLinks(workName, issueNumber, publisher);

  return (
    <Panel
      title="Video Library"
      icon={<Film className="w-3.5 h-3.5" />}
      eraColors={eraColors as ReturnType<typeof getEraColors>}
    >
      <div className="space-y-2" data-variant-id={variantId}>
        <div
          className="text-[8px] uppercase tracking-wider mb-2.5 font-mono flex items-center justify-between"
          style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em' }}
        >
          <span>Related Videos</span>
          {source === 'youtube-api' && videos.length > 0 && (
            <span className="text-[7px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
              via YouTube
            </span>
          )}
        </div>

        {loading && (
          <div
            className="rounded-md p-4 flex items-center justify-center gap-2"
            style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
          >
            <Loader2
              className="w-3.5 h-3.5 animate-spin"
              style={{ color: eraColors.border }}
            />
            <span
              className="text-[10px] font-mono"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              Loading videos…
            </span>
          </div>
        )}

        {!loading && source === 'youtube-api' && videos.length > 0 && (
          <>
            {videos.map((video) => (
              <a
                key={video.videoId}
                href={video.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-md overflow-hidden transition-all duration-150"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${eraColors.border}20`,
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.borderColor = `${eraColors.border}50`;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.borderColor = `${eraColors.border}20`;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                  <img
                    src={video.thumbnail}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(255,0,0,0.9)' }}
                    >
                      <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                    </div>
                  </div>
                  {video.publishedAt && (
                    <div
                      className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-mono"
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.75)',
                        color: 'rgba(255,255,255,0.7)',
                      }}
                    >
                      {formatTimeAgo(video.publishedAt)}
                    </div>
                  )}
                </div>

                <div className="p-2.5">
                  <div
                    className="text-[11px] leading-snug line-clamp-2 font-medium"
                    style={{ color: 'rgba(255,255,255,0.88)', fontFamily: 'Hind, sans-serif' }}
                  >
                    {decodeHtmlEntities(video.title)}
                  </div>
                  <div
                    className="text-[9px] mt-1 line-clamp-1"
                    style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Hind, sans-serif' }}
                  >
                    {decodeHtmlEntities(video.channel)}
                  </div>
                </div>
              </a>
            ))}

            {searchUrl && (
              <a
                href={searchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center rounded-md py-2 mt-1 transition-colors"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${eraColors.border}15`,
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                }}
              >
                <span
                  className="text-[9px] font-mono flex items-center justify-center gap-1"
                  style={{ color: eraColors.border }}
                >
                  More on YouTube <ExternalLink className="w-2.5 h-2.5" />
                </span>
              </a>
            )}
          </>
        )}

        {!loading && (source === 'fallback' || videos.length === 0) && (
          <>
            {fallbackLinks.map((link, idx) => {
              const Icon = link.icon;
              return (
                <a
                  key={idx}
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(link.query)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-md p-2.5 transition-all duration-150 relative overflow-hidden"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${eraColors.border}20`,
                    borderLeft: `3px solid ${eraColors.border}`,
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.055)';
                    e.currentTarget.style.borderColor = `${eraColors.border}40`;
                    e.currentTarget.style.borderLeftColor = eraColors.border;
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.borderColor = `${eraColors.border}20`;
                    e.currentTarget.style.borderLeftColor = eraColors.border;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        backgroundColor: `${eraColors.border}15`,
                        border: `1px solid ${eraColors.border}35`,
                        color: eraColors.border,
                      }}
                    >
                      <Icon className="w-3 h-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-[11px] leading-snug line-clamp-2 font-medium"
                        style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'Hind, sans-serif' }}
                      >
                        {link.label}
                      </div>
                      <div
                        className="text-[9px] mt-0.5 line-clamp-1"
                        style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Hind, sans-serif' }}
                      >
                        {link.description}
                      </div>
                      <div
                        className="text-[9px] mt-1 flex items-center gap-1 font-mono transition-colors"
                        style={{ color: eraColors.border }}
                      >
                        <span>Search YouTube &rarr;</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </>
        )}
      </div>
    </Panel>
  );
}
