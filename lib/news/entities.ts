import { createAdminServerClient } from "@/lib/supabase/admin";
import { findLoreEntitiesInText, GENERIC_REAL_WORLD_LOCATIONS, LORE_OBSCURE_COLLISION_BLOCKLIST } from "@/lib/wiki/lore-search";
import adaptationCastData from "./adaptation-cast-registry.json";

export interface EntityWikiDef {
  term: string;
  ticker?: string;
  type: "character" | "publisher" | "equity" | "creator" | "market-concept" | "grading" | "lexicon";
  target: "intelligence" | "lexicon";
  wikiPath: string;
  roleDetails?: {
    character: string;
    universe: string;
    landmarkIssue: string;
    comicTicker: string;
  };
}

interface AdaptationRole {
  character: string;
  universe: string;
  landmarkIssue: string;
  comicTicker: string;
}

interface AdaptationActor {
  name: string;
  aliases: string[];
  roles: AdaptationRole[];
  franchises: string[];
  imdbId?: string;
}

const ADAPTATION_ACTORS: AdaptationActor[] = adaptationCastData as AdaptationActor[];

/**
 * Decomposes role character names like "Claire Temple (Night Nurse)" or "The Punisher (Frank Castle)"
 * into cleanly matchable individual names like ["Claire Temple", "Night Nurse"] or ["The Punisher", "Punisher", "Frank Castle"].
 */
export function decomposeCharacterTerms(rawCharacter: string): string[] {
  if (!rawCharacter) return [];
  const clean = rawCharacter.replace(/\s*\/.*$/, "").replace(/\[.*?\]/g, "").trim();
  const terms: string[] = [];

  const parenMatch = clean.match(/^([^(]+)\(([^)]+)\)$/);
  if (parenMatch) {
    const main = parenMatch[1].trim();
    const alias = parenMatch[2].trim();
    if (main) terms.push(main);
    if (alias && alias.toLowerCase() !== main.toLowerCase()) terms.push(alias);
  } else {
    terms.push(clean);
  }

  const expanded: string[] = [];
  for (const t of terms) {
    expanded.push(t);
    if (t.startsWith("The ") && t.length > 5) {
      expanded.push(t.slice(4));
    }
  }

  return [...new Set(expanded)].filter((t) => t.length >= 2);
}

/**
 * Dynamically resolves the most contextually relevant comic role and ticker for an actor
 * who has portrayed multiple roles across different universes (e.g. Rosario Dawson in Marvel vs Star Wars vs Sin City).
 */
export function resolveActorRoleForContext(
  actor: AdaptationActor,
  contextText: string
): AdaptationRole {
  if (!actor.roles || actor.roles.length === 0) {
    return {
      character: "Character",
      universe: "MARVEL",
      landmarkIssue: "",
      comicTicker: "$EQUITY",
    };
  }
  if (actor.roles.length === 1) {
    return actor.roles[0];
  }

  const lowerText = contextText.toLowerCase();

  let bestRole = actor.roles[0];
  let highestScore = -1;

  for (const role of actor.roles) {
    let score = 0;
    const terms = decomposeCharacterTerms(role.character);

    // 1. Direct character / alter ego mentions in context (+15 points per match)
    for (const term of terms) {
      const termLower = term.toLowerCase();
      const escaped = termLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (new RegExp(`\\b${escaped}\\b`, "i").test(lowerText)) {
        score += 15;
      }
    }

    // 2. Landmark issue mention (+10 points)
    if (role.landmarkIssue) {
      const issueLower = role.landmarkIssue.toLowerCase();
      const seriesPart = issueLower.replace(/#\d+.*$/, "").trim();
      if (seriesPart.length >= 4 && lowerText.includes(seriesPart)) {
        score += 10;
      }
    }

    // 3. Universe and related franchise cues (+5 points)
    const uni = role.universe.toUpperCase();
    if (uni === "MARVEL") {
      if (/\b(marvel|mcu|avengers|spider-man|spiderman|spider-m|daredevil|defenders|thor|hulk|iron man|captain america|disney)\b/i.test(lowerText)) {
        score += 5;
      }
    } else if (uni === "DC") {
      if (/\b(dc|dcu|dceu|batman|superman|gotham|warner|wbd)\b/i.test(lowerText)) {
        score += 5;
      }
    } else if (uni === "STAR_WARS") {
      if (/\b(star wars|jedi|sith|lucasfilm|mandalorian|ahsoka|clone wars)\b/i.test(lowerText)) {
        score += 5;
      }
    } else if (uni === "DARK_HORSE") {
      if (/\b(dark horse|sin city|hellboy)\b/i.test(lowerText)) {
        score += 5;
      }
    } else if (uni === "IMAGE") {
      if (/\b(image comics|the boys|spawn|invincible)\b/i.test(lowerText)) {
        score += 5;
      }
    }

    // 4. Franchise list cues (+3 points)
    for (const fr of actor.franchises || []) {
      const frLower = fr.toLowerCase();
      if (lowerText.includes(frLower)) {
        if (
          (uni === "MARVEL" && frLower.includes("marvel")) ||
          (uni === "DC" && frLower.includes("dc")) ||
          (uni === "STAR_WARS" && frLower.includes("star wars"))
        ) {
          score += 3;
        }
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestRole = role;
    }
  }

  return bestRole;
}

export const ADAPTATION_ACTOR_ENTITIES: EntityWikiDef[] = ADAPTATION_ACTORS.flatMap((actor) => {
  const primaryRole = actor.roles[0];
  const main: EntityWikiDef = {
    term: actor.name,
    ticker: primaryRole?.comicTicker,
    type: "creator",
    target: "intelligence",
    wikiPath: `/wiki?q=${encodeURIComponent(actor.name)}`,
    roleDetails: primaryRole,
  };
  const aliasDefs: EntityWikiDef[] = actor.aliases.map((alias) => ({
    term: alias,
    ticker: primaryRole?.comicTicker,
    type: "creator",
    target: "intelligence",
    wikiPath: `/wiki?q=${encodeURIComponent(actor.name)}`,
    roleDetails: primaryRole,
  }));
  return [main, ...aliasDefs];
});

export const ADAPTATION_ROLE_CHARACTER_ENTITIES: EntityWikiDef[] = ADAPTATION_ACTORS.flatMap((actor) => {
  const defs: EntityWikiDef[] = [];
  for (const role of actor.roles) {
    const decomposed = decomposeCharacterTerms(role.character);
    for (const term of decomposed) {
      if (GENERIC_REAL_WORLD_LOCATIONS.has(term.toLowerCase())) continue;
      const slug = term.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      defs.push({
        term,
        ticker: role.comicTicker,
        type: "character",
        target: "intelligence",
        wikiPath: `/wiki/entry/${slug}`,
        roleDetails: role,
      });
    }
  }
  return defs;
});

/**
 * Dynamic Canonical Grounded Entity Registry
 * Grounded across:
 * - 113,499+ Creators (writers, inkers, pencillers, editors, cover artists)
 * - 17,698+ Publishers & Imprints
 * - 232,820+ Comic Titles & Series
 * - Superhero & Lore Characters
 * - PP Financial Instruments (Derivatives, Crypto, Bonds, Funds, Baskets, Indices)
 * - Grading & Secondary Market Concepts
 * - Analyst Personas
 */
export const KNOWN_NEWS_ENTITIES_MAP: EntityWikiDef[] = [
  // --- ANALYST PERSONAS ---
  { term: "Marcus Vance", type: "creator", target: "intelligence", wikiPath: "/news/authors/marcus-vance" },
  { term: "Elena Rostova", type: "creator", target: "intelligence", wikiPath: "/news/authors/elena-rostova" },
  { term: "Devon Knight", type: "creator", target: "intelligence", wikiPath: "/news/authors/devon-knight" },
  { term: "Sarah Chen", type: "creator", target: "intelligence", wikiPath: "/news/authors/sarah-chen" },
  { term: "Thaddeus Pryor", type: "creator", target: "intelligence", wikiPath: "/news/authors/thaddeus-pryor" },
  { term: "Jax Mercer", type: "creator", target: "intelligence", wikiPath: "/news/authors/jax-mercer" },
  { term: "Claire Holloway", type: "creator", target: "intelligence", wikiPath: "/news/authors/claire-holloway" },
  { term: "Gideon Vane", type: "creator", target: "intelligence", wikiPath: "/news/authors/gideon-vane" },
  { term: "Zara Al-Mansoor", type: "creator", target: "intelligence", wikiPath: "/news/authors/zara-al-mansoor" },
  { term: "Owen St. Clair", type: "creator", target: "intelligence", wikiPath: "/news/authors/owen-st-clair" },
  { term: "Remington Cole", type: "creator", target: "intelligence", wikiPath: "/news/authors/remington-cole" },
  { term: "Nadia Sterling", type: "creator", target: "intelligence", wikiPath: "/news/authors/nadia-sterling" },

  // --- PANEL PROFITS FINANCIAL INSTRUMENTS & DERIVATIVES ---
  { term: "Synthetic Forward Contracts", ticker: "$SFC", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/synthetic-forward-contracts" },
  { term: "Comic Futures", ticker: "$CMF", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/comic-futures" },
  { term: "Call Options", ticker: "$CALL", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/call-options" },
  { term: "Put Options", ticker: "$PUT", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/put-options" },
  { term: "Derivative Contracts", ticker: "$DERIV", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/derivative-contracts" },
  { term: "Spread Contracts", ticker: "$SPRD", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/spread-contracts" },
  { term: "Straddle Options", ticker: "$STRD", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/straddle-options" },
  { term: "Comic Swaps", ticker: "$CSWP", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/comic-swaps" },

  // --- PANEL PROFITS CRYPTO & DIGITAL ASSETS ---
  { term: "Comic Tokenization", ticker: "$TOKN", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/comic-tokenization" },
  { term: "Digital Ledger Provenance", ticker: "$DLP", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/digital-ledger-provenance" },
  { term: "Blockchain Minting", ticker: "$MINT", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/blockchain-minting" },
  { term: "NFT Comic Assets", ticker: "$NFTC", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/nft-comic-assets" },
  { term: "On-Chain Grading Verification", ticker: "$OGV", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/on-chain-grading-verification" },
  { term: "Digital Slab Custody", ticker: "$DSC", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/digital-slab-custody" },

  // --- PANEL PROFITS BONDS & FIXED INCOME ---
  { term: "Anchor Bonds", ticker: "$BOND", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/anchor-bonds" },
  { term: "Securitized Comic Yield", ticker: "$YIELD", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/securitized-comic-yield" },
  { term: "Fixed-Income Comic Notes", ticker: "$FICN", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/fixed-income-comic-notes" },
  { term: "Sovereign Bond Vault", ticker: "$SBV", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/sovereign-bond-vault" },

  // --- PANEL PROFITS FUNDS, BASKETS & INDICES ---
  { term: "CE70 Sovereign Comic Equity Index", ticker: "$CE70", type: "equity", target: "lexicon", wikiPath: "/indices?q=CE70" },
  { term: "PPIX-60 Capitalization Benchmark", ticker: "$PPIX60", type: "equity", target: "lexicon", wikiPath: "/indices?q=PPIX60" },
  { term: "Panel Profits Pulse Index 100", ticker: "$PPIX100", type: "equity", target: "lexicon", wikiPath: "/indices?q=PPIX100" },
  { term: "PPIX Composite", ticker: "$PPIX", type: "equity", target: "lexicon", wikiPath: "/indices?q=PPIX_COMPOSITE" },
  { term: "Sovereign Comic Basket", ticker: "$BASKET", type: "equity", target: "lexicon", wikiPath: "/indices?q=BASKET" },
  { term: "Golden Age Basket", ticker: "$GOLD", type: "equity", target: "lexicon", wikiPath: "/indices?q=GOLD" },
  { term: "Silver Age ETF", ticker: "$SLVR", type: "equity", target: "lexicon", wikiPath: "/indices?q=SLVR" },
  { term: "Modern High-Grade Fund", ticker: "$MODF", type: "equity", target: "lexicon", wikiPath: "/indices?q=MODF" },
  { term: "Bronze Age Liquidity Pool", ticker: "$BRNZ", type: "equity", target: "lexicon", wikiPath: "/indices?q=BRNZ" },

  // --- CBR & PANEL PROFITS MARKET THESAURUS & COMIC EQUITY MECHANICS ---
  { term: "Equity Valuation", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/equity-valuation" },
  { term: "Secondary Market Velocity", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/secondary-market-velocity" },
  { term: "Secondary Market", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/secondary-market" },
  { term: "Key Appearances", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/first-appearance" },
  { term: "Key Appearance", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/first-appearance" },
  { term: "Key Issue", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/first-appearance" },
  { term: "Early Printings", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/first-printing" },
  { term: "Early Printing", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/first-printing" },
  { term: "First Printing", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/first-printing" },
  { term: "High-Grade", type: "grading", target: "lexicon", wikiPath: "/lexicon/high-grade" },
  { term: "High Grade", type: "grading", target: "lexicon", wikiPath: "/lexicon/high-grade" },
  { term: "Certified Census Slabs", type: "grading", target: "lexicon", wikiPath: "/lexicon/census-slabs" },
  { term: "Census Slabs", type: "grading", target: "lexicon", wikiPath: "/lexicon/census-slabs" },
  { term: "Certified Slabs", type: "grading", target: "lexicon", wikiPath: "/lexicon/census-slabs" },
  { term: "Uncertified Raw Inventory", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/raw-copies" },
  { term: "Raw Inventory", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/raw-copies" },
  { term: "Raw Copies", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/raw-copies" },
  { term: "Bid-Ask Spreads", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/bid-ask-spread" },
  { term: "Bid-Ask Spread", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/bid-ask-spread" },
  { term: "Auction Channels", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/auction-velocity" },
  { term: "Auction Velocity", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/auction-velocity" },
  { term: "Liquidity Floor", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/liquidity-floor" },
  { term: "Asset Catalyst", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/asset-catalysts" },
  { term: "CGC", ticker: "$CGC", type: "grading", target: "lexicon", wikiPath: "/lexicon/cgc" },
  { term: "CBCS", ticker: "$CBCS", type: "grading", target: "lexicon", wikiPath: "/lexicon/cbcs" },
  { term: "PGX", ticker: "$PGX", type: "grading", target: "lexicon", wikiPath: "/lexicon/pgx" },
  { term: "9.8 Census", type: "grading", target: "lexicon", wikiPath: "/lexicon/9-8-census" },
  { term: "Census Float", type: "grading", target: "lexicon", wikiPath: "/lexicon/census-float" },
  { term: "Fair Market Value", ticker: "$FMV", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/fair-market-value" },
  { term: "FMV", ticker: "$FMV", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/fair-market-value" },
  { term: "Pedigree Provenance", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/pedigree-provenance" },
  { term: "Key Issue Premium", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/key-issue-premium" },
  { term: "First Appearance", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/first-appearance" },
  { term: "Ratio Variant", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/ratio-variant" },
  { term: "Final Order Cutoff", ticker: "$FOC", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/final-order-cutoff" },
  { term: "Signature Series", type: "grading", target: "lexicon", wikiPath: "/lexicon/signature-series" },
  { term: "Overprint", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/overprint" },
  { term: "Box Office Haul", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/box-office" },
  { term: "Box Office", type: "market-concept", target: "lexicon", wikiPath: "/lexicon/box-office" },

  // --- PUBLISHERS & STUDIOS (Grounded in ppcf_gcd_publishers & Hollywood Studios) ---
  { term: "Sony Pictures Entertainment", ticker: "$SONY", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=Sony+Pictures" },
  { term: "Sony Pictures", ticker: "$SONY", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=Sony+Pictures" },
  { term: "Sony", ticker: "$SONY", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=Sony" },
  { term: "Warner Bros. Discovery", ticker: "$WBD", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=Warner+Bros" },
  { term: "Warner Bros. Pictures", ticker: "$WBD", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=Warner+Bros" },
  { term: "Warner Bros.", ticker: "$WBD", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=Warner+Bros" },
  { term: "Warner Bros", ticker: "$WBD", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=Warner+Bros" },
  { term: "Universal Pictures", ticker: "$CMCSA", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=Universal+Pictures" },
  { term: "Universal", ticker: "$CMCSA", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=Universal" },
  { term: "Paramount Pictures", ticker: "$PARA", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=Paramount" },
  { term: "Paramount", ticker: "$PARA", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=Paramount" },
  { term: "Walt Disney Studios", ticker: "$DIS", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=Disney" },
  { term: "Walt Disney", ticker: "$DIS", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=Disney" },
  { term: "Disney", ticker: "$DIS", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=Disney" },
  { term: "Lucasfilm", ticker: "$DIS", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=Lucasfilm" },
  { term: "20th Century Studios", ticker: "$DIS", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=20th+Century+Studios" },
  { term: "Lionsgate", ticker: "$LGF", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=Lionsgate" },

  // --- MEGA-FRANCHISES & CINEMATIC UNIVERSES ---
  { term: "Marvel Cinematic Universe", ticker: "$MCU", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=Marvel" },
  { term: "DC Extended Universe", ticker: "$DCEU", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=DC" },
  { term: "Sony's Spider-Man Universe", ticker: "$SPDR", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=Sony+Spider-Man+Universe" },
  { term: "Sony Spider-Man Universe", ticker: "$SPDR", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=Sony+Spider-Man+Universe" },

  // --- COMIC PUBLISHERS ---
  { term: "Marvel", ticker: "$MRVL", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=Marvel" },
  { term: "DC Comics", ticker: "$DC", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=DC" },
  { term: "DC Studios", ticker: "$DC", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=DC" },
  { term: "DC Universe", ticker: "$DC", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=DC" },
  { term: "Image Comics", ticker: "$IMGC", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=Image+Comics" },
  { term: "Dark Horse", ticker: "$DH", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=Dark+Horse" },
  { term: "IDW Publishing", ticker: "$IDW", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=IDW" },
  { term: "IDW", ticker: "$IDW", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=IDW" },
  { term: "Boom! Studios", ticker: "$BOOM", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=Boom+Studios" },
  { term: "Dynamite Entertainment", ticker: "$DYN", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=Dynamite" },
  { term: "Kodansha", ticker: "$KOD", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=Kodansha" },
  { term: "Shueisha", ticker: "$SHUE", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=Shueisha" },
  { term: "Viz Media", ticker: "$VIZ", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=Viz+Media" },
  { term: "Ablaze", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=Ablaze" },
  { term: "Ahoy Comics", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=Ahoy+Comics" },
  { term: "Titan Comics", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=Titan+Comics" },

  // --- COMPOUND STORYLINES, RUNS & MAJOR ADAPTATION TITLES ---
  { term: "Spider-Man: Brand New Day", ticker: "$SPDR", type: "character", target: "intelligence", wikiPath: "/comics?q=Spider-Man+Brand+New+Day" },
  { term: "Spider-Man Brand New Day", ticker: "$SPDR", type: "character", target: "intelligence", wikiPath: "/comics?q=Spider-Man+Brand+New+Day" },
  { term: "Spider-man: Brand New Day", ticker: "$SPDR", type: "character", target: "intelligence", wikiPath: "/comics?q=Spider-Man+Brand+New+Day" },
  { term: "Spider-man Brand New Day", ticker: "$SPDR", type: "character", target: "intelligence", wikiPath: "/comics?q=Spider-Man+Brand+New+Day" },
  { term: "Spider-Man: BrandNew Day", ticker: "$SPDR", type: "character", target: "intelligence", wikiPath: "/comics?q=Spider-Man+Brand+New+Day" },
  { term: "Spider-Man BrandNew Day", ticker: "$SPDR", type: "character", target: "intelligence", wikiPath: "/comics?q=Spider-Man+Brand+New+Day" },
  { term: "Spider-man: BrandNew Day", ticker: "$SPDR", type: "character", target: "intelligence", wikiPath: "/comics?q=Spider-Man+Brand+New+Day" },
  { term: "Spider-man BrandNew Day", ticker: "$SPDR", type: "character", target: "intelligence", wikiPath: "/comics?q=Spider-Man+Brand+New+Day" },
  { term: "Spider-Man: No Way Home", ticker: "$SPDR", type: "character", target: "intelligence", wikiPath: "/wiki/entry/spider-man" },
  { term: "Spider-Man: Across the Spider-Verse", ticker: "$SPDR", type: "character", target: "intelligence", wikiPath: "/wiki/entry/spider-man" },
  { term: "Spider-Man: Into the Spider-Verse", ticker: "$SPDR", type: "character", target: "intelligence", wikiPath: "/wiki/entry/spider-man" },
  { term: "Avengers: Endgame: Encore", ticker: "$AVNG", type: "character", target: "intelligence", wikiPath: "/comics?q=Avengers+Endgame" },
  { term: "Avengers Endgame: Encore", ticker: "$AVNG", type: "character", target: "intelligence", wikiPath: "/comics?q=Avengers+Endgame" },
  { term: "Avengers: Endgame Encore", ticker: "$AVNG", type: "character", target: "intelligence", wikiPath: "/comics?q=Avengers+Endgame" },
  { term: "Avengers Endgame Encore", ticker: "$AVNG", type: "character", target: "intelligence", wikiPath: "/comics?q=Avengers+Endgame" },
  { term: "Avengers: Endgame", ticker: "$AVNG", type: "character", target: "intelligence", wikiPath: "/comics?q=Avengers+Endgame" },
  { term: "Avengers Endgame", ticker: "$AVNG", type: "character", target: "intelligence", wikiPath: "/comics?q=Avengers+Endgame" },
  { term: "Avengers: Infinity War", ticker: "$AVNG", type: "character", target: "intelligence", wikiPath: "/comics?q=Avengers+Infinity+War" },
  { term: "Avengers Infinity War", ticker: "$AVNG", type: "character", target: "intelligence", wikiPath: "/comics?q=Avengers+Infinity+War" },
  { term: "Avengers: Secret Wars", ticker: "$AVNG", type: "character", target: "intelligence", wikiPath: "/comics?q=Avengers+Secret+Wars" },
  { term: "Avengers Secret Wars", ticker: "$AVNG", type: "character", target: "intelligence", wikiPath: "/comics?q=Avengers+Secret+Wars" },
  { term: "Avengers: Doomsday", ticker: "$AVNG", type: "character", target: "intelligence", wikiPath: "/comics?q=Avengers+Doomsday" },
  { term: "Avengers Doomsday", ticker: "$AVNG", type: "character", target: "intelligence", wikiPath: "/comics?q=Avengers+Doomsday" },
  { term: "Captain America: Brave New World", ticker: "$CAP", type: "character", target: "intelligence", wikiPath: "/comics?q=Captain+America+Brave+New+World" },
  { term: "Captain America Brave New World", ticker: "$CAP", type: "character", target: "intelligence", wikiPath: "/comics?q=Captain+America+Brave+New+World" },
  { term: "Captain America: Civil War", ticker: "$CAP", type: "character", target: "intelligence", wikiPath: "/comics?q=Captain+America+Civil+War" },
  { term: "Captain America: The Winter Soldier", ticker: "$CAP", type: "character", target: "intelligence", wikiPath: "/comics?q=Captain+America+The+Winter+Soldier" },
  { term: "Daredevil: Born Again", ticker: "$DD", type: "character", target: "intelligence", wikiPath: "/comics?q=Daredevil+Born+Again" },
  { term: "Batman: The Brave and the Bold", ticker: "$BAT", type: "character", target: "intelligence", wikiPath: "/comics?q=Batman+The+Brave+and+the+Bold" },
  { term: "Batman: Year One", ticker: "$BAT", type: "character", target: "intelligence", wikiPath: "/comics?q=Batman+Year+One" },
  { term: "Batman: The Dark Knight Returns", ticker: "$BAT", type: "character", target: "intelligence", wikiPath: "/comics?q=Batman+The+Dark+Knight+Returns" },
  { term: "Batman: The Killing Joke", ticker: "$BAT", type: "character", target: "intelligence", wikiPath: "/comics?q=Batman+The+Killing+Joke" },
  { term: "Batman: The Long Halloween", ticker: "$BAT", type: "character", target: "intelligence", wikiPath: "/comics?q=Batman+The+Long+Halloween" },
  { term: "Superman: Legacy", ticker: "$SUPR", type: "character", target: "intelligence", wikiPath: "/comics?q=Superman+Legacy" },
  { term: "The Dark Knight", ticker: "$BAT", type: "character", target: "intelligence", wikiPath: "/comics?q=The+Dark+Knight" },
  { term: "Crisis on Infinite Earths", ticker: "$DC", type: "character", target: "intelligence", wikiPath: "/comics?q=Crisis+on+Infinite+Earths" },
  { term: "Secret Wars", ticker: "$MRVL", type: "character", target: "intelligence", wikiPath: "/comics?q=Secret+Wars" },
  { term: "Infinity Gauntlet", ticker: "$MRVL", type: "character", target: "intelligence", wikiPath: "/comics?q=Infinity+Gauntlet" },
  { term: "Civil War", ticker: "$MRVL", type: "character", target: "intelligence", wikiPath: "/comics?q=Civil+War" },

  // --- CHARACTERS & LORE (Direct Dossier Routes) ---
  { term: "Spider-M", ticker: "$SPDR", type: "character", target: "intelligence", wikiPath: "/wiki/entry/spider-man" },
  { term: "Claire Temple", ticker: "$NURSE", type: "character", target: "intelligence", wikiPath: "/wiki/entry/claire-temple" },
  { term: "Night Nurse", ticker: "$NURSE", type: "character", target: "intelligence", wikiPath: "/wiki/entry/night-nurse" },
  { term: "Spider-Man", ticker: "$SPDR", type: "character", target: "intelligence", wikiPath: "/wiki/entry/spider-man" },
  { term: "Wolverine", ticker: "$WOLV", type: "character", target: "intelligence", wikiPath: "/wiki/entry/wolverine" },
  { term: "Iron Man", ticker: "$IRON", type: "character", target: "intelligence", wikiPath: "/wiki/entry/iron-man" },
  { term: "Captain America", ticker: "$CAP", type: "character", target: "intelligence", wikiPath: "/wiki/entry/captain-america" },
  { term: "Thor", ticker: "$THOR", type: "character", target: "intelligence", wikiPath: "/wiki/entry/thor" },
  { term: "Hulk", ticker: "$HULK", type: "character", target: "intelligence", wikiPath: "/wiki/entry/hulk" },
  { term: "Deadpool", ticker: "$DP", type: "character", target: "intelligence", wikiPath: "/wiki/entry/deadpool" },
  { term: "Venom", ticker: "$VNM", type: "character", target: "intelligence", wikiPath: "/wiki/entry/venom" },
  { term: "Daredevil", ticker: "$DD", type: "character", target: "intelligence", wikiPath: "/wiki/entry/daredevil" },
  { term: "Punisher", ticker: "$PNSH", type: "character", target: "intelligence", wikiPath: "/wiki/entry/punisher" },
  { term: "Doctor Doom", ticker: "$DOOM", type: "character", target: "intelligence", wikiPath: "/wiki/entry/doctor-doom" },
  { term: "Silver Surfer", ticker: "$SLVR", type: "character", target: "intelligence", wikiPath: "/wiki/entry/silver-surfer" },
  { term: "Galactus", ticker: "$GLCT", type: "character", target: "intelligence", wikiPath: "/wiki/entry/galactus" },
  { term: "Thanos", ticker: "$THNS", type: "character", target: "intelligence", wikiPath: "/wiki/entry/thanos" },
  { term: "Moon Knight", ticker: "$MNKT", type: "character", target: "intelligence", wikiPath: "/wiki/entry/moon-knight" },
  { term: "Ghost Rider", ticker: "$GSTR", type: "character", target: "intelligence", wikiPath: "/wiki/entry/ghost-rider" },
  { term: "Blade", ticker: "$BLD", type: "character", target: "intelligence", wikiPath: "/wiki/entry/blade" },
  { term: "Jubilee", ticker: "$JUBL", type: "character", target: "intelligence", wikiPath: "/wiki/entry/jubilee" },
  { term: "Apocalypse", ticker: "$APOC", type: "character", target: "intelligence", wikiPath: "/wiki/entry/apocalypse" },
  { term: "Winter Soldier", ticker: "$WINT", type: "character", target: "intelligence", wikiPath: "/wiki/entry/winter-soldier" },
  { term: "Bucky", type: "character", target: "intelligence", wikiPath: "/wiki/entry/winter-soldier" },
  { term: "Taskmaster", ticker: "$TASK", type: "character", target: "intelligence", wikiPath: "/wiki/entry/taskmaster" },
  { term: "Kang the Conqueror", ticker: "$KANG", type: "character", target: "intelligence", wikiPath: "/wiki/entry/kang-the-conqueror" },
  { term: "Mister Sinister", ticker: "$SNST", type: "character", target: "intelligence", wikiPath: "/wiki/entry/mister-sinister" },
  { term: "Doctor Octopus", ticker: "$DOC", type: "character", target: "intelligence", wikiPath: "/wiki/entry/doctor-octopus" },
  { term: "Green Goblin", ticker: "$GBLN", type: "character", target: "intelligence", wikiPath: "/wiki/entry/green-goblin" },
  { term: "Carnage", ticker: "$CRNG", type: "character", target: "intelligence", wikiPath: "/wiki/entry/carnage" },
  { term: "Kraven the Hunter", ticker: "$KRVN", type: "character", target: "intelligence", wikiPath: "/wiki/entry/kraven-the-hunter" },
  { term: "Cable", ticker: "$CABL", type: "character", target: "intelligence", wikiPath: "/wiki/entry/cable" },
  { term: "Domino", ticker: "$DOMN", type: "character", target: "intelligence", wikiPath: "/wiki/entry/domino" },
  { term: "Bishop", ticker: "$BSHP", type: "character", target: "intelligence", wikiPath: "/wiki/entry/bishop" },
  { term: "Archangel", ticker: "$ARCH", type: "character", target: "intelligence", wikiPath: "/wiki/entry/archangel" },
  { term: "She-Hulk", ticker: "$SHLK", type: "character", target: "intelligence", wikiPath: "/wiki/entry/she-hulk" },
  { term: "Black Panther", ticker: "$PNTR", type: "character", target: "intelligence", wikiPath: "/wiki/entry/black-panther" },
  { term: "Sentry", ticker: "$SNTR", type: "character", target: "intelligence", wikiPath: "/wiki/entry/sentry" },
  { term: "Magneto", ticker: "$MGNT", type: "character", target: "intelligence", wikiPath: "/wiki/entry/magneto" },
  { term: "Professor X", ticker: "$PROFX", type: "character", target: "intelligence", wikiPath: "/wiki/entry/professor-x" },
  { term: "Cyclops", ticker: "$CYCL", type: "character", target: "intelligence", wikiPath: "/wiki/entry/cyclops" },
  { term: "Storm", ticker: "$STRM", type: "character", target: "intelligence", wikiPath: "/wiki/entry/storm" },
  { term: "Colossus", ticker: "$COLS", type: "character", target: "intelligence", wikiPath: "/wiki/entry/colossus" },
  { term: "Nightcrawler", ticker: "$NCWL", type: "character", target: "intelligence", wikiPath: "/wiki/entry/nightcrawler" },
  { term: "Rogue", ticker: "$ROG", type: "character", target: "intelligence", wikiPath: "/wiki/entry/rogue" },
  { term: "Gambit", ticker: "$GMBT", type: "character", target: "intelligence", wikiPath: "/wiki/entry/gambit" },
  { term: "Scarlet Witch", ticker: "$SCWT", type: "character", target: "intelligence", wikiPath: "/wiki/entry/scarlet-witch" },
  { term: "Quicksilver", ticker: "$QSVR", type: "character", target: "intelligence", wikiPath: "/wiki/entry/quicksilver" },
  { term: "Hawkeye", ticker: "$HAWK", type: "character", target: "intelligence", wikiPath: "/wiki/entry/hawkeye" },
  { term: "Black Widow", ticker: "$WIDW", type: "character", target: "intelligence", wikiPath: "/wiki/entry/black-widow" },
  { term: "Falcon", ticker: "$FLCN", type: "character", target: "intelligence", wikiPath: "/wiki/entry/falcon" },
  { term: "Luke Cage", ticker: "$CAGE", type: "character", target: "intelligence", wikiPath: "/wiki/entry/luke-cage" },
  { term: "Iron Fist", ticker: "$FIST", type: "character", target: "intelligence", wikiPath: "/wiki/entry/iron-fist" },
  { term: "Shang-Chi", ticker: "$SHNG", type: "character", target: "intelligence", wikiPath: "/wiki/entry/shang-chi" },
  { term: "X-Men", ticker: "$XMEN", type: "character", target: "intelligence", wikiPath: "/wiki/entry/x-men" },
  { term: "Avengers", ticker: "$AVNG", type: "character", target: "intelligence", wikiPath: "/wiki/entry/avengers" },
  { term: "Fantastic Four", ticker: "$FF", type: "character", target: "intelligence", wikiPath: "/wiki/entry/fantastic-four" },
  { term: "Sinister Six", type: "character", target: "intelligence", wikiPath: "/wiki/entry/sinister-six" },
  { term: "Brotherhood of Evil Mutants", type: "character", target: "intelligence", wikiPath: "/wiki/entry/brotherhood-of-evil-mutants" },
  { term: "Alpha Flight", type: "character", target: "intelligence", wikiPath: "/wiki/entry/alpha-flight" },
  { term: "New Mutants", type: "character", target: "intelligence", wikiPath: "/wiki/entry/new-mutants" },
  { term: "Thunderbolts", type: "character", target: "intelligence", wikiPath: "/wiki/entry/thunderbolts" },
  { term: "Guardians of the Galaxy", ticker: "$GOTG", type: "character", target: "intelligence", wikiPath: "/wiki/entry/guardians-of-the-galaxy" },
  { term: "Illuminati", type: "character", target: "intelligence", wikiPath: "/wiki/entry/illuminati" },
  { term: "Dora Milaje", type: "character", target: "intelligence", wikiPath: "/wiki/entry/dora-milaje" },
  { term: "Batman", ticker: "$BAT", type: "character", target: "intelligence", wikiPath: "/wiki/entry/batman" },
  { term: "Superman", ticker: "$SUPR", type: "character", target: "intelligence", wikiPath: "/wiki/entry/superman" },
  { term: "Joker", ticker: "$JKR", type: "character", target: "intelligence", wikiPath: "/wiki/entry/joker" },
  { term: "Wonder Woman", ticker: "$WW", type: "character", target: "intelligence", wikiPath: "/wiki/entry/wonder-woman" },
  { term: "The Flash", ticker: "$FLSH", type: "character", target: "intelligence", wikiPath: "/wiki/entry/flash" },
  { term: "Flash", ticker: "$FLSH", type: "character", target: "intelligence", wikiPath: "/wiki/entry/flash" },
  { term: "Green Lantern", ticker: "$GL", type: "character", target: "intelligence", wikiPath: "/wiki/entry/green-lantern" },
  { term: "Aquaman", ticker: "$AQUA", type: "character", target: "intelligence", wikiPath: "/wiki/entry/aquaman" },
  { term: "Robin", ticker: "$RBN", type: "character", target: "intelligence", wikiPath: "/wiki/entry/robin" },
  { term: "Nightwing", ticker: "$NGHT", type: "character", target: "intelligence", wikiPath: "/wiki/entry/nightwing" },
  { term: "Batgirl", ticker: "$BTG", type: "character", target: "intelligence", wikiPath: "/wiki/entry/batgirl" },
  { term: "Catwoman", ticker: "$CATW", type: "character", target: "intelligence", wikiPath: "/wiki/entry/catwoman" },
  { term: "Harley Quinn", ticker: "$HRLY", type: "character", target: "intelligence", wikiPath: "/wiki/entry/harley-quinn" },
  { term: "Supergirl", ticker: "$SPRG", type: "character", target: "intelligence", wikiPath: "/wiki/entry/supergirl" },
  { term: "Green Arrow", ticker: "$GRAW", type: "character", target: "intelligence", wikiPath: "/wiki/entry/green-arrow" },
  { term: "Deathstroke", ticker: "$DTHS", type: "character", target: "intelligence", wikiPath: "/wiki/entry/deathstroke" },
  { term: "Cyborg", ticker: "$CYBG", type: "character", target: "intelligence", wikiPath: "/wiki/entry/cyborg" },
  { term: "Starfire", ticker: "$STRF", type: "character", target: "intelligence", wikiPath: "/wiki/entry/starfire" },
  { term: "Raven", ticker: "$RAVN", type: "character", target: "intelligence", wikiPath: "/wiki/entry/raven" },
  { term: "Justice League", ticker: "$JL", type: "character", target: "intelligence", wikiPath: "/wiki/entry/justice-league" },
  { term: "Justice Society", ticker: "$JSA", type: "character", target: "intelligence", wikiPath: "/wiki/entry/justice-society" },
  { term: "Teen Titans", ticker: "$TT", type: "character", target: "intelligence", wikiPath: "/wiki/entry/teen-titans" },
  { term: "Suicide Squad", ticker: "$SS", type: "character", target: "intelligence", wikiPath: "/wiki/entry/suicide-squad" },
  { term: "Watchmen", ticker: "$WTCH", type: "character", target: "intelligence", wikiPath: "/wiki/entry/watchmen" },
  { term: "Spawn", ticker: "$SPWN", type: "character", target: "intelligence", wikiPath: "/wiki/entry/spawn" },
  { term: "Hellboy", ticker: "$HELL", type: "character", target: "intelligence", wikiPath: "/wiki/entry/hellboy" },
  { term: "Invincible", ticker: "$INVN", type: "character", target: "intelligence", wikiPath: "/wiki/entry/invincible" },
  { term: "Savage Dragon", ticker: "$SDRG", type: "character", target: "intelligence", wikiPath: "/wiki/entry/savage-dragon" },
  { term: "Star Wars", ticker: "$SW", type: "character", target: "intelligence", wikiPath: "/wiki/entry/star-wars" },

  // --- HOLLYWOOD TALENT, DIRECTORS & KEY CREATORS ---
  { term: "Robert Pattinson", type: "creator", target: "intelligence", wikiPath: "/news?q=Robert+Pattinson" },
  { term: "James Gunn", type: "creator", target: "intelligence", wikiPath: "/news?q=James+Gunn" },
  { term: "Matt Reeves", type: "creator", target: "intelligence", wikiPath: "/news?q=Matt+Reeves" },
  { term: "Zack Snyder", type: "creator", target: "intelligence", wikiPath: "/news?q=Zack+Snyder" },
  { term: "Christopher Nolan", type: "creator", target: "intelligence", wikiPath: "/news?q=Christopher+Nolan" },
  { term: "Kevin Feige", type: "creator", target: "intelligence", wikiPath: "/news?q=Kevin+Feige" },
  { term: "Robert Downey Jr.", type: "creator", target: "intelligence", wikiPath: "/news?q=Robert+Downey+Jr" },
  { term: "David Corenswet", type: "creator", target: "intelligence", wikiPath: "/news?q=David+Corenswet" },
  { term: "Hugh Jackman", type: "creator", target: "intelligence", wikiPath: "/news?q=Hugh+Jackman" },
  { term: "Ryan Reynolds", type: "creator", target: "intelligence", wikiPath: "/news?q=Ryan+Reynolds" },
  { term: "Tom Holland", type: "creator", target: "intelligence", wikiPath: "/news?q=Tom+Holland" },
  { term: "Colin Farrell", type: "creator", target: "intelligence", wikiPath: "/news?q=Colin+Farrell" },
  { term: "Barry Keoghan", type: "creator", target: "intelligence", wikiPath: "/news?q=Barry+Keoghan" },
  { term: "Zoe Kravitz", type: "creator", target: "intelligence", wikiPath: "/news?q=Zoe+Kravitz" },
  { term: "Bruce Wayne", ticker: "$BAT", type: "character", target: "intelligence", wikiPath: "/wiki/entry/batman" },
  { term: "Clark Kent", ticker: "$SUPR", type: "character", target: "intelligence", wikiPath: "/wiki/entry/superman" },
  { term: "Peter Parker", ticker: "$SPDR", type: "character", target: "intelligence", wikiPath: "/wiki/entry/spider-man" },
  { term: "Miles Morales", ticker: "$SPDR", type: "character", target: "intelligence", wikiPath: "/wiki/entry/spider-man" },
  { term: "Tony Stark", ticker: "$IRON", type: "character", target: "intelligence", wikiPath: "/wiki/entry/iron-man" },
  { term: "DCU", ticker: "$DCU", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=DCU" },
  { term: "DCEU", ticker: "$DCEU", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=DCEU" },
  { term: "MCU", ticker: "$MCU", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=MCU" },
  { term: "DC Studios", ticker: "$DC", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=DC+Studios" },
  { term: "Marvel Studios", ticker: "$MRVL", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=Marvel+Studios" },

  // --- CREATORS (Grounded in ppcf_gcd_creators) ---
  { term: "Greg Pak", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Greg+Pak" },
  { term: "Mark Buckingham", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Mark+Buckingham" },
  { term: "Phil Noto", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Phil+Noto" },
  { term: "Stan Lee", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Stan+Lee" },
  { term: "Jack Kirby", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Jack+Kirby" },
  { term: "Steve Ditko", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Steve+Ditko" },
  { term: "Todd McFarlane", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Todd+McFarlane" },
  { term: "Jim Lee", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Jim+Lee" },
  { term: "Frank Miller", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Frank+Miller" },
  { term: "Alan Moore", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Alan+Moore" },
  { term: "Grant Morrison", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Grant+Morrison" },
  { term: "Brian Michael Bendis", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Brian+Michael+Bendis" },
  { term: "Jonathan Hickman", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Jonathan+Hickman" },
  { term: "Chip Zdarsky", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Chip+Zdarsky" },
  { term: "Donny Cates", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Donny+Cates" },
  { term: "Hiro Mashima", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Hiro+Mashima" },
  { term: "Geoff Johns", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Geoff+Johns" },
  { term: "Neil Gaiman", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Neil+Gaiman" },
  { term: "Chris Bachalo", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Chris+Bachalo" },
  { term: "Alex Ross", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Alex+Ross" },
  { term: "Peach Momoko", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Peach+Momoko" },
  { term: "Carmine Infantino", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Carmine+Infantino" },
  { term: "Robert Kanigher", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Robert+Kanigher" },
  { term: "Gardner Fox", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Gardner+Fox" },
  { term: "Bob Kane", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Bob+Kane" },
  { term: "Bill Finger", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Bill+Finger" },
  { term: "Jerry Siegel", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Jerry+Siegel" },
  { term: "Joe Shuster", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Joe+Shuster" },
  { term: "George Pérez", type: "creator", target: "intelligence", wikiPath: "/wiki?q=George+Perez" },
  { term: "Paul Dini", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Paul+Dini" },
  { term: "Bruce Timm", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Bruce+Timm" },
  { term: "Robert Kirkman", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Robert+Kirkman" },
  { term: "Mike Mignola", type: "creator", target: "intelligence", wikiPath: "/wiki?q=Mike+Mignola" },
  // --- ADAPTATION ACTORS & HOLLYWOOD ADAPTATION TALENT ---
  ...ADAPTATION_ACTOR_ENTITIES,
  // --- ADAPTATION CHARACTER ROLES (Decomposed & Canonical) ---
  ...ADAPTATION_ROLE_CHARACTER_ENTITIES,
];

// In-memory cache for dynamic text lookups
const entityCache = new Map<string, EntityWikiDef[]>();

/**
 * Dynamically resolves entities mentioned in text by combining:
 * 1. Pre-indexed canonical finance, creator, publisher, and lore entities with contextual role disambiguation.
 * 2. On-demand dynamic database lookup in `ppcf_gcd_creators`, `ppcf_gcd_publishers`, `ppcf_gcd_series`, `recovered_index_contracts`.
 */
export async function getDynamicEntitiesForText(text: string): Promise<EntityWikiDef[]> {
  if (!text || text.trim().length === 0) return [];
  const textHash = text.slice(0, 120);
  if (entityCache.has(textHash)) return entityCache.get(textHash)!;

  const actorMap = new Map<string, AdaptationActor>();
  for (const a of ADAPTATION_ACTORS) {
    actorMap.set(a.name.toLowerCase(), a);
    for (const al of a.aliases || []) {
      actorMap.set(al.toLowerCase(), a);
    }
  }

  const matchedEntities: EntityWikiDef[] = [];
  const seenTerms = new Set<string>();
  const lowerText = text.toLowerCase();

  // Match against canonical known registry
  for (const entity of KNOWN_NEWS_ENTITIES_MAP) {
    const termLower = entity.term.toLowerCase();
    if (GENERIC_REAL_WORLD_LOCATIONS.has(termLower)) continue;
    if (seenTerms.has(termLower)) continue;

    const regex = new RegExp(`\\b${termLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (regex.test(lowerText)) {
      seenTerms.add(termLower);
      const clone: EntityWikiDef = { ...entity };

      // Dynamic Context-Aware Role Resolution for Multi-Universe Actors
      if (actorMap.has(termLower)) {
        const actor = actorMap.get(termLower)!;
        const resolvedRole = resolveActorRoleForContext(actor, text);
        clone.roleDetails = resolvedRole;
        if (resolvedRole.comicTicker) {
          clone.ticker = resolvedRole.comicTicker;
        }
      }

      matchedEntities.push(clone);
    }
  }

  // Match multi-universe lore entities (characters, items, locations, teams)
  try {
    const loreMatches = findLoreEntitiesInText(text, 6);
    for (const lore of loreMatches) {
      const loreTitleLower = lore.title.toLowerCase();
      if (GENERIC_REAL_WORLD_LOCATIONS.has(loreTitleLower)) continue;
      if (LORE_OBSCURE_COLLISION_BLOCKLIST.has(loreTitleLower)) continue;

      if (!seenTerms.has(loreTitleLower)) {
        seenTerms.add(loreTitleLower);
        matchedEntities.push({
          term: lore.title,
          type: lore.type === "character" ? "character" : "lexicon",
          target: "intelligence",
          wikiPath: `/wiki/entry/${lore.slug}`,
        });
      }
    }
  } catch {
    // Graceful fallback if lore index unavailable
  }

  // Dynamic Supabase Database Query for unrecognized terms
  try {
    const db = createAdminServerClient();

    // Query recovered index contracts dynamically
    const { data: indexContracts } = await db
      .from("recovered_index_contracts")
      .select("index_code, display_name");

    if (indexContracts) {
      for (const contract of indexContracts) {
        if (
          contract.display_name &&
          lowerText.includes(contract.display_name.toLowerCase()) &&
          !seenTerms.has(contract.display_name.toLowerCase())
        ) {
          seenTerms.add(contract.display_name.toLowerCase());
          matchedEntities.push({
            term: contract.display_name,
            ticker: `$${contract.index_code}`,
            type: "equity",
            target: "lexicon",
            wikiPath: `/indices?q=${encodeURIComponent(contract.index_code)}`,
          });
        }
      }
    }
  } catch {
    // Database query fallback
  }

  // Cross-link character roles for matched adaptation actors
  for (const match of [...matchedEntities]) {
    if (match.roleDetails) {
      const decomposed = decomposeCharacterTerms(match.roleDetails.character);
      for (const charTerm of decomposed) {
        const charLower = charTerm.toLowerCase();
        if (GENERIC_REAL_WORLD_LOCATIONS.has(charLower)) continue;
        if (seenTerms.has(charLower)) continue;

        seenTerms.add(charLower);
        const slug = charTerm.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        matchedEntities.push({
          term: charTerm,
          ticker: match.roleDetails.comicTicker,
          type: "character",
          target: "intelligence",
          wikiPath: `/wiki/entry/${slug}`,
          roleDetails: match.roleDetails,
        });
      }
    }
  }

  const filtered = matchedEntities.filter(
    (e) => !GENERIC_REAL_WORLD_LOCATIONS.has(e.term.toLowerCase())
  );
  entityCache.set(textHash, filtered);
  return filtered;
}

/**
 * Synchronous matching against canonical registered entities for page components and unit tests.
 */
export function findNewsEntities(headline: string, summary: string | null): EntityWikiDef[] {
  const text = `${headline} ${summary || ""}`;
  return extractEntitiesFromContext(text);
}

/**
 * Extracts entities matching text words.
 */
export function extractEntitiesFromContext(text: string): EntityWikiDef[] {
  if (!text) return [];

  const actorMap = new Map<string, AdaptationActor>();
  for (const a of ADAPTATION_ACTORS) {
    actorMap.set(a.name.toLowerCase(), a);
    for (const al of a.aliases || []) {
      actorMap.set(al.toLowerCase(), a);
    }
  }

  const baseMatches: EntityWikiDef[] = [];
  const seenTerms = new Set<string>();

  for (const def of KNOWN_NEWS_ENTITIES_MAP) {
    const termLower = def.term.toLowerCase();
    if (GENERIC_REAL_WORLD_LOCATIONS.has(termLower)) continue;
    if (seenTerms.has(termLower)) continue;

    const escaped = def.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(text)) {
      seenTerms.add(termLower);
      const clone: EntityWikiDef = { ...def };

      // Dynamic Context-Aware Role Resolution for Multi-Universe Actors
      if (actorMap.has(termLower)) {
        const actor = actorMap.get(termLower)!;
        const resolvedRole = resolveActorRoleForContext(actor, text);
        clone.roleDetails = resolvedRole;
        if (resolvedRole.comicTicker) {
          clone.ticker = resolvedRole.comicTicker;
        }
      }

      baseMatches.push(clone);
    }
  }

  try {
    const loreMatches = findLoreEntitiesInText(text, 6);
    for (const lore of loreMatches) {
      const loreTitleLower = lore.title.toLowerCase();
      if (GENERIC_REAL_WORLD_LOCATIONS.has(loreTitleLower)) continue;
      if (LORE_OBSCURE_COLLISION_BLOCKLIST.has(loreTitleLower)) continue;

      if (!seenTerms.has(loreTitleLower)) {
        seenTerms.add(loreTitleLower);
        baseMatches.push({
          term: lore.title,
          type: lore.type === "character" ? "character" : "lexicon",
          target: "intelligence",
          wikiPath: `/wiki/entry/${lore.slug}`,
        });
      }
    }
  } catch {
    // Safe fallback
  }

  // Cross-link character roles for matched adaptation actors
  for (const match of [...baseMatches]) {
    if (match.roleDetails) {
      const decomposed = decomposeCharacterTerms(match.roleDetails.character);
      for (const charTerm of decomposed) {
        const charLower = charTerm.toLowerCase();
        if (GENERIC_REAL_WORLD_LOCATIONS.has(charLower)) continue;
        if (seenTerms.has(charLower)) continue;

        seenTerms.add(charLower);
        const slug = charTerm.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        baseMatches.push({
          term: charTerm,
          ticker: match.roleDetails.comicTicker,
          type: "character",
          target: "intelligence",
          wikiPath: `/wiki/entry/${slug}`,
          roleDetails: match.roleDetails,
        });
      }
    }
  }

  return baseMatches.filter((def) => !GENERIC_REAL_WORLD_LOCATIONS.has(def.term.toLowerCase()));
}
