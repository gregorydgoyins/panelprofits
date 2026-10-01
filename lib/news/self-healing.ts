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

export {
  isRelevantComicStory,
  evaluateArticleQuality,
  isFreshArticle,
  STRICT_NEGATIVE_FILTER,
  COMPREHENSIVE_COMIC_SIGNALS as CORE_COMIC_SIGNALS,
  DEDICATED_COMIC_SOURCES_REGEX as DEDICATED_COMIC_SOURCES,
} from "./classifier";


