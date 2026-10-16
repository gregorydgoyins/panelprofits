import {createAdminServerClient} from "@/lib/supabase/admin";
import {seriesKey} from "./candles";
import {parsePriceChartingSales,parsePriceChartingGuide} from "./pricecharting-sales";
import {fetchVenueCompletedSales} from "./venue-adapters";
import type {LotResearch} from "./research-types";

const productId=(html:string)=>html.match(/VGPC\.product\s*=\s*\{\s*id:\s*(\d+)/)?.[1];
async function page(url:string){
 const response=await fetch(url,{headers:{"User-Agent":"PanelProfits/1.0 (+https://comicbookstockexchange.com)"},cache:"no-store",signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw new Error(`Source HTTP ${response.status}`);
 return {html:await response.text(),url:response.url};
}
async function resolvePriceCharting(research:LotResearch,known:string[]) {
 const sourceId=research.localResearch.pricechartingId;if(!sourceId)return null;
 if(known.length){const result=await page(known[0]);if(productId(result.html)===sourceId)return result;return null;}
 const {series,issue,edition,year}=research.identity;
 const search=new URL('https://www.pricecharting.com/search-products');search.search=new URLSearchParams({type:'prices',q:[series,edition,issue,research.localResearch.pricechartingYear || year].filter(Boolean).join(' ')}).toString();
 const result=await page(search.toString());if(productId(result.html)===sourceId)return result;
 const paths=[...new Set([...result.html.matchAll(/href="(\/game\/comic-books-[a-z0-9/-]+)"/gi)].map(m=>m[1]))];
 for(const path of paths.slice(0,3)){const candidate=await page(`https://www.pricecharting.com${path}`);if(productId(candidate.html)===sourceId)return candidate;}
 return null;
}

/** Background acquisition for comics already in the store. No listing discovery or paid research. */
export async function enrichSaleSources(research:LotResearch) {
 const db=createAdminServerClient();const {identity}=research;
 const key=`sale-evidence:v2:${identity.series}|${identity.issue}|${identity.year}|${identity.edition || ""}`;
 const {data:previous}=await db.from("sniper_vendor_fetch").select("fetched_at").eq("key",key).maybeSingle();
 if(previous && Date.now()-Date.parse(previous.fetched_at)<86400000)return {written:0,status:"already checked"};
 const urls=[...new Set(research.localResearch.prices.map(p=>p.url).filter(url=>/^https:\/\/www\.pricecharting\.com\/game\/comic-books-[a-z0-9/-]+$/i.test(url)))];
 let sourceFound=false;
 const results=await Promise.allSettled([Promise.resolve().then(async ()=>{
   const resolved=await resolvePriceCharting(research,urls);if(!resolved)return [];
   sourceFound=true;const {html,url}=resolved;if(!html.includes('id="price_comparison"'))throw new Error("PriceCharting returned no sales table");
   const sourceId=research.localResearch.pricechartingId || research.guideHistory?.[0]?.sourceId;
   const snapshots=sourceId?parsePriceChartingGuide(html,sourceId,url):[];
   if(snapshots.length){const {error}=await db.from("pp_price_history").upsert(snapshots,{onConflict:"id"});if(error)throw new Error("Guide history persistence failed");}
   if(!urls.length && research.localResearch.ppcfId && sourceId)await db.from('ppcf_price_observations').update({source_locator:url}).eq('ppcf_id',research.localResearch.ppcfId).eq('source_system','PANEL_PROFITS').eq('source_record_id',sourceId);
   return parsePriceChartingSales(html,{...identity,year:research.localResearch.pricechartingYear || identity.year});
 })]);
 const pc=results.flatMap(r=>r.status==='fulfilled'?r.value:[]);
 const venue=await fetchVenueCompletedSales([{series:identity.series,issue:identity.issue}],0,{maxBookQueries:1});
 const cc=venue.sales.filter(s=>s.series_key===seriesKey(identity.series,identity.issue)
   && !identity.edition && (!s.publication_year || s.publication_year===identity.year));
 const rows=[...pc,...cc];let written=0;
 if(rows.length){const {error}=await db.from("sniper_sales").upsert(rows,{onConflict:"id"});if(error)throw new Error("Completed-sale persistence failed");written=rows.length;}
 const status=results.some(r=>r.status==='rejected')?'partial':sourceFound?'checked':'no matched source page';
 await db.from("sniper_vendor_fetch").upsert({key,status,fetched_at:new Date().toISOString(),items:1,sales:written});
 return {written,status};
}
