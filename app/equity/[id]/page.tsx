import { notFound } from "next/navigation";
import { getEquityDetail } from "@/lib/equity/queries";
import { getSovereignEquityDossier } from "@/lib/equity/canonical-equities";
import { SovereignDossierView } from "@/components/equity/sovereign-dossier-view";
import { IndexDossierView } from "@/components/equity/index-dossier-view";

export const dynamic = "force-dynamic";

interface EquityDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EquityDetailPage({ params }: EquityDetailPageProps) {
  const { id } = await params;
  if (!id) notFound();

  const cleanId = decodeURIComponent(id).trim().toUpperCase().replace(/^\$/, "");

  // 1. Check if identifier corresponds to an index contract (CE70, PPIX100, PPIX60, etc.)
  const indexDetail = await getEquityDetail(cleanId);
  if (indexDetail) {
    return (
      <main className="min-h-screen bg-[#06080F] text-slate-100 py-8">
        <IndexDossierView
          contract={indexDetail.contract}
          observations={indexDetail.observations}
          constituents={indexDetail.constituents}
        />
      </main>
    );
  }

  // 2. Check if identifier is a Sovereign Comic Equity ticker or seat (e.g. ACT.252.SOV, CSS.022.SOV, ce70_seat_6_CE70-8.5, seat-6)
  const sovereignDossier = await getSovereignEquityDossier(id);
  if (sovereignDossier) {
    return (
      <main className="min-h-screen bg-[#06080F] text-slate-100 py-8">
        <SovereignDossierView dossier={sovereignDossier} />
      </main>
    );
  }

  // 3. Fallback: Neither index contract nor sovereign equity exists
  notFound();
}
