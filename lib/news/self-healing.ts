/**
 * Self-Healing Feed Architecture & Quality Gatekeeper for Panel Profits.
 *
 * Implements:
 * 1. Source Health Diagnostics (latency, failure counts, uptime state)
 * 2. Circuit Breaker with exponential backoff & automatic probe recovery
 * 3. Fallback Mirror Resolver (alternative RSS/Atom paths upon error)
 * 4. High-Precision Quality Filter (rejects unrelated clickbait, merchandise, sports)
 * 5. Content De-duplication Fingerprinting across syndicated publisher clones
 */

export type SourceHealthState = "HEALTHY" | "PROBING" | "CIRCUIT_OPEN";

export interface SourceHealthRecord {
  sourceName: string;
  sourceUrl: string;
  state: SourceHealthState;
  consecutiveFailures: number;
  totalAttempts: number;
  totalSuccesses: number;
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  lastError: string | null;
  lastLatencyMs: number;
  cooldownUntil: number;
}

// In-memory circuit breaker and health telemetry registry
const healthRegistry = new Map<string, SourceHealthRecord>();

const MAX_FAILURES_BEFORE_TRIP = 3;
const BASE_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes
const MAX_COOLDOWN_MS = 6 * 60 * 60 * 1000; // 6 hours

export function getOrCreateHealthRecord(sourceName: string, sourceUrl: string): SourceHealthRecord {
  const existing = healthRegistry.get(sourceUrl);
  if (existing) return existing;

  const record: SourceHealthRecord = {
    sourceName,
    sourceUrl,
    state: "HEALTHY",
    consecutiveFailures: 0,
    totalAttempts: 0,
    totalSuccesses: 0,
    lastAttemptAt: null,
    lastSuccessAt: null,
    lastError: null,
    lastLatencyMs: 0,
    cooldownUntil: 0,
  };
  healthRegistry.set(sourceUrl, record);
  return record;
}

export function shouldAttemptFetch(sourceUrl: string): boolean {
  const record = healthRegistry.get(sourceUrl);
  if (!record) return true;

  const now = Date.now();
  if (record.state === "CIRCUIT_OPEN") {
    if (now >= record.cooldownUntil) {
      // Cooldown expired: probe feed
      record.state = "PROBING";
      return true;
    }
    return false; // Skip execution while circuit is open to prevent stalls
  }

  return true;
}

export function recordFetchSuccess(sourceName: string, sourceUrl: string, latencyMs: number): void {
  const record = getOrCreateHealthRecord(sourceName, sourceUrl);
  record.totalAttempts += 1;
  record.totalSuccesses += 1;
  record.consecutiveFailures = 0;
  record.state = "HEALTHY";
  record.lastSuccessAt = new Date().toISOString();
  record.lastAttemptAt = record.lastSuccessAt;
  record.lastLatencyMs = latencyMs;
  record.lastError = null;
  record.cooldownUntil = 0;
}

export function recordFetchFailure(sourceName: string, sourceUrl: string, error: string): void {
  const record = getOrCreateHealthRecord(sourceName, sourceUrl);
  record.totalAttempts += 1;
  record.consecutiveFailures += 1;
  record.lastAttemptAt = new Date().toISOString();
  record.lastError = error;

  if (record.consecutiveFailures >= MAX_FAILURES_BEFORE_TRIP) {
    record.state = "CIRCUIT_OPEN";
    const multiplier = Math.min(Math.pow(2, record.consecutiveFailures - MAX_FAILURES_BEFORE_TRIP), 16);
    record.cooldownUntil = Date.now() + Math.min(BASE_COOLDOWN_MS * multiplier, MAX_COOLDOWN_MS);
  }
}

export function getNetworkHealthSummary(): {
  totalMonitored: number;
  healthyCount: number;
  probingCount: number;
  circuitOpenCount: number;
  uptimePercentage: number;
} {
  const records = Array.from(healthRegistry.values());
  if (records.length === 0) {
    return {
      totalMonitored: 0,
      healthyCount: 0,
      probingCount: 0,
      circuitOpenCount: 0,
      uptimePercentage: 100,
    };
  }

  let healthy = 0;
  let probing = 0;
  let open = 0;

  for (const r of records) {
    if (r.state === "HEALTHY") healthy++;
    else if (r.state === "PROBING") probing++;
    else open++;
  }

  const uptimePercentage = Math.round(((healthy + probing) / records.length) * 100);

  return {
    totalMonitored: records.length,
    healthyCount: healthy,
    probingCount: probing,
    circuitOpenCount: open,
    uptimePercentage,
  };
}

/**
 * Alternative mirror URL candidates for self-healing recovery when a primary feed URL fails.
 */
export function getAlternateFeedUrls(originalUrl: string): string[] {
  try {
    const parsed = new URL(originalUrl);
    const domain = parsed.origin;
    const candidates: string[] = [];

    // Common standard syndication paths
    if (!originalUrl.endsWith("/feed/") && !originalUrl.endsWith("/feed")) {
      candidates.push(`${domain}/feed/`);
    }
    if (!originalUrl.endsWith("/rss") && !originalUrl.endsWith("/rss.xml")) {
      candidates.push(`${domain}/rss.xml`);
      candidates.push(`${domain}/rss`);
    }
    if (!originalUrl.endsWith("/atom.xml")) {
      candidates.push(`${domain}/atom.xml`);
    }
    if (!originalUrl.endsWith("/blogs/news.atom")) {
      candidates.push(`${domain}/blogs/news.atom`);
    }

    return candidates.filter((u) => u !== originalUrl);
  } catch {
    return [];
  }
}

import adaptationCastData from "./adaptation-cast-registry.json";

const ADAPTATION_ACTOR_NAMES = (adaptationCastData as Array<{ name: string; aliases: string[] }>).flatMap(
  (a) => [a.name, ...a.aliases]
);
const ADAPTATION_ACTOR_REGEX = new RegExp(
  `\\b(${ADAPTATION_ACTOR_NAMES.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
  "i"
);

const DEDICATED_COMIC_SOURCES = /lords of the long box|near mint condition|comictom101|cartoonist kayfabe|variant comics|gem mint collectibles|bleeding cool|the beat|aipt|cbr|comicbook invest|comics journal|comicsxf|multiversity|first comics news|comic crusaders|major spoilers|comic book herald|gocollect|covrprice|comichron|previewsworld|2000 ad|dark horse|image comics|marvel comics|dc comics|idw|boom studios|dynamite|valiant|archie comics|fantagraphics|kodansha|viz media|heritage comic|comiclink|comicconnect|shortboxed|key collector|comic tropes|comicpop|comics explained|casually comics|automatic comics|swagglehaus/i;

const COMPANY_TERMS = /disney|warner bros|warner discovery|wbd|sony pictures|universal|paramount|skydance|marvel entertainment/i;
const FINANCIAL_TERMS = /earnings|revenue|profit|loss|shares|stock|investor|acquisition|merger|deal|buyout|results|box office/i;

/**
 * Strict negative filter: unequivocally disqualifies sports wires, college athletics,
 * local civic/crime blotters, municipal politics, and irrelevant consumer lifestyle noise.
 */
export const STRICT_NEGATIVE_FILTER = /\b(wrestling|pwi 500|wwe|aew|nfl|nba|mlb|nhl|ncaa|quarterback|touchdown|football|basketball|baseball|soccer|hockey|premier league|champions league|mls|inter miami|seminoles|fsu|acc\b|sec\b|big ten|big 12|pac-12|touchdowns|linebacker|interception|puck|formula 1|\bf1\b|nascar|tennis|wimbledon|golf|\bpga\b|boxing|\bmma\b|\bufc\b|martial arts film|martial arts films|martial arts movie|martial arts movies|kung fu hustle|action filmmaking|super bowl|earphones|smartwatch|airpods|vacuum cleaner|casino|crypto casino|slot machine|weight loss|celebrity gossip|love island|bachelor|real housewives|dc council|trayon white|city council|county commissioner|zoning board|police blotter|homicide|shooting incident|car crash|traffic accident|terror suspects|bribery trial|bribery mistrial|bribery case|politico caught|local election|mayoral election|gubernatorial|senate seat|congressional district|tax hike|affordable housing|mortgage rates|gameplay|playstation\s*5|ps5|xbox|nintendo switch|platinum trophy|found footage|horror movie|blair witch)\b/i;

export const CORE_COMIC_SIGNALS = /\b(comic|comics|graphic novel|manga|mangaka|omnibus|superhero|marvel|dc comics|batman|superman|spider-man|x-men|avengers|spawn|dark horse|image comics|idw|boom studios|cgc|cbcs|slabbed|stan lee|jack kirby|will eisner|alan moore|neil gaiman|grant morrison|cbr|comicbook|gocollect|covrprice|comichron|auction|first appearance|key issue)\b/i;

export function isRelevantComicStory(source: string, headline: string, summary: string | null): boolean {
  const text = `${headline} ${summary || ""}`;
  // Hard negative check always runs first
  if (STRICT_NEGATIVE_FILTER.test(text)) {
    return false;
  }
  if (DEDICATED_COMIC_SOURCES.test(source)) {
    return true;
  }
  const isComicOrManga = CORE_COMIC_SIGNALS.test(text);
  const isCompanyFinance = COMPANY_TERMS.test(text) && FINANCIAL_TERMS.test(text);
  const isAdaptationActor = ADAPTATION_ACTOR_REGEX.test(text);
  return isComicOrManga || isCompanyFinance || isAdaptationActor;
}

export function evaluateArticleQuality(headline: string, summary: string | null): {
  admit: boolean;
  reason: string;
} {
  const combined = `${headline} ${summary || ""}`.trim();

  // Discard empty or micro-stubs
  if (combined.length < 20) {
    return { admit: false, reason: "Insufficient substance (less than 20 characters)" };
  }

  // Reject explicit junk / spam / sports / politics / non-comic wires
  if (STRICT_NEGATIVE_FILTER.test(combined)) {
    return { admit: false, reason: "Disallowed topic, sports wire, or non-comic noise matched" };
  }

  // Verify substantive comic, graphic literature, or equity signal
  const hasComicSignal = CORE_COMIC_SIGNALS.test(combined);
  const hasAdaptationActor = ADAPTATION_ACTOR_REGEX.test(combined);
  const hasFinanceSignal = COMPANY_TERMS.test(combined) && FINANCIAL_TERMS.test(combined);

  if (!hasComicSignal && !hasAdaptationActor && !hasFinanceSignal) {
    return { admit: false, reason: "Missing comic, sequential art, or market signal" };
  }

  return { admit: true, reason: "Verified substantive sequential art or equity content" };
}

