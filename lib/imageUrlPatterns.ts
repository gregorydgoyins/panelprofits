export const LOW_RES_URL_PATTERNS = [
  /\/120\.jpg(\?|$)/i,
  /\/160\.jpg(\?|$)/i,
  /\/thumb\//i,
  /\/thumbs\//i,
  /\/small\//i,
  /[_-]thumb\./i,
  /[_-]small\./i,
  /[_-]xs\./i,
  /_s\.(jpe?g|png|webp|gif)(\?|$)/i,
];

export const PRICECHARTING_REF_RE = /images\.pricecharting\.com\/ref[0-9a-f]{8,}/i;

export const SLAB_DOMAIN_PATTERNS = [
  /[./]ha\.com\//i,
  /heritagestatic\.com\//i,
  /[./]heritage\.com\//i,
  /comics\.ha\.com\//i,
  /[./]ebay\.com\//i,
  /ebayimg\.com\//i,
  /i\.ebayimg\.com\//i,
  /[./]gocollect\.com\//i,
  /[./]clz\.com\//i,
  /[./]comiccollector\.com\//i,
  /[./]comiclink\.com\//i,
  /[./]myslabs\.com\//i,
  /[./]slabxchange\.com\//i,
  /[./]collectors\.com\//i,
];

export const SLAB_PATH_PATTERNS = [
  /\/cgc[_-]/i,
  /\/cbcs[_-]/i,
  /[_-]cgc[_.-]/i,
  /[_-]cbcs[_.-]/i,
  /\/graded\//i,
  /[_-]graded[_.-]/i,
  /\/slab[_-]/i,
  /[_-]slab[_.-]/i,
  /\/census\//i,
  /cgc\d+\.\d+/i,
  /cbcs\d+\.\d+/i,
  /grade[_-]\d+\.\d+/i,
];

export const LOW_QUALITY_MARKERS = [
  'placeholder', 'logo', 'no-image', 'spinner',
  'loading', 'default', 'blank', 'missing',
];

export const URL_UPGRADE_RULES: [RegExp, string][] = [
  [/^http:\/\//i, 'https://'],
  [/^https?:\/\/images\.pricecharting\.com\//i, 'https://storage.googleapis.com/images.pricecharting.com/'],
  [/\/60\.jpg(\?|$)/, '/240.jpg$1'],
  [/\/120\.jpg(\?|$)/, '/240.jpg$1'],
  [/\/160\.jpg(\?|$)/, '/240.jpg$1'],
  [/\/scale-to-width-down\/\d+/i, ''],
  [/\/thumb(\/[^/]+\/[^/]+\/[^?#/]+(?<!\.svg))\/\d+px-[^?#/]+/i, '$1'],
  [/\/thumbs\//i, '/'],
  [/\/small\//i, '/'],
  [/[_-]thumb\./i, '.'],
];
