import { beforeEach, describe, expect, it, vi } from "vitest";
const evidence = vi.hoisted(() => ({stored:vi.fn(),ebay:vi.fn()}));
vi.mock("@/lib/sniper/stored-completed-sales",()=>({readStoredCompletedSales:evidence.stored}));
vi.mock("@/lib/sniper/ebay-sales-view",()=>({readEbaySalesForBook:evidence.ebay}));
import { GET } from "@/app/api/sniper/candles/route";
const transaction={itemId:"ebay-136035200051",date:"2025-06-21",price:120,grade:9.4,venue:"eBay",source:"pricecharting_completed_sale",confirmed:true,url:"https://www.ebay.com/itm/136035200051"};
describe("Sniper history sources",()=>{
 beforeEach(()=>{vi.clearAllMocks();evidence.stored.mockResolvedValue([transaction]);evidence.ebay.mockResolvedValue({sales:[],history:{available:false,message:"No stored eBay search",total:0}});});
 it("charts stored PriceCharting completed sales even when no eBay search result exists",async()=>{
  const response=await GET(new Request("https://comicbookstockexchange.com/api/sniper/candles?series=Werewolf%20by%20Night&issue=31&grade=9.4&grader=CGC&source=ebay"));
  const result=await response.json();expect(result.candles).toHaveLength(1);expect(result.candles[0].close).toBe(120);expect(result.stats.n).toBe(1);expect(result.sources.pricecharting_completed_sale).toBe(1);expect(response.headers.get("cache-control")).toBe("no-store");
 });
 it("does not substitute base-issue transactions for a specifically named variant",async()=>{
  const response=await GET(new Request("https://comicbookstockexchange.com/api/sniper/candles?series=Strange%20Academy&issue=14&grade=9.8&editionTerms=nauck"));
  expect((await response.json()).candles).toHaveLength(0);expect(evidence.stored).not.toHaveBeenCalled();
 });
 it("does not draw watched closing bids as completed sales",async()=>{
  evidence.stored.mockResolvedValue([{...transaction,confirmed:false}]);
  const response=await GET(new Request("https://comicbookstockexchange.com/api/sniper/candles?series=Werewolf%20by%20Night&issue=31&grade=9.4"));
  expect((await response.json()).candles).toHaveLength(0);
 });
});
