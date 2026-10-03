"use client";

import * as React from "react";
import Link from "next/link";
import { Pin, PinOff } from "lucide-react";
import { getEraColors, getScarcityColors, getPublisherColor, withAlpha, type ScarcityTier } from "@/lib/design-system/colors";
import { SCARCITY_NEON, ASSET_CLASS_CONFIG } from "@/lib/equity/ticker-constants";
import { resolveProductionAge, formatEraLabel, getDelta, parseSeriesIssue } from "@/lib/equity/ticker-utils";
import { AnimatedPrice } from "@/components/shared/animated-price";
import type { EquityItem } from "@/lib/equity/ticker-types";

const EQUITY_CARD_STYLE_ID = "equity-card-shadow-kf";
if (typeof document !== "undefined" && !document.getElementById(EQUITY_CARD_STYLE_ID)) {
  const s = document.createElement("style");
  s.id = EQUITY_CARD_STYLE_ID;
  s.textContent = `
    .equity-card {
      box-shadow:
        0 8px 28px rgba(0,0,0,0.75),
        0 0  2px  color-mix(in srgb, var(--rim) 93%, transparent),
        0 0  10px color-mix(in srgb, var(--rim) 60%, transparent),
        0 0  28px color-mix(in srgb, var(--rim) 40%, transparent),
        0 0  56px color-mix(in srgb, var(--rim) 20%, transparent),
        inset 0 0 18px color-mix(in srgb, var(--rim) 17%, transparent);
    }
    .equity-card[data-hovered='true'] {
      box-shadow:
        0 32px 72px rgba(0,0,0,0.96),
        0 0  2px  var(--rim),
        0 0  10px var(--rim),
        0 0  28px var(--rim),
        0 0  56px color-mix(in srgb, var(--rim) 87%, transparent),
        0 0  100px color-mix(in srgb, var(--rim) 67%, transparent),
        0 0  160px color-mix(in srgb, var(--rim) 33%, transparent),
        inset 0 0 40px color-mix(in srgb, var(--rim) 33%, transparent);
    }
  `;
  document.head.appendChild(s);
}

export const EquityCard = React.memo(function EquityCard({
  item,
  index = 0,
}: {
  item: EquityItem;
  regime?: string | null;
  index?: number;
}) {
  const [hovered, setHovered] = React.useState(false);
  const [imgLoaded, setImgLoaded] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);
  const [isPinned, setIsPinned] = React.useState(false);

  const identity = item?.identity ?? ({} as any);
  const pricing = item?.pricing ?? ({} as any);

  const assetId = identity.assetId;

  React.useEffect(() => {
    if (!assetId || typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("hammer_pinned_equities");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.includes(assetId)) {
          setIsPinned(true);
        }
      }
    } catch {}
  }, [assetId]);

  const togglePin = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!assetId || typeof window === "undefined") return;
      try {
        const stored = localStorage.getItem("hammer_pinned_equities");
        const list: string[] = stored ? JSON.parse(stored) : [];
        let next: string[];
        if (list.includes(assetId)) {
          next = list.filter((id) => id !== assetId);
          setIsPinned(false);
        } else {
          next = [...list, assetId];
          setIsPinned(true);
        }
        localStorage.setItem("hammer_pinned_equities", JSON.stringify(next));
      } catch {}
    },
    [assetId]
  );

  const scarcityTier = (identity.scarcityTier || "common") as ScarcityTier;
  const scarcityColors = getScarcityColors(scarcityTier);

  const rawProductionAge = identity.productionAge;
  const volumeEra =
    rawProductionAge && rawProductionAge !== "unknown"
      ? rawProductionAge
      : resolveProductionAge(identity.year);
  const eraColors = getEraColors(volumeEra);

  const delta = getDelta(pricing.delta_24 ?? pricing.delta_30 ?? pricing.delta_90);
  const { series: rawSeries, issueNum } = parseSeriesIssue(identity.productName || "");

  const variantTag = typeof identity.variant === "string" && identity.variant !== "standard" ? identity.variant : null;
  const series = rawSeries.replace(/\s*\[[^\]]*\]\s*/g, " ").trim();
  const hasVariant = Boolean(variantTag);

  const rawGrade = String(pricing.grade ?? "RAW");
  const isRawCopy = !rawGrade || rawGrade === "RAW" || rawGrade.toUpperCase() === "RAW";
  const isTrueVariant = Boolean(variantTag && !["direct", "base", "regular"].includes(variantTag.toLowerCase()));

  const priceTierClass = (usd: number) => ((usd || 0) >= 45 ? "PREMIUM" : (usd || 0) >= 20 ? "STD" : "OTC");
  const isSovereign = identity.isSovereign === true;
  const marketPriceClass = identity.marketPriceClass || priceTierClass(pricing.fmv_usd);

  const displayAssetClass: string | null = isRawCopy
    ? "RAW"
    : isTrueVariant
    ? "VAR"
    : isSovereign && rawGrade === "9.8"
    ? "SOV"
    : marketPriceClass;

  const coverUrl = item?.coverImageUrl || null;
  const borderColor = eraColors.border;
  const rimColor = borderColor;
  const rim = (a: number) => withAlpha(rimColor, a);

  if (!coverUrl || imgError) {
    return null;
  }

  const cardStyle: React.CSSProperties = {
    width: "215px",
    minWidth: "215px",
    height: "375px",
    borderRadius: "6px",
    border: hovered ? `2px solid ${rim(1)}` : `2px solid ${rim(0.8)}`,
    transform: hovered
      ? "translateY(-12px) scale(1.02) perspective(700px) rotateX(2deg) rotateY(-1deg)"
      : "none",
    transition: "transform 260ms cubic-bezier(0.22, 1, 0.36, 1), border-color 260ms cubic-bezier(0.22, 1, 0.36, 1)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    position: "relative",
    cursor: "pointer",
    backgroundColor: "#060a12",
    flexShrink: 0,
    outline: "none",
    ["--rim" as string]: rimColor,
  };

  const detailHref = identity.detailUrl || `/equity/${assetId || "CE70"}`;

  return (
    <Link
      href={detailHref}
      className="equity-card"
      data-hovered={hovered ? "true" : "false"}
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Cover zone ─────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          width: "100%",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          paddingTop: "4px",
          backgroundColor: "#060a12",
        }}
      >
        {/* Neutral loading skeleton (only before image load, zero placeholder graphics) */}
        {!imgLoaded && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "#0a0f1e",
            }}
          />
        )}

        {/* Pin button — visible on hover or when pinned */}
        {assetId && (hovered || isPinned) && (
          <div
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              zIndex: 30,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <button
              onClick={togglePin}
              title={isPinned ? "Unpin from watchlist" : "Pin to watchlist"}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 22,
                height: 22,
                borderRadius: 3,
                cursor: "pointer",
                border: isPinned ? "1px solid rgba(250,204,21,0.6)" : "1px solid rgba(255,255,255,0.25)",
                background: isPinned ? "rgba(250,204,21,0.18)" : "rgba(6,10,18,0.72)",
                color: isPinned ? "#facc15" : "rgba(255,255,255,0.75)",
                backdropFilter: "blur(4px)",
              }}
            >
              {isPinned ? <PinOff style={{ width: 11, height: 11 }} /> : <Pin style={{ width: 11, height: 11 }} />}
            </button>
          </div>
        )}

        {/* Cover image */}
        {coverUrl && !imgError && (
          <img
            src={coverUrl}
            alt={series}
            loading={index < 8 ? "eager" : "lazy"}
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
              display: "block",
              opacity: imgLoaded ? 1 : 0,
              transition: "opacity 350ms ease",
            }}
          />
        )}

        {/* Depth vignette at base */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "18px",
            background: "linear-gradient(0deg, rgba(6,10,18,0.55) 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* ── Info strip ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          backgroundColor: "#060a12",
          borderTop: `1px solid ${withAlpha(rimColor, 0.133)}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Publisher / era header */}
        {(() => {
          const rawPub = identity.publisher || "";
          const publisher = /^unknown$/i.test(rawPub) ? "" : rawPub.replace(/\s+Comics$/i, "");
          const pubColor = getPublisherColor(rawPub);
          const pubColorIsHex = pubColor.startsWith("#");
          const pubBg = pubColorIsHex ? withAlpha(pubColor, 0.8) : pubColor;
          return (
            <div
              style={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingInline: "10px",
                height: "20px",
                backgroundColor: withAlpha(borderColor, 0.533),
                borderBottom: `1px solid ${withAlpha(borderColor, 0.333)}`,
              }}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "8px",
                  letterSpacing: "0.14em",
                  color: "rgba(255,255,255,0.95)",
                  textTransform: "uppercase",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "55%",
                  backgroundColor: pubBg,
                  padding: publisher ? "1px 5px" : undefined,
                  borderRadius: "2px",
                }}
              >
                {publisher || "\u00A0"}
              </span>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "7.5px",
                  letterSpacing: "0.08em",
                  color: "rgba(255,255,255,0.85)",
                  textTransform: "uppercase",
                  flexShrink: 0,
                }}
              >
                {formatEraLabel(volumeEra)}
              </span>
            </div>
          );
        })()}

        <div style={{ padding: "3px 10px 7px", display: "flex", flexDirection: "column", gap: "2px" }}>
          {/* Title + pub year */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "4px", overflow: "hidden" }}>
            <span
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "#f1f5f9",
                fontFamily: "var(--font-sans, system-ui)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flexShrink: 1,
                lineHeight: 1.2,
                minWidth: 0,
              }}
            >
              {series}
              {issueNum ? ` #${issueNum}` : ""}
            </span>
            {identity.year && (
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.50)",
                  fontFamily: "var(--font-sans, system-ui)",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  marginLeft: "auto",
                }}
              >
                ({identity.year})
              </span>
            )}
          </div>

          {/* Variant description */}
          <div style={{ minHeight: hasVariant ? "16px" : "0px" }}>
            {hasVariant && (
              <span
                style={{
                  fontSize: "11.5px",
                  fontWeight: 400,
                  color: "#f1f5f9",
                  fontFamily: "var(--font-sans, system-ui)",
                  fontStyle: "italic",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                  lineHeight: "16px",
                }}
              >
                {variantTag}
              </span>
            )}
          </div>

          {/* FMV price + delta */}
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "6px" }}>
            <AnimatedPrice
              value={pricing.fmv_usd}
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#fff",
                fontFamily: "var(--font-sans, system-ui)",
                letterSpacing: "-0.2px",
                lineHeight: 1.2,
              }}
            />
            <span
              style={{
                fontSize: "10px",
                color: delta.color,
                fontFamily: "var(--font-sans, system-ui)",
                fontWeight: 500,
                flexShrink: 0,
              }}
            >
              {delta.arrow} {delta.text}
            </span>
          </div>

          {/* Pills: scarcity · grade · asset class */}
          <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
            {(() => {
              const neon = SCARCITY_NEON[scarcityTier] ?? "#94a3b8";
              return (
                <span
                  style={{
                    fontSize: "8px",
                    fontFamily: "var(--font-sans, system-ui)",
                    fontWeight: 500,
                    color: neon,
                    backgroundColor: withAlpha(neon, 0.133),
                    border: `1px solid ${withAlpha(neon, 0.533)}`,
                    borderRadius: "2px",
                    padding: "1px 4px",
                    lineHeight: "14px",
                    flexShrink: 0,
                    letterSpacing: "0.2px",
                  }}
                >
                  {scarcityColors.label}
                </span>
              );
            })()}
            {identity.assetId && (
              <span
                style={{
                  fontSize: "8px",
                  fontFamily: "monospace",
                  fontWeight: 600,
                  color: "#38bdf8",
                  backgroundColor: "rgba(56,189,248,0.12)",
                  border: "1px solid rgba(56,189,248,0.3)",
                  borderRadius: "2px",
                  padding: "1px 4px",
                  lineHeight: "14px",
                  flexShrink: 0,
                }}
              >
                {identity.assetId}
              </span>
            )}
            {!isRawCopy && (
              <span
                style={{
                  fontSize: "8px",
                  fontFamily: "var(--font-sans, system-ui)",
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.85)",
                  border: "1px solid rgba(255,255,255,0.30)",
                  borderRadius: "2px",
                  padding: "1px 4px",
                  lineHeight: "14px",
                  flexShrink: 0,
                  letterSpacing: "0.2px",
                }}
              >
                {pricing.grade}
              </span>
            )}
            {displayAssetClass && ASSET_CLASS_CONFIG[displayAssetClass] && (
              <span
                title={`${ASSET_CLASS_CONFIG[displayAssetClass].fullName} | Venue: ${ASSET_CLASS_CONFIG[displayAssetClass].venue} | Margin Haircut: ${ASSET_CLASS_CONFIG[displayAssetClass].marginHaircut} | ${ASSET_CLASS_CONFIG[displayAssetClass].description}`}
                style={{
                  fontSize: "8px",
                  fontFamily: "var(--font-sans, system-ui)",
                  fontWeight: 500,
                  color: ASSET_CLASS_CONFIG[displayAssetClass].color,
                  border: `1px solid ${withAlpha(ASSET_CLASS_CONFIG[displayAssetClass].color, 0.4)}`,
                  borderRadius: "2px",
                  padding: "1px 4px",
                  lineHeight: "14px",
                  flexShrink: 0,
                  letterSpacing: "0.2px",
                  cursor: "help",
                }}
              >
                {ASSET_CLASS_CONFIG[displayAssetClass].label}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
});
