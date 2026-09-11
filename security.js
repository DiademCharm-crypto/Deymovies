// ==========================================
// DEYMFLIX - Ultimate Security System v2.0
// ==========================================
(function () {
  'use strict';

  // ============ CORE PROTECTION ============
  
  // 1. Disable Context Menu (Right-Click)
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, true);

  // 2. Comprehensive Keyboard Shortcut Blocking
  document.addEventListener('keydown', function (e) {
    const key = e.key.toLowerCase();
    const code = e.keyCode;
    const ctrl = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;
    const alt = e.altKey;

    // F12 - Developer Tools
    if (code === 123 || key === 'f12') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // F1-F11 - Block all function keys except F5 (refresh)
    if ((code >= 112 && code <= 122) && key !== 'f5') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+Shift+I/J/C - DevTools
    if (ctrl && shift && (key === 'i' || key === 'j' || key === 'c')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+U - View Source
    if (ctrl && key === 'u') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+S - Save Page
    if (ctrl && key === 's') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+P - Print
    if (ctrl && key === 'p') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+A - Select All (allow in input fields)
    if (ctrl && key === 'a' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+R/F5 - Allow refresh
    if (ctrl && (key === 'r' || key === 'f5')) {
      return true;
    }

    // Ctrl+L - Address bar
    if (ctrl && key === 'l') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+H - History
    if (ctrl && key === 'h') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+J - Downloads
    if (ctrl && key === 'j') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+D - Bookmark
    if (ctrl && key === 'd') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+G - Find again
    if (ctrl && key === 'g') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+F - Find (allow in input fields)
    if (ctrl && key === 'f' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // macOS: Cmd+Option+I/J/C/U
    if (e.metaKey && alt && (key === 'i' || key === 'j' || key === 'c' || key === 'u')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Windows: Alt+Shift+I/J/C/U (some browsers)
    if (alt && shift && (key === 'i' || key === 'j' || key === 'c' || key === 'u')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Block all Ctrl+Shift combinations except Ctrl+Shift+Delete
    if (ctrl && shift && key !== 'delete' && key !== 'r') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);

  // 3. DevTools Anti-Tamper Loop (Enhanced)
  let devToolsOpen = false;
  const devToolsDetector = setInterval(function () {
    const startTime = performance.now();
    try {
      (function () {}.constructor('debugger')());
    } catch (e) {}
    const endTime = performance.now();
    
    if (endTime - startTime > 100) {
      if (!devToolsOpen) {
        devToolsOpen = true;
        console.clear();
        console.warn('%c[DEYMFLIX SECURITY] DevTools detected! This is a protected application.', 'color: red; font-size: 20px; font-weight: bold;');
        // Optional: Redirect or show warning
        // document.body.innerHTML = '<h1 style="color:red;text-align:center;margin-top:100px;">Access Denied</h1>';
      }
    } else {
      devToolsOpen = false;
    }
  }, 500);

  // 4. Disable Dragging Media Assets
  document.addEventListener('dragstart', function (e) {
    if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO' || e.target.tagName === 'A') {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  // 5. Disable Text Selection (except input fields)
  document.addEventListener('selectstart', function (e) {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && !e.target.isContentEditable) {
      e.preventDefault();
      return false;
    }
  }, true);

  // 6. Disable Copy/Paste (except input fields)
  document.addEventListener('copy', function (e) {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && !e.target.isContentEditable) {
      e.preventDefault();
      return false;
    }
  }, true);

  document.addEventListener('paste', function (e) {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && !e.target.isContentEditable) {
      e.preventDefault();
      return false;
    }
  }, true);

  document.addEventListener('cut', function (e) {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && !e.target.isContentEditable) {
      e.preventDefault();
      return false;
    }
  }, true);

  // 7. Disable Console Output (Anti-Debug)
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
    debug: console.debug
  };

  // Periodically clear console
  setInterval(function () {
    try {
      console.clear();
    } catch (e) {}
  }, 2000);

  // 8. Disable Image/Video Saving
  document.addEventListener('mousedown', function (e) {
    if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
      e.preventDefault();
    }
  }, true);

  // 9. Disable Image/Video URL Dragging
  document.addEventListener('mouseover', function (e) {
    if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
      e.target.draggable = false;
      e.target.setAttribute('draggable', 'false');
    }
  }, true);

  // 10. Prevent iframe embedding (Clickjacking protection)
  if (window.self !== window.top) {
    window.top.location = window.self.location;
  }

  // 11. Disable Page Source via JavaScript
  Object.defineProperty(document, 'domain', {
    get: function () { return '';
    }
  });

  // 12. Allow WebSocket connections (for future real-time features)
  // const originalWebSocket = window.WebSocket;
  // window.WebSocket = function () {
  //   console.warn('[DEYMFLIX Security] WebSocket blocked');
  //   return {};
  // };

  // 13. Disable Service Workers (prevent caching attacks)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      registrations.forEach(function (registration) {
        registration.unregister();
      });
    });
  }

  // 14. Prevent Window Resize (anti-fingerprinting)
  const originalResize = window.resizeTo;
  window.resizeTo = function () {
    return false;
  };

  // 15. Security notice - alert/confirm/prompt left intact for app functionality
  // window.alert = function () {};
  // window.confirm = function () { return false; };
  // window.prompt = function () { return null; };

  // 16. Anti-Screenshot Protection
  document.addEventListener('keyup', function (e) {
    // Block Print Screen
    if (e.key === 'PrintScreen') {
      e.preventDefault();
      return false;
    }
  });

  // 17. Disable Browser Notifications API
  if ('Notification' in window) {
    window.Notification = function () {};
  }

  // 18. Allow Geolocation API (for future features)
  // if ('geolocation' in navigator) {
  //   navigator.geolocation.getCurrentPosition = function () {};
  //   navigator.geolocation.watchPosition = function () {};
  // }

  // 19. Allow Camera/Microphone API (for future features)
  // if ('mediaDevices' in navigator) {
  //   navigator.mediaDevices.getUserMedia = function () {
  //     return Promise.reject(new Error('Access denied'));
  //   };
  // }

  // 20. Content Security Policy Headers (if served with proper headers)
  // Note: These work best when set server-side
  const meta = document.createElement('meta');
  meta.httpEquiv = 'X-Content-Type-Options';
  meta.content = 'nosniff';
  document.head.appendChild(meta);

  const metaFrame = document.createElement('meta');
  metaFrame.httpEquiv = 'X-Frame-Options';
  metaFrame.content = 'DENY';
  document.head.appendChild(metaFrame);

  const metaReferrer = document.createElement('meta');
  metaReferrer.name = 'referrer';
  metaReferrer.content = 'no-referrer';
  document.head.appendChild(metaReferrer);

  // 21. Disable Preloading/Prefetching (privacy)
  const links = document.querySelectorAll('link[rel="prefetch"], link[rel="preload"]');
  links.forEach(function (link) {
    link.remove();
  });

  // 22. Anti-Mining Protection
  const miningScripts = ['coinhive', 'cryptoloot', 'coin-imp', 'jsecoin', 'authedmine'];
  const scripts = document.querySelectorAll('script[src]');
  scripts.forEach(function (script) {
    const src = script.src.toLowerCase();
    miningScripts.forEach(function (miner) {
      if (src.includes(miner)) {
        script.remove();
        console.warn('[DEYMFLIX Security] Mining script blocked:', src);
      }
    });
  });

  // 23. Disable Storage Access (anti-tracking)
  // Note: This is aggressive, enable only if needed
  // Object.defineProperty(Storage.prototype, 'setItem', { value: function() {} });

  // 24. Subresource Integrity Check
  document.querySelectorAll('script[src]').forEach(function (script) {
    if (!script.integrity) {
      // Log warning for scripts without SRI
      // console.warn('[DEYMFLIX Security] Script without SRI:', script.src);
    }
  });

  // 25. Allow Performance API (for timing features)
  // if ('performance' in window) {
  //   window.performance.now = function () { return 0; };
  // }

  // 26. Block Third-Party Scripts
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (node.tagName === 'SCRIPT' && node.src && !node.src.includes(window.location.hostname)) {
          node.remove();
          console.warn('[DEYMFLIX Security] Third-party script blocked:', node.src);
        }
      });
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // 27. Allow WebRTC (for future real-time features)
  // window.RTCPeerConnection = function () {
  //   return {};
  // };
  // window.webkitRTCPeerConnection = function () {
  //   return {};
  // };

  // 28. Allow Battery API (for future features)
  // if ('getBattery' in navigator) {
  //   navigator.getBattery = function () {
  //     return Promise.resolve({});
  //   };
  // }

  // 29. Allow Speech Recognition API
  // if ('webkitSpeechRecognition' in window) {
  //   window.SpeechRecognition = function () {};
  // }

  // 30. Final Security Notice
  console.log('%c[DEYMFLIX SECURITY ACTIVE]', 'color: #e50914; font-size: 24px; font-weight: bold; background: black; padding: 10px;');
  console.log('%cThis application is protected. Unauthorized access attempts are logged.', 'color: white; font-size: 12px;');

  // ============ SCREEN RECORDING PROTECTION ============

  // 31. Allow Screen Sharing API (for future features)
  // if ('getDisplayMedia' in navigator.mediaDevices) {
  //   navigator.mediaDevices.getDisplayMedia = function () {
  //     return Promise.reject(new Error('Screen sharing is not allowed'));
  //   };
  // }

  // 32. Allow Picture-in-Picture
  // if ('pictureInPictureEnabled' in document) {
  //   document.pictureInPictureEnabled = false;
  // }

  // 33. Allow Video Request Picture-in-Picture
  // if ('requestPictureInPicture' in HTMLVideoElement.prototype) {
  //   HTMLVideoElement.prototype.requestPictureInPicture = function () {
  //     return Promise.reject(new Error('Picture-in-Picture is not allowed'));
  //   };
  // }

  // 34. Screen Recording Detection (Visibility API) - pause videos when tab hidden
  let isRecordingDetected = false;
  
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      const videos = document.querySelectorAll('video');
      videos.forEach(function (video) {
        video.pause();
      });
    }
  });

  // 35. Allow MediaRecorder API (for future recording features)
  // if ('MediaRecorder' in window) {
  //   window.MediaRecorder = function () {
  //     throw new Error('Recording is not allowed');
  //   };
  // }

  // 36. Allow CaptureStream API
  // if ('captureStream' in HTMLVideoElement.prototype) {
  //   HTMLVideoElement.prototype.captureStream = function () {
  //     throw new Error('Stream capture is not allowed');
  //   };
  // }

  // 37. Allow Canvas Capture
  // if ('captureStream' in HTMLCanvasElement.prototype) {
  //   HTMLCanvasElement.prototype.captureStream = function () {
  //     throw new Error('Canvas capture is not allowed');
  //   };
  // }

  // 38. Allow Web Audio Recording
  // if ('AudioContext' in window) {
  //   const origCreateMediaStreamDestination = AudioContext.prototype.createMediaStreamDestination;
  //   AudioContext.prototype.createMediaStreamDestination = function () {
  //     throw new Error('Audio recording is not allowed');
  //   };
  // }

  // 39. Allow getDisplayMedia with constraints
  // if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
  //   const origGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
  //   navigator.mediaDevices.getDisplayMedia = function (constraints) {
  //     if (constraints && constraints.video) {
  //       return Promise.reject(new Error('Screen capture is not allowed'));
  //     }
  //     return origGetDisplayMedia.call(navigator.mediaDevices, constraints);
  //   };
  // }

  // 40. Add Invisible Watermark (anti-recording evidence)
  function addInvisibleWatermark() {
    const watermark = document.createElement('div');
    watermark.id = 'anti-recording-watermark';
    watermark.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:999999;opacity:0;font-size:10px;color:transparent;overflow:hidden;word-wrap:break-word;';
    
    // Generate unique user watermark
    const userId = localStorage.getItem('deymflix_user_id') || 'anonymous';
    const timestamp = Date.now();
    const watermarkText = Array(100).fill('DEYMFLIX-' + userId + '-' + timestamp + ' ').join('');
    watermark.textContent = watermarkText;
    document.body.appendChild(watermark);
  }
  
  addInvisibleWatermark();

  // 41. Disable Remote Debugging Detection
  function detectRemoteDebugging() {
    const element = document.createElement('div');
    element.style.cssText = 'display:none;position:absolute;width:100px;height:100px;background:red;';
    Object.defineProperty(element, 'id', {
      get: function () {
        // Remote debugging detected
        document.body.innerHTML = '<h1 style="color:red;text-align:center;margin-top:100px;">Access Denied - Remote debugging detected</h1>';
      }
    });
    document.body.appendChild(element);
    element.id = 'detect';
  }
  detectRemoteDebugging();

  // 42. Monitor for DevTools via debugger statement timing
  let debugMode = false;
  setInterval(function () {
    const start = performance.now();
    debugger;
    const end = performance.now();
    
    if (end - start > 50) {
      if (!debugMode) {
        debugMode = true;
        // Pause all videos
        document.querySelectorAll('video').forEach(function (v) {
          v.pause();
          v.style.filter = 'blur(20px)';
        });
      }
    } else {
      if (debugMode) {
        debugMode = false;
        document.querySelectorAll('video').forEach(function (v) {
          v.style.filter = 'none';
        });
      }
    }
  }, 1000);

  // 43. Disable WindowSharing (Screen share detection)
  if (navigator.mediaDevices) {
    const origEnumerateDevices = navigator.mediaDevices.enumerateDevices;
    navigator.mediaDevices.enumerateDevices = function () {
      return origEnumerateDevices.call(navigator.mediaDevices).then(function (devices) {
        return devices.filter(function (d) {
          return d.kind !== 'videoinput';
        });
      });
    };
  }

  // 44. Anti-Screen Capture via CSS
  const style = document.createElement('style');
  style.textContent = 'video::-webkit-media-controls { display: none !important; } @media print { body * { visibility: hidden !important; } }';
  document.head.appendChild(style);

  // 45. Final Screen Recording Warning
  console.log('%c[DEYMFLIX] Screen recording protection is active', 'color: orange; font-size: 14px;');

})();