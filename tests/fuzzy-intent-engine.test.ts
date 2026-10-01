import { describe, expect, it } from "vitest";
import {
  AMBIGUOUS_HONORIFIC_PREFIXES,
  inferIntendedProfile,
  paraphraseInferredPlaceholders,
  resolveFuzzyEntitiesForStory,
} from "@/lib/news/fuzzy-engine";
import { findNewsEntities, extractEntitiesFromContext } from "@/lib/news/entities";
import { parseAndSynthesizeArticle } from "@/lib/news/article-parser";
import { LORE_OBSCURE_COLLISION_BLOCKLIST } from "@/lib/wiki/lore-search";

describe("Fuzzy Logic Engine: Fuzzification, Inference, Defuzzification & Deference", () => {
  describe("Phase 1: Fuzzification (Ambiguity Identification)", () => {
    it("identifies all ambiguous honorifics and prefixes as non-standalone tokens", () => {
      expect(AMBIGUOUS_HONORIFIC_PREFIXES.has("doctor")).toBe(true);
      expect(AMBIGUOUS_HONORIFIC_PREFIXES.has("dr")).toBe(true);
      expect(AMBIGUOUS_HONORIFIC_PREFIXES.has("dr.")).toBe(true);
      expect(AMBIGUOUS_HONORIFIC_PREFIXES.has("captain")).toBe(true);
      expect(AMBIGUOUS_HONORIFIC_PREFIXES.has("professor")).toBe(true);
      expect(AMBIGUOUS_HONORIFIC_PREFIXES.has("agent")).toBe(true);
      expect(AMBIGUOUS_HONORIFIC_PREFIXES.has("lord")).toBe(true);
      expect(AMBIGUOUS_HONORIFIC_PREFIXES.has("mister")).toBe(true);
      expect(AMBIGUOUS_HONORIFIC_PREFIXES.has("mr")).toBe(true);
    });

    it("ensures LORE_OBSCURE_COLLISION_BLOCKLIST protects against bare honorific collisions like doctor-image", () => {
      expect(LORE_OBSCURE_COLLISION_BLOCKLIST.has("doctor")).toBe(true);
      expect(LORE_OBSCURE_COLLISION_BLOCKLIST.has("dr")).toBe(true);
      expect(LORE_OBSCURE_COLLISION_BLOCKLIST.has("captain")).toBe(true);
      expect(LORE_OBSCURE_COLLISION_BLOCKLIST.has("professor")).toBe(true);
      expect(LORE_OBSCURE_COLLISION_BLOCKLIST.has("mister")).toBe(true);
    });
  });

  describe("Phase 2: Intention & Inference (Domain Context Scoring)", () => {
    it("infers Doctor Who ($DWHO) when story context contains TARDIS, Daleks, or Time Lord", () => {
      const context = "BBC announces new season featuring the TARDIS and Daleks battling across time with Ncuti Gatwa.";
      const profile = inferIntendedProfile(context, "doctor");
      expect(profile).not.toBeNull();
      expect(profile?.id).toBe("doctor-who");
      expect(profile?.canonicalTerm).toBe("Doctor Who");
      expect(profile?.ticker).toBe("$DWHO");
      expect(profile?.wikiPath).toBe("/wiki/entry/the-doctor-earth-5556");
    });

    it("infers Doctor Strange ($STRG) when story context contains Sorcerer Supreme or Sanctum", () => {
      const context = "Marvel Studios multiversal incursions require the Sorcerer Supreme at the Sanctum Sanctorum with Stephen Strange.";
      const profile = inferIntendedProfile(context, "doctor");
      expect(profile).not.toBeNull();
      expect(profile?.id).toBe("doctor-strange");
      expect(profile?.canonicalTerm).toBe("Doctor Strange");
      expect(profile?.ticker).toBe("$STRG");
    });

    it("infers Doctor Doom ($DOOM) when story context contains Latveria or Victor Von Doom", () => {
      const context = "Robert Downey Jr. prepares for Secret Wars portraying Victor Von Doom from the sovereign nation of Latveria.";
      const profile = inferIntendedProfile(context, "doctor");
      expect(profile).not.toBeNull();
      expect(profile?.id).toBe("doctor-doom");
      expect(profile?.canonicalTerm).toBe("Doctor Doom");
      expect(profile?.ticker).toBe("$DOOM");
    });

    it("infers Doctor Octopus ($DOC) when story context contains Otto Octavius or Sinister Six", () => {
      const context = "Spider-Man faces the Sinister Six led by Otto Octavius wielding mechanical tentacles.";
      const profile = inferIntendedProfile(context, "doctor");
      expect(profile).not.toBeNull();
      expect(profile?.id).toBe("doctor-octopus");
      expect(profile?.canonicalTerm).toBe("Doctor Octopus");
      expect(profile?.ticker).toBe("$DOC");
    });

    it("infers Doctor Fate ($FATE) when story context contains Helmet of Nabu or Kent Nelson", () => {
      const context = "DC Studios explores the Justice Society of America and Kent Nelson wielding the mystical Helmet of Nabu.";
      const profile = inferIntendedProfile(context, "doctor");
      expect(profile).not.toBeNull();
      expect(profile?.id).toBe("doctor-fate");
      expect(profile?.canonicalTerm).toBe("Doctor Fate");
      expect(profile?.ticker).toBe("$FATE");
    });

    it("infers Doctor Manhattan ($WTCH) when story context contains Watchmen or Jon Osterman", () => {
      const context = "Alan Moore's classic graphic novel Watchmen depicts the godlike quantum transformation of Jon Osterman on Mars.";
      const profile = inferIntendedProfile(context, "doctor");
      expect(profile).not.toBeNull();
      expect(profile?.id).toBe("doctor-manhattan");
      expect(profile?.canonicalTerm).toBe("Doctor Manhattan");
      expect(profile?.ticker).toBe("$WTCH");
    });

    it("infers Star Trek ($TREK) for Captain Kirk or Picard aboard the Enterprise", () => {
      const context = "Paramount develops new serialized sci-fi exploring the USS Enterprise under Starfleet command.";
      const profile = inferIntendedProfile(context, "captain");
      expect(profile).not.toBeNull();
      expect(profile?.id).toBe("star-trek-fleet");
      expect(profile?.ticker).toBe("$TREK");
    });
  });

  describe("Phase 3: Defuzzification (Compound Binding & Paraphrasing)", () => {
    it("paraphrases 'doctir __________ ?' into 'Doctor Who?' given TARDIS and BBC context", () => {
      const rawText = "Is doctir __________ ? returning for the BBC holiday special?";
      const context = "BBC announces the TARDIS will materialize on Christmas Day with Daleks returning.";
      const paraphrased = paraphraseInferredPlaceholders(rawText, context);
      expect(paraphrased).toBe("Is Doctor Who? returning for the BBC holiday special?");
    });

    it("paraphrases 'Doctor _________ ?' into 'Doctor Strange?' given Sorcerer Supreme context", () => {
      const rawText = "Doctor _________ ? spotted at Sanctum Sanctorum";
      const context = "Stephen Strange and the Sorcerer Supreme confront multiversal rift.";
      const paraphrased = paraphraseInferredPlaceholders(rawText, context);
      expect(paraphrased).toBe("Doctor Strange? spotted at Sanctum Sanctorum");
    });

    it("paraphrases placeholder without question mark into clean character name", () => {
      const rawText = "Will doctor __________ join the Avengers lineup?";
      const context = "Stephen Strange is confirmed to lead the next Avengers team from the Sanctum.";
      const paraphrased = paraphraseInferredPlaceholders(rawText, context);
      expect(paraphrased).toBe("Will Doctor Strange join the Avengers lineup?");
    });

    it("resolves dynamic entities with unified compound tokens and tickers", () => {
      const context = "The BBC confirmed that the TARDIS and Daleks will feature in the new series.";
      const entities = resolveFuzzyEntitiesForStory(context);

      const doctorWhoEntity = entities.find((e) => e.term.toLowerCase() === "doctor who");
      expect(doctorWhoEntity).toBeDefined();
      expect(doctorWhoEntity?.ticker).toBe("$DWHO");
      expect(doctorWhoEntity?.wikiPath).toBe("/wiki/entry/the-doctor-earth-5556");

      // Verify bare "doctor" is NEVER in resolved entities
      const bareDoctor = entities.find((e) => e.term.toLowerCase() === "doctor");
      expect(bareDoctor).toBeUndefined();
    });
  });

  describe("Phase 4: Deference (Dropping Uncorroborated Matches)", () => {
    it("defers when doctor refers to a medical doctor without comic cues", () => {
      const medicalText = "The medical doctor conducted a routine pediatric examination at the city hospital.";
      const profile = inferIntendedProfile(medicalText, "doctor");
      expect(profile).toBeNull();

      const paraphrased = paraphraseInferredPlaceholders(medicalText, medicalText);
      expect(paraphrased).toBe(medicalText);

      const entities = resolveFuzzyEntitiesForStory(medicalText);
      const matchedDoctor = entities.find((e) => e.term.toLowerCase().includes("doctor"));
      expect(matchedDoctor).toBeUndefined();
    });

    it("never links bare honorifics to obscure database collision stubs like doctor-image", () => {
      const text = "Doctor advises resting for 48 hours after surgery.";
      const entities = extractEntitiesFromContext(text);
      const bareDoctor = entities.find((e) => e.term.toLowerCase() === "doctor");
      expect(bareDoctor).toBeUndefined();
    });
  });

  describe("Article Parser Integration with Fuzzy Paraphrasing", () => {
    it("synthesizes an article with a placeholder headline and infers Doctor Who correctly", () => {
      const story = {
        headline: "doctir __________ ? BBC Confirms Regeneration Special",
        summary: "The BBC has confirmed a landmark 60-minute episode featuring the TARDIS, Daleks, and Time Lord lore.",
        source: "BBC News",
      };

      const article = parseAndSynthesizeArticle(story);

      // 1. Headline is paraphrased cleanly
      expect(article.headline).toContain("Doctor Who");
      expect(article.headline).not.toContain("doctir __________");

      // 2. Entities include Doctor Who with sovereign ticker $DWHO
      const entityTerms = article.entities.map((e) => e.term.toLowerCase());
      expect(entityTerms.some((t) => t.includes("doctor who") || t.includes("the doctor"))).toBe(true);

      const dwhoEntity = article.entities.find((e) => e.ticker === "$DWHO");
      expect(dwhoEntity).toBeDefined();
      expect(dwhoEntity?.wikiPath).toBe("/wiki/entry/the-doctor-earth-5556");

      // 3. Superhero ramifications and butterfly ripples include $DWHO
      const dwhoRamification = article.superheroRamifications.find((r) => r.ticker === "$DWHO");
      expect(dwhoRamification).toBeDefined();
      expect(dwhoRamification?.cgc98Fmv).toBe("$18,500");

      const dwhoRipple = article.butterflyRipples.find((r) => r.ticker === "$DWHO");
      expect(dwhoRipple).toBeDefined();
      expect(dwhoRipple?.direction).toBe("surge");
    });
  });
});
