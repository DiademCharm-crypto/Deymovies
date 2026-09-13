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
  TMDB_API_KEY: '15d260044e350723365198253b23914f',
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
}

function sendError(res, status, message) {
  jsonResponse(res, status, { error: message });
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
      } catch (e) {}
    }

    let searchUrl = 'https://api.opensubtitles.com/api/v1/subtitles?languages=' + encodeURIComponent(lang) + '&type=' + encodeURIComponent(type) + '&limit=' + limit;
    if (imdbId) {
      searchUrl += '&imdb_id=' + encodeURIComponent(imdbId);
    } else if (queryStr) {
      searchUrl += '&query=' + encodeURIComponent(queryStr);
    }

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
      let parsedBody;
      try { parsedBody = JSON.parse(dlResp.body); } catch (e) {
        parsedBody = { status: dlResp.status, message: 'Download limit reached or service unavailable (503). Free tier allows 20 downloads/day.' };
      }
      jsonResponse(res, dlResp.status, parsedBody);
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
