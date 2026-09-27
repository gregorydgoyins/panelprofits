export interface EntityWikiDef {
  term: string;
  ticker?: string;
  type: "character" | "publisher" | "equity" | "creator" | "market-concept" | "grading" | "lexicon";
  target: "intelligence" | "lexicon";
  wikiPath: string;
}

export const KNOWN_NEWS_ENTITIES_MAP: EntityWikiDef[] = [
  // --- REAL WORLD CORPORATE EQUITIES ---
  { term: "Disney", ticker: "DIS", type: "equity", target: "lexicon", wikiPath: "/wiki?q=Disney" },
  { term: "Marvel Studios", ticker: "DIS:MARVEL", type: "equity", target: "lexicon", wikiPath: "/wiki?q=Marvel%20Studios" },
  { term: "Warner Bros", ticker: "WBD", type: "equity", target: "lexicon", wikiPath: "/wiki?q=Warner%20Bros" },
  { term: "Warner Bros Discovery", ticker: "WBD", type: "equity", target: "lexicon", wikiPath: "/wiki?q=Warner%20Bros" },
  { term: "DC Studios", ticker: "WBD:DC", type: "equity", target: "lexicon", wikiPath: "/wiki?q=DC%20Studios" },
  { term: "Sony Pictures", ticker: "SONY", type: "equity", target: "lexicon", wikiPath: "/wiki?q=Sony" },
  { term: "Paramount", ticker: "PARA", type: "equity", target: "lexicon", wikiPath: "/wiki?q=Paramount" },
  { term: "Universal Pictures", ticker: "CMCSA", type: "equity", target: "lexicon", wikiPath: "/wiki?q=Universal" },
  { term: "Netflix", ticker: "NFLX", type: "equity", target: "lexicon", wikiPath: "/wiki?q=Netflix" },

  // --- CHARACTERS & COMIC LORE ---
  { term: "Blade", ticker: "$BLADE", type: "character", target: "intelligence", wikiPath: "/wiki?q=Blade" },
  { term: "Brielle Brooks", ticker: "$BRIELLE", type: "character", target: "intelligence", wikiPath: "/wiki?q=Brielle%20Brooks" },
  { term: "Bloodline", ticker: "$BRIELLE", type: "character", target: "intelligence", wikiPath: "/wiki?q=Bloodline" },
  { term: "The Daughter of Blade", ticker: "$DOBLADE", type: "character", target: "intelligence", wikiPath: "/wiki?q=Daughter%20of%20Blade" },
  { term: "Daughter of Blade", ticker: "$DOBLADE", type: "character", target: "intelligence", wikiPath: "/wiki?q=Daughter%20of%20Blade" },
  { term: "Dragon Man", ticker: "$DRAGM", type: "character", target: "intelligence", wikiPath: "/wiki?q=Dragon%20Man" },
  { term: "Doctor Doom", ticker: "$DOOM", type: "character", target: "intelligence", wikiPath: "/wiki?q=Doctor%20Doom" },
  { term: "Miles Morales", ticker: "$MILES", type: "character", target: "intelligence", wikiPath: "/wiki?q=Miles%20Morales" },
  { term: "Spider-Man", ticker: "$SPIDEY", type: "character", target: "intelligence", wikiPath: "/wiki?q=Spider-Man" },
  { term: "The Punisher", ticker: "$PUNISHER", type: "character", target: "intelligence", wikiPath: "/wiki?q=Punisher" },
  { term: "X-Men United", ticker: "$XMEN", type: "character", target: "intelligence", wikiPath: "/wiki?q=X-Men%20United" },
  { term: "X-Men", ticker: "$XMEN", type: "character", target: "intelligence", wikiPath: "/wiki?q=X-Men" },
  { term: "Doctor Strange", ticker: "$STRANGE", type: "character", target: "intelligence", wikiPath: "/wiki?q=Doctor%20Strange" },
  { term: "Batman", ticker: "$BATMAN", type: "character", target: "intelligence", wikiPath: "/wiki?q=Batman" },
  { term: "Superman", ticker: "$SUPES", type: "character", target: "intelligence", wikiPath: "/wiki?q=Superman" },
  { term: "Wonder Woman", ticker: "$WW", type: "character", target: "intelligence", wikiPath: "/wiki?q=Wonder%20Woman" },
  { term: "Wolverine", ticker: "$LOGAN", type: "character", target: "intelligence", wikiPath: "/wiki?q=Wolverine" },
  { term: "Thor", ticker: "$THOR", type: "character", target: "intelligence", wikiPath: "/wiki?q=Thor" },
  { term: "Mjolnir", ticker: "$MJOLNIR", type: "character", target: "intelligence", wikiPath: "/wiki?q=Mjolnir" },
  { term: "Captain America", ticker: "$CAP", type: "character", target: "intelligence", wikiPath: "/wiki?q=Captain%20America" },
  { term: "Black Panther", ticker: "$PANTHER", type: "character", target: "intelligence", wikiPath: "/wiki?q=Black%20Panther" },
  { term: "Shuri", ticker: "$SHURI", type: "character", target: "intelligence", wikiPath: "/wiki?q=Shuri" },
  { term: "Chadwick Boseman", ticker: "$BOSEMAN", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Chadwick%20Boseman" },
  { term: "David Jonsson", ticker: "$JONSSON", type: "creator", target: "intelligence", wikiPath: "/wiki?q=David%20Jonsson" },
  { term: "Angela Bassett", ticker: "$BASSETT", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Angela%20Bassett" },

  // --- CREATORS ---
  { term: "Evan Narcisse", ticker: "$NARCISSE", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Evan%20Narcisse" },
  { term: "Eve L. Ewing", ticker: "$EWING", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Eve%20L.%20Ewing" },
  { term: "Tiago Palma", ticker: "$PALMA", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Tiago%20Palma" },
  { term: "Victor Olazaba", ticker: "$OLAZABA", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Victor%20Olazaba" },
  { term: "Brian Reber", ticker: "$REBER", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Brian%20Reber" },
  { term: "Federico Blee", ticker: "$BLEE", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Federico%20Blee" },
  { term: "Ruairí Coleman", ticker: "$COLEMAN", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Ruairi%20Coleman" },
  { term: "Stefano Caselli", ticker: "$CASELLI", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Stefano%20Caselli" },
  { term: "Greg Pak", ticker: "$GPAK", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Greg%20Pak" },
  { term: "Mark Buckingham", ticker: "$MBUC", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Mark%20Buckingham" },
  { term: "Phil Noto", ticker: "$NOTO", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Phil%20Noto" },

  // --- PUBLISHERS ---
  { term: "DC Comics", ticker: "$DC", type: "publisher", target: "intelligence", wikiPath: "/wiki?q=DC%20Comics" },
  { term: "DC", ticker: "$DC", type: "publisher", target: "intelligence", wikiPath: "/wiki?q=DC%20Comics" },
  { term: "Marvel Comics", ticker: "$MRVL", type: "publisher", target: "intelligence", wikiPath: "/wiki?q=Marvel" },
  { term: "Marvel", ticker: "$MRVL", type: "publisher", target: "intelligence", wikiPath: "/wiki?q=Marvel" },
  { term: "Image Comics", ticker: "$IMAGE", type: "publisher", target: "intelligence", wikiPath: "/wiki?q=Image%20Comics" },

  // --- ANALYSTS ---
  { term: "Devon Knight", type: "creator", target: "intelligence", wikiPath: "/analysts/devon-knight" },
  { term: "Marcus Vance", type: "creator", target: "intelligence", wikiPath: "/analysts/marcus-vance" },
  { term: "Elena Rostova", type: "creator", target: "intelligence", wikiPath: "/analysts/elena-rostova" },
  { term: "Sarah Chen", type: "creator", target: "intelligence", wikiPath: "/analysts/sarah-chen" },
  { term: "Thaddeus Pryor", type: "creator", target: "intelligence", wikiPath: "/analysts/thaddeus-pryor" },
  { term: "Owen St. Clair", type: "creator", target: "intelligence", wikiPath: "/analysts/owen-st-clair" },

  // --- PASS 2: CBR LEXICON & FINANCIAL THESAURUS ---
  { term: "CGC", type: "grading", target: "lexicon", wikiPath: "/lexicon?q=CGC" },
  { term: "CBCS", type: "grading", target: "lexicon", wikiPath: "/lexicon?q=CBCS" },
  { term: "raw copies", type: "grading", target: "lexicon", wikiPath: "/lexicon?q=Raw%20Copies" },
  { term: "uncertified raw copies", type: "grading", target: "lexicon", wikiPath: "/lexicon?q=Raw%20Copies" },
  { term: "high-grade", type: "grading", target: "lexicon", wikiPath: "/lexicon?q=High-Grade" },
  { term: "census slabs", type: "grading", target: "lexicon", wikiPath: "/lexicon?q=Census" },
  { term: "ratio variant", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=Ratio%20Variant" },
  { term: "first appearance", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=First%20Appearance" },
  { term: "first appearances", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=First%20Appearance" },
  { term: "first printing", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=First%20Printing" },
  { term: "release date", type: "lexicon", target: "lexicon", wikiPath: "/lexicon?q=Release%20Date" },
  { term: "Final Order Cutoff", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=Final%20Order%20Cutoff" },
  { term: "reorder volume", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=Reorder%20Volume" },
  { term: "secondary market liquidity", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=Secondary%20Market" },
  { term: "secondary market", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=Secondary%20Market" },
  { term: "bid-ask spreads", type: "lexicon", target: "lexicon", wikiPath: "/lexicon?q=Bid-Ask%20Spread" },
  { term: "auction velocity", type: "lexicon", target: "lexicon", wikiPath: "/lexicon?q=Auction%20Velocity" },
  { term: "liquidity floor", type: "lexicon", target: "lexicon", wikiPath: "/lexicon?q=Liquidity" },
  { term: "asset catalysts", type: "lexicon", target: "lexicon", wikiPath: "/lexicon?q=Catalyst" },
  { term: "creator lineage", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=Creator%20Lineage" },
];

export function findNewsEntities(headline: string, summary: string | null): EntityWikiDef[] {
  const text = `${headline} ${summary || ""}`;
  return KNOWN_NEWS_ENTITIES_MAP.filter((def) =>
    new RegExp(`\\b${def.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text)
  );
}
