import Link from "next/link";
import { ArrowUpRight, BookOpen, CircleUserRound, Layers3, Radar, Settings2, ShieldCheck, TrendingUp, DollarSign, Briefcase, Zap } from "lucide-react";
import { Profile } from "@/lib/account/types";
import { PlayerFirmContext } from "@/lib/game/player-state";
import { SignOutButton } from "@/components/shell/sign-out-button";

export function GameShell({ profile, firmContext }: { profile: Profile; firmContext: PlayerFirmContext }) {
  const cards = [
    {
      icon: Briefcase,
      label: "Institutional Desk",
      value: firmContext.firmName,
      subtitle: `${firmContext.roleTitle} · Level ${firmContext.careerLevel}`,
      copy: `${firmContext.deskType} assignment active with authorized execution authority.`,
    },
    {
      icon: DollarSign,
      label: "Capital & Liquid Reserves",
      value: `$${firmContext.cashUsd.toLocaleString()}`,
      subtitle: `Total AUM: $${firmContext.totalAumUsd.toLocaleString()}`,
      copy: `Liquid balance allocated for sovereign comic equity acquisitions and block trades.`,
    },
    {
      icon: TrendingUp,
      label: "Portfolio PnL / Yield",
      value: `${firmContext.totalPnlUsd >= 0 ? "+" : ""}$${firmContext.totalPnlUsd.toLocaleString()}`,
      subtitle: `${firmContext.positions.length} Active Sovereign Positions`,
      copy: `Real-time yield tracked against clean historical reference benchmarks.`,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:py-12">
      {/* Header Bar */}
      <div className="flex flex-col justify-between gap-5 border-b border-slate-800 pb-7 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <p className="text-[10px] uppercase font-mono tracking-[0.28em] text-cyan-300">
              Player Command & Equity Operations
            </p>
          </div>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-slate-100 tracking-tight">
            Terminal Ready, {profile.display_name || "Operator"}.
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
            Assigned to <span className="text-cyan-300 font-semibold">{firmContext.firmName}</span>. Your active portfolio positions and market execution desk are synchronized.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <Link
            href="/account"
            className="flex items-center gap-2 rounded border border-slate-700 bg-slate-800/40 px-3 py-2 text-slate-300 hover:border-cyan-300 hover:text-cyan-200 transition-colors"
          >
            <CircleUserRound className="h-4 w-4" /> Account
          </Link>
          <SignOutButton />
        </div>
      </div>

      {/* Institutional Overview Cards */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {cards.map(({ icon: Icon, label, value, subtitle, copy }) => (
          <section key={label} className="border border-slate-800 bg-[#0d1118] p-5 rounded-lg">
            <div className="flex items-center justify-between">
              <Icon className="h-5 w-5 text-cyan-400" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Live</span>
            </div>
            <p className="mt-5 text-[10px] uppercase tracking-[0.22em] text-slate-500 font-mono">{label}</p>
            <p className="mt-1 text-xl font-bold text-slate-100">{value}</p>
            {subtitle && (
              <p className="mt-1 text-xs font-mono text-cyan-300/90">{subtitle}</p>
            )}
            <p className="mt-3 text-xs leading-5 text-slate-400 border-t border-slate-800/60 pt-3">{copy}</p>
          </section>
        ))}
      </div>

      {/* Active Portfolio Holdings Table */}
      <section className="mt-6 border border-slate-800 bg-[#0d1118] p-6 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <h2 className="text-base font-semibold text-slate-100">Active Sovereign Positions</h2>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Constitutional and investment-tier instruments allocated to your trading book.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/market"
              className="inline-flex items-center gap-1.5 rounded border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-cyan-400 transition-colors"
            >
              Market Desk <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800/80 text-[10px] uppercase text-slate-500 tracking-wider">
                <th className="pb-3 font-normal">Instrument / Series</th>
                <th className="pb-3 font-normal">Grade</th>
                <th className="pb-3 font-normal">Units</th>
                <th className="pb-3 font-normal">Entry Basis</th>
                <th className="pb-3 font-normal">Current FMV</th>
                <th className="pb-3 font-normal">Market Value</th>
                <th className="pb-3 font-normal text-right">PnL (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {firmContext.positions.map((pos) => (
                <tr key={pos.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-3 font-sans font-medium text-slate-200">
                    <Link href={`/assets/${pos.instrumentId}`} className="hover:text-cyan-300 transition-colors">
                      {pos.series} {pos.issueNumber ? `#${pos.issueNumber}` : ""}
                    </Link>
                  </td>
                  <td className="py-3 text-cyan-300 font-semibold">{pos.grade}</td>
                  <td className="py-3 text-slate-300">{pos.quantity}</td>
                  <td className="py-3 text-slate-400">${pos.entryPriceUsd.toLocaleString()}</td>
                  <td className="py-3 text-emerald-300 font-semibold">${pos.currentFmvUsd.toLocaleString()}</td>
                  <td className="py-3 text-slate-100 font-bold">${pos.totalMarketValue.toLocaleString()}</td>
                  <td className={`py-3 text-right font-bold ${pos.unrealizedPnlUsd >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {pos.unrealizedPnlUsd >= 0 ? "+" : ""}${pos.unrealizedPnlUsd.toLocaleString()} ({pos.unrealizedPnlPercent >= 0 ? "+" : ""}{pos.unrealizedPnlPercent}%)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Primary Workspace Navigation */}
      <section className="mt-6 border border-slate-800 bg-[#0d1118] p-6 sm:p-8 rounded-lg">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <p className="text-[10px] uppercase font-mono tracking-[0.22em] text-cyan-400">Execution Ops</p>
            <h2 className="mt-3 text-2xl font-bold text-slate-100">Expand Your Holdings & Catalog Intelligence</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
              Conduct forensic valuation research across 64,000+ certified issues in the Master Catalog, deploy orders on the CE70 desk, or manage your personal vault.
            </p>
          </div>
          <Link
            href="/comics"
            className="flex shrink-0 items-center gap-2 rounded bg-cyan-500/10 border border-cyan-400/60 px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-400 hover:text-slate-950 transition-colors"
          >
            Open Catalog <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            href="/collection"
            className="flex items-center gap-3 border border-slate-800 p-4 rounded text-sm text-slate-200 hover:border-cyan-300 hover:bg-slate-800/30 transition-colors"
          >
            <BookOpen className="h-4 w-4 text-cyan-300" /> Review collection & private vault
          </Link>
          <Link
            href="/watchlist"
            className="flex items-center gap-3 border border-slate-800 p-4 rounded text-sm text-slate-200 hover:border-cyan-300 hover:bg-slate-800/30 transition-colors"
          >
            <Radar className="h-4 w-4 text-cyan-300" /> Review active target watchlist
          </Link>
        </div>
      </section>
    </main>
  );
}