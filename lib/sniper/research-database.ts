import {Pool} from "pg";
let pool:Pool|undefined;
/** Use the existing CLEAN database connection. Never route Sniper evidence through the legacy project. */
function researchPool() {
 if(pool)return pool;
 const connectionString=[process.env.SUPABASE_POOLER_URL,process.env.SUPABASE_DIRECT_URL,process.env.DATABASE_URL].find(value=>{
  if(!value)return false;
  try{const url=new URL(value);return /^postgres(?:ql)?:$/.test(url.protocol) && (url.hostname.includes("vbcmjmakluyjnsmisoth") || decodeURIComponent(url.username).includes("vbcmjmakluyjnsmisoth"));}catch{return false;}
 });
 if(!connectionString)throw new Error("The CLEAN Postgres connection is not configured for research");
 pool=new Pool({connectionString,max:2,idleTimeoutMillis:10000,connectionTimeoutMillis:3000,query_timeout:7000,ssl:{rejectUnauthorized:true}});
 pool.on("error",()=>console.warn("[sniper-research-v2] Idle database connection closed"));
 return pool;
}
export async function readLotEvidence(itemId:string,signal?:AbortSignal):Promise<unknown> {
 signal?.throwIfAborted();
 const result=await researchPool().query("select public.sniper_lot_evidence_v2($1::text) as evidence",[itemId]);
 signal?.throwIfAborted();
 return result.rows[0]?.evidence || null;
}
