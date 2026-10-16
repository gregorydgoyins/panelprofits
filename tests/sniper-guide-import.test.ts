import {expect,it} from 'vitest';
import {parsePriceChartingGuide} from '@/lib/sniper/pricecharting-sales';
const url='https://www.pricecharting.com/game/comic-books-werewolf-by-night/werewolf-by-night-31-1975';
const html=`VGPC.product = { id: 2403828, };\nVGPC.chart_data = {"manualonly":[[1630476000000,0],[1643698800000,99454],[1790834400000,76119]],"boxonly":[[1643698800000,18742]],"used":[[1643698800000,3138]]};\n<option value="completed-auctions-manual-only">9.8 (3)</option><option value="completed-auctions-box-only">9.2 (5)</option><option value="completed-auctions-used">Ungraded (30)</option>`;
it('imports published historical points at the exact grades in the legend and converts cents',()=>{
 const rows=parsePriceChartingGuide(html,'2403828',url);expect(rows).toHaveLength(2);expect(rows[0]).toMatchObject({pp_id:'2403828',snapshot_date:'2022-02-01',pp_price_9_8:994.54,pp_price_9_2:187.42,pp_price_raw:31.38});expect(rows[1]).toMatchObject({snapshot_date:'2026-10-01',pp_price_9_8:761.19});expect(rows[0].pp_price_9_4).toBeUndefined();expect(parsePriceChartingGuide(html,'3374611',url)).toEqual([]);expect(rows[0].id).toBe(parsePriceChartingGuide(html,'2403828',url)[0].id);
});
