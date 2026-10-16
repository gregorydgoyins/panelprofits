"use client";
import { useCallback, useEffect, useState } from "react";
import type { LotResearch } from "@/lib/sniper/research-types";
export interface ResearchLoad { data:LotResearch|null; loading:boolean; error:string|null; retry:()=>void }
/** One request when a lot opens. No prefetch, persistent client cache or background copy refresh. */
export function useLotResearch(url:string|null):ResearchLoad {
  const [attempt,setAttempt]=useState(0);
  const [state,setState]=useState<{url:string|null;data:LotResearch|null;loading:boolean;error:string|null}>({url:null,data:null,loading:false,error:null});
  const retry=useCallback(()=>setAttempt(n=>n+1),[]);
  useEffect(()=>{
    if(!url){setState({url:null,data:null,loading:false,error:null});return;}
    const controller=new AbortController();
    setState({url,data:null,loading:true,error:null});
    fetch(url,{cache:"no-store",signal:AbortSignal.any([controller.signal,AbortSignal.timeout(12000)])})
      .then(async response=>{const body=await response.json();if(!response.ok)throw new Error(body.error || "Stored research could not be read");if(body.version!==2)throw new Error("Research response is unavailable");return body as LotResearch;})
      .then(data=>{if(!controller.signal.aborted)setState({url,data,loading:false,error:null});})
      .catch(error=>{if(!controller.signal.aborted)setState({url,data:null,loading:false,error:error instanceof Error?error.message:"Stored research could not be read"});});
    return ()=>controller.abort();
  },[url,attempt]);
  return {...(state.url===url?state:{data:null,loading:Boolean(url),error:null}),retry};
}
