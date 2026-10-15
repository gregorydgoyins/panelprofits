import { beforeEach, describe, expect, it, vi } from "vitest";
const cached = vi.hoisted(() => vi.fn());
vi.mock("@/lib/sniper/listing-writeup", () => ({ readCachedWriteup: cached }));
import { GET } from "@/app/api/sniper/listing-writeup/route";

describe("saved listing research endpoint", () => {
  beforeEach(() => cached.mockReset());
  it("returns pending without importing or invoking generation", async () => {
    cached.mockResolvedValue({ writeup: null, failedRecently: false });
    const response = await GET(new Request("http://localhost/api/sniper/listing-writeup?title=Strange%20Academy%2014"));
    expect(await response.json()).toEqual({ writeup: null, state: "pending" });
    expect(cached).toHaveBeenCalledOnce();
  });
  it("returns the saved row", async () => {
    const writeup = { edition: "Strange Academy #14 Todd Nauck Variant" };
    cached.mockResolvedValue({ writeup, failedRecently: false });
    const response = await GET(new Request("http://localhost/api/sniper/listing-writeup?title=Strange%20Academy%2014"));
    expect(await response.json()).toEqual({ writeup, state: "ready" });
  });
});
