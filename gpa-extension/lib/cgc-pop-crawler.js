/**
 * lib/cgc-pop-crawler.js
 * Panel Profits Graded Collector — CGC Population Report crawler.
 *
 * Walks CGC's public population API (the same one cgccomics.com/population-report
 * calls): publishers -> titles ("groups") -> population records (issue / variant),
 * each carrying the full per-grade census. Runs in the service worker (host
 * permission bypasses CORS, no tab needed), posts 50-row pages to
 * /api/ingestion/cgc-pop, checkpoints after every title, resumes after restart.
 *
 * Upserts are idempotent (population_id), so re-running or resuming never duplicates.
 */

const API = 'https://production.api.aws.ccg-ops.com/api/comics/research/comics';
const STATE_KEY = 'cgcPopState';
const GROUPS_KEY = 'cgcPopGroups';
const PAGE_CONCURRENCY = 3;

// Publisher subcategories (research subcategory IDs from the CGC pop report).
const SUBCATEGORIES = [
  5304, 2297, 4235, 4255, 1240, 4201, 2229, 2599, 8717, 2366,
  3519, 6538, 514, 6401, 5350, 8558, 1066, 2429, 1,
];

let running = false;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getSettings() {
  const { settings } = await chrome.storage.local.get(['settings']);
  return {
    serverUrl: 'https://comicbookstockexchange.com',
    ingestionSecret: '',
    cgcDelayMs: 350,
    ...(settings || {}),
  };
}

async function loadState() {
  const { [STATE_KEY]: s } = await chrome.storage.local.get([STATE_KEY]);
  return (
    s || {
      status: 'IDLE', // IDLE | RUNNING | STOPPED | DONE | ERROR
      phase: 'groups', // groups | pop
      subIdx: 0,
      groupPage: 1,
      gIdx: 0,
      groupsTotal: 0,
      rowsSent: 0,
      pagesDone: 0,
      lastError: null,
      startedAt: null,
      updatedAt: null,
    }
  );
}

async function saveState(s) {
  s.updatedAt = Date.now();
  await chrome.storage.local.set({ [STATE_KEY]: s });
}

async function getJson(url, tries = 6) {
  let delay = 1500;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { credentials: 'omit' });
      if (res.ok) return await res.json();
      if (res.status !== 429 && res.status < 500) throw new Error(`HTTP ${res.status} ${url}`);
    } catch (err) {
      if (i === tries - 1) throw err;
    }
    await sleep(delay);
    delay = Math.min(delay * 2, 60000);
  }
  throw new Error(`Gave up on ${url}`);
}

function mapItem(it, group) {
  const pop = {};
  for (const [k, v] of Object.entries(it)) {
    if (k.startsWith('population_') && k !== 'population_Total' && k !== 'population_Date') {
      pop[k.slice('population_'.length)] = Number(v) || 0;
    }
  }
  return {
    populationID: it.populationID,
    researchGroupID: it.researchGroupID ?? group.id,
    subcategoryID: group.subId,
    publisher: group.publisher,
    title: it.title || it.displayName || group.name,
    issueNumber: it.issueNumber,
    issueDate: it.issueDate,
    numericYear: it.numericYear,
    variant: it.variant,
    isBase: it.isBase,
    masterID: it.masterID,
    population_Total: it.population_Total,
    dateModified: it.dateModified,
    pop,
  };
}

async function postRows(settings, rows) {
  if (!rows.length) return;
  const res = await fetch(`${settings.serverUrl}/api/ingestion/cgc-pop`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.ingestionSecret}`,
    },
    body: JSON.stringify({ rows }),
  });
  if (res.status === 401) throw Object.assign(new Error('Ingestion secret rejected (401)'), { fatal: true });
  if (!res.ok) throw new Error(`Ingest HTTP ${res.status}: ${(await res.text()).slice(0, 120)}`);
}

// Phase 1: enumerate every title (group) once; resumable by (subIdx, groupPage).
async function enumerateGroups(state, settings) {
  const { [GROUPS_KEY]: saved } = await chrome.storage.local.get([GROUPS_KEY]);
  const groups = saved || [];
  while (state.status === 'RUNNING' && state.subIdx < SUBCATEGORIES.length) {
    const subId = SUBCATEGORIES[state.subIdx];
    const data = await getJson(`${API}/groups/?researchSubcategoryID=${subId}&page=${state.groupPage}`);
    for (const g of data.Items || []) {
      groups.push([g.researchGroupID, subId, g.publisher || '', g.name || '']);
    }
    if (data.ShowNextPage || state.groupPage < (data.PageCount || 1)) {
      state.groupPage += 1;
    } else {
      state.subIdx += 1;
      state.groupPage = 1;
    }
    await chrome.storage.local.set({ [GROUPS_KEY]: groups });
    state.groupsTotal = groups.length;
    await saveState(state);
    await sleep(settings.cgcDelayMs);
    state.status = (await loadState()).status === 'STOPPED' ? 'STOPPED' : state.status;
  }
  if (state.status === 'RUNNING') {
    state.phase = 'pop';
    state.gIdx = 0;
    await saveState(state);
  }
}

// Phase 2: for each title, pull every population page and post it.
async function crawlGroup(group, state, settings) {
  const first = await getJson(`${API}/population/?researchGroupID=${group.id}&page=1`);
  const pageCount = first.PageCount || 1;
  const send = async (items) => {
    const rows = (items || []).map((it) => mapItem(it, group));
    await postRows(settings, rows);
    state.rowsSent += rows.length;
    state.pagesDone += 1;
  };
  await send(first.Items);

  const pages = [];
  for (let p = 2; p <= pageCount; p++) pages.push(p);
  for (let i = 0; i < pages.length; i += PAGE_CONCURRENCY) {
    const batch = pages.slice(i, i + PAGE_CONCURRENCY);
    const results = await Promise.all(
      batch.map((p) => getJson(`${API}/population/?researchGroupID=${group.id}&page=${p}`))
    );
    for (const r of results) await send(r.Items);
    await sleep(settings.cgcDelayMs);
  }
}

async function run() {
  if (running) return;
  running = true;
  const state = await loadState();
  const settings = await getSettings();
  try {
    if (!settings.ingestionSecret) throw Object.assign(new Error('Set the ingestion secret in settings first'), { fatal: true });
    state.status = 'RUNNING';
    state.startedAt = state.startedAt || Date.now();
    state.lastError = null;
    await saveState(state);

    if (state.phase === 'groups') await enumerateGroups(state, settings);

    if (state.phase === 'pop') {
      const { [GROUPS_KEY]: groups = [] } = await chrome.storage.local.get([GROUPS_KEY]);
      state.groupsTotal = groups.length;
      while (state.status === 'RUNNING' && state.gIdx < groups.length) {
        const [id, subId, publisher, name] = groups[state.gIdx];
        await crawlGroup({ id, subId, publisher, name }, state, settings);
        state.gIdx += 1;
        await saveState(state);
        const live = await loadState();
        if (live.status === 'STOPPED') state.status = 'STOPPED';
        await sleep(settings.cgcDelayMs);
      }
      if (state.status === 'RUNNING' && state.gIdx >= groups.length) state.status = 'DONE';
    }
  } catch (err) {
    state.lastError = err.message;
    state.status = err.fatal ? 'ERROR' : 'RUNNING'; // transient: alarm resumes
  } finally {
    await saveState(state);
    running = false;
  }
}

export async function startCgcPop() {
  const s = await loadState();
  if (s.status === 'DONE') {
    Object.assign(s, { status: 'IDLE', phase: 'groups', subIdx: 0, groupPage: 1, gIdx: 0, rowsSent: 0, pagesDone: 0, startedAt: null });
    await chrome.storage.local.remove([GROUPS_KEY]);
  }
  s.status = 'RUNNING';
  await saveState(s);
  run();
}

export async function stopCgcPop() {
  const s = await loadState();
  s.status = 'STOPPED';
  await saveState(s);
}

export async function getCgcPopStatus() {
  return loadState();
}

// Keep-alive / resume after the worker is torn down.
chrome.alarms.create('cgc_pop_resume', { periodInMinutes: 0.5 });
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== 'cgc_pop_resume') return;
  const s = await loadState();
  if (s.status === 'RUNNING' && !running) run();
});
