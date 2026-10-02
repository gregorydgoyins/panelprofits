// ─── SURFACE ARTWORK ─────────────────────────────────────────────────────────
// Surface art lives at public/surface-art/<KEY_LOWERCASE>.png and is
// served by Next.js at runtime. The canonical mapping from surface type → art
// path is SURFACE_ART_MAP. AssetCard reads from that map and
// renders the <img> element when a path is present.
// ─────────────────────────────────────────────────────────────────────────────
export const SURFACE_ORDER = [
  'INDEX', 'OPTIONS', 'CREDIT', 'VOLATILITY', 'SWAPS',
  'WARRANT', 'CONVERTIBLE', 'FORWARD', 'MERGER_ARB', 'SPECIAL_SITUATIONS', 'MACRO', 'CATALYST',
  'ETF', 'FUND', 'FUTURES', 'REIT', 'STRUCTURED', 'TREASURY', 'PRIVATE', 'HEDGE',
  'LONG_SHORT', 'MANAGED_FUTURES', 'QUANT', 'CONCENTRATED',
  'DISTRESSED',
  'CRYPTO', 'NFT',
  'CHARACTER', 'ALIAS', 'TEAM', 'TEAM_UP', 'EVENT', 'CROSSOVER',
  'GADGET', 'LOCATION', 'REALITY', 'COSMIC', 'WEAPON', 'SIDEKICK',
  'LEGACY', 'NEMESIS', 'STORY_ARC', 'ORIGIN_STORY', 'SECRET_IDENTITY',
  'VILLAIN', 'VILLAIN_TEAM',
  'DC_CHARACTER', 'DC_TEAM',
  'FILM', 'CREATOR', 'PUBLISHER_STOCK',
  'BATTLE_STATS',
  'BOND', 'COMMODITY', 'CURRENCY',
  'PREDICTION',
] as const;
export type SurfaceKey = typeof SURFACE_ORDER[number];

export const CARD_FAMILY_MAP: Record<SurfaceKey, string> = {
  CHARACTER: 'MARVEL', ALIAS: 'MARVEL', TEAM: 'MARVEL',
  TEAM_UP: 'MARVEL',  EVENT: 'MARVEL', CROSSOVER: 'MARVEL',
  DC_CHARACTER: 'DC_HERO', DC_TEAM: 'DC_HERO',
  VILLAIN: 'VILLAIN',  VILLAIN_TEAM: 'VILLAIN',
  BATTLE_STATS: 'BATTLE',
  GADGET: 'COMIC_OBJECT', LOCATION: 'COMIC_OBJECT', REALITY: 'COMIC_OBJECT',
  COSMIC: 'COMIC_OBJECT', WEAPON: 'COMIC_OBJECT',  SIDEKICK: 'COMIC_OBJECT',
  LEGACY: 'COMIC_OBJECT', NEMESIS: 'COMIC_OBJECT', STORY_ARC: 'COMIC_OBJECT',
  ORIGIN_STORY: 'COMIC_OBJECT', SECRET_IDENTITY: 'COMIC_OBJECT',
  FILM: 'REAL_WORLD',  CREATOR: 'REAL_WORLD', PUBLISHER_STOCK: 'REAL_WORLD',
  INDEX: 'DERIVATIVE',   OPTIONS: 'DERIVATIVE', CREDIT:    'DERIVATIVE',
  VOLATILITY: 'DERIVATIVE', SWAPS: 'DERIVATIVE',
  WARRANT: 'DERIVATIVE', CONVERTIBLE: 'DERIVATIVE', FORWARD: 'DERIVATIVE',
  ETF: 'VEHICLE',    FUND: 'VEHICLE',   REIT: 'VEHICLE',
  STRUCTURED: 'VEHICLE', TREASURY: 'VEHICLE', PRIVATE: 'VEHICLE',
  HEDGE: 'VEHICLE',  FUTURES: 'VEHICLE',
  LONG_SHORT: 'VEHICLE', MACRO: 'VEHICLE', MANAGED_FUTURES: 'VEHICLE',
  QUANT: 'VEHICLE',  CONCENTRATED: 'VEHICLE',
  CRYPTO: 'DIGITAL', NFT: 'DIGITAL',
  BOND: 'CLASSIC',   COMMODITY: 'CLASSIC', CURRENCY: 'CLASSIC',
  DISTRESSED: 'CLASSIC', MERGER_ARB: 'CLASSIC',
  SPECIAL_SITUATIONS: 'CLASSIC', CATALYST: 'CLASSIC',
  PREDICTION: 'PREDICTION',
} as const;

export const FAMILY_HEADER: Record<string, { label: string; accent: string; bg: string }> = {
  MARVEL:         { label: 'MARVEL',         accent: '#f97316', bg: 'rgba(60,28,8,0.90)' },
  DC_HERO:        { label: 'DC',             accent: '#1d6fca', bg: 'rgba(6,20,52,0.92)' },
  VILLAIN:        { label: 'THREAT',         accent: '#ef4444', bg: 'rgba(55,8,8,0.92)' },
  BATTLE:         { label: 'BATTLE',         accent: '#f43f5e', bg: 'rgba(52,8,18,0.94)' },
  COMIC_OBJECT:   { label: 'ARTIFACT',       accent: '#06b6d4', bg: 'rgba(6,36,48,0.90)' },
  REAL_WORLD:     { label: 'MEDIA',          accent: '#3b82f6', bg: 'rgba(8,22,52,0.90)' },
  DERIVATIVE:     { label: 'INSTRUMENT',     accent: '#8A9AAC', bg: 'rgba(18,28,42,0.90)' },
  VEHICLE:        { label: 'VEHICLE',        accent: '#60a5fa', bg: 'rgba(8,18,42,0.90)' },
  DIGITAL:        { label: 'DIGITAL',        accent: '#facc15', bg: 'rgba(24,18,4,0.92)' },
  CLASSIC:        { label: 'MARKET',         accent: '#E0B840', bg: 'rgba(36,26,6,0.92)' },
  PREDICTION:     { label: 'PREDICTION',     accent: '#a3e635', bg: 'rgba(18,38,4,0.92)' },
};

export interface SurfaceColorConfig {
  primary: string;
  bg: string;
  bgHover: string;
  border: string;
  glow: string;
}

export const SURFACE_LABELS: Record<SurfaceKey, string> = {
  INDEX: 'INDEX', OPTIONS: 'OPTIONS', CREDIT: 'CREDIT', VOLATILITY: 'VOL', SWAPS: 'SWAPS',
  ETF: 'ETF', FUND: 'FUND', FUTURES: 'FUTURES', REIT: 'REIT', STRUCTURED: 'STRUCT',
  TREASURY: 'TREAS', PRIVATE: 'PRIVATE', HEDGE: 'HEDGE',
  LONG_SHORT: 'L/S', MACRO: 'MACRO', MANAGED_FUTURES: 'MGD-FUT', QUANT: 'QUANT', CONCENTRATED: 'CONC',
  WARRANT: 'WARRANT', CONVERTIBLE: 'CONVERT', FORWARD: 'FWD',
  DISTRESSED: 'DIST', MERGER_ARB: 'M&A ARB', SPECIAL_SITUATIONS: 'SPEC SIT', CATALYST: 'CAT',
  CRYPTO: 'CRYPTO', NFT: 'NFT', BOND: 'BOND', COMMODITY: 'CMDTY', CURRENCY: 'FX',
  CHARACTER: 'CHAR', GADGET: 'GADGET', LOCATION: 'LOC', TEAM: 'TEAM', VILLAIN: 'VILLAIN',
  ALIAS: 'ALIAS', FILM: 'FILM', CREATOR: 'CREATOR', REALITY: 'REALITY',
  DC_CHARACTER: 'DC CHAR', DC_TEAM: 'DC TEAM', BATTLE_STATS: 'BATTLE',
  TEAM_UP: 'TEAM-UP', EVENT: 'EVENT', CROSSOVER: 'X-OVER',
  VILLAIN_TEAM: 'SYNDICATE', COSMIC: 'COSMIC', WEAPON: 'WEAPON',
  SIDEKICK: 'SIDEKICK', LEGACY: 'LEGACY', NEMESIS: 'NEMESIS',
  STORY_ARC: 'ARC', ORIGIN_STORY: 'ORIGIN', SECRET_IDENTITY: 'SECRET ID', PUBLISHER_STOCK: 'PUB',
  PREDICTION: 'PRED',
};

export const SURFACE_COLORS: Record<SurfaceKey, SurfaceColorConfig> = {
  INDEX:      { primary: '#8A9AAC', bg: 'rgba(42,58,74,0.70)',   bgHover: 'rgba(52,72,92,0.85)',   border: '#8A9AAC', glow: '0 0 14px rgba(138,154,172,0.50)' },
  OPTIONS:    { primary: '#4ade80', bg: 'rgba(15,42,30,0.70)',   bgHover: 'rgba(20,55,40,0.85)',   border: '#4ade80', glow: '0 0 14px rgba(74,222,128,0.40)' },
  CREDIT:     { primary: '#E0B840', bg: 'rgba(90,63,20,0.70)',   bgHover: 'rgba(110,78,28,0.85)',  border: '#E0B840', glow: '0 0 14px rgba(224,184,64,0.45)' },
  VOLATILITY: { primary: '#A78BFA', bg: 'rgba(58,38,90,0.70)',   bgHover: 'rgba(72,48,110,0.85)',  border: '#A78BFA', glow: '0 0 14px rgba(167,139,250,0.45)' },
  SWAPS:      { primary: '#2DD4BF', bg: 'rgba(15,55,52,0.70)',   bgHover: 'rgba(20,72,68,0.85)',   border: '#2DD4BF', glow: '0 0 14px rgba(45,212,191,0.45)' },
  ETF:        { primary: '#60a5fa', bg: 'rgba(8,28,58,0.70)',    bgHover: 'rgba(10,36,75,0.85)',   border: '#60a5fa', glow: '0 0 14px rgba(96,165,250,0.45)' },
  FUND:       { primary: '#34d399', bg: 'rgba(6,38,28,0.70)',    bgHover: 'rgba(8,50,36,0.85)',    border: '#34d399', glow: '0 0 14px rgba(52,211,153,0.45)' },
  FUTURES:    { primary: '#fbbf24', bg: 'rgba(48,32,6,0.70)',    bgHover: 'rgba(62,42,8,0.85)',    border: '#fbbf24', glow: '0 0 14px rgba(251,191,36,0.45)' },
  REIT:       { primary: '#a78bfa', bg: 'rgba(40,20,68,0.70)',   bgHover: 'rgba(52,26,88,0.85)',   border: '#a78bfa', glow: '0 0 14px rgba(167,139,250,0.45)' },
  STRUCTURED: { primary: '#f472b6', bg: 'rgba(48,10,32,0.70)',   bgHover: 'rgba(62,14,42,0.85)',   border: '#f472b6', glow: '0 0 14px rgba(244,114,182,0.45)' },
  TREASURY:   { primary: '#d1fae5', bg: 'rgba(6,30,20,0.70)',    bgHover: 'rgba(8,40,26,0.85)',    border: '#d1fae5', glow: '0 0 14px rgba(209,250,229,0.30)' },
  PRIVATE:    { primary: '#9ca3af', bg: 'rgba(18,20,26,0.80)',   bgHover: 'rgba(24,26,34,0.90)',   border: '#9ca3af', glow: '0 0 14px rgba(156,163,175,0.30)' },
  HEDGE:      { primary: '#f97316', bg: 'rgba(46,18,4,0.70)',    bgHover: 'rgba(60,24,6,0.85)',    border: '#f97316', glow: '0 0 14px rgba(249,115,22,0.45)' },
  LONG_SHORT: { primary: '#34d399', bg: 'rgba(4,30,22,0.70)',    bgHover: 'rgba(6,40,30,0.85)',    border: '#34d399', glow: '0 0 14px rgba(52,211,153,0.45)' },
  MACRO:      { primary: '#0ea5e9', bg: 'rgba(4,24,40,0.70)',    bgHover: 'rgba(6,32,54,0.85)',    border: '#0ea5e9', glow: '0 0 14px rgba(14,165,233,0.45)' },
  MANAGED_FUTURES: { primary: '#4ade80', bg: 'rgba(6,32,18,0.70)', bgHover: 'rgba(8,42,24,0.85)', border: '#4ade80', glow: '0 0 14px rgba(74,222,128,0.40)' },
  QUANT:      { primary: '#818cf8', bg: 'rgba(18,16,50,0.70)',   bgHover: 'rgba(24,22,68,0.85)',   border: '#818cf8', glow: '0 0 14px rgba(129,140,248,0.45)' },
  CONCENTRATED:{ primary: '#1d6fca', bg: 'rgba(4,18,40,0.80)',  bgHover: 'rgba(6,24,54,0.90)',    border: '#1d6fca', glow: '0 0 14px rgba(29,111,202,0.45)' },
  WARRANT:    { primary: '#84cc16', bg: 'rgba(18,36,4,0.70)',    bgHover: 'rgba(24,48,6,0.85)',    border: '#84cc16', glow: '0 0 14px rgba(132,204,22,0.45)' },
  CONVERTIBLE:{ primary: '#818cf8', bg: 'rgba(18,14,48,0.70)',   bgHover: 'rgba(24,18,64,0.85)',   border: '#818cf8', glow: '0 0 14px rgba(129,140,248,0.40)' },
  FORWARD:    { primary: '#fb923c', bg: 'rgba(50,22,4,0.70)',    bgHover: 'rgba(66,28,6,0.85)',    border: '#fb923c', glow: '0 0 14px rgba(251,146,60,0.45)' },
  DISTRESSED: { primary: '#dc6868', bg: 'rgba(42,12,12,0.80)',   bgHover: 'rgba(56,16,16,0.90)',   border: '#dc6868', glow: '0 0 14px rgba(220,104,104,0.40)' },
  MERGER_ARB: { primary: '#d97706', bg: 'rgba(46,26,4,0.70)',    bgHover: 'rgba(60,34,6,0.85)',    border: '#d97706', glow: '0 0 14px rgba(217,119,6,0.45)' },
  SPECIAL_SITUATIONS: { primary: '#f472b6', bg: 'rgba(44,8,28,0.70)', bgHover: 'rgba(58,10,38,0.85)', border: '#f472b6', glow: '0 0 14px rgba(244,114,182,0.40)' },
  CATALYST:   { primary: '#f97316', bg: 'rgba(46,16,4,0.70)',    bgHover: 'rgba(60,20,6,0.85)',    border: '#f97316', glow: '0 0 14px rgba(249,115,22,0.45)' },
  CRYPTO:     { primary: '#facc15', bg: 'rgba(40,30,4,0.70)',    bgHover: 'rgba(52,40,6,0.85)',    border: '#facc15', glow: '0 0 14px rgba(250,204,21,0.50)' },
  NFT:        { primary: '#e879f9', bg: 'rgba(40,6,52,0.70)',    bgHover: 'rgba(52,8,68,0.85)',    border: '#e879f9', glow: '0 0 14px rgba(232,121,249,0.50)' },
  CHARACTER:  { primary: '#f97316', bg: 'rgba(60,28,8,0.70)',    bgHover: 'rgba(78,36,10,0.85)',   border: '#f97316', glow: '0 0 14px rgba(249,115,22,0.45)' },
  GADGET:     { primary: '#06b6d4', bg: 'rgba(6,40,50,0.70)',    bgHover: 'rgba(8,52,65,0.85)',    border: '#06b6d4', glow: '0 0 14px rgba(6,182,212,0.45)' },
  LOCATION:   { primary: '#84cc16', bg: 'rgba(22,42,6,0.70)',    bgHover: 'rgba(28,55,8,0.85)',    border: '#84cc16', glow: '0 0 14px rgba(132,204,22,0.45)' },
  TEAM:       { primary: '#ec4899', bg: 'rgba(50,8,30,0.70)',    bgHover: 'rgba(65,10,40,0.85)',   border: '#ec4899', glow: '0 0 14px rgba(236,72,153,0.45)' },
  VILLAIN:    { primary: '#ef4444', bg: 'rgba(55,8,8,0.70)',     bgHover: 'rgba(72,10,10,0.85)',   border: '#ef4444', glow: '0 0 14px rgba(239,68,68,0.45)' },
  ALIAS:      { primary: '#f59e0b', bg: 'rgba(52,30,6,0.70)',    bgHover: 'rgba(68,40,8,0.85)',    border: '#f59e0b', glow: '0 0 14px rgba(245,158,11,0.45)' },
  FILM:       { primary: '#3b82f6', bg: 'rgba(8,25,55,0.70)',    bgHover: 'rgba(10,32,72,0.85)',   border: '#3b82f6', glow: '0 0 14px rgba(59,130,246,0.45)' },
  CREATOR:    { primary: '#10b981', bg: 'rgba(6,38,25,0.70)',    bgHover: 'rgba(8,50,32,0.85)',    border: '#10b981', glow: '0 0 14px rgba(16,185,129,0.45)' },
  REALITY:    { primary: '#a855f7', bg: 'rgba(35,8,55,0.70)',    bgHover: 'rgba(45,10,72,0.85)',   border: '#a855f7', glow: '0 0 14px rgba(168,85,247,0.45)' },
  DC_CHARACTER:{ primary: '#1d6fca', bg: 'rgba(6,20,52,0.70)',   bgHover: 'rgba(8,28,70,0.85)',    border: '#1d6fca', glow: '0 0 14px rgba(29,111,202,0.50)' },
  DC_TEAM:    { primary: '#38bdf8', bg: 'rgba(4,24,48,0.70)',    bgHover: 'rgba(6,32,64,0.85)',    border: '#38bdf8', glow: '0 0 14px rgba(56,189,248,0.45)' },
  BATTLE_STATS:{ primary: '#f43f5e', bg: 'rgba(52,8,18,0.70)',   bgHover: 'rgba(68,10,24,0.85)',   border: '#f43f5e', glow: '0 0 14px rgba(244,63,94,0.50)' },
  TEAM_UP:    { primary: '#ff6b35', bg: 'rgba(55,22,8,0.70)',    bgHover: 'rgba(72,28,10,0.85)',   border: '#ff6b35', glow: '0 0 14px rgba(255,107,53,0.45)' },
  EVENT:      { primary: '#3b9eff', bg: 'rgba(6,22,52,0.70)',    bgHover: 'rgba(8,28,68,0.85)',    border: '#3b9eff', glow: '0 0 14px rgba(59,158,255,0.45)' },
  CROSSOVER:  { primary: '#e040fb', bg: 'rgba(38,4,50,0.70)',    bgHover: 'rgba(50,6,68,0.85)',    border: '#e040fb', glow: '0 0 14px rgba(224,64,251,0.45)' },
  VILLAIN_TEAM:{ primary: '#dc2626', bg: 'rgba(48,4,4,0.80)',    bgHover: 'rgba(64,6,6,0.90)',     border: '#dc2626', glow: '0 0 14px rgba(220,38,38,0.50)' },
  COSMIC:     { primary: '#8b5cf6', bg: 'rgba(28,8,50,0.70)',    bgHover: 'rgba(38,10,68,0.85)',   border: '#8b5cf6', glow: '0 0 14px rgba(139,92,246,0.50)' },
  WEAPON:     { primary: '#94a3b8', bg: 'rgba(18,22,28,0.80)',   bgHover: 'rgba(24,28,36,0.90)',   border: '#94a3b8', glow: '0 0 14px rgba(148,163,184,0.40)' },
  SIDEKICK:   { primary: '#fbbf24', bg: 'rgba(44,28,4,0.70)',    bgHover: 'rgba(58,36,6,0.85)',    border: '#fbbf24', glow: '0 0 14px rgba(251,191,36,0.40)' },
  LEGACY:     { primary: '#c084fc', bg: 'rgba(32,8,50,0.70)',    bgHover: 'rgba(42,10,68,0.85)',   border: '#c084fc', glow: '0 0 14px rgba(192,132,252,0.45)' },
  NEMESIS:    { primary: '#f43f5e', bg: 'rgba(50,6,18,0.70)',    bgHover: 'rgba(66,8,24,0.85)',    border: '#f43f5e', glow: '0 0 14px rgba(244,63,94,0.45)' },
  STORY_ARC:  { primary: '#14b8a6', bg: 'rgba(4,34,30,0.70)',    bgHover: 'rgba(6,46,40,0.85)',    border: '#14b8a6', glow: '0 0 14px rgba(20,184,166,0.45)' },
  ORIGIN_STORY:{ primary: '#f59e0b', bg: 'rgba(46,28,4,0.70)',   bgHover: 'rgba(60,36,6,0.85)',    border: '#f59e0b', glow: '0 0 14px rgba(245,158,11,0.45)' },
  SECRET_IDENTITY:{ primary: '#c084fc', bg: 'rgba(28,8,50,0.70)', bgHover: 'rgba(36,10,65,0.85)', border: '#c084fc', glow: '0 0 14px rgba(192,132,252,0.45)' },
  PUBLISHER_STOCK:{ primary: '#2563eb', bg: 'rgba(4,16,44,0.80)', bgHover: 'rgba(6,20,58,0.90)', border: '#2563eb', glow: '0 0 14px rgba(37,99,235,0.50)' },
  BOND:       { primary: '#e5c06d', bg: 'rgba(48,36,6,0.70)',    bgHover: 'rgba(62,46,8,0.85)',    border: '#e5c06d', glow: '0 0 14px rgba(229,192,109,0.50)' },
  COMMODITY:  { primary: '#fb923c', bg: 'rgba(52,22,6,0.70)',    bgHover: 'rgba(68,28,8,0.85)',    border: '#fb923c', glow: '0 0 14px rgba(251,146,60,0.45)' },
  CURRENCY:   { primary: '#38bdf8', bg: 'rgba(6,28,48,0.70)',    bgHover: 'rgba(8,36,62,0.85)',    border: '#38bdf8', glow: '0 0 14px rgba(56,189,248,0.45)' },
  PREDICTION: { primary: '#a3e635', bg: 'rgba(18,42,4,0.70)',    bgHover: 'rgba(24,55,6,0.85)',    border: '#a3e635', glow: '0 0 14px rgba(163,230,53,0.45)' },
};

export const SURFACE_ART_MAP: Partial<Record<SurfaceKey, string>> = {
  CHARACTER:          '/surface-art/character.png',
  ALIAS:              '/surface-art/alias.png',
  TEAM:               '/surface-art/team.png',
  TEAM_UP:            '/surface-art/team_up.png',
  EVENT:              '/surface-art/event.png',
  CROSSOVER:          '/surface-art/crossover.png',

  DC_CHARACTER:       '/surface-art/dc_character.png',
  DC_TEAM:            '/surface-art/dc_team.png',

  VILLAIN:            '/surface-art/villain.png',
  VILLAIN_TEAM:       '/surface-art/villain_team.png',

  BATTLE_STATS:       '/surface-art/battle_stats.png',

  GADGET:             '/surface-art/gadget.png',
  LOCATION:           '/surface-art/location.png',
  REALITY:            '/surface-art/reality.png',
  COSMIC:             '/surface-art/cosmic.png',
  WEAPON:             '/surface-art/weapon.png',
  SIDEKICK:           '/surface-art/sidekick.png',
  LEGACY:             '/surface-art/legacy.png',
  NEMESIS:            '/surface-art/nemesis.png',
  STORY_ARC:          '/surface-art/story_arc.png',
  ORIGIN_STORY:       '/surface-art/origin_story.png',
  SECRET_IDENTITY:    '/surface-art/secret_identity.png',

  FILM:               '/surface-art/film.png',
  CREATOR:            '/surface-art/creator.png',
  PUBLISHER_STOCK:    '/surface-art/publisher_stock.png',

  INDEX:              '/surface-art/index.png',
  OPTIONS:            '/surface-art/options.png',
  CREDIT:             '/surface-art/credit.png',
  VOLATILITY:         '/surface-art/volatility.png',
  SWAPS:              '/surface-art/swaps.png',
  WARRANT:            '/surface-art/warrant.png',
  CONVERTIBLE:        '/surface-art/convertible.png',
  FORWARD:            '/surface-art/forward.png',

  ETF:                '/surface-art/etf.png',
  FUND:               '/surface-art/fund.png',
  FUTURES:            '/surface-art/futures.png',
  REIT:               '/surface-art/reit.png',
  STRUCTURED:         '/surface-art/structured.png',
  TREASURY:           '/surface-art/treasury.png',
  PRIVATE:            '/surface-art/private.png',
  HEDGE:              '/surface-art/hedge.png',
  LONG_SHORT:         '/surface-art/long_short.png',
  MANAGED_FUTURES:    '/surface-art/managed_futures.png',
  QUANT:              '/surface-art/quant.png',
  CONCENTRATED:       '/surface-art/concentrated.png',
  MACRO:              '/surface-art/macro.png',

  CRYPTO:             '/surface-art/crypto.png',
  NFT:                '/surface-art/nft.png',

  BOND:               '/surface-art/bond.png',
  COMMODITY:          '/surface-art/commodity.png',
  CURRENCY:           '/surface-art/currency.png',
  DISTRESSED:         '/surface-art/distressed.png',
  MERGER_ARB:         '/surface-art/merger_arb.png',
  SPECIAL_SITUATIONS: '/surface-art/special_situations.png',
  CATALYST:           '/surface-art/catalyst.png',

  PREDICTION:         '/surface-art/prediction.png',
};

export const SURFACE_ICONS: Record<string, string> = {
  INDEX:'≡', OPTIONS:'◇', CREDIT:'⚖', VOLATILITY:'∿', SWAPS:'⇄',
  WARRANT:'⊕', CONVERTIBLE:'⇌', FORWARD:'→', MERGER_ARB:'⊗', SPECIAL_SITUATIONS:'◎',
  MACRO:'⊜', CATALYST:'⚡',
  ETF:'▤', FUND:'◆', FUTURES:'↗', REIT:'⊞', STRUCTURED:'⊡', TREASURY:'▭', PRIVATE:'⊘',
  HEDGE:'⊛', LONG_SHORT:'⇕', MANAGED_FUTURES:'↻', QUANT:'∑', CONCENTRATED:'◉',
  CRYPTO:'⬡', NFT:'✦', BOND:'§', COMMODITY:'⬢', CURRENCY:'¤', DISTRESSED:'⚠',
  CHARACTER:'◈', VILLAIN:'✊', ALIAS:'★', TEAM:'⬟',
  GADGET:'⚙', LOCATION:'◉', FILM:'▶', CREATOR:'✐', REALITY:'∞',
  DC_CHARACTER:'◈', DC_TEAM:'⬟', BATTLE_STATS:'⚔',
  TEAM_UP:'⊕', EVENT:'◉', CROSSOVER:'✕', VILLAIN_TEAM:'☠', COSMIC:'✧',
  WEAPON:'⚔', SIDEKICK:'◇', LEGACY:'⊳', NEMESIS:'◈', STORY_ARC:'⊙',
  ORIGIN_STORY:'○', SECRET_IDENTITY:'?', PUBLISHER_STOCK:'$',
  PREDICTION:'⊙',
};

export const FAMILY_ORDER = [
  'MARVEL', 'DC_HERO', 'VILLAIN', 'BATTLE',
  'COMIC_OBJECT', 'REAL_WORLD',
  'DERIVATIVE', 'VEHICLE', 'DIGITAL', 'CLASSIC', 'PREDICTION',
] as const;
export type FamilyKey = typeof FAMILY_ORDER[number];

export const FAMILY_MEMBERS: Record<FamilyKey, SurfaceKey[]> = {
  MARVEL:       ['CHARACTER', 'ALIAS', 'TEAM', 'TEAM_UP', 'EVENT', 'CROSSOVER'],
  DC_HERO:      ['DC_CHARACTER', 'DC_TEAM'],
  VILLAIN:      ['VILLAIN', 'VILLAIN_TEAM'],
  BATTLE:       ['BATTLE_STATS'],
  COMIC_OBJECT: ['GADGET', 'LOCATION', 'REALITY', 'COSMIC', 'WEAPON', 'SIDEKICK', 'LEGACY', 'NEMESIS', 'STORY_ARC', 'ORIGIN_STORY', 'SECRET_IDENTITY'],
  REAL_WORLD:   ['FILM', 'CREATOR', 'PUBLISHER_STOCK'],
  DERIVATIVE:   ['INDEX', 'OPTIONS', 'CREDIT', 'VOLATILITY', 'SWAPS', 'WARRANT', 'CONVERTIBLE', 'FORWARD'],
  VEHICLE:      ['ETF', 'FUND', 'REIT', 'STRUCTURED', 'TREASURY', 'PRIVATE', 'HEDGE', 'FUTURES', 'LONG_SHORT', 'MACRO', 'MANAGED_FUTURES', 'QUANT', 'CONCENTRATED'],
  DIGITAL:      ['CRYPTO', 'NFT'],
  CLASSIC:      ['BOND', 'COMMODITY', 'CURRENCY', 'DISTRESSED', 'MERGER_ARB', 'SPECIAL_SITUATIONS', 'CATALYST'],
  PREDICTION:   ['PREDICTION'],
};
