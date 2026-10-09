/**
 * app/api/ingestion/cgc-pop/route.ts
 * CGC Population Report census ingestion (one row per CGC population record).
 * Auth: same GPA_INGESTION_SECRET bearer as /api/ingestion/graded/batch.
 * Body: { rows: CgcPopRow[] }  (max 250 per request)
 */

import { createAdminServerClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const INGESTION_SECRET = process.env.GPA_INGESTION_SECRET;
const MAX_ROWS = 250;

// Grade columns as published by CGC, in ascending order. Used for 9.0+.
const GRADES_9_PLUS = ["9_0", "9_2", "9_4", "9_6", "9_8", "9_9", "10_0"];

interface IncomingRow {
  populationID: number;
  researchGroupID: number;
  subcategoryID?: number | null;
  publisher?: string | null;
  title: string;
  issueNumber?: string | null;
  issueDate?: string | null;
  numericYear?: number | null;
  variant?: string | null;
  isBase?: boolean | null;
  masterID?: string | null;
  population_Total?: number | null;
  dateModified?: string | null;
  pop: Record<string, number>;
}

function toRow(r: IncomingRow) {
  const pop = r.pop ?? {};
  const nine = GRADES_9_PLUS.reduce((s, g) => s + (Number(pop[g]) || 0), 0);
  return {
    population_id: r.populationID,
    group_id: r.researchGroupID,
    subcategory_id: r.subcategoryID ?? null,
    publisher: r.publisher ?? null,
    title: r.title,
    issue_number: r.issueNumber ?? null,
    issue_date: r.issueDate ?? null,
    year: r.numericYear && r.numericYear > 1900 ? r.numericYear : null,
    variant: (r.variant ?? "").trim() || null,
    is_base: r.isBase ?? null,
    master_id: r.masterID ?? null,
    total: Number(r.population_Total) || 0,
    pop_9_0_plus: nine,
    pop,
    source_modified_at: r.dateModified ?? null,
    fetched_at: new Date().toISOString(),
  };
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("Authorization") || "";
  const secret = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!INGESTION_SECRET || secret !== INGESTION_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { rows?: IncomingRow[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rows = Array.isArray(body.rows) ? body.rows : [];
  if (rows.length === 0) return NextResponse.json({ upserted: 0 });
  if (rows.length > MAX_ROWS) {
    return NextResponse.json({ error: `Max ${MAX_ROWS} rows per request` }, { status: 413 });
  }
  const valid = rows.filter((r) => Number.isFinite(r?.populationID) && r?.title && r?.pop);
  const supabase = createAdminServerClient();
  const { error } = await supabase
    .from("cgc_population")
    .upsert(valid.map(toRow), { onConflict: "population_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ upserted: valid.length, skipped: rows.length - valid.length });
}
