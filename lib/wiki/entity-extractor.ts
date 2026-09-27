import { createAdminServerClient } from "@/lib/supabase/admin";

export interface ExtractedEntity {
  id: string;
  name: string;
  type: "creator" | "character" | "publisher" | "title" | "concept" | "era";
  description?: string;
  relevanceScore: number;
  matchStart?: number;
  matchEnd?: number;
  wikiUrl?: string;
}

export interface EntityGraphNode {
  id: string;
  label: string;
  type: ExtractedEntity["type"];
  connections: string[]; // Connected Entity IDs
}

// Canonical Comic & Hobby Financial Glossary (Investopedia style for Comic Equities)
export const COMIC_FINANCIAL_GLOSSARY: Record<string, { term: string; definition: string; category: string }> = {
  "atomic-asset": {
    term: "Atomic Asset Unit",
    definition: "The fundamental individual comic book publication issue serving as the granular base building block for portfolio valuation and market capitalization.",
    category: "Valuation"
  },
  "cgc": {
    term: "CGC (Certified Guaranty Company)",
    definition: "The third-party grading service that evaluates, encapsulates (slabs), and certifies comic book condition on a strict 0.5 to 10.0 numerical scale.",
    category: "Grading & Certification"
  },
  "cbcs": {
    term: "CBCS (Comic Book Certification Service)",
    definition: "An independent third-party comic grading service providing physical condition authentication, signature verification, and tamper-evident slabbing.",
    category: "Grading & Certification"
  },
  "raw-copies": {
    term: "Raw Copies (Uncertified)",
    definition: "Comic book issues preserved in original unencapsulated paper form without official third-party grading or plastic slabbing.",
    category: "Asset State"
  },
  "high-grade": {
    term: "High-Grade",
    definition: "Comic books possessing near-flawless structural condition, typically scoring 9.2 (Near Mint) to 9.8 (Near Mint/Mint) on the grading scale.",
    category: "Asset Condition"
  },
  "census-slabs": {
    term: "Census Slabs",
    definition: "The total documented population of officially graded and slabbed comic copies recorded in public grading censuses across specified grade tiers.",
    category: "Supply Dynamics"
  },
  "ratio-variant": {
    term: "Ratio Variant Cover",
    definition: "Incentive covers printed in limited quantities distributed to retailers based on order thresholds (e.g. 1:25, 1:50, 1:100 copies ordered).",
    category: "Market Structure"
  },
  "first-appearance": {
    term: "First Appearance",
    definition: "The landmark debut issue where a comic book character, villain, team, or key item makes their initial canonical appearance.",
    category: "Key Issue Milestones"
  },
  "first-printing": {
    term: "First Printing",
    definition: "The initial manufacturing print run of a comic book issue, which commands maximum valuation over subsequent reorders.",
    category: "Edition Provenance"
  },
  "release-date": {
    term: "Release Date & On-Sale Coordinates",
    definition: "The scheduled publication date when a comic issue reaches distributor shelves and begins secondary market price discovery.",
    category: "Publication Parameters"
  },
  "final-order-cutoff": {
    term: "Final Order Cutoff (FOC)",
    definition: "The final deadline date when comic shop retailers must lock in initial order quantities with distributors, determining initial scarcity floors.",
    category: "Distribution Dynamics"
  },
  "reorder-volume": {
    term: "Reorder Volume",
    definition: "Subsequent orders placed by comic shop retailers following initial sellouts, indicating rapid secondary demand velocity.",
    category: "Demand Metrics"
  },
  "secondary-market": {
    term: "Secondary Market",
    definition: "The secondary exchange and auction ecosystem (eBay, Heritage, ComicConnect) where published key issues trade between collectors and investors.",
    category: "Trading Ecosystem"
  },
  "bid-ask-spread": {
    term: "Bid-Ask Spread",
    definition: "The delta between the highest price a collector is willing to pay (bid) and the lowest price a seller is willing to accept (ask).",
    category: "Trading Mechanics"
  },
  "auction-velocity": {
    term: "Auction Velocity",
    definition: "The frequency and speed at which key issue copies clear across major public auction platforms.",
    category: "Liquidity Metrics"
  },
  "liquidity-floor": {
    term: "Liquidity Floor",
    definition: "The baseline price point at which an issue consistently clears secondary transactions without significant price degradation.",
    category: "Valuation"
  },
  "asset-catalysts": {
    term: "Asset Catalyst Event",
    definition: "A major media adaptation, movie optioning, or canonical comic event that triggers immediate demand volume for related key issues.",
    category: "Demand Drivers"
  },
  "creator-lineage": {
    term: "Creator Lineage & Run Momentum",
    definition: "The historical valuation momentum and demand elasticity associated with iconic writer/artist creative runs.",
    category: "Fundamentals"
  }
};

// Known Creator & Character Dictionary for Real-Time Knowledge Graph Parsing
const KNOWN_CREATORS = [
  "Stan Lee", "Jack Kirby", "Steve Ditko", "Todd McFarlane", "Frank Miller",
  "Alan Moore", "Jim Lee", "Rob Liefeld", "Chris Claremont", "Will Eisner",
  "Bob Kane", "Bill Finger", "Jerry Siegel", "Joe Shuster", "Neal Adams",
  "Bernie Wrightson", "John Romita", "John Buscema", "George Pérez", "Dave Gibbons",
  "Grant Morrison", "Garth Ennis", "Brian Michael Bendis", "Geoff Johns", "Jonathan Hickman",
  "Donny Cates", "Chip Zdarsky", "Al Ewing", "James Tynion IV", "Peach Momoko"
];

const KNOWN_CHARACTERS = [
  "Spider-Man", "Batman", "Superman", "Wolverine", "Iron Man",
  "Captain America", "Thor", "Hulk", "Wonder Woman", "Flash",
  "Green Lantern", "Deadpool", "Venom", "Punisher", "Daredevil",
  "Doctor Strange", "Black Panther", "Spawn", "Hellboy", "Magneto",
  "Joker", "Doctor Doom", "Thanos", "Norman Osborn", "Harley Quinn"
];

const KNOWN_PUBLISHERS = [
  "Marvel Comics", "DC Comics", "Image Comics", "Dark Horse Comics",
  "IDW Publishing", "BOOM! Studios", "Dynamite Entertainment", "Valiant Comics",
  "EC Comics", "Archie Comics", "Viz Media", "Kodansha"
];

/**
 * Extracts recognized comic creators, characters, publishers, and financial terms from text.
 */
export function extractComicEntities(text: string): ExtractedEntity[] {
  if (!text) return [];
  const entities: ExtractedEntity[] = [];
  const lowerText = text.toLowerCase();

  // 1. Match Creators
  for (const creator of KNOWN_CREATORS) {
    const idx = lowerText.indexOf(creator.toLowerCase());
    if (idx !== -1) {
      entities.push({
        id: `creator-${creator.toLowerCase().replace(/\s+/g, "-")}`,
        name: creator,
        type: "creator",
        description: `Legendary comic book creator and historical contributor.`,
        relevanceScore: 0.95,
        matchStart: idx,
        matchEnd: idx + creator.length,
        wikiUrl: `/wiki?search=${encodeURIComponent(creator)}`
      });
    }
  }

  // 2. Match Characters
  for (const character of KNOWN_CHARACTERS) {
    const idx = lowerText.indexOf(character.toLowerCase());
    if (idx !== -1) {
      entities.push({
        id: `char-${character.toLowerCase().replace(/\s+/g, "-")}`,
        name: character,
        type: "character",
        description: `Iconic comic book character and key appearance entity.`,
        relevanceScore: 0.9,
        matchStart: idx,
        matchEnd: idx + character.length,
        wikiUrl: `/wiki?search=${encodeURIComponent(character)}`
      });
    }
  }

  // 3. Match Publishers
  for (const pub of KNOWN_PUBLISHERS) {
    const idx = lowerText.indexOf(pub.toLowerCase());
    if (idx !== -1) {
      entities.push({
        id: `pub-${pub.toLowerCase().replace(/\s+/g, "-")}`,
        name: pub,
        type: "publisher",
        description: `Established comic book publisher and IP holder.`,
        relevanceScore: 0.85,
        matchStart: idx,
        matchEnd: idx + pub.length,
        wikiUrl: `/wiki?search=${encodeURIComponent(pub)}`
      });
    }
  }

  // 4. Match Comic Equity Financial Concepts
  for (const [key, termObj] of Object.entries(COMIC_FINANCIAL_GLOSSARY)) {
    const idx = lowerText.indexOf(termObj.term.toLowerCase());
    if (idx !== -1) {
      entities.push({
        id: `finance-${key}`,
        name: termObj.term,
        type: "concept",
        description: termObj.definition,
        relevanceScore: 0.8,
        matchStart: idx,
        matchEnd: idx + termObj.term.length,
        wikiUrl: `/learn#${key}`
      });
    }
  }

  return entities;
}

/**
 * Connects extracted entities into an interactive relationship graph for Prezi-style map rendering.
 */
export function buildEntityGraph(entities: ExtractedEntity[]): EntityGraphNode[] {
  return entities.map((entity, idx) => {
    // Connect creators to characters and publishers in the same text
    const connections = entities
      .filter((e, i) => i !== idx)
      .slice(0, 4)
      .map((e) => e.id);

    return {
      id: entity.id,
      label: entity.name,
      type: entity.type,
      connections
    };
  });
}
