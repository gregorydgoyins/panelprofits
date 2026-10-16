import { beforeEach, describe, expect, it, vi } from "vitest";
const cached = vi.hoisted(() => vi.fn());
vi.mock("@/lib/sniper/listing-writeup", () => ({ readCachedWriteup: cached }));
vi.mock("@/lib/comics/story-summary", () => ({ readSavedStorySummary: vi.fn().mockResolvedValue(null) }));
vi.mock("@/lib/sniper/local-research", () => ({ readLocalLotResearch: vi.fn().mockResolvedValue(null) }));
import { GET } from "@/app/api/sniper/listing-writeup/route";

describe("saved listing research endpoint", () => {
  beforeEach(() => { cached.mockReset(); });
  it("returns pending without importing or invoking generation", async () => {
    cached.mockResolvedValue({ writeup: null, failedRecently: false });
    const response = await GET(new Request("http://localhost/api/sniper/listing-writeup?title=Strange%20Academy%2014"));
    expect(await response.json()).toEqual({ writeup: null, story: null, localResearch: null, researchError: null, state: "pending" });
    expect(cached).toHaveBeenCalledOnce();
  });
  it("returns the saved row", async () => {
    const writeup = { edition: "Strange Academy #14 Todd Nauck Variant" };
    cached.mockResolvedValue({ writeup, failedRecently: false });
    const response = await GET(new Request("http://localhost/api/sniper/listing-writeup?title=Strange%20Academy%2014"));
    expect(await response.json()).toEqual({ writeup, story: null, localResearch: null, researchError: null, state: "ready" });
  });
});
