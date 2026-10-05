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
import android.graphics.Typeface;
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
        // ── FIRST-LAUNCH PERMISSION GATES ──
        // The app is unusable until "Install unknown apps" is enabled for
        // DEYMFLIX: without it, Android BLOCKS every self-update (and any
        // install of new versions), which breaks the app for good after the
        // first release. The gate is a non-dismissible branded screen with a
        // one-tap shortcut to the exact Android switch. boot() only runs
        // after the gate passes.
        log85("app", "start v" + versionName85(act) + " (code " + versionCode85(act) + ")");
        runFirstLaunchGates(act, new Runnable() { @Override public void run() {
            MainScreen85 m = new MainScreen85(act);
            INSTANCES.put(act, m);
            m.boot();
            // force-update: block the app when the site manifest is newer
            DlUpdate85.checkAndEnforce(act);
            // friendly one-time notifications prompt (update notices land)
            maybeAskNotifications(act);
        }});
    }

    // =======================================================================
    //  PERMISSION GATES (first launch + revocation guard)
    // =======================================================================
    private static android.app.Dialog installGateDialog = null;
    private static Runnable installGateContinuation = null;

    private static boolean canInstallPackages(final Activity act) {
        try {
            if (android.os.Build.VERSION.SDK_INT >= 26) {
                return act.getPackageManager().canRequestPackageInstalls();
            }
            // Android 7 and below: unknown sources is a global install-time
            // checkbox -- nothing to pre-authorize at app level.
            return true;
        } catch (Exception e) {
            return false; // unsure -> keep the gate up (fail-closed by design)
        }
    }

    private static void runFirstLaunchGates(final Activity act, final Runnable onDone) {
        try {
            if (canInstallPackages(act)) { onDone.run(); return; }
        } catch (Exception e) { }
        installGateContinuation = onDone;
        showInstallGate(act);
    }

    // Non-dismissible full-screen gate. The ONLY way forward is the Android
    // switch; returning from Settings auto-continues (handled in resume()).
    private static void showInstallGate(final Activity act) {
        try {
            if (installGateDialog != null) {
                try { installGateDialog.dismiss(); } catch (Exception e) { }
                installGateDialog = null;
            }
            if (act.isFinishing()) return;
            float d = act.getResources().getDisplayMetrics().density;
            LinearLayout root = new LinearLayout(act);
            root.setOrientation(LinearLayout.VERTICAL);
            root.setGravity(Gravity.CENTER_HORIZONTAL);
            root.setBackgroundColor(Color.parseColor("#0B0B0F"));
            int pad = (int) (28 * d);
            root.setPadding(pad, (int) (60 * d), pad, pad);

            View mark = new MainScreen85.HexagonLogoView(act);
            root.addView(mark, new LinearLayout.LayoutParams(
                    (int) (72 * d), (int) (72 * d)));

            TextView title = new TextView(act);
            title.setText("Welcome to DEYMFLIX");
            title.setTextColor(Color.WHITE);
            title.setTextSize(22);
            title.setTypeface(Typeface.DEFAULT_BOLD);
            title.setGravity(Gravity.CENTER);
            LinearLayout.LayoutParams tp = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
            tp.topMargin = (int) (22 * d);
            root.addView(title, tp);

            TextView msg = new TextView(act);
            msg.setText("One quick setting is needed before you start:\n\n\u25CF  Automatic app updates\n\u25CF  Installing new versions without problems\n\u25CF  Downloads that keep working\n\nAndroid requires DEYMFLIX to be allowed to \"Install unknown apps\". It is safe -- this permission belongs to DEYMFLIX only and is used exclusively to install DEYMFLIX updates.");
            msg.setTextColor(Color.parseColor("#B9B9C2"));
            msg.setTextSize(15);
            msg.setLineSpacing(3 * d, 1f);
            LinearLayout.LayoutParams mp = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
            mp.topMargin = (int) (18 * d);
            root.addView(msg, mp);

            TextView step = new TextView(act);
            step.setText("Tap the button below, then switch ON\n\"Allow from this source\" and come back.");
            step.setTextColor(Color.parseColor("#FF8A90"));
            step.setTextSize(14);
            step.setTypeface(Typeface.DEFAULT_BOLD);
            step.setGravity(Gravity.CENTER);
            step.setLineSpacing(3 * d, 1f);
            LinearLayout.LayoutParams sp = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
            sp.topMargin = (int) (18 * d);
            root.addView(step, sp);

            Button allow = new Button(act);
            allow.setText("ALLOW INSTALLING");
            allow.setAllCaps(true);
            allow.setTextColor(Color.WHITE);
            allow.setTypeface(Typeface.DEFAULT_BOLD);
            allow.setTextSize(15);
            GradientDrawable rb = new GradientDrawable();
            rb.setColor(Color.parseColor("#E50914"));
            rb.setCornerRadius(14 * d);
            allow.setBackgroundDrawable(rb);
            LinearLayout.LayoutParams ap = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT, (int) (54 * d));
            ap.topMargin = (int) (30 * d);
            root.addView(allow, ap);

            final android.app.Dialog gate = new android.app.Dialog(act,
                    android.R.style.Theme_Black_NoTitleBar_Fullscreen);
            gate.setContentView(root);
            gate.setCancelable(false);
            gate.setCanceledOnTouchOutside(false);
            installGateDialog = gate;

            allow.setOnClickListener(new View.OnClickListener() {
                @Override public void onClick(View v) {
                    try {
                        act.startActivity(new android.content.Intent(
                                android.provider.Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                                android.net.Uri.parse("package:" + act.getPackageName())));
                    } catch (Exception e) {
                        try {
                            act.startActivity(new android.content.Intent(
                                    android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                                    android.net.Uri.parse("package:" + act.getPackageName())));
                        } catch (Exception e2) { }
                    }
                }
            });
            gate.show();
        } catch (Exception e) {
            // never dead-end: if the gate itself cannot render, continue
            Runnable cont = installGateContinuation;
            installGateContinuation = null;
            if (cont != null) cont.run();
        }
    }

    // resume() re-checks the gate: covers BOTH the return from Settings
    // (first launch) and a user revoking the toggle later mid-session.
    private static void checkInstallGateOnResume(final Activity act) {
        try {
            boolean ok = canInstallPackages(act);
            if (ok) {
                if (installGateDialog != null) {
                    try { installGateDialog.dismiss(); } catch (Exception e) { }
                    installGateDialog = null;
                }
                Runnable cont = installGateContinuation;
                installGateContinuation = null;
                if (cont != null) cont.run();
            } else {
                if (installGateDialog == null) {
                    installGateContinuation = null; // app already booted behind
                    showInstallGate(act);
                }
            }
        } catch (Exception e) { }
    }

    // One-time friendly notifications prompt (Android 13+): update notices.
    private static void maybeAskNotifications(final Activity act) {
        try {
            SharedPreferences p = act.getSharedPreferences("deymflix_perms", 0);
            if (p.getBoolean("notif_asked", false)) return;
            p.edit().putBoolean("notif_asked", true).apply();
            if (android.os.Build.VERSION.SDK_INT < 33) return;
            if (act.checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS)
                    == android.content.pm.PackageManager.PERMISSION_GRANTED) return;
            act.requestPermissions(new String[]{ android.Manifest.permission.POST_NOTIFICATIONS }, 4102);
        } catch (Exception e) { }
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
        // permission gate re-check FIRST: returning from the Android settings
        // screen lands here, and a mid-session revocation re-locks the app
        checkInstallGateOnResume(act);
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

    // Splash shows for AT LEAST 2 seconds, AND never exits before the site
    // has actually finished loading (no more white flash after the logo).
    private static final long SPLASH_MIN_MS = 2000L;
    private static final long SPLASH_MAX_MS = 15000L; // absolute safety cap
    private long splashShownAt = 0L;
    private volatile boolean pageReady85 = false;   // set on onPageFinished

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
        // HTML must never be served cache-only: a site deploy has to reach the
        // app within its 10-minute window, not "whenever the cache expires".
        try { wv.getSettings().setCacheMode(android.webkit.WebSettings.LOAD_DEFAULT); }
        catch (Throwable tC) { }
        // BLACK FROM FRAME ONE: the WebView paints white until the site's dark
        // CSS arrives -- that was the white flash after the splash. Paint the
        // whole stack (webview + window) in the brand dark so even a broken
        // load shows black, never white.
        wv.setBackgroundColor(Color.parseColor("#0B0B0F"));
        act.getWindow().setBackgroundDrawable(new android.graphics.drawable.ColorDrawable(Color.parseColor("#0B0B0F")));
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
        // The site parses "DeymflixApp/<versionCode>" out of this token, so
        // per-build features (the What's New popup) key to the INSTALLED build
        // instead of a number someone has to remember to bump by hand.
        String baseUa = wv.getSettings().getUserAgentString();
        if (baseUa != null && !baseUa.contains("DeymflixApp")) {
            String uaCode85 = "1";
            try {
                android.content.pm.PackageInfo pi85 = act.getPackageManager()
                        .getPackageInfo(act.getPackageName(), 0);
                uaCode85 = String.valueOf(pi85.versionCode);
            } catch (Exception e85) { }
            wv.getSettings().setUserAgentString(baseUa + " DeymflixApp/" + uaCode85);
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
                        "videasy.net", "videasy.to", "vidlink.pro", "autoembed.cc",
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
            // ── TOP-FRAME NAVIGATION GUARD ──
            // Blocks ALL top-frame navigation away from our player after the
            // initial load — including from ALLOWED hosts. This is what stops
            // an ad iframe inside an embed from dragging the whole player to a
            // different page (the "Confirm Navigation" popups / lost player
            // bug). Everything is cancelled SILENTLY: no dialog, no lost page.
            private boolean isInternalNavigation(String url) {
                try {
                    android.net.Uri u = android.net.Uri.parse(url == null ? "" : url);
                    String s = u.getScheme();
                    if (s == null) return false;
                    s = s.toLowerCase();
                    // first load of our own site unlocks the guard
                    if ("http".equals(s) || "https".equals(s)) {
                        String h = u.getHost();
                        if (h != null && (h.equalsIgnoreCase("deymflix.eu.cc") || h.endsWith(".deymflix.eu.cc"))) {
                            return true;
                        }
                        return false;
                    }
                    // in-page anchors, asset pages (offline.html) and JS stay
                    // functional; intent:// and mailto: stay cancelled exactly
                    // like the previous guard did
                    return "about".equals(s) || "data".equals(s) || "blob".equals(s)
                            || "javascript".equals(s) || "file".equals(s);
                } catch (Throwable t) {
                    return false;
                }
            }
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (!isInternalNavigation(url)) {
                    // cancel silently — never let the page leave our player
                    return true;
                }
                return false;
            }
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, android.webkit.WebResourceRequest req) {
                String u = req.getUrl() == null ? "" : req.getUrl().toString();
                if (!isInternalNavigation(u)) {
                    return true;
                }
                return false;
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

            // ── UNMUTE+PLAY INJECTION (network-level page rewriting) ──
            // Provider players (VidLink etc.) boot their autoplay muted. Their
            // API is one-way, so the page can't command them. Instead we patch
            // the provider document ITSELF as it streams through this firewall:
            // every <video> is force-unmuted, volume 1, and play() is retried
            // for 90s. A play() hook unmutes before their player's own autoplay
            // call, so playback starts WITH SOUND (the WebView allows unmuted
            // autoplay). Re-applies on EVERY episode change — each episode is a
            // fresh document request, freshly patched.
            private final java.util.HashSet<String> INJECT_HOSTS = new java.util.HashSet<>(java.util.Arrays.asList(
                "vidlink.pro", "player.videasy.net", "vidsrc.cc", "vidsrc.su", "vidsrc.in",
                "player.autoembed.cc", "multiembed.mov", "www.2embed.cc"
            ));
            private final String UNMUTE_JS =
                "<script>(function(){var n=0;var iv=setInterval(function(){n++;try{var vs=document.querySelectorAll('video');" +
                "for(var i=0;i<vs.length;i++){var v=vs[i];if(v.muted){v.muted=false;}v.volume=1;" +
                "if(v.paused){var p=v.play();if(p&&p.catch){p.catch(function(e){});}}}}catch(e){}" +
                "if(n>90)clearInterval(iv);},1000);" +
                "try{var pp=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){" +
                "try{this.muted=false;this.volume=1;}catch(e){}return pp.apply(this,arguments);};}catch(e){}" +
                "try{var mo=new MutationObserver(function(){try{var vs=document.querySelectorAll('video');" +
                "for(var i=0;i<vs.length;i++){var v=vs[i];if(v.muted){v.muted=false;}v.volume=1;" +
                "if(v.paused){var p=v.play();if(p&&p.catch){p.catch(function(e){});}}}}catch(e){}});" +
                "mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}})();</script>";

            private android.webkit.WebResourceResponse injectUnmute(android.webkit.WebResourceRequest request, String url) {
                java.net.HttpURLConnection c = null;
                try {
                    java.net.URL u = new java.net.URL(url);
                    c = (java.net.HttpURLConnection) u.openConnection();
                    c.setConnectTimeout(8000);
                    c.setReadTimeout(12000);
                    c.setInstanceFollowRedirects(true);
                    java.util.Map<String, String> rh = request.getRequestHeaders();
                    if (rh != null) {
                        String ua = rh.get("User-Agent");
                        if (ua != null) c.setRequestProperty("User-Agent", ua);
                        String acc = rh.get("Accept");
                        if (acc != null) c.setRequestProperty("Accept", acc);
                    }
                    if (c.getResponseCode() != 200) return null;
                    String ct = c.getContentType();
                    if (ct == null || !ct.toLowerCase().contains("text/html")) return null;
                    java.io.ByteArrayOutputStream bos = new java.io.ByteArrayOutputStream();
                    java.io.InputStream in = c.getInputStream();
                    byte[] buf = new byte[8192];
                    int r;
                    while ((r = in.read(buf)) > 0) bos.write(buf, 0, r);
                    in.close();
                    String html = new String(bos.toByteArray(), "UTF-8");
                    int idx = html.toLowerCase().lastIndexOf("</body>");
                    if (idx >= 0) {
                        html = html.substring(0, idx) + UNMUTE_JS + html.substring(idx);
                    } else {
                        html = html + UNMUTE_JS;
                    }
                    // serve plain utf-8 (we hold decompressed bytes)
                    return new android.webkit.WebResourceResponse("text/html", "utf-8",
                            new java.io.ByteArrayInputStream(html.getBytes("UTF-8")));
                } catch (Throwable t) {
                    return null; // fall through: WebView fetches normally
                } finally {
                    try { if (c != null) c.disconnect(); } catch (Throwable t2) {}
                }
            }

            @Override
            public android.webkit.WebResourceResponse shouldInterceptRequest(WebView view, android.webkit.WebResourceRequest request) {
                try {
                    android.net.Uri u0 = request.getUrl();
                    String host = u0 == null ? null : u0.getHost();
                    if (host != null && isAdHost(host)) {
                        return new android.webkit.WebResourceResponse(
                                "text/plain", "utf-8",
                                new java.io.ByteArrayInputStream(new byte[0]));
                    }
                    // embed capture: log playlists, lock on while armed
                    if (host != null && u0.toString().toLowerCase().contains(".m3u8")) {
                        try {
                            EMBED_RECENT_M3U8.add(u0.toString());
                            while (EMBED_RECENT_M3U8.size() > 12) EMBED_RECENT_M3U8.poll();
                        } catch (Exception eQ) { }
                        tryEmbedLock(u0.toString());
                    }
                    // BROADER NET: some providers serve plain .mp4 / .ts video
                    // segments instead of (or alongside) HLS playlists. IDM-style
                    // downloaders catch those too -- so while the capture window
                    // is armed, any big video-segment request locks the capture
                    // ("direct:" prefix = single-file download, not an HLS job).
                    if (embedCaptureArmed && embedCapturedM3u8 == null && host != null) {
                        String lowUrl = u0.toString().toLowerCase();
                        String path = u0.getPath();
                        boolean looksVideo = (path != null && (path.toLowerCase().contains(".ts") || path.toLowerCase().contains(".mp4")))
                                || lowUrl.contains(".ts?") || lowUrl.contains(".mp4?")
                                || lowUrl.endsWith(".ts") || lowUrl.endsWith(".mp4");
                        if (looksVideo) tryEmbedLock("direct:" + u0.toString());
                    }
                    // provider document: stream it through with the unmute patch
                    if (host != null && INJECT_HOSTS.contains(host)) {
                        java.util.Map<String, String> rh = request.getRequestHeaders();
                        String acc = rh != null ? rh.get("Accept") : null;
                        if (acc != null && acc.contains("text/html")) {
                            android.webkit.WebResourceResponse rr = injectUnmute(request, u0.toString());
                            if (rr != null) return rr;
                        }
                    }
                } catch (Throwable t) { /* never break loading */ }
                return null; // null = request proceeds normally
            }
            @Override
            public void onPageFinished(WebView view, String url) {
                if (swipe != null) swipe.setRefreshing(false);
                // page load COMPLETE (site or offline.html): only now may the
                // splash exit -- after the 2s minimum enforced in hideSplash()
                pageReady85 = true;
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
                // no immediate hideSplash(): wait for the (re)load to finish,
                // the offline page's onPageFinished, or the 15s safety cap
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

            // ── v1.7 -- MIC / MEDIA PERMISSION GRANT (Watch Party voice) ──
            // The site asks for the microphone through getUserMedia while the
            // Watch Party is live. A WebView routes that request HERE; if it
            // is never answered the request dies silently and voice chat just
            // does not work -- which is exactly what happened before 1.7.
            // Policy: only our own pages may capture, and only AUDIO.
            @Override
            public void onPermissionRequest(final android.webkit.PermissionRequest request) {
                try {
                    String origin = request.getOrigin() == null ? "" : request.getOrigin().toString();
                    if (!isOurCaptureOrigin(origin)) {
                        log85("mic", "capture denied for " + origin);
                        request.deny();
                        return;
                    }
                    java.util.ArrayList<String> want = new java.util.ArrayList<String>();
                    String[] res = request.getResources();
                    for (int i = 0; res != null && i < res.length; i++) {
                        if (android.webkit.PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(res[i])) want.add(res[i]);
                    }
                    if (want.isEmpty()) { request.deny(); return; }
                    if (!hasMic85(act)) {
                        // Keep the live request, ask Android, and grant the
                        // moment the user allows (the poll below) -- so a
                        // single tap on the party's mic button is enough.
                        pendingWebMic85 = request;
                        askMic85(act);
                        return;
                    }
                    request.grant(want.toArray(new String[0]));
                    log85("mic", "audio capture granted to " + origin);
                } catch (Throwable t) {
                    try { request.deny(); } catch (Throwable t2) { }
                }
            }

            @Override
            public void onPermissionRequestCanceled(android.webkit.PermissionRequest request) {
                if (pendingWebMic85 == request) pendingWebMic85 = null;
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

        // -- 7) JS BRIDGE (hardened) --
        // File access OFF: injected/provider JS must never touch local files.
        // SafeBrowsing ON: Chrome's malware/deceptive-site list guards the
        // WebView too. Everything else (JS, DOM storage) stays as configured.
        try { wv.getSettings().setAllowFileAccess(false); } catch (Exception eF) { }
        try { wv.getSettings().setAllowContentAccess(false); } catch (Exception eC) { }
        try { wv.getSettings().setSafeBrowsingEnabled(true); } catch (Exception eS) { }
        wv.addJavascriptInterface(getDeymflixBridge(), "DeymflixApp");

        // -- 8) DownloadListener: bare-link fallback (VALIDATED) --
        wv.setDownloadListener(new android.webkit.DownloadListener() {
            @Override
            public void onDownloadStart(final String url, String userAgent, String contentDisposition, String mimeType, final long contentLength) {
                act.runOnUiThread(new Runnable() { @Override public void run() {
                    // Only http(s) from a deymflix/embed context is honored;
                    // anything weird (ftp:, data:, javascript:) is dropped.
                    String u = url == null ? "" : url.trim().toLowerCase();
                    if (!u.startsWith("https://") && !u.startsWith("http://")) return;
                    // STREAMING-ONLY GATE (same rule as the JS bridge)
                    if (!isOwnMediaHost(url)) { showStreamOnlyDialog(guessTitleFromUrl(url)); return; }
                    confirmAndDownload(url, guessTitleFromUrl(url), "", "");
                }});
            }
        });

        // -- 8b) Purge stale download-registry rows (older than 7 days) --
        purgeOldDlMeta86();

        // -- 9) Load the site (the Me screen's tabs pass dfx_route) --
        log85("net", networkLabel85(act));
        String route85 = "index.html";
        try {
            String r85 = act.getIntent() == null ? null
                    : act.getIntent().getStringExtra("dfx_route");
            if (r85 != null) {
                r85 = r85.trim();
                // only our own page names may arrive this way
                if (r85.matches("[a-z0-9._-]+\\.html")) route85 = r85;
            }
        } catch (Throwable t) { }
        if (isNetworkAvailable()) {
            wv.loadUrl(siteUrl85(route85));
        } else {
            log85("net", "offline at boot -- bundled page");
            wv.loadUrl("file:///android_asset/offline.html");
        }

        // Remember the real content view so video-fullscreen can restore it
        mActivityRoot = ((android.view.ViewGroup) act.findViewById(android.R.id.content)).getChildAt(0);
    }

    // ── Site URLs: cache-busting token ───────────────────────────────────
    // Cloudflare hands the app's WebView HTML with max-age=600 and the JS with
    // 4 h, so after a site deploy the shell could keep rendering the RETIRED
    // page for hours (users saw the old navbar long after the update). Every
    // boot/route load now carries "dfxb=<installed build code>.<hour>": a brand
    // new URL each hour, so the HTML is always the current deploy while the
    // page's own assets keep their normal caching.
    private String dfxCacheToken85() {
        int code = 1;
        try {
            code = act.getPackageManager()
                    .getPackageInfo(act.getPackageName(), 0).versionCode;
        } catch (Throwable t) { }
        return "dfxb=" + code + "." + (System.currentTimeMillis() / 3600000L);
    }

    private String siteUrl85(String route) {
        String base = "https://deymflix.eu.cc/" + route;
        return base + (base.indexOf('?') >= 0 ? "&" : "?") + dfxCacheToken85();
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
        // the dfxb= cache-busting token must not hide "this is home" from Back
        String cleanUrl = currentUrl.split("[?#]")[0];
        boolean atHome = cleanUrl.equals("https://deymflix.eu.cc/");
        if (!atHome) atHome = cleanUrl.equals("https://deymflix.eu.cc/index.html");
        if (!atHome) atHome = cleanUrl.endsWith("/index.html");
        if (!atHome) atHome = currentUrl.startsWith("file:///android_asset/");
        if (atHome) {
            showExitDialog();
        } else if (wvB.canGoBack()) {
            wvB.goBack();
        } else {
            wvB.loadUrl(siteUrl85("index.html"));
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
            wvR.loadUrl(siteUrl85("index.html"));
        }
        checkRendererAlive(wvR);
    }

    // -- frozen-renderer recovery -------------------------------------------
    // The OS can freeze an app's page while it is in the background. What the
    // user is left looking at is the LAST PAINTED frame: the poster rows never
    // finished building, the nav does nothing, timers are dead -- and nothing
    // running inside that page can fix it. So on every resume the shell pings
    // the page; if the renderer never answers (a healthy one replies in
    // milliseconds) the page is reloaded. localStorage keeps the session, so
    // the user loses nothing but the frozen frame.
    private int alivePing85 = 0;
    private boolean rendererAnswered85 = false;

    private void checkRendererAlive(final WebView wv) {
        try {
            if (wv == null || !pageReady85) return;   // not loaded yet: nothing to judge
            String u = wv.getUrl();
            if (u == null || u.startsWith("file://")) return;
            // Never interrupt a page that may be mid-playback.
            if (u.indexOf("player.html") >= 0) return;
            final int token = ++alivePing85;
            rendererAnswered85 = false;
            try {
                wv.evaluateJavascript("1", new android.webkit.ValueCallback<String>() {
                    @Override public void onReceiveValue(String v) {
                        if (token == alivePing85) rendererAnswered85 = true;
                    }
                });
            } catch (Throwable tEval) { return; }
            final WebView target = wv;
            new java.util.Timer().schedule(new java.util.TimerTask() {
                @Override public void run() {
                    act.runOnUiThread(new Runnable() { @Override public void run() {
                        if (token != alivePing85) return;      // a newer ping owns the verdict
                        if (rendererAnswered85) return;        // renderer is alive: nothing to do
                        log85("web", "renderer did not answer -- reloading the frozen page");
                        try { target.reload(); } catch (Throwable t) { }
                    }});
                }
            }, 4000L);
        } catch (Throwable t) { }
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

        // Safety cap ONLY (site genuinely stuck): hideSplash() additionally
        // requires pageReady85, so the splash never exits into a white page.
        splashTimeoutTimer = new java.util.Timer();
        splashTimeoutTimer.schedule(new java.util.TimerTask() {
            @Override
            public void run() {
                act.runOnUiThread(new Runnable() { @Override public void run() { hideSplash(); } });
            }
        }, SPLASH_MAX_MS);
    }

    // The DEYMFLIX splash: the C2 film-reel mark, drawn with Canvas from the
    // brand generator's exact geometry (viewBox 0 0 200 200) so the splash can
    // never drift from the favicon / app icon again. The tile floats gently;
    // the wordmark below is unchanged. (Replaces the old hexagon mark.)
    public static class HexagonLogoView extends View {
        private final android.graphics.Paint tileFill = new android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG);
        private final android.graphics.Paint rimStroke = new android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG);
        private final android.graphics.Paint bowlUnder = new android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG);
        private final android.graphics.Paint bowlRed = new android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG);
        private final android.graphics.Paint hlPaint = new android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG);
        private final android.graphics.Paint facePaint = new android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG);
        private final android.graphics.Paint reelRim = new android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG);
        private final android.graphics.Paint ellPaint = new android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG);
        private final android.graphics.Paint hubRing = new android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG);
        private final android.graphics.Paint badgeGlow = new android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG);
        private final android.graphics.Paint badgeFill = new android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG);
        private final android.graphics.Paint triPaint = new android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG);
        private final android.graphics.Paint arcPaint = new android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG);
        private final Path bowlPath = new Path();
        private final Path hlPath = new Path();
        private final Path triPath = new Path();
        private final Path arcPath = new Path();
        private float floatT = 0f;    // 0..1 float bob
        private android.animation.ValueAnimator animator;
        // the 5 reel windows (cx, cy) in the 200-viewBox
        private static final float[] ELL = {
                100f, 84.3f, 114.9f, 95.2f, 109.2f, 112.7f, 90.8f, 112.7f, 85.1f, 95.2f };

        HexagonLogoView(Context c) {
            super(c);
            tileFill.setColor(Color.parseColor("#17171b"));
            rimStroke.setStyle(android.graphics.Paint.Style.STROKE);
            rimStroke.setColor(Color.WHITE);
            rimStroke.setAlpha(20);
            bowlUnder.setStyle(android.graphics.Paint.Style.STROKE);
            bowlUnder.setColor(Color.parseColor("#6e030a"));
            bowlUnder.setStrokeCap(android.graphics.Paint.Cap.ROUND);
            bowlUnder.setStrokeJoin(android.graphics.Paint.Join.ROUND);
            bowlRed.setStyle(android.graphics.Paint.Style.STROKE);
            bowlRed.setColor(Color.parseColor("#e50914"));
            bowlRed.setStrokeCap(android.graphics.Paint.Cap.ROUND);
            bowlRed.setStrokeJoin(android.graphics.Paint.Join.ROUND);
            hlPaint.setStyle(android.graphics.Paint.Style.STROKE);
            hlPaint.setColor(Color.parseColor("#ff9aa0"));
            hlPaint.setAlpha(128);
            hlPaint.setStrokeCap(android.graphics.Paint.Cap.ROUND);
            facePaint.setColor(Color.parseColor("#0c0c10"));
            reelRim.setStyle(android.graphics.Paint.Style.STROKE);
            reelRim.setColor(Color.parseColor("#d9d9e0"));
            reelRim.setAlpha(235);
            ellPaint.setColor(Color.parseColor("#e3e3ea"));
            hubRing.setStyle(android.graphics.Paint.Style.STROKE);
            hubRing.setColor(Color.parseColor("#e50914"));
            badgeGlow.setStyle(android.graphics.Paint.Style.STROKE);
            badgeGlow.setColor(Color.parseColor("#e50914"));
            badgeGlow.setAlpha(77);
            badgeFill.setColor(Color.parseColor("#e50914"));
            triPaint.setColor(Color.parseColor("#0d0d12"));
            arcPaint.setStyle(android.graphics.Paint.Style.STROKE);
            arcPaint.setColor(Color.parseColor("#ff3b45"));
            arcPaint.setAlpha(191);
            arcPaint.setStrokeCap(android.graphics.Paint.Cap.ROUND);
            // bowl: M70 42 L104 42 C148 42 160 70 160 100 C160 130 148 158 104 158 L70 158
            bowlPath.moveTo(70f, 42f);
            bowlPath.lineTo(104f, 42f);
            bowlPath.cubicTo(148f, 42f, 160f, 70f, 160f, 100f);
            bowlPath.cubicTo(160f, 130f, 148f, 158f, 104f, 158f);
            bowlPath.lineTo(70f, 158f);
            hlPath.moveTo(74f, 38.5f);
            hlPath.lineTo(122f, 42.5f);
            triPath.moveTo(137.8f, 138f);
            triPath.lineTo(137.8f, 162f);
            triPath.lineTo(158.5f, 150f);
            triPath.close();
            arcPath.moveTo(172f, 124f);
            arcPath.cubicTo(177.5f, 128f, 183f, 138f, 183f, 150f);
            // one animator drives the gentle float bob (site .app-icon timing)
            animator = android.animation.ValueAnimator.ofFloat(0f, 1f);
            animator.setDuration(5000);
            animator.setRepeatCount(android.animation.ValueAnimator.INFINITE);
            animator.setInterpolator(new android.view.animation.LinearInterpolator());
            animator.addUpdateListener(new android.animation.ValueAnimator.AnimatorUpdateListener() {
                @Override
                public void onAnimationUpdate(android.animation.ValueAnimator a) {
                    long t = a.getCurrentPlayTime();
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
            float cy = h / 2f + floatT * h * 0.02f;   // gentle float bob
            float tile = Math.min(w, h) * 0.88f;      // the mark IS the tile now
            float k = tile / 200f;                    // 200-viewBox -> pixels
            float ox = cx - 100f * k, oy = cy - 100f * k;

            // 1) dark tile (r=42) + hairline rim (r=38, white 8%)
            android.graphics.RectF tr = new android.graphics.RectF(
                    ox + 10f * k, oy + 10f * k, ox + 190f * k, oy + 190f * k);
            canvas.drawRoundRect(tr, 42f * k, 42f * k, tileFill);
            android.graphics.RectF rr = new android.graphics.RectF(
                    ox + 15.5f * k, oy + 15.5f * k, ox + 184.5f * k, oy + 184.5f * k);
            canvas.drawRoundRect(rr, 38f * k, 38f * k, rimStroke);

            // 2) the open D bowl: dark under-stroke for depth, then brand red.
            // The paths are built in the 200-viewBox, so draw them through the
            // same k/ox/oy mapping the circles use. Canvas scale also scales
            // stroke widths, so widths here are set in view units.
            canvas.save();
            canvas.translate(ox, oy);
            canvas.scale(k, k);
            bowlUnder.setStrokeWidth(30f);
            canvas.save();
            canvas.translate(0f, 2.5f);
            canvas.drawPath(bowlPath, bowlUnder);
            canvas.restore();
            bowlRed.setStrokeWidth(26f);
            canvas.drawPath(bowlPath, bowlRed);
            hlPaint.setStrokeWidth(3f);
            canvas.drawPath(hlPath, hlPaint);
            canvas.restore();

            // 3) the film reel -- floats dead-centre, touches nothing
            float rx = ox + 100f * k, ry = oy + 100f * k, reel = 28f * k;
            facePaint.setColor(Color.BLACK);
            facePaint.setAlpha(115);
            canvas.drawCircle(rx + 3f * k, ry + 4f * k, reel * 1.02f, facePaint);
            facePaint.setColor(Color.parseColor("#0c0c10"));
            facePaint.setAlpha(255);
            reelRim.setStrokeWidth(2.5f * k);
            canvas.drawCircle(rx, ry, reel * 1.06f, reelRim);
            canvas.drawCircle(rx, ry, reel, facePaint);
            for (int i = 0; i < 5; i++) {
                float ex = ox + ELL[i * 2] * k, ey = oy + ELL[i * 2 + 1] * k;
                canvas.drawOval(new android.graphics.RectF(
                        ex - 6.2f * k, ey - 6.9f * k, ex + 6.2f * k, ey + 6.9f * k), ellPaint);
            }
            canvas.drawCircle(rx, ry, 3.4f * k, ellPaint);
            hubRing.setStrokeWidth(2.2f * k);
            canvas.drawCircle(rx, ry, 6.7f * k, hubRing);
            canvas.drawCircle(rx, ry, 4.5f * k, facePaint);
            canvas.drawCircle(rx, ry, 2.5f * k, badgeFill);

            // 4) play badge docked lower-right + signal arc
            float bx = ox + 146f * k, by = oy + 150f * k, br = 24f * k;
            badgeGlow.setStrokeWidth(3f * k);
            canvas.drawCircle(bx, by, 33f * k, badgeGlow);
            canvas.drawCircle(bx, by, br, badgeFill);
            canvas.save();
            canvas.translate(ox, oy);
            canvas.scale(k, k);
            canvas.drawPath(triPath, triPaint);
            arcPaint.setStrokeWidth(5f);
            canvas.drawPath(arcPath, arcPaint);
            canvas.restore();
        }
    }


    private void hideSplash() {
        if (splashLayout == null) return;
        // GATE 1: page must have finished loading (site OR offline.html) --
        // otherwise the user sees a white/partial page after the logo. Re-check
        // every 500ms until ready or the safety cap releases us.
        if (!pageReady85) {
            if (splashTimeoutTimer != null) { splashTimeoutTimer.cancel(); splashTimeoutTimer = null; }
            splashTimeoutTimer = new java.util.Timer();
            splashTimeoutTimer.schedule(new java.util.TimerTask() {
                @Override
                public void run() {
                    act.runOnUiThread(new Runnable() { @Override public void run() { hideSplash(); } });
                }
            }, 500);
            return;
        }
        // GATE 2: enforce the 2-second minimum: too early means wait and retry
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
                    // STREAMING-ONLY GATE: downloads come from our own upload
                    // hosts only; CinemaOS and other providers stream but
                    // never download.
                    if (!isOwnMediaHost(url)) { showStreamOnlyDialog(title); return; }
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
                    log85("player", "native player: " + (title == null ? "" : title));
                    launchNativePlayer(use, title);
                }});
            }
            // ── EMBED DOWNLOAD (IDM-style) ── RETIRED: embeds (CinemaOS and
            // other providers) are streaming-only now. The player calls this
            // when the user taps Download on an embed; we answer with the
            // streaming-only dialog instead of arming the capture window.
            @android.webkit.JavascriptInterface
            public void requestEmbedDownload() {
                act.runOnUiThread(new Runnable() { @Override public void run() {
                    showStreamOnlyDialog(null);
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

            // ══ v1.7 APP PANEL (used by me.html inside the app only) ══
            // Ask for the microphone up-front (the party calls this right
            // before getUserMedia so Android's dialog appears in context).
            @android.webkit.JavascriptInterface
            public void requestMic() {
                act.runOnUiThread(new Runnable() { @Override public void run() {
                    try { askMic85(act); } catch (Throwable t) { }
                }});
            }
            @android.webkit.JavascriptInterface
            public boolean hasMic() {
                return hasMic85(act);
            }
            // Download settings (quality + Wi-Fi only) live natively so the
            // engine, the downloads screen and the site all read one value.
            @android.webkit.JavascriptInterface
            public String getDownloadPrefs() {
                return downloadPrefsJson(act);
            }
            @android.webkit.JavascriptInterface
            public void setDownloadPrefs(final String quality, final boolean wifiOnly) {
                act.runOnUiThread(new Runnable() { @Override public void run() {
                    setDownloadPrefs85(act, quality, wifiOnly);
                }});
            }
            // Diagnostics: everything a support reply needs, in one string.
            @android.webkit.JavascriptInterface
            public String getDiagnostics(final String extra) {
                try { return diagnosticsJson(act, extra); } catch (Throwable t) { return "{}"; }
            }
            @android.webkit.JavascriptInterface
            public String getLogs() {
                try { return logsText(); } catch (Throwable t) { return ""; }
            }
            @android.webkit.JavascriptInterface
            public void copyText(final String label, final String text) {
                act.runOnUiThread(new Runnable() { @Override public void run() {
                    try { copy85(act, label, text); } catch (Throwable t) { }
                }});
            }
            // The phone's own Google accounts (used by "Log in with Google"
            // in the app's sign-in screen -- no password typing, no popup).
            @android.webkit.JavascriptInterface
            public String getGoogleAccounts() {
                try { return googleAccountsJson(act); } catch (Throwable t) { return "[]"; }
            }
            // Reading the phone's accounts needs GET_ACCOUNTS, which is a
            // runtime permission: the page calls this first so Android's
            // dialog appears, then polls until it answers "granted".
            @android.webkit.JavascriptInterface
            public String requestAccounts() {
                try { return askAccounts85(act); } catch (Throwable t) { return "unavailable"; }
            }
            // Android 14+ hides other apps' accounts from getAccountsByType,
            // so the reliable path is the phone's own account picker: the
            // chosen address comes back through MainActivity.onActivityResult
            // and is handed to the page as DfxGooglePicked(email).
            @android.webkit.JavascriptInterface
            public String takeGoogleEmail() {
                return takeGoogleEmail85();
            }
            // The site's bottom bar now keeps History and points Me at the
            // native Me screen (a real activity, red theme, same 5 tabs).
            @android.webkit.JavascriptInterface
            public void openMe() {
                act.runOnUiThread(new Runnable() { @Override public void run() {
                    try { openMeScreen(); } catch (Throwable t) { }
                }});
            }
            @android.webkit.JavascriptInterface
            public void pickGoogleAccount() {
                act.runOnUiThread(new Runnable() { @Override public void run() {
                    try { MainScreen85.pickGoogleAccount(act); } catch (Throwable t) { }
                }});
            }
            @android.webkit.JavascriptInterface
            public String getAppInfo() {
                try { return appInfoJson(act); } catch (Throwable t) { return "{}"; }
            }
            // The JS console, mirrored into the diagnostics log so a copied
            // report shows page errors too.
            @android.webkit.JavascriptInterface
            public void log(final String tag, final String msg) {
                try { log85(tag == null ? "js" : ("js:" + tag), msg == null ? "" : msg); } catch (Throwable t) { }
            }
        };
    }

    // =======================================================================
    //  v1.7 -- APP PANEL BACKEND
    //  mic permission, download prefs, diagnostics log, Google accounts
    // =======================================================================
    // Nothing in this section may ever throw into the WebView: every entry
    // point is wrapped and answers with a safe default instead.
    private static final String APP_PREFS85 = "deymflix_prefs";
    public static final int REQ_MIC85 = 4103;
    public static final int REQ_ACCT85 = 4104;
    public static final int REQ_PICK85 = 4105;
    private static volatile android.webkit.PermissionRequest pendingWebMic85 = null;
    private static final java.util.ArrayDeque<String> LOG85 = new java.util.ArrayDeque<String>();
    private static final Object LOG_LOCK85 = new Object();

    private static android.content.SharedPreferences appPrefs(Context c) {
        return c.getApplicationContext().getSharedPreferences(APP_PREFS85, 0);
    }

    public static String dlQuality85(Context c) {
        try {
            String q = appPrefs(c).getString("dl_quality", "auto");
            return (q == null || q.length() == 0) ? "auto" : q;
        } catch (Throwable t) { return "auto"; }
    }

    public static boolean wifiOnly85(Context c) {
        try { return appPrefs(c).getBoolean("dl_wifi_only", false); } catch (Throwable t) { return false; }
    }

    // "On mobile data" -- isActiveNetworkMetered covers mobile, metered
    // hotspots and Wi-Fi-without-internet fallbacks in one call.
    public static boolean isMetered85(Context c) {
        try {
            android.net.ConnectivityManager cm = (android.net.ConnectivityManager)
                    c.getApplicationContext().getSystemService(Context.CONNECTIVITY_SERVICE);
            if (cm == null) return false;
            return cm.isActiveNetworkMetered();
        } catch (Throwable t) { return false; }
    }

    // True while the active network is Wi-Fi, metered or not. Android flags
    // some Wi-Fi as metered (phone hotspots answer DHCP with ANDROID_METERED),
    // so "metered" alone must never be read as "mobile data".
    public static boolean onWifi85(Context c) {
        try {
            android.net.ConnectivityManager cm = (android.net.ConnectivityManager)
                    c.getApplicationContext().getSystemService(Context.CONNECTIVITY_SERVICE);
            if (cm == null) return false;
            android.net.Network n = cm.getActiveNetwork();
            if (n == null) return false;
            android.net.NetworkCapabilities caps = cm.getNetworkCapabilities(n);
            return caps != null && caps.hasTransport(android.net.NetworkCapabilities.TRANSPORT_WIFI);
        } catch (Throwable t) { return false; }
    }

    // True while a download must NOT start: Wi-Fi-only is on and the phone is
    // on a metered network that is NOT Wi-Fi (mobile data, metered hotspot).
    // A metered Wi-Fi still counts as Wi-Fi -- the user asked for Wi-Fi.
    public static boolean wifiHold85(Context c) {
        return wifiOnly85(c) && isMetered85(c) && !onWifi85(c);
    }

    public static String downloadPrefsJson(Context c) {
        return "{\"quality\":" + jesc85(dlQuality85(c))
                + ",\"wifiOnly\":" + wifiOnly85(c)
                + ",\"metered\":" + isMetered85(c)
                + ",\"onWifi\":" + onWifi85(c) + "}";
    }

    // ---- diagnostics log ring (memory only: nothing is sent anywhere until
    //      the user taps "Copy logs" and shares the text themselves) ----
    public static void log85(String tag, String msg) {
        try {
            String when = new java.text.SimpleDateFormat("HH:mm:ss", java.util.Locale.US)
                    .format(new java.util.Date());
            String line = when + "  " + (tag == null ? "app" : tag) + "  "
                    + (msg == null ? "" : msg);
            synchronized (LOG_LOCK85) {
                LOG85.addLast(line);
                while (LOG85.size() > 400) LOG85.removeFirst();
            }
            // Mirror into logcat (tag DFX85) so a developer with USB debugging
            // can read the very same diagnostics the Me screen offers to copy.
            try { android.util.Log.i("DFX85", line); } catch (Throwable t2) { }
        } catch (Throwable t) { }
    }

    // Public wrappers so the native Me screen (a second activity with its own
    // WebView + bridge) shows exactly the same data as the main shell.
    public static String logsText85() { return logsText(); }
    public static String appInfoJson85(Context c) { return appInfoJson(c); }
    public static void openDownloads85(Activity act) {
        try {
            Intent it = new Intent();
            it.setClassName(act.getApplicationContext(), act.getPackageName() + ".DownloadsActivity");
            act.startActivity(it);
        } catch (Exception e) {
            Toast.makeText(act.getApplicationContext(),
                    "Downloads screen unavailable", Toast.LENGTH_SHORT).show();
        }
    }
    public static void setDownloadPrefs85(Activity act, String quality, boolean wifiOnly) {
        try {
            appPrefs(act).edit()
                    .putString("dl_quality", quality == null ? "auto" : quality)
                    .putBoolean("dl_wifi_only", wifiOnly).apply();
            log85("prefs", "download quality=" + (quality == null ? "auto" : quality)
                    + " wifiOnly=" + wifiOnly);
        } catch (Throwable t) { }
    }
    public static String takeGoogleEmail85() {
        try {
            String e = PENDING_GOOGLE85;
            PENDING_GOOGLE85 = null;
            if (e == null) return "null";
            if (e.length() == 0) return "\"\"";
            return "\"" + jesc85(e) + "\"";
        } catch (Throwable t) { return "null"; }
    }

    private static String logsText() {
        StringBuilder sb = new StringBuilder();
        synchronized (LOG_LOCK85) {
            for (String l : LOG85) sb.append(l).append("\r\n");
        }
        return sb.toString();
    }

    private static String jesc85(String s) {
        if (s == null) return "\"\"";
        StringBuilder sb = new StringBuilder("\"");
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            if (ch == '"') sb.append("\\\"");
            else if (ch == '\\') sb.append("\\\\");
            else if (ch == '\n') sb.append("\\n");
            else if (ch == '\r') sb.append("");
            else if (ch < ' ') sb.append(' ');
            else sb.append(ch);
        }
        return sb.append("\"").toString();
    }

    public static String versionName85(Context c) {
        try {
            return c.getPackageManager().getPackageInfo(c.getPackageName(), 0).versionName;
        } catch (Throwable t) { return DlUpdate85.CURRENT_VERSION; }
    }

    public static int versionCode85(Context c) {
        try {
            return c.getPackageManager().getPackageInfo(c.getPackageName(), 0).versionCode;
        } catch (Throwable t) { return 0; }
    }

    public static String networkLabel85(Context c) {
        try {
            android.net.ConnectivityManager cm = (android.net.ConnectivityManager)
                    c.getApplicationContext().getSystemService(Context.CONNECTIVITY_SERVICE);
            if (cm == null) return "unknown";
            android.net.NetworkInfo ni = cm.getActiveNetworkInfo();
            if (ni == null || !ni.isConnected()) return "offline";
            String t = ni.getTypeName() == null ? "" : ni.getTypeName();
            String sub = ni.getSubtypeName() == null ? "" : ni.getSubtypeName();
            return (t + " " + sub).trim() + (cm.isActiveNetworkMetered() ? " (metered)" : " (unmetered)");
        } catch (Throwable t) { return "unknown"; }
    }

    private static String appInfoJson(Context c) {
        return "{\"version\":" + jesc85(versionName85(c))
                + ",\"code\":" + versionCode85(c)
                + ",\"package\":" + jesc85(c.getPackageName())
                + ",\"android\":" + jesc85(String.valueOf(android.os.Build.VERSION.SDK_INT))
                + ",\"device\":" + jesc85(android.os.Build.MANUFACTURER + " " + android.os.Build.MODEL) + "}";
    }

    // Full diagnostics report: build info + network + storage + prefs + the
    // log ring. `extra` is whatever the page adds (route, last error, ...).
    public static String diagnosticsJson(Activity act, String extra) {
        StringBuilder sb = new StringBuilder("{");
        sb.append("\"app\":").append(appInfoJson(act)).append(",");
        sb.append("\"network\":").append(jesc85(networkLabel85(act))).append(",");
        sb.append("\"prefs\":").append(downloadPrefsJson(act)).append(",");
        sb.append("\"micGranted\":").append(hasMic85(act)).append(",");
        sb.append("\"accountsGranted\":").append(hasAccounts85(act)).append(",");
        long free = 0L;
        try { free = DlSpeed85.freeBytes(); } catch (Throwable t) { free = -1L; }
        sb.append("\"freeBytes\":").append(free).append(",");
        int rows = 0;
        try {
            SharedPreferences p = act.getSharedPreferences("deymflix_dl", 0);
            for (java.util.Map.Entry<String, ?> e : p.getAll().entrySet()) {
                if (String.valueOf(e.getKey()).startsWith("M")) rows++;
            }
        } catch (Throwable t) { }
        sb.append("\"downloadRows\":").append(rows).append(",");
        String ua = "";
        try {
            WebView wv = findWebView(act);
            if (wv != null) ua = wv.getSettings().getUserAgentString();
        } catch (Throwable t) { }
        sb.append("\"ua\":").append(jesc85(ua)).append(",");
        sb.append("\"extra\":").append(jesc85(extra == null ? "" : extra)).append(",");
        sb.append("\"logs\":[");
        boolean first = true;
        synchronized (LOG_LOCK85) {
            for (String l : LOG85) {
                if (!first) sb.append(",");
                sb.append(jesc85(l));
                first = false;
            }
        }
        sb.append("]}");
        return sb.toString();
    }

    // ---- clipboard: "Copy logs" / "Copy UID" land here ----
    public static void copy85(Activity act, String label, String text) {
        try {
            android.content.ClipboardManager cb = (android.content.ClipboardManager)
                    act.getSystemService(Context.CLIPBOARD_SERVICE);
            cb.setPrimaryClip(android.content.ClipData.newPlainText(
                    label == null ? "DEYMFLIX" : label, text == null ? "" : text));
            Toast.makeText(act.getApplicationContext(),
                    "Copied -- paste it in your message", Toast.LENGTH_SHORT).show();
            log85("copy", (label == null ? "text" : label) + " copied ("
                    + (text == null ? 0 : text.length()) + " chars)");
        } catch (Throwable t) {
            Toast.makeText(act.getApplicationContext(), "Copy failed", Toast.LENGTH_SHORT).show();
        }
    }

    // ---- microphone (Watch Party voice) ----
    public static boolean hasMic85(Context c) {
        try {
            if (android.os.Build.VERSION.SDK_INT < 23) return true;
            return c.checkSelfPermission(android.Manifest.permission.RECORD_AUDIO)
                    == android.content.pm.PackageManager.PERMISSION_GRANTED;
        } catch (Throwable t) { return false; }
    }

    private static void askMic85(final Activity act) {
        try {
            if (hasMic85(act)) { grantPendingMic85(); return; }
            if (android.os.Build.VERSION.SDK_INT < 23) return;
            act.requestPermissions(new String[]{ android.Manifest.permission.RECORD_AUDIO }, REQ_MIC85);
            log85("mic", "asked Android for RECORD_AUDIO");
            // The permission dialog has no callback hook in every build, so
            // poll briefly: the moment it is granted, the waiting WebView
            // request is answered and voice chat starts without a second tap.
            final android.os.Handler h = new android.os.Handler(android.os.Looper.getMainLooper());
            final long until = System.currentTimeMillis() + 20000L;
            h.postDelayed(new Runnable() {
                @Override public void run() {
                    try {
                        if (hasMic85(act)) { grantPendingMic85(); return; }
                        if (System.currentTimeMillis() < until) h.postDelayed(this, 600L);
                        else {
                            pendingWebMic85 = null;
                            log85("mic", "permission not granted (timed out)");
                        }
                    } catch (Throwable t) { }
                }
            }, 600L);
        } catch (Throwable t) { }
    }

    // ---- the phone's account picker (works where the list is hidden) ----
    // MainActivity.onActivityResult forwards here (see _tools/_app_build.cjs,
    // which injects that one-line hook into the generated MainActivity).
    public static void pickGoogleAccount(final Activity act) {
        try {
            // Google Play services draws the modern "Choose an account" sheet
            // (account names + photos) -- exactly what the sign-in screen
            // shows. Phones without GMS fall back to the system dialog.
            boolean started = false;
            try {
                android.content.Intent gms = com.google.android.gms.common.AccountPicker
                        .newChooseAccountIntent(null, null, new String[] { "com.google" },
                                true, null, null, null, null);
                if (gms != null) {
                    act.startActivityForResult(gms, REQ_PICK85);
                    started = true;
                }
            } catch (Throwable tGms) { started = false; }
            if (!started) {
                android.accounts.AccountManager am = android.accounts.AccountManager.get(act);
                android.content.Intent it = am.newChooseAccountIntent(null, null,
                        new String[] { "com.google" }, true,
                        "Choose the Google account to log in with", null, null, null);
                act.startActivityForResult(it, REQ_PICK85);
            }
            log85("google", "opened the account picker");
        } catch (Throwable t) {
            log85("google", "picker unavailable: " + t.getMessage());
            jsGooglePicked(act, null);
        }
    }

    public static void onActivityResult(Activity act, int requestCode, int resultCode,
            android.content.Intent data) {
        try {
            if (requestCode != REQ_PICK85) return;
            String email = null;
            if (resultCode == Activity.RESULT_OK && data != null) {
                // The GMS "Choose an account" sheet answers with
                // AccountManager.KEY_ACCOUNT_NAME ("accountName"); the plain
                // Android picker and some OEM builds use "authAccount", so read
                // every key that has been seen in the wild instead of guessing.
                email = data.getStringExtra(android.accounts.AccountManager.KEY_ACCOUNT_NAME);
                if (email == null) email = data.getStringExtra("accountName");
                if (email == null) email = data.getStringExtra("authAccount");
                if (email == null) email = data.getStringExtra("ACCOUNT_NAME");
                try {
                    log85("google", "picker result rc=" + resultCode + " email="
                            + (email == null ? "none" : email) + " extras=" + data.getExtras());
                } catch (Throwable t4) { }
            } else {
                log85("google", "account picker dismissed (rc=" + resultCode + ")");
            }
            jsGooglePicked(act, email);
        } catch (Throwable t) { }
    }

    // The picked address is BOTH pushed into the page and left in a slot the
    // page polls (takeGoogleEmail): a WebView that is mid-resume when the
    // picker returns can drop the pushed call, the slot never gets lost.
    private static volatile String PENDING_GOOGLE85 = null;

    private static void jsGooglePicked(final Activity act, final String email) {
        try {
            PENDING_GOOGLE85 = email == null ? "" : email;
            final WebView wv = findWebView(act);
            if (wv == null) {
                log85("google", "no WebView to hand the picked account to");
                return;
            }
            final String code = "window.DfxGooglePicked&&window.DfxGooglePicked("
                    + (email == null ? "null" : ("\"" + jesc85(email) + "\"")) + ");";
            act.runOnUiThread(new Runnable() { @Override public void run() {
                try { wv.evaluateJavascript(code, null); } catch (Throwable t) { }
            }});
        } catch (Throwable t) { log85("google", "relay failed: " + t.getMessage()); }
    }

    // ---- Google accounts: GET_ACCOUNTS is a runtime permission too ----
    public static boolean hasAccounts85(Context c) {
        try {
            if (android.os.Build.VERSION.SDK_INT < 23) return true;
            return c.checkSelfPermission(android.Manifest.permission.GET_ACCOUNTS)
                    == android.content.pm.PackageManager.PERMISSION_GRANTED;
        } catch (Throwable t) { return false; }
    }

    // "granted" -> the account list can be read now; "asked" -> Android's
    // dialog is on screen (the page keeps polling until it flips).
    public static String askAccounts85(final Activity act) {
        try {
            if (hasAccounts85(act)) return "granted";
            if (android.os.Build.VERSION.SDK_INT < 23) return "granted";
            act.requestPermissions(new String[]{ android.Manifest.permission.GET_ACCOUNTS }, REQ_ACCT85);
            log85("google", "asked Android for GET_ACCOUNTS");
            return "asked";
        } catch (Throwable t) { return "unavailable"; }
    }

    private static void grantPendingMic85() {
        try {
            android.webkit.PermissionRequest req = pendingWebMic85;
            if (req == null) return;
            pendingWebMic85 = null;
            java.util.ArrayList<String> want = new java.util.ArrayList<String>();
            String[] res = req.getResources();
            for (int i = 0; res != null && i < res.length; i++) {
                if (android.webkit.PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(res[i])) want.add(res[i]);
            }
            if (want.isEmpty()) { req.deny(); return; }
            req.grant(want.toArray(new String[0]));
            log85("mic", "audio capture granted after permission allow");
        } catch (Throwable t) { }
    }

    // Our own pages may capture audio (the site + the bundled offline page).
    private static boolean isOurCaptureOrigin(String origin) {
        String o = origin == null ? "" : origin.toLowerCase();
        return o.contains("deymflix.eu.cc") || o.startsWith("file:") || o.length() == 0;
    }

    // ---- the phone's Google accounts ("Log in with Google", app only) ----
    public static String googleAccountsJson(Context c) {
        StringBuilder sb = new StringBuilder("[");
        try {
            android.accounts.AccountManager am = android.accounts.AccountManager.get(c.getApplicationContext());
            android.accounts.Account[] accs = am.getAccountsByType("com.google");
            int n = 0;
            for (int i = 0; accs != null && i < accs.length; i++) {
                String em = accs[i].name == null ? "" : accs[i].name.trim();
                if (em.length() == 0) continue;
                if (n > 0) sb.append(",");
                sb.append("{\"email\":").append(jesc85(em)).append("}");
                n++;
            }
        } catch (Throwable t) {
            log85("google", "account list unavailable: " + t.getMessage());
        }
        return sb.append("]").toString();
    }

    // =======================================================================
    //  EMBED STREAM CAPTURE (IDM-style) -- state + window
    // =======================================================================
    // True while "Downloading embed stream..." is armed (2 minutes).
    private volatile boolean embedCaptureArmed = false;
    // Walls off the capture to the embed's own requests (excludes our site).
    private volatile String embedCapturePageUrl = "";
    // The locked media playlist, consumed by the firewall.
    private volatile String embedCapturedM3u8 = null;
    // Title/poster snapshot at arm time, for the registry row.
    private volatile String embedCaptureTitle = "";
    private volatile String embedCapturePoster = "";
    // One-shot guard so a locked stream enqueues exactly once.
    private volatile boolean embedCaptureEnqueued = false;
    // Rolling log of the playlists seen recently (any request, armed or not):
    // lets us lock on instantly if the video was ALREADY playing when the
    // user tapped Download. Written by the request firewall (inner class),
    // read here -- hence a ConcurrentLinkedQueue.
    private final java.util.concurrent.ConcurrentLinkedQueue<String> EMBED_RECENT_M3U8 =
            new java.util.concurrent.ConcurrentLinkedQueue<String>();

    private void armEmbedCaptureWindow() {
        try {
            // already have a capture running? say so and stop
            if (embedCaptureEnqueued) {
                Toast.makeText(act.getApplicationContext(),
                        "Embed download already started -- see My Downloads", Toast.LENGTH_SHORT).show();
                return;
            }
            // snapshot current movie title/poster from the page
            embedCaptureTitle = "";
            embedCapturePoster = "";
            try {
                WebView wvT = findWebView(act);
                if (wvT != null) {
                    wvT.evaluateJavascript(
                        "(function(){try{var cm=window.__dfxCurrentMovie;var t=document.getElementById('current-title');" +
                        "return JSON.stringify({t:(cm&&cm.title)||((t&&t.textContent)||'').trim()||'Embed video'," +
                        "p:(cm&&cm.poster)||'',ep:(cm&&cm._episodeTitle)||''});}catch(e){return '{}'}})()",
                        new android.webkit.ValueCallback<String>() {
                            @Override public void onReceiveValue(String raw) {
                                String j = raw == null ? "" : raw;
                                if (j.length() > 1 && j.startsWith("\"") && j.endsWith("\"")) {
                                    j = j.substring(1, j.length() - 1).replace("\\\"", "\"").replace("\\\\", "\\");
                                }
                                try {
                                    org.json.JSONObject o = new org.json.JSONObject(j);
                                    embedCaptureTitle = o.optString("t", "Embed video");
                                    String ep = o.optString("ep", "");
                                    if (ep.length() > 0) embedCaptureTitle = embedCaptureTitle + " - " + ep;
                                    embedCapturePoster = o.optString("p", "");
                                } catch (Exception e) { }
                            }
                        });
                }
            } catch (Exception eT) { }
            try { embedCapturePageUrl = String.valueOf(findWebView(act).getUrl()); } catch (Exception eU) { }
            embedCapturedM3u8 = null;
            embedCaptureEnqueued = false;
            embedCaptureArmed = true;
            Toast.makeText(act.getApplicationContext(),
                    "Waiting for the video stream... keep the episode playing", Toast.LENGTH_LONG).show();
            // capture window closes after 2 minutes
            new Thread(new Runnable() { @Override public void run() {
                try { Thread.sleep(120000); } catch (Exception e) { }
                if (embedCaptureArmed && embedCapturedM3u8 == null && !embedCaptureEnqueued) {
                    embedCaptureArmed = false;
                    act.runOnUiThread(new Runnable() { @Override public void run() {
                        Toast.makeText(act.getApplicationContext(),
                                "No stream detected -- let the video play a few seconds, then try again",
                                Toast.LENGTH_LONG).show();
                    }});
                }
            }}).start();
            // also probe what already flowed (a playing video may have the
            // playlist in the recent-request log already)
            tryEmbedCaptureFromRecent();
        } catch (Exception e) { }
    }

    // The firewall records every .m3u8 request; if one already flowed for
    // this page, lock on immediately without waiting for new traffic.
    private void tryEmbedCaptureFromRecent() {
        try {
            String u = EMBED_RECENT_M3U8.peek();
            if (u != null) tryEmbedLock(u);
        } catch (Exception e) { }
    }

    private void startEmbedHlsDownload(final String playlistUrl) {
        try {
            // "direct:" prefix (set by the broader capture net) = the embed
            // served a plain video file: download it as a single file instead
            // of running the HLS segment engine.
            if (playlistUrl != null && playlistUrl.startsWith("direct:")) {
                boolean ok = DlSpeed85.startQuiet(act, playlistUrl.substring(7),
                        embedCaptureTitle, embedCapturePoster, "", "");
                if (!ok) {
                    try { enqueueDownload(android.net.Uri.parse(playlistUrl.substring(7)),
                            embedCaptureTitle, "", embedCapturePoster, ""); } catch (Exception e2) { }
                }
                return;
            }
            DlSpeed85.startEmbedHls(act, playlistUrl, embedCaptureTitle, embedCapturePoster, "");
        } catch (Exception e) {
            Toast.makeText(act.getApplicationContext(), "Embed download failed to start", Toast.LENGTH_SHORT).show();
        }
    }

    // One shared lock-on path for every capture source (playlist request,
    // direct video segment, recent-request log). Idempotent: first caller
    // wins, everyone else is a no-op.
    private void tryEmbedLock(final String url) {
        if (!embedCaptureArmed || embedCapturedM3u8 != null || embedCaptureEnqueued) return;
        if (url == null || url.length() == 0) return;
        embedCapturedM3u8 = url;
        embedCaptureArmed = false;
        embedCaptureEnqueued = true;
        startEmbedHlsDownload(url);
        // page badge: "Stream captured — saving…" (see player.html)
        try {
            WebView wvL = findWebView(act);
            if (wvL != null) wvL.post(new Runnable() { @Override public void run() {
                try { wvL.evaluateJavascript("if(window._dfxCaptureLocked){window._dfxCaptureLocked();}", null); } catch (Exception eL) { }
            }});
        } catch (Exception eN) { }
    }

    // The Downloads screen is launched by NAME so this jar never needs a
    // compile-time reference to the app's generated classes.
    // The Me tab lives in its own native activity (MeActivity): red theme, the
    // same five tabs as the site bar, and the Me page inside a WebView.
    private void openMeScreen() {
        try {
            Intent it = new Intent();
            it.setClassName(act.getApplicationContext(), act.getPackageName() + ".MeActivity");
            act.startActivity(it);
            log85("nav", "opened the Me screen");
        } catch (Exception e) {
            // Fail safe: never dead-end on the Me tab -- show the same page in
            // the shell WebView if the activity cannot start.
            log85("nav", "Me activity failed: " + e.getMessage());
            try { findWebView(act).loadUrl(siteUrl85("me.html")); }
            catch (Throwable t) {
                Toast.makeText(act.getApplicationContext(),
                        "Me screen unavailable", Toast.LENGTH_SHORT).show();
            }
        }
    }

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
    // ─────────────────────────────────────────────────────────────────────
    //  STREAMING-ONLY GATE
    //  Downloads may only come from our own upload hosts (the DEYMFLIX
    //  Bunny CDN zones fronting Backblaze/Cloudflare). Everything else --
    //  CinemaOS embeds and any third-party provider -- streams but never
    //  downloads, and the app says so.
    // ─────────────────────────────────────────────────────────────────────
    private static boolean isOwnMediaHost(String u) {
        if (u == null) return false;
        try {
            String h = android.net.Uri.parse(u.trim()).getHost();
            if (h == null) return false;
            h = h.toLowerCase();
            return h.endsWith(".b-cdn.net") && h.contains("deymflix");
        } catch (Exception e) { return false; }
    }

    // "Download unavailable -- only available for streaming" dialog. The
    // title carries the " ep<N>" suffix app.js appends for episodes, which
    // picks the right movie/episode wording.
    private void showStreamOnlyDialog(final String title) {
        String t = title == null ? "" : title.trim();
        boolean isEpisode = t.matches("(?s).*\\sep\\d+\\s*$");
        String name = t.replaceAll("\\sep\\d+\\s*$", "").trim();
        String what = isEpisode ? "episode" : (name.length() == 0 ? "title" : "movie");
        showStreamOnlyNamed(name, what);
    }

    private void showStreamOnlyNamed(final String name, final String what) {
        String n = name == null ? "" : name.trim();
        String msg = (n.length() == 0)
                ? ("This " + what + " is only available for streaming, so it can't be downloaded.")
                : ("\u201C" + n + "\u201D \u2014 this " + what + " is only available for streaming, so it can't be downloaded.");
        android.app.AlertDialog.Builder ab = new android.app.AlertDialog.Builder(act);
        ab.setTitle("Download unavailable");
        ab.setMessage(msg);
        ab.setPositiveButton("OK", null);
        ab.show();
    }

    private void confirmAndDownload(final String url, final String title, final String quality, final String poster) {
        if (url == null) {
            Toast.makeText(act.getApplicationContext(), "This title cannot be downloaded.", Toast.LENGTH_SHORT).show();
            return;
        }
        if (url.length() == 0) {
            Toast.makeText(act.getApplicationContext(), "This title cannot be downloaded.", Toast.LENGTH_SHORT).show();
            return;
        }
        confirmAndDownload(url, title, quality, poster, false);
    }

    // v1.7 -- WI-FI-ONLY GATE.
    // Preference owned by the app's Download settings (site UI -> bridge).
    // When it is on and the phone is on mobile data the download must not
    // start silently: the user is told exactly why and can override once.
    private void confirmAndDownload(final String url, final String title, final String quality,
            final String poster, final boolean wifiOverride) {
        if (url == null) {
            Toast.makeText(act.getApplicationContext(), "This title cannot be downloaded.", Toast.LENGTH_SHORT).show();
            return;
        }
        if (url.length() == 0) {
            Toast.makeText(act.getApplicationContext(), "This title cannot be downloaded.", Toast.LENGTH_SHORT).show();
            return;
        }
        if (!wifiOverride && wifiHold85(act)) {
            log85("download", "held by Wi-Fi-only: " + (title == null ? "" : title));
            android.app.AlertDialog.Builder wb = new android.app.AlertDialog.Builder(act);
            wb.setTitle("Wi-Fi only is on");
            wb.setMessage("Downloads wait for Wi-Fi. You are not on Wi-Fi right now.");
            wb.setPositiveButton("Download anyway", new android.content.DialogInterface.OnClickListener() {
                @Override public void onClick(android.content.DialogInterface d, int w) {
                    try { d.dismiss(); } catch (Exception e) { }
                    confirmAndDownload(url, title, quality, poster, true);
                }
            });
            wb.setNegativeButton("Wait for Wi-Fi", null);
            wb.show();
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
                int streaming = 0;
                for (int i = 0; i < boxes.size(); i++) {
                    if (!boxes.get(i).isChecked()) continue;
                    Ep85 e = items.get(i);
                    // STREAMING-ONLY GATE: episodes whose file is not on our
                    // own upload hosts cannot be downloaded.
                    if (!isOwnMediaHost(e.url)) { streaming++; continue; }
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
                if (picked == 0) {
                    // everything the user picked turned out to be stream-only
                    if (streaming > 0) showStreamOnlyNamed(seriesTitle, "episode");
                    return;
                }
                Toast.makeText(act.getApplicationContext(),
                        "Downloading " + String.valueOf(picked) + " episode" + (picked == 1 ? "" : "s")
                                + (streaming > 0 ? (" -- " + String.valueOf(streaming) + " streaming-only (skipped)") : "")
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
        log85("download", "start " + (title == null ? "" : title)
                + " q=" + (quality == null || quality.length() == 0 ? "auto" : quality)
                + " sub=" + (subUrl == null || subUrl.length() == 0 ? "none" : "yes"));
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
            // The site's real per-episode convention is
            // "<Series>/<Series> ep<N> Engsub.srt". When the title does NOT
            // already carry the episode number (bulk series downloads pass the
            // series name plus the episode), every guess above misses and a
            // subtitle that exists on the site is never found -- exactly what
            // an offline download used to hit.
            all.add(series + "/" + series + " ep" + ep + " Engsub.srt");
            all.add(series + "/" + series + " ep" + ep + " PHsub.srt");
            all.add(series + "/ep" + ep + ".srt");
            all.add(series + "/Episode " + ep + ".srt");
            all.add(series + "/S01E" + (ep < 10 ? "0" : "") + ep + ".srt");
            all.add(series + " ep" + ep + " Engsub.srt");
            all.add(series + " ep" + ep + " PHsub.srt");
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
