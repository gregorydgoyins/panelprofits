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
  console.log('Connected to PostgreSQL!');
  console.time('scan');

  let lastId = '';
  let totalScanned = 0;
  let validCovers = 0;
  let missingCovers = 0;
  let forbiddenGcd = 0;
  const missingSample = [];

  while (true) {
    const res = await client.query(
      `SELECT id, pp_source_id, series, issue_number, publisher, publication_year, cover_url 
       FROM comics 
       WHERE pp_source_id > $1 
       ORDER BY pp_source_id ASC 
       LIMIT 1000`,
      [lastId]
    );

    if (res.rows.length === 0) break;

    totalScanned += res.rows.length;
    lastId = res.rows[res.rows.length - 1].pp_source_id;

    for (const r of res.rows) {
      const c = r.cover_url ? r.cover_url.trim() : '';
      if (!c) {
        missingCovers++;
        if (missingSample.length < 5) missingSample.push(r);
      } else if (c.includes('files1.comics.org') || c.includes('526.jpg')) {
        forbiddenGcd++;
        if (missingSample.length < 5) missingSample.push(r);
      } else {
        validCovers++;
      }
    }

    if (totalScanned % 10000 === 0 || res.rows.length < 1000) {
      console.log(`Scanned ${totalScanned} / 113,586 | Valid: ${validCovers} | Missing: ${missingCovers} | GCD 403: ${forbiddenGcd}`);
    }
  }

  console.timeEnd('scan');
  console.log('--- FINAL TOTALS ---');
  console.log('Total Panel Profits books:', totalScanned);
  console.log('Valid covers:', validCovers, `(${(validCovers / totalScanned * 100).toFixed(1)}%)`);
  console.log('Missing covers:', missingCovers, `(${(missingCovers / totalScanned * 100).toFixed(1)}%)`);
  console.log('Forbidden GCD covers:', forbiddenGcd);
  console.log('Sample books needing covers:', missingSample);

  await client.end();
}

run().catch(console.error);
