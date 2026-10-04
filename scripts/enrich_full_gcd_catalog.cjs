const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

let dbUrl = '';
const env = fs.readFileSync('.env.local', 'utf8');
for (const line of env.split('\n')) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
  }
}

const PROGRESS_FILE = path.join(__dirname, '.gcd_enrich_progress.json');
const COMPLETION_FILE = path.join(__dirname, '../data/gcd_enrichment_completed.json');

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

async function runFullCatalogEnrichment() {
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query('SET statement_timeout = 0;');

  console.log('================================================================');
  console.log('       PANEL PROFITS: 115K FULL GCD METADATA ENRICHMENT        ');
  console.log('================================================================');

  let lastId = '';
  let totalProcessed = 0;
  let totalEnriched = 0;
  let publishersFilled = 0;

  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      const saved = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
      lastId = saved.lastId || '';
      totalProcessed = saved.totalProcessed || 0;
      totalEnriched = saved.totalEnriched || 0;
      publishersFilled = saved.publishersFilled || 0;
      console.log(`[Resuming] Resuming from checkpoint: processed ${totalProcessed}/115712, enriched ${totalEnriched}, lastId: '${lastId}'\n`);
    } catch (e) {
      console.warn('Could not parse progress file, starting fresh:', e.message);
    }
  }

  console.log('[Step 1/3] Preloading GCD identity links, snapshots, and series profiles...');
  console.time('preload_time');

  const linksRes = await client.query('SELECT pp_source_product_id, gcd_issue_id FROM pp_verified_gcd_identity_links;');
  const verifiedMap = new Map();
  for (const l of linksRes.rows) verifiedMap.set(l.pp_source_product_id, String(l.gcd_issue_id));

  const snapsRes = await client.query('SELECT gcd_issue_id, gcd_series_id, series_name, issue_number, publication_date, barcode, isbn, issue_title FROM pp_gcd_issue_candidate_snapshots;');
  const snapshotById = new Map();
  const snapshotByTitle = new Map();
  const seriesIdsSet = new Set();

  for (const s of snapsRes.rows) {
    const issueIdStr = String(s.gcd_issue_id);
    snapshotById.set(issueIdStr, s);
    const key = `${s.series_name.toLowerCase()}:::${s.issue_number}`;
    if (!snapshotByTitle.has(key)) snapshotByTitle.set(key, s);
    if (s.gcd_series_id) {
      seriesIdsSet.add(parseInt(s.gcd_series_id, 10));
    }
  }

  const seriesRes = await client.query(`
    SELECT 
      s.gcd_series_id, s.name::text as series_name, s.year_began, s.year_ended,
      s.dimensions::text as dimensions, s.binding::text as binding, s.color::text as color_spec, s.issue_count,
      p.name::text as publisher_name
    FROM ppcf_gcd_series s
    LEFT JOIN ppcf_gcd_publishers p ON s.publisher_id = p.gcd_publisher_id
    WHERE s.gcd_series_id = ANY($1::int[]);
  `, [Array.from(seriesIdsSet).filter(id => !isNaN(id))]);

  const seriesMap = new Map();
  for (const s of seriesRes.rows) seriesMap.set(String(s.gcd_series_id), s);

  console.timeEnd('preload_time');
  console.log(`[Cache Ready] ${verifiedMap.size} Verified Links | ${snapshotById.size} Snapshots | ${seriesMap.size} Series Profiles.\n`);

  console.log('[Step 2/3] Processing 115,712 catalog books in keyset batches of 1,000...');
  console.time('catalog_enrichment_total');

  const batchSize = 1000;

  while (true) {
    const t0 = Date.now();
    const comicsRes = await client.query(`
      SELECT id, series, issue_number, publisher, publication_year, pp_source_id, gcd_source_id, gcd_data
      FROM comics
      WHERE pp_source_id > $1
      ORDER BY pp_source_id ASC
      LIMIT $2;
    `, [lastId, batchSize]);

    if (comicsRes.rows.length === 0) break;
    lastId = comicsRes.rows[comicsRes.rows.length - 1].pp_source_id;
    const batchComics = comicsRes.rows;

    const issueIds = [];
    const comicToIssue = [];

    for (const c of batchComics) {
      let issueId = verifiedMap.get(c.pp_source_id) || 
                    snapshotByTitle.get(`${c.series.toLowerCase()}:::${c.issue_number}`)?.gcd_issue_id || 
                    c.gcd_source_id;
      if (issueId) {
        const numId = parseInt(issueId, 10);
        if (!isNaN(numId)) {
          issueIds.push(numId);
          comicToIssue.push({ comic: c, issueId: numId });
        }
      }
    }

    const uniqueIssueIds = Array.from(new Set(issueIds));
    let storiesByIssue = new Map();
    let creditsByStory = new Map();

    if (uniqueIssueIds.length > 0) {
      const storiesRes = await client.query(`
        SELECT 
          gcd_story_id, gcd_issue_id, sequence_number, title, feature, script, pencils, inks, colors, letters, editing, characters, genre, synopsis, page_count
        FROM ppcf_gcd_stories
        WHERE gcd_issue_id = ANY($1::int[])
        ORDER BY gcd_issue_id, sequence_number ASC;
      `, [uniqueIssueIds]);

      const storyIds = [];
      for (const st of storiesRes.rows) {
        const k = String(st.gcd_issue_id);
        if (!storiesByIssue.has(k)) storiesByIssue.set(k, []);
        storiesByIssue.get(k).push(st);
        storyIds.push(parseInt(st.gcd_story_id, 10));
      }

      if (storyIds.length > 0) {
        const creditsRes = await client.query(`
          SELECT sc.gcd_story_id, sc.credit_type_id, cr.official_name
          FROM ppcf_gcd_story_credits sc
          JOIN ppcf_gcd_creators cr ON sc.gcd_creator_id = cr.gcd_creator_id
          WHERE sc.gcd_story_id = ANY($1::bigint[]);
        `, [storyIds]);

        for (const cr of creditsRes.rows) {
          const sId = String(cr.gcd_story_id);
          if (!creditsByStory.has(sId)) creditsByStory.set(sId, []);
          creditsByStory.get(sId).push(cr);
        }
      }
    }

    const updates = [];
    for (const { comic, issueId } of comicToIssue) {
      const stories = storiesByIssue.get(String(issueId)) || [];
      const snap = snapshotById.get(String(issueId)) || {};
      const sInfo = snap.gcd_series_id ? seriesMap.get(String(snap.gcd_series_id)) : null;

      let writer = '';
      let penciler = '';
      let inker = '';
      let colorist = '';
      let letterer = '';
      let editor = '';

      for (const st of stories) {
        const sId = String(st.gcd_story_id);
        const creds = creditsByStory.get(sId) || [];
        for (const c of creds) {
          const cType = String(c.credit_type_id);
          if (cType === '1' && !writer) writer = c.official_name;
          if (cType === '2' && !penciler) penciler = c.official_name;
          if (cType === '3' && !inker) inker = c.official_name;
          if (cType === '4' && !colorist) colorist = c.official_name;
          if (cType === '5' && !letterer) letterer = c.official_name;
          if (cType === '6' && !editor) editor = c.official_name;
        }

        if (!writer && st.script && st.script !== '?' && st.script.trim()) writer = st.script.trim();
        if (!penciler && st.pencils && st.pencils !== '?' && st.pencils.trim()) penciler = st.pencils.trim();
        if (!inker && st.inks && st.inks !== '?' && st.inks.trim()) inker = st.inks.trim();
        if (!colorist && st.colors && st.colors !== '?' && st.colors.trim()) colorist = st.colors.trim();
        if (!letterer && st.letters && st.letters !== '?' && st.letters.trim()) letterer = st.letters.trim();
        if (!editor && st.editing && st.editing !== '?' && st.editing.trim()) editor = st.editing.trim();
      }

      const leadStory = stories.find(s => s.synopsis && s.synopsis.trim()) || 
                         stories.find(s => s.title && s.title.trim()) ||
                         stories.find(s => s.characters && s.characters.trim()) || 
                         stories[0] || {};
      const allChars = stories.map(s => s.characters).filter(Boolean).join('; ');
      const keyBadges = extractKeyBadges(allChars, leadStory.synopsis);

      const existingData = comic.gcd_data || {};
      const gcdPublisher = sInfo?.publisher_name || existingData['GCD - gcd_publisher'] || '';
      const newPublisher = (!comic.publisher || comic.publisher.trim() === '') && gcdPublisher ? gcdPublisher : comic.publisher;
      if (!comic.publisher && gcdPublisher) publishersFilled++;

      const enrichedPayload = {
        ...existingData,
        gcd_issue_id: String(issueId),
        gcd_series_id: snap.gcd_series_id || existingData.gcd_series_id || '',
        series_name: sInfo?.series_name || snap.series_name || comic.series,
        issue_number: comic.issue_number,
        publisher: newPublisher,
        publication_date: snap.publication_date || existingData.publication_date || '',
        barcode: snap.barcode || existingData.barcode || '',
        cover_price: existingData['GCD - gcd_issue.price'] || existingData.cover_price || '',
        page_count: leadStory.page_count || existingData['GCD - gcd_issue.page_count'] || '',
        dimensions: sInfo?.dimensions || existingData.dimensions || '',
        binding: sInfo?.binding || existingData.binding || '',
        color: sInfo?.color_spec || existingData.color || '',
        series_year_began: sInfo?.year_began || existingData.series_year_began || null,
        series_year_ended: sInfo?.year_ended || existingData.series_year_ended || null,
        series_issue_count: sInfo?.issue_count || existingData.series_issue_count || null,
        writer: writer || existingData.writer || '',
        penciler: penciler || existingData.penciler || '',
        inker: inker || existingData.inker || '',
        colorist: colorist || existingData.colorist || '',
        letterer: letterer || existingData.letterer || '',
        editor: editor || existingData.editor || '',
        story_title: leadStory.title || snap.issue_title || existingData.story_title || '',
        feature: leadStory.feature || existingData.feature || '',
        genre: leadStory.genre || existingData.genre || '',
        synopsis: leadStory.synopsis || existingData.synopsis || '',
        characters: allChars || existingData.characters || '',
        key_badges: keyBadges.length > 0 ? keyBadges : (existingData.key_badges || []),
        total_stories: stories.length
      };

      updates.push({
        id: comic.id,
        gcd_source_id: String(issueId),
        publisher: newPublisher,
        gcd_data: JSON.stringify(enrichedPayload)
      });
    }

    if (updates.length > 0) {
      const CHUNK_SIZE = 200;
      for (let i = 0; i < updates.length; i += CHUNK_SIZE) {
        const slice = updates.slice(i, i + CHUNK_SIZE);
        const ids = slice.map(u => u.id);
        const gcdIds = slice.map(u => u.gcd_source_id);
        const pubs = slice.map(u => u.publisher);
        const gcdDatas = slice.map(u => u.gcd_data);

        let retries = 3;
        while (retries > 0) {
          try {
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
            break;
          } catch (err) {
            retries--;
            console.error(`[Retry] Update chunk failed (${err.message}). Retries left: ${retries}`);
            if (retries === 0) throw err;
            await new Promise(r => setTimeout(r, 2000));
          }
        }
      }
      totalEnriched += updates.length;
    }

    totalProcessed += batchComics.length;

    // Save checkpoint
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify({
      lastId,
      totalProcessed,
      totalEnriched,
      publishersFilled,
      updatedAt: new Date().toISOString()
    }, null, 2));

    const dur = ((Date.now() - t0) / 1000).toFixed(2);
    if (totalProcessed % 5000 === 0 || batchComics.length < batchSize) {
      const pct = ((totalProcessed / 115712) * 100).toFixed(1);
      console.log(`[Batch] Progress: ${totalProcessed}/115712 (${pct}%) | Enriched: ${totalEnriched} | Pubs Filled: ${publishersFilled} (${dur}s)`);
    }
  }

  console.timeEnd('catalog_enrichment_total');
  console.log('\n================================================================');
  console.log('              GCD ENRICHMENT COMPLETE!                         ');
  console.log('================================================================');
  console.log(`Total Comics Processed: ${totalProcessed}`);
  console.log(`Total Comics Enriched with Full GCD Metadata: ${totalEnriched}`);
  console.log(`Total Blank Publishers Backfilled: ${publishersFilled}`);
  console.log('================================================================\n');

  // Write final completion artifact
  fs.writeFileSync(COMPLETION_FILE, JSON.stringify({
    completedAt: new Date().toISOString(),
    totalCatalog: 115712,
    totalProcessed,
    totalEnriched,
    publishersFilled,
    status: 'COMPLETE'
  }, null, 2));

  // Clean up progress file
  if (fs.existsSync(PROGRESS_FILE)) fs.unlinkSync(PROGRESS_FILE);

  await client.end();
}

runFullCatalogEnrichment().catch(console.error);
