"use client";

import { useEffect } from "react";

export default function SniperError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => { console.error("[sniper] screen failed", error); }, [error]);
  return (
    <section role="alert" className="mx-auto my-8 max-w-3xl rounded-xl border border-amber-500/40 bg-[#0E131F] p-6 text-slate-100">
      <h1 className="text-lg font-bold text-amber-300">Sniper could not display this screen</h1>
      <p className="mt-3 text-sm text-slate-300">Your saved account, bids, and collection remain in place. Retry to load the radar again.</p>
      {error.digest && <p className="mt-3 font-mono text-xs text-slate-400">Error reference: {error.digest}</p>}
      <button onClick={retry} className="mt-4 rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950">Retry Sniper</button>
    </section>
  );
}
