import ce70Dossiers from "@/lib/equity/ce70-dossiers-data.json";
import ce70ReferenceFmv from "@/lib/equity/ce70-reference-fmv.json";
import ppix100Data from "@/lib/equity/ppix-100-constituents.json";
import verifiedCovers from "@/lib/equity/verified-covers.json";
import { INITIAL_SURFACE_ASSETS } from "@/lib/assets/initial-assets";
import { getAuthoritativeCover } from "@/lib/comics/cover-authority";

const REF_FMV_MAP = ce70ReferenceFmv as Record<string, any>;

export type UniverseMode = "ce70" | "ppix100" | "cpi" | "assets";

export interface FeaturedComicConstituent {
  id: string;
  series: string;
  issueNumber: string;
  title: string;
  publisher: string;
  year: number;
  era: string;
  referenceGrade: string;
  fmv: number;
  formattedFmv: string;
  coverUrl: string | null;
  seatNumber?: number;
  detailUrl: string;
  badge?: string;
  gregoryScore?: number;
}

export interface CPICategoryConstituent {
  id: string;
  comicName: string;
  series: string;
  issueNumber: string;
  year: number;
  publisher: string;
  coverUrl: string | null;
  totalPoints: number;
  impliedWeight: string;
  detailUrl: string;
}

export interface CPICategory {
  code: string;
  name: string;
  era: string;
  divisor: number;
  qualifyingGrades: string;
  salesLookback: string;
  indexPoints: number;
  changePercent: number;
  constituents: CPICategoryConstituent[];
}

export interface FeaturedAssetConstituent {
  id: string;
  assetId: string;
  symbol: string;
  displayName: string;
  assetType: string;
  universe: string;
  priceFormatted: string;
  priceValue: number;
  priceLabel: string;
  deltaPercent: number;
  coverUrl: string;
  description: string;
  detailUrl: string;
}

// ─────────────────────────────────────────────────────────────
// 1. CE70 Constitutional Blue Chip Index (70 Seats)
// ─────────────────────────────────────────────────────────────
export function getCE70Constituents(): FeaturedComicConstituent[] {
  return ce70Dossiers.map((seat: any) => {
    const seatNum = seat.seatNumber;
    const refData = REF_FMV_MAP[String(seatNum)] || REF_FMV_MAP[seat.title] || {};
    const baseFmv = refData.referenceFmvUsd ?? refData.grade98FmvUsd ?? 150;
    const grade = refData.referenceGrade ?? "9.0";
    const match = seat.title.match(/^(.*?)(?:\s+#(\d+.*))?$/);
    const series = match && match[1] ? match[1].trim() : seat.title;
    const issueNumber = match && match[2] ? match[2].trim() : "1";
    const cover = getAuthoritativeCover(series, issueNumber, seat.publisher, seat.year);

    return {
      id: `seat-${seatNum}`,
      seatNumber: seatNum,
      series,
      issueNumber,
      title: seat.title,
      publisher: seat.publisher || "DC Comics",
      year: seat.year || 1970,
      era: String(seat.era || "GOLDEN").toUpperCase(),
      referenceGrade: grade,
      fmv: baseFmv,
      formattedFmv: `$${baseFmv.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      coverUrl: cover,
      detailUrl: `/comics/seat-${seatNum}`,
      badge: `SEAT #${seatNum}`,
      gregoryScore: seat.gregoryScore,
    };
  });
}

// ─────────────────────────────────────────────────────────────
// 2. PPIX 100 Multi-Era Benchmark (100 Landmark Books)
// ─────────────────────────────────────────────────────────────
export function getPPIX100Constituents(): FeaturedComicConstituent[] {
  return (ppix100Data as any[]).map((book, idx) => {
    const seatMatch = book.key ? book.key.match(/^(\d+)$/) : null;
    const seatId = seatMatch ? `seat-${seatMatch[1]}` : `ppix-100-${idx + 1}`;
    const detailUrl = seatMatch ? `/comics/seat-${seatMatch[1]}` : `/comics/${seatId}`;
    const cover = getAuthoritativeCover(book.series, book.issueNumber, book.publisher, book.year);

    return {
      id: seatId,
      series: book.series,
      issueNumber: String(book.issueNumber),
      title: book.title,
      publisher: book.publisher || "Marvel / DC",
      year: book.year,
      era: String(book.era).toUpperCase(),
      referenceGrade: book.referenceGrade || "9.0",
      fmv: book.fmv,
      formattedFmv: `$${Number(book.fmv).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      coverUrl: cover,
      detailUrl,
      badge: `${String(book.era).toUpperCase()} ERA`,
    };
  });
}

// ─────────────────────────────────────────────────────────────
// 3. GoCollect Comic Price Index (CPI) (6 Categories)
// ─────────────────────────────────────────────────────────────
export const GOCOLLECT_CPI_CATEGORIES: CPICategory[] = [
  {
    code: "GC_CPI_GOLDEN",
    name: "Golden Age CPI",
    era: "GOLDEN AGE",
    divisor: 1800.0,
    qualifyingGrades: "0.5 – 8.0",
    salesLookback: "Last 3 Certified Sales",
    indexPoints: 1845.20,
    changePercent: 0.38,
    constituents: [
      {
        id: "cpi-gold-cap1",
        comicName: "Captain America Comics #1",
        series: "Captain America Comics",
        issueNumber: "1",
        year: 1941,
        publisher: "Timely Comics",
        coverUrl: getAuthoritativeCover("Captain America Comics", "1", "Timely Comics", 1941),
        totalPoints: 855.0,
        impliedWeight: "25.0%",
        detailUrl: "/comics/seat-7",
      },
      {
        id: "cpi-gold-marv1",
        comicName: "Marvel Comics #1",
        series: "Marvel Comics",
        issueNumber: "1",
        year: 1939,
        publisher: "Timely Comics",
        coverUrl: getAuthoritativeCover("Marvel Comics", "1", "Timely Comics", 1939),
        totalPoints: 1026.0,
        impliedWeight: "30.0%",
        detailUrl: "/comics/seat-1",
      },
      {
        id: "cpi-gold-allstar8",
        comicName: "All Star Comics #8",
        series: "All Star Comics",
        issueNumber: "8",
        year: 1941,
        publisher: "DC Comics",
        coverUrl: getAuthoritativeCover("All Star Comics", "8", "DC Comics", 1941),
        totalPoints: 780.0,
        impliedWeight: "23.0%",
        detailUrl: "/comics/seat-5",
      },
      {
        id: "cpi-gold-bat1",
        comicName: "Batman #1",
        series: "Batman",
        issueNumber: "1",
        year: 1940,
        publisher: "DC Comics",
        coverUrl: getAuthoritativeCover("Batman", "1", "DC Comics", 1940),
        totalPoints: 759.0,
        impliedWeight: "22.0%",
        detailUrl: "/comics/seat-31",
      },
    ],
  },
  {
    code: "GC_CPI_SILVER",
    name: "Silver Age CPI",
    era: "SILVER AGE",
    divisor: 1113.0,
    qualifyingGrades: "2.5 – 8.5",
    salesLookback: "Last 3 Certified Sales",
    indexPoints: 1582.40,
    changePercent: 0.64,
    constituents: [
      {
        id: "cpi-silv-af15",
        comicName: "Amazing Fantasy #15",
        series: "Amazing Fantasy",
        issueNumber: "15",
        year: 1962,
        publisher: "Marvel Comics",
        coverUrl: getAuthoritativeCover("Amazing Fantasy", "15", "Marvel Comics", 1962),
        totalPoints: 560.0,
        impliedWeight: "31.7%",
        detailUrl: "/comics/seat-19",
      },
      {
        id: "cpi-silv-shw4",
        comicName: "Showcase #4",
        series: "Showcase",
        issueNumber: "4",
        year: 1956,
        publisher: "DC Comics",
        coverUrl: getAuthoritativeCover("Showcase", "4", "DC Comics", 1956),
        totalPoints: 420.0,
        impliedWeight: "23.8%",
        detailUrl: "/comics/seat-27",
      },
      {
        id: "cpi-silv-xm1",
        comicName: "X-Men #1",
        series: "X-Men",
        issueNumber: "1",
        year: 1963,
        publisher: "Marvel Comics",
        coverUrl: getAuthoritativeCover("X-Men", "1", "Marvel Comics", 1963),
        totalPoints: 395.0,
        impliedWeight: "22.4%",
        detailUrl: "/comics/seat-28",
      },
      {
        id: "cpi-silv-ff1",
        comicName: "Fantastic Four #1",
        series: "Fantastic Four",
        issueNumber: "1",
        year: 1961,
        publisher: "Marvel Comics",
        coverUrl: getAuthoritativeCover("Fantastic Four", "1", "Marvel Comics", 1961),
        totalPoints: 391.0,
        impliedWeight: "22.1%",
        detailUrl: "/comics/seat-20",
      },
    ],
  },
  {
    code: "GC_CPI_BRONZE",
    name: "Bronze Age CPI",
    era: "BRONZE AGE",
    divisor: 1086.0,
    qualifyingGrades: "4.5 – 9.8",
    salesLookback: "Last 4 Certified Sales",
    indexPoints: 1319.10,
    changePercent: 0.52,
    constituents: [
      {
        id: "cpi-brnz-hulk181",
        comicName: "Incredible Hulk #181",
        series: "Incredible Hulk",
        issueNumber: "181",
        year: 1974,
        publisher: "Marvel Comics",
        coverUrl: getAuthoritativeCover("Incredible Hulk", "181", "Marvel Comics", 1974),
        totalPoints: 640.0,
        impliedWeight: "44.9%",
        detailUrl: "/comics/seat-30",
      },
      {
        id: "cpi-brnz-gsxm1",
        comicName: "Giant-Size X-Men #1",
        series: "Giant-Size X-Men",
        issueNumber: "1",
        year: 1975,
        publisher: "Marvel Comics",
        coverUrl: getAuthoritativeCover("Giant-Size X-Men", "1", "Marvel Comics", 1975),
        totalPoints: 410.0,
        impliedWeight: "28.8%",
        detailUrl: "/comics/seat-30",
      },
      {
        id: "cpi-brnz-hos92",
        comicName: "House of Secrets #92",
        series: "House of Secrets",
        issueNumber: "92",
        year: 1971,
        publisher: "DC Comics",
        coverUrl: getAuthoritativeCover("House of Secrets", "92", "DC Comics", 1971),
        totalPoints: 375.0,
        impliedWeight: "26.3%",
        detailUrl: "/comics/seat-35",
      },
    ],
  },
  {
    code: "GC_CPI_COPPER",
    name: "Copper Age CPI",
    era: "COPPER AGE",
    divisor: 109.7,
    qualifyingGrades: "8.0 – 9.8",
    salesLookback: "Last 4 Certified Sales",
    indexPoints: 894.30,
    changePercent: 0.71,
    constituents: [
      {
        id: "cpi-cop-asm300",
        comicName: "Amazing Spider-Man #300",
        series: "Amazing Spider-Man",
        issueNumber: "300",
        year: 1988,
        publisher: "Marvel Comics",
        coverUrl: getAuthoritativeCover("Amazing Spider-Man", "300", "Marvel Comics", 1988),
        totalPoints: 55.0,
        impliedWeight: "33.0%",
        detailUrl: "/comics/seat-19",
      },
      {
        id: "cpi-cop-tmnt1",
        comicName: "Teenage Mutant Ninja Turtles #1",
        series: "Teenage Mutant Ninja Turtles",
        issueNumber: "1",
        year: 1984,
        publisher: "Mirage Studios",
        coverUrl: getAuthoritativeCover("Teenage Mutant Ninja Turtles", "1", "Mirage Studios", 1984),
        totalPoints: 55.0,
        impliedWeight: "33.0%",
        detailUrl: "/comics/seat-40",
      },
      {
        id: "cpi-cop-dkr1",
        comicName: "Batman: The Dark Knight Returns #1",
        series: "Batman: The Dark Knight Returns",
        issueNumber: "1",
        year: 1986,
        publisher: "DC Comics",
        coverUrl: getAuthoritativeCover("Batman: The Dark Knight Returns", "1", "DC Comics", 1986),
        totalPoints: 55.0,
        impliedWeight: "34.0%",
        detailUrl: "/comics/seat-36",
      },
    ],
  },
  {
    code: "GC_CPI_MODERN",
    name: "Modern Age CPI",
    era: "MODERN AGE",
    divisor: 15.1,
    qualifyingGrades: "9.0 – 9.8",
    salesLookback: "Last 5 Certified Sales",
    indexPoints: 462.80,
    changePercent: -0.15,
    constituents: [
      {
        id: "cpi-mod-uf4",
        comicName: "Ultimate Fallout #4",
        series: "Ultimate Fallout",
        issueNumber: "4",
        year: 2011,
        publisher: "Marvel Comics",
        coverUrl: getAuthoritativeCover("Ultimate Fallout", "4", "Marvel Comics", 2011),
        totalPoints: 95.0,
        impliedWeight: "18.3%",
        detailUrl: "/comics/seat-59",
      },
      {
        id: "cpi-mod-spawn1",
        comicName: "Spawn #1",
        series: "Spawn",
        issueNumber: "1",
        year: 1992,
        publisher: "Image Comics",
        coverUrl: getAuthoritativeCover("Spawn", "1", "Image Comics", 1992),
        totalPoints: 45.0,
        impliedWeight: "8.6%",
        detailUrl: "/comics/seat-48",
      },
      {
        id: "cpi-mod-twd1",
        comicName: "The Walking Dead #1",
        series: "The Walking Dead",
        issueNumber: "1",
        year: 2003,
        publisher: "Image Comics",
        coverUrl: getAuthoritativeCover("The Walking Dead", "1", "Image Comics", 2003),
        totalPoints: 120.0,
        impliedWeight: "23.1%",
        detailUrl: "/comics/seat-48",
      },
    ],
  },
  {
    code: "GC_CPI_BIG_SPENDERS",
    name: "Big Spenders Club CPI",
    era: "HIGH-VALUE GRAILS",
    divisor: 21458.0,
    qualifyingGrades: "All Certified Grades",
    salesLookback: "Last 3 Sales (All Tiers)",
    indexPoints: 4820.60,
    changePercent: 1.12,
    constituents: [
      {
        id: "cpi-spend-ac1",
        comicName: "Action Comics #1",
        series: "Action Comics",
        issueNumber: "1",
        year: 1938,
        publisher: "DC Comics",
        coverUrl: getAuthoritativeCover("Action Comics", "1", "DC Comics", 1938),
        totalPoints: 2500.0,
        impliedWeight: "51.8%",
        detailUrl: "/comics/seat-27",
      },
      {
        id: "cpi-spend-tec27",
        comicName: "Detective Comics #27",
        series: "Detective Comics",
        issueNumber: "27",
        year: 1939,
        publisher: "DC Comics",
        coverUrl: getAuthoritativeCover("Detective Comics", "27", "DC Comics", 1939),
        totalPoints: 1800.0,
        impliedWeight: "37.3%",
        detailUrl: "/comics/seat-1",
      },
      {
        id: "cpi-spend-sup1",
        comicName: "Superman #1",
        series: "Superman",
        issueNumber: "1",
        year: 1939,
        publisher: "DC Comics",
        coverUrl: getAuthoritativeCover("Superman", "1", "DC Comics", 1939),
        totalPoints: 520.0,
        impliedWeight: "10.8%",
        detailUrl: "/comics/seat-50",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// 4. PPIX Composite Assets & Derivatives Index
// ─────────────────────────────────────────────────────────────
export function getPPIXCompositeAssets(): FeaturedAssetConstituent[] {
  return INITIAL_SURFACE_ASSETS.map((asset) => {
    const p = asset.pricing;
    const fmv = p.fmv_usd ?? p.fmv ?? p.price ?? 0;

    let priceLabel = "FMV";
    let formattedPrice = `$${fmv.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    if (p.yield_rate) {
      priceLabel = "Yield";
      formattedPrice = `${(p.yield_rate * 100).toFixed(2)}%`;
    } else if (p.spread_bps) {
      priceLabel = "Spread";
      formattedPrice = `${p.spread_bps} bps`;
    } else if (p.share_price) {
      priceLabel = "Stock";
      formattedPrice = `$${p.share_price.toFixed(2)}`;
    }

    return {
      id: asset.entryId,
      assetId: asset.assetId || asset.entryId,
      symbol: asset.symbol,
      displayName: asset.displayName,
      assetType: asset.assetType,
      universe: asset.universe || "Sovereign Asset",
      priceFormatted: formattedPrice,
      priceValue: fmv,
      priceLabel,
      deltaPercent: p.delta ?? 0,
      coverUrl: asset.coverImageUrl || `/surface-art/${asset.assetType.toLowerCase()}.png`,
      description: asset.description || asset.displayName,
      detailUrl: asset.detailUrl || `/assets/${asset.assetId || asset.entryId}`,
    };
  });
}
