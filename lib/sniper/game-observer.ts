import { createAdminServerClient } from "@/lib/supabase/admin";
import { watchLot } from "./watch";
const running = new Map<string, Promise<void>>();
/** Observe only this player's committed live lots near closing. Never acquire a new listing. */
export async function observeGameCloses(owner: string): Promise<void> {
 const db = createAdminServerClient();
 const now = Date.now();
 const {data,error} = await db.from("sniper_paper_orders").select("item_id,game_deadline").eq("owner",owner)
  .eq("game_mode","live").in("status",["bidding","awaiting_result"]).is("game_resolved_at",null)
  .gte("game_deadline",new Date(now-60_000).toISOString()).lte("game_deadline",new Date(now+5000).toISOString());
 if(error) throw new Error("Could not read committed closing lots");
 await Promise.all((data||[]).map(async round=>{
  if(!/^ebay-/i.test(round.item_id)) return; // Other venues need their own verified close; never substitute an eBay reading.
  const prior=running.get(round.item_id);if(prior)return prior;
  const task=(async()=>{
   const end=Date.parse(round.game_deadline);
   let reading=await watchLot(round.item_id,{observe:true});
   if(Date.now()<=end) {
    await new Promise(resolve=>setTimeout(resolve,Math.max(0,end+1500-Date.now())));
    reading=await watchLot(round.item_id,{observe:true});
   }
   if(!reading.ok||!reading.ended||reading.currentBid==null||!(reading.currentBid>0)||Date.parse(reading.fetchedAt)<end)return;
   const {error:saveError}=await db.from("sniper_listings").update({status:"ended",price_usd:reading.currentBid,
    final_price_usd:reading.currentBid,final_bid_count:reading.bidCount||0,
    final_seen_secs_before_end:Math.floor((end-Date.parse(reading.fetchedAt))/1000),last_seen:reading.fetchedAt}).eq("item_id",round.item_id);
   if(saveError)throw new Error("Could not persist the observed close");
  })();running.set(round.item_id,task);
  try{await task;}finally{running.delete(round.item_id);}
 }));
}
