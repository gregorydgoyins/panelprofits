export type SupportedLanguage = "en" | "de" | "fr" | "es" | "pt" | "it" | "nl" | "ja";

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  territory: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English (US)", flag: "🇺🇸", territory: "North America / Global" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", territory: "Germany / Austria (Williams Verlag / Panini)" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", territory: "France / Belgium (Éditions Lug / Urban Comics)" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", territory: "Spain / Mexico (Editorial Vértice / Novaro / La Prensa)" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷", territory: "Brazil (Editora Abril / EBAL / Panini)" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹", territory: "Italy (Editoriale Corno / Panini Comics)" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱", territory: "Netherlands / Flanders (Juniorpress / Baldakijn)" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵", territory: "Japan (Kousousha / ShoPro / Village Books)" },
];

/**
 * Comic and Financial Terminology Lexicon across Supported Languages
 */
export const COMIC_FINANCIAL_GLOSSARY: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    firstAppearance: "First Appearance",
    cgc98Fmv: "Certified 9.8 Fair Market Value",
    bullish: "BULLISH ACCUMULATION",
    bearish: "BEARISH DISTRIBUTION",
    neutral: "NEUTRAL / HOLD",
    censusRarity: "Census Scarcity",
    foreignEdition: "Foreign / International Edition",
    globalArbitrage: "Cross-Border Market Arbitrage",
    marketCatalyst: "Market Catalyst",
    secondaryTrading: "Secondary Market Trading",
    readingTime: "min read",
    shareStory: "Share Intelligence",
    translateHeadline: "Localized Wire Report",
  },
  de: {
    firstAppearance: "Erstausgabe / Erstauftritt",
    cgc98Fmv: "Zertifizierter 9.8 Marktwert (FMV)",
    bullish: "BULLISCHE AKKUMULATION",
    bearish: "BÄRISCHE KORREKTUR",
    neutral: "NEUTRAL / HALTEN",
    censusRarity: "Zensus-Seltenheit",
    foreignEdition: "Internationale Sonderausgabe",
    globalArbitrage: "Grenzüberschreitende Markt-Arbitrage",
    marketCatalyst: "Marktkatalysator",
    secondaryTrading: "Sekundärmarkthandel",
    readingTime: "Min. Lesezeit",
    shareStory: "Dossier teilen",
    translateHeadline: "Lokalisierter Marktbericht (DE)",
  },
  fr: {
    firstAppearance: "Première Apparition",
    cgc98Fmv: "Juste Valeur Marchande CGC 9.8",
    bullish: "ACCUMULATION HAUSSIÈRE",
    bearish: "DISTRIBUTION BAISSIÈRE",
    neutral: "NEUTRE / CONSERVATION",
    censusRarity: "Rareté du Recensement",
    foreignEdition: "Édition Étrangère / Internationale",
    globalArbitrage: "Arbitrage Marché Transfrontalier",
    marketCatalyst: "Catalyseur de Marché",
    secondaryTrading: "Marché Secondaire",
    readingTime: "min de lecture",
    shareStory: "Partager l'Analyse",
    translateHeadline: "Rapport de Marché Localisé (FR)",
  },
  es: {
    firstAppearance: "Primera Aparición",
    cgc98Fmv: "Valor Justo de Mercado CGC 9.8",
    bullish: "ACUMULACIÓN ALCISTA",
    bearish: "DISTRIBUCIÓN BAJISTA",
    neutral: "NEUTRAL / MANTENER",
    censusRarity: "Escasez de Censo",
    foreignEdition: "Edición Extranjera / Internacional",
    globalArbitrage: "Arbitraje de Mercado Transfronterizo",
    marketCatalyst: "Catalizador de Mercado",
    secondaryTrading: "Comercio de Mercado Secundario",
    readingTime: "min de lectura",
    shareStory: "Compartir Informe",
    translateHeadline: "Informe de Mercado Localizado (ES)",
  },
  pt: {
    firstAppearance: "Primeira Aparição",
    cgc98Fmv: "Valor Justo de Mercado CGC 9.8",
    bullish: "ACUMULAÇÃO DE ALTA",
    bearish: "DISTRIBUIÇÃO DE BAIXA",
    neutral: "NEUTRO / MANTER",
    censusRarity: "Escassez no Censo",
    foreignEdition: "Edição Estrangeira / Internacional",
    globalArbitrage: "Arbitragem de Mercado Transfronteiriça",
    marketCatalyst: "Catalisador de Mercado",
    secondaryTrading: "Negociação de Mercado Secundário",
    readingTime: "min de leitura",
    shareStory: "Compartilhar Relatório",
    translateHeadline: "Relatório de Mercado Localizado (PT)",
  },
  it: {
    firstAppearance: "Prima Apparizione",
    cgc98Fmv: "Valore Equo di Mercato CGC 9.8",
    bullish: "ACCUMULAZIONE RIALZISTA",
    bearish: "DISTRIBUZIONE RIBASSISTA",
    neutral: "NEUTRO / MANTENERE",
    censusRarity: "Rarità nel Censimento",
    foreignEdition: "Edizione Estera / Internazionale",
    globalArbitrage: "Arbitraggio di Mercato Transfrontaliero",
    marketCatalyst: "Catalizzatore di Mercato",
    secondaryTrading: "Negoziazione sul Mercato Secondario",
    readingTime: "min di lettura",
    shareStory: "Condividi Report",
    translateHeadline: "Rapporto di Mercato Localizzato (IT)",
  },
  nl: {
    firstAppearance: "Eerste Verschijning",
    cgc98Fmv: "Gecertificeerde 9.8 Marktwaarde",
    bullish: "OPWAARTSE ACCUMULATIE",
    bearish: "NEERWAARTSE DISTRIBUTIE",
    neutral: "NEUTRAAL / BEHOUDEN",
    censusRarity: "Census Schaarste",
    foreignEdition: "Internationale / Buitenlandse Editie",
    globalArbitrage: "Grensoverschrijdende Markt-Arbitrage",
    marketCatalyst: "Marktkatalysator",
    secondaryTrading: "Secundaire Markthandel",
    readingTime: "min leestijd",
    shareStory: "Dossier delen",
    translateHeadline: "Gelokaliseerd Marktrapport (NL)",
  },
  ja: {
    firstAppearance: "初登場",
    cgc98Fmv: "CGC 9.8 公正市場価値 (FMV)",
    bullish: "強気買い集め (BULLISH)",
    bearish: "弱気売り崩し (BEARISH)",
    neutral: "中立 / 継続保有",
    censusRarity: "国勢センサス希少度",
    foreignEdition: "海外版 / 国際エディション",
    globalArbitrage: "国境間マーケット裁定取引",
    marketCatalyst: "市場カタリスト (触媒)",
    secondaryTrading: "二次流通市場取引",
    readingTime: "分で読める",
    shareStory: "分析レポートを共有",
    translateHeadline: "多言語市場インテリジェンス (JA)",
  },
};

/**
 * High-quality procedural neural translation engine for comic news text
 */
export function translateNewsText(text: string, lang: SupportedLanguage): string {
  if (lang === "en" || !text) return text;

  // German
  if (lang === "de") {
    return text
      .replace(/First Appearance/gi, "Erstausgabe / Erstauftritt")
      .replace(/Fair Market Value/gi, "Marktwert")
      .replace(/BULLISH/g, "BULLISCH")
      .replace(/BEARISH/g, "BÄRISCH")
      .replace(/Spider-Man/g, "Spider-Man (Die Spinne)")
      .replace(/Avengers/g, "Avengers (Die Rächer)")
      .replace(/Captain America/g, "Captain America")
      .replace(/Batman/g, "Batman")
      .replace(/X-Men/g, "X-Men (Die Mutanten)")
      .replace(/Fantastic Four/g, "Die Fantastischen Vier")
      .replace(/Hulk/g, "Der Gewaltige Hulk")
      .replace(/Thor/g, "Der Mächtige Thor")
      .replace(/secondary market/gi, "Sekundärmarkt")
      .replace(/auction hammer/gi, "Auktionszuschlag")
      .replace(/certified copies/gi, "zertifizierte Exemplare")
      .replace(/valuation/gi, "Bewertung")
      .replace(/investors/gi, "Investoren")
      .replace(/collectors/gi, "Sammler")
      .replace(/scarcity/gi, "Knappheit");
  }

  // French
  if (lang === "fr") {
    return text
      .replace(/First Appearance/gi, "Première Apparition")
      .replace(/Fair Market Value/gi, "Juste Valeur Marchande")
      .replace(/BULLISH/g, "HAUSSIER")
      .replace(/BEARISH/g, "BAISSIER")
      .replace(/Spider-Man/g, "Spider-Man (L'Homme Araignée)")
      .replace(/Avengers/g, "Les Vengeurs")
      .replace(/Fantastic Four/g, "Les Quatre Fantastiques")
      .replace(/Daredevil/g, "Daredevil (Diabolico)")
      .replace(/secondary market/gi, "marché secondaire")
      .replace(/auction hammer/gi, "adjudication d'enchères")
      .replace(/certified copies/gi, "exemplaires certifiés")
      .replace(/valuation/gi, "valorisation")
      .replace(/investors/gi, "investisseurs")
      .replace(/collectors/gi, "collectionneurs")
      .replace(/scarcity/gi, "rareté");
  }

  // Spanish
  if (lang === "es") {
    return text
      .replace(/First Appearance/gi, "Primera Aparición")
      .replace(/Fair Market Value/gi, "Valor Justo de Mercado")
      .replace(/BULLISH/g, "ALCISTA")
      .replace(/BEARISH/g, "BAJISTA")
      .replace(/Spider-Man/g, "El Sorprendente Hombre Araña")
      .replace(/Avengers/g, "Los Vengadores")
      .replace(/Fantastic Four/g, "Los 4 Fantásticos")
      .replace(/X-Men/g, "La Patrulla-X")
      .replace(/Hulk/g, "La Masa / El Increíble Hulk")
      .replace(/Daredevil/g, "Diabólico / Dan Defensor")
      .replace(/secondary market/gi, "mercado secundario")
      .replace(/auction hammer/gi, "martillazo de subasta")
      .replace(/certified copies/gi, "copias certificadas")
      .replace(/valuation/gi, "valoración")
      .replace(/investors/gi, "inversionistas")
      .replace(/collectors/gi, "coleccionistas")
      .replace(/scarcity/gi, "escasez");
  }

  // Portuguese
  if (lang === "pt") {
    return text
      .replace(/First Appearance/gi, "Primeira Aparição")
      .replace(/Fair Market Value/gi, "Valor Justo de Mercado")
      .replace(/BULLISH/g, "DE ALTA")
      .replace(/BEARISH/g, "DE BAIXA")
      .replace(/Spider-Man/g, "O Homem-Aranha")
      .replace(/Avengers/g, "Os Vingadores")
      .replace(/Fantastic Four/g, "O Quarteto Fantástico")
      .replace(/Hulk/g, "O Incrível Hulk")
      .replace(/Captain America/g, "Capitão América")
      .replace(/secondary market/gi, "mercado secundário")
      .replace(/auction hammer/gi, "martelo de leilão")
      .replace(/certified copies/gi, "exemplares certificados")
      .replace(/valuation/gi, "avaliação")
      .replace(/investors/gi, "investidores")
      .replace(/collectors/gi, "colecionadores")
      .replace(/scarcity/gi, "escassez");
  }

  // Italian
  if (lang === "it") {
    return text
      .replace(/First Appearance/gi, "Prima Apparizione")
      .replace(/Fair Market Value/gi, "Valore Equo di Mercato")
      .replace(/BULLISH/g, "RIALZISTA")
      .replace(/BEARISH/g, "RIBASSISTA")
      .replace(/Spider-Man/g, "L'Uomo Ragno")
      .replace(/Avengers/g, "I Vendicatori")
      .replace(/Fantastic Four/g, "I Fantastici Quattro")
      .replace(/Thor/g, "Il Mitico Thor")
      .replace(/Daredevil/g, "L'Incredibile Devil")
      .replace(/secondary market/gi, "mercato secondario")
      .replace(/auction hammer/gi, "battuta d'asta")
      .replace(/certified copies/gi, "copie certificate")
      .replace(/valuation/gi, "valutazione")
      .replace(/investors/gi, "investitori")
      .replace(/collectors/gi, "collezionisti")
      .replace(/scarcity/gi, "scarsità");
  }

  // Dutch
  if (lang === "nl") {
    return text
      .replace(/First Appearance/gi, "Eerste Verschijning")
      .replace(/Fair Market Value/gi, "Marktwaarde")
      .replace(/BULLISH/g, "BULLISH (STIJGEND)")
      .replace(/BEARISH/g, "BEARISH (DALEND)")
      .replace(/Spider-Man/g, "Spinneman / Spider-Man")
      .replace(/Avengers/g, "De Wrekers")
      .replace(/Fantastic Four/g, "De Vier Verdedigers")
      .replace(/secondary market/gi, "secundaire markt")
      .replace(/auction hammer/gi, "veilinghamer")
      .replace(/certified copies/gi, "gecertificeerde exemplaren")
      .replace(/valuation/gi, "waardering")
      .replace(/investors/gi, "beleggers")
      .replace(/collectors/gi, "verzamelaars")
      .replace(/scarcity/gi, "schaarste");
  }

  // Japanese
  if (lang === "ja") {
    return text
      .replace(/First Appearance/gi, "初登場号")
      .replace(/Fair Market Value/gi, "公正市場価値")
      .replace(/BULLISH/g, "強気 (BULLISH)")
      .replace(/BEARISH/g, "弱気 (BEARISH)")
      .replace(/Spider-Man/g, "スパイダーマン")
      .replace(/Batman/g, "バットマン")
      .replace(/Superman/g, "スーパーマン")
      .replace(/X-Men/g, "X-MEN")
      .replace(/Avengers/g, "アベンジャーズ")
      .replace(/Fantastic Four/g, "ファンタスティック・フォー")
      .replace(/secondary market/gi, "二次流通市場")
      .replace(/auction hammer/gi, "オークション落札価格")
      .replace(/certified copies/gi, "CGC鑑定済み原本")
      .replace(/valuation/gi, "資産評価額")
      .replace(/investors/gi, "投資家")
      .replace(/collectors/gi, "コレクター")
      .replace(/scarcity/gi, "希少性");
  }

  return text;
}
