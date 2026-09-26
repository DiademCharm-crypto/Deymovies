// ===========================================================================
//  DEYMFLIX -- MainScreen85.java      (library class, v1.4i)
// ===========================================================================
//  WHAT THIS IS
//    Everything MainActivity used to carry as a giant paste: WebView boot,
//    splash, JS bridge, download flow, fullscreen handling, subtitles registry.
//    It ships inside deymflix-screens-1.0 (a Sketchware local library), so it
//    can never be mangled by a paste and never gets wiped by a build.
//
//  MainActivity keeps only three one-line tabs:
//      onCreate      MainScreen85.install(this);
//      onBackPressed MainScreen85.back(this);
//      onResume      MainScreen85.resume(this);
//
//  100% ASCII, zero pipe characters.
// ===========================================================================
package com.deymflix.eu.cc;

import android.app.Activity;
import android.app.Dialog;
import android.app.DownloadManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.Path;
import android.graphics.drawable.GradientDrawable;
import android.os.Environment;
import android.view.Gravity;
import android.view.View;
import android.webkit.WebView;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Locale;

public class MainScreen85 {

    // One instance per live MainActivity (weak-ish: finished activities are
    // purged on every install/resume, so nothing leaks).
    private static final HashMap<Activity, MainScreen85> INSTANCES =
            new HashMap<Activity, MainScreen85>();

    private static void purgeDeadInstances() {
        java.util.ArrayList<Activity> dead = new java.util.ArrayList<Activity>();
        for (Activity a : INSTANCES.keySet()) {
            // No pipe characters anywhere in this file, so the "either" test is
            // written as two ifs instead of one condition.
            if (a.isFinishing()) {
                dead.add(a);
            } else if (android.os.Build.VERSION.SDK_INT >= 17 && a.isDestroyed()) {
                dead.add(a);
            }
        }
        for (Activity a : dead) INSTANCES.remove(a);
    }

    public static MainScreen85 instanceOf(Activity act) {
        MainScreen85 m = INSTANCES.get(act);
        return m;
    }

    // =======================================================================
    //  ENTRY POINTS (the three one-line tabs)
    // =======================================================================
    public static void install(final Activity act) {
        if (act == null) return;
        purgeDeadInstances();
        MainScreen85 m = new MainScreen85(act);
        INSTANCES.put(act, m);
        m.boot();
        // force-update: block the app when the site manifest is newer
        DlUpdate85.checkAndEnforce(act);
    }

    public static void back(final Activity act) {
        MainScreen85 m = act == null ? null : INSTANCES.get(act);
        if (m != null) {
            m.handleBack();
            return;
        }
        // No instance (should not happen): degrade gracefully.
        if (act == null) return;
        WebView wv = findWebView(act);
        if (wv != null && wv.canGoBack()) wv.goBack(); else act.finish();
    }

    public static void resume(final Activity act) {
        if (act == null) return;
        purgeDeadInstances();
        MainScreen85 m = INSTANCES.get(act);
        if (m != null) m.handleResume();
        // force-update: re-check on every resume so dismissing the install
        // prompt or closing the dialog keeps the block alive
        DlUpdate85.checkAndEnforce(act);
    }

    // =======================================================================
    //  Per-activity state (was: class-level fields inside MainActivity)
    // =======================================================================
    private final Activity act;
    private View mActivityRoot;
    private boolean appFullscreen = false;
    private boolean videoFs85 = false;

    // splash state
    private LinearLayout splashLayout;
    private LinearLayout splashContent;   // logo group -- animated on exit
    private java.util.Timer splashTimeoutTimer;
    private androidx.swiperefreshlayout.widget.SwipeRefreshLayout swipeRef;
    private View hexagonView;
    private android.animation.ValueAnimator splashAnimator;

    private MainScreen85(Activity a) {
        this.act = a;
    }

    // Splash shows for AT LEAST 2 seconds, even if the site loads instantly.
    private static final long SPLASH_MIN_MS = 2000L;
    private long splashShownAt = 0L;

    // =======================================================================
    //  BOOT (was: the whole onCreate paste)
    // =======================================================================
    private void boot() {
        final WebView wv = findWebView(act);
        if (wv == null) {
            Toast.makeText(act.getApplicationContext(),
                    "Main layout is missing its WebView", Toast.LENGTH_SHORT).show();
            act.finish();
            return;
        }
        // SwipeRefresh found by STRUCTURE (wraps the WebView) -- id-name proof
        final androidx.swiperefreshlayout.widget.SwipeRefreshLayout swipe =
                (wv.getParent() instanceof androidx.swiperefreshlayout.widget.SwipeRefreshLayout)
                        ? (androidx.swiperefreshlayout.widget.SwipeRefreshLayout) wv.getParent()
                        : null;
        swipeRef = swipe;

        // -- 1) WebView settings --
        wv.getSettings().setJavaScriptEnabled(true);
        wv.getSettings().setDomStorageEnabled(true);
        wv.getSettings().setDatabaseEnabled(true);
        wv.getSettings().setMediaPlaybackRequiresUserGesture(false);
        wv.getSettings().setLoadWithOverviewMode(true);
        wv.getSettings().setUseWideViewPort(true);
        wv.getSettings().setSupportZoom(false);
        wv.getSettings().setMixedContentMode(android.webkit.WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        // ANTI-POPUNDER: window.open() in the page does nothing (no multi-window
        // support = onCreateWindow never fires), so provider ad scripts cannot
        // spring new "windows"/tabs. Combined with the navigation guard below,
        // the only thing that can ever navigate the app is our own site.
        wv.getSettings().setSupportMultipleWindows(false);
        wv.getSettings().setJavaScriptCanOpenWindowsAutomatically(false);

        // -- 2) APP-MODE: mark the WebView so the site enables app-only features --
        String baseUa = wv.getSettings().getUserAgentString();
        if (baseUa != null && !baseUa.contains("DeymflixApp")) {
            wv.getSettings().setUserAgentString(baseUa + " DeymflixApp/1.4");
        }

        // -- 3) SPLASH --
        showSplash();

        // -- 4) WebViewClient: spinner fix + offline redirect + splash dismiss --
        wv.setWebViewClient(new android.webkit.WebViewClient() {
            // ── NAVIGATION GUARD (anti-popunder) ──
            // Free embed providers (Videasy/VidLink/...) run ad scripts that try
            // to hijack the whole view: popunders, "click redirects" to random
            // ad/malware hosts (my.rtmk.net, *.cfd, etc.). Policy: only OUR site
            // and the known embed player hosts may navigate inside the app;
            // EVERYTHING else is silently cancelled. User taps that should open
            // external apps (mailto/tel/intent) are dropped too — ads abuse them.
            private boolean isAllowedHost(String u) {
                try {
                    android.net.Uri uri = android.net.Uri.parse(u);
                    String s = uri.getScheme();
                    if (s == null) return false;
                    s = s.toLowerCase();
                    if (s.equals("blob") || s.equals("data") || s.equals("about") || s.equals("javascript")) return true;
                    if (!s.equals("http") && !s.equals("https")) return false; // intent:/market:/mailto: ... blocked
                    String h = uri.getHost();
                    if (h == null) return false;
                    h = h.toLowerCase();
                    String[] ok = {
                        "deymflix.eu.cc", "localhost", "127.0.0.1",
                        "videasy.net", "vidlink.pro", "autoembed.cc",
                        "vidsrc.cc", "vidsrc.su", "vidsrc.in",
                        "multiembed.mov", "2embed.cc", "cinemaos.live"
                    };
                    for (String k : ok) {
                        if (h.equals(k) || h.endsWith("." + k)) return true;
                    }
                    return false;
                } catch (Throwable t) {
                    return false;
                }
            }
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                // false = let the WebView load it; true = cancel silently
                return !isAllowedHost(url);
            }
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, android.webkit.WebResourceRequest req) {
                return !isAllowedHost(req.getUrl() == null ? "" : req.getUrl().toString());
            }

            // ── REQUEST FIREWALL (Brave-style network-level ad blocking) ──
            // The WebView hands us EVERY resource request — including requests
            // made by ad scripts INSIDE the provider iframes (their origins are
            // cross-origin, but request URLs are still visible to the network
            // stack we own). Matching hosts are answered with an empty response:
            // the tracker never loads, never fires, never triggers antivirus
            // warnings. Our own ad revenue (Hilltop) is explicitly protected
            // from this list, as are the video hosts and YouTube trailers.
            private final java.util.HashSet<String> AD_HOSTS = new java.util.HashSet<>(java.util.Arrays.asList(
                // flagged by the user's antivirus on our embeds
                "rtmk.net",
                // legacy/observed popunder rotators
                "zbcrtbk5m2415pw9jkwbejoei125vejja8xk.cfd",
                // big ad networks these providers commonly use
                "doubleclick.net", "googlesyndication.com", "googleadservices.com",
                "google-analytics.com", "adservice.google.com",
                "popads.net", "popcash.net", "propellerads.com",
                "exoclick.com", "exosrv.com", "exdynsrv.com", "juicyads.com",
                "adsterra.com",
                "adcash.com", "ad-maven.com", "onclickalgo.com", "onclickmega.com",
                "zeusadx.com", "bidvertiser.com"
            ));
            private boolean isAdHost(String h) {
                if (h == null) return false;
                h = h.toLowerCase();
                if (h.endsWith(".")) h = h.substring(0, h.length() - 1);
                // abuse-heavy TLDs: almost exclusively popunder/redirect infra
                if (h.endsWith(".cfd")) return true;
                // suffix walk: ads.rtmk.net → rtmk.net → match
                while (h.contains(".")) {
                    if (AD_HOSTS.contains(h)) return true;
                    h = h.substring(h.indexOf('.') + 1);
                }
                return AD_HOSTS.contains(h);
            }
            @Override
            public android.webkit.WebResourceResponse shouldInterceptRequest(WebView view, android.webkit.WebResourceRequest request) {
                try {
                    String host = request.getUrl() == null ? null : request.getUrl().getHost();
                    if (host != null && isAdHost(host)) {
                        return new android.webkit.WebResourceResponse(
                                "text/plain", "utf-8",
                                new java.io.ByteArrayInputStream(new byte[0]));
                    }
                } catch (Throwable t) { /* never break loading */ }
                return null; // null = request proceeds normally
            }
            @Override
            public void onPageFinished(WebView view, String url) {
                if (swipe != null) swipe.setRefreshing(false);
                hideSplash();
                // NOTE: no play-event handoff here by request -- the site
                // player plays normally in the page. Only the FULLSCREEN
                // button hands off to the native player now.
            }
            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                if (!isNetworkAvailable()) {
                    view.loadUrl("file:///android_asset/offline.html");
                }
                if (swipe != null) swipe.setRefreshing(false);
                hideSplash();
            }
        });

        // -- 5) WebChromeClient (video fullscreen only; a PAGE fullscreen keeps
        //       portrait -- Netflix/LokLok behavior) --
        wv.setWebChromeClient(new android.webkit.WebChromeClient() {
            private View customView;
            private android.webkit.WebChromeClient.CustomViewCallback customViewCallback;
            private android.widget.FrameLayout fullscreenContainer;

            @Override
            public void onShowCustomView(View view, android.webkit.WebChromeClient.CustomViewCallback callback) {
                // Only the VIDEO element itself counts (Android renders it into a
                // FrameLayout / VideoView / SurfaceView). A plain div = the PAGE
                // went fullscreen: hide nothing, keep portrait.
                boolean isVideo = view instanceof android.widget.FrameLayout
                        ? true
                        : (view instanceof android.widget.VideoView
                        ? true
                        : (view instanceof android.view.SurfaceView));
                if (!isVideo) { callback.onCustomViewHidden(); return; }
                if (customView != null) { callback.onCustomViewHidden(); return; }
                customView = view;
                customViewCallback = callback;
                fullscreenContainer = new android.widget.FrameLayout(act);
                fullscreenContainer.setBackgroundColor(Color.BLACK);
                fullscreenContainer.addView(view, new android.widget.FrameLayout.LayoutParams(
                        android.widget.FrameLayout.LayoutParams.MATCH_PARENT,
                        android.widget.FrameLayout.LayoutParams.MATCH_PARENT));
                act.setContentView(fullscreenContainer);
                enterAppFullscreen();
            }

            @Override
            public void onHideCustomView() {
                if (customView == null) return;
                fullscreenContainer.removeAllViews();
                act.setContentView(mActivityRoot);
                customView = null;
                customViewCallback = null;
                exitAppFullscreen();
            }
        });

        // -- 6) Swipe-to-refresh --
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

        // -- 8) DownloadListener: bare-link fallback --
        wv.setDownloadListener(new android.webkit.DownloadListener() {
            @Override
            public void onDownloadStart(final String url, String userAgent, String contentDisposition, String mimeType, final long contentLength) {
                act.runOnUiThread(new Runnable() { @Override public void run() {
                    confirmAndDownload(url, guessTitleFromUrl(url), "", "");
                }});
            }
        });

        // -- 8b) Purge stale download-registry rows (older than 7 days) --
        purgeOldDlMeta86();

        // -- 9) Load the site --
        if (isNetworkAvailable()) {
            wv.loadUrl("https://deymflix.eu.cc/index.html");
        } else {
            wv.loadUrl("file:///android_asset/offline.html");
        }

        // Remember the real content view so video-fullscreen can restore it
        mActivityRoot = ((android.view.ViewGroup) act.findViewById(android.R.id.content)).getChildAt(0);
    }

    // Finds the project WebView without any R.id dependency (the library jar
    // cannot see the app's generated resources).
    private static WebView findWebView(Activity a) {
        View root = a.findViewById(android.R.id.content);
        return root == null ? null : findWebViewIn(root);
    }

    private static WebView findWebViewIn(View v) {
        if (v instanceof WebView) return (WebView) v;
        if (v instanceof android.view.ViewGroup) {
            android.view.ViewGroup g = (android.view.ViewGroup) v;
            for (int i = 0; i < g.getChildCount(); i++) {
                WebView w = findWebViewIn(g.getChildAt(i));
                if (w != null) return w;
            }
        }
        return null;
    }

    // =======================================================================
    //  BACK (was: handleBack)
    // =======================================================================
    private void handleBack() {
        WebView wvB = findWebView(act);
        if (isAppFullscreen()) {
            // Back out of fullscreen: exit the pinned video (restores the
            // page) AND return the phone to portrait right away.
            if (wvB != null) wvB.loadUrl("javascript:(function(){try{exitFullscreen();}catch(e){}try{DeymflixApp.toggleFullscreen(false,false);}catch(e2){}})();");
            exitAppFullscreen();
            return;
        }
        if (wvB == null) { act.finish(); return; }
        String currentUrl = wvB.getUrl() == null ? "" : wvB.getUrl();
        boolean atHome = currentUrl.equals("https://deymflix.eu.cc/");
        if (!atHome) atHome = currentUrl.equals("https://deymflix.eu.cc/index.html");
        if (!atHome) atHome = currentUrl.endsWith("/index.html");
        if (!atHome) atHome = currentUrl.startsWith("file:///android_asset/");
        if (atHome) {
            showExitDialog();
        } else if (wvB.canGoBack()) {
            wvB.goBack();
        } else {
            wvB.loadUrl("https://deymflix.eu.cc/index.html");
        }
    }

    // DEYMFLIX-styled exit dialog: dark card, hexagon mark, red EXIT
    // button -- matches the download dialog instead of the stock white
    // Android alert.
    private void showExitDialog() {
        float density = act.getResources().getDisplayMetrics().density;
        LinearLayout box = new LinearLayout(act);
        box.setOrientation(LinearLayout.VERTICAL);
        int pad = (int) (24 * density);
        box.setPadding(pad, pad, pad, (int) (18 * density));
        GradientDrawable card = new GradientDrawable();
        card.setColor(Color.parseColor("#141418"));
        card.setCornerRadius(22 * density);
        card.setStroke(1, Color.parseColor("#2A2A30"));

        // hexagon mark + title row
        LinearLayout head = new LinearLayout(act);
        head.setOrientation(LinearLayout.HORIZONTAL);
        head.setGravity(Gravity.CENTER_VERTICAL);
        View mark = new HexagonLogoView(act);
        head.addView(mark, new LinearLayout.LayoutParams(
                (int) (40 * density), (int) (40 * density)));
        TextView title = new TextView(act);
        title.setText("Exit DEYMFLIX?");
        title.setTextColor(Color.WHITE);
        title.setTextSize(19);
        title.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        LinearLayout.LayoutParams tp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT);
        tp.leftMargin = (int) (14 * density);
        head.addView(title, tp);
        box.addView(head, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT));

        TextView msg = new TextView(act);
        msg.setText("Are you sure you want to leave?");
        msg.setTextColor(Color.parseColor("#9A9A9A"));
        msg.setTextSize(15);
        msg.setLineSpacing(3 * density, 1f);
        LinearLayout.LayoutParams mp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT);
        mp.topMargin = (int) (14 * density);
        box.addView(msg, mp);

        // buttons: NO = subtle dark pill, YES = red pill, right-aligned.
        // Buttons inset so they never touch the card edges (min-height for
        // a comfortable tap target).
        LinearLayout row = new LinearLayout(act);
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setGravity(Gravity.END + Gravity.CENTER_VERTICAL);
        LinearLayout.LayoutParams bp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT);
        bp.topMargin = (int) (22 * density);

        int btnPadX = (int) (20 * density);
        int btnMinH = (int) (40 * density);

        Button no = new Button(act);
        no.setText("NO");
        no.setAllCaps(true);
        no.setTextSize(14);
        no.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        no.setMinWidth(0);
        no.setMinimumWidth(0);
        no.setMinHeight(btnMinH);
        no.setMinimumHeight(btnMinH);
        no.setTextColor(Color.parseColor("#BBBBBB"));
        no.setBackgroundDrawable(themedButtonBg("#1E1E24"));
        no.setPadding(btnPadX, 0, btnPadX, 0);
        LinearLayout.LayoutParams noP = new LinearLayout.LayoutParams(bp);
        noP.rightMargin = (int) (10 * density);

        Button yes = new Button(act);
        yes.setText("YES, EXIT");
        yes.setAllCaps(true);
        yes.setTextSize(14);
        yes.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        yes.setMinWidth(0);
        yes.setMinimumWidth(0);
        yes.setMinHeight(btnMinH);
        yes.setMinimumHeight(btnMinH);
        yes.setTextColor(Color.WHITE);
        yes.setBackgroundDrawable(themedButtonBg("#E50914"));
        yes.setPadding(btnPadX, 0, btnPadX, 0);

        row.addView(no, noP);
        row.addView(yes, new LinearLayout.LayoutParams(bp));
        LinearLayout.LayoutParams rowLp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT);
        rowLp.rightMargin = (int) (2 * density);
        box.addView(row, rowLp);

        final Dialog d = new Dialog(act);
        d.getWindow().setBackgroundDrawable(card);
        d.setContentView(box);
        int width = (int) (act.getResources().getDisplayMetrics().widthPixels * 0.82f);
        d.getWindow().setLayout(width, android.view.ViewGroup.LayoutParams.WRAP_CONTENT);
        no.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) { d.dismiss(); }
        });
        yes.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) { d.dismiss(); act.finish(); }
        });
        d.show();
    }

    // =======================================================================
    //  RESUME (was: handleResume)
    // =======================================================================
    private void handleResume() {
        WebView wvR = findWebView(act);
        if (wvR != null && isNetworkAvailable()
                && wvR.getUrl() != null
                && wvR.getUrl().startsWith("file:///android_asset/offline.html")) {
            wvR.loadUrl("https://deymflix.eu.cc/index.html");
        }
    }

    // =======================================================================
    //  NETWORK
    // =======================================================================
    // =======================================================================
    //  HYBRID ONLINE PLAYER
    // =======================================================================
    // Launch the native player for an online stream. When a downloaded copy
    // of the same title exists it rides along as the fallback url, so a dead
    // stream silently swaps to the offline file.
    private void launchNativePlayer(String url, String title) {
        try {
            android.content.Intent it = new android.content.Intent();
            it.setClassName(act, act.getPackageName() + ".LocalplayerActivity");
            it.putExtra("url", url);
            it.putExtra("title", title == null ? "" : title);
            it.putExtra("sub", "");
            String fallback = DlSpeed85.downloadedPathFor(act, title);
            if (fallback != null) it.putExtra("fallback", fallback);
            try { act.startActivity(it); } catch (Exception eUpper) {
                it.setClassName(act, act.getPackageName() + ".LocalPlayerActivity");
                act.startActivity(it);
            }
        } catch (Exception e) { }
    }

    // Pull one string field out of the JSON the page hook returns
    // ("{"s":"...","h":"...","t":"..."}'). JSON-safe without a parser:
    // the fields are read in order and trailing values are trimmed at the
    // next known key boundary.
    private static String pageJsonField(String raw, String key) {
        if (raw == null) return "";
        String look = "\\\"" + key + "\\\":\\\"";
        int i = raw.indexOf(look);
        if (i < 0) return "";
        int start = i + look.length();
        StringBuilder sb = new StringBuilder();
        for (int k = start; k < raw.length(); k++) {
            char ch = raw.charAt(k);
            if (ch == '\\' && k + 1 < raw.length()) {
                char nx = raw.charAt(k + 1);
                boolean quote = nx == '"';
                boolean backslash = nx == '\\';
                boolean slash = nx == '/';
                if (quote) sb.append(nx);
                if (backslash) sb.append(nx);
                if (slash) sb.append(nx);
                else if (nx == 'u' && k + 5 < raw.length()) {
                    try {
                        sb.append((char) Integer.parseInt(raw.substring(k + 2, k + 6), 16));
                        k += 4;
                    } catch (Exception e) { }
                }
                continue;
            }
            if (ch == '"') break;
            sb.append(ch);
        }
        String out = sb.toString();
        if (out.equals("null")) return "";
        return out;
    }

    // One-time page hook: a capture-phase "play" listener pauses the site
    // video and hands the stream to the native player. Re-injection is
    // guarded by a window flag. Blob (hls.js) sources map to the page's HLS
    // playlist or the exposed direct mp4.
    private void injectPlayHook(final WebView wv) {
        // The mapping happens IN THE PAGE: only when a usable (non-blob)
        // stream URL exists does it pause the video and call the bridge.
        // Anything else (trailers, odd embeds) plays on the site as normal --
        // no frozen frames, no stuck handoffs.
        String js = "javascript:(function(){"
                + "if(window.__dfxHook85)return;window.__dfxHook85=true;"
                + "document.addEventListener('play',function(e){"
                + "var v=e.target;if(!v)return;if(v.tagName!=='VIDEO')return;"
                + "if(v.__dfxNative)return;"
                + "var s=(v.currentSrc==null?'':v.currentSrc)+'';"
                + "if(s.length===0){s=(v.src==null?'':v.src)+'';}"
                + "var h='';"
                + "try{var cm=window.__dfxCurrentMovie;if(cm){h=(cm.hlsUrl==null?'':cm.hlsUrl)+'';if(h.length===0){h=(cm._episodeHlsUrl==null?'':cm._episodeHlsUrl)+'';}}}catch(x){}"
                + "if(h.length===0){try{h=(window._dfxDownloadUrl==null?'':window._dfxDownloadUrl)+'';}catch(x){}}"
                + "if(s.indexOf('blob:')===0){if(h.length>0){s=h;}else{return;}}"
                + "if(s.length===0)return;if(s.indexOf('blob:')===0)return;"
                + "v.__dfxNative=true;"
                + "try{v.pause();}catch(x){}"
                + "var t='';"
                + "try{var cm2=window.__dfxCurrentMovie;t=(cm2!=null&&cm2.title!=null)?cm2.title:document.title;if(t==null)t='';}catch(x){t=document.title;if(t==null)t='';}"
                + "if(window.DeymflixApp&&DeymflixApp.playOnline){DeymflixApp.playOnline(s,t,'');}"
                + "},true);"
                + "})()";
        wv.evaluateJavascript(js, null);
    }

    private boolean isNetworkAvailable() {
        android.net.ConnectivityManager cm =
                (android.net.ConnectivityManager) act.getSystemService(Context.CONNECTIVITY_SERVICE);
        if (cm == null) return false;
        android.net.NetworkInfo ni = cm.getActiveNetworkInfo();
        return ni != null && ni.isConnected();
    }

    // =======================================================================
    //  ANIMATED SPLASH
    // =======================================================================
    private void showSplash() {
        if (splashLayout != null) return;
        float d = act.getResources().getDisplayMetrics().density;
        splashLayout = new LinearLayout(act);
        splashLayout.setOrientation(LinearLayout.VERTICAL);
        splashLayout.setGravity(Gravity.CENTER);
        splashLayout.setBackgroundColor(Color.parseColor("#0B0B0F"));
        splashLayout.setClickable(true);
        splashLayout.setFocusable(true);

        // everything (logo + wordmark + hint) lives in ONE content block so
        // the exit can float the whole group upward, Netflix-style
        LinearLayout content = new LinearLayout(act);
        content.setOrientation(LinearLayout.VERTICAL);
        content.setGravity(Gravity.CENTER_HORIZONTAL);

        hexagonView = new HexagonLogoView(act);
        int side = Math.min(act.getResources().getDisplayMetrics().widthPixels,
                act.getResources().getDisplayMetrics().heightPixels) / 2;
        content.addView(hexagonView, new LinearLayout.LayoutParams(side, side));

        // The "DEYMFLIX" wordmark sits under the logo like on the site page
        TextView logo = new TextView(act);
        logo.setText("DEYMFLIX");
        logo.setTextColor(Color.WHITE);
        logo.setTextSize(30);
        logo.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        logo.setLetterSpacing(0.2f);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT);
        lp.topMargin = (int) (28 * d);
        content.addView(logo, lp);

        TextView hint = new TextView(act);
        hint.setText("Loading your stream...");
        hint.setTextColor(Color.parseColor("#9A9A9A"));
        hint.setTextSize(13);
        LinearLayout.LayoutParams hp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT);
        hp.topMargin = (int) (14 * d);
        content.addView(hint, hp);

        splashLayout.addView(content, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT));
        splashContent = content;

        android.view.ViewGroup root = (android.view.ViewGroup) act.findViewById(android.R.id.content);
        root.addView(splashLayout, new android.view.ViewGroup.LayoutParams(
                android.view.ViewGroup.LayoutParams.MATCH_PARENT,
                android.view.ViewGroup.LayoutParams.MATCH_PARENT));
        splashShownAt = System.currentTimeMillis();

        // Safety cap only: hideSplash() enforces the 2s minimum itself.
        splashTimeoutTimer = new java.util.Timer();
        splashTimeoutTimer.schedule(new java.util.TimerTask() {
            @Override
            public void run() {
                act.runOnUiThread(new Runnable() { @Override public void run() { hideSplash(); } });
            }
        }, 8000);
    }

    // The DEYMFLIX splash exactly like the app.html hero: a rounded dark
    // tile (floating up and down), the red hexagon + play arrow on it, and
    // an invisible ring SPINNING around the tile carrying one glowing red
    // dot. The old static/pulse version looked broken next to the site.
    public static class HexagonLogoView extends View {
        private final android.graphics.Paint tilePaint = new android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG);
        private final android.graphics.Paint hexFill = new android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG);
        private final android.graphics.Paint hexStroke = new android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG);
        private final android.graphics.Paint redArrow = new android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG);
        private final android.graphics.Paint whiteArrow = new android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG);
        private final android.graphics.Paint ringPaint = new android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG);
        private final android.graphics.Paint dotPaint = new android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG);
        private final android.graphics.Paint dotGlow = new android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG);
        private final Path hexPath = new Path();
        private final Path redPath = new Path();
        private final Path whitePath = new Path();
        private float spin = 0f;      // 0..1 around the ring
        private float floatT = 0f;    // 0..1 float bob
        private android.animation.ValueAnimator animator;

        HexagonLogoView(Context c) {
            super(c);
            tilePaint.setStyle(android.graphics.Paint.Style.FILL);
            tilePaint.setColor(Color.parseColor("#141414"));
            hexFill.setStyle(android.graphics.Paint.Style.FILL);
            hexFill.setColor(Color.parseColor("#1A1A1A"));
            hexStroke.setStyle(android.graphics.Paint.Style.STROKE);
            hexStroke.setColor(Color.parseColor("#FF1E27"));
            hexStroke.setStrokeWidth(3f);
            hexStroke.setStrokeJoin(android.graphics.Paint.Join.ROUND);
            redArrow.setStyle(android.graphics.Paint.Style.FILL);
            redArrow.setColor(Color.parseColor("#FF1E27"));
            whiteArrow.setStyle(android.graphics.Paint.Style.FILL);
            whiteArrow.setColor(Color.WHITE);
            whiteArrow.setAlpha(230);
            ringPaint.setStyle(android.graphics.Paint.Style.STROKE);
            ringPaint.setColor(Color.parseColor("#59E50914"));  // rgba(229,9,20,.35)
            ringPaint.setStrokeWidth(1.5f);
            dotPaint.setStyle(android.graphics.Paint.Style.FILL);
            dotPaint.setColor(Color.parseColor("#FF1E27"));
            dotGlow.setStyle(android.graphics.Paint.Style.FILL);
            dotGlow.setColor(Color.parseColor("#88FF1E27"));
            // geometry copied from favicon.svg (viewBox 0 0 64 64)
            hexPath.moveTo(32f, 6f);
            hexPath.lineTo(56f, 18f);
            hexPath.lineTo(56f, 46f);
            hexPath.lineTo(32f, 58f);
            hexPath.lineTo(8f, 46f);
            hexPath.lineTo(8f, 18f);
            hexPath.close();
            redPath.moveTo(25f, 20f);
            redPath.lineTo(46f, 32f);
            redPath.lineTo(25f, 44f);
            redPath.close();
            whitePath.moveTo(30f, 24f);
            whitePath.lineTo(49f, 32f);
            whitePath.lineTo(30f, 40f);
            whitePath.close();
            // one animator drives both: 14s ring spin (site timing) and a
            // 5s float loop (site .app-icon float keyframes)
            animator = android.animation.ValueAnimator.ofFloat(0f, 1f);
            animator.setDuration(16667);
            animator.setRepeatCount(android.animation.ValueAnimator.INFINITE);
            animator.setInterpolator(new android.view.animation.LinearInterpolator());
            animator.addUpdateListener(new android.animation.ValueAnimator.AnimatorUpdateListener() {
                @Override
                public void onAnimationUpdate(android.animation.ValueAnimator a) {
                    long t = a.getCurrentPlayTime();
                    spin = (t % 14000L) / 14000f;
                    float phase = (t % 5000L) / 5000f;
                    floatT = (float) Math.sin(phase * Math.PI * 2);  // -1..1
                    invalidate();
                }
            });
            animator.start();
        }

        // stops the infinite animator (called when the splash hides)
        void stop() {
            if (animator != null) animator.cancel();
        }

        @Override
        protected void onDraw(android.graphics.Canvas canvas) {
            super.onDraw(canvas);
            int w = getWidth();
            int h = getHeight();
            if (w == 0) return;
            float cx = w / 2f;
            float cy = h / 2f + floatT * h * 0.03f;   // gentle float bob
            // EVERYTHING must fit inside the view: the old ring square was
            // larger than the view and clipped at the edges (broken look).
            float tile = Math.min(w, h) * 0.60f;

            // 1) the spinning ring (square, like the site's .ring) + red dot
            canvas.save();
            canvas.translate(cx, cy);
            canvas.rotate(spin * 360f);
            float half = Math.min(w, h) * 0.40f;      // ring side = 80% of view
            canvas.drawRect(-half, -half, half, half, ringPaint);
            // the dot rides the top edge midpoint (site: .ring::before)
            float dotR = Math.max(3f, tile * 0.05f);
            canvas.drawCircle(0f, -half, dotR * 2.2f, dotGlow);
            canvas.drawCircle(0f, -half, dotR, dotPaint);
            canvas.restore();

            // 2) the dark rounded tile
            android.graphics.RectF tr = new android.graphics.RectF(
                    cx - tile / 2f, cy - tile / 2f, cx + tile / 2f, cy + tile / 2f);
            canvas.drawRoundRect(tr, tile * 0.22f, tile * 0.22f, tilePaint);

            // 3) hexagon + arrows (favicon geometry, centered in the tile)
            canvas.save();
            canvas.translate(cx, cy);
            float scale = tile / 64f * 0.82f;
            canvas.scale(scale, scale);
            // the artwork spans 0..64 -- re-center it or it lands offset
            // to the bottom-right of the tile (the "broken logo" bug)
            canvas.translate(-32f, -32f);
            canvas.drawPath(hexPath, hexFill);
            canvas.drawPath(hexPath, hexStroke);
            canvas.drawPath(redPath, redArrow);
            canvas.drawPath(whitePath, whiteArrow);
            canvas.restore();
        }
    }

    private void hideSplash() {
        if (splashLayout == null) return;
        // enforce the 2-second minimum: too early means wait and retry
        long shownFor = System.currentTimeMillis() - splashShownAt;
        if (shownFor < SPLASH_MIN_MS) {
            if (splashTimeoutTimer != null) { splashTimeoutTimer.cancel(); splashTimeoutTimer = null; }
            splashTimeoutTimer = new java.util.Timer();
            splashTimeoutTimer.schedule(new java.util.TimerTask() {
                @Override
                public void run() {
                    act.runOnUiThread(new Runnable() { @Override public void run() { hideSplash(); } });
                }
            }, SPLASH_MIN_MS - shownFor);
            return;
        }
        if (splashTimeoutTimer != null) { splashTimeoutTimer.cancel(); splashTimeoutTimer = null; }
        if (splashAnimator != null) { splashAnimator.cancel(); splashAnimator = null; }
        if (hexagonView instanceof HexagonLogoView) ((HexagonLogoView) hexagonView).stop();
        hexagonView = null;
        float d = act.getResources().getDisplayMetrics().density;
        final LinearLayout splash = splashLayout;
        splashLayout = null;
        // NETFLIX EXIT: the logo block floats UP while fading out, then the
        // dark backdrop dissolves away underneath it (instead of a flat fade).
        final View content = splashContent;
        splashContent = null;
        if (content != null) {
            content.animate().translationYBy(-64f * d).alpha(0f)
                    .setDuration(450)
                    .setInterpolator(new android.view.animation.AccelerateInterpolator(1.3f))
                    .start();
        }
        splash.animate().alpha(0f).setDuration(620).setStartDelay(140).withEndAction(new Runnable() {
            @Override public void run() {
                android.view.ViewGroup parent = (android.view.ViewGroup) splash.getParent();
                if (parent != null) parent.removeView(splash);
            }
        }).start();
    }


    // =======================================================================
    //  JS BRIDGE (name + signatures must match app.js exactly)
    // =======================================================================
    private Object getDeymflixBridge() {
        return new Object() {
            @android.webkit.JavascriptInterface
            public void requestDownload(final String url, final String title, final String quality, final String poster) {
                act.runOnUiThread(new Runnable() { @Override public void run() {
                    confirmAndDownload(url, title, quality, poster);
                }});
            }
            @android.webkit.JavascriptInterface
            public void openDownloads() {
                act.runOnUiThread(new Runnable() { @Override public void run() {
                    openDownloadsScreen();
                }});
            }
            // enter = true + isVideo = true: landscape lock + immersive bars.
            // A page-level fullscreen hides the bars but keeps portrait.
            @android.webkit.JavascriptInterface
            public void toggleFullscreen(final boolean enter, final boolean isVideo) {
                act.runOnUiThread(new Runnable() { @Override public void run() {
                    // FULLSCREEN = rotate the WHOLE PAGE to landscape with the
                    // video filling it -- exactly what Chrome and LokLok do
                    // (user's screen recordings). The native-player handoff
                    // was reverted: users want the page itself fullscreen,
                    // rotating together, with the notification panel proving
                    // the landscape state.
                    if (enter && !appFullscreen) {
                        enterAppFullscreen();
                    } else if (!enter && appFullscreen) {
                        exitAppFullscreen();
                    } else if (enter && appFullscreen) {
                        // The deployed site's fullscreen icon always sends
                        // "enter" (document.fullscreenElement is always false
                        // in a WebView, so it can never see the exit state).
                        // Tapping it while already fullscreen therefore means
                        // TOGGLE OFF: exit to portrait, movie keeps playing.
                        exitAppFullscreen();
                    }
                }});
            }
            // Anti-recording: black out screenshots while a movie plays.
            // HYBRID PLAYER: the injected page hook calls this with the
            // resolved stream. url2 carries the HLS playlist when the page
            // used hls.js (blob: URLs cannot be handed to MediaPlayer).
            @android.webkit.JavascriptInterface
            public void playOnline(final String url, final String title, final String url2) {
                act.runOnUiThread(new Runnable() { @Override public void run() {
                    String use = url == null ? "" : url;
                    if (use.startsWith("blob:")) use = url2 == null ? "" : url2;
                    if (use.length() == 0) return; // nothing usable: page keeps playing
                    launchNativePlayer(use, title);
                }});
            }
            @android.webkit.JavascriptInterface
            public void setSecure(final boolean on) {
                act.runOnUiThread(new Runnable() { @Override public void run() {
                    if (on) {
                        act.getWindow().addFlags(android.view.WindowManager.LayoutParams.FLAG_SECURE);
                    } else {
                        act.getWindow().clearFlags(android.view.WindowManager.LayoutParams.FLAG_SECURE);
                    }
                }});
            }
        };
    }

    // The Downloads screen is launched by NAME so this jar never needs a
    // compile-time reference to the app's generated classes.
    private void openDownloadsScreen() {
        try {
            Intent it = new Intent();
            it.setClassName(act.getApplicationContext(), act.getPackageName() + ".DownloadsActivity");
            act.startActivity(it);
        } catch (Exception e) {
            Toast.makeText(act.getApplicationContext(),
                    "Downloads screen unavailable", Toast.LENGTH_SHORT).show();
        }
    }

    // =======================================================================
    //  APP FULLSCREEN (movie = landscape, exactly like the offline player)
    //  Fullscreen MEANS: rotate to landscape, hide every bar, and the page's
    //  .fullscreen-active CSS stretches the video container to the full
    //  (now landscape) screen. The MainActivity manifest has
    //  configChanges covers orientation and screenSize, so the page does NOT
    //  reload on
    //  the rotation -- the video keeps playing and fills the screen.
    // =======================================================================
    private void enterAppFullscreen() {
        appFullscreen = true;
        videoFs85 = true;
        // swipe-to-refresh must not fight the fullscreen video
        if (swipeRef != null) swipeRef.setEnabled(false);
        // v1.0 / Netflix behavior: the player goes LANDSCAPE fullscreen --
        // rotate the activity, hide every bar, and the video element fills
        // the screen edge to edge. You see only the movie, in landscape,
        // exactly like the offline player. Nothing below survives visually
        // because the video covers it all.
        act.setRequestedOrientation(android.content.pm.ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
        android.view.Window w = act.getWindow();
        w.addFlags(android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN);
        w.getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_FULLSCREEN
                + View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                + View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                + View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                + View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                + View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
        jsClassToggle(true);
    }

    private void exitAppFullscreen() {
        appFullscreen = false;
        videoFs85 = false;
        if (swipeRef != null) swipeRef.setEnabled(true);
        act.setRequestedOrientation(android.content.pm.ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
        android.view.Window w = act.getWindow();
        w.clearFlags(android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN);
        w.getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_VISIBLE);
        jsClassToggle(false);
    }

    // Adds/removes fullscreen pinning on the page's video container.
    // NOTE: the injected JS must stay comment-free -- it runs as ONE line,
    // so a // comment would comment out the rest of the script (that was
    // the fullscreen regression).
    // Fullscreen = the VIDEO pinned over everything (Netflix style). The
    // site's .fullscreen-active class alone only RESIZES the container -- it
    // stays in page flow, so a page header can remain visible above it in
    // landscape. Pinning it with inline styles guarantees the movie covers
    // the whole screen; exiting restores the exact previous styles.
    private void jsClassToggle(boolean on) {
        WebView wvJ = findWebView(act);
        if (wvJ == null) return;
        String js;
        if (on) {
            js = "(function(){try{"
                    + "var c=document.querySelector('.video-container');"
                    + "if(!c)return;"
                    + "c.setAttribute('data-dfx-save',c.getAttribute('style')==null?'':c.getAttribute('style'));"
                    + "c.style.cssText='position:fixed;top:0;left:0;width:100vw;height:100vh;margin:0;padding:0;border-radius:0;background:#000;z-index:2147483000;';"
                    + "var m=c.querySelector('video');if(!m)m=c.querySelector('iframe');"
                    + "if(m){m.setAttribute('data-dfx-save2',m.getAttribute('style')==null?'':m.getAttribute('style'));"
                    + "m.style.cssText='position:absolute;top:0;left:0;width:100%;height:100%;object-fit:contain;border:none;display:block;';}"
                    + "c.classList.add('fullscreen-active');"
                    + "document.documentElement.style.overflow='hidden';document.body.style.overflow='hidden';"
                    + "window.scrollTo(0,0);"
                    + "var t=document.querySelector('.player-top-bar');"
                    + "if(t){t.__dfxOld=t.onclick;"
                    + "t.onclick=function(e){e.stopPropagation();"
                    + "if(window.DeymflixApp&&DeymflixApp.toggleFullscreen){DeymflixApp.toggleFullscreen(false,false);}};}"
                    + "var b=document.getElementById('trailer-back-btn');"
                    + "if(b){b.__dfxOld=b.onclick;"
                    + "b.onclick=function(e){e.stopPropagation();"
                    + "if(window.DeymflixApp&&DeymflixApp.toggleFullscreen){DeymflixApp.toggleFullscreen(false,false);}};}"
                    + "if(typeof window.toggleFullscreen==='function'){window.__dfxTf=window.toggleFullscreen;"
                    + "window.toggleFullscreen=function(){if(window.DeymflixApp&&DeymflixApp.toggleFullscreen){DeymflixApp.toggleFullscreen(false,false);}};}"
                    + "}catch(e){}})();";
        } else {
            js = "(function(){try{"
                    + "var c=document.querySelector('.video-container');"
                    + "if(c){"
                    + "c.style.cssText=c.getAttribute('data-dfx-save')==null?'':c.getAttribute('data-dfx-save');"
                    + "c.removeAttribute('data-dfx-save');"
                    + "c.classList.remove('fullscreen-active');"
                    + "var m=c.querySelector('video');if(!m)m=c.querySelector('iframe');"
                    + "if(m){m.style.cssText=m.getAttribute('data-dfx-save2')==null?'':m.getAttribute('data-dfx-save2');m.removeAttribute('data-dfx-save2');}"
                    + "}"
                    + "document.documentElement.style.overflow='';document.body.style.overflow='';"
                    + "try{if(window.__dfxTf){window.toggleFullscreen=window.__dfxTf;window.__dfxTf=null;}}catch(e2){}"
                    + "var t=document.querySelector('.player-top-bar');"
                    + "if(t){if(t.__dfxOld){t.onclick=t.__dfxOld;}t.__dfxOld=null;}"
                    + "var b=document.getElementById('trailer-back-btn');"
                    + "if(b){if(b.__dfxOld){b.onclick=b.__dfxOld;}b.__dfxOld=null;}"
                    + "try{if(typeof exitFullscreen==='function'){exitFullscreen();}}catch(e0){}"
                    + "}catch(e){}})();";
        }
        wvJ.loadUrl("javascript:" + js);
    }

    private boolean isAppFullscreen() {
        return appFullscreen;
    }

    // =======================================================================
    //  THEMED CONFIRM DIALOG
    // =======================================================================
    private void confirmAndDownload(final String url, final String title, final String quality, final String poster) {
        if (url == null) {
            Toast.makeText(act.getApplicationContext(), "This title cannot be downloaded.", Toast.LENGTH_SHORT).show();
            return;
        }
        if (url.length() == 0) {
            Toast.makeText(act.getApplicationContext(), "This title cannot be downloaded.", Toast.LENGTH_SHORT).show();
            return;
        }
        if (android.os.Build.VERSION.SDK_INT >= 33
                && act.checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
            act.requestPermissions(new String[]{ android.Manifest.permission.POST_NOTIFICATIONS }, 4101);
        }

        // Common sense: you cannot download a movie that is already been
        // downloaded. (Deleting it clears the record, so it can be
        // downloaded again.)
        final String dupMsg = alreadyOwnedMessage(title);
        if (dupMsg != null) {
            android.app.AlertDialog.Builder ab = new android.app.AlertDialog.Builder(act);
            ab.setTitle("Already downloaded");
            ab.setMessage(dupMsg);
            ab.setPositiveButton("OK", null);
            ab.show();
            return;
        }

        Toast.makeText(act.getApplicationContext(), "Checking file...", Toast.LENGTH_SHORT).show();
        // SERIES: the download button must open the episode CHECKLIST (select
        // episodes or Select All) instead of the single-movie dialog.
        final WebView wvS = findWebView(act);
        if (wvS != null) {
            wvS.evaluateJavascript(
                    "(function(){try{"
                    + "var cm=window.__dfxCurrentMovie;"
                    + "if(!cm)return 'null';"
                    + "if(!cm.isSeries)return 'null';"
                    + "var sd=(typeof seriesData!=='undefined')?seriesData:null;"
                    + "if(!sd)return 'null';"
                    + "var norm=function(v){return String(v==null?'':v).toLowerCase().replace(/[^a-z0-9]/g,'');};"
                    + "var s=null;"
                    + "for(var i=0;i<sd.length;i++){var sameId=sd[i].id==cm.id;var sameNorm=norm(sd[i].id)==norm(cm.id);if(sameId){s=sd[i];break;}if(sameNorm){s=sd[i];break;}}"
                    + "if(!s)return 'null';"
                    + "var eps=[];"
                    + "var seasons=s.seasons==null?[]:s.seasons;"
                    + "for(var a=0;a<seasons.length;a++){var ee=seasons[a].episodes==null?[]:seasons[a].episodes;"
                    + "for(var b2=0;b2<ee.length;b2++){eps.push({n:ee[b2].episodeNumber,u:ee[b2].embedUrl,t:ee[b2].title==null?'':ee[b2].title});}}"
                    + "return JSON.stringify({title:cm.title,poster:cm.poster==null?'':cm.poster,cur:(cm._episodeNum==null?0:cm._episodeNum),eps:eps});"
                    + "}catch(e){return 'null';}})()",
                    new android.webkit.ValueCallback<String>() {
                        @Override public void onReceiveValue(String raw) {
                            String json = raw == null ? "" : raw;
                            if (json.length() > 1 && json.startsWith("\"") && json.endsWith("\"")) {
                                json = json.substring(1, json.length() - 1)
                                        .replace("\\\"", "\"")
                                        .replace("\\\\", "\\");
                            }
                            boolean isNull = json.equals("null");
                            if (isNull) json = "";
                            if (json.length() == 0) {
                                showConfirmDialog(url, title, quality, poster, -1, "");
                                return;
                            }
                            showSeriesDialog(json, quality);
                        }
                    });
            return;
        }
        new Thread(new Runnable() { @Override public void run() {
            long size = -1;
            try {
                URL u = new URL(url);
                HttpURLConnection c = (HttpURLConnection) u.openConnection();
                c.setRequestMethod("HEAD");
                c.setConnectTimeout(8000);
                c.setReadTimeout(8000);
                c.setRequestProperty("User-Agent", "DeymflixApp/1.4");
                size = c.getContentLengthLong();
                c.disconnect();
            } catch (Exception e) { size = -1; }
            // Resolve the matching local subtitle (English first) so it
            // downloads together with the movie.
            final String subUrl = findSubUrlForMovie(title, episodeNumFromTitle(title));
            final long fSize = size;
            act.runOnUiThread(new Runnable() { @Override public void run() {
                showConfirmDialog(url, title, quality, poster, fSize, subUrl);
            }});
        }}).start();
    }

    // =======================================================================
    //  SERIES BULK DOWNLOAD (episode checklist)
    // =======================================================================
    private static class Ep85 {
        int num;
        String url;
        String t;
    }

    // Reads {title,poster,cur,eps:[{n,u,t}...]} -- flat and ours, so a tiny
    // hand parser is enough (no org.json dependency assumptions).
    private static java.util.ArrayList<Ep85> parseEps(String json, String[] outTitle,
            String[] outPoster, int[] outCur) {
        java.util.ArrayList<Ep85> out = new java.util.ArrayList<Ep85>();
        try {
            outTitle[0] = extractStr(json, "title");
            outPoster[0] = extractStr(json, "poster");
            outCur[0] = 0;
            int k = json.indexOf("\"cur\"");
            if (k >= 0) {
                int colon = json.indexOf(':', k);
                StringBuilder nb = new StringBuilder();
                for (int i = colon + 1; i < json.length(); i++) {
                    char ch = json.charAt(i);
                    boolean digit = (ch >= '0' && ch <= '9');
                    boolean dash = ch == '-';
                    if (digit) nb.append(ch);
                    if (dash) nb.append(ch);
                    if ((!digit) && (!dash)) if (nb.length() > 0) break;
                    else if (nb.length() > 0) break;
                }
                try { outCur[0] = Integer.parseInt(nb.toString()); } catch (Exception e) { }
            }
            int arr = json.indexOf("\"eps\"");
            if (arr < 0) return out;
            int start = json.indexOf('[', arr);
            int depth = 0;
            int end = start;
            for (int i = start; i < json.length(); i++) {
                char ch = json.charAt(i);
                if (ch == '[') depth++;
                if (ch == ']') { depth--; if (depth == 0) { end = i; break; } }
            }
            String body = json.substring(start + 1, end);
            // split top-level objects
            java.util.ArrayList<String> objs = new java.util.ArrayList<String>();
            int d2 = 0;
            int objStart = -1;
            boolean inStr = false;
            for (int i = 0; i < body.length(); i++) {
                char ch = body.charAt(i);
                if (ch == '"') inStr = !inStr;
                if (inStr) continue;
                if (ch == '{') { if (d2 == 0) objStart = i; d2++; }
                if (ch == '}') { d2--; if (d2 == 0 && objStart >= 0) objs.add(body.substring(objStart, i + 1)); }
            }
            for (int i = 0; i < objs.size(); i++) {
                String o = objs.get(i);
                Ep85 e = new Ep85();
                e.num = 0;
                int kn = o.indexOf("\"n\":");
                if (kn >= 0) {
                    StringBuilder nb = new StringBuilder();
                    for (int j = kn + 4; j < o.length(); j++) {
                        char ch = o.charAt(j);
                        if (ch >= '0' && ch <= '9') nb.append(ch);
                        else if (nb.length() > 0) break;
                    }
                    try { e.num = Integer.parseInt(nb.toString()); } catch (Exception e2) { }
                }
                e.url = extractStr(o, "u");
                e.t = extractStr(o, "t");
                if (e.num > 0 && e.url.startsWith("http")) out.add(e);
            }
        } catch (Exception e3) { }
        return out;
    }

    private static String extractStr(String json, String key) {
        try {
            int k = json.indexOf("\"" + key + "\"");
            if (k < 0) return "";
            int colon = json.indexOf(':', k);
            int q1 = json.indexOf('"', colon + 1);
            if (q1 < 0) return "";
            StringBuilder sb = new StringBuilder();
            for (int i = q1 + 1; i < json.length(); i++) {
                char ch = json.charAt(i);
                if (ch == '\\' && i + 1 < json.length()) {
                    char nx = json.charAt(i + 1);
                    sb.append(nx == 'n' ? '\n' : nx);
                    i++;
                    continue;
                }
                if (ch == '"') break;
                sb.append(ch);
            }
            return sb.toString();
        } catch (Exception e) {
            return "";
        }
    }

    private void showSeriesDialog(final String json, final String quality) {
        String[] tHold = new String[1];
        String[] pHold = new String[1];
        int[] cHold = new int[1];
        final java.util.ArrayList<Ep85> eps = parseEps(json, tHold, pHold, cHold);
        final String seriesTitle = tHold[0] == null ? "Series" : tHold[0];
        final String poster = pHold[0] == null ? "" : pHold[0];
        final int current = cHold[0];
        if (eps.isEmpty()) {
            showConfirmDialog("", seriesTitle, quality, poster, -1, "");
            return;
        }
        float density = act.getResources().getDisplayMetrics().density;

        LinearLayout box = new LinearLayout(act);
        box.setOrientation(LinearLayout.VERTICAL);
        int pad = (int) (24 * density);
        box.setPadding(pad, pad, pad, (int) (16 * density));
        GradientDrawable card = new GradientDrawable();
        card.setColor(Color.parseColor("#141418"));
        card.setCornerRadius(22 * density);
        card.setStroke(1, Color.parseColor("#2A2A30"));

        // poster + series title head (like the single-download dialog)
        LinearLayout head = new LinearLayout(act);
        head.setOrientation(LinearLayout.HORIZONTAL);
        ImageView pv = new ImageView(act);
        LinearLayout.LayoutParams pvLp = new LinearLayout.LayoutParams(
                (int) (64 * density), (int) (92 * density));
        pvLp.rightMargin = (int) (14 * density);
        pv.setScaleType(ImageView.ScaleType.CENTER_CROP);
        pv.setBackgroundDrawable(posterBg());
        loadPosterInto(pv, poster, (int) (64 * density), (int) (92 * density));
        head.addView(pv, pvLp);
        LinearLayout hRight = new LinearLayout(act);
        hRight.setOrientation(LinearLayout.VERTICAL);
        hRight.setGravity(Gravity.CENTER_VERTICAL);
        TextView hTitle = new TextView(act);
        hTitle.setText("Download series");
        hTitle.setTextColor(Color.parseColor("#E50914"));
        hTitle.setTextSize(18);
        hTitle.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        hRight.addView(hTitle);
        TextView hName = new TextView(act);
        hName.setText(seriesTitle);
        hName.setTextColor(Color.WHITE);
        hName.setTextSize(15);
        hRight.addView(hName);
        TextView hCount = new TextView(act);
        hCount.setText(String.valueOf(eps.size()) + " episodes available");
        hCount.setTextColor(Color.parseColor("#9A9A9A"));
        hCount.setTextSize(13);
        hRight.addView(hCount);
        head.addView(hRight, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.MATCH_PARENT, 1f));
        box.addView(head, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT));

        // Select All row
        final android.widget.CheckBox all = new android.widget.CheckBox(act);
        all.setText("Select all episodes");
        all.setTextColor(Color.WHITE);
        all.setTextSize(14);
        all.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        all.setPadding(0, (int) (14 * density), 0, (int) (4 * density));
        box.addView(all, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT));

        // the checklist (scrollable)
        final java.util.ArrayList<android.widget.CheckBox> boxes =
                new java.util.ArrayList<android.widget.CheckBox>();
        final java.util.ArrayList<Ep85> items = eps;
        android.widget.ScrollView sc = new android.widget.ScrollView(act);
        sc.setVerticalScrollBarEnabled(true);
        LinearLayout list = new LinearLayout(act);
        list.setOrientation(LinearLayout.VERTICAL);
        for (int i = 0; i < items.size(); i++) {
            Ep85 e = items.get(i);
            android.widget.CheckBox cb = new android.widget.CheckBox(act);
            String label = "Episode " + String.valueOf(e.num);
            if (e.t.length() > 0) {
                String clean = e.t.replaceAll("^Episode\\s*\\d+\\s*-\\s*", "");
                if (clean.length() > 0) label = label + " -- " + clean;
            }
            cb.setText(label);
            cb.setTextColor(Color.WHITE);
            cb.setTextSize(14);
            cb.setPadding((int) (10 * density), (int) (6 * density), 0, (int) (6 * density));
            cb.setChecked(e.num == current);
            boxes.add(cb);
            list.addView(cb, new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT));
        }
        sc.addView(list, new android.view.ViewGroup.LayoutParams(
                android.view.ViewGroup.LayoutParams.MATCH_PARENT,
                android.view.ViewGroup.LayoutParams.WRAP_CONTENT));
        android.widget.LinearLayout.LayoutParams scLp = new android.widget.LinearLayout.LayoutParams(
                android.view.ViewGroup.LayoutParams.MATCH_PARENT,
                (int) (300 * density));
        scLp.topMargin = (int) (4 * density);
        box.addView(sc, scLp);
        all.setOnCheckedChangeListener(new android.widget.CompoundButton.OnCheckedChangeListener() {
            @Override public void onCheckedChanged(android.widget.CompoundButton b, boolean on) {
                for (int i = 0; i < boxes.size(); i++) boxes.get(i).setChecked(on);
            }
        });

        // buttons: Cancel + red Download (N)
        LinearLayout row = new LinearLayout(act);
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setGravity(Gravity.END);
        LinearLayout.LayoutParams bp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT);
        bp.topMargin = (int) (18 * density);
        Button no = new Button(act);
        no.setText("Cancel");
        no.setAllCaps(false);
        no.setTextSize(14);
        no.setMinWidth(0);
        no.setMinimumWidth(0);
        no.setTextColor(Color.parseColor("#BBBBBB"));
        no.setBackgroundDrawable(themedButtonBg("#1E1E24"));
        LinearLayout.LayoutParams noP = new LinearLayout.LayoutParams(bp);
        noP.rightMargin = (int) (10 * density);
        final Button yes = new Button(act);
        yes.setText("Download (1)");
        yes.setAllCaps(false);
        yes.setTextSize(14);
        yes.setMinWidth(0);
        yes.setMinimumWidth(0);
        yes.setTextColor(Color.WHITE);
        yes.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        yes.setBackgroundDrawable(themedButtonBg("#E50914"));
        row.addView(no, noP);
        row.addView(yes, new LinearLayout.LayoutParams(bp));
        box.addView(row, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT));

        Runnable counter = new Runnable() {
            @Override public void run() {
                int n = 0;
                for (int i = 0; i < boxes.size(); i++) if (boxes.get(i).isChecked()) n++;
                yes.setText(n == 0 ? "Download" : "Download (" + String.valueOf(n) + ")");
                yes.setEnabled(n > 0);
                yes.setAlpha(n > 0 ? 1f : 0.45f);
            }
        };
        for (int i = 0; i < boxes.size(); i++) {
            final Runnable r = counter;
            final android.widget.CheckBox cb = boxes.get(i);
            cb.setOnCheckedChangeListener(new android.widget.CompoundButton.OnCheckedChangeListener() {
                @Override public void onCheckedChanged(android.widget.CompoundButton b, boolean on) { r.run(); }
            });
        }
        counter.run();

        final Dialog d = new Dialog(act);
        d.getWindow().setBackgroundDrawable(card);
        d.setContentView(box);
        int width = (int) (act.getResources().getDisplayMetrics().widthPixels * 0.90f);
        d.getWindow().setLayout(width, android.view.ViewGroup.LayoutParams.WRAP_CONTENT);
        no.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) { d.dismiss(); }
        });
        yes.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) {
                d.dismiss();
                int picked = 0;
                int skipped = 0;
                for (int i = 0; i < boxes.size(); i++) {
                    if (!boxes.get(i).isChecked()) continue;
                    Ep85 e = items.get(i);
                    String epTitle = seriesTitle + " ep" + String.valueOf(e.num);
                    // clean episode sub-title: "Episode 3 - Testing Her Faith"
                    // -> "Testing Her Faith"
                    String epName = e.t == null ? "" : e.t;
                    epName = epName.replaceAll("^Episode\\s*\\d+\\s*-\\s*", "").trim();
                    String dup = alreadyOwnedMessage(epTitle);
                    if (dup != null) { skipped++; continue; }
                    picked++;
                    String subUrl = "";
                    try {
                        subUrl = findSubUrlForMovie(epTitle, e.num);
                    } catch (Exception eS) { subUrl = ""; }
                    boolean ok = false;
                    try {
                        ok = DlSpeed85.startQuiet(act, e.url, epTitle, poster, subUrl, epName);
                    } catch (Exception eD) { ok = false; }
                    if (!ok) {
                        // engine refused: fall back to DownloadManager
                        try {
                            enqueueDownload(android.net.Uri.parse(e.url), epTitle, quality, poster, subUrl);
                        } catch (Exception eE) { }
                    }
                }
                Toast.makeText(act.getApplicationContext(),
                        "Downloading " + String.valueOf(picked) + " episode" + (picked == 1 ? "" : "s")
                                + (skipped > 0 ? (" -- " + String.valueOf(skipped) + " already downloaded") : "")
                                + " -- track it on My Downloads",
                        Toast.LENGTH_LONG).show();
            }
        });
        d.show();
    }

    // Non-null when the SAME title (and episode) is already on the device,
    // either finished in the engine registry or successful in
    // DownloadManager. Deleting the download removes the record, so the
    // user can download it again.
    private static String alreadyOwnedMessage(String title) {
        if (title == null) return null;
        if (title.length() == 0) return null;
        try {
            Context c = DlSpeed85.appContext();
            if (c == null) return null;
            int ep = episodeNumFromTitle(title);
            // engine registry (the downloads screen's own rows)
            java.util.ArrayList<String> ids = DlSpeed85.engineRowIds(c);
            for (int i = 0; i < ids.size(); i++) {
                String rid = ids.get(i);
                String[] m = DlSpeed85.readRow(c, rid);
                if (DlSpeed85.statusOf(rid) != DlSpeed85.ST_DONE) continue;
                String t = m[0] == null ? "" : m[0];
                if (t.length() == 0) continue;
                boolean sameTitle = t.equalsIgnoreCase(title);
                boolean sameEp = ep > 0
                        && ep == MainScreen85.episodeNumFromTitle(t)
                        && seriesKey(t).equalsIgnoreCase(seriesKey(title));
                if (sameTitle) return alreadyMsg(title);
                if (sameEp) return alreadyMsg(title);
            }
            // DownloadManager fallback rows
            android.app.DownloadManager dm = (android.app.DownloadManager)
                    c.getSystemService(Context.DOWNLOAD_SERVICE);
            if (dm != null) {
                android.database.Cursor cur = dm.query(new android.app.DownloadManager.Query());
                if (cur != null) {
                    while (cur.moveToNext()) {
                        if (cur.getInt(cur.getColumnIndexOrThrow(
                                android.app.DownloadManager.COLUMN_STATUS))
                                != android.app.DownloadManager.STATUS_SUCCESSFUL) continue;
                        String[] mm = readDlMeta86(c, cur.getLong(cur.getColumnIndexOrThrow(
                                android.app.DownloadManager.COLUMN_ID)));
                        String t = mm[0] == null ? "" : mm[0];
                        if (t.length() == 0) continue;
                        boolean sameTitle = t.equalsIgnoreCase(title);
                        boolean sameEp = ep > 0
                                && ep == MainScreen85.episodeNumFromTitle(t)
                                && seriesKey(t).equalsIgnoreCase(seriesKey(title));
                        if (sameTitle) { cur.close(); return alreadyMsg(title); }
                        if (sameEp) { cur.close(); return alreadyMsg(title); }
                    }
                    cur.close();
                }
            }
        } catch (Exception e) { }
        return null;
    }

    private static String alreadyMsg(String title) {
        return "\"" + title + "\" is already in My Downloads.\n\nOpen it from the Downloaded tab -- no need to download it again.";
    }

    // series grouping key: title with the episode marker stripped
    private static String seriesKey(String t) {
        String s = String.valueOf(t).toLowerCase(Locale.US);
        s = s.replaceAll("\\bep?\\.?\\s*\\d{1,2}\\b", " ");
        return s.replaceAll("\\s+", " ").trim();
    }

    // "Series Name ep3" -> 3. 0 = not an episode.
    public static int episodeNumFromTitle(String t) {
        if (t == null) return 0;
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("\\bep?\\.?\\s*(\\d{1,2})\\b").matcher(t.toLowerCase());
        if (m.find()) {
            try { return Integer.parseInt(m.group(1)); } catch (Exception e) { return 0; }
        }
        return 0;
    }

    private void showConfirmDialog(final String url, final String title, final String quality, final String poster, final long sizeBytes, final String subUrl) {
        float density = act.getResources().getDisplayMetrics().density;
        LinearLayout box = new LinearLayout(act);
        box.setOrientation(LinearLayout.HORIZONTAL);
        box.setPadding((int) (22 * density), (int) (20 * density), (int) (20 * density), (int) (18 * density));
        GradientDrawable card = new GradientDrawable();
        card.setColor(Color.parseColor("#141418"));
        card.setCornerRadius(18 * density);
        card.setStroke(1, Color.parseColor("#2A2A30"));

        // LEFT: poster thumbnail (same art as the movie card on the site)
        ImageView pv = new ImageView(act);
        LinearLayout.LayoutParams pvLp = new LinearLayout.LayoutParams((int) (92 * density), (int) (138 * density));
        pvLp.rightMargin = (int) (16 * density);
        pv.setScaleType(ImageView.ScaleType.CENTER_CROP);
        pv.setBackgroundDrawable(posterBg());
        loadPosterInto(pv, poster, (int) (92 * density), (int) (138 * density));

        // RIGHT: title, quality, size, note, buttons
        LinearLayout right = new LinearLayout(act);
        right.setOrientation(LinearLayout.VERTICAL);

        TextView tTitle = new TextView(act);
        tTitle.setText("Download");
        tTitle.setTextColor(Color.parseColor("#E50914"));
        tTitle.setTextSize(19);
        tTitle.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);

        TextView tMsg = new TextView(act);
        String msg = title;
        if (quality != null && quality.length() > 0) msg = msg + "\nQuality: " + quality;
        msg = msg + "\nSize: " + (sizeBytes > 0 ? humanSize(sizeBytes) : "checking...");
        msg = msg + "\n\nSaved inside DEYMFLIX only. Watch it anytime from My Downloads.";
        tMsg.setText(msg);
        tMsg.setTextColor(Color.WHITE);
        tMsg.setTextSize(15);
        tMsg.setLineSpacing(4 * density, 1f);
        LinearLayout.LayoutParams mp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        mp.topMargin = (int) (14 * density);

        LinearLayout btnRow = new LinearLayout(act);
        btnRow.setOrientation(LinearLayout.HORIZONTAL);
        btnRow.setGravity(android.view.Gravity.END);
        // WRAP_CONTENT so "Download" never truncates to "Downl oad" on
        // narrow screens (weight=1 left each button too little room).
        LinearLayout.LayoutParams bp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        bp.topMargin = (int) (20 * density);

        Button no = new Button(act);
        no.setText("Cancel");
        no.setAllCaps(false);
        no.setTextSize(14);
        no.setMinWidth(0);
        no.setMinimumWidth(0);
        no.setTextColor(Color.parseColor("#BBBBBB"));
        no.setBackgroundDrawable(themedButtonBg("#1E1E24"));
        LinearLayout.LayoutParams noP = new LinearLayout.LayoutParams(bp);
        noP.rightMargin = (int) (10 * density);

        Button yes = new Button(act);
        yes.setText("Download");
        yes.setAllCaps(false);
        yes.setTextSize(14);
        yes.setMinWidth(0);
        yes.setMinimumWidth(0);
        yes.setTextColor(Color.WHITE);
        yes.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        yes.setBackgroundDrawable(themedButtonBg("#E50914"));

        btnRow.addView(no, noP);
        btnRow.addView(yes, new LinearLayout.LayoutParams(bp));
        right.addView(tTitle);
        right.addView(tMsg, mp);
        right.addView(btnRow, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT));
        box.addView(pv, pvLp);
        box.addView(right, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT, 1f));

        final Dialog d = new Dialog(act);
        d.getWindow().setBackgroundDrawable(card);
        d.setContentView(box);
        int width = (int) (act.getResources().getDisplayMetrics().widthPixels * 0.90f);
        d.getWindow().setLayout(width, android.view.ViewGroup.LayoutParams.WRAP_CONTENT);

        no.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) { d.dismiss(); }
        });
        yes.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) {
                d.dismiss();
                enqueueDownload(android.net.Uri.parse(url), title, quality, poster, subUrl);
            }
        });
        d.show();
    }

    private GradientDrawable themedButtonBg(String fill) {
        GradientDrawable g = new GradientDrawable();
        g.setColor(Color.parseColor(fill));
        g.setCornerRadius(12f * act.getResources().getDisplayMetrics().density);
        return g;
    }

    // =======================================================================
    //  ENQUEUE (PRIVATE STORAGE + RANDOM FILENAMES)
    //  Files land in the app PRIVATE dir:
    //    Android/data/com.deymflix.eu.cc/files/Movies/Deymflix
    //  Invisible to gallery and VLC, removed on uninstall. ANTI-COPY: random
    //  names (dfx_x7k2m9q4.mp4) -- no movie titles outside the app.
    // =======================================================================
    private void enqueueDownload(final android.net.Uri uri, final String title, final String quality, final String poster, final String subUrl) {
        // Belt-and-braces: if the pre-check found no subtitle (network blip
        // at dialog time), re-resolve right now before starting.
        String useSub = subUrl == null ? "" : subUrl;
        if (useSub.length() == 0) {
            try {
                useSub = findSubUrlForMovie(title, episodeNumFromTitle(title));
            } catch (Exception eSub) { useSub = ""; }
        }
        // v1.5: the fast 4-connection engine downloads first (it also runs
        // the storage guard and owns the Retry/Insufficient Storage flow on
        // the Downloads screen). DownloadManager stays as the fallback.
        try {
            if (DlSpeed85.start(act, uri.toString(), title, poster, useSub)) return;
        } catch (Exception eEng) { }
        try {
            DownloadManager.Request req = new DownloadManager.Request(uri);
            // HIDDEN: nothing in the notification shade -- progress lives on
            // the My Downloads screen instead.
            req.setNotificationVisibility(DownloadManager.Request.VISIBILITY_HIDDEN);
            req.setTitle("DEYMFLIX");
            req.setDescription("Saving for offline viewing");
            String fileName = "dfx_" + randomToken86() + ".mp4";
            File dir = new File(act.getExternalFilesDir(Environment.DIRECTORY_MOVIES), "Deymflix");
            dir.mkdirs();
            req.setDestinationUri(android.net.Uri.fromFile(new File(dir, fileName)));
            req.setMimeType("video/mp4");
            final String subName = fileName.replace(".mp4", ".srt");
            DownloadManager dm = (DownloadManager) act.getSystemService(Context.DOWNLOAD_SERVICE);
            final long newId = dm.enqueue(req);
            saveDlMeta86(newId, title, poster, subName);
            Toast.makeText(act.getApplicationContext(),
                    "Downloading " + title + " -- track it on My Downloads",
                    Toast.LENGTH_LONG).show();
            // The subtitle travels WITH the movie (same folder, same name .srt)
            if (useSub.length() > 0) {
                enqueueSubtitleDownload(dm, useSub, subName, newId);
            }
        } catch (Exception e) {
            Toast.makeText(act.getApplicationContext(),
                    "Download failed: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }

    private void enqueueSubtitleDownload(DownloadManager dm, final String subUrl, final String subName, final long videoId) {
        try {
            DownloadManager.Request sreq = new DownloadManager.Request(android.net.Uri.parse(subUrl));
            sreq.setNotificationVisibility(DownloadManager.Request.VISIBILITY_HIDDEN);
            sreq.setTitle("DEYMFLIX");
            sreq.setDescription("Subtitles for offline viewing");
            File dir = new File(act.getExternalFilesDir(Environment.DIRECTORY_MOVIES), "Deymflix");
            dir.mkdirs();
            sreq.setDestinationUri(android.net.Uri.fromFile(new File(dir, subName)));
            sreq.setMimeType("application/x-subrip");
            long sid = dm.enqueue(sreq);
            // Link the subtitle row to its video id so cleanup follows the video
            SharedPreferences p = act.getSharedPreferences("deymflix_dl", 0);
            p.edit().putString("subsister_" + String.valueOf(sid), String.valueOf(videoId)).apply();
        } catch (Exception e2) { }
    }

    // =======================================================================
    //  LOCAL SUBTITLE MATCHING (mirrors player.html)
    // =======================================================================
    private static String normalizeSubNameForSub(String s) {
        String out = (s == null ? "" : s).toLowerCase();
        out = out.replaceAll("[^A-Za-z0-9 ]", "");
        out = out.replaceAll("[._\\-]+", " ");
        out = out.replaceAll("\\s+", " ").trim();
        return out;
    }

    public static boolean subNameMatchesMovie(String fileName, String title, int episodeNum) {
        String[] parts = String.valueOf(fileName).split("/");
        String dir = "";
        for (int i = 0; i < parts.length - 1; i++) {
            if (i > 0) dir = dir + " ";
            dir = dir + parts[i];
        }
        String base = parts[parts.length - 1];
        String f = normalizeSubNameForSub(base);
        String dd = normalizeSubNameForSub(dir);
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
        String hay = dd.length() > 0 ? dd + " " + f : f;
        if (hay.indexOf(t) != -1) return true;
        return t.indexOf(f) != -1;
    }

    // Site subtitle URL with SAFE encoding: GitHub Pages 404s on '+' for
    // spaces -- it needs %20 (folder slashes stay real slashes).
    public static String subFileUrl(String name) {
        try {
            String enc = java.net.URLEncoder.encode(name, "UTF-8")
                    .replace("+", "%20")
                    .replace("%2F", "/");
            return "https://deymflix.eu.cc/subtitles/" + enc;
        } catch (Exception e) {
            return "";
        }
    }

    // Every plausible subtitle file name for a title: manifest matches when
    // the manifest is deployed, PLUS straight filename guesses from the
    // site's naming convention ("Title Engsub.srt", "Series/Title PHsub.srt",
    // "Title-en.srt"). Ranked Engsub-first, deduped. This is what makes
    // subtitles work even when the manifest 404s.
    public static java.util.ArrayList<String> subCandidatesFor(String title, int ep) {
        java.util.ArrayList<String> out = new java.util.ArrayList<String>();
        if (title == null) return out;
        if (title.length() == 0) return out;
        java.util.ArrayList<String> all = new java.util.ArrayList<String>();
        // 1) the deployed manifest (may be missing -- that is fine)
        try {
            String json = fetchManifest85();
            if (json.length() > 0) {
                int idx = json.indexOf("\"files\"");
                if (idx >= 0) {
                    int arrStart = json.indexOf('[', idx);
                    int arrEnd = json.indexOf(']', arrStart);
                    if (arrStart >= 0 && arrEnd >= 0) {
                        String arr = json.substring(arrStart + 1, arrEnd);
                        String[] pieces = arr.split("\"");
                        for (int pi = 1; pi < pieces.length; pi += 2) {
                            if (subNameMatchesMovie(pieces[pi], title, ep)) all.add(pieces[pi]);
                        }
                    }
                }
            }
        } catch (Exception eM) { }
        // 2) naming-convention guesses
        String series = title;
        if (ep > 0) {
            series = title.replaceAll("\\bep?\\.?\\s*\\d{1,2}\\b", " ");
            series = series.replaceAll("\\s+", " ").trim();
        }
        if (ep > 0) {
            all.add(series + "/" + title + " Engsub.srt");
            all.add(series + "/" + title + " PHsub.srt");
            all.add(series + "/" + title + ".srt");
            all.add(title + " Engsub.srt");
            all.add(title + " PHsub.srt");
        } else {
            all.add(title + " Engsub.srt");
            all.add(title + " PHsub.srt");
            all.add(title + ".srt");
            all.add(title + "-en.srt");
        }
        // rank Engsub first, then PHsub, then unlabeled; drop duplicates
        for (int rank = 0; rank <= 2; rank++) {
            for (int i = 0; i < all.size(); i++) {
                String n = all.get(i);
                if (localSubLangRank(n) != rank) continue;
                if (out.indexOf(n) == -1) out.add(n);
            }
        }
        return out;
    }

    private static String fetchManifest85() {
        try {
            URL u = new URL("https://deymflix.eu.cc/subtitles/manifest.json");
            HttpURLConnection c = (HttpURLConnection) u.openConnection();
            c.setConnectTimeout(6000);
            c.setReadTimeout(6000);
            c.setRequestProperty("User-Agent", "DeymflixApp/1.4");
            int code = c.getResponseCode();
            if (code != 200) { c.disconnect(); return ""; }
            java.io.BufferedReader br = new java.io.BufferedReader(
                    new java.io.InputStreamReader(c.getInputStream(), "UTF-8"));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) sb.append(line);
            br.close();
            c.disconnect();
            return sb.toString();
        } catch (Exception e) {
            return "";
        }
    }

    // English (Engsub) first, then Tagalog (PHsub), then unlabeled.
    public static int localSubLangRank(String fileName) {
        String f = String.valueOf(fileName).toLowerCase();
        if (f.indexOf("engsub") != -1) return 0;
        if (f.endsWith("-en.srt")) return 0;
        if (f.indexOf(".en.") != -1) return 0;
        if (f.indexOf("phsub") != -1) return 1;
        if (f.indexOf("tagalog") != -1) return 1;
        return 2;
    }

    // Fully static: the player (opened from DownloadsActivity) needs this
    // even when no MainScreen85 instance is alive. Returns the URL of the
    // FIRST candidate that actually exists on the site (probed with a HEAD
    // request) -- works even when the manifest is not deployed.
    public static String findSubUrlForMovie(final String title, final int episodeNum) {
        try {
            java.util.ArrayList<String> cands = subCandidatesFor(title, episodeNum);
            for (int i = 0; i < cands.size(); i++) {
                String url = subFileUrl(cands.get(i));
                if (url.length() == 0) continue;
                if (urlExists(url)) return url;
            }
        } catch (Exception e) { }
        return "";
    }

    // HEAD probe with a small cache so one title never gets probed twice.
    private static final java.util.HashMap<String, Boolean> urlProbeCache =
            new java.util.HashMap<String, Boolean>();

    private static boolean urlExists(String url) {
        synchronized (urlProbeCache) {
            Boolean hit = urlProbeCache.get(url);
            if (hit != null) return hit.booleanValue();
        }
        boolean ok = false;
        try {
            URL u = new URL(url);
            HttpURLConnection c = (HttpURLConnection) u.openConnection();
            c.setRequestMethod("HEAD");
            c.setConnectTimeout(6000);
            c.setReadTimeout(6000);
            c.setRequestProperty("User-Agent", "DeymflixApp/1.4");
            ok = c.getResponseCode() == 200;
            c.disconnect();
        } catch (Exception e) {
            ok = false;
        }
        synchronized (urlProbeCache) {
            urlProbeCache.put(url, Boolean.valueOf(ok));
        }
        return ok;
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

    // =======================================================================
    //  SMALL HELPERS
    // =======================================================================
    private String humanSize(long bytes) {
        if (bytes <= 0) return "-";
        double b = bytes;
        String[] units = { "B", "KB", "MB", "GB" };
        int i = 0;
        while (b >= 1024 && i < units.length - 1) { b /= 1024; i++; }
        return String.format(Locale.US, "%.1f %s", b, units[i]);
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

    // =======================================================================
    //  POSTER (confirm dialog) + DOWNLOAD REGISTRY
    //  Same "deymflix_dl" prefs the Downloads screen reads.
    // =======================================================================
    private static final HashMap<String, Bitmap> bitmapCache86 = new HashMap<String, Bitmap>();

    private void loadPosterInto(final ImageView target, final String url, final int wPx, final int hPx) {
        if (url == null) return;
        if (url.length() == 0) return;
        Bitmap cached86 = bitmapCache86.get(url);
        if (cached86 != null) {
            target.setImageBitmap(cached86);
            return;
        }
        new Thread(new Runnable() { @Override public void run() {
            try {
                URL u = new URL(url);
                HttpURLConnection c = (HttpURLConnection) u.openConnection();
                c.setConnectTimeout(8000);
                c.setReadTimeout(8000);
                c.setRequestProperty("User-Agent", "DeymflixApp/1.4");
                InputStream in = new BufferedInputStream(c.getInputStream());
                final Bitmap bmp = BitmapFactory.decodeStream(in);
                in.close();
                c.disconnect();
                if (bmp == null) return;
                final Bitmap scaled = Bitmap.createScaledBitmap(bmp, wPx, hPx, true);
                bitmapCache86.put(url, scaled);
                act.runOnUiThread(new Runnable() { @Override public void run() {
                    try { target.setImageBitmap(scaled); } catch (Exception e) { }
                }});
            } catch (Exception e) { /* keep placeholder */ }
        }}).start();
    }

    private GradientDrawable posterBg() {
        GradientDrawable g = new GradientDrawable();
        g.setColor(Color.parseColor("#1E1E24"));
        g.setCornerRadius(8f * act.getResources().getDisplayMetrics().density);
        return g;
    }

    // Drop registry rows whose download finished more than 7 days ago.
    private void purgeOldDlMeta86() {
        try {
            DownloadManager dm = (DownloadManager) act.getSystemService(Context.DOWNLOAD_SERVICE);
            SharedPreferences p = act.getSharedPreferences("deymflix_dl", 0);
            android.database.Cursor c = dm.query(new DownloadManager.Query().setFilterByStatus(DownloadManager.STATUS_SUCCESSFUL));
            java.util.HashSet<String> live = new java.util.HashSet<String>();
            if (c != null) {
                while (c.moveToNext()) {
                    long id = c.getLong(c.getColumnIndexOrThrow(DownloadManager.COLUMN_ID));
                    long when = c.getLong(c.getColumnIndexOrThrow(DownloadManager.COLUMN_LAST_MODIFIED_TIMESTAMP)) * 1000L;
                    if (System.currentTimeMillis() - when < 604800000L) live.add(String.valueOf(id));
                }
                c.close();
            }
            SharedPreferences.Editor ed = p.edit();
            boolean changed = false;
            for (java.util.Map.Entry<String, ?> e : p.getAll().entrySet()) {
                String k = String.valueOf(e.getKey());
                // "M" rows belong to the DlSpeed85 engine (it manages its own
                // lifecycle) and "subsister_" rows link subtitles to videos.
                // no pipe chars: the either-test is written as two ifs
                if (k.startsWith("subsister_")) continue;
                if (k.startsWith("M")) continue;
                if (!live.contains(k)) { ed.remove(k); changed = true; }
            }
            // Drop subtitle-link rows whose VIDEO row is gone
            for (java.util.Map.Entry<String, ?> e : p.getAll().entrySet()) {
                String k = String.valueOf(e.getKey());
                if (!k.startsWith("subsister_")) continue;
                String vid = String.valueOf(e.getValue());
                if (!live.contains(vid)) { ed.remove(k); changed = true; }
            }
            if (changed) ed.apply();
        } catch (Exception e2) { }
    }

    // id -> {title, poster, subName} (static so the duplicate-check can use it)
    private static String[] readDlMeta86(Context c, long id) {
        String raw = c.getSharedPreferences("deymflix_dl", 0)
                .getString(String.valueOf(id), "");
        String title = raw == null ? "" : raw;
        String poster = "";
        String sub = "";
        int cutSub = title.indexOf("[SUB]");
        if (cutSub >= 0) { sub = title.substring(cutSub + 5); title = title.substring(0, cutSub); }
        int cutPoster = title.indexOf("[POSTER]");
        if (cutPoster >= 0) { poster = title.substring(cutPoster + 8); title = title.substring(0, cutPoster); }
        return new String[] { title, poster, sub };
    }

    // id -> "title[POSTER-url][SUB-name]" in app-private prefs
    private void saveDlMeta86(long id, String title, String poster, String subName) {
        SharedPreferences p = act.getSharedPreferences("deymflix_dl", 0);
        String cleanTitle = (title == null ? "Video" : title).split("\n")[0];
        p.edit().putString(String.valueOf(id),
                cleanTitle + "[POSTER]" + (poster == null ? "" : poster)
                + "[SUB]" + (subName == null ? "" : subName)).apply();
    }
}
