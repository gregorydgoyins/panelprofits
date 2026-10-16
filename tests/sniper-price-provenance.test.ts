import { expect,it } from "vitest";
import { storedPrices } from "@/lib/sniper/stored-market-evidence";
it("keeps catalog condition and publication date separate from dated PriceCharting grades",()=>{
 const edition={ppcf_id:"PPCF-0001182130",variant_name:null,publication_date:"4/22/1975"};
 const prices=storedPrices([{ppcf_id:edition.ppcf_id,source_system:"COMICBASE",price_field:"Price",grade_label:"9.6",amount:25,currency:"USD",source_locator:"comicbase:1206831",observed_at:"1975-04-22"},{ppcf_id:edition.ppcf_id,source_system:"PANEL_PROFITS",price_field:"PriceCharting guide",grade_label:"9.4",amount:99.99,currency:"USD",source_locator:"https://www.pricecharting.com/game/comic-books-werewolf-by-night/werewolf-by-night-31-1975",observed_at:"2026-10-16"}],edition);
 expect(prices[0]).toMatchObject({amount:25,grade:"9.6",publicationDate:"1975-04-22",kind:"catalog"});
 expect(prices[0].observedAt).toBeUndefined();expect(prices[1]).toMatchObject({grade:"9.4",amount:99.99,observedAt:"2026-10-16",source:"PriceCharting · guide",kind:"guide"});
});
