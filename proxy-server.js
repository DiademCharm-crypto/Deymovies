// ==========================================
// DEYMFLIX - Backend Proxy Server
// ==========================================
// This server holds ALL API keys/credentials server-side.
// The browser NEVER sees the real keys — it only talks to this proxy.
// ==========================================

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

// ============ SERVER-SIDE SECRETS (never sent to browser) ============
const SECRETS = {
  OPENSUBTITLES_API_KEY: 'g0lXqsvA4zs8XdeLhj2eBf62PJnaLIr5',
  OPENSUBTITLES_USERNAME: 'deymflix',
  OPENSUBTITLES_PASSWORD: 'Chambe09',
  // Optional: set TMDB_API_KEY in the environment to override the key below.
  TMDB_API_KEY: process.env.TMDB_API_KEY || '15d260044e350723365198253b23914f',
  VAST_TAG_URL: 'https://bouncyeffective.com/dgmTFpzRd.GENgvQZNGJUZ/uekm-9tu/Z-UJllkaPHTQcj0NMmTXYC0/MNzjM/tmNczAQixTN/j/Q/zCN-wB',
  FIREBASE_CONFIG: {
    apiKey: 'AIzaSyCSejdiwh4Y6N6Pwl6QyLXPNYdUqz8vc1M',
    authDomain: 'deymflix.firebaseapp.com',
    projectId: 'deymflix',
    storageBucket: 'deymflix.firebasestorage.app',
    messagingSenderId: '333198075783',
    appId: '1:333198075783:web:91765cf2f3c09e3c119522',
    measurementId: 'G-H8KMTM5YYH'
  }
};

// ============ SIMPLE IN-MEMORY CACHE ============
// Movie metadata barely changes, so cache it instead of hammering TMDB
// (and to keep the player responsive on repeat visits).
const TMDB_DETAILS_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const tmdbDetailsCache = new Map();

function tmdbCacheGet(key) {
  const hit = tmdbDetailsCache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > TMDB_DETAILS_TTL_MS) {
    tmdbDetailsCache.delete(key);
    return null;
  }
  return hit.value;
}

function tmdbCacheSet(key, value) {
  tmdbDetailsCache.set(key, { at: Date.now(), value: value });
  if (tmdbDetailsCache.size > 500) {
    let oldestKey = null, oldestAt = Infinity;
    tmdbDetailsCache.forEach(function (v, k) { if (v.at < oldestAt) { oldestAt = v.at; oldestKey = k; } });
    if (oldestKey) tmdbDetailsCache.delete(oldestKey);
  }
}

// ============ MOVIE DETAILS HELPERS ============
// Two sources, best first:
//   1) TMDB     — rating + votes, cast with photos/roles, stills (needs a valid key)
//   2) Wikidata — key-free fallback: release date, runtime, genres, director,
//                 cast + roles, and cast portraits from Wikimedia Commons
// Both produce the SAME payload shape, so the player never needs to know which
// source answered. When the TMDB key is missing/expired we simply fall through.

const WD_API = 'https://www.wikidata.org/w/api.php';
const WD_UA = 'Deymflix/1.0 (movie metadata lookup)';

async function wdJson(targetUrl) {
  const r = await fetchUrl(targetUrl, {
    headers: { 'User-Agent': WD_UA, 'Accept': 'application/json' }
  });
  if (r.status !== 200) throw new Error('Wikidata HTTP ' + r.status);
  return JSON.parse(r.body);
}

// Entity-valued claims (e.g. director → Q-id)
function wdEntityIds(entity, prop) {
  const ids = [];
  const claims = (entity.claims && entity.claims[prop]) || [];
  claims.forEach(function (c) {
    const v = c.mainsnak && c.mainsnak.datavalue && c.mainsnak.datavalue.value;
    if (v && v['entity-type'] && v.id) ids.push(v.id);
  });
  return ids;
}

// String-valued claims (e.g. Commons image filename → P18)
function wdStringValue(entity, prop) {
  const claims = (entity.claims && entity.claims[prop]) || [];
  for (let i = 0; i < claims.length; i++) {
    const v = claims[i].mainsnak && claims[i].mainsnak.datavalue && claims[i].mainsnak.datavalue.value;
    if (typeof v === 'string' && v) return v;
  }
  return '';
}

function wdQuantity(entity, prop) {
  const claims = (entity.claims && entity.claims[prop]) || [];
  for (let i = 0; i < claims.length; i++) {
    const v = claims[i].mainsnak && claims[i].mainsnak.datavalue && claims[i].mainsnak.datavalue.value;
    if (v && typeof v.amount !== 'undefined') return Math.round(parseFloat(v.amount)) || 0;
  }
  return 0;
}

function wdDate(entity, prop) {
  const claims = (entity.claims && entity.claims[prop]) || [];
  for (let i = 0; i < claims.length; i++) {
    const v = claims[i].mainsnak && claims[i].mainsnak.datavalue && claims[i].mainsnak.datavalue.value;
    if (v && v.time) {
      const m = String(v.time).match(/(\d{4})-(\d{2})-(\d{2})/);
      if (!m) continue;
      if (m[2] === '00' || m[3] === '00') return m[1] + '-01-01';
      return m[1] + '-' + m[2] + '-' + m[3];
    }
  }
  return '';
}

// Wikidata review scores are strings like "8/10" or "78/100"
function wdScore(entity) {
  const claims = (entity.claims && entity.claims['P444']) || [];
  for (let i = 0; i < claims.length; i++) {
    const v = claims[i].mainsnak && claims[i].mainsnak.datavalue && claims[i].mainsnak.datavalue.value;
    if (typeof v !== 'string') continue;
    const m = v.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+)/);
    if (!m) continue;
    const num = parseFloat(m[1]);
    const den = parseFloat(m[2]);
    if (den === 10) return num;
    if (den === 100) return Math.round((num / 10) * 10) / 10;
  }
  return 0;
}

// Cast members plus the character they played, where Wikidata records it.
// Characters are either a plain string (P4633) or another item (§-prefixed).
function wdCast(entity) {
  const claims = (entity.claims && entity.claims['P161']) || [];
  const out = [];
  claims.forEach(function (c) {
    const v = c.mainsnak && c.mainsnak.datavalue && c.mainsnak.datavalue.value;
    if (!v || !v.id) return;
    const q = c.qualifiers || {};
    let character = '';
    const roleText = q.P4633 && q.P4633[0] && q.P4633[0].datavalue && q.P4633[0].datavalue.value;
    const roleItem = q.P453 && q.P453[0] && q.P453[0].datavalue && q.P453[0].datavalue.value;
    if (typeof roleText === 'string') character = roleText;
    else if (roleItem && roleItem.id) character = '§' + roleItem.id;
    out.push({ person: v.id, character: character });
  });
  return out;
}

// Wikidata genre labels are slugs like "action film"/"thriller film" — tidy
// them so the chips read like normal genre names.
function tidyWdGenre(label) {
  let s = String(label || '').trim();
  if (!s) return '';
  s = s.replace(/\s+(film|movie|television series|series)$/i, '');
  return s.replace(/\b[a-z]/g, function (ch) { return ch.toUpperCase(); });
}

// Free portrait served straight from Wikimedia Commons
function commonsPhoto(fileName) {
  if (!fileName) return '';
  return 'https://commons.wikimedia.org/wiki/Special:FilePath/' +
    encodeURIComponent(String(fileName).replace(/ /g, '_')) + '?width=200';
}

// Loose title comparison so a wrong-movie match (a DIFFERENT film with a similar
// or unrelated title) is rejected, while sequels/subtitles still pass.
function normalizeTitle(s) {
  return String(s || '').toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function titlesMatch(hint, got) {
  const h = normalizeTitle(hint);
  const g = normalizeTitle(got);
  if (!h || !g) return true; // no gate when we lack a title
  if (h === g) return true;
  if (g.indexOf(h) !== -1 || h.indexOf(g) !== -1) return true;
  const hs = new Set(h.split(' '));
  const gs = new Set(g.split(' '));
  let shared = 0;
  hs.forEach(function (t) { if (gs.has(t)) shared++; });
  const smaller = Math.min(hs.size, gs.size) || 1;
  return (shared / smaller) > 0.5;
}

async function wikidataDetailsForImdb(imdbId) {
  const search = await wdJson(WD_API + '?action=query&list=search&format=json&srsearch=' +
    encodeURIComponent('haswbstatement:P345=' + imdbId));
  const hit = ((search.query && search.query.search) || [])[0];
  if (!hit) return null;

  const qid = hit.title;
  const ent = await wdJson(WD_API + '?action=wbgetentities&format=json&props=claims|labels&languages=en&ids=' + qid);
  const entity = (ent.entities || {})[qid];
  if (!entity) return null;
  return buildWdPayload(entity, qid, imdbId);
}

// Shared: turn a Wikidata film/series entity into the details payload
async function buildWdPayload(entity, qid, imdbId) {
  const directors = wdEntityIds(entity, 'P57');
  const genres = wdEntityIds(entity, 'P136');
  const cast = wdCast(entity);
  const peopleIds = Array.from(new Set(directors.concat(cast.map(function (c) { return c.person; })))).slice(0, 20);
  const labelIds = Array.from(new Set(genres.concat(cast.map(function (c) {
    return c.character.charAt(0) === '§' ? c.character.slice(1) : '';
  })))).filter(Boolean).slice(0, 40);

  const labels = {};
  const photos = {};

  if (labelIds.length) {
    const lj = await wdJson(WD_API + '?action=wbgetentities&format=json&props=labels&languages=en&ids=' +
      encodeURIComponent(labelIds.join('|')));
    Object.keys(lj.entities || {}).forEach(function (id) {
      const e = lj.entities[id];
      labels[id] = (e.labels && e.labels.en && e.labels.en.value) || '';
    });
  }

  if (peopleIds.length) {
    const pj = await wdJson(WD_API + '?action=wbgetentities&format=json&props=labels|claims&languages=en&ids=' +
      encodeURIComponent(peopleIds.join('|')));
    Object.keys(pj.entities || {}).forEach(function (id) {
      const e = pj.entities[id];
      labels[id] = (e.labels && e.labels.en && e.labels.en.value) || '';
      const img = wdStringValue(e, 'P18');
      if (img) photos[id] = commonsPhoto(img);
    });
  }

  const castOut = [];
  cast.forEach(function (c) {
    const name = labels[c.person] || '';
    if (!name) return;
    const role = c.character.charAt(0) === '§'
      ? (labels[c.character.slice(1)] || '')
      : c.character;
    castOut.push({ name: name, character: role, photo: photos[c.person] || '' });
  });

  return {
    found: true,
    source: 'wikidata',
    tmdbId: null,
    imdbId: imdbId,
    title: (entity.labels && entity.labels.en && entity.labels.en.value) || '',
    releaseDate: wdDate(entity, 'P577'),
    runtime: wdQuantity(entity, 'P2047'),
    score: wdScore(entity),
    votes: 0,
    genres: Array.from(new Set(genres.map(function (g) { return tidyWdGenre(labels[g]); })
      .filter(Boolean))).slice(0, 4),
    overview: '',
    poster: '',
    backdrop: '',
    director: directors.map(function (d) { return labels[d]; }).filter(Boolean),
    cast: castOut.slice(0, 12),
    stills: []
  };
}

// Key-free fallback: find a film/TV entity by title when the IMDB id is unknown.
// Wikidata's `haswbstatement` filter keeps the search to actual films/series.
async function wikidataDetailsForTitle(title) {
  try {
    let hit = null;
    const film = await wdJson(WD_API + '?action=query&list=search&format=json&srlimit=3&srsearch=' +
      encodeURIComponent(title + ' haswbstatement:P31=Q11424'));
    hit = ((film.query && film.query.search) || [])[0];
    if (!hit) {
      const tv = await wdJson(WD_API + '?action=query&list=search&format=json&srlimit=3&srsearch=' +
        encodeURIComponent(title + ' haswbstatement:P31=Q5398426'));
      hit = ((tv.query && tv.query.search) || [])[0];
    }
    if (!hit) return null;

    const qid = hit.title;
    const ent = await wdJson(WD_API + '?action=wbgetentities&format=json&props=claims|labels&languages=en&ids=' + qid);
    const entity = (ent.entities || {})[qid];
    if (!entity) return null;
    const payload = await buildWdPayload(entity, qid, '');
    // Text search can surface a similar-but-different film — verify the title
    if (!titlesMatch(title, payload.title)) return null;
    return payload;
  } catch (e) {
    return null;
  }
}


// ============ STATIC FILE MIME TYPES ============
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.mkv': 'video/x-matroska',
  '.m3u8': 'application/vnd.apple.mpegurl',
  '.ts': 'video/mp2t',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8'
};

// ============ HELPERS ============

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function fetchUrl(targetUrl, options = {}, redirectCount) {
  if (redirectCount === undefined) redirectCount = 0;
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) return reject(new Error('Too many redirects'));
    const parsed = new URL(targetUrl);
    const mod = parsed.protocol === 'https:' ? https : http;
    const reqOpts = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 15000
    };
    const req = mod.request(reqOpts, (res) => {
      // Follow redirects (301, 302, 307, 308)
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
        let redirectUrl = res.headers.location;
        // Handle relative redirects
        if (redirectUrl.startsWith('/')) {
          redirectUrl = parsed.protocol + '//' + parsed.hostname + redirectUrl;
        }
        // Consume the response body before redirecting
        res.resume();
        fetchUrl(redirectUrl, options, redirectCount + 1).then(resolve).catch(reject);
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    if (options.body) req.write(options.body);
    req.end();
  });
}

function jsonResponse(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-cache'
  });
  res.end(JSON.stringify(data));
  // Return true so callers can `return jsonResponse(...)` to stop the request
  // from falling through to static-file serving (which would try to write
  // headers again and crash the process with ERR_HTTP_HEADERS_SENT).
  return true;
}

function sendError(res, status, message) {
  return jsonResponse(res, status, { error: message });
}

// ============ PROXY ROUTES ============

async function handleProxyRoutes(req, res, parsedUrl) {
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // ---- Firebase Config (safe to send — no secret) ----
  if (pathname === '/api/firebase-config') {
    jsonResponse(res, 200, SECRETS.FIREBASE_CONFIG);
    return true;
  }

  // ---- VAST Ad Tag Proxy ----
  if (pathname === '/api/vast') {
    try {
      const vastResp = await fetchUrl(SECRETS.VAST_TAG_URL);
      res.writeHead(vastResp.status, {
        'Content-Type': vastResp.headers['content-type'] || 'text/xml',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      });
      res.end(vastResp.body);
    } catch (e) {
      sendError(res, 502, 'VAST fetch failed: ' + e.message);
    }
    return true;
  }

  // ---- OpenSubtitles Login ----
  if (pathname === '/api/opensubtitles/login') {
    try {
      const loginResp = await fetchUrl('https://api.opensubtitles.com/api/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': SECRETS.OPENSUBTITLES_API_KEY,
          'User-Agent': 'DEYMFLIX v1.0'
        },
        body: JSON.stringify({
          api_key: SECRETS.OPENSUBTITLES_API_KEY,
          username: SECRETS.OPENSUBTITLES_USERNAME,
          password: SECRETS.OPENSUBTITLES_PASSWORD
        })
      });
      jsonResponse(res, loginResp.status, JSON.parse(loginResp.body));
    } catch (e) {
      sendError(res, 502, 'OpenSubtitles login failed: ' + e.message);
    }
    return true;
  }

  // ---- OpenSubtitles Search ----
  if (pathname === '/api/opensubtitles/search') {
    // Accept both GET query params and POST body for reliability
    let lang = query.lang || 'en';
    let imdbId = query.imdb_id || '';
    let queryStr = query.query || '';
    let type = query.type || 'movie';
    let limit = query.limit || '15';
    let token = query.token || '';
    let season = query.season_number || '';
    let episode = query.episode_number || '';

    // If POST, override with body params (more reliable for token passing)
    if (req.method === 'POST') {
      try {
        const body = JSON.parse(await readBody(req));
        if (body.lang) lang = body.lang;
        if (body.imdb_id) imdbId = body.imdb_id;
        if (body.query) queryStr = body.query;
        if (body.type) type = body.type;
        if (body.limit) limit = body.limit;
        if (body.token) token = body.token;
        if (body.season_number) season = body.season_number;
        if (body.episode_number) episode = body.episode_number;
      } catch (e) {}
    }

    let searchUrl = 'https://api.opensubtitles.com/api/v1/subtitles?languages=' + encodeURIComponent(lang) + '&type=' + encodeURIComponent(type) + '&limit=' + limit;
    if (imdbId) {
      searchUrl += '&imdb_id=' + encodeURIComponent(imdbId);
    } else if (queryStr) {
      searchUrl += '&query=' + encodeURIComponent(queryStr);
    }
    if (season) searchUrl += '&season_number=' + encodeURIComponent(season);
    if (episode) searchUrl += '&episode_number=' + encodeURIComponent(episode);

    try {
      const searchResp = await fetchUrl(searchUrl, {
        headers: {
          'Api-Key': SECRETS.OPENSUBTITLES_API_KEY,
          'Authorization': 'Bearer ' + token,
          'User-Agent': 'DEYMFLIX v1.0'
        }
      });
      jsonResponse(res, searchResp.status, JSON.parse(searchResp.body));
    } catch (e) {
      sendError(res, 502, 'OpenSubtitles search failed: ' + e.message);
    }
    return true;
  }

  // ---- OpenSubtitles Download ----
  if (pathname === '/api/opensubtitles/download') {
    const body = await readBody(req);
    const parsedBody = JSON.parse(body || '{}');
    const dlToken = parsedBody.token || '';
    try {
      const dlResp = await fetchUrl('https://api.opensubtitles.com/api/v1/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': SECRETS.OPENSUBTITLES_API_KEY,
          'Authorization': 'Bearer ' + dlToken,
          'User-Agent': 'DEYMFLIX v1.0'
        },
        body: JSON.stringify({ file_id: parsedBody.file_id })
      });
      if (dlResp.status !== 200) console.warn('[DOWNLOAD] Status:', dlResp.status);
      // Handle non-JSON responses (503 error pages)
      let dlResult;
      try { dlResult = JSON.parse(dlResp.body); } catch (e) {
        dlResult = { status: dlResp.status, message: 'Download limit reached or service unavailable (503). Free tier allows 20 downloads/day.' };
      }
      jsonResponse(res, dlResp.status, dlResult);
    } catch (e) {

      sendError(res, 502, 'OpenSubtitles download failed: ' + e.message);
    }
    return true;
  }

  // ---- Subtitle File Proxy (avoids CORS on subtitle .srt/.vtt files) ----
  if (pathname === '/api/subtitle-proxy') {
    const subUrl = query.url;
    if (!subUrl) return sendError(res, 400, 'Missing url parameter');
    try {
      const subResp = await fetchUrl(subUrl);
      res.writeHead(subResp.status, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      });
      res.end(subResp.body);
    } catch (e) {
      sendError(res, 502, 'Subtitle proxy failed: ' + e.message);
    }
    return true;
  }

  // ---- TMDB Movie Lookup ----
  if (pathname.startsWith('/api/tmdb/movie/')) {
    const movieId = pathname.split('/api/tmdb/movie/')[1];
    if (!movieId) return sendError(res, 400, 'Missing movie ID');

    try {
      const tmdbResp = await fetchUrl(
        'https://api.themoviedb.org/3/movie/' + encodeURIComponent(movieId) + '?api_key=' + SECRETS.TMDB_API_KEY + '&language=en-US'
      );
      if (tmdbResp.status !== 200) console.warn('[TMDB] ID:', movieId, 'Status:', tmdbResp.status);
      jsonResponse(res, tmdbResp.status, JSON.parse(tmdbResp.body));
    } catch (e) {

      sendError(res, 502, 'TMDB lookup failed: ' + e.message);
    }
    return true;
  }

  // ---- TMDB External IDs (for IMDB ID lookup) ----
  if (pathname.startsWith('/api/tmdb/external_ids/')) {
    const movieId = pathname.split('/api/tmdb/external_ids/')[1];
    if (!movieId) return sendError(res, 400, 'Missing movie ID');

    try {
      const tmdbResp = await fetchUrl(
        'https://api.themoviedb.org/3/movie/' + encodeURIComponent(movieId) + '/external_ids?api_key=' + SECRETS.TMDB_API_KEY
      );
      jsonResponse(res, tmdbResp.status, JSON.parse(tmdbResp.body));
    } catch (e) {
      sendError(res, 502, 'TMDB external IDs failed: ' + e.message);
    }
    return true;
  }

  // ---- TMDB Full Details (IMDB id → TMDB details + credits + images) ----
  // /movie/<id> does NOT accept IMDB ids, so resolve it through /find first.
  if (pathname.startsWith('/api/tmdb/details/')) {
    const rawId = decodeURIComponent(pathname.split('/api/tmdb/details/')[1] || '').trim().replace(/\/.*$/, '');
    if (!/^tt\d{5,}$/.test(rawId)) return sendError(res, 400, 'Invalid IMDB ID');
    // Optional title hint (?title=...) helps find movies whose id is unknown/invalid
    const titleHint = String((parsedUrl.query && parsedUrl.query.title) || '').trim();

    try {
      const cached = tmdbCacheGet(rawId);
      if (cached) return jsonResponse(res, 200, cached);

      // 1) TMDB find by IMDB id (needs a valid key)
      let tmdbId = null;
      let keyWorks = false;
      try {
        const found = await fetchUrl(
          'https://api.themoviedb.org/3/find/' + rawId +
          '?api_key=' + SECRETS.TMDB_API_KEY + '&external_source=imdb_id&language=en-US'
        );
        if (found.status === 200) {
          keyWorks = true;
          const fj = JSON.parse(found.body);
          const hit = (fj.movie_results || [])[0] || (fj.tv_results || [])[0];
          if (hit) tmdbId = hit.id;
        } else {
          console.warn('[TMDB] find', rawId, 'status', found.status);
        }
      } catch (e) {}

      // 2) This library stores TMDB ids with a "tt" prefix — try /movie/<digits> directly
      if (!tmdbId && keyWorks) {
        try {
          const direct = await fetchUrl(
            'https://api.themoviedb.org/3/movie/' + rawId.slice(2) +
            '?api_key=' + SECRETS.TMDB_API_KEY + '&language=en-US'
          );
          if (direct.status === 200) {
            const dj = JSON.parse(direct.body);
            if (dj && dj.id) tmdbId = dj.id;
          }
        } catch (e) {}
      }

      // 3) TMDB search by title
      if (!tmdbId && keyWorks && titleHint) {
        try {
          const s = await fetchUrl(
            'https://api.themoviedb.org/3/search/movie?api_key=' + SECRETS.TMDB_API_KEY +
            '&language=en-US&query=' + encodeURIComponent(titleHint)
          );
          if (s.status === 200) {
            const sj = JSON.parse(s.body);
            const first = (sj.results || [])[0];
            if (first) tmdbId = first.id;
          }
        } catch (e) {}
      }

      if (tmdbId) {
        try {
          const det = await fetchUrl(
            'https://api.themoviedb.org/3/movie/' + tmdbId +
            '?api_key=' + SECRETS.TMDB_API_KEY + '&language=en-US&append_to_response=credits,images'
          );
          if (det.status === 200) {
            const j = JSON.parse(det.body);
            const credits = j.credits || {};
            const crew = credits.crew || [];
            const castRaw = credits.cast || [];
            const backdrops = (j.images && j.images.backdrops) || [];

            const payload = {
              found: true,
              source: 'tmdb',
              tmdbId: tmdbId,
              imdbId: rawId,
              title: j.title || '',
              releaseDate: j.release_date || '',
              runtime: j.runtime || 0,
              score: typeof j.vote_average === 'number' ? j.vote_average : 0,
              votes: j.vote_count || 0,
              genres: (j.genres || []).map(function (g) { return g.name; }),
              overview: j.overview || '',
              poster: j.poster_path || '',
              backdrop: j.backdrop_path || '',
              director: crew.filter(function (c) { return c.job === 'Director'; })
                           .map(function (c) { return c.name; }),
              cast: castRaw.slice(0, 12).map(function (c) {
                return { name: c.name || '', character: c.character || '', photo: c.profile_path || '' };
              }),
              stills: backdrops.slice()
                .sort(function (a, b) { return (b.vote_average || 0) - (a.vote_average || 0); })
                .slice(0, 6)
                .map(function (b) { return b.file_path; })
            };

            // Reject a wrong-movie match (e.g. a different film with a similar title)
            if (!titleHint || titlesMatch(titleHint, payload.title)) {
              tmdbCacheSet(rawId, payload);
              return jsonResponse(res, 200, payload);
            }
          }
        } catch (e) {}
      }

      // 4) Key-free fallbacks: Wikidata by IMDB id, then by title
      let alt = null;
      try { alt = await wikidataDetailsForImdb(rawId); } catch (e) {}
      if (alt && titleHint && !titlesMatch(titleHint, alt.title)) alt = null;
      if (!alt && titleHint) {
        try { alt = await wikidataDetailsForTitle(titleHint); } catch (e) {}
      }
      const out = alt || { found: false };
      // Cache only positive results — a failed lookup should retry later
      if (out && out.found) tmdbCacheSet(rawId, out);
      return jsonResponse(res, 200, out);
    } catch (e) {
      sendError(res, 502, 'TMDB details failed: ' + e.message);
    }
    return true;
  }

  return false; // Not a proxy route
}

// ============ MAIN SERVER ============

const ROOT = path.join(__dirname);

const server = http.createServer(async (req, res) => {
  // CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);

  // Handle API proxy routes first
  if (parsedUrl.pathname.startsWith('/api/')) {
    const handled = await handleProxyRoutes(req, res, parsedUrl);
    if (handled) return;
  }

  // Serve static files
  let filePath = parsedUrl.pathname;
  if (filePath === '/') filePath = '/index.html';

  // Decode URI
  try { filePath = decodeURIComponent(filePath); } catch (e) {}

  const fullPath = path.join(ROOT, filePath);

  // Security: prevent directory traversal
  if (!fullPath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // Security: prevent serving server-side files
  const basename = path.basename(fullPath);
  if (basename === 'proxy-server.js' || basename === '.env' || basename === '.env.local') {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(fullPath).toLowerCase();
  const ct = MIME[ext] || 'application/octet-stream';

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found: ' + filePath);
      return;
    }
    res.writeHead(200, {
      'Content-Type': ct,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  });
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log('========================================');
  console.log('  DEYMFLIX Proxy Server');
  console.log('  Running at http://localhost:' + PORT);
  console.log('  API keys are server-side only');
  console.log('========================================');
});
