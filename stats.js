// ============================================================================
// DEYMFLIX — Owner stats dashboard (reads the first-party analytics counters)
// ============================================================================
// A lightweight, dependency-free page that renders the numbers analytics.js
// writes to the site's own Firebase Realtime Database. This page only READS
// <db>/analytics.json and draws it — nothing is sent anywhere.
//
//   totals      total page views + plays
//   daily       14-day views/plays bar chart
//   titles      most-opened titles (plays + views)
//   referrers   where visitors came from
//   pages       most-viewed pages
//
// Soft gate: a passphrase (kept in sessionStorage) hides the dashboard. The
// counters are non-sensitive aggregate counts and the database node is public,
// so this is a convenience gate, not a security boundary — real protection
// belongs in the Firebase rules. Change OWNER_KEY below to your own phrase.
// ============================================================================
(function () {
  'use strict';

  var DB = (window.__DEYMFLIX_CONFIG__ &&
            window.__DEYMFLIX_CONFIG__.FIREBASE_CONFIG &&
            window.__DEYMFLIX_CONFIG__.FIREBASE_CONFIG.databaseURL) ||
           'https://deymflix-default-rtdb.firebaseio.com';

  var OWNER_KEY = 'deymflix-owner';   // <-- change this passphrase
  var GATE_KEY  = 'dfx_stats_ok';
  var DAYS      = 14;
  var REFRESH_MS = 60000;

  var $ = function (id) { return document.getElementById(id); };
  var n = function (v) { return typeof v === 'number' ? v : 0; };
  var fmt = function (v) { return n(v).toLocaleString(); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var pad = function (x) { return (x < 10 ? '0' : '') + x; };

  function dayList(count) {
    var out = [], d = new Date();
    for (var i = 0; i < count; i++) {
      out.push(d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()));
      d.setDate(d.getDate() - 1);
    }
    return out;
  }

  function urlPass() {
    try { return new URLSearchParams(location.search).get('pass') || ''; } catch (e) { return ''; }
  }

  // ── gate ────────────────────────────────────────────────────────────────
  function gateOk() {
    if (urlPass() === OWNER_KEY) { try { sessionStorage.setItem(GATE_KEY, '1'); } catch (e) {} return true; }
    try { return sessionStorage.getItem(GATE_KEY) === '1'; } catch (e) { return false; }
  }

  function wireGate() {
    var form = $('stats-gate-form');
    var input = $('stats-pass');
    var err = $('stats-gate-err');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = (input && input.value || '').trim();
      if (v === OWNER_KEY) {
        try { sessionStorage.setItem(GATE_KEY, '1'); } catch (e2) {}
        enter();
      } else if (err) {
        err.textContent = 'Wrong passphrase.';
        if (input) { input.value = ''; input.focus(); }
      }
    });
  }

  function enter() {
    var gate = $('stats-gate');
    var app = $('stats-app');
    if (gate) gate.style.display = 'none';
    if (app) app.style.display = '';
    load();
    setInterval(load, REFRESH_MS);
  }

  // ── rendering ───────────────────────────────────────────────────────────
  function kpi(label, value, sub) {
    return '<div class="st-kpi"><div class="st-kpi-v">' + esc(value) + '</div>' +
      '<div class="st-kpi-l">' + esc(label) + '</div>' +
      (sub ? '<div class="st-kpi-s">' + esc(sub) + '</div>' : '') + '</div>';
  }

  function render(data) {
    var totals = (data && data.totals) || {};
    var daily = (data && data.daily) || {};
    var views = n(totals.views), plays = n(totals.plays);

    var days = dayList(DAYS);
    var dV = 0, dP = 0, activeDays = 0;
    days.forEach(function (d) {
      var r = daily[d] || {};
      dV += n(r.views); dP += n(r.plays);
      if (n(r.views) || n(r.plays)) activeDays++;
    });
    var rate = views ? Math.round((plays / views) * 100) : 0;

    // ── KPIs ──────────────────────────────────────────────────────────────
    var kpis = $('stat-kpis');
    if (kpis) {
      kpis.innerHTML =
        kpi('Total page views', fmt(views), 'all time') +
        kpi('Total plays', fmt(plays), 'titles opened') +
        kpi('Play rate', rate + '%', 'plays per view') +
        kpi('Last ' + DAYS + ' days', fmt(dV) + ' views', activeDays + ' active day(s)');
    }

    // ── empty state ───────────────────────────────────────────────────────
    var empty = !views && !plays && !Object.keys(data && data.titles || {}).length;
    var emptyEl = $('stat-empty');
    if (emptyEl) emptyEl.style.display = empty ? '' : 'none';

    // ── 14-day chart ──────────────────────────────────────────────────────
    var chart = $('stat-chart');
    if (chart) {
      var max = 1;
      days.forEach(function (d) { max = Math.max(max, n((daily[d] || {}).views)); });
      chart.innerHTML = days.slice().reverse().map(function (d) {
        var r = daily[d] || {}, v = n(r.views), p = n(r.plays);
        var h = Math.max(v ? 4 : 0, Math.round((v / max) * 100));
        return '<div class="st-col" title="' + esc(d + ': ' + v + ' views, ' + p + ' plays') + '">' +
          '<div class="st-barwrap"><div class="st-bar" style="height:' + h + '%"></div></div>' +
          '<div class="st-day">' + esc(d.slice(5)) + '</div>' +
          '<div class="st-cnt">' + (v || '') + '</div></div>';
      }).join('');
    }

    // ── top titles ────────────────────────────────────────────────────────
    var titlesEl = $('stat-titles');
    if (titlesEl) {
      var titles = Object.keys(data && data.titles || {}).map(function (k) {
        var t = data.titles[k] || {};
        return { title: t.title || k, type: t.type || '', plays: n(t.plays), views: n(t.views) };
      }).sort(function (a, b) { return (b.plays - a.plays) || (b.views - a.views); }).slice(0, 20);

      titlesEl.innerHTML = titles.length
        ? '<table class="st-table"><thead><tr><th>Title</th><th>Type</th><th class="st-num">Plays</th><th class="st-num">Views</th></tr></thead><tbody>' +
          titles.map(function (t) {
            return '<tr><td>' + esc(t.title) + '</td><td class="st-dim">' + esc(t.type || '—') + '</td>' +
              '<td class="st-num">' + fmt(t.plays) + '</td><td class="st-num">' + fmt(t.views) + '</td></tr>';
          }).join('') + '</tbody></table>'
        : '<p class="st-none">No titles opened yet.</p>';
    }

    // ── referrers ─────────────────────────────────────────────────────────
    var refsEl = $('stat-refs');
    if (refsEl) {
      var refs = Object.keys(data && data.referrers || {}).map(function (k) {
        return { host: k, views: n((data.referrers[k] || {}).views) };
      }).sort(function (a, b) { return b.views - a.views; }).slice(0, 12);
      refsEl.innerHTML = refs.length
        ? refs.map(function (r) {
            return '<div class="st-row"><span>' + esc(r.host) + '</span><span class="st-num">' + fmt(r.views) + '</span></div>';
          }).join('')
        : '<p class="st-none">No referrers yet.</p>';
    }

    // ── pages ─────────────────────────────────────────────────────────────
    var pagesEl = $('stat-pages');
    if (pagesEl) {
      var pages = Object.keys(data && data.pages || {}).map(function (k) {
        return { page: k, views: n((data.pages[k] || {}).views) };
      }).sort(function (a, b) { return b.views - a.views; }).slice(0, 12);
      pagesEl.innerHTML = pages.length
        ? pages.map(function (p) {
            return '<div class="st-row"><span>' + esc(p.page) + '</span><span class="st-num">' + fmt(p.views) + '</span></div>';
          }).join('')
        : '<p class="st-none">No page views yet.</p>';
    }

    var stamp = $('stat-stamp');
    if (stamp) stamp.textContent = 'Updated ' + new Date().toLocaleTimeString();
  }

  // ── data ────────────────────────────────────────────────────────────────
  function load() {
    var status = $('stat-status');
    if (status) status.textContent = 'Loading…';
    fetch(DB + '/analytics.json', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        render(data || {});
        if (status) status.textContent = '';
      })
      .catch(function (e) {
        if (status) status.textContent = 'Could not reach the database (' + e.message + ').';
      });
  }

  // ── init ────────────────────────────────────────────────────────────────
  function init() {
    wireGate();
    var refresh = $('stats-refresh');
    if (refresh) refresh.addEventListener('click', load);
    if (gateOk()) enter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
