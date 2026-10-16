import { expect, it, vi } from "vitest";
const db=vi.hoisted(()=>({from:vi.fn()}));
vi.mock("@/lib/supabase/admin",()=>({createAdminServerClient:()=>db}));
import { readStoredMarketEvidence } from "@/lib/sniper/stored-market-evidence";
function query(data:unknown){const q:any={};for(const name of ["select","eq","ilike","gt","order"])q[name]=()=>q;q.limit=async()=>({data,error:null});return q;}
it("labels ComicBase reference condition and keeps publication date separate from price date",async()=>{
 db.from.mockReturnValueOnce(query([{ppcf_id:"PPCF-0001182130",variant_name:null,publication_date:"4/22/1975"}])).mockReturnValueOnce(query([{source_system:"COMICBASE",price_field:"Price",grade_label:"9.6",amount:25,currency:"USD",source_locator:"comicbase:1206831",observed_at:"1975-04-22"}]));
 const result=await readStoredMarketEvidence("Werewolf By Night","31",1975,null);
 expect(result.prices[0]).toMatchObject({amount:25,publicationDate:"1975-04-22",kind:"guide"});expect(result.prices[0].observedAt).toBeUndefined();expect(result.prices[0].basis).toContain("source condition 9.6");
});
