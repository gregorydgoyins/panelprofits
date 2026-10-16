import { afterEach, describe, expect, it, vi } from "vitest";
const { maybeSingle, db } = vi.hoisted(() => {
  const maybeSingle = vi.fn();
  const chain: any = { select: () => chain, eq: () => chain, maybeSingle };
  return { maybeSingle, db: { from: vi.fn(() => chain) } };
});
vi.mock("@/lib/supabase/admin", () => ({ createAdminServerClient: () => db }));
afterEach(() => { vi.resetModules(); vi.unstubAllGlobals(); vi.clearAllMocks(); });

describe("one saved historical lookup per comic", () => {
  it("does not buy a provider lookup when the selected issue has no stored history", async () => {
    maybeSingle.mockResolvedValue({data:null,error:null});
    const fetcher=vi.fn();vi.stubGlobal("fetch",fetcher);
    const {readCompletedEbaySales}=await import("../lib/sniper/ebay-history");
    expect((await readCompletedEbaySales("Werewolf by Night 31")).code).toBe("history_not_acquired");
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("serves the saved response after server restart without contacting a pricing provider", async () => {
    const response = { available: true, checkedAt: "2026-10-14T16:42:05.829Z", stage: "search", status: 200, code: null, message: "Completed single-unit eBay sales", provider: "compsniper_ebay_product_research", total: 1, next: null,
      items: [{ itemId: "267810809019", title: "Marvel Amazing Spider-Man 300 Comic Book, CGC 9.8, White Pages", lastSoldPrice: {value:"2600.00", currency:"USD"}, lastSoldDate:"2026-10-11" }] };
    maybeSingle.mockResolvedValue({ data: { state: "ready", response }, error: null });
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    let mod = await import("../lib/sniper/ebay-history");
    expect(await mod.readCompletedEbaySales("Amazing Spider-Man #300")).toEqual(response);
    vi.resetModules();
    mod = await import("../lib/sniper/ebay-history");
    expect(await mod.readCompletedEbaySales("Amazing Spider-Man 300")).toEqual(response);
    expect(fetcher).not.toHaveBeenCalled();
    expect(maybeSingle).toHaveBeenCalledTimes(2);
  });
  it("does not spend another request while another server owns the first lookup", async () => {
    maybeSingle.mockResolvedValue({ data: {state:"pending", response:null}, error:null });
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    const {readCompletedEbaySales} = await import("../lib/sniper/ebay-history");
    expect((await readCompletedEbaySales("Incredible Hulk 181")).code).toBe("history_pending");
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("does not spend quota when persistent storage cannot be reached", async () => {
    maybeSingle.mockResolvedValue({ data:null, error:{message:"connection unavailable"} });
    const fetcher=vi.fn(); vi.stubGlobal("fetch",fetcher);
    const {readCompletedEbaySales}=await import("../lib/sniper/ebay-history");
    expect((await readCompletedEbaySales("Incredible Hulk 181")).code).toBe("history_store_unavailable");
    expect(fetcher).not.toHaveBeenCalled();
  });
});
