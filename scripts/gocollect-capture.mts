/**
 * Polite GoCollect capture: reads each book's census/sales tables per grader and label type and stores them in
 * gocollect_books / gocollect_prices. Credentials come ONLY from the environment at run time (never stored):
 *   GOCOLLECT_EMAIL=... GOCOLLECT_PASSWORD=... NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   npx tsx scripts/gocollect-capture.mts amazing-spider-man-300 [more-slugs...] [--delay=3000] [--dry]
 */
import { createClient } from "@supabase/supabase-js";

const jar = new Map<string, string>();
const decode = (s: string) => s.replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const args = process.argv.slice(2);
const DELAY = Number(args.find((a) => a.startsWith("--delay="))?.split("=")[1] ?? 3000);
const DRY = args.includes("--dry");
const slugs = args.filter((a) => !a.startsWith("--"));

async function req(url: string, init: RequestInit = {}) {
  const cookie = [...jar].map(([k, v]) => `${k}=${v}`).join("; ");
  const res = await fetch(url, { redirect: "manual", ...init, headers: { "user-agent": "Mozilla/5.0 (PanelProfits polite capture)", cookie, ...(init.headers as any) } });
  for (const c of res.headers.getSetCookie?.() ?? []) { const [kv] = c.split(";"); const i = kv.indexOf("="); jar.set(kv.slice(0, i), kv.slice(i + 1)); }
  if ([301, 302, 303].includes(res.status) && res.headers.get("location")) return req(new URL(res.headers.get("location")!, url).toString());
  return res;
}
const csrf = (h: string) => /name="csrf-token" content="([^"]*)/.exec(h)?.[1] ?? "";

async function login() {
  const email = process.env.GOCOLLECT_EMAIL, password = process.env.GOCOLLECT_PASSWORD;
  if (!email || !password) throw new Error("set GOCOLLECT_EMAIL and GOCOLLECT_PASSWORD in the environment");
  const t = csrf(await (await req("https://gocollect.com/login")).text());
  const res = await req("https://gocollect.com/login", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ _token: t, email, password }).toString() });
  if (!res.url.includes("dashboard") && !(await res.text()).includes("GoCollect")) throw new Error("login failed");
}

async function lw(token: string, snapshot: string, calls: Array<{ method: string; params: unknown[] }>) {
  const res = await req("https://gocollect.com/livewire/update", {
    method: "POST",
    headers: { "content-type": "application/json", "x-livewire": "true", "x-csrf-token": token },
    body: JSON.stringify({ _token: token, components: [{ snapshot, updates: {}, calls: calls.map((c) => ({ path: "", ...c })) }] }),
  });
  const j: any = await res.json();
  return j.components[0] as { snapshot: string; effects: { html: string } };
}
const textOf = (html: string) => decode(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, "\n")).replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n").trim();
const money = (s?: string) => (s ? Number(s.replace(/[$,]/g, "")) : null);

export interface Row { grade: string; census: number | null; sales: number | null; lastDate: string | null; lastPrice: number | null; fmv: number | null; avg1: number | null; n1: number | null; avg90: number | null; n90: number | null; avg30: number | null; n30: number | null }
export function parseGrades(text: string): Row[] {
  const flat = text.replace(/\s*\n\s*/g, " ");
  const starts = [...flat.matchAll(/(?:^|\s)(\d{1,2}(?:\.\d)?)\s+Census\s+(N\/A|--|[\d,]+)\s+Sales\s+([\d,]+)/g)];
  return starts.map((m, i) => {
    const block = flat.slice(m.index!, i + 1 < starts.length ? starts[i + 1].index : undefined);
    const last = /(?:Last\s+)?Sold\s+(\d{2})\/(\d{2})\/(\d{4})\s+\$([\d,\.]+)/.exec(block);
    const avg = (label: string) => { const a = new RegExp(`${label}\\s+(--|\\$[\\d,\\.]+)(?:\\s+(\\d+)\\s+sold)?`).exec(block); return { v: a && a[1] !== "--" ? money(a[1]) : null, n: a?.[2] ? Number(a[2]) : null }; };
    const a1 = avg("1 year avg"), a9 = avg("90 day avg"), a3 = avg("30 day avg");
    const fmv = /FMV\s+\$([\d,\.]+)/.exec(block);
    return {
      grade: Number(m[1]).toFixed(1), census: m[2] === "N/A" || m[2] === "--" ? null : Number(m[2].replace(/,/g, "")), sales: Number(m[3].replace(/,/g, "")),
      lastDate: last ? `${last[3]}-${last[1]}-${last[2]}` : null, lastPrice: last ? money(last[4]) : null, fmv: fmv ? money(fmv[1]) : null,
      avg1: a1.v, n1: a1.n, avg90: a9.v, n90: a9.n, avg30: a3.v, n30: a3.n,
    };
  });
}

async function captureBook(slug: string, db: any) {
  const page = await (await req(`https://gocollect.com/app/comic/${slug}?tab=cgc`)).text();
  if (!/<title>[^<]*GoCollect/.test(page) || /Log In/.test(/<title>([^<]*)/.exec(page)?.[1] ?? "")) throw new Error(`${slug}: not found / not logged in`);
  const token = csrf(page);
  let sold: { snapshot: string } | null = null, census: string[] = [];
  for (const m of page.matchAll(/<div[^>]*wire:snapshot="([^"]*)"[^>]*x-intersect="\$wire\.__lazyLoad\(&#039;([^&]*)&#039;\)"/g)) {
    const snap = decode(m[1]); const name = JSON.parse(snap).memo.name;
    if (name === "item.census-detail" && !census.length) { const c = await lw(token, snap, [{ method: "__lazyLoad", params: [m[2]] }]); census.push(textOf(c.effects.html)); }
    if (name === "sold.item-sold-examples") { let c = await lw(token, snap, [{ method: "__lazyLoad", params: [m[2]] }]); c = await lw(token, c.snapshot, [{ method: "readyDisplay", params: [] }]); sold = c; }
  }
  if (!sold) throw new Error(`${slug}: sold table component not found`);
  if (process.env.GC_DEBUG) console.log("CENSUS", JSON.stringify(census[0]?.slice(0, 260)));
  const meta = /Title\s*\n?\s*Publisher\s*\n?\s*Date[\s\S]*?\n\s*([^\n]+) #([^\s\n]+)\n\s*([^\n]+)\n\s*(\d{1,2}\/\d{2})/.exec(census[0] ?? "");
  const itemId = Number(/"itemId":"?(\d+)/.exec(decode(sold.snapshot))?.[1]) || null;
  await db.from("gocollect_books").upsert({ slug, item_id: itemId, title: meta?.[1] ?? null, issue_number: meta?.[2] ?? null, publisher: meta?.[3] ?? null, cover_date: meta?.[4] ?? null, captured_at: new Date().toISOString() });
  const rows: any[] = [];
  const companies: Array<[string, string]> = [["cgc", "7"], ["cbcs", "9"], ["psa", "49"]];
  let state = sold;
  for (const [grader, id] of companies) {
    state = await lw(token, state.snapshot, [{ method: "setCamCertificationCompanyId", params: [id] }]);
    const labels = [...state.effects.html.matchAll(/setFixedCamCertificationValueId\('(\d+)'\)[^>]*>([\s\S]*?)<\/(?:a|button|li|div)>/g)].map((m) => ({ id: m[1], name: textOf(m[2]).split("\n")[0].trim() })).filter((l) => l.name);
    if (process.env.GC_DEBUG) console.log(grader, "labels", JSON.stringify(labels), "html", state.effects.html.length, textOf(state.effects.html).slice(0, 300).replace(/\n/g, " | "));
    const seen = new Set<string>();
    for (const l of labels) {
      if (seen.has(l.id)) continue; seen.add(l.id);
      await sleep(DELAY);
      state = await lw(token, state.snapshot, [{ method: "setFixedCamCertificationValueId", params: [l.id] }]);
      const t = textOf(state.effects.html);
      if (process.env.GC_DEBUG && grader === "psa") console.log("PSATEXT", l.name, JSON.stringify(t.slice(t.indexOf("Overview") > 0 ? t.indexOf("Overview") : 0, 1500)));
      for (const r of parseGrades(t)) rows.push({ slug, grader, label_type: l.name, grade: r.grade, census: r.census, sales_count: r.sales, last_sold_date: r.lastDate, last_sold_price: r.lastPrice, fmv: r.fmv, avg_1y: r.avg1, n_1y: r.n1, avg_90d: r.avg90, n_90d: r.n90, avg_30d: r.avg30, n_30d: r.n30 });
    }
  }
  console.log(slug, "rows", rows.length, [...new Set(rows.map((r) => `${r.grader}/${r.label_type}`))].join(", "));
  if (DRY) { console.log(JSON.stringify(rows.slice(0, 3), null, 1)); return; }
  for (let i = 0; i < rows.length; i += 200) { const { error } = await db.from("gocollect_prices").upsert(rows.slice(i, i + 200), { onConflict: "slug,grader,label_type,grade" }); if (error) throw error; }
}

const db: any = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
await login();
for (const s of slugs) { try { await captureBook(s, db); } catch (e) { console.error("FAILED", s, (e as Error).message); } await sleep(DELAY); }
