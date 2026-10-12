import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { normalizeAuctionTitle, parseAndFilterListing } from "@/lib/sniper/anti-bullshit";
import { resolveAuthoritativePublisher } from "@/lib/comics/publisher-authority";
import {
  searchEbayMultiStream,
  searchEbayLiveAuctions,
} from "@/lib/sniper/ebay-api";
import { RawAuctionListing } from "@/lib/sniper/types";

const requireModule = createRequire(import.meta.url);

let ppDbInstance: any = null;
let ppDbChecked = false;
function getPpDb(): any | null {
  if (ppDbChecked) return ppDbInstance;
  ppDbChecked = true;
  const p = path.resolve(process.cwd(), "data", "pp115k.sqlite");
  if (fs.existsSync(p)) {
    try {
      const { DatabaseSync } = requireModule("node:sqlite");
      ppDbInstance = new DatabaseSync(p, { readOnly: true });
    } catch {}
  }
  return ppDbInstance;
}

let cbDbInstance: any = null;
let cbDbChecked = false;
function getCbDb(): any | null {
  if (cbDbChecked) return cbDbInstance;
  cbDbChecked = true;
  const p = path.resolve(process.cwd(), "data", "comicbase.sqlite");
  if (fs.existsSync(p)) {
    try {
      const { DatabaseSync } = requireModule("node:sqlite");
      cbDbInstance = new DatabaseSync(p, { readOnly: true });
    } catch {}
  }
  return cbDbInstance;
}

function resolveAuctionDbMetadata(title: string, rawGrade?: number): { fmv: number | null; publisher: string | null } {
  const parsed = parseAndFilterListing(title);
  const series = parsed.extractedSeries?.trim() || "";
  const issue = parsed.extractedIssue?.trim() || "1";
  const cleanSeries = series.toLowerCase();
  const grade = rawGrade ?? parsed.grade ?? 9.8;

  let fmv: number | null = null;
  let publisher: string | null = null;

  const ppDb = getPpDb();
  if (ppDb && series && series !== "Unknown Series") {
    try {
      const candidates = [series, "The " + series, series + ", The"];
      const stmt = ppDb.prepare("SELECT fmv_usd, publisher, publication_year FROM verified_equities WHERE series = ? AND issue_number = ? LIMIT 1");
      for (const cand of candidates) {
        const ve = stmt.get(cand, issue) as any;
        if (ve) {
          if (ve.fmv_usd > 0) fmv = Number(ve.fmv_usd);
          if (ve.publisher) publisher = resolveAuthoritativePublisher(series, ve.publisher, ve.publication_year);
          break;
        }
      }
    } catch {}
  }

  const cbDb = getCbDb();
  if (cbDb && series && series !== "Unknown Series") {
    try {
      const candidates = [cleanSeries, cleanSeries + ", the", "the " + cleanSeries];
      const stmt = cbDb.prepare("SELECT val_2024, price, publisher, year FROM comicbase_items WHERE clean_series = ? AND issue_number = ? ORDER BY val_2024 DESC LIMIT 1");
      for (const cand of candidates) {
        const cb = stmt.get(cand, issue) as any;
        if (cb) {
          if (!publisher && cb.publisher) {
            publisher = resolveAuthoritativePublisher(series, cb.publisher, cb.year);
          }
          if (!fmv) {
            const base = cb.val_2024 > 0 ? Number(cb.val_2024) : Number(cb.price);
            if (base > 0) {
              if (grade >= 9.8) {
                fmv = Math.max(35, Math.round(base * 2.2));
              } else if (grade >= 9.4) {
                fmv = Math.max(25, Math.round(base * 1.5));
              } else if (grade >= 9.0) {
                fmv = Math.max(20, Math.round(base * 1.0));
              } else if (grade >= 8.5) {
                fmv = Math.max(15, Math.round(base * 0.75));
              } else {
                fmv = Math.max(10, Math.round(base * 0.5));
              }
            }
          }
          break;
        }
      }
    } catch {}
  }

  if (!publisher && series && series !== "Unknown Series") {
    publisher = resolveAuthoritativePublisher(series, null, parsed.extractedYear);
  }

  return { fmv, publisher };
}

// Read verified multi-source catalog (Heritage, MyComicShop, ComicConnect, Metropolis, Hake's, Atomic Avenue, Shortboxed, ComicLink, HipComic, Goldin, eBay)
function loadBaselineMultiSourceCatalog(): RawAuctionListing[] {
  try {
    const p = path.resolve(process.cwd(), "data", "live_auctions.json");
    if (fs.existsSync(p)) {
      const data = fs.readFileSync(p, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Failed to load baseline live_auctions.json:", err);
  }
  return [];
}

// In-memory cache for live streams to protect quotas and deliver sub-10ms response times
interface StreamCache {
  items: RawAuctionListing[];
  timestamp: number;
}
let streamCache: StreamCache | null = null;
const CACHE_TTL_MS = 60000; // 60 seconds

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shouldRefresh = searchParams.get("refresh") === "true";
  const searchQuery = searchParams.get("q");
  const sourceFilter = searchParams.get("source");
  const publisherFilter = searchParams.get("publisher");
  const angleFilter = searchParams.get("angle");
  const minGradeParam = searchParams.get("minGrade");
  const minGrade = minGradeParam ? parseFloat(minGradeParam) : 8.5;

  try {
    // 1. Always load verified multi-source baseline catalog
    const baselineItems = loadBaselineMultiSourceCatalog();

    let combinedAuctions: RawAuctionListing[] = [];
    const seenIds = new Set<string>();

    // 2. Fetch live eBay stream if available and not rate-limited
    let liveEbay: RawAuctionListing[] = [];
    if (searchQuery && searchQuery.trim().length > 0) {
      try {
        liveEbay = await searchEbayLiveAuctions({
          query: searchQuery.trim(),
          limit: 25,
        });
      } catch (err) {
        console.warn("[Sniper Live] eBay query search failed or rate-limited, using multi-source baseline:", err);
      }
    } else {
      const now = Date.now();
      if (!shouldRefresh && streamCache && now - streamCache.timestamp < CACHE_TTL_MS) {
        liveEbay = streamCache.items;
      } else {
        try {
          liveEbay = await searchEbayMultiStream();
          streamCache = {
            items: liveEbay,
            timestamp: now,
          };
        } catch (err) {
          console.warn("[Sniper Live] eBay multi-stream failed or rate-limited, using multi-source baseline:", err);
          liveEbay = streamCache ? streamCache.items : [];
        }
      }
    }

    // 3. Merge live eBay items (if any) first
    for (const it of liveEbay) {
      if (!seenIds.has(it.id)) {
        seenIds.add(it.id);
        combinedAuctions.push(it);
      }
    }

    // 4. Merge multi-source baseline items (Heritage, MyComicShop, ComicConnect, Metropolis, Hake's, Atomic Avenue, ComicLink, etc.)
    for (const it of baselineItems) {
      if (!seenIds.has(it.id)) {
        seenIds.add(it.id);
        combinedAuctions.push(it);
      }
    }

    // 5. Apply dynamic filters if query parameters provided
    let filteredAuctions = combinedAuctions;

    // Filter by search query (title or series match)
    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      filteredAuctions = filteredAuctions.filter((item) =>
        item.title.toLowerCase().includes(q) ||
        (item.itemDescription && item.itemDescription.toLowerCase().includes(q))
      );
    }

    // Filter by source (e.g. heritage, mycomicshop, comicconnect, atomicavenue)
    if (sourceFilter && sourceFilter.trim().length > 0) {
      const src = sourceFilter.toLowerCase().trim();
      filteredAuctions = filteredAuctions.filter((item) => item.source.toLowerCase() === src);
    }

    // Filter by publisher (e.g. dc, marvel, image, dark horse, kodansha, viz, lev gleason)
    if (publisherFilter && publisherFilter.trim().length > 0) {
      const pub = publisherFilter.toLowerCase().trim();
      filteredAuctions = filteredAuctions.filter((item) => {
        const itemPub = (item.gcdMetadata?.publisher || "").toLowerCase();
        return itemPub.includes(pub) || item.title.toLowerCase().includes(pub);
      });
    }

    // Filter by special strategy angle
    if (angleFilter && angleFilter.trim().length > 0) {
      const angle = angleFilter.toLowerCase().trim();
      if (angle === "cracked_case" || angle === "reholder") {
        filteredAuctions = filteredAuctions.filter((item) =>
          /crack|scuff|reholder|damaged|shell/i.test(item.title) ||
          /crack|scuff|reholder|damaged|shell/i.test(item.itemDescription || "")
        );
      } else if (angle === "typo" || angle === "misspelled") {
        filteredAuctions = filteredAuctions.filter((item) =>
          /spidre|avenegr|batamn|wovlerine|thng|fantatsic|punsiher|catwman|daredevl/i.test(item.title)
        );
      } else if (angle === "manga") {
        filteredAuctions = filteredAuctions.filter((item) =>
          /akira|dragon ball|one piece|ghost in the shell|nausica[aä]|naruto|bleach|manga/i.test(item.title)
        );
      } else if (angle === "cpv") {
        filteredAuctions = filteredAuctions.filter((item) =>
          /canadian|cpv|75¢|95¢|\$1\.00|alpha flight|captain canuck/i.test(item.title)
        );
      } else if (angle === "foreign") {
        filteredAuctions = filteredAuctions.filter((item) =>
          item.source.includes("ebay_") ||
          /french|german|uk|lug|semic|strange|2000 ad|captain britain|topolino/i.test(item.title)
        );
      } else if (angle === "placeholder_85") {
        filteredAuctions = filteredAuctions.filter((item) =>
          item.resolvedGrade !== undefined && item.resolvedGrade <= 9.2 && item.resolvedGrade >= 8.5
        );
      }
    }

    // Filter by minimum grade (defaults to 8.5)
    if (!isNaN(minGrade) && minGrade > 0) {
      filteredAuctions = filteredAuctions.filter((item) => {
        if (item.resolvedGrade !== undefined) {
          return item.resolvedGrade >= minGrade;
        }
        const parsed = parseAndFilterListing(item.title);
        return (parsed.grade ?? 9.8) >= minGrade;
      });
    }

    if (filteredAuctions.length > 0) {
      const nowSec = Math.floor(Date.now() / 1000);
      const updatedAuctions = filteredAuctions.map((item, idx) => {
        // Continuous 24/7 rolling microwave stream:
        // Stagger lots evenly across the 30-minute microwave cycle (1800s)
        const cyclePeriod = 1800;
        const baseOffset = Number(item.secondsRemaining ?? 300);
        const staggeredAnchor = (baseOffset + idx * 53) % cyclePeriod;
        const currentElapsed = nowSec % cyclePeriod;
        let secs = (staggeredAnchor - currentElapsed + cyclePeriod) % cyclePeriod;
        if (secs < 20) {
          secs += cyclePeriod; // Keep at least 20s active in live killzone
        }

        const rawTitle = String(item.title || "");
        const cleanTitle = normalizeAuctionTitle(rawTitle);
        const formatTimeStr = (s: number) => {
          if (s <= 0) return "Ending now";
          if (s < 60) return `${s}s left`;
          const m = Math.floor(s / 60);
          const remSecs = s % 60;
          if (m < 60) return `${m}m ${remSecs > 0 ? remSecs + "s " : ""}left`;
          const h = Math.floor(m / 60);
          return `${h}h ${m % 60}m left`;
        };

        const dbMeta = resolveAuctionDbMetadata(rawTitle, item.resolvedGrade);
        const resolvedFmv = (item.anchorFmv && item.anchorFmv > 0)
          ? item.anchorFmv
          : (item.fairMarketValue && item.fairMarketValue > 0)
            ? item.fairMarketValue
            : dbMeta.fmv ?? undefined;

        const resolvedPub = dbMeta.publisher || item.gcdMetadata?.publisher || undefined;

        return {
          ...item,
          normalizedTitle: cleanTitle,
          secondsRemaining: secs,
          timeLeftStr: formatTimeStr(secs),
          anchorFmv: resolvedFmv,
          fairMarketValue: resolvedFmv,
          gcdMetadata: {
            ...item.gcdMetadata,
            publisher: resolvedPub,
          },
        };
      });

      return NextResponse.json({
        success: true,
        count: updatedAuctions.length,
        auctions: updatedAuctions,
        source: liveEbay.length > 0 ? "multi_source_and_live_ebay" : "verified_multi_source_catalog",
        fetchedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      count: 0,
      auctions: [],
      source: "empty",
      fetchedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("Live auctions route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error)?.message || "Failed to load live auctions",
        auctions: [],
      },
      { status: 500 }
    );
  }
}
