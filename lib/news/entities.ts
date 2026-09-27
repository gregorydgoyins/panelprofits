export interface EntityWikiDef {
  term: string;
  ticker?: string;
  type: "character" | "publisher" | "equity" | "creator" | "market-concept" | "grading" | "dictionary";
  target: "wiki" | "dictionary"; // 'wiki' = Panel Profits Wiki (Comic lore/GCD), 'dictionary' = Investopedia (Financial terms)
  wikiPath: string;
}

export const KNOWN_NEWS_ENTITIES_MAP: EntityWikiDef[] = [
  // --- REAL WORLD CORPORATE & MEDIA EQUITIES (Investopedia Dictionary -> Stock Tickers) ---
  { term: "HBO Max", ticker: "WBD:MAX", type: "equity", target: "dictionary", wikiPath: "/dictionary?q=HBO%20Max" },
  { term: "Max", ticker: "WBD:MAX", type: "equity", target: "dictionary", wikiPath: "/dictionary?q=Max" },
  { term: "Disney", ticker: "DIS", type: "equity", target: "dictionary", wikiPath: "/dictionary?q=Disney" },
  { term: "Marvel Studios", ticker: "DIS:MARVEL", type: "equity", target: "dictionary", wikiPath: "/dictionary?q=Marvel%20Studios" },
  { term: "Warner Bros", ticker: "WBD", type: "equity", target: "dictionary", wikiPath: "/dictionary?q=Warner%20Bros" },
  { term: "Warner Bros Discovery", ticker: "WBD", type: "equity", target: "dictionary", wikiPath: "/dictionary?q=Warner%20Bros" },
  { term: "DC Studios", ticker: "WBD:DC", type: "equity", target: "dictionary", wikiPath: "/dictionary?q=DC%20Studios" },
  { term: "Sony Pictures", ticker: "SONY", type: "equity", target: "dictionary", wikiPath: "/dictionary?q=Sony" },
  { term: "Paramount", ticker: "PARA", type: "equity", target: "dictionary", wikiPath: "/dictionary?q=Paramount" },
  { term: "Universal Pictures", ticker: "CMCSA", type: "equity", target: "dictionary", wikiPath: "/dictionary?q=Universal" },
  { term: "Netflix", ticker: "NFLX", type: "equity", target: "dictionary", wikiPath: "/dictionary?q=Netflix" },

  // --- ACTORS & CREATORS (Wiki & Investopedia Dual Lookup) ---
  { term: "Ethan Hawke", ticker: "$HAWKE", type: "creator", target: "wiki", wikiPath: "/wiki?q=Ethan%20Hawke" },
  { term: "Ashley Allen", ticker: "$AALLEN", type: "creator", target: "wiki", wikiPath: "/wiki?q=Ashley%20Allen" },
  { term: "Domenico Carbone", ticker: "$CARBONE", type: "creator", target: "wiki", wikiPath: "/wiki?q=Domenico%20Carbone" },
  { term: "Fabrizio De Tommaso", ticker: "$DETOMMASO", type: "creator", target: "wiki", wikiPath: "/wiki?q=Fabrizio%20De%20Tommaso" },
  { term: "Daniel Warren Johnson", ticker: "$DWJ", type: "creator", target: "wiki", wikiPath: "/wiki?q=Daniel%20Warren%20Johnson" },
  { term: "Jack Kirby", ticker: "$KIRBY", type: "creator", target: "wiki", wikiPath: "/wiki?q=Jack%20Kirby" },
  { term: "Stan Lee", ticker: "$LEE", type: "creator", target: "wiki", wikiPath: "/wiki?q=Stan%20Lee" },
  { term: "Todd McFarlane", ticker: "$MCFARLANE", type: "creator", target: "wiki", wikiPath: "/wiki?q=Todd%20McFarlane" },

  // --- CHARACTERS & COMIC LORE (Panel Profits Wiki -> Comic Asset Tickers) ---
  { term: "Bruce Wayne", ticker: "$BATMAN", type: "character", target: "wiki", wikiPath: "/wiki?q=Bruce%20Wayne" },
  { term: "Batman", ticker: "$BATMAN", type: "character", target: "wiki", wikiPath: "/wiki?q=Batman" },
  { term: "Dark Knight", ticker: "$BATMAN", type: "character", target: "wiki", wikiPath: "/wiki?q=Dark%20Knight" },
  { term: "Joker", ticker: "$JOKER", type: "character", target: "wiki", wikiPath: "/wiki?q=Joker" },
  { term: "Scarecrow", ticker: "$SCARECROW", type: "character", target: "wiki", wikiPath: "/wiki?q=Scarecrow" },
  { term: "Wolverine", ticker: "$LOGAN", type: "character", target: "wiki", wikiPath: "/wiki?q=Wolverine" },
  { term: "Spider-Man", ticker: "$SPIDEY", type: "character", target: "wiki", wikiPath: "/wiki?q=Spider-Man" },
  { term: "Superman", ticker: "$SUPES", type: "character", target: "wiki", wikiPath: "/wiki?q=Superman" },
  { term: "Wonder Woman", ticker: "$WW", type: "character", target: "wiki", wikiPath: "/wiki?q=Wonder%20Woman" },

  // --- PUBLISHERS & IMPRINTS ---
  { term: "DC Comics", ticker: "$DC", type: "publisher", target: "wiki", wikiPath: "/wiki?q=DC%20Comics" },
  { term: "DC's", ticker: "$DC", type: "publisher", target: "wiki", wikiPath: "/wiki?q=DC%20Comics" },
  { term: "DC", ticker: "$DC", type: "publisher", target: "wiki", wikiPath: "/wiki?q=DC%20Comics" },
  { term: "Marvel", ticker: "$MRVL", type: "publisher", target: "wiki", wikiPath: "/wiki?q=Marvel" },
  { term: "Image Comics", ticker: "$IMAGE", type: "publisher", target: "wiki", wikiPath: "/wiki?q=Image%20Comics" },

  // --- INVESTOPEDIA FINANCIAL & INDUSTRY TERMS (Underlined -> /dictionary) ---
  { term: "live-action", type: "dictionary", target: "dictionary", wikiPath: "/dictionary?q=live-action" },
  { term: "animation", type: "dictionary", target: "dictionary", wikiPath: "/dictionary?q=animation" },
  { term: "movies", type: "dictionary", target: "dictionary", wikiPath: "/dictionary?q=movies" },
  { term: "TV shows", type: "dictionary", target: "dictionary", wikiPath: "/dictionary?q=TV%20shows" },
  { term: "actor", type: "dictionary", target: "dictionary", wikiPath: "/dictionary?q=actor" },
  { term: "medium", type: "dictionary", target: "dictionary", wikiPath: "/dictionary?q=medium" },
  { term: "performance", type: "dictionary", target: "dictionary", wikiPath: "/dictionary?q=performance" },
  { term: "True Firsts", ticker: "REF:TRUE1ST", type: "market-concept", target: "dictionary", wikiPath: "/dictionary?q=True%20First" },
  { term: "First Appearance", ticker: "REF:1ST-APP", type: "market-concept", target: "dictionary", wikiPath: "/dictionary?q=First%20Appearance" },
  { term: "Key Issue", ticker: "REF:KEY", type: "market-concept", target: "dictionary", wikiPath: "/dictionary?q=Key%20Issue" },
  { term: "Variant Cover", ticker: "REF:VARIANT", type: "market-concept", target: "dictionary", wikiPath: "/dictionary?q=Variant" },
  { term: "Ratio Variant", ticker: "REF:RATIO", type: "market-concept", target: "dictionary", wikiPath: "/dictionary?q=Ratio" },
  { term: "CGC", ticker: "REF:CGC", type: "grading", target: "dictionary", wikiPath: "/dictionary?q=CGC" },
  { term: "CBCS", ticker: "REF:CBCS", type: "grading", target: "dictionary", wikiPath: "/dictionary?q=CBCS" },
  { term: "PSA", ticker: "REF:PSA", type: "grading", target: "dictionary", wikiPath: "/dictionary?q=PSA" },
];

export function findNewsEntities(headline: string, summary: string | null): EntityWikiDef[] {
  const text = `${headline} ${summary || ""}`;
  return KNOWN_NEWS_ENTITIES_MAP.filter((def) =>
    new RegExp(`\\b${def.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text)
  );
}
