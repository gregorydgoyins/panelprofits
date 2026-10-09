"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import {
  Activity,
  BarChart3,
  Bookmark,
  BriefcaseBusiness,
  CalendarCheck,
  ChevronDown,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Newspaper,
  Search,
  Users,
  Watch,
  Wallet,
  X,
  Swords,
  Crosshair,
} from "lucide-react";

interface NavLink { href: string; label: string; icon: typeof LayoutDashboard; }
interface NavGroup extends NavLink { color: string; children: NavLink[]; }

const NAV_GROUPS: NavGroup[] = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    color: "#c084fc",
    children: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/onboarding", label: "Onboarding / Intake", icon: ClipboardList },
      { href: "/watchlist", label: "Watchlist", icon: Bookmark },
    ],
  },
  {
    href: "/collection",
    label: "Portfolio",
    icon: BriefcaseBusiness,
    color: "#f43f5e",
    children: [
      { href: "/collection", label: "Overview", icon: BriefcaseBusiness },
      { href: "/watchlist", label: "Watchlist", icon: Bookmark },
      { href: "/diary", label: "Diary", icon: FileText },
    ],
  },
  {
    href: "/market",
    label: "Markets",
    icon: BarChart3,
    color: "#38bdf8",
    children: [
      { href: "/market", label: "Markets Overview", icon: BarChart3 },
      { href: "/equities", label: "Equities Trading Floor", icon: Activity },
      { href: "/assets", label: "16 Asset Surfaces", icon: BriefcaseBusiness },
      { href: "/telemetry", label: "Barometers & Clocks", icon: Activity },
      { href: "/sniper", label: "Private Deal Radar (Owner)", icon: Crosshair },
    ],
  },
  {
    href: "/comics",
    label: "Catalog",
    icon: Search,
    color: "#06b6d4",
    children: [
      { href: "/comics", label: "Comic Catalog", icon: Search },
      { href: "/battle", label: "Superhero Battle Arena", icon: Swords },
      { href: "/wiki", label: "Encyclopedia (PPedia)", icon: FileText },
      { href: "/lexicon", label: "Market Lexicon", icon: FileText },
    ],
  },
  {
    href: "/news",
    label: "News",
    icon: Newspaper,
    color: "#fbbf24",
    children: [
      { href: "/news", label: "News Wire", icon: Newspaper },
      { href: "/newsroom", label: "Newsroom Desk", icon: Newspaper },
      { href: "/video-archive", label: "Video Intelligence Archive", icon: FileText },
      { href: "/research/archive", label: "Historical Wire Archive", icon: Newspaper },
    ],
  },
  {
    href: "/research",
    label: "Research",
    icon: FileText,
    color: "#f472b6",
    children: [
      { href: "/research", label: "Research Hub", icon: Search },
      { href: "/analytics", label: "Analytics Desk", icon: BarChart3 },
      { href: "/firms", label: "Firms & Operators", icon: BriefcaseBusiness },
      { href: "/people", label: "People & Talent", icon: Users },
      { href: "/research/white-papers", label: "White Papers", icon: FileText },
      { href: "/research/scholarly-papers", label: "Scholarly Papers", icon: FileText },
    ],
  },
  {
    href: "/learn",
    label: "Learn",
    icon: GraduationCap,
    color: "#4ade80",
    children: [
      { href: "/learn", label: "Connoisseur Learning Hub", icon: GraduationCap },
      { href: "/lexicon", label: "CBR Terminology Lexicon", icon: FileText },
    ],
  },
];

export const PRIMARY_NAV_LINKS: NavLink[] = NAV_GROUPS.flatMap((group) => [
  { href: group.href, label: group.label, icon: group.icon },
  ...group.children,
]);

function active(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function NavGroupMenu({ group, pathname, closeMobile }: { group: NavGroup; pathname: string; closeMobile: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isActive = active(pathname, group.href);
  const Icon = group.icon;

  useEffect(() => {
    function closeOnOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutside);
    return () => document.removeEventListener("mousedown", closeOnOutside);
  }, []);

  const label = open ? `Close ${group.label} menu` : `Open ${group.label} menu`;
  return (
    <div ref={ref} className="relative shrink-0">
      <div className="flex items-center gap-1">
        <Link href={group.href} aria-current={isActive ? "page" : undefined} onClick={closeMobile} className="flex items-center gap-1.5 rounded-md border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.11em] transition-colors" style={{ color: isActive || open ? "#fff" : "#cfd8e3", borderColor: isActive || open ? `${group.color}66` : "transparent", background: isActive || open ? `${group.color}10` : "transparent" }}>
          <Icon className="h-3.5 w-3.5" style={{ color: group.color }} />
          {group.label}
        </Link>
        {group.children.length > 0 && <button type="button" aria-label={label} aria-expanded={open} onClick={() => setOpen((value) => !value)} className="rounded-md border px-1.5 py-2 hover:text-white" style={{ color: isActive || open ? group.color : "#64748b", borderColor: isActive || open ? `${group.color}66` : "transparent", background: isActive || open ? `${group.color}10` : "transparent" }}><ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} /></button>}
      </div>
      {open && group.children.length > 0 && <div role="menu" className="absolute left-0 top-[calc(100%+6px)] z-50 min-w-52 rounded-md border border-slate-700 bg-[#070e1c] p-1.5 shadow-2xl">
        <p className="px-2 py-1.5 text-[9px] uppercase tracking-[0.16em]" style={{ color: group.color }}>{group.label}</p>
        {group.children.map((child) => { const ChildIcon = child.icon; return <Link role="menuitem" key={child.href} href={child.href} aria-current={active(pathname, child.href) ? "page" : undefined} onClick={() => { setOpen(false); closeMobile(); }} className={`flex items-center gap-2 rounded px-2.5 py-2 text-[11px] uppercase tracking-[0.1em] ${active(pathname, child.href) ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}><ChildIcon className="h-3.5 w-3.5" style={{ color: group.color }} />{child.label}</Link>; })}
      </div>}
    </div>
  );
}

export function PrimaryNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function focusSearch(event: KeyboardEvent) { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); document.getElementById("primary-search")?.focus(); } }
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  function submitSearch(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (query.trim()) { setMobileOpen(false); router.push(`/comics?q=${encodeURIComponent(query.trim())}`); } }

  return <div className="min-w-0 flex-1 lg:-ml-3">
    <div className="flex items-center gap-2">
      <button type="button" aria-label="Open navigation menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen((value) => !value)} className="rounded border border-slate-700 p-2 text-slate-300 hover:border-cyan-300 hover:text-cyan-200 lg:hidden">{mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button>
      <nav aria-label="Primary navigation" className="hidden min-w-0 items-center gap-0.5 overflow-visible lg:flex">{NAV_GROUPS.map((group) => <NavGroupMenu key={`${group.label}-${group.href}`} group={group} pathname={pathname} closeMobile={() => setMobileOpen(false)} />)}</nav>
      <form onSubmit={submitSearch} className="relative min-w-0 flex-1 lg:ml-3 lg:max-w-sm"><Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" /><input id="primary-search" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search catalog" placeholder="Search comics..." className="h-8 w-full rounded border border-slate-700 bg-[#0b111c] pl-8 pr-12 text-xs text-slate-100 outline-none placeholder:text-slate-600 focus:border-cyan-300/70" /><kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-slate-700 bg-slate-900 px-1 text-[9px] text-slate-500">⌘K</kbd></form>
    </div>
    {mobileOpen && <nav aria-label="Mobile navigation" className="mt-3 grid gap-1 border-t border-slate-800 pt-3 lg:hidden">{NAV_GROUPS.flatMap((group) => [{ ...group }, ...group.children]).map((item) => { const Icon = item.icon; return <Link key={`${item.label}-${item.href}`} href={item.href} aria-current={active(pathname, item.href) ? "page" : undefined} onClick={() => setMobileOpen(false)} className={`flex items-center gap-2 rounded px-3 py-2 text-xs uppercase tracking-[0.1em] ${active(pathname, item.href) ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}><Icon className="h-4 w-4 text-cyan-300" />{item.label}</Link>; })}</nav>}
  </div>;
}
