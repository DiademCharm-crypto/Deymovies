// ═══════════════════════════════════════════════════════════════════════════
// DEYMFLIX — HALLOWEEN DECORATIONS (seasonal, additive)
// ═══════════════════════════════════════════════════════════════════════════
// Pairs with halloween.css. Adds the season's graphics to every page:
//
//   · swaps the brand logo + favicon for the jack-o'-lantern versions
//   · an orange announcement strip above the first catalogue row
//   · bats drifting across the top of the page, cobwebs in the bottom corners
//   · a jack-o'-lantern greeting in the site footer
//
// Rules it keeps:
//   1. Never touches layout — decorations are pointer-events:none, fixed layers.
//   2. Video-first pages (player, reels, offline, local-player) keep only the
//      colour theme: no bats over a movie, ever.
//   3. Idempotent — running twice cannot duplicate anything.
//   4. All motion is disabled by halloween.css under prefers-reduced-motion.
//
// To take the site back to normal: delete the halloween.css <link> and this
// <script> from the pages (both are marked with a comment) and bump the cache
// version in _tools/_deploy.cjs. Nothing else references this file.
// ═══════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  var V = '1.0';
  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var VIDEO_FIRST = ['player.html', 'reels.html', 'offline.html', 'local-player.html', 'install-app-files.html'].indexOf(page) !== -1;

  // 1 ── mark the document (halloween.css hangs its overrides off this class)
  document.documentElement.classList.add('halloween');

  // 2 ── brand: jack-o'-lantern logo + favicon + home-screen icon
  function swapBrand() {
    var imgs = document.querySelectorAll('img.brand-logo-img, img[src*="favicon.svg"], img[src*="deymflix-logo"]');
    for (var i = 0; i < imgs.length; i++) {
      var src = imgs[i].getAttribute('src') || '';
      if (src.indexOf('deymflix-logo') !== -1) imgs[i].setAttribute('src', 'icons/deymflix-logo-halloween.svg?v=' + V);
      else imgs[i].setAttribute('src', 'favicon-halloween.svg?v=' + V);
    }
    var links = document.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"]');
    for (var j = 0; j < links.length; j++) {
      var rel = links[j].getAttribute('rel') || '';
      if (/apple/i.test(rel)) links[j].setAttribute('href', 'icons/apple-touch-icon-halloween.png?v=' + V);
      else links[j].setAttribute('href', 'favicon-halloween.svg?v=' + V);
    }
  }

  // 3 ── graphics
  var WEBSVG = '<svg viewBox="0 0 100 100" aria-hidden="true">'
    + '<g fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="0.9">'
    + '<path d="M2 2 L98 30 M2 2 L90 60 M2 2 L60 92 M2 2 L30 99"/>'
    + '<path d="M18 4 Q22 20 14 34 M34 6 Q40 30 26 56 M50 10 Q56 40 38 74"/>'
    + '<circle cx="2" cy="2" r="3.4" fill="rgba(255,255,255,0.45)" stroke="none"/>'
    + '</g></svg>';

  var BATSVG = '<svg viewBox="0 0 100 42" aria-hidden="true">'
    + '<path d="M50 8c5 0 8 6 8 12 0 3-1 6-3 8h-10c-2-2-3-5-3-8 0-6 3-12 8-12z" fill="#0d0714"/>'
    + '<path d="M50 14C42 6 30 2 14 6c8 4 12 9 14 14-6-1-11 0-16 3 8 1 14 4 18 8 5 4 12 5 20 0z" fill="#0d0714"/>'
    + '<path d="M50 14C58 6 70 2 86 6c-8 4-12 9-14 14 6-1 11 0 16 3-8 1-14 4-18 8-5 4-12 5-20 0z" fill="#0d0714"/>'
    + '<circle cx="46" cy="14" r="1.6" fill="#ff7518"/><circle cx="54" cy="14" r="1.6" fill="#ff7518"/>'
    + '</svg>';

  var PUMPKINSVG = '<svg viewBox="0 0 100 100" aria-hidden="true">'
    + '<ellipse cx="50" cy="58" rx="38" ry="31" fill="#ff7518"/>'
    + '<ellipse cx="26" cy="60" rx="12" ry="26" fill="#b03e06" opacity="0.55"/>'
    + '<ellipse cx="74" cy="60" rx="12" ry="26" fill="#b03e06" opacity="0.55"/>'
    + '<ellipse cx="42" cy="44" rx="18" ry="12" fill="#ffb25c" opacity="0.35"/>'
    + '<path d="M43 30h14l-2-13-10 2z" fill="#4a3418"/>'
    + '<path d="M56 24c8-2 12-6 12-11" fill="none" stroke="#609c3c" stroke-width="3" stroke-linecap="round"/>'
    + '<polygon points="35,50 47,47 43,60" fill="#1a0c06"/>'
    + '<polygon points="65,50 53,47 57,60" fill="#1a0c06"/>'
    + '<path d="M33 68l6 6 6-6 6 7 6-7 6 6 6-6-2 12-16 6-16-6z" fill="#1a0c06"/>'
    + '<ellipse cx="50" cy="64" rx="26" ry="16" fill="#ffd682" opacity="0.10"/>'
    + '</svg>';

  function buildDecor() {
    if (document.getElementById('hw-decor')) return;
    var layer = document.createElement('div');
    layer.id = 'hw-decor';
    layer.className = 'hw-decor';
    layer.setAttribute('aria-hidden', 'true');

    // cobwebs in the bottom corners, out of the way of the navigation
    var wl = document.createElement('div');
    wl.className = 'hw-web left';
    wl.innerHTML = WEBSVG;
    var wr = document.createElement('div');
    wr.className = 'hw-web right';
    wr.innerHTML = WEBSVG;
    layer.appendChild(wl);
    layer.appendChild(wr);

    // bats: staggered lanes and speeds so the sky never looks like a loop
    var bats = [
      { top: '12%', size: 44, dur: 34, delay: 0 },
      { top: '19%', size: 30, dur: 42, delay: -6 },
      { top: '9%', size: 24, dur: 48, delay: -18 },
      { top: '26%', size: 36, dur: 38, delay: -24 },
      { top: '16%', size: 20, dur: 55, delay: -30 },
      { top: '31%', size: 26, dur: 44, delay: -12 },
    ];
    for (var i = 0; i < bats.length; i++) {
      var b = document.createElement('div');
      b.className = 'hw-bat';
      b.style.setProperty('--hw-top', bats[i].top);
      b.style.setProperty('--hw-size', bats[i].size + 'px');
      b.style.setProperty('--hw-dur', bats[i].dur + 's');
      b.style.setProperty('--hw-delay', bats[i].delay + 's');
      b.innerHTML = BATSVG;
      layer.appendChild(b);
    }
    document.body.appendChild(layer);
  }

  function buildStrip() {
    if (document.getElementById('hw-strip')) return;
    var strip = document.createElement('div');
    strip.id = 'hw-strip';
    strip.className = 'hw-ribbon';
    strip.innerHTML = '<span class="hw-flicker">🎃</span>'
      + '<span>It&rsquo;s Halloween on DEYMFLIX &mdash; spooky-season movies, series and K-drama, still free</span>'
      + '<span class="hw-flicker">🕸️</span>';
    // Before <main>, never inside it: explore / mylist re-render their main's
    // innerHTML and would wipe a child. On the home page there is no <main>,
    // so the strip lands between the hero and the first catalogue row.
    var main = document.querySelector('main');
    if (main && main.parentNode) main.parentNode.insertBefore(strip, main);
    else {
      var sec = document.querySelector('.content-section');
      if (sec && sec.parentNode) sec.parentNode.insertBefore(strip, sec);
    }
    // Some pages put <main> straight under the absolutely-positioned header:
    // nudge the strip below it instead of letting the nav cover it.
    if (strip.parentNode && strip.getBoundingClientRect().top < 72) strip.classList.add('hw-ribbon-pushed');
  }

  function buildGreeting() {
    if (document.getElementById('hw-greeting')) return;
    var footer = document.querySelector('footer.site-footer') || document.querySelector('footer');
    var box = document.createElement('div');
    box.id = 'hw-greeting';
    box.className = 'hw-greeting';
    box.innerHTML = PUMPKINSVG + '<span>Trick or treat! Halloween season at DEYMFLIX &mdash; stay spooky 🦇</span>' + PUMPKINSVG;
    if (footer) footer.insertBefore(box, footer.firstChild);
  }

  function boot() {
    swapBrand();
    if (VIDEO_FIRST) return; // colour theme only — never decorate over a video
    buildDecor();
    buildStrip();
    buildGreeting();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
