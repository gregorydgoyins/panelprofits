import { describe, it, expect } from "vitest";
import { getGcdRelationalData } from "@/lib/comics/gcd-relational-service";

describe("GCD Relational & Atomic Instruments Engine", () => {
  it("extracts 40+ published variants for Absolute Batman #1 (GCD 2663120)", async () => {
    const data = await getGcdRelationalData(2663120, "Absolute Batman", "1");
    expect(data).not.toBeNull();
    if (data) {
      expect(data.baseIssueId).toBe(2663120);
      expect(data.variants.length).toBeGreaterThanOrEqual(40);
      // Check for prominent variants
      const variantNames = data.variants.map((v) => v.variantName);
      expect(variantNames.some((n) => n.includes("Foil"))).toBe(true);
      expect(variantNames.some((n) => n.includes("Printing"))).toBe(true);
    }
  });

  it("extracts international / foreign language reprints (Brazil, Germany, France)", async () => {
    const data = await getGcdRelationalData(2663120, "Absolute Batman", "1");
    expect(data).not.toBeNull();
    if (data) {
      expect(data.foreignEditions.length).toBeGreaterThanOrEqual(4);
      const countries = data.foreignEditions.map((f) => f.country);
      expect(countries).toContain("Germany");
      expect(countries).toContain("Brazil");
      expect(countries).toContain("France");
    }
  });

  it("resolves story arcs and narrative credits", async () => {
    const data = await getGcdRelationalData(2663120, "Absolute Batman", "1");
    expect(data).not.toBeNull();
    if (data) {
      expect(data.stories.length).toBeGreaterThan(0);
      const leadStory = data.stories.find((s) => s.title.includes("The Zoo"));
      expect(leadStory).toBeDefined();
      expect(leadStory?.characters).toContain("Absolute Universe");
    }
  });

  it("links verified equity ID 402d42e9... directly to GCD 2663120 and atomic variants", async () => {
    const { getComicById } = await import("@/lib/comics/queries");
    const comic = await getComicById("402d42e9543e86783fc11a62a67bc141c56af2844809c9fda132d29611cc5890");
    expect(comic).not.toBeNull();
    expect(comic?.series).toBe("Absolute Batman");
    expect(comic?.issue_number).toBe("1");
    expect(comic?.gcd_source_id).toBe("2663120");

    const relational = await getGcdRelationalData(comic?.gcd_source_id || 0, comic?.series, comic?.issue_number);
    expect(relational).not.toBeNull();
    expect(relational?.variants.length).toBeGreaterThanOrEqual(40);
    expect(relational?.foreignEditions.length).toBeGreaterThanOrEqual(5);
  });
});

