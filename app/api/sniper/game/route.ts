import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { after, NextResponse } from "next/server";
import { observeGameCloses } from "@/lib/sniper/game-observer";
import { z } from "zod";
import { verifySniperSessionToken } from "@/lib/sniper/session";
import { bidOnStoredListing } from "@/lib/sniper/game-listing";
import { gameCommand, gameState } from "@/lib/sniper/game-store";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminServerClient } from "@/lib/supabase/admin";
import { readSavedLotResearch } from "@/lib/sniper/local-research";
import { readCachedWriteup } from "@/lib/sniper/listing-writeup";
import { resolveStoredPublicationYear } from "@/lib/sniper/stored-market-evidence";
import { readSavedStorySummary } from "@/lib/comics/story-summary";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const COOKIE = "pp_sniper_player";
const secret = () => process.env.SNIPER_AUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const signature = (id: string) => { const key = secret(); if (!key) throw new Error("Sniper account signing is not configured"); return createHmac("sha256", key).update(id).digest("hex"); };
async function player() {
 const cookieStore = await cookies();
 if (!verifySniperSessionToken(cookieStore.get("pp_sniper_session")?.value)) return null;
 if (cookieStore.getAll().some(cookie => /^sb-.*-auth-token/.test(cookie.name))) {
  const {data:{user}} = await (await createServerClient()).auth.getUser();
  if (user) return {id:`user:${user.id}`,fresh:false};
 }
 const saved = cookieStore.get(COOKIE)?.value || "";
 const [id, sig] = saved.split(".");
 if (z.uuid().safeParse(id).success && /^[a-f0-9]{64}$/.test(sig || "") && timingSafeEqual(Buffer.from(sig), Buffer.from(signature(id)))) return { id, fresh: false };
 return { id: randomUUID(), fresh: true };
}
function reply(body: unknown, p: {id: string; fresh: boolean}, status = 200) {
 const response = NextResponse.json(body, { status, headers: { "cache-control": "no-store" } });
 if (p.fresh) response.cookies.set(COOKIE, `${p.id}.${signature(p.id)}`, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 365 * 86400 });
 return response;
}
export async function GET(request: Request) {
 const p = await player();
 if (!p) return NextResponse.json({ error: "Sniper access required" }, { status: 401 });
 try {
  const token = new URL(request.url).searchParams.get("research");
  if (token) {
   if (!z.uuid().safeParse(token).success) return reply({error:"Invalid round"},p,400);
   const { data: round, error } = await createAdminServerClient().from("sniper_paper_orders").select("title,item_id,series,issue,result").eq("owner", p.id).eq("game_token", token).maybeSingle();
   if (error || !round) return reply({error:"Round not found"},p,404);
   const [{writeup}, localResearch] = await Promise.all([readCachedWriteup({title:round.title}),readSavedLotResearch(round.item_id)]);
   let story = localResearch?.story || null;
   if (!story) {
    const year = round.result?.year || (round.series && round.issue ? await resolveStoredPublicationYear(round.series,round.issue) : null);
    story = await readSavedStorySummary({series:round.series || "",issueNumber:round.issue || "",year,publisher:round.result?.publisher || null});
   }
   return reply({writeup,story,localResearch,state:writeup?"ready":"pending"},p);
  }
  const state=await gameState(p.id);
  after(()=>observeGameCloses(p.id).catch(()=>{}));
  return reply(state,p);
 } catch { return reply({error:"Could not read your Sniper game. Your balance has not been reset."},p,503); }
}
const action = z.object({action:z.enum(["bid","sell","refresh","listingBid"]),token:z.uuid().optional(),itemId:z.string().min(1).max(160).optional(),amount:z.number().positive().finite().optional(),double:z.boolean().optional()}).strict();
export async function POST(request: Request) {
 const p = await player();
 if (!p) return NextResponse.json({error:"Sniper access required"},{status:401});
 try {
  const parsed = action.safeParse(await request.json());
  if (!parsed.success) return reply({error:"Invalid game action"},p,400);
  const b = parsed.data;
  if (["bid","sell"].includes(b.action) && !b.token) return reply({error:"Choose a round"},p,400);
  if (["bid","listingBid"].includes(b.action) && b.amount == null) return reply({error:"Enter a bid"},p,400);
  if (b.action === "listingBid" && !b.itemId) return reply({error:"Choose a saved auction"},p,400);
  const state=b.action === "listingBid" ? await bidOnStoredListing(p.id,b.itemId!,b.amount!) : await gameCommand(p.id,b.action,b.token,b.amount,b.double);
  after(()=>observeGameCloses(p.id).catch(()=>{}));
  return reply(state,p);
 } catch (error) { return reply({error:error instanceof Error?error.message:"Game action failed"},p,400); }
}
