import { describe, expect, it } from "vitest";
import { resolveIssueDebuts } from "@/lib/wiki/debut-resolver";

describe("comic debut resolver", () => {
  it("resolves landmark DC debut issues", () => {
    const flash = resolveIssueDebuts("Showcase", "4");
    expect(flash).not.toBeNull();
    expect(flash?.universe).toBe("DC");
    expect(flash?.characters.some((c) => c.includes("Flash"))).toBe(true);

    const action1 = resolveIssueDebuts("Action Comics", "1");
    expect(action1).not.toBeNull();
    expect(action1?.universe).toBe("DC");
    expect(action1?.characters.some((c) => c.includes("Superman"))).toBe(true);

    const detective27 = resolveIssueDebuts("Detective Comics", "27");
    expect(detective27).not.toBeNull();
    expect(detective27?.universe).toBe("DC");
    expect(detective27?.characters.some((c) => c.includes("Batman"))).toBe(true);
  });

  it("resolves landmark Marvel debut issues", () => {
    const spidey = resolveIssueDebuts("Amazing Fantasy", "15");
    expect(spidey).not.toBeNull();
    expect(spidey?.universe).toBe("MARVEL");
    expect(spidey?.characters.some((c) => c.includes("Spider-Man") || c.includes("Parker"))).toBe(true);

    const wolverine = resolveIssueDebuts("Incredible Hulk", "181");
    expect(wolverine).not.toBeNull();
    expect(wolverine?.universe).toBe("MARVEL");
    expect(wolverine?.characters).toContain("Wolverine");
  });

  it("resolves landmark Star Wars, Image, and Transformers debut issues", () => {
    const starwars = resolveIssueDebuts("Star Wars", "1");
    expect(starwars).not.toBeNull();
    expect(starwars?.universe).toBe("STAR_WARS");
    expect(starwars?.characters).toContain("Darth Vader");

    const spawn = resolveIssueDebuts("Spawn", "1");
    expect(spawn).not.toBeNull();
    expect(spawn?.universe).toBe("IMAGE");
    expect(spawn?.characters.some((c) => c.includes("Spawn"))).toBe(true);

    const tf = resolveIssueDebuts("Transformers", "1");
    expect(tf).not.toBeNull();
    expect(tf?.universe).toBe("TRANSFORMERS");
    expect(tf?.characters).toContain("Optimus Prime");
  });

  it("resolves landmark item and location debuts across DC and Marvel", () => {
    const batmobile = resolveIssueDebuts("Detective Comics", "35");
    expect(batmobile).not.toBeNull();
    expect(batmobile?.universe).toBe("DC");
    expect(batmobile?.items).toContain("Batmobile");

    const batcave = resolveIssueDebuts("Batman", "12");
    expect(batcave).not.toBeNull();
    expect(batcave?.universe).toBe("DC");
    expect(batcave?.locations).toContain("Batcave");

    const gotham = resolveIssueDebuts("Batman", "4");
    expect(gotham).not.toBeNull();
    expect(gotham?.universe).toBe("DC");
    expect(gotham?.locations).toContain("Gotham City");

    const metropolis = resolveIssueDebuts("Action Comics", "16");
    expect(metropolis).not.toBeNull();
    expect(metropolis?.universe).toBe("DC");
    expect(metropolis?.locations).toContain("Metropolis");

    const mjolnir = resolveIssueDebuts("Journey Into Mystery", "83");
    expect(mjolnir).not.toBeNull();
    expect(mjolnir?.universe).toBe("MARVEL");
    expect(mjolnir?.items).toContain("Mjolnir");

    const asgard = resolveIssueDebuts("Journey Into Mystery", "85");
    expect(asgard).not.toBeNull();
    expect(asgard?.universe).toBe("MARVEL");
    expect(asgard?.locations).toContain("Asgard");

    const baxter = resolveIssueDebuts("Fantastic Four", "3");
    expect(baxter).not.toBeNull();
    expect(baxter?.universe).toBe("MARVEL");
    expect(baxter?.locations).toContain("Baxter Building");

    const gauntlet = resolveIssueDebuts("Silver Surfer", "44");
    expect(gauntlet).not.toBeNull();
    expect(gauntlet?.universe).toBe("MARVEL");
    expect(gauntlet?.items).toContain("Infinity Gauntlet");
  });

  it("returns null for non-debut issues without errors", () => {
    const nonDebut = resolveIssueDebuts("Random Nonexistent Series 99999", "99999");
    expect(nonDebut).toBeNull();
  });
});
