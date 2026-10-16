import { expect, it, vi } from "vitest";
vi.mock("@/lib/sniper/videos",()=>({findVideos:vi.fn().mockResolvedValue([
 {videoId:"EZ_wEe5sqGo",kind:"book"},{videoId:"j8U7ne92l6E",kind:"series"},{videoId:"b8OP49ePwV4",kind:"series"},{videoId:"4XFqV6tbB7U",kind:"series"},{videoId:"Z3RchqnnNjk",kind:"explainer"}
])}));
import { GET } from "@/app/api/sniper/videos/route";
it("returns only two relevant videos and one explainer from a larger stored set",async()=>{
 vi.stubEnv("YOUTUBE_API_KEY","test-only");
 try {const response=await GET(new Request("https://comicbookstockexchange.com/api/sniper/videos?series=Werewolf%20by%20Night&issue=31"));const {videos}=await response.json();expect(videos).toHaveLength(3);expect(videos.map((v:any)=>v.kind)).toEqual(["book","series","explainer"]);}finally{vi.unstubAllEnvs();}
});
