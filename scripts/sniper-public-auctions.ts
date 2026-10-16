import nextEnv from '@next/env';
import {writeFile} from 'node:fs/promises';
import {collectPublicCatalog,PUBLIC_CATALOGS,type PublicVenue,type CatalogTransport,fetchPublicHtml} from '../lib/sniper/public-auction-catalog';

nextEnv.loadEnvConfig(process.cwd());
const args=process.argv.slice(2),browserMode=args.includes('--browser'),save=args.includes('--save');
const only=args.find(a=>a.startsWith('--venue='))?.split('=')[1];
if(only && !(only in PUBLIC_CATALOGS))throw new Error('Venue must be comiclink, mycomicshop, or heritage');
const maxPages=Number(args.find(a=>a.startsWith('--max-pages='))?.split('=')[1]||500);
if(!Number.isInteger(maxPages)||maxPages<1||maxPages>2000)throw new Error('max-pages must be 1–2000');
const {savePublicAuctionLots}=await import('../lib/sniper/public-auction-import');
let browser:import('playwright').Browser|undefined;
try {
 let transport:CatalogTransport=fetchPublicHtml;
 if(browserMode){
  const {chromium}=await import('playwright');browser=await chromium.launch({headless:false});
  const context=await browser.newContext();const page=await context.newPage();
  transport=async url=>{
   const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
   if(response && !response.ok())throw new Error(`Public browser request HTTP ${response.status()}`);
   // Ordinary public browser rendering; no account, challenge solving, or stealth plugins.
   await page.waitForLoadState('load',{timeout:15000}).catch(()=>{});
   return {html:await page.content(),observedAt:Date.now()};
  };
 }
 let failures=0;
 for(const venue of (only?[only]:Object.keys(PUBLIC_CATALOGS)) as PublicVenue[]){
  try{
   let stored=0;
   const result=await collectPublicCatalog(venue,{transport,maxPages,onPage:async(page,url)=>{
    if(save)stored+=(await savePublicAuctionLots(page.items)).saved;
    console.log(JSON.stringify({venue,url,gradedCandidates:page.candidates,parsed:page.items.length,missingDeadline:page.missingDeadline,missingPrice:page.missingPrice,stored,next:page.nextUrl}));
   }});
   const output=`/tmp/sniper-${venue}-public-auctions.json`;await writeFile(output,JSON.stringify(result,null,2),{mode:0o600});
   console.log(JSON.stringify({venue,pages:result.pages,parsed:result.items.length,stored,complete:result.complete,output}));
   if(!result.complete)failures++;
  }catch(e){failures++;console.error(JSON.stringify({venue,error:(e as Error).message}));}
 }
 if(failures)process.exitCode=1;
}finally{await browser?.close();}
