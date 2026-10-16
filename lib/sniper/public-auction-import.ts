import {createAdminServerClient} from '@/lib/supabase/admin';
import {parseAndFilterListing} from './anti-bullshit';
import {intrinsicEligibility,usdCoverPrice} from './eligibility';
import {listingToRow} from './market-store';
import {collectPublicCatalog,type CatalogLot,type PublicVenue,PUBLIC_CATALOGS} from './public-auction-catalog';

/** Admit only uniquely identified first-print books backed by the original stored raw guide. */
export async function savePublicAuctionLots(items:CatalogLot[]) {
 const db=createAdminServerClient();const result={seen:items.length,saved:0,unmatched:0,belowValue:0};
 for(const item of items) {
  const identity=parseAndFilterListing(item.title);
  if(!identity.extractedSeries || !identity.extractedIssue || !item.year){result.unmatched++;continue;}
  const {data:links,error:linkError}=await db.from('rail_books').select('comics_id').ilike('series',identity.extractedSeries.replace(/[%_\\]/g,'\\$&')).eq('issue_number',identity.extractedIssue).eq('year',item.year).limit(30);
  if(linkError)throw new Error(`Auction crosswalk: ${linkError.message}`);
  const ids=[...new Set((links||[]).map(l=>l.comics_id))];if(!ids.length){result.unmatched++;continue;}
  const {data:books,error:bookError}=await db.from('comics').select('id,publication_year,cover_variant,printing,pp_source_id,panel_profits_data,gcd_data,comicbase_data').in('id',ids);
  if(bookError)throw new Error(`Auction comic evidence: ${bookError.message}`);
  const normalized=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
  const namedEdition=/\b(variant|exclusive|virgin|newsstand)\b/i.test(item.title);
  const matches=(books||[]).filter(c=>c.publication_year===item.year && ['', '1','1st','First'].includes(c.printing||'') &&
    (c.cover_variant ? normalized(c.cover_variant).length>=5 && normalized(item.title).includes(normalized(c.cover_variant)) : !namedEdition));
  if(matches.length!==1){result.unmatched++;continue;}
  const book=matches[0],pp=book.panel_profits_data||{},cb=book.comicbase_data||{};
  const sourceId=pp['PP Source ID']||pp['PriceCharting ID']||book.pp_source_id;
  if(!sourceId){result.unmatched++;continue;}
  const {data:prices,error:priceError}=await db.from('pp_price_history').select('pp_price_raw,snapshot_date').eq('pp_id',sourceId).gt('pp_price_raw',0).not('snapshot_date','is',null).order('snapshot_date',{ascending:false}).order('id',{ascending:false}).limit(1);
  if(priceError)throw new Error(`Auction raw valuation: ${priceError.message}`);
  const price=prices?.[0],cover=usdCoverPrice(book.gcd_data?.cover_price)??usdCoverPrice(cb['Cover Price'],cb['Cover Price Currency']);
  if(!intrinsicEligibility(item.resolvedGrade,price?.pp_price_raw,cover)){result.belowValue++;continue;}
  const now=Date.now();if(Date.parse(item.auctionEndsAt)<=now)continue;
  const payload={...item,secondsRemaining:Math.floor((Date.parse(item.auctionEndsAt)-now)/1000),eligibility:{intrinsicValue:Number(price!.pp_price_raw),coverPrice:cover!,observedAt:price!.snapshot_date,sourceId:String(sourceId),comicId:book.id,basis:'Stored raw guide; grading premium excluded'}};
  const row={...listingToRow(payload,now),grade:item.resolvedGrade,grader:item.gradingCompany,pub_year:item.year,edition:book.cover_variant||null,research_comic_id:book.id,end_time:item.auctionEndsAt};
  const {error}=await db.from('sniper_listings').upsert(row,{onConflict:'item_id'});if(error)throw new Error(`Auction persistence: ${error.message}`);
  result.saved++;
 }
 return result;
}

/** Bounded cron sweep resumes at the next published page in the existing vendor-fetch log. */
export async function importPublicAuctionCatalogs(maxPages=2) {
 const db=createAdminServerClient();const results:Record<string,unknown>={};const deadlineMs=Date.now()+40000;
 for(const venue of Object.keys(PUBLIC_CATALOGS) as PublicVenue[]) {
  const key=`public-auction-catalog:v1:${venue}`;
  const {data:state,error}=await db.from('sniper_vendor_fetch').select('cursor_url,fetched_at,status').eq('key',key).maybeSingle();
  if(error)throw new Error(`Auction cursor: ${error.message}`);
  if(state?.status==='blocked' && Date.now()-Date.parse(state.fetched_at)<3600000){results[venue]={blocked:true};continue;}
  let saved=0;
  try {
   const collected=await collectPublicCatalog(venue,{startUrl:state?.cursor_url||undefined,maxPages,deadlineMs,onPage:async page=>{
    saved+=(await savePublicAuctionLots(page.items)).saved;
    const {error}=await db.from('sniper_vendor_fetch').upsert({key,cursor_url:page.nextUrl,fetched_at:new Date().toISOString(),status:'ok',items:saved,sales:0});if(error)throw new Error(error.message);
   }});
   results[venue]={pages:collected.pages,saved,complete:collected.complete};
  }catch(e){const message=(e as Error).message;results[venue]={saved,error:message};await db.from('sniper_vendor_fetch').upsert({key,cursor_url:state?.cursor_url||null,fetched_at:new Date().toISOString(),status:'blocked',items:saved,sales:0});}
 }
 return results;
}
