// ============================================================================
// DEYMFLIX — Viewer analytics (first-party, cookie-free)
// ============================================================================
// No third-party script, no cookies, no personal data. Page views and plays
// are counted with atomic increments on the site's own Firebase Realtime
// Database (the same one that powers the live "online now" counter), so the
// numbers live in your own project and nothing is shared with an analytics
// vendor.
//
// What is recorded
//   analytics/totals/views          every page view
//   analytics/totals/plays          every title opened in the player
//   analytics/daily/YYYY-MM-DD/     views + plays for that day
//   analytics/pages/<page>/views    per-page totals
//   analytics/titles/<id>/          title, views, plays (top titles)
//   analytics/referrers/<host>/     where visitors came from
//
// Deliberately NOT recorded: IP address, user agent, screen size, precise
// location, or anything that identifies a person. Only a random per-tab id
// lives in sessionStorage so a page refresh is not double-counted as a new
// visitor.
//
// Reading the numbers
//   Open the Firebase console → Realtime Database, or run:
//     node _tools/_stats.cjs
// ============================================================================
(function () {
  'use strict';

  if (window.__dfxAnalyticsLoaded) return;
  window.__dfxAnalyticsLoaded = true;

  var DB = 'https://deymflix-default-rtdb.firebaseio.com';
  var SESSION_KEY = 'dfx_analytics_sid';
  var VIEWED_KEY = 'dfx_analytics_viewed';   // sessionStorage: one view per page per tab

  // ── never count our own audits / headless runs ───────────────────────────
  // Every _tools/_*.cjs audit drives a --headless=new Chrome. Those runs must
  // not pollute the real numbers, so automation is skipped outright.
  try {
    if (navigator.webdriver) return;
    if (/HeadlessChrome|Electron|jsdom/i.test(navigator.userAgent || '')) return;
    // Respect an explicit "do not track" choice from the visitor.
    var dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
    if (dnt === '1' || dnt === 'yes') return;
    // Local dev servers and file:// previews are not real traffic either.
    var host = location.hostname;
    if (location.protocol === 'file:') return;
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') return;
    if (/^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)) return;
  } catch (e) { return; }

  // ── helpers ──────────────────────────────────────────────────────────────
  function sid() {
    try {
      var s = sessionStorage.getItem(SESSION_KEY);
      if (!s) {
        s = Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
        sessionStorage.setItem(SESSION_KEY, s);
      }
      return s;
    } catch (e) { return ''; }
  }

  function dayKey() {
    var d = new Date();
    var p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }

  // Page name: "index", "player", "explore", … (query strings are dropped so
  // every title does not create its own page bucket).
  function pageName() {
    var p = (location.pathname || '/').split('/').pop() || 'index.html';
    return p.replace(/\.html?$/i, '') || 'index';
  }

  function referrerHost() {
    try {
      if (!document.referrer) return 'direct';
      var h = new URL(document.referrer).hostname;
      return h === location.hostname ? 'internal' : h;
    } catch (e) { return 'direct'; }
  }

  // Firebase REST + atomic increment. keepalive so the beacon survives the
  // page being closed mid-navigation; sendBeacon is the fallback.
  //
  // TWO THINGS ARE LOAD-BEARING HERE (both found the hard way):
  //  1. 'text/plain' is a CORS-SIMPLE content type, so the request is not
  //     PREFLIGHTED. With 'application/json' the browser sent an OPTIONS
  //     first, and the database answers our origins without an
  //     Access-Control-Allow-Credentials header -- the write never left the
  //     device (the owner's stats and sign-in log stayed empty).
  //  2. The method must stay PATCH. sendBeacon can only POST: posting to
  //     /analytics/.json PUSHES a generated child key instead of merging the
  //     counters, so the dashboard's totals/pages/titles nodes stay null.
  //     keepalive on the fetch survives the page closing, which is all
  //     sendBeacon was ever used for.
  var CT = 'text/plain;charset=UTF-8';
  function beacon(url, json) {
    try {
      var r = fetch(url, {
        method: 'PATCH', headers: { 'Content-Type': CT }, body: json, keepalive: true, mode: 'cors'
      });
      if (r && r.catch) r.catch(function () { });
    } catch (e) { }
  }
  function patch(path, body) {
    beacon(DB + '/analytics/' + path + '.json', JSON.stringify(body));
  }

  var inc = function (n) { return { '.sv': { increment: n || 1 } }; };

  // A title bucket keeps a friendly name alongside the counters so the stats
  // report can show real titles without a catalog lookup.
  function clean(s, max) {
    return String(s == null ? '' : s).replace(/\s+/g, ' ').trim().slice(0, max || 90);
  }

  // ── page view ────────────────────────────────────────────────────────────
  function countView() {
    var id = sid();
    try {
      var seen = sessionStorage.getItem(VIEWED_KEY) || '';
      var key = pageName();
      if (id && seen.split('|').indexOf(key) !== -1) return;   // this tab already logged this page
      sessionStorage.setItem(VIEWED_KEY, (seen ? seen + '|' : '') + key);
    } catch (e) {}

    var body = {
      totals: { views: inc(1) },
      daily: {},
      pages: {},
      referrers: {}
    };
    body.daily[dayKey()] = { views: inc(1) };
    body.pages[pageName()] = { views: inc(1), last: { '.sv': 'timestamp' } };
    body.referrers[referrerHost()] = { views: inc(1) };
    patch('', body);
  }

  // ── play (a title was actually opened in the player) ─────────────────────
  // Called by app.js/player.html once the player has resolved a real title.
  function countPlay(movie) {
    if (!movie || !movie.id) return;
    var key = clean(movie.id, 120).replace(/[.#$/\[\]]/g, '_');
    if (!key) return;

    var body = {
      totals: { plays: inc(1) },
      daily: {},
      titles: {}
    };
    body.daily[dayKey()] = { plays: inc(1) };
    body.titles[key] = {
      title: clean(movie.title, 90) || key,
      type: movie.isSeries ? 'series' : 'movie',
      plays: inc(1),
      views: inc(1),
      last: { '.sv': 'timestamp' }
    };
    patch('', body);
  }

  // A title card being opened counts as interest even before the player
  // resolves (the player then adds the play on top).
  function countTitleView(movie) {
    if (!movie || !movie.id) return;
    var key = clean(movie.id, 120).replace(/[.#$/\[\]]/g, '_');
    if (!key) return;
    var body = { titles: {} };
    body.titles[key] = { title: clean(movie.title, 90) || key, views: inc(1) };
    patch('', body);
  }

  // ── SIGNED-IN USERS (what the owner asked for: "who is using my app") ────
  // The accounts live in apponly.js, but the database URL, the resilient
  // writer and "this phone" details live here -- and this file is the only one
  // loaded by every page (index, player, me, category, ...). So apponly.js
  // calls this when an account signs in:
  //     window.DfxSignInLog(account, 'signin' | 'open')
  // Stored (twice, so both questions are cheap to answer):
  //   signins/users/<uid>   one row per account -- lastSeen, count, device, app
  //   signins/events/<key>  the chronological log of every sign-in
  // What is NOT stored: passwords, the typed address (only the account's own
  // display name and DEYMFLIX uid), IP, location, or anything about a visitor
  // who never signed in. Timestamps are server-side, so a wrong phone clock
  // cannot invent history.
  function deviceModel() {
    try {
      var ua = navigator.userAgent || '';
      var m = /Android[^;]*;\s*([^;)]+?)(?:\s+Build|\s*\))/.exec(ua);
      if (m && m[1]) return clean(m[1], 40);
      return clean(ua.split(')')[0].split('(').pop(), 40) || 'unknown';
    } catch (e) { return 'unknown'; }
  }

  function appInfoSafe() {
    try {
      var br = window.DeymflixApp || null;
      var fn = br && (typeof br.appInfo === 'function' ? br.appInfo
                    : (typeof br.getAppInfo === 'function' ? br.getAppInfo : null));
      var a = fn ? JSON.parse(fn.call(br)) : null;
      if (!a) return {};
      return { version: clean(a.version, 12), code: clean(a.code, 6), device: clean(a.device, 40), android: clean(a.android, 12) };
    } catch (e) { return {}; }
  }

  // Same PATCH + CORS-simple body as patch() above -- see the comment there.
  // A sign-in row is written once per account, so it has to actually land:
  // an application/json body was preflighted and dropped, and a sendBeacon
  // POST landed under a generated key the owner's page never reads.
  function write(path, body) {
    beacon(DB + '/signins/' + path + '.json', JSON.stringify(body));
  }

  function signInLog(acc, where) {
    try {
      if (!acc || acc.uid == null) return;
      var uid = String(acc.uid).replace(/[.#$/\[\]]/g, '_');
      var row = {
        uid: String(acc.uid),
        name: clean(acc.name, 60) || 'DEYMFLIX user',
        provider: clean(acc.provider, 12) || 'email',
        where: clean(where, 12) || 'signin',
        page: pageName(),
        lastSeen: { '.sv': 'timestamp' },
        count: inc(1)
      };
      var app = appInfoSafe();
      if (app.version) row.app = app.version;
      if (app.code) row.code = app.code;
      row.device = app.device || deviceModel();
      // firstSeen only ever goes once per account per device
      var mark = 'dfx_signin_mark_' + uid;
      try {
        if (!localStorage.getItem(mark)) { row.firstSeen = { '.sv': 'timestamp' }; localStorage.setItem(mark, String(Date.now())); }
      } catch (e) { }
      write('users/' + uid, row);

      var ev = {
        uid: String(acc.uid), name: row.name, provider: row.provider,
        where: row.where, page: row.page, device: row.device,
        app: row.app || '', at: { '.sv': 'timestamp' }
      };
      var key;
      try { key = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8); }
      catch (e) { key = String(Date.now()); }
      write('events/' + key, ev);
      return key;
    } catch (e) { return ''; }
  }

  window.DfxSignInLog = signInLog;

  window.DfxAnalytics = {
    pageView: countView,
    play: countPlay,
    titleView: countTitleView,
    signIn: signInLog,
    enabled: true
  };

  // ── auto page view ───────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', countView, { once: true });
  } else {
    countView();
  }
})();
