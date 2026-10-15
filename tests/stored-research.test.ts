import { describe, it, expect } from 'vitest';
import { importedStory, FANDOM_HOSTS } from '@/lib/comics/stored-fandom';
import { exactStoredEdition } from '@/lib/sniper/stored-market-evidence';
import { storedWriteupPrompt } from '@/lib/sniper/listing-writeup';
describe('stored source research', () => {
 it('supports the publisher source hosts without pretending a cast list is a synopsis', () => {
  for(const wiki of ['marvel','dc','starwars','darkhorse','image','tmnt']) expect(FANDOM_HOSTS[wiki]).toBeTruthy();
  expect(importedStory({wiki:'starwars',page_title:'Test',data:{stories:[{appearances:[{name:'Yoda'}]}]}})).toBeNull();
 });
 it('preserves plot, credits and first-appearance evidence separately', () => {
  const r=importedStory({wiki:'dc',page_title:'Batman Vol 1 251',data:{cover_year:'1973',cover_artists:['Neal Adams'],stories:[{synopsis:'Batman protects the targets of the Joker.',writers:["Dennis O’Neil"],appearances:[{name:'Batman',target:'Bruce Wayne (Earth-One)',section:'Featured Characters',first_appearance:false,flags:['firstfull']}]}]}})!;
  expect(r.text).toContain('protects'); expect(r.credits?.coverArtists).toEqual(['Neal Adams']);
  expect(r.entities?.firstAppearances).toBeUndefined();
  expect(r.entities?.featuredCharacters?.[0].url).toBe('/wiki/entry/bruce-wayne');
  expect(storedWriteupPrompt({title:'Batman #251'},r)).toContain('Do not search');
 });
 it('matches the base Cover A but rejects reprints, different years and ambiguity', () => {
  const row={ppcf_id:'PPCF-0000472764',variant_name:'Cover A - Esau Escorza and Issac Escorza',publication_date:'October 2020'};
  expect(exactStoredEdition([row],2020,null)).toBe(row);
  expect(exactStoredEdition([row],2024,null)).toBeNull();
  expect(exactStoredEdition([row,{...row,ppcf_id:'other'}],2020,null)).toBeNull();
  expect(exactStoredEdition([{...row,variant_name:'Second Printing'}],2020,null)).toBeNull();
 });
});
