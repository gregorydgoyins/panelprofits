import { describe, expect, it } from "vitest";
import { publicGameRound } from "@/lib/sniper/game-store";
const row = {game_token:"d7323ef3-b7bd-43d5-a084-a82d2058b2f2",title:"Batman #251",series:"Batman",issue:"251",grade:7.5,game_mode:"historical",game_sale_id:"private-sale",game_duration_ms:75000,end_time:"2012-12-07",status:"waiting",ask_usd:1,fmv_usd:106,final_price_usd:106,result:{url:"https://www.comicconnect.com/item/430254",grader:"CBCS",private:"secret"}};
describe("Sniper sealed game responses",()=>{
 it("does not disclose origin, historical price, source URL, timer or value before bidding",()=>{
  const view=publicGameRound(row);expect(view.deadline).toBeNull();expect(view.result).toBeNull();expect(view.asset).toBeNull();expect(view.itemId).toBeNull();
  const serialized=JSON.stringify(view);expect(serialized).not.toContain("historical");expect(serialized).not.toContain("2012");expect(serialized).not.toContain("106");expect(serialized).not.toContain("comicconnect");expect(serialized).not.toContain("secret");
 });
 it("does not reveal a result just because the browser thinks the timer ended",()=>{
  const view=publicGameRound({...row,status:"bidding",game_started_at:"2026-01-01",game_deadline:"2026-01-02",max_bid_usd:104});expect(view.result).toBeNull();expect(view.asset).toBeNull();expect(view.bid).toBe(104);
 });
 it("shows a settled losing charge without granting an asset",()=>{
  const view=publicGameRound({...row,status:"outbid",game_resolved_at:"2026-01-03",max_bid_usd:104});expect(view.result?.charged).toBe(104);expect(view.asset).toBeNull();expect(view.result?.benchmark).toBe(106);
 });
 it("keeps purchase cost distinct from bank value when underwater",()=>{
  const view=publicGameRound({...row,status:"won",game_resolved_at:"2026-01-03",max_bid_usd:1600,fill_price_usd:1600,game_bank_rate:1});expect(view.asset?.cost).toBe(1600);expect(view.asset?.bankOffer).toBe(106);
 });
});
