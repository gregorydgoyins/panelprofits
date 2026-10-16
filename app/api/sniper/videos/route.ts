import { createAdminServerClient } from "@/lib/supabase/admin";
import { cacheKey, type SniperVideo } from "@/lib/sniper/videos";
export const dynamic="force-dynamic";
/** Compatibility endpoint: only reads saved video metadata; opening a lot never searches YouTube. */
export async function GET(request:Request) {
 const p=new URL(request.url).searchParams;
 const key=cacheKey({series:(p.get("series") || "").slice(0,120),issue:(p.get("issue") || "").slice(0,20),creators:(p.get("creators") || "").split("|").filter(Boolean).slice(0,2)});
 const {data,error}=await createAdminServerClient().from("sniper_video_cache").select("videos").eq("key",key).abortSignal(AbortSignal.timeout(5000)).maybeSingle();
 const saved=(data?.videos || []) as SniperVideo[];
 const related=saved.filter(v=>v.kind!=="explainer").slice(0,2);
 const explainer=saved.find(v=>v.kind==="explainer" && !related.some(r=>r.videoId===v.videoId));
 return Response.json({videos:error?[]:[...related,...(explainer?[explainer]:[])]},{status:error?503:200,headers:{"cache-control":"no-store"}});
}
