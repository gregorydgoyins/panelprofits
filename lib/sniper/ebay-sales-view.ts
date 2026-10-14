import { readCompletedEbaySales } from "./ebay-history";
import { matchCompletedComicSale } from "./completed-sale-match";
import { dedupeSales, type SaleObs } from "./candles";

/** Shared completed-sale evidence for the chart and its ledger. */
export async function readEbaySalesForBook(series: string, issue: string, grader?: string | null) {
  const history = await readCompletedEbaySales(`${series} ${String(issue).replace(/^#/, "")}`);
  const sales: SaleObs[] = [];
  for (const item of history.items) {
    const price = Number(item.lastSoldPrice?.value);
    const date = item.lastSoldDate;
    if (!(price > 0) || item.lastSoldPrice?.currency !== "USD" || !date || !Number.isFinite(Date.parse(date))) continue;
    const parsed = matchCompletedComicSale(String(item.title || ""), series, issue);
    if (!parsed || (grader && parsed.gradingCompany !== grader)) continue;
    sales.push({ itemId: item.itemId, date, price, grade: parsed.grade, venue: "ebay", source: history.provider === "ebay_marketplace_insights" ? "ebay_insights" : "ebay_history", confirmed: true, url: item.itemWebUrl });
  }
  return { history, sales: dedupeSales(sales) };
}
