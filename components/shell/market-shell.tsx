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
import { getSovereignEquities, getCanonicalAssetSurfaces } from "@/lib/equity/canonical-equities";
import { calculateMarketIndices } from "@/lib/market/indices";
import { getNewsStories } from "@/lib/news/feed";
import { getCurrentUser } from "@/lib/account/queries";
import { getDiaryEntries } from "@/lib/panel-profits/queries";
import { headers } from "next/headers";
import { AuthFrontDoor } from "@/components/auth/front-door";
import { RailVisibility } from "./rail-visibility";

interface MarketShellProps {
  children: React.ReactNode;
}

export async function MarketShell({ children }: MarketShellProps) {
  const requestHeaders = await headers();
  const pathname = requestHeaders.get("x-panel-profits-path") || "";
  const isFrontDoor = pathname === "/sign-in" || pathname === "/sign-up";
  if (isFrontDoor) return <AuthFrontDoor>{children}</AuthFrontDoor>;

  // Fetch bounded rails concurrently
  const user = await getCurrentUser();
  const [telemetry, newsStories, assetSurfaces, sovereignEquities, marketIndices, diaryEntries] = await Promise.all([
    getMarketTelemetry(),
    getNewsStories(32),
    getCanonicalAssetSurfaces(70),
    getSovereignEquities(150),
    calculateMarketIndices(),
    user ? getDiaryEntries(user.id) : Promise.resolve([]),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-[#07080B] text-slate-100 antialiased selection:bg-purple-900 selection:text-purple-100">
      <Header />
      <RailVisibility setting="newsTicker"><NewsRail initialStories={newsStories} /></RailVisibility>
      <RailVisibility setting="marketTelemetry"><MarketTelemetryRail telemetry={telemetry} /></RailVisibility>
      <RailVisibility setting="equities"><EquitiesRail items={sovereignEquities} indices={marketIndices} /></RailVisibility>
      <RailVisibility setting="assets"><AssetsRail items={assetSurfaces} /></RailVisibility>
      <RailVisibility setting="diary"><DiaryRail entries={diaryEntries} /></RailVisibility>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
