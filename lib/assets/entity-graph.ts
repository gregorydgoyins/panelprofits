/**
 * The in-universe entity graph: who is connected to whom, and how stress or benefit travels between them.
 * Publishers (the companies that hold the IP) are fixed anchors — in-universe events never move them.
 * Everything else — heroes, alter egos, villains, sidekicks, teams, cities, companies, benefactors, commodities —
 * is a node that news can reach through edges.
 *
 * Edge sign: positive weight transmits stress downstream, negative weight transmits benefit
 * (e.g. a scare in Gotham stresses Gotham's bonds and sends flows toward Bruce Wayne).
 * Weights are design parameters. Locations and characters here are a seed; the full roster comes from the
 * Fandom-wiki character and location import.
 */
export type NodeKind =
  | "PUBLISHER" | "HERO" | "ALTER_EGO" | "VILLAIN" | "SIDEKICK" | "TEAM"
  | "LOCATION" | "COMPANY" | "BENEFACTOR" | "COMMODITY";

export interface GraphNode {
  id: string;
  name: string;
  kind: NodeKind;
  universe: "DC" | "Marvel";
  aliases: string[];
  /** Fixed anchors never receive in-universe shocks. */
  fixed?: boolean;
}
export interface GraphEdge { from: string; to: string; rel: string; weight: number }

const n = (id: string, name: string, kind: NodeKind, universe: "DC" | "Marvel", aliases: string[] = [], fixed = false): GraphNode =>
  ({ id, name, kind, universe, aliases: aliases.map((a) => a.toLowerCase()), fixed });

export const NODES: GraphNode[] = [
  n("dc", "DC Comics", "PUBLISHER", "DC", ["dc comics", "warner bros"], true),
  n("marvel", "Marvel", "PUBLISHER", "Marvel", ["marvel comics", "marvel studios", "disney"], true),
  // DC
  n("batman", "Batman", "HERO", "DC", ["batman", "dark knight", "caped crusader"]),
  n("bruce_wayne", "Bruce Wayne", "ALTER_EGO", "DC", ["bruce wayne"]),
  n("alfred", "Alfred Pennyworth", "SIDEKICK", "DC", ["alfred pennyworth", "alfred"]),
  n("robin", "Robin", "SIDEKICK", "DC", ["robin", "dick grayson", "nightwing"]),
  n("joker", "The Joker", "VILLAIN", "DC", ["joker", "clown prince"]),
  n("harley", "Harley Quinn", "VILLAIN", "DC", ["harley quinn", "harleen"]),
  n("gotham", "Gotham City", "LOCATION", "DC", ["gotham", "gotham city"]),
  n("wayne_enterprises", "Wayne Enterprises", "COMPANY", "DC", ["wayne enterprises", "wayne tech"]),
  n("wayne_capital", "Wayne Capital", "BENEFACTOR", "DC", ["wayne capital"]),
  n("pennyworth_industries", "Pennyworth Industries", "COMPANY", "DC", ["pennyworth industries"]),
  n("superman", "Superman", "HERO", "DC", ["superman", "man of steel", "kal-el"]),
  n("clark_kent", "Clark Kent", "ALTER_EGO", "DC", ["clark kent"]),
  n("lex_luthor", "Lex Luthor", "VILLAIN", "DC", ["lex luthor", "luthor"]),
  n("lexcorp", "LexCorp", "COMPANY", "DC", ["lexcorp"]),
  n("metropolis", "Metropolis", "LOCATION", "DC", ["metropolis"]),
  n("kryptonite", "Kryptonite", "COMMODITY", "DC", ["kryptonite"]),
  n("justice_league", "Justice League", "TEAM", "DC", ["justice league", "jla"]),
  // Marvel
  n("spider_man", "Spider-Man", "HERO", "Marvel", ["spider-man", "spiderman", "web-slinger"]),
  n("peter_parker", "Peter Parker", "ALTER_EGO", "Marvel", ["peter parker"]),
  n("green_goblin", "Green Goblin", "VILLAIN", "Marvel", ["green goblin", "norman osborn"]),
  n("oscorp", "Oscorp", "COMPANY", "Marvel", ["oscorp"]),
  n("new_york", "New York City", "LOCATION", "Marvel", ["new york", "manhattan"]),
  n("daredevil", "Daredevil", "HERO", "Marvel", ["daredevil", "matt murdock"]),
  n("kingpin", "Kingpin", "VILLAIN", "Marvel", ["kingpin", "wilson fisk"]),
  n("fisk_holdings", "Fisk Holdings", "BENEFACTOR", "Marvel", ["fisk holdings"]),
  n("iron_man", "Iron Man", "HERO", "Marvel", ["iron man", "tony stark"]),
  n("stark_industries", "Stark Industries", "COMPANY", "Marvel", ["stark industries"]),
  n("stark_capital", "Stark Capital", "BENEFACTOR", "Marvel", ["stark capital"]),
  n("hulk", "Hulk", "HERO", "Marvel", ["hulk", "bruce banner"]),
  n("x_men", "X-Men", "TEAM", "Marvel", ["x-men", "xmen", "mutants"]),
  n("wolverine", "Wolverine", "HERO", "Marvel", ["wolverine", "logan"]),
  n("avengers", "Avengers", "TEAM", "Marvel", ["avengers"]),
  n("wakanda", "Wakanda", "LOCATION", "Marvel", ["wakanda"]),
  n("black_panther", "Black Panther", "HERO", "Marvel", ["black panther", "t'challa"]),
  n("vibranium", "Vibranium", "COMMODITY", "Marvel", ["vibranium"]),
  n("doom", "Doctor Doom", "VILLAIN", "Marvel", ["doctor doom", "victor von doom", "dr. doom"]),
  n("fantastic_four", "Fantastic Four", "TEAM", "Marvel", ["fantastic four"]),
];

export const EDGES: GraphEdge[] = [
  // Gotham web
  { from: "joker", to: "gotham", rel: "terrorizes", weight: 0.9 },
  { from: "joker", to: "batman", rel: "nemesis", weight: 0.6 },
  { from: "harley", to: "joker", rel: "accomplice", weight: 0.5 },
  { from: "batman", to: "gotham", rel: "collateral damage", weight: 0.4 },
  { from: "gotham", to: "batman", rel: "home city", weight: 0.5 },
  { from: "batman", to: "bruce_wayne", rel: "same person", weight: 0.9 },
  { from: "bruce_wayne", to: "batman", rel: "same person", weight: 0.9 },
  { from: "robin", to: "batman", rel: "partner", weight: 0.5 },
  { from: "batman", to: "robin", rel: "partner", weight: 0.5 },
  { from: "alfred", to: "bruce_wayne", rel: "confidant", weight: 0.4 },
  { from: "gotham", to: "wayne_enterprises", rel: "home market", weight: 0.5 },
  { from: "gotham", to: "bruce_wayne", rel: "relief funding flows to Batman's backer", weight: -0.3 },
  { from: "gotham", to: "wayne_capital", rel: "relief funding flows", weight: -0.3 },
  { from: "gotham", to: "pennyworth_industries", rel: "shell conduit for relief funds", weight: -0.2 },
  { from: "bruce_wayne", to: "wayne_capital", rel: "owner", weight: 0.6 },
  { from: "bruce_wayne", to: "wayne_enterprises", rel: "owner", weight: 0.6 },
  { from: "justice_league", to: "batman", rel: "member", weight: 0.3 },
  { from: "justice_league", to: "superman", rel: "member", weight: 0.3 },
  // Metropolis
  { from: "lex_luthor", to: "superman", rel: "nemesis", weight: 0.6 },
  { from: "lex_luthor", to: "lexcorp", rel: "owner", weight: 0.7 },
  { from: "lex_luthor", to: "metropolis", rel: "schemes", weight: 0.5 },
  { from: "superman", to: "clark_kent", rel: "same person", weight: 0.9 },
  { from: "superman", to: "metropolis", rel: "protects", weight: 0.3 },
  { from: "kryptonite", to: "superman", rel: "weakens", weight: 0.5 },
  { from: "metropolis", to: "lexcorp", rel: "home market", weight: 0.4 },
  // Marvel web
  { from: "green_goblin", to: "spider_man", rel: "nemesis", weight: 0.6 },
  { from: "green_goblin", to: "oscorp", rel: "owner", weight: 0.7 },
  { from: "green_goblin", to: "new_york", rel: "terrorizes", weight: 0.7 },
  { from: "spider_man", to: "peter_parker", rel: "same person", weight: 0.9 },
  { from: "spider_man", to: "new_york", rel: "protects", weight: 0.3 },
  { from: "kingpin", to: "daredevil", rel: "nemesis", weight: 0.6 },
  { from: "kingpin", to: "fisk_holdings", rel: "owner", weight: 0.7 },
  { from: "kingpin", to: "new_york", rel: "crime", weight: 0.5 },
  { from: "iron_man", to: "stark_industries", rel: "owner", weight: 0.7 },
  { from: "iron_man", to: "stark_capital", rel: "owner", weight: 0.6 },
  { from: "avengers", to: "iron_man", rel: "member", weight: 0.3 },
  { from: "avengers", to: "hulk", rel: "member", weight: 0.3 },
  { from: "x_men", to: "wolverine", rel: "member", weight: 0.4 },
  { from: "doom", to: "fantastic_four", rel: "nemesis", weight: 0.6 },
  { from: "wakanda", to: "vibranium", rel: "sole source", weight: 0.7 },
  { from: "wakanda", to: "black_panther", rel: "ruler", weight: 0.5 },
  { from: "new_york", to: "stark_industries", rel: "home market", weight: 0.3 },
];

/** Series (lowercase substring) → the hero or team whose news moves that book. */
export const SERIES_ENTITIES: { match: string; node: string }[] = [
  { match: "batman", node: "batman" },
  { match: "detective comics", node: "batman" },
  { match: "action comics", node: "superman" },
  { match: "superman", node: "superman" },
  { match: "amazing spider-man", node: "spider_man" },
  { match: "amazing fantasy", node: "spider_man" },
  { match: "daredevil", node: "daredevil" },
  { match: "iron man", node: "iron_man" },
  { match: "tales of suspense", node: "iron_man" },
  { match: "incredible hulk", node: "hulk" },
  { match: "x-men", node: "x_men" },
  { match: "new mutants", node: "x_men" },
  { match: "wolverine", node: "wolverine" },
  { match: "fantastic four", node: "fantastic_four" },
  { match: "black panther", node: "black_panther" },
];

export function entitiesForSeries(series: string): string[] {
  const s = series.toLowerCase();
  return [...new Set(SERIES_ENTITIES.filter((e) => s.includes(e.match)).map((e) => e.node))];
}

const NODE_BY_ID = new Map(NODES.map((x) => [x.id, x]));
export const nodeById = (id: string) => NODE_BY_ID.get(id);

/** Nodes named in a text (aliases matched on word boundaries). */
export function matchEntities(text: string): string[] {
  const t = ` ${text.toLowerCase().replace(/[^a-z0-9'\-. ]+/g, " ")} `;
  const hit: string[] = [];
  for (const node of NODES) {
    for (const a of node.aliases.concat(node.name.toLowerCase())) {
      if (a.length >= 4 && t.includes(` ${a} `)) { hit.push(node.id); break; }
    }
  }
  return hit;
}
