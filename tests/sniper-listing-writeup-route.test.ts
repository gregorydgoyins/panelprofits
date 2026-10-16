import {beforeEach,expect,it,vi} from "vitest";
const read=vi.hoisted(()=>vi.fn());
vi.mock("@/lib/sniper/local-research",()=>({readLotResearch:read}));
import {GET} from "@/app/api/sniper/listing-writeup/route";
beforeEach(()=>vi.resetAllMocks());
it("rejects title-only requests instead of looking up an unverified client identity",async()=>{
 const r=await GET(new Request("http://localhost/api/sniper/listing-writeup?title=Strange%20Academy%2014"));expect(r.status).toBe(400);expect(read).not.toHaveBeenCalled();
});
it("reads one stored lot and returns uncached Rev 2 evidence",async()=>{
 const value={version:2,identity:{itemId:"saved-item"},sales:[],videos:[],writeup:null};read.mockResolvedValue(value);
 const r=await GET(new Request("http://localhost/api/sniper/listing-writeup?itemId=saved-item&title=wrong%20book"));expect(await r.json()).toEqual(value);expect(read).toHaveBeenCalledExactlyOnceWith("saved-item",expect.any(AbortSignal));expect(r.headers.get("cache-control")).toContain("no-store");
});
it("distinguishes missing data and a database outage",async()=>{
 read.mockResolvedValue(null);expect((await GET(new Request("http://localhost/api/sniper/research?itemId=missing"))).status).toBe(404);
 read.mockRejectedValue(new Error("database"));expect((await GET(new Request("http://localhost/api/sniper/research?itemId=missing"))).status).toBe(503);
});
