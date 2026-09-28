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

  it("returns null for non-debut issues without errors", () => {
    const nonDebut = resolveIssueDebuts("Random Nonexistent Series 99999", "99999");
    expect(nonDebut).toBeNull();
  });
});
