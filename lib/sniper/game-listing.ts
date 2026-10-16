import { randomUUID } from "node:crypto";
import { createAdminServerClient } from "@/lib/supabase/admin";
import { readLocalLotResearch } from "./local-research";
import { gameCommand } from "./game-store";

/** Enroll the selected stored auction; never trust client prices, deadlines or valuation. */
export async function bidOnStoredListing(owner: string, itemId: string, amount: number) {
 const db = createAdminServerClient();
 const {data: existing, error: lookupError} = await db.from("sniper_paper_orders").select("game_token,status").eq("owner",owner).eq("item_id",itemId).not("game_token","is",null).maybeSingle();
 if (lookupError) throw new Error("Could not read your existing bid");
 if (existing) {
  if (!["waiting","bidding"].includes(existing.status)) throw new Error("This lot has already closed or left your queue");
  return gameCommand(owner,"bid",existing.game_token,amount);
 }
 const {data: lot, error} = await db.from("sniper_listings").select("item_id,title,series,issue,grade,grader,status,buying_option,end_time,price_usd,pub_year,publisher,image_url,url").eq("item_id",itemId).maybeSingle();
 if (error || !lot) throw new Error("Saved auction not found");
 if (lot.status !== "live" || lot.buying_option !== "AUCTION" || !lot.grader || !(Number(lot.price_usd)>0) || !lot.end_time || Date.parse(lot.end_time)<=Date.now()) throw new Error("This saved listing is not an open graded auction");
 const research = await readLocalLotResearch(itemId);
 const values = (research?.prices || []).filter(p => Number(p.grade)===Number(lot.grade) && (p.currency || "USD")==="USD" && (p.kind || "guide")==="guide" && p.amount>0).map(p=>p.amount).sort((a,b)=>a-b);
 const middle = Math.floor(values.length/2);
 const reference = values.length ? (values.length%2 ? values[middle] : (values[middle-1]+values[middle])/2) : null;
 const token = randomUUID();
 const {error: offerError} = await db.rpc("sniper_game_action",{p_owner:owner,p_action:"offer",p_token:token,p_offer:{itemId:lot.item_id,title:lot.title,series:lot.series,issue:lot.issue,grade:lot.grade,source:"Stored venue listing",mode:"live",endTime:lot.end_time,opening:1,reference,referenceSource:reference ? "Median stored exact-grade guide comparisons; not a realized sale" : null,metadata:{imageUrl:lot.image_url,url:lot.url,grader:lot.grader,year:lot.pub_year,publisher:lot.publisher}}});
 if (offerError) throw new Error("Could not prepare this saved auction");
 // Concurrent opens use the unique owner/item row, never a duplicate round.
 const {data: enrolled,error: enrollmentError} = await db.from("sniper_paper_orders").select("game_token").eq("owner",owner).eq("item_id",itemId).not("game_token","is",null).single();
 if (enrollmentError || !enrolled) throw new Error("Could not find your auction round");
 return gameCommand(owner,"bid",enrolled.game_token,amount);
}
