const fs = require('fs');
const { Client } = require('pg');

let dbUrl = '';
const env = fs.readFileSync('.env.local', 'utf8');
for (const line of env.split('\n')) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
  }
}

async function runFastEnrichment() {
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log('=== FAST BULK GCD METADATA ENRICHMENT PIPELINE ===');
  const batchSize = 1000;
  let offset = 0;
  let totalEnriched = 0;
  let publishersFilled = 0;

  while (true) {
    const t0 = Date.now();
    const batch = await client.query(`
      SELECT 
        c.id,
        c.series,
        c.issue_number,
        c.publisher,
        c.pp_source_id,
        c.gcd_data,
        l.gcd_issue_id,
        snap.gcd_series_id,
        snap.barcode,
        snap.publication_date as indicia_pub_date,
        s.name::text as gcd_series_name,
        s.year_began as series_year_began,
        s.year_ended as series_year_ended,
        s.format::text as series_format,
        s.dimensions::text as dimensions,
        s.binding::text as binding,
        s.color::text as color_spec,
        s.issue_count as total_series_issues,
        p.name::text as gcd_publisher
      FROM comics c
      INNER JOIN pp_verified_gcd_identity_links l 
        ON c.pp_source_id = l.pp_source_product_id
      LEFT JOIN pp_gcd_issue_candidate_snapshots snap 
        ON snap.gcd_issue_id = l.gcd_issue_id
      LEFT JOIN ppcf_gcd_series s 
        ON s.gcd_series_id = snap.gcd_series_id::integer
      LEFT JOIN ppcf_gcd_publishers p 
        ON s.publisher_id = p.gcd_publisher_id
      ORDER BY c.pp_source_id ASC
      LIMIT $1 OFFSET $2;
    `, [batchSize, offset]);

    if (batch.rows.length === 0) break;

    // Collect gcd_issue_ids
    const issueIds = batch.rows.map(r => parseInt(r.gcd_issue_id, 10)).filter(id => !isNaN(id));

    // Fetch stories for these issues
    const storiesRes = await client.query(`
      SELECT 
        gcd_issue_id,
        sequence_number,
        title,
        feature,
        script,
        pencils,
        inks,
        colors,
        letters,
        editing,
        characters,
        genre,
        synopsis
      FROM ppcf_gcd_stories
      WHERE gcd_issue_id = ANY($1)
      ORDER BY gcd_issue_id, sequence_number ASC;
    `, [issueIds]);

    const storiesByIssue = new Map();
    for (const story of storiesRes.rows) {
      if (!storiesByIssue.has(story.gcd_issue_id)) {
        storiesByIssue.set(story.gcd_issue_id, []);
      }
      storiesByIssue.get(story.gcd_issue_id).push(story);
    }

    const updates = [];
    for (const row of batch.rows) {
      const issueIdNum = parseInt(row.gcd_issue_id, 10);
      const stories = storiesByIssue.get(issueIdNum) || [];
      
      const leadStory = stories.find(s => (s.script && s.script.trim() !== '' && s.script !== '?') || (s.pencils && s.pencils.trim() !== '' && s.pencils !== '?') || (s.characters && s.characters.trim() !== '')) || stories[0] || {};

      const existingData = row.gcd_data || {};
      const enrichedGcdData = {
        ...existingData,
        'GCD Source ID': row.gcd_issue_id,
        'GCD - gcd_issue.id': row.gcd_issue_id,
        'GCD - gcd_series.id': row.gcd_series_id || existingData['GCD - gcd_series.id'] || '',
        'GCD - gcd_series.name': row.gcd_series_name || row.series,
        'GCD - gcd_issue.number': row.issue_number,
        'GCD - gcd_publisher': row.gcd_publisher || existingData['GCD - gcd_publisher'] || '',
        'GCD - series.year_began': row.series_year_began || existingData['GCD - series.year_began'] || '',
        'GCD - series.year_ended': row.series_year_ended || existingData['GCD - series.year_ended'] || '',
        'GCD - series.issue_count': row.total_series_issues || existingData['GCD - series.issue_count'] || '',
        'GCD - series.dimensions': row.dimensions || existingData['GCD - series.dimensions'] || '',
        'GCD - series.binding': row.binding || existingData['GCD - series.binding'] || '',
        'GCD - series.color': row.color_spec || existingData['GCD - series.color'] || '',
        'GCD - issue.indicia_date': row.indicia_pub_date || existingData['GCD - gcd_issue.publication_date'] || '',
        'GCD - issue.barcode': row.barcode || existingData['GCD - gcd_issue.barcode'] || '',
        'GCD - story.lead_title': leadStory.title || '',
        'GCD - story.feature': leadStory.feature || '',
        'GCD - story.writer': leadStory.script || '',
        'GCD - story.penciler': leadStory.pencils || '',
        'GCD - story.inker': leadStory.inks || '',
        'GCD - story.colorist': leadStory.colors || '',
        'GCD - story.letterer': leadStory.letters || '',
        'GCD - story.editor': leadStory.editing || '',
        'GCD - story.characters': leadStory.characters || '',
        'GCD - story.genre': leadStory.genre || '',
        'GCD - story.synopsis': leadStory.synopsis || '',
        'GCD - story.total_sequences': stories.length
      };

      const newPublisher = (!row.publisher || row.publisher.trim() === '') && row.gcd_publisher ? row.gcd_publisher : row.publisher;
      if (!row.publisher && row.gcd_publisher) publishersFilled++;

      updates.push({
        id: row.id,
        gcd_source_id: row.gcd_issue_id,
        publisher: newPublisher,
        gcd_data: JSON.stringify(enrichedGcdData)
      });
    }

    // Bulk update using UNNEST
    const ids = updates.map(u => u.id);
    const gcdIds = updates.map(u => u.gcd_source_id);
    const pubs = updates.map(u => u.publisher);
    const gcdDatas = updates.map(u => u.gcd_data);

    await client.query(`
      UPDATE comics AS c
      SET 
        gcd_source_id = v.gcd_id,
        publisher = v.pub,
        gcd_data = v.gdata::jsonb,
        updated_at = NOW()
      FROM (
        SELECT 
          UNNEST($1::text[]) AS id,
          UNNEST($2::text[]) AS gcd_id,
          UNNEST($3::text[]) AS pub,
          UNNEST($4::text[]) AS gdata
      ) AS v
      WHERE c.id = v.id;
    `, [ids, gcdIds, pubs, gcdDatas]);

    totalEnriched += batch.rows.length;
    offset += batchSize;
    const dur = ((Date.now() - t0) / 1000).toFixed(2);
    console.log(`[Batch ${Math.floor(offset / batchSize)}] Enriched: ${totalEnriched} | Pubs filled: ${publishersFilled} | Batch time: ${dur}s`);
  }

  console.log(`\n=== ENRICHMENT SUMMARY ===`);
  console.log(`Total Comics Enriched with GCD Metadata: ${totalEnriched}`);
  console.log(`Total Missing Publishers Backfilled from GCD: ${publishersFilled}`);

  await client.end();
}

runFastEnrichment().catch(console.error);
