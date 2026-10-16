'use client';
import {useState} from 'react';
import {TradingViewChart} from '@/components/charts/tradingview-chart';
import type {GuidePoint} from '@/lib/sniper/guide-history';
export function LotGuideChart({points,grade,series,issue,ticker}:{points:GuidePoint[];grade?:number|null;series:string;issue:string;ticker:string}) {
 const grades=[...new Set(points.map(p=>p.grade))].sort((a,b)=>Number(b)-Number(a));
 const [chosen,setChosen]=useState<string|null>(null);
 const exact=grade?.toFixed(1);const selected=chosen && grades.includes(chosen)?chosen:exact && grades.includes(exact)?exact:grades.includes('9.8')?'9.8':grades.includes('RAW')?'RAW':grades[0];
 const data=points.filter(p=>p.grade===selected);if(!data.length)return null;
 const last=data[data.length-1];const first=data[0];
 return <section className="space-y-3 rounded-xl border border-cyan-500/25 bg-cyan-950/10 p-3"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-sm font-semibold text-cyan-200">PriceCharting guide history</h3><div className="flex gap-2">{grades.map(g=><button key={g} onClick={()=>setChosen(g)} aria-pressed={selected===g} className={`rounded border px-2 py-1 text-xs ${selected===g?'border-cyan-400 text-cyan-200':'border-slate-700 text-slate-400'}`}>{g==='RAW'?'Raw':g}</button>)}</div></div><p className="text-xs leading-5 text-slate-400">Dated guide estimates for this edition, separate from completed sales.{grade!=null && selected!==exact?` Showing ${selected} context; this is not a value for the listing’s ${exact || 'unverified'} grade.`:''}</p><TradingViewChart completedSalesOnly dataLabel="DATED GUIDE" ticker={ticker} series={series} issueNumber={issue} currentPrice={last.price} deltaPercent={data.length>1?(last.price-first.price)/first.price*100:0} areaData={data.map(p=>({time:p.date,value:p.price}))} candlestickData={[]} volumeData={[]} height={250}/><p className="text-xs text-slate-400">{data.length} dated observation{data.length===1?'—one point does not establish a trend.':'s.'} Last recorded {last.date}. <a href={last.url} className="text-cyan-300 underline">Source record #{last.sourceId}</a></p></section>;
}
