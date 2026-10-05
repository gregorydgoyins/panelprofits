import type { Metadata } from "next";
import "./globals.css";
import { MarketShell } from "@/components/shell/market-shell";
import { QueryProvider } from "@/components/providers/query-provider";

export const metadata: Metadata = {
  title: "Panel Profits | Comic Market Intelligence & Valuation",
  description:
    "Production comic-book financial information and market intelligence platform indexing 3,481,445 authoritative comic records.",
  keywords: [
    "Panel Profits",
    "Comic Book Valuation",
    "Comic Catalog",
    "Comic Market Intelligence",
    "CGC 9.8 Pricing",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark font-hind">
      <body className="flex min-h-screen flex-col bg-[#07080B] text-slate-100 antialiased">
        <QueryProvider>
          <MarketShell>{children}</MarketShell>
        </QueryProvider>
      </body>
    </html>
  );
}
