import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
const db: any = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const src: any[] = JSON.parse(readFileSync(process.argv[2], "utf8"));
const m = new Map<string, any>();
for (const r of src) {
  const x = /^(.*?)\s+#(\S+)\s+\((\d{4})\s+Series\)$/.exec(r.series);
  const y = /^(.*?)\s+\((\d{4})\s+Series\)$/.exec(r.series);
  m.set(`${r.publisher}|${r.series}`, {
    publisher: r.publisher, series_raw: r.series,
    title: x ? x[1] : y ? y[1] : null, issue_number: x ? x[2] : null, series_year: x ? +x[3] : y ? +y[2] : null,
    grades: r.grades, total: r.total,
  });
}
const rows = [...m.values()];
for (let i = 0; i < rows.length; i += 500) {
  const { error } = await db.from("psa_population").upsert(rows.slice(i, i + 500), { onConflict: "publisher,series_raw" });
  if (error) throw error;
}
console.log("loaded", rows.length);
