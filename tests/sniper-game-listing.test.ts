import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ db: {from:vi.fn(),rpc:vi.fn()}, research:vi.fn(), command:vi.fn() }));
vi.mock("@/lib/supabase/admin",()=>({createAdminServerClient:()=>mocks.db}));
vi.mock("@/lib/sniper/local-research",()=>({readSavedLotResearch:mocks.research}));
vi.mock("@/lib/sniper/game-store",()=>({gameCommand:mocks.command}));
import { bidOnStoredListing } from "@/lib/sniper/game-listing";
function query(data:unknown) { const q:any={}; for(const method of ["select","eq","not"]) q[method]=vi.fn(()=>q); q.maybeSingle=vi.fn().mockResolvedValue({data,error:null});q.single=q.maybeSingle;return q; }
const lot = {item_id:"ebay-v1|326743818938|0",title:"Star Wars Mace Windu #1",series:"Star Wars Mace Windu",issue:"1",grade:9.8,grader:"CGC",status:"live",buying_option:"AUCTION",end_time:"2099-01-01T00:00:00Z",price_usd:50};
describe("funded bidding from original radar",()=>{
 beforeEach(()=>{vi.clearAllMocks();mocks.command.mockResolvedValue({account:{available:9896}});mocks.db.rpc.mockResolvedValue({error:null});});
 it("raises the existing owned round without enrolling another copy",async()=>{
  mocks.db.from.mockReturnValueOnce(query({game_token:"owned-round",status:"bidding"}));
  await bidOnStoredListing("player-owner",lot.item_id,104);
  expect(mocks.command).toHaveBeenCalledWith("player-owner","bid","owned-round",104);expect(mocks.db.rpc).not.toHaveBeenCalled();
 });
 it("rejects a closed stored lot before creating a round",async()=>{
  mocks.db.from.mockReturnValueOnce(query(null)).mockReturnValueOnce(query({...lot,status:"ended"}));
  await expect(bidOnStoredListing("player-owner",lot.item_id,104)).rejects.toThrow("not an open graded auction");expect(mocks.db.rpc).not.toHaveBeenCalled();expect(mocks.command).not.toHaveBeenCalled();
 });
 it("uses only saved exact-grade USD guides, then bids on the unique enrolled row",async()=>{
  mocks.db.from.mockReturnValueOnce(query(null)).mockReturnValueOnce(query(lot)).mockReturnValueOnce(query({game_token:"enrolled-round"}));
  mocks.research.mockResolvedValue({prices:[{grade:"9.8",amount:100,currency:"USD",kind:"guide"},{grade:"9.8",amount:112,currency:"USD",kind:"guide"},{grade:"9.6",amount:9999},{grade:"9.8",amount:9999,currency:"GBP"},{grade:"9.8",amount:9999,kind:"sale"}]});
  await bidOnStoredListing("player-owner",lot.item_id,104);
  expect(mocks.db.rpc.mock.calls[0][1].p_offer).toMatchObject({itemId:lot.item_id,reference:106,endTime:lot.end_time,opening:1});
  expect(mocks.command).toHaveBeenCalledWith("player-owner","bid","enrolled-round",104);
 });
 it("does not let skipped or settled lots restart",async()=>{
  mocks.db.from.mockReturnValueOnce(query({game_token:"owned-round",status:"outbid"}));
  await expect(bidOnStoredListing("player-owner",lot.item_id,104)).rejects.toThrow("already closed");expect(mocks.command).not.toHaveBeenCalled();
 });
});
