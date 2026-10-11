"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, RefreshCw, Clock, Database, ShieldCheck, BookOpen, Layers } from "lucide-react";

interface NightlyReport {
  id: string;
  timestamp: string;
  timestamp_formatted: string;
  status: "SUCCESS" | "PARTIAL" | "ERROR";
  duration_ms: number;
  tasks: {
    pricecharting_api: {
      status: "UP" | "DOWN";
      token_valid: boolean;
      latency_ms: number;
      message: string;
    };
    gocollect_cpi: {
      status: string;
      details?: Record<string, unknown>;
    };
    lore_prewarming: {
      status: "SUCCESS" | "SKIPPED" | "ERROR";
      books_processed: number;
      titles: string[];
    };
    system_health: {
      database: "CONNECTED" | "UNREACHABLE";
      node_version: string;
      memory_rss_mb: number;
    };
  };
  summary: string;
}

export default function NightlyReportPage() {
  const [report, setReport] = useState<NightlyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secretInput, setSecretInput] = useState("");

  async function fetchReport(runNew = false) {
    setLoading(true);
    setError(null);
    try {
      const url = runNew
        ? `/api/cron/nightly-sync${secretInput ? `?secret=${encodeURIComponent(secretInput)}` : ""}`
        : `/api/cron/nightly-sync?view=latest`;
      const res = await fetch(url, { method: runNew ? "POST" : "GET" });
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Unauthorized: If CRON_SECRET is configured on Vercel, please enter it below.");
        }
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setReport(data);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReport(false);
  }, []);

  return (
    <main className="min-h-screen bg-[#070a0f] text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-cyan-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Automated Operations & Vercel Cron</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
              Nightly Audit & Synchronization Digest
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Daily automated reconciliation of PriceCharting, GoCollect, and Due Diligence Lore pre-warming.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchReport(true)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-mono uppercase tracking-wider font-semibold transition-all shadow-lg shadow-cyan-900/30 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Running Audit..." : "Trigger Nightly Run Now"}</span>
            </button>
          </div>
        </div>

        {/* Error / Auth Prompt */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="password"
                placeholder="CRON_SECRET (optional)"
                value={secretInput}
                onChange={(e) => setSecretInput(e.target.value)}
                className="px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => fetchReport(true)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300 font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Report Overview Hero */}
        {report ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl bg-[#0c1017] border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Overall Status</span>
                <div className="flex items-center gap-2 pt-1">
                  {report.status === "SUCCESS" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold">
                      <CheckCircle2 className="h-3.5 w-3.5" /> SUCCESS
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold">
                      <AlertTriangle className="h-3.5 w-3.5" /> {report.status}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#0c1017] border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Execution Time (EDT)</span>
                <div className="flex items-center gap-1.5 pt-1 text-slate-200 text-xs font-mono">
                  <Clock className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{report.timestamp_formatted}</span>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#0c1017] border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Pipeline Latency</span>
                <div className="pt-1 text-slate-100 text-lg font-bold font-mono">
                  {report.duration_ms} <span className="text-xs font-normal text-slate-500">ms</span>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#0c1017] border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Database Status</span>
                <div className="flex items-center gap-1.5 pt-1 text-xs font-mono text-emerald-400">
                  <Database className="h-3.5 w-3.5" />
                  <span>{report.tasks.system_health.database}</span>
                </div>
              </div>
            </div>

            {/* Task Detail Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PriceCharting Task */}
              <div className="p-6 rounded-xl bg-[#0c1017] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-purple-950/60 text-purple-400 border border-purple-500/30">
                      <Layers className="h-4 w-4" />
                    </span>
                    <h3 className="text-sm font-semibold text-slate-200">PriceCharting API & Token Verification</h3>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      report.tasks.pricecharting_api.status === "UP"
                        ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/40"
                        : "bg-rose-950/60 text-rose-300 border border-rose-500/40"
                    }`}
                  >
                    {report.tasks.pricecharting_api.status}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>API Token Status:</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {report.tasks.pricecharting_api.token_valid ? "ACTIVE & VERIFIED" : "INVALID"}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>API Latency:</span>
                    <span className="font-mono text-slate-200">{report.tasks.pricecharting_api.latency_ms} ms</span>
                  </div>
                  <p className="text-slate-400 text-[11px] pt-1 border-t border-slate-800/60">
                    {report.tasks.pricecharting_api.message}
                  </p>
                </div>
              </div>

              {/* GoCollect CPI Task */}
              <div className="p-6 rounded-xl bg-[#0c1017] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-blue-950/60 text-blue-400 border border-blue-500/30">
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                    <h3 className="text-sm font-semibold text-slate-200">GoCollect Certified Price Index (CPI)</h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-500/40">
                    {report.tasks.gocollect_cpi.status}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Weekly certified auction market price index synchronization. Ensures authoritative grade benchmarks
                    are aligned with GoCollect certified transactions.
                  </p>
                </div>
              </div>

              {/* Lore & Due Diligence Pre-warming */}
              <div className="p-6 rounded-xl bg-[#0c1017] border border-slate-800 space-y-4 md:col-span-2">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
                      <BookOpen className="h-4 w-4" />
                    </span>
                    <h3 className="text-sm font-semibold text-slate-200">
                      Due Diligence Lore Pre-warming (Fandom MediaWiki)
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/40">
                    {report.tasks.lore_prewarming.books_processed} BOOKS CACHED
                  </span>
                </div>
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">
                    Priority benchmark comics pre-warmed into the encyclopedic due diligence cache with full quotes,
                    creative credits, entity census, and hyperlinked synopses:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {report.tasks.lore_prewarming.titles.map((title, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/30 text-cyan-200 font-mono text-xs font-medium"
                      >
                        ✓ {title}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Raw JSON Digest Accordion */}
            <details className="p-5 rounded-xl bg-[#0c1017] border border-slate-800 text-xs font-mono text-slate-400">
              <summary className="cursor-pointer text-slate-300 hover:text-white select-none font-semibold">
                Inspect Raw Forensic Digest (JSON)
              </summary>
              <pre className="mt-4 p-4 rounded bg-[#070a0f] text-cyan-300 overflow-x-auto text-[11px] leading-relaxed border border-slate-800">
                {JSON.stringify(report, null, 2)}
              </pre>
            </details>
          </div>
        ) : !loading && !error ? (
          <div className="p-12 text-center rounded-xl bg-[#0c1017] border border-slate-800 space-y-3">
            <p className="text-slate-400 text-sm">No cached report found in this server session.</p>
            <button
              onClick={() => fetchReport(true)}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono uppercase tracking-wider font-semibold cursor-pointer"
            >
              Run First Nightly Audit
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
