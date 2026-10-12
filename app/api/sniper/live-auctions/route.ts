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
              fmv = grade >= 9.8 ? Math.max(35, Math.round(base * 2.2)) : Math.max(25, Math.round(base * (grade >= 9.4 ? 1.5 : 1.0)));
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

  try {
    let auctions: RawAuctionListing[] = [];

    // If user provided a specific search query, query eBay Developer API directly
    if (searchQuery && searchQuery.trim().length > 0) {
      auctions = await searchEbayLiveAuctions({
        query: searchQuery.trim(),
        limit: 25,
      });
    } else {
      // Check in-memory cache for multi-stream
      const now = Date.now();
      if (!shouldRefresh && streamCache && now - streamCache.timestamp < CACHE_TTL_MS) {
        auctions = streamCache.items;
      } else {
        // Query official eBay REST API across multi-stream (US, UK, CA, AU, CGC, CBCS, PSA)
        const liveEbay = await searchEbayMultiStream();

        // Deduplicate official live eBay items
        const seenIds = new Set<string>();
        const combined: RawAuctionListing[] = [];

        for (const it of liveEbay) {
          if (!seenIds.has(it.id)) {
            seenIds.add(it.id);
            combined.push(it);
          }
        }

        auctions = combined;
        streamCache = {
          items: combined,
          timestamp: now,
        };
      }
    }

    if (Array.isArray(auctions) && auctions.length > 0) {
      const nowSec = Math.floor(Date.now() / 1000);
      const updatedAuctions = auctions.map((item, idx) => {
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

        const dbMeta = resolveAuctionDbMetadata(rawTitle);
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
        source: "official_ebay_developer_api",
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

