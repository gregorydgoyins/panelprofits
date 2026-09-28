import { describe, expect, it } from "vitest";
import { searchLoreEntities, getLoreEntityBySlug, getFeaturedLoreEntities, findLoreEntitiesInText } from "@/lib/wiki/lore-search";

describe("multi-universe lore search engine", () => {
  it("searches and resolves landmark items and weapons", () => {
    const results = searchLoreEntities("batmobile");
    expect(results.length).toBeGreaterThan(0);
    const batmobile = results.find((r) => r.title.toLowerCase().includes("batmobile"));
    expect(batmobile).toBeDefined();
    expect(batmobile?.type).toBe("item");
    expect(batmobile?.universe).toBe("DC");
  });

  it("searches and resolves landmark cosmic artifacts", () => {
    const results = searchLoreEntities("infinity gauntlet");
    expect(results.length).toBeGreaterThan(0);
    const gauntlet = results.find((r) => r.title.toLowerCase().includes("infinity gauntlet"));
    expect(gauntlet).toBeDefined();
    expect(gauntlet?.type).toBe("item");
    expect(gauntlet?.universe).toBe("MARVEL");
  });

  it("searches and resolves landmark cities and locations", () => {
    const results = searchLoreEntities("gotham city");
    expect(results.length).toBeGreaterThan(0);
    const gotham = results.find((r) => r.title.toLowerCase().includes("gotham"));
    expect(gotham).toBeDefined();
    expect(gotham?.type).toBe("location");
    expect(gotham?.universe).toBe("DC");
  });

  it("retrieves entity dossier by exact slug", () => {
    const entity = getLoreEntityBySlug("batmobile-dc");
    expect(entity).not.toBeNull();
    expect(entity?.title).toBe("Batmobile");
    expect(entity?.type).toBe("item");
    expect(entity?.creators).toContain("Bill Finger");
  });

  it("returns featured premier dossiers for initial view", () => {
    const featured = getFeaturedLoreEntities();
    expect(featured.length).toBeGreaterThan(0);
    expect(featured.some((f) => f.type === "character")).toBe(true);
  });

  it("extracts lore entities mentioned inside text sentences", () => {
    const text = "The legendary Batmobile was driven through Gotham City while the Infinity Gauntlet was secured in Asgard.";
    const matches = findLoreEntitiesInText(text, 5);
    const titles = matches.map((m) => m.title);
    expect(titles).toContain("Batmobile");
    expect(titles).toContain("Infinity Gauntlet");
    expect(titles).toContain("Gotham City");
  });
});
