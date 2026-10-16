import {describe,it,expect} from 'vitest';
import {guideHistory} from '@/lib/sniper/guide-history';
import type {ComicRecord} from '@/lib/comics/types';
const comic={id:'78ce8c6a0309f39796c8842dda1b770797f5a26d495eb24bda2dcd4a79af9fac',panel_profits_data:{'PP Source ID':'3374611'}} as Pick<ComicRecord,"id"|"panel_profits_data">;
describe('dated edition guide history',()=>{
 it('preserves the real dated Campbell 9.8 observation without making a 9.2 value',()=>{const result=guideHistory([{pp_id:'3374611',snapshot_date:'2026-10-06',pp_price_9_8:'144.38',pp_price_9_2:null,pp_price_raw:'66.91'}],comic);expect(result.map(r=>[r.grade,r.price])).toEqual([['9.8',144.38],['RAW',66.91]]);expect(result.every(r=>r.date==='2026-10-06')).toBe(true);});
 it('does not chart undated values, another edition, buy prices or sell prices',()=>{expect(guideHistory([{pp_id:'3374611',snapshot_date:null,pp_price_9_8:161.06},{pp_id:'2395618',snapshot_date:'2026-10-06',pp_price_9_8:999},{pp_id:'3374611',snapshot_date:'2026-10-06',pp_price_9_8_sell:200,pp_retail_raw_buy:20}],comic)).toEqual([]);});
 it('does not resolve ambiguous or missing comic identities',()=>{expect(guideHistory([{pp_id:'3374611',snapshot_date:'2026-10-06',pp_price_9_8:144.38}],null)).toEqual([]);});
});
