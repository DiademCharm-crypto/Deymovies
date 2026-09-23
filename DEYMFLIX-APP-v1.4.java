// ===========================================================================
//  DEYMFLIX APP v1.4e -- FEATURE PACK (paste blocks, replaces v1.4d/c/b/a)
// ===========================================================================
//  WHY v1.4e EXISTS: the past compile failures were NOT Java problems.
//  The code was being copied THROUGH TELEGRAM / chat apps, which:
//    - eat the double-pipe operator (spoiler formatting, chunks vanish)
//    - re-encode symbols: ellipsis and checkmarks became garbage
//  v1.4e is 100% ASCII with ZERO pipe characters used as operators, so it
//  survives any copy path. STILL: copy each section from the .java file
//  opened in a plain text editor (Notepad) -- never from a chat bubble.
//
//  HOW TO COPY SAFELY (phone): open the file on your PC, upload to your own
//  GitHub repo, open the RAW url in the phone browser, select-all, copy.
//  RAW text has no formatting = nothing can be eaten.
//
//  WHERE TO PASTE (Sketchware Pro v7 -> Logic -> vdots -> Java/Kotlin Injection):
//   MainActivity:
//     SECTION 1 -> onCreate tab        (FULL CLEAR first -- replace everything)
//     SECTION 2 -> onBackPressed tab   (ONE LINE)
//     SECTION 3 -> onResume tab        (ONE LINE)
//   DownloadsActivity:
//     SECTION 4 -> onCreate tab        (FULL CLEAR first)
//
//  CLEAN-PASTE CHECK: the LAST line of each tab must be that section's
//  "END OF SECTION" marker. Anything after it = leftovers -> clear, re-paste.
//
//  MANIFEST (already done on your side -- see guide STEP 0):
//   MainActivity configChanges attribute (all five values)
//   Permission: android.permission.POST_NOTIFICATIONS
//  NOTE: this file contains ZERO pipe characters. Flag combinations use "+"
//  instead of the bitwise-or operator (identical for distinct single bits).
// ===========================================================================


// ---------------------------------------------------------------------------
// SECTION 1 of 4 -- paste in MainActivity -> onCreate tab  (FULL CLEAR first)
//
//  NOTE: this section contains ONE unmatched "}" on purpose (it closes
//  onCreate so the helpers below live at class level). Same pattern as
//  v1.3, which compiled fine on your device. Do NOT "fix" it.
// ---------------------------------------------------------------------------
final android.webkit.WebView wv = (android.webkit.WebView) findViewById(R.id.webview1);
// SwipeRefresh found by STRUCTURE (wraps the WebView) -- id-name proof
final androidx.swiperefreshlayout.widget.SwipeRefreshLayout swipe =
        (wv.getParent() instanceof androidx.swiperefreshlayout.widget.SwipeRefreshLayout)
                ? (androidx.swiperefreshlayout.widget.SwipeRefreshLayout) wv.getParent()
                : null;

// -- 1) WebView settings (v1.3 autoplay fix kept) --
wv.getSettings().setJavaScriptEnabled(true);
wv.getSettings().setDomStorageEnabled(true);
wv.getSettings().setDatabaseEnabled(true);
wv.getSettings().setMediaPlaybackRequiresUserGesture(false);
wv.getSettings().setLoadWithOverviewMode(true);
wv.getSettings().setUseWideViewPort(true);
wv.getSettings().setSupportZoom(false);
wv.getSettings().setMixedContentMode(android.webkit.WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);

// -- 2) APP-MODE: mark the WebView so the site enables app-only features --
String baseUa = wv.getSettings().getUserAgentString();
if (!baseUa.contains("DeymflixApp")) {
    wv.getSettings().setUserAgentString(baseUa + " DeymflixApp/1.4");
}

// -- 3) SPLASH: animated logo while the site boots --
showSplash();

// -- 4) WebViewClient -- spinner fix + offline redirect + splash dismiss --
wv.setWebViewClient(new android.webkit.WebViewClient() {
    @Override
    public void onPageFinished(android.webkit.WebView view, String url) {
        if (swipe != null) swipe.setRefreshing(false);
        hideSplash();
    }
    @Override
    public void onReceivedError(android.webkit.WebView view, int errorCode, String description, String failingUrl) {
        if (!isNetworkAvailable()) {
            view.loadUrl("file:///android_asset/offline.html");
        }
        if (swipe != null) swipe.setRefreshing(false);
        hideSplash();
    }
});

// -- 5) WebChromeClient (v1.3 fullscreen-of-page fix kept) --
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
                        + android.view.View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        + android.view.View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
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

// -- 6) Swipe-to-refresh (v1.3 fix kept) --
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

// -- 7) JS BRIDGE --
wv.addJavascriptInterface(getDeymflixBridge(), "DeymflixApp");

// -- 8) DownloadListener -- bare-link fallback --
wv.setDownloadListener(new android.webkit.DownloadListener() {
    @Override
    public void onDownloadStart(final String url, String userAgent, String contentDisposition, String mimeType, final long contentLength) {
        runOnUiThread(new Runnable() { @Override public void run() {
            confirmAndDownload(url, guessTitleFromUrl(url), "");
        }});
    }
});

// -- 9) Load the site --
if (isNetworkAvailable()) {
    wv.loadUrl("https://deymflix.eu.cc/index.html");
} else {
    wv.loadUrl("file:///android_asset/offline.html");
}

// Remember the real content view so Chrome-fullscreen can restore without reload
mActivityRoot = ((android.view.ViewGroup) findViewById(android.R.id.content)).getChildAt(0);
}

// ================ class-level members (live inside MainActivity) ================

private android.view.View mActivityRoot;
private boolean appFullscreen = false;

private boolean isNetworkAvailable() {
    android.net.ConnectivityManager cm = (android.net.ConnectivityManager) getSystemService(android.content.Context.CONNECTIVITY_SERVICE);
    android.net.NetworkInfo ni = cm.getActiveNetworkInfo();
    return ni != null && ni.isConnected();
}

// Called by the ONE-LINE onBackPressed tab (SECTION 2)
private void handleBack() {
    if (isAppFullscreen()) {
        android.webkit.WebView wvB = (android.webkit.WebView) findViewById(R.id.webview1);
        if (wvB != null) wvB.loadUrl("javascript:(function(){try{exitFullscreen();}catch(e){}})();");
        return;
    }
    android.webkit.WebView wvB = (android.webkit.WebView) findViewById(R.id.webview1);
    if (wvB == null) { finish(); return; }
    String currentUrl = wvB.getUrl() == null ? "" : wvB.getUrl();
    // ASCII-safe home check (no pipe operators -- chat apps eat them)
    boolean atHome = currentUrl.equals("https://deymflix.eu.cc/");
    if (!atHome) atHome = currentUrl.equals("https://deymflix.eu.cc/index.html");
    if (!atHome) atHome = currentUrl.endsWith("/index.html");
    if (!atHome) atHome = currentUrl.startsWith("file:///android_asset/");
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
    } else if (wvB.canGoBack()) {
        wvB.goBack();
    } else {
        wvB.loadUrl("https://deymflix.eu.cc/index.html");
    }
}

// Called by the ONE-LINE onResume tab (SECTION 3)
private void handleResume() {
    android.webkit.WebView wvR = (android.webkit.WebView) findViewById(R.id.webview1);
    if (wvR != null && isNetworkAvailable()
            && wvR.getUrl() != null
            && wvR.getUrl().startsWith("file:///android_asset/offline.html")) {
        wvR.loadUrl("https://deymflix.eu.cc/index.html");
    }
}

// ---------------- ANIMATED SPLASH ----------------
private android.widget.LinearLayout splashLayout;
private java.util.Timer splashTimeoutTimer;
private android.view.View hexagonView;
private android.animation.ValueAnimator splashAnimator;

private void showSplash() {
    if (splashLayout != null) return;
    splashLayout = new android.widget.LinearLayout(this);
    splashLayout.setOrientation(android.widget.LinearLayout.VERTICAL);
    splashLayout.setGravity(android.view.Gravity.CENTER);
    splashLayout.setBackgroundColor(android.graphics.Color.parseColor("#0B0B0F"));
    splashLayout.setClickable(true);
    splashLayout.setFocusable(true);

    hexagonView = new HexagonLogoView(this);
    int side = Math.min(getResources().getDisplayMetrics().widthPixels,
                        getResources().getDisplayMetrics().heightPixels) / 3;
    splashLayout.addView(hexagonView, new android.widget.LinearLayout.LayoutParams(side, side));

    android.widget.TextView logo = new android.widget.TextView(this);
    logo.setText("DEYMFLIX");
    logo.setTextColor(android.graphics.Color.WHITE);
    logo.setTextSize(30);
    logo.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
    logo.setLetterSpacing(0.2f);
    android.widget.LinearLayout.LayoutParams lp = new android.widget.LinearLayout.LayoutParams(
            android.widget.LinearLayout.LayoutParams.WRAP_CONTENT,
            android.widget.LinearLayout.LayoutParams.WRAP_CONTENT);
    lp.topMargin = 28;
    splashLayout.addView(logo, lp);

    android.widget.TextView hint = new android.widget.TextView(this);
    hint.setText("Loading your stream...");
    hint.setTextColor(android.graphics.Color.parseColor("#9A9A9A"));
    hint.setTextSize(13);
    android.widget.LinearLayout.LayoutParams hp = new android.widget.LinearLayout.LayoutParams(
            android.widget.LinearLayout.LayoutParams.WRAP_CONTENT,
            android.widget.LinearLayout.LayoutParams.WRAP_CONTENT);
    hp.topMargin = 14;
    splashLayout.addView(hint, hp);

    android.view.ViewGroup root = (android.view.ViewGroup) findViewById(android.R.id.content);
    root.addView(splashLayout, new android.view.ViewGroup.LayoutParams(
            android.view.ViewGroup.LayoutParams.MATCH_PARENT,
            android.view.ViewGroup.LayoutParams.MATCH_PARENT));

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
    if (splashAnimator != null) { splashAnimator.cancel(); splashAnimator = null; }
    if (hexagonView != null) { hexagonView.animate().cancel(); hexagonView = null; }
    final android.widget.LinearLayout splash = splashLayout;
    splashLayout = null;
    splash.animate().alpha(0f).setDuration(300).withEndAction(new Runnable() {
        @Override public void run() {
            android.view.ViewGroup parent = (android.view.ViewGroup) splash.getParent();
            if (parent != null) parent.removeView(splash);
        }
    }).start();
}

// The animated hexagon-play logo (matches the app.html icon)
private class HexagonLogoView extends android.view.View {
    private final android.graphics.Paint hexPaint = new android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG);
    private final android.graphics.Paint glowPaint = new android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG);
    private final android.graphics.Paint triPaint = new android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG);
    private final android.graphics.Path hexPath = new android.graphics.Path();
    private final android.graphics.Path triPath = new android.graphics.Path();
    private float rotation = 0;

    HexagonLogoView(android.content.Context c) {
        super(c);
        hexPaint.setStyle(android.graphics.Paint.Style.STROKE);
        hexPaint.setColor(android.graphics.Color.parseColor("#E50914"));
        hexPaint.setStrokeWidth(14f);
        glowPaint.setStyle(android.graphics.Paint.Style.STROKE);
        glowPaint.setColor(android.graphics.Color.parseColor("#E50914"));
        glowPaint.setStrokeWidth(24f);
        glowPaint.setAlpha(70);
        glowPaint.setMaskFilter(new android.graphics.BlurMaskFilter(18f, android.graphics.BlurMaskFilter.Blur.NORMAL));
        triPaint.setStyle(android.graphics.Paint.Style.FILL);
        triPaint.setColor(android.graphics.Color.WHITE);
        buildPaths();
        android.animation.ValueAnimator animator = android.animation.ValueAnimator.ofFloat(0f, 360f);
        animator.setDuration(6000);
        animator.setRepeatCount(android.animation.ValueAnimator.INFINITE);
        animator.setInterpolator(new android.view.animation.LinearInterpolator());
        animator.addUpdateListener(new android.animation.ValueAnimator.AnimatorUpdateListener() {
            @Override
            public void onAnimationUpdate(android.animation.ValueAnimator a) {
                rotation = (Float) a.getAnimatedValue();
                float pulse = 1f + 0.06f * (float) Math.sin(Math.toRadians(rotation * 6));
                setScaleX(pulse);
                setScaleY(pulse);
                invalidate();
            }
        });
        splashAnimator = animator;
        animator.start();
    }

    private void buildPaths() {
        float R = 100f;
        hexPath.reset();
        for (int i = 0; i < 6; i++) {
            double ang = Math.toRadians(60 * i - 90);
            float x = (float) (R * Math.cos(ang));
            float y = (float) (R * Math.sin(ang));
            if (i == 0) hexPath.moveTo(x, y); else hexPath.lineTo(x, y);
        }
        hexPath.close();
        triPath.reset();
        triPath.moveTo(-22f, -42f);
        triPath.lineTo(-22f, 42f);
        triPath.lineTo(48f, 0f);
        triPath.close();
    }

    @Override
    protected void onDraw(android.graphics.Canvas canvas) {
        super.onDraw(canvas);
        canvas.save();
        canvas.rotate(rotation);
        float scale = Math.min(getWidth(), getHeight()) / 240f;
        canvas.scale(scale, scale);
        canvas.drawPath(hexPath, glowPaint);
        canvas.drawPath(hexPath, hexPaint);
        canvas.restore();
        float tscale = Math.min(getWidth(), getHeight()) / 240f;
        canvas.save();
        canvas.scale(tscale, tscale);
        canvas.drawPath(triPath, triPaint);
        canvas.restore();
    }
}

// ---------------- JS BRIDGE ----------------
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
                try {
                    startActivity(new android.content.Intent(MainActivity.this, DownloadsActivity.class));
                } catch (Exception e) {
                    android.widget.Toast.makeText(getApplicationContext(), "Downloads screen unavailable", android.widget.Toast.LENGTH_SHORT).show();
                }
            }});
        }
        // enter = true: landscape lock + immersive bars. NOTHING covers the video.
        @android.webkit.JavascriptInterface
        public void toggleFullscreen(final boolean enter) {
            runOnUiThread(new Runnable() { @Override public void run() {
                if (enter) enterAppFullscreen(); else exitAppFullscreen();
            }});
        }
    };
}

// ---------------- APP FULLSCREEN ----------------
// Orientation lock + hidden system bars only -- nothing covers the video.
private void enterAppFullscreen() {
    appFullscreen = true;
    setRequestedOrientation(android.content.pm.ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
    android.view.Window w = getWindow();
    w.addFlags(android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN);
    w.getDecorView().setSystemUiVisibility(
            android.view.View.SYSTEM_UI_FLAG_FULLSCREEN
            + android.view.View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            + android.view.View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            + android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            + android.view.View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            + android.view.View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
}

private void exitAppFullscreen() {
    appFullscreen = false;
    setRequestedOrientation(android.content.pm.ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
    android.view.Window w = getWindow();
    w.clearFlags(android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN);
    w.getDecorView().setSystemUiVisibility(android.view.View.SYSTEM_UI_FLAG_VISIBLE);
}

private boolean isAppFullscreen() {
    return appFullscreen;
}

// ---------------- THEMED CONFIRM DIALOG ----------------
private void confirmAndDownload(final String url, final String title, final String quality) {
    // ASCII-safe null/empty check (no pipe operators)
    if (url == null) {
        android.widget.Toast.makeText(getApplicationContext(), "This title cannot be downloaded.", android.widget.Toast.LENGTH_SHORT).show();
        return;
    }
    if (url.length() == 0) {
        android.widget.Toast.makeText(getApplicationContext(), "This title cannot be downloaded.", android.widget.Toast.LENGTH_SHORT).show();
        return;
    }
    if (android.os.Build.VERSION.SDK_INT >= 33
            && checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
        requestPermissions(new String[]{ android.Manifest.permission.POST_NOTIFICATIONS }, 4101);
    }

    android.widget.Toast.makeText(getApplicationContext(), "Checking file...", android.widget.Toast.LENGTH_SHORT).show();
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
    final float density = getResources().getDisplayMetrics().density;
    android.widget.LinearLayout box = new android.widget.LinearLayout(this);
    box.setOrientation(android.widget.LinearLayout.VERTICAL);
    box.setPadding((int)(26 * density), (int)(22 * density), (int)(26 * density), (int)(18 * density));
    box.setBackgroundColor(android.graphics.Color.parseColor("#141418"));
    android.graphics.drawable.GradientDrawable card = new android.graphics.drawable.GradientDrawable();
    card.setColor(android.graphics.Color.parseColor("#141418"));
    card.setCornerRadius(18 * density);
    card.setStroke(1, android.graphics.Color.parseColor("#2A2A30"));

    android.widget.TextView tTitle = new android.widget.TextView(this);
    tTitle.setText("Download");
    tTitle.setTextColor(android.graphics.Color.parseColor("#E50914"));
    tTitle.setTextSize(19);
    tTitle.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);

    android.widget.TextView tMsg = new android.widget.TextView(this);
    String msg = title;
    if (quality != null && quality.length() > 0) msg += "\nQuality: " + quality;
    msg += "\nSize: " + (sizeBytes > 0 ? humanSize(sizeBytes) : "checking...");
    msg += "\n\nSaved inside DEYMFLIX only. Watch it anytime from My Downloads.";
    tMsg.setText(msg);
    tMsg.setTextColor(android.graphics.Color.WHITE);
    tMsg.setTextSize(15);
    tMsg.setLineSpacing(4 * density, 1f);
    android.widget.LinearLayout.LayoutParams mp = new android.widget.LinearLayout.LayoutParams(
            android.widget.LinearLayout.LayoutParams.MATCH_PARENT, android.widget.LinearLayout.LayoutParams.WRAP_CONTENT);
    mp.topMargin = (int)(14 * density);

    android.widget.LinearLayout btnRow = new android.widget.LinearLayout(this);
    btnRow.setOrientation(android.widget.LinearLayout.HORIZONTAL);
    android.widget.LinearLayout.LayoutParams bp = new android.widget.LinearLayout.LayoutParams(
            0, android.widget.LinearLayout.LayoutParams.WRAP_CONTENT, 1f);
    bp.topMargin = (int)(20 * density);

    android.widget.Button no = new android.widget.Button(this);
    no.setText("Cancel");
    no.setAllCaps(false);
    no.setTextColor(android.graphics.Color.parseColor("#BBBBBB"));
    no.setBackgroundDrawable(themedButtonBg("#1E1E24"));
    android.widget.LinearLayout.LayoutParams noP = new android.widget.LinearLayout.LayoutParams(bp);
    noP.rightMargin = (int)(10 * density);

    android.widget.Button yes = new android.widget.Button(this);
    yes.setText("Download");
    yes.setAllCaps(false);
    yes.setTextColor(android.graphics.Color.WHITE);
    yes.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
    yes.setBackgroundDrawable(themedButtonBg("#E50914"));

    btnRow.addView(no, noP);
    btnRow.addView(yes, new android.widget.LinearLayout.LayoutParams(bp));
    box.addView(tTitle);
    box.addView(tMsg, mp);
    box.addView(btnRow);

    final android.app.Dialog d = new android.app.Dialog(this);
    d.getWindow().setBackgroundDrawable(card);
    d.setContentView(box);
    int width = (int) (getResources().getDisplayMetrics().widthPixels * 0.86f);
    d.getWindow().setLayout(width, android.view.ViewGroup.LayoutParams.WRAP_CONTENT);

    no.setOnClickListener(new android.view.View.OnClickListener() {
        @Override public void onClick(android.view.View v) { d.dismiss(); }
    });
    yes.setOnClickListener(new android.view.View.OnClickListener() {
        @Override public void onClick(android.view.View v) {
            d.dismiss();
            enqueueDownload(android.net.Uri.parse(url), title, quality);
        }
    });
    d.show();
}

private android.graphics.drawable.GradientDrawable themedButtonBg(String fill) {
    android.graphics.drawable.GradientDrawable g = new android.graphics.drawable.GradientDrawable();
    g.setColor(android.graphics.Color.parseColor(fill));
    g.setCornerRadius(12f * getResources().getDisplayMetrics().density);
    return g;
}

// ---------------- ENQUEUE (PRIVATE STORAGE) ----------------
// Files land in the app PRIVATE dir: Android/data/com.deymflix.eu.cc/files/Movies/Deymflix
// Invisible to gallery and VLC, only DEYMFLIX can read it, removed on uninstall.
private void enqueueDownload(final android.net.Uri uri, final String title, final String quality) {
    try {
        android.app.DownloadManager.Request req = new android.app.DownloadManager.Request(uri);
        req.setNotificationVisibility(android.app.DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
        String shownTitle = title;
        if (quality != null && quality.length() > 0) shownTitle = title + " (" + quality + ")";
        req.setTitle(shownTitle);
        req.setDescription("DEYMFLIX download");
        String fileName = android.webkit.URLUtil.guessFileName(uri.toString(), null, "video/mp4");
        if (!fileName.toLowerCase().endsWith(".mp4")) fileName = sanitizeFileName(title) + ".mp4";
        java.io.File dir = new java.io.File(getExternalFilesDir(android.os.Environment.DIRECTORY_MOVIES), "Deymflix");
        dir.mkdirs();
        req.setDestinationUri(android.net.Uri.fromFile(new java.io.File(dir, fileName)));
        req.setMimeType("video/mp4");
        android.app.DownloadManager dm = (android.app.DownloadManager) getSystemService(android.content.Context.DOWNLOAD_SERVICE);
        dm.enqueue(req);
        android.widget.Toast.makeText(getApplicationContext(), "Downloading " + title + " -- see notification", android.widget.Toast.LENGTH_LONG).show();
    } catch (Exception e) {
        android.widget.Toast.makeText(getApplicationContext(), "Download failed: " + e.getMessage(), android.widget.Toast.LENGTH_LONG).show();
    }
}

// ---------------- small helpers ----------------
private String humanSize(long bytes) {
    if (bytes <= 0) return "-";
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

// ============ END OF SECTION 1 -- last line of the onCreate tab ============


// ---------------------------------------------------------------------------
// SECTION 2 of 4 -- paste in MainActivity -> onBackPressed tab
// THE ENTIRE TAB CONTENT IS THIS ONE LINE:
// ---------------------------------------------------------------------------
handleBack();
// ============ END OF SECTION 2 -- last line of the onBackPressed tab ============


// ---------------------------------------------------------------------------
// SECTION 3 of 4 -- paste in MainActivity -> onResume tab
// THE ENTIRE TAB CONTENT IS THIS ONE LINE:
// ---------------------------------------------------------------------------
handleResume();
// ============ END OF SECTION 3 -- last line of the onResume tab ============


// ---------------------------------------------------------------------------
// SECTION 4A of 4 -- paste in DownloadsActivity -> onCreate tab (FULL CLEAR first)
// downloads.xml stays EMPTY -- the screen is built here.
// PASTE ORDER: first this SECTION 4A, then SECTION 4B directly below it,
// in the SAME tab. Each half is small so no clipboard can truncate it.
// COPY FROM: the files SECTION-4A-paste.txt and SECTION-4B-paste.txt
// (upload to GitHub and copy from the RAW url -- never from a chat app).
// AFTER PASTING 4A: the last line of what you pasted must be its END marker.
// ---------------------------------------------------------------------------
final float d85 = getResources().getDisplayMetrics().density;
final android.app.DownloadManager dm85 = (android.app.DownloadManager) getSystemService(android.content.Context.DOWNLOAD_SERVICE);

android.widget.LinearLayout root85 = new android.widget.LinearLayout(this);
root85.setOrientation(android.widget.LinearLayout.VERTICAL);
root85.setBackgroundColor(android.graphics.Color.parseColor("#0B0B0F"));
root85.setPadding((int)(18*d85), (int)(20*d85), (int)(18*d85), (int)(18*d85));

android.widget.TextView head85 = new android.widget.TextView(this);
head85.setText("<  My Downloads");
head85.setTextColor(android.graphics.Color.WHITE);
head85.setTextSize(20);
head85.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
head85.setOnClickListener(new android.view.View.OnClickListener() {
    @Override public void onClick(android.view.View v) { finish(); }
});
root85.addView(head85);

final android.widget.LinearLayout list85 = new android.widget.LinearLayout(this);
list85.setOrientation(android.widget.LinearLayout.VERTICAL);
android.widget.LinearLayout.LayoutParams lp85 = new android.widget.LinearLayout.LayoutParams(-1, -2);
lp85.topMargin = (int)(14*d85);
root85.addView(list85, lp85);

final android.widget.TextView empty85 = new android.widget.TextView(this);
empty85.setText("No downloads yet.\nOpen any movie and tap the download button.");
empty85.setTextColor(android.graphics.Color.parseColor("#8A8A8A"));
empty85.setTextSize(14);
empty85.setGravity(android.view.Gravity.CENTER);
android.widget.LinearLayout.LayoutParams ep85 = new android.widget.LinearLayout.LayoutParams(-1, -2);
ep85.topMargin = (int)(40*d85);
root85.addView(empty85, ep85);

setContentView(root85);

// Live refresh loop (1s) while the screen is open
final android.os.Handler h85 = new android.os.Handler();
final Runnable r85 = new Runnable() {
    @Override public void run() {
        if (isFinishing()) return;
        renderDownloadsList85(list85, empty85, dm85);
        h85.postDelayed(this, 1000);
    }
};
h85.post(r85);
}
// ========== END OF SECTION 4A -- last line after pasting 4A. Now paste 4B below. ==========
// ---------------------------------------------------------------------------
// SECTION 4B of 4 -- paste DIRECTLY BELOW 4A in the SAME DownloadsActivity onCreate tab.
// Contains the two class-level methods (list renderer + size helper).
// After pasting, the last line of the tab must be the 4B END marker.
// ---------------------------------------------------------------------------

private void renderDownloadsList85(final android.widget.LinearLayout list, final android.widget.TextView empty, final android.app.DownloadManager dm) {
    list.removeAllViews();
    float d = getResources().getDisplayMetrics().density;
    android.database.Cursor c = dm.query(new android.app.DownloadManager.Query().setFilterByStatus(
            android.app.DownloadManager.STATUS_PAUSED + android.app.DownloadManager.STATUS_PENDING
            + android.app.DownloadManager.STATUS_RUNNING + android.app.DownloadManager.STATUS_SUCCESSFUL
            + android.app.DownloadManager.STATUS_FAILED));
    boolean any = false;
    if (c != null) {
        while (c.moveToNext() && list.getChildCount() < 20) {
            any = true;
            final long id = c.getLong(c.getColumnIndexOrThrow(android.app.DownloadManager.COLUMN_ID));
            final String title = c.getString(c.getColumnIndexOrThrow(android.app.DownloadManager.COLUMN_TITLE));
            final int status = c.getInt(c.getColumnIndexOrThrow(android.app.DownloadManager.COLUMN_STATUS));
            final long done = c.getLong(c.getColumnIndexOrThrow(android.app.DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR));
            final long total = c.getLong(c.getColumnIndexOrThrow(android.app.DownloadManager.COLUMN_TOTAL_SIZE_BYTES));

            android.widget.LinearLayout card = new android.widget.LinearLayout(this);
            card.setOrientation(android.widget.LinearLayout.VERTICAL);
            card.setPadding((int)(16*d), (int)(14*d), (int)(16*d), (int)(14*d));
            android.graphics.drawable.GradientDrawable bg = new android.graphics.drawable.GradientDrawable();
            bg.setColor(android.graphics.Color.parseColor("#141418"));
            bg.setCornerRadius(14*d);
            card.setBackgroundDrawable(bg);
            android.widget.LinearLayout.LayoutParams cp = new android.widget.LinearLayout.LayoutParams(-1, -2);
            cp.topMargin = (int)(10*d);
            list.addView(card, cp);

            android.widget.TextView t = new android.widget.TextView(this);
            t.setText(title);
            t.setTextColor(android.graphics.Color.WHITE);
            t.setTextSize(15);
            t.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
            card.addView(t);

            android.widget.TextView sub = new android.widget.TextView(this);
            sub.setTextSize(13);
            if (status == android.app.DownloadManager.STATUS_SUCCESSFUL) {
                sub.setText("[OK] Saved in DEYMFLIX - " + humanSize85(total));
                sub.setTextColor(android.graphics.Color.parseColor("#7BD88F"));
            } else if (status == android.app.DownloadManager.STATUS_FAILED) {
                sub.setText("[X] Failed");
                sub.setTextColor(android.graphics.Color.parseColor("#E57373"));
            } else if (total > 0) {
                int pct = (int)(done * 100 / total);
                sub.setText(pct + "% - " + humanSize85(done) + " / " + humanSize85(total));
                sub.setTextColor(android.graphics.Color.parseColor("#9A9A9A"));
            } else {
                sub.setText("Starting... " + humanSize85(done));
                sub.setTextColor(android.graphics.Color.parseColor("#9A9A9A"));
            }
            android.widget.LinearLayout.LayoutParams sp = new android.widget.LinearLayout.LayoutParams(-1, -2);
            sp.topMargin = (int)(4*d);
            card.addView(sub, sp);

            android.widget.Button act = new android.widget.Button(this);
            act.setAllCaps(false);
            if (status == android.app.DownloadManager.STATUS_SUCCESSFUL) {
                act.setText("Delete");
            } else {
                act.setText("Cancel");
            }
            act.setTextColor(android.graphics.Color.parseColor("#E57373"));
            act.setBackgroundColor(android.graphics.Color.TRANSPARENT);
            android.widget.LinearLayout.LayoutParams ap = new android.widget.LinearLayout.LayoutParams(-2, -2);
            ap.gravity = android.view.Gravity.RIGHT;
            act.setOnClickListener(new android.view.View.OnClickListener() {
                @Override public void onClick(android.view.View v) {
                    if (status == android.app.DownloadManager.STATUS_SUCCESSFUL) {
                        try {
                            String local = dm.getUriForDownloadedFile(id).toString();
                            new java.io.File(android.net.Uri.parse(local).getPath()).delete();
                        } catch (Exception e) { }
                    }
                    dm.remove(id);
                    if (status == android.app.DownloadManager.STATUS_SUCCESSFUL) {
                        android.widget.Toast.makeText(getApplicationContext(), "Deleted", android.widget.Toast.LENGTH_SHORT).show();
                    } else {
                        android.widget.Toast.makeText(getApplicationContext(), "Cancelled", android.widget.Toast.LENGTH_SHORT).show();
                    }
                    renderDownloadsList85(list, empty, dm);
                }
            });
            card.addView(act, ap);
        }
        c.close();
    }
    empty.setVisibility(any ? android.view.View.GONE : android.view.View.VISIBLE);
}

private String humanSize85(long bytes) {
    if (bytes <= 0) return "-";
    double b = bytes;
    String[] units = { "B", "KB", "MB", "GB" };
    int i = 0;
    while (b >= 1024 && i < units.length - 1) { b /= 1024; i++; }
    return String.format(java.util.Locale.US, "%.1f %s", b, units[i]);
}

// ========== END OF SECTION 4B -- last line of the DownloadsActivity onCreate tab ==========
