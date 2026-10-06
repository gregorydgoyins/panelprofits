"use client";

import * as React from "react";
import Link from "next/link";
import { Pin, PinOff } from "lucide-react";
import { getEraColors, getScarcityColors, getPublisherColor, withAlpha, type ScarcityTier } from "@/lib/design-system/colors";
import { SCARCITY_NEON, ASSET_CLASS_CONFIG } from "@/lib/equity/ticker-constants";
import { resolveProductionAge, formatEraLabel, getDelta, parseSeriesIssue } from "@/lib/equity/ticker-utils";
import { AnimatedPrice } from "@/components/shared/animated-price";
import { formatComicEquityTicker } from "@/lib/equity/ticker-formatting";
import { resolveAuthoritativePublisher } from "@/lib/comics/publisher-authority";
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
  const isTrueVariant = Boolean(variantTag && !["direct", "base", "regular", "standard"].includes(variantTag.toLowerCase()));

  // Pure canonical exchange ticker:
  const rawTickerCandidate = String(identity.assetId || (item as any)?.ticker || "")
    .replace(/^\$/, "")
    .replace(/\.(SOV|ANC|STD|OTC|PREMIUM)$/i, "")
    .trim();

  const isInvalidTicker =
    !rawTickerCandidate ||
    /^CE70/i.test(rawTickerCandidate) ||
    /^(RAW|SOV|STD|OTC|PREMIUM|NULL|UNDEFINED|UNKNOWN|UNPRICED)$/i.test(rawTickerCandidate) ||
    /^(eq-|ppix-|seat-|landmark-|comic-)/i.test(rawTickerCandidate) ||
    /^[0-9a-f]{12,}$/i.test(rawTickerCandidate) ||
    rawTickerCandidate.length > 8;

  const effectiveTicker = (
    !isInvalidTicker
      ? rawTickerCandidate
      : formatComicEquityTicker(series, issueNum)
  )
    .replace(/^\$/, "")
    .replace(/\.(SOV|ANC|STD|OTC|PREMIUM)$/i, "")
    .toUpperCase();

  // Newsstand, Reprint, Variant and Sovereign distinctions:
  const isNewsstand = identity.editionForm === "NEWSSTAND" || Boolean(variantTag && variantTag.toLowerCase().includes("newsstand"));
  const isReprint = identity.editionForm === "REPRINT" || Boolean(variantTag && (variantTag.toLowerCase().includes("print") || variantTag.toLowerCase().includes("printing")));
  const isOtherVariant = isTrueVariant && !isNewsstand && !isReprint;

  // Strict Sovereign check: "soverign is a direct universal bluelabel 9.8 comic"
  const isProvenSovereign = identity.isSovereign === true && pricing.grade === "9.8" && !isTrueVariant && !isNewsstand && !isReprint;

  const coverUrl = item?.coverImageUrl || null;
  React.useEffect(() => {
    setImgLoaded(false);
    setImgError(false);
  }, [coverUrl]);

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

  const detailHref =
    identity.detailUrl ||
    (effectiveTicker ? `/comics/${encodeURIComponent(effectiveTicker)}` : `/equity/${assetId || "CE70"}`);

  return (
    <Link
      href={detailHref}
      prefetch={false}
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
            draggable={false}
            onLoad={() => React.startTransition(() => setImgLoaded(true))}
            onError={() => React.startTransition(() => setImgError(true))}
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
              pointerEvents: "none",
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
          const publisher = resolveAuthoritativePublisher(series, rawPub);
          const pubColor = getPublisherColor(publisher);
          const pubColorIsHex = pubColor.startsWith("#");
          const pubBg = pubColorIsHex ? withAlpha(pubColor, 0.85) : pubColor;
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

          {/* Variant description or Key Debut badge */}
          <div style={{ minHeight: (hasVariant || identity.keyBadge || identity.writer) ? "16px" : "0px" }}>
            {hasVariant ? (
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
            ) : identity.keyBadge ? (
              <span
                style={{
                  fontSize: "10.5px",
                  fontWeight: 600,
                  color: "#f59e0b",
                  fontFamily: "var(--font-sans, system-ui)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                  lineHeight: "16px",
                }}
              >
                ★ {identity.keyBadge}
              </span>
            ) : identity.writer ? (
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.70)",
                  fontFamily: "var(--font-sans, system-ui)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                  lineHeight: "16px",
                }}
              >
                {identity.writer}{identity.penciler && identity.penciler !== identity.writer ? ` • ${identity.penciler}` : ""}
              </span>
            ) : null}
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
              title="24-hour recorded secondary market sales delta"
              style={{
                fontSize: "10px",
                color: delta.color,
                fontFamily: "var(--font-sans, system-ui)",
                fontWeight: 500,
                flexShrink: 0,
                display: "inline-flex",
                alignItems: "center",
                gap: "2px",
              }}
            >
              <span style={{ fontSize: "8px", opacity: 0.65, fontWeight: 600, letterSpacing: "0.04em" }}>24H</span>
              <span>{delta.arrow}</span>
              <span>{delta.text}</span>
            </span>
          </div>

          {/* Bottom Card Strip: Dedicated Bold Exchange Ticker Badge + Certification / Scarcity Badges */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "4px",
              marginTop: "2px",
              paddingTop: "2px",
            }}
          >
            {/* Bold Guaranteed Exchange Ticker */}
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#38bdf8",
                backgroundColor: "rgba(56,189,248,0.14)",
                border: "1px solid rgba(56,189,248,0.45)",
                borderRadius: "3px",
                padding: "1px 6px",
                lineHeight: "15px",
                flexShrink: 0,
                textTransform: "uppercase",
              }}
            >
              ${effectiveTicker}
            </span>

            {/* Right Badges: Scarcity · Grade · Sovereign */}
            <div style={{ display: "flex", alignItems: "center", gap: "3px", flexShrink: 0 }}>
              {(() => {
                const neon = SCARCITY_NEON[scarcityTier] ?? "#94a3b8";
                return (
                  <span
                    style={{
                      fontSize: "8px",
                      fontFamily: "var(--font-sans, system-ui)",
                      fontWeight: 600,
                      color: neon,
                      backgroundColor: withAlpha(neon, 0.12),
                      border: `1px solid ${withAlpha(neon, 0.45)}`,
                      borderRadius: "2px",
                      padding: "1px 4px",
                      lineHeight: "13px",
                      letterSpacing: "0.2px",
                    }}
                  >
                    {scarcityColors.label}
                  </span>
                );
              })()}
              {/* Condition / Grade Badge */}
              <span
                title={isRawCopy ? "Ungraded / Loose physical copy" : `CGC/CBCS certified grade ${pricing.grade}`}
                style={{
                  fontSize: "8px",
                  fontFamily: "var(--font-sans, system-ui)",
                  fontWeight: 600,
                  color: isRawCopy ? "#f59e0b" : "rgba(255,255,255,0.9)",
                  border: isRawCopy ? "1px solid rgba(245,158,11,0.5)" : "1px solid rgba(255,255,255,0.30)",
                  backgroundColor: isRawCopy ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.06)",
                  borderRadius: "2px",
                  padding: "1px 4px",
                  lineHeight: "13px",
                  letterSpacing: "0.2px",
                }}
              >
                {isRawCopy ? "RAW" : pricing.grade}
              </span>

              {/* Scarcity / Edition / Sovereign Badge */}
              {isProvenSovereign ? (
                <span
                  title="Verified Sovereign Copy: Authenticated CE70 benchmark constituent"
                  style={{
                    fontSize: "8px",
                    fontFamily: "var(--font-sans, system-ui)",
                    fontWeight: 700,
                    color: "#f59e0b",
                    backgroundColor: "rgba(245,158,11,0.18)",
                    border: "1px solid rgba(245,158,11,0.6)",
                    borderRadius: "2px",
                    padding: "1px 4px",
                    lineHeight: "13px",
                    letterSpacing: "0.3px",
                  }}
                >
                  SOV
                </span>
              ) : isNewsstand ? (
                <span
                  title="Certified Newsstand Edition"
                  style={{
                    fontSize: "8px",
                    fontFamily: "var(--font-sans, system-ui)",
                    fontWeight: 700,
                    color: "#34d399",
                    backgroundColor: "rgba(52,211,153,0.18)",
                    border: "1px solid rgba(52,211,153,0.6)",
                    borderRadius: "2px",
                    padding: "1px 4px",
                    lineHeight: "13px",
                    letterSpacing: "0.2px",
                  }}
                >
                  NEWS
                </span>
              ) : isReprint ? (
                <span
                  title="Certified Subsequent Printing"
                  style={{
                    fontSize: "8px",
                    fontFamily: "var(--font-sans, system-ui)",
                    fontWeight: 700,
                    color: "#38bdf8",
                    backgroundColor: "rgba(56,189,248,0.18)",
                    border: "1px solid rgba(56,189,248,0.6)",
                    borderRadius: "2px",
                    padding: "1px 4px",
                    lineHeight: "13px",
                    letterSpacing: "0.2px",
                  }}
                >
                  {variantTag && variantTag.toLowerCase().includes("3rd") ? "3RD" : "2ND"}
                </span>
              ) : isOtherVariant ? (
                <span
                  title="Certified Variant Edition"
                  style={{
                    fontSize: "8px",
                    fontFamily: "var(--font-sans, system-ui)",
                    fontWeight: 600,
                    color: "#a78bfa",
                    backgroundColor: "rgba(167,139,250,0.14)",
                    border: "1px solid rgba(167,139,250,0.45)",
                    borderRadius: "2px",
                    padding: "1px 4px",
                    lineHeight: "13px",
                    letterSpacing: "0.2px",
                  }}
                >
                  VAR
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});
