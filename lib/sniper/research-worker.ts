import { createAdminServerClient } from "@/lib/supabase/admin";
import { readLotResearch } from "./local-research";
import { hydrateStoredFandom } from "@/lib/comics/stored-fandom";
import { hydrateStoredGcdStory } from "@/lib/comics/stored-gcd-story";
import { makeListingWriteup } from "./listing-writeup";
/** Enrich existing listings from stored imports. Never fetch a new listing or save a duplicate page snapshot. */
export async function auditLocalResearch(limit=30) {
  const db=createAdminServerClient();
  const {data,error}=await db.from("sniper_listings").select("item_id").eq("status","live").order("end_time",{ascending:true}).limit(limit);
  if(error)throw new Error("Stored listing audit failed");
  const result={checked:0,complete:0,missing:0,errors:0,written:0};
  for(const row of data || []) {
    try {
      const research=await readLotResearch(row.item_id);
      if(!research)continue;
      const lot=research.identity;
      let story=research.story;
      if(!story && lot.year){const input={series:lot.series,issueNumber:lot.issue,year:lot.year,publisher:lot.publisher};story=await hydrateStoredFandom(input) || await hydrateStoredGcdStory(input);}
      let writeup=research.writeup;
      if(!writeup && story){writeup=await makeListingWriteup(lot,story);if(writeup)result.written++;}
      result.checked++;
      if(story && research.localResearch.census && research.localResearch.prices.length && writeup) result.complete++;else result.missing++;
    } catch {result.errors++;}
  }
  return result;
}
