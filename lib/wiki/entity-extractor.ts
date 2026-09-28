import { createAdminServerClient } from "@/lib/supabase/admin";

export interface ExtractedEntity {
  id: string;
  name: string;
  type: "creator" | "character" | "publisher" | "title" | "concept" | "era" | "item" | "location" | "team";
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

// Known Creator & Character Dictionary Grounded in Marvel Database, DC Database, and GCD
const KNOWN_CREATORS = [
  "Stan Lee", "Jack Kirby", "Steve Ditko", "Chris Claremont", "John Romita",
  "John Romita Sr.", "John Buscema", "Roy Thomas", "Herb Trimpe", "Dave Cockrum",
  "Len Wein", "Jim Starlin", "Gene Colan", "Marv Wolfman", "Gerry Conway",
  "Ross Andru", "Archie Goodwin", "George Tuska", "Doug Moench", "Don Perlin",
  "Gary Friedrich", "Mike Ploog", "Bill Everett", "Rob Liefeld", "Fabian Nicieza",
  "Todd McFarlane", "Frank Miller", "Jim Lee", "Brian Michael Bendis", "Mark Bagley",
  "Jonathan Hickman", "Al Ewing", "Donny Cates", "Chip Zdarsky", "Sal Buscema",
  "Bill Mantlo", "Peter David", "Tom DeFalco", "Howard Mackie", "Mark Gruenwald",
  "John Byrne", "Alan Davis", "Scott Lobdell", "Bob Kane", "Bill Finger",
  "Jerry Siegel", "Joe Shuster", "Neal Adams", "Grant Morrison", "Geoff Johns",
  "Carmine Infantino", "Robert Kanigher", "John Broome", "Gardner Fox", "Harry Lampert",
  "William Moulton Marston", "Harry G. Peter", "Dennis O'Neil", "George Pérez", "Paul Dini",
  "Bruce Timm", "Neil Gaiman", "Alan Moore", "Garth Ennis", "Robert Kirkman",
  "Mike Mignola", "Erik Larsen", "Brian K. Vaughan", "Sheldon Mayer", "Otto Binder", "C. C. Beck"
];

const KNOWN_CHARACTERS = [
  "Spider-Man", "Wolverine", "Iron Man", "Captain America", "Thor",
  "Hulk", "Deadpool", "Venom", "Daredevil", "Punisher",
  "Doctor Doom", "Silver Surfer", "Galactus", "Thanos", "Moon Knight",
  "Ghost Rider", "Blade", "Jubilee", "Apocalypse", "Winter Soldier",
  "Bucky", "Taskmaster", "Kang the Conqueror", "Mister Sinister", "Doctor Octopus",
  "Green Goblin", "Carnage", "Kraven the Hunter", "Cable", "Domino",
  "Bishop", "Archangel", "She-Hulk", "Black Panther", "Sentry",
  "Magneto", "Professor X", "Cyclops", "Storm", "Colossus",
  "Nightcrawler", "Rogue", "Gambit", "Scarlet Witch", "Quicksilver",
  "Hawkeye", "Black Widow", "Falcon", "Luke Cage", "Iron Fist",
  "Shang-Chi", "X-Men", "Avengers", "Fantastic Four", "Sinister Six",
  "Brotherhood of Evil Mutants", "Alpha Flight", "New Mutants", "Thunderbolts",
  "Guardians of the Galaxy", "Illuminati", "Dora Milaje",
  // DC Lore Characters & Teams
  "Batman", "Superman", "Joker", "Wonder Woman", "The Flash", "Flash", "Green Lantern",
  "Aquaman", "Robin", "Nightwing", "Batgirl", "Commissioner Gordon", "Penguin",
  "Riddler", "Two-Face", "Ra's al Ghul", "Poison Ivy", "Harley Quinn", "Deathstroke",
  "Bane", "Scarecrow", "Supergirl", "Lois Lane", "Lex Luthor", "Brainiac",
  "General Zod", "Doomsday", "Cheetah", "Black Manta", "Green Arrow", "Black Canary",
  "Hal Jordan", "John Stewart", "Sinestro", "Martian Manhunter", "Shazam", "Black Adam",
  "Hawkman", "Hawkgirl", "Cyborg", "Starfire", "Raven", "Beast Boy",
  "Justice League", "Justice Society of America", "Teen Titans", "Suicide Squad",
  "Watchmen", "Rorschach", "Doctor Manhattan",
  // Image & Dark Horse Lore
  "Spawn", "Hellboy", "Invincible", "Savage Dragon", "Star Wars"
];

const KNOWN_ITEMS = [
  "Batmobile", "Batarang", "Infinity Gauntlet", "Mjolnir", "Iron Man Armor",
  "Lasso of Truth", "Green Lantern Power Battery", "Green Lantern Ring", "Lightsaber",
  "Alien Symbiote", "Cosmic Cube", "Eye of Agamotto", "Captain America's Shield",
  "Web-Shooters", "Cerebro", "Mother Box", "Right Hand of Doom", "Destroyer Armor"
];

const KNOWN_LOCATIONS = [
  "Gotham City", "Metropolis", "Central City", "Star City", "Coast City",
  "Keystone City", "Wakanda", "Latveria", "Asgard", "Attilan", "Batcave",
  "Arkham Asylum", "Daily Planet", "Baxter Building", "Avengers Mansion",
  "Negative Zone", "Apokolips", "New Genesis", "Oa", "Gorilla City",
  "Tatooine", "Death Star", "Krypton", "Atlantis", "Themyscira", "Krakoa",
  "Sanctum Sanctorum", "Cybertron"
];

export const LANDMARK_MARVEL_DEBUTS: Record<
  string,
  { characters: string[]; creators: string[]; items?: string[]; locations?: string[]; teams?: string[] }
> = {
  // Marvel Silver & Bronze Age Landmarks
  "amazing fantasy #15": { characters: ["Spider-Man", "Aunt May", "Uncle Ben", "Flash Thompson"], creators: ["Stan Lee", "Steve Ditko"], items: ["Web-Shooters"] },
  "incredible hulk #181": { characters: ["Wolverine"], creators: ["Len Wein", "John Romita Sr.", "Herb Trimpe"] },
  "giant-size x-men #1": { characters: ["Storm", "Colossus", "Nightcrawler", "Krakoa", "Thunderbird"], creators: ["Len Wein", "Dave Cockrum"], locations: ["Krakoa Island"] },
  "werewolf by night #32": { characters: ["Moon Knight", "Frenchie"], creators: ["Doug Moench", "Don Perlin"], items: ["Moon Knight Crescent Darts"] },
  "iron man #55": { characters: ["Thanos", "Drax the Destroyer", "Starfox"], creators: ["Jim Starlin", "Mike Friedrich"] },
  "new mutants #98": { characters: ["Deadpool", "Gideon", "Domino"], creators: ["Rob Liefeld", "Fabian Nicieza"] },
  "new mutants #87": { characters: ["Cable"], creators: ["Rob Liefeld", "Louise Simonson"] },
  "tomb of dracula #10": { characters: ["Blade"], creators: ["Marv Wolfman", "Gene Colan"] },
  "amazing spider-man #129": { characters: ["Punisher", "Jackal"], creators: ["Gerry Conway", "Ross Andru", "John Romita Sr."] },
  "amazing spider-man #300": { characters: ["Venom"], creators: ["Todd McFarlane", "David Michelinie"], items: ["Alien Symbiote"] },
  "amazing spider-man #361": { characters: ["Carnage"], creators: ["David Michelinie", "Mark Bagley"] },
  "amazing spider-man #14": { characters: ["Green Goblin"], creators: ["Stan Lee", "Steve Ditko"], items: ["Goblin Glider", "Pumpkin Bombs"] },
  "amazing spider-man #31": { characters: ["Gwen Stacy", "Harry Osborn"], creators: ["Stan Lee", "Steve Ditko"] },
  "amazing spider-man #41": { characters: ["Rhino"], creators: ["Stan Lee", "John Romita Sr."] },
  "amazing spider-man #50": { characters: ["Kingpin"], creators: ["Stan Lee", "John Romita Sr."] },
  "amazing spider-man #101": { characters: ["Morbius the Living Vampire"], creators: ["Roy Thomas", "Gil Kane"] },
  "amazing spider-man #194": { characters: ["Black Cat"], creators: ["Marv Wolfman", "Keith Pollard"] },
  "marvel spotlight #5": { characters: ["Ghost Rider", "Zarathos"], creators: ["Gary Friedrich", "Mike Ploog"], items: ["Hell Cycle"] },
  "marvel spotlight #2": { characters: ["Werewolf by Night"], creators: ["Roy Thomas", "Gerry Conway", "Mike Ploog"] },
  "marvel spotlight #28": { characters: ["Moon Knight"], creators: ["Doug Moench", "Don Perlin"] },
  "hero for hire #1": { characters: ["Luke Cage"], creators: ["Archie Goodwin", "George Tuska", "John Romita Sr."] },
  "marvel premiere #15": { characters: ["Iron Fist"], creators: ["Roy Thomas", "Gil Kane"], locations: ["K'un-Lun"] },
  "special marvel edition #15": { characters: ["Shang-Chi"], creators: ["Steve Englehart", "Jim Starlin"] },
  "fantastic four #1": { characters: ["Mister Fantastic", "Invisible Woman", "Human Torch", "Thing", "Mole Man"], creators: ["Stan Lee", "Jack Kirby"] },
  "fantastic four #3": { characters: ["Fantastic Four"], creators: ["Stan Lee", "Jack Kirby"], locations: ["Baxter Building"], items: ["Fantasti-Flare"] },
  "fantastic four #47": { characters: ["Inhumans", "Black Bolt", "Medusa"], creators: ["Stan Lee", "Jack Kirby"], locations: ["Attilan"] },
  "fantastic four #48": { characters: ["Silver Surfer", "Galactus"], creators: ["Jack Kirby", "Stan Lee"] },
  "fantastic four #51": { characters: ["This Man... This Monster!"], creators: ["Stan Lee", "Jack Kirby"], locations: ["Negative Zone"] },
  "fantastic four #52": { characters: ["Black Panther"], creators: ["Jack Kirby", "Stan Lee"], locations: ["Wakanda"] },
  "fantastic four annual #2": { characters: ["Doctor Doom"], creators: ["Stan Lee", "Jack Kirby"], locations: ["Latveria"] },
  "avengers #1": { characters: ["Avengers", "Loki"], creators: ["Stan Lee", "Jack Kirby"] },
  "avengers #2": { characters: ["Avengers", "Space Phantom"], creators: ["Stan Lee", "Jack Kirby"], locations: ["Avengers Mansion"] },
  "avengers #4": { characters: ["Captain America"], creators: ["Stan Lee", "Jack Kirby"], items: ["Captain America's Shield"] },
  "avengers #57": { characters: ["Vision"], creators: ["Roy Thomas", "John Buscema"] },
  "journey into mystery #83": { characters: ["Thor"], creators: ["Stan Lee", "Jack Kirby"], items: ["Mjolnir"] },
  "journey into mystery #85": { characters: ["Loki", "Odin", "Heimdall", "Balder"], creators: ["Stan Lee", "Larry Lieber", "Jack Kirby"], locations: ["Asgard"] },
  "journey into mystery #118": { characters: ["Destroyer"], creators: ["Stan Lee", "Jack Kirby"], items: ["Destroyer Armor"] },
  "strange tales #110": { characters: ["Doctor Strange", "Ancient One", "Nightmare"], creators: ["Stan Lee", "Steve Ditko"], locations: ["Sanctum Sanctorum"] },
  "tales of suspense #39": { characters: ["Iron Man"], creators: ["Stan Lee", "Jack Kirby", "Don Heck"], items: ["Iron Man Armor Model 1"] },
  "tales of suspense #52": { characters: ["Black Widow"], creators: ["Stan Lee", "Don Heck"] },
  "tales of suspense #57": { characters: ["Hawkeye"], creators: ["Stan Lee", "Don Heck"] },
  "captain america comics #1": { characters: ["Captain America", "Bucky"], creators: ["Joe Simon", "Jack Kirby"], items: ["Original Triangular Shield"] },
  "captain america #117": { characters: ["Falcon"], creators: ["Stan Lee", "Gene Colan"] },
  "iron man #118": { characters: ["James Rhodes"], creators: ["David Michelinie", "Bob Layton", "John Byrne"] },
  "silver surfer #44": { characters: ["Thanos"], creators: ["Jim Starlin", "Ron Lim"], items: ["Infinity Gauntlet"] },
  "thor #337": { characters: ["Beta Ray Bill"], creators: ["Walt Simonson"], items: ["Stormbreaker"] },
  "x-men #1": { characters: ["Professor X", "Cyclops", "Iceman", "Angel", "Beast", "Magneto"], creators: ["Stan Lee", "Jack Kirby"], locations: ["Xavier Mansion"] },
  "x-men #4": { characters: ["Scarlet Witch", "Quicksilver", "Toad"], creators: ["Stan Lee", "Jack Kirby"] },
  "x-men #5": { characters: ["Magneto"], creators: ["Stan Lee", "Jack Kirby"], locations: ["Asteroid M"] },
  "x-men #14": { characters: ["Sentinels", "Bolivar Trask"], creators: ["Stan Lee", "Jack Kirby"], items: ["Sentinel Robots"] },
  "x-men #120": { characters: ["Alpha Flight"], creators: ["Chris Claremont", "John Byrne"] },
  "uncanny x-men #101": { characters: ["Phoenix"], creators: ["Chris Claremont", "Dave Cockrum"] },
  "uncanny x-men #129": { characters: ["Kitty Pryde", "Emma Frost", "Sebastian Shaw"], creators: ["Chris Claremont", "John Byrne"] },
  "uncanny x-men #141": { characters: ["Days of Future Past", "Rachel Summers"], creators: ["Chris Claremont", "John Byrne"] },
  "uncanny x-men #201": { characters: ["Cable"], creators: ["Chris Claremont", "Rick Leonardi"] },
  "uncanny x-men #221": { characters: ["Mister Sinister"], creators: ["Chris Claremont", "Marc Silvestri"] },
  "uncanny x-men #244": { characters: ["Jubilee"], creators: ["Chris Claremont", "Marc Silvestri"] },
  "uncanny x-men #266": { characters: ["Gambit"], creators: ["Chris Claremont", "Jim Lee", "Mike Collins"] },
  "x-factor #6": { characters: ["Apocalypse"], creators: ["Louise Simonson", "Jackson Guice"] },
  "x-factor #24": { characters: ["Archangel"], creators: ["Louise Simonson", "Walt Simonson"] },
  "daredevil #1": { characters: ["Daredevil", "Foggy Nelson", "Karen Page"], creators: ["Stan Lee", "Bill Everett"], items: ["Billy Club"] },
  "daredevil #131": { characters: ["Bullseye"], creators: ["Marv Wolfman", "Bob Brown"] },
  "daredevil #168": { characters: ["Elektra"], creators: ["Frank Miller"] },
  "ms. marvel #1": { characters: ["Carol Danvers"], creators: ["Gerry Conway", "John Buscema"] },
  "captain marvel #14": { characters: ["Kamala Khan"], creators: ["G. Willow Wilson", "Adrian Alphona"] },
  "ultimate spider-man #1": { characters: ["Miles Morales"], creators: ["Brian Michael Bendis", "Mark Bagley"] },
  "ultimate fallout #4": { characters: ["Miles Morales"], creators: ["Brian Michael Bendis", "Sara Pichelli"] },
  "edge of spider-verse #2": { characters: ["Spider-Gwen"], creators: ["Jason Latour", "Robbi Rodriguez"] },
  "marvel super heroes secret wars #8": { characters: ["Alien Symbiote Costume", "Spider-Man"], creators: ["Jim Shooter", "Mike Zeck"], items: ["Black Symbiote Suit"] },

  // DC Landmark Milestones
  "action comics #1": { characters: ["Superman", "Lois Lane"], creators: ["Jerry Siegel", "Joe Shuster"] },
  "action comics #16": { characters: ["Superman"], creators: ["Jerry Siegel", "Joe Shuster"], locations: ["Metropolis"] },
  "action comics #23": { characters: ["Superman"], creators: ["Jerry Siegel", "Joe Shuster"], locations: ["Daily Planet"] },
  "detective comics #27": { characters: ["Batman", "Commissioner Gordon"], creators: ["Bob Kane", "Bill Finger"] },
  "detective comics #31": { characters: ["Batman"], creators: ["Gardner Fox", "Bob Kane"], items: ["Batarang"] },
  "detective comics #35": { characters: ["Batman"], creators: ["Bill Finger", "Bob Kane"], items: ["Batmobile"] },
  "batman #1": { characters: ["Joker", "Catwoman"], creators: ["Bob Kane", "Bill Finger"] },
  "batman #4": { characters: ["Batman"], creators: ["Bill Finger", "Bob Kane"], locations: ["Gotham City"] },
  "batman #12": { characters: ["Batman"], creators: ["Bill Finger", "Bob Kane"], locations: ["Batcave"] },
  "batman #258": { characters: ["Batman", "Two-Face"], creators: ["Dennis O'Neil", "Irv Novick"], locations: ["Arkham Asylum"] },
  "all star comics #8": { characters: ["Wonder Woman"], creators: ["William Moulton Marston", "H. G. Peter"] },
  "sensation comics #6": { characters: ["Wonder Woman"], creators: ["William Moulton Marston", "Harry G. Peter"], items: ["Lasso of Truth"] },
  "showcase #4": { characters: ["The Flash (Barry Allen)"], creators: ["Robert Kanigher", "Carmine Infantino"], locations: ["Central City"] },
  "showcase #22": { characters: ["Green Lantern (Hal Jordan)"], creators: ["John Broome", "Gil Kane"], items: ["Green Lantern Power Battery"], locations: ["Coast City"] },
  "brave and the bold #28": { characters: ["Justice League of America"], creators: ["Gardner Fox", "Mike Sekowsky"], locations: ["Secret Sanctuary (Happy Harbor)"] },
  "flash comics #1": { characters: ["The Flash (Jay Garrick)", "Hawkman"], creators: ["Gardner Fox", "Harry Lampert"], locations: ["Keystone City"] },
  "more fun comics #73": { characters: ["Aquaman", "Green Arrow", "Speedy"], creators: ["Paul Norris", "Mort Weisinger", "George Papp"] },
  "adventure comics #266": { characters: ["Green Arrow"], creators: ["Robert Bernstein", "Lee Elias"], locations: ["Star City"] },
  "action comics #252": { characters: ["Supergirl", "Brainiac"], creators: ["Otto Binder", "Al Plastino"] },
  "detective comics #38": { characters: ["Robin (Dick Grayson)"], creators: ["Bill Finger", "Bob Kane", "Jerry Robinson"] },
  "detective comics #359": { characters: ["Batgirl (Barbara Gordon)"], creators: ["Gardner Fox", "Carmine Infantino"] },
  "all star comics #3": { characters: ["Justice Society of America"], creators: ["Gardner Fox", "Sheldon Mayer"] },
  "whiz comics #2": { characters: ["Captain Marvel / Shazam", "Billy Batson"], creators: ["Bill Parker", "C. C. Beck"], locations: ["Rock of Eternity"] },
  "green lantern #1": { characters: ["Guardians of the Universe"], creators: ["John Broome", "Gil Kane"], locations: ["Oa"] },
  "the flash #106": { characters: ["Gorilla Grodd", "Pied Piper"], creators: ["John Broome", "Carmine Infantino"], locations: ["Gorilla City"] },
  "new gods #1": { characters: ["Orion", "Highfather"], creators: ["Jack Kirby"], locations: ["Apokolips", "New Genesis"], items: ["Mother Box"] },
  "green lantern #76": { characters: ["Green Lantern / Green Arrow Run"], creators: ["Dennis O'Neil", "Neal Adams"] },
  "crisis on infinite earths #7": { characters: ["Anti-Monitor"], creators: ["Marv Wolfman", "George Pérez"] },
  "new teen titans #1": { characters: ["Raven", "Starfire", "Cyborg"], creators: ["Marv Wolfman", "George Pérez"], locations: ["Titans Tower"] },
  "new teen titans #2": { characters: ["Deathstroke the Terminator"], creators: ["Marv Wolfman", "George Pérez"] },
  "batman #232": { characters: ["Ra's al Ghul"], creators: ["Dennis O'Neil", "Neal Adams"], locations: ["Lazarus Pit"] },
  "batman #181": { characters: ["Poison Ivy"], creators: ["Robert Kanigher", "Sheldon Moldoff"] },
  "detective comics #58": { characters: ["Penguin"], creators: ["Bill Finger", "Bob Kane"] },
  "detective comics #66": { characters: ["Two-Face"], creators: ["Bill Finger", "Bob Kane"] },
  "detective comics #140": { characters: ["Riddler"], creators: ["Bill Finger", "Dick Sprang"] },
  "batman #357": { characters: ["Jason Todd", "Killer Croc"], creators: ["Gerry Conway", "Gene Colan"] },
  "swamp thing #37": { characters: ["John Constantine"], creators: ["Alan Moore", "Rick Veitch", "John Totleben"] },
  "batman adventures #12": { characters: ["Harley Quinn"], creators: ["Paul Dini", "Bruce Timm", "Mike Parobeck"] },
  "watchmen #1": { characters: ["Rorschach", "Doctor Manhattan", "Nite Owl", "The Comedian"], creators: ["Alan Moore", "Dave Gibbons"] },
  "sandman #1": { characters: ["Dream (Morpheus)"], creators: ["Neil Gaiman", "Sam Kieth", "Mike Dringenberg"], locations: ["The Dreaming"] },

  // Image, Dark Horse, Star Wars & Hasbro Milestones
  "spawn #1": { characters: ["Spawn (Al Simmons)"], creators: ["Todd McFarlane"], items: ["K7-Leetha Necroplasmic Armor"] },
  "savage dragon #1": { characters: ["Savage Dragon"], creators: ["Erik Larsen"] },
  "invincible #1": { characters: ["Invincible (Mark Grayson)", "Omni-Man"], creators: ["Robert Kirkman", "Cory Walker"] },
  "the walking dead #1": { characters: ["Rick Grimes"], creators: ["Robert Kirkman", "Tony Moore"] },
  "saga #1": { characters: ["Alana", "Marko"], creators: ["Brian K. Vaughan", "Fiona Staples"] },
  "hellboy: seed of destruction #1": { characters: ["Hellboy", "Abe Sapien"], creators: ["Mike Mignola", "John Byrne"], items: ["Right Hand of Doom"] },
  "star wars #1": { characters: ["Luke Skywalker", "Darth Vader", "Princess Leia"], creators: ["Roy Thomas", "Howard Chaykin"], items: ["Lightsaber"], locations: ["Tatooine", "Death Star"] },
  "transformers #1": { characters: ["Optimus Prime", "Megatron", "Bumblebee"], creators: ["Bob Budiansky", "Bill Mantlo", "Frank Springer"], locations: ["Cybertron"] },
};

const KNOWN_PUBLISHERS = [
  "Marvel Comics", "DC Comics", "Image Comics", "Dark Horse Comics",
  "IDW Publishing", "BOOM! Studios", "Dynamite Entertainment", "Valiant Comics",
  "EC Comics", "Archie Comics", "Viz Media", "Kodansha"
];

/**
 * Extracts recognized comic creators, characters, publishers, and financial terms from text,
 * with canonical landmark first-appearance resolution.
 */
export function extractComicEntities(
  text: string,
  seriesName?: string | null,
  issueNumber?: string | null
): ExtractedEntity[] {
  if (!text && !seriesName) return [];
  const entities: ExtractedEntity[] = [];
  const lowerText = text.toLowerCase();

  // 0. Landmark First Appearance Resolution
  if (seriesName && issueNumber) {
    const cleanSeries = seriesName.toLowerCase().replace(/^(the|a)\s+/, "").trim();
    const cleanIssue = issueNumber.replace(/^#/, "").trim();
    const key = `${cleanSeries} #${cleanIssue}`;

    if (LANDMARK_MARVEL_DEBUTS[key]) {
      const debut = LANDMARK_MARVEL_DEBUTS[key];
      for (const char of debut.characters) {
        entities.push({
          id: `debut-char-${char.toLowerCase().replace(/\s+/g, "-")}`,
          name: char,
          type: "character",
          description: `Canonical 1st Appearance / Key Issue Milestone in ${seriesName} #${issueNumber}.`,
          relevanceScore: 1.0,
          wikiUrl: `/wiki?search=${encodeURIComponent(char)}`,
        });
      }
      for (const cr of debut.creators) {
        entities.push({
          id: `debut-creator-${cr.toLowerCase().replace(/\s+/g, "-")}`,
          name: cr,
          type: "creator",
          description: `Key Creator of landmark debuts in ${seriesName} #${issueNumber}.`,
          relevanceScore: 0.98,
          wikiUrl: `/wiki?search=${encodeURIComponent(cr)}`,
        });
      }
      if (debut.items) {
        for (const it of debut.items) {
          entities.push({
            id: `debut-item-${it.toLowerCase().replace(/\s+/g, "-")}`,
            name: it,
            type: "item",
            description: `Canonical 1st Appearance / Landmark Tech & Weapon Debut in ${seriesName} #${issueNumber}.`,
            relevanceScore: 0.97,
            wikiUrl: `/wiki?search=${encodeURIComponent(it)}`,
          });
        }
      }
      if (debut.locations) {
        for (const loc of debut.locations) {
          entities.push({
            id: `debut-loc-${loc.toLowerCase().replace(/\s+/g, "-")}`,
            name: loc,
            type: "location",
            description: `Canonical 1st Appearance / Landmark City & World Debut in ${seriesName} #${issueNumber}.`,
            relevanceScore: 0.96,
            wikiUrl: `/wiki?search=${encodeURIComponent(loc)}`,
          });
        }
      }
    }
  }

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

  // 3. Match Landmark Artifacts & Items
  for (const item of KNOWN_ITEMS) {
    const idx = lowerText.indexOf(item.toLowerCase());
    if (idx !== -1 && !entities.some((e) => e.name.toLowerCase() === item.toLowerCase())) {
      entities.push({
        id: `item-${item.toLowerCase().replace(/\s+/g, "-")}`,
        name: item,
        type: "item",
        description: `Canonical artifact, gadget, or weapon entity in comic history.`,
        relevanceScore: 0.92,
        matchStart: idx,
        matchEnd: idx + item.length,
        wikiUrl: `/wiki?search=${encodeURIComponent(item)}`
      });
    }
  }

  // 4. Match Landmark Locations & Cities
  for (const loc of KNOWN_LOCATIONS) {
    const idx = lowerText.indexOf(loc.toLowerCase());
    if (idx !== -1 && !entities.some((e) => e.name.toLowerCase() === loc.toLowerCase())) {
      entities.push({
        id: `loc-${loc.toLowerCase().replace(/\s+/g, "-")}`,
        name: loc,
        type: "location",
        description: `Canonical city, hideout, realm, or planet in comic history.`,
        relevanceScore: 0.91,
        matchStart: idx,
        matchEnd: idx + loc.length,
        wikiUrl: `/wiki?search=${encodeURIComponent(loc)}`
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
