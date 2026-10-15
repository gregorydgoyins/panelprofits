import { createHash } from "node:crypto";
import { z } from "zod";
import { createAdminServerClient } from "@/lib/supabase/admin";

/** What identifies the exact book on the lot: the seller's own title plus whatever the slab label and parser resolved. */
export interface WriteupListing {
  title: string;
  series?: string | null;
  issue?: string | null;
  year?: number | null;
  publisher?: string | null;
  grader?: string | null;
}

const point = z.object({ label: z.string().min(2).max(80), text: z.string().min(20).max(700), refs: z.array(z.number().int().min(0)).max(6).optional() });
export const writeupSchema = z.object({
  edition: z.string().min(5).max(220),
  synopsis: z.object({ intro: z.string().min(20).max(500), points: z.array(point).min(1).max(4) }),
  investment: z.object({ heading: z.string().min(5).max(140), points: z.array(point).min(2).max(5) }),
});
export type ListingWriteup = z.infer<typeof writeupSchema> & { sources: Array<{ title: string; uri: string }>; model: string; writtenAt: string };

const MODEL = process.env.SNIPER_WRITEUP_MODEL || "gemini-flash-latest";
const TTL_MS = 30 * 86_400_000;
const FAIL_TTL_MS = 60 * 60_000;
const pending = new Map<string, Promise<ListingWriteup | null>>();

/** Same book, any grade or cert number, gets the same write-up. */
export function writeupKey(l: WriteupListing): string {
  const edition = l.title.toLowerCase().replace(/#\s*/g, "#")
    .replace(/\b(?:cgc|cbcs|pgx|egs|psa)\b/g, " ").replace(/\b(?:universal|signature series|qualified|restored)\b/g, " ")
    .replace(/\b(?:10|9\.[0-9]|[0-8]\.[0-9]|[0-9]\.[0-9])\b/g, " ").replace(/\b\d{7,12}\b/g, " ")
    .replace(/[^a-z0-9#]+/g, " ").replace(/\s+/g, " ").trim();
  return createHash("sha256").update(edition).digest("hex").slice(0, 40);
}

export function writeupPrompt(l: WriteupListing, today = new Date().toISOString().slice(0, 10)): string {
  return `Today is ${today}. You are writing a research page for a comic collector looking at ONE specific eBay listing. Use Google Search to identify this exact book and edition, then write from what you find.

LISTING TITLE (the seller's words): ${JSON.stringify(l.title)}
${l.series ? `Parsed series: ${l.series}${l.issue ? ` #${l.issue}` : ""}${l.year ? ` (${l.year})` : ""}${l.publisher ? `, ${l.publisher}` : ""}\n` : ""}${l.grader ? `Grader: ${l.grader}\n` : ""}
Rules:
- First work out which printing/volume/cover this listing is (the seller's words often name the cover artist, convention, store, ratio or homage). Several volumes of one series can share a title; pick the one the listing's wording and cover credit match, and say which in "edition".
- "synopsis": what happens in THIS issue's story, concretely (characters, events, the hook), as an opening sentence naming the writer and interior artist, then 2 to 4 labelled points. Spoilers are fine.
- "investment": a collector-market note for THIS edition only, headed like "Collectible Breakdown: <edition>" or "Why Invest in <edition>?". 3 to 5 labelled points that mix (a) the facts of this exact edition: the cover variant and its credited artists, how and where it was released and any printed run, what the slab grade means, tie-ins such as toys, games or adaptations; and (b) the real market drivers: an homage to a famous cover, a first appearance or key moment, the character's collector base (solo lead, duo, team, sidekick, lesser-known but prominent character), the creator's following, how easy the book is to find and how hard high grades are to keep. Nothing you would say about any other comic. State reasons to buy as the market sees them, and say plainly what is not established when a claim is shaky.
- Only state facts you found in search results. Give a print run, a price you saw listed or a premium only when a source gives it, and say "reportedly" or "listings show". If you cannot confirm a claim, leave it out. Never invent print runs, first appearances or tie-ins.
- Plain sentences, no markdown, no URLs, no citation markers in the text.
Return ONLY a JSON object: {"edition": string, "synopsis": {"intro": string, "points": [{"label": string, "text": string}]}, "investment": {"heading": string, "points": [{"label": string, "text": string}]}}.`;
}

function parseJson(text: string): unknown {
  const t = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  return JSON.parse(a >= 0 && b > a ? t.slice(a, b + 1) : t);
}

type Support = { text: string; chunks: number[] };
export async function askGemini(prompt: string, apiKey: string): Promise<{ text: string; sources: Array<{ title: string; uri: string }>; supports: Support[] }> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
    signal: AbortSignal.timeout(45000),
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], tools: [{ google_search: {} }], generationConfig: { temperature: 0.2 } }),
  });
  if (!res.ok) throw new Error(`gemini ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = await res.json();
  const cand = json?.candidates?.[0];
  const text = (cand?.content?.parts ?? []).map((p: any) => p?.text ?? "").join("");
  const sources: Array<{ title: string; uri: string }> = [];
  for (const c of cand?.groundingMetadata?.groundingChunks ?? []) {
    const uri = c?.web?.uri;
    sources.push({ title: uri ? String(c.web.title || new URL(uri).hostname) : "", uri: uri || "" }); // keep positions: supports index into this list
  }
  const supports: Support[] = (cand?.groundingMetadata?.groundingSupports ?? []).map((s: any) => ({ text: String(s?.segment?.text ?? ""), chunks: (s?.groundingChunkIndices ?? []) as number[] }));
  return { text, sources, supports };
}

const norm = (t: string) => t.toLowerCase().replace(/\\"/g, '"').replace(/[^a-z0-9]+/g, " ").trim();

/** Attach to each point the sources Gemini says back that sentence, and renumber the shared source list. */
export function attachRefs<T extends { synopsis: { intro: string; points: any[] }; investment: { points: any[] } }>(parsed: T, rawSources: Array<{ title: string; uri: string }>, supports: Support[]): { parsed: T; sources: Array<{ title: string; uri: string }> } {
  const used: number[] = [];
  const slot = (chunk: number) => { if (!rawSources[chunk]?.uri) return -1; let i = used.indexOf(chunk); if (i < 0) { used.push(chunk); i = used.length - 1; } return i; };
  const refsFor = (text: string) => {
    const t = norm(text), out: number[] = [];
    for (const s of supports) {
      const seg = norm(s.text);
      if (seg.length < 15 || !(t.includes(seg) || seg.includes(t))) continue;
      for (const c of s.chunks) { const i = slot(c); if (i >= 0 && !out.includes(i)) out.push(i); }
    }
    return out.slice(0, 4);
  };
  const mark = (pts: any[]) => pts.map((p) => ({ ...p, refs: refsFor(p.text) }));
  const result = { ...parsed, synopsis: { ...parsed.synopsis, points: mark(parsed.synopsis.points) }, investment: { ...parsed.investment, points: mark(parsed.investment.points) } } as T;
  // Anything cited by no point still counts as a source the answer used.
  rawSources.forEach((s, c) => { if (s.uri) slot(c); });
  return { parsed: result, sources: used.map((c) => rawSources[c]).slice(0, 10) };
}

/** What the database already holds for this edition. Never calls Gemini, so it is as fast as a table read. */
export async function readCachedWriteup(l: WriteupListing): Promise<{ writeup: ListingWriteup | null; failedRecently: boolean }> {
  if (!l.title.trim()) return { writeup: null, failedRecently: false };
  try {
    const db: any = createAdminServerClient();
    const { data } = await db.from("sniper_listing_writeup").select("content,failed_at,written_at").eq("key", writeupKey(l)).maybeSingle();
    if (data?.content && Date.now() - new Date(data.written_at).getTime() < TTL_MS) return { writeup: data.content as ListingWriteup, failedRecently: false };
    return { writeup: null, failedRecently: Boolean(data?.failed_at && Date.now() - new Date(data.failed_at).getTime() < FAIL_TTL_MS) };
  } catch { return { writeup: null, failedRecently: false }; }
}

export async function makeListingWriteup(l: WriteupListing): Promise<ListingWriteup | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !l.title.trim()) return null;
  const key = writeupKey(l);
  const db: any = createAdminServerClient();
  try {
    const { data } = await db.from("sniper_listing_writeup").select("content,failed_at,written_at").eq("key", key).maybeSingle();
    if (data?.content && Date.now() - new Date(data.written_at).getTime() < TTL_MS) return data.content as ListingWriteup;
    if (!data?.content && data?.failed_at && Date.now() - new Date(data.failed_at).getTime() < FAIL_TTL_MS) return null;
  } catch { /* cache unavailable: write it live */ }

  const existing = pending.get(key);
  if (existing) return existing;
  const work = (async () => {
    try {
      const { text, sources: rawSources, supports } = await askGemini(writeupPrompt(l), apiKey);
      // A write-up that no web source backs up is exactly the invented kind we refuse to show.
      if (!rawSources.some((s) => s.uri)) throw new Error("no grounding sources");
      const { parsed, sources } = attachRefs(writeupSchema.parse(parseJson(text)), rawSources, supports);
      const content: ListingWriteup = { ...parsed, sources, model: MODEL, writtenAt: new Date().toISOString() };
      await db.from("sniper_listing_writeup").upsert({ key, title: l.title.slice(0, 300), content, written_at: content.writtenAt, failed_at: null }).then(() => {}, () => {});
      return content;
    } catch (error) {
      console.warn("Sniper listing write-up unavailable:", error instanceof Error ? error.message.slice(0, 300) : "error");
      await db.from("sniper_listing_writeup").upsert({ key, title: l.title.slice(0, 300), content: null, failed_at: new Date().toISOString() }).then(() => {}, () => {});
      return null;
    }
  })();
  pending.set(key, work);
  if (pending.size > 100) pending.delete(pending.keys().next().value!);
  work.finally(() => pending.delete(key)).catch(() => {});
  return work;
}

/**
 * Writes the research for the slabs now on the board before anyone opens them, so opening a lot is a table read.
 * Soonest-closing lots first; one write-up per edition however many copies are listed.
 */
export async function prepareWriteups(opts: { budgetMs?: number; maxNew?: number; concurrency?: number } = {}): Promise<{ checked: number; written: number; failed: number }> {
  const { budgetMs = 150_000, maxNew = 25, concurrency = 5 } = opts;
  const out = { checked: 0, written: 0, failed: 0 };
  if (!process.env.GEMINI_API_KEY) return out;
  const started = Date.now();
  const db: any = createAdminServerClient();
  const { data: rows } = await db.from("sniper_listings")
    .select("title,series,issue,pub_year,publisher,grader")
    .eq("status", "live").not("grader", "is", null).gt("end_time", new Date().toISOString())
    .order("end_time", { ascending: true }).limit(400);
  const byKey = new Map<string, WriteupListing>();
  for (const r of rows ?? []) {
    if (!r.title) continue;
    const l: WriteupListing = { title: r.title, series: r.series, issue: r.issue, year: r.pub_year, publisher: r.publisher, grader: r.grader };
    const k = writeupKey(l);
    if (!byKey.has(k)) byKey.set(k, l);
  }
  out.checked = byKey.size;
  const keys = Array.from(byKey.keys());
  const done = new Set<string>();
  for (let i = 0; i < keys.length; i += 100) {
    const { data } = await db.from("sniper_listing_writeup").select("key,content,written_at,failed_at").in("key", keys.slice(i, i + 100));
    for (const r of data ?? []) {
      const fresh = r.content && Date.now() - new Date(r.written_at).getTime() < TTL_MS;
      const failed = !r.content && r.failed_at && Date.now() - new Date(r.failed_at).getTime() < FAIL_TTL_MS;
      if (fresh || failed) done.add(r.key);
    }
  }
  const todo = keys.filter((k) => !done.has(k)).slice(0, maxNew).map((k) => byKey.get(k)!);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, todo.length) }, async () => {
    while (next < todo.length && Date.now() - started < budgetMs - 50_000) { // leave room for the last call to finish
      const l = todo[next++];
      (await makeListingWriteup(l)) ? out.written++ : out.failed++;
    }
  }));
  return out;
}
