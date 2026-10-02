import { SURFACE_COLORS, type SurfaceKey } from './surfaceConfig';
import type { AssetItem } from './types';

export function formatNumber(n: number, decimals = 2): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatUSD(cents: number): string {
  const val = cents / 100;
  const sign = val < 0 ? '-' : '';
  return `${sign}$${formatNumber(Math.abs(val))}`;
}

export function formatFirstAppeared(raw: any): string {
  const str = String(raw ?? '');
  if (!str || str === 'Unknown' || str === '—') return '—';
  const yearMatch = str.match(/(\d{4})/);
  if (!yearMatch) return str;
  const yearShort = yearMatch[1].slice(2);
  const monthMatch = str.match(/(January|February|March|April|May|June|July|August|September|October|November|December)/i);
  if (monthMatch) return `${monthMatch[1].slice(0, 3)}-${yearShort}`;
  return yearMatch[1];
}

export function appearanceDepthLabel(n: number): string {
  if (n >= 2000) return 'Flagship character';
  if (n >= 1000) return 'Major character';
  if (n >= 500)  return 'Established character';
  if (n >= 100)  return 'Supporting character';
  if (n > 0)     return 'Emerging character';
  return 'Unconfirmed appearances';
}

export function appearanceIssueLabel(n: number): string {
  if (n >= 2000) return 'Flagship';
  if (n >= 1000) return 'Major';
  if (n >= 500)  return 'Established';
  if (n >= 100)  return 'Supporting';
  if (n > 0)     return 'Emerging';
  return 'Unconfirmed';
}

export function aliveSignal(alive: string): string {
  if (!alive) return '';
  return alive === 'Yes' ? 'Active position' : alive === 'No' ? 'Rebirth premium · Deceased' : '';
}

export function alignmentLabel(alignment: string): string {
  const a = (alignment || '').toLowerCase();
  if (a === 'good')    return 'Blue-chip alignment';
  if (a === 'bad')     return 'Contrarian exposure';
  if (a === 'neutral') return 'Market-neutral';
  if (a.includes('reformed')) return 'Reformed · Long recovery';
  return '';
}

const KNOWN_TICKER_MAP: Record<string, string> = {
  // Characters & Heroes
  'SPIDER_MAN': '$SPID', 'PP-CHAR-SPIDER_MAN': '$SPID',
  'BATMAN': '$BAT', 'PP-CHAR-BATMAN': '$BAT',
  'SUPERMAN': '$SUPR', 'PP-CHAR-SUPERMAN': '$SUPR',
  'WOLVERINE': '$WOLV', 'PP-CHAR-WOLVERINE': '$WOLV',
  'IRON_MAN': '$IRON', 'PP-CHAR-IRON_MAN': '$IRON',
  'CAPTAIN_AMERICA': '$CAP', 'PP-CHAR-CAPTAIN_AMERICA': '$CAP',
  'WONDER_WOMAN': '$WWOM', 'PP-CHAR-WONDER_WOMAN': '$WWOM',
  'BLACK_PANTHER': '$PNTR', 'PP-CHAR-BLACK_PANTHER': '$PNTR',
  'THOR': '$THOR', 'PP-CHAR-THOR': '$THOR',
  'HULK': '$HULK', 'PP-CHAR-HULK': '$HULK',
  'VENOM': '$VNOM', 'PP-CHAR-VENOM': '$VNOM',
  'ROBIN': '$ROBN', 'PP-CHAR-ROBIN': '$ROBN',
  'FLASH': '$FLSH', 'PP-CHAR-FLASH': '$FLSH',
  'AQUAMAN': '$AQUA', 'PP-CHAR-AQUAMAN': '$AQUA',
  'CYBORG': '$CYBG', 'PP-CHAR-CYBORG': '$CYBG',

  // Villains & Antagonists
  'DOCTOR_DOOM': '$DOOM', 'PP-VIL-DOCTOR_DOOM': '$DOOM',
  'JOKER': '$JKR', 'PP-VIL-JOKER': '$JKR',
  'MAGNETO': '$MAGN', 'PP-VIL-MAGNETO': '$MAGN',
  'THANOS': '$THNS', 'PP-VIL-THANOS': '$THNS',
  'GREEN_GOBLIN': '$GBLN', 'PP-VIL-GREEN_GOBLIN': '$GBLN',
  'LOKI': '$LOKI', 'PP-VIL-LOKI': '$LOKI',
  'LEX_LUTHOR': '$LEX', 'PP-VIL-LEX_LUTHOR': '$LEX',

  // Teams & Roster Baskets
  'AVENGERS': '$AVNG', 'PP-TEAM-AVENGERS': '$AVNG',
  'X_MEN': '$XMEN', 'PP-TEAM-X_MEN': '$XMEN',
  'JUSTICE_LEAGUE': '$JLA', 'PP-TEAM-JUSTICE_LEAGUE': '$JLA',
  'FANTASTIC_FOUR': '$FF4', 'PP-TEAM-FANTASTIC_FOUR': '$FF4',
  'SUICIDE_SQUAD': '$SUIC', 'PP-TEAM-SUICIDE_SQUAD': '$SUIC',

  // Publisher Stocks & Equities
  'DIS': '$DIS', 'PP-STOCK-DIS': '$DIS',
  'WBD': '$WBD', 'PP-STOCK-WBD': '$WBD',
  'HAS': '$HAS', 'PP-STOCK-HAS': '$HAS',
  'CGC-BENCH': '$CGC', 'PP-STOCK-CGC-BENCH': '$CGC',

  // Indexes & ETFs
  'MARVEL_50_INDEX_ETF': '$MRK50', 'PP-ETF-MRK50': '$MRK50',
  'GOLDEN_AGE_INDEX': '$GOLD', 'PP-IDX-GOLD': '$GOLD',
  'SILVER_AGE_INDEX': '$SILV', 'PP-IDX-SILV': '$SILV',
  'DC_CORE_30': '$DC30', 'PP-IDX-DC30': '$DC30',

  // Gadgets & Artefacts
  'MJOLNIR': '$MJOL', 'PP-GAD-MJOLNIR': '$MJOL',
  'INFINITY_GAUNTLET': '$GANT', 'PP-GAD-INFINITY_GAUNTLET': '$GANT',
  'BATMOBILE': '$BATMB', 'PP-GAD-BATMOBILE': '$BATMB',

  // Locations & Realities
  'WAKANDA': '$WAK', 'PP-LOC-WAKANDA': '$WAK',
  'GOTHAM_CITY': '$GOTH', 'PP-LOC-GOTHAM_CITY': '$GOTH',
  'EARTH_616': '$E616', 'PP-REAL-EARTH_616': '$E616',

  // Commodities
  'VIBRANIUM': '$VIB', 'PP-CMDT-VIBRANIUM': '$VIB',
  'ADAMANTIUM': '$ADM', 'PP-CMDT-ADAMANTIUM': '$ADM',
  'KRYPTONITE': '$KRYP', 'PP-CMDT-KRYPTONITE': '$KRYP',
};

export function formatHumanTicker(symbol: any, displayName?: string, assetType?: string): string {
  const sym = String(symbol ?? '').trim();
  if (!sym) return '$ASSET';
  const cleanSym = sym.toUpperCase();

  if (KNOWN_TICKER_MAP[cleanSym]) {
    return KNOWN_TICKER_MAP[cleanSym];
  }

  // 1. OPTIONS / DERIVATIVES family
  if (assetType === 'OPTIONS' || cleanSym.includes('OPT') || cleanSym.includes('CALL') || cleanSym.includes('PUT')) {
    const isCall = cleanSym.includes('CALL') || cleanSym.includes('-C-');
    const isPut  = cleanSym.includes('PUT')  || cleanSym.includes('-P-');
    const typeCode = isCall ? 'C' : isPut ? 'P' : 'OPT';
    const numMatch = cleanSym.match(/\d+/);
    const strike = numMatch ? numMatch[0] : '';
    const baseName = cleanSym.replace(/^PP-(?:OPT|CALL|PUT)-/i, '').replace(/-(?:CALL|PUT|C|P)-\d+$/i, '').replace(/\d+/g, '').replace(/[-_]/g, '');
    const baseCode = baseName.slice(0, 4) || 'OPT';
    return `$${baseCode}-${typeCode}${strike}`;
  }

  // 2. FIXED INCOME & TREASURIES family (TREASURY, RATES, CREDIT, CONVERTIBLE, BOND)
  if (assetType === 'TREASURY' || assetType === 'RATES' || assetType === 'CREDIT' || assetType === 'CONVERTIBLE' || cleanSym.includes('BND') || cleanSym.includes('TREAS')) {
    if (cleanSym.includes('10Y')) return '$TREAS-10Y';
    if (cleanSym.includes('5Y'))  return '$TREAS-5Y';
    if (cleanSym.includes('2Y'))  return '$TREAS-2Y';
    if (assetType === 'RATES') return '$RATES';
    if (assetType === 'CREDIT') return '$CRED';
    return '$BND';
  }

  // 3. ETFs & INDEXES family (ETF, INDEX, MACRO, VOLATILITY, QUANT)
  if (assetType === 'ETF' || assetType === 'INDEX' || assetType === 'VOLATILITY' || assetType === 'MACRO' || assetType === 'QUANT') {
    const clean = cleanSym.replace(/^PP-(?:ETF|IDX)-/i, '').replace(/_INDEX|_ETF|_FUND/i, '');
    if (clean.length <= 6) return `$${clean}`;
  }

  // 4. PREDICTION / CATALYST family
  if (assetType === 'PREDICTION' || assetType === 'CATALYST' || assetType === 'MERGER_ARB') {
    const numMatch = cleanSym.match(/\d+/);
    const code = cleanSym.replace(/^PP-(?:PRED|CAT|ARB)-/i, '').replace(/\d+/g, '').replace(/[-_]/g, '').slice(0, 4);
    return `$PRED-${code}${numMatch ? numMatch[0] : ''}`;
  }

  // General fallback logic for any remaining sub-family symbol
  let s = cleanSym
    .replace(/^PP-(?:CHAR|ALS|CRT|VIL|LOC|TEAM|GAD|FILM|REAL|IDX|PET|PWR|WKN|DCCHAR|DCTEAM|DEAD|BSTAT|STOCK|BND|TREAS|CMDT|ETF|PUB|OPT|PRED|CAT)-/i, '')
    .replace(/^(?:COMM|FX|VOL|IDX|OPT|NFT|BOND|ETF|FUND|HEDGE|REIT|STRUCT|TREAS|PRIV|SWAP|CRED|CRYP)-/i, '');

  s = s.replace(/-(?:EARTH|PRIME|ULTIMATE|NU|UNIVERSE)-\d+$/i, '');

  const parts = s.split(/[-_\s]+/).filter(Boolean);
  let tickerCode = '';
  if (parts.length === 1) {
    const word = parts[0];
    if (word.length <= 5) {
      tickerCode = word;
    } else {
      const first = word.charAt(0);
      const restConsonants = word.slice(1).replace(/[AEIOU]/g, '');
      const code = (first + restConsonants).slice(0, 4);
      tickerCode = code.length >= 3 ? code : word.slice(0, 4);
    }
  } else if (parts.length === 2) {
    tickerCode = parts[0].slice(0, 2) + parts[1].slice(0, 2);
  } else {
    tickerCode = parts.slice(0, 4).map(p => p.charAt(0)).join('');
  }

  return `$${tickerCode.toUpperCase()}`;
}

export function symbolToReadableName(symbol: any, assetType?: string): string {
  const symStr = String(symbol ?? '').trim();
  if (!symStr) return assetType || 'Asset';
  let s = symStr
    .replace(/^PP-(?:CHAR|ALS|CRT|VIL|LOC|TEAM|GAD|FILM|REAL|IDX|PET|PWR|WKN|DCCHAR|DCTEAM|DEAD|BSTAT)-/i, '')
    .replace(/^(?:COMM|FX|VOL|IDX|OPT|NFT|BOND|ETF|FUND|HEDGE|REIT|STRUCT|TREAS|PRIV|SWAP|CRED|CRYP)-/i, '');
  s = s.replace(/-(?:earth|prime|ultimate|nu|universe)-\d+$/i, '');
  const titled = s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  return titled || assetType || 'Asset';
}

export function resolveCardDisplayName(item: AssetItem, assetType: string): string {
  if (item.displayName && item.displayName.trim()) return item.displayName.trim();
  return symbolToReadableName(item.symbol, assetType);
}

function fmt2(a: string | null, b: string | null): string {
  return [a, b].filter(Boolean).join(' · ');
}

export function getTypeLabel(item: AssetItem, assetType: string): string {
  if (!item) return assetType || 'Asset';
  const pricing = item?.pricing || {};
  const params  = item?.parameters || {};
  const get = <T = unknown>(k: string): T => (pricing[k] ?? params[k]) as T;

  switch (assetType) {
    case 'CHARACTER': {
      const power = get<number>('power_total') || 0;
      const app   = get<number>('appearances') || 0;
      const debut = get<string>('first_appeared') || '';
      if (power > 0) return fmt2(`Pwr ${power}`, app > 0 ? `${app.toLocaleString()} iss` : null);
      return fmt2(debut ? formatFirstAppeared(debut) : null, app > 0 ? `${app.toLocaleString()} iss` : null);
    }
    case 'VILLAIN': {
      const power = get<number>('power_total') || 0;
      const app   = get<number>('appearances') || 0;
      const debut = get<string>('first_appeared') || '';
      if (power > 0) return fmt2(`Threat ${power}`, app > 0 ? `${app.toLocaleString()} iss` : null);
      return fmt2(debut ? formatFirstAppeared(debut) : null, app > 0 ? `${app.toLocaleString()} iss` : null);
    }
    case 'ALIAS': {
      const identity = get<string>('identity') || 'Secret';
      const debut    = get<string>('first_appeared') || get<string>('first_appearance') || '';
      const app      = get<number>('appearances') || 0;
      return fmt2(identity, debut ? formatFirstAppeared(debut) : app > 0 ? `${app.toLocaleString()} iss` : null);
    }
    case 'TEAM': {
      const members   = get<number>('member_count') || 0;
      const alignment = (get<string>('alignment') || '').toLowerCase();
      const tag = alignment === 'bad' ? 'Syndicate' : alignment === 'neutral' ? 'Neutral' : 'Coalition';
      return fmt2(tag, members > 0 ? `${members.toLocaleString()} members` : null);
    }
    case 'GADGET': {
      const category = get<string>('category') || 'Gadget';
      const wielder  = get<string>('wielder') || '';
      return fmt2(category, wielder || null);
    }
    case 'LOCATION': {
      const locType = (get<string>('location_type') || 'Location').replace(/_/g, ' ');
      const aff     = get<string>('affiliation') || '';
      return fmt2(locType, aff || null);
    }
    case 'CREATOR': {
      const role  = get<string>('role') || 'Creator';
      const count = get<number>('issue_count') || 0;
      const pub   = (get<string>('publisher') || '') as string;
      return fmt2(role, count > 0 ? `${count.toLocaleString()} iss${pub ? ` · ${pub}` : ''}` : null);
    }
    case 'REALITY': {
      const pub = get<string>('publisher') || 'Multiverse';
      const des = get<string>('designation') || get<string>('universe') || '';
      return fmt2(pub, des || null);
    }
    case 'FILM': {
      const phase  = get<string | number>('phase');
      const tomato = get<number>('tomato_meter') || 0;
      return fmt2(phase ? `Phase ${phase}` : null, tomato > 0 ? `RT ${tomato}%` : null);
    }
    case 'INDEX': {
      const count  = get<number>('constituents') || 0;
      const method = (get<string>('method') || 'weighted').replace(/_/g, '-');
      return fmt2(count > 0 ? `${count.toLocaleString()} instr` : null, method);
    }
    case 'OPTIONS': {
      const bucket      = String(item.diversityBucket || '').toLowerCase();
      const sym         = String(item.symbol || '').toUpperCase();
      const isStraddle  = bucket === 'straddle'  || sym.includes('-STR-');
      const isButterfly = bucket === 'butterfly' || sym.includes('-BTF-');
      const isCall      = !isStraddle && !isButterfly && (bucket === 'call' || sym.includes('-C-'));
      const strike      = (pricing.strike as number) || 0;
      const expiry      = (pricing.expiry_tick as number) || 0;
      const tag         = isStraddle ? 'Straddle' : isButterfly ? 'Butterfly' : isCall ? 'Call' : 'Put';
      return fmt2(tag, strike > 0 ? `$${formatNumber(strike)} · T${expiry}` : null);
    }
    case 'CREDIT': {
      const rating = (pricing.credit_rating as string) || 'NR';
      const coupon = (pricing.coupon as number) || 0;
      return fmt2(rating, `${coupon.toFixed(2)}% cpn`);
    }
    case 'VOLATILITY': {
      const level = ((pricing.level as number) || 0) / 100;
      return level >= 40 ? 'High Vol' : level >= 20 ? 'Moderate Vol' : 'Low Vol';
    }
    case 'SWAPS': {
      const notional = (pricing.notional_cents as number) || 0;
      return fmt2('TRS', formatUSD(notional));
    }
    case 'BOND': {
      const species  = String(get<string>('species') || '').toUpperCase();
      const duration = get<number>('duration_months') || 0;
      const coupon   = get<number>('coupon_pct') || get<number>('coupon') || 0;
      const yrs      = duration > 0 ? `${Math.round(duration / 12)}Y` : '';
      const label    = species === 'MUNICIPAL' ? 'Muni' : species === 'TRUST' ? 'Trust' : species === 'CORPORATE' ? 'Corp' : 'Bond';
      return fmt2(yrs ? `${yrs} ${label}` : label, coupon > 0 ? `${coupon.toFixed(2)}% cpn` : null);
    }
    case 'ETF': {
      const count = get<number>('constituents') || 0;
      const er    = get<number>('expense_ratio') || 0;
      return fmt2(count > 0 ? `${count} holdings` : 'ETF', er > 0 ? `${(er * 100).toFixed(2)}% ER` : null);
    }
    case 'FUND': {
      const fundType   = (get<string>('fund_type') || '').replace(/_/g, ' ');
      const isThematic = fundType.toLowerCase().includes('thematic');
      if (isThematic) {
        const count = get<number>('constituent_count') || 0;
        return fmt2('Thematic', count > 0 ? `${count} pos` : null);
      }
      const strategy = (get<string>('strategy') || 'Fund').replace(/_/g, ' ');
      const trailing  = get<number>('trailing_1y') || 0;
      const sign      = trailing >= 0 ? '+' : '';
      return fmt2(strategy, trailing !== 0 ? `1Y ${sign}${(trailing * 100).toFixed(1)}%` : null);
    }
    case 'FUTURES': {
      const underlying = get<string>('underlying') || 'Asset';
      const expiry     = get<number>('expiry_tick') || 0;
      return fmt2(underlying, expiry > 0 ? `T${expiry}` : null);
    }
    case 'REIT': {
      const propType  = (get<string>('property_type') || 'Property').replace(/_/g, ' ');
      const distYield = get<number>('distribution_yield') || 0;
      return fmt2(propType, distYield > 0 ? `${(distYield * 100).toFixed(1)}% yield` : null);
    }
    case 'STRUCTURED': {
      const prodType = (get<string>('product_type') || 'Structured').replace(/_/g, ' ');
      const tranche  = get<string>('tranche') || '';
      return fmt2(prodType, tranche || null);
    }
    case 'TREASURY': {
      const matMo    = get<number>('maturity_months') || 0;
      const instType = get<string>('instrument_type') || 'Treasury';
      const yrs      = matMo > 0 ? `${Math.round(matMo / 12)}Y` : '';
      return yrs ? `${yrs} ${instType}` : instType;
    }
    case 'PRIVATE': {
      const fundType = (get<string>('fund_type') || 'Private Equity').replace(/_/g, ' ');
      const irr      = get<number>('target_irr') || 0;
      return fmt2(fundType, irr > 0 ? `${(irr * 100).toFixed(0)}% IRR` : null);
    }
    case 'HEDGE': {
      const strategy = (get<string>('strategy') || 'Hedge Fund').replace(/_/g, ' ');
      const sharpe   = get<number>('sharpe') || 0;
      return fmt2(strategy, sharpe > 0 ? `Sharpe ${sharpe.toFixed(2)}` : null);
    }
    case 'COMMODITY': {
      const kDecay = get<number>('k_decay') || 0;
      const dOverS = get<number>('d_over_s') || 1;
      return fmt2(kDecay >= 0 ? 'Inflationary' : 'Deflationary', `D/S ${dOverS.toFixed(2)}x`);
    }
    case 'CURRENCY': {
      const ticker    = get<string>('ticker') || 'FX';
      const mFrag     = get<number>('m_fragility') || 0;
      const stability = mFrag <= 0.15 ? 'Stable' : mFrag <= 0.35 ? 'Fragile' : 'Volatile';
      return fmt2(ticker, stability);
    }
    case 'PREDICTION': {
      const prob = get<number>('implied_probability') || 50;
      const cat  = (get<string>('category') || 'general').replace(/_/g, ' ');
      return fmt2(cat, `${prob}% YES`);
    }
    case 'CRYPTO': {
      const ticker  = get<string>('ticker') || '';
      const useCase = (get<string>('use_case') || 'Crypto').replace(/_/g, ' ');
      return fmt2(ticker || null, useCase);
    }
    case 'NFT': {
      const rarity = get<string>('rarity_tier') || 'NFT';
      const supply = get<number>('total_supply') || 0;
      return fmt2(rarity, supply === 1 ? '1 of 1' : supply > 1 ? `${supply} eds` : null);
    }
    case 'DC_CHARACTER': {
      const teamCount  = get<number>('team_count') || 0;
      const identity   = get<string>('identity') || '';
      const continuity = get<string>('continuity') || '';
      return fmt2(identity || continuity || 'DC', teamCount > 0 ? `${teamCount} teams` : null);
    }
    case 'DC_TEAM': {
      const members = get<number>('member_count') || 0;
      return fmt2('DC Coalition', members > 0 ? `${members.toLocaleString()} members` : null);
    }
    case 'BATTLE_STATS': {
      const composite = get<number>('composite_score') || 0;
      const winRate   = get<number>('win_rate') || 0;
      return fmt2(`Score ${composite}`, winRate > 0 ? `${Math.round(winRate * 100)}% win` : null);
    }
    case 'TEAM_UP': {
      const uni = get<string>('universe') || 'Marvel';
      const app = get<number>('appearances') || 0;
      return fmt2(uni, app > 0 ? `${app.toLocaleString()} iss` : null);
    }
    case 'EVENT': {
      const year   = get<string | number>('year') || '';
      const issues = get<number>('issues') || 0;
      return fmt2(year ? `${year}` : null, issues > 0 ? `${issues} issues` : null);
    }
    case 'CROSSOVER': {
      const uni  = get<string>('universe') || 'Cross-Publisher';
      const year = get<string | number>('year') || '';
      return fmt2(uni, year ? `${year}` : null);
    }
    case 'VILLAIN_TEAM': {
      const members = get<number>('member_count') || 0;
      const uni     = get<string>('universe') || '';
      return fmt2(uni || 'Syndicate', members > 0 ? `${members} members` : null);
    }
    case 'COSMIC': {
      const app  = get<number>('appearances') || 0;
      const uni  = get<string>('universe') || 'Marvel';
      return fmt2(uni, app > 0 ? `${app.toLocaleString()} app` : null);
    }
    case 'WEAPON': {
      const cat    = get<string>('category') || 'Weapon';
      const wielder = get<string>('wielder') || '';
      return fmt2(cat, wielder || null);
    }
    case 'SIDEKICK': {
      const mentor = get<string>('mentor') || '';
      const app    = get<number>('appearances') || 0;
      return fmt2(mentor ? `Sidekick to ${mentor}` : 'Sidekick', app > 0 ? `${app.toLocaleString()} app` : null);
    }
    case 'LEGACY': {
      const app = get<number>('appearances') || 0;
      const uni = get<string>('universe') || '';
      return fmt2(uni || 'Legacy', app > 0 ? `${app.toLocaleString()} app` : null);
    }
    case 'NEMESIS': {
      const hero    = get<string>('hero') || '';
      const villain = get<string>('villain') || '';
      return fmt2(hero || null, villain || null);
    }
    case 'STORY_ARC': {
      const year   = get<string | number>('year') || '';
      const issues = get<number>('issues') || 0;
      const uni    = get<string>('universe') || '';
      return fmt2(uni || null, year ? (issues > 0 ? `${year} · ${issues} iss` : `${year}`) : null);
    }
    case 'ORIGIN_STORY': {
      const char = get<string>('character') || '';
      const year = get<string | number>('year') || '';
      return fmt2(char || null, year ? `${year}` : null);
    }
    case 'PUBLISHER_STOCK': {
      const chars = get<number>('characters') || 0;
      const pub   = get<string>('publisher') || '';
      return fmt2(pub || null, chars > 0 ? `${chars.toLocaleString()} characters` : null);
    }
    case 'WARRANT': {
      const strike = get<number>('strike') || 0;
      const expiry = get<number>('expiry_tick') || 0;
      return fmt2(strike > 0 ? `@$${formatNumber(strike)}` : null, expiry > 0 ? `T${expiry}` : null);
    }
    case 'CONVERTIBLE': {
      const coupon = get<number>('coupon_pct') || 0;
      const strike = get<number>('strike') || 0;
      return fmt2(coupon > 0 ? `${coupon.toFixed(1)}% cpn` : null, strike > 0 ? `Conv @$${formatNumber(strike)}` : null);
    }
    case 'FORWARD': {
      const underlying = get<string>('underlying') || 'Asset';
      const price      = get<number>('agreed_price') || 0;
      return fmt2(underlying, price > 0 ? `$${formatNumber(price)}` : null);
    }
    case 'DISTRESSED': {
      const cat      = (get<string>('category') || 'distressed').replace(/_/g, ' ');
      const discount = get<number>('discount_pct') || 0;
      return fmt2(cat, discount > 0 ? `${Math.round(discount * 100)}% disc` : null);
    }
    case 'MERGER_ARB': {
      const spread = get<number>('spread_pct') || 0;
      const prob   = get<number>('probability') || 0;
      return fmt2(spread > 0 ? `${(spread * 100).toFixed(1)}% spread` : 'M&A', prob > 0 ? `${Math.round(prob * 100)}% prob` : null);
    }
    case 'LONG_SHORT': {
      const long_  = get<string>('long') || 'Long';
      const short_ = get<string>('short') || 'Short';
      const net    = get<number>('net_exposure') || 0;
      return fmt2(`L:${long_} S:${short_}`, net > 0 ? `${Math.round(net * 100)}% net` : null);
    }
    case 'MACRO': {
      const theme = (get<string>('theme') || 'macro').replace(/_/g, ' ');
      const era   = get<string>('era') || '';
      return fmt2(theme, era || null);
    }
    case 'MANAGED_FUTURES': {
      const strat    = (get<string>('strategy') || 'trend').replace(/_/g, ' ');
      const lookback = get<number>('lookback_ticks') || 0;
      return fmt2(strat, lookback > 0 ? `${lookback}T window` : null);
    }
    case 'SPECIAL_SITUATIONS': {
      const cat = (get<string>('category') || 'special').replace(/_/g, ' ');
      return cat;
    }
    case 'QUANT': {
      const factor   = (get<string>('factor') || 'alpha').replace(/_/g, ' ');
      const lookback = get<number>('lookback') || 0;
      return fmt2(factor, lookback > 0 ? `${lookback}T` : null);
    }
    case 'CATALYST': {
      const trigger = (get<string>('trigger') || 'event').replace(/_/g, ' ');
      const prob    = get<number>('probability') || 0;
      return fmt2(trigger, prob > 0 ? `${Math.round(prob * 100)}% prob` : null);
    }
    case 'CONCENTRATED': {
      const char = get<string>('character') || get<string>('category') || 'Position';
      const conc = get<number>('concentration') || 1;
      return fmt2(char, conc === 1 ? '100% concentrated' : `${Math.round(conc * 100)}%`);
    }
    default:
      return assetType || 'Asset';
  }
}

export function getExposureStatement(item: AssetItem, assetType: string): string {
  if (!item) return '';
  const p = item?.pricing || {};
  const q = item?.parameters || {};
  const g = <T>(k: string): T => (p[k] ?? q[k]) as T;

  switch (assetType) {
    case 'INDEX': {
      const count = g<number>('constituents') ?? 0;
      const franchise = g<string>('franchise') || '';
      const method = g<string>('method') || 'weighted';
      return franchise
        ? `Tracks ${count} comic equities across ${franchise} IP, ${method}-weighted`
        : `Composite index tracking ${count} comic equities`;
    }
    case 'OPTIONS': {
      const isCall     = item.diversityBucket === 'call' || item.symbol?.includes('-C-');
      const strike     = p.strike ?? 0;
      const expiry     = p.expiry_tick ?? 0;
      const underlying = q.underlying ?? 'unknown';
      return `Right to ${isCall ? 'buy' : 'sell'} ${underlying} exposure at $${formatNumber(strike)} by Tick ${expiry}`;
    }
    case 'CREDIT': {
      const coupon  = p.coupon ?? 0;
      const maturity = p.maturity_tick ?? 0;
      const rating  = p.credit_rating ?? '—';
      return `A ${rating}-rated debt security paying ${coupon.toFixed(2)}% interest, maturing at Tick ${maturity}`;
    }
    case 'VOLATILITY': {
      const level = (p.level ?? 0) / 100;
      const regime = level >= 40 ? 'high' : level >= 20 ? 'moderate' : 'low';
      return `A volatility instrument reflecting ${regime} market stress conditions`;
    }
    case 'SWAPS':
      return `A total return swap providing ${formatUSD(p.notional_cents ?? 0)} of market exposure`;
    case 'CHARACTER': {
      const app    = g<number>('appearances') ?? 0;
      const alive  = g<string>('alive') ?? '';
      const debut  = g<string>('first_appeared') ?? '';
      const align  = g<string>('alignment') ?? '';
      const planet = (g<string>('planet') ?? '') as string;
      return [
        debut ? `Debut ${formatFirstAppeared(debut)}` : null,
        app > 0 ? appearanceDepthLabel(app) : 'Thin market',
        alignmentLabel(align) || null,
        aliveSignal(alive) || null,
        planet && planet.toLowerCase() !== 'earth' ? `Origin: ${planet}` : null,
      ].filter(Boolean).join(' · ');
    }
    case 'GADGET': {
      const wielder = g<string>('wielder') ?? '—';
      const cat     = g<string>('category') ?? '—';
      const uni     = g<string>('universe') ?? '—';
      return `${cat} · wielded by ${wielder} · ${uni}`;
    }
    case 'LOCATION': {
      const locType = g<string>('location_type') ?? '—';
      const aff     = g<string>('affiliation') ?? '—';
      const uni     = g<string>('universe') ?? '—';
      return `${locType} · ${uni} · affiliated with ${aff}`;
    }
    case 'TEAM': {
      const members   = g<number>('member_count') ?? 0;
      const uni       = g<string>('universe') ?? '';
      const align     = (g<string>('alignment') ?? '').toLowerCase();
      const coalition = align === 'bad' ? 'Adversarial syndicate · shorting IP baskets'
        : align === 'neutral' ? 'Independent operator network · hedged exposure'
        : 'Blue-chip coalition · long-biased collective';
      const size = members >= 20 ? 'Large-cap collective' : members >= 10 ? 'Mid-cap collective' : members > 0 ? 'Small-cap collective' : '';
      return [uni || null, coalition, size || null, members > 0 ? `${members.toLocaleString()} members` : null].filter(Boolean).join(' · ');
    }
    case 'VILLAIN': {
      const app    = g<number>('appearances') ?? 0;
      const alive  = g<string>('alive') ?? '';
      const debut  = g<string>('first_appeared') ?? '';
      const id     = g<string>('identity') ?? '';
      const planet = (g<string>('planet') ?? '') as string;
      const depth  = app >= 1000 ? 'Top 1% threat liquidity' : app >= 500 ? 'High-conviction threat play' : app >= 100 ? 'Mid-market threat position' : app > 0 ? 'Speculative threat vector' : 'Thin market';
      const idLabel = id === 'Secret' ? 'Hidden identity · scarcity premium' : id === 'Public' ? 'Public exposure · liquid market' : '';
      const status  = alive === 'Yes' ? 'Active threat' : alive === 'No' ? 'Archived · Rebirth catalyst' : '';
      return [debut ? `Debut ${formatFirstAppeared(debut)}` : null, depth, idLabel || null, status || null, planet && planet.toLowerCase() !== 'earth' ? `Origin: ${planet}` : null].filter(Boolean).join(' · ');
    }
    case 'ALIAS': {
      const app   = g<number>('appearances') ?? 0;
      const debut = g<string>('first_appeared') ?? g<string>('first_appearance') ?? '';
      const alive = g<string>('alive') ?? '';
      const id    = g<string>('identity') ?? 'Secret';
      const idLabel = id === 'Public' ? 'Public exposure · liquid market' : 'Hidden identity · scarcity premium';
      return [debut ? `Debut ${formatFirstAppeared(debut)}` : null, app > 0 ? appearanceDepthLabel(app) : 'Thin market', idLabel, aliveSignal(alive) || null].filter(Boolean).join(' · ');
    }
    case 'FILM': {
      const phase    = g<string | number>('phase') ?? '—';
      const tomato   = g<number>('tomato_meter') ?? 0;
      const audience = g<number>('audience_score') ?? 0;
      const roi      = g<number>('roi_pct') ?? 0;
      return `MCU Phase ${phase} · RT ${tomato}% critics / ${audience}% audience · ROI ${roi >= 0 ? '+' : ''}${roi}%`;
    }
    case 'CREATOR': {
      const count = g<number>('issue_count') ?? 0;
      const role  = g<string>('role') ?? 'Creator';
      const pub   = (g<string>('publisher') ?? item.universe ?? '') as string;
      return `${role} · ${count.toLocaleString()} ${pub ? pub + ' ' : ''}issues credited`;
    }
    case 'REALITY': {
      const charCount = g<number>('character_count') ?? 0;
      const pub       = g<string>('publisher') ?? '—';
      return `${pub} multiverse — ${charCount.toLocaleString()} known inhabitants`;
    }
    case 'BOND': {
      const issuer     = g<string>('issuer') ?? '—';
      const yieldRate  = g<number>('yield_rate') ?? 0;
      const durationMo = g<number>('duration_months') ?? 0;
      const yrs        = Math.round(durationMo / 12);
      const label      = yrs <= 1 ? 'short-term' : yrs <= 5 ? 'medium-term' : 'long-term';
      return `A ${label} bond issued by ${issuer} paying ${(yieldRate * 100).toFixed(2)}% annually`;
    }
    case 'COMMODITY': {
      const kDecay = g<number>('k_decay') ?? 0;
      const dOverS = g<number>('d_over_s') ?? 1;
      const dir    = kDecay >= 0 ? 'inflationary' : 'deflationary';
      const supply = dOverS > 1.2 ? 'excess demand' : dOverS < 0.8 ? 'oversupply' : 'balanced supply';
      return `A raw material instrument with ${dir} price pressure and ${supply}`;
    }
    case 'CURRENCY': {
      const sSettlement = g<number>('s_settlement') ?? 0;
      const lControls   = g<number>('l_controls') ?? 0;
      const mFragility  = g<number>('m_fragility') ?? 0;
      const totalRisk   = sSettlement + lControls + mFragility;
      const risk        = totalRisk > 1.2 ? 'high' : totalRisk > 0.6 ? 'moderate' : 'low';
      const flow        = lControls > 0.4 ? 'restricted' : 'open';
      return `A currency pair with ${risk} settlement risk and ${flow} capital flow`;
    }
    case 'ETF': {
      const count = g<number>('constituents') ?? 0;
      const er    = g<number>('expense_ratio') ?? 0;
      const pub   = (g<string>('publisher') ?? g<string>('era') ?? '') as string;
      return `A fund tracking ${count} comic equities${pub ? ` from ${pub}` : ''} with a ${(er * 100).toFixed(2)}% annual fee`;
    }
    case 'FUND': {
      const fundType    = (g<string>('fund_type') ?? '') as string;
      const isThematic  = fundType.toLowerCase().includes('thematic');
      if (isThematic) {
        const thesis  = (g<string>('strategy') ?? g<string>('thesis') ?? '') as string;
        const count   = g<number>('constituent_count') ?? 0;
        const uni     = (g<string>('universe') ?? 'Marvel+DC') as string;
        return `A thematic fund focused on ${(thesis || 'thematic').replace(/_/g, ' ')}${count > 0 ? ` with ${count.toLocaleString()} holdings` : ''} across ${uni}`;
      }
      const strategy = (g<string>('strategy') ?? 'Fund').replace(/_/g, ' ');
      const trailing = g<number>('trailing_1y') ?? 0;
      const sign     = trailing >= 0 ? '+' : '';
      return `${strategy} · 1Y ${sign}${(trailing * 100).toFixed(1)}% return`;
    }
    case 'FUTURES': {
      const underlying = g<string>('underlying') ?? 'Asset';
      const expiry     = g<number>('expiry_tick') ?? 0;
      return `${underlying} futures contract${expiry > 0 ? ` expiring at Tick ${expiry}` : ''}`;
    }
    case 'REIT': {
      const propType  = (g<string>('property_type') ?? 'Property').replace(/_/g, ' ');
      const distYield = g<number>('distribution_yield') ?? 0;
      return `A ${propType} REIT distributing ${(distYield * 100).toFixed(1)}% annually`;
    }
    case 'STRUCTURED': {
      const prodType = (g<string>('product_type') ?? 'Structured').replace(/_/g, ' ');
      const tranche  = g<string>('tranche') ?? '—';
      return `${prodType} — ${tranche} tranche structured note`;
    }
    case 'TREASURY': {
      const matMo    = g<number>('maturity_months') ?? 0;
      const instType = g<string>('instrument_type') ?? 'Treasury';
      const yrs      = matMo > 0 ? `${Math.round(matMo / 12)}Y` : '';
      return `${yrs ? yrs + ' ' : ''}${instType} — sovereign debt instrument`;
    }
    case 'PRIVATE': {
      const fundType = (g<string>('fund_type') ?? 'Private Equity').replace(/_/g, ' ');
      const irr      = g<number>('target_irr') ?? 0;
      return `${fundType}${irr > 0 ? ` targeting ${(irr * 100).toFixed(0)}% IRR` : ''} — restricted access`;
    }
    case 'HEDGE': {
      const strategy = (g<string>('strategy') ?? 'Hedge Fund').replace(/_/g, ' ');
      const sharpe   = g<number>('sharpe') ?? 0;
      const maxDD    = g<number>('max_drawdown') ?? 0;
      return `${strategy} · Sharpe ${sharpe.toFixed(2)} · Max drawdown ${(maxDD * 100).toFixed(0)}%`;
    }
    case 'CRYPTO': {
      const useCase = (g<string>('use_case') ?? 'Crypto').replace(/_/g, ' ');
      const mcap    = g<number>('market_cap') ?? 0;
      return `${useCase}${mcap > 0 ? ` · $${(mcap / 1_000_000).toFixed(2)}M market cap` : ''}`;
    }
    case 'NFT': {
      const rarity = g<string>('rarity_tier') ?? 'NFT';
      const supply = g<number>('total_supply') ?? 0;
      return `${rarity} tier NFT · ${supply === 1 ? '1 of 1 unique' : `${supply} editions`}`;
    }
    case 'PREDICTION': {
      const prob = g<number>('implied_probability') ?? 50;
      const cond = g<string>('resolution_condition') ?? '';
      return cond || `${prob}% implied probability of resolution`;
    }
    default:
      return '';
  }
}

export function getBarPct(item: AssetItem, assetType: string): number {
  if (!item) return 0.5;
  const p = item?.pricing || {};
  const q = item?.parameters || {};
  const g = <T>(k: string): T => (p[k] ?? q[k]) as T;

  switch (assetType) {
    case 'CHARACTER': case 'ALIAS': case 'VILLAIN':
    case 'DC_CHARACTER': case 'SIDEKICK': case 'LEGACY': {
      const app = (g<number>('appearances') ?? 0) as number;
      return Math.min(app / 7000, 1);
    }
    case 'TEAM': case 'DC_TEAM': case 'VILLAIN_TEAM': {
      const m = (g<number>('member_count') ?? 0) as number;
      return Math.min(m / 50, 1);
    }
    case 'GADGET': case 'WEAPON': {
      const fmv = (p.fmv_usd ?? 0) as number;
      return Math.min(fmv / 100000, 1);
    }
    case 'LOCATION': {
      const fmv = (p.fmv_usd ?? 0) as number;
      return Math.min(fmv / 100000, 1);
    }
    case 'FILM': {
      const rt = (g<number>('tomato_meter') ?? 0) as number;
      return Math.min(rt / 100, 1);
    }
    case 'CREATOR': {
      const ic = (g<number>('issue_count') ?? 0) as number;
      return Math.min(ic / 500, 1);
    }
    case 'REALITY': {
      const cc = (g<number>('character_count') ?? 0) as number;
      return Math.min(cc / 10000, 1);
    }
    case 'BATTLE_STATS': {
      const wr = (g<number>('win_rate') ?? 0) as number;
      return Math.min(wr, 1);
    }
    case 'COSMIC': {
      const pl = (g<number>('power_level') ?? 0) as number;
      return Math.min(pl / 100, 1);
    }
    case 'NEMESIS': {
      const rs = (g<number>('rivalry_score') ?? 0) as number;
      return Math.min(rs / 100, 1);
    }
    case 'STORY_ARC': {
      const rating = (g<number>('rating') ?? 0) as number;
      return Math.min(rating / 100, 1);
    }
    case 'TEAM_UP': case 'CROSSOVER': case 'EVENT': {
      const app = (g<number>('appearances') ?? 0) as number;
      const impact = (g<string>('impact') ?? '') as string;
      if (app > 0) return Math.min(app / 500, 1);
      return impact === 'high' ? 0.9 : impact === 'medium' ? 0.6 : 0.3;
    }
    case 'SECRET_IDENTITY': {
      const threat = (g<string>('threat_if_revealed') ?? 'low') as string;
      return threat === 'extreme' ? 0.95 : threat === 'high' ? 0.75 : threat === 'medium' ? 0.50 : 0.25;
    }
    case 'ORIGIN_STORY': {
      const fmv = (p.fmv_usd ?? 0) as number;
      return Math.min(fmv / 100000, 1);
    }
    case 'PUBLISHER_STOCK': {
      const ipCount = (g<number>('ip_count') ?? 0) as number;
      return Math.min(ipCount / 10000, 1);
    }
    case 'MERGER_ARB': case 'SPECIAL_SITUATIONS': case 'CATALYST': {
      const prob = (g<number>('deal_probability') ?? g<number>('probability') ?? 0.5) as number;
      return Math.min(prob, 1);
    }
    case 'LONG_SHORT': {
      const ne = (g<number>('net_exposure') ?? 0.5) as number;
      return Math.min(Math.abs(ne), 1);
    }
    case 'QUANT': {
      const sharpe = (g<number>('sharpe') ?? 0) as number;
      return Math.min(sharpe / 3, 1);
    }
    case 'CONCENTRATED': {
      const topHolding = (g<number>('top_holding_pct') ?? 0.30) as number;
      return Math.min(topHolding, 1);
    }
    case 'MACRO': {
      const tr = (g<number>('target_return') ?? 0) as number;
      return Math.min(tr, 1);
    }
    case 'MANAGED_FUTURES': {
      const sharpe = (g<number>('sharpe') ?? 0) as number;
      return Math.min(sharpe / 3, 1);
    }
    case 'WARRANT': case 'FORWARD': {
      const fmv = (p.fmv_usd ?? 0) as number;
      return Math.min(fmv / 20000, 1);
    }
    case 'CONVERTIBLE': {
      const cr = (g<number>('conversion_ratio') ?? 0) as number;
      return Math.min(cr / 20, 1);
    }
    case 'DISTRESSED': {
      const dr = (g<number>('distress_ratio') ?? 0) as number;
      return Math.min(dr, 1);
    }
    case 'OPTIONS': {
      const delta = Math.abs((p.delta ?? 0) as number);
      return Math.min(delta, 1);
    }
    case 'CREDIT': {
      const yld = ((p.yield ?? 0) as number) / 20;
      return Math.min(yld, 1);
    }
    case 'VOLATILITY': {
      const lvl = ((p.level ?? 0) as number) / 100;
      return Math.min(lvl / 80, 1);
    }
    case 'ETF': {
      const n = (g<number>('constituents') ?? 0) as number;
      return Math.min(n / 50, 1);
    }
    case 'REIT': {
      const dy = (g<number>('distribution_yield') ?? 0) as number;
      return Math.min(dy / 0.10, 1);
    }
    case 'TREASURY': {
      const matMo = (g<number>('maturity_months') ?? 0) as number;
      return Math.min(matMo / 360, 1);
    }
    case 'CRYPTO': {
      const circ = (g<number>('circulating_pct') ?? 0) as number;
      return Math.min(circ, 1);
    }
    case 'NFT': {
      const sup = (g<number>('total_supply') ?? 1) as number;
      return sup === 1 ? 1 : Math.max(1 - sup / 1000, 0.05);
    }
    default: {
      const fmv = (p.fmv_usd ?? 0) as number;
      return Math.min(fmv / 200000, 1);
    }
  }
}

export function getAnchorMetric(item: AssetItem, assetType: string): { label: string; value: string; color: string } {
  const colors = SURFACE_COLORS[assetType as SurfaceKey] || SURFACE_COLORS.INDEX;
  if (!item) return { label: 'FMV', value: '$0.00', color: colors.primary };
  const p = item?.pricing || {};
  const q = item?.parameters || {};
  const g = <T>(k: string): T => (p[k] ?? q[k]) as T;

  switch (assetType) {
    case 'INDEX':      return { label: 'Level',   value: formatNumber(p.level ?? 0), color: '#fff' };
    case 'OPTIONS':    return { label: 'Premium',  value: `$${((p.premium_cents ?? 0) / 100).toFixed(2)}`, color: colors.primary };
    case 'CREDIT':     return { label: 'Yield',    value: `${(p.yield ?? 0).toFixed(2)}%`, color: colors.primary };
    case 'VOLATILITY': return { label: 'Level',    value: formatNumber((p.level ?? 0) / 100), color: '#fff' };
    case 'SWAPS':      return { label: 'Notional', value: formatUSD(p.notional_cents ?? 0), color: '#fff' };
    case 'CHARACTER': case 'GADGET': case 'LOCATION': case 'TEAM': case 'VILLAIN':
    case 'ALIAS': case 'CREATOR': case 'REALITY': case 'DC_CHARACTER': case 'DC_TEAM':
      return { label: 'FMV', value: `$${formatNumber(p.fmv_usd ?? 0)}`, color: colors.primary };
    case 'BATTLE_STATS': return { label: 'Score',    value: `${g<number>('composite_score') ?? 0}`, color: colors.primary };
    case 'FILM':         return { label: 'Worldwide', value: `$${((g<number>('worldwide_usd') ?? 0) / 1_000_000_000).toFixed(3)}B`, color: colors.primary };
    case 'TEAM_UP': case 'SIDEKICK': case 'LEGACY': case 'NEMESIS':
      return { label: 'FMV', value: `$${formatNumber(p.fmv_usd ?? 0)}`, color: colors.primary };
    case 'EVENT': case 'CROSSOVER': case 'STORY_ARC': case 'ORIGIN_STORY':
      return { label: 'FMV', value: `$${formatNumber(p.fmv_usd ?? 0)}`, color: colors.primary };
    case 'VILLAIN_TEAM': case 'COSMIC': case 'WEAPON': case 'SECRET_IDENTITY': case 'PUBLISHER_STOCK':
      return { label: 'FMV', value: `$${formatNumber(p.fmv_usd ?? 0)}`, color: colors.primary };
    case 'WARRANT': return { label: 'Strike', value: `$${formatNumber(g<number>('strike') ?? 0)}`, color: colors.primary };
    case 'CONVERTIBLE': return { label: 'Coupon', value: `${((g<number>('coupon') ?? 0) * 100).toFixed(2)}%`, color: colors.primary };
    case 'FORWARD': return { label: 'Fwd Price', value: `$${formatNumber((p.fmv_usd ?? g<number>('forward_price') ?? 0) as number)}`, color: colors.primary };
    case 'DISTRESSED': return { label: 'Price', value: `$${formatNumber(p.fmv_usd ?? 0)}`, color: colors.primary };
    case 'MERGER_ARB': return { label: 'Prob', value: `${Math.round(((g<number>('deal_probability') ?? 0.5) as number) * 100)}%`, color: colors.primary };
    case 'LONG_SHORT': return { label: 'Net Exp', value: `${g<number>('net_exposure') ?? 0}x`, color: colors.primary };
    case 'MACRO': return { label: 'Target', value: `+${(((g<number>('target_return') ?? 0) as number) * 100).toFixed(0)}%`, color: colors.primary };
    case 'MANAGED_FUTURES': return { label: 'Sharpe', value: `${(g<number>('sharpe') ?? 0 as number).toFixed(2)}`, color: colors.primary };
    case 'SPECIAL_SITUATIONS': return { label: 'Upside', value: `+${(((g<number>('upside_pct') ?? 0) as number) * 100).toFixed(0)}%`, color: colors.primary };
    case 'QUANT': return { label: 'Alpha', value: `+${(((g<number>('alpha') ?? 0) as number) * 100).toFixed(1)}%`, color: colors.primary };
    case 'CATALYST': return { label: 'Impact', value: `+${(((g<number>('expected_impact') ?? 0) as number) * 100).toFixed(0)}%`, color: colors.primary };
    case 'CONCENTRATED': return { label: 'Top Hold', value: `${(((g<number>('top_holding_pct') ?? 0.30) as number) * 100).toFixed(0)}%`, color: colors.primary };
    case 'PREDICTION': {
      const prob     = (g<number>('implied_probability') ?? 50) as number;
      const yesPrice = (p.yes_price ?? prob / 100) as number;
      const color    = prob >= 60 ? '#4ade80' : prob <= 40 ? '#f87171' : '#facc15';
      return { label: 'YES Price', value: `$${yesPrice.toFixed(2)}`, color };
    }
    case 'CRYPTO':     return { label: 'Price', value: `$${formatNumber(p.price_usd ?? p.fmv_usd ?? 0, 4)}`, color: colors.primary };
    case 'NFT': {
      const floor = p.fmv_usd ?? 0;
      const val   = floor >= 1_000_000 ? `$${(floor / 1_000_000).toFixed(2)}M` : floor >= 1_000 ? `$${(floor / 1_000).toFixed(1)}K` : `$${formatNumber(floor)}`;
      return { label: 'Floor', value: val, color: colors.primary };
    }
    default:
      return { label: 'NAV', value: `$${formatNumber(p.nav ?? p.nav_usd ?? p.fmv_usd ?? p.share_price ?? p.futures_price ?? 0)}`, color: colors.primary };
  }
}

export function getSecondaryMetric(item: AssetItem, assetType: string): { label: string; value: string; color: string } | null {
  if (!item) return null;
  const p = item?.pricing || {};
  const q = item?.parameters || {};
  const g = <T>(k: string): T => (p[k] ?? q[k]) as T;

  switch (assetType) {
    case 'INDEX': {
      const d = p.delta_pct ?? 0;
      const color = d > 0 ? '#4ade80' : d < 0 ? '#f87171' : '#9ca3af';
      return { label: 'Change', value: `${d > 0 ? '+' : ''}${d.toFixed(2)}%`, color };
    }
    case 'OPTIONS':    return { label: 'Underlying', value: `$${formatNumber(p.narrative_s ?? p.fmv_usd ?? 0)}`, color: '#fff' };
    case 'CREDIT':     return { label: 'Price',      value: `${formatNumber((p.price_pct ?? 0) / 100)}%`, color: '#fff' };
    case 'VOLATILITY': {
      const d = p.delta ?? 0;
      const color = d > 0 ? '#4ade80' : d < 0 ? '#f87171' : '#9ca3af';
      return { label: 'Change', value: `${d > 0 ? '+' : ''}${d.toFixed(2)}`, color };
    }
    case 'SWAPS': {
      const net = p.net_exposure_cents ?? 0;
      return { label: 'Net Exposure', value: formatUSD(net), color: net >= 0 ? '#4ade80' : '#f87171' };
    }
    case 'CHARACTER': {
      const power = g<number>('power_total') ?? 0;
      const uni   = g<string>('universe') ?? '—';
      return { label: 'Power', value: `${power} · ${uni}`, color: '#f97316' };
    }
    case 'GADGET':  return { label: 'Wielder', value: g<string>('wielder') ?? '—', color: '#06b6d4' };
    case 'LOCATION': return { label: 'Type',   value: g<string>('location_type') ?? '—', color: '#84cc16' };
    case 'TEAM':    return { label: 'Members', value: (g<number>('member_count') ?? 0).toLocaleString(), color: '#ec4899' };
    case 'VILLAIN': {
      const uni   = g<string>('universe') ?? '—';
      const alive = g<string>('alive') ?? '—';
      return { label: 'Status', value: `${alive} · ${uni}`, color: '#ef4444' };
    }
    case 'ALIAS': {
      const eye  = g<string>('eye_color') ?? '';
      const hair = g<string>('hair_color') ?? '';
      const year = g<string>('year') ?? '';
      return { label: 'Profile', value: [eye, hair].filter(Boolean).join(' / ') || year || '—', color: '#f59e0b' };
    }
    case 'FILM': {
      const tomato   = g<number>('tomato_meter') ?? 0;
      const audience = g<number>('audience_score') ?? 0;
      const color    = tomato >= 75 ? '#4ade80' : tomato >= 50 ? '#f59e0b' : '#f87171';
      return { label: 'RT / Audience', value: `${tomato}% / ${audience}%`, color };
    }
    case 'CREATOR':  return { label: 'Role',      value: g<string>('role') ?? '—', color: '#10b981' };
    case 'REALITY': {
      const pub      = g<string>('publisher') ?? '—';
      const charCount = g<number>('character_count') ?? 0;
      return { label: pub, value: `${charCount.toLocaleString()} chars`, color: '#a855f7' };
    }
    case 'BOND': {
      const sigmaEff  = g<number>('sigma_eff') ?? 0;
      const state     = g<string>('state') ?? 'ACTIVE';
      const stateColor = state === 'ACTIVE' ? '#4ade80' : state === 'STRESSED' ? '#facc15' : state === 'DISTRESSED' ? '#fb923c' : '#f87171';
      const durationMo = g<number>('duration_months') ?? 0;
      const matLabel   = durationMo > 0 ? ` · ${(durationMo / 12).toFixed(1)}yr` : '';
      return { label: `${state}${matLabel}`, value: `σ ${(sigmaEff * 100).toFixed(1)}%`, color: stateColor };
    }
    case 'COMMODITY': {
      const kDecay = g<number>('k_decay') ?? 0;
      const dOverS = g<number>('d_over_s') ?? 1;
      const color  = kDecay >= 0 ? '#4ade80' : '#f87171';
      return { label: 'Drift · D/S', value: `${kDecay >= 0 ? '+' : ''}${(kDecay * 100).toFixed(2)}% · ${dOverS.toFixed(2)}x`, color };
    }
    case 'CURRENCY': {
      const mFrag    = g<number>('m_fragility') ?? 0;
      const stability = mFrag <= 0.15 ? 'STABLE' : mFrag <= 0.35 ? 'FRAGILE' : 'VOLATILE';
      const color    = mFrag <= 0.15 ? '#4ade80' : mFrag <= 0.35 ? '#facc15' : '#f87171';
      return { label: 'Regime', value: stability, color };
    }
    case 'PREDICTION': {
      const noPrice  = (g<number>('no_price') ?? 0.50) as number;
      const ticksLeft = (g<number>('ticks_remaining') ?? 0) as number;
      const color    = ticksLeft <= 5 ? '#f87171' : ticksLeft <= 15 ? '#facc15' : '#a3e635';
      return { label: `NO · T-${ticksLeft}`, value: `$${noPrice.toFixed(2)}`, color };
    }
    case 'ETF': {
      const er       = g<number>('expense_ratio') ?? 0;
      const rebalance = g<string>('rebalance') ?? '—';
      return { label: `ER · ${rebalance}`, value: `${(er * 100).toFixed(2)}%`, color: '#60a5fa' };
    }
    case 'FUND': {
      const fundType   = (g<string>('fund_type') ?? '') as string;
      const isThematic = fundType.toLowerCase().includes('thematic');
      if (isThematic) {
        const count = g<number>('constituent_count') ?? 0;
        const uni   = g<string>('universe') ?? 'Marvel+DC';
        return { label: 'Holdings', value: `${count.toLocaleString()} · ${uni}`, color: '#34d399' };
      }
      const trailing = g<number>('trailing_1y') ?? 0;
      const color    = trailing >= 0.15 ? '#4ade80' : trailing >= 0.05 ? '#facc15' : '#f87171';
      return { label: '1Y Return', value: `${trailing >= 0 ? '+' : ''}${(trailing * 100).toFixed(1)}%`, color };
    }
    case 'FUTURES': {
      const spot    = g<number>('spot') ?? 0;
      const futures = g<number>('futures_price') ?? p.fmv_usd ?? spot;
      const basis   = futures - spot;
      const color   = basis >= 0 ? '#4ade80' : '#f87171';
      return { label: 'Basis', value: `${basis >= 0 ? '+' : ''}$${formatNumber(Math.abs(basis))}`, color };
    }
    case 'REIT': {
      const distYield = g<number>('distribution_yield') ?? 0;
      const color     = distYield >= 0.06 ? '#4ade80' : distYield >= 0.04 ? '#facc15' : '#9ca3af';
      return { label: 'Dist. Yield', value: `${(distYield * 100).toFixed(1)}%`, color };
    }
    case 'STRUCTURED': {
      const tranche = g<string>('tranche') ?? '—';
      const color   = tranche === 'SENIOR' ? '#4ade80' : tranche === 'MEZZANINE' ? '#facc15' : '#f87171';
      return { label: 'Tranche', value: tranche, color };
    }
    case 'TREASURY': {
      const yieldPct = g<number>('yield_pct') ?? 0;
      const riskScore = g<number>('risk_score') ?? 0;
      const color    = riskScore <= 0.05 ? '#4ade80' : riskScore <= 0.15 ? '#facc15' : '#f87171';
      return { label: 'Yield', value: `${yieldPct.toFixed(2)}%`, color };
    }
    case 'PRIVATE': return { label: 'Lock-up', value: `${g<number>('lock_up_years') ?? 0}yr · RESTRICTED`, color: '#9ca3af' };
    case 'HEDGE': {
      const sharpe = g<number>('sharpe') ?? 0;
      const maxDD  = g<number>('max_drawdown') ?? 0;
      const color  = sharpe >= 2.0 ? '#4ade80' : sharpe >= 1.5 ? '#facc15' : '#f87171';
      return { label: 'Sharpe · MaxDD', value: `${sharpe.toFixed(2)} · ${(maxDD * 100).toFixed(0)}%`, color };
    }
    case 'CRYPTO': {
      const mcap    = g<number>('market_cap') ?? 0;
      const circPct = g<number>('circulating_pct') ?? 0;
      return { label: 'Mkt Cap · Circ', value: `$${(mcap / 1_000_000).toFixed(2)}M · ${(circPct * 100).toFixed(0)}%`, color: '#facc15' };
    }
    case 'NFT': {
      const rarity = g<string>('rarity_tier') ?? '—';
      const supply = g<number>('total_supply') ?? 0;
      const color  = rarity === 'LEGENDARY' ? '#facc15' : rarity === 'MYTHIC' ? '#e879f9' : rarity === 'EPIC' ? '#a78bfa' : rarity === 'RARE' ? '#60a5fa' : '#9ca3af';
      return { label: rarity, value: supply === 1 ? '1 of 1' : `${supply} eds`, color };
    }
    case 'DC_CHARACTER': {
      const power = g<number>('power_total') ?? 0;
      const uni   = g<string>('universe') ?? 'DC';
      const color = SURFACE_COLORS['DC_CHARACTER'].primary;
      return { label: 'Power', value: `${power} · ${uni}`, color };
    }
    case 'DC_TEAM':     return { label: 'Members', value: (g<number>('member_count') ?? 0).toLocaleString(), color: '#38bdf8' };
    case 'BATTLE_STATS': {
      const wr    = g<number>('win_rate') ?? 0;
      const color = wr >= 0.55 ? '#4ade80' : wr >= 0.45 ? '#facc15' : '#f87171';
      return { label: 'Win Rate', value: `${Math.round(wr * 100)}%`, color };
    }
    case 'TEAM_UP': {
      const uni = g<string>('universe') ?? '—';
      return { label: 'Universe', value: uni, color: '#fb923c' };
    }
    case 'EVENT': {
      const year = g<string | number>('year');
      return { label: 'Year', value: year ? String(year) : '—', color: '#c084fc' };
    }
    case 'CROSSOVER': {
      const pubs = g<string[]>('publishers') ?? [];
      return { label: 'Publishers', value: pubs.join(' × ') || '—', color: '#e879f9' };
    }
    case 'VILLAIN_TEAM': {
      const mem = g<number>('member_count') ?? 0;
      return { label: 'Members', value: mem.toLocaleString(), color: '#dc2626' };
    }
    case 'COSMIC': {
      const domain = g<string>('domain') ?? '—';
      return { label: 'Domain', value: domain, color: '#818cf8' };
    }
    case 'WEAPON': {
      const wielder = g<string>('wielder') ?? '—';
      return { label: 'Wielder', value: wielder, color: '#fbbf24' };
    }
    case 'SIDEKICK': {
      const hero = g<string>('primary_hero') ?? '—';
      return { label: 'Partners', value: hero, color: '#86efac' };
    }
    case 'LEGACY': {
      const gen = g<number>('generation') ?? 0;
      const successor = g<string>('successor') ?? '—';
      return { label: `Gen ${gen}`, value: successor, color: '#fde68a' };
    }
    case 'NEMESIS': {
      const if2 = g<number>('issues_fought') ?? 0;
      return { label: 'Battles', value: if2.toLocaleString(), color: '#f87171' };
    }
    case 'STORY_ARC': {
      const issues = g<number>('issues') ?? 0;
      const year   = g<string | number>('year');
      return { label: `${issues} issues`, value: year ? String(year) : '—', color: '#a3e635' };
    }
    case 'ORIGIN_STORY': {
      const trauma = g<string>('trauma') ?? '—';
      return { label: 'Catalyst', value: trauma.replace(/_/g, ' '), color: '#fcd34d' };
    }
    case 'SECRET_IDENTITY': {
      const civilian = g<string>('civilian') ?? '—';
      return { label: 'Civilian', value: civilian, color: '#c084fc' };
    }
    case 'PUBLISHER_STOCK': {
      const mcap = g<number>('market_cap_bn') ?? 0;
      return { label: 'Mkt Cap', value: `$${mcap.toFixed(1)}B`, color: '#60a5fa' };
    }
    case 'WARRANT': {
      const expiry = g<number>('expiry_tick') ?? 0;
      return { label: 'Expiry', value: `T-${expiry}`, color: '#86efac' };
    }
    case 'CONVERTIBLE': {
      const cr = g<number>('conversion_ratio') ?? 0;
      const rating = g<string>('credit_rating') ?? '—';
      return { label: rating, value: `${cr}x ratio`, color: '#fde68a' };
    }
    case 'FORWARD': {
      const delivery = g<number>('delivery_tick') ?? 0;
      return { label: 'Delivery', value: `T-${delivery}`, color: '#67e8f9' };
    }
    case 'DISTRESSED': {
      const recovery = g<number>('recovery_estimate') ?? 0;
      return { label: 'Recovery Est', value: `${(recovery * 100).toFixed(0)}¢`, color: '#f87171' };
    }
    case 'MERGER_ARB': {
      const spread = g<number>('spread_pct') ?? 0;
      return { label: 'Spread', value: `${(spread * 100).toFixed(1)}%`, color: '#f9a8d4' };
    }
    case 'LONG_SHORT': {
      const ge = g<number>('gross_exposure') ?? 0;
      return { label: 'Gross Exp', value: `${ge}x`, color: '#4ade80' };
    }
    case 'MACRO': {
      const horizon = g<number>('horizon_ticks') ?? 0;
      return { label: 'Horizon', value: `T-${horizon}`, color: '#93c5fd' };
    }
    case 'MANAGED_FUTURES': {
      const strategy = (g<string>('strategy') ?? 'CTA').replace(/_/g, ' ');
      return { label: 'Strategy', value: strategy, color: '#38bdf8' };
    }
    case 'SPECIAL_SITUATIONS': {
      const catalyst = (g<string>('expected_catalyst') ?? '—').replace(/_/g, ' ');
      return { label: 'Catalyst', value: catalyst, color: '#fca5a5' };
    }
    case 'QUANT': {
      const universeSize = g<number>('universe_size') ?? 0;
      return { label: 'Universe', value: `${universeSize.toLocaleString()} instr`, color: '#818cf8' };
    }
    case 'CATALYST': {
      const ticks = g<number>('timeline_ticks') ?? 0;
      return { label: 'Timeline', value: `T-${ticks}`, color: '#fbbf24' };
    }
    case 'CONCENTRATED': {
      const holdings = g<number>('holdings_count') ?? 0;
      const color = SURFACE_COLORS['CONCENTRATED'].primary;
      return { label: 'Holdings', value: `${holdings} names`, color };
    }
    default: return null;
  }
}
