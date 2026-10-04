const fs = require('fs');
const { Client } = require('pg');

let dbUrl = '';
const env = fs.readFileSync('.env.local', 'utf8');
for (const line of env.split('\n')) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
  }
}

const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function run() {
  await client.connect();
  console.log('[Catalog Audit] Connected to PostgreSQL. Analyzing all 115,712 Panel Profits books...');
  console.time('full_catalog_audit');

  let lastId = '';
  let total = 0;

  // Field counters
  const counts = {
    series: 0,
    title: 0,
    issue_number: 0,
    volume: 0,
    printing: 0,
    publisher: 0,
    publisher_blank: 0,
    publication_year: 0,
    publication_date: 0,
    upc: 0,
    cover_url_valid: 0,
    cover_url_missing: 0,
    cover_url_gcd403: 0,
    cover_fandom: 0,
    cover_gcs: 0,
    cover_supabase: 0,
    pp_source_id: 0,
    comicbase_source_id: 0,
    gcd_source_id: 0,
    both_cb_and_gcd: 0,
    gcd_only: 0,
    cb_only: 0,
    neither_cb_nor_gcd: 0,
    pp_grade_9_8_price: 0,
    comicbase_price: 0,
    baseline_grade_9_8_value: 0,
    any_price: 0,
    no_price: 0,
    panel_profits_data: 0,
    comicbase_data: 0,
    gcd_data: 0,
  };

  const publisherMap = {};
  const eraMap = { golden: 0, silver: 0, bronze: 0, copper: 0, modern: 0, unknown: 0 };
  const ppDataKeys = new Set();
  const cbDataKeys = new Set();
  const gcdDataKeys = new Set();

  let priceSum = 0;
  let priceCount = 0;
  let minPrice = Infinity;
  let maxPrice = -Infinity;

  const sampleComplete = [];
  const sampleMissing = [];

  while (true) {
    const res = await client.query(
      `SELECT 
        id, series, title, issue_number, volume, printing, publisher,
        publication_date, publication_year, upc, alt_upc,
        pp_source_id, comicbase_source_id, gcd_source_id,
        pp_grade_9_8_price, comicbase_price, baseline_grade_9_8_value,
        panel_profits_data, comicbase_data, gcd_data,
        cover_url, cover_verified_at
       FROM comics
       WHERE pp_source_id > $1
       ORDER BY pp_source_id ASC
       LIMIT 2000`,
      [lastId]
    );

    if (res.rows.length === 0) break;

    total += res.rows.length;
    lastId = res.rows[res.rows.length - 1].pp_source_id;

    for (const r of res.rows) {
      if (r.series && r.series.trim()) counts.series++;
      if (r.title && r.title.trim()) counts.title++;
      if (r.issue_number && r.issue_number.trim()) counts.issue_number++;
      if (r.volume && r.volume.trim()) counts.volume++;
      if (r.printing && r.printing.trim()) counts.printing++;

      const pub = r.publisher ? r.publisher.trim() : '';
      if (pub) {
        counts.publisher++;
        publisherMap[pub] = (publisherMap[pub] || 0) + 1;
      } else {
        counts.publisher_blank++;
      }

      if (r.publication_year) {
        counts.publication_year++;
        const y = Number(r.publication_year);
        if (y <= 1955) eraMap.golden++;
        else if (y <= 1969) eraMap.silver++;
        else if (y <= 1983) eraMap.bronze++;
        else if (y <= 1991) eraMap.copper++;
        else eraMap.modern++;
      } else {
        eraMap.unknown++;
      }

      if (r.publication_date && r.publication_date.trim()) counts.publication_date++;
      if (r.upc && r.upc.trim()) counts.upc++;

      // Cover analysis
      const c = r.cover_url ? r.cover_url.trim() : '';
      if (!c) {
        counts.cover_url_missing++;
      } else if (c.includes('files1.comics.org') || c.includes('526.jpg')) {
        counts.cover_url_gcd403++;
      } else {
        counts.cover_url_valid++;
        if (c.includes('wikia') || c.includes('fandom')) counts.cover_fandom++;
        else if (c.includes('pricecharting.com') || c.includes('storage.googleapis.com')) counts.cover_gcs++;
        else if (c.includes('supabase.co')) counts.cover_supabase++;
      }

      // External crosswalks
      if (r.pp_source_id) counts.pp_source_id++;
      const hasCb = Boolean(r.comicbase_source_id && r.comicbase_source_id.trim());
      const hasGcd = Boolean(r.gcd_source_id && r.gcd_source_id.trim());
      if (hasCb) counts.comicbase_source_id++;
      if (hasGcd) counts.gcd_source_id++;

      if (hasCb && hasGcd) counts.both_cb_and_gcd++;
      else if (hasGcd && !hasCb) counts.gcd_only++;
      else if (hasCb && !hasGcd) counts.cb_only++;
      else counts.neither_cb_nor_gcd++;

      // Pricing analysis
      const ppPrice = r.pp_grade_9_8_price ? Number(r.pp_grade_9_8_price) : null;
      const cbPrice = r.comicbase_price ? Number(r.comicbase_price) : null;
      const basePrice = r.baseline_grade_9_8_value ? Number(r.baseline_grade_9_8_value) : null;

      if (ppPrice !== null && ppPrice > 0) {
        counts.pp_grade_9_8_price++;
        priceSum += ppPrice;
        priceCount++;
        if (ppPrice < minPrice) minPrice = ppPrice;
        if (ppPrice > maxPrice) maxPrice = ppPrice;
      }
      if (cbPrice !== null && cbPrice > 0) counts.comicbase_price++;
      if (basePrice !== null && basePrice > 0) counts.baseline_grade_9_8_value++;

      if ((ppPrice && ppPrice > 0) || (cbPrice && cbPrice > 0) || (basePrice && basePrice > 0)) {
        counts.any_price++;
      } else {
        counts.no_price++;
      }

      // JSONB payloads
      if (r.panel_profits_data && Object.keys(r.panel_profits_data).length > 0) {
        counts.panel_profits_data++;
        for (const k of Object.keys(r.panel_profits_data)) ppDataKeys.add(k);
      }
      if (r.comicbase_data && Object.keys(r.comicbase_data).length > 0) {
        counts.comicbase_data++;
        for (const k of Object.keys(r.comicbase_data)) cbDataKeys.add(k);
      }
      if (r.gcd_data && Object.keys(r.gcd_data).length > 0) {
        counts.gcd_data++;
        for (const k of Object.keys(r.gcd_data)) gcdDataKeys.add(k);
      }

      // Samples
      if (sampleComplete.length < 5 && pub && r.publication_year && c && ppPrice && hasGcd) {
        sampleComplete.push({
          series: r.series,
          issue: r.issue_number,
          publisher: r.publisher,
          year: r.publication_year,
          price: ppPrice,
          gcd_id: r.gcd_source_id,
          cover: c.slice(0, 50) + '...'
        });
      }

      if (sampleMissing.length < 5 && (!pub || !c || !ppPrice)) {
        sampleMissing.push({
          series: r.series,
          issue: r.issue_number,
          missing: [
            !pub ? 'publisher' : null,
            !c ? 'cover' : null,
            !ppPrice ? 'pp_price' : null,
            !hasGcd ? 'gcd_id' : null
          ].filter(Boolean)
        });
      }
    }

    if (total % 20000 === 0) {
      console.log(`Audited ${total} / 115,712 records...`);
    }
  }

  console.timeEnd('full_catalog_audit');

  const topPublishers = Object.entries(publisherMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  const report = {
    totalCatalog: total,
    counts,
    percentages: {},
    topPublishers,
    eras: eraMap,
    pricingSummary: {
      totalPriced: counts.pp_grade_9_8_price,
      pctPriced: ((counts.pp_grade_9_8_price / total) * 100).toFixed(1) + '%',
      avgPrice: priceCount > 0 ? (priceSum / priceCount).toFixed(2) : 0,
      minPrice: isFinite(minPrice) ? minPrice : 0,
      maxPrice: isFinite(maxPrice) ? maxPrice : 0,
      anyPriceAvailable: counts.any_price,
      unpricedTotal: counts.no_price,
    },
    jsonbKeys: {
      panel_profits_data: Array.from(ppDataKeys),
      comicbase_data: Array.from(cbDataKeys),
      gcd_data: Array.from(gcdDataKeys),
    },
    sampleComplete,
    sampleMissing,
  };

  for (const [k, v] of Object.entries(counts)) {
    report.percentages[k] = ((v / total) * 100).toFixed(1) + '%';
  }

  fs.writeFileSync('catalog_115k_audit_report.json', JSON.stringify(report, null, 2));
  console.log('[Catalog Audit] Full report saved to catalog_115k_audit_report.json!');
  console.log(JSON.stringify(report, null, 2));

  await client.end();
}

run().catch((err) => {
  console.error('[Catalog Audit] Fatal error:', err);
  process.exit(1);
});
