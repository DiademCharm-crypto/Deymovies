// ==========================================
// DEYMFLIX - Client Configuration
// ==========================================
// This file contains ONLY non-sensitive configuration.
// ALL API keys and credentials are server-side in proxy-server.js.
// ==========================================

(function () {
  'use strict';

  // Expose safe config on window.__DEYMFLIX_CONFIG__
  window.__DEYMFLIX_CONFIG__ = {
    // ── Backend API base URL ──
    // '' (empty) = same origin (use this when the site is served BY proxy-server.js)
    // When the site is hosted somewhere static (GitHub Pages, Live Server, etc.),
    // put the full URL of the machine running proxy-server.js here, e.g.
    //   API_BASE: 'https://your-node-app.onrender.com'
    // and all /api/... calls (TMDB details, subtitles, ads) will go there instead.
    // Requires the backend to allow CORS (proxy-server.js already does).
    API_BASE: '',

    // Firebase config is safe to send (it's public by design)
    FIREBASE_CONFIG: {
      apiKey: 'AIzaSyCSejdiwh4Y6N6Pwl6QyLXPNYdUqz8vc1M',
      authDomain: 'deymflix.firebaseapp.com',
      databaseURL: 'https://deymflix-default-rtdb.firebaseio.com',
      projectId: 'deymflix',
      storageBucket: 'deymflix.firebasestorage.app',
      messagingSenderId: '333198075783',
      appId: '1:333198075783:web:91765cf2f3c09e3c119522',
      measurementId: 'G-H8KMTM5YYH'
    }
  };

})();
