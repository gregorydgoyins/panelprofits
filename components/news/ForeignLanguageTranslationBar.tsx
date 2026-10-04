"use client";

import * as React from "react";
import { Globe2, Check, Sparkles } from "lucide-react";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/lib/i18n/news-translation";

interface ForeignLanguageTranslationBarProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  className?: string;
}

export function ForeignLanguageTranslationBar({
  currentLanguage,
  onLanguageChange,
  className = "",
}: ForeignLanguageTranslationBarProps) {
  return (
    <div className={`rounded-xl border border-indigo-500/30 bg-[#0c101d] p-3 shadow-md ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/20 text-indigo-400">
            <Globe2 className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-indigo-300 font-semibold">
                INTERNATIONAL & FOREIGN EDITIONS TRANSLATION BAR
              </span>
              <span className="flex items-center gap-0.5 px-1 py-0.2 rounded bg-indigo-950/80 border border-indigo-400/40 text-[9px] font-mono text-indigo-300">
                <Sparkles className="h-2.5 w-2.5 text-indigo-300" /> Multi-Lingual Wire
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Translate market dossiers, secondary census impacts, and foreign edition notes into native languages:
            </p>
          </div>
        </div>

        {/* Language Selection Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = currentLanguage === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => onLanguageChange(lang.code)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-mono transition-all ${
                  isSelected
                    ? "border border-indigo-400 bg-indigo-600/30 text-indigo-200 font-bold shadow-sm shadow-indigo-950"
                    : "border border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
                title={`${lang.nativeName} — ${lang.territory}`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
                {isSelected && <Check className="h-3 w-3 text-indigo-300" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
