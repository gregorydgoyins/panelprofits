import { describe, it, expect } from "vitest";
import {
  extractFandomSynopsis,
  parseFandomWikitext,
  extractLocgIssue,
  fandomPageTitle,
  normalizeTitle,
  publishersAgree,
  clipAtSentence,
  comicKey,
} from "@/lib/comics/story-summary";
import { coverSourceContradictsPublisher } from "@/lib/comics/cover-trust";

// Layout copied from the live Marvel Database page for Avengers Vol 5 #2 (heading/paragraph structure only).
const MARVEL_HTML = `
<div class="mw-parser-output">
<h2 class="marvel_database_header"><span class="mw-headline" id="Appearing_in">Featured Characters:</span></h2>
<p>ignore me</p>
<h2 class="marvel_database_header" style="text-align:left"><span id="Synopsis_for_.22We_Were_Avengers.22"></span><span class="mw-headline" id="Synopsis_for_&quot;We_Were_Avengers&quot;">Synopsis for "We Were Avengers"</span></h2>
<p>In the past, Tony and Steve discuss what their approach should be to creating this new team. They decide on a limited roster.</p>
<p>Wolverine is the first to be recruited, and Tony gets him by being direct.<sup class="reference">[1]</sup></p>
<h2 class="marvel_database_header"><span class="mw-headline">Solicit Synopsis</span></h2>
<p>Publisher blurb that must not be included.</p>
</div>`;

describe("fandom synopsis extraction", () => {
  it("takes only the lead 'Synopsis for' section and its title", () => {
    const r = extractFandomSynopsis(MARVEL_HTML)!;
    expect(r.storyTitle).toBe("We Were Avengers");
    expect(r.text).toContain("In the past, Tony and Steve");
    expect(r.text).toContain("Wolverine is the first");
    expect(r.text).not.toContain("Publisher blurb");
    expect(r.text).not.toContain("ignore me");
    expect(r.text).not.toContain("[1]");
  });
  it("returns null when there is no synopsis section or it is a stub", () => {
    expect(extractFandomSynopsis("<h2>See Also</h2><p>x</p>")).toBeNull();
    expect(extractFandomSynopsis('<h2><span>Synopsis for "A"</span></h2><p>Short.</p>')).toBeNull();
  });
});

describe("fandom wikitext parsing", () => {
  const sampleWikitext = `
{{Marvel Database:Comic Template
| StoryTitle1 = We Were Avengers
| Quotation = Get everyone together, [[James Howlett (Earth-616)|Logan]]... Tell them we're going to [[Mars (Planet)|Mars]].
| Speaker = [[Steven Rogers (Earth-616)|Captain America]]
| Writer1_1 = Jonathan Hickman
| Penciler1_1 = Jerome Opeña
| Synopsis1 = In the past, Tony and Steve discuss creating this new team. [[Steven Rogers (Earth-616)|Captain America]] leads them to [[Mars (Planet)|Mars]].
| Appearing1 =
'''Featured Characters:'''
* {{Flashback|[[Steven Rogers (Earth-616)|Captain America (Steve Rogers)]]}}
* {{a|[[Anthony Stark (Earth-616)|Iron Man (Tony Stark)]]}}
'''Antagonists:'''
* {{a|[[Ex Nihilo (Earth-616)|Ex Nihilo]]}}
'''Other Characters:'''
* {{a|[[Builders]]}} (First appearance)
'''Locations:'''
* [[Mars (Planet)|Mars]]
'''Items:'''
* [[Mjolnir]]
}}
`;

  it("extracts story title, quotation, synopsis with markdown links, credits, and entity census", () => {
    const res = parseFandomWikitext(sampleWikitext, "marvel.fandom.com")!;
    expect(res).not.toBeNull();
    expect(res.storyTitle).toBe("We Were Avengers");
    expect(res.quote?.text).toContain("[Logan](https://marvel.fandom.com/wiki/James_Howlett_(Earth-616))");
    expect(res.quote?.speaker).toContain("[Captain America](https://marvel.fandom.com/wiki/Steven_Rogers_(Earth-616))");
    expect(res.text).toContain("[Captain America](https://marvel.fandom.com/wiki/Steven_Rogers_(Earth-616))");
    expect(res.credits?.writers).toContain("Jonathan Hickman");
    expect(res.credits?.pencilers).toContain("Jerome Opeña");
    expect(res.entities?.featuredCharacters?.length).toBe(2);
    expect(res.entities?.antagonists?.length).toBe(1);
    expect(res.entities?.firstAppearances?.length).toBe(1);
    expect(res.entities?.firstAppearances?.[0].label).toBe("Builders");
    expect(res.entities?.locations?.length).toBe(1);
    expect(res.entities?.items?.length).toBe(1);
  });
});

describe("League of Comic Geeks parsing", () => {
  it("reads publisher, release year and description", () => {
    const html = `<div>CRUSADE COMICS &nbsp; · &nbsp; RELEASED APR 12, 1995</div>
      <div class="col-12 listing-description"><p>${"Shi hunts the killer across Tokyo. ".repeat(3)}</p></div>`;
    const r = extractLocgIssue(html);
    expect(r.year).toBe(1995);
    expect(r.publisher?.toLowerCase()).toContain("crusade");
    expect(r.description).toContain("Shi hunts the killer");
  });
  it("treats an empty description as none", () => {
    const r = extractLocgIssue('<div class="col-12 listing-description">   </div>');
    expect(r.description).toBeNull();
  });
});

describe("helpers", () => {
  it("builds Marvel/DC database page titles", () => {
    expect(fandomPageTitle("Avengers", "2", 5)).toBe("Avengers_Vol_5_2");
    expect(fandomPageTitle("The Amazing Spider-Man (1963)", "300", 1)).toBe("Amazing_Spider-Man_Vol_1_300");
  });
  it("normalizes series titles and matches publishers loosely but not blindly", () => {
    expect(normalizeTitle("The Shi: The Way of the Warrior (1994)")).toBe("shi the way of the warrior");
    expect(publishersAgree("Crusade Comics", "CRUSADE")).toBe(true);
    expect(publishersAgree("Marvel", "Crusade Comics")).toBe(false);
    expect(publishersAgree(null, "Crusade")).toBe(false);
  });
  it("clips on a sentence boundary", () => {
    const s = "One sentence here. ".repeat(80);
    const c = clipAtSentence(s, 100);
    expect(c.length).toBeLessThanOrEqual(100);
    expect(c.endsWith(".")).toBe(true);
  });
  it("keys are stable", () => {
    expect(comicKey("Shi: The Way of the Warrior", "5", 1995)).toBe("shi the way of the warrior|5|1995");
  });
});

describe("cover trust", () => {
  it("rejects a Marvel wiki search cover on a Crusade book", () => {
    expect(coverSourceContradictsPublisher("marvel_fandom_search", "Crusade Comics")).toBe(true);
  });
  it("accepts a Marvel wiki cover on a Marvel book and non-search sources", () => {
    expect(coverSourceContradictsPublisher("marvel_fandom_search", "Marvel")).toBe(false);
    expect(coverSourceContradictsPublisher("pricecharting", "Crusade Comics")).toBe(false);
    expect(coverSourceContradictsPublisher("", "Crusade Comics")).toBe(false);
  });
  it("rejects DC wiki covers on Image books", () => {
    expect(coverSourceContradictsPublisher("dc_fandom_vol1", "Image")).toBe(true);
  });
});
