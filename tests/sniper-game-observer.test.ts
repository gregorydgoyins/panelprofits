import { beforeEach, expect, it, vi } from "vitest";
const mocks=vi.hoisted(()=>({watch:vi.fn(),save:vi.fn(),rows:[] as any[]}));
vi.mock("@/lib/sniper/watch",()=>({watchLot:mocks.watch}));
vi.mock("@/lib/supabase/admin",()=>({createAdminServerClient:()=>({from:()=>{
 const query:any={select:()=>query,eq:()=>query,in:()=>query,is:()=>query,gte:()=>query,lte:()=>query,
  then:(resolve:any)=>Promise.resolve({data:mocks.rows,error:null}).then(resolve),
  update:(patch:any)=>{mocks.save(patch);return {eq:async()=>({error:null})};}};return query;
}})}));
import {observeGameCloses} from "@/lib/sniper/game-observer";
beforeEach(()=>{mocks.watch.mockReset();mocks.save.mockReset();mocks.rows=[{item_id:"ebay-v1|287635860431|0",game_deadline:new Date(Date.now()-1000).toISOString()}];});
it("does not turn a cached pre-close reading into a final price",async()=>{
 mocks.watch.mockResolvedValue({ok:true,ended:true,currentBid:106,fetchedAt:new Date(Date.now()-2000).toISOString()});
 await observeGameCloses("test-player");expect(mocks.save).not.toHaveBeenCalled();
});
it("persists the original lot ID only after a successful post-close reading",async()=>{
 mocks.watch.mockResolvedValue({ok:true,ended:true,currentBid:106,bidCount:3,fetchedAt:new Date().toISOString()});
 await observeGameCloses("test-player");expect(mocks.save).toHaveBeenCalledWith(expect.objectContaining({status:"ended",final_price_usd:106,final_bid_count:3}));
 expect(mocks.save.mock.calls[0][0].final_seen_secs_before_end).toBeLessThanOrEqual(0);
});
it("does not apply an eBay quote to another venue",async()=>{
 mocks.rows=[{item_id:"hakes-9807473",game_deadline:new Date(Date.now()-1000).toISOString()}];
 await observeGameCloses("test-player");expect(mocks.watch).not.toHaveBeenCalled();expect(mocks.save).not.toHaveBeenCalled();
});
