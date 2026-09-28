/**
 * run_daily_wire_ingest.cjs
 *
 * Persistent multi-wire background ingestion engine:
 * Fetches up to 200 stories apiece daily from:
 * 1. NewsData.io
 * 2. Perigon News API
 * 3. TheNewsAPI
 * 4. AskNews
 * 5. NewsAPI.org
 *
 * Evaluates editorial quality, deduplicates by SHA256 story key,
 * and persists directly into Clean Supabase public.pp_news_stories
 * (accessible also via public.news_articles).
 */

const crypto = require('crypto');
const { Client: PgClient } = require('pg');

const DIRECT_URL =
  process.env.CLEAN_DATABASE_URL ||
  process.env.SUPABASE_DIRECT_URL ||
  'postgresql://postgres:rdeswaQ629gdg@db.vbcmjmakluyjnsmisoth.supabase.co:5432/postgres';

const NEWSDATA_API_KEY = process.env.NEWSDATA_API_KEY || 'pub_4a6743707bc04faa856a4041e096d30d';
const PERIGON_API_KEY = process.env.PERIGON_API_KEY || '109aa118-efaa-4f44-a16e-452ffff5e79b';
const THENEWSAPI_API_KEY = process.env.THENEWSAPI_API_KEY || 'yKit5ghi1wDpDCFXt5ib1FBwedE57M97g8sM8TQb';
const ASKNEWS_API_KEY = process.env.ASKNEWS_API_KEY || 'ank_N1BuhrFCEK6BM2bg78xmmli6cjs0wuMoxXmQ41hEoP';
const NEWS_API_KEY = process.env.NEWS_API_KEY || process.env.news_api_key || '6c6327e26c7045c597159c54bd3ecf13';

function generateStoryKey(sourceUrl, itemUrl, title) {
  return crypto.createHash('sha256').update(`${sourceUrl}|${itemUrl}|${title.trim()}`).digest('hex');
}

function evaluateQuality(headline, summary) {
  const text = `${headline} ${summary || ''}`.toLowerCase();
  const comicTerms = [
    'comic', 'marvel', 'dc', 'batman', 'superman', 'spiderman', 'spider-man',
    'x-men', 'avengers', 'cgc', 'grading', 'graphic novel', 'manga', 'stan lee',
    'jack kirby', 'hero', 'villain', 'spawn', 'image comics', 'dark horse', 'first appearance'
  ];
  const matched = comicTerms.some((term) => text.includes(term));
  return { admit: matched };
}

// 1. NewsData.io
async function fetchNewsData(targetCount = 50) {
  console.log('[Wire] Fetching from NewsData.io...');
  const stories = [];
  const queries = [
    '"comic books" OR "graphic novel"',
    '"marvel comics" OR "dc comics"',
    '"cgc" OR "comic grading" OR "first appearance"'
  ];

  for (const q of queries) {
    if (stories.length >= targetCount) break;
    try {
      const url = `https://newsdata.io/api/1/news?apikey=${NEWSDATA_API_KEY}&q=${encodeURIComponent(q)}&language=en`;
      const res = await fetch(url, { headers: { 'User-Agent': 'PanelProfitsDailyWorker/1.0' }, signal: AbortSignal.timeout(10000) });
      if (!res.ok) {
        console.warn(`  NewsData HTTP ${res.status}: ${res.statusText}`);
        continue;
      }
      const data = await res.json();
      for (const r of data.results || []) {
        if (!r.title || !r.link) continue;
        if (!evaluateQuality(r.title, r.description).admit) continue;
        const itemUrl = r.link;
        const headline = r.title.trim();
        stories.push({
          story_key: generateStoryKey('https://newsdata.io', itemUrl, headline),
          source: `NEWSDATA: ${(r.source_id || 'GLOBAL').toUpperCase()}`,
          source_url: itemUrl,
          category: 'international',
          headline,
          author: Array.isArray(r.creator) && r.creator.length > 0 ? r.creator.join(', ') : null,
          summary: r.description ? r.description.slice(0, 3000) : null,
          url: itemUrl,
          image_url: r.image_url || null,
          published_at: r.pubDate && !isNaN(Date.parse(r.pubDate)) ? new Date(r.pubDate).toISOString() : new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn('  NewsData error:', err.message);
    }
  }
  console.log(`  NewsData retrieved ${stories.length} stories.`);
  return stories;
}

// 2. Perigon Wire
async function fetchPerigon(targetCount = 50) {
  console.log('[Wire] Fetching from Perigon...');
  const stories = [];
  try {
    const url = `https://api.goperigon.com/v1/all?apiKey=${PERIGON_API_KEY}&q=${encodeURIComponent('comic books OR comic collecting OR marvel comics OR dc comics')}&language=en&size=50&sortBy=date`;
    const res = await fetch(url, { headers: { 'User-Agent': 'PanelProfitsDailyWorker/1.0' }, signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      console.warn(`  Perigon HTTP ${res.status}: ${res.statusText}`);
      return stories;
    }
    const data = await res.json();
    for (const a of data.articles || []) {
      if (!a.title || !a.url) continue;
      if (!evaluateQuality(a.title, a.description || a.summary).admit) continue;
      const itemUrl = a.url;
      const headline = a.title.trim();
      const sourceLabel = a.source?.domain || a.source?.name || 'PERIGON';
      stories.push({
        story_key: generateStoryKey('https://api.goperigon.com', itemUrl, headline),
        source: `PERIGON: ${sourceLabel.toUpperCase()}`,
        source_url: itemUrl,
        category: 'international',
        headline,
        author: Array.isArray(a.authorsByline) && a.authorsByline.length > 0 ? a.authorsByline.join(', ') : null,
        summary: (a.summary || a.description || '').slice(0, 3000) || null,
        url: itemUrl,
        image_url: a.imageUrl || null,
        published_at: a.pubDate && !isNaN(Date.parse(a.pubDate)) ? new Date(a.pubDate).toISOString() : new Date().toISOString()
      });
    }
  } catch (err) {
    console.warn('  Perigon error:', err.message);
  }
  console.log(`  Perigon retrieved ${stories.length} stories.`);
  return stories;
}

// 3. TheNewsAPI Wire
async function fetchTheNewsApi(targetCount = 50) {
  console.log('[Wire] Fetching from TheNewsAPI...');
  const stories = [];
  const searches = ['comics', 'marvel+batman', 'superhero+cgc'];
  for (const s of searches) {
    if (stories.length >= targetCount) break;
    try {
      const url = `https://api.thenewsapi.com/v1/news/all?api_token=${THENEWSAPI_API_KEY}&search=${s}&language=en&limit=25`;
      const res = await fetch(url, { headers: { 'User-Agent': 'PanelProfitsDailyWorker/1.0' }, signal: AbortSignal.timeout(10000) });
      if (!res.ok) {
        console.warn(`  TheNewsAPI HTTP ${res.status}: ${res.statusText}`);
        continue;
      }
      const data = await res.json();
      for (const i of data.data || []) {
        if (!i.title || !i.url) continue;
        if (!evaluateQuality(i.title, i.description).admit) continue;
        const itemUrl = i.url;
        const headline = i.title.trim();
        stories.push({
          story_key: generateStoryKey('https://api.thenewsapi.com', itemUrl, headline),
          source: `THENEWSAPI: ${(i.source || 'GLOBAL').toUpperCase()}`,
          source_url: itemUrl,
          category: 'international',
          headline,
          author: null,
          summary: (i.description || '').slice(0, 3000) || null,
          url: itemUrl,
          image_url: i.image_url || null,
          published_at: i.published_at && !isNaN(Date.parse(i.published_at)) ? new Date(i.published_at).toISOString() : new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn('  TheNewsAPI error:', err.message);
    }
  }
  console.log(`  TheNewsAPI retrieved ${stories.length} stories.`);
  return stories;
}

// 4. AskNews Wire
async function fetchAskNews(targetCount = 50) {
  console.log('[Wire] Fetching from AskNews...');
  const stories = [];
  try {
    const query = encodeURIComponent('comic books marvel dc comics');
    const url = `https://api.asknews.app/v1/news/search?query=${query}&n_articles=10`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${ASKNEWS_API_KEY}`,
        Accept: 'application/json',
        'User-Agent': 'PanelProfitsDailyWorker/1.0'
      },
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) {
      console.warn(`  AskNews HTTP ${res.status}: ${res.statusText}`);
      return stories;
    }
    const data = await res.json();
    const articles = data.as_dicts || data.articles || [];
    for (const a of articles) {
      const title = a.title || a.headline;
      if (!title || !a.article_url) continue;
      if (!evaluateQuality(title, a.summary).admit) continue;
      const itemUrl = a.article_url;
      const headline = title.trim();
      const sourceId = a.source_id || 'ASKNEWS';
      stories.push({
        story_key: generateStoryKey('https://api.asknews.app', itemUrl, headline),
        source: `ASKNEWS: ${sourceId.toUpperCase()}`,
        source_url: itemUrl,
        category: 'international',
        headline,
        author: null,
        summary: (a.summary || '').slice(0, 3000) || null,
        url: itemUrl,
        image_url: a.image_url || null,
        published_at: a.pub_date && !isNaN(Date.parse(a.pub_date)) ? new Date(a.pub_date).toISOString() : new Date().toISOString()
      });
    }
  } catch (err) {
    console.warn('  AskNews error:', err.message);
  }
  console.log(`  AskNews retrieved ${stories.length} stories.`);
  return stories;
}

// 5. NewsAPI.org Wire
async function fetchNewsApiOrg(targetCount = 50) {
  console.log('[Wire] Fetching from NewsAPI.org...');
  const stories = [];
  try {
    const query = encodeURIComponent('"comic books" OR "graphic novels" OR "marvel comics" OR "dc comics"');
    const url = `https://newsapi.org/v2/everything?apiKey=${NEWS_API_KEY}&q=${query}&language=en&sortBy=publishedAt&pageSize=50`;
    const res = await fetch(url, { headers: { 'User-Agent': 'PanelProfitsDailyWorker/1.0' }, signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      console.warn(`  NewsAPI.org HTTP ${res.status}: ${res.statusText}`);
      return stories;
    }
    const data = await res.json();
    for (const a of data.articles || []) {
      if (!a.title || !a.url) continue;
      if (!evaluateQuality(a.title, a.description).admit) continue;
      const itemUrl = a.url;
      const headline = a.title.trim();
      const sourceName = a.source?.name || 'NEWSAPI';
      stories.push({
        story_key: generateStoryKey('https://newsapi.org', itemUrl, headline),
        source: `NEWSAPI: ${sourceName.toUpperCase()}`,
        source_url: itemUrl,
        category: 'international',
        headline,
        author: a.author || null,
        summary: (a.description || a.content || '').slice(0, 3000) || null,
        url: itemUrl,
        image_url: a.urlToImage || null,
        published_at: a.publishedAt && !isNaN(Date.parse(a.publishedAt)) ? new Date(a.publishedAt).toISOString() : new Date().toISOString()
      });
    }
  } catch (err) {
    console.warn('  NewsAPI.org error:', err.message);
  }
  console.log(`  NewsAPI.org retrieved ${stories.length} stories.`);
  return stories;
}

async function runDailyIngestion() {
  console.log('=== STARTING MULTI-WIRE DAILY INGESTION ===');
  console.log(`Timestamp: ${new Date().toISOString()}`);

  const [newsdata, perigon, thenewsapi, asknews, newsapi] = await Promise.all([
    fetchNewsData(50),
    fetchPerigon(50),
    fetchTheNewsApi(50),
    fetchAskNews(50),
    fetchNewsApiOrg(50)
  ]);

  const allStories = [...newsdata, ...perigon, ...thenewsapi, ...asknews, ...newsapi];
  console.log(`Total collected raw wire stories: ${allStories.length}`);

  // Deduplicate in memory
  const uniqueStories = new Map();
  for (const s of allStories) {
    if (!uniqueStories.has(s.story_key)) {
      uniqueStories.set(s.story_key, s);
    }
  }

  const deduplicated = Array.from(uniqueStories.values());
  console.log(`Deduplicated distinct stories to persist: ${deduplicated.length}`);

  // Connect to Clean Supabase PostgreSQL
  const pg = new PgClient({ connectionString: DIRECT_URL, ssl: { rejectUnauthorized: false } });
  await pg.connect();

  let insertedCount = 0;
  let updatedCount = 0;

  try {
    for (const s of deduplicated) {
      const res = await pg.query(`
        INSERT INTO public.pp_news_stories (
          story_key, source, source_url, category, headline, summary,
          url, image_url, published_at, ingested_at, author
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now(), $10)
        ON CONFLICT (story_key) DO UPDATE SET
          summary = COALESCE(EXCLUDED.summary, public.pp_news_stories.summary),
          image_url = COALESCE(EXCLUDED.image_url, public.pp_news_stories.image_url),
          author = COALESCE(EXCLUDED.author, public.pp_news_stories.author),
          ingested_at = now()
        RETURNING (xmax = 0) AS is_insert;
      `, [
        s.story_key, s.source, s.source_url, s.category, s.headline,
        s.summary, s.url, s.image_url, s.published_at, s.author
      ]);

      if (res.rows.length > 0) {
        if (res.rows[0].is_insert) {
          insertedCount++;
        } else {
          updatedCount++;
        }
      }
    }

    const totalInDb = await pg.query('SELECT count(*) FROM public.pp_news_stories');
    console.log('=== MULTI-WIRE DAILY INGESTION COMPLETE ===');
    console.log(`Newly inserted stories: ${insertedCount}`);
    console.log(`Updated stories:        ${updatedCount}`);
    console.log(`Total stories in DB:    ${totalInDb.rows[0].count}`);
  } finally {
    await pg.end();
  }
}

runDailyIngestion().catch((err) => {
  console.error('Fatal ingestion error:', err);
  process.exit(1);
});
