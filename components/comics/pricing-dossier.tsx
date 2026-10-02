import type { ComicRecord } from "@/lib/comics/types";
import {
  cgcGrades,
  comicBaseGrades,
  comicBaseReference,
  getHighestGradedPrice,
  goCollectGrades,
  GRADES,
  panelProfitsGrades,
} from "@/lib/pricing/source-ladder";
import { formatCurrency } from "@/lib/utils";
import { getCleanPricingEvidence } from "@/lib/pricing/clean";

const SOURCES = ["Panel Profits", "ComicBase", "CGC · GPA sales", "CBCS", "PSA", "GoCollect"] as const;

export async function PricingDossier({ comic }: { comic: ComicRecord }) {
  const cleanEvidence = await getCleanPricingEvidence(comic.id);
  const pp = Object.keys(cleanEvidence.grades).length ? cleanEvidence.grades : panelProfitsGrades(comic);
  const cbGrades = comicBaseGrades(comic);
  const cb = comicBaseReference(comic);
  const gcGrades = goCollectGrades(comic);
  const cgcGpaGrades = cgcGrades(comic);
  const rawCoverPrice = (comic.comicbase_data as any)?.["CB - Cover Price"] ?? (comic as any).cover_price;
  const coverPrice = rawCoverPrice != null ? Number(String(rawCoverPrice).replace(/[^0-9.]/g, "")) : null;

  const highest = getHighestGradedPrice({
    "Panel Profits": pp,
    "ComicBase": cbGrades,
    "GoCollect": gcGrades,
    "CGC · GPA sales": cgcGpaGrades,
  });

  return (
    <section aria-labelledby="pricing-heading" className="rounded-xl border border-slate-700 bg-[#111319] p-4 sm:p-6 shadow-lg">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-700 pb-4">
        <div>
          <h2 id="pricing-heading" className="text-lg font-semibold text-slate-100">
            Price evidence by source and grade
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Each pricing authority (Panel Profits, ComicBase, CGC, CBCS, PSA, GoCollect) operates under its own isolated normalization rules. RAW indicates ungraded market observations. No cross-source blending occurs.
          </p>
        </div>
        <span className="text-xs text-slate-400">
          {GRADES.length} grade tiers · Clean evidence {cleanEvidence.observationCount ? "connected" : "isolated"}
        </span>
      </div>

      <div
        className="mt-4 overflow-x-auto rounded-lg border border-slate-700 focus-visible:ring-2 focus-visible:ring-cyan-400"
        role="region"
        aria-label="Pricing evidence ladder by source and grade tier"
        tabIndex={0}
      >
        <table className="w-full min-w-[1180px] border-collapse text-left text-xs tabular-nums">
          <thead className="bg-slate-900 text-slate-300">
            <tr>
              <th scope="col" className="sticky left-0 z-10 bg-slate-900 px-3 py-3 font-medium border-r border-slate-800">
                Authority Source
              </th>
              <th scope="col" className="px-2 py-3 text-right font-medium">
                Catalog Ref
              </th>
              {GRADES.map((grade) => (
                <th
                  scope="col"
                  key={grade}
                  className={`px-2 py-3 text-right font-medium ${grade === "RAW" ? "text-amber-300 font-semibold" : ""}`}
                >
                  {grade}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {SOURCES.map((source) => (
              <tr key={source} className="hover:bg-slate-800/40 transition-colors">
                <th
                  scope="row"
                  className="sticky left-0 bg-[#111319] px-3 py-3 whitespace-nowrap font-medium text-slate-100 border-r border-slate-800"
                >
                  {source}
                </th>
                <td className="px-2 py-3 text-right text-cyan-300">
                  {source === "ComicBase" && cb !== null ? formatCurrency(cb) : "—"}
                </td>
                {GRADES.map((grade) => {
                  let price: number | undefined;

                  if (source === "Panel Profits") {
                    price = pp[grade];
                  } else if (source === "ComicBase") {
                    price = cbGrades[grade];
                  } else if (source === "GoCollect") {
                    price = gcGrades[grade];
                  } else if (source === "CGC · GPA sales") {
                    price = cgcGpaGrades[grade];
                  }
                  // CGC, CBCS, PSA, GoCollect stay strictly unblended unless exact observation matches exist in Clean
                  // Missing prices remain unpriced; no synthetic extrapolation across grades.

                  return (
                    <td
                      key={grade}
                      className={`px-2 py-3 text-right ${price ? "text-emerald-300 font-medium" : "text-slate-600"}`}
                    >
                      {price ? formatCurrency(price) : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 text-sm grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-800 bg-[#0C1626] p-3.5">
          <div className="text-[10px] font-mono font-medium uppercase tracking-wider text-cyan-300">
            Highest Graded Market Price
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-lg font-semibold text-slate-100">
              {highest ? formatCurrency(highest.price) : "Unpriced"}
            </span>
            {highest && (
              <span className="text-[11px] font-mono font-medium text-cyan-400">
                ({highest.isRaw ? "RAW Ungraded" : `Grade ${highest.grade}`})
              </span>
            )}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            Highest verified price observed. Non-9.8 books never receive a 9.8 price or synthetic valuation.
          </p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-[#0C1626] p-3.5">
          <div className="text-[10px] font-mono font-medium uppercase tracking-wider text-cyan-300">
            ComicBase Catalog Reference
          </div>
          <div className="mt-1.5 text-lg font-semibold text-slate-100">{cb === null ? "—" : formatCurrency(cb)}</div>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            ComicBase catalog guide reference valuation. Evaluated independently from newsstand cover prices and certified slabs.
          </p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-[#0C1626] p-3.5">
          <div className="text-[10px] font-mono font-medium uppercase tracking-wider text-cyan-300">
            Original Cover Price
          </div>
          <div className="mt-1.5 text-lg font-semibold text-amber-300">
            {coverPrice != null && coverPrice > 0 ? formatCurrency(coverPrice) : "—"}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            Historical cover price stamped on physical newsstand or direct copies at initial publication.
          </p>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-3.5 text-xs text-slate-300">
          <strong className="block text-slate-100 uppercase tracking-wide text-[10px] font-mono">Strict Authority Isolation Policy</strong>
          <p className="mt-1.5 leading-relaxed text-slate-400">
            Panel Profits, ComicBase, CGC GPA, CBCS, PSA, and GoCollect ladders are stored in isolated channels. Unpriced grades remain unpriced (`—`) without mathematical interpolation.
          </p>
        </div>
      </div>
    </section>
  );
}
