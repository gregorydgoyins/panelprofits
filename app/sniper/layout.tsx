import * as React from "react";
import { Header } from "@/components/shell/header";
import { Footer } from "@/components/shell/footer";

export default function SniperLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#07080B] text-slate-100 antialiased">
      <React.Suspense fallback={null}>
        <Header />
      </React.Suspense>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
