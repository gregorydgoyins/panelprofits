export interface EntityWikiDef {
  term: string;
  ticker?: string;
  type: "character" | "publisher" | "equity" | "creator" | "market-concept" | "grading" | "lexicon";
  target: "intelligence" | "lexicon"; // 'intelligence' = CBR Intelligence (Lore/Creators), 'lexicon' = CBR Financial Lexicon
  wikiPath: string;
}

export const KNOWN_NEWS_ENTITIES_MAP: EntityWikiDef[] = [
  // --- REAL WORLD CORPORATE & MEDIA EQUITIES (CBR Financial Lexicon -> Real Stock Tickers) ---
  { term: "HBO Max", ticker: "WBD:MAX", type: "equity", target: "lexicon", wikiPath: "/lexicon?q=HBO%20Max" },
  { term: "Max", ticker: "WBD:MAX", type: "equity", target: "lexicon", wikiPath: "/lexicon?q=Max" },
  { term: "Disney", ticker: "DIS", type: "equity", target: "lexicon", wikiPath: "/lexicon?q=Disney" },
  { term: "Marvel Studios", ticker: "DIS:MARVEL", type: "equity", target: "lexicon", wikiPath: "/lexicon?q=Marvel%20Studios" },
  { term: "Warner Bros", ticker: "WBD", type: "equity", target: "lexicon", wikiPath: "/lexicon?q=Warner%20Bros" },
  { term: "Warner Bros Discovery", ticker: "WBD", type: "equity", target: "lexicon", wikiPath: "/lexicon?q=Warner%20Bros" },
  { term: "DC Studios", ticker: "WBD:DC", type: "equity", target: "lexicon", wikiPath: "/lexicon?q=DC%20Studios" },
  { term: "Sony Pictures", ticker: "SONY", type: "equity", target: "lexicon", wikiPath: "/lexicon?q=Sony" },
  { term: "Paramount", ticker: "PARA", type: "equity", target: "lexicon", wikiPath: "/lexicon?q=Paramount" },
  { term: "Universal Pictures", ticker: "CMCSA", type: "equity", target: "lexicon", wikiPath: "/lexicon?q=Universal" },
  { term: "Netflix", ticker: "NFLX", type: "equity", target: "lexicon", wikiPath: "/lexicon?q=Netflix" },

  // --- ACTORS & CREATORS (CBR Intelligence -> Lore & Creator Index) ---
  { term: "Ethan Hawke", ticker: "$HAWKE", type: "creator", target: "intelligence", wikiPath: "/intelligence?q=Ethan%20Hawke" },
  { term: "Ashley Allen", ticker: "$AALLEN", type: "creator", target: "intelligence", wikiPath: "/intelligence?q=Ashley%20Allen" },
  { term: "Domenico Carbone", ticker: "$CARBONE", type: "creator", target: "intelligence", wikiPath: "/intelligence?q=Domenico%20Carbone" },
  { term: "Fabrizio De Tommaso", ticker: "$DETOMMASO", type: "creator", target: "intelligence", wikiPath: "/intelligence?q=Fabrizio%20De%20Tommaso" },
  { term: "Daniel Warren Johnson", ticker: "$DWJ", type: "creator", target: "intelligence", wikiPath: "/intelligence?q=Daniel%20Warren%20Johnson" },
  { term: "Jack Kirby", ticker: "$KIRBY", type: "creator", target: "intelligence", wikiPath: "/intelligence?q=Jack%20Kirby" },
  { term: "Stan Lee", ticker: "$LEE", type: "creator", target: "intelligence", wikiPath: "/intelligence?q=Stan%20Lee" },
  { term: "Todd McFarlane", ticker: "$MCFARLANE", type: "creator", target: "intelligence", wikiPath: "/intelligence?q=Todd%20McFarlane" },

  // --- CHARACTERS & COMIC LORE (CBR Intelligence -> CBR Market Ticker) ---
  { term: "Bruce Wayne", ticker: "$BATMAN", type: "character", target: "intelligence", wikiPath: "/intelligence?q=Bruce%20Wayne" },
  { term: "Batman", ticker: "$BATMAN", type: "character", target: "intelligence", wikiPath: "/intelligence?q=Batman" },
  { term: "Dark Knight", ticker: "$BATMAN", type: "character", target: "intelligence", wikiPath: "/intelligence?q=Dark%20Knight" },
  { term: "Joker", ticker: "$JOKER", type: "character", target: "intelligence", wikiPath: "/intelligence?q=Joker" },
  { term: "Scarecrow", ticker: "$SCARECROW", type: "character", target: "intelligence", wikiPath: "/intelligence?q=Scarecrow" },
  { term: "Wolverine", ticker: "$LOGAN", type: "character", target: "intelligence", wikiPath: "/intelligence?q=Wolverine" },
  { term: "Jubilee", ticker: "$JUBILEE", type: "character", target: "intelligence", wikiPath: "/intelligence?q=Jubilee" },
  { term: "Apocalypse", ticker: "$APOCALYPSE", type: "character", target: "intelligence", wikiPath: "/intelligence?q=Apocalypse" },
  { term: "Spider-Man", ticker: "$SPIDEY", type: "character", target: "intelligence", wikiPath: "/intelligence?q=Spider-Man" },
  { term: "Superman", ticker: "$SUPES", type: "character", target: "intelligence", wikiPath: "/intelligence?q=Superman" },
  { term: "Wonder Woman", ticker: "$WW", type: "character", target: "intelligence", wikiPath: "/intelligence?q=Wonder%20Woman" },

  // --- PUBLISHERS & IMPRINTS ---
  { term: "DC Comics", ticker: "$DC", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=DC%20Comics" },
  { term: "DC's", ticker: "$DC", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=DC%20Comics" },
  { term: "DC", ticker: "$DC", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=DC%20Comics" },
  { term: "Marvel", ticker: "$MRVL", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=Marvel" },
  { term: "Image Comics", ticker: "$IMAGE", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=Image%20Comics" },

  // --- CBR FINANCIAL LEXICON TERMS (Industry Terms & Financial Concepts) ---
  { term: "live-action", type: "lexicon", target: "lexicon", wikiPath: "/lexicon?q=live-action" },
  { term: "animation", type: "lexicon", target: "lexicon", wikiPath: "/lexicon?q=animation" },
  { term: "movies", type: "lexicon", target: "lexicon", wikiPath: "/lexicon?q=movies" },
  { term: "TV shows", type: "lexicon", target: "lexicon", wikiPath: "/lexicon?q=TV%20shows" },
  { term: "actor", type: "lexicon", target: "lexicon", wikiPath: "/lexicon?q=actor" },
  { term: "medium", type: "lexicon", target: "lexicon", wikiPath: "/lexicon?q=medium" },
  { term: "performance", type: "lexicon", target: "lexicon", wikiPath: "/lexicon?q=performance" },
  { term: "True Firsts", ticker: "REF:TRUE1ST", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=True%20First" },
  { term: "First Appearance", ticker: "REF:1ST-APP", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=First%20Appearance" },
  { term: "Key Issue", ticker: "REF:KEY", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=Key%20Issue" },
  { term: "Variant Cover", ticker: "REF:VARIANT", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=Variant" },
  { term: "Ratio Variant", ticker: "REF:RATIO", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=Ratio" },
  { term: "CGC", ticker: "REF:CGC", type: "grading", target: "lexicon", wikiPath: "/lexicon?q=CGC" },
  { term: "CBCS", ticker: "REF:CBCS", type: "grading", target: "lexicon", wikiPath: "/lexicon?q=CBCS" },
  { term: "PSA", ticker: "REF:PSA", type: "grading", target: "lexicon", wikiPath: "/lexicon?q=PSA" },
];

export function findNewsEntities(headline: string, summary: string | null): EntityWikiDef[] {
  const text = `${headline} ${summary || ""}`;
  return KNOWN_NEWS_ENTITIES_MAP.filter((def) =>
    new RegExp(`\\b${def.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text)
  );
}
