"use client";

import React, { useState, useEffect } from 'react';

interface OraclePriceRecord {
  id: string;
  asset_id: string;
  grade: string | null;
  price: number;
  source: string | null;
  snapshot_date: string;
  metadata: Record<string, any> | null;
}

interface Props {
  assetId: string;
  color?: string;
  height?: number;
  limit?: number;
  /** Real dated prices from the page's own history, used when the oracle table has none. */
  fallbackPoints?: Array<{ observedAt: string; priceUsd: number; source?: string }>;
}

export function OraclePriceSparkline({ assetId, color = '#94a3b8', height = 80, limit = 30, fallbackPoints }: Props) {
  const [records, setRecords] = useState<OraclePriceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!assetId) return;
    let active = true;
    setLoading(true);
    fetch(`/api/oracle/price-history/${assetId}?limit=${limit}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.data) {
          setRecords(data.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [assetId, limit]);

  if (loading) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', height: '2px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '1px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '40%', backgroundColor: `${color}40`, borderRadius: '1px' }} />
        </div>
      </div>
    );
  }

  // Prefer the oracle series; otherwise use the page's own dated prices (one point per day).
  const own = (fallbackPoints ?? [])
    .filter((p) => p.priceUsd > 0 && p.observedAt)
    .sort((a, b) => a.observedAt.localeCompare(b.observedAt))
    .filter((p, i, arr) => i === 0 || p.observedAt.slice(0, 10) !== arr[i - 1].observedAt.slice(0, 10));
  const series: Array<{ price: number; at: string }> =
    records.length >= 2
      ? records.map((r) => ({ price: Number(r.price) || 0, at: r.snapshot_date }))
      : own.map((p) => ({ price: p.priceUsd, at: p.observedAt }));

  if (series.length < 2) {
    const only = series[0] ?? null;
    const label = only
      ? `One dated price on file: $${only.price.toFixed(2)} (${new Date(only.at).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })}). A trend needs a second dated sale.`
      : 'No dated sales on file yet.';
    return (
      <div style={{ minHeight: Math.min(height, 40), display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', fontFamily: 'Hind, sans-serif' }}>{label}</span>
      </div>
    );
  }

  const prices = series.map((r) => r.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const points = prices
    .map((p, idx) => {
      const x = (idx / (prices.length - 1)) * 100;
      const y = 100 - ((p - min) / range) * 80 - 10;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div style={{ height, width: '100%', position: 'relative' }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
        <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
      </svg>
    </div>
  );
}
