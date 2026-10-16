import {intrinsicEligibility,balanceAuctionSites} from '@/lib/sniper/eligibility';
import {describe,it,expect} from 'vitest';
import {financialSegments} from '@/lib/lexicon/financial-links';
import {parsePriceChartingSales} from '@/lib/sniper/pricecharting-sales';
import {storedPrices} from '@/lib/sniper/stored-market-evidence';
import {formatToSalesObservation} from '@/lib/sniper/ebay-past-sales-ingest';
const identity={itemId:'ebay-v1|800775135158|0',title:'Werewolf by Night 31 CGC 9.4',series:'Werewolf By Night',issue:'31',year:1975,publisher:'Marvel',edition:null,grade:9.4,grader:'CGC'};
const sale=(title:string,date='2026-08-31',amount='$83.01')=>`<tr id="ebay-800446767767"><td class="date">${date}</td><td class="title"><a> ${title}</a> [eBay]</td><td class="numeric"><span class="js-price">${amount}</span></td></tr>`;
describe('Sniper evidence repairs',()=>{
 it('requires raw value rather than a slab premium and enforces both thresholds',()=>{
  expect(intrinsicEligibility(8.5,17,0.25)).toBe(true);expect(intrinsicEligibility(8.4,100,0.25)).toBe(false);expect(intrinsicEligibility(9.8,16.99,0.25)).toBe(false);expect(intrinsicEligibility(9.8,17,17)).toBe(false);expect(intrinsicEligibility(9.8,17,null)).toBe(false);
 });
 it('allocates equally by site with eBay regional feeds counted together',()=>{
  const rows=['ebay','ebay_uk','ebay_ca','comicconnect','comicconnect','hakes','hakes'];const balanced=balanceAuctionSites(rows,s=>s);expect(balanced).toHaveLength(6);expect(balanced.filter(s=>s.startsWith('ebay'))).toHaveLength(2);
 });
 it('links FMV and liquidity to their actual dictionary articles without matching inside words',()=>{
  const parts=financialSegments('FMV, liquidity and acquisition cost. FMV again. Illiquidity.');
  expect(parts.filter(p=>p.url).map(p=>p.url)).toEqual(['/wiki/terms/fair-market-value-fmv-benchmark','/wiki/terms/liquidity','/wiki/terms/cost-basis-tax-lot-accounting']);
  expect(parts.map(p=>p.text).join('')).toBe('FMV, liquidity and acquisition cost. FMV again. Illiquidity.');
 });
 it('imports a real completed-price cell rather than an ask, advertisement or guide',()=>{
  expect(parsePriceChartingSales(sale('Werewolf By Night #31 CGC 9.4 OW-White Pages Marvel Comics 1975'),identity)[0]).toMatchObject({price_usd:83.01,grade:9.4,sold_at:'2026-08-31',publication_year:1975,url:'https://www.ebay.com/itm/800446767767'});
  expect(parsePriceChartingSales('<span class="js-price">$761.19</span>',identity)).toEqual([]);
 });
 it('rejects another issue, signed copy, variant, invalid date and ambiguous prices',()=>{
  for(const title of ['Werewolf By Night #32 CGC 9.4 1975','Werewolf By Night #31 CGC 9.4 SS Signed 1975','Werewolf By Night #31 CGC 9.4 Newsstand 1975'])expect(parsePriceChartingSales(sale(title),identity)).toEqual([]);
  expect(parsePriceChartingSales(sale('Werewolf By Night #31 CGC 9.4 1975','invalid'),identity)).toEqual([]);
  expect(parsePriceChartingSales(sale('Werewolf By Night #31 CGC 9.4 1975','2026-08-31','$83.01</span><span class="js-price">$90.00'),identity)).toEqual([]);
 });
 it('does not label a publication year as a price observation date',()=>{
  const prices=storedPrices([{ppcf_id:'PPCF-0001216643',grade_label:'9.8',amount:161.06,source_system:'PANEL_PROFITS',source_locator:null,observed_at:'2012-10-01',currency:'USD',price_field:'grade_9_8_value'}],{ppcf_id:'PPCF-0001216643',variant_name:null,publication_date:'2012'});
  expect(prices[0].observedAt).toBeUndefined();
 });
 it('rejects missing sale dates instead of fabricating today',()=>{
  expect(()=>formatToSalesObservation({itemId:'800446767767',title:identity.title,price:83.01,currency:'USD',soldDate:'invalid',grader:'CGC',grade:'9.4',designation:'Universal'})).toThrow();
 });
});
