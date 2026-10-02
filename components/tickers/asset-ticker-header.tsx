"use client";

import * as React from "react";
import {
  FAMILY_ORDER,
  FAMILY_MEMBERS,
  FAMILY_HEADER,
  type FamilyKey,
  type SurfaceKey,
} from "@/lib/assets/surfaceConfig";

interface AssetTickerHeaderProps {
  totalShowing: number;
  tickId?: number;
  surfaceCounts?: Partial<Record<SurfaceKey, number>>;
  stalled?: boolean;
  selectedFamily?: string | null;
  onFamilySelect?: (family: string | null) => void;
  onRetry?: () => void;
}

export function AssetTickerHeader({
  totalShowing,
  surfaceCounts = {},
  stalled = false,
  selectedFamily = null,
  onFamilySelect,
  onRetry,
}: AssetTickerHeaderProps) {
  const [activeTooltip, setActiveTooltip] = React.useState<string | null>(null);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "5px 14px",
        overflowX: "auto",
        scrollbarWidth: "none",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        backgroundColor: "#080c18",
        position: "relative",
        zIndex: 10,
        flexShrink: 0,
      }}
    >
      {/* Live pulse dot */}
      {stalled ? (
        <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#f59e0b",
              boxShadow: "0 0 6px #f59e0baa",
            }}
          />
          <span
            style={{
              fontSize: "10px",
              color: "#f59e0b",
              fontFamily: "monospace",
              textTransform: "uppercase",
            }}
          >
            Stalled
          </span>
          {onRetry && (
            <button
              onClick={onRetry}
              style={{
                fontSize: "9px",
                color: "#f59e0b",
                border: "1px solid rgba(245,158,11,0.4)",
                borderRadius: "3px",
                padding: "1px 6px",
                backgroundColor: "rgba(245,158,11,0.1)",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#38bdf8",
              boxShadow: "0 0 6px #38bdf899",
            }}
            className="animate-pulse"
          />
        </div>
      )}

      {/* Title */}
      <span
        style={{
          fontSize: "12px",
          fontFamily: "var(--font-sans, system-ui)",
          fontWeight: 600,
          color: "#38bdf8",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        Asset Market
      </span>

      {totalShowing > 0 && (
        <>
          <span style={{ fontSize: "11px", color: "#334155", flexShrink: 0 }}>·</span>
          <span
            style={{
              fontSize: "10px",
              color: "#64748b",
              fontFamily: "monospace",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {totalShowing} surfaces
          </span>
        </>
      )}

      <div style={{ width: "1px", height: "12px", backgroundColor: "rgba(255,255,255,0.1)", flexShrink: 0, margin: "0 2px" }} />

      {/* Family Chips */}
      {FAMILY_ORDER.map((familyKey) => {
        const meta = FAMILY_HEADER[familyKey];
        const members = FAMILY_MEMBERS[familyKey];
        const count = members.reduce((acc, k) => acc + (surfaceCounts[k] ?? 1), 0);
        const isSelected = selectedFamily === familyKey;

        return (
          <div
            key={familyKey}
            style={{ position: "relative", flexShrink: 0 }}
            onMouseEnter={() => setActiveTooltip(familyKey)}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <button
              onClick={() => onFamilySelect?.(isSelected ? null : familyKey)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "3px 8px",
                borderRadius: "3px",
                cursor: "pointer",
                backgroundColor: isSelected ? meta.accent + "33" : meta.bg,
                border: `1px solid ${isSelected ? meta.accent : meta.accent + "66"}`,
                transition: "all 150ms ease",
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: meta.accent,
                  boxShadow: `0 0 5px ${meta.accent}80`,
                }}
              />
              <span
                style={{
                  fontSize: "9.5px",
                  fontFamily: "var(--font-sans, system-ui)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: isSelected ? "#fff" : "rgba(255,255,255,0.9)",
                  whiteSpace: "nowrap",
                }}
              >
                {meta.label}
              </span>
              <span
                style={{
                  fontSize: "8.5px",
                  fontFamily: "monospace",
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                {count}
              </span>
            </button>

            {/* Hover Tooltip Breakdown */}
            {activeTooltip === familyKey && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  marginTop: "6px",
                  zIndex: 9999,
                  minWidth: "140px",
                  backgroundColor: "#0a1020",
                  border: `1px solid ${meta.accent}40`,
                  borderRadius: "6px",
                  padding: "8px 10px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.8)",
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    fontSize: "8px",
                    fontFamily: "var(--font-sans, system-ui)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: meta.accent,
                    marginBottom: "4px",
                  }}
                >
                  {meta.label} SURFACES
                </div>
                {members.map((k) => (
                  <div
                    key={k}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "2px 0",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "9px",
                        fontFamily: "monospace",
                        color: "rgba(210,220,245,0.70)",
                        textTransform: "uppercase",
                      }}
                    >
                      {k.replace(/_/g, " ")}
                    </span>
                    <span
                      style={{
                        fontSize: "9px",
                        fontFamily: "monospace",
                        color: "rgba(255,255,255,0.7)",
                      }}
                    >
                      {surfaceCounts[k] ?? 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
