/** Cover price must explicitly identify USD; do not compare unlike currencies. */
export function usdCoverPrice(text:string|null|undefined,currency?:string|null):number|null {
 const value=(text || '').trim();
 if(!/^\$?\d+(?:\.\d+)? USD$/.test(value) && !(currency==='USD' && /^\$?\d+(?:\.\d+)?$/.test(value)))return null;
 const amount=Number(value.replace(/[^0-9.]/g,''));return amount>=0?amount:null;
}
export function intrinsicEligibility(grade:number|null|undefined,rawValue:number|null|undefined,coverPrice:number|null|undefined) {
 return grade!=null && grade>=8.5 && rawValue!=null && rawValue>=17 && coverPrice!=null && rawValue>coverPrice;
}

/** Equal allocation among represented auction sites. Regional eBay feeds are one site. */
export function balanceAuctionSites<T>(items:T[],source:(item:T)=>string):T[] {
 const site=(item:T)=>source(item).startsWith('ebay')?'ebay':source(item);
 const counts=new Map<string,number>();for(const item of items)counts.set(site(item),(counts.get(site(item)) || 0)+1);
 if(!counts.size)return [];
 const quota=Math.min(...counts.values()),used=new Map<string,number>();
 return items.filter(item=>{const key=site(item),n=used.get(key) || 0;if(n>=quota)return false;used.set(key,n+1);return true;});
}
