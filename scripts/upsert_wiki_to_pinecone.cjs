const fs = require('fs');
const path = require('path');

const PINECONE_API_KEY = process.env.PINECONE_API_KEY || 'pcsk_4jYhX1_4Z5e8E88Zt5mXq2K947rC9QdZ85a9k7T28';
const PINECONE_HOST = process.env.PINECONE_HOST || 'https://core-erkd3f9.svc.apw5-4e34-81fa.pinecone.io';

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
  console.log('Loading multi-universe character index...');
  const jsonPath = path.join(__dirname, '../lib/wiki/multi_universe_character_index.json');
  const indexData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  // Collect premier entities across all universes
  const entities = [];
  for (const [uni, list] of Object.entries(indexData.universes || {})) {
    if (Array.isArray(list)) {
      // Pick top entities with rich summaries
      const topEntries = list
        .filter(e => e.summary && e.summary.length > 50)
        .slice(0, 80);
      entities.push(...topEntries);
    }
  }

  // Also include landmark teams and items
  if (Array.isArray(indexData.teams)) {
    entities.push(...indexData.teams.slice(0, 50));
  }
  if (Array.isArray(indexData.items)) {
    entities.push(...indexData.items.slice(0, 50));
  }

  console.log(`Prepared ${entities.length} landmark comic entities for neural embedding and Pinecone upsert.`);

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
