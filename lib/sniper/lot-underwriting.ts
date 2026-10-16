import type {LotResearch} from "./research-types";
/** A guide is a reference, not a completed transaction or guaranteed exit price. */
export function lotUnderwriting(research:LotResearch|null) {
 const grade=research?.identity.grade;
 const guides=(research?.localResearch.prices || []).filter(p=>p.kind==="guide" && (p.currency || "USD")==="USD" && Number(p.grade)===grade).map(p=>p.amount).sort((a,b)=>a-b);
 const sales=(research?.sales || []).filter(s=>s.grade===grade).map(s=>({...s,grade:s.grade!}));
 const values=guides.length?guides:sales.map(s=>s.price).sort((a,b)=>a-b);
 const middle=Math.floor(values.length/2);
 const reference=values.length?(values.length%2?values[middle]:(values[middle-1]+values[middle])/2):null;
 const source=guides.length?"Exact-grade stored guide reference; not a completed sale":sales.length?"Median of source-reported completed sales at this grade":"No grade-matched reference";
 return {reference,source,sales,census:research?.localResearch.census || null};
}
