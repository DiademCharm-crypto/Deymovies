// ═══════════════════════════════════════════════════════════════
// APP-MODE EXTRAS (Android WebView only — invisible in browsers)
//
// The Sketchware app identifies itself by appending " DeymflixApp/1.4"
// to its WebView user agent, and exposes a JS bridge named "DeymflixApp".
// Browsers never match the UA, so none of this UI ever appears for them.
//
// v160.3 CHANGES
//  - 2-arg toggleFullscreen(enter, isVideo): only the VIDEO element rotates
//    the phone landscape now (Netflix/LokLok). Page fullscreen keeps portrait.
//  - The Request nav item is REMOVED in app mode (the 6-slot bar didn't fit);
//    a "Request a Movie" button is shown at the bottom of the footer instead.
//  - Downloads nav item stays.
// ═══════════════════════════════════════════════════════════════
(function () {
  const IS_APP = /DeymflixApp/i.test(navigator.userAgent || '');
  window.DFX_IS_APP = IS_APP;
  if (!IS_APP) return;

  // v1.4g added the isVideo parameter to the bridge; old v1.4f APKs crash on
  // unknown bridge signatures, so they keep the safe 1-arg behavior.
  const APP_VG = /DeymflixApp\/1\.4g/i.test(navigator.userAgent || '');

  // Tag <html> so CSS can hide browser-only affordances (e.g. the footer
  // "Get the Android App" button makes no sense inside the app itself)
  document.documentElement.classList.add('dfx-app');

  const DL_ICON = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>';
  const REQ_ICON = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>';

  // ── 1) Bottom nav: Downloads added, Request removed (app mode only) ──
  function addDownloadsNavItem() {
    const nav = document.querySelector('.bottom-nav-items');
    if (!nav) return;
    // Request doesn't fit beside Downloads -- the footer button replaces it
    const req = nav.querySelector('[data-page="request"]');
    if (req) req.remove();
    if (!nav.querySelector('[data-page="downloads"]')) {
      const li = document.createElement('li');
      li.className = 'bottom-nav-item';
      li.setAttribute('data-page', 'downloads');
      li.innerHTML = '<span class="bottom-nav-icon">' + DL_ICON + '</span>' +
                     '<span class="bottom-nav-label">Downloads</span>';
      li.addEventListener('click', function () {
        try {
          if (window.DeymflixApp && typeof window.DeymflixApp.openDownloads === 'function') {
            window.DeymflixApp.openDownloads();
            return;
          }
        } catch (e) { /* bridge not ready -- fall through */ }
        window.location.href = 'downloads.html'; // graceful fallback inside the app
      });
      nav.appendChild(li);
    }
  }

  // ── 2) Player: Download button beside the bookmark button ──
  function getCurrentDirectVideoUrl() {
    let url = window._dfxDownloadUrl || '';
    if (!url) {
      try {
        const v = document.getElementById('main-video') || document.querySelector('video');
        url = (v && v.currentSrc) || (v && v.src) || '';
      } catch (e) { url = ''; }
    }
    if (!url || /^(blob:|data:)/i.test(url)) return '';
    if (!/^https?:/i.test(url)) return '';
    // Same-origin files (site pages, posters) are never downloads
    try {
      if (new URL(url, location.href).origin === location.origin) return '';
    } catch (e) { return ''; }
    return url;
  }

  window.requestMovieDownload = function () {
    const url = getCurrentDirectVideoUrl();
    if (!url) { showToast('This title cannot be downloaded.'); return; }
    const titleEl = document.getElementById('current-title');
    let title = (titleEl && titleEl.textContent || 'Video').trim();
    // Episode downloads must match their subtitle file ("Series ep3")
    const cm0 = window.__dfxCurrentMovie || null;
    if (cm0 && cm0._episodeNum) title += ' ep' + cm0._episodeNum;
    const qm = url.match(/(\d{3,4})p/);
    const quality = qm ? qm[1] + 'p' : '';
    try {
      if (window.DeymflixApp && typeof window.DeymflixApp.requestDownload === 'function') {
        const cm = window.__dfxCurrentMovie || null;
        window.DeymflixApp.requestDownload(url, title, quality, (cm && cm.poster) || '');
        return;
      }
    } catch (e) { /* fall through to link fallback */ }
    // Fallback: a plain navigable link -- the app's DownloadListener catches it
    const a = document.createElement('a');
    a.href = url;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  function addDownloadButton() {
    const row = document.querySelector('#video-info-box .title-actions');
    if (!row || document.getElementById('download-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'download-btn';
    btn.className = 'action-btn';
    btn.title = 'Download';
    btn.setAttribute('aria-label', 'Download');
    btn.innerHTML = DL_ICON;
    btn.addEventListener('click', window.requestMovieDownload);
    row.appendChild(btn);
  }

  // ── 3) Footer: Request-a-Movie button at the very bottom (app mode only) ──
  function addFooterRequestButton() {
    if (document.getElementById('dfx-app-request-btn')) return;
    const footer = document.querySelector('footer.site-footer');
    if (!footer) return;
    const btn = document.createElement('button');
    btn.id = 'dfx-app-request-btn';
    btn.className = 'dfx-app-request-btn';
    btn.innerHTML = REQ_ICON + '<span><strong>Request a Movie</strong>' +
      '<small>Can\'t find a title? Tell us and we\'ll add it</small></span>';
    btn.addEventListener('click', function () {
      try { if (typeof openRequestModal === 'function') { openRequestModal(); return; } } catch (e) {}
      // Modal missing on this page (player): fall back to the home page
      window.location.href = 'index.html#request';
    });
    const legal = footer.querySelector('.footer-legal');
    if (legal) footer.insertBefore(btn, legal); else footer.appendChild(btn);
  }

  function initAppOnlyUi() {
    addDownloadsNavItem();
    addFooterRequestButton();
    if (!document.querySelector('.video-container')) return; // player page only
    addDownloadButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAppOnlyUi);
  } else {
    initAppOnlyUi();
  }
  window.addEventListener('load', addFooterRequestButton);

  // ── 4) Player page: fullscreen orientation is handled by the bridge ──
  document.addEventListener('DOMContentLoaded', function () {
    if (!document.querySelector('.video-container')) return;
    try {
      if (window.DeymflixApp && typeof window.DeymflixApp.setSecure === 'function') {
        window.DeymflixApp.setSecure(false); // never blanket-block the site screens
      }
    } catch (e) {}
    if (typeof screen !== 'undefined' && screen.orientation && screen.orientation.unlock) {
      try { screen.orientation.unlock(); } catch (e) {}
    }
  });
})();