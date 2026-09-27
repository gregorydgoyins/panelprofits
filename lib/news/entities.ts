export interface EntityWikiDef {
  term: string;
  ticker?: string;
  type: "character" | "publisher" | "equity" | "creator" | "market-concept" | "grading";
  wikiPath: string;
}

export const KNOWN_NEWS_ENTITIES_MAP: EntityWikiDef[] = [
  // --- REAL WORLD CORPORATE & MEDIA EQUITIES (Real stock tickers remain accurate, never affected) ---
  { term: "Disney", ticker: "DIS", type: "equity", wikiPath: "/wiki?q=Disney" },
  { term: "Marvel Studios", ticker: "DIS:MARVEL", type: "equity", wikiPath: "/wiki?q=Marvel%20Studios" },
  { term: "Warner Bros", ticker: "WBD", type: "equity", wikiPath: "/wiki?q=Warner%20Bros" },
  { term: "Warner Bros Discovery", ticker: "WBD", type: "equity", wikiPath: "/wiki?q=Warner%20Bros" },
  { term: "DC Studios", ticker: "WBD:DC", type: "equity", wikiPath: "/wiki?q=DC%20Studios" },
  { term: "Sony Pictures", ticker: "SONY", type: "equity", wikiPath: "/wiki?q=Sony" },
  { term: "Paramount", ticker: "PARA", type: "equity", wikiPath: "/wiki?q=Paramount" },
  { term: "Universal Pictures", ticker: "CMCSA", type: "equity", wikiPath: "/wiki?q=Universal" },
  { term: "Netflix", ticker: "NFLX", type: "equity", wikiPath: "/wiki?q=Netflix" },
  { term: "Kadokawa", ticker: "9468.T", type: "equity", wikiPath: "/wiki?q=Kadokawa" },

  // --- ACTUAL COMIC INDUSTRY CREATORS (GCD Database Verified) ---
  { term: "Ashley Allen", ticker: "$AALLEN", type: "creator", wikiPath: "/wiki?q=Ashley%20Allen" },
  { term: "Domenico Carbone", ticker: "$CARBONE", type: "creator", wikiPath: "/wiki?q=Domenico%20Carbone" },
  { term: "Fabrizio De Tommaso", ticker: "$DETOMMASO", type: "creator", wikiPath: "/wiki?q=Fabrizio%20De%20Tommaso" },
  { term: "Daniel Warren Johnson", ticker: "$DWJ", type: "creator", wikiPath: "/wiki?q=Daniel%20Warren%20Johnson" },
  { term: "Jack Kirby", ticker: "$KIRBY", type: "creator", wikiPath: "/wiki?q=Jack%20Kirby" },
  { term: "Stan Lee", ticker: "$LEE", type: "creator", wikiPath: "/wiki?q=Stan%20Lee" },
  { term: "Todd McFarlane", ticker: "$MCFARLANE", type: "creator", wikiPath: "/wiki?q=Todd%20McFarlane" },
  { term: "Jim Lee", ticker: "$JIMLEE", type: "creator", wikiPath: "/wiki?q=Jim%20Lee" },
  { term: "Frank Miller", ticker: "$MILLER", type: "creator", wikiPath: "/wiki?q=Frank%20Miller" },
  { term: "Alan Moore", ticker: "$MOORE", type: "creator", wikiPath: "/wiki?q=Alan%20Moore" },

  // --- KEY CHARACTERS & COMIC ASSETS (GCD & Panel Profits Internal Asset Tickers) ---
  { term: "Jubilee", ticker: "$JUBILEE", type: "character", wikiPath: "/wiki?q=Jubilee" },
  { term: "Apocalypse", ticker: "$APOCALYPSE", type: "character", wikiPath: "/wiki?q=Apocalypse" },
  { term: "Wolverine", ticker: "$LOGAN", type: "character", wikiPath: "/wiki?q=Wolverine" },
  { term: "Spider-Man", ticker: "$SPIDEY", type: "character", wikiPath: "/wiki?q=Spider-Man" },
  { term: "Batman", ticker: "$BATMAN", type: "character", wikiPath: "/wiki?q=Batman" },
  { term: "Superman", ticker: "$SUPES", type: "character", wikiPath: "/wiki?q=Superman" },
  { term: "Wonder Woman", ticker: "$WW", type: "character", wikiPath: "/wiki?q=Wonder%20Woman" },
  { term: "Deadpool", ticker: "$POOL", type: "character", wikiPath: "/wiki?q=Deadpool" },
  { term: "Iron Man", ticker: "$IRON", type: "character", wikiPath: "/wiki?q=Iron%20Man" },
  { term: "Captain America", ticker: "$CAP", type: "character", wikiPath: "/wiki?q=Captain%20America" },
  { term: "Thor", ticker: "$THOR", type: "character", wikiPath: "/wiki?q=Thor" },
  { term: "Hulk", ticker: "$HULK", type: "character", wikiPath: "/wiki?q=Hulk" },
  { term: "Venom", ticker: "$VENOM", type: "character", wikiPath: "/wiki?q=Venom" },
  { term: "Daredevil", ticker: "$DD", type: "character", wikiPath: "/wiki?q=Daredevil" },
  { term: "Punisher", ticker: "$PUNISHER", type: "character", wikiPath: "/wiki?q=Punisher" },
  { term: "Ghost Fleet", ticker: "$GHOSTFLEET", type: "character", wikiPath: "/wiki?q=Ghost%20Fleet" },
  { term: "Extremity", ticker: "$EXTREMITY", type: "character", wikiPath: "/wiki?q=Extremity" },
  { term: "Murder Falcon", ticker: "$MFALCON", type: "character", wikiPath: "/wiki?q=Murder%20Falcon" },
  { term: "Beta Ray Bill", ticker: "$BILL", type: "character", wikiPath: "/wiki?q=Beta%20Ray%20Bill" },
  { term: "Spawn", ticker: "$SPAWN", type: "character", wikiPath: "/wiki?q=Spawn" },
  { term: "Hellboy", ticker: "$HELLBOY", type: "character", wikiPath: "/wiki?q=Hellboy" },
  { term: "Invincible", ticker: "$INVINCIBLE", type: "character", wikiPath: "/wiki?q=Invincible" },
  { term: "X-Men", ticker: "$XMEN", type: "character", wikiPath: "/wiki?q=X-Men" },
  { term: "Avengers", ticker: "$AVENGERS", type: "character", wikiPath: "/wiki?q=Avengers" },

  // --- PUBLISHERS & IMPRINTS ---
  { term: "Marvel", ticker: "$MRVL", type: "publisher", wikiPath: "/wiki?q=Marvel" },
  { term: "DC Comics", ticker: "$DC", type: "publisher", wikiPath: "/wiki?q=DC%20Comics" },
  { term: "Image Comics", ticker: "$IMAGE", type: "publisher", wikiPath: "/wiki?q=Image%20Comics" },
  { term: "Dark Horse", ticker: "$DARKHORSE", type: "publisher", wikiPath: "/wiki?q=Dark%20Horse" },
  { term: "IDW Publishing", ticker: "$IDW", type: "publisher", wikiPath: "/wiki?q=IDW" },
  { term: "BOOM! Studios", ticker: "$BOOM", type: "publisher", wikiPath: "/wiki?q=BOOM!" },
  { term: "Shueisha", ticker: "$SHUEISHA", type: "publisher", wikiPath: "/wiki?q=Shueisha" },
  { term: "Kodansha", ticker: "$KODANSHA", type: "publisher", wikiPath: "/wiki?q=Kodansha" },
  { term: "Viz Media", ticker: "$VIZ", type: "publisher", wikiPath: "/wiki?q=Viz%20Media" },

  // --- INVESTOPEDIA & PANEL PROFITS MARKET CONCEPTS ---
  { term: "True Firsts", ticker: "REF:TRUE1ST", type: "market-concept", wikiPath: "/wiki?q=True%20First" },
  { term: "First Appearance", ticker: "REF:1ST-APP", type: "market-concept", wikiPath: "/wiki?q=First%20Appearance" },
  { term: "Key Issue", ticker: "REF:KEY", type: "market-concept", wikiPath: "/wiki?q=Key%20Issue" },
  { term: "Variant Cover", ticker: "REF:VARIANT", type: "market-concept", wikiPath: "/wiki?q=Variant" },
  { term: "Ratio Variant", ticker: "REF:RATIO", type: "market-concept", wikiPath: "/wiki?q=Ratio" },
  { term: "CGC", ticker: "REF:CGC", type: "grading", wikiPath: "/wiki?q=CGC" },
  { term: "CBCS", ticker: "REF:CBCS", type: "grading", wikiPath: "/wiki?q=CBCS" },
  { term: "PSA", ticker: "REF:PSA", type: "grading", wikiPath: "/wiki?q=PSA" },
  { term: "Grand Comics Database", ticker: "REF:GCD", type: "market-concept", wikiPath: "/wiki?q=Grand%20Comics%20Database" },
  { term: "ComicBase", ticker: "REF:COMICBASE", type: "market-concept", wikiPath: "/wiki?q=ComicBase" },
  { term: "Overstreet", ticker: "REF:OVERSTREET", type: "market-concept", wikiPath: "/wiki?q=Overstreet" },
];

export function findNewsEntities(headline: string, summary: string | null): EntityWikiDef[] {
  const text = `${headline} ${summary || ""}`;
  return KNOWN_NEWS_ENTITIES_MAP.filter((def) =>
    new RegExp(`\\b${def.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text)
  );
}
