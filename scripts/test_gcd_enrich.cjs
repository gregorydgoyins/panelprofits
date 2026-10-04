const fs = require('fs');
const { Client } = require('pg');

let dbUrl = '';
const env = fs.readFileSync('.env.local', 'utf8');
for (const line of env.split('\n')) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
  }
}

async function testEnrich() {
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log('Testing GCD enrichment join on 5 sample books...');
  const res = await client.query(`
    SELECT 
      c.id,
      c.series,
      c.issue_number,
      c.publication_year,
      c.publisher as existing_publisher,
      c.pp_source_id,
      l.gcd_issue_id,
      snap.gcd_series_id,
      s.name::text as gcd_series_name,
      s.year_began as series_year_began,
      s.year_ended as series_year_ended,
      s.format::text as series_format,
      s.dimensions::text as dimensions,
      s.binding::text as binding,
      s.color::text as color_spec,
      s.issue_count as total_series_issues,
      p.name::text as gcd_publisher,
      snap.barcode,
      snap.publication_date as indicia_pub_date
    FROM comics c
    INNER JOIN pp_verified_gcd_identity_links l 
      ON c.pp_source_id = l.pp_source_product_id
    LEFT JOIN pp_gcd_issue_candidate_snapshots snap 
      ON snap.gcd_issue_id = l.gcd_issue_id
    LEFT JOIN ppcf_gcd_series s 
      ON s.gcd_series_id = snap.gcd_series_id::integer
    LEFT JOIN ppcf_gcd_publishers p 
      ON s.publisher_id = p.gcd_publisher_id
    LIMIT 5;
  `);

  console.log('Enriched samples:');
  for (const r of res.rows) {
    console.log(r);
  }

  await client.end();
}

testEnrich().catch(console.error);
