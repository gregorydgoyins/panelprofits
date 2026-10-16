import { matchCompletedComicSale } from "./completed-sale-match";
import { seriesKey } from "./candles";
import type { LotResearch } from "./research-types";
import {createHash} from "node:crypto";

const plain=(html:string)=>html.replace(/<[^>]*>/g," ").replace(/&amp;/g,"&").replace(/&#39;|&#039;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g," ").trim();
/** Public completed-sale rows only. Ignore guide prices, ads, asking prices and ambiguous multi-price rows. */
export function parsePriceChartingSales(html:string,identity:LotResearch["identity"]) {
  const out=[];
  const terms=identity.edition?.toLowerCase().split(/[^a-z0-9]+/).filter(t=>t.length>=2) || [];
  for(const block of html.match(/<tr\b[^>]*id="ebay-\d+"[^>]*>[\s\S]*?<\/tr>/gi) || []) {
    const itemId=block.match(/id="ebay-(\d+)"/)?.[1];
    const date=block.match(/class="date"[^>]*>\s*(\d{4}-\d{2}-\d{2})/)?.[1];
    const titleBlock=block.match(/<td class="title">([\s\S]*?)<\/td>/)?.[1];
    const title=titleBlock && plain(titleBlock).replace(/\s*\[eBay\]\s*$/i,"");
    const amounts=[...block.matchAll(/class="js-price"[^>]*>\s*\$([\d,]+\.\d{2})/g)];
    if(!itemId || !date || !Number.isFinite(Date.parse(date)) || !title || amounts.length!==1)continue;
    const parsed=matchCompletedComicSale(title,identity.series,identity.issue,terms);
    if(!parsed?.isCertifiedSlab || parsed.grade==null || parsed.isSigned || /restored|qualified|trimmed|purple label|green label|signature|\bSS\b/i.test(title))continue;
    if(!identity.edition && /variant|newsstand|exclusive|incentive|foil|sketch|second print|third print|\b[234]nd print|\b[234]rd print|\bCPV\b/i.test(title))continue;
    const year=title.match(/\b((?:19|20)\d{2})\b/)?.[1];
    if(year && identity.year && Number(year)!==identity.year)continue;
    const price=Number(amounts[0][1].replace(/,/g,""));if(!(price>0))continue;
    out.push({id:`ebay-completed:${itemId}`,item_id:`ebay-${itemId}`,series_key:seriesKey(identity.series,identity.issue),series:identity.series,issue:identity.issue,
      grade:parsed.grade,grader:parsed.gradingCompany,price_usd:price,sold_at:date,venue:"eBay",source:"pricecharting_completed_sale",confirmed:true,
      url:`https://www.ebay.com/itm/${itemId}`,edition:identity.edition,publication_year:identity.year});
  }
  return out;
}

/** Import the publisher's actual dated chart points, in cents, with grades read from its own legend. */
export function parsePriceChartingGuide(html:string,sourceId:string,url:string) {
  if(html.match(/VGPC\.product\s*=\s*\{\s*id:\s*(\d+)/)?.[1]!==sourceId)return [];
  const raw=html.match(/VGPC\.chart_data\s*=\s*(\{[^\n]+\})\s*;/)?.[1];if(!raw)return [];
  let chart:Record<string,unknown>;try{chart=JSON.parse(raw);}catch{return [];}
  const labels=new Map<string,string>();
  for(const match of html.matchAll(/<option value="completed-auctions-([a-z-]+)">\s*(Ungraded|\d+\.\d)/g))labels.set(match[1].replace(/-/g,''),match[2]==='Ungraded'?'raw':match[2].replace('.','_'));
  const rows=new Map<string,Record<string,unknown>>();
  const allowed=new Set(['raw','2_0','3_0','4_0','5_0','6_0','7_0','8_0','9_0','9_2','9_4','9_6','9_8','10_0']);
  for(const [key,points] of Object.entries(chart)){
    const grade=labels.get(key);if(!grade || !allowed.has(grade) || !Array.isArray(points))continue;
    for(const point of points){
      if(!Array.isArray(point) || point.length!==2 || !Number.isFinite(point[0]) || !Number.isInteger(point[1]) || point[1]<=0 || point[0]>Date.now())continue;
      const date=new Date(point[0]).toISOString().slice(0,10);
      const row=rows.get(date) || {id:-parseInt(createHash('sha256').update(`pc-chart:${sourceId}:${date}`).digest('hex').slice(0,13),16),pp_id:sourceId,snapshot_date:date,snapshot_label:`PriceCharting published guide history · ${url}`};
      row[`pp_price_${grade}`]=point[1]/100;rows.set(date,row);
    }
  }
  return [...rows.values()];
}
