import { readLotResearch } from "@/lib/sniper/local-research";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=15;
/** Stored listing identity is authoritative; no client title, grade or price is accepted. */
export async function GET(request:Request) {
  const started=performance.now();
  const itemId=new URL(request.url).searchParams.get("itemId")?.trim();
  const headers={"cache-control":"no-store, max-age=0","cdn-cache-control":"no-store","vercel-cdn-cache-control":"no-store"};
  if(!itemId || itemId.length>240) return Response.json({error:"Choose a saved listing"},{status:400,headers});
  try {
    const result=await readLotResearch(itemId,AbortSignal.any([request.signal,AbortSignal.timeout(10000)]));
    const timing={...headers,"server-timing":`evidence;dur=${(performance.now()-started).toFixed(1)}`};
    return result?Response.json(result,{headers:timing}):Response.json({error:"Saved listing not found"},{status:404,headers:timing});
  } catch {
    return Response.json({error:"Stored issue evidence is temporarily unavailable. Retry this lot."},{status:503,headers});
  }
}
