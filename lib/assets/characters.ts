/**
 * Character instruments: a hero, villain or alter ego priced as the basket of its defining books (first appearances,
 * landmark issues) at their market prices. Because the basket is real equities, a character moves when its books move,
 * and on top of that carries the pressure the news puts on that character — Joker up and Harvey Dent down off the same ruling.
 */
import type { AssetItem } from "./types";
import { CHARACTER_BOOKS, nodeById } from "./entity-graph";
import { marketFactor } from "./market-dynamics";
import { conditionsFor, type ShockMap } from "./shock-propagation";
import type { Underlying } from "./underlyings";
import { censusKey, censusLine, type UniverseCensus } from "./universe";

const r2 = (x: number) => Math.round(x * 100) / 100;

export function characterSurface(id: string): "VILLAIN" | "DC_CHARACTER" | "CHARACTER" | "SECRET_IDENTITY" | null {
  const n = nodeById(id);
  if (!n) return null;
  if (n.kind === "VILLAIN") return "VILLAIN";
  if (n.kind === "ALTER_EGO") return "SECRET_IDENTITY";
  if (n.kind === "HERO") return n.universe === "DC" ? "DC_CHARACTER" : "CHARACTER";
  return null;
}

export function issueCharacters(unders: Underlying[], shocks: ShockMap, now: number, census: UniverseCensus[] = []): AssetItem[] {
  const out: AssetItem[] = [];
  const idx = new Map(unders.map((u) => [`${u.series.toLowerCase()}|${u.issueNumber}|${u.year ?? ""}`, u]));
  let i = 0;
  for (const [nodeId, books] of Object.entries(CHARACTER_BOOKS)) {
    const type = characterSurface(nodeId);
    const node = nodeById(nodeId);
    if (!type || !node) continue;
    const basket = books.map((b) => idx.get(`${b.series.toLowerCase()}|${b.issue}|${b.year}`)).filter((u): u is Underlying => !!u);
    if (basket.length === 0) continue;
    const mean = basket.reduce((s, u) => s + u.price, 0) / basket.length;
    const cond = conditionsFor(shocks.get(nodeId));
    const sigma = (basket.reduce((s, u) => s + u.sigma, 0) / basket.length) * cond.volMult;
    const price = mean * Math.exp(cond.pressure) * marketFactor(`char:${nodeId}`, now, Math.min(sigma, 0.6));
    const lead = basket.slice().sort((a, b) => b.price - a.price)[0];
    out.push({
      entryId: `asset-${type.toLowerCase()}-${nodeId}-${i}`,
      assetId: `${type}-${nodeId}`,
      assetType: type,
      displayRank: ++i,
      diversityBucket: "standard",
      symbol: `$${nodeId.replace(/_/g, "").toUpperCase().slice(0, 5)}`,
      displayName: node.name,
      description: `Basket of ${basket.length} defining book${basket.length > 1 ? "s" : ""} · ${node.universe}${census.length ? ` · one of ${censusLine(census.find((c) => c.universe === censusKey(node.universe)))}` : ""}`,
      universe: node.universe,
      pricing: { fmv_usd: r2(price), fmv: r2(price), price: r2(price), formula: "Basket = mean(market price of defining books) × news pressure × market texture" },
      parameters: { books: basket.map((b) => b.label), sigma, universe: census.find((c) => c.universe === censusKey(node.universe)) ?? null, trails: shocks.get(nodeId)?.trails ?? [] },
      valueUnit: "USD",
      detailUrl: lead.detailUrl,
      coverImageUrl: lead.coverUrl,
      coverVerified: true,
      quarantined: false,
    });
  }
  return out;
}
