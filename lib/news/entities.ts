import { createAdminServerClient } from "@/lib/supabase/admin";

export interface EntityWikiDef {
  term: string;
  ticker?: string;
  type: "character" | "publisher" | "equity" | "creator" | "market-concept" | "grading" | "lexicon";
  target: "intelligence" | "lexicon";
  wikiPath: string;
}

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
  { term: "Synthetic Forward Contracts", ticker: "$SFC", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=Synthetic+Forward+Contracts" },
  { term: "Comic Futures", ticker: "$CMF", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=Comic+Futures" },
  { term: "Call Options", ticker: "$CALL", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=Call+Options" },
  { term: "Put Options", ticker: "$PUT", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=Put+Options" },
  { term: "Derivative Contracts", ticker: "$DERIV", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=Derivative+Contracts" },
  { term: "Spread Contracts", ticker: "$SPRD", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=Spread+Contracts" },
  { term: "Straddle Options", ticker: "$STRD", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=Straddle+Options" },
  { term: "Comic Swaps", ticker: "$CSWP", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=Comic+Swaps" },

  // --- PANEL PROFITS CRYPTO & DIGITAL ASSETS ---
  { term: "Comic Tokenization", ticker: "$TOKN", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=Comic+Tokenization" },
  { term: "Digital Ledger Provenance", ticker: "$DLP", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=Digital+Ledger+Provenance" },
  { term: "Blockchain Minting", ticker: "$MINT", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=Blockchain+Minting" },
  { term: "NFT Comic Assets", ticker: "$NFTC", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=NFT+Comic+Assets" },
  { term: "On-Chain Grading Verification", ticker: "$OGV", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=On-Chain+Grading+Verification" },
  { term: "Digital Slab Custody", ticker: "$DSC", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=Digital+Slab+Custody" },

  // --- PANEL PROFITS BONDS & FIXED INCOME ---
  { term: "Anchor Bonds", ticker: "$BOND", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=Anchor+Bonds" },
  { term: "Securitized Comic Yield", ticker: "$YIELD", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=Securitized+Comic+Yield" },
  { term: "Fixed-Income Comic Notes", ticker: "$FICN", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=Fixed-Income+Comic+Notes" },
  { term: "Sovereign Bond Vault", ticker: "$SBV", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=Sovereign+Bond+Vault" },

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

  // --- GRADING & SECONDARY MARKET CONCEPTS ---
  { term: "CGC", ticker: "$CGC", type: "grading", target: "lexicon", wikiPath: "/lexicon?q=CGC" },
  { term: "CBCS", ticker: "$CBCS", type: "grading", target: "lexicon", wikiPath: "/lexicon?q=CBCS" },
  { term: "PGX", ticker: "$PGX", type: "grading", target: "lexicon", wikiPath: "/lexicon?q=PGX" },
  { term: "9.8 Census", type: "grading", target: "lexicon", wikiPath: "/lexicon?q=9.8+Census" },
  { term: "Census Float", type: "grading", target: "lexicon", wikiPath: "/lexicon?q=Census+Float" },
  { term: "Fair Market Value", ticker: "$FMV", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=Fair+Market+Value" },
  { term: "FMV", ticker: "$FMV", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=Fair+Market+Value" },
  { term: "Pedigree Provenance", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=Pedigree+Provenance" },
  { term: "Key Issue Premium", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=Key+Issue+Premium" },
  { term: "First Appearance", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=First+Appearance" },
  { term: "Ratio Variant", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=Ratio+Variant" },
  { term: "Final Order Cutoff", ticker: "$FOC", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=Final+Order+Cutoff" },
  { term: "Signature Series", type: "grading", target: "lexicon", wikiPath: "/lexicon?q=Signature+Series" },
  { term: "Overprint", type: "market-concept", target: "lexicon", wikiPath: "/lexicon?q=Overprint" },

  // --- PUBLISHERS (Grounded in ppcf_gcd_publishers) ---
  { term: "Marvel", ticker: "$MRVL", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=Marvel" },
  { term: "DC Comics", ticker: "$DC", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=DC" },
  { term: "DC", ticker: "$DC", type: "publisher", target: "intelligence", wikiPath: "/intelligence?q=DC" },
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

  // --- CHARACTERS & LORE (Grounded in Marvel Database & ppcf_gcd_stories) ---
  { term: "Spider-Man", ticker: "$SPDR", type: "character", target: "intelligence", wikiPath: "/wiki?search=Spider-Man" },
  { term: "Wolverine", ticker: "$WOLV", type: "character", target: "intelligence", wikiPath: "/wiki?search=Wolverine" },
  { term: "Iron Man", ticker: "$IRON", type: "character", target: "intelligence", wikiPath: "/wiki?search=Iron+Man" },
  { term: "Captain America", ticker: "$CAP", type: "character", target: "intelligence", wikiPath: "/wiki?search=Captain+America" },
  { term: "Thor", ticker: "$THOR", type: "character", target: "intelligence", wikiPath: "/wiki?search=Thor" },
  { term: "Hulk", ticker: "$HULK", type: "character", target: "intelligence", wikiPath: "/wiki?search=Hulk" },
  { term: "Deadpool", ticker: "$DP", type: "character", target: "intelligence", wikiPath: "/wiki?search=Deadpool" },
  { term: "Venom", ticker: "$VNM", type: "character", target: "intelligence", wikiPath: "/wiki?search=Venom" },
  { term: "Daredevil", ticker: "$DD", type: "character", target: "intelligence", wikiPath: "/wiki?search=Daredevil" },
  { term: "Punisher", ticker: "$PNSH", type: "character", target: "intelligence", wikiPath: "/wiki?search=Punisher" },
  { term: "Doctor Doom", ticker: "$DOOM", type: "character", target: "intelligence", wikiPath: "/wiki?search=Doctor+Doom" },
  { term: "Silver Surfer", ticker: "$SLVR", type: "character", target: "intelligence", wikiPath: "/wiki?search=Silver+Surfer" },
  { term: "Galactus", ticker: "$GLCT", type: "character", target: "intelligence", wikiPath: "/wiki?search=Galactus" },
  { term: "Thanos", ticker: "$THNS", type: "character", target: "intelligence", wikiPath: "/wiki?search=Thanos" },
  { term: "Moon Knight", ticker: "$MNKT", type: "character", target: "intelligence", wikiPath: "/wiki?search=Moon+Knight" },
  { term: "Ghost Rider", ticker: "$GSTR", type: "character", target: "intelligence", wikiPath: "/wiki?search=Ghost+Rider" },
  { term: "Blade", ticker: "$BLD", type: "character", target: "intelligence", wikiPath: "/wiki?search=Blade" },
  { term: "Jubilee", ticker: "$JUBL", type: "character", target: "intelligence", wikiPath: "/wiki?search=Jubilee" },
  { term: "Apocalypse", ticker: "$APOC", type: "character", target: "intelligence", wikiPath: "/wiki?search=Apocalypse" },
  { term: "Winter Soldier", ticker: "$WINT", type: "character", target: "intelligence", wikiPath: "/wiki?search=Winter+Soldier" },
  { term: "Bucky", type: "character", target: "intelligence", wikiPath: "/wiki?search=Bucky" },
  { term: "Taskmaster", ticker: "$TASK", type: "character", target: "intelligence", wikiPath: "/wiki?search=Taskmaster" },
  { term: "Kang the Conqueror", ticker: "$KANG", type: "character", target: "intelligence", wikiPath: "/wiki?search=Kang" },
  { term: "Mister Sinister", ticker: "$SNST", type: "character", target: "intelligence", wikiPath: "/wiki?search=Mister+Sinister" },
  { term: "Doctor Octopus", ticker: "$DOC", type: "character", target: "intelligence", wikiPath: "/wiki?search=Doctor+Octopus" },
  { term: "Green Goblin", ticker: "$GBLN", type: "character", target: "intelligence", wikiPath: "/wiki?search=Green+Goblin" },
  { term: "Carnage", ticker: "$CRNG", type: "character", target: "intelligence", wikiPath: "/wiki?search=Carnage" },
  { term: "Kraven the Hunter", ticker: "$KRVN", type: "character", target: "intelligence", wikiPath: "/wiki?search=Kraven" },
  { term: "Cable", ticker: "$CABL", type: "character", target: "intelligence", wikiPath: "/wiki?search=Cable" },
  { term: "Domino", ticker: "$DOMN", type: "character", target: "intelligence", wikiPath: "/wiki?search=Domino" },
  { term: "Bishop", ticker: "$BSHP", type: "character", target: "intelligence", wikiPath: "/wiki?search=Bishop" },
  { term: "Archangel", ticker: "$ARCH", type: "character", target: "intelligence", wikiPath: "/wiki?search=Archangel" },
  { term: "She-Hulk", ticker: "$SHLK", type: "character", target: "intelligence", wikiPath: "/wiki?search=She-Hulk" },
  { term: "Black Panther", ticker: "$PNTR", type: "character", target: "intelligence", wikiPath: "/wiki?search=Black+Panther" },
  { term: "Sentry", ticker: "$SNTR", type: "character", target: "intelligence", wikiPath: "/wiki?search=Sentry" },
  { term: "Magneto", ticker: "$MGNT", type: "character", target: "intelligence", wikiPath: "/wiki?search=Magneto" },
  { term: "Professor X", ticker: "$PROFX", type: "character", target: "intelligence", wikiPath: "/wiki?search=Professor+X" },
  { term: "Cyclops", ticker: "$CYCL", type: "character", target: "intelligence", wikiPath: "/wiki?search=Cyclops" },
  { term: "Storm", ticker: "$STRM", type: "character", target: "intelligence", wikiPath: "/wiki?search=Storm" },
  { term: "Colossus", ticker: "$COLS", type: "character", target: "intelligence", wikiPath: "/wiki?search=Colossus" },
  { term: "Nightcrawler", ticker: "$NCWL", type: "character", target: "intelligence", wikiPath: "/wiki?search=Nightcrawler" },
  { term: "Rogue", ticker: "$ROG", type: "character", target: "intelligence", wikiPath: "/wiki?search=Rogue" },
  { term: "Gambit", ticker: "$GMBT", type: "character", target: "intelligence", wikiPath: "/wiki?search=Gambit" },
  { term: "Scarlet Witch", ticker: "$SCWT", type: "character", target: "intelligence", wikiPath: "/wiki?search=Scarlet+Witch" },
  { term: "Quicksilver", ticker: "$QSVR", type: "character", target: "intelligence", wikiPath: "/wiki?search=Quicksilver" },
  { term: "Hawkeye", ticker: "$HAWK", type: "character", target: "intelligence", wikiPath: "/wiki?search=Hawkeye" },
  { term: "Black Widow", ticker: "$WIDW", type: "character", target: "intelligence", wikiPath: "/wiki?search=Black+Widow" },
  { term: "Falcon", ticker: "$FLCN", type: "character", target: "intelligence", wikiPath: "/wiki?search=Falcon" },
  { term: "Luke Cage", ticker: "$CAGE", type: "character", target: "intelligence", wikiPath: "/wiki?search=Luke+Cage" },
  { term: "Iron Fist", ticker: "$FIST", type: "character", target: "intelligence", wikiPath: "/wiki?search=Iron+Fist" },
  { term: "Shang-Chi", ticker: "$SHNG", type: "character", target: "intelligence", wikiPath: "/wiki?search=Shang-Chi" },
  { term: "X-Men", ticker: "$XMEN", type: "character", target: "intelligence", wikiPath: "/wiki?search=X-Men" },
  { term: "Avengers", ticker: "$AVNG", type: "character", target: "intelligence", wikiPath: "/wiki?search=Avengers" },
  { term: "Fantastic Four", ticker: "$FF", type: "character", target: "intelligence", wikiPath: "/wiki?search=Fantastic+Four" },
  { term: "Sinister Six", type: "character", target: "intelligence", wikiPath: "/wiki?search=Sinister+Six" },
  { term: "Brotherhood of Evil Mutants", type: "character", target: "intelligence", wikiPath: "/wiki?search=Brotherhood+of+Evil+Mutants" },
  { term: "Alpha Flight", type: "character", target: "intelligence", wikiPath: "/wiki?search=Alpha+Flight" },
  { term: "New Mutants", type: "character", target: "intelligence", wikiPath: "/wiki?search=New+Mutants" },
  { term: "Thunderbolts", type: "character", target: "intelligence", wikiPath: "/wiki?search=Thunderbolts" },
  { term: "Guardians of the Galaxy", ticker: "$GOTG", type: "character", target: "intelligence", wikiPath: "/wiki?search=Guardians+of+the+Galaxy" },
  { term: "Illuminati", type: "character", target: "intelligence", wikiPath: "/wiki?search=Illuminati" },
  { term: "Dora Milaje", type: "character", target: "intelligence", wikiPath: "/wiki?search=Dora+Milaje" },
  { term: "Batman", ticker: "$BAT", type: "character", target: "intelligence", wikiPath: "/wiki?search=Batman" },
  { term: "Superman", ticker: "$SUPR", type: "character", target: "intelligence", wikiPath: "/wiki?search=Superman" },
  { term: "Joker", ticker: "$JKR", type: "character", target: "intelligence", wikiPath: "/wiki?search=Joker" },
  { term: "Wonder Woman", ticker: "$WW", type: "character", target: "intelligence", wikiPath: "/wiki?search=Wonder+Woman" },
  { term: "The Flash", ticker: "$FLSH", type: "character", target: "intelligence", wikiPath: "/wiki?search=The+Flash" },
  { term: "Flash", ticker: "$FLSH", type: "character", target: "intelligence", wikiPath: "/wiki?search=Flash" },
  { term: "Green Lantern", ticker: "$GL", type: "character", target: "intelligence", wikiPath: "/wiki?search=Green+Lantern" },
  { term: "Aquaman", ticker: "$AQUA", type: "character", target: "intelligence", wikiPath: "/wiki?search=Aquaman" },
  { term: "Robin", ticker: "$RBN", type: "character", target: "intelligence", wikiPath: "/wiki?search=Robin" },
  { term: "Nightwing", ticker: "$NGHT", type: "character", target: "intelligence", wikiPath: "/wiki?search=Nightwing" },
  { term: "Batgirl", ticker: "$BTG", type: "character", target: "intelligence", wikiPath: "/wiki?search=Batgirl" },
  { term: "Catwoman", ticker: "$CATW", type: "character", target: "intelligence", wikiPath: "/wiki?search=Catwoman" },
  { term: "Harley Quinn", ticker: "$HRLY", type: "character", target: "intelligence", wikiPath: "/wiki?search=Harley+Quinn" },
  { term: "Supergirl", ticker: "$SPRG", type: "character", target: "intelligence", wikiPath: "/wiki?search=Supergirl" },
  { term: "Green Arrow", ticker: "$GRAW", type: "character", target: "intelligence", wikiPath: "/wiki?search=Green+Arrow" },
  { term: "Deathstroke", ticker: "$DTHS", type: "character", target: "intelligence", wikiPath: "/wiki?search=Deathstroke" },
  { term: "Cyborg", ticker: "$CYBG", type: "character", target: "intelligence", wikiPath: "/wiki?search=Cyborg" },
  { term: "Starfire", ticker: "$STRF", type: "character", target: "intelligence", wikiPath: "/wiki?search=Starfire" },
  { term: "Raven", ticker: "$RAVN", type: "character", target: "intelligence", wikiPath: "/wiki?search=Raven" },
  { term: "Justice League", ticker: "$JL", type: "character", target: "intelligence", wikiPath: "/wiki?search=Justice+League" },
  { term: "Justice Society", ticker: "$JSA", type: "character", target: "intelligence", wikiPath: "/wiki?search=Justice+Society" },
  { term: "Teen Titans", ticker: "$TT", type: "character", target: "intelligence", wikiPath: "/wiki?search=Teen+Titans" },
  { term: "Suicide Squad", ticker: "$SS", type: "character", target: "intelligence", wikiPath: "/wiki?search=Suicide+Squad" },
  { term: "Watchmen", ticker: "$WTCH", type: "character", target: "intelligence", wikiPath: "/wiki?search=Watchmen" },
  { term: "Spawn", ticker: "$SPWN", type: "character", target: "intelligence", wikiPath: "/wiki?search=Spawn" },
  { term: "Hellboy", ticker: "$HELL", type: "character", target: "intelligence", wikiPath: "/wiki?search=Hellboy" },
  { term: "Invincible", ticker: "$INVN", type: "character", target: "intelligence", wikiPath: "/wiki?search=Invincible" },
  { term: "Savage Dragon", ticker: "$SDRG", type: "character", target: "intelligence", wikiPath: "/wiki?search=Savage+Dragon" },
  { term: "Star Wars", ticker: "$SW", type: "character", target: "intelligence", wikiPath: "/wiki?search=Star+Wars" },

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
];

// In-memory cache for dynamic text lookups
const entityCache = new Map<string, EntityWikiDef[]>();

/**
 * Dynamically resolves entities mentioned in text by combining:
 * 1. Pre-indexed canonical finance, creator, publisher, and lore entities.
 * 2. On-demand dynamic database lookup in `ppcf_gcd_creators`, `ppcf_gcd_publishers`, `ppcf_gcd_series`, `recovered_index_contracts`.
 */
export async function getDynamicEntitiesForText(text: string): Promise<EntityWikiDef[]> {
  if (!text || text.trim().length === 0) return [];
  const textHash = text.slice(0, 120);
  if (entityCache.has(textHash)) return entityCache.get(textHash)!;

  const matchedEntities: EntityWikiDef[] = [];
  const lowerText = text.toLowerCase();

  // Match against canonical known registry
  for (const entity of KNOWN_NEWS_ENTITIES_MAP) {
    const termLower = entity.term.toLowerCase();
    const regex = new RegExp(`\\b${termLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (regex.test(lowerText)) {
      matchedEntities.push(entity);
    }
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
          !matchedEntities.some((e) => e.term === contract.display_name)
        ) {
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

  entityCache.set(textHash, matchedEntities);
  return matchedEntities;
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
  return KNOWN_NEWS_ENTITIES_MAP.filter((def) => {
    const escaped = def.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    return regex.test(text);
  });
}
