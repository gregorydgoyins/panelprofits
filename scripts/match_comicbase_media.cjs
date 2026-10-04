const fs = require('fs');
const { Client } = require('pg');

let dbUrl = '';
const env = fs.readFileSync('.env.local', 'utf8');
for (const line of env.split('\n')) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.substring('DATABASE_URL='.length).trim().replace(/^["']/, '').replace(/["']$/, '');
  }
}

const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function run() {
  await client.connect();
  const media = JSON.parse(fs.readFileSync('/tmp/comicbase_media_items.json'));
  console.log('Querying issue candidates from database...');
  
  const matches = [];

  for (const m of media) {
    const parts = m.path.split('/');
    const publisherFolder = parts.length > 2 ? parts[1] : parts[0];
    const seriesFolder = parts.length > 3 ? parts[3] : (parts.length > 2 ? parts[2] : parts[1]);
    const issueFile = parts[parts.length - 1].replace('.m4v', '');
    
    let cleanSeries = seriesFolder.replace(/ \(.*\)/, '').replace(/, The$/, '').trim();
    if (cleanSeries.startsWith('The ')) cleanSeries = cleanSeries.substring(4);
    
    let searchSeries = cleanSeries;
    if (cleanSeries.includes('Batman- The Dark Knight')) searchSeries = 'Batman: The Dark Knight Returns';
    else if (cleanSeries === 'Amazing Spider-Man') searchSeries = 'Amazing Spider-Man';
    else if (cleanSeries === 'Daredevil') searchSeries = 'Daredevil';
    else if (cleanSeries === 'Showcase') searchSeries = 'Showcase';
    else if (cleanSeries === 'Hellblazer') searchSeries = 'Hellblazer';
    else if (cleanSeries === 'Preacher') searchSeries = 'Preacher';
    else if (cleanSeries === '300') searchSeries = '300';
    else if (cleanSeries === 'Sin City') searchSeries = 'Sin City';
    else if (cleanSeries === 'Kingdom Come') searchSeries = 'Kingdom Come';
    else if (cleanSeries === 'Savage Dragon') searchSeries = 'Savage Dragon';
    else if (cleanSeries === 'Bone') searchSeries = 'Bone';
    else if (cleanSeries === 'Zot!') searchSeries = 'Zot';

    const query = `
      SELECT id, series, issue_number, publisher, publication_year
      FROM comics
      WHERE series ILIKE $1 AND (issue_number = $2 OR issue_number = $3)
      LIMIT 1
    `;
    
    try {
      const res = await client.query(query, [
        '%' + searchSeries + '%',
        issueFile,
        issueFile.replace(/^0+/, '')
      ]);
      
      if (res.rows.length > 0) {
        const match = res.rows[0];
        matches.push({
          comicId: match.id,
          series: match.series,
          issueNumber: match.issue_number,
          publisher: match.publisher,
          mediaPath: m.path,
          duration: m.duration,
          width: m.width,
          height: m.height,
          titleMeta: m.title_meta,
          commentMeta: m.comment_meta
        });
        console.log('MATCH: ' + m.path + ' => ' + match.series + ' #' + match.issue_number + ' (ID: ' + match.id + ')');
      } else {
        console.log('NO MATCH: ' + m.path + ' (series: ' + searchSeries + ' #' + issueFile + ')');
      }
    } catch (err) {
      console.error('Query error for ' + m.path + ':', err.message);
    }
  }
  
  fs.writeFileSync('lib/video/comicbase-media-matches.json', JSON.stringify(matches, null, 2));
  console.log('\nTotal matched: ' + matches.length + ' / ' + media.length);
  await client.end();
}

run().catch(console.error);
