const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const sqlite3 = require('better-sqlite3');

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => {
      const idx = l.indexOf('=');
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^['\"]|['\"]$/g, '')];
    })
);

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function parseCoverUrl(url) {
  if (!url || !url.includes('/Pictures/')) return { type: 'non-comicbase', pub: 'Unknown', series: '', issue: '' };
  try {
    const rawPath = url.split('/Pictures/')[1];
    const decoded = decodeURIComponent(rawPath);
    const parts = decoded.split('/');
    const pub = parts[1] || 'Unknown';
    let series = '';
    let issue = parts[parts.length - 1] || '';
    if (parts.length === 4) {
      series = parts[2];
    } else if (parts.length === 5) {
      series = parts[3];
    } else {
      series = parts.slice(2, parts.length - 1).join('/');
    }
    return { type: 'comicbase', pub, series, issue };
  } catch (e) {
    return { type: 'error', pub: 'Error', series: '', issue: '' };
  }
}

async function main() {
  console.log('Connecting to local pages.sqlite...');
  const db = new sqlite3('../fandom_issue_pages/pages.sqlite');
  const unmatchedRows = db.prepare('SELECT pp_id, series, issue, year, title FROM pp').all();
  console.log(`Loaded ${unmatchedRows.length} unmatched comics from pages.sqlite`);

  const unmatchedSet = new Map();
  for (const r of unmatchedRows) {
    unmatchedSet.set(String(r.pp_id), r);
  }

  // Fetch pp_id and pp_cover_url in batches from Supabase
  // We can query in chunks or page through
  const pubCounts = {};
  const sampleByPub = {};
  let totalProcessed = 0;
  let totalMatchedCovers = 0;

  // Let's create an output sqlite table for easy querying: unmatched_covers
  db.exec(`
    CREATE TABLE IF NOT EXISTS unmatched_cover_meta (
      pp_id TEXT PRIMARY KEY,
      publisher TEXT,
      cover_series TEXT,
      cover_issue TEXT,
      pp_cover_url TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_unmatched_pub ON unmatched_cover_meta(publisher);
  `);

  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO unmatched_cover_meta (pp_id, publisher, cover_series, cover_issue, pp_cover_url)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((rows) => {
    for (const r of rows) {
      insertStmt.run(r.pp_id, r.pub, r.series, r.issue, r.url);
    }
  });

  // Query in chunks of 5000 IDs
  const allIds = Array.from(unmatchedSet.keys());
  const CHUNK_SIZE = 1000;
  console.log(`Fetching cover URLs for ${allIds.length} unmatched books in chunks of ${CHUNK_SIZE}...`);

  for (let i = 0; i < allIds.length; i += CHUNK_SIZE) {
    const chunkIds = allIds.slice(i, i + CHUNK_SIZE);
    const { data, error } = await sb.from('pp_series_rows_full')
      .select('pp_id, pp_cover_url')
      .in('pp_id', chunkIds);

    if (error) {
      console.error(`Error fetching chunk at ${i}:`, error.message);
      continue;
    }

    const rowsToInsert = [];
    for (const item of data) {
      totalProcessed++;
      if (item.pp_cover_url) {
        totalMatchedCovers++;
        const parsed = parseCoverUrl(item.pp_cover_url);
        pubCounts[parsed.pub] = (pubCounts[parsed.pub] || 0) + 1;
        if (!sampleByPub[parsed.pub]) {
          sampleByPub[parsed.pub] = [];
        }
        if (sampleByPub[parsed.pub].length < 3) {
          sampleByPub[parsed.pub].push({
            pp_id: item.pp_id,
            series: parsed.series,
            issue: parsed.issue,
            url: item.pp_cover_url
          });
        }
        rowsToInsert.push({
          pp_id: String(item.pp_id),
          pub: parsed.pub,
          series: parsed.series,
          issue: parsed.issue,
          url: item.pp_cover_url
        });
      }
    }

    insertMany(rowsToInsert);

    if (i % 20000 === 0 || i + CHUNK_SIZE >= allIds.length) {
      console.log(`Progress: ${i + chunkIds.length} / ${allIds.length} (${Math.round((i / allIds.length) * 100)}%)`);
    }
  }

  console.log('\n--- TOP 30 PUBLISHERS IN UNMATCHED COVERS ---');
  const sortedPubs = Object.entries(pubCounts).sort((a, b) => b[1] - a[1]);
  for (const [pub, count] of sortedPubs.slice(0, 30)) {
    console.log(`${pub.padEnd(25)}: ${count.toLocaleString()} comics`);
  }

  fs.writeFileSync('../fandom_issue_pages/unmatched_publisher_breakdown.json', JSON.stringify({
    totalUnmatched: allIds.length,
    withCovers: totalMatchedCovers,
    publishers: sortedPubs,
    samples: sampleByPub
  }, null, 2));

  console.log('\nSaved results to fandom_issue_pages/unmatched_publisher_breakdown.json and pages.sqlite:unmatched_cover_meta');
}

main().catch(console.error);
