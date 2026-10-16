import { financialSegments } from "@/lib/lexicon/financial-links";
export function FinancialText({text}:{text:string}) {
  return <>{financialSegments(text).map((part,i)=>part.url?<a key={i} href={part.url} title={part.definition} className="text-cyan-300 underline decoration-dotted underline-offset-4">{part.text}</a>:part.text)}</>;
}
