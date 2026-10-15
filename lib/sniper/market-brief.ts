export interface MarketBriefInput {
  listingGrade?: number | null; chartGrade: number | null; grader?: string;
  count: number; median: number | null; low: number | null; high: number | null;
  latest: { price: number; date: string } | null; allInCost?: number; variant?: string; editionTerms?: string; hasMore?: boolean;
}
const usd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export function marketBrief(input: MarketBriefInput): Array<{ heading: string; text: string }> {
  if (input.chartGrade !== input.listingGrade) return [{ heading: "Listing-grade value", text: `This chart uses ${input.chartGrade?.toFixed(1) ?? "another"} grade as a reference. It cannot establish the value or a bid ceiling for the offered ${input.listingGrade?.toFixed(1) ?? "unknown-grade"} copy.` }];
  if (!input.count || !input.latest) return [{ heading: "FMV and bid assessment", text: "No matching completed sales are present in the saved sample. There is no evidence-based FMV or bargain assessment for this copy. An asking price or the previous owner’s grading cost cannot fill that gap." }];
  const grade = `${input.grader || "Graded"} ${input.chartGrade?.toFixed(1)}`;
  const out = [{ heading: `${grade}: completed-sales snapshot`, text: `${input.count} completed sale${input.count === 1 ? "" : "s"} in this saved sample. The latest sold for ${usd(input.latest.price)} on ${input.latest.date.slice(0, 10)}.${input.count > 1 && input.low != null && input.high != null ? ` Observed range: ${usd(input.low)}–${usd(input.high)}.` : " One sale is a reference point, not a stable FMV."}` }];
  if (input.count > 1 && input.median != null) out.push({ heading: "Price reference", text: `The sample median is ${usd(input.median)}.${input.variant ? ` ${input.editionTerms ? `Sale titles are restricted to ${input.editionTerms.split("|").join(", ")};` : "This is an issue-and-grade sample;"} the ${input.variant} cover or printing must still be confirmed in the individual sale records before treating it as variant-specific FMV.` : " Confirm the sold copies’ cover, printing, label and condition before treating the median as this listing’s FMV."}` });
  if (input.allInCost != null && input.median != null) {
    const spread = input.median - input.allInCost;
    out.push({ heading: "What the offered price means", text: `The listed all-in acquisition cost is ${usd(input.allInCost)}, ${usd(Math.abs(spread))} ${spread >= 0 ? "below" : "above"} the observed sample median. ${spread >= 0 ? "That difference is before selling fees, outbound shipping and any additional costs. It establishes a comparison, not a guaranteed profit or a qualified bargain." : "This comparison does not support buying below the sample median. A confirmed edition match is still required."}` });
  }
  out.push({ heading: "Liquidity and bidding discipline", text: `The returned search page is a sample${input.hasMore ? " and additional history exists" : ""}; it cannot establish annual trading volume. Check the dates and source links, then set a ceiling from conservative comparable sales minus transaction costs and your required margin. Cover popularity or a character’s future potential does not replace a completed-sale comparison.` });
  return out;
}
