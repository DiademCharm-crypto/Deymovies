// ============================================================================
// DEYMFLIX — Watch Party  (rooms · voice · playback sync)
// ============================================================================
// What it does
//   * Create / join a room with a 4-letter code (the panel mirrors the owner's
//     reference: header, "Currently Watching", Create New Room / Join Existing).
//   * VOICE: peer-to-peer WebRTC audio (perfect-negotiation mesh). The mic can
//     be muted/unmuted at any time and everyone else is told immediately.
//   * SYNC: whoever created the room is the host; play / pause / seek are pushed
//     to the room so guests follow along (direct-player titles).
//   * FULLSCREEN: the panel and the mic dock are mounted INSIDE
//     #playerContainer — the element the player itself takes fullscreen — so
//     they stay visible and clickable with a movie in fullscreen.
//
// Transport (no new vendor): the site's own Firebase Realtime Database, which
//   already carries the "online now" counter. Rooms live under
//   /watchparty/<code>: members/<id> (presence + mic state), signal/<id>/<id>
//   (WebRTC offers/answers/ICE) and sync (host playback state). Everything is
//   ephemeral: members remove themselves on leave/pagehide, and a room with no
//   members is simply abandoned (nothing to clean up).
//   Audio itself never touches the database — it is P2P (DTLS-SRTP).
//
// Tests: window.__WP_TEST_TRANSPORT swaps the transport for a same-origin
//   BroadcastChannel so two tabs can do a real WebRTC handshake without
//   touching the network (see _tools/_watch_party_audit.cjs).
// ============================================================================
(function () {
  'use strict';

  var CFG = window.__DEYMFLIX_CONFIG__ || {};
  var FB = CFG.FIREBASE_CONFIG || {};
  var DB = FB.databaseURL || 'https://deymflix-default-rtdb.firebaseio.com';
  var ROOT = DB + '/watchparty';
  var FORCE_BC = !!window.__WP_TEST_TRANSPORT;
  var MIC_ICON = '<svg viewBox="0 0 24 24"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z"/></svg>';
  var MIC_OFF_ICON = '<svg viewBox="0 0 24 24"><path d="M3 3l18 18-1.4 1.4-3.2-3.2A6.9 6.9 0 0 1 13 20.9V24h-2v-3.1A7 7 0 0 1 5 14h2a5 5 0 0 0 7.6 4.2l-1.5-1.5A3 3 0 0 1 9 14.2L3.1 8.3A7 7 0 0 0 5 11h2a5 5 0 0 1 .6-2.4L3 3.4 4.4 2 3 3zM12 14a3 3 0 0 0 2.9-2.2L12 8.9V14z"/></svg>';

  // ── tiny helpers ─────────────────────────────────────────────────────────
  var rid = function () { return Math.random().toString(36).slice(2, 10); };
  var ME = (function () { try { return sessionStorage.getItem('dfx_wp_id') || rid(); } catch (e) { return rid(); } })();
  try { sessionStorage.setItem('dfx_wp_id', ME); } catch (e) {}
  function code4() {
    var A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = '';
    for (var i = 0; i < 4; i++) s += A.charAt(Math.floor(Math.random() * A.length));
    return s;
  }
  function myName() {
    try {
      var n = sessionStorage.getItem('dfx_wp_name');
      if (!n) { n = 'Viewer ' + Math.floor(10 + Math.random() * 89); sessionStorage.setItem('dfx_wp_name', n); }
      return n;
    } catch (e) { return 'Viewer'; }
  }
  var $ = function (id) { return document.getElementById(id); };
  function nowPlaying() {
    var m = window.__dfxCurrentMovie || {};
    var title = m.title || ($('current-title') && $('current-title').textContent) || 'Nothing playing';
    var s = m._episodeSeason, e = m._episodeNum;
    var kind = (e || (m.seasons && m.seasons.length)) ? 'series' : 'movie';
    return kind + ' · ' + title + (s && e ? ' (Season ' + s + ', Episode ' + e + ')' : '');
  }
  function directVideo() { return $('direct-video-player'); }
  // Sync only makes sense on OUR player: provider embeds play inside an iframe
  // we cannot control, so the party there is voice-only (and says so).
  function syncPossible() {
    var v = directVideo();
    if (!v) return false;
    try { if (document.body.classList.contains('cos-mode')) return false; } catch (e) {}
    if (window._cosActive) return false;
    if (!v.getAttribute('src') && !v.currentSrc) return false;
    return window.getComputedStyle(v).display !== 'none';
  }

  // ── transport: Firebase REST/SSE (prod) or BroadcastChannel (tests) ──────
  function fbTransport(room) {
    var base = ROOT + '/' + room;
    var streams = [];
    var url = function (p) { return base + p + '.json'; };
    return {
      put: function (p, v, keepalive) {
        try {
          return fetch(url(p), { method: 'PUT', headers: { 'content-type': 'application/json' },
            body: JSON.stringify(v), keepalive: !!keepalive })
            .then(function (r) { return r.ok; }).catch(function () { return false; });
        } catch (e) { return Promise.resolve(false); }
      },
      del: function (p, keepalive) {
        try {
          return fetch(url(p), { method: 'DELETE', keepalive: !!keepalive })
            .then(function (r) { return r.ok; }).catch(function () { return false; });
        } catch (e) { return Promise.resolve(false); }
      },
      hello: function () {},
      on: function (p, cb) {
        if (typeof EventSource === 'undefined') return function () {};
        var es;
        try { es = new EventSource(url(p)); } catch (e) { return function () {}; }
        es.addEventListener('put', function (ev) {
          try { var m = JSON.parse(ev.data); cb(m.path || '/', m.data === undefined ? null : m.data); } catch (e) {}
        });
        es.addEventListener('patch', function (ev) {
          try {
            var m = JSON.parse(ev.data), d = m.data || {};
            Object.keys(d).forEach(function (k) { cb('/' + k, d[k]); });
          } catch (e) {}
        });
        streams.push(es);
        return function () { try { es.close(); } catch (e) {} };
      },
      close: function () { streams.forEach(function (s) { try { s.close(); } catch (e) {} }); streams = []; },
    };
  }

  function bcTransport(room) {
    var ch = new BroadcastChannel('dfxwp-' + room);
    var subs = [], mirror = {};
    function emit(p, v) {
      subs.slice().forEach(function (s) {
        if (s.path === '/' || p === s.path || p.indexOf(s.path + '/') === 0) {
          var rel = s.path === '/' ? p : (p.slice(s.path.length) || '/');
          try { s.cb(rel, v); } catch (e) {}
        }
      });
    }
    ch.onmessage = function (ev) {
      var m = ev.data || {};
      if (!m || m.from === ME) return;
      if (m.type === 'hello') {
        Object.keys(mirror).forEach(function (p) { ch.postMessage({ type: 'put', path: p, value: mirror[p], from: ME, replay: true }); });
        return;
      }
      if (m.type === 'put') { mirror[m.path] = m.value; emit(m.path, m.value); }
      else if (m.type === 'del') { delete mirror[m.path]; emit(m.path, null); }
    };
    return {
      // Firebase echoes a write back to every listener, including the writer.
      // The local emit below reproduces that, otherwise each tab would never
      // see its OWN presence and the two sides would disagree about the host.
      put: function (p, v) { mirror[p] = v; emit(p, v); ch.postMessage({ type: 'put', path: p, value: v, from: ME }); return Promise.resolve(true); },
      del: function (p) { delete mirror[p]; emit(p, null); ch.postMessage({ type: 'del', path: p, from: ME }); return Promise.resolve(true); },
      hello: function () { ch.postMessage({ type: 'hello', from: ME }); },
      on: function (p, cb) { subs.push({ path: p, cb: cb }); return function () { subs = subs.filter(function (s) { return s.cb !== cb || s.path !== p; }); }; },
      close: function () { try { ch.close(); } catch (e) {} },
    };
  }

  // ── state ────────────────────────────────────────────────────────────────
  var S = {
    room: null, transport: null, members: {}, host: null, joined: false,
    muted: false, mic: 'off', stream: null, unsubs: [], seen: {}, seq: 0,
    applying: false, lastSync: 0, syncOn: false, trace: [],
  };
  var peers = {};

  // ── voice ────────────────────────────────────────────────────────────────
  function iceServers() {
    if (window.__WP_ICE_OVERRIDE !== undefined) return window.__WP_ICE_OVERRIDE;
    return [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }];
  }

  function tr(kind, detail) {
    try { S.trace.push(kind + ' ' + detail); if (S.trace.length > 80) S.trace.shift(); } catch (e) {}
  }

  // Platform objects (RTCSessionDescription / RTCIceCandidate) are not
  // structured-cloneable and would blow up the moment a transport serialises
  // them — always send plain {type, sdp} / {candidate, ...} objects.
  function descPlain(d) { return d && typeof d === 'object' ? { type: d.type, sdp: d.sdp } : d; }
  function icePlain(c) {
    return { candidate: c.candidate, sdpMid: c.sdpMid, sdpMLineIndex: c.sdpMLineIndex,
             usernameFragment: c.usernameFragment };
  }

  function sendSignal(to, payload) {
    if (!S.transport) return;
    S.seq++;
    var p = '/signal/' + to + '/' + ME + '/' + Date.now() + '_' + S.seq;
    var body = payload.description ? { description: descPlain(payload.description) }
             : payload.ice ? { ice: icePlain(payload.ice) } : payload;
    tr('tx', (body.description ? body.description.type : 'ice') + ' -> ' + p);
    try { S.transport.put(p, body); }
    catch (e) { tr('tx-fail', String(e && e.message)); }
  }

  function ensurePeer(id) {
    if (peers[id]) return peers[id];
    var pc = new RTCPeerConnection({ iceServers: iceServers() });
    var peer = { id: id, pc: pc, polite: String(ME) > String(id), makingOffer: false,
                 ignoreOffer: false, settingAnswer: false, audio: null, state: 'new' };
    peers[id] = peer;
    if (S.stream) S.stream.getTracks().forEach(function (t) { try { pc.addTrack(t, S.stream); } catch (e) {} });
    pc.onicecandidate = function (e) { if (e.candidate) { peer.candSent = (peer.candSent || 0) + 1; sendSignal(id, { ice: e.candidate }); } };
    pc.ontrack = function (e) { attachAudio(id, e.streams && e.streams[0]); };
    pc.oniceconnectionstatechange = function () {
      peer.state = pc.iceConnectionState;
      if (peer.state === 'failed') { try { pc.restartIce(); } catch (e) {} }
      render();
    };
    pc.onnegotiationneeded = function () {
      if (!S.transport) return;
      peer.makingOffer = true;
      pc.setLocalDescription().then(function () {
        sendSignal(id, { description: pc.localDescription });
      }).catch(function () {}).then(function () { peer.makingOffer = false; });
    };
    return peer;
  }

  function attachAudio(id, stream) {
    if (!stream) return;
    var peer = peers[id];
    if (!peer) return;
    if (!peer.audio) {
      var a = document.createElement('audio');
      a.autoplay = true;
      a.setAttribute('playsinline', '');
      a.setAttribute('data-wp-peer', id);
      a.style.display = 'none';
      document.body.appendChild(a);
      peer.audio = a;
    }
    if (peer.audio.srcObject !== stream) peer.audio.srcObject = stream;
    var p = peer.audio.play();
    if (p && p.catch) p.catch(function () {});
  }

  function handleSignal(from, msg) {
    if (!msg) return;
    var peer = ensurePeer(from), pc = peer.pc;
    if (msg.description) {
      var desc = msg.description;
      var readyForOffer = !peer.makingOffer && (pc.signalingState === 'stable' || peer.settingAnswer);
      var collision = desc.type === 'offer' && !readyForOffer;
      peer.ignoreOffer = !peer.polite && collision;
      tr('sig', desc.type + ' from ' + from + (peer.ignoreOffer ? ' IGNORED' : ' apply'));
      if (peer.ignoreOffer) return;
      peer.settingAnswer = desc.type === 'answer';
      pc.setRemoteDescription(desc).then(function () {
        peer.settingAnswer = false;
        (peer.pendingIce || []).forEach(function (c) { pc.addIceCandidate(c).catch(function () {}); });
        peer.pendingIce = [];
        if (desc.type === 'offer') {
          return pc.setLocalDescription().then(function () { sendSignal(from, { description: pc.localDescription }); });
        }
      }).catch(function () { peer.settingAnswer = false; });
    } else if (msg.ice) {
      // Candidates can arrive before the description they belong to; hold them
      // until there IS a remote description, then flush in order.
      if (!pc.remoteDescription) { (peer.pendingIce = peer.pendingIce || []).push(msg.ice); return; }
      pc.addIceCandidate(msg.ice).then(function () { peer.candGot = (peer.candGot || 0) + 1; })
        .catch(function () { /* stale candidate after rollback */ });
    }
  }

  function collect(root, rel, val, map, apply) {
    // Shared shape for the members/ and signal/ subtrees: Firebase streams the
    // whole node, then children, then single keys.
    if (rel === '/' || rel === '' || rel === undefined) {
      if (val && typeof val === 'object') Object.keys(val).forEach(function (k) { apply(k, val[k]); });
      return;
    }
    var parts = String(rel).split('/').filter(Boolean);
    apply(parts[0], parts.length === 1 ? val : null, parts.slice(1).join('/'));
  }

  function enableMic() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { S.mic = 'unsupported'; render(); return Promise.resolve(null); }
    if (S.stream) return Promise.resolve(S.stream);
    S.mic = 'asking'; render();
    return navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }, video: false,
    }).then(function (st) {
      S.stream = st;
      st.getAudioTracks().forEach(function (t) { t.enabled = !S.muted; });
      Object.keys(peers).forEach(function (id) {
        var peer = peers[id];
        st.getTracks().forEach(function (t) {
          var sender = peer.pc.getSenders().filter(function (s) { return s.track && s.track.kind === t.kind; })[0];
          if (sender) { try { sender.replaceTrack(t); } catch (e) {} }
          else { try { peer.pc.addTrack(t, st); } catch (e) {} }
        });
      });
      S.mic = 'on'; render(); publishMe();
      return st;
    }).catch(function () { S.mic = 'denied'; render(); return null; });
  }

  function toggleMic() {
    // First tap turns the mic ON (that is the permission ask), after that it
    // mutes/unmutes — exactly what the dock button promises.
    if (S.mic === 'off' || S.mic === 'denied' || S.mic === 'unsupported') return enableMic().then(function () { publishMe(); render(); });
    S.muted = !S.muted;
    if (S.stream) S.stream.getAudioTracks().forEach(function (t) { t.enabled = !S.muted; });
    publishMe(); render();
    return Promise.resolve();
  }

  // ── room lifecycle ───────────────────────────────────────────────────────
  function publishMe() {
    if (!S.transport) return;
    S.transport.put('/members/' + ME, { name: myName(), mic: !!(S.stream && !S.muted), seen: Date.now() });
  }

  function openTransport(room) {
    S.room = room;
    S.transport = FORCE_BC ? bcTransport(room) : fbTransport(room);
    S.seen = {};
    S.members = {};
    S.transport.on('/members', function (rel, val) {
      collect('/members', rel, val, S.members, function (id, v) {
        if (v && typeof v === 'object') S.members[id] = v; else delete S.members[id];
        onRosterChanged();
      });
    });
    // Signal mailboxes arrive in every shape a database subtree can: the whole
    // node, one sender's mailbox, or a single message — handle each explicitly
    // (flattening here used to lose the nested payload).
    S.transport.on('/signal/' + ME, function (rel, val) {
      if (rel === '/' || rel === '' || rel === undefined) {
        if (val && typeof val === 'object') {
          Object.keys(val).forEach(function (from) {
            var box = val[from];
            if (box && typeof box === 'object') Object.keys(box).forEach(function (n) { deliver(from, n, box[n]); });
          });
        }
        return;
      }
      var parts = String(rel).split('/').filter(Boolean);
      tr('rx', String(rel));
      if (parts.length === 1) {
        var box = val;
        if (box && typeof box === 'object') Object.keys(box).forEach(function (n) { deliver(parts[0], n, box[n]); });
        return;
      }
      deliver(parts[0], parts.slice(1).join('/'), val);
    });
    S.transport.on('/sync', function (rel, val) {
      if (rel === '/' || rel === '' || rel === undefined) {
        tr('sync-rx', val ? (val.p ? 'playing' : 'paused') + ' t=' + Number(val.t || 0).toFixed(1) : 'null');
        applySync(val);
      }
    });
    S.transport.on('/host', function (rel, val) {
      if (rel === '/' || rel === '' || rel === undefined) {
        if (typeof val === 'string' && val) S.host = val;
        onRosterChanged();
      }
    });
    S.transport.hello();
  }

  function deliver(from, seq, msg) {
    if (from === ME) return;                    // my own outbox echo
    var key = from + '/' + seq;
    if (S.seen[key]) return;
    S.seen[key] = 1;
    if (!msg) return;
    handleSignal(from, msg);
    // Tidy: drop just this message. Deleting the whole mailbox would race with
    // ICE candidates the same peer is still writing.
    if (S.transport) S.transport.del('/signal/' + ME + '/' + from + '/' + seq);
  }

  function onRosterChanged() {
    var ids = Object.keys(S.members).filter(function (id) {
      var m = S.members[id] || {};
      return !(m.seen && Date.now() - m.seen > 60000 && id !== ME);
    });
    ids.forEach(function (id) { S.members[id] = S.members[id] || {}; });
    Object.keys(S.members).forEach(function (id) { if (ids.indexOf(id) === -1) delete S.members[id]; });
    var sorted = ids.slice().sort();
    // The room creator is the host; if they leave, the next member takes over
    // and the room is told, so guests always have one driver to follow.
    if (!S.host || ids.indexOf(S.host) === -1) {
      S.host = sorted[0] || null;
      if (S.host && S.transport) S.transport.put('/host', S.host);
    }
    ids.forEach(function (id) { if (id !== ME) ensurePeer(id); });
    Object.keys(peers).forEach(function (id) {
      if (ids.indexOf(id) === -1) {
        try { peers[id].pc.close(); } catch (e) {}
        if (peers[id].audio) { try { peers[id].audio.srcObject = null; peers[id].audio.remove(); } catch (e) {} }
        delete peers[id];
      }
    });
    render();
  }

  function join(room, asCreator) {
    room = String(room || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    if (!room) return Promise.resolve(false);
    leave(true);
    S.joined = true;
    openTransport(room);
    publishMe();
    S.heartbeat = setInterval(publishMe, 15000);
    window.addEventListener('pagehide', leaveAll, { once: true });
    if (asCreator) {
      // Claim the host seat once presence has settled, unless someone already
      // holds it (joining an existing room never steals it).
      setTimeout(function () { if (S.joined && S.room === room && !S.host && S.transport) { S.host = ME; S.transport.put('/host', ME); render(); } }, 900);
    }
    render();
    return Promise.resolve(true);
  }

  function leaveAll() {
    try { if (S.transport) S.transport.del('/members/' + ME, true); } catch (e) {}
  }

  function leave(quiet) {
    if (S.heartbeat) { clearInterval(S.heartbeat); S.heartbeat = null; }
    try {
      if (S.transport) {
        S.transport.del('/members/' + ME);
        S.transport.close();
      }
    } catch (e) {}
    Object.keys(peers).forEach(function (id) {
      try { peers[id].pc.close(); } catch (e) {}
      if (peers[id].audio) { try { peers[id].audio.srcObject = null; peers[id].audio.remove(); } catch (e) {} }
      delete peers[id];
    });
    if (S.stream) { S.stream.getTracks().forEach(function (t) { try { t.stop(); } catch (e) {} }); S.stream = null; }
    S.room = null; S.transport = null; S.members = {}; S.host = null; S.joined = false;
    S.mic = 'off'; S.muted = false; S.seen = {};
    if (!quiet) render();
  }

  // ── playback sync ────────────────────────────────────────────────────────
  function pushSync() {
    if (!S.transport || !isHost() || S.applying) return;
    var v = directVideo();
    if (!v) return;
    S.pushed = (S.pushed || 0) + 1;
    S.lastPushT = v.currentTime;
    S.lastPushPaused = !!v.paused;
    tr('sync-tx', (v.paused ? 'paused' : 'playing') + ' t=' + v.currentTime.toFixed(1));
    S.transport.put('/sync', { p: !v.paused, t: v.currentTime, at: Date.now(), by: ME });
  }
  function applySync(st) {
    if (!st || !S.joined || isHost()) { tr('sync-skip', !st ? 'empty' : !S.joined ? 'not-joined' : 'i-am-host'); return; }
    if (!syncPossible()) { tr('sync-skip', 'source-not-syncable'); return; }
    var v = directVideo();
    if (!v) return;
    var target = (Number(st.t) || 0) + (st.p ? (Date.now() - (Number(st.at) || Date.now())) / 1000 : 0);
    S.applying = true;
    S.applied = (S.applied || 0) + 1;
    S.lastSyncT = target;
    S.lastSyncAt = Date.now();
    S.lastSyncPlaying = !!st.p;
    try {
      if (Math.abs((v.currentTime || 0) - target) > 1.2) v.currentTime = target;
      if (st.p && v.paused) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      else if (!st.p && !v.paused) v.pause();
      S.lastSync = Date.now();
    } catch (e) {}
    setTimeout(function () { S.applying = false; }, 350);
  }
  function isHost() { return !!S.room && S.host === ME; }
  function hostName() {
    var h = S.host && S.members[S.host];
    return (h && h.name) || 'Host';
  }

  var boundVideo = null;

  function attachSync() {
    // Media events (play/pause/seeked) are dispatched straight at the element —
    // they never reach a document-level listener, not even in the capture
    // phase — so this MUST bind per element. The player can swap the <video>
    // out on some transitions, so this is re-run from boot()'s watchdog and a
    // fresh element (no flag yet) gets bound again.
    var v = directVideo();
    if (!v) return;
    // Tracked by IDENTITY, not by a data-attribute: the player swaps the video
    // by cloning it, and a clone copies data-* attributes but NOT listeners —
    // a flag-based guard would think the fresh element was already bound and
    // sync would die silently after the first swap.
    if (boundVideo !== v) {
      boundVideo = v;
      ['play', 'pause', 'seeked'].forEach(function (ev) {
        v.addEventListener(ev, function () { if (!S.applying) setTimeout(pushSync, 60); });
      });
    }
    if (v.dataset.wpSync !== '1') v.dataset.wpSync = '1';
    if (attachSync.timers) return;   // attachSync is re-run by the watchdog
    attachSync.timers = true;
    // Reconciliation loop, not just events: it catches a seek even if the
    // player swallowed the 'seeked' event, plus stalls, drift and the guest
    // arriving late. Anything more than a second off what we last announced
    // with the pause/play state changed gets republished.
    setInterval(function () {
      if (!S.joined || !isHost() || !syncPossible()) return;
      var d = directVideo();
      if (!d) return;
      var moved = Math.abs((d.currentTime || 0) - (S.lastPushT || 0)) > 1.0;
      if (moved || S.lastPushPaused !== d.paused) pushSync();
    }, 1500);
    setInterval(function () {
      if (S.joined && !isHost() && syncPossible()) S.syncOn = true;
      render();
    }, 5000);
  }

  // ── UI ───────────────────────────────────────────────────────────────────
  var UI = null;
  function buildUI() {
    if (UI) return UI;
    var root = document.createElement('div');
    root.className = 'wp-root';
    root.id = 'wp-root';
    root.innerHTML =
      '<div class="wp-dock" id="wp-dock">' +
        '<button class="wp-mic" id="wp-mic" title="Microphone" aria-label="Microphone">' + MIC_ICON + '</button>' +
        '<div><div class="wp-dock-text" id="wp-dock-title">Watch Party</div>' +
        '<div class="wp-dock-sub" id="wp-dock-sub">Ready</div></div>' +
        '<span class="wp-dock-people" id="wp-dock-people">1</span>' +
        '<span class="wp-dock-live" id="wp-dock-live"></span>' +
      '</div>' +
      '<div class="wp-panel" id="wp-panel">' +
        '<div class="wp-head">' +
          '<div class="wp-head-icon"><svg viewBox="0 0 24 24"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z"/></svg></div>' +
          '<div class="wp-head-text"><div class="wp-title">Watch Party</div>' +
          '<div class="wp-sub" id="wp-sub">Ready to start</div></div>' +
          '<button class="wp-close" id="wp-close" title="Close">&times;</button>' +
        '</div>' +
        '<div class="wp-now"><div class="wp-now-icon"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>' +
          '<div style="min-width:0"><div class="wp-now-label">Currently Watching</div>' +
          '<div class="wp-now-value" id="wp-now">Nothing playing</div></div></div>' +
        '<div id="wp-start">' +
          '<button class="wp-btn-primary" id="wp-create" type="button">' +
            '<svg viewBox="0 0 24 24"><path d="M11 9V6H9v3H6v2h3v3h2v-3h3V9h-3zm8 11h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V8h2v4zM3 5h14v2H5v12h12v2H3V5z"/></svg>Create New Room</button>' +
          '<button class="wp-btn-secondary" id="wp-join-toggle" type="button">' +
            '<svg viewBox="0 0 24 24"><path d="M16 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm-8 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h10v-2.5c0-1.03.53-1.94 1.4-2.6A12.7 12.7 0 0 0 8 13zm8 0a12.7 12.7 0 0 0-2.4.22A3.7 3.7 0 0 1 15 16.5V19h9v-2.5c0-2.33-4.67-3.5-8-3.5z"/></svg>Join Existing Room</button>' +
          '<div class="wp-join" id="wp-join-box"><div class="wp-join-row">' +
            '<input class="wp-code-input" id="wp-code" maxlength="6" placeholder="CODE" autocomplete="off">' +
            '<button class="wp-btn-secondary" id="wp-join" type="button" style="width:auto;padding:12px 18px">Join</button>' +
          '</div><div class="wp-err" id="wp-err"></div>' +
          '<div class="wp-hint">Share the code with whoever you are watching with. Voice works both ways — mute anytime with the mic button. The host\'s play / pause / seek stays in sync for titles that play in our own player.</div></div>' +
        '</div>' +
        '<div class="wp-room" id="wp-room">' +
          '<div class="wp-room-code"><div><div class="wp-now-label">Room code</div>' +
            '<div class="wp-room-code-val" id="wp-code-show">----</div></div>' +
            '<button class="wp-copy" id="wp-copy" type="button">Copy</button></div>' +
          '<div class="wp-people" id="wp-people"></div>' +
          '<button class="wp-btn-secondary" id="wp-leave" type="button">Leave room</button>' +
        '</div>' +
      '</div>';
    (document.getElementById('playerContainer') || document.body).appendChild(root);
    UI = root;
    $('wp-mic').addEventListener('click', function (e) { e.stopPropagation(); toggleMic(); });
    $('wp-close').addEventListener('click', function () { openPanel(false); });
    $('wp-create').addEventListener('click', function () { join(code4(), true); openPanel(true); });
    $('wp-join-toggle').addEventListener('click', function () {
      var box = $('wp-join-box');
      box.classList.toggle('open');
      if (box.classList.contains('open')) $('wp-code').focus();
    });
    $('wp-join').addEventListener('click', function () { doJoinFromInput(); });
    $('wp-code').addEventListener('keydown', function (e) { if (e.key === 'Enter') doJoinFromInput(); });
    $('wp-leave').addEventListener('click', function () { leave(); openPanel(false); });
    $('wp-copy').addEventListener('click', function () {
      var t = $('wp-code-show');
      var text = (t && t.textContent) || '';
      var done = function () { var b = $('wp-copy'); if (b) { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1500); } };
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done).catch(done);
        else done();
      } catch (e) { done(); }
    });
    return root;
  }

  function doJoinFromInput() {
    var input = $('wp-code');
    var code = (input && input.value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    var err = $('wp-err');
    if (code.length < 4) { if (err) err.textContent = 'Enter the 4-letter room code.'; return; }
    if (err) err.textContent = '';
    join(code, false);
  }

  function openPanel(on) {
    var p = $('wp-panel');
    if (!p) return;
    p.classList.toggle('open', on === undefined ? !p.classList.contains('open') : !!on);
    syncFade();
  }

  // ── fade with the player chrome ──────────────────────────────────────────
  // The dock + panel live in their own layer (so they survive fullscreen), which
  // means they do NOT fade when the player hides its controls. Mirror the
  // player's overlay state EXACTLY — dock and an open panel alike — so an idle
  // viewer gets a completely clear picture. Moving the mouse (or tapping) brings
  // the whole chrome back, party UI included; an open panel just reappears with
  // it, nothing is lost.
  function syncFade() {
    if (!UI) return;
    var ov = document.getElementById('player-gesture-overlay');
    if (!ov) return;
    UI.classList.toggle('wp-faded', !ov.classList.contains('active'));
  }

  function attachFade() {
    var ov = document.getElementById('player-gesture-overlay');
    if (!ov || attachFade.ov === ov) return;
    attachFade.ov = ov;
    // Watching the overlay's class is the cheapest way to stay in step with the
    // player: every show/hide path ends up toggling `.active` on it.
    try {
      new MutationObserver(function () { syncFade(); })
        .observe(ov, { attributes: true, attributeFilter: ['class'] });
    } catch (e) {}
    syncFade();
  }

  function micGlyph() {
    if (S.mic === 'off') return { cls: '', icon: MIC_ICON, title: 'Turn on microphone' };
    if (S.mic === 'asking') return { cls: 'connecting', icon: MIC_ICON, title: 'Allowing microphone…' };
    if (S.mic === 'denied' || S.mic === 'unsupported') return { cls: 'muted', icon: MIC_OFF_ICON, title: 'Microphone blocked by the browser' };
    return S.muted ? { cls: 'muted', icon: MIC_OFF_ICON, title: 'Unmute' } : { cls: '', icon: MIC_ICON, title: 'Mute' };
  }

  function render() {
    if (!UI) return;
    var dock = $('wp-dock'), panel = $('wp-panel');
    if (!dock || !panel) return;

    var ids = Object.keys(S.members);
    var count = S.joined ? ids.length : 0;
    dock.classList.toggle('open', S.joined);
    dock.classList.toggle('wp-dock-off', !S.joined);
    var people = ids.map(function (id) { return S.members[id]; });

    var g = micGlyph();
    var mic = $('wp-mic');
    mic.className = 'wp-mic ' + g.cls;
    mic.innerHTML = g.icon;
    mic.title = g.title;
    var pod = $('wp-dock-people');
    if (pod) pod.textContent = String(count);
    var dt = $('wp-dock-title');
    if (dt) dt.textContent = S.room ? 'Room ' + S.room : 'Watch Party';
    var ds = $('wp-dock-sub');
    if (ds) {
      var live = Object.keys(peers).filter(function (id) { return peers[id].state === 'connected' || peers[id].state === 'completed'; }).length;
      ds.textContent = !S.joined ? 'Ready'
        : (count > 1 ? (live === count - 1 ? 'Voice live · ' + count + ' watching' : 'Connecting… ' + count + ' watching')
                     : 'Waiting for others…');
    }
    var lv = $('wp-dock-live');
    if (lv) {
      var anyConnected = Object.keys(peers).some(function (id) { return peers[id].state === 'connected' || peers[id].state === 'completed'; });
      lv.classList.toggle('warn', S.joined && count > 1 && !anyConnected);
    }

    // panel
    var sub = $('wp-sub'), start = $('wp-start'), room = $('wp-room');
    var now = $('wp-now');
    if (now) now.textContent = nowPlaying();
    var inRoom = S.joined;
    if (start) start.style.display = inRoom ? 'none' : '';
    if (room) room.classList.toggle('open', inRoom);
    if (sub) {
      sub.textContent = !inRoom ? 'Ready to start'
        : (count > 1 ? count + ' in the room' : 'You are the only one here')
          + (syncPossible() ? '' : ' · voice only for this source');
    }
    var codeShow = $('wp-code-show');
    if (codeShow) codeShow.textContent = S.room || '----';
    var list = $('wp-people');
    if (list) {
      list.innerHTML = ids.map(function (id) {
        var m = S.members[id] || {};
        var peer = peers[id];
        var state = id === ME ? '' : (peer && (peer.state === 'connected' || peer.state === 'completed')) ? ' · connected' : ' · connecting';
        return '<div class="wp-person"><span class="wp-person-av">' + (m.name || 'V').slice(-2).toUpperCase() + '</span>' +
          '<span class="wp-person-name">' + (id === ME ? 'You' : (m.name || 'Viewer')) + '</span>' +
          (id === S.host ? '<span class="wp-person-tag">host</span>' : '') +
          '<span class="wp-person-mic' + (m.mic ? '' : ' off') + '">' + (m.mic ? '🎙 on' : '🎙 muted') + state + '</span></div>';
      }).join('');
    }
    syncFade();
  }

  // Panel + dock live inside the player container, so they survive fullscreen.
  function mount() {
    var pc = document.getElementById('playerContainer') || document.body;
    var root = buildUI();
    if (root.parentElement !== pc) pc.appendChild(root);
  }

  function injectButton() {
    if ($('btn-watch-party')) return;
    // The player's own cluster (Settings / Subtitles / Share / Fullscreen).
    // Joining it — instead of being a third flex child of .bottom-bar-controls —
    // keeps the whole right side together: the button lands between Share and
    // Fullscreen, exactly the requested order.
    var group = document.querySelector('.bottom-bar-controls .right-utility-btns') ||
                document.querySelector('.right-utility-btns') ||
                document.querySelector('.bottom-bar-controls');
    if (!group) return;
    var b = document.createElement('button');
    b.id = 'btn-watch-party';
    b.className = 'ctrl-btn-small wp-btn';
    b.type = 'button';
    b.title = 'Watch Party';
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" style="display:block;margin:auto">' +
      '<path d="M16 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm-8 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h10v-2.5c0-1.03.53-1.94 1.4-2.6A12.7 12.7 0 0 0 8 13zm8 0a12.7 12.7 0 0 0-2.4.22A3.7 3.7 0 0 1 15 16.5V19h9v-2.5c0-2.33-4.67-3.5-8-3.5z"/></svg>' +
      '<span class="wp-dot"></span>';
    var fs = group.querySelector('#btn-fullscreen');
    if (fs && fs.parentElement === group) group.insertBefore(b, fs); else group.appendChild(b);
    b.addEventListener('click', function (e) { e.stopPropagation(); openPanel(); });
    // keep the dot in sync
    setInterval(function () {
      b.classList.toggle('in-room', S.joined);
      b.classList.toggle('active', S.joined);
    }, 2000);
  }

  function boot() {
    if (!document.getElementById('playerContainer')) return;
    mount();
    injectButton();
    attachSync();
    attachFade();
    ['fullscreenchange', 'webkitfullscreenchange'].forEach(function (ev) {
      document.addEventListener(ev, function () { mount(); render(); });
    });
    // The bottom bar is rebuilt on some player transitions — re-add the button.
    setInterval(function () {
      if (!document.getElementById('btn-watch-party')) injectButton();
      // The button must stay between Share and Fullscreen even if the player
      // re-renders the cluster (or something else re-appends it).
      var b = document.getElementById('btn-watch-party');
      var fs = document.getElementById('btn-fullscreen');
      if (b && fs && fs.parentElement && b.parentElement === fs.parentElement &&
          b.nextElementSibling !== fs) fs.parentElement.insertBefore(b, fs);
      mount();
      attachSync();      // re-bind if the player swapped its <video> element
      attachFade();
    }, 3000);
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 1500);

  // ── public surface (also what the audits drive) ──────────────────────────
  window.DFX_WATCH_PARTY = {
    join: join,
    create: function () { return join(code4(), true); },
    leave: function () { leave(); },
    toggleMic: toggleMic,
    openPanel: openPanel,
    pushSync: pushSync,
    __transport: function () { return S.transport; },
    state: function () {
      return { room: S.room, me: ME, joined: S.joined, host: S.host, muted: S.muted,
               mic: S.mic, members: Object.keys(S.members), syncPossible: syncPossible(),
               syncs: { pushed: S.pushed || 0, applied: S.applied || 0, lastT: S.lastSyncT || 0,
                        appliedAt: S.lastSyncAt || 0, playing: !!S.lastSyncPlaying },
               trace: S.trace,
               panelOpen: !!($('wp-panel') && $('wp-panel').classList.contains('open')),
               dockOpen: !!($('wp-dock') && $('wp-dock').classList.contains('open')),
               panelInContainer: !!(document.getElementById('playerContainer') &&
                 document.getElementById('playerContainer').contains($('wp-panel'))) };
    },
    peers: function () {
      return Object.keys(peers).map(function (id) {
        var p = peers[id];
        return { id: id, ice: p.pc.iceConnectionState, conn: p.pc.connectionState,
                 polite: p.polite, audio: !!(p.audio && p.audio.srcObject),
                 signaling: p.pc.signalingState, gather: p.pc.iceGatheringState,
                 candSent: p.candSent || 0, candGot: p.candGot || 0,
                 desc: !!p.pc.localDescription, remote: !!p.pc.remoteDescription,
                 tracks: p.pc.getReceivers().filter(function (r) { return r.track; }).map(function (r) { return r.track.kind + ':' + r.track.readyState; }) };
      });
    },
    // Audio levels straight from the RTP statistics — the audit uses these to
    // prove that muting really silences the other side and unmuting restores it.
    audioStats: function () {
      var out = {};
      var jobs = Object.keys(peers).map(function (id) {
        return peers[id].pc.getStats().then(function (rep) {
          var row = {};
          rep.forEach(function (r) {
            if (r.type === 'inbound-rtp' && r.kind === 'audio') {
              row.in = { bytes: r.bytesReceived || 0, level: typeof r.audioLevel === 'number' ? r.audioLevel : null,
                         energy: r.totalAudioEnergy || 0, packets: r.packetsReceived || 0 };
            }
            if (r.type === 'outbound-rtp' && r.kind === 'audio') {
              row.out = { bytes: r.bytesSent || 0, level: typeof r.audioLevel === 'number' ? r.audioLevel : null,
                          packets: r.packetsSent || 0 };
            }
          });
          out[id] = row;
        }).catch(function () { out[id] = {}; });
      });
      return Promise.all(jobs).then(function () { return out; });
    },
  };
})();
