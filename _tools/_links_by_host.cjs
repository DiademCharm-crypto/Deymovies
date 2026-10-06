#!/usr/bin/env node
// ===========================================================================
//  _tools/_links_by_host.cjs
// ===========================================================================
//  Reads the whole catalog (app.js "movies" + "featuredMovies", plus the
//  filipino / kdrama / chinese data files and their episode lists) and groups
//  every playable link by its HOST, so it is obvious at a glance which titles
//  still point at the CDN account that is not paid (deymflix-*.b-cdn.net) and
//  which already point at Backblaze B2 (deymflix01.s3.*.backblazeb2.com).
//
//  Usage:
//    node _tools/_links_by_host.cjs                 # summary + grouped list
//    node _tools/_links_by_host.cjs --host b-cdn     # only that host
//    node _tools/_links_by_host.cjs --json           # machine-readable
//    node _tools/_links_by_host.cjs --out file.md    # write the report
//    node _tools/_links_by_host.cjs --probe          # + HTTP status per host
// ===========================================================================
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const argv = process.argv.slice(2);
const JSON_OUT = argv.includes('--json');
const hostFilter = (() => {
  const i = argv.indexOf('--host');
  return i >= 0 && argv[i + 1] ? argv[i + 1].toLowerCase() : null;
})();
const outIdx = argv.indexOf('--out');
const OUT = outIdx >= 0 && argv[outIdx + 1] ? path.resolve(ROOT, argv[outIdx + 1]) : null;
const PROBE = argv.includes('--probe');

// Ask the host for the first kilobyte of one of its files. 403/404 means the
// account behind it is suspended (unpaid) or the file moved; 200/206 means it
// is really serving bytes.
function probeHost(h, sampleUrl) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (r) => { if (!done) { done = true; resolve(r); } };
    try {
      const https = require('https');
      const req = https.request({
        method: 'GET', host: h, path: sampleUrl.replace(/^https?:\/\/[^/]+/, ''),
        headers: { Range: 'bytes=0-1023', 'User-Agent': 'DeymflixLinkAudit/1.0' },
        timeout: 12000,
      }, (res) => {
        res.resume();
        finish({ host: h, status: res.statusCode });
      });
      req.on('timeout', () => { req.destroy(); finish({ host: h, status: 'timeout' }); });
      req.on('error', (e) => finish({ host: h, status: 'error', err: e.message }));
      req.end();
    } catch (e) { finish({ host: h, status: 'error', err: e.message }); }
  });
}

async function probeAll() {
  const rows = [];
  for (const [h, v] of ordered) rows.push(await probeHost(h, v[0].url));
  return rows;
}

function read(f) {
  try { return fs.readFileSync(path.join(ROOT, f), 'utf8'); }
  catch (e) { return ''; }
}

// ── 1. pull the data files into one sandbox so the spreads in app.js resolve ─
const dataFiles = [
  'filipino-movies.js', 'kdramas.js', 'chinese-movies.js',
  'chinese-series.js', 'kdrama-episode.js', 'episodes.js', 'reels-data.js',
];
const noop = () => { };
const fakeEl = () => ({
  style: {}, className: '', innerHTML: '', textContent: '', value: '', dataset: {},
  classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
  addEventListener: noop, removeEventListener: noop, appendChild: noop,
  setAttribute: noop, getAttribute: () => null, querySelector: () => null,
  querySelectorAll: () => [], getElementsByTagName: () => [], remove: noop,
  focus: noop, click: noop, insertAdjacentHTML: noop, closest: () => null,
  getBoundingClientRect: () => ({ top: 0, left: 0, width: 0, height: 0 }),
});
const fakeDoc = {
  readyState: 'complete',
  addEventListener: noop, removeEventListener: noop,
  getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
  getElementsByClassName: () => [], getElementsByTagName: () => [],
  createElement: fakeEl, createDocumentFragment: fakeEl,
  head: fakeEl(), body: fakeEl(), documentElement: fakeEl(),
  cookie: '', hidden: false, visibilityState: 'visible',
};
const sandbox = {
  console, document: fakeDoc,
  window: { addEventListener: noop, removeEventListener: noop, matchMedia: () => ({ matches: false, addEventListener: noop, addListener: noop }), localStorage: { getItem: () => null, setItem: noop, removeItem: noop }, location: { href: '', search: '', pathname: '/' } },
  localStorage: { getItem: () => null, setItem: noop, removeItem: noop },
  navigator: { userAgent: 'node', serviceWorker: undefined },
  location: { href: '', search: '', pathname: '/', origin: 'https://deymflix.eu.cc' },
  setTimeout, clearTimeout, setInterval, clearInterval, fetch: () => Promise.resolve({}),
};
sandbox.window.document = fakeDoc;
sandbox.window.window = sandbox.window;
sandbox.window.localStorage = sandbox.localStorage;
sandbox.window.location = sandbox.location;
vm.createContext(sandbox);
for (const f of dataFiles) {
  let src = read(f);
  if (!src) continue;
  // top-level `const` lives in the script's lexical scope, which vm throws
  // away after each run -- rewrite it to `var` so the array becomes a real
  // global we can read back (and so app.js's spreads can see it).
  src = src.replace(/^const[ \t]+/gm, 'var ');
  try { vm.runInContext(src, sandbox, { filename: f }); }
  catch (e) {
    // files that mix data with DOM code still leave their arrays assigned
    console.error('[note] ' + f + ' ran until: ' + e.message);
  }
}

// ── 2. lift the movies / featuredMovies literals straight out of app.js ─────
const appSrc = read('app.js');

function arrayLiteral(name) {
  const start = appSrc.indexOf('const ' + name + ' = [');
  if (start < 0) return null;
  const open = appSrc.indexOf('[', start);
  let depth = 0, inStr = null, esc = false;
  for (let i = open; i < appSrc.length; i++) {
    const c = appSrc[i];
    if (esc) { esc = false; continue; }
    if (inStr) {
      if (c === '\\') { esc = true; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '[') depth++;
    else if (c === ']') { depth--; if (depth === 0) return appSrc.slice(open, i + 1); }
  }
  return null;
}

const catalog = [];
function addAll(arr, kind) {
  if (!Array.isArray(arr)) return;
  for (const it of arr) if (it && (it.id || it.title)) catalog.push({ item: it, kind });
}

try {
  const lit = arrayLiteral('movies');
  if (lit) addAll(vm.runInContext('(' + lit + ')', sandbox), 'movie');
  else console.error('[warn] could not lift "movies" from app.js');
} catch (e) { console.error('[warn] movies: ' + e.message); }

try {
  const lit = arrayLiteral('featuredMovies');
  if (lit) addAll(vm.runInContext('(' + lit + ')', sandbox), 'featured');
} catch (e) { console.error('[warn] featuredMovies: ' + e.message); }

// every array the data files defined still deserves a scan (k-drama and
// chinese episode lists, the Filipino/English series list, the AI reels...)
const SEEN_ARRAYS = new Set(['movies', 'featuredMovies']);
const DATA_ARRAYS = [];
for (const name of Object.keys(sandbox)) {
  if (SEEN_ARRAYS.has(name)) continue;
  const arr = sandbox[name];
  if (Array.isArray(arr) && arr.length) { DATA_ARRAYS.push(name); addAll(arr, 'data:' + name); }
}

// ── 3. walk every object for anything that looks like a media URL ──────────
const HOST_RE = /^([a-z0-9.-]+)(:\d+)?$/i;
function hostOf(u) {
  try {
    const m = String(u).match(/^https?:\/\/([^/?#]+)/i);
    if (!m) return null;
    const h = m[1].toLowerCase();
    return HOST_RE.test(h) ? h.replace(/:\d+$/, '') : h;
  } catch (e) { return null; }
}
// keys that carry the playable/downloadable media (not posters/trailers)
const LINKISH_KEYS = /(embed|url|src|file|link|source|download|video|stream)/i;
// Keys that can only ever hold artwork or a promo clip -- never the thing the
// user actually plays or downloads. Their hosts (tmdb, youtube, image CDNs...)
// must not show up as "our" media hosts.
const IMAGE_KEYS = /^(poster|backdrop|image|thumb|thumbnail|cover|logo|avatar|photo|trailer|trailerEmbed|videoThumb)/i;
// Pure plumbing: a contact form endpoint, our own site, loopback.
const IGNORE_HOST = /(web3forms\.com|deymflix\.eu\.cc|^localhost$|^127\.0\.0\.1$)/i;

const groups = new Map();   // host -> [{title,id,kind,key,url}]
const otherLinks = [];

function walk(node, meta, visit) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) { for (const v of node) walk(v, meta, visit); return; }
  for (const k of Object.keys(node)) {
    const v = node[k];
    if (typeof v === 'string' && /^https?:\/\//i.test(v)) visit(k, v, node);
    else if (v && typeof v === 'object') walk(v, meta, visit);
  }
}

for (const { item, kind } of catalog) {
  const title = item.title || item.name || item.id || '(untitled)';
  const id = item.id || item.slug || '';
  walk(item, null, (key, url) => {
    const h = hostOf(url);
    if (!h) return;
    if (IGNORE_HOST.test(h)) return;
    if (IMAGE_KEYS.test(key)) return;
    if (!LINKISH_KEYS.test(key)) return;
    const rec = { title, id, kind, key, url, host: h };
    if (!groups.has(h)) groups.set(h, []);
    groups.get(h).push(rec);
  });
}

// ── 4. report ─────────────────────────────────────────────────────────────
const BACKBLAZE = /backblazeb2\.com$/i;
const CDN = /\.b-cdn\.net$/i;

function label(h) {
  if (BACKBLAZE.test(h)) return 'BACKBLAZE (paid / working)';
  if (CDN.test(h)) return 'CDN -- b-cdn.net (the unpaid account)';
  if (/(youtube|youtu\.be|ytimg)/i.test(h)) return 'youtube (trailer only)';
  if (/(themoviedb|tmdb|media-amazon|mydramalist|gstatic|googleusercontent|dmcdn|anyshort|farsunpteltd|nsstorage|placeholder)/i.test(h)) return 'artwork / promo (not the play link)';
  return 'OTHER -- embed or third-party host (not Cloudflare, not Backblaze)';
}

const ordered = [...groups.entries()]
  .filter(([h]) => !hostFilter || h.includes(hostFilter))
  .sort((a, b) => b[1].length - a[1].length);

const cdnTitles = [...new Set(ordered.filter(([h]) => CDN.test(h))
  .flatMap(([, v]) => v.map(r => r.title)))];
const b2Titles = [...new Set(ordered.filter(([h]) => BACKBLAZE.test(h))
  .flatMap(([, v]) => v.map(r => r.title)))];

if (JSON_OUT) {
  const out = {
    totals: {
      titles_scanned: catalog.length,
      hosts: ordered.length,
      links: ordered.reduce((n, [, v]) => n + v.length, 0),
    },
    hosts: ordered.map(([h, v]) => ({
      host: h, group: label(h), count: v.length,
      titles: v.map(r => r.title),
      links: v,
    })),
  };
  out.totals.titles_on_unpaid_cdn = cdnTitles.length;
  out.totals.titles_on_backblaze = b2Titles.length;
  out.totals.unpaid_cdn_titles = cdnTitles;
  process.stdout.write(JSON.stringify(out, null, 2) + '\n');
  process.exit(0);
}

const say = (s) => console.log(s);

(async function main() {
const probes = PROBE ? await probeAll() : null;
const probeOf = (h) => {
  if (!probes) return '';
  const p = probes.find(r => r.host === h);
  return p ? String(p.status) : '?';
};

say('');
say('===============================================================');
say(' DEYMFLIX -- playable links grouped by host');
say('===============================================================');
say(' titles scanned : ' + catalog.length);
say(' distinct hosts : ' + groups.size);
say(' on the unpaid CDN : ' + cdnTitles.length + ' titles');
say(' already on Backblaze : ' + b2Titles.length + ' titles');
say('');

// console view: hosts + a taste of the titles
for (const [h, v] of ordered) {
  const titles = [...new Set(v.map(r => r.title))];
  say('---------------------------------------------------------------');
  say(' ' + h + '   --   ' + label(h) + (probes ? '   HTTP ' + probeOf(h) : ''));
  say('   links: ' + v.length + '   titles: ' + titles.length);
  for (const t of titles.slice(0, 40)) say('     - ' + t);
  if (titles.length > 40) say('     ... +' + (titles.length - 40) + ' more');
}
say('---------------------------------------------------------------');

// markdown report for the owner
if (OUT) {
  const md = [];
  md.push('# DEYMFLIX -- titles whose links are NOT on Backblaze B2');
  md.push('');
  md.push('Generated ' + new Date().toISOString().slice(0, 10) + ' by `_tools/_links_by_host.cjs`.');
  md.push('');
  md.push('These are the titles whose playable/downloadable link still points at the');
  md.push('CDN account that is not paid (`*.b-cdn.net`), so they error out until the');
  md.push('balance is settled or the link is moved to Backblaze B2');
  md.push('(`deymflix01.s3.us-east-005.backblazeb2.com`).');
  md.push('');
  md.push('- titles on the unpaid CDN: **' + cdnTitles.length + '**');
  md.push('- titles already on Backblaze: **' + b2Titles.length + '**');
  md.push('');
  if (probes) {
    md.push('## Live check (first 1 KB of one file per host)');
    md.push('');
    md.push('| Host | Result | Meaning |');
    md.push('|------|--------|---------|');
    for (const p of probes) {
      const ok = p.status === 200 || p.status === 206;
      md.push('| `' + p.host + '` | ' + p.status + (p.err ? ' (' + p.err + ')' : '') + ' | '
        + (ok ? 'serving bytes' : 'not serving -- account suspended/unpaid') + ' |');
    }
    md.push('');
  }
  md.push('| # | Title | Host | Kind | Key |');
  md.push('|---|-------|------|------|-----|');
  let n = 0;
  for (const [h, v] of ordered) {
    if (!CDN.test(h)) continue;
    for (const r of v) {
      n++;
      md.push('| ' + n + ' | ' + r.title + ' | `' + h + '` | ' + r.kind + ' | ' + r.key + ' |');
    }
  }
  md.push('');
  md.push('## Already on Backblaze (working)');
  md.push('');
  {
    const seen = new Set();
    for (const [h, v] of ordered) {
      if (!BACKBLAZE.test(h)) continue;
      for (const r of v) {
        if (seen.has(r.title)) continue;
        seen.add(r.title);
        md.push('- ' + r.title + '  --  ' + r.key + '  --  `' + r.url.slice(0, 110) + '`');
      }
    }
  }
  md.push('');
  md.push('## Every other host (neither Cloudflare nor Backblaze)');
  md.push('');
  md.push('These titles are not affected by the unpaid balance, but their play link');
  md.push('does not come from Backblaze either -- mostly third-party embed players.');
  md.push('');
  {
    let any = false;
    for (const [h, v] of ordered) {
      if (CDN.test(h) || BACKBLAZE.test(h) || /artwork \/ promo/.test(label(h)) || /trailer only/.test(label(h))) continue;
      any = true;
      md.push('| Title | Host | Key |');
      md.push('|-------|------|-----|');
      const seen = new Set();
      for (const r of v) {
        if (seen.has(r.title + r.key)) continue;
        seen.add(r.title + r.key);
        md.push('| ' + r.title + ' | `' + h + '` | ' + r.key + ' |');
      }
      md.push('');
    }
    if (!any) md.push('(none)');
  }
  md.push('');
  fs.writeFileSync(OUT, md.join('\n'), 'utf8');
  console.log('\nwrote ' + OUT);
}
})();
