import { expect, it, vi } from "vitest";
const store = vi.hoisted(() => ({ readLiveListings: vi.fn().mockResolvedValue({items:[],asOf:null}), runSnapshot:vi.fn() }));
vi.mock("@/lib/sniper/market-store", () => store);
import { GET } from "@/app/api/sniper/live-auctions/route";
it("returns an empty saved feed without scraping or starting a snapshot", async () => {
  const response = await GET(new Request("https://comicbookstockexchange.com/api/sniper/live-auctions?q=empty-regression"));
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({success:true,count:0,auctions:[]});
  expect(store.readLiveListings).toHaveBeenCalledOnce();
  expect(store.runSnapshot).not.toHaveBeenCalled();
});
