"use client";

import * as React from "react";

interface LiveLot {
  id: string;
  ok: boolean;
  status: number;
  ended: boolean;
  currentBid: number | null;
  minNextBid: number | null;
  bidCount: number | null;
  uniqueBidders: number | null;
  endsAt: string | null;
  secondsRemaining: number | null;
  reserveMet: boolean | null;
  fetchedAt: string;
  error?: string;
}

const fmt = (n: number | null | undefined) => (n == null ? "—" : `$${n.toFixed(2)}`);

function clock(secs: number): string {
  const s = Math.max(0, Math.floor(secs));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m ${String(r).padStart(2, "0")}s` : `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

/**
 * Live eBay state for one auction: current bid, the smallest bid eBay will take, bid count and a countdown to the real end time.
 * Polls faster as the end nears (30s → 10s → 3s) and stops when the auction ends. Shared server-side, so many viewers cost eBay one call.
 */
export function LiveLotStrip({ itemId, maxBid, url, startBid }: { itemId: string; maxBid?: number; url: string; startBid?: number }) {
  const enabled = /^ebay-\d+/.test(itemId);
  const [lot, setLot] = React.useState<LiveLot | null>(null);
  const [offsetMs, setOffsetMs] = React.useState(0);
  const [now, setNow] = React.useState(() => Date.now());
  const lotRef = React.useRef<LiveLot | null>(null);

  React.useEffect(() => {
    if (!enabled) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      let nextMs = 30000;
      try {
        const res = await fetch(`/api/sniper/watch?ids=${encodeURIComponent(itemId)}`, { cache: "no-store" });
        const data = await res.json();
        const l: LiveLot | undefined = data?.lots?.[0];
        if (l) {
          if (data.serverTime) setOffsetMs(new Date(data.serverTime).getTime() - Date.now());
          // keep the last good reading when eBay is briefly unavailable
          const next = l.ok ? l : lotRef.current ? { ...lotRef.current, error: l.error, status: l.status } : l;
          lotRef.current = next;
          setLot(next);
          if (l.ended) return; // done
          const secs = l.secondsRemaining ?? 9999;
          nextMs = l.status === 429 ? 60000 : secs > 600 ? 30000 : secs > 60 ? 10000 : 3000;
        }
      } catch {}
      if (typeof document !== "undefined" && document.hidden) nextMs = Math.max(nextMs, 30000);
      if (!stopped) timer = setTimeout(poll, nextMs);
    };
    poll();
    return () => { stopped = true; if (timer) clearTimeout(timer); };
  }, [itemId, enabled]);

  React.useEffect(() => {
    if (!enabled) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [enabled]);

  if (!enabled) return null;

  const endMs = lot?.endsAt ? new Date(lot.endsAt).getTime() : null;
  const secsLeft = endMs != null ? Math.max(0, Math.round((endMs - (now + offsetMs)) / 1000)) : null;
  const ended = !!lot?.ended || (secsLeft != null && secsLeft <= 0 && !!lot?.ok);
  const hot = secsLeft != null && secsLeft <= 15 && !ended;
  const age = lot ? Math.max(0, Math.round((now + offsetMs - new Date(lot.fetchedAt).getTime()) / 1000)) : null;

  return (
    <div className={`mt-3 rounded-lg border p-3 font-mono ${hot ? "border-rose-500 bg-rose-950/40" : "border-cyan-500/40 bg-slate-950/70"}`}>
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider">
        <span className="text-cyan-300 font-bold">Live from eBay</span>
        <span className={hot ? "text-rose-300 font-black animate-pulse" : "text-slate-400"}>
          {ended ? "AUCTION ENDED" : secsLeft != null ? `ends in ${clock(secsLeft)}` : "waiting for eBay…"}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-[10px] text-slate-500 uppercase">Current bid</div>
          <div className="text-lg font-black text-emerald-300">{fmt(lot?.currentBid ?? startBid)}</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 uppercase">Min next bid</div>
          <div className="text-lg font-black text-white">{fmt(lot?.minNextBid)}</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 uppercase">Bids</div>
          <div className="text-lg font-black text-white">{lot?.bidCount ?? "—"}</div>
        </div>
      </div>
      {maxBid != null && maxBid > 0 && lot?.minNextBid != null && (
        <div className={`mt-2 text-[11px] text-center ${lot.minNextBid > maxBid ? "text-rose-300" : "text-slate-300"}`}>
          {lot.minNextBid > maxBid
            ? `Over your limit: next bid $${lot.minNextBid.toFixed(2)} is above your max $${maxBid.toFixed(2)}`
            : `Room under your max $${maxBid.toFixed(2)}: $${(maxBid - lot.minNextBid).toFixed(2)}`}
        </div>
      )}
      {!ended && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-2 block rounded-lg py-2 text-center text-xs font-black uppercase ${hot ? "bg-rose-500 text-white animate-pulse" : "bg-slate-800 text-cyan-300 border border-cyan-500/30"}`}
        >
          {hot ? "BID NOW on eBay ↗" : "Open on eBay to bid ↗"}
        </a>
      )}
      <div className="mt-1.5 text-[10px] text-slate-500 text-center">
        {lot?.error ? `eBay busy (${lot.error}) — showing last reading` : age != null ? `eBay reading ${age}s old` : ""}
      </div>
    </div>
  );
}
