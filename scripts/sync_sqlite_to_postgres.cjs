const fs = require('fs');
const { Client } = require('pg');
const { DatabaseSync } = require('node:sqlite');

let dbUrl = '';
for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
  if (line.startsWith('DATABASE_URL=')) dbUrl = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
}
const pgClient = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
const sqlite = new DatabaseSync('data/pp115k.sqlite');

async function sync() {
  await pgClient.connect();
  console.log('Connected to Postgres.');

  // Check count in sqlite
  const total = sqlite.prepare('SELECT count(*) as cnt FROM verified_equities').get().cnt;
  console.log('SQLite verified_equities count:', total);

  // Sync in batches of 1000
  const rows = sqlite.prepare('SELECT id, reference_grade, fmv_usd, price_formatted, publisher, variant, title FROM verified_equities').all();
  console.log('Read all rows from SQLite, updating Postgres in batches...');

  const batchSize = 1000;
  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    let values = [];
    let params = [];
    chunk.forEach((r, idx) => {
      const baseIdx = idx * 6;
      values.push(`($${baseIdx+1}::text, $${baseIdx+2}::text, $${baseIdx+3}::numeric, $${baseIdx+4}::text, $${baseIdx+5}::text, $${baseIdx+6}::text)`);
      params.push(r.id, r.reference_grade, r.fmv_usd, r.price_formatted, r.publisher, r.variant || null);
    });

    const q = `
      UPDATE verified_equities AS v
      SET 
        reference_grade = u.ref_grade,
        fmv_usd = u.fmv,
        price_formatted = u.fmt,
        publisher = u.pub,
        variant = u.var
      FROM (VALUES ${values.join(',')}) AS u(id, ref_grade, fmv, fmt, pub, var)
      WHERE v.id = u.id;
    `;
    await pgClient.query(q, params);
    if ((i + batchSize) % 5000 === 0 || i + batchSize >= rows.length) {
      console.log(`Synced ${Math.min(i + batchSize, rows.length)} / ${rows.length} rows...`);
    }
  }

  // Also insert the new variants into Postgres
  console.log('Checking for new variant rows to insert into Postgres...');
  const newVariants = sqlite.prepare("SELECT * FROM verified_equities WHERE id LIKE 'var-%'").all();
  console.log('Total new variants to upsert:', newVariants.length);

  for (let i = 0; i < newVariants.length; i += 200) {
    const chunk = newVariants.slice(i, i + 200);
    for (const r of chunk) {
      await pgClient.query(`
        INSERT INTO verified_equities (
          id, series, issue_number, title, publication_year, publisher,
          fmv_usd, price_formatted, cover_url, ticker, origin_era, production_age,
          reference_grade, gregory_score, delta_percent, status, variant, source_product_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (id) DO UPDATE SET
          variant = EXCLUDED.variant,
          reference_grade = EXCLUDED.reference_grade,
          fmv_usd = EXCLUDED.fmv_usd,
          price_formatted = EXCLUDED.price_formatted,
          publisher = EXCLUDED.publisher;
      `, [
        r.id, r.series, String(r.issue_number), r.title, r.publication_year ? Number(r.publication_year) : null, r.publisher,
        r.fmv_usd, r.price_formatted, r.cover_url, r.ticker, r.origin_era, r.production_age,
        r.reference_grade, r.gregory_score, r.delta_percent, r.status, r.variant, r.source_product_id
      ]);
    }
    console.log(`Upserted ${Math.min(i + 200, newVariants.length)} / ${newVariants.length} variants...`);
  }

  console.log('Postgres synchronization complete!');
  await pgClient.end();
}

sync().catch(console.error);
