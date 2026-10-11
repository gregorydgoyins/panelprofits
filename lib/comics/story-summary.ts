/**
 * Verifiable per-issue story descriptions.
 *
 * Source order: publisher wiki on Fandom (Marvel Database, DC Database, Image, Dark Horse, Valiant,
 * Dynamite) -> League of Comic Geeks listing description. Nothing is generated or templated: if no
 * source has a description for this exact issue, the result is null and the page shows nothing.
 *
 * Every hit carries its source name + URL (+ licence) so the page can attribute it.
 * Results (including "checked, none found") are cached in `issue_story_summaries`.
 */
import { createAdminServerClient } from "@/lib/supabase/admin";

export interface StorySummary {
  text: string;
  storyTitle: string | null;
  source: string;
  sourceUrl: string;
  license: string | null;
}

export interface StorySummaryInput {
  series: string;
  issueNumber: string;
  year: number | null;
  publisher: string | null;
  volume?: number | null;
}

const UA = "PanelProfitsBot/1.0 (+https://comicbookstockexchange.com; story-description lookup)";
const FETCH_TIMEOUT_MS = 6000;
const MAX_CHARS = 900;
const NEGATIVE_TTL_MS = 14 * 24 * 3600 * 1000;
const POSITIVE_TTL_MS = 90 * 24 * 3600 * 1000;

/* ------------------------------------------------------------------ helpers (pure) */

const ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "–", mdash: "—",
  lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”", hellip: "…",
};

export function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}

export function htmlToText(html: string): string {
  return decodeEntities(
    html
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<sup[^>]*class="[^"]*reference[^"]*"[\s\S]*?<\/sup>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/\[(?:edit|citation needed)[^\]]*\]/gi, "")
    .replace(/[ \t ]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Trim to `max` chars on a sentence boundary; never mid-sentence unless a sentence is itself too long. */
export function clipAtSentence(text: string, max = MAX_CHARS): string {
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const cut = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("! "), slice.lastIndexOf("? "), slice.lastIndexOf(".\n"));
  if (cut > max * 0.5) return slice.slice(0, cut + 1).trim();
  return slice.replace(/\s+\S*$/, "").trim() + "…";
}

export function normalizeTitle(s: string): string {
  return s
    .toLowerCase()
    .replace(/\(\s*\d{4}(?:\s*-\s*(?:\d{4})?)?\s*\)/g, " ")
    .replace(/^the\s+/, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function publisherTokens(p: string | null | undefined): string[] {
  return (p || "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !["comics", "comic", "entertainment", "publishing", "press", "the", "and", "inc", "studios"].includes(t));
}

export function publishersAgree(a: string | null | undefined, b: string | null | undefined): boolean {
  const ta = publisherTokens(a);
  const tb = publisherTokens(b);
  if (!ta.length || !tb.length) return false;
  return ta.some((t) => tb.includes(t));
}

/** Extract the lead "Synopsis for "<title>"" section from a MediaWiki (Fandom) issue page. */
export function extractFandomSynopsis(html: string): { text: string; storyTitle: string | null } | null {
  const headRe = /<h2\b[^>]*>(?:(?!<\/h2>)[\s\S])*?Synopsis for\b(?:(?!<\/h2>)[\s\S])*?<\/h2>/i;
  const m = headRe.exec(html);
  if (!m) return null;
  const headText = htmlToText(m[0]);
  const t = /Synopsis for\s+[“"](.+?)[”"]\s*$/i.exec(headText);
  const storyTitle = t ? t[1].trim() : null;
  const after = html.slice(m.index + m[0].length);
  const end = after.search(/<h2\b/i);
  const section = end === -1 ? after : after.slice(0, end);
  const paras = [...section.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((p) => htmlToText(p[1]))
    .filter((p) => p.length > 0);
  const text = paras.join("\n\n").trim();
  if (text.length < 80) return null;
  return { text: clipAtSentence(text), storyTitle };
}

/** League of Comic Geeks issue page: release year, publisher line and the listing description. */
export function extractLocgIssue(html: string): { publisher: string | null; year: number | null; description: string | null } {
  const text = htmlToText(html);
  const head = /([^\n·]+?)\s*·\s*RELEASED\s+[A-Z]{3}\s+\d+,\s+(\d{4})/i.exec(text);
  const d = /class="[^"]*listing-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i.exec(html);
  const description = d ? htmlToText(d[1]) : "";
  return {
    publisher: head ? head[1].trim() : null,
    year: head ? Number(head[2]) : null,
    description: description.length >= 60 ? clipAtSentence(description) : null,
  };
}

export function comicKey(series: string, issue: string, year: number | null): string {
  return `${normalizeTitle(series)}|${issue.trim().toLowerCase()}|${year ?? ""}`;
}

const FANDOM_WIKIS: Array<{ publisher: RegExp; host: string; name: string }> = [
  { publisher: /marvel|epic|icon|max|star comics|curtis|atlas|timely/i, host: "marvel.fandom.com", name: "Marvel Database (Fandom)" },
  { publisher: /\bdc\b|vertigo|wildstorm|milestone|paradox|young animal|black label|elseworlds|piranha|all.star|cliffhanger|homage|america's best|tangent|amalgam/i, host: "dc.fandom.com", name: "DC Database (Fandom)" },
  { publisher: /image|top cow|skybound/i, host: "imagecomics.fandom.com", name: "Image Comics Database (Fandom)" },
  { publisher: /dark horse/i, host: "darkhorse.fandom.com", name: "Dark Horse Database (Fandom)" },
  { publisher: /valiant/i, host: "valiant.fandom.com", name: "Valiant Comics Database (Fandom)" },
  { publisher: /dynamite/i, host: "dynamiteentertainment.fandom.com", name: "Dynamite Entertainment Database (Fandom)" },
];

export function fandomPageTitle(series: string, issue: string, volume: number): string {
  const clean = series
    .replace(/\(\s*\d{4}(?:\s*-\s*(?:\d{4})?)?\s*\)/g, "")
    .replace(/^the\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
  return `${clean} Vol ${volume} ${issue}`.replace(/ /g, "_");
}

/* ------------------------------------------------------------------ network */

async function fetchHtml(url: string): Promise<{ status: number; html: string; finalUrl: string } | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, accept: "text/html" },
      signal: ctrl.signal,
      redirect: "follow",
      cache: "no-store",
    });
    return { status: res.status, html: await res.text(), finalUrl: res.url };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

type ProviderOutcome = { hit: StorySummary | null; errored: boolean };

async function fromFandom(input: StorySummaryInput): Promise<ProviderOutcome> {
  const wiki = FANDOM_WIKIS.find((w) => w.publisher.test(input.publisher || ""));
  if (!wiki) return { hit: null, errored: false };
  // rail volume defaults to 1 for most books, so also try later volumes; the year check below guards false matches.
  const volumes = Array.from(new Set([input.volume ?? 1, 1, 2, 3, 4, 5].filter((v): v is number => !!v && v > 0)));
  let errored = false;
  for (const vol of volumes) {
    const title = fandomPageTitle(input.series, input.issueNumber, vol);
    const url = `https://${wiki.host}/wiki/${encodeURIComponent(title).replace(/%5F/g, "_")}`;
    const res = await fetchHtml(url);
    if (!res) { errored = true; continue; }
    if (res.status === 404) continue;
    if (res.status !== 200) { errored = true; continue; }
    // The page must be this exact issue (title) and, when we know the year, mention it near the top.
    const pageTitle = /<title>([^<]*)<\/title>/i.exec(res.html)?.[1] ?? "";
    const expected = title.replace(/_/g, " ").toLowerCase();
    const pt = decodeEntities(pageTitle).toLowerCase().trim();
    // exact page: "<title> | Marvel Database | Fandom" — a bare prefix would also match issue 20 for issue 2
    if (!(pt === expected || pt.startsWith(`${expected} |`))) continue;
    if (input.year) {
      const head = htmlToText(res.html.slice(0, Math.min(res.html.length, 120000)));
      if (!new RegExp(`\\b${input.year}\\b`).test(head)) continue;
    }
    const syn = extractFandomSynopsis(res.html);
    if (!syn) continue;
    return {
      hit: { text: syn.text, storyTitle: syn.storyTitle, source: wiki.name, sourceUrl: res.finalUrl || url, license: "CC BY-SA 3.0" },
      errored,
    };
  }
  return { hit: null, errored };
}

async function fromLocg(input: StorySummaryInput): Promise<ProviderOutcome> {
  const base = "https://leagueofcomicgeeks.com";
  const search = await fetchHtml(`${base}/search?keyword=${encodeURIComponent(`${input.series} ${input.issueNumber}`)}`);
  if (!search) return { hit: null, errored: true };
  if (search.status !== 200) return { hit: null, errored: search.status >= 500 || search.status === 403 || search.status === 429 };
  const want = normalizeTitle(input.series);
  const candidates: string[] = [];
  for (const block of search.html.split(/<li[\s>]/i)) {
    const href = /href="(\/comics\/series\/\d+\/[a-z0-9-]+)"/i.exec(block)?.[1];
    const alt = /alt="([^"]+)"/i.exec(block)?.[1];
    if (href && alt && normalizeTitle(decodeEntities(alt)) === want && !candidates.includes(href)) candidates.push(href);
  }
  let errored = false;
  for (const href of candidates.slice(0, 3)) {
    const series = await fetchHtml(`${base}${href}`);
    if (!series) { errored = true; continue; }
    if (series.status !== 200) continue;
    const issue = input.issueNumber.replace(/[^a-z0-9]/gi, "");
    if (!issue) continue;
    const link = new RegExp(`href="(/comic/\\d+/[a-z0-9-]*?-${issue.toLowerCase()})(?=["?])`, "i").exec(series.html)?.[1];
    if (!link) continue;
    const page = await fetchHtml(`${base}${link}`);
    if (!page) { errored = true; continue; }
    if (page.status !== 200) continue;
    const info = extractLocgIssue(page.html);
    if (!info.description) continue;
    if (!publishersAgree(info.publisher, input.publisher)) continue;
    if (input.year && info.year && Math.abs(info.year - input.year) > 1) continue;
    return {
      hit: { text: info.description, storyTitle: null, source: "League of Comic Geeks", sourceUrl: `${base}${link}`, license: null },
      errored,
    };
  }
  return { hit: null, errored };
}

/* ------------------------------------------------------------------ public */

export async function getStorySummary(input: StorySummaryInput): Promise<StorySummary | null> {
  if (!input.series?.trim() || !String(input.issueNumber ?? "").trim()) return null;
  const key = comicKey(input.series, String(input.issueNumber), input.year);
  const db = createAdminServerClient();

  try {
    const { data } = await db.from("issue_story_summaries").select("*").eq("comic_key", key).maybeSingle();
    if (data) {
      const age = Date.now() - new Date(data.checked_at).getTime();
      if (data.summary && age < POSITIVE_TTL_MS) {
        return { text: data.summary, storyTitle: data.story_title, source: data.source, sourceUrl: data.source_url, license: data.license };
      }
      if (!data.summary && age < NEGATIVE_TTL_MS) return null;
    }
  } catch {
    /* cache unavailable: fall through to a live lookup */
  }

  const outcomes: ProviderOutcome[] = [];
  let hit: StorySummary | null = null;
  for (const provider of [fromFandom, fromLocg]) {
    const out = await provider({ ...input, issueNumber: String(input.issueNumber).trim() });
    outcomes.push(out);
    if (out.hit) { hit = out.hit; break; }
  }

  // Only cache a "none found" when every source answered cleanly (a blocked/failed fetch is not a miss).
  const clean = !outcomes.some((o) => o.errored);
  if (hit || clean) {
    try {
      await db.from("issue_story_summaries").upsert({
        comic_key: key,
        series: input.series,
        issue_number: String(input.issueNumber),
        year: input.year,
        publisher: input.publisher,
        summary: hit?.text ?? null,
        story_title: hit?.storyTitle ?? null,
        source: hit?.source ?? null,
        source_url: hit?.sourceUrl ?? null,
        license: hit?.license ?? null,
        checked_at: new Date().toISOString(),
      });
    } catch {
      /* best-effort cache */
    }
  }
  return hit;
}
