import { describe, expect, it } from "vitest";
import { slabIssueYear, issueEra } from "../lib/sniper/slab-identity";
import type { SlabLabel } from "../lib/sniper/label-reader";
describe("slab issue identity", () => {
  it("reads July 1986 from the G.I. Joe #49 label instead of the series origin year", () => {
    const label = { issueDate: "7/86" } as SlabLabel;
    expect(slabIssueYear(label)).toBe(1986);
    expect(issueEra(slabIssueYear(label)!)).toBe("copper");
  });
  it("does not invent an issue date when no label date was read", () => {
    expect(slabIssueYear(null)).toBeUndefined();
    expect(slabIssueYear({ issueDate: null } as SlabLabel)).toBeUndefined();
  });
});
