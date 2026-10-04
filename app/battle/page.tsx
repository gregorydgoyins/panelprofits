import { Metadata } from "next";
import { BattleArena } from "@/components/battle/battle-arena";
import { getAllSuperheroContenders } from "@/lib/battle/battle-engine";

export const metadata: Metadata = {
  title: "Multiverse Superhero Battle Arena | Panel Profits",
  description:
    "Simulate iconic cross-universe superhero battles that have never happened using canonical power stats, Fandom lore, and secondary market comic equity valuations.",
};

export default function BattlePage() {
  const contenders = getAllSuperheroContenders();

  return (
    <main className="min-h-screen bg-[#07090e] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <BattleArena initialContenders={contenders} />
    </main>
  );
}
