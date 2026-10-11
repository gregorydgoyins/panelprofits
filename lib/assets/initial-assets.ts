import type { AssetItem } from "./types";

/**
 * The assets rail carries no static items. Every instrument is issued at request time by
 * lib/assets/instruments.ts, priced by the canon formulas from real underlying equities.
 * (Comics are the equities rail. The previous comic-seat list is in _quarantine/fake-data-rewrite.)
 */
export const INITIAL_SURFACE_ASSETS: AssetItem[] = [];
