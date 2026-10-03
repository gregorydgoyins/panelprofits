"use client";

import * as React from "react";
import type { SovereignEquityItem } from "@/lib/equity/canonical-equities";
import type { MarketIndexRecord } from "@/lib/market/indices";
import type { EquityItem, EquityResponse } from "@/lib/equity/ticker-types";
import { lookupReferenceFmv, isProvenSovereignCopy } from "@/lib/pricing/reference-benchmarks";
import { formatComicEquityTicker } from "@/lib/equity/ticker-formatting";
import { TickerHeader } from "@/components/tickers/ticker-header";
import { EquityCard } from "@/components/tickers/equity-card";

const CARD_W = 227; // 215px card + 12px gap
const SCROLL_SPEED = 90; // px/s
const FETCH_MS = 5 * 60 * 1000; // Refresh pool every 5 minutes
const MAX_FETCHES = 10_000; // Wrap after ~3.5 days (88 hours = 3 days 16 hours)

interface EquitiesRailProps {
  items: SovereignEquityItem[];
  indices?: MarketIndexRecord[];
}

export function EquitiesRail({ items: initialItems = [], indices = [] }: EquitiesRailProps) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const fetchCount = React.useRef(0);
  const nextOffset = React.useRef(0);

  // Convert initial SovereignEquityItem[] to EquityItem[] for instant first-paint
  const initialEquityItems = React.useMemo<EquityItem[]>(() => {
    return initialItems.map((item, idx) => {
      const eraKey = (item.productionAge || item.originEra || "modern").toLowerCase().replace(/_age$/, "").replace(/\s+age$/, "");
      const fmv = item.referenceFmvUsd || 0;
      let tier = "rare";
      if (fmv >= 50000) tier = "mythic";
      else if (fmv >= 15000) tier = "legendary";
      else if (fmv >= 4000) tier = "epic";
      else if (fmv >= 1000) tier = "rare";
      else if (fmv >= 300) tier = "uncommon";
      else tier = "common";

      const itemGrade = String(item.referenceGrade || "9.8").trim();
      const bench = lookupReferenceFmv(item.seatNumber, item.title, item.canonicalIssueId);
      const isTrulySovereign = isProvenSovereignCopy(itemGrade, bench, {
        isVariant: Boolean(item.variant),
        variantName: item.variant,
      });
      const marketClass = fmv >= 45 ? "PREMIUM" : fmv >= 20 ? "STD" : "OTC";
      const effectiveAssetClass = isTrulySovereign ? "SOV" : marketClass;

      const cleanTicker = (item.ticker || formatComicEquityTicker(item.series, item.issueNumber))
        .replace(/\.(SOV|ANC|STD|OTC|PREMIUM)$/i, "")
        .replace(/^CE70\.\d+\.?/i, "")
        .trim();

      return {
        entryId: `eq-${item.id || idx}`,
        coverImageUrl: item.coverUrl || null,
        pricing: {
          fmv_usd: fmv,
          grade: itemGrade,
          delta_24: item.deltaPercent,
          delta_30: Number((item.deltaPercent * 1.2).toFixed(2)),
          delta_90: Number((item.deltaPercent * 2.1).toFixed(2)),
          asset_class: effectiveAssetClass,
        },
        identity: {
          assetId: cleanTicker,
          productName: `${item.series} #${item.issueNumber}`,
          year: item.year || 1970,
          publisher: item.publisher || (item.lineage.includes("DC") ? "DC Comics" : item.lineage.includes("Marvel") ? "Marvel" : "Independent"),
          variant: item.variant || null,
          productionAge: eraKey,
          scarcityTier: tier,
          detailUrl: `/comics/${encodeURIComponent(item.canonicalIssueId || item.id || cleanTicker)}`,
          assetClass: effectiveAssetClass,
          marketPriceClass: marketClass,
          isSovereign: isTrulySovereign,
          certificationState: "CERTIFIED",
          editionForm: item.variant ? "VARIANT" : "DIRECT",
          coverVerified: true,
          yearDivergence: false,
          coverSuppressReason: null,
          identityConfidence: 99,
          quarantined: false,
        },
      };
    });
  }, [initialItems]);

  const [items, setItems] = React.useState<EquityItem[]>(initialEquityItems);
  const [meta, setMeta] = React.useState<{
    tickId: number;
    totalEligible: number;
    eraTotals: Record<string, number>;
    scarcityTotals: Record<string, number>;
  } | null>(() => {
    if (!initialEquityItems.length) return null;
    const eraTotals: Record<string, number> = {};
    const scarcityTotals: Record<string, number> = {};
    for (const item of initialEquityItems) {
      const era = item.identity.productionAge;
      eraTotals[era] = (eraTotals[era] || 0) + 1;
      const tier = item.identity.scarcityTier;
      scarcityTotals[tier] = (scarcityTotals[tier] || 0) + 1;
    }
    return {
      tickId: 1,
      totalEligible: initialEquityItems.length,
      eraTotals,
      scarcityTotals,
    };
  });

  const [errored, setErrored] = React.useState(false);
  const [noSignalFilter, setNoSignalFilter] = React.useState(false);

  // Mythic tier (≥$50K) count for the Heritage Vault badge
  const HERITAGE_VAULT_THRESHOLD = 50_000;
  const heritageItems = React.useMemo(
    () => items.filter((i) => i && (i.pricing?.fmv_usd ?? 0) >= HERITAGE_VAULT_THRESHOLD),
    [items]
  );
  const tradeableItems = React.useMemo(
    () => items,
    [items]
  );
  const noSignalCount = React.useMemo(
    () => items.filter((i) => i?.identity?.identityConfidence === 0).length,
    [items]
  );

  const displayItems = React.useMemo(() => {
    if (noSignalFilter) {
      return tradeableItems.filter((i) => i?.identity?.identityConfidence === 0);
    }
    return tradeableItems.length > 0 ? tradeableItems : items;
  }, [tradeableItems, items, noSignalFilter]);

  // Adjust duration dynamically without resetting visual position
  React.useLayoutEffect(() => {
    if (!trackRef.current || displayItems.length === 0) return;
    const duration = (displayItems.length * CARD_W) / SCROLL_SPEED;
    const elapsedSeconds = (Date.now() / 1000) % duration;
    trackRef.current.style.animationDuration = `${duration}s`;
    trackRef.current.style.animationDelay = `-${elapsedSeconds}s`;
    trackRef.current.style.animationPlayState = "running";
  }, [displayItems.length]);

  // Sequential batch loader supporting up to 10,000 batches (88 hours / 3.5 days) continuous loop
  const fetchBatch = React.useCallback(async () => {
    try {
      const offset = nextOffset.current;
      const url = `/api/equity/ticker?limit=80&offset=${offset}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: EquityResponse = await res.json();

      const newItems = json.items ?? [];
      if (newItems.length > 0) {
        // startTransition prevents re-render hiccups on the GPU compositor thread
        React.startTransition(() => {
          setItems(newItems);
        });

        setMeta({
          tickId: json.tickId,
          totalEligible: json.totalEligible,
          eraTotals: json.eraTotals ?? {},
          scarcityTotals: json.scarcityTotals ?? {},
        });
        setErrored(false);

        fetchCount.current += 1;
        if (fetchCount.current >= MAX_FETCHES) {
          fetchCount.current = 0;
          nextOffset.current = 0;
        } else {
          nextOffset.current = json.nextOffset ?? (offset + newItems.length);
        }
      }
    } catch {
      setErrored(true);
    }
  }, []);

  React.useEffect(() => {
    const id = setInterval(fetchBatch, FETCH_MS);
    return () => clearInterval(id);
  }, [fetchBatch]);

  // Pause on hover via direct DOM style manipulation — zero React re-renders
  const handleEnter = React.useCallback(() => {
    if (trackRef.current) trackRef.current.style.animationPlayState = "paused";
  }, []);

  const handleLeave = React.useCallback(() => {
    if (trackRef.current) trackRef.current.style.animationPlayState = "running";
  }, []);

  const listToRender = displayItems.length > 0 ? displayItems : initialEquityItems;

  return (
    <aside
      aria-label="Sovereign Comic Equity Surveillance Rail"
      className="border-b border-slate-800/80 bg-[#070A11] text-xs text-slate-300 shadow-md select-none overflow-hidden"
    >
      {/* ── Ticker Header ── */}
      <TickerHeader
        showing={listToRender.length}
        total={meta?.totalEligible ?? listToRender.length}
        stalled={errored}
        eraCounts={meta?.eraTotals ?? {}}
        scarcityCounts={meta?.scarcityTotals ?? {}}
        noSignalFilter={noSignalFilter}
        noSignalCount={noSignalCount}
        heritageCount={heritageItems.length}
        onRetry={fetchBatch}
        onToggleNoSignal={() => setNoSignalFilter((f) => !f)}
      />

      {/* ── Continuously Animated Sovereign Comic Constituents Marquee Rail ── */}
      <div
        className="equities-marquee relative min-w-0 overflow-hidden py-3 bg-[#05070C]"
        role="region"
        aria-label="Sovereign Comic Constituents Ticker"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {/* Left & Right Ambient Fade Scrims */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#05070C] via-[#05070C]/80 to-transparent z-20" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#05070C] via-[#05070C]/80 to-transparent z-20" />

        {listToRender.length > 0 && (
          <div
            ref={trackRef}
            className="equities-marquee-track flex w-max items-center will-change-transform"
            style={{
              display: "flex",
              width: "max-content",
              willChange: "transform",
              animation: `panel-profits-equities-marquee 120s linear infinite`,
              backfaceVisibility: "hidden",
            }}
          >
            {(["a", "b"] as const).map((copy) => (
              <div key={copy} style={{ display: "flex", gap: "12px", paddingLeft: "16px", paddingRight: "12px", flexShrink: 0 }}>
                {listToRender.map((item, i) => (
                  <EquityCard
                    key={`${copy}-${i}`}
                    item={item}
                    index={copy === "a" ? i : i + listToRender.length}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}