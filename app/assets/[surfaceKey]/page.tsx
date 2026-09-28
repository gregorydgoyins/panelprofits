import Link from "next/link";
import { ArrowLeft, Boxes } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AssetSurfacePage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/assets" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-cyan-400 hover:text-cyan-200">
        <ArrowLeft className="h-3.5 w-3.5" /> Asset registry
      </Link>
      <section className="mt-8 border border-slate-800 bg-[#0b0f15] p-8">
        <Boxes className="h-6 w-6 text-cyan-400" />
        <p className="mt-6 text-[10px] uppercase tracking-[0.22em] text-cyan-400">Clean asset port pending</p>
        <h1 className="mt-3 text-3xl text-slate-100">This asset surface is not in Clean yet</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">The old Final asset-surface records have not been migrated into Clean. This page will remain unavailable until a verified schema and data transfer exists.</p>
      </section>
    </main>
  );
}
