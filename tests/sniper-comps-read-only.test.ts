import { expect, it, vi } from "vitest";
const acquisition = vi.hoisted(() => vi.fn());
vi.mock("@/lib/sniper/market-store", () => ({ readSalesForBook: vi.fn().mockResolvedValue([]), refreshCompSniper: acquisition }));
vi.mock("@/lib/sniper/ebay-sales-view", () => ({ readEbaySalesForBook: vi.fn().mockResolvedValue({ sales: [] }) }));
import { GET } from "@/app/api/sniper/comps/route";
it("opening comparisons never acquires vendor data", async () => {
  const response = await GET(new Request("https://comicbookstockexchange.com/api/sniper/comps?series=Batman&issue=251"));
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ success: true, count: 0, comps: [] });
  expect(acquisition).not.toHaveBeenCalled();
});
