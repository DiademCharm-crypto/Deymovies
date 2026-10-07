#!/usr/bin/env node
// ══ _player_lite.cjs — the app's LIGHT player page ═════════════════════════
// Why this exists
// ---------------
// In the app, tapping a title used to load player.html inside the site WebView.
// That page pulls the whole website shell with it: app.js (645 KB — and it
// boots every homepage row and grid on load), the three catalog files
// (filipino/kdrama/chinese, 128 KB), the three episode files (147 KB),
// watch-party (43 KB) and the halloween theme (17 KB). The player itself only
// needs a catalog to resolve ONE id, the episode list of THAT series and a
// "more like this" rail — so nearly all of that work was wasted, and it ran
// before the first frame on every single title tap.
//
// What it generates
// -----------------
//   play-index.js     the catalog data the player reads (movies, featuredMovies,
//                     seriesData) plus the two app.js helpers the player calls
//                     (sanitizeHTML, cleanDriveLink) — one file instead of eight.
//   player-lite.html  player.html with the site shell taken out. Every line of
//                     the player's own markup/CSS/script is copied verbatim:
//                     only <script>/<link>/<meta> tags change, hls.js becomes an
//                     on-demand load, and the app flag app.js used to set is set
//                     inline. If an anchor below stops matching, this tool fails
//                     loudly instead of shipping a half-stripped page.
//
// Run:  node _tools/_player_lite.cjs
// Then: deploy play-index.js + player-lite.html (see _deploy.cjs) and bump the
//       service worker cache name so devices pick the new page up.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const write = (f, s) => {
  fs.writeFileSync(path.join(ROOT, f), s, 'utf8');
  console.log('  ' + f.padEnd(20) + String(s.length).padStart(8) + ' bytes');
};

let failed = 0;
function die(msg) {
  console.error('  !! ' + msg);
  failed++;
}

// ── pick a `const NAME = [ ... ]` literal out of a source file (string aware) ─
function literal(src, name, file) {
  const i = src.indexOf('const ' + name + ' = [');
  if (i < 0) { die('literal "' + name + '" not found in ' + file); return null; }
  const start = src.indexOf('[', i);
  let depth = 0, str = null, out = '';
  for (let p = start; p < src.length; p++) {
    const c = src[p];
    out += c;
    if (str) {
      if (c === '\\') { out += src[++p]; continue; }
      if (c === str) str = null;
      continue;
    }
    if (c === '"' || c === "'") { str = c; continue; }
    if (c === '[' || c === '{' || c === '(') depth++;
    else if (c === ']' || c === '}' || c === ')') { depth--; if (depth === 0) break; }
  }
  return out;
}

// ── text between two markers (inclusive of the first, exclusive of the last) ──
function between(src, from, to, what) {
  const a = src.indexOf(from);
  if (a < 0) { die('anchor not found (' + what + '): ' + JSON.stringify(from.slice(0, 60))); return null; }
  const b = src.indexOf(to, a);
  if (b < 0) { die('end anchor not found (' + what + ')'); return null; }
  return src.slice(a, b);
}

// ── text from a marker to the end of the file ─────────────────────────────
function after(src, marker, what) {
  const i = src.indexOf(marker);
  if (i < 0) { die('anchor not found (' + what + ')'); return ''; }
  return src.slice(i);
}

// ── text from a marker up to the start of the first line containing another ──
function untilLine(src, fromMarker, lineMarker, what) {
  const a = src.indexOf(fromMarker);
  if (a < 0) { die('anchor not found (' + what + ')'); return ''; }
  const b = src.indexOf(lineMarker, a);
  if (b < 0) { die('end anchor not found (' + what + ')'); return ''; }
  // cut before the comment block that introduces that marker
  const cut = src.lastIndexOf('\n/*', b);
  return src.slice(a, cut < a ? src.lastIndexOf('\n', b) + 1 : cut + 1);
}

function evaluate(code, name) {
  // The catalog files are plain data; running them in a bare function keeps
  // this tool free of a DOM stub.
  const fn = new Function('return (' + code + ');');
  const v = fn();
  if (!Array.isArray(v)) die(name + ' is not an array');
  return v;
}

console.log('DEYMFLIX player-lite build');

// ══════════════════════════════════════════════════════════════════════════
// 1) play-index.js
// ══════════════════════════════════════════════════════════════════════════
const app = read('app.js');

const filipino = evaluate(literal(read('filipino-movies.js'), 'filipinoMovieData', 'filipino-movies.js'), 'filipinoMovieData');
const kdrama = evaluate(literal(read('kdramas.js'), 'kdramaData', 'kdramas.js'), 'kdramaData');
const chinese = evaluate(literal(read('chinese-movies.js'), 'chineseMovieData', 'chinese-movies.js'), 'chineseMovieData');
const featured = evaluate(literal(app, 'featuredMovies', 'app.js'), 'featuredMovies');
const episodesSeries = evaluate(literal(read('episodes.js'), 'seriesData', 'episodes.js'), 'seriesData');
const kdramaSeries = evaluate(literal(read('kdrama-episode.js'), 'kdramaSeriesData', 'kdrama-episode.js'), 'kdramaSeriesData');
const chineseSeries = evaluate(literal(read('chinese-series.js'), 'chineseSeriesData', 'chinese-series.js'), 'chineseSeriesData');

// `movies` in app.js spreads the three catalog arrays at runtime; do the same
// here. The spread lines are removed by exact text (never a regex — a synopsis
// containing "..." could otherwise be cut in half).
let moviesSrc = literal(app, 'movies', 'app.js');
for (const name of ['filipinoMovieData', 'kdramaData', 'chineseMovieData']) {
  const spread = '  ...((typeof ' + name + ' !== "undefined") ? ' + name + ' : []),\n';
  if (moviesSrc.indexOf(spread) < 0) { die('movies spread line missing: ' + name); continue; }
  moviesSrc = moviesSrc.replace(spread, '');
}
const movies = evaluate(moviesSrc, 'movies').concat(filipino, kdrama, chinese);

// seriesData is built the same way the page builds it: episodes.js first, then
// kdrama-episode.js and chinese-series.js merge themselves in (push when the id
// is new).
const seriesData = episodesSeries.slice();
for (const extra of [kdramaSeries, chineseSeries]) {
  for (const s of extra) if (!seriesData.some(x => x.id === s.id)) seriesData.push(s);
}

// The player never reads `backdrop` (that is the site's hero/grid artwork), and
// it is ~85 bytes on 900 records — drop it to keep the payload small.
function lean(list) {
  return list.map(m => {
    const c = {};
    for (const k of Object.keys(m)) if (k !== 'backdrop') c[k] = m[k];
    return c;
  });
}

const helpers = between(app, '// Security Utility: Sanitize user inputs', '// ── HERO FEATURED',
                        'sanitizeHTML/cleanDriveLink helpers').trim();

// app.js's app-mode block is what gives the player page its Download button:
// it builds window.requestMovieDownload, injects <button id="download-btn">
// into the title row and hands the stream to the native bridge. With app.js
// gone, this block is the lite page's only source for it.
const appMode = untilLine(app, '// The Sketchware app identifies itself by appending',
                          'HOME POLISH', 'app-mode block').trim();

// episodes.js is half data, half DOM: it injects the episodes grid under the
// video info and owns playEpisodeSource(), which the player itself calls (the
// Episodes panel and "next episode" both go through it by name). Its DOM half
// only reads seriesData, so it is copied verbatim after the data here.
const episodeDom = after(read('episodes.js'), "document.addEventListener('DOMContentLoaded'",
                         'episodes.js DOM half');

const rows = m => JSON.stringify(m);
const indexJs =
  '// ══ play-index.js — GENERATED by _tools/_player_lite.cjs, do not edit ══\n' +
  '// The catalog data player-lite.html needs, in the order the real page used to\n' +
  '// get it (catalog files, then app.js, then the episode files). Same shapes,\n' +
  '// same field names as app.js so the player\'s own code needs no changes.\n' +
  '// Movies: ' + movies.length + '  Featured: ' + featured.length + '  Series: ' + seriesData.length + '\n' +
  '/* eslint-disable */\n' +
  'const filipinoMovieData = ' + rows(lean(filipino)) + ';\n' +
  'const kdramaData = ' + rows(lean(kdrama)) + ';\n' +
  'const chineseMovieData = ' + rows(lean(chinese)) + ';\n' +
  'const featuredMovies = ' + rows(lean(featured)) + ';\n' +
  'const movies = ' + rows(lean(movies)) + ';\n' +
  'const seriesData = ' + rows(seriesData) + ';\n\n' +
  helpers + '\n\n' +
  '// ── episodes.js DOM half (episodes grid + playEpisodeSource), verbatim ──\n' +
  episodeDom + '\n\n' +
  '// ── app.js app-mode block (Download button + requestMovieDownload) ──\n' +
  appMode + '\n';

// ══════════════════════════════════════════════════════════════════════════
// 2) player-lite.html
// ══════════════════════════════════════════════════════════════════════════
let html = read('player.html');
const replace = (from, to, what) => {
  if (html.indexOf(from) < 0) { die('html anchor missing (' + what + ')'); return; }
  html = html.split(from).join(to);
};

// Same contract as replace(), for anchors whose text pins a cache-buster that
// changes on nearly every deploy (?v=…). Those must never be literal here —
// bumping app.js?v= in player.html silently broke this whole build once.
const replaceRe = (re, to, what) => {
  if (!re.test(html)) { die('html anchor missing (' + what + ')'); return; }
  html = html.replace(re, to);
};

// -- styles / seasonal theme / watch party ---------------------------------
replace(
  '  <!-- WATCH PARTY (rooms + voice + sync). Mounted inside #playerContainer so\n' +
  '       the panel and mic dock stay usable with the movie in fullscreen. -->\n' +
  '  <link rel="stylesheet" href="watch-party.css?v=1.4">\n' +
  '  <!-- HALLOWEEN THEME (seasonal, colour only — the player is never decorated). -->\n' +
  '  <link rel="stylesheet" href="halloween.css?v=1.3">\n' +
  '  <script src="halloween.js?v=1.3" defer></script>\n',
  '  <!-- LIGHT APP PLAYER: no watch party, no seasonal theme. The native\n' +
  '       PlayerActivity draws the app bar above this page. -->\n',
  'watch-party + halloween tags');

// -- data + site shell scripts --------------------------------------------
replace(
  '  <script src="config.js?v=2.0"></script>\n' +
  '  <script src="tv.js?v=1.1" defer></script>\n',
  '  <script src="config.js?v=2.0"></script>\n' +
  '  <!-- The app player\'s own catalog: instead of app.js + 8 catalog/episode\n' +
  '       files, one data file (see _tools/_player_lite.cjs). -->\n' +
  '  <script src="play-index.js?v=1.0"></script>\n',
  'config/tv + play-index');

replace(
  '  <script>\n' +
  "    // Backend base: '' = same origin; or full URL of the host running proxy-server.js\n" +
  '    // (set window.__DEYMFLIX_CONFIG__.API_BASE in config.js for static hosting).\n' +
  '    window.__API_BASE__ = (function () {\n' +
  "      try { return (window.__DEYMFLIX_CONFIG__ && window.__DEYMFLIX_CONFIG__.API_BASE) || ''; }\n" +
  "      catch (e) { return ''; }\n" +
  '    })();\n' +
  '  </script>\n',
  '  <script>\n' +
  "    // Backend base: '' = same origin; or full URL of the host running proxy-server.js\n" +
  '    // (set window.__DEYMFLIX_CONFIG__.API_BASE in config.js for static hosting).\n' +
  '    window.__API_BASE__ = (function () {\n' +
  "      try { return (window.__DEYMFLIX_CONFIG__ && window.__DEYMFLIX_CONFIG__.API_BASE) || ''; }\n" +
  "      catch (e) { return ''; }\n" +
  '    })();\n' +
  '    // app.js normally sets this; it is not loaded here, so read the shell out\n' +
  '    // of the user agent exactly like app.js does.\n' +
  "    window.DFX_IS_APP = /DeymflixApp/i.test(navigator.userAgent || '');\n" +
  '  </script>\n',
  'app flag');

replace(
  '    <script src="https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js"></script>\n',
  '    <!-- hls.js is 125 KB that only HLS playlists need — attachHls() loads it\n' +
  '         on demand now (see the patch below). -->\n',
  'hls.js tag');

replace(
  '<script src="security.js?v=2.1"></script>\n' +
  '    <script src="filipino-movies.js?v=1.7"></script>\n' +
  '    <script src="kdramas.js?v=1.2"></script>\n' +
  '    <script src="chinese-movies.js?v=1.0"></script>\n',
  '<script src="security.js?v=2.1"></script>\n',
  'catalog tags');

replaceRe(
  new RegExp(
    '  <script src="app\\.js\\?v=[\\d.]+\"></script>\\r?\\n' +
    '  <script src="episodes\\.js\\?v=[\\d.]+\"></script>\\r?\\n' +
    '  <script src="kdrama-episode\\.js\\?v=[\\d.]+\"></script>\\r?\\n' +
    '  <script src="chinese-series\\.js\\?v=[\\d.]+\"></script>\\r?\\n' +
    '  <script src="watch-party\\.js\\?v=[\\d.]+\" defer></script>\\r?\\n'
  ),
  '',
  'app.js / episode / watch-party tags');

// -- robots: this copy is the app's, not a public page ---------------------
replace(
  '<meta name="twitter:card" content="summary_large_image">',
  '<meta name="twitter:card" content="summary_large_image">\n' +
  '  <meta name="robots" content="noindex">',
  'robots meta');

// -- hls.js on demand -----------------------------------------------------
replace(
  '      if (!window.Hls || !window.Hls.isSupported()) {\n' +
  '        // No MSE and no native HLS: keep direct file if we have one\n' +
  '        hlsDirectFallback = hlsDirectFallback || hlsUrlCurrent;\n' +
  '        hlsActive = false;\n' +
  '        return false;\n' +
  '      }\n',
  '      if (!window.Hls) {\n' +
  '        // LIGHT APP PLAYER: hls.js used to be a blocking <script> in the head\n' +
  '        // (125 KB on every title open, even for the direct files most titles\n' +
  '        // use). It is fetched the first time a playlist is actually played.\n' +
  '        if (window.MediaSource && !window.HlsLoading && !window.HlsGaveUp) {\n' +
  '          window.HlsLoading = true;\n' +
  '          hlsActive = true;\n' +
  '          const lib = document.createElement(\'script\');\n' +
  '          lib.src = \'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js\';\n' +
  '          lib.onload = function () {\n' +
  '            window.HlsLoading = false;\n' +
  '            try { attachHls(playlistUrl, directUrl); } catch (e) { playHlsFallback(); }\n' +
  '          };\n' +
  '          lib.onerror = function () {\n' +
  '            window.HlsLoading = false;\n' +
  '            window.HlsGaveUp = true;\n' +
  '            hlsDirectFallback = hlsDirectFallback || hlsUrlCurrent;\n' +
  '            hlsActive = false;\n' +
  '            playHlsFallback();\n' +
  '          };\n' +
  '          document.head.appendChild(lib);\n' +
  '          return true;\n' +
  '        }\n' +
  '        // No MSE at all: keep the direct file if we have one\n' +
  '        hlsDirectFallback = hlsDirectFallback || hlsUrlCurrent;\n' +
  '        hlsActive = false;\n' +
  '        return false;\n' +
  '      }\n' +
  '      if (!window.Hls.isSupported()) {\n' +
  '        // No MSE and no native HLS: keep direct file if we have one\n' +
  '        hlsDirectFallback = hlsDirectFallback || hlsUrlCurrent;\n' +
  '        hlsActive = false;\n' +
  '        return false;\n' +
  '      }\n',
  'lazy hls.js');

if (failed) {
  console.error('\n' + failed + ' anchor(s) missing — nothing was written. Update this tool first.');
  process.exit(1);
}

write('play-index.js', indexJs);
write('player-lite.html', html);
console.log('\nok — ' + movies.length + ' movies, ' + seriesData.length + ' series');
