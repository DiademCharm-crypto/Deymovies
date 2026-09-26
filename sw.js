// DEYMFLIX service worker — offline shell + smart caching
// Strategy:
//   * app shell (index/player/style/app js): network-first, fall back to cache
//   * posters/images: cache-first (they never change per versioned URL)
//   * everything else (APIs, streams): network only — never cache video
const CACHE = 'deymflix-v1';
const SHELL = [
  'index.html',
  'player.html',
  'style.css',
  'app.js',
  'episodes.js',
  'manifest.json',
  'favicon.svg',
  'offline.html'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
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
