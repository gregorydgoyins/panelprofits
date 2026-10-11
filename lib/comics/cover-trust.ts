/**
 * Cover trust: a cover that was found by a publisher-specific wiki NAME SEARCH
 * (e.g. `marvel_fandom_search`) is only believable when the book itself belongs to that
 * publisher family. A Crusade book carrying an Avengers cover is a false match, not a cover.
 */
const SOURCE_FAMILIES: Array<{ prefix: string; publisher: RegExp }> = [
  { prefix: "marvel_", publisher: /marvel|epic|icon|max|star comics|curtis|atlas|timely/i },
  {
    prefix: "dc_",
    publisher: /dc|vertigo|wildstorm|milestone|paradox|young animal|black label|elseworlds|piranha|all.star|cliffhanger|homage|america's best|tangent|amalgam/i,
  },
  { prefix: "imagecomics_", publisher: /image|top cow|skybound|wildstorm/i },
  { prefix: "valiant_", publisher: /valiant/i },
  { prefix: "darkhorse_", publisher: /dark horse/i },
];

/** True when the stored cover source is a wiki search for a publisher other than the book's. */
export function coverSourceContradictsPublisher(
  coverSource: string | null | undefined,
  publisher: string | null | undefined,
): boolean {
  const src = (coverSource || "").trim().toLowerCase();
  const pub = (publisher || "").trim();
  if (!src || !pub) return false;
  const family = SOURCE_FAMILIES.find((f) => src.startsWith(f.prefix));
  if (!family) return false;
  return !family.publisher.test(pub);
}

/** True when a cover URL host/path belongs to a publisher wiki that contradicts the book's publisher. */
export function coverUrlContradictsPublisher(
  url: string | null | undefined,
  publisher: string | null | undefined
): boolean {
  if (!url || !publisher) return false;
  const u = url.toLowerCase();
  const pub = publisher.trim();

  // If URL is from Marvel wiki/database, publisher must match Marvel family
  if (u.includes("marveldatabase") || u.includes("marvel.fandom.com")) {
    const marvelFam = SOURCE_FAMILIES.find((f) => f.prefix === "marvel_");
    if (marvelFam && !marvelFam.publisher.test(pub)) return true;
  }

  // If URL is from DC wiki/database (marvel_dc), publisher must match DC family
  if (u.includes("marvel_dc") || u.includes("dc.fandom.com")) {
    const dcFam = SOURCE_FAMILIES.find((f) => f.prefix === "dc_");
    if (dcFam && !dcFam.publisher.test(pub)) return true;
  }

  // If URL is from Image wiki, publisher must match Image family
  if (u.includes("imagecomics.fandom.com") || u.includes("/imagecomics/")) {
    const imgFam = SOURCE_FAMILIES.find((f) => f.prefix === "imagecomics_");
    if (imgFam && !imgFam.publisher.test(pub)) return true;
  }

  return false;
}
