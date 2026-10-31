"use client";

import * as React from "react";
import Link from "next/link";
import { User as UserIcon } from "lucide-react";
import { SignOutButton } from "./sign-out-button";

interface AccountState {
  authenticated: boolean;
  displayName?: string;
  user?: { id: string; email?: string } | null;
}

export function HeaderAuth() {
  const [account, setAccount] = React.useState<AccountState | null>(null);

  React.useEffect(() => {
    // Only check if an auth cookie exists to avoid unnecessary fetches for anonymous visitors
    const hasAuth = document.cookie.split("; ").some((c) => c.startsWith("sb-") || c.includes("auth-token"));
    if (!hasAuth) {
      setAccount({ authenticated: false });
      return;
    }

    fetch("/api/account/state", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { authenticated: false }))
      .then((data) => setAccount(data))
      .catch(() => setAccount({ authenticated: false }));
  }, []);

  if (account === null) {
    // Stable neutral skeleton during initial client hydration
    return (
      <Link
        href="/sign-in"
        className="flex items-center gap-1.5 rounded px-3 py-1 text-slate-200 bg-purple-950/40 hover:bg-purple-900/60 transition-colors border border-purple-500/50 hover:border-purple-400 text-xs"
      >
        <UserIcon className="h-3.5 w-3.5 text-purple-400" />
        <span>SIGN IN</span>
      </Link>
    );
  }

  if (account.authenticated && account.displayName) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/account"
          className="flex items-center gap-1.5 rounded px-2.5 py-1 text-slate-200 hover:text-purple-300 hover:bg-[#141620] transition-colors border border-purple-500/30 hover:border-purple-500/70 text-xs"
        >
          <UserIcon className="h-3.5 w-3.5 text-purple-400" />
          <span className="max-w-[110px] truncate">{account.displayName}</span>
        </Link>
        <div className="sm:hidden">
          <SignOutButton />
        </div>
      </div>
    );
  }

  return (
    <Link
      href="/sign-in"
      className="flex items-center gap-1.5 rounded px-3 py-1 text-slate-200 bg-purple-950/40 hover:bg-purple-900/60 transition-colors border border-purple-500/50 hover:border-purple-400 text-xs"
    >
      <UserIcon className="h-3.5 w-3.5 text-purple-400" />
      <span>SIGN IN</span>
    </Link>
  );
}

export function HeaderOperatorBadge() {
  const [account, setAccount] = React.useState<AccountState | null>(null);

  React.useEffect(() => {
    const hasAuth = document.cookie.split("; ").some((c) => c.startsWith("sb-") || c.includes("auth-token"));
    if (!hasAuth) return;

    fetch("/api/account/state", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated) setAccount(data);
      })
      .catch(() => {});
  }, []);

  if (!account?.authenticated || !account.displayName) return null;

  return (
    <div className="hidden sm:flex items-center gap-2 border-l border-slate-800 pl-3">
      <span className="text-slate-400">OPERATOR:</span>
      <span className="text-slate-200">{account.displayName}</span>
      <SignOutButton />
    </div>
  );
}
