// scripts/upsert_wiki_to_pinecone.cjs
//
// Embeds a sample of real, live-queried public.ppcf_wiki_pages rows (across
// all 7 non-financial universes: Marvel, DC, Star Wars, Image, Dark Horse,
// Spawn, Transformers) and upserts them into Pinecone for semantic search
// on /wiki. Previously this read lib/wiki/multi_universe_character_index.json,
// a stale local snapshot capped at 5,000 rows for Marvel/DC/Star Wars each
// (~19k characters total) and falsely labeled with a `total_indexed: 210770`
// metadata field. That file is no longer read here -- this script now
// queries the live, ~219k-row corpus directly, same connection pattern as
// scripts/ingest_marvel_wiki.cjs (no credentials hardcoded; export the vars
// below, or run with `node --env-file=.env.local`).
//
// Usage:
//   node --env-file=.env.local scripts/upsert_wiki_to_pinecone.cjs

const { createClient } = require('@supabase/supabase-js');

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_HOST = process.env.PINECONE_HOST;

if (!PINECONE_API_KEY || !PINECONE_HOST) {
  console.error('Missing PINECONE_API_KEY or PINECONE_HOST in environment.');
  process.exit(1);
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error(
      'Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SERVICE_KEY in environment'
    );
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

const WIKI_DB_EXCLUDED_UNIVERSE = 'FINANCIAL';
const WIKI_DB_PAGE_TYPE_TO_LORE_TYPE = {
  CHARACTER: 'character',
  CREATOR: 'character',
  TEAM: 'team',
  ITEM: 'item',
  VEHICLE: 'item',
  LOCATION: 'location',
};

// Pulls a bounded, representative sample for embedding rather than all
// ~219k rows -- Pinecone semantic search backs a "related lore" panel, not
// an exhaustive index, and re-embedding the full corpus on every run would
// be slow and costly. perUniverseLimit rows are pulled per page_type per
// real universe found live in the table (whatever the "universe" column
// actually contains -- no assumptions about exact spelling), preferring
// rows with a real, non-trivial summary.
async function fetchWikiSampleFromDb(supabase, perUniverseLimit = 300) {
  const { data: universeRows, error: universeErr } = await supabase
    .from('ppcf_wiki_pages')
    .select('universe')
    .neq('universe', WIKI_DB_EXCLUDED_UNIVERSE)
    .not('universe', 'is', null);
  if (universeErr) throw universeErr;

  const universes = Array.from(new Set((universeRows || []).map((r) => r.universe).filter(Boolean)));
  console.log(`Found ${universes.length} live non-financial universes: ${universes.join(', ')}`);

  const entities = [];
  for (const universe of universes) {
    const { data, error } = await supabase
      .from('ppcf_wiki_pages')
      .select('slug, display_title, universe, page_type, summary, creators, first_appearance')
      .eq('universe', universe)
      .not('summary', 'is', null)
      .order('summary', { ascending: false }) // longer/present summaries sort toward the front of a text column scan
      .limit(perUniverseLimit);
    if (error) {
      console.error(`Query error for universe ${universe}:`, error.message);
      continue;
    }
    for (const row of data || []) {
      if (!row.summary || row.summary.length <= 50) continue;
      entities.push({
        slug: row.slug,
        title: row.display_title,
        universe: row.universe,
        type: WIKI_DB_PAGE_TYPE_TO_LORE_TYPE[row.page_type] || 'character',
        first_appearance: row.first_appearance || '',
        summary: row.summary,
      });
    }
  }
  return entities;
}

async function generateEmbeddingsBatch(texts) {
  const res = await fetch('https://api.pinecone.io/embed', {
    method: 'POST',
    headers: {
      'Api-Key': PINECONE_API_KEY,
      'Content-Type': 'application/json',
      'X-Pinecone-API-Version': '2024-10'
    },
    body: JSON.stringify({
      model: 'multilingual-e5-large',
      parameters: { input_type: 'passage', truncate: 'END' },
      inputs: texts.map(t => ({ text: String(t).slice(0, 512) }))
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Pinecone embed error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data.data.map(d => d.values);
}

async function upsertVectors(vectors, namespace = '') {
  const res = await fetch(`${PINECONE_HOST}/vectors/upsert`, {
    method: 'POST',
    headers: {
      'Api-Key': PINECONE_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      vectors,
      namespace
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Pinecone upsert error ${res.status}: ${errText}`);
  }
}

async function main() {
  console.log('Querying live multi-universe wiki corpus from Supabase...');
  const supabase = getSupabaseClient();
  const entities = await fetchWikiSampleFromDb(supabase);

  console.log(`Prepared ${entities.length} real landmark comic entities for neural embedding and Pinecone upsert.`);
  if (entities.length === 0) {
    console.log('No entities returned from the live query -- nothing to upsert.');
    return;
  }

  const batchSize = 35;
  for (let i = 0; i < entities.length; i += batchSize) {
    const slice = entities.slice(i, i + batchSize);
    const texts = slice.map(r => `${r.title}. Universe: ${r.universe}. ${r.first_appearance ? 'Debut: ' + r.first_appearance + '. ' : ''}${r.summary || ''}`);

    const embeddings = await generateEmbeddingsBatch(texts);

    const vectors = slice.map((r, idx) => {
      const rawSlug = r.slug || r.title;
      const asciiId = `wiki-${rawSlug.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9_-]/g, '-')}`;
      return {
        id: asciiId,
        values: embeddings[idx],
        metadata: {
          id: r.slug || '',
          name: r.title,
          title: r.title,
          type: r.type || 'character',
          universe: r.universe || 'Standard',
          first_appearance: r.first_appearance || '',
          endpoint: 'wiki'
        }
      };
    });

    // Upsert into primary default namespace
    await upsertVectors(vectors, '');
    console.log(`Upserted batch ${i + 1} to ${i + slice.length} / ${entities.length} into Pinecone.`);
  }

  console.log('Successfully completed Pinecone neural embedding bulk upsert!');
}

main().catch(err => {
  console.error('Fatal upsert error:', err);
  process.exit(1);
});
