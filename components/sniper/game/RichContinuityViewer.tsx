"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Sparkles,
  ExternalLink,
  Shield,
  Coins,
  HelpCircle,
  X,
  Quote,
  Feather,
  Users,
  Flame,
  AlertTriangle,
  Info,
  Layers,
  Tag,
  ArrowLeft,
  ArrowRight,
  Compass,
  Bookmark,
} from "lucide-react";
import type { ContinuityLinksInfo, VariantCoverInfo } from "@/lib/sniper/sim/types";

export interface TermDefinition {
  term: string;
  slug: string;
  category: string;
  definition: string;
  translation: string;
  type: "lexicon" | "character" | "creator" | "artifact" | "team" | "location";
  universe?: string;
  role?: string;
  creators?: string;
  firstAppearance?: string;
  comicExample?: string;
  canonicalFormula?: string;
  url: string;
}

/**
 * Built-in canonical dictionary of core comic market principles, creators, and characters
 * with instant modal definitions, Investopedia parallels, and Panel Profits translations.
 */
export const WIKI_DICTIONARY: Record<string, TermDefinition> = {
  // ── MARKET & VALUATION PRINCIPLES ──
  "sub-floor dump": {
    term: "Sub-Floor Sunk Cost Sinkhole / Seller Dump",
    slug: "sunk-cost",
    category: "Market Distortions & Seller Psychology",
    definition: "A transaction where an encapsulated comic book trades at a secondary clearing price substantially below the third-party manufacturing costs incurred to slab it.",
    translation: "Someone slabbed a dollar-bin modern or mid-grade variant hoping for a 9.8, received a lower grade, and is dumping it at auction for $20–$40 to salvage cash. Replicating it ($97+) is an irrational act; reselling yields only net liquidation after fees.",
    type: "lexicon",
    url: "/lexicon?term=sunk-cost",
  },
  "net realizable liquidation": {
    term: "Net Realizable Liquidation (NRL)",
    slug: "fair-market-value-fmv-benchmark",
    category: "Secondary Market Liquidity",
    definition: "The net cash proceeds recovered upon disposing of an asset after deducting platform commissions (13.25%), payment processing, and insured packaging freight ($5).",
    translation: "For a $31 FMV book, net eBay exit is only ~$21.89 and LCS cash is ~$12.40. Paying above net liquidation for an illiquid slab locks in an immediate paper loss.",
    type: "lexicon",
    url: "/lexicon?term=fair-market-value-fmv-benchmark",
  },
  "cgc 9.8": {
    term: "CGC 9.8 Near Mint/Mint",
    slug: "cgc-9-8-benchmark",
    category: "Grading & Registry Standard",
    definition: "The institutional benchmark grade for modern sequential art, representing a nearly pristine copy with only negligible manufacturing micro-defects.",
    translation: "Serves as the sovereign liquidity anchor. Modern market values are indexed to 9.8, with all lower grades trading at stepped discounts.",
    type: "lexicon",
    url: "/lexicon?term=cgc-9-8-benchmark",
  },
  "cgc": {
    term: "CGC (Certified Guaranty Company)",
    slug: "third-party-certification-cgc",
    category: "Grading Authority",
    definition: "The pioneer independent third-party grading and encapsulation service for comic books, established in 2000.",
    translation: "Eliminates condition disputes between counterparties by providing an impartial, tamper-evident sealed grade consensus.",
    type: "lexicon",
    url: "/lexicon?term=third-party-certification-cgc",
  },
  "fair market value": {
    term: "Fair Market Value (FMV Benchmark)",
    slug: "fair-market-value-fmv-benchmark",
    category: "Valuation & Pricing Authority",
    definition: "The clearing price an asset commands in an open, competitive market between willing, informed counterparties.",
    translation: "Volume-weighted median of verified completed auction sales within the trailing 90-day observation window.",
    type: "lexicon",
    url: "/lexicon?term=fair-market-value-fmv-benchmark",
  },
  "fmv": {
    term: "Fair Market Value (FMV)",
    slug: "fair-market-value-fmv-benchmark",
    category: "Valuation & Pricing Authority",
    definition: "Normalized consensus transaction clearing level across public exchanges.",
    translation: "Standardized benchmark used to measure discounts, premiums, and arbitrage spreads.",
    type: "lexicon",
    url: "/lexicon?term=fair-market-value-fmv-benchmark",
  },
  "grade compression": {
    term: "Grade Compression (Tier Spread Contraction)",
    slug: "grade-compression",
    category: "Valuation & Pricing Authority",
    definition: "Market phenomenon where the price differential between adjacent product or credit tiers narrows due to marginal utility or liquidity constraints.",
    translation: "The narrowing price ratio between mid-grade copies (CGC 8.0–9.2) and high-grade benchmarks (9.8). A high ratio (>0.80) signals defensive downside safety in 9.6s.",
    type: "lexicon",
    url: "/lexicon?term=grade-compression",
  },
  "sunk cost": {
    term: "Sunk Cost / Slabbing Overhead Floor",
    slug: "sunk-cost",
    category: "Corporate Finance & Accounting",
    definition: "A cost that has already been incurred and cannot be recovered by future decision-making.",
    translation: "The fixed ~$85.40 in submission, grading, pressing, shipping, and tax incurred to slab a book. Acquiring slabs below this basis transfers seller equity to the buyer.",
    type: "lexicon",
    url: "/lexicon?term=sunk-cost",
  },
  "slabbing overhead": {
    term: "Slabbing Overhead Floor ($85.40)",
    slug: "sunk-cost",
    category: "Corporate Finance & Accounting",
    definition: "Unavoidable third-party manufacturing costs required to transform a raw comic into a certified liquid financial instrument.",
    translation: "Includes $35 grading + $5 invoice + $2.40 tax + $43 round-trip insured freight. A secondary bid below this level forces the submitter to absorb manufacturing friction.",
    type: "lexicon",
    url: "/lexicon?term=sunk-cost",
  },
  "first appearance": {
    term: "First Appearance (Key Issue Milestone)",
    slug: "first-appearance-key-issue-premium",
    category: "Equities & Market Mechanics",
    definition: "The debut publication of a major intellectual property character or concept in canonical continuity.",
    translation: "The primary driver of permanent sovereign demand in comic equities, conferring durable IP moats and multi-decade collector liquidity.",
    type: "lexicon",
    url: "/lexicon?term=first-appearance-key-issue-premium",
  },
  "pedigree": {
    term: "Pedigree & Signature Auction Comps",
    slug: "pedigree-collection-premium",
    category: "Pedigree & Provenance",
    definition: "A collection of certified high-grade vintage comic books officially recognized by grading houses for exceptional preservation.",
    translation: "Heritage Signature and ComicLink pedigree auctions command an average +18% to +25% premium over street liquidation floors.",
    type: "lexicon",
    url: "/lexicon?term=pedigree-collection-premium",
  },
  "clean & press (cpr)": {
    term: "Clean & Press (CPR Upside)",
    slug: "clean-and-press-regrade-upside",
    category: "Conservation & Equity Enhancement",
    definition: "Non-restorative moisture humidification and heated platen pressing to remove non-color breaking bends and dents.",
    translation: "Hypothetical CPR models buying an 8.5–9.2, pressing out surface defects, and submitting for a 9.6–9.8 regrade to capture tier arbitrage.",
    type: "lexicon",
    url: "/lexicon?term=clean-and-press-regrade-upside",
  },
  "margin of safety": {
    term: "Margin of Safety (MOS)",
    slug: "margin-of-safety",
    category: "Equities & Market Mechanics",
    definition: "Investing principle where one only purchases assets when market price is significantly below intrinsic value, minimizing downside risk against estimation error.",
    translation: "Acquiring graded slabs at or below third-party manufacturing costs ($85.40) or at 30%+ discounts to trailing 90-day volume-weighted FMV, transferring seller equity to the buyer.",
    comicExample: "Bidding $35 on a CGC 9.4 with an $85.40 manufacturing floor locks in a $50.40 seller-subsidized margin of safety before factoring in the comic's intrinsic demand.",
    canonicalFormula: "Margin of Safety (%) = (Intrinsic Benchmark FMV - All-In Cost Basis) / Intrinsic Benchmark FMV",
    type: "lexicon",
    url: "/wiki/terms/margin-of-safety",
  },
  "market capitalization": {
    term: "Market Capitalization (Asset Float Cap)",
    slug: "market-capitalization-asset-float-cap",
    category: "Equities & Market Mechanics",
    definition: "The total dollar market value of an asset class's outstanding units (Unit Price × Total Units).",
    translation: "Aggregate market valuation of a comic issue's certified census float across all grade tiers (Census Count × Grade FMV). Reflects total secondary market capital stored in that specific book.",
    comicExample: "Incredible Hulk #181's 14,000+ certified copies across all grade tiers represent over $65,000,000 in aggregate secondary market capitalization.",
    canonicalFormula: "Comic Issue Market Cap = ∑ (Census Population[grade] × Verified FMV[grade])",
    type: "lexicon",
    url: "/wiki/terms/market-capitalization-asset-float-cap",
  },
  "bid-ask spread": {
    term: "Bid-Ask Spread (FMV Liquidity Spread)",
    slug: "bid-ask-spread-fmv-liquidity-spread",
    category: "Equities & Market Mechanics",
    definition: "The amount by which the lowest asking price exceeds the highest bid price in an open market.",
    translation: "The spread between wholesale dealer buy-list cash offers (bid) and retail auction/collector asking prices (ask) for a certified slab.",
    comicExample: "A raw Fantastic Four #48 with a dealer cash buy offer of $1,800 and a retail market FMV of $2,400 has a $600 (25%) liquidity spread.",
    canonicalFormula: "FMV Liquidity Spread = Retail Ask Price - Wholesale Buy-List Bid Price",
    type: "lexicon",
    url: "/wiki/terms/bid-ask-spread-fmv-liquidity-spread",
  },
  "cost basis": {
    term: "Cost Basis (Tax Lot Accounting)",
    slug: "cost-basis-tax-lot-accounting",
    category: "Portfolio & Accounting",
    definition: "The original total value of an asset for tax and accounting purposes, usually the purchase price adjusted for commissions, fees, and additions.",
    translation: "The exact dollar expenditure incurred to acquire a physical comic or slab: hammer price + 20% buyer's premium + shipping freight + third-party encapsulation fees.",
    comicExample: "Purchasing a CGC 8.0 Giant-Size X-Men #1 for $3,600 hammer + $720 buyer's premium + $50 shipping establishes an immutable Cost Basis of $4,370.00.",
    canonicalFormula: "Total Cost Basis = Hammer Price + Buyer's Premium + Insured Freight + Grading Fees",
    type: "lexicon",
    url: "/wiki/terms/cost-basis-tax-lot-accounting",
  },
  "unrealized gain": {
    term: "Unrealized Gain / Loss (Unrealized P&L)",
    slug: "unrealized-gain-loss-unrealized-p-l",
    category: "Portfolio & Accounting",
    definition: "A profitable or losing position on an open holding that has not yet been settled via a secondary market sale (paper profit/loss).",
    translation: "The live mark-to-market difference between active certified grade FMV and original acquisition cost basis.",
    comicExample: "A CGC 9.4 Amazing Spider-Man #300 acquired at a $2,400 cost basis with a current verified 9.4 FMV of $3,200 reflects an Unrealized Gain of +$800 (+33.3%).",
    canonicalFormula: "Unrealized P&L ($) = (Current Grade FMV × Quantity) - Total Cost Basis",
    type: "lexicon",
    url: "/wiki/terms/unrealized-gain-loss-unrealized-p-l",
  },
  "realized gain": {
    term: "Realized Gain / Loss",
    slug: "realized-gain-loss",
    category: "Portfolio & Accounting",
    definition: "The net profit or loss locked in upon disposing of an asset at a price different from its original purchase price.",
    translation: "Net cash proceeds recovered upon completed secondary market sale and settlement after deducting platform commissions (13.25%) minus original cost basis.",
    canonicalFormula: "Realized Gain = Net Auction Settlement (Sale Price - Commission) - Cost Basis",
    type: "lexicon",
    url: "/wiki/terms/realized-gain-loss",
  },
  "conglomerate media catalyst": {
    term: "Conglomerate Media Catalyst (Equity Correlation)",
    slug: "conglomerate-media-catalyst-equity-correlation",
    category: "Market Intelligence & Catalysts",
    definition: "Corporate M&A, studio announcements, trailer releases, or casting attachments that trigger rapid narrative re-rating and volume spikes.",
    translation: "Film or television casting announcements by Disney/Marvel Studios, Warner Bros/DC, or Sony that trigger speculative trading runs on underlying key comic debuts.",
    comicExample: "Marvel Studios announcing Hugh Jackman's return as Wolverine or RDJ as Doctor Doom in Avengers: Doomsday acted as major catalysts, quadrupling trading volume in respective first appearance keys.",
    canonicalFormula: "Catalyst Velocity = (7-Day Post-Announcement Volume) / (90-Day Baseline Trading Volume)",
    type: "lexicon",
    url: "/wiki/terms/conglomerate-media-catalyst-equity-correlation",
  },
  "opportunity cost": {
    term: "Opportunity Cost",
    slug: "opportunity-cost",
    category: "Portfolio & Accounting",
    definition: "The value of the best available alternative foregone when capital is committed to a specific investment option.",
    translation: "Allocating capital into speculative modern store variants instead of established blue-chip Silver Age keys carries the opportunity cost of missing generational census appreciation.",
    comicExample: "Spending $5,000 on modern store-exclusive 1:50 variants rather than a CGC 8.0 Incredible Hulk #181 incurs severe opportunity cost over a multi-year investment horizon.",
    canonicalFormula: "Opportunity Cost = Return on Best Forgone Asset - Return on Selected Holding",
    type: "lexicon",
    url: "/wiki/terms/opportunity-cost",
  },
  "concentration risk": {
    term: "Portfolio Concentration Risk",
    slug: "concentration-risk",
    category: "Portfolio & Accounting",
    definition: "Risk arising from excessive exposure to a single counterparty, asset, or theme, such that losses in that position severely harm overall portfolio value.",
    translation: "Holding 80%+ of collection capital in a single character franchise (e.g. only Spider-Man or only MCU keys), exposing the investor to single-narrative volatility.",
    canonicalFormula: "Concentration Ratio = Value of Top 3 Holdings / Total Portfolio Value",
    type: "lexicon",
    url: "/wiki/terms/concentration-risk",
  },
  "price discovery": {
    term: "Price Discovery Mechanism",
    slug: "price-discovery",
    category: "Trading & Execution",
    definition: "The continuous process through which competitive bidding in an open marketplace establishes updated market clearing prices.",
    translation: "Public auction bidding wars on major venues (Heritage, ComicLink, eBay) establishing updated benchmark values for newly surfaced high-grade pedigree copies.",
    canonicalFormula: "Price Discovery Delta = (Auction Hammer Price - 90d Baseline FMV) / 90d Baseline FMV",
    type: "lexicon",
    url: "/wiki/terms/price-discovery",
  },
  "liquidity": {
    term: "Market Liquidity & Turnover Velocity",
    slug: "liquidity",
    category: "Trading & Execution",
    definition: "The efficiency with which an asset can be converted into cash without impacting its market clearing price.",
    translation: "The transaction velocity and market depth of a certified comic slab on public exchanges. High-liquidity keys like ASM #300 clear within hours; illiquid books require deep markdowns.",
    canonicalFormula: "Liquidity Ratio = 30-Day Trading Volume ($) / Total Market Float ($)",
    type: "lexicon",
    url: "/wiki/terms/liquidity",
  },
  "scarcity": {
    term: "Census Scarcity & Inelastic Supply",
    slug: "scarcity",
    category: "Asset Classification & Provenance",
    definition: "Economic condition where supply is strictly fixed relative to demand, establishing steep upward supply curves and high price inelasticity.",
    translation: "Pre-1980 Golden, Silver, and Bronze Age comic populations are strictly finite; surviving certified high grades can only diminish over time through damage and attrition.",
    comicExample: "Even if Action Comics #1 prices surge to $6,000,000, the global certified surviving population cannot increase, creating absolute price inelasticity.",
    canonicalFormula: "Supply Inelasticity = (% Change in Quantity Supplied) / (% Change in Price) ≈ 0",
    type: "lexicon",
    url: "/wiki/terms/scarcity",
  },
  "break-even point": {
    term: "Break-Even Point Calculation",
    slug: "breakeven-point-definition-examples-and-how-to-calculate",
    category: "Corporate Finance & Accounting",
    definition: "The production or clearing price level where total revenue exactly equals total all-in costs, yielding zero net profit and zero net loss.",
    translation: "The minimum auction hammer price required to recover all acquisition costs, third-party encapsulation overhead ($85.40), and platform seller fees (13.25%).",
    comicExample: "For a slab acquired at $45 with $8 shipping, the minimum break-even resale price on eBay is $61.10 after platform commissions.",
    canonicalFormula: "Breakeven Hammer = (Acquisition Cost + Freight) / (1 - Platform Commission Rate 0.1325)",
    type: "lexicon",
    url: "/wiki/terms/breakeven-point-definition-examples-and-how-to-calculate",
  },
  "asset float": {
    term: "Asset Float & Census Scarcity Velocity",
    slug: "asset-float-scarcity-velocity",
    category: "Equities & Market Mechanics",
    definition: "The portion of total outstanding shares or units that are actively circulating and available for public secondary trading.",
    translation: "The number of certified copies recorded on third-party census registries that actively trade on secondary exchanges, excluding copies locked in pedigree vaults or institutional registry sets.",
    canonicalFormula: "Circulating Float = Total Census Population - Institutionally Locked Registry Copies",
    type: "lexicon",
    url: "/wiki/terms/asset-float-scarcity-velocity",
  },
  "sovereign store of value": {
    term: "Sovereign Key Store of Value",
    slug: "sovereign-key-store-of-value",
    category: "Asset Classification & Provenance",
    definition: "An elite blue-chip asset that reliably preserves capital and purchasing power across multi-decade generational horizons.",
    translation: "Foundational mega-keys (Action Comics #1, Detective #27, AF #15, Hulk #181, X-Men #1) that command permanent institutional collector demand and act as the reserve currency of sequential art.",
    type: "lexicon",
    url: "/wiki/terms/first-appearance-key-issue-premium",
  },
  "newsstand vs direct": {
    term: "Newsstand vs. Direct Edition Multiplier",
    slug: "newsstand-vs-direct-float-multiplier",
    category: "Distribution & Census Float",
    definition: "The structural supply differential between mass-retail spinner-rack copies with barcodes and direct-market comic shop editions.",
    translation: "1980s–1990s newsstand editions suffered 90%+ return and pulping destruction rates, resulting in extreme high-grade census scarcity (2x–5x price multipliers in CGC 9.8).",
    comicExample: "A CGC 9.8 Amazing Spider-Man #300 Newsstand commands up to a 2.5x price premium over its Direct Edition counterpart due to spinner-rack destruction.",
    type: "lexicon",
    url: "/wiki/terms/asset-float-scarcity-velocity",
  },
  "cbcs": {
    term: "CBCS (Comic Book Certification Service)",
    slug: "cbcs-certification",
    category: "Grading Authority",
    definition: "Major independent third-party comic grading service founded by former CGC lead grader Steve Borock, offering signature verification and encapsulation.",
    translation: "Trades at a modest 5%–15% liquidity discount relative to CGC benchmarks, offering attractive entry margins and verified signature provenance.",
    type: "lexicon",
    url: "/wiki/terms/third-party-certification-cgc",
  },

  // ── X-MEN #12 & JUGGERNAUT MILESTONE ENTITIES ──
  "juggernaut": {
    term: "The Unstoppable Juggernaut (Cain Marko)",
    slug: "juggernaut",
    category: "Canonical Lore & Character IP",
    definition: "Abusive stepbrother of Charles Xavier who uncovered the Crimson Gem of Cyttorak in a lost temple, transforming into an unstoppable, invulnerable juggernaut.",
    translation: "First appearing in X-Men #12 (July 1965), Juggernaut is one of Marvel's premier powerhouse antagonists, cementing #12 as a cornerstone Silver Age blue chip.",
    type: "character",
    universe: "MARVEL UNIVERSE (EARTH-616)",
    role: "Avatar of Cyttorak & Unstoppable Powerhouse",
    creators: "Stan Lee, Jack Kirby, Alex Toth",
    firstAppearance: "X-Men #12 (July 1965)",
    url: "/catalog?q=Juggernaut",
  },
  "cain marko": {
    term: "Cain Marko (Juggernaut Origin)",
    slug: "cain-marko",
    category: "Canonical Lore & Character IP",
    definition: "Stepbrother of Charles Xavier who harbored deep resentment toward Xavier's intellect, later discovering Cyttorak's gem during the Korean War.",
    translation: "Central figure in X-Men #12 whose psychological trauma and family resentment anchor the emotional core of Silver Age mutant continuity.",
    type: "character",
    universe: "MARVEL UNIVERSE (EARTH-616)",
    role: "Stepbrother of Professor X & Juggernaut Host",
    creators: "Stan Lee, Jack Kirby, Alex Toth",
    firstAppearance: "X-Men #12 (July 1965)",
    url: "/catalog?q=Juggernaut",
  },
  "crimson gem of cyttorak": {
    term: "The Crimson Gem of Cyttorak",
    slug: "crimson-gem-of-cyttorak",
    category: "Canonical Artifacts & Relics",
    definition: "Mystical conduit linking the mortal realm to the extra-dimensional Octessence deity Cyttorak, granting boundless physical momentum and invulnerability.",
    translation: "The seminal artifact introduced in X-Men #12 that birthed the Juggernaut and remains a recurring cornerstone of Marvel mystic continuity.",
    type: "artifact",
    universe: "MARVEL UNIVERSE (EARTH-616)",
    role: "Mystic Relic of Cyttorak",
    firstAppearance: "X-Men #12 (July 1965)",
    url: "/catalog?q=Cyttorak",
  },
  "cyttorak": {
    term: "Cyttorak (Lord of the Crimson Cosmos)",
    slug: "cyttorak",
    category: "Canonical Lore & Character IP",
    definition: "Ancient extra-dimensional entity of destructive momentum, worshipped as an Octessence deity and source of the Juggernaut's unstoppable power.",
    translation: "Primary cosmic entity in Doctor Strange and X-Men mystic lore; his Crimson Bands of Cyttorak are a staple spell in Marvel continuity.",
    type: "character",
    universe: "MARVEL UNIVERSE (EARTH-616)",
    role: "Cosmic Entity & Ruler of the Crimson Cosmos",
    firstAppearance: "Strange Tales #124 / X-Men #12",
    url: "/catalog?q=Cyttorak",
  },
  "alex toth": {
    term: "Alex Toth (Legendary Bullpen Artist)",
    slug: "alex-toth",
    category: "Creator Retrospective",
    definition: "Master sequential artist and animation designer (Space Ghost, Herculoids) celebrated for his minimalist storytelling and dynamic visual economy.",
    translation: "Illustrated the interior pages of X-Men #12 alongside Jack Kirby, making the issue a celebrated artist showcase for Silver Age collectors.",
    type: "creator",
    universe: "Marvel Bullpen",
    role: "Legendary Penciler & Animator",
    url: "/catalog?q=Alex+Toth",
  },
  "professor x": {
    term: "Professor Charles Xavier (Origin & Dark Family Secret)",
    slug: "professor-xavier",
    category: "Canonical Lore & Character IP",
    definition: "World's most powerful mutant telepath and founder of the X-Men, whose childhood abuse by stepbrother Cain Marko is revealed in X-Men #12.",
    translation: "Core protagonist of the mutant franchise. X-Men #12 provides the definitive canonical origin of Xavier's family trauma and motivation.",
    type: "character",
    universe: "MARVEL UNIVERSE (EARTH-616)",
    role: "Founder of the X-Men & Telepathic Mentor",
    creators: "Stan Lee, Jack Kirby",
    firstAppearance: "X-Men #1 (September 1963)",
    url: "/catalog?q=Professor+X",
  },

  // ── SENSATIONAL SHE-HULK #34 & JOHN BYRNE MILESTONE ENTITIES ──
  "she-hulk": {
    term: "Sensational She-Hulk (Jennifer Walters)",
    slug: "she-hulk",
    category: "Canonical Lore & Character IP",
    definition: "Bruce Banner's lawyer cousin who gained emerald superhuman strength through a blood transfusion, retaining her wit, intellect, and legal brilliance.",
    translation: "Pioneered fourth-wall breaking meta satire under John Byrne; multi-billion dollar cinematic and streaming TV franchise anchor.",
    type: "character",
    universe: "MARVEL UNIVERSE (EARTH-616)",
    role: "Superhuman Attorney & Avenger",
    creators: "Stan Lee, John Buscema",
    firstAppearance: "Savage She-Hulk #1 (February 1980)",
    url: "/catalog?q=She-Hulk",
  },
  "jennifer walters": {
    term: "Jennifer Walters, Esq. (She-Hulk)",
    slug: "jennifer-walters",
    category: "Canonical Lore & Character IP",
    definition: "Top superhuman defense attorney in New York City who routinely defends metahumans while serving as an active member of the Avengers and Fantastic Four.",
    translation: "Key Marvel protagonist combining legal procedurals with superhero action; back-issue values spiked significantly with MCU streaming adoption.",
    type: "character",
    universe: "MARVEL UNIVERSE (EARTH-616)",
    role: "Superhuman Defense Attorney",
    url: "/catalog?q=She-Hulk",
  },
  "vanity fair parody": {
    term: "Vanity Fair Demi Moore Homage Cover",
    slug: "vanity-fair-demi-moore-parody",
    category: "Iconic Covers & Pop Culture Homages",
    definition: "John Byrne's famous satirical cover for Sensational She-Hulk #34 parodying Annie Leibovitz's iconic August 1991 Vanity Fair cover of pregnant Demi Moore (with Bruce Willis' baby), replacing the pregnancy bump with an inflated beach ball.",
    translation: "One of the most celebrated and commercially sought-after homage covers of the Copper Age, driving immense collector demand and media coverage.",
    type: "lexicon",
    universe: "MARVEL UNIVERSE (EARTH-616)",
    role: "Pop Culture Satire Milestone",
    firstAppearance: "Sensational She-Hulk #34 (December 1991)",
    url: "/catalog?q=Sensational+She-Hulk+34",
  },
  "demi moore beach ball homage": {
    term: "Demi Moore Pregnancy Beach Ball Homage",
    slug: "vanity-fair-demi-moore-parody",
    category: "Iconic Covers & Pop Culture Homages",
    definition: "The visual punchline of Sensational She-Hulk #34 where She-Hulk mimics Demi Moore's nude pregnancy pose while revealing she is merely holding a beach ball.",
    translation: "A defining cultural touchstone of early 1990s comic irreverence that helped establish John Byrne's She-Hulk as an enduring collector favorite.",
    type: "lexicon",
    url: "/catalog?q=Sensational+She-Hulk+34",
  },
  "john byrne": {
    term: "John Byrne (Visionary Writer & Artist)",
    slug: "john-byrne",
    category: "Creator Retrospective",
    definition: "Superstar creator whose work on Fantastic Four, Uncanny X-Men (Dark Phoenix), Superman (Man of Steel), and Sensational She-Hulk redefined sequential art.",
    translation: "Byrne's creator pedigree commands enduring market premiums across all his signature runs; his She-Hulk established the meta humor later adopted by Deadpool.",
    type: "creator",
    universe: "Marvel Bullpen",
    role: "Legendary Writer & Artist",
    url: "/catalog?q=John+Byrne",
  },

  // ── WOLVERINE & BRONZE AGE KEY ENTITIES ──
  "wolverine": {
    term: "Wolverine (James 'Logan' Howlett)",
    slug: "wolverine",
    category: "Canonical Lore & Character IP",
    definition: "Mutant berserker possessing heightened senses, accelerated healing, and an adamantium-bonded skeleton with razor-sharp retractable claws.",
    translation: "First appearing in Incredible Hulk #181 (November 1974), Wolverine is the single most liquid and valuable character debut of the Bronze Age.",
    type: "character",
    universe: "MARVEL UNIVERSE (EARTH-616)",
    role: "X-Man, Avenger & Weapon X Survivor",
    creators: "Len Wein, Herb Trimpe, John Romita Sr.",
    firstAppearance: "Incredible Hulk #181 (November 1974)",
    url: "/catalog?q=Wolverine",
  },
  "logan": {
    term: "Logan (James Howlett / Wolverine)",
    slug: "wolverine",
    category: "Canonical Lore & Character IP",
    definition: "The civilian alias of James Howlett during his centuries of global wandering, Canadian Department H service, and Weapon X experimentation.",
    translation: "Cultural icon anchoring multiple decades of comic sales, film franchises, and certified grade census premiums.",
    type: "character",
    universe: "MARVEL UNIVERSE (EARTH-616)",
    role: "Weapon X Operative & X-Man",
    url: "/catalog?q=Wolverine",
  },
  "len wein": {
    term: "Len Wein (Bullpen Writer & Co-Creator)",
    slug: "len-wein",
    category: "Creator Retrospective",
    definition: "Legendary writer and editor who co-created Wolverine (Hulk #181), Swamp Thing (House of Secrets #92), and revitalized the X-Men in Giant-Size X-Men #1.",
    translation: "One of the most consequential creators in comic history; issues bearing his co-creations represent permanent blue-chip equities.",
    type: "creator",
    universe: "Marvel Bullpen",
    role: "Writer, Editor & Co-Creator",
    url: "/catalog?q=Len+Wein",
  },
  "herb trimpe": {
    term: "Herb Trimpe (Definitive Hulk Artist)",
    slug: "herb-trimpe",
    category: "Creator Retrospective",
    definition: "Prolific Marvel artist who drew The Incredible Hulk for seven consecutive years, illustrating the visual debut of Wolverine in Hulk #181.",
    translation: "Trimpe's dynamic powerhouse artwork defined the Bronze Age look of the Hulk and gave Wolverine his first action sequences.",
    type: "creator",
    universe: "Marvel Bullpen",
    role: "Penciler & Artist",
    url: "/catalog?q=Herb+Trimpe",
  },

  // ── AMAZING SPIDER-MAN #129, #300 & KEY CREATORS ──
  "punisher": {
    term: "The Punisher (Frank Castle Debut)",
    slug: "the-punisher",
    category: "Canonical Lore & Character IP",
    definition: "Marine veteran Frank Castle who launched a lethal one-man war on organized crime following the gangland murder of his wife and children in Central Park.",
    translation: "First appearing in Amazing Spider-Man #129 (February 1974), The Punisher established the modern anti-hero archetype, making #129 a top-tier Bronze Age key.",
    type: "character",
    universe: "MARVEL UNIVERSE (EARTH-616)",
    role: "Lethal Vigilante & Anti-Hero",
    creators: "Gerry Conway, Ross Andru, John Romita Sr.",
    firstAppearance: "Amazing Spider-Man #129 (February 1974)",
    url: "/catalog?q=Punisher",
  },
  "frank castle": {
    term: "Frank Castle (The Punisher)",
    slug: "the-punisher",
    category: "Canonical Lore & Character IP",
    definition: "Decorated combat veteran whose skull insignia and unyielding mission against criminal enterprises transformed superhero comics.",
    translation: "Sovereign comic property with sustained multi-decade film, television, and collector equity.",
    type: "character",
    universe: "MARVEL UNIVERSE (EARTH-616)",
    role: "The Punisher",
    url: "/catalog?q=Punisher",
  },
  "gerry conway": {
    term: "Gerry Conway (Bullpen Writer & Co-Creator)",
    slug: "gerry-conway",
    category: "Creator Retrospective",
    definition: "Pioneering writer who scripted the seminal 'Death of Gwen Stacy' (ASM #121-122) and created The Punisher (ASM #129) at age 21.",
    translation: "Conway's storytelling introduced mature, consequential stakes to Bronze Age Marvel comics.",
    type: "creator",
    universe: "Marvel Bullpen",
    role: "Writer & Co-Creator",
    url: "/catalog?q=Gerry+Conway",
  },
  "ross andru": {
    term: "Ross Andru (Legendary Spider-Man Penciler)",
    slug: "ross-andru",
    category: "Creator Retrospective",
    definition: "Acclaimed penciler whose meticulous New York architectural precision and kinetic action choreography defined Amazing Spider-Man throughout the 1970s.",
    translation: "Illustrated The Punisher's debut in ASM #129, Superman vs. The Amazing Spider-Man (1976), and countless classic Bronze Age storylines.",
    type: "creator",
    universe: "Marvel Bullpen",
    role: "Penciler & Artist",
    url: "/catalog?q=Ross+Andru",
  },
  "venom": {
    term: "Venom (Eddie Brock / Alien Symbiote)",
    slug: "venom",
    category: "Canonical Lore & Character IP",
    definition: "Disgraced investigative journalist Eddie Brock bonded to the rejected alien symbiote to exact murderous revenge against Peter Parker.",
    translation: "First fully appearing in Amazing Spider-Man #300 (May 1988), Venom is the crown jewel villain milestone of the Copper Age, commanding massive 9.8 liquidity.",
    type: "character",
    universe: "MARVEL UNIVERSE (EARTH-616)",
    role: "Lethal Protector & Symbiote Anti-Hero",
    creators: "David Michelinie, Todd McFarlane",
    firstAppearance: "Amazing Spider-Man #300 (May 1988)",
    url: "/catalog?q=Venom",
  },
  "todd mcfarlane": {
    term: "Todd McFarlane (Superstar Artist & Image Founder)",
    slug: "todd-mcfarlane",
    category: "Creator Retrospective",
    definition: "Revolutionary artist who transformed Spider-Man's visual aesthetic (spaghetti webbing, dynamic poses), co-created Venom, and founded Image Comics with Spawn.",
    translation: "His signature covers (ASM #300, Spider-Man #1, Batman #423, Spawn #1) are foundational liquidity drivers across Copper and Modern comic markets.",
    type: "creator",
    universe: "Marvel / Image Comics",
    role: "Revolutionary Artist & Publisher",
    url: "/catalog?q=Todd+McFarlane",
  },

  // ── FANTASTIC FOUR & COSMIC DEBUTS ──
  "galactus": {
    term: "Galactus (Devourer of Worlds Debut)",
    slug: "galactus",
    category: "Canonical Lore & Character IP",
    definition: "Cosmic entity surviving from the universe prior to the Big Bang who sustains himself by consuming planetary energy, debuting in Fantastic Four #48.",
    translation: "Jack Kirby and Stan Lee's cosmic masterpiece; Fantastic Four #48 represents one of the premier mega-keys of the entire Silver Age.",
    type: "character",
    universe: "MARVEL UNIVERSE (EARTH-616)",
    role: "Cosmic Entity & Devourer of Worlds",
    creators: "Stan Lee, Jack Kirby",
    firstAppearance: "Fantastic Four #48 (March 1966)",
    url: "/catalog?q=Galactus",
  },
  "silver surfer": {
    term: "The Silver Surfer (Norrin Radd Debut)",
    slug: "silver-surfer",
    category: "Canonical Lore & Character IP",
    definition: "Philosopher astronomer of Zenn-La who sacrificed his freedom to become the herald of Galactus, wielding the Power Cosmic in Fantastic Four #48.",
    translation: "Debuted in Fantastic Four #48, embodying Jack Kirby's spiritual cosmic vision; permanent tier-1 Silver Age blue chip.",
    type: "character",
    universe: "MARVEL UNIVERSE (EARTH-616)",
    role: "Herald of Galactus & Cosmic Wanderer",
    creators: "Jack Kirby, Stan Lee",
    firstAppearance: "Fantastic Four #48 (March 1966)",
    url: "/catalog?q=Silver+Surfer",
  },
  "black panther": {
    term: "Black Panther (King T'Challa of Wakanda Debut)",
    slug: "black-panther",
    category: "Canonical Lore & Character IP",
    definition: "Monarch of the technologically advanced, isolationist African nation of Wakanda, debuting in Fantastic Four #52 (July 1966).",
    translation: "The first superhero of African descent in mainstream American comics; historical milestone commanding sovereign investment equity.",
    type: "character",
    universe: "MARVEL UNIVERSE (EARTH-616)",
    role: "King of Wakanda & Black Panther",
    creators: "Stan Lee, Jack Kirby",
    firstAppearance: "Fantastic Four #52 (July 1966)",
    url: "/catalog?q=Black+Panther",
  },
  "jack kirby": {
    term: "Jack 'King' Kirby (Architect of the Marvel Universe)",
    slug: "jack-kirby",
    category: "Creator Retrospective",
    definition: "The unmatched visual architect who co-created Captain America, the Fantastic Four, X-Men, Hulk, Thor, Iron Man, Silver Surfer, and New Gods.",
    translation: "Kirby's dynamism and cosmic design established the modern visual language of superhero sequential art; Kirby keys are sovereign blue chips.",
    type: "creator",
    universe: "Marvel Bullpen",
    role: "King of Comics & Co-Creator",
    url: "/catalog?q=Jack+Kirby",
  },
  "stan lee": {
    term: "Stan Lee (The Voice of the Marvel Age)",
    slug: "stan-lee",
    category: "Creator Retrospective",
    definition: "Bullpen writer, editor, and publisher who co-created Spider-Man, Fantastic Four, Avengers, X-Men, Iron Man, and Thor, introducing flawed, human heroes.",
    translation: "His signature storytelling and dialogue brought comic books into mainstream cultural respectability, anchoring multi-billion dollar franchises.",
    type: "creator",
    universe: "Marvel Bullpen",
    role: "Writer, Editor & Marvel Patriarch",
    url: "/catalog?q=Stan+Lee",
  },

  // ── BATMAN & DC ICONS ──
  "batman": {
    term: "Batman (The Dark Knight Genesis)",
    slug: "batman",
    category: "Canonical Lore & Character IP",
    definition: "Billionaire industrialist Bruce Wayne who dedicated his life to waging a relentless war on Gotham City crime following the murder of his parents.",
    translation: "First appearing in Detective Comics #27 (May 1939), Batman is the single most valuable and enduring character property in comic history.",
    type: "character",
    universe: "DC UNIVERSE",
    role: "The Caped Crusader & World's Greatest Detective",
    creators: "Bob Kane, Bill Finger",
    firstAppearance: "Detective Comics #27 (May 1939)",
    url: "/catalog?q=Batman",
  },
  "the joker": {
    term: "The Joker (Clown Prince of Crime)",
    slug: "the-joker",
    category: "Canonical Lore & Character IP",
    definition: "Batman's greatest and most chaotic adversary, restored to terrifying psychological realism by Denny O'Neil and Neal Adams in Batman #251.",
    translation: "Batman #251 stands as the quintessential Bronze Age Joker milestone, commanding massive collector demand for its classic Neal Adams cover.",
    type: "character",
    universe: "DC UNIVERSE",
    role: "Harlequin of Hate & Batman's Arch-Nemesis",
    creators: "Bill Finger, Bob Kane, Jerry Robinson",
    firstAppearance: "Batman #1 (Spring 1940)",
    url: "/catalog?q=Joker",
  },
  "neal adams": {
    term: "Neal Adams (Photorealistic Comic Pioneer)",
    slug: "neal-adams",
    category: "Creator Retrospective",
    definition: "Revolutionary artist whose cinematic realism, dynamic anatomy, and gritty atmosphere rescued Batman from 1960s camp and revitalized Green Lantern.",
    translation: "Adams' covers (Batman #227, #251, Green Lantern #76, X-Men #56-65) command premier artist pedigree valuations.",
    type: "creator",
    universe: "DC / Marvel Bullpen",
    role: "Revolutionary Artist & Creator Rights Champion",
    url: "/catalog?q=Neal+Adams",
  },
  "superman": {
    term: "Superman (The Archetype of Superheroism)",
    slug: "superman",
    category: "Canonical Lore & Character IP",
    definition: "Kal-El of Krypton, rocketed to Earth as an infant and raised in Smallville as Clark Kent, wielding superhuman powers in defense of truth and justice.",
    translation: "Action Comics #1 (June 1938) created the entire comic book industry; high-grade pedigree copies hold world auction records at $6,000,000+.",
    type: "character",
    universe: "DC UNIVERSE",
    role: "Man of Steel & Premier Superhero",
    creators: "Jerry Siegel, Joe Shuster",
    firstAppearance: "Action Comics #1 (June 1938)",
    url: "/catalog?q=Superman",
  },

  // ── INCREDIBLE HULK #377 CANONICAL ENTITIES ──
  "bruce banner": {
    term: "Dr. Robert Bruce Banner",
    slug: "bruce-banner",
    category: "Canonical Lore & Character IP",
    definition: "Brilliant nuclear physicist whose exposure to gamma radiation caused him to transform into monstrous avatars of his repressed childhood trauma.",
    translation: "Anchor protagonist of the Hulk franchise. Key milestone issues addressing his Dissociative Identity Disorder (e.g. #312, #377) command major historical premiums.",
    type: "character",
    universe: "MARVEL UNIVERSE (EARTH-616)",
    role: "Nuclear Physicist & Host of the Hulk Personas",
    url: "/catalog?q=Bruce+Banner",
  },
  "hulk": {
    term: "The Incredible Hulk (Green Goliath / Savage Hulk)",
    slug: "hulk",
    category: "Canonical Lore & Character IP",
    definition: "The primal, childlike manifestation of Bruce Banner's rage and defensive terror, possessing limitless strength scaled to his emotional fury.",
    translation: "A foundational cornerstone of the Marvel brand with multi-billion dollar cinematic, streaming, and merchandising market presence.",
    type: "character",
    universe: "MARVEL UNIVERSE (EARTH-616)",
    role: "Founding Avenger & Emerald Behemoth",
    url: "/catalog?q=Hulk",
  },
  "doc samson": {
    term: "Doc Samson (Dr. Leonard Samson)",
    slug: "doc-samson",
    category: "Canonical Lore & Character IP",
    definition: "Prominent gamma-enhanced psychiatrist and superhero with emerald hair, who dedicated his medical career to psychoanalyzing and curing Bruce Banner.",
    translation: "Key supporting character whose pivotal therapy sessions in Incredible Hulk #377 engineered the milestone debut of the integrated Professor Hulk.",
    type: "character",
    universe: "MARVEL UNIVERSE (EARTH-616)",
    role: "Psychiatrist & Superhuman Gamma Ally",
    url: "/catalog?q=Doc+Samson",
  },
  "ringmaster": {
    term: "Ringmaster (Maynard Tiboldt)",
    slug: "ringmaster",
    category: "Canonical Lore & Character IP",
    definition: "Former leader of the Circus of Crime who wields a hypnotic disk embedded in his top hat. In #377, he assists Doc Samson as a reformed therapist.",
    translation: "Classic Marvel villain whose mind-control apparatus served as the catalyst allowing Samson and Banner to enter the psychic Hulkscape.",
    type: "character",
    universe: "MARVEL UNIVERSE (EARTH-616)",
    role: "Reformed Hypnotist & Circus of Crime Founder",
    url: "/catalog?q=Ringmaster",
  },
  "betty banner": {
    term: "Betty Ross Banner (Red Harpy)",
    slug: "betty-banner",
    category: "Canonical Lore & Character IP",
    definition: "Daughter of General Thaddeus 'Thunderbolt' Ross and the enduring love of Bruce Banner's life, later transformed into Harpy and Red She-Hulk.",
    translation: "Primary emotional anchor of the Incredible Hulk mythos; her poignant confrontation with Marlo in #377's waiting room highlights the tragedy of Banner's psyches.",
    type: "character",
    universe: "MARVEL UNIVERSE (EARTH-616)",
    role: "Wife of Bruce Banner & Emotional Fulcrum",
    url: "/catalog?q=Betty+Ross",
  },
  "rick jones": {
    term: "Rick Jones (Whisperer / A-Bomb)",
    slug: "rick-jones",
    category: "Canonical Lore & Character IP",
    definition: "The civilian teenager Bruce Banner saved from the gamma bomb test blast, serving as sidekick to Hulk, Captain America, and Captain Marvel.",
    translation: "The literal catalyst of the entire Marvel Age of Comics; present at every major turning point in Hulk continuity.",
    type: "character",
    universe: "MARVEL UNIVERSE (EARTH-616)",
    role: "Honorary Avenger & Banner's Loyal Companion",
    url: "/catalog?q=Rick+Jones",
  },
  "marlo chandler": {
    term: "Marlo Chandler",
    slug: "marlo-chandler",
    category: "Canonical Lore & Character IP",
    definition: "Las Vegas aerobics instructor who became the romantic partner of Gray Hulk persona 'Joe Fixit', and later married Rick Jones.",
    translation: "Integral character during Peter David's legendary 12-year run, embodying the Las Vegas gangster era of Hulk continuity.",
    type: "character",
    universe: "MARVEL UNIVERSE (EARTH-616)",
    role: "Las Vegas Confidante & Wife of Rick Jones",
    url: "/catalog?q=Marlo+Chandler",
  },
  "brian banner": {
    term: "Brian Banner (Abusive Father Trauma)",
    slug: "brian-banner",
    category: "Canonical Lore & Character IP",
    definition: "Alcoholic nuclear physicist and abusive father of Bruce Banner, who murdered Bruce's mother Rebecca and manifested as the monstrous Guilt Hulk.",
    translation: "The psychological root source of Bruce Banner's fractured psyche and rage, whose defeat in #377 enabled the personality integration.",
    type: "character",
    universe: "MARVEL UNIVERSE (EARTH-616)",
    role: "Antagonist & Psychological Trauma Manifestation",
    url: "/catalog?q=Brian+Banner",
  },
  "rebecca banner": {
    term: "Rebecca Banner",
    slug: "rebecca-banner",
    category: "Canonical Lore & Character IP",
    definition: "Bruce Banner's loving, protective mother who was murdered by Brian Banner when trying to escape with young Bruce.",
    translation: "Her maternal spirit appears at the climax of #377, urging the Savage, Gray, and Bruce personas to stop fighting and unite.",
    type: "character",
    universe: "MARVEL UNIVERSE (EARTH-616)",
    role: "Mother of Bruce Banner & Spiritual Catalyst",
    url: "/catalog?q=Rebecca+Banner",
  },
  "joe fixit": {
    term: "Joe Fixit (Gray Hulk)",
    slug: "joe-fixit",
    category: "Canonical Lore & Character IP",
    definition: "The shrewd, cunning, morally ambiguous Gray Hulk persona who worked as an enforcer in Las Vegas casinos.",
    translation: "A fan-favorite incarnation created by Peter David that commands dedicated collector interest across late 1980s issues.",
    type: "character",
    universe: "MARVEL UNIVERSE (EARTH-616)",
    role: "Gray Hulk Casino Enforcer Persona",
    url: "/catalog?q=Joe+Fixit",
  },
  "professor hulk": {
    term: "Professor Hulk (Merged / Integrated Hulk)",
    slug: "professor-hulk",
    category: "Canonical Lore & Character IP",
    definition: "The groundbreaking synthesis of Bruce Banner's intellect, Gray Hulk's cunning, and Savage Hulk's size, debuting in Incredible Hulk #377.",
    translation: "The premier modern Hulk key milestone, inspiring the Marvel Cinematic Universe portrayal in Avengers: Endgame and commanding strong 9.8 liquidity.",
    type: "character",
    universe: "MARVEL UNIVERSE (EARTH-616)",
    role: "Merged Emerald Titan & Pantheon Leader",
    url: "/catalog?q=Incredible+Hulk+377",
  },

  // ── SENSATIONAL SHE-HULK #34 CANONICAL ENTITIES ──
  "louise mason": {
    term: "Louise 'Weezi' Mason (The Blonde Phantom)",
    slug: "louise-mason",
    category: "Canonical Lore & Character IP",
    definition: "Golden Age heroine 'The Blonde Phantom' (debuting in 1946) who re-emerged in the Modern Age as Jen Walters' wise-cracking legal secretary and loyal confidante.",
    translation: "Historic connective tissue linking Timely Comics 1940s heroines to John Byrne's fourth-wall breaking meta-satire.",
    type: "character",
    universe: "MARVEL UNIVERSE (EARTH-616)",
    role: "Former Blonde Phantom & Executive Secretary",
    url: "/catalog?q=Louise+Mason",
  },
  "black talon": {
    term: "Black Talon (Samuel D. Barone)",
    slug: "black-talon",
    category: "Canonical Lore & Antagonist Roster",
    definition: "Occult sorcerer and bokor who reanimates the dead using dark voodoo talismans, frequently clashing with the Avengers, Doctor Voodoo, and She-Hulk.",
    translation: "The mastermind behind the Unliving X-Humed in Sensational She-Hulk #34, manipulating mutant corpses in New Orleans.",
    type: "character",
    universe: "MARVEL UNIVERSE (EARTH-616)",
    role: "Voodoo Necromancer & Cult Leader",
    url: "/catalog?q=Black+Talon",
  },
  "x-humed": {
    term: "The Unliving X-Humed",
    slug: "x-humed",
    category: "Canonical Lore & Team IP",
    definition: "Macabre strike force of deceased mutants resurrected by Black Talon via mystic jamba sticks, comprising Changeling, Living Diamond, Harry Leland, and Scaleface.",
    translation: "Debuted in Sensational She-Hulk #34; represents an innovative reuse of classic Bronze and Silver Age X-Men villain continuity.",
    type: "character",
    universe: "MARVEL UNIVERSE (EARTH-616)",
    role: "Resurrected Mutant Strike Force",
    url: "/catalog?q=X-Humed",
  },
  "demi moore vanity fair parody": {
    term: "Vanity Fair Demi Moore Cover Homage",
    slug: "demi-moore-vanity-fair-parody",
    category: "Pop-Culture Satire & Cover Lore",
    definition: "Iconic cover parody of Annie Leibovitz's August 1991 Vanity Fair portrait of pregnant Demi Moore (then expecting Bruce Willis' baby), with She-Hulk holding a green beach ball with the caption 'It's not fair to accuse me of vanity! I just thrive on controversy!'",
    translation: "A defining pop-cultural milestone of the Copper Age, driving substantial collector demand, CGC 9.8 scarcity, and pop-art market appreciation.",
    type: "lexicon",
    url: "/lexicon?term=demi-moore-vanity-fair-parody",
  },
  "beach ball controversy cover": {
    term: "The Green Beach Ball Controversy Cover",
    slug: "beach-ball-controversy-cover",
    category: "Pop-Culture Satire & Cover Lore",
    definition: "John Byrne's tongue-in-cheek fourth-wall breaking visual satire substituting Demi Moore's pregnancy bump with an inflated green beach ball, poking fun at 1991 newsstand censorship controversies.",
    translation: "One of the most instantly recognizable comic covers of the 1990s, driving a high raw-to-9.8 price multiple and collector priority.",
    type: "lexicon",
    url: "/lexicon?term=beach-ball-controversy-cover",
  },

  // ── KEY CREATORS ──
  "renee witterstaetter": {
    term: "Renée Witterstaetter (Editor, Publisher & Colorist)",
    slug: "renee-witterstaetter",
    category: "Creator Retrospective",
    definition: "Esteemed comic editor and writer who edited John Byrne's Sensational She-Hulk, Conan the Barbarian, and numerous landmark Marvel crossover publications.",
    translation: "Guided Byrne's meta-humor She-Hulk run into a major critical and commercial success, frequently appearing in the book as an in-story editorial character.",
    type: "creator",
    universe: "MARVEL COMICS",
    role: "Senior Marvel Editor & Story Coordinator",
    url: "/catalog?q=Renee+Witterstaetter",
  },
  "tom defalco": {
    term: "Tom DeFalco (Marvel Editor-in-Chief & Spider-Girl Creator)",
    slug: "tom-defalco",
    category: "Creator Retrospective",
    definition: "Marvel Comics' 10th Editor-in-Chief (1987–1994) who oversaw the 1990s comic boom, Infinity Gauntlet, and author of landmark Amazing Spider-Man and Thor runs.",
    translation: "Helmed the most commercially expansive publishing era in Marvel history, greenlighting creator-driven initiatives like Byrne's She-Hulk.",
    type: "creator",
    universe: "MARVEL COMICS",
    role: "Marvel Editor-in-Chief & Writer",
    url: "/catalog?q=Tom+DeFalco",
  },
  "peter david": {
    term: "Peter David (Auteur Writer & Architect of Modern Hulk)",
    slug: "peter-david",
    category: "Creator Retrospective",
    definition: "Acclaimed writer who helmed The Incredible Hulk for an unprecedented 12-year tenure (#331–467), pioneering psychological depth in superhero fiction.",
    translation: "Authored milestone canonical runs on Hulk, X-Factor, Spider-Man 2099, and Supergirl, anchoring decades of premium back-issue value.",
    type: "creator",
    universe: "MARVEL COMICS",
    role: "Head Writer & Comic Book Hall of Fame Inductee",
    url: "/catalog?q=Peter+David",
  },
  "dale keown": {
    term: "Dale Keown (Master Comic Penciler & Pitt Creator)",
    slug: "dale-keown",
    category: "Creator Retrospective",
    definition: "Legendary Canadian comic book illustrator whose dynamic, hyper-detailed pencils on Incredible Hulk (#367–398) redefined the visual standard for the character.",
    translation: "Co-creator of the iconic neon-green cover of Incredible Hulk #377, one of the most widely recognized and collected covers of the 1990s.",
    type: "creator",
    universe: "MARVEL & IMAGE COMICS",
    role: "Master Penciler & Co-Creator of Pitt",
    url: "/catalog?q=Dale+Keown",
  },
  "bob mcleod": {
    term: "Bob McLeod (Master Inker & New Mutants Co-Creator)",
    slug: "bob-mcleod",
    category: "Creator Retrospective",
    definition: "Veteran comic artist and inker who co-created The New Mutants with Chris Claremont and inked Dale Keown on Incredible Hulk #377.",
    translation: "His crisp, organic brushwork defined high-end Bronze and Modern Age Marvel aesthetics.",
    type: "creator",
    universe: "MARVEL COMICS",
    role: "Co-Creator of New Mutants & Master Inker",
    url: "/catalog?q=Bob+McLeod",
  },
  "rick parker": {
    term: "Rick Parker (Master Letterer & Artist)",
    slug: "rick-parker",
    category: "Creator Retrospective",
    definition: "Legendary Marvel letterer who lettered Todd McFarlane's historic run on Amazing Spider-Man and Spider-Man #1 (1990), known for expressive typography and visceral sound effects.",
    translation: "His dynamic hand-lettered SFX ('DOOM DOOM DOOM', 'THWIP') defined the sensory aesthetic of Copper Age Marvel keys.",
    type: "creator",
    universe: "MARVEL COMICS",
    role: "Master Letterer & Cartoonist",
    url: "/catalog?q=Rick+Parker",
  },
  "bob sharen": {
    term: "Bob Sharen (Prolific Master Colorist)",
    slug: "bob-sharen",
    category: "Creator Retrospective",
    definition: "Marvel's premier Copper Age color artist who colored over 1,500 comic issues, including Todd McFarlane's Spider-Man #1 and Amazing Spider-Man #298–328.",
    translation: "Crafted the vibrant, neon-drenched chromatic palette that set the standard for modern comic art production.",
    type: "creator",
    universe: "MARVEL COMICS",
    role: "Master Colorist",
    url: "/catalog?q=Bob+Sharen",
  },
  "jim salicrup": {
    term: "Jim Salicrup (Senior Marvel Editor & Visionary)",
    slug: "jim-salicrup",
    category: "Creator Retrospective",
    definition: "Acclaimed Marvel editor who orchestrated the late 1980s and early 1990s Spider-Man renaissance, greenlighting Todd McFarlane's solo Spider-Man launch.",
    translation: "Guided the Spider-Man office to historic circulation heights, transforming back-issue collector interest into a multi-million copy speculative phenomenon.",
    type: "creator",
    universe: "MARVEL COMICS",
    role: "Senior Editor & Publisher",
    url: "/catalog?q=Jim+Salicrup",
  },
  "calypso": {
    term: "Calypso Ezili (Voodoo Priestess & Occult Mastermind)",
    slug: "calypso",
    category: "Canonical Lore & Character IP",
    definition: "A psychopathic Haitian voodoo priestess and lover of Kraven the Hunter. In 'Torment', she uses blood rituals and mystic drums to resurrect the Lizard as a mindless zombie predator.",
    translation: "The occult catalyst behind Spider-Man #1 (1990), orchestrating one of the darkest psychological storylines in Spider-Man publishing history.",
    type: "character",
    universe: "MARVEL UNIVERSE",
    role: "Voodoo Priestess, Necromancer & Kraven's Companion",
    url: "/catalog?q=Calypso",
  },
  "the lizard": {
    term: "The Lizard (Dr. Curtis Connors)",
    slug: "the-lizard",
    category: "Canonical Lore & Character IP",
    definition: "Brilliant geneticist Dr. Curt Connors, who synthesized a reptilian limb-regeneration serum that periodically transforms him into the cold-blooded reptilian predator known as The Lizard.",
    translation: "A tragic foundational Ditko/Lee villain from Amazing Spider-Man #6 whose appearance in Spider-Man #1 (1990) drove historic crossover collector interest.",
    type: "character",
    universe: "MARVEL UNIVERSE",
    role: "Foundational Spider-Man Rogues Gallery Member",
    url: "/catalog?q=Lizard",
  },
  "torment": {
    term: "Torment (Legendary 1990 5-Part Storyline)",
    slug: "torment",
    category: "Market Distortions & Seller Psychology",
    definition: "The dark, atmospheric 5-part storyline launching Spider-Man #1–5 written and illustrated by Todd McFarlane, pitting Spider-Man against a mindless Lizard driven mad by Calypso's voodoo drums.",
    translation: "The premier storytelling event of 1990 that catalyzed the speculator boom and proved superstar artists could self-author bestselling flagship titles.",
    type: "lexicon",
    url: "/lexicon?term=torment",
  },
  "silver edition": {
    term: "Spider-Man #1 Silver Web Edition",
    slug: "silver-edition",
    category: "Grading & Registry Standard",
    definition: "The iconic metallic silver web variant of Spider-Man #1 (1990) released in polybagged and unbagged formats, establishing the multi-cover variant era in modern comics.",
    translation: "One of the most frequently certified and traded Copper Age slabs in CGC 9.8, representing a bedrock liquidity anchor.",
    type: "lexicon",
    url: "/lexicon?term=silver-edition",
  },
  "platinum edition": {
    term: "Spider-Man #1 Platinum Web Incentive Edition",
    slug: "platinum-edition",
    category: "Grading & Registry Standard",
    definition: "The rare 1:100 retailer incentive variant of Spider-Man #1 (1990) distributed by Diamond Comics with an estimated print run of ~10,000 copies.",
    translation: "The ultimate modern grail for Spider-Man collectors, commanding high-four-figure valuations in CGC 9.8 at premier auction houses.",
    type: "lexicon",
    url: "/lexicon?term=platinum-edition",
  },
  "larry hama": {
    term: "Larry Hama (Auteur Writer & Conceptual Architect)",
    slug: "larry-hama",
    category: "Creator Retrospective",
    definition: "Legendary comic writer, artist, and military veteran who authored G.I. Joe: A Real American Hero #1–155 for Marvel Comics.",
    translation: "Hama wrote detailed character filecards and infused the series with grounded military realism, creating one of the most enduring commercial franchises in toy and comic history.",
    type: "creator",
    universe: "MARVEL COMICS / HASBRO",
    role: "Head Writer, Editor & World-Builder",
    url: "/catalog?q=Larry+Hama",
  },
  "snake eyes": {
    term: "Snake Eyes (G.I. Joe Commando)",
    slug: "snake-eyes",
    category: "Canonical Lore & Character IP",
    definition: "The enigmatic, silent commando and Arashikage-trained ninja of the G.I. Joe team, created by Larry Hama.",
    translation: "The definitive breakout character and primary commercial IP asset of the G.I. Joe franchise, anchoring decades of evergreen secondary collector demand.",
    type: "character",
    universe: "HASBRO / MARVEL UNIVERSE",
    role: "Covert Special Operations & Arashikage Clan Master Ninja",
    url: "/catalog?q=Snake+Eyes",
  },
  "storm shadow": {
    term: "Storm Shadow (Thomas Arashikage)",
    slug: "storm-shadow",
    category: "Canonical Lore & Character IP",
    definition: "Arashikage clan ninja assassin and bodyguard to Cobra Commander, who shares a tragic past with Snake Eyes.",
    translation: "Co-anchors the legendary Arashikage ninja mythos with Snake Eyes, creating one of the top rivalries in 1980s sequential fiction.",
    type: "character",
    universe: "HASBRO / MARVEL UNIVERSE",
    role: "Arashikage Ninja Master & Cobra Bodyguard",
    url: "/catalog?q=Storm+Shadow",
  },
  "deadpool": {
    term: "Deadpool (Wade Wilson)",
    slug: "deadpool",
    category: "Canonical Lore & Character IP",
    definition: "Wisecracking mercenary with an accelerated healing factor and fourth-wall breaking awareness, created by Fabian Nicieza and Rob Liefeld.",
    translation: "First appearing in New Mutants #98, Deadpool anchors a multi-billion dollar cinematic franchise, making 9.8 copies a staple liquid blue chip.",
    type: "character",
    universe: "MARVEL UNIVERSE",
    role: "Regenerating Degenerate & Mercenary",
    url: "/catalog?q=Deadpool",
  },
  "meriem cooper": {
    term: "Meriem Cooper (Cavewoman)",
    slug: "cavewoman",
    category: "Canonical Lore & Character IP",
    definition: "Superhumanly strong time-displaced survivor living in prehistoric Marshville, Oregon, created and illustrated by Budd Root.",
    translation: "Flagship character of 1990s bad-girl independent creator-owned comics, published through Basement Comics.",
    type: "character",
    universe: "BASEMENT COMICS",
    role: "Primeval Survivor & Dinosaur Hunter",
    url: "/catalog?q=Cavewoman",
  },
  "budd root": {
    term: "Budd Root (Auteur Creator & Illustrator)",
    slug: "budd-root",
    category: "Creator Retrospective",
    definition: "Independent comic creator who founded Basement Comics and wrote and illustrated the cult-favorite Cavewoman series.",
    translation: "Pioneered independent direct-market variant runs that paved the way for modern creator-owned crowdfunding and specialty publishing.",
    type: "creator",
    universe: "BASEMENT COMICS",
    role: "Writer, Artist & Publisher",
    url: "/catalog?q=Budd+Root",
  },
};

/**
 * Interactive text tokenizer: scans string for matching lexicon/lore terms,
 * preserving original case while wrapping matches in interactive glowing pills.
 */
function renderInteractiveText(
  text: string,
  onSelectTerm: (def: TermDefinition) => void
): React.ReactNode[] {
  if (!text) return [];

  // Sort terms by length descending to match multi-word phrases first
  const sortedKeys = Object.keys(WIKI_DICTIONARY).sort((a, b) => b.length - a.length);
  const pattern = new RegExp(
    `\\b(${sortedKeys.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
    "gi"
  );

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    const matchedText = match[0];
    const key = matchedText.toLowerCase();
    const def = WIKI_DICTIONARY[key];

    // Push text before match
    if (match.index > lastIndex) {
      elements.push(text.slice(lastIndex, match.index));
    }

    if (def) {
      const isCharacter = def.type === "character";
      const isCreator = def.type === "creator";

      elements.push(
        <button
          key={`term-${match.index}-${matchedText}`}
          type="button"
          onClick={() => onSelectTerm(def)}
          className={`inline-flex items-center gap-1 mx-1 px-1.5 py-0.2 rounded text-[11px] font-mono font-semibold transition-all duration-150 cursor-pointer ${
            isCharacter
              ? "bg-purple-950/70 border border-purple-400/60 text-purple-200 hover:border-purple-300 hover:bg-purple-900/90 hover:shadow-[0_0_8px_rgba(168,85,247,0.6)]"
              : isCreator
              ? "bg-amber-950/70 border border-amber-400/60 text-amber-200 hover:border-amber-300 hover:bg-amber-900/90 hover:shadow-[0_0_8px_rgba(245,158,11,0.6)]"
              : "bg-cyan-950/70 border border-cyan-400/60 text-cyan-200 hover:border-cyan-300 hover:bg-cyan-900/90 hover:shadow-[0_0_8px_rgba(6,182,212,0.6)]"
          }`}
          title={`Click to inspect definition: ${def.term}`}
        >
          {isCharacter ? (
            <Shield className="h-2.5 w-2.5 text-purple-400 shrink-0" />
          ) : isCreator ? (
            <Sparkles className="h-2.5 w-2.5 text-amber-400 shrink-0" />
          ) : (
            <Coins className="h-2.5 w-2.5 text-cyan-400 shrink-0" />
          )}
          <span>{matchedText}</span>
        </button>
      );
    } else {
      elements.push(matchedText);
    }

    lastIndex = pattern.lastIndex;
  }

  // Push remainder
  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return elements;
}

export function RichContinuityViewer({
  summary,
  whyInvest,
  series,
  issueNumber,
  grade,
  grader,
  fmv,
  storyTitle,
  storyQuote,
  creativeCredits,
  characterRoster,
  synopsisParagraphs,
  fandomUrl,
  fandomUniverse,
  categories,
  notes,
  continuityLinks,
  variantCovers,
}: {
  summary: string;
  whyInvest: string;
  series: string;
  issueNumber: string;
  grade: string;
  grader: string;
  fmv: number;
  storyTitle?: string;
  storyQuote?: { quote: string; speaker: string };
  creativeCredits?: {
    writer?: string;
    penciler?: string;
    inker?: string;
    colorist?: string;
    letterer?: string;
    editor?: string;
    editorInChief?: string;
    coverArtist?: string;
  };
  characterRoster?: {
    featured?: string[];
    supporting?: string[];
    antagonists?: string[];
    other?: string[];
  };
  synopsisParagraphs?: string[];
  fandomUrl?: string;
  fandomUniverse?: string;
  categories?: string[];
  notes?: string[];
  continuityLinks?: ContinuityLinksInfo;
  variantCovers?: VariantCoverInfo[];
}) {
  const [activeDef, setActiveDef] = useState<TermDefinition | null>(null);

  // Derive title if missing
  const effectiveStoryTitle =
    storyTitle || `1. "${series} #${issueNumber}: The Canonical Reckoning"`;

  // Derive paragraphs if missing
  const effectiveParagraphs =
    synopsisParagraphs && synopsisParagraphs.length > 0
      ? synopsisParagraphs
      : summary.split("\n\n").filter(Boolean);

  // Derive tailored governing underwriting & investment terms for this specific lot
  const isKey =
    (categories || []).some((c) => /first appearance|debut|key|origin/i.test(c)) ||
    /#?1\b|#?12\b|#?181\b|#?129\b|#?300\b|#?48\b|#?52\b|#?251\b|#?27\b/i.test(`${series} ${issueNumber}`);
  const isSubFloor = fmv < 85.4;
  const isSovereign98 = grade === "9.8";
  const isHighValue = fmv >= 500;
  const isMidGrade = !isSovereign98 && ["8.0", "8.5", "9.0", "9.2", "9.4", "9.6"].includes(grade);

  const investmentKeys: string[] = [];
  if (isKey) {
    investmentKeys.push("first-appearance-key-issue-premium", "scarcity", "asset-float-scarcity-velocity");
  }
  if (isSubFloor) {
    investmentKeys.push("sunk-cost", "sub-floor dump", "slabbing overhead", "margin-of-safety");
  }
  if (isSovereign98) {
    investmentKeys.push("cgc 9.8", "fair-market-value-fmv-benchmark", "market-capitalization-asset-float-cap");
  }
  if (isMidGrade) {
    investmentKeys.push("grade-compression", "clean & press (cpr)", "bid-ask-spread-fmv-liquidity-spread");
  }
  if (isHighValue) {
    investmentKeys.push("cost-basis-tax-lot-accounting", "unrealized-gain-loss-unrealized-p-l", "liquidity", "pedigree");
  }
  // Baseline indispensable underwriting principles
  investmentKeys.push("price-discovery", "opportunity-cost", "conglomerate-media-catalyst-equity-correlation");

  const governingTerms: TermDefinition[] = [];
  const seenSlugs = new Set<string>();

  for (const k of investmentKeys) {
    const term = WIKI_DICTIONARY[k] || Object.values(WIKI_DICTIONARY).find((d) => d.slug === k);
    if (term && !seenSlugs.has(term.slug)) {
      seenSlugs.add(term.slug);
      governingTerms.push(term);
    }
  }

  // Extract all terms that appear anywhere in text or are governing terms
  const combinedText = `${summary} ${whyInvest} ${effectiveStoryTitle} ${(notes || []).join(" ")}`.toLowerCase();
  const matchedTerms = Object.values(WIKI_DICTIONARY).filter(
    (def) =>
      combinedText.includes(def.term.toLowerCase()) ||
      combinedText.includes(def.slug.replace(/-/g, " "))
  );

  const allTermsMap = new Map<string, TermDefinition>();
  for (const t of [...governingTerms, ...matchedTerms]) {
    allTermsMap.set(t.slug, t);
  }
  const presentTerms = Array.from(allTermsMap.values());

  const lookupEntity = async (name: string, fallbackType: "character" | "creator" | "lexicon" = "character") => {
    const normalized = name.toLowerCase().trim();
    const found = Object.values(WIKI_DICTIONARY).find(
      (d) =>
        d.term.toLowerCase() === normalized ||
        d.term.toLowerCase().includes(normalized) ||
        normalized.includes(d.slug.replace(/-/g, " "))
    );
    if (found) {
      setActiveDef(found);
    } else {
      // Synthesize rich canonical definition depending on context
      let cat = "Canonical Lore & Character IP";
      let def = `Appearing character or continuity entity in ${series} #${issueNumber}.`;
      let trans = `Integral continuity participant anchoring key storylines, character dynamics, and collector appeal.`;
      let role = "Canonical Cast Member";
      let uni = fandomUniverse || `${series.toUpperCase()} CANON`;

      if (fallbackType === "creator") {
        cat = "Creator Retrospective";
        def = `Credited bullpen talent for ${series} #${issueNumber}.`;
        trans = `Creator whose signature aesthetic, scripting, or illustration defined this run's direct-market collectibility.`;
        role = "Bullpen Talent";
      } else if (
        normalized.includes("newsstand") ||
        normalized.includes("barcode") ||
        normalized.includes("direct edition")
      ) {
        cat = "Distribution & Census Float";
        def = `Direct Market specialty shops received customized publisher logo boxes, while retail supermarket spinner racks received commercial UPC barcodes with high unsold return rates.`;
        trans = `Newsstand copies in high grade (CGC 9.8) represent an extreme rarity tier due to spinner rack handling, commands 2x–4x price multipliers over direct editions.`;
        role = "Distribution Channel Standard";
      } else if (
        normalized.includes("copper age") ||
        normalized.includes("bronze age") ||
        normalized.includes("silver age") ||
        normalized.includes("golden age") ||
        normalized.includes("modern")
      ) {
        cat = "Comic Historical Eras";
        def = `Standard industry chronological epoch dividing American comic book publications by production methods, distribution, and cultural themes.`;
        trans = `Determines baseline preservation probability and institutional minimum grade thresholds (e.g. Bronze 8.5+ vs Modern 9.8).`;
        role = "Historical Market Era";
      } else if (normalized.includes("key issues") || normalized.includes("first appearance") || normalized.includes("merged hulk")) {
        cat = "Market Milestones & Debuts";
        def = `Historic landmark issue introducing a seminal character, costume, origin, or permanent continuity status quo alteration.`;
        trans = `Absorbs over 80% of secondary market transactional liquidity, serving as the sovereign store of value in sequential art.`;
        role = "Market Key Milestone";
      } else if (fallbackType === "lexicon") {
        cat = "Investopedia Market Principle";
        def = `Core valuation or market microstructure principle applicable to sequential art underwriting.`;
        trans = `Panel Profits translation: Provides disciplined margin-of-safety boundaries against overpaying secondary market premiums.`;
        role = "Market Microstructure Principle";
      }

      setActiveDef({
        term: name,
        slug: normalized.replace(/[^a-z0-9]+/g, "-"),
        category: cat,
        definition: def,
        translation: trans,
        type: fallbackType,
        universe: uni,
        role,
        url: `/catalog?q=${encodeURIComponent(name)}`,
      });
    }

    // Query 1.8M local Fandom & CBR Lexicon database estate asynchronously
    try {
      const res = await fetch(
        `/api/sniper/wiki-lookup?term=${encodeURIComponent(name)}&type=${fallbackType}&universe=${encodeURIComponent(fandomUniverse || "")}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.found) {
          setActiveDef((prev) => ({
            term: data.term || prev?.term || name,
            slug: data.slug || prev?.slug || normalized.replace(/[^a-z0-9]+/g, "-"),
            category: data.category || prev?.category || "Local Fandom Lore",
            definition: data.definition || prev?.definition || "",
            translation: data.translation || prev?.translation || "",
            type: data.type || prev?.type || fallbackType,
            universe: data.universe || prev?.universe,
            role: data.role || prev?.role,
            creators: data.creators || prev?.creators,
            firstAppearance: data.firstAppearance || prev?.firstAppearance,
            comicExample: data.comicExample || prev?.comicExample,
            canonicalFormula: data.canonicalFormula || prev?.canonicalFormula,
            url: data.url || prev?.url || `/catalog?q=${encodeURIComponent(name)}`,
          }));
        }
      }
    } catch {
      // Keep optimistic entry if offline
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. FANDOM WIKI HEADER & CANONICAL STORYLINE DOSSIER */}
      <div className="relative rounded-xl border-2 border-purple-500 bg-gradient-to-r from-[#140726] via-[#0B0316] to-[#140726] p-6 shadow-[0_0_0_1px_rgba(192,132,252,1),0_0_16px_rgba(168,85,247,0.85),inset_0_1px_2px_rgba(255,255,255,0.35)] ring-1 ring-purple-300/60 space-y-5">
        <div className="absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-transparent via-purple-300 to-transparent shadow-[0_0_12px_rgba(168,85,247,1)]" />

        {/* Fandom Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/30 pb-3">
          <div className="flex items-center gap-2.5">
            <BookOpen className="h-5 w-5 text-purple-400 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-purple-300/90 font-bold block">
                  {fandomUniverse || "Marvel Universe (Earth-616)"} · Issue Continuity
                </span>
                {fandomUrl && (
                  <a
                    href={fandomUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-cyan-400 hover:text-cyan-200 hover:underline"
                  >
                    <span>Fandom Wiki</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}
              </div>
              <h3 className="text-lg font-mono font-black text-white tracking-wide">
                {effectiveStoryTitle}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold uppercase tracking-wider">
              {series} #{issueNumber} · {grader} {grade}
            </span>
            <span className="text-[10px] font-mono px-2 py-1 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 font-bold">
              ${fmv} FMV
            </span>
          </div>
        </div>

        {/* Iconic Story Quote Callout (if available) */}
        {storyQuote && (
          <div className="rounded-lg bg-black/50 border border-purple-400/40 p-3.5 flex items-start gap-3 shadow-[inset_0_1px_4px_rgba(0,0,0,0.6)]">
            <Quote className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-serif italic text-purple-100 font-medium">
                &ldquo;{storyQuote.quote}&rdquo;
              </p>
              <span className="text-[10px] font-mono text-purple-300 block mt-1 tracking-wider uppercase">
                — {storyQuote.speaker}
              </span>
            </div>
          </div>
        )}

        {/* Creative Credits Bar */}
        {creativeCredits && (
          <div className="rounded-lg bg-purple-950/40 border border-purple-500/30 p-3 space-y-1.5 font-mono text-xs">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-purple-300 font-bold">
              <Feather className="h-3.5 w-3.5 text-purple-400" />
              <span>Issue Creative Credits (Tap to Inspect)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
              {creativeCredits.writer && (
                <div>
                  <span className="text-[9px] text-slate-400 block">Writer(s):</span>
                  <button
                    type="button"
                    onClick={() => lookupEntity(creativeCredits.writer!, "creator")}
                    className="text-purple-200 font-semibold hover:text-purple-100 hover:underline cursor-pointer text-left"
                  >
                    {creativeCredits.writer}
                  </button>
                </div>
              )}
              {creativeCredits.penciler && (
                <div>
                  <span className="text-[9px] text-slate-400 block">Penciler(s):</span>
                  <button
                    type="button"
                    onClick={() => lookupEntity(creativeCredits.penciler!, "creator")}
                    className="text-purple-200 font-semibold hover:text-purple-100 hover:underline cursor-pointer text-left"
                  >
                    {creativeCredits.penciler}
                  </button>
                </div>
              )}
              {creativeCredits.inker && (
                <div>
                  <span className="text-[9px] text-slate-400 block">Inker(s):</span>
                  <button
                    type="button"
                    onClick={() => lookupEntity(creativeCredits.inker!, "creator")}
                    className="text-purple-200 font-semibold hover:text-purple-100 hover:underline cursor-pointer text-left"
                  >
                    {creativeCredits.inker}
                  </button>
                </div>
              )}
              {creativeCredits.editor && (
                <div>
                  <span className="text-[9px] text-slate-400 block">Editor(s):</span>
                  <button
                    type="button"
                    onClick={() => lookupEntity(creativeCredits.editor!, "creator")}
                    className="text-purple-200 font-semibold hover:text-purple-100 hover:underline cursor-pointer text-left"
                  >
                    {creativeCredits.editor}
                  </button>
                </div>
              )}
              {creativeCredits.coverArtist && (
                <div>
                  <span className="text-[9px] text-slate-400 block">Cover Artist(s):</span>
                  <button
                    type="button"
                    onClick={() => lookupEntity(creativeCredits.coverArtist!, "creator")}
                    className="text-purple-200 font-semibold hover:text-purple-100 hover:underline cursor-pointer text-left"
                  >
                    {creativeCredits.coverArtist}
                  </button>
                </div>
              )}
              {creativeCredits.colorist && (
                <div>
                  <span className="text-[9px] text-slate-400 block">Colorist(s):</span>
                  <button
                    type="button"
                    onClick={() => lookupEntity(creativeCredits.colorist!, "creator")}
                    className="text-purple-200 font-semibold hover:text-purple-100 hover:underline cursor-pointer text-left"
                  >
                    {creativeCredits.colorist}
                  </button>
                </div>
              )}
              {creativeCredits.letterer && (
                <div>
                  <span className="text-[9px] text-slate-400 block">Letterer(s):</span>
                  <button
                    type="button"
                    onClick={() => lookupEntity(creativeCredits.letterer!, "creator")}
                    className="text-purple-200 font-semibold hover:text-purple-100 hover:underline cursor-pointer text-left"
                  >
                    {creativeCredits.letterer}
                  </button>
                </div>
              )}
              {creativeCredits.editorInChief && (
                <div>
                  <span className="text-[9px] text-slate-400 block">Editor-in-Chief:</span>
                  <button
                    type="button"
                    onClick={() => lookupEntity(creativeCredits.editorInChief!, "creator")}
                    className="text-purple-200 font-semibold hover:text-purple-100 hover:underline cursor-pointer text-left"
                  >
                    {creativeCredits.editorInChief}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Appearing Characters Roster (Categorized Directory) */}
        {characterRoster && (
          <div className="space-y-2 font-mono text-xs border-t border-purple-500/20 pt-3">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-cyan-400 font-bold">
              <Users className="h-3.5 w-3.5 text-cyan-400" />
              <span>Appearing Characters &amp; Continuity Entities (Tap to Inspect)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              {characterRoster.featured && characterRoster.featured.length > 0 && (
                <div className="p-2 rounded bg-black/40 border border-purple-500/30">
                  <span className="text-[9px] text-purple-400 uppercase font-bold block mb-1">
                    ✦ Featured Characters
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {characterRoster.featured.map((name) => (
                      <button
                        type="button"
                        key={name}
                        onClick={() => lookupEntity(name, "character")}
                        className="px-1.5 py-0.5 rounded bg-purple-900/40 border border-purple-400/40 text-purple-200 hover:border-purple-300 hover:text-white text-[10px] transition-colors cursor-pointer"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {characterRoster.supporting && characterRoster.supporting.length > 0 && (
                <div className="p-2 rounded bg-black/40 border border-cyan-500/30">
                  <span className="text-[9px] text-cyan-400 uppercase font-bold block mb-1">
                    ✦ Supporting Cast
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {characterRoster.supporting.map((name) => (
                      <button
                        type="button"
                        key={name}
                        onClick={() => lookupEntity(name, "character")}
                        className="px-1.5 py-0.5 rounded bg-cyan-900/40 border border-cyan-400/40 text-cyan-200 hover:border-cyan-300 hover:text-white text-[10px] transition-colors cursor-pointer"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {characterRoster.antagonists && characterRoster.antagonists.length > 0 && (
                <div className="p-2 rounded bg-black/40 border border-rose-500/30">
                  <span className="text-[9px] text-rose-400 uppercase font-bold block mb-1">
                    ✦ Antagonists / Adversaries
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {characterRoster.antagonists.map((name) => (
                      <button
                        type="button"
                        key={name}
                        onClick={() => lookupEntity(name, "character")}
                        className="px-1.5 py-0.5 rounded bg-rose-900/40 border border-rose-400/40 text-rose-200 hover:border-rose-300 hover:text-white text-[10px] transition-colors cursor-pointer"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {characterRoster.other && characterRoster.other.length > 0 && (
                <div className="p-2 rounded bg-black/40 border border-amber-500/30">
                  <span className="text-[9px] text-amber-400 uppercase font-bold block mb-1">
                    ✦ Lore Debuts &amp; Flashbacks
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {characterRoster.other.map((name) => (
                      <button
                        type="button"
                        key={name}
                        onClick={() => lookupEntity(name, "character")}
                        className="px-1.5 py-0.5 rounded bg-amber-900/40 border border-amber-400/40 text-amber-200 hover:border-amber-300 hover:text-white text-[10px] transition-colors cursor-pointer"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chronological Issue Continuum Bar */}
        {continuityLinks && (
          <div className="rounded-lg bg-black/40 border border-purple-500/30 p-3.5 space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-purple-300 font-bold border-b border-purple-500/20 pb-1.5">
              <div className="flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-purple-400" />
                <span>Canonical Issue Continuum &amp; Timeline</span>
              </div>
              <span className="text-slate-400 text-[9px]">Sequential Chronology</span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
              {continuityLinks.precededBy ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-950/50 border border-purple-500/30 text-purple-300">
                  <ArrowLeft className="h-3 w-3 text-purple-400" />
                  <span className="text-[9px] text-slate-400">Preceded by:</span>
                  <button
                    type="button"
                    onClick={() => lookupEntity(continuityLinks.precededBy!.title, "lexicon")}
                    className="font-bold text-purple-200 hover:text-white hover:underline cursor-pointer"
                  >
                    {continuityLinks.precededBy.title}
                  </button>
                </div>
              ) : (
                <div className="text-[10px] text-slate-500">◀ Series Genesis</div>
              )}

              <div className="px-3 py-1 rounded-md bg-purple-900/80 border border-purple-400/80 text-white font-bold text-xs shadow-[0_0_8px_rgba(168,85,247,0.5)]">
                CURRENT: {series} #{issueNumber}
              </div>

              {continuityLinks.succeededBy ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-950/50 border border-purple-500/30 text-purple-300">
                  <span className="text-[9px] text-slate-400">Succeeded by:</span>
                  <button
                    type="button"
                    onClick={() => lookupEntity(continuityLinks.succeededBy!.title, "lexicon")}
                    className="font-bold text-purple-200 hover:text-white hover:underline cursor-pointer"
                  >
                    {continuityLinks.succeededBy.title}
                  </button>
                  <ArrowRight className="h-3 w-3 text-purple-400" />
                </div>
              ) : (
                <div className="text-[10px] text-slate-500">Run Conclusion ▶</div>
              )}
            </div>

            {continuityLinks.milestones && continuityLinks.milestones.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-purple-500/20">
                <span className="text-[9px] text-slate-400 uppercase font-bold">Key Milestones:</span>
                {continuityLinks.milestones.map((m, idx) => (
                  <span
                    key={`mile-${idx}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-200 text-[10px] font-semibold"
                  >
                    <Sparkles className="h-2.5 w-2.5 text-amber-400" />
                    <span>{m}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Variant Covers & Graded Census Float Directory */}
        {variantCovers && variantCovers.length > 0 && (
          <div className="rounded-lg bg-black/50 border border-cyan-500/30 p-3.5 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-cyan-300 font-bold">
                <Layers className="h-4 w-4 text-cyan-400" />
                <span>Variant Covers, Printings &amp; Graded Float Registry</span>
              </div>
              <span className="text-[10px] text-slate-400">
                {variantCovers.length} Cataloged Print Tiers
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {variantCovers.map((variant, idx) => {
                const isNewsstand = variant.type === "Newsstand";
                const isFoilOrVirgin = variant.type === "Foil" || variant.type === "Virgin";
                const isRare = variant.rarityTier === "Very Scarce" || variant.rarityTier === "Grail" || variant.rarityTier === "Very Rare";
                return (
                  <div
                    key={`variant-${idx}`}
                    className={`rounded-lg border p-2.5 space-y-1.5 transition-all ${
                      isNewsstand
                        ? "bg-amber-950/30 border-amber-500/40 hover:border-amber-400"
                        : isFoilOrVirgin
                        ? "bg-purple-950/30 border-purple-500/40 hover:border-purple-400"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-bold text-white truncate">
                        {variant.name}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          isRare
                            ? "bg-rose-950/80 text-rose-300 border border-rose-500/40"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {variant.rarityTier || "Standard"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-300">
                      <span>Type: <strong className="text-cyan-300">{variant.type}</strong></span>
                      {variant.estMultiplierVsDirect && variant.estMultiplierVsDirect > 1 && (
                        <span className="text-emerald-400 font-bold">
                          {variant.estMultiplierVsDirect}x Direct Multiplier
                        </span>
                      )}
                    </div>

                    {variant.upcBarcode && (
                      <div className="text-[9px] text-slate-400 font-mono truncate">
                        Barcode: <span className="text-slate-200">{variant.upcBarcode}</span>
                      </div>
                    )}

                    {variant.censusFloatNotes && (
                      <p className="text-[10px] font-sans text-slate-300/90 leading-tight pt-1 border-t border-white/5">
                        {variant.censusFloatNotes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="rounded bg-cyan-950/30 border border-cyan-500/20 p-2 text-[10px] font-sans text-cyan-200/90 leading-relaxed">
              💡 <strong>Underwriting Float Rule:</strong> 1980s–1990s newsstand copies suffered high spinner-rack damage, resulting in up to 90%+ fewer CGC 9.8 graded copies than preserved direct market copies. Modern retailer incentive foils and virgins carry strict order ratios (1:25, 1:50) that artificially restrict top-grade float.
            </div>
          </div>
        )}

        {/* Scene-by-Scene Narrative Synopsis */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-purple-300">
            <span className="font-bold">Narrative Continuity Synopsis</span>
            <span className="text-slate-400">{effectiveParagraphs.length} Sequential Scenes</span>
          </div>

          <div className="space-y-3 text-xs font-sans text-slate-300 leading-relaxed">
            {effectiveParagraphs.map((paraText, idx) => (
              <div
                key={`scene-${idx}`}
                className="p-3.5 rounded-lg border border-purple-500/20 bg-purple-950/20 hover:border-purple-500/40 transition-colors space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.2 rounded bg-purple-900/60 text-[9px] font-mono font-bold text-purple-300 uppercase">
                    Scene {idx + 1}
                  </span>
                </div>
                <div className="font-sans leading-relaxed text-slate-200">
                  {renderInteractiveText(
                    paraText
                      .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, "")
                      .replace(/<ref[^>]*\/>/gi, "")
                      .replace(/<!--[\s\S]*?-->/gi, "")
                      .trim(),
                    setActiveDef
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Canonical Notes, Trivia & Continuity Callbacks */}
        {notes && notes.length > 0 && (
          <div className="rounded-lg bg-black/40 border border-purple-500/30 p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-purple-500/30 pb-2">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-purple-300 font-bold">
                <Bookmark className="h-4 w-4 text-purple-400" />
                <span>Canonical Notes, Trivia &amp; Continuity Callbacks</span>
              </div>
              <span className="text-[10px] text-slate-400">{notes.length} Recorded Entries</span>
            </div>

            <div className="space-y-2">
              {notes.map((noteText, idx) => (
                <div
                  key={`note-${idx}`}
                  className="flex items-start gap-2.5 text-xs font-sans text-slate-200 leading-relaxed bg-purple-950/20 p-2.5 rounded-md border border-purple-500/20"
                >
                  <span className="text-purple-400 font-bold font-mono text-[11px] shrink-0 mt-0.5">
                    #{idx + 1}
                  </span>
                  <div className="font-sans leading-relaxed text-slate-200">
                    {renderInteractiveText(noteText, setActiveDef)}
                  </div>
                </div>
              ))}
            </div>

            {continuityLinks?.callbacks && continuityLinks.callbacks.length > 0 && (
              <div className="pt-2 border-t border-purple-500/20 space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  Referenced Issues &amp; Historic Callbacks:
                </span>
                <div className="flex flex-wrap gap-2">
                  {continuityLinks.callbacks.map((cb, idx) => (
                    <button
                      key={`cb-${idx}`}
                      type="button"
                      onClick={() => lookupEntity(`${cb.title}: ${cb.note}`, "lexicon")}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-950/60 border border-purple-500/40 text-[11px] font-mono text-purple-200 hover:border-purple-300 hover:bg-purple-900 transition-colors cursor-pointer"
                    >
                      <BookOpen className="h-3 w-3 text-purple-400" />
                      <strong className="text-white">{cb.title}</strong>
                      <span className="text-slate-400 text-[10px]">({cb.note})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fandom Categories Index (All Hyperlinked) */}
        {categories && categories.length > 0 && (
          <div className="rounded-lg bg-black/40 border border-purple-500/30 p-4 space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-purple-500/30 pb-2">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-purple-300 font-bold">
                <Tag className="h-4 w-4 text-purple-400" />
                <span>✦ Fandom Wiki Categories for This Issue</span>
              </div>
              <span className="text-[10px] text-slate-400">All hyperlinked</span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {categories.map((cat, idx) => (
                <button
                  key={`cat-${idx}`}
                  type="button"
                  onClick={() => lookupEntity(cat, "lexicon")}
                  className="px-2 py-1 rounded bg-purple-950/50 border border-purple-500/40 text-purple-200 hover:bg-purple-900 hover:border-purple-300 hover:text-white text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1"
                >
                  <Tag className="h-2.5 w-2.5 text-purple-400" />
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Entity & Lexicon Directory */}
        <div className="pt-4 border-t border-purple-500/30 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 block font-bold">
              ✦ Canonical Wiki Entities &amp; Market Terms in This Issue
            </span>
            <span className="text-[10px] text-slate-400">
              Click any pill for definitions &amp; translations
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {presentTerms.map((def) => {
              const isChar = def.type === "character";
              const isCreator = def.type === "creator";
              return (
                <button
                  key={`tag-${def.slug}-${def.term}`}
                  type="button"
                  onClick={() => setActiveDef(def)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono transition-all duration-150 ${
                    isChar
                      ? "bg-purple-950/80 border border-purple-500/50 text-purple-300 hover:border-purple-300 hover:bg-purple-900"
                      : isCreator
                      ? "bg-amber-950/80 border border-amber-500/50 text-amber-300 hover:border-amber-300 hover:bg-amber-900"
                      : "bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 hover:border-cyan-300 hover:bg-cyan-900"
                  }`}
                >
                  {isChar ? (
                    <Shield className="h-3 w-3 text-purple-400" />
                  ) : isCreator ? (
                    <Sparkles className="h-3 w-3 text-amber-400" />
                  ) : (
                    <Coins className="h-3 w-3 text-cyan-400" />
                  )}
                  <span>{def.term}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. WHY YOU SHOULD BUY: INVESTMENT THESIS & RHETORIC */}
      <div className="relative rounded-xl border-2 border-emerald-500 bg-gradient-to-r from-[#061e12] via-[#020f08] to-[#061e12] p-6 shadow-[0_0_0_1px_rgba(52,211,153,1),0_0_18px_rgba(16,185,129,0.85),inset_0_1px_2px_rgba(255,255,255,0.35)] ring-1 ring-emerald-300/60 space-y-4">
        <div className="absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-transparent via-emerald-300 to-transparent shadow-[0_0_12px_rgba(16,185,129,1)]" />
        <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-mono font-bold text-white uppercase tracking-wider">
              Why You Should Buy: Investment Thesis &amp; Rhetoric
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold uppercase tracking-wider">
            Alpha Dossier · {grader} {grade}
          </span>
        </div>

        <div className="text-xs font-sans text-emerald-100/90 leading-relaxed bg-emerald-950/40 border border-emerald-500/30 rounded-lg p-4 space-y-3">
          {whyInvest.split("\n\n").map((chunk, i) => (
            <p key={i} className="font-medium text-emerald-200 leading-relaxed">
              {renderInteractiveText(chunk, setActiveDef)}
            </p>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 font-mono text-xs">
          <div className="bg-black/40 border border-emerald-500/20 rounded p-2.5">
            <span className="text-[10px] text-emerald-400 uppercase tracking-wider block mb-1">
              Demand Driver &amp; IP Moat
            </span>
            <span className="text-slate-300 text-[11px] font-sans block">
              Core key character continuity, live-action franchise demand &amp; tier-1 publisher pedigree.
            </span>
          </div>
          <div className="bg-black/40 border border-emerald-500/20 rounded p-2.5">
            <span className="text-[10px] text-cyan-400 uppercase tracking-wider block mb-1">
              Graded Census Float
            </span>
            <span className="text-slate-300 text-[11px] font-sans block">
              Finite top-grade registry census creates structured downward price resistance.
            </span>
          </div>
        </div>

        {/* Governing Financial & Underwriting Investment Terms */}
        {governingTerms && governingTerms.length > 0 && (
          <div className="pt-4 border-t border-emerald-500/30 space-y-3 font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-bold flex items-center gap-1.5">
                <Coins className="h-3.5 w-3.5 text-emerald-400" />
                <span>Governing Financial &amp; Underwriting Investment Terms</span>
              </span>
              <span className="text-[10px] text-slate-400">
                Tap any term for calculation formula &amp; market translation
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
              {governingTerms.map((term) => (
                <button
                  key={term.slug}
                  type="button"
                  onClick={() => setActiveDef(term)}
                  className="text-left rounded-lg border border-emerald-500/30 bg-emerald-950/40 hover:border-emerald-400/80 hover:bg-emerald-900/50 p-2.5 transition-all space-y-1.5 group cursor-pointer shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase text-emerald-400/90 font-bold tracking-wider">
                      {term.category}
                    </span>
                    <span className="text-emerald-400 text-xs group-hover:translate-x-0.5 transition-transform">↗</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-white group-hover:text-emerald-200">
                    {term.term}
                  </div>
                  <p className="text-[10px] font-sans text-slate-300 line-clamp-2 leading-relaxed">
                    {term.translation || term.definition}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FLOATING DEFINITION MODAL */}
      {activeDef && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border-2 border-cyan-400 bg-[#060B12] p-6 shadow-[0_0_30px_rgba(6,182,212,0.6)] space-y-4">
            <button
              type="button"
              onClick={() => setActiveDef(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5 border-b border-cyan-500/30 pb-3">
              {activeDef.type === "character" ? (
                <Shield className="h-5 w-5 text-purple-400" />
              ) : activeDef.type === "creator" ? (
                <Sparkles className="h-5 w-5 text-amber-400" />
              ) : (
                <Coins className="h-5 w-5 text-cyan-400" />
              )}
              <div>
                <h4 className="text-base font-mono font-bold text-white">
                  {activeDef.term}
                </h4>
                <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                  <span>{activeDef.category}</span>
                  {activeDef.universe && (
                    <>
                      <span>·</span>
                      <span className="text-purple-300">{activeDef.universe}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {activeDef.role && (
              <div className="bg-purple-950/40 border border-purple-500/30 rounded-lg p-2.5 text-xs text-purple-200 font-mono">
                <span className="text-[10px] text-purple-400 uppercase block mb-0.5">
                  Canonical Role / Identity
                </span>
                {activeDef.role}
              </div>
            )}

            {(activeDef.creators || activeDef.firstAppearance) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-900/80 border border-purple-500/30 rounded-lg p-2.5 text-[11px] font-mono">
                {activeDef.creators && (
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-purple-400 block font-bold">
                      Bullpen Creators
                    </span>
                    <span className="text-slate-200">{activeDef.creators}</span>
                  </div>
                )}
                {activeDef.firstAppearance && (
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-cyan-400 block font-bold">
                      Historical Debut
                    </span>
                    <span className="text-slate-200">{activeDef.firstAppearance}</span>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3 font-sans text-xs">
              <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                  {activeDef.type === "lexicon" ? "Investopedia Financial Principle" : "Canonical Historical Context"}
                </span>
                <p className="text-slate-200 leading-relaxed">{activeDef.definition}</p>
              </div>

              <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-lg p-3 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 block font-semibold">
                  Panel Profits Comic Market Translation
                </span>
                <p className="text-cyan-100/90 leading-relaxed">{activeDef.translation}</p>
              </div>

              {activeDef.comicExample && (
                <div className="bg-amber-950/30 border border-amber-500/30 rounded-lg p-3 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block font-semibold">
                    CBR Lexicon Market Benchmark Example
                  </span>
                  <p className="text-amber-100/90 leading-relaxed font-mono text-[11px]">
                    {activeDef.comicExample}
                  </p>
                </div>
              )}

              {activeDef.canonicalFormula && (
                <div className="bg-black/60 border border-cyan-500/30 rounded-lg p-2.5 font-mono text-[11px] text-cyan-300">
                  <span className="text-[9px] uppercase tracking-wider text-cyan-400 block mb-0.5">
                    Canonical Valuation Formula
                  </span>
                  <code>{activeDef.canonicalFormula}</code>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href={activeDef.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 underline"
              >
                <span>
                  {activeDef.type === "character"
                    ? "Browse Holdings in Catalog"
                    : activeDef.type === "creator"
                    ? "View Creator Catalog Archive"
                    : "Inspect Complete CBR Lexicon Entry"}
                </span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <button
                type="button"
                onClick={() => setActiveDef(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-white transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
