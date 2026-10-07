// DEYMFLIX service worker — offline shell + smart caching
// Strategy:
//   * app shell (index/player/style/app js): network-first, fall back to cache
//   * posters/images: cache-first (they never change per versioned URL)
//   * everything else (APIs, streams): network only — never cache video
// v2: force every visitor's old cache to be deleted on activate — the cache-first
// icon/svg strategy was serving the OLD logo (favicon.svg never changes URL).
// v3: precache with {cache:'reload'} so the browser HTTP cache can never feed
// stale logo/icon bytes into the install, and pages now reference the logo with
// ?v=2 so even a stale HTTP/favicons cache gets bypassed on every device.
// v4: halloween theme (halloween.css + halloween.js + the seasonal
// logo/favicon) added to the shell so offline still looks like the season.
// v5: the halloween mark was redrawn (brand mark + seasonal guests), so the
// cached copies have to go — bumping the cache name is what evicts them.
// v6: wordmark back to brand red (FLIX) in the seasonal logo + share card.
// v7: series episode resolver — episodes.js changed (reload reopens the exact
// episode, the grid can never highlight a different one than the one playing).
// v8: episode-aware Continue Watching cards (app.js), resume toast + real
// autoplay next episode (player.html), actionable-toast styling (style.css).
// v9: TV mode (tv.js) only takes over keys on D-pad hardware now — PCs keep
// arrow scrolling/seeking and Backspace; player shortcuts ignore Ctrl/Alt/Cmd.
// v10: spider-web corner art removed; touch devices composite the fixed bars
// instead of live-blurring them (Android scroll fix in theme-v2.css); phones
// pick smaller poster sizes (app.js srcset); developer card reworded.
// v11: Chinese movies & series (chinese-movies.js + chinese-series.js), CW
// season progress, NEW EP badges, history shows the furthest episode.
// v13: owner stats dashboard (stats.html + stats.js). Updates now apply
// immediately: the page asks this worker to skipWaiting on update, and
// controllerchange reloads once — no manual hard-refresh required.
// v14: hover-preview trailers play clean (YouTube chrome cropped away), the
// stats dashboard is owner-gated by the database rules (token) with a realtime
// stream, and a visible in-app notice announces a downloaded update.
// v19: app-only Me screen (apponly.js v1.2) (me.html + apponly.js), app Download settings and
// the app-side Watch Party mic permission; watch-party.js asks the shell for
// the microphone before getUserMedia.
// v15: Watch Party — rooms + peer-to-peer voice with a mute/unmute mic and
// host-driven playback sync, with the panel and mic dock living inside the
// fullscreen element so they stay usable in fullscreen.
// v22: the app's Me screen gained the profile editor, Manage Account, Account
// and Security (device list) and the 6-digit verification code -- me.html now
// loads me.css, and apponly.js is at v2.0 on every page that includes it.
// v23: the app's Me screen lost its dock (native back arrow instead), Continue
// Watching is a plain poster strip (posters looked up from the catalogs) and
// Sign Out moved under Manage Account -- apponly.js is at v2.3 on every page.
// v24: posters.json (the Me screen's title -> poster map, 1032 titles) joins the
// offline shell, and apponly.js is at v2.7 on every page -- Continue Watching
// posters are revealed once loaded, and a record whose name/address was stored
// as the TEXT "null" is repaired instead of shown.
// v25: the sign-in slot's empty answer (the TEXT "null" on older shells) can no
// longer be taken for a picked Google address -- it used to create an account
// literally named "null". apponly.js is at v2.8 on every page.
// v26: every successful sign-in is written to the owner's Firebase database
// (signins/users + signins/events) and shows up in stats.html -- apponly.js is
// at v2.9 and analytics.js at v1.1 on every page that loads them.
// v27: the app opens titles in PlayerActivity now -- a native bar ("<" + title)
// over player-lite.html, the player page stripped of app.js/catalogs/watch-party
// (its data lives in play-index.js), and app.js got its missing DL_ICON back so
// the player's Download button works again in the app.
// v28: analytics + sign-in writes never actually left the device: the JSON
// content type made every beacon a PREFLIGHTED request, and the database
// refuses the preflight of a credentialed one -- so the owner's stats and the
// new sign-in log stayed empty.
// v29: the write path is one keepalive fetch with a CORS-simple text/plain
// body. sendBeacon could only POST, and a POST to /analytics/.json pushes a
// generated child key instead of merging the counters (verified on the live
// database: the data landed, just in a shape the dashboard never reads).
// analytics.js is v1.3 on every page that loads it.
// v30: the player screen has no native header any more -- r22 drew a "<" bar
// with the title above the WebView, which duplicated the player's own top bar
// and stole the first ~90px of the video. The page fills the screen now, and
// its own back control finishes the player activity (bridge closePlayer).
// v31: a wrong-folder upload replaced index.html/style.css/app.js with another
// app's files, so any client that loaded the site in that window cached the
// wrong shell under deymflix-v30. Changing the cache name deletes it on the
// next activate, which is the only way to purge it -- the URLs are the same.
const CACHE = 'deymflix-v31';
const SHELL = [
  'index.html',
  'player.html',
  'player-lite.html',
  'play-index.js',
  'style.css',
  'theme-v2.css',
  'halloween.css',
  'halloween.js',
  'favicon-halloween.svg',
  'icons/deymflix-logo-halloween.svg',
  'icons/apple-touch-icon-halloween.png',
  'icons/share-card-halloween.png',
  'app.js',
  'analytics.js',
  'episodes.js',
  'kdrama-episode.js',
  'chinese-movies.js',
  'chinese-series.js',
  'stats.html',
  'stats.js',
  'watch-party.css',
  'watch-party.js',
  'me.html',
  'me.css',
  'apponly.js',
  'posters.json',
  'tv.js',
  'manifest.json',
  'favicon.svg',
  'favicon.svg?v=2',
  'icons/icon-192.png',
  'icons/icon-192.png?v=2',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
  'icons/apple-touch-icon.png?v=2',
  'icons/deymflix-logo.svg',
  'offline.html'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' }))).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// The page posts {type:'SKIP_WAITING'} when it sees a new worker finish
// installing, so a returning visitor picks up a deploy on the next load
// instead of waiting for every tab to close.
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;

  // never intercept video/audio streams or provider pages — keep them live
  if (/\.(mp4|mkv|m3u8|ts|mpd)(\?|$)/i.test(url.pathname) ||
      /vidlink\.pro|videasy\.net|vidsrc|multiembed|2embed/.test(url.hostname)) return;

  // posters + icons: cache-first
  if (/image\.tmdb\.org|\.png$|\.jpg$|\.svg$|\.webp$/i.test(url.hostname + url.pathname)) {
    e.respondWith(
      caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
        if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); }
        return r;
      }).catch(() => hit))
    );
    return;
  }

  // our own pages/scripts: network-first, cache fallback, offline page last
  if (url.origin === self.location.origin) {
    e.respondWith(
      fetch(e.request).then(r => {
        if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); }
        return r;
      }).catch(() =>
        caches.match(e.request).then(hit =>
          hit || (e.request.mode === 'navigate' ? caches.match('offline.html') : Response.error())
        )
      )
    );
  }
});
