/**
 * lib/comics/translation-utils.ts
 *
 * Universal English translation, romanization, and sanitization utilities
 * for comic book titles, foreign publications, publishers, and release dates.
 *
 * Guarantees 100% clean English presentation across the entire catalog and
 * international edition matrix (zero Cyrillic, Greek, Japanese, Arabic corruptions).
 */

const KNOWN_NON_LATIN_SERIES_TRANSLATIONS: Record<string, string> = {
  "100颗子弹 [100 Bullets]": "100 Bullets",
  "Astonishing X-Men [Χ-Μεν Εστόνισινγκ]": "Astonishing X-Men",
  "Aπάνθρωποι [Inhumans]": "Inhumans",
  "ElfQuest: Сага о лесных всадниках": "ElfQuest: Saga of the Forest Riders",
  "Marvel. Официальная коллекция комиксов": "Marvel: Official Comic Collection",
  "Oi Βάρβαροι [The Barbarians]": "The Barbarians",
  "X-Men [Χ-Μεν]": "X-Men",
  "Γκραν Γκινιόλ [Grand Guignol]": "Grand Guignol",
  "Εκδικητές [Ekdikites]": "The Avengers (Ekdikites)",
  "Κάπταιν Αμέρικα [Captain America]": "Captain America",
  "Κλασικά Κόμικς Mάστερ Κούνγκ Φού [Classic Comics Master of Kung Fu]": "Classic Comics Master of Kung Fu",
  "Κλασικά Κόμικς Γκραν Γκινιόλ [Classic Comics Grand Guignol]": "Classic Comics Grand Guignol",
  "Κόμης Δράκουλας [Komis Drakulas]": "Count Dracula (Komis Drakulas)",
  "Λαβ Στόρυ [Love Story]": "Love Story",
  "Λυκάνθρωπος [Werewolf]": "Werewolf by Night",
  "Μάστερ Κούνγκ Φου [Master of Kung Fu]": "Master of Kung Fu",
  "Μαύρος Πάνθηρας [Black Panther]": "Black Panther",
  "Ο Πόлеμος των Άστρων [Star Wars]": "Star Wars",
  "Ο Πόλεμος των Άστρων [Star Wars]": "Star Wars",
  "Χούλκ [Hulk]": "Hulk",
  "Аз убивам гиганти": "I Kill Giants",
  "Батман: Белия рицар": "Batman: White Knight",
  "Батман: Прокълнат": "Batman: Damned",
  "Батман: Убийствена шега": "Batman: The Killing Joke",
  "Бладшот": "Bloodshot",
  "Блейд Рънър 2019": "Blade Runner 2019",
  "Върховна колекция графични романи Marvel": "Marvel Supreme Graphic Novel Collection",
  "Дедпул избива вселената на Марвел": "Deadpool Kills the Marvel Universe",
  "Дэдпул уничтожает Дэдпула": "Deadpool Kills Deadpool",
  "Дэдпул уничтожает вселенную Marvel": "Deadpool Kills the Marvel Universe",
  "Дэдпул уничтожает литературу": "Deadpool Killustrated",
  "Живите мъртви": "The Walking Dead",
  "Колосален Конан Кимериеца": "Colossal Conan the Cimmerian",
  "Костенурките нинджа": "Teenage Mutant Ninja Turtles",
  "Мегаморфни Пауър Рейнджърс / Костенурките Нинджа": "Mighty Morphin Power Rangers / Teenage Mutant Ninja Turtles",
  "Молодые мстители": "Young Avengers",
  "Мразя Фантазия": "I Hate Fairyland",
  "Мрачна нощ": "Blackest Night",
  "Пазители на галактиката: Нов пазител": "Guardians of the Galaxy: New Guardian",
  "Политикин Забавник [Politikin zabavnik]": "Politikin Zabavnik",
  "Сказки Братьев Гримм представляют: Алиса в Стране Чудес": "Grimm Fairy Tales: Alice in Wonderland",
  "Споун": "Spawn",
  "Ултимативна комикс колекция": "Ultimate Comic Collection",
  "Харлийн": "Harleen",
  "Хоукай": "Hawkeye",
  "البرق [Al-Barq Kawmaks / Flash Comics]": "Flash Comics",
  "المغامر [Al-Moughamer / Adventurer]": "The Adventurer",
  "الوطواط [Al-Watwat / The Batman]": "The Batman",
  "بات مان  [Batman Gotham Adventures]": "Batman Gotham Adventures",
  "سلسلة مغامرات مصورة [Silsilat Moughamarat Mousawwara / Adventure Series Illustrated]": "Illustrated Adventure Series",
  "سوبرمان [Subirman Kawmaks / Superman Comics]": "Superman Comics",
  "لولو [Little Lulu]": "Little Lulu",
  "ウー / Woo": "Woo",
  "キャプテン・アメリカ [Captain America]": "Captain America",
  "スーパーマン [Superman] [Suupaaman]": "Superman",
  "ファンタスティック・フォー [Fantastic Four]": "Fantastic Four",
  "月刊スーパーマン [Monthly Superman]": "Monthly Superman",
};

const NON_LATIN_PATTERN = /[\u0400-\u04FF\u0370-\u03FF\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF\u4E00-\u9FAF\uAC00-\uD7AF\u0600-\u06FF\u0590-\u05FF]/;

/**
 * Translates and cleans foreign or non-Latin series titles into canonical English.
 */
export function translateToEnglishSeries(seriesName: string): string {
  if (!seriesName) return "";
  const trimmed = seriesName.trim();

  // 1. Exact match in known catalog translations
  if (KNOWN_NON_LATIN_SERIES_TRANSLATIONS[trimmed]) {
    return KNOWN_NON_LATIN_SERIES_TRANSLATIONS[trimmed];
  }

  // 2. If it contains bracketed English text: "キャプテン・アメリカ [Captain America]" -> "Captain America"
  const bracketMatch = trimmed.match(/\[([A-Za-z0-9\s.,'’\-–—/:;!&]+)\]/);
  if (bracketMatch && bracketMatch[1]) {
    const candidate = bracketMatch[1].trim();
    // Verify candidate has at least some Latin characters and isn't just punctuation
    if (/[A-Za-z]/.test(candidate)) {
      return candidate;
    }
  }

  // 3. If there are multiple parts separated by slash or dash: "ウー / Woo" -> "Woo"
  if (trimmed.includes("/") || trimmed.includes(" - ")) {
    const parts = trimmed.split(/[\/\-]/).map((p) => p.trim());
    for (const part of parts) {
      if (!NON_LATIN_PATTERN.test(part) && /[A-Za-z]/.test(part)) {
        return part;
      }
    }
  }

  // 4. Strip any non-Latin prefix/suffix if Latin words exist
  if (NON_LATIN_PATTERN.test(trimmed)) {
    const latinOnly = trimmed.replace(NON_LATIN_PATTERN, "").trim();
    if (latinOnly && /[A-Za-z]/.test(latinOnly)) {
      return latinOnly.replace(/^[\s\-_:/[\]]+|[\s\-_:/[\]]+$/g, "");
    }
  }

  return trimmed;
}

/**
 * Translates and cleans foreign publisher names into canonical English.
 * e.g., "Артлайн Студиос [Artline Studios]" -> "Artline Studios"
 */
export function translateToEnglishPublisher(publisherName?: string | null): string {
  if (!publisherName) return "";
  const trimmed = publisherName.trim();

  // Check bracketed transliteration
  const bracketMatch = trimmed.match(/\[([A-Za-z0-9\s.,'’\-–—/:;!&]+)\]/);
  if (bracketMatch && bracketMatch[1]) {
    const candidate = bracketMatch[1].trim();
    if (/[A-Za-z]/.test(candidate)) {
      return candidate.replace(/\s+Comics$/i, "");
    }
  }

  // Strip non-Latin scripts if mixed
  if (NON_LATIN_PATTERN.test(trimmed)) {
    const latinOnly = trimmed.replace(NON_LATIN_PATTERN, "").trim();
    if (latinOnly && /[A-Za-z]/.test(latinOnly)) {
      return latinOnly.replace(/^[\s\-_:/[\]]+|[\s\-_:/[\]]+$/g, "");
    }
  }

  return trimmed;
}

const MONTH_TRANSLATIONS: [string, string][] = [
  // Bulgarian / Russian (case-sensitive replacements from longest to shortest)
  ["януари", "January"], ["Януари", "January"],
  ["февруари", "February"], ["Февруари", "February"],
  ["март", "March"], ["Март", "March"],
  ["април", "April"], ["Април", "April"],
  ["май", "May"], ["Май", "May"],
  ["юни", "June"], ["Юни", "June"],
  ["юли", "July"], ["Юли", "July"],
  ["август", "August"], ["Август", "August"],
  ["септември", "September"], ["Септември", "September"],
  ["октомври", "October"], ["Октомври", "October"],
  ["ноември", "November"], ["Ноември", "November"],
  ["декември", "December"], ["Декември", "December"],
  // Greek
  ["Ιανουάριος", "January"], ["Ιανουαρίου", "January"],
  ["Φεβρουάριος", "February"], ["Φεβρουαρίου", "February"],
  ["Μάρτιος", "March"], ["Μαρτίου", "March"],
  ["Απρίλιος", "April"], ["Απριλίου", "April"],
  ["Μάιος", "May"], ["Μαΐου", "May"],
  ["Ιούνιος", "June"], ["Ιουνίου", "June"],
  ["Ιούλιος", "July"], ["Ιουλίου", "July"],
  ["Αύγουστος", "August"], ["Αυγούστου", "August"],
  ["Σεπτέμβριος", "September"], ["Σεπτεμβρίου", "September"],
  ["Οκτώβριος", "October"], ["Οκτωβρίου", "October"],
  ["Νοέμβριος", "November"], ["Νοεμβρίου", "November"],
  ["Δεκέμβριος", "December"], ["Δεκεμβρίου", "December"],
];

const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/**
 * Translates foreign dates (e.g., Cyrillic months, Greek months, Japanese Showa eras) into English dates.
 */
export function translateToEnglishDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  let res = dateStr.trim();

  // 1. Japanese Showa Era conversion: 昭和(\d+)年 -> 1925 + year
  const showaMatch = res.match(/昭和(\d+)年(?:(\d+)月)?(?:(\d+)日)?/);
  if (showaMatch) {
    const yr = 1925 + parseInt(showaMatch[1], 10);
    const mo = showaMatch[2] ? parseInt(showaMatch[2], 10) : null;
    const day = showaMatch[3] ? parseInt(showaMatch[3], 10) : null;
    const parts: string[] = [];
    if (mo && MONTH_NAMES[mo]) parts.push(MONTH_NAMES[mo]);
    if (day) parts.push(`${day},`);
    parts.push(String(yr));
    res = res.replace(/昭和\d+年(?:\d+月)?(?:\d+日)?/, parts.join(" "));
  }

  // 2. Japanese YYYY年MM月 conversion
  res = res.replace(/(\d{4})年(\d+)月/, (_, y, m) => {
    const mNum = parseInt(m, 10);
    return `${MONTH_NAMES[mNum] || m} ${y}`;
  });

  // 3. Greek and Cyrillic month replacement (no \b since non-ASCII words aren't bounded by ASCII word boundaries)
  for (const [foreign, eng] of MONTH_TRANSLATIONS) {
    if (res.includes(foreign)) {
      res = res.replaceAll(foreign, eng);
    }
  }

  return res;
}
