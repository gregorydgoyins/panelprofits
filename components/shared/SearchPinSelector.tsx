/**
 * SearchPinSelector — reusable equity search + select component
 *
 * Fetches equities from the ticker feed, lets the user search by name,
 * and fires onSelect(id, name) when a result is chosen.
 * Used by GradeSpreadWidget and any other widget that needs an equity picker.
 * Each result row shows a cover thumbnail alongside symbol, name, and price.
 */
import { useState, useEffect, useRef, useCallback, useMemo, type CSSProperties } from 'react';
import { Search, X } from 'lucide-react';
import { proxyCoverUrl } from '@/lib/coverProxy';

interface EquityOption {
  id: string;
  name: string;
  symbol: string;
  assetClass: string | null;
  priceUsd: number;
  coverUrl: string | null;
}

interface Props {
  onSelect: (id: string, name: string) => void;
  onClear?: () => void;
  placeholder?: string;
  color?: string;
  maxResults?: number;
  initialLabel?: string;
}

const CLASS_COLOR: Record<string, string> = {
  SOV:     '#facc15',
  PREMIUM: '#a78bfa',
  STD:     '#60a5fa',
  OTC:     '#94a3b8',
};

let _cache: EquityOption[] | null = null;
let _cacheTs = 0;
const CACHE_TTL = 5 * 60_000;

async function loadEquities(): Promise<EquityOption[]> {
  if (_cache && Date.now() - _cacheTs < CACHE_TTL) return _cache;
  try {
    const r = await fetch('/api/equity/ticker?limit=200&offset=0&randomStart=0', { cache: 'no-store' });
    if (!r.ok) return [];
    const json = await r.json();
    const options: EquityOption[] = (json.items ?? []).map((item: any) => {
      const name: string = item.identity?.productName ?? '';
      const idStr = name.slice(0, 4).toUpperCase().replace(/\s/g, '');
      const m = name.match(/^(.+?)\s*#?(\d+)/);
      const sym = m
        ? m[1].split(/\s+/).map((w: string) => w[0]).join('').toUpperCase().slice(0, 4) + m[2]
        : idStr;
      return {
        id: item.identity?.assetId ?? item.id ?? '',
        name,
        symbol: sym,
        assetClass: item.identity?.assetClass ?? null,
        priceUsd: item.pricing?.fmv_usd ?? 0,
        coverUrl: item.coverImageUrl ?? null,
      };
    }).filter((o: EquityOption) => !!o.id && !!o.name);
    _cache = options;
    _cacheTs = Date.now();
    return options;
  } catch {
    return [];
  }
}

export function SearchPinSelector({ onSelect, onClear, placeholder = 'Search equity…', color = '#60a5fa', maxResults = 8, initialLabel }: Props) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<EquityOption[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(initialLabel ?? null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadEquities().then(setOptions);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return options.filter(o => o.name.toLowerCase().includes(q)).slice(0, maxResults);
  }, [query, options, maxResults]);

  const pick = useCallback((opt: EquityOption) => {
    setSelected(opt.name);
    setQuery('');
    setOpen(false);
    onSelect(opt.id, opt.name);
  }, [onSelect]);

  const clear = useCallback(() => {
    setSelected(null);
    setQuery('');
    setOpen(false);
    onClear?.();
  }, [onClear]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        inputRef.current && !inputRef.current.contains(e.target as Node) &&
        listRef.current && !listRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative', minWidth: '240px', maxWidth: '320px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '5px 10px',
        border: `1px solid ${color}30`,
        borderRadius: '4px',
        backgroundColor: `${color}08`,
      }}>
        <Search style={{ width: '12px', height: '12px', color: `${color}80`, flexShrink: 0 }} />
        {selected && !query ? (
          <span style={{
            flex: 1, fontSize: '11px', fontFamily: 'Hind, sans-serif',
            color: 'rgba(255,255,255,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {selected}
          </span>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => { if (query) setOpen(true); }}
            placeholder={selected ? 'Change equity…' : placeholder}
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: '11px', fontFamily: 'Hind, sans-serif',
              color: 'rgba(255,255,255,0.75)',
            }}
          />
        )}
        {selected && (
          <button
            onClick={clear}
            title="Clear selection"
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
              color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center',
            }}
          >
            <X style={{ width: '10px', height: '10px' }} />
          </button>
        )}
        {selected && (
          <button
            onClick={() => { setSelected(null); setTimeout(() => inputRef.current?.focus(), 0); }}
            title="Search for another equity"
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
              color: `${color}80`, display: 'flex', alignItems: 'center', fontSize: '10px',
              fontFamily: 'Hind, sans-serif',
            }}
          >
            ↕
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div
          ref={listRef}
          style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
            marginTop: '2px',
            backgroundColor: '#0f172a',
            border: `1px solid ${color}25`,
            borderRadius: '4px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            overflow: 'hidden',
          }}
        >
          {results.map(opt => (
            <button
              key={opt.id}
              onClick={() => pick(opt)}
              style={{
                width: '100%', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '6px 10px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                background: 'none', border: 'none',
                cursor: 'pointer',
                transition: 'background 0.1s',
                ['--pp-hover-color' as string]: `${color}12`,
              } as CSSProperties}
              className="pp-hover-var-bg"
            >
              {/* Cover thumbnail */}
              <div style={{
                width: '28px', height: '40px', flexShrink: 0,
                borderRadius: '2px', overflow: 'hidden',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: `1px solid rgba(255,255,255,0.08)`,
              }}>
                {opt.coverUrl ? (
                  <img
                    src={proxyCoverUrl(opt.coverUrl) || opt.coverUrl}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', backgroundColor: `${color}15` }} />
                )}
              </div>

              {/* Symbol + name */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{
                  fontSize: '9px', fontFamily: 'monospace', letterSpacing: '0.05em',
                  color: CLASS_COLOR[opt.assetClass ?? ''] ?? 'rgba(148,163,184,0.5)',
                  fontWeight: 500,
                }}>
                  {opt.symbol}
                </span>
                <span style={{
                  fontSize: '11px', fontFamily: 'Hind, sans-serif',
                  color: 'rgba(255,255,255,0.7)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {opt.name}
                </span>
              </div>

              {/* Price */}
              <span style={{
                fontSize: '10px', fontFamily: 'Hind, sans-serif', fontWeight: 500,
                color: 'rgba(255,255,255,0.35)', flexShrink: 0,
              }}>
                ${opt.priceUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchPinSelector;
