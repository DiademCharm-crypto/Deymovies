// ═══════════════════════════════════════════════════════════════════════════
//  DEYMFLIX APP v1.3 — FIX PACK (3 paste blocks, replaces everything before)
// ═══════════════════════════════════════════════════════════════════════════
//  Fixes in this version:
//   • Swipe-to-refresh was dead + spinner stuck forever
//       (XML-injected views get NO Event page in Sketchware — the refresh
//        listener must be attached in Java; this block does exactly that)
//   • Videos stuck on "Buffering… 00:00:00" in player & reels
//       (WebView blocked autoplay — setMediaPlaybackRequiresUserGesture(false))
//   • Back button doing nothing / exiting the app
//       (back logic now uses findViewById — no "binding" scope problems)
//   • Fullscreen video restores the page WITHOUT reloading it
//   • offline.html shows at launch, mid-session, and auto-recovers
//
//  WHERE TO PASTE (Sketchware Pro v7 → Logic → MainActivity → ⋮ →
//  Java/Kotlin Injection):
//   SECTION 1 → onCreate tab          (the big block)
//   SECTION 2 → onBackPressed tab
//   SECTION 3 → onResume tab
//
//  BEFORE PASTING, verify the layout (View tab → ⋮ → Edit XML, file `main`):
//   webview1 must be INSIDE a SwipeRefreshLayout with id swipe_refresh.
//   (Your screenshots prove it already is — the white spinner circle.)
//
//  LIBRARY CHECK: Library manager must contain
//   androidx.swiperefreshlayout:swiperefreshlayout:1.1.0   (local library)
// ═══════════════════════════════════════════════════════════════════════════


// ─────────────────────────────────────────────────────────────────────────
// SECTION 1 — paste in the onCreate tab
// ─────────────────────────────────────────────────────────────────────────
final android.webkit.WebView wv = (android.webkit.WebView) findViewById(R.id.webview1);
final androidx.swiperefreshlayout.widget.SwipeRefreshLayout swipe =
        (androidx.swiperefreshlayout.widget.SwipeRefreshLayout) findViewById(R.id.swipe_refresh);

// 1) WebView settings — THE autoplay fix (Buffering… 00:00:00 forever)
wv.getSettings().setJavaScriptEnabled(true);
wv.getSettings().setDomStorageEnabled(true);          // site saves progress/settings
wv.getSettings().setDatabaseEnabled(true);
wv.getSettings().setMediaPlaybackRequiresUserGesture(false);   // ← autoplay fix
wv.getSettings().setLoadWithOverviewMode(true);
wv.getSettings().setUseWideViewPort(true);
wv.getSettings().setSupportZoom(false);
wv.getSettings().setMixedContentMode(android.webkit.WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);

// 2) WebViewClient — hide the refresh spinner on every page load + offline redirect
wv.setWebViewClient(new android.webkit.WebViewClient() {
    @Override
    public void onPageFinished(android.webkit.WebView view, String url) {
        // THE stuck-spinner fix: spinner dies the moment a page finishes
        if (swipe != null) swipe.setRefreshing(false);
    }
    @Override
    public void onReceivedError(android.webkit.WebView view, int errorCode, String description, String failingUrl) {
        // Lost connection mid-browsing → your branded offline page
        if (!isNetworkAvailable()) {
            view.loadUrl("file:///android_asset/offline.html");
        }
        if (swipe != null) swipe.setRefreshing(false);
    }
});

// 3) WebChromeClient — fullscreen video support (restores WITHOUT reloading)
wv.setWebChromeClient(new android.webkit.WebChromeClient() {
    private android.view.View customView;
    private android.webkit.WebChromeClient.CustomViewCallback customViewCallback;
    private android.widget.FrameLayout fullscreenContainer;

    @Override
    public void onShowCustomView(android.view.View view, android.webkit.WebChromeClient.CustomViewCallback callback) {
        if (customView != null) { callback.onCustomViewHidden(); return; }
        customView = view;
        customViewCallback = callback;
        fullscreenContainer = new android.widget.FrameLayout(MainActivity.this);
        fullscreenContainer.setBackgroundColor(android.graphics.Color.BLACK);
        fullscreenContainer.addView(view, new android.widget.FrameLayout.LayoutParams(
                android.widget.FrameLayout.LayoutParams.MATCH_PARENT,
                android.widget.FrameLayout.LayoutParams.MATCH_PARENT));
        setContentView(fullscreenContainer);
        getWindow().getDecorView().setSystemUiVisibility(
                android.view.View.SYSTEM_UI_FLAG_FULLSCREEN
                        | android.view.View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | android.view.View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
    }

    @Override
    public void onHideCustomView() {
        if (customView == null) return;
        fullscreenContainer.removeAllViews();
        setContentView(mActivityRoot);   // same view tree → page state survives
        customView = null;
        customViewCallback = null;
        getWindow().getDecorView().setSystemUiVisibility(android.view.View.SYSTEM_UI_FLAG_VISIBLE);
    }
});

// 4) Swipe-to-refresh — attach the listener HERE, in Java.
//    (swipe_refresh was added by editing the XML, so Sketchware's Event
//     system never created one — that's why swiping did nothing before)
if (swipe != null) {
    swipe.setOnRefreshListener(new androidx.swiperefreshlayout.widget.SwipeRefreshLayout.OnRefreshListener() {
        @Override
        public void onRefresh() {
            if (isNetworkAvailable()) {
                wv.reload();
            } else {
                wv.loadUrl("file:///android_asset/offline.html");
                swipe.setRefreshing(false);   // never leave the spinner spinning
            }
        }
    });
    swipe.setDistanceToTriggerSync(220);
}

// 5) Downloads — "Download this video" button on your site
wv.setDownloadListener(new android.webkit.DownloadListener() {
    @Override
    public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimeType, long contentLength) {
        try {
            android.app.DownloadManager.Request req = new android.app.DownloadManager.Request(android.net.Uri.parse(url));
            req.setNotificationVisibility(android.app.DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            String fileName = android.webkit.URLUtil.guessFileName(url, contentDisposition, mimeType);
            req.setDestinationInExternalPublicDir(android.os.Environment.DIRECTORY_DOWNLOADS, fileName);
            req.setMimeType(mimeType);
            android.app.DownloadManager dm = (android.app.DownloadManager) getSystemService(android.content.Context.DOWNLOAD_SERVICE);
            dm.enqueue(req);
            android.widget.Toast.makeText(getApplicationContext(), "Downloading: " + fileName, android.widget.Toast.LENGTH_SHORT).show();
        } catch (Exception e) {
            android.widget.Toast.makeText(getApplicationContext(), "Download failed", android.widget.Toast.LENGTH_SHORT).show();
        }
    }
});

// 6) Offline at launch → branded offline page
if (!isNetworkAvailable()) {
    wv.loadUrl("file:///android_asset/offline.html");
}

// Remember the activity's real content view (SwipeRefresh or WebView root)
// so fullscreen exit can restore the page without reloading it.
mActivityRoot = ((android.view.ViewGroup) findViewById(android.R.id.content)).getChildAt(0);
}

// ── class members (the "}" above closes onCreate so these live at class level) ──
private android.view.View mActivityRoot;

private boolean isNetworkAvailable() {
    android.net.ConnectivityManager cm = (android.net.ConnectivityManager) getSystemService(android.content.Context.CONNECTIVITY_SERVICE);
    android.net.NetworkInfo ni = cm.getActiveNetworkInfo();
    return ni != null && ni.isConnected();
}


// ─────────────────────────────────────────────────────────────────────────
// SECTION 2 — paste in the onBackPressed tab
// ─────────────────────────────────────────────────────────────────────────
android.webkit.WebView wv = (android.webkit.WebView) findViewById(R.id.webview1);
if (wv == null) { finish(); return; }

String currentUrl = wv.getUrl() == null ? "" : wv.getUrl();
boolean atHome = currentUrl.equals("https://deymflix.eu.cc/")
        || currentUrl.equals("https://deymflix.eu.cc/index.html")
        || currentUrl.endsWith("/index.html")
        || currentUrl.startsWith("file:///android_asset/");

if (atHome) {
    // On the home page → ask before exiting
    new android.app.AlertDialog.Builder(this)
            .setTitle("Exit DEYMFLIX?")
            .setMessage("Do you want to exit?")
            .setPositiveButton("Yes", new android.content.DialogInterface.OnClickListener() {
                @Override
                public void onClick(android.content.DialogInterface dialog, int which) {
                    finish();
                }
            })
            .setNegativeButton("No", null)
            .show();
} else if (wv.canGoBack()) {
    // Any other page → go back one page (player → index, etc.)
    wv.goBack();
} else {
    // No history left → home
    wv.loadUrl("https://deymflix.eu.cc/index.html");
}


// ─────────────────────────────────────────────────────────────────────────
// SECTION 3 — paste in the onResume tab
// ─────────────────────────────────────────────────────────────────────────
android.webkit.WebView wv = (android.webkit.WebView) findViewById(R.id.webview1);
if (wv != null && isNetworkAvailable()
        && wv.getUrl() != null
        && wv.getUrl().startsWith("file:///android_asset/offline.html")) {
    // Connection is back after being offline → return to the site
    wv.loadUrl("https://deymflix.eu.cc/index.html");
}
