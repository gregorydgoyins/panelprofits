import { getEquityContracts } from "@/lib/equity/queries";
import { getSovereignEquities } from "@/lib/equity/canonical-equities";
import { calculateMarketIndices } from "@/lib/market/indices";
import { EquitiesTradingFloor } from "@/components/equity/equities-trading-floor";
import { CandlestickChart } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EquitiesPage() {
  const [contracts, equities, indices] = await Promise.all([
    getEquityContracts(),
    getSovereignEquities(120),
    calculateMarketIndices(),
  ]);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Institutional Header */}
      <header className="border-b border-slate-800 pb-7">
        <p className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.28em] text-emerald-300">
          <CandlestickChart className="h-3.5 w-3.5" /> Equity Desk / Sovereign Comic Exchange
        </p>
        <h1 className="mt-3 text-3xl sm:text-5xl font-black text-slate-100 tracking-tight">
          Comic Equities Trading Floor
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-400">
          Continuous price discovery, sovereign equity surveillance, and verified transaction clearing across all publishing eras. Incorporating real-time auction hammers, institutional float liquidity, and the curated CE70 benchmark index.
        </p>
      </header>

      {/* Trading Floor Component */}
      <EquitiesTradingFloor
        initialEquities={equities}
        contracts={contracts}
        indices={indices}
      />
    </main>
  );
}
