/**
 * Character instruments: a hero, villain or alter ego priced as the basket of its defining books (first appearances,
 * landmark issues) at their market prices. Because the basket is real equities, a character moves when its books move,
 * and on top of that carries the pressure the news puts on that character — Joker up and Harvey Dent down off the same ruling.
 */
import type { AssetItem } from "./types";
import { CHARACTER_BOOKS, matchEntities, nodeById } from "./entity-graph";
import type { RosterCharacter } from "./roster";
import { marketFactor } from "./market-dynamics";
import { conditionsFor, type ShockMap } from "./shock-propagation";
import type { Underlying } from "./underlyings";
import { censusKey, censusLine, type UniverseCensus } from "./universe";
import { ERAS, ERA_LABEL, FOOTPRINT_KEYS, FOOTPRINT_UNITS, bookKey, rosterKey, valueFootprint, type Anchor, type Era, type Footprint } from "./footprint";
import { UNIVERSE_KEYS, leadingCharacters, type UniverseCharacter } from "./universe-footprints";

/** Characters listed on the rail per publisher from the whole-universe measurement. */
export const UNIVERSE_LISTED = 400;

const r2 = (x: number) => Math.round(x * 100) / 100;

export function characterSurface(id: string): "VILLAIN" | "DC_CHARACTER" | "CHARACTER" | "SECRET_IDENTITY" | null {
  const n = nodeById(id);
  if (!n) return null;
  if (n.kind === "VILLAIN") return "VILLAIN";
  if (n.kind === "ALTER_EGO") return "SECRET_IDENTITY";
  if (n.kind === "HERO") return n.universe === "DC" ? "DC_CHARACTER" : "CHARACTER";
  return null;
}

export function issueCharacters(unders: Underlying[], shocks: ShockMap, now: number, census: UniverseCensus[] = [], roster: RosterCharacter[] = [], footprints: Map<string, Footprint> = new Map(), universe: UniverseCharacter[] = []): AssetItem[] {
  const out: AssetItem[] = [];
  const idx = new Map(unders.map((u) => [`${u.series.toLowerCase()}|${u.issueNumber}|${u.year ?? ""}`, u]));
  const byPp = new Map(unders.filter((u) => u.ppId).map((u) => [u.ppId as string, u]));
  const live = { get: (k: string) => (k.startsWith("pp:") ? byPp.get(k.slice(3))?.price : idx.get(k)?.price) };
  const uByKey = new Map(universe.map((c) => [`${c.universe}|${c.key}`, c]));
  const uKey = (universeName: string, key: string) => `${universeName.toUpperCase() === "DC" ? "DC" : "MARVEL"}|${key}`;
  let i = 0;
  const ERA_CODE: Record<Era, string> = { GOLDEN: "G", SILVER: "S", BRONZE: "B", MODERN: "M" };
  for (const [nodeId, books] of Object.entries(CHARACTER_BOOKS)) {
    const type = characterSurface(nodeId);
    const node = nodeById(nodeId);
    if (!type || !node) continue;
    const basket = books.map((b) => idx.get(`${b.series.toLowerCase()}|${b.issue}|${b.year}`)).filter((u): u is Underlying => !!u);
    if (basket.length === 0) continue;
    const wiki = UNIVERSE_KEYS[nodeId] ? uByKey.get(uKey(node.universe, UNIVERSE_KEYS[nodeId])) : undefined;
    const fp = wiki?.footprint ?? footprints.get(FOOTPRINT_KEYS[nodeId] ?? "");
    if (fp) {
      // measured from the wiki's own appearance lists, so no curated anchors are needed; the story-credit footprint still gets them
      const anchors: Anchor[] = wiki ? [] : books.map((b) => ({ series: b.series, issue: b.issue, year: b.year }));
      const val = valueFootprint(fp, live, anchors);
      if (val.nav > 0) {
        const cond2 = conditionsFor(shocks.get(nodeId));
        const sig2 = (basket.reduce((s2, u) => s2 + u.sigma, 0) / basket.length) * cond2.volMult;
        const scale = Math.exp(cond2.pressure) * marketFactor(`char:${nodeId}`, now, Math.min(sig2, 0.6));
        const price2 = (val.nav / FOOTPRINT_UNITS) * scale;
        const lead2 = basket.slice().sort((a, b) => b.price - a.price)[0];
        const sym2 = `$${nodeId.replace(/_/g, "").toUpperCase().slice(0, 5)}`;
        const totalBooks = ERAS.reduce((s2, e) => s2 + val.byEra[e].books, 0);
        out.push({
          entryId: `asset-${type.toLowerCase()}-${nodeId}-${i}`,
          assetId: `${type}-${nodeId}`,
          assetType: type,
          displayRank: ++i,
          diversityBucket: "standard",
          symbol: sym2,
          displayName: node.name,
          description: `Footprint of ${totalBooks.toLocaleString("en-US")} priced books${wiki ? ` of ${wiki.issues.toLocaleString("en-US")} issues` : ""} across ${ERAS.filter((e) => val.byEra[e].books > 0).length} ages · ${node.universe}${census.length ? ` · one of ${censusLine(census.find((c) => c.universe === censusKey(node.universe)))}` : ""}`,
          universe: node.universe,
          pricing: { fmv_usd: r2(price2), fmv: r2(price2), price: r2(price2), formula: "NAV = Σ (share of issue × market price) over every priced book the character appears in; price = NAV ÷ units × news pressure × market texture" },
          parameters: { nav: val.nav, units: FOOTPRINT_UNITS, drift: val.drift, eras: Object.fromEntries(ERAS.map((e) => [e, { label: ERA_LABEL[e], books: val.byEra[e].books, nav: val.byEra[e].nav }])), topBooks: val.topBooks, sigma: sig2, universe: census.find((c) => c.universe === censusKey(node.universe)) ?? null, trails: shocks.get(nodeId)?.trails ?? [] },
          valueUnit: "USD",
          detailUrl: lead2.detailUrl,
          coverImageUrl: lead2.coverUrl,
          coverVerified: true,
          quarantined: false,
        });
        // era slices partition the same books, so they sum to the whole
        for (const e of ERAS) {
          const slice = val.byEra[e];
          if (slice.books < 3 || !(slice.nav > 0)) continue;
          const sp = (slice.nav / FOOTPRINT_UNITS) * scale;
          out.push({
            entryId: `asset-index-${nodeId}-${e.toLowerCase()}-${i}`,
            assetId: `INDEX-${nodeId}-${e.toLowerCase()}`,
            assetType: "INDEX",
            displayRank: ++i,
            diversityBucket: "standard",
            symbol: `${sym2}${ERA_CODE[e]}`,
            displayName: `${node.name} · ${ERA_LABEL[e]}`,
            description: `${slice.books.toLocaleString("en-US")} priced books · slice of ${node.name}; all four ages sum to the whole`,
            universe: node.universe,
            pricing: { fmv_usd: r2(sp), fmv: r2(sp), price: r2(sp), formula: "Era slice of the character footprint: Σ share × market price over books of that age ÷ units × same pressure and texture as the whole" },
            parameters: { era: e, books: slice.books, nav: slice.nav, parent: nodeId },
            valueUnit: "USD",
            detailUrl: lead2.detailUrl,
            coverImageUrl: lead2.coverUrl,
            coverVerified: true,
            quarantined: false,
          });
        }
        continue;
      }
    }
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

  // Roster characters: a share of the first-appearance book, priced at its market price.
  const graphTaken = new Set(Object.keys(CHARACTER_BOOKS));
  if (universe.length > 0) {
    const handled = new Set(Object.keys(CHARACTER_BOOKS).filter((id) => UNIVERSE_KEYS[id]).map((id) => uKey(nodeById(id)?.universe ?? "DC", UNIVERSE_KEYS[id])));
    for (const uc of leadingCharacters(universe, UNIVERSE_LISTED, handled)) {
      const liveBooks = uc.footprint.top.map((b) => (b.ppId ? byPp.get(b.ppId) : undefined)).filter((u): u is Underlying => !!u);
      if (liveBooks.length === 0) continue; // no priced book on the rail to quote or link
      const node = matchEntities(uc.name).map((id) => nodeById(id)).find((n) => n && (n.kind === "HERO" || n.kind === "VILLAIN" || n.kind === "ALTER_EGO"));
      if (node && graphTaken.has(node.id)) continue;
      const type: "DC_CHARACTER" | "CHARACTER" | "VILLAIN" = node?.kind === "VILLAIN" ? "VILLAIN" : uc.universe === "DC" ? "DC_CHARACTER" : "CHARACTER";
      const val = valueFootprint(uc.footprint, live);
      if (!(val.nav > 0)) continue;
      const cond = conditionsFor(node ? shocks.get(node.id) : undefined);
      const sigma = (liveBooks.reduce((s2, u) => s2 + u.sigma, 0) / liveBooks.length) * cond.volMult;
      const slug = uc.key.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const price = (val.nav / FOOTPRINT_UNITS) * Math.exp(cond.pressure) * marketFactor(`univ:${slug}`, now, Math.min(sigma, 0.6));
      if (!(price > 0)) continue;
      const lead = liveBooks.slice().sort((a, b) => b.price - a.price)[0];
      const cen = census.find((c) => c.universe === censusKey(uc.universe));
      const sym = uc.name.replace(/^the\s+/i, "").replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 5);
      const totalBooks = ERAS.reduce((n, e) => n + val.byEra[e].books, 0);
      out.push({
        entryId: `asset-${type.toLowerCase()}-u-${slug}`,
        assetId: `${type}-u-${slug}`,
        assetType: type,
        displayRank: ++i,
        diversityBucket: "standard",
        symbol: `$${sym}`,
        displayName: uc.name,
        description: `Footprint of ${totalBooks.toLocaleString("en-US")} priced books of ${uc.issues.toLocaleString("en-US")} issues${uc.firstYear ? ` · since ${uc.firstYear}` : ""} · ${uc.universe === "DC" ? "DC" : "Marvel"}${cen ? ` · one of ${censusLine(cen)}` : ""}`,
        universe: uc.universe === "DC" ? "DC" : "Marvel",
        pricing: { fmv_usd: r2(price), fmv: r2(price), price: r2(price), formula: "NAV = Σ (share of issue × market price) over every priced book the wiki lists the character in; ÷ units × news pressure × market texture" },
        parameters: { footprint: { nav: val.nav, drift: val.drift, eras: Object.fromEntries(ERAS.map((e) => [e, { label: ERA_LABEL[e], books: val.byEra[e].books, nav: val.byEra[e].nav }])), topBooks: val.topBooks }, issues: uc.issues, debut: uc.debut, sigma, trails: node ? shocks.get(node.id)?.trails ?? [] : [] },
        valueUnit: "USD",
        detailUrl: lead.detailUrl,
        coverImageUrl: lead.coverUrl,
        coverVerified: true,
        quarantined: false,
      });
    }
    return out;
  }
  for (const rc of roster) {
    const book = idx.get(`${rc.series.toLowerCase()}|${rc.issue}|${rc.year ?? ""}`);
    if (!book) continue;
    const node = matchEntities(rc.name).map((id) => nodeById(id)).find((n) => n && (n.kind === "HERO" || n.kind === "VILLAIN" || n.kind === "ALTER_EGO"));
    if (node && graphTaken.has(node.id)) continue; // already a basket instrument
    const type: "DC_CHARACTER" | "CHARACTER" | "VILLAIN" = node?.kind === "VILLAIN" ? "VILLAIN" : rc.universe === "DC" ? "DC_CHARACTER" : "CHARACTER";
    const cond = conditionsFor(node ? shocks.get(node.id) : undefined);
    const sigma = book.sigma * cond.volMult;
    const rfp = footprints.get(rosterKey(rc.name));
    const rval = rfp ? valueFootprint(rfp, live, [{ series: rc.series, issue: rc.issue, year: rc.year ?? 0, share: rc.share }]) : null;
    const texture = Math.exp(cond.pressure) * marketFactor(`rost:${rc.slug}`, now, Math.min(sigma, 0.6));
    const price = rval && rval.nav > 0 ? (rval.nav / FOOTPRINT_UNITS) * texture : book.price * rc.share * texture;
    if (!(price > 0)) continue;
    const cen = census.find((c) => c.universe === censusKey(rc.universe));
    const sym = rc.name.replace(/^the\s+/i, "").replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 5);
    out.push({
      entryId: `asset-${type.toLowerCase()}-roster-${rc.slug}`,
      assetId: `${type}-roster-${rc.slug}`,
      assetType: type,
      displayRank: ++i,
      diversityBucket: "standard",
      symbol: `$${sym}`,
      displayName: rc.name,
      description: rval && rval.nav > 0 ? `Footprint of ${ERAS.reduce((n, e) => n + rval.byEra[e].books, 0).toLocaleString("en-US")} priced books · debut ${(rc.share * 100).toFixed(1)}% of ${book.label} · ${rc.universe === "DC" ? "DC" : "Marvel"}${cen ? ` · one of ${censusLine(cen)}` : ""}` : `${(rc.share * 100).toFixed(1)}% of ${book.label} · ${rc.stories.toLocaleString("en-US")} story appearances · ${rc.universe === "DC" ? "DC" : "Marvel"}${cen ? ` · one of ${censusLine(cen)}` : ""}`,
      universe: rc.universe === "DC" ? "DC" : "Marvel",
      pricing: { fmv_usd: r2(price), fmv: r2(price), price: r2(price), formula: rval && rval.nav > 0 ? "NAV = Σ (share of issue × market price) over the character footprint, debut book anchored; ÷ units × news pressure × market texture" : "Share = prominence ÷ (book prominence + prior) of first-appearance book market price × news pressure × market texture" },
      parameters: { footprint: rval && rval.nav > 0 ? { nav: rval.nav, drift: rval.drift, eras: Object.fromEntries(ERAS.map((e) => [e, { label: ERA_LABEL[e], books: rval.byEra[e].books, nav: rval.byEra[e].nav }])), topBooks: rval.topBooks } : null, book: book.label, share: rc.share, stories: rc.stories, sigma, wiki: `/wiki/entry/${rc.slug}`, trails: node ? shocks.get(node.id)?.trails ?? [] : [] },
      valueUnit: "USD",
      detailUrl: book.detailUrl,
      coverImageUrl: book.coverUrl,
      coverVerified: true,
      quarantined: false,
    });
  }

  return out;
}
