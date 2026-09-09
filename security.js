// ==========================================
// DEYMFLIX - Security & Anti-Inspect System
// ==========================================
(function () {
  'use strict';

  // 1. Disable Context Menu (Right-Click)
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    return false;
  });

  // 2. Disable Key Combinations for Developer Tools & Source Inspection
  document.addEventListener('keydown', function (e) {
    // F12
    if (e.keyCode === 123 || e.key === 'F12') {
      e.preventDefault();
      return false;
    }

    // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
    if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67 || e.key === 'I' || e.key === 'J' || e.key === 'C')) {
      e.preventDefault();
      return false;
    }

    // Ctrl+U (View Source) & Ctrl+S (Save)
    if (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 83 || e.key === 'u' || e.key === 's')) {
      e.preventDefault();
      return false;
    }

    // macOS shortcuts: Cmd+Option+I, Cmd+Option+J, Cmd+Option+C, Cmd+Option+U
    if (e.metaKey && e.altKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67 || e.keyCode === 85)) {
      e.preventDefault();
      return false;
    }
  }, true);

  // 3. DevTools Anti-Tamper Loop
  setInterval(function () {
    const startTime = performance.now();
    (function () {}.constructor("debugger")());
    const endTime = performance.now();
    if (endTime - startTime > 100) {
      console.warn('[DEYMFLIX Security] DevTools activity detected.');
    }
  }, 1000);

  // 4. Disable Dragging Media Assets
  document.addEventListener('dragstart', function (e) {
    if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
      e.preventDefault();
    }
  });
})();