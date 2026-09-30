// ============================================================================
// DEYMFLIX — TV mode (remote-friendly D-pad navigation)
// ============================================================================
// Include on every browse page:  <script src="tv.js?v=1.0" defer></script>
//
// What it does
//   • Arrow keys / remote D-pad move a glowing focus ring between cards,
//     nav links, search and buttons — spatially, not in DOM order.
//   • Enter activates the focused element (same as a click/tap).
//   • Backspace or the Back key on a remote goes back in history.
//   • Escape leaves TV mode; pressing any arrow key turns it back on.
//
// How it works
//   Candidates are all visible a/button/[tabindex] elements. From the current
//   focus we project a ray in the pressed direction and pick the element whose
//   center is nearest to that ray — real spatial navigation, the way a TV
//   remote expects. Focus is scrolled into view and drawn with a bright ring
//   sized for a 10-foot UI.
// ============================================================================
(function () {
  'use strict';
  if (window.__DFX_TV__) return; // idempotent
  window.__DFX_TV__ = true;

  var ACTIVE = false;
  var RING = null;            // the focus ring element
  var CURRENT = null;         // currently focused element

  // ── style: the focus ring + a body class so pages can dim decorations ──
  var css = document.createElement('style');
  css.textContent =
    '.dfx-tv-focus{position:fixed!important;z-index:99999;pointer-events:none;' +
    'border:4px solid #ff1e27;border-radius:14px;box-shadow:0 0 0 3px rgba(0,0,0,.8),' +
    '0 0 26px 6px rgba(229,9,20,.65);transition:top .12s,left .12s,width .12s,height .12s;display:none}' +
    'body.dfx-tv-on{cursor:auto}' +
    'body.dfx-tv-on .dfx-tv-hide-when-focused{opacity:.35}';
  document.head.appendChild(css);

  function ensureRing() {
    if (RING) return RING;
    RING = document.createElement('div');
    RING.className = 'dfx-tv-focus';
    document.body.appendChild(RING);
    return RING;
  }

  function candidates() {
    var all = document.querySelectorAll('a[href],button,[tabindex]:not([tabindex="-1"]),input[type="search"],input[type="text"],select');
    var out = [];
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      var r = el.getBoundingClientRect();
      if (r.width < 6 || r.height < 6) continue;                    // hidden
      if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue; // offscreen
      var style = getComputedStyle(el);
      if (style.visibility === 'hidden' || style.display === 'none') continue;
      out.push({ el: el, cx: r.left + r.width / 2, cy: r.top + r.height / 2, rect: r });
    }
    return out;
  }

  function placeRing(el) {
    var r = el.getBoundingClientRect(), ring = ensureRing();
    ring.style.display = 'block';
    ring.style.left = (r.left - 6) + 'px';
    ring.style.top = (r.top - 6) + 'px';
    ring.style.width = (r.width + 12) + 'px';
    ring.style.height = (r.height + 12) + 'px';
  }

  function focusEl(el, scroll) {
    if (!el) return;
    CURRENT = el;
    try { el.focus({ preventScroll: true }); } catch (e) { /* older */ }
    if (scroll) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    placeRing(el);
  }

  // spatial pick: nearest candidate whose center lies "best" along dir
  function pick(dir) {
    if (!CURRENT || !document.contains(CURRENT)) CURRENT = null;
    var list = candidates();
    if (!list.length) return null;
    if (!CURRENT) return list[0].el;
    var cur = null;
    for (var i = 0; i < list.length; i++) if (list[i].el === CURRENT) { cur = list[i]; break; }
    if (!cur) return list[0].el;
    var dx = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
    var dy = dir === 'up' ? -1 : dir === 'down' ? 1 : 0;
    var best = null, bestScore = Infinity;
    for (var j = 0; j < list.length; j++) {
      var c = list[j];
      if (c.el === CURRENT) continue;
      var vx = c.cx - cur.cx, vy = c.cy - cur.cy;
      var forward = vx * dx + vy * dy;              // distance along the ray
      if (forward <= 2) continue;                   // must be ahead of us
      var side = Math.abs(vx * dy - vy * dx);       // perpendicular distance
      var score = forward + side * 2.2;             // prefer straight-ahead lines
      if (score < bestScore) { bestScore = score; best = c.el; }
    }
    if (!best) { // nothing ahead — wrap to the screen edge in that direction
      if (dir === 'down') { var minTop = null; list.forEach(function (c) { if (minTop === null || c.rect.top < minTop) { minTop = c.rect.top; best = c.el; } }); }
      if (dir === 'up') { var maxBot = -1; list.forEach(function (c) { if (c.rect.bottom > maxBot) { maxBot = c.rect.bottom; best = c.el; } }); }
      if (dir === 'right') { var minL = null; list.forEach(function (c) { if (minL === null || c.rect.left < minL) { minL = c.rect.left; best = c.el; } }); }
      if (dir === 'left') { var maxR = -1; list.forEach(function (c) { if (c.rect.right > maxR) { maxR = c.rect.right; best = c.el; } }); }
    }
    return best;
  }

  function start(fromEl) {
    if (ACTIVE) return;
    ACTIVE = true;
    document.body.classList.add('dfx-tv-on');
    focusEl(fromEl || null, false);
  }
  function stop() {
    ACTIVE = false;
    document.body.classList.remove('dfx-tv-on');
    if (RING) RING.style.display = 'none';
    CURRENT = null;
  }

  // re-place the ring when the layout shifts (posters loading, rows rendering)
  var mo = new MutationObserver(function () {
    if (ACTIVE && CURRENT && document.contains(CURRENT)) placeRing(CURRENT);
    else if (ACTIVE && CURRENT && !document.contains(CURRENT)) focusEl(null, false);
  });
  document.addEventListener('DOMContentLoaded', function () {
    mo.observe(document.body, { childList: true, subtree: true });
    // first D-pad press anywhere wakes TV mode
  });

  addEventListener('keydown', function (e) {
    var k = e.key;
    var dir = k === 'ArrowLeft' ? 'left' : k === 'ArrowRight' ? 'right' : k === 'ArrowUp' ? 'up' : k === 'ArrowDown' ? 'down' : null;
    var inField = /^(input|textarea|select)$/i.test((e.target && e.target.tagName) || '');

    if (dir) {
      if (inField && (dir === 'left' || dir === 'right')) return; // let text caret move
      e.preventDefault();
      start();
      focusEl(pick(dir), true);
      return;
    }
    if (k === 'Enter') {
      if (ACTIVE && CURRENT && !inField) {
        e.preventDefault();
        CURRENT.click();
        return;
      }
      return; // fields keep native behavior
    }
    if (k === 'Backspace' || k === 'GoBack' || k === 'BrowserBack') {
      if (inField) return;
      // TV remotes send Back; browsers send Backspace. On TV browsers,
      // history.back() is what the user expects from the Back button.
      if (history.length > 1) { e.preventDefault(); history.back(); }
      return;
    }
    if (k === 'Escape') { stop(); return; }
  }, true);

  // keep the ring glued during scroll (TV browsers scroll instantly)
  addEventListener('scroll', function () { if (ACTIVE && CURRENT) placeRing(CURRENT); }, { passive: true });
  addEventListener('resize', function () { if (ACTIVE && CURRENT) placeRing(CURRENT); });
})();
