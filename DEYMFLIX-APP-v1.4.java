// ===========================================================================
//  DEYMFLIX APP v1.4g -- FEATURE PACK (paste blocks, replaces v1.4f/e/d/c/b/a)
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
        // NETFLIX-STYLE FIX: only treat it as video fullscreen when the <video>
        // element itself is shown (Android renders it into a FrameLayout /
        // VideoView / SurfaceView). A plain div = the PAGE went fullscreen --
        // we keep portrait and just let the site CSS fill the screen.
        boolean isVideo = view instanceof android.widget.FrameLayout
                ? true
                : (view instanceof android.widget.VideoView
                ? true
                : (view instanceof android.view.SurfaceView));
        if (!isVideo) { callback.onCustomViewHidden(); return; }
        if (customView != null) { callback.onCustomViewHidden(); return; }
        customView = view;
        customViewCallback = callback;
        fullscreenContainer = new android.widget.FrameLayout(MainActivity.this);
        fullscreenContainer.setBackgroundColor(android.graphics.Color.BLACK);
        fullscreenContainer.addView(view, new android.widget.FrameLayout.LayoutParams(
                android.widget.FrameLayout.LayoutParams.MATCH_PARENT,
                android.widget.FrameLayout.LayoutParams.MATCH_PARENT));
        setContentView(fullscreenContainer);
        enterAppFullscreen();
    }

    @Override
    public void onHideCustomView() {
        if (customView == null) return;
        fullscreenContainer.removeAllViews();
        setContentView(mActivityRoot);
        customView = null;
        customViewCallback = null;
        exitAppFullscreen();
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
            confirmAndDownload(url, guessTitleFromUrl(url), "", "");
        }});
    }
});

// -- 8b) Purge stale download-registry rows (kept only 7 days) --
purgeOldDlMeta86();

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
private boolean videoFs85 = false;

private boolean isNetworkAvailable() {
    android.net.ConnectivityManager cm = (android.net.ConnectivityManager) getSystemService(android.content.Context.CONNECTIVITY_SERVICE);
    android.net.NetworkInfo ni = cm.getActiveNetworkInfo();
    return ni != null && ni.isConnected();
}

// Called by the ONE-LINE onBackPressed tab (SECTION 2)
private void handleBack() {
    if (isAppFullscreen()) {
        android.webkit.WebView wvB = (android.webkit.WebView) findViewById(R.id.webview1);
        if (wvB != null) wvB.loadUrl("javascript:(function(){try{exitFullscreen();}catch(e){}try{DeymflixApp.toggleFullscreen(false,false);}catch(e2){}})();");
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
        public void requestDownload(final String url, final String title, final String quality, final String poster) {
            runOnUiThread(new Runnable() { @Override public void run() {
                confirmAndDownload(url, title, quality, poster);
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
        // enter = true: landscape lock + immersive bars. isVideo=true only when
        // the VIDEO element went fullscreen -- a page fullscreen keeps portrait
        // (Netflix/LokLok behavior: the page never rotates, only the video).
        @android.webkit.JavascriptInterface
        public void toggleFullscreen(final boolean enter, final boolean isVideo) {
            runOnUiThread(new Runnable() { @Override public void run() {
                if (enter && isVideo) {
                    enterAppFullscreen();
                } else if (!enter) {
                    exitAppFullscreen();
                } else {
                    // Page-level fullscreen: hide the bars, keep portrait
                    appFullscreen = true;
                    android.view.Window w = getWindow();
                    w.addFlags(android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN);
                    w.getDecorView().setSystemUiVisibility(
                            android.view.View.SYSTEM_UI_FLAG_FULLSCREEN
                            + android.view.View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
                }
            }});
        }
        // Anti-recording: black out screenshots + screen recordings while a movie
        // plays (same trick Netflix uses). Called by the site in app mode only.
        @android.webkit.JavascriptInterface
        public void setSecure(final boolean on) {
            runOnUiThread(new Runnable() { @Override public void run() {
                if (on) {
                    getWindow().addFlags(android.view.WindowManager.LayoutParams.FLAG_SECURE);
                } else {
                    getWindow().clearFlags(android.view.WindowManager.LayoutParams.FLAG_SECURE);
                }
            }});
        }
    };
}

// ---------------- APP FULLSCREEN ----------------
// Orientation lock + hidden system bars. Reached ONLY when the VIDEO goes
// fullscreen (JS bridge with isVideo=true, or the <video> custom-view path).
// The page itself never rotates anymore.
private void enterAppFullscreen() {
    appFullscreen = true;
    videoFs85 = true;
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
    videoFs85 = false;
    setRequestedOrientation(android.content.pm.ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
    android.view.Window w = getWindow();
    w.clearFlags(android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN);
    w.getDecorView().setSystemUiVisibility(android.view.View.SYSTEM_UI_FLAG_VISIBLE);
}

private boolean isAppFullscreen() {
    return appFullscreen;
}

// ---------------- THEMED CONFIRM DIALOG ----------------
private void confirmAndDownload(final String url, final String title, final String quality, final String poster) {
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
        // Resolve the matching local subtitle in the SAME background thread
        // (English first) so it downloads together with the movie.
        final String subUrl = findSubUrlForMovie(title, episodeNumFromTitle(title));
        final long fSize = size;
        runOnUiThread(new Runnable() { @Override public void run() {
            showConfirmDialog(url, title, quality, poster, fSize, subUrl);
        }});
    }}).start();
}

// "Series Name ep3" -> 3. 0 = not an episode.
private int episodeNumFromTitle(String t) {
    if (t == null) return 0;
    java.util.regex.Matcher m = java.util.regex.Pattern.compile("\\bep?\\.?\\s*(\\d{1,2})\\b").matcher(t.toLowerCase());
    if (m.find()) {
        try { return Integer.parseInt(m.group(1)); } catch (Exception e) { return 0; }
    }
    return 0;
}

private void showConfirmDialog(final String url, final String title, final String quality, final String poster, final long sizeBytes, final String subUrl) {
    final float density = getResources().getDisplayMetrics().density;
    android.widget.LinearLayout box = new android.widget.LinearLayout(this);
    box.setOrientation(android.widget.LinearLayout.HORIZONTAL);
    box.setPadding((int)(22 * density), (int)(20 * density), (int)(20 * density), (int)(18 * density));
    android.graphics.drawable.GradientDrawable card = new android.graphics.drawable.GradientDrawable();
    card.setColor(android.graphics.Color.parseColor("#141418"));
    card.setCornerRadius(18 * density);
    card.setStroke(1, android.graphics.Color.parseColor("#2A2A30"));

    // LEFT: poster thumbnail (same art as the movie card on the site)
    android.widget.ImageView pv = new android.widget.ImageView(this);
    android.widget.LinearLayout.LayoutParams pvLp = new android.widget.LinearLayout.LayoutParams((int)(92 * density), (int)(138 * density));
    pvLp.rightMargin = (int)(16 * density);
    pv.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
    pv.setBackgroundDrawable(posterBg85());
    loadPosterInto(pv, poster, (int)(92 * density), (int)(138 * density));

    // RIGHT: title, quality, size, note, buttons
    android.widget.LinearLayout right = new android.widget.LinearLayout(this);
    right.setOrientation(android.widget.LinearLayout.VERTICAL);

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
    right.addView(tTitle);
    right.addView(tMsg, mp);
    right.addView(btnRow, new android.widget.LinearLayout.LayoutParams(
            android.widget.LinearLayout.LayoutParams.MATCH_PARENT, android.widget.LinearLayout.LayoutParams.WRAP_CONTENT));
    box.addView(pv, pvLp);
    box.addView(right, new android.widget.LinearLayout.LayoutParams(
            android.widget.LinearLayout.LayoutParams.MATCH_PARENT, android.widget.LinearLayout.LayoutParams.WRAP_CONTENT, 1f));

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
            enqueueDownload(android.net.Uri.parse(url), title, quality, poster, subUrl);
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

// ---------------- ENQUEUE (PRIVATE STORAGE + RANDOM FILENAMES) ----------------
// Files land in the app PRIVATE dir: Android/data/com.deymflix.eu.cc/files/Movies/Deymflix
// Invisible to gallery and VLC, only DEYMFLIX can read it, removed on uninstall.
// ANTI-COPY: files are stored under random names (dfx_x7k2m9q4.mp4) -- no movie
// titles anywhere in the folder, so extracted files are anonymous and worthless.
private void enqueueDownload(final android.net.Uri uri, final String title, final String quality, final String poster, final String subUrl) {
    try {
        android.app.DownloadManager.Request req = new android.app.DownloadManager.Request(uri);
        // HIDDEN: nothing in the notification shade and no system "Download
        // complete" notification -- tapping that used to open the raw file in
        // another player. Progress lives on the My Downloads screen instead.
        req.setNotificationVisibility(android.app.DownloadManager.Request.VISIBILITY_HIDDEN);
        // Anonymous title too: nothing movie-related ever shows up outside the app
        req.setTitle("DEYMFLIX");
        req.setDescription("Saving for offline viewing");
        String fileName = "dfx_" + randomToken86() + ".mp4";
        java.io.File dir = new java.io.File(getExternalFilesDir(android.os.Environment.DIRECTORY_MOVIES), "Deymflix");
        dir.mkdirs();
        req.setDestinationUri(android.net.Uri.fromFile(new java.io.File(dir, fileName)));
        req.setMimeType("video/mp4");
        final String subName = fileName.replace(".mp4", ".srt");
        android.app.DownloadManager dm = (android.app.DownloadManager) getSystemService(android.content.Context.DOWNLOAD_SERVICE);
        final long newId = dm.enqueue(req);
        saveDlMeta86(newId, title, poster, subName);
        android.widget.Toast.makeText(getApplicationContext(), "Downloading " + title + " -- track it on My Downloads", android.widget.Toast.LENGTH_LONG).show();
        // Subtitle travels WITH the movie (same folder, same random name .srt)
        if (subUrl != null && subUrl.length() > 0) {
            enqueueSubtitleDownload(dm, subUrl, subName, newId);
        }
    } catch (Exception e) {
        android.widget.Toast.makeText(getApplicationContext(), "Download failed: " + e.getMessage(), android.widget.Toast.LENGTH_LONG).show();
    }
}

// Enqueues the matching .srt next to the video so offline playback has
// subtitles. English (Engsub) first, Tagalog (PHsub) as fallback -- the site
// side already resolved the best file and passed the full URL in.
private void enqueueSubtitleDownload(android.app.DownloadManager dm, final String subUrl, final String subName, final long videoId) {
    try {
        android.app.DownloadManager.Request sreq = new android.app.DownloadManager.Request(android.net.Uri.parse(subUrl));
        sreq.setNotificationVisibility(android.app.DownloadManager.Request.VISIBILITY_HIDDEN);
        sreq.setTitle("DEYMFLIX");
        sreq.setDescription("Subtitles for offline viewing");
        java.io.File dir = new java.io.File(getExternalFilesDir(android.os.Environment.DIRECTORY_MOVIES), "Deymflix");
        dir.mkdirs();
        sreq.setDestinationUri(android.net.Uri.fromFile(new java.io.File(dir, subName)));
        sreq.setMimeType("application/x-subrip");
        long sid = dm.enqueue(sreq);
        // Link the subtitle row to its video id so cleanup follows the video
        android.content.SharedPreferences p = getSharedPreferences("deymflix_dl", 0);
        p.edit().putString("subsister_" + String.valueOf(sid), String.valueOf(videoId)).apply();
    } catch (Exception e2) { }
}

// ---------------- LOCAL SUBTITLE MATCHING (mirrors player.html) ----------------
// Normalizes names so "The_Runner  Engsub" matches "the runner engsub".
private String normalizeSubNameForSub(String s) {
    String out = (s == null ? "" : s).toLowerCase();
    out = out.replaceAll("[^A-Za-z0-9 ]", "");
    out = out.replaceAll("[._\\-]+", " ");
    out = out.replaceAll("\\s+", " ").trim();
    return out;
}

// True when the manifest file matches this movie/series title (and, for
// episodes, ONLY that episode). Mirrors fileMatchesMovie in player.html.
private boolean subNameMatchesMovie(String fileName, String title, int episodeNum) {
    String[] parts = String.valueOf(fileName).split("/");
    String dir = "";
    for (int i = 0; i < parts.length - 1; i++) {
        if (i > 0) dir += " ";
        dir += parts[i];
    }
    String base = parts[parts.length - 1];
    String f = normalizeSubNameForSub(base);
    String d = normalizeSubNameForSub(dir);
    if (f.length() == 0) return false;
    String t = normalizeSubNameForSub(title);
    if (t.length() == 0) return false;
    // Other-episode guard: "... ep3" must never match a download of ep2
    if (episodeNum > 0) {
        java.util.regex.Matcher mm = java.util.regex.Pattern.compile("\\b(?:ep?\\.?\\s*)(\\d{1,2})\\b").matcher(f);
        while (mm.find()) {
            int n = 0;
            try { n = Integer.parseInt(mm.group(1)); } catch (Exception eNum) { n = 0; }
            if (n > 0 && n != episodeNum) return false;
        }
    }
    String hay = d.length() > 0 ? d + " " + f : f;
    if (hay.indexOf(t) != -1) return true;
    return t.indexOf(f) != -1;
}

// English (Engsub) first, then Tagalog (PHsub), then unlabeled -- same
// priority the site player uses.
private int localSubLangRank(String fileName) {
    String f = String.valueOf(fileName).toLowerCase();
    if (f.indexOf("engsub") != -1) return 0;
    if (f.endsWith("-en.srt")) return 0;
    if (f.indexOf(".en.") != -1) return 0;
    if (f.indexOf("phsub") != -1) return 1;
    if (f.indexOf("tagalog") != -1) return 1;
    return 2;
}

// Looks up the best local subtitle for this title in the static manifest and
// returns the absolute URL, or "" when nothing matches / anything fails.
private String findSubUrlForMovie(final String title, final int episodeNum) {
    try {
        String manifestUrl = "https://deymflix.eu.cc/subtitles/manifest.json";
        java.net.URL u = new java.net.URL(manifestUrl);
        java.net.HttpURLConnection c = (java.net.HttpURLConnection) u.openConnection();
        c.setConnectTimeout(8000);
        c.setReadTimeout(8000);
        c.setRequestProperty("User-Agent", "DeymflixApp/1.4");
        java.io.BufferedReader br = new java.io.BufferedReader(new java.io.InputStreamReader(c.getInputStream(), "UTF-8"));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = br.readLine()) != null) sb.append(line);
        br.close();
        c.disconnect();
        String json = sb.toString();
        String best = "";
        int bestRank = 99;
        int idx = json.indexOf("\"files\"");
        if (idx < 0) return "";
        int arrStart = json.indexOf('[', idx);
        int arrEnd = json.indexOf(']', arrStart);
        if (arrStart < 0) return "";
        if (arrEnd < 0) return "";
        String arr = json.substring(arrStart + 1, arrEnd);
        // Pull the quoted strings out of the array (no JSON parser needed)
        // Regex-free split on quotes: even indexes are the quoted contents.
        String[] pieces = arr.split("\"");
        for (int pi = 1; pi < pieces.length; pi += 2) {
            String name = pieces[pi];
            if (!subNameMatchesMovie(name, title, episodeNum)) continue;
            int rank = localSubLangRank(name);
            if (rank < bestRank) { bestRank = rank; best = name; }
        }
        if (best.length() == 0) return "";
        return "https://deymflix.eu.cc/subtitles/" + java.net.URLEncoder.encode(best, "UTF-8").replace("%2F", "/");
    } catch (Exception e) {
        return "";
    }
}

// Random 8-char lowercase token for anonymous download filenames
private String randomToken86() {
    String alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
    java.util.Random r = new java.util.Random();
    StringBuilder sb = new StringBuilder();
    for (int i = 0; i < 8; i++) {
        sb.append(alphabet.charAt(r.nextInt(alphabet.length())));
    }
    return sb.toString();
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

// ---------------- POSTER (CONFIRM DIALOG) + DOWNLOAD REGISTRY ----------------

// Decodes a poster URL at thumbnail size off the UI thread, then shows it.
// Any failure (no url, offline, bad image) simply leaves the placeholder bg.
// Tiny memory cache so the 1s list refresh never re-downloads the same art.
private static final java.util.HashMap bitmapCache86 = new java.util.HashMap();

private void loadPosterInto(final android.widget.ImageView target, final String url, final int wPx, final int hPx) {
    if (url == null) return;
    if (url.length() == 0) return;
    Object cached86 = bitmapCache86.get(url);
    if (cached86 != null) {
        target.setImageBitmap((android.graphics.Bitmap) cached86);
        return;
    }
    new Thread(new Runnable() { @Override public void run() {
        try {
            java.net.URL u = new java.net.URL(url);
            java.net.HttpURLConnection c = (java.net.HttpURLConnection) u.openConnection();
            c.setConnectTimeout(8000);
            c.setReadTimeout(8000);
            c.setRequestProperty("User-Agent", "DeymflixApp/1.4");
            java.io.InputStream in = new java.io.BufferedInputStream(c.getInputStream());
            final android.graphics.Bitmap bmp = android.graphics.BitmapFactory.decodeStream(in);
            in.close();
            c.disconnect();
            if (bmp == null) return;
            final android.graphics.Bitmap scaled = android.graphics.Bitmap.createScaledBitmap(bmp, wPx, hPx, true);
            bitmapCache86.put(url, scaled);
            runOnUiThread(new Runnable() { @Override public void run() {
                try { target.setImageBitmap(scaled); } catch (Exception e) { }
            }});
        } catch (Exception e) { /* keep placeholder */ }
    }}).start();
}

private android.graphics.drawable.GradientDrawable posterBg85() {
    android.graphics.drawable.GradientDrawable g = new android.graphics.drawable.GradientDrawable();
    g.setColor(android.graphics.Color.parseColor("#1E1E24"));
    g.setCornerRadius(8f * getResources().getDisplayMetrics().density);
    return g;
}

// Drop registry rows whose download finished more than 7 days ago (file deleted
// long ago by the user) so the map never grows forever.
private void purgeOldDlMeta86() {
    try {
        android.app.DownloadManager dm = (android.app.DownloadManager) getSystemService(android.content.Context.DOWNLOAD_SERVICE);
        android.content.SharedPreferences p = getSharedPreferences("deymflix_dl", 0);
        android.database.Cursor c = dm.query(new android.app.DownloadManager.Query().setFilterByStatus(android.app.DownloadManager.STATUS_SUCCESSFUL));
        java.util.HashSet live = new java.util.HashSet();
        if (c != null) {
            while (c.moveToNext()) {
                long id = c.getLong(c.getColumnIndexOrThrow(android.app.DownloadManager.COLUMN_ID));
                long when = c.getLong(c.getColumnIndexOrThrow(android.app.DownloadManager.COLUMN_LAST_MODIFIED_TIMESTAMP)) * 1000L;
                if (System.currentTimeMillis() - when < 604800000L) live.add(String.valueOf(id));
            }
            c.close();
        }
        android.content.SharedPreferences.Editor ed = p.edit();
        boolean changed = false;
        for (java.util.Map.Entry e : p.getAll().entrySet()) {
            String k = String.valueOf(e.getKey());
            if (k.startsWith("subsister_")) continue;
            if (!live.contains(k)) { ed.remove(k); changed = true; }
        }
        // Drop subtitle-link rows whose VIDEO row is gone
        for (java.util.Map.Entry e : p.getAll().entrySet()) {
            String k = String.valueOf(e.getKey());
            if (!k.startsWith("subsister_")) continue;
            String vid = String.valueOf(e.getValue());
            if (!live.contains(vid)) { ed.remove(k); changed = true; }
        }
        if (changed) ed.apply();
    } catch (Exception e2) { }
}

// id -> "title[POSTER-URL]" kept in app-private prefs so My Downloads can show
// the poster thumbnail next to each download. Cleared when the row is deleted.
private void saveDlMeta86(long id, String title, String poster, String subName) {
    android.content.SharedPreferences p = getSharedPreferences("deymflix_dl", 0);
    String cleanTitle = (title == null ? "Video" : title).split("\n")[0];
    p.edit().putString(String.valueOf(id), cleanTitle + "[POSTER]" + (poster == null ? "" : poster) + "[SUB]" + (subName == null ? "" : subName)).apply();
}

private String[] readDlMeta86(long id) {
    android.content.SharedPreferences p = getSharedPreferences("deymflix_dl", 0);
    String raw = p.getString(String.valueOf(id), "");
    if (raw == null) return new String[] { "", "", "" };
    if (raw.length() == 0) return new String[] { "", "", "" };
    String title = raw;
    String poster = "";
    String subName = "";
    int cutSub = raw.indexOf("[SUB]");
    if (cutSub >= 0) {
        subName = raw.substring(cutSub + 5);
        raw = raw.substring(0, cutSub);
    }
    int cutPoster = raw.indexOf("[POSTER]");
    if (cutPoster >= 0) {
        poster = raw.substring(cutPoster + 8);
        title = raw.substring(0, cutPoster);
    }
    return new String[] { title, poster, subName };
}

// True when the subtitle file of this download exists on disk (finished)
private boolean subFileReady86(String subName) {
    if (subName == null) return false;
    if (subName.length() == 0) return false;
    java.io.File dir = new java.io.File(getExternalFilesDir(android.os.Environment.DIRECTORY_MOVIES), "Deymflix");
    java.io.File f = new java.io.File(dir, subName);
    return f.exists() && f.length() > 0;
}

private void deleteDlMeta86(long id) {
    android.content.SharedPreferences p = getSharedPreferences("deymflix_dl", 0);
    p.edit().remove(String.valueOf(id)).apply();
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
// SECTION 4A of 5 -- paste in DownloadsActivity -> onCreate tab (FULL CLEAR first)
// downloads.xml stays EMPTY -- the screen is built here.
// PASTE ORDER: 4A, then 4B, 4C, 4D, 4E directly below each other,
// in the SAME tab. Each part is small so no clipboard can truncate it.
// COPY FROM: the files SECTION-4A-paste.txt ... SECTION-4E-paste.txt
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

// Storage bar: "Internal storage  [remaining] free" -- same as the reference screen
final android.widget.TextView storage85 = new android.widget.TextView(this);
storage85.setTextSize(13);
storage85.setPadding(0, (int)(10*d85), 0, (int)(2*d85));
root85.addView(storage85);

// TABS: Downloading / Downloaded (Netflix style -- red underline on the active one)
final android.widget.LinearLayout tabs85 = new android.widget.LinearLayout(this);
tabs85.setOrientation(android.widget.LinearLayout.HORIZONTAL);
android.widget.LinearLayout.LayoutParams tlp85 = new android.widget.LinearLayout.LayoutParams(-1, -2);
tlp85.topMargin = (int)(12*d85);
root85.addView(tabs85, tlp85);

final android.widget.LinearLayout tabDl85 = new android.widget.LinearLayout(this);
tabDl85.setOrientation(android.widget.LinearLayout.VERTICAL);
final android.widget.TextView tabDlTxt85 = new android.widget.TextView(this);
tabDlTxt85.setText("Downloading");
tabDlTxt85.setTextSize(15);
tabDlTxt85.setGravity(android.view.Gravity.CENTER);
tabDlTxt85.setPadding(0, (int)(6*d85), 0, 0);
tabDl85.addView(tabDlTxt85, new android.widget.LinearLayout.LayoutParams(-1, -2));
final android.view.View tabDlLine85 = new android.view.View(this);
android.widget.LinearLayout.LayoutParams dlp85 = new android.widget.LinearLayout.LayoutParams(-1, (int)(3*d85));
dlp85.topMargin = (int)(8*d85);
tabDl85.addView(tabDlLine85, dlp85);
tabs85.addView(tabDl85, new android.widget.LinearLayout.LayoutParams(0, -2, 1f));

final android.widget.LinearLayout tabDone85 = new android.widget.LinearLayout(this);
tabDone85.setOrientation(android.widget.LinearLayout.VERTICAL);
final android.widget.TextView tabDoneTxt85 = new android.widget.TextView(this);
tabDoneTxt85.setText("Downloaded");
tabDoneTxt85.setTextSize(15);
tabDoneTxt85.setGravity(android.view.Gravity.CENTER);
tabDoneTxt85.setPadding(0, (int)(6*d85), 0, 0);
tabDone85.addView(tabDoneTxt85, new android.widget.LinearLayout.LayoutParams(-1, -2));
final android.view.View tabDoneLine85 = new android.view.View(this);
android.widget.LinearLayout.LayoutParams finp85 = new android.widget.LinearLayout.LayoutParams(-1, (int)(3*d85));
finp85.topMargin = (int)(8*d85);
tabDone85.addView(tabDoneLine85, finp85);
tabs85.addView(tabDone85, new android.widget.LinearLayout.LayoutParams(0, -2, 1f));

tabDl85.setOnClickListener(new android.view.View.OnClickListener() {
    @Override public void onClick(android.view.View v) {
        activeTab85 = 0;
        styleDlTabs85(tabDlTxt85, tabDlLine85, tabDoneTxt85, tabDoneLine85);
        renderDownloadsList85(list85, empty85, dm85);
    }
});
tabDone85.setOnClickListener(new android.view.View.OnClickListener() {
    @Override public void onClick(android.view.View v) {
        activeTab85 = 1;
        styleDlTabs85(tabDlTxt85, tabDlLine85, tabDoneTxt85, tabDoneLine85);
        renderDownloadsList85(list85, empty85, dm85);
    }
});
styleDlTabs85(tabDlTxt85, tabDlLine85, tabDoneTxt85, tabDoneLine85);

final android.widget.LinearLayout list85 = new android.widget.LinearLayout(this);
list85.setOrientation(android.widget.LinearLayout.VERTICAL);
android.widget.LinearLayout.LayoutParams lp85 = new android.widget.LinearLayout.LayoutParams(-1, -2);
lp85.topMargin = (int)(14*d85);
root85.addView(list85, lp85);

final android.widget.TextView empty85 = new android.widget.TextView(this);
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
        refreshStorage85(storage85);
        renderDownloadsList85(list85, empty85, dm85);
        h85.postDelayed(this, 1000);
    }
};
h85.post(r85);
}
private boolean paste4Acomplete = true;
// ========== END OF SECTION 4A -- last line after pasting 4A. Now paste 4B below. ==========
// NOTE: if "private boolean paste4Acomplete" is missing from your tab after
// pasting 4A, the paste was truncated -- the } above it was lost too. Re-copy 4A.
// ---------------------------------------------------------------------------
// SECTION 4B of 5 -- paste SECOND, directly below 4A in the SAME tab.
// Contains storage info + the list loop. After pasting, the last line of the
// tab must be the 4B END marker.
// ---------------------------------------------------------------------------
// Updates the "Internal storage ... remaining" line (reference-screen style)
private void refreshStorage85(final android.widget.TextView tv) {
    try {
        java.io.File dir = android.os.Environment.getExternalStorageDirectory();
        android.os.StatFs st = new android.os.StatFs(dir.getPath());
        long freeBytes = st.getAvailableBlocksLong() * st.getBlockSizeLong();
        tv.setText("Internal storage  " + humanSize85(freeBytes) + " remaining");
        tv.setTextColor(android.graphics.Color.parseColor("#9A9A9A"));
    } catch (Exception e) {
        tv.setText("");
    }
}

// 0 = Downloading tab, 1 = Downloaded tab (tapped in SECTION 4A)
private int activeTab85 = 0;

// Active tab: white bold text + red underline. Inactive: gray, no underline.
private void styleDlTabs85(final android.widget.TextView t1, final android.view.View l1, final android.widget.TextView t2, final android.view.View l2) {
    int on = android.graphics.Color.WHITE;
    int off = android.graphics.Color.parseColor("#8A8A8A");
    int red = android.graphics.Color.parseColor("#E50914");
    if (activeTab85 == 0) {
        t1.setTextColor(on); t1.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        l1.setBackgroundColor(red);
        t2.setTextColor(off); t2.setTypeface(android.graphics.Typeface.DEFAULT);
        l2.setBackgroundColor(android.graphics.Color.TRANSPARENT);
    } else {
        t2.setTextColor(on); t2.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        l2.setBackgroundColor(red);
        t1.setTextColor(off); t1.setTypeface(android.graphics.Typeface.DEFAULT);
        l1.setBackgroundColor(android.graphics.Color.TRANSPARENT);
    }
}

// Rebuilds the active tab's list every second. One card per download.
private void renderDownloadsList85(final android.widget.LinearLayout list, final android.widget.TextView empty, final android.app.DownloadManager dm) {
    list.removeAllViews();
    // (poster bitmaps stay cached in bitmapCache86 -- no re-downloads on refresh)
    float d = getResources().getDisplayMetrics().density;
    android.database.Cursor c = dm.query(new android.app.DownloadManager.Query());
    int shown = 0;
    if (c != null) {
        while (c.moveToNext() && shown < 40) {
            final long id = c.getLong(c.getColumnIndexOrThrow(android.app.DownloadManager.COLUMN_ID));
            final int status = c.getInt(c.getColumnIndexOrThrow(android.app.DownloadManager.COLUMN_STATUS));
            final boolean finished = (status == android.app.DownloadManager.STATUS_SUCCESSFUL);
            final boolean failed = (status == android.app.DownloadManager.STATUS_FAILED);
            // TAB SPLIT: active work (running/pending/paused) under Downloading,
            // finished under Downloaded. Failed keeps its Retry on Downloading.
            if (activeTab85 == 0 && finished) continue;
            if (activeTab85 == 1 && !finished) continue;
            shown++;
            final long done = c.getLong(c.getColumnIndexOrThrow(android.app.DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR));
            final long total = c.getLong(c.getColumnIndexOrThrow(android.app.DownloadManager.COLUMN_TOTAL_SIZE_BYTES));
            String[] meta = readDlMeta86(id);
            String title = (meta[0] == null) ? "" : meta[0];
            if (title.length() == 0) title = "Download";
            final String poster = meta[1] == null ? "" : meta[1];
            final String subName = meta[2] == null ? "" : meta[2];
            buildDownloadCard85(list, empty, dm, id, title, poster, subName, status, done, total, d);
        }
        c.close();
    }
    boolean any = shown > 0;
    if (activeTab85 == 0) {
        empty.setText("No downloads in progress.\nStart one from any movie page.");
    } else {
        empty.setText("Nothing downloaded yet.\nOpen any movie and tap the download button.");
    }
    empty.setVisibility(any ? android.view.View.GONE : android.view.View.VISIBLE);
}
// ========== END OF SECTION 4B -- last line after pasting 4B. Now paste 4C below. ==========


// ---------------------------------------------------------------------------
// SECTION 4C of 5 -- paste THIRD, directly below 4B in the SAME tab.
// Builds one download card: poster thumbnail, title, status, thin progress
// bar, action row. After pasting, the last line of the tab must be the 4C END
// marker.
// ---------------------------------------------------------------------------
private void buildDownloadCard85(final android.widget.LinearLayout list, final android.widget.TextView empty, final android.app.DownloadManager dm, final long id, final String title, final String poster, final String subName, final int status, final long done, final long total, final float d) {
    // CARD: horizontal -- left poster thumbnail, right text column
    android.widget.LinearLayout card = new android.widget.LinearLayout(this);
    card.setOrientation(android.widget.LinearLayout.HORIZONTAL);
    card.setGravity(android.view.Gravity.CENTER_VERTICAL);
    android.widget.LinearLayout.LayoutParams cp = new android.widget.LinearLayout.LayoutParams(-1, -2);
    cp.topMargin = (int)(12*d);
    list.addView(card, cp);

    // LEFT: poster art (dark placeholder until/unless the image loads)
    android.widget.ImageView thumb = new android.widget.ImageView(this);
    android.widget.LinearLayout.LayoutParams tp = new android.widget.LinearLayout.LayoutParams((int)(104*d), (int)(150*d));
    tp.rightMargin = (int)(16*d);
    thumb.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
    thumb.setBackgroundDrawable(posterBg85());
    loadPosterInto(thumb, poster, (int)(104*d), (int)(150*d));
    card.addView(thumb, tp);

    // RIGHT: title, status + size line, thin bar, action row
    android.widget.LinearLayout right = new android.widget.LinearLayout(this);
    right.setOrientation(android.widget.LinearLayout.VERTICAL);
    card.addView(right, new android.widget.LinearLayout.LayoutParams(-1, -2, 1f));

    android.widget.TextView t = new android.widget.TextView(this);
    t.setText(title);
    t.setTextColor(android.graphics.Color.WHITE);
    t.setTextSize(16);
    t.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
    t.setSingleLine(true);
    t.setEllipsize(android.text.TextUtils.TruncateAt.END);
    right.addView(t);

    android.widget.TextView sub = new android.widget.TextView(this);
    sub.setTextSize(14);
    android.widget.LinearLayout.LayoutParams sp = new android.widget.LinearLayout.LayoutParams(-1, -2);
    sp.topMargin = (int)(8*d);
    boolean showBar = false;
    int barPct = 0;
    if (status == android.app.DownloadManager.STATUS_SUCCESSFUL) {
        sub.setText("Downloaded");
        sub.setTextColor(android.graphics.Color.parseColor("#EDEDED"));
    } else if (status == android.app.DownloadManager.STATUS_FAILED) {
        sub.setText("Failed");
        sub.setTextColor(android.graphics.Color.parseColor("#E57373"));
    } else if (status == android.app.DownloadManager.STATUS_PAUSED) {
        sub.setText("Paused");
        sub.setTextColor(android.graphics.Color.parseColor("#9A9A9A"));
        showBar = total > 0;
        barPct = (int)(done * 100 / total);
    } else if (status == android.app.DownloadManager.STATUS_PENDING) {
        sub.setText("Waiting...");
        sub.setTextColor(android.graphics.Color.parseColor("#9A9A9A"));
    } else if (total > 0) {
        barPct = (int)(done * 100 / total);
        sub.setText(humanSize85(done) + " / " + humanSize85(total));
        sub.setTextColor(android.graphics.Color.parseColor("#9A9A9A"));
        showBar = true;
    } else {
        sub.setText("Starting...");
        sub.setTextColor(android.graphics.Color.parseColor("#9A9A9A"));
    }
    right.addView(sub, sp);

    // THIN progress bar under the status line (like the reference screen)
    if (showBar) {
        android.widget.ProgressBar bar = new android.widget.ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        bar.setMax(100);
        bar.setProgress(barPct);
        bar.getProgressDrawable().setColorFilter(android.graphics.Color.parseColor("#E50914"), android.graphics.PorterDuff.Mode.SRC_IN);
        android.widget.LinearLayout.LayoutParams bp2 = new android.widget.LinearLayout.LayoutParams(-1, (int)(3*d));
        bp2.topMargin = (int)(8*d);
        right.addView(bar, bp2);
    }

    // ACTION row: Play on finished, Cancel while active, Resume when paused,
    // Retry after failure, Delete always -- pushed to the right edge
    android.widget.LinearLayout actRow = new android.widget.LinearLayout(this);
    actRow.setOrientation(android.widget.LinearLayout.HORIZONTAL);
    actRow.setGravity(android.view.Gravity.RIGHT + android.view.Gravity.CENTER_VERTICAL);
    android.widget.LinearLayout.LayoutParams arp = new android.widget.LinearLayout.LayoutParams(-1, -2);
    arp.topMargin = (int)(10*d);
    right.addView(actRow, arp);
    appendCardActions85(actRow, list, empty, dm, id, title, subName, status, d);
}
// ========== END OF SECTION 4C -- last line after pasting 4C. Now paste 4D below. ==========


// ---------------------------------------------------------------------------
// SECTION 4D of 5 -- paste FOURTH, directly below 4C in the SAME tab.
// The card action buttons. After pasting, the last line of the tab must be
// the 4D END marker.
// ---------------------------------------------------------------------------
private void appendCardActions85(final android.widget.LinearLayout actRow, final android.widget.LinearLayout list, final android.widget.TextView empty, final android.app.DownloadManager dm, final long id, final String title, final String subName, final int status, final float d) {
    android.widget.LinearLayout.LayoutParams abp = new android.widget.LinearLayout.LayoutParams(-2, -2);
    abp.leftMargin = (int)(18*d);

    if (status == android.app.DownloadManager.STATUS_SUCCESSFUL) {
        android.widget.Button play = new android.widget.Button(this);
        play.setText("Play");
        play.setAllCaps(false);
        play.setTextColor(android.graphics.Color.WHITE);
        play.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        play.setBackgroundDrawable(playBg85());
        play.setPadding((int)(22*d), 0, (int)(22*d), 0);
        play.setOnClickListener(new android.view.View.OnClickListener() {
            @Override public void onClick(android.view.View v) { playDownload85(id, title, subName); }
        });
        actRow.addView(play, abp);
    } else if (status == android.app.DownloadManager.STATUS_FAILED) {
        android.widget.Button retry = new android.widget.Button(this);
        retry.setText("Retry");
        retry.setAllCaps(false);
        retry.setTextColor(android.graphics.Color.WHITE);
        retry.setBackgroundDrawable(playBg85());
        retry.setPadding((int)(18*d), 0, (int)(18*d), 0);
        retry.setOnClickListener(new android.view.View.OnClickListener() {
            @Override public void onClick(android.view.View v) {
                dm.remove(id);
                deleteDlMeta86(id);
                android.widget.Toast.makeText(getApplicationContext(), "Open the movie again and tap download", android.widget.Toast.LENGTH_SHORT).show();
                renderDownloadsList85(list, empty, dm);
            }
        });
        actRow.addView(retry, abp);
    } else if (status == android.app.DownloadManager.STATUS_PAUSED) {
        android.widget.Button resume = new android.widget.Button(this);
        resume.setText("Resume");
        resume.setAllCaps(false);
        resume.setTextColor(android.graphics.Color.parseColor("#DDDDDD"));
        resume.setBackgroundColor(android.graphics.Color.TRANSPARENT);
        resume.setOnClickListener(new android.view.View.OnClickListener() {
            @Override public void onClick(android.view.View v) {
                dm.resume(id);
                renderDownloadsList85(list, empty, dm);
            }
        });
        actRow.addView(resume, abp);
    } else if (status == android.app.DownloadManager.STATUS_RUNNING) {
        appendCancel85(actRow, list, empty, dm, id);
    } else if (status == android.app.DownloadManager.STATUS_PENDING) {
        appendCancel85(actRow, list, empty, dm, id);
        android.widget.Button cancel = new android.widget.Button(this);
        cancel.setText("Cancel");
        cancel.setAllCaps(false);
        cancel.setTextColor(android.graphics.Color.parseColor("#DDDDDD"));
        cancel.setBackgroundColor(android.graphics.Color.TRANSPARENT);
        cancel.setOnClickListener(new android.view.View.OnClickListener() {
            @Override public void onClick(android.view.View v) {
                dm.remove(id);
                deleteDlMeta86(id);
                android.widget.Toast.makeText(getApplicationContext(), "Cancelled", android.widget.Toast.LENGTH_SHORT).show();
                renderDownloadsList85(list, empty, dm);
            }
        });
        actRow.addView(cancel, abp);
    }

    android.widget.Button del = new android.widget.Button(this);
    del.setText("Delete");
    del.setAllCaps(false);
    del.setTextColor(android.graphics.Color.parseColor("#E57373"));
    del.setBackgroundColor(android.graphics.Color.TRANSPARENT);
    del.setOnClickListener(new android.view.View.OnClickListener() {
        @Override public void onClick(android.view.View v) {
            if (status == android.app.DownloadManager.STATUS_SUCCESSFUL) {
                try {
                    String local = dm.getUriForDownloadedFile(id).toString();
                    new java.io.File(android.net.Uri.parse(local).getPath()).delete();
                } catch (Exception e) { }
                // Remove the subtitle that traveled with the movie
                if (subName != null && subName.length() > 0) {
                    try {
                        java.io.File sdir = new java.io.File(getExternalFilesDir(android.os.Environment.DIRECTORY_MOVIES), "Deymflix");
                        new java.io.File(sdir, subName).delete();
                    } catch (Exception e2) { }
                }
            }
            dm.remove(id);
            deleteDlMeta86(id);
            if (status == android.app.DownloadManager.STATUS_SUCCESSFUL) {
                android.widget.Toast.makeText(getApplicationContext(), "Deleted", android.widget.Toast.LENGTH_SHORT).show();
            }
            renderDownloadsList85(list, empty, dm);
        }
    });
    actRow.addView(del, abp);
}
// Cancel button shared by Running and Pending states (kept separate so this
// file contains zero pipe characters -- chat apps eat them)
private void appendCancel85(final android.widget.LinearLayout actRow, final android.widget.LinearLayout list, final android.widget.TextView empty, final android.app.DownloadManager dm, final long id) {
    android.widget.Button cancel = new android.widget.Button(this);
    cancel.setText("Cancel");
    cancel.setAllCaps(false);
    cancel.setTextColor(android.graphics.Color.parseColor("#DDDDDD"));
    cancel.setBackgroundColor(android.graphics.Color.TRANSPARENT);
    cancel.setOnClickListener(new android.view.View.OnClickListener() {
        @Override public void onClick(android.view.View v) {
            dm.remove(id);
            deleteDlMeta86(id);
            android.widget.Toast.makeText(getApplicationContext(), "Cancelled", android.widget.Toast.LENGTH_SHORT).show();
            renderDownloadsList85(list, empty, dm);
        }
    });
    android.widget.LinearLayout.LayoutParams abp = new android.widget.LinearLayout.LayoutParams(-2, -2);
    abp.leftMargin = (int)(18 * getResources().getDisplayMetrics().density);
    actRow.addView(cancel, abp);
}
// ========== END OF SECTION 4D -- last line after pasting 4D. Now paste 4E below. ==========


// ---------------------------------------------------------------------------
// SECTION 4E of 5 -- paste LAST, directly below 4D in the SAME tab.
// Play launcher + shared helpers. After pasting, the last line of the tab
// must be the 4E END marker.
// ---------------------------------------------------------------------------
// Play a finished download INSIDE the app (LocalPlayerActivity -- no VLC, no
// gallery). Auto-fullscreen landscape: the activity itself is landscape-locked
// so playback starts fullscreen WITHOUT data (the file is already on disk).
private void playDownload85(final long id, final String title, final String subName) {
    try {
        android.app.DownloadManager dm = (android.app.DownloadManager) getSystemService(android.content.Context.DOWNLOAD_SERVICE);
        android.database.Cursor c = dm.query(new android.app.DownloadManager.Query().setFilterById(id));
        String path = "";
        String reason = "";
        if (c != null && c.moveToFirst()) {
            int st = c.getInt(c.getColumnIndexOrThrow(android.app.DownloadManager.COLUMN_STATUS));
            reason = c.getString(c.getColumnIndexOrThrow(android.app.DownloadManager.COLUMN_REASON));
            if (st == android.app.DownloadManager.STATUS_SUCCESSFUL) {
                android.net.Uri u = dm.getUriForDownloadedFile(id);
                if (u != null) path = u.getPath();
            }
        }
        if (c != null) c.close();
        if (path == null) path = "";
        if (path.length() == 0) {
            String msg = "File is gone -- delete and download again.";
            if (reason != null && reason.length() > 0) msg = "Cannot play (code " + reason + "). Try downloading again.";
            android.widget.Toast.makeText(getApplicationContext(), msg, android.widget.Toast.LENGTH_LONG).show();
            return;
        }
        android.content.Intent it = new android.content.Intent(this, LocalPlayerActivity.class);
        it.putExtra("path", path);
        it.putExtra("title", title);
        if (subName != null && subName.length() > 0) it.putExtra("sub", subName);
        startActivity(it);
    } catch (Exception e) {
        android.widget.Toast.makeText(getApplicationContext(), "Cannot open this download", android.widget.Toast.LENGTH_SHORT).show();
    }
}

private android.graphics.drawable.GradientDrawable playBg85() {
    android.graphics.drawable.GradientDrawable g = new android.graphics.drawable.GradientDrawable();
    g.setColor(android.graphics.Color.parseColor("#E50914"));
    g.setCornerRadius(10f * getResources().getDisplayMetrics().density);
    return g;
}

private String humanSize85(long bytes) {
    if (bytes <= 0) return "-";
    double b = bytes;
    String[] units = { "B", "KB", "MB", "GB" };
    int i = 0;
    while (b >= 1024 && i < units.length - 1) { b /= 1024; i++; }
    return String.format(java.util.Locale.US, "%.1f %s", b, units[i]);
}
// ========== END OF SECTION 4E -- last line of the DownloadsActivity onCreate tab ==========




// SECTION 6 -- paste in LocalPlayerActivity -> onCreate tab (FULL CLEAR first)
// BEFORE PASTING: Sketchware -> Activity manager -> add a new EMPTY activity
// named EXACTLY:  LocalPlayerActivity   (layout can be empty -- code builds it)
// Then: LocalPlayerActivity -> Logic -> (vdots) -> Java/Kotlin Injection -> onCreate
//
// WHAT IT IS: a native video player for your downloaded movies. Playback stays
// inside DEYMFLIX (no VLC, no gallery, no other app can open these files).
// Uses the branded local-player.html asset (red/black theme, back button).
final String path86 = getIntent().getStringExtra("path");
final String title86 = getIntent().getStringExtra("title");
final String sub86 = getIntent().getStringExtra("sub");
if (path86 == null) { finish(); }
// NETFLIX BEHAVIOR: the player starts (and stays) landscape -- video fullscreen
// immediately, and rotation is locked so the movie never shrinks to a letterbox
// when the phone tilts.
setRequestedOrientation(android.content.pm.ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
final android.webkit.WebView pv = new android.webkit.WebView(this);
// ANTI-RECORDING: screenshots and screen recordings come out black while the
// downloaded movie plays (same protection Netflix uses). Per-activity flag: the
// MainActivity no longer keeps a global secure flag, so the site stays normal.
getWindow().addFlags(android.view.WindowManager.LayoutParams.FLAG_SECURE);
pv.getSettings().setJavaScriptEnabled(true);
pv.getSettings().setMediaPlaybackRequiresUserGesture(false);
pv.getSettings().setAllowFileAccess(true);
pv.getSettings().setDomStorageEnabled(true);
pv.setBackgroundColor(android.graphics.Color.BLACK);

final android.widget.FrameLayout proot = new android.widget.FrameLayout(this);
proot.setBackgroundColor(android.graphics.Color.BLACK);
proot.addView(pv, new android.widget.FrameLayout.LayoutParams(
        android.widget.FrameLayout.LayoutParams.MATCH_PARENT,
        android.widget.FrameLayout.LayoutParams.MATCH_PARENT));
setContentView(proot);

// Immersive bars immediately -- no status/nav bars over the movie
proot.setSystemUiVisibility(
        android.view.View.SYSTEM_UI_FLAG_FULLSCREEN
        + android.view.View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
        + android.view.View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        + android.view.View.SYSTEM_UI_FLAG_LAYOUT_STABLE);

// Fullscreen video support -- WebView stays attached underneath, state preserved
pv.setWebChromeClient(new android.webkit.WebChromeClient() {
    private android.view.View cv86;
    @Override
    public void onShowCustomView(android.view.View view, android.webkit.WebChromeClient.CustomViewCallback callback) {
        if (cv86 != null) { callback.onCustomViewHidden(); return; }
        cv86 = view;
        proot.addView(view, new android.widget.FrameLayout.LayoutParams(
                android.widget.FrameLayout.LayoutParams.MATCH_PARENT,
                android.widget.FrameLayout.LayoutParams.MATCH_PARENT));
        proot.setSystemUiVisibility(
                android.view.View.SYSTEM_UI_FLAG_FULLSCREEN
                + android.view.View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                + android.view.View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
    }
    @Override
    public void onHideCustomView() {
        if (cv86 == null) return;
        proot.removeView(cv86);
        cv86 = null;
        proot.setSystemUiVisibility(android.view.View.SYSTEM_UI_FLAG_VISIBLE);
    }
});

// Bridge the HTML back button uses to close the player
pv.addJavascriptInterface(new Object() {
    @android.webkit.JavascriptInterface
    public void exitPlayer() {
        runOnUiThread(new Runnable() { @Override public void run() { finish(); } });
    }
}, "DeymflixLocal");

String url86 = "file:///android_asset/local-player.html?f="
        + java.net.URLEncoder.encode(path86, "UTF-8");
if (title86 != null) {
    url86 = url86 + "&t=" + java.net.URLEncoder.encode(title86, "UTF-8");
}
// The subtitle file that traveled with the movie (same folder, same random name)
if (sub86 != null && sub86.length() > 0) {
    url86 = url86 + "&s=" + java.net.URLEncoder.encode(sub86, "UTF-8");
}
pv.loadUrl(url86);
// ============ END OF SECTION 6 -- last line of the LocalPlayerActivity onCreate tab ============
