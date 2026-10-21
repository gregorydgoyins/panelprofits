import React from "react";
import type { LastSale } from "@/lib/comics/detail-model";

interface MarketTruthPanelProps {
  /** Stored PriceCharting 9.8 price and the date of its latest dated snapshot, when there is one. */
  price98: number | null;
  price98AsOf: string | null;
  lastSale: LastSale | null;
  salesCount: number;
  census: { total: number; ninePlus: number | null; snapshotDate: string | null } | null;
  accentColor?: string;
}

const usd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const day = (s: string | null) => (s ? s.slice(0, 10) : null);

/**
 * What the database actually knows about this book: the stored 9.8 price, the most recent recorded
 * sale, how many sales are on file, and the CGC census. Each line appears only if its data exists.
 */
export function MarketTruthPanel({ price98, price98AsOf, lastSale, salesCount, census, accentColor = "#60a5fa" }: MarketTruthPanelProps) {
  const rows: Array<{ label: string; value: string; note?: string }> = [];
  if (price98 != null && price98 > 0) {
    rows.push({ label: "9.8 price", value: usd(price98), note: price98AsOf ? `PriceCharting, ${day(price98AsOf)}` : "PriceCharting, undated" });
  }
  if (lastSale) {
    rows.push({
      label: "Last recorded sale",
      value: usd(lastSale.priceUsd),
      note: `${lastSale.grade === "RAW" ? "Raw" : `Grade ${lastSale.grade}`}${lastSale.venue ? ` · ${lastSale.venue}` : ""} · ${day(lastSale.date)}`,
    });
  }
  if (salesCount > 0) rows.push({ label: "Sales on file", value: String(salesCount) });
  if (census && census.total > 0) {
    rows.push({ label: "CGC graded copies", value: census.total.toLocaleString("en-US"), note: census.snapshotDate ? `census ${day(census.snapshotDate)}` : undefined });
    if (census.ninePlus != null) rows.push({ label: "Graded 9.0 or higher", value: census.ninePlus.toLocaleString("en-US") });
  }
  if (rows.length === 0) return null;

  return (
    <div className="rounded-lg p-4" style={{ backgroundColor: "#070c18", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: accentColor }}>
        Market truth
      </div>
      <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r) => (
          <div key={r.label} className="flex flex-col">
            <dt className="text-[10px] font-mono uppercase text-slate-500">{r.label}</dt>
            <dd className="text-lg font-semibold text-white">{r.value}</dd>
            {r.note && <span className="text-[10px] font-mono text-slate-500">{r.note}</span>}
          </div>
        ))}
      </dl>
    </div>
  );
}
