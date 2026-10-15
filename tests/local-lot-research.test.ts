import { describe, expect, it } from "vitest";
import { matchingLocalComic } from "@/lib/sniper/local-research";
import type { ComicRecord } from "@/lib/comics/types";
const row = (fields: Partial<ComicRecord>) => ({ cover_variant: null, printing: "1", direct_or_variant: "Direct", ...fields } as ComicRecord);
describe("local price matching", () => {
  it("separates a named variant from the standard edition", () => {
    const base = row({ id: "base" });
    const variant = row({ id: "variant", cover_variant: "Rahzzah Variant", direct_or_variant: "Variant" });
    expect(matchingLocalComic([base, variant], null)).toBe(base);
    expect(matchingLocalComic([base, variant], "Rahzzah Variant")).toBe(variant);
  });
  it("does not pick the highest-priced duplicate or a second printing", () => {
    expect(matchingLocalComic([row({ pp_grade_9_8_price: 25 }), row({ pp_grade_9_8_price: 100 })], null)).toBeNull();
    expect(matchingLocalComic([row({ printing: "2" })], null)).toBeNull();
  });
  it("does not claim uniqueness from a truncated response", () => {
    expect(matchingLocalComic(Array.from({ length: 50 }, () => row({})), null)).toBeNull();
  });
});
