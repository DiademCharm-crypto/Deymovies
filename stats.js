// ============================================================================
// DEYMFLIX — Owner stats dashboard (reads the first-party analytics counters)
// ============================================================================
// Renders the numbers analytics.js writes to the site's own Firebase Realtime
// Database. Dependency-free; no new vendor, no account.
//
// ACCESS CONTROL (owner only)
//   The counters are protected by the DATABASE'S OWN security rules, not by a
//   passphrase in this file. The rules grant .read only to a secret token, so
//   anyone without it gets 401/403 — the firewall is server-side, and nothing
//   in this page can bypass it. Setup: _tools/_stats_rules.md.
//
//   The page asks for the token once, keeps it in sessionStorage for this tab
//   only, and puts it on every read (?auth=...). If the rules have not been
//   locked yet, the page says so plainly (a warning band) instead of pretending
//   the numbers are private.
//
// REALTIME
//   Unlocked, the page opens Firebase's REST event-stream on
//   <db>/analytics.json?auth=TOKEN — the server PUSHES every increment, so
//   views/plays/rankings update live with no manual refresh (the "● live" dot).
//   If the stream cannot open, it silently falls back to a 60s poll
//   ("● polling") and the ↻ Refresh button still works.
// ============================================================================
(function () {
  'use strict';

  var DB = (window.__DEYMFLIX_CONFIG__ &&
            window.__DEYMFLIX_CONFIG__.FIREBASE_CONFIG &&
            window.__DEYMFLIX_CONFIG__.FIREBASE_CONFIG.databaseURL) ||
           'https://deymflix-default-rtdb.firebaseio.com';

  var TOKEN_KEY = 'dfx_stats_token';   // server token, kept for this tab only
  var DAYS = 14;
  var POLL_MS = 60000;                 // fallback poll when the stream is down
  var STREAM_GRACE_MS = 3000;          // no push in this long? start polling too

  var $ = function (id) { return document.getElementById(id); };
  var num = function (v) { return typeof v === 'number' ? v : 0; };
  var fmt = function (v) { return num(v).toLocaleString(); };
  var pct = function (part, whole) { return whole ? Math.round((part / whole) * 100) + '%' : '—'; };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var pad = function (x) { return (x < 10 ? '0' : '') + x; };
  var clock = function () {
    var d = new Date();
    return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  };

  function dayList(count) {
    var out = [], d = new Date();
    for (var i = 0; i < count; i++) {
      out.push(d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()));
      d.setDate(d.getDate() - 1);
    }
    return out;
  }

  // ── token handling ──────────────────────────────────────────────────────
  function urlToken() {
    try { return (new URLSearchParams(location.search).get('t') || '').trim(); } catch (e) { return ''; }
  }
  function savedToken() {
    try { return (sessionStorage.getItem(TOKEN_KEY) || '').trim(); } catch (e) { return ''; }
  }
  function remember(t) { try { sessionStorage.setItem(TOKEN_KEY, t); } catch (e) {} }

  var token = urlToken() || savedToken();
  var snapshot = {};
  var stream = null, pollTimer = null, graceTimer = null, liveOk = false, mode = 'locked';

  function analyticsUrl(withToken) {
    var t = withToken === undefined ? token : withToken;
    return DB + '/analytics.json' + (t ? '?auth=' + encodeURIComponent(t) : '');
  }
  function probeUrl() { return DB + '/analytics.json?shallow=true'; }

  // 200 = readable. A locked node answers 401/403 for an anonymous read.
  function readable(url) {
    return fetch(url, { cache: 'no-store' }).then(function (r) { return r.ok; })
      .catch(function () { return false; });
  }

  // ── gate / chrome ───────────────────────────────────────────────────────
  function showGate(message) {
    var gate = $('stats-gate'), app = $('stats-app'), err = $('stats-gate-err');
    if (gate) gate.style.display = '';
    if (app) app.style.display = 'none';
    if (err && message) err.textContent = message;
    stopLive();
  }
  var OPEN_WARNING = 'Rules not locked yet — these counters are readable by anyone. ' +
    'Follow _tools/_stats_rules.md to make them owner-only; this page will then ask for the token.';

  function warn(text) {
    var el = $('stat-warn');
    if (!el) return;
    if (text) { el.textContent = text; el.style.display = ''; }
    else { el.textContent = ''; el.style.display = 'none'; }
  }
  function enter() {
    var gate = $('stats-gate'), app = $('stats-app'), err = $('stats-gate-err');
    if (gate) gate.style.display = 'none';
    if (app) app.style.display = '';
    if (err) err.textContent = '';
    subscribe();
    load();
  }

  function wireGate() {
    var form = $('stats-gate-form');
    var input = $('stats-pass');
    var err = $('stats-gate-err');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = (input && input.value || '').trim();
      if (!v) { if (err) err.textContent = 'Paste your stats token.'; return; }
      if (err) err.textContent = 'Checking…';
      readable(analyticsUrl(v)).then(function (ok) {
        if (ok) {
          token = v;
          remember(v);
          enter();
        } else if (err) {
          err.textContent = 'That token does not unlock the counters. Check _tools/_stats_rules.md — the rules must name this exact token.';
          if (input) input.value = '';
        }
      });
    });
  }

  // ── boot: locked (good) or open (rules not set yet, warn) ───────────────
  function boot() {
    wireGate();
    var btn = $('stats-refresh');
    if (btn) btn.addEventListener('click', function () { load(); });

    if (token) {
      readable(analyticsUrl(token)).then(function (ok) {
        if (ok) {
          // The token works — but if the node is ALSO readable anonymously the
          // rules are not locked yet, and the page has to say so rather than
          // implying the counters are private just because a token was typed.
          readable(probeUrl()).then(function (open) {
            if (open) warn(OPEN_WARNING);
            enter();
          });
          return;
        }
        // The stored token stopped working (rotated secret / new rules):
        // try an anonymous read to tell "locked" apart from "still open".
        fallbackProbe('That token no longer unlocks the counters. Paste the current one, or re-check _tools/_stats_rules.md.');
      });
      return;
    }
    fallbackProbe('');
  }

  function fallbackProbe(gateMsg) {
    readable(probeUrl()).then(function (open) {
      if (open) {
        // Rules are not locked yet: the counters are still public. Show the
        // dashboard (tokenless) but say exactly what that means.
        mode = 'open';
        warn(OPEN_WARNING);
        enter();
      } else {
        mode = 'locked';
        showGate(gateMsg || 'Enter your owner token. It is set in the database rules — see _tools/_stats_rules.md.');
      }
    });
  }

  // ── data ────────────────────────────────────────────────────────────────
  function load() {
    var status = $('stat-status');
    return fetch(analyticsUrl(), { cache: 'no-store' })
      .then(function (r) {
        if (r.status === 401 || r.status === 403) {
          var e = new Error('unauthorized'); e.code = 'unauthorized'; throw e;
        }
        if (!r.ok) throw new Error('http ' + r.status);
        return r.json();
      })
      .then(function (data) {
        snapshot = data || {};
        render(snapshot);
        if (status) status.textContent = '';
      })
      .catch(function (e) {
        if (e && e.code === 'unauthorized') { showGate('The database refused the read — the token is stale or the rules changed.'); return; }
        if (status) status.textContent = 'Could not reach the database (' + (e && e.message ? e.message : 'network') + '). Retrying.';
      });
  }

  // ── realtime stream ─────────────────────────────────────────────────────
  function setLive(on) {
    liveOk = !!on;
    var dot = $('stat-live');
    if (!dot) return;
    dot.classList.toggle('on', !!on);
    dot.textContent = on ? '● live' : '● polling';
    dot.title = on ? 'Realtime — the server pushes every counter change'
                   : 'Polling every ' + Math.round(POLL_MS / 1000) + 's';
  }

  function startPolling() {
    if (pollTimer) return;
    pollTimer = setInterval(load, POLL_MS);
  }
  function stopLive() {
    if (stream) { try { stream.close(); } catch (e) {} stream = null; }
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    if (graceTimer) { clearTimeout(graceTimer); graceTimer = null; }
    setLive(false);
    var dot = $('stat-live');
    if (dot) { dot.textContent = ''; dot.classList.remove('on'); }
  }

  function subscribe() {
    if (typeof EventSource === 'undefined') { setLive(false); startPolling(); return; }
    if (stream) return;
    var status = $('stat-status');
    try {
      stream = new EventSource(analyticsUrl());
    } catch (e) { setLive(false); startPolling(); return; }

    stream.addEventListener('put', function (ev) {
      try {
        var msg = JSON.parse(ev.data);
        if (!msg) return;
        setLive(true);
        if (msg.path === '/' || msg.path === undefined) snapshot = msg.data || {};
        else applyPatch(msg.path, msg.data);
        render(snapshot);
        if (status) status.textContent = '';
      } catch (e) {}
    });
    stream.addEventListener('patch', function (ev) {
      try {
        var msg = JSON.parse(ev.data);
        if (!msg || !msg.data) return;
        setLive(true);
        var base = msg.path && msg.path !== '/' ? msg.path : '';
        Object.keys(msg.data).forEach(function (k) {
          applyPatch((base ? base : '') + '/' + k, msg.data[k]);
        });
        render(snapshot);
        if (status) status.textContent = '';
      } catch (e) {}
    });
    stream.addEventListener('error', function () {
      // 401/403 (rules) or a dropped socket: stop the stream and poll instead.
      if (stream) { try { stream.close(); } catch (e) {} stream = null; }
      setLive(false);
      startPolling();
    });
    // First paint is REST; if no push lands shortly, poll as a safety net too.
    graceTimer = setTimeout(function () { if (!liveOk) startPolling(); }, STREAM_GRACE_MS);
  }

  function applyPatch(path, data) {
    var parts = String(path || '/').split('/').filter(Boolean);
    if (!parts.length) { snapshot = data || {}; return; }
    var cur = snapshot;
    for (var i = 0; i < parts.length - 1; i++) {
      if (typeof cur[parts[i]] !== 'object' || cur[parts[i]] === null) cur[parts[i]] = {};
      cur = cur[parts[i]];
    }
    var last = parts[parts.length - 1];
    if (data === null) delete cur[last]; else cur[last] = data;
  }

  // ── render ──────────────────────────────────────────────────────────────
  function render(data) {
    var d = data || {};
    var totals = d.totals || {};
    var views = num(totals.views), plays = num(totals.plays);
    var daily = d.daily || {};

    // KPIs
    var days = dayList(DAYS);
    var v14 = 0, p14 = 0;
    days.forEach(function (day) {
      var row = daily[day] || {};
      v14 += num(row.views); p14 += num(row.plays);
    });
    var kpis = $('stat-kpis');
    if (kpis) {
      kpis.innerHTML = [
        kpi(fmt(views), 'Total views', 'all time'),
        kpi(fmt(plays), 'Total plays', 'trailer / player opens'),
        kpi(pct(plays, views), 'Play rate', 'plays per view'),
        kpi(fmt(v14), 'Views', 'last ' + DAYS + ' days'),
        kpi(fmt(p14), 'Plays', 'last ' + DAYS + ' days')
      ].join('');
    }

    // 14-day chart (oldest → newest, left → right)
    var chart = $('stat-chart');
    if (chart) {
      var max = 1;
      days.forEach(function (day) { max = Math.max(max, num((daily[day] || {}).views)); });
      chart.innerHTML = days.slice().reverse().map(function (day) {
        var v = num((daily[day] || {}).views);
        return '<div class="st-col" title="' + esc(day) + ' — ' + v + ' views">' +
                 '<div class="st-barwrap"><div class="st-bar" style="height:' +
                   (v ? Math.max(3, Math.round((v / max) * 100)) : 0) + '%"></div></div>' +
                 '<div class="st-cnt">' + (v || '') + '</div>' +
                 '<div class="st-day">' + esc(day.slice(5)) + '</div>' +
               '</div>';
      }).join('');
    }

    // Top titles (plays first, then views)
    var titles = d.titles || {};
    var rows = Object.keys(titles).map(function (k) {
      var t = titles[k] || {};
      return { title: t.title || k, type: t.type || '', views: num(t.views), plays: num(t.plays) };
    }).sort(function (a, b) { return (b.plays - a.plays) || (b.views - a.views); }).slice(0, 10);
    var tl = $('stat-titles');
    if (tl) {
      tl.innerHTML = rows.length
        ? '<table class="st-table"><thead><tr><th>Title</th><th>Type</th>' +
          '<th class="st-num">Plays</th><th class="st-num">Views</th></tr></thead><tbody>' +
          rows.map(function (r) {
            return '<tr><td>' + esc(r.title) + '</td><td class="st-dim">' + esc(r.type) + '</td>' +
                   '<td class="st-num">' + fmt(r.plays) + '</td><td class="st-num st-dim">' + fmt(r.views) + '</td></tr>';
          }).join('') + '</tbody></table>'
        : '<p class="st-none">No title views recorded yet.</p>';
    }

    // Referrers
    drawRows('stat-refs', d.referrers, function (name) {
      return name === 'direct' ? 'Direct / bookmarks' : name;
    });
    // Top pages
    drawRows('stat-pages', d.pages, function (name) { return name; });

    // Empty state (a brand-new database)
    var empty = $('stat-empty');
    if (empty) empty.style.display = (!views && !plays && !rows.length) ? '' : 'none';

    var stamp = $('stat-stamp');
    if (stamp) stamp.textContent = 'Updated ' + clock() + (liveOk ? ' (live)' : '');
  }

  function kpi(value, label, sub) {
    return '<div class="st-kpi"><div class="st-kpi-v">' + esc(value) + '</div>' +
           '<div class="st-kpi-l">' + esc(label) + '</div>' +
           '<div class="st-kpi-s">' + esc(sub) + '</div></div>';
  }

  function drawRows(id, obj, labelOf) {
    var el = $(id);
    if (!el) return;
    var rows = Object.keys(obj || {}).map(function (k) {
      return { name: labelOf(k), views: num((obj[k] || {}).views) };
    }).sort(function (a, b) { return b.views - a.views; }).slice(0, 10);
    el.innerHTML = rows.length
      ? rows.map(function (r) {
          return '<div class="st-row"><span>' + esc(r.name) + '</span>' +
                 '<span class="st-num st-dim">' + fmt(r.views) + '</span></div>';
        }).join('')
      : '<p class="st-none">Nothing recorded yet.</p>';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
