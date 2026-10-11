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
