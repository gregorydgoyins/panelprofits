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
async function fetchNewsData(targetCount = 200) {
  console.log('[Wire] Fetching from NewsData.io (target 200)...');
  const stories = [];
  const queries = [
    '"comic books" OR "graphic novel"',
    '"marvel comics" OR "dc comics"',
    '"cgc" OR "comic grading" OR "first appearance"',
    '"spider-man" OR "batman" OR "x-men"',
    '"image comics" OR "dark horse comics"'
  ];

  for (const q of queries) {
    if (stories.length >= targetCount) break;
    let nextPage = null;
    for (let page = 0; page < 4; page++) {
      if (stories.length >= targetCount) break;
      try {
        const pageParam = nextPage ? `&page=${encodeURIComponent(nextPage)}` : '';
        const url = `https://newsdata.io/api/1/news?apikey=${NEWSDATA_API_KEY}&q=${encodeURIComponent(q)}&language=en${pageParam}`;
        const res = await fetch(url, { headers: { 'User-Agent': 'PanelProfitsDailyWorker/1.0' }, signal: AbortSignal.timeout(10000) });
        if (!res.ok) {
          console.warn(`  NewsData HTTP ${res.status}: ${res.statusText}`);
          break;
        }
        const data = await res.json();
        const results = data.results || [];
        if (results.length === 0) break;

        for (const r of results) {
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
        nextPage = data.nextPage;
        if (!nextPage) break;
      } catch (err) {
        console.warn('  NewsData error:', err.message);
        break;
      }
    }
  }
  console.log(`  NewsData retrieved ${stories.length} stories.`);
  return stories;
}

// 2. Perigon Wire
async function fetchPerigon(targetCount = 200) {
  console.log('[Wire] Fetching from Perigon (target 200)...');
  const stories = [];
  for (let page = 0; page < 3; page++) {
    if (stories.length >= targetCount) break;
    try {
      const url = `https://api.goperigon.com/v1/all?apiKey=${PERIGON_API_KEY}&q=${encodeURIComponent('comic books OR comic collecting OR marvel comics OR dc comics')}&language=en&size=100&page=${page}&sortBy=date`;
      const res = await fetch(url, { headers: { 'User-Agent': 'PanelProfitsDailyWorker/1.0' }, signal: AbortSignal.timeout(12000) });
      if (!res.ok) {
        console.warn(`  Perigon HTTP ${res.status}: ${res.statusText}`);
        break;
      }
      const data = await res.json();
      const articles = data.articles || [];
      if (articles.length === 0) break;

      for (const a of articles) {
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
      break;
    }
  }
  console.log(`  Perigon retrieved ${stories.length} stories.`);
  return stories;
}

// 3. TheNewsAPI Wire
async function fetchTheNewsApi(targetCount = 200) {
  console.log('[Wire] Fetching from TheNewsAPI (target 200)...');
  const stories = [];
  const searches = ['comics', 'marvel+batman', 'superhero+cgc', 'graphic+novels', 'comic+collecting'];
  for (const s of searches) {
    if (stories.length >= targetCount) break;
    for (let page = 1; page <= 4; page++) {
      if (stories.length >= targetCount) break;
      try {
        const url = `https://api.thenewsapi.com/v1/news/all?api_token=${THENEWSAPI_API_KEY}&search=${s}&language=en&limit=50&page=${page}`;
        const res = await fetch(url, { headers: { 'User-Agent': 'PanelProfitsDailyWorker/1.0' }, signal: AbortSignal.timeout(10000) });
        if (!res.ok) {
          console.warn(`  TheNewsAPI HTTP ${res.status}: ${res.statusText}`);
          break;
        }
        const data = await res.json();
        const items = data.data || [];
        if (items.length === 0) break;

        for (const i of items) {
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
        break;
      }
    }
  }
  console.log(`  TheNewsAPI retrieved ${stories.length} stories.`);
  return stories;
}

// 4. AskNews Wire
async function fetchAskNews(targetCount = 80) {
  console.log('[Wire] Fetching from AskNews (multi-query topic sweep)...');
  const stories = [];
  const topics = [
    'comic books marvel dc comics',
    'spider-man batman x-men comics',
    'cgc comic grading auction',
    'graphic novel omnibus manga',
    'image comics dark horse skybound',
    'comic book movie adaptation fmv',
    'superman action comics detective comics',
    'avengers secret wars marvel studios'
  ];

  for (const topic of topics) {
    if (stories.length >= targetCount) break;
    try {
      const query = encodeURIComponent(topic);
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
        continue;
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
  }
  console.log(`  AskNews retrieved ${stories.length} stories.`);
  return stories;
}

// 5. NewsAPI.org Wire
async function fetchNewsApiOrg(targetCount = 200) {
  console.log('[Wire] Fetching from NewsAPI.org (target 200)...');
  const stories = [];
  for (let page = 1; page <= 2; page++) {
    if (stories.length >= targetCount) break;
    try {
      const url = `https://newsapi.org/v2/everything?apiKey=${NEWS_API_KEY}&q=${encodeURIComponent('comic book OR comic books OR graphic novel OR marvel comics OR dc comics')}&language=en&sortBy=publishedAt&pageSize=100&page=${page}`;
      const res = await fetch(url, { headers: { 'User-Agent': 'PanelProfitsDailyWorker/1.0' }, signal: AbortSignal.timeout(10000) });
      if (!res.ok) {
        console.warn(`  NewsAPI HTTP ${res.status}: ${res.statusText}`);
        break;
      }
      const data = await res.json();
      const articles = data.articles || [];
      if (articles.length === 0) break;

      for (const a of articles) {
        if (!a.title || !a.url) continue;
        if (!evaluateQuality(a.title, a.description || a.content).admit) continue;
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
      console.warn('  NewsAPI error:', err.message);
      break;
    }
  }
  console.log(`  NewsAPI retrieved ${stories.length} stories.`);
  return stories;
}

async function runDailyIngestion() {
  console.log('=== STARTING MULTI-WIRE DAILY INGESTION (TARGET 200/WIRE) ===');
  console.log(`Timestamp: ${new Date().toISOString()}`);

  const [newsdata, perigon, thenewsapi, asknews, newsapi] = await Promise.all([
    fetchNewsData(200),
    fetchPerigon(200),
    fetchTheNewsApi(200),
    fetchAskNews(80),
    fetchNewsApiOrg(200)
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
