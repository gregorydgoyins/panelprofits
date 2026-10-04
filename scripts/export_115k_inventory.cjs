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

async function exportAllBooks() {
  await client.connect();
  const outFile = 'data/panel_profits_115k_inventory.csv';
  console.log(`[Export] Extracting all 115,712 books to ${outFile}...`);

  const writeStream = fs.createWriteStream(outFile, { flags: 'w' });
  writeStream.write(
    'pp_source_id,series,issue_number,publication_year,publisher,pp_grade_9_8_price,ungraded_market_price,grade_6_0_price,grade_8_0_price,cover_url,has_cover,has_9_8_price,has_publisher,missing_fields\n'
  );

  let lastId = '';
  let count = 0;

  while (true) {
    const res = await client.query(
      `SELECT 
        pp_source_id, series, issue_number, publication_year, publisher,
        pp_grade_9_8_price, panel_profits_data, cover_url
       FROM comics
       WHERE pp_source_id > $1
       ORDER BY pp_source_id ASC
       LIMIT 2500`,
      [lastId]
    );

    if (res.rows.length === 0) break;

    count += res.rows.length;
    lastId = res.rows[res.rows.length - 1].pp_source_id;

    for (const r of res.rows) {
      const ppData = r.panel_profits_data || {};
      const ungrPrice = ppData['PP - Ungraded Market Price'] || '';
      const g6Price = ppData['PP - Grade 6.0 Market Price'] || '';
      const g8Price = ppData['PP - Grade 8.0 Market Price'] || '';

      const s = (r.series || '').replace(/"/g, '""');
      const iss = (r.issue_number || '').replace(/"/g, '""');
      const yr = r.publication_year || '';
      const pub = (r.publisher || '').replace(/"/g, '""');
      const p98 = r.pp_grade_9_8_price || '';
      const cov = (r.cover_url || '').replace(/"/g, '""');

      const hasCov = Boolean(r.cover_url && r.cover_url.trim() && !r.cover_url.includes('files1.comics.org'));
      const hasPrice = Boolean(r.pp_grade_9_8_price && Number(r.pp_grade_9_8_price) > 0);
      const hasPub = Boolean(r.publisher && r.publisher.trim());

      const missing = [];
      if (!hasCov) missing.push('cover');
      if (!hasPrice) missing.push('9.8_price');
      if (!hasPub) missing.push('publisher');
      if (!yr) missing.push('year');

      const line = `"${r.pp_source_id}","${s}","${iss}","${yr}","${pub}","${p98}","${ungrPrice}","${g6Price}","${g8Price}","${cov}",${hasCov},${hasPrice},${hasPub},"${missing.join(';')}"\n`;
      writeStream.write(line);
    }

    if (count % 25000 === 0) {
      console.log(`[Export] Wrote ${count} / 115,712 books...`);
    }
  }

  writeStream.end();
  console.log(`[Export] Finished! Total books exported: ${count} to ${outFile}`);
  await client.end();
}

exportAllBooks().catch(console.error);
