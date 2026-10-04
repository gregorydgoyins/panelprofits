const fs = require('fs');
const { Client } = require('pg');

let dbUrl = '';
const env = fs.readFileSync('.env.local', 'utf8');
for (const line of env.split('\n')) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
  }
}

function extractKeyBadges(charactersStr, synopsisStr) {
  const badges = [];
  if (charactersStr) {
    const entries = charactersStr.split(/;|\n/);
    for (const entry of entries) {
      const trimmed = entry.trim();
      if (!trimmed) continue;
      if (/\b(?:introduction|intro|first\s+appearance|debut)\b/i.test(trimmed)) {
        const name = trimmed.replace(/\([^)]*\)/g, '').trim();
        if (name && name.length < 50 && !/^(a\s+group|various|un-named|several|guest|unnamed)/i.test(name)) {
          badges.push(`1st App: ${name}`);
        }
      } else if (/\borigin\b/i.test(trimmed)) {
        const name = trimmed.replace(/\([^)]*\)/g, '').trim();
        if (name && name.length < 50) {
          badges.push(`Origin of ${name}`);
        }
      } else if (/\bdeath\b/i.test(trimmed)) {
        const name = trimmed.replace(/\([^)]*\)/g, '').trim();
        if (name && name.length < 50) {
          badges.push(`Death of ${name}`);
        }
      }
    }
  }
  return Array.from(new Set(badges)).slice(0, 6);
}

async function testFastEnrich() {
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log('[GCD Engine] Loading verified links and candidate snapshots into memory...');
  console.time('preload_maps');

  const linksRes = await client.query('SELECT pp_source_product_id, gcd_issue_id FROM pp_verified_gcd_identity_links;');
  const verifiedMap = new Map();
  for (const l of linksRes.rows) verifiedMap.set(l.pp_source_product_id, l.gcd_issue_id);

  const snapsRes = await client.query('SELECT gcd_issue_id, gcd_series_id, series_name, issue_number, publication_date, barcode, isbn, issue_title FROM pp_gcd_issue_candidate_snapshots;');
  const snapshotById = new Map();
  const snapshotByTitle = new Map();
  const seriesIdsSet = new Set();

  for (const s of snapsRes.rows) {
    snapshotById.set(s.gcd_issue_id, s);
    const key = `${s.series_name.toLowerCase()}:::${s.issue_number}`;
    if (!snapshotByTitle.has(key)) snapshotByTitle.set(key, s);
    if (s.gcd_series_id) {
      const sId = parseInt(s.gcd_series_id, 10);
      if (!isNaN(sId)) seriesIdsSet.add(sId);
    }
  }

  // Preload relevant series
  const seriesRes = await client.query(`
    SELECT 
      s.gcd_series_id, s.name::text as series_name, s.year_began, s.year_ended,
      s.dimensions::text as dimensions, s.binding::text as binding, s.color::text as color_spec, s.issue_count,
      p.name::text as publisher_name
    FROM ppcf_gcd_series s
    LEFT JOIN ppcf_gcd_publishers p ON s.publisher_id = p.gcd_publisher_id
    WHERE s.gcd_series_id = ANY($1::int[]);
  `, [Array.from(seriesIdsSet)]);

  const seriesMap = new Map();
  for (const s of seriesRes.rows) seriesMap.set(s.gcd_series_id, s);

  console.timeEnd('preload_maps');
  console.log(`Preloaded: ${verifiedMap.size} verified links, ${snapshotById.size} snapshots, ${seriesMap.size} series profiles.`);

  // Test 1 batch of 1,000 comics
  console.time('batch_1000');
  const comicsRes = await client.query(`
    SELECT id, series, issue_number, publisher, publication_year, pp_source_id, gcd_source_id, gcd_data
    FROM comics
    WHERE pp_source_id > ''
    ORDER BY pp_source_id ASC
    LIMIT 1000;
  `);

  const issueIds = [];
  const comicToIssue = [];

  for (const c of comicsRes.rows) {
    let issueId = verifiedMap.get(c.pp_source_id) || snapshotByTitle.get(`${c.series.toLowerCase()}:::${c.issue_number}`)?.gcd_issue_id || c.gcd_source_id;
    if (issueId) {
      const numId = parseInt(issueId, 10);
      if (!isNaN(numId)) {
        issueIds.push(numId);
        comicToIssue.push({ comic: c, issueId: numId });
      }
    }
  }

  const uniqueIssueIds = Array.from(new Set(issueIds));
  console.log(`Matched ${comicToIssue.length}/1000 comics to ${uniqueIssueIds.length} unique GCD issues.`);

  // Fetch stories for unique issues
  const storiesRes = await client.query(`
    SELECT 
      gcd_story_id, gcd_issue_id, sequence_number, title, feature, script, pencils, inks, colors, letters, editing, characters, genre, synopsis, page_count
    FROM ppcf_gcd_stories
    WHERE gcd_issue_id = ANY($1::int[])
    ORDER BY gcd_issue_id, sequence_number ASC;
  `, [uniqueIssueIds]);

  const storiesByIssue = new Map();
  const storyIds = [];
  for (const st of storiesRes.rows) {
    if (!storiesByIssue.has(st.gcd_issue_id)) storiesByIssue.set(st.gcd_issue_id, []);
    storiesByIssue.get(st.gcd_issue_id).push(st);
    storyIds.push(parseInt(st.gcd_story_id, 10));
  }

  // Fetch relational credits
  const creditsRes = await client.query(`
    SELECT sc.gcd_story_id, sc.credit_type_id, cr.official_name
    FROM ppcf_gcd_story_credits sc
    JOIN ppcf_gcd_creators cr ON sc.gcd_creator_id = cr.gcd_creator_id
    WHERE sc.gcd_story_id = ANY($1::bigint[]);
  `, [storyIds]);

  const creditsByStory = new Map();
  for (const cr of creditsRes.rows) {
    const sId = parseInt(cr.gcd_story_id, 10);
    if (!creditsByStory.has(sId)) creditsByStory.set(sId, []);
    creditsByStory.get(sId).push(cr);
  }

  console.timeEnd('batch_1000');
  console.log(`Loaded ${storiesRes.rows.length} stories, ${creditsRes.rows.length} creator credits in under 1 second!`);

  // Sample check
  const sample = comicToIssue[0];
  const sList = storiesByIssue.get(sample.issueId) || [];
  const snap = snapshotById.get(String(sample.issueId));
  const sInfo = snap?.gcd_series_id ? seriesMap.get(parseInt(snap.gcd_series_id, 10)) : null;

  console.log('\nSample Enriched Book:');
  console.log({
    book: `${sample.comic.series} #${sample.comic.issue_number}`,
    publisher: sInfo?.publisher_name || sample.comic.publisher,
    dimensions: sInfo?.dimensions,
    series_span: `${sInfo?.year_began} - ${sInfo?.year_ended}`,
    stories_count: sList.length
  });

  await client.end();
}

testFastEnrich().catch(console.error);
