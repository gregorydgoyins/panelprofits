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
}

export function OraclePriceSparkline({ assetId, color = '#94a3b8', height = 80, limit = 30 }: Props) {
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

  if (records.length < 2) {
    return (
      <div style={{ height: Math.min(height, 40), display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.28)', fontFamily: 'Hind, sans-serif' }}>
          Continuous price trend active
        </span>
      </div>
    );
  }

  const prices = records.map((r) => Number(r.price) || 0);
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
