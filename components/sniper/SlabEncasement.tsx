"use client";

import React from "react";
import { ComicEra } from "@/lib/sniper/types";
import { getEraDisplayName } from "@/lib/sniper/anti-bullshit";

interface SlabEncasementProps {
  gradingCompany: "CGC" | "CBCS";
  grade: number;
  title: string;
  issueNumber?: string;
  publisher?: string;
  year?: number;
  era?: ComicEra;
  certNumber?: string;
  pageQuality?: string;
  isYellowLabel?: boolean;
  signatureDetails?: string;
  keyComments?: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

export function SlabEncasement({
  gradingCompany = "CGC",
  grade,
  title,
  issueNumber,
  publisher,
  year,
  era,
  certNumber,
  pageQuality = "WHITE Pages",
  isYellowLabel = false,
  signatureDetails,
  keyComments,
  imageUrl,
  size = "md",
  className = "",
  onClick,
}: SlabEncasementProps) {
  const isCgc = gradingCompany === "CGC";

  // Width and height sizing presets
  const sizeClasses = {
    sm: "w-36 max-w-[144px]",
    md: "w-48 max-w-[192px]",
    lg: "w-64 max-w-[256px]",
  }[size];

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); } : undefined}
      className={`relative select-none flex flex-col rounded-xl border-[2.5px] border-slate-400/40 bg-gradient-to-b from-white/10 via-slate-900/60 to-black/90 p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.85)] backdrop-blur-md transition ${
        onClick ? "cursor-zoom-in hover:scale-[1.02] hover:border-cyan-400/80 group" : "hover:border-slate-300/70"
      } ${sizeClasses} ${className}`}
      style={{
        boxShadow: "0 10px 28px -4px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -2px 4px rgba(0,0,0,0.8)",
      }}
      title={onClick ? "Click to view full high-resolution front inspection" : undefined}
    >
      {/* Acrylic Hanger Tab Notch at top */}
      <div className="mx-auto -mt-2.5 mb-1 h-2 w-12 rounded-t-md border-t border-x border-slate-300/40 bg-white/10 backdrop-blur-sm" />

      {/* TOP CERTIFIED SLAB LABEL HEADER */}
      <div
        className={`relative overflow-hidden rounded-t-md border border-black/50 shadow-md ${
          isYellowLabel
            ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950"
            : isCgc
            ? "bg-gradient-to-r from-[#004f84] via-[#0068a8] to-[#004f84] text-white"
            : "bg-gradient-to-r from-[#0b3c68] via-[#105594] to-[#0b3c68] text-white"
        }`}
      >
        {/* Subtle label background paper sheen */}
        <div className="absolute inset-0 bg-white/5 pointer-events-none" />

        {/* Top Banner Stripe: Company & Label Designation */}
        <div className="flex items-center justify-between px-1.5 py-0.5 border-b border-black/20 text-[9px] font-black tracking-wider uppercase font-mono">
          <div className="flex items-center gap-1">
            <span
              className={`px-1 py-0.2 rounded font-black text-[8px] ${
                isYellowLabel
                  ? "bg-black text-amber-300"
                  : "bg-white text-[#004f84]"
              }`}
            >
              {gradingCompany}
            </span>
            <span>
              {isYellowLabel
                ? isCgc
                  ? "SIGNATURE SERIES"
                  : "VERIFIED SIGNATURE"
                : isCgc
                ? "UNIVERSAL GRADE"
                : "CERTIFIED GRADE"}
            </span>
          </div>
          {era && (
            <span className="text-[7.5px] opacity-90 tracking-tighter">
              {getEraDisplayName(era)}
            </span>
          )}
        </div>

        {/* Main Label Body: Grade Box on Left, Title / Cert on Right */}
        <div className="grid grid-cols-12 gap-1 p-1 items-center">
          {/* Grade Number Box */}
          <div
            className={`col-span-4 rounded flex flex-col items-center justify-center p-0.5 border ${
              isYellowLabel
                ? "bg-amber-100 border-amber-600/40 text-slate-950 shadow-inner"
                : "bg-white border-blue-900/40 text-slate-900 shadow-inner"
            }`}
          >
            <span className="text-xl font-black tracking-tighter leading-none font-mono">
              {grade.toFixed(1)}
            </span>
            <span className="text-[6.5px] font-bold uppercase tracking-tight text-slate-700 leading-tight mt-0.5">
              {pageQuality}
            </span>
          </div>

          {/* Book Title, Key Comments & Cert Details */}
          <div className="col-span-8 flex flex-col justify-center overflow-hidden">
            <div className="font-bold text-[9px] truncate leading-tight uppercase">
              {title}
            </div>
            {publisher && (
              <div className="text-[7.5px] opacity-80 truncate leading-tight">
                {publisher} {year ? `• ${year}` : ""}
              </div>
            )}
            {keyComments && (
              <div
                className={`text-[7px] truncate font-semibold leading-tight mt-0.5 ${
                  isYellowLabel ? "text-amber-950" : "text-amber-200"
                }`}
              >
                ★ {keyComments}
              </div>
            )}
            {signatureDetails && (
              <div className="text-[6.5px] truncate font-medium text-amber-900 leading-tight">
                ✍ {signatureDetails}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Cert & Barcode Strip */}
        <div className="flex items-center justify-between px-1.5 py-0.5 bg-black/20 border-t border-black/10 text-[7.5px] font-mono">
          <div className="flex items-center gap-0.5 opacity-70">
            {/* Simulated barcode vertical bars */}
            <span className="tracking-tighter font-serif text-[6px]">|||| | ||||| || ||| |</span>
          </div>
          <span className="font-bold font-mono">
            {certNumber ? `Cert #${certNumber}` : "ENCAPSULATED"}
          </span>
        </div>
      </div>

      {/* RECESSED ACRYLIC ARCHIVAL WELL */}
      <div
        className="relative mt-1 flex-1 overflow-hidden rounded-sm border-2 border-slate-700/60 bg-slate-950/90 shadow-inner aspect-[2/3] flex items-center justify-center"
        style={{
          boxShadow: "inset 0 2px 6px rgba(0,0,0,0.9), 0 1px 2px rgba(255,255,255,0.1)",
        }}
      >
        {/* Archival Inner Well Mount Rim */}
        <div className="absolute inset-1 rounded-sm border border-slate-700/40 pointer-events-none" />

        {/* Acrylic Light Reflection Sheen */}
        <div
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"
          style={{ mixBlendMode: "overlay" }}
        />

        {imageUrl && imageUrl.trim().length > 0 ? (
          /* AUTHENTIC AUCTION COVER IMAGE INSIDE SLAB */
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover rounded-[1px]"
            loading="lazy"
          />
        ) : (
          /* NO GUESSES / STOCK PHOTOS — AUTHENTIC ARCHIVAL CHAMBER WITH REGISTRY BADGE */
          <div className="w-full h-full p-2.5 flex flex-col items-center justify-center text-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-slate-400">
            <div className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-1.5 shadow">
              <span className="text-base">🛡️</span>
            </div>
            <div className="text-[9px] font-black uppercase tracking-wider text-slate-200 font-mono">
              {gradingCompany} CERTIFIED SLAB
            </div>
            <div className="text-[8px] font-mono font-bold text-amber-400 mt-0.5">
              Grade {grade.toFixed(1)} Encapsulated
            </div>
            {certNumber && (
              <div className="text-[7px] font-mono text-cyan-400 mt-1 bg-cyan-950/60 border border-cyan-500/30 px-1 rounded">
                Cert #{certNumber}
              </div>
            )}
            <div className="text-[6.5px] text-slate-500 mt-2 leading-tight uppercase font-medium max-w-[120px]">
              Auction photo not provided by seller · Verified via Cert Registry
            </div>
          </div>
        )}

        {/* Inspection Hover Overlay */}
        {onClick && (
          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none z-10">
            <span className="text-[8px] font-mono font-bold text-cyan-300 bg-slate-900/95 border border-cyan-500/80 px-2 py-1 rounded shadow flex items-center gap-1 uppercase tracking-wider">
              <span>🔍</span> Inspect High-Res
            </span>
          </div>
        )}
      </div>

      {/* BOTTOM SLAB RIM: PRISMATIC MICRO-HOLOGRAM SECURITY BADGE */}
      <div className="mt-1 flex items-center justify-between px-1 text-[7px] font-mono text-slate-400">
        <span className="text-[6px] tracking-tight text-slate-500">ARCHIVAL WELL</span>

        {/* Micro-Hologram Security Badge */}
        <div
          className="px-1.5 py-0.5 rounded-[2px] text-[6.5px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 border border-white/20"
          style={{
            background: "linear-gradient(135deg, #f59e0b, #ec4899, #06b6d4, #10b981)",
            color: "#0a0a0a",
            textShadow: "0 0 1px rgba(255,255,255,0.6)",
          }}
          title="Official tamper-evident micro-hologram security seal"
        >
          <span>✪</span>
          <span>{gradingCompany} SEAL</span>
        </div>

        <span className="text-[6px] tracking-tight text-slate-500">UV PROTECTED</span>
      </div>
    </div>
  );
}
