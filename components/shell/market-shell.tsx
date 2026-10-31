import * as React from "react";
import { Header } from "./header";
import { NewsRail } from "./news-rail";
import { ValuationRail } from "./valuation-rail";
import { MarketTelemetryRail } from "./market-telemetry-rail";
import { AssetsRail } from "./assets-rail";
import { EquitiesRail } from "./equities-rail";
import { DiaryRail } from "./diary-rail";
import { Footer } from "./footer";
import { getMarketTelemetry } from "@/lib/dashboard/queries";
import { getCanonicalAssetSurfaces } from "@/lib/equity/canonical-equities";
import { getCoveredBooksSlice, COVERED_BOOKS_TOTAL } from "@/lib/equity/covered-books";
import { calculateMarketIndices } from "@/lib/market/indices";
import { getNewsStories } from "@/lib/news/feed";
import { getCurrentUser } from "@/lib/account/queries";
import { getDiaryEntries } from "@/lib/panel-profits/queries";
import { RailVisibility } from "./rail-visibility";

interface MarketShellProps {
  children: React.ReactNode;
}

export async function MarketShell({ children }: MarketShellProps) {
  // Random start across the covered-books rail (seq is a stable shuffle, so any window is a mix of publishers/eras)
  const randomInitialOffset = Math.floor(Math.random() * COVERED_BOOKS_TOTAL);

  // Fetch fast bounded rails concurrently.
  // Note: EquitiesRail and AssetsRail now contain pre-calculated seed bundles
  // for instantaneous zero-latency first-paint and smooth GPU hydration.
  const userPromise = getCurrentUser();
  const diaryPromise = userPromise.then((user) => (user ? getDiaryEntries(user.id) : []));
  const [telemetry, newsStories, marketIndices, diaryEntries] = await Promise.all([
    getMarketTelemetry(),
    getNewsStories(32),
    calculateMarketIndices(),
    diaryPromise,
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-[#07080B] text-slate-100 antialiased selection:bg-purple-900 selection:text-purple-100">
      <Header />
      <RailVisibility setting="newsTicker"><NewsRail initialStories={newsStories} /></RailVisibility>
      <RailVisibility setting="marketTelemetry"><MarketTelemetryRail telemetry={telemetry} /></RailVisibility>
      <RailVisibility setting="equities"><EquitiesRail items={[]} indices={marketIndices} initialOffset={randomInitialOffset} /></RailVisibility>
      <RailVisibility setting="assets"><AssetsRail /></RailVisibility>
      <RailVisibility setting="diary"><DiaryRail entries={diaryEntries} /></RailVisibility>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
