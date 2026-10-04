// ============================================================================
// DEYMFLIX — APP-ONLY UI  (v1.7)          loaded by me.html + the app pages
// ============================================================================
// WHAT THIS IS
//   The parts of the app that must NOT appear on the mobile site or on PC:
//     • the Me screen (me.html): Sign In / Create account / Google login,
//       watch-history gate, download settings, "Diagnostics you can send"
//     • the Me entry in the bottom bar while running inside the app
//   Browsers never match the app user agent, so every branch below is dead
//   for them. If someone opens me.html in a browser they are sent home.
//
// ACCOUNTS (honest note)
//   Accounts live on THIS PHONE (localStorage), because the site has no auth
//   backend: Firebase Auth is not enabled on the project, so a real
//   cloud account is impossible today. "Log in with Google" uses the phone's
//   own Google account (DeymflixApp.getGoogleAccounts()) -- one tap, no
//   password typing, and the account is marked as a Google account. Passwords
//   are stored as a salted SHA-256 digest, never in clear text.
// ============================================================================
(function () {
  'use strict';

  var IS_APP = /DeymflixApp/i.test(navigator.userAgent || '') || !!window.DeymflixApp;
  var HERE = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var ON_ME = HERE === 'me.html';

  // ── gate: the Me screen is app-only ──────────────────────────────────────
  if (!IS_APP && ON_ME) {
    try { window.location.replace('index.html'); } catch (e) { }
    return;
  }
  if (!IS_APP) return;                                  // nothing else applies

  var BRIDGE = (window.DeymflixApp && typeof window.DeymflixApp === 'object') ? window.DeymflixApp : null;
  function bridge(name) {
    try { return (BRIDGE && typeof BRIDGE[name] === 'function') ? BRIDGE[name].bind(BRIDGE) : null; }
    catch (e) { return null; }
  }

  var K_ACCOUNTS = 'dfx_accounts_v1';
  var K_SESSION = 'dfx_session_v1';

  // ══════════════════════════════════════════════════════════════════════════
  //  1) BOTTOM BAR: the Me tab (app only). History moves inside Me, so the
  //     bar keeps five items and never crowds.
  // ══════════════════════════════════════════════════════════════════════════
  function installMeTab() {
    var nav = document.querySelector('.bottom-nav-items');
    if (!nav) return;
    var existing = nav.querySelector('[data-page="me"]');
    if (!existing) {
      var hist = nav.querySelector('[data-page="history"]');
      var li = document.createElement('li');
      li.className = 'bottom-nav-item' + (ON_ME ? ' active' : '');
      li.setAttribute('data-page', 'me');
      li.innerHTML = '<span class="bottom-nav-icon">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10z"></path><path d="M4 21v-1c0-2.76 3.58-5 8-5s8 2.24 8 5v1"></path></svg></span>' +
        '<span class="bottom-nav-label">Me</span>';
      li.addEventListener('click', function () {
        if (!ON_ME) window.location.href = 'me.html';
      });
      if (hist && hist.parentNode === nav) nav.replaceChild(li, hist);   // swap, keep 5
      else nav.appendChild(li);
    } else if (ON_ME) {
      existing.classList.add('active');
    }
    // On the Me screen itself the other tabs must navigate normally.
    var items = nav.querySelectorAll('.bottom-nav-item');
    for (var i = 0; i < items.length; i++) {
      if (items[i].getAttribute('data-page') === 'me') continue;
      items[i].classList.remove('active');
    }
  }
  installMeTab();

  if (!ON_ME) return;                                   // rest is the Me screen

  // ══════════════════════════════════════════════════════════════════════════
  //  2) ACCOUNTS (device-local)
  // ══════════════════════════════════════════════════════════════════════════
  function readAccounts() {
    try { return JSON.parse(localStorage.getItem(K_ACCOUNTS) || '[]') || []; } catch (e) { return []; }
  }
  function writeAccounts(list) {
    try { localStorage.setItem(K_ACCOUNTS, JSON.stringify(list)); } catch (e) { }
  }
  function readSession() {
    try { return JSON.parse(localStorage.getItem(K_SESSION) || 'null'); } catch (e) { return null; }
  }
  function writeSession(s) {
    try {
      if (s) localStorage.setItem(K_SESSION, JSON.stringify(s));
      else localStorage.removeItem(K_SESSION);
    } catch (e) { }
  }
  function findAccount(id) {
    var l = readAccounts();
    for (var i = 0; i < l.length; i++) {
      var a = l[i];
      if (a && (a.email === id || a.phone === id)) return a;
    }
    return null;
  }
  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function isPhone(v) { return /^\+?\d{7,15}$/.test(v.replace(/[\s-()]/g, '')); }
  function looksLikeId(v) { return isEmail(v) || isPhone(v); }

  // A short, stable, Loklok-style number shown under the account name.
  function newUid() {
    var list = readAccounts();
    var used = {};
    list.forEach(function (a) { used[String(a.uid)] = 1; });
    for (var i = 0; i < 60; i++) {
      var n = 11000000 + Math.floor(Math.random() * 8999999);
      if (!used[String(n)]) return n;
    }
    return 10000000 + list.length + 1;
  }

  function sha256(text) {
    return new Promise(function (resolve) {
      try {
        if (window.crypto && crypto.subtle && crypto.subtle.digest) {
          crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) {
            var b = new Uint8Array(buf), hex = '';
            for (var i = 0; i < b.length; i++) hex += ('0' + b[i].toString(16)).slice(-2);
            resolve(hex);
          }).catch(function () { resolve(fallbackHash(text)); });
          return;
        }
      } catch (e) { }
      resolve(fallbackHash(text));
    });
  }
  // Only reached when the WebView has no crypto.subtle (Android 6 and older).
  function fallbackHash(text) {
    var h = 2166136261;
    for (var i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = (h * 16777619) >>> 0;
    }
    return 'fnv' + h.toString(16);
  }
  function saltOf(acc) { return String(acc.uid) + '::' + String(acc.email || acc.phone || ''); }

  var UI = {};    // filled after DOMContentLoaded
  function $(id) { return document.getElementById(id); }
  function err(el, msg) { if (el) el.textContent = msg || ''; }

  function currentUser() {
    var s = readSession();
    if (!s) return null;
    var a = findAccount(s.id);
    return a || null;
  }

  function renderHeader() {
    var me = currentUser();
    var list = readAccounts();
    if (me) {
      if ($('me-title')) $('me-title').textContent = me.name || me.email || me.phone || 'DEYMFLIX user';
      if ($('me-sub')) $('me-sub').textContent = 'UID: ' + me.uid + (me.provider === 'google' ? ' · Google account' : '');
      if ($('me-av')) $('me-av').innerHTML = me.photo
        ? '<img src="' + me.photo + '" alt="">'
        : '<svg viewBox="0 0 24 24" width="30" height="30" fill="#54545f"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z"/></svg>';
      if ($('hist-gate-text')) $('hist-gate-text').textContent = 'Your watch history on this phone';
      if ($('btn-signin')) {
        $('btn-signin').textContent = 'Sign out';
        $('btn-signin').onclick = function () {
          writeSession(null);
          renderHeader();
        };
      }
    } else {
      if ($('me-title')) $('me-title').textContent = 'Sign In/Sign Up';
      if ($('me-sub')) $('me-sub').textContent = 'Sign in to keep your list, history and downloads';
      if ($('hist-gate-text')) $('hist-gate-text').textContent = 'Sign in to view watch history';
      if ($('btn-signin')) {
        $('btn-signin').textContent = 'Sign In';
        $('btn-signin').onclick = function () { openView('view-signin'); prepareSignIn(); };
      }
    }
    // "recently logged-in account" card = newest account on this device
    var recent = list.length ? list[list.length - 1] : null;
    if ($('si-recent')) {
      if (recent && (!me || recent.uid !== me.uid)) {
        $('si-recent').hidden = false;
        if ($('recent-email')) $('recent-email').textContent = recent.email || recent.phone || 'Account';
        if ($('recent-uid')) $('recent-uid').textContent = 'UID: ' + recent.uid +
          (recent.provider === 'google' ? '  (Google)' : '');
      } else {
        $('si-recent').hidden = true;
      }
    }
  }

  function signIn(acc, silent) {
    writeSession({ id: acc.email || acc.phone, at: Date.now() });
    renderHeader();
    if (!silent) toast('Signed in as ' + (acc.email || acc.phone));
  }

  function toast(msg) {
    var t = $('loading-toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  3) SIGN IN / CREATE ACCOUNT
  // ══════════════════════════════════════════════════════════════════════════
  function openView(id) {
    ['view-signin', 'view-create', 'view-dl', 'view-diag'].forEach(function (v) {
      var el = $(v);
      if (el) el.classList.toggle('on', v === id);
    });
    var root = $('me-root');
    if (root) root.hidden = !!id;
  }
  function closeViews() { openView(null); }

  function prepareSignIn() {
    var passWrap = $('si-pass-wrap');
    if (passWrap) passWrap.hidden = true;
    err($('si-err'), '');
    if ($('si-next')) $('si-next').textContent = 'Next';
  }

  function nextStep() {
    err($('si-err'), '');
    var raw = ($('si-id') && $('si-id').value || '').trim();
    if (!raw) { err($('si-err'), 'Enter your email or phone number'); return; }
    if (!looksLikeId(raw)) { err($('si-err'), 'That does not look like an email or phone number'); return; }
    var acc = findAccount(raw);
    var passWrap = $('si-pass-wrap');
    if (!acc) {
      // no such account yet -> the create screen, pre-filled
      if ($('ca-id')) $('ca-id').value = raw;
      openView('view-create');
      err($('ca-err'), '');
      toast('No account for that yet — create one');
      return;
    }
    if (acc.provider === 'google') {
      signIn(acc);                 // device-verified account: no password step
      closeViews();
      return;
    }
    if (passWrap && passWrap.hidden) {           // ask for the password
      passWrap.hidden = false;
      if ($('si-next')) $('si-next').textContent = 'Log in';
      if ($('si-pass')) $('si-pass').focus();
      return;
    }
    var pass = ($('si-pass') && $('si-pass').value) || '';
    if (!pass) { err($('si-err'), 'Enter your password'); return; }
    sha256(saltOf(acc) + ':' + pass).then(function (h) {
      if (h === acc.hash) { signIn(acc); closeViews(); }
      else err($('si-err'), 'Wrong password. Try again.');
    });
  }

  function createAccount() {
    err($('ca-err'), '');
    var id = ($('ca-id') && $('ca-id').value || '').trim();
    var p1 = ($('ca-pass') && $('ca-pass').value) || '';
    var p2 = ($('ca-pass2') && $('ca-pass2').value) || '';
    if (!looksLikeId(id)) { err($('ca-err'), 'Enter a valid email or phone number'); return; }
    if (findAccount(id)) { err($('ca-err'), 'That account already exists — sign in instead'); return; }
    if (p1.length < 4) { err($('ca-err'), 'Use at least 4 characters for the password'); return; }
    if (p1 !== p2) { err($('ca-err'), 'The two passwords do not match'); return; }
    var acc = {
      uid: newUid(),
      email: isEmail(id) ? id : '',
      phone: isPhone(id) ? id : '',
      provider: 'email',
      created: Date.now(),
    };
    sha256(saltOf(acc) + ':' + p1).then(function (h) {
      acc.hash = h;
      var list = readAccounts();
      list.push(acc);
      writeAccounts(list);
      signIn(acc);
      closeViews();
      if ($('ca-pass')) $('ca-pass').value = '';
      if ($('ca-pass2')) $('ca-pass2').value = '';
      toast('Account created — welcome!');
    });
  }

  // ── Google: the phone's own account, no password, no popup ──────────────
  function googleLogin() {
    err($('si-err'), '');
    var get = bridge('getGoogleAccounts');
    if (!get) {
      err($('si-err'), 'Google login works inside the DEYMFLIX app only.');
      return;
    }
    // GET_ACCOUNTS is a runtime permission: ask first, then keep checking so
    // the picker opens by itself the moment Android flips it to granted.
    var ask = bridge('requestAccounts');
    function withAccounts() {
      var list = [];
      try { list = JSON.parse(get() || '[]') || []; } catch (e) { list = []; }
      if (!list.length) {
        // Android 14+ hides other apps' accounts, so the phone's own picker is
        // the supported way in; the answer arrives as DfxGooglePicked(email).
        var pick = bridge('pickGoogleAccount');
        if (pick) {
          err($('si-err'), 'Choose your Google account in the Android dialog.');
          try { pick(); } catch (e) { }
          return;
        }
        err($('si-err'), 'No Google account found on this phone. Add one in Android Settings › Accounts, then tap again.');
        return;
      }
      if (list.length === 1) { googleUse(list[0].email); return; }
      openGoogleSheet(list);
    }
    if (!ask) { withAccounts(); return; }
    var st = '';
    try { st = String(ask() || ''); } catch (e) { st = ''; }
    if (st === 'granted') { withAccounts(); return; }
    err($('si-err'), 'Android is asking to let DEYMFLIX see this phone\'s accounts — tap Allow and the picker opens on its own.');
    var tries = 0;
    (function poll() {
      tries++;
      var s2 = '';
      try { s2 = String(ask() || ''); } catch (e) { s2 = ''; }
      if (s2 === 'granted') { err($('si-err'), ''); withAccounts(); return; }
      if (tries < 20) setTimeout(poll, 700);
    })();
  }

  // several Google accounts: let the user pick (Google-style sheet)
  function openGoogleSheet(list) {
    var box = document.createElement('div');
    box.style.cssText = 'position:fixed;inset:0;z-index:1300;background:rgba(0,0,0,.72);display:flex;align-items:flex-end;';
    var sheet = document.createElement('div');
    sheet.style.cssText = 'width:100%;background:#14141a;border-radius:18px 18px 0 0;padding:18px 16px 26px;';
    sheet.innerHTML = '<div style="color:#fff;font-weight:700;margin-bottom:12px">Choose an account</div>';
    list.forEach(function (a) {
      var b = document.createElement('button');
      b.className = 'me-pick';
      b.innerHTML = '<svg class="g" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>' +
        '<span style="overflow:hidden;text-overflow:ellipsis">' + String(a.email).replace(/[<>&]/g, '') + '</span>';
      b.addEventListener('click', function () {
        try { box.remove(); } catch (e) { }
        googleUse(a.email);
      });
      sheet.appendChild(b);
    });
    var cancel = document.createElement('button');
    cancel.className = 'me-chip';
    cancel.style.cssText = 'width:100%;margin-top:6px';
    cancel.textContent = 'Cancel';
    cancel.addEventListener('click', function () { try { box.remove(); } catch (e) { } });
    sheet.appendChild(cancel);
    box.appendChild(sheet);
    box.addEventListener('click', function (e) { if (e.target === box) try { box.remove(); } catch (er) { } });
    document.body.appendChild(box);
  }

  function googleUse(email) {
    var em = String(email || '').trim();
    if (!em) return;
    var acc = findAccount(em);
    if (acc) {
      if (acc.provider !== 'google') { err($('si-err'), 'That address already has a password account.'); return; }
      signIn(acc);
      closeViews();
      return;
    }
    var fresh = { uid: newUid(), email: em, provider: 'google', created: Date.now(), name: em.split('@')[0] };
    var list = readAccounts();
    list.push(fresh);
    writeAccounts(list);
    signIn(fresh);
    closeViews();
    toast('Logged in with ' + em);
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  4) DOWNLOAD SETTINGS (quality + Wi-Fi only) -- stored NATIVELY through
  //     the bridge so the download engine enforces exactly what is shown here.
  // ══════════════════════════════════════════════════════════════════════════
  var DL = { quality: 'auto', wifiOnly: false, metered: false, onWifi: false };

  function readPrefs() {
    var get = bridge('getDownloadPrefs');
    if (get) {
      try {
        var p = JSON.parse(get() || '{}') || {};
        DL.quality = p.quality || 'auto';
        DL.wifiOnly = !!p.wifiOnly;
        DL.metered = !!p.metered;
        DL.onWifi = !!p.onWifi;
      } catch (e) { }
    } else {
      // browser / harness fallback: same shape, remembered locally
      try {
        var q = JSON.parse(localStorage.getItem('dfx_dl_prefs') || '{}') || {};
        if (q.quality) DL.quality = q.quality;
        DL.wifiOnly = !!q.wifiOnly;
      } catch (e2) { }
    }
    renderPrefs();
  }
  function savePrefs() {
    var set = bridge('setDownloadPrefs');
    if (set) {
      try { set(DL.quality, DL.wifiOnly); } catch (e) { }
    } else {
      try { localStorage.setItem('dfx_dl_prefs', JSON.stringify(DL)); } catch (e) { }
    }
    renderPrefs();
  }
  function renderPrefs() {
    var row = $('dl-quality');
    if (row) {
      var chips = row.querySelectorAll('.me-chip');
      for (var i = 0; i < chips.length; i++) {
        chips[i].classList.toggle('on', chips[i].getAttribute('data-q') === DL.quality);
      }
    }
    var sw = $('dl-wifi');
    if (sw) sw.classList.toggle('on', DL.wifiOnly);
    var st = $('dl-state');
    if (st) {
      var line = 'Quality: ' + (DL.quality === 'auto' ? 'Auto (best available)' : DL.quality + 'p')
        + ' · Wi-Fi only: ' + (DL.wifiOnly ? 'on' : 'off');
      if (DL.wifiOnly) {
        if (DL.onWifi) line += '\nYou are on Wi-Fi right now.';
        else if (DL.metered) line += '\nYou are on mobile data right now — new downloads will ask first.';
        else line += '\nYou are not on Wi-Fi right now — new downloads will ask first.';
      }
      st.textContent = line;
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  5) DIAGNOSTICS — build the report, copy it with one tap
  // ══════════════════════════════════════════════════════════════════════════
  function diagExtra() {
    var who = currentUser();
    return 'route=' + HERE
      + ' signedIn=' + (who ? (who.email || who.phone) + ' (uid ' + who.uid + ', ' + who.provider + ')' : 'no')
      + ' online=' + (navigator.onLine ? 'yes' : 'no')
      + ' lastError=' + (window.__dfxLastError || 'none');
  }

  function prettyDiag(jsonText) {
    var d = {};
    try { d = JSON.parse(jsonText) || {}; } catch (e) { }
    var app = d.app || {};
    var lines = [];
    lines.push('DEYMFLIX diagnostics');
    lines.push('app        : v' + (app.version || '?') + ' (code ' + (app.code || '?') + ')');
    lines.push('device     : ' + (app.device || '?') + ' / Android ' + (app.android || '?'));
    lines.push('package    : ' + (app.package || '?'));
    lines.push('network    : ' + (d.network || '?'));
    lines.push('download   : quality=' + ((d.prefs && d.prefs.quality) || 'auto')
      + ' wifiOnly=' + ((d.prefs && d.prefs.wifiOnly) ? 'on' : 'off'));
    lines.push('mic        : ' + (d.micGranted ? 'granted' : 'not granted'));
    lines.push('storage    : ' + (typeof d.freeBytes === 'number' && d.freeBytes > 0
      ? (Math.round(d.freeBytes / 1048576) + ' MB free') : 'unknown'));
    lines.push('downloads  : ' + (d.downloadRows || 0) + ' active row(s)');
    lines.push('page       : ' + (d.extra || ''));
    lines.push('userAgent  : ' + (d.ua || navigator.userAgent));
    lines.push('');
    lines.push('--- log ---');
    var logs = d.logs || [];
    for (var i = 0; i < logs.length; i++) lines.push(logs[i]);
    if (!logs.length) lines.push('(no log entries yet)');
    return lines.join('\n');
  }

  function loadDiagnostics() {
    var body = $('diag-body');
    if (!body) return;
    var get = bridge('getDiagnostics');
    if (!get) { body.textContent = 'Diagnostics need the DEYMFLIX app.'; return; }
    var raw = '';
    try { raw = get(diagExtra()); } catch (e) { raw = ''; }
    window.__dfxDiagText = prettyDiag(raw);
    body.textContent = window.__dfxDiagText;
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  6) WIRING
  // ══════════════════════════════════════════════════════════════════════════
  function appInfo() {
    var get = bridge('getAppInfo');
    if (!get) return null;
    try { return JSON.parse(get() || '{}'); } catch (e) { return null; }
  }

  function wire() {
    var root = $('me-root');
    if (root) root.hidden = false;
    renderHeader();

    var info = appInfo();
    if (info && info.version) {
      if ($('app-ver-short')) $('app-ver-short').textContent = 'v' + info.version;
      if ($('me-foot')) $('me-foot').textContent = 'DEYMFLIX app v' + info.version + ' (build ' + info.code + ')';
    }

    if ($('row-continue')) $('row-continue').onclick = function () { window.location.href = 'history.html'; };
    if ($('row-mylist')) $('row-mylist').onclick = function () { window.location.href = 'mylist.html'; };
    if ($('row-download')) $('row-download').onclick = function () {
      var open = bridge('openDownloads');
      if (open) { try { open(); return; } catch (e) { } }
      window.location.href = 'downloads.html';
    };
    if ($('row-reminder')) $('row-reminder').onclick = function () {
      toast('Reminders are not built yet — coming in a later update');
    };
    if ($('row-dl-settings')) $('row-dl-settings').onclick = function () {
      readPrefs();
      openView('view-dl');
    };
    if ($('row-diag')) $('row-diag').onclick = function () {
      openView('view-diag');
      loadDiagnostics();
    };
    if ($('row-appinfo')) $('row-appinfo').onclick = function () {
      var i = appInfo() || {};
      toast('DEYMFLIX app v' + (i.version || '?') + ' · build ' + (i.code || '?'));
    };

    // sub-view controls
    var backs = document.querySelectorAll('[data-me-close]');
    for (var i = 0; i < backs.length; i++) {
      backs[i].addEventListener('click', function () { closeViews(); renderHeader(); });
    }
    if ($('si-next')) $('si-next').onclick = nextStep;
    if ($('si-create')) $('si-create').onclick = function (e) {
      e.preventDefault();
      if ($('ca-id') && $('si-id')) $('ca-id').value = $('si-id').value;
      err($('ca-err'), '');
      openView('view-create');
    };
    if ($('si-google')) $('si-google').onclick = googleLogin;
    if ($('recent-login')) $('recent-login').onclick = function () {
      var list = readAccounts();
      var recent = list.length ? list[list.length - 1] : null;
      if (!recent) return;
      if (recent.provider === 'google') { signIn(recent); closeViews(); return; }
      if ($('si-id')) $('si-id').value = recent.email || recent.phone || '';
      if ($('si-pass-wrap')) $('si-pass-wrap').hidden = false;
      if ($('si-next')) $('si-next').textContent = 'Log in';
      err($('si-err'), 'Enter the password for ' + (recent.email || recent.phone));
    };
    if ($('ca-go')) $('ca-go').onclick = createAccount;

    var chips = document.querySelectorAll('#dl-quality .me-chip');
    for (var c = 0; c < chips.length; c++) {
      chips[c].addEventListener('click', function () {
        DL.quality = this.getAttribute('data-q');
        savePrefs();
      });
    }
    if ($('dl-wifi')) $('dl-wifi').onclick = function () {
      DL.wifiOnly = !DL.wifiOnly;
      savePrefs();
      toast(DL.wifiOnly ? 'Downloads will wait for Wi-Fi' : 'Wi-Fi only off');
    };
    if ($('dl-done')) $('dl-done').onclick = function () { closeViews(); renderHeader(); };

    if ($('diag-copy')) $('diag-copy').onclick = function () {
      var text = window.__dfxDiagText || '';
      var cp = bridge('copyText');
      if (cp) { try { cp('DEYMFLIX diagnostics', text); return; } catch (e) { } }
      try {
        navigator.clipboard.writeText(text);
      } catch (e) { }
      toast('Copied');
    };
    if ($('diag-refresh')) $('diag-refresh').onclick = loadDiagnostics;

    readPrefs();
  }

  document.addEventListener('error', function (e) {
    try { window.__dfxLastError = (e.target && e.target.src ? e.target.src : '') + ' ' + (e.message || ''); } catch (er) { }
  }, true);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  else wire();

  // The phone's account picker answers through the app shell
  // (MainScreen85.pickGoogleAccount -> MainActivity.onActivityResult).
  window.DfxGooglePicked = function (email) {
    if (!email) { err($('si-err'), 'No account chosen.'); return; }
    err($('si-err'), '');
    googleUse(String(email));
  };

  // Public hook: other app pages can ask about the signed-in user.
  window.DfxMe = { user: currentUser, isApp: true };
})();
