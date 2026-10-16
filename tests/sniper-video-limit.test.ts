import {expect,it,vi} from "vitest";
const db=vi.hoisted(()=>({from:vi.fn()}));
vi.mock("@/lib/supabase/admin",()=>({createAdminServerClient:()=>db}));
import {GET} from "@/app/api/sniper/videos/route";
it("reads saved metadata without API keys or provider requests and caps two related plus an explainer",async()=>{
 const q:any={};for(const method of ["select","eq","abortSignal"])q[method]=()=>q;
 q.maybeSingle=async()=>({data:{videos:[{videoId:"EZ_wEe5sqGo",kind:"book"},{videoId:"j8U7ne92l6E",kind:"series"},{videoId:"b8OP49ePwV4",kind:"series"},{videoId:"Z3RchqnnNjk",kind:"explainer"}]},error:null});db.from.mockReturnValue(q);
 const response=await GET(new Request("https://comicbookstockexchange.com/api/sniper/videos?series=Werewolf%20by%20Night&issue=31"));const {videos}=await response.json();expect(videos.map((v:any)=>v.kind)).toEqual(["book","series","explainer"]);expect(response.headers.get("cache-control")).toBe("no-store");
});
