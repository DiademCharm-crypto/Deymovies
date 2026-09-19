// ==========================================
// DEYMFLIX - Client Configuration
// ==========================================
// This file contains ONLY non-sensitive configuration.
// ALL API keys and credentials are server-side in proxy-server.js.
// ==========================================

(function () {
  'use strict';

  // Expose safe config on window.__DEYMFLIX_CONFIG__

  // ── Backend auto-detection ──
  // When the site is served BY proxy-server.js (production, or `node proxy-server.js`
  // locally), same-origin '' is correct. But when the pages are opened from a static
  // dev server (VS Code Live Server :5500+, http-server, file://), same-origin /api
  // does not exist — every TMDB/subtitle call fails silently (hover shows poster
  // instead of the trailer, subtitles can't search). In that case route API calls
  // to the production Node server instead. Override here if the domain changes.
  var FALLBACK_API_BASE = 'https://deymflix.eu.cc';
  var onStaticHost = (function () {
    try {
      if (window.location.protocol === 'file:') return true;
      var p = window.location.port;
      if (!p) return false; // served over :80/:443 — assume the Node server
      if (/^55\d\d$/.test(p)) return true;  // Live Server range 5500-5599
      return ['3001', '4000', '5000', '7000', '8080', '8081'].indexOf(p) !== -1;
    } catch (e) { return false; }
  })();

  window.__DEYMFLIX_CONFIG__ = {
    // ── Backend API base URL ──
    // '' (empty) = same origin (use this when the site is served BY proxy-server.js)
    // Static hosting (GitHub Pages, Live Server, etc.) is auto-detected above and
    // routed to FALLBACK_API_BASE. You can still hard-set a URL here to override both.
    // Requires the backend to allow CORS (proxy-server.js already does).
    API_BASE: onStaticHost ? FALLBACK_API_BASE : '',

    // Firebase config is safe to send (it's public by design)
    FIREBASE_CONFIG: {
      apiKey: 'AIzaSyCSejdiwh4Y6N6Pwl6QyLXPNYdUqz8vc1M',
      authDomain: 'deymflix.firebaseapp.com',
      databaseURL: 'https://deymflix-default-rtdb.firebaseio.com',
      projectId: 'deymflix',
      storageBucket: 'deymflix.firebasestorage.app',
      messagingSenderId: '333198075783',
      appId: '1:333198075783:web:91765cf2f3c09e3c119522',
      measurementId: 'G-H8KMTM5YYH'
    }
  };

  // Expose a LIVE API base: pages read window.__API_BASE__ on every fetch, and
  // app.js reads config.API_BASE — the async probe below may switch it shortly
  // after load, so an accessor keeps every reader in sync automatically.
  var cfg = window.__DEYMFLIX_CONFIG__;
  try {
    Object.defineProperty(window, '__API_BASE__', {
      configurable: true,
      get: function () { return cfg.API_BASE || ''; },
      set: function (v) { cfg.API_BASE = v || ''; }
    });
  } catch (e) { window.__API_BASE__ = cfg.API_BASE || ''; }

  // Runtime safety net: if we're assuming same-origin but this host doesn't
  // actually have the /api backend (VS Code Live Server, http-server, GitHub
  // Pages…), silently route API calls to the production Node server instead.
  // That's what broke hover trailers before: the TMDB lookup 404'd → poster-only.
  if (!cfg.API_BASE && window.location.protocol !== 'file:') {
    try {
      fetch('/api/local-subtitles').then(function (r) { return r.text(); }).then(function (t) {
        var ok = false;
        try { var j = JSON.parse(t); ok = !!(j && Array.isArray(j.files)); } catch (e) {}
        if (!ok) {
          cfg.API_BASE = FALLBACK_API_BASE;
          console.log('[Deymflix] No API backend on this host — routing API calls to ' + FALLBACK_API_BASE);
        }
      }).catch(function () {});
    } catch (e) {}
  }

})();
