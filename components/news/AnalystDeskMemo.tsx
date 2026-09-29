"use client";

import * as React from "react";
import Link from "next/link";
import { UserCheck, TrendingUp, TrendingDown, Minus, Target, Award, Compass, AlertCircle } from "lucide-react";
import {
  selectAuthorForStory,
  generateAuthorMarketPrediction,
  type AuthorPersona,
  type AuthorMarketPrediction,
} from "@/lib/news/authors";
import type { CatalystAnalysis } from "@/lib/news/catalyst";

interface AnalystDeskMemoProps {
  storyId: string;
  source: string;
  headline: string;
  summary: string | null;
  catalyst: CatalystAnalysis;
}

export function AnalystDeskMemo({
  storyId,
  source,
  headline,
  summary,
  catalyst,
}: AnalystDeskMemoProps) {
  const author: AuthorPersona = React.useMemo(() => {
    return selectAuthorForStory(source, storyId);
  }, [source, storyId]);

  const prediction: AuthorMarketPrediction = React.useMemo(() => {
    return generateAuthorMarketPrediction(storyId, source, headline, summary);
  }, [storyId, source, headline, summary]);

  // Derive the 3-Point Memo deterministically from Author Persona + Catalyst
  const memoPoints = React.useMemo(() => {
    // 1. Catalyst & Narrative Thesis
    const thesis =
      catalyst.catalystType === "CASTING_ATTACHMENT"
        ? `Talent contract confirmation directly validates long-term multi-picture character positioning. ${author.writingStyle.introStyle} In historical production cycles, studio talent lock-ins produce immediate front-month speculative demand across key debut issues.`
        : catalyst.catalystType === "AUCTION_RECORD"
        ? `Benchmark high-water mark establishes a new nominal floor for investment-grade census copies. ${author.writingStyle.introStyle} This clearing price signals high-net-worth capital absorption and reinforces physical comic equities as an alternative asset class.`
        : catalyst.catalystType === "OPTION_RIGHTS"
        ? `IP acquisition initiates the standard option-to-screen timeline. ${author.writingStyle.introStyle} Historical data demonstrates maximum equity appreciation occurs between option execution and initial teaser trailer drop.`
        : catalyst.catalystType === "PRINT_SELLOUT"
        ? `Primary distributor exhaustion confirms retail demand exceeds initial solicitations. ${author.writingStyle.introStyle} Immediate reprint announcements cap short-term runaway raw spikes while cementing first printing scarcity.`
        : `${author.writingStyle.introStyle} This industry development shifts reader engagement metrics and downstream secondary market velocity.`;

    // 2. Secondary Market & Census Implication
    const secondaryImplication =
      catalyst.marketImpact === "BULLISH"
        ? `Expect immediate bidding volume escalation on third-party graded (CGC/CBCS 9.8) registry sets. ${author.writingStyle.implicationAngle} Raw uncertified copies in fine-to-near-mint conditions will experience dealer markups across online marketplaces within 48 hours.`
        : catalyst.marketImpact === "VOLATILITY"
        ? `Expect high turnover and widening bid-ask spreads. ${author.writingStyle.implicationAngle} Speculative momentum will be intense but subject to rapid consolidation once initial news cycle settles.`
        : catalyst.marketImpact === "BEARISH"
        ? `Downward pricing pressure expected on high-grade inventory. ${author.writingStyle.implicationAngle} Collectors holding speculative positions should re-evaluate stop-loss thresholds before retail liquidity thins.`
        : `Stable trading ranges expected. ${author.writingStyle.implicationAngle} Sovereign blue chips will maintain floor prices without notable supply dilution.`;

    // 3. Institutional Execution Directive
    const directive =
      catalyst.catalystType === "CASTING_ATTACHMENT" && catalyst.marketImpact === "BULLISH"
        ? {
            action: "TACTICAL ACCUMULATION",
            badgeClass: "bg-emerald-950/60 border-emerald-500/50 text-emerald-300",
            guidance:
              "Target high-grade 9.6-9.8 certified landmark keys. For unslabbed inventory, acquire high-grade raw copies for immediate grading submission ahead of first official trailer footage.",
          }
        : catalyst.catalystType === "AUCTION_RECORD"
        ? {
            action: "HOLD BLUE CHIPS / MONITOR CENSUS",
            badgeClass: "bg-cyan-950/60 border-cyan-500/50 text-cyan-300",
            guidance:
              "Maintain core portfolio positions in Silver and Bronze Age keys. Do not chase secondary copies at inflated immediate post-auction premiums; allow secondary market to establish confirmed support.",
          }
        : catalyst.marketImpact === "VOLATILITY"
        ? {
            action: "STRATEGIC HEDGING",
            badgeClass: "bg-cyan-950/60 border-cyan-500/50 text-cyan-300",
            guidance:
              "Take partial liquidity on recent speculative run-ups. Reallocate capital into certified blue chips with deep 10-year price histories.",
          }
        : {
            action: "OBSERVE SECONDARY VELOCITY",
            badgeClass: "bg-slate-800 border-slate-700 text-slate-300",
            guidance:
              "Track weekly eBay and Heritage auction cleared lots for confirmation of sustained buyer demand before deploying substantial portfolio liquidity.",
          };

    return {
      thesis,
      secondaryImplication,
      directive,
    };
  }, [catalyst, author]);

  return (
    <div className="mt-6 rounded-lg border border-slate-800 bg-[#06080F] p-5 shadow-xl">
      {/* Analyst Desk Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-md"
            style={{ backgroundColor: author.avatarColor }}
          >
            {author.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-100">{author.name}</span>
              <span
                className={`rounded border px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider font-semibold ${author.badgeBg} ${author.badgeBorder} ${author.badgeText}`}
              >
                {author.role}
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">
              Beat: <span className="text-slate-300">{author.beat}</span> · Seniority: {author.yearsExperience} yrs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded bg-slate-900 border border-slate-800 px-2 py-1 text-[10px] font-mono text-slate-400">
            Desk Accuracy: <strong className="text-cyan-400">{prediction.historicalAccuracyScore}</strong>
          </span>
          <span className="rounded bg-cyan-950/60 border border-cyan-500/40 px-2 py-1 text-[10px] font-mono text-cyan-300 font-semibold uppercase">
            3-POINT MEMO
          </span>
        </div>
      </div>

      {/* 3-Point Memo Structure */}
      <div className="mt-4 space-y-4">
        {/* Point 1: Narrative & Industry Thesis */}
        <div className="rounded border border-slate-800/80 bg-[#090D17] p-3.5">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold mb-1.5">
            <Target className="h-3.5 w-3.5 text-cyan-400" />
            <span>Point 1: Catalyst & Narrative Thesis</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-300">{memoPoints.thesis}</p>
        </div>

        {/* Point 2: Secondary Market & Census Implication */}
        <div className="rounded border border-slate-800/80 bg-[#090D17] p-3.5">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold mb-1.5">
            <Compass className="h-3.5 w-3.5 text-cyan-400" />
            <span>Point 2: Secondary Market & Census Implication</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-300">{memoPoints.secondaryImplication}</p>
        </div>

        {/* Point 3: Institutional Execution Directive */}
        <div className="rounded border border-slate-800/80 bg-[#090D17] p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              <Award className="h-3.5 w-3.5 text-cyan-400" />
              <span>Point 3: Institutional Trading Directive</span>
            </div>
            <span
              className={`rounded border px-2 py-0.5 text-[9px] font-mono font-bold tracking-wider uppercase ${memoPoints.directive.badgeClass}`}
            >
              {memoPoints.directive.action}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-slate-300">{memoPoints.directive.guidance}</p>
        </div>
      </div>

      {/* Market Asset Ripple Predictions */}
      {prediction.ripples.length > 0 && (
        <div className="mt-4 border-t border-slate-800/80 pt-3">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2">
            <span>Projected Asset Ripples & Ticker Movement:</span>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {prediction.ripples.map((ripple) => (
              <div
                key={ripple.ticker}
                className="flex items-center justify-between gap-2 rounded border border-slate-800 bg-[#090C14] px-2.5 py-1.5 text-[11px]"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-cyan-400">{ripple.ticker}</span>
                    <span className="text-[10px] text-slate-400 truncate">{ripple.assetName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 font-mono font-bold">
                  {ripple.direction === "up" ? (
                    <span className="flex items-center text-emerald-400 text-[10px]">
                      <TrendingUp className="h-3 w-3 mr-0.5" />
                      +{ripple.percentageDelta}
                    </span>
                  ) : ripple.direction === "down" ? (
                    <span className="flex items-center text-rose-400 text-[10px]">
                      <TrendingDown className="h-3 w-3 mr-0.5" />
                      -{ripple.percentageDelta}
                    </span>
                  ) : (
                    <span className="flex items-center text-slate-400 text-[10px]">
                      <Minus className="h-3 w-3 mr-0.5" />
                      {ripple.percentageDelta}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
