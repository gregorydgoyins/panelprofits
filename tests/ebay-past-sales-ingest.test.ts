import { describe, it, expect } from "vitest";
import {
  parseEbayComicListing,
  generateEbayObservationFingerprint,
  formatToSalesObservation,
} from "@/lib/sniper/ebay-past-sales-ingest";

describe("eBay Past Sales Ingestion Engine", () => {
  it("correctly extracts CGC graded slab with cert number, page quality, and universal designation", () => {
    const raw = {
      itemId: "234567890123",
      title: "Amazing Spider-Man #300 CGC 9.8 White Pages 1st App Venom 4012345678",
      price: 4500.0,
      currency: "USD",
      soldDate: "2026-10-09T18:30:00.000Z",
      shippingCost: 25.0,
      carrier: "USPS Priority Mail",
      bidCount: 38,
      uniqueBidderCount: 14,
      watchCount: 42,
      reserveMet: true,
      buyingOption: "AUCTION" as const,
      sellerUsername: "grail_dealer_99",
      sellerFeedbackScore: 12500,
      sellerFeedbackPercentage: "99.8%",
      topRatedSeller: true,
      returnsAccepted: true,
      aspects: {
        "Professional Grader": "CGC",
        Grade: "9.8",
        "Certification Number": "4012345678",
        "Page Quality": "White Pages",
      },
    };

    const parsed = parseEbayComicListing(raw);
    expect(parsed.grader).toBe("CGC");
    expect(parsed.grade).toBe("9.8");
    expect(parsed.certificationNumber).toBe("4012345678");
    expect(parsed.pageQuality).toBe("White Pages");
    expect(parsed.designation).toBe("Universal");
    expect(parsed.price).toBe(4500.0);
    expect(parsed.shippingCost).toBe(25.0);
    expect(parsed.bidCount).toBe(38);

    const observation = formatToSalesObservation(parsed);
    expect(observation.grader).toBe("CGC");
    expect(observation.grade).toBe("9.8");
    expect(observation.certification_number).toBe("4012345678");
    expect(observation.parsed_numeric_price).toBe(4500.0);
    expect(observation.observed_year).toBe(2026);
    expect(observation.venue).toBe("eBay");
    expect(observation.observation_fingerprint).toBeDefined();
    expect(observation.raw_payload.bidCount).toBe(38);
    expect(observation.raw_payload.shippingCost).toBe(25.0);
  });

  it("extracts CBCS and PGX slabs with signature series and pedigree labels", () => {
    const rawCbcs = {
      itemId: "112233445566",
      title: "Batman #423 CBCS 9.6 Signature Series Signed Todd McFarlane 21-ABC1234-001",
      price: 1850.5,
      soldDate: "2026-09-15T12:00:00.000Z",
    };
    const parsedCbcs = parseEbayComicListing(rawCbcs);
    expect(parsedCbcs.grader).toBe("CBCS");
    expect(parsedCbcs.grade).toBe("9.6");
    expect(parsedCbcs.designation).toBe("Signature Series");

    const rawPgx = {
      itemId: "998877665544",
      title: "Incredible Hulk #181 PGX 9.0 White Pages Mile High Pedigree",
      price: 11200.0,
      soldDate: "2026-08-20T15:00:00.000Z",
    };
    const parsedPgx = parseEbayComicListing(rawPgx);
    expect(parsedPgx.grader).toBe("PGX");
    expect(parsedPgx.grade).toBe("9.0");
    expect(parsedPgx.designation).toBe("Pedigree");
  });

  it("extracts high-grade raw books with exact grade classification", () => {
    const rawNm = {
      itemId: "334455667788",
      title: "Uncanny X-Men #266 Near Mint NM 1st Gambit First Print Raw",
      price: 245.0,
      soldDate: "2026-10-01T20:00:00.000Z",
    };
    const parsedNm = parseEbayComicListing(rawNm);
    expect(parsedNm.grader).toBe("RAW");
    expect(parsedNm.grade).toBe("9.4 NM");

    const rawVfNm = {
      itemId: "445566778899",
      title: "Secret Wars #8 VF/NM 1st Black Suit Spider-Man Newsstand",
      price: 180.0,
      soldDate: "2026-09-28T19:00:00.000Z",
    };
    const parsedVfNm = parseEbayComicListing(rawVfNm);
    expect(parsedVfNm.grader).toBe("RAW");
    expect(parsedVfNm.grade).toBe("9.0 VF/NM");
    expect(parsedVfNm.editionVariant).toBe("Newsstand");
  });

  it("produces deterministic SHA-256 fingerprints preventing duplicate double-counting", () => {
    const fp1 = generateEbayObservationFingerprint("12345678", 500.0, "2026-10-10T12:00:00Z", "9.8");
    const fp2 = generateEbayObservationFingerprint("12345678", 500.0, "2026-10-10T12:00:00Z", "9.8");
    const fp3 = generateEbayObservationFingerprint("12345678", 505.0, "2026-10-10T12:00:00Z", "9.8");

    expect(fp1).toBe(fp2);
    expect(fp1).not.toBe(fp3);
    expect(fp1).toHaveLength(64);
  });
});
