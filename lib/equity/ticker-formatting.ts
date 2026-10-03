// Constructs clean 4 to 5 character equity ticker symbols (NASDAQ / NYSE style)
// e.g., ASM01, AS300, ACT01, AC252, DET27, HK181, FF048, XMN94, BAT01, BA251, GSX01, TMNT1
export function formatComicEquityTicker(series: string, issue: string | number, _assetClass?: string): string {
  const cleanSeries = String(series || "").trim().toLowerCase();
  const normSeries = cleanSeries
    .replace(/^(the|marvel(?:'s)?|dc(?:'s)?)\s+/i, "")
    .replace(/&/g, "and")
    .trim();
  const rawIssue = String(issue ?? "1").trim();
  const cleanNum = rawIssue.replace(/\D/g, "");

  // Curated canonical mapping for landmark high-profile issues (strict on core flagship titles)
  if (normSeries === "action comics" && cleanNum === "1") return "ACT01";
  if (normSeries === "action comics" && cleanNum === "252") return "AC252";
  if (normSeries === "detective comics" && cleanNum === "27") return "DET27";
  if (normSeries === "amazing spider-man" && cleanNum === "1") return "ASM01";
  if (normSeries === "amazing spider-man" && cleanNum === "300") return "AS300";
  if (normSeries === "amazing spider-man" && cleanNum === "129") return "AS129";
  if ((normSeries === "incredible hulk" || normSeries === "hulk") && cleanNum === "181") return "HK181";
  if ((normSeries === "incredible hulk" || normSeries === "hulk") && cleanNum === "1") return "HLK01";
  if (normSeries === "fantastic four" && cleanNum === "48") return "FF048";
  if (normSeries === "fantastic four" && cleanNum === "1") return "FF001";
  if (normSeries === "fantastic four" && cleanNum === "52") return "FF052";
  if ((normSeries === "x-men" || normSeries === "uncanny x-men") && cleanNum === "1") return "XMN01";
  if ((normSeries === "x-men" || normSeries === "uncanny x-men") && cleanNum === "94") return "XMN94";
  if (normSeries === "giant-size x-men" && cleanNum === "1") return "GSX01";
  if (normSeries === "batman" && cleanNum === "1") return "BAT01";
  if (normSeries === "batman" && cleanNum === "251") return "BA251";
  if (normSeries === "tales of suspense" && cleanNum === "39") return "TOS39";
  if (normSeries === "tales of suspense" && cleanNum === "40") return "TOS40";
  if (normSeries === "journey into mystery" && cleanNum === "83") return "JIM83";
  if (normSeries === "journey into mystery" && cleanNum === "85") return "JIM85";
  if (normSeries === "showcase" && cleanNum === "4") return "SHC04";
  if (normSeries === "avengers" && cleanNum === "1") return "AVG01";
  if (normSeries === "avengers" && cleanNum === "4") return "AVG04";
  if ((normSeries.includes("ninja turtles") || normSeries.includes("tmnt")) && cleanNum === "1") return "TMNT1";
  if (normSeries === "secret wars" && cleanNum === "8") return "SW008";
  if (normSeries.includes("crime suspen") && cleanNum === "22") return "CSS22";
  if (normSeries === "strange tales" && cleanNum === "110") return "ST110";
  if (normSeries === "daredevil" && cleanNum === "1") return "DD001";
  if (normSeries === "daredevil" && cleanNum === "168") return "DD168";
  if (normSeries === "tomb of dracula" && cleanNum === "10") return "TOD10";
  if (normSeries === "watchmen" && cleanNum === "1") return "WCH01";
  if (normSeries.includes("dark knight returns") && cleanNum === "1") return "DKR01";
  if (normSeries === "new mutants" && cleanNum === "98") return "NM098";
  if (normSeries === "ultimate fallout" && cleanNum === "4") return "UF004";
  if (normSeries === "spawn" && cleanNum === "1") return "SPW01";
  if (normSeries === "mad" && cleanNum === "1") return "MAD01";
  if (normSeries === "aquaman" && cleanNum === "1") return "AQM01";

  // Specific spin-offs & distinct lines (must take precedence over generic prefixes)
  let root = "CMX";
  if (normSeries === "astonishing x-men") root = "AXM";
  else if (normSeries === "ultimate x-men") root = "UXM";
  else if (normSeries === "weapon x-men") root = "WXM";
  else if (normSeries === "new x-men") root = "NXM";
  else if (normSeries === "all-new x-men" || normSeries === "all new x-men") root = "ANX";
  else if (normSeries === "x-force") root = "XFC";
  else if (normSeries === "x-factor") root = "XFT";
  else if (normSeries === "uncanny avengers") root = "UAV";
  else if (normSeries === "new avengers") root = "NAV";
  else if (normSeries === "secret avengers") root = "SAV";
  else if (normSeries === "young avengers") root = "YAV";
  else if (normSeries === "west coast avengers") root = "WCA";
  else if (normSeries === "batman adventures") root = "BMA";
  else if (normSeries === "batman beyond") root = "BMB";
  else if (normSeries === "batman and robin") root = "BAR";
  else if (normSeries === "absolute batman") root = "ABM";
  else if (normSeries === "all-star batman" || normSeries === "all star batman") root = "ASB";
  else if (normSeries === "batman: the dark knight") root = "BDK";
  else if (normSeries === "batman: shadow of the bat") root = "BSB";
  else if (normSeries === "batman: legends of the dark knight") root = "LDK";
  else if (normSeries === "batman: white knight") root = "BWK";
  else if (normSeries === "spectacular spider-man" || normSeries === "peter parker: the spectacular spider-man") root = "SSM";
  else if (normSeries === "ultimate spider-man") root = "USM";
  else if (normSeries === "miles morales: spider-man") root = "MMS";
  else if (normSeries === "sensational spider-man") root = "SNS";
  else if (normSeries === "friendly neighborhood spider-man") root = "FNS";
  else if (normSeries === "web of spider-man") root = "WOS";
  // Flagship titles (strict matches)
  else if (normSeries === "action comics") root = "ACT";
  else if (normSeries === "detective comics") root = "DET";
  else if (normSeries === "amazing spider-man") root = "ASM";
  else if (normSeries === "spider-man") root = "SPD";
  else if (normSeries === "batman") root = "BAT";
  else if (normSeries === "superman") root = "SUP";
  else if (normSeries === "incredible hulk" || normSeries === "hulk") root = "HLK";
  else if (normSeries === "x-men") root = "XMN";
  else if (normSeries === "fantastic four") root = "FF";
  else if (normSeries === "avengers") root = "AVG";
  else if (normSeries === "tales of suspense") root = "TOS";
  else if (normSeries === "journey into mystery") root = "JIM";
  else if (normSeries === "strange tales") root = "ST";
  else if (normSeries === "daredevil") root = "DD";
  else if (normSeries === "iron man" || normSeries === "invincible iron man") root = "IRM";
  else if (normSeries === "captain america") root = "CAP";
  else if (normSeries === "thor") root = "TH";
  else if (normSeries === "wonder woman") root = "WW";
  else if (normSeries === "silver surfer") root = "SS";
  else if (normSeries === "green lantern") root = "GL";
  else if (normSeries === "aquaman") root = "AQM";
  else if (normSeries === "spawn") root = "SPW";
  else {
    const words = cleanSeries.replace(/[^a-zA-Z0-9\s]/g, "").split(/\s+/).filter(Boolean);
    if (words.length === 1) root = words[0].slice(0, 3).toUpperCase();
    else if (words.length === 2) root = (words[0].slice(0, 2) + words[1].slice(0, 1)).toUpperCase();
    else root = words.map((w) => w[0]).join("").slice(0, 3).toUpperCase();
  }

  // Combine with issue digits to guarantee strictly 4-5 characters
  if (!cleanNum) {
    return root.padEnd(4, "X").slice(0, 5);
  }

  if (cleanNum.length === 1) {
    const prefix = root.length >= 3 ? root.slice(0, 3) : root.padEnd(3, "0");
    return `${prefix}0${cleanNum}`.slice(0, 5);
  } else if (cleanNum.length === 2) {
    const prefix = root.length >= 3 ? root.slice(0, 3) : root.padEnd(3, "0");
    return `${prefix}${cleanNum}`.slice(0, 5);
  } else if (cleanNum.length === 3) {
    const prefix = root.length >= 2 ? root.slice(0, 2) : root.padEnd(2, "X");
    return `${prefix}${cleanNum}`.slice(0, 5);
  } else {
    const prefix = root.slice(0, 1) || "C";
    return `${prefix}${cleanNum.slice(-4)}`;
  }
}
