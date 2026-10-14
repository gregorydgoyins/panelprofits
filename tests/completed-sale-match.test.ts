import { describe, expect, it } from "vitest";
import { matchCompletedComicSale } from "../lib/sniper/completed-sale-match";

// Titles returned by the live CompSniper request on 2026-10-14.
describe("completed-sale comic matching", () => {
  it("matches the original despite publisher prefix and issue without a hash", () => {
    const result = matchCompletedComicSale("Marvel Amazing Spider-Man 300 Comic Book, CGC 9.8, White Pages", "Amazing Spider-Man", "300");
    expect(result?.grade).toBe(9.8);
    expect(result?.extractedIssue).toBe("300");
  });
  it("keeps a Nauck title and excludes the misclassified Ramos-cover comp", () => {
    expect(matchCompletedComicSale("Strange Academy #14 CGC 9.8 Todd Nauck Variant", "Strange Academy", "14", ["nauck"])?.grade).toBe(9.8);
    expect(matchCompletedComicSale("Strange Academy #14 CGC 9.8 Cover A Ramos 1st Print Gaslamp Skottie Young Marvel 2021", "Strange Academy", "14", ["nauck"])).toBeNull();
  });
  it("excludes facsimile reprints, homage issues, cards and dust jackets", () => {
    for (const title of [
      "Amazing Spider-Man #300 CGC 9.8 Facsimile Marvel Comic First Appearance VENOM",
      "AMAZING SPIDER-MAN #25 CGC 9.8 SKAN SDCC 2026 SYMBIE 300 HOMAGE VARIANT VENOM",
      "300+ Card Lot - 1991/92 Impel & 1994 Fleer Marvel Universe, Amazing Spider-Man",
      "DM DUST JACKET For Amazing Spider-Man By Michelinie McFarlane Omnibus 300 Sealed",
    ]) expect(matchCompletedComicSale(title, "Amazing Spider-Man", "300")).toBeNull();
  });
});
