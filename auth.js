// ============================================================================
// DEYMFLIX — Google sign-in (Firebase Auth, Gmail accounts only)
// LOCAL PREVIEW BUILD — not wired into any published page yet.
// ============================================================================
// To go live later, add to each page:
//   1. <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js">
//      next to the existing firebase-app/database compat tags
//   2. <script src="auth.js?v=1.0" defer></script>
//   3. A slot: <span id="dfx-auth-slot"></span> in the header (auto-mounts there)
//
// PREREQUISITES (one-time, in the Firebase console):
//   • Authentication → Sign-in method → Google → Enable
//   • Authentication → Settings → Authorized domains → add deymflix.eu.cc
//     (localhost is authorized by default, which is why the preview works now)
// ============================================================================
(function () {
  'use strict';
  if (window.DfxAuth) return;

  var user = null;            // firebase user
  var initialized = false;

  // ── injected styles (glass, matches theme-v2) ─────────────────────────────
  var css = [
    '.dfx-auth-btn{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:22px;',
    'border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);color:#fff;',
    'font-size:.85rem;font-weight:600;cursor:pointer;transition:background .2s}',
    '.dfx-auth-btn:hover{background:rgba(255,255,255,.16)}',
    '.dfx-auth-avatar{width:34px;height:34px;border-radius:50%;border:2px solid #e50914;cursor:pointer}',
    '.dfx-auth-modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.72);backdrop-filter:blur(6px);',
    'z-index:100000;display:flex;align-items:center;justify-content:center}',
    '.dfx-auth-modal{width:min(400px,92vw);background:#16161c;border:1px solid rgba(255,255,255,.1);',
    'border-radius:18px;padding:32px 28px;text-align:center;color:#fff;font-family:inherit;',
    'box-shadow:0 30px 80px rgba(0,0,0,.6)}',
    '.dfx-auth-modal h2{margin:14px 0 6px;font-size:1.35rem}',
    '.dfx-auth-modal p{color:#9a9aa4;font-size:.88rem;line-height:1.5;margin:0 0 20px}',
    '.dfx-google-btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;',
    'padding:12px;border-radius:24px;border:none;background:#fff;color:#222;font-weight:600;',
    'font-size:.95rem;cursor:pointer;transition:transform .15s,box-shadow .15s}',
    '.dfx-google-btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(255,255,255,.18)}',
    '.dfx-auth-close{position:absolute;top:14px;right:18px;background:none;border:none;',
    'color:#888;font-size:1.4rem;cursor:pointer}',
    '.dfx-auth-err{color:#ff6b72;font-size:.82rem;margin-top:12px;min-height:1em}',
    '.dfx-auth-perks{text-align:left;margin:0 0 22px;padding:0;list-style:none;color:#b9b9c2;',
    'font-size:.84rem;line-height:1.9}',
    '.dfx-auth-perks li:before{content:"✓ ";color:#e50914;font-weight:700}'
  ].join('');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ── modal ─────────────────────────────────────────────────────────────────
  var modal = null;
  function openModal() {
    if (modal) return;
    modal = document.createElement('div');
    modal.className = 'dfx-auth-modal-bg';
    modal.innerHTML =
      '<div class="dfx-auth-modal" style="position:relative">' +
      '  <button class="dfx-auth-close" aria-label="Close">×</button>' +
      '  <svg width="44" height="44" viewBox="0 0 200 200">' +
      '    <rect x="10" y="10" width="180" height="180" rx="42" fill="#17171b"/>' +
      '    <path d="M70 42 L104 42 C148 42 160 70 160 100 C160 130 148 158 104 158 L70 158" fill="none" stroke="#e50914" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>' +
      '    <circle cx="100" cy="100" r="29.7" fill="none" stroke="#d9d9e0" stroke-width="2.5"/>' +
      '    <circle cx="100" cy="100" r="28" fill="#0c0c10"/>' +
      '    <ellipse cx="100" cy="84.3" rx="6.2" ry="6.9" fill="#e3e3ea"/><ellipse cx="114.9" cy="95.2" rx="6.2" ry="6.9" fill="#e3e3ea"/>' +
      '    <ellipse cx="109.2" cy="112.7" rx="6.2" ry="6.9" fill="#e3e3ea"/><ellipse cx="90.8" cy="112.7" rx="6.2" ry="6.9" fill="#e3e3ea"/>' +
      '    <ellipse cx="85.1" cy="95.2" rx="6.2" ry="6.9" fill="#e3e3ea"/>' +
      '    <circle cx="100" cy="100" r="6.7" fill="none" stroke="#e50914" stroke-width="2.2"/>' +
      '    <circle cx="100" cy="100" r="4.5" fill="#0c0c10"/><circle cx="100" cy="100" r="2.5" fill="#e50914"/>' +
      '  </svg>' +
      '  <h2>Sign in to DEYMFLIX</h2>' +
      '  <p>Use your Gmail account — it takes one tap.</p>' +
      '  <ul class="dfx-auth-perks">' +
      '    <li>Sync My List across phone, PC and TV</li>' +
      '    <li>Keep your watch progress everywhere</li>' +
      '    <li>Request movies and get notified</li>' +
      '  </ul>' +
      '  <button class="dfx-google-btn">' +
      '    <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.7l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>' +
      '    Continue with Google' +
      '  </button>' +
      '  <div class="dfx-auth-err"></div>' +
      '</div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
    modal.querySelector('.dfx-auth-close').addEventListener('click', closeModal);
    modal.querySelector('.dfx-google-btn').addEventListener('click', function () {
      signIn(function (err) {
        if (err) modal.querySelector('.dfx-auth-err').textContent = err;
      });
    });
  }
  function closeModal() { if (modal) { modal.remove(); modal = null; } }

  // ── auth core ─────────────────────────────────────────────────────────────
  function waitForFirebase(cb, tries) {
    if (window.firebase && firebase.auth) return cb();
    if ((tries || 0) > 50) return cb('Firebase SDK not loaded on this page');
    setTimeout(function () { waitForFirebase(cb, (tries || 0) + 1); }, 120);
  }

  function ensureApp() {
    var cfg = window.__DEYMFLIX_CONFIG__ && window.__DEYMFLIX_CONFIG__.FIREBASE_CONFIG;
    if (!cfg) throw new Error('config.js not loaded');
    if (!firebase.apps.length) firebase.initializeApp(cfg);
    return firebase.auth();
  }

  function signIn(done) {
    waitForFirebase(function (err) {
      if (err) return done && done(err);
      var auth;
      try { auth = ensureApp(); } catch (e) { return done && done(String(e.message || e)); }
      var provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      auth.signInWithPopup(provider).then(function (res) {
        closeModal();
        if (done) done(null, res.user);
      }).catch(function (e) {
        var msg;
        switch (e.code) {
          case 'auth/popup-closed-by-request':
          case 'auth/cancelled-popup-request': msg = ''; break;
          case 'auth/popup-blocked': msg = 'Popup blocked — allow popups and try again.'; break;
          case 'auth/unauthorized-domain': msg = 'This domain is not authorized in Firebase yet.'; break;
          case 'auth/operation-not-allowed': msg = 'Google sign-in is not enabled in the Firebase console yet.'; break;
          default: msg = e.message || 'Sign-in failed.';
        }
        if (done) done(msg);
      });
    });
  }

  function isGmail(u) {
    var em = (u && u.email || '').toLowerCase();
    return em.indexOf('@gmail.com') !== -1 || em.indexOf('@googlemail.com') !== -1;
  }

  function onStateChanged(fbUser) {
    user = fbUser;
    if (fbUser && !isGmail(fbUser)) {
      // Gmail accounts only — sign out anything else quietly.
      firebase.auth().signOut().then(function () {
        user = null; paint(); notify('Only Gmail accounts can sign in.');
      });
      return;
    }
    if (fbUser) {
      try { localStorage.setItem('dfx_user', JSON.stringify({ uid: fbUser.uid, name: fbUser.displayName, email: fbUser.email, photo: fbUser.photoURL })); } catch (e) {}
      // minimal profile mirror (used later for My List sync — harmless now)
      try {
        var db = firebase.database();
        db.ref('users/' + fbUser.uid + '/profile').update({
          name: fbUser.displayName || '', email: fbUser.email || '',
          photo: fbUser.photoURL || '', lastSeen: firebase.database.ServerValue.TIMESTAMP
        });
      } catch (e) { /* db optional */ }
    } else {
      try { localStorage.removeItem('dfx_user'); } catch (e) {}
    }
    paint();
    if (DfxAuth.onChange) DfxAuth.onChange(user);
  }

  // ── header UI ─────────────────────────────────────────────────────────────
  function paint() {
    DfxAuth.slots.forEach(function (slot) {
      slot.innerHTML = '';
      if (user) {
        var img = document.createElement('img');
        img.className = 'dfx-auth-avatar';
        img.src = user.photoURL || '';
        img.alt = user.displayName || 'account';
        img.title = (user.displayName || '') + ' — click to sign out';
        img.addEventListener('click', function () {
          if (confirm('Sign out of DEYMFLIX?')) firebase.auth().signOut();
        });
        slot.appendChild(img);
      } else {
        var b = document.createElement('button');
        b.className = 'dfx-auth-btn';
        b.textContent = 'Sign in';
        b.addEventListener('click', openModal);
        slot.appendChild(b);
      }
    });
  }

  var DfxAuth = {
    slots: [],
    onChange: null,
    init: function () {
      if (initialized) return;
      initialized = true;
      waitForFirebase(function (err) {
        if (err) { console.warn('[DfxAuth]', err); return; }
        try { ensureApp(); } catch (e) { console.warn('[DfxAuth]', e.message); return; }
        firebase.auth().onAuthStateChanged(onStateChanged);
      });
    },
    mount: function (selector) {
      var self = this;
      document.querySelectorAll(selector || '#dfx-auth-slot').forEach(function (el) {
        if (self.slots.indexOf(el) === -1) self.slots.push(el);
      });
      paint();
    },
    openSignIn: openModal,
    signOut: function () { if (window.firebase && firebase.auth) firebase.auth().signOut(); },
    currentUser: function () { return user; },
    cachedUser: function () { try { return JSON.parse(localStorage.getItem('dfx_user') || 'null'); } catch (e) { return null; } },
    notify: notify
  };

  function notify(msg) {
    var t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;bottom:26px;left:50%;transform:translateX(-50%);background:#e50914;color:#fff;padding:10px 20px;border-radius:22px;font-size:.85rem;z-index:100001;box-shadow:0 8px 30px rgba(0,0,0,.5)';
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 3500);
  }

  window.DfxAuth = DfxAuth;
  // auto-init + auto-mount into #dfx-auth-slot if present
  function boot() { DfxAuth.init(); DfxAuth.mount('#dfx-auth-slot'); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
