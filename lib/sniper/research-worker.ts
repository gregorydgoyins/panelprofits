import { createAdminServerClient } from "@/lib/supabase/admin";
import { readLotResearch } from "./local-research";
import { hydrateStoredFandom } from "@/lib/comics/stored-fandom";
import { hydrateStoredGcdStory } from "@/lib/comics/stored-gcd-story";
import { makeListingWriteup } from "./listing-writeup";
import {continueCompletedEbaySales} from "./ebay-history";
import { enrichSaleSources } from "./source-enrichment";
/** Bounded background work for existing lots. Every result advances the cursor, including missing evidence. */
export async function auditLocalResearch(limit=30) {
 const db=createAdminServerClient();
 const {data,error}=await db.rpc("sniper_research_batch",{p_limit:limit});
 if(error)throw new Error("Stored listing audit failed");
 const result={checked:0,complete:0,missing:0,errors:0,written:0,salesWritten:0};
 const start=Date.now();let generated=0,sourceChecks=0,historyPages=0;
 for(const row of data || []) {
  if(Date.now()-start>180000)break;
  let status="error";
  try {
   const research=await readLotResearch(row.item_id);if(!research)continue;
   await db.from("sniper_listings").update({research_comic_id:research.localResearch.comicId || null}).eq("item_id",row.item_id);
   const lot=research.identity;let story=research.story;
   if(!story && lot.year){const input={series:lot.series,issueNumber:lot.issue,year:lot.year,publisher:lot.publisher};story=await hydrateStoredFandom(input) || await hydrateStoredGcdStory(input);}
   let writeup=research.writeup;
   if(!writeup && story && generated<2 && Date.now()-start<100000){generated++;writeup=await makeListingWriteup(lot,story);if(writeup)result.written++;}
   if(sourceChecks<3 && lot.year && lot.grader && Date.now()-start<120000){sourceChecks++;const imported=await enrichSaleSources(research);result.salesWritten+=imported.written;}
   if(research.history.available && research.history.hasMore && historyPages<1){historyPages++;await continueCompletedEbaySales(`${lot.series} ${lot.issue}`);}
   result.checked++;
   const missing=[...(!story?["synopsis"]:[]),...(!research.localResearch.census?["census"]:[]),...(!research.localResearch.prices.length?["prices"]:[]),...(!writeup?["writeup"]:[])];
   if(!missing.length){result.complete++;status="complete";}else{result.missing++;status=`missing:${missing.join(",")}`;}
  } catch {result.errors++;}
  finally {await db.from("sniper_vendor_fetch").upsert({key:`local-research:v3:${row.item_id}`,status,items:1,sales:0,fetched_at:new Date().toISOString()});}
 }
 return result;
}
