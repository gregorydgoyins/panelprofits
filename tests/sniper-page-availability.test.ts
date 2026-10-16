import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const refresh = vi.hoisted(() => vi.fn());
vi.mock("@/lib/supabase/proxy", () => ({ refreshSupabaseSession: refresh }));
import { proxy } from "@/proxy";

describe("Sniper page availability during an account-service outage", () => {
  beforeEach(() => { refresh.mockReset(); });
  it("renders the Sniper entry page without waiting for Supabase", async () => {
    refresh.mockImplementation(() => new Promise(() => {}));
    const response = await proxy(new NextRequest("https://comicbookstockexchange.com/sniper"));
    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-request-x-panel-profits-path")).toBe("/sniper");
    expect(refresh).not.toHaveBeenCalled();
  });
  it("keeps session refresh on game API requests", async () => {
    refresh.mockResolvedValue(new Response(null, { status: 204 }));
    const request = new NextRequest("https://comicbookstockexchange.com/api/sniper/game");
    expect((await proxy(request)).status).toBe(204);
    expect(refresh).toHaveBeenCalledWith(request);
  });
});
