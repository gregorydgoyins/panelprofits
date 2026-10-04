const fs = require('fs');
const { Client } = require('pg');

let dbUrl = '';
const env = fs.readFileSync('.env.local', 'utf8');
for (const line of env.split('\n')) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
  }
}

async function run() {
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query('SET statement_timeout = 0;');
  console.log('Connected to Postgres.');

  // Let us inspect the latest 5 comics updated
  const latest = await client.query(`
    SELECT id, series, issue_number, publisher, gcd_source_id,
           gcd_data->>'writer' as writer,
           gcd_data->>'penciler' as penciler,
           gcd_data->>'key_badges' as key_badges,
           updated_at
    FROM comics
    ORDER BY updated_at DESC NULLS LAST
    LIMIT 5;
  `);
  console.log('LATEST UPDATED COMICS:');
  console.log(JSON.stringify(latest.rows, null, 2));

  // Let us check the count of comics where writer is present
  const enrichedCount = await client.query(`
    SELECT COUNT(*) as cnt 
    FROM comics 
    WHERE gcd_data->>'writer' IS NOT NULL AND gcd_data->>'writer' != '';
  `);
  console.log('COMICS WITH GCD WRITER:', enrichedCount.rows[0].cnt);

  await client.end();
}

run().catch(console.error);
