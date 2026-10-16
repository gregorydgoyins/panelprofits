import type {ComicRecord} from '@/lib/comics/types';
export interface GuidePoint {date:string;grade:string;price:number;source:string;url:string;sourceId:string}
export interface GuideSnapshot {pp_id:string;snapshot_date:string|null;[field:string]:unknown}
/** Only dated, positive values from the exact matched comic. Never date an undated import today. */
export function guideHistory(rows:GuideSnapshot[],comic:Pick<ComicRecord,"id"|"panel_profits_data">|null):GuidePoint[] {
 const sourceId=String(comic?.panel_profits_data?.['PP Source ID'] || comic?.panel_profits_data?.['PriceCharting ID'] || '');
 if(!comic || !sourceId)return [];
 const points=new Map<string,GuidePoint>();
 for(const row of rows){if(String(row.pp_id)!==sourceId || !row.snapshot_date || !/^\d{4}-\d{2}-\d{2}$/.test(row.snapshot_date) || !Number.isFinite(Date.parse(row.snapshot_date)))continue;
  for(const [field,value] of Object.entries(row)){const match=field.match(/^pp_price_(raw|\d+_\d+)$/);const price=Number(value);if(!match || value==null || !(price>0))continue;const grade=match[1]==='raw'?'RAW':match[1].replace('_','.');points.set(`${row.snapshot_date}|${grade}`,{date:row.snapshot_date,grade,price,source:'PriceCharting · stored guide',url:`/comics/${encodeURIComponent(comic.id)}`,sourceId});}
 }
 return [...points.values()].sort((a,b)=>a.date.localeCompare(b.date)||a.grade.localeCompare(b.grade));
}
