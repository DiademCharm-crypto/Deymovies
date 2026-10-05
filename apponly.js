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
  //  1) APP SHELL GLUE
  //     The bottom bar is built by app.js (Home, Reels, Explore, History, Me)
  //     and the Me tab opens the native Me ACTIVITY -- red theme, its own real
  //     activity, exactly like the Downloads screen. This script only supplies
  //     what the WebView still owns: the Continue Watching data and the
  //     native-mode layout switch.
  // ══════════════════════════════════════════════════════════════════════════
  // Inside the Me activity the page's own HTML bar is redundant: the native
  // bar draws the same five tabs, so hide ours and drop the reserved padding.
  var NATIVE = /(?:^|[?&])native=1(?:&|$)/.test(location.search || '') || !!window.DFX_NATIVE;
  if (ON_ME && NATIVE) {
    try { document.documentElement.classList.add('dfx-native'); } catch (e) { }
  }

  // Continue Watching moved to the Me screen, so keep it off the app's home
  // feed. This MUST stay a stylesheet: the previous version used a
  // MutationObserver watching [style, hidden] that re-wrote
  // setAttribute('hidden') from inside its own callback. Chrome queues a
  // mutation record even for a same-value setAttribute, so the observer
  // re-triggered itself forever -- an infinite microtask storm (measured:
  // 3000+ passes in 33ms) that starved the renderer's main thread. Timers and
  // touch never ran again: dead navbar, and posters stayed unrevealed because
  // the fade-in sweeps could not fire. A style element hides the section with
  // zero events, however often the page re-renders it.
  if (HERE === 'index.html') {
    try {
      var hideCwStyle = document.createElement('style');
      hideCwStyle.id = 'dfx-hide-cw';
      hideCwStyle.textContent = '#continue-watching-section{display:none !important}';
      (document.head || document.documentElement).appendChild(hideCwStyle);
    } catch (e) { }
  }

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

  // One place that turns a stored name into something safe to show. The first
  // Google sign-in stored whatever the bridge handed over, so records exist
  // that carry the TEXT "null"/"undefined" (sometimes with an invisible mark
  // next to it, which is why an exact-equality check missed them). Every
  // display path goes through here, and a repaired record is written back.
  function nameOk(v) {
    var nm = String(v == null ? '' : v)
      // zero-width / bidi / control marks: invisible, so "null" + one of
      // these still LOOKS like null while failing an equality check
      .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028-\u202E\u2060-\u206F\uFEFF]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!nm) return '';
    if (/^(null|undefined|nan|n\/a)$/i.test(nm)) return '';
    return nm;
  }
  function fixName(acc, where) {
    if (!acc) return '';
    var raw = acc.name;
    var nm = nameOk(raw);
    if (!nm) {
      nm = nameOk(String(acc.email || acc.phone || '').split('@')[0]) || 'DEYMFLIX user';
      if (raw !== nm) {
        acc.name = nm;
        try { saveAccount(acc); } catch (e) { }
        var lg = bridge('log');
        if (lg) { try { lg('me', 'name repaired at ' + (where || 'display') + ' raw=' + JSON.stringify(String(raw)) + ' -> ' + nm); } catch (e) { } }
      }
    }
    return nm;
  }

  function renderHeader() {
    var me = currentUser();
    var list = readAccounts();
    if (me) {
      // nameOk()/fixName() repair the stored name in place: a record can carry
      // the TEXT "null" (the first Google sign-in stored whatever the bridge
      // handed over), with an invisible mark next to it in some cases.
      var nm = fixName(me, 'header');
      if ($('me-title')) $('me-title').textContent = nm || 'DEYMFLIX user';
      if ($('me-sub')) $('me-sub').textContent = 'UID: ' + me.uid + (me.provider === 'google' ? ' · Google account' : '');
      if ($('me-av')) $('me-av').innerHTML = me.photo
        ? '<img src="' + me.photo + '" alt="">'
        : '<svg viewBox="0 0 24 24" width="30" height="30" fill="#54545f"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z"/></svg>';
      if ($('me-edit')) $('me-edit').hidden = false;
      if ($('hist-gate-text')) $('hist-gate-text').textContent = 'Your watch history on this phone';
      if ($('btn-signin')) {
        // r19: the Me header no longer carries the red sign-out pill; sign-out
        // lives at the bottom of Manage Account.
        $('btn-signin').textContent = 'Signed in';
        $('btn-signin').style.display = 'none';
        $('btn-signin').onclick = null;
      }
    } else {
      if ($('me-title')) $('me-title').textContent = 'Sign In/Sign Up';
      if ($('me-sub')) $('me-sub').textContent = 'Sign in to keep your list, history and downloads';
      if ($('me-edit')) $('me-edit').hidden = true;
      if ($('hist-gate-text')) $('hist-gate-text').textContent = 'Sign in to view watch history';
      if ($('btn-signin')) {
        $('btn-signin').textContent = 'Sign In';
        $('btn-signin').style.display = '';
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
    registerDevice(acc);
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
  var VIEWS = ['view-signin', 'view-create', 'view-code', 'view-dl', 'view-diag',
    'view-profile', 'view-manage', 'view-pass', 'view-secure'];
  function openView(id) {
    VIEWS.forEach(function (v) {
      var el = $(v);
      if (el) el.classList.toggle('on', v === id);
    });
    var root = $('me-root');
    if (root) root.hidden = !!id;
    // Tell the native shell which sub-view is showing: hardware Back then
    // closes the view (exactly what the page's own top-left arrow does)
    // instead of leaving the Me screen.
    var report = bridge('dfxView');
    if (report) { try { report(id || ''); } catch (e) { } }
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
    if ($('si-forgot-wrap')) $('si-forgot-wrap').hidden = true;
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
      if ($('si-forgot-wrap')) $('si-forgot-wrap').hidden = false;
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
    // A new account is confirmed with a 6-digit code before it is stored.
    startVerify('create', id, { acc: acc, pass: p1 });
  }

  // ── Google: the phone's own account, no password, no popup ──────────────
  // The shell's takeGoogleEmail slot holds the picked address as a RAW string
  // ("name@gmail.com"). Older builds of this page JSON.parsed it, which always
  // threw -- and because the slot read is destructive, the throw ATE the pick:
  // the address vanished, the native retry loop saw an empty slot and stopped,
  // and the sign-in died with "No account chosen". Read it as plain text and
  // just tolerate a JSON-quoted value for safety.
  function takePickEmail(take) {
    var raw = '';
    try { raw = String(take() || ''); } catch (e) { raw = ''; }
    raw = raw.trim();
    if (!raw) return null;
    var v = raw;
    try { var j = JSON.parse(raw); if (typeof j === 'string') v = j; } catch (e) { }
    v = String(v).trim().replace(/^"|"$/g, '').trim();
    return v || null;
  }

  function googleLogin() {
    err($('si-err'), '');
    var get = bridge('getGoogleAccounts');
    var pick = bridge('pickGoogleAccount');
    var take = bridge('takeGoogleEmail');
    if (!get && !(pick && take)) {
      err($('si-err'), 'Google login works inside the DEYMFLIX app only.');
      return;
    }
    // Preferred path: Android / Google Play services draw their own "Choose an
    // account" sheet -- names AND photos, the sheet every Google app shows. It
    // is also the only way to reach the accounts Android 14+ hides from apps,
    // so it opens first; MainScreen85 hands the chosen address back through
    // takeGoogleEmail() (and pushes it via DfxGooglePicked).
    if (pick && take) {
      err($('si-err'), 'Choose your Google account in the Android dialog.');
      try { pick(); } catch (e0) { }
      var pt = 0;
      (function pollPick() {
        pt++;
        var v = takePickEmail(take);
        if (v) { err($('si-err'), ''); googleUse(v); return; }
        if (pt < 420) setTimeout(pollPick, 700); // ~5 min: a slow pick still lands
        else err($('si-err'), 'No account chosen. Tap "Log in with Google" to try again.');
      })();
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
          // The picked address is pushed (DfxGooglePicked) AND left in a slot
          // we poll, so neither a dropped push nor a paused WebView loses it.
          var take = bridge('takeGoogleEmail');
          if (take) {
            var pt = 0;
            var pollPick = function () {
              pt++;
              var v = takePickEmail(take);
              if (v) { err($('si-err'), ''); googleUse(v); return; }
              if (pt < 420) setTimeout(pollPick, 700); // ~5 min: a slow pick still lands
              else err($('si-err'), 'No account chosen.');
            };
            setTimeout(pollPick, 700);
          }
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
      // A name of "null" (the string) means a broken first attempt stored the
      // text "null": repair it here so the header never shows it again.
      if (!acc.name || acc.name === 'null') acc.name = em.split('@')[0];
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
  //  3b) PROFILE / MANAGE ACCOUNT / SECURITY / VERIFICATION CODE
  //      Everything below is the Me screen's own settings, in the shape the
  //      app's users asked for: an Edit button next to the name that opens a
  //      profile editor, Manage Account, Account and Security with a device
  //      list, and a 6-digit verification code step for new accounts and
  //      password resets.
  // ══════════════════════════════════════════════════════════════════════════
  function saveAccount(acc) {
    var list = readAccounts();
    for (var i = 0; i < list.length; i++) {
      if (list[i] && list[i].uid === acc.uid) { list[i] = acc; break; }
    }
    writeAccounts(list);
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[<>&"]/g, ''); }

  function avatarHtml(acc, size) {
    if (acc && acc.photo) return '<img src="' + esc(acc.photo) + '" alt="">';
    var s = size || 30;
    var ch = String(fixName(acc, 'avatar') || acc.email || acc.phone || '?').trim().charAt(0).toUpperCase() || '?';
    if (!acc) {
      return '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="#54545f">' +
        '<path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z"/></svg>';
    }
    return '<span class="me-initial" style="font-size:' + Math.round(s * 0.42) + 'px">' + esc(ch) + '</span>';
  }

  // demshots011@gmail.com -> demshots***@gmail.com (same masking the account
  // screens are expected to show: the address is never fully on screen).
  function maskMail(v) {
    var m = /^([^@]*)@(.+)$/.exec(String(v || ''));
    if (!m) return String(v || '—');
    var head = m[1].length > 8 ? m[1].slice(0, 8) : m[1];
    return head + '***@' + m[2];
  }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function fmtStamp(ts) {
    var d = new Date(ts || Date.now());
    if (isNaN(d.getTime())) d = new Date();
    return d.getFullYear() + '/' + pad2(d.getMonth() + 1) + '/' + pad2(d.getDate()) + ' '
      + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
  }
  function accountTarget(a) { return (a && (a.email || a.phone)) || '—'; }

  // ── devices that logged into this account ────────────────────────────────
  // NOTE (honest): the site has no account server, so this list is built on
  // THIS phone. A device appears here once it signs in with the same account,
  // which on a single phone is the phone itself -- cross-device lists need the
  // account backend that is still to be connected.
  var K_DEVICES = 'dfx_devices_v1';
  function readDevices() {
    try { return JSON.parse(localStorage.getItem(K_DEVICES) || '{}') || {}; } catch (e) { return {}; }
  }
  function writeDevices(all) {
    try { localStorage.setItem(K_DEVICES, JSON.stringify(all)); } catch (e) { }
  }
  function thisDeviceId() {
    var id = '';
    try { id = localStorage.getItem('dfx_device_v1') || ''; } catch (e) { }
    if (!id) {
      id = 'dev-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e6).toString(36);
      try { localStorage.setItem('dfx_device_v1', id); } catch (e2) { }
    }
    return id;
  }
  function deviceSnapshot() {
    var info = appInfo() || {};
    if (!info.model && !info.device) {
      // No app shell behind the page (harness / browser): keep the entry plain
      return { id: thisDeviceId(), label: 'This phone', sys: 'Android', lastLogin: Date.now() };
    }
    var model = String(info.model || info.device);
    var code = String(info.deviceCode || model).replace(/\s+/g, '_');
    return {
      id: thisDeviceId(),
      label: model.replace(/\s+/g, '_') + '-OP_' + code,
      sys: info.sys || ('android_' + (info.release || '?') + '_' + model.replace(/\s+/g, '_')),
      lastLogin: Date.now()
    };
  }
  function registerDevice(acc) {
    if (!acc) return;
    var all = readDevices();
    var list = all[acc.uid] || [];
    var snap = deviceSnapshot();
    var found = null;
    for (var i = 0; i < list.length; i++) { if (list[i] && list[i].id === snap.id) { found = list[i]; break; } }
    if (found) {
      found.label = snap.label; found.sys = snap.sys; found.lastLogin = snap.lastLogin;
    } else {
      snap.main = list.length === 0;          // first device = the main device
      list.push(snap);
      if (list.length > 3) list = list.slice(0, 3);   // 3-device limit
    }
    all[acc.uid] = list;
    writeDevices(all);
  }

  // ── profile editor (name + picture) ──────────────────────────────────────
  var pendingPhoto = null;
  function openProfile() {
    var me = currentUser();
    if (!me) { openView('view-signin'); prepareSignIn(); return; }
    pendingPhoto = null;
    renderPeAvatar(me);
    if ($('pe-name')) $('pe-name').value = fixName(me, 'editor') || '';
    if ($('pe-remove')) $('pe-remove').hidden = !me.photo;
    if ($('pe-photo')) $('pe-photo').textContent = me.photo ? 'Change photo' : 'Add photo';
    err($('pe-err'), '');
    openView('view-profile');
  }
  function renderPeAvatar(me) {
    var box = $('pe-av');
    if (!box) return;
    if (pendingPhoto) { box.innerHTML = '<img src="' + esc(pendingPhoto) + '" alt="">'; return; }
    box.innerHTML = avatarHtml(me, 42);
  }
  // The picked file is centre-cropped to 256x256 and stored as a JPEG data
  // URL: small enough for localStorage, big enough for a 58px avatar.
  function photoChosen(file) {
    if (!file) return;
    if (!/^image\//.test(file.type || '')) { err($('pe-err'), 'Pick an image file'); return; }
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        try {
          var side = 256;
          var c = document.createElement('canvas');
          c.width = side; c.height = side;
          var ctx = c.getContext('2d');
          var s = Math.min(img.width, img.height) || side;
          var sx = (img.width - s) / 2, sy = (img.height - s) / 2;
          ctx.drawImage(img, sx, sy, s, s, 0, 0, side, side);
          var url = c.toDataURL('image/jpeg', 0.82);
          if (url.length > 400000) url = c.toDataURL('image/jpeg', 0.6);   // keep it tiny
          pendingPhoto = url;
          var me = currentUser();
          if ($('pe-av')) $('pe-av').innerHTML = '<img src="' + url + '" alt="">';
          if ($('pe-remove')) $('pe-remove').hidden = false;
          if ($('pe-photo')) $('pe-photo').textContent = 'Change photo';
          err($('pe-err'), '');
        } catch (e) { err($('pe-err'), 'Could not read that picture'); }
      };
      img.onerror = function () { err($('pe-err'), 'Could not read that picture'); };
      img.src = String(reader.result || '');
    };
    reader.onerror = function () { err($('pe-err'), 'Could not read that file'); };
    try { reader.readAsDataURL(file); } catch (e) { err($('pe-err'), 'Could not read that file'); }
  }
  function saveProfile() {
    var me = currentUser();
    if (!me) return;
    var name = ($('pe-name') && $('pe-name').value || '').trim();
    if (name.length > 24) name = name.slice(0, 24);
    if (name) me.name = name;
    if (pendingPhoto) me.photo = pendingPhoto;
    saveAccount(me);
    pendingPhoto = null;
    renderHeader();
    closeViews();
    toast('Profile saved');
  }

  // ── Manage Account ───────────────────────────────────────────────────────
  var deleteArmed = 0;
  function openManage() {
    var me = currentUser();
    if (!me) { openView('view-signin'); prepareSignIn(); return; }
    renderManage();
    openView('view-manage');
  }
  function renderManage() {
    var me = currentUser();
    if (!me) return;
    deleteArmed = 0;
    signOutArmed = 0;
    if ($('ma-av')) $('ma-av').innerHTML = avatarHtml(me, 40);
    if ($('ma-name')) $('ma-name').textContent = fixName(me, 'manage') || accountTarget(me);
    if ($('ma-method')) $('ma-method').textContent = me.provider === 'google' ? 'Google' : (me.phone ? 'phone' : 'email');
    if ($('ma-target')) $('ma-target').textContent = accountTarget(me);
    if ($('ma-uid')) $('ma-uid').textContent = String(me.uid);
    if ($('ma-plan')) $('ma-plan').textContent = 'DEYMFLIX account · joined ' + fmtStamp(me.created).slice(0, 10);
    if ($('ma-delete')) $('ma-delete').firstChild.textContent = 'Delete Account ';
    if ($('ma-note')) $('ma-note').textContent = me.provider === 'google'
      ? 'You sign in with the Google account on this phone, so there is no password to change here.'
      : 'Your password is stored on this phone as a salted hash — never in clear text.';
    if ($('ma-signout')) $('ma-signout').textContent = 'Sign Out';
  }
  // Sign out moved here from the Me header (r19): centered at the bottom of
  // Manage Account. Two taps so a stray press cannot sign the user out.
  var signOutArmed = 0;
  function signOut() {
    if (!currentUser()) { closeViews(); return; }
    if (Date.now() - signOutArmed > 8000) {
      signOutArmed = Date.now();
      if ($('ma-signout')) $('ma-signout').textContent = 'Tap again to sign out';
      return;
    }
    signOutArmed = 0;
    writeSession(null);
    closeViews();
    renderHeader();
    toast('Signed out');
  }
  function deleteAccount() {
    var me = currentUser();
    if (!me) return;
    if (!deleteArmed) {
      deleteArmed = Date.now();
      if ($('ma-delete')) $('ma-delete').firstChild.textContent = 'Tap again to delete ';
      if ($('ma-note')) $('ma-note').textContent = 'Deleting removes this account, its UID and its device list from this phone.';
      return;
    }
    if (Date.now() - deleteArmed > 10000) { deleteArmed = 0; renderManage(); return; }
    var list = readAccounts().filter(function (a) { return !a || a.uid !== me.uid; });
    writeAccounts(list);
    var all = readDevices();
    delete all[me.uid];
    writeDevices(all);
    writeSession(null);
    deleteArmed = 0;
    closeViews();
    renderHeader();
    toast('Account deleted');
  }

  // ── Change Password ──────────────────────────────────────────────────────
  var pwResetMode = false;
  function openPass(reset) {
    var me = currentUser();
    if (!me) return;
    if (me.provider === 'google') {
      toast('Google accounts use your Google password');
      return;
    }
    pwResetMode = !!reset;
    if ($('pw-cur-wrap')) $('pw-cur-wrap').hidden = pwResetMode;
    ['pw-cur', 'pw-new', 'pw-new2'].forEach(function (id) { if ($(id)) $(id).value = ''; });
    err($('pw-err'), '');
    openView('view-pass');
  }
  function savePassword() {
    var me = currentUser();
    if (!me) return;
    var p1 = ($('pw-new') && $('pw-new').value) || '';
    var p2 = ($('pw-new2') && $('pw-new2').value) || '';
    if (p1.length < 4) { err($('pw-err'), 'Use at least 4 characters for the password'); return; }
    if (p1 !== p2) { err($('pw-err'), 'The two passwords do not match'); return; }
    var finish = function () {
      sha256(saltOf(me) + ':' + p1).then(function (h) {
        me.hash = h;
        saveAccount(me);
        closeViews();
        renderHeader();
        toast('Password updated');
      });
    };
    if (pwResetMode) { finish(); return; }
    var cur = ($('pw-cur') && $('pw-cur').value) || '';
    if (!cur) { err($('pw-err'), 'Enter your current password'); return; }
    sha256(saltOf(me) + ':' + cur).then(function (h) {
      if (h !== me.hash) { err($('pw-err'), 'That is not the current password'); return; }
      finish();
    });
  }

  // ── verification code (6 digits) ─────────────────────────────────────────
  // Used by "create account" and by "forgot password". The code is delivered
  // as an Android notification when the app can post one; the site has no
  // email/SMS sender yet, and the page says so instead of pretending a mail
  // went out.
  var PENDING_CODE = null;
  function makeCode() {
    var s = '';
    for (var i = 0; i < 6; i++) s += Math.floor(Math.random() * 10);
    return s;
  }
  function deliverCode(target, code) {
    var send = bridge('sendCode');
    if (!send) return false;
    try { return String(send(String(target || ''), String(code)) || '') === 'sent'; } catch (e) { return false; }
  }
  function startVerify(kind, target, payload) {
    var code = makeCode();
    PENDING_CODE = { code: code, kind: kind, target: target, payload: payload || {}, expires: Date.now() + 10 * 60000, at: Date.now() };
    var sent = deliverCode(target, code);
    if ($('code-sub')) $('code-sub').textContent = 'Enter the 6-digit code for ' + target + '.';
    if ($('code-note')) $('code-note').textContent = sent
      ? 'The code was sent to this phone as a notification — open the shade to read it. It expires in 10 minutes.'
      : 'Email/SMS delivery is not connected yet, so the code stays on this phone: ' + code;
    if ($('code-input')) $('code-input').value = '';
    err($('code-err'), '');
    openView('view-code');
  }
  function verifyCode() {
    err($('code-err'), '');
    if (!PENDING_CODE) { err($('code-err'), 'Ask for a new code'); return; }
    if (Date.now() > PENDING_CODE.expires) { err($('code-err'), 'That code expired — send a new one'); return; }
    var got = String(($('code-input') && $('code-input').value) || '').replace(/\D/g, '');
    if (got.length !== 6) { err($('code-err'), 'Enter all 6 digits'); return; }
    if (got !== PENDING_CODE.code) { err($('code-err'), 'Wrong code. Check the digits and try again.'); return; }
    var p = PENDING_CODE;
    PENDING_CODE = null;
    if (p.kind === 'create') {
      var acc = p.payload.acc, pass = p.payload.pass;
      sha256(saltOf(acc) + ':' + pass).then(function (h) {
        acc.hash = h;
        var list = readAccounts();
        list.push(acc);
        writeAccounts(list);
        registerDevice(acc);
        signIn(acc);
        closeViews();
        if ($('ca-pass')) $('ca-pass').value = '';
        if ($('ca-pass2')) $('ca-pass2').value = '';
        toast('Account created — welcome!');
      });
      return;
    }
    if (p.kind === 'reset') {
      signIn(p.payload.acc, true);
      openPass(true);
      toast('Code accepted — set a new password');
      return;
    }
    closeViews();
  }
  function resendCode() {
    if (!PENDING_CODE) { return; }
    var p = PENDING_CODE;
    startVerify(p.kind, p.target, p.payload);
    toast('New code sent');
  }
  function forgotPassword() {
    err($('si-err'), '');
    var raw = ($('si-id') && $('si-id').value || '').trim();
    var acc = findAccount(raw);
    if (!acc) { err($('si-err'), 'Type your email or phone number first, then tap again'); return; }
    if (acc.provider === 'google') { err($('si-err'), 'That account signs in with Google — no password needed'); return; }
    startVerify('reset', accountTarget(acc), { acc: acc });
  }

  // ── Account and Security (device management) ─────────────────────────────
  function openSecurity() {
    var me = currentUser();
    if (!me) { openView('view-signin'); prepareSignIn(); return; }
    renderSecurity();
    openView('view-secure');
  }
  function renderSecurity() {
    var me = currentUser();
    if (!me) return;
    if ($('se-name')) $('se-name').textContent = fixName(me, 'security') || 'Not set';
    if ($('se-mail')) $('se-mail').textContent = me.email ? maskMail(me.email) : (me.phone ? maskMail(me.phone) : '—');
    var box = $('se-devices');
    if (!box) return;
    var list = (readDevices()[me.uid] || []).slice(0);
    var mine = thisDeviceId();
    if (!list.length) { box.innerHTML = '<p class="me-p">No device has signed in with this account yet.</p>'; return; }
    var html = '';
    list.forEach(function (d) {
      var isThis = d.id === mine;
      html += '<div class="me-dev">'
        + '<div class="me-dev-top">'
        + '<span class="me-dev-ico"><svg viewBox="0 0 24 24"><rect x="6" y="2" width="12" height="20" rx="2.4"></rect><line x1="11" y1="18.5" x2="13" y2="18.5"></line></svg></span>'
        + '<span class="me-dev-name">' + esc(d.label) + '</span>'
        + (d.main ? '<span class="me-dev-badge">Main device</span>' : '')
        + '</div>'
        + '<div class="me-dev-line">System : ' + esc(d.sys) + '</div>'
        + '<div class="me-dev-line now"><span>Last login time : ' + esc(fmtStamp(d.lastLogin)) + '</span>'
        + (isThis ? '<span class="now-tag">Current Device</span>' : '') + '</div>'
        + (isThis ? '<div class="me-dev-this">This is the phone you are using now</div>'
          : '<button class="me-dev-out" data-dev="' + esc(d.id) + '">Log out this device</button>')
        + '</div>';
    });
    box.innerHTML = html;
    var outs = box.querySelectorAll('.me-dev-out');
    for (var i = 0; i < outs.length; i++) {
      outs[i].addEventListener('click', function () {
        var id = this.getAttribute('data-dev');
        var all = readDevices();
        var list2 = (all[me.uid] || []).filter(function (d) { return d.id !== id; });
        all[me.uid] = list2;
        writeDevices(all);
        renderSecurity();
        toast('Device removed');
      });
    }
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
  //  4b) CONTINUE WATCHING (Me screen)
  //      The Me screen now carries the carousel the home feed used to show.
  //      It reads the same store the site writes, so a card resumes the exact
  //      season + episode (and one card per series, newest episode only).
  // ══════════════════════════════════════════════════════════════════════════
  function cwItems() {
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem('deymflix_continue_watching') || '{}') || {}; }
    catch (e) { saved = {}; }
    var byBase = {};
    Object.keys(saved).forEach(function (key) {
      var it = saved[key];
      if (!it || it.finished || Number(it.progress) >= 95) return;
      var base = key, season = null, ep = null;
      var m = /^(.*)-s(\d+)-ep(\d+)$/.exec(key);
      if (m) { base = m[1]; season = parseInt(m[2], 10); ep = parseInt(m[3], 10); }
      else {
        m = /^(.*)-ep(\d+)$/.exec(key);
        if (m) { base = m[1]; ep = parseInt(m[2], 10); }
      }
      var prev = byBase[base];
      if (!prev || (it.updatedAt || 0) > (prev.updatedAt || 0)) {
        byBase[base] = {
          base: base, title: it.title || '', poster: it.poster || '',
          progress: Number(it.progress) || 0, season: season, ep: ep,
          updatedAt: it.updatedAt || 0
        };
      }
    });
    var list = Object.keys(byBase).map(function (b) { return byBase[b]; });
    list.sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); });
    return list;
  }

  // ── catalog posters (the same artwork index.html shows) ──────────────────
  // me.html loads none of the catalog files, so a CW card whose saved poster
  // was empty showed nothing at all. The catalogs are 800 KB of page scripts
  // (app.js holds the main 826-title list), so _tools/_poster_map.cjs turns
  // them into posters.json (title -> poster) at build time and this screen
  // downloads that one small file -- the same artwork the home feed uses.
  var POSTER_MAP = null;
  var posterMapStarted = false;
  function ensurePosterMap() {
    if (posterMapStarted) return;
    posterMapStarted = true;
    if (typeof fetch !== 'function') return;
    fetch('posters.json?pm=1', { cache: 'no-cache' })
      .then(function (r) { return (r && r.ok) ? r.json() : null; })
      .then(function (j) {
        if (!j || !j.map || typeof j.map !== 'object') return;
        POSTER_MAP = j.map;
        var n = 0;
        for (var k in POSTER_MAP) n++;
        var lg = bridge('log');
        if (lg) { try { lg('cw', 'poster map ready: ' + n + ' titles'); } catch (e) { } }
        // The strip was drawn before the file arrived, so draw it again: the
        // placeholders turn into posters without a reload.
        renderContinue();
      })
      .catch(function () { });
  }
  // Saved poster first, then the catalog map. A stored title is often longer
  // than its catalog entry ("Batman: Knightfall Part 1: Knightfall" against
  // the base "Batman: Knightfall"), so a catalog key matching up to a word
  // boundary on either side is accepted and the longest one wins.
  function posterFor(it) {
    var p = String(it.poster || '').trim();
    if (p) return p;
    if (!POSTER_MAP) { ensurePosterMap(); return ''; }
    var t = String(it.title || '').split(' - ')[0].trim().toLowerCase();
    if (!t) return '';
    if (POSTER_MAP[t]) return POSTER_MAP[t];
    var best = '';
    for (var k in POSTER_MAP) {
      if (k.length < 4) continue;
      var shorter = k.length <= t.length ? k : t;
      var longer = k.length <= t.length ? t : k;
      if (longer.indexOf(shorter) !== 0) continue;
      var boundary = longer.charAt(shorter.length);
      if (boundary && /[a-z0-9]/.test(boundary)) continue;
      if (k.length > best.length) best = k;
    }
    return best ? POSTER_MAP[best] : '';
  }

  function renderContinue() {
    var strip = $('cw-strip');
    var sec = $('cw-section');
    if (!strip) return;
    var list = cwItems();
    if (!list.length) { if (sec) sec.hidden = true; return; }
    if (sec) sec.hidden = false;
    ensurePosterMap();
    strip.innerHTML = '';
    list.forEach(function (it) {
      var card = document.createElement('div');
      card.className = 'poster-card';
      card.style.cssText = 'position:relative';
      var label = it.ep ? ('S' + (it.season || 1) + ' E' + it.ep) : '';
      var badge = label ? label
        : (it.progress > 0 ? (Math.round(it.progress) + '% watched') : '');
      // Posters come from the saved record, else from the same catalog files
      // the home feed uses ("downloaded from our server, same as index.html").
      // A card still renders with a title bar while its poster is unknown.
      var p = posterFor(it);
      card.innerHTML =
        (p ? '<img src="' + String(p).replace(/"/g, '') + '" alt="" loading="lazy" decoding="async">'
           : '<div class="me-cw-nophoto"></div>') +
        '<div class="poster-card-overlay"><div class="poster-card-title">' +
        String(it.title).split(' - ')[0].replace(/[<>&]/g, '') + '</div></div>' +
        (badge ? '<div class="mylist-progress-badge">' + badge + '</div>' : '') +
        '<div style="position:absolute;bottom:0;left:0;width:100%;height:4px;background:rgba(255,255,255,.2)">' +
        '<div style="width:' + Math.min(100, Math.max(0, it.progress)) + '%;height:100%;background:#e50914"></div></div>';
      // No click handler: the row is a plain "Continue Watching" strip now —
      // the user asked for the text without the button behaviour.
      strip.appendChild(card);
      // theme-v2.css keeps every poster image at opacity 0 until it carries
      // .is-ready (the shimmer tile stays until then) -- app.js adds that
      // class on the home feed, and me.html never loads app.js, so the strip
      // has to reveal its own artwork. An image that fails is revealed too:
      // a card must never be left blank, and the failure goes to the log.
      var im = card.querySelector('img');
      if (im) {
        var reveal = function () { try { im.classList.add('is-ready'); } catch (e) { } };
        im.addEventListener('load', reveal);
        im.addEventListener('error', function () {
          reveal();
          var elg = bridge('log');
          if (elg) { try { elg('cw', 'poster image failed: ' + im.getAttribute('src')); } catch (e) { } }
        });
        if (im.complete) reveal();     // cached images never fire load again
      }
    });
    // One line per strip build once the catalog map is in: which titles got
    // artwork and which stayed on the placeholder (visible in Diagnostics).
    if (POSTER_MAP) {
      var lg = bridge('log');
      if (lg) {
        try {
          var miss = [];
          list.forEach(function (it) {
            if (!posterFor(it)) miss.push(String(it.title || '?').slice(0, 60));
          });
          lg('cw', 'strip: ' + list.length + ' cards, ' + (list.length - miss.length) + ' posters'
            + (miss.length ? ', no artwork for: ' + miss.join(' | ') : ''));
        } catch (e) { }
      }
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

    // r19: "Continue Watching" is a plain label now -- the strip under it is
    // the content, and the full history still lives on the History tab.
    if ($('row-continue')) $('row-continue').onclick = null;
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

    // profile / account / security
    if ($('me-edit')) $('me-edit').onclick = openProfile;
    if ($('row-manage')) $('row-manage').onclick = openManage;
    if ($('row-secure')) $('row-secure').onclick = openSecurity;
    if ($('pe-photo')) $('pe-photo').onclick = function () {
      if ($('pe-file')) { try { $('pe-file').click(); } catch (e) { } }
    };
    if ($('pe-file')) $('pe-file').onchange = function () {
      var f = this.files && this.files[0];
      photoChosen(f);
    };
    if ($('pe-remove')) $('pe-remove').onclick = function () {
      pendingPhoto = null;
      var me = currentUser();
      if (me) { delete me.photo; saveAccount(me); }
      renderPeAvatar(currentUser());
      this.hidden = true;
      if ($('pe-photo')) $('pe-photo').textContent = 'Add photo';
      renderHeader();
      toast('Photo removed');
    };
    if ($('pe-save')) $('pe-save').onclick = saveProfile;
    if ($('pe-cancel')) $('pe-cancel').onclick = function (e) { e.preventDefault(); closeViews(); };
    if ($('ma-pass')) $('ma-pass').onclick = function () { openPass(false); };
    if ($('ma-delete')) $('ma-delete').onclick = deleteAccount;
    if ($('ma-signout')) $('ma-signout').onclick = signOut;
    if ($('ma-copy-uid')) $('ma-copy-uid').onclick = function () {
      var me = currentUser();
      if (!me) return;
      var cp = bridge('copyText');
      if (cp) { try { cp('DEYMFLIX UID', String(me.uid)); toast('UID copied'); return; } catch (e) { } }
      toast('UID: ' + me.uid);
    };
    if ($('pw-save')) $('pw-save').onclick = savePassword;
    if ($('pw-forgot')) $('pw-forgot').onclick = function (e) {
      e.preventDefault();
      var me = currentUser();
      if (!me) return;
      startVerify('reset', accountTarget(me), { acc: me });
    };
    if ($('code-go')) $('code-go').onclick = verifyCode;
    if ($('code-again')) $('code-again').onclick = function (e) { e.preventDefault(); resendCode(); };
    if ($('si-forgot')) $('si-forgot').onclick = function (e) { e.preventDefault(); forgotPassword(); };
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
    renderContinue();
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

  // A pick can also land while this page sits parked behind the Android sheet
  // (WebViews are paused/frozen in the background), which would strand the
  // choice the user already made in the phone's own dialog. So every load of
  // the Me screen adopts a pick the app shell is still holding.
  (function adoptPendingPick() {
    var take = bridge('takeGoogleEmail');
    if (!take) return;
    function read() {
      var v = takePickEmail(take);
      if (v) { err($('si-err'), ''); googleUse(v); }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', read);
    else read();
  })();

  // Public hook: other app pages can ask about the signed-in user.
  window.DfxMe = { user: currentUser, isApp: true };

  // Native Back (Me screen): close the open sub-view first, exactly like the
  // page's own top-left arrow. MeActivity calls this when its slot says a
  // view is showing.
  window.DfxCloseView = function () {
    var open = null;
    VIEWS.forEach(function (v) {
      var el = $(v);
      if (el && el.classList.contains('on')) open = v;
    });
    if (!open) return false;
    closeViews();
    renderHeader();
    return true;
  };
})();
