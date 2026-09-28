import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, Search, Home } from "lucide-react";

export default function RootNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md rounded-xl border border-slate-800 bg-[#0b0f15] p-8 space-y-6 shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-cyan-400 border border-slate-800">
          <FileQuestion className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400">
            Navigation Record Notice
          </p>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 uppercase">
            Record Not Found
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The requested record, asset, or edition does not exist in the active catalog or has been archived.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/comics">
            <Button size="sm" variant="outline" className="gap-2 border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white text-xs">
              <Search className="h-3.5 w-3.5 text-cyan-400" />
              <span>Search Catalog</span>
            </Button>
          </Link>
          <Link href="/">
            <Button size="sm" variant="ghost" className="gap-2 text-slate-400 hover:text-slate-200 text-xs">
              <Home className="h-3.5 w-3.5" />
              <span>Return Home</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
