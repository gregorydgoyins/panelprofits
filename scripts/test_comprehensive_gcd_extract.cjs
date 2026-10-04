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
        if (name && name.length < 50 && !/^(a\s+group|various|un-named|several|guest)/i.test(name)) {
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
  return Array.from(new Set(badges)).slice(0, 5);
}

async function testFullPipeline() {
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log('Testing comprehensive GCD extraction for 10 books...');
  const res = await client.query(`
    SELECT 
      c.id, c.series, c.issue_number, c.publisher, c.pp_source_id,
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
    INNER JOIN pp_verified_gcd_identity_links l ON c.pp_source_id = l.pp_source_product_id
    LEFT JOIN pp_gcd_issue_candidate_snapshots snap ON snap.run_id = l.run_id AND snap.gcd_issue_id = l.gcd_issue_id
    LEFT JOIN ppcf_gcd_series s ON s.gcd_series_id = snap.gcd_series_id::integer
    LEFT JOIN ppcf_gcd_publishers p ON s.publisher_id = p.gcd_publisher_id
    LIMIT 10;
  `);

  const issueIds = res.rows.map(r => parseInt(r.gcd_issue_id, 10)).filter(id => !isNaN(id));
  const storiesRes = await client.query(`
    SELECT 
      gcd_issue_id, sequence_number, title, feature, script, pencils, inks, colors, letters, editing, characters, genre, synopsis
    FROM ppcf_gcd_stories
    WHERE gcd_issue_id = ANY($1)
    ORDER BY gcd_issue_id, sequence_number ASC;
  `, [issueIds]);

  const storiesByIssue = new Map();
  for (const st of storiesRes.rows) {
    if (!storiesByIssue.has(st.gcd_issue_id)) storiesByIssue.set(st.gcd_issue_id, []);
    storiesByIssue.get(st.gcd_issue_id).push(st);
  }

  for (const row of res.rows) {
    const issueIdNum = parseInt(row.gcd_issue_id, 10);
    const stories = storiesByIssue.get(issueIdNum) || [];
    const leadStory = stories.find(s => (s.script && s.script.trim() !== '' && s.script !== '?') || (s.pencils && s.pencils.trim() !== '' && s.pencils !== '?') || (s.characters && s.characters.trim() !== '')) || stories[0] || {};
    
    // Combine characters across all stories in the issue for key debuts
    const allChars = stories.map(s => s.characters).filter(Boolean).join('; ');
    const badges = extractKeyBadges(allChars, leadStory.synopsis);

    console.log({
      book: `${row.series} #${row.issue_number}`,
      publisher: row.gcd_publisher || row.publisher,
      writer: leadStory.script || '—',
      penciler: leadStory.pencils || '—',
      genre: leadStory.genre || '—',
      badges: badges,
      dimensions: row.dimensions || '—',
      binding: row.binding || '—',
      color: row.color_spec || '—',
      series_span: `${row.series_year_began || '?'} - ${row.series_year_ended || 'present'}`
    });
  }

  await client.end();
}

testFullPipeline().catch(console.error);
