import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { normalizeAuctionTitle, parseAndFilterListing } from "@/lib/sniper/anti-bullshit";
import { resolveAuthoritativePublisher } from "@/lib/comics/publisher-authority";
import { lookupSqliteCover, lookupSqliteGallery } from "@/lib/comics/sqlite-covers";
import { lookupRealCensus } from "@/lib/comics/census-authority";
import { readLiveListings } from "@/lib/sniper/market-store";
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("q");
  const sourceFilter = searchParams.get("source");
  const publisherFilter = searchParams.get("publisher");
  const angleFilter = searchParams.get("angle");
  const minGradeParam = searchParams.get("minGrade");
  const minGrade = minGradeParam ? parseFloat(minGradeParam) : 0.5;

  try {
    // Live auctions come from the Sniper store, which the scheduled snapshot fills from eBay's Browse API.
    // Visitors never call eBay from here, so page traffic cannot use up the eBay allowance.
    const { items: stored, asOf } = await readLiveListings();
    const combinedAuctions: RawAuctionListing[] = stored;
    const fetchedAtMs = Date.now(); // seconds remaining were computed from each lot's end time just now

    // 4. Apply dynamic filters if query parameters provided
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

    // Filter by minimum grade (only if explicitly specified)
    if (minGradeParam && !isNaN(minGrade) && minGrade > 0.5) {
      filteredAuctions = filteredAuctions.filter((item) => {
        if (item.resolvedGrade !== undefined) {
          return item.resolvedGrade >= minGrade;
        }
        const parsed = parseAndFilterListing(item.title);
        return (parsed.grade ?? 9.8) >= minGrade;
      });
    }

    // Filter by listing type (auctions vs buy it now)
    const typeParam = searchParams.get("type");
    if (typeParam === "bin" || typeParam === "buy_it_now") {
      filteredAuctions = filteredAuctions.filter((item) =>
        Boolean(item.isBuyItNow || item.listingType === "BuyItNow")
      );
    } else if (typeParam === "auction" || typeParam === "auctions") {
      filteredAuctions = filteredAuctions.filter((item) =>
        !item.isBuyItNow && item.listingType !== "BuyItNow"
      );
    }

    if (filteredAuctions.length > 0) {
      const updatedAuctions = filteredAuctions.map((item) => {
        const isBin = Boolean(item.isBuyItNow || item.listingType === "BuyItNow" || (item.buyItNowPrice && item.buyItNowPrice > 0));

        // Real time remaining: eBay's end time as of the fetch, minus the time since the fetch. No simulated cycle.
        // Buy It Now listings have no end time; 86400 is a placeholder the page does not display.
        const secs = isBin ? 86400 : Math.max(0, Math.round(Number(item.secondsRemaining ?? 0) - (Date.now() - fetchedAtMs) / 1000));

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

        // The bid and bid count are exactly what eBay reported at fetch time; nothing is projected.
        const realTimeBid = Number(item.currentBid || 0);
        const realTimeBidCount = Number(item.bidCount ?? 0);

        // Authoritative Cover & Multi-Image Gallery Resolution from local 115k highres SQLite database
        const parsed = parseAndFilterListing(rawTitle);
        // The listing's own eBay photo is the picture of the actual book; the catalog cover only backs it up.
        const catalogCover = lookupSqliteCover(parsed.extractedSeries, parsed.extractedIssue) || "";
        const resolvedCover = item.imageUrl || catalogCover;
        const sqliteGallery = lookupSqliteGallery(parsed.extractedSeries, parsed.extractedIssue);

        // Ensure safe, cleanly-encoded URLs without multi-encoding bugs
        const normalizeUrl = (u: string): string => {
          if (!u) return "";
          let curr = u.trim();
          while (curr.includes("%25")) {
            try { curr = decodeURI(curr); } catch { break; }
          }
          try { return encodeURI(decodeURI(curr)); } catch { return curr; }
        };

        const safeCoverUrl = normalizeUrl(resolvedCover);

        // Merge item-provided gallery and SQLite catalog gallery
        const galleryList: string[] = [];
        const seenUrls = new Set<string>();
        const addGallery = (u?: string | null) => {
          if (!u) return;
          const norm = normalizeUrl(u);
          if (norm && !seenUrls.has(norm)) {
            seenUrls.add(norm);
            galleryList.push(norm);
          }
        };

        addGallery(safeCoverUrl);
        if (item.galleryImages && Array.isArray(item.galleryImages)) {
          for (const img of item.galleryImages) addGallery(img);
        }
        // Catalog art goes last: the viewer reaches it only if every eBay photo fails to load.
        addGallery(catalogCover);
        for (const img of sqliteGallery) addGallery(img);

        // Authoritative Real Census Resolution (No fake formula estimations)
        const realCensus = lookupRealCensus(parsed.extractedSeries, parsed.extractedIssue);
        const resolvedCensusTotal = (item.censusTotal && item.censusTotal > 0)
          ? item.censusTotal
          : realCensus?.totalGraded;
        const resolvedCensus98 = (item.censusCount98 && item.censusCount98 > 0)
          ? item.censusCount98
          : (realCensus && realCensus.topGrade === "9.8" ? realCensus.totalGraded : undefined);

        return {
          ...item,
          normalizedTitle: cleanTitle,
          imageUrl: safeCoverUrl,
          galleryImages: galleryList.length > 0 ? galleryList : [safeCoverUrl],
          currentBid: isBin ? (item.buyItNowPrice ?? item.currentBid) : realTimeBid,
          bidCount: isBin ? 0 : realTimeBidCount,
          secondsRemaining: secs,
          timeLeftStr: isBin ? "Buy It Now · Available" : formatTimeStr(secs),
          anchorFmv: resolvedFmv,
          fairMarketValue: resolvedFmv,
          censusTotal: resolvedCensusTotal,
          censusCount98: resolvedCensus98,
          listingType: isBin ? "BuyItNow" : "Auction",
          isBuyItNow: isBin,
          buyItNowPrice: isBin ? (item.buyItNowPrice ?? item.currentBid) : undefined,
          gcdMetadata: {
            ...item.gcdMetadata,
            publisher: resolvedPub,
          },
        };
      });

      const liveAuctions = updatedAuctions.filter((a) => a.secondsRemaining > 0 && Boolean(a.imageUrl));
      const activeVenues = Array.from(new Set(liveAuctions.map((a) => a.source)));
      return NextResponse.json({
        success: true,
        count: liveAuctions.length,
        auctions: liveAuctions,
        venues: activeVenues,
        source: "ebay_browse_api",
        dataAsOf: asOf,
        fetchedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      count: 0,
      auctions: [],
      venues: [],
      source: "ebay_browse_api",
      dataAsOf: asOf,
      message: asOf
        ? "No live eBay listings match the active filters."
        : "No eBay listings are stored yet. The snapshot job has not completed a run; check /api/sniper/status.",
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
