// ═══════════════════════════════════════════════════════════════════════════
//  DEYMFLIX APP v1.4a — FEATURE PACK (paste blocks, replaces v1.3 blocks)
//  FIXED BUILD: all inner-class captured variables are now `final`
//  (fixes the 19 compile errors: "Cannot refer to the non-final local variable")
// ═══════════════════════════════════════════════════════════════════════════
//  New in v1.4:
//   • SPLASH SCREEN — branded loading activity shown at launch; it finishes
//     itself only when the site has FULLY loaded (onPageFinished of the home
//     page), with a 6s safety timeout so it can never hang forever.
//   • APP-MODE GATE — the app's WebView identifies itself with a custom user
//     agent ("DeymflixApp/1.4"). The website shows the Download button and
//     the 6th "Downloads" nav item ONLY when it sees this. Browsers: nothing.
//   • JS BRIDGE "DeymflixApp" — the website calls:
//         DeymflixApp.requestDownload(url, title, quality)  → confirm dialog
//         DeymflixApp.openDownloads()                       → downloads page
//   • CONFIRM DIALOG — "Download <title>? Quality: 1080p · Size: 1.4 GB"
//     (real size fetched from Bunny CDN with a native HEAD request)
//   • DOWNLOADS PAGE — dialog listing every download with live progress,
//     plus Cancel (remove from queue) and Delete (remove file).
//     Notification progress in the status bar comes from DownloadManager.
//
//  KEEPING ALL v1.3 FIXES: autoplay, swipe-refresh + spinner fix,
//  back-button logic, fullscreen restore, offline.html handling.
//
//  WHERE TO PASTE (Sketchware Pro v7 → Logic → MainActivity → ⋮ →
//  Java/Kotlin Injection):
//   SECTION 1 → onCreate tab          (the big block)
//   SECTION 2 → onBackPressed tab     (unchanged from v1.3)
//   SECTION 3 → onResume tab          (unchanged from v1.3)
//
//  ⚠️ REPLACE the old v1.3/v1.4 blocks completely — do not append.
//
//  MANIFEST PERMISSIONS (Manifest tab):
//   INTERNET, ACCESS_NETWORK_STATE (already present)
//   WRITE_EXTERNAL_STORAGE  (maxSdkVersion 28)
//   POST_NOTIFICATIONS                          — Android 13+ progress notification
// ═══════════════════════════════════════════════════════════════════════════


// ─────────────────────────────────────────────────────────────────────────
// SECTION 1 — paste in the onCreate tab
// ─────────────────────────────────────────────────────────────────────────
final android.webkit.WebView wv = (android.webkit.WebView) findViewById(R.id.webview1);
// Find the SwipeRefreshLayout by STRUCTURE (it wraps the WebView) instead of
// by id — this compiles no matter what the id is named in your layout
// (swipe_refresh, swiperefreshlayout1, anything).
final androidx.swiperefreshlayout.widget.SwipeRefreshLayout swipe =
        (wv.getParent() instanceof androidx.swiperefreshlayout.widget.SwipeRefreshLayout)
                ? (androidx.swiperefreshlayout.widget.SwipeRefreshLayout) wv.getParent()
                : null;

// ── 1) WebView settings (v1.3 autoplay fix kept) ──
wv.getSettings().setJavaScriptEnabled(true);
wv.getSettings().setDomStorageEnabled(true);
wv.getSettings().setDatabaseEnabled(true);
wv.getSettings().setMediaPlaybackRequiresUserGesture(false);
wv.getSettings().setLoadWithOverviewMode(true);
wv.getSettings().setUseWideViewPort(true);
wv.getSettings().setSupportZoom(false);
wv.getSettings().setMixedContentMode(android.webkit.WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);

// ── 2) APP-MODE: mark the WebView so the site enables app-only features ──
String baseUa = wv.getSettings().getUserAgentString();
if (!baseUa.contains("DeymflixApp")) {
    wv.getSettings().setUserAgentString(baseUa + " DeymflixApp/1.4");
}

// ── 3) SPLASH: show the loading screen while the site boots ──
showSplash();

// ── 4) WebViewClient — spinner fix + offline redirect + SPLASH DISMISS ──
wv.setWebViewClient(new android.webkit.WebViewClient() {
    @Override
    public void onPageFinished(android.webkit.WebView view, String url) {
        if (swipe != null) swipe.setRefreshing(false);
        // Site fully loaded → hide the splash
        hideSplash();
    }
    @Override
    public void onReceivedError(android.webkit.WebView view, int errorCode, String description, String failingUrl) {
        if (!isNetworkAvailable()) {
            view.loadUrl("file:///android_asset/offline.html");
        }
        if (swipe != null) swipe.setRefreshing(false);
        hideSplash(); // never trap the user on the splash
    }
});

// ── 5) WebChromeClient (v1.3 fullscreen fix kept) ──
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
        setContentView(mActivityRoot);
        customView = null;
        customViewCallback = null;
        getWindow().getDecorView().setSystemUiVisibility(android.view.View.SYSTEM_UI_FLAG_VISIBLE);
    }
});

// ── 6) Swipe-to-refresh (v1.3 fix kept) ──
if (swipe != null) {
    swipe.setOnRefreshListener(new androidx.swiperefreshlayout.widget.SwipeRefreshLayout.OnRefreshListener() {
        @Override
        public void onRefresh() {
            if (isNetworkAvailable()) {
                wv.reload();
            } else {
                wv.loadUrl("file:///android_asset/offline.html");
                swipe.setRefreshing(false);
            }
        }
    });
    swipe.setDistanceToTriggerSync(220);
}

// ── 7) JS BRIDGE — the website's app-mode calls land here ──
wv.addJavascriptInterface(getDeymflixBridge(), "DeymflixApp");

// ── 8) DownloadListener — safety net for plain link downloads (v1.3 kept) ──
wv.setDownloadListener(new android.webkit.DownloadListener() {
    @Override
    public void onDownloadStart(final String url, String userAgent, String contentDisposition, String mimeType, final long contentLength) {
        // The bridge path shows the rich confirm dialog; this fallback is for
        // bare links (e.g. long-press download). Same destination folder.
        runOnUiThread(new Runnable() { @Override public void run() {
            enqueueDownload(android.net.Uri.parse(url), guessTitleFromUrl(url), "", contentLength);
        }});
    }
});

// ── 9) Load the site ──
if (isNetworkAvailable()) {
    wv.loadUrl("https://deymflix.eu.cc/index.html");
} else {
    wv.loadUrl("file:///android_asset/offline.html");
}

// Remember the real content view for fullscreen restore (v1.3 kept)
mActivityRoot = ((android.view.ViewGroup) findViewById(android.R.id.content)).getChildAt(0);
}

// ═══════════════ class-level members (live after onCreate's closing brace) ═══════════════

private android.view.View mActivityRoot;

private boolean isNetworkAvailable() {
    android.net.ConnectivityManager cm = (android.net.ConnectivityManager) getSystemService(android.content.Context.CONNECTIVITY_SERVICE);
    android.net.NetworkInfo ni = cm.getActiveNetworkInfo();
    return ni != null && ni.isConnected();
}

// ─────────────────────────── SPLASH SCREEN ───────────────────────────
// A branded loading overlay: red DEYMFLIX logo + spinner, on black.
// It covers the whole screen until the site's first page finishes loading,
// or until the 6-second safety timeout fires — whichever comes first.
private android.widget.LinearLayout splashLayout;
private java.util.Timer splashTimeoutTimer;

private void showSplash() {
    if (splashLayout != null) return; // already showing
    splashLayout = new android.widget.LinearLayout(this);
    splashLayout.setOrientation(android.widget.LinearLayout.VERTICAL);
    splashLayout.setGravity(android.view.Gravity.CENTER);
    splashLayout.setBackgroundColor(android.graphics.Color.parseColor("#0B0B0F"));
    splashLayout.setClickable(true);
    splashLayout.setFocusable(true);

    android.widget.TextView logo = new android.widget.TextView(this);
    logo.setText("DEYMFLIX");
    logo.setTextColor(android.graphics.Color.parseColor("#E50914"));
    logo.setTextSize(34);
    logo.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
    logo.setLetterSpacing(0.15f);

    android.widget.ProgressBar bar = new android.widget.ProgressBar(this);
    bar.setIndeterminate(true);
    bar.getIndeterminateDrawable().setColorFilter(
            android.graphics.Color.parseColor("#E50914"),
            android.graphics.PorterDuff.Mode.SRC_IN);

    android.widget.LinearLayout.LayoutParams barLp = new android.widget.LinearLayout.LayoutParams(
            android.widget.LinearLayout.LayoutParams.WRAP_CONTENT,
            android.widget.LinearLayout.LayoutParams.WRAP_CONTENT);
    barLp.topMargin = 36;

    android.widget.TextView hint = new android.widget.TextView(this);
    hint.setText("Loading your stream…");
    hint.setTextColor(android.graphics.Color.parseColor("#9A9A9A"));
    hint.setTextSize(13);
    android.widget.LinearLayout.LayoutParams hp = new android.widget.LinearLayout.LayoutParams(
            android.widget.LinearLayout.LayoutParams.WRAP_CONTENT,
            android.widget.LinearLayout.LayoutParams.WRAP_CONTENT);
    hp.topMargin = 20;

    splashLayout.addView(logo);
    splashLayout.addView(bar, barLp);
    splashLayout.addView(hint, hp);

    android.view.ViewGroup root = (android.view.ViewGroup) findViewById(android.R.id.content);
    root.addView(splashLayout, new android.view.ViewGroup.LayoutParams(
            android.view.ViewGroup.LayoutParams.MATCH_PARENT,
            android.view.ViewGroup.LayoutParams.MATCH_PARENT));

    // Safety net: never hang on the splash longer than 6 seconds
    splashTimeoutTimer = new java.util.Timer();
    splashTimeoutTimer.schedule(new java.util.TimerTask() {
        @Override
        public void run() {
            runOnUiThread(new Runnable() { @Override public void run() { hideSplash(); } });
        }
    }, 6000);
}

private void hideSplash() {
    if (splashLayout == null) return;
    if (splashTimeoutTimer != null) { splashTimeoutTimer.cancel(); splashTimeoutTimer = null; }
    final android.widget.LinearLayout splash = splashLayout;
    splashLayout = null;
    splash.animate().alpha(0f).setDuration(280).withEndAction(new Runnable() {
        @Override public void run() {
            android.view.ViewGroup parent = (android.view.ViewGroup) splash.getParent();
            if (parent != null) parent.removeView(splash);
        }
    }).start();
}

// ─────────────────────────── JS BRIDGE ───────────────────────────
// The website (app.js, app mode) calls window.DeymflixApp.requestDownload(...)
// and window.DeymflixApp.openDownloads(...). @JavascriptInterface is REQUIRED
// on each method or the WebView refuses to expose it (API 17+).
private Object getDeymflixBridge() {
    return new Object() {
        @android.webkit.JavascriptInterface
        public void requestDownload(final String url, final String title, final String quality) {
            runOnUiThread(new Runnable() { @Override public void run() {
                confirmAndDownload(url, title, quality);
            }});
        }
        @android.webkit.JavascriptInterface
        public void openDownloads() {
            runOnUiThread(new Runnable() { @Override public void run() {
                showDownloadsPage();
            }});
        }
        // enter = true → immersive fullscreen + landscape lock (app-mode player)
        // enter = false → back to normal portrait layout
        @android.webkit.JavascriptInterface
        public void toggleFullscreen(final boolean enter) {
            runOnUiThread(new Runnable() { @Override public void run() {
                if (enter) {
                    enterAppFullscreen();
                } else {
                    exitAppFullscreen();
                }
            }});
        }
    };
}

// ─────────────────────────── APP FULLSCREEN ───────────────────────────
// Android WebView doesn't support the HTML5 Fullscreen API, so the website
// asks us (bridge call above) and we do it natively: hide system bars,
// landscape sensor lock, and a black backdrop behind the video.
private android.widget.FrameLayout appFsContainer;

private void enterAppFullscreen() {
    if (appFsContainer != null) return;
    // 1) Landscape lock (sensor-aware so the user can flip the phone)
    setRequestedOrientation(android.content.pm.ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
    // 2) Black backdrop so the WebView's page chrome never flashes at the edges
    android.widget.FrameLayout content = (android.widget.FrameLayout) findViewById(android.R.id.content);
    appFsContainer = new android.widget.FrameLayout(this);
    appFsContainer.setBackgroundColor(android.graphics.Color.BLACK);
    content.addView(appFsContainer, new android.view.ViewGroup.LayoutParams(
            android.view.ViewGroup.LayoutParams.MATCH_PARENT,
            android.view.ViewGroup.LayoutParams.MATCH_PARENT));
    // 3) Immersive sticky: status + navigation bars hidden
    android.view.Window w = getWindow();
    w.addFlags(android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN);
    android.view.View decor = w.getDecorView();
    decor.setSystemUiVisibility(
            android.view.View.SYSTEM_UI_FLAG_FULLSCREEN
            | android.view.View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | android.view.View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            | android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            | android.view.View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | android.view.View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
}

private void exitAppFullscreen() {
    if (appFsContainer == null) return;
    android.view.ViewGroup content = (android.view.ViewGroup) findViewById(android.R.id.content);
    content.removeView(appFsContainer);
    appFsContainer = null;
    setRequestedOrientation(android.content.pm.ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
    android.view.Window w = getWindow();
    w.clearFlags(android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN);
    w.getDecorView().setSystemUiVisibility(android.view.View.SYSTEM_UI_FLAG_VISIBLE);
}

// Back button while in app-fullscreen leaves fullscreen before page-back runs
private boolean isAppFullscreen() {
    return appFsContainer != null;
}

// ─────────────────────────── CONFIRM + ENQUEUE ───────────────────────────
private void confirmAndDownload(final String url, final String title, final String quality) {
    if (url == null || url.length() == 0) {
        android.widget.Toast.makeText(getApplicationContext(), "This title cannot be downloaded.", android.widget.Toast.LENGTH_SHORT).show();
        return;
    }
    // Android 13+: POST_NOTIFICATIONS must be granted or the progress
    // notification silently never appears.
    if (android.os.Build.VERSION.SDK_INT >= 33
            && checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
        requestPermissions(new String[]{ android.Manifest.permission.POST_NOTIFICATIONS }, 4101);
        // continue anyway — download works, just without the status-bar bar
    }

    android.widget.Toast.makeText(getApplicationContext(), "Checking file…", android.widget.Toast.LENGTH_SHORT).show();

    // Native HEAD request → real file size (no CORS limits for native code)
    new Thread(new Runnable() { @Override public void run() {
        long size = -1;
        try {
            java.net.URL u = new java.net.URL(url);
            java.net.HttpURLConnection c = (java.net.HttpURLConnection) u.openConnection();
            c.setRequestMethod("HEAD");
            c.setConnectTimeout(8000);
            c.setReadTimeout(8000);
            c.setRequestProperty("User-Agent", "DeymflixApp/1.4");
            size = c.getContentLengthLong();
            c.disconnect();
        } catch (Exception e) { size = -1; }
        final long fSize = size;
        runOnUiThread(new Runnable() { @Override public void run() {
            showConfirmDialog(url, title, quality, fSize);
        }});
    }}).start();
}

private void showConfirmDialog(final String url, final String title, final String quality, final long sizeBytes) {
    StringBuilder msg = new StringBuilder();
    msg.append(title);
    if (quality != null && quality.length() > 0) msg.append("\nQuality: ").append(quality);
    if (sizeBytes > 0) {
        msg.append("\nSize: ").append(humanSize(sizeBytes));
    } else {
        msg.append("\nSize: unknown");
    }
    msg.append("\n\nStart downloading?");
    new android.app.AlertDialog.Builder(this)
        .setTitle("Download")
        .setMessage(msg.toString())
        .setPositiveButton("Download", new android.content.DialogInterface.OnClickListener() {
            @Override public void onClick(android.content.DialogInterface d, int w) {
                enqueueDownload(android.net.Uri.parse(url), title, quality, sizeBytes);
            }
        })
        .setNegativeButton("Cancel", null)
        .show();
}

private void enqueueDownload(final android.net.Uri uri, final String title, final String quality, final long knownSize) {
    try {
        android.app.DownloadManager.Request req = new android.app.DownloadManager.Request(uri);
        req.setNotificationVisibility(android.app.DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
        req.setTitle(title + (quality != null && quality.length() > 0 ? " (" + quality + ")" : ""));
        req.setDescription("DEYMFLIX download");
        String fileName = android.webkit.URLUtil.guessFileName(uri.toString(), null, "video/mp4");
        if (!fileName.toLowerCase().endsWith(".mp4")) fileName = sanitizeFileName(title) + ".mp4";
        req.setDestinationInExternalPublicDir(android.os.Environment.DIRECTORY_MOVIES, "Deymflix/" + fileName);
        req.setMimeType("video/mp4");
        req.allowScanningByMediaScanner();
        android.app.DownloadManager dm = (android.app.DownloadManager) getSystemService(android.content.Context.DOWNLOAD_SERVICE);
        long id = dm.enqueue(req);
        rememberDownload(id, title, quality);
        android.widget.Toast.makeText(getApplicationContext(), "Downloading " + title + " — see notification", android.widget.Toast.LENGTH_LONG).show();
    } catch (Exception e) {
        android.widget.Toast.makeText(getApplicationContext(), "Download failed: " + e.getMessage(), android.widget.Toast.LENGTH_LONG).show();
    }
}

// ─────────────────────────── DOWNLOADS PAGE ───────────────────────────
// A dialog-based downloads list (no second activity needed). Shows each
// download's progress live, refreshes every second while open. Cancel
// removes a queued/active item; Delete removes the file of a finished one.
private android.app.Dialog downloadsDialog;
private java.util.Timer downloadsRefreshTimer;

private void showDownloadsPage() {
    if (downloadsDialog != null && downloadsDialog.isShowing()) return;
    final android.app.DownloadManager dm = (android.app.DownloadManager) getSystemService(android.content.Context.DOWNLOAD_SERVICE);

    android.widget.LinearLayout box = new android.widget.LinearLayout(this);
    box.setOrientation(android.widget.LinearLayout.VERTICAL);
    box.setBackgroundColor(android.graphics.Color.parseColor("#141418"));
    box.setPadding(24, 24, 24, 24);

    android.widget.TextView head = new android.widget.TextView(this);
    head.setText("My Downloads");
    head.setTextColor(android.graphics.Color.WHITE);
    head.setTextSize(19);
    head.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
    box.addView(head);

    final android.widget.LinearLayout list = new android.widget.LinearLayout(this);
    list.setOrientation(android.widget.LinearLayout.VERTICAL);
    box.addView(list);

    final android.widget.TextView empty = new android.widget.TextView(this);
    empty.setText("No downloads yet. Open any movie and tap the download button.");
    empty.setTextColor(android.graphics.Color.parseColor("#8A8A8A"));
    empty.setTextSize(14);
    box.addView(empty);

    downloadsDialog = new android.app.Dialog(this);
    downloadsDialog.setTitle("My Downloads");
    downloadsDialog.setContentView(box);
    android.view.Window win = downloadsDialog.getWindow();
    if (win != null) win.setLayout(
            android.view.ViewGroup.LayoutParams.MATCH_PARENT,
            android.view.ViewGroup.LayoutParams.WRAP_CONTENT);
    downloadsDialog.setOnDismissListener(new android.content.DialogInterface.OnDismissListener() {
        @Override public void onDismiss(android.content.DialogInterface d) {
            if (downloadsRefreshTimer != null) { downloadsRefreshTimer.cancel(); downloadsRefreshTimer = null; }
        }
    });
    downloadsDialog.show();

    // Live refresh loop while the dialog is open
    final android.app.Activity act = this;
    downloadsRefreshTimer = new java.util.Timer();
    downloadsRefreshTimer.schedule(new java.util.TimerTask() {
        @Override public void run() {
            act.runOnUiThread(new Runnable() { @Override public void run() {
                if (downloadsDialog == null || !downloadsDialog.isShowing()) return;
                renderDownloadsList(list, empty, dm);
            }});
        }
    }, 0, 1000);
}

private void renderDownloadsList(final android.widget.LinearLayout list, final android.widget.TextView empty, final android.app.DownloadManager dm) {
    list.removeAllViews();
    android.database.Cursor c = dm.query(new android.app.DownloadManager.Query().setFilterByStatus(
            android.app.DownloadManager.STATUS_PAUSED | android.app.DownloadManager.STATUS_PENDING
            | android.app.DownloadManager.STATUS_RUNNING | android.app.DownloadManager.STATUS_SUCCESSFUL
            | android.app.DownloadManager.STATUS_FAILED));
    boolean any = false;
    if (c != null) {
        while (c.moveToNext() && list.getChildCount() < 12) {
            any = true;
            final long id      = c.getLong(c.getColumnIndexOrThrow(android.app.DownloadManager.COLUMN_ID));
            final String title = c.getString(c.getColumnIndexOrThrow(android.app.DownloadManager.COLUMN_TITLE));
            final int status   = c.getInt(c.getColumnIndexOrThrow(android.app.DownloadManager.COLUMN_STATUS));
            final long done    = c.getLong(c.getColumnIndexOrThrow(android.app.DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR));
            final long total   = c.getLong(c.getColumnIndexOrThrow(android.app.DownloadManager.COLUMN_TOTAL_SIZE_BYTES));
            final String reason = c.getString(c.getColumnIndexOrThrow(android.app.DownloadManager.COLUMN_REASON));

            android.widget.LinearLayout row = new android.widget.LinearLayout(this);
            row.setOrientation(android.widget.LinearLayout.VERTICAL);
            row.setPadding(0, 18, 0, 18);

            android.widget.TextView t = new android.widget.TextView(this);
            t.setText(title);
            t.setTextColor(android.graphics.Color.WHITE);
            t.setTextSize(15);
            row.addView(t);

            final android.widget.TextView sub = new android.widget.TextView(this);
            final android.widget.ProgressBar pb = new android.widget.ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
            pb.getProgressDrawable().setColorFilter(android.graphics.Color.parseColor("#E50914"), android.graphics.PorterDuff.Mode.SRC_IN);

            if (status == android.app.DownloadManager.STATUS_SUCCESSFUL) {
                sub.setText("Saved to Movies/Deymflix · " + humanSize(total));
                sub.setTextColor(android.graphics.Color.parseColor("#7BD88F"));
                pb.setVisibility(android.view.View.GONE);
            } else if (status == android.app.DownloadManager.STATUS_FAILED) {
                sub.setText("Failed (" + reason + ")");
                sub.setTextColor(android.graphics.Color.parseColor("#E57373"));
                pb.setVisibility(android.view.View.GONE);
            } else if (total > 0) {
                int pct = (int) (done * 100 / total);
                sub.setText(pct + "% · " + humanSize(done) + " / " + humanSize(total));
                sub.setTextColor(android.graphics.Color.parseColor("#9A9A9A"));
                pb.setMax(100); pb.setProgress(pct);
                pb.setVisibility(android.view.View.VISIBLE);
            } else {
                sub.setText("Starting… " + humanSize(done));
                sub.setTextColor(android.graphics.Color.parseColor("#9A9A9A"));
                pb.setIndeterminate(true);
                pb.setVisibility(android.view.View.VISIBLE);
            }
            row.addView(sub);
            row.addView(pb, new android.widget.LinearLayout.LayoutParams(
                    android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
                    android.widget.LinearLayout.LayoutParams.WRAP_CONTENT));

            // Buttons: Cancel (active) / Delete (finished)
            android.widget.LinearLayout btnRow = new android.widget.LinearLayout(this);
            btnRow.setOrientation(android.widget.LinearLayout.HORIZONTAL);
            android.widget.Button cancel = new android.widget.Button(this);
            if (status == android.app.DownloadManager.STATUS_SUCCESSFUL) {
                cancel.setText("Delete");
            } else {
                cancel.setText("Cancel");
            }
            cancel.setTextColor(android.graphics.Color.parseColor("#E57373"));
            cancel.setBackgroundColor(android.graphics.Color.TRANSPARENT);
            cancel.setAllCaps(false);
            cancel.setOnClickListener(new android.view.View.OnClickListener() {
                @Override public void onClick(android.view.View v) {
                    if (status == android.app.DownloadManager.STATUS_SUCCESSFUL) {
                        try {
                            String local = dm.getUriForDownloadedFile(id).toString();
                            new java.io.File(android.net.Uri.parse(local).getPath()).delete();
                        } catch (Exception e) { }
                        dm.remove(id);
                        android.widget.Toast.makeText(getApplicationContext(), "Deleted", android.widget.Toast.LENGTH_SHORT).show();
                    } else {
                        dm.remove(id);
                        android.widget.Toast.makeText(getApplicationContext(), "Cancelled", android.widget.Toast.LENGTH_SHORT).show();
                    }
                    renderDownloadsList(list, empty, dm);
                }
            });
            btnRow.addView(cancel);
            row.addView(btnRow);

            list.addView(row);
        }
        c.close();
    }
    empty.setVisibility(any ? android.view.View.GONE : android.view.View.VISIBLE);
}

// ─────────────────────────── small helpers ───────────────────────────
private String humanSize(long bytes) {
    if (bytes <= 0) return "—";
    double b = bytes;
    String[] units = { "B", "KB", "MB", "GB" };
    int i = 0;
    while (b >= 1024 && i < units.length - 1) { b /= 1024; i++; }
    return String.format(java.util.Locale.US, "%.1f %s", b, units[i]);
}

private String guessTitleFromUrl(String url) {
    try {
        String path = android.net.Uri.parse(url).getLastPathSegment();
        if (path == null) return "Video";
        path = java.net.URLDecoder.decode(path, "UTF-8");
        int dot = path.lastIndexOf('.');
        if (dot > 0) {
            return path.substring(0, dot).replace('.', ' ').replace('_', ' ').replace('-', ' ').trim();
        }
        return path;
    } catch (Exception e) { return "Video"; }
}

private String sanitizeFileName(String s) {
    String clean = (s == null ? "video" : s).replaceAll("[^A-Za-z0-9 ._-]", "").trim();
    return clean.length() > 0 ? clean : "video";
}

// Track titles for queued downloads (id → "Title (quality)")
private java.util.HashMap<Long, String> downloadTitles = new java.util.HashMap<Long, String>();
private void rememberDownload(long id, String title, String quality) {
    downloadTitles.put(Long.valueOf(id), title + (quality != null && quality.length() > 0 ? " (" + quality + ")" : ""));
}


// ─────────────────────────────────────────────────────────────────────────
// SECTION 2 — paste in the onBackPressed tab  (v1.4a: fullscreen-aware)
// ─────────────────────────────────────────────────────────────────────────
// If the video is in app-fullscreen, back exits fullscreen first.
if (isAppFullscreen()) {
    android.webkit.WebView wvFs = (android.webkit.WebView) findViewById(R.id.webview1);
    wvFs.loadUrl("javascript:(function(){try{exitFullscreen();}catch(e){}})();");
    return;
}

android.webkit.WebView wv = (android.webkit.WebView) findViewById(R.id.webview1);
if (wv == null) { finish(); return; }

String currentUrl = wv.getUrl() == null ? "" : wv.getUrl();
boolean atHome = currentUrl.equals("https://deymflix.eu.cc/")
        || currentUrl.equals("https://deymflix.eu.cc/index.html")
        || currentUrl.endsWith("/index.html")
        || currentUrl.startsWith("file:///android_asset/");

if (atHome) {
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
    wv.goBack();
} else {
    wv.loadUrl("https://deymflix.eu.cc/index.html");
}


// ─────────────────────────────────────────────────────────────────────────
// SECTION 3 — paste in the onResume tab  (unchanged from v1.3)
// ─────────────────────────────────────────────────────────────────────────
android.webkit.WebView wv = (android.webkit.WebView) findViewById(R.id.webview1);
if (wv != null && isNetworkAvailable()
        && wv.getUrl() != null
        && wv.getUrl().startsWith("file:///android_asset/offline.html")) {
    wv.loadUrl("https://deymflix.eu.cc/index.html");
}
