"use client";

import * as React from "react";
import { AlertCircle, RotateCcw, Search, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Application query notice:", error);
  }, [error]);

  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center p-6 text-center">
      <div className="max-w-lg rounded-xl border border-slate-800 bg-[#0b0f15] p-8 space-y-6 shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-cyan-400 border border-slate-800">
          <AlertCircle className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400">
            System Notice · Service Availability
          </p>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 uppercase">
            Data Retrieval Interrupted
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            {error.message && !error.message.includes("digest")
              ? error.message
              : "The requested record or market dataset is temporarily unavailable from the upstream data service."}
          </p>
          {error.digest && (
            <p className="font-mono text-[10px] text-slate-500 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800/80 max-w-xs mx-auto truncate select-all">
              Ref ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5 text-cyan-400" />
            <span>Retry Query</span>
          </Button>

          <Link href="/comics">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white"
            >
              <Search className="h-3.5 w-3.5 text-cyan-400" />
              <span>Browse Catalog</span>
            </Button>
          </Link>

          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-slate-400 hover:text-slate-200"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Newsroom</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
