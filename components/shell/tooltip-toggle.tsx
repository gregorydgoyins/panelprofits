"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, MessageSquareOff } from "lucide-react";

export const TOOLTIPS_STORAGE_KEY = "pp-tooltips-enabled";

export function useTooltipsEnabled(): boolean {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(TOOLTIPS_STORAGE_KEY);
      if (stored !== null) {
        setEnabled(stored !== "false");
      }
    } catch {}

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ enabled?: boolean }>;
      if (customEvent.detail?.enabled !== undefined) {
        setEnabled(customEvent.detail.enabled);
      } else {
        const stored = localStorage.getItem(TOOLTIPS_STORAGE_KEY);
        setEnabled(stored !== "false");
      }
    };

    window.addEventListener("pp-tooltip-settings", handleUpdate);
    return () => window.removeEventListener("pp-tooltip-settings", handleUpdate);
  }, []);

  return enabled;
}

export function TooltipToggle({ className = "" }: { className?: string }) {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(TOOLTIPS_STORAGE_KEY);
      if (stored !== null) {
        setEnabled(stored !== "false");
      }
    } catch {}

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ enabled?: boolean }>;
      if (customEvent.detail?.enabled !== undefined) {
        setEnabled(customEvent.detail.enabled);
      }
    };

    window.addEventListener("pp-tooltip-settings", handleUpdate);
    return () => window.removeEventListener("pp-tooltip-settings", handleUpdate);
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    try {
      localStorage.setItem(TOOLTIPS_STORAGE_KEY, String(next));
      window.dispatchEvent(
        new CustomEvent("pp-tooltip-settings", { detail: { enabled: next } })
      );
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title={enabled ? "Tooltips are ON. Click to turn OFF." : "Tooltips are OFF. Click to turn ON."}
      aria-label="Toggle tooltips"
      className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-mono font-bold transition-all border ${
        enabled
          ? "bg-purple-950/60 text-purple-300 border-purple-500/50 hover:bg-purple-900/60 shadow-[0_0_8px_rgba(168,85,247,0.3)] hover:border-purple-400"
          : "bg-slate-900/80 text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-700"
      } ${className}`}
    >
      {enabled ? (
        <>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <MessageSquare className="h-3 w-3 text-purple-300" />
          <span>TIPS: ON</span>
        </>
      ) : (
        <>
          <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
          <MessageSquareOff className="h-3 w-3 text-slate-500" />
          <span>TIPS: OFF</span>
        </>
      )}
    </button>
  );
}
