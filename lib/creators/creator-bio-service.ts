import seedData from "./creators-seed.json";

export interface CreatorBio {
  name: string;
  slug: string;
  description?: string;
  bio: string;
  imageUrl?: string | null;
  birthCity?: string;
  deathCity?: string;
  birthDate?: string;
  deathDate?: string;
  source: "CANONICAL_SEED" | "WIKIPEDIA" | "GCD";
}

const memoryCache = new Map<string, CreatorBio | null>();

// Initialize memory cache from seed dataset
for (const [key, value] of Object.entries(seedData as Record<string, any>)) {
  memoryCache.set(key, {
    name: value.name,
    slug: value.slug,
    description: value.description || undefined,
    bio: value.bio || "",
    imageUrl: value.imageUrl || null,
    birthCity: value.birthCity || undefined,
    deathCity: value.deathCity || undefined,
    birthDate: value.birthDate || undefined,
    deathDate: value.deathDate || undefined,
    source: "CANONICAL_SEED",
  });
}

export function slugifyCreatorName(name: string): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Fetch creator biography and portrait image with zero latency for pre-seeded creators,
 * and graceful live Wikipedia REST API fallback for any unseeded creator.
 */
export async function getCreatorBio(nameOrSlug: string): Promise<CreatorBio | null> {
  if (!nameOrSlug) return null;
  const slug = slugifyCreatorName(nameOrSlug);
  const normalizedKey = slug;

  // 1. In-memory seed cache hit
  if (memoryCache.has(normalizedKey)) {
    return memoryCache.get(normalizedKey) || null;
  }

  // Also check direct match on name in memory cache
  for (const item of memoryCache.values()) {
    if (item && (item.name.toLowerCase() === nameOrSlug.toLowerCase() || item.slug === slug)) {
      memoryCache.set(normalizedKey, item);
      return item;
    }
  }

  // 2. Dynamic Wikipedia fallback lookup
  try {
    const cleanSearchName = nameOrSlug.replace(/^(by|art|writer|pencils|colors?|editor):\s*/i, "").trim();
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3500);

    const endpoint = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanSearchName)}`;
    const res = await fetch(endpoint, {
      headers: { "User-Agent": "PanelProfitsBot/1.0 (info@comicbookstockexchange.com; creator bio)" },
      signal: ctrl.signal,
      next: { revalidate: 86400 * 7 }, // Cache for 7 days
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (data && data.extract && !data.title?.includes("disambiguation")) {
        const result: CreatorBio = {
          name: data.title || cleanSearchName,
          slug,
          description: data.description || "Comic Book Creative Architect",
          bio: data.extract,
          imageUrl: data.thumbnail?.source || null,
          source: "WIKIPEDIA",
        };
        memoryCache.set(normalizedKey, result);
        return result;
      }
    }
  } catch {
    // network or abort, pass through
  }

  // 3. Fallback entry for uncataloged creator to guarantee link integrity
  const fallback: CreatorBio = {
    name: nameOrSlug,
    slug,
    description: "Comic Book Creative Architect",
    bio: `${nameOrSlug} is an active creative contributor in sovereign comic book history and canon.`,
    imageUrl: null,
    source: "CANONICAL_SEED",
  };
  memoryCache.set(normalizedKey, fallback);
  return fallback;
}
