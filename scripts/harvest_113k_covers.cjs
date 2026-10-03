/**
 * harvest_113k_covers.cjs
 *
 * Dedicated Autonomous Cover Harvester for the 113,586 Panel Profits Catalog.
 * Scans PostgreSQL using fast indexed keyset pagination on pp_source_id,
 * detects missing or forbidden (files1.comics.org 403) covers,
 * resolves authentic covers via DC, Marvel, Image, and Star Wars MediaWiki APIs,
 * and updates comics.cover_url directly in PostgreSQL.
 */

const fs = require('fs');
const { Client } = require('pg');

let dbUrl = '';
const env = fs.readFileSync('.env.local', 'utf8');
for (const line of env.split('\n')) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
  }
}

if (!dbUrl) {
  console.error('[Harvester] No DATABASE_URL found in .env.local');
  process.exit(1);
}

const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function resolveUniversalCover(series, issueNumber, publisher) {
  const p = (publisher || '').toLowerCase();
  const s = (series || '').toLowerCase();
  let wikis = ['dc', 'marvel', 'imagecomics', 'starwars'];

  if (p.includes('marvel') || s.includes('spider') || s.includes('x-men') || s.includes('hulk') || s.includes('avengers') || s.includes('iron man') || s.includes('thor') || s.includes('daredevil')) {
    wikis = ['marvel', 'dc', 'imagecomics'];
  } else if (p.includes('dc') || s.includes('batman') || s.includes('superman') || s.includes('krypton') || s.includes('flash') || s.includes('green lantern') || s.includes('justice')) {
    wikis = ['dc', 'marvel', 'imagecomics'];
  } else if (p.includes('image') || s.includes('spawn') || s.includes('invincible') || s.includes('walking dead') || s.includes('saga')) {
    wikis = ['imagecomics', 'marvel', 'dc'];
  } else if (s.includes('star wars')) {
    wikis = ['starwars', 'marvel', 'dc'];
  }

  const cleanSeries = series.replace(/\s*\([^)]*\)/g, '').trim();
  const cleanIssue = String(issueNumber || '1').trim();
  const queries = [
    `${cleanSeries} Vol 1 ${cleanIssue}`,
    `${cleanSeries} #${cleanIssue}`,
    `${cleanSeries} ${cleanIssue}`,
    cleanSeries,
  ];

  for (const wiki of wikis) {
    for (const q of queries) {
      try {
        const searchUrl = `https://${wiki}.fandom.com/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=3&format=json`;
        const r = await fetch(searchUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
          signal: AbortSignal.timeout(3500),
        });
        if (!r.ok) continue;
        const data = await r.json();
        if (!data[1] || data[1].length === 0) continue;

        const page = data[1][0];

        // 1. Try pageimages (fastest thumbnail)
        const pImgUrl = `https://${wiki}.fandom.com/api.php?action=query&titles=${encodeURIComponent(page)}&prop=pageimages&pithumbsize=400&format=json`;
        const r2 = await fetch(pImgUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
          signal: AbortSignal.timeout(3500),
        });
        if (r2.ok) {
          const d2 = await r2.json();
          const pages = d2?.query?.pages || {};
          for (const k in pages) {
            const src = pages[k]?.thumbnail?.source;
            if (src && src.startsWith('http') && !src.includes('placeholder')) {
              return src;
            }
          }
        }

        // 2. Try prop=images -> imageinfo
        const imgUrl = `https://${wiki}.fandom.com/api.php?action=query&titles=${encodeURIComponent(page)}&prop=images&format=json`;
        const r3 = await fetch(imgUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
          signal: AbortSignal.timeout(3500),
        });
        if (r3.ok) {
          const d3 = await r3.json();
          const pages = d3?.query?.pages || {};
          for (const k in pages) {
            const imgs = pages[k]?.images || [];
            const coverImg = imgs.find(img => img.title.toLowerCase().includes('.jpg') && !img.title.toLowerCase().includes('logo')) || imgs[0];
            if (coverImg) {
              const infoUrl = `https://${wiki}.fandom.com/api.php?action=query&titles=${encodeURIComponent(coverImg.title)}&prop=imageinfo&iiprop=url&format=json`;
              const r4 = await fetch(infoUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
                signal: AbortSignal.timeout(3500),
              });
              if (r4.ok) {
                const d4 = await r4.json();
                const pgs = d4?.query?.pages || {};
                for (const pk in pgs) {
                  const u = pgs[pk]?.imageinfo?.[0]?.url;
                  if (u && u.startsWith('http')) {
                    return u;
                  }
                }
              }
            }
          }
        }
      } catch {
        // Continue to next query/wiki
      }
    }
  }
  return null;
}

async function run() {
  await client.connect();
  console.log('[Harvester] Connected to PostgreSQL. Starting keyset sweep across 115,712 Panel Profits catalog...');

  let lastId = '';
  let totalScanned = 0;
  let totalResolved = 0;
  let totalPending = 0;

  const CONCURRENCY = 4;

  while (true) {
    const res = await client.query(
      `SELECT id, pp_source_id, series, issue_number, publisher, publication_year, cover_url 
       FROM comics 
       WHERE pp_source_id > $1 
       ORDER BY pp_source_id ASC 
       LIMIT 1000`,
      [lastId]
    );

    if (res.rows.length === 0) {
      console.log('[Harvester] Completed full catalog pass!');
      break;
    }

    totalScanned += res.rows.length;
    lastId = res.rows[res.rows.length - 1].pp_source_id;

    // Filter for books needing covers
    const needingCovers = res.rows.filter(r => {
      const c = r.cover_url ? r.cover_url.trim() : '';
      return !c || c.includes('files1.comics.org') || c.includes('526.jpg');
    });

    if (needingCovers.length > 0) {
      console.log(`[Harvester] Scanned ${totalScanned} | Found ${needingCovers.length} books needing covers in current batch (Total resolved so far: ${totalResolved})...`);

      // Process in chunks of CONCURRENCY
      for (let i = 0; i < needingCovers.length; i += CONCURRENCY) {
        const chunk = needingCovers.slice(i, i + CONCURRENCY);
        await Promise.all(chunk.map(async (book) => {
          const cover = await resolveUniversalCover(book.series, book.issue_number, book.publisher);
          if (cover) {
            totalResolved++;
            await client.query(
              'UPDATE comics SET cover_url = $1, cover_verified_at = now() WHERE id = $2',
              [cover, book.id]
            );
            console.log(`  [+COVER #${totalResolved}] ${book.series} #${book.issue_number} -> ${cover.slice(0, 70)}...`);
          } else {
            totalPending++;
          }
        }));

        // 100ms throttle between chunks
        await new Promise(r => setTimeout(r, 100));
      }
    }
  }

  console.log(`[Harvester] Final result: Scanned ${totalScanned}, Resolved ${totalResolved}, Unresolved ${totalPending}`);
  await client.end();
}

run().catch((err) => {
  console.error('[Harvester] Fatal error:', err);
  process.exit(1);
});
