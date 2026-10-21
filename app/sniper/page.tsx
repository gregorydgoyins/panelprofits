import { Metadata } from "next";
import { SniperGameContainer } from "@/components/sniper/game/SniperGameContainer";

export const metadata: Metadata = {
  title: "Sniper Underwriting Simulator | Comic Book Stock Exchange",
  description:
    "Master secondary comic market underwriting through authentic countdown auctions, verified price ladders, and Graham & Dodd margin of safety principles.",
};

export default function SniperPage() {
  return (
    <main className="min-h-screen bg-[#04060A] text-slate-100 pb-16">
      <SniperGameContainer />
    </main>
  );
}
