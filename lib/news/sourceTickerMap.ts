// Authentic Corporate / Studio Public Equities (Stocks)
export const CORPORATE_PUBLIC_TICKERS: Record<string, string> = {
  DISNEY: "DIS",
  THEWALTDISNEYCOMPANY: "DIS",
  WALTDISNEY: "DIS",
  SONY: "SONY",
  SONYPICTURES: "SONY",
  SONYPICTURESENTERTAINMENT: "SONY",
  WARNERBROS: "WBD",
  WARNERBROSDISCOVERY: "WBD",
  WBD: "WBD",
  PARAMOUNT: "PARA",
  PARAMOUNTGLOBAL: "PARA",
  PARAMOUNTPICTURES: "PARA",
  COMCAST: "CMCSA",
  UNIVERSALPICTURES: "CMCSA",
  UNIVERSAL: "CMCSA",
  LIONSGATE: "LGF",
  LIONSGATEENTERTAINMENT: "LGF",
};

/**
 * Returns a corporate public ticker ONLY if the entity represents an actual public corporate holding
 * (e.g. Disney -> $DIS, Sony -> $SONY, Warner Bros -> $WBD, Paramount -> $PARA, Comcast -> $CMCSA).
 * Returns null for journalism outlets, RSS feeds, review blogs, and syndication wires
 * so we do NOT assign fake pseudo-tickers to non-public news publishers.
 */
export function getCorporateStockTicker(raw: string): string | null {
  const key = normalize(raw);
  return CORPORATE_PUBLIC_TICKERS[key] ?? null;
}

function normalize(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

/**
 * Legacy compatibility helper. If not a corporate stock, returns a clean short source badge name (no pseudo ticker).
 */
export function getSourceTicker(raw: string): string | null {
  return getCorporateStockTicker(raw);
}
