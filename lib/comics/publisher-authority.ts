/**
 * publisher-authority.ts
 *
 * Authoritative publisher resolution engine for the Panel Profits catalog.
 * Guarantees that major publishers (Marvel, DC, Image, Dark Horse, IDW, etc.)
 * are never misclassified as "Independent" or generic "Marvel / DC".
 */

import { translateToEnglishPublisher } from "./translation-utils";

const KNOWN_PUBLISHERS: Record<string, string> = {
  marvel: "Marvel",
  "marvel comics": "Marvel",
  "marvel uk": "Marvel",
  dc: "DC",
  "dc comics": "DC",
  vertigo: "DC",
  image: "Image",
  "image comics": "Image",
  "dark horse": "Dark Horse",
  "dark horse comics": "Dark Horse",
  idw: "IDW",
  "idw publishing": "IDW",
  boom: "Boom! Studios",
  "boom!": "Boom! Studios",
  "boom! studios": "Boom! Studios",
  valiant: "Valiant",
  "acclaim / valiant": "Valiant",
  dynamite: "Dynamite",
  "dynamite entertainment": "Dynamite",
  archie: "Archie",
  "archie comics": "Archie",
  dell: "Dell",
  "gold key": "Gold Key",
  ec: "EC",
  "ec comics": "EC",
  charlton: "Charlton",
  fawcett: "Fawcett",
  "fiction house": "Fiction House",
  "quality comics": "Quality Comics",
  quality: "Quality Comics",
  harvey: "Harvey",
  warren: "Warren",
  eclipse: "Eclipse",
  "pacific comics": "Pacific Comics",
  fantagraphics: "Fantagraphics",
  bongo: "Bongo",
  comico: "Comico",
  "mirage studios": "Mirage Studios",
  mirage: "Mirage Studios",
  "merc publishing": "Merc Publishing",
};

// Substring/regex rules for definitive series matching
const DC_PATTERNS = [
  /\bbatman\b/i,
  /\bdetective comics\b/i,
  /\bsuperman\b/i,
  /\baction comics\b/i,
  /\bwonder woman\b/i,
  /\bflash\b/i,
  /\bgreen lantern\b/i,
  /\baquaman\b/i,
  /\bjustice league\b/i,
  /\bteen titans\b/i,
  /\btitans\b/i,
  /\bsuicide squad\b/i,
  /\bnightwing\b/i,
  /\bbatgirl\b/i,
  /\brobin\b/i,
  /\bcatwoman\b/i,
  /\bharley quinn\b/i,
  /\bswamp thing\b/i,
  /\bhellblazer\b/i,
  /\bsandman\b/i,
  /\bwatchmen\b/i,
  /\bdoom patrol\b/i,
  /\bshazam\b/i,
  /\bsupergirl\b/i,
  /\bhawkman\b/i,
  /\bgreen arrow\b/i,
  /\bbirds of prey\b/i,
  /\blegion of super-heroes\b/i,
  /\binfinity\b/i,
  /\ball star comics\b/i,
  /\bbrave and the bold\b/i,
  /\bshowcase\b/i,
  /\bhouse of mystery\b/i,
  /\bhouse of secrets\b/i,
  /\bmad\b/i,
  /\bred hood\b/i,
  /\bdeathstroke\b/i,
  /\bdark knight\b/i,
  /\bkingdom come\b/i,
  /\ball-star superman\b/i,
];

const MARVEL_PATTERNS = [
  /\bspider-man\b/i,
  /\bspiderman\b/i,
  /\bamazing spider-man\b/i,
  /\bspectacular spider-man\b/i,
  /\bweb of spider-man\b/i,
  /\bmiles morales\b/i,
  /\bpeter parker\b/i,
  /\bx-men\b/i,
  /\buncanny x-men\b/i,
  /\bnew mutants\b/i,
  /\bx-force\b/i,
  /\bx-factor\b/i,
  /\bexcalibur\b/i,
  /\bwolverine\b/i,
  /\bdeadpool\b/i,
  /\bavengers\b/i,
  /\bfantastic four\b/i,
  /\bhulk\b/i,
  /\bincredible hulk\b/i,
  /\bshe-hulk\b/i,
  /\bthor\b/i,
  /\bcaptain america\b/i,
  /\biron man\b/i,
  /\bdaredevil\b/i,
  /\bsilver surfer\b/i,
  /\bghost rider\b/i,
  /\bpunisher\b/i,
  /\bdoctor strange\b/i,
  /\bmoon knight\b/i,
  /\bms\.? marvel\b/i,
  /\bcaptain marvel\b/i,
  /\bblack panther\b/i,
  /\bblack widow\b/i,
  /\bhawkeye\b/i,
  /\bant-man\b/i,
  /\bguardians of the galaxy\b/i,
  /\beternals\b/i,
  /\binhumans\b/i,
  /\bblade\b/i,
  /\bconan\b/i,
  /\bstar wars\b/i,
  /\bdarth vader\b/i,
  /\brogue one\b/i,
  /\bdoctor aphra\b/i,
  /\bmandalorian\b/i,
  /\bmary jane\b/i,
  /\bdeathlok\b/i,
  /\bcarnage\b/i,
  /\bvenom\b/i,
  /\bsecret wars\b/i,
  /\bcivil war\b/i,
  /\binfinity gauntlet\b/i,
  /\binfinity war\b/i,
  /\bmarvel classics\b/i,
  /\bmarvel premiere\b/i,
  /\bmarvel team-up\b/i,
  /\btales of suspense\b/i,
  /\bjourney into mystery\b/i,
  /\bstrange tales\b/i,
  /\btales to astonish\b/i,
  /\bmarvel comics\b/i,
  /\bwhat if\b/i,
  /\bgeneration x\b/i,
  /\bcable\b/i,
  /\bdefenders\b/i,
  /\bchampions\b/i,
  /\brunaways\b/i,
  /\bthunderbolts\b/i,
  /\bspider-woman\b/i,
  /\bspider-gwen\b/i,
  /\bsilk\b/i,
  /\bweapon x\b/i,
  /\bx-23\b/i,
  /\bthanos\b/i,
  /\bnova\b/i,
  /\belementals\b/i,
];

const IMAGE_PATTERNS = [
  /\bspawn\b/i,
  /\bwalking dead\b/i,
  /\bsaga\b/i,
  /\binvincible\b/i,
  /\bsavage dragon\b/i,
  /\bwitchblade\b/i,
  /\bthe darkness\b/i,
  /\bchew\b/i,
  /\bmonstress\b/i,
  /\bdescender\b/i,
  /\beast of west\b/i,
  /\bdeadly class\b/i,
  /\bhitomi\b/i,
  /\bdepartment of truth\b/i,
  /\bpaper girls\b/i,
  /\bradiant black\b/i,
  /\bgideon falls\b/i,
  /\bkill or be killed\b/i,
  /\bcriminal\b/i,
  /\bsex criminals\b/i,
  /\bwicked \+ divine\b/i,
  /\boutcast\b/i,
  /\bgeiger\b/i,
  /\bice cream man\b/i,
  /\bdie\b/i,
  /\bblack science\b/i,
  /\byoungblood\b/i,
  /\bshadowhawk\b/i,
  /\bcyberforce\b/i,
  /\bwildcats\b/i,
];

const DARK_HORSE_PATTERNS = [
  /\bhellboy\b/i,
  /\bb\.?p\.?r\.?d\.?\b/i,
  /\bsin city\b/i,
  /\bumbrella academy\b/i,
  /\busagi yojimbo\b/i,
  /\bgrendel\b/i,
  /\bthe mask\b/i,
  /\bblack hammer\b/i,
  /\balien(s)?\b/i,
  /\bpredator\b/i,
  /\bterminator\b/i,
  /\bresident alien\b/i,
];

const IDW_PATTERNS = [
  /\bteenage mutant ninja turtles\b/i,
  /\btmnt\b/i,
  /\blocke & key\b/i,
  /\btransformers\b/i,
  /\bg\.?i\.? joe\b/i,
  /\bsonic the hedgehog\b/i,
  /\b30 days of night\b/i,
];

const BOOM_PATTERNS = [
  /\bsomething is killing the children\b/i,
  /\bbrzrkr\b/i,
  /\bonce & future\b/i,
  /\bpower rangers\b/i,
  /\blumberjanes\b/i,
  /\bhouse of slaughter\b/i,
  /\bgrim\b/i,
];

const DYNAMITE_PATTERNS = [
  /\bthe boys\b/i,
  /\bred sonja\b/i,
  /\bvampirella\b/i,
  /\barmy of darkness\b/i,
  /\bdejah thoris\b/i,
];

const VALIANT_PATTERNS = [
  /\bx-o manowar\b/i,
  /\bbloodshot\b/i,
  /\bharbinger\b/i,
  /\bninjak\b/i,
  /\bshadowman\b/i,
  /\barcher & armstrong\b/i,
  /\brai\b/i,
];

const MERC_PATTERNS = [
  /\bdeathrage\b/i,
  /\bborn angel\b/i,
  /\bmiss meow\b/i,
];

const EC_PATTERNS = [
  /\btales from the crypt\b/i,
  /\bvault of horror\b/i,
  /\bhaunt of fear\b/i,
  /\bweird science\b/i,
  /\bweird fantasy\b/i,
  /\bcrime suspenstories\b/i,
  /\bshock suspenstories\b/i,
  /\btwo-fisted tales\b/i,
];

export function resolveAuthoritativePublisher(series: string, rawPublisher?: string | null): string {
  const normSeries = String(series || "").trim();
  const rawEnglish = translateToEnglishPublisher(rawPublisher);
  const rawPubClean = String(rawEnglish || "").trim().toLowerCase();

  // 1. If raw publisher is already specific and recognized (not "Independent" or "Marvel / DC")
  if (
    rawPubClean &&
    rawPubClean !== "independent" &&
    rawPubClean !== "marvel / dc" &&
    rawPubClean !== "unknown" &&
    rawPubClean !== "independent publisher"
  ) {
    if (KNOWN_PUBLISHERS[rawPubClean]) {
      return KNOWN_PUBLISHERS[rawPubClean];
    }
    const stripped = rawPubClean.replace(/\s+comics$/i, "");
    if (KNOWN_PUBLISHERS[stripped]) {
      return KNOWN_PUBLISHERS[stripped];
    }
    // Return formatted clean title
    return rawPublisher!.trim().replace(/\s+Comics$/i, "");
  }

  // 2. Authoritative series pattern matching
  for (const pat of DC_PATTERNS) {
    if (pat.test(normSeries)) return "DC";
  }

  for (const pat of MARVEL_PATTERNS) {
    if (pat.test(normSeries)) return "Marvel";
  }

  for (const pat of IMAGE_PATTERNS) {
    if (pat.test(normSeries)) return "Image";
  }

  for (const pat of DARK_HORSE_PATTERNS) {
    if (pat.test(normSeries)) return "Dark Horse";
  }

  for (const pat of IDW_PATTERNS) {
    if (pat.test(normSeries)) return "IDW";
  }

  for (const pat of BOOM_PATTERNS) {
    if (pat.test(normSeries)) return "Boom! Studios";
  }

  for (const pat of DYNAMITE_PATTERNS) {
    if (pat.test(normSeries)) return "Dynamite";
  }

  for (const pat of VALIANT_PATTERNS) {
    if (pat.test(normSeries)) return "Valiant";
  }

  for (const pat of MERC_PATTERNS) {
    if (pat.test(normSeries)) return "Merc Publishing";
  }

  for (const pat of EC_PATTERNS) {
    if (pat.test(normSeries)) return "EC";
  }

  // If nothing matches and raw was valid small press publisher, preserve it
  if (rawPublisher && rawPublisher.trim() && rawPublisher.toLowerCase() !== "marvel / dc") {
    return rawPublisher.trim();
  }

  return "Independent";
}
