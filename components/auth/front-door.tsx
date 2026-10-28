"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Clock3, LogIn, X } from "lucide-react";

function getMarketState(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const weekday = parts.find((part) => part.type === "weekday")?.value;
  const hours = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minutesPart = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  const minutes = hours * 60 + minutesPart;
  if (weekday === "Sat" || weekday === "Sun") return { label: "WEEKEND · CLOSED", detail: "The exchange floor is quiet. Research, collect, and prepare." };
  if (minutes < 570) return { label: "PRE-MARKET", detail: "Orders are forming. The opening bell is approaching." };
  if (minutes < 960) return { label: "MARKET OPEN", detail: "The floor is live. Prices, risk, and conviction are moving." };
  if (minutes < 1200) return { label: "AFTER-HOURS", detail: "The bell has closed the main session. The desk remains active." };
  return { label: "CLOSED", detail: "The floor is closed. The next session begins with preparation." };
}

function FloorMotion() {
  return <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#030508]" aria-hidden="true">
    <video className="absolute inset-0 h-full w-full object-cover opacity-80 saturate-[.75] contrast-[1.08]" autoPlay loop muted playsInline preload="auto" poster="/brand/panel-profits-mark.svg">
      <source src="/media/CBSE_30s_Cinematic_Loop.mp4" type="video/mp4" />
    </video>
    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,7,12,.72),rgba(2,4,8,.16)_48%,rgba(2,3,8,.72)),linear-gradient(0deg,rgba(2,3,6,.82),transparent_42%,rgba(2,3,6,.3))]" />
    <div className="floor-scan absolute inset-y-0 left-[-12%] w-[12%] bg-cyan-200/[0.07] blur-2xl" />
  </div>;
}
function MarketStatus() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { const update = () => setNow(new Date()); update(); const id = window.setInterval(update, 30_000); return () => window.clearInterval(id); }, []);
  const state = useMemo(() => getMarketState(now || new Date()), [now]);
  const clock = now ? new Intl.DateTimeFormat("en-GB", { timeZone: "America/New_York", hour: "2-digit", minute: "2-digit", hour12: false }).format(now) : "--:--";
  return <div className="relative z-10 flex h-full w-full max-w-[245px] flex-col justify-center border-l border-cyan-300/65 bg-[#050b13]/65 px-4 py-3 shadow-[0_0_22px_rgba(34,211,238,.2)] backdrop-blur-md"><div className="flex items-center gap-2 text-[9px] uppercase tracking-[.2em] text-cyan-100/80"><Clock3 className="h-3.5 w-3.5" /> New York desk clock</div><div className="mt-1 font-mono text-3xl tracking-tight text-white/90">{clock}</div><div className="mt-1 flex items-center gap-2"><p className="text-[9px] font-semibold tracking-[.14em] text-emerald-300/85">{state.label}</p><span className="text-[9px] text-slate-400">· live status</span></div></div>;
}

export function AuthFrontDoor({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showLogin, setShowLogin] = useState(searchParams.get("panel") === "login");
  const openLogin = () => {
    if (pathname !== "/sign-in") {
      router.push("/sign-in?panel=login");
      return;
    }
    setShowLogin(true);
    router.push("/sign-in?panel=login", { scroll: false });
  };
  const closeLogin = () => {
    setShowLogin(false);
    router.replace("/sign-in", { scroll: false });
  };
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030508] text-slate-100">
      <FloorMotion />
      <div className="relative z-10 min-h-screen">
        <div className="absolute inset-x-5 bottom-8 grid min-h-[84px] grid-cols-[1fr_auto_1fr] items-stretch gap-5 sm:inset-x-10 sm:bottom-12 lg:inset-x-16">
          <div className="h-full animate-[lead-in_900ms_ease-out_900ms_both]"><MarketStatus /></div>
          <div className="hidden h-full flex-1 items-center justify-center text-center animate-[lead-in_900ms_ease-out_2s_both] md:flex">
            <h1 className="font-sans text-2xl font-light uppercase leading-none tracking-[.16em] text-white/90 drop-shadow-[0_0_18px_rgba(255,255,255,.25)] lg:text-4xl">The Comic Book Stock Exchange</h1>
          </div>
          <div className="flex h-full animate-[lead-in_900ms_ease-out_3.2s_both]">
            {!showLogin ? (
              <button type="button" onClick={openLogin} className="group flex h-full items-center gap-3 border-2 border-violet-100 bg-violet-500/90 px-9 py-4 font-sans text-base font-light uppercase tracking-[.24em] text-white transition hover:border-white hover:ring-2 hover:ring-violet-200 hover:ring-offset-0">
                <LogIn className="h-5 w-5" /> Login <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </button>
            ) : (
              <div className="fixed inset-0 z-30 overflow-y-auto bg-black/35 p-4 sm:p-8">
                <button type="button" aria-label="Close login" onClick={closeLogin} className="absolute right-4 top-4 text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
                {children}
              </div>
            )}
          </div>
        </div>
        <div className="absolute inset-x-5 bottom-28 text-center md:hidden"><h1 className="font-sans text-xl font-light uppercase tracking-[.14em] text-white/90">The Comic Book Stock Exchange</h1></div>
      </div>
      <style jsx>{`@keyframes floor-scan{0%{transform:translateX(0);opacity:0}12%{opacity:.8}80%{opacity:.5}100%{transform:translateX(900%);opacity:0}}@keyframes lead-in{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}.floor-scan{animation:floor-scan 9s linear infinite}@media(prefers-reduced-motion:reduce){.floor-scan{animation:none}.animate-\[lead-in_900ms_ease-out_900ms_both\],.animate-\[lead-in_900ms_ease-out_2s_both\],.animate-\[lead-in_900ms_ease-out_3\.2s_both\]{opacity:1;animation:none}}`}</style>
    </div>
  );
}
